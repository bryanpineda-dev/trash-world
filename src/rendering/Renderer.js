import { clamp } from '../core/Config.js';
import { Camera } from './Camera.js';
import { drawPixels } from './Sprites.js';
import { AssetLibrary, assetManifest } from './AssetLibrary.js';
import { containsPoint } from './AssetModel.js';

const PALETTES = {
  DAY: { sky: '#d4e9df', hill: '#b2cbb7', distant: '#c3d7c8', cloud: '#f4f8ed', sun: '#f0b36d', grass: '#67875a', soil: '#b57d68', earth: '#946757', ink: '#24463f' },
  EVENING: { sky: '#e6cbd2', hill: '#a4ac9e', distant: '#c1bdb1', cloud: '#f8e5d5', sun: '#dd856b', grass: '#66816a', soil: '#a8786a', earth: '#895f58', ink: '#433e48' },
  NIGHT: { sky: '#293c40', hill: '#3b5552', distant: '#314947', cloud: '#45605a', sun: '#e2dca9', grass: '#455f4a', soil: '#705b54', earth: '#594a46', ink: '#e5ead3' },
};

export class Renderer {
  constructor(canvas, x) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    if (!this.ctx) throw new Error('Canvas 2D unavailable');
    this.camera = new Camera(x);
    this.assets = new AssetLibrary();
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
    const { width, height, ground } = this.camera;
    const p = PALETTES[game.world.clock.phase];
    ctx.fillStyle = p.sky;
    ctx.fillRect(0, 0, width, height);
    this.drawSky(p, game.world.clock.phase);
    this.drawHills(p);
    ctx.fillStyle = p.soil;
    ctx.fillRect(0, ground + 3, width, height - ground);
    ctx.fillStyle = p.earth;
    ctx.fillRect(0, ground + 30, width, height - ground - 30);
    ctx.fillStyle = p.grass;
    ctx.fillRect(0, ground, width, 4);
    this.drawSoil(p);
    for (const object of game.world.objects) this.drawObject(object, game.world.discoveredObjects.has(object.id));
    this.drawGrass(p);
    this.drawCreature(game.creature);
    if (this.ripple) {
      this.ripple.remaining -= dt;
      const point = this.camera.toScreen(this.ripple.x, this.ripple.y);
      ctx.globalAlpha = Math.max(0, this.ripple.remaining / 0.65);
      ctx.strokeStyle = p.ink;
      const size = Math.round(6 + (0.65 - this.ripple.remaining) * 22);
      ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.globalAlpha = 1;
      if (this.ripple.remaining <= 0) this.ripple = null;
    }
  }

  drawSky(p, phase) {
    const { ctx } = this;
    const { width, ground } = this.camera;
    const sunX = Math.round(width * 0.76);
    const sunY = Math.max(36, Math.round(ground * 0.27));
    ctx.fillStyle = p.sun;
    ctx.fillRect(sunX - 7, sunY - 10, 14, 20);
    ctx.fillRect(sunX - 10, sunY - 7, 20, 14);
    if (phase === 'NIGHT') {
      ctx.fillStyle = p.sky;
      ctx.fillRect(sunX + 1, sunY - 10, 9, 14);
      ctx.fillStyle = '#d3deca';
      for (let i = 0; i < 12; i++) {
        ctx.fillRect((i * 47 + 19) % width, 32 + ((i * 23) % Math.max(40, ground * 0.52)), 1, 1);
      }
    } else {
      ctx.fillStyle = p.cloud;
      for (let i = 0; i < 3; i++) {
        const x = Math.round((i * 151 + this.animationTime * 0.45) % (width + 80)) - 40;
        const y = Math.round(ground * (0.23 + i * 0.13));
        ctx.fillRect(x + 7, y - 3, 18, 5);
        ctx.fillRect(x, y + 2, 40, 4);
        ctx.fillRect(x + 3, y + 6, 32, 2);
      }
    }
  }

  drawHills(p) {
    const { ctx } = this;
    const { width, ground } = this.camera;
    for (let layer = 0; layer < 2; layer++) {
      ctx.fillStyle = layer ? p.hill : p.distant;
      for (let x = 0; x < width; x += 4) {
        const worldX = x + this.camera.x * (layer ? 0.18 : 0.08);
        const rise = Math.sin(worldX / 55 + layer) * 12 + Math.sin(worldX / 28) * 4;
        const y = Math.round(ground - (layer ? 20 : 38) + rise);
        ctx.fillRect(x, y, 4, ground - y);
      }
    }
  }

  drawSoil(p) {
    const { ctx } = this;
    const { ground, height } = this.camera;
    for (let x = 8; x < 560; x += 13) {
      const point = this.camera.toScreen(x);
      ctx.fillStyle = x % 3 ? p.earth : '#cfb299';
      ctx.fillRect(point.x, ground + 9 + (x * 7) % 16, 2, 1);
      ctx.fillStyle = '#756b63';
      for (let y = ground + 41 + (x % 9); y < height - 12; y += 29) ctx.fillRect(point.x, y, 2, 1);
    }
    for (const x of [47, 274, 399, 518]) {
      const point = this.camera.toScreen(x);
      const y = ground + 20 + (x % 17);
      ctx.fillStyle = '#d8c9ac';
      ctx.fillRect(point.x, y, 7, 3);
      ctx.fillStyle = '#82695c';
      ctx.fillRect(point.x + 2, y + 1, 2, 1);
    }
  }

  drawGrass(p) {
    const { ctx } = this;
    ctx.fillStyle = p.grass;
    for (let x = 20; x < 550; x += 23) {
      const point = this.camera.toScreen(x);
      ctx.fillRect(point.x, point.y - 3, 1, 3);
      ctx.fillRect(point.x + 2, point.y - 4, 1, 4);
      ctx.fillRect(point.x + 4, point.y - 2, 1, 2);
    }
  }

  drawObject(object, discovered) {
    const { ctx } = this;
    const { x, y } = this.camera.toScreen(object.x);
    if (object.kind === 'lantern' || object.kind === 'rune') {
      this.assets.drawObject(ctx, object.kind, this.animationTime, x, y);
    } else if (object.kind === 'plant') {
      ctx.fillStyle = '#365c46'; ctx.fillRect(x - 1, y - 19, 2, 19);
      ctx.fillStyle = '#719251'; ctx.fillRect(x - 8, y - 15, 7, 4); ctx.fillRect(x + 1, y - 10, 8, 4);
      ctx.fillStyle = '#9db668'; ctx.fillRect(x - 5, y - 20, 8, 5);
      ctx.fillStyle = '#cc756e'; ctx.fillRect(x + 1, y - 16, 4, 4); ctx.fillRect(x - 6, y - 11, 3, 3);
    } else if (object.kind === 'tree') {
      ctx.fillStyle = '#7e6956'; ctx.fillRect(x - 3, y - 34, 6, 34);
      ctx.fillStyle = '#46674c'; ctx.fillRect(x - 18, y - 45, 34, 17); ctx.fillRect(x - 12, y - 54, 22, 12);
      ctx.fillStyle = '#64875e'; ctx.fillRect(x - 13, y - 47, 18, 10); ctx.fillRect(x - 8, y - 53, 13, 5);
      ctx.fillStyle = '#91a66c'; ctx.fillRect(x - 11, y - 45, 7, 3);
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
