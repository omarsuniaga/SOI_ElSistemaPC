import { describe, it, expect } from 'vitest'
import { esTareaToolCallAprobable, formatearArgsToolCall, extraerToolCallPayload } from '../logic/toolApprovalFormatter.js'

// Slice 4 — Aprobacion humana en tareasView.js (Domain: hermes-write-approval).
// Convencion del design (obs #2738): checklist[0] = { item: 'tool_call_payload',
// completado: false, payload: <GatewayRequest> }, entidad_tipo === 'tool_call'.

const tareaBase = {
  id: 't-1',
  entidad_tipo: 'tool_call',
  entidad_label: 'fin_apply_repair_charge',
  estado: 'pendiente',
  checklist: [
    { item: 'tool_call_payload', completado: false, payload: { tool_name: 'fin_apply_repair_charge', args: { alumno_id: 'a1', monto: 500 } } },
  ],
}

describe('esTareaToolCallAprobable', () => {
  it('tarea con entidad_tipo=tool_call, checklist payload y estado pendiente es aprobable', () => {
    expect(esTareaToolCallAprobable(tareaBase)).toBe(true)
  })

  it('tarea con entidad_tipo distinto no es aprobable', () => {
    expect(esTareaToolCallAprobable({ ...tareaBase, entidad_tipo: 'alumno' })).toBe(false)
  })

  it('tarea sin checklist payload no es aprobable', () => {
    expect(esTareaToolCallAprobable({ ...tareaBase, checklist: [] })).toBe(false)
  })

  it('tarea ya completada o cancelada no es aprobable (ya resuelta)', () => {
    expect(esTareaToolCallAprobable({ ...tareaBase, estado: 'completada' })).toBe(false)
    expect(esTareaToolCallAprobable({ ...tareaBase, estado: 'cancelada' })).toBe(false)
  })

  it('tarea nula/indefinida no es aprobable', () => {
    expect(esTareaToolCallAprobable(null)).toBe(false)
    expect(esTareaToolCallAprobable(undefined)).toBe(false)
  })

  it('checklist no es array no es aprobable', () => {
    expect(esTareaToolCallAprobable({ ...tareaBase, checklist: null })).toBe(false)
  })
})

describe('extraerToolCallPayload', () => {
  it('extrae el payload del checklist[0] tool_call_payload', () => {
    const payload = extraerToolCallPayload(tareaBase)
    expect(payload).toEqual({ tool_name: 'fin_apply_repair_charge', args: { alumno_id: 'a1', monto: 500 } })
  })

  it('devuelve null si no hay checklist con ese item', () => {
    expect(extraerToolCallPayload({ ...tareaBase, checklist: [{ item: 'otro', completado: false }] })).toBeNull()
  })

  it('devuelve null si la tarea es nula', () => {
    expect(extraerToolCallPayload(null)).toBeNull()
  })
})

describe('formatearArgsToolCall', () => {
  it('formatea args como filas clave-valor legibles', () => {
    const filas = formatearArgsToolCall({ alumno_id: 'a1', monto: 500 })
    expect(filas).toEqual([
      { clave: 'alumno_id', valor: 'a1' },
      { clave: 'monto', valor: '500' },
    ])
  })

  it('args vacio o ausente produce lista vacia', () => {
    expect(formatearArgsToolCall({})).toEqual([])
    expect(formatearArgsToolCall(null)).toEqual([])
    expect(formatearArgsToolCall(undefined)).toEqual([])
  })

  it('serializa valores objeto/array anidados como JSON', () => {
    const filas = formatearArgsToolCall({ objetivos: ['a', 'b'], meta: { x: 1 } })
    expect(filas).toEqual([
      { clave: 'objetivos', valor: '["a","b"]' },
      { clave: 'meta', valor: '{"x":1}' },
    ])
  })

  it('valores null/undefined se muestran como guion', () => {
    const filas = formatearArgsToolCall({ nota: null, otra: undefined })
    expect(filas).toEqual([
      { clave: 'nota', valor: '—' },
      { clave: 'otra', valor: '—' },
    ])
  })
})
