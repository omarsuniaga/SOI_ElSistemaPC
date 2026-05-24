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
    background:var(--pm-backdrop, rgba(0,0,0,0.55));
    backdrop-filter:blur(4px);
    z-index:2000;
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
    z-index:2001;
    overflow-y:auto;
    padding:1.5rem;
    align-items:center;
    justify-content:center;
  `
  modal.innerHTML = `
    <div class="app-modal-dialog" style="
      background:var(--pm-surface, var(--bs-body-bg, #ffffff));
      color:var(--pm-text, var(--bs-body-color, #212529));
      border:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
      border-radius:16px;
      box-shadow:0 20px 60px rgba(0,0,0,0.2);
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
        padding:1rem 1.25rem;
        border-bottom:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
        display:flex;align-items:center;gap:.5rem;
        background: linear-gradient(135deg, var(--pm-primary, var(--bs-primary, #0d6efd)) 0%, #5856d6 100%);
      ">
        <h5 class="app-modal-title mb-0 fw-bold" style="flex:1;font-size:1.0625rem;color:white;font-weight:600;letter-spacing:-0.01em;"></h5>
        <button class="app-modal-close-x" type="button" aria-label="Cerrar" style="
          background:rgba(255,255,255,0.15);border:none;cursor:pointer;
          width:28px;height:28px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:white;
          transition:all .15s;
          flex-shrink:0;
        ">
          <i class="bi bi-x-lg" style="font-size:0.875rem;"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="app-modal-body" style="padding:1.25rem; background:var(--pm-surface, var(--bs-body-bg, #ffffff));"></div>

      <!-- Footer -->
      <div class="app-modal-footer" style="
        padding:1rem 1.25rem;
        border-top:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
        display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
        background:var(--pm-surface-2, var(--bs-tertiary-bg, #f8f9fa));
      ">
        <button class="app-modal-btn-delete pm-btn" type="button" style="background:none; border:none; color:var(--pm-danger, var(--bs-danger, #dc3545)); font-size:0.85rem; font-weight:600; padding:0.5rem 1rem; cursor:pointer; margin-right:auto; display:none;">Eliminar</button>
        <button class="app-modal-btn-cancel pm-btn pm-btn-outline" type="button">Cancelar</button>
        <button class="app-modal-btn-save pm-btn pm-btn-primary" type="button">
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
    btnDelete:document.querySelector(`#${MODAL_ID} .app-modal-btn-delete`),
    saveText: document.querySelector(`#${MODAL_ID} .app-modal-save-text`),
  }
}

// Sizes
const SIZES = { sm: '400px', md: '520px', lg: '720px', xl: '960px' }

export const AppModal = {
  _saveHandler: null,
  _cancelHandler: null,
  _keydownHandler: null,

  open({ title = '', body = '', saveText = 'Guardar', cancelText = 'Cancelar', deleteText = 'Eliminar', onSave = null, onCancel = null, onDelete = null, onShow = null, onOpen = null, size = 'md', hideSave = false } = {}) {
    ensureDOM()
    const els = getEls()

    // Reset footer visibility so a previous call with `!important` inline
    // style cannot bleed into this new modal (e.g. profile modal hiding footer).
    const footer = els.dialog.querySelector('.app-modal-footer')
    if (footer) footer.style.removeProperty('display')

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

    // onOpen fires async after the animation completes (useful for async data loads)
    if (onOpen) setTimeout(() => onOpen(els.body), 280)

    // Buttons
    this.resetSaveBtn(saveText)
    els.btnCancel.textContent = cancelText
    els.btnSave.style.display = hideSave ? 'none' : ''
    
    // Delete btn logic
    if (onDelete) {
      els.btnDelete.textContent = deleteText
      els.btnDelete.style.display = 'block'
    } else {
      els.btnDelete.style.display = 'none'
    }

    // Trap focus on first input when open
    setTimeout(() => {
      const first = els.body.querySelector('input,select,textarea')
      if (first) first.focus()
    }, 280)

    // Wire handlers — remove old ones first
    this._detachHandlers()

    this._keydownHandler = (e) => {
      if (e.key === 'Escape') {
        this._cancelHandler ? this._cancelHandler() : this.close()
      }
    }
    document.addEventListener('keydown', this._keydownHandler)

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

    this._deleteHandler = async () => {
      if (!onDelete) return
      if (!confirm('¿Estás seguro de que querés eliminar este elemento? Esta acción no se puede deshacer.')) return
      
      const original = els.btnDelete.innerHTML
      els.btnDelete.disabled = true
      els.btnDelete.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>'
      
      try {
        const result = await onDelete()
        if (result !== false) this.close()
        else {
          els.btnDelete.disabled = false
          els.btnDelete.innerHTML = original
        }
      } catch (err) {
        els.btnDelete.disabled = false
        els.btnDelete.innerHTML = original
      }
    }

    els.btnSave.addEventListener('click', this._saveHandler)
    els.btnCancel.addEventListener('click', this._cancelHandler)
    els.closeX.addEventListener('click', this._cancelHandler)
    els.btnDelete.addEventListener('click', this._deleteHandler)

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

    this._detachHandlers()

    setTimeout(() => {
      els.backdrop.style.display = 'none'
      els.modal.style.display = 'none'
      els.body.innerHTML = ''
      document.body.style.overflow = ''
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
    if (this._deleteHandler) {
      els.btnDelete.removeEventListener('click', this._deleteHandler)
    }
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler)
    }
    this._saveHandler = null
    this._cancelHandler = null
    this._deleteHandler = null
    this._keydownHandler = null
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
