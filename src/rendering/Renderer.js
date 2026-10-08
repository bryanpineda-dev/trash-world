import { clamp } from '../core/Config.js';
import { Camera } from './Camera.js';
import { drawPixels } from './Sprites.js';
import { AssetLibrary, assetManifest } from './AssetLibrary.js';
import { containsPoint } from './AssetModel.js';
import { BiomeRenderer, biomeSource } from './BiomeRenderer.js';

export class Renderer {
  constructor(canvas, x) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Canvas 2D unavailable');
    this.camera = new Camera(x);
    this.assets = new AssetLibrary();
    this.biome = new BiomeRenderer();
    this.animationTime = 0;
    this.ripple = null;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    const width = clamp(Math.round(bounds.width / 3), 192, 384);
    const height = Math.max(100, Math.round(bounds.height / Math.max(1, bounds.width) * width));
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
    const { width, height } = this.camera;
    const phase = game.world.clock.phase;
    const p = biomeSource.palettes[phase];
    const lanterns = game.world.objects.filter(object => object.kind === 'lantern');
    ctx.fillStyle = p.sky;
    ctx.fillRect(0, 0, width, height);
    this.drawSky(p, phase);
    this.biome.drawBackground(ctx, this.camera, phase, this.animationTime);
    this.biome.drawTerrain(ctx, this.camera, phase, lanterns);
    for (const object of game.world.objects) this.drawObject(object, game.world.discoveredObjects.has(object.id));
    this.biome.drawGroundGrass(ctx, this.camera, phase, lanterns);
    this.drawCreature(game.creature);
    if (this.ripple) {
      this.ripple.remaining -= dt;
      const point = this.camera.toScreen(this.ripple.x, this.ripple.y);
      ctx.globalAlpha = Math.max(0, this.ripple.remaining / 0.65);
      ctx.strokeStyle = p.colors.h;
      const size = Math.round(6 + (0.65 - this.ripple.remaining) * 22);
      ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.globalAlpha = 1;
      if (this.ripple.remaining <= 0) this.ripple = null;
    }
  }

  drawSky(p, phase) {
    const { ctx } = this;
    const { width, ground } = this.camera;
    const sunX = Math.round(width * (phase === 'NIGHT' ? 0.56 : 0.76));
    const sunY = Math.max(36, Math.round(ground * 0.27));
    if (phase === 'NIGHT') {
      this.biome.drawSprite(ctx, 'moon', phase, 'near', sunX, sunY + 24);
      ctx.fillStyle = p.colors.e;
      for (let i = 0; i < 12; i++) {
        ctx.fillRect((i * 47 + 19) % width, 32 + ((i * 23) % Math.max(40, ground * 0.52)), 1, 1);
      }
    } else {
      ctx.fillStyle = p.light;
      ctx.fillRect(sunX - 7, sunY - 10, 14, 20);
      ctx.fillRect(sunX - 10, sunY - 7, 20, 14);
      ctx.fillStyle = p.horizon;
      for (let i = 0; i < 3; i++) {
        const x = Math.round((i * 151 + this.animationTime * 0.45) % (width + 80)) - 40;
        const y = Math.round(ground * (0.23 + i * 0.13));
        ctx.fillRect(x + 7, y - 3, 18, 5);
        ctx.fillRect(x, y + 2, 40, 4);
        ctx.fillRect(x + 3, y + 6, 32, 2);
      }
    }
  }

  drawObject(object, discovered) {
    const { ctx } = this;
    const { x, y } = this.camera.toScreen(object.x);
    if (assetManifest.objects[object.kind]) {
      this.assets.drawObject(ctx, object.kind, this.animationTime, x, y);
    } else {
      ctx.fillStyle = '#858e85'; ctx.fillRect(x - 9, y - 7, 18, 6); ctx.fillRect(x - 5, y - 10, 9, 3);
      ctx.fillStyle = '#b4bab0'; ctx.fillRect(x - 5, y - 8, 8, 2);
      ctx.fillStyle = '#5e7266'; ctx.fillRect(x + 4, y - 5, 4, 3);
    }
    if (discovered) {
      ctx.fillStyle = '#f2d787';
      ctx.fillRect(x + object.radius - 2, y - 3, 2, 2);
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
    ctx.fillStyle = '#496650';
    ctx.fillRect(point.x + bounds.left, point.y - 1, bounds.width, 2);
    this.assets.drawCharacter(ctx, 'miga', assetManifest.states[c.state] ?? 'idle', t, point.x, point.y, c.direction);
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
