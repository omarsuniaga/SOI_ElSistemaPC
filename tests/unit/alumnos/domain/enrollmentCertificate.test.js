import { describe, it, expect, vi } from 'vitest'
vi.mock('../../../../src/modules/config/api/configApi.js', () => ({ getDocumentosInstitucionales: vi.fn() }))
import { generarConstanciaInscripcion, ALUMNO_DEMO } from '../../../../src/modules/alumnos/domain/generarPdfInscripcion.js'
import { render } from '../../../../src/portal-maestros/views/wizard/step7-compromisos.js'

describe('Condiciones económicas de inscripción', () => {
  it('genera en una página la constancia con las dos modalidades y sin el paquete de materiales', () => {
    const doc = generarConstanciaInscripcion(ALUMNO_DEMO)
    const pdf = doc.output()
    expect(doc.getNumberOfPages()).toBe(1)
    for (const amount of ['5,150.00', '4,500.00', '650.00', '3,600.00', '600.00', '300.00']) expect(pdf).toContain(amount)
    expect(pdf).not.toContain('PAGO OBLIGATORIO')
    expect(pdf).not.toContain('AL PRESENTAR ESTA CONSTANCIA')
    expect(pdf).not.toContain('T-Shirt')
  })
  it('presenta modalidades y materiales cobrados por separado sin prometer lápiz ni borrador', () => {
    const html = render({})
    expect(html).toContain('RD$650.00')
    expect(html).toContain('RD$3,600.00')
    expect(html).toContain('RD$500.00')
    expect(html).toContain('RD$150.00')
    expect(html).not.toMatch(/lápiz|borrador|pago inicial/i)
  })
})
