import { buscarPostulante } from '../api/postulantesSupabase.js'
import { actualizarAlumno } from '../api/alumnosApi.js'
import { escapeHTML } from '../utils/alumnosUtils.js'
import { AppToast } from '../../../shared/components/AppToast.js'

export class PostulanteResolver {
  /**
   * Performs candidate lookup by name, compares details, renders a diff table,
   * and provides a button to autofill empty database fields using alumnosApi.
   *
   * @param {Object} alumno - The current student data object
   * @param {HTMLElement} panel - Container element to render the lookup interface in
   * @param {Function} onResolved - Success callback called after fields are pre-filled
   */
  static async resolve(alumno, panel, onResolved) {
    if (!panel) return

    panel.innerHTML = `
      <div class="card border-warning shadow-sm mb-4">
        <div class="card-body text-center py-3">
          <div class="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
          <span class="small text-muted">Buscando en postulantes...</span>
        </div>
      </div>`

    try {
      const resultados = await buscarPostulante(alumno.nombre_completo)

      if (!resultados || resultados.length === 0) {
        panel.innerHTML = `
          <div class="alert alert-info d-flex align-items-center gap-2 mb-4">
            <i class="bi bi-info-circle"></i>
            <span class="small">No se encontraron postulantes con el nombre <strong>${escapeHTML(alumno.nombre_completo)}</strong>.</span>
            <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
          </div>`
        panel.querySelector('#btn-close-panel')?.addEventListener('click', () => {
          panel.innerHTML = ''
        })
        return
      }

      const postulante = resultados[0]

      // Detect empty fields in student profile that can be filled from candidate profile
      const CAMPOS_PRECARGABLES = [
        'madre_nombre', 'madre_cedula', 'madre_tlf_whatsapp',
        'padre_nombre', 'padre_cedula', 'padre_tlf_whatsapp',
        'representante_nombre', 'representante_parentesco', 'representante_tlf', 'representante_cedula',
        'correo_representante', 'municipio_residencia', 'sector_calle_numero', 'direccion',
        'nacionalidad', 'centro_estudios', 'grado_nivel', 'instrumento_interes',
        'como_se_entero', 'ubicacion_maps_url',
      ]

      const camposDisponibles = CAMPOS_PRECARGABLES.filter(k => {
        const enAlumno = alumno[k]
        const enPostulante = postulante[k]
        return (!enAlumno || enAlumno === '') && enPostulante && enPostulante !== ''
      })

      const filas = CAMPOS_PRECARGABLES.map(k => {
        const vAlumno = alumno[k]
        const vPost = postulante[k]
        const tieneDato = vPost && vPost !== ''
        const yaLleno = vAlumno && vAlumno !== ''
        if (!tieneDato) return ''
        return `<tr class="${yaLleno ? '' : 'table-warning'}">
          <td class="small fw-semibold">${escapeHTML(k.replace(/_/g, ' '))}</td>
          <td class="small">${escapeHTML(String(vPost))}</td>
          <td class="small text-muted">${yaLleno ? escapeHTML(String(vAlumno)) : '<em>vacío</em>'}</td>
          <td class="text-center">${yaLleno ? '' : '<i class="bi bi-arrow-left-circle text-warning"></i>'}</td>
        </tr>`
      }).filter(Boolean).join('')

      panel.innerHTML = `
        <div class="card border-warning shadow-sm mb-4">
          <div class="card-header d-flex align-items-center gap-2 bg-warning bg-opacity-10">
            <i class="bi bi-person-check text-warning fs-5"></i>
            <div class="flex-grow-1">
              <div class="fw-bold small">Postulante encontrado: ${escapeHTML(postulante.nombre_completo || '')}</div>
              <div class="text-muted" style="font-size:0.72rem">Estado: ${escapeHTML(postulante.estado || '—')} · ID: ${escapeHTML(postulante.id || '')}</div>
            </div>
            <button class="btn btn-sm btn-outline-secondary" id="btn-close-panel"><i class="bi bi-x"></i></button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="small">Campo</th>
                    <th class="small">En postulante</th>
                    <th class="small">En alumno</th>
                    <th class="small text-center">Nuevo</th>
                  </tr>
                </thead>
                <tbody>${filas || '<tr><td colspan="4" class="text-center text-muted small py-3">Todos los datos ya están cargados en el alumno.</td></tr>'}</tbody>
              </table>
            </div>
          </div>
          ${camposDisponibles.length > 0 ? `
          <div class="card-footer d-flex justify-content-between align-items-center">
            <span class="small text-muted"><i class="bi bi-arrow-left-circle text-warning me-1"></i>${camposDisponibles.length} campo(s) nuevo(s) disponibles</span>
            <button class="btn btn-sm btn-warning" id="btn-precargar">
              <i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes
            </button>
          </div>` : ''}
        </div>`

      panel.querySelector('#btn-close-panel')?.addEventListener('click', () => {
        panel.innerHTML = ''
      })

      panel.querySelector('#btn-precargar')?.addEventListener('click', async () => {
        const btn = panel.querySelector('#btn-precargar')
        btn.disabled = true
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Guardando...'

        try {
          const patch = {}
          camposDisponibles.forEach(k => {
            if (postulante[k]) patch[k] = postulante[k]
          })

          // Save patch using api actualizarAlumno (which supports arbitrary database keys)
          await actualizarAlumno(alumno.id, patch)

          // Update local alumno state object fields
          Object.assign(alumno, patch)

          panel.innerHTML = `
            <div class="alert alert-success d-flex align-items-center gap-2 mb-4">
              <i class="bi bi-check-circle-fill"></i>
              <span class="small">${camposDisponibles.length} campo(s) precargados correctamente desde postulante. Recargá las secciones para ver los cambios.</span>
              <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel2"><i class="bi bi-x"></i></button>
            </div>`
          panel.querySelector('#btn-close-panel2')?.addEventListener('click', () => {
            panel.innerHTML = ''
          })

          if (typeof onResolved === 'function') onResolved(patch)
        } catch (err) {
          btn.disabled = false
          btn.innerHTML = '<i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes'
          panel.insertAdjacentHTML('beforeend', `
            <div class="alert alert-danger small mt-2">Error al guardar: ${escapeHTML(err.message)}</div>`)
        }
      })

    } catch (err) {
      panel.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-exclamation-triangle"></i>
          <span class="small">Error al buscar postulante: ${escapeHTML(err.message)}</span>
          <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
        </div>`
      panel.querySelector('#btn-close-panel')?.addEventListener('click', () => {
        panel.innerHTML = ''
      })
    }
  }
}
