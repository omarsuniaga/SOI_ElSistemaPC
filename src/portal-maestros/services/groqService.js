/**
 * Groq service — portal-maestros
 *
 * All Groq API calls go through the `groq-proxy` Supabase Edge Function.
 * The Groq API key lives in Edge Function secrets and is NEVER sent to the browser.
 */

import { supabase } from '../../lib/supabaseClient.js'
import { segmentObservation, inferTipo } from '../utils/observationParser.js'

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

  let data
  try {
    data = await res.json()
  } catch (parseErr) {
    throw new Error(`Groq proxy returned non-JSON (status ${res.status})`)
  }

  if (!res.ok || data.error) {
    const msg = data.error?.message ?? data.error ?? `Groq proxy error ${res.status}`
    console.error('[GROQ] proxyChat error response:', res.status, data)
    throw new Error(msg)
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    console.error('[GROQ] proxyChat: empty or missing content in response', data)
    throw new Error('Groq devolvió una respuesta vacía')
  }

  return content.trim()
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

// Minimal prompt — JS pre-parser already resolved: who, state, note, task.
// Groq only needs to enrich each group with a clean content label and observation summary.
const ENRICH_GROUPS_PROMPT = `Eres un asistente pedagógico musical.

Recibes grupos de progreso ya detectados por código de un texto de observación musical.
Tu tarea es completar únicamente dos campos por grupo:

- "contenido": etiqueta breve y concisa de lo trabajado (ej. "Violín Lec. 11", "Escala de Sol mayor"). Máximo 50 caracteres.
- "observacion": resumen pedagógico y cualitativo del nivel actual del alumno. Máximo 80 caracteres.

Responde únicamente con JSON válido, sin markdown (sin bloques de código \`\`\`json) y sin explicaciones adicionales.

Formato exacto de respuesta:
{
  "items": [
    {
      "id": "g_1",
      "contenido": "...",
      "observacion": "..."
    }
  ]
}

Cada grupo incluye un campo "alert_type" que el sistema ya detectó: CONDUCTA, ATENCION, RIESGO_PEDAGOGICO, o null.

Reglas estrictas:
- No cambies alumnos.
- No cambies estados.
- No inventes logros que no estén sugeridos.
- No uses palabras como "correctamente", "domina", "logró", "aplica bien" o similares si el fragmento no contiene evidencia explícita de logro. Si el fragmento solo describe que se vio o trabajó un material, descríbelo de forma neutral (ej: "Trabajó la lección").
- Si el fragmento menciona compases específicos, inclúyelos en el contenido (ej. "Danzón c.33-40").
- Si "alert_type" es "ATENCION": usa "Atención y concentración" en contenido. NUNCA uses "Comportamiento" ni "Enfoque" para este tipo de alerta.
- Si "alert_type" es "RIESGO_PEDAGOGICO": usa el nombre técnico de la dificultad en contenido (ej: "Técnica del arco", "Posición del violín"). NUNCA uses "Comportamiento".
- Si "alert_type" es "CONDUCTA": usa "Comportamiento" en contenido. Reserva este término SOLO para conducta disruptiva, falta de respeto o indisciplina explícita.
- Si "alert_type" es null y el fragmento trata de inasistencia o llegada tarde, usa "Asistencia" en contenido.
- Escribe siempre en un español neutro impecable y profesional (no uses voseo ni modismos locales).
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
 * Attempt to parse a JSON string from Groq, repairing common issues:
 * - Strips markdown code fences
 * - Replaces curly/smart quotes with straight quotes
 * - Escapes unescaped double quotes inside string values (char-by-char)
 * Falls back gracefully at each stage.
 */
function parseGroqJSON(raw) {
  // 1. Strip code fences and trim
  let s = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim()

  // 2. Replace curly/smart quotes with straight ASCII quotes
  s = s.replace(/['']/g, "'").replace(/[""]/g, '"')

  // 3. First attempt: direct parse
  try { return JSON.parse(s) } catch (_) { /* continue to repair */ }

  // 4. Repair: walk char-by-char, escape unescaped double quotes inside strings
  try { return JSON.parse(_fixUnescapedQuotes(s)) } catch (_) { /* continue */ }

  // 5. Repair truncated JSON — model ran out of tokens and cut the response mid-object.
  //    Close any open arrays and objects by counting unclosed brackets.
  try { return JSON.parse(_closeTruncatedJSON(s)) } catch (_) { /* continue */ }
  try { return JSON.parse(_closeTruncatedJSON(_fixUnescapedQuotes(s))) } catch (_) { /* continue */ }

  // 6. Last resort: find outermost { } or [ ] and try again (with truncation repair)
  const mObj = s.match(/\{[\s\S]*/)
  if (mObj) {
    const candidate = _closeTruncatedJSON(mObj[0])
    try { return JSON.parse(candidate) } catch (_) { /* fall through */ }
    try { return JSON.parse(_fixUnescapedQuotes(candidate)) } catch (_) { /* fall through */ }
  }
  const mArr = s.match(/\[[\s\S]*/)
  if (mArr) {
    const candidate = _closeTruncatedJSON(mArr[0])
    try { return JSON.parse(candidate) } catch (_) { /* fall through */ }
    try { return JSON.parse(_fixUnescapedQuotes(candidate)) } catch (_) { /* fall through */ }
  }

  // Nothing worked — throw so the caller can handle it
  throw new SyntaxError('Unable to repair Groq JSON response')
}


/**
 * Attempts to close a truncated JSON string by appending missing brackets/braces.
 * Handles the case where the model runs out of tokens mid-response.
 */
function _closeTruncatedJSON(str) {
  const stack = []
  let inStr = false
  let i = 0

  while (i < str.length) {
    const ch = str[i]
    if (inStr) {
      if (ch === '\\') { i += 2; continue }
      if (ch === '"') inStr = false
    } else {
      if (ch === '"') inStr = true
      else if (ch === '{') stack.push('}')
      else if (ch === '[') stack.push(']')
      else if (ch === '}' || ch === ']') stack.pop()
    }
    i++
  }

  // If we're still inside a string, close it first
  let tail = inStr ? '"' : ''
  // Close any open structures in reverse order
  tail += stack.reverse().join('')

  return str + tail
}

function _fixUnescapedQuotes(str) {
  let out = ''
  let inStr = false
  let i = 0
  while (i < str.length) {
    const ch = str[i]
    // Handle escape sequences inside strings
    if (inStr && ch === '\\') {
      out += ch + (str[i + 1] ?? '')
      i += 2
      continue
    }
    if (ch === '"') {
      if (!inStr) {
        inStr = true
        out += ch
      } else {
        // Peek ahead (skip spaces) to decide if this is a closing quote
        let j = i + 1
        while (j < str.length && (str[j] === ' ' || str[j] === '\t')) j++
        const next = str[j]
        if (next === ',' || next === ':' || next === '}' || next === ']' || next === '\n' || next === '\r' || j >= str.length) {
          inStr = false
          out += ch
        } else {
          // Unescaped quote inside a string — escape it
          out += '\\"'
        }
      }
    } else {
      out += ch
    }
    i++
  }
  return out
}

/**
 * Analyzes a free-text observation with full class context.
 *
 * Architecture:
 *   1. JS pre-parser (observationParser.js) — detects: who, state, note, task (free, instant)
 *   2. Groq enrich call — only fills: contenido + observacion per group (tiny output)
 *   3. JS post-processor — expands student groups, infers tipo, builds DSL string
 *
 * @param {string} text - Teacher's free-text observation
 * @param {object} context
 * @param {Array<{id,nombre,nombreCorto}>} context.alumnos
 * @param {Array<{id,nombre,nombreCorto}>} context.presentes
 * @param {string} context.tipoClase - 'instrumento' | 'ensayo_general' | 'teoria'
 * @param {string} context.instrumento
 * @param {string} [context.indicadorActivo]
 * @returns {Promise<{dsl: string, progreso: Array, resumen: string}>}
 */
/** Sanitizes raw fragments by removing real student names. */
function _removeStudentNames(fragment, presentes) {
  let clean = fragment
  for (const a of presentes) {
    const full = (a.nombre || a.nombre_completo || '').toLowerCase().trim()
    const short = (a.nombreCorto || a.nombre_corto || a.nombre || a.nombre_completo || '').toLowerCase().trim()
    
    const cleanReg = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    if (full) {
      clean = clean.replace(new RegExp(cleanReg(full), 'gi'), '')
    }
    if (short && short !== full) {
      clean = clean.replace(new RegExp(cleanReg(short), 'gi'), '')
    }
    const first = (a.nombre || a.nombre_completo || '').toLowerCase().trim().split(' ')[0]
    if (first) {
      clean = clean.replace(new RegExp(`#${cleanReg(first)}`, 'gi'), '')
      clean = clean.replace(new RegExp(`\\b${cleanReg(first)}\\b`, 'gi'), '')
    }
  }
  return clean.replace(/\s+/g, ' ').replace(/^\s*[,.;]\s*/, '').trim()
}

/**
 * Parses free-text observation into a structured progress payload using determinist parser + Groq.
 */
export async function analyzeObservation(text, context = {}) {
  const alumnos  = context.alumnos  || []
  const presentes = context.presentes?.length ? context.presentes : alumnos

  // ── Step 1: JS pre-parse (free, no API call) ──────────────────────────────
  const groups = segmentObservation(text, { ...context, alumnos, presentes })

  if (!groups.length) {
    return { dsl: '', progreso: [], resumen: 'Registro general de clase sin evaluaciones detectadas.' }
  }

  // ── Step 2: Groq enrichment — send clean JSON contract ────────────────────
  const payload = {
    instrumento: context.instrumento || 'música',
    tipoClase: context.tipoClase || 'instrumento',
    groups: groups.map((g, i) => ({
      id: `g_${i + 1}`,
      fragment: _removeStudentNames(g.fragment, presentes),
      estado: g.estado?.value || g.estado,
      tipo: inferTipo(g.fragment, context.tipoClase),
      scope: g.scope || 'grupo',
      alert_type: g.alertDetails?.type || null
    }))
  }

  let enriched = groups.map(() => ({ contenido: '', observacion: '' })) // safe default

  let raw
  try {
    raw = await proxyChat(
      [
        { role: 'system', content: ENRICH_GROUPS_PROMPT },
        { role: 'user',   content: JSON.stringify(payload) },
      ],
      0.1
    )
    const parsed = parseGroqJSON(raw)
    const items = parsed && Array.isArray(parsed.items) ? parsed.items : (Array.isArray(parsed) ? parsed : null)
    
    if (items && items.length === groups.length) {
      enriched = items
    } else if (items) {
      // Length mismatch — map securely by ID if available
      enriched = groups.map((_, i) => {
        const found = items.find(item => item.id === `g_${i + 1}`) || items[i]
        return found || { contenido: '', observacion: '' }
      })
    }
  } catch (err) {
    console.warn('[GROQ] Enrich call failed, using fallback:', err.message, '| raw:', raw ?? '(no response)')
  }

  // ── Step 3: JS post-process — assemble final progreso records ────────────
  const progreso = groups.map((g, i) => {
    const e = enriched[i] || {}
    const contenido = (e.contenido || '').trim() || _extractFallbackContent(g.fragment)
    const tipo = inferTipo(contenido + ' ' + g.fragment, context.tipoClase)

    return {
      alumnos:               g.alumnos.map(a => a.nombre || a.nombre_completo || a.nombreCorto),
      contenido,
      tipo,
      estado:                g.estado?.value || g.estado, // Save raw string value to DB
      nota:                  g.nota,
      tarea:                 g.tarea,
      observacion:           (e.observacion || '').trim() || null,
      es_colectivo:          g.esColectivo,
      alerta:                g.alerta || false,
      alertaTipo:            g.alertDetails?.type || null,
      alertDetails:          g.alertDetails,
      scope:                 g.scope || 'grupo',
      excludeIds:            g.excludeIds || [],
      requires_confirmation: g.requires_confirmation || false
    }
  })

  // ── DSL string — built from structured data, no AI needed ─────────────────
  const dsl = _buildDSL(progreso, presentes)

  // ── Summary — one sentence from Groq output or JS fallback ───────────────
  const resumen = _buildResumen(progreso, context.instrumento)

  return { dsl, progreso, resumen }
}

/** Extracts a short content label from raw fragment text as last-resort fallback. */
function _extractFallbackContent(fragment) {
  // Remove student names, state words, notes — keep the content noun phrase
  return fragment
    .replace(/\d\/5/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(todos|todo|grupo|clase|el|la|los|las|un|una)\b/gi, '')
    .trim()
    .slice(0, 50) || 'Clase'
}

/** Builds a DSL string from structured progreso records. */
function _buildDSL(progreso, presentes) {
  return progreso.map(rec => {
    const names = rec.es_colectivo
      ? '#Todos'
      : rec.alumnos?.length
        ? rec.alumnos.map(n => `#${n.replace(/\s+/g, '_')}`).join(', ')
        : '#General'
    const estado = `!${rec.estado}`
    const nota   = rec.nota ? ` ${rec.nota}/5` : ''
    const tarea  = rec.tarea ? ` {${rec.tarea}}` : ''
    const obs    = rec.observacion ? ` (${rec.observacion})` : ''
    return `${names} [${rec.contenido}] ${estado}${nota}${obs}${tarea}`
  }).join(' · ')
}

/** Builds a one-sentence summary from structured records. */
function _buildResumen(progreso, instrumento) {
  if (!progreso.length) return 'Registro de clase sin evaluaciones detectadas.'
  const tipos = [...new Set(progreso.map(r => r.tipo))].join(', ')
  const estados = progreso.map(r => r.estado)
  const dominante = estados.sort((a, b) =>
    estados.filter(x => x === b).length - estados.filter(x => x === a).length
  )[0]
  const estadoLabel = { LOGRADO: 'con logros consolidados', EN_PROGRESO: 'en progreso', INICIADO: 'iniciando contenidos' }[dominante] || 'evaluada'
  return `Sesión de ${instrumento || 'música'} — ${tipos} — ${estadoLabel}.`
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
    return parseGroqJSON(raw)
  } catch (err) {
    console.error('[groqService] generateMonthlyPatterns failed:', err)
    return {
      patrones: { positivos: [], atencion: [] },
      recomendaciones: { academico: '', logistica: '', talentos: '', refuerzo: '' },
      notaDireccion: ''
    }
  }
}

