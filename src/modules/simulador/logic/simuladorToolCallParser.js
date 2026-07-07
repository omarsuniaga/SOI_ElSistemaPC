/**
 * simuladorToolCallParser.js
 * Slice 4 — Integracion Simulador + tool-gateway (feature flag usar_tool_gateway).
 *
 * Cuando `sim_runs.usar_tool_gateway=true`, el system prompt del LLM pide
 * `tool_calls` (design obs #2738, "Integracion Simulador") en vez del JSON
 * libre legacy que consume `simuladorLlmParser.js`. Este modulo parsea esa
 * respuesta con el mismo patron defensivo (fences de markdown, JSON
 * malformado, respuesta vacia -> fallback sin explotar el tick).
 *
 * Forma esperada de cada tool_call: { tool_name: string, args?: object }.
 * Entradas sin `tool_name` (o vacio) se descartan silenciosamente; si TODAS
 * las entradas son invalidas o el JSON no parsea, se devuelve ok:false para
 * que el caller (simulador-tick) decida el fallback (misma convencion que
 * `parseAgentDecisions` en simulador-tick/index.ts).
 *
 * Duplicado 1:1 (comentado) en `supabase/functions/simulador-tick/index.ts`.
 *
 * @param {string|null|undefined} raw - contenido crudo devuelto por el LLM.
 * @returns {{ok:boolean, toolCalls:Array<{tool_name:string, args:object}>, error?:string}}
 */
export function parseToolCalls(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { ok: false, toolCalls: [], error: 'Respuesta vacía del LLM' }
  }

  let parsed
  try {
    let texto = String(raw).trim()
    texto = texto.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    const match = texto.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
    parsed = JSON.parse(match ? match[0] : texto)
  } catch (err) {
    return { ok: false, toolCalls: [], error: `JSON inválido: ${err.message}` }
  }

  const lista = Array.isArray(parsed) ? parsed : [parsed]
  const toolCalls = lista
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const toolName = entry.tool_name
      if (!toolName || typeof toolName !== 'string' || toolName.trim() === '') return null
      const args = entry.args && typeof entry.args === 'object' ? entry.args : {}
      return { tool_name: toolName.trim(), args }
    })
    .filter(Boolean)

  if (toolCalls.length === 0) {
    return { ok: false, toolCalls: [], error: 'Ninguna tool_call válida en la respuesta del LLM' }
  }

  return { ok: true, toolCalls }
}
