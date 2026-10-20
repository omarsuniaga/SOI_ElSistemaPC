import { highlightDSL } from '../utils/dslParser.js'

export function createStudentMention(option, displayName) {
  const name = String(displayName ?? option.nombre_completo ?? option.nombre ?? option.name ?? option.label ?? '').replace(/^#+/, '').trim()
  const chip = document.createElement('span')
  chip.className = 'dsl-token dsl-alumno pm-student-mention'
  chip.contentEditable = 'false'
  chip.setAttribute('contenteditable', 'false')
  chip.dataset.studentId = String(option.id || option.value || name)
  chip.dataset.nombre = name
  chip.title = name === 'todos' ? 'Todos los presentes' : 'Alumno etiquetado: ' + name
  chip.textContent = '#' + name
  return chip
}

export function editorRangeFromOffsets(editor, start, end = start) {
  const range = document.createRange()
  range.selectNodeContents(editor)
  range.collapse(false)
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT)
  let count = 0, node, started = false
  while ((node = walker.nextNode())) {
    const next = count + node.length
    if (!started && start <= next) { range.setStart(node, Math.max(0, start - count)); started = true }
    if (started && end <= next) { range.setEnd(node, Math.max(0, end - count)); return range }
    count = next
  }
  return range
}

const chipAncestor = node => (node?.nodeType === 1 ? node : node?.parentElement)?.closest('.pm-student-mention')

/** Identifica un token incompleto, nunca una etiqueta ya confirmada. */
export function getAutocompleteTarget(editor, selection = window.getSelection()) {
  if (!selection?.rangeCount || !selection.isCollapsed) return null
  const caret = selection.getRangeAt(0)
  if (!editor.contains(caret.endContainer) || chipAncestor(caret.endContainer)) return null
  const before = caret.cloneRange()
  before.selectNodeContents(editor)
  before.setEnd(caret.endContainer, caret.endOffset)
  const prefix = before.toString()
  const match = prefix.match(/([#[({$>])([^#[\](){}\n$>]*)$/)
  if (!match) return null
  let start = prefix.length - match[0].length
  if (match[1] === '#') while (start > 0 && prefix[start - 1] === '#') start--
  const range = editorRangeFromOffsets(editor, start, prefix.length)
  if (chipAncestor(range.startContainer) || range.cloneContents().querySelector('.pm-student-mention')) return null
  const startBlock = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement)?.closest('div,p,li')
  const endBlock = (caret.endContainer.nodeType === 1 ? caret.endContainer : caret.endContainer.parentElement)?.closest('div,p,li')
  if (startBlock !== endBlock) return null
  return {
    trigger: match[1], query: match[2] || '', start, end: prefix.length,
    snapshot: editor.textContent,
  }
}

/** Reemplaza #consulta completo y sitúa el cursor después de la nueva etiqueta. */
export function replaceAutocompleteTarget(editor, target, option) {
  if (editor.textContent !== target.snapshot) return false
  const label = String(option.nombre_completo || option.nombre || option.name || option.label || option.descripcion || '').trim()
  if (!label) return false
  const closing = { '[': ']', '(': ')', '{': '}' }[target.trigger] || ''
  let end = target.end
  if (closing && target.snapshot[end] === closing) end++
  const range = editorRangeFromOffsets(editor, target.start, end)
  const fragment = document.createDocumentFragment()
  if (target.trigger === '#') {
    if (target.start > 0 && !/\s/.test(target.snapshot[target.start - 1])) fragment.appendChild(document.createTextNode(' '))
    fragment.appendChild(createStudentMention(option))
  } else {
    let text = label
    if (target.trigger === '$') text = option.codigo || label
    if (target.trigger === '>' && option.level_number) text = 'NIVEL-' + option.level_number
    else if (target.trigger === '>' && option.type) text = 'NODO:' + option.type
    fragment.appendChild(document.createTextNode(target.trigger + text + closing))
  }
  const spacer = document.createTextNode(' ')
  fragment.appendChild(spacer)
  range.deleteContents()
  range.insertNode(fragment)
  // Fijar el rango DESPUÉS del focus, que algunos navegadores llevan al inicio.
  editor.focus()
  const next = document.createRange()
  next.setStart(spacer, 1)
  next.collapse(true)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(next)
  return true
}

/** Recupera etiquetas conocidas al reabrir, manteniendo #Nombre como texto de guardado. */
export function renderMentionMarkup(text, roster = []) {
  const candidates = [{ id: 'todos', nombre: 'todos' }, ...roster]
    .map(option => ({ option, name: String(option.nombre_completo || option.nombre || option.name || '').trim() }))
    .filter(item => item.name)
    .sort((a, b) => b.name.length - a.name.length)
  const root = document.createElement('div')
  function appendText(value) {
    if (!value) return
    const holder = document.createElement('div')
    holder.innerHTML = highlightDSL(value)
    while (holder.firstChild) root.appendChild(holder.firstChild)
  }
  let offset = 0, plainStart = 0
  while (offset < text.length) {
    if (text[offset] !== '#') { offset++; continue }
    const matches = candidates.filter(item =>
      text.slice(offset + 1, offset + 1 + item.name.length).toLocaleLowerCase() === item.name.toLocaleLowerCase() &&
      !/[\p{L}\p{N}\p{M}]/u.test(text[offset + 1 + item.name.length] || ''))
    const best = matches[0]
    const unique = best && matches.filter(item => item.name.toLocaleLowerCase() === best.name.toLocaleLowerCase()).length === 1
    if (!unique) { offset++; continue }
    appendText(text.slice(plainStart, offset))
    const end = offset + 1 + best.name.length
    root.appendChild(createStudentMention(best.option, text.slice(offset + 1, end)))
    offset = end
    plainStart = end
  }
  appendText(text.slice(plainStart))
  return root.innerHTML
}

/** Retroceso/Supr elimina una mención adyacente completa, no letras de su nombre. */
export function removeAdjacentMention(editor, key) {
  const selection = window.getSelection()
  if (!selection?.rangeCount || !selection.isCollapsed) return false
  const caret = selection.getRangeAt(0)
  if (!editor.contains(caret.startContainer)) return false
  const backward = key === 'Backspace'
  const node = caret.startContainer
  let neighbor
  if (node.nodeType === Node.TEXT_NODE) {
    const edge = backward ? node.textContent.slice(0, caret.startOffset) : node.textContent.slice(caret.startOffset)
    if (/\S/.test(edge)) return false
    neighbor = backward ? node.previousSibling : node.nextSibling
  } else {
    neighbor = node.childNodes[caret.startOffset - (backward ? 1 : 0)]
  }
  while (neighbor?.nodeType === Node.TEXT_NODE && !/\S/.test(neighbor.textContent))
    neighbor = backward ? neighbor.previousSibling : neighbor.nextSibling
  if (!neighbor?.classList?.contains('pm-student-mention')) return false
  const range = caret.cloneRange()
  if (backward) range.setStartBefore(neighbor)
  else range.setEndAfter(neighbor)
  range.deleteContents()
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  return true
}
