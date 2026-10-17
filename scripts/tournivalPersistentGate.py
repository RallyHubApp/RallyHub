#!/usr/bin/env python3
"""Independent persistent transaction reference gate; NEVER touches Base44 records/providers."""
import concurrent.futures
import os
import sqlite3
import tempfile
import threading
from pathlib import Path

def open_db(path):
    c=sqlite3.connect(path,timeout=20,isolation_level=None)
    c.execute("PRAGMA busy_timeout=20000")
    c.execute("PRAGMA journal_mode=WAL")
    return c

def setup(path):
    c=open_db(path)
    c.executescript("""
    CREATE TABLE tournament(id TEXT PRIMARY KEY, tenant TEXT NOT NULL, capacity INTEGER NOT NULL);
    CREATE TABLE session(id TEXT PRIMARY KEY, tournament TEXT NOT NULL, revision INTEGER NOT NULL, state TEXT NOT NULL);
    CREATE TABLE match(id TEXT PRIMARY KEY, session TEXT NOT NULL, revision INTEGER NOT NULL, status TEXT NOT NULL, score_a INTEGER,score_b INTEGER);
    CREATE TABLE payment(id TEXT PRIMARY KEY, tournament TEXT NOT NULL, amount_cents INTEGER NOT NULL,currency TEXT NOT NULL, status TEXT NOT NULL);
    CREATE TABLE registration(id TEXT PRIMARY KEY, tournament TEXT NOT NULL, payment TEXT UNIQUE, status TEXT NOT NULL);
    CREATE TABLE operation(id TEXT PRIMARY KEY, kind TEXT NOT NULL);
    """)
    c.execute("INSERT INTO tournament VALUES('event-1','isolated-test-tenant',16)")
    c.execute("INSERT INTO session VALUES('session-1','event-1',0,'ready')")
    c.execute("INSERT INTO match VALUES('match-1','session-1',0,'playing',NULL,NULL)")
    c.execute("INSERT INTO payment VALUES('pay-1','event-1',1050,'EUR','pending')")
    c.execute("INSERT INTO registration VALUES('reg-1','event-1','pay-1','pending_payment')")
    c.close()

def score(path,operation_id,revision,score_a,score_b):
    c=open_db(path)
    try:
        c.execute("BEGIN IMMEDIATE")
        if c.execute("SELECT 1 FROM operation WHERE id=?",(operation_id,)).fetchone():
            c.execute("COMMIT")
            return "duplicate"
        row=c.execute("SELECT revision,status FROM match WHERE id='match-1'").fetchone()
        if row != (revision,"playing"):
            c.execute("ROLLBACK")
            return "conflict"
        if score_a==score_b or score_a<0 or score_b<0:
            c.execute("ROLLBACK")
            return "invalid"
        c.execute("UPDATE match SET revision=revision+1,status='completed',score_a=?,score_b=? WHERE id='match-1' AND revision=?",(score_a,score_b,revision))
        assert c.total_changes>0
        c.execute("INSERT INTO operation VALUES(?,'score')",(operation_id,))
        c.execute("UPDATE session SET revision=revision+1 WHERE id='session-1'")
        c.execute("COMMIT")
        return "accepted"
    finally:
        c.close()

def callback(path,operation_id,verified_status,amount_cents,currency):
    c=open_db(path)
    try:
        c.execute("BEGIN IMMEDIATE")
        if c.execute("SELECT 1 FROM operation WHERE id=?",(operation_id,)).fetchone():
            c.execute("COMMIT")
            return "duplicate"
        amount,curr,status=c.execute("SELECT amount_cents,currency,status FROM payment WHERE id='pay-1'").fetchone()
        if amount!=amount_cents or curr!=currency:
            c.execute("ROLLBACK")
            return "rejected_mismatch"
        if verified_status=="PAID":
            c.execute("UPDATE payment SET status='paid' WHERE id='pay-1'")
            c.execute("UPDATE registration SET status='confirmed' WHERE payment='pay-1'")
            result="confirmed"
        elif verified_status in ("FAILED","EXPIRED"):
            if status=="paid":
                c.execute("COMMIT")
                return "late_failure_ignored"
            c.execute("UPDATE payment SET status='failed' WHERE id='pay-1'")
            result="failed"
        else:
            c.execute("ROLLBACK")
            return "ignored"
        c.execute("INSERT INTO operation VALUES(?,'webhook')",(operation_id,))
        c.execute("COMMIT")
        return result
    finally:
        c.close()

def main():
    with tempfile.TemporaryDirectory(prefix="rallyhub-tournival-sqlite-") as directory:
        path=str(Path(directory)/"gate.sqlite")
        setup(path)
        with concurrent.futures.ThreadPoolExecutor(max_workers=24) as pool:
            outputs=list(pool.map(lambda i:score(path,"host-"+str(i),0,11,i%10),range(80)))
        assert outputs.count("accepted")==1,(outputs.count("accepted"),outputs.count("conflict"))
        assert outputs.count("conflict")==79
        assert score(path,"host-"+str(outputs.index("accepted")),0,11,5)=="duplicate"
        c=open_db(path)
        assert c.execute("SELECT revision,status FROM match").fetchone()==(1,"completed")
        assert c.execute("SELECT revision FROM session").fetchone()==(1,)
        c.close()
        assert callback(path,"bad-amount","PAID",500,"EUR")=="rejected_mismatch"
        assert callback(path,"bad-currency","PAID",1050,"USD")=="rejected_mismatch"
        with concurrent.futures.ThreadPoolExecutor(max_workers=24) as pool:
            outputs=list(pool.map(lambda i:callback(path,"webhook-"+str(i),"PAID",1050,"EUR"),range(80)))
        assert outputs.count("confirmed")==80
        assert callback(path,"webhook-0","PAID",1050,"EUR")=="duplicate"
        assert callback(path,"late-failure","FAILED",1050,"EUR")=="late_failure_ignored"
        c=open_db(path)
        assert c.execute("SELECT status FROM payment").fetchone()==("paid",)
        assert c.execute("SELECT status FROM registration").fetchone()==("confirmed",)
        assert c.execute("SELECT COUNT(*) FROM registration").fetchone()[0]==1
        assert c.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        c.close()
        print("PERSISTENT SQLITE GATE PASS: 80 simultaneous host writes (1 accepted, 79 rejected),")
        print("80 competing verified payment callbacks, duplicate replay, amount/currency mismatch,")
        print("late failed callback, committed session/match versions and SQLite integrity.")
        print("NOTE: independent transaction reference only; NOT Base44 backend or SumUp.")
if __name__=="__main__":
    main()
