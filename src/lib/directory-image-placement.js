/** One composition for on-screen preview and saved WebP. All offsets scale with the output square. */
export function directoryImagePlacement({width,height,zoom=1,offsetX=0,offsetY=0,dimension=800,coach=false}) {
 const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
 const d=Math.max(1,Number(dimension)||800);
 const baseScale=coach?Math.max(d/w,d/h):Math.min((d*0.88)/w,(d*0.88)/h);
 const scale=baseScale*(Number(zoom)||1);
 const drawWidth=w*scale,drawHeight=h*scale;
 return {drawWidth,drawHeight,drawX:(d-drawWidth)/2+(Number(offsetX)||0)*d/200,drawY:(d-drawHeight)/2+(Number(offsetY)||0)*d/200};
}
