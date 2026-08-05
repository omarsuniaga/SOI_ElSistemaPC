import { router } from '../../../core/router/router.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { usePortalAuth } from '../../../portal-maestros/auth/usePortalAuth.js'
import { obtenerPlanificacionesExportables } from '../api/planificacionAdapter.js'
import {
  buildPlanificacionExportFilename,
  buildPlanificacionExportPayload,
  formatPlanificacionExportDate,
} from '../utils/planificacionExportUtils.js'

let _autoPrintScheduled = false

export async function renderPlanificacionPrintView(container, params = {}) {
  if (!container) return

  const scope = params.scope === 'class' ? 'class' : 'all'
  const claseId = params.claseId || params.clase || null
  const output = params.output === 'pdf' ? 'pdf' : 'html'
  const parentRoute = params.parentRoute || 'planificacion'
  const maestro = usePortalAuth.getMaestro?.() || null

  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Generando documento...</span>
      </div>
    </div>
  `

  if (!maestro?.id) {
    container.innerHTML = _renderErrorState(
      'No se pudo identificar al maestro autenticado para generar el documento.',
      parentRoute,
    )
    _attachBack(container, parentRoute)
    return
  }

  try {
    const planes = await obtenerPlanificacionesExportables({
      maestroId: maestro.id,
      claseId: scope === 'class' ? claseId : null,
      estados: ['approved'],
    })

    const payload = buildPlanificacionExportPayload({
      planes,
      maestro,
      scope,
      claseId,
    })

    document.title = buildPlanificacionExportFilename(payload, 'pdf')
    container.innerHTML = _renderPrintDocument(payload, parentRoute)
    _attachActions(container, payload, parentRoute)

    if (output === 'pdf' && payload.totalPlanificaciones > 0 && !_autoPrintScheduled) {
      _autoPrintScheduled = true
      setTimeout(() => {
        window.print?.()
        _autoPrintScheduled = false
      }, 150)
    }
  } catch (err) {
    console.error('[PlanificacionPrintView] Error:', err)
    container.innerHTML = _renderErrorState(
      err?.message || 'No se pudo generar el documento imprimible.',
      parentRoute,
    )
    _attachBack(container, parentRoute)
    AppToast.show('No se pudo generar el documento de planificación', 'error')
  }
}

function _renderPrintDocument(payload, parentRoute) {
  const isClassScope = payload.scope === 'class'
  const classes = isClassScope && payload.classDocument ? [payload.classDocument] : payload.clases
  const hasPlans = payload.totalPlanificaciones > 0
  const title = isClassScope ? 'Planificación de clase' : 'Consolidado de planificaciones'
  const subtitle = isClassScope
    ? payload.classDocument?.claseNombre || 'Clase sin nombre'
    : `${payload.totalClases} clases · ${payload.totalPlanificaciones} planificaciones aprobadas`

  return `
    <style>
      .pm-plan-print-shell {
        background: #eef2f7;
        min-height: 100%;
        padding: 1.5rem;
      }
      .pm-plan-print-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      .pm-plan-print-actions .btn-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .pm-plan-print-document {
        max-width: 960px;
        margin: 0 auto;
        background: #fff;
        color: #1f2937;
        border-radius: 1rem;
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
        overflow: hidden;
      }
      .pm-plan-print-header {
        padding: 2rem;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(135deg, #eff6ff, #ffffff);
      }
      .pm-plan-print-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.86rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #1d4ed8;
        margin-bottom: 0.75rem;
      }
      .pm-plan-print-title {
        font-size: 1.9rem;
        font-weight: 800;
        margin-bottom: 0.4rem;
      }
      .pm-plan-print-subtitle {
        color: #4b5563;
        margin-bottom: 1rem;
      }
      .pm-plan-print-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.75rem;
      }
      .pm-plan-print-meta-card {
        border: 1px solid #dbeafe;
        border-radius: 0.9rem;
        padding: 0.9rem 1rem;
        background: #fff;
      }
      .pm-plan-print-meta-card span {
        display: block;
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #6b7280;
        margin-bottom: 0.2rem;
      }
      .pm-plan-print-meta-card strong {
        font-size: 0.98rem;
      }
      .pm-plan-print-empty {
        padding: 2rem;
        text-align: center;
        color: #6b7280;
      }
      .pm-plan-print-body {
        padding: 1.5rem 2rem 2rem;
      }
      .pm-plan-print-class + .pm-plan-print-class {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e5e7eb;
      }
      .pm-plan-print-class-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: flex-start;
        margin-bottom: 1rem;
      }
      .pm-plan-print-class-title {
        font-size: 1.25rem;
        font-weight: 800;
        margin-bottom: 0.15rem;
      }
      .pm-plan-print-class-subtitle {
        color: #6b7280;
        font-size: 0.95rem;
      }
      .pm-plan-print-chip {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 0.35rem 0.75rem;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 0.82rem;
        font-weight: 700;
      }
      .pm-plan-print-plan {
        border: 1px solid #e5e7eb;
        border-radius: 1rem;
        padding: 1rem 1.1rem;
        margin-bottom: 1rem;
        break-inside: avoid;
      }
      .pm-plan-print-plan:last-child {
        margin-bottom: 0;
      }
      .pm-plan-print-plan-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.9rem;
      }
      .pm-plan-print-plan-title {
        font-size: 1.05rem;
        font-weight: 800;
        margin-bottom: 0.2rem;
      }
      .pm-plan-print-plan-date {
        color: #6b7280;
        font-size: 0.9rem;
      }
      .pm-plan-print-plan-badge {
        border: 1px solid #bbf7d0;
        background: #f0fdf4;
        color: #15803d;
        border-radius: 999px;
        padding: 0.32rem 0.7rem;
        font-size: 0.78rem;
        font-weight: 700;
        white-space: nowrap;
      }
      .pm-plan-print-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 0.8rem;
      }
      .pm-plan-print-block {
        background: #f8fafc;
        border-radius: 0.9rem;
        padding: 0.85rem 0.95rem;
      }
      .pm-plan-print-block h4 {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        margin-bottom: 0.5rem;
      }
      .pm-plan-print-block p,
      .pm-plan-print-block li {
        font-size: 0.92rem;
        line-height: 1.55;
        margin-bottom: 0.35rem;
      }
      .pm-plan-print-block ul {
        margin: 0;
        padding-left: 1rem;
      }
      .pm-plan-print-footer {
        border-top: 1px solid #e5e7eb;
        padding: 1rem 2rem 1.6rem;
        color: #6b7280;
        font-size: 0.85rem;
      }
      @media print {
        body {
          background: #fff !important;
        }
        .no-print {
          display: none !important;
        }
        .pm-plan-print-shell {
          background: #fff;
          padding: 0;
        }
        .pm-plan-print-document {
          max-width: 100%;
          box-shadow: none;
          border-radius: 0;
        }
        .pm-plan-print-class + .pm-plan-print-class {
          break-before: page;
        }
      }
    </style>

    <div class="pm-plan-print-shell">
      <div class="pm-plan-print-actions no-print">
        <div>
          <button class="btn btn-outline-secondary" id="btn-print-back">
            <i class="bi bi-arrow-left me-1"></i>Volver a Plan
          </button>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="btn-print-now" ${hasPlans ? '' : 'disabled'}>
            <i class="bi bi-printer me-1"></i>Imprimir / Guardar PDF
          </button>
          <button class="btn btn-outline-primary" id="btn-print-html">
            <i class="bi bi-file-earmark-code me-1"></i>HTML
          </button>
        </div>
      </div>

      <article class="pm-plan-print-document">
        <header class="pm-plan-print-header">
          <div class="pm-plan-print-brand">
            <i class="bi bi-journal-richtext"></i>
            Documento institucional de planificación
          </div>
          <h1 class="pm-plan-print-title">${escapeHTML(title)}</h1>
          <p class="pm-plan-print-subtitle">${escapeHTML(subtitle)}</p>

          <div class="pm-plan-print-meta">
            <div class="pm-plan-print-meta-card">
              <span>Maestro</span>
              <strong>${escapeHTML(payload.maestro.nombre)}</strong>
            </div>
            <div class="pm-plan-print-meta-card">
              <span>Generado</span>
              <strong>${escapeHTML(payload.generatedAtLabel)}</strong>
            </div>
            <div class="pm-plan-print-meta-card">
              <span>Clases incluidas</span>
              <strong>${payload.totalClases}</strong>
            </div>
            <div class="pm-plan-print-meta-card">
              <span>Planificaciones aprobadas</span>
              <strong>${payload.totalPlanificaciones}</strong>
            </div>
          </div>
        </header>

        <section class="pm-plan-print-body">
          ${
            hasPlans
              ? classes.map((item) => _renderClassSection(item)).join('')
              : `
                <div class="pm-plan-print-empty">
                  <i class="bi bi-journal-x d-block mb-3" style="font-size: 2rem;"></i>
                  No hay planificaciones aprobadas para esta selección.
                </div>
              `
          }
        </section>

        <footer class="pm-plan-print-footer">
          Documento generado desde la vista Plan del portal de maestros. Ruta de retorno: ${escapeHTML(parentRoute)}.
        </footer>
      </article>
    </div>
  `
}

function _renderClassSection(classItem) {
  return `
    <section class="pm-plan-print-class">
      <div class="pm-plan-print-class-header">
        <div>
          <h2 class="pm-plan-print-class-title">${escapeHTML(classItem.claseNombre || 'Clase sin nombre')}</h2>
          <p class="pm-plan-print-class-subtitle">
            ${escapeHTML(classItem.instrumento || 'General')} · ${classItem.planificaciones.length} planificaciones aprobadas
          </p>
        </div>
        <span class="pm-plan-print-chip">${escapeHTML(classItem.claseId || 'Sin ID de clase')}</span>
      </div>

      ${classItem.planificaciones.map((plan) => _renderPlanCard(plan)).join('')}
    </section>
  `
}

function _renderPlanCard(plan) {
  return `
    <article class="pm-plan-print-plan">
      <div class="pm-plan-print-plan-header">
        <div>
          <h3 class="pm-plan-print-plan-title">${escapeHTML(plan.tema || plan.titulo || 'Plan sin título')}</h3>
          <div class="pm-plan-print-plan-date">
            ${escapeHTML(formatPlanificacionExportDate(plan.fecha_inicio || plan.fecha || plan.updated_at))}
          </div>
        </div>
        <span class="pm-plan-print-plan-badge">Aprobada</span>
      </div>

      <div class="pm-plan-print-grid">
        <div class="pm-plan-print-block">
          <h4>Objetivos y contenidos</h4>
          ${_renderPlanContent(plan)}
        </div>
        <div class="pm-plan-print-block">
          <h4>Evaluación</h4>
          <p>${escapeHTML(plan.evaluacion_metodo || 'No especificado')}</p>
        </div>
        <div class="pm-plan-print-block">
          <h4>Recursos</h4>
          ${_renderSimpleList(Array.isArray(plan.recursos) ? plan.recursos : [])}
        </div>
        <div class="pm-plan-print-block">
          <h4>Observaciones</h4>
          <p>${escapeHTML(plan.observaciones || 'Sin observaciones registradas')}</p>
        </div>
      </div>
    </article>
  `
}

function _renderPlanContent(plan) {
  if (Array.isArray(plan.objetivosEstructurados) && plan.objetivosEstructurados.length > 0) {
    return `
      <ul>
        ${plan.objetivosEstructurados
          .map(
            (item) => `
            <li>
              <strong>${escapeHTML(item.titulo || 'Objetivo')}</strong>
              ${
                Array.isArray(item.indicadores) && item.indicadores.length > 0
                  ? `
                  <ul>
                    ${item.indicadores
                      .map((indicator) => `<li>${escapeHTML(indicator.titulo || 'Indicador')}</li>`)
                      .join('')}
                  </ul>
                `
                  : ''
              }
            </li>
          `,
          )
          .join('')}
      </ul>
    `
  }

  if (Array.isArray(plan.contenidos) && plan.contenidos.length > 0) {
    if (typeof plan.contenidos[0] === 'object') {
      return `
        <ul>
          ${plan.contenidos
            .map((item) => `<li>${escapeHTML(item?.titulo || item?.nombre || JSON.stringify(item))}</li>`)
            .join('')}
        </ul>
      `
    }

    return _renderSimpleList(plan.contenidos)
  }

  const chunks = [plan.objetivos, plan.contenido].filter(Boolean)
  if (chunks.length === 0) return '<p>Sin contenidos registrados.</p>'
  return chunks.map((chunk) => `<p>${escapeHTML(chunk)}</p>`).join('')
}

function _renderSimpleList(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<p>Sin información registrada.</p>'
  }

  return `
    <ul>
      ${items.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}
    </ul>
  `
}

function _renderErrorState(message, parentRoute) {
  return `
    <div class="container py-4">
      <div class="alert alert-danger">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <h4 class="alert-heading mb-1">No se pudo generar el documento</h4>
            <p class="mb-0">${escapeHTML(message)}</p>
          </div>
          <button class="btn btn-outline-danger" id="btn-print-back">
            <i class="bi bi-arrow-left me-1"></i>Volver a ${escapeHTML(parentRoute)}
          </button>
        </div>
      </div>
    </div>
  `
}

function _attachActions(container, payload, parentRoute) {
  container.querySelector('#btn-print-back')?.addEventListener('click', () => {
    router.navigate(parentRoute)
  })

  container.querySelector('#btn-print-now')?.addEventListener('click', () => {
    window.print?.()
  })

  container.querySelector('#btn-print-html')?.addEventListener('click', () => {
    const navigateParams = {
      scope: payload.scope,
      parentRoute,
    }

    if (payload.scope === 'class' && payload.classDocument?.claseId) {
      navigateParams.claseId = payload.classDocument.claseId
    }

    router.navigate('planificacion-print', navigateParams)
  })
}

function _attachBack(container, parentRoute) {
  container.querySelector('#btn-print-back')?.addEventListener('click', () => {
    router.navigate(parentRoute)
  })
}
