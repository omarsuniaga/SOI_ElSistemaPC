import { describe, it, expect, beforeEach } from 'vitest'
import {
  __resetForTests,
  crearSolicitud,
  listarPorMaestro,
  listarPorDepartamento,
  preAprobar,
  escalarAFin,
  cargarPresupuesto,
  resolver,
  contarPendientes,
  contarNovedadesMaestro,
} from '../solicitudesNecesidadesMock.js'

describe('solicitudesNecesidadesMock', () => {
  beforeEach(() => {
    __resetForTests()
  })

  it('creates and routes a solicitud through ACM to FIN', async () => {
    const row = await crearSolicitud({
      maestro_id: 'maestro-1',
      maestro_nombre: 'Maestro Uno',
      tipo_necesidad: 'material',
      titulo: 'Cuerdas',
      descripcion: 'Necesitamos cuerdas nuevas',
      prioridad: 'alta',
    })

    expect(row.estado).toBe('pendiente')
    expect(row.departamento_actual).toBe('ACM')

    const items = await listarPorMaestro('maestro-1')
    expect(items).toHaveLength(1)

    await preAprobar(row.id, 'admin-1', 'ok')
    await escalarAFin(row.id, 'admin-1')
    const presupuestada = await cargarPresupuesto(row.id, 'cajero-1', 1500, 1499.99, 'presupuesto listo')

    expect(presupuestada.estado).toBe('presupuestada')
    expect(presupuestada.departamento_actual).toBe('FIN')
    expect(presupuestada.presupuesto).toBe(1500)
    expect(presupuestada.costo_estimado).toBe(1499.99)

    const pendACM = await contarPendientes('ACM')
    const pendFIN = await contarPendientes('FIN')
    expect(pendACM).toBe(0)
    expect(pendFIN).toBe(1)

    const finRows = await listarPorDepartamento('FIN', ['presupuestada'])
    expect(finRows).toHaveLength(1)

    await resolver(row.id, 'entregada', 'cajero-1', 'cerrado')
    expect(await contarPendientes('FIN')).toBe(0)

    const acmRows = await listarPorDepartamento('ACM', ['pendiente', 'pre_aprobada_acm', 'rechazada_acm', 'en_presupuesto'])
    expect(acmRows).toHaveLength(0)

    const novedades = await contarNovedadesMaestro('maestro-1', new Date(Date.now() - 60_000).toISOString())
    expect(novedades).toBe(1)
  })
})
