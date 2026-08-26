import { describe, it, expect } from 'vitest'
import { generateHorarioGeneralReportHTML } from '../horarioGeneralReportService.js'

const SESION = {
  claseId: 'c1',
  clase: 'Violín 101',
  instrumento: 'Violines',
  maestro: 'Prof. Ana',
  suplente: null,
  dia: 'lunes',
  inicio: '15:30',
  fin: '17:00',
  salon: 'Salón DeWindt',
  cupo: 15,
  inscritos: 8,
}

describe('generateHorarioGeneralReportHTML', () => {
  it('incluye una página por día con sus sesiones y una portada con el diagnóstico', () => {
    const html = generateHorarioGeneralReportHTML({
      sesiones: [SESION, { ...SESION, claseId: 'c2', clase: 'Cello 201', dia: 'martes' }],
      diagnostico: {
        stats: { totalClases: 2, totalSesiones: 2, conflictos: 0, sinSalon: 0, sobreCupo: 0, salonesEnUso: 1 },
        findings: [],
      },
    })

    expect(html).toContain('HORARIO GENERAL')
    expect(html).toContain('Violín 101')
    expect(html).toContain('Cello 201')
    expect(html).toContain('Lunes')
    expect(html).toContain('Martes')
  })

  it('sin hallazgos, muestra un bloque OK en vez de una lista vacía', () => {
    const html = generateHorarioGeneralReportHTML({
      sesiones: [SESION],
      diagnostico: { stats: { totalClases: 1, totalSesiones: 1, conflictos: 0, sinSalon: 0, sobreCupo: 0, salonesEnUso: 1 }, findings: [] },
    })

    expect(html).toContain('No se detectaron conflictos')
  })

  it('muestra el resumen de cada hallazgo con su chip', () => {
    const html = generateHorarioGeneralReportHTML({
      sesiones: [SESION],
      diagnostico: {
        stats: { totalClases: 1, totalSesiones: 1, conflictos: 1, sinSalon: 0, sobreCupo: 0, salonesEnUso: 1 },
        findings: [{ sev: 'crit', chip: 'Conflicto', summary: 'Salón Bach se solapa.', detail: 'Reasignar.' }],
      },
    })

    expect(html).toContain('Conflicto')
    expect(html).toContain('Salón Bach se solapa.')
  })

  it('marca el suplente cuando la sesión lo tiene', () => {
    const html = generateHorarioGeneralReportHTML({
      sesiones: [{ ...SESION, suplente: 'Prof. Bruno' }],
      diagnostico: { stats: { totalClases: 1, totalSesiones: 1, conflictos: 0, sinSalon: 0, sobreCupo: 0, salonesEnUso: 1 }, findings: [] },
    })

    expect(html).toContain('Suplente: Prof. Bruno')
  })

  it('escapa HTML en nombres de clase para evitar inyección', () => {
    const html = generateHorarioGeneralReportHTML({
      sesiones: [{ ...SESION, clase: '<img src=x onerror=alert(1)>' }],
      diagnostico: { stats: { totalClases: 1, totalSesiones: 1, conflictos: 0, sinSalon: 0, sobreCupo: 0, salonesEnUso: 1 }, findings: [] },
    })

    expect(html).not.toContain('<img src=x')
  })

  it('sin sesiones en ningún día, arma solo la portada sin romper', () => {
    const html = generateHorarioGeneralReportHTML({
      sesiones: [],
      diagnostico: { stats: { totalClases: 0, totalSesiones: 0, conflictos: 0, sinSalon: 0, sobreCupo: 0, salonesEnUso: 0 }, findings: [] },
    })

    expect(html).toContain('HORARIO GENERAL')
  })
})
