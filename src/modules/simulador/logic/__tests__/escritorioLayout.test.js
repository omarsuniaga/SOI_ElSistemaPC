import { describe, it, expect } from 'vitest'
import { DEPARTAMENTOS_SALA, calcularLayoutEscritorios, mapearLayout2Da3D, construirGrafoWaypoints } from '../escritorioLayout.js'

describe('escritorioLayout', () => {
  describe('DEPARTAMENTOS_SALA', () => {
    it('contiene exactamente los 7 departamentos operativos en orden estable', () => {
      expect(DEPARTAMENTOS_SALA).toEqual(['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO'])
    })
  })

  describe('calcularLayoutEscritorios', () => {
    it('devuelve una posición {x,y,w,h} por cada departamento', () => {
      const layout = calcularLayoutEscritorios({ width: 800, height: 400 })
      expect(Object.keys(layout).sort()).toEqual([...DEPARTAMENTOS_SALA].sort())
      for (const dept of DEPARTAMENTOS_SALA) {
        expect(layout[dept]).toMatchObject({
          x: expect.any(Number),
          y: expect.any(Number),
          w: expect.any(Number),
          h: expect.any(Number),
        })
      }
    })

    it('todas las posiciones caen dentro del lienzo (sin overflow)', () => {
      const width = 900
      const height = 450
      const layout = calcularLayoutEscritorios({ width, height })
      for (const dept of DEPARTAMENTOS_SALA) {
        const pos = layout[dept]
        expect(pos.x).toBeGreaterThanOrEqual(0)
        expect(pos.y).toBeGreaterThanOrEqual(0)
        expect(pos.x + pos.w).toBeLessThanOrEqual(width)
        expect(pos.y + pos.h).toBeLessThanOrEqual(height)
      }
    })

    it('no genera escritorios superpuestos (bounding boxes disjuntos)', () => {
      const layout = calcularLayoutEscritorios({ width: 800, height: 400 })
      const entries = Object.entries(layout)
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [, a] = entries[i]
          const [, b] = entries[j]
          const overlapX = a.x < b.x + b.w && b.x < a.x + a.w
          const overlapY = a.y < b.y + b.h && b.y < a.y + a.h
          expect(overlapX && overlapY).toBe(false)
        }
      }
    })

    it('es determinista: mismas dimensiones producen el mismo layout', () => {
      const layout1 = calcularLayoutEscritorios({ width: 800, height: 400 })
      const layout2 = calcularLayoutEscritorios({ width: 800, height: 400 })
      expect(layout1).toEqual(layout2)
    })

    it('escala proporcionalmente con las dimensiones del lienzo', () => {
      const chico = calcularLayoutEscritorios({ width: 400, height: 200 })
      const grande = calcularLayoutEscritorios({ width: 800, height: 400 })
      // El escritorio DIR en el lienzo grande debe ser ~2x más ancho que en el chico
      expect(grande.DIR.w).toBeCloseTo(chico.DIR.w * 2, 0)
    })

    it('lanza si width o height no son positivos', () => {
      expect(() => calcularLayoutEscritorios({ width: 0, height: 400 })).toThrow()
      expect(() => calcularLayoutEscritorios({ width: 800, height: -1 })).toThrow()
    })
  })

  describe('mapearLayout2Da3D', () => {
    const layout2DFijo = calcularLayoutEscritorios({ width: 800, height: 400 })

    it('devuelve {x,z} por cada departamento a partir del layout 2D', () => {
      const layout3D = mapearLayout2Da3D(layout2DFijo)
      for (const dept of DEPARTAMENTOS_SALA) {
        expect(layout3D[dept]).toMatchObject({ x: expect.any(Number), z: expect.any(Number) })
      }
    })

    it('las coordenadas XZ usan el centro del escritorio 2D (x + w/2, y + h/2)', () => {
      const layout3D = mapearLayout2Da3D(layout2DFijo)
      for (const dept of DEPARTAMENTOS_SALA) {
        const pos2D = layout2DFijo[dept]
        expect(layout3D[dept].x).toBe(pos2D.x + pos2D.w / 2)
        expect(layout3D[dept].z).toBe(pos2D.y + pos2D.h / 2)
      }
    })

    it('aplica escala a las coordenadas', () => {
      const layout3D = mapearLayout2Da3D(layout2DFijo, { escala: 2 })
      expect(layout3D.DIR.x).toBeCloseTo((layout2DFijo.DIR.x + layout2DFijo.DIR.w / 2) * 2)
    })

    it('aplica origenZ como desplazamiento en Z', () => {
      const layout3D = mapearLayout2Da3D(layout2DFijo, { origenZ: 100 })
      expect(layout3D.DIR.z).toBe(layout2DFijo.DIR.y + layout2DFijo.DIR.h / 2 + 100)
    })

    it('es determinista: mismas entradas producen el mismo resultado', () => {
      const a = mapearLayout2Da3D(layout2DFijo)
      const b = mapearLayout2Da3D(layout2DFijo)
      expect(a).toEqual(b)
    })

    it('lanza si layout2D es null/undefined', () => {
      expect(() => mapearLayout2Da3D(null)).toThrow()
      expect(() => mapearLayout2Da3D(undefined)).toThrow()
    })
  })

  describe('construirGrafoWaypoints', () => {
    const layout2D = calcularLayoutEscritorios({ width: 800, height: 400 })
    const layout3D = mapearLayout2Da3D(layout2D)

    it('devuelve waypoints y adyacencias', () => {
      const grafo = construirGrafoWaypoints(layout3D)
      expect(grafo).toHaveProperty('waypoints')
      expect(grafo).toHaveProperty('adyacencias')
    })

    it('cada waypoint tiene {x,z}', () => {
      const grafo = construirGrafoWaypoints(layout3D)
      for (const wp of Object.values(grafo.waypoints)) {
        expect(wp).toMatchObject({ x: expect.any(Number), z: expect.any(Number) })
      }
    })

    it('cada departamento tiene al menos una adyacencia', () => {
      const grafo = construirGrafoWaypoints(layout3D)
      for (const dept of DEPARTAMENTOS_SALA) {
        expect(grafo.adyacencias[dept]).toBeDefined()
        expect(grafo.adyacencias[dept].length).toBeGreaterThanOrEqual(1)
      }
    })

    it('es determinista: sin recalculo dinámico', () => {
      const a = construirGrafoWaypoints(layout3D)
      const b = construirGrafoWaypoints(layout3D)
      expect(a).toEqual(b)
    })
  })
})
