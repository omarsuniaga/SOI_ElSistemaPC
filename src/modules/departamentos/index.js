/**
 * index.js — Punto de entrada del módulo Departamentos (gestión de correos).
 * Registra la ruta 'departamentos' en el router central (portal ADM).
 */

import { router } from '../../core/router/router.js'
import { renderDepartamentosView } from './views/departamentosView.js'

export function registerRoutesDepartamentos() {
  router.register('departamentos', (mount) => renderDepartamentosView(mount))
}
