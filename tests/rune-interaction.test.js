import test from 'node:test';
import assert from 'node:assert/strict';
import { Creature } from '../src/creature/Creature.js';
import { CreatureAI } from '../src/creature/CreatureAI.js';
import { World } from '../src/world/World.js';
import { RuneResponse, runeAttention, runeTrace, runePixelAlpha } from '../src/world/RuneInteraction.js';
import { readAssetSource } from '../scripts/asset-source.js';
import { expandPart } from '../src/rendering/AssetModel.js';

const world = new World({ time: 840 });
const rune = world.objects.find(object => object.kind === 'rune');
const part = readAssetSource().parts.rune;
const rest = expandPart(part, 'rest'), lit = expandPart(part, 'lit');
const trace = runeTrace(rest, lit);
function inspecting(x = 301, elapsed = 2) {
  const creature = new Creature({ position: { x }, needs: { energy: 100 } }, () => 0.5);
  creature.direction = Math.sign(rune.x - x);
  creature.transition('INSPECT', 4.5, rune); creature.stateElapsed = elapsed;
  return creature;
}

test('rune inspection preserves the existing duration, approach and direction in every phase', () => {
  for (const time of [120, 600, 840]) for (const [x, target, direction] of [[275, 301, 1], [405, 369, -1]]) {
    const creature = inspecting(x); const ai = new CreatureAI(creature, new World({ time }), () => 0.5);
    ai.investigate(rune.id);
    assert.equal(creature.state, 'WALK'); assert.equal(creature.targetX, target);
    for (let frame = 0; frame < 600 && creature.state === 'WALK'; frame++) ai.update(1 / 60);
    assert.equal(creature.state, 'INSPECT'); assert.equal(creature.direction, direction);
    assert.equal(creature.stateDuration, 4.5); assert.ok(Math.abs(creature.x - target) < 0.11);
    for (let frame = 0; frame < 60; frame++) ai.update(1 / 60);
    assert.equal(runeAttention(creature, rune), 1);
  }
});

test('a generic observing pose cannot illuminate the rune without its real inspection target', () => {
  for (const change of [
    c => { c.state = 'WALK'; }, c => { c.targetObject = null; }, c => { c.targetObject = 'can'; },
    c => { c.direction = -1; }, c => { c.x = 335; }, c => { c.x = 280; },
    c => { c.stateElapsed = NaN; }, c => { c.stateDuration = Infinity; },
    c => { c.stateElapsed = -1; }, c => { c.stateElapsed = 4.5; },
  ]) {
    const creature = inspecting(); change(creature); assert.equal(runeAttention(creature, rune), 0);
  }
  assert.equal(runeAttention(inspecting(), world.objects[0]), 0);
  assert.equal(runeAttention(null, rune), 0);
});

test('the trace includes every existing carved pixel and no stone, moss or outline', () => {
  assert.equal(trace.length, 23);
  const difference = [];
  rest.forEach((row, y) => [...row].forEach((token, x) => {
    if (token !== lit[y][x]) difference.push(x + ',' + y);
  }));
  assert.deepEqual(trace.map(p => p.x + ',' + p.y).sort(), difference.sort());
  for (const p of trace) { assert.equal(rest[p.y][p.x], 'e'); assert.ok(p.progress >= 0 && p.progress <= 1); }
  assert.deepEqual(runeTrace(['.'], ['.']), []);
});

test('the carving lights from the stem to both diamond branches and finishes at the apex', () => {
  const at = (x, y) => trace.find(p => p.x === x && p.y === y).progress;
  assert.equal(at(15, 28), 0); assert.equal(at(15, 14), 1);
  assert.ok(at(15, 24) < at(15, 22)); assert.ok(at(15, 22) < at(11, 18));
  for (let y = 15; y <= 21; y++) {
    const pair = trace.filter(p => p.y === y); assert.equal(pair[0].progress, pair[1].progress);
  }
  const early = { strength: 1, progress: 0.35 };
  assert.ok(runePixelAlpha(early, 0, 'NIGHT') > 0.7);
  assert.equal(runePixelAlpha(early, 1, 'NIGHT'), 0);
  for (const pixel of trace) assert.equal(runePixelAlpha({ strength: 1, progress: 1 }, pixel.progress, 'NIGHT'), 0.72);
});

test('daylight response is subtle while the same carving remains legible at night', () => {
  const response = { strength: 1, progress: 1 };
  const levels = ['DAY', 'EVENING', 'NIGHT'].map(phase => runePixelAlpha(response, 0.5, phase));
  assert.deepEqual(levels, [0.16, 0.38, 0.72]);
  assert.equal(runePixelAlpha(response, 0.5, 'UNKNOWN'), 0);
  assert.equal(runePixelAlpha({ strength: NaN, progress: 1 }, 0, 'NIGHT'), 0);
  assert.equal(runePixelAlpha(response, NaN, 'NIGHT'), 0);
});

test('response easing is frame-rate independent for a fixed inspection', () => {
  const values = [30, 60, 120].map(fps => {
    const response = new RuneResponse();
    for (let frame = 0; frame < fps * 2; frame++) response.update(inspecting(), rune, 1 / fps);
    return response;
  });
  assert.ok(values[0].strength > 0.99);
  for (const value of values) {
    assert.ok(Math.abs(value.strength - values[0].strength) < 1e-12);
    assert.ok(Math.abs(value.progress - values[0].progress) < 1e-12);
  }
});

test('pause, ambient motion off and invalid deltas freeze both intensity and the tracing front', () => {
  const response = new RuneResponse(); response.update(inspecting(), rune, 1);
  const before = { ...response };
  for (const dt of [0, -1, NaN, Infinity]) response.update(inspecting(), rune, dt);
  response.update(inspecting(301, 3), rune, 2, false);
  assert.deepEqual({ ...response }, before);
});

test('touch, sleep or a different object fade the light without rolling the carving backwards', () => {
  for (const interrupt of ['touch', 'sleep', 'object']) {
    const creature = inspecting(301, 3); const ai = new CreatureAI(creature, world);
    const response = new RuneResponse(); response.update(creature, rune, 2);
    const before = { ...response };
    if (interrupt === 'touch') ai.touch('creature');
    if (interrupt === 'sleep') { creature.needs.energy = 21; ai.update(1 / 60); }
    if (interrupt === 'object') ai.investigate('can');
    assert.equal(runeAttention(creature, rune), 0);
    response.update(creature, rune, 1 / 60);
    assert.ok(response.strength < before.strength && response.strength > before.strength * 0.95);
    assert.equal(response.progress, before.progress);
    response.update(creature, rune, 4); assert.ok(response.strength < 0.001); assert.equal(response.progress, 0);
  }
});

test('the complete inspection draws one continuous pass and releases all carved pixels', () => {
  const creature = inspecting(301, 0), response = new RuneResponse();
  const maxima = trace.map(() => 0), previous = trace.map(() => 0);
  let maxStep = 0;
  for (let frame = 0; frame <= 600; frame++) {
    creature.stateElapsed = frame / 60; response.update(creature, rune, 1 / 60);
    trace.forEach((pixel, i) => {
      const alpha = runePixelAlpha(response, pixel.progress, 'NIGHT');
      assert.ok(alpha >= 0 && alpha <= 0.72);
      maxima[i] = Math.max(maxima[i], alpha); maxStep = Math.max(maxStep, Math.abs(alpha - previous[i])); previous[i] = alpha;
    });
  }
  assert.ok(maxStep < 0.05); assert.ok(Math.min(...maxima) > 0.6);
  assert.ok(Math.max(...previous) < 0.001);
});

test('save restoration resumes the same inspection and retains the original discovery reward', () => {
  const creature = inspecting(); const restored = new Creature(creature.serialize(), () => 0.5);
  assert.equal(runeAttention(restored, rune), runeAttention(creature, rune));
  const local = new World({ time: 840 }), ai = new CreatureAI(restored, local);
  const happiness = restored.needs.happiness, boredom = restored.needs.boredom;
  ai.finishInspection(); local.discover(rune.id);
  assert.equal(local.events.filter(event => event.object === rune.id).length, 1);
  assert.equal(restored.memory.lastObject, rune.id);
  assert.equal(restored.needs.happiness, Math.min(100, happiness + 5));
  assert.equal(restored.needs.boredom, Math.max(0, boredom - 15));
});
