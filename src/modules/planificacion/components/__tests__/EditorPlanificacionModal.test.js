import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * EditorPlanificacionModal.test.js — Tarea 3.7 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Decisión 6 (design.md): `esPlantillaOficial` en `planificaciones` es un
 * campo fantasma que la base descarta silenciosamente. Este componente
 * MUST NOT enviarlo en el payload de `crearPlanificacion`/`actualizarPlanificacion`.
 */

let capturedConfig = null

vi.mock('../../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn((cfg) => {
      capturedConfig = cfg
    }),
    close: vi.fn(),
  },
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { show: vi.fn(), info: vi.fn() },
}))

vi.mock('../../api/planificacionAdapter.js', () => ({
  crearPlanificacion: vi.fn(),
  actualizarPlanificacion: vi.fn(),
  obtenerClases: vi.fn(),
}))

vi.mock('../../services/aiEvaluacionService.js', () => ({
  sugerirRutaDidacticaIA: vi.fn(),
}))

vi.mock('../MapaContenidoSVG.js', () => ({
  renderMapaContenidoSVG: vi.fn(),
}))

import { crearPlanificacion, actualizarPlanificacion, obtenerClases } from '../../api/planificacionAdapter.js'
import { openEditorPlanificacionModal } from '../EditorPlanificacionModal.js'

describe('EditorPlanificacionModal', () => {
  beforeEach(() => {
    capturedConfig = null
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('crea una planificación nueva sin enviar esPlantillaOficial en el payload', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    crearPlanificacion.mockResolvedValue({ id: 'plan-nuevo' })

    await openEditorPlanificacionModal({ esACM: true })

    expect(capturedConfig).toBeTruthy()
    document.body.innerHTML = capturedConfig.body
    document.body.querySelector('#editor-plan-clase').value = 'clase-1'
    document.body.querySelector('#editor-plan-titulo').value = 'Ruta Semestral'

    const result = await capturedConfig.onSave()

    expect(result).toBe(true)
    expect(crearPlanificacion).toHaveBeenCalledTimes(1)
    const [payload] = crearPlanificacion.mock.calls[0]
    expect(payload).not.toHaveProperty('esPlantillaOficial')
  })

  it('actualiza una planificación existente sin enviar esPlantillaOficial en el payload', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    actualizarPlanificacion.mockResolvedValue({ id: 'plan-1' })

    await openEditorPlanificacionModal({
      plan: { id: 'plan-1', clase_id: 'clase-1', titulo: 'Plan existente', estado: 'borrador' },
      esACM: false,
    })

    document.body.innerHTML = capturedConfig.body
    document.body.querySelector('#editor-plan-clase').value = 'clase-1'
    document.body.querySelector('#editor-plan-titulo').value = 'Plan existente editado'

    await capturedConfig.onSave()

    expect(actualizarPlanificacion).toHaveBeenCalledTimes(1)
    const [, payload] = actualizarPlanificacion.mock.calls[0]
    expect(payload).not.toHaveProperty('esPlantillaOficial')
  })

  describe('Decisión 6 — structural guard (source-level)', () => {
    const SOURCE_PATH = resolve(process.cwd(), 'src/modules/planificacion/components/EditorPlanificacionModal.js')
    const source = readFileSync(SOURCE_PATH, 'utf-8')

    it('never references esPlantillaOficial', () => {
      expect(source).not.toMatch(/esPlantillaOficial/)
    })
  })
})
