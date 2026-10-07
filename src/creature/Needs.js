import { clamp, finite } from '../core/Config.js';

export const DEFAULT_NEEDS = Object.freeze({
  hunger: 82, energy: 84, happiness: 70, curiosity: 76, boredom: 15, fear: 0,
});

export class Needs {
  constructor(values = {}) {
    for (const [key, initial] of Object.entries(DEFAULT_NEEDS)) {
      this[key] = clamp(finite(values[key], initial), 0, 100);
    }
  }

  change(key, amount) { this[key] = clamp(this[key] + amount, 0, 100); }

  update(dt, state) {
    const sleeping = state === 'SLEEP';
    const active = state === 'WALK' || state === 'INSPECT';
    this.change('hunger', -dt * 0.025);
    this.change('energy', dt * (sleeping ? 0.9 : active ? -0.30 : -0.14));
    this.change('happiness', -dt * 0.008);
    this.change('curiosity', dt * (state === 'INSPECT' ? -0.7 : 0.10));
    this.change('boredom', dt * (sleeping ? -0.08 : active ? -0.28 : 0.26));
    this.change('fear', -dt * 1.2);
  }

  serialize() { return Object.fromEntries(Object.keys(DEFAULT_NEEDS).map(key => [key, this[key]])); }
}
