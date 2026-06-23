import { describe, test, expect, beforeAll } from 'vitest'
import { config } from '../../../core/config/config.js'
// Set dummy Supabase env vars before importing inventarioApi
// (supabaseClient.js validates these at module init, but demo mode never uses them)
process.env.VITE_SUPABASE_URL = 'http://localhost'
process.env.VITE_SUPABASE_ANON_KEY = 'test-key'


// Force demo mode
config.isDemoMode = true

const api = await import('../api/inventarioApi.js')

describe('INV-TASK-06: API Facade + Mock + Integration Tests', () => {

  describe('CP01: Crear activo → asignar accesorio → listar accesorios', () => {
    let activoId

    test('crear activo retorna data con id', async () => {
      const { data, error } = await api.crearActivo({
        codigo_inventario: 'V8-INT-001',
        tipo_instrumento: 'Violín',
        marca: 'Test',
        modelo: 'T1',
        estado_uso: 'disponible',
        estado_conservacion: 'bueno',
        activo: true,
      })
      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data.id).toBeTruthy()
      expect(data.codigo_inventario).toBe('V8-INT-001')
      activoId = data.id
    })

    test('crear accesorio para ese activo', async () => {
      const { data, error } = await api.crearAccesorio({
        activo_id: activoId,
        tipo: 'funda',
        marca: 'Gewa',
        cantidad: 1,
      })
      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data.activo_id).toBe(activoId)
      expect(data.tipo).toBe('funda')
    })

    test('listar accesorios por activo_id verifica relación', async () => {
      const { data, error } = await api.obtenerAccesorios(activoId)
      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(1)
      expect(data.every(a => a.activo_id === activoId)).toBe(true)
    })
  })

  describe('CP02: Crear activo → crear reparación → avanzar estado → crear factura → marcar pagada', () => {
    let activoId, reparacionId, facturaId

    test('crear activo disponible', async () => {
      const { data, error } = await api.crearActivo({
        codigo_inventario: 'V8-INT-002',
        tipo_instrumento: 'Guitarra',
        marca: 'Test',
        modelo: 'G1',
        estado_uso: 'disponible',
        estado_conservacion: 'bueno',
        activo: true,
      })
      expect(error).toBeNull()
      activoId = data.id
    })

    test('crear reparación en estado recibido', async () => {
      const { data, error } = await api.crearReparacion({
        activo_id: activoId,
        tipo_tallerista: 'externo',
        tallerista_nombre: 'Taller Test',
        descripcion: 'Cambio de cuerdas',
        costo_estimado: 1500,
      })
      expect(error).toBeNull()
      expect(data.estado).toBe('recibido')
      reparacionId = data.id
    })

    test('avanzar a en_reparacion', async () => {
      const { data, error } = await api.cambiarEstadoReparacion(reparacionId, 'en_reparacion')
      expect(error).toBeNull()
      expect(data.estado).toBe('en_reparacion')
    })

    test('avanzar a finalizado', async () => {
      const { data, error } = await api.actualizarReparacion(reparacionId, { costo_real: 1400, fecha_egreso: new Date().toISOString().split('T')[0] })
      expect(error).toBeNull()
      const { data: avanzado, error: err2 } = await api.cambiarEstadoReparacion(reparacionId, 'finalizado')
      expect(err2).toBeNull()
      expect(avanzado.estado).toBe('finalizado')
    })

    test('avanzar a entregado', async () => {
      const { data, error } = await api.cambiarEstadoReparacion(reparacionId, 'entregado')
      expect(error).toBeNull()
      expect(data.estado).toBe('entregado')
    })

    test('crear factura para la reparación', async () => {
      const { data, error } = await api.crearFacturaReparacion({
        reparacion_id: reparacionId,
        monto_total: 1400,
        impuestos: 252,
        metodo_pago: 'transferencia',
        tipo_factura: 'alumno',
      })
      expect(error).toBeNull()
      expect(data.estado_pago).toBe('pendiente')
      facturaId = data.id
    })

    test('marcar factura como pagada', async () => {
      const { data, error } = await api.registrarPagoFactura(facturaId, { metodo_pago: 'transferencia' })
      expect(error).toBeNull()
      expect(data.estado_pago).toBe('pagado')
      expect(data.fecha_pago).toBeTruthy()
    })
  })

  describe('CP03: Crear 2 activos → crear comodato → devolver → verificar historial', () => {
    let activoId, comodatoId

    test('crear dos activos disponibles', async () => {
      const r1 = await api.crearActivo({ codigo_inventario: 'V8-INT-003', tipo_instrumento: 'Violín', marca: 'M1', estado_uso: 'disponible', estado_conservacion: 'bueno', activo: true })
      expect(r1.error).toBeNull()
      const r2 = await api.crearActivo({ codigo_inventario: 'V8-INT-004', tipo_instrumento: 'Flauta', marca: 'M2', estado_uso: 'disponible', estado_conservacion: 'bueno', activo: true })
      expect(r2.error).toBeNull()
      activoId = r1.data.id
    })

    test('asignar en comodato', async () => {
      const { data, error } = await api.crearComodato({
        activo_id: activoId,
        alumno_id: 'alu-test',
        tipo_comodato: 'escolar',
        estado: 'activo',
      })
      expect(error).toBeNull()
      expect(data.estado).toBe('activo')
      comodatoId = data.id
    })

    test('devolver comodato', async () => {
      const { data, error } = await api.devolverComodato(comodatoId)
      expect(error).toBeNull()
      expect(data.estado).toBe('devuelto')
    })

    test('verificar historial del activo contiene eventos', async () => {
      const { data, error } = await api.obtenerHistorialActivo(activoId)
      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('CP04: Flujo de intercambio', () => {
    let comodatoOrigen, comodatoDestino, activoOrigen, activoDestino, alumnoId

    test('preparar datos: crear activos y comodatos', async () => {
      const a1 = await api.crearActivo({ codigo_inventario: 'V8-INT-005', tipo_instrumento: 'Violín', marca: 'M1', estado_uso: 'disponible', estado_conservacion: 'bueno', activo: true })
      expect(a1.error).toBeNull()
      const a2 = await api.crearActivo({ codigo_inventario: 'V8-INT-006', tipo_instrumento: 'Cello', marca: 'M2', estado_uso: 'disponible', estado_conservacion: 'bueno', activo: true })
      expect(a2.error).toBeNull()
      activoOrigen = a1.data.id
      activoDestino = a2.data.id
      alumnoId = 'alu-intercambio'

      const c1 = await api.crearComodato({ activo_id: activoOrigen, alumno_id: alumnoId, tipo_comodato: 'escolar', estado: 'activo' })
      expect(c1.error).toBeNull()
      comodatoOrigen = c1.data.id
    })

    test('intercambiar instrumentos', async () => {
      const { data, error } = await api.intercambiarInstrumentos(comodatoOrigen, activoDestino, alumnoId)
      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })
  })

  describe('CP05: Dashboard KPI', () => {
    test('obtenerKPI retorna estructura esperada', async () => {
      const { data, error } = await api.obtenerKPI()
      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data.resumen).toBeDefined()
      expect(typeof data.resumen.total).toBe('number')
      expect(typeof data.resumen.disponibles).toBe('number')
      expect(typeof data.resumen.en_uso).toBe('number')
      expect(typeof data.distribucion_por_tipo).toBeDefined()
    })
  })

  describe('CP06: Errores', () => {
    test('obtenerActivoPorId con ID inexistente retorna error 404', async () => {
      const { data, error } = await api.obtenerActivoPorId('id-inexistente')
      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe(404)
    })

    test('transición de estado inválida retorna error', async () => {
      const r = await api.crearActivo({ codigo_inventario: 'V8-INT-007', tipo_instrumento: 'Violín', marca: 'M', estado_uso: 'disponible', estado_conservacion: 'bueno', activo: true })
      const { error: err1 } = await api.cambiarEstadoActivo(r.data.id, 'prestado') // disponible → prestado is valid
      const { error: err2 } = await api.cambiarEstadoActivo(r.data.id, 'disponible')
      expect(err2).toBeNull() // prestado → disponible is valid
      const { error: err3 } = await api.cambiarEstadoActivo(r.data.id, 'en_mantenimiento')
      expect(err3).toBeNull() // disponible → en_mantenimiento is valid

      // Create a new one with a guaranteed invalid transition chain
      const r2 = await api.crearActivo({ codigo_inventario: 'V8-INT-008', tipo_instrumento: 'Violín', marca: 'M', estado_uso: 'de_baja', estado_conservacion: 'bueno', activo: true })
      const { error: err4 } = await api.cambiarEstadoActivo(r2.data.id, 'disponible')
      expect(err4).not.toBeNull()
    })

    test('crear accesorio con activo_id inválido retorna error', async () => {
      const { data, error } = await api.crearAccesorio({ activo_id: 'no-existe', tipo: 'funda', cantidad: 1 })
      expect(data).toBeNull()
      expect(error).not.toBeNull()
    })

    test('factura duplicada para misma reparación retorna error', async () => {
      const a = await api.crearActivo({ codigo_inventario: 'V8-INT-009', tipo_instrumento: 'Violín', marca: 'M', estado_uso: 'disponible', estado_conservacion: 'bueno', activo: true })
      const r = await api.crearReparacion({ activo_id: a.data.id, tipo_tallerista: 'externo', tallerista_nombre: 'T', descripcion: 'Test' })
      await api.crearFacturaReparacion({ reparacion_id: r.data.id, monto_total: 500, metodo_pago: 'efectivo' })
      const { error } = await api.crearFacturaReparacion({ reparacion_id: r.data.id, monto_total: 500, metodo_pago: 'efectivo' })
      expect(error).not.toBeNull()
    })

    test('anular factura ya pagada retorna error', async () => {
      const a = await api.crearActivo({ codigo_inventario: 'V8-INT-010', tipo_instrumento: 'Violín', marca: 'M', estado_uso: 'disponible', estado_conservacion: 'bueno', activo: true })
      const r = await api.crearReparacion({ activo_id: a.data.id, tipo_tallerista: 'externo', tallerista_nombre: 'T', descripcion: 'Test' })
      const f = await api.crearFacturaReparacion({ reparacion_id: r.data.id, monto_total: 500, metodo_pago: 'efectivo' })
      await api.registrarPagoFactura(f.data.id)
      const { error } = await api.anularFactura(f.data.id)
      expect(error).not.toBeNull()
    })
  })
})