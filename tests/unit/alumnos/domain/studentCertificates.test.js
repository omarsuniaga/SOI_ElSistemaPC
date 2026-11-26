import { describe, it, expect, vi } from 'vitest'
vi.mock('../../../../src/modules/config/api/configApi.js', () => ({ getDocumentosInstitucionales: vi.fn() }))
import { certificateDefaults, validateCertificate } from '../../../../src/modules/alumnos/domain/certificateData.js'
import { generarConstanciaInscripcion, generarConstanciaEstudios, ALUMNO_DEMO } from '../../../../src/modules/alumnos/domain/generarPdfInscripcion.js'

const data = { ...ALUMNO_DEMO, fecha_ingreso: '2024-02-05', formacion: 'Viola' }

describe('Datos verificables de constancias', () => {
  it('no confunde fecha de creación ni interés musical con ingreso y formación', () => {
    const result = certificateDefaults({ nombre_completo: 'Ana', created_at: '2020-01-01', instrumento_interes: 'Violín' })
    expect(result.fecha_ingreso).toBe('')
    expect(result.formacion).toBe('')
    expect(result.nombre_completo).toBe('Ana')
  })
  it('prefiere los instrumentos cursados y admite programas de coro o iniciación', () => {
    expect(certificateDefaults({ instrumento_principal: 'Viola' }, [{ instrumento: 'Violonchelo' }]).formacion).toBe('Violonchelo')
    expect(certificateDefaults({}, [{ nombre: 'Coro Infantil', instrumento: 'Voz' }]).formacion).toBe('Coro Infantil')
  })
  it('requiere fecha real, nombre y formación; el representante solo es necesario para inscripción', () => {
    expect(Object.keys(validateCertificate({}, 'estudios'))).toEqual(['nombre_completo', 'fecha_ingreso', 'formacion'])
    expect(validateCertificate({}, 'inscripcion')).toHaveProperty('representante_cedula')
    expect(validateCertificate(data, 'estudios')).toEqual({})
  })
  it('rechaza fechas inexistentes, futuras y anteriores al nacimiento', () => {
    for (const fecha_ingreso of ['2024-02-30', '2099-01-01', '2000-01-01']) {
      expect(validateCertificate({ ...data, fecha_ingreso }, 'estudios', '2026-11-26')).toHaveProperty('fecha_ingreso')
    }
  })
  it('no bloquea la emisión por observaciones de perfil ajenas al documento', () => {
    expect(validateCertificate({ ...data, observaciones_generales: 'x'.repeat(500) }, 'estudios')).toEqual({})
  })
})

describe('Documentos independientes', () => {
  it('la inscripción contiene aceptación y compromiso para firma del representante', () => {
    const doc = generarConstanciaInscripcion(data)
    const pdf = doc.output()
    expect(pdf).toContain('Me comprometo a pagar')
    expect(pdf).toContain('acepto la beca')
    expect(pdf).toContain('Fecha de firma:')
    expect(pdf).toContain('05/02/2024')
    expect(pdf).not.toContain('ha aceptado los')
    expect(doc.getNumberOfPages()).toBe(1)
  })
  it('estudios acredita formación y fecha de ingreso sin términos financieros ni firma familiar', () => {
    const doc = generarConstanciaEstudios(data)
    const pdf = doc.output()
    expect(pdf).toContain('CONSTANCIA DE ESTUDIOS')
    expect(pdf).toContain('05/02/2024')
    expect(pdf).toContain('Viola')
    expect(pdf).toContain('Firma y sello institucional')
    expect(pdf).not.toMatch(/RD\$|comprometo|Firma del Representante/)
    expect(doc.getNumberOfPages()).toBe(1)
  })
  it('no genera constancia de estudios con datos imprescindibles ausentes', () => {
    expect(() => generarConstanciaEstudios({ nombre_completo: 'Ana' })).toThrow(/Completa/)
  })
  it('permite nombres extensos sin perder las firmas ni el pie de página', () => {
    const doc = generarConstanciaInscripcion({ ...data, nombre_completo: 'Nombre '.repeat(28), representante_nombre: 'Representante '.repeat(14), formacion: 'Formación '.repeat(18) })
    expect(doc.output()).toContain('Fecha de firma:')
    expect(doc.getNumberOfPages()).toBeLessThanOrEqual(3)
  })
})
