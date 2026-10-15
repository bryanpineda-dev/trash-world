import { WORLD_WIDTH } from '../core/Config.js';
import { WorldTime } from '../core/Time.js';

export const WORLD_OBJECTS = Object.freeze([]);

export const RETIRED_OBJECT_IDS = Object.freeze(['tree','plant','can','stone']);

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
