import { MAX_OFFLINE_SECONDS, clamp } from '../core/Config.js';

const ACTIVE_SECONDS = 70 / 0.18;
const SLEEP_SECONDS = 70 / 0.9;

export function advanceOffline(creature, world, elapsed) {
  const seconds = clamp(Number.isFinite(elapsed) ? elapsed : 0, 0, MAX_OFFLINE_SECONDS);
  if (seconds <= 0) return;
  creature.age += seconds;
  world.clock.update(seconds);
  creature.needs.change('hunger', -seconds * 0.025);
  creature.needs.change('happiness', -seconds * 0.0005);
  creature.needs.change('boredom', seconds * 0.003);
  creature.needs.change('curiosity', seconds * 0.005);
  creature.needs.change('fear', -seconds * 1.2);
  let remaining = seconds;
  let sleeping = creature.state === 'SLEEP';
  let energy = creature.needs.energy;
  // Skip complete rest cycles; only their remainder needs calculation.
  while (remaining > 0) {
    const rate = sleeping ? 0.9 : -0.18;
    const limit = sleeping ? 92 : 22;
    const untilLimit = Math.max(0, (limit - energy) / rate);
    if (remaining < untilLimit) { energy += remaining * rate; break; }
    energy = limit;
    remaining -= untilLimit;
    sleeping = !sleeping;
    if (!sleeping) remaining %= ACTIVE_SECONDS + SLEEP_SECONDS;
  }
  creature.needs.energy = clamp(energy, 0, 100);
  if (seconds >= 5) creature.transition(sleeping ? 'SLEEP' : 'LOOK_AROUND', 3);
}
