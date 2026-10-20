import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,readdirSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { referencePlacements } from '../src/rendering/ReferenceScene.js';
import { panoramaPlacements,soilLayers } from '../src/rendering/ReferenceLayout.js';

const root=new URL('../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('assets/reference-biome/manifest.json',root)));
const golden=JSON.parse(readFileSync(new URL('fixtures/legacy-export-hashes.json',import.meta.url)));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function files(directory,prefix='') {
  return readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()
    ?files(new URL(e.name+'/',directory),prefix+e.name+'/'):[prefix+e.name]);
}

test('every active reference asset has a world use and every world use has an active asset',()=>{
  const used=new Set([...referencePlacements,...panoramaPlacements].map(p=>p.id));
  for(const id of ['ground','fence','fencePillar','moon'])used.add(id);
  for(const layer of soilLayers)used.add(layer.id);
  assert.deepEqual(manifest.sprites.map(a=>a.id).sort(),[...used].sort());
});

test('retired sources retain their exact originals without remaining in the native catalog',()=>{
  assert.deepEqual(manifest.retiredSources.map(a=>a.id).sort(),['forestFar','forestMiddle']);
  for(const item of manifest.retiredSources) {
    assert.ok(!manifest.sprites.some(a=>a.id===item.id));
    assert.match(item.source,/^source\/backgrounds\/[a-z-]+\.png$/);
    assert.equal(sha(readFileSync(new URL('assets/reference-biome/'+item.source,root))),item.sourceSha256);
    assert.ok(!Object.hasOwn(item,'file'));
  }
});

test('native and source inventories have no uncatalogued PNGs after cleanup',()=>{
  const base=new URL('assets/reference-biome/',root);
  assert.deepEqual(files(new URL('native/',base)).sort(),manifest.sprites.map(a=>a.file.slice('native/'.length)).sort());
  assert.deepEqual(files(new URL('source/',base)).sort(),[...new Set([...manifest.sprites,...manifest.retiredSources]
    .map(a=>a.source.slice('source/'.length)))].sort());
});

test('retired exports stay absent from project asset directories while golden records remain',()=>{
  assert.equal(Object.keys(golden.biome).length,147);assert.equal(Object.keys(golden.cemetery).length,13);
  for(const path of Object.keys(golden.biome))assert.ok(!existsSync(new URL('assets/generated/environment/'+path,root)),path);
  for(const path of Object.keys(golden.cemetery))assert.ok(!existsSync(new URL('assets/studies/cemetery/'+path,root)),path);
  for(const path of ['forest-far.png','forest-middle.png'])assert.ok(!existsSync(new URL('assets/reference-biome/native/backgrounds/'+path,root)));
});
