import { describe, it, expect } from 'vitest'
import { parseToolCalls } from '../logic/simuladorToolCallParser.js'

// Slice 4 — Integracion Simulador + tool-gateway (feature flag usar_tool_gateway).
// Cuando el flag esta activo, el LLM devuelve tool_calls en vez de JSON libre
// legacy (parseAgentDecisions). Este parser traduce esa respuesta a una lista
// de invocaciones ejecutables via tool-gateway, con fallback defensivo si el
// LLM devuelve algo mal formado (mismo patron que simuladorLlmParser.js).

describe('parseToolCalls', () => {
  it('parsea un array de tool_calls bien formado', () => {
    const raw = JSON.stringify([
      { tool_name: 'acm_get_student_pedagogical_profile', args: { alumno_id: 'abc-123' } },
      { tool_name: 'fin_register_lutherie_report', args: { instrumento_id: 'x', alumno_id: 'y' } },
    ])
    const r = parseToolCalls(raw)
    expect(r.ok).toBe(true)
    expect(r.toolCalls).toHaveLength(2)
    expect(r.toolCalls[0]).toEqual({ tool_name: 'acm_get_student_pedagogical_profile', args: { alumno_id: 'abc-123' } })
  })

  it('acepta fences de markdown alrededor del JSON', () => {
    const raw = '```json\n[{"tool_name":"lut_estado_orden","args":{"orden_id":"1"}}]\n```'
    const r = parseToolCalls(raw)
    expect(r.ok).toBe(true)
    expect(r.toolCalls).toHaveLength(1)
    expect(r.toolCalls[0].tool_name).toBe('lut_estado_orden')
  })

  it('acepta un solo objeto tool_call (no array) y lo envuelve', () => {
    const raw = JSON.stringify({ tool_name: 'inv_consultar_activo', args: { activo_id: 'z' } })
    const r = parseToolCalls(raw)
    expect(r.ok).toBe(true)
    expect(r.toolCalls).toHaveLength(1)
  })

  it('respuesta vacia -> fallback ok:false', () => {
    const r = parseToolCalls('')
    expect(r.ok).toBe(false)
    expect(r.toolCalls).toEqual([])
    expect(r.error).toBeTruthy()
  })

  it('JSON malformado -> fallback ok:false, no explota', () => {
    const r = parseToolCalls('esto no es json {{{')
    expect(r.ok).toBe(false)
    expect(r.toolCalls).toEqual([])
  })

  it('filtra entradas sin tool_name (invalidas) mantiene las validas', () => {
    const raw = JSON.stringify([
      { tool_name: 'acm_get_student_pedagogical_profile', args: {} },
      { args: { foo: 'bar' } }, // sin tool_name, se descarta
      { tool_name: '', args: {} }, // tool_name vacio, se descarta
    ])
    const r = parseToolCalls(raw)
    expect(r.ok).toBe(true)
    expect(r.toolCalls).toHaveLength(1)
    expect(r.toolCalls[0].tool_name).toBe('acm_get_student_pedagogical_profile')
  })

  it('args ausente se normaliza a objeto vacio', () => {
    const raw = JSON.stringify([{ tool_name: 'cal_listar_eventos' }])
    const r = parseToolCalls(raw)
    expect(r.ok).toBe(true)
    expect(r.toolCalls[0].args).toEqual({})
  })

  it('todas las entradas invalidas -> ok:false con lista vacia', () => {
    const raw = JSON.stringify([{ foo: 'bar' }, { args: {} }])
    const r = parseToolCalls(raw)
    expect(r.ok).toBe(false)
    expect(r.toolCalls).toEqual([])
  })
})
