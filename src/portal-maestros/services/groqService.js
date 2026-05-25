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

const ANALYZE_OBSERVATION_PROMPT = `
Sos un asistente pedagógico musical especializado en análisis de registros de clase.

Recibís una observación libre de un maestro de música y un contexto de la clase.
Tu tarea es analizar el texto y devolver ÚNICAMENTE un JSON válido con tres campos, sin texto extra.

FORMATO DE RESPUESTA:
{
  "dsl": "texto en formato DSL usando tokens #Nombre [contenido] !ESTADO (sugerencia) {tarea} N/5",
  "progreso": [
    {
      "alumnos": ["nombre completo según lista del contexto"],
      "contenido": "qué se trabajó (conciso, máx 60 chars)",
      "tipo": "tecnica | repertorio | teoria | interpretacion | otro",
      "estado": "LOGRADO | EN_PROGRESO | INICIADO",
      "nota": null,
      "tarea": null,
      "observacion": "descripción del nivel actual (máx 100 chars)",
      "es_colectivo": false
    }
  ],
  "resumen": "Una frase que resume el foco pedagógico de la sesión (máx 120 chars)"
}

REGLAS DE INFERENCIA DE ESTADO:
- "lograron", "alcanzaron", "dominaron", "ya saben", "lo hicieron bien" → LOGRADO
- "avanzando", "mejorando", "progresando", "casi", "van bien", "muestran progreso" → EN_PROGRESO
- "empezaron", "conocieron", "introdujeron", "por primera vez", "vieron" → INICIADO
- Sin indicador claro → EN_PROGRESO (default conservador)

REGLAS DE TIPO (usar tipoClase del contexto):
- tipoClase "instrumento": progreso es ejecución del instrumento → tipo preferido "tecnica" o "repertorio"
- tipoClase "ensayo_general": progreso colectivo → tipo "repertorio"; mención individual → tipo "interpretacion"
- tipoClase "teoria": tipo "teoria"
- Obras musicales con nombre propio (Danzón, Minueto, Sonata, etc.) → tipo "repertorio"
- Escalas, posiciones, arco, digitación → tipo "tecnica"
- Ritmo, compás, armonía, lectura → tipo "teoria"

RESOLUCIÓN DE NOMBRES:
- Resolvé nombres parciales usando la lista "alumnos" del contexto: "Yereni" → nombre completo de la lista
- "todos" en el texto = SOLO los alumnos de la lista "presentes" (no toda la clase)
- Si presentes está vacío → usar lista completa "alumnos"
- Si no podés resolver un nombre → usá el nombre tal como lo escribió el maestro

PASAJES Y DETALLES:
- "compases 333 al 348" → incluílo en contenido: "Danzón c.333-348"
- Detalles técnicos del pasaje van en observacion

CAMPO DSL:
- Usá los tokens estándar del DSL
- Incluí !LOGRADO / !EN_PROGRESO / !INICIADO para los estados extraídos
- Las calificaciones van al final: "4/5"

Si el texto no contiene información de progreso evaluable → devolvé progreso: [] y resumen: "Registro general de clase sin evaluaciones individuales detectadas"
`

const PROPOSE_CURRICULUM_PROMPT = `
Eres un pedagogo musical especializado en diseño curricular.

Analizas registros reales de clase de un período determinado y propones
un plan curricular estructurado en pilares y objetivos.

FORMATO DE RESPUESTA (JSON válido, sin texto adicional):
{
  "pilares": [
    {
      "nombre": "Nombre del pilar",
      "tipo": "tecnica|repertorio|teoria|interpretacion",
      "objetivos": [
        {
          "descripcion": "Nombre conciso del objetivo (máximo 60 caracteres)",
          "prioridad": "alta|media|consolidacion"
        }
      ]
    }
  ],
  "resumen": "Una frase que describe el foco pedagógico detectado (máximo 120 caracteres)"
}

REGLAS DE CONSTRUCCIÓN:
- Máximo 4 pilares — usa solo los tipos que aparecen en los datos
- De 2 a 6 objetivos por pilar
- Los registros con estado LOGRADO indican consolidación — inclúyelos con prioridad "consolidacion"
- Los registros EN_PROGRESO son el foco principal — asígnales prioridad "alta"
- Los registros INICIADO son objetivos emergentes — inclúyelos solo si frecuencia >= 2, prioridad "media"
- Nombres de objetivos: concisos, pedagógicamente precisos, máximo 60 caracteres
- No inventes contenidos que no estén presentes en los registros
- Si no hay suficientes datos para un pilar, omítelo
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

/**
 * Analyzes a free-text observation with full class context.
 * Extracts structured progress records per student.
 *
 * @param {string} text - Teacher's free-text observation
 * @param {object} context
 * @param {Array<{id,nombre,nombreCorto}>} context.alumnos
 * @param {Array<{id,nombre,nombreCorto}>} context.presentes
 * @param {string} context.tipoClase - 'instrumento' | 'ensayo_general' | 'teoria'
 * @param {string} context.instrumento
 * @param {string[]} context.sesionesRecientes
 * @param {string} [context.indicadorActivo]
 * @returns {Promise<{dsl: string, progreso: Array, resumen: string}>}
 */
export async function analyzeObservation(text, context = {}) {
  const alumnosStr = (context.alumnos || []).map(a => `${a.nombre} (${a.nombreCorto})`).join(', ')
  const presentesStr = (context.presentes || []).map(a => a.nombre).join(', ')
  const recientesStr = (context.sesionesRecientes || []).join('\n---\n')

  const contextBlock = `
CONTEXTO DE LA CLASE:
- Instrumento / tipo: ${context.instrumento || 'no especificado'} (tipoClase: ${context.tipoClase || 'instrumento'})
- Alumnos en clase: ${alumnosStr || 'no especificados'}
- Alumnos presentes hoy: ${presentesStr || alumnosStr || 'todos'}
- Indicador activo del plan: ${context.indicadorActivo || 'ninguno'}
- Sesiones recientes:
${recientesStr || 'sin sesiones previas registradas'}
`

  const systemPrompt = ANALYZE_OBSERVATION_PROMPT + '\n\n' + contextBlock

  try {
    const raw = await proxyChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      0.1
    )

    // Parse JSON — Groq sometimes wraps in markdown code blocks (with leading whitespace/newlines)
    const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    console.debug('[GROQ] analyzeObservation cleaned:', cleaned)
    const parsed = JSON.parse(cleaned)

    return {
      dsl: parsed.dsl || '',
      progreso: Array.isArray(parsed.progreso) ? parsed.progreso : [],
      resumen: parsed.resumen || '',
    }
  } catch (err) {
    console.error('[GROQ] Error en analyzeObservation:', err, '| raw:', typeof raw !== 'undefined' ? raw : '(no response)')
    throw new Error('No se pudo analizar la observación. Verificá la conexión con el servicio IA.')
  }
}

/**
 * Proposes a structured curriculum plan from aggregated progress insights.
 *
 * @param {object} insights - Result of progressInsightService.fetchInsights()
 * @param {number} insights.totalSesiones
 * @param {string} insights.fechaDesde
 * @param {Array}  insights.registros
 * @param {object} context
 * @param {string} context.instrumento
 * @param {string} context.nivel
 * @param {string} context.nombreClase
 * @returns {Promise<{ pilares: Array, resumen: string }>}
 */
export async function proposeCurriculum(insights, context = {}) {
  const contextBlock = `
CONTEXTO:
- Clase: ${context.nombreClase || 'no especificado'}
- Instrumento: ${context.instrumento || 'no especificado'}
- Nivel estimado: ${context.nivel || 'no especificado'}
- Total sesiones analizadas: ${insights.totalSesiones}
- Período desde: ${insights.fechaDesde}

REGISTROS (ordenados por frecuencia de aparición en sesiones):
${JSON.stringify(insights.registros, null, 2)}
`

  const systemPrompt = PROPOSE_CURRICULUM_PROMPT + '\n\n' + contextBlock

  try {
    const raw = await proxyChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Genera la propuesta curricular basada en estos registros.' },
      ],
      0.2
    )

    // Strip markdown code blocks — Groq sometimes wraps response in ```json
    const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    console.debug('[GROQ] proposeCurriculum cleaned:', cleaned)
    const parsed = JSON.parse(cleaned)

    return {
      pilares: Array.isArray(parsed.pilares) ? parsed.pilares : [],
      resumen: parsed.resumen || '',
    }
  } catch (err) {
    console.error('[GROQ] Error en proposeCurriculum:', err, '| raw:', typeof raw !== 'undefined' ? raw : '(no response)')
    throw new Error('No se pudo generar la propuesta curricular. Verifica la conexión con el servicio de IA.')
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

/**
 * Analyze monthly session + progress data and generate institutional narrative.
 *
 * @param {Array} sesiones  — array of sesiones_clase rows
 * @param {Array} progresos — array of progresos rows with alumno names
 * @param {Object} context  — { clase: string, docente: string, mes: string, totalAlumnos: number }
 * @returns {Promise<{
 *   patrones: { positivos: string[], atencion: string[] },
 *   recomendaciones: { academico: string, logistica: string, talentos: string, refuerzo: string },
 *   notaDireccion: string
 * }>}
 */
export async function generateMonthlyPatterns(sesiones, progresos, context) {
  const sesionesResumen = sesiones.map(s => {
    const att = s.asistencia || []
    const P = att.filter(a => a.estado === 'P').length
    const A = att.filter(a => a.estado === 'A').length
    const J = att.filter(a => a.estado === 'J').length
    return `Sesión ${s.numero_sesion} (${s.fecha}): ${P} presentes, ${A} ausentes, ${J} justificados`
  }).join('\n')

  const progresosResumen = progresos.map(p =>
    `${p.alumnos?.nombre_completo ?? 'Alumno'} — ${p.curriculo_objetivos?.descripcion ?? p.contenido_dsl ?? ''}: ${p.tipo}`
  ).join('\n')

  const prompt = `Eres el asistente pedagógico del Departamento Académico de El Sistema Punta Cana.
Analiza los datos del mes de ${context.mes} para la clase "${context.clase}" (docente: ${context.docente}, ${context.totalAlumnos} alumnos).

DATOS DE ASISTENCIA:
${sesionesResumen}

DATOS DE PROGRESO:
${progresosResumen}

Devuelve un JSON con esta estructura exacta (sin texto adicional, solo el JSON):
{
  "patrones": {
    "positivos": ["máximo 3 patrones positivos detectados"],
    "atencion": ["máximo 3 situaciones que requieren atención"]
  },
  "recomendaciones": {
    "academico": "recomendación académica en 2 oraciones",
    "logistica": "recomendación logística/administrativa en 2 oraciones",
    "talentos": "recomendación sobre talentos o alumnos destacados en 2 oraciones",
    "refuerzo": "recomendación sobre alumnos que necesitan refuerzo en 2 oraciones"
  },
  "notaDireccion": "nota ejecutiva de 3-4 oraciones para el director, destacando lo más relevante del mes"
}
Usa español neutro, tono formal-institucional, sin voseo.`

  try {
    const raw = await proxyChat([{ role: 'user', content: prompt }], 0.3)
    // Strip potential markdown code fences
    const jsonStr = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    return JSON.parse(jsonStr)
  } catch (err) {
    console.error('[groqService] generateMonthlyPatterns failed:', err)
    return {
      patrones: { positivos: [], atencion: [] },
      recomendaciones: { academico: '', logistica: '', talentos: '', refuerzo: '' },
      notaDireccion: ''
    }
  }
}

