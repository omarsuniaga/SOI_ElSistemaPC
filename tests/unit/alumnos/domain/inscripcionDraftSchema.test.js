import { describe, it, expect } from 'vitest'
import {
  crearBorradorVacio,
  actualizarPaso,
} from '../../../../src/modules/alumnos/domain/inscripcionDraftSchema.js'

describe('crearBorradorVacio', () => {
  it('returns an object', () => {
    expect(typeof crearBorradorVacio()).toBe('object')
  })

  it('has all step-1 fields initialized', () => {
    const draft = crearBorradorVacio()
    expect(draft).toHaveProperty('nombre_completo', '')
    expect(draft).toHaveProperty('fecha_nacimiento', '')
    expect(draft).toHaveProperty('sabe_leer', false)
    expect(draft).toHaveProperty('sabe_escribir', false)
    expect(draft).toHaveProperty('nacionalidad', '')
    expect(draft).toHaveProperty('tiene_pasaporte', false)
    expect(draft).toHaveProperty('como_se_entero', '')
    expect(draft).toHaveProperty('direccion', '')
    expect(draft).toHaveProperty('ubicacion_maps_url', '')
  })

  it('has all step-2 musical fields initialized', () => {
    const draft = crearBorradorVacio()
    expect(draft).toHaveProperty('tiene_conocimientos_musicales', false)
    expect(draft).toHaveProperty('instrumento_previo', null)
    expect(draft).toHaveProperty('nivel_lectura_musical', null)
    expect(draft).toHaveProperty('interes_musical', '')
    expect(draft).toHaveProperty('instrumento_interes', '')
  })

  it('has all step-3 health fields initialized', () => {
    const draft = crearBorradorVacio()
    expect(draft).toHaveProperty('tiene_alergias', false)
    expect(draft).toHaveProperty('alergias_descripcion', null)
    expect(draft).toHaveProperty('tiene_condicion_transmisible', false)
    expect(draft).toHaveProperty('condicion_transmisible_descripcion', null)
    expect(draft).toHaveProperty('tiene_alergia_medicamento', false)
    expect(draft).toHaveProperty('alergia_medicamento_descripcion', null)
    expect(draft).toHaveProperty('impedimento_social', false)
    expect(draft).toHaveProperty('problemas_conducta', 'no')
  })

  it('has all step-4 school fields initialized', () => {
    const draft = crearBorradorVacio()
    expect(draft).toHaveProperty('centro_estudios', '')
    expect(draft).toHaveProperty('grado_nivel', '')
    expect(draft).toHaveProperty('padres_en_vida', '')
  })

  it('has all step-5 representante + compromisos fields initialized', () => {
    const draft = crearBorradorVacio()
    expect(draft).toHaveProperty('representante_nombre', '')
    expect(draft).toHaveProperty('representante_parentesco', '')
    expect(draft).toHaveProperty('representante_tlf', '')
    expect(draft).toHaveProperty('representante_cedula', '')
    expect(draft).toHaveProperty('acepta_beca_4500', false)
    expect(draft).toHaveProperty('acepta_pago_600', false)
    expect(draft).toHaveProperty('fecha_aceptacion_beca', null)
    expect(draft).toHaveProperty('fecha_aceptacion_pago', null)
  })

  it('returns a new object on every call (not the same reference)', () => {
    const a = crearBorradorVacio()
    const b = crearBorradorVacio()
    expect(a).not.toBe(b)
  })
})

describe('actualizarPaso', () => {
  it('merges step data into the draft without mutating the original', () => {
    const original = crearBorradorVacio()
    const updated = actualizarPaso(original, 1, { nombre_completo: 'Ana Torres' })
    expect(updated.nombre_completo).toBe('Ana Torres')
    expect(original.nombre_completo).toBe('')  // immutable
  })

  it('does not remove existing fields when merging', () => {
    const draft = { ...crearBorradorVacio(), nombre_completo: 'Ana' }
    const updated = actualizarPaso(draft, 1, { nacionalidad: 'Dominicana' })
    expect(updated.nombre_completo).toBe('Ana')
    expect(updated.nacionalidad).toBe('Dominicana')
  })

  it('returns a new object reference', () => {
    const draft = crearBorradorVacio()
    const updated = actualizarPaso(draft, 1, { nombre_completo: 'Test' })
    expect(updated).not.toBe(draft)
  })

  it('handles merging step 2 musical data', () => {
    const draft = crearBorradorVacio()
    const updated = actualizarPaso(draft, 2, {
      tiene_conocimientos_musicales: true,
      instrumento_previo: 'Guitarra',
      nivel_lectura_musical: 'basico',
    })
    expect(updated.tiene_conocimientos_musicales).toBe(true)
    expect(updated.instrumento_previo).toBe('Guitarra')
  })

  it('handles null values in step data (e.g. resetting conditional fields)', () => {
    const draft = { ...crearBorradorVacio(), instrumento_previo: 'Guitarra' }
    const updated = actualizarPaso(draft, 2, { instrumento_previo: null })
    expect(updated.instrumento_previo).toBeNull()
  })
})
