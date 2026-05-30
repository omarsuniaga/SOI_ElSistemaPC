/**
 * Groq service — portal-maestros
 *
 * All Groq API calls go through the `groq-proxy` Supabase Edge Function.
 * The Groq API key lives in Edge Function secrets and is NEVER sent to the browser.
 */

import { supabase } from '../../lib/supabaseClient.js'
import { segmentObservation, inferTipo } from '../utils/observationParser.js'
import { buildSeccionContext, expandSeccionItems } from '../data/seccionesOrquestales.js'

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
  const {
    data: { session },
  } = await supabase.auth.getSession()
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
  const {
    data: { session },
  } = await supabase.auth.getSession()
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
  if (!res.ok || data.error)
    throw new Error(data.error?.message ?? `Groq proxy error ${res.status}`)
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

/**
 * Prompt de análisis completo para Groq.
 *
 * Groq recibe el texto CRUDO del maestro (sin pre-procesar) y devuelve
 * un JSON con puntos calificables segmentados, estado inferido por rúbrica,
 * notas objetivas y justificación.
 *
 * Arquitectura de 3 tiers:
 *   1. Groq → análisis completo con IA (este prompt)
 *   2. Guardas JS → validación post-Groq (ref, nota, estado, presentes)
 *   3. Fallback → pre-parser JS si Groq falla
 */
const ANALYZE_OBSERVATION_PROMPT = `Eres un analista pedagógico musical.

Recibís el texto de observación de un maestro de música y la lista de alumnos presentes.
Tu tarea es ANALIZARLO y devolver un JSON con puntos calificables fragmentados.

Tu misión es ser HONESTO, no optimista. Calificás la EVIDENCIA DE RESULTADO presente en el texto, no la intención ni la actividad.

═══ RÚBRICA DE EVIDENCIA LINGÜÍSTICA ═══

Usá esta rúbrica para inferir estado y nota según la evidencia del texto:

LOGRO CONCRETO → LOGRADO, nota 5
  Disparadores: "logró perfectamente", "quedó resuelto", "con precisión", "dominaron", "sin errores"
  Ej: "los violines lograron la entrada con precisión"

LOGRO PARCIAL → LOGRADO, nota 4
  Disparadores: "mejoró notablemente", "salió bien", "ya casi", "lograron mayormente"
  Ej: "la frase de maderas salió bien, casi limpia"

ACTIVIDAD SIN EVIDENCIA → EN_PROGRESO, nota 3 (DEFAULT)
  Disparadores: "trabajamos", "revisamos", "pasamos por", "practicamos", "vimos"
  Ej: "revisamos los compases 23 al 49" → se trabajó, no se dice si se logró

DIFICULTAD O TRABAJO EN CURSO → EN_PROGRESO, nota 2
  Disparadores: "buscando la cohesión", "aún no", "con dificultad", "les costó", "para lograr"
  Ej: "buscando la cohesión de las semicorcheas" → no se logró aún

PRIMERA EXPOSICIÓN → INICIADO, nota 1-2
  Disparadores: "se mostró", "se explicó", "primera vez", "se introdujo", "empezamos", "comenzamos"
  Ej: "se les mostró el patrón rítmico por primera vez"

═══ REGLAS DE OBJETIVIDAD ═══
- Sin evidencia de logro → nota 3, estado EN_PROGRESO (JAMÁS infieras logros)
- "Buscando", "para lograr", "trabajando en" → nota 2 (expresan que NO se logró)
- "Se mostró", "se introdujo" por primera vez → INICIADO, nota 1-2
- No inventes logros. Si el texto solo dice "revisamos" → nota 3
- No asignes notas 4-5 a menos que el lenguaje EXPRESE explícitamente logro
- Cada punto debe incluir "explicacion_objetiva" citando la frase del texto que justifica la nota

═══ SEGMENTACIÓN ═══
Dividí el texto en TANTOS puntos calificables como sea necesario.
Cada punto = UNA UNIDAD TEMÁTICA INDEPENDIENTE:

- Por alumno: si menciona a "María", "Juan", "Pedro" individualmente → punto separado cada uno
- Por sección: si menciona "maderas", "violines", "cuerdas", "tutti" → punto por sección
- Por contenido: cada pasaje, técnica, obra o tema diferente → punto separado
- Una misma persona/sección puede tener MÚLTIPLES puntos (ej. "María trabajó escalas y después arpegios")

Ejemplos de segmentación:
  "revisamos maderas c.23-49 y violines c.198" → 2 puntos (maderas, violines)
  "María trabajó escalas y Pedro inició arpegios" → 2 puntos (María, Pedro)
  "toda la clase trabajó el danzón" → 1 punto colectivo
  "hoy con la orquesta: maderas c.23-49, violines armónicos c.198, y tutti cierre" → 3 puntos

Si no hay alumnos individuales mencionados y no hay secciones claras → 1 punto colectivo descriptivo.

═══ FORMATO EXACTO DE RESPUESTA ═══
JSON válido, SIN bloques de código, SIN markdown, SIN explicaciones.

{
  "items": [
    {
      "contenido": "etiqueta breve (máx 50 chars, ej. 'Danzón maderas c.23-49' o 'Escala Sol M')",
      "alumnos": ["Nombre1", "Nombre2"],
      "es_colectivo": false,
      "seccion": "maderas | violines | tutti | cuerdas | general | individual",
      "estado": "LOGRADO | EN_PROGRESO | INICIADO",
      "nota": 3,
      "observacion": "resumen cualitativo en 1 frase (máx 80 chars)",
      "tarea": "tarea específica o null",
      "explicacion_objetiva": "Justificación citando la evidencia textual exacta"
    }
  ],
  "resumen": "Una frase que sintetice la sesión (máx 120 chars)"
}

Reglas del formato:
- "alumnos": solo nombres que estén en la lista "alumnosPresentes". Vacío [] si es colectivo.
- "es_colectivo": true cuando el punto aplica a todo el grupo o sección, no a individuos
- "seccion": identificador libre (el que mejor describa: "violines 1", "maderas", "cuerdas", "tutti", "individual")
- "nota": null solo si no hay suficiente información; de lo contrario 1-5 siguiendo la rúbrica
- "tarea": solo si el texto menciona explícitamente tarea o "para la próxima"

Escribí en español neutro profesional, sin voseo, sin modismos locales.
Respondé ÚNICAMENTE el JSON, sin prefijos, sin texto adicional.

═══ SECCIONES PRESENTES ═══
A continuación, los alumnos presentes agrupados por sección orquestal:
__SECCIONES_CONTEXT__
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
  const contextualPrompt =
    STRUCTURE_TO_DSL_PROMPT +
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
  let s = raw
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()

  // 2. Replace curly/smart quotes with straight ASCII quotes
  s = s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')

  // 3. First attempt: direct parse
  try {
    return JSON.parse(s)
  } catch (_) {
    /* continue to repair */
  }

  // 4. Repair: walk char-by-char, escape unescaped double quotes inside strings
  try {
    return JSON.parse(_fixUnescapedQuotes(s))
  } catch (_) {
    /* continue */
  }

  // 5. Repair truncated JSON — model ran out of tokens and cut the response mid-object.
  //    Close any open arrays and objects by counting unclosed brackets.
  try {
    return JSON.parse(_closeTruncatedJSON(s))
  } catch (_) {
    /* continue */
  }
  try {
    return JSON.parse(_closeTruncatedJSON(_fixUnescapedQuotes(s)))
  } catch (_) {
    /* continue */
  }

  // 6. Last resort: find outermost { } or [ ] and try again (with truncation repair)
  const mObj = s.match(/\{[\s\S]*/)
  if (mObj) {
    const candidate = _closeTruncatedJSON(mObj[0])
    try {
      return JSON.parse(candidate)
    } catch (_) {
      /* fall through */
    }
    try {
      return JSON.parse(_fixUnescapedQuotes(candidate))
    } catch (_) {
      /* fall through */
    }
  }
  const mArr = s.match(/\[[\s\S]*/)
  if (mArr) {
    const candidate = _closeTruncatedJSON(mArr[0])
    try {
      return JSON.parse(candidate)
    } catch (_) {
      /* fall through */
    }
    try {
      return JSON.parse(_fixUnescapedQuotes(candidate))
    } catch (_) {
      /* fall through */
    }
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
      if (ch === '\\') {
        i += 2
        continue
      }
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
        if (
          next === ',' ||
          next === ':' ||
          next === '}' ||
          next === ']' ||
          next === '\n' ||
          next === '\r' ||
          j >= str.length
        ) {
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
// ---------------------------------------------------------------------------
// Guardas JS — red de seguridad post-Groq
// ---------------------------------------------------------------------------

/**
 * Aplica las guardas de validación al output de Groq.
 *
 * Cada guarda protege contra un tipo de alucinación o inconsistencia:
 *   1. Ref válido — alumno debe existir en el roster de presentes
 *   2. Presente real — el alumno debe estar marcado presente
 *   3. Nota acotada — [0,5] o null, clamped
 *   4. Estado válido — {LOGRADO, EN_PROGRESO, INICIADO}, default EN_PROGRESO
 *   5. Colectivo → sin alumnos individuales si es colectivo
 *
 * @param {Array} items — items del JSON de Groq
 * @param {Array} presentes — [{id, nombre, nombre_completo, nombreCorto}]
 * @returns {Array} items validados y normalizados
 */
function applyGuardas(items, presentes) {
  const nombresPresentes = new Set(
    presentes.map((a) => (a.nombre || a.nombre_completo || '').toLowerCase().trim()),
  )

  return items.map((item) => {
    // ── Guarda 1: nota acotada [0,5] o null ────────────────────────────────
    let nota = item.nota
    if (nota != null) {
      nota = Math.round(Math.min(5, Math.max(0, Number(nota))) * 2) / 2 // step 0.5
      if (isNaN(nota)) nota = null
    }

    // ── Guarda 2: estado válido ─────────────────────────────────────────────
    const VALID_ESTADOS = ['LOGRADO', 'EN_PROGRESO', 'INICIADO']
    const estado = VALID_ESTADOS.includes(item.estado) ? item.estado : 'EN_PROGRESO'

    // ── Guarda 3 + 4: ref válido + presente real ────────────────────────────
    let alumnos = []
    if (Array.isArray(item.alumnos)) {
      alumnos = item.alumnos.filter((nombre) => {
        if (!nombre || typeof nombre !== 'string') return false
        const n = nombre.toLowerCase().trim()
        // Check exact match, then partial match
        return (
          nombresPresentes.has(n) ||
          [...nombresPresentes].some((p) => p.includes(n) || n.includes(p))
        )
      })
    }

    // ── Guarda 5: si es colectivo, no llevar alumnos individuales ────────────
    // Si el item tiene una sección expandable (no 'general'/'individual'),
    // NO forzar es_colectivo aunque alumnos esté vacío — la expansión
    // ocurre post-guardas via expandSeccionItems.
    const hasExpandableSection = !!item.seccion && !['general', 'individual'].includes(item.seccion)
    const esColectivo =
      item.es_colectivo === true || (alumnos.length === 0 && !hasExpandableSection)

    return {
      contenido: item.contenido || '',
      alumnos: esColectivo ? [] : alumnos,
      es_colectivo: esColectivo,
      seccion: item.seccion || 'general',
      estado,
      nota,
      observacion: item.observacion || null,
      tarea: item.tarea || null,
      explicacion_objetiva: item.explicacion_objetiva || null,
    }
  })
}

/**
 * Expande los items colectivos: reemplaza alumnos=[] por la lista completa de presentes.
 * Esto asegura que cada alumno presente tenga su registro de progreso.
 */
function expandColectivos(progreso, presentes) {
  return progreso.map((rec) => {
    if (!rec.es_colectivo) return rec
    return {
      ...rec,
      alumnos: presentes.map((a) => a.nombre || a.nombre_completo || ''),
    }
  })
}

// ---------------------------------------------------------------------------
// AnalyzeObservation — 3-tier architecture
// ---------------------------------------------------------------------------

/**
 * Analiza una observación de texto libre usando el pipeline de 3 tiers:
 *
 *   Tier 1: Groq recibe texto CRUDO + contexto y devuelve JSON segmentado
 *   Tier 2: Guardas JS validan y normalizan el output de Groq
 *   Tier 3: Fallback al pre-parser JS si Groq falla o devuelve vacío
 *
 * @param {string} text - Texto libre del maestro
 * @param {object} context
 * @param {Array<{id,nombre,nombreCorto}>} context.alumnos
 * @param {Array<{id,nombre,nombreCorto}>} context.presentes
 * @param {string} context.tipoClase - 'instrumento' | 'ensayo_general' | 'teoria'
 * @param {string} context.instrumento
 * @returns {Promise<{dsl: string, progreso: Array, resumen: string}>}
 */
export async function analyzeObservation(text, context = {}) {
  const presentes = context.presentes?.length ? context.presentes : context.alumnos || []

  // ── Tier 1: Groq full analysis ───────────────────────────────────────────
  const payload = {
    observacion: text,
    alumnosPresentes: presentes.map((a) => a.nombre || a.nombre_completo || ''),
    tipoClase: context.tipoClase || 'instrumento',
    instrumento: context.instrumento || 'música',
  }

  // Inject section context into system prompt (not user payload)
  const seccionesContext = buildSeccionContext(presentes)
  const systemPrompt = ANALYZE_OBSERVATION_PROMPT.replace('__SECCIONES_CONTEXT__', seccionesContext)

  let groqItems = []
  let resumenGroq = ''

  try {
    const raw = await proxyChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      0.1,
    )
    const parsed = parseGroqJSON(raw)
    const items = parsed && Array.isArray(parsed.items) ? parsed.items : null
    if (items && items.length > 0) {
      groqItems = items
      resumenGroq = parsed.resumen || ''
    }
  } catch (err) {
    console.warn('[GROQ] analyzeObservation — full analysis failed, falling back:', err.message)
  }

  // ── Tier 1 fallback: pre-parser JS si Groq falló ─────────────────────────
  if (!groqItems.length) {
    return _legacyAnalyzeObservation(text, context, presentes)
  }

  // ── Tier 2: Guardas JS ───────────────────────────────────────────────────
  const validated = applyGuardas(groqItems, presentes)

  // ── Expand section references to individual students ─────────────────────
  // Items with seccion (e.g. 'maderas', 'cuerdas') and empty alumnos get
  // populated from the section-instrument mapping. Items with
  // es_colectivo=true or seccion='individual' are left untouched.
  const expanded = expandSeccionItems(validated, presentes)

  // ── Expand collective items to ALL present students ───────────────────────
  // Items with es_colectivo=true get alumnos populated with every present student.
  const withColectivos = expandColectivos(expanded, presentes)

  // ── Post-process: armar progreso final ────────────────────────────────────
  const progreso = withColectivos.map((item) => {
    const tipo = inferTipo(
      (item.contenido || '') + ' ' + (item.observacion || ''),
      context.tipoClase,
    )

    return {
      alumnos: item.alumnos,
      contenido: item.contenido,
      tipo,
      estado: item.estado,
      nota: item.nota,
      tarea: item.tarea,
      observacion: item.observacion,
      es_colectivo: item.es_colectivo,
      seccion: item.seccion,
      explicacion_objetiva: item.explicacion_objetiva,
      // Alertas: las detecta el pre-parser JS si usamos fallback; con Groq directo no aplica
      alerta: false,
      alertaTipo: null,
      alertDetails: null,
    }
  })

  const dsl = _buildDSL(progreso, presentes)
  const resumen = resumenGroq || _buildResumen(progreso, context.instrumento)

  return { dsl, progreso, resumen }
}

/**
 * Fallback legacy: usa el pre-parser JS (segmentObservation) + Groq enrichment.
 * Se ejecuta cuando Groq no devuelve análisis completo.
 */
async function _legacyAnalyzeObservation(text, context, presentes) {
  const alumnos = context.alumnos || []

  const groups = segmentObservation(text, { ...context, alumnos, presentes })

  if (!groups.length) {
    return {
      dsl: '',
      progreso: [],
      resumen: 'Registro general de clase sin evaluaciones detectadas.',
    }
  }

  // Groq enrichment fallback (solo contenido + observacion)
  const payload = {
    instrumento: context.instrumento || 'música',
    tipoClase: context.tipoClase || 'instrumento',
    groups: groups.map((g, i) => ({
      id: `g_${i + 1}`,
      fragment: _legacyRemoveStudentNames(g.fragment, presentes),
      estado: g.estado?.value || g.estado,
      tipo: inferTipo(g.fragment, context.tipoClase),
      scope: g.scope || 'grupo',
    })),
  }

  let enriched = groups.map(() => ({ contenido: '', observacion: '' }))
  let raw

  // Reuse old ENRICH_GROUPS prompt inline (kept for backward compat)
  const ENRICH_FALLBACK = `Eres un asistente pedagógico musical.
Recibes grupos de progreso ya detectados de un texto de observación musical.
Tu tarea es completar únicamente "contenido" (etiqueta breve, máx 50 chars) y "observacion" (resumen, máx 80 chars).
Responde JSON: {"items":[{"id":"g_1","contenido":"...","observacion":"..."}]}
Sin markdown, sin explicaciones.`

  try {
    raw = await proxyChat(
      [
        { role: 'system', content: ENRICH_FALLBACK },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      0.1,
    )
    const parsed = parseGroqJSON(raw)
    const items =
      parsed && Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : null
    if (items && items.length === groups.length) {
      enriched = items
    } else if (items) {
      enriched = groups.map((_, i) => {
        const found = items.find((item) => item.id === `g_${i + 1}`) || items[i]
        return found || { contenido: '', observacion: '' }
      })
    }
  } catch (err) {
    console.warn('[GROQ] Legacy enrich failed:', err.message)
  }

  const progreso = groups.map((g, i) => {
    const e = enriched[i] || {}
    const contenido = (e.contenido || '').trim() || _extractFallbackContent(g.fragment)
    const tipo = inferTipo(contenido + ' ' + g.fragment, context.tipoClase)

    return {
      alumnos: g.alumnos.map((a) => a.nombre || a.nombre_completo || a.nombreCorto),
      contenido,
      tipo,
      estado: g.estado?.value || g.estado,
      nota: g.nota,
      tarea: g.tarea,
      observacion: (e.observacion || '').trim() || null,
      es_colectivo: g.esColectivo,
      alerta: g.alerta || false,
      alertaTipo: g.alertDetails?.type || null,
      alertDetails: g.alertDetails,
      scope: g.scope || 'grupo',
      excludeIds: g.excludeIds || [],
      requires_confirmation: g.requires_confirmation || false,
    }
  })

  const dsl = _buildDSL(progreso, presentes)
  const resumen = _buildResumen(progreso, context.instrumento)

  return { dsl, progreso, resumen }
}

/** Sanitizes raw fragments by removing real student names. */
function _legacyRemoveStudentNames(fragment, presentes) {
  let clean = fragment
  for (const a of presentes) {
    const full = (a.nombre || a.nombre_completo || '').toLowerCase().trim()
    const short = (a.nombreCorto || a.nombre_corto || a.nombre || a.nombre_completo || '')
      .toLowerCase()
      .trim()

    const cleanReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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
  return clean
    .replace(/\s+/g, ' ')
    .replace(/^\s*[,.;]\s*/, '')
    .trim()
}

/** Extracts a short content label from raw fragment text as last-resort fallback. */
function _extractFallbackContent(fragment) {
  // Remove student names, state words, notes — keep the content noun phrase
  return (
    fragment
      .replace(/\d\/5/g, '')
      .replace(/\{[^}]*\}/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\b(todos|todo|grupo|clase|el|la|los|las|un|una)\b/gi, '')
      .trim()
      .slice(0, 50) || 'Clase'
  )
}

/** Builds a DSL string from structured progreso records. */
function _buildDSL(progreso, presentes) {
  return progreso
    .map((rec) => {
      const names = rec.es_colectivo
        ? '#Todos'
        : rec.alumnos?.length
          ? rec.alumnos.map((n) => `#${n.replace(/\s+/g, '_')}`).join(', ')
          : '#General'
      const estado = `!${rec.estado}`
      const nota = rec.nota ? ` ${rec.nota}/5` : ''
      const tarea = rec.tarea ? ` {${rec.tarea}}` : ''
      const obs = rec.observacion ? ` (${rec.observacion})` : ''
      return `${names} [${rec.contenido}] ${estado}${nota}${obs}${tarea}`
    })
    .join(' · ')
}

/** Builds a one-sentence summary from structured records. */
function _buildResumen(progreso, instrumento) {
  if (!progreso.length) return 'Registro de clase sin evaluaciones detectadas.'
  const tipos = [...new Set(progreso.map((r) => r.tipo))].join(', ')
  const estados = progreso.map((r) => r.estado)
  const dominante = estados.sort(
    (a, b) => estados.filter((x) => x === b).length - estados.filter((x) => x === a).length,
  )[0]
  const estadoLabel =
    {
      LOGRADO: 'con logros consolidados',
      EN_PROGRESO: 'en progreso',
      INICIADO: 'iniciando contenidos',
    }[dominante] || 'evaluada'
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
      0.2,
    )

    // Strip markdown code blocks — Groq sometimes wraps response in ```json
    const cleaned = raw
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()
    console.debug('[GROQ] proposeCurriculum cleaned:', cleaned)
    const parsed = JSON.parse(cleaned)

    return {
      pilares: Array.isArray(parsed.pilares) ? parsed.pilares : [],
      resumen: parsed.resumen || '',
    }
  } catch (err) {
    console.error(
      '[GROQ] Error en proposeCurriculum:',
      err,
      '| raw:',
      typeof raw !== 'undefined' ? raw : '(no response)',
    )
    throw new Error(
      'No se pudo generar la propuesta curricular. Verifica la conexión con el servicio de IA.',
    )
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
  const sesionesResumen = sesiones
    .map((s) => {
      const att = s.asistencia || []
      const P = att.filter((a) => a.estado === 'P').length
      const A = att.filter((a) => a.estado === 'A').length
      const J = att.filter((a) => a.estado === 'J').length
      return `Sesión ${s.numero_sesion} (${s.fecha}): ${P} presentes, ${A} ausentes, ${J} justificados`
    })
    .join('\n')

  const progresosResumen = progresos
    .map(
      (p) =>
        `${p.alumnos?.nombre_completo ?? 'Alumno'} — ${p.curriculo_objetivos?.descripcion ?? p.contenido_dsl ?? ''}: ${p.tipo}`,
    )
    .join('\n')

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
      notaDireccion: '',
    }
  }
}
