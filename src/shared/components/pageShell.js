import { escapeHTML } from '../utils/sanitize.js'

/**
 * Build a page header with icon, title, subtitle, and action buttons.
 *
 * @param {{ icon, title, subtitle, actionsHtml }} params
 */
export function renderPageHeader({ icon, title, subtitle, actionsHtml }) {
  return `
    <div class="d-flex align-items-center gap-3">
      <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
        <i class="bi ${icon} fs-4"></i>
      </div>
      <div>
        <h1 class="page-title-premium mb-0">${escapeHTML(title)}</h1>
        <p class="text-muted small mb-0">${subtitle}</p>
      </div>
    </div>
    <div class="page-header-actions">
      ${actionsHtml || ''}
    </div>
  `
}

/**
 * Build a collapsible filter panel with header and body.
 *
 * @param {{ isOpen, filtersHtml, onToggleId }} params
 */
export function renderFilterPanel({ isOpen, filtersHtml, onToggleId }) {
  return `
    <div class="filters-panel">
      <div class="filters-panel__header">
        <div class="d-flex align-items-center gap-2">
          <div class="filters-panel__icon">
            <i class="bi bi-funnel"></i>
          </div>
          <div>
            <div class="filters-panel__title">Filtros</div>
            <div class="filters-panel__subtitle text-muted small">Busca y segmenta los datos visibles</div>
          </div>
        </div>
        <button class="btn btn-outline-secondary btn-sm" id="${onToggleId || 'btnToggleFiltros'}" type="button" aria-expanded="${isOpen ? 'true' : 'false'}" title="${isOpen ? 'Ocultar filtros' : 'Mostrar filtros'}">
          <i class="bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
        </button>
      </div>
      <div class="filters-panel__body ${isOpen ? 'is-open' : 'is-collapsed'}">
        <div class="filter-toolbar flex-wrap gap-2">
          ${filtersHtml}
        </div>
      </div>
    </div>
  `
}
