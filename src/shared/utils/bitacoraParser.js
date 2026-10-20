/**
 * Intérprete determinista de la bitácora de clase. Puro: sin DOM, sin red, sin IA.
 * Lo comparten el panel del portal y la revisión de clase (lessonReview).
 */

const PRESENT_STATES = ['P', 'T', 'presente', 'tarde', 'tardanza']
const TOKEN_KINDS = {
  '[': { tipo: 'contenido', close: ']' },
  '(': { tipo: 'refuerzo', close: ')' },
  '{': { tipo: 'tarea', close: '}' },
}
const CONNECTOR = /^\s*(?:,|;|&|\/|y|e)?\s*$/
const hasLetters = text => /[\p{L}\p{N}]/u.test(text)

export const isPresentState = state => PRESENT_STATES.includes(state)
export const studentName = student => student.nombre_completo || student.nombre || student.name || ''

// Plegado carácter a carácter: conserva la longitud para mapear posiciones al original.
export const fold = text => Array.from(String(text), ch => {
  const folded = ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  return folded.length === 1 ? folded : ch
}).join('')

/**
 * Localiza las menciones `#Nombre` / `#todos` en el texto. Un conector entre dos menciones
 * (`#A y #B`) forma un solo grupo. Un nombre repetido en la nómina se reporta como ambiguo
 * y nunca se resuelve.
 */
export function findMentionGroups(text, roster = []) {
  const folded = fold(text)
  const names = new Map()
  for (const student of roster) {
    const key = fold(studentName(student)).trim()
    if (key) names.set(key, names.has(key) ? null : student.id)
  }
  names.set('todos', 'todos')
  const keys = [...names.keys()].sort((a, b) => b.length - a.length)

  const mentions = []
  const ambiguous = []
  for (let i = 0; i < folded.length; i++) {
    if (folded[i] !== '#') continue
    const key = keys.find(name => folded.startsWith(name, i + 1) && !hasLetters(folded[i + 1 + name.length] || ''))
    if (!key) continue
    const end = i + 1 + key.length
    const id = names.get(key)
    if (id === null) {
      ambiguous.push({ start: i, end, nombre: text.slice(i + 1, end) })
      continue
    }
    mentions.push({ start: i, end, id })
    i += key.length
  }

  const groups = []
  for (const mention of mentions) {
    const last = groups.at(-1)
    if (last && CONNECTOR.test(folded.slice(last.end, mention.start))) {
      last.end = mention.end
      last.ids.push(mention.id)
    } else groups.push({ start: mention.start, end: mention.end, ids: [mention.id] })
  }
  return { groups, ambiguous }
}

/**
 * Rangos de tokens `[ ] ( ) { }` en toda la nota (sin anidar). Se calculan antes de segmentar
 * para que una mención escrita dentro de un corchete no lo parta en dos.
 */
function tokenSpans(source) {
  const spans = []
  let i = 0
  while (i < source.length) {
    const token = TOKEN_KINDS[source[i]]
    const close = token ? source.indexOf(token.close, i + 1) : -1
    if (close > i && hasLetters(source.slice(i + 1, close))) {
      spans.push({ start: i, end: close + 1, tipo: token.tipo, mentions: [] })
      i = close + 1
    } else i++
  }
  return spans
}

/** Trozos de un segmento: tokens (ya localizados) y texto libre con letras (desempeño). */
function piecesOf(source, from, to, spans) {
  const pieces = []
  const flushGap = (start, end) => {
    const raw = source.slice(start, end)
    const trimmed = raw.trim()
    if (!hasLetters(trimmed)) return
    const inicio = start + raw.indexOf(trimmed)
    pieces.push({ tipo: 'desempeno', inicio, fin: inicio + trimmed.length, texto: trimmed })
  }
  let cursor = from
  for (const span of spans) {
    if (span.start < from || span.end > to) continue
    flushGap(cursor, span.start)
    // El texto del token sin las menciones que contiene.
    let inner = ''
    let at = span.start + 1
    for (const m of span.mentions) { inner += source.slice(at, m.start) + ' '; at = m.end }
    inner += source.slice(at, span.end - 1)
    pieces.push({ tipo: span.tipo, inicio: span.start, fin: span.end, texto: inner.replace(/\s+/g, ' ').trim(), span })
    cursor = span.end
  }
  flushGap(cursor, to)
  return pieces
}

/**
 * Interpreta la nota. Cada registro toma su evidencia del texto original; el texto de la
 * mención (`#Nombre`) pertenece a la primera frase de su segmento, así la nota queda cubierta.
 */
export function parseBitacora(text = '', { roster = [], attendance = {} } = {}) {
  const source = String(text ?? '')
  const presentIds = roster.filter(a => isPresentState(attendance[a.id])).map(a => a.id)
  const result = {
    registros: [],
    sinAsignar: [],
    avisos: [],
    cobertura: { presentes: presentIds.length, conRegistro: 0, frasesSinAsignar: 0 },
  }
  if (!source.trim()) return result

  const { groups, ambiguous } = findMentionGroups(source, roster)
  const avisos = new Map()
  const addAviso = (key, aviso) => { if (!avisos.has(key)) avisos.set(key, aviso) }
  const resolve = ids => {
    if (ids.includes('todos')) return presentIds.length ? { alcance: 'grupo', ids: presentIds } : null
    const recipients = []
    for (const id of ids) {
      const student = roster.find(a => a.id === id)
      if (attendance[id] && !isPresentState(attendance[id])) {
        addAviso(`ausente:${id}`, { tipo: 'ausente', alumnoId: id, nombre: studentName(student) })
      } else if (!recipients.includes(id)) recipients.push(id)
    }
    return recipients.length ? { alcance: 'alumno', ids: recipients } : null
  }

  // Una mención dentro de un token pertenece a ese token y no corta la nota en segmentos.
  const spans = tokenSpans(source)
  const spanOf = pos => spans.find(span => pos > span.start && pos < span.end - 1)
  const boundaries = []
  for (const mark of [
    ...groups.map(g => ({ start: g.start, end: g.end, ids: g.ids, ambiguous: false })),
    ...ambiguous.map(a => ({ start: a.start, end: a.end, ids: [], ambiguous: true, nombre: a.nombre })),
  ].sort((a, b) => a.start - b.start)) {
    if (mark.ambiguous) addAviso(`ambiguo:${mark.nombre}`, { tipo: 'ambiguo', nombre: mark.nombre })
    const span = spanOf(mark.start)
    if (span) span.mentions.push(mark)
    else boundaries.push(mark)
  }

  const segments = [{ lead: null, body: [0, boundaries[0]?.start ?? source.length], target: null }]
  boundaries.forEach((boundary, i) => {
    const next = boundaries[i + 1]?.start ?? source.length
    const target = boundary.ambiguous ? null : resolve(boundary.ids)
    segments.push({ lead: { start: boundary.start, end: boundary.end }, body: [boundary.end, next], target })
  })

  const reached = new Set()
  for (const segment of segments) {
    const pieces = piecesOf(source, ...segment.body, spans)
    if (!pieces.length) {
      if (segment.lead) result.sinAsignar.push({ texto: source.slice(segment.lead.start, segment.lead.end), inicio: segment.lead.start, fin: segment.lead.end })
      continue
    }
    pieces.forEach((piece, index) => {
      const inicio = index === 0 && segment.lead ? segment.lead.start : piece.inicio
      const fin = piece.fin
      // Sin mención, solo el contenido `[ ]` se atribuye al grupo presente (la maestra lo confirma en F2).
      const inner = piece.span?.mentions.filter(m => !m.ambiguous) || []
      const target = piece.span?.mentions.length ? (inner.length ? resolve(inner.flatMap(m => m.ids)) : null)
        : segment.lead ? segment.target
        : piece.tipo === 'contenido' && presentIds.length ? { alcance: 'grupo', ids: presentIds } : null
      if (!target) {
        result.sinAsignar.push({ texto: source.slice(inicio, fin), inicio, fin })
        return
      }
      target.ids.forEach(id => reached.add(id))
      result.registros.push({
        id: `${piece.tipo}:${inicio}-${fin}`,
        tipo: piece.tipo,
        alcance: target.alcance,
        alumnoIds: [...target.ids],
        texto: piece.texto,
        evidencia: { inicio, fin, texto: source.slice(inicio, fin) },
        origen: 'escrito',
      })
    })
  }

  result.avisos = [...avisos.values()]
  result.cobertura.conRegistro = presentIds.filter(id => reached.has(id)).length
  result.cobertura.frasesSinAsignar = result.sinAsignar.length
  return result
}
