/**
 * departamentosSupabase.js — Adaptador real de la gestión de departamentos (portal ADM).
 * Tabla: departamentos (RLS authenticated). El campo `email` lo consume Hermes
 * para despachar correos por departamento (fn_email_departamento + edge function send-email).
 */

import { supabase } from '../../../lib/supabaseClient.js'

const TABLA = 'departamentos'
const COLS =
  'id, codigo, nombre, descripcion, email, responsable_nombre, responsable_email, activo, updated_at'

export async function getDepartamentos() {
  const { data, error } = await supabase.from(TABLA).select(COLS).order('codigo', { ascending: true })
  if (error) throw error
  return data || []
}

export async function actualizarDepartamento(id, updates = {}) {
  const payload = {}
  if (updates.nombre !== undefined) payload.nombre = updates.nombre
  if (updates.email !== undefined) payload.email = updates.email || null
  if (updates.responsable_nombre !== undefined) payload.responsable_nombre = updates.responsable_nombre || null
  if (updates.responsable_email !== undefined) payload.responsable_email = updates.responsable_email || null
  if (updates.activo !== undefined) payload.activo = updates.activo
  payload.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from(TABLA).update(payload).eq('id', id).select(COLS).single()
  if (error) throw error
  return data
}

/**
 * Envía un correo de prueba a una dirección vía la edge function send-email.
 * Útil para validar que la casilla del departamento recibe correctamente.
 */
export async function enviarCorreoPrueba(email, codigo = '') {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: email,
      subject: `Correo de prueba — Departamento ${codigo}`.trim(),
      html: `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#1f2937">
        <p>Este es un <strong>correo de prueba</strong> del SOI (El Sistema Punta Cana).</p>
        <p>Si lo recibís, la casilla del departamento <strong>${escapeHtml(codigo)}</strong> está configurada correctamente
        y Hermes podrá despachar correos a este destino. 🎻</p>
      </div>`,
    },
  })
  if (error) {
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
    throw new Error(data.batches?.[0]?.error || 'No se pudo enviar el correo de prueba')
  }
  return data
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
