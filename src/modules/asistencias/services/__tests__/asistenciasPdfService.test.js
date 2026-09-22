import { describe, it, expect } from 'vitest'
import {
  filtrarTimelinePorMes,
  construirDatosInformeAsistencias,
} from '../asistenciasPdfService.js'

const timeline = [
  {
    fecha: '2026-09-10',
    clases: [
      {
        clase_id: 'c1',
        clase_nombre: 'Violín N2',
        maestro_nombre: 'Omar',
        instrumento: 'Violín',
        presentes: 2,
        justificados: 1,
        ausentes: 1,
        asistencias: [
          { alumno_id: 'a1', alumno_nombre: 'Ana', estado: 'presente', instrumento: 'Violín' },
          { alumno_id: 'a2', alumno_nombre: 'Luis', estado: 'presente', instrumento: 'Violín' },
          { alumno_id: 'a3', alumno_nombre: 'Marta', estado: 'justificado', instrumento: 'Violín' },
          { alumno_id: 'a4', alumno_nombre: 'Pedro', estado: 'ausente', instrumento: 'Violín' },
        ],
      },
    ],
  },
  {
    fecha: '2026-09-17',
    clases: [
      {
        clase_id: 'c1',
        clase_nombre: 'Violín N2',
        maestro_nombre: 'Omar',
        instrumento: 'Violín',
        presentes: 2,
        justificados: 0,
        ausentes: 2,
        asistencias: [
          { alumno_id: 'a1', alumno_nombre: 'Ana', estado: 'presente', instrumento: 'Violín' },
          { alumno_id: 'a2', alumno_nombre: 'Luis', estado: 'presente', instrumento: 'Violín' },
          { alumno_id: 'a3', alumno_nombre: 'Marta', estado: 'ausente', instrumento: 'Violín' },
          { alumno_id: 'a4', alumno_nombre: 'Pedro', estado: 'ausente', instrumento: 'Violín' },
        ],
      },
      {
        clase_id: 'c2',
        clase_nombre: 'Viola N1',
        maestro_nombre: 'Omar',
        instrumento: 'Viola',
        presentes: 1,
        justificados: 1,
        ausentes: 0,
        asistencias: [
          { alumno_id: 'a5', alumno_nombre: 'Sara', estado: 'presente', instrumento: 'Viola' },
          { alumno_id: 'a6', alumno_nombre: 'Joel', estado: 'justificado', instrumento: 'Viola' },
        ],
      },
    ],
  },
  {
    fecha: '2026-08-29',
    clases: [
      {
        clase_id: 'c3',
        clase_nombre: 'Orquesta',
        maestro_nombre: 'Equipo',
        instrumento: 'Orquesta',
        presentes: 10,
        justificados: 0,
        ausentes: 0,
        asistencias: [],
      },
    ],
  },
]

describe('filtrarTimelinePorMes', () => {
  it('exporta solo el mes visible del calendario', () => {
    const septiembre = filtrarTimelinePorMes(timeline, 2026, 8)
    expect(septiembre.map((d) => d.fecha)).toEqual(['2026-09-10', '2026-09-17'])
  })
})

describe('construirDatosInformeAsistencias', () => {
  it('calcula tasa real con presentes, sin contar justificados como asistentes', () => {
    const septiembre = filtrarTimelinePorMes(timeline, 2026, 8)
    const { resumen } = construirDatosInformeAsistencias(septiembre)

    expect(resumen.totalSesiones).toBe(3)
    expect(resumen.convocatorias).toBe(10)
    expect(resumen.presentes).toBe(5)
    expect(resumen.justificados).toBe(2)
    expect(resumen.ausentes).toBe(3)
    expect(resumen.tasaAsistenciaPct).toBe(50)
    expect(resumen.tasaJustificadaPct).toBe(20)
    expect(resumen.tasaInjustificadaPct).toBe(30)
  })

  it('consolida correctamente por día y por clase', () => {
    const septiembre = filtrarTimelinePorMes(timeline, 2026, 8)
    const datos = construirDatosInformeAsistencias(septiembre)

    expect(datos.resumenPorDia).toEqual([
      expect.objectContaining({
        fecha: '2026-09-10',
        sesiones: 1,
        convocatorias: 4,
        presentes: 2,
        justificados: 1,
        ausentes: 1,
        tasaAsistenciaPct: 50,
      }),
      expect.objectContaining({
        fecha: '2026-09-17',
        sesiones: 2,
        convocatorias: 6,
        presentes: 3,
        justificados: 1,
        ausentes: 2,
        tasaAsistenciaPct: 50,
      }),
    ])

    const violin = datos.resumenPorClase.find((c) => c.clase === 'Violín N2')
    expect(violin).toEqual(expect.objectContaining({
      sesiones: 2,
      convocatorias: 8,
      presentes: 4,
      justificados: 1,
      ausentes: 3,
      tasaAsistenciaPct: 50,
    }))
  })

  it('marca incidencias solo desde dos ausencias acumuladas y conserva su naturaleza', () => {
    const septiembre = filtrarTimelinePorMes(timeline, 2026, 8)
    const { incidencias } = construirDatosInformeAsistencias(septiembre)

    expect(incidencias.map((a) => a.alumno)).toEqual(['Marta', 'Pedro'])
    expect(incidencias.find((a) => a.alumno === 'Marta')).toEqual(expect.objectContaining({
      ausencias: 2,
      justificadas: 1,
      injustificadas: 1,
    }))
    expect(incidencias.find((a) => a.alumno === 'Pedro')).toEqual(expect.objectContaining({
      ausencias: 2,
      justificadas: 0,
      injustificadas: 2,
    }))
  })
})
