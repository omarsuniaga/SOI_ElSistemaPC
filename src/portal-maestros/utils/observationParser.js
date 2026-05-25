/**
 * observationParser.js
 *
 * Pure-JS pre-processor for teacher observation text.
 * Extracts structure (who, state, note, task) WITHOUT calling any AI.
 * Groq is only called afterward to enrich content descriptions and observations.
 */

// ─── State keyword tables ────────────────────────────────────────────────────

const STATE_KEYWORDS = {
  LOGRADO: [
    'logr', 'alcanc', 'domin', 'ya sab', 'lo hicieron bien', 'excelente',
    'muy bien', 'perfecto', 'lo tiene', 'salió bien', 'lo logr',
    'completó', 'terminó', 'superó', 'dominan',
  ],
  INICIADO: [
    'empez', 'conocier', 'introduj', 'primera vez', 'vieron', 'presentamos',
    'presenté', 'nuevo', 'comenzar', 'comenzó', 'inicio',
  ],
  EN_PROGRESO: [
    'avanzando', 'mejorando', 'progresando', 'casi', 'van bien',
    'muestran', 'falta', 'necesita', 'le cuesta', 'les cuesta',
    'dificultad', 'trabaj', 'practicamos', 'practicaron', 'repasamos',
    'repasar', 'continuar', 'seguir', 'sigue', 'siguen',
  ],
}

/**
 * Detects the most likely state from a text fragment.
 * Returns 'EN_PROGRESO' as conservative default.
 * @param {string} text
 * @returns {'LOGRADO'|'EN_PROGRESO'|'INICIADO'}
 */
export function detectState(text) {
  const lower = text.toLowerCase()
  // LOGRADO takes priority over EN_PROGRESO if both match
  for (const [state, keywords] of Object.entries(STATE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return state
  }
  return 'EN_PROGRESO'
}

// ─── Note detection ──────────────────────────────────────────────────────────

/**
 * Extracts a numeric note from text (format: "4/5", "3.5/5", "nota: 4").
 * @param {string} text
 * @returns {number|null}
 */
export function detectNote(text) {
  // Match "4/5", "3.5/5", "4 / 5"
  const m = text.match(/(\d(?:[.,]\d)?)\s*\/\s*5/)
  if (m) return parseFloat(m[1].replace(',', '.'))
  // Match "nota: 4" or "nota 4"
  const m2 = text.match(/nota[:\s]+(\d(?:[.,]\d)?)/i)
  if (m2) return parseFloat(m2[1].replace(',', '.'))
  return null
}

// ─── Task detection ──────────────────────────────────────────────────────────

/**
 * Extracts explicit task from DSL {tarea} syntax or implicit "para la próxima" phrasing.
 * @param {string} text
 * @returns {string|null}
 */
export function detectTask(text) {
  // DSL: {tarea explícita}
  const dsl = text.match(/\{([^}]+)\}/)
  if (dsl) return dsl[1].trim()
  // Natural: "para la próxima...", "tarea: ...", "practicar en casa..."
  const natural = text.match(/(?:tarea[:\s]+|para la pr[oó]xima[,:\s]+|practicar en casa[,:\s]+)([^.!?\n]{5,80})/i)
  if (natural) return natural[1].trim()
  return null
}

// ─── Alert detection ─────────────────────────────────────────────────────────

const ALERT_BEHAVIOR_KEYWORDS = [
  'mal comportamiento', 'mala conducta', 'conducta disruptiva', 'comportamiento negativo',
  'falta de respeto', 'irrespetuoso', 'irrespetuosa', 'agresivo', 'agresiva',
  'pelea', 'peleó', 'golpeó', 'insulto', 'insultó',
  'no atiende', 'no presta atención', 'distrae', 'distraer', 'molesta', 'molestó',
  'indisciplina', 'indisciplinado', 'indisciplinada',
  'actitud negativa', 'actitud problema', 'mala actitud',
  'lloró', 'llanto', 'berrinche',
  'no quiso', 'se negó', 'se niego',
  'ausentismo', 'llegó tarde', 'llegó muy tarde', 'inasistencia injustificada',
]

/**
 * Detects if a text fragment describes a negative behavioral/disciplinary situation.
 * These records should be visually flagged as alerts for teacher attention.
 * @param {string} text
 * @param {string} tipo - already-inferred tipo
 * @returns {boolean}
 */
export function detectAlert(text, tipo) {
  const lower = text.toLowerCase()
  // Direct tipo match
  if (tipo === 'comportamiento' || tipo === 'conducta') return true
  // Keyword scan
  return ALERT_BEHAVIOR_KEYWORDS.some(kw => lower.includes(kw))
}

// ─── Tipo inference ──────────────────────────────────────────────────────────

const TIPO_KEYWORDS = {
  tecnica:        ['escala', 'posición', 'posicion', 'arco', 'digitación', 'digitacion',
                   'embocadura', 'afinación', 'afinacion', 'técnica', 'tecnica', 'vibrato',
                   'pizzicato', 'staccato', 'legato', 'golpe de arco', 'detaché'],
  repertorio:     ['obra', 'pieza', 'danzón', 'danzon', 'minueto', 'sonata', 'concierto',
                   'sinfonía', 'sinfonia', 'compases', 'c\\.\\d', 'repertorio', 'canción',
                   'cancion', 'melodía', 'melodia'],
  teoria:         ['ritmo', 'compás', 'compas', 'armonía', 'armonia', 'lectura', 'solfeo',
                   'teoría', 'teoria', 'nota', 'clave', 'intervalo', 'acorde'],
  interpretacion: ['expresión', 'expresion', 'fraseo', 'dinámica', 'dinamica', 'tempo',
                   'articulación', 'articulacion', 'musicalidad', 'carácter', 'caracter'],
}

/**
 * Infers the tipo from content text.
 * @param {string} text
 * @param {'instrumento'|'ensayo_general'|'teoria'} tipoClase
 * @returns {string}
 */
export function inferTipo(text, tipoClase = 'instrumento') {
  if (tipoClase === 'teoria') return 'teoria'
  const lower = text.toLowerCase()
  for (const [tipo, keywords] of Object.entries(TIPO_KEYWORDS)) {
    if (keywords.some(kw => new RegExp(kw).test(lower))) return tipo
  }
  return tipoClase === 'ensayo_general' ? 'repertorio' : 'tecnica'
}

// ─── Student name matching ────────────────────────────────────────────────────

/**
 * Builds a fast lookup map: any name variant → alumno object.
 * Indexes: nombreCorto, first name, full name (all lowercase).
 * @param {Array<{id, nombre, nombreCorto}>} roster
 * @returns {Map<string, object>}
 */
export function buildRosterLookup(roster) {
  const map = new Map()

  // First pass: index full name + nombreCorto (always safe — these are unique by design)
  for (const a of roster) {
    const full  = (a.nombre || '').toLowerCase().trim()
    const short = (a.nombreCorto || a.nombre || '').toLowerCase().trim()
    if (full)  map.set(full,  a)
    if (short && short !== full) map.set(short, a)
  }

  // Second pass: index first name ONLY if it doesn't collide with another student
  const firstNames = roster.map(a => (a.nombre || '').toLowerCase().trim().split(' ')[0])
  for (const a of roster) {
    const first = (a.nombre || '').toLowerCase().trim().split(' ')[0]
    if (!first) continue
    const isDuplicate = firstNames.filter(f => f === first).length > 1
    if (!isDuplicate && !map.has(first)) map.set(first, a)
  }

  return map
}

/**
 * Finds all alumni mentioned in a text fragment.
 * Returns array of alumno objects from roster.
 * @param {string} text
 * @param {Map} lookup - from buildRosterLookup()
 * @param {Array} presentes - presentes array (for "todos")
 * @param {Array} alumnos - full roster (fallback for "todos")
 * @returns {Array<object>} matched alumno objects
 */
export function findMentionedStudents(text, lookup, presentes, alumnos) {
  const lower = text.toLowerCase()
  const roster = presentes?.length ? presentes : alumnos

  // "todos" / "todo el grupo" / "la clase" → all present
  if (/\btodos\b|\btodo el grupo\b|\btoda la clase\b|\bel grupo\b/.test(lower)) {
    return roster
  }

  const found = []
  const seen = new Set()

  // Try matching every known name variant against the text
  for (const [key, alumno] of lookup.entries()) {
    if (seen.has(alumno.id || alumno.nombre)) continue
    // Use word-boundary-like check: name must be preceded/followed by non-alpha
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`(?<![a-záéíóúñ])${escaped}(?![a-záéíóúñ])`, 'i').test(text)) {
      found.push(alumno)
      seen.add(alumno.id || alumno.nombre)
    }
  }

  return found
}

// ─── Group segmentation ───────────────────────────────────────────────────────

/**
 * Pre-parse result structure
 * @typedef {Object} ParsedGroup
 * @property {Array<object>} alumnos   - matched alumno objects (or [] if unresolved)
 * @property {string[]}     alumnoTags - compact tags for Groq ("Todos", short name)
 * @property {string}       fragment   - raw text fragment for this group
 * @property {string}       estado     - LOGRADO | EN_PROGRESO | INICIADO
 * @property {number|null}  nota
 * @property {string|null}  tarea
 * @property {boolean}      esColectivo
 * @property {string}       tipoClase
 */

/**
 * Segments a teacher observation into named groups.
 *
 * Strategy: split on sentence boundaries, then detect which alumno(s)
 * each sentence refers to. Merge consecutive sentences about the same group.
 *
 * @param {string} text
 * @param {object} context
 * @param {Array}  context.alumnos
 * @param {Array}  context.presentes
 * @param {string} context.tipoClase
 * @returns {ParsedGroup[]}
 */
export function segmentObservation(text, context = {}) {
  const { alumnos = [], tipoClase = 'instrumento' } = context
  const presentes = context.presentes?.length ? context.presentes : alumnos
  const lookup = buildRosterLookup(presentes)

  // Split into sentences
  const sentences = text
    .replace(/([.!?;])\s+/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  if (!sentences.length) return []

  /** @type {ParsedGroup[]} */
  const groups = []

  for (const sentence of sentences) {
    const mentioned = findMentionedStudents(sentence, lookup, presentes, alumnos)
    const isColectivo = mentioned.length > 1 || /\btodos\b|\bgrupo\b/.test(sentence.toLowerCase())

    const alumnoTags = isColectivo
      ? ['Todos']
      : mentioned.map(a => a.nombreCorto || a.nombre)

    const tipo = inferTipo(sentence, tipoClase)
    groups.push({
      alumnos:    mentioned,
      alumnoTags,
      fragment:   sentence,
      estado:     detectState(sentence),
      nota:       detectNote(sentence),
      tarea:      detectTask(sentence),
      esColectivo: isColectivo,
      alerta:      detectAlert(sentence, tipo),
      tipoClase,
    })
  }

  // Merge consecutive groups with same students + same state (common pattern: 2-sentence descriptions)
  return _mergeAdjacentGroups(groups)
}

function _mergeAdjacentGroups(groups) {
  if (groups.length <= 1) return groups
  const merged = [groups[0]]
  for (let i = 1; i < groups.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = groups[i]
    const sameStudents = _sameSet(
      prev.alumnos.map(a => a.id || a.nombre),
      curr.alumnos.map(a => a.id || a.nombre)
    )
    if (sameStudents && prev.estado === curr.estado) {
      // Merge fragment, keep first note/tarea unless current has one
      prev.fragment += ' ' + curr.fragment
      prev.nota  = prev.nota  ?? curr.nota
      prev.tarea = prev.tarea ?? curr.tarea
    } else {
      merged.push(curr)
    }
  }
  return merged
}

function _sameSet(a, b) {
  if (a.length !== b.length) return false
  const setA = new Set(a)
  return b.every(x => setA.has(x))
}
