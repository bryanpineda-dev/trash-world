import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { placements, cemeteryPlacements, cemeteryFence, studyCamera, studyPosition, candleState, wicks, roseGlass, shadeStudyPixels } from '../studies/architecture/model.js';

const root=new URL('../studies/architecture/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root)));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('architecture study shares the integrated originals and native exports without duplicate PNGs',()=>{
  assert.equal(manifest.status,'integrated-shared-library');
  assert.deepEqual(manifest.sprites.map(s=>s.id),['church','oratory','tomb']);
  for(const item of manifest.sprites) {
    const native=readFileSync(new URL(item.file,root)),source=readFileSync(new URL(item.source,root));
    assert.equal(sha(native),item.sha256);assert.equal(sha(source),item.sourceSha256);
    assert.deepEqual([native.readUInt32BE(16),native.readUInt32BE(20)],item.size);
    assert.deepEqual([source.readUInt32BE(16),source.readUInt32BE(20)],item.sourceSize);
    const [, ,width,height]=item.sourceRect;
    const roundedWidth=Math.abs(item.size[0]-width/height*item.size[1]);
    const roundedHeight=Math.abs(item.size[1]-height/width*item.size[0]);
    assert.ok(Math.min(roundedWidth,roundedHeight)<=.5,item.id+' distorted beyond native-pixel rounding');
    assert.deepEqual(item.anchor,[Math.floor(item.size[0]/2),item.size[1]]);
  }
  assert.ok(!existsSync(new URL('assets/',root)));
  for(const item of manifest.sprites) {
    assert.match(item.file,/^\.\.\/\.\.\/assets\/reference-biome\/native\//);
    assert.match(item.source,/^\.\.\/\.\.\/assets\/reference-biome\/source\//);
  }
});

test('the camera changes the crop, never individual candidate sizes, and keeps the church cross in frame',()=>{
  const church=manifest.sprites[0];
  for(const width of [320,640])for(const pan of [-110,0,110]) {
    const camera=studyCamera(width,'church',pan),point=studyPosition(camera,placements[0]);
    assert.equal(camera.height,400);assert.equal(camera.ground,316);
    assert.equal(point.y,278);assert.equal(point.y-church.anchor[1],22);
    assert.ok(point.x-church.anchor[0]>=0);assert.ok(point.x+church.size[0]-church.anchor[0]<=width);
    assert.ok(!Object.hasOwn(point,'scale'));
  }
  assert.equal(studyPosition(studyCamera(640,'all',10),placements[0]).x-studyPosition(studyCamera(640),placements[0]).x,-5);
  assert.equal(studyPosition(studyCamera(640,'all',10),placements[1]).x-studyPosition(studyCamera(640),placements[1]).x,-10);
});

test('nine cemetery markers are separate consumed PNGs with exact sheet crops and no unused exports',()=>{
  assert.equal(manifest.graveyard.length,9);
  assert.deepEqual(manifest.graveyard.map(a=>a.id).sort(),cemeteryPlacements.map(p=>p.id).sort());
  assert.equal(new Set(manifest.graveyard.map(a=>a.sha256)).size,9);
  assert.equal(new Set(manifest.graveyard.map(a=>a.source)).size,2);
  assert.ok(!existsSync(new URL('assets/native/cemetery/',root)));
  for(const item of manifest.graveyard) {
    const native=readFileSync(new URL(item.file,root)),source=readFileSync(new URL(item.source,root));
    assert.equal(sha(native),item.sha256);assert.equal(sha(source),item.sourceSha256);
    assert.deepEqual([native.readUInt32BE(16),native.readUInt32BE(20)],item.size);
    const [x,y,width,height]=item.sourceRect;
    assert.ok(x>=0&&y>=0&&x+width<=item.sourceSize[0]&&y+height<=item.sourceSize[1]);
    assert.ok(item.size[1]<=56);
  }
});

test('church, grave rows and near plane have ordered depth without enlarging or mirroring assets',()=>{
  const church=placements[0];assert.equal(church.parallax,.48);assert.deepEqual(manifest.sprites[0].size,[173,256]);
  assert.ok(cemeteryFence.parallax>church.parallax&&cemeteryFence.parallax<.66);
  for(const marker of cemeteryPlacements) {
    assert.ok(marker.parallax>church.parallax&&marker.parallax<1);
    assert.ok(marker.offset>church.offset&&marker.offset<0);
    assert.equal(marker.parallax,marker.id.startsWith('crosses-back')?.66:.84);
    assert.ok(!Object.hasOwn(marker,'scale'));assert.ok(!Object.hasOwn(marker,'flipped'));
  }
  assert.deepEqual(manifest.sprites[2].size,[120,49]);
  assert.notEqual(manifest.sprites[2].sha256,'a9df3b47eea01ef53bd3a031aecac5ea082075a9243bc274bd45a1dd484e9b53');
});

test('the rose window mask excludes door timber, pale stone and the surrounding facade',()=>{
  assert.ok(roseGlass(57,118,239,181,71));
  assert.ok(!roseGlass(57,175,239,181,71));
  assert.ok(!roseGlass(72,118,239,181,71));
  assert.ok(!roseGlass(57,118,189,187,175));
  const item=manifest.sprites[0],pixels=new Uint8ClampedArray(item.size[0]*item.size[1]*4);
  const x=Math.round(57/140*item.size[0]),y=Math.round(118/208*item.size[1]),index=(y*item.size[0]+x)*4;
  assert.ok(roseGlass(x,y,239,181,71,...item.size));
  pixels.set([239,181,71,255],index);
  const day=shadeStudyPixels(pixels,item,'DAY'),night=shadeStudyPixels(pixels,item,'NIGHT');
  assert.ok(day[index]<day[index+2]);assert.ok(night[index]>night[index+2]*2);
  assert.deepEqual([...night.subarray(index,index+4)],[239,181,71,255]);
  assert.deepEqual([...pixels.subarray(index,index+4)],[239,181,71,255]);
});

test('the enlarged church uses the same proportional glass mask without lighting the facade',()=>{
  for(const [width,height]of [[140,208],[173,256]]) {
    assert.ok(roseGlass(57/140*width,118/208*height,239,181,71,width,height));
    assert.ok(!roseGlass(57/140*width,175/208*height,239,181,71,width,height));
    assert.ok(!roseGlass(72/140*width,118/208*height,239,181,71,width,height));
  }
  const source=readFileSync(new URL('render.js',root),'utf8');
  assert.doesNotMatch(source,/mask\.width=140|mask\.height=208/);
});

test('three candle flames remain independent, bounded and continuously lit',()=>{
  const states=[];
  for(let frame=0;frame<60*20;frame++)for(let index=0;index<3;index++) {
    const t=frame/60,current=candleState(t,index),next=candleState(t+1/60,index);
    assert.ok(current.alpha>=.765&&current.alpha<=.955);
    assert.ok(current.spill>=.042&&current.spill<=.078);
    assert.ok(Math.abs(current.alpha-next.alpha)<.003);
    assert.ok([-1,0,1].includes(current.lean));
    if(frame===60)states.push(current.alpha);
  }
  assert.equal(new Set(states).size,3);
  for(const wick of wicks) {
    assert.ok(wick.x>=1&&wick.x<116-1);assert.ok(wick.y>=4&&wick.y<144);
  }
  assert.deepEqual(candleState(Number.NaN,0),candleState(0,0));
});

test('the study has no dependency on gameplay persistence or production scene replacement',()=>{
  for(const file of ['app.js','render.js','model.js']) {
    const source=readFileSync(new URL(file,root),'utf8');
    assert.doesNotMatch(source,/localStorage|indexedDB|SaveManager|SaveSchema|CreatureAI/);
  }
  const vite=readFileSync(new URL('../vite.config.js',new URL('../',root)),'utf8');
  assert.doesNotMatch(vite,/studies\/architecture/);
});
