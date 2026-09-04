/**
 * T1b.7 — AusentismoDashboardView (ADM read-only dashboard)
 * Displays KPI cards and stub sections for analytics and historical data
 */

import {
  getPeriodoActivo,
  fetchSeguimientoAusentes,
} from '../services/seguimientoAusentesService.js'
import { renderSeguimientoAusentesCardADM } from '../components/SeguimientoAusentesCardADM.js'

const state = {
  container: null,
  periodo: null,
  alumnos: [],
  loading: false,
}

export async function renderAusentismoDashboardView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = _renderLoading()

  try {
    await _loadData()
    _render()
  } catch (err) {
    console.error('[AusentismoDashboard]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${err.message}</div></div>`
  }
}

async function _loadData() {
  state.loading = true

  try {
    state.periodo = await getPeriodoActivo()
  } catch (err) {
    console.error('Error loading periodo:', err)
  }

  try {
    const result = await fetchSeguimientoAusentes({
      limit: 500, // Get all for KPI calculations
      offset: 0,
    })
    state.alumnos = result.alumnos || []
  } catch (err) {
    console.error('Error loading ausentes:', err)
    state.alumnos = []
  }

  state.loading = false
}

function _renderLoading() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center justify-content-center" style="height:300px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    </div>
  `
}

function _calculateStats() {
  const nivel1 = state.alumnos.filter((a) => a.nivel === 1).length
  const nivel2 = state.alumnos.filter((a) => a.nivel === 2).length
  const nivel3 = state.alumnos.filter((a) => a.nivel === 3).length

  // Calculate % contactados <72h
  const now = Date.now()
  const hours72 = 72 * 60 * 60 * 1000
  const contactados72h = state.alumnos.filter((a) => {
    if (!a.ultimo_seguimiento_fecha) return false
    const fecha = new Date(a.ultimo_seguimiento_fecha).getTime()
    return now - fecha <= hours72
  }).length

  const totalWithContact = state.alumnos.filter((a) => a.ultimo_seguimiento_fecha).length

  return {
    nivel1,
    nivel2,
    nivel3,
    contactados72h,
    totalContactos: state.alumnos.length,
    retencionesActivas: state.alumnos.filter((a) => a.retencion_activa).length,
    retencionesLevantadas: 0, // Would need separate query
  }
}

function _render() {
  const stats = _calculateStats()

  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-danger bg-opacity-10 text-danger rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-graph-up fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Ausencias — Resumen del Período</h1>
          <p class="text-muted small mb-0">${state.periodo?.nombre || 'Período actual'}</p>
        </div>
      </div>

      <!-- KPI Cards Section -->
      <div class="mb-4">
        <h5 class="mb-3">Métricas Clave</h5>
        ${renderSeguimientoAusentesCardADM(stats)}
      </div>

      <!-- Casos Cerrados Stub -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Casos Cerrados Recientemente</h5>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-0">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Fase 4:</strong> Histórico de casos cerrados y análisis de reincorporación — próximamente
          </p>
          <div class="alert alert-info small mt-3 mb-0">
            <p class="mb-1"><strong>Funcionalidad pendiente:</strong></p>
            <ul class="mb-0">
              <li>Tabla filtrable de casos cerrados por rango de fechas</li>
              <li>Estado de reincorporación (levantada_en, fecha_reincorporacion)</li>
              <li>Análisis de recidivismo (% que retorna a nivel 3 post-reincorporación)</li>
              <li>Exportación a CSV</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Analytics Stub -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-light">
          <h5 class="mb-0">Análisis & Tendencias</h5>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-0">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Fase 4:</strong> Análisis agregados y gráficos — próximamente
          </p>
          <div class="alert alert-info small mt-3 mb-0">
            <p class="mb-1"><strong>Funcionalidad pendiente:</strong></p>
            <ul class="mb-0">
              <li>Tiempo promedio a reincorporación</li>
              <li>Tasa de recidivismo por instrumento</li>
              <li>Distribución de niveles por maestro</li>
              <li>Tendencia de ausencias por período</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Read-Only Note -->
      <div class="alert alert-light border mt-4 small">
        <i class="bi bi-shield-lock me-2"></i>
        <strong>Acceso de lectura:</strong> Este panel es de solo lectura. Las acciones de contacto y retención se realizan desde la vista de coordinación académica.
      </div>
    </div>
  `
}
