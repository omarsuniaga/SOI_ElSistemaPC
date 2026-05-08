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
  return {
    ...a,
    id: a.id,
    nombre: a.nombre_completo ?? '',
    email: a.correo_representante ?? '',
    instrumento: a.instrumento_principal ?? '',
    telefono: a.familiar_telefono ?? '',
    is_active: a.activo ?? true,
    cedula: a.representante_cedula ?? '',
    contacto_emergencia_nombre: a.contacto_emergencia_nombre ?? '',
    contacto_emergencia_telefono: a.contacto_emergencia_telefono ?? '',
    contacto_emergencia_parentesco: a.contacto_emergencia_parentesco ?? '',
    familiar_nombre: a.familiar_nombre ?? '',
    familiar_telefono: a.familiar_telefono ?? '',
    familiar_parentesco: a.familiar_parentesco ?? '',
    condiciones_medicas: a.condiciones_medicas ?? '',
    alergias: a.alergias ?? '',
    medicamentos: a.medicamentos ?? '',
  }
}

export async function obtenerAlumnos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .order('nombre_completo', { ascending: true })

  if (error) {
    console.error('Error cargando alumnos:', error.message)
    throw new Error('No se pudieron cargar los alumnos')
  }

  return data.map(normalizeAlumno)
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
    representante_cedula: (alumno.cedula || '').trim() || null,
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

  if (actualizaciones.nombre !== undefined) datosActualizacion.nombre_completo = actualizaciones.nombre.trim()
  if (actualizaciones.nombre_completo !== undefined) datosActualizacion.nombre_completo = actualizaciones.nombre_completo.trim()
  
  if (actualizaciones.email !== undefined) datosActualizacion.correo_representante = actualizaciones.email.trim().toLowerCase()
  if (actualizaciones.instrumento !== undefined) datosActualizacion.instrumento_principal = actualizaciones.instrumento.trim()
  if (actualizaciones.cedula !== undefined) datosActualizacion.representante_cedula = actualizaciones.cedula.trim()
  
  if (actualizaciones.is_active !== undefined) datosActualizacion.activo = actualizaciones.is_active
  if (actualizaciones.activo !== undefined) datosActualizacion.activo = actualizaciones.activo

  if (actualizaciones.telefono !== undefined) datosActualizacion.familiar_telefono = actualizaciones.telefono.trim()
  if (actualizaciones.familiar_telefono !== undefined) datosActualizacion.familiar_telefono = actualizaciones.familiar_telefono.trim()

  if (actualizaciones.familiar_nombre !== undefined) datosActualizacion.familiar_nombre = actualizaciones.familiar_nombre.trim()
  if (actualizaciones.familiar_parentesco !== undefined) datosActualizacion.familiar_parentesco = actualizaciones.familiar_parentesco.trim()

  if (actualizaciones.contacto_emergencia_nombre !== undefined) datosActualizacion.contacto_emergencia_nombre = actualizaciones.contacto_emergencia_nombre.trim()
  if (actualizaciones.contacto_emergencia_telefono !== undefined) datosActualizacion.contacto_emergencia_telefono = actualizaciones.contacto_emergencia_telefono.trim()
  if (actualizaciones.contacto_emergencia_parentesco !== undefined) datosActualizacion.contacto_emergencia_parentesco = actualizaciones.contacto_emergencia_parentesco.trim()

  if (actualizaciones.condiciones_medicas !== undefined) datosActualizacion.condiciones_medicas = actualizaciones.condiciones_medicas.trim()
  if (actualizaciones.alergias !== undefined) datosActualizacion.alergias = actualizaciones.alergias.trim()
  if (actualizaciones.medicamentos !== undefined) datosActualizacion.medicamentos = actualizaciones.medicamentos.trim()

  const { data, error } = await supabase
    .from('alumnos')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando alumno:', error.message)
    throw new Error('No se pudo actualizar el alumno')
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