/**
 * simuladorPromptBuilder.js
 * Slice 2 — Portal Simulador: orden determinista de eventos + construcción
 * del prompt de orquestación batch (una sola llamada Groq por tick).
 *
 * Spec: simulador-motor / Procesamiento concurrente determinista
 *   (orden estable por fecha_inicio + id, sin condición de carrera).
 * Design: decisión #5 (batching: UNA llamada Groq con todos los eventos
 * activos del día simulado en el mensaje "user").
 */

/**
 * Ordena eventos de forma determinista: primero por `fecha_inicio`
 * (timestamp simulado), luego por `id` como desempate estable. No muta el
 * array de entrada.
 *
 * @param {Array<{id: string, fecha_inicio: string}>} eventos
 * @returns {Array<object>} copia ordenada
 */
export function ordenarEventosDeterministico(eventos) {
  return [...eventos].sort((a, b) => {
    const fechaA = new Date(a.fecha_inicio).getTime()
    const fechaB = new Date(b.fecha_inicio).getTime()
    if (fechaA !== fechaB) return fechaA - fechaB
    return String(a.id).localeCompare(String(b.id))
  })
}

const CONTRATO_SYSTEM_HEADER = `Sos el orquestador de agentes departamentales de "El Sistema Punta Cana"
dentro de un SIMULACRO institucional (sandbox, ningún dato es real). Para
cada evento del batch de "eventos" en el mensaje del usuario, aplicá el
contrato del departamento responsable (rol, responsabilidades, tono) y
decidí qué tareas crear y qué mensajes enviar (whatsapp/email).

Reglas:
- Si el evento es de cobranza, filtrá SOLO actores con estado_pago = "moroso"
  entre los "actores_relevantes"; nunca notifiques a un actor "solvente".
- Todo mensaje de salida es SIMULADO: nunca inventes destinatarios reales,
  usá el actor ficticio provisto.
- Respondé SOLO un JSON array, un objeto por evento, con esta forma exacta:
  [{
    "sim_calendario_id": "<id del evento>",
    "departamento": "<código de departamento>",
    "tareas": [{"titulo": "...", "descripcion": "...", "prioridad": "baja|media|alta|critica"}],
    "mensajes": [{"canal": "whatsapp|email", "destinatario_original": "...", "asunto": "...", "cuerpo": "..."}],
    "resumen_accion": "resumen breve para mostrar en la animación"
  }]
- No incluyas texto fuera del JSON. No uses fences de markdown.`

function formatearContrato(codigo, contrato) {
  const responsabilidades = Array.isArray(contrato.responsabilidades) ? contrato.responsabilidades.join(', ') : ''
  return `### Departamento ${codigo}\nRol: ${contrato.rol}\nResponsabilidades: ${responsabilidades}\nTono: ${contrato.tono}`
}

/**
 * Construye el prompt `{system, user}` para la llamada batch a Groq.
 * Incluye solo los contratos de los departamentos presentes en el batch
 * (fallback a GENERICO si el departamento no tiene contrato dedicado).
 *
 * @param {{eventos: Array<object>, contratos: Record<string, object>, actoresRelevantes: Array<object>}} params
 * @returns {{system: string, user: string}}
 */
export function construirPromptTick({ eventos, contratos, actoresRelevantes }) {
  if (!Array.isArray(eventos) || eventos.length === 0) {
    throw new Error('construirPromptTick: se requiere al menos un evento en el batch.')
  }

  const eventosOrdenados = ordenarEventosDeterministico(eventos)

  const departamentosEnBatch = [...new Set(eventosOrdenados.map((e) => e.departamento_responsable))]
  const bloquesContrato = departamentosEnBatch.map((depto) => {
    const contrato = contratos[depto] || contratos.GENERICO
    return formatearContrato(contrato === contratos.GENERICO && !contratos[depto] ? `${depto} (fallback genérico)` : depto, contrato)
  })

  const system = `${CONTRATO_SYSTEM_HEADER}\n\n${bloquesContrato.join('\n\n')}`

  const user = JSON.stringify({
    eventos: eventosOrdenados,
    actores_relevantes: actoresRelevantes || [],
  })

  return { system, user }
}
