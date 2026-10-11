/**
 * classHealthService.js — Salud de la clase (informe mensual por clase).
 *
 * Funciones puras: reciben el timeline completo del período ya cargado por la
 * vista de Control de Asistencia y no consultan datos. Solo puntúan clases,
 * nunca alumnos.
 */

const ATTENDED_STATES = new Set(['presente', 'tarde'])

const MIN_TERM_LENGTH = 4
const MAX_TOPICS = 8
const LEVEL_SALUDABLE = 'Saludable'
const LEVEL_OBSERVACION = 'En observación'
const LEVEL_ATENCION = 'Requiere atención'

// Spanish stopwords, stored without accents because terms are normalized first.
const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'a',
  'ante', 'bajo', 'con', 'contra', 'desde', 'durante', 'en', 'entre', 'hacia',
  'hasta', 'para', 'por', 'segun', 'sin', 'sobre', 'tras', 'y', 'e', 'o', 'u',
  'ni', 'que', 'se', 'su', 'sus', 'lo', 'le', 'les', 'me', 'te', 'nos', 'os',
  'mi', 'mis', 'tu', 'tus', 'este', 'esta', 'estos', 'estas', 'ese', 'esa',
  'esos', 'esas', 'aquel', 'aquella', 'eso', 'esto', 'es', 'son', 'fue', 'ser',
  'era', 'han', 'ha', 'hay', 'he', 'muy', 'mas', 'pero', 'si', 'no', 'ya',
  'como', 'cuando', 'donde', 'quien', 'cual', 'cada', 'todo', 'toda', 'todos',
  'todas', 'otro', 'otra', 'otros', 'otras', 'mismo', 'misma', 'tambien',
  'solo', 'sino', 'porque', 'aunque', 'ademas', 'asi', 'hoy',
])

function round1(value) {
  return Math.round(value * 10) / 10
}

export function pct(numerator, denominator) {
  return denominator > 0 ? round1((numerator / denominator) * 100) : null
}

function ratioPct(numerator, denominator) {
  return denominator > 0 ? round1((numerator / denominator) * 100) : 0
}

function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function termTokens(normalized) {
  return normalized
    .split(' ')
    .filter((token) => token.length >= MIN_TERM_LENGTH && !STOPWORDS.has(token))
}

/** Unigrams and adjacent bigrams of the kept tokens, as a set (one count per session). */
function sessionTerms(tokens) {
  const terms = new Set(tokens)
  for (let i = 0; i < tokens.length - 1; i++) {
    terms.add(`${tokens[i]} ${tokens[i + 1]}`)
  }
  return terms
}

// A topic never spans two phrases: terms are built per fragment.
const FRAGMENT_SEPARATOR = /[.,;:!?()\n\r/|•·–—-]+/u

function contentTerms(content) {
  const terms = new Set()
  for (const fragment of content.split(FRAGMENT_SEPARATOR)) {
    for (const term of sessionTerms(termTokens(normalizeText(fragment)))) terms.add(term)
  }
  return terms
}

export function sessionContent(clase) {
  return [clase.observacion_sesion, clase.observacion_clase]
    .map((text) => String(text ?? '').trim())
    .filter(Boolean)
    .join('\n')
}

function buildTopics(withContent) {
  const occurrences = new Map()
  for (const session of withContent) {
    for (const term of session.terms) {
      if (!occurrences.has(term)) occurrences.set(term, { sessions: 0, dates: new Set() })
      const entry = occurrences.get(term)
      entry.sessions++
      entry.dates.add(session.fecha)
    }
  }

  const candidates = [...occurrences.entries()].filter(([, entry]) => entry.sessions >= 2)
  const keptBigramTokens = new Set(
    candidates
      .filter(([term]) => term.includes(' '))
      .flatMap(([term]) => term.split(' ')),
  )

  return candidates
    .filter(([term]) => term.includes(' ') || !keptBigramTokens.has(term))
    .sort((a, b) =>
      b[1].sessions - a[1].sessions || a[0].localeCompare(b[0], 'es'),
    )
    .slice(0, MAX_TOPICS)
    .map(([label, entry]) => ({
      label,
      sessions: entry.sessions,
      attentionPct: ratioPct(entry.sessions, withContent.length),
      dates: [...entry.dates].sort(),
    }))
}

function analyzeContent(sessions) {
  const chronological = [...sessions].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const withContent = []
  const entries = []
  const distinct = new Set()
  let repeatedContentSessions = 0

  for (const session of chronological) {
    const content = sessionContent(session.clase)
    const normalized = normalizeText(content)
    if (!normalized) continue

    if (distinct.has(normalized)) repeatedContentSessions++
    distinct.add(normalized)
    withContent.push({
      fecha: session.fecha,
      terms: contentTerms(content),
    })
    entries.push({ date: session.fecha, text: content })
  }

  const total = sessions.length
  return {
    sessionsWithContent: withContent.length,
    sessionsWithoutContent: total - withContent.length,
    coveragePct: ratioPct(withContent.length, total),
    repeatedContentSessions,
    varietyPct: ratioPct(distinct.size, withContent.length),
    topics: buildTopics(withContent),
    entries,
  }
}

/** 0.5 * attendance + 0.3 * content coverage + 0.2 * content variety, rounded. */
function healthScoreOf(attendanceRatePct, content) {
  if (attendanceRatePct === null) return null
  return Math.round(
    0.5 * attendanceRatePct +
    0.3 * content.coveragePct +
    0.2 * content.varietyPct,
  )
}

function healthLevelOf(score) {
  if (score === null) return null
  if (score >= 80) return LEVEL_SALUDABLE
  if (score >= 60) return LEVEL_OBSERVACION
  return LEVEL_ATENCION
}

function monthPrefix(year, monthIndex) {
  return `${year}-${String(Number(monthIndex) + 1).padStart(2, '0')}-`
}

function previousMonth(year, monthIndex) {
  return Number(monthIndex) === 0
    ? { year: Number(year) - 1, monthIndex: 11 }
    : { year: Number(year), monthIndex: Number(monthIndex) - 1 }
}

function classKeyOf(clase) {
  return clase.clase_id || [
    clase.clase_nombre || 'Clase',
    clase.maestro_nombre || 'Sin asignar',
    clase.instrumento || 'General',
  ].join('|')
}

/**
 * Attendance of one class session. Counts from the per-student states when
 * present; falls back to the aggregated counters otherwise.
 */
function countSession(clase) {
  const asistencias = Array.isArray(clase.asistencias) ? clase.asistencias : []

  if (asistencias.length > 0) {
    const counts = { attended: 0, late: 0, justified: 0, absent: 0 }
    for (const asistencia of asistencias) {
      const estado = String(asistencia.estado || '').toLowerCase()
      if (ATTENDED_STATES.has(estado)) counts.attended++
      if (estado === 'tarde') counts.late++
      if (estado === 'justificado') counts.justified++
      if (estado === 'ausente') counts.absent++
    }
    return counts
  }

  return {
    attended: Number(clase.presentes || 0),
    late: 0,
    justified: Number(clase.justificados || 0),
    absent: Number(clase.ausentes || 0),
  }
}

/** Groups the sessions of one month by class, keeping class metadata. */
function collectSessionsByClass(timeline, prefix) {
  const byClass = new Map()
  const dias = Array.isArray(timeline) ? timeline : []

  for (const dia of dias) {
    if (typeof dia?.fecha !== 'string' || !dia.fecha.startsWith(prefix)) continue

    for (const clase of dia.clases || []) {
      const key = classKeyOf(clase)
      if (!byClass.has(key)) {
        byClass.set(key, {
          classId: clase.clase_id || null,
          className: clase.clase_nombre || 'Clase',
          teacher: clase.maestro_nombre || 'Sin asignar',
          department: clase.instrumento || 'General',
          sessions: [],
        })
      }
      byClass.get(key).sessions.push({ fecha: dia.fecha, clase, counts: countSession(clase) })
    }
  }

  return byClass
}

function sumCounts(sessions) {
  const totals = { sessions: sessions.length, attended: 0, late: 0, justified: 0, absent: 0 }
  for (const { counts } of sessions) {
    totals.attended += counts.attended
    totals.late += counts.late
    totals.justified += counts.justified
    totals.absent += counts.absent
  }
  totals.convoked = totals.attended + totals.justified + totals.absent
  totals.attendanceRatePct = pct(totals.attended, totals.convoked)
  return totals
}

/**
 * @param {Array} timeline Full-period timeline (days with `clases`).
 * @param {{ year: number, monthIndex: number }} period Target month, 0-based.
 */
export function buildClassHealthData(timeline, { year, monthIndex }) {
  const currentByClass = collectSessionsByClass(timeline, monthPrefix(year, monthIndex))
  const prev = previousMonth(year, monthIndex)
  const previousByClass = collectSessionsByClass(timeline, monthPrefix(prev.year, prev.monthIndex))

  const comparable = []

  const classes = [...currentByClass.entries()]
    .map(([key, entry]) => {
      const current = sumCounts(entry.sessions)
      const previousEntry = previousByClass.get(key)
      const previousTotals = previousEntry ? sumCounts(previousEntry.sessions) : null
      const hasPrevious = previousTotals !== null && previousTotals.attendanceRatePct !== null
      const content = analyzeContent(entry.sessions)
      const healthScore = healthScoreOf(current.attendanceRatePct, content)

      if (hasPrevious) {
        comparable.push({ current, previous: previousTotals })
      }

      return {
        classId: entry.classId,
        className: entry.className,
        teacher: entry.teacher,
        department: entry.department,
        sessions: current.sessions,
        attended: current.attended,
        late: current.late,
        justified: current.justified,
        absent: current.absent,
        convoked: current.convoked,
        attendanceRatePct: current.attendanceRatePct,
        previous: previousTotals
          ? { sessions: previousTotals.sessions, attendanceRatePct: previousTotals.attendanceRatePct }
          : null,
        attendanceDeltaPts: hasPrevious && current.attendanceRatePct !== null
          ? round1(current.attendanceRatePct - previousTotals.attendanceRatePct)
          : null,
        content,
        healthScore,
        healthLevel: healthLevelOf(healthScore),
      }
    })
    .sort((a, b) => a.className.localeCompare(b.className, 'es'))

  const scores = classes.map((c) => c.healthScore).filter((s) => s !== null)
  const levelCounts = {
    [LEVEL_SALUDABLE]: 0,
    [LEVEL_OBSERVACION]: 0,
    [LEVEL_ATENCION]: 0,
  }
  for (const c of classes) {
    if (c.healthLevel) levelCounts[c.healthLevel]++
  }

  const total = classes.reduce(
    (acc, c) => {
      acc.sessions += c.sessions
      acc.attended += c.attended
      acc.late += c.late
      acc.justified += c.justified
      acc.absent += c.absent
      acc.convoked += c.convoked
      return acc
    },
    { sessions: 0, attended: 0, late: 0, justified: 0, absent: 0, convoked: 0 },
  )

  const comparableCurrent = comparable.reduce(
    (acc, { current }) => ({
      attended: acc.attended + current.attended,
      convoked: acc.convoked + current.convoked,
    }),
    { attended: 0, convoked: 0 },
  )
  const comparablePrevious = comparable.reduce(
    (acc, { previous }) => ({
      attended: acc.attended + previous.attended,
      convoked: acc.convoked + previous.convoked,
    }),
    { attended: 0, convoked: 0 },
  )
  const previousAttendanceRatePct = pct(comparablePrevious.attended, comparablePrevious.convoked)
  const comparableRatePct = pct(comparableCurrent.attended, comparableCurrent.convoked)

  return {
    month: { year: Number(year), monthIndex: Number(monthIndex) },
    summary: {
      classCount: classes.length,
      sessions: total.sessions,
      attended: total.attended,
      late: total.late,
      justified: total.justified,
      absent: total.absent,
      convoked: total.convoked,
      attendanceRatePct: pct(total.attended, total.convoked),
      previousAttendanceRatePct,
      attendanceDeltaPts: comparableRatePct !== null && previousAttendanceRatePct !== null
        ? round1(comparableRatePct - previousAttendanceRatePct)
        : null,
      averageHealthScore: scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : null,
      levelCounts,
    },
    classes,
  }
}
