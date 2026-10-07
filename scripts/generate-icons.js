import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compileCatalog } from '../src/rendering/AssetModel.js';
import { readAssetSource } from './asset-source.js';
import { createBitmap, encodePng, paintPixels, rgba } from './png.js';

const directory = fileURLToPath(new URL('../public/icons/', import.meta.url));
mkdirSync(directory, { recursive: true });

const catalog = compileCatalog(readAssetSource());
const base = createBitmap(64, 64, rgba('#d4e9df'));
for (let y = 54; y < 64; y++) {
  for (let x = 0; x < 64; x++) base.data.set(rgba(y === 54 ? '#68815b' : '#b57d68'), (y * 64 + x) * 4);
}
paintPixels(base, catalog.frames['part:skull:rest'].pixels, catalog.palette, 12, 10, 2);

function makeIcon(size) {
  const bitmap = createBitmap(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (Math.floor(y * 64 / size) * 64 + Math.floor(x * 64 / size)) * 4;
      bitmap.data.set(base.data.subarray(offset, offset + 4), (y * size + x) * 4);
    }
  }
  return encodePng(bitmap);
}

for (const size of [192, 512]) writeFileSync(`${directory}/icon-${size}.png`, makeIcon(size));
writeFileSync(`${directory}/icon-maskable-512.png`, makeIcon(512));
