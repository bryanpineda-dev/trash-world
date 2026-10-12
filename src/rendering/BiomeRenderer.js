import { biomeSource as source } from './BiomeSource.js';
import manifest from '../../assets/generated/biome.json';
import { biomePalette, biomePixels, sceneryBlendAt, sceneryFrameId, candleIntensity, candleEnabled, lanternLightAt, litSurfaceColor, mistBands, mistSpeed, mistPixelAlpha, mistBlendAlpha, visibleScenery, fireflyPoints } from './BiomeModel.js';
import { drawPixels } from './Sprites.js';

export const biomeSource = source;

export class BiomeRenderer {
  constructor() {
    this.image = new Image();
    this.ready = false;
    this.fallbacks = new Map();
    this.lights = new Map();
    this.surfaceLights = new Map();
    this.mists = new Map();
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
    const drift = seconds * mistSpeed(plane), mix = drift - Math.floor(drift);
    const amount = (plane === 'far' ? .38 : .22) * ctx.globalAlpha;
    ctx.globalAlpha = 1;
    for (const band of mistBands(camera, seconds, plane)) {
      if(band.x>=camera.width||band.x+band.width+1<=0)continue;
      const seed = band.seed, key = `${phase}:${plane}:${seed}`;
      if (!this.mists.has(key)) {
        const mask = document.createElement('canvas');
        mask.width = band.width+1; mask.height = band.height;
        const maskCtx = mask.getContext('2d'), bitmap = maskCtx.createImageData(mask.width, band.height);
        const opacity = new Uint8Array(band.width*band.height);
        const rgb = [1,3,5].map(offset => parseInt(source.palettes[phase].mist.slice(offset,offset+2),16));
        for(let y=0;y<band.height;y++)for(let x=0;x<mask.width;x++) {
          bitmap.data.set(rgb,(y*mask.width+x)*4);
          if(x<band.width)opacity[y*band.width+x]=Math.round(mistPixelAlpha(x,y,band.width,band.height,seed)*255);
        }
        this.mists.set(key,{mask,maskCtx,bitmap,opacity});
      }
      // Interpolate alpha before one composite; overlapping translucent passes can pulse.
      const cached=this.mists.get(key),{mask,maskCtx,bitmap,opacity}=cached;
      if(cached.mix!==mix||cached.amount!==amount) {
        for(let y=0;y<band.height;y++)for(let x=0;x<mask.width;x++) {
          const left=x<band.width?opacity[y*band.width+x]:0,right=x>0?opacity[y*band.width+x-1]:0;
          bitmap.data[(y*mask.width+x)*4+3]=mistBlendAlpha(left,right,mix,amount);
        }
        maskCtx.putImageData(bitmap,0,0);cached.mix=mix;cached.amount=amount;
      }
      ctx.drawImage(mask,band.x,band.y);
    }
    ctx.restore();
  }

  drawBackground(ctx, camera, phase, seconds = 0) {
    const p = source.palettes[phase];
    // Dry forest floor: varied litter and scrub, not a flat horizon-colored surface.
    const floor = biomePalette(source, phase, 'middle');
    for (let x = 0; x < camera.width; x += 2) {
      const worldX = x + camera.pixelX * .42;
      const rise = 66 + Math.round(Math.sin(worldX / 19) * 7 + Math.sin(worldX / 7) * 4);
      ctx.fillStyle = floor.i;
      ctx.fillRect(x, camera.ground - rise, 2, rise);
      ctx.fillStyle = floor.g;
      ctx.fillRect(x, camera.ground - rise + 2, 1, 3);
      ctx.fillStyle = floor.t;
      for (let y = camera.ground - rise + 6; y < camera.ground; y += 7) {
        if ((Math.floor(worldX / 2) + y) % 3 === 0) ctx.fillRect(x, y, 2, 1);
      }
    }
    this.drawLayer(ctx, camera, phase, 'forest-horizon', seconds);
    this.drawLayer(ctx, camera, phase, 'far-wood', seconds);
    this.drawMist(ctx, camera, phase, seconds, 'far');
    this.drawLayer(ctx, camera, phase, 'architecture', seconds);
    this.drawLayer(ctx, camera, phase, 'middle-wood', seconds);
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
    this.drawLayer(ctx, camera, phase, 'undergrowth');
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
