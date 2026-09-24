/**
 * Triage de la cola de aprobación de ausencias con Jev.
 *
 * Todas las llamadas a Jev pasan por la Edge Function `jev-proxy` (misma
 * arquitectura que groqService.js) — la key del AI Gateway vive en secrets
 * de la Edge Function y nunca llega al navegador.
 *
 * Jev solo clasifica; nunca aprueba, rechaza ni escribe nada. El único
 * efecto es una señal visual para quien revisa la cola: si la urgencia que
 * el propio maestro declaró al pedir el permiso no calza con lo que el
 * motivo en texto libre realmente describe, se marca para que la revisen
 * con más atención — no se sobreescribe el dato declarado.
 *
 * En Modo Demo no se llama a Jev (es un servicio pago, real, fuera del
 * alcance del modo demo): la cola se muestra igual, sin las señales extra.
 */

import { config } from '../../../core/config/config.js'
import { supabase } from '../../../lib/supabaseClient.js'

const URGENCIA_ORDER = { baja: 0, media: 1, alta: 2 }

function proxyBase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
  return `${supabaseUrl}/functions/v1/jev-proxy`
}

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ''
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  }
}

function buildQuestions(ids) {
  const questions = {}
  for (const id of ids) {
    questions[`${id}_urgencia`] = {
      type: 'choice',
      instructions: `For item "${id}": based only on its "motivo" text, what urgency level does the situation described actually warrant? Ignore any urgency the requester may have self-selected — judge only from the text.`,
      criteria: {
        baja: 'Routine, plannable, no immediate impact if delayed a few days.',
        media: 'Should be handled within the week, some real impact but not an emergency.',
        alta: 'Genuine emergency or time-sensitive situation (health, family crisis, irreversible deadline).',
      },
    }
    questions[`${id}_motivo_vago`] = {
      type: 'boolean',
      instructions: `For item "${id}": is the "motivo" text too vague or generic to evaluate the request without asking the teacher for more detail?`,
    }
  }
  return questions
}

/**
 * @param {Array<{id: string, motivo: string, urgencia: string}>} ausencias
 * @returns {Promise<Map<string, {urgenciaSugerida: string, discrepancia: boolean, motivoVago: boolean, confianza: number}>>}
 *   Mapa vacío si Jev no está disponible o falla — nunca lanza, el caller
 *   siempre puede renderizar la cola con o sin estas señales.
 */
export async function triageAusenciasPendientes(ausencias) {
  const resultado = new Map()
  if (config.isDemoMode) return resultado
  if (!ausencias || ausencias.length === 0) return resultado

  const items = ausencias
    .filter((a) => a.id && a.motivo)
    .map((a) => ({ id: String(a.id), motivo: a.motivo, urgenciaDeclarada: a.urgencia || 'media' }))

  if (items.length === 0) return resultado

  const state = JSON.stringify(
    items.map(({ id, motivo }) => ({ id, motivo })),
  )
  const questions = buildQuestions(items.map((i) => i.id))

  let data
  try {
    const headers = await authHeaders()
    const res = await fetch(`${proxyBase()}/evaluate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ state, questions }),
    })
    data = await res.json()
    if (!res.ok || data.error) {
      console.warn('[ausenciasTriageJev] jev-proxy error, degradando sin señales:', data.error ?? res.status)
      return resultado
    }
  } catch (err) {
    console.warn('[ausenciasTriageJev] fallo de red hacia jev-proxy, degradando sin señales:', err)
    return resultado
  }

  const confidence = data.providerMetadata?.typesafe?.confidence ?? {}

  for (const { id, urgenciaDeclarada } of items) {
    const urgenciaAnswer = data.answers?.[`${id}_urgencia`]
    const vagoAnswer = data.answers?.[`${id}_motivo_vago`]
    if (!urgenciaAnswer) continue

    const urgenciaSugerida = urgenciaAnswer.choice
    const confianzaUrgencia = confidence[`${id}_urgencia`] ?? 0
    const declaradaNivel = URGENCIA_ORDER[urgenciaDeclarada] ?? 1
    const sugeridaNivel = URGENCIA_ORDER[urgenciaSugerida] ?? 1

    // Solo marcar discrepancia real (2 niveles de diferencia) y con
    // confianza razonable — evita ruido por desacuerdos de un solo nivel,
    // que son subjetivos y esperables.
    const discrepancia = Math.abs(declaradaNivel - sugeridaNivel) >= 2 && confianzaUrgencia >= 0.6

    resultado.set(id, {
      urgenciaSugerida,
      discrepancia,
      motivoVago: vagoAnswer?.probability >= 0.7,
      confianza: confianzaUrgencia,
    })
  }

  return resultado
}
