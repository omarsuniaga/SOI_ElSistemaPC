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

/** Trozos de un segmento: tokens `[ ] ( ) { }` y texto libre con letras (desempeño). */
function piecesOf(source, from, to) {
  const pieces = []
  let gapStart = from
  const flushGap = end => {
    const raw = source.slice(gapStart, end)
    const trimmed = raw.trim()
    if (!hasLetters(trimmed)) return
    const inicio = gapStart + raw.indexOf(trimmed)
    pieces.push({ tipo: 'desempeno', inicio, fin: inicio + trimmed.length, texto: trimmed })
  }
  let i = from
  while (i < to) {
    const token = TOKEN_KINDS[source[i]]
    const close = token ? source.indexOf(token.close, i + 1) : -1
    const inner = close > i && close < to ? source.slice(i + 1, close).trim() : ''
    if (inner) {
      flushGap(i)
      pieces.push({ tipo: token.tipo, inicio: i, fin: close + 1, texto: inner })
      i = close + 1
      gapStart = i
    } else i++
  }
  flushGap(to)
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
  const boundaries = [
    ...groups.map(g => ({ start: g.start, end: g.end, ids: g.ids, ambiguous: false })),
    ...ambiguous.map(a => ({ start: a.start, end: a.end, ids: [], ambiguous: true, nombre: a.nombre })),
  ].sort((a, b) => a.start - b.start)

  const segments = [{ lead: null, body: [0, boundaries[0]?.start ?? source.length], target: null }]
  boundaries.forEach((boundary, i) => {
    const next = boundaries[i + 1]?.start ?? source.length
    let target = null
    if (boundary.ambiguous) {
      addAviso(`ambiguo:${boundary.nombre}`, { tipo: 'ambiguo', nombre: boundary.nombre })
    } else if (boundary.ids.includes('todos')) {
      target = presentIds.length ? { alcance: 'grupo', ids: presentIds } : null
    } else {
      const recipients = []
      for (const id of boundary.ids) {
        const student = roster.find(a => a.id === id)
        if (attendance[id] && !isPresentState(attendance[id])) {
          addAviso(`ausente:${id}`, { tipo: 'ausente', alumnoId: id, nombre: studentName(student) })
        } else if (!recipients.includes(id)) recipients.push(id)
      }
      target = recipients.length ? { alcance: 'alumno', ids: recipients } : null
    }
    segments.push({ lead: { start: boundary.start, end: boundary.end }, body: [boundary.end, next], target })
  })

  const reached = new Set()
  for (const segment of segments) {
    const pieces = piecesOf(source, ...segment.body)
    if (!pieces.length) {
      if (segment.lead) result.sinAsignar.push({ texto: source.slice(segment.lead.start, segment.lead.end), inicio: segment.lead.start, fin: segment.lead.end })
      continue
    }
    pieces.forEach((piece, index) => {
      const inicio = index === 0 && segment.lead ? segment.lead.start : piece.inicio
      const fin = piece.fin
      // Sin mención, solo el contenido `[ ]` se atribuye al grupo presente (la maestra lo confirma en F2).
      const target = segment.lead ? segment.target
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
