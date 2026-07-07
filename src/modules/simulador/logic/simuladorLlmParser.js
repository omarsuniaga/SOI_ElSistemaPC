/**
 * simuladorLlmParser.js
 * Slice 2 — Portal Simulador: parser/validador defensivo de la respuesta JSON del LLM.
 *
 * Mismo patrón que `hermes-crear-tarea/index.ts` (strip de fences ```json,
 * extracción por regex, JSON.parse defensivo) pero adaptado al contrato
 * batch `AgentDecision[]` del design (obs #2723). Si el formato es inválido,
 * NUNCA lanza — retorna `{ ok:false, accion:'error_parseo_llm' }` para que el
 * tick registre el error en `sim_log` y continúe sin explotar (spec:
 * simulador-orquestacion-llm).
 */

// Espejo del enum SQL `soi_departamento`. 'ATN' NO va aquí: no existe en el
// enum y el INSERT en sim_tareas fallaría; su contrato es solo contexto y
// cualquier respuesta 'ATN' del LLM degrada a DIR a propósito.
export const DEPARTAMENTOS_VALIDOS = ['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO']
export const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta', 'critica']
export const CANALES_VALIDOS = ['whatsapp', 'email']

const DEPARTAMENTO_FALLBACK = 'DIR'
const PRIORIDAD_FALLBACK = 'media'

function extraerJson(raw) {
  let texto = String(raw).trim()
  // 1. Quitar fences ```json ... ``` o ``` ... ```
  texto = texto.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  // 2. Buscar el primer array u objeto JSON dentro del texto (tolera texto explicativo alrededor)
  const match = texto.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
  const candidato = match ? match[0] : texto
  return JSON.parse(candidato)
}

function normalizarTarea(tarea) {
  if (!tarea || typeof tarea !== 'object') return null
  return {
    titulo: (tarea.titulo || 'Tarea generada por simulación').toString().trim(),
    descripcion: (tarea.descripcion || '').toString().trim(),
    prioridad: PRIORIDADES_VALIDAS.includes(tarea.prioridad) ? tarea.prioridad : PRIORIDAD_FALLBACK,
  }
}

function normalizarMensaje(mensaje) {
  if (!mensaje || typeof mensaje !== 'object') return null
  if (!CANALES_VALIDOS.includes(mensaje.canal)) return null // se descarta, no bloquea el tick
  return {
    canal: mensaje.canal,
    destinatario_original: (mensaje.destinatario_original ?? '').toString().trim(),
    asunto: mensaje.asunto ? String(mensaje.asunto).trim() : undefined,
    cuerpo: (mensaje.cuerpo || '').toString().trim(),
  }
}

function normalizarDecision(decision) {
  if (!decision || typeof decision !== 'object') return null
  if (!decision.sim_calendario_id) return null // no vinculable al evento origen, se descarta

  const tareas = Array.isArray(decision.tareas) ? decision.tareas.map(normalizarTarea).filter(Boolean) : []
  const mensajes = Array.isArray(decision.mensajes) ? decision.mensajes.map(normalizarMensaje).filter(Boolean) : []

  return {
    sim_calendario_id: decision.sim_calendario_id,
    departamento: DEPARTAMENTOS_VALIDOS.includes(decision.departamento) ? decision.departamento : DEPARTAMENTO_FALLBACK,
    tareas,
    mensajes,
    resumen_accion: (decision.resumen_accion || '').toString().trim(),
  }
}

/**
 * Parsea la respuesta cruda del LLM (batch de decisiones por evento) y la
 * normaliza defensivamente. Nunca lanza.
 *
 * @param {string|null|undefined} raw
 * @returns {{ok: boolean, decisiones: Array<object>, accion?: 'error_parseo_llm', error?: string}}
 */
export function parseAgentDecisions(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { ok: false, decisiones: [], accion: 'error_parseo_llm', error: 'Respuesta vacía del LLM' }
  }

  let parsed
  try {
    parsed = extraerJson(raw)
  } catch (err) {
    return { ok: false, decisiones: [], accion: 'error_parseo_llm', error: `JSON inválido: ${err.message}` }
  }

  const lista = Array.isArray(parsed) ? parsed : [parsed]
  const decisiones = lista.map(normalizarDecision).filter(Boolean)

  return { ok: true, decisiones }
}
