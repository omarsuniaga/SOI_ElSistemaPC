import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock dependencies
vi.mock('../../auth/maestroAuth.js', () => ({
  loginMaestro: vi.fn(),
}))

vi.mock('../../auth/usePortalAuth.js', () => ({
  usePortalAuth: {
    setMaestro: vi.fn(),
  }
}))

vi.mock('../../utils/a11yUtils.js', async () => {
  const actual = await vi.importActual('../../utils/a11yUtils.js')
  return actual
})

import { renderLoginView } from '../loginView.js'

describe('loginView - register link', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('renders a link to the register view', () => {
    renderLoginView(container, { onSuccess: vi.fn() })

    const registerLink = container.querySelector('[data-route="register"]')
    expect(registerLink).toBeTruthy()
    expect(registerLink.textContent.toLowerCase()).toContain('registrate')
  })
})
