/**
 * acuerdosApi.js
 * Servicio de Gestión de Acuerdos de Maestros (Franja de Asistencia Compartida / Inter-Cátedra)
 */

import { supabase } from '../../../lib/supabaseClient.js'

const STORAGE_KEY = 'soi_acuerdos_maestros_v1'

/**
 * Obtiene todos los acuerdos de maestros activos
 * @returns {Array} Lista de acuerdos
 */
export function obtenerAcuerdosMaestros() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('[acuerdosApi] Error leyendo acuerdos:', err)
    return []
  }
}

/**
 * Guarda o actualiza un acuerdo de maestros
 * @param {Object} acuerdoData
 * @returns {Object} Acuerdo guardado
 */
export async function guardarAcuerdoMaestro(acuerdoData) {
  const acuerdos = obtenerAcuerdosMaestros()
  
  const id = acuerdoData.id || `acuerdo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const nuevoAcuerdo = {
    id,
    alumno_id: acuerdoData.alumno_id,
    alumno_nombre: acuerdoData.alumno_nombre || 'Estudiante',
    clase_origen_id: acuerdoData.clase_origen_id,
    clase_origen_nombre: acuerdoData.clase_origen_nombre,
    maestro_origen_id: acuerdoData.maestro_origen_id,
    maestro_origen_nombre: acuerdoData.maestro_origen_nombre,
    clase_destino_id: acuerdoData.clase_destino_id,
    clase_destino_nombre: acuerdoData.clase_destino_nombre,
    maestro_destino_id: acuerdoData.maestro_destino_id,
    maestro_destino_nombre: acuerdoData.maestro_destino_nombre,
    dia: acuerdoData.dia || 'Lunes',
    hora_transicion: acuerdoData.hora_transicion || '16:00',
    motivo: acuerdoData.motivo || 'Acuerdo de asistencia compartida inter-cátedra.',
    activo: true,
    created_at: new Date().toISOString(),
  }

  // Filtrar si ya existía un acuerdo previo entre ese alumno y esas dos clases
  const filtrados = acuerdos.filter(a => !(
    a.alumno_id === nuevoAcuerdo.alumno_id &&
    ((a.clase_origen_id === nuevoAcuerdo.clase_origen_id && a.clase_destino_id === nuevoAcuerdo.clase_destino_id) ||
     (a.clase_origen_id === nuevoAcuerdo.clase_destino_id && a.clase_destino_id === nuevoAcuerdo.clase_origen_id))
  ))

  filtrados.push(nuevoAcuerdo)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados))

  // Persistir en Supabase en las clases involucradas para mantener consistencia institucional
  try {
    const nota = `Acuerdo inter-cátedra validado para ${nuevoAcuerdo.alumno_nombre} (${nuevoAcuerdo.clase_origen_nombre} ➔ ${nuevoAcuerdo.clase_destino_nombre} a las ${nuevoAcuerdo.hora_transicion}).`
    await Promise.all([
      supabase.from('clases').update({
        necesita_revision: false,
        revision_motivo: nota,
      }).eq('id', nuevoAcuerdo.clase_origen_id),
      supabase.from('clases').update({
        necesita_revision: false,
        revision_motivo: nota,
      }).eq('id', nuevoAcuerdo.clase_destino_id)
    ])
  } catch (dbErr) {
    console.warn('[acuerdosApi] No se pudo sincronizar nota en Supabase:', dbErr)
  }

  return nuevoAcuerdo
}

/**
 * Elimina un acuerdo existente
 * @param {string} acuerdoId 
 */
export function eliminarAcuerdoMaestro(acuerdoId) {
  const acuerdos = obtenerAcuerdosMaestros()
  const filtrados = acuerdos.filter(a => a.id !== acuerdoId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados))
}
