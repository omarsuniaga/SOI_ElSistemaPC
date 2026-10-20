import { getAutocompleteTarget, replaceAutocompleteTarget, renderMentionMarkup, removeAdjacentMention } from './editorMentions.js'
import autocompletePopup, {
  getCursorPosition,
  isOpen,
  handleKeyDown as acHandleKeyDown,
} from './AutocompletePopup.js'
import * as catalogService from '../services/catalogService.js'

const DSL_PLACEHOLDER_HTML = `
  <div class="pm-dsl-placeholder-title">Registra qué trabajaron y cómo les fue</div>
  <div class="pm-dsl-placeholder-example" style="font-style:italic;color:var(--pm-text-muted,#888);font-size:0.85rem;margin-bottom:6px">
    "Yereni y Santa avanzaron muy bien hoy con el cambio de posición. Santiago necesita practicar más el arco."
  </div>
  <div class="pm-dsl-placeholder-guide">
    Escribe o dicta con el micrófono. <strong>✨ IA</strong> propone una redacción para revisar y te ayuda a confirmar para quién es. Usa <strong># alumno · [] contenido · () reforzar · {} tarea</strong>. Después valora a los presentes; la IA no pone estrellas por ti.
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
  let _destroyed = false
  let _autocompleteRequest = 0
  let _activeAutocompleteTarget = null
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
      <button class="pm-dsl-help-toggle" id="pm-dsl-help-toggle" title="Mostrar/Ocultar ayuda" aria-label="Mostrar/Ocultar ayuda">?</button>
    </div>
  `

  const editor = container.querySelector('#pm-dsl-editable')
  const placeholder = container.querySelector('#pm-dsl-placeholder')
  const helpToggle = container.querySelector('#pm-dsl-help-toggle')

  // Help toggle (mobile: hide placeholder by default, show with button click)
  let _helpVisible = window.innerWidth >= 768 // visible on desktop by default

  /**
   * Unifica ambas condiciones: placeholder visible solo si help está activo Y content está vacío.
   */
  function _updatePlaceholderVisibility() {
    const show = _helpVisible && _value.trim() === ''
    placeholder.style.display = show ? 'block' : 'none'
  }

  _updatePlaceholderVisibility()
  if (helpToggle) {
    helpToggle.addEventListener('click', (e) => {
      e.stopPropagation()
      _helpVisible = !_helpVisible
      _updatePlaceholderVisibility()
      helpToggle.classList.toggle('active', _helpVisible)
    })
  }

  // Tooltip element
  const tooltip = document.createElement('div')
  tooltip.className = 'dsl-tooltip'
  container.appendChild(tooltip)

  function _updateValue() {
    _value = editor.innerText ?? editor.textContent ?? ''
    _updatePlaceholderVisibility()
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
    // Replacing innerHTML in a focused contenteditable changes the browser's
    // line-break nodes. After Enter that can restore the caret on the prior
    // line, so highlighting is intentionally deferred until blur.
    if (_isComposing || _destroyed || isOpen()) return
    if (document.activeElement === editor) return
    _isUpdating = true

    try {
      // The editor has no focus here, so there is no caret to preserve.
      const savedScrollY = window.scrollY

      _value = editor.innerText ?? editor.textContent ?? ''
      editor.innerHTML = renderMentionMarkup(_value, _context.getAlumnos?.() || [])

      if (window.scrollY !== savedScrollY) {
        window.scrollTo({ top: savedScrollY, behavior: 'instant' })
      }
    } catch (err) {
      console.warn('[DSL] Error en highlight:', err)
      _value = editor.innerText ?? editor.textContent ?? ''
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
    return getAutocompleteTarget(editor)
  }

  let _savedCaretOffset = null
  let _savedRange = null

  /**
   * Guarda la posición actual del caret/rango para preservarla ante clics en la barra de herramientas o popups.
   */
  function _saveCaretOffset() {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (!editor.contains(range.commonAncestorContainer) && range.commonAncestorContainer !== editor) return
    _savedRange = range.cloneRange()
    _savedCaretOffset = _getCaretOffset(editor, range)
  }

  editor.addEventListener('mouseup', _saveCaretOffset)
  editor.addEventListener('keyup', _saveCaretOffset)
  editor.addEventListener('touchend', _saveCaretOffset)
  function _onSelectionChange() {
    if (document.activeElement !== editor || _destroyed) return
    _saveCaretOffset()
    if (_activeAutocompleteTarget && _savedCaretOffset !== _activeAutocompleteTarget.end) _cancelAutocomplete()
  }
  document.addEventListener('selectionchange', _onSelectionChange)
  function _onOutsidePointer(event) {
    if (!container.contains(event.target) && !event.target.closest?.('#pm-autocomplete-popup')) _cancelAutocomplete()
  }
  document.addEventListener('pointerdown', _onOutsidePointer)

  /**
   * Restaura el foco y la posición del caret guardada.
   */
  function _restoreCaret() {
    const selection = window.getSelection()
    if (document.activeElement === editor && selection?.rangeCount &&
        editor.contains(selection.getRangeAt(0).commonAncestorContainer)) return
    const storedOffset = _savedCaretOffset
    editor.focus()
    if (storedOffset !== null) _setCaretOffset(editor, storedOffset)
    else {
      const end = document.createRange()
      end.selectNodeContents(editor)
      end.collapse(false)
      selection.removeAllRanges()
      selection.addRange(end)
    }
  }

  /**
   * Muestra el popup de autocompletado.
   * @param {string|null} forceTrigger — Si se pasa, usa este trigger en vez de detectar
   */
  let _autocompleteDebounce = null
  let _triggerTimer = null
  function _cancelAutocomplete() {
    _autocompleteRequest++
    _activeAutocompleteTarget = null
    clearTimeout(_autocompleteDebounce)
    clearTimeout(_triggerTimer)
    autocompletePopup.hide()
    editor.setAttribute('aria-expanded', 'false')
  }

  async function _showAutocomplete(forceTrigger = null) {
    if (_destroyed || _isComposing) return
    const target = _detectTrigger()
    if (!target || (forceTrigger && target.trigger !== forceTrigger)) {
      _cancelAutocomplete()
      return
    }
    const request = ++_autocompleteRequest
    const pos = getCursorPosition()
    _saveCaretOffset()
    if (!pos) return
    try {
      const options = await catalogService.getOptionsForTrigger(target.trigger, target.query, _context)
      if (_destroyed || request !== _autocompleteRequest || editor.textContent !== target.snapshot) return
      const current = _detectTrigger()
      if (!current || current.start !== target.start || current.end !== target.end) return
      if (!options.length) { _cancelAutocomplete(); return }
      _activeAutocompleteTarget = target
      editor.setAttribute('aria-controls', 'pm-autocomplete-popup')
      editor.setAttribute('aria-expanded', 'true')
      autocompletePopup.show(options, selected => {
        if (_destroyed || request !== _autocompleteRequest) return
        if (!replaceAutocompleteTarget(editor, target, selected)) { _cancelAutocomplete(); return }
        _cancelAutocomplete()
        _saveCaretOffset()
        _updateValue()
        const label = selected.nombre_completo || selected.nombre || selected.name || selected.label || ''
        Promise.resolve(catalogService.recordSelection(target.trigger, label)).catch(() => {})
      }, { trigger: target.trigger, position: pos })
    } catch (error) {
      if (request === _autocompleteRequest) _cancelAutocomplete()
      console.warn('[DSL] Error en autocompletado:', error)
    }
  }

  function _stripHtml(str) {
    if (!str) return ''
    const d = document.createElement('div')
    d.innerHTML = str
    return d.textContent || d.innerText || ''
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
    range.selectNodeContents(element)
    range.collapse(false)

    let charCount = 0
    let nodeStack = [element]
    let node,
      found = false

    while (nodeStack.length > 0 && !found) {
      node = nodeStack.pop()
      if (node.nodeType === 3) {
        const nextCharCount = charCount + node.length
        if (offset <= nextCharCount) {
          const chip = node.parentElement?.closest('.pm-student-mention')
          if (chip) {
            if (offset - charCount === 0) range.setStartBefore(chip)
            else range.setStartAfter(chip)
          } else range.setStart(node, offset - charCount)
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

  // IME composition guards for predictive text and accent pickers.
  editor.addEventListener('compositionstart', () => {
    _isComposing = true
    _cancelAutocomplete()
  })
  editor.addEventListener('compositionend', () => {
    _isComposing = false
    clearTimeout(_debounceTimer)
  })

  let _lastHighlightedText = ''
  let _debounceTimer = null

  editor.addEventListener('blur', () => {
    if (_value === _lastHighlightedText) return
    _lastHighlightedText = _value
    _applyHighlight()
  })

  editor.oninput = () => {
    _autocompleteRequest++
    _activeAutocompleteTarget = null
    _updateValue()

    // Keep the text node tree stable while typing. Highlighting occurs on blur.
    clearTimeout(_debounceTimer)

    // Autocompletado con debounce
    clearTimeout(_autocompleteDebounce)
    if (!_isComposing) _autocompleteDebounce = setTimeout(() => _showAutocomplete(), 200)
  }

  // Keyboard navigation para el popup de autocompletado
  editor.addEventListener('keydown', (e) => {
    if (isOpen()) {
      acHandleKeyDown(e)
      if (!isOpen()) editor.setAttribute('aria-expanded', 'false')
      if (e.defaultPrevented) return
    }
    if (['Backspace', 'Delete'].includes(e.key) && removeAdjacentMention(editor, e.key)) {
      e.preventDefault()
      _cancelAutocomplete()
      _saveCaretOffset()
      _updateValue()
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
        'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#dc3545; color:white; padding:12px 20px; border-radius:8px; z-index:10000; font-size:0.875rem;'
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
    if (_destroyed) return
    _cancelAutocomplete()
    _restoreCaret()
    const sel = window.getSelection()
    if (!sel) return

    let range = null
    if (sel.rangeCount > 0 && (editor.contains(sel.getRangeAt(0).commonAncestorContainer) || sel.getRangeAt(0).commonAncestorContainer === editor)) {
      range = sel.getRangeAt(0)
    } else if (_savedRange && (editor.contains(_savedRange.commonAncestorContainer) || _savedRange.commonAncestorContainer === editor)) {
      range = _savedRange.cloneRange()
      sel.removeAllRanges()
      sel.addRange(range)
    } else if (_savedCaretOffset !== null) {
      _setCaretOffset(editor, _savedCaretOffset)
      if (sel.rangeCount > 0) range = sel.getRangeAt(0)
    }

    if (!range) {
      const endRange = document.createRange()
      endRange.selectNodeContents(editor)
      endRange.collapse(false)
      sel.removeAllRanges()
      sel.addRange(endRange)
      range = endRange
    }

    const selectedText = range.toString()
    let cleanText = _stripHtml(text)
    if (cleanText === '#' && range.collapsed) {
      const pending = _detectTrigger()
      if (pending?.trigger === '#') {
        _triggerTimer = setTimeout(() => _showAutocomplete('#'), 0)
        return
      }
      const before = range.cloneRange()
      before.selectNodeContents(editor)
      before.setEnd(range.startContainer, range.startOffset)
      if (before.toString() && !/\s$/.test(before.toString())) cleanText = ' #'
    }

    // Si el usuario tenía texto seleccionado y presiona [], (), {}, envolver el texto!
    if (selectedText.length > 0 && cleanText.length === 2 && ['[]', '()', '{}'].includes(cleanText)) {
      const openChar = cleanText[0]
      const closeChar = cleanText[1]
      const wrapped = openChar + selectedText + closeChar
      range.deleteContents()
      const textNode = document.createTextNode(wrapped)
      range.insertNode(textNode)
      const afterRange = document.createRange()
      afterRange.setStartAfter(textNode)
      afterRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(afterRange)
      _savedRange = afterRange.cloneRange()
      _savedCaretOffset = _getCaretOffset(editor, afterRange)
      _updateValue()
      return
    }

    range.deleteContents()
    const textNode = document.createTextNode(cleanText)
    range.insertNode(textNode)

    // Posicionar cursor: cursorOffset = 1 pone el cursor DENTRO de [] () {}
    const newRange = document.createRange()
    if (cursorOffset > 0 && cursorOffset < cleanText.length) {
      newRange.setStart(textNode, cursorOffset)
      newRange.collapse(true)
    } else {
      newRange.setStartAfter(textNode)
      newRange.collapse(true)
    }
    sel.removeAllRanges()
    sel.addRange(newRange)
    _savedRange = newRange.cloneRange()
    _savedCaretOffset = _getCaretOffset(editor, newRange)

    _updateValue()

    // Auto-disparar autocomplete SOLO si triggerAC fue solicitado
    if (triggerAC) {
      _triggerTimer = setTimeout(() => _showAutocomplete(triggerAC), 50)
    }
  }

  // Inicializar
  if (initialContent) {
    editor.innerText = initialContent
    _updateValue()
    _applyHighlight()
  }

  return {
    destroy() {
      _destroyed = true
      _cancelAutocomplete()
      clearTimeout(_debounceTimer)
      document.removeEventListener('selectionchange', _onSelectionChange)
      document.removeEventListener('pointerdown', _onOutsidePointer)
      editor.oninput = null
    },
    insertText,
    getValue: () => _value,
    setValue: (newContent) => {
      _cancelAutocomplete()
      const nextValue = String(newContent || '')
      if (nextValue === _value) return
      _savedRange = null
      _savedCaretOffset = null
      editor.innerText = nextValue
      _updateValue()
      _applyHighlight()
    },
    setContext: (context) => {
      _context = context
      _applyHighlight()
    },
  }
}
