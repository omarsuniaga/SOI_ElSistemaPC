/**
 * simuladorToolCatalogPrompt.js
 * Slice 4 — Integracion Simulador + tool-gateway (feature flag usar_tool_gateway).
 *
 * Construye el subset del catalogo `soi_tool_catalog` que se inyecta en el
 * system prompt del LLM cuando el simulador opera en modo tool_calls. SOLO
 * incluye tools con `sandbox_behavior` definido: si el LLM no las ve, nunca
 * las invoca, evitando un rechazo predecible del gateway (spec:
 * simulador-tool-binding / "sandbox_behavior faltante rechaza la tool_call").
 *
 * Duplicado 1:1 (comentado) en `supabase/functions/simulador-tick/index.ts`.
 *
 * @param {Array<{name:string, descripcion:string, nivel_riesgo:string, input_schema:object, sandbox_behavior:object|null}>} catalogo
 * @returns {{tools:Array<{name:string, descripcion:string, nivel_riesgo:string, input_schema:object}>, vacio:boolean, promptBlock:string}}
 */
export function construirSubsetCatalogoPrompt(catalogo) {
  const filas = Array.isArray(catalogo) ? catalogo : []

  const tools = filas
    .filter((row) => row && row.sandbox_behavior && typeof row.sandbox_behavior === 'object')
    .map((row) => ({
      name: row.name,
      descripcion: row.descripcion,
      nivel_riesgo: row.nivel_riesgo,
      input_schema: row.input_schema,
    }))

  if (tools.length === 0) {
    return {
      tools: [],
      vacio: true,
      promptBlock: 'No hay tools disponibles en modo sandbox para este simulacro. Respondé con el formato JSON legacy de tareas/mensajes.',
    }
  }

  const promptBlock =
    `Además de las tareas/mensajes, podés invocar las siguientes tools disponibles en modo sandbox ` +
    `(ejecutan sobre datos simulados, nunca sobre producción):\n` +
    JSON.stringify(tools, null, 2) +
    `\n\nSi decidís usar una tool, respondé SOLO un JSON array de tool_calls con la forma ` +
    `[{"tool_name": "<name>", "args": {...}}], usando exclusivamente los nombres de la lista anterior.`

  return { tools, vacio: false, promptBlock }
}
