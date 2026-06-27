/**
 * com.js — Portal del Departamento de Comunicaciones (COM).
 * Departamento sin módulos CRUD propios todavía: su foco son las tareas
 * institucionales que Hermes le delega (difusión, prensa, redes, piezas gráficas)
 * y el Centro de Actividad (notificaciones). Lente Hermes-first.
 *
 * Gating: rol 'admin' por ahora (rol fino 'comunicaciones' a futuro).
 */

import { bootAdminPortal } from '../_shared/adminPortalShell.js'
import { allRegistrars } from '../_shared/allRegistrars.js'

const navGroups = [
  {
    id: 'central',
    label: 'Central',
    icon: 'bi-megaphone',
    items: [
      { id: 'comunicaciones', label: 'Central de Comunicaciones', icon: 'bi-send' },
      { id: 'com-instituciones', label: 'Directorio B2B', icon: 'bi-building' },
      { id: 'com-campanias', label: 'Campañas Marketing', icon: 'bi-megaphone' },
      { id: 'com-seguimiento', label: 'Seguimiento', icon: 'bi-telephone-outbound' },
      { id: 'com-calendario', label: 'Calendario', icon: 'bi-calendar-week' },
      { id: 'hermes-tareas', label: 'Tareas Institucionales', icon: 'bi-check2-square' },
      { id: 'admin-notificaciones', label: 'Centro de Actividad', icon: 'bi-bell' },
    ],
  },
  {
    id: 'analisis',
    label: 'Análisis',
    icon: 'bi-bar-chart-line',
    items: [
      { id: 'metricas', label: 'Métricas', icon: 'bi-bar-chart-line' },
    ],
  },
]

bootAdminPortal({
  brandText: 'SOI · Comunicaciones',
  brandIcon: 'bi-megaphone',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin'],
  defaultRoute: 'comunicaciones',
  hermesDept: 'COM',
}).catch((err) => {
  console.error('[com] boot falló:', err)
  const app = document.querySelector('#app')
  if (app) app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Comunicaciones</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
