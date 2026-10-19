import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/lib/supabaseClient.js', () => ({ supabase: {} }))
vi.mock('../../src/portal-maestros/auth/maestroAuth.js', () => ({
  getMaestroLocal: vi.fn(() => ({ id: 'maestro-1' })),
}))
vi.mock('../../src/modules/academic-routes/services/academicService.js', () => ({
  academicService: { createSnapshotFromPlan: vi.fn().mockResolvedValue({}) },
}))
vi.mock('../../src/modules/planificacion/api/weeklyPlanAdapter.js', () => ({
  obtenerRutasActivas: vi.fn().mockResolvedValue([]),
}))
vi.mock('../../src/portal-maestros/components/claseAnalysisModal.js', () => ({ openClaseAnalysisModal: vi.fn() }))
vi.mock('../../src/modules/planificacion/components/claseEmergenteModal.js', () => ({ openClaseEmergenteModal: vi.fn() }))
vi.mock('../../src/portal-maestros/components/teacherRouteMapPanel.js', () => ({ abrirMapaDeRutas: vi.fn() }))
vi.mock('../../src/shared/components/AppToast.js', () => ({ AppToast: { show: vi.fn() } }))
vi.mock('../../src/portal-maestros/services/maestroDataService.js', () => ({
  getEmergentesHoy: vi.fn().mockResolvedValue([]),
  getMisClases: vi.fn().mockResolvedValue([
    { id: 'active', nombre: 'Violín', instrumento: 'Violín' },
    { id: 'chosen', nombre: 'Viola', instrumento: 'Viola' },
  ]),
  getHorariosClases: vi.fn().mockResolvedValue([
    { clase_id: 'active', dia: 'lunes', hora_inicio: '15:00', hora_fin: '16:00' },
    { clase_id: 'chosen', dia: 'lunes', hora_inicio: '16:00', hora_fin: '17:00' },
  ]),
  getSesionesResumen: vi.fn().mockResolvedValue([]),
  getInscripcionesClases: vi.fn().mockResolvedValue([]),
  getSalones: vi.fn().mockResolvedValue([]),
}))

describe('Navegación opcional a clase en curso', () => {
  let router, container, renderHoyView, opened
  const preferenceKey = 'portal-maestros:auto-open-class:maestro-1'

  beforeEach(async () => {
    vi.resetModules()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 19, 15, 30))
    localStorage.clear()
    document.body.innerHTML = '<div id="hoy"></div>'
    container = document.getElementById('hoy')
    const { createPortalRouter } = await import('../../src/portal-maestros/router/portalRouter.js')
    router = createPortalRouter()
    opened = vi.fn()
    router.on('asistencia', opened)
    router.on('calendario', vi.fn())
    router.on('hoy', vi.fn())
    router.navigate('hoy')
    window.router = router
    ;({ renderHoyView } = await import('../../src/portal-maestros/views/hoyView.js'))
  })

  afterEach(() => {
    router.navigate('calendario')
    vi.clearAllTimers()
    vi.useRealTimers()
    delete window.router
    document.body.innerHTML = ''
  })

  it('no abre automáticamente por defecto y mantiene la clase marcada en curso', async () => {
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(5000)
    expect(opened).not.toHaveBeenCalled()
    expect(container.textContent).toContain('En curso')
    expect(document.getElementById('pm-hoy-autonav-banner')).toBeNull()
  })

  it('activada, abre la clase en curso tras el aviso', async () => {
    localStorage.setItem(preferenceKey, 'true')
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(800)
    expect(document.getElementById('pm-hoy-autonav-banner')).not.toBeNull()
    await vi.advanceTimersByTimeAsync(3000)
    expect(opened).toHaveBeenCalledExactlyOnceWith('asistencia?clase=active&fecha=2026-10-19', {})
    expect(document.getElementById('pm-hoy-autonav-banner')).toBeNull()
  })

  it.each([400, 1800])('respeta la clase elegida a los %i ms y limpia el aviso', async (elapsed) => {
    localStorage.setItem(preferenceKey, 'true')
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(elapsed)
    container.querySelector('[data-clase-id="chosen"]').click()
    await vi.advanceTimersByTimeAsync(5000)
    expect(opened).toHaveBeenCalledTimes(1)
    expect(opened.mock.calls[0][0]).toBe('asistencia?clase=chosen&fecha=2026-10-19')
    expect(document.getElementById('pm-hoy-autonav-banner')).toBeNull()
  })

  it('cancela al ir al calendario, incluso si la carga de Hoy termina después', async () => {
    localStorage.setItem(preferenceKey, 'true')
    const data = await import('../../src/portal-maestros/services/maestroDataService.js')
    let resolveClasses
    data.getMisClases.mockReturnValueOnce(new Promise(resolve => { resolveClasses = resolve }))
    const loading = renderHoyView(container)
    router.navigate('calendario')
    resolveClasses([{ id: 'active', nombre: 'Violín' }, { id: 'chosen', nombre: 'Viola' }])
    await loading
    await vi.advanceTimersByTimeAsync(5000)
    expect(opened).not.toHaveBeenCalled()
    expect(document.getElementById('pm-hoy-autonav-banner')).toBeNull()
  })

  it('Cancelar evita la apertura y volver a Hoy no reinicia el intento', async () => {
    localStorage.setItem(preferenceKey, 'true')
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(800)
    document.getElementById('pm-autonav-cancel').click()
    router.navigate('calendario')
    router.navigate('hoy')
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(5000)
    expect(opened).not.toHaveBeenCalled()
    expect(document.getElementById('pm-hoy-autonav-banner')).toBeNull()
  })

  it('no abre una clase en curso ya registrada', async () => {
    localStorage.setItem(preferenceKey, 'true')
    const data = await import('../../src/portal-maestros/services/maestroDataService.js')
    data.getSesionesResumen.mockResolvedValueOnce([
      { clase_id: 'active', fecha: '2026-10-19', asistencia: [{ alumno_id: 'a' }] },
    ])
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(5000)
    expect(opened).not.toHaveBeenCalled()
  })

  it('no inicia una apertura desde un render de Hoy que llega después de navegar', async () => {
    localStorage.setItem(preferenceKey, 'true')
    router.navigate('calendario')
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(5000)
    expect(opened).not.toHaveBeenCalled()
  })

  it('cambiar de cuenta durante el aviso impide abrir la clase de la cuenta anterior', async () => {
    localStorage.setItem(preferenceKey, 'true')
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(800)
    const auth = await import('../../src/portal-maestros/auth/maestroAuth.js')
    auth.getMaestroLocal.mockReturnValue({ id: 'maestro-2' })
    await vi.advanceTimersByTimeAsync(3000)
    expect(opened).not.toHaveBeenCalled()
    expect(document.getElementById('pm-hoy-autonav-banner')).toBeNull()
    auth.getMaestroLocal.mockReturnValue({ id: 'maestro-1' })
  })

  it('apagar el switch durante el aviso cancela inmediatamente y limpia los temporizadores', async () => {
    localStorage.setItem(preferenceKey, 'true')
    await renderHoyView(container)
    await vi.advanceTimersByTimeAsync(800)
    const prefs = await import('../../src/portal-maestros/services/classAutoNavigation.js')
    prefs.setClassAutoNavigation('maestro-1', false)
    expect(document.getElementById('pm-hoy-autonav-banner')).toBeNull()
    await vi.advanceTimersByTimeAsync(5000)
    expect(opened).not.toHaveBeenCalled()
  })
})
