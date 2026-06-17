import { describe, expect, it } from 'vitest'
import { generarPdfReporteMaestro } from '../../../../src/modules/maestros/domain/generarPdfReporteMaestro.js'

describe('generarPdfReporteMaestro', () => {
  const maestro = {
    id: 'maestro-1',
    nombre: 'Carlos Santana',
    email: 'carlos@sistemas.com',
    telefono: '809-123-4567',
    instrumento: 'Guitarra',
    especialidades: ['Guitarra Eléctrica', 'Guitarra Clásica'],
    bio: 'Profesor de cuerdas',
    is_active: true
  }

  const clases = [
    {
      id: 'clase-1',
      nombre: 'Guitarra Inicial',
      instrumento: 'Guitarra',
      total_alumnos: 2,
      es_suplente: false,
      horarios: [
        { dia: 'lunes', hora_inicio: '15:00:00', hora_fin: '16:00:00', salon_id: 'salon-1' }
      ]
    }
  ]

  const inscripcionesMap = {
    'clase-1': [
      {
        fecha_inscripcion: '2026-06-01',
        alumno: {
          nombre_completo: 'Juan Pérez',
          cedula: '123-456',
          instrumento_principal: 'Guitarra',
          familiar_telefono: '809-555-0199'
        }
      }
    ]
  }

  const context = {
    salones: [{ id: 'salon-1', nombre: 'Salón Cuerdas' }]
  }

  it('correctly generates jsPDF document instance', () => {
    const doc = generarPdfReporteMaestro(maestro, clases, inscripcionesMap, context)
    expect(doc).toBeDefined()
    expect(typeof doc.save).toBe('function')
    expect(doc.internal.getNumberOfPages()).toBe(2) // 1 overview/schedule page + 1 class details page
  })
})
