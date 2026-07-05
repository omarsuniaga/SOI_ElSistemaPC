import { createAiService } from '../services/aiService.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { escHTML } from '../utils/portalUtils.js';

/**
 * Componente: AsistenteIa Optimizada
 * Sin alerts/prompts, integrado con el sistema de diseño Apple.
 */
export async function createAsistenteIa(container) {
  let ai = null;
  try {
    ai = await createAiService();
  } catch (e) {
    container.innerHTML = `<div class="pm-empty">Error IA: ${e.message}</div>`;
    return;
  }

  const render = () => {
    container.innerHTML = `
      <div class="pm-ai-root pm-animate-fade-in">
        <div class="card-apple" style="margin-bottom:1.5rem;">
          <h3 class="apple-display-md" style="font-size:1.5rem; margin-bottom:0.5rem;">✨ Asistente IA</h3>
          <p class="apple-caption">Analiza el progreso y genera sugerencias pedagógicas.</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <button class="pm-btn-apple-action" data-action="analizar-quick">
            <i class="bi bi-lightning-charge"></i>
            <span>Análisis Rápido</span>
          </button>
          <button class="pm-btn-apple-action panic" data-action="analizar-full">
            <i class="bi bi-shield-check"></i>
            <span>Análisis Profundo</span>
          </button>
          <button class="pm-btn-apple-action" data-action="sugerir">
            <i class="bi bi-journal-plus"></i>
            <span>Sugerir Temas</span>
          </button>
          <button class="pm-btn-apple-action" data-action="resumir">
            <i class="bi bi-file-text"></i>
            <span>Resumir Sesión</span>
          </button>
        </div>

        <div id="pm-ai-modal-container"></div>
      </div>

      <style>
        .pm-btn-apple-action {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.75rem; padding: 1.5rem 1rem; background: var(--apple-surface);
          border: 1px solid var(--apple-border); border-radius: 18px; cursor: pointer;
          transition: transform 0.1s, box-shadow 0.2s;
        }
        .pm-btn-apple-action:active { transform: scale(0.95); }
        .pm-btn-apple-action i { font-size: 1.5rem; color: var(--apple-primary); }
        .pm-btn-apple-action.panic i { color: var(--apple-danger); }
        .pm-btn-apple-action span { font-size: 0.85rem; font-weight: 600; text-align: center; }
      </style>
    `;

    container.querySelectorAll('.pm-btn-apple-action').forEach(btn => {
      btn.onclick = () => _handleAction(btn.dataset.action);
    });
  };

  async function _handleAction(action) {
    if (action === 'analizar-quick' || action === 'analizar-full') {
      const isFull = action === 'analizar-full';
      _showSearchModal(isFull);
    } else {
      _showSimpleModal('Próximamente', 'Esta función se habilitará en la Fase 9.');
    }
  }

  function _showSearchModal(isFull) {
    const modalContainer = container.querySelector('#pm-ai-modal-container');
    modalContainer.innerHTML = `
      <div class="pm-modal-overlay open">
        <div class="pm-modal-content pm-animate-slide-up">
          <div class="pm-modal-header">
            <h3 class="pm-card-title">${isFull ? '🕵️ Análisis Profundo' : '⚡ Análisis Rápido'}</h3>
            <button class="pm-modal-close" id="pm-search-close">&times;</button>
          </div>
          <div class="pm-modal-body">
            <p class="apple-caption" style="margin-bottom:1rem;">Ingresa el nombre del alumno para buscar su historial.</p>
            <input type="text" id="pm-search-input" class="input-apple" placeholder="Nombre del alumno..." autofocus />
            <button class="btn-apple-primary" id="pm-search-go" style="margin-top:1.5rem; width:100%;">Comenzar Análisis</button>
          </div>
        </div>
      </div>
    `;

    const close = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#pm-search-close').onclick = close;
    modalContainer.querySelector('#pm-search-go').onclick = () => {
      const val = modalContainer.querySelector('#pm-search-input').value.trim();
      if (val) {
        close();
        _runAnalysis(val, isFull);
      }
    };
  }

  function _showSimpleModal(title, body) {
    const modalContainer = container.querySelector('#pm-ai-modal-container');
    modalContainer.innerHTML = `
      <div class="pm-modal-overlay open">
        <div class="pm-modal-content pm-animate-slide-up">
          <div class="pm-modal-header">
            <h3 class="pm-card-title">${title}</h3>
            <button class="pm-modal-close" id="pm-modal-close">&times;</button>
          </div>
          <div class="pm-modal-body">
            <p>${body}</p>
            <button class="btn-apple-primary" id="pm-modal-ok" style="margin-top:1.5rem; width:100%;">Entendido</button>
          </div>
        </div>
      </div>
    `;
    const close = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#pm-modal-close').onclick = close;
    modalContainer.querySelector('#pm-modal-ok').onclick = close;
  }

  async function _runAnalysis(nombre, fullContext = false) {
    container.innerHTML = `
      <div class="pm-placeholder pm-animate-fade-in">
        <div class="pm-spinner" style="width:40px; height:40px;"></div>
        <p style="margin-top:1.5rem; font-weight:600;">${fullContext ? 'Analizando historial completo...' : 'Analizando sesiones recientes...'}</p>
        <p class="apple-caption">Buscando datos de ${nombre} en la nube...</p>
      </div>
    `;

    try {
      const result = await ai.analizarProgreso({
        nombre,
        instrumento: 'General',
        comentarios: [],
        sesiones: [],
        fullContext
      });

      container.innerHTML = `
        <div class="pm-ai-result pm-animate-fade-in">
          <div class="card-apple" style="border-left: 5px solid ${fullContext ? 'var(--apple-danger)' : 'var(--apple-primary)'};">
            <h3 style="font-size:1.1rem; margin-bottom:1rem;">Reporte de IA para ${nombre}</h3>
            <div class="apple-body" style="font-size:0.95rem; line-height:1.6; white-space:pre-wrap;">${escHTML(result)}</div>
            <button class="btn-apple-secondary" id="pm-ai-back" style="margin-top:2rem; width:100%;">Nueva Consulta</button>
          </div>
        </div>
      `;

      document.getElementById('pm-ai-back').onclick = render;
    } catch (err) {
      container.innerHTML = `
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-octagon" style="color:var(--apple-danger);"></i>
          <p>Error en el análisis: ${err.message}</p>
          <button class="btn-apple-primary" id="pm-ai-retry">Reintentar</button>
        </div>
      `;
      document.getElementById('pm-ai-retry').onclick = render;
    }
  }

  render();
}
