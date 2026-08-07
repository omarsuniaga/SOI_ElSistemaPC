import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * historialIndicadorModal.test.js
 *
 * Panel de solo lectura: junta evaluacion_indicador_historial (log
 * append-only, migración 20260807000002) con el nombre del alumno
 * (realAlumnosService) para un clase_indicador_id. La tabla histórica
 * existe porque `evaluacion_indicador` en sí es "estado actual" — UNIQUE
 * (alumno_id, clase_indicador_id), se sobrescribe en cada recalificación —
 * así que leerla directamente solo mostraba la última nota por alumno.
 */

const { obtenerHistorialPorIndicadorClase } = vi.hoisted(() => ({
  obtenerHistorialPorIndicadorClase: vi.fn(),
}))
const { obtenerAlumnosRealesPorClase } = vi.hoisted(() => ({
  obtenerAlumnosRealesPorClase: vi.fn(),
}))

vi.mock('../../services/evaluacionClaseService.js', () => ({ obtenerHistorialPorIndicadorClase }))
vi.mock('../../services/realAlumnosService.js', () => ({ obtenerAlumnosRealesPorClase }))

import { renderHistorialIndicadorModal } from '../historialIndicadorModal.js'

const flush = () => Promise.resolve().then(() => Promise.resolve())

describe('historialIndicadorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.querySelectorAll('.historial-indicador-overlay').forEach((el) => el.remove())
  })

  afterEach(() => {
    document.querySelectorAll('.historial-indicador-overlay').forEach((el) => el.remove())
  })

  it('pasa (claseIndicadorId, claseId) en ese orden al servicio — no invertidos', async () => {
    obtenerHistorialPorIndicadorClase.mockResolvedValue([])
    obtenerAlumnosRealesPorClase.mockResolvedValue([])

    renderHistorialIndicadorModal({ claseId: 'clase-1', claseIndicadorId: 'ind-1', indicadorDescripcion: 'Afinación' })
    await flush()

    expect(obtenerHistorialPorIndicadorClase).toHaveBeenCalledWith('ind-1', 'clase-1')
    expect(obtenerAlumnosRealesPorClase).toHaveBeenCalledWith('clase-1')
  })

  it('junta la nota/fecha del historial con el nombre real del alumno', async () => {
    obtenerHistorialPorIndicadorClase.mockResolvedValue([
      { alumno_id: 'al-1', nota: 4, registrado_en: '2026-08-05T14:30:00Z' },
    ])
    obtenerAlumnosRealesPorClase.mockResolvedValue([{ id: 'al-1', nombre: 'Ana Pérez', activo: true }])

    renderHistorialIndicadorModal({ claseId: 'clase-1', claseIndicadorId: 'ind-1' })
    await flush()

    expect(document.body.textContent).toContain('Ana Pérez')
    expect(document.body.textContent).toContain('★★★★☆')
  })

  it('muestra CADA recalificación del mismo alumno como una fila separada — no solo la última nota', async () => {
    obtenerHistorialPorIndicadorClase.mockResolvedValue([
      { alumno_id: 'al-1', nota: 5, registrado_en: '2026-08-06T10:00:00Z' }, // recalificación (más reciente, primero)
      { alumno_id: 'al-1', nota: 3, registrado_en: '2026-08-01T09:00:00Z' }, // primera evaluación
    ])
    obtenerAlumnosRealesPorClase.mockResolvedValue([{ id: 'al-1', nombre: 'Ana Pérez', activo: true }])

    renderHistorialIndicadorModal({ claseId: 'clase-1', claseIndicadorId: 'ind-1' })
    await flush()

    const filas = document.querySelectorAll('.historial-indicador-row')
    expect(filas.length).toBe(2)
    expect(document.body.textContent).toContain('★★★★★')
    expect(document.body.textContent).toContain('★★★☆☆')
  })

  it('omite eventos sin nota', async () => {
    obtenerHistorialPorIndicadorClase.mockResolvedValue([
      { alumno_id: 'al-1', nota: null, registrado_en: null },
    ])
    obtenerAlumnosRealesPorClase.mockResolvedValue([{ id: 'al-1', nombre: 'Ana Pérez', activo: true }])

    renderHistorialIndicadorModal({ claseId: 'clase-1', claseIndicadorId: 'ind-1' })
    await flush()

    expect(document.body.textContent).toContain('Todavía no hay evaluaciones')
  })

  it('muestra un estado vacío honesto si el servicio falla, en vez de dejar el spinner colgado', async () => {
    obtenerHistorialPorIndicadorClase.mockRejectedValue(new Error('network'))
    obtenerAlumnosRealesPorClase.mockResolvedValue([])

    renderHistorialIndicadorModal({ claseId: 'clase-1', claseIndicadorId: 'ind-1' })
    await flush()

    expect(document.body.textContent).toContain('Todavía no hay evaluaciones')
  })
})
