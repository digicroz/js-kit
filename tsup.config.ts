import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  splitting: false,
  clean: true,
  treeshake: true,
  tsconfig: './tsconfig.json',
});
