import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * objetivoEditorModal.test.js — Tarea 3.3 (openspec/changes/mapa-gamificado-planificacion)
 *
 * CRUD de objetivo + sus indicadores usando mapaClaseService.js (ya existe,
 * Tarea 2.2). REQ-09 / Decisión 4 (design.md): al intentar borrar algo con
 * evaluaciones asociadas, mapaClaseService ya traduce el Postgres 23503 en
 * `RequiereArchivarError` — este modal MUST capturarlo y ofrecer "Archivar"
 * en vez de fallar en silencio.
 */

const {
  RequiereArchivarError,
  crearObjetivo,
  actualizarObjetivo,
  archivarObjetivo,
  eliminarObjetivo,
  crearIndicador,
  obtenerIndicadoresPorObjetivo,
  obtenerObjetivosPorClase,
  actualizarIndicador,
  archivarIndicador,
  eliminarIndicador,
} = vi.hoisted(() => {
  class RequiereArchivarError extends Error {
    constructor(entidad) {
      super(`No se puede borrar: tiene evaluaciones asociadas. Archivar en su lugar (${entidad}).`)
      this.name = 'RequiereArchivarError'
      this.code = 'REQUIERE_ARCHIVAR'
      this.entidad = entidad
    }
  }

  return {
    RequiereArchivarError,
    crearObjetivo: vi.fn(),
    actualizarObjetivo: vi.fn(),
    archivarObjetivo: vi.fn(),
    eliminarObjetivo: vi.fn(),
    crearIndicador: vi.fn(),
    obtenerIndicadoresPorObjetivo: vi.fn(),
    obtenerObjetivosPorClase: vi.fn(() => Promise.resolve([])),
    actualizarIndicador: vi.fn(),
    archivarIndicador: vi.fn(),
    eliminarIndicador: vi.fn(),
  }
})

vi.mock('../../services/mapaClaseService.js', () => ({
  crearObjetivo,
  actualizarObjetivo,
  archivarObjetivo,
  eliminarObjetivo,
  crearIndicador,
  obtenerIndicadoresPorObjetivo,
  obtenerObjetivosPorClase,
  actualizarIndicador,
  archivarIndicador,
  eliminarIndicador,
  RequiereArchivarError,
}))

import { renderObjetivoEditorModal } from '../objetivoEditorModal.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

const niveles = [
  { id: 'level_A', nombre: 'Nivel 1' },
  { id: 'level_B', nombre: 'Nivel 2' },
]

describe('objetivoEditorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    obtenerIndicadoresPorObjetivo.mockResolvedValue([])
    document.querySelectorAll('.objetivo-editor-modal-overlay').forEach((el) => el.remove())
  })

  afterEach(() => {
    document.querySelectorAll('.objetivo-editor-modal-overlay').forEach((el) => el.remove())
  })

  describe('modo creación (objetivo=null)', () => {
    it('renders the nivel select scoped to the niveles passed by the container (REQ-01)', () => {
      renderObjetivoEditorModal({ claseId: 'clase-1', niveles })

      const select = document.querySelector('#objetivo-editor-nivel')
      const options = [...select.querySelectorAll('option')].map((o) => o.value)
      expect(options).toEqual(['level_A', 'level_B'])
    })

    it('blocks node creation and shows a warning when niveles is empty (REQ-01 scenario)', () => {
      renderObjetivoEditorModal({ claseId: 'clase-1', niveles: [] })

      expect(document.querySelector('.objetivo-editor-guardar-btn').disabled).toBe(true)
      expect(document.body.textContent).toMatch(/no tiene unidades \(niveles\) asignadas/i)
    })

    it('Guardar calls crearObjetivo with the form data and fires onSaved', async () => {
      crearObjetivo.mockResolvedValue({ id: 'o-nuevo', clase_id: 'clase-1', level_id: 'level_A', nombre: 'La 3ra posición' })
      const onSaved = vi.fn()

      renderObjetivoEditorModal({ claseId: 'clase-1', niveles, onSaved })

      document.querySelector('#objetivo-editor-nombre').value = 'La 3ra posición'
      document.querySelector('#objetivo-editor-nivel').value = 'level_A'
      document.querySelector('.objetivo-editor-guardar-btn').click()
      await flush()

      expect(crearObjetivo).toHaveBeenCalledWith(
        expect.objectContaining({ clase_id: 'clase-1', level_id: 'level_A', nombre: 'La 3ra posición' }),
      )
      expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 'o-nuevo' }))
    })
  })

  describe('modo edición (objetivo provisto)', () => {
    const objetivo = { id: 'o1', clase_id: 'clase-1', level_id: 'level_A', nombre: 'Escalas', descripcion: 'Do mayor' }

    it('prefills nombre/descripcion from the objetivo', () => {
      renderObjetivoEditorModal({ claseId: 'clase-1', niveles, objetivo })

      expect(document.querySelector('#objetivo-editor-nombre').value).toBe('Escalas')
      expect(document.querySelector('#objetivo-editor-descripcion').value).toBe('Do mayor')
    })

    it('Guardar calls actualizarObjetivo (not crearObjetivo) with the objetivo id', async () => {
      actualizarObjetivo.mockResolvedValue({ ...objetivo, nombre: 'Escalas Mayores' })

      renderObjetivoEditorModal({ claseId: 'clase-1', niveles, objetivo })
      document.querySelector('#objetivo-editor-nombre').value = 'Escalas Mayores'
      document.querySelector('.objetivo-editor-guardar-btn').click()
      await flush()

      expect(actualizarObjetivo).toHaveBeenCalledWith('o1', expect.objectContaining({ nombre: 'Escalas Mayores' }))
      expect(crearObjetivo).not.toHaveBeenCalled()
    })

    it('loads and lists the indicadores of the objetivo', async () => {
      obtenerIndicadoresPorObjetivo.mockResolvedValue([
        { id: 'i1', objetivo_id: 'o1', descripcion: 'Afinación limpia', es_requerido: true },
        { id: 'i2', objetivo_id: 'o1', descripcion: 'Postura', es_requerido: true },
      ])

      renderObjetivoEditorModal({ claseId: 'clase-1', niveles, objetivo })
      await flush()

      const rows = document.querySelectorAll('.objetivo-editor-indicador-row')
      expect(rows.length).toBe(2)
      expect(document.body.textContent).toContain('Afinación limpia')
    })

    it('agregar indicador calls crearIndicador and re-renders the list', async () => {
      obtenerIndicadoresPorObjetivo
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 'i1', objetivo_id: 'o1', descripcion: 'Nuevo indicador', es_requerido: true }])
      crearIndicador.mockResolvedValue({ id: 'i1', objetivo_id: 'o1', descripcion: 'Nuevo indicador' })

      renderObjetivoEditorModal({ claseId: 'clase-1', niveles, objetivo })
      await flush()

      document.querySelector('#objetivo-editor-nuevo-indicador').value = 'Nuevo indicador'
      document.querySelector('.objetivo-editor-agregar-indicador-btn').click()
      await flush()

      expect(crearIndicador).toHaveBeenCalledWith(
        expect.objectContaining({ objetivo_id: 'o1', clase_id: 'clase-1', descripcion: 'Nuevo indicador' }),
      )
      expect(document.body.textContent).toContain('Nuevo indicador')
    })

    it('borra un indicador sin evaluaciones directamente (hard delete)', async () => {
      obtenerIndicadoresPorObjetivo
        .mockResolvedValueOnce([{ id: 'i1', objetivo_id: 'o1', descripcion: 'Indicador libre', es_requerido: true }])
        .mockResolvedValueOnce([])
      eliminarIndicador.mockResolvedValue(undefined)

      renderObjetivoEditorModal({ claseId: 'clase-1', niveles, objetivo })
      await flush()

      document.querySelector('.objetivo-editor-indicador-row .btn-borrar-indicador').click()
      await flush()

      expect(eliminarIndicador).toHaveBeenCalledWith('i1')
      expect(document.querySelectorAll('.objetivo-editor-indicador-row').length).toBe(0)
    })

    it('REQ-09: al borrar un indicador con evaluaciones (23503), ofrece "Archivar" en vez de fallar en silencio', async () => {
      obtenerIndicadoresPorObjetivo.mockResolvedValue([
        { id: 'i1', objetivo_id: 'o1', descripcion: 'Indicador evaluado', es_requerido: true },
      ])
      eliminarIndicador.mockRejectedValue(new RequiereArchivarError('indicador'))

      renderObjetivoEditorModal({ claseId: 'clase-1', niveles, objetivo })
      await flush()

      document.querySelector('.objetivo-editor-indicador-row .btn-borrar-indicador').click()
      await flush()

      // No debe fallar en silencio: debe ofrecer explícitamente archivar.
      const archivarBtn = document.querySelector('.objetivo-editor-indicador-row .btn-archivar-indicador')
      expect(archivarBtn).toBeTruthy()
      expect(document.body.textContent).toMatch(/archivar/i)

      archivarIndicador.mockResolvedValue({ id: 'i1', archived_at: new Date().toISOString() })
      archivarBtn.click()
      await flush()

      expect(archivarIndicador).toHaveBeenCalledWith('i1')
    })

    it('REQ-09: al borrar el objetivo con evaluaciones (23503), ofrece "Archivar" en vez de fallar en silencio', async () => {
      eliminarObjetivo.mockRejectedValue(new RequiereArchivarError('objetivo'))

      renderObjetivoEditorModal({ claseId: 'clase-1', niveles, objetivo })
      await flush()

      document.querySelector('.objetivo-editor-borrar-objetivo-btn').click()
      await flush()

      const archivarBtn = document.querySelector('.objetivo-editor-archivar-objetivo-btn')
      expect(archivarBtn).toBeTruthy()

      archivarObjetivo.mockResolvedValue({ id: 'o1', archived_at: new Date().toISOString() })
      archivarBtn.click()
      await flush()

      expect(archivarObjetivo).toHaveBeenCalledWith('o1')
    })
  })

  it('cierra el modal al hacer click en el botón de cerrar', () => {
    renderObjetivoEditorModal({ claseId: 'clase-1', niveles })
    expect(document.querySelector('.objetivo-editor-modal-overlay')).toBeTruthy()

    document.querySelector('.objetivo-editor-modal-close-x').click()

    expect(document.querySelector('.objetivo-editor-modal-overlay')).toBeFalsy()
  })
})
