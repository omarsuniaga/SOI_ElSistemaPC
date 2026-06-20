import { escHTML } from '../utils/portalUtils.js';
import { academicService } from '../../modules/academic-routes/services/academicService.js';

/**
 * Componente para evaluar un indicador individual dentro de un nodo.
 */
export function createNodeEvaluationCard(container, { indicator, sessionId, studentId, teacherId, onSave }) {
  const status = indicator.status || 'pending'; // 'approved', 'failed', 'in_process', 'pending'
  const token = academicService.getStatusToken(status);
  
  const card = document.createElement('div');
  card.className = `pm-node-eval-card pm-animate-fade-in status-${status}`;
  card.dataset.indicatorId = indicator.indicator_id;

  card.innerHTML = `
    <div class="pm-eval-card-header">
      <div class="pm-eval-node-info">
        <span class="pm-eval-node-name">${escHTML(indicator.node_name)}</span>
        <p class="pm-eval-indicator-desc">${escHTML(indicator.indicator_description || 'Evaluación de nodo')}</p>
      </div>
      ${indicator.is_critical ? '<span class="pm-badge-critical" title="Nodo Crítico"><i class="bi bi-exclamation-octagon"></i></span>' : ''}
    </div>

    <div class="pm-eval-status-selector">
      <button class="pm-eval-btn btn-approved ${status === 'approved' ? 'active' : ''}" data-status="approved">
        <i class="bi bi-check-lg"></i> Logrado
      </button>
      <button class="pm-eval-btn btn-in-process ${status === 'in_process' ? 'active' : ''}" data-status="in_process">
        <i class="bi bi-arrow-repeat"></i> En Proceso
      </button>
      <button class="pm-eval-btn btn-failed ${status === 'failed' ? 'active' : ''}" data-status="failed">
        <i class="bi bi-x-lg"></i> No Logrado
      </button>
    </div>

    <div class="pm-eval-feedback-area">
      <textarea placeholder="Feedback pedagógico (opcional)..." class="pm-eval-feedback-input">${escHTML(indicator.feedback || '')}</textarea>
    </div>

    <div class="pm-eval-card-footer">
      <span class="pm-eval-save-status"></span>
    </div>
  `;

  // Eventos
  const buttons = card.querySelectorAll('.pm-eval-btn');
  const feedbackInput = card.querySelector('.pm-eval-feedback-input');
  const statusMsg = card.querySelector('.pm-eval-save-status');

  let saveTimeout = null;

  const handleSave = async (newStatus = null) => {
    const currentStatus = newStatus || card.dataset.status || status;
    statusMsg.innerHTML = '<i class="pm-spinner-sm"></i> Guardando...';
    
    try {
      const payload = {
        student_id: studentId,
        indicator_id: indicator.indicator_id,
        session_id: sessionId,
        created_by: teacherId,
        status: currentStatus,
        feedback: feedbackInput.value,
        attempt_number: (indicator.attempt_number || 0) + 1
      };

      await academicService.saveIndicatorAttempt(payload);
      
      statusMsg.innerHTML = '<i class="bi bi-check-all"></i> Guardado localmente';
      card.className = `pm-node-eval-card status-${currentStatus}`;
      
      if (onSave) onSave(payload);
    } catch (err) {
      console.error('Error saving evaluation:', err);
      statusMsg.innerHTML = '<i class="bi bi-exclamation-circle"></i> Error al guardar';
    }
  };

  buttons.forEach(btn => {
    btn.onclick = () => {
      const newStatus = btn.dataset.status;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      card.dataset.status = newStatus;
      handleSave(newStatus);
    };
  });

  feedbackInput.oninput = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => handleSave(), 1500);
  };

  container.appendChild(card);
}
