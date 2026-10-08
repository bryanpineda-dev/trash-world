import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager } from '../src/persistence/SaveManager.js';
import { newSave, normalizeSave } from '../src/persistence/SaveSchema.js';
import { CREATURE_MARGIN, SAVE_KEY } from '../src/core/Config.js';

function storage() {
  const values = new Map();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

test('retired tree discoveries survive while stale inspection and walking targets are cleared', () => {
  for(const name of ['WALK','INSPECT']) {
    const data=newSave(1000,()=>0.25);
    data.world.discoveredObjects=['tree','can'];
    data.world.events=[{type:'discovery',object:'tree',at:10}];
    data.creature.memory.lastObject='tree';
    data.creature.state={name,elapsed:1,duration:10,targetObject:'tree',targetX:415};
    const restored=normalizeSave(data,2000);
    assert.deepEqual(restored.world,data.world);
    assert.equal(restored.creature.memory.lastObject,'tree');
    assert.deepEqual(restored.creature.state,{name:'IDLE',elapsed:0,duration:3,targetX:null,targetObject:null});
  }
});

test('save and load preserve needs, personality, sleep, position and discoveries', () => {
  const store = storage(); const manager = new SaveManager(store, () => 2000);
  const data = newSave(1000, () => 0.25);
  data.creature.needs.energy = 39;
  data.creature.state.name = 'SLEEP';
  data.creature.position.x = 142;
  data.world.discoveredObjects = ['can'];
  assert.ok(manager.save(data)); assert.deepEqual(manager.load(), data);
});

test('corrupt saves are backed up before a fresh world replaces them', () => {
  const store = storage(); store.setItem(SAVE_KEY, '{broken');
  const manager = new SaveManager(store, () => 1234);
  assert.equal(manager.load(), null);
  assert.equal(store.getItem(`${SAVE_KEY}.backup.1234`), '{broken');
  assert.ok(manager.save(newSave(1234)));
});

test('version zero migrates position and string states', () => {
  const data = newSave(1000);
  data.version = 0; data.creature.x = 140; delete data.creature.position;
  data.creature.state = 'SLEEP';
  const result = normalizeSave(data, 2000);
  assert.equal(result.version, 1); assert.equal(result.creature.position.x, 140);
  assert.equal(result.creature.state.name, 'SLEEP');
});

test('damaged fields are repaired without discarding valid discoveries', () => {
  const data = newSave(1000);
  data.creature.needs.energy = 'bad'; data.creature.position.x = -100;
  data.creature.state = { name: 'WALK', targetObject: 'missing' };
  data.world.discoveredObjects = ['can', 'missing', 'can'];
  data.world.events = [{ type: 'discovery', object: 'can', at: 10 }, 'bad'];
  const result = normalizeSave(data, 2000);
  assert.equal(result.creature.needs.energy, 84);
  assert.equal(result.creature.position.x, CREATURE_MARGIN);
  assert.equal(result.creature.state.name, 'IDLE');
  assert.deepEqual(result.world.discoveredObjects, ['can']);
  assert.equal(result.world.events.length, 1);
});

test('future schemas are never overwritten by an older app', () => {
  const store = storage(); const raw = JSON.stringify({ version: 99, precious: 'future life' });
  store.setItem(SAVE_KEY, raw); const manager = new SaveManager(store);
  assert.equal(manager.load(), null); assert.equal(manager.status, 'future');
  assert.equal(manager.save(newSave()), false); assert.equal(store.getItem(SAVE_KEY), raw);
});

test('unavailable storage never crashes gameplay', () => {
  const unavailable = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); } };
  const manager = new SaveManager(unavailable);
  assert.equal(manager.load(), null); assert.equal(manager.save(newSave()), false);
  assert.equal(manager.status, 'memory');
  const empty = new SaveManager(null); assert.equal(empty.load(), null); assert.equal(empty.save(newSave()), false);
});

test('failed backup prevents destructive replacement of a corrupt save', () => {
  const store = storage(); store.setItem(SAVE_KEY, 'precious but corrupt');
  store.setItem = () => { throw new Error('quota'); };
  const manager = new SaveManager(store);
  assert.equal(manager.load(), null); assert.equal(manager.writable, false);
  assert.equal(manager.save(newSave()), false); assert.equal(store.getItem(SAVE_KEY), 'precious but corrupt');
});
