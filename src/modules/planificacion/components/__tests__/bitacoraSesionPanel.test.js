import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * bitacoraSesionPanel.test.js — Tarea 3.5 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Texto libre por sesión + 3 toggles independientes (tareas_enviadas,
 * incidencia_comportamiento, clase_no_realizada — cada uno con su campo de
 * detalle opcional) + botón "profesionalizar con IA" que MUST mostrar la
 * versión reescrita para revisión antes de guardar (REQ-11).
 *
 * REQ-12 (regla dura): este panel NO debe leer ni escribir
 * evaluacion_indicador / clase_mapa_indicadores / indicators bajo ninguna
 * circunstancia — cero acoplamiento con el cálculo de estrellas. Se verifica
 * con un guard estructural sobre el código fuente, igual que el patrón ya
 * usado para las migraciones SQL (Decisión 7, migration.sesionBitacora.test.js).
 */

vi.mock('../../services/bitacoraSesionService.js', () => ({
  guardarBitacora: vi.fn(),
  guardarTextoProfesionalizado: vi.fn(),
}))

vi.mock('../../services/aiEvaluacionService.js', () => ({
  profesionalizarBitacoraIA: vi.fn(),
}))

import {
  guardarBitacora,
  guardarTextoProfesionalizado,
} from '../../services/bitacoraSesionService.js'
import { profesionalizarBitacoraIA } from '../../services/aiEvaluacionService.js'
import { renderBitacoraSesionPanel } from '../bitacoraSesionPanel.js'

describe('bitacoraSesionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  function open(overrides = {}) {
    renderBitacoraSesionPanel({
      sesionId: 'sesion_001',
      claseId: 'clase_001',
      maestroId: 'mae_001',
      ...overrides,
    })
    return document.querySelector('.bitacora-panel-overlay')
  }

  it('renders a free-text field and the three independent toggles', () => {
    const overlay = open()

    expect(overlay).toBeTruthy()
    expect(overlay.querySelector('#bitacora-texto-libre')).toBeTruthy()
    expect(overlay.querySelector('#bitacora-toggle-tareas')).toBeTruthy()
    expect(overlay.querySelector('#bitacora-toggle-incidencia')).toBeTruthy()
    expect(overlay.querySelector('#bitacora-toggle-no-realizada')).toBeTruthy()
  })

  it('shows the detalle field for a toggle only once it is checked', () => {
    const overlay = open()

    expect(overlay.querySelector('#bitacora-detalle-tareas')).toBeFalsy()

    overlay.querySelector('#bitacora-toggle-tareas').checked = true
    overlay.querySelector('#bitacora-toggle-tareas').dispatchEvent(new Event('change'))

    expect(overlay.querySelector('#bitacora-detalle-tareas')).toBeTruthy()
  })

  it('the three toggles are independent — checking one does not affect the others', () => {
    const overlay = open()

    overlay.querySelector('#bitacora-toggle-incidencia').checked = true
    overlay.querySelector('#bitacora-toggle-incidencia').dispatchEvent(new Event('change'))

    expect(overlay.querySelector('#bitacora-detalle-incidencia')).toBeTruthy()
    expect(overlay.querySelector('#bitacora-detalle-tareas')).toBeFalsy()
    expect(overlay.querySelector('#bitacora-toggle-no-realizada').checked).toBe(false)
  })

  it('Guardar calls guardarBitacora with texto libre + toggles + detalles', async () => {
    guardarBitacora.mockResolvedValue({ id: 'sb_001' })
    const onSaved = vi.fn()
    const overlay = open({ onSaved })

    overlay.querySelector('#bitacora-texto-libre').value = 'Buena clase, avanzamos con escalas.'
    overlay.querySelector('#bitacora-toggle-tareas').checked = true
    overlay.querySelector('#bitacora-toggle-tareas').dispatchEvent(new Event('change'))
    overlay.querySelector('#bitacora-detalle-tareas').value = 'Escala de Do, 2 octavas'

    await overlay.querySelector('.bitacora-panel-guardar-btn').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(guardarBitacora).toHaveBeenCalledWith('sesion_001', expect.objectContaining({
      clase_id: 'clase_001',
      maestro_id: 'mae_001',
      texto_libre: 'Buena clase, avanzamos con escalas.',
      tareas_enviadas: true,
      tareas_detalle: 'Escala de Do, 2 octavas',
      incidencia_comportamiento: false,
      clase_no_realizada: false,
    }))
    expect(onSaved).toHaveBeenCalled()
  })

  it('"profesionalizar con IA" shows the rewritten text for review, does not auto-save', async () => {
    profesionalizarBitacoraIA.mockResolvedValue('Versión profesional del texto.')
    const overlay = open()

    overlay.querySelector('#bitacora-texto-libre').value = 'el alumno vino distraido hoy'
    await overlay.querySelector('.bitacora-panel-ia-btn').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(profesionalizarBitacoraIA).toHaveBeenCalledWith('el alumno vino distraido hoy')
    expect(overlay.querySelector('.bitacora-ia-preview').textContent).toContain('Versión profesional del texto.')
    // REQ-11: no debe persistir solo por generar la versión IA.
    expect(guardarTextoProfesionalizado).not.toHaveBeenCalled()
  })

  it('accepting the IA preview persists it via guardarTextoProfesionalizado with aceptadoPorMaestro: true', async () => {
    profesionalizarBitacoraIA.mockResolvedValue('Versión profesional del texto.')
    guardarTextoProfesionalizado.mockResolvedValue({ id: 'sb_001', texto_ia: 'Versión profesional del texto.' })
    const overlay = open()

    overlay.querySelector('#bitacora-texto-libre').value = 'texto original'
    await overlay.querySelector('.bitacora-panel-ia-btn').click()
    await Promise.resolve()
    await Promise.resolve()

    await overlay.querySelector('.bitacora-ia-aceptar-btn').click()
    await Promise.resolve()
    await Promise.resolve()

    expect(guardarTextoProfesionalizado).toHaveBeenCalledWith(
      'sesion_001',
      'Versión profesional del texto.',
      { aceptadoPorMaestro: true },
    )
  })

  it('discarding the IA preview does not persist anything', async () => {
    profesionalizarBitacoraIA.mockResolvedValue('Versión profesional del texto.')
    const overlay = open()

    overlay.querySelector('#bitacora-texto-libre').value = 'texto original'
    await overlay.querySelector('.bitacora-panel-ia-btn').click()
    await Promise.resolve()
    await Promise.resolve()

    overlay.querySelector('.bitacora-ia-descartar-btn').click()

    expect(overlay.querySelector('.bitacora-ia-preview')).toBeFalsy()
    expect(guardarTextoProfesionalizado).not.toHaveBeenCalled()
  })

  it('closes via the close-x button and calls onClosed', () => {
    const onClosed = vi.fn()
    const overlay = open({ onClosed })

    overlay.querySelector('.bitacora-panel-close-x').click()

    expect(document.querySelector('.bitacora-panel-overlay')).toBeFalsy()
    expect(onClosed).toHaveBeenCalled()
  })

  describe('REQ-12 — structural isolation guard (source-level)', () => {
    const SOURCE_PATH = resolve(process.cwd(), 'src/modules/planificacion/components/bitacoraSesionPanel.js')
    let source

    beforeEach(() => {
      try {
        source = readFileSync(SOURCE_PATH, 'utf-8')
      } catch {
        source = null
      }
    })

    it('exists', () => {
      expect(source).not.toBeNull()
    })

    it('never imports or references evaluacionClaseService, mapaClaseService objetivo/indicador CRUD, or the forbidden table tokens', () => {
      expect(source).not.toMatch(/evaluacionClaseService/)
      expect(source).not.toMatch(/registrarEvaluacion/)
      expect(source).not.toMatch(/clase_mapa_indicadores/)
      expect(source).not.toMatch(/evaluacion_indicador/)
      // "indicators" y "indicador(es)" como concepto de negocio (no forma
      // parte del vocabulario de la bitácora libre en absoluto).
      expect(source).not.toMatch(/\bindicador(es)?\b/i)
    })
  })
})
