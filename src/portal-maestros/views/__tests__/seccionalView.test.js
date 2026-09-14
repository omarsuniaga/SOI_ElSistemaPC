import { afterEach, describe, expect, it } from 'vitest'
import { renderSeccionalView } from '../seccionalView.js'
import { createSectionalDemoAdapter } from '../../../modules/repertoire/demo/sectionalDemoAdapter.js'

afterEach(() => { document.body.innerHTML = '' })

describe('seccionalView', () => {
  it('renders an authorized section with accessible segmented cells and detail', async () => {
    const container = document.createElement('main')
    const result = await renderSeccionalView(container, { adapter: createSectionalDemoAdapter() })
    expect(result.sectionId).toBe('maderas')
    expect(container.querySelectorAll('.sectional-cell')).toHaveLength(32)
    expect(container.querySelector('.sectional-cell').getAttribute('aria-label')).toContain('sin estudiar')
    container.querySelector('.sectional-cell').click()
    expect(container.querySelector('.sectional-detail').textContent).toContain('Compás 1')
  })

  it('keeps a 1000-measure sectional map within the existing DOM boundary', async () => {
    const container = document.createElement('main')
    const started = performance.now()
    await renderSeccionalView(container, { adapter: createSectionalDemoAdapter({ measureCount: 1000 }) })
    expect(container.querySelectorAll('.sectional-cell')).toHaveLength(1000)
    expect(performance.now() - started).toBeLessThan(1500)
  })

  it('switches sections and resets the active fila context', async () => {
    const container = document.createElement('main')
    await renderSeccionalView(container, { adapter: createSectionalDemoAdapter({ measureCount: 2 }) })
    const select = container.querySelector('.sectional-section-select')
    select.value = 'metales'
    select.dispatchEvent(new Event('change', { bubbles: true }))
    expect(container.querySelector('h1').textContent).toContain('metales')
    expect(container.querySelector('.sectional-tab').textContent).toBe('GENERAL')
  })
})
