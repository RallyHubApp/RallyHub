from pathlib import Path
import json, re
paths=sorted(Path("docs").rglob("*.md"))
def meta(p):
    n=p.name; title=n.rsplit(".",1)[0].replace("_"," ").replace("-"," ").strip(); cat="Reference"
    if "SOFTWARE_CONTROL_MASTER" in n: cat="Control Master"
    elif "TESTING_BLUEPRINT" in n or "TEST_PLAN" in n or "TEST_REPORT" in n or "TEST_LOG" in n: cat="Testing & QA"
    elif "ARCHITECTURE" in n: cat="Architecture"
    elif "BLUEPRINT" in n: cat="Module Blueprint"
    elif "CLEANUP" in n: cat="Technical Debt"
    elif "AUDIT" in n or "PROTOCOL" in n: cat="Audit & Governance"
    elif "strategy" in n.lower(): cat="Strategy"
    elif p.parent.name=="email": cat="Integration / Communications"
    return title,cat
docs=[]
for p in paths:
    content=p.read_text(encoding="utf-8"); title,cat=meta(p); version=""
    m=re.search(r"(?im)^\\s*(?:\\*\\*)?Version(?:\\*\\*)?\\s*[:—-]\\s*([^\\n]+)",content)
    if m: version=m.group(1).strip().strip("*")
    docs.append({"id":str(p).replace("/","__"),"path":str(p),"title":title,"category":cat,"version":version,"content":content})
Path("base44/functions/controlLibrary").mkdir(parents=True,exist_ok=True)
payload=json.dumps(docs,ensure_ascii=False)
code='import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";\n\nconst DOCUMENTS = '+payload+';\n\nDeno.serve(async (req) => {\n  try {\n    const base44 = createClientFromRequest(req);\n    const user = await base44.auth.me();\n    if (!user || !(user.role === "admin" || user.kotc_role === "super_admin")) return Response.json({ error: "Forbidden: RallyHub Super Admin access required" }, { status: 403 });\n    const body = await req.json().catch(() => ({}));\n    if (body.action === "list") return Response.json({ documents: DOCUMENTS.map(({content, ...d}) => ({...d, size: content.length})), count: DOCUMENTS.length });\n    if (body.action === "get") { const doc = DOCUMENTS.find(d => d.id === body.id); if (!doc) return Response.json({ error: "Document not found" }, { status: 404 }); return Response.json({ document: doc }); }\n    return Response.json({ error: "Unsupported action" }, { status: 400 });\n  } catch (error) { return Response.json({ error: error?.message || "Control library unavailable" }, { status: 500 }); }\n});\n'
Path("base44/functions/controlLibrary/entry.ts").write_text(code,encoding="utf-8")
print(f"Generated secure control library with {len(docs)} markdown documents")
