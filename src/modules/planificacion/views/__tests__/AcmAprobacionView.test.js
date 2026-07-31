import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * AcmAprobacionView.test.js — Tarea 3.7 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Decisión 6 (design.md): `esPlantillaOficial` en `planificaciones` es un
 * campo fantasma — la base lo descarta silenciosamente (nunca existió como
 * columna). El único mecanismo real de plantilla semilla ahora es
 * `mapa_plantillas` (REQ-10, Tarea 3.6). Este archivo MUST NOT leer ni
 * escribir `esPlantillaOficial`, y el botón "Hacer Plantilla" que prometía
 * promocionar un plan a plantilla oficial (sin hacerlo realmente) MUST
 * desaparecer — dejarlo habría mantenido la mentira sobre otro campo.
 */

vi.mock('../../api/planificacionAdapter.js', () => ({
  obtenerPlanificacionesConDetalles: vi.fn(),
  actualizarPlanificacion: vi.fn(),
  marcarRevisadasMasivo: vi.fn(),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { show: vi.fn() },
}))

vi.mock('../../components/JustificacionDesfaseModal.js', () => ({
  openJustificacionDesfaseModal: vi.fn(),
}))

vi.mock('../../../../core/router/router.js', () => ({
  router: { navigate: vi.fn() },
}))

import {
  obtenerPlanificacionesConDetalles,
  actualizarPlanificacion,
} from '../../api/planificacionAdapter.js'
import { renderAcmAprobacionView } from '../AcmAprobacionView.js'

describe('AcmAprobacionView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('never renders a "Hacer Plantilla" / promocionar-plantilla button (Decisión 6 — phantom field removed)', async () => {
    obtenerPlanificacionesConDetalles.mockResolvedValue([
      { id: 'plan-1', titulo: 'Plan A', estado: 'revisada', clase_id: 'clase-1' },
    ])

    await renderAcmAprobacionView(container)

    expect(container.querySelector('.btn-promocionar-plantilla')).toBeFalsy()
    expect(container.textContent).not.toContain('Hacer Plantilla')
  })

  it('Aprobar never sends esPlantillaOficial in the payload', async () => {
    obtenerPlanificacionesConDetalles.mockResolvedValue([
      { id: 'plan-1', titulo: 'Plan A', estado: 'revisada', clase_id: 'clase-1' },
    ])
    actualizarPlanificacion.mockResolvedValue({})

    await renderAcmAprobacionView(container)
    await container.querySelector('.btn-aprobar-plan').click()
    await Promise.resolve()

    expect(actualizarPlanificacion).toHaveBeenCalledWith('plan-1', { estado: 'publicada' })
    const [, payload] = actualizarPlanificacion.mock.calls[0]
    expect(payload).not.toHaveProperty('esPlantillaOficial')
  })

  describe('Decisión 6 — structural guard (source-level)', () => {
    const SOURCE_PATH = resolve(process.cwd(), 'src/modules/planificacion/views/AcmAprobacionView.js')
    const source = readFileSync(SOURCE_PATH, 'utf-8')

    it('never references esPlantillaOficial', () => {
      expect(source).not.toMatch(/esPlantillaOficial/)
    })
  })
})
