import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/__tests__/**/*.test.js', 'src/lib/**/*.test.js', 'src/modules/clases/**/*.test.js', 'src/modules/planificacion/**/*.test.js', 'src/modules/config/**/*.test.js', 'src/modules/admin-aprobacion/**/*.test.js', 'src/modules/programas/**/*.test.js', 'src/modules/asistencias/**/*.test.js', 'src/modules/progresos/**/*.test.js', 'src/portal-maestros/**/*.test.js', 'src/components/**/*.test.js', 'src/services/**/*.test.js', 'src/middleware/**/*.test.js', 'tests/**/*.test.js'],
    exclude: ['src/modules/metricas/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/modules/clases/**/*.js', 'src/modules/planificacion/**/*.js', 'src/modules/config/**/*.js', 'src/portal-maestros/**/*.js'],
    },
  },
})