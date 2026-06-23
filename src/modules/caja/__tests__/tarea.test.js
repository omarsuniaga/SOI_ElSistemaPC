import { describe, test, expect } from 'vitest'
import { buildTarea, calcularProximaOcurrencia, tareaVencida, buildTareaDesdeNotif } from '../domain/tarea.js'

describe('buildTarea', () => {
  const base = {
    titulo: 'Seguimiento pago',
    tipo: 'seguimiento_pago',
    asignado_a: 'usr-1',
    familia_id: 'fam-1',
    alumno_id: 'alu-1',
    prioridad: 'media',
    fecha_vencimiento: '2026-07-01',
    recurrente: false,
    patron_recurrencia: null,
  }

  test('builds tarea with required fields', () => {
    const t = buildTarea(base)
    expect(t.titulo).toBe('Seguimiento pago')
    expect(t.tipo).toBe('seguimiento_pago')
    expect(t.asignado_a).toBe('usr-1')
    expect(t.familia_id).toBe('fam-1')
  })

  test('estado defaults to pendiente', () => {
    const t = buildTarea(base)
    expect(t.estado).toBe('pendiente')
  })

  test('recurrente preserved', () => {
    const t = buildTarea({ ...base, recurrente: true, patron_recurrencia: { tipo: 'mensual', dia: 1 } })
    expect(t.recurrente).toBe(true)
    expect(t.patron_recurrencia.tipo).toBe('mensual')
  })
})

describe('calcularProximaOcurrencia', () => {
  test('non-recurrent tarea → null', () => {
    const t = { recurrente: false, patron_recurrencia: null }
    expect(calcularProximaOcurrencia(t, new Date('2026-06-22'))).toBeNull()
  })

  test('semanal pattern → next occurrence is 7 days later', () => {
    const t = { recurrente: true, patron_recurrencia: { tipo: 'semanal', dia: 1 } }
    const next = calcularProximaOcurrencia(t, new Date('2026-06-22'))
    expect(next).toBeInstanceOf(Date)
    const diff = next.getTime() - new Date('2026-06-22').getTime()
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000)
  })

  test('mensual pattern → next occurrence is same day next month', () => {
    const t = { recurrente: true, patron_recurrencia: { tipo: 'mensual', dia: 5 } }
    const from = new Date('2026-06-22')
    const next = calcularProximaOcurrencia(t, from)
    expect(next).toBeInstanceOf(Date)
    expect(next.getMonth()).toBe(6) // July (0-indexed)
    expect(next.getDate()).toBe(5)
  })
})

describe('tareaVencida', () => {
  test('tarea past vencimiento and still pendiente → vencida', () => {
    expect(tareaVencida({ fecha_vencimiento: '2026-01-01', estado: 'pendiente' }, new Date('2026-06-22'))).toBe(true)
  })

  test('tarea past vencimiento but completada → not vencida', () => {
    expect(tareaVencida({ fecha_vencimiento: '2026-01-01', estado: 'completada' }, new Date('2026-06-22'))).toBe(false)
  })

  test('tarea past vencimiento but cancelada → not vencida', () => {
    expect(tareaVencida({ fecha_vencimiento: '2026-01-01', estado: 'cancelada' }, new Date('2026-06-22'))).toBe(false)
  })

  test('tarea with future vencimiento → not vencida', () => {
    expect(tareaVencida({ fecha_vencimiento: '2026-12-31', estado: 'pendiente' }, new Date('2026-06-22'))).toBe(false)
  })
})

describe('buildTareaDesdeNotif', () => {
  const notif = { familia_id: 'fam-1', representante_id: 'rep-1', alumno_id: 'alu-1', prioridad: 'alta', titulo: 'Mora crítica' }

  test('creates tarea with tipo seguimiento_pago', () => {
    const t = buildTareaDesdeNotif(notif, 'usr-cajero-1')
    expect(t.tipo).toBe('seguimiento_pago')
  })

  test('inherits prioridad from notificacion', () => {
    const t = buildTareaDesdeNotif(notif, 'usr-cajero-1')
    expect(t.prioridad).toBe('alta')
  })

  test('asignado_a is the cajero_id', () => {
    const t = buildTareaDesdeNotif(notif, 'usr-cajero-1')
    expect(t.asignado_a).toBe('usr-cajero-1')
  })

  test('familia_id and alumno_id inherited from notif', () => {
    const t = buildTareaDesdeNotif(notif, 'usr-cajero-1')
    expect(t.familia_id).toBe('fam-1')
    expect(t.alumno_id).toBe('alu-1')
  })
})
