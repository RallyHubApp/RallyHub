const fs=require('fs'); const {PNG}=require('pngjs');
const src='public/email-templates/clare-interclub/header-right-clean.png';
const out='public/email-templates/clare-interclub/header-right-fill-v1.png';
const png=PNG.sync.read(fs.readFileSync(src));
// Crop to 301x231, anchored right, preserving native vertical dimension.
const targetW=301,targetH=231,x0=png.width-targetW,y0=0;
const dst=new PNG({width:targetW,height:targetH});
for(let y=0;y<targetH;y++)for(let x=0;x<targetW;x++){
 const si=((y+y0)*png.width+(x+x0))*4, di=(y*targetW+x)*4;
 dst.data[di]=png.data[si]; dst.data[di+1]=png.data[si+1]; dst.data[di+2]=png.data[si+2]; dst.data[di+3]=png.data[si+3];
}
fs.writeFileSync(out,PNG.sync.write(dst));
console.log(out,targetW,targetH,targetW/targetH);