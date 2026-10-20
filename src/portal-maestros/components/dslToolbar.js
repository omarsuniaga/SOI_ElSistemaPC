import { createToolbarHelpModal } from './toolbarHelpModal.js'
import { createObservationDictation } from './observationDictation.js'

/** Barra compacta de observaciones: etiquetas, IA, ayuda y dictado. */
export function createDslToolbar(container, { onInsert, getEditorContent, onAnalyzeClick }) {
  let destroyed = false
  let context = {}
  const tools = [
    { token: 'alumno', label: '#', name: 'Alumno', title: 'Etiquetar alumno', text: '#', trigger: '#' },
    { token: 'contenido', label: '[ ]', name: 'Contenido', title: 'Contenido de clase', text: '[]', trigger: '[' },
    { token: 'sugerencia', label: '( )', name: 'Reforzar', title: 'Sugerencia pedagógica', text: '()', trigger: '(' },
    { token: 'tarea', label: '{ }', name: 'Tarea', title: 'Tarea / Asignación', text: '{}', trigger: '{' },
  ]

  container.innerHTML = `
    <div class="pm-dsl-toolbar" role="group" aria-label="Herramientas de observaciones">
      ${tools.map(tool => `
        <button type="button" class="pm-dsl-tool-btn" data-token="${tool.token}" title="${tool.title}" aria-label="${tool.title}">
          <span class="pm-dsl-tool-symbol" aria-hidden="true">${tool.label}</span><span class="pm-dsl-tool-text">${tool.name}</span>
        </button>
      `).join('')}
      <div class="pm-dsl-divider" aria-hidden="true"></div>
      <button type="button" class="pm-dsl-tool-btn ai ai-primary" id="btn-analizar-progreso" title="Analizar con IA" aria-label="Analizar con IA">✨ IA</button>
      <button type="button" class="pm-dsl-tool-btn" id="btn-help" title="Ayuda" aria-label="Ayuda">❓</button>
      <button type="button" class="pm-dsl-tool-btn pm-dsl-dictation" id="btn-dictar-observacion" title="Dictar observación" aria-label="Dictar observación" aria-pressed="false" aria-describedby="pm-dictation-status">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="2" width="6" height="12" rx="3"></rect>
          <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"></path>
        </svg>
      </button>
    </div>
    <p id="pm-dictation-status" class="pm-dsl-dictation-status" role="status" aria-live="polite" hidden></p>
  `

  if (!document.getElementById('pm-dsl-toolbar-styles')) {
    const style = document.createElement('style')
    style.id = 'pm-dsl-toolbar-styles'
    style.textContent = `
      .pm-dsl-toolbar {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem;
        background: var(--pm-surface);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-sm) var(--pm-radius-sm) 0 0;
      }
      .pm-dsl-tool-btn {
        flex: 0 0 auto;
        min-width: 32px;
        height: 32px;
        padding: 0 0.5rem;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, border-color 0.15s;
      }
      .pm-dsl-tool-btn:hover {
        background: var(--pm-surface-2);
        border-color: var(--pm-primary);
      }
      .pm-dsl-tool-btn:focus-visible {
        outline: 2px solid var(--pm-primary, #6366f1);
        outline-offset: 2px;
      }
      .pm-dsl-tool-btn:disabled { opacity: 0.65; cursor: wait; }
      .pm-dsl-tool-btn.ai { color: var(--pm-primary); border-color: var(--pm-primary); }
      .pm-dsl-tool-btn.ai-primary {
        color: #fff;
        background: var(--pm-primary, #6366f1);
        min-width: 44px;
        font-size: 0.75rem;
        padding: 0 0.4rem;
      }
      .pm-dsl-tool-text { font-size:0.72rem; margin-left:.3rem; }
      .pm-dsl-toolbar { flex-wrap:wrap; }
      .pm-dsl-tool-symbol { font-family: ui-monospace, monospace; font-weight: 800; }
      .pm-dsl-divider { flex: 0 0 1px; background: var(--pm-border); height: 20px; }
      .pm-dsl-dictation { margin-left: auto; }
      .pm-dsl-dictation.is-listening {
        color: var(--pm-danger, #dc3545);
        border-color: currentColor;
        background: rgba(220, 53, 69, 0.1);
      }
      .pm-dsl-dictation-status { margin: 0.35rem 0; color: var(--pm-text-muted); font-size: 0.8rem; }
      @media (max-width: 600px) { .pm-dsl-tool-text { display:none; } }
      @media (max-width: 767px) {
        .pm-dsl-toolbar { flex-wrap: wrap; }
        .pm-dsl-tool-btn.ai { flex: 0 0 auto; }
        .pm-dsl-tool-btn { min-width: 36px; height: 40px; padding: 0 0.35rem; }
      }
    `
    document.head.appendChild(style)
  }

  const buttons = container.querySelectorAll('.pm-dsl-tool-btn')
  function preserveSelection(event) { event.preventDefault() }
  buttons.forEach(button => button.addEventListener('mousedown', preserveSelection))
  tools.forEach(tool => {
    container.querySelector(`[data-token="${tool.token}"]`).onclick = () =>
      onInsert(tool.text, 1, tool.trigger || null)
  })

  const analyzeButton = container.querySelector('#btn-analizar-progreso')
  analyzeButton.onclick = async () => {
    const text = getEditorContent?.() || ''
    if (destroyed || !text.trim() || !onAnalyzeClick || analyzeButton.disabled) return
    analyzeButton.disabled = true
    analyzeButton.textContent = '⏳ IA'
    analyzeButton.setAttribute('aria-busy', 'true')
    try { await onAnalyzeClick(text) }
    catch { /* El flujo de análisis presenta sus propios errores. */ }
    finally {
      if (!destroyed) {
        analyzeButton.disabled = false
        analyzeButton.textContent = '✨ IA'
        analyzeButton.setAttribute('aria-busy', 'false')
      }
    }
  }

  const helpModal = createToolbarHelpModal(container)
  container.querySelector('#btn-help').onclick = () => helpModal.open()
  const dictation = createObservationDictation(
    container.querySelector('#btn-dictar-observacion'),
    container.querySelector('#pm-dictation-status'),
    { onInsert, getEditorContent },
  )

  return {
    setContext(next = {}) { context = { ...context, ...next } },
    destroy() {
      destroyed = true
      dictation.destroy()
      helpModal.close()
      buttons.forEach(button => {
        button.onclick = null
        button.removeEventListener('mousedown', preserveSelection)
      })
    },
  }
}
