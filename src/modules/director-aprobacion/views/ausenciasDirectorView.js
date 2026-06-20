import {
  obtenerPendientesDirector,
  revisarAusencia,
} from '../api/ausenciaAprobacionApi.js';

function showToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }));
}

function renderShell(container) {
  container.innerHTML = `
    <div class="pm-view-header">
      <h2><i class="bi bi-clipboard-check"></i> Revisión Director</h2>
      <p class="pm-view-subtitle">Revisá las ausencias antes de enviarlas a aprobación final.</p>
    </div>
    <div id="ausencias-director-content">
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
      <h3>No hay ausencias pendientes de revisión</h3>
      <p style="opacity:.65;">Las nuevas solicitudes aparecerán acá automáticamente.</p>
    </div>
  `;
}

function createAusenciaRow(ausencia, onSolicitarInfo, onEnviarAprobacion) {
  const row = document.createElement('div');
  row.setAttribute('data-ausencia-row', ausencia.id);
  row.style.cssText = 'border:1px solid #dee2e6; border-radius:8px; padding:1rem; margin-bottom:1rem;';

  const nombre = ausencia.maestros?.nombre_completo ?? 'Sin nombre';
  const clasesCount = Array.isArray(ausencia.clases_afectadas)
    ? ausencia.clases_afectadas.length
    : 0;

  row.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:.5rem;">
      <div>
        <strong>${nombre}</strong>
        <span style="margin-left:.5rem; font-size:.85rem; opacity:.7;">${ausencia.tipo_ausencia}</span>
        <span style="margin-left:.5rem; font-size:.8rem; background:#ffc107; color:#000; padding:.1rem .4rem; border-radius:4px;">${ausencia.urgencia}</span>
      </div>
      <div style="font-size:.85rem; opacity:.8;">
        ${ausencia.fecha_inicio} → ${ausencia.fecha_fin}
        · ${clasesCount} clase(s) afectada(s)
      </div>
    </div>
    <p style="margin:.5rem 0; font-size:.9rem;">${ausencia.motivo ?? ''}</p>
    <div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; margin-top:.75rem;">
      <textarea
        data-review-notes
        placeholder="Notas de revisión..."
        rows="2"
        style="flex:1; min-width:180px; padding:.4rem .6rem; border:1px solid #ced4da; border-radius:4px; resize:vertical;"
      ></textarea>
      <div style="display:flex; gap:.5rem;">
        <button
          data-action="solicitar-info"
          style="padding:.4rem .8rem; background:#0d6efd; color:#fff; border:none; border-radius:4px; cursor:pointer;"
        >
          Solicitar Información
        </button>
        <button
          data-action="enviar-aprobacion"
          style="padding:.4rem .8rem; background:#198754; color:#fff; border:none; border-radius:4px; cursor:pointer;"
        >
          Enviar a Aprobación
        </button>
      </div>
    </div>
  `;

  row.querySelector('[data-action="solicitar-info"]').addEventListener('click', () => {
    const notes = row.querySelector('[data-review-notes]').value;
    onSolicitarInfo(ausencia.id, notes);
  });

  row.querySelector('[data-action="enviar-aprobacion"]').addEventListener('click', () => {
    const notes = row.querySelector('[data-review-notes]').value;
    onEnviarAprobacion(ausencia.id, notes);
  });

  return row;
}

async function renderList(container) {
  let contentEl = container.querySelector('#ausencias-director-content');
  if (!contentEl) {
    contentEl = document.createElement('div');
    contentEl.id = 'ausencias-director-content';
    container.appendChild(contentEl);
  }

  const ausencias = await obtenerPendientesDirector();

  if (!ausencias.length) {
    renderEmpty(contentEl);
    return;
  }

  contentEl.innerHTML = '<div class="ausencias-director-list"></div>';
  const listEl = contentEl.querySelector('.ausencias-director-list');

  for (const ausencia of ausencias) {
    listEl.appendChild(
      createAusenciaRow(
        ausencia,
        async (id, notes) => {
          await revisarAusencia(id, 'info_solicitada', notes);
          showToast('Información solicitada al maestro', 'info');
          await renderList(container);
        },
        async (id, notes) => {
          await revisarAusencia(id, 'pendiente_aprobacion', notes);
          showToast('Ausencia enviada a aprobación', 'success');
          await renderList(container);
        },
      ),
    );
  }
}

export async function renderAusenciasDirectorView(container) {
  renderShell(container);

  try {
    await renderList(container);
  } catch (error) {
    let contentEl = container.querySelector('#ausencias-director-content');
    if (!contentEl) {
      contentEl = document.createElement('div');
      contentEl.id = 'ausencias-director-content';
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
