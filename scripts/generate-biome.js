import { mkdirSync, writeFileSync } from 'node:fs';
import { biomePalette, biomePixels, biomeVariants, sceneryFrameId, BIOME_DEPTHS, validateBiome } from '../src/rendering/BiomeModel.js';
import { readBiomeSource } from './biome-source.js';
import { createBitmap, encodePng, paintPixels } from './png.js';

export function generateBiome(checkOnly = false) {
  const source = readBiomeSource();
  validateBiome(source);
  if (checkOnly) return;
  const sprites = Object.entries(source.sprites);
  const entries = [];
  for (const phase of Object.keys(source.palettes)) for (const depth of Object.keys(BIOME_DEPTHS)) {
    for (const [id, sprite] of sprites) for (const variant of biomeVariants(sprite)) {
      entries.push({ id, sprite, variant, phase, depth });
    }
  }
  // Variable-sized shelves avoid padding every small plant to a full tree canvas.
  entries.sort((a, b) => b.sprite.size[1] - a.sprite.size[1]);
  const width = 2048;
  let x = 2, y = 2, shelfHeight = 0;
  for (const entry of entries) {
    const [w, h] = entry.sprite.size;
    if (x + w + 2 > width) { x = 2; y += shelfHeight + 4; shelfHeight = 0; }
    Object.assign(entry, { x, y });
    x += w + 4; shelfHeight = Math.max(shelfHeight, h);
  }
  const bitmap = createBitmap(width, y + shelfHeight + 2);
  const frames = {};
  for (const { id, sprite, variant, phase, depth, x, y } of entries) {
    paintPixels(bitmap, biomePixels(sprite, variant), biomePalette(source, phase, depth, sprite), x, y);
    frames[sceneryFrameId(id, phase, depth, variant)] = { x, y, width: sprite.size[0], height: sprite.size[1], anchor: sprite.anchor };
  }
  writeFileSync(new URL('../assets/generated/biome.png', import.meta.url), encodePng(bitmap));
  writeFileSync(new URL('../assets/generated/biome.json', import.meta.url), JSON.stringify({ version: 1, id: source.id,
    width: bitmap.width, height: bitmap.height, frames }, null, 2) + '\n');
  console.log(`Generated legacy forest atlas: ${sprites.length} native sprites, three phases and three depth palettes.`);
}

export function biomePngExports(source = readBiomeSource()) {
  validateBiome(source);
  const files = new Map();
  for (const { id, path } of source.assetFiles) for (const phase of Object.keys(source.palettes)) for (const variant of biomeVariants(source.sprites[id])) {
    const sprite = source.sprites[id];
    const tile = createBitmap(...sprite.size);
    paintPixels(tile, biomePixels(sprite, variant), biomePalette(source, phase, 'near', sprite), 0, 0);
    const filename = phase.toLowerCase() + (variant === 'rest' ? '' : '-' + variant) + '.png';
    files.set(path.replace(/\.json$/, '/' + filename), encodePng(tile));
  }
  return files;
}

export function exportLegacyBiome(directory = new URL('../.cache/legacy-assets/environment/', import.meta.url)) {
  const files = biomePngExports();
  for (const [path, bytes] of files) {
    const destination = new URL(path, directory);
    mkdirSync(new URL('.', destination), { recursive: true });
    writeFileSync(destination, bytes);
  }
  console.log(`Exported ${files.size} legacy forest PNGs to ${directory.href}.`);
}
