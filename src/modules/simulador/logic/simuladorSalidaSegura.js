/**
 * simuladorSalidaSegura.js
 * Slice 2 — Portal Simulador: capa de salida segura.
 *
 * Función pura que garantiza ESTRUCTURALMENTE que ningún envío (WhatsApp/email)
 * del simulador pueda llegar a un destinatario real. El destinatario final
 * SIEMPRE proviene de `config` (whitelist server-side, tabla `sim_config`),
 * nunca del valor que decida el LLM/agente.
 *
 * Spec: simulador-salida-segura / Whitelist server-side inviolable.
 * Design: decisión #4 (destinatario_original vs destinatario_redirigido).
 */

const CANALES_SOPORTADOS = ['whatsapp', 'email']

/**
 * Redirige un envío a la whitelist configurada y antepone el prefijo de
 * simulacro. Falla cerrado (throw) si el canal o la config son inválidos —
 * nunca retorna un destino "por defecto" que pudiera ser real.
 *
 * @param {{canal: 'whatsapp'|'email', destinatarioOriginal: unknown, mensaje: string, config: {whatsapp?: string, email?: string}}} params
 * @returns {{canal: string, destinatarioOriginal: string, destinatarioRedirigido: string, mensaje: string}}
 */
export function resolverDestinoSeguro({ canal, destinatarioOriginal, mensaje, config }) {
  if (!CANALES_SOPORTADOS.includes(canal)) {
    throw new Error(`resolverDestinoSeguro: canal no soportado "${canal}". Debe ser "whatsapp" o "email".`)
  }
  if (!config || typeof config[canal] !== 'string' || !config[canal].trim()) {
    throw new Error(`resolverDestinoSeguro: falta config de whitelist para el canal "${canal}".`)
  }

  const original =
    destinatarioOriginal === null || destinatarioOriginal === undefined || String(destinatarioOriginal).trim() === ''
      ? 'desconocido'
      : String(destinatarioOriginal).trim()

  // El destino final proviene EXCLUSIVAMENTE de config; el valor original
  // jamás se usa como destino, solo se cita dentro del texto del mensaje.
  const destinatarioRedirigido = config[canal]

  return {
    canal,
    destinatarioOriginal: original,
    destinatarioRedirigido,
    mensaje: `[SIMULACRO → destinatario original: ${original}] ${String(mensaje ?? '')}`,
  }
}

/**
 * Construye una fila lista para INSERT en `sim_outbox`, pasando siempre por
 * `resolverDestinoSeguro`. Es la única función que el orquestador (edge
 * function) debe usar para preparar un envío — hace estructuralmente
 * imposible construir una fila con destinatario_redirigido distinto a la
 * whitelist.
 *
 * @param {{runId: string, canal: 'whatsapp'|'email', destinatarioOriginal: unknown, asunto?: string, mensaje: string, config: object}} params
 */
export function construirOutboxSeguro({ runId, canal, destinatarioOriginal, asunto, mensaje, config }) {
  const seguro = resolverDestinoSeguro({ canal, destinatarioOriginal, mensaje, config })
  return {
    run_id: runId,
    canal: seguro.canal,
    destinatario_original: seguro.destinatarioOriginal,
    destinatario_redirigido: seguro.destinatarioRedirigido,
    asunto: asunto ?? null,
    mensaje: seguro.mensaje,
    estado: 'pendiente',
  }
}
