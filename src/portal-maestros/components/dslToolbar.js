import { enrichToDSL, transcribeAndStructure, structureTextToDSL } from '../services/groqService.js';
import { SNIPPETS, searchSnippets, expandSnippet } from '../services/snippetBank.js';
import { createStructureModal } from './structureModal.js';
import { createToolbarHelpModal } from './toolbarHelpModal.js';

/**
 * Componente: DslToolbar
 * Barra de herramientas inteligente para insertar tokens DSL en el editor.
 * 
 * Tokens:
 *   #  → Etiquetar alumno individual
 *   [] → Contenido de clase
 *   () → Sugerencia pedagógica
 *   {} → Tarea/Asignación
 *   $  → Medida técnica
 *   >  → Objetivo curricular
 * 
 * @param {HTMLElement} container
 * @param {{ onInsert: Function, onLoading: Function, onIaProposal: Function, getEditorContent: Function, aiService?: object, onImproveClick?: Function, onStructureClick?: Function }} options
 */
export function createDslToolbar(container, { onInsert, onLoading, onIaProposal, getEditorContent, aiService, onImproveClick, onStructureClick, onAnalyzeClick }) {

  // Contexto mutable: se actualiza desde fuera vía setContext()
  let _ctx = { presentes: [], indicadorActivo: null, indicadoresDisponibles: [] }

  // Definición centralizada de herramientas DSL
  const DSL_TOOLS = [
    { token: 'alumno',    label: '#',    title: 'Etiquetar alumno',     text: '#',   offset: 1, icon: '👤', triggerAC: '#' },
    { token: 'contenido', label: '[ ]',  title: 'Contenido de clase',   text: '[]',  offset: 1, icon: '📚', triggerAC: '[' },
    { token: 'sugerencia',label: '( )',  title: 'Sugerencia pedagógica',text: '()',  offset: 1, icon: '💡', triggerAC: '(' },
    { token: 'tarea',     label: '{ }',  title: 'Tarea / Asignación',   text: '{}',  offset: 1, icon: '📝', triggerAC: '{' },
    { token: 'medida',    label: '$',    title: 'Medida técnica',       text: '$',   offset: 1, icon: '🎯', triggerAC: '$' },
    { token: 'objetivo',  label: '>',    title: 'Objetivo curricular',  text: '>',   offset: 1, icon: '🎓', triggerAC: '>' },
  ];

  container.innerHTML = `
    <div class="pm-dsl-toolbar">
      ${DSL_TOOLS.map(t => `
        <button class="pm-dsl-tool-btn" data-token="${t.token}" title="${t.title}">
          <span class="pm-dsl-tool-symbol">${t.label}</span>
        </button>
      `).join('')}
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn snippet-btn" id="btn-snippets" title="Snippets / Banco">
        <span class="snippet-icon">/</span>
      </button>
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn ai" id="btn-generar-informe" title="Generar informe para padres/tutores">📋</button>
      <button class="pm-dsl-tool-btn ai" id="btn-ia-magic" title="Estructurar con IA">🚀</button>
      <button class="pm-dsl-tool-btn ai" id="btn-analizar-progreso" title="Analizar progreso con IA">🎯</button>
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn" id="btn-help" title="Ayuda">❓</button>

    </div>
    <div id="pm-snippet-popup" class="pm-snippet-popup" style="display:none;"></div>
  `;

  // Estilos de la toolbar
  if (!document.getElementById('pm-dsl-toolbar-styles')) {
    const style = document.createElement('style');
    style.id = 'pm-dsl-toolbar-styles';
    style.textContent = `
      .pm-dsl-toolbar {
        display: flex;
        gap: 0.25rem;
        padding: 0.5rem;
        background: var(--pm-surface);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-sm) var(--pm-radius-sm) 0 0;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        align-items: center;
      }
      .pm-dsl-toolbar::-webkit-scrollbar { display: none; }
      
      .pm-dsl-tool-btn {
        min-width: 32px;
        height: 32px;
        padding: 0 0.5rem;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        position: relative;
      }
      .pm-dsl-tool-btn:hover {
        background: var(--pm-surface-2);
        border-color: var(--pm-primary);
        color: var(--pm-primary);
        transform: translateY(-1px);
      }
      .pm-dsl-tool-btn:active { 
        background: var(--pm-border); 
        transform: translateY(1px); 
      }
      .pm-dsl-tool-btn.ai { 
        border-color: var(--pm-primary); 
        color: var(--pm-primary); 
        background: rgba(99, 102, 241, 0.05); 
      }

      
      .pm-dsl-tool-symbol {
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      
      .pm-dsl-divider {
        width: 1px;
        background: var(--pm-border);
        margin: 4px 2px;
        height: 20px;
      }


    `;
    document.head.appendChild(style);
  }

  // --- Lógica de inserción inteligente ---
  // El mapa de herramientas nos permite buscar por token rápidamente
  const toolMap = new Map(DSL_TOOLS.map(t => [t.token, t]));

  container.querySelectorAll('.pm-dsl-tool-btn[data-token]').forEach(btn => {
    btn.onclick = () => {
      const tool = toolMap.get(btn.dataset.token);
      if (!tool) return;

      // Micro-animación de feedback al presionar
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => { btn.style.transform = ''; }, 100);

      // Insertar el texto con cursorOffset para que el cursor quede DENTRO
      // de los brackets/paréntesis. El triggerAC indica qué autocomplete disparar.
      onInsert(tool.text, tool.offset, tool.triggerAC);
    };
  });



// --- Lógica de Generar Informe ---
  async function handleGenerateReport() {
    const rawText = getEditorContent ? getEditorContent() : ''
    if (!rawText.trim()) return
    if (onImproveClick) {
      try {
        onImproveClick(rawText)
      } catch (err) {
        alert('Error al generar informe: ' + err.message)
      }
    }
  }

  // --- Lógica de Estructurar con IA ---
  async function handleStructure() {
    const rawText = getEditorContent ? getEditorContent() : ''
    if (!rawText.trim()) return
    if (onStructureClick) {
      try {
        onStructureClick(rawText)
      } catch (err) {
        alert('Error al estructurar con IA: ' + err.message)
      }
    }
  }

  container.querySelector('#btn-generar-informe').onclick = handleGenerateReport;
  container.querySelector('#btn-ia-magic').onclick = handleStructure;

  const analyzeBtn = container.querySelector('#btn-analizar-progreso')
  if (analyzeBtn) {
    analyzeBtn.onclick = async () => {
      const rawText = getEditorContent ? getEditorContent() : ''
      if (!rawText.trim()) return
      if (onAnalyzeClick) {
        analyzeBtn.disabled = true
        analyzeBtn.textContent = '⏳'
        try {
          await onAnalyzeClick(rawText)
        } catch (err) {
          // error handled by caller
        } finally {
          analyzeBtn.disabled = false
          analyzeBtn.textContent = '🎯'
        }
      }
    }
  }


  // === Snippets Popup ===
  const snippetPopup = container.querySelector('#pm-snippet-popup')
  let snippetSearch = ''

  function showSnippetPopup(search = '') {
    const results = searchSnippets(search)
    if (results.length === 0) {
      snippetPopup.style.display = 'none'
      return
    }
    
    snippetPopup.innerHTML = results.map(s => `
      <div class="pm-snippet-item" data-trigger="${s.trigger}">
        <span class="pm-snippet-icon">${s.icon}</span>
        <span class="pm-snippet-label">/${s.trigger}</span>
        <span class="pm-snippet-preview">${s.label}</span>
      </div>
    `).join('')
    
    // Auto-posicionamiento inteligente
    const rect = container.getBoundingClientRect()
    const spaceAbove = rect.top
    const threshold = 220
    
    snippetPopup.style.position = 'fixed'
    snippetPopup.style.left = `${rect.left}px`
    snippetPopup.style.width = `${rect.width}px`
    
    if (spaceAbove > threshold) {
      snippetPopup.style.top = 'auto'
      snippetPopup.style.bottom = `${window.innerHeight - rect.top + 8}px`
      snippetPopup.style.transformOrigin = 'bottom left'
    } else {
      snippetPopup.style.bottom = 'auto'
      snippetPopup.style.top = `${rect.bottom + 8}px`
      snippetPopup.style.transformOrigin = 'top left'
    }
    
    snippetPopup.style.display = 'block'
    
    snippetPopup.querySelectorAll('.pm-snippet-item').forEach(item => {
      item.onclick = () => {
        const expanded = expandSnippet(item.dataset.trigger)
        onInsert(expanded + ' ')
        hideSnippetPopup()
      }
    })
  }

  function hideSnippetPopup() {
    snippetPopup.style.display = 'none'
    snippetSearch = ''
  }

  // Agregar estilos de snippets
  if (!document.getElementById('pm-snippet-styles')) {
    const snippetStyle = document.createElement('style')
    snippetStyle.id = 'pm-snippet-styles'
    snippetStyle.textContent = `
      .snippet-btn { font-size: 1rem; font-weight: 800; }
      .snippet-icon { font-weight: 900; color: var(--pm-text-muted); }
      .pm-snippet-popup {
        position: fixed;
        left: 0;
        background: var(--pm-surface);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-md);
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 2000;
        max-height: 250px;
        overflow-y: auto;
        min-width: 240px;
        animation: pm-pop-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes pm-pop-up {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .pm-snippet-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        border-bottom: 1px solid var(--pm-border);
      }
      .pm-snippet-item:last-child { border-bottom: none; }
      .pm-snippet-item:hover { background: var(--pm-surface-2); }
      .pm-snippet-icon { font-size: 1rem; }
      .pm-snippet-label {
        font-family: monospace;
        font-weight: 600;
        color: var(--pm-primary);
      }
      .pm-snippet-preview {
        font-size: 0.8rem;
        color: var(--pm-text-muted);
      }
    `
    document.head.appendChild(snippetStyle)
  }

  // Botón de snippets
  container.querySelector('#btn-snippets').onclick = () => {
    if (snippetPopup.style.display === 'block') {
      hideSnippetPopup()
    } else {
      showSnippetPopup()
    }
  }

  // === Help Modal ===
  const helpModal = createToolbarHelpModal(container)

  container.querySelector('#btn-help').onclick = () => {
    helpModal.open()
  }

  /**
   * Actualiza el contexto que usa el botón ✨ al llamar structureDSL.
   * @param {{ presentes?: string[], indicadorActivo?: string|null, indicadoresDisponibles?: string[] }} ctx
   */
  return {
    setContext(ctx = {}) {
      if (ctx.presentes !== undefined)           _ctx.presentes = ctx.presentes
      if (ctx.indicadorActivo !== undefined)     _ctx.indicadorActivo = ctx.indicadorActivo
      if (ctx.indicadoresDisponibles !== undefined) _ctx.indicadoresDisponibles = ctx.indicadoresDisponibles
    }
  }
}
