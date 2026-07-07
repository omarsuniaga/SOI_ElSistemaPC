import { obtenerVariantesPendientes, aprobarVariante, obtenerRuta } from '../api/rutasApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const STYLE = `
<style id="ruta-variantes-dashboard-style">
.variante-card { border: 1px solid #dee2e6; border-radius: 6px; padding: 15px; margin-bottom: 15px; transition: all 0.2s; }
.variante-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.variante-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; }
.cambio-list { background: #f9f9f9; border-left: 4px solid #007bff; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 0.9rem; }
</style>`

export async function renderRutaVariantesDashboard(container) {
  if (!container) return

  try {
    const variantes = await obtenerVariantesPendientes()

    if (variantes.length === 0) {
      container.innerHTML = `${STYLE}<div class="alert alert-info">No hay variantes pendientes de aprobación.</div>`
      return
    }

    let html = `${STYLE}
      <div class="mb-3">
        <h5><span class="badge bg-warning">${variantes.length} pendientes</span></h5>
      </div>`

    for (const variante of variantes) {
      const rutaBase = variante.ruta_base_id ? await obtenerRuta(variante.ruta_base_id) : null

      html += `
        <div class="variante-card">
          <div class="variante-header">
            <div>
              <h6 class="mb-1"><strong>${variante.nombre}</strong></h6>
              <small class="text-muted">
                Propuesta por maestro • ${new Date(variante.created_at).toLocaleDateString()}
              </small>
            </div>
            <span class="badge bg-warning">Pendiente</span>
          </div>

          <p class="mb-2" style="font-size: 0.9rem; color: #555;">${variante.descripcion}</p>

          <div class="cambio-list">
            <strong>Cambios:</strong>
            <div style="margin-top: 8px;">
              ${variante.objetivos?.length || 0} objetivos en esta variante
              (base: ${rutaBase?.objetivos?.length || 0})
            </div>
          </div>

          <div class="d-flex gap-2" style="margin-top: 12px;">
            <button class="btn btn-sm btn-success" data-approve-id="${variante.id}">
              <i class="bi bi-check me-1"></i>Aprobar
            </button>
            <button class="btn btn-sm btn-outline-danger" data-reject-id="${variante.id}">
              <i class="bi bi-x me-1"></i>Rechazar
            </button>
          </div>
        </div>
      `
    }

    container.innerHTML = html

    // Attach event listeners
    document.querySelectorAll('[data-approve-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const rutaId = e.target.closest('button').dataset.approveId
        try {
          await aprobarVariante(rutaId, true)
          AppToast.success('Variante aprobada')
          location.reload()
        } catch (err) {
          AppToast.error(`Error: ${err.message}`)
        }
      })
    })

    document.querySelectorAll('[data-reject-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const rutaId = e.target.closest('button').dataset.rejectId
        const razon = prompt('Razón del rechazo:')
        if (!razon) return

        try {
          await aprobarVariante(rutaId, false, razon)
          AppToast.success('Variante rechazada')
          location.reload()
        } catch (err) {
          AppToast.error(`Error: ${err.message}`)
        }
      })
    })

  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`
  }
}
