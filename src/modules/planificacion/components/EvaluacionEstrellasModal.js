/**
 * EvaluacionEstrellasModal.js — Modal de Evaluación Táctil 1-Tap con Estrellas (0 a 5)
 */
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { IndicadorLogro } from '../domain/IndicadorLogro.js'
import { sugerirTareaRefuerzoIA } from '../services/aiEvaluacionService.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

/**
 * Abre el modal táctil para evaluar a los estudiantes en un indicador.
 * @param {Object} options
 * @param {Object} options.nodo — Nodo/Indicador a evaluar { id, titulo }
 * @param {Array<Object>} options.alumnos — Lista de todos los alumnos de la clase [{ id, nombre, presente: boolean }]
 * @param {Array<Object>} [options.evaluacionesPrevias] — Calificaciones previas
 * @param {Function} [options.onSaved] — Callback al guardar
 */
export function openEvaluacionEstrellasModal({ nodo, alumnos = [], evaluacionesPrevias = [], onSaved = null }) {
  if (!nodo) return

  // Mapeo inicial de calificaciones (alumnos presentes vs ausentes)
  const ratings = {}
  alumnos.forEach((al) => {
    const prev = evaluacionesPrevias.find(
      (e) => String(e.alumno_id || e.alumnoId) === String(al.id) && String(e.indicator_id || e.indicadorId) === String(nodo.id)
    )
    ratings[al.id] = prev ? parseInt(prev.nota || '0', 10) : 0
  })

  const _renderRowsHTML = () => {
    return alumnos
      .map((al) => {
        const isPresent = Boolean(al.presente ?? true)
        const stars = ratings[al.id] || 0
        const starsHTML = '⭐'.repeat(stars)
        const etiqueta = IndicadorLogro.getEtiquetaDesempeno(stars)

        if (!isPresent) {
          return `
            <div class="p-3 mb-2 rounded-3 border d-flex align-items-center justify-content-between bg-danger-subtle text-danger border-danger-subtle opacity-75">
              <div>
                <strong class="d-block">${escapeHTML(al.nombre || al.nombre_completo)}</strong>
                <small class="text-danger-emphasis"><i class="bi bi-x-circle me-1"></i>[AUSENTE - Sin Evaluación]</small>
              </div>
              <span class="badge bg-danger text-white">Bloqueado</span>
            </div>
          `
        }

        return `
          <div class="p-3 mb-2 rounded-3 border d-flex align-items-center justify-content-between bg-success-subtle border-success-subtle text-body eval-row-clickable" 
               data-id="${al.id}" style="cursor: pointer; user-select: none;">
            <div>
              <strong class="d-block text-success-emphasis fs-6">${escapeHTML(al.nombre || al.nombre_completo)}</strong>
              <small class="text-muted" id="lbl-etiqueta-${al.id}">${etiqueta}</small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="fs-5" id="lbl-stars-${al.id}">${starsHTML || '<span class="text-muted small">0/5</span>'}</span>
              <span class="badge bg-success text-white">Tap +1</span>
            </div>
          </div>
        `
      })
      .join('')
  }

  const bodyHTML = `
    <div>
      <div class="alert alert-info py-2 px-3 mb-3 d-flex align-items-center justify-content-between">
        <span class="small"><i class="bi bi-info-circle me-1"></i>Toca el nombre del alumno para aumentar sus estrellas de 1 a 5.</span>
        <button type="button" class="btn btn-sm btn-outline-primary shadow-sm" id="btn-ia-sugerir-tarea">
          <i class="bi bi-magic me-1"></i>IA Sugerir Tarea
        </button>
      </div>

      <div id="eval-alumnos-container" class="mb-3">
        ${_renderRowsHTML()}
      </div>

      <div class="mt-3 pt-3 border-top">
        <label class="form-label fw-semibold text-body"><i class="bi bi-journal-check me-1"></i>Tarea / Ejercicio Asignado para Casa</label>
        <textarea class="form-control" id="eval-tarea-input" rows="2" placeholder="Ej. Practicar la escala de Do Mayor a 60 BPM (4 pasadas por nota)..."></textarea>
      </div>
    </div>
  `

  AppModal.open({
    title: `🎯 Evaluando: ${escapeHTML(nodo.titulo || nodo.nombre)}`,
    size: 'lg',
    saveText: 'Guardar Calificaciones',
    cancelText: 'Cancelar',
    body: bodyHTML,
    onSave: async () => {
      const tareaText = document.querySelector('#eval-tarea-input')?.value?.trim() || ''
      const resultPayload = alumnos.map((al) => ({
        alumnoId: al.id,
        indicadorId: nodo.id,
        nota: ratings[al.id] || 0,
        presente: Boolean(al.presente ?? true),
        tarea: tareaText,
      }))

      onSaved?.(resultPayload)
      AppToast.show('Evaluaciones y tarea guardadas correctamente', 'success')
      return true
    },
  })

  // Wire Tap Event Handlers inside Modal
  setTimeout(() => {
    const modalEl = document.querySelector('.modal.show') || document
    modalEl.querySelectorAll('.eval-row-clickable').forEach((row) => {
      row.addEventListener('click', () => {
        const alId = row.dataset.id
        let current = ratings[alId] || 0
        current = current >= 5 ? 0 : current + 1
        ratings[alId] = current

        const lblStars = row.querySelector(`#lbl-stars-${alId}`)
        const lblEtiqueta = row.querySelector(`#lbl-etiqueta-${alId}`)

        if (lblStars) {
          lblStars.innerHTML = '⭐'.repeat(current) || '<span class="text-muted small">0/5</span>'
        }
        if (lblEtiqueta) {
          lblEtiqueta.textContent = IndicadorLogro.getEtiquetaDesempeno(current)
        }
      })
    })

    modalEl.querySelector('#btn-ia-sugerir-tarea')?.addEventListener('click', async () => {
      const btn = modalEl.querySelector('#btn-ia-sugerir-tarea')
      if (btn) btn.disabled = true
      AppToast.show('Consultando Asistente IA para sugerencia de tarea...', 'info')

      const necesitan = Object.values(ratings).filter((v) => v > 0 && v < 3).length || 1
      const sugerencia = await sugerirTareaRefuerzoIA({
        indicadorTitulo: nodo.titulo || nodo.nombre,
        alumnosNecesitanRefuerzo: necesitan,
      })

      const area = modalEl.querySelector('#eval-tarea-input')
      if (area) area.value = sugerencia
      if (btn) btn.disabled = false
    })
  }, 150)
}
