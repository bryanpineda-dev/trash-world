import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createStudyAssets, palettes } from '../studies/cemetery/drawings.js';
import { materialPalette, sceneSize } from '../studies/cemetery/render.js';
import { pixelBounds } from '../src/rendering/AssetModel.js';
import { createBitmap, paintPixels, encodePng } from '../scripts/png.js';

const assets=createStudyAssets(),root=new URL('../assets/studies/cemetery/',import.meta.url);
test('the study has four independent, bounded native-pixel assets',()=>{
  assert.deepEqual(Object.keys(assets),['studyOak','studyGabledGrave','studyRoundGrave','studyBrokenGrave']);
  for(const s of Object.values(assets)) {
    assert.equal(s.pixels.length,s.size[1]);
    for(const row of s.pixels){assert.equal(row.length,s.size[0]);assert.ok([...row].every(t=>t==='.'||palettes.DAY[t]));}
    const bounds=pixelBounds(s.pixels);
    assert.ok(bounds.x>0&&bounds.y>0&&bounds.x+bounds.width<s.size[0]&&bounds.y+bounds.height<s.size[1]);
    assert.equal(bounds.y+bounds.height,s.anchor[1],'base rests exactly on the ground: '+s.id);
  }
});
test('study day and night preserve geometry and define every material token',()=>{
  assert.equal(Object.keys(palettes.DAY).length,32);
  assert.deepEqual(Object.keys(palettes.DAY),Object.keys(palettes.NIGHT));
  for(const phase of ['DAY','NIGHT'])for(const hex of Object.values(palettes[phase]))assert.match(hex,/^#[0-9a-f]{6}$/);
  assert.deepEqual(sceneSize,[560,248]);
});
test('the study JSON and eight transparent PNG exports match their drawing sources',()=>{
  for(const s of Object.values(assets)) {
    const path=(s.id==='studyOak'?'trees':'gravestones')+'/'+s.id;
    assert.deepEqual(JSON.parse(readFileSync(new URL(path+'.json',root))),s);
    for(const phase of ['DAY','NIGHT']) {
      const bitmap=createBitmap(...s.size);paintPixels(bitmap,s.pixels,palettes[phase],0,0);
      assert.ok(readFileSync(new URL(path+'-'+phase.toLowerCase()+'.png',root)).equals(encodePng(bitmap)));
    }
  }
  assert.deepEqual(JSON.parse(readFileSync(new URL('palettes.json',root))),palettes);
});
test('context palettes keep church glass unlit by day and warm at night',()=>{
  const day=materialPalette('DAY','architecture'),night=materialPalette('NIGHT','architecture');
  assert.notEqual(day.D,palettes.DAY.A);assert.equal(night.D,palettes.NIGHT.A);assert.equal(night.f,palettes.NIGHT.B);
  assert.notEqual(materialPalette('NIGHT','far').g,materialPalette('NIGHT','far').w);
});
