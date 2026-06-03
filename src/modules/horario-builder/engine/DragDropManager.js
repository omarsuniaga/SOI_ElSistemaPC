// src/modules/horario-builder/engine/DragDropManager.js

import { detectConflicts } from './conflictDetector.js';
import { minutesBetween, addMinutes } from '../utils/timeUtils.js';

/**
 * Shows a modal warning when a drop would create a conflict.
 * Returns a Promise<boolean> — true = user confirmed the move, false = cancelled.
 *
 * @param {Object} params
 * @param {string} params.conflictDescription - Human-readable description of conflicts
 * @returns {Promise<boolean>}
 */
export function showConflictMoveModal({ conflictDescription }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.zIndex = '1040';

    const modal = document.createElement('div');
    modal.className = 'modal fade show d-block';
    modal.style.zIndex = '1050';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
              Conflicto detectado
            </h5>
          </div>
          <div class="modal-body">
            <p></p>
            <p class="text-muted small">¿Querés mover la clase de todas formas?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-action="cancel">Cancelar</button>
            <button type="button" class="btn btn-warning" data-action="confirm">Mover de todas formas</button>
          </div>
        </div>
      </div>
    `;

    const bodyP = modal.querySelector('.modal-body p');
    if (bodyP) bodyP.textContent = conflictDescription;

    function cleanup(result) {
      document.body.removeChild(modal);
      document.body.removeChild(backdrop);
      resolve(result);
    }

    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => cleanup(true));
    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => cleanup(false));

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
  });
}

/**
 * Initialises drag-and-drop on a rendered schedule grid container.
 *
 * @param {HTMLElement} gridContainer - The #hb-grid-wrapper element
 * @param {Object} options
 * @param {Array}   options.assignments   - Current assignments array (by reference or copy)
 * @param {Function} options.onMove       - Called when a block is successfully moved:
 *                                          onMove({ claseId, fromDay, fromHour, toDay, toHour })
 * @param {Function} options.onConflict   - Called when a move would create a conflict:
 *                                          onConflict({ assignment, targetDay, targetHour, conflicts })
 * @returns {{ destroy: Function }} - Call destroy() to remove all listeners
 */
export function initDragDrop(gridContainer, { assignments, onMove, onConflict }) {
  const controller = new AbortController();
  const { signal } = controller;

  let draggingClaseId = null;

  // Drag source events — delegated on gridContainer
  gridContainer.addEventListener('dragstart', (e) => {
    const block = e.target.closest('[draggable="true"][data-clase-id]');
    if (!block) return;
    draggingClaseId = block.dataset.claseId;
    block.classList.add('hb-dragging');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggingClaseId);
    }
  }, { signal });

  gridContainer.addEventListener('dragend', (e) => {
    const block = e.target.closest('[draggable="true"][data-clase-id]');
    if (block) block.classList.remove('hb-dragging');
    draggingClaseId = null;
  }, { signal });

  // Drop target events — delegated on gridContainer
  gridContainer.addEventListener('dragover', (e) => {
    const cell = e.target.closest('[data-day][data-hour]');
    if (!cell) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    if (!cell.classList.contains('hb-drop-target')) {
      cell.classList.add('hb-drop-target');
    }
  }, { signal });

  gridContainer.addEventListener('dragleave', (e) => {
    const cell = e.target.closest('[data-day][data-hour]');
    if (!cell) return;
    if (cell.contains(e.relatedTarget)) return; // still inside cell
    cell.classList.remove('hb-drop-target');
  }, { signal });

  gridContainer.addEventListener('drop', (e) => {
    const cell = e.target.closest('[data-day][data-hour]');
    if (!cell) return;
    e.preventDefault();
    cell.classList.remove('hb-drop-target');

    const claseId = draggingClaseId
      ?? (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null);

    if (!claseId) return;

    const targetDay  = cell.dataset.day;
    const targetHour = cell.dataset.hour;

    const assignment = assignments.find(a => String(a.clase_id) === String(claseId));
    if (!assignment) return;

    const fromDay  = assignment.dia;
    const fromHour = assignment.hora_inicio;

    // Build proposed list: replace the dragged assignment with the proposed position
    const proposed = assignments.map(a => {
      if (String(a.clase_id) !== String(claseId)) return a;
      const duration = minutesBetween(a.hora_inicio, a.hora_fin);
      return { ...a, dia: targetDay, hora_inicio: targetHour, hora_fin: addMinutes(targetHour, duration) };
    });

    const conflicts = detectConflicts(proposed, { gapMinutes: 0 });

    if (conflicts.length === 0) {
      onMove({ claseId, fromDay, fromHour, toDay: targetDay, toHour: targetHour });
    } else {
      onConflict({ assignment, targetDay, targetHour, conflicts });
    }
  }, { signal });

  return {
    destroy() {
      controller.abort();
    }
  };
}
