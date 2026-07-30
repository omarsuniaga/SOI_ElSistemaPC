import { describe, expect, it } from 'vitest'
import {
  buildClasePdfFilename,
  buildClasePdfRows,
  formatClaseHorariosForPdf,
  resolveClasePdfMetadata,
} from '../domain/generarPdfClase.js'

describe('generarPdfClase helpers', () => {
  const clase = {
    id: 'clase-1',
    nombre: 'Violín Inicial A',
    instrumento: 'Violín',
    estado: 'activa',
    capacidad_maxima: 12,
    tipo_clase: 'grupal',
    descripcion: 'Trabajo de postura',
    maestro_principal_id: 'maestro-1',
    maestro_suplente_id: 'maestro-2',
    programa_id: 'programa-1',
    horarios: [
      { dia: 'lunes', hora_inicio: '16:00:00', hora_fin: '17:00:00', salon_id: 'salon-1' },
      { dia: 'miércoles', hora_inicio: '18:00', hora_fin: '19:30', salon_id: null },
    ],
  }

  const context = {
    maestros: [
      { id: 'maestro-1', nombre_completo: 'Ana Rivera' },
      { id: 'maestro-2', nombre: 'Luis Pérez' },
    ],
    programas: [{ id: 'programa-1', nombre: 'Orquestal' }],
    salones: [{ id: 'salon-1', nombre: 'Salón A' }],
  }

  it('resolves class metadata with teacher, substitute, program and capacity', () => {
    const metadata = resolveClasePdfMetadata(clase, context)

    expect(metadata.maestroPrincipal).toBe('Ana Rivera')
    expect(metadata.maestroSuplente).toBe('Luis Pérez')
    expect(metadata.programa).toBe('Orquestal')
    expect(metadata.capacidad).toBe(12)
  })

  it('formats class schedules including room fallback', () => {
    const horarios = formatClaseHorariosForPdf(clase.horarios, context.salones)

    expect(horarios).toBe('Lunes 16:00 - 17:00 · Salón A\nMiércoles 18:00 - 19:30 · Sin salón')
  })

  it('builds rows with own hora_inicio/hora_fin when the enrollment carries it (turnos rotativos)', () => {
    const rows = buildClasePdfRows([
      {
        fecha_inscripcion: '2026-05-10',
        hora_inicio: '16:00',
        hora_fin: '16:30',
        alumno: {
          nombre_completo: 'Carla Gómez',
          instrumento_principal: 'Violín',
          tlf_alumno: '809-000-0000',
          updated_at: '2026-06-01T10:00:00Z',
        },
      },
    ], clase.horarios)

    expect(rows).toEqual([
      [1, 'Carla Gómez', 'Violín', '809-000-0000', '1 jun 2026', '16:00-16:30'],
    ])
  })

  it('falls back to the class schedule when the enrollment has no own hora_inicio/hora_fin (caso grupal)', () => {
    const rows = buildClasePdfRows([
      {
        fecha_inscripcion: '2026-05-10',
        alumno: {
          nombre_completo: 'Carla Gómez',
          instrumento_principal: 'Violín',
          representante_tlf: '809-111-1111',
          updated_at: '2026-06-01T10:00:00Z',
        },
      },
    ], clase.horarios)

    expect(rows).toEqual([
      [1, 'Carla Gómez', 'Violín', '809-111-1111', '1 jun 2026', 'Lun 16:00-17:00\nMié 18:00-19:30'],
    ])
  })

  it('falls back through phone candidates and shows — when nothing is on file', () => {
    const rows = buildClasePdfRows([
      { alumno: { nombre_completo: 'Sin Datos', instrumento_principal: 'Viola' } },
    ], [])

    expect(rows).toEqual([
      [1, 'Sin Datos', 'Viola', '—', '—', '—'],
    ])
  })

  it('builds a safe filename from class name and date', () => {
    expect(buildClasePdfFilename('Violín Inicial A', '2026-06-17')).toBe('clase-violin-inicial-a-2026-06-17.pdf')
  })
})
