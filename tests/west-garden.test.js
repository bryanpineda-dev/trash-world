import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Camera} from '../src/rendering/Camera.js';
import {additionalGraves,gardenDetails,cemeteryParallax,pollinatorStations,referencePosition} from '../src/rendering/ReferenceLayout.js';
import {referencePlacements,shadeReferencePixels,drawReferenceScene} from '../src/rendering/ReferenceScene.js';
import {sampleDaylight} from '../src/rendering/Daylight.js';
import {ambientLife} from '../src/rendering/AmbientLife.js';
import {pollinatorPose,pollinators} from '../src/rendering/Pollinators.js';
import {beeSprite,dragonflySprite,ambientFrameAt,drawAmbientSprite} from '../src/rendering/AmbientSprites.js';

const manifest=JSON.parse(readFileSync(new URL('../assets/reference-biome/manifest.json',import.meta.url)));
const ids=['slateShoulder','lancetStone','roseMemorial','wildViolets','honeyFungi'];
const camera=(x=-280,width=712)=>{const c=new Camera(x);c.resize(width,401);return c;};

test('five garden assets are separate native/source pairs used exactly once',()=>{
  const items=ids.map(id=>manifest.sprites.find(a=>a.id===id));
  assert.equal(new Set(items.map(a=>a.sha256)).size,5);
  for(const a of items){assert.equal(referencePlacements.filter(p=>p.id===a.id).length,1);assert.ok(a.size[1]>=19&&a.size[1]<=42);assert.notEqual(a.source,a.file);assert.equal(a.alphaPolicy,'source-alpha>=128');}
});

test('three extra grave silhouettes stay in the western cemetery, not the walking plane',()=>{
  const graves=additionalGraves.filter(p=>ids.includes(p.id));assert.equal(graves.length,3);
  for(const p of graves){assert.ok(p.x<0);assert.equal(p.row,'back');assert.equal(p.parallax,cemeteryParallax);assert.ok(p.offset<=-17);}
});

test('new flowers and fungi stay on the surface and share the cemetery plane',()=>{
  assert.equal(gardenDetails.length,2);
  for(const p of gardenDetails){assert.ok(p.x<0);assert.ok(p.offset<0);assert.equal(p.row,'cover');assert.equal(p.parallax,cemeteryParallax);}
});

test('the mineral soil grade reduces warm brown without recoloring cool stone or vegetation',()=>{
  for(const phase of ['DAY','DAWN','GOLDEN','DUSK','NIGHT']){
    const warm=[100,72,40,255],old=shadeReferencePixels(warm,'ground',1,1,phase,'architecture'),next=shadeReferencePixels(warm,'cemeterySoil',1,1,phase,'architecture');
    assert.ok(next[0]-next[2]<old[0]-old[2]);assert.equal(next[3],255);
    for(const pixel of [[65,80,68,255],[88,96,100,255]])assert.deepEqual(shadeReferencePixels(pixel,'cemeterySoil',1,1,phase),shadeReferencePixels(pixel,'ground',1,1,phase));
  }
});

test('soil grade preserves alpha and does not alter other materials',()=>{
  const sample=[100,72,40,0,100,72,40,255];
  const next=shadeReferencePixels(sample,'cemeterySoil',2,1,'DAY');
  assert.equal(next[3],0);assert.equal(next[7],255);
  assert.deepEqual(shadeReferencePixels([70,113,58,255],'oakLeft',1,1,'DAY'),new Uint8ClampedArray([91,150,72,255]));
});

test('bee and dragonfly sprites have bounded distinct native flight and rest poses',()=>{
  for(const sprite of [beeSprite,dragonflySprite]){
    assert.equal(sprite.frames.length,3);assert.equal(new Set(sprite.frames.map(f=>f.join(''))).size,3);
    for(const frame of sprite.frames){assert.equal(frame.length,sprite.size[1]);for(const row of frame){assert.equal(row.length,sprite.size[0]);for(const token of row)assert.ok(token==='.'||sprite.palette[token]);}}
    assert.equal(ambientFrameAt(sprite,NaN),ambientFrameAt(sprite,0));assert.equal(ambientFrameAt(sprite,4,true),2);
  }
});

test('pollinators use bounded one-pixel marks when facing either direction',()=>{
  for(const sprite of [beeSprite,dragonflySprite])for(const direction of [-1,1]){
    const pixels=[],ctx={fillRect(x,y,w,h){pixels.push({x,y,w,h});}};
    drawAmbientSprite(ctx,sprite,30,40,0,1,direction);assert.ok(pixels.length>8);
    for(const p of pixels){assert.equal(p.w,1);assert.equal(p.h,1);assert.ok(Number.isInteger(p.x)&&Number.isInteger(p.y));assert.ok(p.x>=30-sprite.anchor[0]&&p.x<30-sprite.anchor[0]+sprite.size[0]);}
  }
});

test('bees and dragonflies are diurnal and fade continuously at dusk',()=>{
  const view=camera(280,1680),day=ambientLife(view,12,3),night=ambientLife(view,22,3);
  assert.equal(day.bees.length,4);assert.equal(day.dragonflies.length,2);
  assert.deepEqual(night.bees,[]);assert.deepEqual(night.dragonflies,[]);
  const a=pollinators(view,sampleDaylight(18),3),b=pollinators(view,sampleDaylight(18.001),3);
  for(const [i,p]of a.bees.entries())assert.ok(Math.abs(p.alpha-b.bees[i].alpha)<.001);
});

test('flower visits have smooth approach and departure even at rest-cycle boundaries',()=>{
  for(const station of pollinatorStations)for(let i=1;i<=60*70;i++){
    const a=pollinatorPose(station,(i-1)/60),b=pollinatorPose(station,i/60);
    assert.ok(Math.abs(a.worldX-b.worldX)<1);assert.ok(Math.abs(a.worldY-b.worldY)<1);
    assert.ok(a.worldY<=station.offset);assert.ok(Math.abs(a.dx)<45);
  }
});

test('a perched bee keeps both position and orientation fixed on the violets',()=>{
  const station=pollinatorStations.find(s=>s.perch==='wildViolets');let held=0;
  for(let t=0;t<60;t+=.1){const a=pollinatorPose(station,t),b=pollinatorPose(station,t+.05);if(a.perched&&b.perched){assert.equal(a.worldX,b.worldX);assert.equal(a.worldY,b.worldY);assert.equal(a.direction,b.direction);assert.equal(a.frame,2);held++;}}
  assert.ok(held>100);
});

test('the resting bee follows its flower with no extra camera rounding drift',()=>{
  const plant=gardenDetails.find(p=>p.id==='wildViolets'),station=pollinatorStations.find(s=>s.perch===plant.id),view=camera();
  let time=0;while(!pollinatorPose(station,time).perched&&time<60)time+=.1;
  for(let i=-500;i<=1000;i++){
    view.x=i/3.1;const flower=referencePosition(view,plant),bee=pollinators(view,sampleDaylight(12),time).bees.find(p=>p.id===station.id);
    if(bee){assert.equal(bee.x,flower.x+1);assert.equal(bee.y,flower.y-17);}
  }
});

test('expanded night habitats are bounded, nonsynchronous and absent during daylight',()=>{
  const view=camera(-280,1680),night=ambientLife(view,22,3),day=ambientLife(view,12,3);
  assert.equal(night.fireflies.length,12);assert.equal(day.fireflies.length,0);
  assert.ok(new Set(night.fireflies.map(p=>p.alpha.toFixed(3))).size>4);
  assert.ok(night.fireflies.every(p=>p.alpha>=.037&&p.alpha<=.68));
});

test('daytime includes more than one butterfly habitat in the west',()=>{
  const samples=ambientLife(camera(),12,4);assert.ok(samples.butterflies.length>=2);assert.ok(samples.bees.length>=2);assert.ok(samples.dragonflies.length>=1);
});

test('pollinator samples are deterministic, pauseable and have no save or AI side effects',()=>{
  const view=camera(),first=ambientLife(view,12,5);
  ambientLife(camera(840),22,999);
  assert.deepEqual(ambientLife(view,12,5),first);
  const source=readFileSync(new URL('../src/rendering/Pollinators.js',import.meta.url),'utf8');assert.doesNotMatch(source,/localStorage|Math\.random|performance\.now|CreatureAI/);
});

test('the violet bee renders after its flower but behind the fence and near monuments',()=>{
  const view=camera(280,1680),calls=[];
  const ctx={globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),save(){},restore(){},translate(){},scale(){},
    fillRect(){if(this.fillStyle===beeSprite.palette.y)calls.push('bee');},drawImage(surface){calls.push(surface.id);}};
  drawReferenceScene(ctx,view,12,6,id=>{const a=manifest.sprites.find(a=>a.id===id);return a?{...a,surface:{id}}:null;});
  assert.ok(calls.indexOf('wildViolets')<calls.indexOf('bee'));
  assert.ok(calls.indexOf('bee')<calls.indexOf('fence'));
  assert.ok(calls.indexOf('bee')<calls.indexOf('gabledGrave'));
  assert.ok(calls.lastIndexOf('bee')>calls.indexOf('gabledGrave'));
});
