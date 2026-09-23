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
    expect(perfil).toMatchObject({ enIniciacion: true, tieneCatedraInstrumental: true })
  })

  it('no transforma un dato antiguo de instrumento principal en matrícula instrumental', () => {
    const perfil = perfilMusicalAlumno(
      { instrumento_principal: 'Violín', instrumento_interes: null },
      [{ nombre: 'Iniciación Musical - Mixto', instrumento: 'no aplica' }],
    )
    expect(perfil.tieneCatedraInstrumental).toBe(false)
    expect(perfil.instrumentoInteres).toBeNull()
  })
})
