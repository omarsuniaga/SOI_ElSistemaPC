/**
 * simulador.js — Portal del Simulador operativo institucional (Slice 3).
 * Sandbox de simulación de un año escolar completo; consume las tablas
 * `sim_*` y la edge function `simulador-tick` (ver design obs #2723).
 *
 * Gating: rol 'admin' — es una herramienta de Dirección/desarrollo, no un
 * departamento operativo real (design decisión #8: hermesDept='DIR').
 */

import { bootAdminPortal } from '../_shared/adminPortalShell.js'
import { allRegistrars } from '../_shared/allRegistrars.js'

const navGroups = [
  {
    id: 'simulador',
    label: 'Simulador',
    icon: 'bi-joystick',
    items: [
      { id: 'simulador-sala-trabajo', label: 'Sala de Trabajo', icon: 'bi-easel2' },
      { id: 'simulador-panel-control', label: 'Panel de Control', icon: 'bi-sliders' },
      { id: 'simulador-calendario', label: 'Calendario de la Corrida', icon: 'bi-calendar-event' },
      { id: 'simulador-log', label: 'Log', icon: 'bi-journal-text' },
      { id: 'simulador-outbox', label: 'Outbox', icon: 'bi-send' },
    ],
  },
]

bootAdminPortal({
  brandText: 'SOI · Simulador',
  brandIcon: 'bi-joystick',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin'],
  defaultRoute: 'simulador-panel-control',
  hermesDept: 'DIR',
}).catch((err) => {
  console.error('[simulador] boot falló:', err)
  const app = document.querySelector('#app')
  if (app)
    app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Simulador</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
