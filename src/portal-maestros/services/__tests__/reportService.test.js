// src/portal-maestros/services/__tests__/reportService.test.js
import { describe, it, expect } from 'vitest'
import {
  calcAttendanceStats,
  buildAlumnoAttMap,
  generateRangeReportHTML,
  generateInstitutionalReportHTML,
} from '../reportService.js'

describe('calcAttendanceStats', () => {
  it('counts P, A, J from a session asistencia array', () => {
    const att = [
      { alumno_id: '1', estado: 'P' },
      { alumno_id: '2', estado: 'A' },
      { alumno_id: '3', estado: 'J' },
      { alumno_id: '4', estado: 'P' },
    ]
    expect(calcAttendanceStats(att)).toEqual({ P: 2, A: 1, J: 1, total: 4 })
  })

  it('returns zeros for empty array', () => {
    expect(calcAttendanceStats([])).toEqual({ P: 0, A: 0, J: 0, total: 0 })
  })
})

describe('buildAlumnoAttMap', () => {
  it('builds a map of alumnoId → estado per sesion', () => {
    const sesiones = [
      { id: 's1', asistencia: [{ alumno_id: 'a1', estado: 'P' }, { alumno_id: 'a2', estado: 'A' }] },
      { id: 's2', asistencia: [{ alumno_id: 'a1', estado: 'J' }, { alumno_id: 'a2', estado: 'P' }] },
    ]
    const result = buildAlumnoAttMap(sesiones)
    expect(result['a1']['s1']).toBe('P')
    expect(result['a1']['s2']).toBe('J')
    expect(result['a2']['s1']).toBe('A')
    expect(result['a2']['s2']).toBe('P')
  })
})

describe('generateRangeReportHTML', () => {
  const sesiones = [
    {
      fecha: '2026-08-20',
      horaInicio: '14:00:00',
      horaFin: '15:00:00',
      claseNombre: 'Violín 101',
      salonNombre: 'Aula Magna',
      contenido: 'Escalas mayores',
      presentes: 1,
      ausentes: 1,
      justificados: 1,
      totalRegistros: 3,
      roster: [
        { nombre: 'Ana Torres', estado: 'P', motivo: null },
        { nombre: 'Bruno Vera', estado: 'A', motivo: null },
        { nombre: 'Carlos Ruiz', estado: 'J', motivo: 'Cita médica' },
      ],
    },
  ]

  it('incluye el índice, el contenido literal y el roster con causa de justificación', () => {
    const html = generateRangeReportHTML(sesiones, {
      maestroNombre: 'Prof. Ana',
      claseLabel: 'Violín 101',
      rangoLabel: 'Últimos 30 días',
    })

    expect(html).toContain('Violín 101')
    expect(html).toContain('Prof. Ana')
    expect(html).toContain('Escalas mayores')
    expect(html).toContain('Ana Torres')
    expect(html).toContain('Cita médica')
    expect(html).toContain('Aula Magna')
  })

  it('escapa HTML en el contenido y en el motivo de justificación', () => {
    const html = generateRangeReportHTML(
      [
        {
          ...sesiones[0],
          contenido: '<script>alert(1)</script>',
          roster: [{ nombre: 'Ana', estado: 'J', motivo: '<img src=x onerror=alert(1)>' }],
        },
      ],
      { maestroNombre: 'Prof. Ana', claseLabel: 'Violín 101', rangoLabel: 'Últimos 30 días' },
    )

    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).not.toContain('<img src=x')
  })

  it('sin sesiones, no rompe y arma solo la portada', () => {
    const html = generateRangeReportHTML([], {
      maestroNombre: 'Prof. Ana',
      claseLabel: 'Todas mis clases',
      rangoLabel: 'Últimos 7 días',
    })

    expect(html).toContain('Índice de sesiones')
  })
})

describe('generateInstitutionalReportHTML', () => {
  const sesiones = [
    {
      fecha: '2026-08-20',
      horaInicio: '14:00:00',
      horaFin: '15:00:00',
      claseNombre: 'Violín 101',
      salonNombre: 'Aula Magna',
      maestroNombre: 'Prof. Ana',
      contenido: 'Escalas mayores',
      presentes: 1,
      ausentes: 1,
      justificados: 1,
      totalRegistros: 3,
      roster: [
        { nombre: 'Ana Torres', estado: 'P', motivo: null },
        { nombre: 'Bruno Vera', estado: 'A', motivo: null },
        { nombre: 'Carlos Ruiz', estado: 'J', motivo: 'Cita médica' },
      ],
    },
    {
      fecha: '2026-08-21',
      horaInicio: '16:00:00',
      horaFin: '17:00:00',
      claseNombre: 'Percusión 201',
      salonNombre: 'Sala B',
      maestroNombre: 'Prof. Bruno',
      contenido: 'Ritmos afrocaribeños',
      presentes: 2,
      ausentes: 0,
      justificados: 0,
      totalRegistros: 2,
      roster: [
        { nombre: 'Diana Paz', estado: 'P', motivo: null },
        { nombre: 'Eva Solís', estado: 'P', motivo: null },
      ],
    },
  ]

  it('incluye sesiones de varios maestros, cada una con su propio docente en el índice y su página', () => {
    const html = generateInstitutionalReportHTML(sesiones, { rangoLabel: '01/08/2026 – 31/08/2026' })

    expect(html).toContain('Prof. Ana')
    expect(html).toContain('Prof. Bruno')
    expect(html).toContain('Violín 101')
    expect(html).toContain('Percusión 201')
    expect(html).toContain('Escalas mayores')
    expect(html).toContain('Ritmos afrocaribeños')
    expect(html).toContain('Cita médica')
  })

  it('cuenta maestros únicos y totaliza P/A/J de todas las sesiones', () => {
    const html = generateInstitutionalReportHTML(sesiones, { rangoLabel: 'Rango' })

    // 2 maestros únicos, 3 presentes, 1 ausente, 1 justificado en total
    expect(html).toContain('<span class="chip-val">2</span>\n      <span class="chip-lbl">Maestros</span>')
    expect(html).toContain('<span class="chip-val">3</span>\n      <span class="chip-lbl">Presentes</span>')
  })

  it('escapa HTML en el contenido y en el motivo de justificación', () => {
    const html = generateInstitutionalReportHTML(
      [
        {
          ...sesiones[0],
          contenido: '<script>alert(1)</script>',
          roster: [{ nombre: 'Ana', estado: 'J', motivo: '<img src=x onerror=alert(1)>' }],
        },
      ],
      { rangoLabel: 'Rango' },
    )

    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).not.toContain('<img src=x')
  })

  it('sin sesiones, no rompe y arma solo la portada', () => {
    const html = generateInstitutionalReportHTML([], { rangoLabel: 'Últimos 7 días' })

    expect(html).toContain('Índice de sesiones')
  })
})
