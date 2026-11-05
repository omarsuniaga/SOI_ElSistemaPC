import { describe, it, expect, vi } from 'vitest'
vi.mock('../../../shared/components/AppModal.js', () => ({ AppModal: { open: vi.fn(), showLoading: vi.fn(), close: vi.fn() } }))
vi.mock('../../../shared/components/AppToast.js', () => ({ AppToast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../api/alumnosApi.js', () => ({ inactivarAlumno: vi.fn(), verificarEliminacionAlumno: vi.fn(async () => ({ activeClasses: [] })) }))
import { AppModal } from '../../../shared/components/AppModal.js'
import { inactivarAlumno } from '../api/alumnosApi.js'
import { AlumnoDeleteModal } from '../components/AlumnoDeleteModal.js'

describe('inactivation reason', () => {
  it('requires a reason and sends it with the administrative decision', async () => {
    await AlumnoDeleteModal.open({ alumnoId: 'a1', alumnoNombre: 'Alumno Prueba' })
    const options = AppModal.open.mock.calls.at(-1)[0]
    const body = document.createElement('div')
    body.innerHTML = options.body
    expect(await options.onSave(body)).toBe(false)
    expect(inactivarAlumno).not.toHaveBeenCalled()
    body.querySelector('textarea').value = 'Retiro solicitado por su representante'
    expect(await options.onSave(body)).toBe(true)
    expect(inactivarAlumno).toHaveBeenCalledWith('a1', { motivo: 'Retiro solicitado por su representante' })
  })
})
