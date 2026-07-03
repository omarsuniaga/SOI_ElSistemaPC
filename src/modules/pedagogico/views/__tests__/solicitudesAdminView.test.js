import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../portal-maestros/api/solicitudesNecesidadesApi.js', () => ({
  listarPorDepartamento: vi.fn(async () => ([
    { id: '1', titulo: 'Cuerdas', maestro_nombre: 'Maestro Uno', tipo_necesidad: 'material', estado: 'pendiente', prioridad: 'alta' }
  ])),
  preAprobar: vi.fn(),
  rechazar: vi.fn(),
  escalarAFin: vi.fn(),
  contarPendientes: vi.fn(async () => 1),
}))

vi.mock('../../../../shared/components/AppToast.js', () => ({
  AppToast: { success: vi.fn(), error: vi.fn() }
}))

import { renderSolicitudesAdminView } from '../solicitudesAdminView.js'

describe('renderSolicitudesAdminView', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
  })

  it('renders ACM solicitudes list', async () => {
    const container = document.getElementById('app')
    await renderSolicitudesAdminView(container)
    expect(container.textContent).toContain('Solicitudes ACM')
    expect(container.textContent).toContain('Cuerdas')
  })
})
