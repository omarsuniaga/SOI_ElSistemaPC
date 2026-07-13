import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { verificarEliminacionAlumno, eliminarAlumno } from '../api/alumnosApi.js'
import { escapeHTML } from '../utils/alumnosUtils.js'

export class AlumnoDeleteModal {
  /**
   * Opens the safe deletion confirmation modal.
   * Checks for active classes and blocks deletion if found.
   *
   * @param {Object} props
   * @param {string} props.alumnoId - The ID of the student to delete
   * @param {string} props.alumnoNombre - The name of the student
   * @param {Function} props.onDeleted - Success callback function
   */
  static async open(props = {}) {
    const { alumnoId, alumnoNombre, onDeleted } = props
    if (!alumnoId) return

    AppModal.showLoading('Verificando inscripciones activas...')

    AppModal.open({
      title: 'Eliminar Alumno',
      hideSave: true,
      cancelText: 'Cerrar',
      body: '<div class="p-3 text-center"><div class="spinner-border text-primary" role="status"></div></div>'
    })

    try {
      const { canDelete, activeClasses } = await verificarEliminacionAlumno(alumnoId)

      if (!canDelete) {
        AppModal.open({
          title: 'No se puede eliminar el alumno',
          hideSave: true,
          cancelText: 'Entendido',
          body: `
            <div class="p-2">
              <div class="alert alert-danger d-flex align-items-start gap-2 mb-3">
                <i class="bi bi-exclamation-triangle-fill fs-5 mt-1"></i>
                <div>
                  <strong>Acción bloqueada:</strong> El alumno <strong>${escapeHTML(alumnoNombre)}</strong> tiene inscripciones activas en las siguientes clases:
                </div>
              </div>
              <ul class="list-group list-group-flush mb-2">
                ${activeClasses.map(c => `<li class="list-group-item py-1 small text-danger"><i class="bi bi-x-circle me-1"></i>${escapeHTML(c)}</li>`).join('')}
              </ul>
              <p class="text-muted small">Debés desvincular al alumno de estas clases antes de poder eliminar su registro de la base de datos.</p>
            </div>
          `
        })
        return
      }

      // Safe to delete, show confirmation modal
      AppModal.open({
        title: 'Confirmar eliminación',
        saveText: 'Eliminar definitivamente',
        cancelText: 'Cancelar',
        body: `
          <div class="p-2">
            <p>¿Estás seguro de que querés eliminar a <strong>${escapeHTML(alumnoNombre)}</strong>?</p>
            <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle me-1"></i>Esta acción es irreversible y removerá todo su historial personal de la base de datos.</p>
          </div>
        `,
        onSave: async () => {
          try {
            await eliminarAlumno(alumnoId)
            AppToast.success('Alumno eliminado correctamente')
            if (typeof onDeleted === 'function') onDeleted()
            return true // Closes modal
          } catch (err) {
            console.error('Error deleting student:', err)
            AppToast.error(err.message || 'Error al eliminar el alumno')
            return false // Keeps modal open
          }
        }
      })
    } catch (err) {
      console.error('Error verifying deletion safety:', err)
      AppToast.error('No se pudo verificar la seguridad de la eliminación')
      AppModal.close()
    }
  }
}
