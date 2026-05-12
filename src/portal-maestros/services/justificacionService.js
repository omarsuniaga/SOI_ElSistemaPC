/**
 * JustificacionService
 * Maneja guardado y recuperación de justificaciones de ausencias de alumnos
 */

import { supabase } from '../../lib/supabaseClient.js'

const BUCKET_DOCUMENTOS = 'documentos' // TODO: change to private bucket + RLS policies (security)

/**
 * Sube un archivo al bucket 'documentos' de Supabase Storage
 * @param {File} file
 * @param {string} folder - subcarpeta dentro del bucket (ej: 'justificaciones')
 * @returns {Promise<string>} URL pública del archivo
 */
async function uploadEvidencia(file, folder = 'justificaciones') {
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const path = `${folder}/${filename}`

  const { data, error } = await supabase.storage
    .from(BUCKET_DOCUMENTOS)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(BUCKET_DOCUMENTOS)
    .getPublicUrl(path)

  return urlData.publicUrl
}

/**
 * Elimina un archivo de evidencia del storage
 * @param {string} publicUrl
 */
async function deleteEvidencia(publicUrl) {
  if (!publicUrl) return
  // Extraer la ruta relativa del bucket desde la URL pública
  // ej: https://xxx.supabase.co/storage/v1/object/public/documentos/justificaciones/archivo.jpg
  // → justificaciones/archivo.jpg
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
  if (!match) return
  const path = match[1]
  await supabase.storage.from(BUCKET_DOCUMENTOS).remove([path])
}

/**
 * Guarda o actualiza una justificación
 * @param {Object} data - Datos de la justificación
 * @param {File|null} evidenciaFile - Archivo de evidencia (opcional)
 * @returns {Promise<Object>}
 */
export async function guardarJustificacion({ sesionId, alumnoId, claseId, fecha, motivo, evidenciaBase64, creadoPor }, evidenciaFile = null) {
  if (!sesionId || !alumnoId || !claseId || !fecha || !motivo) {
    return { error: { message: 'Faltan campos requeridos' } };
  }

  let evidenciaUrl = null

  // Si hay archivo nuevo, subir a Storage
  if (evidenciaFile) {
    try {
      evidenciaUrl = await uploadEvidencia(evidenciaFile)
    } catch (err) {
      console.warn('[JustificacionService] Error subiendo evidencia a Storage:', err)
      // Continuar sin evidencia en vez de fallar todo
    }
  }

  const payload = {
    sesion_id: sesionId,
    alumno_id: alumnoId,
    clase_id: claseId,
    fecha,
    motivo,
    evidencia_url: evidenciaUrl || null,
    evidencia_base64: null, // Ya no se usa, se migra a Storage
    creado_por: creadoPor,
    estado: 'pendiente',
  };

  // Upsert: inserta o actualiza si ya existe
  const { data, error } = await supabase
    .from('justificaciones')
    .upsert([payload], {
      onConflict: 'sesion_id,alumno_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Obtiene la justificación de un alumno en una sesión
 * @param {string} sesionId
 * @param {string} alumnoId
 * @returns {Promise<Object|null>}
 */
export async function obtenerJustificacion(sesionId, alumnoId) {
  if (!sesionId || !alumnoId) return null;

  const { data, error } = await supabase
    .from('justificaciones')
    .select('*')
    .eq('sesion_id', sesionId)
    .eq('alumno_id', alumnoId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.warn('[JustificacionService] Error obteniendo justificación:', error);
    return null;
  }

  return data || null;
}

/**
 * Obtiene todas las justificaciones de una sesión
 * @param {string} sesionId
 * @returns {Promise<Array>}
 */
export async function obtenerJustificacionesSesion(sesionId) {
  if (!sesionId) return [];

  const { data, error } = await supabase
    .from('justificaciones')
    .select('*')
    .eq('sesion_id', sesionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[JustificacionService] Error obteniendo justificaciones:', error);
    return [];
  }

  return data || [];
}

/**
 * Elimina una justificación
 * @param {string} justificacionId
 * @returns {Promise<Object>}
 */
export async function eliminarJustificacion(justificacionId) {
  if (!justificacionId) return { error: { message: 'ID requerido' } };

  const { error } = await supabase
    .from('justificaciones')
    .delete()
    .eq('id', justificacionId);

  return { error };
}