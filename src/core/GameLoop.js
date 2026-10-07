import { FIXED_STEP } from './Config.js';

export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.running = false;
    this.fps = 0;
    this.frame = this.frame.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = null;
    this.accumulator = 0;
    this.handle = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.handle);
  }

  frame(now) {
    if (!this.running) return;
    const delta = this.last === null ? 0 : Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    if (delta > 0) this.fps += (1 / delta - this.fps) * 0.08;
    this.accumulator += delta;
    while (this.accumulator >= FIXED_STEP) {
      this.update(FIXED_STEP);
      this.accumulator -= FIXED_STEP;
    }
    this.render(delta);
    this.handle = requestAnimationFrame(this.frame);
  }
}
