/**
 * Tests de DisenadorCurricularView.js — Tarea 3.6
 * (openspec/changes/mapa-gamificado-planificacion).
 *
 * Reescritura completa (design.md, Decisión 6 + Migration/Rollout §2): la
 * vista deja de serializar `objetivosEstructurados`/`esPlantillaOficial`
 * hacia `planificaciones` (campos fantasma que la base descartaba en
 * silencio — nunca hubo persistencia real) y pasa a ser el punto de
 * entrada de "Clonar desde plantilla" (REQ-10) + "Generar con IA", que
 * ahora persiste directamente en `clase_mapa_objetivos`/`clase_mapa_indicadores`
 * (REQ-14) en vez de quedar en un estado de demo en memoria.
 *
 * Los tests de regresión previos (C-2/M-7/M-3) cubrían el editor de
 * objetivos/indicadores en memoria + ciclado de estrellas vía
 * `IndicadorLogro`/`OfflineSyncAdapter` — exactamente la maqueta de "semillas
 * en memoria, nunca persistidas" que Migration/Rollout §2 de design.md
 * ordena eliminar con esta reescritura. Se reemplazan por los tests de la
 * nueva superficie.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

vi.mock('../../api/planificacionAdapter.js', () => ({
  obtenerClases: vi.fn(),
  crearPlanificacion: vi.fn(),
}))

vi.mock('../../services/aiEvaluacionService.js', () => ({
  sugerirRutaDidacticaIA: vi.fn(),
}))

vi.mock('../../services/mapaClaseService.js', () => ({
  obtenerNivelesAsignadosClase: vi.fn(),
  obtenerPlantillasDisponibles: vi.fn(),
  clonarPlantillaAClase: vi.fn(),
  crearObjetivo: vi.fn(),
  crearIndicador: vi.fn(),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { show: vi.fn() },
}))

vi.mock('../../../../core/router/router.js', () => ({
  router: { navigate: vi.fn() },
}))

import { obtenerClases, crearPlanificacion } from '../../api/planificacionAdapter.js'
import { sugerirRutaDidacticaIA } from '../../services/aiEvaluacionService.js'
import {
  obtenerNivelesAsignadosClase,
  obtenerPlantillasDisponibles,
  clonarPlantillaAClase,
  crearObjetivo,
  crearIndicador,
} from '../../services/mapaClaseService.js'
import { AppToast } from '../../../../shared/components/AppToast.js'
import { router } from '../../../../core/router/router.js'
import { renderDisenadorCurricularView } from '../DisenadorCurricularView.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

describe('DisenadorCurricularView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('carga clases, niveles asignados y plantillas compatibles con esos niveles', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    obtenerPlantillasDisponibles.mockResolvedValue([
      { id: 'plantilla-1', nombre: 'Violín Nivel 2', instrumento: 'Violín', level_id: 'level-A' },
      { id: 'plantilla-2', nombre: 'Piano Nivel 1', instrumento: 'Piano', level_id: 'level-otro' },
    ])

    await renderDisenadorCurricularView(container)

    expect(obtenerNivelesAsignadosClase).toHaveBeenCalledWith('clase-1')
    const opciones = [...container.querySelectorAll('#select-plantilla-disenador option')].map((o) => o.value)
    expect(opciones).toEqual(['plantilla-1'])
    expect(container.querySelector('#btn-clonar-plantilla').disabled).toBe(false)
  })

  it('bloquea "Clonar" y "Generar con IA" si la clase no tiene niveles asignados (REQ-01)', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([])
    obtenerPlantillasDisponibles.mockResolvedValue([])

    await renderDisenadorCurricularView(container)

    expect(container.textContent).toContain('no tiene niveles asignados')
    expect(container.querySelector('#btn-clonar-plantilla').disabled).toBe(true)
    expect(container.querySelector('#btn-generar-ia').disabled).toBe(true)
  })

  it('"Clonar a esta clase" invoca clonarPlantillaAClase y navega a planificacion-acm al tener éxito', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    obtenerPlantillasDisponibles.mockResolvedValue([
      { id: 'plantilla-1', nombre: 'Violín Nivel 2', instrumento: 'Violín', level_id: 'level-A' },
    ])
    clonarPlantillaAClase.mockResolvedValue([{ objetivo_id: 'o1' }])

    await renderDisenadorCurricularView(container)
    await container.querySelector('#btn-clonar-plantilla').click()
    await flush()

    expect(clonarPlantillaAClase).toHaveBeenCalledWith('clase-1', 'plantilla-1')
    expect(AppToast.show).toHaveBeenCalledWith(expect.stringContaining('clonada'), 'success')
    expect(router.navigate).toHaveBeenCalledWith('planificacion-acm')
  })

  it('muestra un error y no navega si clonarPlantillaAClase falla (ej. SOI-MAPA-02)', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    obtenerPlantillasDisponibles.mockResolvedValue([
      { id: 'plantilla-1', nombre: 'Violín Nivel 2', instrumento: 'Violín', level_id: 'level-A' },
    ])
    clonarPlantillaAClase.mockRejectedValue(new Error('SOI-MAPA-02: nivel no asignado a la clase'))

    await renderDisenadorCurricularView(container)
    await container.querySelector('#btn-clonar-plantilla').click()
    await flush()

    expect(AppToast.show).toHaveBeenCalledWith(expect.stringContaining('SOI-MAPA-02'), 'error')
    expect(router.navigate).not.toHaveBeenCalled()
    expect(container.querySelector('#btn-clonar-plantilla').disabled).toBe(false)
  })

  it('"Generar Mapeo con IA" crea los objetivos/indicadores sugeridos directamente en el mapa de la clase', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    obtenerPlantillasDisponibles.mockResolvedValue([])
    sugerirRutaDidacticaIA.mockResolvedValue([
      { id: 'obj-1', titulo: 'Postura', indicadores: [{ id: 'ind-1', titulo: 'Postura corporal' }, 'Emisión sonora libre'] },
    ])
    crearObjetivo.mockResolvedValue({ id: 'objetivo-creado-1' })
    crearIndicador.mockResolvedValue({ id: 'indicador-creado-1' })

    await renderDisenadorCurricularView(container)
    await container.querySelector('#btn-generar-ia').click()
    await flush()
    await flush()

    expect(sugerirRutaDidacticaIA).toHaveBeenCalledWith({ instrumento: 'Violín Inicial', nivelIndex: 0 })
    expect(crearObjetivo).toHaveBeenCalledWith({ clase_id: 'clase-1', level_id: 'level-A', nombre: 'Postura' })
    expect(crearIndicador).toHaveBeenCalledWith({
      objetivo_id: 'objetivo-creado-1',
      clase_id: 'clase-1',
      descripcion: 'Postura corporal',
    })
    expect(crearIndicador).toHaveBeenCalledWith({
      objetivo_id: 'objetivo-creado-1',
      clase_id: 'clase-1',
      descripcion: 'Emisión sonora libre',
    })
    expect(router.navigate).toHaveBeenCalledWith('planificacion-acm')
  })

  it('al cambiar de clase, recarga niveles y plantillas de la nueva clase', async () => {
    obtenerClases.mockResolvedValue([
      { id: 'clase-1', nombre: 'Violín Inicial' },
      { id: 'clase-2', nombre: 'Piano Avanzado' },
    ])
    obtenerNivelesAsignadosClase.mockImplementation((claseId) => {
      if (claseId === 'clase-2') return Promise.resolve([{ id: 'level-B', nombre: 'Nivel 1' }])
      return Promise.resolve([{ id: 'level-A', nombre: 'Nivel 2' }])
    })
    obtenerPlantillasDisponibles.mockResolvedValue([])

    await renderDisenadorCurricularView(container)

    const select = container.querySelector('#select-clase-disenador')
    select.value = 'clase-2'
    select.dispatchEvent(new Event('change'))
    await flush()

    expect(obtenerNivelesAsignadosClase).toHaveBeenCalledWith('clase-2')
    expect(container.querySelector('#select-nivel-ia-disenador').textContent).toContain('Nivel 1')
  })

  it('nunca llama a crearPlanificacion (ya no serializa objetivosEstructurados/esPlantillaOficial)', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    obtenerPlantillasDisponibles.mockResolvedValue([
      { id: 'plantilla-1', nombre: 'Violín Nivel 2', instrumento: 'Violín', level_id: 'level-A' },
    ])
    clonarPlantillaAClase.mockResolvedValue([])

    await renderDisenadorCurricularView(container)
    await container.querySelector('#btn-clonar-plantilla').click()
    await flush()

    expect(crearPlanificacion).not.toHaveBeenCalled()
  })

  describe('Decisión 6 / REQ-10 — structural guard (source-level)', () => {
    const SOURCE_PATH = resolve(process.cwd(), 'src/modules/planificacion/views/DisenadorCurricularView.js')
    const source = readFileSync(SOURCE_PATH, 'utf-8')

    it('never references esPlantillaOficial or objetivosEstructurados', () => {
      expect(source).not.toMatch(/esPlantillaOficial/)
      expect(source).not.toMatch(/objetivosEstructurados/)
    })
  })
})
