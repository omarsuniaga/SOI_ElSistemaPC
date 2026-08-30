/**
 * inventarioMock.js — Implementación mock del módulo Inventario (DataAdapter).
 *
 * Completa el patrón mock/real que ya usan alumnos/maestros/etc. Antes faltaba
 * y `inventarioApi.getApi()` devolvía siempre Supabase → en Demo mode y en tests
 * las vistas colgaban esperando una llamada de red que nunca resuelve.
 *
 * Regla Mock First del proyecto: toda feature funciona en Demo mode.
 * Contrato de retorno idéntico al de inventarioSupabase.js: { data, error } (+ total en listados paginados).
 */

const ok = (data, extra = {}) => ({ data, error: null, ...extra })
const err = (message, code) => ({ data: null, error: { message, code } })

// Transiciones válidas de estado_uso de un activo. `de_baja` es terminal.
const TRANSICIONES_ACTIVO = {
  disponible: ['prestado', 'en_uso', 'en_mantenimiento', 'en_reparacion', 'ocioso', 'de_baja'],
  prestado: ['disponible', 'en_mantenimiento', 'en_reparacion', 'de_baja'],
  en_uso: ['disponible', 'en_mantenimiento', 'en_reparacion', 'ocioso', 'de_baja'],
  ocioso: ['disponible', 'prestado', 'en_uso', 'de_baja'],
  en_mantenimiento: ['disponible', 'en_reparacion', 'de_baja'],
  en_reparacion: ['disponible', 'en_mantenimiento', 'de_baja'],
  de_baja: [],
}

function _log(activo_id, tipo_evento, descripcion, actor_nombre = 'Sistema (Demo)') {
  _historial.push({ id: 'his-' + (_historial.length + 1), activo_id, tipo_evento, descripcion, actor_nombre, created_at: new Date().toISOString() })
}

// ── Fixtures ────────────────────────────────────────────────────────────────
const HOY = new Date()
const enDias = (n) => {
  const d = new Date(HOY)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

let _activos = [
  { id: 'act-001', codigo_inventario: 'V8-VIO-001', tipo_instrumento: 'Violín', marca: 'Yamaha', modelo: 'V5', serie: 'Y1001', estado_uso: 'en_uso', estado_conservacion: 'bueno', ubicacion: 'Sede Principal', valor_estimado: 18000, activo: true, foto_url: null, alumno_id: 'alu-1', alumno_nombre: 'Ana Pérez' },
  { id: 'act-1', codigo_inventario: 'VLN-002', tipo_instrumento: 'Violín', marca: 'Yamaha', modelo: 'V5', serie: 'Y1002', estado_uso: 'en_uso', estado_conservacion: 'bueno', ubicacion: 'Sede Principal', valor_estimado: 18000, activo: true, foto_url: null, alumno_id: 'alu-1', alumno_nombre: 'Ana Pérez' },
  { id: 'act-2', codigo_inventario: 'VLN-002', tipo_instrumento: 'Violín', marca: 'Cremona', modelo: 'SV-130', serie: 'C2002', estado_uso: 'disponible', estado_conservacion: 'excelente', ubicacion: 'Bodega', valor_estimado: 15000, activo: true, foto_url: null },
  { id: 'act-3', codigo_inventario: 'CEL-001', tipo_instrumento: 'Cello', marca: 'Stentor', modelo: 'Student II', serie: 'S3003', estado_uso: 'en_uso', estado_conservacion: 'regular', ubicacion: 'Sede Principal', valor_estimado: 42000, activo: true, foto_url: null, alumno_id: 'alu-2', alumno_nombre: 'Luis Gómez' },
  { id: 'act-4', codigo_inventario: 'VLA-001', tipo_instrumento: 'Viola', marca: 'Yamaha', modelo: 'VA7', serie: 'Y4004', estado_uso: 'disponible', estado_conservacion: 'bueno', ubicacion: 'Bodega', valor_estimado: 22000, activo: true, foto_url: null },
  { id: 'act-5', codigo_inventario: 'CTB-001', tipo_instrumento: 'Contrabajo', marca: 'Palatino', modelo: 'VB-004', serie: 'P5005', estado_uso: 'en_reparacion', estado_conservacion: 'malo', ubicacion: 'Taller', valor_estimado: 65000, activo: true, foto_url: null },
  { id: 'act-6', codigo_inventario: 'FLT-001', tipo_instrumento: 'Flauta', marca: 'Jupiter', modelo: 'JFL-700', serie: 'J6006', estado_uso: 'ocioso', estado_conservacion: 'bueno', ubicacion: 'Bodega', valor_estimado: 12000, activo: true, foto_url: null },
  { id: 'act-7', codigo_inventario: 'CLR-001', tipo_instrumento: 'Clarinete', marca: 'Buffet', modelo: 'B12', serie: 'B7007', estado_uso: 'en_uso', estado_conservacion: 'bueno', ubicacion: 'Sede Principal', valor_estimado: 20000, activo: true, foto_url: null, alumno_id: 'alu-3', alumno_nombre: 'María Díaz' },
  { id: 'act-8', codigo_inventario: 'TRP-001', tipo_instrumento: 'Trompeta', marca: 'Bach', modelo: 'TR300', serie: 'B8008', estado_uso: 'de_baja', estado_conservacion: 'fuera_servicio', ubicacion: 'Bodega', valor_estimado: 0, activo: false, foto_url: null },
]

let _reparaciones = [
  { id: 'rep-1', activo_id: 'act-5', descripcion: 'Cambio de cuerdas y ajuste de puente', estado: 'en_reparacion', fecha_ingreso: enDias(-10), fecha_estimada: enDias(5), tallerista_nombre: 'Kalani', costo_estimado: 3500, created_at: enDias(-10), inventario_activos: { codigo_inventario: 'CTB-001', tipo_instrumento: 'Contrabajo', marca: 'Palatino' } },
  { id: 'rep-2', activo_id: 'act-3', descripcion: 'Reparación de barniz y limpieza profunda', estado: 'finalizado', fecha_ingreso: enDias(-25), fecha_salida: enDias(-3), tallerista_nombre: 'Kalani', costo_estimado: 2000, created_at: enDias(-25), inventario_activos: { codigo_inventario: 'CEL-001', tipo_instrumento: 'Cello', marca: 'Stentor' } },
  { id: 'rep-3', activo_id: 'act-1', descripcion: 'Ajuste de clavijas', estado: 'entregado', fecha_ingreso: enDias(-40), fecha_salida: enDias(-35), tallerista_nombre: 'Externo — Luthería RD', costo_estimado: 800, created_at: enDias(-40), inventario_activos: { codigo_inventario: 'VLN-001', tipo_instrumento: 'Violín', marca: 'Yamaha' } },
]

const _comodatos = [
  { id: 'com-1', activo_id: 'act-1', alumno_id: 'alu-1', alumno_nombre: 'Ana Pérez', estado: 'activo', fecha_entrega: enDias(-120), fecha_vencimiento: enDias(4), inventario_activos: { codigo_inventario: 'VLN-001', tipo_instrumento: 'Violín', marca: 'Yamaha', modelo: 'V5' }, alumnos: { nombre_completo: 'Ana Pérez' } },
  { id: 'com-2', activo_id: 'act-3', alumno_id: 'alu-2', alumno_nombre: 'Luis Gómez', estado: 'activo', fecha_entrega: enDias(-90), fecha_vencimiento: enDias(20), inventario_activos: { codigo_inventario: 'CEL-001', tipo_instrumento: 'Cello', marca: 'Stentor', modelo: 'Student II' }, alumnos: { nombre_completo: 'Luis Gómez' } },
  { id: 'com-3', activo_id: 'act-7', alumno_id: 'alu-3', alumno_nombre: 'María Díaz', estado: 'activo', fecha_entrega: enDias(-200), fecha_vencimiento: enDias(-5), inventario_activos: { codigo_inventario: 'CLR-001', tipo_instrumento: 'Clarinete', marca: 'Buffet', modelo: 'B12' }, alumnos: { nombre_completo: 'María Díaz' } },
]

let _accesorios = [
  { id: 'acc-1', activo_id: 'act-1', tipo: 'estuche', descripcion: 'Estuche rígido', estado: 'bueno' },
  { id: 'acc-2', activo_id: 'act-1', tipo: 'arco', descripcion: 'Arco de fibra de carbono', estado: 'bueno' },
]

const _facturas = [
  { id: 'fac-1', reparacion_id: 'rep-2', tipo_factura: 'reparacion', numero: 'F-0001', monto: 2000, estado_pago: 'pagada', fecha_emision: enDias(-3), proveedor: 'Taller Interno' },
  { id: 'fac-2', reparacion_id: 'rep-3', tipo_factura: 'reparacion', numero: 'F-0002', monto: 800, estado_pago: 'pendiente', fecha_emision: enDias(-35), proveedor: 'Luthería RD' },
]

const _historial = [
  { id: 'his-1', activo_id: 'act-001', tipo_evento: 'alta', descripcion: 'Activo dado de alta en el inventario', actor_nombre: 'Coordinación LOG', created_at: enDias(-180) + 'T09:00:00Z' },
  { id: 'his-2', activo_id: 'act-001', tipo_evento: 'comodato', descripcion: 'Asignado en comodato a Ana Pérez', actor_nombre: 'Coordinación LOG', created_at: enDias(-120) + 'T10:30:00Z' },
  { id: 'his-3', activo_id: 'act-001', tipo_evento: 'reparacion', descripcion: 'Ingresó a taller: ajuste de clavijas', actor_nombre: 'Kalani', created_at: enDias(-40) + 'T14:15:00Z' },
  { id: 'his-4', activo_id: 'act-001', tipo_evento: 'cambio_estado', descripcion: 'Estado: en_reparacion → en_uso', actor_nombre: 'Kalani', created_at: enDias(-35) + 'T11:00:00Z' },
  { id: 'his-5', activo_id: 'act-1', tipo_evento: 'alta', descripcion: 'Activo dado de alta', actor_nombre: 'Coordinación LOG', created_at: enDias(-120) + 'T09:00:00Z' },
]

function _kpi() {
  const vivos = _activos.filter((a) => a.activo)
  const by = (estado) => vivos.filter((a) => a.estado_uso === estado).length
  const distribucion_por_tipo = {}
  for (const a of vivos) distribucion_por_tipo[a.tipo_instrumento] = (distribucion_por_tipo[a.tipo_instrumento] || 0) + 1
  return {
    resumen: {
      total: vivos.length,
      disponibles: by('disponible'),
      en_uso: by('en_uso'),
      ociosos: by('ocioso'),
      en_reparacion: by('en_reparacion'),
      de_baja: _activos.filter((a) => !a.activo).length,
      valor_total: vivos.reduce((s, a) => s + (a.valor_estimado || 0), 0),
    },
    distribucion_por_tipo,
  }
}

// ── Activos ─────────────────────────────────────────────────────────────────
export async function obtenerActivos(filtros = {}) {
  let list = _activos.filter((a) => a.activo)
  if (filtros.estado_uso) list = list.filter((a) => a.estado_uso === filtros.estado_uso)
  if (filtros.tipo_instrumento) list = list.filter((a) => (a.tipo_instrumento || '').toLowerCase().includes(filtros.tipo_instrumento.toLowerCase()))
  if (filtros.estado_conservacion) list = list.filter((a) => a.estado_conservacion === filtros.estado_conservacion)
  if (filtros.q) {
    const s = filtros.q.toLowerCase()
    list = list.filter((a) => [a.codigo_inventario, a.tipo_instrumento, a.marca, a.modelo].some((v) => (v || '').toLowerCase().includes(s)))
  }
  const total = list.length
  if (filtros.page && filtros.pageSize) {
    const start = (filtros.page - 1) * filtros.pageSize
    list = list.slice(start, start + filtros.pageSize)
  }
  return ok(list, { total })
}
export async function obtenerActivoPorId(id) {
  const a = _activos.find((x) => x.id === id)
  return a ? ok(a) : err(`Activo ${id} no encontrado`, 404)
}
export async function crearActivo(payload) {
  const a = { id: 'act-' + (_activos.length + 1) + '-' + Math.random().toString(36).slice(2, 7), activo: true, ...payload }
  _activos.push(a)
  _log(a.id, 'alta', `Activo ${a.codigo_inventario || a.id} dado de alta`)
  return ok(a)
}
export async function actualizarActivo(id, payload) { const a = _activos.find((x) => x.id === id); if (a) Object.assign(a, payload); return a ? ok(a) : err(`Activo ${id} no encontrado`, 404) }
export async function cambiarEstadoActivo(id, nuevoEstado) {
  const a = _activos.find((x) => x.id === id)
  if (!a) return err(`Activo ${id} no encontrado`, 404)
  const permitidos = TRANSICIONES_ACTIVO[a.estado_uso] ?? []
  if (a.estado_uso !== nuevoEstado && !permitidos.includes(nuevoEstado)) {
    return err(`Transición de estado inválida: ${a.estado_uso} → ${nuevoEstado}`, 409)
  }
  const anterior = a.estado_uso
  a.estado_uso = nuevoEstado
  _log(id, 'cambio_estado', `Estado: ${anterior} → ${nuevoEstado}`)
  return ok(a)
}
export async function subirFotoActivo(id, _file) { const a = _activos.find((x) => x.id === id); if (a) a.foto_url = 'mock://foto/' + id; return ok(a?.foto_url || null) }
export async function obtenerActivosOciosos() { return ok(_activos.filter((a) => a.activo && a.estado_uso === 'ocioso').map((a) => ({ ...a, dias_prestado: 0 }))) }

// ── Accesorios ──────────────────────────────────────────────────────────────
export async function obtenerAccesorios(activoId) { return ok(_accesorios.filter((x) => x.activo_id === activoId)) }
export async function crearAccesorio(payload) {
  if (!_activos.some((a) => a.id === payload.activo_id)) {
    return err(`Activo ${payload.activo_id} no existe — no se puede asociar el accesorio`, 404)
  }
  const x = { id: 'acc-' + (_accesorios.length + 1), ...payload }
  _accesorios.push(x)
  return ok(x)
}
export async function actualizarAccesorio(id, payload) { const x = _accesorios.find((a) => a.id === id); if (x) Object.assign(x, payload); return ok(x || null) }
export async function eliminarAccesorio(id) { _accesorios = _accesorios.filter((a) => a.id !== id); return ok(true) }

// ── Historial ───────────────────────────────────────────────────────────────
export async function obtenerHistorialActivo(activoId) { return ok(_historial.filter((h) => h.activo_id === activoId)) }
export async function crearEventoManual(payload) { const h = { id: 'his-' + (_historial.length + 1), created_at: new Date().toISOString(), ...payload }; _historial.push(h); return ok(h) }

// ── Reparaciones ────────────────────────────────────────────────────────────
export async function obtenerReparaciones(filtros = {}) {
  let list = [..._reparaciones]
  if (filtros.estado) list = list.filter((r) => r.estado === filtros.estado)
  if (filtros.activo_id) list = list.filter((r) => r.activo_id === filtros.activo_id)
  return ok(list)
}
export async function obtenerReparacion(id) { return ok(_reparaciones.find((r) => r.id === id) || null) }
export async function crearReparacion(payload) { const r = { id: 'rep-' + (_reparaciones.length + 1), estado: 'recibido', created_at: new Date().toISOString(), ...payload }; _reparaciones.push(r); return ok(r) }
export async function actualizarReparacion(id, payload) { const r = _reparaciones.find((x) => x.id === id); if (r) Object.assign(r, payload); return ok(r || null) }
export async function cambiarEstadoReparacion(id, nuevoEstado) { const r = _reparaciones.find((x) => x.id === id); if (r) r.estado = nuevoEstado; return ok(r || null) }
export async function eliminarReparacion(id) { _reparaciones = _reparaciones.filter((r) => r.id !== id); return ok(true) }

// ── Facturas ────────────────────────────────────────────────────────────────
export async function obtenerFacturasReparacion(filtros = {}) {
  let list = [..._facturas]
  if (filtros.estado_pago) list = list.filter((f) => f.estado_pago === filtros.estado_pago)
  if (filtros.tipo_factura) list = list.filter((f) => f.tipo_factura === filtros.tipo_factura)
  return ok(list)
}
export async function obtenerFactura(id) { return ok(_facturas.find((f) => f.id === id) || null) }
export async function crearFacturaReparacion(payload) {
  if (payload.reparacion_id && _facturas.some((f) => f.reparacion_id === payload.reparacion_id && f.estado_pago !== 'anulada')) {
    return err(`Ya existe una factura activa para la reparación ${payload.reparacion_id}`, 409)
  }
  const f = { id: 'fac-' + (_facturas.length + 1), estado_pago: 'pendiente', ...payload }
  _facturas.push(f)
  return ok(f)
}
export async function registrarPagoFactura(id, _payload = {}) {
  const f = _facturas.find((x) => x.id === id)
  if (!f) return err(`Factura ${id} no encontrada`, 404)
  f.estado_pago = 'pagado'
  f.fecha_pago = new Date().toISOString()
  return ok(f)
}
export async function anularFactura(id) {
  const f = _facturas.find((x) => x.id === id)
  if (!f) return err(`Factura ${id} no encontrada`, 404)
  if (f.estado_pago === 'pagado' || f.estado_pago === 'pagada') {
    return err('No se puede anular una factura ya pagada', 409)
  }
  f.estado_pago = 'anulada'
  return ok(f)
}

// ── Comodatos ───────────────────────────────────────────────────────────────
export async function obtenerComodatosVencidos() {
  const hoy = new Date().toISOString().slice(0, 10)
  return ok(_comodatos.filter((c) => c.estado === 'activo' && c.fecha_vencimiento < hoy))
}
export async function obtenerComodatosPorVencer(dias = 7) {
  const hoy = new Date().toISOString().slice(0, 10)
  const futuro = enDias(dias)
  return ok(_comodatos.filter((c) => c.estado === 'activo' && c.fecha_vencimiento >= hoy && c.fecha_vencimiento <= futuro))
}
export async function obtenerComodatosActivos() { return ok(_comodatos.filter((c) => c.estado === 'activo')) }
export async function obtenerComodatosAlumno(alumnoId) { return ok(_comodatos.filter((c) => c.alumno_id === alumnoId)) }
export async function crearComodato(payload) {
  const c = { id: 'com-' + (_comodatos.length + 1), estado: 'activo', fecha_entrega: new Date().toISOString().slice(0, 10), ...payload }
  _comodatos.push(c)
  if (c.activo_id) {
    const a = _activos.find((x) => x.id === c.activo_id)
    if (a) a.estado_uso = 'prestado'
    _log(c.activo_id, 'comodato', `Asignado en comodato al alumno ${c.alumno_id || '—'}`)
  }
  return ok(c)
}
export async function devolverComodato(id) {
  const c = _comodatos.find((x) => x.id === id)
  if (!c) return err(`Comodato ${id} no encontrado`, 404)
  c.estado = 'devuelto'
  c.fecha_devolucion = new Date().toISOString().slice(0, 10)
  if (c.activo_id) {
    const a = _activos.find((x) => x.id === c.activo_id)
    if (a) a.estado_uso = 'disponible'
    _log(c.activo_id, 'devolucion', `Comodato devuelto (${id})`)
  }
  return ok(c)
}
export async function renovarComodato(comodatoId, nuevasFechas) { const c = _comodatos.find((x) => x.id === comodatoId); if (c) Object.assign(c, nuevasFechas); return ok(c || null) }
export async function intercambiarInstrumentos(origenId, destinoId, _alumnoId) { return ok({ origenId, destinoId, ok: true }) }
export async function subirContratoComodato(comodatoId, _file) { const c = _comodatos.find((x) => x.id === comodatoId); if (c) c.contrato_url = 'mock://contrato/' + comodatoId; return ok(c?.contrato_url || null) }
export async function generarContratoPDF(comodatoId) { return ok({ url: 'mock://pdf/comodato/' + comodatoId }) }

// ── Reportes / KPI ──────────────────────────────────────────────────────────
export async function obtenerKPI() { return ok(_kpi()) }
export async function generarReporte(tipo, _filtros = {}) {
  return ok({ tipo, generado_en: new Date().toISOString(), filas: _activos.filter((a) => a.activo).length })
}
