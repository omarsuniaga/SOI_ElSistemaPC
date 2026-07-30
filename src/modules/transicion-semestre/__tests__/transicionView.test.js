import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../components/TransitionWizard.js', () => ({
  createTransitionWizard: vi.fn((container) => {
    const el = document.createElement('div')
    el.className = 'ts-transition-wizard'
    container.appendChild(el)
    return {
      element: el,
      destroy: vi.fn(() => el.remove()),
      getState: vi.fn(() => ({ currentStep: 1 })),
    }
  }),
}))

import { init } from '../views/transicionView.js'
import { createTransitionWizard } from '../components/TransitionWizard.js'

function makeContainer() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

function cleanup(container) {
  document.body.removeChild(container)
}

describe('transicionView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = makeContainer()
  })

  afterEach(() => {
    cleanup(container)
  })

  it('should instantiate the TransitionWizard with the container', () => {
    init(container)

    expect(createTransitionWizard).toHaveBeenCalledTimes(1)
    expect(createTransitionWizard).toHaveBeenCalledWith(container)
  })

  it('should render the wizard element inside the container', () => {
    init(container)

    const wizardEl = container.querySelector('.ts-transition-wizard')
    expect(wizardEl).not.toBeNull()
  })

  it('should return a destroy function', () => {
    const result = init(container)

    expect(result).toBeDefined()
    expect(typeof result.destroy).toBe('function')
  })

  it('should delegate destroy to the wizard instance', () => {
    const result = init(container)

    const wizardInstance = createTransitionWizard.mock.results[0].value
    result.destroy()

    expect(wizardInstance.destroy).toHaveBeenCalledTimes(1)
  })

  it('should remove wizard from DOM after destroy', () => {
    const result = init(container)

    expect(container.querySelector('.ts-transition-wizard')).not.toBeNull()

    result.destroy()

    expect(container.querySelector('.ts-transition-wizard')).toBeNull()
  })

  it('should only create one wizard per init call', () => {
    init(container)

    expect(createTransitionWizard).toHaveBeenCalledTimes(1)
  })
})
