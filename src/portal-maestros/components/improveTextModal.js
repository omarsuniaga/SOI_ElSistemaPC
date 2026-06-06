/**
 * Componente: improveTextModal
 * Muestra original vs mejorado lado a lado para que el usuario acepte o rechace.
 * (Mantenido para backward compatibility — nuevos flujos usan createGenerarInformeModal)
 *
 * @param {HTMLElement} parentContainer
 * @param {{ onAccept: Function }} options
 */
export function createImproveTextModal(parentContainer, { onAccept }) {
  let modalEl = document.getElementById('pm-improve-text-modal')

  if (!modalEl) {
    modalEl = document.createElement('div')
    modalEl.id = 'pm-improve-text-modal'
    modalEl.className = 'pm-modal-overlay'
    modalEl.innerHTML = `
      <div class="pm-modal-content pm-improve-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">✨ Mejorar Texto</h3>
          <button class="pm-modal-close" id="pm-improve-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-improve-body">
          <div class="pm-improve-panels">
            <div class="pm-improve-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Original</h4>
              <div id="pm-improve-original" class="pm-improve-text" style="background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text);"></div>
            </div>
            <div class="pm-improve-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Mejorado</h4>
              <div id="pm-improve-text" class="pm-improve-text" contenteditable="true" style="background: var(--pm-surface); border: 1.5px solid var(--pm-primary); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text);"></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="pm-btn" id="pm-improve-reject" style="flex: 1; background: var(--pm-surface); border: 1px solid var(--pm-border);">Descartar</button>
            <button class="pm-btn pm-btn-primary" id="pm-improve-accept" style="flex: 1;">Aceptar</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modalEl)

    if (!document.getElementById('pm-improve-modal-styles')) {
      const style = document.createElement('style')
      style.id = 'pm-improve-modal-styles'
      style.textContent = `
        .pm-improve-content {
          max-width: 900px;
          width: 90vw;
        }
        .pm-improve-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pm-improve-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .pm-improve-panel {
          display: flex;
          flex-direction: column;
        }
        .pm-improve-text {
          font-size: 0.9rem;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }
        @media (max-width: 768px) {
          .pm-improve-panels {
            grid-template-columns: 1fr;
          }
        }
      `
      document.head.appendChild(style)
    }
  }

  const originalEl = modalEl.querySelector('#pm-improve-original')
  const improvedEl = modalEl.querySelector('#pm-improve-text')

  function open({ original, improved }) {
    originalEl.textContent = original
    improvedEl.textContent = improved
    modalEl.classList.add('open')
  }

  function close() {
    modalEl.classList.remove('open')
  }

  modalEl.querySelector('#pm-improve-close').onclick = close
  modalEl.querySelector('#pm-improve-reject').onclick = close

  modalEl.querySelector('#pm-improve-accept').onclick = () => {
    if (onAccept) onAccept(improvedEl.textContent)
    close()
  }

  return { open, close }
}

/**
 * Componente: GenerarInformeModal
 * Muestra el informe generado por IA con opciones para compartir.
 * NO guarda evaluaciones — solo genera texto para comunicación (padres, WhatsApp, email).
 *
 * @param {HTMLElement} parentContainer
 * @param {{ onAceptar?: Function }} options
 */
export function createGenerarInformeModal(parentContainer, { onAceptar }) {
  let modalEl = document.getElementById('pm-generar-informe-modal')

  if (!modalEl) {
    modalEl = document.createElement('div')
    modalEl.id = 'pm-generar-informe-modal'
    modalEl.className = 'pm-modal-overlay'
    modalEl.innerHTML = `
      <div class="pm-modal-content pm-generar-informe-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">
            📋 Generar Informe
          </h3>
          <button class="pm-modal-close" id="pm-informe-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-generar-informe-body">
          <p style="font-size:0.85rem;color:var(--pm-text-muted);margin:0 0 1rem;">
            Este informe es para compartir con padres o tutores. No se registra como evaluación.
          </p>
          <div id="pm-informe-original-panel" style="display:none; margin-bottom:1rem;">
            <h4 style="margin:0 0 0.5rem;font-size:0.8rem;color:var(--pm-text-muted);">Tu registro original</h4>
            <div id="pm-informe-original" class="pm-informe-text" style="background:var(--pm-surface-2);border:1px solid var(--pm-border);border-radius:var(--pm-radius-sm);padding:0.75rem;font-size:0.85rem;color:var(--pm-text-muted);white-space:pre-wrap;max-height:120px;overflow-y:auto;"></div>
          </div>
          <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--pm-text);font-weight:600;">Informe generado</h4>
          <div id="pm-informe-texto" class="pm-informe-text" contenteditable="true"
            style="background:var(--pm-surface);border:1.5px solid var(--pm-primary);border-radius:var(--pm-radius-sm);padding:0.75rem;min-height:180px;max-height:300px;overflow-y:auto;color:var(--pm-text);font-size:0.9rem;line-height:1.6;white-space:pre-wrap;"></div>

          <div class="pm-informe-acciones">
            <button class="pm-btn pm-btn-share" id="btn-informe-copy" title="Copiar al portapapeles">
              <span>📋</span> Copiar
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-whatsapp" title="Compartir por WhatsApp">
              <span>💬</span> WhatsApp
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-email" title="Enviar por email">
              <span>✉️</span> Email
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-pdf" title="Exportar a PDF">
              <span>📄</span> PDF
            </button>
          </div>

          <div style="display:flex;gap:0.75rem;margin-top:1.25rem;">
            <button class="pm-btn" id="pm-informe-descartar" style="flex:1;background:var(--pm-surface);border:1px solid var(--pm-border);">Cerrar</button>
            <button class="pm-btn pm-btn-primary" id="pm-informe-aceptar" style="flex:1;">Usar en el editor</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modalEl)

    if (!document.getElementById('pm-generar-informe-styles')) {
      const style = document.createElement('style')
      style.id = 'pm-generar-informe-styles'
      style.textContent = `
        .pm-generar-informe-content {
          max-width: 640px;
          width: 95vw;
        }
        .pm-generar-informe-body {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .pm-informe-text {
          font-size: 0.9rem;
          line-height: 1.6;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }
        .pm-informe-acciones {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }
        .pm-btn-share {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          color: var(--pm-text);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          flex: 1;
          justify-content: center;
        }
        .pm-btn-share:hover {
          background: var(--pm-primary);
          color: #fff;
          border-color: var(--pm-primary);
        }
        .pm-btn-share span { font-size: 0.95rem; }
      `
      document.head.appendChild(style)
    }
  }

  const originalEl = modalEl.querySelector('#pm-informe-original')
  const originalPanel = modalEl.querySelector('#pm-informe-original-panel')
  const informeEl = modalEl.querySelector('#pm-informe-texto')

  function _getInforme() {
    return informeEl.textContent.trim()
  }

  async function _copiar() {
    try {
      await navigator.clipboard.writeText(_getInforme())
      const btn = modalEl.querySelector('#btn-informe-copy')
      const orig = btn.textContent
      btn.textContent = '✓ Copiado'
      setTimeout(() => { btn.textContent = orig }, 2000)
    } catch {
      alert('No se pudo copiar al portapapeles.')
    }
  }

  function _whatsapp() {
    const text = encodeURIComponent(_getInforme())
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  function _email() {
    const text = encodeURIComponent(_getInforme())
    window.open(`mailto:?subject=Informe de clase&body=${text}`, '_blank')
  }

  function _pdf() {
    const text = _getInforme()
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Informe de Clase</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 700px; margin: auto; line-height: 1.6; color: #333; }
        h2 { color: #007aff; border-bottom: 2px solid #007aff; padding-bottom: 0.5rem; }
        p { white-space: pre-wrap; }
        @media print { body { padding: 1rem; } }
      </style></head>
      <body>
        <h2>📋 Informe de Clase</h2>
        <p>${text}</p>
        <script>window.print();</script>
      </body></html>
    `)
    win.document.close()
  }

  modalEl.querySelector('#btn-informe-copy').onclick = _copiar
  modalEl.querySelector('#btn-informe-whatsapp').onclick = _whatsapp
  modalEl.querySelector('#btn-informe-email').onclick = _email
  modalEl.querySelector('#btn-informe-pdf').onclick = _pdf

  function open({ original, improved }) {
    originalEl.textContent = original
    informeEl.textContent = improved
    if (originalPanel) originalPanel.style.display = original ? '' : 'none'
    modalEl.classList.add('open')
  }

  function close() {
    modalEl.classList.remove('open')
  }

  modalEl.querySelector('#pm-informe-close').onclick = close
  modalEl.querySelector('#pm-informe-descartar').onclick = close
  modalEl.querySelector('#pm-informe-aceptar').onclick = () => {
    if (onAceptar) onAceptar(_getInforme())
    close()
  }

  return { open, close }
}