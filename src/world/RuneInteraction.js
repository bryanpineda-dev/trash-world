const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function runeAttention(creature, object) {
  if (object?.kind !== 'rune' || creature?.state !== 'INSPECT'
    || creature.targetObject !== object.id || !Number.isFinite(creature.x)) return 0;
  const distance = Math.abs(creature.x - object.x);
  if (distance < object.radius + 8 || distance > object.radius + 17
    || creature.direction !== Math.sign(object.x - creature.x)) return 0;
  const elapsed = creature.stateElapsed, duration = creature.stateDuration;
  if (!Number.isFinite(elapsed) || !Number.isFinite(duration) || duration <= 0) return 0;
  return smooth(elapsed / 0.8) * smooth((duration - elapsed) / 1.1);
}

export class RuneResponse {
  constructor() { this.strength = 0; this.progress = 0; }

  update(creature, object, dt, motion = true) {
    if (!motion || !Number.isFinite(dt) || dt <= 0) return this;
    const target = runeAttention(creature, object);
    this.strength += (target - this.strength) * (1 - Math.exp(-3 * dt));
    if (target > 0) {
      const progress = smooth((creature.stateElapsed - 0.25) / 2.35);
      this.progress += (progress - this.progress) * (1 - Math.exp(-5 * dt));
    } else if (this.strength < 0.001) this.progress = 0;
    return this;
  }
}

// Follow the existing carving from its lowest pixel, including diagonal branches.
export function runeTrace(rest, lit) {
  const points = [];
  rest.forEach((row, y) => [...row].forEach((token, x) => {
    if (token === 'e' && lit[y]?.[x] === 'h') points.push({ x, y, distance: Infinity });
  }));
  if (!points.length) return [];
  const bottom = Math.max(...points.map(point => point.y));
  const queue = points.filter(point => point.y === bottom);
  const lookup = new Map(points.map(point => [point.x + ',' + point.y, point]));
  for (const point of queue) point.distance = 0;
  for (let index = 0; index < queue.length; index++) {
    const point = queue[index];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const next = lookup.get((point.x + dx) + ',' + (point.y + dy));
      if (!next || Number.isFinite(next.distance)) continue;
      next.distance = point.distance + 1;
      queue.push(next);
    }
  }
  const reachable = points.filter(point => Number.isFinite(point.distance));
  const length = Math.max(1, ...reachable.map(point => point.distance));
  return reachable.map(({ x, y, distance }) => ({ x, y, progress: distance / length }));
}

export function runePixelAlpha(response, progress, phase) {
  const intensity = { DAY: 0.16, EVENING: 0.38, NIGHT: 0.72 }[phase] ?? 0;
  if (!Number.isFinite(response?.strength) || !Number.isFinite(response?.progress)
    || !Number.isFinite(progress)) return 0;
  return intensity * clamp(response.strength) * smooth((response.progress * 1.2 - progress + 0.12) / 0.32);
}
