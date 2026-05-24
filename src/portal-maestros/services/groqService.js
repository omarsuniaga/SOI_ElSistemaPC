/**
 * Groq service — portal-maestros
 *
 * All Groq API calls go through the `groq-proxy` Supabase Edge Function.
 * The Groq API key lives in Edge Function secrets and is NEVER sent to the browser.
 */

import { supabase } from '../../lib/supabaseClient.js'

const GROQ_CONFIG = {
  model: 'llama-3.1-8b-instant',
  whisperModel: 'whisper-large-v3',
  temperature: 0.2,
}

// ---------------------------------------------------------------------------
// Proxy helpers
// ---------------------------------------------------------------------------

/**
 * Get the base URL for the groq-proxy Edge Function.
 * Works in both local dev (supabase start) and production.
 */
function proxyBase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
  return `${supabaseUrl}/functions/v1/groq-proxy`
}

/**
 * Build auth headers using the current Supabase session JWT.
 */
async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ''
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  }
}

/**
 * POST to /chat endpoint of the proxy.
 */
async function proxyChat(messages, temperature = GROQ_CONFIG.temperature) {
  const headers = await authHeaders()
  const res = await fetch(`${proxyBase()}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: GROQ_CONFIG.model, messages, temperature }),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `Groq proxy error ${res.status}`)
  return data.choices[0].message.content.trim()
}

/**
 * POST to /transcribe endpoint of the proxy.
 */
async function proxyTranscribe(audioBlob) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ''

  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.m4a')
  formData.append('model', GROQ_CONFIG.whisperModel)

  const res = await fetch(`${proxyBase()}/transcribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
      // Do NOT set Content-Type — browser sets it with the boundary automatically
    },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `Groq proxy error ${res.status}`)
  return data.text
}

// ---------------------------------------------------------------------------
// System prompts (unchanged from original)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `
Eres un asistente pedagógico musical especializado.
Recibes el registro de clase de un maestro de música (puede ser texto libre o transcripción).
Tu tarea es estructurar la información usando estrictamente este DSL:
  #Nombre    = alumno mencionado
  [texto]    = contenido dado en clase
  (texto)    = sugerencia de mejora para el alumno
  {texto}    = tarea asignada
  $término   = medida técnica (una palabra o frase con guion bajo)
  N/5        = calificación
  >CÓDIGO    = objetivo curricular alcanzado

Reglas:
- Agrupa alumnos con el mismo contenido: #Pedro, #Laura [Escala Do]
- Si no hay información de un tipo, omite el token.
- Responde ÚNICAMENTE con el texto en DSL, sin explicaciones ni preámbulos.
- Mantén el tono profesional pero cercano.
`

const IMPROVE_TEXT_PROMPT = `
Eres un experto en escritura pedagógica y claridad profesional.
Tu tarea es MEJORAR el texto que recibes del maestro, enfocándose en:
1. Gramática y ortografía correctas
2. Claridad y concisión
3. Tono profesional pero accesible
4. Agregar perspectivas pedagógicas cuando sea relevante
5. Mantener la voz y estilo del maestro original

Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni cambios de significado.
`

const STRUCTURE_TO_DSL_PROMPT = `
Sos un experto en convertir observaciones de clase al formato DSL pedagógico.
Recibís una observación libre de un maestro de música.
Tu tarea es ESTRUCTURARLA usando los tokens DSL:

  #Nombre    = alumno mencionado
  [texto]    = contenido o indicador evaluado
  (texto)    = observación pedagógica / sugerencia de mejora
  {texto}    = tarea asignada para la próxima clase
  $término   = medida técnica (digitación, arco, respiración, etc.)
  N/5        = calificación numérica (ej: 4/5)

Reglas strictas:
- NO uses >CÓDIGO a menos que el maestro mencione explícitamente un código curricular
- Usa [indicador] para referenciar el contenido evaluado
- Si hay un indicador activo en la ruta, mencionalo en [ ]
- Las calificaciones van al FINAL de cada línea (ej: #María [Escalas] (buen trabajo) 5/5)
- Si el maestro no mencionó un alumno, agrupalo con #todos
- Solo usa los tokens que tengan contenido real — omití los que estén vacíos
- Respondé ÚNICAMENTE con el texto estructurado en DSL, sin explicaciones ni prefijos

MAL: "#María [Escalas] (mejoró) {practicar} 4/5 >CÓDIGO"
BIEN: "#María [Escalas] (mejoró notablemente en la ejecución económica) {Escala F mayor en 3 octavas} 5/5"
`

// ---------------------------------------------------------------------------
// Public API (same signatures as before — drop-in replacement)
// ---------------------------------------------------------------------------

export async function enrichToDSL(text) {
  try {
    return await proxyChat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ])
  } catch (err) {
    console.error('[GROQ] Error en enrichToDSL:', err)
    throw err
  }
}

export async function transcribeAndStructure(audioBlob) {
  try {
    const transcription = await proxyTranscribe(audioBlob)
    return await enrichToDSL(transcription)
  } catch (err) {
    console.error('[GROQ] Error en transcripción:', err)
    throw err
  }
}

export async function improveText(text) {
  try {
    return await proxyChat([
      { role: 'system', content: IMPROVE_TEXT_PROMPT },
      { role: 'user', content: text },
    ])
  } catch (err) {
    console.error('[GROQ] Error en improveText:', err)
    throw err
  }
}

export async function structureTextToDSL(text, context = {}) {
  const names = context.presentes?.join(', ') || ''
  const indicadorActivo = context.indicadorActivo || 'ninguno'
  const contextualPrompt = STRUCTURE_TO_DSL_PROMPT +
    `\n\nCONTEXTO ADICIONAL:\nAlumnos en clase: ${names || 'no especificados'}\nIndicador activo en la ruta: ${indicadorActivo}\n`

  try {
    return await proxyChat([
      { role: 'system', content: contextualPrompt },
      { role: 'user', content: text },
    ])
  } catch (err) {
    console.error('[GROQ] Error en structureTextToDSL:', err)
    throw err
  }
}

export async function callGroq(messages) {
  try {
    return await proxyChat(messages)
  } catch (err) {
    console.error('[GROQ] Error en callGroq:', err)
    throw err
  }
}
