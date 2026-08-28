import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Windows child-process workers can time out during startup; worker threads avoid that path.
    pool: 'threads',
    maxWorkers: 1,
  },
});
