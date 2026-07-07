/**
 * index.js — Punto de entrada del módulo Simulador.
 * Registra las rutas del portal en el router central (Slice 3 + Slice 4).
 * La ruta 'simulador-sala-trabajo' usa la entrada 3D con fallback 2D
 * (salaTrabajo3DEntryView) que detecta WebGL y decide el render.
 */

import { router } from '../../core/router/router.js'
import { renderPanelControlView } from './views/panelControlView.js'
import { renderCalendarioRunView } from './views/calendarioRunView.js'
import { renderLogView } from './views/logView.js'
import { renderOutboxView } from './views/outboxView.js'
import { render as renderSalaTrabajo3DEntry } from './sala3d/salaTrabajo3DEntryView.js'

export function registerRoutesSimulador() {
  router.register('simulador-sala-trabajo', (mount) => renderSalaTrabajo3DEntry(mount))
  router.register('simulador-panel-control', (mount) => renderPanelControlView(mount))
  router.register('simulador-calendario', (mount) => renderCalendarioRunView(mount))
  router.register('simulador-log', (mount) => renderLogView(mount))
  router.register('simulador-outbox', (mount) => renderOutboxView(mount))
}
