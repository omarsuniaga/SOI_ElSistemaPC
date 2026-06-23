/**
 * cajaMock.js — In-memory mock data and implementations for all Caja API operations.
 * VITE_USE_MOCK=true uses this instead of cajaSupabase.js.
 * All operations return Promises to mirror the real adapter.
 */

// ---------------------------------------------------------------------------
// Mock data fixtures
// ---------------------------------------------------------------------------

const familias = [
  { id: 'fam-001', nombre_familia: 'Familia García Pérez', activa: true, fecha_ingreso: '2023-09-01', rep_nombre: 'María García', telefono_whatsapp: '+58 412 555 0001', score: 88, nivel: 'B', cuotas_pendientes: 2, saldo_pendiente: 300, saldo_wallet: 50, alumnos_count: 2 },
  { id: 'fam-002', nombre_familia: 'Familia López Torres', activa: true, fecha_ingreso: '2024-01-15', rep_nombre: 'Carlos López', telefono_whatsapp: '+58 414 555 0002', score: 55, nivel: 'C', cuotas_pendientes: 4, saldo_pendiente: 600, saldo_wallet: 0, alumnos_count: 1 },
  { id: 'fam-003', nombre_familia: 'Familia Rodríguez Vega', activa: true, fecha_ingreso: '2022-03-10', rep_nombre: 'Ana Rodríguez', telefono_whatsapp: '+58 416 555 0003', score: 95, nivel: 'A', cuotas_pendientes: 0, saldo_pendiente: 0, saldo_wallet: 200, alumnos_count: 1 },
  { id: 'fam-004', nombre_familia: 'Familia Martínez Díaz', activa: true, fecha_ingreso: '2023-04-20', rep_nombre: 'Pedro Martínez', telefono_whatsapp: '+58 424 555 0004', score: 28, nivel: 'E', cuotas_pendientes: 6, saldo_pendiente: 900, saldo_wallet: 0, alumnos_count: 2 },
]

const representantes = {
  'fam-001': { id: 'rep-001', familia_id: 'fam-001', nombre: 'María García', cedula: 'V-12345678', telefono_whatsapp: '+58 412 555 0001', email: 'maria.garcia@email.com', relacion: 'madre', es_pagador: true, autoriza_accesorios_hasta: 500, activo: true },
  'fam-002': { id: 'rep-002', familia_id: 'fam-002', nombre: 'Carlos López', cedula: 'V-23456789', telefono_whatsapp: '+58 414 555 0002', email: 'carlos.lopez@email.com', relacion: 'padre', es_pagador: true, autoriza_accesorios_hasta: 0, activo: true },
  'fam-003': { id: 'rep-003', familia_id: 'fam-003', nombre: 'Ana Rodríguez', cedula: 'V-34567890', telefono_whatsapp: '+58 416 555 0003', email: 'ana.rodriguez@email.com', relacion: 'madre', es_pagador: true, autoriza_accesorios_hasta: 1000, activo: true },
  'fam-004': { id: 'rep-004', familia_id: 'fam-004', nombre: 'Pedro Martínez', cedula: 'V-45678901', telefono_whatsapp: '+58 424 555 0004', email: 'pedro.martinez@email.com', relacion: 'padre', es_pagador: true, autoriza_accesorios_hasta: 0, activo: true },
}

let cuotas = [
  { id: 'cuota-001', familia_id: 'fam-001', alumno_id: 'alum-001', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'pendiente', fecha_vencimiento: '2026-06-05', ciclo_mes: 6, ciclo_anio: 2026 },
  { id: 'cuota-002', familia_id: 'fam-001', alumno_id: 'alum-001', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'vencida', fecha_vencimiento: '2026-05-05', ciclo_mes: 5, ciclo_anio: 2026 },
  { id: 'cuota-003', familia_id: 'fam-002', alumno_id: 'alum-002', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'en_mora', fecha_vencimiento: '2026-04-05', ciclo_mes: 4, ciclo_anio: 2026 },
  { id: 'cuota-004', familia_id: 'fam-002', alumno_id: 'alum-002', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'en_mora', fecha_vencimiento: '2026-03-05', ciclo_mes: 3, ciclo_anio: 2026 },
  { id: 'cuota-005', familia_id: 'fam-002', alumno_id: 'alum-002', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'pendiente', ciclo_mes: 6, ciclo_anio: 2026, fecha_vencimiento: '2026-06-05' },
  { id: 'cuota-006', familia_id: 'fam-002', alumno_id: 'alum-003', concepto: 'instrumento', monto_base: 150, monto_final: 150, estado: 'pendiente', ciclo_mes: 6, ciclo_anio: 2026, fecha_vencimiento: '2026-06-05' },
  { id: 'cuota-007', familia_id: 'fam-003', alumno_id: 'alum-004', concepto: 'mensualidad', monto_base: 150, monto_final: 120, estado: 'pagada', fecha_vencimiento: '2026-06-05', ciclo_mes: 6, ciclo_anio: 2026 },
  { id: 'cuota-008', familia_id: 'fam-003', alumno_id: 'alum-004', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'becada', fecha_vencimiento: '2026-05-05', ciclo_mes: 5, ciclo_anio: 2026 },
  { id: 'cuota-009', familia_id: 'fam-004', alumno_id: 'alum-005', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'en_mora', fecha_vencimiento: '2026-01-05', ciclo_mes: 1, ciclo_anio: 2026 },
  { id: 'cuota-010', familia_id: 'fam-004', alumno_id: 'alum-005', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'en_mora', fecha_vencimiento: '2026-02-05', ciclo_mes: 2, ciclo_anio: 2026 },
  { id: 'cuota-011', familia_id: 'fam-004', alumno_id: 'alum-005', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'en_mora', fecha_vencimiento: '2026-03-05', ciclo_mes: 3, ciclo_anio: 2026 },
  { id: 'cuota-012', familia_id: 'fam-004', alumno_id: 'alum-005', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'vencida', fecha_vencimiento: '2026-04-05', ciclo_mes: 4, ciclo_anio: 2026 },
  { id: 'cuota-013', familia_id: 'fam-004', alumno_id: 'alum-005', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'pendiente', fecha_vencimiento: '2026-05-05', ciclo_mes: 5, ciclo_anio: 2026 },
  { id: 'cuota-014', familia_id: 'fam-004', alumno_id: 'alum-005', concepto: 'mensualidad', monto_base: 150, monto_final: 150, estado: 'pendiente', fecha_vencimiento: '2026-06-05', ciclo_mes: 6, ciclo_anio: 2026 },
]

let pagos = [
  { id: 'pago-001', familia_id: 'fam-003', cuota_ids: ['cuota-007'], monto: 120, metodo_pago: 'transferencia', cajero_id: 'user-cajero-001', notas: '', created_at: '2026-06-03T10:00:00Z', referencia: 'TRF-20260603-001' },
]

let walletMovimientos = {
  'fam-001': [
    { id: 'wm-001', familia_id: 'fam-001', tipo: 'credito', monto: 50, origen: 'pago', referencia_id: null, descripcion: 'Saldo favor pago anterior', saldo_resultante: 50, created_at: '2026-06-01T09:00:00Z' },
  ],
  'fam-002': [],
  'fam-003': [
    { id: 'wm-002', familia_id: 'fam-003', tipo: 'credito', monto: 300, origen: 'patrocinio', referencia_id: null, descripcion: 'Patrocinio Fundación ABC', saldo_resultante: 300, created_at: '2026-05-01T08:00:00Z' },
    { id: 'wm-003', familia_id: 'fam-003', tipo: 'debito', monto: 100, origen: 'accesorio', referencia_id: 'asig-001', descripcion: 'Cargo flauta traversa', saldo_resultante: 200, created_at: '2026-05-15T11:00:00Z' },
  ],
  'fam-004': [],
}

const walletConfigs = {
  'fam-001': { id: 'wc-001', familia_id: 'fam-001', modo: 'mixto', saldo_minimo_alerta: 20, activo: true },
  'fam-002': { id: 'wc-002', familia_id: 'fam-002', modo: 'solo_cuotas', saldo_minimo_alerta: 0, activo: true },
  'fam-003': { id: 'wc-003', familia_id: 'fam-003', modo: 'mixto', saldo_minimo_alerta: 50, activo: true },
  'fam-004': { id: 'wc-004', familia_id: 'fam-004', modo: 'solo_cuotas', saldo_minimo_alerta: 0, activo: true },
}

let accesorios = [
  { id: 'acc-001', nombre: 'Flauta traversa', categoria: 'instrumento', descripcion: 'Flauta traversa plateada para principiantes', stock_actual: 2, stock_minimo: 3, precio_unitario: 250, activo: true, links_externos: [{ nombre: 'Proveedor Musical', url: 'https://proveedormusical.com/flauta', proveedor: 'Musical Store' }] },
  { id: 'acc-002', nombre: 'Cuaderno pentagramado', categoria: 'material', descripcion: 'Cuaderno con pautas musicales', stock_actual: 20, stock_minimo: 10, precio_unitario: 5, activo: true, links_externos: [] },
  { id: 'acc-003', nombre: 'Clarinete', categoria: 'instrumento', descripcion: 'Clarinete en Sib para nivel intermedio', stock_actual: 5, stock_minimo: 2, precio_unitario: 800, activo: true, links_externos: [{ nombre: 'Música Total', url: 'https://musicatotal.com/clarinete', proveedor: 'Música Total' }] },
  { id: 'acc-004', nombre: 'Uniforme de gala', categoria: 'uniforme', descripcion: 'Uniforme para conciertos', stock_actual: 8, stock_minimo: 5, precio_unitario: 120, activo: true, links_externos: [] },
]

let accesorio_asignaciones = [
  { id: 'asig-001', accesorio_id: 'acc-001', alumno_id: 'alum-004', familia_id: 'fam-003', cantidad: 1, precio_unitario: 250, monto_total: 250, estado: 'cobrado', aprobacion_requerida: false, created_at: '2026-05-15T11:00:00Z' },
]

let notificaciones = [
  { id: 'notif-001', familia_id: 'fam-004', representante_id: 'rep-004', tipo: 'mora_escalada', canal: 'ambos', prioridad: 'critica', titulo: 'Cuenta en mora crítica', cuerpo: 'Su cuenta tiene 3 cuotas en mora por más de 45 días.', datos_extra: {}, estado_whatsapp: 'enviada', estado_portal: 'no_leida', respuesta_padre: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'notif-002', familia_id: 'fam-002', representante_id: 'rep-002', tipo: 'mora_recordatorio', canal: 'portal', prioridad: 'alta', titulo: 'Recordatorio de pago', cuerpo: 'Tiene cuotas pendientes por pagar.', datos_extra: {}, estado_whatsapp: 'pendiente', estado_portal: 'no_leida', respuesta_padre: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'notif-003', familia_id: null, representante_id: null, tipo: 'stock_bajo', canal: 'portal', prioridad: 'alta', titulo: 'Stock bajo: Flauta traversa', cuerpo: 'El stock de Flauta traversa está por debajo del mínimo (2/3).', datos_extra: { accesorio_id: 'acc-001' }, estado_whatsapp: 'pendiente', estado_portal: 'no_leida', respuesta_padre: null, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'notif-004', familia_id: 'fam-001', representante_id: 'rep-001', tipo: 'mora_compromiso', canal: 'whatsapp', prioridad: 'normal', titulo: 'Compromiso de pago confirmado', cuerpo: 'Recordatorio: su compromiso de pago vence mañana.', datos_extra: {}, estado_whatsapp: 'leida', estado_portal: 'leida', respuesta_padre: 'Sí, pagaré mañana sin falta.', created_at: new Date(Date.now() - 172800000).toISOString() },
]

let tareas = [
  { id: 'tarea-001', titulo: 'Llamar a familia Martínez', descripcion: 'Gestionar plan de pago para 3 cuotas en mora', tipo: 'seguimiento_pago', asignado_a: 'user-cajero-001', familia_id: 'fam-004', alumno_id: null, estado: 'pendiente', prioridad: 'urgente', fecha_vencimiento: new Date(Date.now() + 86400000).toISOString().slice(0,10), recurrente: false, patron_recurrencia: null, created_at: new Date().toISOString() },
  { id: 'tarea-002', titulo: 'Revisar flauta de Rodríguez', descripcion: 'Inspeccionar estado del instrumento en comodato', tipo: 'revision_instrumento', asignado_a: 'user-cajero-001', familia_id: 'fam-003', alumno_id: 'alum-004', estado: 'en_progreso', prioridad: 'normal', fecha_vencimiento: '2026-06-30', recurrente: false, patron_recurrencia: null, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'tarea-003', titulo: 'Reposición de flautas', descripcion: 'Gestionar compra de flautas (stock bajo)', tipo: 'reposicion_stock', asignado_a: null, familia_id: null, alumno_id: null, estado: 'pendiente', prioridad: 'alta', fecha_vencimiento: '2026-07-05', recurrente: false, patron_recurrencia: null, created_at: new Date().toISOString() },
  { id: 'tarea-004', titulo: 'Cierre de mes', descripcion: 'Preparar reporte mensual de ingresos', tipo: 'otro', asignado_a: 'user-cajero-001', familia_id: null, alumno_id: null, estado: 'pendiente', prioridad: 'alta', fecha_vencimiento: '2026-06-30', recurrente: true, patron_recurrencia: { tipo: 'mensual' }, created_at: new Date().toISOString() },
]

let minutas = [
  { id: 'minuta-001', titulo: 'Reunión de coordinación caja - junio 2026', fecha_reunion: '2026-06-15', participantes: [{ nombre: 'Katherine Pérez', rol: 'cajero' }, { nombre: 'Director', rol: 'admin' }], puntos_tratados: [{ orden: 1, titulo: 'Revisión de mora activa', descripcion: 'Se analizaron 15 familias en mora.' }], acuerdos: [{ acuerdo: 'Iniciar plan de llamadas para familia Martínez', responsable: 'Katherine', fecha_limite: '2026-06-25' }], responsables: [{ nombre: 'Katherine Pérez', cargo: 'Cajera' }], fecha_proxima_reunion: '2026-07-15', visibilidad: 'cajero', creado_por: 'user-cajero-001', archivo_adjunto_url: null, created_at: '2026-06-15T14:00:00Z' },
]

let hilos = [
  { id: 'hilo-001', titulo: 'Plan de recuperación de mora Q2', tema: 'mora', departamentos_involucrados: ['caja', 'admin'], creado_por: 'user-cajero-001', resuelto: false, created_at: new Date(Date.now() - 86400000).toISOString() },
]

let mensajes = {
  'hilo-001': [
    { id: 'msg-001', hilo_id: 'hilo-001', autor_id: 'user-cajero-001', rol_autor: 'cajero', contenido: 'Propongo iniciar con llamadas esta semana a las familias con mora mayor a 45 días.', tipo: 'general', departamento_destino: ['caja', 'admin'], leido_por: {}, resuelto: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
}

const campanas = [
  { id: 'camp-001', nombre: 'Campaña Puntualidad Junio', descripcion: 'Familias que paguen antes del 5 reciben descuento del 5% el mes siguiente', incentivo: '5% descuento próximo mes', fecha_inicio: '2026-06-01', fecha_fin: '2026-06-30', creado_por: 'user-admin-001', activa: true },
]

let cierresCaja = []
let pushSubs = []
const campanaParticipaciones = {}
let _nextId = 1000
function genId(prefix = 'rec') { return `${prefix}-${Date.now()}-${_nextId++}` }
function delay(ms = 80) { return new Promise(resolve => setTimeout(resolve, ms)) }

// ---------------------------------------------------------------------------
// API implementations
// ---------------------------------------------------------------------------

export async function getFamilias() {
  await delay()
  return { data: familias, error: null }
}

export async function getFamiliaById(id) {
  await delay()
  const familia = familias.find(f => f.id === id)
  if (!familia) return { data: null, error: { message: 'Familia no encontrada' } }
  const rep = representantes[id] || null
  const famCuotas = cuotas.filter(c => c.familia_id === id).sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
  const famPagos = pagos.filter(p => p.familia_id === id)
  const movs = walletMovimientos[id] || []
  const config = walletConfigs[id] || null
  const saldo = movs.length > 0 ? movs[movs.length - 1].saldo_resultante : 0
  return { data: { ...familia, representante: rep, cuotas: famCuotas, pagos: famPagos, wallet: { movimientos: movs, config, saldo } }, error: null }
}

export async function getRepresentanteByFamiliaId(familia_id) {
  await delay()
  return { data: representantes[familia_id] || null, error: null }
}

export async function getCuotasByFamilia(familia_id) {
  await delay()
  const result = cuotas.filter(c => c.familia_id === familia_id).sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
  return { data: result, error: null }
}

export async function getPagosByFamilia(familia_id) {
  await delay()
  return { data: pagos.filter(p => p.familia_id === familia_id), error: null }
}

export async function registrarPago(pagoData, cuotaIds) {
  await delay()
  const newPago = { id: genId('pago'), ...pagoData, cuota_ids: cuotaIds, created_at: new Date().toISOString() }
  pagos.push(newPago)
  for (const cuotaId of cuotaIds) {
    const cuota = cuotas.find(c => c.id === cuotaId)
    if (cuota && ['pendiente', 'vencida', 'en_mora'].includes(cuota.estado)) cuota.estado = 'pagada'
  }
  if (pagoData.montoSobrante > 0) {
    const movs = walletMovimientos[pagoData.familia_id] || []
    const saldoAnterior = movs.length > 0 ? movs[movs.length - 1].saldo_resultante : 0
    const newMov = { id: genId('wm'), familia_id: pagoData.familia_id, tipo: 'credito', monto: pagoData.montoSobrante, origen: 'pago', referencia_id: newPago.id, descripcion: 'Saldo a favor del pago', saldo_resultante: saldoAnterior + pagoData.montoSobrante, created_at: new Date().toISOString() }
    if (!walletMovimientos[pagoData.familia_id]) walletMovimientos[pagoData.familia_id] = []
    walletMovimientos[pagoData.familia_id].push(newMov)
    const f = familias.find(fa => fa.id === pagoData.familia_id)
    if (f) f.saldo_wallet = newMov.saldo_resultante
  }
  return { data: newPago, error: null }
}

export async function getWalletByFamilia(familia_id) {
  await delay()
  const movs = walletMovimientos[familia_id] || []
  const config = walletConfigs[familia_id] || { modo: 'mixto', saldo_minimo_alerta: 0, activo: true }
  const saldo = movs.length > 0 ? movs[movs.length - 1].saldo_resultante : 0
  return { data: { movimientos: movs, config, saldo }, error: null }
}

export async function registrarMovimientoWallet(movData) {
  await delay()
  const newMov = { id: genId('wm'), ...movData, created_at: new Date().toISOString() }
  if (!walletMovimientos[movData.familia_id]) walletMovimientos[movData.familia_id] = []
  walletMovimientos[movData.familia_id].push(newMov)
  const f = familias.find(fa => fa.id === movData.familia_id)
  if (f) f.saldo_wallet = newMov.saldo_resultante
  return { data: newMov, error: null }
}

export async function getAccesorios() {
  await delay()
  return { data: accesorios.filter(a => a.activo), error: null }
}

export async function getAccesorioById(id) {
  await delay()
  return { data: accesorios.find(a => a.id === id) || null, error: null }
}

export async function asignarAccesorio(asignacionData) {
  await delay()
  const newAsig = { id: genId('asig'), ...asignacionData, estado: 'pendiente', created_at: new Date().toISOString() }
  accesorio_asignaciones.push(newAsig)
  const acc = accesorios.find(a => a.id === asignacionData.accesorio_id)
  if (acc) acc.stock_actual = Math.max(0, acc.stock_actual - (asignacionData.cantidad || 1))
  if (asignacionData.aprobacion_requerida) {
    notificaciones.push({ id: genId('notif'), familia_id: asignacionData.familia_id, representante_id: null, tipo: 'accesorio_aprobacion', canal: 'portal', prioridad: 'normal', titulo: 'Solicitud de accesorio pendiente de aprobación', cuerpo: 'Se requiere su aprobación para asignar el accesorio.', datos_extra: { asignacion_id: newAsig.id }, estado_whatsapp: 'pendiente', estado_portal: 'no_leida', respuesta_padre: null, created_at: new Date().toISOString() })
  }
  return { data: newAsig, error: null }
}

export async function updateStockAccesorio(accesorio_id, stock_actual) {
  await delay()
  const acc = accesorios.find(a => a.id === accesorio_id)
  if (!acc) return { data: null, error: { message: 'Accesorio no encontrado' } }
  acc.stock_actual = stock_actual
  return { data: acc, error: null }
}

export async function getNotificaciones(options = {}) {
  await delay()
  let result = [...notificaciones]
  if (options.familia_id) result = result.filter(n => n.familia_id === options.familia_id)
  if (options.tipo) result = result.filter(n => n.tipo === options.tipo)
  if (options.prioridad) result = result.filter(n => n.prioridad === options.prioridad)
  return { data: result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), error: null }
}

export async function marcarNotificacionLeida(id) {
  await delay()
  const notif = notificaciones.find(n => n.id === id)
  if (!notif) return { data: null, error: { message: 'Notificación no encontrada' } }
  notif.estado_portal = 'leida'
  return { data: notif, error: null }
}

export async function getTareas(cajero_id) {
  await delay()
  return { data: tareas.filter(t => t.asignado_a === cajero_id || t.asignado_a === null), error: null }
}

export async function createTarea(tareaData) {
  await delay()
  const newTarea = { id: genId('tarea'), ...tareaData, estado: 'pendiente', created_at: new Date().toISOString() }
  tareas.push(newTarea)
  return { data: newTarea, error: null }
}

export async function updateTareaEstado(id, newEstado) {
  await delay()
  const tarea = tareas.find(t => t.id === id)
  if (!tarea) return { data: null, error: { message: 'Tarea no encontrada' } }
  tarea.estado = newEstado
  return { data: tarea, error: null }
}

export async function getMinutas() {
  await delay()
  return { data: minutas, error: null }
}

export async function createMinuta(minutaData) {
  await delay()
  const newMinuta = { id: genId('minuta'), ...minutaData, created_at: new Date().toISOString() }
  minutas.push(newMinuta)
  return { data: newMinuta, error: null }
}

export async function getHilos() {
  await delay()
  return { data: hilos, error: null }
}

export async function getMensajesByHilo(hilo_id) {
  await delay()
  return { data: mensajes[hilo_id] || [], error: null }
}

export async function sendMensaje(mensajeData) {
  await delay()
  const newMsg = { id: genId('msg'), ...mensajeData, leido_por: {}, created_at: new Date().toISOString() }
  if (!mensajes[mensajeData.hilo_id]) mensajes[mensajeData.hilo_id] = []
  mensajes[mensajeData.hilo_id].push(newMsg)
  return { data: newMsg, error: null }
}


export async function createHilo(hiloData) {
  await delay()
  const newHilo = { id: genId('hilo'), ...hiloData, resuelto: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  hilos.push(newHilo)
  return { data: newHilo, error: null }
}
export async function getCampanas() {
  await delay()
  return { data: campanas, error: null }
}

export async function getScoreByRepresentante(representante_id) {
  await delay()
  const rep = Object.values(representantes).find(r => r.id === representante_id)
  if (!rep) return { data: null, error: null }
  const familia = familias.find(f => f.id === rep.familia_id)
  return { data: { representante_id, familia_id: rep.familia_id, score: familia?.score ?? 50, nivel: familia?.nivel ?? 'C', calculado_en: new Date().toISOString() }, error: null }
}

export async function getCierreCajaHoy() {
  await delay()
  const hoy = new Date().toISOString().slice(0, 10)
  const pagosHoy = pagos.filter(p => p.created_at?.slice(0, 10) === hoy)
  const porMetodo = {}
  let totalGeneral = 0
  for (const p of pagosHoy) {
    totalGeneral += p.monto
    if (!porMetodo[p.metodo_pago]) porMetodo[p.metodo_pago] = { count: 0, total: 0 }
    porMetodo[p.metodo_pago].count++
    porMetodo[p.metodo_pago].total += p.monto
  }
  return { data: { fecha: hoy, totalGeneral, porMetodo, cantidadTransacciones: pagosHoy.length, cajero_nombre: 'Katherine Pérez', cerrado: cierresCaja.some(c => c.fecha === hoy) }, error: null }
}

export async function registrarCierreCaja(cierreData) {
  await delay()
  const fecha = cierreData.fecha ?? new Date().toISOString().slice(0, 10)
  if (cierresCaja.some(c => c.fecha === fecha)) {
    return { data: null, error: { message: `Ya existe un cierre de caja para la fecha ${fecha}`, code: '23505' } }
  }
  const newCierre = { id: genId('cierre'), ...cierreData, fecha, created_at: new Date().toISOString() }
  cierresCaja.push(newCierre)
  return { data: newCierre, error: null }
}

export async function getCierresByFecha(fecha) {
  await delay()
  return { data: cierresCaja.find(c => c.fecha === fecha) || null, error: null }
}

// ---------------------------------------------------------------------------
// Push subscriptions
// ---------------------------------------------------------------------------

export async function savePushSubscription(subData) {
  await delay()
  const idx = pushSubs.findIndex(s => s.endpoint === subData.endpoint)
  if (idx >= 0) pushSubs[idx] = { ...pushSubs[idx], ...subData, activo: true }
  else pushSubs.push({ id: genId('sub'), ...subData, activo: true, created_at: new Date().toISOString() })
  return { data: pushSubs.find(s => s.endpoint === subData.endpoint), error: null }
}

export async function deletePushSubscription(endpoint) {
  await delay()
  const sub = pushSubs.find(s => s.endpoint === endpoint)
  if (sub) sub.activo = false
  return { data: sub || null, error: null }
}

// ---------------------------------------------------------------------------
// Campanas (extended)
// ---------------------------------------------------------------------------

export async function createCampana(campanaData) {
  await delay()
  const newCamp = { id: genId('camp'), ...campanaData, activa: true, created_at: new Date().toISOString() }
  campanas.push(newCamp)
  return { data: newCamp, error: null }
}

export async function getCampanaParticipaciones(campana_id) {
  await delay()
  return { data: campanaParticipaciones[campana_id] || [], error: null }
}

export async function registrarParticipacion(campana_id, familia_id) {
  await delay()
  if (!campanaParticipaciones[campana_id]) campanaParticipaciones[campana_id] = []
  const existing = campanaParticipaciones[campana_id].find(p => p.familia_id === familia_id)
  if (existing) {
    existing.aceptada = true
    existing.fecha_aceptacion = new Date().toISOString()
    return { data: existing, error: null }
  }
  const p = {
    id: genId('part'),
    campana_id,
    familia_id,
    aceptada: true,
    fecha_aceptacion: new Date().toISOString(),
    monto_recuperado: 0,
    familias: { nombre_familia: familias.find(f => f.id === familia_id)?.nombre_familia || familia_id },
  }
  campanaParticipaciones[campana_id].push(p)
  return { data: p, error: null }
}

/**
 * Subscribe to realtime notifications — mock no-op.
 * @param {Function} _callback
 * @returns {Function} unsubscribe
 */
export function subscribeNotificaciones(_callback) {
  return () => {}
}

export async function updateWalletStatus(familia_id, status, timestamp = new Date().toISOString()) {
  await delay()
  const config = Object.values(walletConfigs).find(c => c.familia_id === familia_id)
  if (!config) return { data: null, error: { message: 'wallet_config no encontrada' } }
  config.status = status
  if (status === 'congelada') config.congelada_en = timestamp
  if (status === 'devuelta') config.devuelta_en = timestamp
  return { data: config, error: null }
}
