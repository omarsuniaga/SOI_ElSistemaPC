/**
 * luteriaTallerSupabase.js — Capa real sobre tablas lut_* para el Portal de Lutería.
 *
 * CRUD completo para órdenes, diagnósticos, presupuestos, insumos, movimientos,
 * solicitudes de compra y evidencias.
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLAS = {
  ORDENES: 'lut_ordenes_reparacion',
  DIAGNOSTICOS: 'lut_diagnosticos',
  PRESUPUESTOS: 'lut_presupuestos',
  INSUMOS: 'lut_insumos',
  MOVIMIENTOS: 'lut_movimientos_insumos',
  SOLICITUDES: 'lut_solicitudes_compra',
  EVIDENCIAS: 'lut_evidencias',
  INVENTARIO: 'inventario_activos',
  HISTORIAL: 'inventario_historial',
}

// ─── Órdenes de reparación ────────────────────────────────────────────────────

export async function getOrdenes(filtros = {}) {
  let q = supabase.from(TABLAS.ORDENES).select('*')

  if (filtros.estado && filtros.estado !== 'todos') {
    q = q.eq('estado', filtros.estado)
  }
  if (filtros.instrumento_id) {
    q = q.eq('instrumento_id', filtros.instrumento_id)
  }
  if (filtros.alumno_id) {
    q = q.eq('alumno_id', filtros.alumno_id)
  }
  if (filtros.prioridad && filtros.prioridad !== 'todos') {
    q = q.eq('prioridad', filtros.prioridad)
  }
  if (filtros.requiere_cobro !== undefined) {
    q = q.eq('requiere_cobro', filtros.requiere_cobro)
  }

  const { data, error } = await q.order('fecha_recepcion', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getOrdenById(id) {
  const { data, error } = await supabase
    .from(TABLAS.ORDENES)
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export async function createOrden(datos) {
  const { data, error } = await supabase
    .from(TABLAS.ORDENES)
    .insert({
      correlation_id: datos.correlation_id || null,
      instrumento_id: datos.instrumento_id,
      alumno_id: datos.alumno_id || null,
      alumno_nombre: datos.alumno_nombre || null,
      reportado_por: datos.reportado_por || null,
      reportado_por_nombre: datos.reportado_por_nombre || null,
      recibido_por: datos.recibido_por || null,
      recibido_por_nombre: datos.recibido_por_nombre || null,
      tecnico_responsable: datos.tecnico_responsable || null,
      tecnico_responsable_nombre: datos.tecnico_responsable_nombre || null,
      departamento_origen: datos.departamento_origen || 'LUT',
      estado: 'reportado',
      prioridad: datos.prioridad || 'media',
      gravedad: datos.gravedad || null,
      tipo_dano: datos.tipo_dano || null,
      descripcion_inicial: datos.descripcion_inicial || '',
      requiere_reemplazo: datos.requiere_reemplazo || false,
      requiere_cobro: datos.requiere_cobro || false,
      costo_estimado: datos.costo_estimado || null,
      fecha_recepcion: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOrdenEstado(id, nuevoEstado, datos = {}) {
  const { data, error } = await supabase
    .from(TABLAS.ORDENES)
    .update({ estado: nuevoEstado, ...datos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOrden(id, cambios) {
  const { data, error } = await supabase
    .from(TABLAS.ORDENES)
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Diagnósticos ─────────────────────────────────────────────────────────────

export async function getDiagnosticos(ordenId) {
  const { data, error } = await supabase
    .from(TABLAS.DIAGNOSTICOS)
    .select('*')
    .eq('orden_id', ordenId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createDiagnostico(datos) {
  const { data, error } = await supabase
    .from(TABLAS.DIAGNOSTICOS)
    .insert(datos)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Presupuestos ─────────────────────────────────────────────────────────────

export async function getPresupuestos(ordenId) {
  const { data, error } = await supabase
    .from(TABLAS.PRESUPUESTOS)
    .select('*')
    .eq('orden_id', ordenId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createPresupuesto(datos) {
  const { data, error } = await supabase
    .from(TABLAS.PRESUPUESTOS)
    .insert({
      orden_id: datos.orden_id,
      subtotal_mano_obra: datos.subtotal_mano_obra || 0,
      subtotal_materiales: datos.subtotal_materiales || 0,
      subtotal_servicios_externos: datos.subtotal_servicios_externos || 0,
      descuento: datos.descuento || 0,
      monto_institucion: datos.monto_institucion || 0,
      monto_representante: datos.monto_representante || 0,
      observaciones: datos.observaciones || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePresupuestoEstado(id, nuevoEstado, datos = {}) {
  const { data, error } = await supabase
    .from(TABLAS.PRESUPUESTOS)
    .update({ estado: nuevoEstado, ...datos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Insumos ──────────────────────────────────────────────────────────────────

export async function getInsumos(filtros = {}) {
  let q = supabase.from(TABLAS.INSUMOS).select('*')

  if (filtros.categoria && filtros.categoria !== 'todos') {
    q = q.eq('categoria', filtros.categoria)
  }
  if (filtros.activo !== undefined) {
    q = q.eq('activo', filtros.activo)
  }
  // stock_bajo filter is client-side
  const { data, error } = await q.order('nombre', { ascending: true })
  if (error) throw error

  let res = data || []
  if (filtros.stock_bajo) {
    res = res.filter((i) => Number(i.stock_actual) <= Number(i.stock_minimo))
  }
  return res
}

export async function getInsumoById(id) {
  const { data, error } = await supabase
    .from(TABLAS.INSUMOS)
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code === 'PGRST116') return null
  if (error) throw error
  return data
}

export async function ajustarStock(insumoId, cantidad, tipo = 'ajuste', ordenId = null, registradoPor = null) {
  // Fetch current stock
  const { data: insumo, error: fetchError } = await supabase
    .from(TABLAS.INSUMOS)
    .select('stock_actual, costo_unitario')
    .eq('id', insumoId)
    .single()

  if (fetchError) throw fetchError

  let nuevoStock = Number(insumo.stock_actual)
  const absCant = Math.abs(cantidad)

  if (tipo === 'consumo' || tipo === 'perdida') {
    nuevoStock -= absCant
  } else if (tipo === 'entrada' || tipo === 'devolucion') {
    nuevoStock += absCant
  } else {
    // ajuste
    nuevoStock += cantidad
  }

  // Update stock
  const { error: updateError } = await supabase
    .from(TABLAS.INSUMOS)
    .update({ stock_actual: nuevoStock, updated_at: new Date().toISOString() })
    .eq('id', insumoId)

  if (updateError) throw updateError

  // Register movement
  const { data: mov, error: movError } = await supabase
    .from(TABLAS.MOVIMIENTOS)
    .insert({
      insumo_id: insumoId,
      orden_id: ordenId,
      tipo_movimiento: tipo,
      cantidad: absCant,
      costo_unitario: insumo.costo_unitario,
      registrado_por: registradoPor,
    })
    .select()
    .single()

  if (movError) throw movError
  return mov
}

// ─── Solicitudes de compra ────────────────────────────────────────────────────

export async function getSolicitudesCompra(filtros = {}) {
  let q = supabase.from(TABLAS.SOLICITUDES).select('*')

  if (filtros.estado && filtros.estado !== 'todos') {
    q = q.eq('estado', filtros.estado)
  }
  if (filtros.orden_id) {
    q = q.eq('orden_id', filtros.orden_id)
  }

  const { data, error } = await q.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createSolicitudCompra(datos) {
  const { data, error } = await supabase
    .from(TABLAS.SOLICITUDES)
    .insert({
      orden_id: datos.orden_id || null,
      insumo_id: datos.insumo_id,
      cantidad_solicitada: datos.cantidad_solicitada,
      justificacion: datos.justificacion || '',
      urgencia: datos.urgencia || 'media',
      costo_estimado: datos.costo_estimado || null,
      proveedor_sugerido: datos.proveedor_sugerido || null,
      solicitado_por: datos.solicitado_por || null,
      fecha_requerida: datos.fecha_requerida || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSolicitudEstado(id, nuevoEstado, datos = {}) {
  const { data, error } = await supabase
    .from(TABLAS.SOLICITUDES)
    .update({ estado: nuevoEstado, ...datos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Evidencias ───────────────────────────────────────────────────────────────

export async function getEvidencias(ordenId) {
  const { data, error } = await supabase
    .from(TABLAS.EVIDENCIAS)
    .select('*')
    .eq('orden_id', ordenId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createEvidencia(datos) {
  const { data, error } = await supabase
    .from(TABLAS.EVIDENCIAS)
    .insert(datos)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard() {
  const abiertas = await supabase
    .from(TABLAS.ORDENES)
    .select('id, estado, costo_estimado, fecha_recepcion, requiere_cobro')
    .not('estado', 'in', `("entregado","cerrado","cancelado")`)

  if (abiertas.error) throw abiertas.error

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const hoyStr = hoy.toISOString()

  const abiertasData = abiertas.data || []
  const recibidosHoy = abiertasData.filter((o) => o.fecha_recepcion >= hoyStr)

  const { count: pendientesDiag } = await supabase
    .from(TABLAS.ORDENES)
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'pendiente_diagnostico')

  const { count: enReparacion } = await supabase
    .from(TABLAS.ORDENES)
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'en_reparacion')

  const { count: esperandoInsumos } = await supabase
    .from(TABLAS.ORDENES)
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'esperando_insumos')

  const { count: listosEntrega } = await supabase
    .from(TABLAS.ORDENES)
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'listo_entrega')

  const { data: insumosBajos } = await supabase
    .from(TABLAS.INSUMOS)
    .select('id')
    .filter('stock_actual', 'lte', supabase.rpc('get_column_ref', { tbl: TABLAS.INSUMOS, col: 'stock_minimo' }))

  return {
    recibidos_hoy: recibidosHoy.length,
    pendientes_diagnostico: pendientesDiag || 0,
    en_reparacion: enReparacion || 0,
    esperando_insumos: esperandoInsumos || 0,
    listos_entrega: listosEntrega || 0,
    abiertas_total: abiertasData.length,
    costo_estimado_abierto: abiertasData.reduce((s, o) => s + (Number(o.costo_estimado) || 0), 0),
    con_cobro_pendiente: abiertasData.filter((o) => o.requiere_cobro).length,
    insumos_stock_bajo: insumosBajos?.length || 0,
  }
}

// ─── Inventario (fuente de verdad desde Loop 18) ────────────────────────────

/**
 * Busca un activo en inventario_activos por número de serie.
 * Retorna el activo o null si no existe.
 */
export async function getActivoBySerie(numeroSerie) {
  if (!numeroSerie || !numeroSerie.trim()) return null
  const { data, error } = await supabase
    .from(TABLAS.INVENTARIO)
    .select('id, codigo_inventario, tipo_instrumento, marca, modelo, numero_serie, estado_uso, estado_conservacion, notas, activo')
    .eq('numero_serie', numeroSerie.trim())
    .eq('activo', true)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Crea un nuevo activo en inventario_activos.
 * Retorna el activo creado con su id asignado.
 */
export async function createActivo(datos) {
  const { data, error } = await supabase
    .from(TABLAS.INVENTARIO)
    .insert({
      tipo_instrumento: datos.tipo_instrumento,
      marca: datos.marca || null,
      modelo: datos.modelo || null,
      numero_serie: datos.numero_serie,
      codigo_inventario: datos.codigo_inventario || `INV-${Date.now()}`,
      estado_uso: datos.estado_uso || 'disponible',
      estado_conservacion: datos.estado_conservacion || 'bueno',
      activo: true,
      notas: datos.notas || null,
      foto_url: datos.foto_url || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Actualiza el estado de un activo en inventario_activos.
 */
export async function updateActivoEstado(activoId, campos) {
  const { data, error } = await supabase
    .from(TABLAS.INVENTARIO)
    .update(campos)
    .eq('id', activoId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Inserta un evento en inventario_historial.
 * tipo_evento: 'dañado' | 'en_reparacion' | 'reparado' | 'entregado' | 'baja'.
 */
export async function registrarEventoHistorial(activoId, tipoEvento, descripcion, usuarioId = null, metadata = null) {
  const { data, error} = await supabase
    .from(TABLAS.HISTORIAL)
    .insert({
      activo_id: activoId,
      tipo_evento: tipoEvento,
      descripcion,
      fecha: new Date().toISOString(),
      usuario_id: usuarioId,
      metadata,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Sube una foto de instrumento al bucket instrumentos-fotos.
 * path: instrumentos-fotos/<numero_serie>/<timestamp>-<nombre>.
 * Retorna la URL pública.
 */
export async function uploadFotoInstrumento(file, numeroSerie) {
  const ext = file.name.split('.').pop().toLowerCase()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `instrumentos-fotos/${numeroSerie}/${Date.now()}-${safeName}`

  const { error: upErr } = await supabase.storage
    .from('instrumentos-fotos')
    .upload(path, file, { upsert: false, contentType: file.type })
  if (upErr) throw upErr

  const { data: urlData } = supabase.storage
    .from('instrumentos-fotos')
    .getPublicUrl(path)
  return urlData.publicUrl
}
