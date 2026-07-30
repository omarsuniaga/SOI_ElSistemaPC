/**
 * Tests de regresión para DisenadorCurricularView.js.
 *
 * Cubre dos bugs de threading de estado detectados en auditoría (C-2, M-7):
 *  - C-2 (Crítico): `estadoEstructura` no llegaba como parámetro a
 *    `_mostrarPanelEvaluacionAlumnos`, provocando un ReferenceError al tocar
 *    una estrella de calificación (rompía todo el flujo de evaluación).
 *  - M-7 (Mayor): `alumnosClase` se pasaba por valor a través de varias
 *    funciones; al cambiar de clase, la reasignación local en `_renderUI`
 *    no se propagaba a los closures ya registrados, dejando el panel de
 *    evaluación mostrando alumnos de la clase anterior.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../api/planificacionAdapter.js', () => ({
  obtenerClases: vi.fn(),
  crearPlanificacion: vi.fn(),
}))

vi.mock('../../services/realAlumnosService.js', () => ({
  obtenerAlumnosRealesPorClase: vi.fn(),
}))

vi.mock('../../services/aiEvaluacionService.js', () => ({
  sugerirRutaDidacticaIA: vi.fn(),
}))

vi.mock('../../api/offlineSyncAdapter.js', () => ({
  OfflineSyncAdapter: {
    guardarLocal: vi.fn(),
  },
}))

let lastOnNodeClick = null
vi.mock('../../components/MapaContenidoSVG.js', () => ({
  renderMapaContenidoSVG: vi.fn(({ onNodeClick }) => {
    lastOnNodeClick = onNodeClick
  }),
}))

import { obtenerClases } from '../../api/planificacionAdapter.js'
import { obtenerAlumnosRealesPorClase } from '../../services/realAlumnosService.js'
import { OfflineSyncAdapter } from '../../api/offlineSyncAdapter.js'
import { renderDisenadorCurricularView } from '../DisenadorCurricularView.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

describe('DisenadorCurricularView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    lastOnNodeClick = null
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('no lanza ReferenceError al tocar una estrella de calificación (regresión C-2)', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerAlumnosRealesPorClase.mockResolvedValue([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 0 }])

    await renderDisenadorCurricularView(container)
    await flush()

    expect(typeof lastOnNodeClick).toBe('function')

    // Simula el click en un nodo del mapa SVG, que abre el panel de evaluación.
    expect(() => lastOnNodeClick({ id: 'ind-1', titulo: 'Postura corporal equilibrada y relajada' })).not.toThrow()

    const fila = container.querySelector('.row-alumno-eval')
    expect(fila).toBeTruthy()

    // Regresión M-3: mientras se confirma el roster de ESTE nodo por red, la
    // fila queda deshabilitada — evita evaluar sobre el conteo base de otro
    // nodo. Se espera a que la consulta resuelva antes de interactuar.
    await flush()

    // Antes del fix: `estadoEstructura` no estaba definido en este handler y
    // tocar la estrella lanzaba ReferenceError, matando el flujo de evaluación.
    expect(() => container.querySelector('.row-alumno-eval').click()).not.toThrow()

    expect(OfflineSyncAdapter.guardarLocal).toHaveBeenCalledWith(
      expect.objectContaining({ alumnoId: 'al-1', claseId: 'clase-1', nodoId: 'ind-1', estrellas: 1 }),
    )
  })

  it('cicla la estrella de 5 a 0 usando IndicadorLogro.siguienteEstrella', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
    obtenerAlumnosRealesPorClase.mockResolvedValue([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 5 }])

    await renderDisenadorCurricularView(container)
    await flush()

    lastOnNodeClick({ id: 'ind-1', titulo: 'Nodo' })
    await flush() // espera a que se confirme el roster del nodo antes de evaluar
    container.querySelector('.row-alumno-eval').click()

    expect(OfflineSyncAdapter.guardarLocal).toHaveBeenCalledWith(
      expect.objectContaining({ estrellas: 0 }),
    )
  })

  it('actualiza el panel de evaluación con los alumnos de la nueva clase tras cambiar el selector (regresión M-7)', async () => {
    obtenerClases.mockResolvedValue([
      { id: 'clase-1', nombre: 'Violín Inicial' },
      { id: 'clase-2', nombre: 'Piano Avanzado' },
    ])
    obtenerAlumnosRealesPorClase.mockImplementation((claseId) => {
      if (claseId === 'clase-1') return Promise.resolve([{ id: 'al-1', nombre: 'Alumno Clase Uno', estrellas: 0 }])
      if (claseId === 'clase-2') return Promise.resolve([{ id: 'al-2', nombre: 'Alumno Clase Dos', estrellas: 0 }])
      return Promise.resolve([])
    })

    await renderDisenadorCurricularView(container)
    await flush()

    // Cambia la clase seleccionada en el dropdown.
    const select = container.querySelector('#select-clase-full')
    select.value = 'clase-2'
    select.dispatchEvent(new Event('change'))
    await flush()

    lastOnNodeClick({ id: 'ind-1', titulo: 'Nodo' })

    // Debe mostrar el alumno de la clase NUEVA, no el de la clase anterior (stale reference).
    expect(container.textContent).toContain('Alumno Clase Dos')
    expect(container.textContent).not.toContain('Alumno Clase Uno')
  })

  describe('cambio de nodo (regresión M-3 — integración)', () => {
    it('al seleccionar un nodo, vuelve a consultar el roster con el nodoId y repinta con esos datos', async () => {
      obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
      obtenerAlumnosRealesPorClase.mockImplementation((claseId, nodoId) => {
        if (nodoId === 'ind-2') {
          return Promise.resolve([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 5 }])
        }
        return Promise.resolve([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 0 }])
      })

      await renderDisenadorCurricularView(container)
      await flush()

      expect(obtenerAlumnosRealesPorClase).toHaveBeenCalledWith('clase-1')

      lastOnNodeClick({ id: 'ind-2', titulo: 'Nodo 2' })

      // Debe re-consultar el servicio ligado a este nodo puntual.
      expect(obtenerAlumnosRealesPorClase).toHaveBeenCalledWith('clase-1', 'ind-2')

      await flush()

      expect(container.querySelector('.row-alumno-eval').textContent).toContain('5/5★')
    })

    it('no repite la consulta de red al revisitar un nodo ya cacheado en la sesión', async () => {
      obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
      obtenerAlumnosRealesPorClase.mockResolvedValue([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 1 }])

      await renderDisenadorCurricularView(container)
      await flush()

      lastOnNodeClick({ id: 'ind-2', titulo: 'Nodo 2' })
      await flush()
      const llamadasTrasPrimeraVisita = obtenerAlumnosRealesPorClase.mock.calls.length

      lastOnNodeClick({ id: 'ind-3', titulo: 'Nodo 3' })
      await flush()
      lastOnNodeClick({ id: 'ind-2', titulo: 'Nodo 2' })
      await flush()

      expect(obtenerAlumnosRealesPorClase.mock.calls.length).toBe(llamadasTrasPrimeraVisita + 1)
    })

    it('bloquea la evaluación mientras se confirma el roster del nodo, y la habilita recién al resolver', async () => {
      obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
      let resolveNodo2
      obtenerAlumnosRealesPorClase.mockImplementation((claseId, nodoId) => {
        if (nodoId === 'ind-2') {
          return new Promise((resolve) => {
            resolveNodo2 = resolve
          })
        }
        return Promise.resolve([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 0 }])
      })

      await renderDisenadorCurricularView(container)
      await flush()

      lastOnNodeClick({ id: 'ind-2', titulo: 'Nodo 2' })
      await flush()

      // La consulta de ind-2 sigue en vuelo: la fila queda deshabilitada.
      const filaCargando = container.querySelector('.row-alumno-eval')
      expect(filaCargando.className).toContain('opacity-50')

      // Un click mientras se resuelve NO debe registrar evaluación — de lo
      // contrario se guardaría con el nodoId nuevo pero el conteo base del
      // roster genérico de clase (ver auditoría M-3).
      filaCargando.click()
      expect(OfflineSyncAdapter.guardarLocal).not.toHaveBeenCalled()

      resolveNodo2([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 3 }])
      await flush()

      const filaLista = container.querySelector('.row-alumno-eval')
      expect(filaLista.className).not.toContain('opacity-50')

      filaLista.click()
      expect(OfflineSyncAdapter.guardarLocal).toHaveBeenCalledWith(
        expect.objectContaining({ alumnoId: 'al-1', claseId: 'clase-1', nodoId: 'ind-2', estrellas: 4 }),
      )
    })

    it('descarta la respuesta obsoleta si el maestro cambia de nodo antes de que la consulta anterior resuelva', async () => {
      obtenerClases.mockResolvedValue([{ id: 'clase-1', nombre: 'Violín Inicial' }])
      let resolveNodo2
      obtenerAlumnosRealesPorClase.mockImplementation((claseId, nodoId) => {
        if (nodoId === 'ind-2') {
          return new Promise((resolve) => {
            resolveNodo2 = resolve
          })
        }
        if (nodoId === 'ind-3') {
          return Promise.resolve([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 2 }])
        }
        return Promise.resolve([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 0 }])
      })

      await renderDisenadorCurricularView(container)
      await flush()

      // Selecciona el nodo 2 (queda pendiente) y luego, antes de que resuelva,
      // cambia al nodo 3 (resuelve de inmediato).
      lastOnNodeClick({ id: 'ind-2', titulo: 'Nodo 2' })
      lastOnNodeClick({ id: 'ind-3', titulo: 'Nodo 3' })
      await flush()

      expect(container.querySelector('.row-alumno-eval').textContent).toContain('2/5★')

      // La respuesta tardía de ind-2 llega después: no debe pisar los datos
      // del nodo 3 ya confirmados en pantalla.
      resolveNodo2([{ id: 'al-1', nombre: 'Ana Pérez', estrellas: 5 }])
      await flush()

      expect(container.querySelector('.row-alumno-eval').textContent).toContain('2/5★')
      expect(container.querySelector('#lbl-nodo-eval-titulo').textContent).toContain('Nodo 3')
    })
  })
})
