/**
 * acm.js — Portal del Departamento Académico (ACM).
 * Lente sobre los módulos académicos/pedagógicos: gestión de clases, salones, horarios,
 * programas, planificación, progresos, observaciones y tareas Hermes del depto ACM.
 *
 * Gating: rol 'admin' por ahora (los roles finos como 'coordinador_academico' se
 * agregarán cuando se asignen a personas reales).
 */

import { bootAdminPortal } from '../_shared/adminPortalShell.js'
import { allRegistrars } from '../_shared/allRegistrars.js'

const navGroups = [
  {
    id: 'academico',
    label: 'Académico',
    icon: 'bi-easel',
    items: [
      { id: 'clases-hoy', label: 'Clases de Hoy', icon: 'bi-calendar-day' },
      { id: 'maestros', label: 'Maestros', icon: 'bi-person-check' },
      { id: 'programas', label: 'Programas', icon: 'bi-book' },
      { id: 'clases', label: 'Gestión de Clases', icon: 'bi-easel2' },
      { id: 'salones', label: 'Salones', icon: 'bi-door-open' },
    ],
  },
  {
    id: 'pedagogico',
    label: 'Pedagógico',
    icon: 'bi-journal-check',
    items: [
      { id: 'pedagogico-dashboard', label: 'Dashboard Pedagógico', icon: 'bi-grid-1x2' },
      { id: 'planificacion-acm', label: 'Planificación Docente', icon: 'bi-journal-text' },
      { id: 'planificacion-cobertura', label: 'Cobertura Curricular', icon: 'bi-grid-3x3-gap' },
      { id: 'planificacion-ruta', label: 'Rutas de Aprendizaje', icon: 'bi-signpost-2' },
      { id: 'pedagogico-evaluaciones', label: 'Evaluaciones & Rúbricas', icon: 'bi-clipboard2-check' },
    ],
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento & Ciclo',
    icon: 'bi-graph-up',
    items: [
      { id: 'asistencias', label: 'Resumen Asistencias', icon: 'bi-calendar-check' },
      { id: 'metricas', label: 'Dashboard Métricas', icon: 'bi-bar-chart-line' },
      { id: 'pedagogico-seguimiento-ausentes', label: 'Alumnos Ausentes', icon: 'bi-exclamation-circle' },
      { id: 'periodos', label: 'Períodos Académicos', icon: 'bi-calendar-event' },
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
    id: 'cartelera',
    label: 'Cartelera',
    icon: 'bi-tv',
    items: [
      { id: 'signage-pantalla', label: 'Pantalla del vestíbulo', icon: 'bi-tv' },
    ],
  },
]

bootAdminPortal({
  brandText: 'SOI · Académica',
  brandIcon: 'bi-easel',
  navGroups,
  registrars: allRegistrars,
  allowedRoles: ['admin'],
  defaultRoute: 'clases-hoy',
  hermesDept: 'ACM',
}).catch((err) => {
  console.error('[acm] boot falló:', err)
  const app = document.querySelector('#app')
  if (app) app.innerHTML = `<div style="padding:2rem;font-family:sans-serif"><h3>Error al iniciar Portal Académico</h3><pre style="white-space:pre-wrap">${String(err?.stack || err)}</pre></div>`
})
