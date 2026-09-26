import { describe, expect, it } from 'vitest'
import { perfilMusicalAlumno } from '../domain/perfilMusicalAlumno.js'

describe('perfilMusicalAlumno', () => {
  it('mantiene separadas iniciación, preferencia y cátedra', () => {
    const perfil = perfilMusicalAlumno(
      { instrumento_principal: null, instrumento_interes: 'Violín' },
      [{ nombre: 'Iniciación Musical - Matutino', instrumento: 'no aplica', programas: { nombre: 'Iniciación Musical' } }],
    )
    expect(perfil).toMatchObject({ enIniciacion: true, tieneCatedraInstrumental: false, instrumentoInteres: 'Violín' })
  })

  it('admite iniciación y cátedra instrumental simultáneas', () => {
    const perfil = perfilMusicalAlumno(
      { instrumento_principal: 'Violín' },
      [
        { nombre: 'Iniciación Musical', instrumento: 'no aplica', programas: { nombre: 'Iniciación Musical' } },
        { nombre: 'Violines N0', instrumento: 'Violín', programas: { nombre: 'Cuerdas' } },
      ],
    )
    expect(perfil).toMatchObject({ enIniciacion: true, tieneCatedraInstrumental: true, instrumentoPrincipalCoincide: true })
  })

  it('no transforma un dato antiguo de instrumento principal en matrícula instrumental', () => {
    const perfil = perfilMusicalAlumno(
      { instrumento_principal: 'Violín', instrumento_interes: null },
      [{ nombre: 'Iniciación Musical - Mixto', instrumento: 'no aplica' }],
    )
    expect(perfil.tieneCatedraInstrumental).toBe(false)
    expect(perfil.instrumentoPrincipalCoincide).toBe(false)
    expect(perfil.instrumentoInteres).toBeNull()
  })

  it('coro no acredita una cátedra de violín aunque exista un dato heredado', () => {
    const perfil = perfilMusicalAlumno(
      { instrumento_principal: 'Violín' },
      [{ nombre: 'Coro Niños Cantores', instrumento: 'Coro' }, { nombre: 'Iniciación Coral', instrumento: 'Voz' }],
    )
    expect(perfil.tieneCatedraInstrumental).toBe(false)
    expect(perfil.instrumentoPrincipalCoincide).toBe(false)
  })

  it('un instrumento principal distinto de la clase activa queda pendiente de revisión', () => {
    const perfil = perfilMusicalAlumno(
      { instrumento_principal: 'Violín' },
      [{ nombre: 'Iniciación de Violas', instrumento: 'Viola' }],
    )
    expect(perfil.tieneCatedraInstrumental).toBe(true)
    expect(perfil.instrumentoPrincipalCoincide).toBe(false)
  })
})
