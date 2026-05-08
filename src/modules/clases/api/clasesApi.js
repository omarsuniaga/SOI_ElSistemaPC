import { supabase } from '../../../lib/supabaseClient.js'
import { formatHora } from '../utils/clasesUtils.js'

/**
 * Verifica si hay solapamiento de horarios para un salón o maestro específico
 * @param {Object} params Parámetros de verificación
 * @param {string} params.salonId ID del salón
 * @param {string} params.maestroId ID del maestro
 * @param {string} params.dia Día de la semana
 * @param {string} params.horaInicio Hora de inicio (HH:MM)
 * @param {string} params.horaFin Hora de fin (HH:MM)
 * @param {string} params.excludeClaseId ID de la clase a excluir
 * @returns {Promise<Object|null>} El conflicto encontrado o null
 */
async function verificarSolapamiento({ salonId, maestroId, dia, horaInicio, horaFin, excludeClaseId = null }) {
  if (!dia || !horaInicio || !horaFin) return null

  // 1. Verificar solapamiento por SALÓN
  if (salonId) {
    const { data: conflictosSalon, error: errorSalon } = await supabase
      .from('clase_horarios')
      .select('*, clases(nombre)')
      .eq('salon_id', salonId)
      .eq('dia', dia)

    if (!errorSalon && conflictosSalon) {
      for (const h of conflictosSalon) {
        if (excludeClaseId && h.clase_id === excludeClaseId) continue
        if (horaInicio < h.hora_fin && h.hora_inicio < horaFin) {
          return {
            tipo: 'salón',
            clase_nombre: h.clases?.nombre || 'Otra clase',
            detalle: `El salón ya está ocupado por "${h.clases?.nombre}"`,
            horario: `${h.dia} de ${h.hora_inicio} a ${h.hora_fin}`
          }
        }
      }
    }
  }

  // 2. Verificar solapamiento por MAESTRO
  if (maestroId) {
    const { data: conflictosMaestro, error: errorMaestro } = await supabase
      .from('clase_horarios')
      .select('*, clases!inner(nombre, maestro_principal_id)')
      .eq('clases.maestro_principal_id', maestroId)
      .eq('dia', dia)

    if (!errorMaestro && conflictosMaestro) {
      for (const h of conflictosMaestro) {
        if (excludeClaseId && h.clase_id === excludeClaseId) continue
        if (horaInicio < h.hora_fin && h.hora_inicio < horaFin) {
          return {
            tipo: 'maestro',
            clase_nombre: h.clases?.nombre || 'Otra clase',
            detalle: `El maestro ya tiene otra clase asignada ("${h.clases?.nombre}")`,
            horario: `${h.dia} de ${h.hora_inicio} a ${h.hora_fin}`
          }
        }
      }
    }
  }

  return null
}

function normalizeClase(c) {
  return {
    ...c,
    nombre: c.nombre ?? c.name ?? '',
    instrumento: c.instrumento ?? c.instrument ?? '',
    salon_id: c.salon_id ?? c.salonId ?? null,
    maestro_id: c.maestro_principal_id ?? c.maestro_id ?? c.maestroId ?? null,
    maestro_auxiliar_id: c.maestro_suplente_id ?? c.maestro_auxiliar_id ?? null,
    max_alumnos: c.capacidad_maxima ?? c.max_alumnos ?? 20,
    notas_pedagogicas: c.descripcion ?? '',
  }
}

export async function obtenerClases() {
  const { data: clases, error } = await supabase
    .from('clases')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error cargando clases:', error.message)
    throw new Error('No se pudieron cargar las clases')
  }

  const clasesNormalized = clases.map(normalizeClase)

  const { data: horarios } = await supabase
    .from('clase_horarios')
    .select('*')
    .order('dia', { ascending: true })

  const clasesConHorarios = clasesNormalized.map(clase => ({
    ...clase,
    horarios: horarios?.filter(h => h.clase_id === clase.id) || []
  }))

  return clasesConHorarios
}

export async function obtenerClase(id) {
  const { data, error } = await supabase
    .from('clases')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando clase:', error.message)
    throw new Error('Clase no encontrada')
  }

  return data
}

export async function crearClase(clase, force = false) {
  if (!clase.nombre || !clase.nombre.trim()) {
    throw new Error('El nombre es obligatorio')
  }

  if (!clase.maestro_id) {
    throw new Error('El maestro titular es obligatorio')
  }

  if (!clase.programa_id) {
    throw new Error('El programa es obligatorio')
  }

  if (!clase.instrumento || !clase.instrumento.trim()) {
    throw new Error('El instrumento es obligatorio')
  }

  if (!clase.horarios || clase.horarios.length === 0) {
    throw new Error('Debe agregar al menos un horario')
  }

  for (const h of clase.horarios) {
    if (!h.dia) {
      throw new Error('El día es obligatorio en todos los horarios')
    }
    if (!h.hora_inicio || !h.hora_fin) {
      throw new Error('La hora de inicio y fin son obligatorias en todos los horarios')
    }
    if (h.hora_inicio >= h.hora_fin) {
      throw new Error('La hora de inicio debe ser menor que la hora de fin')
    }

    // Verificar solapamiento (si no se fuerza)
    if (!force) {
      const solapamiento = await verificarSolapamiento({
        salonId: h.salon_id,
        maestroId: clase.maestro_id,
        dia: h.dia,
        horaInicio: h.hora_inicio,
        horaFin: h.hora_fin
      })

      if (solapamiento) {
        const err = new Error(`Conflicto de ${solapamiento.tipo}: ${solapamiento.detalle} el ${solapamiento.horario}`)
        err.isConflict = true
        err.conflictData = solapamiento
        throw err
      }
    }
  }

  const datosLimpios = {
    nombre: clase.nombre.trim(),
    instrumento: clase.instrumento.trim(),
    maestro_principal_id: clase.maestro_id,
    maestro_suplente_id: clase.maestro_auxiliar_id || null,
    programa_id: clase.programa_id,
    capacidad_maxima: clase.max_alumnos || 20,
    estado: clase.estado || 'activa',
    descripcion: (clase.notas_pedagogicas || clase.descripcion || '').trim() || null,
  }

  const { data, error } = await supabase
    .from('clases')
    .insert([datosLimpios])
    .select()

  if (error) {
    console.error('Error creando clase:', error.message)
    throw new Error('No se pudo crear la clase')
  }

  const claseCreada = data[0]

  const horariosData = clase.horarios.map(h => ({
    clase_id: claseCreada.id,
    dia: h.dia,
    hora_inicio: h.hora_inicio,
    hora_fin: h.hora_fin,
    salon_id: h.salon_id || null,
  }))

  if (horariosData.length > 0) {
    const { error: errorHorarios } = await supabase
      .from('clase_horarios')
      .insert(horariosData)

    if (errorHorarios) {
      console.error('Error creando horarios:', errorHorarios.message)
      await supabase.from('clases').delete().eq('id', claseCreada.id)
      throw new Error('No se pudieron crear los horarios de la clase')
    }
  }

  return normalizeClase({
    ...claseCreada,
    horarios: horariosData,
  })
}

export async function actualizarClase(id, actualizaciones, force = false) {
  if (actualizaciones.nombre !== undefined && !actualizaciones.nombre.trim()) {
    throw new Error('El nombre no puede estar vacío')
  }

  if (actualizaciones.instrumento !== undefined && !actualizaciones.instrumento.trim()) {
    throw new Error('El instrumento no puede estar vacío')
  }

  if (actualizaciones.horarios) {
    for (const h of actualizaciones.horarios) {
      if (h.hora_inicio && h.hora_fin && h.hora_inicio >= h.hora_fin) {
        throw new Error('La hora de inicio debe ser menor que la hora de fin')
      }

      // Verificar solapamiento (si no se fuerza)
      if (!force) {
        const solapamiento = await verificarSolapamiento({
          salonId: h.salon_id,
          maestroId: actualizaciones.maestro_id, // Usar el nuevo maestro si se está cambiando
          dia: h.dia,
          horaInicio: h.hora_inicio,
          horaFin: h.hora_fin,
          excludeClaseId: id
        })

        if (solapamiento) {
          const err = new Error(`Conflicto de ${solapamiento.tipo}: ${solapamiento.detalle} el ${solapamiento.horario}`)
          err.isConflict = true
          err.conflictData = solapamiento
          throw err
        }
      }
    }
  }

  const datosActualizacion = {}

  if (actualizaciones.nombre !== undefined) {
    datosActualizacion.nombre = actualizaciones.nombre.trim()
  }

  if (actualizaciones.maestro_id !== undefined) {
    datosActualizacion.maestro_principal_id = actualizaciones.maestro_id
  }

  if (actualizaciones.maestro_auxiliar_id !== undefined) {
    datosActualizacion.maestro_suplente_id = actualizaciones.maestro_auxiliar_id || null
  }

  if (actualizaciones.programa_id !== undefined) {
    datosActualizacion.programa_id = actualizaciones.programa_id
  }

  if (actualizaciones.instrumento !== undefined) {
    datosActualizacion.instrumento = actualizaciones.instrumento.trim()
  }

  if (actualizaciones.max_alumnos !== undefined) {
    datosActualizacion.capacidad_maxima = actualizaciones.max_alumnos
  }

  if (actualizaciones.estado !== undefined) {
    datosActualizacion.estado = actualizaciones.estado
  }

  if (actualizaciones.notas_pedagogicas !== undefined) {
    datosActualizacion.descripcion = (actualizaciones.notas_pedagogicas || '').trim() || null
  }

  const { data, error } = await supabase
    .from('clases')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error actualizando clase:', error.message)
    throw new Error('No se pudo actualizar la clase')
  }

  if (actualizaciones.horarios) {
    await supabase.from('clase_horarios').delete().eq('clase_id', id)

    if (actualizaciones.horarios.length > 0) {
      const horariosData = actualizaciones.horarios.map(h => ({
        clase_id: id,
        dia: h.dia,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        salon_id: h.salon_id || null,
      }))

      await supabase.from('clase_horarios').insert(horariosData)
    }
  }

  const { data: horariosActualizados } = await supabase
    .from('clase_horarios')
    .select('*')
    .eq('clase_id', id)

  return normalizeClase({
    ...data[0],
    horarios: horariosActualizados || [],
  })
}

export async function eliminarClase(id) {
  const { error } = await supabase
    .from('clases')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error eliminando clase:', error.message)
    throw new Error('No se pudo eliminar la clase')
  }
}

export async function obtenerClasesPorMaestro(maestroId) {
  const { data, error } = await supabase
    .from('clases')
    .select('*')
    .eq('maestro_principal_id', maestroId)
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error cargando clases del maestro:', error.message)
    throw new Error('No se pudieron cargar las clases')
  }

  return data.map(normalizeClase)
}

export async function obtenerClasesActivas() {
  const { data, error } = await supabase
    .from('clases')
    .select('*')
    .eq('estado', 'activa')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error cargando clases activas:', error.message)
    throw new Error('No se pudieron cargar las clases activas')
  }

  return data.map(normalizeClase)
}

export async function inscribirAlumno(claseId, alumnoId) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .insert([{ clase_id: claseId, alumno_id: alumnoId, activo: true, fecha_inscripcion: new Date().toISOString().split('T')[0] }])
    .select()

  if (error) {
    if (error.code === '23505') {
      throw new Error('El alumno ya está inscrito en esta clase')
    }
    console.error('Error inscribiendo alumno:', error.message)
    throw new Error('No se pudo inscribir al alumno')
  }

  return data[0]
}

export async function desinscribirAlumno(claseId, alumnoId) {
  const { error } = await supabase
    .from('alumnos_clases')
    .delete()
    .eq('clase_id', claseId)
    .eq('alumno_id', alumnoId)

  if (error) {
    console.error('Error desinscribiendo alumno:', error.message)
    throw new Error('No se pudo desinscribir al alumno')
  }
}

export async function obtenerAlumnosInscritos(claseId) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .select('*, alumno:alumnos(*)')
    .eq('clase_id', claseId)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando alumnos inscritos:', error.message)
    throw new Error('No se pudieron cargar los alumnos inscritos')
  }

  return data
}

function normalizarHora(hora) {
  if (!hora) return null
  if (typeof hora === 'number') {
    const h = Math.floor(hora)
    const m = Math.round((hora - h) * 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }
  return hora.toString().substring(0, 5)
}

function comparaHoras(a, b) {
  const ha = normalizarHora(a)
  const hb = normalizarHora(b)
  if (!ha || !hb) return 0
  return ha.localeCompare(hb)
}

function diaATemporalSem(dia) {
  const map = {
    lunes: 1, martes: 2, miércoles: 3, miercoles: 3,
    jueves: 4, viernes: 5, sábado: 6, sabado: 6, domingo: 7,
  }
  const key = (dia || '').toLowerCase().trim()
  return map[key] || null
}

function rangosSeSolapan(aStart, aEnd, bStart, bEnd) {
  const normAStart = normalizarHora(aStart)
  const normAEnd = normalizarHora(aEnd)
  const normBStart = normalizarHora(bStart)
  const normBEnd = normalizarHora(bEnd)
  if (!normAStart || !normAEnd || !normBStart || !normBEnd) return false
  return normAStart < normBEnd && normAEnd > normBStart
}

export async function validarHorario(horarios, maestroId, excludeClaseId = null) {
  const inputs = (horarios || []).filter(h => h?.dia && h?.hora_inicio && h?.hora_fin)
  if (inputs.length === 0) return []

  const conflictos = []
  const dias = [...new Set(inputs.map(h => h.dia))]
  
  const { data: todosLosHorarios, error } = await supabase
    .from('clase_horarios')
    .select('*, clases!inner(id, nombre, maestro_principal_id)')
    .in('dia', dias)

  if (error) {
    console.error('Error cargando horarios para validación:', error)
    return []
  }

  for (const input of inputs) {
    for (const h of todosLosHorarios) {
      if (excludeClaseId && h.clase_id === excludeClaseId) continue

      if (rangosSeSolapan(input.hora_inicio, input.hora_fin, h.hora_inicio, h.hora_fin)) {
        // 1. Conflicto de SALÓN
        if (input.salon_id && h.salon_id === input.salon_id) {
          conflictos.push({
            tipo: 'salón',
            detalle: `El salón ya está ocupado por "${h.clases?.nombre}"`,
            clase_id: h.clase_id,
            horario: `${h.dia} de ${formatHora(h.hora_inicio)} a ${formatHora(h.hora_fin)}`
          })
        }

        // 2. Conflicto de MAESTRO
        if (maestroId && h.clases?.maestro_principal_id === maestroId) {
          conflictos.push({
            tipo: 'maestro',
            detalle: `El maestro ya tiene otra clase asignada ("${h.clases?.nombre}")`,
            clase_id: h.clase_id,
            horario: `${h.dia} de ${formatHora(h.hora_inicio)} a ${formatHora(h.hora_fin)}`
          })
        }
      }
    }
  }

  const uniqueConflictos = []
  const seen = new Set()
  for (const c of conflictos) {
    const key = `${c.tipo}-${c.clase_id}-${c.horario}`
    if (!seen.has(key)) {
      uniqueConflictos.push(c)
      seen.add(key)
    }
  }
  return uniqueConflictos
}

export function getConflictoLabel(tipo) {
  const labels = {
    conflicto_horario: 'Conflicto de horario',
    conflicto_salon: 'Conflicto de salón',
    conflicto_maestro: 'Conflicto de maestro',
  }
  return labels[tipo] || tipo
}
