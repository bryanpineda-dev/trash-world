export class TouchInput {
  constructor(canvas, camera, interact) {
    this.canvas = canvas;
    this.camera = camera;
    this.interact = interact;
    this.down = event => {
      if (!event.isPrimary || event.button > 0) return;
      this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
      canvas.setPointerCapture?.(event.pointerId);
    };
    this.up = event => {
      const pointer = this.pointer;
      this.pointer = null;
      if (!pointer || pointer.id !== event.pointerId || Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 18) return;
      const point = this.camera.fromClient(event.clientX, event.clientY, canvas.getBoundingClientRect());
      this.interact(point, performance.now() - pointer.time >= 450);
    };
    this.cancel = () => { this.pointer = null; };
    canvas.addEventListener('pointerdown', this.down);
    canvas.addEventListener('pointerup', this.up);
    canvas.addEventListener('pointercancel', this.cancel);
    canvas.addEventListener('lostpointercapture', this.cancel);
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.down);
    this.canvas.removeEventListener('pointerup', this.up);
    this.canvas.removeEventListener('pointercancel', this.cancel);
    this.canvas.removeEventListener('lostpointercapture', this.cancel);
  }
}
