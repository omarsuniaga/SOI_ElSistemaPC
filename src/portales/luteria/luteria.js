/**
 * luteria.js — Portal del Taller de Lutería (LUT).
 * Consume tareas Hermes del departamento LUT y expone la vista
 * de diagnósticos de instrumentos (dañados / en reparación).
 *
 * Gating: rol 'admin' por ahora.
 */

import '../../modules/luteria/styles/luteria.css'
import { bootAdminPortal } from '../_shared/adminPortalShell.js'
import { allRegistrars } from '../_shared/allRegistrars.js'

const navGroups = [
  {
    id: 'taller',
    label: 'Taller & Control',
    icon: 'bi-tools',
    items: [
      { id: 'luteria-dashboard', label: 'Dashboard de Taller', icon: 'bi-grid-1x2' },
      { id: 'luteria-diagnosticos', label: 'Diagnósticos & Triaje', icon: 'bi-wrench-adjustable' },
      { id: 'luteria-ordenes', label: 'Tablero de Órdenes', icon: 'bi-kanban' },
    ],
  },
  {
    id: 'almacen',
    label: 'Almacén & Repuestos',
    icon: 'bi-box-seam',
    items: [
      { id: 'luteria-insumos', label: 'Insumos & Repuestos', icon: 'bi-boxes' },
    ],
  },
  {
    id: 'bandeja',
    label: 'Bandeja',
    icon: 'bi-inbox',
    items: [
      { id: 'hermes-tareas', label: 'Tareas de Taller', icon: 'bi-check2-square' },
    ],
  },
]

bootAdminPortal({
  brandText: 'SOI · Lutería',
  brandIcon: 'bi-tools',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin', 'superadmin'],
  defaultRoute: 'luteria-dashboard',
  hermesDept: 'LUT',
}).catch((err) => {
  console.error('[luteria] boot falló:', err)
  const app = document.querySelector('#app')
  if (app)
    app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Lutería</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
