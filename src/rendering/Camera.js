import { WORLD_WIDTH, WORLD_LEFT, WORLD_RIGHT, VIEW_WIDTH, clamp } from '../core/Config.js';

export function worldViewSize(clientWidth, clientHeight) {
  const aspect = Math.max(1, clientWidth) / Math.max(1, clientHeight);
  const targetWidth = clamp(Math.round(clientWidth / 2), 288, VIEW_WIDTH);
  // An even width keeps the snapped camera origin on a whole native pixel.
  const width = Math.min(2048, 2 * Math.ceil(Math.max(targetWidth, 400 * aspect) / 2));
  return { width, height: Math.max(100, Math.round(width / aspect)) };
}

export class Camera {
  constructor(x = 205) { this.x = x; this.width = 192; this.height = 320; }
  get pixelX() { return Math.round(this.x); }
  get left() { return this.pixelX - this.width / 2; }
  resize(width, height) {
    this.width = width;
    this.height = height;
    const usualGround = Math.min(height - 32, Math.round(height * 0.79));
    // Short panoramas give headroom priority while retaining a visible strip below the feet.
    this.ground = Math.min(height - 12, Math.max(190, usualGround));
    this.x = this.constrainX(this.x);
  }
  constrainX(x) {
    const margin = Math.min(this.width / 2, WORLD_WIDTH / 2);
    return clamp(x, WORLD_LEFT + margin, WORLD_RIGHT - margin);
  }
  update(target, dt) {
    const desired = this.constrainX(target);
    this.x += (desired - this.x) * (1 - Math.exp(-8 * Math.max(0, dt)));
  }
  toScreen(x, y = 0) { return { x: Math.round(x - this.left), y: Math.round(this.ground + y) }; }
  fromClient(x, y, bounds) {
    return { x: (x - bounds.left) / bounds.width * this.width + this.left,
      y: (y - bounds.top) / bounds.height * this.height - this.ground };
  }
}
