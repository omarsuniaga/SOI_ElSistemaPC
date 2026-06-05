/**
 * PlanningDetailsModal.js
 * Modal para ver historial completo de un indicador
 */

import { getIndicatorHistory } from '../../modules/planning/services/planningService.js'

export async function createPlanningDetailsModal(container, { indicator, claseId, maestroId, routeVersionId }) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    overflow-y: auto;
  `

  const modal = document.createElement('div')
  modal.style.cssText = `
    background: var(--pm-surface);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 700px;
    width: 90%;
    margin: 2rem auto;
    animation: pm-modal-in 0.2s ease-out;
  `

  modal.innerHTML = `
    <style>
      @keyframes pm-modal-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .pm-details-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid var(--pm-border);
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: white;
        border-radius: 16px 16px 0 0;
      }

      .pm-details-title {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0;
      }

      .pm-details-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .pm-details-close:hover {
        transform: rotate(90deg);
      }

      .pm-details-content {
        padding: 2rem;
        max-height: 70vh;
        overflow-y: auto;
      }

      .pm-details-progress {
        margin-bottom: 2rem;
      }

      .pm-details-progress-title {
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 0.75rem;
      }

      .pm-details-progress-bar {
        width: 100%;
        height: 10px;
        background: var(--pm-border);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .pm-details-progress-fill {
        height: 100%;
        background: var(--pm-primary);
        transition: width 0.3s;
      }

      .pm-details-progress-label {
        font-size: 0.9rem;
        color: var(--pm-text-muted);
      }

      .pm-details-section {
        margin-bottom: 2rem;
      }

      .pm-details-section-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--pm-text);
        margin-bottom: 1rem;
      }

      .pm-details-observation {
        background: var(--pm-surface-2);
        border-left: 4px solid var(--pm-primary);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .pm-details-obs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .pm-details-obs-date {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--pm-text);
      }

      .pm-details-obs-calificacion {
        font-size: 0.8rem;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        background: var(--pm-primary);
        color: white;
      }

      .pm-details-obs-descripcion {
        font-size: 0.9rem;
        color: var(--pm-text);
        margin-bottom: 0.75rem;
        line-height: 1.4;
      }

      .pm-details-obs-students {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: 0.85rem;
      }

      .pm-details-obs-student-badge {
        background: var(--pm-primary);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }

      .pm-details-student-summary {
        background: var(--pm-surface-2);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 0.75rem;
      }

      .pm-details-student-name {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--pm-text);
        margin-bottom: 0.25rem;
      }

      .pm-details-student-status {
        font-size: 0.85rem;
        color: var(--pm-text-muted);
      }

      .pm-details-student-status.vio {
        color: #4ade80;
      }

      .pm-details-footer {
        padding: 1.5rem;
        border-top: 1px solid var(--pm-border);
        text-align: right;
      }

      .pm-details-btn-close {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        border: none;
        background: var(--pm-primary);
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pm-details-btn-close:hover {
        background: #0056b3;
      }
    </style>

    <div class="pm-details-header">
      <h2 class="pm-details-title" id="pm-details-title">Detalles del Indicador</h2>
      <button class="pm-details-close" id="pm-details-close">✕</button>
    </div>

    <div class="pm-details-content" id="pm-details-body">
      <p style="text-align: center; color: var(--pm-text-muted);">Cargando...</p>
    </div>

    <div class="pm-details-footer">
      <button class="pm-details-btn-close" id="pm-details-close-btn">Cerrar</button>
    </div>
  `

  overlay.appendChild(modal)
  container.appendChild(overlay)

  // Cargar historial
  try {
    const history = await getIndicatorHistory(indicator.node_id, routeVersionId, maestroId, claseId)

    const progreso = (history.progreso_porcentaje / 100) * 100

    let html = `
      <div class="pm-details-progress">
        <div class="pm-details-progress-title">Progreso General</div>
        <div class="pm-details-progress-bar">
          <div class="pm-details-progress-fill" style="width: ${progreso}%"></div>
        </div>
        <div class="pm-details-progress-label">
          ${history.estudiantes_vieron}/${history.estudiantes_totales} alumnos (${history.progreso_porcentaje}%)
          • ${history.estado.label}
        </div>
      </div>

      <div class="pm-details-section">
        <div class="pm-details-section-title">📋 Historial de Observaciones</div>
        ${
          history.observaciones.length === 0
            ? '<p style="color: var(--pm-text-muted);">Aún no hay observaciones registradas</p>'
            : history.observaciones
                .map(
                  (obs) => `
          <div class="pm-details-observation">
            <div class="pm-details-obs-header">
              <span class="pm-details-obs-date">📅 ${new Date(obs.fecha).toLocaleDateString('es-ES')}</span>
              <span class="pm-details-obs-calificacion">${obs.calificacion === 'bien' ? '✓' : obs.calificacion === 'regular' ? '◐' : '✗'} ${obs.calificacion}</span>
            </div>
            ${obs.descripcion ? `<p class="pm-details-obs-descripcion">"${obs.descripcion}"</p>` : ''}
            <div class="pm-details-obs-students">
              ${obs.estudiantes
                .map(
                  (est) => `
                <span class="pm-details-obs-student-badge">${est.nombre}</span>
              `
                )
                .join('')}
            </div>
          </div>
        `
                )
                .join('')
        }
      </div>

      <div class="pm-details-section">
        <div class="pm-details-section-title">👥 Resumen por Estudiante</div>
        ${history.resumen_estudiantes
          .map(
            (est) => `
          <div class="pm-details-student-summary">
            <div class="pm-details-student-name">${est.nombre}</div>
            <div class="pm-details-student-status ${est.vio ? 'vio' : ''}">
              ${est.vio ? `✓ Vio el contenido (${est.calificacion}) — ${new Date(est.fecha).toLocaleDateString('es-ES')}` : '✗ Aún no ha visto'}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `

    document.getElementById('pm-details-body').innerHTML = html
    document.getElementById('pm-details-title').textContent = `${history.nombre} — Historial Completo`
  } catch (err) {
    console.error('[details] Error cargando historial:', err)
    document.getElementById('pm-details-body').innerHTML =
      '<p style="color: var(--pm-text-muted); text-align: center;">Error cargando información</p>'
  }

  // Cerrar
  function _close() {
    overlay.remove()
  }

  document.getElementById('pm-details-close').addEventListener('click', _close)
  document.getElementById('pm-details-close-btn').addEventListener('click', _close)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) _close()
  })
}
