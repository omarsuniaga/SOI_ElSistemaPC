import { describe, expect, it } from 'vitest'
import { esAlumnoDeIniciacion, seleccionActiva, renderEtiquetasSeleccion } from '../domain/seleccionesIniciacion.js'

describe('selecciones desde Iniciación', () => {
  it('identifica Iniciación Musical e Instrumental mediante los programas actuales', () => {
    expect(esAlumnoDeIniciacion({ programas: [{ nombre: 'Iniciación Musical' }] })).toBe(true)
    expect(esAlumnoDeIniciacion({ programas: [{ nombre: 'Iniciación Instrumental' }] })).toBe(true)
    expect(esAlumnoDeIniciacion({ programas: [{ nombre: 'Orquestal' }] })).toBe(false)
  })
  it('acepta una clase identificada como iniciación', () => {
    expect(esAlumnoDeIniciacion({}, [{ es_clase_iniciacion: true }])).toBe(true)
  })
  it('admite ambas etiquetas simultáneas y no confunde interés o instrumento con selección', () => {
    const alumno = {
      instrumento_principal: 'Violín',
      instrumento_interes: 'Coro',
      selecciones_iniciacion: [
        { destino: 'orquesta', activo: true },
        { destino: 'coro', activo: true },
      ],
    }
    expect(seleccionActiva(alumno, 'orquesta')).toBe(true)
    expect(seleccionActiva(alumno, 'coro')).toBe(true)
    expect(renderEtiquetasSeleccion(alumno)).toContain('Seleccionado para Orquesta')
    expect(renderEtiquetasSeleccion(alumno)).toContain('Seleccionado para Coro')
    expect(seleccionActiva({ instrumento_principal: 'Violín' }, 'orquesta')).toBe(false)
  })
  it('retirar una selección no elimina ni afecta a la otra', () => {
    const alumno = { selecciones_iniciacion: [
      { destino: 'orquesta', activo: false }, { destino: 'coro', activo: true },
    ] }
    expect(seleccionActiva(alumno, 'orquesta')).toBe(false)
    expect(seleccionActiva(alumno, 'coro')).toBe(true)
  })
})
