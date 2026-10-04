import React from 'react';
import { createRoot } from 'react-dom/client';
import InterclubPrintPack from '../src/components/clubchallenge/InterclubPrintPack.jsx';
const event={status:'draw_approved',club_a_name:'Clare Pickleball',club_b_name:'Galway Pickleball',courts:4,planned_rounds:12,include_break:true,break_after_round:6,break_minutes:20,normal_match_type:'timed',play_minutes:10,timed_draws_allowed:false,win_points:2,draw_points:0};
const tournament={location:"St. Joseph's Doora Barefield",start_date:'2026-10-04'};
createRoot(document.getElementById('root')).render(<InterclubPrintPack event={event} tournament={tournament} matches={[]} participants={[]} score={{}} overallScore={{clubA:0,clubB:0}} sections={{score:false,handoverScore:false,schedule:false,roster:false,briefing:true,final:false}} displayUrl="https://rallyhub.ie/club-challenge/display/ccd_c3a68839ddfc4abf8ae4ee4c1d413d2a" wifiSsid="eir67846768" wifiPassword="b2VxcXdVHR"/>);
