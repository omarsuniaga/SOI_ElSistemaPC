/**
 * pendingApprovalView.test.js
 *
 * Verifica el renderizado y la lógica de verificación de estado de la
 * pantalla de aprobación pendiente.
 *
 * Casos cubiertos:
 *   - Renderizado de los 3 pasos del proceso
 *   - Botón "Verificar estado" consulta Supabase
 *   - Respuestas: aprobado → mensaje + paso completado, pendiente → en revisión,
 *     rechazado → error con contacto admin
 *   - Sin sesión activa → mensaje de error apropiado
 *   - Error de DB → mensaje + botón queda habilitado
 *   - Botón "Volver al login" llama onBackToLogin
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../../../lib/supabaseClient.js'
import { renderPendingApprovalView } from '../pendingApprovalView.js'

// ── Helpers ────────────────────────────────────────────────────────────────

function mockSession(userId = 'u-pending') {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: { user: { id: userId } } },
  })
}

function mockNoSession() {
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
}

function mockProfile(estado) {
  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: { estado, rol: 'maestro', nombre_completo: 'Test User' },
      error: null,
    }),
  })
}

function mockProfileError() {
  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
  })
}

async function waitForStatusMsg(container, timeout = 2000) {
  await vi.waitUntil(
    () => {
      const msg = container.querySelector('#pm-status-msg')
      return msg && msg.textContent.length > 0
    },
    { timeout },
  )
  return container.querySelector('#pm-status-msg')
}

// ── Suite: renderizado ─────────────────────────────────────────────────────

describe('pendingApprovalView — renderizado', () => {
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

  it('renderiza el botón de verificar estado', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    expect(container.querySelector('#pm-check-status-btn')).toBeTruthy()
  })

  it('renderiza el botón de volver al login', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    expect(container.querySelector('#pm-back-login-btn')).toBeTruthy()
  })

  it('muestra exactamente 3 pasos del proceso de aprobación', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    expect(container.querySelectorAll('.pm-approval-step').length).toBe(3)
  })

  it('paso 1 (registro) está marcado como completado', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    const steps = container.querySelectorAll('.pm-approval-step')
    expect(steps[0].classList.contains('pm-approval-step--done')).toBe(true)
  })

  it('paso 2 (espera admin) está marcado como activo', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    expect(container.querySelector('#pm-step-waiting')
      ?.classList.contains('pm-approval-step--active')).toBe(true)
  })

  it('paso 3 (acceso habilitado) está marcado como pendiente', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    const steps = container.querySelectorAll('.pm-approval-step')
    expect(steps[2].classList.contains('pm-approval-step--pending')).toBe(true)
  })

  it('el texto menciona aprobación o espera', () => {
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    expect(container.textContent.toLowerCase()).toMatch(/aprobaci[oó]n|espera|pendiente/)
  })
})

// ── Suite: botón volver al login ───────────────────────────────────────────

describe('pendingApprovalView — botón volver al login', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => { document.body.removeChild(container); vi.restoreAllMocks() })

  it('llama onBackToLogin al presionar volver', () => {
    const onBackToLogin = vi.fn()
    renderPendingApprovalView(container, { onBackToLogin })
    container.querySelector('#pm-back-login-btn').click()
    expect(onBackToLogin).toHaveBeenCalledOnce()
  })
})

// ── Suite: sin sesión activa ───────────────────────────────────────────────

describe('pendingApprovalView — verificar estado sin sesión', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => { document.body.removeChild(container); vi.restoreAllMocks() })

  it('muestra error cuando no hay sesión de Supabase', async () => {
    mockNoSession()
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    container.querySelector('#pm-check-status-btn').click()

    const msg = await waitForStatusMsg(container)
    expect(msg.textContent.toLowerCase()).toMatch(/no hay sesi[oó]n|iniciar sesi[oó]n/)
  })
})

// ── Suite: estado pendiente ────────────────────────────────────────────────

describe('pendingApprovalView — verificar estado pendiente', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => { document.body.removeChild(container); vi.restoreAllMocks() })

  it('muestra "en revisión" cuando estado sigue pendiente', async () => {
    mockSession()
    mockProfile('pendiente')
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    container.querySelector('#pm-check-status-btn').click()

    const msg = await waitForStatusMsg(container)
    expect(msg.textContent.toLowerCase()).toMatch(/revisi[oó]n|pendiente|espera/)
  })

  it('el botón queda habilitado después de verificar estado pendiente', async () => {
    mockSession()
    mockProfile('pendiente')
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    container.querySelector('#pm-check-status-btn').click()

    await waitForStatusMsg(container)
    expect(container.querySelector('#pm-check-status-btn').disabled).toBe(false)
  })
})

// ── Suite: estado aprobado ─────────────────────────────────────────────────

describe('pendingApprovalView — verificar estado aprobado', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() })
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('muestra mensaje de aprobación cuando estado=activo', async () => {
    mockSession()
    mockProfile('activo')
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    container.querySelector('#pm-check-status-btn').click()

    const msg = await waitForStatusMsg(container)
    expect(msg.textContent.toLowerCase()).toMatch(/aprobad[ao]|ingresando/)
  })

  it('actualiza el paso de espera a completado cuando estado=activo', async () => {
    mockSession()
    mockProfile('activo')
    vi.useFakeTimers()
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    container.querySelector('#pm-check-status-btn').click()

    await waitForStatusMsg(container)

    const waitingStep = container.querySelector('#pm-step-waiting')
    expect(waitingStep?.classList.contains('pm-approval-step--done')).toBe(true)
    vi.useRealTimers()
  })
})

// ── Suite: estado rechazado ────────────────────────────────────────────────

describe('pendingApprovalView — verificar estado rechazado', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => { document.body.removeChild(container); vi.restoreAllMocks() })

  it('muestra mensaje de rechazo con referencia al administrador', async () => {
    mockSession()
    mockProfile('rechazado')
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    container.querySelector('#pm-check-status-btn').click()

    const msg = await waitForStatusMsg(container)
    expect(msg.textContent.toLowerCase()).toMatch(/rechazad[ao]|administrador/)
  })
})

// ── Suite: error de DB ─────────────────────────────────────────────────────

describe('pendingApprovalView — error al verificar estado', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
  })

  afterEach(() => { document.body.removeChild(container); vi.restoreAllMocks() })

  it('muestra mensaje de error cuando la consulta a DB falla', async () => {
    mockSession()
    mockProfileError()
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    container.querySelector('#pm-check-status-btn').click()

    const msg = await waitForStatusMsg(container)
    expect(msg.textContent.toLowerCase()).toMatch(/no se pudo|verific|error/)
  })

  it('el botón queda habilitado después de un error de DB', async () => {
    mockSession()
    mockProfileError()
    renderPendingApprovalView(container, { onBackToLogin: vi.fn() })
    container.querySelector('#pm-check-status-btn').click()

    await waitForStatusMsg(container)
    expect(container.querySelector('#pm-check-status-btn').disabled).toBe(false)
  })
})
