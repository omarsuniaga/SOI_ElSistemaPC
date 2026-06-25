/**
 * aiService.js — Asistente de IA del portal de maestros.
 *
 * SEGURIDAD: todas las llamadas a IA pasan por la Edge Function `groq-proxy`.
 * Las API keys (Groq y OpenRouter) viven en los secrets del servidor y NUNCA
 * se envían al navegador. (Antes este servicio leía la key de `system_config`
 * y llamaba a los proveedores directo desde el browser — eso quedó eliminado.)
 */

import { supabase } from '../../lib/supabaseClient.js'

const FREE_MODELS = [
  'google/gemini-2.0-flash-exp',
  'google/gemini-flash-1.5-exp',
  'google/gemma-4-31b',
  'google/gemma-4-26b-a4b',
  'nvidia/nemotron-3-super-8b',
  'nvidia/nemotron-nano-9b-v2',
  'poolside/laguna-xs.2',
  'mistralai/mistral-7b-instruct',
  'anthropic/claude-3-haiku',
  'openrouter/auto',
]

let currentModel = 'google/gemini-flash-1.5-exp'

// ── Proxy (groq-proxy Edge Function) ────────────────────────────────────────
function proxyBase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
  return `${supabaseUrl}/functions/v1/groq-proxy`
}

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
  return {
    Authorization: `Bearer ${session?.access_token ?? anon}`,
    'Content-Type': 'application/json',
    apikey: anon,
  }
}

async function proxyChat(body) {
  const res = await fetch(`${proxyBase()}/chat`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  })
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`IA proxy devolvió respuesta no-JSON (status ${res.status})`)
  }
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? data.error ?? `IA proxy error ${res.status}`)
  }
  return data.choices?.[0]?.message?.content || ''
}

async function requestOpenRouter(messages, model = 'google/gemini-flash-1.5-exp', temp = 0.7) {
  return proxyChat({ provider: 'openrouter', model, messages, temperature: temp, max_tokens: 1024 })
}

async function requestGroq(messages, temp = 0.7) {
  return proxyChat({
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: temp,
    max_tokens: 1024,
  })
}

export async function createAiService() {
  // Disponibilidad de proveedores: el servidor decide qué key existe. Intentamos
  // OpenRouter primero (modelos gratuitos) y caemos a Groq si falla.
  let tryOpenRouter = true
  let tryGroq = true

  async function _requestWithFallback(messages, temp = 0.7, cacheKey = null) {
    const { canMakeRequest, withRateLimit, getCachedResponse } = await import('./groqRateLimiter.js')

    if (cacheKey) {
      const cached = getCachedResponse(cacheKey)
      if (cached) return { fromCache: true, data: cached, provider: 'cache' }
    }

    const status = canMakeRequest()
    if (!status.allowed) {
      throw new Error(`Límite alcanzado. Espera ${Math.ceil(status.resetIn / 1000)}s.`)
    }

    let lastError = null

    if (tryOpenRouter) {
      try {
        const result = await withRateLimit(() => requestOpenRouter(messages, currentModel, temp), cacheKey)
        return { fromCache: result.fromCache, data: result.data, provider: 'openrouter' }
      } catch (e) {
        console.warn('OpenRouter fallback:', e.message)
        lastError = e
      }
    }

    if (tryGroq) {
      try {
        const result = await withRateLimit(() => requestGroq(messages, temp), cacheKey)
        return { fromCache: result.fromCache, data: result.data, provider: 'groq' }
      } catch (e) {
        console.warn('GROQ fallback:', e.message)
        lastError = e
      }
    }

    throw lastError || new Error('No hay proveedores de IA disponibles en el servidor.')
  }

  return {
    /**
     * Chat general - responde preguntas contextuales sobre el sistema académico
     * @param {string} message - Mensaje del usuario
     * @param {object} context - { maestroNombre?, alumnoNombre?, rol? }
     */
    async chat(message, context = {}) {
      const cleanMessage = message.trim().toLowerCase()

      let intent = 'general'
      if (cleanMessage.includes('hola') || cleanMessage.includes('buenos') || cleanMessage.includes('buenas')) {
        intent = 'saludo'
      } else if (cleanMessage.includes('alumno') || cleanMessage.includes('estudiante')) {
        intent = 'alumno'
      } else if (cleanMessage.includes('clase') || cleanMessage.includes('sesión')) {
        intent = 'clase'
      } else if (cleanMessage.includes('asistencia') || cleanMessage.includes('falt') || cleanMessage.includes('presente')) {
        intent = 'asistencia'
      }

      const systemPrompt = `Eres el asistente virtual del Sistema Académico SOI.
Ayudas a maestros y personal administrativo con información útil sobre el sistema.
Sé directo, conciso y muy amigable. Si no tienes información específica, indica que el usuario debe usar las funciones del sistema.`

      let userPrompt = ''
      switch (intent) {
        case 'saludo':
          userPrompt = `El usuario dice: "${message}". Saluda de manera cálida y presenta brevemente cómo puedes ayudar en el Sistema Académico SOI.`
          break
        case 'alumno':
          userPrompt = `El usuario pregunta: "${message}". Indica que para ver información específica de estudiantes debe usar el panel de "Analizar Progreso" en la sección de IA.`
          break
        case 'clase':
          userPrompt = `El usuario pregunta sobre clases: "${message}". Puedes mencionar las funciones del sistema: Calendario, Hoy, Registro de Asistencia.`
          break
        case 'asistencia':
          userPrompt = `El usuario pregunta sobre asistencia: "${message}". El sistema permite tomar asistencia (P/A/J), reportes, justificaciones y estadísticas.`
          break
        default:
          userPrompt = `El usuario dice: "${message}". Responde de manera útil relacionada con el sistema académico. Si necesita datos específicos, indica qué función usar.`
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]

      const cacheKey = `chat:${cleanMessage.substring(0, 30)}`
      const result = await _requestWithFallback(messages, 0.7, cacheKey)
      return result.data
    },

    /**
     * Analiza el progreso del alumno.
     * @param {object} opts - { nombre, instrumento, comentarios, sesiones, fullContext }
     */
    async analizarProgreso(opts) {
      const isFull = opts.fullContext === true
      const historyLimit = isFull ? undefined : -5

      const systemPrompt = `Eres un asistente de análisis pedagógico musical. Tu objetivo es proveer feedback constructivo y preciso.`

      const userPrompt = `
Analiza el progreso de ${opts.nombre} (${opts.instrumento}).
Modo de análisis: ${isFull ? 'PROFUNDO (Historial completo)' : 'RÁPIDO (Sesiones recientes)'}

Comentarios:
${opts.comentarios?.slice(historyLimit).map((c) => `- ${c}`).join('\n') || 'Sin comentarios'}

Sesiones:
${opts.sesiones?.slice(historyLimit).map((s) => `- Fecha: ${s.fecha}, Calif: ${s.calif || 'N/A'}, Estado: ${s.estado}`).join('\n') || 'Sin sesiones'}

Responde en 3-4 oraciones identificando fortalezas, áreas de mejora y una tarea específica.
`.trim()

      const cacheKey = `progreso:${opts.nombre}:${opts.instrumento}:${opts.sesiones?.length || 0}:${isFull ? 'full' : 'quick'}`
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]

      const result = await _requestWithFallback(messages, 0.6, cacheKey)
      return result.data
    },

    /**
     * Sugiere contenido curricular.
     */
    async sugerirContenido(opts) {
      const systemPrompt = `Eres un experto en currículo musical. Generas sugerencias prácticas y estructuradas.`
      const userPrompt = `Instrumento: ${opts.instrumento}. Nivel: ${opts.nivel || 'Intermedio'}. Objetivos: ${opts.objetivos?.join(', ')}. Sugiere 3-5 temas.`

      const cacheKey = `contenido:${opts.instrumento}:${opts.nivel}:${opts.objetivos?.join('|')}`
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]

      const result = await _requestWithFallback(messages, 0.8, cacheKey)
      return result.data
    },

    /**
     * Resumen de sesión de clase.
     * @param {object} opts - { presente, ausente, comentarios, fullContext }
     */
    async resumirSesion(opts) {
      const isFull = opts.fullContext === true
      const limit = isFull ? undefined : -10

      const systemPrompt = `Eres un secretario académico. Resumes sesiones de clase de forma ejecutiva.`
      const userPrompt = `
Resumen de sesión:
Presentes (${opts.presente?.length || 0}): ${opts.presente?.join(', ')}
Ausentes (${opts.ausente?.length || 0}): ${opts.ausente?.join(', ')}
Comentarios:
${opts.comentarios?.slice(limit).map((c) => `- ${c}`).join('\n') || 'Sin novedades'}

Genera un resumen de 2 oraciones para el acta oficial.
`.trim()

      const cacheKey = `resumen:${new Date().toISOString().split('T')[0]}:${opts.presente?.length}:${opts.comentarios?.length}:${isFull}`
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]

      const result = await _requestWithFallback(messages, 0.5, cacheKey)
      return result.data
    },

    /**
     * Convierte texto libre o transcripción de voz en DSL estructurado.
     * @param {object} opts - { rawText, presentes, indicadorActivo, indicadoresDisponibles }
     */
    async structureDSL({ rawText, presentes = [], indicadorActivo = null, indicadoresDisponibles = [] }) {
      const names = presentes.join(', ') || 'sin alumnos'
      const indicators = indicadoresDisponibles.join(', ') || 'sin indicadores'

      const prompt = `Sos un asistente de un sistema de evaluación musical. Convertí este texto en DSL estructurado.

SINTAXIS DSL:
- #nombre → mencionar alumno (nombres disponibles: ${names})
- #todos → todos los presentes
- [indicador] → indicador evaluado (disponibles: ${indicators})
- N/5 → nota del 1 al 5 (formato: 3/5)
- (texto) → observación pedagógica
- {texto} → tarea asignada
- $texto → medida técnica

INDICADOR ACTIVO: ${indicadorActivo || 'ninguno seleccionado'}

TEXTO DEL MAESTRO:
${rawText}

Respondé SOLO con el DSL estructurado, sin explicaciones.`

      const messages = [{ role: 'user', content: prompt }]

      const cacheKey = `structureDSL:${rawText.substring(0, 40)}`
      const result = await _requestWithFallback(messages, 0.3, cacheKey)
      return result.data
    },

    /**
     * Genera una sugerencia pedagógica breve para un indicador.
     * @param {object} opts - { indicadorNombre, historial, alumnosRezagados }
     */
    async suggestForIndicator({ indicadorNombre, historial = [], alumnosRezagados = [] }) {
      const avg = historial.length
        ? (historial.reduce((sum, v) => sum + (Number(v) || 0), 0) / historial.length).toFixed(1)
        : 'N/A'
      const names = alumnosRezagados.join(', ') || 'ninguno'

      const prompt = `Sos un asistente pedagógico musical. Basándote en este contexto, dá UNA sugerencia breve (máx 2 oraciones).

INDICADOR: ${indicadorNombre}
HISTORIAL: ${historial.length} evaluaciones. Promedio: ${avg}/5
ALUMNOS REZAGADOS (nota < 3): ${names}

Respondé SOLO la sugerencia.`

      const messages = [{ role: 'user', content: prompt }]

      const cacheKey = `suggestIndicador:${indicadorNombre}:${avg}:${alumnosRezagados.join('|')}`
      const result = await _requestWithFallback(messages, 0.6, cacheKey)
      return result.data
    },

    // Compatibilidad: el manejo de keys ahora es server-side; estos toggles solo
    // habilitan/deshabilitan el intento de cada proveedor desde el cliente.
    setGroqKey(k) { tryGroq = !!k || tryGroq },
    setOpenRouterKey(k) { tryOpenRouter = !!k || tryOpenRouter },
    getAvailableProviders() {
      return { openrouter: tryOpenRouter, groq: tryGroq }
    },
  }
}

export async function getFreeModels() {
  return FREE_MODELS
}
