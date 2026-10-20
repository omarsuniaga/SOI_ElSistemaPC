import { describe, it, expect } from 'vitest'
import { createStudentMention, getAutocompleteTarget, replaceAutocompleteTarget, renderMentionMarkup } from '../editorMentions.js'

function setup(text, offset = text.length) {
  const editor = document.createElement('div')
  editor.contentEditable = 'true'
  editor.setAttribute('contenteditable', 'true')
  editor.textContent = text
  document.body.appendChild(editor)
  editor.focus()
  const range = document.createRange()
  range.setStart(editor.firstChild, offset)
  range.collapse(true)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  return editor
}

describe('mention DOM boundaries', () => {
  it('replaces a partial name in the middle without losing surrounding prose', () => {
    const editor = setup('Antes #Sa y después', 'Antes #Sa'.length)
    const target = getAutocompleteTarget(editor)
    expect(target.query).toBe('Sa')
    expect(replaceAutocompleteTarget(editor, target, { id: 's', nombre: 'Santa Castillo' })).toBe(true)
    expect(editor.textContent).toBe('Antes #Santa Castillo  y después')
    expect(editor.querySelector('.pm-student-mention').dataset.studentId).toBe('s')
    editor.remove()
  })
  it('treats completed tags as atoms rather than unfinished #queries', () => {
    const editor = document.createElement('div')
    document.body.appendChild(editor)
    editor.appendChild(createStudentMention({ id: 's', nombre: 'Santa Castillo' }))
    const spacer = document.createTextNode(' ')
    editor.appendChild(spacer)
    const range = document.createRange()
    range.setStart(spacer, 1); range.collapse(true)
    window.getSelection().removeAllRanges(); window.getSelection().addRange(range)
    expect(getAutocompleteTarget(editor)).toBeNull()
    editor.remove()
  })
  it('consumes repeated pending hashes as one trigger', () => {
    const editor = setup('##')
    expect(replaceAutocompleteTarget(editor, getAutocompleteTarget(editor), { id: 's', nombre: 'Santa Castillo' })).toBe(true)
    expect(editor.textContent).toBe('#Santa Castillo ')
    editor.remove()
  })
  it('consumes the existing closing bracket exactly once', () => {
    const editor = setup('[]', 1)
    replaceAutocompleteTarget(editor, getAutocompleteTarget(editor), { nombre: 'Escala de Do' })
    expect(editor.textContent).toBe('[Escala de Do] ')
    editor.remove()
  })
  it('does not insert into a changed source snapshot', () => {
    const editor = setup('#Sa')
    const target = getAutocompleteTarget(editor)
    editor.textContent = 'Otra observación'
    expect(replaceAutocompleteTarget(editor, target, { id: 's', nombre: 'Santa Castillo' })).toBe(false)
    expect(editor.textContent).toBe('Otra observación')
    editor.remove()
  })
  it('rehydrates exact known names and preserves all plain text', () => {
    const source = '#Ana O’Brian [Escala] #todos {Practicar}'
    const html = renderMentionMarkup(source, [{ id: 'a', nombre: 'Ana O’Brian' }])
    const root = document.createElement('div'); root.innerHTML = html
    expect(root.textContent).toBe(source)
    expect([...root.querySelectorAll('.pm-student-mention')].map(node => node.dataset.studentId)).toEqual(['a', 'todos'])
  })
  it('does not silently resolve duplicate full names', () => {
    const root = document.createElement('div')
    root.innerHTML = renderMentionMarkup('#Ana Pérez [Escala]', [{ id: 'a', nombre: 'Ana Pérez' }, { id: 'b', nombre: 'Ana Pérez' }])
    expect(root.querySelector('.pm-student-mention')).toBeNull()
  })
})
