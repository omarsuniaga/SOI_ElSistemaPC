import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { backfillDesdePostulantes } from '../api/postulantesApi.js'
import { escapeHTML } from '../utils/alumnosUtils.js'

export class PostuladosBackfillModal {
  /**
   * Abre el modal de conciliación masiva de datos desde postulados.
   * Ejecuta primero un análisis de prueba (dryRun) y muestra los resultados antes de aplicar.
   *
   * @param {Object} options
   * @param {Function} [options.onSuccess] Callback tras aplicar la conciliación exitosamente.
   */
  static async open({ onSuccess } = {}) {
    AppModal.open({
      title: '🔄 Conciliación Masiva de Datos',
      size: 'lg',
      hideSave: true,
      cancelText: 'Cerrar',
      body: `
        <div class="text-center py-5" id="backfill-modal-loading">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <h5 class="fw-bold mb-1">Analizando coincidencias...</h5>
          <p class="text-muted small mb-0">Buscando datos faltantes en Alumnos que existan en la tabla de Postulados.</p>
        </div>
      `,
    })

    try {
      // 1. Run Dry Run to preview matches
      const res = await backfillDesdePostulantes(true)
      const matches = res?.data || []

      const modalBody = document.querySelector('.modal-body')
      if (!modalBody) return

      if (matches.length === 0) {
        modalBody.innerHTML = `
          <div class="text-center py-4">
            <div class="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 56px; height: 56px;">
              <i class="bi bi-check-circle fs-2"></i>
            </div>
            <h5 class="fw-bold">No se requieren actualizaciones</h5>
            <p class="text-muted small mx-auto mb-0" style="max-width: 420px;">
              No se encontraron alumnos con perfiles incompletos que tengan coincidencias en la tabla de Postulados, o todos sus datos ya están al día.
            </p>
          </div>
        `
        return
      }

      // Calculate total fields to fill
      const totalCampos = matches.reduce((acc, m) => acc + (Number(m.campos_llenados) || 1), 0)

      const rowsHTML = matches.map(m => {
        const matchLabel = m.match_tipo === 'email' ? 'Correo' : 'Nombre'
        const matchBadgeClass = m.match_tipo === 'email' ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-info-subtle text-info border-info-subtle'
        const count = m.campos_llenados || 1

        return `
          <tr>
            <td class="align-middle">
              <div class="fw-bold text-truncate small">${escapeHTML(m.alumno_nombre || 'Alumno')}</div>
              <span class="badge ${matchBadgeClass} border extra-small mt-0.5">Match por ${matchLabel}</span>
            </td>
            <td class="align-middle small text-muted">
              ${escapeHTML(m.postulante_nombre || 'Postulante')}
            </td>
            <td class="align-middle text-center">
              <span class="badge text-bg-warning rounded-pill small">${count} campo(s)</span>
            </td>
          </tr>
        `
      }).join('')

      modalBody.innerHTML = `
        <div class="alert alert-warning border-warning-subtle d-flex align-items-start gap-3 mb-4">
          <i class="bi bi-info-circle-fill text-warning fs-4 flex-shrink-0 mt-0.5"></i>
          <div>
            <strong class="d-block mb-0.5" style="font-size: 0.95rem;">Previsualización de Conciliación</strong>
            <span class="small text-muted">
              Se han detectado <strong>${matches.length} alumno(s)</strong> con datos incompletos que coinciden en Postulados. 
              Se autocompletarán aproximadamente <strong>${totalCampos} campos vacíos</strong> sin sobreescribir información existente.
            </span>
          </div>
        </div>

        <div class="table-responsive border rounded mb-4" style="max-height: 320px;">
          <table class="table table-hover table-sm align-middle mb-0">
            <thead class="table-light sticky-top" style="z-index: 1;">
              <tr>
                <th class="small py-2 px-3">Alumno</th>
                <th class="small py-2">Postulante Coincidente</th>
                <th class="small py-2 text-center">Campos a Llenar</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-end align-items-center gap-2 pt-2 border-top">
          <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-cancel-backfill">Cancelar</button>
          <button type="button" class="btn btn-success btn-sm d-flex align-items-center gap-1.5" id="btn-confirm-backfill">
            <i class="bi bi-cloud-arrow-down-fill"></i>
            <span>Confirmar y Aplicar Cambios</span>
          </button>
        </div>
      `

      document.querySelector('#btn-cancel-backfill')?.addEventListener('click', () => {
        AppModal.close()
      })

      document.querySelector('#btn-confirm-backfill')?.addEventListener('click', async () => {
        const btn = document.querySelector('#btn-confirm-backfill')
        if (btn) {
          btn.disabled = true
          btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span>Aplicando cambios...`
        }

        try {
          // 2. Execute Real Backfill (dryRun = false)
          const result = await backfillDesdePostulantes(false)
          AppModal.close()
          AppToast.show(`Se actualizaron correctamente ${matches.length} alumno(s) desde postulados.`, 'success')
          if (typeof onSuccess === 'function') onSuccess(result)
        } catch (err) {
          console.error('[PostuladosBackfillModal] Error executing backfill:', err)
          if (btn) {
            btn.disabled = false
            btn.innerHTML = `<i class="bi bi-cloud-arrow-down-fill me-1"></i>Confirmar y Aplicar Cambios`
          }
          AppToast.show(`Error al aplicar la conciliación: ${err.message}`, 'danger')
        }
      })

    } catch (err) {
      console.error('[PostuladosBackfillModal] Error running preview:', err)
      const modalBody = document.querySelector('.modal-body')
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="alert alert-danger d-flex align-items-center gap-2 mb-0">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>Error al analizar coincidencias: ${escapeHTML(err.message)}</span>
          </div>
        `
      }
    }
  }
}
