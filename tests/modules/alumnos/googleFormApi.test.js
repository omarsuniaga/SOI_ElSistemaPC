import { describe, it, expect } from 'vitest'
import { mapRowToDraft } from '../../../src/modules/alumnos/api/googleFormApi.js'

function makeRow(overrides = {}) {
  const defaults = {
    'Nombre del Alumno': 'Marcos Merone Cocco',
    '¿Cuál es el nombre completo de la madre?': 'Elisabetta Cocco',
    '¿Cuál es el nombre completo del padre?': 'Esnor Merone',
    'Número de teléfono del alumno': '8295577722',
    '¿Numero telefónico de ambos padres?': '8295577722',
    'Telefono opcional': '',
    'Dirección de correo electrónico': 'elisabetta.cocco@hotmail.com',
    'Fecha de Nacimiento del Alumno': '30/08/2015',
    'Dirección completa del alumno': 'Avenida real norte MC1-10-b',
    '¿Quién sera su representante legal?': 'Ambos (Padre y Madre)',
    '¿Está dispuesto a contribuir con el aporte mensual de 600 pesos?': 'Haré lo posible',
    '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?':
      'Sí',
    Nacionalidad: 'Dominicana',
    ...overrides,
  }
  return defaults
}

describe('mapRowToDraft', () => {
  it('maps nombre_completo', () => {
    const draft = mapRowToDraft(makeRow())
    expect(draft.nombre_completo).toBe('Marcos Merone Cocco')
  })

  it('converts DD/MM/YYYY date to YYYY-MM-DD', () => {
    const draft = mapRowToDraft(makeRow({ 'Fecha de Nacimiento del Alumno': '30/08/2015' }))
    expect(draft.fecha_nacimiento).toBe('2015-08-30')
  })

  it('returns empty string for unparseable date', () => {
    const draft = mapRowToDraft(makeRow({ 'Fecha de Nacimiento del Alumno': 'no-date' }))
    expect(draft.fecha_nacimiento).toBe('')
  })

  it('maps madre_nombre and padre_nombre', () => {
    const draft = mapRowToDraft(makeRow())
    expect(draft.madre_nombre).toBe('Elisabetta Cocco')
    expect(draft.padre_nombre).toBe('Esnor Merone')
  })

  it('maps madre_tlf_whatsapp from "Numero telefónico de ambos padres"', () => {
    const draft = mapRowToDraft(makeRow({ '¿Numero telefónico de ambos padres?': '8091234567' }))
    expect(draft.madre_tlf_whatsapp).toBe('8091234567')
  })

  it('maps padre_tlf_whatsapp from "Telefono opcional"', () => {
    const draft = mapRowToDraft(makeRow({ 'Telefono opcional': '8297654321' }))
    expect(draft.padre_tlf_whatsapp).toBe('8297654321')
  })

  it('maps nationalidad', () => {
    const draft = mapRowToDraft(makeRow({ Nacionalidad: 'Venezolana' }))
    expect(draft.nacionalidad).toBe('Venezolana')
  })

  it('maps sector_calle_numero', () => {
    const draft = mapRowToDraft(makeRow())
    expect(draft.sector_calle_numero).toBe('Avenida real norte MC1-10-b')
  })

  describe('representante_parentesco', () => {
    it.each([
      ['Madre', 'madre'],
      ['Padre', 'padre'],
      ['Ambos (Padre y Madre)', 'ambos'],
      ['madre soltera', 'madre'],
    ])('maps "%s" → "%s"', (input, expected) => {
      const draft = mapRowToDraft(makeRow({ '¿Quién sera su representante legal?': input }))
      expect(draft.representante_parentesco).toBe(expected)
    })
  })

  describe('acepta_pago_600', () => {
    it.each([
      ['Si', true],
      ['Sí', true],
      ['Haré lo posible', true],
      ['No', false],
    ])('maps "%s" → %s', (input, expected) => {
      const draft = mapRowToDraft(
        makeRow({ '¿Está dispuesto a contribuir con el aporte mensual de 600 pesos?': input }),
      )
      expect(draft.acepta_pago_600).toBe(expected)
    })
  })

  describe('autoriza_fotos_redes', () => {
    it('maps "Sí" → true', () => {
      const draft = mapRowToDraft(
        makeRow({
          '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?':
            'Sí',
        }),
      )
      expect(draft.autoriza_fotos_redes).toBe(true)
    })

    it('maps "No" → false', () => {
      const draft = mapRowToDraft(
        makeRow({
          '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?':
            'No',
        }),
      )
      expect(draft.autoriza_fotos_redes).toBe(false)
    })
  })
})
