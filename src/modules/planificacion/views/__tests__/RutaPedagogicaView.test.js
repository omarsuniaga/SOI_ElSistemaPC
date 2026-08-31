/**
 * Tests para RutaPedagogicaView.js — regresión del bug C-4 (1-Tap Star
 * Evaluator incrementaba 2 estrellas por click en vez de 1).
 *
 * Causa raíz: el listener de click se adjuntaba tanto al botón
 * `.btn-evaluar-one-tap` como a su fila ancestro `.row-alumno-ruta`
 * (querySelectorAll('.btn-evaluar-one-tap, .row-alumno-ruta').forEach(...)).
 * Un click en el botón disparaba el mismo handler una vez como target
 * directo y otra vez al burbujear hacia la fila — doble incremento, saltando
 * los valores impares del ciclo 0→1→2→3→4→5→0.
 *
 * Fix: un único listener delegado en el <tbody id="tbody-alumnos-ruta">.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../api/planificacionAdapter.js', () => ({
  obtenerClases: vi.fn(),
  obtenerPlanificacionesConDetalles: vi.fn(),
}))

vi.mock('../../services/realAlumnosService.js', () => ({
  obtenerAlumnosRealesPorClase: vi.fn(),
}))

vi.mock('../../api/offlineSyncAdapter.js', () => ({
  OfflineSyncAdapter: {
    guardarLocal: vi.fn(),
    eliminarDeCola: vi.fn(),
    obtenerCola: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../../services/evaluacionClaseService.js', () => ({
  registrarEvaluacion: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../api/routeAdapter.js', () => ({
  getFullHierarchy: vi.fn(),
}))

vi.mock('../../../../portal-maestros/services/maestroDataService.js', () => ({
  getMisClases: vi.fn().mockResolvedValue([]),
}))

let lastOnNodeClick = null
let lastRenderArgs = null
vi.mock('../../components/MapaContenidoSVG.js', () => ({
  renderMapaContenidoSVG: vi.fn((args) => {
    lastRenderArgs = args
    const { onNodeClick } = args
    lastOnNodeClick = onNodeClick
  }),
}))

import { obtenerClases, obtenerPlanificacionesConDetalles } from '../../api/planificacionAdapter.js'
import { getFullHierarchy } from '../../api/routeAdapter.js'
import { obtenerAlumnosRealesPorClase } from '../../services/realAlumnosService.js'
import { OfflineSyncAdapter } from '../../api/offlineSyncAdapter.js'
import { registrarEvaluacion } from '../../services/evaluacionClaseService.js'
import { getMisClases } from '../../../../portal-maestros/services/maestroDataService.js'
import { renderRutaPedagogicaView } from '../RutaPedagogicaView.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

const mockClase = { id: 'clase-1', nombre: 'Violín Nivel 1' }

function mockAlumno(overrides = {}) {
  return {
    id: 'al-1',
    nombre: 'Ana Pérez',
    estrellas: 0,
    presente: true,
    idia: 80,
    ...overrides,
  }
}

describe('RutaPedagogicaView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    lastOnNodeClick = null
    vi.clearAllMocks()

    const mockModalInstance = {
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    }
    globalThis.bootstrap = {
      Modal: class {
        constructor() {
          return mockModalInstance
        }
        static getInstance() {
          return mockModalInstance
        }
      }
    }

    obtenerClases.mockResolvedValue([mockClase])
    obtenerPlanificacionesConDetalles.mockResolvedValue([])
    getFullHierarchy.mockResolvedValue([])
    getMisClases.mockResolvedValue([])
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('la ruta ya no expone la acción de crear unidad desde el mapa SVG', async () => {
    obtenerAlumnosRealesPorClase.mockResolvedValue([])
    await renderRutaPedagogicaView(container)
    await flush()

    expect(lastRenderArgs).not.toHaveProperty('onAddUnidad')
  })

  it('si se abre una clase de otro maestro, usa esa clase explícita y no cae a la primera de mis clases', async () => {
    getMisClases.mockResolvedValue([
      { id: 'clase-cello', nombre: 'Clase de violoncellos' },
    ])
    obtenerClases.mockResolvedValue([
      { id: 'clase-cello', nombre: 'Clase de violoncellos' },
      { id: 'clase-violin-ajena', nombre: 'Violín Maestro 2' },
    ])
    getFullHierarchy.mockResolvedValue([
      {
        id: 'nivel-violin-ajena',
        level_number: 1,
        name: 'Ruta Violín Maestro 2',
        nodes: [
          {
            id: 'node-violin-ajena',
            name: 'Arco',
            objetivos: [
              {
                id: 'obj-violin-ajena',
                nombre: 'Arco afinado',
                indicators: [{ id: 'ind-violin-ajena', description: 'Controla el arco con precisión' }],
              },
            ],
          },
        ],
      },
    ])
    obtenerAlumnosRealesPorClase.mockResolvedValue([])

    await renderRutaPedagogicaView(container, { claseId: 'clase-violin-ajena' })
    await flush()

    expect(obtenerClases).toHaveBeenCalled()
    expect(getFullHierarchy).toHaveBeenCalledWith('clase-violin-ajena')
    expect(lastRenderArgs.nodos).toHaveLength(1)
    expect(lastRenderArgs.nodos[0].id).toBe('ind-violin-ajena')
    expect(lastRenderArgs.nodos.some((nodo) => String(nodo.titulo).includes('violoncellos'))).toBe(false)
  })

  it('cuando la clase no tiene plan propio, no reutiliza nodos de otra clase y cae a su jerarqu?a curricular', async () => {
    const clases = [
      { id: 'clase-cello', nombre: 'Clase de violoncellos' },
      { id: 'clase-violin', nombre: 'Viol?n Nivel 1' },
    ]

    obtenerClases.mockResolvedValue(clases)
    obtenerPlanificacionesConDetalles.mockResolvedValue([
      {
        id: 'plan-cello',
        clase_id: 'clase-cello',
        objetivosEstructurados: [
          {
            id: 'unidad-cello',
            titulo: 'Unidad Violoncellos',
            objetivos: [
              {
                id: 'obj-cello',
                titulo: 'Arco de violoncellos',
                indicadores: [{ id: 'ind-cello', titulo: 'Nodo de violoncellos' }],
              },
            ],
          },
        ],
      },
    ])
    getFullHierarchy.mockResolvedValue([
      {
        id: 'nivel-violin',
        level_number: 1,
        name: 'T?cnica de Viol?n',
        nodes: [
          {
            id: 'node-violin',
            name: 'Arco',
            objetivos: [
              {
                id: 'obj-violin',
                nombre: 'Arco estable',
                indicators: [{ id: 'ind-violin', description: 'Mantiene arco estable' }],
              },
            ],
          },
        ],
      },
    ])
    obtenerAlumnosRealesPorClase.mockResolvedValue([])

    await renderRutaPedagogicaView(container, { claseId: 'clase-violin' })
    await flush()

    expect(getFullHierarchy).toHaveBeenCalledWith('clase-violin')
    expect(lastRenderArgs.nodos).toHaveLength(1)
    expect(lastRenderArgs.nodos[0].id).toBe('ind-violin')
    expect(String(lastRenderArgs.nodos[0].titulo)).toContain('Arco estable')
    expect(String(lastRenderArgs.nodos[0].titulo)).toContain('Mantiene arco estable')
    expect(lastRenderArgs.nodos.some((nodo) => String(nodo.titulo).includes('violoncellos'))).toBe(false)
  })

  it('si hay varios planes para la misma clase, prioriza el que tiene unidades estructuradas', async () => {
    obtenerClases.mockResolvedValue([{ id: 'clase-violin', nombre: 'Viol?n Nivel 1' }])
    obtenerPlanificacionesConDetalles.mockResolvedValue([
      {
        id: 'plan-simple',
        clase_id: 'clase-violin',
        maestro_id: 'maestro-1',
        tema: 'Plan simple',
        contenido: 'Texto plano sin unidades',
        estado: 'activa',
        updated_at: '2026-08-05T12:00:00Z',
      },
      {
        id: 'plan-estructurado',
        clase_id: 'clase-violin',
        maestro_id: 'maestro-1',
        estado: 'borrador',
        updated_at: '2026-08-04T12:00:00Z',
        objetivosEstructurados: [
          {
            id: 'u-1',
            titulo: 'Unidad real',
            objetivos: [
              {
                id: 'o-1',
                titulo: 'Objetivo real',
                indicadores: [{ id: 'i-1', titulo: 'Indicador real' }],
              },
            ],
          },
        ],
      },
    ])
    obtenerAlumnosRealesPorClase.mockResolvedValue([])

    await renderRutaPedagogicaView(container, { claseId: 'clase-violin', maestroId: 'maestro-1' })
    await flush()

    expect(obtenerPlanificacionesConDetalles).toHaveBeenCalledWith('maestro-1')
    expect(lastRenderArgs.nodos.some((nodo) => String(nodo.titulo).includes('Unidad real'))).toBe(true)
    expect(lastRenderArgs.nodos.some((nodo) => String(nodo.titulo).includes('Texto plano'))).toBe(false)
  })

  it('un solo click en el botón "Ciclar ★" incrementa la evaluación en exactamente 1 estrella (no 2)', async () => {
    const alumno = mockAlumno({ estrellas: 0 })
    obtenerAlumnosRealesPorClase.mockResolvedValue([alumno])

    await renderRutaPedagogicaView(container)
    await flush()

    lastOnNodeClick({ id: 'nd-1', titulo: 'Nodo 1' })
    await flush()

    const btn = document.querySelector('.btn-evaluar-one-tap[data-id="al-1"]')
    expect(btn).toBeTruthy()

    btn.click()

    // Si el bug reapareciera, el click en el botón burbujearía también hacia
    // la fila y el handler se ejecutaría dos veces => estrellas === 2.
    expect(alumno.estrellas).toBe(1)
    expect(OfflineSyncAdapter.guardarLocal).toHaveBeenCalledTimes(1)
    expect(OfflineSyncAdapter.guardarLocal).toHaveBeenCalledWith(
      expect.objectContaining({ alumnoId: 'al-1', claseId: 'clase-1', estrellas: 1 }),
    )
  })

  it('clicks sucesivos ciclan 0→1→2→3→4→5→0 sin saltarse valores impares', async () => {
    const alumno = mockAlumno({ estrellas: 0 })
    obtenerAlumnosRealesPorClase.mockResolvedValue([alumno])

    await renderRutaPedagogicaView(container)
    await flush()

    lastOnNodeClick({ id: 'nd-1', titulo: 'Nodo 1' })
    await flush()

    const secuencia = []
    for (let i = 0; i < 7; i++) {
      // _renderTbody() reemplaza el <tbody>.innerHTML tras cada tap (fix
      // m-2: repintado parcial), lo que reemplaza el nodo del botón —
      // hay que volver a consultarlo en cada vuelta, no reusar la referencia.
      const btn = document.querySelector('.btn-evaluar-one-tap[data-id="al-1"]')
      btn.click()
      secuencia.push(alumno.estrellas)
    }

    expect(secuencia).toEqual([1, 2, 3, 4, 5, 0, 1])
  })

  it('un click directo en la fila (fuera del botón) también evalúa exactamente 1 estrella', async () => {
    const alumno = mockAlumno({ estrellas: 2 })
    obtenerAlumnosRealesPorClase.mockResolvedValue([alumno])

    await renderRutaPedagogicaView(container)
    await flush()

    lastOnNodeClick({ id: 'nd-1', titulo: 'Nodo 1' })
    await flush()

    const row = document.querySelector('.row-alumno-modal-eval[data-id="al-1"]')
    expect(row).toBeTruthy()

    row.click()

    expect(alumno.estrellas).toBe(3)
  })

  it('no evalúa alumnos ausentes (presente: false) al hacer click', async () => {
    const alumno = mockAlumno({ estrellas: 0, presente: false })
    obtenerAlumnosRealesPorClase.mockResolvedValue([alumno])

    await renderRutaPedagogicaView(container)
    await flush()

    lastOnNodeClick({ id: 'nd-1', titulo: 'Nodo 1' })
    await flush()

    const row = document.querySelector('.row-alumno-modal-eval[data-id="al-1"]')
    row.click()

    expect(alumno.estrellas).toBe(0)
    expect(OfflineSyncAdapter.guardarLocal).not.toHaveBeenCalled()
  })

  it('el botón Guardar calificaciones persiste el nodo en Supabase y limpia la cola local', async () => {
    const alumno = mockAlumno({ estrellas: 0 })
    obtenerAlumnosRealesPorClase.mockResolvedValue([alumno])

    await renderRutaPedagogicaView(container, { maestroId: 'mae-1' })
    await flush()

    lastOnNodeClick({ id: 'nd-1', titulo: 'Nodo 1' })
    await flush()

    document.querySelector('.btn-evaluar-one-tap[data-id="al-1"]').click()
    await flush()

    const saveBtn = document.querySelector('#btn-guardar-calificaciones')
    expect(saveBtn).toBeTruthy()

    await saveBtn.click()
    await flush()

    expect(registrarEvaluacion).toHaveBeenCalledWith(expect.objectContaining({
      alumno_id: 'al-1',
      indicator_id: 'nd-1',
      clase_id: 'clase-1',
      nota: 1,
      estado: 'inicia',
      evaluado_por: 'mae-1',
    }))
    expect(OfflineSyncAdapter.eliminarDeCola).toHaveBeenCalledWith(
      expect.objectContaining({ alumnoId: 'al-1', claseId: 'clase-1', nodoId: 'nd-1' }),
    )
  })

  describe('cambio de nodo (regresión M-3 — integración)', () => {
    it('al seleccionar un nodo, vuelve a consultar el roster con el nodoId y repinta el tbody con esos datos', async () => {
      obtenerAlumnosRealesPorClase.mockImplementation((claseId, nodoId) => {
        if (nodoId === 'nd-2') {
          return Promise.resolve([mockAlumno({ id: 'al-1', nombre: 'Ana Pérez', estrellas: 4 })])
        }
        return Promise.resolve([mockAlumno({ id: 'al-1', nombre: 'Ana Pérez', estrellas: 0 })])
      })

      await renderRutaPedagogicaView(container)
      await flush()

      expect(obtenerAlumnosRealesPorClase).toHaveBeenCalledWith('clase-1')
      expect(typeof lastOnNodeClick).toBe('function')

      lastOnNodeClick({ id: 'nd-2', titulo: 'Escala de Do Mayor en cuerdas Re-Sol' })

      // Debe re-consultar el servicio ligado a este nodo puntual.
      expect(obtenerAlumnosRealesPorClase).toHaveBeenCalledWith('clase-1', 'nd-2')

      await flush()

      const fila = document.querySelector('.row-alumno-modal-eval[data-id="al-1"]')
      expect(fila.textContent).toContain('4 Estrellas')
    })

    it('no repite la consulta de red al revisitar un nodo ya cacheado en la sesión', async () => {
      obtenerAlumnosRealesPorClase.mockResolvedValue([mockAlumno({ id: 'al-1', estrellas: 2 })])

      await renderRutaPedagogicaView(container)
      await flush()

      lastOnNodeClick({ id: 'nd-2', titulo: 'Nodo 2' })
      await flush()
      const llamadasTrasPrimeraVisita = obtenerAlumnosRealesPorClase.mock.calls.length

      lastOnNodeClick({ id: 'nd-3', titulo: 'Nodo 3' })
      await flush()
      lastOnNodeClick({ id: 'nd-2', titulo: 'Nodo 2' })
      await flush()

      // Volver a 'nd-2' no debe disparar una nueva consulta: usa la cache en memoria.
      expect(obtenerAlumnosRealesPorClase.mock.calls.length).toBe(llamadasTrasPrimeraVisita + 1)
    })

    it('bloquea el ciclado de estrellas mientras se confirma el roster del nodo, y lo habilita recién al resolver', async () => {
      let resolveNodo2
      obtenerAlumnosRealesPorClase.mockImplementation((claseId, nodoId) => {
        if (nodoId === 'nd-2') {
          return new Promise((resolve) => {
            resolveNodo2 = resolve
          })
        }
        return Promise.resolve([mockAlumno({ id: 'al-1', estrellas: 0 })])
      })

      await renderRutaPedagogicaView(container)
      await flush()

      lastOnNodeClick({ id: 'nd-2', titulo: 'Nodo 2' })
      await flush()

      // La consulta de nd-2 sigue en vuelo: la fila queda deshabilitada.
      const rowCargando = document.querySelector('.row-alumno-modal-eval[data-id="al-1"]')
      expect(rowCargando.className).toContain('opacity-50')
      expect(document.querySelector('.btn-evaluar-one-tap[data-id="al-1"]').disabled).toBe(true)

      // Un click mientras se resuelve NO debe registrar evaluación — de lo
      // contrario se guardaría con el nodoId nuevo pero el conteo base del
      // roster genérico de clase (ver auditoría M-3).
      rowCargando.click()
      expect(OfflineSyncAdapter.guardarLocal).not.toHaveBeenCalled()

      resolveNodo2([mockAlumno({ id: 'al-1', estrellas: 3 })])
      await flush()

      const rowLista = document.querySelector('.row-alumno-modal-eval[data-id="al-1"]')
      expect(rowLista.className).not.toContain('opacity-50')

      rowLista.click()
      expect(OfflineSyncAdapter.guardarLocal).toHaveBeenCalledWith(
        expect.objectContaining({ alumnoId: 'al-1', claseId: 'clase-1', nodoId: 'nd-2', estrellas: 4 }),
      )
    })

    it('descarta la respuesta obsoleta si el maestro cambia de nodo antes de que la consulta anterior resuelva', async () => {
      let resolveNodo2
      obtenerAlumnosRealesPorClase.mockImplementation((claseId, nodoId) => {
        if (nodoId === 'nd-2') {
          return new Promise((resolve) => {
            resolveNodo2 = resolve
          })
        }
        if (nodoId === 'nd-3') {
          return Promise.resolve([mockAlumno({ id: 'al-1', estrellas: 2 })])
        }
        return Promise.resolve([mockAlumno({ id: 'al-1', estrellas: 0 })])
      })

      await renderRutaPedagogicaView(container)
      await flush()

      // Selecciona el nodo 2 (queda pendiente) y luego, antes de que resuelva,
      // cambia al nodo 3 (resuelve de inmediato).
      lastOnNodeClick({ id: 'nd-2', titulo: 'Nodo 2' })
      lastOnNodeClick({ id: 'nd-3', titulo: 'Nodo 3' })
      await flush()

      expect(document.querySelector('.row-alumno-modal-eval[data-id="al-1"]').textContent).toContain('2 Estrellas')

      // La respuesta tardía de nd-2 llega después: no debe pisar los datos
      // del nodo 3 ya confirmados en pantalla.
      resolveNodo2([mockAlumno({ id: 'al-1', estrellas: 5 })])
      await flush()

      expect(document.querySelector('.row-alumno-modal-eval[data-id="al-1"]').textContent).toContain('2 Estrellas')
    })
  })
})
