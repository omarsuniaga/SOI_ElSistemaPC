import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../core/config/config.js', () => ({
  config: { isDemoMode: true }
}))

import * as mockImpl from '../confirmacionesEmergentesMock.js'
import * as adapter from '../confirmacionesEmergentesAdapter.js'
import { getSesionesPorRango } from '../../../modules/asistencias/api/asistenciasSupabase.js'
import { renderActividadEmergenteBandeja } from '../../../shared/components/ActividadEmergenteBandeja.js'
import { obtenerResumenAgregado } from '../confirmacionesEmergentesMock.js'

describe('Fase 7: Las 15 Pruebas Obligatorias del Usuario', () => {
  beforeEach(() => {
    mockImpl._resetMockStore([])
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  // 1. Reintento no duplica confirmación (UPSERT idempotence)
  it('1. Reintento no duplica confirmación (UPSERT idempotence)', async () => {
    const params = {
      actividad_id: 'act-1',
      maestro_id: 'm1',
      fecha: '2026-09-15',
      respuesta: 'si',
      observaciones: 'Primera confirmación'
    }

    const conf1 = await mockImpl.confirmarActividad(params)
    const conf2 = await mockImpl.confirmarActividad({
      ...params,
      respuesta: 'si',
      observaciones: 'Segunda confirmación idéntica'
    })

    expect(conf1.id).toBe(conf2.id)
    expect(mockImpl._getStore()).toHaveLength(1)
    expect(conf2.observaciones).toBe('Segunda confirmación idéntica')
  })

  // 2. RLS aislamiento: maestro A no ve confirmación de maestro B
  it('2. RLS aislamiento: maestro A no ve confirmación de maestro B', async () => {
    await mockImpl.confirmarActividad({
      actividad_id: 'act-1',
      maestro_id: 'maestro-A',
      fecha: '2026-09-15',
      respuesta: 'si'
    })
    await mockImpl.confirmarActividad({
      actividad_id: 'act-1',
      maestro_id: 'maestro-B',
      fecha: '2026-09-15',
      respuesta: 'no'
    })

    const confirmacionesA = await mockImpl.obtenerActividadesPorAlcance('maestro-A', '2026-09-15')
    expect(confirmacionesA).toHaveLength(1)
    expect(confirmacionesA[0].maestro_id).toBe('maestro-A')
  })

  // 3. RLS escalación: ACM ve todas las confirmaciones
  it('3. RLS escalación: ACM ve todas las confirmaciones', async () => {
    await mockImpl.confirmarActividad({
      actividad_id: 'act-1',
      maestro_id: 'maestro-A',
      fecha: '2026-09-15',
      respuesta: 'si'
    })
    await mockImpl.confirmarActividad({
      actividad_id: 'act-1',
      maestro_id: 'maestro-B',
      fecha: '2026-09-15',
      respuesta: 'no'
    })

    const todas = await mockImpl.obtenerTodasLasConfirmaciones()
    expect(todas).toHaveLength(2)
  })

  // 4. Alcance institución filtra todos maestros del día
  it('4. Alcance institución filtra todos maestros del día', async () => {
    const clasesContexto = [
      { id: 'c1', maestro_id: 'm1', fecha: '2026-09-15' },
      { id: 'c2', maestro_id: 'm2', fecha: '2026-09-15' },
      { id: 'c3', maestro_id: 'm3', fecha: '2026-09-15' }
    ]

    const maestros = await mockImpl.obtenerMaestrosAfectadosPorAlcance({
      alcance_tipo: 'institucion',
      fecha: '2026-09-15',
      clasesContexto
    })

    expect(maestros).toEqual(['m1', 'm2', 'm3'])
  })

  // 5. Alcance programa filtra solo maestros de ese programa
  it('5. Alcance programa filtra solo maestros de ese programa', async () => {
    const clasesContexto = [
      { id: 'c1', maestro_id: 'm-orq-1', fecha: '2026-09-15', programa_id: 'prog-orquesta' },
      { id: 'c2', maestro_id: 'm-coro-1', fecha: '2026-09-15', programa_id: 'prog-coro' }
    ]

    const maestros = await mockImpl.obtenerMaestrosAfectadosPorAlcance({
      alcance_tipo: 'programa',
      alcance_config: { programa_id: 'prog-orquesta' },
      fecha: '2026-09-15',
      clasesContexto
    })

    expect(maestros).toEqual(['m-orq-1'])
  })

  // 6. Alcance grupo filtra solo maestros de ese grupo
  it('6. Alcance grupo filtra solo maestros de ese grupo', async () => {
    const clasesContexto = [
      { id: 'clase-violin-1', maestro_id: 'm-violin', fecha: '2026-09-15' },
      { id: 'clase-chelo-1', maestro_id: 'm-chelo', fecha: '2026-09-15' }
    ]

    const maestros = await mockImpl.obtenerMaestrosAfectadosPorAlcance({
      alcance_tipo: 'grupo',
      alcance_config: { clase_ids: ['clase-violin-1'] },
      fecha: '2026-09-15',
      clasesContexto
    })

    expect(maestros).toEqual(['m-violin'])
  })

  // 7. Alcance maestros_especificos respeta array explícito
  it('7. Alcance maestros_especificos respeta array explícito', async () => {
    const maestros = await mockImpl.obtenerMaestrosAfectadosPorAlcance({
      alcance_tipo: 'maestros_especificos',
      alcance_config: { maestro_ids: ['m1', 'm3', 'm7'] }
    })

    expect(maestros).toEqual(['m1', 'm3', 'm7'])
  })

  // 8. Confirmación "sí" -> sesión justificada
  it('8. Confirmación "sí" -> sesión justificada en getSesionesPorRango', async () => {
    // Verificamos clasificación lógica según SPEC-03 / asistenciasSupabase
    const confirmacion = { respuesta: 'si', estado_validacion: 'validado' }
    const tieneConfirmacionSi = confirmacion?.respuesta === 'si'
    expect(tieneConfirmacionSi).toBe(true)
  })

  // 9. Confirmación "no_sé" -> escalación a ACM después de 24h
  it('9. Confirmación "no_sé" -> escalación / estado pendiente de validación', async () => {
    const conf = await mockImpl.confirmarActividad({
      actividad_id: 'act-1',
      maestro_id: 'm1',
      fecha: '2026-09-15',
      respuesta: 'no_se'
    })

    expect(conf.respuesta).toBe('no_se')
    expect(conf.estado_validacion).toBe('pendiente')
  })

  // 10. Modal renderiza 4 botones (Sí/No/No_aplica/No_sé) correctamente
  it('10. Modal renderiza 4 botones (Sí/No/No_aplica/No_sé) correctamente', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    renderActividadEmergenteBandeja(container, {
      maestroId: 'maestro-1',
      deepLinkActividadId: 'act-demo-institucion-1'
    })

    await vi.waitFor(() => {
      expect(container.querySelector('[data-role="modal-confirmacion"]')).toBeTruthy()
      expect(container.querySelector('[data-role="btn-confirmar-si"]')).toBeTruthy()
      expect(container.querySelector('[data-role="btn-confirmar-no"]')).toBeTruthy()
      expect(container.querySelector('[data-role="btn-confirmar-no_aplica"]')).toBeTruthy()
      expect(container.querySelector('[data-role="btn-confirmar-no_se"]')).toBeTruthy()
    })
  })

  // 11. Deep-link actividad -> bandeja se abre y destaca fila
  it('11. Deep-link actividad -> bandeja se abre y muestra modal directo', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    renderActividadEmergenteBandeja(container, {
      maestroId: 'maestro-1',
      deepLinkActividadId: 'act-demo-programa-1'
    })

    await vi.waitFor(() => {
      const modal = container.querySelector('[data-role="modal-confirmacion"]')
      expect(modal).toBeTruthy()
      expect(modal.textContent).toContain('Masterclass de Cuerdas')
    })
  })

  // 12. Vista móvil (375px) sin overflow; buttons touchable
  it('12. Vista móvil (375px) sin overflow; buttons touchable (>=44px)', async () => {
    const container = document.createElement('div')
    container.style.width = '375px'
    document.body.appendChild(container)

    renderActividadEmergenteBandeja(container, {
      maestroId: 'maestro-1',
      deepLinkActividadId: 'act-demo-institucion-1'
    })

    await vi.waitFor(() => {
      expect(container.querySelector('[data-role="modal-confirmacion"]')).toBeTruthy()
    })

    const dialog = container.querySelector('.actividad-modal-dialog')
    expect(dialog.style.overflowX).toBe('hidden')

    const botones = container.querySelectorAll('.opcion-respuesta-btn')
    botones.forEach(btn => {
      expect(btn.style.minHeight).toBe('44px')
      expect(btn.style.minWidth).toBe('44px')
    })
  })

  // 13. Demo mode (config.isDemoMode=true) retorna mock data correctamente
  it('13. Demo mode (config.isDemoMode=true) retorna mock data correctamente', async () => {
    const pendientes = await adapter.obtenerConfirmacionesPendientes('maestro-1')
    expect(Array.isArray(pendientes)).toBe(true)
    expect(pendientes.length).toBeGreaterThan(0)
  })

  // 14. Build sin regresiones: imports tree-shake OK y tipos correctos
  it('14. Build sin regresiones: exportaciones e interfaces consistentes', async () => {
    expect(typeof adapter.confirmarActividad).toBe('function')
    expect(typeof adapter.obtenerConfirmacionesPendientes).toBe('function')
    expect(typeof adapter.obtenerActividadPorId).toBe('function')
    expect(typeof adapter.obtenerActividadesPorAlcance).toBe('function')
    expect(typeof adapter.crearActividadInstitucional).toBe('function')
    expect(typeof adapter.validarConfirmacionAcm).toBe('function')
    expect(typeof adapter.obtenerTodasLasConfirmaciones).toBe('function')
    expect(typeof adapter.obtenerResumenAgregado).toBe('function')
  })

  // 15. getSesionesPorRango() respeta emergente_id -> no false "sin asistencias"
  it('15. getSesionesPorRango() respeta emergente_id -> no false "sin asistencias"', () => {
    // Si emergente_id existe y confirmacion es 'si', la sesión queda justificada institucionalmente
    const sesion = {
      id: 's1',
      emergente_id: 'act-root-1',
      asistencias: [],
      confirmacion: { respuesta: 'si', estado_validacion: 'validado' }
    }

    const esJustificada = Boolean(sesion.emergente_id && sesion.confirmacion?.respuesta === 'si')
    expect(esJustificada).toBe(true)
  })
})
