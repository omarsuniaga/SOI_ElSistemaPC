import { describe, it, expect } from 'vitest'
import {
  puedeTransicionar,
  accionesDisponibles,
  aplicarTransicion,
} from '../../../../src/modules/alumnos/domain/postuladoStateMachine.js'

describe('puedeTransicionar', () => {
  it('permite postulado → contactado', () => {
    expect(puedeTransicionar('postulado', 'contactado')).toBe(true)
  })

  it('permite contactado → cita_agendada', () => {
    expect(puedeTransicionar('contactado', 'cita_agendada')).toBe(true)
  })

  it('permite cita_agendada → no_show', () => {
    expect(puedeTransicionar('cita_agendada', 'no_show')).toBe(true)
  })

  it('permite no_show → reprogramado', () => {
    expect(puedeTransicionar('no_show', 'reprogramado')).toBe(true)
  })

  it('permite documentos_ok → inscrito', () => {
    expect(puedeTransicionar('documentos_ok', 'inscrito')).toBe(true)
  })

  it('permite documentos_ok → en_espera', () => {
    expect(puedeTransicionar('documentos_ok', 'en_espera')).toBe(true)
  })

  it('NO permite postulado → inscrito (salto de estado)', () => {
    expect(puedeTransicionar('postulado', 'inscrito')).toBe(false)
  })

  it('NO permite inscrito → cualquier estado (estado terminal)', () => {
    expect(puedeTransicionar('inscrito', 'postulado')).toBe(false)
    expect(puedeTransicionar('inscrito', 'descartado')).toBe(false)
  })

  it('NO permite descartado → cualquier estado (estado terminal)', () => {
    expect(puedeTransicionar('descartado', 'postulado')).toBe(false)
    expect(puedeTransicionar('descartado', 'cita_agendada')).toBe(false)
  })

  it('NO permite transición a estado inexistente', () => {
    expect(puedeTransicionar('postulado', 'estado_invalido_fantasma')).toBe(false)
  })
})

describe('aplicarTransicion', () => {
  it('retorna nuevo objeto con estado actualizado (sin mutación)', () => {
    const postulante = { id: '1', nombre: 'María García', estado: 'postulado' }
    const resultado = aplicarTransicion(postulante, 'contactado')

    expect(resultado).not.toBe(postulante) // Inmutabilidad
    expect(resultado.estado).toBe('contactado')
    expect(postulante.estado).toBe('postulado') // Objeto original sin mutar
  })

  it('lanza Error cuando la transición no es válida', () => {
    const postulante = { id: '2', nombre: 'Luis Pérez', estado: 'postulado' }
    expect(() => aplicarTransicion(postulante, 'inscrito')).toThrow(
      'Transición inválida: no se puede pasar del estado "postulado" al estado "inscrito"'
    )
  })

  it('incluye fecha_cita en el resultado cuando se pasa en meta', () => {
    const postulante = { id: '3', nombre: 'Ana Gómez', estado: 'contactado' }
    const fechaCita = '2026-06-05T10:00:00Z'
    const resultado = aplicarTransicion(postulante, 'cita_agendada', { fecha_cita: fechaCita })

    expect(resultado.estado).toBe('cita_agendada')
    expect(resultado.fecha_cita).toBe(fechaCita)
  })

  it('incluye notas_seguimiento en el resultado cuando se pasa en meta', () => {
    const postulante = { id: '4', nombre: 'Juan Soto', estado: 'postulado', notas_seguimiento: 'Nota previa' }
    const resultado = aplicarTransicion(postulante, 'contactado', { notas_seguimiento: 'Nueva nota' })

    expect(resultado.estado).toBe('contactado')
    expect(resultado.notas_seguimiento).toBe('Nota previa\nNueva nota')
  })

  it('incluye alumno_id cuando se transiciona a inscrito', () => {
    const postulante = { id: '5', nombre: 'Laura Ruiz', estado: 'documentos_ok' }
    const resultado = aplicarTransicion(postulante, 'inscrito', { alumno_id: 'alu-100' })

    expect(resultado.estado).toBe('inscrito')
    expect(resultado.alumno_id).toBe('alu-100')
  })
})

describe('accionesDisponibles', () => {
  it('devuelve acciones correctas para estado postulado', () => {
    const acciones = accionesDisponibles('postulado')
    expect(acciones).toEqual(['contactado', 'descartado'])
  })

  it('devuelve array vacío para inscrito', () => {
    const acciones = accionesDisponibles('inscrito')
    expect(acciones).toEqual([])
  })

  it('devuelve array vacío para descartado', () => {
    const acciones = accionesDisponibles('descartado')
    expect(acciones).toEqual([])
  })
})
