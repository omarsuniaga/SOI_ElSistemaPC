import { describe, it, expect } from 'vitest'
import { mapLogAEventoAnimacion, esFilaDeRunActiva, requiereCaminata } from '../simuladorLogMapper.js'

describe('simuladorLogMapper', () => {
  describe('mapLogAEventoAnimacion', () => {
    it('mapea una fila sim_log a un evento de animación con departamento y texto', () => {
      const fila = {
        id: 'abc',
        run_id: 'run-1',
        departamento: 'COM',
        agente: 'AGT-COM',
        accion: 'Enviando WhatsApp a maestros: reunión el 15/03',
        created_at: '2026-03-05T09:00:00-04:00',
      }
      const evento = mapLogAEventoAnimacion(fila)
      expect(evento).toEqual({
        departamento: 'COM',
        agente: 'AGT-COM',
        texto: 'Enviando WhatsApp a maestros: reunión el 15/03',
        logId: 'abc',
      })
    })

    it('cae a departamento DIR si la fila no trae un departamento reconocido', () => {
      const evento = mapLogAEventoAnimacion({ id: '1', departamento: null, accion: 'Acción genérica' })
      expect(evento.departamento).toBe('DIR')
    })

    it('usa un texto de fallback si accion viene vacía', () => {
      const evento = mapLogAEventoAnimacion({ id: '1', departamento: 'FIN', accion: '' })
      expect(evento.texto).toBe('Procesando…')
    })

    it('lanza si la fila es null/undefined', () => {
      expect(() => mapLogAEventoAnimacion(null)).toThrow()
      expect(() => mapLogAEventoAnimacion(undefined)).toThrow()
    })
  })

  describe('requiereCaminata', () => {
    it('true si departamento_origen está presente y es diferente de departamento destino', () => {
      const evento = mapLogAEventoAnimacion({ id: '1', departamento: 'ADM', departamento_origen: 'DIR', accion: 'Revisión' })
      expect(requiereCaminata(evento)).toBe(true)
    })

    it('false si departamento_origen es igual a departamento destino', () => {
      const evento = mapLogAEventoAnimacion({ id: '1', departamento: 'ADM', departamento_origen: 'ADM', accion: 'Interna' })
      expect(requiereCaminata(evento)).toBe(false)
    })

    it('false si departamento_origen no está presente (backward-compat)', () => {
      const evento = mapLogAEventoAnimacion({ id: '1', departamento: 'COM', accion: 'Sin origen' })
      expect(requiereCaminata(evento)).toBe(false)
    })

    it('lanza si evento es null', () => {
      expect(() => requiereCaminata(null)).toThrow()
    })
  })

  describe('esFilaDeRunActiva', () => {
    it('devuelve true si payload.new.run_id coincide con el runId activo', () => {
      expect(esFilaDeRunActiva({ new: { run_id: 'run-1' } }, 'run-1')).toBe(true)
    })

    it('devuelve false si no coincide o falta el payload', () => {
      expect(esFilaDeRunActiva({ new: { run_id: 'run-2' } }, 'run-1')).toBe(false)
      expect(esFilaDeRunActiva({}, 'run-1')).toBe(false)
      expect(esFilaDeRunActiva(null, 'run-1')).toBe(false)
    })
  })
})
