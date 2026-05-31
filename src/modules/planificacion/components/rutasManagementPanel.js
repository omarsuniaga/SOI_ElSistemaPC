/**
 * rutasManagementPanel.js
 * Panel para gestionar Rutas de Contenido
 * - Admin: crear rutas SOI + revisar variantes
 * - Maestro: proponer variantes
 */

import { openRutaCrearModal } from './rutaCrearModal.js'
import { openRutaVarianteModal } from './rutaVarianteModal.js'
import { renderRutaVariantesDashboard } from './rutaVariantesDashboard.js'
import { listarRutas } from '../api/rutasApi.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const STYLE = `
<style id="rutas-management-style">
.rutas-panel { background: white; border-radius: 8px; padding: 24px; }
.rutas-section { margin-bottom: 32px; }
.rutas-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}
.rutas-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.rutas-actions button { white-space: nowrap; }
.rutas-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}
.rutas-empty i {
  font-size: 2rem;
  display: block;
  margin-bottom: 12px;
  color: #ddd;
}
</style>
`

export async function renderRutasManagementPanel(container, viewMode = 'maestro') {
  if (!container) return

  const isAdmin = viewMode === 'admin'

  try {
    let html = STYLE

    if (isAdmin) {
      // Admin mode: crear rutas + revisar variantes
      html += `
        <div class="rutas-panel">
          <div class="rutas-section">
            <div class="rutas-section-title">
              <i class="bi bi-diagram-3 me-2"></i>
              Crear Ruta SOI Estándar
            </div>
            <p class="text-muted small mb-3">
              Define las rutas de contenido estándar por instrumento/nivel que los maestros pueden adoptar.
            </p>
            <div class="rutas-actions">
              <button class="btn btn-primary" id="btn-crear-ruta-soi">
                <i class="bi bi-plus-circle me-1"></i>Nueva Ruta SOI
              </button>
            </div>
          </div>

          <div class="rutas-section">
            <div class="rutas-section-title">
              <i class="bi bi-clipboard-check me-2"></i>
              Revisar Variantes Propuestas
            </div>
            <p class="text-muted small mb-3">
              Los maestros pueden proponer variantes de las rutas estándar para sus grupos especiales.
              Revisá y aprobá o rechazá según sea necesario.
            </p>
            <div id="variantes-dashboard-container" class="mt-3"></div>
          </div>
        </div>
      `
    } else {
      // Maestro mode: proponer variante
      html += `
        <div class="rutas-panel">
          <div class="rutas-section">
            <div class="rutas-section-title">
              <i class="bi bi-arrow-repeat me-2"></i>
              Proponer Variante de Ruta
            </div>
            <p class="text-muted small mb-3">
              ¿Tu grupo necesita una ruta diferente? Podés proponer una variante de una ruta estándar
              para que los administradores la revisen y aprueben.
            </p>
            <div class="rutas-actions">
              <button class="btn btn-info" id="btn-proponer-variante">
                <i class="bi bi-arrow-repeat me-1"></i>Proponer Variante
              </button>
            </div>
          </div>

          <div class="rutas-section">
            <div class="rutas-section-title">
              <i class="bi bi-diagram-3 me-2"></i>
              Rutas Disponibles
            </div>
            <div id="rutas-list-container" class="mt-3"></div>
          </div>
        </div>
      `
    }

    container.innerHTML = html

    // Attach events
    if (isAdmin) {
      container.querySelector('#btn-crear-ruta-soi')?.addEventListener('click', () => {
        openRutaCrearModal((ruta) => {
          AppToast.success(`Ruta "${ruta.nombre}" creada exitosamente`)
          // Reload the dashboard
          renderRutasManagementPanel(container, viewMode)
        })
      })

      // Render variantes dashboard
      const dashboardContainer = container.querySelector('#variantes-dashboard-container')
      if (dashboardContainer) {
        renderRutaVariantesDashboard(dashboardContainer)
      }
    } else {
      // Maestro mode
      container.querySelector('#btn-proponer-variante')?.addEventListener('click', async () => {
        // Get rutas to allow maestro to select one
        try {
          const rutas = await listarRutas({ tipo: 'soi-estandar', estado: 'activa' })

          if (rutas.length === 0) {
            AppToast.warning('No hay rutas estándar disponibles para proponer variantes')
            return
          }

          // Show a simple selection (could be a modal too)
          const rutaSelect = await _selectRutaForVariant(rutas)
          if (!rutaSelect) return

          openRutaVarianteModal(rutaSelect.id, (variante) => {
            AppToast.success('Variante propuesta para aprobación')
            renderRutasManagementPanel(container, viewMode)
          })
        } catch (err) {
          AppToast.error(`Error: ${err.message}`)
        }
      })

      // Render available rutas
      const rutasListContainer = container.querySelector('#rutas-list-container')
      if (rutasListContainer) {
        try {
          const rutas = await listarRutas({ estado: 'activa' })
          if (rutas.length === 0) {
            rutasListContainer.innerHTML = `
              <div class="rutas-empty">
                <i class="bi bi-inbox"></i>
                <p>No hay rutas disponibles</p>
              </div>
            `
          } else {
            rutasListContainer.innerHTML = `
              <div class="list-group">
                ${rutas.map(r => `
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1">${r.nombre}</h6>
                        <small class="text-muted">
                          ${r.instrumento} • ${r.nivel} • ${r.duracion_semanas} semanas
                          ${r.tipo === 'maestro-variante' ? ' • Variante aprobada' : ' • Estándar'}
                        </small>
                      </div>
                      <span class="badge ${r.tipo === 'soi-estandar' ? 'bg-primary' : 'bg-success'}">
                        ${r.tipo === 'soi-estandar' ? 'SOI' : 'Variante'}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `
          }
        } catch (err) {
          rutasListContainer.innerHTML = `
            <div class="alert alert-warning small">Error cargando rutas: ${err.message}</div>
          `
        }
      }
    }
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Error cargando panel de rutas: ${err.message}
      </div>
    `
  }
}

// Helper: Simple selection modal for maestro to pick a route
async function _selectRutaForVariant(rutas) {
  return new Promise((resolve) => {
    const el = document.createElement('div')
    el.innerHTML = `
      <div class="modal fade" id="select-ruta-modal" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Selecciona una Ruta para Proponer Variante</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="list-group" id="ruta-options">
                ${rutas.map(r => `
                  <button type="button" class="list-group-item list-group-item-action" data-ruta-id="${r.id}">
                    <h6 class="mb-1">${r.nombre}</h6>
                    <small>${r.instrumento} • ${r.nivel}</small>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(el)

    const modal = new bootstrap.Modal(el.querySelector('#select-ruta-modal'))
    let selected = null

    el.querySelectorAll('#ruta-options button').forEach(btn => {
      btn.addEventListener('click', () => {
        selected = rutas.find(r => r.id === btn.dataset.rutaId)
        modal.hide()
      })
    })

    el.addEventListener('hidden.bs.modal', () => {
      el.remove()
      resolve(selected)
    })

    modal.show()
  })
}
