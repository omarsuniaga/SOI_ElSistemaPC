/**
 * ViewInfoModal.js
 * Componente y helper reutilizable para abrir el modal informativo y de onboarding
 * contextual para cualquier vista o módulo del sistema.
 */

import { AppModal } from './AppModal.js'
import { escapeHTML } from '../utils/sanitize.js'
import { VIEWS_DOC_CATALOG } from '../docs/viewsDocCatalog.js'

/**
 * Genera el HTML del botón de información contextual para el header de la vista.
 * @param {string} routeId - ID de la ruta / vista según VIEWS_DOC_CATALOG
 * @param {object} options - Opciones de estilo adicionales
 * @returns {string} HTML string del botón
 */
export function renderViewInfoButton(routeId, options = {}) {
  const { className = 'btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 rounded-3 fw-semibold shadow-xs' } = options
  return `
    <button class="${className} btn-view-info" data-view-info="${routeId}" title="Guía y explicación de esta vista" style="font-size:0.78rem;">
      <i class="bi bi-info-circle-fill"></i>
      <span class="d-none d-sm-inline">Info</span>
    </button>
  `
}

/**
 * Vincula el evento click a todos los botones .btn-view-info dentro del contenedor.
 * @param {HTMLElement} container - Contenedor DOM
 */
export function attachViewInfoEvents(container) {
  if (!container) return

  const buttons = container.querySelectorAll('.btn-view-info')
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const routeId = btn.dataset.viewInfo
      showViewInfoModal(routeId)
    })
  })
}

/**
 * Abre el modal con la documentación estructurada de la vista.
 * @param {string} routeId - ID de la ruta en el catálogo
 */
export function showViewInfoModal(routeId) {
  const doc = VIEWS_DOC_CATALOG[routeId]

  if (!doc) {
    AppModal.open({
      title: 'Guía de la Vista',
      body: `
        <div class="p-3 text-center text-muted">
          <i class="bi bi-info-circle fs-2 d-block mb-2 text-primary"></i>
          <p class="mb-0">Documentación en proceso de integración para la ruta <code>${escapeHTML(routeId || '')}</code>.</p>
        </div>
      `,
      saveText: 'Entendido',
      hideSave: true,
      cancelText: 'Cerrar'
    })
    return
  }

  const workflowHTML = (doc.workflow || []).map((step, idx) => `
    <li class="p-3 mb-2 rounded-3 bg-body-tertiary border border-body-secondary d-flex align-items-start gap-3 shadow-2xs">
      <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold" style="width: 26px; height: 26px; font-size: 0.78rem; margin-top: 1px;">
        ${idx + 1}
      </span>
      <span class="text-body" style="font-size: 0.88rem; line-height: 1.5;">${escapeHTML(step)}</span>
    </li>
  `).join('')

  const keyRulesHTML = (doc.keyRules || []).map(rule => `
    <li class="p-3 mb-2 rounded-3 bg-body-tertiary border border-body-secondary d-flex align-items-start gap-3 shadow-2xs">
      <i class="bi bi-shield-check text-success flex-shrink-0" style="margin-top: 2px; font-size: 1.1rem;"></i>
      <span class="text-body" style="font-size: 0.88rem; line-height: 1.5;">${escapeHTML(rule)}</span>
    </li>
  `).join('')

  const modalBody = `
    <div class="container-fluid p-2 p-md-3">
      
      <!-- Banner Superior con Resumen y Metadatos -->
      <div class="p-3.5 p-md-4 rounded-4 bg-primary-subtle border border-primary-subtle mb-4 shadow-xs">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2.5">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary text-white py-1.5 px-3 rounded-pill fw-semibold" style="font-size: 0.8rem;">
              <i class="bi ${doc.icon || 'bi-info-circle'} me-1.5"></i>Módulo: ${escapeHTML(doc.group || 'General')}
            </span>
            <span class="badge bg-body text-body-secondary border border-body-secondary py-1.5 px-2.5 rounded-pill" style="font-size: 0.75rem;">
              Código: <code>${escapeHTML(doc.routeId)}</code>
            </span>
          </div>
          <span class="badge bg-success-subtle text-success border border-success-subtle py-1.5 px-3 rounded-pill" style="font-size: 0.75rem;">
            <i class="bi bi-check-circle-fill me-1"></i>Documentación Oficial SOI
          </span>
        </div>
        <h5 class="fw-bold text-body mb-2" style="font-size: 1.05rem;">Propósito y Función Institucional</h5>
        <p class="mb-0 text-body" style="font-size: 0.92rem; line-height: 1.55;">
          ${escapeHTML(doc.summary)}
        </p>
      </div>

      <!-- Cuadrícula 2 Columnas: Flujo de Trabajo vs Reglas -->
      <div class="row g-4">
        
        <!-- Columna Izquierda: Flujo de Trabajo -->
        <div class="col-12 col-lg-6">
          <div class="h-100 p-3.5 rounded-4 bg-body border border-body-secondary shadow-xs d-flex flex-direction-column">
            <div class="d-flex align-items-center justify-content-between pb-2.5 mb-3 border-bottom border-body-secondary">
              <h6 class="fw-bold text-body mb-0 d-flex align-items-center gap-2" style="font-size: 0.98rem;">
                <i class="bi bi-play-circle-fill text-primary fs-5"></i> Flujo de Trabajo & Modo de Uso
              </h6>
              <span class="badge bg-secondary-subtle text-secondary rounded-pill" style="font-size: 0.72rem;">
                ${(doc.workflow || []).length} pasos
              </span>
            </div>
            <ul class="list-unstyled mb-0 d-flex flex-column gap-1 flex-grow-1">
              ${workflowHTML}
            </ul>
          </div>
        </div>

        <!-- Columna Derecha: Reglas de Negocio & Control -->
        <div class="col-12 col-lg-6">
          <div class="h-100 p-3.5 rounded-4 bg-body border border-body-secondary shadow-xs d-flex flex-direction-column">
            <div class="d-flex align-items-center justify-content-between pb-2.5 mb-3 border-bottom border-body-secondary">
              <h6 class="fw-bold text-body mb-0 d-flex align-items-center gap-2" style="font-size: 0.98rem;">
                <i class="bi bi-shield-shaded text-success fs-5"></i> Reglas de Negocio & Consideraciones
              </h6>
              <span class="badge bg-success-subtle text-success rounded-pill" style="font-size: 0.72rem;">
                Validaciones Clave
              </span>
            </div>
            <ul class="list-unstyled mb-0 d-flex flex-column gap-1 flex-grow-1">
              ${keyRulesHTML}
            </ul>
          </div>
        </div>

      </div>

    </div>
  `

  AppModal.open({
    title: `<i class="bi ${doc.icon || 'bi-info-circle'} text-primary me-2"></i> ${escapeHTML(doc.title)}`,
    size: 'fullscreen',
    saveText: '¡Entendido!',
    cancelText: 'Cerrar',
    body: modalBody,
    onSave: () => {
      AppModal.close()
    }
  })
}
