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
import { supabase } from '../../lib/supabaseClient.js'

const navGroups = [
  {
    id: 'personas',
    label: 'Personas & Admisión',
    icon: 'bi-people',
    items: [
      { id: 'alumnos', label: 'Alumnos', icon: 'bi-people' },
      { id: 'ficha-360', label: 'Ficha 360° Alumnos', icon: 'bi-stars' },
      { id: 'maestros', label: 'Maestros', icon: 'bi-person-check' },
      { id: 'postulados', label: 'Postulados', icon: 'bi-person-plus-fill' },
      { id: 'postulados-calendario', label: 'Calendario Citas', icon: 'bi-calendar-event' },
    ],
  },
  {
    id: 'operacion',
    label: 'Operación & Clases',
    icon: 'bi-calendar-check',
    items: [
      { id: 'clases-hoy', label: 'Clases de Hoy', icon: 'bi-calendar-day' },
      { id: 'clases', label: 'Gestión de Clases', icon: 'bi-calendar3' },
      { id: 'salones', label: 'Salones & Espacios', icon: 'bi-door-open' },
      { id: 'asistencias', label: 'Control de Asistencias', icon: 'bi-calendar-check' },
      { id: 'admin-ausencias', label: 'Gestión de Ausencias', icon: 'bi-calendar-x' },
    ],
  },
  {
    id: 'reportes',
    label: 'Ciclos & Reportes',
    icon: 'bi-file-earmark-bar-graph',
    items: [
      { id: 'periodos', label: 'Períodos Académicos', icon: 'bi-calendar-event' },
      { id: 'admin-dashboard', label: 'Cumplimiento Maestros', icon: 'bi-clipboard-check' },
      { id: 'reporte-mensual', label: 'Resumen del Mes', icon: 'bi-graph-up' },
      { id: 'analisis-contenido', label: 'Análisis Pedagógico', icon: 'bi-journal-text' },
      {
        id: 'reporte-semestral',
        label: 'Informe del Período',
        icon: 'bi-journal-bookmark',
        badge: 'Cierre',
        badgeClass: 'sidebar-nav-badge bg-secondary-subtle text-secondary border border-secondary-subtle',
      },
    ],
  },
  {
    id: 'bandeja',
    label: 'Hermes & Tareas',
    icon: 'bi-kanban',
    items: [
      { id: 'hermes-tareas', label: 'Tablero Kanban & Tareas', icon: 'bi-kanban-fill' },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema & Accesos',
    icon: 'bi-gear',
    items: [
      { id: 'signage-pantalla', label: 'Cartelera / Pantalla', icon: 'bi-tv' },
      { id: 'admin-notificaciones', label: 'Centro de Actividad', icon: 'bi-bell' },
      { id: 'admin-aprobacion', label: 'Aprobaciones', icon: 'bi-person-check' },
      { id: 'gestion-usuarios', label: 'Gestión de Usuarios', icon: 'bi-person-gear' },
      { id: 'permisos', label: 'Permisos & Roles', icon: 'bi-shield-lock' },
    ],
  },
]

async function syncAusenciasBadge() {
  try {
    const { count, error } = await supabase
      .from('ausencias_maestros')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')

    console.log('[adm] Conteo ausencias pendientes:', count, error || '')

    if (!error && count !== null) {
      window.dispatchEvent(new CustomEvent('set-nav-badge', {
        detail: { route: 'admin-ausencias', count }
      }))
      window.dispatchEvent(new CustomEvent('set-nav-badge', {
        detail: { route: 'asistencias', count: 0 }
      }))
    }
  } catch (e) {
    console.warn('[adm] Error al sincronizar badge de ausencias:', e)
  }
}

// Sincronizar badge inmediatamente al cargar el módulo
syncAusenciasBadge()

bootAdminPortal({
  brandText: 'SOI · Administración',
  brandIcon: 'bi-clipboard-data',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin', 'superadmin', 'coordinacion_academica'],
  defaultRoute: 'clases-hoy',
  hermesDept: 'ADM',
}).then(() => {
  syncAusenciasBadge()
  setInterval(syncAusenciasBadge, 60000)
}).catch((err) => {
  console.error('[adm] boot falló:', err)
  const app = document.querySelector('#app')
  if (app) app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Administración</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
