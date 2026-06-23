import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.js', 'tests/**/*.test.js'],
    exclude: [],
    coverage: { provider: "custom", reporter: [], enabled: false },
  },
})