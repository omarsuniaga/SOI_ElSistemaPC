import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock supabaseClient
vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  }
}))

// Real a11yUtils — needed for setFieldError/clearAllFieldErrors to work in tests
// so aria-invalid is actually set on elements
vi.mock('../../utils/a11yUtils.js', async () => {
  const actual = await vi.importActual('../../utils/a11yUtils.js')
  return actual
})

import { supabase } from '../../../lib/supabaseClient.js'
import { renderRegisterView } from '../registerView.js'

describe('registerView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
    // Mock window dispatch for toast events
    window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('renders the registration form with all required fields', () => {
    renderRegisterView(container, { onSuccess: vi.fn() })

    expect(container.querySelector('#pm-reg-nombre')).toBeTruthy()
    expect(container.querySelector('#pm-reg-email')).toBeTruthy()
    expect(container.querySelector('#pm-reg-password')).toBeTruthy()
    expect(container.querySelector('#pm-reg-confirm-password')).toBeTruthy()
    expect(container.querySelector('#pm-reg-instrumento')).toBeTruthy()
    expect(container.querySelector('#pm-reg-resena')).toBeTruthy()
    expect(container.querySelector('#pm-register-btn')).toBeTruthy()
  })

  it('shows error when nombre is empty on submit', () => {
    renderRegisterView(container, { onSuccess: vi.fn() })

    const btn = container.querySelector('#pm-register-btn')
    btn.click()

    // Should show inline error for nombre
    const nombreInput = container.querySelector('#pm-reg-nombre')
    expect(nombreInput.getAttribute('aria-invalid')).toBe('true')
  })

  it('shows error when email is empty on submit', () => {
    renderRegisterView(container, { onSuccess: vi.fn() })

    // Fill nombre but leave email empty
    container.querySelector('#pm-reg-nombre').value = 'Juan Pérez'

    const btn = container.querySelector('#pm-register-btn')
    btn.click()

    const emailInput = container.querySelector('#pm-reg-email')
    expect(emailInput.getAttribute('aria-invalid')).toBe('true')
  })

  it('shows error when password is shorter than 6 characters', () => {
    renderRegisterView(container, { onSuccess: vi.fn() })

    container.querySelector('#pm-reg-nombre').value = 'Juan Pérez'
    container.querySelector('#pm-reg-email').value = 'juan@test.com'
    container.querySelector('#pm-reg-password').value = '123'
    container.querySelector('#pm-reg-confirm-password').value = '123'

    const btn = container.querySelector('#pm-register-btn')
    btn.click()

    const pwdInput = container.querySelector('#pm-reg-password')
    expect(pwdInput.getAttribute('aria-invalid')).toBe('true')
  })

  it('shows error when passwords do not match', () => {
    renderRegisterView(container, { onSuccess: vi.fn() })

    container.querySelector('#pm-reg-nombre').value = 'Juan Pérez'
    container.querySelector('#pm-reg-email').value = 'juan@test.com'
    container.querySelector('#pm-reg-password').value = '123456'
    container.querySelector('#pm-reg-confirm-password').value = '654321'

    const btn = container.querySelector('#pm-register-btn')
    btn.click()

    const confirmInput = container.querySelector('#pm-reg-confirm-password')
    expect(confirmInput.getAttribute('aria-invalid')).toBe('true')
  })

  it('calls supabase.auth.signUp on valid submit', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user-123' } },
      error: null
    })

    const onSuccess = vi.fn()
    renderRegisterView(container, { onSuccess })

    container.querySelector('#pm-reg-nombre').value = 'Juan Pérez'
    container.querySelector('#pm-reg-email').value = 'juan@test.com'
    container.querySelector('#pm-reg-password').value = '123456'
    container.querySelector('#pm-reg-confirm-password').value = '123456'
    container.querySelector('#pm-reg-instrumento').value = 'Violín'

    const btn = container.querySelector('#pm-register-btn')
    btn.click()

    await vi.waitUntil(() => supabase.auth.signUp.mock.calls.length > 0, { timeout: 1000 })

    expect(supabase.auth.signUp).toHaveBeenCalledTimes(1)
    const callArg = supabase.auth.signUp.mock.calls[0][0]
    expect(callArg.email).toBe('juan@test.com')
    expect(callArg.password).toBe('123456')
    expect(callArg.options.data.rol).toBe('maestro')
    expect(callArg.options.data.full_name).toBe('Juan Pérez')
  })

  it('calls onSuccess callback after successful registration', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user-123' } },
      error: null
    })

    const onSuccess = vi.fn()
    renderRegisterView(container, { onSuccess })

    container.querySelector('#pm-reg-nombre').value = 'Juan Pérez'
    container.querySelector('#pm-reg-email').value = 'juan@test.com'
    container.querySelector('#pm-reg-password').value = '123456'
    container.querySelector('#pm-reg-confirm-password').value = '123456'

    const btn = container.querySelector('#pm-register-btn')
    btn.click()

    await vi.waitUntil(() => onSuccess.mock.calls.length > 0, { timeout: 1000 })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows error message when email is already registered', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' }
    })

    renderRegisterView(container, { onSuccess: vi.fn() })

    container.querySelector('#pm-reg-nombre').value = 'Juan Pérez'
    container.querySelector('#pm-reg-email').value = 'existing@test.com'
    container.querySelector('#pm-reg-password').value = '123456'
    container.querySelector('#pm-reg-confirm-password').value = '123456'

    const btn = container.querySelector('#pm-register-btn')
    btn.click()

    await vi.waitUntil(() => {
      const errorEl = container.querySelector('#pm-reg-error')
      return errorEl && errorEl.textContent.length > 0
    }, { timeout: 1000 })

    const errorEl = container.querySelector('#pm-reg-error')
    expect(errorEl.textContent).toContain('registrado')
  })

  it('has a link to navigate back to login', () => {
    renderRegisterView(container, { onSuccess: vi.fn() })

    const loginLink = container.querySelector('[data-route="login"]')
    expect(loginLink).toBeTruthy()
    expect(loginLink.textContent.toLowerCase()).toContain('iniciar sesión')
  })
})
