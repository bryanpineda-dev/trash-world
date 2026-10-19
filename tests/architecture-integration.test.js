import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Camera,worldViewSize} from '../src/rendering/Camera.js';
import {referencePlacements,drawReferenceScene,isChapelGlass} from '../src/rendering/ReferenceScene.js';
import {cemeteryPlacements,cemeteryFence,fitReferencePlacement} from '../src/rendering/ReferenceLayout.js';
import {altarWicks,candleState} from '../src/rendering/ArchitectureLighting.js';
const root=new URL('../',import.meta.url),manifest=JSON.parse(readFileSync(new URL('assets/reference-biome/manifest.json',root)));
const study=JSON.parse(readFileSync(new URL('studies/architecture/manifest.json',root)));
const items=new Map(manifest.sprites.map(a=>[a.id,a]));

test('the main catalog consumes the selected architecture exports without runtime dependencies on the study',()=>{
  for(const [id,candidate]of [['chapel','church'],['mausoleum','oratory'],['recliningAngel','tomb']]) {
    const active=items.get(id),source=study.sprites.find(a=>a.id===candidate);
    assert.equal(active.sha256,source.sha256);assert.equal(active.sourceSha256,source.sourceSha256);
    assert.deepEqual(active.size,source.size);assert.deepEqual(active.anchor,source.anchor);
  }
  for(const file of ['ReferenceScene.js','ReferenceScenery.js','ArchitectureLighting.js'])assert.doesNotMatch(readFileSync(new URL('src/rendering/'+file,root),'utf8'),/studies\//);
  for(const path of ['native/architecture/chapel.png','native/architecture/mausoleum.png','native/gravestones/reclining-angel.png'])assert.ok(!existsSync(new URL('assets/reference-biome/'+path,root)));
});

test('nine individual markers are used once, with two depths between church and near monuments',()=>{
  assert.equal(cemeteryPlacements.length,9);
  const church=referencePlacements.find(p=>p.id==='chapel');
  assert.equal(church.parallax,.48);assert.ok(cemeteryFence.parallax>church.parallax);
  for(const p of cemeteryPlacements) {
    assert.equal(referencePlacements.filter(q=>q.id===p.id).length,1);
    assert.equal(items.get(p.id).sha256,study.graveyard.find(a=>a.id===p.id).sha256);
    assert.ok(p.parallax>cemeteryFence.parallax&&p.parallax<1);
    assert.ok(p.offset>church.offset&&p.offset<0);
  }
});

test('desktop opens one global view and retains the complete church without per-object shrinking',()=>{
  for(const [w,h]of [[1280,720],[1920,1080],[844,390]]) {
    const size=worldViewSize(w,h),camera=new Camera(280);camera.resize(size.width,size.height);
    const p=fitReferencePlacement(camera,referencePlacements.find(p=>p.id==='chapel'),items.get('chapel'));
    assert.equal(p.scale,1);assert.ok(p.y-256>=20);assert.equal(size.width%2,0);assert.ok(Number.isInteger(camera.left));
  }
});

test('rose mask excludes the warm door while altar metadata matches the three independent flames',()=>{
  const [w,h]=items.get('chapel').size;
  assert.ok(isChapelGlass(57/140*w,118/208*h,w,h,239,181,71));
  assert.ok(!isChapelGlass(57/140*w,175/208*h,w,h,239,181,71));
  assert.deepEqual(items.get('mausoleum').emission.wicks,altarWicks);
  assert.equal(new Set(altarWicks.map((_,i)=>candleState(1,i).alpha)).size,3);
});

test('main scene orders architecture, fence, rear graves, path, front graves and near objects coherently',()=>{
  const camera=new Camera(280);camera.resize(1680,401);const calls=[];
  const ctx={createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},translate(){},scale(){},drawImage(s){calls.push(s.id);}};
  drawReferenceScene(ctx,camera,22,1,id=>{const a=items.get(id.replace('-glass',''));return a?{...a,surface:{id}}:null;});
  const at=id=>calls.indexOf(id);
  assert.ok(at('chapel')<at('fence'));assert.ok(at('fence')<at('crosses-back-1'));
  assert.ok(at('crosses-back-1')<at('ground'));assert.ok(at('ground')<at('crosses-front-1'));
  assert.ok(at('crosses-front-1')<at('gabledGrave'));assert.ok(at('ground')<at('mausoleum'));
  assert.ok(at('fence')<at('mausoleum'));
});
