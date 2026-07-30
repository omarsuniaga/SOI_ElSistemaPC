/**
 * Tests para realAlumnosService.js — corrige hallazgos de auditoría de
 * arquitectura (C-3, M-1, M-2, M-3):
 *
 *   C-3: el servicio invocaba CalculadorSaludPerfil.calcular() con un
 *        contrato inventado (avanceCurricularPct/ausencias*) que no existe
 *        en el dominio real, y leía campos (idia/estadoSalud) que el
 *        dominio nunca devuelve → `idia` quedaba `undefined` siempre.
 *   M-1: si `alumnos_clases` no tenía inscritos se generaba un catálogo
 *        semilla de 6 alumnos ficticios (y estrellas/ausencias aleatorias)
 *        presentado bajo la etiqueta "Datos Reales".
 *   M-2: si no había inscritos, se hacía fallback a `obtenerAlumnos({
 *        pageSize: 50 })` sin filtrar por clase — fuga de hasta 50 alumnos
 *        de toda la institución hacia el roster de una clase ajena.
 *   M-3: la cola offline se buscaba con `.find()` (primera coincidencia,
 *        es decir la más ANTIGUA, porque guardarLocal hace push) y sin
 *        filtrar por claseId/nodoId, filtrando evaluaciones de un nodo/clase
 *        hacia otro nodo/clase del mismo alumno.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../clases/api/clasesApi.js', () => ({
  obtenerAlumnosInscritos: vi.fn(),
}))

vi.mock('../../api/offlineSyncAdapter.js', () => ({
  OfflineSyncAdapter: {
    obtenerCola: vi.fn(),
  },
}))

import { obtenerAlumnosInscritos } from '../../../clases/api/clasesApi.js'
import { OfflineSyncAdapter } from '../../api/offlineSyncAdapter.js'
import { obtenerAlumnosRealesPorClase } from '../realAlumnosService.js'

function inscrito({ id, nombre, estado = 'activo' }) {
  return {
    alumno_id: id,
    activo: true,
    alumno: { id, nombre, estado },
  }
}

describe('obtenerAlumnosRealesPorClase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    OfflineSyncAdapter.obtenerCola.mockReturnValue([])
  })

  it('C-3: idia es number y estadoSalud es un string no vacío (contrato real de CalculadorSaludPerfil)', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([
      inscrito({ id: 'al-1', nombre: 'Pérez, Juan' }),
    ])

    const res = await obtenerAlumnosRealesPorClase('clase-1')

    expect(res).toHaveLength(1)
    expect(typeof res[0].idia).toBe('number')
    expect(Number.isNaN(res[0].idia)).toBe(false)
    expect(typeof res[0].estadoSalud).toBe('string')
    expect(res[0].estadoSalud.length).toBeGreaterThan(0)
  })

  it('M-1: sin inscritos reales devuelve [] — no genera catálogo semilla ficticio', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([])

    const res = await obtenerAlumnosRealesPorClase('clase-vacia')

    expect(res).toEqual([])
  })

  it('M-1: sin evaluación registrada, estrellas es 0 (Sin Registrar) — no fabrica un valor', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([
      inscrito({ id: 'al-1', nombre: 'Pérez, Juan' }),
      inscrito({ id: 'al-2', nombre: 'Gómez, Ana' }),
      inscrito({ id: 'al-3', nombre: 'Ruiz, Carlos' }),
    ])

    const res = await obtenerAlumnosRealesPorClase('clase-1')

    expect(res.every((a) => a.estrellas === 0)).toBe(true)
    expect(res.every((a) => a.presente === true)).toBe(true)
  })

  it('M-2: si obtenerAlumnosInscritos falla, no hace fallback a un listado institucional sin filtrar por clase', async () => {
    obtenerAlumnosInscritos.mockRejectedValue(new Error('RLS hiccup'))

    const res = await obtenerAlumnosRealesPorClase('clase-1')

    expect(res).toEqual([])
  })

  it('M-3: usa la evaluación MÁS RECIENTE de la cola offline, no la más antigua', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([inscrito({ id: 'al-1', nombre: 'Pérez, Juan' })])
    OfflineSyncAdapter.obtenerCola.mockReturnValue([
      { alumnoId: 'al-1', claseId: 'clase-1', nodoId: 'nodo-1', estrellas: 2 },
      { alumnoId: 'al-1', claseId: 'clase-1', nodoId: 'nodo-1', estrellas: 5 },
    ])

    const res = await obtenerAlumnosRealesPorClase('clase-1', 'nodo-1')

    expect(res[0].estrellas).toBe(5)
  })

  it('M-3: filtra por claseId, evitando que una evaluación de otra clase se filtre hacia esta', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([inscrito({ id: 'al-1', nombre: 'Pérez, Juan' })])
    OfflineSyncAdapter.obtenerCola.mockReturnValue([
      { alumnoId: 'al-1', claseId: 'clase-OTRA', nodoId: 'nodo-1', estrellas: 5 },
    ])

    const res = await obtenerAlumnosRealesPorClase('clase-1', 'nodo-1')

    expect(res[0].estrellas).toBe(0)
  })

  it('M-3: cuando se especifica nodoId, filtra también por nodo (no mezcla evaluaciones de otro nodo)', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([inscrito({ id: 'al-1', nombre: 'Pérez, Juan' })])
    OfflineSyncAdapter.obtenerCola.mockReturnValue([
      { alumnoId: 'al-1', claseId: 'clase-1', nodoId: 'nodo-DISTINTO', estrellas: 4 },
    ])

    const res = await obtenerAlumnosRealesPorClase('clase-1', 'nodo-1')

    expect(res[0].estrellas).toBe(0)
  })

  it('M-3: sin nodoId (roster genérico no ligado a un nodo) sólo filtra por alumno+clase', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([inscrito({ id: 'al-1', nombre: 'Pérez, Juan' })])
    OfflineSyncAdapter.obtenerCola.mockReturnValue([
      { alumnoId: 'al-1', claseId: 'clase-1', nodoId: 'cualquier-nodo', estrellas: 3 },
    ])

    const res = await obtenerAlumnosRealesPorClase('clase-1')

    expect(res[0].estrellas).toBe(3)
  })
})
