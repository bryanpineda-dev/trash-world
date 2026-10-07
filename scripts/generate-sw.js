import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../dist/', import.meta.url));
const files = [];
function collect(path, prefix = './') {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory()) collect(join(path, entry.name), `${prefix}${entry.name}/`);
    else if (entry.name !== 'sw.js') files.push(`${prefix}${entry.name}`);
  }
}
collect(directory);
files.sort();
const hash = createHash('sha256');
for (const file of files) hash.update(file).update(readFileSync(join(directory, file.slice(2))));
const template = readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8');
hash.update(template);
const worker = template.replace('__CACHE_NAME__', `trash-world-${hash.digest('hex').slice(0, 12)}`)
  .replace('__PRECACHE_ASSETS__', JSON.stringify(['./', ...files]));
writeFileSync(join(directory, 'sw.js'), worker);
console.log(`Offline cache: ${files.length} files.`);
