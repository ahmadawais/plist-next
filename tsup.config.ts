import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'node18',
  },
  {
    entry: { cli: 'cli/index.ts' },
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: false,
    target: 'node18',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
