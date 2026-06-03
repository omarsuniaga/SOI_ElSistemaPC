/**
 * registerView.pendingApproval.test.js
 *
 * Tests del flujo de aprobación en registerView:
 *   - Después de un registro exitoso, se llama supabase.auth.signOut()
 *     para evitar que el usuario entre al sistema antes de ser aprobado.
 *   - El perfil se crea con estado='pendiente' y rol='maestro'.
 *   - Se llama onSuccess() para navegar a pending-approval.
 *   - Si signUp falla, NO se llama signOut ni onSuccess.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({}),
    },
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

vi.mock('../../utils/a11yUtils.js', async () => {
  const actual = await vi.importActual('../../utils/a11yUtils.js')
  return actual
})

import { supabase } from '../../../lib/supabaseClient.js'
import { renderRegisterView } from '../registerView.js'

// ── Helpers ────────────────────────────────────────────────────────────────

function fillValidForm(container) {
  container.querySelector('#pm-reg-nombre').value           = 'Ana García'
  container.querySelector('#pm-reg-email').value            = 'ana@soi.edu'
  container.querySelector('#pm-reg-password').value         = 'segura123'
  container.querySelector('#pm-reg-confirm-password').value = 'segura123'
  container.querySelector('#pm-reg-instrumento').value      = 'Violín'
}

// ── Suite ──────────────────────────────────────────────────────────────────

describe('registerView — flujo de aprobación pendiente', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
    window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  // ── Sign out post-registro ───────────────────────────────────────────────

  it('llama supabase.auth.signOut() después de un registro exitoso', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-u-1' } },
      error: null,
    })

    renderRegisterView(container, { onSuccess: vi.fn() })
    fillValidForm(container)
    container.querySelector('#pm-register-btn').click()

    await vi.waitUntil(() => supabase.auth.signOut.mock.calls.length > 0, { timeout: 2000 })

    expect(supabase.auth.signOut).toHaveBeenCalledOnce()
  })

  it('llama signOut ANTES de llamar onSuccess', async () => {
    const callOrder = []
    supabase.auth.signOut.mockImplementation(async () => {
      callOrder.push('signOut')
    })
    const onSuccess = vi.fn(() => callOrder.push('onSuccess'))

    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-u-2' } },
      error: null,
    })

    renderRegisterView(container, { onSuccess })
    fillValidForm(container)
    container.querySelector('#pm-register-btn').click()

    await vi.waitUntil(() => onSuccess.mock.calls.length > 0, { timeout: 2000 })

    expect(callOrder.indexOf('signOut')).toBeLessThan(callOrder.indexOf('onSuccess'))
  })

  // ── Perfil con estado pendiente ──────────────────────────────────────────

  it('hace upsert en profiles con estado=pendiente', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    supabase.from.mockReturnValue({ upsert: upsertMock })
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-u-3' } },
      error: null,
    })

    renderRegisterView(container, { onSuccess: vi.fn() })
    fillValidForm(container)
    container.querySelector('#pm-register-btn').click()

    await vi.waitUntil(() => upsertMock.mock.calls.length > 0, { timeout: 2000 })

    const upsertArg = upsertMock.mock.calls[0][0]
    expect(upsertArg.estado).toBe('pendiente')
  })

  it('hace upsert en profiles con rol=maestro', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    supabase.from.mockReturnValue({ upsert: upsertMock })
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-u-4' } },
      error: null,
    })

    renderRegisterView(container, { onSuccess: vi.fn() })
    fillValidForm(container)
    container.querySelector('#pm-register-btn').click()

    await vi.waitUntil(() => upsertMock.mock.calls.length > 0, { timeout: 2000 })

    const upsertArg = upsertMock.mock.calls[0][0]
    expect(upsertArg.rol).toBe('maestro')
  })

  it('hace upsert con el ID del usuario retornado por signUp', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    supabase.from.mockReturnValue({ upsert: upsertMock })
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'uid-abc-123' } },
      error: null,
    })

    renderRegisterView(container, { onSuccess: vi.fn() })
    fillValidForm(container)
    container.querySelector('#pm-register-btn').click()

    await vi.waitUntil(() => upsertMock.mock.calls.length > 0, { timeout: 2000 })

    const upsertArg = upsertMock.mock.calls[0][0]
    expect(upsertArg.id).toBe('uid-abc-123')
  })

  // ── Flujo cuando signUp falla ────────────────────────────────────────────

  it('NO llama signOut si signUp devuelve error', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Email rate limit exceeded' },
    })

    renderRegisterView(container, { onSuccess: vi.fn() })
    fillValidForm(container)
    container.querySelector('#pm-register-btn').click()

    // Esperar a que el mensaje de error se muestre
    await vi.waitUntil(
      () => {
        const el = container.querySelector('#pm-reg-error')
        return el && el.textContent.length > 0
      },
      { timeout: 2000 },
    )

    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })

  it('NO llama onSuccess si signUp devuelve error', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Signup error' },
    })

    const onSuccess = vi.fn()
    renderRegisterView(container, { onSuccess })
    fillValidForm(container)
    container.querySelector('#pm-register-btn').click()

    await vi.waitUntil(
      () => {
        const el = container.querySelector('#pm-reg-error')
        return el && el.textContent.length > 0
      },
      { timeout: 2000 },
    )

    expect(onSuccess).not.toHaveBeenCalled()
  })

  // ── signUp sin user retornado ────────────────────────────────────────────

  it('llama onSuccess aunque signUp no retorne user (confirmación de email pendiente)', async () => {
    // Supabase puede retornar data.user = null cuando requiere confirmación de email
    supabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const onSuccess = vi.fn()
    renderRegisterView(container, { onSuccess })
    fillValidForm(container)
    container.querySelector('#pm-register-btn').click()

    await vi.waitUntil(() => onSuccess.mock.calls.length > 0, { timeout: 2000 })

    expect(onSuccess).toHaveBeenCalled()
    // signOut no se llama si no hay user (no hay sesión que cerrar)
    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })
})
