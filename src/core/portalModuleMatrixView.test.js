import { afterEach, describe, expect, it } from 'vitest'
import { renderPortalModuleMatrixView } from './portalModuleMatrixView.js'

const render = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  renderPortalModuleMatrixView(container)
  return container
}

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelector('#app-help-panel-styles')?.remove()
})

describe('portal module matrix view', () => {
  it('renders the shadow warning, read-only approval flow and local example', () => {
    const container = render()
    const approvalFlow = container.querySelector('[data-testid="shadow-approval-flow"]')

    expect(container.querySelector('#matrix-title')?.textContent).toContain('Matriz')
    expect(container.textContent).toContain('Modo sombra activo')
    expect(approvalFlow?.textContent).toContain('sin persistencia')
    expect(approvalFlow?.textContent).toContain('Ejemplo local')
    expect(approvalFlow?.querySelectorAll('button, input, select')).toHaveLength(0)
  })

  it('updates visible rows when a portal filter changes', () => {
    const container = render()
    const portalFilter = container.querySelector('#matrix-filter-portal')
    portalFilter.value = 'MAESTROS'
    portalFilter.dispatchEvent(new Event('change'))

    const rows = [...container.querySelectorAll('#matrix-rows tr')]
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every(row => row.querySelector('td code')?.textContent === 'MAESTROS')).toBe(true)
  })

  it('opens contextual help without changing the matrix', () => {
    const container = render()
    container.querySelector('#matrix-help').click()

    expect(document.querySelector('#app-help-panel')?.textContent).toContain('Matriz de capacidades en modo sombra')
    expect(container.querySelectorAll('#matrix-rows tr').length).toBeGreaterThan(0)
  })
})
