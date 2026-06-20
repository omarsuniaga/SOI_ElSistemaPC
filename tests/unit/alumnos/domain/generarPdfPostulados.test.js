import { describe, it, expect } from 'vitest'
import {
  generarPdfPostulados,
  descargarPdfPostulados,
} from '../../../../src/modules/alumnos/domain/generarPdfPostulados.js'

const mockPostulantes = [
  {
    id: 'post-001',
    nombre_completo: 'Marcos Merone Cocco',
    telefono_alumno: '8295577722',
    correo: 'test@example.com',
    madre_nombre: 'Elisabetta Cocco',
    madre_tlf_whatsapp: '8295577722',
    padre_nombre: 'Esnor Merone',
    padre_tlf_whatsapp: '',
    estado: 'postulado',
    created_at: '2026-05-28T00:00:00Z',
  },
  {
    id: 'post-002',
    nombre_completo: 'Ana Pérez Guerrero',
    telefono_alumno: '8091112233',
    correo: 'ana@example.com',
    madre_nombre: 'María Guerrero',
    madre_tlf_whatsapp: '8091112233',
    padre_nombre: 'Juan Pérez',
    padre_tlf_whatsapp: '8091112234',
    estado: 'contactado',
    created_at: '2026-05-20T00:00:00Z',
  },
]

describe('generarPdfPostulados', () => {
  it('retorna un objeto jsPDF con las funciones text() y save()', () => {
    const doc = generarPdfPostulados(mockPostulantes, '2026-05-01', '2026-05-31')
    expect(doc).toBeDefined()
    expect(typeof doc.text).toBe('function')
    expect(typeof doc.save).toBe('function')
    expect(typeof doc.internal.getNumberOfPages).toBe('function')
  })

  it('genera al menos 1 página con postulantes', () => {
    const doc = generarPdfPostulados(mockPostulantes, '2026-05-01', '2026-05-31')
    const pages = doc.internal.getNumberOfPages()
    expect(pages).toBeGreaterThanOrEqual(1)
  })

  it('no lanza error con array vacío de postulantes', () => {
    expect(() => {
      generarPdfPostulados([], '2026-05-01', '2026-05-31')
    }).not.toThrow()
  })

  it('no lanza error con datos completos', () => {
    expect(() => {
      generarPdfPostulados(mockPostulantes, '2026-05-01', '2026-05-31')
    }).not.toThrow()
  })
})

describe('descargarPdfPostulados', () => {
  it('no lanza error al descargar (doc.save internamente)', () => {
    expect(() => {
      descargarPdfPostulados(mockPostulantes, '2026-05-01', '2026-05-31')
    }).not.toThrow()
  })
})
