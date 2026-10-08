import test from 'node:test';
import assert from 'node:assert/strict';
import { Creature } from '../src/creature/Creature.js';
import { CreatureAI } from '../src/creature/CreatureAI.js';
import { World } from '../src/world/World.js';
import { inspectionDuration, lanternAttention, LanternResponse, lanternFlameAlpha } from '../src/world/LanternInteraction.js';
import { readAssetSource } from '../scripts/asset-source.js';
import { expandPart } from '../src/rendering/AssetModel.js';

const world = new World({ time: 840 });
const lantern = world.objects.find(object => object.kind === 'lantern');
function inspecting(x = 189, elapsed = 2) {
  const creature = new Creature({ position: { x }, needs: { energy: 100 } }, () => 0.5);
  creature.direction = Math.sign(lantern.x - x);
  creature.transition('INSPECT', 6.5, lantern);
  creature.stateElapsed = elapsed;
  return creature;
}

test('only the lantern gets a longer inspection at night', () => {
  assert.equal(inspectionDuration(lantern, 'NIGHT'), 6.5);
  for (const phase of ['DAY', 'EVENING']) assert.equal(inspectionDuration(lantern, phase), 4.5);
  for (const object of world.objects.filter(object => object.kind !== 'lantern')) {
    for (const phase of ['DAY', 'EVENING', 'NIGHT']) assert.equal(inspectionDuration(object, phase), 4.5);
  }
});

test('Miga approaches from either side, stops clear of the lantern and faces it', () => {
  for (const [x, target, direction] of [[115, 139, 1], [235, 189, -1]]) {
    const creature = new Creature({ position: { x }, needs: { energy: 100 } }, () => 0.5);
    const ai = new CreatureAI(creature, new World({ time: 840 }), () => 0.5);
    ai.investigate(lantern.id);
    assert.equal(creature.state, 'WALK'); assert.equal(creature.targetX, target);
    for (let frame = 0; frame < 600 && creature.state === 'WALK'; frame++) ai.update(1 / 60);
    assert.equal(creature.state, 'INSPECT'); assert.ok(Math.abs(creature.x - target) < 0.11);
    const arrived = creature.x;
    assert.equal(creature.direction, direction); assert.equal(creature.stateDuration, 6.5);
    for (let frame = 0; frame < 180; frame++) ai.update(1 / 60);
    assert.equal(creature.state, 'INSPECT'); assert.equal(creature.x, arrived);
    assert.ok(lanternAttention(creature, lantern, 'NIGHT') > 0.99);
  }
});

test('an already close Miga enters the same night inspection without an extra walk', () => {
  const creature = inspecting();
  const ai = new CreatureAI(creature, world);
  ai.investigate(lantern.id);
  assert.equal(creature.state, 'INSPECT'); assert.equal(creature.stateElapsed, 0);
  assert.equal(creature.direction, -1); assert.equal(creature.stateDuration, 6.5);
});

test('attention requires the actual object, correct distance, direction and night phase', () => {
  const creature = inspecting();
  assert.equal(lanternAttention(creature, lantern, 'NIGHT'), 1);
  for (const phase of ['DAY', 'EVENING']) assert.equal(lanternAttention(creature, lantern, phase), 0);
  for (const change of [
    c => { c.state = 'WALK'; }, c => { c.targetObject = 'plant'; },
    c => { c.x = 300; }, c => { c.x = 164; }, c => { c.direction = 1; },
    c => { c.stateElapsed = NaN; }, c => { c.stateDuration = Infinity; },
  ]) {
    const copy = inspecting(); change(copy);
    assert.equal(lanternAttention(copy, lantern, 'NIGHT'), 0);
  }
  assert.equal(lanternAttention(creature, world.objects[0], 'NIGHT'), 0);
});

test('the inspection envelope starts and ends without a light switch', () => {
  const creature = inspecting();
  let previous = 0;
  for (let frame = 0; frame <= 390; frame++) {
    creature.stateElapsed = frame / 60;
    const value = lanternAttention(creature, lantern, 'NIGHT');
    assert.ok(value >= 0 && value <= 1); assert.ok(Math.abs(value - previous) < 0.04);
    previous = value;
  }
  assert.equal(previous, 0);
});

test('response easing is frame-rate independent for a fixed observation target', () => {
  const values = [30, 60, 120].map(fps => {
    const response = new LanternResponse();
    for (let frame = 0; frame < fps * 2; frame++) response.update(inspecting(), lantern, 'NIGHT', 1 / fps);
    return response.strength;
  });
  assert.ok(values[0] > 0.98);
  for (const value of values) assert.ok(Math.abs(value - values[0]) < 1e-12);
});

test('pause, reduced ambient motion and invalid delta do not advance the response', () => {
  const response = new LanternResponse();
  response.update(inspecting(), lantern, 'NIGHT', 1);
  const strength = response.strength;
  for (const dt of [0, -1, NaN, Infinity]) assert.equal(response.update(inspecting(), lantern, 'NIGHT', dt), strength);
  assert.equal(response.update(inspecting(), lantern, 'NIGHT', 2, false), strength);
});

test('touch or sleep releases the glow gradually rather than snapping it off', () => {
  for (const interrupt of ['touch', 'sleep']) {
    const creature = inspecting();
    const ai = new CreatureAI(creature, world);
    const response = new LanternResponse();
    response.update(creature, lantern, 'NIGHT', 2);
    const before = response.strength;
    if (interrupt === 'touch') ai.touch('creature');
    else { creature.needs.energy = 21; ai.update(1 / 60); assert.equal(creature.state, 'SLEEP'); }
    assert.equal(lanternAttention(creature, lantern, 'NIGHT'), 0);
    const after = response.update(creature, lantern, 'NIGHT', 1 / 60);
    assert.ok(after > before * 0.95 && after < before);
    response.update(creature, lantern, 'NIGHT', 3);
    assert.ok(response.strength < 0.003);
  }
});

test('day and evening disable the extra response even after a night inspection', () => {
  for (const phase of ['DAY', 'EVENING']) {
    const response = new LanternResponse(); response.update(inspecting(), lantern, 'NIGHT', 2);
    assert.equal(response.update(inspecting(), lantern, phase, 0, false), 0);
    assert.equal(lanternFlameAlpha(1, 2, phase), 0);
  }
});

test('the stable flame brightness is bounded and continuous across a full observation', () => {
  const creature = inspecting(); const response = new LanternResponse();
  let previous = lanternFlameAlpha(0, 0, 'NIGHT'), maximum = previous;
  for (let frame = 1; frame < 60 * 12; frame++) {
    creature.stateElapsed = frame / 60;
    const strength = response.update(creature, lantern, 'NIGHT', 1 / 60);
    const value = lanternFlameAlpha(strength, frame / 60, 'NIGHT');
    assert.ok(value >= 0.02 && value <= 0.43);
    assert.ok(Math.abs(value - previous) < 0.014);
    maximum = Math.max(maximum, value); previous = value;
  }
  assert.ok(maximum > 0.35); assert.ok(previous < 0.055);
  assert.ok(Number.isFinite(lanternFlameAlpha(NaN, Infinity, 'NIGHT')));
});

test('the response mask contains only existing glass and flame pixels, never metal or a halo', () => {
  const rows = expandPart(readAssetSource().parts.lantern, 'rest');
  let count = 0;
  rows.forEach((row, y) => [...row].forEach((token, x) => {
    if (!['f', 'h'].includes(token)) return;
    count++; assert.ok(x >= 8 && x <= 14 && y >= 17 && y <= 26);
  }));
  assert.ok(count > 40);
});

test('existing save fields resume the inspection without a schema change or duplicate discovery', () => {
  const creature = inspecting();
  const restored = new Creature(creature.serialize(), () => 0.5);
  assert.equal(lanternAttention(restored, lantern, 'NIGHT'), lanternAttention(creature, lantern, 'NIGHT'));
  const localWorld = new World({ time: 840 }); const ai = new CreatureAI(restored, localWorld);
  const happiness = restored.needs.happiness, boredom = restored.needs.boredom;
  ai.finishInspection(); localWorld.discover(lantern.id);
  assert.equal(localWorld.events.filter(event => event.object === lantern.id).length, 1);
  assert.equal(restored.memory.lastObject, lantern.id);
  // The existing reward contract is not increased for the lantern.
  assert.equal(restored.needs.happiness, Math.min(100, happiness + 5));
  assert.equal(restored.needs.boredom, Math.max(0, boredom - 15));
});
