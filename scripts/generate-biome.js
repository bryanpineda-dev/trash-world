import { mkdirSync, writeFileSync } from 'node:fs';
import { biomePalette, BIOME_DEPTHS, validateBiome } from '../src/rendering/BiomeModel.js';
import { readBiomeSource } from './biome-source.js';
import { createBitmap, encodePng, paintPixels } from './png.js';

export function generateBiome(checkOnly = false) {
  const source = readBiomeSource();
  validateBiome(source);
  if (checkOnly) return;
  const sprites = Object.entries(source.sprites);
  const cellWidth = Math.max(...sprites.map(([, sprite]) => sprite.size[0])) + 4;
  const cellHeight = Math.max(...sprites.map(([, sprite]) => sprite.size[1])) + 4;
  const columns = sprites.length;
  const bitmap = createBitmap(cellWidth * columns, cellHeight * 9);
  const frames = {};
  let row = 0;
  for (const phase of Object.keys(source.palettes)) for (const depth of Object.keys(BIOME_DEPTHS)) {
    const palette = biomePalette(source, phase, depth);
    sprites.forEach(([id, sprite], column) => {
      const x = column * cellWidth + 2, y = row * cellHeight + 2;
      paintPixels(bitmap, sprite.pixels, palette, x, y);
      frames[`${phase}:${depth}:${id}`] = { x, y, width: sprite.size[0], height: sprite.size[1], anchor: sprite.anchor };
    });
    row++;
  }
  writeFileSync(new URL('../assets/generated/biome.png', import.meta.url), encodePng(bitmap));
  writeFileSync(new URL('../assets/generated/biome.json', import.meta.url), JSON.stringify({ version: 1, id: source.id,
    width: bitmap.width, height: bitmap.height, frames }, null, 2) + '\n');
  for (const { id, path } of source.assetFiles) for (const phase of Object.keys(source.palettes)) {
    const sprite = source.sprites[id];
    const tile = createBitmap(...sprite.size);
    paintPixels(tile, sprite.pixels, biomePalette(source, phase, 'near'), 0, 0);
    const destination = new URL('../assets/generated/environment/' + path.replace(/\.json$/, '/' + phase.toLowerCase() + '.png'), import.meta.url);
    mkdirSync(new URL('.', destination), { recursive: true });
    writeFileSync(destination, encodePng(tile));
  }
  console.log(`Generated forest scenery: ${sprites.length} native sprites, three phases and three depth palettes.`);
}
