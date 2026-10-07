import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const base = 'https://trash.test/app/';
function worker() {
  const stored = new Map([[`${base}index.html`, new Response('world')], [`${base}asset-lab.html`, new Response('lab')]]);
  const handlers = {};
  let online = true;
  runInNewContext(readFileSync(new URL('../scripts/sw-template.js', import.meta.url), 'utf8'), {
    URL, __PRECACHE_ASSETS__: [],
    self: { location: new URL(`${base}sw.js`), registration: { scope: base }, addEventListener: (name, fn) => { handlers[name] = fn; } },
    fetch: async request => {
      if (!online) throw new Error('offline');
      return new Response(request.url.includes('asset-lab.html') ? 'new lab' : 'new world');
    },
    caches: {
      open: async () => ({ put: async (key, response) => { stored.set(key, response); } }),
      match: async key => stored.get(typeof key === 'string' ? key : key.url)?.clone(),
    },
  });
  return {
    stored,
    offline: () => { online = false; },
    navigate: async path => {
      const pending = [];
      let response;
      handlers.fetch({ request: { method: 'GET', mode: 'navigate', url: base + path },
        waitUntil: promise => pending.push(promise), respondWith: promise => { response = promise; } });
      assert.ok(response, 'worker must intercept scoped navigation');
      const result = await response;
      await Promise.all(pending);
      return result.text();
    },
  };
}

test('visiting the asset lab never replaces the offline world shell', async () => {
  const sw = worker();
  assert.equal(await sw.navigate('asset-lab.html?preview=1'), 'new lab');
  assert.equal(await sw.stored.get(`${base}index.html`).clone().text(), 'world');
  sw.offline();
  assert.equal(await sw.navigate(''), 'world');
  assert.equal(await sw.navigate('asset-lab.html'), 'new lab');
});

test('root navigation updates only the world and keeps lab fallback independent', async () => {
  const sw = worker();
  assert.equal(await sw.navigate('?session=1'), 'new world');
  assert.equal(await sw.stored.get(`${base}asset-lab.html`).clone().text(), 'lab');
  sw.offline();
  assert.equal(await sw.navigate('index.html'), 'new world');
  assert.equal(await sw.navigate('asset-lab.html?preview=2'), 'lab');
  assert.equal(await sw.navigate('unknown-path'), 'new world');
});
