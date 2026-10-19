import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderNavigationSettings } from '../navigationSettings.js'
import { getClassAutoNavigation } from '../../services/classAutoNavigation.js'

describe('Preferencia de apertura de clase', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('switch apagado por defecto, accesible y guardado inmediatamente al cambiar', () => {
    renderNavigationSettings(document.body, 'maestro-a')
    const toggle = document.querySelector('[role="switch"]')
    expect(toggle.checked).toBe(false)
    expect(toggle.labels[0].textContent).toContain('Abrir automáticamente la clase en curso')
    toggle.click()
    expect(getClassAutoNavigation('maestro-a')).toBe(true)
    expect(document.querySelector('[role="status"]').textContent).toContain('activada')
    document.body.innerHTML = ''
    renderNavigationSettings(document.body, 'maestro-a')
    expect(document.querySelector('[role="switch"]').checked).toBe(true)
    document.querySelector('[role="switch"]').click()
    expect(getClassAutoNavigation('maestro-a')).toBe(false)
  })

  it('no comparte la preferencia entre cuentas del mismo dispositivo', () => {
    renderNavigationSettings(document.body, 'maestro-a')
    document.querySelector('input').click()
    document.body.innerHTML = ''
    renderNavigationSettings(document.body, 'maestro-b')
    expect(document.querySelector('input').checked).toBe(false)
    expect(getClassAutoNavigation('maestro-a')).toBe(true)
  })

  it('si el almacenamiento falla informa el error y no confirma un guardado inexistente', () => {
    renderNavigationSettings(document.body, 'maestro-a')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    document.querySelector('input').click()
    expect(document.querySelector('input').checked).toBe(false)
    expect(document.querySelector('[role="status"]').textContent).toContain('No se pudo guardar')
  })
})
