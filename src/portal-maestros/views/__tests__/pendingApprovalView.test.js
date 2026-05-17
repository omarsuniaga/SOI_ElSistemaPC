import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { renderPendingApprovalView } from '../pendingApprovalView.js'

describe('pendingApprovalView', () => {
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

  it('renders the pending approval screen with title', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })

    expect(container.textContent).toContain('Registro exitoso')
    expect(container.textContent).toContain('Esperá')
    expect(container.textContent).toContain('aprobación')
  })

  it('renders a back-to-login button', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })

    const backBtn = container.querySelector('[data-route="login"]')
    expect(backBtn).toBeTruthy()
    expect(backBtn.textContent.toLowerCase()).toContain('inicio')
  })

  it('calls onBackToLogin callback when back button is clicked', () => {
    const onBackToLogin = vi.fn()
    renderPendingApprovalView(container, { onBackToLogin })

    const backBtn = container.querySelector('[data-route="login"]')
    backBtn.click()

    expect(onBackToLogin).toHaveBeenCalled()
  })
})
