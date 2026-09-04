import { describe, it, expect } from 'vitest'
import { construirMensajeAusentismo } from '../../../../src/modules/pedagogico/domain/plantillasAusentismo.js'

const alumno = {
  alumno_nombre: 'María Fernanda Gómez',
  instrumento_principal: 'Violín',
  instrumento_codigo: 'VLN-014',
  dias_ausente: 3,
  ultima_ausencia_fecha: '2026-09-01',
  maestro_nombre: 'Omar Suniaga',
}

describe('construirMensajeAusentismo', () => {
  it('nivel 1: tono cálido, nombra la clase y la fecha, invita a justificar', () => {
    const msg = construirMensajeAusentismo({ nivel: 1, alumno })
    expect(msg).toContain('Estimada familia de María Fernanda Gómez')
    expect(msg).toContain('María') // primer nombre
    expect(msg).toContain('Violín')
    expect(msg).toContain('justificar')
    expect(msg).not.toMatch(/retenci[oó]n|reglamento/i)
  })

  it('nivel 2: institucional, con acumulado y fecha límite', () => {
    const msg = construirMensajeAusentismo({ nivel: 2, alumno })
    expect(msg).toContain('3 inasistencias sin justificar')
    expect(msg).toMatch(/antes del/i)
    expect(msg).toContain('FUNEYCA-PC')
  })

  it('nivel 3 representante: menciona retención del instrumento y acta', () => {
    const msg = construirMensajeAusentismo({ nivel: 3, destinatario: 'representante', alumno })
    expect(msg).toMatch(/instrumento asignado a María \(VLN-014\) queda temporalmente retenido/)
    expect(msg).toContain('acta de compromiso')
  })

  it('nivel 3 maestro: es una orden de recogida del instrumento', () => {
    const msg = construirMensajeAusentismo({ nivel: 3, destinatario: 'maestro', alumno })
    expect(msg).toContain('Prof. Omar Suniaga')
    expect(msg).toMatch(/recoja el instrumento/i)
    expect(msg).toContain('VLN-014')
  })

  it('tolera datos faltantes sin romper', () => {
    const msg = construirMensajeAusentismo({ nivel: 1, alumno: {} })
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(20)
  })
})
