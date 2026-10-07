import { WORLD_WIDTH } from '../core/Config.js';
import { WorldTime } from '../core/Time.js';

export const WORLD_OBJECTS = Object.freeze([
  { id: 'plant', kind: 'plant', x: 95, radius: 12, height: 26 },
  // Persistent IDs stay unchanged so existing discoveries survive the art update.
  { id: 'can', kind: 'lantern', x: 164, radius: 9, height: 38 },
  { id: 'stone', kind: 'rune', x: 335, radius: 18, height: 46 },
  { id: 'tree', kind: 'tree', x: 458, radius: 28, height: 62 },
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
    return this.objects.find(object => y >= -object.height - 6 && y <= 6
      && Math.abs(object.x - x) <= object.radius + 6) ?? null;
  }

  serialize() {
    return { time: this.clock.elapsed, discoveredObjects: [...this.discoveredObjects], events: this.events };
  }
}
