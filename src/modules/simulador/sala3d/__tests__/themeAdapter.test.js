import { describe, it, expect } from 'vitest'
import { tokensTemaATresColores } from '../themeAdapter.js'

describe('themeAdapter', () => {
  describe('tokensTemaATresColores', () => {
    it('devuelve los mismos hex que _colorTema() de salaTrabajoView.js en modo oscuro', () => {
      const colores = tokensTemaATresColores(true)
      expect(colores).toEqual({
        fondo: '#1e1e2e',
        escritorio: '#2a2a3d',
        borde: '#44445a',
        texto: '#e4e4f0',
        muneco: '#8b9cff',
        working: '#f0ad4e',
        talking: '#5cb85c',
        dialogoFondo: '#33334a',
      })
    })

    it('devuelve los mismos hex que _colorTema() de salaTrabajoView.js en modo claro', () => {
      const colores = tokensTemaATresColores(false)
      expect(colores).toEqual({
        fondo: '#f5f5fa',
        escritorio: '#ffffff',
        borde: '#d8d8e6',
        texto: '#2b2b3a',
        muneco: '#4c5fd5',
        working: '#f0ad4e',
        talking: '#5cb85c',
        dialogoFondo: '#ffffff',
      })
    })

    it('working y talking son iguales en ambos temas (no cambian con dark/light)', () => {
      const oscuro = tokensTemaATresColores(true)
      const claro = tokensTemaATresColores(false)
      expect(oscuro.working).toBe(claro.working)
      expect(oscuro.talking).toBe(claro.talking)
    })

    it('es función pura: misma entrada produce misma salida', () => {
      const a = tokensTemaATresColores(true)
      const b = tokensTemaATresColores(true)
      expect(a).toEqual(b)
    })
  })
})
