import { escHTML } from '../utils/portalUtils.js';
import supabase from '../../lib/supabaseClient.js';

const STATUS_ICONS = {
  approved: '✅',
  in_process: '🔄',
  pending: '⏳',
  failed: '❌',
};

/**
 * "Boss Level" confirmation modal.
 * Shows node progress for a level and lets the teacher confirm completion.
 */
export function createLevelCompletionModal({ studentId, levelId, onConfirm }) {
  let overlay = null;

  async function open() {
    // Fetch level info
    const { data: level, error: levelErr } = await supabase
      .from('levels')
      .select('*')
      .eq('id', levelId)
      .single();

    if (levelErr) {
      console.error('Error fetching level:', levelErr);
      return;
    }

    // Fetch node progress joined with node info
    const { data: progress, error: progErr } = await supabase
      .from('student_node_progress')
      .select('status, nodes(name, is_critical, order_index)')
      .eq('student_id', studentId)
      .eq('nodes.level_id', levelId)
      .order('nodes(order_index)', { ascending: true });

    if (progErr) {
      console.error('Error fetching node progress:', progErr);
      return;
    }

    // Filter out rows where the join didn't match (nodes is null)
    const nodes = (progress || []).filter(p => p.nodes);
    const allApproved = nodes.length > 0 && nodes.every(p => p.status === 'approved');

    // Build node list HTML
    const nodesHTML = nodes.map(p => {
      const icon = STATUS_ICONS[p.status] || '⏳';
      const criticalBadge = p.nodes.is_critical
        ? '<span class="pm-level-modal-critical">Crítico</span>'
        : '';
      return `
        <li class="pm-level-modal-node">
          <span class="pm-level-modal-node-icon">${icon}</span>
          <span class="pm-level-modal-node-name">${escHTML(p.nodes.name)}</span>
          ${criticalBadge}
        </li>`;
    }).join('');

    // Remove previous modal if any
    const existing = document.getElementById('pm-level-completion-modal');
    if (existing) existing.remove();

    overlay = document.createElement('div');
    overlay.id = 'pm-level-completion-modal';
    overlay.className = 'pm-drawer-overlay';

    overlay.innerHTML = `
      <div class="pm-level-modal">
        <div class="pm-level-modal-header">
          <button class="pm-level-modal-close" id="pm-level-modal-close">&times;</button>
          <i class="bi bi-trophy pm-level-modal-icon"></i>
          <h3 class="pm-level-modal-title">¡Nivel Completado!</h3>
          <p class="pm-level-modal-level-name">${escHTML(level.name || level.title || '')}</p>
        </div>

        <ul class="pm-level-modal-nodes">
          ${nodesHTML}
        </ul>

        ${allApproved ? `
          <div class="pm-level-modal-confirm-section">
            <label class="pm-level-modal-label" for="pm-level-modal-notes">Notas finales del maestro</label>
            <textarea id="pm-level-modal-notes" class="pm-level-modal-textarea" rows="3" placeholder="Observaciones opcionales..."></textarea>
            <button class="pm-btn pm-btn-primary pm-btn-block pm-level-modal-btn" id="pm-level-modal-confirm">
              Confirmar Aprobación
            </button>
          </div>
        ` : `
          <div class="pm-level-modal-warning">
            <i class="bi bi-exclamation-triangle"></i>
            <span>Faltan nodos por aprobar</span>
          </div>
          <button class="pm-btn pm-btn-primary pm-btn-block pm-level-modal-btn" disabled>
            Confirmar Aprobación
          </button>
        `}
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => overlay.classList.add('open'), 10);

    // Close handlers
    const closeBtn = overlay.querySelector('#pm-level-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    // Confirm handler
    const confirmBtn = overlay.querySelector('#pm-level-modal-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Guardando...';

        const notes = overlay.querySelector('#pm-level-modal-notes')?.value || '';

        const { error } = await supabase
          .from('student_level_progress')
          .update({
            status: 'approved',
            completed_at: new Date().toISOString(),
            teacher_notes: notes,
          })
          .eq('student_id', studentId)
          .eq('level_id', levelId);

        if (error) {
          console.error('Error updating level progress:', error);
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Confirmar Aprobación';
          return;
        }

        if (typeof onConfirm === 'function') onConfirm({ studentId, levelId, notes });
        close();
      });
    }
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay?.remove();
      overlay = null;
    }, 400);
  }

  function destroy() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  return { open, close, destroy };
}
