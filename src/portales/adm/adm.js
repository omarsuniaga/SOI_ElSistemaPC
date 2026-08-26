/**
 * adm.js — Portal del Departamento de Administración (ADM).
 * Lente sobre los módulos administrativos: inscripción de alumnos, datos de maestros,
 * postulados, clases del día, gestión de clases, salones, calendario de citas,
 * control de asistencias, sistema/config y tareas Hermes del depto ADM.
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
    ],
  },
  {
    id: 'operacion',
    label: 'Operación',
    icon: 'bi-clipboard-data',
    items: [
      { id: 'clases-hoy', label: 'Clases de Hoy', icon: 'bi-calendar-day' },
      { id: 'asistencias', label: 'Control de Asistencias', icon: 'bi-calendar-check' },
      { id: 'clases', label: 'Gestión de Clases', icon: 'bi-easel2' },
      { id: 'salones', label: 'Salones & Espacios', icon: 'bi-door-closed' },
      { id: 'periodos', label: 'Período Académico', icon: 'bi-calendar-event' },
      { id: 'admin-dashboard', label: 'Cumplimiento Maestros', icon: 'bi-clipboard-check' },
    ],
  },
  {
    id: 'bandeja',
    label: 'Bandeja',
    icon: 'bi-inbox',
    items: [
      { id: 'hermes-tareas', label: 'Tareas Institucionales', icon: 'bi-check2-square' },
      { id: 'seguimiento-tareas', label: 'Seguimiento de Tareas', icon: 'bi-list-check' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: 'bi-file-earmark-bar-graph',
    items: [
      { id: 'reporte-mensual', label: 'Resumen del Mes', icon: 'bi-graph-up' },
      { id: 'analisis-contenido', label: 'Análisis Pedagógico', icon: 'bi-journal-text' },
      {
        id: 'reporte-semestral',
        label: 'Informe del Período',
        icon: 'bi-journal-bookmark',
        badge: 'Cierre de Ciclo',
        badgeClass: 'badge bg-secondary-subtle text-secondary border',
      },
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
      { id: 'permisos', label: 'Permisos', icon: 'bi-shield-lock' },
    ],
  },
]

bootAdminPortal({
  brandText: 'SOI · Administración',
  brandIcon: 'bi-clipboard-data',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin'],
  defaultRoute: 'clases-hoy',
  hermesDept: 'ADM',
}).catch((err) => {
  console.error('[adm] boot falló:', err)
  const app = document.querySelector('#app')
  if (app) app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Administración</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
