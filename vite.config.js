import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: './',
  build: {
    target: 'chrome80',
    rolldownOptions: {
      input: {
        world: fileURLToPath(new URL('./index.html', import.meta.url)),
        assets: fileURLToPath(new URL('./asset-lab.html', import.meta.url)),
      },
    },
  },
});
