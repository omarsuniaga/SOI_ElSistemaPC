// src/modules/horario-builder/components/ViewToggle.js

export const VIEWS = ['grid', 'teacher', 'room', 'student'];

const VIEW_LABELS = {
  grid:    { label: 'Grilla',      icon: 'bi-grid-3x3' },
  teacher: { label: 'Por Maestro', icon: 'bi-person-lines-fill' },
  room:    { label: 'Por Salón',   icon: 'bi-door-open' },
  student: { label: 'Por Alumno',  icon: 'bi-mortarboard' }
};

/**
 * Returns HTML for the pill-style view toggle bar.
 * @param {string} activeView - One of VIEWS
 * @returns {string} HTML string
 */
export function createViewToggle(activeView = 'grid') {
  const pills = VIEWS.map(v => {
    const { label, icon } = VIEW_LABELS[v];
    const isActive = v === activeView;
    return `
      <button class="vt-pill ${isActive ? 'vt-pill--active' : ''}"
              data-view="${v}"
              style="
                display:inline-flex;align-items:center;gap:5px;
                padding:0.35rem 0.85rem;border-radius:999px;
                border:1.5px solid ${isActive ? '#6366f1' : '#e2e8f0'};
                background:${isActive ? '#6366f1' : 'transparent'};
                color:${isActive ? '#fff' : '#64748b'};
                font-size:0.78rem;font-weight:600;cursor:pointer;
                transition:all 0.15s ease;
              ">
        <i class="bi ${icon}"></i>${label}
      </button>
    `;
  }).join('');

  return `
    <div class="view-toggle" style="display:flex;gap:0.4rem;flex-wrap:wrap;" role="tablist" aria-label="Modo de visualización">
      ${pills}
    </div>
  `;
}
