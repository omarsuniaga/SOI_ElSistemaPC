import { describe, it, expect } from 'vitest'
import {
  formatearFechaSimulada,
  calcularProgresoRun,
  mapEstadoRunABadge,
  mapEstadoOutboxABadge,
  agruparEventosPorFecha,
} from '../simuladorFormato.js'

describe('simuladorFormato', () => {
  describe('formatearFechaSimulada', () => {
    it('formatea una fecha ISO a formato legible es-ES', () => {
      const resultado = formatearFechaSimulada('2026-03-05T09:00:00-04:00')
      expect(resultado).toMatch(/2026/)
      expect(resultado).toMatch(/marzo/i)
    })

    it('devuelve un placeholder si la fecha es null/undefined', () => {
      expect(formatearFechaSimulada(null)).toBe('—')
      expect(formatearFechaSimulada(undefined)).toBe('—')
    })

    it('devuelve un placeholder si la fecha es inválida', () => {
      expect(formatearFechaSimulada('no-es-fecha')).toBe('—')
    })
  })

  describe('calcularProgresoRun', () => {
    it('calcula el porcentaje avanzado entre fecha_inicio_virtual y fecha_fin_virtual', () => {
      const run = {
        fecha_inicio_virtual: '2026-01-01T00:00:00Z',
        fecha_fin_virtual: '2026-01-11T00:00:00Z',
        fecha_actual_virtual: '2026-01-06T00:00:00Z',
      }
      expect(calcularProgresoRun(run)).toBe(50)
    })

    it('retorna 0 si fecha_actual_virtual es igual a fecha_inicio_virtual', () => {
      const run = {
        fecha_inicio_virtual: '2026-01-01T00:00:00Z',
        fecha_fin_virtual: '2026-01-11T00:00:00Z',
        fecha_actual_virtual: '2026-01-01T00:00:00Z',
      }
      expect(calcularProgresoRun(run)).toBe(0)
    })

    it('retorna 100 si fecha_actual_virtual excede fecha_fin_virtual (clamp)', () => {
      const run = {
        fecha_inicio_virtual: '2026-01-01T00:00:00Z',
        fecha_fin_virtual: '2026-01-11T00:00:00Z',
        fecha_actual_virtual: '2026-02-01T00:00:00Z',
      }
      expect(calcularProgresoRun(run)).toBe(100)
    })

    it('retorna 0 si falta fecha_fin_virtual (corrida sin fin definido)', () => {
      const run = {
        fecha_inicio_virtual: '2026-01-01T00:00:00Z',
        fecha_fin_virtual: null,
        fecha_actual_virtual: '2026-01-06T00:00:00Z',
      }
      expect(calcularProgresoRun(run)).toBe(0)
    })
  })

  describe('mapEstadoRunABadge', () => {
    it('mapea cada estado válido a { label, color }', () => {
      expect(mapEstadoRunABadge('creado')).toEqual({ label: 'Creado', color: 'secondary' })
      expect(mapEstadoRunABadge('corriendo')).toEqual({ label: 'Corriendo', color: 'success' })
      expect(mapEstadoRunABadge('pausado')).toEqual({ label: 'Pausado', color: 'warning' })
      expect(mapEstadoRunABadge('finalizado')).toEqual({ label: 'Finalizado', color: 'primary' })
      expect(mapEstadoRunABadge('error')).toEqual({ label: 'Error', color: 'danger' })
    })

    it('cae a un badge neutro ante un estado desconocido', () => {
      expect(mapEstadoRunABadge('inventado')).toEqual({ label: 'inventado', color: 'secondary' })
    })
  })

  describe('mapEstadoOutboxABadge', () => {
    it('mapea cada estado de outbox a { label, color }', () => {
      expect(mapEstadoOutboxABadge('pendiente')).toEqual({ label: 'Pendiente', color: 'secondary' })
      expect(mapEstadoOutboxABadge('enviado')).toEqual({ label: 'Enviado', color: 'success' })
      expect(mapEstadoOutboxABadge('fallido')).toEqual({ label: 'Fallido', color: 'danger' })
    })
  })

  describe('agruparEventosPorFecha', () => {
    it('agrupa eventos de sim_calendario por fecha_inicio exacta', () => {
      const eventos = [
        { id: 'a', fecha_inicio: '2026-03-05T09:00:00-04:00', titulo: 'Reunión' },
        { id: 'b', fecha_inicio: '2026-03-05T09:00:00-04:00', titulo: 'Audición' },
        { id: 'c', fecha_inicio: '2026-04-10T18:00:00-04:00', titulo: 'Concierto' },
      ]
      const grupos = agruparEventosPorFecha(eventos)

      expect(Object.keys(grupos)).toHaveLength(2)
      expect(grupos['2026-03-05T09:00:00-04:00']).toHaveLength(2)
      expect(grupos['2026-04-10T18:00:00-04:00']).toHaveLength(1)
    })

    it('devuelve objeto vacío ante lista vacía', () => {
      expect(agruparEventosPorFecha([])).toEqual({})
    })

    it('ignora eventos sin fecha_inicio', () => {
      const eventos = [{ id: 'a', titulo: 'Sin fecha' }]
      expect(agruparEventosPorFecha(eventos)).toEqual({})
    })
  })
})
