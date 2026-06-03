/**
 * CHANGELOG.js — Historial oficial de versiones del SOI Portal
 *
 * Cada entrada tiene:
 *   version  : string  semver (ej: "1.4.0")
 *   date     : string  ISO date (ej: "2026-06-02")
 *   type     : 'feature' | 'fix' | 'security' | 'refactor' | 'perf'
 *   title    : string  resumen de la versión
 *   changes  : string[]  lista de cambios específicos
 *   author   : string  (opcional)
 *
 * INSTRUCCIONES PARA AGREGAR UNA NUEVA VERSIÓN:
 *   1. Agregar un objeto al inicio del array CHANGELOG (más reciente primero)
 *   2. Incrementar APP_VERSION
 *   3. Hacer commit con mensaje: "chore: bump version to X.Y.Z"
 */

export const APP_VERSION = '1.5.0'
export const APP_BUILD_DATE = '2026-06-02'

/** @type {Array<{version: string, date: string, type: string, title: string, changes: string[], author?: string}>} */
export const CHANGELOG = [
  {
    version: '1.5.0',
    date: '2026-06-02',
    type: 'feature',
    title: 'Sistema de aprobación de usuarios y control de acceso',
    changes: [
      'Flujo de registro bloqueante: sign out inmediato post-registro, cuenta queda en estado pendiente',
      'Nueva pantalla de espera con 3 pasos visuales, botón "Verificar estado" en tiempo real',
      'Módulo centralizado accessControl.js con mapa de permisos por ruta',
      'Guard en _renderView() que bloquea acceso a rutas admin para maestros sin permiso',
      'Defensa en profundidad en renderAlumnosView y renderClasesView',
      'Maestros con permiso pueden acceder a vista Alumnos y Clases según autorización',
      'PENDING_APPROVAL_SENTINEL en detectarRolMaestro para navegación directa a pantalla de espera',
      'isPendingApproval() expuesto en usePortalAuth para orquestación en initPortal',
    ],
    author: 'Omar',
  },
  {
    version: '1.4.0',
    date: '2026-06-02',
    type: 'feature',
    title: 'Sesión persistente PWA y auto-detección de clase en curso',
    changes: [
      'Sesión persistente por defecto (30 días) para todos los usuarios',
      'Detección de modo PWA standalone: evita solicitar login al reabrir la app',
      'Supabase client con persistSession:true y autoRefreshToken:true explícitos',
      'Renovación automática de pm-session-expires en cada apertura de PWA',
      'Vista Hoy: detección de clase en curso con badge animado "● En curso"',
      'Auto-scroll a la clase activa al cargar la vista',
      'Auto-navegación a la clase en curso con countdown de 3 segundos cancelable',
      'Badge "Próximamente" para clases en los próximos 15 minutos',
      'Clases pasadas con opacidad reducida para mejor jerarquía visual',
      'Login siempre redirige a Hoy después de autenticación exitosa',
    ],
    author: 'Omar',
  },
  {
    version: '1.3.0',
    date: '2026-06-02',
    type: 'refactor',
    title: 'Refactorización arquitectural: shell modular y módulo de horarios',
    changes: [
      'main-maestros.js refactorizado de 1508 líneas a ~280 (orquestador delgado)',
      'Extraído portalShell.js: render de header, sidebar, footer nav y search',
      'Extraído portalRoutes.js: registro de rutas SPA y contenedores de vista',
      'Extraído portalEvents.js: listeners globales (Realtime, shortcuts, resize)',
      'timeUtils.js: timeToMinutes, addMinutes, minutesBetween, roundToHour centralizados',
      'Eliminado undo/redo JSON.parse/stringify duplicado → cloneAssignments()',
      'showToast local en horarioBuilderView reemplazado por AppToast global',
      'ScheduleBlock.js: 100% inline styles migrados a horario-builder.css',
      'ScheduleGrid.js: inline styles eliminados, clases CSS en lugar de style=""',
      'ErrorBoundary duplicado consolidado: portal-maestros re-exporta desde src/components',
      'README.md con arquitectura, decisiones técnicas y comandos de desarrollo',
    ],
    author: 'Omar',
  },
  {
    version: '1.2.0',
    date: '2026-05-15',
    type: 'feature',
    title: 'Constructor de Horarios y módulo de planificación',
    changes: [
      'Editor visual drag & drop para horarios académicos',
      'Motor de detección de conflictos: maestro y salón',
      'Undo/Redo con stack de snapshots',
      'Vistas: grid (hora×día), por maestro, por salón, por clase',
      'PublishWizard: flujo borrador → en revisión → publicado → archivado',
      'Sistema de feedback entre administradores en cada run',
      'Módulo de rutas académicas gamificadas',
      'Constructor de planes semanales por alumno',
    ],
    author: 'Omar',
  },
  {
    version: '1.1.0',
    date: '2026-04-10',
    type: 'feature',
    title: 'Portal de Maestros PWA completo',
    changes: [
      'Registro de asistencias con modo offline (IndexedDB + cola de sync)',
      'Vista Hoy con clases del día ordenadas por hora',
      'Vista Calendario mensual con sesiones registradas',
      'Métricas del maestro: progreso por alumno y clase',
      'Sistema de notificaciones Realtime via Supabase',
      'Push notifications para alertas de clase',
      'Modo claro/oscuro con persistencia',
      'Instalación PWA con banner inteligente',
    ],
    author: 'Omar',
  },
  {
    version: '1.0.0',
    date: '2026-03-01',
    type: 'feature',
    title: 'Lanzamiento inicial — SOI Portal',
    changes: [
      'Panel de administración: alumnos, maestros, programas, clases',
      'Sistema de autenticación con Supabase Auth',
      'Gestión de alumnos con ficha completa y estados',
      'Módulo de inscripciones y postulaciones',
      'Aprobación de maestros pendientes',
      'Dashboard de métricas institucionales',
      'Generación de reportes en PDF (jsPDF)',
      'Arquitectura PWA con Vite + Vanilla JS',
    ],
    author: 'Omar',
  },
]

/**
 * Devuelve la versión más reciente del changelog.
 * @returns {object}
 */
export function getLatestVersion() {
  return CHANGELOG[0]
}

/**
 * Devuelve el color de badge para un tipo de versión.
 * @param {'feature'|'fix'|'security'|'refactor'|'perf'} type
 * @returns {{ bg: string, color: string, label: string }}
 */
export function getVersionTypeMeta(type) {
  const map = {
    feature:  { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', label: 'Nueva función' },
    fix:      { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'Corrección'    },
    security: { bg: 'rgba(239,68,68,0.18)',   color: '#dc2626', label: 'Seguridad'     },
    refactor: { bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6', label: 'Refactorización'},
    perf:     { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', label: 'Rendimiento'   },
  }
  return map[type] ?? map.feature
}
