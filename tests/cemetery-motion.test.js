import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Camera} from '../src/rendering/Camera.js';
import {cemeteryParallax,cemeteryPlacements,additionalGraves,gardenDetails,cemeteryFence,fenceModules,referencePosition,soilLayers,soilTiles} from '../src/rendering/ReferenceLayout.js';
import {drawReferenceScene} from '../src/rendering/ReferenceScene.js';

const catalog=JSON.parse(readFileSync(new URL('../assets/reference-biome/manifest.json',import.meta.url)));
const items=new Map(catalog.sprites.map(a=>[a.id,a]));
const graves=[...cemeteryPlacements,...additionalGraves];
const project=view=>[...graves,...gardenDetails].map(p=>referencePosition(view,p)).concat(fenceModules(view));
const spacing=points=>points.map(p=>p.x-points[0].x);

test('cemetery, earth and local fence share a single parallax without flattening their ground rows',()=>{
  assert.equal(graves.length,15);assert.equal(cemeteryParallax,.66);
  for(const p of [...graves,cemeteryFence,soilLayers[0]])assert.equal(p.parallax,cemeteryParallax);
  assert.ok(new Set(graves.map(p=>p.offset)).size>3);
  assert.ok(graves.every(p=>p.offset<cemeteryFence.offset));
});

test('subpixel camera movement never changes the spacing between cemetery pieces',()=>{
  for(const width of [288,712,1680,2048]){
    const view=new Camera(0);view.resize(width,401);const initial=spacing(project(view));
    for(let i=-4200;i<=4200;i++){
      view.x=i/3.7;
      assert.deepEqual(spacing(project(view)),initial);
      assert.ok(project(view).every(p=>Number.isInteger(p.x)&&Number.isInteger(p.y)));
    }
  }
});

test('parallax snaps the continuous layer translation rather than first rounding the camera',()=>{
  const view=new Camera(275.49);view.resize(712,401);
  const before=project(view);view.x=275.51;
  assert.deepEqual(project(view),before,'camera pixel boundary must not prematurely move the cemetery');
  view.x=276.51;
  assert.deepEqual(project(view),before);
  view.x=276.52;
  const after=project(view);
  assert.ok(after.every((p,i)=>p.x===before[i].x-1));
});

test('walking at 30, 60 and 120 fps translates every cemetery piece together without backward steps',()=>{
  for(const fps of [30,60,120])for(const direction of [-1,1])for(const speed of [12,16,19]){
    const view=new Camera(280);view.resize(712,401);let previous=project(view),target=280;
    for(let i=0;i<fps*8;i++){
      target+=direction*speed/fps;view.update(target,1/fps);
      const next=project(view),delta=next[0].x-previous[0].x;
      assert.ok(delta*direction<=0);assert.ok(Math.abs(delta)<=1);
      next.forEach((p,j)=>{assert.equal(p.x-previous[j].x,delta);assert.equal(p.y,previous[j].y);});
      previous=next;
    }
  }
});

test('a paused camera leaves cemetery pieces and modules exactly fixed',()=>{
  const view=new Camera(281.37);view.resize(712,401);const before=project(view);
  for(let i=0;i<120;i++){view.update(700,0);assert.deepEqual(project(view),before);}
});

test('grave anchors do not slide over the tiled cemetery earth during camera movement',()=>{
  const layer=soilLayers[0],asset=items.get(layer.id),view=new Camera(0);view.resize(712,401);
  for(let i=-1120;i<=1120;i++){
    view.x=i/2.3;
    const tile=soilTiles(view,layer,asset)[0];
    for(const p of graves){
      const position=referencePosition(view,p);
      assert.equal(((position.x-tile.x)%asset.size[0]+asset.size[0])%asset.size[0],
        ((Math.round(p.x*cemeteryParallax)%asset.size[0])+asset.size[0])%asset.size[0]);
    }
  }
});

test('fence is a finite 232px sector with an open center, never a viewport-filling repeat',()=>{
  const view=new Camera(280);view.resize(712,401);
  const modules=fenceModules(view),rails=modules.filter(m=>m.id==='fence');
  assert.equal(modules.length,4);
  assert.equal(rails[1].x+42-(rails[0].x-42),232);
  assert.equal(rails[1].x-42-(rails[0].x+42),64);
  for(const x of [-416,976]){
    view.resize(288,401);view.x=x;
    assert.ok(fenceModules(view).every(m=>m.x+items.get(m.id).size[0]/2<0||m.x-items.get(m.id).size[0]/2>view.width));
  }
});

test('all fifteen cemetery markers are drawn before the local rails and their two supports',()=>{
  const view=new Camera(280);view.resize(1680,401);const calls=[];
  const ctx={globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},translate(){},scale(){},drawImage(surface){calls.push(surface.id);}};
  drawReferenceScene(ctx,view,12,0,id=>items.has(id)?{...items.get(id),surface:{id}}:null);
  const fence=calls.indexOf('fence');assert.ok(fence>=0);
  for(const p of graves)assert.ok(calls.indexOf(p.id)>=0&&calls.indexOf(p.id)<fence,p.id);
  assert.equal(calls.filter(id=>id==='fence').length,2);assert.equal(calls.filter(id=>id==='fencePillar').length,2);
  assert.ok(calls.indexOf('gabledGrave')>fence);
});
