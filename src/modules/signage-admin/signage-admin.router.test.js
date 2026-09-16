import { beforeEach, describe, expect, it, vi } from 'vitest'

const register = vi.fn()
vi.mock('../../core/router/router.js', () => ({
  router: { register },
}))

const { registerRoutesSignageAdmin } = await import('./signage-admin.router.js')

describe('signage-admin.router', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registra las rutas canónicas de cartelera y del editor de diapositivas con retrocompatibilidad', () => {
    registerRoutesSignageAdmin()
    expect(register).toHaveBeenCalledWith('cartelera', expect.any(Function))
    expect(register).toHaveBeenCalledWith('cartelera/diapositiva', expect.any(Function))
    expect(register).toHaveBeenCalledWith('cartelera/diapositiva/:id', expect.any(Function))
    expect(register).toHaveBeenCalledWith('cartelera-diapositiva', expect.any(Function))
    expect(register).toHaveBeenCalledWith('cartelera-diapositiva/:id', expect.any(Function))
    expect(register).toHaveBeenCalledWith('signage-pantalla', expect.any(Function))
    expect(register).toHaveBeenCalledWith('signage-slide', expect.any(Function))
    expect(register).toHaveBeenCalledWith('signage-slide/:id', expect.any(Function))
    expect(register).toHaveBeenCalledWith('signage-diapositiva', expect.any(Function))
    expect(register).toHaveBeenCalledWith('signage-diapositiva/:id', expect.any(Function))
  })
})
