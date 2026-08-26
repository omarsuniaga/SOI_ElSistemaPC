/**
 * portalRoutes.security.test.js
 *
 * Verifica que el portal de maestros esté completamente blindado:
 *
 *   ACCESO BLOQUEADO (rutas admin ya no existen en este portal):
 *   - admin-alumnos, admin-clases, admin-programas, admin-maestros, etc.
 *     → no hay handler registrado → router.onNotFound → 'hoy'
 *
 *   ACCESO CONTROLADO POR PERMISO:
 *   - gestionar-clases SIN puede_inscribir_clases → navega a 'hoy'
 *   - gestionar-clases CON puede_inscribir_clases → renderiza la vista
 *   - crear-clase SIN puede_crear_clases → navega a 'hoy'
 *   - crear-clase CON puede_crear_clases → renderiza la vista
 *   - asistencia SIN puede_asistir → navega a 'hoy'
 *   - planificacion*, SIN puede_planificar → navega a 'hoy'
 *
 *   ACCESO LIBRE (vistas de maestro):
 *   - hoy, calendario, metricas, perfil → siempre accesibles para maestros autenticados
 *
 *   SEPARACIÓN DE PORTALES:
 *   - MAESTRO_VIEWS no contiene ninguna ruta admin-*
 *   - initViewContainers() NO crea contenedores para rutas admin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock de todas las vistas para no ejecutarlas ───────────────────────────────
vi.mock('../../../portal-maestros/views/loginView.js',           () => ({ renderLoginView: vi.fn() }))
vi.mock('../../../portal-maestros/views/registerView.js',        () => ({ renderRegisterView: vi.fn() }))
vi.mock('../../../portal-maestros/views/pendingApprovalView.js', () => ({ renderPendingApprovalView: vi.fn() }))
vi.mock('../../../portal-maestros/views/hoyView.js',             () => ({ renderHoyView: vi.fn().mockResolvedValue(null) }))
vi.mock('../../../portal-maestros/views/calendarioView.js',      () => ({ renderCalendarioView: vi.fn().mockResolvedValue(null) }))
vi.mock('../../../portal-maestros/views/metricasView.js',        () => ({ renderMetricasView: vi.fn() }))
vi.mock('../../../portal-maestros/views/asistenciaView.js',      () => ({ renderAsistenciaView: vi.fn().mockResolvedValue(null) }))
vi.mock('../../../portal-maestros/views/claseEmergenteView.js',  () => ({ renderClaseEmergenteView: vi.fn() }))
vi.mock('../../../portal-maestros/views/perfilView.js',          () => ({ renderPerfilView: vi.fn() }))
vi.mock('../../../portal-maestros/views/planificacionView.js',   () => ({ renderPlanificacionView: vi.fn().mockResolvedValue(null) }))
vi.mock('../../../modules/planificacion/views/DisenadorCurricularView.js', () => ({ renderDisenadorCurricularView: vi.fn().mockResolvedValue(null) }))
vi.mock('../../../modules/planificacion/views/RutaPedagogicaView.js', () => ({ renderRutaPedagogicaView: vi.fn().mockResolvedValue(null) }))
vi.mock('../../../portal-maestros/views/alumnoPerfilView.js',    () => ({ renderAlumnoPerfilView: vi.fn() }))
vi.mock('../../../portal-maestros/views/gamificacionView.js',    () => ({ renderGamificacionView: vi.fn().mockResolvedValue(undefined) }))
vi.mock('../../../portal-maestros/views/rutaGameificadaView.js', () => ({ renderRutaGameificadaView: vi.fn().mockResolvedValue(undefined) }))
vi.mock('../../../portal-maestros/views/crearClaseView.js',      () => ({ renderCrearClaseView: vi.fn() }))
vi.mock('../../../portal-maestros/views/academicPlanBuilderView.js', () => ({ renderAcademicPlanBuilderView: vi.fn() }))
vi.mock('../../../portal-maestros/views/weeklyPlanView.js',      () => ({ renderWeeklyPlanView: vi.fn() }))
vi.mock('../../../portal-maestros/views/routeLibraryView.js',    () => ({ RouteLibraryView: { render: vi.fn().mockResolvedValue(document.createElement('div')) } }))
vi.mock('../../../portal-maestros/views/routeDetailView.js',     () => ({ RouteDetailView: { render: vi.fn().mockResolvedValue(document.createElement('div')) } }))
vi.mock('../../../portal-maestros/views/gestionarClasesView.js', () => ({ renderGestionarClasesView: vi.fn().mockResolvedValue(null) }))

import {
  setupRouterRoutes,
  initViewContainers,
  renderViewContent,
  CACHEABLE_VIEWS,
  createViewRenderCache,
  createViewRenderQueue,
} from '../portalRoutes.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeContainer() {
  const el = document.createElement('div')
  el.id = 'pm-view-container'
  document.body.appendChild(el)
  return el
}

function makeRouter() {
  const handlers = {}
  let notFoundFn = null
  return {
    on: vi.fn((route, fn) => { handlers[route] = fn }),
    onNotFound: vi.fn((fn) => { notFoundFn = fn }),
    navigate: vi.fn(),
    currentRoute: vi.fn(() => 'hoy'),
    _handlers: handlers,
    _notFound: () => notFoundFn,
  }
}

// ── Suite: separación de portales ─────────────────────────────────────────────

describe('Separación de portales — rutas admin-* no existen en portal de maestros', () => {
  it('setupRouterRoutes NO registra rutas admin-*', () => {
    const router = makeRouter()
    setupRouterRoutes(router, false, vi.fn())

    const registeredRoutes = router.on.mock.calls.map(([route]) => route)
    const adminRoutes = registeredRoutes.filter(r => r.startsWith('admin-'))

    expect(adminRoutes).toHaveLength(0)
  })

  it('router.onNotFound redirige a "hoy" (no a admin-alumnos)', () => {
    const renderView = vi.fn()
    const router = makeRouter()
    setupRouterRoutes(router, false, renderView)

    // Simular que el router llama a notFoundFn
    const notFoundFn = router.onNotFound.mock.calls[0][0]
    notFoundFn()

    expect(renderView).toHaveBeenCalledWith('hoy')
    expect(renderView).not.toHaveBeenCalledWith('admin-alumnos')
  })

  it('initViewContainers NO crea contenedores para rutas admin-*', () => {
    const viewWrapper = makeContainer()
    const containers = initViewContainers()
    const keys = Object.keys(containers)

    expect(keys.filter(k => k.startsWith('admin-'))).toHaveLength(0)
    document.body.removeChild(viewWrapper)
  })

  it('las vistas de maestro sí tienen contenedor creado', () => {
    const viewWrapper = makeContainer()
    const containers = initViewContainers()

    expect(containers['hoy']).toBeTruthy()
    expect(containers['calendario']).toBeTruthy()
    expect(containers['metricas']).toBeTruthy()
    expect(containers['perfil']).toBeTruthy()
    expect(containers['gestionar-clases']).toBeTruthy()

    document.body.removeChild(viewWrapper)
  })
})

describe('createViewRenderQueue', () => {
  it('serializa A y B sobre el mismo contenedor y deja B como resultado final', async () => {
    const queue = createViewRenderQueue()
    const events = []
    let releaseA
    const waitA = new Promise((resolve) => { releaseA = resolve })

    const a = queue.run('planificacion-ruta', async () => {
      events.push('A:start')
      await waitA
      events.push('A:commit')
    })
    const b = queue.run('planificacion-ruta', async () => {
      events.push('B:start')
      events.push('B:commit')
    })

    await Promise.resolve()
    expect(events).toEqual(['A:start'])
    releaseA()
    await Promise.all([a, b])

    expect(events).toEqual(['A:start', 'A:commit', 'B:start', 'B:commit'])
  })

  it('permite cargar contenedores diferentes en paralelo', async () => {
    const queue = createViewRenderQueue()
    const events = []
    let releaseA
    const waitA = new Promise((resolve) => { releaseA = resolve })

    const a = queue.run('planificacion-ruta', async () => {
      events.push('A:start')
      await waitA
    })
    const b = queue.run('asistencia', async () => { events.push('B:start') })

    await Promise.resolve()
    expect(events).toEqual(['A:start', 'B:start'])
    releaseA()
    await Promise.all([a, b])
  })
})

// ── Suite: gestionar-clases — acceso controlado por permiso ───────────────────

describe('gestionar-clases — docente autorizado puede gestionar clases', () => {
  let container
  let router

  beforeEach(() => {
    container = document.createElement('div')
    router = { navigate: vi.fn() }
    vi.clearAllMocks()
  })

  it('SIN permiso → navega a "hoy" y NO renderiza la vista', async () => {
    const { renderGestionarClasesView } = await import('../../../portal-maestros/views/gestionarClasesView.js')

    await renderViewContent('gestionar-clases', container, {}, new URLSearchParams(), {
      router,
      permisos: { puede_inscribir_clases: false },
      maestroId: 'm1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    })

    expect(router.navigate).toHaveBeenCalledWith('hoy')
    expect(renderGestionarClasesView).not.toHaveBeenCalled()
  })

  it('SIN permisos (null) → navega a "hoy"', async () => {
    await renderViewContent('gestionar-clases', container, {}, new URLSearchParams(), {
      router,
      permisos: null,
      maestroId: 'm1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    })

    expect(router.navigate).toHaveBeenCalledWith('hoy')
  })

  it('CON permiso puede_inscribir_clases=true → renderiza la vista', async () => {
    const { renderGestionarClasesView } = await import('../../../portal-maestros/views/gestionarClasesView.js')

    await renderViewContent('gestionar-clases', container, {}, new URLSearchParams(), {
      router,
      permisos: { puede_inscribir_clases: true },
      maestroId: 'm1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    })

    expect(router.navigate).not.toHaveBeenCalledWith('hoy')
    expect(renderGestionarClasesView).toHaveBeenCalledWith(container)
  })

  it('tener otros permisos pero NO puede_inscribir_clases sigue bloqueando', async () => {
    const { renderGestionarClasesView } = await import('../../../portal-maestros/views/gestionarClasesView.js')

    await renderViewContent('gestionar-clases', container, {}, new URLSearchParams(), {
      router,
      permisos: {
        puede_registrar_alumnos: true,  // tiene este permiso
        puede_inscribir_clases: false,  // pero NO este
        puede_planificar: true,
      },
      maestroId: 'm1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    })

    expect(router.navigate).toHaveBeenCalledWith('hoy')
    expect(renderGestionarClasesView).not.toHaveBeenCalled()
  })
})

describe('crear-clase — docente autorizado puede crear clases', () => {
  let container
  let router

  beforeEach(() => {
    container = document.createElement('div')
    router = { navigate: vi.fn() }
    vi.clearAllMocks()
  })

  it('SIN permiso → navega a "hoy" y NO renderiza la vista', async () => {
    const { renderCrearClaseView } = await import('../../../portal-maestros/views/crearClaseView.js')

    await renderViewContent('crear-clase', container, {}, new URLSearchParams(), {
      router,
      permisos: { puede_crear_clases: false },
      maestroId: 'm1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    })

    expect(router.navigate).toHaveBeenCalledWith('hoy')
    expect(renderCrearClaseView).not.toHaveBeenCalled()
  })

  it('CON permiso puede_crear_clases=true → renderiza la vista', async () => {
    const { renderCrearClaseView } = await import('../../../portal-maestros/views/crearClaseView.js')

    await renderViewContent('crear-clase', container, {}, new URLSearchParams(), {
      router,
      permisos: { puede_crear_clases: true },
      maestroId: 'm1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    })

    expect(router.navigate).not.toHaveBeenCalledWith('hoy')
    expect(renderCrearClaseView).toHaveBeenCalledWith(container)
  })
})

describe('asistencia — docente autorizado puede registrar asistencia', () => {
  let container
  let router

  beforeEach(() => {
    container = document.createElement('div')
    router = { navigate: vi.fn() }
    vi.clearAllMocks()
  })

  it('SIN permiso → navega a "hoy" y NO renderiza la vista', async () => {
    const { renderAsistenciaView } = await import('../../../portal-maestros/views/asistenciaView.js')

    await renderViewContent('asistencia', container, {}, new URLSearchParams('clase=clase-1'), {
      router,
      permisos: { puede_asistir: false },
      maestroId: 'm1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    })

    expect(router.navigate).toHaveBeenCalledWith('hoy')
    expect(renderAsistenciaView).not.toHaveBeenCalled()
  })

  it('SIN permisos (null) → navega a "hoy"', async () => {
    await renderViewContent('asistencia', container, {}, new URLSearchParams('clase=clase-1'), {
      router,
      permisos: null,
      maestroId: 'm1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    })

    expect(router.navigate).toHaveBeenCalledWith('hoy')
  })
})

// ── Suite: vistas de maestro accesibles sin restricción ───────────────────────

describe('Vistas de maestro — accesibles para cualquier maestro autenticado', () => {
  let router

  beforeEach(() => {
    router = { navigate: vi.fn() }
    vi.clearAllMocks()
  })

  const vistasLibres = ['hoy', 'calendario', 'metricas', 'perfil']

  vistasLibres.forEach((vista) => {
    it(`"${vista}" no requiere permisos especiales`, async () => {
      const container = document.createElement('div')

      await renderViewContent(vista, container, {}, new URLSearchParams(), {
        router,
        permisos: {},         // sin permisos especiales
        maestroId: 'm1',
        showLoginScreen: vi.fn(),
        cleanupPushService: vi.fn(),
        stopRealtime: vi.fn(),
        logoutMaestro: vi.fn(),
      })

      // La vista debe renderizarse (router.navigate a 'hoy' NO debe llamarse)
      expect(router.navigate).not.toHaveBeenCalledWith('hoy')
    })
  })
})

describe('Planificación — rutas de escritura protegidas por puede_planificar', () => {
  let container
  let router

  beforeEach(() => {
    container = document.createElement('div')
    router = { navigate: vi.fn() }
    vi.clearAllMocks()
  })

  ;[
    'planificacion',
    'planificacion-disenador',
    'planificacion-ruta',
  ].forEach((route) => {
    it(`${route} SIN puede_planificar → navega a "hoy" y NO renderiza`, async () => {
      const { renderPlanificacionView } = await import('../../../portal-maestros/views/planificacionView.js')
      const { renderDisenadorCurricularView } = await import('../../../modules/planificacion/views/DisenadorCurricularView.js')
      const { renderRutaPedagogicaView } = await import('../../../modules/planificacion/views/RutaPedagogicaView.js')

      await renderViewContent(route, container, { claseId: 'clase-123' }, new URLSearchParams('clase=clase-query'), {
        router,
        permisos: { puede_planificar: false },
        maestroId: 'm1',
        showLoginScreen: vi.fn(),
        cleanupPushService: vi.fn(),
        stopRealtime: vi.fn(),
        logoutMaestro: vi.fn(),
      })

      expect(router.navigate).toHaveBeenCalledWith('hoy')
      expect(renderPlanificacionView).not.toHaveBeenCalled()
      expect(renderDisenadorCurricularView).not.toHaveBeenCalled()
      expect(renderRutaPedagogicaView).not.toHaveBeenCalled()
    })
  })
})

describe('Rutas de planificación — preservan el contexto de clase', () => {
  let container
  let router
  let commonContext

  beforeEach(() => {
    container = document.createElement('div')
    router = { navigate: vi.fn() }
    commonContext = {
      router,
      permisos: { puede_planificar: true },
      maestroId: 'maestro-1',
      showLoginScreen: vi.fn(),
      cleanupPushService: vi.fn(),
      stopRealtime: vi.fn(),
      logoutMaestro: vi.fn(),
    }
    vi.clearAllMocks()
  })

  it('planificacion-disenador acepta claseId desde params cuando no hay query string', async () => {
    const { renderDisenadorCurricularView } = await import('../../../modules/planificacion/views/DisenadorCurricularView.js')

    await renderViewContent('planificacion-disenador', container, { claseId: 'clase-123' }, new URLSearchParams(), commonContext)

    expect(renderDisenadorCurricularView).toHaveBeenCalledWith(
      container,
      expect.objectContaining({
        maestroId: 'maestro-1',
        claseId: 'clase-123',
      }),
    )
  })

  it('planificacion-ruta prioriza la clase del query string y preserva parentRoute', async () => {
    const { renderRutaPedagogicaView } = await import('../../../modules/planificacion/views/RutaPedagogicaView.js')

    await renderViewContent(
      'planificacion-ruta',
      container,
      { claseId: 'clase-params', parentRoute: 'planificacion-disenador' },
      new URLSearchParams('clase=clase-query'),
      commonContext,
    )

    expect(renderRutaPedagogicaView).toHaveBeenCalledWith(
      container,
      expect.objectContaining({
        maestroId: 'maestro-1',
        claseId: 'clase-query',
        parentRoute: 'planificacion-disenador',
      }),
    )
  })
})

// ── Suite: rutas admin no renderizables en portal maestros ────────────────────

describe('Rutas admin-* en portal de maestros → default case → no renderizan nada', () => {
  const adminRoutes = [
    'admin-alumnos', 'admin-programas', 'admin-maestros',
    'admin-metricas', 'admin-clases', 'admin-aprobacion',
    'admin-ausencias', 'admin-notificaciones',
  ]

  adminRoutes.forEach((route) => {
    it(`"${route}" retorna null sin renderizar (no existe en este portal)`, async () => {
      const container = document.createElement('div')
      const router = { navigate: vi.fn() }
      container.innerHTML = '<p>ANTES</p>'

      await renderViewContent(route, container, {}, new URLSearchParams(), {
        router,
        permisos: {},
        maestroId: 'm1',
        showLoginScreen: vi.fn(),
        cleanupPushService: vi.fn(),
        stopRealtime: vi.fn(),
        logoutMaestro: vi.fn(),
      })

      // No debe tocar el DOM ni navegar
      expect(container.innerHTML).toBe('<p>ANTES</p>')
      expect(router.navigate).not.toHaveBeenCalled()
    })
  })
})

// ── Suite: CACHEABLE_VIEWS solo contiene vistas de maestro ─────────────────────

describe('CACHEABLE_VIEWS — solo vistas de maestro', () => {
  it('no contiene ninguna ruta admin-*', () => {
    const adminInCache = [...CACHEABLE_VIEWS].filter(v => v.startsWith('admin-'))
    expect(adminInCache).toHaveLength(0)
  })

  it('contiene las vistas de maestro que deben cachearse', () => {
    expect(CACHEABLE_VIEWS.has('hoy')).toBe(true)
    expect(CACHEABLE_VIEWS.has('calendario')).toBe(true)
    expect(CACHEABLE_VIEWS.has('metricas')).toBe(true)
    expect(CACHEABLE_VIEWS.has('perfil')).toBe(true)
  })

  it('vuelve a renderizar cada cambio de clase A → B → A', () => {
    const cache = createViewRenderCache()
    const renderedClasses = []
    const navigate = (claseId) => {
      const params = { claseId }
      const query = new URLSearchParams()

      if (cache.has('planificacion-ruta', params, query)) return
      renderedClasses.push(claseId)
      cache.add('planificacion-ruta', params, query)
    }

    navigate('clase-a')
    navigate('clase-b')
    navigate('clase-a')

    expect(renderedClasses).toEqual([
      'clase-a',
      'clase-b',
      'clase-a',
    ])
  })
})
