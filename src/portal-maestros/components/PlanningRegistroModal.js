/**
 * PlanningRegistroModal.js
 * Modal para registrar una observación de un indicador
 */

import { createIndicatorObservation } from '../../modules/planning/services/planningService.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { announce } from '../utils/a11yUtils.js'
import { getInscripcionesClases } from '../services/maestroDataService.js'
import { obtenerAlumnos } from '../../modules/alumnos/api/alumnosApi.js'

export async function createPlanningRegistroModal(container, { indicator, claseId, maestroId, routeVersionId, onSave }) {
  let selectedEstudiantes = new Set()

  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `

  const modal = document.createElement('div')
  modal.style.cssText = `
    background: var(--pm-surface);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    animation: pm-modal-in 0.2s ease-out;
  `

  modal.innerHTML = `
    <style>
      @keyframes pm-modal-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .pm-registro-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid var(--pm-border);
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8);
        color: white;
        border-radius: 16px 16px 0 0;
      }

      .pm-registro-title {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0;
      }

      .pm-registro-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .pm-registro-close:hover {
        transform: rotate(90deg);
      }

      .pm-registro-content {
        padding: 2rem;
      }

      .pm-registro-section {
        margin-bottom: 2rem;
      }

      .pm-registro-section-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--pm-text);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .pm-registro-students-list {
        display: grid;
        gap: 0.75rem;
        max-height: 300px;
        overflow-y: auto;
        padding-right: 5px;
        border: 1px solid var(--pm-border);
        padding: 1rem;
        border-radius: 8px;
        background: var(--pm-surface-2);
      }

      .pm-registro-student-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 6px;
        transition: all 0.15s;
        cursor: pointer;
      }

      .pm-registro-student-item:hover {
        background: var(--pm-primary-light, rgba(0, 122, 255, 0.1));
      }

      .pm-registro-student-item input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .pm-registro-student-label {
        flex: 1;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .pm-registro-student-instrumento {
        font-size: 0.75rem;
        color: var(--pm-text-muted);
      }

      .pm-registro-bulk-actions {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .pm-registro-bulk-btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface-2);
        color: var(--pm-text);
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pm-registro-bulk-btn:hover {
        background: var(--pm-primary);
        color: white;
        border-color: var(--pm-primary);
      }

      .pm-registro-textarea {
        width: 100%;
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        font-family: inherit;
        font-size: 0.9rem;
        resize: vertical;
        min-height: 100px;
        margin-bottom: 1rem;
      }

      .pm-registro-calificacion {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .pm-registro-calificacion-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }

      .pm-registro-calificacion-option input[type="radio"] {
        cursor: pointer;
      }

      .pm-registro-calificacion-label {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .pm-registro-footer {
        padding: 1.5rem;
        border-top: 1px solid var(--pm-border);
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }

      .pm-registro-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pm-registro-btn-cancel {
        background: var(--pm-surface-2);
        color: var(--pm-text);
      }

      .pm-registro-btn-cancel:hover {
        background: var(--pm-border);
      }

      .pm-registro-btn-save {
        background: var(--pm-primary);
        color: white;
      }

      .pm-registro-btn-save:hover:not(:disabled) {
        background: #0056b3;
      }

      .pm-registro-btn-save:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .pm-registro-counter {
        font-size: 0.85rem;
        color: var(--pm-text-muted);
        margin-bottom: 1rem;
      }
    </style>

    <div class="pm-registro-header">
      <h2 class="pm-registro-title">Registrar Observación</h2>
      <button class="pm-registro-close" id="pm-registro-close">✕</button>
    </div>

    <div class="pm-registro-content">
      <h3 style="margin: 0 0 0.5rem 0;">📍 ${indicator.nombre}</h3>
      <p style="margin: 0 0 2rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">${indicator.descripcion || 'Sin descripción'}</p>

      <!-- Seleccionar Estudiantes -->
      <div class="pm-registro-section">
        <div class="pm-registro-section-title">👥 Estudiantes que trabajaron este indicador</div>
        <div class="pm-registro-bulk-actions">
          <button class="pm-registro-bulk-btn" id="pm-select-all">Seleccionar todos</button>
          <button class="pm-registro-bulk-btn" id="pm-deselect-all">Deseleccionar todos</button>
        </div>
        <div class="pm-registro-counter" id="pm-counter">0 seleccionados</div>
        <div class="pm-registro-students-list" id="pm-students-list">
          <p style="color: var(--pm-text-muted); text-align: center;">Cargando estudiantes...</p>
        </div>
      </div>

      <!-- Descripción -->
      <div class="pm-registro-section">
        <div class="pm-registro-section-title">📝 Descripción de la clase</div>
        <textarea
          class="pm-registro-textarea"
          id="pm-registro-descripcion"
          placeholder="Ej: Arco más recto, buena presión. Algunos aún necesitan practicar transferencia."
        ></textarea>
      </div>

      <!-- Calificación -->
      <div class="pm-registro-section">
        <div class="pm-registro-section-title">⭐ Calificación general</div>
        <div class="pm-registro-calificacion">
          <label class="pm-registro-calificacion-option">
            <input type="radio" name="calificacion" value="bien" checked>
            <span class="pm-registro-calificacion-label">✓ Bien</span>
          </label>
          <label class="pm-registro-calificacion-option">
            <input type="radio" name="calificacion" value="regular">
            <span class="pm-registro-calificacion-label">◐ Regular</span>
          </label>
          <label class="pm-registro-calificacion-option">
            <input type="radio" name="calificacion" value="mal">
            <span class="pm-registro-calificacion-label">✗ Mal</span>
          </label>
        </div>
      </div>
    </div>

    <div class="pm-registro-footer">
      <button class="pm-registro-btn pm-registro-btn-cancel" id="pm-registro-cancel">Cancelar</button>
      <button class="pm-registro-btn pm-registro-btn-save" id="pm-registro-save">Guardar Observación</button>
    </div>
  `

  overlay.appendChild(modal)
  container.appendChild(overlay)

  // Cargar estudiantes
  try {
    const inscripciones = await getInscripcionesClases([claseId])
    const alumnoIds = inscripciones.map((i) => i.alumno_id)

    if (alumnoIds.length === 0) {
      document.getElementById('pm-students-list').innerHTML =
        '<p style="color: var(--pm-text-muted); text-align: center;">No hay estudiantes en esta clase</p>'
      return
    }

    // Obtener datos de alumnos
    const allAlumnos = await obtenerAlumnos()
    const alumnos = allAlumnos.filter((alumno) => alumnoIds.includes(alumno.id))

    const studentsList = document.getElementById('pm-students-list')
    studentsList.innerHTML = alumnos
      .map(
        (alumno) => `
      <label class="pm-registro-student-item">
        <input type="checkbox" data-alumno-id="${alumno.id}">
        <span class="pm-registro-student-label">
          <strong>${alumno.nombre_completo}</strong>
          <span class="pm-registro-student-instrumento">${alumno.instrumento_principal || 'S/I'}</span>
        </span>
      </label>
    `
      )
      .join('')

    // Event listeners para checkboxes
    studentsList.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selectedEstudiantes.add(checkbox.dataset.alumnoId)
        } else {
          selectedEstudiantes.delete(checkbox.dataset.alumnoId)
        }
        _updateCounter()
      })
    })
  } catch (err) {
    console.error('[registro] Error cargando estudiantes:', err)
    document.getElementById('pm-students-list').innerHTML =
      '<p style="color: var(--pm-text-muted); text-align: center;">Error cargando estudiantes</p>'
  }

  // Bulk actions
  document.getElementById('pm-select-all').addEventListener('click', () => {
    document.querySelectorAll('#pm-students-list input[type="checkbox"]').forEach((cb) => {
      cb.checked = true
      selectedEstudiantes.add(cb.dataset.alumnoId)
    })
    _updateCounter()
  })

  document.getElementById('pm-deselect-all').addEventListener('click', () => {
    document.querySelectorAll('#pm-students-list input[type="checkbox"]').forEach((cb) => {
      cb.checked = false
      selectedEstudiantes.delete(cb.dataset.alumnoId)
    })
    _updateCounter()
  })

  // Guardar
  document.getElementById('pm-registro-save').addEventListener('click', async () => {
    if (selectedEstudiantes.size === 0) {
      AppToast.warning('Selecciona al menos un estudiante')
      return
    }

    const descripcion = document.getElementById('pm-registro-descripcion').value.trim()
    const calificacion = document.querySelector('input[name="calificacion"]:checked').value

    try {
      const btn = document.getElementById('pm-registro-save')
      btn.disabled = true
      btn.textContent = 'Guardando...'

      await createIndicatorObservation({
        maestroId,
        routeVersionId,
        nodeId: indicator.node_id,
        claseId,
        fecha: new Date().toISOString().split('T')[0],
        descripcion,
        calificacion,
        estudianteIds: Array.from(selectedEstudiantes),
      })

      AppToast.success('✓ Observación guardada exitosamente')
      announce(`Observación para ${indicator.nombre} guardada. ${selectedEstudiantes.size} estudiantes registrados.`)

      _close()

      if (onSave) onSave()
    } catch (err) {
      console.error('[registro] Error guardando:', err)
      AppToast.error('Error guardando observación')
      document.getElementById('pm-registro-save').disabled = false
      document.getElementById('pm-registro-save').textContent = 'Guardar Observación'
    }
  })

  // Cerrar
  function _close() {
    overlay.remove()
  }

  document.getElementById('pm-registro-close').addEventListener('click', _close)
  document.getElementById('pm-registro-cancel').addEventListener('click', _close)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) _close()
  })

  function _updateCounter() {
    const count = selectedEstudiantes.size
    document.getElementById('pm-counter').textContent = `${count} ${count === 1 ? 'estudiante seleccionado' : 'estudiantes seleccionados'}`
  }
}
