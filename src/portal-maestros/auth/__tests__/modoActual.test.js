import { beforeEach, describe, expect, it } from 'vitest'
import { getModoActual, PM_MODO_KEY } from '../../utils/modoUtils.js'

describe('getModoActual — lógica del switcher de modo admin/maestro', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('maestro normal (sin es_admin) siempre devuelve "maestro"', () => {
    expect(getModoActual({ es_admin: false, es_maestro: true })).toBe('maestro')
    expect(getModoActual({ nombre_completo: 'Prof X' })).toBe('maestro')
    expect(getModoActual(null)).toBe('maestro')
    expect(getModoActual(undefined)).toBe('maestro')
  })

  it('admin puro (sin es_maestro) siempre devuelve "admin"', () => {
    expect(getModoActual({ es_admin: true })).toBe('admin')
    expect(getModoActual({ es_admin: true, es_maestro: false })).toBe('admin')
  })

  it('admin+maestro sin preferencia guardada devuelve "admin" por defecto', () => {
    expect(getModoActual({ es_admin: true, es_maestro: true })).toBe('admin')
  })

  it('admin+maestro con pm-modo="maestro" guardado devuelve "maestro"', () => {
    localStorage.setItem(PM_MODO_KEY, 'maestro')
    expect(getModoActual({ es_admin: true, es_maestro: true })).toBe('maestro')
  })

  it('admin+maestro con pm-modo="admin" guardado devuelve "admin"', () => {
    localStorage.setItem(PM_MODO_KEY, 'admin')
    expect(getModoActual({ es_admin: true, es_maestro: true })).toBe('admin')
  })

  it('usuarios sin ambos roles ignoran el valor guardado en localStorage', () => {
    localStorage.setItem(PM_MODO_KEY, 'maestro')
    // Admin puro → siempre admin, ignora localStorage
    expect(getModoActual({ es_admin: true, es_maestro: false })).toBe('admin')
    // Maestro puro → siempre maestro, ignora localStorage
    expect(getModoActual({ es_admin: false, es_maestro: true })).toBe('maestro')
  })

  it('cambiar localStorage entre llamadas refleja el nuevo modo', () => {
    const maestro = { es_admin: true, es_maestro: true }

    localStorage.setItem(PM_MODO_KEY, 'maestro')
    expect(getModoActual(maestro)).toBe('maestro')

    localStorage.setItem(PM_MODO_KEY, 'admin')
    expect(getModoActual(maestro)).toBe('admin')
  })
})
