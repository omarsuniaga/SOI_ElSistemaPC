import {
  aprobarAusencia,
  obtenerAusenciasPendientes,
  rechazarAusencia,
} from '../api/ausenciaAprobacionApi.js';
import { createAusenciaAprobacionCard } from '../components/ausenciaAprobacionCard.js';

function showToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
}

function renderShell(container) {
  container.innerHTML = `
    <div class="pm-view-header">
      <h2><i class="bi bi-calendar-x"></i> Solicitudes de Ausencia</h2>
      <p class="pm-view-subtitle">Revisá y decidí las ausencias solicitadas por maestros.</p>
    </div>
    <div id="ausencias-admin-content">
      <div class="pm-loading">
        <div class="pm-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    </div>
  `;
}

function renderEmpty(contentEl) {
  contentEl.innerHTML = `
    <div class="pm-empty-state" style="text-align:center; padding:3rem 1rem;">
      <div style="font-size:3rem; margin-bottom:1rem; opacity:.5;">
        <i class="bi bi-inbox"></i>
      </div>
      <h3>No hay solicitudes de ausencia pendientes</h3>
      <p style="opacity:.65;">Las nuevas solicitudes aparecerán acá automáticamente.</p>
    </div>
  `;
}

async function renderList(container) {
  let contentEl = container.querySelector('#ausencias-admin-content');
  if (!contentEl) {
    contentEl = document.createElement('div');
    contentEl.id = 'ausencias-admin-content';
    container.appendChild(contentEl);
  }
  const ausencias = await obtenerAusenciasPendientes();

  if (!ausencias.length) {
    renderEmpty(contentEl);
    return;
  }

  contentEl.innerHTML = '<div class="ausencias-admin-list"></div>';
  const listEl = contentEl.querySelector('.ausencias-admin-list');

  for (const ausencia of ausencias) {
    listEl.appendChild(createAusenciaAprobacionCard(ausencia, {
      onApprove: async (id, notes) => {
        await aprobarAusencia(id, notes);
        showToast('Ausencia aprobada correctamente', 'success');
        await renderList(container);
      },
      onReject: async (id, notes) => {
        await rechazarAusencia(id, notes);
        showToast('Ausencia rechazada', 'success');
        await renderList(container);
      },
    }));
  }
}

export async function renderAusenciasAdminView(container) {
  renderShell(container);

  try {
    await renderList(container);
  } catch (error) {
    let contentEl = container.querySelector('#ausencias-admin-content');
    if (!contentEl) {
      renderShell(container);
      contentEl = container.querySelector('#ausencias-admin-content');
    }
    if (!contentEl) {
      contentEl = document.createElement('div');
      contentEl.id = 'ausencias-admin-content';
      container.appendChild(contentEl);
    }
    contentEl.innerHTML = `
      <div class="pm-error" style="text-align:center; padding:2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar ausencias: ${error.message}</p>
      </div>
    `;
    showToast(`Error al cargar ausencias: ${error.message}`, 'error');
  }
}
