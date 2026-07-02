import { escHTML } from '../utils/portalUtils.js';

/**
 * AchievementsSummaryModal: Muestra un resumen de los logros alcanzados tras la sesión.
 * Diseño inspirado en Apple (Glassmorphism, feedback positivo).
 */
export function createAchievementsSummaryModal(container, results) {
  if (!results || results.length === 0) return;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'pm-modal-overlay pm-animate-fade-in';
  modalOverlay.style.zIndex = '9999';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'pm-modal-content pm-achievements-modal pm-animate-scale-up';
  
  // Icono principal de Logro
  const headerIcon = `
    <div class="pm-achievement-header-icon">
      <i class="bi bi-trophy-fill"></i>
    </div>
  `;

  const achievementsHtml = results.map(res => `
    <div class="pm-achievement-item">
      <div class="pm-achievement-student">
        <span class="pm-student-name">${escHTML(res.studentName)}</span>
      </div>
      ${res.planningContext ? `
        <div class="pm-achievement-context">
          <div class="pm-achievement-context-title">Guía ACM · Semana ${escHTML(String(res.planningContext.currentWeek || '—'))}</div>
          ${res.planningContext.topic ? `<div class="pm-achievement-context-line"><strong>Tema:</strong> ${escHTML(res.planningContext.topic)}</div>` : ''}
          ${res.planningContext.objective ? `<div class="pm-achievement-context-line"><strong>Objetivo:</strong> ${escHTML(res.planningContext.objective)}</div>` : ''}
          ${res.planningContext.hasTeacherAdjustment ? `<div class="pm-achievement-context-line"><strong>Ajuste docente:</strong> aplicado</div>` : ''}
        </div>
      ` : ''}
      <div class="pm-achievement-details">
        ${res.approvedNodes.map(node => `
          <div class="pm-badge-node">
            <i class="bi bi-check-circle-fill"></i>
            <span>${escHTML(node)}</span>
          </div>
        `).join('')}
        ${res.levelPromoted ? `
          <div class="pm-badge-level">
            <i class="bi bi-arrow-up-circle-fill"></i>
            <span>Promovido a: ${escHTML(res.levelPromoted)}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  modalContent.innerHTML = `
    <style>
      .pm-achievements-modal {
        max-width: 400px;
        text-align: center;
        padding: 2rem;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        border: 1px solid rgba(255,255,255,0.3);
      }
      .pm-achievement-header-icon {
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: white;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        margin: 0 auto 1.5rem;
        box-shadow: 0 10px 20px rgba(255, 165, 0, 0.3);
      }
      .pm-achievements-title {
        font-size: 1.5rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        color: var(--apple-text);
      }
      .pm-achievements-subtitle {
        font-size: 0.95rem;
        color: var(--apple-text-muted);
        margin-bottom: 2rem;
      }
      .pm-achievements-list {
        text-align: left;
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 2rem;
        padding-right: 5px;
      }
      .pm-achievement-item {
        background: rgba(0,0,0,0.03);
        border-radius: 16px;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      .pm-achievement-context {
        margin-bottom: 0.75rem;
        padding: 0.75rem;
        border-radius: 12px;
        background: rgba(0, 122, 255, 0.08);
        border: 1px solid rgba(0, 122, 255, 0.15);
      }
      .pm-achievement-context-title {
        font-size: 0.8rem;
        font-weight: 800;
        color: #007aff;
        margin-bottom: 0.35rem;
      }
      .pm-achievement-context-line {
        font-size: 0.76rem;
        color: var(--apple-text-muted);
        line-height: 1.35;
      }
      .pm-student-name {
        font-weight: 700;
        font-size: 1rem;
        display: block;
        margin-bottom: 0.5rem;
      }
      .pm-achievement-details {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .pm-badge-node {
        background: rgba(52, 199, 89, 0.1);
        color: #248a3d;
        padding: 4px 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .pm-badge-level {
        background: rgba(0, 122, 255, 0.1);
        color: #007aff;
        padding: 4px 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
        margin-top: 4px;
      }
      .pm-btn-finish {
        width: 100%;
        padding: 14px;
        border-radius: 16px;
        border: none;
        background: var(--apple-text);
        color: white;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pm-btn-finish:active { transform: scale(0.98); opacity: 0.9; }
    </style>
    
    ${headerIcon}
    <h2 class="pm-achievements-title">¡Logros alcanzados!</h2>
    <p class="pm-achievements-subtitle">Los alumnos han avanzado en su ruta académica hoy.</p>
    
    <div class="pm-achievements-list">
      ${achievementsHtml}
    </div>
    
    <button class="pm-btn-finish" id="pm-achievements-close">Continuar</button>
  `;

  modalOverlay.appendChild(modalContent);
  container.appendChild(modalOverlay);

  return new Promise((resolve) => {
    modalContent.querySelector('#pm-achievements-close').onclick = () => {
      modalOverlay.classList.remove('pm-animate-fade-in');
      modalOverlay.classList.add('pm-animate-fade-out');
      modalContent.classList.add('pm-animate-scale-down');
      setTimeout(() => {
        modalOverlay.remove();
        resolve();
      }, 300);
    };
  });
}
