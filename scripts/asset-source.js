import { readFileSync } from 'node:fs';

export function readAssetSource() {
  const read = name => JSON.parse(readFileSync(new URL(`../assets/source/${name}.json`, import.meta.url), 'utf8'));
  return { style: read('style'), parts: read('parts'), characters: read('characters'), animations: read('animations') };
}
