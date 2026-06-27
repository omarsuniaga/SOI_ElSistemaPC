import { describe, test, expect } from 'vitest'
import {
  normalizarInstrumento,
  familiaDe,
  normalizarTelefono,
  construirWaLink,
  resolverVariables,
  FAMILIAS,
} from '../secciones.js'

describe('normalizarInstrumento', () => {
  test('normaliza variantes sucias de violín', () => {
    expect(normalizarInstrumento('Violin')).toBe('Violín')
    expect(normalizarInstrumento('violín')).toBe('Violín')
    expect(normalizarInstrumento('Volín')).toBe('Violín')
  })
  test('normaliza violoncello a Cello', () => {
    expect(normalizarInstrumento('Violoncello')).toBe('Cello')
  })
  test('devuelve null para vacío', () => {
    expect(normalizarInstrumento('')).toBeNull()
    expect(normalizarInstrumento(null)).toBeNull()
  })
})

describe('familiaDe', () => {
  test('agrupa cuerdas', () => {
    expect(familiaDe('Violin')).toBe('cuerdas')
    expect(familiaDe('Contrabajo')).toBe('cuerdas')
    expect(familiaDe('Cello')).toBe('cuerdas')
  })
  test('agrupa maderas y metales', () => {
    expect(familiaDe('Flauta')).toBe('maderas')
    expect(familiaDe('Trompeta')).toBe('metales')
  })
  test('percusión', () => {
    expect(familiaDe('Percusión')).toBe('percusion')
  })
  test('instrumento desconocido cae en otros', () => {
    expect(familiaDe('Theremin')).toBe('otros')
  })
})

describe('normalizarTelefono', () => {
  test('antepone código país RD (1) a 10 dígitos', () => {
    expect(normalizarTelefono('8095551234')).toBe('18095551234')
  })
  test('respeta número con código de país', () => {
    expect(normalizarTelefono('18095551234')).toBe('18095551234')
  })
  test('limpia formato con símbolos', () => {
    expect(normalizarTelefono('(809) 555-1234')).toBe('18095551234')
  })
  test('rechaza inválidos', () => {
    expect(normalizarTelefono('')).toBeNull()
    expect(normalizarTelefono('123')).toBeNull()
    expect(normalizarTelefono(null)).toBeNull()
  })
})

describe('construirWaLink', () => {
  test('genera link wa.me con mensaje codificado', () => {
    const link = construirWaLink('8095551234', 'Hola mundo')
    expect(link).toBe('https://wa.me/18095551234?text=Hola%20mundo')
  })
  test('sin mensaje no agrega query', () => {
    expect(construirWaLink('8095551234')).toBe('https://wa.me/18095551234')
  })
  test('teléfono inválido devuelve null', () => {
    expect(construirWaLink('abc')).toBeNull()
  })
})

describe('resolverVariables', () => {
  test('reemplaza todas las variables de un contacto', () => {
    const contacto = { alumno: 'Ana', contactoNombre: 'María', instrumento: 'Violin' }
    const out = resolverVariables('Hola {representante}, {nombre_alumno} toca {instrumento} en {seccion}', contacto)
    expect(out).toBe('Hola María, Ana toca Violín en Cuerdas')
  })
  test('texto vacío devuelve cadena vacía', () => {
    expect(resolverVariables('', {})).toBe('')
  })
})

describe('FAMILIAS', () => {
  test('expone las secciones de orquesta', () => {
    expect(Object.keys(FAMILIAS)).toEqual(
      expect.arrayContaining(['cuerdas', 'maderas', 'metales', 'percusion']),
    )
  })
})
