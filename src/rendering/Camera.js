import { WORLD_WIDTH, clamp } from '../core/Config.js';

export class Camera {
  constructor(x = 205) { this.x = x; this.width = 192; this.height = 320; }
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.ground = Math.min(height - 32, Math.round(height * 0.79));
    this.x = clamp(this.x, width / 2, WORLD_WIDTH - width / 2);
  }
  update(target, dt) {
    const desired = clamp(target, this.width / 2, WORLD_WIDTH - this.width / 2);
    this.x += (desired - this.x) * (1 - Math.exp(-1.8 * dt));
  }
  toScreen(x, y = 0) { return { x: Math.round(x - this.x + this.width / 2), y: Math.round(this.ground + y) }; }
  fromClient(x, y, bounds) {
    return { x: (x - bounds.left) / bounds.width * this.width + this.x - this.width / 2,
      y: (y - bounds.top) / bounds.height * this.height - this.ground };
  }
}
