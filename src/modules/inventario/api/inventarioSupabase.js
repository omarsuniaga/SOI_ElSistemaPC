import { supabase } from "../../../lib/supabaseClient.js"

function handleError(error) {
  return { data: null, error: error ? { code: error.code || 500, message: error.message || "Error interno" } : null }
}

// Activos

export async function obtenerActivos(filtros = {}) {
  try {
    let q = supabase.from("inventario_activos").select("*", { count: "exact" }).eq("activo", true).order("codigo_inventario")
    if (filtros.estado_uso) q = q.eq("estado_uso", filtros.estado_uso)
    if (filtros.tipo_instrumento) q = q.ilike("tipo_instrumento", "%" + filtros.tipo_instrumento + "%")
    if (filtros.estado_conservacion) q = q.eq("estado_conservacion", filtros.estado_conservacion)
    if (filtros.ubicacion) q = q.ilike("ubicacion", "%" + filtros.ubicacion + "%")
    if (filtros.q) {
      const s = filtros.q.toLowerCase()
      q = q.or("codigo_inventario.ilike.%" + s + "%,tipo_instrumento.ilike.%" + s + "%,marca.ilike.%" + s + "%,modelo.ilike.%" + s + "%")
    }
    if (filtros.page && filtros.pageSize) {
      const start = (filtros.page - 1) * filtros.pageSize
      q = q.range(start, start + filtros.pageSize - 1)
    }
    const { data, error, count } = await q
    if (error) return handleError(error)
    return { data, total: count, error: null }
  } catch (e) { return handleError(e) }
}

export async function obtenerActivoPorId(id) {
  try {
    const { data, error } = await supabase.from("inventario_activos").select("*, inventario_accesorios(*), comodatos_activos!inner(*)").eq("id", id).single()
    if (error) return handleError(error)
    if (!data) return { data: null, error: { code: 404, message: "Activo no encontrado" } }
    return { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function crearActivo(payload) {
  try {
    const { data, error } = await supabase.from("inventario_activos").insert([payload]).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function actualizarActivo(id, payload) {
  try {
    const { data, error } = await supabase.from("inventario_activos").update(payload).eq("id", id).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function cambiarEstadoActivo(id, nuevoEstado) {
  try {
    const { data, error } = await supabase.rpc("cambiar_estado_activo", { p_id: id, p_nuevo_estado: nuevoEstado })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function subirFotoActivo(id, file) {
  try {
    const ext = file.name ? file.name.split(".").pop() : "jpg"
    const path = "activos/" + id + "/foto." + ext
    const { error: uploadErr } = await supabase.storage.from("inventario").upload(path, file, { upsert: true })
    if (uploadErr) return handleError(uploadErr)
    const { data: urlData } = supabase.storage.from("inventario").getPublicUrl(path)
    const { data, error } = await supabase.from("inventario_activos").update({ foto_url: urlData.publicUrl }).eq("id", id).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

// Accesorios

export async function obtenerAccesorios(activoId) {
  try {
    let q = supabase.from("inventario_accesorios").select("*, inventario_activos!inner(codigo_inventario, tipo_instrumento)").order("created_at", { ascending: false })
    if (activoId) q = q.eq("activo_id", activoId)
    const { data, error } = await q
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function crearAccesorio(payload) {
  try {
    const { data, error } = await supabase.from("inventario_accesorios").insert([payload]).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function actualizarAccesorio(id, payload) {
  try {
    const { data, error } = await supabase.from("inventario_accesorios").update(payload).eq("id", id).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function eliminarAccesorio(id) {
  try {
    const { data, error } = await supabase.from("inventario_accesorios").delete().eq("id", id).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

// Historial

export async function obtenerHistorialActivo(activoId, filtros = {}) {
  try {
    let q = supabase.from("inventario_historial").select("*").eq("activo_id", activoId).order("fecha", { ascending: false })
    if (filtros.tipo_evento) q = q.eq("tipo_evento", filtros.tipo_evento)
    if (filtros.limit) q = q.limit(filtros.limit)
    const { data, error } = await q
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function crearEventoManual(payload) {
  try {
    const { data, error } = await supabase.from("inventario_historial").insert([{
      activo_id: payload.activo_id,
      tipo_evento: payload.tipo_evento,
      descripcion: payload.descripcion,
      usuario_id: payload.usuario_id || null,
      metadata: payload.metadata || null,
    }]).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

// Reparaciones

export async function obtenerReparaciones(filtros = {}) {
  try {
    let q = supabase.from("inventario_reparaciones").select("*, inventario_activos!inner(codigo_inventario, tipo_instrumento, marca)").order("created_at", { ascending: false })
    if (filtros.estado) q = q.eq("estado", filtros.estado)
    if (filtros.activo_id) q = q.eq("activo_id", filtros.activo_id)
    if (filtros.desde) q = q.gte("fecha_ingreso", filtros.desde)
    if (filtros.hasta) q = q.lte("fecha_ingreso", filtros.hasta)
    const { data, error } = await q
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function obtenerReparacion(id) {
  try {
    const { data, error } = await supabase.from("inventario_reparaciones").select("*, inventario_activos!inner(codigo_inventario, tipo_instrumento, marca, modelo)").eq("id", id).single()
    if (error) return handleError(error)
    if (!data) return { data: null, error: { code: 404, message: "Reparación no encontrada" } }
    return { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function crearReparacion(payload) {
  try {
    const { data, error } = await supabase.rpc("crear_reparacion", {
      p_activo_id: payload.activo_id,
      p_tipo_tallerista: payload.tipo_tallerista,
      p_tallerista_nombre: payload.tallerista_nombre,
      p_descripcion: payload.descripcion,
      p_costo_estimado: payload.costo_estimado,
      p_proveedor_factura_url: payload.proveedor_factura_url,
    })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function actualizarReparacion(id, payload) {
  try {
    const { data, error } = await supabase.from("inventario_reparaciones").update(payload).eq("id", id).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function cambiarEstadoReparacion(id, nuevoEstado) {
  try {
    const { data, error } = await supabase.rpc("cambiar_estado_reparacion", { p_id: id, p_nuevo_estado: nuevoEstado })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function eliminarReparacion(id) {
  try {
    const { data, error } = await supabase.from("inventario_reparaciones").delete().eq("id", id).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

// Facturas

export async function obtenerFacturasReparacion(filtros = {}) {
  try {
    let q = supabase.from("facturas_reparacion").select("*, inventario_reparaciones!inner(activo_id, descripcion)").order("created_at", { ascending: false })
    if (filtros.estado_pago) q = q.eq("estado_pago", filtros.estado_pago)
    if (filtros.tipo_factura) q = q.eq("tipo_factura", filtros.tipo_factura)
    if (filtros.desde) q = q.gte("fecha_emision", filtros.desde)
    if (filtros.hasta) q = q.lte("fecha_emision", filtros.hasta)
    const { data, error } = await q
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function obtenerFactura(id) {
  try {
    const { data, error } = await supabase.from("facturas_reparacion").select("*, inventario_reparaciones!inner(*)").eq("id", id).single()
    if (error) return handleError(error)
    if (!data) return { data: null, error: { code: 404, message: "Factura no encontrada" } }
    return { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function crearFacturaReparacion(payload) {
  try {
    const { data, error } = await supabase.from("facturas_reparacion").insert([payload]).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function registrarPagoFactura(id, payload = {}) {
  try {
    const updateData = { estado_pago: "pagado", fecha_pago: payload.fecha_pago || new Date().toISOString().split("T")[0] }
    if (payload.metodo_pago) updateData.metodo_pago = payload.metodo_pago
    const { data, error } = await supabase.from("facturas_reparacion").update(updateData).eq("id", id).eq("estado_pago", "pendiente").select().single()
    if (error) return handleError(error)
    if (!data) return { data: null, error: { code: 400, message: "Factura no encontrada o ya no está pendiente" } }
    return { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function anularFactura(id) {
  try {
    const { data, error } = await supabase.from("facturas_reparacion").update({ estado_pago: "anulada" }).eq("id", id).eq("estado_pago", "pendiente").select().single()
    if (error) return handleError(error)
    if (!data) return { data: null, error: { code: 400, message: "Factura no encontrada o no está pendiente" } }
    return { data, error: null }
  } catch (e) { return handleError(e) }
}

// Comodatos

export async function obtenerComodatosVencidos() {
  try {
    const hoy = new Date().toISOString().split("T")[0]
    const { data, error } = await supabase.from("comodatos_activos").select("*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca), alumnos(nombre_completo)").eq("estado", "activo").lt("fecha_vencimiento", hoy).order("fecha_vencimiento", { ascending: true })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function obtenerComodatosPorVencer(dias = 7) {
  try {
    const hoy = new Date().toISOString().split("T")[0]
    const futuro = new Date(); futuro.setDate(futuro.getDate() + dias)
    const futuroStr = futuro.toISOString().split("T")[0]
    const { data, error } = await supabase.from("comodatos_activos").select("*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca), alumnos(nombre_completo)").eq("estado", "activo").gte("fecha_vencimiento", hoy).lte("fecha_vencimiento", futuroStr).order("fecha_vencimiento", { ascending: true })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function intercambiarInstrumentos(origenId, destinoId, alumnoId) {
  try {
    const { data, error } = await supabase.rpc("intercambiar_instrumentos", { p_comodato_origen_id: origenId, p_activo_destino_id: destinoId, p_alumno_id: alumnoId })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function renovarComodato(comodatoId, nuevasFechas) {
  try {
    const { data, error } = await supabase.rpc("renovar_comodato", { p_comodato_id: comodatoId, p_nueva_fecha_vencimiento: nuevasFechas?.fecha_vencimiento, p_nuevo_tipo: nuevasFechas?.tipo_comodato })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function generarContratoPDF(comodatoId) {
  try {
    const { data, error } = await supabase.rpc("generar_contrato_pdf", { p_comodato_id: comodatoId })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

// Reportes

export async function generarReporte(tipo, filtros = {}) {
  try {
    const { data, error } = await supabase.rpc("generar_reporte_inventario", { p_tipo: tipo, p_filtros: filtros })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

// Dashboard

export async function obtenerKPI() {
  try {
    const { data, error } = await supabase.rpc("obtener_kpi_inventario")
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

// Existing methods

export async function crearComodato(payload) {
  try {
    const { data, error } = await supabase.from("comodatos_activos").insert([payload]).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function devolverComodato(id) {
  try {
    const { data, error } = await supabase.from("comodatos_activos").update({ estado: "devuelto", fecha_devolucion: new Date().toISOString().split("T")[0] }).eq("id", id).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function obtenerComodatosAlumno(alumnoId) {
  try {
    const { data, error } = await supabase.from("comodatos_activos").select("*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca, modelo)").eq("alumno_id", alumnoId).order("created_at", { ascending: false })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function obtenerComodatosActivos() {
  try {
    const { data, error } = await supabase.from("comodatos_activos").select("*, inventario_activos!comodatos_activos_activo_id_fkey(codigo_inventario, tipo_instrumento, marca, modelo), alumnos(nombre_completo)").eq("estado", "activo").order("fecha_entrega", { ascending: false })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function obtenerActivosOciosos() {
  try {
    const { data, error } = await supabase.from("vw_activos_ociosos").select("*").order("dias_prestado", { ascending: false })
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}

export async function subirContratoComodato(comodatoId, file) {
  try {
    const path = "comodatos/" + comodatoId + "/contrato.pdf"
    const { error: uploadErr } = await supabase.storage.from("documentos").upload(path, file, { upsert: true, contentType: "application/pdf" })
    if (uploadErr) return handleError(uploadErr)
    const { data: urlData } = supabase.storage.from("documentos").getPublicUrl(path)
    const { data, error } = await supabase.from("comodatos_activos").update({ contrato_firmado_url: urlData.publicUrl }).eq("id", comodatoId).select().single()
    return error ? handleError(error) : { data, error: null }
  } catch (e) { return handleError(e) }
}