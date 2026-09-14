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
})
