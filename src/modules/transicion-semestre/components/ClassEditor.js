import { validateConflicts } from '../api/semesterTransition.js'

/**
 * Create a ClassEditor component — inline editing of a cloned class
 * with conflict detection and save/cancel controls.
 *
 * @param {HTMLElement} container - Mount target
 * @param {Object} options
 * @param {Object} options.classData - Class object to edit
 * @param {Function} options.onSave - Called with updated class data
 * @param {Function} options.onCancel - Called when edit is cancelled
 * @returns {{ element: HTMLElement, destroy: Function, getData: Function }}
 */
export function createClassEditor(container, options = {}) {
  const { classData, onSave, onCancel } = options
  const el = document.createElement('div')
  el.className = 'ts-class-editor'

  let currentData = { ...classData }
  let conflicts = []
  let saving = false

  function render() {
    el.innerHTML = ''

    // Class name header
    const header = document.createElement('div')
    header.className = 'ts-editor-header'
    const nameEl = document.createElement('span')
    nameEl.className = 'ts-editor-name'
    nameEl.textContent = currentData.nombre
    header.appendChild(nameEl)
    el.appendChild(header)

    // Editable fields
    const fields = document.createElement('div')
    fields.className = 'ts-editor-fields'

    // Teacher field
    const teacherGroup = document.createElement('div')
    teacherGroup.className = 'ts-editor-field'
    const teacherLabel = document.createElement('label')
    teacherLabel.textContent = 'Maestro'
    const teacherInput = document.createElement('input')
    teacherInput.type = 'text'
    teacherInput.className = 'ts-teacher-input'
    teacherInput.value = currentData.maestro_principal_id || ''
    teacherInput.addEventListener('input', () => {
      currentData.maestro_principal_id = teacherInput.value
    })
    teacherGroup.appendChild(teacherLabel)
    teacherGroup.appendChild(teacherInput)
    fields.appendChild(teacherGroup)

    // Capacity field
    const capGroup = document.createElement('div')
    capGroup.className = 'ts-editor-field'
    const capLabel = document.createElement('label')
    capLabel.textContent = 'Capacidad maxima'
    const capInput = document.createElement('input')
    capInput.type = 'number'
    capInput.className = 'ts-capacity-input'
    capInput.value = currentData.capacidad_maxima || ''
    capInput.addEventListener('input', () => {
      currentData.capacidad_maxima = capInput.value
    })
    capGroup.appendChild(capLabel)
    capGroup.appendChild(capInput)
    fields.appendChild(capGroup)

    el.appendChild(fields)

    // Conflicts section
    const conflictSection = document.createElement('div')
    conflictSection.className = 'ts-conflict-section'
    if (conflicts.length > 0) {
      for (const conflict of conflicts) {
        const badge = document.createElement('div')
        badge.className = 'ts-conflict-badge'
        badge.textContent = `${conflict.type === 'teacher' ? 'Maestro' : 'Salon'}: ${conflict.detail}`
        conflictSection.appendChild(badge)
      }
    }
    el.appendChild(conflictSection)

    // Actions
    const actions = document.createElement('div')
    actions.className = 'ts-editor-actions'

    const cancelBtn = document.createElement('button')
    cancelBtn.className = 'ts-cancel-btn'
    cancelBtn.textContent = 'Cancelar'
    cancelBtn.addEventListener('click', () => onCancel?.())

    const saveBtn = document.createElement('button')
    saveBtn.className = 'ts-save-btn'
    if (conflicts.length > 0) {
      saveBtn.textContent = `Guardar (${conflicts.length} conflicto(s))`
      saveBtn.disabled = true
    } else {
      saveBtn.textContent = 'Guardar'
    }
    saveBtn.addEventListener('click', async () => {
      if (saving) return
      saving = true
      saveBtn.textContent = 'Validando...'
      saveBtn.disabled = true

      // Run conflict detection
      conflicts = await validateConflicts([currentData], classData.periodo_id || '')
      if (conflicts.length > 0) {
        saving = false
        render()
        return
      }

      await onSave?.(currentData)
      saving = false
    })

    actions.appendChild(cancelBtn)
    actions.appendChild(saveBtn)
    el.appendChild(actions)
  }

  function getData() {
    return { ...currentData }
  }

  function destroy() {
    el.remove()
  }

  render()
  container.appendChild(el)

  return { element: el, destroy, getData }
}
