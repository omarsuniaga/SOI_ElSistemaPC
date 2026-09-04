/**
 * AusentismoDashboardView — panel de solo lectura para ADM.
 * KPIs del ausentismo, histórico de casos cerrados y export a CSV.
 */

import {
  getPeriodoActivo,
  fetchKpisAusentismo,
  fetchCasosCerrados,
} from '../services/seguimientoAusentesService.js'
import { renderSeguimientoAusentesCardADM } from '../components/SeguimientoAusentesCardADM.js'

const state = {
  container: null,
  periodo: null,
  kpis: null,
  casos: [],
  desde: '',
  hasta: '',
  loading: false,
}

export async function renderAusentismoDashboardView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = _renderLoading()
  try {
    await _loadData()
    _render()
    _attachEvents()
  } catch (err) {
    console.error('[AusentismoDashboard]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${err.message}</div></div>`
  }
}

async function _loadData() {
  state.loading = true
  try { state.periodo = await getPeriodoActivo() } catch (err) { console.error(err) }
  const [kpis, casos] = await Promise.all([
    fetchKpisAusentismo().catch((e) => { console.error(e); return null }),
    fetchCasosCerrados({ desde: state.desde || null, hasta: state.hasta || null }).catch((e) => { console.error(e); return [] }),
  ])
  state.kpis = kpis
  state.casos = casos
  state.loading = false
}

function _renderLoading() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center justify-content-center" style="height:300px;">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
      </div>
    </div>`
}

function _statsForCards() {
  const k = state.kpis || {}
  return {
    nivel1: k.nivel1 || 0,
    nivel2: k.nivel2 || 0,
    nivel3: k.nivel3 || 0,
    contactados72h: k.contactosUltimas72h || 0,
    totalContactos: k.totalAusentes || 0,
    retencionesActivas: k.retencionesActivas || 0,
    retencionesLevantadas: k.retencionesLevantadas || 0,
  }
}

function _render() {
  const casos = state.casos

  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-danger bg-opacity-10 text-danger rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-graph-up fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Ausencias — Resumen del Período</h1>
          <p class="text-muted small mb-0">${state.periodo?.nombre || 'Período actual'} · ${state.kpis?.totalAusentes ?? 0} alumnos en seguimiento · ${state.kpis?.sinContacto ?? 0} sin contacto</p>
        </div>
      </div>

      <div class="mb-4">
        <h5 class="mb-3">Métricas clave</h5>
        ${renderSeguimientoAusentesCardADM(_statsForCards())}
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-body-tertiary d-flex flex-wrap align-items-center justify-content-between gap-2">
          <h5 class="mb-0">Casos cerrados (reincorporaciones y justificaciones)</h5>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <input type="date" class="form-control form-control-sm" style="width:auto" data-desde value="${state.desde}">
            <span class="text-muted small">a</span>
            <input type="date" class="form-control form-control-sm" style="width:auto" data-hasta value="${state.hasta}">
            <button class="btn btn-sm btn-outline-secondary" data-filtrar>Filtrar</button>
            <button class="btn btn-sm btn-outline-success" data-csv ${casos.length ? '' : 'disabled'}>
              <i class="bi bi-download me-1"></i>CSV
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          ${casos.length === 0
            ? '<p class="text-muted small p-3 mb-0">Sin casos cerrados en el rango seleccionado.</p>'
            : `
            <div class="table-responsive">
              <table class="table table-sm table-hover mb-0">
                <thead class="table-light"><tr>
                  <th>Fecha</th><th>Nivel</th><th>Canal</th><th>Resultado</th><th>Contacto</th><th>Notas</th>
                </tr></thead>
                <tbody>
                  ${casos.map((c) => `
                    <tr>
                      <td class="small">${String(c.fecha || '').slice(0, 10)}</td>
                      <td class="small">N${c.nivel ?? '—'}</td>
                      <td class="small text-capitalize">${c.canal || '—'}</td>
                      <td class="small">${c.resultado || '—'}</td>
                      <td class="small">${c.contacto_nombre || '—'}</td>
                      <td class="small text-truncate" style="max-width:280px" title="${(c.notas || '').replace(/"/g, '&quot;')}">${c.notas || '—'}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>`}
        </div>
      </div>

      <div class="d-flex align-items-center gap-2 bg-body-tertiary border rounded p-2 mt-4 small text-body-secondary">
        <i class="bi bi-shield-lock"></i>
        <span><strong>Acceso de lectura:</strong> las acciones de contacto y retención se realizan desde el panel de Coordinación Académica.</span>
      </div>
    </div>`
}

function _attachEvents() {
  const c = state.container
  c.querySelector('[data-filtrar]')?.addEventListener('click', async () => {
    state.desde = c.querySelector('[data-desde]')?.value || ''
    state.hasta = c.querySelector('[data-hasta]')?.value || ''
    c.innerHTML = _renderLoading()
    await _loadData(); _render(); _attachEvents()
  })
  c.querySelector('[data-csv]')?.addEventListener('click', () => _exportCsv())
}

function _exportCsv() {
  const rows = state.casos
  if (!rows.length) return
  const head = ['fecha', 'nivel', 'canal', 'resultado', 'contacto', 'notas']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const body = rows.map((r) => [
    String(r.fecha || '').slice(0, 10), r.nivel ?? '', r.canal ?? '', r.resultado ?? '', r.contacto_nombre ?? '', r.notas ?? '',
  ].map(esc).join(','))
  const csv = [head.join(','), ...body].join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `casos-ausentismo-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
