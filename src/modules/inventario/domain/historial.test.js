import { describe, test, expect } from 'vitest'
import {
  TIPOS_EVENTO,
  ICONOS_EVENTO,
  crearEvento,
  crearEventoAsignacion,
  crearEventoDevolucion,
  lineTime,
  eventosPorTipo,
  agruparPorFecha,
  formatearEvento,
} from './historial.js'

describe('TIPOS_EVENTO', () => {
  test('incluye todos los tipos esperados', () => {
    expect(TIPOS_EVENTO).toContain('asignacion')
    expect(TIPOS_EVENTO).toContain('devolucion')
    expect(TIPOS_EVENTO).toContain('reparacion')
    expect(TIPOS_EVENTO).toContain('cambio_estado')
    expect(TIPOS_EVENTO).toContain('baja')
    expect(TIPOS_EVENTO).toContain('creacion')
    expect(TIPOS_EVENTO).toContain('observacion')
  })

  test('tiene al menos 5 tipos', () => {
    expect(TIPOS_EVENTO.length).toBeGreaterThanOrEqual(5)
  })
})

describe('ICONOS_EVENTO', () => {
  test('tiene icono para cada tipo', () => {
    TIPOS_EVENTO.forEach(tipo => {
      expect(ICONOS_EVENTO[tipo]).toBeDefined()
    })
  })
})

describe('crearEvento', () => {
  test('crea objeto de evento con todos los datos', () => {
    const evento = crearEvento('act-1', 'asignacion', 'Asignado a alumno', 'user-1', { alumno_id: 'al-1' })
    expect(evento.activo_id).toBe('act-1')
    expect(evento.tipo_evento).toBe('asignacion')
    expect(evento.descripcion).toBe('Asignado a alumno')
    expect(evento.usuario_id).toBe('user-1')
    expect(evento.metadata).toEqual({ alumno_id: 'al-1' })
    expect(evento.fecha).toBeDefined()
    expect(evento.id).toBeDefined()
  })

  test('lanza error si tipo_evento no está en TIPOS_EVENTO', () => {
    expect(() => crearEvento('act-1', 'inexistente', 'test', 'user-1')).toThrow()
  })
})

describe('crearEventoAsignacion', () => {
  test('crea evento de asignación con formato correcto', () => {
    const evento = crearEventoAsignacion('act-1', 'Alumno Test', 'user-1')
    expect(evento.tipo_evento).toBe('asignacion')
    expect(evento.descripcion).toMatch(/Alumno Test/)
  })
})

describe('crearEventoDevolucion', () => {
  test('crea evento de devolución con formato correcto', () => {
    const evento = crearEventoDevolucion('act-1', 'Alumno Test', 'user-1')
    expect(evento.tipo_evento).toBe('devolucion')
    expect(evento.descripcion).toMatch(/Alumno Test/)
  })
})

describe('eventosPorTipo', () => {
  const eventos = [
    { id: '1', tipo_evento: 'asignacion' },
    { id: '2', tipo_evento: 'devolucion' },
    { id: '3', tipo_evento: 'asignacion' },
  ]

  test('filtra eventos por tipo', () => {
    const resultado = eventosPorTipo(eventos, 'asignacion')
    expect(resultado).toHaveLength(2)
  })

  test('retorna array vacío si no hay coincidencias', () => {
    const resultado = eventosPorTipo(eventos, 'baja')
    expect(resultado).toEqual([])
  })
})

describe('agruparPorFecha', () => {
  const eventos = [
    { id: '1', fecha: '2026-06-01T10:00:00Z' },
    { id: '2', fecha: '2026-06-01T15:00:00Z' },
    { id: '3', fecha: '2026-05-15T10:00:00Z' },
    { id: '4', fecha: '2026-07-10T10:00:00Z' },
  ]

  test('agrupa eventos por mes/año', () => {
    const agrupado = agruparPorFecha(eventos)
    const keys = Object.keys(agrupado)
    expect(keys).toContain('2026-06')
    expect(keys).toContain('2026-05')
    expect(keys).toContain('2026-07')
    expect(agrupado['2026-06']).toHaveLength(2)
    expect(agrupado['2026-05']).toHaveLength(1)
  })

  test('retorna objeto vacío para array vacío', () => {
    expect(agruparPorFecha([])).toEqual({})
  })
})

describe('formatearEvento', () => {
  test('retorna objeto con icono y fecha legible', () => {
    const evento = {
      id: '1',
      tipo_evento: 'asignacion',
      descripcion: 'Asignado',
      fecha: '2026-06-15T10:00:00Z',
      usuario_id: 'user-1',
    }
    const formateado = formatearEvento(evento)
    expect(formateado.icono).toBeDefined()
    expect(formateado.fecha_legible).toBeDefined()
    expect(formateado.tipo_evento).toBe('asignacion')
    expect(formateado.descripcion).toBe('Asignado')
  })

  test('incluye icono Bootstrap según tipo', () => {
    const evento = { id: '1', tipo_evento: 'reparacion', descripcion: 'test', fecha: new Date().toISOString() }
    const formateado = formatearEvento(evento)
    expect(formateado.icono).toMatch(/bi-/)
  })
})

describe('lineTime', () => {
  const eventos = [
    { id: '1', tipo_evento: 'creacion', descripcion: 'Creado', fecha: '2026-01-01T10:00:00Z' },
    { id: '2', tipo_evento: 'asignacion', descripcion: 'Asignado', fecha: '2026-03-15T10:00:00Z' },
    { id: '3', tipo_evento: 'devolucion', descripcion: 'Devuelto', fecha: '2026-06-01T10:00:00Z' },
  ]

  test('retorna eventos ordenados por fecha descendente', () => {
    const timeline = lineTime(eventos)
    expect(timeline).toHaveLength(3)
    expect(timeline[0].id).toBe('3')
    expect(timeline[2].id).toBe('1')
  })

  test('cada entrada tiene fecha_legible', () => {
    const timeline = lineTime(eventos)
    timeline.forEach(e => {
      expect(e.fecha_legible).toBeDefined()
    })
  })
})
