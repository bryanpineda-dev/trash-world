import { readFileSync } from 'node:fs';
import { assembleBiome } from '../src/rendering/BiomeModel.js';

export function readBiomeSource() {
  const root = new URL('../assets/source/', import.meta.url);
  const index = JSON.parse(readFileSync(new URL('biome.json', root), 'utf8'));
  return assembleBiome(index, path => JSON.parse(readFileSync(new URL('environment/' + path, root), 'utf8')));
}
