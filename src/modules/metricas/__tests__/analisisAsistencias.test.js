import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as metricsApi from '../api/metricsApi.js'
import * as metricasMock from '../api/metricasMock.js'
import { analisisAsistenciasWidget } from '../components/analisisAsistenciasWidget.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { AppModal } from '../../../shared/components/AppModal.js'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('../../../shared/components/AppModal.js', () => ({
  AppModal: {
    open: vi.fn(),
  },
}))

vi.mock('../api/metricasApi.js', () => ({
  getAnalisisAsistenciasPeriodoActivo: vi.fn(),
}))

import { getAnalisisAsistenciasPeriodoActivo } from '../api/metricasApi.js'

describe('Análisis de Asistencias e Inasistencias del Período Activo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('metricsApi.getAnalisisAsistenciasPeriodoActivo (Supabase)', () => {
    it('should aggregate attendance and absence metrics from active period sessions', async () => {
      const mockPeriodo = [
        {
          id: 'per-test-1',
          nombre: 'Semestre 2026-I',
          fecha_inicio: '2026-01-15',
          fecha_fin: '2026-06-15',
          activo: true,
        },
      ]

      const mockSesiones = [
        {
          id: 'ses-1',
          fecha: '2026-02-10',
          hora_inicio: '15:00',
          clase_id: 'clase-1',
          maestro_id: 'm-1',
          clases: {
            nombre: 'Violín Práctica',
            instrumento: 'Violín',
            maestro_principal_id: 'm-1',
            maestros: { nombre_completo: 'Prof. Carlos Méndez' },
          },
          asistencias: [
            {
              id: 'a-1',
              estado: 'ausente',
              justificacion_texto: null,
              alumno_id: 'alum-1',
              alumnos: { nombre_completo: 'Mateo Fernández', instrumento_principal: 'Violín', programa: 'Cátedra' },
            },
            {
              id: 'a-2',
              estado: 'presente',
              justificacion_texto: null,
              alumno_id: 'alum-2',
              alumnos: { nombre_completo: 'Valeria Russo', instrumento_principal: 'Violín', programa: 'Cátedra' },
            },
          ],
        },
        {
          id: 'ses-2',
          fecha: '2026-02-17',
          hora_inicio: '15:00',
          clase_id: 'clase-1',
          maestro_id: 'm-1',
          clases: {
            nombre: 'Violín Práctica',
            instrumento: 'Violín',
            maestro_principal_id: 'm-1',
            maestros: { nombre_completo: 'Prof. Carlos Méndez' },
          },
          asistencias: [
            {
              id: 'a-3',
              estado: 'ausente',
              justificacion_texto: null,
              alumno_id: 'alum-1',
              alumnos: { nombre_completo: 'Mateo Fernández', instrumento_principal: 'Violín', programa: 'Cátedra' },
            },
            {
              id: 'a-4',
              estado: 'presente',
              justificacion_texto: null,
              alumno_id: 'alum-2',
              alumnos: { nombre_completo: 'Valeria Russo', instrumento_principal: 'Violín', programa: 'Cátedra' },
            },
          ],
        },
        {
          id: 'ses-3',
          fecha: '2026-02-24',
          hora_inicio: '15:00',
          clase_id: 'clase-1',
          maestro_id: 'm-1',
          clases: {
            nombre: 'Violín Práctica',
            instrumento: 'Violín',
            maestro_principal_id: 'm-1',
            maestros: { nombre_completo: 'Prof. Carlos Méndez' },
          },
          asistencias: [
            {
              id: 'a-5',
              estado: 'ausente',
              justificacion_texto: null,
              alumno_id: 'alum-1',
              alumnos: { nombre_completo: 'Mateo Fernández', instrumento_principal: 'Violín', programa: 'Cátedra' },
            },
            {
              id: 'a-6',
              estado: 'presente',
              justificacion_texto: null,
              alumno_id: 'alum-2',
              alumnos: { nombre_completo: 'Valeria Russo', instrumento_principal: 'Violín', programa: 'Cátedra' },
            },
          ],
        },
      ]

      supabase.from.mockImplementation((table) => {
        if (table === 'periodos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: mockPeriodo, error: null }),
          }
        }
        if (table === 'sesiones_clase') {
          return {
            select: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockSesiones, error: null }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      })

      const res = await metricsApi.getAnalisisAsistenciasPeriodoActivo()

      expect(res).toBeDefined()
      expect(res.periodo.nombre).toBe('Semestre 2026-I')
      expect(res.resumen.totalAlumnosEvaluados).toBe(2)
      expect(res.resumen.alumnosConFaltas).toBe(1)
      expect(res.resumen.alumnosSinFaltas).toBe(1)
      expect(res.resumen.totalAusentes).toBe(3)
      expect(res.resumen.totalPresentes).toBe(3)
      expect(res.resumen.tasaAusentismo).toBe(50.0)

      // Mateo Fernández tiene 3 faltas -> nivelRiesgo 'critico'
      const mateo = res.alumnos.find((a) => a.alumnoNombre === 'Mateo Fernández')
      expect(mateo).toBeDefined()
      expect(mateo.totalAusentes).toBe(3)
      expect(mateo.nivelRiesgo).toBe('critico')
      expect(mateo.detalleFaltas).toHaveLength(3)

      // Valeria Russo tiene 0 faltas -> nivelRiesgo 'normal'
      const valeria = res.alumnos.find((a) => a.alumnoNombre === 'Valeria Russo')
      expect(valeria).toBeDefined()
      expect(valeria.totalAusentes).toBe(0)
      expect(valeria.tasaAsistencia).toBe(100)
      expect(valeria.nivelRiesgo).toBe('normal')

      // Maestro stats
      expect(res.maestros).toHaveLength(1)
      expect(res.maestros[0].maestroNombre).toBe('Prof. Carlos Méndez')
      expect(res.maestros[0].totalSesiones).toBe(3)
      expect(res.maestros[0].totalAusentes).toBe(3)
    })

    it('should handle empty sessions gracefully', async () => {
      supabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }))

      const res = await metricsApi.getAnalisisAsistenciasPeriodoActivo({ fechaInicio: '2026-01-01' })
      expect(res.resumen.totalAlumnosEvaluados).toBe(0)
      expect(res.resumen.totalAusentes).toBe(0)
      expect(res.alumnos).toEqual([])
      expect(res.maestros).toEqual([])
    })
  })

  describe('metricasMock.getAnalisisAsistenciasPeriodoActivo (Demo Mode)', () => {
    it('should return mock attendance analysis with realistic data', async () => {
      const res = await metricasMock.getAnalisisAsistenciasPeriodoActivo()

      expect(res).toBeDefined()
      expect(res.periodo).toHaveProperty('nombre')
      expect(res.periodo).toHaveProperty('fecha_inicio')
      expect(res.resumen.totalAlumnosEvaluados).toBeGreaterThan(0)
      expect(res.resumen.alumnosConFaltas).toBeGreaterThan(0)
      expect(res.resumen.alumnosSinFaltas).toBeGreaterThan(0)
      expect(res.resumen.totalAusentes).toBeGreaterThan(0)
      expect(res.alumnos.length).toBeGreaterThan(0)
      expect(res.maestros.length).toBeGreaterThan(0)

      // Verify structure of students
      const primerAlumno = res.alumnos[0]
      expect(primerAlumno).toHaveProperty('alumnoNombre')
      expect(primerAlumno).toHaveProperty('totalPresentes')
      expect(primerAlumno).toHaveProperty('totalAusentes')
      expect(primerAlumno).toHaveProperty('tasaAsistencia')
      expect(primerAlumno).toHaveProperty('nivelRiesgo')
    })
  })

  describe('analisisAsistenciasWidget (UI Component)', () => {
    let container
    const mockWidgetData = {
      periodo: {
        id: 'per-001',
        nombre: 'Trimestre 1 2026',
        fecha_inicio: '2026-01-15',
        fecha_fin: '2026-04-15',
        activo: true,
        dias_transcurridos: 60,
      },
      resumen: {
        totalAlumnosEvaluados: 12,
        alumnosConFaltas: 6,
        alumnosSinFaltas: 6,
        porcentajeAlumnosConFaltas: 50.0,
        totalRegistros: 172,
        totalPresentes: 155,
        totalAusentes: 13,
        totalJustificados: 4,
        tasaAusentismo: 7.6,
        totalSesionesRegistradas: 46,
        totalMaestrosConRegistros: 4,
      },
      alumnos: [
        {
          alumnoId: 'alum-001',
          alumnoNombre: 'Mateo Fernández',
          instrumento: 'Violín',
          programa: 'Violín Cátedra Intermedio',
          totalPresentes: 10,
          totalAusentes: 4,
          totalJustificados: 1,
          totalRegistros: 15,
          tasaAsistencia: 73.3,
          nivelRiesgo: 'critico',
          ultimaFalta: '2026-03-28',
          clasesAfectadas: ['Violín Práctica Avanzada'],
          maestrosReportaron: ['Prof. Carlos Méndez'],
          detalleFaltas: [
            { fecha: '2026-03-28', claseNombre: 'Violín Práctica Avanzada', maestroNombre: 'Prof. Carlos Méndez', estado: 'ausente', justificacion: null },
          ],
        },
        {
          alumnoId: 'alum-007',
          alumnoNombre: 'Valeria Russo',
          instrumento: 'Violín',
          programa: 'Violín Cátedra Avanzada',
          totalPresentes: 15,
          totalAusentes: 0,
          totalJustificados: 0,
          totalRegistros: 15,
          tasaAsistencia: 100.0,
          nivelRiesgo: 'normal',
          ultimaFalta: null,
          clasesAfectadas: [],
          maestrosReportaron: [],
          detalleFaltas: [],
        },
      ],
      maestros: [
        {
          maestroId: 'm-1',
          maestroNombre: 'Prof. Carlos Méndez',
          totalSesiones: 14,
          totalRegistros: 98,
          totalPresentes: 87,
          totalAusentes: 6,
          totalJustificados: 5,
          tasaAusentismo: 6.1,
          clases: ['Violín Práctica Avanzada'],
        },
      ],
    }

    beforeEach(() => {
      document.body.innerHTML = ''
      container = document.createElement('div')
      container.id = 'test-widget-container'
      document.body.appendChild(container)

      getAnalisisAsistenciasPeriodoActivo.mockResolvedValue(mockWidgetData)
    })


    it('should render KPI cards, filters, student table and teacher list', async () => {
      const widget = analisisAsistenciasWidget('test-widget-container')
      expect(widget).toBeDefined()

      await widget.init()

      expect(container.querySelector('.obs-asistencias-analisis-widget')).not.toBeNull()
      expect(container.querySelector('.obs-attendance-kpi-card')).not.toBeNull()
      expect(container.querySelector('#obs-input-busqueda-asistencia')).not.toBeNull()
      expect(container.querySelector('#obs-select-maestro')).not.toBeNull()
      expect(container.querySelector('.obs-attendance-table')).not.toBeNull()
      expect(container.textContent).toContain('Mateo Fernández')
      expect(container.textContent).toContain('Valeria Russo')
    })

    it('should filter students by search input', async () => {
      const widget = analisisAsistenciasWidget('test-widget-container')
      await widget.init()

      const input = container.querySelector('#obs-input-busqueda-asistencia')
      input.value = 'Mateo'
      input.dispatchEvent(new Event('input'))

      const rows = container.querySelectorAll('.obs-alumnos-table tbody tr')
      expect(rows.length).toBe(1)
      expect(container.textContent).toContain('Mateo Fernández')
      expect(container.textContent).not.toContain('Valeria Russo')
    })

    it('should filter students by severity chip', async () => {
      const widget = analisisAsistenciasWidget('test-widget-container')
      await widget.init()

      // Click "Asistencia Perfecta"
      const chipPerfecta = container.querySelector('[data-sev="perfecta"]')
      chipPerfecta.click()

      const rows = container.querySelectorAll('.obs-alumnos-table tbody tr')
      expect(rows.length).toBe(1)
      expect(container.textContent).toContain('Valeria Russo')
      expect(container.textContent).not.toContain('Mateo Fernández')
    })


    it('should open modal when clicking on Detalle button', async () => {
      const widget = analisisAsistenciasWidget('test-widget-container')
      await widget.init()

      const btnDetalle = container.querySelector('.btn-ver-detalle-asistencia')
      expect(btnDetalle).not.toBeNull()

      btnDetalle.click()
      expect(AppModal.open).toHaveBeenCalled()
      const modalCall = AppModal.open.mock.calls[0][0]
      expect(modalCall.title).toContain('Detalle de Asistencia')
      expect(modalCall.body).toContain('Mateo Fernández')
    })
  })
})
