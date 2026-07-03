// AppConfirmDialog -- diálogo de confirmación independiente del AppModal singleton.
// AppModal (#app-global-modal) reemplaza su contenido cada vez que se llama .open(),
// por lo que reutilizarlo para un confirm/cancel destruiría silenciosamente el modal
// de edición de clase que ya está abierto. Este componente construye su PROPIO
// backdrop + dialog en <body>, con z-index superior al de AppModal (10801), para
// poder apilarse visualmente encima sin tocar el DOM/estado de AppModal.
//
// Uso:
//   const ok = await confirmDialog({ title, message, confirmText, cancelText })
//   if (ok) { ... } else { ... }

let _seq = 0

function escapeHTML(text) {
  if (!text) return ''
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Muestra un diálogo de confirmación apilado sobre cualquier modal abierto.
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.message - Puede contener HTML simple (ya sanitizado por el caller si aplica)
 * @param {string} [params.confirmText='Aceptar']
 * @param {string} [params.cancelText='Cancelar']
 * @returns {Promise<boolean>} true si el usuario aceptó, false si canceló/escapó/click en backdrop
 */
export function confirmDialog({ title = '', message = '', confirmText = 'Aceptar', cancelText = 'Cancelar' } = {}) {
  return new Promise((resolve) => {
    const id = `app-confirm-dialog-${++_seq}`
    const backdropId = `${id}-backdrop`

    const backdrop = document.createElement('div')
    backdrop.id = backdropId
    backdrop.style.cssText = `
      position:fixed;inset:0;
      background:var(--pm-backdrop, rgba(0,0,0,0.55));
      backdrop-filter:blur(4px);
      z-index:10900;
      display:flex;align-items:center;justify-content:center;
      padding:1.5rem;
      opacity:0;
      transition:opacity .2s ease;
    `

    const dialog = document.createElement('div')
    dialog.id = id
    dialog.setAttribute('role', 'alertdialog')
    dialog.setAttribute('aria-modal', 'true')
    dialog.style.cssText = `
      background:var(--pm-surface, var(--bs-body-bg, #ffffff));
      color:var(--pm-text, var(--bs-body-color, #212529));
      border:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
      border-radius:16px;
      box-shadow:0 20px 60px rgba(0,0,0,0.25);
      width:100%;
      max-width:420px;
      margin:auto;
      transform:translateY(20px) scale(0.97);
      transition:transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s ease;
      opacity:0;
      overflow:hidden;
    `
    dialog.innerHTML = `
      <div class="app-confirm-header" style="
        padding:1rem 1.25rem;
        border-bottom:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
        background: linear-gradient(135deg, var(--pm-primary, var(--bs-primary, #0d6efd)) 0%, #5856d6 100%);
      ">
        <h5 class="mb-0 fw-bold" style="font-size:1.0625rem;color:white;font-weight:600;letter-spacing:-0.01em;">${escapeHTML(title)}</h5>
      </div>
      <div class="app-confirm-body" style="padding:1.25rem; background:var(--pm-surface, var(--bs-body-bg, #ffffff));">
        <p class="mb-0" style="white-space:pre-line;">${message}</p>
      </div>
      <div class="app-confirm-footer" style="
        padding:1rem 1.25rem;
        border-top:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
        display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
        background:var(--pm-surface-2, var(--bs-tertiary-bg, #f8f9fa));
      ">
        <button type="button" class="pm-btn pm-btn-outline app-confirm-btn-cancel">${escapeHTML(cancelText)}</button>
        <button type="button" class="pm-btn pm-btn-primary app-confirm-btn-confirm">${escapeHTML(confirmText)}</button>
      </div>
    `

    backdrop.appendChild(dialog)
    document.body.appendChild(backdrop)

    let settled = false
    const cleanup = (result) => {
      if (settled) return
      settled = true
      document.removeEventListener('keydown', onKeydown)
      backdrop.style.opacity = '0'
      dialog.style.opacity = '0'
      dialog.style.transform = 'translateY(20px) scale(0.97)'
      setTimeout(() => {
        backdrop.remove()
      }, 200)
      resolve(result)
    }

    const onKeydown = (e) => {
      if (e.key === 'Escape') cleanup(false)
    }
    document.addEventListener('keydown', onKeydown)

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) cleanup(false)
    })

    dialog.querySelector('.app-confirm-btn-cancel').addEventListener('click', () => cleanup(false))
    dialog.querySelector('.app-confirm-btn-confirm').addEventListener('click', () => cleanup(true))

    requestAnimationFrame(() => {
      backdrop.style.opacity = '1'
      dialog.style.opacity = '1'
      dialog.style.transform = 'translateY(0) scale(1)'
    })
  })
}
