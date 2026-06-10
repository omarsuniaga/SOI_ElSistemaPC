/**
 * Supabase Edge Function: extract-knowledge
 *
 * Pipeline de extracción de conocimiento desde observaciones de clase.
 * Triggered after a teacher saves an observation (es_borrador=false).
 *
 * Flow:
 *   1. Read observation + session context from DB
 *   2. DSL pre-fill: parse deterministic tokens → assertions (confianza=1.0)
 *   3. Load curricular context (indicators for the level)
 *   4. LLM enrichment: call Groq for inferred assertions
 *   5. Persist: upsert perfil_conocimiento + track madurez in historial
 *   6. Return result summary to frontend
 *
 * Auth: requires valid Supabase JWT (any authenticated user).
 * DB writes use service_role to bypass RLS.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? ''
const GROQ_BASE = 'https://api.groq.com/openai/v1'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Helpers ────────────────────────────────────────────────────────────

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status = 400) {
  return json({ error: message }, status)
}

// ── DSL token extraction (ported from shared/utils/dslParser.js) ───────

/** Extract #Alumno tokens */
function extractAlumnos(text: string): string[] {
  if (!text) return []
  const regex = /#([A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*)/g
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) results.push(m[1].trim())
  }
  return results
}

/** Extract >CODIGO objective tokens */
function extractObjetivos(text: string): string[] {
  if (!text) return []
  const regex = />([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) results.push(m[1].trim())
  }
  return results
}

/** Extract [contenido] tokens */
function extractContenido(text: string): string[] {
  if (!text) return []
  const regex = /\[([^\]]+)\]/g
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) results.push(m[1].trim())
  }
  return results
}

/** Extract N/M score */
function extractCalificacion(text: string): { valor: number; sobre: number } | null {
  if (!text) return null
  const m = text.match(/(\d)\/(\d)/)
  if (!m) return null
  const valor = parseInt(m[1], 10)
  const sobre = parseInt(m[2], 10)
  if (valor < 0 || valor > 5) return null
  if (sobre !== 5) return null
  return { valor, sobre }
}

/** Extract $medida tokens */
function extractMedidas(text: string): string[] {
  if (!text) return []
  const regex = /\$([^\s$]+)/g
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    if (m[1]) results.push(m[1].trim())
  }
  return results
}

// ── Pre-fill: generate deterministic assertions from DSL tokens ────────

interface PrefillAssertion {
  alumno_id: string
  dimension: string
  item: string
  indicator_id: string | null
  madurez: string
  confianza: number
  estado: string
  evidencia_texto: string | null
  creado_por: string
}

function generatePrefillAssertions(
  text: string,
  alumnoMap: Record<string, string>,
  indicatorMap: Record<string, string>,
): PrefillAssertion[] {
  const assertions: PrefillAssertion[] = []
  const seen = new Set<string>()
  const alumnos = extractAlumnos(text)
  const objetivos = extractObjetivos(text)
  const contenidos = extractContenido(text)

  function add(
    alumnoId: string,
    dimension: string,
    item: string,
    indicatorId: string | null,
    evidencia: string | null,
  ) {
    const key = `${alumnoId}|${dimension}|${item}`
    if (seen.has(key)) return
    seen.add(key)
    assertions.push({
      alumno_id: alumnoId,
      dimension,
      item,
      indicator_id: indicatorId,
      madurez: 'introducido',
      confianza: 1.0,
      estado: 'confirmado',
      evidencia_texto: evidencia,
      creado_por: 'dsl',
    })
  }

  for (const alumnoNombre of alumnos) {
    const alumnoId = alumnoMap[alumnoNombre]
    if (!alumnoId) continue

    for (const objCode of objetivos) {
      const indicatorId = indicatorMap[objCode] || null
      add(alumnoId, 'objetivo', `>${objCode}`, indicatorId, `>${objCode}`)
    }

    for (const content of contenidos) {
      add(alumnoId, 'escala', content, null, `[${content}]`)
    }
  }

  return assertions
}

// ── Curricular context loading ─────────────────────────────────────────

interface IndicatorRecord {
  id: string
  node_id: string
  description: string
  codigo: string | null
}

async function loadCurricularContext(
  supabase: ReturnType<typeof createClient>,
  sesionId: string,
): Promise<{ nodeIds: string[]; indicators: IndicatorRecord[] }> {
  // 1. Get sesion → clase → nivel
  const { data: sesion, error: sesionErr } = await supabase
    .from('sesiones_clase')
    .select('clase_id')
    .eq('id', sesionId)
    .single()

  if (sesionErr || !sesion) {
    console.warn('[extract-knowledge] Sesion not found, skipping curricular context')
    return { nodeIds: [], indicators: [] }
  }

  // 2. Get clase → programa_id + instrumento (via nivel)
  const { data: clase, error: claseErr } = await supabase
    .from('clases')
    .select('id, programa_id, instrumento, nivel_id')
    .eq('id', sesion.clase_id)
    .single()

  if (claseErr || !clase) {
    console.warn('[extract-knowledge] Clase not found, skipping curricular context')
    return { nodeIds: [], indicators: [] }
  }

  // 3. Find published route + version for this instrument
  const { data: routes } = await supabase
    .from('routes')
    .select('id')
    .eq('instrument', clase.instrumento || 'violín')
    .eq('status', 'published')
    .limit(1)

  if (!routes || routes.length === 0) {
    console.warn(
      '[extract-knowledge] No published route for instrument, skipping curricular context',
    )
    return { nodeIds: [], indicators: [] }
  }

  const { data: routeVersions } = await supabase
    .from('route_versions')
    .select('id')
    .eq('route_id', routes[0].id)
    .eq('status', 'published')
    .limit(1)

  if (!routeVersions || routeVersions.length === 0) {
    console.warn('[extract-knowledge] No published route version found')
    return { nodeIds: [], indicators: [] }
  }

  const rvId = routeVersions[0].id

  // 4. If nivel_id exists, try to find matching level_number
  //    Map niveles.orden → route levels by order_index
  let levelNumbers: number[] = []

  if (clase.nivel_id) {
    const { data: nivel } = await supabase
      .from('niveles')
      .select('orden')
      .eq('id', clase.nivel_id)
      .single()

    if (nivel) {
      levelNumbers = [nivel.orden]
    }
  }

  // If no nivel mapping, load first 3 levels as default context
  if (levelNumbers.length === 0) {
    const { data: defaultLevels } = await supabase
      .from('levels')
      .select('level_number')
      .eq('route_version_id', rvId)
      .order('level_number', { ascending: true })
      .limit(3)

    if (defaultLevels) {
      levelNumbers = defaultLevels.map((l) => l.level_number)
    }
  }

  if (levelNumbers.length === 0) return { nodeIds: [], indicators: [] }

  // 5. Get nodes for those levels
  const { data: levels } = await supabase
    .from('levels')
    .select('id')
    .eq('route_version_id', rvId)
    .in('level_number', levelNumbers)

  if (!levels || levels.length === 0) return { nodeIds: [], indicators: [] }

  const levelIds = levels.map((l) => l.id)

  const { data: nodes } = await supabase.from('nodes').select('id').in('level_id', levelIds)

  if (!nodes || nodes.length === 0) return { nodeIds: [], indicators: [] }

  const nodeIds = nodes.map((n) => n.id)

  // 6. Load indicators for those nodes
  const { data: indicators } = await supabase
    .from('indicators')
    .select('id, node_id, description, nombre')
    .in('node_id', nodeIds)
    .eq('activo', true)
    .order('order_index', { ascending: true })

  return {
    nodeIds,
    indicators: (indicators || []).map((i) => ({
      id: i.id,
      node_id: i.node_id,
      description: i.description,
      codigo: (i as Record<string, unknown>).nombre as string | null,
    })),
  }
}

// ── Groq LLM call ─────────────────────────────────────────────────────

interface LlmAssertion {
  alumno: string // alumno name (must match DSL #token)
  dimension: string // objetivo | escala | repertorio | tecnica | problema
  item: string // short description
  indicator_id?: string // optional: matching indicator UUID
  madurez: string // introducido | en_progreso | dominado
  confianza: number // 0.00 – 1.00
  evidencia: string // excerpt from observation text
}

async function callGroqForExtraction(
  contenidoRaw: string,
  alumnoNames: string[],
  indicators: IndicatorRecord[],
): Promise<LlmAssertion[]> {
  if (!GROQ_API_KEY) {
    console.warn('[extract-knowledge] GROQ_API_KEY not configured, skipping LLM enrichment')
    return []
  }

  const indicatorsBlock =
    indicators.length > 0
      ? indicators.map((i) => `  - ${i.codigo || i.id.slice(0, 8)}: ${i.description}`).join('\n')
      : '  (no specific indicators loaded for context)'

  const systemPrompt = `Eres un asistente experto en pedagogía musical. Extrae aserciones de conocimiento estructuradas desde observaciones de clase escritas por maestros de música.

Interpreta el texto del maestro y extrae conocimiento explícito E implícito sobre cada alumno.

Reglas:
- SOLO incluye alumnos que aparezcan mencionados en la observación (con #Nombre o inferible por contexto)
- Para cada alumno, identifica: qué está trabajando (item), en qué dimensión (objetivo/escala/repertorio/tecnica/problema), y su nivel de madurez
- Si el texto menciona dificultades o problemas, dimensión = 'problema'
- Si menciona una obra o pieza, dimensión = 'repertorio'
- Si menciona una técnica (arco, mano izquierda, etc.), dimensión = 'tecnica'
- confianza: 0.00–1.00. Sé conservador: 0.95+ si está explícito, 0.7–0.85 si es inferido
- madurez: 'introducido' (recién comienza), 'en_progreso' (avanzando), 'dominado' (lo hace bien)
- Si un indicador del contexto curricular coincide, incluye su id como indicator_id

Responde SOLO con un array JSON válido. Nada más antes ni después.
Si no hay aserciones para extraer, responde [].`

  const userPrompt = `## Observación del maestro
${contenidoRaw}

## Alumnos en la sesión
${alumnoNames.map((n) => `- ${n}`).join('\n')}

## Indicadores curriculares relevantes
${indicatorsBlock}

Extrae las aserciones de conocimiento como JSON array.`

  try {
    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('[extract-knowledge] Groq API error:', response.status, errBody)
      return []
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return []

    // Try to parse the response — may be wrapped in ```json ... ``` or be raw JSON
    let cleaned = content.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleaned)

    // Handle both { assertions: [...] } and raw [...]
    const assertions: LlmAssertion[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.assertions)
        ? parsed.assertions
        : []

    return assertions
  } catch (err) {
    console.error('[extract-knowledge] Groq call failed:', err)
    return []
  }
}

// ── Persistence ────────────────────────────────────────────────────────

interface PersistResult {
  inserted: number
  updated: number
  historial: number
}

async function persistAssertions(
  supabase: ReturnType<typeof createClient>,
  assertions: PrefillAssertion[],
  observacionId: string,
): Promise<PersistResult> {
  let inserted = 0
  let updated = 0
  let historial = 0

  for (const a of assertions) {
    // Check existing assertion for madurez tracking
    const { data: existing } = await supabase
      .from('perfil_conocimiento')
      .select('id, madurez')
      .eq('alumno_id', a.alumno_id)
      .eq('dimension', a.dimension)
      .eq('item', a.item)
      .maybeSingle()

    if (existing) {
      // Update existing
      const { error: updErr } = await supabase
        .from('perfil_conocimiento')
        .update({
          confianza: a.confianza,
          estado: a.estado,
          madurez: a.madurez,
          indicator_id: a.indicator_id,
          evidencia_texto: a.evidencia_texto,
          origen_obs_id: observacionId,
        })
        .eq('id', existing.id)

      if (updErr) {
        console.error(`[extract-knowledge] Update error for ${existing.id}:`, updErr.message)
        continue
      }
      updated++

      // Track madurez change
      if (existing.madurez !== a.madurez) {
        const { error: histErr } = await supabase.from('perfil_conocimiento_historial').insert({
          perfil_id: existing.id,
          madurez_old: existing.madurez,
          madurez_new: a.madurez,
          origen_obs_id: observacionId,
        })

        if (!histErr) historial++
      }
    } else {
      // Insert new
      const { error: insErr } = await supabase.from('perfil_conocimiento').insert({
        alumno_id: a.alumno_id,
        dimension: a.dimension,
        item: a.item,
        indicator_id: a.indicator_id,
        madurez: a.madurez,
        confianza: a.confianza,
        estado: a.estado,
        origen_obs_id: observacionId,
        evidencia_texto: a.evidencia_texto,
        creado_por: a.creado_por,
      })

      if (insErr) {
        console.error(`[extract-knowledge] Insert error:`, insErr.message)
        continue
      }
      inserted++

      // First-time creation: track in historial with madurez_old=NULL
      // We need the perfil_id. Read it back after insert.
      const { data: fresh } = await supabase
        .from('perfil_conocimiento')
        .select('id')
        .eq('alumno_id', a.alumno_id)
        .eq('dimension', a.dimension)
        .eq('item', a.item)
        .maybeSingle()

      if (fresh) {
        const { error: histErr } = await supabase.from('perfil_conocimiento_historial').insert({
          perfil_id: fresh.id,
          madurez_old: null,
          madurez_new: a.madurez,
          origen_obs_id: observacionId,
        })

        if (!histErr) historial++
      }
    }
  }

  return { inserted, updated, historial }
}

// ── Auth verification ─────────────────────────────────────────────────

async function verifyAuth(
  req: Request,
  supabaseAnon: ReturnType<typeof createClient>,
): Promise<boolean> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false

  const { error } = await supabaseAnon.auth.getUser()
  return !error
}

// ── Main handler ───────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  // Parse body
  let body: { observacion_id?: string; node_ids?: string[] }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid JSON body')
  }

  const { observacion_id, node_ids } = body
  if (!observacion_id) {
    return errorResponse('observacion_id is required')
  }

  // Init clients
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: req.headers.get('Authorization') ?? '' },
    },
  })

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Verify auth
  const authed = await verifyAuth(req, supabaseAnon)
  if (!authed) {
    return errorResponse('Unauthorized', 401)
  }

  try {
    // ── Step 1: Read observation ────────────────────────────────────
    const { data: observacion, error: obsErr } = await supabase
      .from('observaciones_sesion')
      .select('id, sesion_id, maestro_id, contenido_raw, es_borrador')
      .eq('id', observacion_id)
      .single()

    if (obsErr || !observacion) {
      return errorResponse('Observacion not found', 404)
    }

    if (observacion.es_borrador) {
      return errorResponse('Cannot extract from draft observation', 400)
    }

    const contenidoRaw = observacion.contenido_raw || ''

    // ── Step 2: DSL pre-fill ────────────────────────────────────────
    const alumnoNames = extractAlumnos(contenidoRaw)
    console.log(`[extract-knowledge] Found ${alumnoNames.length} alumno(s) in DSL:`, alumnoNames)

    // Resolve alumno names → IDs
    let alumnoMap: Record<string, string> = {}
    if (alumnoNames.length > 0) {
      const { data: alumnos } = await supabase
        .from('alumnos')
        .select('id, nombre_completo')
        .in('nombre_completo', alumnoNames)

      if (alumnos) {
        for (const a of alumnos) {
          alumnoMap[a.nombre_completo] = a.id
        }
        console.log(
          `[extract-knowledge] Resolved ${Object.keys(alumnoMap).length}/${alumnoNames.length} alumno(s)`,
        )
      }
    }

    // Resolve objective codes → indicator IDs
    const objetivoCodes = extractObjetivos(contenidoRaw)
    let indicatorMap: Record<string, string> = {}
    if (objetivoCodes.length > 0) {
      const { data: indicators } = await supabase
        .from('indicators')
        .select('id, nombre')
        .in('nombre', objetivoCodes)

      if (indicators) {
        for (const i of indicators) {
          if (i.nombre) indicatorMap[i.nombre] = i.id
        }
      }
    }

    const prefillAssertions = generatePrefillAssertions(contenidoRaw, alumnoMap, indicatorMap)
    console.log(`[extract-knowledge] DSL pre-fill: ${prefillAssertions.length} assertion(s)`)

    // ── Step 3: Load curricular context ─────────────────────────────
    let indicators: IndicatorRecord[] = []
    if (node_ids && node_ids.length > 0) {
      // Explicit node_ids from frontend
      const { data: inds } = await supabase
        .from('indicators')
        .select('id, node_id, description, nombre')
        .in('node_id', node_ids)
        .eq('activo', true)

      indicators = (inds || []).map((i) => ({
        id: i.id,
        node_id: i.node_id,
        description: i.description,
        codigo: (i as Record<string, unknown>).nombre as string | null,
      }))
    } else {
      // Auto-detect from session context
      const ctx = await loadCurricularContext(supabase, observacion.sesion_id)
      indicators = ctx.indicators
    }

    console.log(`[extract-knowledge] Curricular context: ${indicators.length} indicator(s)`)

    // ── Step 4: LLM enrichment ──────────────────────────────────────
    // Only call LLM if we have alumnos to extract for
    let llmAssertions: LlmAssertion[] = []
    if (Object.keys(alumnoMap).length > 0) {
      llmAssertions = await callGroqForExtraction(contenidoRaw, Object.keys(alumnoMap), indicators)
      console.log(`[extract-knowledge] LLM enrichment: ${llmAssertions.length} assertion(s)`)
    }

    // ── Step 5: Merge assertions ────────────────────────────────────
    // Pre-fill assertions already have correct alumno_ids and are deterministic
    // LLM assertions need alumino_id resolution and estado mapping
    const merged: PrefillAssertion[] = [...prefillAssertions]
    const mergedSeen = new Set(merged.map((a) => `${a.alumno_id}|${a.dimension}|${a.item}`))

    for (const llm of llmAssertions) {
      const alumnoId = alumnoMap[llm.alumno]
      if (!alumnoId) continue

      const key = `${alumnoId}|${llm.dimension}|${llm.item}`
      if (mergedSeen.has(key)) continue // pre-fill wins over LLM
      mergedSeen.add(key)

      merged.push({
        alumno_id: alumnoId,
        dimension: llm.dimension,
        item: llm.item,
        indicator_id: llm.indicator_id || null,
        madurez: ['introducido', 'en_progreso', 'dominado'].includes(llm.madurez)
          ? llm.madurez
          : 'introducido',
        confianza: Math.min(1, Math.max(0, llm.confianza)),
        estado: llm.confianza >= 0.85 ? 'confirmado' : 'propuesto',
        evidencia_texto: llm.evidencia || null,
        creado_por: 'ia',
      })
    }

    // ── Step 6: Persist ─────────────────────────────────────────────
    const persistResult = await persistAssertions(supabase, merged, observacion_id)

    // ── Step 7: Return ──────────────────────────────────────────────
    return json({
      status: 'success',
      observacion_id,
      summary: {
        prefill: prefillAssertions.length,
        llm_enrichment: llmAssertions.length,
        total_assertions: merged.length,
        inserted: persistResult.inserted,
        updated: persistResult.updated,
        historial_entries: persistResult.historial,
      },
      assertions: merged.map((a) => ({
        alumno_id: a.alumno_id,
        dimension: a.dimension,
        item: a.item,
        madurez: a.madurez,
        confianza: a.confianza,
        estado: a.estado,
        creado_por: a.creado_por,
      })),
    })
  } catch (err) {
    console.error('[extract-knowledge] Fatal error:', err)
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500)
  }
})
