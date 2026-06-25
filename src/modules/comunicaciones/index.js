/**
 * index.js — Punto de entrada del módulo Comunicaciones.
 * Registra la ruta 'comunicaciones' en el router central (portal COM).
 */

import { router } from '../../core/router/router.js'
import { renderComunicacionesView } from './views/comunicacionesView.js'

export function registerRoutesComunicaciones() {
  router.register('comunicaciones', (mount) => renderComunicacionesView(mount))
}
