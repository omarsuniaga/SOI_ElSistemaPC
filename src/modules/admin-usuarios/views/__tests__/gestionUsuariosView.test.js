import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../api/adminUsuariosApi.js', () => ({
  ROLES_USUARIO: ['admin', 'maestro', 'user', 'monitor'],
  crearUsuario: vi.fn(),
  listarUsuarios: vi.fn(),
}))

vi.mock('../../../maestros/api/maestrosApi.js', () => ({
  obtenerMaestros: vi.fn(),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: {
    success: vi.fn(),
    error: vi.fn(),
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
      },
      {
        id: 'u2',
        email: 'ana@soi.org',
        nombre_completo: 'Ana Pérez',
        rol: 'maestro',
        estado: 'activo',
      },
    ])
  })

  afterEach(() => {
    container.remove()
    document.getElementById('gu-styles')?.remove()
  })

  it('autocompleta nombre, correo y rol al escoger un maestro', async () => {
    await renderGestionUsuariosView(container)

    const select = container.querySelector('#gu-maestro-select')
    select.value = 'm1'
    select.dispatchEvent(new Event('change'))

    expect(container.querySelector('#gu-nombre').value).toBe('Ana Pérez')
    expect(container.querySelector('#gu-email').value).toBe('ana@soi.org')
    expect(container.querySelector('#gu-rol').value).toBe('maestro')

    const usedOption = Array.from(select.options).find((option) => option.value === 'm2')
    expect(usedOption.disabled).toBe(true)
  })

  it('genera contraseña automática y permite regenerarla', async () => {
    await renderGestionUsuariosView(container)

    const passwordInput = container.querySelector('#gu-password')
    const regenerateBtn = container.querySelector('#gu-regenerate-pass')
    const initialPassword = passwordInput.value

    expect(initialPassword.length).toBeGreaterThanOrEqual(10)
    expect(passwordInput.readOnly).toBe(true)

    regenerateBtn.click()

    expect(passwordInput.value).not.toBe(initialPassword)

    const manualRadio = container.querySelector('#gu-password-mode-manual')
    manualRadio.checked = true
    manualRadio.dispatchEvent(new Event('change'))

    expect(passwordInput.readOnly).toBe(false)
  })

  it('crea el usuario, muestra las credenciales temporales y refresca el listado', async () => {
    crearUsuario.mockResolvedValue({
      id: 'u3',
      email: 'nuevo@soi.org',
      rol: 'maestro',
      estado: 'activo',
    })

    listarUsuarios
      .mockResolvedValueOnce([
        {
          id: 'u1',
          email: 'admin@soi.org',
          nombre_completo: 'Admin General',
          rol: 'admin',
          estado: 'activo',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'u1',
          email: 'admin@soi.org',
          nombre_completo: 'Admin General',
          rol: 'admin',
          estado: 'activo',
        },
        {
          id: 'u3',
          email: 'nuevo@soi.org',
          nombre_completo: 'Nuevo Usuario',
          rol: 'maestro',
          estado: 'activo',
        },
      ])

    await renderGestionUsuariosView(container)

    const modeManual = container.querySelector('#gu-source-mode-manual')
    modeManual.checked = true
    modeManual.dispatchEvent(new Event('change'))

    container.querySelector('#gu-nombre').value = 'Nuevo Usuario'
    container.querySelector('#gu-email').value = 'nuevo@soi.org'
    container.querySelector('#gu-rol').value = 'maestro'

    const passwordInput = container.querySelector('#gu-password')
    const password = passwordInput.value

    container.querySelector('#gu-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await flush()
    await flush()

    expect(crearUsuario).toHaveBeenCalledWith({
      nombre: 'Nuevo Usuario',
      email: 'nuevo@soi.org',
      password,
      rol: 'maestro',
    })

    expect(AppToast.success).toHaveBeenCalled()
    expect(container.querySelector('#gu-credenciales-list').textContent).toContain('nuevo@soi.org')
    expect(container.querySelector('#gu-credenciales-list').textContent).toContain(password)
    expect(listarUsuarios).toHaveBeenCalledTimes(2)
  })
})
