import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * MapaClaseView.test.js — Tarea 3.2 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Contenedor del mapa: resuelve los niveles asignados a la clase vía
 * acm_active_routes (REQ-01, scoping del selector de Nivel), sostiene el
 * toggle Diseñar Ruta / Dar Clase (REQ-02), y aplica el gate de asistencia
 * para Modo Sesión (REQ-03).
 */

vi.mock('../../services/mapaClaseService.js', () => ({
  obtenerNivelesAsignadosClase: vi.fn(),
  obtenerObjetivosPorClase: vi.fn(),
  obtenerEstrellasPorClase: vi.fn(),
  obtenerIndicadoresPorObjetivo: vi.fn(),
  obtenerIndicadoresPorClase: vi.fn(),
  obtenerClaseYMaestroParaExport: vi.fn(),
}))

vi.mock('../../domain/generarPdfRutaClase.js', () => ({
  buildRutaClasePdfEstructura: vi.fn(() => []),
  descargarPdfRutaClase: vi.fn(),
}))

vi.mock('../../../asistencias/api/asistenciasApi.js', () => ({
  obtenerAsistenciaDelDia: vi.fn(),
}))

let lastRender = null
vi.mock('../../components/MapaContenidoSVG.js', () => ({
  renderMapaContenidoSVG: vi.fn(({ nodos, modo, onNodeClick, onAddNodeClick }) => {
    lastRender = { nodos, modo, onNodeClick, onAddNodeClick }
  }),
}))

vi.mock('../../components/objetivoEditorModal.js', () => ({
  renderObjetivoEditorModal: vi.fn(),
}))

vi.mock('../../components/calificacionIndicadorPanel.js', () => ({
  renderCalificacionIndicadorPanel: vi.fn(),
}))

import {
  obtenerNivelesAsignadosClase,
  obtenerObjetivosPorClase,
  obtenerEstrellasPorClase,
  obtenerIndicadoresPorObjetivo,
  obtenerIndicadoresPorClase,
  obtenerClaseYMaestroParaExport,
} from '../../services/mapaClaseService.js'
import { obtenerAsistenciaDelDia } from '../../../asistencias/api/asistenciasApi.js'
import { renderObjetivoEditorModal } from '../../components/objetivoEditorModal.js'
import { renderCalificacionIndicadorPanel } from '../../components/calificacionIndicadorPanel.js'
import { buildRutaClasePdfEstructura, descargarPdfRutaClase } from '../../domain/generarPdfRutaClase.js'
import { renderMapaClaseView } from '../MapaClaseView.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

// El portal de maestros expone su router activo en window.router (ver main-maestros.js);
// las vistas de planificación lo usan en vez de un import estático para funcionar
// tanto en el portal de maestros como en ACM/admin.
const router = { navigate: vi.fn() }

const niveles = [{ id: 'level_A', nombre: 'Nivel 1' }]
const objetivos = [
  { id: 'o1', clase_id: 'clase-1', level_id: 'level_A', nombre: 'Objetivo 1', order_index: 0 },
]

describe('MapaClaseView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    lastRender = null
    vi.clearAllMocks()
    window.router = router

    obtenerNivelesAsignadosClase.mockResolvedValue(niveles)
    obtenerObjetivosPorClase.mockResolvedValue(objetivos)
    obtenerEstrellasPorClase.mockResolvedValue([])
    obtenerIndicadoresPorObjetivo.mockResolvedValue([])
    obtenerIndicadoresPorClase.mockResolvedValue([])
    obtenerClaseYMaestroParaExport.mockResolvedValue({ nombreClase: 'Violín Inicial', nombreMaestro: 'Ana Pérez' })
    obtenerAsistenciaDelDia.mockResolvedValue({ tomada: false, presentes: [] })
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('resuelve los niveles asignados a la clase vía acm_active_routes', async () => {
    await renderMapaClaseView(container, { claseId: 'clase-1' })
    await flush()

    expect(obtenerNivelesAsignadosClase).toHaveBeenCalledWith('clase-1')
  })

  it('bloquea la creación de nodos cuando la clase no tiene niveles asignados (REQ-01)', async () => {
    obtenerNivelesAsignadosClase.mockResolvedValue([])

    await renderMapaClaseView(container, { claseId: 'clase-1' })
    await flush()

    expect(container.textContent).toMatch(/no tiene unidades \(niveles\) asignadas/i)

    lastRender.onAddNodeClick()
    expect(renderObjetivoEditorModal).not.toHaveBeenCalled()
  })

  it('permite abrir el editor para crear un nuevo objetivo cuando hay niveles asignados', async () => {
    await renderMapaClaseView(container, { claseId: 'clase-1' })
    await flush()

    lastRender.onAddNodeClick()

    expect(renderObjetivoEditorModal).toHaveBeenCalledWith(
      expect.objectContaining({ claseId: 'clase-1', niveles, objetivo: null }),
    )
  })

  it('arranca en modo Diseño por defecto', async () => {
    await renderMapaClaseView(container, { claseId: 'clase-1' })
    await flush()

    expect(lastRender.modo).toBe('diseno')
  })

  it('modo Diseño: click en un nodo abre objetivoEditorModal con el objetivo seleccionado (REQ-02)', async () => {
    await renderMapaClaseView(container, { claseId: 'clase-1' })
    await flush()

    lastRender.onNodeClick({ id: 'o1', titulo: 'Objetivo 1' })

    expect(renderObjetivoEditorModal).toHaveBeenCalledWith(
      expect.objectContaining({ claseId: 'clase-1', objetivo: expect.objectContaining({ id: 'o1' }) }),
    )
  })

  it('bloquea el cambio a Dar Clase cuando la asistencia del día no está tomada y ofrece ir a asistencias (REQ-03)', async () => {
    obtenerAsistenciaDelDia.mockResolvedValue({ tomada: false, presentes: [] })

    await renderMapaClaseView(container, { claseId: 'clase-1' })
    await flush()

    container.querySelector('#btn-modo-sesion').click()
    await flush()

    expect(obtenerAsistenciaDelDia).toHaveBeenCalledWith(
      expect.objectContaining({ claseId: 'clase-1' }),
    )
    // No debe haber cambiado de modo — el SVG se re-renderiza siempre en modo diseno.
    expect(lastRender.modo).toBe('diseno')
    expect(container.textContent).toMatch(/asistencia/i)

    container.querySelector('#btn-ir-asistencias')?.click()
    expect(router.navigate).toHaveBeenCalledWith('asistencias')
  })

  it('permite el cambio a Dar Clase cuando la asistencia ya fue tomada (REQ-03)', async () => {
    obtenerAsistenciaDelDia.mockResolvedValue({
      tomada: true,
      presentes: [{ id: 'al-1', nombre: 'Ana Pérez' }],
    })

    await renderMapaClaseView(container, { claseId: 'clase-1' })
    await flush()

    container.querySelector('#btn-modo-sesion').click()
    await flush()

    expect(lastRender.modo).toBe('sesion')
  })

  describe('Modo Sesión: objetivo -> indicadores -> calificación', () => {
    async function entrarEnModoSesion() {
      obtenerAsistenciaDelDia.mockResolvedValue({
        tomada: true,
        presentes: [{ id: 'al-1', nombre: 'Ana Pérez' }],
      })
      await renderMapaClaseView(container, { claseId: 'clase-1', maestroId: 'maestro-1' })
      await flush()
      container.querySelector('#btn-modo-sesion').click()
      await flush()
    }

    it('click en un objetivo lista sus indicadores para elegir cuáles se cubrieron hoy', async () => {
      obtenerIndicadoresPorObjetivo.mockResolvedValue([
        { id: 'i1', objetivo_id: 'o1', descripcion: 'Indicador 1' },
        { id: 'i2', objetivo_id: 'o1', descripcion: 'Indicador 2' },
      ])

      await entrarEnModoSesion()
      lastRender.onNodeClick({ id: 'o1', titulo: 'Objetivo 1' })
      await flush()

      expect(obtenerIndicadoresPorObjetivo).toHaveBeenCalledWith('o1')
      expect(container.textContent).toContain('Indicador 1')
      expect(container.textContent).toContain('Indicador 2')
    })

    it('click en un indicador abre calificacionIndicadorPanel con los alumnos presentes del día', async () => {
      obtenerIndicadoresPorObjetivo.mockResolvedValue([
        { id: 'i1', objetivo_id: 'o1', descripcion: 'Indicador 1' },
      ])

      await entrarEnModoSesion()
      lastRender.onNodeClick({ id: 'o1', titulo: 'Objetivo 1' })
      await flush()

      container.querySelector('.btn-calificar-indicador[data-indicador-id="i1"]').click()

      expect(renderCalificacionIndicadorPanel).toHaveBeenCalledWith(
        expect.objectContaining({
          claseId: 'clase-1',
          claseIndicadorId: 'i1',
          indicadorDescripcion: 'Indicador 1',
          presentes: [{ id: 'al-1', nombre: 'Ana Pérez' }],
          evaluadoPor: 'maestro-1',
        }),
      )
    })
  })

  describe('Exportar a PDF (formalización académica)', () => {
    it('el botón está deshabilitado cuando la clase no tiene niveles asignados', async () => {
      obtenerNivelesAsignadosClase.mockResolvedValue([])

      await renderMapaClaseView(container, { claseId: 'clase-1' })
      await flush()

      expect(container.querySelector('#btn-exportar-pdf').disabled).toBe(true)
    })

    it('al hacer click, arma la estructura con los indicadores de TODA la clase y delega en descargarPdfRutaClase', async () => {
      const indicadoresDeLaClase = [{ id: 'i1', objetivo_id: 'o1', descripcion: 'Indicador 1' }]
      obtenerIndicadoresPorClase.mockResolvedValue(indicadoresDeLaClase)

      await renderMapaClaseView(container, { claseId: 'clase-1', maestroId: 'maestro-1' })
      await flush()

      container.querySelector('#btn-exportar-pdf').click()
      await flush()
      await flush()

      expect(obtenerIndicadoresPorClase).toHaveBeenCalledWith('clase-1')
      expect(obtenerClaseYMaestroParaExport).toHaveBeenCalledWith('clase-1')
      expect(buildRutaClasePdfEstructura).toHaveBeenCalledWith(niveles, objetivos, indicadoresDeLaClase, expect.any(Map))
      expect(descargarPdfRutaClase).toHaveBeenCalledWith(
        expect.objectContaining({ claseNombre: 'Violín Inicial', maestroNombre: 'Ana Pérez' }),
      )
    })

    it('si falla la carga de datos, muestra un error y no llama a descargarPdfRutaClase', async () => {
      obtenerIndicadoresPorClase.mockRejectedValue(new Error('network down'))

      await renderMapaClaseView(container, { claseId: 'clase-1' })
      await flush()

      container.querySelector('#btn-exportar-pdf').click()
      await flush()
      await flush()

      expect(descargarPdfRutaClase).not.toHaveBeenCalled()
      expect(container.querySelector('#btn-exportar-pdf').disabled).toBe(false)
    })
  })
})
