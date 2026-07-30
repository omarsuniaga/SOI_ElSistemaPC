/**
 * PasaporteHabilidadesView.js — Pasaporte de Habilidades Gamificado (Skill Tree) del Estudiante
 */
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { CalculadorSaludPerfil } from '../../planificacion/domain/CalculadorSaludPerfil.js'

export async function renderPasaporteHabilidadesView(container, { alumno = null } = {}) {
  if (!container) return

  const alumnoNombre = alumno?.nombre_completo || alumno?.nombre || 'Alumno Institucional'
  const nivelActual = alumno?.nivelIndex || 1

  const salud = CalculadorSaludPerfil.calcular({
    totalIndicadores: 12,
    indicadoresLogrados: 8,
    inasistenciasInjustificadas: alumno?.inasistencias || 1,
    inasistenciasJustificadas: 0,
  })

  container.innerHTML = `
    <div class="container-fluid px-3 py-3">
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-gradient text-white" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <span class="badge bg-warning text-dark fw-bold mb-2"><i class="bi bi-award me-1"></i>Pasaporte de Habilidades</span>
            <h3 class="fw-bold mb-1">${escapeHTML(alumnoNombre)}</h3>
            <p class="mb-0 opacity-75">Nivel Técnico Actual: <strong>Nivel ${nivelActual}</strong></p>
          </div>
          <div class="text-end">
            <div class="display-6 fw-bold">${salud.progresoAjustadoPct}%</div>
            <small class="opacity-75">Índice de Salud Académica (IDIA)</small>
          </div>
        </div>
      </div>

      ${
        salud.alertaAusentismo
          ? `
        <div class="alert alert-warning border-warning shadow-sm mb-4">
          <i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Atención:</strong> ${escapeHTML(salud.alertaAusentismo.mensaje)}
        </div>
      `
          : ''
      }

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
            <h6 class="fw-bold mb-3"><i class="bi bi-diagram-2 text-primary me-2"></i>Árbol de Logros (Nivel ${nivelActual})</h6>
            <div class="list-group list-group-flush">
              <div class="list-group-item d-flex align-items-center justify-content-between py-3 border-0 bg-body-tertiary rounded-3 mb-2">
                <div>
                  <strong class="d-block">1. Postura y Agarre de Arco</strong>
                  <small class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Dominado (5/5 Estrellas)</small>
                </div>
                <span class="fs-4">🏅</span>
              </div>
              <div class="list-group-item d-flex align-items-center justify-content-between py-3 border-0 bg-body-tertiary rounded-3 mb-2">
                <div>
                  <strong class="d-block">2. Escala de Do Mayor (1 Octava)</strong>
                  <small class="text-primary"><i class="bi bi-star-fill me-1"></i>Logrado Fluido (4/5 Estrellas)</small>
                </div>
                <span class="fs-4">🚀</span>
              </div>
              <div class="list-group-item d-flex align-items-center justify-content-between py-3 border-0 bg-body-tertiary rounded-3 opacity-50">
                <div>
                  <strong class="d-block">3. Golpe de Arco Martelé</strong>
                  <small class="text-muted">Bloqueado (Prerrequisito en curso)</small>
                </div>
                <span class="fs-4">🔒</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
            <h6 class="fw-bold mb-3"><i class="bi bi-pie-chart text-primary me-2"></i>Desglose de Salud Pedagógica</h6>
            <ul class="list-group list-group-flush mb-3">
              <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <span>Avance Curricular Puro:</span>
                <strong class="text-success">${salud.avancePuroPct}%</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <span>Penalización por Inasistencias:</span>
                <strong class="text-danger">-${salud.penalizacionTotalPct}%</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center px-0 border-top pt-2">
                <span class="fw-bold">Progreso Real Ajustado:</span>
                <strong class="fs-5 text-primary">${salud.progresoAjustadoPct}%</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
}
