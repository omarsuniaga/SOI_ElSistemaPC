/**
 * tecnico.js — Portal del Departamento Técnico (TECNICO).
 * Departamento de bajo volumen sin módulos CRUD propios: su foco son las tareas
 * institucionales que Hermes le delega (sonido, escenario, soporte técnico,
 * mantenimiento de instrumentos) y el Centro de Actividad. Lente Hermes-first.
 *
 * Gating: rol 'admin' por ahora (rol fino 'tecnico' a futuro).
 */

import { bootAdminPortal } from '../_shared/adminPortalShell.js'
import { allRegistrars } from '../_shared/allRegistrars.js'

const navGroups = [
  {
    id: 'operacion',
    label: 'Operación',
    icon: 'bi-tools',
    items: [
      { id: 'hermes-tareas', label: 'Tareas Institucionales', icon: 'bi-check2-square' },
      { id: 'admin-notificaciones', label: 'Centro de Actividad', icon: 'bi-bell' },
    ],
  },
]

bootAdminPortal({
  brandText: 'SOI · Técnico',
  brandIcon: 'bi-tools',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin'],
  defaultRoute: 'hermes-tareas',
  hermesDept: 'TECNICO',
}).catch((err) => {
  console.error('[tecnico] boot falló:', err)
  const app = document.querySelector('#app')
  if (app) app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Técnico</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
