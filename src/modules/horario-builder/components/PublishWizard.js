/**
 * PublishWizard.js
 * 3-stage publication workflow for a schedule run.
 * Stages: borrador → revision → publicado
 */

const STAGES = ['borrador', 'revision', 'publicado'];

const STAGE_LABELS = {
  borrador: 'Borrador',
  revision: 'Revisión',
  publicado: 'Publicado',
};

/**
 * Builds a feedback item DOM element safely using textContent.
 * Prevents XSS by avoiding innerHTML injection of user data.
 *
 * @param {Object} item - Feedback item with { tipo, comentario }
 * @returns {HTMLLIElement}
 */
function buildFeedbackItem(item) {
  const li = document.createElement('li');
  li.className = 'pw-feedback-item d-flex align-items-start gap-2 mb-1';

  const badge = document.createElement('span');
  badge.className = 'badge bg-secondary';
  badge.textContent = item.tipo;  // safe — textContent, not innerHTML

  const text = document.createElement('span');
  text.textContent = item.comentario;  // safe

  li.appendChild(badge);
  li.appendChild(text);
  return li;
}

/**
 * Renders the PublishWizard into a container element.
 *
 * @param {HTMLElement} container
 * @param {Object} options
 * @param {string}   options.runId          - UUID of the current schedule run
 * @param {string}   options.estadoActual   - 'borrador' | 'revision' | 'publicado'
 * @param {boolean}  options.isAdmin        - Whether current user can approve
 * @param {Array}    options.feedback       - Array of feedback objects (from getRunFeedback)
 * @param {Function} options.onEstadoChange - Called when estado changes: onEstadoChange(newEstado)
 * @param {Function} options.onFeedbackAdd  - Called when user adds feedback: onFeedbackAdd({ comentario, tipo })
 */
export function renderPublishWizard(container, {
  runId,
  estadoActual,
  isAdmin,
  feedback = [],
  onEstadoChange,
  onFeedbackAdd,
}) {
  const currentIndex = STAGES.indexOf(estadoActual);

  // Build stage indicators
  const stagesHTML = STAGES.map((stage, i) => {
    let cls = 'pw-stage';
    if (i === currentIndex) cls += ' pw-stage--active';
    else if (i < currentIndex) cls += ' pw-stage--done';

    const connector = i < STAGES.length - 1
      ? '<div class="pw-stage-connector"></div>'
      : '';

    return `
      <div class="${cls}" data-stage="${stage}">
        <span class="pw-stage-dot"></span>
        <span class="pw-stage-label">${STAGE_LABELS[stage]}</span>
      </div>
      ${connector}
    `;
  }).join('');

  // Placeholder for feedback list (will be populated safely via DOM API)
  // This prevents XSS by avoiding innerHTML interpolation of user data
  const feedbackPlaceholder = '';

  // Build approve button (admin only)
  const approveHTML = isAdmin
    ? `<button class="btn btn-success btn-sm mt-2 pw-approve-btn">
        <i class="bi bi-check-circle"></i> Aprobar y publicar
       </button>`
    : '';

  container.innerHTML = `
    <div class="pw-wizard">
      <!-- Stage indicators -->
      <div class="pw-stages d-flex align-items-center gap-2 mb-3">
        ${stagesHTML}
      </div>

      <!-- Stage content -->
      <div class="pw-content">
        <!-- Stage 1: borrador -->
        <div class="pw-panel" data-panel="borrador" ${estadoActual !== 'borrador' ? 'hidden' : ''}>
          <p>El horario está en borrador. Envialo a revisión cuando esté listo.</p>
          <button class="btn btn-primary btn-sm pw-send-revision-btn">
            <i class="bi bi-send"></i> Enviar a revisión
          </button>
        </div>

        <!-- Stage 2: revision -->
        <div class="pw-panel" data-panel="revision" ${estadoActual !== 'revision' ? 'hidden' : ''}>
          <h6>Comentarios y revisión</h6>
          <ul class="pw-feedback-list list-unstyled mb-2">
          </ul>
          <div class="pw-feedback-form d-flex gap-2">
            <input type="text" class="form-control form-control-sm pw-feedback-input"
                   placeholder="Agregar comentario...">
            <button class="btn btn-sm btn-outline-secondary pw-add-feedback-btn">
              <i class="bi bi-chat-dots"></i>
            </button>
          </div>
          ${approveHTML}
        </div>

        <!-- Stage 3: publicado -->
        <div class="pw-panel" data-panel="publicado" ${estadoActual !== 'publicado' ? 'hidden' : ''}>
          <div class="alert alert-success">
            <i class="bi bi-check-circle-fill"></i>
            Horario publicado. Ya es visible para todos los usuarios.
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire up events
  const sendBtn = container.querySelector('.pw-send-revision-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => onEstadoChange?.('revision'));
  }

  const approveBtn = container.querySelector('.pw-approve-btn');
  if (approveBtn) {
    approveBtn.addEventListener('click', () => onEstadoChange?.('publicado'));
  }

  const addFeedbackBtn = container.querySelector('.pw-add-feedback-btn');
  const feedbackInput = container.querySelector('.pw-feedback-input');

  function submitFeedback() {
    const comentario = feedbackInput?.value?.trim();
    if (!comentario) return;
    onFeedbackAdd?.({ comentario, tipo: 'observacion' });
    if (feedbackInput) feedbackInput.value = '';
  }

  if (addFeedbackBtn) {
    addFeedbackBtn.addEventListener('click', submitFeedback);
  }

  if (feedbackInput) {
    feedbackInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitFeedback();
    });
  }

  // Populate feedback list safely using DOM API (prevents XSS)
  const feedbackList = container.querySelector('.pw-feedback-list');
  if (feedbackList) {
    feedbackList.innerHTML = '';  // clear any placeholder
    (feedback || []).forEach(item => feedbackList.appendChild(buildFeedbackItem(item)));
  }
}
