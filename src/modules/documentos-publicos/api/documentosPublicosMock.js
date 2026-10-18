/**
 * documentosPublicosMock.js — Modo Demo (JSON + memoria de sesión). Misma interfaz que
 * documentosPublicosSupabase.js. Los archivos subidos viven como blob: URL hasta recargar.
 */
import seed from '../../../assets/data/mocks/documentosPublicos.json'
import { accionDeTransicion } from '../lib/estados.js'
import { validateFile, sha256Hex, buildStoragePath } from '../lib/fileValidation.js'

const ACTOR = 'demo-admin'
const publicaciones = seed.publicaciones.map((p) => ({ ...p }))
const versiones = seed.versiones.map((v) => ({ ...v }))
const eventos = seed.eventos.map((e) => ({ ...e }))
const blobUrls = new Map() // storage_path -> blob URL

let seq = 100
const nowIso = () => new Date().toISOString()
const uid = () => crypto.randomUUID()
const randomSlug = () => uid().replace(/-/g, '').slice(0, 10)
const findPub = (id) => {
  const p = publicaciones.find((x) => x.id === id)
  if (!p) throw new Error('Publicación inexistente')
  return p
}
const log = (publicacion_id, accion, detalle = {}) =>
  eventos.push({ id: ++seq, publicacion_id, accion, actor_id: ACTOR, detalle, created_at: nowIso() })
const withVersion = (p) => {
  const v = versiones.find((x) => x.id === p.version_actual_id)
  return {
    ...p,
    version: v ? { numero: v.numero, mime_type: v.mime_type, extension: v.extension, size_bytes: v.size_bytes, nombre_original: v.nombre_original, storage_path: v.storage_path } : null,
  }
}

export async function puedeGestionar() {
  return true
}

export async function listarPublicaciones() {
  return [...publicaciones].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map(withVersion)
}

export async function obtenerPublicacion(id) {
  const p = publicaciones.find((x) => x.id === id)
  return p ? withVersion(p) : null
}

export async function crearPublicacion({ titulo, descripcion, fecha, categoria }) {
  const t = String(titulo ?? '').trim()
  if (t.length < 3 || t.length > 160) throw new Error('El título debe tener entre 3 y 160 caracteres')
  const now = nowIso()
  const p = {
    id: uid(), slug: randomSlug(), titulo: t, descripcion: descripcion?.trim() || null,
    fecha_documento: fecha || now.slice(0, 10), categoria: categoria || 'general', estado: 'borrador',
    version_actual_id: null, published_at: null, archived_at: null,
    created_by: ACTOR, updated_by: ACTOR, created_at: now, updated_at: now,
  }
  publicaciones.push(p)
  log(p.id, 'crear', { slug: p.slug, titulo: p.titulo })
  return { ...p }
}

export async function actualizarPublicacion(id, { titulo, descripcion, fecha, categoria }) {
  const p = findPub(id)
  const t = String(titulo ?? '').trim()
  if (t.length < 3 || t.length > 160) throw new Error('El título debe tener entre 3 y 160 caracteres')
  Object.assign(p, { titulo: t, descripcion: descripcion?.trim() || null, fecha_documento: fecha || p.fecha_documento, categoria: categoria || p.categoria, updated_by: ACTOR, updated_at: nowIso() })
  log(id, 'actualizar')
  return { ...p }
}

export async function cambiarEstado(id, estado) {
  const p = findPub(id)
  const accion = accionDeTransicion(p.estado, estado)
  if (!accion) throw new Error(`Transición no permitida: ${p.estado} → ${estado}`)
  if (estado === 'publicado' && !p.version_actual_id) throw new Error('No se puede publicar sin un documento cargado')
  p.estado = estado
  if (estado === 'publicado') p.published_at = nowIso()
  if (estado === 'archivado') p.archived_at = nowIso()
  if (estado === 'borrador') p.archived_at = null
  p.updated_at = nowIso()
  log(id, accion, { estado })
  return { ...p }
}

export async function subirVersion(publicacionId, file, motivo = null) {
  const p = findPub(publicacionId)
  if (p.estado === 'archivado') throw new Error('Una publicación archivada no admite nuevas versiones; restáurela primero')
  const check = await validateFile(file)
  if (!check.ok) throw new Error(check.error)
  const path = buildStoragePath(publicacionId, check.ext)
  blobUrls.set(path, URL.createObjectURL(file))
  const numero = Math.max(0, ...versiones.filter((v) => v.publicacion_id === publicacionId).map((v) => v.numero)) + 1
  const v = {
    id: uid(), publicacion_id: publicacionId, numero, storage_path: path, mime_type: check.mime, extension: check.ext,
    size_bytes: file.size, sha256: await sha256Hex(file), nombre_original: file.name.slice(0, 255), motivo: motivo || null,
    created_by: ACTOR, created_at: nowIso(),
  }
  versiones.push(v)
  p.version_actual_id = v.id
  p.updated_at = nowIso()
  log(publicacionId, 'nueva_version', { version: numero, sha256: v.sha256 })
  return { ...v }
}

export async function activarVersion(publicacionId, versionId) {
  const p = findPub(publicacionId)
  if (p.estado === 'archivado') throw new Error('Una publicación archivada no admite cambios de versión')
  const v = versiones.find((x) => x.id === versionId && x.publicacion_id === publicacionId)
  if (!v) throw new Error('La versión no pertenece a la publicación')
  p.version_actual_id = v.id
  p.updated_at = nowIso()
  log(publicacionId, 'activar_version', { version: v.numero })
  return { ...p }
}

export async function listarVersiones(publicacionId) {
  return versiones.filter((v) => v.publicacion_id === publicacionId).sort((a, b) => b.numero - a.numero).map((v) => ({ ...v }))
}

export async function listarEventos(publicacionId) {
  return eventos.filter((e) => e.publicacion_id === publicacionId).sort((a, b) => b.id - a.id).map((e) => ({ ...e }))
}

export async function urlArchivoAdmin(storagePath) {
  return blobUrls.get(storagePath) ?? null
}

export async function obtenerPublicacionPublica(slug) {
  const p = publicaciones.find((x) => x.slug === slug && x.estado === 'publicado')
  const v = p && versiones.find((x) => x.id === p.version_actual_id)
  if (!p || !v) return null
  return {
    slug: p.slug, titulo: p.titulo, descripcion: p.descripcion, fecha_documento: p.fecha_documento, categoria: p.categoria,
    published_at: p.published_at, version_numero: v.numero, mime_type: v.mime_type, extension: v.extension,
    size_bytes: v.size_bytes, storage_path: v.storage_path,
  }
}

export async function urlArchivoPublico(storagePath) {
  return blobUrls.get(storagePath) ?? null
}
