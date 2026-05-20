import { supabase } from '../../../lib/supabaseClient.js'
import { formatHora, timeToMinutes } from '../utils/clasesUtils.js'
import { Clase } from '../models/clase.model.js'

export const NIVELES = [
  { value: '1', label: '1° Año' },
  { value: '2', label: '2° Año' },
  { value: '3', label: '3° Año' },
  { value: '4', label: '4° Año' },
  { value: '5', label: '5° Año' },
  { value: 'inicial', label: 'Nivel Inicial' },
  { value: 'intermedio', label: 'Nivel Intermedio' },
  { value: 'avanzado', label: 'Nivel Avanzado' },
]

export { NIVELES as NIVELES_CONST } // Exportación adicional por si acaso hay colisiones

/**
 * Verifica si hay solapamiento de horarios para un salón o maestro específico
 * @param {Object} params Parámetros de verificación
 * @returns {Promise<Object|null>} El conflicto encontrado o null
 */
async function verificarSolapamiento({ salonId, maestroId, dia, horaInicio, horaFin, excludeClaseId = null }) {
  if (!dia || !horaInicio || !horaFin) return null

  const startMin = timeToMinutes(horaInicio)
  const endMin = timeToMinutes(horaFin)

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
        const hStartMin = timeToMinutes(h.hora_inicio)
        const hEndMin = timeToMinutes(h.hora_fin)
        if (startMin < hEndMin && hStartMin < endMin) {
          return {
            tipo: 'salón',
            clase_nombre: h.clases?.nombre || 'Otra clase',
            detalle: `El salón ya está ocupado por "${h.clases?.nombre}"`,
            horario: `${h.dia} de ${formatHora(h.hora_inicio)} a ${formatHora(h.hora_fin)}`
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
        const hStartMin = timeToMinutes(h.hora_inicio)
        const hEndMin = timeToMinutes(h.hora_fin)
        if (startMin < hEndMin && hStartMin < endMin) {
          return {
            tipo: 'maestro',
            clase_nombre: h.clases?.nombre || 'Otra clase',
            detalle: `El maestro ya tiene otra clase asignada ("${h.clases?.nombre}")`,
            horario: `${h.dia} de ${formatHora(h.hora_inicio)} a ${formatHora(h.hora_fin)}`
          }
        }
      }
    }
  }

  return null
}

function normalizeClase(c) {
  if (!c) return null
  return new Clase({
    ...c,
    maestro_principal_id: c.maestro_principal_id ?? c.maestro_id ?? null,
    maestro_suplente_id: c.maestro_suplente_id ?? null,
    tiene_suplente: !!c.maestro_suplente_id, // true si existe suplente en BD
    capacidad_maxima: c.capacidad_maxima ?? c.max_alumnos ?? 20,
    descripcion: c.descripcion ?? c.notas_pedagogicas ?? '',
  })
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

  const { data: horarios } = await supabase
    .from('clase_horarios')
    .select('*')
    .order('dia', { ascending: true })

  return (clases || []).map(c => {
    const claseObj = normalizeClase(c)
    claseObj.horarios = horarios?.filter(h => h.clase_id === c.id) || []
    return claseObj
  })
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

  const { data: horarios } = await supabase
    .from('clase_horarios')
    .select('*')
    .eq('clase_id', id)

  const claseObj = normalizeClase(data)
  claseObj.horarios = horarios || []
  return claseObj
}

export async function crearClase(claseData, force = false) {
  const clase = normalizeClase(claseData)
  clase.horarios = claseData.horarios || []

  const errores = clase.validate()
  if (errores.length > 0) {
    throw new Error(errores.join('. '))
  }

  if (!force) {
    for (const h of clase.horarios) {
      const solapamiento = await verificarSolapamiento({
        salonId: h.salon_id,
        maestroId: clase.maestro_principal_id,
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

  // Para INSERT, no enviar id (que será null) - dejar que BD genere con DEFAULT
  const claseJSON = clase.toJSON()
  delete claseJSON.id

  const { data, error } = await supabase
    .from('clases')
    .insert([claseJSON])
    .select()

  if (error) {
    console.error('Error creando clase:', error.message)
    throw new Error('No se pudo crear la clase')
  }

  const claseCreada = data[0]

  if (clase.horarios.length > 0) {
    const horariosData = clase.horarios.map(h => ({
      clase_id: claseCreada.id,
      dia: h.dia,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      salon_id: h.salon_id || null,
    }))

    const { error: errorHorarios } = await supabase.from('clase_horarios').insert(horariosData)

    if (errorHorarios) {
      console.error('Error creando horarios:', errorHorarios.message)
      await supabase.from('clases').delete().eq('id', claseCreada.id)
      throw new Error('No se pudieron crear los horarios de la clase')
    }
    
    return normalizeClase({ ...claseCreada, horarios: horariosData })
  }

  return normalizeClase(claseCreada)
}

export async function actualizarClase(id, actualizaciones, force = false) {
  const original = await obtenerClase(id)
  const fusionada = new Clase({ ...original, ...actualizaciones })
  
  // Asegurar que conservamos horarios si no se enviaron nuevos
  if (actualizaciones.horarios === undefined) {
    fusionada.horarios = original.horarios
  } else {
    fusionada.horarios = actualizaciones.horarios
  }

  const errores = fusionada.validate()
  if (errores.length > 0) {
    throw new Error(errores.join('. '))
  }

  if (!force && actualizaciones.horarios) {
    for (const h of fusionada.horarios) {
      const solapamiento = await verificarSolapamiento({
        salonId: h.salon_id,
        maestroId: fusionada.maestro_id,
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

  const { data, error } = await supabase
    .from('clases')
    .update(fusionada.toJSON())
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

  return obtenerClase(id)
}

export async function eliminarClase(id) {
  const { error } = await supabase.from('clases').delete().eq('id', id)
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

  if (error) throw error
  return (data || []).map(normalizeClase)
}

export async function inscribirAlumno(claseId, alumnoId) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .insert([{ clase_id: claseId, alumno_id: alumnoId, activo: true, fecha_inscripcion: new Date().toISOString().split('T')[0] }])
    .select()

  if (error) {
    if (error.code === '23505') throw new Error('El alumno ya está inscrito en esta clase')
    throw error
  }
  return data[0]
}

export async function desinscribirAlumno(claseId, alumnoId) {
  const { error } = await supabase
    .from('alumnos_clases')
    .delete()
    .eq('clase_id', claseId)
    .eq('alumno_id', alumnoId)

  if (error) throw error
}

export async function obtenerAlumnosInscritos(claseId) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .select('*, alumno:alumnos(*)')
    .eq('clase_id', claseId)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
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

  if (error) return []

  for (const input of inputs) {
    const inputStartMin = timeToMinutes(input.hora_inicio)
    const inputEndMin = timeToMinutes(input.hora_fin)

    for (const h of (todosLosHorarios || [])) {
      if (excludeClaseId && h.clase_id === excludeClaseId) continue

      const hStartMin = timeToMinutes(h.hora_inicio)
      const hEndMin = timeToMinutes(h.hora_fin)

      if (inputStartMin < hEndMin && hStartMin < inputEndMin) {
        if (input.salon_id && h.salon_id === input.salon_id) {
          conflictos.push({
            tipo: 'salón',
            detalle: `El salón ya está ocupado por "${h.clases?.nombre}"`,
            clase_id: h.clase_id,
            horario: `${h.dia} de ${formatHora(h.hora_inicio)} a ${formatHora(h.hora_fin)}`
          })
        }
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

  return Array.from(new Set(conflictos.map(JSON.stringify))).map(JSON.parse)
}

export function getConflictoLabel(tipo) {
  const labels = {
    'salón': 'Conflicto de salón',
    'maestro': 'Conflicto de maestro',
  }
  return labels[tipo] || tipo
}
