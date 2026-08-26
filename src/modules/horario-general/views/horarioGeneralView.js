/**
 * horarioGeneralView.js
 *
 * "Horario General" — módulo LOG del portal admin: vista en vivo de todas
 * las clases activas y su horario semanal, con diagnóstico operativo
 * (conflictos de salón, sobre-cupo, sesiones sin salón, clases duplicadas
 * por nombre) y exportación a PDF/HTML institucional.
 *
 * Alcance deliberado (confirmado con el usuario): ver + diagnosticar +
 * exportar. Para corregir un hallazgo, el botón "Ver clase" lleva a la
 * ficha de esa clase en Gestión de Clases (deep-link ?selectedId= que ya
 * existe ahí) en vez de reimplementar edición de salón/horario acá.
 */

import { cargarHorarioGeneral, familiaDe, FAMILIA_LABEL, DIAS, DIA_LABEL } from '../services/horarioGeneralService.js'
import { generateHorarioGeneralReportHTML } from '../services/horarioGeneralReportService.js'
import { openReport } from '../../../portal-maestros/services/reportTemplates.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import '../../admin-dashboard/styles/admin-dashboard.css'

const FAM_COLOR = {
  cuerdas: '#b45309', maderas: '#0d9488', metales: '#c2410c', percusion: '#7c3aed', voz: '#2563eb', otros: '#6b7280',
}

function escHTML(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export class HorarioGeneralWidget {
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.data = null
    this.generandoReporte = false
  }

  async init() {
    try {
      this.container.innerHTML = `
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando horario general...</div>
        </div>
      `
      this.data = await cargarHorarioGeneral()
      this.render()
      this.attachEvents()
    } catch (err) {
      console.error('[HorarioGeneralWidget] Init error:', err)
      this.container.innerHTML = `
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando el horario: ${escHTML(err.message)}</div>
        </div>
      `
    }
  }

  render() {
    const { sesiones, diagnostico } = this.data
    const { stats, findings } = diagnostico

    const html = `
      <div class="distribution-card">
        <div class="admin-header-brand mb-4">
          <div class="admin-header-icon-wrapper" style="background: rgba(180, 83, 9, 0.1); color: #b45309;">
            <i class="bi bi-calendar3-week"></i>
          </div>
          <div class="admin-header-title-section">
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em;">Horario General</h3>
            <p class="subtitle" style="margin: 0.25rem 0 0; color: #6b7280; font-size: 0.85rem;">
              Todas las clases activas y su horario semanal, con diagnóstico operativo de salones y cupos.
            </p>
          </div>
        </div>

        <div class="admin-toolbar-dense">
          <button id="btnHorarioRefresh" class="btn-premium-action btn-premium-secondary ms-auto">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
          <button id="btnHorarioReporte" class="btn-premium-action btn-premium-primary ms-2" style="background: linear-gradient(135deg, #b45309 0%, #92400e 100%); border: none; color: white;">
            <i class="bi bi-file-earmark-pdf-fill"></i> Descargar PDF / HTML
          </button>
        </div>

        <div class="metrics-grid mb-4">
          <div class="stat-card ${stats.conflictos ? 'alert' : 'success'}" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem; color: ${stats.conflictos ? '#ef4444' : '#10b981'};">${stats.conflictos}</div>
            <div class="stat-label" style="font-size: 0.72rem; margin-bottom: 0;">CONFLICTOS DE SALÓN</div>
          </div>
          <div class="stat-card ${stats.sinSalon ? 'warning' : 'success'}" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem; color: ${stats.sinSalon ? '#f97316' : '#10b981'};">${stats.sinSalon}</div>
            <div class="stat-label" style="font-size: 0.72rem; margin-bottom: 0;">SESIONES SIN SALÓN</div>
          </div>
          <div class="stat-card ${stats.sobreCupo ? 'warning' : 'success'}" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem; color: ${stats.sobreCupo ? '#f97316' : '#10b981'};">${stats.sobreCupo}</div>
            <div class="stat-label" style="font-size: 0.72rem; margin-bottom: 0;">CLASES SOBRE CUPO</div>
          </div>
          <div class="stat-card" style="padding: 1rem 1.25rem; border-left-color: #3b82f6;">
            <div class="stat-value" style="font-size: 1.75rem; color: #3b82f6;">${stats.totalClases}</div>
            <div class="stat-label" style="font-size: 0.72rem; margin-bottom: 0;">CLASES ACTIVAS · ${stats.totalSesiones} SESIONES/SEM</div>
          </div>
        </div>

        ${this._renderFindings(findings)}
        ${this._renderLeyenda()}
        ${this._renderDias(sesiones)}
      </div>
    `

    this.container.innerHTML = html
  }

  _renderFindings(findings) {
    if (!findings.length) {
      return `
        <div class="premium-table-container mb-4" style="padding: 1rem 1.25rem;">
          <span style="color: #10b981; font-weight: 600;"><i class="bi bi-check-circle-fill"></i> No se detectaron conflictos ni datos faltantes.</span>
        </div>
      `
    }
    const sevStyle = {
      crit: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', chip: '#ef4444' },
      warn: { bg: 'rgba(249, 115, 22, 0.08)', border: '#f97316', chip: '#f97316' },
    }
    const rows = findings
      .map((f) => {
        const s = sevStyle[f.sev] || sevStyle.warn
        return `
          <div style="display:flex; gap:0.85rem; align-items:flex-start; padding:0.85rem 1rem; background:${s.bg}; border-left:4px solid ${s.border}; border-radius:8px; margin-bottom:0.5rem;">
            <span style="flex:none; font-size:0.66rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:${s.chip}; background:rgba(255,255,255,0.6); padding:0.2rem 0.5rem; border-radius:999px; margin-top:0.1rem;">${escHTML(f.chip)}</span>
            <div style="flex:1; font-size:0.85rem;">
              <div>${escHTML(f.summary)}</div>
              ${f.detail ? `<div style="font-size:0.78rem; color:#6b7280; margin-top:0.15rem;">${escHTML(f.detail)}</div>` : ''}
            </div>
            ${f.claseId ? `<button class="btn-action-icon btn-action-primary-light btn-ver-clase" data-clase-id="${f.claseId}" title="Ver ficha de la clase" style="flex:none;"><i class="bi bi-eye-fill"></i></button>` : ''}
          </div>
        `
      })
      .join('')
    return `
      <div class="mb-4">
        <h5 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;">Diagnóstico <span style="color:#6b7280; font-weight: 500;">(${findings.length} hallazgo${findings.length === 1 ? '' : 's'})</span></h5>
        ${rows}
      </div>
    `
  }

  _renderLeyenda() {
    return `
      <div style="display:flex; flex-wrap:wrap; gap:0.4rem 1rem; margin-bottom:0.75rem; font-size:0.78rem; color:#6b7280;">
        ${Object.entries(FAMILIA_LABEL)
          .map(([k, label]) => `<span style="display:inline-flex;align-items:center;gap:0.35rem;"><span style="width:8px;height:8px;border-radius:50%;background:${FAM_COLOR[k]};display:inline-block;"></span>${label}</span>`)
          .join('')}
      </div>
    `
  }

  _renderDias(sesiones) {
    return DIAS.filter((dia) => sesiones.some((s) => s.dia === dia))
      .map((dia) => {
        const items = sesiones.filter((s) => s.dia === dia).sort((a, b) => (a.inicio || '').localeCompare(b.inicio || ''))
        const rows = items
          .map((s) => {
            const over = s.inscritos > s.cupo
            const fam = familiaDe(s.instrumento)
            return `
              <tr>
                <td style="white-space:nowrap;">${escHTML(s.inicio)}–${escHTML(s.fin)}</td>
                <td>
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${FAM_COLOR[fam]};margin-right:0.4rem;"></span>
                  <strong>${escHTML(s.clase)}</strong>
                </td>
                <td>${escHTML(s.instrumento || '—')}</td>
                <td>
                  ${escHTML(s.maestro)}
                  ${s.suplente ? `<div style="font-size:0.76rem;color:#8b949e;">Suplente: ${escHTML(s.suplente)}</div>` : ''}
                </td>
                <td>${s.salon ? escHTML(s.salon) : '<span class="badge" style="background: rgba(249, 115, 22, 0.15); color: #f97316;">Sin salón</span>'}</td>
                <td style="text-align:center; ${over ? 'color:#ef4444;font-weight:700;' : ''}">${s.inscritos} / ${s.cupo}${over ? ' <span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">Sobre cupo</span>' : ''}</td>
                <td style="text-align:right;"><button class="btn-action-icon btn-action-primary-light btn-ver-clase" data-clase-id="${s.claseId}" title="Ver ficha de la clase"><i class="bi bi-eye-fill"></i></button></td>
              </tr>
            `
          })
          .join('')
        return `
          <div class="premium-table-container mb-3">
            <div style="padding: 0.75rem 1rem 0.25rem; font-weight: 700;">${escHTML(DIA_LABEL[dia] || dia)} <span style="color:#6b7280; font-weight: 500; font-size: 0.82rem;">· ${items.length} sesión${items.length === 1 ? '' : 'es'}</span></div>
            <table class="premium-table">
              <thead><tr><th>Hora</th><th>Clase</th><th>Instrumento</th><th>Docente</th><th>Salón</th><th>Cupo</th><th></th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        `
      })
      .join('')
  }

  attachEvents() {
    const btnRefresh = document.getElementById('btnHorarioRefresh')
    this._btnRefreshHandler = () => this.init()
    btnRefresh?.addEventListener('click', this._btnRefreshHandler)

    const btnReporte = document.getElementById('btnHorarioReporte')
    this._btnReporteHandler = () => this.onGenerarReporte(btnReporte)
    btnReporte?.addEventListener('click', this._btnReporteHandler)

    this._verClaseHandlers = []
    this.container.querySelectorAll('.btn-ver-clase').forEach((btn) => {
      const handler = (e) => {
        e.preventDefault()
        const claseId = btn.dataset.claseId
        this.onVerClase(claseId)
      }
      this._verClaseHandlers.push({ btn, handler })
      btn.addEventListener('click', handler)
    })
  }

  onVerClase(claseId) {
    if (!claseId) return
    import('../../../core/router/router.js').then(({ router }) => {
      router.navigate('clases', { selectedId: claseId })
    })
  }

  async onGenerarReporte(btn) {
    if (this.generandoReporte || !this.data) return
    this.generandoReporte = true
    const originalHtml = btn?.innerHTML
    if (btn) {
      btn.disabled = true
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span>Generando...`
    }
    try {
      const html = generateHorarioGeneralReportHTML(this.data)
      const fecha = new Date().toISOString().split('T')[0]
      openReport(html, `horario-general-${fecha}`, { title: `Horario General · El Sistema Punta Cana` })
    } catch (err) {
      console.error('[HorarioGeneralWidget] Error generando reporte:', err)
      AppToast.error('Error al generar el reporte: ' + err.message)
    } finally {
      this.generandoReporte = false
      if (btn) {
        btn.disabled = false
        btn.innerHTML = originalHtml
      }
    }
  }

  destroy() {
    const btnRefresh = document.getElementById('btnHorarioRefresh')
    const btnReporte = document.getElementById('btnHorarioReporte')
    if (btnRefresh && this._btnRefreshHandler) btnRefresh.removeEventListener('click', this._btnRefreshHandler)
    if (btnReporte && this._btnReporteHandler) btnReporte.removeEventListener('click', this._btnReporteHandler)
    if (this._verClaseHandlers) {
      this._verClaseHandlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler))
      this._verClaseHandlers = []
    }
  }
}

export default HorarioGeneralWidget
