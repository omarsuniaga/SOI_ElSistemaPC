import { describe, it, expect } from 'vitest'
import { construirSubsetCatalogoPrompt } from '../logic/simuladorToolCatalogPrompt.js'

// Construye el bloque de texto que se inyecta en el system prompt del LLM
// cuando sim_runs.usar_tool_gateway=true, listando SOLO las tools con
// sandbox_behavior definido (las demas no pueden ejecutarse en sandbox,
// spec: simulador-tool-binding / "sandbox_behavior faltante rechaza la
// tool_call") para no ofrecer al LLM una tool que el gateway rechazaria.

describe('construirSubsetCatalogoPrompt', () => {
  it('incluye solo tools con sandbox_behavior definido', () => {
    const catalogo = [
      { name: 'acm_get_student_pedagogical_profile', descripcion: 'Perfil pedagogico', nivel_riesgo: 'read', input_schema: {}, sandbox_behavior: { departamento: 'ACM' } },
      { name: 'fin_apply_repair_charge', descripcion: 'Aplica cargo', nivel_riesgo: 'critical', input_schema: {}, sandbox_behavior: null },
    ]
    const r = construirSubsetCatalogoPrompt(catalogo)
    expect(r.tools).toHaveLength(1)
    expect(r.tools[0].name).toBe('acm_get_student_pedagogical_profile')
  })

  it('cada tool incluye name, descripcion, nivel_riesgo e input_schema', () => {
    const catalogo = [
      { name: 'lut_estado_orden', descripcion: 'Consulta estado', nivel_riesgo: 'read', input_schema: { type: 'object' }, sandbox_behavior: { departamento: 'LOG' } },
    ]
    const r = construirSubsetCatalogoPrompt(catalogo)
    expect(r.tools[0]).toEqual({
      name: 'lut_estado_orden',
      descripcion: 'Consulta estado',
      nivel_riesgo: 'read',
      input_schema: { type: 'object' },
    })
  })

  it('catalogo vacio produce texto de prompt sin tools y bandera vacio', () => {
    const r = construirSubsetCatalogoPrompt([])
    expect(r.tools).toEqual([])
    expect(r.vacio).toBe(true)
    expect(r.promptBlock).toContain('No hay tools')
  })

  it('catalogo no array (defensivo) se trata como vacio', () => {
    const r = construirSubsetCatalogoPrompt(null)
    expect(r.tools).toEqual([])
    expect(r.vacio).toBe(true)
  })

  it('promptBlock lista los nombres de tool disponibles en JSON', () => {
    const catalogo = [
      { name: 'inv_consultar_activo', descripcion: 'x', nivel_riesgo: 'read', input_schema: {}, sandbox_behavior: { departamento: 'LOG' } },
    ]
    const r = construirSubsetCatalogoPrompt(catalogo)
    expect(r.promptBlock).toContain('inv_consultar_activo')
    expect(r.vacio).toBe(false)
  })
})
