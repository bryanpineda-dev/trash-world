import { clamp, finite } from '../core/Config.js';
import { constrainPosition } from '../physics/Collision.js';
import { Needs } from './Needs.js';

export const STATES = Object.freeze(['IDLE', 'WALK', 'LOOK_AROUND', 'INSPECT', 'SLEEP', 'WAKE', 'SURPRISED', 'HAPPY']);
export const PERSONALITY_KEYS = ['curiosity', 'bravery', 'laziness', 'sociability', 'playfulness'];

export class Creature {
  constructor(data = {}, random = Math.random) {
    this.name = 'Miga';
    this.age = Math.max(0, finite(data.age, 0));
    this.x = constrainPosition(finite(data.position?.x, 205));
    this.direction = data.direction === -1 ? -1 : 1;
    this.needs = new Needs(data.needs);
    this.personality = Object.fromEntries(PERSONALITY_KEYS.map(key => [key,
      clamp(finite(data.personality?.[key], 0.35 + random() * 0.5), 0, 1),
    ]));
    this.state = STATES.includes(data.state?.name) ? data.state.name : 'LOOK_AROUND';
    this.stateElapsed = Math.max(0, finite(data.state?.elapsed, 0));
    this.stateDuration = Math.max(0.1, finite(data.state?.duration, 3));
    this.targetX = Number.isFinite(data.state?.targetX) ? constrainPosition(data.state.targetX) : null;
    this.targetObject = data.state?.targetObject ?? null;
    this.memory = { interactions: data.memory?.interactions ?? 0, lastObject: data.memory?.lastObject ?? null };
  }

  transition(state, duration = 3, target = null) {
    if (!STATES.includes(state)) throw new Error(`Unknown creature state: ${state}`);
    this.state = state;
    this.stateElapsed = 0;
    this.stateDuration = duration;
    this.targetX = Number.isFinite(target?.x) ? constrainPosition(target.x) : null;
    this.targetObject = target?.id ?? null;
  }

  serialize() {
    return {
      name: this.name, age: this.age, position: { x: this.x, y: 0 }, direction: this.direction,
      needs: this.needs.serialize(), personality: { ...this.personality }, memory: { ...this.memory },
      state: { name: this.state, elapsed: this.stateElapsed, duration: this.stateDuration,
        targetX: this.targetX, targetObject: this.targetObject },
    };
  }
}
