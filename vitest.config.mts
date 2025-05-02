import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      exclude: [
        '/dist',
        '/node_modules',
        //'**/*.config.ts',
        '**/*.module.ts',
        '**/*.dto.ts',
      ],
      provider: 'v8',
    },
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
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
