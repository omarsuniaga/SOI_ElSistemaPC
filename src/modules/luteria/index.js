/**
 * index.js — Punto de entrada del módulo Lutería.
 * Registra la ruta 'luteria-diagnosticos' en el router central.
 */

import { router } from '../../core/router/router.js'
import { renderLuteriaView } from './views/luteriaView.js'

export function registerRoutesLuteria() {
  router.register('luteria-diagnosticos', (mount) => renderLuteriaView(mount))
}
