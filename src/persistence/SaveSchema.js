import { SAVE_VERSION, clamp, finite } from '../core/Config.js';
import { Creature } from '../creature/Creature.js';
import { World, WORLD_OBJECTS, RETIRED_OBJECT_IDS } from '../world/World.js';

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const activeObjectIds = new Set(WORLD_OBJECTS.map(object => object.id));
const objectIds = new Set([...activeObjectIds, ...RETIRED_OBJECT_IDS]);

export function normalizeSave(raw, now = Date.now()) {
  if (!isRecord(raw) || !Number.isInteger(raw.version)) throw new Error('Invalid save format');
  if (raw.version > SAVE_VERSION) throw new Error('Future save version');
  let data = raw;
  if (data.version === 0) {
    data = { ...data, version: 1, creature: { ...data.creature,
      position: data.creature?.position ?? { x: data.creature?.x ?? 205, y: 0 },
      state: typeof data.creature?.state === 'string' ? { name: data.creature.state } : data.creature?.state,
    } };
  }
  if (data.version !== SAVE_VERSION || !isRecord(data.creature) || !isRecord(data.world)) {
    throw new Error('Missing creature or world');
  }
  const creature = new Creature(data.creature, () => 0.5).serialize();
  creature.age = clamp(creature.age, 0, 1e12);
  creature.memory.interactions = Math.floor(clamp(finite(creature.memory.interactions, 0), 0, 1e9));
  creature.memory.lastObject = objectIds.has(creature.memory.lastObject) ? creature.memory.lastObject : null;
  creature.state.duration = clamp(creature.state.duration, 0.1, 3600);
  creature.state.elapsed = clamp(creature.state.elapsed, 0, 3600);
  const retiredTarget = RETIRED_OBJECT_IDS.includes(creature.state.targetObject);
  creature.state.targetObject = activeObjectIds.has(creature.state.targetObject) ? creature.state.targetObject : null;
  if (retiredTarget && ['WALK', 'INSPECT'].includes(creature.state.name)) {
    creature.state = { name: 'IDLE', elapsed: 0, duration: 3, targetX: null, targetObject: null };
  }
  if (creature.state.name === 'WALK' && creature.state.targetX === null) {
    creature.state = { name: 'IDLE', elapsed: 0, duration: 3, targetX: null, targetObject: null };
  }
  const world = {
    time: clamp(finite(data.world.time, 0), 0, 1e12),
    discoveredObjects: Array.isArray(data.world.discoveredObjects)
      ? [...new Set(data.world.discoveredObjects.filter(id => objectIds.has(id)))] : [],
    events: Array.isArray(data.world.events) ? data.world.events.filter(event =>
      isRecord(event) && event.type === 'discovery' && objectIds.has(event.object) && Number.isFinite(event.at),
    ).slice(-20).map(event => ({ type: 'discovery', object: event.object, at: Math.max(0, event.at) })) : [],
  };
  return {
    version: SAVE_VERSION, creature, world,
    settings: { ambientMotion: data.settings?.ambientMotion !== false },
    meta: {
      createdAt: clamp(finite(data.meta?.createdAt, now), 0, now),
      lastActiveAt: clamp(finite(data.meta?.lastActiveAt, now), 0, now),
      totalPlayTime: Math.max(0, finite(data.meta?.totalPlayTime, 0)),
    },
  };
}

export function newSave(now = Date.now(), random = Math.random) {
  return {
    version: SAVE_VERSION, creature: new Creature({}, random).serialize(), world: new World().serialize(),
    settings: { ambientMotion: true }, meta: { createdAt: now, lastActiveAt: now, totalPlayTime: 0 },
  };
}
