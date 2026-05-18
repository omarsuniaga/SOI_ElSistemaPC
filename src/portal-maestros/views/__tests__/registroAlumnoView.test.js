import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Mock dependencies ─────────────────────────────────────────
vi.mock('../../utils/portalUtils.js', () => ({
  escHTML: (s) => s || '',
  getInitials: () => 'XX',
}))

vi.mock('../../services/permisoService.js', () => ({
  getPermisos: vi.fn(),
}))

vi.mock('../../auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(),
}))

vi.mock('../../../modules/alumnos/api/alumnosApi.js', () => ({
  crearAlumno: vi.fn(),
  validarEmail: vi.fn(),
  validarCedula: vi.fn(),
}))

vi.mock('../../services/maestroDataService.js', () => ({
  getMisClases: vi.fn(),
}))

vi.mock('../../../modules/clases/api/clasesApi.js', () => ({
  inscribirAlumnoEnClase: vi.fn(),
}))

import { getPermisos } from '../../services/permisoService.js'
import { getMaestroLocal } from '../../auth/maestroAuth.js'
import { crearAlumno, validarEmail, validarCedula } from '../../../modules/alumnos/api/alumnosApi.js'
import { getMisClases } from '../../services/maestroDataService.js'
import { inscribirAlumnoEnClase } from '../../../modules/clases/api/clasesApi.js'
import { renderRegistroAlumnoView } from '../registroAlumnoView.js'

const MOCK_MAESTRO = { id: 'm1', nombre_completo: 'Profesor Test' }
const MOCK_PERMISOS = { puede_registrar_alumnos: true, puede_inscribir_clases: true }
const MOCK_CLASES = [
  { id: 'c1', nombre: 'Grupo A' },
  { id: 'c2', nombre: 'Grupo B' },
]

describe('registroAlumnoView', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()
    getMaestroLocal.mockReturnValue(MOCK_MAESTRO)
    getPermisos.mockResolvedValue(MOCK_PERMISOS)
    getMisClases.mockResolvedValue(MOCK_CLASES)
    crearAlumno.mockResolvedValue({ id: 'new_001', nombre: 'Alumno Test' })
    validarEmail.mockResolvedValue(false)
    validarCedula.mockResolvedValue(false)
    inscribirAlumnoEnClase.mockResolvedValue({ ok: true })
    // Mock window dispatch for toast events
    window.dispatchEvent = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  // ─── Issue 3: Form rendering ─────────────────────────────────
  it('renders the registration form with all required fields', async () => {
    await renderRegistroAlumnoView(container)

    expect(container.querySelector('#reg-nombre')).toBeTruthy()
    expect(container.querySelector('#reg-fecha-nac')).toBeTruthy()
    expect(container.querySelector('#reg-instrumento')).toBeTruthy()
    expect(container.querySelector('#reg-rep-nombre')).toBeTruthy()
    expect(container.querySelector('#reg-rep-tlf')).toBeTruthy()
    expect(container.querySelector('#reg-rep-cedula')).toBeTruthy()
    expect(container.querySelector('#reg-rep-email')).toBeTruthy()
    expect(container.querySelector('#reg-direccion')).toBeTruthy()
    expect(container.querySelector('#reg-clase')).toBeTruthy()
    expect(container.querySelector('#btn-registrar-alumno')).toBeTruthy()
    expect(container.querySelector('#btn-cancelar-registro')).toBeTruthy()
  })

  it('renders clase dropdown options from getMisClases', async () => {
    await renderRegistroAlumnoView(container)

    const select = container.querySelector('#reg-clase')
    expect(select).toBeTruthy()
    // Should have 3 options: "Sin clase" + 2 clases
    expect(select.options.length).toBe(3)
    expect(select.options[1].text).toContain('Grupo A')
    expect(select.options[2].text).toContain('Grupo B')
  })

  it('shows "Sin sesión" when no maestro is logged in', async () => {
    getMaestroLocal.mockReturnValue(null)

    await renderRegistroAlumnoView(container)

    expect(container.textContent).toContain('No hay sesión activa')
  })

  // ─── Issue 3: Permission check ───────────────────────────────
  it('shows "Sin Permiso" when puede_registrar_alumnos is false', async () => {
    getPermisos.mockResolvedValue({ ...MOCK_PERMISOS, puede_registrar_alumnos: false })

    await renderRegistroAlumnoView(container)

    expect(container.textContent).toContain('Sin Permiso')
    expect(container.querySelector('#btn-registrar-alumno')).toBeFalsy()
  })

  it('calls getPermisos with the maestro id', async () => {
    await renderRegistroAlumnoView(container)

    expect(getPermisos).toHaveBeenCalledWith('m1')
  })

  // ─── Issue 3: Validation errors ──────────────────────────────
  it('shows validation error when nombre is empty on submit', async () => {
    await renderRegistroAlumnoView(container)

    // Fill only required fields but leave nombre empty
    document.getElementById('reg-fecha-nac').value = '2020-01-15'
    document.getElementById('reg-instrumento').value = 'Violín'
    document.getElementById('reg-rep-nombre').value = 'Representante Test'
    document.getElementById('reg-rep-tlf').value = '809-555-0101'

    const btn = document.getElementById('btn-registrar-alumno')
    btn.click()

    // Should not call crearAlumno
    expect(crearAlumno).not.toHaveBeenCalled()
    // Should show inline error instead of toast
    const nombreInput = document.getElementById('reg-nombre')
    expect(nombreInput.getAttribute('aria-invalid')).toBe('true')
    expect(nombreInput.getAttribute('aria-describedby')).toBe('reg-nombre-error')
    const errorEl = document.getElementById('reg-nombre-error')
    expect(errorEl).toBeTruthy()
    expect(errorEl.textContent).toContain('obligatorio')
  })

  // ─── Issue 3: Submit calls crearAlumno ───────────────────────
  it('calls crearAlumno with form data on valid submit', async () => {
    await renderRegistroAlumnoView(container)

    document.getElementById('reg-nombre').value = 'Juan Pérez'
    document.getElementById('reg-fecha-nac').value = '2020-01-15'
    document.getElementById('reg-instrumento').value = 'Violín'
    document.getElementById('reg-rep-nombre').value = 'María Pérez'
    document.getElementById('reg-rep-tlf').value = '809-555-0101'

    const btn = document.getElementById('btn-registrar-alumno')
    btn.click()

    // Allow microtasks to complete
    await vi.waitUntil(() => crearAlumno.mock.calls.length > 0, { timeout: 1000 })

    expect(crearAlumno).toHaveBeenCalledTimes(1)
    const callArg = crearAlumno.mock.calls[0][0]
    expect(callArg.nombre).toBe('Juan Pérez')
    expect(callArg.representante_nombre).toBe('María Pérez')
    expect(callArg.representante_tlf).toBe('809-555-0101')
  })

  // ─── Issue 1 (REG-04): Duplicate detection ──────────────────
  it('calls validarEmail before crearAlumno and prevents submit when email exists', async () => {
    validarEmail.mockResolvedValue(true)

    await renderRegistroAlumnoView(container)

    document.getElementById('reg-nombre').value = 'Juan Pérez'
    document.getElementById('reg-fecha-nac').value = '2020-01-15'
    document.getElementById('reg-instrumento').value = 'Violín'
    document.getElementById('reg-rep-nombre').value = 'María Pérez'
    document.getElementById('reg-rep-tlf').value = '809-555-0101'
    document.getElementById('reg-rep-email').value = 'existente@test.com'

    const btn = document.getElementById('btn-registrar-alumno')
    btn.click()

    await vi.waitUntil(() => validarEmail.mock.calls.length > 0, { timeout: 1000 })

    expect(validarEmail).toHaveBeenCalledWith('existente@test.com')
    expect(crearAlumno).not.toHaveBeenCalled()
    // Should show inline error (toast)
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          message: expect.stringContaining('correo'),
        }),
      })
    )
  })

  it('calls validarCedula before crearAlumno and prevents submit when cedula exists', async () => {
    validarCedula.mockResolvedValue(true)

    await renderRegistroAlumnoView(container)

    document.getElementById('reg-nombre').value = 'Juan Pérez'
    document.getElementById('reg-fecha-nac').value = '2020-01-15'
    document.getElementById('reg-instrumento').value = 'Violín'
    document.getElementById('reg-rep-nombre').value = 'María Pérez'
    document.getElementById('reg-rep-tlf').value = '809-555-0101'
    document.getElementById('reg-rep-cedula').value = '001-0000000-1'

    const btn = document.getElementById('btn-registrar-alumno')
    btn.click()

    await vi.waitUntil(() => validarCedula.mock.calls.length > 0, { timeout: 1000 })

    expect(validarCedula).toHaveBeenCalledWith('001-0000000-1')
    expect(crearAlumno).not.toHaveBeenCalled()
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          message: expect.stringContaining('cédula'),
        }),
      })
    )
  })

  it('calls both validarEmail and validarCedula on submit with both fields filled', async () => {
    await renderRegistroAlumnoView(container)

    document.getElementById('reg-nombre').value = 'Juan Pérez'
    document.getElementById('reg-fecha-nac').value = '2020-01-15'
    document.getElementById('reg-instrumento').value = 'Violín'
    document.getElementById('reg-rep-nombre').value = 'María Pérez'
    document.getElementById('reg-rep-tlf').value = '809-555-0101'
    document.getElementById('reg-rep-cedula').value = '001-0000000-1'
    document.getElementById('reg-rep-email').value = 'nuevo@test.com'

    const btn = document.getElementById('btn-registrar-alumno')
    btn.click()

    await vi.waitUntil(() => crearAlumno.mock.calls.length > 0, { timeout: 1000 })

    expect(validarEmail).toHaveBeenCalledWith('nuevo@test.com')
    expect(validarCedula).toHaveBeenCalledWith('001-0000000-1')
    expect(crearAlumno).toHaveBeenCalledTimes(1)
  })

  it('does not call validarEmail when email field is empty', async () => {
    await renderRegistroAlumnoView(container)

    document.getElementById('reg-nombre').value = 'Juan Pérez'
    document.getElementById('reg-fecha-nac').value = '2020-01-15'
    document.getElementById('reg-instrumento').value = 'Violín'
    document.getElementById('reg-rep-nombre').value = 'María Pérez'
    document.getElementById('reg-rep-tlf').value = '809-555-0101'

    const btn = document.getElementById('btn-registrar-alumno')
    btn.click()

    await vi.waitUntil(() => crearAlumno.mock.calls.length > 0, { timeout: 1000 })

    expect(validarEmail).not.toHaveBeenCalled()
    expect(crearAlumno).toHaveBeenCalledTimes(1)
  })

  it('does not call validarCedula when cedula field is empty', async () => {
    await renderRegistroAlumnoView(container)

    document.getElementById('reg-nombre').value = 'Juan Pérez'
    document.getElementById('reg-fecha-nac').value = '2020-01-15'
    document.getElementById('reg-instrumento').value = 'Violín'
    document.getElementById('reg-rep-nombre').value = 'María Pérez'
    document.getElementById('reg-rep-tlf').value = '809-555-0101'

    const btn = document.getElementById('btn-registrar-alumno')
    btn.click()

    await vi.waitUntil(() => crearAlumno.mock.calls.length > 0, { timeout: 1000 })

    expect(validarCedula).not.toHaveBeenCalled()
    expect(crearAlumno).toHaveBeenCalledTimes(1)
  })

  // ─── C1: Inscription feedback tests ─────────────────────────

  async function submitWithClase(claseId = 'c1') {
    document.getElementById('reg-nombre').value = 'Juan Pérez'
    document.getElementById('reg-fecha-nac').value = '2020-01-15'
    document.getElementById('reg-instrumento').value = 'Violín'
    document.getElementById('reg-rep-nombre').value = 'María Pérez'
    document.getElementById('reg-rep-tlf').value = '809-555-0101'
    document.getElementById('reg-clase').value = claseId
    document.getElementById('btn-registrar-alumno').click()
  }

  it('C1-happy: alumno created and inscribed shows success state without error card', async () => {
    inscribirAlumnoEnClase.mockResolvedValue({ ok: true })
    await renderRegistroAlumnoView(container)
    await submitWithClase('c1')

    await vi.waitUntil(() => window.dispatchEvent.mock.calls.length > 0, { timeout: 1000 })

    expect(crearAlumno).toHaveBeenCalledTimes(1)
    expect(inscribirAlumnoEnClase).toHaveBeenCalledWith('c1', 'new_001')
    // No InscripcionFailedCard rendered
    expect(container.querySelector('[data-testid="inscripcion-failed-card"]')).toBeFalsy()
    // Success toast dispatched
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ type: 'success' })
      })
    )
  })

  it('C1-fail: inscription throws shows InscripcionFailedCard with retry button', async () => {
    inscribirAlumnoEnClase.mockRejectedValue(new Error('network error'))
    await renderRegistroAlumnoView(container)
    await submitWithClase('c1')

    await vi.waitUntil(
      () => container.querySelector('[data-testid="inscripcion-failed-card"]'),
      { timeout: 1000 }
    )

    const card = container.querySelector('[data-testid="inscripcion-failed-card"]')
    expect(card).toBeTruthy()
    expect(card.textContent).toContain('no se pudo asignar a la clase')
    expect(container.querySelector('[data-testid="btn-retry-inscripcion"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="btn-continuar-sin-clase"]')).toBeTruthy()
    // crearAlumno was called — alumno exists
    expect(crearAlumno).toHaveBeenCalledTimes(1)
  })

  it('C1-retry-success: retry calls inscribirAlumnoEnClase with saved alumnoId, NOT re-calling crearAlumno', async () => {
    inscribirAlumnoEnClase
      .mockRejectedValueOnce(new Error('first attempt failed'))
      .mockResolvedValueOnce({ ok: true })

    await renderRegistroAlumnoView(container)
    await submitWithClase('c1')

    await vi.waitUntil(
      () => container.querySelector('[data-testid="btn-retry-inscripcion"]'),
      { timeout: 1000 }
    )

    // Click retry
    container.querySelector('[data-testid="btn-retry-inscripcion"]').click()

    await vi.waitUntil(() => inscribirAlumnoEnClase.mock.calls.length >= 2, { timeout: 1000 })

    // crearAlumno only called once (NOT on retry)
    expect(crearAlumno).toHaveBeenCalledTimes(1)
    // inscribirAlumnoEnClase called twice, second with same ids
    expect(inscribirAlumnoEnClase).toHaveBeenCalledTimes(2)
    expect(inscribirAlumnoEnClase.mock.calls[1]).toEqual(['c1', 'new_001'])
    // Error card dismissed after success
    await vi.waitUntil(
      () => !container.querySelector('[data-testid="inscripcion-failed-card"]'),
      { timeout: 1000 }
    )
  })

  it('C1-retry-fail: retry also throws, still shows error card, does not loop or crash', async () => {
    inscribirAlumnoEnClase.mockRejectedValue(new Error('persistent error'))

    await renderRegistroAlumnoView(container)
    await submitWithClase('c1')

    await vi.waitUntil(
      () => container.querySelector('[data-testid="btn-retry-inscripcion"]'),
      { timeout: 1000 }
    )

    container.querySelector('[data-testid="btn-retry-inscripcion"]').click()

    await vi.waitUntil(() => inscribirAlumnoEnClase.mock.calls.length >= 2, { timeout: 1000 })

    // Still showing error card
    expect(container.querySelector('[data-testid="inscripcion-failed-card"]')).toBeTruthy()
    // No crash — crearAlumno still called only once
    expect(crearAlumno).toHaveBeenCalledTimes(1)
  })

  it('C1-continue: clicking "Continuar sin clase" dismisses card and shows success state', async () => {
    inscribirAlumnoEnClase.mockRejectedValue(new Error('fail'))

    await renderRegistroAlumnoView(container)
    await submitWithClase('c1')

    await vi.waitUntil(
      () => container.querySelector('[data-testid="btn-continuar-sin-clase"]'),
      { timeout: 1000 }
    )

    container.querySelector('[data-testid="btn-continuar-sin-clase"]').click()

    await vi.waitUntil(
      () => !container.querySelector('[data-testid="inscripcion-failed-card"]'),
      { timeout: 1000 }
    )

    expect(container.querySelector('[data-testid="inscripcion-failed-card"]')).toBeFalsy()
    // Success toast should be dispatched
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ type: 'success' })
      })
    )
  })

  it('C1-no-clase: no claseId in form never calls inscribirAlumnoEnClase', async () => {
    await renderRegistroAlumnoView(container)
    await submitWithClase('') // empty claseId = no class selected

    await vi.waitUntil(() => crearAlumno.mock.calls.length > 0, { timeout: 1000 })
    // Give async ops time to settle
    await new Promise(r => setTimeout(r, 50))

    expect(crearAlumno).toHaveBeenCalledTimes(1)
    expect(inscribirAlumnoEnClase).not.toHaveBeenCalled()
    expect(container.querySelector('[data-testid="inscripcion-failed-card"]')).toBeFalsy()
  })
})
