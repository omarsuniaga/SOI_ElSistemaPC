import { describe, test, expect } from 'vitest'
import {
  CATEGORIAS_EVENTO,
  diasHasta,
  agruparPorMes,
  esProximo,
} from '../calendarioCom.js'

const HOY = new Date('2026-06-25T12:00:00')
const ev = (over = {}) => ({ id: 'e', titulo: 'Evento', categoria: 'concierto', fecha_inicio: '2026-06-25T18:00:00', ...over })

describe('CATEGORIAS_EVENTO', () => {
  test('cubre las categorías del enum event_categoria', () => {
    expect(Object.keys(CATEGORIAS_EVENTO)).toEqual(
      expect.arrayContaining([
        'concierto', 'ensayo', 'reunion', 'patrocinio', 'pago', 'corte', 'inscripcion', 'auditoria', 'otro',
      ]),
    )
  })
  test('cada categoría tiene label e icon', () => {
    for (const v of Object.values(CATEGORIAS_EVENTO)) {
      expect(v).toHaveProperty('label')
      expect(v).toHaveProperty('icon')
    }
  })
})

describe('diasHasta', () => {
  test('0 si el evento es hoy', () => {
    expect(diasHasta(ev({ fecha_inicio: '2026-06-25T18:00:00' }), HOY)).toBe(0)
  })
  test('positivo si es futuro', () => {
    expect(diasHasta(ev({ fecha_inicio: '2026-06-28T10:00:00' }), HOY)).toBe(3)
  })
  test('negativo si ya pasó', () => {
    expect(diasHasta(ev({ fecha_inicio: '2026-06-20T10:00:00' }), HOY)).toBe(-5)
  })
})

describe('esProximo', () => {
  test('true si está dentro de la ventana de días (default 30)', () => {
    expect(esProximo(ev({ fecha_inicio: '2026-07-10T10:00:00' }), 30, HOY)).toBe(true)
  })
  test('false si ya pasó', () => {
    expect(esProximo(ev({ fecha_inicio: '2026-06-20T10:00:00' }), 30, HOY)).toBe(false)
  })
  test('false si está más allá de la ventana', () => {
    expect(esProximo(ev({ fecha_inicio: '2026-09-01T10:00:00' }), 30, HOY)).toBe(false)
  })
})

describe('agruparPorMes', () => {
  test('agrupa eventos por mes en orden cronológico', () => {
    const eventos = [
      ev({ id: 'b', fecha_inicio: '2026-07-05T10:00:00' }),
      ev({ id: 'a', fecha_inicio: '2026-06-28T10:00:00' }),
      ev({ id: 'c', fecha_inicio: '2026-07-20T10:00:00' }),
    ]
    const grupos = agruparPorMes(eventos)
    expect(grupos).toHaveLength(2)
    expect(grupos[0].clave).toBe('2026-06')
    expect(grupos[0].eventos.map((e) => e.id)).toEqual(['a'])
    expect(grupos[1].clave).toBe('2026-07')
    expect(grupos[1].eventos.map((e) => e.id)).toEqual(['b', 'c'])
  })
  test('lista vacía devuelve []', () => {
    expect(agruparPorMes([])).toEqual([])
  })
})
