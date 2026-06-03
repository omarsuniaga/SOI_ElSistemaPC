import { highlightDSL } from '../utils/dslParser.js'
import autocompletePopup, {
  getCursorPosition,
  isOpen,
  handleKeyDown as acHandleKeyDown,
} from './AutocompletePopup.js'
import * as catalogService from '../services/catalogService.js'

const DSL_PLACEHOLDER_HTML = `
  <div class="pm-dsl-placeholder-title">✨ Escribí lo que pasó en clase con tus propias palabras</div>
  <div class="pm-dsl-placeholder-example" style="font-style:italic;color:var(--pm-text-muted,#888);font-size:0.85rem;margin-bottom:6px">
    "Yereni y Santa avanzaron muy bien hoy con el cambio de posición. Santiago necesita practicar más el arco."
  </div>
  <div class="pm-dsl-placeholder-guide">
    Presioná <strong>✨ Analizar con IA</strong> y Groq va a extraer los avances automáticamente. · O usá los tokens del toolbar si preferís escribir directo: # alumno · [] contenido · {} tarea
  </div>
`

/**
 * Componente: DslEditor
 * Editor con resaltado de sintaxis en tiempo real para el lenguaje DSL Pedagógico.
 *
 * Soporta inserción inteligente: cuando el toolbar inserta un token ([], (), {}),
 * el cursor se posiciona DENTRO de los brackets y se auto-dispara el autocompletado
 * correspondiente (contenidos, sugerencias, tareas, etc.).
 *
 * @param {HTMLElement} container
 * @param {{ initialContent: string, onChange: Function, onAlumnosNeeded: Function }} options
 */
export function createDslEditor(container, { initialContent = '', onChange, onAlumnosNeeded }) {
  let _value = initialContent
  let _isUpdating = false
  let _isComposing = false // blocks highlight during IME composition (mobile keyboards)
  let _context = {} // Para pasar contexto (claseId, nivelId, etc.)

  container.innerHTML = `
    <div class="pm-dsl-editor-container">
      <div 
        id="pm-dsl-editable" 
        class="pm-dsl-editable" 
        contenteditable="true" 
        spellcheck="false"
      ></div>
      <div class="pm-dsl-placeholder" id="pm-dsl-placeholder">${DSL_PLACEHOLDER_HTML}</div>
    </div>
  `

  const editor = container.querySelector('#pm-dsl-editable')
  const placeholder = container.querySelector('#pm-dsl-placeholder')

  // Tooltip element
  const tooltip = document.createElement('div')
  tooltip.className = 'dsl-tooltip'
  container.appendChild(tooltip)

  function _updateValue() {
    _value = editor.innerText
    placeholder.style.display = _value.trim() === '' ? 'block' : 'none'
    if (onChange) onChange(_value)
  }

  // Tooltip hover
  editor.addEventListener('mouseover', (e) => {
    const token = e.target.closest('.dsl-objetivo')
    if (token) {
      const obj = token.dataset.objetivo
      tooltip.textContent = `Objetivo: ${obj}`
      tooltip.style.display = 'block'
      const rect = token.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      tooltip.style.left = `${rect.left - containerRect.left}px`
      tooltip.style.top = `${rect.top - containerRect.top - 25}px`
    }
  })

  editor.addEventListener('mouseout', () => {
    tooltip.style.display = 'none'
  })

  function _applyHighlight() {
    if (_isUpdating) return
    // Skip highlight during IME composition (mobile keyboards) — prevents
    // innerHTML replacement from dismissing the virtual keyboard and blanking the screen.
    if (_isComposing) return
    _isUpdating = true

    try {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const offset = _getCaretOffset(editor, range)

      // Don't highlight if the editor doesn't have focus — prevents keyboard
      // dismissal on mobile when a background autosave triggers a re-render.
      if (document.activeElement !== editor) return

      // Save scroll position before innerHTML replacement.
      // On mobile, replacing innerHTML on a focused contenteditable causes the
      // browser to scroll the page to the top, making the screen appear blank.
      const savedScrollY = window.scrollY

      _value = editor.innerText
      editor.innerHTML = highlightDSL(_value)

      _setCaretOffset(editor, offset)

      // Restore scroll position after the DOM replacement.
      if (window.scrollY !== savedScrollY) {
        window.scrollTo({ top: savedScrollY, behavior: 'instant' })
      }
    } catch (err) {
      console.warn('[DSL] Error en highlight:', err)
      _value = editor.innerText
    } finally {
      _isUpdating = false
    }
  }

  // === AUTOCOMPLETADO INTELIGENTE ===

  /**
   * Detecta si hay un trigger de autocompletado en la posición del cursor
   * @returns {{ trigger: string, query: string }|null}
   */
  function _detectTrigger() {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return null

    const range = sel.getRangeAt(0)
    const preCaretRange = document.createRange()
    preCaretRange.selectNodeContents(editor)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    const textBeforeCursor = preCaretRange.toString()

    // Detectar último trigger (#, [, (, {, $, >)
    const triggerMatch = textBeforeCursor.match(/([#\[\(\{\$>])\s*([^\[\(\{\$]*)$/)

    if (triggerMatch) {
      return {
        trigger: triggerMatch[1],
        query: triggerMatch[2] || '',
      }
    }

    return null
  }

  // Guardamos el offset del caret ANTES de que el popup robe el foco.
  // Al hacer click en el popup el editor pierde el foco → getSelection() queda vacío.
  let _savedCaretOffset = null

  editor.addEventListener('mousedown', () => {
    // Al interactuar con el editor actualizamos la posición guardada
    _savedCaretOffset = null
  })

  /**
   * Guarda la posición actual del caret para recuperarla si el editor pierde el foco.
   */
  function _saveCaretOffset() {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    _savedCaretOffset = _getCaretOffset(editor, range)
  }

  /**
   * Restaura el foco y la posición del caret guardada.
   */
  function _restoreCaret() {
    editor.focus()
    if (_savedCaretOffset !== null) {
      _setCaretOffset(editor, _savedCaretOffset)
    }
  }

  /**
   * Muestra el popup de autocompletado.
   * @param {string|null} forceTrigger — Si se pasa, usa este trigger en vez de detectar
   */
  let _autocompleteDebounce = null
  async function _showAutocomplete(forceTrigger = null) {
    let trigger, query

    if (forceTrigger) {
      trigger = forceTrigger
      query = ''
    } else {
      const triggerData = _detectTrigger()
      if (!triggerData) {
        autocompletePopup.hide()
        return
      }
      trigger = triggerData.trigger
      query = triggerData.query
    }

    try {
      const options = await catalogService.getOptionsForTrigger(trigger, query, _context)

      if (options.length > 0) {
        const pos = getCursorPosition()
        if (pos) {
          // Guardar posición del caret ANTES de mostrar el popup
          _saveCaretOffset()
          autocompletePopup.show(
            options,
            (selected) => {
              _insertAutocomplete(selected, trigger, query)
            },
            { trigger, position: pos },
          )
        }
      } else {
        autocompletePopup.hide()
      }
    } catch (err) {
      console.warn('[DSL] Error en autocompletado:', err)
    }
  }

  /**
   * Inserta la opción seleccionada del autocompletado
   */
  function _insertAutocomplete(selected, trigger, query) {
    // Extraer texto plano del label (puede contener HTML del popup)
    const labelHtml =
      selected.nombre || selected.name || selected.label || selected.descripcion || ''
    const label = _stripHtml(labelHtml)

    // Construir el texto según el trigger
    let finalText = ''

    switch (trigger) {
      case '#':
        finalText = label
        break
      case '[':
        finalText = label + ']'
        break
      case '(':
        finalText = label + ')'
        break
      case '{':
        finalText = label + '}'
        break
      case '$':
        finalText = selected.codigo || label
        break
      case '>':
        if (selected.level_number) {
          finalText = `NIVEL-${selected.level_number}`
        } else if (selected.type) {
          finalText = `NODO:${selected.type}`
        } else {
          finalText = label
        }
        break
    }

    // El editor puede haber perdido el foco al hacer click en el popup.
    // Restauramos el caret guardado antes de insertar.
    _restoreCaret()

    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) {
      console.warn('[DSL] Sin selección activa al insertar autocomplete')
      return
    }

    // Si hay query parcial escrito después del trigger, borrarlo primero
    if (query.length > 0) {
      const range = sel.getRangeAt(0)
      const preCaretRange = document.createRange()
      preCaretRange.selectNodeContents(editor)
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      const textBeforeCursor = preCaretRange.toString()
      const queryStart = textBeforeCursor.length - query.length

      try {
        const deleteRange = document.createRange()
        _setRangeFromOffset(editor, deleteRange, queryStart, textBeforeCursor.length)
        deleteRange.deleteContents()
      } catch (e) {
        console.warn('[DSL] Error limpiando query parcial:', e)
      }
    }

    // Insertar el texto final
    _insertRawText(finalText + ' ')

    // Registrar la selección para fuzzy search
    catalogService.recordSelection(trigger, label)
  }

  /**
   * Helper: establece un Range basado en offsets de texto plano
   */
  function _setRangeFromOffset(element, range, startOffset, endOffset) {
    let charCount = 0
    const nodeStack = [element]
    let startSet = false

    while (nodeStack.length > 0) {
      const node = nodeStack.pop()
      if (node.nodeType === 3) {
        const nextCount = charCount + node.length
        if (!startSet && startOffset <= nextCount) {
          range.setStart(node, startOffset - charCount)
          startSet = true
        }
        if (startSet && endOffset <= nextCount) {
          range.setEnd(node, endOffset - charCount)
          return
        }
        charCount = nextCount
      } else {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          nodeStack.push(node.childNodes[i])
        }
      }
    }
  }

  function _stripHtml(str) {
    if (!str) return ''
    const d = document.createElement('div')
    d.innerHTML = str
    return d.textContent || d.innerText || ''
  }

  /**
   * Inserta texto plano en la posición actual del cursor (sin mover ni re-posicionar).
   */
  function _insertRawText(text) {
    const clean = _stripHtml(text)
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const textNode = document.createTextNode(clean)
    range.insertNode(textNode)
    range.setStartAfter(textNode)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    _updateValue()
    _applyHighlight()
  }

  // === FIN AUTOCOMPLETADO ===

  // Helpers para el cursor (Caret) en contenteditable
  function _getCaretOffset(element, range) {
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(element)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    return preCaretRange.toString().length
  }

  function _setCaretOffset(element, offset) {
    const range = document.createRange()
    const sel = window.getSelection()
    if (!sel) return

    let charCount = 0
    let nodeStack = [element]
    let node,
      found = false

    while (nodeStack.length > 0 && !found) {
      node = nodeStack.pop()
      if (node.nodeType === 3) {
        const nextCharCount = charCount + node.length
        if (offset <= nextCharCount) {
          range.setStart(node, offset - charCount)
          range.collapse(true)
          found = true
        }
        charCount = nextCharCount
      } else {
        let i = node.childNodes.length
        while (i--) {
          nodeStack.push(node.childNodes[i])
        }
      }
    }

    sel.removeAllRanges()
    sel.addRange(range)
  }

  // IME composition guards — prevent innerHTML replacement while the mobile
  // keyboard is mid-composition (e.g. predictive text, accent pickers).
  editor.addEventListener('compositionstart', () => {
    _isComposing = true
  })
  editor.addEventListener('compositionend', () => {
    _isComposing = false
    clearTimeout(_debounceTimer)
    _debounceTimer = setTimeout(_applyHighlight, 300)
  })

  // On mobile, only highlight on blur to prevent innerHTML replacement from
  // dismissing the virtual keyboard during active typing.
  const _isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
  let _lastHighlightedText = ''
  let _debounceTimer = null

  if (_isMobile) {
    editor.addEventListener('blur', () => {
      if (_value === _lastHighlightedText) return
      _lastHighlightedText = _value
      _applyHighlight()
    })
  }

  editor.oninput = () => {
    _updateValue()

    // On desktop, highlight with debounce during typing.
    // On mobile, skip entirely — highlight runs only on blur above.
    if (!_isMobile) {
      clearTimeout(_debounceTimer)
      _debounceTimer = setTimeout(() => {
        if (_value === _lastHighlightedText) return
        _lastHighlightedText = _value
        _applyHighlight()
      }, 300)
    }

    // Autocompletado con debounce
    clearTimeout(_autocompleteDebounce)
    _autocompleteDebounce = setTimeout(() => _showAutocomplete(), 300)
  }

  // Keyboard navigation para el popup de autocompletado
  editor.addEventListener('keydown', (e) => {
    if (isOpen()) {
      acHandleKeyDown(e)
    }
  })

  // BLOQUEAR PASTE DE IMÁGENES - evita error "this model does not support image input"
  editor.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    const hasImage = Array.from(items).some((item) => item.type && item.type.startsWith('image/'))

    if (hasImage) {
      e.preventDefault()
      const msg = document.createElement('div')
      msg.className = 'pm-toast-image-blocked'
      msg.textContent =
        '🚫 No puedes pegar imágenes. Usa 🎤 para grabar audio o describe el contenido.'
      msg.style.cssText =
        'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#dc3545; color:white; padding:12px 20px; border-radius:8px; z-index:10000; font-size:14px;'
      document.body.appendChild(msg)
      setTimeout(() => msg.remove(), 4000)
    }
  })

  /**
   * API Pública: Inserta texto en la posición actual del cursor.
   *
   * @param {string} text — El texto a insertar (ej: "[]", "()", "{}", "#", "$", ">")
   * @param {number} cursorOffset — Dónde posicionar el cursor dentro del texto insertado.
   *   0 = después del texto, 1 = un caracter desde el inicio (dentro de brackets)
   * @param {string|null} triggerAC — Si se pasa, auto-dispara autocomplete para este trigger
   */
  function insertText(text, cursorOffset = 0, triggerAC = null) {
    editor.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    range.deleteContents()
    const cleanText = _stripHtml(text)
    const textNode = document.createTextNode(cleanText)
    range.insertNode(textNode)

    // Posicionar cursor: cursorOffset = 1 pone el cursor DENTRO de [] () {}
    if (cursorOffset > 0 && cursorOffset < text.length) {
      const newRange = document.createRange()
      newRange.setStart(textNode, cursorOffset)
      newRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(newRange)
    } else {
      range.setStartAfter(textNode)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    }

    _updateValue()
    _applyHighlight()

    // Auto-disparar autocomplete si el toolbar lo solicita
    if (triggerAC) {
      // Pequeño delay para que el cursor se estabilice después del highlight
      setTimeout(() => _showAutocomplete(triggerAC), 50)
    }
  }

  // Inicializar
  if (initialContent) {
    editor.innerText = initialContent
    _updateValue()
    _applyHighlight()
  }

  return {
    insertText,
    getValue: () => _value,
    setValue: (newContent) => {
      editor.innerText = newContent
      _updateValue()
      _applyHighlight()
    },
    setContext: (context) => {
      _context = context
    },
  }
}
