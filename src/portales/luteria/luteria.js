/**
 * luteria.js — Portal del Taller de Lutería (LUT).
 * Consume tareas Hermes del departamento LUT y expone la vista
 * de diagnósticos de instrumentos (dañados / en reparación).
 *
 * Gating: rol 'admin' por ahora.
 */

import { bootAdminPortal } from '../_shared/adminPortalShell.js'
import { allRegistrars } from '../_shared/allRegistrars.js'

const navGroups = [
  {
    id: 'taller',
    label: 'Taller',
    icon: 'bi-tools',
    items: [
      { id: 'luteria-diagnosticos', label: 'Diagnósticos', icon: 'bi-wrench-adjustable' },
      { id: 'hermes-tareas', label: 'Tareas Institucionales', icon: 'bi-check2-square' },
    ],
  },
]

bootAdminPortal({
  brandText: 'SOI · Lutería',
  brandIcon: 'bi-tools',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin'],
  defaultRoute: 'luteria-diagnosticos',
  hermesDept: 'LUT',
}).catch((err) => {
  console.error('[luteria] boot falló:', err)
  const app = document.querySelector('#app')
  if (app)
    app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Lutería</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
