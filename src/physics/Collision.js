import { CREATURE_MARGIN, WORLD_WIDTH, clamp } from '../core/Config.js';

export function constrainPosition(x) {
  return clamp(x, CREATURE_MARGIN, WORLD_WIDTH - CREATURE_MARGIN);
}

export function moveToward(x, target, distance) {
  return constrainPosition(x + Math.sign(target - x) * Math.min(Math.abs(target - x), distance));
}
