/**
 * adm.js — Portal del Departamento de Administración (ADM).
 * Lente sobre los módulos administrativos: inscripción de alumnos, datos de maestros,
 * postulados, clases del día, gestión de clases, salones, calendario de citas,
 * control de asistencias, sistema/config y tareas Hermes del depto ADM.
 *
 * Gating: 'admin', 'superadmin' y 'coordinacion_academica'.
 */

import { bootAdminPortal } from '../_shared/adminPortalShell.js'
import { allRegistrars } from '../_shared/allRegistrars.js'

const navGroups = [
  {
    id: 'personas',
    label: 'Personas',
    icon: 'bi-people',
    items: [
      { id: 'ficha-360', label: 'Ficha 360° Alumnos', icon: 'bi-stars' },
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
      {
        id: 'clases-hoy',
        label: 'Clases de Hoy',
        icon: 'bi-calendar-day',
        badge: '1',
        badgeClass: 'badge bg-success-subtle text-success border border-success-subtle rounded-circle px-1.5 py-0.5',
      },
      { id: 'clases', label: 'Gestión de Clases', icon: 'bi-calendar3' },
      {
        id: 'salones',
        label: 'Salones',
        icon: 'bi-door-open',
        badge: '4',
        badgeClass: 'badge bg-success-subtle text-success border border-success-subtle rounded-circle px-1.5 py-0.5',
      },
      {
        id: 'periodos',
        label: 'Períodos Académicos',
        icon: 'bi-calendar-event',
        badge: '5',
        badgeClass: 'badge bg-primary-subtle text-primary border border-primary-subtle rounded-circle px-1.5 py-0.5',
      },
      {
        id: 'asistencias',
        label: 'Resumen Asistencias',
        icon: 'bi-calendar-check',
        badge: '3',
        badgeClass: 'badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-circle px-1.5 py-0.5',
      },
      {
        id: 'admin-dashboard',
        label: 'Cumplimiento Maestros',
        icon: 'bi-clipboard-check',
        badge: '2',
        badgeClass: 'badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-circle px-1.5 py-0.5',
      },
      { id: 'admin-ausencias', label: 'Gestión Ausencias', icon: 'bi-calendar-x' },
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
    id: 'bandeja',
    label: 'Bandeja & Hermes',
    icon: 'bi-inbox',
    items: [
      { id: 'hermes-tareas', label: 'Tablero Kanban & Tareas', icon: 'bi-kanban-fill' },
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
  allowedRoles: ['admin', 'superadmin', 'coordinacion_academica'],
  defaultRoute: 'clases-hoy',
  hermesDept: 'ADM',
}).catch((err) => {
  console.error('[adm] boot falló:', err)
  const app = document.querySelector('#app')
  if (app) app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Administración</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
