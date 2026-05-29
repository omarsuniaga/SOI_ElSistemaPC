import { describe, it, expect } from 'vitest'
import {
  validarPaso1,
  validarPaso2,
  validarPaso3,
  validarPaso4,
  validarPaso5,
} from '../../../../src/modules/alumnos/domain/inscripcionValidators.js'

// ---------------------------------------------------------------------------
// Step 1 — Datos Personales
// ---------------------------------------------------------------------------
describe('validarPaso1', () => {
  const validBase = {
    nombre_completo: 'Juan Pérez',
    fecha_nacimiento: '2010-03-15',
    sabe_leer: true,
    sabe_escribir: true,
    nacionalidad: 'Dominicana',
    tiene_pasaporte: false,
    como_se_entero: 'Por un amigo',
    direccion: 'Calle 1, Santo Domingo',
    ubicacion_maps_url: '',
  }

  it('returns valid for a correct step 1 payload', () => {
    const result = validarPaso1(validBase)
    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('fails when nombre_completo is empty', () => {
    const result = validarPaso1({ ...validBase, nombre_completo: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('nombre_completo')
  })

  it('fails when fecha_nacimiento is missing', () => {
    const result = validarPaso1({ ...validBase, fecha_nacimiento: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('fecha_nacimiento')
  })

  it('fails when fecha_nacimiento is in the future', () => {
    const result = validarPaso1({ ...validBase, fecha_nacimiento: '2099-01-01' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('fecha_nacimiento')
  })

  it('fails when nacionalidad is empty', () => {
    const result = validarPaso1({ ...validBase, nacionalidad: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('nacionalidad')
  })

  it('fails when como_se_entero is empty', () => {
    const result = validarPaso1({ ...validBase, como_se_entero: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('como_se_entero')
  })

  it('fails when direccion is empty', () => {
    const result = validarPaso1({ ...validBase, direccion: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('direccion')
  })

  it('fails when ubicacion_maps_url is not a Google Maps URL', () => {
    const result = validarPaso1({ ...validBase, ubicacion_maps_url: 'http://example.com' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('ubicacion_maps_url')
  })

  it('accepts a valid google.com/maps URL', () => {
    const result = validarPaso1({ ...validBase, ubicacion_maps_url: 'https://www.google.com/maps/place/foo' })
    expect(result.valid).toBe(true)
  })

  it('accepts a valid goo.gl/maps URL', () => {
    const result = validarPaso1({ ...validBase, ubicacion_maps_url: 'https://goo.gl/maps/abc123' })
    expect(result.valid).toBe(true)
  })

  it('accepts empty ubicacion_maps_url (optional)', () => {
    const result = validarPaso1({ ...validBase, ubicacion_maps_url: null })
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Step 2 — Perfil Musical
// ---------------------------------------------------------------------------
describe('validarPaso2', () => {
  it('returns valid when conocimientos = false and only interes + instrumento provided', () => {
    const result = validarPaso2({
      tiene_conocimientos_musicales: false,
      interes_musical: 'instrumento',
      instrumento_interes: 'Guitarra',
      instrumento_previo: null,
      nivel_lectura_musical: null,
    })
    expect(result.valid).toBe(true)
  })

  it('fails when interes_musical is missing', () => {
    const result = validarPaso2({
      tiene_conocimientos_musicales: false,
      interes_musical: '',
      instrumento_interes: 'Guitarra',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('interes_musical')
  })

  it('fails when instrumento_interes is missing', () => {
    const result = validarPaso2({
      tiene_conocimientos_musicales: false,
      interes_musical: 'cantar',
      instrumento_interes: '',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('instrumento_interes')
  })

  it('fails when conocimientos = true but instrumento_previo is missing', () => {
    const result = validarPaso2({
      tiene_conocimientos_musicales: true,
      interes_musical: 'instrumento',
      instrumento_interes: 'Piano',
      instrumento_previo: '',
      nivel_lectura_musical: 'basico',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('instrumento_previo')
  })

  it('fails when conocimientos = true but nivel_lectura_musical is missing', () => {
    const result = validarPaso2({
      tiene_conocimientos_musicales: true,
      interes_musical: 'instrumento',
      instrumento_interes: 'Piano',
      instrumento_previo: 'Guitarra',
      nivel_lectura_musical: '',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('nivel_lectura_musical')
  })

  it('skips instrumento_previo validation when conocimientos = false', () => {
    const result = validarPaso2({
      tiene_conocimientos_musicales: false,
      interes_musical: 'ambas',
      instrumento_interes: 'Flauta',
      instrumento_previo: '',  // should be ignored
      nivel_lectura_musical: '',  // should be ignored
    })
    expect(result.valid).toBe(true)
  })

  it('fails for invalid interes_musical enum value', () => {
    const result = validarPaso2({
      tiene_conocimientos_musicales: false,
      interes_musical: 'bailar',  // invalid
      instrumento_interes: 'Guitarra',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('interes_musical')
  })
})

// ---------------------------------------------------------------------------
// Step 3 — Salud
// ---------------------------------------------------------------------------
describe('validarPaso3', () => {
  it('returns valid with minimal required fields', () => {
    const result = validarPaso3({
      tiene_condicion_transmisible: false,
      condicion_transmisible_descripcion: '',
      tiene_alergia_medicamento: false,
      alergia_medicamento_descripcion: '',
      impedimento_social: false,
      problemas_conducta: 'no',
    })
    expect(result.valid).toBe(true)
  })

  it('fails when condicion_transmisible = true but no description', () => {
    const result = validarPaso3({
      tiene_condicion_transmisible: true,
      condicion_transmisible_descripcion: '',
      tiene_alergia_medicamento: false,
      alergia_medicamento_descripcion: '',
      impedimento_social: false,
      problemas_conducta: 'no',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('condicion_transmisible_descripcion')
  })

  it('fails when alergia_medicamento = true but no description', () => {
    const result = validarPaso3({
      tiene_condicion_transmisible: false,
      condicion_transmisible_descripcion: '',
      tiene_alergia_medicamento: true,
      alergia_medicamento_descripcion: '',
      impedimento_social: false,
      problemas_conducta: 'no',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('alergia_medicamento_descripcion')
  })

  it('fails for invalid problemas_conducta enum', () => {
    const result = validarPaso3({
      tiene_condicion_transmisible: false,
      condicion_transmisible_descripcion: '',
      tiene_alergia_medicamento: false,
      alergia_medicamento_descripcion: '',
      impedimento_social: false,
      problemas_conducta: 'muy_violento',  // invalid
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('problemas_conducta')
  })
})

// ---------------------------------------------------------------------------
// Step 4 — Datos Escolares
// ---------------------------------------------------------------------------
describe('validarPaso4', () => {
  it('returns valid with all required fields', () => {
    const result = validarPaso4({
      centro_estudios: 'Escuela Nacional',
      grado_nivel: '5to primaria',
      padres_en_vida: 'ambos',
    })
    expect(result.valid).toBe(true)
  })

  it('fails when centro_estudios is empty', () => {
    const result = validarPaso4({ centro_estudios: '', grado_nivel: '5to', padres_en_vida: 'ambos' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('centro_estudios')
  })

  it('fails when grado_nivel is empty', () => {
    const result = validarPaso4({ centro_estudios: 'Escuela', grado_nivel: '', padres_en_vida: 'ambos' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('grado_nivel')
  })

  it('fails when padres_en_vida is empty', () => {
    const result = validarPaso4({ centro_estudios: 'Escuela', grado_nivel: '5to', padres_en_vida: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('padres_en_vida')
  })

  it('fails for invalid padres_en_vida enum value', () => {
    const result = validarPaso4({ centro_estudios: 'Escuela', grado_nivel: '5to', padres_en_vida: 'todos' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('padres_en_vida')
  })
})

// ---------------------------------------------------------------------------
// Step 5 — Representante y Compromisos
// ---------------------------------------------------------------------------
describe('validarPaso5', () => {
  const validBase = {
    representante_nombre: 'María García',
    representante_parentesco: 'Madre',
    representante_tlf: '809-555-1234',
    representante_cedula: '001-1234567-8',
    acepta_beca_4500: true,
    acepta_pago_600: true,
  }

  it('returns valid with all required fields and compromisos accepted', () => {
    expect(validarPaso5(validBase).valid).toBe(true)
  })

  it('fails when representante_nombre is empty', () => {
    const result = validarPaso5({ ...validBase, representante_nombre: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('representante_nombre')
  })

  it('fails when representante_parentesco is empty', () => {
    const result = validarPaso5({ ...validBase, representante_parentesco: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('representante_parentesco')
  })

  it('fails when representante_tlf is empty', () => {
    const result = validarPaso5({ ...validBase, representante_tlf: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('representante_tlf')
  })

  it('fails when representante_cedula is empty', () => {
    const result = validarPaso5({ ...validBase, representante_cedula: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('representante_cedula')
  })

  it('fails when acepta_beca_4500 is false', () => {
    const result = validarPaso5({ ...validBase, acepta_beca_4500: false })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('acepta_beca_4500')
  })

  it('fails when acepta_pago_600 is false', () => {
    const result = validarPaso5({ ...validBase, acepta_pago_600: false })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('acepta_pago_600')
  })

  it('fails when both compromisos are false', () => {
    const result = validarPaso5({ ...validBase, acepta_beca_4500: false, acepta_pago_600: false })
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveProperty('acepta_beca_4500')
    expect(result.errors).toHaveProperty('acepta_pago_600')
  })
})
