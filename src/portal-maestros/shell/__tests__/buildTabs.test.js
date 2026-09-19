import { describe, it, expect, afterEach, vi } from 'vitest'
import { buildTabs } from '../buildTabs.js'

const ids = (tabs) => tabs.map((t) => t.id)

describe('buildTabs · módulo piloto Repertorio/Seccional', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('maestro FUERA del piloto (flag apagado): no ve Repertorio ni Seccional', () => {
    vi.stubEnv('VITE_REPERTOIRE_ENABLED', 'false')
    expect(ids(buildTabs({}, 'm1'))).toEqual(['fechas', 'hoy', 'planificacion', 'metricas'])
  })

  it('flag prendido pero maestro NO está en la lista: tampoco los ve', () => {
    vi.stubEnv('VITE_REPERTOIRE_ENABLED', 'true')
    vi.stubEnv('VITE_REPERTOIRE_PILOT_MAESTRO_IDS', 'otro-1,otro-2')
    const tabs = ids(buildTabs({}, 'm1'))
    expect(tabs).not.toContain('repertorio')
    expect(tabs).not.toContain('seccional')
  })

  it('sin maestroId: no ve el módulo piloto', () => {
    vi.stubEnv('VITE_REPERTOIRE_ENABLED', 'true')
    vi.stubEnv('VITE_REPERTOIRE_PILOT_MAESTRO_IDS', 'm1')
    expect(ids(buildTabs({}, null))).not.toContain('seccional')
  })

  it('maestro del piloto: ve Repertorio y Seccional, en ese orden', () => {
    vi.stubEnv('VITE_REPERTOIRE_ENABLED', 'true')
    vi.stubEnv('VITE_REPERTOIRE_PILOT_MAESTRO_IDS', 'm1')
    expect(ids(buildTabs({}, 'm1'))).toEqual([
      'fechas', 'hoy', 'planificacion', 'metricas', 'repertorio', 'seccional',
    ])
  })

  it('la pestaña Clases (permiso) sigue al final, con o sin piloto', () => {
    vi.stubEnv('VITE_REPERTOIRE_ENABLED', 'false')
    expect(ids(buildTabs({ puede_inscribir_clases: true }, 'm1')).at(-1)).toBe('gestionar-clases')

    vi.stubEnv('VITE_REPERTOIRE_ENABLED', 'true')
    vi.stubEnv('VITE_REPERTOIRE_PILOT_MAESTRO_IDS', 'm1')
    expect(ids(buildTabs({ puede_inscribir_clases: true }, 'm1')).at(-1)).toBe('gestionar-clases')
  })
})
