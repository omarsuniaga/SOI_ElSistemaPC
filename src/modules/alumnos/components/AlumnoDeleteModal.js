import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { inactivarAlumno, verificarEliminacionAlumno } from '../api/alumnosApi.js'
import { escapeHTML } from '../utils/alumnosUtils.js'

export class AlumnoDeleteModal {
  /**
   * Opens the inactivation (soft delete) confirmation modal.
   * Preserves historical records, comodatos, and attendance logs.
   *
   * @param {Object} props
   * @param {string} props.alumnoId - The ID of the student to inactivate
   * @param {string} props.alumnoNombre - The name of the student
   * @param {Function} props.onDeleted - Success callback function
   */
  static async open(props = {}) {
    const { alumnoId, alumnoNombre, onDeleted } = props
    if (!alumnoId) return

    AppModal.showLoading('Verificando estado del alumno...')

    try {
      let activeClasses = []
      try {
        const check = await verificarEliminacionAlumno(alumnoId)
        activeClasses = check?.activeClasses || []
      } catch (e) {
        console.warn('No se pudieron consultar inscripciones previas:', e)
      }

      AppModal.open({
        title: 'Inactivar Alumno',
        saveText: 'Mover a Inactivos',
        saveClass: 'btn-warning',
        cancelText: 'Cancelar',
        body: `
          <div class="p-2">
            <div class="d-flex align-items-center gap-3 mb-3">
              <div class="avatar-compact bg-warning bg-opacity-10 text-warning border border-warning-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.4rem;">
                <i class="bi bi-person-x"></i>
              </div>
              <div>
                <h6 class="mb-0 fw-bold">${escapeHTML(alumnoNombre)}</h6>
                <small class="text-muted">ID: ${escapeHTML(alumnoId)}</small>
              </div>
            </div>

            <p class="mb-2">¿Deseas mover a este alumno a la lista de <strong>Alumnos Inactivos</strong>?</p>

            <div class="alert alert-info d-flex align-items-start gap-2 mb-3 py-2 px-3">
              <i class="bi bi-info-circle-fill fs-6 mt-1 flex-shrink-0"></i>
              <div class="small">
                <strong>Archivo seguro:</strong> Su historial de asistencias, notas, datos médicos y comodatos de instrumentos permanecerán resguardados en el archivo institucional y podrás <strong>reactivarlo en cualquier momento</strong>.
              </div>
            </div>

            ${activeClasses.length > 0 ? `
              <div class="border rounded p-2 bg-light bg-opacity-50 mb-2">
                <span class="small fw-semibold text-muted d-block mb-1"><i class="bi bi-journal-bookmark me-1"></i>Clases asignadas actualmente:</span>
                <div class="d-flex flex-wrap gap-1">
                  ${activeClasses.map(c => `<span class="badge bg-secondary-subtle text-secondary-emphasis border">${escapeHTML(c)}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `,
        onSave: async () => {
          try {
            await inactivarAlumno(alumnoId)
            AppToast.success('Alumno movido a la lista de inactivos')
            if (typeof onDeleted === 'function') onDeleted()
            return true // Closes modal
          } catch (err) {
            console.error('Error inactivating student:', err)
            AppToast.error(err.message || 'Error al inactivar el alumno')
            return false // Keeps modal open
          }
        }
      })
    } catch (err) {
      console.error('Error opening inactivate student modal:', err)
      AppToast.error('No se pudo preparar la inactivación del alumno')
      AppModal.close()
    }
  }
}
