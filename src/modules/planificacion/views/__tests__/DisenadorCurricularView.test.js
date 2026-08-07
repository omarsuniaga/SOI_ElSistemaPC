/**
 * Tests de DisenadorCurricularView.js — Tarea 3.6
 * (openspec/changes/mapa-gamificado-planificacion).
 *
 * Reescritura completa (design.md, Decisión 6 + Migration/Rollout §2): la
 * vista deja de serializar `objetivosEstructurados`/`esPlantillaOficial`
 * hacia `planificaciones` (campos fantasma que la base descartaba en
 * silencio — nunca hubo persistencia real) y pasa a ser el punto de
 * entrada de "Clonar desde catálogo" + "Generar con IA", que
 * persiste directamente en `clase_mapa_objetivos`/`clase_mapa_indicadores`
 * (REQ-14) en vez de quedar en un estado de demo en memoria.
 *
 * 2026-08-03: el árbol viejo (routes/route_versions/levels/nodes/objetivos/
 * indicators + mapa_plantillas) se reemplaza por un catálogo propio del mapa
 * gamificado (catalogo_niveles / catalogo_objetivos_generales /
 * catalogo_objetivos_especificos), clonado vía RPC clonar_catalogo_a_clase
 * (mapaClaseService.clonarCatalogoAClase). "Clonar desde plantilla" pasa a
 * ser "Clonar desde catálogo": ya no hay selector de plantilla, se clona
 * directamente el nivel elegido.
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
  clonarCatalogoAClase: vi.fn(),
  obtenerObjetivosPorClase: vi.fn(),
  crearObjetivo: vi.fn(),
  crearIndicador: vi.fn(),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { show: vi.fn() },
}))

vi.mock('../../components/objetivoEditorModal.js', () => ({
  renderObjetivoEditorModal: vi.fn(),
}))

import { obtenerClases, crearPlanificacion } from '../../api/planificacionAdapter.js'
import { sugerirRutaDidacticaIA } from '../../services/aiEvaluacionService.js'
import {
  obtenerNivelesAsignadosClase,
  clonarCatalogoAClase,
  obtenerObjetivosPorClase,
  crearObjetivo,
  crearIndicador,
} from '../../services/mapaClaseService.js'
import { AppToast } from '../../../../shared/components/AppToast.js'
import { renderObjetivoEditorModal } from '../../components/objetivoEditorModal.js'
import { renderDisenadorCurricularView } from '../DisenadorCurricularView.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

// El portal de maestros expone su router activo en window.router (ver main-maestros.js);
// las vistas de planificación lo usan en vez de un import estático para funcionar
// tanto en el portal de maestros como en ACM/admin.
const router = { navigate: vi.fn() }

describe('DisenadorCurricularView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
    window.router = router
    obtenerObjetivosPorClase.mockResolvedValue([])
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('carga clases y niveles del catálogo para la clase seleccionada', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])

    await renderDisenadorCurricularView(container)

    expect(obtenerNivelesAsignadosClase).toHaveBeenCalledWith('clase-1')
    const opciones = [...container.querySelectorAll('#select-nivel-clonar-disenador option')].map((o) => o.value)
    expect(opciones).toEqual(['level-A'])
    expect(container.querySelector('#btn-clonar-plantilla').disabled).toBe(false)
  })

  it('bloquea "Clonar" y "Generar con IA" si el catálogo no tiene niveles para el instrumento de la clase', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([])

    await renderDisenadorCurricularView(container)

    expect(container.textContent).toContain('no hay niveles cargados en el catálogo')
    expect(container.querySelector('#btn-clonar-plantilla').disabled).toBe(true)
    expect(container.querySelector('#btn-generar-ia').disabled).toBe(true)
  })

  it('"Clonar a esta clase" invoca clonarCatalogoAClase y vuelve al mapa de la clase al tener éxito', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    clonarCatalogoAClase.mockResolvedValue([{ objetivo_id: 'o1' }])

    await renderDisenadorCurricularView(container)
    await container.querySelector('#btn-clonar-plantilla').click()
    await flush()

    expect(clonarCatalogoAClase).toHaveBeenCalledWith('clase-1', 'level-A')
    expect(AppToast.show).toHaveBeenCalledWith(expect.stringContaining('clonado'), 'success')
    // Vuelve al mapa de ESTA clase (no 'planificacion-acm', ruta que ni
    // siquiera existe en el router de Portal Maestros) para que el maestro
    // vea de inmediato lo que acaba de clonar.
    expect(router.navigate).toHaveBeenCalledWith('planificacion-mapa-clase?clase=clase-1')
  })

  it('muestra un error y no navega si clonarCatalogoAClase falla (ej. SOI-CAT-02)', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    clonarCatalogoAClase.mockRejectedValue(new Error('SOI-CAT-02: nivel de catálogo no existe o está inactivo'))

    await renderDisenadorCurricularView(container)
    await container.querySelector('#btn-clonar-plantilla').click()
    await flush()

    expect(AppToast.show).toHaveBeenCalledWith(expect.stringContaining('SOI-CAT-02'), 'error')
    expect(router.navigate).not.toHaveBeenCalled()
    expect(container.querySelector('#btn-clonar-plantilla').disabled).toBe(false)
  })

  it('"Generar Mapeo con IA" crea los objetivos/indicadores sugeridos directamente en el mapa de la clase, con orden_objetivo consecutivo', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    obtenerObjetivosPorClase.mockResolvedValue([
      { level_id: 'level-A', orden_objetivo: 3 },
      { level_id: 'otro-nivel', orden_objetivo: 99 }, // de otro nivel, no debe contar
    ])
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
    expect(crearObjetivo).toHaveBeenCalledWith({
      clase_id: 'clase-1',
      level_id: 'level-A',
      nombre: 'Postura',
      orden_objetivo: 4, // MAX(orden_objetivo) del nivel (3) + 1
      created_by: null, // sin maestroId en este test (comportamiento ACM) — ver renderDisenadorCurricularView
    })
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
    expect(router.navigate).toHaveBeenCalledWith('planificacion-mapa-clase?clase=clase-1')
  })

  it('al cambiar de clase, recarga los niveles del catálogo de la nueva clase', async () => {
    obtenerClases.mockResolvedValue([
      { id: 'clase-1', nombre: 'Violín Inicial' },
      { id: 'clase-2', nombre: 'Piano Avanzado' },
    ])
    obtenerNivelesAsignadosClase.mockImplementation((claseId) => {
      if (claseId === 'clase-2') return Promise.resolve([{ id: 'level-B', nombre: 'Nivel 1' }])
      return Promise.resolve([{ id: 'level-A', nombre: 'Nivel 2' }])
    })

    await renderDisenadorCurricularView(container)

    const select = container.querySelector('#select-clase-disenador')
    select.value = 'clase-2'
    select.dispatchEvent(new Event('change'))
    await flush()

    expect(obtenerNivelesAsignadosClase).toHaveBeenCalledWith('clase-2')
    expect(container.querySelector('#select-nivel-ia-disenador').textContent).toContain('Nivel 1')
  })

  it('precarga la clase recibida por parámetro en vez de defaultear siempre a la primera de la lista', async () => {
    obtenerClases.mockResolvedValue([
      { id: 'clase-1', nombre: 'Violín Inicial' },
      { id: 'clase-2', nombre: 'Piano Avanzado' },
    ])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-B', nombre: 'Nivel 1' }])

    await renderDisenadorCurricularView(container, { claseId: 'clase-2' })

    expect(obtenerNivelesAsignadosClase).toHaveBeenCalledWith('clase-2')
    expect(container.querySelector('#select-clase-disenador').value).toBe('clase-2')
  })

  it('ignora un claseId que no pertenece a ninguna clase del maestro y cae al default', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])

    await renderDisenadorCurricularView(container, { claseId: 'clase-de-otro-maestro' })

    expect(obtenerNivelesAsignadosClase).toHaveBeenCalledWith('clase-1')
  })

  it('"Nuevo Objetivo" pasa el maestroId de la sesión al modal — antes quedaba siempre null (autoría indistinguible de ACM)', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])

    await renderDisenadorCurricularView(container, { maestroId: 'maestro-77' })
    container.querySelector('#btn-nuevo-objetivo').click()

    expect(renderObjetivoEditorModal).toHaveBeenCalledWith(
      expect.objectContaining({ claseId: 'clase-1', maestroId: 'maestro-77', objetivo: null }),
    )
  })

  it('"Generar Mapeo con IA" atribuye los objetivos creados al maestroId de la sesión', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    obtenerObjetivosPorClase.mockResolvedValue([])
    sugerirRutaDidacticaIA.mockResolvedValue([{ id: 'obj-1', titulo: 'Postura', indicadores: [] }])
    crearObjetivo.mockResolvedValue({ id: 'objetivo-creado-1' })

    await renderDisenadorCurricularView(container, { maestroId: 'maestro-77' })
    await container.querySelector('#btn-generar-ia').click()
    await flush()
    await flush()

    expect(crearObjetivo).toHaveBeenCalledWith(expect.objectContaining({ created_by: 'maestro-77' }))
  })

  it('nunca llama a crearPlanificacion (ya no serializa objetivosEstructurados/esPlantillaOficial)', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerNivelesAsignadosClase.mockResolvedValue([{ id: 'level-A', nombre: 'Nivel 2' }])
    clonarCatalogoAClase.mockResolvedValue([])

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
