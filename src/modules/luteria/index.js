/**
 * index.js — Punto de entrada del módulo Lutería.
 * Registra las rutas del portal en el router central.
 * Loop 17: agregada ruta 'luteria-ordenes' para gestión de órdenes.
 */

import { router } from '../../core/router/router.js'
import { renderLuteriaView } from './views/luteriaView.js'
import { renderLuteriaOrdenesView } from './views/luteriaOrdenesView.js'

export function registerRoutesLuteria() {
  router.register('luteria-diagnosticos', (mount) => renderLuteriaView(mount))
  router.register('luteria-ordenes', (mount) => renderLuteriaOrdenesView(mount))
}
