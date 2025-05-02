import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    environment: 'node',
  },
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
      '@config': resolve(__dirname, './src/config'),
      '@common': resolve(__dirname, './src/common'),
      src: resolve(__dirname, './src'),
    },
  },
});
