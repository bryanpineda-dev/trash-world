import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { referencePlacements, shadeReferencePixels, isChapelGlass, candleGlowAt, drawReferenceScene } from '../src/rendering/ReferenceScene.js';
import { Camera, worldViewSize } from '../src/rendering/Camera.js';
import { WORLD_OBJECTS, RETIRED_OBJECT_IDS, World } from '../src/world/World.js';
import { normalizeSave, newSave } from '../src/persistence/SaveSchema.js';
import { Creature } from '../src/creature/Creature.js';
import { CreatureAI } from '../src/creature/CreatureAI.js';
import { panoramaPlacements, cemeteryPlacements, additionalGraves, fitReferencePlacement } from '../src/rendering/ReferenceLayout.js';

const root=new URL('../assets/reference-biome/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',root)));
const ids=manifest.sprites.map(s=>s.id);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('reference library has forty-four active assets with intact source originals and native dimensions',()=>{
  assert.equal(ids.length,44);assert.equal(new Set(ids).size,44);
  assert.deepEqual(manifest.interactiveObjects,[]);
  for(const item of manifest.sprites) {
    assert.match(item.file,/^native\/[a-z-]+\/[a-z0-9-]+\.png$/);
    assert.match(item.source,/^source\/[a-z-]+\/[a-z-]+\.png$/);
    const native=readFileSync(new URL(item.file,root)),original=readFileSync(new URL(item.source,root));
    assert.equal(sha(native),item.sha256,item.id);assert.equal(sha(original),item.sourceSha256,item.id);
    assert.deepEqual([native.readUInt32BE(16),native.readUInt32BE(20)],item.size);
    assert.ok(item.anchor.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=item.size[i]));
    assert.notEqual(item.sha256,item.sourceSha256);
  }
});

test('the twenty-two grave silhouettes are distinct assets, not recolors of a single drawing',()=>{
  const graves=manifest.sprites.filter(s=>s.family==='gravestones');
  assert.deepEqual(graves.map(s=>s.id),['gabledGrave','roundGrave','ringCross','prayingAngel','recliningAngel','brokenCross','roseGrave','graniteObelisk','flowerLedger','urnMemorial',...cemeteryPlacements.map(p=>p.id),...additionalGraves.map(p=>p.id)]);
  assert.equal(new Set(graves.map(s=>s.sha256)).size,22);
});

test('the walking anchor uses the stone surface instead of the transparent fringe above it',()=>{
  assert.deepEqual(manifest.sprites.find(s=>s.id==='ground').anchor,[0,12]);
});

test('near materials retain their chroma while distant layers receive limited atmospheric grading',()=>{
  const pixel=new Uint8ClampedArray([70,113,58,255,0,0,0,0]);
  const near=shadeReferencePixels(pixel,'oakLeft',1,2,'DAY');
  assert.deepEqual([...near],[91,150,72,255,0,0,0,0]);
  const far=shadeReferencePixels(pixel,'uniqueForestFar',1,2,'DAY','far');
  assert.ok(far[0]>near[0]&&far[2]>near[2]);
  assert.equal(far[3],255);assert.equal(far[7],0);
  assert.deepEqual([...pixel],[70,113,58,255,0,0,0,0]);
});

test('chapel glass alone cools during daytime and keeps warm source detail after dusk',()=>{
  const width=100,height=150,source=new Uint8ClampedArray(width*height*4),n=(85*width+41)*4;
  source.set([230,175,82,255],n);source.set([96,118,116,255],0);
  assert.ok(isChapelGlass(41,85,width,height,230,175,82));
  assert.equal(isChapelGlass(41,125,width,height,230,175,82),false);
  assert.equal(isChapelGlass(90,100,width,height,230,175,82),false);
  const day=shadeReferencePixels(source,'chapel',width,height,'DAY','architecture');
  assert.ok(day[n]<day[n+2]);assert.equal(day[n+3],255);
  for(const phase of ['NIGHT']) {
    const night=shadeReferencePixels(source,'chapel',width,height,phase,'architecture');
    assert.deepEqual([...night.slice(n,n+4)],[230,175,82,255]);
    assert.notDeepEqual([...night.slice(0,3)],[230,175,82]);
  }
});

test('candle overlay varies continuously and never extinguishes the underlying window',()=>{
  let previous=candleGlowAt(0);
  for(let i=1;i<=3600;i++) {
    const next=candleGlowAt(i/60);
    assert.ok(next>=.035&&next<=.115);assert.ok(Math.abs(next-previous)<.001);
    previous=next;
  }
});

test('the chapel cross stays inside the vertical frame at desktop, mobile and short viewports',()=>{
  const chapel=manifest.sprites.find(s=>s.id==='chapel'),placement=referencePlacements.find(s=>s.id==='chapel');
  for(const [w,h] of [[320,506],[390,630],[1280,563],[1920,924],[844,236],[1920,260]]) {
    const size=worldViewSize(w,h),camera=new Camera(275);camera.resize(size.width,size.height);
    const point=fitReferencePlacement(camera,placement,chapel);
    assert.ok(Math.round(point.y-chapel.anchor[1]*point.scale)>=7);
    assert.ok(point.y<camera.ground);
  }
});

test('removed interaction assets are absent from runtime placements and hit testing',()=>{
  assert.deepEqual(WORLD_OBJECTS,[]);
  for(const id of ['plant','can','stone','tree']) {
    assert.ok(RETIRED_OBJECT_IDS.includes(id));assert.equal(ids.includes(id),false);
    assert.equal(referencePlacements.some(p=>p.id===id),false);
  }
  const world=new World();for(const x of [95,164,335,458])assert.equal(world.objectAt(x,-12),null);
});

test('all retired walk and inspection targets are cancelled without erasing discovery history',()=>{
  for(const id of RETIRED_OBJECT_IDS)for(const name of ['WALK','INSPECT']) {
    const save=newSave(1000,()=>.5);save.creature.state={name,targetObject:id,targetX:164,elapsed:2,duration:10};
    save.world.discoveredObjects=[id];save.world.events=[{type:'discovery',object:id,at:10}];
    const restored=normalizeSave(save,2000);
    assert.equal(restored.creature.state.name,'IDLE');assert.equal(restored.creature.state.targetObject,null);
    assert.deepEqual(restored.world.discoveredObjects,[id]);assert.deepEqual(restored.world.events,save.world.events);
  }
});

test('stale in-memory inspections cannot grant rewards or restore deleted objects',()=>{
  const c=new Creature({},()=>.5),world=new World(),ai=new CreatureAI(c,world,()=>.5);
  c.transition('INSPECT',4.5,{id:'stone',x:335});const before=c.needs.serialize();
  ai.finishInspection();assert.deepEqual(c.needs.serialize(),before);assert.equal(world.events.length,0);
  ai.chooseGoal();assert.equal(c.state,'WALK');assert.equal(c.targetObject,null);
});

test('production scene uses the active library across zones and one snapped parallax origin',()=>{
  const assets=new Map(manifest.sprites.map(s=>[s.id,{...s,surface:{id:s.id}}]));
  const calls=[];const ctx={createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},translate(){},scale(){},drawImage(surface,x,y){calls.push({id:surface.id,x,y});}};
  const camera=new Camera(275);camera.resize(288,455);
  for(const x of [-528,-280,-1,275,559,840,1088]){camera.x=x;drawReferenceScene(ctx,camera,'DAY',0,id=>assets.get(id));}
  for(const id of new Set([...referencePlacements.map(p=>p.id),...panoramaPlacements.map(p=>p.id),'ground','fence','fencePillar']))assert.ok(calls.some(c=>c.id===id),id);
  assert.equal(calls.some(c=>c.id==='moon'),false);
  for(const call of calls)assert.ok(Number.isInteger(call.x)&&Number.isInteger(call.y));
  calls.length=0;camera.x=275;drawReferenceScene(ctx,camera,'DAY',0,id=>assets.get(id));
  const before=calls.find(c=>c.id==='uniqueForestMiddle').x;calls.length=0;camera.x+=10;
  drawReferenceScene(ctx,camera,'NIGHT',0,id=>assets.get(id));
  assert.ok(Math.abs(calls.find(c=>c.id==='uniqueForestMiddle').x-before)<=4);
  assert.ok(calls.some(c=>c.id==='moon'));
});
