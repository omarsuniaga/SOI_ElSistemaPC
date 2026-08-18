/**
 * SOI Event Enrichment — Hermes Task Creation Wrapper
 *
 * Provides a helper function to invoke the hermes-crear-tarea edge function
 * from event handlers. This centralizes task creation logic and ensures
 * consistent error handling and response parsing.
 *
 * Spec Requirements: All R1–R5 handlers use this wrapper
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Options for creating a task via hermes
 */
export interface CrearTareaOptions {
  /** Task text/description (required) */
  texto: string
  /** Optional: force a specific department (bypasses Groq classification) */
  departamento?: string
  /** Optional: force a specific priority (if set, overrides Groq inference) */
  prioridad?: string
}

/**
 * Response from hermes-crear-tarea edge function
 */
export interface HermesTaskResponse {
  ok: boolean
  clasificacion?: {
    departamento: string
    titulo: string
    descripcion: string
    prioridad: string
    confianza: number
  }
  tarea?: {
    id: string
    titulo: string
    departamento: string
    prioridad: string
    estado: string
  }
  error?: string
}

/**
 * Result returned by crearTareaDesdeEvento
 */
export interface CrearTareaResult {
  ok: boolean
  tareaId?: string
  titulo?: string
  departamento?: string
  prioridad?: string
  error?: string
}

/**
 * Create a task via the hermes-crear-tarea edge function
 *
 * This wrapper:
 * 1. Invokes hermes-crear-tarea with the provided texto and optional departamento
 * 2. Parses the response and extracts task ID + metadata
 * 3. Handles errors gracefully (throws if hermes fails)
 * 4. Returns { ok, tareaId, titulo, departamento, prioridad }
 *
 * Usage:
 *   const result = await crearTareaDesdeEvento(supabase, {
 *     texto: "Seguimiento urgente para alumno X: 3+ faltas injustificadas",
 *     departamento: "ACM"
 *   })
 *   if (result.ok) console.log(`Created task ${result.tareaId}`)
 *   else throw new Error(result.error)
 */
export async function crearTareaDesdeEvento(
  supabase: SupabaseClient,
  opts: CrearTareaOptions
): Promise<CrearTareaResult> {
  if (!opts.texto || opts.texto.trim().length === 0) {
    return {
      ok: false,
      error: 'Texto de tarea es requerido',
    }
  }

  try {
    // Invoke hermes-crear-tarea edge function
    const { data, error } = await supabase.functions.invoke<HermesTaskResponse>(
      'hermes-crear-tarea',
      {
        body: {
          texto: opts.texto,
          ...(opts.departamento && { departamento: opts.departamento }),
        },
        headers: {
          'x-hermes-token': Deno.env.get('HERMES_EMAIL_TOKEN') || '',
        },
      }
    )

    // Handle invocation errors
    if (error) {
      return {
        ok: false,
        error: `hermes-crear-tarea invocation failed: ${error.message}`,
      }
    }

    // Handle function response errors
    if (!data?.ok) {
      return {
        ok: false,
        error: data?.error || 'hermes-crear-tarea returned error',
      }
    }

    // Extract task data and return success
    return {
      ok: true,
      tareaId: data.tarea?.id,
      titulo: data.tarea?.titulo,
      departamento: data.tarea?.departamento,
      prioridad: data.tarea?.prioridad,
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error creating task',
    }
  }
}
