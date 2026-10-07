import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compileCatalog, validateCatalog } from '../src/rendering/AssetModel.js';
import { readAssetSource } from './asset-source.js';
import { createBitmap, paintPixels, rgba, encodePng } from './png.js';

const source = readAssetSource();
validateCatalog(source);
if (process.argv.includes('--check')) {
  console.log(`Style valid: ${source.style.id}; ${Object.keys(source.parts).length} parts; ${Object.keys(source.animations.clips).length} shared clips.`);
  process.exit(0);
}

const catalog = compileCatalog(source);
const entries = Object.entries(catalog.frames);
const cellWidth = Math.max(...entries.map(([, frame]) => frame.pixels[0].length)) + 4;
const cellHeight = Math.max(...entries.map(([, frame]) => frame.pixels.length)) + 4;
const columns = 8;
const atlas = createBitmap(columns * cellWidth, Math.ceil(entries.length / columns) * cellHeight);
const frames = {};
entries.forEach(([id, frame], index) => {
  const x = index % columns * cellWidth + 2;
  const y = Math.floor(index / columns) * cellHeight + 2;
  paintPixels(atlas, frame.pixels, catalog.palette, x, y);
  frames[id] = { x, y, width: frame.pixels[0].length, height: frame.pixels.length, anchor: frame.anchor, bounds: frame.bounds };
});
const output = fileURLToPath(new URL('../assets/generated/', import.meta.url));
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/atlas.png`, encodePng(atlas));
writeFileSync(`${output}/atlas.json`, JSON.stringify({ version: 1, style: catalog.style, width: atlas.width, height: atlas.height,
  palette: catalog.palette, states: catalog.states, characters: catalog.characters, objects: catalog.objects, frames }, null, 2) + '\n');

const preview = createBitmap(1024, 848, rgba('#e6efeb'));
const poses = ['stand', 'walk-a', 'walk-pass-a', 'walk-b', 'sleep-drowsy', 'sleep-drop', 'sleep-bounce', 'sleep'];
poses.forEach((pose, index) => {
  paintPixels(preview, catalog.frames[`miga:${pose}`].pixels, catalog.palette,
    32 + index % 4 * 256, 16 + Math.floor(index / 4) * 232, 3);
});
writeFileSync(`${output}/animation-review.png`, encodePng({ ...preview, height: 480, data: preview.data.subarray(0, 1024 * 480 * 4) }));
const ground = 708;
paintPixels(preview, ['g'.repeat(1024)], catalog.palette, 0, ground);
for (const [id, x] of [['miga:stand', 100], ['object:plant:rest', 250], ['object:lantern:rest', 390],
  ['object:rune:lit', 560], ['object:tree:rest', 826]]) {
  const frame = catalog.frames[id];
  paintPixels(preview, frame.pixels, catalog.palette, x - frame.anchor[0] * 3, ground - frame.anchor[1] * 3, 3);
}
Object.keys(catalog.palette).forEach((key, index) => {
  paintPixels(preview, Array(5).fill(key.repeat(5)), catalog.palette, 40 + index % 8 * 120,
    756 + Math.floor(index / 8) * 42, 6);
});
writeFileSync(`${output}/style-kit.png`, encodePng(preview));
const sprite = createBitmap(512, 512);
paintPixels(sprite, catalog.frames['miga:wave-a'].pixels, catalog.palette, 0, 0, 8);
writeFileSync(`${output}/miga.png`, encodePng(sprite));
console.log(`Generated ${entries.length} atlas frames, ${Object.keys(catalog.characters).length} character, ${Object.keys(source.animations.clips).length} animation clips.`);
