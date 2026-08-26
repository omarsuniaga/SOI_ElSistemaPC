/**
 * SOI Event Enrichment — Groq Event Enrichment Wrapper
 *
 * Provides optional event description enrichment via Groq API with timeout
 * and graceful fallback. If Groq does not respond within 5 seconds, the
 * handler completes normally with the base description.
 *
 * Spec Requirement: AC-CON-03 (Graceful Degradation — groq timeout)
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * SOI Event structure from soi_eventos table
 */
export interface SoiEvento {
  id: string
  tipo: string
  entidad_tipo: string
  entidad_id: string | null
  actor_id: string | null
  payload: Record<string, unknown>
  correlation_id: string | null
  procesado: boolean
  created_at: string
}

/**
 * Enrich an event description using Groq API
 *
 * This function:
 * 1. Calls groq-proxy edge function with a prompt in Spanish
 * 2. Enforces a 5-second timeout
 * 3. On timeout or error: returns baseTitle (no exception thrown)
 * 4. On success: returns enriched description (max 200 chars)
 *
 * Always returns a string (never throws).
 *
 * Usage:
 *   const enriched = await enrichDescription(supabase, evento, "Base title", true)
 *   // enriched is always a string: either the enriched version or the base title
 *   // If enabled=false, returns baseTitle immediately (no API call)
 *
 * Spec Scenario: AC-CON-03-S1
 *   GIVEN a handler calls groq-proxy for event enrichment
 *   WHEN groq-proxy does not respond within 5 seconds
 *   THEN the handler completes task creation without waiting further
 *   AND the task.titulo uses the base template (e.g., "Asistencia pendiente: sesión 99") without enrichment
 *   AND no exception is thrown; processing continues to the next event
 *
 * @param enabled If false, returns baseTitle immediately (feature flag: default false)
 */
export async function enrichDescription(
  supabase: SupabaseClient,
  evento: SoiEvento,
  baseTitle: string,
  enabled: boolean = false
): Promise<string> {
  // Feature flag: if disabled, return base title immediately (no API call)
  if (!enabled) {
    console.log('[GROQ_DISABLED] enrichment skipped (feature flag off)')
    return baseTitle
  }
  try {
    // Create abort controller with 5-second timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    // Build a prompt in Spanish for Groq
    const prompt = `Como asistente de eventos institucionales, resume en máximo 200 caracteres la acción que debe tomarse para este evento:

Tipo de evento: ${evento.tipo}
Entidad: ${evento.entidad_tipo}
Payload: ${JSON.stringify(evento.payload)}

Responde SOLO con el resumen (sin explicaciones adicionales).`

    // Invoke groq-proxy edge function
    const { data, error } = await supabase.functions.invoke('groq-proxy', {
      body: {
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente que genera resúmenes claros y accionables de eventos institucionales en español.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      headers: {
        'x-groq-timeout-ms': '5000',
      },
      signal: controller.signal as any, // Type assertion for Deno compatibility
    })

    clearTimeout(timeoutId)

    // If invocation failed or no response, return base title
    if (error) {
      console.warn('[GROQ_TIMEOUT_OR_ERROR]', error.message)
      return baseTitle
    }

    // Parse Groq response and extract text
    const enrichedText = data?.choices?.[0]?.message?.content?.trim()
    if (!enrichedText) {
      console.warn('[GROQ_EMPTY_RESPONSE]')
      return baseTitle
    }

    // Truncate to 200 chars to keep task titles reasonable
    return enrichedText.slice(0, 200)
  } catch (err) {
    // Catch any error (timeout, network, etc.) and return base title
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.warn('[GROQ_EXCEPTION]', errorMsg)
    return baseTitle
  }
}

/**
 * Optional async enrichment (Phase 2.1+)
 *
 * For future use: spawn groq enrichment in background without blocking batch.
 * Handlers can call this to update task description asynchronously after
 * task creation completes.
 */
export async function enrichDescriptionAsync(
  supabase: SupabaseClient,
  evento: SoiEvento,
  baseTitle: string
): Promise<string> {
  // Phase 2.1: Implement async enrichment pattern
  // For now, just return base title (stub)
  return baseTitle
}
