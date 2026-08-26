/**
 * portalHubModal.js — Conmutador y Hub Global de Portales Departamentales (SOI).
 * Permite a la Dirección / SuperAdmin monitorear y saltar entre todos los portales del sistema.
 */

import { escapeHTML } from '../../shared/utils/sanitize.js'

export const PORTALES_CATALOG = [
  {
    id: 'ADM',
    nombre: 'Administración',
    path: '/adm.html',
    icon: 'bi-building-gear',
    color: '#4f46e5',
    bgLight: 'rgba(79, 70, 229, 0.1)',
    descripcion: 'Alumnos, maestros, postulados, asistencias, tareas de bandeja y reportes.',
    responsable: 'Romina / Personal ADM',
  },
  {
    id: 'FIN',
    nombre: 'Finanzas & Caja',
    path: '/fin.html',
    icon: 'bi-bank2',
    color: '#059669',
    bgLight: 'rgba(5, 150, 105, 0.1)',
    descripcion: 'Cobros, recibos de pago, balances de alumnos, estado de cuenta y reportes de mora.',
    responsable: 'Caja / Administración Financiera',
  },
  {
    id: 'ACM',
    nombre: 'Academia & Malla',
    path: '/acm.html',
    icon: 'bi-mortarboard-fill',
    color: '#2563eb',
    bgLight: 'rgba(37, 99, 235, 0.1)',
    descripcion: 'Programas, niveles, planificaciones docentes, cobertura curricular y rutas pedagógicas.',
    responsable: 'Dirección Académica / Cátedras',
  },
  {
    id: 'LUT',
    nombre: 'Lutería & Taller',
    path: '/lut.html',
    icon: 'bi-tools',
    color: '#d97706',
    bgLight: 'rgba(217, 119, 6, 0.1)',
    descripcion: 'Diagnóstico de instrumentos, órdenes de reparación y estado del taller de lutería.',
    responsable: 'Luthier / Mantenimiento',
  },
  {
    id: 'INV',
    nombre: 'Inventario & Comodatos',
    path: '/inventario.html',
    icon: 'bi-box-seam-fill',
    color: '#0891b2',
    bgLight: 'rgba(8, 145, 178, 0.1)',
    descripcion: 'Catálogo de instrumentos propios, contratos de comodato y control de stock.',
    responsable: 'Bienes & Comodatos',
  },
  {
    id: 'CAL',
    nombre: 'Calendario & Citas',
    path: '/calendario.html',
    icon: 'bi-calendar3',
    color: '#7c3aed',
    bgLight: 'rgba(124, 58, 237, 0.1)',
    descripcion: 'Calendario de audiciones, citas de postulación, eventos institucionales y salas.',
    responsable: 'Secretaría & Coordinación',
  },
  {
    id: 'COM',
    nombre: 'Comunicaciones',
    path: '/com.html',
    icon: 'bi-broadcast-pin',
    color: '#e11d48',
    bgLight: 'rgba(225, 29, 72, 0.1)',
    descripcion: 'Campañas de difusión, comunicados masivos y mensajería institucional.',
    responsable: 'Comunicaciones & Medios',
  },
  {
    id: 'MAE',
    nombre: 'Portal de Maestros',
    path: '/index.html',
    icon: 'bi-person-video3',
    color: '#0284c7',
    bgLight: 'rgba(2, 132, 199, 0.1)',
    descripcion: 'Toma de asistencias en tiempo real, registro de contenidos de clase y evaluaciones.',
    responsable: 'Cuerpo Docente',
  },
  {
    id: 'SIM',
    nombre: 'Simulador de Reglas',
    path: '/simulador.html',
    icon: 'bi-cpu-fill',
    color: '#475569',
    bgLight: 'rgba(71, 85, 105, 0.1)',
    descripcion: 'Simulador de inasistencias, alertas, transiciones de estado y pruebas de estrés.',
    responsable: 'Dirección Técnica',
  },
  {
    id: 'ADMIN',
    nombre: 'SuperAdmin Master',
    path: '/admin.html',
    icon: 'bi-shield-lock-fill',
    color: '#4f46e5',
    bgLight: 'rgba(79, 70, 229, 0.1)',
    descripcion: 'Panel raíz integral con acceso total a los 30+ módulos y matriz de gobernanza.',
    responsable: 'Director General / SuperAdmin',
  },
]

/**
 * Abre el modal conmutador de portales institucionales.
 */
export function abrirModalConmutadorPortales() {
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

  modalEl.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <div class="modal-header bg-body-tertiary border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-3 p-2 bg-primary text-white d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
              <i class="bi bi-grid-fill fs-5"></i>
            </div>
            <div>
              <h5 class="modal-title fw-bold m-0 text-body">Hub de Portales Departamentales</h5>
              <div class="text-muted small">Sistema Operativo Institucional (SOI) · Acceso Global de Dirección</div>
            </div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body p-4 bg-body">
          <div class="row g-3">
            ${PORTALES_CATALOG.map((p) => {
              const isCurrent = currentPath.includes(p.path.replace('/', ''))
              return `
              <div class="col-12 col-md-6">
                <a href="${p.path}" class="card border h-100 p-3 text-decoration-none rounded-4 transition-all ${isCurrent ? 'border-primary bg-primary-subtle shadow-sm' : 'border-light-subtle bg-body shadow-none hover-lift'}" style="transition: all 0.2s ease;">
                  <div class="d-flex align-items-start gap-3">
                    <div class="rounded-3 p-3 d-flex align-items-center justify-content-center flex-shrink-0" style="background-color: ${p.bgLight}; color: ${p.color}; width: 48px; height: 48px; font-size: 1.35rem;">
                      <i class="bi ${p.icon}"></i>
                    </div>
                    <div class="flex-grow-1 min-w-0">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <strong class="text-body fw-bold">${escapeHTML(p.nombre)}</strong>
                        <span class="badge ${isCurrent ? 'bg-primary text-white' : 'bg-secondary-subtle text-secondary'}" style="font-size: 0.65rem;">
                          ${isCurrent ? 'ACTIVO' : p.id}
                        </span>
                      </div>
                      <p class="text-muted small m-0 mb-2 line-clamp-2" style="font-size: 0.8rem; line-height: 1.3;">
                        ${escapeHTML(p.descripcion)}
                      </p>
                      <div class="d-flex align-items-center gap-1 text-muted" style="font-size: 0.72rem;">
                        <i class="bi bi-person-badge"></i>
                        <span>${escapeHTML(p.responsable)}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            `
            }).join('')}
          </div>
        </div>

        <div class="modal-footer bg-body-tertiary border-top py-2 px-4 d-flex justify-content-between">
          <span class="text-muted small"><i class="bi bi-shield-check text-success me-1"></i>Acceso irrestricto habilitado para rol Administrador</span>
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
}
