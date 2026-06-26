/**
 * adm.js — Portal del Departamento de Administración (ADM).
 * Lente sobre los módulos administrativos: inscripción de alumnos, datos de maestros,
 * postulados, calendario de citas, resumen de asistencias, sistema/config y tareas
 * Hermes del depto ADM.
 *
 * Gating: rol 'admin' por ahora (rol fino 'administrador' a futuro).
 */

import { bootAdminPortal } from '../_shared/adminPortalShell.js'
import { allRegistrars } from '../_shared/allRegistrars.js'

const navGroups = [
  {
    id: 'personas',
    label: 'Personas',
    icon: 'bi-people',
    items: [
      { id: 'alumnos', label: 'Alumnos', icon: 'bi-people' },
      { id: 'maestros', label: 'Maestros', icon: 'bi-person-check' },
      { id: 'postulados', label: 'Postulados', icon: 'bi-person-plus-fill' },
      { id: 'postulados-calendario', label: 'Calendario Citas', icon: 'bi-calendar-event' },
    ],
  },
  {
    id: 'operacion',
    label: 'Operación',
    icon: 'bi-clipboard-data',
    items: [
      { id: 'campanias', label: 'Períodos / Campañas', icon: 'bi-megaphone' },
      { id: 'gateway-config', label: 'Gateway WhatsApp', icon: 'bi-chat-dots' },
      { id: 'asistencias', label: 'Resumen Asistencias', icon: 'bi-calendar-check' },
      { id: 'admin-dashboard', label: 'Cumplimiento Maestros', icon: 'bi-clipboard-check' },
      { id: 'admin-ausencias', label: 'Gestión Ausencias', icon: 'bi-calendar-x' },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: 'bi-gear',
    items: [
      { id: 'admin-notificaciones', label: 'Centro de Actividad', icon: 'bi-bell' },
      { id: 'admin-aprobacion', label: 'Aprobaciones', icon: 'bi-person-check' },
      { id: 'gestion-usuarios', label: 'Gestión de Usuarios', icon: 'bi-person-gear' },
      { id: 'departamentos', label: 'Correos Departamentos', icon: 'bi-envelope-at' },
      { id: 'configuracion', label: 'Configuración', icon: 'bi-sliders' },
      { id: 'permisos', label: 'Permisos', icon: 'bi-shield-lock' },
    ],
  },
  {
    id: 'hermes',
    label: 'Hermes',
    icon: 'bi-robot',
    items: [{ id: 'hermes-tareas', label: 'Tareas Institucionales', icon: 'bi-check2-square' }],
  },
]

bootAdminPortal({
  brandText: 'SOI · Administración',
  brandIcon: 'bi-clipboard-data',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin'],
  defaultRoute: 'alumnos',
  hermesDept: 'ADM',
}).catch((err) => {
  console.error('[adm] boot falló:', err)
  const app = document.querySelector('#app')
  if (app) app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Administración</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
