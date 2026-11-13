import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://lesateliersdustream.fr',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
  build: { format: 'file' },
  vite: { build: { cssTarget: 'safari15.4' } },
});
