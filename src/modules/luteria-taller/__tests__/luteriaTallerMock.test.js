/**
 * luteriaTallerMock.test.js
 * Portal de Lutería — Tests para el mock data layer (Fase 1).
 * Valida CRUD de órdenes, diagnósticos, insumos y dashboard.
 */
import { describe, it, expect, beforeEach } from 'vitest'

// Fresh imports each test via dynamic import to reset module state
async function getMock() {
  return await import('../api/luteriaTallerMock.js')
}

describe('luteriaTallerMock — Órdenes de reparación', () => {
  it('getOrdenes devuelve lista completa sin filtros', async () => {
    const m = await getMock()
    const ordenes = await m.getOrdenes()
    expect(Array.isArray(ordenes)).toBe(true)
    expect(ordenes.length).toBeGreaterThanOrEqual(5)
  })

  it('getOrdenes filtra por estado', async () => {
    const m = await getMock()
    const enReparacion = await m.getOrdenes({ estado: 'en_reparacion' })
    expect(enReparacion.every((o) => o.estado === 'en_reparacion')).toBe(true)
  })

  it('getOrdenes filtra por instrumento', async () => {
    const m = await getMock()
    const filtradas = await m.getOrdenes({ instrumento_id: 'inst-003' })
    expect(filtradas.every((o) => o.instrumento_id === 'inst-003')).toBe(true)
  })

  it('getOrdenById devuelve null para ID inexistente', async () => {
    const m = await getMock()
    const orden = await m.getOrdenById('no-existe')
    expect(orden).toBeNull()
  })

  it('getOrdenById devuelve la orden correcta', async () => {
    const m = await getMock()
    const orden = await m.getOrdenById('lut-ord-001')
    expect(orden).not.toBeNull()
    expect(orden.id).toBe('lut-ord-001')
    expect(orden.estado).toBe('en_reparacion')
  })

  it('createOrden crea orden en estado reportado', async () => {
    const m = await getMock()
    const nueva = await m.createOrden({
      instrumento_id: 'inst-001',
      descripcion_inicial: 'Test de creación',
      prioridad: 'alta',
    })
    expect(nueva.estado).toBe('reportado')
    expect(nueva.instrumento_id).toBe('inst-001')
    expect(nueva.fecha_recepcion).toBeTruthy()
    expect(nueva.id).toMatch(/^lut-ord-/)
  })

  it('updateOrdenEstado cambia estado y actualiza updated_at', async () => {
    const m = await getMock()
    const actualizada = await m.updateOrdenEstado('lut-ord-001', 'en_prueba')
    expect(actualizada.estado).toBe('en_prueba')
    expect(actualizada.updated_at).not.toBe(actualizada.created_at)
  })

  it('updateOrdenEstado lanza error si ID no existe', async () => {
    const m = await getMock()
    await expect(m.updateOrdenEstado('no-existe', 'cerrado')).rejects.toThrow()
  })

  it('updateOrden aplica cambios parciales', async () => {
    const m = await getMock()
    const actualizada = await m.updateOrden('lut-ord-002', {
      tecnico_responsable: 'lut-demo-02',
      tecnico_responsable_nombre: 'Otro Técnico',
    })
    expect(actualizada.tecnico_responsable).toBe('lut-demo-02')
    expect(actualizada.tecnico_responsable_nombre).toBe('Otro Técnico')
    // No altera otros campos
    expect(actualizada.estado).toBe('pendiente_diagnostico')
  })
})

describe('luteriaTallerMock — Diagnósticos', () => {
  it('getDiagnosticos devuelve array vacío para orden sin diagnósticos', async () => {
    const m = await getMock()
    const diags = await m.getDiagnosticos('lut-ord-002')
    expect(Array.isArray(diags)).toBe(true)
    expect(diags.length).toBe(0)
  })

  it('getDiagnosticos devuelve diagnósticos de una orden', async () => {
    const m = await getMock()
    const diags = await m.getDiagnosticos('lut-ord-001')
    expect(diags.length).toBeGreaterThanOrEqual(1)
    expect(diags[0].orden_id).toBe('lut-ord-001')
  })

  it('createDiagnostico crea y enlaza a la orden', async () => {
    const m = await getMock()
    const diag = await m.createDiagnostico({
      orden_id: 'lut-ord-002',
      diagnostico_tecnico: 'Prueba de diagnóstico',
      gravedad: 'leve',
      costo_mano_obra: 10,
      costo_materiales: 5,
    })
    expect(diag.orden_id).toBe('lut-ord-002')
    expect(diag.diagnostico_tecnico).toBe('Prueba de diagnóstico')
    expect(diag.id).toMatch(/^lut-diag-/)
  })
})

describe('luteriaTallerMock — Presupuestos', () => {
  it('getPresupuestos devuelve presupuestos de una orden', async () => {
    const m = await getMock()
    const pres = await m.getPresupuestos('lut-ord-004')
    expect(pres.length).toBeGreaterThanOrEqual(1)
  })

  it('createPresupuesto crea en estado borrador', async () => {
    const m = await getMock()
    const pres = await m.createPresupuesto({
      orden_id: 'lut-ord-001',
      subtotal_mano_obra: 30,
      subtotal_materiales: 20,
    })
    expect(pres.estado).toBe('borrador')
  })

  it('updatePresupuestoEstado cambia estado', async () => {
    const m = await getMock()
    // create one first
    const pres = await m.createPresupuesto({
      orden_id: 'lut-ord-001',
      subtotal_mano_obra: 10,
    })
    const actualizado = await m.updatePresupuestoEstado(pres.id, 'aprobado', {
      aprobado_por: 'fin-demo-01',
    })
    expect(actualizado.estado).toBe('aprobado')
    expect(actualizado.aprobado_por).toBe('fin-demo-01')
  })
})

describe('luteriaTallerMock — Insumos', () => {
  it('getInsumos devuelve catálogo completo', async () => {
    const m = await getMock()
    const insumos = await m.getInsumos()
    expect(insumos.length).toBeGreaterThanOrEqual(8)
  })

  it('getInsumos filtra por categoría', async () => {
    const m = await getMock()
    const cuerdas = await m.getInsumos({ categoria: 'cuerdas' })
    expect(cuerdas.every((i) => i.categoria === 'cuerdas')).toBe(true)
  })

  it('getInsumos filtra stock bajo', async () => {
    const m = await getMock()
    const bajos = await m.getInsumos({ stock_bajo: true })
    expect(bajos.every((i) => i.stock_actual <= i.stock_minimo)).toBe(true)
  })

  it('getInsumoById devuelve null para inexistente', async () => {
    const m = await getMock()
    const insumo = await m.getInsumoById('no-existe')
    expect(insumo).toBeNull()
  })

  it('ajustarStock reduce stock en consumo', async () => {
    const m = await getMock()
    const mov = await m.ajustarStock('lut-ins-001', 1, 'consumo', 'lut-ord-001', 'lut-demo-01')
    expect(mov.tipo_movimiento).toBe('consumo')
    // Verify stock decreased
    const insumo = await m.getInsumoById('lut-ins-001')
    expect(insumo.stock_actual).toBe(11) // was 12, consumed 1
  })

  it('ajustarStock incrementa stock en entrada', async () => {
    const m = await getMock()
    const mov = await m.ajustarStock('lut-ins-004', 5, 'entrada', null, 'log-demo-01')
    expect(mov.tipo_movimiento).toBe('entrada')
    const insumo = await m.getInsumoById('lut-ins-004')
    expect(insumo.stock_actual).toBe(6) // was 1, added 5
  })
})

describe('luteriaTallerMock — Solicitudes de compra', () => {
  it('getSolicitudesCompra devuelve lista', async () => {
    const m = await getMock()
    const sols = await m.getSolicitudesCompra()
    expect(sols.length).toBeGreaterThanOrEqual(2)
  })

  it('createSolicitudCompra crea en estado pendiente', async () => {
    const m = await getMock()
    const sol = await m.createSolicitudCompra({
      insumo_id: 'lut-ins-001',
      cantidad_solicitada: 10,
      justificacion: 'Test',
    })
    expect(sol.estado).toBe('pendiente')
  })

  it('updateSolicitudEstado cambia estado', async () => {
    const m = await getMock()
    const sol = await m.createSolicitudCompra({
      insumo_id: 'lut-ins-002',
      cantidad_solicitada: 5,
    })
    const actualizada = await m.updateSolicitudEstado(sol.id, 'aprobada', {
      aprobado_por: 'fin-demo-01',
    })
    expect(actualizada.estado).toBe('aprobada')
  })
})

describe('luteriaTallerMock — Evidencias', () => {
  it('getEvidencias devuelve evidencias de una orden', async () => {
    const m = await getMock()
    const evs = await m.getEvidencias('lut-ord-001')
    expect(evs.length).toBeGreaterThanOrEqual(1)
  })

  it('getEvidencias devuelve array vacío para orden sin evidencias', async () => {
    const m = await getMock()
    const evs = await m.getEvidencias('lut-ord-003')
    expect(evs).toEqual([])
  })

  it('createEvidencia crea correctamente', async () => {
    const m = await getMock()
    const ev = await m.createEvidencia({
      orden_id: 'lut-ord-003',
      tipo: 'foto_despues',
      nombre: 'test.jpg',
      descripcion: 'Test evidencia',
      subido_por: 'lut-demo-01',
      subido_por_nombre: 'Juan Luthier',
    })
    expect(ev.orden_id).toBe('lut-ord-003')
    expect(ev.tipo).toBe('foto_despues')
  })
})

describe('luteriaTallerMock — Dashboard KPIs', () => {
  it('getDashboard devuelve estructura completa', async () => {
    const m = await getMock()
    const dash = await m.getDashboard()
    expect(dash).toHaveProperty('recibidos_hoy')
    expect(dash).toHaveProperty('pendientes_diagnostico')
    expect(dash).toHaveProperty('en_reparacion')
    expect(dash).toHaveProperty('esperando_insumos')
    expect(dash).toHaveProperty('listos_entrega')
    expect(dash).toHaveProperty('abiertas_total')
    expect(dash).toHaveProperty('costo_estimado_abierto')
    expect(dash).toHaveProperty('con_cobro_pendiente')
    expect(dash).toHaveProperty('insumos_stock_bajo')
  })

  it('getDashboard KPIs son números no negativos', async () => {
    const m = await getMock()
    const dash = await m.getDashboard()
    expect(typeof dash.abiertas_total).toBe('number')
    expect(dash.abiertas_total).toBeGreaterThanOrEqual(0)
    expect(dash.costo_estimado_abierto).toBeGreaterThanOrEqual(0)
  })
})
