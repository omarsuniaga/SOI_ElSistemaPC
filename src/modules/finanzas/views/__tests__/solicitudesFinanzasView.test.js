import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../portal-maestros/api/solicitudesNecesidadesApi.js', () => ({
  listarPorDepartamento: vi.fn(async () => ([
    { id: '1', titulo: 'Cuerdas', maestro_nombre: 'Maestro Uno', estado: 'en_presupuesto', presupuesto: 1000, costo_estimado: 900 }
  ])),
  cargarPresupuesto: vi.fn(),
  resolver: vi.fn(),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() }
}))

import { renderSolicitudesFinanzasView } from '../solicitudesFinanzasView.js'

describe('renderSolicitudesFinanzasView', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('renders FIN solicitudes list', async () => {
    const container = document.getElementById('app')
    await renderSolicitudesFinanzasView(container)
    expect(container.textContent).toContain('Solicitudes FIN')
    expect(container.textContent).toContain('Cuerdas')
  })
})
