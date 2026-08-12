import { moduleCatalog, routeKinds } from './moduleCatalog.js'
import { portalCatalog } from './portalCatalog.js'
import { classifyCatalogAudit, getCatalogAuditResults, summarizeCatalogDiagnostics } from './catalogAudit.js'
import { HelpPanel } from '../shared/components/HelpPanel.js'

const list = values => values?.length
  ? values.map(value => `<code class="me-1">${value}</code>`).join('')
  : '<span class="text-success">Ninguna</span>'
const statusLabel = status => ({
  SIN_EVIDENCIA: 'Sin evidencia',
  COHERENTE: 'Coherente',
  DEUDA_CONOCIDA: 'Deuda conocida',
  CANDIDATOS: 'Con candidatos',
  REVISAR: 'Revisar',
  ROTO: 'Roto',
})[status] || status
const moduleStatus = moduleDefinition => {
  if (moduleDefinition.routeDescriptors.every(route => route.kind === 'external-entry')) return 'EXTERNO'
  if (moduleDefinition.routeDescriptors.some(route => route.kind === 'legacy-candidate')) return 'CANDIDATO'
  return 'INVENTARIADO'
}

export function filterCatalogModules(filters = {}) {
  const { owner = 'all', kind = 'all', status = 'all' } = filters
  return moduleCatalog.filter(moduleDefinition => (
    (owner === 'all' || moduleDefinition.owner === owner)
    && (kind === 'all' || moduleDefinition.routeDescriptors.some(route => route.kind === kind))
    && (status === 'all' || moduleStatus(moduleDefinition) === status)
  ))
}

const routeList = moduleDefinition => moduleDefinition.routeDescriptors
  .map(route => `<code class="me-1" title="${route.source}">${route.routeId}</code><span class="badge text-bg-light border me-1">${route.kind}</span>`)
  .join('')

const moduleRows = filters => {
  const modules = filterCatalogModules(filters)
  if (!modules.length) return '<tr><td colspan="7" class="text-muted">No hay módulos para esos filtros.</td></tr>'
  return modules.map(moduleDefinition => `<tr>
    <td><code>${moduleDefinition.moduleId}</code><div class="small text-muted">${moduleDefinition.source}</div></td>
    <td>${routeList(moduleDefinition)}</td>
    <td>${moduleDefinition.owner}</td>
    <td>${moduleStatus(moduleDefinition)}</td>
    <td>${moduleDefinition.lifecycle}</td>
    <td>${moduleDefinition.health}</td>
    <td>${moduleDefinition.help.status}</td>
  </tr>`).join('')
}

const optionList = values => values.map(value => `<option value="${value}">${value}</option>`).join('')

export function renderCatalogDiagnosticsView(container) {
  try {
    const summary = summarizeCatalogDiagnostics()
    const audits = getCatalogAuditResults()
    const owners = [...new Set(moduleCatalog.map(moduleDefinition => moduleDefinition.owner))].sort()
    container.innerHTML = `<main class="container-fluid py-4" aria-labelledby="catalog-title">
      <div class="d-flex justify-content-between align-items-start gap-3 mb-4"><div><h2 id="catalog-title">Diagnóstico de portales y módulos</h2><p class="text-muted mb-0">Inventario en modo sombra. Esta pantalla no activa, quita ni concede permisos.</p></div><button id="catalog-help" class="btn btn-outline-primary" type="button"><i class="bi bi-question-circle me-1"></i>¿Cómo funciona?</button></div>
      <div class="row g-3 mb-4">
        ${[['Portales declarados', summary.portalCount], ['Portales observados', summary.observedPortalCount], ['Requieren revisión', (summary.statusCounts.REVISAR || 0) + (summary.statusCounts.ROTO || 0)], ['Incidencias', summary.issueCount], ['Rutas inventariadas', summary.routeCount], ['Ayuda documentada', `${summary.helpReady} de ${summary.moduleCount}`]].map(([label, value]) => `<div class="col-6 col-lg"><div class="card card-body h-100"><span class="text-muted small">${label}</span><strong class="fs-4">${value}</strong></div></div>`).join('')}
      </div>
      <section class="card mb-4"><div class="card-header"><strong>Portales</strong></div><div class="table-responsive"><table class="table mb-0"><caption class="visually-hidden">Estado descriptivo de los portales declarados</caption><thead><tr><th scope="col">Portal</th><th scope="col">Estado observado</th><th scope="col">Ruta inicial</th><th scope="col">Responsable</th><th scope="col">Ciclo</th><th scope="col">Salud declarada</th><th scope="col">Incidencias</th></tr></thead><tbody>${portalCatalog.map(portal => { const audit = audits.find(item => item.portalId === portal.portalId); const status = classifyCatalogAudit(audit); return `<tr><td>${portal.portalId}<div class="small text-muted">${portal.path}</div></td><td>${statusLabel(status)}</td><td><code>${portal.defaultRoute}</code></td><td>${portal.owner}</td><td>${portal.lifecycle}</td><td>${portal.health}</td><td>${audit?.issueCount ?? '<span class="text-muted">Sin observar</span>'}</td></tr>` }).join('')}</tbody></table></div></section>
      <section class="card mb-4"><div class="card-header"><strong>Módulos y rutas</strong></div><div class="card-body border-bottom"><div class="row g-2" aria-label="Filtros de módulos"><div class="col-md-4"><label class="form-label small" for="catalog-filter-owner">Responsable</label><select id="catalog-filter-owner" class="form-select"><option value="all">Todos</option>${optionList(owners)}</select></div><div class="col-md-4"><label class="form-label small" for="catalog-filter-kind">Tipo de ruta</label><select id="catalog-filter-kind" class="form-select"><option value="all">Todos</option>${optionList(routeKinds)}</select></div><div class="col-md-4"><label class="form-label small" for="catalog-filter-status">Estado del inventario</label><select id="catalog-filter-status" class="form-select"><option value="all">Todos</option>${optionList(['INVENTARIADO', 'CANDIDATO', 'EXTERNO'])}</select></div></div></div><div class="table-responsive"><table class="table mb-0"><caption class="visually-hidden">Inventario descriptivo de módulos y sus rutas</caption><thead><tr><th scope="col">Módulo / fuente</th><th scope="col">Rutas</th><th scope="col">Responsable</th><th scope="col">Estado</th><th scope="col">Ciclo</th><th scope="col">Salud</th><th scope="col">Ayuda</th></tr></thead><tbody id="catalog-module-rows">${moduleRows()}</tbody></table></div></section>
      <section class="card"><div class="card-header"><strong>Resultados de auditoría y candidatos</strong></div><div class="card-body">${audits.length ? audits.map(audit => `<article class="border-bottom pb-3 mb-3"><div class="d-flex justify-content-between"><h3 class="h6">${audit.portalId}</h3><span class="badge ${audit.issueCount ? 'bg-warning text-dark' : 'bg-success'}">${audit.issueCount} incidencias</span></div><div><strong>Enlaces externos válidos:</strong> ${list(audit.validExternalNavRoutes)}</div><div><strong>Rutas registradas fuera del catálogo:</strong> ${list(audit.registeredUncataloguedRoutes)}</div><div><strong>Candidatos legacy:</strong> ${list(audit.legacyCandidateRoutes)}</div><div><strong>Candidatos huérfanos:</strong> ${list(audit.orphanCandidateRoutes)}</div><div><strong>Huérfanas navegables:</strong> ${list(audit.orphanNavRoutes)}</div><div><strong>Navegación no catalogada:</strong> ${list(audit.uncataloguedNavRoutes)}</div></article>`).join('') : '<div class="alert alert-info mb-0">Todavía no hay auditorías en memoria. Recargue esta pantalla después de iniciar el portal.</div>'}</div></section>
    </main>`

    const updateModuleTable = () => {
      const filters = {
        owner: container.querySelector('#catalog-filter-owner')?.value,
        kind: container.querySelector('#catalog-filter-kind')?.value,
        status: container.querySelector('#catalog-filter-status')?.value,
      }
      const target = container.querySelector('#catalog-module-rows')
      if (target) target.innerHTML = moduleRows(filters)
    }
    container.querySelectorAll('#catalog-filter-owner, #catalog-filter-kind, #catalog-filter-status')
      .forEach(select => select.addEventListener('change', updateModuleTable))
    container.querySelector('#catalog-help')?.addEventListener('click', () => HelpPanel.open({ title: 'Catálogo en modo sombra', intro: 'Observa la topología actual sin modificar acceso ni navegación.', sections: [{ icon: 'bi-eye', title: 'Solo lectura', description: 'Los hallazgos son diagnósticos; no cambian permisos.' }, { icon: 'bi-box-arrow-up-right', title: 'Entradas externas', description: 'Los enlaces que salen de la SPA se muestran como válidos cuando están catalogados.' }, { icon: 'bi-exclamation-triangle', title: 'Candidatos', description: 'Las rutas legacy y huérfanas requieren revisión humana; no se eliminan automáticamente.' }] }))
  } catch {
    container.innerHTML = '<div class="container py-4"><div class="alert alert-danger">No se pudo preparar el diagnóstico del catálogo.</div></div>'
  }
}
