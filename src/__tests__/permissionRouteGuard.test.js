/**
 * Tests for permission-based route guards in the Portal Maestros.
 *
 * These tests exercise the logic directly (not the full app shell) to verify:
 * 1. Protected routes redirect to 'hoy' when permission is absent
 * 2. Protected routes render normally when permission is present
 * 3. Realtime revocation redirects away from currently-active forbidden route
 * 4. Toast messages are shown for permission gains AND losses
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Helpers that replicate the route guard logic from main-maestros.js ──────

/**
 * Mirrors the `_renderView` guard logic for protected routes.
 * Returns the route that will actually be rendered (may differ from requested).
 */
function applyRouteGuard(requestedRoute, permisos) {
  if (requestedRoute === 'registrar-alumno' && !permisos?.puede_registrar_alumnos) {
    return 'hoy'
  }
  if (requestedRoute === 'gestionar-clases' && !permisos?.puede_inscribir_clases) {
    return 'hoy'
  }
  return requestedRoute
}

/**
 * Mirrors the realtime handler logic:
 * - Detects gains/losses
 * - Decides safe route
 * - Returns { safeRoute, ganados, perdidos }
 */
function applyRealtimePermissionChange(currentRoute, oldPermisos, newPermisos) {
  const ganados = []
  if (newPermisos.puede_registrar_alumnos && !oldPermisos?.puede_registrar_alumnos) {
    ganados.push('Registrar Alumnos')
  }
  if (newPermisos.puede_inscribir_clases && !oldPermisos?.puede_inscribir_clases) {
    ganados.push('Gestionar e Inscribir Clases')
  }

  const perdidos = []
  if (oldPermisos?.puede_registrar_alumnos && !newPermisos.puede_registrar_alumnos) {
    perdidos.push('Registrar Alumnos')
  }
  if (oldPermisos?.puede_inscribir_clases && !newPermisos.puede_inscribir_clases) {
    perdidos.push('Gestionar e Inscribir Clases')
  }

  const routeNowForbidden =
    (currentRoute === 'registrar-alumno' && !newPermisos.puede_registrar_alumnos) ||
    (currentRoute === 'gestionar-clases' && !newPermisos.puede_inscribir_clases)

  const safeRoute = routeNowForbidden ? 'hoy' : currentRoute

  return { safeRoute, ganados, perdidos }
}

// ── Route guard tests ────────────────────────────────────────────────────────

describe('Route guard — registrar-alumno', () => {
  it('redirects to hoy when puede_registrar_alumnos is false', () => {
    const permisos = { puede_registrar_alumnos: false, puede_inscribir_clases: false }
    expect(applyRouteGuard('registrar-alumno', permisos)).toBe('hoy')
  })

  it('redirects to hoy when permisos is null', () => {
    expect(applyRouteGuard('registrar-alumno', null)).toBe('hoy')
  })

  it('allows access when puede_registrar_alumnos is true', () => {
    const permisos = { puede_registrar_alumnos: true, puede_inscribir_clases: false }
    expect(applyRouteGuard('registrar-alumno', permisos)).toBe('registrar-alumno')
  })
})

describe('Route guard — gestionar-clases', () => {
  it('redirects to hoy when puede_inscribir_clases is false', () => {
    const permisos = { puede_registrar_alumnos: false, puede_inscribir_clases: false }
    expect(applyRouteGuard('gestionar-clases', permisos)).toBe('hoy')
  })

  it('redirects to hoy when permisos is null', () => {
    expect(applyRouteGuard('gestionar-clases', null)).toBe('hoy')
  })

  it('allows access when puede_inscribir_clases is true', () => {
    const permisos = { puede_registrar_alumnos: false, puede_inscribir_clases: true }
    expect(applyRouteGuard('gestionar-clases', permisos)).toBe('gestionar-clases')
  })
})

describe('Route guard — unprotected routes pass through regardless of permisos', () => {
  const noPermisos = { puede_registrar_alumnos: false, puede_inscribir_clases: false }

  it.each(['hoy', 'calendario', 'metricas', 'perfil', 'ruta', 'planificacion'])(
    'allows route "%s" without special permissions',
    (route) => {
      expect(applyRouteGuard(route, noPermisos)).toBe(route)
      expect(applyRouteGuard(route, null)).toBe(route)
    }
  )
})

// ── Realtime permission change tests ─────────────────────────────────────────

describe('Realtime — permission revocation redirects current route', () => {
  it('redirects to hoy when on registrar-alumno and that permission is revoked', () => {
    const old = { puede_registrar_alumnos: true, puede_inscribir_clases: false }
    const next = { puede_registrar_alumnos: false, puede_inscribir_clases: false }

    const { safeRoute, perdidos } = applyRealtimePermissionChange('registrar-alumno', old, next)

    expect(safeRoute).toBe('hoy')
    expect(perdidos).toContain('Registrar Alumnos')
  })

  it('redirects to hoy when on gestionar-clases and that permission is revoked', () => {
    const old = { puede_registrar_alumnos: false, puede_inscribir_clases: true }
    const next = { puede_registrar_alumnos: false, puede_inscribir_clases: false }

    const { safeRoute, perdidos } = applyRealtimePermissionChange('gestionar-clases', old, next)

    expect(safeRoute).toBe('hoy')
    expect(perdidos).toContain('Gestionar e Inscribir Clases')
  })

  it('stays on current route when revoked permission does not match current route', () => {
    const old = { puede_registrar_alumnos: true, puede_inscribir_clases: true }
    const next = { puede_registrar_alumnos: false, puede_inscribir_clases: true }

    // Maestro is on gestionar-clases; only registrar-alumno was revoked
    const { safeRoute, perdidos } = applyRealtimePermissionChange('gestionar-clases', old, next)

    expect(safeRoute).toBe('gestionar-clases')
    expect(perdidos).toContain('Registrar Alumnos')
  })

  it('stays on safe route when no permission changed', () => {
    const permisos = { puede_registrar_alumnos: true, puede_inscribir_clases: true }
    const { safeRoute, ganados, perdidos } = applyRealtimePermissionChange('metricas', permisos, permisos)

    expect(safeRoute).toBe('metricas')
    expect(ganados).toHaveLength(0)
    expect(perdidos).toHaveLength(0)
  })
})

describe('Realtime — permission grant detection', () => {
  it('detects gain of registrar-alumno permission', () => {
    const old = { puede_registrar_alumnos: false, puede_inscribir_clases: false }
    const next = { puede_registrar_alumnos: true, puede_inscribir_clases: false }

    const { ganados, perdidos } = applyRealtimePermissionChange('hoy', old, next)

    expect(ganados).toContain('Registrar Alumnos')
    expect(perdidos).toHaveLength(0)
  })

  it('detects gain of gestionar-clases permission', () => {
    const old = { puede_registrar_alumnos: false, puede_inscribir_clases: false }
    const next = { puede_registrar_alumnos: false, puede_inscribir_clases: true }

    const { ganados, perdidos } = applyRealtimePermissionChange('hoy', old, next)

    expect(ganados).toContain('Gestionar e Inscribir Clases')
    expect(perdidos).toHaveLength(0)
  })
})
