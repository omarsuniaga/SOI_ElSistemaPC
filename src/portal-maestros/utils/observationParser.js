/**
 * observationParser.js
 *
 * Pure-JS pre-processor for teacher observation text.
 * Extracts structure (who, state, note, task) WITHOUT calling any AI.
 * Groq is only called afterward to enrich content descriptions and observations.
 */

// ─── Normalizer ──────────────────────────────────────────────────────────────

/**
 * Normalizes text: lowercase, removes accents/diacritics, cleans spacing.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s#]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── State keyword rules ─────────────────────────────────────────────────────

const STATE_RULES = [
  {
    estado: 'DIFICULTAD',
    peso: 4,
    keywords: [
      'no logro', 'no logra', 'no pudo', 'no puede', 'dificultad',
      'le cuesta', 'les cuesta', 'se le dificulta', 'se les dificulta',
      'confunde', 'confunden', 'sigue mostrando dificultad',
      'siguen mostrando dificultad', 'necesita reforzar', 'necesitan reforzar',
      'falta practica', 'falta mejorar', 'todavia no'
    ]
  },
  {
    estado: 'LOGRADO',
    peso: 3,
    keywords: [
      'logro', 'logra correctamente', 'domina', 'domino', 'dominan',
      'excelente', 'muy bien', 'supero', 'superaron', 'perfecto',
      'completo correctamente', 'completaron correctamente', 'ya sabe', 'ya saben'
    ]
  },
  {
    estado: 'INICIADO',
    peso: 2,
    keywords: [
      'inicio', 'comenzo', 'comenzaron', 'primera vez', 'se introdujo',
      'se introdujeron', 'nuevo contenido', 'empez', 'conocier', 'presentamos'
    ]
  },
  {
    estado: 'EN_PROGRESO',
    peso: 1,
    keywords: [
      'trabajo', 'trabajaron', 'practico', 'practicaron', 'repaso', 'repasaron',
      'continua', 'continuan', 'sigue', 'siguen', 'mejorando', 'avanzando',
      'progresando', 'van bien', 'casi'
    ]
  }
]

/**
 * Detects the most likely state from a text fragment using a weighted rule system.
 * Returns 'EN_PROGRESO' as conservative default.
 * @param {string} text
 * @returns {{value: 'LOGRADO'|'EN_PROGRESO'|'INICIADO'|'DIFICULTAD', confidence: number, evidence: string[]}}
 */
export function detectState(text) {
  const normalized = normalizeText(text)
  const matches = []

  for (const rule of STATE_RULES) {
    for (const kw of rule.keywords) {
      const normalizedKw = normalizeText(kw)
      if (normalized.includes(normalizedKw)) {
        matches.push({
          estado: rule.estado,
          peso: rule.peso,
          evidence: kw
        })
      }
    }
  }

  if (!matches.length) {
    return {
      value: 'EN_PROGRESO',
      confidence: 0.4,
      evidence: []
    }
  }

  // Sort by weight descending (highest weight wins)
  matches.sort((a, b) => b.peso - a.peso)

  return {
    value: matches[0].estado,
    confidence: Math.min(0.95, 0.55 + matches.length * 0.15),
    evidence: matches.map(m => m.evidence)
  }
}

// ─── Note detection ──────────────────────────────────────────────────────────

/**
 * Extracts a numeric note from text (format: "4/5", "3.5/5", "nota: 4").
 * @param {string} text
 * @returns {number|null}
 */
export function detectNote(text) {
  const m = text.match(/(\d(?:[.,]\d)?)\s*\/\s*5/)
  if (m) return parseFloat(m[1].replace(',', '.'))
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
  const dsl = text.match(/\{([^}]+)\}/)
  if (dsl) return dsl[1].trim()
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
 * @param {string} text
 * @param {string} tipo
 * @returns {boolean}
 */
export function detectAlert(text, tipo) {
  const lower = text.toLowerCase()
  if (tipo === 'comportamiento' || tipo === 'conducta') return true
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
 * Builds a lookup map: name variant → Array of candidate student objects.
 * Accrue duplicates for ambiguity resolution.
 * @param {Array<{id, nombre, nombreCorto}>} roster
 * @returns {Map<string, object[]>}
 */
export function buildRosterLookup(roster) {
  const map = new Map()

  function addToIndex(key, alumno) {
    if (!key) return
    const normalized = normalizeText(key)
    const list = map.get(normalized) || []
    if (!list.some(a => a.id === alumno.id)) {
      list.push(alumno)
    }
    map.set(normalized, list)
  }

  for (const a of roster) {
    const full = (a.nombre || a.nombre_completo || '').toLowerCase().trim()
    const short = (a.nombreCorto || a.nombre_corto || a.nombre || a.nombre_completo || '').toLowerCase().trim()
    if (full) addToIndex(full, a)
    if (short && short !== full) addToIndex(short, a)
  }

  // Index first name
  const firstNames = roster.map(a => (a.nombre || a.nombre_completo || '').toLowerCase().trim().split(' ')[0])
  for (const a of roster) {
    const first = (a.nombre || a.nombre_completo || '').toLowerCase().trim().split(' ')[0]
    if (!first) continue
    addToIndex(first, a)
  }

  return map
}

/**
 * Finds all students mentioned in a text fragment, tracking ambiguity.
 * @param {string} text
 * @param {Map} lookup
 * @param {Array} presentes
 * @param {Array} alumnos
 * @returns {{students: Array, ambiguous: boolean, requires_confirmation: boolean}}
 */
export function findMentionedStudents(text, lookup, presentes, alumnos) {
  const lower = text.toLowerCase()
  const roster = presentes?.length ? presentes : alumnos

  if (/\btodos\b|\btodo el grupo\b|\btoda la clase\b|\bel grupo\b/.test(lower)) {
    return {
      students: roster,
      ambiguous: false,
      requires_confirmation: false
    }
  }

  const foundMap = new Map()
  let ambiguous = false

  for (const [key, candidates] of lookup.entries()) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`(?<![a-záéíóúñ])${escaped}(?![a-záéíóúñ])`, 'i').test(text)) {
      if (candidates.length > 1) {
        ambiguous = true
      }
      candidates.forEach(alumno => {
        foundMap.set(alumno.id || alumno.nombre || alumno.nombre_completo, alumno)
      })
    }
  }

  const found = Array.from(foundMap.values())

  return {
    students: found,
    ambiguous,
    requires_confirmation: ambiguous
  }
}

// ─── Sentence Segmentation ───────────────────────────────────────────────────

/**
 * Splits text into sentences protecting musical and decimal abbreviations.
 * @param {string} text
 * @returns {string[]}
 */
export function segmentSentences(text) {
  const protectedText = text
    .replace(/Lec\./gi, 'Lec§')
    .replace(/c\./gi, 'c§')
    .replace(/n\.º/gi, 'n§º')
    .replace(/(\d)[.](\d)/g, '$1§$2')

  return protectedText
    .replace(/([.!?;])\s+/g, '$1\n')
    .split('\n')
    .map(s => s
      .replace(/Lec§/gi, 'Lec.')
      .replace(/c§/gi, 'c.')
      .replace(/n§º/gi, 'n.º')
      .replace(/(\d)§(\d)/g, '$1.$2')
      .trim()
    )
    .filter(Boolean)
}

// ─── Group segmentation ───────────────────────────────────────────────────────

/**
 * Segments a teacher observation into named groups.
 * @param {string} text
 * @param {object} context
 * @returns {ParsedGroup[]}
 */
export function segmentObservation(text, context = {}) {
  const { alumnos = [], tipoClase = 'instrumento' } = context
  const presentes = context.presentes?.length ? context.presentes : alumnos
  const lookup = buildRosterLookup(presentes)

  const sentences = segmentSentences(text)
  if (!sentences.length) return []

  const groups = []

  for (const sentence of sentences) {
    const { students: mentioned, ambiguous, requires_confirmation } = findMentionedStudents(sentence, lookup, presentes, alumnos)
    const isColectivo = mentioned.length > 1 || /\btodos\b|\bgrupo\b/.test(sentence.toLowerCase())

    const alumnoTags = isColectivo
      ? ['Todos']
      : mentioned.map(a => a.nombreCorto || a.nombre_corto || a.nombre || a.nombre_completo)

    const tipo = inferTipo(sentence, tipoClase)
    const stateObj = detectState(sentence)

    groups.push({
      alumnos:              mentioned,
      alumnoTags,
      fragment:             sentence,
      estado:               stateObj,
      nota:                 detectNote(sentence),
      tarea:                detectTask(sentence),
      esColectivo:          isColectivo,
      alerta:               detectAlert(sentence, tipo) || stateObj.value === 'DIFICULTAD',
      tipoClase,
      ambiguous,
      requires_confirmation
    })
  }

  return _mergeAdjacentGroups(groups)
}

function _mergeAdjacentGroups(groups) {
  if (groups.length <= 1) return groups
  const merged = [groups[0]]
  for (let i = 1; i < groups.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = groups[i]
    const sameStudents = _sameSet(
      prev.alumnos.map(a => a.id || a.nombre || a.nombre_completo),
      curr.alumnos.map(a => a.id || a.nombre || a.nombre_completo)
    )
    if (sameStudents && prev.estado.value === curr.estado.value) {
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

// ─── Contradiction detection ──────────────────────────────────────────────────

/**
 * Detects contradictory records.
 * @param {Array} progreso
 * @returns {Array<{idxA: number, idxB: number, reason: string}>}
 */
export function detectContradictions(progreso) {
  const conflicts = []

  for (let i = 0; i < progreso.length; i++) {
    for (let j = i + 1; j < progreso.length; j++) {
      const a = progreso[i]
      const b = progreso[j]

      if (!_sameAlumnoSet(a.alumnos, b.alumnos)) continue
      if (!_similarContent(a.contenido, b.contenido)) continue

      const notaConflict = a.nota != null && b.nota != null && Math.abs(a.nota - b.nota) > 1.5

      const stateConflict = a.estado !== b.estado &&
        ((a.estado === 'LOGRADO' && b.estado === 'INICIADO') ||
         (a.estado === 'INICIADO' && b.estado === 'LOGRADO'))

      if (notaConflict || stateConflict) {
        const reason = notaConflict
          ? `Notas contradictorias: ${a.nota}/5 vs ${b.nota}/5 para "${a.contenido}"`
          : `Estados contradictorios: ${a.estado} vs ${b.estado} para "${a.contenido}"`
        conflicts.push({ idxA: i, idxB: j, reason })
      }
    }
  }

  return conflicts
}

function _sameAlumnoSet(a, b) {
  if (!a?.length || !b?.length) return false
  if (a.length !== b.length) return false
  const setA = new Set(a.map(n => n.toLowerCase()))
  return b.every(n => setA.has(n.toLowerCase()))
}

function _similarContent(a, b) {
  if (!a || !b) return false
  const normalize = s => s.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, ' ').trim()
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return true
  return na.includes(nb) || nb.includes(na)
}
