// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getAuditoriaSuplentesMock,
  obtenerClasesMock,
  obtenerMaestrosMock,
} = vi.hoisted(() => ({
  getAuditoriaSuplentesMock: vi.fn(),
  obtenerClasesMock: vi.fn(),
  obtenerMaestrosMock: vi.fn(),
}))

vi.mock('../api/bitacoraAdapter.js', () => ({
  getAuditoriaSuplentes: getAuditoriaSuplentesMock,
}))

vi.mock('../../clases/api/clasesApi.js', () => ({
  obtenerClases: obtenerClasesMock,
}))

vi.mock('../../maestros/api/maestrosApi.js', () => ({
  obtenerMaestros: obtenerMaestrosMock,
}))

vi.mock('../../alumnos/api/alumnosApi.js', () => ({
  obtenerAlumnos: vi.fn(),
}))

vi.mock('../../../core/config/config.js', () => ({
  config: { isDemoMode: false },
}))

import { renderBitacoraView, destroyBitacoraView } from '../views/bitacoraView.js'

describe('bitacoraView substitute audit mode', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    getAuditoriaSuplentesMock.mockResolvedValue([
      {
        id: 'log-1',
        action: 'SUBSTITUTE_ATTENDANCE',
        entity: 'substitute_class_activity',
        entity_id: 'clase-1',
        user_id: 'user-1',
        timestamp: '2026-08-14T10:00:00Z',
        changes: {
          class_id: 'clase-1',
          maestro_titular_id: 'maestro-titular',
          maestro_suplente_id: 'maestro-suplente',
          summary: 'Se registró asistencia como suplente',
          sesion_id: 'ses-1',
          fecha: '2026-08-14',
        },
      },
    ])
    obtenerClasesMock.mockResolvedValue([
      { id: 'clase-1', nombre: 'Violín Inicial' },
    ])
    obtenerMaestrosMock.mockResolvedValue([
      { id: 'maestro-titular', nombre_completo: 'Ana Titular' },
      { id: 'maestro-suplente', nombre_completo: 'Luis Suplente' },
      { id: 'user-1', nombre_completo: 'Admin Auditor' },
    ])
  })

  afterEach(() => {
    destroyBitacoraView()
    container?.remove()
    vi.clearAllMocks()
  })

  it('renders substitute audit logs when mode is suplentes', async () => {
    await renderBitacoraView(container, { mode: 'suplentes' })

    expect(container.textContent).toContain('Auditoría de Suplentes')
    expect(container.textContent).toContain('Violín Inicial')
    expect(container.textContent).toContain('Ana Titular')
    expect(container.textContent).toContain('Luis Suplente')
    expect(container.textContent).toContain('SUBSTITUTE_ATTENDANCE')
  })
})
