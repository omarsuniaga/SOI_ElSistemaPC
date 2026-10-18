import { describe, expect, it, vi } from 'vitest'
import { canAccess } from '../../../core/auth/accessControl.js'

const register = vi.fn()
vi.mock('../../../core/router/router.js', () => ({ router: { register } }))
const { registerRoutesDocumentosPublicos } = await import('../documentos-publicos.router.js')

describe('documentos-publicos routing y acceso', () => {
  it('registra la ruta administrativa', () => {
    registerRoutesDocumentosPublicos()
    expect(register).toHaveBeenCalledWith('documentos-publicos', expect.any(Function))
  })
  it('la ruta es solo para administradores (un maestro, aun con permisos, no entra)', () => {
    expect(canAccess('documentos-publicos', { isAdmin: false, permisos: { puede_registrar_alumnos: true, puede_inscribir_clases: true } })).toBe(false)
    expect(canAccess('documentos-publicos', { isAdmin: true })).toBe(true)
  })
})
