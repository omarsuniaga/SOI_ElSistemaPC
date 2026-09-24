import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../api/permisosApi.js', () => ({
  obtenerPermisos: vi.fn(),
  actualizarPermiso: vi.fn(),
}))
vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../../../auth/hooks/useAuth.js', () => ({
  useAuth: { getUser: () => ({ id: 'admin-uuid', email: 'admin@soi.org', user_metadata: { full_name: 'Omar Admin' } }) },
}))

import { renderPermisosView } from '../permisosView.js'
import { obtenerPermisos, actualizarPermiso } from '../../api/permisosApi.js'
import { AppToast } from '../../../../shared/components/AppToast.js'

const flush = () => new Promise(r => setTimeout(r, 0))

function braylin(overrides = {}) {
  return {
    maestro_id: 'm-braylin',
    maestro_nombre: 'Braylin Perez',
    maestro_email: 'braylin@soi.org',
    maestro_activo: true,
    total_clases_asignadas: 2,
    clases_titular: 2,
    clases_suplente: 0,
    puede_registrar_alumnos: true,
    puede_inscribir_clases: true,
    puede_crear_clases: false,
    permisos: ['alumnos:create', 'registrar_alumnos', 'clases:enroll', 'inscribir_clases'],
    solicitudes: [],
    concedido_por: 'otro-admin',
    concedido_por_nombre: 'Iraima Giusti',
    actualizado_en: '2026-09-19T00:00:00Z',
    ...overrides,
  }
}

function toggle(container, field) {
  const input = container.querySelector(`.permiso-toggle[data-field="${field}"]`)
  input.checked = !input.checked
  input.dispatchEvent(new Event('change', { bubbles: true }))
  return input
}

describe('permisosView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => container.remove())

  it('muestra el nombre de quien concedió, no el UUID', async () => {
    obtenerPermisos.mockResolvedValue([braylin()])
    await renderPermisosView(container)
    expect(container.textContent).toContain('Por: Iraima Giusti')
    expect(container.textContent).not.toContain('otro-admin')
  })

  it('al revocar quita también el alias viejo que el portal de maestros acepta', async () => {
    obtenerPermisos.mockResolvedValue([braylin()])
    actualizarPermiso.mockResolvedValue({})
    await renderPermisosView(container)

    toggle(container, 'puede_registrar_alumnos')
    await flush()

    const [, changes] = actualizarPermiso.mock.calls[0]
    expect(changes.puede_registrar_alumnos).toBe(false)
    expect(changes.permisos).not.toContain('alumnos:create')
    expect(changes.permisos).not.toContain('registrar_alumnos')
    expect(changes.permisos).toEqual(expect.arrayContaining(['clases:enroll', 'inscribir_clases']))
  })

  it('al otorgar registra al admin real como concedente, nunca el texto "admin"', async () => {
    obtenerPermisos.mockResolvedValue([braylin({ puede_registrar_alumnos: false, permisos: ['clases:enroll'] })])
    actualizarPermiso.mockResolvedValue({})
    await renderPermisosView(container)

    toggle(container, 'puede_registrar_alumnos')
    await flush()

    const [, changes] = actualizarPermiso.mock.calls[0]
    expect(changes.concedido_por).toBe('admin-uuid')
    expect(changes.permisos).toContain('alumnos:create')
    expect(container.textContent).toContain('Por: Omar Admin')
  })

  it('si el guardado falla, no deja el estado local modificado', async () => {
    obtenerPermisos.mockResolvedValue([braylin()])
    actualizarPermiso.mockRejectedValue(new Error('RLS'))
    await renderPermisosView(container)

    const input = toggle(container, 'puede_registrar_alumnos')
    await flush()
    expect(input.checked).toBe(true)
    expect(AppToast.error).toHaveBeenCalled()

    // Un segundo intento debe partir del estado original, con todas las claves.
    actualizarPermiso.mockResolvedValue({})
    toggle(container, 'puede_inscribir_clases')
    await flush()
    const [, changes] = actualizarPermiso.mock.calls[1]
    expect(changes.permisos).toEqual(expect.arrayContaining(['alumnos:create', 'registrar_alumnos']))
  })

  it('escapa las iniciales del avatar', async () => {
    obtenerPermisos.mockResolvedValue([braylin({ maestro_nombre: '<b> xavier' })])
    await renderPermisosView(container)
    expect(container.querySelector('.avatar-compact').innerHTML).toBe('&lt;X')
  })
})
