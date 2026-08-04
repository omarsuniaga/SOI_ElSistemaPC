import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../clases/api/clasesApi.js', () => ({
  obtenerAlumnosInscritos: vi.fn(),
}))

vi.mock('../../api/offlineSyncAdapter.js', () => ({
  OfflineSyncAdapter: {
    obtenerCola: vi.fn(),
  },
}))

vi.mock('../evaluacionClaseService.js', () => ({
  obtenerEvaluacionesPorClase: vi.fn(),
}))

import { obtenerAlumnosInscritos } from '../../../clases/api/clasesApi.js'
import { OfflineSyncAdapter } from '../../api/offlineSyncAdapter.js'
import { obtenerEvaluacionesPorClase } from '../evaluacionClaseService.js'
import { obtenerAlumnosRealesPorClase } from '../realAlumnosService.js'

describe('realAlumnosService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('usa la evaluación persistida en Supabase cuando no hay cola local', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([
      { alumno: { id: 'al-1', nombre: 'Ana Pérez', estado: 'activo' } },
    ])
    OfflineSyncAdapter.obtenerCola.mockResolvedValue([])
    obtenerEvaluacionesPorClase.mockResolvedValue([
      {
        alumno_id: 'al-1',
        indicator_id: 'nd-1',
        clase_id: 'clase-1',
        nota: 4,
        fecha_evaluacion: '2026-08-04T10:00:00.000Z',
      },
    ])

    const resultado = await obtenerAlumnosRealesPorClase('clase-1', 'nd-1')

    expect(resultado).toHaveLength(1)
    expect(resultado[0]).toMatchObject({
      id: 'al-1',
      estrellas: 4,
      estrellasAnteriores: null,
      presente: true,
    })
  })

  it('prioriza la cola local más reciente sobre la evaluación remota', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([
      { alumno: { id: 'al-1', nombre: 'Ana Pérez', estado: 'activo' } },
    ])
    OfflineSyncAdapter.obtenerCola.mockResolvedValue([
      {
        alumnoId: 'al-1',
        claseId: 'clase-1',
        nodoId: 'nd-1',
        estrellas: 5,
        timestamp: '2026-08-04T11:00:00.000Z',
      },
    ])
    obtenerEvaluacionesPorClase.mockResolvedValue([
      {
        alumno_id: 'al-1',
        indicator_id: 'nd-1',
        clase_id: 'clase-1',
        nota: 3,
        fecha_evaluacion: '2026-08-04T10:00:00.000Z',
      },
    ])

    const resultado = await obtenerAlumnosRealesPorClase('clase-1', 'nd-1')

    expect(resultado[0].estrellas).toBe(5)
    expect(resultado[0].estrellasAnteriores).toBe(3)
  })

  it('refleja una IDIA gradual según la cantidad de estrellas guardadas', async () => {
    obtenerAlumnosInscritos.mockResolvedValue([
      { alumno: { id: 'al-1', nombre: 'Ana Pérez', estado: 'activo' } },
    ])
    OfflineSyncAdapter.obtenerCola.mockResolvedValue([])
    obtenerEvaluacionesPorClase.mockResolvedValue([
      {
        alumno_id: 'al-1',
        indicator_id: 'nd-1',
        clase_id: 'clase-1',
        nota: 2,
        fecha_evaluacion: '2026-08-04T10:00:00.000Z',
      },
    ])

    const resultado = await obtenerAlumnosRealesPorClase('clase-1', 'nd-1')

    expect(resultado[0].estrellas).toBe(2)
    expect(resultado[0].idia).toBe(40)
  })
})
