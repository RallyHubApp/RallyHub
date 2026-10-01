from PIL import Image, ImageOps, ImageDraw, ImageFont
from pathlib import Path
import subprocess, io, textwrap, base64
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
(37,'Sports Lab Pickleball','HOLD','c284b94b81b5bacfe38f8981556ef6f3687c8e9a')]
W,H=245,220; cols=4; margin=16; gap=10; header=100
rows=(len(items)+cols-1)//cols
canvas=Image.new('RGB',(margin*2+cols*W+(cols-1)*gap,header+margin+rows*H+(rows-1)*gap+margin),'#F5F7FB')
d=ImageDraw.Draw(canvas)
fb='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; fr='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
title=ImageFont.truetype(fb,26); sub=ImageFont.truetype(fr,14); namef=ImageFont.truetype(fb,14); badgef=ImageFont.truetype(fb,11); numf=ImageFont.truetype(fb,12)
d.text((margin,14),'RallyHub Logo Visual Review',fill='#0C2257',font=title)
d.text((margin,50),'Green = default APPROVE. Yellow = HOLD. Reply only with exception numbers.',fill='#52627D',font=sub)
d.text((margin,72),'Example: Reject 4 and 31. Promote 35.',fill='#0C2257',font=ImageFont.truetype(fb,13))
for idx,(num,name,decision,blob) in enumerate(items):
 r,c=divmod(idx,cols); x=margin+c*(W+gap); y=header+r*(H+gap)
 border='#86D39A' if decision=='APPROVE' else '#E7C35A'
 d.rounded_rectangle((x,y,x+W,y+H),radius=14,fill='#FFFFFF',outline=border,width=3)
 raw=subprocess.check_output(['git','cat-file','blob',blob]); im=Image.open(io.BytesIO(raw)).convert('RGBA')
 box=(W-28,120); fit=ImageOps.contain(im,box,Image.Resampling.LANCZOS)
 ox=x+(W-fit.width)//2; oy=y+12+(120-fit.height)//2
 if fit.mode=='RGBA': canvas.paste(fit.convert('RGB'),(ox,oy),fit.getchannel('A'))
 else: canvas.paste(fit.convert('RGB'),(ox,oy))
 d.ellipse((x+8,y+7,x+38,y+37),fill='#0C2257'); lab=f'#{num}'; bb=d.textbbox((0,0),lab,font=numf); d.text((x+23-(bb[2]-bb[0])/2,y+22-(bb[3]-bb[1])/2-1),lab,fill='white',font=numf)
 lines=textwrap.wrap(name,width=25)[:2]; ny=y+140
 for line in lines: d.text((x+12,ny),line,fill='#0C2257',font=namef); ny+=17
 badge_fill='#DCFCE7' if decision=='APPROVE' else '#FEF3C7'; badge_text='#166534' if decision=='APPROVE' else '#92400E'; bb=d.textbbox((0,0),decision,font=badgef); bw=bb[2]-bb[0]+18
 d.rounded_rectangle((x+12,y+H-30,x+12+bw,y+H-9),radius=10,fill=badge_fill); d.text((x+21,y+H-27),decision,fill=badge_text,font=badgef)
out=Path('/tmp/RallyHub_Logo_Contact_Sheet_2026-10-01.jpg'); canvas.save(out,'JPEG',quality=72,optimize=True,progressive=True)
print('SIZE',out.stat().st_size,'DIMS',canvas.size)
print(base64.b64encode(out.read_bytes()).decode())