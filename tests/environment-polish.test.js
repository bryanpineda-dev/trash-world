import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Camera} from '../src/rendering/Camera.js';
import {cemeteryFence,fenceModules,lateralPlacements} from '../src/rendering/ReferenceLayout.js';
const base=new URL('../assets/reference-biome/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',base)));
const item=id=>manifest.sprites.find(a=>a.id===id);

test('two native iron spans frame a local open entrance with only two outer stone supports',()=>{
  assert.equal(cemeteryFence.railWidth,item('fence').size[0]);
  for(const width of [288,712,1680])for(const x of [-528,-280,0,280,840,1088]){
    const camera=new Camera(x);camera.resize(width,401);
    const modules=fenceModules(camera),rails=modules.filter(m=>m.id==='fence'),posts=modules.filter(m=>m.id==='fencePillar');
    assert.equal(rails.length,2);assert.equal(posts.length,2);
    assert.equal(rails[1].x-rails[0].x,84+cemeteryFence.gap);
    assert.equal(posts[0].x,rails[0].x-42);assert.equal(posts[1].x,rails[1].x+42);
    assert.ok(modules.every(m=>Number.isInteger(m.x)&&m.y===camera.ground+cemeteryFence.offset));
  }
});

test('fence extraction preserves material and resolution without duplicated stone in rail modules',()=>{
  const rail=item('fence'),pillar=item('fencePillar');
  assert.equal(rail.source,pillar.source);assert.equal(rail.sourceSha256,pillar.sourceSha256);
  assert.deepEqual(rail.nativeRect,{left:31,top:0,width:84,height:62});
  assert.deepEqual(pillar.nativeRect,{left:0,top:0,width:26,height:62});
});

test('western landmark is a single statue tower, with no active citadel or waterfall files',()=>{
  const tower=item('distantCitadel'),placement=lateralPlacements.find(p=>p.id===tower.id);
  assert.equal(tower.file,'native/architecture/guardian-tower.png');assert.deepEqual(tower.size,[70,190]);
  assert.equal(placement.parallax,.22);assert.ok(placement.fitHeadroom);
  for(const p of ['native/architecture/citadel-bridge.png','source/architecture/citadel-bridge.png'])assert.ok(!existsSync(new URL(p,base)));
});

test('far forest retains the repaired native alpha export rather than the previously erased canopy',()=>{
  const far=item('uniqueForestFar');
  assert.equal(far.alphaPolicy,'source-alpha>=128');
  assert.equal(far.sha256,'ca725adb64f526cd774e5755bc19ab6d7484f6e417335b53179fc6d344eeefac');
  assert.equal(far.sourceSha256,'230b5112a7b5c39351f70e4cda17eeec938cdc3a4a5eaafcbfbbb467621d89af');
});
