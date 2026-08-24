import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * maestroDetalleView.test.js
 *
 * Bug real reportado: en la lista de Cumplimiento de Maestros, un maestro
 * aparecía con "1 pendientes" para el rango elegido ahí (ej. "Esta Semana"),
 * pero al entrar al detalle ("Ver detalle") la cifra no coincidía y no se
 * veía cuál era la clase pendiente. Causa: el detalle SIEMPRE recalculaba
 * su propia "semana actual" con getMaestroClasesDetalle(maestroId) — sin
 * segundo argumento — ignorando el rango que el admin había elegido en la
 * lista. Este archivo cubre que ahora:
 *  - Si se recibe un rango (vía router params), se lo pasa tal cual a
 *    getMaestroClasesDetalle, en vez de dejar que use su propio default.
 *  - Si NO se recibe un rango (navegación directa), sigue funcionando como
 *    antes (usa la semana actual) — sin romper ese caso.
 *  - La pantalla deja explícito qué rango se está usando y si vino
 *    heredado del panel o es el default, para que no se preste a confusión.
 */

const mockGetMaestroProfile = vi.fn()
const mockGetMaestroClasesDetalle = vi.fn(() => Promise.resolve([]))
const mockGetMaestroHistoricoDesempeno = vi.fn(() =>
  Promise.resolve({ total: 0, registradas: 0, pendientes: 0, vencidas: 0, porcentajeCumplimiento: 100, esSolvente: true, semanas: [] }),
)
const mockGetMaestroNotificationHistory = vi.fn(() => Promise.resolve([]))

vi.mock('../../api/adminMaestroApi.js', () => ({
  getMaestroProfile: (...args) => mockGetMaestroProfile(...args),
  getMaestroClasesDetalle: (...args) => mockGetMaestroClasesDetalle(...args),
  getMaestroHistoricoDesempeno: (...args) => mockGetMaestroHistoricoDesempeno(...args),
  getMaestroNotificationHistory: (...args) => mockGetMaestroNotificationHistory(...args),
  registrarContactoWhatsAppMaestro: vi.fn(),
  actualizarTelefonoMaestro: vi.fn(),
  normalizarTelefonoWhatsApp: (s) => s,
  getSemanaActualSantoDomingo: () => ({ desde: '2026-08-24', hasta: '2026-08-30' }),
}))

vi.mock('../../../../core/router/router.js', () => ({
  router: { navigate: vi.fn() },
}))

import { MaestroDetalleView } from '../maestroDetalleView.js'

function claseDetalle(overrides) {
  return {
    id: 's1',
    fecha: '2026-08-19',
    clase_id: 'clase-1',
    clase_nombre: 'Clases de Violín',
    hora_inicio: '15:00:00',
    hora_fin: '16:00:00',
    estado: 'pendiente',
    dias_atraso: 3,
    ...overrides,
  }
}

describe('MaestroDetalleView', () => {
  let container

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetMaestroProfile.mockResolvedValue({ nombre_completo: 'Omar Suniaga', especialidad: 'Violín, Viola', telefono: '+18097176627' })
    mockGetMaestroClasesDetalle.mockResolvedValue([])
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    container?.remove()
  })

  async function initView(rango = null) {
    const view = new MaestroDetalleView('test-container', 'maestro-1', rango)
    await view.init()
    return view
  }

  it('con un rango recibido del panel, lo pasa TAL CUAL a getMaestroClasesDetalle en vez de recalcular su propia semana', async () => {
    await initView({ desde: '2026-07-01', hasta: '2026-07-31' })

    expect(mockGetMaestroClasesDetalle).toHaveBeenCalledWith('maestro-1', { desde: '2026-07-01', hasta: '2026-07-31' })
  })

  it('sin rango (navegación directa), sigue funcionando: delega el default a la capa de API', async () => {
    await initView(null)

    expect(mockGetMaestroClasesDetalle).toHaveBeenCalledWith('maestro-1', null)
  })

  it('muestra en pantalla el rango efectivamente consultado, marcado como heredado del panel', async () => {
    await initView({ desde: '2026-07-01', hasta: '2026-07-31' })

    expect(container.textContent).toContain('01/07')
    expect(container.textContent).toContain('31/07')
    expect(container.textContent).toContain('heredado del panel')
  })

  it('sin rango heredado, marca el rango mostrado como el default (semana actual)', async () => {
    await initView(null)

    expect(container.textContent).toContain('24/08')
    expect(container.textContent).toContain('30/08')
    expect(container.textContent).toContain('semana actual por defecto')
  })

  it('la clase pendiente del rango heredado aparece en la tabla con su estado correcto', async () => {
    mockGetMaestroClasesDetalle.mockResolvedValue([
      claseDetalle({ clase_nombre: 'Clases de Violín', estado: 'pendiente' }),
    ])

    await initView({ desde: '2026-08-17', hasta: '2026-08-23' })

    expect(container.textContent).toContain('Clases de Violín')
    expect(container.textContent).toContain('PENDIENTE')
  })

  it('el conteo de KPI "pendientes" refleja las clases del rango heredado, no de un rango distinto', async () => {
    mockGetMaestroClasesDetalle.mockResolvedValue([
      claseDetalle({ id: 's1', estado: 'pendiente' }),
      claseDetalle({ id: 's2', estado: 'registrada' }),
    ])

    await initView({ desde: '2026-08-17', hasta: '2026-08-23' })

    const kpiPendientes = [...container.querySelectorAll('.kpi-card')].find((el) => el.textContent.includes('Pendientes'))
    expect(kpiPendientes.textContent).toContain('1')
  })
})
