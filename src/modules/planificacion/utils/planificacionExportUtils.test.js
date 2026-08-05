import { describe, expect, it } from 'vitest'

import {
  buildPlanificacionExportFilename,
  buildPlanificacionExportPayload,
  getExportableClassesFromPlans,
  isPlanificacionApproved,
  isPlanificacionEstadoExportable,
  resolveExportableEstadoAliases,
} from './planificacionExportUtils.js'

describe('planificacionExportUtils', () => {
  const samplePlans = [
    {
      id: 'plan-1',
      clase_id: 'clase-a',
      clase_nombre: 'Violín Inicial',
      maestro_id: 'maestro-1',
      maestro_nombre: 'Laura Pérez',
      tema: 'Postura básica',
      estado: 'activa',
      instrumento: 'Violín',
      fecha_inicio: '2026-08-01',
    },
    {
      id: 'plan-2',
      clase_id: 'clase-a',
      clase_nombre: 'Violín Inicial',
      maestro_id: 'maestro-1',
      maestro_nombre: 'Laura Pérez',
      tema: 'Arco en cuerdas al aire',
      estado: 'cerrada',
      instrumento: 'Violín',
      fecha_inicio: '2026-08-02',
    },
    {
      id: 'plan-3',
      clase_id: 'clase-b',
      clase_nombre: 'Guitarra Intermedia',
      maestro_id: 'maestro-1',
      maestro_nombre: 'Laura Pérez',
      tema: 'Rasgueo básico',
      estado: 'revisada',
      instrumento: 'Guitarra',
      fecha_inicio: '2026-08-03',
    },
  ]

  it('treats active and closed plans as approved, but not revisada', () => {
    expect(isPlanificacionApproved(samplePlans[0])).toBe(true)
    expect(isPlanificacionApproved(samplePlans[1])).toBe(true)
    expect(isPlanificacionApproved(samplePlans[2])).toBe(false)
  })

  it('resolves approved aliases for export filters', () => {
    const result = resolveExportableEstadoAliases(['approved'])
    expect(result).toContain('activa')
    expect(result).toContain('cerrada')
    expect(result).not.toContain('revisada')
  })

  it('filters exportable states correctly', () => {
    expect(isPlanificacionEstadoExportable(samplePlans[0], ['approved'])).toBe(true)
    expect(isPlanificacionEstadoExportable(samplePlans[2], ['approved'])).toBe(false)
    expect(isPlanificacionEstadoExportable(samplePlans[2], ['all'])).toBe(true)
  })

  it('extracts exportable classes from approved plans', () => {
    const result = getExportableClassesFromPlans(samplePlans.filter(isPlanificacionApproved))
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(
      expect.objectContaining({
        claseId: 'clase-a',
        claseNombre: 'Violín Inicial',
        totalPlanificaciones: 2,
      }),
    )
  })

  it('builds a grouped export payload', () => {
    const payload = buildPlanificacionExportPayload({
      planes: samplePlans.filter(isPlanificacionApproved),
      maestro: { id: 'maestro-1', nombre_completo: 'Laura Pérez' },
      scope: 'all',
      generatedAt: '2026-08-05T10:00:00Z',
    })

    expect(payload.totalPlanificaciones).toBe(2)
    expect(payload.totalClases).toBe(1)
    expect(payload.maestro.nombre).toBe('Laura Pérez')
    expect(payload.clases[0].planificaciones.map((plan) => plan.id)).toEqual(['plan-1', 'plan-2'])
  })

  it('builds a deterministic export filename', () => {
    const payload = buildPlanificacionExportPayload({
      planes: samplePlans.filter(isPlanificacionApproved),
      maestro: { id: 'maestro-1', nombre_completo: 'Laura Pérez' },
      scope: 'class',
      claseId: 'clase-a',
    })

    expect(buildPlanificacionExportFilename(payload, 'pdf')).toBe(
      'planificacion-laura-perez-violin-inicial.pdf',
    )
  })
})
