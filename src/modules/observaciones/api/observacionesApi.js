import { supabase } from '../../../lib/supabaseClient.js'
import { Observacion } from '../models/observacion.model.js'
import { OBSERVACION_TIPOS } from '../../_shared/evaluacion-constants.js'

/**
 * Normaliza los datos de la base de datos a instancias del modelo
 */
function normalize(data) {
  if (!data) return null
  if (Array.isArray(data)) return data.map(o => new Observacion(o))
  return new Observacion(data)
}

/**
 * Translate a Supabase RLS error into a structured RLS_DENIED error.
 */
function handleWriteError(error) {
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    const e = new Error('No tienes permiso para esta operación (evaluacion:write).')
    e.code = 'RLS_DENIED'
    throw e
  }
  throw error
}

/**
 * Build a structured VALIDATION error from model errors.
 */
function buildValidationError(errores) {
  const e = new Error(errores[0])
  e.code = 'VALIDATION'
  e.errors = errores
  e.validTipos = Array.from(OBSERVACION_TIPOS)
  return e
}

export async function obtenerObservaciones() {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select(`
      *,
      alumno:alumnos(nombre_completo),
      maestro:maestros(nombre_completo)
    `)
    .order('fecha_observacion', { ascending: false })

  if (error) {
    console.error('Error cargando observaciones:', error.message)
    throw new Error('No se pudieron cargar las observaciones')
  }

  return data.map(o => {
    const model = new Observacion(o)
    model.alumno_nombre = o.alumno?.nombre_completo || 'Desconocido'
    model.maestro_nombre = o.maestro?.nombre_completo || 'N/A'
    return model
  })
}

export async function obtenerObservacion(id) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('*, alumno:alumnos(nombre_completo)')
    .eq('id', id)
    .single()

  if (error) throw new Error('Observación no encontrada')

  const model = new Observacion(data)
  model.alumno_nombre = data.alumno?.nombre_completo || 'Desconocido'
  return model
}

export async function crearObservacion(obsData) {
  const model = new Observacion(obsData)
  const errores = model.validate()
  if (errores.length > 0) throw buildValidationError(errores)

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .insert([model.toJSON()])
    .select()

  if (error) handleWriteError(error)
  return normalize(data[0])
}

export async function actualizarObservacion(id, actualizaciones) {
  const { data: original } = await supabase.from('observaciones_alumnos').select('*').eq('id', id).single()
  const model = new Observacion({ ...original, ...actualizaciones })

  const errores = model.validate()
  if (errores.length > 0) throw buildValidationError(errores)

  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update(model.toJSON())
    .eq('id', id)
    .select()

  if (error) handleWriteError(error)
  return normalize(data[0])
}

export async function eliminarObservacion(id) {
  const { error } = await supabase.from('observaciones_alumnos').delete().eq('id', id)
  if (error) handleWriteError(error)
}

export async function agregarSeguimiento(id, observacionSeguimiento) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update({
      seguimiento_observacion: observacionSeguimiento.trim(),
      seguimiento_fecha: new Date().toISOString().split('T')[0],
      estado: 'seguimiento',
      requiere_seguimiento: true,
    })
    .eq('id', id)
    .select()

  if (error) handleWriteError(error)
  return normalize(data[0])
}

export async function resolverObservacion(id) {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .update({
      estado: 'resuelta',
      requiere_seguimiento: false,
    })
    .eq('id', id)
    .select()

  if (error) handleWriteError(error)
  return normalize(data[0])
}

export async function getEstadisticas() {
  const { data, error } = await supabase
    .from('observaciones_alumnos')
    .select('estado, prioridad, tipo')

  if (error) throw error

  return {
    total: data.length,
    abiertas: data.filter(o => o.estado === 'abierta').length,
    seguimiento: data.filter(o => o.estado === 'seguimiento').length,
    altas: data.filter(o => o.prioridad === 'alta').length,
    porTipo: data.reduce((acc, o) => {
      acc[o.tipo] = (acc[o.tipo] || 0) + 1
      return acc
    }, {}),
  }
}
