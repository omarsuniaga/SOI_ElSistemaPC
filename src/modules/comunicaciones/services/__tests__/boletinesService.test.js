import { describe, test, expect, vi, beforeEach } from 'vitest'
import {
  procesarAusenciasSemanales,
  procesarEvaluacionBaja,
  procesarAvancePedagogico,
  procesarCumpleanosDiarios,
  obtenerBoletinesEnviados
} from '../boletinesService.js'
import * as alumnosApi from '../../../alumnos/api/alumnosApi.js'
import * as asistenciasApi from '../../../asistencias/api/asistenciasApi.js'

vi.mock('../../../alumnos/api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn(),
  obtenerAlumno: vi.fn()
}))

vi.mock('../../../asistencias/api/asistenciasApi.js', () => ({
  getReporteConsolidado: vi.fn()
}))

describe('boletinesService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    import.meta.env.VITE_USE_MOCK = 'true'
  })

  test('obtenerBoletinesEnviados returns empty array initially', () => {
    expect(obtenerBoletinesEnviados()).toEqual([])
  })

  test('procesarAusenciasSemanales generates bulletin for student with 3+ absences', async () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Mock attendance data (3 absences)
    asistenciasApi.getReporteConsolidado.mockResolvedValue({
      resumenGlobal: { totalClases: 5, totalSesiones: 5, totalPresentes: 2, totalAusentes: 3, totalRegistros: 5 },
      timelineByDate: [
        {
          fecha: today,
          clases: [
            {
              asistencias: [
                { alumno_id: 'stud-1', estado: 'ausente' },
                { alumno_id: 'stud-1', estado: 'ausente' },
                { alumno_id: 'stud-1', estado: 'ausente' }
              ]
            }
          ]
        }
      ]
    })

    // Mock student data
    alumnosApi.obtenerAlumnos.mockResolvedValue({
      alumnos: [
        {
          id: 'stud-1',
          nombre_completo: 'Julio Cortazar',
          representante_nombre: 'Fanny Cortazar',
          madre_tlf_whatsapp: '+18095551234'
        }
      ]
    })

    const result = await procesarAusenciasSemanales()
    expect(result.procesados).toBe(1)
    expect(result.enviados).toBe(1)

    const logs = obtenerBoletinesEnviados()
    expect(logs.length).toBe(1)
    expect(logs[0].alumno_nombre).toBe('Julio Cortazar')
    expect(logs[0].tipo).toBe('ausencia_irregular')
    expect(logs[0].contacto_telefono).toBe('+18095551234')
  })

  test('procesarEvaluacionBaja creates bulletin for grade < 3 on critical indicator', async () => {
    alumnosApi.obtenerAlumno.mockResolvedValue({
      id: 'stud-1',
      nombre_completo: 'Julio Cortazar',
      representante_nombre: 'Fanny Cortazar',
      madre_tlf_whatsapp: '+18095551234'
    })

    // demo-ind-1 is a critical/required indicator in Mock Mode
    await procesarEvaluacionBaja('session-1', 'stud-1', 2, 'Falta postura recta', 'demo-ind-1')

    const logs = obtenerBoletinesEnviados()
    expect(logs.length).toBe(1)
    expect(logs[0].tipo).toBe('desempeno_bajo')
    expect(logs[0].mensaje).toContain('desempeño bajo')
    expect(logs[0].mensaje).toContain('Espalda alineada')
  })

  test('procesarAvancePedagogico creates achievement bulletin', async () => {
    alumnosApi.obtenerAlumno.mockResolvedValue({
      id: 'stud-1',
      nombre_completo: 'Julio Cortazar',
      representante_nombre: 'Fanny Cortazar',
      madre_tlf_whatsapp: '+18095551234'
    })

    await procesarAvancePedagogico('stud-1', 'demo-ind-2')

    const logs = obtenerBoletinesEnviados()
    expect(logs.length).toBe(1)
    expect(logs[0].tipo).toBe('logro_pedagogico')
    expect(logs[0].mensaje).toContain('nuevo logro')
    expect(logs[0].mensaje).toContain('Hombros relajados')
  })

  test('procesarCumpleanosDiarios detects and generates birthday bulletin', async () => {
    const todayMMDD = new Date().toISOString().slice(5, 10)
    
    alumnosApi.obtenerAlumnos.mockResolvedValue({
      alumnos: [
        {
          id: 'stud-2',
          nombre_completo: 'Borges Jorge',
          fecha_nacimiento: `2015-${todayMMDD}`,
          representante_nombre: 'Leonor Acevedo',
          madre_tlf_whatsapp: '+18095559999'
        }
      ]
    })

    const result = await procesarCumpleanosDiarios()
    expect(result.enviados).toBe(1)

    const logs = obtenerBoletinesEnviados()
    expect(logs.length).toBe(1)
    expect(logs[0].tipo).toBe('cumpleanos')
    expect(logs[0].mensaje).toContain('¡Feliz cumpleaños Borges Jorge!')
  })
})
