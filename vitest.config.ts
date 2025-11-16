import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import-x/no-default-export -- vitest requires a default export
export default defineConfig({
  test: {
    setupFiles: ['./tests/__setup/matchers.ts'],
  },
});
