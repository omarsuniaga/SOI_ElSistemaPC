import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tools/unicode-reviewer/revisar-textos.test.mjs',
    ],
  },
});