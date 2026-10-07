import { DAY_SECONDS, MAX_OFFLINE_SECONDS, clamp } from './Config.js';

export class WorldTime {
  constructor(elapsed = 0) { this.elapsed = Math.max(0, elapsed); }
  update(seconds) { this.elapsed += Math.max(0, seconds); }
  get hour() { return (8 + this.elapsed / DAY_SECONDS * 24) % 24; }
  get phase() {
    if (this.hour >= 6 && this.hour < 17) return 'DAY';
    if (this.hour >= 17 && this.hour < 20) return 'EVENING';
    return 'NIGHT';
  }
  get day() { return Math.floor(this.elapsed / DAY_SECONDS) + 1; }
}

export function offlineSeconds(lastActiveAt, now) {
  return clamp((now - lastActiveAt) / 1000, 0, MAX_OFFLINE_SECONDS);
}
