import { getMaestroPendingRegistros, getMaestroNotificationHistory } from '../api/adminMaestroApi.js'
import { router } from '../../../core/router/router.js'

function escHTML(str) {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export class MaestroDetalleView {
  constructor(containerId, maestroId) {
    this.containerId = containerId
    this.maestroId = maestroId
    this.container = document.getElementById(containerId)
  }

  async init() {
    try {
      this.container.innerHTML = `<div class="premium-loading"><div class="premium-loading-spinner"></div><div>Cargando detalle...</div></div>`

      const [registros, notificaciones] = await Promise.all([
        getMaestroPendingRegistros(this.maestroId),
        getMaestroNotificationHistory(this.maestroId),
      ])

      this.render(registros, notificaciones)
    } catch (err) {
      console.error('[MaestroDetalleView] Error:', err)
      this.container.innerHTML = `
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error: ${escHTML(err.message)}</div>
        </div>`
    }
  }

  render(registros, notificaciones) {
    const notiCount = notificaciones?.length ?? 0
    const regCount = registros?.length ?? 0

    this.container.innerHTML = `
      <div class="distribution-card">
        <div class="admin-header-brand mb-4">
          <button class="btn btn-sm btn-outline-secondary me-3" id="btnVolver">
            <i class="bi bi-arrow-left"></i> Volver
          </button>
          <div class="admin-header-icon-wrapper" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
            <i class="bi bi-person-badge"></i>
          </div>
          <div class="admin-header-title-section">
            <h3 style="margin:0;font-size:1.3rem;font-weight:800;letter-spacing:-0.02em;">
              Detalle de Maestro
            </h3>
            <p class="subtitle" style="margin:0.25rem 0 0;color:#6b7280;font-size:0.85rem;">
              Registros pendientes y notificaciones
            </p>
          </div>
        </div>

        <div class="metrics-grid mb-4">
          <div class="stat-card alert" style="padding:1rem 1.25rem;">
            <div class="stat-value" style="font-size:1.75rem;">${regCount}</div>
            <div class="stat-label" style="font-size:0.7rem;">Registros Pendientes</div>
          </div>
          <div class="stat-card warning" style="padding:1rem 1.25rem;">
            <div class="stat-value" style="font-size:1.75rem;">${notiCount}</div>
            <div class="stat-label" style="font-size:0.7rem;">Notificaciones Enviadas</div>
          </div>
        </div>

        <div class="premium-table-container">
          <h5 style="margin-bottom:1rem;">Registros Pendientes</h5>
          <table class="premium-table">
            <thead>
              <tr>
                <th>Clase</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Notif.</th>
              </tr>
            </thead>
            <tbody>
              ${regCount === 0
                ? '<tr><td colspan="5" class="premium-no-data">Sin registros pendientes</td></tr>'
                : registros.map(r => `
                  <tr>
                    <td>${r.clases?.nombre ? escHTML(r.clases.nombre) : '---'}</td>
                    <td><span class="badge bg-secondary">${escHTML(r.tipo)}</span></td>
                    <td><span class="badge ${r.notification_state === 'ROJO' ? 'bg-danger' : r.notification_state === 'NARANJA' ? 'bg-warning' : 'bg-info'}">${escHTML(r.notification_state || r.estado)}</span></td>
                    <td style="font-size:0.8rem;">${new Date(r.created_at).toLocaleDateString()}</td>
                    <td>${r.notif_count ?? 0}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `

    document.getElementById('btnVolver')?.addEventListener('click', () => {
      router.navigate('admin-dashboard')
    })
  }
}

export default MaestroDetalleView
