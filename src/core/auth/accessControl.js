/**
 * accessControl.js — Control de acceso por ruta (fuente única de verdad)
 *
 * Define qué rutas requieren rol de administrador y cuáles son accesibles
 * a maestros con permisos explícitos otorgados por el administrador.
 *
 * Se usa en tres capas:
 *   1. _renderView()     en main-maestros.js   (Capa Router/Render)
 *   2. renderViewContent en portalRoutes.js     (Capa Router)
 *   3. renderAlumnosView / renderClasesView     (Capa Vista — defensa en profundidad)
 *
 * ┌──────────────────────────┬──────────────┬─────────────────────────────────┐
 * │ Ruta                     │ Admin        │ Maestro con permiso             │
 * ├──────────────────────────┼──────────────┼─────────────────────────────────┤
 * │ admin-alumnos            │ ✅ siempre   │ ✅ si puede_registrar_alumnos   │
 * │ admin-clases             │ ✅ siempre   │ ✅ si puede_inscribir_clases    │
 * │ admin-programas          │ ✅ siempre   │ ❌ nunca                        │
 * │ admin-maestros           │ ✅ siempre   │ ❌ nunca                        │
 * │ admin-metricas           │ ✅ siempre   │ ❌ nunca                        │
 * │ admin-config             │ ✅ siempre   │ ❌ nunca                        │
 * │ admin-sesiones           │ ✅ siempre   │ ❌ nunca                        │
 * │ admin-aprobacion         │ ✅ siempre   │ ❌ nunca                        │
 * │ admin-ausencias          │ ✅ siempre   │ ❌ nunca                        │
 * │ admin-notificaciones     │ ✅ siempre   │ ❌ nunca                        │
 * └──────────────────────────┴──────────────┴─────────────────────────────────┘
 */

/**
 * Mapa de restricciones por ruta.
 *
 * requiresAdmin: true          → solo accesible si isAdmin === true
 * requiresPermission: string   → maestro puede acceder si permisos[key] === true
 *                                (el admin siempre puede acceder igual)
 */
export const ROUTE_PERMISSIONS = {
  // ── Rutas exclusivas de administrador ─────────────────────────
  'admin-programas':      { requiresAdmin: true },
  'admin-maestros':       { requiresAdmin: true },
  'admin-metricas':       { requiresAdmin: true },
  'admin-config':         { requiresAdmin: true },
  'admin-sesiones':       { requiresAdmin: true },
  'admin-aprobacion':     { requiresAdmin: true },
  'gestion-usuarios':     { requiresAdmin: true },
  'admin-ausencias':      { requiresAdmin: true },
  'admin-notificaciones': { requiresAdmin: true },
  'admin-sistema':        { requiresAdmin: true },

  // ── Rutas accesibles a maestros con permiso explícito ─────────
  'admin-alumnos': { requiresPermission: 'puede_registrar_alumnos' },
  'admin-clases':  { requiresPermission: 'puede_inscribir_clases'  },
}

/**
 * Devuelve true si el usuario puede acceder a la ruta dada.
 *
 * @param {string}  route
 * @param {Object}  context
 * @param {boolean} context.isAdmin   - true si el usuario es administrador
 * @param {Object}  context.permisos  - objeto de permisos del maestro (puede ser null)
 * @returns {boolean}
 */
export function canAccess(route, { isAdmin = false, permisos = null } = {}) {
  const rule = ROUTE_PERMISSIONS[route]

  // Sin restricción definida → acceso libre (rutas de maestro normales)
  if (!rule) return true

  // Administrador siempre puede acceder a cualquier ruta
  if (isAdmin) return true

  // Ruta exclusiva de admin → denegado para maestros
  if (rule.requiresAdmin) return false

  // Ruta con permiso explícito → verificar el flag en el objeto de permisos
  if (rule.requiresPermission) {
    return Boolean(permisos?.[rule.requiresPermission])
  }

  return false
}

/**
 * Mensaje de denegación apropiado según el tipo de restricción.
 * @param {string} route
 * @returns {string}
 */
export function accessDeniedMessage(route) {
  const rule = ROUTE_PERMISSIONS[route]
  if (!rule) return 'Acceso denegado.'
  if (rule.requiresAdmin) return 'Esta sección es solo para administradores.'
  if (rule.requiresPermission === 'puede_registrar_alumnos')
    return 'Necesitas autorización del administrador para ver alumnos.'
  if (rule.requiresPermission === 'puede_inscribir_clases')
    return 'Necesitas autorización del administrador para ver clases.'
  return 'No tienes permiso para acceder a esta sección.'
}

/**
 * HTML de pantalla de acceso denegado para usar dentro de una vista.
 * @param {string} message
 * @returns {string}
 */
export function renderAccessDenied(message) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                min-height:60vh;padding:2rem;text-align:center;gap:1rem;">
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(239,68,68,0.1);
                  display:flex;align-items:center;justify-content:center;">
        <i class="bi bi-shield-lock-fill" style="font-size:2rem;color:#ef4444;"></i>
      </div>
      <h2 style="font-size:1.2rem;font-weight:700;color:var(--pm-text);margin:0;">
        Acceso restringido
      </h2>
      <p style="font-size:0.9rem;color:var(--pm-text-muted);max-width:320px;margin:0;">
        ${message}
      </p>
      <button
        onclick="window.router?.navigate('hoy')"
        style="margin-top:0.5rem;padding:0.6rem 1.5rem;border-radius:10px;
               background:var(--pm-primary,#3b82f6);color:#fff;border:none;
               font-weight:600;cursor:pointer;font-size:0.9rem;">
        Volver a Inicio
      </button>
    </div>
  `
}
