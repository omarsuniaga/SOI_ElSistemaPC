/** Revisión de clase: propuestas de texto y destinatarios; nunca inventa notas. */
export const LESSON_KINDS = {
  contenido: { label: 'Contenido trabajado', open: '[', close: ']' },
  sugerencia: { label: 'Aspecto a reforzar', open: '(', close: ')' },
  tarea: { label: 'Tarea asignada', open: '{', close: '}' },
  observacion: { label: 'Desempeño observado', open: '', close: '' },
}

export const isLessonPresent = state => ['P', 'T', 'presente', 'tarde', 'tardanza'].includes(state)
export const lessonName = student => student.nombre_completo || student.nombre || student.name || ''
const normalize = text => String(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

// Plegado carácter a carácter: conserva la longitud para mapear posiciones al original.
const fold = text => Array.from(text, ch => {
  const folded = ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  return folded.length === 1 ? folded : ch
}).join('')
const CONNECTOR = /^\s*(?:,|;|&|\/|y|e)?\s*$/
const hasLetters = text => /[\p{L}\p{N}]/u.test(text)

/**
 * Divide el texto en las menciones explícitas `#Nombre` / `#todos`: cada alumno recibe
 * solo su frase. Un nombre ambiguo o ajeno a la nómina no se interpreta como mención.
 * Devuelve null si no se puede resolver ninguna mención.
 */
export function splitByMentions(original, roster = []) {
  const folded = fold(original)
  const names = new Map()
  for (const student of roster) {
    const key = fold(lessonName(student)).trim()
    if (key) names.set(key, names.has(key) ? null : student.id)
  }
  names.set('todos', 'todos')
  const keys = [...names.keys()].sort((a, b) => b.length - a.length)

  const mentions = []
  for (let i = 0; i < folded.length; i++) {
    if (folded[i] !== '#') continue
    const key = keys.find(name => folded.startsWith(name, i + 1) && !/[\p{L}\p{N}]/u.test(folded[i + 1 + name.length] || ''))
    if (!key || names.get(key) === null) continue
    mentions.push({ start: i, end: i + 1 + key.length, id: names.get(key) })
    i += key.length
  }
  if (!mentions.length) return null

  // "#Ana y #Luis hicieron…" es un solo mensaje con dos destinatarios.
  const groups = []
  for (const mention of mentions) {
    const last = groups.at(-1)
    if (last && CONNECTOR.test(folded.slice(last.end, mention.start))) {
      last.end = mention.end
      last.ids.push(mention.id)
    } else groups.push({ start: mention.start, end: mention.end, ids: [mention.id] })
  }

  const blocks = []
  const leading = original.slice(0, groups[0].start).trim()
  if (hasLetters(leading)) blocks.push({ source: leading, text: leading, kind: 'contenido', scope: 'seleccionar', studentIds: [] })
  groups.forEach((group, i) => {
    const stop = groups[i + 1]?.start ?? original.length
    const source = original.slice(group.start, stop).trim()
    const text = original.slice(group.end, stop).trim() || source
    const everyone = group.ids.includes('todos')
    blocks.push({
      source, text, kind: 'observacion',
      scope: everyone ? 'presentes' : 'seleccionar',
      studentIds: everyone ? [] : [...new Set(group.ids)],
    })
  })
  return blocks
}

/** Conserva literalmente el original si no se puede validar toda la respuesta. */
export function fallbackLessonReview(original, message = '', roster = []) {
  const blocks = splitByMentions(original, roster) || [{
    source: original, text: original, kind: 'contenido', scope: 'seleccionar', studentIds: [],
  }]
  return { original, warning: message, blocks }
}

/** IDs fuera de nómina, evidencia inventada y texto omitido invalidan la propuesta completa. */
export function validateLessonReview(original, proposal, roster) {
  if (!Array.isArray(proposal?.blocks) || !proposal.blocks.length || proposal.blocks.length > 60)
    throw new Error('La IA no devolvió fragmentos verificables.')
  const allowed = new Set(roster.map(a => a.id))
  const covered = new Set()
  let cursor = 0
  const blocks = proposal.blocks.map(block => {
    const source = typeof block.source === 'string' ? block.source : ''
    const start = source ? original.indexOf(source, cursor) : -1
    if (start < 0) throw new Error('Un fragmento no coincide con el texto original.')
    for (let i = start; i < start + source.length; i++) covered.add(i)
    cursor = start + source.length
    const ids = Array.isArray(block.studentIds) ? [...new Set(block.studentIds)] : []
    if (ids.some(id => !allowed.has(id))) throw new Error('La IA mencionó un alumno fuera de la clase.')
    return {
      source,
      text: typeof block.text === 'string' && block.text.trim() ? block.text.trim() : source,
      kind: Object.hasOwn(LESSON_KINDS, block.kind) ? block.kind : 'observacion',
      // Un destinatario propuesto nunca sustituye la confirmación del maestro.
      scope: block.scope === 'presentes' && !ids.length ? 'presentes' : 'seleccionar',
      studentIds: ids,
    }
  })
  if (original.split('').some((char, i) => /[\p{L}\p{N}]/u.test(char) && !covered.has(i)))
    throw new Error('La propuesta omitió parte del mensaje original.')
  return { original, warning: '', blocks }
}

/** La selección se confirma con los IDs vivos de asistencia; no por nombres inferidos. */
export function buildConfirmedLesson(blocks, roster, attendance) {
  const present = roster.filter(a => isLessonPresent(attendance[a.id]))
  const allowed = new Map(present.map(a => [a.id, a]))
  if (!blocks.length) throw new Error('Agrega al menos un contenido.')
  return blocks.map(block => {
    const text = String(block.text || '').trim()
    if (!text) throw new Error('Completa el texto de cada fragmento.')
    const ids = block.scope === 'presentes' ? present.map(a => a.id) : [...new Set(block.studentIds || [])]
    if (!ids.length || ids.some(id => !allowed.has(id)))
      throw new Error('Confirma los destinatarios presentes de cada fragmento.')
    const names = ids.map(id => lessonName(allowed.get(id)))
    if (block.scope !== 'presentes' && names.some(name => roster.filter(a => normalize(lessonName(a)) === normalize(name)).length !== 1))
      throw new Error('Hay nombres completos duplicados en la nómina; corrígelos antes de atribuir contenido.')
    const kind = LESSON_KINDS[block.kind]
    if (!kind) throw new Error('Selecciona el tipo de contenido.')
    // Una línea por destinatario: los demás alumnos no heredan su comentario.
    // Se escapan delimitadores reservados manteniendo su lectura visible.
    const safe = text.replace(/[\r\n]+/g, ' ').replace(/#/g, '＃')
      .replace(/\[/g, '［').replace(/\]/g, '］').replace(/\{/g, '｛').replace(/\}/g, '｝')
    const body = kind.open + safe + kind.close
    if (block.scope === 'presentes') return '#todos ' + body
    return names.map(name => '#' + name + ' ' + body).join('\n')
  }).join('\n')
}

export function attendanceSignature(roster, attendance) {
  return roster.map(a => [a.id, lessonName(a), attendance[a.id] || '']).sort((a, b) => a[0].localeCompare(b[0])).map(x => x.join(':')).join('|')
}
