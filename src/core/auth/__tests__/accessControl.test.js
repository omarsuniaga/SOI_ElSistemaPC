/**
 * accessControl.test.js
 *
 * Tests unitarios para el módulo de control de acceso.
 * Verifica que canAccess() aplique correctamente las reglas
 * del ROUTE_PERMISSIONS map para admin y maestros con/sin permiso.
 */

import { describe, it, expect } from 'vitest'
import { canAccess, accessDeniedMessage, ROUTE_PERMISSIONS } from '../accessControl.js'

// ── Suite: admin siempre puede acceder ────────────────────────────────────

describe('canAccess() — usuario administrador', () => {
  const adminCtx = { isAdmin: true, permisos: null }

  it('admin accede a rutas admin-only', () => {
    const adminOnlyRoutes = [
      'admin-programas', 'admin-maestros', 'admin-metricas',
      'admin-config', 'admin-sesiones', 'admin-aprobacion',
      'admin-ausencias', 'admin-notificaciones',
    ]
    adminOnlyRoutes.forEach(route => {
      expect(canAccess(route, adminCtx), `admin debe acceder a ${route}`).toBe(true)
    })
  })

  it('admin accede a admin-alumnos aunque no tenga permisos explícitos', () => {
    expect(canAccess('admin-alumnos', adminCtx)).toBe(true)
  })

  it('admin accede a admin-clases aunque no tenga permisos explícitos', () => {
    expect(canAccess('admin-clases', adminCtx)).toBe(true)
  })

  it('admin accede a rutas normales de maestro', () => {
    ['hoy', 'calendario', 'metricas', 'perfil', 'planificacion'].forEach(route => {
      expect(canAccess(route, adminCtx), `admin debe acceder a ${route}`).toBe(true)
    })
  })
})

// ── Suite: maestro sin permisos ───────────────────────────────────────────

describe('canAccess() — maestro sin permisos especiales', () => {
  const maestroCtx = { isAdmin: false, permisos: {
    puede_registrar_alumnos: false,
    puede_inscribir_clases: false,
  }}

  it('maestro es bloqueado en rutas admin-only', () => {
    const blocked = [
      'admin-programas', 'admin-maestros', 'admin-metricas',
      'admin-config', 'admin-sesiones', 'admin-aprobacion',
      'admin-ausencias', 'admin-notificaciones',
    ]
    blocked.forEach(route => {
      expect(canAccess(route, maestroCtx), `maestro sin permiso debe ser bloqueado en ${route}`).toBe(false)
    })
  })

  it('maestro sin puede_registrar_alumnos es bloqueado en admin-alumnos', () => {
    expect(canAccess('admin-alumnos', maestroCtx)).toBe(false)
  })

  it('maestro sin puede_inscribir_clases es bloqueado en admin-clases', () => {
    expect(canAccess('admin-clases', maestroCtx)).toBe(false)
  })

  it('maestro sin permisos accede a sus rutas normales', () => {
    ['hoy', 'calendario', 'metricas', 'perfil', 'planificacion', 'asistencia'].forEach(route => {
      expect(canAccess(route, maestroCtx), `maestro debe acceder a ${route}`).toBe(true)
    })
  })
})

// ── Suite: maestro con permisos explícitos ────────────────────────────────

describe('canAccess() — maestro con permisos explícitos', () => {
  it('maestro con puede_registrar_alumnos accede a admin-alumnos', () => {
    const ctx = { isAdmin: false, permisos: { puede_registrar_alumnos: true } }
    expect(canAccess('admin-alumnos', ctx)).toBe(true)
  })

  it('maestro con puede_inscribir_clases accede a admin-clases', () => {
    const ctx = { isAdmin: false, permisos: { puede_inscribir_clases: true } }
    expect(canAccess('admin-clases', ctx)).toBe(true)
  })

  it('maestro con puede_registrar_alumnos sigue bloqueado en admin-programas', () => {
    const ctx = { isAdmin: false, permisos: { puede_registrar_alumnos: true } }
    expect(canAccess('admin-programas', ctx)).toBe(false)
  })

  it('maestro con puede_inscribir_clases sigue bloqueado en admin-maestros', () => {
    const ctx = { isAdmin: false, permisos: { puede_inscribir_clases: true } }
    expect(canAccess('admin-maestros', ctx)).toBe(false)
  })

  it('tener un permiso no otorga acceso al otro permissioned-route', () => {
    const ctxSoloAlumnos = { isAdmin: false, permisos: { puede_registrar_alumnos: true, puede_inscribir_clases: false } }
    expect(canAccess('admin-alumnos', ctxSoloAlumnos)).toBe(true)
    expect(canAccess('admin-clases',  ctxSoloAlumnos)).toBe(false)

    const ctxSoloClases = { isAdmin: false, permisos: { puede_registrar_alumnos: false, puede_inscribir_clases: true } }
    expect(canAccess('admin-alumnos', ctxSoloClases)).toBe(false)
    expect(canAccess('admin-clases',  ctxSoloClases)).toBe(true)
  })
})

// ── Suite: edge cases ─────────────────────────────────────────────────────

describe('canAccess() — casos borde', () => {
  it('ruta sin restricción retorna true para cualquier usuario', () => {
    expect(canAccess('ruta-inexistente', { isAdmin: false, permisos: null })).toBe(true)
    expect(canAccess('hoy',             { isAdmin: false, permisos: null })).toBe(true)
  })

  it('permisos=null es equivalente a permisos vacíos', () => {
    const ctx = { isAdmin: false, permisos: null }
    expect(canAccess('admin-alumnos', ctx)).toBe(false)
    expect(canAccess('admin-clases',  ctx)).toBe(false)
  })

  it('permisos={} es equivalente a sin permisos', () => {
    const ctx = { isAdmin: false, permisos: {} }
    expect(canAccess('admin-alumnos', ctx)).toBe(false)
    expect(canAccess('admin-clases',  ctx)).toBe(false)
  })

  it('isAdmin=false con contexto vacío bloquea admin-only', () => {
    expect(canAccess('admin-aprobacion', {})).toBe(false)
  })

  it('isAdmin por defecto es false cuando no se pasa contexto', () => {
    expect(canAccess('admin-maestros')).toBe(false)
  })
})

// ── Suite: accessDeniedMessage ────────────────────────────────────────────

describe('accessDeniedMessage()', () => {
  it('devuelve mensaje genérico para rutas admin-only', () => {
    const msg = accessDeniedMessage('admin-programas')
    expect(msg).toContain('administrador')
  })

  it('devuelve mensaje específico de alumnos para admin-alumnos', () => {
    const msg = accessDeniedMessage('admin-alumnos')
    expect(msg.toLowerCase()).toContain('alumnos')
  })

  it('devuelve mensaje específico de clases para admin-clases', () => {
    const msg = accessDeniedMessage('admin-clases')
    expect(msg.toLowerCase()).toContain('clases')
  })

  it('devuelve mensaje fallback para ruta desconocida', () => {
    const msg = accessDeniedMessage('ruta-que-no-existe')
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })
})

// ── Suite: integridad del mapa ROUTE_PERMISSIONS ─────────────────────────

describe('ROUTE_PERMISSIONS — integridad del mapa', () => {
  it('todas las rutas admin-only tienen requiresAdmin=true', () => {
    const adminOnly = [
      'admin-programas', 'admin-maestros', 'admin-metricas',
      'admin-config', 'admin-sesiones', 'admin-aprobacion',
      'admin-ausencias', 'admin-notificaciones',
    ]
    adminOnly.forEach(route => {
      expect(ROUTE_PERMISSIONS[route]?.requiresAdmin, `${route} debe tener requiresAdmin`).toBe(true)
    })
  })

  it('admin-alumnos tiene requiresPermission=puede_registrar_alumnos', () => {
    expect(ROUTE_PERMISSIONS['admin-alumnos'].requiresPermission).toBe('puede_registrar_alumnos')
  })

  it('admin-clases tiene requiresPermission=puede_inscribir_clases', () => {
    expect(ROUTE_PERMISSIONS['admin-clases'].requiresPermission).toBe('puede_inscribir_clases')
  })

  it('rutas permissioned NO tienen requiresAdmin (son accesibles con permiso)', () => {
    expect(ROUTE_PERMISSIONS['admin-alumnos'].requiresAdmin).toBeUndefined()
    expect(ROUTE_PERMISSIONS['admin-clases'].requiresAdmin).toBeUndefined()
  })
})
