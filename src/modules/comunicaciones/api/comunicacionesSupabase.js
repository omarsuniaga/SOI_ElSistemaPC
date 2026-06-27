/**
 * comunicacionesSupabase.js — Adaptador real para el portal de Comunicaciones.
 *
 * Fuentes verificadas:
 *   alumnos: nombre_completo, instrumento_principal, activo,
 *            representante_nombre, representante_tlf, madre_nombre, madre_tlf_whatsapp,
 *            padre_nombre, padre_tlf_whatsapp, familiar_nombre, familiar_telefono,
 *            correo_representante
 *   document_templates: id, nombre, tipo, descripcion, contenido, variables[], estado, version
 *
 * El envío de correo va por la Edge Function `send-email` (Resend).
 * El envío de WhatsApp se hace client-side con links wa.me (sin backend).
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { familiaDe, normalizarInstrumento } from '../domain/secciones.js'

/**
 * Construye el directorio de contactos a partir de alumnos activos.
 * Cada contacto agrega el mejor teléfono WhatsApp y correo disponibles.
 */
export async function getContactos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select(
      'id, nombre_completo, instrumento_principal, activo, representante_nombre, representante_tlf, madre_nombre, madre_tlf_whatsapp, padre_nombre, padre_tlf_whatsapp, familiar_nombre, familiar_telefono, correo_representante',
    )
    .eq('activo', true)
    .order('nombre_completo', { ascending: true })

  if (error) throw error

  return (data || []).map((a) => {
    const whatsapp =
      a.madre_tlf_whatsapp || a.padre_tlf_whatsapp || a.representante_tlf || a.familiar_telefono || null
    const contactoNombre =
      a.representante_nombre || a.madre_nombre || a.padre_nombre || a.familiar_nombre || 'Representante'
    return {
      alumnoId: a.id,
      alumno: a.nombre_completo,
      instrumento: normalizarInstrumento(a.instrumento_principal),
      familia: familiaDe(a.instrumento_principal),
      contactoNombre,
      whatsapp,
      email: a.correo_representante || null,
    }
  })
}

export async function getPlantillas() {
  const { data, error } = await supabase
    .from('document_templates')
    .select('id, nombre, tipo, descripcion, contenido, variables, estado, version, updated_at')
    .order('nombre', { ascending: true })

  if (error) throw error
  return data || []
}

export async function guardarPlantilla(plantilla) {
  const payload = {
    nombre: plantilla.nombre,
    tipo: plantilla.tipo || 'mensaje',
    descripcion: plantilla.descripcion || null,
    contenido: plantilla.contenido || '',
    variables: plantilla.variables || [],
    estado: plantilla.estado || 'activa',
    updated_at: new Date().toISOString(),
  }

  if (plantilla.id) {
    const { data, error } = await supabase
      .from('document_templates')
      .update(payload)
      .eq('id', plantilla.id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('document_templates')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarPlantilla(id) {
  const { error } = await supabase.from('document_templates').delete().eq('id', id)
  if (error) throw error
  return true
}

/**
 * Envía correo institucional vía la Edge Function send-email (Resend).
 * @param {{to: string[], subject: string, html?: string, text?: string, replyTo?: string}} payload
 */
export async function enviarCorreo(payload) {
  const { data, error } = await supabase.functions.invoke('send-email', { body: payload })
  if (error) {
    // El error de invoke a veces trae el body en context
    let detalle = error.message
    try {
      const ctx = await error.context?.json?.()
      if (ctx?.error) detalle = ctx.error
    } catch (_e) {
      /* noop */
    }
    throw new Error(detalle)
  }
  if (data && data.ok === false && data.enviados === 0) {
    throw new Error(data.batches?.[0]?.error || 'No se pudo enviar el correo')
  }
  return data
}
