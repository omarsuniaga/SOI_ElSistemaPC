import { HelpPanel } from '../shared/components/HelpPanel.js'
import {
  assignmentStates,
  capabilityDefinitions,
  filterPortalModuleAssignments,
  portalModuleMatrix,
  summarizePortalModuleMatrix,
} from './portalModuleMatrix.js'
import { moduleCatalog } from './moduleCatalog.js'
import { portalCatalog } from './portalCatalog.js'
import { shadowApprovalExample, shadowApprovalFlow } from './shadowCapabilityApproval.js'

const options = values => values.map(({ value, label = value }) => `<option value="${value}">${label}</option>`).join('')
const capabilityBadges = assignment => capabilityDefinitions.map(capability => (
  assignment.capabilities[capability.id] === 'proposed'
    ? `<span class="badge text-bg-primary me-1">${capability.id}</span>`
    : `<span class="badge text-bg-light border text-muted me-1">${capability.id}</span>`
)).join('')

const matrixRows = filters => {
  const assignments = filterPortalModuleAssignments(portalModuleMatrix, filters)
  if (!assignments.length) return '<tr><td colspan="6" class="text-muted">No hay propuestas para estos filtros.</td></tr>'
  return assignments.map(assignment => `<tr>
    <td><code>${assignment.portalId}</code></td>
    <td><code>${assignment.moduleId}</code></td>
    <td>${assignment.owner}</td>
    <td>${capabilityBadges(assignment)}</td>
    <td><span class="badge text-bg-warning">${assignment.state}</span></td>
    <td class="small text-muted">${assignment.reason}</td>
  </tr>`).join('')
}

export function renderPortalModuleMatrixView(container) {
  const summary = summarizePortalModuleMatrix()
  const owners = [...new Set(moduleCatalog.map(moduleDefinition => moduleDefinition.owner))].sort()
  const moduleIds = moduleCatalog.map(moduleDefinition => moduleDefinition.moduleId).sort()
  container.innerHTML = `<main class="container-fluid py-4" aria-labelledby="matrix-title">
    <div class="d-flex justify-content-between align-items-start gap-3 mb-4"><div><h2 id="matrix-title">Matriz de portales, módulos y capacidades</h2><p class="text-muted mb-0">Simulation / shadow mode: propuestas descriptivas; no guardan ni aplican permisos.</p></div><button id="matrix-help" class="btn btn-outline-primary" type="button"><i class="bi bi-question-circle me-1"></i>¿Cómo funciona?</button></div>
    <div class="alert alert-warning" role="status"><strong>Modo sombra activo.</strong> Esta matriz no consulta ni modifica RLS, autenticación, roles, guards, usuarios o navegación. Las capacidades son un borrador para revisión humana.</div>
    <div class="row g-3 mb-4">${[['Propuestas portal × módulo', summary.assignmentCount], ['Capacidades propuestas', summary.proposedCapabilityCount], ['Cobertura de portales', summary.portalCoverage], ['Cobertura de módulos', summary.moduleCoverage]].map(([label, value]) => `<div class="col-6 col-lg-3"><div class="card card-body h-100"><span class="text-muted small">${label}</span><strong class="fs-4">${value}</strong></div></div>`).join('')}</div>
    <section class="card mb-4" data-testid="shadow-approval-flow"><div class="card-header"><strong>Flujo de aprobación en modo sombra</strong><span class="text-muted small ms-2">Solo lectura · sin persistencia</span></div><div class="card-body"><p class="text-muted small">El flujo documenta cómo revisar una propuesta futura sin activar accesos. Cada aprobación y simulación requiere un plan de reversión verificable.</p><div class="d-flex flex-wrap gap-2 mb-3">${shadowApprovalFlow.map(step => `<span class="badge text-bg-light border text-dark"><strong>${step.label}</strong> · ${step.description}</span>`).join('')}</div><div class="alert alert-light border mb-0 small"><strong>Ejemplo local:</strong> ${shadowApprovalExample.portalId} / ${shadowApprovalExample.moduleId} / ${shadowApprovalExample.capabilityId} (${shadowApprovalExample.operation}). Plan de reversión: ${shadowApprovalExample.rollbackPlan.strategy} + ${shadowApprovalExample.rollbackPlan.verification}. Este ejemplo no se guarda ni ejecuta cambios.</div></div></section>
    <section class="card"><div class="card-header"><strong>Asignaciones propuestas</strong><span class="text-muted small ms-2">Solo lectura</span></div><div class="card-body border-bottom"><div class="row g-2" aria-label="Filtros de la matriz"><div class="col-md-3"><label class="form-label small" for="matrix-filter-portal">Portal</label><select id="matrix-filter-portal" class="form-select"><option value="all">Todos</option>${options(portalCatalog.map(portal => ({ value: portal.portalId })))}</select></div><div class="col-md-3"><label class="form-label small" for="matrix-filter-owner">Responsable</label><select id="matrix-filter-owner" class="form-select"><option value="all">Todos</option>${options(owners.map(value => ({ value })))}</select></div><div class="col-md-3"><label class="form-label small" for="matrix-filter-module">Módulo</label><select id="matrix-filter-module" class="form-select"><option value="all">Todos</option>${options(moduleIds.map(value => ({ value })))}</select></div><div class="col-md-3"><label class="form-label small" for="matrix-filter-capability">Capacidad propuesta</label><select id="matrix-filter-capability" class="form-select"><option value="all">Todas</option>${options(capabilityDefinitions.map(capability => ({ value: capability.id, label: capability.id + ' — ' + capability.label })))}</select></div><div class="col-md-3"><label class="form-label small" for="matrix-filter-state">Estado</label><select id="matrix-filter-state" class="form-select"><option value="all">Todos</option>${options(assignmentStates.map(value => ({ value })))}</select></div></div></div><div class="table-responsive"><table class="table mb-0"><caption class="visually-hidden">Matriz propuesta de capacidades, no aplicable a permisos reales</caption><thead><tr><th scope="col">Portal</th><th scope="col">Módulo</th><th scope="col">Responsable</th><th scope="col">Capacidades</th><th scope="col">Estado</th><th scope="col">Fundamento</th></tr></thead><tbody id="matrix-rows">${matrixRows()}</tbody></table></div></section>
  </main>`

  const updateRows = () => {
    const filters = Object.fromEntries(['portal', 'owner', 'module', 'capability', 'state'].map(key => [
      key === 'portal' ? 'portalId' : key === 'module' ? 'moduleId' : key,
      container.querySelector(`#matrix-filter-${key}`)?.value || 'all',
    ]))
    const target = container.querySelector('#matrix-rows')
    if (target) target.innerHTML = matrixRows(filters)
  }
  container.querySelectorAll('[id^="matrix-filter-"]').forEach(select => select.addEventListener('change', updateRows))
  container.querySelector('#matrix-help')?.addEventListener('click', () => HelpPanel.open({
    title: 'Matriz de capacidades en modo sombra',
    intro: 'Sirve para revisar una propuesta central antes de conectar cualquier autorización real.',
    sections: [
      { icon: 'bi-eye', title: 'Qué muestra', description: 'Propuestas basadas en el responsable declarado de cada módulo y en la topología inventariada.' },
      { icon: 'bi-shield-check', title: 'Qué no hace', description: 'No concede acceso, no guarda cambios y no modifica RLS, usuarios, roles ni rutas.' },
      { icon: 'bi-person-check', title: 'Flujo de revisión', description: 'Las propuestas pasan por borrador, revisión, aprobación o rechazo y simulación. La aprobación exige un plan de reversión y no concede acceso.' },
    ],
  }))
}
