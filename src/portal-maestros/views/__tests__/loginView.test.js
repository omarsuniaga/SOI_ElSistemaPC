import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock dependencies
vi.mock('../../auth/maestroAuth.js', () => ({
  loginMaestro: vi.fn(),
}))

vi.mock('../../auth/usePortalAuth.js', () => ({
  usePortalAuth: {
    setMaestro: vi.fn(),
  },
}))

vi.mock('../../utils/a11yUtils.js', async () => {
  const actual = await vi.importActual('../../utils/a11yUtils.js')
  return actual
})

import { loginMaestro } from '../../auth/maestroAuth.js'
import { usePortalAuth } from '../../auth/usePortalAuth.js'
import { renderLoginView } from '../loginView.js'

const mockMaestro = {
  id: 1,
  nombre_completo: 'Carlos Ruiz',
  email: 'carlos@test.com',
  user_id: 'user-123',
}

function createContainer() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

function setupRouterMock() {
  window.router = { navigate: vi.fn() }
}

describe('loginView', () => {
  let container
  let onSuccess

  beforeEach(() => {
    container = createContainer()
    onSuccess = vi.fn()
    vi.clearAllMocks()
    localStorage.clear()
    setupRouterMock()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
    delete window.router
  })

  it('renders all form elements', () => {
    renderLoginView(container, { onSuccess })

    expect(container.querySelector('#pm-email')).toBeTruthy()
    expect(container.querySelector('#pm-password')).toBeTruthy()
    expect(container.querySelector('#pm-toggle-password')).toBeTruthy()
    expect(container.querySelector('#pm-remember-email')).toBeTruthy()
    expect(container.querySelector('#pm-keep-session')).toBeTruthy()
    expect(container.querySelector('#pm-login-btn')).toBeTruthy()
    expect(container.querySelector('#pm-login-error')).toBeTruthy()
    expect(container.querySelector('[data-route="register"]')).toBeTruthy()
  })

  it('loads saved email from localStorage', () => {
    localStorage.setItem('pm-saved-email', 'guardado@test.com')

    renderLoginView(container, { onSuccess })

    expect(container.querySelector('#pm-email').value).toBe('guardado@test.com')
    expect(container.querySelector('#pm-remember-email').checked).toBe(true)
  })

  it('toggles password visibility', () => {
    renderLoginView(container, { onSuccess })

    const passwordInput = container.querySelector('#pm-password')
    const toggleBtn = container.querySelector('#pm-toggle-password')

    expect(passwordInput.type).toBe('password')

    toggleBtn.click()
    expect(passwordInput.type).toBe('text')
    expect(toggleBtn.querySelector('i').className).toContain('bi-eye-slash')
    expect(toggleBtn.getAttribute('aria-label')).toBe('Ocultar contraseña')

    toggleBtn.click()
    expect(passwordInput.type).toBe('password')
    expect(toggleBtn.querySelector('i').className).toContain('bi-eye')
    expect(toggleBtn.getAttribute('aria-label')).toBe('Mostrar contraseña')
  })

  it('shows field error when email is empty', () => {
    renderLoginView(container, { onSuccess })

    const emailInput = container.querySelector('#pm-email')
    emailInput.value = ''
    container.querySelector('#pm-password').value = 'somepass'

    container.querySelector('#pm-login-btn').click()

    expect(emailInput.getAttribute('aria-invalid')).toBe('true')
  })

  it('shows field error when password is empty', () => {
    renderLoginView(container, { onSuccess })

    container.querySelector('#pm-email').value = 'test@test.com'
    const passwordInput = container.querySelector('#pm-password')
    passwordInput.value = ''

    container.querySelector('#pm-login-btn').click()

    expect(passwordInput.getAttribute('aria-invalid')).toBe('true')
  })

  it('calls loginMaestro and setMaestro on successful login', async () => {
    loginMaestro.mockResolvedValue({ success: true, maestro: mockMaestro })
    renderLoginView(container, { onSuccess })

    container.querySelector('#pm-email').value = 'carlos@test.com'
    container.querySelector('#pm-password').value = 'password123'
    container.querySelector('#pm-login-btn').click()

    await vi.waitUntil(() => loginMaestro.mock.calls.length > 0, { timeout: 1000 })

    expect(loginMaestro).toHaveBeenCalledWith('carlos@test.com', 'password123', { keepSession: true })
    expect(usePortalAuth.setMaestro).toHaveBeenCalledWith(mockMaestro)
    expect(onSuccess).toHaveBeenCalled()
  })

  it('displays error message on failed login', async () => {
    loginMaestro.mockResolvedValue({ success: false, error: 'Credenciales inválidas' })
    renderLoginView(container, { onSuccess })

    container.querySelector('#pm-email').value = 'bad@test.com'
    container.querySelector('#pm-password').value = 'wrong'
    container.querySelector('#pm-login-btn').click()

    await vi.waitUntil(() => loginMaestro.mock.calls.length > 0, { timeout: 1000 })

    expect(container.querySelector('#pm-login-error').textContent).toBe('Credenciales inválidas')
    expect(usePortalAuth.setMaestro).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('clears password field on failed login', async () => {
    loginMaestro.mockResolvedValue({ success: false, error: 'Error' })
    renderLoginView(container, { onSuccess })

    const passwordInput = container.querySelector('#pm-password')
    passwordInput.value = 'secret'
    container.querySelector('#pm-email').value = 'bad@test.com'
    container.querySelector('#pm-login-btn').click()

    await vi.waitUntil(() => passwordInput.value === '', { timeout: 1000 })

    expect(passwordInput.value).toBe('')
  })

  it('triggers login on Enter key in password field', async () => {
    loginMaestro.mockResolvedValue({ success: true, maestro: mockMaestro })
    renderLoginView(container, { onSuccess })

    container.querySelector('#pm-email').value = 'carlos@test.com'
    container.querySelector('#pm-password').value = 'password123'

    container
      .querySelector('#pm-password')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    await vi.waitUntil(() => loginMaestro.mock.calls.length > 0, { timeout: 1000 })

    expect(loginMaestro).toHaveBeenCalled()
  })

  it('navigates to register on register link click', () => {
    renderLoginView(container, { onSuccess })

    const registerLink = container.querySelector('[data-route="register"]')
    registerLink.click()

    expect(window.router.navigate).toHaveBeenCalledWith('register')
  })

  it('saves email to localStorage when remember email is checked', () => {
    renderLoginView(container, { onSuccess })

    const emailInput = container.querySelector('#pm-email')
    const rememberChk = container.querySelector('#pm-remember-email')

    emailInput.value = 'recordar@test.com'
    rememberChk.checked = true
    rememberChk.dispatchEvent(new Event('change'))

    expect(localStorage.getItem('pm-saved-email')).toBe('recordar@test.com')
  })

  it('removes saved email when remember email is unchecked', () => {
    localStorage.setItem('pm-saved-email', 'previo@test.com')
    renderLoginView(container, { onSuccess })

    const rememberChk = container.querySelector('#pm-remember-email')
    rememberChk.checked = false
    rememberChk.dispatchEvent(new Event('change'))

    expect(localStorage.getItem('pm-saved-email')).toBeNull()
  })
})
