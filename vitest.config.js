import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/modules/clases/**/*.test.js', 'src/modules/planificacion/**/*.test.js', 'tests/**/*.test.js'],
    exclude: ['src/modules/metricas/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/modules/clases/**/*.js', 'src/modules/planificacion/**/*.js', 'src/portal-maestros/**/*.js'],
    },
  },
})