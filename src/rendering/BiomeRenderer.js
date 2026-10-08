import { biomeSource as source } from './BiomeSource.js';
import manifest from '../../assets/generated/biome.json';
import { biomePalette, biomePixels, sceneryBlendAt, sceneryFrameId, candleIntensity, candleEnabled, lanternLightAt, litSurfaceColor, mistBands, visibleScenery, fireflyPoints } from './BiomeModel.js';
import { drawPixels } from './Sprites.js';

export const biomeSource = source;

export class BiomeRenderer {
  constructor() {
    this.image = new Image();
    this.ready = false;
    this.fallbacks = new Map();
    this.lights = new Map();
    this.surfaceLights = new Map();
    this.image.onload = () => { this.ready = true; };
    this.image.src = new URL('../../assets/generated/biome.png', import.meta.url).href;
  }

  drawSprite(ctx, id, phase, depth, x, y, mirror = false, seconds = 0, offset = 0, surfaceLight = null) {
    const sprite = source.sprites[id];
    const sample = sceneryBlendAt(sprite, seconds, offset);
    ctx.save();
    ctx.translate(x, y);
    if (mirror) ctx.scale(-1, 1);
    const dx = -sprite.anchor[0], dy = -sprite.anchor[1], alpha = ctx.globalAlpha;
    const draw = variant => {
      const key = sceneryFrameId(id, phase, depth, variant), frame = manifest.frames[key];
      if (this.ready) {
        ctx.drawImage(this.image, frame.x, frame.y, frame.width, frame.height, dx, dy, frame.width, frame.height);
      } else {
        if (!this.fallbacks.has(key)) {
          const tile = document.createElement('canvas');
          tile.width = frame.width; tile.height = frame.height;
          drawPixels(tile.getContext('2d'), biomePixels(sprite, variant), biomePalette(source, phase, depth, sprite), 0, 0);
          this.fallbacks.set(key, tile);
        }
        ctx.drawImage(this.fallbacks.get(key), dx, dy);
      }
    };
    draw(sample.from);
    // Palette-only blends keep every opaque edge fixed on the native pixel grid.
    if (sample.mix > 0 && sample.from !== sample.to) {
      ctx.globalAlpha = alpha * sample.mix;
      draw(sample.to);
    }
    if (candleEnabled(sprite, phase)) {
      const key = `${phase}:${depth}:${id}`;
      if (!this.lights.has(key)) {
        const mask = document.createElement('canvas');
        mask.width = sprite.size[0]; mask.height = sprite.size[1];
        const pixels = sprite.pixels.map(row => [...row].map(token => sprite.candle.tokens.includes(token) ? sprite.candle.color : '.').join(''));
        drawPixels(mask.getContext('2d'), pixels, biomePalette(source, phase, depth, sprite), 0, 0);
        this.lights.set(key, mask);
      }
      ctx.globalAlpha = alpha * sprite.candle.amount * candleIntensity(seconds, offset);
      ctx.drawImage(this.lights.get(key), dx, dy);
    }
    if (surfaceLight && phase !== 'DAY' && surfaceLight.lanterns.length) {
      const { worldX, groundOffset, lanterns } = surfaceLight;
      const key = `${phase}:${depth}:${id}:${mirror}:${worldX}:${groundOffset}:${lanterns.map(lamp => lamp.x).join(',')}`;
      if (!this.surfaceLights.has(key)) {
        const mask = document.createElement('canvas');
        mask.width = sprite.size[0]; mask.height = sprite.size[1];
        const lightCtx = mask.getContext('2d'), palette = biomePalette(source, phase, depth, sprite);
        sprite.pixels.forEach((row, py) => [...row].forEach((token, px) => {
          if (token === '.') return;
          const strength = lanternLightAt(worldX + (mirror ? sprite.anchor[0] - px : px - sprite.anchor[0]),
            groundOffset + py - sprite.anchor[1], phase, lanterns);
          if (!strength) return;
          lightCtx.fillStyle = litSurfaceColor(palette[token], strength);
          lightCtx.fillRect(px, py, 1, 1);
        }));
        this.surfaceLights.set(key, mask);
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(this.surfaceLights.get(key), dx, dy);
    }
    ctx.restore();
  }

  drawLayer(ctx, camera, phase, id, seconds = 0, lanterns = []) {
    const layer = source.layers.find(layer => layer.id === id);
    for (const placement of visibleScenery(source, camera, layer)) {
      this.drawSprite(ctx, placement.sprite, phase, layer.depth, placement.x, placement.y, placement.mirror,
        seconds, placement.animationOffset ?? 0, id === 'verge'
          ? { lanterns, worldX:placement.x + camera.left, groundOffset:placement.y - camera.ground } : null);
    }
  }

  drawMist(ctx, camera, phase, seconds, plane) {
    ctx.save();
    ctx.fillStyle = source.palettes[phase].mist;
    ctx.globalAlpha = plane === 'far' ? 0.48 : 0.32;
    for (const band of mistBands(camera, seconds, plane)) {
      ctx.fillRect(band.x + 23, band.y, band.width - 42, 1);
      ctx.fillRect(band.x + 8, band.y + 1, band.width - 18, 2);
      ctx.fillRect(band.x, band.y + 3, band.width, 2);
      ctx.fillRect(band.x + 14, band.y + 5, band.width - 28, 2);
    }
    ctx.restore();
  }

  drawBackground(ctx, camera, phase, seconds = 0) {
    const p = source.palettes[phase];
    const bank = (color, rise, parallax) => {
      ctx.fillStyle = color;
      for (let x = 0; x < camera.width; x += 4) {
        const worldX = x + camera.pixelX * parallax;
        const y = camera.ground - rise + Math.round(Math.sin(worldX / 74) * 5 + Math.sin(worldX / 23) * 2);
        ctx.fillRect(x, y, 4, camera.ground - y);
      }
    };
    bank(p.horizon, 72, 0.08);
    this.drawLayer(ctx, camera, phase, 'far-wood', seconds);
    bank(biomePalette(source, phase, 'far').g, 46, 0.16);
    this.drawLayer(ctx, camera, phase, 'architecture', seconds);
    this.drawMist(ctx, camera, phase, seconds, 'far');
    this.drawLayer(ctx, camera, phase, 'middle-wood', seconds);
    ctx.fillStyle = biomePalette(source, phase, 'middle').t;
    ctx.fillRect(0, camera.ground - 12, camera.width, 12);
    this.drawMist(ctx, camera, phase, seconds, 'middle');
    this.drawLayer(ctx, camera, phase, 'near-wood', seconds);
    if (phase !== 'DAY') for (const point of fireflyPoints(camera, seconds)) {
      ctx.fillStyle = p.colors.c;
      ctx.fillRect(point.x - 1, point.y, 3, 1);
      ctx.fillRect(point.x, point.y - 1, 1, 3);
      ctx.fillStyle = point.bright ? p.colors.h : p.colors.e;
      ctx.fillRect(point.x, point.y, 1, 1);
    }
  }

  drawTerrain(ctx, camera, phase, lanterns = []) {
    const p = source.palettes[phase];
    const { width, height, ground } = camera;
    ctx.fillStyle = p.soil;
    ctx.fillRect(0, ground, width, height - ground);
    ctx.fillStyle = p.earth;
    ctx.fillRect(0, ground + 20, width, Math.max(0, height - ground - 20));
    const left = camera.left;
    for (let tile = Math.floor(left / 64); tile * 64 < left + width; tile++) {
      const id = ['groundA', 'groundB', 'groundC'][((tile % 3) + 3) % 3];
      this.drawSprite(ctx, id, phase, 'near', Math.round(tile * 64 - left + 32), ground + 31, false, 0, 0,
        { lanterns, worldX:tile * 64 + 32, groundOffset:31 });
    }
    this.drawLayer(ctx, camera, phase, 'verge', 0, lanterns);
  }

  drawGroundGrass(ctx, camera, phase, lanterns = []) {
    const p = source.palettes[phase];
    const start = Math.floor(camera.left / 19) * 19;
    for (let x = start; x < start + camera.width + 19; x += 19) {
      const point = camera.toScreen(x);
      ctx.fillStyle = litSurfaceColor(p.colors.g, lanternLightAt(x, -3, phase, lanterns));
      ctx.fillRect(point.x, point.y - 3, 1, 3);
      ctx.fillRect(point.x + 2, point.y - 4, 1, 4);
      ctx.fillStyle = litSurfaceColor(p.colors.m, lanternLightAt(x + 4, -2, phase, lanterns));
      ctx.fillRect(point.x + 4, point.y - 2, 1, 2);
    }
  }
}
