import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleDaylight, daylightGrades, skyStars } from '../src/rendering/Daylight.js';
import { shadeReferencePixels, drawReferenceScene, drawWoodlandSoil } from '../src/rendering/ReferenceScene.js';
import { referencePosition, lateralPlacements, panoramaPlacements } from '../src/rendering/ReferenceLayout.js';
import { ambientLife } from '../src/rendering/AmbientLife.js';
import { Camera } from '../src/rendering/Camera.js';
import { WorldTime } from '../src/core/Time.js';
import { DAY_SECONDS } from '../src/core/Config.js';
import { readFileSync } from 'node:fs';

const camera=new Camera(-280);camera.resize(560,315);
const manifest=JSON.parse(readFileSync(new URL('../assets/reference-biome/manifest.json',import.meta.url)));
const colors=light=>[...light.sky.flat(),...light.floor,light.stars,light.moon,light.lamps,light.fireflies,light.butterflies,light.leaves];
function scene(hour,x=280) {
  const calls=[],stack=[];
  const view=new Camera(x);view.resize(560,315);
  const ctx={globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){},translate(){},scale(){},
    save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},
    drawImage(surface,x,y,w,h){calls.push({id:surface.id,grade:surface.grade,alpha:this.globalAlpha,x,y,w,h});}};
  drawReferenceScene(ctx,view,hour,3,(id,grade)=>{
    const item=manifest.sprites.find(s=>s.id===id.replace('-glass',''));
    return item?{...item,surface:{id,grade}}:null;
  });
  return {calls,ctx};
}

test('presentation follows the unchanged 24-minute simulation clock',()=>{
  assert.equal(DAY_SECONDS,1440);
  for(const hour of [0,5,6.5,12,18,19.5,22]) {
    const clock=new WorldTime(((hour-8+24)%24)/24*DAY_SECONDS);
    assert.ok(Math.abs(clock.hour-hour)<1e-9);
    assert.equal(sampleDaylight(clock.hour).hour,hour);
  }
});

test('daylight is periodic across midnight and handles invalid hours',()=>{
  for(const hour of [-25,-1,0,6.5,12,24,49])assert.deepEqual(sampleDaylight(hour),sampleDaylight(hour+24));
  for(const hour of [NaN,Infinity,-Infinity])assert.deepEqual(sampleDaylight(hour),sampleDaylight(12));
});

test('all sky, floor, lights and life weights are continuous through the whole day',()=>{
  for(let hour=0;hour<24;hour+=.01) {
    const before=colors(sampleDaylight(hour)),after=colors(sampleDaylight(hour+.0001));
    for(let c=0;c<before.length;c++)assert.ok(Math.abs(before[c]-after[c])<.04,`${hour}:${c}`);
  }
});

test('legacy phase boundaries no longer switch palettes or lights',()=>{
  for(const hour of [0,6,17,20,24]) {
    const before=colors(sampleDaylight(hour-.00001)),after=colors(sampleDaylight(hour+.00001));
    assert.ok(before.every((value,i)=>Math.abs(value-after[i])<.01));
  }
});

test('daytime has a brighter blue sky, colored vegetation and no emission or stars',()=>{
  const day=sampleDaylight(12),night=sampleDaylight(0);
  assert.ok(day.sky[0][2]>day.sky[0][0]);
  assert.ok(day.sky.flat().reduce((a,b)=>a+b)>night.sky.flat().reduce((a,b)=>a+b)*2);
  assert.equal(day.lamps,0);assert.equal(day.stars,0);assert.equal(day.fireflies,0);assert.equal(day.butterflies,1);
  const pixel=new Uint8ClampedArray([70,113,58,255]);
  const shaded=shadeReferencePixels(pixel,'oakLeft',1,1,'DAY');
  assert.ok(shaded[1]-Math.max(shaded[0],shaded[2])>50);
});

test('golden hour, dawn and dusk are distinct chromatic moments',()=>{
  const dawn=sampleDaylight(6.5),golden=sampleDaylight(18),dusk=sampleDaylight(19.5);
  assert.equal(dawn.from,'DAWN');assert.equal(golden.from,'GOLDEN');assert.equal(dusk.from,'DUSK');
  assert.ok(golden.sky[1][0]>golden.sky[1][2]);assert.ok(dusk.sky[0][2]>dusk.sky[0][0]);
  assert.ok(dusk.lamps>0&&dusk.lamps<1);
});

test('only five reusable grade keys are requested over a full cycle',()=>{
  const keys=new Set();
  for(let hour=0;hour<24;hour+=.25)for(const call of scene(hour).calls)keys.add(call.grade);
  assert.deepEqual([...keys].sort(),Object.keys(daylightGrades).sort());
});

test('native color grades blend without reducing silhouette opacity or leaking canvas alpha',()=>{
  const {calls,ctx}=scene(7.75),oak=calls.filter(c=>c.id==='oakLeft');
  assert.equal(oak.length,2);assert.equal(oak[0].alpha,1);assert.equal(oak[1].alpha,.5);
  assert.equal(ctx.globalAlpha,1);assert.equal(oak[0].x,oak[1].x);assert.equal(oak[0].w,oak[1].w);
});

test('every grade preserves the exact source alpha mask and source bytes',()=>{
  const source=new Uint8ClampedArray([40,65,31,255,2,3,4,0]);
  for(const grade of Object.keys(daylightGrades)) {
    const result=shadeReferencePixels(source,'oakLeft',2,1,grade);
    assert.equal(result[3],255);assert.equal(result[7],0);
  }
  assert.deepEqual([...source],[40,65,31,255,2,3,4,0]);
});

test('lower woodland uses green material shading rather than an achromatic fog wash',()=>{
  const pixels=new Uint8ClampedArray(4*100);
  pixels.set([80,105,118,255],99*4);
  const result=shadeReferencePixels(pixels,'uniqueForestMiddle',1,100,'DAY','middle');
  assert.ok(result[397]>result[396]+25);assert.ok(result[397]>result[398]+10);
});

test('chapel emission is off in daylight and fully warm during nighttime',()=>{
  const source=new Uint8ClampedArray(100*150*4),n=(85*100+41)*4;source.set([230,175,82,255],n);
  const day=shadeReferencePixels(source,'chapel',100,150,'DAY'),night=shadeReferencePixels(source,'chapel',100,150,'NIGHT');
  assert.ok(day[n]<day[n+2]);assert.deepEqual([...night.slice(n,n+4)],[230,175,82,255]);
  assert.equal(scene(12).calls.some(c=>c.id==='chapel-glass'),false);
  assert.ok(scene(0).calls.some(c=>c.id==='chapel-glass'));
});

test('both towers share the distant landmark plane at native scale',()=>{
  const citadel=lateralPlacements.find(p=>p.id==='distantCitadel'),middle=panoramaPlacements.find(p=>p.depth==='middle');
  const watchtower=lateralPlacements.find(p=>p.id==='watchtower');
  for(const key of ['parallax','offset','depth','fitHeadroom'])assert.equal(watchtower[key],citadel[key],key);
  assert.equal(watchtower.scale??1,1);
  assert.equal(citadel.scale??1,1);assert.ok(citadel.parallax<middle.parallax);assert.ok(citadel.offset<-60);
  const calls=scene(12).calls.map(c=>c.id);
  assert.ok(calls.indexOf('uniqueForestFar')<calls.indexOf('distantCitadel'));
  assert.ok(calls.indexOf('distantCitadel')<calls.indexOf('uniqueForestMiddle'));
  const east=scene(12,840).calls.map(c=>c.id);
  assert.ok(east.indexOf('uniqueForestFar')<east.indexOf('watchtower'));
  assert.ok(east.indexOf('watchtower')<east.indexOf('uniqueForestMiddle'));
  const before=referencePosition(camera,citadel);camera.x+=10;
  assert.ok(Math.abs(referencePosition(camera,citadel).x-before.x)<=3);camera.x-=10;
});

test('a dense star field is stable in world space and disappears in daylight',()=>{
  const first=skyStars(camera,3,0);assert.ok(first.length>=150);assert.ok(first.length<300);
  assert.deepEqual(skyStars(camera,3,12),[]);
  const second=skyStars(camera,4,0);assert.equal(first.length,second.length);
  for(const [i,star]of first.entries()) {
    assert.equal(star.id,second[i].id);assert.equal(star.x,second[i].x);assert.equal(star.y,second[i].y);
    assert.ok(star.alpha>0&&star.alpha<=1);assert.equal(star.size,1);
  }
});

test('star twinkle is restrained, continuous and freezes with the ambient clock',()=>{
  const before=skyStars(camera,3,0),after=skyStars(camera,3+1/60,0);
  for(const [i,star]of before.entries())assert.ok(Math.abs(star.alpha-after[i].alpha)<.001);
  assert.deepEqual(skyStars(camera,3,0),before);
});

test('fireflies and butterflies fade with the hour without changing their world trajectories',()=>{
  for(const hour of [6.5,7,17,18,19,20]) {
    const sample=ambientLife(camera,hour,3),night=ambientLife(camera,0,3),day=ambientLife(camera,12,3);
    for(const particle of sample.fireflies) {
      const peer=night.fireflies.find(p=>p.id===particle.id);assert.ok(peer);
      assert.equal(particle.worldX,peer.worldX);assert.equal(particle.worldY,peer.worldY);assert.ok(particle.alpha<=peer.alpha);
    }
    for(const particle of sample.butterflies) {
      const peer=day.butterflies.find(p=>p.id===particle.id);assert.ok(peer);assert.equal(particle.worldX,peer.worldX);assert.ok(particle.alpha<=peer.alpha);
    }
  }
});

test('ambient brightness has no discontinuities at the old phase boundaries',()=>{
  for(const hour of [6,17,20]) {
    const a=Object.values(ambientLife(camera,hour-.0001,3)).flat(),b=Object.values(ambientLife(camera,hour+.0001,3)).flat();
    for(const p of a)assert.ok(Math.abs(p.alpha-(b.find(q=>q.id===p.id)?.alpha??0))<.001);
  }
});

test('woodland soil closes every lower sky gap with an irregular chromatic ground line',()=>{
  const calls=[],ctx={fillRect(x,y,w,h){calls.push({x,y,w,h});}};
  drawWoodlandSoil(ctx,camera,sampleDaylight(12));
  assert.equal(calls.reduce((sum,c)=>sum+c.w,0),camera.width);
  assert.ok(new Set(calls.map(c=>c.y)).size>5);
  for(const c of calls){assert.ok(c.y<camera.ground-48);assert.equal(c.y+c.h,camera.height);}
  assert.equal(ctx.fillStyle,'rgb(26,56,34)');
});

test('sunlit stone retains highlight differences instead of clipping to luminous white',()=>{
  const source=new Uint8ClampedArray([230,230,220,255,250,250,240,255]);
  const result=shadeReferencePixels(source,'roseGrave',2,1,'DAY');
  for(let c=0;c<3;c++){assert.ok(result[c]<result[c+4]);assert.ok(result[c+4]<255);}
});

test('the moon keeps its source luminance instead of receiving the night material darkening',()=>{
  const pixels=new Uint8ClampedArray([248,226,171,255,0,0,0,0]);
  for(const grade of Object.keys(daylightGrades))assert.deepEqual(shadeReferencePixels(pixels,'moon',2,1,grade),pixels);
});

test('moon and candle masks fade once rather than doubling their opacity during a grade blend',()=>{
  for(const hour of [5.5,18.75,20.25]) {
    const lighting=sampleDaylight(hour),{calls,ctx}=scene(hour);
    const moon=calls.filter(c=>c.id==='moon'),glass=calls.filter(c=>c.id==='chapel-glass');
    assert.equal(moon.length,1);assert.equal(moon[0].alpha,lighting.moon);
    assert.equal(glass.length,1);assert.ok(glass[0].alpha<.115*lighting.lamps);
    assert.equal(ctx.globalAlpha,1);
  }
});
