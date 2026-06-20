import { describe, it, expect } from 'vitest'
import { validarSolicitud } from '../ausenciaValidator.js'

describe('ausenciaValidator', () => {
  const hoy = new Date()

  function fechaFutura(diasOffset) {
    const d = new Date(hoy)
    d.setDate(d.getDate() + diasOffset)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  describe('anticipation rule (48h minimum)', () => {
    it('should reject a request with less than 48h anticipation', () => {
      const solicitud = {
        fechaInicio: fechaFutura(1),
        fechaFin: fechaFutura(1),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      expect(result.valido).toBe(false)
      expect(result.errores).toContain('Se requieren al menos 48 horas de anticipación')
    })

    it('should accept a request with exactly 48h anticipation', () => {
      const solicitud = {
        fechaInicio: fechaFutura(2),
        fechaFin: fechaFutura(2),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      const anticipacionError = result.errores?.includes('Se requieren al menos 48 horas de anticipación')
      expect(anticipacionError).toBeFalsy()
    })

    it('should accept a request with more than 48h anticipation', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(5),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      const anticipacionError = result.errores?.includes('Se requieren al menos 48 horas de anticipación')
      expect(anticipacionError).toBeFalsy()
    })
  })

  describe('no past dates rule', () => {
    it('should reject a request with a past start date', () => {
      const solicitud = {
        fechaInicio: fechaFutura(-3),
        fechaFin: fechaFutura(-1),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      expect(result.valido).toBe(false)
      expect(result.errores).toContain('La fecha de inicio no puede ser en el pasado')
    })

    it('should reject a request with today as start date', () => {
      const solicitud = {
        fechaInicio: fechaFutura(0),
        fechaFin: fechaFutura(0),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      expect(result.valido).toBe(false)
    })
  })

  describe('valid date range rule', () => {
    it('should reject a request where fechaFin is before fechaInicio', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(3),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      expect(result.valido).toBe(false)
      expect(result.errores).toContain('La fecha de fin no puede ser anterior a la fecha de inicio')
    })

    it('should accept a request where fechaFin equals fechaInicio', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(5),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      const rangeError = result.errores?.includes('La fecha de fin no puede ser anterior a la fecha de inicio')
      expect(rangeError).toBeFalsy()
    })

    it('should accept a request where fechaFin is after fechaInicio', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(7),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      const rangeError = result.errores?.includes('La fecha de fin no puede ser anterior a la fecha de inicio')
      expect(rangeError).toBeFalsy()
    })
  })

  describe('documentation requirement rule', () => {
    it('should reject a medical absence without documentation', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(5),
        motivo: 'medico',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      expect(result.valido).toBe(false)
      expect(result.errores).toContain('Las ausencias médicas requieren documentación')
    })

    it('should accept a medical absence with documentation', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(5),
        motivo: 'medico',
        documentacion: 'certificado.pdf',
      }
      const result = validarSolicitud(solicitud)
      const docError = result.errores?.includes('Las ausencias médicas requieren documentación')
      expect(docError).toBeFalsy()
    })

    it('should accept a personal absence without documentation', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(5),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      const docError = result.errores?.includes('Las ausencias médicas requieren documentación')
      expect(docError).toBeFalsy()
    })
  })

  describe('valid solicitud', () => {
    it('should return valido=true for a fully valid non-medical solicitud', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(7),
        motivo: 'personal',
        documentacion: null,
      }
      const result = validarSolicitud(solicitud)
      expect(result.valido).toBe(true)
      expect(result.errores).toHaveLength(0)
    })

    it('should return valido=true for a fully valid medical solicitud with documentation', () => {
      const solicitud = {
        fechaInicio: fechaFutura(5),
        fechaFin: fechaFutura(7),
        motivo: 'medico',
        documentacion: 'certificado.pdf',
      }
      const result = validarSolicitud(solicitud)
      expect(result.valido).toBe(true)
      expect(result.errores).toHaveLength(0)
    })
  })
})
