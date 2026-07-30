import { getPeriods } from '../api/semesterTransition.js'

/**
 * Create a PeriodSelector component — a list of academic periods
 * with metadata (date range, class count) and active-period badge.
 *
 * @param {HTMLElement} container - Mount target
 * @param {Object} options
 * @param {Function} [options.onChange] - Called with selected period object
 * @returns {{ element: HTMLElement, destroy: Function, load: Function, getSelected: Function }}
 */
export function createPeriodSelector(container, options = {}) {
  const { onChange } = options
  const el = document.createElement('div')
  el.className = 'ts-period-selector'

  let periods = []
  let selectedId = null

  function render() {
    el.innerHTML = ''

    if (periods.length === 0) {
      const empty = document.createElement('div')
      empty.className = 'ts-period-empty'
      empty.textContent = 'No hay periodos disponibles'
      el.appendChild(empty)
      return
    }

    const list = document.createElement('div')
    list.className = 'ts-period-list'

    for (const period of periods) {
      const item = document.createElement('div')
      item.className = 'ts-period-item'
      item.dataset.periodId = period.id

      if (period.id === selectedId) {
        item.classList.add('ts-period-selected')
      }

      // Period name
      const name = document.createElement('span')
      name.className = 'ts-period-name'
      name.textContent = period.nombre
      item.appendChild(name)

      // Active badge
      if (period.activo) {
        const badge = document.createElement('span')
        badge.className = 'ts-period-badge'
        badge.textContent = 'Activo'
        item.appendChild(badge)
      }

      // Date range
      const dateRange = document.createElement('span')
      dateRange.className = 'ts-period-dates'
      dateRange.textContent = `${period.fecha_inicio} – ${period.fecha_fin}`
      item.appendChild(dateRange)

      // Class count
      const count = document.createElement('span')
      count.className = 'ts-period-count'
      count.textContent = `${period.classCount} clases`
      item.appendChild(count)

      item.addEventListener('click', () => {
        selectedId = period.id
        render()
        onChange?.(period)
      })

      list.appendChild(item)
    }

    el.appendChild(list)
  }

  /**
   * Fetch periods from API and render the selector.
   */
  async function load() {
    try {
      periods = await getPeriods()
      render()
    } catch (err) {
      el.innerHTML = ''
      const errorEl = document.createElement('div')
      errorEl.className = 'ts-period-error'
      errorEl.textContent = `Error al cargar periodos: ${err.message}`
      el.appendChild(errorEl)
    }
  }

  function getSelected() {
    if (!selectedId) return null
    return periods.find(p => p.id === selectedId) || null
  }

  function destroy() {
    el.remove()
  }

  container.appendChild(el)

  return { element: el, destroy, load, getSelected }
}
