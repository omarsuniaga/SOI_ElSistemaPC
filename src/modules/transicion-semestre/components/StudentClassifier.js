import { fuzzySearch, getInstrumentFacets } from '../api/studentClassifier.js'

/**
 * Create a StudentClassifier component — search bar with fuzzy matching,
 * instrument/enrollment filters, and a checkbox list with select-all.
 *
 * @param {HTMLElement} container - Mount target
 * @param {Object} options
 * @param {Array} options.students - Full student list for the source period
 * @param {Function} [options.onSelectionChange] - Called with selected student IDs array
 * @returns {{ element: HTMLElement, destroy: Function, getSelected: Function, setSelected: Function }}
 */
export function createStudentClassifier(container, options = {}) {
  const { students = [], onSelectionChange } = options
  const el = document.createElement('div')
  el.className = 'ts-student-classifier'

  const selectedIds = new Set()
  let currentQuery = ''
  let currentInstrument = ''
  let currentStatus = ''

  const facets = getInstrumentFacets(students)

  function getFilteredStudents() {
    return fuzzySearch(currentQuery, students, {
      threshold: 0.6,
      filters: {
        instrumento: currentInstrument || null,
        enrollmentStatus: currentStatus || null,
      },
    })
  }

  function syncSelectAllCheckbox() {
    const selectAll = el.querySelector('.ts-select-all')
    if (!selectAll) return
    const visible = getFilteredStudents()
    const allVisibleSelected = visible.length > 0 && visible.every(s => selectedIds.has(s.id))
    selectAll.checked = allVisibleSelected
    selectAll.indeterminate = !allVisibleSelected && visible.some(s => selectedIds.has(s.id))
  }

  function renderList() {
    const listEl = el.querySelector('.ts-student-list')
    if (!listEl) return

    const visible = getFilteredStudents()
    listEl.innerHTML = ''

    // Update count
    const countEl = el.querySelector('.ts-student-count')
    if (countEl) {
      countEl.textContent = `${visible.length} de ${students.length} alumno(s)`
    }

    if (visible.length === 0) {
      const noResults = document.createElement('div')
      noResults.className = 'ts-no-results'
      noResults.textContent = 'No hay alumnos que coincidan con la busqueda'
      listEl.appendChild(noResults)
      syncSelectAllCheckbox()
      return
    }

    for (const student of visible) {
      const row = document.createElement('label')
      row.className = 'ts-student-row'

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.className = 'ts-student-check'
      checkbox.value = student.id
      checkbox.checked = selectedIds.has(student.id)

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          selectedIds.add(student.id)
        } else {
          selectedIds.delete(student.id)
        }
        syncSelectAllCheckbox()
        onSelectionChange?.(getSelected())
      })

      const nameSpan = document.createElement('span')
      nameSpan.className = 'ts-student-name'
      nameSpan.textContent = student.nombre_completo || 'Sin nombre'

      const instSpan = document.createElement('span')
      instSpan.className = 'ts-student-instrument'
      instSpan.textContent = student.instrumento_principal || ''

      row.appendChild(checkbox)
      row.appendChild(nameSpan)
      row.appendChild(instSpan)
      listEl.appendChild(row)
    }

    syncSelectAllCheckbox()
  }

  function render() {
    el.innerHTML = ''

    // Search bar
    const searchWrap = document.createElement('div')
    searchWrap.className = 'ts-search-wrap'
    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.className = 'ts-search-input'
    searchInput.placeholder = 'Buscar por nombre, cedula o telefono...'
    searchInput.addEventListener('input', () => {
      currentQuery = searchInput.value
      renderList()
    })
    searchWrap.appendChild(searchInput)
    el.appendChild(searchWrap)

    // Filters row
    const filtersRow = document.createElement('div')
    filtersRow.className = 'ts-filters-row'

    // Instrument filter
    const instrumentSelect = document.createElement('select')
    instrumentSelect.className = 'ts-instrument-filter'
    const allOption = document.createElement('option')
    allOption.value = ''
    allOption.textContent = 'Todos los instrumentos'
    instrumentSelect.appendChild(allOption)
    for (const facet of facets) {
      const opt = document.createElement('option')
      opt.value = facet.instrumento
      opt.textContent = `${facet.instrumento} (${facet.count})`
      instrumentSelect.appendChild(opt)
    }
    instrumentSelect.addEventListener('change', () => {
      currentInstrument = instrumentSelect.value
      renderList()
    })
    filtersRow.appendChild(instrumentSelect)

    // Enrollment status filter
    const statusSelect = document.createElement('select')
    statusSelect.className = 'ts-status-filter'
    const statusAll = document.createElement('option')
    statusAll.value = ''
    statusAll.textContent = 'Todos los estados'
    statusSelect.appendChild(statusAll)
    const statusActive = document.createElement('option')
    statusActive.value = 'active'
    statusActive.textContent = 'Activos'
    statusSelect.appendChild(statusActive)
    const statusInactive = document.createElement('option')
    statusInactive.value = 'inactive'
    statusInactive.textContent = 'Inactivos'
    statusSelect.appendChild(statusInactive)
    statusSelect.addEventListener('change', () => {
      currentStatus = statusSelect.value
      renderList()
    })
    filtersRow.appendChild(statusSelect)

    el.appendChild(filtersRow)

    // Select all
    const selectAllWrap = document.createElement('div')
    selectAllWrap.className = 'ts-select-all-wrap'
    const selectAll = document.createElement('input')
    selectAll.type = 'checkbox'
    selectAll.className = 'ts-select-all'
    selectAll.addEventListener('change', () => {
      const visible = getFilteredStudents()
      if (selectAll.checked) {
        visible.forEach(s => selectedIds.add(s.id))
      } else {
        visible.forEach(s => selectedIds.delete(s.id))
      }
      renderList()
      onSelectionChange?.(getSelected())
    })
    const selectAllLabel = document.createElement('span')
    selectAllLabel.textContent = 'Seleccionar todos los visibles'
    selectAllWrap.appendChild(selectAll)
    selectAllWrap.appendChild(selectAllLabel)
    el.appendChild(selectAllWrap)

    // Count
    const countEl = document.createElement('div')
    countEl.className = 'ts-student-count'
    el.appendChild(countEl)

    // Student list
    const listEl = document.createElement('div')
    listEl.className = 'ts-student-list'
    el.appendChild(listEl)

    renderList()
  }

  function getSelected() {
    return Array.from(selectedIds)
  }

  function setSelected(ids) {
    selectedIds.clear()
    ids.forEach(id => selectedIds.add(id))
    renderList()
    syncSelectAllCheckbox()
  }

  function destroy() {
    el.remove()
  }

  render()
  container.appendChild(el)

  return { element: el, destroy, getSelected, setSelected }
}
