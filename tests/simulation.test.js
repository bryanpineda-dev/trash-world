import test from 'node:test';
import assert from 'node:assert/strict';
import { Creature, STATES } from '../src/creature/Creature.js';
import { CreatureAI } from '../src/creature/CreatureAI.js';
import { Needs } from '../src/creature/Needs.js';
import { World } from '../src/world/World.js';
import { WorldTime, offlineSeconds } from '../src/core/Time.js';
import { advanceOffline } from '../src/persistence/OfflineProgress.js';
import { MAX_OFFLINE_SECONDS } from '../src/core/Config.js';
import { Camera } from '../src/rendering/Camera.js';
import { SensorManager } from '../src/sensors/SensorManager.js';

function scene(values = {}, random = () => 0.1) {
  const creature = new Creature(values, random);
  const world = new World();
  return { creature, world, ai: new CreatureAI(creature, world, random) };
}
function simulate(scene, seconds) {
  for (let frame = 0; frame < seconds * 30; frame++) { scene.world.clock.update(1 / 30); scene.ai.update(1 / 30); }
}

test('the creature explores, discovers, rests and wakes during an autonomous life', () => {
  const s = scene();
  const seen = new Set();
  for (let frame = 0; frame < 900 * 30; frame++) {
    s.world.clock.update(1 / 30); s.ai.update(1 / 30); seen.add(s.creature.state);
    assert.ok(STATES.includes(s.creature.state));
    assert.ok(s.creature.x >= 16 && s.creature.x <= 544);
    for (const value of Object.values(s.creature.needs.serialize())) assert.ok(value >= 0 && value <= 100);
  }
  for (const state of ['WALK', 'INSPECT', 'SLEEP', 'WAKE']) assert.ok(seen.has(state), `missing ${state}`);
  assert.ok(s.world.discoveredObjects.size >= 2);
});

test('low energy overrides exploration and a rested creature wakes', () => {
  const s = scene({ needs: { energy: 21 } });
  s.ai.update(1 / 30); assert.equal(s.creature.state, 'SLEEP');
  simulate(s, 83); assert.notEqual(s.creature.state, 'SLEEP');
});

test('night encourages rest even when the creature still has moderate energy', () => {
  const s = scene({ needs: { energy: 60 } });
  s.world.clock.elapsed = 840;
  assert.equal(s.world.clock.phase, 'NIGHT');
  s.ai.chooseGoal(); assert.equal(s.creature.state, 'SLEEP');
});

test('curiosity changes decisions under identical random input', () => {
  const curious = scene({ personality: { curiosity: 1 }, needs: { boredom: 0 } }, () => 0.58);
  const reserved = scene({ personality: { curiosity: 0 }, needs: { boredom: 0 } }, () => 0.58);
  curious.ai.chooseGoal(); reserved.ai.chooseGoal();
  assert.equal(curious.creature.state, 'WALK');
  assert.notEqual(reserved.creature.state, 'WALK');
});

test('investigating an object records a discovery and prevents duplicate events', () => {
  const s = scene();
  s.ai.investigate('can'); simulate(s, 10);
  assert.ok(s.world.discoveredObjects.has('can'));
  s.world.discover('can');
  assert.equal(s.world.events.filter(event => event.object === 'can').length, 1);
});

test('a hungry creature finds the plant and feeds itself', () => {
  const s = scene({ needs: { hunger: 20 } });
  s.ai.chooseGoal(); assert.equal(s.creature.targetObject, 'plant');
  simulate(s, 20); assert.ok(s.creature.needs.hunger > 40);
});

test('petting changes happiness; touching a sleeping creature wakes it', () => {
  const s = scene();
  const happiness = s.creature.needs.happiness;
  s.ai.touch('pet'); assert.equal(s.creature.state, 'HAPPY');
  assert.ok(s.creature.needs.happiness > happiness);
  s.creature.transition('SLEEP', 0); s.ai.touch('creature');
  assert.equal(s.creature.state, 'WAKE');
});

test('world boundaries constrain even an out-of-range walk target', () => {
  const s = scene();
  s.creature.transition('WALK', 10, { x: -1000 });
  simulate(s, 30); assert.ok(s.creature.x >= 16);
  assert.notEqual(s.creature.state, 'WALK');
});

test('walking without a goal recovers and unknown states are rejected', () => {
  const s = scene();
  s.creature.transition('WALK'); s.ai.update(1 / 30);
  assert.equal(s.creature.state, 'IDLE');
  assert.throws(() => s.creature.transition('MISSING'));
});

test('needs recover during sleep and all changes remain bounded', () => {
  const needs = new Needs({ energy: 10, hunger: 5, fear: 10 });
  needs.update(10, 'SLEEP');
  assert.ok(needs.energy > 10); assert.equal(needs.fear, 0);
  needs.change('hunger', -100); needs.change('happiness', 1000);
  assert.equal(needs.hunger, 0); assert.equal(needs.happiness, 100);
});

test('world clock passes through day, evening and night', () => {
  const clock = new WorldTime(); assert.equal(clock.phase, 'DAY');
  clock.update(540); assert.equal(clock.phase, 'EVENING');
  clock.update(180); assert.equal(clock.phase, 'NIGHT');
  clock.update(720); assert.equal(clock.phase, 'DAY'); assert.equal(clock.day, 2);
});

test('offline progression is capped and does not teleport the creature', () => {
  const a = scene(); const b = scene();
  advanceOffline(a.creature, a.world, 100000000);
  advanceOffline(b.creature, b.world, MAX_OFFLINE_SECONDS);
  assert.equal(a.world.clock.elapsed, MAX_OFFLINE_SECONDS);
  assert.deepEqual(a.creature.serialize(), b.creature.serialize());
  assert.equal(a.creature.x, 205);
  assert.ok(a.creature.needs.energy >= 22 && a.creature.needs.energy <= 92);
});

test('offline progression recovers sleeping energy and handles a backwards clock', () => {
  const s = scene({ state: { name: 'SLEEP' }, needs: { energy: 20 } });
  advanceOffline(s.creature, s.world, 30); assert.equal(s.creature.needs.energy, 47);
  assert.equal(offlineSeconds(2000, 1000), 0);
  assert.equal(offlineSeconds(0, 1e12), MAX_OFFLINE_SECONDS);
});

test('screen taps map back to world coordinates after resize and camera movement', () => {
  const camera = new Camera(200); camera.resize(192, 384);
  const screen = camera.toScreen(210, -10);
  const world = camera.fromClient(screen.x * 2 + 5, screen.y * 2 + 10, { left: 5, top: 10, width: 384, height: 768 });
  assert.equal(world.x, 210); assert.equal(world.y, -10);
});

test('the sensor adapter works without any device APIs', () => {
  const sensor = new SensorManager();
  assert.equal(sensor.mode, 'TOUCH');
  assert.deepEqual(sensor.getOrientation(), { x: 0, y: 0 });
  assert.equal(sensor.getShakeIntensity(), 0);
});
