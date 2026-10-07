import { WORLD_WIDTH } from '../core/Config.js';
import { WorldTime } from '../core/Time.js';

export const WORLD_OBJECTS = Object.freeze([
  { id: 'plant', kind: 'plant', x: 95, radius: 14 },
  // Persistent IDs stay unchanged so existing discoveries survive the art update.
  { id: 'can', kind: 'lantern', x: 164, radius: 12 },
  { id: 'stone', kind: 'rune', x: 335, radius: 13 },
  { id: 'tree', kind: 'tree', x: 458, radius: 17 },
]);

export class World {
  constructor(data = {}) {
    this.width = WORLD_WIDTH;
    this.objects = WORLD_OBJECTS;
    this.clock = new WorldTime(data.time ?? 0);
    this.discoveredObjects = new Set(data.discoveredObjects ?? []);
    this.events = [...(data.events ?? [])];
  }

  discover(id) {
    if (!this.discoveredObjects.has(id)) {
      this.discoveredObjects.add(id);
      this.events.push({ type: 'discovery', object: id, at: Math.round(this.clock.elapsed) });
      this.events = this.events.slice(-20);
    }
  }

  objectAt(x, y) {
    if (Math.abs(y) > 38) return null;
    return this.objects.find(object => Math.abs(object.x - x) <= object.radius + 10) ?? null;
  }

  serialize() {
    return { time: this.clock.elapsed, discoveredObjects: [...this.discoveredObjects], events: this.events };
  }
}
