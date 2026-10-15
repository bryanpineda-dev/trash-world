import { World } from '../../src/world/World.js';

// Historical interaction modules remain covered without restoring objects in the live scene.
export const LEGACY_OBJECTS = Object.freeze([
  { id: 'plant', kind: 'plant', x: 95, radius: 12, height: 26 },
  { id: 'can', kind: 'lantern', x: 164, radius: 9, height: 38 },
  { id: 'stone', kind: 'rune', x: 335, radius: 18, height: 46 },
]);

export function legacyWorld(data = {}) {
  const world = new World(data);
  world.objects = LEGACY_OBJECTS;
  return world;
}
