from PIL import Image
from pathlib import Path
import base64, io

raw=Path('src/assets/rallyhub-logo-approved.b64').read_text().strip()
im=Image.open(io.BytesIO(base64.b64decode(raw))).convert('RGBA')
im=im.resize((im.width*3, im.height*3), Image.Resampling.LANCZOS)
px=im.load()
for y in range(im.height):
    for x in range(im.width):
        r,g,b,a=px[x,y]
        if a < 4:
            continue
        green = g > r*1.12 and g > b*1.04 and g > 65
        if (not green) and (r+g+b) < 640:
            px[x,y]=(255,255,255,a)
out=Path('public/email-templates/clare-pickleball-enriched/assets/rallyhub-logo-footer-transparent.png')
im.save(out,optimize=True)
print('created',out,im.size,out.stat().st_size)
