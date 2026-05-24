/**
 * Groq service — modules/planificacion
 *
 * All Groq API calls go through the `groq-proxy` Supabase Edge Function.
 * The Groq API key lives in Edge Function secrets and is NEVER sent to the browser.
 */

import { config } from '../../../core/config/config.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { parseDsl } from '../utils/dslParser.js'

// ---------------------------------------------------------------------------
// Proxy helpers
// ---------------------------------------------------------------------------

function proxyBase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
  return `${supabaseUrl}/functions/v1/groq-proxy`
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

async function proxyChat(messages, { maxTokens, temperature, responseFormat } = {}) {
  const headers = await authHeaders()
  const body = {
    model: config.groq.model,
    messages,
    ...(maxTokens     && { max_tokens: maxTokens }),
    ...(temperature   !== undefined && { temperature }),
    ...(responseFormat && { response_format: responseFormat }),
  }
  const res = await fetch(`${proxyBase()}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `Groq proxy error ${res.status}`)
  return data.choices[0].message.content.trim()
}

async function proxyTranscribe(audioBlob, fileName = 'audio.webm') {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ''

  const formData = new FormData()
  formData.append('file', new File([audioBlob], fileName, { type: audioBlob.type || 'audio/webm' }))
  formData.append('model', config.groq.whisperModel)

  const res = await fetch(`${proxyBase()}/transcribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
    },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `Groq proxy error ${res.status}`)
  return data.text ?? ''
}

// ---------------------------------------------------------------------------
// Mock helpers (demo mode / no proxy available)
// ---------------------------------------------------------------------------

const MOCK_RESPONSES = {
  'escala do': '#Pedro [Escala Do Mayor] $1Octava (Practicar digitación) {Estudiar escala Do Mayor 10min/día} 4/5\n#Lucía [Escala Do# Mayor] $1Octava (Mayor velocidad) {Practicar cambio de posición} 3/5',
  'default': '#Alumno [Contenido dado] $medida (sugerencia) {tarea} N/5',
}

function getMockEnrichResponse(input) {
  const lower = input.toLowerCase()
  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (lower.includes(key)) return response
  }
  const parsed = parseDsl(input)
  if (parsed.alumnos?.length > 0) return input
  return MOCK_RESPONSES.default
    .replace('Alumno', 'Estudiante')
    .replace('Contenido dado', input.substring(0, 30))
}

const BASE_PROMPT = `Eres un asistente pedagógico musical. Recibis el registro de clase de un maestro.
Estructura la información usando este DSL:
- #Nombre = alumno mencionado
- [texto] = contenido dado
- (texto) = sugerencia de mejora
- {texto} = tarea asignada
- $término = medida técnica
- N/5 = calificación
Responde SOLO con el texto estructurado en DSL, sin explicaciones.`

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function enrichText(texto) {
  if (!texto || texto.trim().length === 0) {
    return { success: false, message: 'El texto no puede estar vacío', dsl: '' }
  }

  if (config.isDemoMode) {
    return { success: true, message: 'Demo mode', dsl: getMockEnrichResponse(texto), debug: { isMock: true } }
  }

  try {
    const dsl = await proxyChat([
      { role: 'system', content: BASE_PROMPT },
      { role: 'user', content: `Texto del maestro: "${texto}"` },
    ], { maxTokens: config.groq.maxTokens, temperature: config.groq.temperature })
    return { success: true, message: 'Enriquecido correctamente', dsl, debug: { isMock: false } }
  } catch (error) {
    console.error('GROQ enrichText error:', error)
    return { success: false, message: `Error: ${error.message}`, dsl: getMockEnrichResponse(texto), debug: { isMock: true, fallback: true, error: error.message } }
  }
}

export async function transcribeAudio(audioBlob) {
  if (!audioBlob) {
    return { success: false, message: 'Audio no proporcionado', transcript: '' }
  }

  if (config.isDemoMode) {
    return { success: true, message: 'Demo mode', transcript: 'hoy dimos escala do con pedro se porto mal', debug: { isMock: true } }
  }

  try {
    const transcript = await proxyTranscribe(audioBlob)
    return { success: true, message: 'Transcripción exitosa', transcript, debug: { isMock: false } }
  } catch (error) {
    console.error('GROQ transcribeAudio error:', error)
    return { success: false, message: `Error: ${error.message}`, transcript: '', debug: { isMock: true, fallback: true, error: error.message } }
  }
}

export async function transcribeAndParse(audioBlob) {
  const transcriptResult = await transcribeAudio(audioBlob)
  if (!transcriptResult.success) return transcriptResult
  const enrichResult = await enrichText(transcriptResult.transcript)
  return {
    success: enrichResult.success,
    message: `Transcripción: ${transcriptResult.message}, Enriquecimiento: ${enrichResult.message}`,
    transcript: transcriptResult.transcript,
    dsl: enrichResult.dsl,
    debug: { transcript: transcriptResult.debug, enrich: enrichResult.debug },
  }
}

export async function enrichFromText(texto) {
  return enrichText(texto)
}

// ── Curriculum AI Functions ──────────────────────────────────────────────────

export async function extraerCobertura(plan, alumnos, objetivos_curriculo) {
  const prompt = `Eres un asistente pedagógico musical. Dado el contenido de un plan de clase y una lista de objetivos curriculares, identifica cuáles objetivos probablemente se cubrieron.

Plan de clase:
- Tema: ${plan.tema}
- Objetivos escritos por el maestro: ${plan.objetivos || '(ninguno)'}
- Contenido: ${plan.contenido || '(ninguno)'}
- Notas DSL: ${plan.notas_dsl || '(ninguno)'}

Alumnos mencionados: ${alumnos.join(', ') || '(ninguno)'}

Objetivos curriculares a evaluar:
${objetivos_curriculo.map(o => `- id:${o.id} → ${o.descripcion}`).join('\n')}

Responde SOLO en JSON válido con este formato exacto:
{
  "coberturas": [
    { "alumno": "nombre", "objetivo_id": "uuid", "nivel": "iniciando|en_proceso|logrado", "razon": "breve justificación" }
  ]
}
Solo incluye objetivos que tengan evidencia real en el plan. No inventes coberturas.`

  if (config.isDemoMode) {
    const mockCoberturas = alumnos.slice(0, 2).flatMap(alumno =>
      objetivos_curriculo.slice(0, 2).map(o => ({
        alumno, objetivo_id: o.id, nivel: 'en_proceso', razon: 'Demo: objetivo relacionado con el tema'
      }))
    )
    return { success: true, coberturas: mockCoberturas, isMock: true }
  }

  try {
    const content = await proxyChat(
      [{ role: 'user', content: prompt }],
      { maxTokens: 1500, temperature: 0.3, responseFormat: { type: 'json_object' } }
    )
    const parsed = JSON.parse(content || '{"coberturas":[]}')
    return { success: true, coberturas: parsed.coberturas || [], isMock: false }
  } catch (error) {
    console.error('extraerCobertura error:', error)
    return { success: false, coberturas: [], error: error.message }
  }
}

export async function sugerirPlan(alumno, objetivos_pendientes, ultimos_temas) {
  const prompt = `Eres un asistente pedagógico musical. Genera un borrador de plan de clase personalizado.

Alumno: ${alumno.nombre}, instrumento: ${alumno.instrumento}, nivel: ${alumno.nivel}

Objetivos pendientes del currículo (priorizar estos):
${objetivos_pendientes.map(o => `- ${o.descripcion}`).join('\n') || '(sin objetivos pendientes registrados)'}

Últimas clases trabajadas (no repetir):
${ultimos_temas.join(', ') || '(ninguna)'}

Responde SOLO en JSON válido con este formato exacto:
{
  "tema": "...",
  "objetivos": "...",
  "contenido": "...",
  "recursos": ["..."]
}
Sé específico y pedagógicamente relevante para el instrumento y nivel.`

  if (config.isDemoMode) {
    return {
      success: true,
      plan: {
        tema: `Clase de ${alumno.instrumento} — Nivel ${alumno.nivel}`,
        objetivos: objetivos_pendientes[0]?.descripcion || 'Repaso general',
        contenido: 'Ejercicios de calentamiento, escala mayor, pieza del repertorio.',
        recursos: ['Partitura del repertorio', 'Metrónomo'],
      },
      isMock: true,
    }
  }

  try {
    const content = await proxyChat(
      [{ role: 'user', content: prompt }],
      { maxTokens: 800, temperature: 0.7, responseFormat: { type: 'json_object' } }
    )
    const parsed = JSON.parse(content || '{}')
    return { success: true, plan: parsed, isMock: false }
  } catch (error) {
    console.error('sugerirPlan error:', error)
    return { success: false, plan: null, error: error.message }
  }
}

export async function analizarEnfoque(instrumento, planes_ejecutados, curriculo, resumen_cobertura) {
  const pilares_texto = curriculo?.curriculo_pilares?.map(p =>
    `Pilar "${p.nombre}": ${p.curriculo_objetivos?.map(o => o.descripcion).join('; ')}`
  ).join('\n') || '(sin currículo definido)'

  const planes_texto = planes_ejecutados.map((p, i) =>
    `Clase ${i + 1}: ${p.tema} — ${p.contenido || p.objetivos || ''}`
  ).join('\n')

  const prompt = `Eres un mentor pedagógico musical. Analiza el trabajo de un maestro y da retroalimentación constructiva.

Instrumento principal: ${instrumento}

Currículo de referencia:
${pilares_texto}

Planes ejecutados (últimas 8 semanas):
${planes_texto || '(ninguno)'}

Cobertura de objetivos actual:
${resumen_cobertura || '(sin datos)'}

Escribe 2-3 párrafos:
1. Fortalezas del enfoque actual
2. Áreas del currículo que podrían reforzarse
3. Sugerencias concretas para próximas semanas

Tono: colega experto, respetuoso, propositivo. Sin tecnicismos innecesarios. Responde en español.`

  if (config.isDemoMode) {
    return {
      success: true,
      feedback: `Tu enfoque en las últimas semanas muestra consistencia y dedicación. Se nota claridad en la presentación de contenidos técnicos.\n\nHay oportunidad de ampliar el trabajo en repertorio variado y lectura a primera vista.\n\nPara las próximas semanas, incorporá al menos una pieza nueva por mes y dedicá 5-10 minutos a ejercicios de lectura rítmica.`,
      isMock: true,
    }
  }

  try {
    const feedback = await proxyChat(
      [{ role: 'user', content: prompt }],
      { maxTokens: 600, temperature: 0.8 }
    )
    return { success: true, feedback, isMock: false }
  } catch (error) {
    console.error('analizarEnfoque error:', error)
    return { success: false, feedback: '', error: error.message }
  }
}
