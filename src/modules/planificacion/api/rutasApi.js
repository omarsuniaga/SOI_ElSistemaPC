import { supabase } from '../../../lib/supabaseClient.js'
import { Ruta } from '../models/ruta.model.js'

/**
 * Crear una nueva ruta SOI o variante
 * @param {Object} data — { instrumento, nivel, nombre, tipo, estado, duracion_semanas, objetivos: [{descripcion, semana_inicio, semana_fin, orden}, ...], creada_por, ruta_base_id? }
 * @returns {Object} ruta con objetivos
 */
export async function crearRuta(data) {
  const ruta = new Ruta(data)
  const errors = ruta.validate()
  if (errors.length > 0) throw new Error(`Validación fallida: ${errors.join(', ')}`)

  const { data: rutaRecord, error: rutaError } = await supabase
    .from('rutas_contenido')
    .insert({
      instrumento: data.instrumento,
      nivel: data.nivel,
      nombre: data.nombre,
      tipo: data.tipo,
      estado: data.estado,
      descripcion: data.descripcion,
      ruta_base_id: data.ruta_base_id,
      duracion_semanas: data.duracion_semanas,
      creada_por: data.creada_por
    })
    .select()
    .single()

  if (rutaError) throw rutaError

  // Insert objetivos
  const objetivosToInsert = data.objetivos.map((obj, i) => ({
    ruta_id: rutaRecord.id,
    descripcion: obj.descripcion,
    semana_inicio: obj.semana_inicio,
    semana_fin: obj.semana_fin,
    orden: obj.orden || i + 1,
    objetivo_id: obj.objetivo_id || null
  }))

  const { data: objetivosRecords, error: objError } = await supabase
    .from('ruta_contenido_objetivos')
    .insert(objetivosToInsert)
    .select()

  if (objError) throw objError

  return {
    ...rutaRecord,
    objetivos: objetivosRecords
  }
}

/**
 * Obtener una ruta por ID con sus objetivos
 */
export async function obtenerRuta(rutaId) {
  const { data: ruta, error: rutaError } = await supabase
    .from('rutas_contenido')
    .select('*')
    .eq('id', rutaId)
    .single()

  if (rutaError) throw rutaError

  const { data: objetivos, error: objError } = await supabase
    .from('ruta_contenido_objetivos')
    .select('*')
    .eq('ruta_id', rutaId)
    .order('orden', { ascending: true })

  if (objError) throw objError

  return {
    ...ruta,
    objetivos
  }
}

/**
 * Listar rutas (filtrable por instrumento, nivel, estado, tipo)
 */
export async function listarRutas(filters = {}) {
  let query = supabase.from('rutas_contenido').select('*')

  if (filters.instrumento) query = query.eq('instrumento', filters.instrumento)
  if (filters.nivel) query = query.eq('nivel', filters.nivel)
  if (filters.estado) query = query.eq('estado', filters.estado)
  if (filters.tipo) query = query.eq('tipo', filters.tipo)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Actualizar una ruta (nombre, descripción, etc.)
 */
export async function actualizarRuta(rutaId, updates) {
  const { data, error } = await supabase
    .from('rutas_contenido')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', rutaId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Obtener progreso de una clase contra su ruta
 * @param {UUID} claseId
 * @returns {Object} { semana_actual, objetivos_cubiertos, total_objetivos, alumnos: [{nombre, cobertura: [...]}] }
 */
export async function obtenerProgresoRuta(claseId) {
  // Get clase + ruta
  const { data: clase, error: claseError } = await supabase
    .from('clases')
    .select('*, rutas_contenido(id, duracion_semanas, nombre)')
    .eq('id', claseId)
    .single()

  if (claseError) throw claseError
  if (!clase.rutas_contenido) throw new Error('Clase sin ruta asignada')

  const ruta = clase.rutas_contenido
  const duracionSemanas = ruta.duracion_semanas

  // Calculate semana_actual
  const fechaInicio = new Date(clase.fecha_inicio || clase.created_at)
  const hoy = new Date()
  const diffDays = (hoy - fechaInicio) / (1000 * 60 * 60 * 24)
  const semanaActual = Math.ceil(diffDays / 7)

  // Get ruta objetivos
  const { data: objetivos, error: objError } = await supabase
    .from('ruta_contenido_objetivos')
    .select('*')
    .eq('ruta_id', ruta.id)
    .order('orden', { ascending: true })

  if (objError) throw objError

  // Get cobertura for all students
  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre')
    .eq('clase_id', claseId)

  const { data: cobertura } = await supabase
    .from('cobertura_alumno_objetivo')
    .select('alumno_id, objetivo_id, confirmado')
    .eq('clase_id', claseId)

  const coberturaMap = new Map()
  cobertura?.forEach(c => {
    const key = `${c.alumno_id}:${c.objetivo_id}`
    coberturaMap.set(key, c.confirmado)
  })

  // Build response
  const alumnosConCobertura = alumnos?.map(alumno => ({
    alumno_id: alumno.id,
    nombre: alumno.nombre,
    cobertura: objetivos.map(obj => ({
      objetivo_id: obj.id,
      descripcion: obj.descripcion,
      semana_inicio: obj.semana_inicio,
      semana_fin: obj.semana_fin,
      confirmado: coberturaMap.get(`${alumno.id}:${obj.objetivo_id}`) || false
    }))
  })) || []

  const totalObjetivos = objetivos.length
  const objetivosCubiertos = Array.from(coberturaMap.values()).filter(Boolean).length

  return {
    ruta_nombre: ruta.nombre,
    semana_actual: Math.max(1, semanaActual),
    duracion_semanas: duracionSemanas,
    objetivos_cubiertos: objetivosCubiertos,
    total_objetivos: totalObjetivos,
    alumnos: alumnosConCobertura
  }
}

/**
 * Listar variantes pendientes de aprobación (admin only)
 */
export async function obtenerVariantesPendientes() {
  const { data, error } = await supabase
    .from('rutas_contenido')
    .select('*, rutas_contenido!ruta_base_id(nombre)')
    .eq('tipo', 'maestro-variante')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Aprobar o rechazar una variante (admin only)
 */
export async function aprobarVariante(rutaId, aprobada, razonRechazo = null) {
  const { data: userData } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('rutas_contenido')
    .update({
      estado: aprobada ? 'aprobada' : 'rechazada',
      aprobada_por: userData?.user?.id,
      fecha_aprobacion: new Date().toISOString(),
      descripcion: !aprobada ? razonRechazo : undefined,
      updated_at: new Date().toISOString()
    })
    .eq('id', rutaId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Proponer una variante (maestro copia + modifica ruta base)
 */
export async function proponerVariante(rutaBaseId, nombreVariante, descripcion, objetivos) {
  // Clone base ruta structure + new objectives
  const rutaBase = await obtenerRuta(rutaBaseId)
  const { data: userData } = await supabase.auth.getUser()

  const variante = await crearRuta({
    instrumento: rutaBase.instrumento,
    nivel: rutaBase.nivel,
    nombre: nombreVariante,
    tipo: 'maestro-variante',
    estado: 'pendiente',
    descripcion: descripcion,
    ruta_base_id: rutaBaseId,
    duracion_semanas: rutaBase.duracion_semanas,
    creada_por: userData?.user?.id,
    objetivos: objetivos
  })

  return variante
}
