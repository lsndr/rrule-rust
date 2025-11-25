import { defineConfig, mergeConfig } from 'vitest/config';
import config from './../../vitest.config';

// eslint-disable-next-line import-x/no-default-export -- vitest requires a default export
export default mergeConfig(
  config,
  defineConfig({
    test: {
      include: ['./tests/e2e/**/*.spec.ts'],
    },
  }),
);
