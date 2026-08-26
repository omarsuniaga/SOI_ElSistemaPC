import { beforeAll, describe, expect, it, vi } from 'vitest'

const { bootAdminPortal, allRegistrars } = vi.hoisted(() => ({
  bootAdminPortal: vi.fn(() => Promise.resolve()),
  allRegistrars: [vi.fn(), vi.fn()],
}))

vi.mock('../adminPortalShell.js', () => ({ bootAdminPortal }))
vi.mock('../allRegistrars.js', () => ({ allRegistrars }))

function flattenRoutes(profile) {
  return profile.navGroups.flatMap((group) => group.items.map((item) => item.id))
}

function profileForDepartment(department) {
  return bootAdminPortal.mock.calls
    .map(([profile]) => profile)
    .find((profile) => profile.hermesDept === department)
}

beforeAll(async () => {
  await import('../../acm/acm.js')
  await import('../../adm/adm.js')
})

describe('department portal profile contracts', () => {
  it('boots ACM with its stable identity, access and default route', () => {
    const profile = profileForDepartment('ACM')

    expect(profile).toMatchObject({
      brandText: 'SOI · Académica',
      brandIcon: 'bi-easel',
      allowedRoles: ['admin'],
      defaultRoute: 'clases-hoy',
      hermesDept: 'ACM',
    })
    expect(profile.registrars).toBe(allRegistrars)
    expect(flattenRoutes(profile)).toContain(profile.defaultRoute)
  })

  it('keeps ACM critical navigation routes visible', () => {
    const routes = flattenRoutes(profileForDepartment('ACM'))

    expect(routes).toEqual(expect.arrayContaining([
      'maestros',
      'programas',
      'clases',
      'salones',
      'horario-builder',
      'pedagogico-dashboard',
      'planificacion-acm',
      'planificacion-ruta',
      'progresos',
      'observaciones',
      'asistencias',
      'metricas',
      'periodos',
      'cierre-academico',
      'cierre-academico-historico',
      'hermes-tareas',
    ]))
  })

  it('does not duplicate route ids inside ACM navigation', () => {
    const routes = flattenRoutes(profileForDepartment('ACM'))
    expect(new Set(routes).size).toBe(routes.length)
  })

  it('boots ADM with its stable identity, access and default route', () => {
    const profile = profileForDepartment('ADM')

    expect(profile).toMatchObject({
      brandText: 'SOI · Administración',
      brandIcon: 'bi-clipboard-data',
      allowedRoles: ['admin'],
      defaultRoute: 'clases-hoy',
      hermesDept: 'ADM',
    })
    expect(profile.registrars).toBe(allRegistrars)
    expect(flattenRoutes(profile)).toContain(profile.defaultRoute)
  })

  it('keeps ADM critical navigation routes visible', () => {
    const routes = flattenRoutes(profileForDepartment('ADM'))

    expect(routes).toEqual(expect.arrayContaining([
      'alumnos',
      'maestros',
      'postulados',
      'postulados-calendario',
      'periodos',
      'campanias',
      'gateway-config',
      'asistencias',
      'admin-dashboard',
      'admin-ausencias',
      'admin-notificaciones',
      'admin-aprobacion',
      'gestion-usuarios',
      'departamentos',
      'configuracion',
      'permisos',
      'hermes-procedimientos',
      'hermes-consulta',
      'dir-score',
      'hermes-tareas',
    ]))
  })

  it('does not duplicate route ids inside ADM navigation', () => {
    const routes = flattenRoutes(profileForDepartment('ADM'))
    expect(new Set(routes).size).toBe(routes.length)
  })
})
