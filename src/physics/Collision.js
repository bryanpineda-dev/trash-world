import { CREATURE_MARGIN, WORLD_LEFT, WORLD_RIGHT, clamp } from '../core/Config.js';

export function constrainPosition(x) {
  return clamp(x, WORLD_LEFT + CREATURE_MARGIN, WORLD_RIGHT - CREATURE_MARGIN);
}

export function moveToward(x, target, distance) {
  return constrainPosition(x + Math.sign(target - x) * Math.min(Math.abs(target - x), distance));
}
