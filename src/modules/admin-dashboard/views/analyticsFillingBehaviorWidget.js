import '../styles/analyticsFillingBehavior.css'
import { getTeacherFillingMetrics } from '../api/analyticsFillingBehaviorAdapter.js'
import { InfoTooltip, attachInfoTooltipEvents, injectInfoTooltipStyles } from '../../../shared/components/InfoTooltip.js'
import { sendWhatsAppReminder, isValidWhatsAppNumber } from '../../metricas/services/attendanceNotificationService.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'

function esc(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function classifyOrder(m) {
  if (m.orden_asistencia_primero > m.orden_observaciones_primero && m.orden_asistencia_primero > m.orden_simultaneo) return 'asistencia_primero'
  if (m.orden_observaciones_primero > m.orden_asistencia_primero && m.orden_observaciones_primero > m.orden_simultaneo) return 'observaciones_primero'
  if (m.orden_simultaneo > 0) return 'simultaneo'
  return 'sin_clasificar'
}

function classifyAvgDuration(seconds) {
  if (seconds <= 0) return 'sin_datos'
  if (seconds < 30) return 'rapida'
  if (seconds < 90) return 'normal'
  return 'detallada'
}

function calculateStats(metrics) {
  const total = metrics.length
  if (total === 0) return { total: 0 }

  const asistenciaP = metrics.reduce((s, m) => s + (m.orden_asistencia_primero || 0), 0)
  const observacionesP = metrics.reduce((s, m) => s + (m.orden_observaciones_primero || 0), 0)
  const simultaneo = metrics.reduce((s, m) => s + (m.orden_simultaneo || 0), 0)
  const faltaAsistencia = metrics.reduce((s, m) => s + (m.incompleto_falta_asistencia || 0), 0)
  const faltaObservaciones = metrics.reduce((s, m) => s + (m.incompleto_falta_observaciones || 0), 0)
  const faltaAmbos = metrics.reduce((s, m) => s + (m.incompleto_falta_ambos || 0), 0)
  const totalClases = metrics.reduce((s, m) => s + (m.total_clases || 0), 0)

  const avgDuration = metrics.length > 0
    ? (metrics.reduce((s, m) => s + (m.promedio_duracion_observaciones || 0), 0) / metrics.length)
    : 0

  const avgAi = metrics.length > 0
    ? (metrics.reduce((s, m) => s + (m.uso_ai_fill_percent || 0), 0) / metrics.length)
    : 0

  const firstOrder = metrics.filter(m => classifyOrder(m) === 'asistencia_primero').length
  const obsOrder = metrics.filter(m => classifyOrder(m) === 'observaciones_primero').length
  const simOrder = metrics.filter(m => classifyOrder(m) === 'simultaneo').length
  const unclassified = metrics.filter(m => classifyOrder(m) === 'sin_clasificar').length

  return {
    total,
    totalClases,
    asistenciaPrimero: totalClases > 0 ? ((asistenciaP / totalClases) * 100).toFixed(1) : 0,
    observacionesPrimero: totalClases > 0 ? ((observacionesP / totalClases) * 100).toFixed(1) : 0,
    simultaneo: totalClases > 0 ? ((simultaneo / totalClases) * 100).toFixed(1) : 0,
    incompleto: totalClases > 0 ? (((faltaAsistencia + faltaObservaciones + faltaAmbos) / totalClases) * 100).toFixed(1) : 0,
    avgDuration: avgDuration.toFixed(1),
    avgAi: avgAi.toFixed(1),
    firstOrderCount: firstOrder,
    obsOrderCount: obsOrder,
    simOrderCount: simOrder,
    unclassifiedCount: unclassified,
    firstOrderPct: total > 0 ? ((firstOrder / total) * 100).toFixed(0) : 0,
    obsOrderPct: total > 0 ? ((obsOrder / total) * 100).toFixed(0) : 0,
    simOrderPct: total > 0 ? ((simOrder / total) * 100).toFixed(0) : 0,
    unclassifiedPct: total > 0 ? ((unclassified / total) * 100).toFixed(0) : 0,
  }
}

function bar(width, color) {
  return `<div style="width:${Math.min(width, 100)}%;height:6px;border-radius:3px;background:${color};transition:width 0.4s ease;"></div>`
}

function renderDistributionBar(stats) {
  const segments = [
    { pct: parseFloat(stats.firstOrderPct), color: '#3b82f6', label: 'Asistencia 1°' },
    { pct: parseFloat(stats.obsOrderPct), color: '#8b5cf6', label: 'Obs. 1°' },
    { pct: parseFloat(stats.simOrderPct), color: '#10b981', label: 'Simultáneo' },
    { pct: parseFloat(stats.unclassifiedPct), color: '#9ca3af', label: 'Sin clasif.' },
  ]
  const totalW = segments.reduce((s, x) => s + x.pct, 0) || 1
  return segments.map(s => {
    const w = (s.pct / totalW) * 100
    return `<span style="display:inline-block;width:${w}%;min-width:4px;height:6px;background:${s.color};border-radius:3px 0 0 3px;" title="${s.label}: ${s.pct}%"></span>`
  }).join('')
}

async function getMaestrosPendingAlerts(maestros) {
  try {
    if (config?.isDemoMode) {
      // Demo alerts simulation
      return {
        '+584129876543': 1,
      }
    }

    const phones = maestros
      .filter(m => m.maestro_phone)
      .map(m => m.maestro_phone)

    if (phones.length === 0) return {}

    const { data, error } = await supabase
      .from('notificaciones_asistencia')
      .select('destinatario_telefono, id')
      .in('destinatario_telefono', phones)
      .eq('tipo', 'recordatorio_asistencia_maestro')
      .eq('estado', 'pendiente')

    if (error) {
      console.warn('[analyticsFillingBehaviorWidget] Error fetching pending alerts:', error.message)
      return {}
    }

    const alertsMap = {}
    if (data) {
      data.forEach(row => {
        alertsMap[row.destinatario_telefono] = (alertsMap[row.destinatario_telefono] || 0) + 1
      })
    }
    return alertsMap
  } catch (err) {
    console.error('Error fetching pending alerts:', err)
    return {}
  }
}

function openTeacherReminderModal(data) {
  // Validar teléfono
  if (!isValidWhatsAppNumber(data.phone)) {
    const errorModal = new AppModal({
      title: '⚠️ Número Inválido',
      body: `<div class="alert alert-warning">
        <p class="mb-1">No se puede enviar el recordatorio al número <code>${esc(data.phone || 'no asignado')}</code>.</p>
        <p class="mb-0"><small>Verifique el contacto en el perfil del maestro (Formato: +58414XXXXXXX).</small></p>
      </div>`,
    })
    errorModal.show()
    return
  }

  // Mensaje personalizado
  const message = `Buenos días, estimado(a) Prof. ${data.name},\n\nLe recordamos cordialmente que tiene ${data.incompleto} clase(s) con asistencia pendiente por registrar en el portal SOI.\n\nPor favor, cuando disponga de tiempo complete el registro.\n\n¡Muchas gracias! 🎵`

  const modal = new AppModal({
    title: '🔔 Recordar Maestro',
    body: `
      <div class="modal-body p-0">
        <div class="alert alert-info mb-3">
          <strong>Maestro:</strong> ${esc(data.name)}<br>
          <strong>Teléfono WhatsApp:</strong> <code>${esc(data.phone)}</code><br>
          <strong>Clases Incompletas:</strong> <span class="badge bg-warning text-dark">${data.incompleto} sesión(es)</span>
        </div>
        <div class="mb-3">
          <label class="form-label fw-bold">Mensaje a Enviar:</label>
          <div class="p-3 bg-light rounded border border-secondary-subtle" style="white-space: pre-wrap; font-size: 0.9rem;">
            ${esc(message)}
          </div>
        </div>
      </div>
    `,
    footer: `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
      <button type="button" class="btn btn-warning text-dark fw-semibold" id="btn-send-teacher-reminder">
        <i class="bi bi-whatsapp me-1"></i>Enviar Recordatorio
      </button>
    `,
    onShow: () => {
      const sendBtn = document.getElementById('btn-send-teacher-reminder')
      if (sendBtn) {
        sendBtn.addEventListener('click', async () => {
          modal.hide()
          try {
            const result = await sendWhatsAppReminder({
              recipient_phone: data.phone,
              recipient_name: data.name,
              message: message,
              tipo: 'recordatorio_asistencia_maestro',
            })

            const successModal = new AppModal({
              title: '✅ Recordatorio Encolado',
              body: `<div class="alert alert-success">
                <p class="mb-1">El recordatorio para <strong>${esc(data.name)}</strong> ha sido registrado.</p>
                <p class="mb-0"><small>HERMES procesará la entrega vía WhatsApp.</small></p>
              </div>`,
            })
            successModal.show()
          } catch (err) {
            const errorModal = new AppModal({
              title: '❌ Error',
              body: `<div class="alert alert-danger">${esc(err.message)}</div>`,
            })
            errorModal.show()
          }
        })
      }
    },
  })

  modal.show()
}

export function analyticsFillingBehaviorWidget(containerId) {
  const container = document.getElementById(containerId)
  let currentStartDate = ''
  let currentEndDate = ''

  function getDefaultStartDate() {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 10)
  }

  function initDateRange() {
    const end = new Date().toISOString().slice(0, 10)
    const start = getDefaultStartDate()
    currentStartDate = start
    currentEndDate = end
    return { start, end }
  }

  function dateRangeHTML() {
    return `
      <div class="admin-toolbar-dense" style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-bottom:1.5rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <label style="font-size:0.8rem;font-weight:600;color:var(--bs-secondary-color);">Desde:</label>
          <input type="date" id="filterStartDate" value="${esc(currentStartDate)}" class="form-control form-control-sm" style="width:150px;">
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <label style="font-size:0.8rem;font-weight:600;color:var(--bs-secondary-color);">Hasta:</label>
          <input type="date" id="filterEndDate" value="${esc(currentEndDate)}" class="form-control form-control-sm" style="width:150px;">
        </div>
        <button id="btnApplyFilter" class="btn-premium-action btn-premium-primary" style="padding:0.35rem 1rem;font-size:0.85rem;">
          <i class="bi bi-funnel"></i> Filtrar
        </button>
        <button id="btnResetFilter" class="btn-premium-action btn-premium-secondary" style="padding:0.35rem 1rem;font-size:0.85rem;">
          <i class="bi bi-x-circle"></i> Limpiar
        </button>
      </div>
    `
  }

  function renderStatsCards(stats) {
    return `
      <div class="stats-grid">
        <div class="stat-card" style="border-left-color:#3b82f6;">
          <div class="stat-label">Asistencia 1° ${InfoTooltip('analitca_comportamiento')}</div>
          <div class="stat-value" style="color:#3b82f6;">${stats.asistenciaPrimero}%</div>
          <div class="stat-subtitle" style="font-size:0.7rem;color:var(--bs-secondary-color);margin-top:0.25rem;">${stats.firstOrderCount} maestros</div>
        </div>
        <div class="stat-card" style="border-left-color:#8b5cf6;">
          <div class="stat-label">Observaciones 1° ${InfoTooltip('observacion')}</div>
          <div class="stat-value" style="color:#8b5cf6;">${stats.observacionesPrimero}%</div>
          <div class="stat-subtitle" style="font-size:0.7rem;color:var(--bs-secondary-color);margin-top:0.25rem;">${stats.obsOrderCount} maestros</div>
        </div>
        <div class="stat-card" style="border-left-color:#10b981;">
          <div class="stat-label">Simultáneo ${InfoTooltip('analitca_comportamiento')}</div>
          <div class="stat-value" style="color:#10b981;">${stats.simultaneo}%</div>
          <div class="stat-subtitle" style="font-size:0.7rem;color:var(--bs-secondary-color);margin-top:0.25rem;">${stats.simOrderCount} maestros</div>
        </div>
        <div class="stat-card" style="border-left-color:#f59e0b;">
          <div class="stat-label">Incompleto ${InfoTooltip('analitca_comportamiento')}</div>
          <div class="stat-value" style="color:#f59e0b;">${stats.incompleto}%</div>
          <div class="stat-subtitle" style="font-size:0.7rem;color:var(--bs-secondary-color);margin-top:0.25rem;">${stats.unclassifiedCount} sin clasificar</div>
        </div>
        <div class="stat-card" style="border-left-color:#06b6d4;">
          <div class="stat-label">Duración Prom. ${InfoTooltip('observacion')}</div>
          <div class="stat-value" style="color:#06b6d4;">${stats.avgDuration}s</div>
          <div class="stat-subtitle" style="font-size:0.7rem;color:var(--bs-secondary-color);margin-top:0.25rem;">Por observación</div>
        </div>
        <div class="stat-card" style="border-left-color:#f97316;">
          <div class="stat-label">Uso IA Prom. ${InfoTooltip('confianza_ia')}</div>
          <div class="stat-value" style="color:#f97316;">${stats.avgAi}%</div>
          <div class="stat-subtitle" style="font-size:0.7rem;color:var(--bs-secondary-color);margin-top:0.25rem;">${stats.total} maestros</div>
        </div>
      </div>
    `
  }

  function renderDistribution(stats) {
    const items = [
      { label: 'Asistencia 1°', pct: stats.firstOrderPct, count: stats.firstOrderCount, color: '#3b82f6' },
      { label: 'Obs. 1°', pct: stats.obsOrderPct, count: stats.obsOrderCount, color: '#8b5cf6' },
      { label: 'Simultáneo', pct: stats.simOrderPct, count: stats.simOrderCount, color: '#10b981' },
      { label: 'Sin clasificar', pct: stats.unclassifiedPct, count: stats.unclassifiedCount, color: '#9ca3af' },
    ]
    const maxPct = Math.max(...items.map(i => parseFloat(i.pct)), 1)

    return items.map(i => {
      const w = (parseFloat(i.pct) / maxPct) * 100
      return `
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
          <span style="width:120px;font-size:0.8rem;text-align:right;color:var(--bs-secondary-color);">${i.label}</span>
          <div style="flex:1;height:20px;background:var(--bs-border-color);border-radius:4px;overflow:hidden;">
            ${bar(w, i.color)}
          </div>
          <span style="width:60px;font-size:0.8rem;font-weight:600;">${i.pct}%</span>
          <span style="width:30px;font-size:0.75rem;color:var(--bs-secondary-color);">(${i.count})</span>
        </div>
      `
    }).join('')
  }

  function renderMaestroTable(metrics, pendingAlerts = {}) {
    if (metrics.length === 0) return '<div class="premium-no-data">Sin datos</div>'

    return `
      <div class="premium-table-container">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Maestro</th>
              <th>Total Clases ${InfoTooltip('cumplimiento_sesiones')}</th>
              <th>Asistencia 1° ${InfoTooltip('analitca_comportamiento')}</th>
              <th>Obs. 1° ${InfoTooltip('observacion')}</th>
              <th>Simultáneo</th>
              <th>Incompleto ${InfoTooltip('analitca_comportamiento')}</th>
              <th>Pendientes</th>
              <th>Dur. Obs (s) ${InfoTooltip('observacion')}</th>
              <th>IA % ${InfoTooltip('confianza_ia')}</th>
              <th>Orden Pref.</th>
              <th>Última Clase</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${metrics.map(m => {
              const total = m.total_clases || 0
              const clasificadas = (m.orden_asistencia_primero || 0) + (m.orden_observaciones_primero || 0) + (m.orden_simultaneo || 0)
              const incompleto = total - clasificadas
              const aiPct = m.uso_ai_fill_percent || 0
              const orderLabel = classifyOrder(m) === 'asistencia_primero' ? 'Asistencia' : classifyOrder(m) === 'observaciones_primero' ? 'Obs.' : classifyOrder(m) === 'simultaneo' ? 'Simul.' : '—'
              const pendingCount = pendingAlerts[m.maestro_phone] || 0

              return `
                <tr>
                  <td><strong>${esc(m.maestro_nombre)}</strong></td>
                  <td><span class="badge bg-secondary-subtle text-secondary-emphasis px-2 py-1">${total}</span></td>
                  <td><span class="badge bg-primary-subtle text-primary-emphasis px-2 py-1">${m.orden_asistencia_primero || 0}</span></td>
                  <td><span class="badge" style="background:rgba(139,92,246,0.12);color:#7c3aed;font-size:0.75rem;font-weight:600;">${m.orden_observaciones_primero || 0}</span></td>
                  <td><span class="badge bg-success-subtle text-success-emphasis px-2 py-1">${m.orden_simultaneo || 0}</span></td>
                  <td>
                    <span class="badge ${incompleto > 0 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'} px-2 py-1">${incompleto}</span>
                  </td>
                  <td class="text-center">
                    ${pendingCount > 0 ? `
                      <span class="badge bg-warning text-dark" title="Alertas pendientes">
                        ⏳ ${pendingCount}
                      </span>
                    ` : '<span class="text-muted">—</span>'}
                  </td>
                  <td>
                    <span class="badge ${classifyAvgDuration(m.promedio_duracion_observaciones) === 'detallada' ? 'bg-success text-white' : classifyAvgDuration(m.promedio_duracion_observaciones) === 'normal' ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary-emphasis'} px-2 py-1">
                      ${m.promedio_duracion_observaciones || 0}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                      <div style="flex:1;height:6px;background:var(--bs-border-color);border-radius:3px;overflow:hidden;min-width:40px;">
                        ${bar(aiPct, aiPct > 70 ? '#10b981' : aiPct > 30 ? '#3b82f6' : '#9ca3af')}
                      </div>
                      <span style="font-size:0.75rem;font-weight:600;${aiPct > 70 ? 'color:#10b981' : aiPct > 30 ? 'color:#3b82f6' : 'color:var(--bs-secondary-color)'}">${aiPct}%</span>
                    </div>
                  </td>
                  <td><span class="badge bg-info-subtle text-info-emphasis px-2 py-1" style="font-size:0.7rem;">${orderLabel}</span></td>
                  <td style="font-size:0.75rem;color:var(--bs-secondary-color);">${m.fecha_ultima_clase || '—'}</td>
                  <td class="text-center">
                    ${incompleto > 0 ? `
                      <button class="btn btn-sm btn-outline-warning" data-action="remind-teacher-direct" data-teacher-phone="${esc(m.maestro_phone || '')}" data-teacher-name="${esc(m.maestro_nombre)}" data-incompleto="${incompleto}">
                        <i class="bi bi-whatsapp me-1"></i>Recordar
                      </button>
                    ` : '<span class="badge bg-success-subtle text-success-emphasis">✓ Al día</span>'}
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  const widget = {
    async init() {
      injectInfoTooltipStyles()
      const { start, end } = initDateRange()
      currentStartDate = start
      currentEndDate = end

      container.innerHTML = `
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando analítica...</div>
        </div>
      `

      try {
        const metrics = await getTeacherFillingMetrics(currentStartDate, currentEndDate)

        if (!metrics || metrics.length === 0) {
          container.innerHTML = `
            <div class="analytics-widget">
              <h2><i class="bi bi-bar-chart-steps text-primary"></i> Analítica de Llenado de Asistencias ${InfoTooltip('analitca_comportamiento')}</h2>
              ${dateRangeHTML()}
              <div class="premium-no-data">No hay datos disponibles para el rango seleccionado</div>
            </div>
          `
          this.attachFilterEvents()
          return
        }

        const pendingAlerts = await getMaestrosPendingAlerts(metrics)
        this.render(metrics, pendingAlerts)
      } catch (err) {
        console.error('[analyticsFillingBehaviorWidget] Error:', err)
        container.innerHTML = `
          <div class="analytics-widget">
            <h2><i class="bi bi-bar-chart-steps text-primary"></i> Analítica de Llenado de Asistencias</h2>
            <div class="premium-error-card">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <div>Error cargando analítica. Detalle: ${esc(err.message)}</div>
            </div>
          </div>
        `
      }
    },

    render(metrics, pendingAlerts = {}) {
      const stats = calculateStats(metrics)

      const html = `
        <div class="analytics-widget">
          <h2><i class="bi bi-bar-chart-steps text-primary"></i> Analítica de Llenado de Asistencias ${InfoTooltip('analitca_comportamiento')}</h2>

          ${dateRangeHTML()}

          ${renderStatsCards(stats)}

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem;">
            <div class="maestro-metrics-section" style="margin-top:0;">
              <h3>Distribución de Orden de Llenado</h3>
              <div class="premium-table-container">
                ${renderDistribution(stats)}
              </div>
            </div>
            <div class="maestro-metrics-section" style="margin-top:0;">
              <h3>Resumen de Clases</h3>
              <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--bs-secondary-bg);border-radius:8px;">
                  <span style="font-size:0.85rem;color:var(--bs-secondary-color);">Total clases analizadas</span>
                  <span style="font-weight:700;font-size:1.1rem;">${stats.totalClases}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--bs-secondary-bg);border-radius:8px;">
                  <span style="font-size:0.85rem;color:var(--bs-secondary-color);">Maestros activos</span>
                  <span style="font-weight:700;font-size:1.1rem;">${stats.total}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--bs-secondary-bg);border-radius:8px;">
                  <span style="font-size:0.85rem;color:var(--bs-secondary-color);">Promedio duración observaciones</span>
                  <span style="font-weight:700;font-size:1.1rem;">${stats.avgDuration}s</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--bs-secondary-bg);border-radius:8px;">
                  <span style="font-size:0.85rem;color:var(--bs-secondary-color);">Uso IA promedio</span>
                  <span style="font-weight:700;font-size:1.1rem;">${stats.avgAi}%</span>
                </div>
              </div>
            </div>
          </div>

          <section class="maestro-metrics-section">
            <h3>Detalle por Maestro</h3>
            ${renderMaestroTable(metrics, pendingAlerts)}
          </section>
        </div>
      `

      container.innerHTML = html
      this.attachFilterEvents()
      this.attachActionEvents()
      attachInfoTooltipEvents(container)
    },

    attachActionEvents() {
      container.querySelectorAll('[data-action="remind-teacher-direct"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const teacherName = btn.dataset.teacherName
          const phone = btn.dataset.teacherPhone
          const incompleto = btn.dataset.incompleto

          openTeacherReminderModal({
            name: teacherName,
            phone: phone,
            incompleto: incompleto,
          })
        })
      })
    },

    attachFilterEvents() {
      const startInput = document.getElementById('filterStartDate')
      const endInput = document.getElementById('filterEndDate')
      const btnApply = document.getElementById('btnApplyFilter')
      const btnReset = document.getElementById('btnResetFilter')

      const applyFilter = () => {
        currentStartDate = startInput?.value || ''
        currentEndDate = endInput?.value || ''
        this.init()
      }

      if (btnApply) btnApply.addEventListener('click', applyFilter)
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          const { start, end } = initDateRange()
          currentStartDate = start
          currentEndDate = end
          if (startInput) startInput.value = start
          if (endInput) endInput.value = end
          this.init()
        })
      }
    },

    destroy() {
      if (container) container.innerHTML = ''
    }
  }

  return widget
}
