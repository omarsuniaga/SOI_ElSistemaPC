import { AppToast } from '../../shared/components/AppToast.js'
import { openClaseModal } from '../../modules/clases/components/claseModal.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { obtenerDatosCreadorClases } from '../api/crearClasePortalApi.js'
import { getPermisos } from '../services/permisoService.js'

function escHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function renderCrearClaseView(container) {
  container.innerHTML = `
    <div class="gcv-root">
      <div class="gcv-loading"><div class="gcv-spinner"></div></div>
    </div>
  `

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = renderEmptyState(
      'bi-lock',
      'Sin sesión activa',
      'Inicia sesión nuevamente para crear una clase.',
    )
    return
  }

  try {
    const permisos = await getPermisos(maestro.id)

    if (!permisos?.puede_crear_clases) {
      container.innerHTML = renderEmptyState(
        'bi-shield-lock',
        'Acceso no habilitado',
        'ADM debe activar el permiso “Crear clases” antes de usar esta herramienta.',
      )
      return
    }

    const soporte = await obtenerDatosCreadorClases()

    container.innerHTML = `
      <div class="gcv-root">
        <div class="gcv-header">
          <div class="gcv-header-left">
            <i class="bi bi-journal-plus gcv-header-icon"></i>
            <div>
              <h2 class="gcv-title">Crear nueva clase</h2>
              <p class="gcv-subtitle">Autogestión guiada usando el flujo real del módulo de clases</p>
            </div>
          </div>
        </div>

        <div class="gcv-panel" style="max-width: 880px;">
          <div class="gcv-panel-inner">
            <div class="d-flex flex-wrap gap-2">
              <span class="badge bg-primary-subtle text-primary-emphasis">
                ${Number(permisos.total_clases_asignadas || 0)} clases asignadas
              </span>
              <span class="badge bg-success-subtle text-success-emphasis">
                Maestro titular bloqueado en tu perfil
              </span>
              <span class="badge bg-secondary-subtle text-secondary-emphasis">
                ${soporte.salones.length} salones disponibles
              </span>
            </div>

            <div class="gcv-section">
              <div class="gcv-section-header">
                <span class="gcv-section-label"><i class="bi bi-check2-circle gcv-icon-primary"></i> Qué puedes hacer aquí</span>
              </div>
              <div class="gcv-student-list">
                ${[
                  'Crear la clase con el mismo motor de validación usado por ADM.',
                  'Definir múltiples horarios y asignar salones reales por `salon_id`.',
                  'Inscribir alumnos durante la creación, incluyendo turnos rotativos.',
                  'Mantenerte como maestro titular fijo para evitar inconsistencias operativas.',
                ].map((item) => `
                  <div class="gcv-student-row">
                    <div class="gcv-student-avatar gcv-avatar-primary"><i class="bi bi-check-lg"></i></div>
                    <div class="gcv-student-data"><span class="gcv-student-name">${escHTML(item)}</span></div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="gcv-section">
              <div class="gcv-section-header">
                <span class="gcv-section-label"><i class="bi bi-diagram-3 gcv-icon-success"></i> Reglas del flujo</span>
              </div>
              <div class="small text-muted" style="line-height:1.65;">
                Esta pantalla reutiliza el <strong>modal real de clases</strong>. Eso significa que los conflictos de horario,
                maestro y salón se validan con la misma lógica que ya existe en ADM. NO estamos creando una segunda versión débil.
              </div>
            </div>

            <div class="gcv-add-actions" style="justify-content:flex-start;">
              <button type="button" class="gcv-btn gcv-btn-primary" id="btn-abrir-creador-clase">
                <i class="bi bi-plus-circle"></i> Abrir creador avanzado
              </button>
              <button type="button" class="gcv-btn gcv-btn-ghost" id="btn-volver-gestionar-clases">
                <i class="bi bi-arrow-left"></i> Volver a mis clases
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    container.querySelector('#btn-abrir-creador-clase')?.addEventListener('click', () => {
      openClaseModal(null, {
        maestros: soporte.maestros,
        salones: soporte.salones,
        programas: soporte.programas,
        alumnos: soporte.alumnos,
        lockedPrincipalTeacherId: maestro.id,
        lockedPrincipalTeacherLabel: maestro.nombre_completo || maestro.nombre || 'Mi perfil',
        allowPrincipalTeacherSelection: false,
        onSuccess: () => {
          AppToast.success('Clase creada desde el portal de maestros.')
          if (window.router?.navigate) {
            window.router.navigate('gestionar-clases')
            return
          }
          renderCrearClaseView(container)
        },
      })
    })

    container.querySelector('#btn-volver-gestionar-clases')?.addEventListener('click', () => {
      if (window.router?.navigate) {
        window.router.navigate('gestionar-clases')
      }
    })
  } catch (error) {
    console.error('[crearClaseView]', error)
    container.innerHTML = renderEmptyState(
      'bi-exclamation-triangle',
      'No se pudo cargar el creador',
      error.message || 'Ocurrió un error inesperado.',
    )
  }
}

function renderEmptyState(icon, title, message) {
  return `
    <div class="gcv-empty-state">
      <i class="bi ${icon} gcv-empty-icon"></i>
      <p class="gcv-empty-title">${escHTML(title)}</p>
      <p class="gcv-empty-msg">${escHTML(message)}</p>
    </div>
  `
}
