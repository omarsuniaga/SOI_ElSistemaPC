import { describe, expect, it } from 'vitest'
import {
  buildSalonDayRows,
  buildSalonUsageStats,
  calculateUsageMinutes,
  groupSalonUsageByDay,
} from '../domain/generarPdfUsoSalones.js'

describe('generarPdfUsoSalones helpers', () => {
  const salon = { id: 'salon-1', nombre: 'Salón Bach', capacidad: 10, piso: 2, condicion: 'buena' }
  const usos = [
    {
      dia: 'lunes',
      hora_inicio: '09:00:00',
      hora_fin: '10:30:00',
      clase_nombre: 'Piano Inicial',
      maestro_nombre: 'Ana Rivera',
      instrumento: 'Piano',
    },
    {
      dia: 'lunes',
      hora_inicio: '08:00:00',
      hora_fin: '09:00:00',
      clase_nombre: 'Solfeo I',
      maestro_nombre: 'Luis Pérez',
      instrumento: 'Solfeo',
    },
    {
      dia: 'miércoles',
      hora_inicio: '15:00:00',
      hora_fin: '16:00:00',
      clase_nombre: 'Coro',
      maestro_nombre: 'María Gómez',
      instrumento: 'Voz',
    },
  ]

  it('groups usage by day and sorts by start time', () => {
    const grouped = groupSalonUsageByDay(usos)

    expect(grouped.lunes).toHaveLength(2)
    expect(grouped.lunes[0].clase_nombre).toBe('Solfeo I')
    expect(grouped.martes).toEqual([])
  })

  it('calculates occupied minutes', () => {
    expect(calculateUsageMinutes(usos)).toBe(210)
  })

  it('builds salon usage stats for empty-room detection', () => {
    const stats = buildSalonUsageStats(salon, usos)

    expect(stats.salonNombre).toBe('Salón Bach')
    expect(stats.totalUsos).toBe(3)
    expect(stats.occupiedHours).toBe('3.5 h')
    expect(stats.emptyDays).toContain('martes')
    expect(stats.emptyDays).toContain('jueves')
    expect(stats.status).toBe('disponible')
  })

  it('creates day rows with explicit available rows for empty days', () => {
    const rows = buildSalonDayRows(usos)

    expect(rows).toContainEqual(['Martes', 'Disponible', '—', '—', 'Salón vacío ese día'])
    expect(rows[0]).toEqual(['Lunes', '08:00 - 09:00', 'Solfeo I', 'Luis Pérez', 'Solfeo'])
  })
})
