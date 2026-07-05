import { supabase } from '../../../lib/supabaseClient.js'

export const PARENTESCOS = [
  { value: 'madre', label: 'Madre' },
  { value: 'padre', label: 'Padre' },
  { value: 'abuela', label: 'Abuela/Abuelo' },
  { value: 'tia', label: 'Tía/Tío' },
  { value: 'hermana', label: 'Hermana/Hermano' },
  { value: 'tutor', label: 'Tutor Legal' },
  { value: 'otro', label: 'Otro' },
]

export function getParentescoLabel(value) {
  const parentesco = PARENTESCOS.find(p => p.value === value)
  return parentesco ? parentesco.label : value
}

function normalizeAlumno(a) {
  if (!a) return null
  const clasesList = (a.alumnos_clases || [])
    .map(ac => ac.clase?.nombre ?? '')
    .filter(Boolean)
  const clasesStr = clasesList.length > 0 ? clasesList.join(', ') : (a.clases || '')

  return {
    ...a,
    id: a.id,
    nombre: a.nombre_completo ?? '',
    email: a.correo_representante ?? '',
    instrumento: a.instrumento_principal ?? '',
    telefono: a.familiar_telefono ?? '',
    is_active: a.activo ?? true,
    cedula: a.representante_cedula ?? '',
    clases: clasesStr || 'Sin clases',
    contacto_emergencia_nombre: a.contacto_emergencia_nombre ?? '',
    contacto_emergencia_telefono: a.contacto_emergencia_telefono ?? '',
    contacto_emergencia_parentesco: a.contacto_emergencia_parentesco ?? '',
    familiar_nombre: a.familiar_nombre ?? '',
    familiar_telefono: a.familiar_telefono ?? '',
    familiar_parentesco: a.familiar_parentesco ?? '',
    condiciones_medicas: a.condiciones_medicas ?? '',
    alergias: a.alergias ?? '',
    medicamentos: a.medicamentos ?? '',
    // Wizard fields — pass through from DB row (spread above covers them, explicit for clarity)
    sabe_leer: a.sabe_leer ?? false,
    sabe_escribir: a.sabe_escribir ?? false,
    nacionalidad: a.nacionalidad ?? null,
    tiene_pasaporte: a.tiene_pasaporte ?? false,
    como_se_entero: a.como_se_entero ?? null,
    ubicacion_maps_url: a.ubicacion_maps_url ?? null,
    tiene_conocimientos_musicales: a.tiene_conocimientos_musicales ?? false,
    instrumento_previo: a.instrumento_previo ?? null,
    nivel_lectura_musical: a.nivel_lectura_musical ?? null,
    interes_musical: a.interes_musical ?? null,
    instrumento_interes: a.instrumento_interes ?? null,
    iniciacion_musical_requerida: a.iniciacion_musical_requerida ?? false,
    fecha_elegible_audicion: a.fecha_elegible_audicion ?? null,
    fecha_fin_iniciacion: a.fecha_fin_iniciacion ?? null,
    alergias_descripcion: a.alergias_descripcion ?? null,
    tiene_condicion_transmisible: a.tiene_condicion_transmisible ?? false,
    condicion_transmisible_descripcion: a.condicion_transmisible_descripcion ?? null,
    alergia_medicamento: a.alergia_medicamento ?? false,
    alergia_medicamento_descripcion: a.alergia_medicamento_descripcion ?? null,
    impedimento_social: a.impedimento_social ?? false,
    problemas_conducta: a.problemas_conducta ?? 'no',
    centro_estudios: a.centro_estudios ?? null,
    grado_nivel: a.grado_nivel ?? null,
    padres_en_vida: a.padres_en_vida ?? null,
    representante_nombre: a.representante_nombre ?? null,
    representante_parentesco: a.representante_parentesco ?? null,
    representante_tlf: a.representante_tlf ?? null,
    acepta_beca_4500: a.acepta_beca_4500 ?? false,
    acepta_pago_600: a.acepta_pago_600 ?? false,
    fecha_aceptacion_compromisos: a.fecha_aceptacion_compromisos ?? null,
  }
}

export async function obtenerAlumnos({ page = 0, pageSize = 100 } = {}) {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('alumnos')
    .select('*', { count: 'exact' })
    .order('nombre_completo', { ascending: true })
    .range(from, to)

  if (error) {
    console.error('Error cargando alumnos:', error.message)
    throw new Error('No se pudieron cargar los alumnos')
  }

  return { alumnos: (data || []).map(normalizeAlumno), total: count ?? 0 }
}

export async function obtenerAlumno(id) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando alumno:', error.message)
    throw new Error('Alumno no encontrado')
  }

  return normalizeAlumno(data)
}

export async function crearAlumno(alumno) {
  const nombre = (alumno.nombre || alumno.nombre_completo || '').trim()
  if (!nombre) throw new Error('El nombre es obligatorio')

  const datosLimpios = {
    nombre_completo: nombre,
    correo_representante: (alumno.email || '').trim().toLowerCase() || null,
    representante_cedula: (alumno.cedula || alumno.representante_cedula || '').trim() || null,
    instrumento_principal: (alumno.instrumento || '').trim() || null,
    activo: alumno.is_active !== undefined ? alumno.is_active : true,
    familiar_nombre: (alumno.familiar_nombre || '').trim() || null,
    familiar_telefono: (alumno.telefono || alumno.familiar_telefono || '').trim() || null,
    familiar_parentesco: (alumno.familiar_parentesco || '').trim() || null,
    contacto_emergencia_nombre: (alumno.contacto_emergencia_nombre || '').trim() || null,
    contacto_emergencia_telefono: (alumno.contacto_emergencia_telefono || '').trim() || null,
    contacto_emergencia_parentesco: (alumno.contacto_emergencia_parentesco || '').trim() || null,
    condiciones_medicas: (alumno.condiciones_medicas || '').trim() || null,
    alergias: (alumno.alergias || '').trim() || null,
    medicamentos: (alumno.medicamentos || '').trim() || null,
    // ── Step 1 — Datos del Alumno ───────────────────────────────
    sabe_leer: alumno.sabe_leer ?? null,
    sabe_escribir: alumno.sabe_escribir ?? null,
    nacionalidad: alumno.nacionalidad ?? null,
    tiene_pasaporte: alumno.tiene_pasaporte ?? false,
    como_se_entero: alumno.como_se_entero ?? null,
    municipio_residencia: alumno.municipio_residencia ?? null,
    sector_calle_numero: alumno.sector_calle_numero ?? null,
    ubicacion_maps_url: alumno.ubicacion_maps_url ?? null,
    // ── Step 2 — Madre ─────────────────────────────────────────
    madre_nombre: alumno.madre_nombre ?? null,
    madre_cedula: alumno.madre_cedula ?? null,
    madre_tlf_whatsapp: alumno.madre_tlf_whatsapp ?? null,
    // ── Step 3 — Padre ─────────────────────────────────────────
    padre_nombre: alumno.padre_nombre ?? null,
    padre_cedula: alumno.padre_cedula ?? null,
    padre_tlf_whatsapp: alumno.padre_tlf_whatsapp ?? null,
    // ── Step 4 — Representante, Familia y Entorno ──────────────
    representante_nombre: alumno.representante_nombre ?? null,
    representante_parentesco: alumno.representante_parentesco ?? null,
    representante_tlf: alumno.representante_tlf ?? null,
    otro_responsable_nombre: alumno.otro_responsable_nombre ?? null,
    otro_responsable_cedula: alumno.otro_responsable_cedula ?? null,
    otro_responsable_tlf: alumno.otro_responsable_tlf ?? null,
    contacto_emergencia_2_nombre: alumno.contacto_emergencia_2_nombre ?? null,
    contacto_emergencia_2_telefono: alumno.contacto_emergencia_2_telefono ?? null,
    familia_monoparental: alumno.familia_monoparental ?? null,
    beneficiario_subsidio_estado: alumno.beneficiario_subsidio_estado ?? null,
    subsidio_descripcion: alumno.subsidio_descripcion ?? null,
    apoyo_actividades: alumno.apoyo_actividades ?? null,
    // ── Step 5 — Perfil Musical y Motivación ───────────────────
    tiene_conocimientos_musicales: alumno.tiene_conocimientos_musicales ?? null,
    instrumento_previo: alumno.instrumento_previo ?? null,
    nivel_lectura_musical: alumno.nivel_lectura_musical ?? null,
    interes_musical: alumno.interes_musical ?? null,
    instrumento_interes: alumno.instrumento_interes ?? null,
    requiere_iniciacion_musical: alumno.tiene_conocimientos_musicales !== true,
    fecha_ingreso_iniciacion: alumno.tiene_conocimientos_musicales !== true ? new Date().toISOString().slice(0, 10) : null,
    por_que_unirse: alumno.por_que_unirse ?? null,
    sentimiento_musica_clasica: alumno.sentimiento_musica_clasica ?? null,
    sentimiento_aprender_instrumento: alumno.sentimiento_aprender_instrumento ?? null,
    aspiracion_instrumento: alumno.aspiracion_instrumento ?? null,
    musico_favorito: alumno.musico_favorito ?? null,
    preferencia_aprendizaje_musical: alumno.preferencia_aprendizaje_musical ?? null,
    // ── Step 6 — Salud, Conducta y Escolar ─────────────────────
    tiene_alergias: alumno.tiene_alergias ?? null,
    alergias_descripcion: alumno.alergias_descripcion ?? null,
    tiene_condicion_transmisible: alumno.tiene_condicion_transmisible ?? null,
    condicion_transmisible_desc: alumno.condicion_transmisible_desc ?? null,
    tiene_alergia_medicamento: alumno.tiene_alergia_medicamento ?? null,
    alergia_medicamento_desc: alumno.alergia_medicamento_desc ?? null,
    impedimento_social: alumno.impedimento_social ?? null,
    problemas_conducta: alumno.problemas_conducta || null,
    centro_estudios: alumno.centro_estudios ?? null,
    grado_nivel: alumno.grado_nivel ?? null,
    padres_en_vida: alumno.padres_en_vida || null,
    // ── Step 7 — Compromisos y Autorizaciones ──────────────────
    acepta_beca_4500: alumno.acepta_beca_4500 ?? false,
    fecha_aceptacion_beca: alumno.acepta_beca_4500 ? new Date().toISOString() : null,
    acepta_pago_600: alumno.acepta_pago_600 ?? false,
    fecha_aceptacion_pago: alumno.acepta_pago_600 ? new Date().toISOString() : null,
    autoriza_fotos_redes: alumno.autoriza_fotos_redes ?? false,
  }

  const { data, error } = await supabase
    .from('alumnos')
    .insert([datosLimpios])
    .select()

  if (error) {
    console.error('Error creando alumno:', error.message)
    throw new Error('No se pudo crear el alumno')
  }

  return normalizeAlumno(data[0])
}

export async function actualizarAlumno(id, actualizaciones) {
  const datosActualizacion = {}

  if (actualizaciones.nombre !== undefined) datosActualizacion.nombre_completo = actualizaciones.nombre ? actualizaciones.nombre.trim() : actualizaciones.nombre
  if (actualizaciones.nombre_completo !== undefined) datosActualizacion.nombre_completo = actualizaciones.nombre_completo ? actualizaciones.nombre_completo.trim() : actualizaciones.nombre_completo

  if (actualizaciones.email !== undefined) datosActualizacion.correo_representante = actualizaciones.email ? actualizaciones.email.trim().toLowerCase() : actualizaciones.email
  if (actualizaciones.instrumento !== undefined) datosActualizacion.instrumento_principal = actualizaciones.instrumento ? actualizaciones.instrumento.trim() : actualizaciones.instrumento
  if (actualizaciones.cedula !== undefined) datosActualizacion.representante_cedula = actualizaciones.cedula ? actualizaciones.cedula.trim() : actualizaciones.cedula

  if (actualizaciones.is_active !== undefined) datosActualizacion.activo = actualizaciones.is_active
  if (actualizaciones.activo !== undefined) datosActualizacion.activo = actualizaciones.activo

  if (actualizaciones.telefono !== undefined) datosActualizacion.familiar_telefono = actualizaciones.telefono ? actualizaciones.telefono.trim() : actualizaciones.telefono
  if (actualizaciones.familiar_telefono !== undefined) datosActualizacion.familiar_telefono = actualizaciones.familiar_telefono ? actualizaciones.familiar_telefono.trim() : actualizaciones.familiar_telefono

  if (actualizaciones.familiar_nombre !== undefined) datosActualizacion.familiar_nombre = actualizaciones.familiar_nombre ? actualizaciones.familiar_nombre.trim() : actualizaciones.familiar_nombre
  if (actualizaciones.familiar_parentesco !== undefined) datosActualizacion.familiar_parentesco = actualizaciones.familiar_parentesco ? actualizaciones.familiar_parentesco.trim() : actualizaciones.familiar_parentesco

  if (actualizaciones.contacto_emergencia_nombre !== undefined) datosActualizacion.contacto_emergencia_nombre = actualizaciones.contacto_emergencia_nombre ? actualizaciones.contacto_emergencia_nombre.trim() : actualizaciones.contacto_emergencia_nombre
  if (actualizaciones.contacto_emergencia_telefono !== undefined) datosActualizacion.contacto_emergencia_telefono = actualizaciones.contacto_emergencia_telefono ? actualizaciones.contacto_emergencia_telefono.trim() : actualizaciones.contacto_emergencia_telefono
  if (actualizaciones.contacto_emergencia_parentesco !== undefined) datosActualizacion.contacto_emergencia_parentesco = actualizaciones.contacto_emergencia_parentesco ? actualizaciones.contacto_emergencia_parentesco.trim() : actualizaciones.contacto_emergencia_parentesco

  if (actualizaciones.condiciones_medicas !== undefined) datosActualizacion.condiciones_medicas = actualizaciones.condiciones_medicas ? actualizaciones.condiciones_medicas.trim() : actualizaciones.condiciones_medicas
  if (actualizaciones.alergias !== undefined) datosActualizacion.alergias = actualizaciones.alergias ? actualizaciones.alergias.trim() : actualizaciones.alergias
  if (actualizaciones.medicamentos !== undefined) datosActualizacion.medicamentos = actualizaciones.medicamentos ? actualizaciones.medicamentos.trim() : actualizaciones.medicamentos

  const { data, error } = await supabase
    .from('alumnos')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando alumno:', error)
    // Detectar si es un error de RLS
    if (error.code === 'PGRST201' || error.message?.includes('row-level security')) {
      throw new Error('No tienes permisos para actualizar este alumno. Contacta al administrador.')
    }
    throw new Error(`No se pudo actualizar el alumno: ${error.message || 'Error desconocido'}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Alumno no encontrado tras actualizar')
  }

  return normalizeAlumno(data[0])
}

export async function eliminarAlumno(id) {
  const { error } = await supabase.from('alumnos').delete().eq('id', id)
  if (error) {
    console.error('Error eliminando alumno:', error.message)
    throw new Error('No se pudo eliminar el alumno')
  }
}

export async function validarEmail(email) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('id')
    .eq('correo_representante', email.trim().toLowerCase())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error validando email:', error.message)
  }

  return !!data
}

export async function validarCedula(cedula) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('id')
    .eq('representante_cedula', cedula.trim())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error validando cédula:', error.message)
  }

  return !!data
}

export async function obtenerAlumnosActivos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('activo', true)
    .order('nombre_completo', { ascending: true })

  if (error) throw new Error('No se pudieron cargar los alumnos')
  return data.map(normalizeAlumno)
}

export async function obtenerInscripcionesAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .select('clase_id, clase:clases(nombre)')
    .eq('alumno_id', alumnoId)

  if (error) {
    console.error('Error cargando inscripciones de alumno:', error.message)
    throw new Error('No se pudieron cargar las clases del alumno')
  }

  return (data || []).map(row => ({
    clase_id: row.clase_id,
    clase_nombre: row.clase?.nombre ?? 'Clase sin nombre'
  }))
}

/**
 * Obtiene los alumnos inscritos en un mes/año específico.
 * @param {number} year
 * @param {number} month  1-based (1=enero, 12=diciembre)
 * @returns {Promise<object[]>}
 */
export async function obtenerAlumnosPorMes(year, month) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .gte('created_at', `${start}T00:00:00`)
    .lte('created_at', `${end}T23:59:59`)
    .order('created_at', { ascending: true })

  if (error) throw new Error('No se pudieron cargar los alumnos del mes')
  return data.map(normalizeAlumno)
}

/**
 * Consulta la tabla de estudiantes (alumnos) en Supabase con filtros y ordenamiento opcionales.
 * 
 * @param {object} params
 * @param {string} [params.id_clase] - ID de la clase para filtrar inscripciones.
 * @param {string} [params.instrumento] - Instrumento principal para filtrar.
 * @param {boolean} [params.ordenEdadAsc] - true para ordenar por edad de forma ascendente (más joven a más viejo, o sea, fecha_nacimiento desc).
 * @param {boolean} [params.ordenInstrumentoAsc] - true para ordenar instrumento A-Z.
 * @returns {Promise<object[]>} Lista de alumnos normalizados.
 */
export async function obtenerAlumnosFiltradosYOrdenados({
  id_clase,
  instrumento,
  ordenEdadAsc,
  ordenInstrumentoAsc,
  soloActivos = true
} = {}) {
  let query = supabase.from('alumnos')

  if (id_clase) {
    // Para filtrar por clase, hacemos un inner join con la tabla alumnos_clases (renombrada para evitar conflictos)
    query = query
      .select('*, enrolled_class:alumnos_clases!inner(clase_id), alumnos_clases(clase:clases(nombre))')
      .eq('enrolled_class.clase_id', id_clase)
  } else {
    query = query.select('*, alumnos_clases(clase:clases(nombre))')
  }

  // Filtro de alumnos activos
  if (soloActivos) {
    query = query.eq('activo', true)
  }

  // Filtro por instrumento principal
  if (instrumento) {
    query = query.eq('instrumento_principal', instrumento)
  }

  // Ordenamiento por instrumento
  if (ordenInstrumentoAsc !== undefined) {
    query = query.order('instrumento_principal', { ascending: ordenInstrumentoAsc })
  }

  // Ordenamiento por edad / fecha_nacimiento
  // NOTA: Edad ascendente = más jóvenes primero = fecha_nacimiento de más nueva a más vieja (descendente)
  // Edad descendente = más viejos primero = fecha_nacimiento de más vieja a más nueva (ascendente)
  if (ordenEdadAsc !== undefined) {
    const ascendingBirth = !ordenEdadAsc
    query = query.order('fecha_nacimiento', { ascending: ascendingBirth })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error al obtener alumnos filtrados y ordenados:', error.message)
    throw new Error('No se pudieron obtener los alumnos con los filtros especificados')
  }

  return data.map(normalizeAlumno)
}