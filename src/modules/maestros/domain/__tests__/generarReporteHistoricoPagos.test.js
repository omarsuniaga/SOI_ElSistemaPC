import { describe, it, expect } from 'vitest'
import {
  resumirCumplimiento,
  enumerarFechasEsperadas,
  diaNombreAWeekday,
  etiquetaEstado,
  construirHtmlHistoricoPagos,
} from '../generarReporteHistoricoPagos.js'

describe('diaNombreAWeekday', () => {
  it('mapea nombres en español (con y sin acento) a weekday 0-6', () => {
    expect(diaNombreAWeekday('domingo')).toBe(0)
    expect(diaNombreAWeekday('Lunes')).toBe(1)
    expect(diaNombreAWeekday('miércoles')).toBe(3)
    expect(diaNombreAWeekday('MIERCOLES')).toBe(3)
    expect(diaNombreAWeekday('sábado')).toBe(6)
  })
  it('devuelve null para valores desconocidos', () => {
    expect(diaNombreAWeekday('funday')).toBeNull()
    expect(diaNombreAWeekday(null)).toBeNull()
  })
})

describe('etiquetaEstado', () => {
  it('traduce vencida a SIN REGISTRO', () => {
    expect(etiquetaEstado('vencida')).toBe('SIN REGISTRO')
  })
  it('conserva otros estados y normaliza cubierta_emergente', () => {
    expect(etiquetaEstado('registrada')).toBe('registrada')
    expect(etiquetaEstado('cubierta_emergente')).toBe('cubierta emergente')
    expect(etiquetaEstado('futura')).toBe('futura')
  })
})

describe('resumirCumplimiento', () => {
  it('cuenta por estado y calcula el % de cumplimiento', () => {
    const r = resumirCumplimiento([
      { estado: 'registrada' },
      { estado: 'registrada' },
      { estado: 'cubierta_emergente' },
      { estado: 'vencida' },
      { estado: 'pendiente' },
      { estado: 'futura' },
    ])
    expect(r.esperadas).toBe(6)
    expect(r.registradas).toBe(2)
    expect(r.cubiertas).toBe(1)
    expect(r.sinRegistro).toBe(1)
    expect(r.pendientes).toBe(1)
    expect(r.futuras).toBe(1)
    // evaluables = 2 + 1 + 1 = 4 ; (2+1)/4 = 75%
    expect(r.pctCumplimiento).toBe(75)
  })
  it('es defensivo ante entradas no-array', () => {
    const r = resumirCumplimiento(null)
    expect(r.esperadas).toBe(0)
    expect(r.pctCumplimiento).toBe(0)
  })
})

describe('enumerarFechasEsperadas', () => {
  it('enumera las fechas del rango que caen en un día del horario', () => {
    // 2026-08-01 es sábado. Horario de miércoles y viernes.
    const horario = [
      { dia: 'miércoles', hora_inicio: '15:30', hora_fin: '17:30', clase: '0A- Violines' },
      { dia: 'viernes', hora_inicio: '15:30', hora_fin: '17:30', clase: '0A- Violines' },
    ]
    const fechas = enumerarFechasEsperadas(horario, '2026-08-01', '2026-08-14')
    const dias = fechas.map((f) => f.fecha)
    expect(dias).toEqual(['2026-08-05', '2026-08-07', '2026-08-12', '2026-08-14'])
    expect(fechas[0].estado).toBe('pendiente')
    expect(fechas[0].clase_nombre).toBe('0A- Violines')
  })
  it('devuelve [] si el rango es inválido o no hay horario', () => {
    expect(enumerarFechasEsperadas([], '2026-08-01', '2026-08-14')).toEqual([])
    expect(enumerarFechasEsperadas([{ dia: 'lunes' }], '2026-08-14', '2026-08-01')).toEqual([])
  })
})

describe('construirHtmlHistoricoPagos', () => {
  const data = {
    maestro: {
      nombre_completo: 'Edelyn Abreu Mejía',
      especialidad: 'Violin',
      correo: 'edelyn@example.com',
      tlf: '8299636465',
    },
    rango: { desde: '2026-08-10', hasta: '2026-08-28', periodoNombre: 'Semestre 2026-II' },
    horario: [
      { dia: 'viernes', hora_inicio: '15:30:00', hora_fin: '17:30:00', clase: '0A- Iniciación de Violines', salon: 'Salón Elila Mena' },
    ],
    fechas: [
      {
        fecha: '2026-08-12',
        dia: 'miércoles',
        estado: 'vencida',
        estadoLabel: 'SIN REGISTRO',
        dias_atraso: 16,
        asistencia: { P: 0, A: 0, J: 0 },
        tema: '',
        observaciones: '',
        sesion_id: null,
      },
      {
        fecha: '2026-08-14',
        dia: 'viernes',
        estado: 'registrada',
        estadoLabel: 'registrada',
        dias_atraso: 14,
        asistencia: { P: 5, A: 5, J: 0 },
        tema: 'Agarre del arco',
        observaciones: 'Buen avance general',
        sesion_id: 's-1',
      },
    ],
    sesiones: [
      {
        fecha: '2026-08-14',
        clase_nombre: '0A- Iniciación de Violines',
        asistencia: { P: 5, A: 5, J: 0 },
        tema_principal: 'Agarre del arco',
        contenido: 'Ejercicios de pase de arco en cuerda re',
        observaciones_generales: '',
        observaciones_raw: 'Hoy repasamos el agarre del arco',
      },
    ],
    justificaciones: [
      {
        alumno: 'Juan Pérez',
        fecha: '2026-08-14',
        motivo: 'Cita médica',
        categoria: 'salud',
        estado: 'pendiente',
        evidencia_url: 'https://example.com/eviden.pdf',
      },
    ],
  }

  const html = construirHtmlHistoricoPagos(data)

  it('es un documento HTML completo', () => {
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(html).toContain('</html>')
  })
  it('incluye el nombre del maestro y el período', () => {
    expect(html).toContain('Edelyn Abreu Mejía')
    expect(html).toContain('Semestre 2026-II')
  })
  it('muestra la fila SIN REGISTRO', () => {
    expect(html).toContain('SIN REGISTRO')
  })
  it('incluye el horario semanal con salón', () => {
    expect(html).toContain('Salón Elila Mena')
  })
  it('incluye contenido de sesión y observaciones de bitácora', () => {
    expect(html).toContain('Ejercicios de pase de arco en cuerda re')
    expect(html).toContain('Hoy repasamos el agarre del arco')
  })
  it('incluye la fila de justificación de un alumno', () => {
    expect(html).toContain('Juan Pérez')
    expect(html).toContain('Cita médica')
    expect(html).toContain('ver evidencia')
  })
  it('no rompe con data vacía', () => {
    const empty = construirHtmlHistoricoPagos({})
    expect(empty).toContain('<!DOCTYPE html>')
    expect(empty).toContain('Sin horario semanal registrado')
  })
})
