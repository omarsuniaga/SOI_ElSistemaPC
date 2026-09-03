/**
 * portalHubModal.js — Conmutador y Hub Global de Portales Departamentales (SOI).
 * Permite a cualquier usuario ver y saltar únicamente entre los portales que tiene autorizados.
 */

import { escapeHTML } from '../../shared/utils/sanitize.js'
import { getAuthorizedPortales } from '../../core/auth/portalAccessService.js'
import { useAuth } from '../../modules/auth/hooks/useAuth.js'

export const PORTALES_META = {
  ADM: { color: '#4f46e5', bgLight: 'rgba(79, 70, 229, 0.1)', responsable: 'Romina / Personal ADM' },
  FIN: { color: '#059669', bgLight: 'rgba(5, 150, 105, 0.1)', responsable: 'Caja / Administración Financiera' },
  ACM: { color: '#2563eb', bgLight: 'rgba(37, 99, 235, 0.1)', responsable: 'Dirección Académica / Cátedras' },
  LUT: { color: '#d97706', bgLight: 'rgba(217, 119, 6, 0.1)', responsable: 'Luthier / Mantenimiento' },
  TEC: { color: '#0891b2', bgLight: 'rgba(8, 145, 178, 0.1)', responsable: 'Soporte Técnico / Infraestructura' },
  CAL: { color: '#7c3aed', bgLight: 'rgba(124, 58, 237, 0.1)', responsable: 'Secretaría & Coordinación' },
  COM: { color: '#e11d48', bgLight: 'rgba(225, 29, 72, 0.1)', responsable: 'Comunicaciones & Medios' },
  MAE: { color: '#0284c7', bgLight: 'rgba(2, 132, 199, 0.1)', responsable: 'Cuerpo Docente' },
  SIM: { color: '#475569', bgLight: 'rgba(71, 85, 105, 0.1)', responsable: 'Dirección Técnica' },
  SUPERADMIN: { color: '#4f46e5', bgLight: 'rgba(79, 70, 229, 0.1)', responsable: 'Director General / SuperAdmin' },
  AUD: { color: '#d946ef', bgLight: 'rgba(217, 70, 239, 0.1)', responsable: 'Comisión de Audición' }
}

/**
 * Abre el modal conmutador de portales institucionales filtrado por permisos.
 */
export async function abrirModalConmutadorPortales() {
  let modalEl = document.getElementById('modalPortalHub')
  if (!modalEl) {
    modalEl = document.createElement('div')
    modalEl.id = 'modalPortalHub'
    modalEl.className = 'modal fade'
    modalEl.tabIndex = -1
    modalEl.setAttribute('aria-hidden', 'true')
    document.body.appendChild(modalEl)
  }

  const currentPath = window.location.pathname
  const user = useAuth.getUser() || useAuth.getState?.().user

  modalEl.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <div class="modal-header bg-body-tertiary border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-3 p-2 bg-primary text-white d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
              <i class="bi bi-grid-fill fs-5"></i>
            </div>
            <div>
              <h5 class="modal-title fw-bold m-0 text-body">Hub de Portales</h5>
              <div class="text-muted small">Sistema Operativo Institucional (SOI) · Portales Autorizados</div>
            </div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body p-4 bg-body">
          <div class="d-flex justify-content-center p-4" id="modalHubLoading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando portales...</span>
            </div>
          </div>
          <div class="row g-3 d-none" id="modalHubGrid"></div>
        </div>

        <div class="modal-footer bg-body-tertiary border-top py-2 px-4 d-flex justify-content-between">
          <span class="text-muted small" id="modalHubFooterText">
            <i class="bi bi-shield-check text-success me-1"></i>Acceso configurado según permisos de usuario
          </span>
          <button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  `

  if (window.bootstrap?.Modal) {
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl)
    modal.show()
  } else {
    import('bootstrap').then(({ Modal }) => {
      const modal = Modal.getOrCreateInstance(modalEl)
      modal.show()
    })
  }

  // Cargar portales autorizados
  try {
    const portales = await getAuthorizedPortales(user?.id)
    const grid = modalEl.querySelector('#modalHubGrid')
    const loading = modalEl.querySelector('#modalHubLoading')
    
    if (loading) loading.classList.add('d-none')
    if (grid) {
      grid.classList.remove('d-none')
      if (!portales || portales.length === 0) {
        grid.innerHTML = `
          <div class="col-12 text-center p-4 text-muted">
            <i class="bi bi-door-closed fs-1 d-block mb-2 text-secondary"></i>
            No tienes portales asignados. Contacta al SuperAdmin.
          </div>
        `
      } else {
        grid.innerHTML = portales.map(p => {
          const meta = PORTALES_META[p.portal_id] || {
            color: '#4f46e5',
            bgLight: 'rgba(79, 70, 229, 0.1)',
            responsable: 'Responsable de área'
          }
          const cleanPath = (p.ruta || '').replace(/^\//, '')
          const isCurrent = currentPath.includes(cleanPath)
          return `
            <div class="col-12 col-md-6">
              <a href="${escapeHTML(p.ruta || '#')}" data-bs-dismiss="modal" class="card border h-100 p-3 text-decoration-none rounded-4 transition-all portal-option-link ${isCurrent ? 'border-primary bg-primary-subtle shadow-sm' : 'border-light-subtle bg-body shadow-none hover-lift'}" style="transition: all 0.2s ease;">
                <div class="d-flex align-items-start gap-3">
                  <div class="rounded-3 p-3 d-flex align-items-center justify-content-center flex-shrink-0" style="background-color: ${meta.bgLight}; color: ${meta.color}; width: 48px; height: 48px; font-size: 1.35rem;">
                    <i class="bi ${p.icono || 'bi-door-open'}"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <strong class="text-body fw-bold">${escapeHTML(p.nombre)}</strong>
                      <span class="badge ${isCurrent ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'}" style="font-size: 0.65rem;">
                        ${isCurrent ? 'ACTIVO' : p.portal_id}
                      </span>
                    </div>
                    <p class="text-muted small m-0 mb-2 line-clamp-2" style="font-size: 0.8rem; line-height: 1.3;">
                      ${escapeHTML(p.descripcion || '')}
                    </p>
                    <div class="d-flex align-items-center gap-1 text-muted" style="font-size: 0.72rem;">
                      <i class="bi bi-person-badge"></i>
                      <span>${escapeHTML(meta.responsable)}</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          `
        }).join('')

        // Cerrar modal al hacer clic en cualquier opción
        grid.querySelectorAll('.portal-option-link').forEach((link) => {
          link.addEventListener('click', () => {
            const modal = window.bootstrap?.Modal?.getInstance(modalEl)
            if (modal) modal.hide()
          })
        })
      }
    }
  } catch (err) {
    console.error('Error cargando portales en modal:', err)
  }
}
