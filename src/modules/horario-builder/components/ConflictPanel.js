// src/modules/horario-builder/components/ConflictPanel.js

const DAY_LABELS = {
  lunes: 'Lun', martes: 'Mar', 'miércoles': 'Mié',
  jueves: 'Jue', viernes: 'Vie', 'sábado': 'Sáb'
};

/**
 * Returns HTML for the collapsible conflict panel.
 * Renders nothing (empty string) when conflicts array is empty.
 *
 * @param {Array} conflicts - Output of detectConflicts()
 * @param {boolean} expanded - Initial expanded state (default false)
 * @returns {string} HTML string
 */
export function createConflictPanel(conflicts = [], expanded = false) {
  if (conflicts.length === 0) return '';

  const count = conflicts.length;
  const rows = conflicts.map((c, i) => {
    const typeLabel = c.type === 'teacher' ? '👤 Maestro' : '🏫 Salón';
    const day = DAY_LABELS[c.day] ?? c.day;
    return `
      <div class="cp-row"
           data-conflict-ids="${c.ids.join(',')}"
           data-conflict-index="${i}"
           style="
             display:flex;align-items:flex-start;gap:0.5rem;
             padding:0.5rem 0.75rem;
             border-bottom:1px solid #fee2e2;
             cursor:pointer;
             transition:background 0.1s;
           "
           onmouseenter="this.style.background='#fff1f2'"
           onmouseleave="this.style.background='transparent'">
        <span style="background:#fecaca;color:#991b1b;border-radius:4px;padding:1px 5px;font-size:0.6rem;font-weight:700;flex-shrink:0;margin-top:1px;">${typeLabel}</span>
        <span style="font-size:0.72rem;color:#7f1d1d;line-height:1.4;">${day} ${c.hora_inicio} — ${c.description}</span>
      </div>
    `;
  }).join('');

  return `
    <div id="conflict-panel" style="border:1.5px solid #fca5a5;border-radius:0.75rem;overflow:hidden;margin-top:1rem;">
      <!-- Header (click to toggle) -->
      <div id="cp-header"
           style="
             display:flex;align-items:center;justify-content:space-between;
             padding:0.6rem 0.9rem;
             background:#fef2f2;
             cursor:pointer;
           ">
        <span style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;font-weight:700;color:#991b1b;">
          <i class="bi bi-exclamation-triangle-fill"></i>
          ${count} conflicto${count !== 1 ? 's' : ''} detectado${count !== 1 ? 's' : ''}
        </span>
        <i class="bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'}" id="cp-chevron" style="color:#991b1b;font-size:0.8rem;"></i>
      </div>
      <!-- Body -->
      <div id="cp-body" style="background:#fff5f5;display:${expanded ? 'block' : 'none'};">
        ${rows}
      </div>
    </div>
  `;
}

/**
 * Attaches the toggle click listener to the conflict panel in the DOM.
 * Call after injecting createConflictPanel() HTML into the page.
 * @param {HTMLElement} container - Parent element containing the panel
 * @param {Array} conflicts - The same conflicts array passed to createConflictPanel()
 * @param {Function} onRowClick - Called with the full conflict object when a row is clicked
 */
export function attachConflictPanelListeners(container, conflicts, onRowClick) {
  const header = container.querySelector('#cp-header');
  const body   = container.querySelector('#cp-body');
  const chev   = container.querySelector('#cp-chevron');

  header?.addEventListener('click', () => {
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    chev.className = `bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-up'}`;
  });

  container.querySelectorAll('.cp-row').forEach(row => {
    row.addEventListener('click', () => {
      const i = parseInt(row.dataset.conflictIndex, 10);
      onRowClick?.(conflicts[i]);
    });
  });
}
