import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../../portal-maestros/services/confirmacionesEmergentesAdapter.js', () => ({
  obtenerTodasLasConfirmaciones: vi.fn()
}))

import * as adapter from '../../../../portal-maestros/services/confirmacionesEmergentesAdapter.js'
import { renderActividadEmergenteAuditView } from '../ActividadEmergenteAuditView.js'

describe('ActividadEmergenteAuditView (Portal ADM)', () => {
  let container

  const mockAuditoria = [
    {
      id: 'conf-adm-1',
      actividad_id: 'act-1',
      maestro_id: 'maestro-violines',
      fecha: '2026-09-15',
      respuesta: 'si',
      estado_validacion: 'validado',
      respondido_por: 'user-maestro-1',
      respondido_at: '2026-09-15T10:00:00Z',
      updated_at: '2026-09-15T10:00:00Z',
      observaciones: 'Participó toda la orquesta',
      clases_afectadas: [{ clase_id: 'c1', clase_nombre: 'Violín I', alumnos_count: 15 }],
      actividad_info: { actividad: 'Gira Sinfónica' }
    },
    {
      id: 'conf-adm-2',
      actividad_id: 'act-2',
      maestro_id: 'maestro-coro',
      fecha: '2026-09-15',
      respuesta: 'no_se',
      estado_validacion: 'pendiente',
      respondido_por: 'user-maestro-2',
      respondido_at: '2026-09-15T11:00:00Z',
      updated_at: '2026-09-15T11:00:00Z',
      observaciones: 'Esperando respuesta de ACM',
      clases_afectadas: [],
      actividad_info: { actividad: 'Masterclass Dirección' }
    }
  ]

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    vi.clearAllMocks()

    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-csv')
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('admin puede ver confirmaciones de cualquier maestro (lectura completa)', async () => {
    adapter.obtenerTodasLasConfirmaciones.mockResolvedValueOnce(mockAuditoria)

    renderActividadEmergenteAuditView(container, { userRole: 'admin' })

    await vi.waitFor(() => {
      const filas = container.querySelectorAll('[data-role="fila-auditoria"]')
      expect(filas.length).toBe(2)
    })

    expect(container.textContent).toContain('maestro-violines')
    expect(container.textContent).toContain('maestro-coro')
    expect(container.textContent).toContain('Gira Sinfónica')
    expect(container.textContent).toContain('Masterclass Dirección')
  })

  it('tabla muestra solo confirmaciones donde estado_validacion="validado" al filtrar', async () => {
    adapter.obtenerTodasLasConfirmaciones.mockResolvedValueOnce(mockAuditoria)

    renderActividadEmergenteAuditView(container, { userRole: 'admin' })

    await vi.waitFor(() => {
      expect(container.querySelectorAll('[data-role="fila-auditoria"]').length).toBe(2)
    })

    // Configurar filtro estado_validacion = validado
    const selectEstado = container.querySelector('[data-role="filtro-estado-validacion"]')
    selectEstado.value = 'validado'
    selectEstado.dispatchEvent(new Event('change'))

    adapter.obtenerTodasLasConfirmaciones.mockResolvedValueOnce([mockAuditoria[0]])

    container.querySelector('[data-action="aplicar-filtros"]').click()

    await vi.waitFor(() => {
      expect(adapter.obtenerTodasLasConfirmaciones).toHaveBeenCalledWith(expect.objectContaining({
        estado_validacion: 'validado'
      }))
      const filasFiltradas = container.querySelectorAll('[data-role="fila-auditoria"]')
      expect(filasFiltradas.length).toBe(1)
      expect(container.textContent).toContain('maestro-violines')
    })
  })

  it('export a CSV genera archivo con todas las filas y metadatos de auditoría', async () => {
    adapter.obtenerTodasLasConfirmaciones.mockResolvedValueOnce(mockAuditoria)

    let csvGenerado = ''
    renderActividadEmergenteAuditView(container, {
      userRole: 'admin',
      onExportCsv: (content) => { csvGenerado = content }
    })

    await vi.waitFor(() => {
      expect(container.querySelectorAll('[data-role="fila-auditoria"]').length).toBe(2)
    })

    const btnExport = container.querySelector('[data-role="btn-exportar-csv"]')
    expect(btnExport).toBeTruthy()
    btnExport.click()

    expect(csvGenerado).toContain('id,actividad,maestro_id,fecha,respuesta,estado_validacion,respondido_por,respondido_at,updated_at,observaciones')
    expect(csvGenerado).toContain('conf-adm-1')
    expect(csvGenerado).toContain('Gira Sinfónica')
    expect(csvGenerado).toContain('maestro-violines')
    expect(csvGenerado).toContain('conf-adm-2')
  })

  it('maestro no puede acceder a esta vista (muestra acceso denegado)', async () => {
    renderActividadEmergenteAuditView(container, { userRole: 'maestro' })

    const accesoDenegado = container.querySelector('[data-role="acceso-denegado"]')
    expect(accesoDenegado).toBeTruthy()
    expect(accesoDenegado.textContent).toContain('Acceso Denegado')
    expect(container.querySelector('[data-role="tabla-auditoria"]')).toBeNull()
    expect(adapter.obtenerTodasLasConfirmaciones).not.toHaveBeenCalled()
  })

  it('fila expandible muestra el audit trail completo y clases afectadas', async () => {
    adapter.obtenerTodasLasConfirmaciones.mockResolvedValueOnce(mockAuditoria)

    renderActividadEmergenteAuditView(container, { userRole: 'superadmin' })

    await vi.waitFor(() => {
      expect(container.querySelectorAll('[data-role="fila-auditoria"]').length).toBe(2)
    })

    const btnExpandir = container.querySelector('[data-role="btn-expandir"]')
    btnExpandir.click()

    const filaExpandida = container.querySelector('[data-role="fila-detalle-expandida"]')
    expect(filaExpandida).toBeTruthy()
    expect(filaExpandida.textContent).toContain('Pista de Auditoría')
    expect(filaExpandida.textContent).toContain('Confirmación ID: conf-adm-1')
    expect(filaExpandida.textContent).toContain('Violín I (15 alumnos)')
    expect(filaExpandida.textContent).toContain('Participó toda la orquesta')
  })
})
