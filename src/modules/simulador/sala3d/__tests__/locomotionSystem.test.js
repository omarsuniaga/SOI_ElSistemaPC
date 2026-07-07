import { describe, it, expect } from 'vitest'
import { construirRuta, posicionEnT, crearColaLocomocion } from '../locomotionSystem.js'

describe('locomotionSystem', () => {
  const grafoEjemplo = {
    waypoints: {
      pasillo_arriba: { x: 0, z: 100 },
      pasillo_abajo: { x: 0, z: 300 },
    },
    adyacencias: {
      DIR: ['pasillo_arriba'],
      ACM: ['pasillo_arriba'],
      ADM: ['pasillo_arriba'],
      FIN: ['pasillo_arriba'],
      LOG: ['pasillo_abajo'],
      COM: ['pasillo_abajo'],
      TECNICO: ['pasillo_abajo'],
      pasillo_arriba: ['pasillo_abajo', 'DIR', 'ACM', 'ADM', 'FIN'],
      pasillo_abajo: ['pasillo_arriba', 'LOG', 'COM', 'TECNICO'],
    },
  }

  const layoutEjemplo = {
    DIR: { x: 50, z: 100 }, ACM: { x: 200, z: 100 }, ADM: { x: 350, z: 100 }, FIN: { x: 500, z: 100 },
    LOG: { x: 50, z: 300 }, COM: { x: 200, z: 300 }, TECNICO: { x: 350, z: 300 },
  }

  describe('construirRuta', () => {
    it('devuelve un array de waypoints {x,z} conectando origen y destino', () => {
      const ruta = construirRuta(layoutEjemplo.DIR, layoutEjemplo.LOG, grafoEjemplo)
      expect(Array.isArray(ruta)).toBe(true)
      expect(ruta.length).toBeGreaterThanOrEqual(2)
      expect(ruta[0]).toEqual(layoutEjemplo.DIR)
      expect(ruta[ruta.length - 1]).toEqual(layoutEjemplo.LOG)
    })

    it('misma ruta en 2 llamadas es determinista', () => {
      const ruta1 = construirRuta(layoutEjemplo.DIR, layoutEjemplo.LOG, grafoEjemplo)
      const ruta2 = construirRuta(layoutEjemplo.DIR, layoutEjemplo.LOG, grafoEjemplo)
      expect(ruta1).toEqual(ruta2)
    })

    it('ruta entre escritorios de distinta fila pasa por pasillo_arriba y pasillo_abajo', () => {
      const ruta = construirRuta(layoutEjemplo.DIR, layoutEjemplo.LOG, grafoEjemplo)
      expect(ruta).toContainEqual(grafoEjemplo.waypoints.pasillo_arriba)
      expect(ruta).toContainEqual(grafoEjemplo.waypoints.pasillo_abajo)
    })

    it('ruta entre escritorios de la misma fila pasa solo por el pasillo de esa fila', () => {
      const ruta = construirRuta(layoutEjemplo.DIR, layoutEjemplo.ACM, grafoEjemplo)
      expect(ruta).toContainEqual(grafoEjemplo.waypoints.pasillo_arriba)
      expect(ruta).not.toContainEqual(grafoEjemplo.waypoints.pasillo_abajo)
    })

    it('lanza si origen o destino no existen', () => {
      expect(() => construirRuta(null, layoutEjemplo.LOG, grafoEjemplo)).toThrow()
      expect(() => construirRuta(layoutEjemplo.DIR, undefined, grafoEjemplo)).toThrow()
    })
  })

  describe('posicionEnT', () => {
    const rutaCorta = [
      { x: 50, z: 100 },
      { x: 0, z: 100 },
      { x: 0, z: 300 },
      { x: 50, z: 300 },
    ]

    it('devuelve {x,z,terminado,anguloOrientacion}', () => {
      const resultado = posicionEnT(rutaCorta, 0, 2)
      expect(resultado).toMatchObject({
        x: expect.any(Number),
        z: expect.any(Number),
        terminado: expect.any(Boolean),
        anguloOrientacion: expect.any(Number),
      })
    })

    it('en t=0 está en el origen de la ruta', () => {
      const resultado = posicionEnT(rutaCorta, 0, 2)
      expect(resultado.x).toBe(rutaCorta[0].x)
      expect(resultado.z).toBe(rutaCorta[0].z)
      expect(resultado.terminado).toBe(false)
    })

    it('al llegar al final, terminado=true y está en el destino', () => {
      const resultado = posicionEnT(rutaCorta, 999, 2)
      expect(resultado.terminado).toBe(true)
      expect(resultado.x).toBe(rutaCorta[rutaCorta.length - 1].x)
      expect(resultado.z).toBe(rutaCorta[rutaCorta.length - 1].z)
    })

    it('anguloOrientacion es coherente con la dirección del tramo', () => {
      const rutaVertical = [
        { x: 0, z: 100 },
        { x: 0, z: 300 },
      ]
      const res = posicionEnT(rutaVertical, 0.5, 2)
      expect(res.anguloOrientacion).toBeCloseTo(Math.PI / 2, 1) // hacia +Z, ángulo ~π/2
    })

    it('velocidad por defecto es 2 u/seg', () => {
      const resSinVel = posicionEnT(rutaCorta, 1, undefined)
      const resConVel = posicionEnT(rutaCorta, 1, 2)
      expect(resSinVel).toEqual(resConVel)
    })
  })

  describe('crearColaLocomocion', () => {
    it('arranca idle sin posición', () => {
      const cola = crearColaLocomocion(layoutEjemplo.DIR)
      expect(cola.getEstado()).toBe('idle')
      expect(cola.getPosicionActual()).toEqual(layoutEjemplo.DIR)
    })

    it('encolar un destino cambia a walking', () => {
      const cola = crearColaLocomocion(layoutEjemplo.DIR)
      cola.encolarDestino(layoutEjemplo.LOG, grafoEjemplo)
      expect(cola.getEstado()).toBe('walking')
    })

    it('FIFO: encola múltiples destinos y los procesa uno a la vez', () => {
      const cola = crearColaLocomocion(layoutEjemplo.DIR)
      cola.encolarDestino(layoutEjemplo.LOG, grafoEjemplo)
      cola.encolarDestino(layoutEjemplo.ACM, grafoEjemplo)
      expect(cola.getColaLength()).toBe(1)
    })

    it('tick(deltaSeg) avanza la posición a lo largo de la ruta', () => {
      const cola = crearColaLocomocion(layoutEjemplo.DIR)
      cola.encolarDestino(layoutEjemplo.LOG, grafoEjemplo)

      const antes = cola.getPosicionActual()
      cola.tick(0.5)
      const despues = cola.getPosicionActual()

      expect(antes).not.toEqual(despues)
    })

    it('al completar un destino, procesa el siguiente en cola o vuelve a idle', () => {
      const cola = crearColaLocomocion(layoutEjemplo.DIR)
      cola.encolarDestino(layoutEjemplo.ACM, grafoEjemplo)
      cola.tick(999)
      expect(cola.getEstado()).toBe('idle')
      expect(cola.getPosicionActual()).toEqual(layoutEjemplo.ACM)
    })

    it('reset() vuelve a idle y limpia cola', () => {
      const cola = crearColaLocomocion(layoutEjemplo.DIR)
      cola.encolarDestino(layoutEjemplo.LOG, grafoEjemplo)
      cola.encolarDestino(layoutEjemplo.ACM, grafoEjemplo)
      cola.reset()
      expect(cola.getEstado()).toBe('idle')
      expect(cola.getColaLength()).toBe(0)
    })
  })
})
