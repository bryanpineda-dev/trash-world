import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readAssetSource } from '../scripts/asset-source.js';
import { compileCatalog, expandPart, frameBounds, pixelBounds } from '../src/rendering/AssetModel.js';
import { WORLD_OBJECTS, World } from '../src/world/World.js';
import { Creature } from '../src/creature/Creature.js';
import { CreatureAI } from '../src/creature/CreatureAI.js';

const source = readAssetSource();
const catalog = compileCatalog(source);

test('the environment art preserves every approved Miga pixel, anchor and pose bound', () => {
  const frames = Object.fromEntries(Object.entries(catalog.frames).filter(([id]) => id.startsWith('miga:')));
  assert.equal(createHash('sha256').update(JSON.stringify(frames)).digest('hex'),
    '41ff36d1819dd094d4a0ab9a2a7780086f4ca57b230f924c6081b2a35fb79707');
});

test('four environment sprites share native pixels and fixed grounded proportions', () => {
  const expected = { lantern: [24, 40, 38], rune: [36, 48, 46], plant: [28, 28, 26], tree: [64, 64, 62] };
  assert.deepEqual(Object.keys(catalog.objects).sort(), Object.keys(expected).sort());
  assert.equal(Object.keys(catalog.palette).length, 16);
  assert.equal(catalog.frames['miga:stand'].bounds.height, 56);
  for (const [id, [width, height, visibleHeight]] of Object.entries(expected)) {
    const object = source.characters.objects[id];
    assert.deepEqual(source.parts[object.part].size, [width, height]);
    assert.deepEqual(object.anchor, [width / 2, height - 1]);
    for (const { id: frameId } of catalog.objects[id].frames) {
      const frame = catalog.frames[frameId];
      assert.equal(frame.bounds.height, visibleHeight, frameId);
      assert.equal(frame.bounds.y + frame.bounds.height, frame.anchor[1], frameId + ': exact floor contact');
      assert.equal(frame.pixels.at(-1), '.'.repeat(width));
    }
  }
});

test('environment hit bounds cover every visible animated pixel without catching distant sky or soil', () => {
  const world = new World();
  for (const object of WORLD_OBJECTS) {
    const frames = catalog.objects[object.kind].frames.map(({ id }) => catalog.frames[id]);
    const bounds = frames.map(frame => frameBounds(frame));
    assert.equal(object.height, Math.max(...bounds.map(bound => -bound.top)));
    assert.equal(object.radius, Math.max(...bounds.flatMap(bound => [-bound.left, bound.left + bound.width])));
    for (const frame of frames) {
      frame.pixels.forEach((row, y) => [...row].forEach((pixel, x) => {
        if (pixel !== '.') assert.equal(world.objectAt(object.x + x - frame.anchor[0], y - frame.anchor[1])?.id, object.id);
      }));
    }
    assert.equal(world.objectAt(object.x, -object.height - 7), null);
    assert.equal(world.objectAt(object.x, 7), null);
  }
});

test('investigation stops beside the larger props from either side instead of inside their silhouettes', () => {
  const world = new World();
  const standing = frameBounds(catalog.frames['miga:stand']);
  for (const object of WORLD_OBJECTS) {
    for (const side of [-1, 1]) {
      const creature = new Creature({ position: { x: object.x + side * 90 }, needs: { energy: 100 } }, () => 0.2);
      const ai = new CreatureAI(creature, world, () => 0.2);
      ai.investigate(object.id);
      assert.equal(creature.state, 'WALK');
      assert.equal(creature.targetX, object.x + side * (object.radius + 16));
      creature.x = creature.targetX;
      ai.update(1 / 30);
      assert.equal(creature.state, 'INSPECT');
      assert.equal(creature.direction, -side);
      if (side < 0) assert.ok(creature.x + standing.left + standing.width < object.x - object.radius);
      else assert.ok(creature.x + standing.left > object.x + object.radius);
    }
  }
});

test('environment animation changes only flame, rune carving and flexible foliage', () => {
  for (const [id, variant, region] of [
    ['lantern', 'flicker', [9, 19, 5, 8]], ['rune', 'lit', [11, 14, 9, 15]],
    ['plant', 'breeze', [13, 1, 7, 5]], ['tree', 'breeze', [0, 0, 64, 40]],
  ]) {
    const base = expandPart(source.parts[id], 'rest');
    const animated = expandPart(source.parts[id], variant);
    let changed = 0;
    base.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === animated[y][x]) return;
      changed++;
      const [left, top, width, height] = region;
      assert.ok(x >= left && x < left + width && y >= top && y < top + height, id + ': static material moved');
      if (id === 'lantern') assert.ok(['f', 'h'].includes(pixel) && ['f', 'h'].includes(animated[y][x]), 'Metal and glass framing remain static');
      if (id === 'rune') assert.ok(pixel === 'e' && animated[y][x] === 'h', 'Only the engraved rune lights up');
    }));
    assert.ok(changed > 0, id + ': animation must have visible changes');
    assert.equal(pixelBounds(animated).y + pixelBounds(animated).height, source.characters.objects[id].anchor[1]);
  }
});

test('each environment variant keeps a connected pixel silhouette', () => {
  for (const object of Object.values(source.characters.objects)) {
    const part = source.parts[object.part];
    for (const variant of Object.keys(part.variants)) {
      const rows = expandPart(part, variant);
      const filled = new Set();
      rows.forEach((row, y) => [...row].forEach((pixel, x) => {
        if (pixel !== '.') filled.add(y * part.size[0] + x);
      }));
      const reached = new Set();
      const pending = [[...filled][0]];
      while (pending.length) {
        const key = pending.pop();
        if (reached.has(key)) continue;
        reached.add(key);
        const x = key % part.size[0], y = Math.floor(key / part.size[0]);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (x + dx < 0 || x + dx >= part.size[0] || y + dy < 0 || y + dy >= part.size[1]) continue;
          const neighbor = (y + dy) * part.size[0] + x + dx;
          if (filled.has(neighbor) && !reached.has(neighbor)) pending.push(neighbor);
        }
      }
      assert.equal(reached.size, filled.size, object.part + '/' + variant + ': detached pixels');
    }
  }
});

test('old discovery identities and world placements survive the new object art', () => {
  assert.deepEqual(WORLD_OBJECTS.map(({ id, kind, x }) => ({ id, kind, x })), [
    { id: 'plant', kind: 'plant', x: 95 }, { id: 'can', kind: 'lantern', x: 164 },
    { id: 'stone', kind: 'rune', x: 335 },
  ]);
  const saved = { time: 840, discoveredObjects: ['plant', 'can', 'stone', 'tree'], events: [{ type: 'discovery', object: 'stone', at: 20 }] };
  assert.deepEqual(new World(saved).serialize(), saved);
  assert.equal(new World(saved).objectAt(458,-1),null);
});
