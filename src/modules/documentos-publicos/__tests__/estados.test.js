import { describe, expect, it } from 'vitest'
import { accionDeTransicion, transicionesDisponibles } from '../lib/estados.js'

describe('estados', () => {
  it('permite solo las transiciones del ciclo de vida', () => {
    expect(accionDeTransicion('borrador', 'publicado')).toBe('publicar')
    expect(accionDeTransicion('publicado', 'borrador')).toBe('despublicar')
    expect(accionDeTransicion('publicado', 'archivado')).toBe('archivar')
    expect(accionDeTransicion('archivado', 'borrador')).toBe('restaurar')
    expect(accionDeTransicion('archivado', 'publicado')).toBeNull()
    expect(accionDeTransicion('borrador', 'borrador')).toBeNull()
  })
  it('no ofrece publicar sin documento', () => {
    expect(transicionesDisponibles('borrador', false).map((t) => t.hacia)).toEqual(['archivado'])
    expect(transicionesDisponibles('borrador', true).map((t) => t.hacia)).toEqual(['publicado', 'archivado'])
  })
})
