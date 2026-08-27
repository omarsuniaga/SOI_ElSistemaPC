import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../api/adminUsuariosApi.js', () => ({
  ROLES_USUARIO: ['admin', 'maestro', 'user', 'monitor'],
  cargarRolesSistema: vi.fn().mockResolvedValue(['admin', 'maestro', 'user', 'monitor']),
  crearUsuario: vi.fn(),
  listarUsuarios: vi.fn(),
  actualizarRolUsuario: vi.fn(),
  actualizarEstadoUsuario: vi.fn(),
  getPortalCatalog: vi.fn().mockResolvedValue([]),
  setUserPortales: vi.fn().mockResolvedValue({ success: true }),
  getAssignedPortalIds: vi.fn().mockResolvedValue([])
}))

vi.mock('../../../maestros/api/maestrosApi.js', () => ({
  obtenerMaestros: vi.fn(),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

import { renderGestionUsuariosView } from '../gestionUsuariosView.js'
import { crearUsuario, listarUsuarios } from '../../api/adminUsuariosApi.js'
import { obtenerMaestros } from '../../../maestros/api/maestrosApi.js'
import { AppToast } from '../../../../shared/components/AppToast.js'

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('gestionUsuariosView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    container = document.createElement('div')
    document.body.appendChild(container)

    obtenerMaestros.mockResolvedValue([
      {
        id: 'm1',
        nombre: 'Ana Pérez',
        email: 'ana@soi.org',
        user_id: null,
        instrumento: 'Violín',
      },
      {
        id: 'm2',
        nombre: 'Luis Gómez',
        email: 'luis@soi.org',
        user_id: 'auth-2',
        instrumento: 'Viola',
      },
    ])

    listarUsuarios.mockResolvedValue([
      {
        id: 'u1',
        email: 'admin@soi.org',
        nombre_completo: 'Admin General',
        rol: 'admin',
        estado: 'activo',
        portales_asignados: []
      },
    ])
  })

  afterEach(() => {
    container?.remove()
  })

  it('autocompleta nombre, correo y rol al escoger un maestro', async () => {
    await renderGestionUsuariosView(container)
    await flush()

    const select = container.querySelector('#gu-maestro-select')
    select.value = 'm1'
    select.dispatchEvent(new Event('change'))

    expect(container.querySelector('#gu-nombre').value).toBe('Ana Pérez')
    expect(container.querySelector('#gu-email').value).toBe('ana@soi.org')
    expect(container.querySelector('#gu-rol').value).toBe('maestro')
  })

  it('genera contraseña automática y permite regenerarla', async () => {
    await renderGestionUsuariosView(container)
    await flush()

    const passInput = container.querySelector('#gu-password')
    const firstPass = passInput.value
    expect(firstPass).toHaveLength(12)

    container.querySelector('#gu-regenerate-pass').click()
    const secondPass = passInput.value
    expect(secondPass).toHaveLength(12)
    expect(secondPass).not.toBe(firstPass)
  })

  it('crea el usuario, muestra las credenciales temporales y refresca el listado', async () => {
    crearUsuario.mockResolvedValue({
      id: 'u2',
      email: 'ana@soi.org',
      rol: 'maestro',
      estado: 'activo',
      portalesResult: { success: true, assigned_count: 1 }
    })

    await renderGestionUsuariosView(container)
    await flush()

    const select = container.querySelector('#gu-maestro-select')
    select.value = 'm1'
    select.dispatchEvent(new Event('change'))

    const form = container.querySelector('#gu-form')
    form.dispatchEvent(new Event('submit'))
    await flush()

    expect(crearUsuario).toHaveBeenCalledWith({
      nombre: 'Ana Pérez',
      email: 'ana@soi.org',
      password: expect.any(String),
      rol: 'maestro',
      portales: expect.any(Array),
    })

    expect(AppToast.success).toHaveBeenCalledWith(
      expect.stringContaining('Usuario ana@soi.org creado como Maestro'),
    )

    const listText = container.querySelector('#gu-credenciales-list').textContent
    expect(listText).toContain('ana@soi.org')
  })
})
