from PIL import Image, ImageOps, ImageDraw, ImageFont
from pathlib import Path
import subprocess, io, textwrap
items=[
(2,'Ards Blair Mayne Pickleball Club','APPROVE','7dff314088217ccb1d1e8c6aaeeff49247e5d334'),
(4,'Balbriggan Pickleball','APPROVE','4cb1e06bbfed0a5636bc367857e99e56d95cc0f5'),
(15,'Duhallow Pickleball','APPROVE','70b67717ef0c0175b2eac1961e18bfe526fc86c8'),
(18,'ezPICKLEBALL','APPROVE','c66abb1992c3e21204b8ee04f446fabae5ca03b9'),
(21,'Lisburn Pickleball Club','APPROVE','3c698bac8b5c1b9f908455311e0ef026347e630b'),
(25,'Multyfarnham Pickleball Club','APPROVE','2111a4c4bea628d48dce9cdb0ddd5a834e063289'),
(31,'Portarlington Pickleball','APPROVE','daf61f4f6dd558bfcda007a8f90e3ad0a24dee2c'),
(34,'Sandyford Pickleball Club','APPROVE','37c5f4432a6a407d3e53e62265609994e5701dbe'),
(36,'Southside Pickleball Club','APPROVE','c5b640c68b115fa26db8e94eab6797b4c0b3c792'),
(38,'Terenure Pickleball Club','APPROVE','d7a825aa9ebaed8b84105bfcac56fe9d5cbdd228'),
(39,'Wallace Park Pickleball Club','APPROVE','d515885cfdb79f05eb8a0bfc14f2edf7bfbfcca8'),
(6,'Better Pickleball Club','HOLD','e11469778a9f796c4d3bf0127f22f8350311943c'),
(10,'Castlerahan Pickleball Club','HOLD','dc4856c48a2f9ca3bc8787c0597569766e0590c6'),
(23,'Moate Pickleball Club','HOLD','65c5c1fdb62ce70f0f7bde65c95ac2c741d4edfd'),
(35,'Sligo Tennis Pickleball Club','HOLD','37853888add8aa87797ce0ca0c75726b12d0f189'),
(37,'Sports Lab Pickleball','HOLD','c284b94b81b5bacfe38f8981556ef6f3687c8e9a'),
]
W,H=320,290; cols=4; margin=24; gap=18; header=145
rows=(len(items)+cols-1)//cols
canvas=Image.new('RGB',(margin*2+cols*W+(cols-1)*gap,header+margin+rows*H+(rows-1)*gap+margin),'#F5F7FB')
d=ImageDraw.Draw(canvas)
fb='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; fr='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
title=ImageFont.truetype(fb,34); sub=ImageFont.truetype(fr,18); namef=ImageFont.truetype(fb,18); badgef=ImageFont.truetype(fb,14); numf=ImageFont.truetype(fb,14)
d.text((margin,20),'RallyHub Logo Visual Review',fill='#0C2257',font=title)
d.text((margin,68),'Green = default APPROVE. Yellow = HOLD.',fill='#52627D',font=sub)
d.text((margin,98),'Reply only with exception numbers, e.g. Reject 4 and 31. Promote 35.',fill='#0C2257',font=ImageFont.truetype(fb,16))
for idx,(num,name,decision,blob) in enumerate(items):
    r,c=divmod(idx,cols); x=margin+c*(W+gap); y=header+r*(H+gap)
    border='#B9E6C7' if decision=='APPROVE' else '#F2D487'
    d.rounded_rectangle((x,y,x+W,y+H),radius=18,fill='#FFFFFF',outline=border,width=3)
    raw=subprocess.check_output(['git','cat-file','blob',blob])
    im=Image.open(io.BytesIO(raw)).convert('RGBA')
    thumb=Image.new('RGBA',(W-36,170),(255,255,255,255))
    fit=ImageOps.contain(im,(W-58,148),Image.Resampling.LANCZOS)
    thumb.alpha_composite(fit,((thumb.width-fit.width)//2,(thumb.height-fit.height)//2))
    canvas.paste(thumb.convert('RGB'),(x+18,y+18))
    d.ellipse((x+10,y+8,x+50,y+48),fill='#0C2257')
    label=f'#{num}'; bb=d.textbbox((0,0),label,font=numf)
    d.text((x+30-(bb[2]-bb[0])/2,y+28-(bb[3]-bb[1])/2-2),label,fill='white',font=numf)
    ny=y+195
    for line in textwrap.wrap(name,width=28)[:2]:
        d.text((x+18,ny),line,fill='#0C2257',font=namef); ny+=23
    badge_fill='#DCFCE7' if decision=='APPROVE' else '#FEF3C7'; badge_text='#166534' if decision=='APPROVE' else '#92400E'
    bb=d.textbbox((0,0),decision,font=badgef); bw=bb[2]-bb[0]+22
    d.rounded_rectangle((x+18,y+H-42,x+18+bw,y+H-14),radius=14,fill=badge_fill)
    d.text((x+29,y+H-37),decision,fill=badge_text,font=badgef)
out='/tmp/RallyHub_Logo_Contact_Sheet_2026-10-01.jpg'
canvas.save(out,'JPEG',quality=88,optimize=True)
print(out,Path(out).stat().st_size,canvas.size)
