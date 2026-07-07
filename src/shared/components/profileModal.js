import { escapeHTML } from '../utils/sanitize.js'

/**
 * Build a hero card header for profile modals.
 *
 * @param {{ title, subtitle, badgesHtml, chipsHtml, actionsHtml }} params
 */
export function renderHeroCard({ title, subtitle, badgesHtml, chipsHtml, actionsHtml }) {
  return `
    <div class="hero-card d-flex align-items-start gap-3 p-3 rounded mb-4 flex-wrap" style="background: linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(88,86,214,0.08) 100%); border: 1px solid rgba(13,110,253,0.15);">
      <div class="overflow-hidden flex-grow-1">
        <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
          <h4 class="mb-0 fw-bold text-truncate" style="letter-spacing: -0.02em; font-size: 1.2rem; color: var(--bs-body-color);">${escapeHTML(title)}</h4>
          ${badgesHtml || ''}
        </div>
        ${subtitle ? `<span class="badge rounded-pill bg-success text-capitalize" style="font-size: 0.75rem;">${escapeHTML(subtitle)}</span>` : ''}
        ${chipsHtml || ''}
      </div>
      ${actionsHtml ? `<div class="hero-card-actions d-flex align-items-center gap-2 ms-auto flex-wrap">${actionsHtml}</div>` : ''}
    </div>
  `
}

/**
 * Build a glass detail item for the 2-column grid in profile modals.
 *
 * @param {{ icon, label, value }} params
 */
export function renderDetailItem({ icon, label, value }) {
  return `
    <div class="detail-item-glass p-3 rounded h-100 border">
      <small class="text-muted d-block mb-1">${icon ? `<i class="bi ${icon} me-1"></i>` : ''}${escapeHTML(label)}</small>
      <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${value}</span>
    </div>
  `
}

/**
 * Build a 2-column detail grid for profile modals.
 *
 * @param {{ items: Array<{icon, label, value}>, columns?: number }} params
 */
export function renderDetailGrid({ items, columns = 2 }) {
  const colClass = columns === 2 ? 'col-md-6' : columns === 3 ? 'col-md-4' : 'col-md-12'
  return `
    <div class="row g-3 mb-4">
      ${items.map(item => `
        <div class="${colClass}">
          ${renderDetailItem(item)}
        </div>
      `).join('')}
    </div>
  `
}
