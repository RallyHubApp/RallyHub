from pathlib import Path
import subprocess, re

commit="5f9cfd3d"
path="base44/functions/kotcResultsShare/entry.ts"

hist=subprocess.check_output(["git","show",f"{commit}:{path}"], text=True)
cur=Path(path).read_text()

pat=r"const clickableFooter=`[\s\S]*?`;\s*const htmlBody="
hm=re.search(pat,hist)
cm=re.search(pat,cur)
if not hm or not cm:
    raise SystemExit("Could not locate clickableFooter block")

hist_block=hm.group(0)
hist_footer=hist_block[:-len("const htmlBody=")].rstrip()

replacement=hist_footer+"const htmlBody="
new=cur[:cm.start()]+replacement+cur[cm.end():]
Path(path).write_text(new)

print("Historical footer bytes:", len(hist_footer))
print("Restored exact clickableFooter from", commit)