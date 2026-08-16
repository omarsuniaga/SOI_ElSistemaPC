import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * InsigniaCelebrationOverlay.dynamicImport.test.js — Spec C-02
 * (openspec/changes/juego-gamificado-planificacion)
 *
 * "el código de Rive NUNCA se descarga... verificable por import() dinámico,
 * no import estático". Verificado dos veces en este cambio: acá, a nivel de
 * código fuente (no hay `import ... from '@rive-app/canvas-lite'` estático
 * en ningún archivo del portal); y manualmente vía `npm run build` — el
 * runtime de Rive queda en su propio chunk (`rive-*.js`), con 0 referencias
 * desde el chunk principal del portal (`main-maestros-*.js`).
 */

const OVERLAY_PATH = resolve(process.cwd(), 'src/portal-maestros/components/InsigniaCelebrationOverlay.js')
const GRADING_MODAL_PATH = resolve(process.cwd(), 'src/portal-maestros/components/IndicadorGradingModal.js')

let overlaySrc
let gradingModalSrc

beforeAll(() => {
  overlaySrc = readFileSync(OVERLAY_PATH, 'utf-8')
  gradingModalSrc = readFileSync(GRADING_MODAL_PATH, 'utf-8')
})

describe('Rive se carga solo vía import() dinámico', () => {
  it('InsigniaCelebrationOverlay.js no tiene un import estático de @rive-app/canvas-lite', () => {
    expect(overlaySrc).not.toMatch(/^import\s+.*from\s+['"]@rive-app\/canvas-lite['"]/m)
  })

  it('InsigniaCelebrationOverlay.js carga @rive-app/canvas-lite con import() dinámico', () => {
    expect(overlaySrc).toMatch(/await\s+import\(\s*['"]@rive-app\/canvas-lite['"]\s*\)/)
  })

  it('IndicadorGradingModal.js no importa InsigniaCelebrationOverlay.js de forma estática (solo import() dinámico)', () => {
    expect(gradingModalSrc).not.toMatch(/^import\s+.*from\s+['"]\.\/InsigniaCelebrationOverlay\.js['"]/m)
    expect(gradingModalSrc).toMatch(/await\s+import\(\s*['"]\.\/InsigniaCelebrationOverlay\.js['"]\s*\)/)
  })

  it('IndicadorGradingModal.js sigue importando gsap de forma estática (no es el mismo caso de uso: se anima en casi cada calificación, no solo cuando hay un logro nuevo)', () => {
    expect(gradingModalSrc).toMatch(/^import\s+gsap\s+from\s+['"]gsap['"]/m)
  })
})
