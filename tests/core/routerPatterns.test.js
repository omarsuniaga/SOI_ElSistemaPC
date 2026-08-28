import { describe, it, expect, vi, beforeEach } from 'vitest'
import { router } from '../../src/core/router/router.js'

describe('Router Hierarchical & Parameterized Routing', () => {
  beforeEach(() => {
    router.routes = {}
    document.body.innerHTML = '<div id="app"></div>'
    localStorage.clear()
  })

  it('permite registrar y navegar a rutas jerárquicas simples (ej. alumnos/duplicados)', () => {
    const renderDuplicados = vi.fn((app, params) => {
      app.innerHTML = '<h1>Taller de Duplicados</h1>'
    })
    router.register('alumnos/duplicados', renderDuplicados)

    router.navigate('alumnos/duplicados')
    expect(renderDuplicados).toHaveBeenCalledWith(expect.any(HTMLElement), {})
    expect(document.getElementById('app').innerHTML).toContain('Taller de Duplicados')
  })

  it('extrae parámetros dinámicos de rutas con patrón :id (ej. alumnos/:id)', () => {
    const renderDetalle = vi.fn((app, params) => {
      app.innerHTML = `<h1>Alumno ${params.id}</h1>`
    })
    router.register('alumnos/:id', renderDetalle)

    router.navigate('alumnos/abc-123')
    expect(renderDetalle).toHaveBeenCalledWith(expect.any(HTMLElement), { id: 'abc-123' })
    expect(document.getElementById('app').innerHTML).toContain('Alumno abc-123')
  })

  it('soporta parámetros anidados (ej. clases/:claseId/asistencia/:fecha)', () => {
    const renderAsistencia = vi.fn()
    router.register('clases/:claseId/asistencia/:fecha', renderAsistencia)

    router.navigate('clases/clase-violin-1/asistencia/2026-08-28')
    expect(renderAsistencia).toHaveBeenCalledWith(expect.any(HTMLElement), {
      claseId: 'clase-violin-1',
      fecha: '2026-08-28',
    })
  })

  it('combina query strings con parámetros de ruta dinámicos (ej. alumnos/:id?tab=asistencias)', () => {
    const renderDetalle = vi.fn()
    router.register('alumnos/:id', renderDetalle)

    router.navigate('alumnos/99?tab=asistencias&filtro=activo')
    expect(renderDetalle).toHaveBeenCalledWith(expect.any(HTMLElement), {
      id: '99',
      tab: 'asistencias',
      filtro: 'activo',
    })
  })

  it('mantiene retrocompatibilidad con rutas históricas con guion (ej. alumnos-duplicados)', () => {
    const renderDuplicados = vi.fn()
    router.register('alumnos/duplicados', renderDuplicados)

    router.navigate('alumnos-duplicados')
    expect(renderDuplicados).toHaveBeenCalled()
  })
})
