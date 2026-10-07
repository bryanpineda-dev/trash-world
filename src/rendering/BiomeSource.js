import index from '../../assets/source/biome.json';
import { assembleBiome } from './BiomeModel.js';

const files = import.meta.glob('../../assets/source/environment/**/*.json', { eager: true, import: 'default' });
export const biomeSource = assembleBiome(index, path => files['../../assets/source/environment/' + path]);
