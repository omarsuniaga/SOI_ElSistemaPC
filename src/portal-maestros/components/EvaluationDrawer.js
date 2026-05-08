import { escHTML } from '../utils/portalUtils.js';
import { createNodeEvaluationCard } from './NodeEvaluationCard.js';

/**
 * Drawer lateral para la evaluación de un alumno (Apple-style).
 * @version 2025.05.06 - FIX: addEventListener con null checks
 */
export function createEvaluationDrawer(parentContainer, { student, sessionId, teacherId, snapshots = [] }) {
  // Eliminar drawer previo si existe
  const existing = document.getElementById('pm-evaluation-drawer');
  if (existing) existing.remove();

  const drawer = document.createElement('div');
  drawer.id = 'pm-evaluation-drawer';
  drawer.className = 'pm-drawer-overlay';
  
  drawer.innerHTML = `
    <div class="pm-drawer">
      <div class="pm-drawer-header">
        <div class="pm-drawer-title-group">
          <h4 class="pm-drawer-title">Evaluar Avance</h4>
          <p class="pm-drawer-subtitle" style="font-size: 0.85rem; color: var(--pm-text-muted); margin: 0;">${escHTML(student.nombre_completo)}</p>
        </div>
        <button class="pm-drawer-close" id="pm-close-eval-drawer">&times;</button>
      </div>
      
      <div class="pm-drawer-body pm-scroll-y">
        ${snapshots.length === 0 ? `
          <div class="pm-empty-state" style="text-align:center; padding: 2rem; color: var(--pm-text-muted);">
            <i class="bi bi-journal-check" style="font-size: 2.5rem; display: block; margin-bottom: 1rem;"></i>
            <p>No hay objetivos planificados para esta sesión.</p>
          </div>
        ` : `
          <div id="pm-evaluation-cards-container" class="pm-eval-list"></div>
        `}
      </div>
      
      <div class="pm-drawer-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border);">
        <button class="pm-btn pm-btn-primary pm-btn-block" id="pm-finish-eval" style="width:100%">Listo</button>
      </div>
    </div>
  `;

  parentContainer.appendChild(drawer);

  const container = drawer.querySelector('#pm-evaluation-cards-container');
  if (container) {
    snapshots.forEach(snapshot => {
      createNodeEvaluationCard(container, {
        indicator: snapshot,
        sessionId,
        studentId: student.id,
        teacherId,
        onSave: (data) => {
          console.log('Progress saved:', data);
        }
      });
    });
  }

  // Animación de entrada
  setTimeout(() => drawer.classList.add('open'), 10);

  const close = () => {
    drawer.classList.remove('open');
    setTimeout(() => drawer.remove(), 400);
  };

  const closeBtn = drawer.querySelector('#pm-close-eval-drawer');
  const finishBtn = drawer.querySelector('#pm-finish-eval');
  
  if (closeBtn) closeBtn.addEventListener('click', close);
  // El drawer mismo es el overlay
  drawer.addEventListener('click', (e) => { if (e.target === drawer) close(); });
  if (finishBtn) finishBtn.addEventListener('click', close);

  return { close };
}
