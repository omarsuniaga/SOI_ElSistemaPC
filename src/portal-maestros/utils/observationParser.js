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

// ─── Alert detection (Fine categorisation) ───────────────────────────────────

export const ALERT_TYPES = {
  CONDUCTA: [
    'mal comportamiento', 'mala conducta', 'conducta disruptiva', 'comportamiento negativo',
    'falta de respeto', 'irrespetuoso', 'irrespetuosa', 'agresivo', 'agresiva',
    'pelea', 'peleo', 'golpeo', 'insulto', 'insulto', 'indisciplina', 'indisciplinado',
    'indisciplinada', 'actitud negativa', 'actitud problema', 'mala actitud',
    'no quiso', 'se nego', 'berrinche'
  ],
  ATENCION: [
    'dificultad en la atencion', 'atencion y concentracion', 'concentracion',
    'se distrae', 'no logra concentrarse', 'no atiende', 'no presta atencion',
    'distrae', 'falta de atencion', 'falta de concentracion'
  ],
  RIESGO_PEDAGOGICO: [
    'frustracion', 'atraso', 'acumulando fallas', 'riesgo', 'cuesta mas', 'le cuesta',
    'les cuesta', 'se le dificulta', 'se les dificulta', 'dificultad tecnica'
  ]
}

/**
 * Detects if a text fragment contains pedagogical or behavioral alerts.
 * Returns an object with type and message.
 * @param {string} text
 * @param {string} tipo - Inferred class category
 * @returns {{active: boolean, type: 'CONDUCTA'|'ATENCION'|'RIESGO_PEDAGOGICO'|null, mensaje: string|null}}
 */
export function detectPedagogicalAlert(text, tipo) {
  const normalized = normalizeText(text)
  
  if (tipo === 'comportamiento' || tipo === 'conducta') {
    return { active: true, type: 'CONDUCTA', mensaje: 'Alerta de comportamiento detectada.' }
  }
  
  for (const [alertType, keywords] of Object.entries(ALERT_TYPES)) {
    if (keywords.some(kw => normalized.includes(normalizeText(kw)))) {
      const label = alertType === 'RIESGO_PEDAGOGICO' ? 'Riesgo Pedagógico' : alertType === 'ATENCION' ? 'Atención y Concentración' : 'Conducta'
      return {
        active: true,
        type: alertType,
        mensaje: `Alerta de ${label.toLowerCase()} detectada.`
      }
    }
  }
  
  return { active: false, type: null, mensaje: null }
}

/** Legacy support - returns a boolean if any alert is active */
export function detectAlert(text, tipo) {
  return detectPedagogicalAlert(text, tipo).active
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
 * Segments a teacher observation into named groups with advanced pedagogical scopes.
 *
 * Strategy: paragraph-first segmentation.
 * Teachers naturally write one paragraph per subject (Evans, the group, some students).
 * Splitting by sentence loses that context and creates too many redundant cards.
 *
 * Algorithm:
 *   1. Split by paragraph (double newline or clear topic shift)
 *   2. Within each paragraph, detect the primary subject (individual / grupo / exclusion / algunos)
 *   3. Merge sentences within the same paragraph into one fragment
 *   4. Track individual students with difficulties for "los demás" exclusion
 *
 * @param {string} text
 * @param {object} context
 * @returns {ParsedGroup[]}
 */
export function segmentObservation(text, context = {}) {
  const { alumnos = [], tipoClase = 'instrumento' } = context
  const presentes = context.presentes?.length ? context.presentes : alumnos
  const lookup = buildRosterLookup(presentes)

  // ── Step 1: split into paragraphs ────────────────────────────────────────
  const rawParagraphs = text
    .split(/\n{2,}/)                     // explicit blank lines
    .map(p => p.replace(/\n/g, ' ').trim())
    .filter(p => p.length > 10)

  const paragraphs = rawParagraphs.flatMap(paragraph => {
    const sentences = segmentSentences(paragraph)
    if (sentences.length <= 1) return [paragraph]

    const scopedSentences = sentences.filter(sentence => {
      if (_isMetaCommentary(sentence)) return false          // skip filler sentences
      const lower = sentence.toLowerCase()
      const hasStudents = findMentionedStudents(sentence, lookup, presentes, alumnos).students.length > 0
      const hasGroupScope = /\btodos\b|\btodo el grupo\b|\btoda la clase\b|\balgunos\b/i.test(lower)
      const hasExclusionScope = /(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)/i.test(sentence)
      return hasStudents || hasGroupScope || hasExclusionScope
    })

    return scopedSentences.length > 1 ? sentences.filter(s => !_isMetaCommentary(s)) : [paragraph]
  })

  if (!paragraphs.length) return []

  const initialGroups = []
  // Track individuals explicitly named with a difficulty (for "los demás" exclusion)
  const individualDifficulties = new Set()

  // ── Step 2: process each paragraph as one semantic unit ──────────────────
  for (const paragraph of paragraphs) {
    const lower = paragraph.toLowerCase()

    const hasExclusionCue = /(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)/i.test(paragraph)
    const isIndeterminado = /\balgunos\b/i.test(lower) &&
                            !findMentionedStudents(paragraph, lookup, presentes, alumnos).students.length

    const { students: mentioned, ambiguous, requires_confirmation } = findMentionedStudents(paragraph, lookup, presentes, alumnos)
    const startsWithExclusionCue = /^\s*(?:los dem[a\u00e1]s|el resto del grupo|los otros alumnos)\b/i.test(paragraph)
    const isExclusion = hasExclusionCue && (!mentioned.length || startsWithExclusionCue)
    // If no specific student mentioned and not a targeted exclusion/subgroup,
    // treat the paragraph as a collective observation for the whole group.
    const isImplicitColectivo = !mentioned.length && !isExclusion && !isIndeterminado
    const isColectivo = mentioned.length > 1 ||
                        /\btodos\b|\btodo el grupo\b|\btoda la clase\b/.test(lower) ||
                        isExclusion ||
                        isImplicitColectivo

    const tipo     = inferTipo(paragraph, tipoClase)
    const stateObj = detectState(paragraph)
    const alertObj = detectPedagogicalAlert(paragraph, tipo)
    const effectiveAlertObj = alertObj.active
      ? alertObj
      : stateObj.value === 'DIFICULTAD'
        ? { active: true, type: 'RIESGO_PEDAGOGICO', mensaje: 'Riesgo pedagógico detectado.' }
        : alertObj

    // Track individual students flagged with difficulty for exclusion later
    if (!isColectivo && !isExclusion && mentioned.length === 1 &&
        (stateObj.value === 'DIFICULTAD' || effectiveAlertObj.active)) {
      individualDifficulties.add(mentioned[0].id || mentioned[0].nombre || mentioned[0].nombre_completo)
    }

    initialGroups.push({
      alumnos:              mentioned,
      alumnoTags:           [],
      fragment:             paragraph,
      estado:               stateObj,
      nota:                 detectNote(paragraph),
      tarea:                detectTask(paragraph),
      esColectivo:          isColectivo,
      isExclusion,
      isIndeterminado,
      alerta:               effectiveAlertObj.active || stateObj.value === 'DIFICULTAD',
      alertDetails:         effectiveAlertObj,
      tipoClase,
      ambiguous,
      requires_confirmation,
      scope:                'individual',
    })
  }

  // ── Step 2.5: inherit implicit subject ("el alumno", "la alumna", "su") ──
  _attachImplicitSubject(initialGroups)

  // ── Step 3: resolve scopes using accumulated difficulty context ───────────
  for (const group of initialGroups) {
    if (group.isExclusion) {
      const excludedIds = Array.from(individualDifficulties)
      group.alumnos = presentes.filter(a => {
        const id = a.id || a.nombre || a.nombre_completo
        return !excludedIds.includes(id)
      })
      group.esColectivo         = true
      group.scope               = 'grupo_excluyendo'
      group.excludeIds          = excludedIds
      group.alumnoTags          = ['Todos (excluyendo)']
    } else if (group.isIndeterminado) {
      group.alumnos             = []
      group.esColectivo         = false
      group.scope               = 'subgrupo_indeterminado'
      group.requires_confirmation = true
      group.alumnoTags          = ['Algunos']
    } else {
      group.scope = group.esColectivo ? 'grupo' : 'individual'
      if (group.esColectivo && !group.alumnos.length) {
        // Implicit collective — fill with all present students
        group.alumnos    = presentes
        group.alumnoTags = ['Todos']
      } else {
        group.alumnoTags = group.esColectivo
          ? ['Todos']
          : group.alumnos.map(a => a.nombreCorto || a.nombre_corto || a.nombre || a.nombre_completo)
      }
    }
  }

  // ── Step 4: split DIFICULTAD paragraphs by alert type ────────────────────
  // If one paragraph has both RIESGO_PEDAGOGICO and ATENCION cues, split into 2 cards
  return _splitDualAlerts(initialGroups, presentes, lookup)
}

/**
 * Returns true if a sentence is meta-commentary (institutional reflection, pedagogical
 * goals, continuity statements) rather than a direct observation record.
 * These sentences should NOT generate progress cards.
 *
 * Examples that should be filtered:
 *   "Es fundamental que continuemos trabajando en la práctica..."
 *   "Es importante señalar que debemos asegurarnos de que todos progresen."
 *   "Lo que es un gran desafío para el grupo."
 */
function _isMetaCommentary(text) {
  const n = normalizeText(text)
  return (
    /^es fundamental\b/.test(n)      ||
    /^es importante (que|senalar|notar|destacar)\b/.test(n) ||
    /\bdebemos continuar\b/.test(n)  ||
    /\bpara asegurarnos\b/.test(n)   ||
    /\bde manera equilibrada\b/.test(n) ||
    /\bcontinuemos trabajando\b/.test(n) ||
    /\bseguir trabajando\b/.test(n)  ||
    /\bcontinuar practicando\b/.test(n)
  )
}

/**
 * Resolves implicit subject references ("el alumno", "la alumna", "su") by
 * inheriting the last explicitly named individual student when no students are
 * found in a paragraph. This handles the common pattern:
 *
 *   "Evans tiene dificultad con el arco."  ← names Evans explicitly
 *   "El alumno además se distrae mucho."   ← implicit — still Evans
 *
 * Mutates groups in place.
 * @param {Array} groups
 */
function _attachImplicitSubject(groups) {
  const IMPLICIT_RE = /\b(?:el alumno|la alumna|este alumno|esta alumna|dicho alumno|dicha alumna)\b/i

  let lastStudents = []
  let lastIsIndividual = false

  for (const group of groups) {
    const hasExplicit = group.alumnos?.length > 0

    if (hasExplicit) {
      if (!group.esColectivo && !group.isExclusion && !group.isIndeterminado) {
        lastStudents    = group.alumnos
        lastIsIndividual = true
      } else {
        // Reset on collective/group paragraphs so we don't over-inherit
        lastIsIndividual = false
      }
      continue
    }

    // No explicit students — check if text uses a back-reference pronoun
    if (lastIsIndividual && lastStudents.length && IMPLICIT_RE.test(group.fragment)) {
      group.alumnos           = [...lastStudents]
      group.esColectivo       = lastStudents.length > 1
      group.inherited_subject = true
    }
  }
}

/**
 * If a paragraph has both a technical risk AND an attention alert,
 * split it into two separate records so the teacher sees them distinctly.
 */
function _splitDualAlerts(groups, presentes, lookup) {
  const result = []
  for (const g of groups) {
    if (!g.alerta || g.esColectivo || g.isIndeterminado) {
      result.push(g)
      continue
    }

    const sentences = segmentSentences(g.fragment)
    const hasTechRisk = sentences.some(s => {
      const n = normalizeText(s)
      return ALERT_TYPES.RIESGO_PEDAGOGICO.some(kw => n.includes(normalizeText(kw)))
    })
    const hasAttention = sentences.some(s => {
      const n = normalizeText(s)
      return ALERT_TYPES.ATENCION.some(kw => n.includes(normalizeText(kw)))
    })

    if (hasTechRisk && hasAttention) {
      // Sentence 1..N-1 = technical risk, last attention sentence = attention card
      const attentionSentences = sentences.filter(s => {
        const n = normalizeText(s)
        return ALERT_TYPES.ATENCION.some(kw => n.includes(normalizeText(kw)))
      })
      const techSentences = sentences.filter(s => !attentionSentences.includes(s))

      if (techSentences.length) {
        result.push({
          ...g,
          fragment:     techSentences.join(' '),
          alertDetails: { active: true, type: 'RIESGO_PEDAGOGICO', mensaje: 'Riesgo pedagógico detectado.' },
        })
      }
      if (attentionSentences.length) {
        result.push({
          ...g,
          fragment:     attentionSentences.join(' '),
          alertDetails: { active: true, type: 'ATENCION', mensaje: 'Alerta de atención y concentración detectada.' },
        })
      }
    } else {
      result.push(g)
    }
  }
  return result
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
    const sameStateValue = prev.estado.value === curr.estado.value
    const isBothDificultad = prev.estado.value === 'DIFICULTAD' && curr.estado.value === 'DIFICULTAD'

    if (sameStudents && (sameStateValue || isBothDificultad)) {
      prev.fragment += ' ' + curr.fragment
      prev.nota  = prev.nota  ?? curr.nota
      prev.tarea = prev.tarea ?? curr.tarea
      if (curr.alerta) {
        prev.alerta = true
        if (curr.alertDetails && curr.alertDetails.active) {
          prev.alertDetails = curr.alertDetails
        }
      }
      if (curr.estado.confidence > prev.estado.confidence) {
        prev.estado = curr.estado
      }
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
