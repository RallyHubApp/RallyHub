import test from 'node:test';
import assert from 'node:assert/strict';
import {directoryImagePlacement} from '../../src/lib/directory-image-placement.js';
test('coaching photograph saved crop matches the visible preview at all zooms and offsets',()=>{
 for(const wh of [[500,1000],[1000,500],[600,600]])for(const zoom of [0.7,1,1.4,2])for(const x of [-85,0,67])for(const y of [-40,0,75]){
  const options={width:wh[0],height:wh[1],zoom,offsetX:x,offsetY:y,coach:true};
  const small=directoryImagePlacement({...options,dimension:192});const big=directoryImagePlacement({...options,dimension:800});
  for(const key of ['drawWidth','drawHeight','drawX','drawY'])assert.ok(Math.abs(small[key]/192-big[key]/800)<1e-10,`${key} diverges`);
 }
});
