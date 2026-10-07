import manifest from '../../assets/generated/atlas.json';
import style from '../../assets/source/style.json';
import parts from '../../assets/source/parts.json';
import characters from '../../assets/source/characters.json';
import animations from '../../assets/source/animations.json';
import { composePose, expandPart, frameAt, frameBounds } from './AssetModel.js';
import { drawPixels } from './Sprites.js';

export const assetManifest = manifest;
export const atlasUrl = new URL('../../assets/generated/atlas.png', import.meta.url).href;
const source = { style, parts, characters, animations };

export class AssetLibrary {
  constructor() {
    this.image = new Image();
    this.ready = false;
    this.fallbacks = new Map();
    this.image.onload = () => { this.ready = true; };
    this.image.src = atlasUrl;
  }

  pixelsFor(id) {
    if (!this.fallbacks.has(id)) {
      const [type, name, variant] = id.split(':');
      const pixels = type === 'part' ? expandPart(parts[name], variant)
        : type === 'object' ? expandPart(parts[characters.objects[name].part], variant)
          : composePose(source, type, name);
      this.fallbacks.set(id, pixels);
    }
    return this.fallbacks.get(id);
  }

  drawFrame(ctx, id, x, y, direction = 1, scale = 1) {
    const frame = manifest.frames[id];
    if (!frame) return false;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(direction < 0 ? -1 : 1, 1);
    ctx.imageSmoothingEnabled = false;
    const dx = -frame.anchor[0] * scale;
    const dy = -frame.anchor[1] * scale;
    if (this.ready) {
      ctx.drawImage(this.image, frame.x, frame.y, frame.width, frame.height,
        dx, dy, frame.width * scale, frame.height * scale);
    } else {
      // The same source pixels keep the scene visible while the atlas loads.
      drawPixels(ctx, this.pixelsFor(id), manifest.palette, dx, dy, scale);
    }
    ctx.restore();
    return true;
  }

  drawCharacter(ctx, characterId, clipId, seconds, x, y, direction = 1, scale = 1) {
    const clip = manifest.characters[characterId]?.clips[clipId];
    return clip ? this.drawFrame(ctx, frameAt(clip, seconds).id, x, y, direction, scale) : false;
  }

  boundsFor(characterId, clipId, seconds, direction = 1) {
    const clip = manifest.characters[characterId]?.clips[clipId];
    return clip ? frameBounds(manifest.frames[frameAt(clip, seconds).id], direction) : null;
  }

  drawObject(ctx, id, seconds, x, y, scale = 1) {
    const clip = manifest.objects[id];
    return clip ? this.drawFrame(ctx, frameAt(clip, seconds).id, x, y, 1, scale) : false;
  }
}
