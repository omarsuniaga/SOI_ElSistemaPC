import { validarActivo, puedeTransitarA, TRANSICIONES_ESTADO, ESTADOS_ACTIVO } from '../domain/activo.js'
import { validarAccesorio, TIPOS_ACCESORIO } from '../domain/accesorio.js'
import { crearEvento, TIPOS_EVENTO } from '../domain/historial.js'
import { validarReparacion, puedeTransitarReparacion, TRANSICIONES_REPARACION } from '../domain/reparacion.js'
import { validarFactura, puedeAnularse, liquidarFactura, ESTADOS_FACTURA } from '../domain/facturacion.js'
import { puedeIntercambiarse, intercambiar, puedeRenovarse, renovar, diasHastaVencimiento } from '../domain/comodato.js'

let _idCounter = 100

function uid() { _idCounter++; return "mock-" + _idCounter + "-" + Date.now(); }

function delay() {
  const ms = 50 + Math.random() * 100
  return new Promise(r => setTimeout(r, ms))
}

function clone(o) { return JSON.parse(JSON.stringify(o)) }

function applyFilters(items, filtros) {
  if (!filtros) return items
  return items.filter(item => {
    for (const [key, val] of Object.entries(filtros)) {
      if (val === '' || val == null) continue
      if (key === 'q') {
        const search = String(val).toLowerCase()
        return Object.values(item).some(v => String(v ?? '').toLowerCase().includes(search))
      }
      if (key === 'desde' || key === 'hasta') continue
      if (String(item[key]) !== String(val)) return false
    }
    if (filtros.desde && item.fecha && item.fecha < filtros.desde) return false
    if (filtros.hasta && item.fecha && item.fecha > filtros.hasta) return false
    return true
  })
}

function paginate(items, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize
  return { data: items.slice(start, start + pageSize), total: items.length, page, pageSize }
}

function notFound(entity) {
  return { data: null, error: { code: 404, message: `${entity} no encontrado` } }
}

const hoy = () => new Date().toISOString().split('T')[0]

// ─── Factory Functions ───────────────────────────────────────────────

function factoryActivo(overrides = {}) {
  return {
    id: uid('act'),
    codigo_inventario: 'V8-VIO-001',
    tipo_instrumento: 'Violín',
    marca: 'Marca Test',
    modelo: 'Modelo X',
    numero_serie: 'SN-001',
    ubicacion: 'Aula 1',
    estado_conservacion: 'bueno',
    estado_uso: 'disponible',
    activo: true,
    fecha_adquisicion: '2020-01-15',
    valor_adquisicion: 15000,
    proveedor: 'Proveedor Test',
    foto_url: null,
    fecha_baja: null,
    motivo_baja: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function factoryAccesorio(overrides = {}) {
  return {
    id: uid('acc'),
    activo_id: null,
    tipo: 'funda',
    marca: 'Marca Acc',
    cantidad: 1,
    estado: 'nuevo',
    observaciones: '',
    fecha_asignacion: null,
    ...overrides,
  }
}

function factoryHistorialEvento(overrides = {}) {
  return {
    id: uid('hst'),
    activo_id: null,
    tipo_evento: 'observacion',
    descripcion: 'Evento generado',
    fecha: new Date().toISOString(),
    usuario_id: null,
    metadata: null,
    ...overrides,
  }
}

function factoryReparacion(overrides = {}) {
  return {
    id: uid('rep'),
    activo_id: null,
    tipo_tallerista: 'externo',
    tallerista_nombre: 'Tallerista Test',
    descripcion: 'Reparación de rutina',
    costo_estimado: 1000,
    costo_real: null,
    fecha_ingreso: hoy(),
    fecha_egreso: null,
    estado: 'recibido',
    proveedor_factura_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

function factoryFactura(overrides = {}) {
  return {
    id: uid('fac'),
    reparacion_id: null,
    monto_total: 1000,
    impuestos: 180,
    metodo_pago: 'efectivo',
    responsable_id: null,
    tipo_factura: 'alumno',
    fecha_emision: hoy(),
    pdf_generado_url: null,
    estado_pago: 'pendiente',
    fecha_pago: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

function factoryComodato(overrides = {}) {
  return {
    id: uid('com'),
    activo_id: null,
    alumno_id: null,
    alumno_nombre: 'Alumno Test',
    fecha_entrega: '2025-01-15',
    fecha_devolucion: null,
    fecha_vencimiento: null,
    estado: 'activo',
    tipo_comodato: 'escolar',
    instrumento_propio_id: null,
    renovado_de_id: null,
    intercambiado_con_id: null,
    contrato_firmado_url: null,
    ...overrides,
  }
}

function factoryAlumno(overrides = {}) {
  return {
    id: uid('alu'),
    nombre_completo: 'Alumno Test',
    email: 'alumno@test.com',
    telefono: '809-000-0000',
    ...overrides,
  }
}

// ─── In-Memory Store ─────────────────────────────────────────────────

function buildInitialData() {
  const e1 = factoryActivo({ id: 'act-001', codigo_inventario: 'V8-VIO-001', tipo_instrumento: 'Violín', marca: 'Stradivarius', modelo: 'Model 1', estado_uso: 'disponible', estado_conservacion: 'bueno', fecha_adquisicion: '2020-01-15', valor_adquisicion: 15000 })
  const e2 = factoryActivo({ id: 'act-002', codigo_inventario: 'V8-VIO-002', tipo_instrumento: 'Violín', marca: 'Yamaha', modelo: 'V5', estado_uso: 'prestado', estado_conservacion: 'bueno', fecha_adquisicion: '2021-06-01', valor_adquisicion: 12000 })
  const e3 = factoryActivo({ id: 'act-003', codigo_inventario: 'V8-CEL-001', tipo_instrumento: 'Cello', marca: 'Eastman', modelo: 'VC100', estado_uso: 'disponible', estado_conservacion: 'excelente', fecha_adquisicion: '2022-03-10', valor_adquisicion: 45000 })
  const e4 = factoryActivo({ id: 'act-004', codigo_inventario: 'V8-GUI-001', tipo_instrumento: 'Guitarra', marca: 'Alhambra', modelo: '4P', estado_uso: 'en_reparacion', estado_conservacion: 'regular', fecha_adquisicion: '2019-11-20', valor_adquisicion: 8000 })
  const e5 = factoryActivo({ id: 'act-005', codigo_inventario: 'V8-FLA-001', tipo_instrumento: 'Flauta', marca: 'Yamaha', modelo: 'YFL-222', estado_uso: 'de_baja', estado_conservacion: 'de_baja', activo: false, fecha_adquisicion: '2015-05-05', valor_adquisicion: 5000, fecha_baja: '2024-12-01', motivo_baja: 'Daño irreversible' })
  const e6 = factoryActivo({ id: 'act-006', codigo_inventario: 'V8-TRO-001', tipo_instrumento: 'Trompeta', marca: 'Bach', modelo: 'TR200', estado_uso: 'disponible', estado_conservacion: 'bueno', fecha_adquisicion: '2023-01-10', valor_adquisicion: 22000 })
  const e7 = factoryActivo({ id: 'act-007', codigo_inventario: 'V8-PER-001', tipo_instrumento: 'Percusión', marca: 'Pearl', modelo: 'Export', estado_uso: 'en_mantenimiento', estado_conservacion: 'mantenimiento', fecha_adquisicion: '2018-08-15', valor_adquisicion: 35000 })
  const e8 = factoryActivo({ id: 'act-008', codigo_inventario: 'V8-PIA-001', tipo_instrumento: 'Piano', marca: 'Kawai', modelo: 'K-300', estado_uso: 'disponible', estado_conservacion: 'bueno', fecha_adquisicion: '2024-02-20', valor_adquisicion: 180000 })

  const a1 = factoryAlumno({ id: 'alu-001', nombre_completo: 'Juan Pérez', email: 'juan@test.com' })
  const a2 = factoryAlumno({ id: 'alu-002', nombre_completo: 'María García', email: 'maria@test.com' })
  const a3 = factoryAlumno({ id: 'alu-003', nombre_completo: 'Carlos López', email: 'carlos@test.com' })

  const futuro = new Date(); futuro.setDate(futuro.getDate() + 45)
  const futuroStr = futuro.toISOString().split('T')[0]
  const proximo = new Date(); proximo.setDate(proximo.getDate() + 5)
  const proximoStr = proximo.toISOString().split('T')[0]
  const vencido = new Date(); vencido.setDate(vencido.getDate() - 2)
  const vencidoStr = vencido.toISOString().split('T')[0]

  const c1 = factoryComodato({ id: 'com-001', activo_id: 'act-002', alumno_id: 'alu-001', alumno_nombre: 'Juan Pérez', fecha_vencimiento: futuroStr, estado: 'activo', tipo_comodato: 'escolar' })
  const c2 = factoryComodato({ id: 'com-002', activo_id: 'act-003', alumno_id: 'alu-002', alumno_nombre: 'María García', fecha_entrega: '2024-08-15', fecha_devolucion: '2024-12-15', estado: 'devuelto', tipo_comodato: 'escolar' })
  const c3 = factoryComodato({ id: 'com-003', activo_id: 'act-001', alumno_id: 'alu-003', alumno_nombre: 'Carlos López', fecha_vencimiento: proximoStr, estado: 'activo', tipo_comodato: 'eventual' })
  const c4 = factoryComodato({ id: 'com-004', activo_id: 'act-006', alumno_id: 'alu-001', alumno_nombre: 'Juan Pérez', fecha_vencimiento: vencidoStr, estado: 'activo', tipo_comodato: 'anual' })

  const acc1 = factoryAccesorio({ id: 'acc-001', activo_id: 'act-001', tipo: 'funda', marca: 'Gewa', cantidad: 1, estado: 'nuevo', fecha_asignacion: '2024-01-15' })
  const acc2 = factoryAccesorio({ id: 'acc-002', activo_id: 'act-001', tipo: 'arco', marca: 'Brasil', cantidad: 2, estado: 'bueno', fecha_asignacion: '2024-01-15' })
  const acc3 = factoryAccesorio({ id: 'acc-003', activo_id: 'act-004', tipo: 'cuerdas', marca: 'D\'Addario', cantidad: 5, estado: 'bueno', fecha_asignacion: '2024-03-10' })
  const acc4 = factoryAccesorio({ id: 'acc-004', activo_id: null, tipo: 'atril', marca: 'Manhasset', cantidad: 3, estado: 'nuevo' })
  const acc5 = factoryAccesorio({ id: 'acc-005', activo_id: 'act-002', tipo: 'funda', marca: 'Gewa', cantidad: 1, estado: 'regular', fecha_asignacion: '2024-06-01' })

  const hst1 = factoryHistorialEvento({ id: 'hst-001', activo_id: 'act-001', tipo_evento: 'creacion', descripcion: 'Instrumento registrado en el sistema', fecha: '2024-01-01T10:00:00Z' })
  const hst2 = factoryHistorialEvento({ id: 'hst-002', activo_id: 'act-001', tipo_evento: 'asignacion', descripcion: 'Instrumento asignado a Carlos López', fecha: '2024-09-01T08:00:00Z', usuario_id: 'usr-admin' })
  const hst3 = factoryHistorialEvento({ id: 'hst-003', activo_id: 'act-002', tipo_evento: 'creacion', descripcion: 'Instrumento registrado en el sistema', fecha: '2024-01-10T10:00:00Z' })
  const hst4 = factoryHistorialEvento({ id: 'hst-004', activo_id: 'act-002', tipo_evento: 'asignacion', descripcion: 'Instrumento asignado a Juan Pérez', fecha: '2024-06-01T08:00:00Z', usuario_id: 'usr-admin' })
  const hst5 = factoryHistorialEvento({ id: 'hst-005', activo_id: 'act-003', tipo_evento: 'creacion', descripcion: 'Instrumento registrado en el sistema', fecha: '2024-02-01T10:00:00Z' })
  const hst6 = factoryHistorialEvento({ id: 'hst-006', activo_id: 'act-003', tipo_evento: 'asignacion', descripcion: 'Instrumento asignado a María García', fecha: '2024-08-15T08:00:00Z', usuario_id: 'usr-admin' })
  const hst7 = factoryHistorialEvento({ id: 'hst-007', activo_id: 'act-003', tipo_evento: 'devolucion', descripcion: 'Instrumento devuelto por María García', fecha: '2024-12-15T14:00:00Z', usuario_id: 'usr-admin' })
  const hst8 = factoryHistorialEvento({ id: 'hst-008', activo_id: 'act-004', tipo_evento: 'creacion', descripcion: 'Instrumento registrado en el sistema', fecha: '2024-01-05T10:00:00Z' })
  const hst9 = factoryHistorialEvento({ id: 'hst-009', activo_id: 'act-004', tipo_evento: 'reparacion', descripcion: 'Ingreso a reparación: Cambio de cuerdas y ajuste', fecha: '2024-10-01T09:00:00Z', usuario_id: 'usr-admin' })
  const hst10 = factoryHistorialEvento({ id: 'hst-010', activo_id: 'act-001', tipo_evento: 'cambio_estado', descripcion: 'Cambio de estado: disponible → prestado', fecha: '2024-09-01T08:00:00Z', usuario_id: 'usr-admin' })

  const r1 = factoryReparacion({ id: 'rep-001', activo_id: 'act-004', tipo_tallerista: 'luthier_interno', tallerista_nombre: 'Luthier Interno', descripcion: 'Cambio de cuerdas y ajuste de mástil', costo_estimado: 2500, costo_real: null, fecha_ingreso: '2024-10-01', estado: 'en_reparacion' })
  const r2 = factoryReparacion({ id: 'rep-002', activo_id: 'act-001', tipo_tallerista: 'externo', tallerista_nombre: 'Taller Pérez', descripcion: 'Reparación de fisura en tapa armónica', costo_estimado: 3500, costo_real: 3200, fecha_ingreso: '2024-08-01', fecha_egreso: '2024-08-20', estado: 'entregado' })

  const f1 = factoryFactura({ id: 'fac-001', reparacion_id: 'rep-002', monto_total: 3200, impuestos: 576, metodo_pago: 'efectivo', tipo_factura: 'alumno', estado_pago: 'pendiente', fecha_emision: '2024-08-20' })

  return {
    activos: [e1, e2, e3, e4, e5, e6, e7, e8],
    alumnos: [a1, a2, a3],
    comodatos: [c1, c2, c3, c4],
    accesorios: [acc1, acc2, acc3, acc4, acc5],
    historial: [hst1, hst2, hst3, hst4, hst5, hst6, hst7, hst8, hst9, hst10],
    reparaciones: [r1, r2],
    facturas: [f1],
  }
}

const store = buildInitialData()

// ─── Activos ─────────────────────────────────────────────────────────

export async function obtenerActivos(filtros = {}) {
  await delay()
  let items = clone(store.activos).filter(a => a.activo !== false)
  if (filtros.estado_uso) items = items.filter(a => a.estado_uso === filtros.estado_uso)
  if (filtros.tipo_instrumento) items = items.filter(a => a.tipo_instrumento === filtros.tipo_instrumento)
  if (filtros.estado_conservacion) items = items.filter(a => a.estado_conservacion === filtros.estado_conservacion)
  if (filtros.ubicacion) items = items.filter(a => a.ubicacion === filtros.ubicacion)
  if (filtros.q) {
    const q = filtros.q.toLowerCase()
    items = items.filter(a => Object.values(a).some(v => String(v ?? '').toLowerCase().includes(q)))
  }
  return paginate(items, filtros.page, filtros.pageSize)
}

export async function obtenerActivoPorId(id) {
  await delay()
  const item = store.activos.find(a => a.id === id)
  if (!item) return notFound('Activo')
  return { data: clone(item), error: null }
}

export async function crearActivo(payload) {
  await delay()
  const errores = validarActivo(payload)
  if (errores.length) return { data: null, error: { code: 400, message: errores.join('; ') } }
  const item = factoryActivo({
    id: uid('act'),
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  store.activos.push(item)
  const evt = crearEvento(item.id, 'creacion', 'Instrumento registrado', payload.usuario_id)
  store.historial.push({ ...evt, id: uid('hst') })
  return { data: clone(item), error: null }
}

export async function actualizarActivo(id, payload) {
  await delay()
  const idx = store.activos.findIndex(a => a.id === id)
  if (idx === -1) return notFound('Activo')
  const errores = validarActivo({ ...store.activos[idx], ...payload })
  if (errores.length) return { data: null, error: { code: 400, message: errores.join('; ') } }
  store.activos[idx] = { ...store.activos[idx], ...payload, updated_at: new Date().toISOString() }
  return { data: clone(store.activos[idx]), error: null }
}

export async function cambiarEstadoActivo(id, nuevoEstado) {
  await delay()
  const idx = store.activos.findIndex(a => a.id === id)
  if (idx === -1) return notFound('Activo')
  const actual = store.activos[idx].estado_uso
  if (!puedeTransitarA(actual, nuevoEstado)) {
    return { data: null, error: { code: 400, message: 'Transición inválida de ' + actual + ' a ' + nuevoEstado} }
  }
  store.activos[idx].estado_uso = nuevoEstado
  store.activos[idx].updated_at = new Date().toISOString()
  const evt = crearEvento(id, 'cambio_estado', 'Cambio de estado: ' + actual + ' → ' + nuevoEstado, null, { estado_anterior: actual, estado_nuevo: nuevoEstado })
  store.historial.push({ ...evt, id: uid('hst') })
  return { data: clone(store.activos[idx]), error: null }
}

export async function subirFotoActivo(id, _file) {
  await delay()
  const idx = store.activos.findIndex(a => a.id === id)
  if (idx === -1) return notFound('Activo')
  store.activos[idx].foto_url = 'https://storage.test/activos/' + id + '/foto.jpg'
  store.activos[idx].updated_at = new Date().toISOString()
  return { data: { foto_url: store.activos[idx].foto_url }, error: null }
}

// ─── Accesorios ──────────────────────────────────────────────────────

export async function obtenerAccesorios(activoId) {
  await delay()
  let items = clone(store.accesorios)
  if (activoId) items = items.filter(a => a.activo_id === activoId)
  return { data: items, error: null }
}

export async function crearAccesorio(payload) {
  await delay()
  const errores = validarAccesorio(payload)
  if (errores.length) return { data: null, error: { code: 400, message: errores.join('; ') } }
  const activoExiste = store.activos.some(a => a.id === payload.activo_id)
  if (!activoExiste) return { data: null, error: { code: 400, message: 'activo_id no existe' } }
  const item = factoryAccesorio({ id: uid('acc'), ...payload, fecha_asignacion: hoy() })
  store.accesorios.push(item)
  return { data: clone(item), error: null }
}

export async function actualizarAccesorio(id, payload) {
  await delay()
  const idx = store.accesorios.findIndex(a => a.id === id)
  if (idx === -1) return notFound('Accesorio')
  store.accesorios[idx] = { ...store.accesorios[idx], ...payload }
  return { data: clone(store.accesorios[idx]), error: null }
}

export async function eliminarAccesorio(id) {
  await delay()
  const idx = store.accesorios.findIndex(a => a.id === id)
  if (idx === -1) return notFound('Accesorio')
  const [removed] = store.accesorios.splice(idx, 1)
  return { data: clone(removed), error: null }
}

// ─── Historial ───────────────────────────────────────────────────────

export async function obtenerHistorialActivo(activoId, filtros = {}) {
  await delay()
  let items = clone(store.historial).filter(e => e.activo_id === activoId)
  if (filtros.tipo_evento) items = items.filter(e => e.tipo_evento === filtros.tipo_evento)
  items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return { data: items, error: null }
}

export async function crearEventoManual(payload) {
  await delay()
  try {
    const evt = crearEvento(payload.activo_id, payload.tipo_evento, payload.descripcion, payload.usuario_id, payload.metadata)
    const item = { ...evt, id: uid('hst') }
    store.historial.push(item)
    return { data: clone(item), error: null }
  } catch (e) {
    return { data: null, error: { code: 400, message: e.message } }
  }
}

// ─── Reparaciones ────────────────────────────────────────────────────

export async function obtenerReparaciones(filtros = {}) {
  await delay()
  let items = clone(store.reparaciones)
  if (filtros.estado) items = items.filter(r => r.estado === filtros.estado)
  if (filtros.activo_id) items = items.filter(r => r.activo_id === filtros.activo_id)
  if (filtros.desde) items = items.filter(r => r.fecha_ingreso >= filtros.desde)
  if (filtros.hasta) items = items.filter(r => r.fecha_ingreso <= filtros.hasta)
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: items, error: null }
}

export async function obtenerReparacion(id) {
  await delay()
  const item = store.reparaciones.find(r => r.id === id)
  if (!item) return notFound('Reparación')
  return { data: clone(item), error: null }
}

export async function crearReparacion(payload) {
  await delay()
  const errores = validarReparacion(payload)
  if (errores.length) return { data: null, error: { code: 400, message: errores.join('; ') } }
  const activo = store.activos.find(a => a.id === payload.activo_id)
  if (!activo) return { data: null, error: { code: 400, message: 'activo_id no existe' } }
  const item = factoryReparacion({ id: uid('rep'), ...payload, estado: 'recibido' })
  store.reparaciones.push(item)
  const evt = crearEvento(payload.activo_id, 'reparacion', 'Ingreso a reparación: ' + payload.descripcion, payload.usuario_id)
  store.historial.push({ ...evt, id: uid('hst') })
  return { data: clone(item), error: null }
}

export async function actualizarReparacion(id, payload) {
  await delay()
  const idx = store.reparaciones.findIndex(r => r.id === id)
  if (idx === -1) return notFound('Reparación')
  if (payload.estado && payload.estado !== store.reparaciones[idx].estado) {
    const transOk = puedeTransitarReparacion(store.reparaciones[idx].estado, payload.estado)
    if (!transOk) {
      return { data: null, error: { code: 400, message: 'Transición inválida de ' + actual + ' a ' + nuevoEstado} }
    }
  }
  store.reparaciones[idx] = { ...store.reparaciones[idx], ...payload, updated_at: new Date().toISOString() }
  return { data: clone(store.reparaciones[idx]), error: null }
}

export async function cambiarEstadoReparacion(id, nuevoEstado) {
  await delay()
  const idx = store.reparaciones.findIndex(r => r.id === id)
  if (idx === -1) return notFound('Reparación')
  const actual = store.reparaciones[idx].estado
  if (!puedeTransitarReparacion(actual, nuevoEstado)) {
    return { data: null, error: { code: 400, message: 'Transición inválida de ' + actual + ' a ' + nuevoEstado } }
  }
  store.reparaciones[idx].estado = nuevoEstado
  store.reparaciones[idx].updated_at = new Date().toISOString()
  const activoIdx = store.activos.findIndex(a => a.id === store.reparaciones[idx].activo_id)
  if (activoIdx !== -1 && nuevoEstado === 'entregado') {
    store.activos[activoIdx].estado_uso = 'disponible'
  }
  if (activoIdx !== -1 && nuevoEstado === 'en_reparacion') {
    store.activos[activoIdx].estado_uso = 'en_reparacion'
  }
  const evt = crearEvento(store.reparaciones[idx].activo_id, 'cambio_estado', 'Reparación ' + actual + ' → ' + nuevoEstado)
  store.historial.push({ ...evt, id: uid('hst') })
  return { data: clone(store.reparaciones[idx]), error: null }
}

export async function eliminarReparacion(id) {
  await delay()
  const idx = store.reparaciones.findIndex(r => r.id === id)
  if (idx === -1) return notFound('Reparación')
  const [removed] = store.reparaciones.splice(idx, 1)
  return { data: clone(removed), error: null }
}

// ─── Facturas ────────────────────────────────────────────────────────

export async function obtenerFacturasReparacion(filtros = {}) {
  await delay()
  let items = clone(store.facturas)
  if (filtros.estado_pago) items = items.filter(f => f.estado_pago === filtros.estado_pago)
  if (filtros.tipo_factura) items = items.filter(f => f.tipo_factura === filtros.tipo_factura)
  if (filtros.desde) items = items.filter(f => f.fecha_emision >= filtros.desde)
  if (filtros.hasta) items = items.filter(f => f.fecha_emision <= filtros.hasta)
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: items, error: null }
}

export async function obtenerFactura(id) {
  await delay()
  const item = store.facturas.find(f => f.id === id)
  if (!item) return notFound('Factura')
  return { data: clone(item), error: null }
}

export async function crearFacturaReparacion(payload) {
  await delay()
  const errores = validarFactura(payload)
  if (errores.length) return { data: null, error: { code: 400, message: errores.join('; ') } }
  const repExiste = store.reparaciones.some(r => r.id === payload.reparacion_id)
  if (!repExiste) return { data: null, error: { code: 400, message: 'reparacion_id no existe' } }
  const facturaExistente = store.facturas.find(f => f.reparacion_id === payload.reparacion_id && f.estado_pago !== 'anulada')
  if (facturaExistente) return { data: null, error: { code: 400, message: 'La reparación ya tiene una factura activa' } }
  const item = factoryFactura({ id: uid('fac'), ...payload, estado_pago: 'pendiente' })
  store.facturas.push(item)
  return { data: clone(item), error: null }
}

export async function registrarPagoFactura(id, payload = {}) {
  await delay()
  const idx = store.facturas.findIndex(f => f.id === id)
  if (idx === -1) return notFound('Factura')
  const factura = store.facturas[idx]
  if (factura.estado_pago === 'pagado') return { data: null, error: { code: 400, message: 'La factura ya está pagada' } }
  if (factura.estado_pago === 'anulada') return { data: null, error: { code: 400, message: 'No se puede pagar una factura anulada' } }
  store.facturas[idx] = liquidarFactura({ ...factura, ...payload, fecha_pago: payload.fecha_pago || hoy() })
  return { data: clone(store.facturas[idx]), error: null }
}

export async function anularFactura(id) {
  await delay()
  const idx = store.facturas.findIndex(f => f.id === id)
  if (idx === -1) return notFound('Factura')
  if (!puedeAnularse(store.facturas[idx])) {
    return { data: null, error: { code: 400, message: 'Solo se pueden anular facturas en estado pendiente' } }
  }
  store.facturas[idx].estado_pago = 'anulada'
  store.facturas[idx].updated_at = new Date().toISOString()
  return { data: clone(store.facturas[idx]), error: null }
}

// ─── Comodatos ───────────────────────────────────────────────────────



export async function crearComodato(payload) {
  await delay()
  const activo = store.activos.find(a => a.id === payload.activo_id)
  if (!activo) return { data: null, error: { code: 400, message: 'activo_id no existe' } }
  if (activo.estado_uso !== 'disponible') {
    return { data: null, error: { code: 400, message: 'Activo no está disponible para comodato' } }
  }
  const item = factoryComodato({
    id: uid(),
    activo_id: payload.activo_id,
    alumno_id: payload.alumno_id,
    tipo_comodato: payload.tipo_comodato || 'escolar',
    estado: payload.estado || 'activo',
    fecha_entrega: hoy(),
    fecha_vencimiento: payload.fecha_vencimiento || null,
    instrumento_propio_id: payload.instrumento_propio_id || null,
    ...payload,
  })
  store.comodatos.push(item)
  // Update activo state
  const activoIdx = store.activos.findIndex(a => a.id === payload.activo_id)
  if (activoIdx !== -1) {
    store.activos[activoIdx].estado_uso = 'prestado'
  }
  const evt = crearEvento(payload.activo_id, 'asignacion', 'Instrumento asignado en comodato a ' + (payload.alumno_id || 'desconocido'), payload.usuario_id || 'mock-user', { comodato_id: item.id })
  store.historial.push({ ...evt, id: uid() })
  return { data: clone(item), error: null }
}

export async function obtenerComodatosVencidos() {
  await delay()
  const items = clone(store.comodatos).filter(c => {
    if (c.estado !== 'activo') return false
    const dias = diasHastaVencimiento(c)
    return dias !== null && dias < 0
  })
  return { data: items, error: null }
}

export async function obtenerComodatosPorVencer(dias = 7) {
  await delay()
  const items = clone(store.comodatos).filter(c => {
    if (c.estado !== 'activo') return false
    const d = diasHastaVencimiento(c)
    return d !== null && d >= 0 && d <= dias
  })
  return { data: items, error: null }
}

export async function intercambiarInstrumentos(origenId, destinoId, alumnoId) {
  await delay()
  const comOrigen = store.comodatos.find(c => c.id === origenId)
  if (!comOrigen) return { data: null, error: { code: 404, message: 'Comodato origen no encontrado' } }
  const activoDestino = store.activos.find(a => a.id === destinoId)
  if (!activoDestino) return { data: null, error: { code: 404, message: 'Activo destino no encontrado' } }
  const comDestino = store.comodatos.find(c => c.activo_id === destinoId && c.estado === 'activo')
  const activoOrigen = store.activos.find(a => a.id === comOrigen.activo_id)
  if (!activoOrigen) return { data: null, error: { code: 404, message: 'Activo origen no encontrado' } }
  try {
    if (comDestino) {
      const result = intercambiar(comOrigen, comDestino, activoOrigen, activoDestino)
      const oIdx = store.comodatos.findIndex(c => c.id === origenId)
      const dIdx = store.comodatos.findIndex(c => c.id === comDestino.id)
      store.comodatos[oIdx] = result.comodatoOrigenActualizado
      store.comodatos[dIdx] = result.comodatoDestinoActualizado
      store.activos[store.activos.findIndex(a => a.id === activoOrigen.id)] = { ...activoOrigen, estado_uso: prestadoPorDefecto(result.comodatoDestinoActualizado) }
      store.activos[store.activos.findIndex(a => a.id === activoDestino.id)] = { ...activoDestino, estado_uso: prestadoPorDefecto(result.comodatoOrigenActualizado) }
      return { data: { comodatoOrigen: result.comodatoOrigenActualizado, comodatoDestino: result.comodatoDestinoActualizado }, error: null }
    }
    const activoAnterior = comOrigen.activo_id
    const oIdx = store.comodatos.findIndex(c => c.id === origenId)
    store.comodatos[oIdx] = { ...comOrigen, activo_id: destinoId, intercambiado_con_id: destinoId }
    if (activoAnterior) {
      store.activos[store.activos.findIndex(a => a.id === activoAnterior)].estado_uso = 'disponible'
    }
    store.activos[store.activos.findIndex(a => a.id === destinoId)].estado_uso = 'prestado'
    return { data: { comodatoOrigen: store.comodatos[oIdx] }, error: null }
  } catch (e) {
    return { data: null, error: { code: 400, message: e.message } }
  }
}

function prestadoPorDefecto(c) { return c.estado === 'activo' ? 'prestado' : 'disponible' }

export async function renovarComodato(comodatoId, nuevasFechas) {
  await delay()
  const idx = store.comodatos.findIndex(c => c.id === comodatoId)
  if (idx === -1) return notFound('Comodato')
  const comodato = store.comodatos[idx]
  if (!puedeRenovarse(comodato)) return { data: null, error: { code: 400, message: 'El comodato no puede renovarse' } }
  store.comodatos[idx] = { ...comodato, estado: 'renovado' }
  const nuevoComodato = factoryComodato({
    id: uid('com'),
    activo_id: comodato.activo_id,
    alumno_id: comodato.alumno_id,
    alumno_nombre: comodato.alumno_nombre,
    tipo_comodato: nuevasFechas?.tipo_comodato || comodato.tipo_comodato,
    fecha_vencimiento: nuevasFechas?.fecha_vencimiento || (() => {
      const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]
    })(),
    renovado_de_id: comodato.id,
    estado: 'activo',
  })
  store.comodatos.push(nuevoComodato)
  return { data: { viejo: clone(store.comodatos[idx]), nuevo: clone(nuevoComodato) }, error: null }
}

export async function generarContratoPDF(comodatoId) {
  await delay()
  const comodato = store.comodatos.find(c => c.id === comodatoId)
  if (!comodato) return notFound('Comodato')
  return { data: { url: 'https://storage.test/comodatos/' + comodatoId + '/contrato.pdf', comodatoId }, error: null }
}

// ─── Reportes ────────────────────────────────────────────────────────

export async function generarReporte(tipo, filtros = {}) {
  await delay()
  const reportes = await import('../domain/reportes.js')
  const data = {
    activos: clone(store.activos),
    comodatos: clone(store.comodatos),
    reparaciones: clone(store.reparaciones),
  }
  const reporte = reportes.armarReporte(tipo, data)
  return { data: reporte, error: null }
}

// ─── Dashboard ───────────────────────────────────────────────────────

export async function obtenerKPI() {
  await delay()
  const reportes = await import('../domain/reportes.js')
  const resumen = reportes.resumirInventario({
    activos: store.activos,
    comodatos: store.comodatos,
    reparaciones: store.reparaciones,
  })
  const porTipo = reportes.activosPorTipo(store.activos)
  const activosVencidos = store.comodatos.filter(c => {
    if (c.estado !== 'activo') return false
    const d = diasHastaVencimiento(c)
    return d !== null && d < 0
  })
  const proximosVencer = store.comodatos.filter(c => {
    if (c.estado !== 'activo') return false
    const d = diasHastaVencimiento(c)
    return d !== null && d >= 0 && d <= 7
  })
  return {
    data: {
      resumen,
      distribucion_por_tipo: porTipo,
      comodatos_vencidos: activosVencidos.length,
      comodatos_proximos_vencer: proximosVencer.length,
      total_en_reparacion: store.reparaciones.filter(r => r.estado === 'en_reparacion' || r.estado === 'recibido').length,
    },
    error: null,
  }
}

// ─── Existing aliases (keep compatibility) ───────────────────────────

export async function obtenerComodatosAlumno(alumnoId) {
  await delay()
  const items = clone(store.comodatos).filter(c => c.alumno_id === alumnoId).sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega))
  return { data: items, error: null }
}

export async function obtenerComodatosActivos() {
  await delay()
  const items = clone(store.comodatos).filter(c => c.estado === 'activo').sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega))
  return { data: items, error: null }
}

export async function devolverComodato(id) {
  await delay()
  const idx = store.comodatos.findIndex(c => c.id === id)
  if (idx === -1) return notFound('Comodato')
  store.comodatos[idx].estado = 'devuelto'
  store.comodatos[idx].fecha_devolucion = hoy()
  const activoIdx = store.activos.findIndex(a => a.id === store.comodatos[idx].activo_id)
  if (activoIdx !== -1) store.activos[activoIdx].estado_uso = 'disponible'
  const evt = crearEvento(store.comodatos[idx].activo_id, 'devolucion', 'Instrumento devuelto por ' + (store.comodatos[idx].alumno_nombre || 'desconocido'))
  store.historial.push({ ...evt, id: uid('hst') })
  return { data: clone(store.comodatos[idx]), error: null }
}

export async function obtenerActivosOciosos() {
  await delay()
  const activosPrestados = store.comodatos.filter(c => c.estado === 'activo').map(c => c.activo_id)
  const items = clone(store.activos).filter(a => activosPrestados.includes(a.id)).map(a => ({
    ...a,
    dias_prestado: 30,
    dias_hasta_vencimiento: (() => {
      const com = store.comodatos.find(c => c.activo_id === a.id && c.estado === 'activo')
      return com ? diasHastaVencimiento(com) : null
    })(),
  }))
  return { data: items, error: null }
}

export async function subirContratoComodato(_id, _file) {
  await delay()
  return { data: { url: 'https://storage.test/comodatos/contrato.pdf' }, error: null }
}
