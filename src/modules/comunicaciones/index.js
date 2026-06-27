/**
 * index.js — Punto de entrada del módulo Comunicaciones.
 * Registra la ruta 'comunicaciones' en el router central (portal COM).
 */

import { router } from '../../core/router/router.js'
import { renderComunicacionesView } from './views/comunicacionesView.js'
import { renderSeguimientoView } from './views/seguimientoView.js'
import { renderCalendarioComView } from './views/calendarioComView.js'

export function registerRoutesComunicaciones() {
  router.register('comunicaciones', (mount) => renderComunicacionesView(mount))
  router.register('com-seguimiento', (mount) => renderSeguimientoView(mount))
  router.register('com-calendario', (mount) => renderCalendarioComView(mount))
}
