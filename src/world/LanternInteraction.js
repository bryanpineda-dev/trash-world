const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function inspectionDuration(object, phase) {
  return object.kind === 'lantern' && phase === 'NIGHT' ? 6.5 : 4.5;
}

export function lanternAttention(creature, object, phase) {
  if (phase !== 'NIGHT' || object?.kind !== 'lantern' || creature?.state !== 'INSPECT'
    || creature.targetObject !== object.id || !Number.isFinite(creature.x)) return 0;
  const distance = Math.abs(creature.x - object.x);
  const facing = Math.sign(object.x - creature.x);
  if (distance > object.radius + 17 || distance < object.radius + 8 || creature.direction !== facing) return 0;
  const elapsed = creature.stateElapsed;
  const duration = creature.stateDuration;
  if (!Number.isFinite(elapsed) || !Number.isFinite(duration) || duration <= 0) return 0;
  return smooth(elapsed / 0.8) * smooth((duration - elapsed) / 1.2);
}

export class LanternResponse {
  constructor() { this.strength = 0; }

  update(creature, object, phase, dt, motion = true) {
    if (phase !== 'NIGHT') { this.strength = 0; return 0; }
    if (!motion || !Number.isFinite(dt) || dt <= 0) return this.strength;
    const target = lanternAttention(creature, object, phase);
    const rate = target > this.strength ? 2.2 : 2;
    this.strength += (target - this.strength) * (1 - Math.exp(-rate * dt));
    return this.strength;
  }
}

export function lanternFlameAlpha(strength, seconds, phase) {
  if (phase !== 'NIGHT') return 0;
  const response = Math.max(0, Math.min(1, Number.isFinite(strength) ? strength : 0));
  const time = Number.isFinite(seconds) ? seconds : 0;
  const breath = 0.94 + 0.06 * Math.sin(time * 1.9);
  return 0.035 + 0.015 * Math.sin(time * 1.3) + response * 0.38 * breath;
}
