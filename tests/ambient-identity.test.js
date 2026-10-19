import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ambientLife, drawAmbientLife } from '../src/rendering/AmbientLife.js';
import { referencePlacements, drawReferenceScene } from '../src/rendering/ReferenceScene.js';
import { lateralPlacements, panoramaPlacements } from '../src/rendering/ReferenceLayout.js';
import { Camera } from '../src/rendering/Camera.js';

const manifest=JSON.parse(readFileSync(new URL('../assets/reference-biome/manifest.json',import.meta.url)));
const camera=(x=280,width=560)=>{const c=new Camera(x);c.resize(width,315);return c;};
const main=referencePlacements.filter(p=>manifest.sprites.find(s=>s.id===p.id).family!=='vegetation');
const particles=sample=>Object.values(sample).flat();

test('every landmark, grave and framing tree is placed exactly once in the entire world',()=>{
  assert.equal(new Set(main.map(p=>p.id)).size,main.length);
  assert.equal(referencePlacements.filter(p=>p.id==='chapel').length,1);
  assert.equal(referencePlacements.filter(p=>p.id==='mausoleum').length,1);
});

test('lateral wings do not copy any central landmark or each other',()=>{
  const center=new Set(main.filter(p=>p.x>=0&&p.x<=560).map(p=>p.id));
  const west=main.filter(p=>p.x<0).map(p=>p.id),east=main.filter(p=>p.x>560).map(p=>p.id);
  for(const id of [...west,...east])assert.ok(!center.has(id),id);
  for(const id of west)assert.ok(!east.includes(id),id);
});

test('the west uses a citadel and bare oak while the east uses a tower and silver ash',()=>{
  for(const id of ['distantCitadel','bareOak','roseGrave','graniteObelisk'])assert.ok(lateralPlacements.some(p=>p.id===id&&p.x<0));
  for(const id of ['watchtower','silverAsh','urnMemorial','flowerLedger'])assert.ok(lateralPlacements.some(p=>p.id===id&&p.x>560));
});

test('flower and fungus groundcover each have one placement instead of cloned patches',()=>{
  for(const id of ['westWildflowers','eastFungi']) {
    const list=referencePlacements.filter(p=>p.id===id);
    assert.equal(list.length,1);assert.equal(list[0].depth,'groundcover');
  }
});

test('new woodland layers preserve source proportions and the far belt covers walking views without tiling',()=>{
  assert.equal(panoramaPlacements.length,2);
  assert.equal(new Set(panoramaPlacements.map(p=>p.id)).size,2);
  for(const p of panoramaPlacements) {
    const item=manifest.sprites.find(s=>s.id===p.id);
    assert.ok(Math.abs(item.size[0]/item.size[1]-item.sourceRect.width/item.sourceRect.height)<.02);
  }
  const far=manifest.sprites.find(s=>s.id==='uniqueForestFar');
  for(const x of [-528,-280,280,840,1088]) {
    const view=camera(x),center=view.width/2+(280-view.pixelX)*.12;
    assert.ok(center-far.size[0]/2<=0&&center+far.size[0]/2>=view.width);
  }
});

test('reference generation records twelve different assets and preserves source/native separation',()=>{
  const prompts=JSON.parse(readFileSync(new URL('../assets/reference-biome/IDENTITY_PROMPTS.json',import.meta.url)));
  assert.equal(prompts.length,12);assert.equal(new Set(prompts.map(p=>p.id)).size,12);
  for(const prompt of prompts) {
    const item=manifest.sprites.find(s=>s.id===prompt.id);
    assert.ok(item);assert.notEqual(item.file,item.source);assert.notEqual(item.sha256,item.sourceSha256);
    assert.ok(prompt.prompt.length>100);
  }
});

test('superseded forest exports are retired while their original provenance remains available',()=>{
  for(const id of ['forestFar','forestMiddle']) {
    assert.ok(!manifest.sprites.some(s=>s.id===id));
    assert.ok(manifest.retiredSources.some(s=>s.id===id));
    assert.ok(!panoramaPlacements.some(p=>p.id===id));
  }
});

test('night uses fireflies and occasional bats while daytime retains butterflies and occasional leaves',()=>{
  const view=camera(280,1680);
  const night=ambientLife(view,'NIGHT',3),day=ambientLife(view,'DAY',3);
  assert.ok(night.fireflies.length>0);assert.deepEqual(night.butterflies,[]);assert.deepEqual(night.leaves,[]);
  assert.deepEqual(day.fireflies,[]);assert.equal(day.butterflies.length,2);
  assert.deepEqual(day.bats,[]);assert.ok(night.bats.length<=1);
});

test('particle density and coverage stay bounded through a full minute',()=>{
  for(const phase of ['DAY','EVENING','NIGHT'])for(let time=0;time<=60;time+=.5)for(const x of [-528,-280,280,840,1088]) {
    const view=camera(x),samples=ambientLife(view,phase,time);
    assert.ok(samples.fireflies.length<=8);assert.ok(samples.butterflies.length<=2);assert.ok(samples.leaves.length<=2);assert.ok(samples.bats.length<=1);
    const list=particles(samples);assert.equal(new Set(list.map(p=>p.id)).size,list.length);
    for(const p of list) {
      assert.ok(Number.isInteger(p.x)&&Number.isInteger(p.y));
      assert.ok(p.x>=-3&&p.x<view.width+3&&p.y>=0&&p.y<view.ground-8);
      assert.ok(p.alpha>=0&&p.alpha<=.68);
    }
  }
});

test('firefly motion is local and smooth on the native pixel grid',()=>{
  const view=camera(-280);let before=ambientLife(view,'NIGHT',0).fireflies;
  for(let i=1;i<=600;i++) {
    const after=ambientLife(view,'NIGHT',i/60).fireflies;
    for(const p of after) {
      const previous=before.find(item=>item.id===p.id);if(!previous)continue;
      assert.ok(Math.abs(p.x-previous.x)<=1);assert.ok(Math.abs(p.y-previous.y)<=1);
      assert.ok(Math.abs(p.alpha-previous.alpha)<.02);
    }
    before=after;
  }
});

test('fireflies do not share one synchronized brightness cycle',()=>{
  const sample=ambientLife(camera(-280),'NIGHT',4).fireflies;
  assert.ok(new Set(sample.map(p=>p.alpha.toFixed(3))).size>2);
});

test('dusk fireflies are dimmer than nighttime without changing their trajectories',()=>{
  const view=camera(-280),dusk=ambientLife(view,'EVENING',3).fireflies,night=ambientLife(view,'NIGHT',3).fireflies;
  for(const p of dusk) {
    const peer=night.find(n=>n.id===p.id);assert.ok(peer);
    assert.equal(peer.x,p.x);assert.equal(peer.y,p.y);assert.ok(p.alpha<peer.alpha);
  }
});

test('camera movement projects the same habitats instead of respawning screen-space particles',()=>{
  const view=camera(-280),before=ambientLife(view,'NIGHT',4).fireflies;
  view.x+=10;const after=ambientLife(view,'NIGHT',4).fireflies;
  for(const p of before) {
    const next=after.find(n=>n.id===p.id);if(!next)continue;
    assert.equal(next.worldX,p.worldX);assert.equal(next.worldY,p.worldY);
    assert.ok(Math.abs(p.x-next.x-9.4)<=1);
  }
});

test('ambient samples freeze exactly for a fixed time and resume without hidden state',()=>{
  const view=camera(-280),first=ambientLife(view,'NIGHT',4);
  ambientLife(view,'DAY',99);ambientLife(camera(840),'NIGHT',1000);
  assert.deepEqual(ambientLife(view,'NIGHT',4),first);
  assert.notDeepEqual(ambientLife(view,'NIGHT',5),first);
});

test('butterfly trajectories and wing motion progress independently from fireflies',()=>{
  const view=camera(-280),first=ambientLife(view,'DAY',0).butterflies[0],next=ambientLife(view,'DAY',1).butterflies[0];
  assert.ok(first&&next);assert.equal(first.id,next.id);assert.notEqual(first.wing,next.wing);
  assert.notEqual(first.worldX,next.worldX);assert.deepEqual(ambientLife(view,'NIGHT',1).butterflies,[]);
});

test('falling leaves are intermittent and never land as new objects on the walk plane',()=>{
  const view=camera(280,1680);let present=0,absent=0;
  for(let t=0;t<300;t++) {
    const samples=ambientLife(view,'DAY',t).leaves;
    if(samples.length)present++;else absent++;
    for(const p of samples)assert.ok(p.worldY<=-32);
  }
  assert.ok(present>0&&absent>present);
});

test('invalid ambient time is sanitized and unknown phases do not create particles',()=>{
  const view=camera(-280);
  for(const time of [NaN,Infinity,-5])assert.deepEqual(ambientLife(view,'NIGHT',time),ambientLife(view,'NIGHT',0));
  assert.deepEqual(ambientLife(view,'UNKNOWN',0),{fireflies:[],butterflies:[],leaves:[],bats:[]});
});

test('ambient drawing restores canvas state and uses only tiny native-pixel marks',()=>{
  const stack=[],calls=[],ctx={globalAlpha:.8,fillStyle:'#112233',save(){stack.push([this.globalAlpha,this.fillStyle]);},
    restore(){[this.globalAlpha,this.fillStyle]=stack.pop();},fillRect(x,y,w,h){calls.push({x,y,w,h,alpha:this.globalAlpha});}};
  for(const phase of ['DAY','NIGHT'])drawAmbientLife(ctx,camera(-280),phase,3);
  assert.equal(ctx.globalAlpha,.8);assert.equal(ctx.fillStyle,'#112233');assert.ok(calls.length>0);
  for(const call of calls){assert.ok(call.w<=3&&call.h<=3);assert.ok(call.alpha<=.68);}
});

test('scene draws every protagonist once in a full-world observation view',()=>{
  const calls=[],items=new Map(manifest.sprites.map(s=>[s.id,{...s,surface:{id:s.id}}]));
  const ctx={createLinearGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},translate(){},scale(){},
    drawImage(surface){calls.push(surface.id);}};
  drawReferenceScene(ctx,camera(280,1680),'DAY',0,id=>items.get(id));
  for(const p of [...main,...panoramaPlacements])assert.equal(calls.filter(id=>id===p.id).length,1,p.id);
});

test('lateral flora is not stamped a second time below the terrain',()=>{
  const calls=[],items=new Map(manifest.sprites.map(s=>[s.id,{...s,surface:{id:s.id}}]));
  const ctx={createLinearGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},translate(){},scale(){},
    drawImage(surface){calls.push(surface.id);}};
  drawReferenceScene(ctx,camera(280,1680),'DAY',0,id=>items.get(id));
  for(const id of ['westWildflowers','eastFungi'])assert.equal(calls.filter(item=>item===id).length,1);
});
