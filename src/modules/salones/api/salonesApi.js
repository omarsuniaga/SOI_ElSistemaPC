import { supabase } from '../../../lib/supabaseClient.js'

function normalizeSalon(s) {
  if (!s) return null
  return {
    ...s,
    nombre: s.nombre ?? s.name ?? '',
    codigo: s.codigo_salon ?? '', // Mapeo para la UI
    ubicacion: s.ubicacion ?? s.location ?? '',
    condicion: s.condicion_fisica ?? 'buena', // Mapeo para la UI (usado en salonesView)
    is_active: s.is_active ?? s.isActive ?? s.activo ?? true,
    capacidad: parseInt(s.capacidad) || 20,
    piso: s.piso !== undefined && s.piso !== null ? parseInt(s.piso) : null,
    equipamiento: Array.isArray(s.equipamiento) ? s.equipamiento.join(', ') : (s.equipamiento || ''),
    descripcion: s.descripcion || ''
  }
}

export async function obtenerSalones() {
  const { data, error } = await supabase
    .from('salones')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error cargando salones:', error.message)
    throw new Error('No se pudieron cargar los salones')
  }

  return data.map(normalizeSalon)
}

export async function obtenerSalon(id) {
  const { data, error } = await supabase
    .from('salones')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando salon:', error.message)
    throw new Error('Salon no encontrado')
  }

  return data
}

export async function crearSalon(salon) {
  const nombre = (salon.nombre || '').trim()
  const codigo = (salon.codigo_salon || '').trim()

  if (!nombre) throw new Error('El nombre es obligatorio')

  // 1. Validar duplicados antes de intentar insertar (Mejor UX)
  const { data: existente, error: errCheck } = await supabase
    .from('salones')
    .select('id, nombre, codigo_salon')
    .or(`nombre.eq."${nombre}", codigo_salon.eq."${codigo}"`)
    .maybeSingle()

  if (errCheck) console.error('Error validando duplicados:', errCheck)
  if (existente) {
    if (existente.nombre.toLowerCase() === nombre.toLowerCase()) {
      throw new Error('Ya existe un salón con ese nombre')
    }
    if (codigo && existente.codigo_salon?.toLowerCase() === codigo.toLowerCase()) {
      throw new Error('Ya existe un salón con ese código')
    }
  }

  const datosLimpios = {
    nombre: nombre,
    codigo_salon: codigo || undefined, // Si es undefined, Supabase usa el DEFAULT
    capacidad: parseInt(salon.capacidad) || 20,
    ubicacion: (salon.ubicacion || '').trim(),
    piso: salon.piso !== undefined ? parseInt(salon.piso) : null,
    condicion_fisica: salon.condicion_fisica || 'buena',
    equipamiento: typeof salon.equipamiento === 'string' 
      ? salon.equipamiento.split(',').map(item => item.trim()).filter(Boolean)
      : (Array.isArray(salon.equipamiento) ? salon.equipamiento : []),
    descripcion: (salon.descripcion || '').trim(),
    is_active: salon.is_active !== undefined ? salon.is_active : true,
    responsable_id: salon.responsable_id || null
  }

  const { data, error } = await supabase
    .from('salones')
    .insert([datosLimpios])
    .select()

  if (error) {
    if (error.code === '23505') {
      throw new Error('El nombre o código del salón ya está registrado')
    }
    console.error('Error creando salon:', error.message)
    throw new Error('No se pudo crear el salon')
  }

  return data[0]
}

export async function actualizarSalon(id, actualizaciones) {
  const nombre = (actualizaciones.nombre || '').trim()
  const codigo = (actualizaciones.codigo_salon || '').trim()

  // 1. Validar duplicados si se está cambiando el nombre o código
  if (nombre || codigo) {
    const { data: existentes } = await supabase
      .from('salones')
      .select('id, nombre, codigo_salon')
      .neq('id', id)
    
    if (existentes) {
      if (nombre) {
        const mismoNombre = existentes.find(s => s.nombre.toLowerCase() === nombre.toLowerCase())
        if (mismoNombre) throw new Error('Ya existe otro salón con ese nombre')
      }
      if (codigo) {
        const mismoCodigo = existentes.find(s => s.codigo_salon?.toLowerCase() === codigo.toLowerCase())
        if (mismoCodigo) throw new Error('Ya existe otro salón con ese código')
      }
    }
  }

  const datosActualizacion = { ...actualizaciones }
  if (nombre) datosActualizacion.nombre = nombre
  if (codigo) datosActualizacion.codigo_salon = codigo
  
  if (datosActualizacion.capacidad) datosActualizacion.capacidad = parseInt(datosActualizacion.capacidad)
  if (datosActualizacion.piso !== undefined) datosActualizacion.piso = parseInt(datosActualizacion.piso)

  if (datosActualizacion.equipamiento !== undefined) {
    datosActualizacion.equipamiento = typeof datosActualizacion.equipamiento === 'string'
      ? datosActualizacion.equipamiento.split(',').map(item => item.trim()).filter(Boolean)
      : (Array.isArray(datosActualizacion.equipamiento) ? datosActualizacion.equipamiento : [])
  }

  datosActualizacion.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('salones')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    if (error.code === '23505') {
      throw new Error('El nombre o código del salón ya está registrado')
    }
    console.error('Error actualizando salon:', error.message)
    throw new Error('No se pudo actualizar el salon')
  }

  return data[0]
}

export async function eliminarSalon(id) {
  // Eliminación lógica (soft delete) según el plan
  const { error } = await supabase
    .from('salones')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error eliminando salon:', error.message)
    throw new Error('No se pudo inactivar el salon')
  }
}

export async function obtenerSalonesActivos() {
  const { data, error } = await supabase
    .from('salones')
    .select('*')
    .eq('is_active', true)
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error cargando salones activos:', error.message)
    throw new Error('No se pudieron cargar los salones')
  }

  return data.map(normalizeSalon)
}
