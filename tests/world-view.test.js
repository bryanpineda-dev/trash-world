import test from 'node:test';
import assert from 'node:assert/strict';
import { Camera, worldViewSize } from '../src/rendering/Camera.js';
import { WORLD_WIDTH, WORLD_LEFT, WORLD_RIGHT, VIEW_WIDTH } from '../src/core/Config.js';
import { readBiomeSource } from '../scripts/biome-source.js';
import { biomePalette, sceneryPosition } from '../src/rendering/BiomeModel.js';

const source = readBiomeSource();
const sizes = [[320,506],[390,630],[1280,564],[1920,924],[844,236],[1920,260]];

test('world view shows more native space without changing aspect ratio or sprite scale', () => {
  for (const [w,h] of sizes) {
    const size = worldViewSize(w,h);
    assert.ok(size.width >= 288 && size.height >= 240);
    assert.ok(Math.abs(size.height - size.width*h/w) <= .5);
    const oldWidth = Math.max(192,Math.min(384,Math.round(w/3)));
    assert.ok(size.width > oldWidth);
    assert.ok(56*w/size.width < 56*w/oldWidth);
  }
  assert.equal(worldViewSize(1280,564).width,908);
  assert.ok(worldViewSize(1280,564).width>VIEW_WIDTH);
});

test('wide cameras stay centered on the existing world instead of clamping to an inverted range', () => {
  for (const [w,h] of sizes) for (const x of [32,275,528]) {
    const {width,height} = worldViewSize(w,h);
    const camera = new Camera(x); camera.resize(width,height);
    camera.update(x,10);
    if (width >= WORLD_WIDTH) assert.equal(camera.x,(WORLD_LEFT+WORLD_RIGHT)/2);
    else assert.ok(camera.x >= WORLD_LEFT+width/2 && camera.x <= WORLD_RIGHT-width/2);
    const point = camera.toScreen(x);
    assert.ok(point.x >= 0 && point.x < width);
  }
});

test('chapel cross fits above its roof in every supported observation viewport', () => {
  const layer = source.layers.find(layer=>layer.id==='architecture');
  const church = source.sprites.church;
  for (const [w,h] of sizes) {
    const size = worldViewSize(w,h),camera = new Camera(275);
    camera.resize(size.width,size.height);
    const placement = sceneryPosition(camera,layer,layer.placements[0]);
    assert.ok(placement.y-church.anchor[1] >= 16);
    assert.ok(placement.y < camera.ground);
    assert.ok(placement.x-church.anchor[0] >= 0);
    assert.ok(placement.x-church.anchor[0]+church.size[0] <= size.width);
  }
});

test('client touch coordinates still reach world objects after the wider projection', () => {
  for (const [w,h] of sizes) {
    const size = worldViewSize(w,h),camera = new Camera(275);
    camera.resize(size.width,size.height);
    const bounds = {left:20,top:80,width:w,height:h};
    for (const x of [95,164,335,275]) {
      const point = camera.toScreen(x,-12);
      const result = camera.fromClient(bounds.left+point.x*w/size.width,bounds.top+point.y*h/size.height,bounds);
      assert.ok(Math.abs(result.x-x)<=.5);
      assert.ok(Math.abs(result.y+12)<=.5);
    }
  }
});

test('lit chapel glass keeps its amber ramp at night while daytime glass stays cold', () => {
  const church=source.sprites.church;
  for (const depth of ['near','middle','far']) for (const phase of ['EVENING','NIGHT']) {
    const palette=biomePalette(source,phase,depth,church);
    for (const token of church.candle.tokens) assert.equal(palette[token],source.palettes[phase].colors[token]);
  }
  const day=biomePalette(source,'DAY','far',church);
  assert.notEqual(day.D,source.palettes.DAY.colors.D);
  assert.notEqual(day.f,source.palettes.DAY.colors.f);
});

test('the forest background has an irregular bottom silhouette instead of a horizontal solid cutoff', () => {
  for (const id of ['forestBackdrop','forestBackdropEast']) {
    const sprite=source.sprites[id];
    const bottoms=Array.from({length:sprite.size[0]},(_,x)=>sprite.pixels.findLastIndex(row=>row[x]!=='.'));
    assert.ok(new Set(bottoms).size>8);
    assert.ok(sprite.pixels.slice(-10).every(row=>row.includes('.')));
  }
});
