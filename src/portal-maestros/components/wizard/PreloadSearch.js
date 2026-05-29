/**
 * PreloadSearch — optional panel shown before step 1 of the wizard.
 *
 * Lets the maestro search a postulante by name or phone and pre-fill
 * the wizard draft from the Google Form responses sheet.
 */

import { buscarPostulante } from '../../../modules/alumnos/api/googleFormApi.js'

/**
 * Mount the preload search panel into the container.
 * Resolves with the pre-filled draft object when the user picks a result,
 * or resolves with null when the user skips.
 *
 * @param {HTMLElement} container
 * @returns {Promise<object|null>}
 */
export function mountPreloadSearch(container) {
  return new Promise((resolve) => {
    container.innerHTML = `
      <div class="preload-search card shadow-sm mb-4">
        <div class="card-header d-flex align-items-center gap-2">
          <i class="bi bi-cloud-download text-primary fs-5"></i>
          <div>
            <h5 class="mb-0">Buscar postulante</h5>
            <small class="text-muted">Busca por nombre o teléfono para precargar los datos del formulario de postulación</small>
          </div>
        </div>
        <div class="card-body">
          <div class="input-group mb-3">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input
              id="preload-query"
              type="text"
              class="form-control"
              placeholder="Nombre del alumno o número de teléfono..."
              autocomplete="off"
            />
            <button id="preload-btn-search" class="btn btn-primary" type="button">
              Buscar
            </button>
          </div>

          <div id="preload-results"></div>
        </div>
        <div class="card-footer d-flex justify-content-end">
          <button id="preload-btn-skip" class="btn btn-link text-muted btn-sm">
            <i class="bi bi-skip-forward me-1"></i>Continuar sin buscar
          </button>
        </div>
      </div>`

    const input = container.querySelector('#preload-query')
    const searchBtn = container.querySelector('#preload-btn-search')
    const skipBtn = container.querySelector('#preload-btn-skip')
    const resultsDiv = container.querySelector('#preload-results')

    async function doSearch() {
      const q = input.value.trim()
      if (q.length < 2) {
        resultsDiv.innerHTML = `<div class="text-muted small">Ingresa al menos 2 caracteres.</div>`
        return
      }

      resultsDiv.innerHTML = `
        <div class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span class="ms-2 text-muted small">Buscando...</span>
        </div>`

      try {
        const results = await buscarPostulante(q)

        if (!results.length) {
          resultsDiv.innerHTML = `
            <div class="alert alert-warning py-2 mb-0">
              <i class="bi bi-exclamation-circle me-1"></i>
              No se encontró ningún postulante con ese nombre o teléfono.
            </div>`
          return
        }

        const items = results.map((r, i) => `
          <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-start py-2"
               data-idx="${i}" role="button" style="cursor:pointer">
            <div>
              <div class="fw-semibold">${r.draft.nombre_completo || '(sin nombre)'}</div>
              <small class="text-muted">
                ${r.draft.fecha_nacimiento || ''}
                ${r.draft.madre_tlf_whatsapp ? ' · ' + r.draft.madre_tlf_whatsapp : ''}
                ${r.draft._telefono_alumno ? ' · ' + r.draft._telefono_alumno : ''}
              </small>
            </div>
            <button class="btn btn-sm btn-outline-primary ms-2 flex-shrink-0" data-pick="${i}">
              <i class="bi bi-check2-circle me-1"></i>Usar datos
            </button>
          </div>`).join('')

        resultsDiv.innerHTML = `
          <div class="list-group">${items}</div>
          <p class="text-muted small mt-2 mb-0">
            <i class="bi bi-info-circle me-1"></i>
            Se precargarán los campos disponibles. Podés editarlos antes de guardar.
          </p>`

        resultsDiv.querySelectorAll('[data-pick]').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            const idx = parseInt(btn.getAttribute('data-pick'), 10)
            resolve(results[idx].draft)
          })
        })

        resultsDiv.querySelectorAll('[data-idx]').forEach((row) => {
          row.addEventListener('click', () => {
            const idx = parseInt(row.getAttribute('data-idx'), 10)
            resolve(results[idx].draft)
          })
        })
      } catch (err) {
        console.error('Error buscando postulante:', err)
        resultsDiv.innerHTML = `
          <div class="alert alert-danger py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i>
            Error al conectar con el formulario de postulación. Continuá sin búsqueda.
          </div>`
      }
    }

    searchBtn.addEventListener('click', doSearch)
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch() })
    skipBtn.addEventListener('click', () => resolve(null))
  })
}
