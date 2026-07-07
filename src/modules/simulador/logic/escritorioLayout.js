/**
 * escritorioLayout.js — Layout puro de los 7 escritorios departamentales de
 * la Sala de Trabajo (Slice 4). Calcula posiciones {x,y,w,h} en una grilla
 * 4x2 (4 columnas x 2 filas, el último hueco queda vacío) sobre el lienzo
 * Canvas, sin tocar el DOM ni el contexto 2D — testeable puro.
 *
 * Design ref: sdd/portal-simulador/design (obs #2723), decisión #6
 * (Canvas 2D nativo, sin librería de juego).
 */

export const DEPARTAMENTOS_SALA = Object.freeze(['DIR', 'ACM', 'ADM', 'FIN', 'LOG', 'COM', 'TECNICO'])

const COLUMNAS = 4
const FILAS = 2
const PADDING_RATIO = 0.08 // separación entre escritorios, proporcional al tamaño de celda

/**
 * Calcula la posición de cada escritorio departamental dentro de un lienzo
 * de `width` x `height`, distribuidos en una grilla determinista de
 * COLUMNAS x FILAS (con hueco final vacío, ya que 7 no llena 4x2=8).
 *
 * @param {{ width: number, height: number }} dimensiones
 * @returns {Record<string, {x:number, y:number, w:number, h:number}>}
 */
export function calcularLayoutEscritorios({ width, height } = {}) {
  if (!(width > 0)) throw new Error('width debe ser un número mayor que 0')
  if (!(height > 0)) throw new Error('height debe ser un número mayor que 0')

  const celdaW = width / COLUMNAS
  const celdaH = height / FILAS
  const padX = celdaW * PADDING_RATIO
  const padY = celdaH * PADDING_RATIO

  const layout = {}
  DEPARTAMENTOS_SALA.forEach((dept, index) => {
    const col = index % COLUMNAS
    const fila = Math.floor(index / COLUMNAS)

    layout[dept] = {
      x: col * celdaW + padX,
      y: fila * celdaH + padY,
      w: celdaW - padX * 2,
      h: celdaH - padY * 2,
    }
  })

  return layout
}

export function mapearLayout2Da3D(layout2D, opciones = {}) {
  if (!layout2D || typeof layout2D !== 'object') throw new Error('layout2D es requerido')

  const { escala = 1, origenZ = 0 } = opciones
  const resultado = {}

  for (const [dept, pos] of Object.entries(layout2D)) {
    resultado[dept] = {
      x: (pos.x + pos.w / 2) * escala,
      z: (pos.y + pos.h / 2) * escala + origenZ,
    }
  }

  return resultado
}

export function construirGrafoWaypoints(layout3D) {
  if (!layout3D) throw new Error('layout3D es requerido')

  const fila0 = DEPARTAMENTOS_SALA.slice(0, 4)
  const fila1 = DEPARTAMENTOS_SALA.slice(4)

  const zFila0 = fila0.reduce((s, d) => s + layout3D[d].z, 0) / fila0.length
  const zFila1 = fila1.reduce((s, d) => s + layout3D[d].z, 0) / fila1.length

  const xs = fila0.map(d => layout3D[d].x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const hallwayX = minX - (maxX - minX) * 0.15

  const waypoints = {
    pasillo_arriba: { x: hallwayX, z: zFila0 },
    pasillo_abajo: { x: hallwayX, z: zFila1 },
  }

  const adyacencias = {
    pasillo_arriba: ['pasillo_abajo'],
    pasillo_abajo: ['pasillo_arriba'],
  }

  for (const d of fila0) adyacencias[d] = ['pasillo_arriba']
  for (const d of fila1) adyacencias[d] = ['pasillo_abajo']

  return { waypoints, adyacencias }
}
