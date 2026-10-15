import { Camera, worldViewSize } from './Camera.js';
import { drawPixels } from './Sprites.js';
import { AssetLibrary, assetManifest } from './AssetLibrary.js';
import { containsPoint, frameAt } from './AssetModel.js';
import { ReferenceScenery } from './ReferenceScenery.js';
import { groundContacts, drawContactShadow } from './GroundContact.js';

export class Renderer {
  constructor(canvas, x) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Canvas 2D unavailable');
    this.camera = new Camera(x);
    this.assets = new AssetLibrary();
    this.scenery = new ReferenceScenery();
    this.animationTime = 0;
    this.ripple = null;
    this.contacts = new Map();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const { width, height } = worldViewSize(bounds.width, bounds.height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.imageSmoothingEnabled = false;
    this.camera.resize(width, height);
  }

  markTouch(point) { this.ripple = { ...point, remaining: 0.65 }; }

  render(game, dt) {
    this.animationTime += game.settings.ambientMotion ? dt : 0;
    this.camera.update(game.creature.x, dt);
    const ctx = this.ctx;
    const phase = game.world.clock.phase;
    this.scenery.draw(ctx,this.camera,phase,this.animationTime);
    this.drawCreature(game.creature);
    if (this.ripple) {
      this.ripple.remaining -= dt;
      const point = this.camera.toScreen(this.ripple.x, this.ripple.y);
      ctx.globalAlpha = Math.max(0, this.ripple.remaining / 0.65);
      ctx.strokeStyle = assetManifest.palette.h;
      const size = Math.round(6 + (0.65 - this.ripple.remaining) * 22);
      ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.globalAlpha = 1;
      if (this.ripple.remaining <= 0) this.ripple = null;
    }
  }

  creatureBounds(c) {
    return this.assets.boundsFor('miga', assetManifest.states[c.state] ?? 'idle', c.stateElapsed, c.direction);
  }

  hitCreature(c, point) {
    return containsPoint(this.creatureBounds(c), point.x - c.x, point.y);
  }

  drawCreature(c) {
    const { ctx } = this;
    const point = this.camera.toScreen(c.x);
    const t = c.stateElapsed;
    const bounds = this.creatureBounds(c);
    const clip=assetManifest.states[c.state]??'idle';
    const {id}=frameAt(assetManifest.characters.miga.clips[clip],t);
    if(!this.contacts.has(id))this.contacts.set(id,groundContacts(this.assets.pixelsFor(id),assetManifest.frames[id].anchor));
    drawContactShadow(ctx,this.contacts.get(id),point.x,point.y,c.direction);
    this.assets.drawCharacter(ctx, 'miga', clip, t, point.x, point.y, c.direction);
    if (c.state === 'SLEEP') {
      const z = Math.floor(t * 0.5) % 3;
      this.drawSymbol('z', point.x + c.direction * 20, point.y + bounds.top - 8 - z * 3);
    }
    if (c.state === 'SURPRISED') this.drawSymbol('!', point.x + 12, point.y + bounds.top - 9);
    if (c.state === 'INSPECT' && Math.floor(t * 2) % 3 === 0) this.drawSymbol('?', point.x + 12, point.y + bounds.top - 9);
    if (c.state === 'HAPPY') this.drawSymbol('heart', point.x + 14, point.y + bounds.top - 8);
  }

  drawSymbol(symbol, x, y) {
    const patterns = { '!': ['a', 'a', 'a', '.', 'a'], '?': ['aaa', '..a', '.aa', '...', '.a.'], z: ['aaa', '..a', '.a.', 'aaa'], heart: ['a.a', 'aaa', '.a.'] };
    drawPixels(this.ctx, patterns[symbol], { a: symbol === 'heart' ? '#c87576' : '#245449' }, Math.round(x), Math.round(y));
  }

  destroy() { this.observer.disconnect(); }
}
