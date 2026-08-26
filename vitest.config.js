import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,ts}', 'tests/**/*.test.{js,ts}'],
    exclude: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/modules/clases/**/*.js', 'src/modules/planificacion/**/*.js', 'src/modules/config/**/*.js', 'src/modules/metricas/**/*.js', 'src/modules/observaciones/**/*.js', 'src/portal-maestros/**/*.js'],
    },
  },
})