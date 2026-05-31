/**
 * MIGRACIÓN SQL PARA LA TABLA 'postulantes'
 *
 * Si ejecutas esto en la consola SQL de Supabase:
 *
 * -- 1. Agregar las nuevas columnas de seguimiento y estado
 * ALTER TABLE postulantes
 * ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'postulado'
 *   CHECK (estado IN (
 *     'postulado', 'contactado', 'cita_agendada', 'documentos_ok',
 *     'inscrito', 'no_show', 'reprogramado', 'en_espera', 'descartado'
 *   )),
 * ADD COLUMN IF NOT EXISTS fecha_contacto TIMESTAMPTZ,
 * ADD COLUMN IF NOT EXISTS fecha_cita TIMESTAMPTZ,
 * ADD COLUMN IF NOT EXISTS notas_seguimiento TEXT,
 * ADD COLUMN IF NOT EXISTS alumno_id UUID REFERENCES alumnos(id);
 *
 * -- 2. Crear índices para optimizar búsquedas por mes y citas
 * CREATE INDEX IF NOT EXISTS idx_postulantes_created_at ON postulantes(created_at);
 * CREATE INDEX IF NOT EXISTS idx_postulantes_fecha_cita ON postulantes(fecha_cita);
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { puedeTransicionar } from '../domain/postuladoStateMachine.js'

/**
 * Obtiene un postulante por ID.
 * Helper interno y exportado para coherencia.
 */
export async function obtenerPostulante(id) {
  const { data, error } = await supabase.from('postulantes').select('*').eq('id', id).maybeSingle()

  if (error) {
    console.error('[postuladosSupabase] Error al obtener postulante:', error)
    throw new Error(`Error al obtener postulante: ${error.message}`)
  }
  return data
}

/**
 * Cambia el estado de un postulante y actualiza campos relacionados.
 * @param {string} id
 * @param {string} nuevoEstado
 * @param {object} meta - { fecha_cita?, notas_seguimiento?, alumno_id? }
 */
export async function actualizarEstadoPostulante(id, nuevoEstado, meta = {}) {
  try {
    const postulante = await obtenerPostulante(id)
    if (!postulante) {
      throw new Error(`Postulante con ID ${id} no encontrado`)
    }

    const estadoActual = postulante.estado || 'postulado'

    if (!puedeTransicionar(estadoActual, nuevoEstado)) {
      throw new Error(
        `Transición inválida: No se puede pasar de "${estadoActual}" a "${nuevoEstado}"`,
      )
    }

    const updateData = {
      estado: nuevoEstado,
    }

    // Mapear campos de meta
    if (meta.fecha_cita !== undefined) {
      updateData.fecha_cita = meta.fecha_cita
    }

    if (meta.notas_seguimiento !== undefined) {
      if (postulante.notes || postulante.notas_seguimiento) {
        const notasPrevias = postulante.notas_seguimiento || postulante.notes || ''
        updateData.notas_seguimiento = `${notasPrevias}\n${meta.notas_seguimiento}`.trim()
      } else {
        updateData.notas_seguimiento = meta.notas_seguimiento
      }
    }

    if (meta.alumno_id !== undefined) {
      updateData.alumno_id = meta.alumno_id
    }

    if (nuevoEstado === 'contactado') {
      updateData.fecha_contacto = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('postulantes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[postuladosSupabase] Error en update:', error)
      throw error
    }

    return data
  } catch (err) {
    console.error('[postuladosSupabase] Error al actualizar estado:', err.message)
    throw err
  }
}

/**
 * Lista postulantes filtrados por mes de creación.
 * @param {number} year
 * @param {number} month  (1-12)
 * @returns {Promise<object[]>}
 */
export async function listarPostulantesPorMes(year, month) {
  try {
    // Definir primer día del mes actual y primer día del mes siguiente
    const desde = new Date(year, month - 1, 1).toISOString()
    const hasta = new Date(year, month, 1).toISOString()

    const { data, error } = await supabase
      .from('postulantes')
      .select('*')
      .gte('created_at', desde)
      .lt('created_at', hasta)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[postuladosSupabase] Error al listar por mes:', error)
      throw error
    }

    return data ?? []
  } catch (err) {
    console.error('[postuladosSupabase] Error en listarPostulantesPorMes:', err.message)
    throw err
  }
}

/**
 * Lista postulantes registrados en un rango de fechas, ordenados por fecha descendente.
 * @param {string} desde - ISO date string (ej. '2026-01-01')
 * @param {string} hasta - ISO date string (ej. '2026-06-30')
 * @returns {Promise<object[]>}
 */
export async function listarPostulantesPorRango(desde, hasta) {
  try {
    const { data, error } = await supabase
      .from('postulantes')
      .select('*')
      .gte('created_at', desde)
      .lte('created_at', hasta + 'T23:59:59.999Z')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[postuladosSupabase] Error al listar por rango:', error)
      throw error
    }

    return data ?? []
  } catch (err) {
    console.error('[postuladosSupabase] Error en listarPostulantesPorRango:', err.message)
    throw err
  }
}

/**
 * Lista citas agendadas en un rango de fechas.
 * @param {string} desde  ISO date string
 * @param {string} hasta  ISO date string
 * @returns {Promise<object[]>}
 */
export async function listarCitas(desde, hasta) {
  try {
    const { data, error } = await supabase
      .from('postulantes')
      .select('*')
      .gte('fecha_cita', desde)
      .lte('fecha_cita', hasta)
      .not('fecha_cita', 'is', null)
      .order('fecha_cita', { ascending: true })

    if (error) {
      console.error('[postuladosSupabase] Error al listar citas:', error)
      throw error
    }

    return data ?? []
  } catch (err) {
    console.error('[postuladosSupabase] Error en listarCitas:', err.message)
    throw err
  }
}

/**
 * Verifica si hay conflicto de cita en un slot dado (±30 min).
 * @param {string} fechaHora ISO datetime
 * @param {string} [excludeId] id a excluir de la verificación
 * @returns {Promise<boolean>}
 */
export async function hayConflictoCita(fechaHora, excludeId = null) {
  try {
    const targetTime = new Date(fechaHora).getTime()
    if (isNaN(targetTime)) {
      throw new Error('Fecha/Hora de cita inválida')
    }

    // Rango de ±30 minutos
    const desde = new Date(targetTime - 30 * 60 * 1000).toISOString()
    const hasta = new Date(targetTime + 30 * 60 * 1000).toISOString()

    let query = supabase
      .from('postulantes')
      .select('id, nombre_completo, fecha_cita')
      .gte('fecha_cita', desde)
      .lte('fecha_cita', hasta)
      .not('fecha_cita', 'is', null)

    if (excludeId) {
      query = query.ne('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[postuladosSupabase] Error al verificar conflicto de cita:', error)
      throw error
    }

    return (data ?? []).length > 0
  } catch (err) {
    console.error('[postuladosSupabase] Error en hayConflictoCita:', err.message)
    throw err
  }
}

/**
 * Agrega una nota de seguimiento al postulante.
 */
export async function agregarNota(id, nota) {
  try {
    if (!nota || !nota.trim()) return

    const postulante = await obtenerPostulante(id)
    if (!postulante) {
      throw new Error(`Postulante con ID ${id} no encontrado`)
    }

    const notasPrevias = postulante.notas_seguimiento || postulante.notes || ''
    const nuevasNotas = notasPrevias ? `${notasPrevias}\n${nota}`.trim() : nota.trim()

    const { data, error } = await supabase
      .from('postulantes')
      .update({ notas_seguimiento: nuevasNotas })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[postuladosSupabase] Error al agregar nota:', error)
      throw error
    }

    return data
  } catch (err) {
    console.error('[postuladosSupabase] Error en agregarNota:', err.message)
    throw err
  }
}

/**
 * Elimina permanentemente un postulante de la base de datos.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function eliminarPostulante(id) {
  try {
    const { error } = await supabase.from('postulantes').delete().eq('id', id)

    if (error) {
      console.error('[postuladosSupabase] Error al eliminar postulante:', error)
      throw error
    }

    return true
  } catch (err) {
    console.error('[postuladosSupabase] Error en eliminarPostulante:', err.message)
    throw err
  }
}
