import { expandPart, frameAt } from './AssetModel.js';

const phases = ['DAY', 'EVENING', 'NIGHT'];
export const BIOME_DEPTHS = { far: 0.62, middle: 0.27, near: 0 };

export function biomeVariants(sprite) { return Object.keys(sprite.variants ?? { rest: [] }); }

export function biomePixels(sprite, variant = 'rest') {
  return sprite.variants ? expandPart(sprite, variant) : sprite.pixels;
}

export function sceneryFrameAt(sprite, seconds = 0, offset = 0) {
  return sprite.animation ? frameAt(sprite.animation, seconds + offset).id : 'rest';
}

export function sceneryFrameId(id, phase, depth, variant = 'rest') {
  return `${phase}:${depth}:${id}` + (variant === 'rest' ? '' : ':' + variant);
}

function blend(a, b, amount) {
  const channels = [1, 3, 5].map(offset => Math.round(parseInt(a.slice(offset, offset + 2), 16) * (1 - amount)
    + parseInt(b.slice(offset, offset + 2), 16) * amount).toString(16).padStart(2, '0'));
  return '#' + channels.join('');
}

export function biomePalette(source, phase, depth) {
  const palette = source.palettes[phase];
  // Candlelit glass retains a little warmth through the atmospheric depth ramp.
  return Object.fromEntries(Object.entries(palette.colors).map(([token, color]) =>
    [token, blend(color, palette.sky, BIOME_DEPTHS[depth] * (token === 'D' ? 0.35 : 1))]));
}

export function assembleBiome(index, loadSprite) {
  if (index.version !== 2 || !Array.isArray(index.assetFiles) || !index.assetFiles.length) {
    throw new Error('Biome: invalid library index');
  }
  const ids = new Set(), paths = new Set();
  // Validate the complete index before reading any paths from disk or the Vite module map.
  for (const { id, path } of index.assetFiles) {
    if (!/^[a-z][a-zA-Z0-9]*$/.test(id) || ['constructor', 'prototype'].includes(id) || ids.has(id)
      || typeof path !== 'string' || !/^(?:[a-z][a-z0-9-]*\/)+[a-z][a-z0-9-]*\.json$/.test(path) || paths.has(path)) {
      throw new Error('Biome: invalid or duplicate asset path');
    }
    ids.add(id); paths.add(path);
  }
  const sprites = {};
  for (const { id, path } of index.assetFiles) {
    const sprite = loadSprite(path);
    if (!sprite || sprite.id !== id) throw new Error('Biome: missing or mismatched asset ' + id);
    sprites[id] = sprite;
  }
  const source = { ...index, sprites };
  validateBiome(source);
  return source;
}

export function validateBiome(source) {
  const check = (condition, message) => { if (!condition) throw new Error('Biome: ' + message); };
  const pair = value => Array.isArray(value) && value.length === 2 && value.every(Number.isInteger);
  check(source.version === 2, 'unsupported version');
  check(Object.keys(source.palettes ?? {}).sort().join() === [...phases].sort().join(), 'unexpected phases');
  for (const phase of phases) {
    const palette = source.palettes[phase];
    check(palette && Object.keys(palette.colors).length === 32, 'missing phase palette');
    for (const color of Object.values(palette.colors)) check(/^#[\da-f]{6}$/i.test(color), 'invalid color');
    for (const name of ['sky', 'horizon', 'grass', 'soil', 'earth', 'path', 'pathShadow', 'light', 'mist']) {
      check(/^#[\da-f]{6}$/i.test(palette[name]), 'missing terrain color ' + name);
    }
  }
  const tokens = Object.keys(source.palettes.DAY.colors).sort().join('');
  for (const phase of phases) check(Object.keys(source.palettes[phase].colors).sort().join('') === tokens, 'inconsistent tokens');
  for (const [id, sprite] of Object.entries(source.sprites)) {
    check(sprite.id === id && typeof sprite.label === 'string', id + ': identity');
    check(pair(sprite.size) && sprite.size.every(size => size > 0 && size <= 192), id + ': dimensions');
    check(pair(sprite.anchor) && sprite.anchor.every((value, i) => value >= 0 && value <= sprite.size[i]), id + ': anchor');
    check(sprite.pixels.length === sprite.size[1], id + ': height');
    for (const row of sprite.pixels) {
      check(typeof row === 'string' && row.length === sprite.size[0], id + ': row width');
      check([...row].every(token => token === '.' || tokens.includes(token)), id + ': palette');
    }
    if (sprite.variants || sprite.animation) {
      check(sprite.variants && Array.isArray(sprite.variants.rest) && sprite.variants.rest.length === 0, id + ': base variant');
      for (const [variant, patches] of Object.entries(sprite.variants)) {
        check(/^[a-z][a-z-]*$/.test(variant) && Array.isArray(patches), id + ': invalid variant');
        for (const patch of patches) {
          const width = patch.pixels?.[0]?.length;
          check(pair(patch.at) && patch.at.every(value => value >= 0) && width > 0 && patch.pixels.length > 0
            && patch.at[0] + width <= sprite.size[0] && patch.at[1] + patch.pixels.length <= sprite.size[1], id + ': patch bounds');
          check(patch.pixels.every(row => typeof row === 'string' && row.length === width
            && [...row].every(token => token === '.' || tokens.includes(token))), id + ': patch pixels');
        }
      }
      const animation = sprite.animation;
      check(animation?.loop === true && Array.isArray(animation.frames) && animation.frames.length >= 2
        && animation.frames.every(frame => Object.hasOwn(sprite.variants, frame.id) && Number.isInteger(frame.duration)
          && frame.duration >= 80 && frame.duration <= 10000), id + ': animation timeline');
      check(Array.isArray(animation.regions) && animation.regions.length > 0 && animation.regions.every(region =>
        Array.isArray(region) && region.length === 4 && region.every(Number.isInteger) && region[0] >= 0 && region[1] >= 0
        && region[2] > 0 && region[3] > 0 && region[0] + region[2] <= sprite.size[0]
        && region[1] + region[3] < sprite.anchor[1]), id + ': animation regions');
      for (const variant of biomeVariants(sprite)) biomePixels(sprite, variant).forEach((row, y) => [...row].forEach((pixel, x) => {
        if (pixel !== sprite.pixels[y][x]) check(animation.regions.some(([left, top, width, height]) =>
          x >= left && x < left + width && y >= top && y < top + height), id + ': animation outside region');
      }));
    }
  }
  for (const layer of source.layers) {
    check(Object.prototype.hasOwnProperty.call(BIOME_DEPTHS, layer.depth) && Number.isFinite(layer.parallax)
      && layer.parallax >= 0 && layer.parallax <= 1, 'invalid depth');
    check(Number.isInteger(layer.period) && layer.period >= 192, 'invalid repeat');
    for (const placement of layer.placements) {
      check(source.sprites[placement.sprite] && pair(placement.at), 'invalid placement');
      check(placement.mirror === undefined || typeof placement.mirror === 'boolean', 'invalid mirror');
      check(placement.animationOffset === undefined || Number.isFinite(placement.animationOffset)
        && placement.animationOffset >= 0 && placement.animationOffset <= 60, 'invalid animation offset');
    }
  }
  return true;
}

export function sceneryPosition(camera, layer, placement, repeat = 0) {
  return { x: Math.round(placement.at[0] + repeat * layer.period - camera.x * layer.parallax + camera.width / 2),
    y: Math.round(camera.ground + placement.at[1]) };
}

export function visibleScenery(source, camera, layer) {
  const output = [];
  const center = camera.x * layer.parallax - camera.width / 2;
  const first = Math.floor((center - 192) / layer.period);
  const last = Math.ceil((center + camera.width + 192) / layer.period);
  for (let repeat = first; repeat <= last; repeat++) for (const placement of layer.placements) {
    const sprite = source.sprites[placement.sprite];
    const point = sceneryPosition(camera, layer, placement, repeat);
    const left = placement.mirror ? point.x + sprite.anchor[0] - sprite.size[0] : point.x - sprite.anchor[0];
    if (left < camera.width && left + sprite.size[0] > 0) output.push({ ...placement, ...point });
  }
  return output;
}

export function mistBands(camera, seconds, plane) {
  const period = 164;
  const parallax = plane === 'far' ? 0.16 : 0.42;
  const drift = Math.floor(seconds * (plane === 'far' ? 0.45 : 0.8));
  const offset = Math.round(camera.x * parallax) - drift;
  const first = Math.floor((offset - camera.width / 2 - period) / period);
  const bands = [];
  for (let i = first; i <= first + Math.ceil(camera.width / period) + 2; i++) {
    const x = i * period - offset + Math.round(camera.width / 2);
    const y = camera.ground - (plane === 'far' ? 61 : 32) - ((i % 3 + 3) % 3) * 4;
    bands.push({ x, y, width: 118, height: 7 });
  }
  return bands;
}

export function fireflyPoints(camera, seconds) {
  const offset = Math.round(camera.x * 0.78 - camera.width / 2);
  const first = Math.floor(offset / 61) - 1;
  const points = [];
  for (let i = first; i <= first + Math.ceil(camera.width / 61) + 2; i++) {
    const seed = (i % 7 + 7) % 7;
    const x = i * 61 - offset + Math.round(Math.sin(seconds * 0.4 + seed) * 4);
    const y = camera.ground - 28 - seed * 9 + Math.round(Math.sin(seconds * 0.6 + seed * 2) * 3);
    if (x >= 0 && x < camera.width) points.push({ x, y, bright:Math.floor(seconds * 0.7 + seed) % 4 === 0 });
  }
  return points;
}
