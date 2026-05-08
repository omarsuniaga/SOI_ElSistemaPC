import * as MetricsApi from '../api/metricsApi.js'
import * as PeriodosApi from '../../periodos/api/periodosApi.js'
import { createKpiCard } from '../components/kpiCard.js'
import * as Utils from '../utils/metricsUtils.js'

export async function renderDashboardMetricasView(container) {
  container.innerHTML = `
    <div class="container-fluid py-4">
      <div id="dashboard-header" class="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 class="fw-bold mb-0">Dashboard de Métricas</h2>
          <p class="text-muted mb-0" id="periodo-activo-label">Cargando período...</p>
        </div>
        <button id="refresh-dashboard" class="btn btn-outline-primary">
          <i class="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>

      <div class="row g-3 mb-4" id="kpi-container">
        <!-- KPI Cards loading skeleton -->
        ${Array(4).fill(0).map(() => `
          <div class="col-md-3">
            <div class="card border-0 shadow-sm skeleton-loading" style="height: 120px;"></div>
          </div>
        `).join('')}
      </div>

      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-4">Correlación Asistencia – Rendimiento</h5>
              <div id="correlacion-container" class="text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title fw-bold mb-4">Resumen de Alertas</h5>
              <div id="alertas-summary-container">
                <div class="placeholder-glow">
                  <span class="placeholder col-12 mb-2"></span>
                  <span class="placeholder col-12 mb-2"></span>
                  <span class="placeholder col-12"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0 pt-4 px-4">
              <h5 class="card-title fw-bold mb-0">Alumnos en Riesgo Alto</h5>
            </div>
            <div class="card-body px-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-4">Nombre</th>
                      <th>Instrumento</th>
                      <th>Score</th>
                      <th class="pe-4">Nivel</th>
                    </tr>
                  </thead>
                  <tbody id="riesgo-alto-table">
                    <tr><td colspan="4" class="text-center py-4">Cargando...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0 pt-4 px-4">
              <h5 class="card-title fw-bold mb-0">Alumnos Destacados</h5>
            </div>
            <div class="card-body px-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-4">Nombre</th>
                      <th>Instrumento</th>
                      <th>Promedio</th>
                      <th class="pe-4">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody id="destacados-table">
                    <tr><td colspan="4" class="text-center py-4">Cargando...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  async function loadData() {
    const refreshBtn = document.getElementById('refresh-dashboard')
    if (refreshBtn) {
      refreshBtn.disabled = true
      refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Actualizando...'
    }

    try {
      // 1. Cargar Período Activo y Estadísticas
      const [periodoActivo, estadisticas, alertas, correlacion, riesgoAlto, destacados] = await Promise.all([
        PeriodosApi.getPeriodoActivo(),
        MetricsApi.getEstadisticasPeriodoActivo(),
        MetricsApi.getResumenAlertas(),
        MetricsApi.getCorrelacionAsistenciaRendimiento(),
        MetricsApi.getAlumnosEnRiesgoAlto(),
        MetricsApi.getAlumnosDestacados()
      ])

      // Actualizar Header
      const headerLabel = document.getElementById('periodo-activo-label')
      if (periodoActivo) {
        headerLabel.textContent = `${periodoActivo.nombre} (${periodoActivo.fecha_inicio} a ${periodoActivo.fecha_fin})`
      } else {
        headerLabel.textContent = 'No hay período activo'
      }

      // 2. Renderizar KPIs
      const kpiContainer = document.getElementById('kpi-container')
      const kpiHtml = [
        createKpiCard({
          titulo: 'Alumnos Activos',
          valor: estadisticas?.total_alumnos || 0,
          colorClass: 'primary',
          icono: 'bi-people'
        }),
        createKpiCard({
          titulo: 'Tasa Asistencia',
          valor: `${(estadisticas?.tasa_asistencia_promedio || 0).toFixed(1)}%`,
          colorClass: Utils.formatTasa(estadisticas?.tasa_asistencia_promedio || 0).colorClass.replace('text-', ''),
          icono: 'bi-calendar-check'
        }),
        createKpiCard({
          titulo: 'Promedio Gral',
          valor: (estadisticas?.promedio_calificaciones || 0).toFixed(2),
          colorClass: 'info',
          icono: 'bi-graph-up'
        }),
        createKpiCard({
          titulo: 'Alertas Rojas',
          valor: alertas.rojas,
          subtitulo: `${alertas.total} alertas totales`,
          colorClass: 'danger',
          icono: 'bi-exclamation-triangle'
        })
      ].map(card => `<div class="col-md-3">${card}</div>`).join('')
      
      kpiContainer.innerHTML = kpiHtml

      // 3. Correlación
      const corrContainer = document.getElementById('correlacion-container')
      const r = correlacion || 0
      let desc = 'Sin datos suficientes'
      if (r > 0.7) desc = 'Correlación fuerte: los alumnos con mejor asistencia tienden a rendir mejor.'
      else if (r > 0.4) desc = 'Correlación moderada entre asistencia y rendimiento.'
      else if (r > 0) desc = 'Correlación débil entre asistencia y rendimiento.'
      else if (r < 0) desc = 'Correlación negativa: comportamiento inusual detectado.'

      corrContainer.innerHTML = `
        <h1 class="display-3 fw-bold text-primary mb-0">${r.toFixed(2)}</h1>
        <p class="lead text-muted">${desc}</p>
      `

      // 4. Resumen Alertas
      const alertsContainer = document.getElementById('alertas-summary-container')
      alertsContainer.innerHTML = `
        <div class="mb-3">
          <div class="d-flex justify-content-between mb-1">
            <span>Riesgo Alto (Rojas)</span>
            <span class="fw-bold">${alertas.rojas}</span>
          </div>
          <div class="progress" style="height: 6px;">
            <div class="progress-bar bg-danger" style="width: ${(alertas.rojas / alertas.total * 100) || 0}%"></div>
          </div>
        </div>
        <div class="mb-3">
          <div class="d-flex justify-content-between mb-1">
            <span>Seguimiento (Naranjas)</span>
            <span class="fw-bold">${alertas.naranjas}</span>
          </div>
          <div class="progress" style="height: 6px;">
            <div class="progress-bar bg-warning" style="width: ${(alertas.naranjas / alertas.total * 100) || 0}%"></div>
          </div>
        </div>
        <div>
          <div class="d-flex justify-content-between mb-1">
            <span>Preventivas (Amarillas)</span>
            <span class="fw-bold">${alertas.amarillas}</span>
          </div>
          <div class="progress" style="height: 6px;">
            <div class="progress-bar bg-info" style="width: ${(alertas.amarillas / alertas.total * 100) || 0}%"></div>
          </div>
        </div>
      `

      // 5. Tabla Riesgo Alto
      const riesgoTable = document.getElementById('riesgo-alto-table')
      if (riesgoAlto.length === 0) {
        riesgoTable.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No se detectaron alumnos en riesgo crítico.</td></tr>'
      } else {
        riesgoTable.innerHTML = riesgoAlto.slice(0, 5).map(a => {
          const score = Utils.formatScore(a.score_riesgo)
          return `
            <tr>
              <td class="ps-4 fw-medium">${a.nombre_completo}</td>
              <td>${a.instrumento_principal}</td>
              <td><span class="fw-bold ${score.colorClass}">${score.text}</span></td>
              <td class="pe-4"><span class="badge bg-body-tertiary text-body border">${Utils.getNivelLabel(a.nivel_riesgo)}</span></td>
            </tr>
          `
        }).join('')
      }

      // 6. Tabla Destacados
      const destacadosTable = document.getElementById('destacados-table')
      if (destacados.length === 0) {
        destacadosTable.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No hay alumnos destacados en este período.</td></tr>'
      } else {
        destacadosTable.innerHTML = destacados.slice(0, 5).map(a => `
          <tr>
            <td class="ps-4 fw-medium">${a.nombre_completo}</td>
            <td>${a.instrumento_principal}</td>
            <td><span class="fw-bold text-success">${a.promedio_calificaciones.toFixed(2)}</span></td>
            <td class="pe-4"><span class="fw-bold">${a.tasa_asistencia.toFixed(1)}%</span></td>
          </tr>
        `).join('')
      }

    } catch (error) {
      console.error('Error al cargar dashboard:', error)
      container.innerHTML = `
        <div class="alert alert-danger m-4" role="alert">
          <h4 class="alert-heading">Error al cargar datos</h4>
          <p>${error.message}</p>
          <hr>
          <button class="btn btn-outline-danger" onclick="location.reload()">Reintentar</button>
        </div>
      `
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false
        refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Actualizar'
      }
    }
  }

  loadData()
  document.getElementById('refresh-dashboard').addEventListener('click', () => {
    renderDashboardMetricasView(container)
  })
}
