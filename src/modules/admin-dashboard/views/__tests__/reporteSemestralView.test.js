import { describe, it, expect, beforeEach } from 'vitest'
import { ReporteSemestralView } from '../reporteSemestralView.js'

describe('ReporteSemestralView — Cronograma y Bloqueo de Meses', () => {
  let view

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>'
    view = new ReporteSemestralView('test-container')
  })

  it('genera todos los meses del período desde fecha_inicio hasta fecha_fin', () => {
    const mockPeriodo = {
      nombre: 'Semestre 2026-II',
      fecha_inicio: '2026-08-10',
      fecha_fin: '2026-12-19',
      activo: true,
    }

    const mockEvolucion = [
      { anio: 2026, mes: 8, tasa_asistencia_pct: 92, presentes_total: 120, ausentes_total: 10, total_registros: 130 }
    ]

    const meses = view.obtenerMesesPeriodo(mockPeriodo, mockEvolucion)

    // Agosto, Septiembre, Octubre, Noviembre, Diciembre = 5 meses
    expect(meses).toHaveLength(5)
    expect(meses[0].mesNombre).toBe('Agosto 2026')
    expect(meses[1].mesNombre).toBe('Septiembre 2026')
    expect(meses[2].mesNombre).toBe('Octubre 2026')
    expect(meses[3].mesNombre).toBe('Noviembre 2026')
    expect(meses[4].mesNombre).toBe('Diciembre 2026')
  })

  it('asigna estado en_curso y calcula progreso día a día para el mes actual', () => {
    const mockPeriodo = {
      nombre: 'Semestre 2026-II',
      fecha_inicio: '2026-08-10',
      fecha_fin: '2026-12-19',
    }

    const meses = view.obtenerMesesPeriodo(mockPeriodo, [])
    const mesAgosto = meses.find(m => m.mes === 8 && m.anio === 2026)

    expect(mesAgosto).toBeDefined()
    expect(mesAgosto.estado).toBe('en_curso')
    expect(mesAgosto.progresoTemporalPct).toBeGreaterThan(0)
    expect(mesAgosto.progresoTemporalPct).toBeLessThanOrEqual(100)
    expect(mesAgosto.diasTranscurridos).toBeGreaterThan(0)
  })

  it('bloquea los meses futuros con estado bloqueado y progreso 0%', () => {
    const mockPeriodo = {
      nombre: 'Semestre 2026-II',
      fecha_inicio: '2026-08-10',
      fecha_fin: '2026-12-19',
    }

    const meses = view.obtenerMesesPeriodo(mockPeriodo, [])
    const mesesFuturos = meses.filter(m => m.mes > 8)

    expect(mesesFuturos.length).toBe(4) // Sept, Oct, Nov, Dic
    mesesFuturos.forEach(m => {
      expect(m.estado).toBe('bloqueado')
      expect(m.progresoTemporalPct).toBe(0)
      expect(m.diasTranscurridos).toBe(0)
    })
  })

  it('renderiza tarjetas bloqueadas con escala de grises y badge Bloqueado', () => {
    const mockPeriodo = {
      nombre: 'Semestre 2026-II',
      fecha_inicio: '2026-08-10',
      fecha_fin: '2026-12-19',
    }

    const html = view.renderEvolucion([], mockPeriodo)
    expect(html).toContain('grayscale(1)')
    expect(html).toContain('Bloqueado')
    expect(html).toContain('Se desbloquea al iniciar el mes')
    expect(html).toContain('Septiembre 2026')
    expect(html).toContain('Diciembre 2026')
  })

  it('renderiza la tarjeta del mes en curso con barra de progreso animada y porcentaje transcurrido', () => {
    const mockPeriodo = {
      nombre: 'Semestre 2026-II',
      fecha_inicio: '2026-08-10',
      fecha_fin: '2026-12-19',
    }

    const html = view.renderEvolucion([
      { anio: 2026, mes: 8, tasa_asistencia_pct: 95, presentes_total: 100, ausentes_total: 5, total_registros: 105 }
    ], mockPeriodo)

    expect(html).toContain('En Curso')
    expect(html).toContain('transcurrido')
    expect(html).toContain('Asist. acumulada:')
    expect(html).toContain('95%')
  })

  it('mantiene bloqueado el Cuadro de Honor sin mostrar nombres ni datos si no hay audiciones realizadas', () => {
    const mockHonor = [
      { nombre_completo: 'Mateo Fernández', instrumento_principal: 'Violín', asistencias: 19, total_clases: 19, porcentaje_asistencia: 100 }
    ]

    const html = view.renderHonorTable(mockHonor, false)
    expect(html).toContain('Sección Reservada para Audiciones')
    expect(html).toContain('bi-lock-fill')
    expect(html).not.toContain('Mateo Fernández')
    expect(html).not.toContain('100%')
  })

  it('mantiene bloqueados los Alumnos Destacados sin mostrar nombres ni puntuaciones si no hay audiciones', () => {
    const mockDestacados = [
      { nombre_completo: 'Valeria Russo', instrumento_principal: 'Violín', merit_score: 95, total_logros: 5, indicadores_aprobados: 12 }
    ]

    const html = view.renderDestacadosTable(mockDestacados, false)
    expect(html).toContain('Sección Reservada para Audiciones')
    expect(html).toContain('bi-lock-fill')
    expect(html).not.toContain('Valeria Russo')
    expect(html).not.toContain('95 pts')
  })

  it('muestra las tablas cuando audicionesRealizadas es true', () => {
    const mockHonor = [
      { nombre_completo: 'Mateo Fernández', instrumento_principal: 'Violín', asistencias: 19, total_clases: 19, porcentaje_asistencia: 100 }
    ]

    const html = view.renderHonorTable(mockHonor, true)
    expect(html).toContain('Mateo Fernández')
    expect(html).toContain('100%')
    expect(html).not.toContain('Sección Reservada para Audiciones')
  })

  it('renderiza la tabla de ausencias por días lectivos con diagnóstico y ratios de jornadas', () => {
    const mockAusencias = [
      {
        nombre_completo: 'Yurma StJuste',
        instrumento_principal: 'Violín',
        representante_nombre: 'Padre Yurma',
        representante_tlf: '+18091234567',
        total_dias_convocados: 9,
        dias_con_asistencia: 0,
        dias_con_falta: 8,
        porcentaje_dias_ausente: 88.89,
      },
      {
        nombre_completo: 'Amy Balbuena',
        instrumento_principal: 'Violoncello',
        representante_nombre: 'Madre Amy',
        representante_tlf: '+18097654321',
        total_dias_convocados: 13,
        dias_con_asistencia: 7,
        dias_con_falta: 6,
        porcentaje_dias_ausente: 46.15,
      }
    ]

    const html = view.renderAusenciasTable(mockAusencias)
    expect(html).toContain('Días Asistidos / Total')
    expect(html).toContain('Días Ausente')
    expect(html).toContain('% Ausentismo Diario')
    expect(html).toContain('Yurma StJuste')
    expect(html).toContain('0</strong> / 9 días')
    expect(html).toContain('8 días')
    expect(html).toContain('Abandono Total')
    expect(html).toContain('Amy Balbuena')
    expect(html).toContain('7</strong> / 13 días')
    expect(html).toContain('6 días')
    expect(html).toContain('Inasistencia Parcial')
  })
})
