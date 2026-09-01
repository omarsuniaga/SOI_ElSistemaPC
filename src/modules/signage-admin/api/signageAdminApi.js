/**
 * signageAdminApi.js — acceso a las tablas signage_* para el panel de la cartelera.
 *
 * AISLADO: solo toca signage_pantallas / signage_media / bucket 'signage'.
 * No lee ni escribe ninguna tabla existente de SOI. El horario y el calendario
 * que muestra la pantalla salen de vistas adaptador propias y NO se editan aquí.
 */
import { supabase } from '../../../lib/supabaseClient.js'

const BUCKET = 'signage'

/** Layout por defecto — debe coincidir con public/signage/js/config.js del player. */
export const LAYOUT_DEFAULT = {
  cabecera: { visible: true, marca: true, reloj: true, fecha: true, evento: true },
  visualizador: { visible: true, ajuste: 'contain', pie: true, pieTexto: '' },
  horario: { visible: true, anchoPct: 27.5, hoy: true, manana: true, instrumento: false, meta: false },
}

export function mergeLayout(dbLayout) {
  const out = JSON.parse(JSON.stringify(LAYOUT_DEFAULT))
  if (dbLayout && typeof dbLayout === 'object') {
    for (const z of Object.keys(out)) {
      if (dbLayout[z] && typeof dbLayout[z] === 'object') Object.assign(out[z], dbLayout[z])
    }
  }
  return out
}

/* ─── Pantallas ─────────────────────────────────────────────────────────── */

/**
 * Portales departamentales donde puede aparecer el menú "Cartelera".
 * `fijo: true` → siempre visible (nav estático), no se puede desactivar aquí.
 */
export const PORTALES_DEPTO = [
  { id: 'ADM', label: 'Administración', fijo: true },
  { id: 'ACM', label: 'Académico', fijo: true },
  { id: 'COM', label: 'Comunicaciones' },
  { id: 'FIN', label: 'Finanzas' },
  { id: 'LOG', label: 'Logística' },
  { id: 'TECNICO', label: 'Técnico' },
  { id: 'LUT', label: 'Lutería' },
]

export async function listarPantallas() {
  const { data, error } = await supabase
    .from('signage_pantallas')
    .select('id, slug, nombre, institucion, siglas, logo_path, ubicacion, orientacion, layout, modo_nocturno, menu_portales, activo, updated_at')
    .order('nombre', { ascending: true })
  if (error) throw new Error('No se pudieron cargar las pantallas: ' + error.message)
  return data || []
}

export async function guardarMenuPortales(pantallaId, portales) {
  const { error } = await supabase
    .from('signage_pantallas')
    .update({ menu_portales: portales })
    .eq('id', pantallaId)
  if (error) throw new Error('No se pudo guardar la visibilidad: ' + error.message)
}

export async function guardarIdentidad(pantallaId, { institucion, siglas }) {
  const { error } = await supabase
    .from('signage_pantallas')
    .update({ institucion: institucion || null, siglas: siglas || null })
    .eq('id', pantallaId)
  if (error) throw new Error('No se pudo guardar la identidad: ' + error.message)
}

/** Sube un PNG/SVG de logo al bucket y devuelve su storage_path. */
export async function subirLogo(file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `logos/${Date.now()}-logo.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || 'image/png',
    cacheControl: '3600',
  })
  if (error) throw new Error('Error al subir el logo: ' + error.message)
  return path
}

export async function guardarLogo(pantallaId, logoPath) {
  const { error } = await supabase
    .from('signage_pantallas')
    .update({ logo_path: logoPath || null })
    .eq('id', pantallaId)
  if (error) throw new Error('No se pudo guardar el logo: ' + error.message)
}

export async function guardarLayout(pantallaId, layout) {
  const { error } = await supabase
    .from('signage_pantallas')
    .update({ layout })
    .eq('id', pantallaId)
  if (error) throw new Error('No se pudo guardar el diseño: ' + error.message)
}

export async function guardarModoNocturno(pantallaId, modoNocturno) {
  const { error } = await supabase
    .from('signage_pantallas')
    .update({ modo_nocturno: modoNocturno })
    .eq('id', pantallaId)
  if (error) throw new Error('No se pudo guardar el modo nocturno: ' + error.message)
}

/* ─── Medios ────────────────────────────────────────────────────────────── */

export async function listarMedios(pantallaId) {
  const { data, error } = await supabase
    .from('signage_media')
    .select('id, pantalla_id, tipo, titulo, credito, storage_path, youtube_url, youtube_video_id, duracion_seg, orden, activo, vigente_desde, vigente_hasta, created_at')
    .order('orden', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw new Error('No se pudieron cargar los medios: ' + error.message)
  const rows = data || []
  if (!pantallaId) return rows
  return rows.filter((m) => !m.pantalla_id || m.pantalla_id === pantallaId)
}

export function urlPublica(storagePath) {
  if (!storagePath) return null
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
}

/** Sube una imagen o vídeo al bucket y devuelve su storage_path. */
export async function subirArchivo(file, { onProgress } = {}) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60)
  const path = `subidos/${Date.now()}-${safe}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
    cacheControl: '3600',
  })
  if (error) throw new Error('Error al subir el archivo: ' + error.message)
  if (onProgress) onProgress(100)
  return { path, ext }
}

export async function crearMedio(payload) {
  const row = {
    pantalla_id: payload.pantalla_id || null,
    tipo: payload.tipo,
    titulo: payload.titulo || null,
    credito: payload.credito || null,
    storage_path: payload.storage_path || null,
    youtube_url: payload.youtube_url || null,
    youtube_video_id: payload.youtube_video_id || null,
    duracion_seg: payload.duracion_seg ?? null,
    orden: payload.orden ?? 0,
    activo: payload.activo ?? true,
    vigente_desde: payload.vigente_desde || null,
    vigente_hasta: payload.vigente_hasta || null,
  }
  const { data, error } = await supabase.from('signage_media').insert(row).select().single()
  if (error) throw new Error('No se pudo crear el medio: ' + error.message)
  return data
}

export async function actualizarMedio(id, cambios) {
  const { error } = await supabase.from('signage_media').update(cambios).eq('id', id)
  if (error) throw new Error('No se pudo actualizar el medio: ' + error.message)
}

export async function eliminarMedio(id, storagePath) {
  const { error } = await supabase.from('signage_media').delete().eq('id', id)
  if (error) throw new Error('No se pudo eliminar el medio: ' + error.message)
  if (storagePath && storagePath.startsWith('subidos/')) {
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => {})
  }
}

export async function reordenarMedios(ids) {
  // asigna orden = índice*10 para dejar hueco entre elementos
  const updates = ids.map((id, i) =>
    supabase.from('signage_media').update({ orden: i * 10 }).eq('id', id),
  )
  const results = await Promise.all(updates)
  const err = results.find((r) => r.error)
  if (err) throw new Error('No se pudo reordenar: ' + err.error.message)
}

/** Extrae el id de vídeo de una URL de YouTube (varios formatos). */
export function youtubeId(url) {
  if (!url) return null
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  return m ? m[1] : null
}
