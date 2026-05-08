// Global modal singleton — lives in <body>, never touched by the router.
// Usage:
//   AppModal.open({ title, body, onSave, onCancel, saveText, size })
//   AppModal.close()

const MODAL_ID = 'app-global-modal'
const BACKDROP_ID = 'app-global-backdrop'

function ensureDOM() {
  if (document.getElementById(MODAL_ID)) return

  // Backdrop
  const backdrop = document.createElement('div')
  backdrop.id = BACKDROP_ID
  backdrop.style.cssText = `
    display:none;position:fixed;inset:0;
    background:rgba(0,0,0,0.55);
    backdrop-filter:blur(2px);
    z-index:1200;
    transition:opacity .2s ease;
    opacity:0;
  `
  document.body.appendChild(backdrop)

  // Modal shell
  const modal = document.createElement('div')
  modal.id = MODAL_ID
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.style.cssText = `
    display:none;position:fixed;inset:0;
    z-index:1201;
    overflow-y:auto;
    padding:1.5rem;
    align-items:center;
    justify-content:center;
  `
  modal.innerHTML = `
    <div class="app-modal-dialog" style="
      background:var(--bs-body-bg);
      border-radius:0.75rem;
      box-shadow:0 20px 50px rgba(0,0,0,0.35);
      width:100%;
      max-width:480px;
      margin:auto;
      transform:translateY(20px) scale(0.97);
      transition:transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s ease;
      opacity:0;
      overflow:hidden;
    ">
      <!-- Header -->
      <div class="app-modal-header" style="
        padding:0.75rem 1rem 0.5rem;
        border-bottom:1px solid var(--bs-border-color);
        display:flex;align-items:center;gap:.5rem;
      ">
        <h5 class="app-modal-title mb-0 fw-semibold" style="flex:1;font-size:0.95rem;"></h5>
        <button class="app-modal-close-x" type="button" aria-label="Cerrar" style="
          background:none;border:none;cursor:pointer;
          width:28px;height:28px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:var(--bs-secondary-color);
          transition:background .15s,color .15s;
          flex-shrink:0;
        ">
          <i class="bi bi-x-lg" style="font-size:.85rem;"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="app-modal-body" style="padding:0.75rem;"></div>

      <!-- Footer -->
      <div class="app-modal-footer" style="
        padding:0.5rem 1rem;
        border-top:1px solid var(--bs-border-color);
        display:flex;align-items:center;justify-content:flex-end;gap:.35rem;
      ">
        <button class="app-modal-btn-cancel btn btn-secondary btn-sm px-3" type="button">Cancelar</button>
        <button class="app-modal-btn-save btn btn-primary btn-sm px-4" type="button">
          <span class="app-modal-save-text">Guardar</span>
        </button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
}

function escapeHTML(text) {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function getEls() {
  return {
    backdrop: document.getElementById(BACKDROP_ID),
    modal:    document.getElementById(MODAL_ID),
    dialog:   document.querySelector(`#${MODAL_ID} .app-modal-dialog`),
    title:    document.querySelector(`#${MODAL_ID} .app-modal-title`),
    body:     document.querySelector(`#${MODAL_ID} .app-modal-body`),
    closeX:   document.querySelector(`#${MODAL_ID} .app-modal-close-x`),
    btnCancel:document.querySelector(`#${MODAL_ID} .app-modal-btn-cancel`),
    btnSave:  document.querySelector(`#${MODAL_ID} .app-modal-btn-save`),
    saveText: document.querySelector(`#${MODAL_ID} .app-modal-save-text`),
  }
}

// Sizes
const SIZES = { sm: '400px', md: '520px', lg: '720px', xl: '960px' }

export const AppModal = {
  _saveHandler: null,
  _cancelHandler: null,

  open({ title = '', body = '', saveText = 'Guardar', cancelText = 'Cancelar', onSave = null, onCancel = null, onShow = null, size = 'md', hideSave = false } = {}) {
    ensureDOM()
    const els = getEls()

    // Size
    els.dialog.style.maxWidth = SIZES[size] || SIZES.md

    // Content
    els.title.textContent = title
    if (typeof body === 'string') {
      els.body.innerHTML = body
    } else if (body instanceof HTMLElement) {
      els.body.innerHTML = ''
      els.body.appendChild(body)
    }

    if (onShow) onShow(els.body)

    // Buttons
    this.resetSaveBtn(saveText)
    els.btnCancel.textContent = cancelText
    els.btnSave.style.display = hideSave ? 'none' : ''

    // Trap focus on first input when open
    setTimeout(() => {
      const first = els.body.querySelector('input,select,textarea')
      if (first) first.focus()
    }, 280)

    // Wire handlers — remove old ones first
    this._detachHandlers()

    this._saveHandler = async () => {
      if (onSave) {
        const btn = els.btnSave
        const original = btn.innerHTML
        btn.disabled = true
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>'
      try {
        const result = await onSave(els.body)
        if (result !== false) {
          this.close()
        } else {
          btn.disabled = false
          btn.innerHTML = original
        }
      } catch (err) {
        btn.disabled = false
        btn.innerHTML = original
      }
      } else {
        this.close()
      }
    }

    this._cancelHandler = () => {
      if (onCancel) onCancel()
      this.close()
    }

    els.btnSave.addEventListener('click', this._saveHandler)
    els.btnCancel.addEventListener('click', this._cancelHandler)
    els.closeX.addEventListener('click', this._cancelHandler)

    // Close-X hover style
    els.closeX.onmouseenter = () => { els.closeX.style.background = 'var(--bs-secondary-bg)'; els.closeX.style.color = 'var(--bs-body-color)' }
    els.closeX.onmouseleave = () => { els.closeX.style.background = 'none'; els.closeX.style.color = 'var(--bs-secondary-color)' }

    // Show
    els.backdrop.style.display = 'block'
    els.modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      els.backdrop.style.opacity = '1'
      els.dialog.style.opacity = '1'
      els.dialog.style.transform = 'translateY(0) scale(1)'
    })
  },

  close() {
    if (!document.getElementById(MODAL_ID)) return
    const els = getEls()

    els.backdrop.style.opacity = '0'
    els.dialog.style.opacity = '0'
    els.dialog.style.transform = 'translateY(20px) scale(0.97)'

    setTimeout(() => {
      els.backdrop.style.display = 'none'
      els.modal.style.display = 'none'
      els.body.innerHTML = ''
      document.body.style.overflow = ''
      this._detachHandlers()
    }, 220)
  },

  _detachHandlers() {
    const els = getEls()
    if (!els.btnSave) return
    if (this._saveHandler) els.btnSave.removeEventListener('click', this._saveHandler)
    if (this._cancelHandler) {
      els.btnCancel.removeEventListener('click', this._cancelHandler)
      els.closeX.removeEventListener('click', this._cancelHandler)
    }
    this._saveHandler = null
    this._cancelHandler = null
  },

  // Reset save button after error (call from onSave catch if you handle errors yourself)
  resetSaveBtn(text = 'Guardar') {
    const btn = document.querySelector(`#${MODAL_ID} .app-modal-btn-save`)
    if (btn) { btn.disabled = false; btn.innerHTML = `<span class="app-modal-save-text">${text}</span>` }
  },

  setSaveHandler(newOnSave, newText = null) {
    const els = getEls()
    if (!els.btnSave) return

    // Detach old handler
    if (this._saveHandler) els.btnSave.removeEventListener('click', this._saveHandler)

    // Update text if provided
    if (newText) this.resetSaveBtn(newText)

    // Wrap new handler
    this._saveHandler = async () => {
      const btn = els.btnSave
      const original = btn.innerHTML
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>'
      try {
        const result = await newOnSave(els.body)
        if (result !== false) {
          this.close()
        } else {
          btn.disabled = false
          btn.innerHTML = original
        }
      } catch (err) {
        btn.disabled = false
        btn.innerHTML = original
      }
    }

    els.btnSave.addEventListener('click', this._saveHandler)
  },

  showLoading(message = 'Cargando...') {
    const els = getEls()
    if (!els.body) return

    els.body.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted mb-0">${escapeHTML(message)}</p>
      </div>
    `

    els.btnSave.style.display = 'none'
    els.btnCancel.style.display = 'none'
  },

  hideLoading() {
    const els = getEls()
    if (!els.btnSave) return
    els.btnSave.style.display = ''
    els.btnCancel.style.display = ''
  }
}
