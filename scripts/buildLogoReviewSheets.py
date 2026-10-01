from PIL import Image,ImageOps,ImageDraw,ImageFont
import subprocess,io,textwrap,os
items=[(2,'Ards Blair Mayne Pickleball Club','7dff314088217ccb1d1e8c6aaeeff49247e5d334'),(4,'Balbriggan Pickleball','4cb1e06bbfed0a5636bc367857e99e56d95cc0f5'),(15,'Duhallow Pickleball','70b67717ef0c0175b2eac1961e18bfe526fc86c8'),(18,'ezPICKLEBALL','c66abb1992c3e21204b8ee04f446fabae5ca03b9'),(21,'Lisburn Pickleball Club','3c698bac8b5c1b9f908455311e0ef026347e630b'),(25,'Multyfarnham Pickleball Club','2111a4c4bea628d48dce9cdb0ddd5a834e063289'),(31,'Portarlington Pickleball','daf61f4f6dd558bfcda007a8f90e3ad0a24dee2c'),(34,'Sandyford Pickleball Club','37c5f4432a6a407d3e53e62265609994e5701dbe'),(36,'Southside Pickleball Club','c5b640c68b115fa26db8e94eab6797b4c0b3c792'),(38,'Terenure Pickleball Club','d7a825aa9ebaed8b84105bfcac56fe9d5cbdd228'),(39,'Wallace Park Pickleball Club','d515885cfdb79f05eb8a0bfc14f2edf7bfbfcca8')]
holds=[(6,'Better Pickleball Club','e11469778a9f796c4d3bf0127f22f8350311943c'),(10,'Castlerahan Pickleball Club','dc4856c48a2f9ca3bc8787c0597569766e0590c6'),(23,'Moate Pickleball Club','65c5c1fdb62ce70f0f7bde65c95ac2c741d4edfd'),(35,'Sligo Tennis Pickleball Club','37853888add8aa87797ce0ca0c75726b12d0f189'),(37,'Sports Lab Pickleball','c284b94b81b5bacfe38f8981556ef6f3687c8e9a')]
fb='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; fr='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def make(arr,out,title,hold=False):
    cols=3; W=210; H=220; gap=10; m=15; head=75; rows=(len(arr)+cols-1)//cols
    C=Image.new('RGB',(m*2+cols*W+(cols-1)*gap,head+m+rows*H+(rows-1)*gap+m),'#F5F7FB'); d=ImageDraw.Draw(C)
    d.text((m,12),title,fill='#0C2257',font=ImageFont.truetype(fb,24)); d.text((m,44),'Reply only with exception numbers.',fill='#52627D',font=ImageFont.truetype(fr,14))
    for i,(n,name,blob) in enumerate(arr):
        r,c=divmod(i,cols); x=m+c*(W+gap); y=head+m+r*(H+gap); border='#F2D487' if hold else '#B9E6C7'
        d.rounded_rectangle((x,y,x+W,y+H),12,fill='white',outline=border,width=3)
        raw=subprocess.check_output(['git','cat-file','blob',blob]); im=Image.open(io.BytesIO(raw)).convert('RGBA'); fit=ImageOps.contain(im,(170,125),Image.Resampling.LANCZOS)
        thumb=Image.new('RGBA',(180,130),(255,255,255,255)); thumb.alpha_composite(fit,((180-fit.width)//2,(130-fit.height)//2)); C.paste(thumb.convert('RGB'),(x+15,y+12))
        d.ellipse((x+8,y+7,x+42,y+41),fill='#0C2257'); nf=ImageFont.truetype(fb,13); label=f'#{n}'; bb=d.textbbox((0,0),label,font=nf); d.text((x+25-(bb[2]-bb[0])/2,y+24-(bb[3]-bb[1])/2-2),label,fill='white',font=nf)
        nf2=ImageFont.truetype(fb,14); yy=y+151
        for line in textwrap.wrap(name,24)[:2]: d.text((x+12,yy),line,fill='#0C2257',font=nf2); yy+=18
        lab='HOLD' if hold else 'APPROVE'; col='#92400E' if hold else '#166534'; bg='#FEF3C7' if hold else '#DCFCE7'; bf=ImageFont.truetype(fb,11); bb=d.textbbox((0,0),lab,font=bf); bw=bb[2]-bb[0]+18; d.rounded_rectangle((x+12,y+H-30,x+12+bw,y+H-10),10,fill=bg); d.text((x+21,y+H-27),lab,fill=col,font=bf)
    C.save(out,'JPEG',quality=38,optimize=True); print(out,C.size,os.path.getsize(out))
make(items,'/tmp/RallyHub_Logos_APPROVE_Review.jpg','RallyHub Logos - Default APPROVE')
make(holds,'/tmp/RallyHub_Logos_HOLD_Review.jpg','RallyHub Logos - HOLD',True)
