import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // process.chdir() (used by tests/core/analyze.test.ts) is unsupported
    // inside worker threads; forks are separate processes and support it.
    pool: 'forks',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.ts', 'tests/**/*.ts'],
    },
  },
});
