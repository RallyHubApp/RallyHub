const fs=require('fs');
const { chromium }=require('playwright');
(async()=>{
 const raw=fs.readFileSync('src/assets/rallyhub-logo-approved.b64','utf8').trim();
 const data='data:image/webp;base64,'+raw;
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 await page.setContent('<html><body></body></html>');
 const png=await page.evaluate(async (src)=>{
   const img=new Image(); img.src=src; await img.decode();
   const scale=3, c=document.createElement('canvas'); c.width=img.width*scale; c.height=img.height*scale;
   const ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
   ctx.drawImage(img,0,0,c.width,c.height);
   const d=ctx.getImageData(0,0,c.width,c.height);
   for(let i=0;i<d.data.length;i+=4){
     const r=d.data[i],g=d.data[i+1],b=d.data[i+2],a=d.data[i+3];
     if(a<5) continue;
     const green=(g>r*1.15 && g>b*1.05 && g>70);
     if(!green && (r+g+b)<620){ d.data[i]=255; d.data[i+1]=255; d.data[i+2]=255; }
   }
   ctx.putImageData(d,0,0);
   return c.toDataURL('image/png');
 },data);
 await browser.close();
 fs.writeFileSync('public/email-templates/clare-pickleball-enriched/assets/rallyhub-logo-footer-transparent.png',Buffer.from(png.split(',')[1],'base64'));
 console.log('wrote',fs.statSync('public/email-templates/clare-pickleball-enriched/assets/rallyhub-logo-footer-transparent.png').size);
})();