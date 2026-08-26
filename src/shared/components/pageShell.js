import { escapeHTML } from '../utils/sanitize.js'

/**
 * Build a page header with icon, title, subtitle, and action buttons.
 *
 * @param {{ icon: string, title: string, subtitle: string, actionsHtml?: string, headerClass?: string, titleClass?: string }} params
 */
export function renderPageHeader({ icon, title, subtitle, actionsHtml, headerClass = 'page-header-premium', titleClass = '' }) {
  const defaultTitleClass = (title || '').toLowerCase().replace(/\s+/g, '-') + '-title-premium'
  const combinedTitleClass = `page-title-premium ${defaultTitleClass} ${titleClass}`.trim()

  return `
    <div class="${headerClass} mb-4">
      <div class="d-flex align-items-center gap-3">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px; flex-shrink: 0;">
          <i class="bi ${icon} fs-4"></i>
        </div>
        <div>
          <h1 class="${combinedTitleClass} mb-0">${escapeHTML(title)}</h1>
          <p class="text-muted small mb-0">${subtitle || ''}</p>
        </div>
      </div>
      <div class="page-header-actions d-flex align-items-center gap-2 flex-wrap">
        ${actionsHtml || ''}
      </div>
    </div>
  `
}


/**
 * Build a collapsible filter panel with header, badge count, and body.
 *
 * @param {{ isOpen: boolean, filtersHtml: string, onToggleId?: string, badgeId?: string, subtitle?: string }} params
 */
export function renderFilterPanel({ isOpen, filtersHtml, onToggleId = 'btnToggleFiltros', badgeId = 'filtrosBadgeCount', subtitle = 'Busca y segmenta los datos visibles' }) {
  return `
    <div class="filters-panel mb-4">
      <div class="filters-panel__header">
        <div class="d-flex align-items-center gap-2">
          <div class="filters-panel__icon">
            <i class="bi bi-funnel"></i>
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <div class="filters-panel__title">Filtros</div>
              <span class="badge text-bg-primary rounded-pill d-none" id="${badgeId}" style="font-size: 0.7rem;">0</span>
            </div>
            <div class="filters-panel__subtitle text-muted small">${subtitle}</div>
          </div>
        </div>
        <button class="btn btn-outline-secondary btn-sm" id="${onToggleId}" type="button" aria-expanded="${isOpen ? 'true' : 'false'}" title="${isOpen ? 'Ocultar filtros' : 'Mostrar filtros'}" aria-label="${isOpen ? 'Ocultar filtros' : 'Mostrar filtros'}">
          <i class="bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
        </button>
      </div>
      <div class="filters-panel__body ${isOpen ? 'is-open' : 'is-collapsed'}" id="${onToggleId}Body">
        <div class="filter-toolbar flex-wrap gap-2">
          ${filtersHtml}
        </div>
      </div>
    </div>
  `
}

