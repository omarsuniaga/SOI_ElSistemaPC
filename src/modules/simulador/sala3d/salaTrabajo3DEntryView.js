/**
 * salaTrabajo3DEntryView.js — Entry point con detección WebGL.
 *
 * Detecta WebGL: si está disponible, hace dynamic import de three.js y
 * salaTrabajo3dView; si no, cae a la vista 2D (salaTrabajoView).
 * Cualquier error en el 3D también cae a 2D con un warn.
 *
 * Patrón: render(container) -> { teardown() }
 */

import { puedeUsarWebGL } from './webglDetection.js'

export async function render(container) {
  const webglOk = puedeUsarWebGL()

  if (webglOk) {
    try {
      const THREE = await import('three')
      const { renderSalaTrabajo3dView } = await import('./salaTrabajo3dView.js')
      const opciones = {}
      return await renderSalaTrabajo3dView(container, opciones, THREE)
    } catch (err) {
      console.warn('[salaTrabajo3DEntryView] 3D falló, cayendo a 2D:', err.message)
    }
  }

  const { renderSalaTrabajoView } = await import('../views/salaTrabajoView.js')
  return renderSalaTrabajoView(container, { modoFallback: true })
}
