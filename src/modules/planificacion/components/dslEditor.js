import { highlightDsl, parseDsl, TOKEN_COLORS } from '../utils/dslParser.js'

const DEBOUNCE_MS = 175

let debounceTimer = null
let isHighlighted = false
let lastContent = ''

export function createDslEditor(initialContent = '', onChange = null) {
  const container = document.createElement('div')
  container.className = 'dsl-editor-container'

  const editorWrapper = document.createElement('div')
  editorWrapper.className = 'dsl-editor-wrapper position-relative'

  const editor = document.createElement('div')
  editor.className = 'dsl-editor form-control'
  editor.contentEditable = 'true'
  editor.spellcheck = 'false'
  editor.setAttribute('data-placeholder', 'Escribe aquí usando notación DSL: #Alumno [Contenido] (Sugerencia) {Tarea} $Medida 4/5 >Objetivo')
  editor.innerHTML = initialContent ? highlightDsl(initialContent) : ''

  const highlightLayer = document.createElement('div')
  highlightLayer.className = 'dsl-highlight-layer position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none'
  highlightLayer.setAttribute('aria-hidden', 'true')

  editorWrapper.appendChild(highlightLayer)
  editorWrapper.appendChild(editor)
  container.appendChild(editorWrapper)

  setupStyles()

  function getPlainText() {
    return editor.innerText || editor.textContent || ''
  }

  function applyHighlight() {
    const text = getPlainText()

    if (text === lastContent) return
    lastContent = text
    isHighlighted = false

    highlightLayer.innerHTML = highlightDsl(text) + '<br>'
  }

  function syncScroll() {
    highlightLayer.scrollTop = editor.scrollTop
    highlightLayer.scrollLeft = editor.scrollLeft
  }

  function handleInput() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      applyHighlight()
      const parsed = parseDsl(getPlainText())
      if (onChange) {
        onChange(getPlainText(), parsed)
      }
    }, DEBOUNCE_MS)
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
    }
  }

  function handleScroll() {
    syncScroll()
  }

  editor.addEventListener('input', handleInput)
  editor.addEventListener('keydown', handleKeyDown)
  editor.addEventListener('scroll', handleScroll)

  editor.addEventListener('focus', () => {
    container.classList.add('focused')
  })

  editor.addEventListener('blur', () => {
    container.classList.remove('focused')
    applyHighlight()
  })

  function setContent(content) {
    editor.innerHTML = content ? highlightDsl(content) : ''
    lastContent = getPlainText()
    highlightLayer.innerHTML = highlightDsl(lastContent) + '<br>'
  }

  function getContent() {
    return getPlainText()
  }

  function getParsed() {
    return parseDsl(getPlainText())
  }

  function focus() {
    editor.focus()
  }

  function insertText(text) {
    editor.focus()
    document.execCommand('insertText', false, text)
  }

  function insertAtCursor(before, after = '') {
    editor.focus()
    const selection = window.getSelection()
    if (!selection.rangeCount) return

    const range = selection.getRangeAt(0)
    range.deleteContents()

    const beforeNode = document.createTextNode(before)
    const afterNode = document.createTextNode(after)

    range.insertNode(beforeNode)
    range.collapse(false)
    range.insertNode(afterNode)
    range.setStartAfter(beforeNode)
    range.setEndAfter(beforeNode)
    selection.removeAllRanges()
    selection.addRange(range)

    lastContent = getPlainText()
  }

  const component = {
    element: container,
    editor,
    setContent,
    getContent,
    getParsed,
    focus,
    insertText,
    insertAtCursor,
  }

  container.component = component
  container.setContent = setContent
  container.getContent = getContent
  container.getParsed = getParsed
  container.focus = focus
  container.insertText = insertText
  container.insertAtCursor = insertAtCursor

  if (initialContent) {
    lastContent = initialContent
  }

  return container
}

function setupStyles() {
  if (document.getElementById('dsl-editor-styles')) return

  const style = document.createElement('style')
  style.id = 'dsl-editor-styles'
  style.textContent = `
    .dsl-editor-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dsl-editor-wrapper {
      border-radius: 0.375rem;
      background: #fff;
    }

    .dsl-editor {
      min-height: 120px;
      max-height: 400px;
      overflow-y: auto;
      font-size: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      outline: none;
      padding: 0.75rem;
    }

    .dsl-editor:empty::before {
      content: attr(data-placeholder);
      color: #6c757d;
      pointer-events: none;
    }

    .dsl-editor-wrapper.focused .dsl-editor {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .dsl-highlight-layer {
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      padding: 0.75rem;
      color: transparent;
      background: transparent;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .dsl-highlight-layer .dsl-token {
      padding: 0.1em 0.2em;
      border-radius: 0.2em;
      font-weight: 500;
    }

    .dsl-highlight-layer .dsl-alumno {
      background: rgba(13, 110, 253, 0.15);
      color: #0d6efd;
    }

    .dsl-highlight-layer .dsl-contenido {
      background: rgba(25, 135, 84, 0.15);
      color: #198754;
    }

    .dsl-highlight-layer .dsl-sugerencia {
      background: rgba(253, 126, 20, 0.15);
      color: #fd7e14;
    }

    .dsl-highlight-layer .dsl-tarea {
      background: rgba(147, 51, 234, 0.15);
      color: #9333ea;
    }

    .dsl-highlight-layer .dsl-medida {
      background: rgba(109, 213, 237, 0.25);
      color: #0aa3c4;
    }

    .dsl-highlight-layer .dsl-calificacion {
      background: rgba(220, 53, 69, 0.15);
      color: #dc3545;
    }

    .dsl-highlight-layer .dsl-objetivo {
      background: rgba(108, 117, 125, 0.15);
      color: #6c757d;
      font-style: italic;
    }

    .dsl-editor::-webkit-scrollbar {
      width: 8px;
    }

    .dsl-editor::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .dsl-editor::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .dsl-editor::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `
  document.head.appendChild(style)
}

export function createDslEditorPlaceholder() {
  return createDslEditor('', null)
}