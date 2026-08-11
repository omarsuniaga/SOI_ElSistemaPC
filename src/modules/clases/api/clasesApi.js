import { supabase } from '../../../lib/supabaseClient.js'
import { formatHora, timeToMinutes } from '../utils/clasesUtils.js'
import { checkPeriodoSupport } from '../../../lib/periodoSniffer.js'
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

function parseStrictTime(value) {
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return (hours * 60) + minutes
}

/**
 * Recomienda el salón activo más ajustado a la matrícula de una sesión.
 * No modifica la clase ni su horario.
 */
export async function buscarSalonDisponible({
  claseId,
  dia,
  horaInicio,
  horaFin,
  horarioId = null,
  salonActualId = null,
} = {}) {
  if (!claseId || !dia || !horaInicio || !horaFin) {
    throw new Error('claseId, día, hora de inicio y hora de fin son obligatorios')
  }

  const start = parseStrictTime(horaInicio)
  const end = parseStrictTime(horaFin)
  if (start === null || end === null || start >= end) {
    throw new Error('El intervalo de horario no es válido')
  }

  const [enrollmentsResult, roomsResult, schedulesResult] = await Promise.all([
    supabase
      .from('alumnos_clases')
      .select('id', { count: 'exact', head: true })
      .eq('clase_id', claseId)
      .eq('activo', true),
    supabase.from('salones').select('*'),
    supabase.from('clase_horarios').select('id, clase_id, salon_id, dia, hora_inicio, hora_fin').eq('dia', dia),
  ])

  if (enrollmentsResult.error) throw enrollmentsResult.error
  if (roomsResult.error) throw roomsResult.error
  if (schedulesResult.error) throw schedulesResult.error

  const alumnosActivos = enrollmentsResult.count ?? enrollmentsResult.data?.length ?? 0
  const activeRooms = (roomsResult.data || []).filter(room => (
    room?.activo !== false
    && room?.is_active !== false
    && Number.isFinite(Number(room?.capacidad))
  ))
  const capableRooms = activeRooms.filter(room => Number(room.capacidad) >= alumnosActivos)

  if (capableRooms.length === 0) {
    return {
      salon: null,
      alumnosActivos,
      mantieneSalonActual: false,
      reason: 'NO_CAPACITY',
    }
  }

  const occupiedRoomIds = new Set()
  for (const schedule of (schedulesResult.data || [])) {
    if (!schedule?.salon_id || schedule.dia?.toLowerCase() !== dia.toLowerCase()) continue
    // Al editar una sesión se excluye sólo esa fila. Las demás sesiones de la
    // misma clase siguen reservando su salón como cualquier otro horario.
    if (horarioId && schedule.id === horarioId) continue
    const otherStart = parseStrictTime(schedule.hora_inicio)
    const otherEnd = parseStrictTime(schedule.hora_fin)
    if (otherStart === null || otherEnd === null || otherStart >= otherEnd) continue
    if (start < otherEnd && otherStart < end) occupiedRoomIds.add(schedule.salon_id)
  }

  const availableRooms = capableRooms.filter(room => !occupiedRoomIds.has(room.id))
  if (availableRooms.length === 0) {
    return {
      salon: null,
      alumnosActivos,
      mantieneSalonActual: false,
      reason: 'NO_AVAILABILITY',
    }
  }

  availableRooms.sort((left, right) => {
    const capacityDifference = Number(left.capacidad) - Number(right.capacidad)
    if (capacityDifference !== 0) return capacityDifference
    const leftCurrent = left.id === salonActualId ? 0 : 1
    const rightCurrent = right.id === salonActualId ? 0 : 1
    if (leftCurrent !== rightCurrent) return leftCurrent - rightCurrent
    const nameDifference = String(left.nombre || '').localeCompare(String(right.nombre || ''), 'es')
    return nameDifference || String(left.id).localeCompare(String(right.id))
  })

  const salon = availableRooms[0]
  return {
    salon,
    alumnosActivos,
    mantieneSalonActual: salon.id === salonActualId,
    reason: null,
  }
}

export async function obtenerClases() {
  const isPeriodoSupported = await checkPeriodoSupport()

  let activePeriodId = null
  if (isPeriodoSupported) {
    const { data: periodos, error: pError } = await supabase
      .from('periodos')
      .select('id')
      .eq('activo', true)
      .limit(1)
    if (!pError && periodos?.length > 0) {
      activePeriodId = periodos[0].id
    }
  }

  let query = supabase.from('clases').select('*')
  if (isPeriodoSupported && activePeriodId) {
    query = query.eq('periodo_id', activePeriodId)
  }

  const { data: clases, error } = await query.order('nombre', { ascending: true })

  if (error) {
    console.error('Error cargando clases:', error.message)
    throw new Error('No se pudieron cargar las clases')
  }

  const [{ data: horarios }, { data: alumnosClases }] = await Promise.all([
    supabase.from('clase_horarios').select('*').order('dia', { ascending: true }),
    supabase.from('alumnos_clases').select('clase_id, alumno_id')
  ])

  const alumnosByClase = (alumnosClases || []).reduce((acc, row) => {
    if (row.clase_id) {
      if (!acc[row.clase_id]) acc[row.clase_id] = []
      if (row.alumno_id) acc[row.clase_id].push(row.alumno_id)
    }
    return acc
  }, {})

  return (clases || []).map(c => {
    const claseObj = normalizeClase(c)
    const claseHorarios = horarios?.filter(h => h.clase_id === c.id) || (c.horarios || c.clase_horarios || [])
    claseObj.horarios = claseHorarios
    claseObj.clase_horarios = claseHorarios
    claseObj.alumnos_ids = alumnosByClase[c.id] || []
    claseObj.total_alumnos = claseObj.alumnos_ids.length
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

  // Obtener el período activo para asociar la nueva clase automáticamente si hay soporte en base de datos
  const isPeriodoSupported = await checkPeriodoSupport()
  if (isPeriodoSupported) {
    const { data: periodos, error: pError } = await supabase
      .from('periodos')
      .select('id')
      .eq('activo', true)
      .limit(1)

    if (!pError && periodos?.length > 0) {
      claseJSON.periodo_id = periodos[0].id
    }
  } else {
    // Si no hay soporte, quitar periodo_id para evitar errores 400 en insercion
    delete claseJSON.periodo_id
  }

  let payload = claseJSON
  let { data, error } = await supabase
    .from('clases')
    .insert([payload])
    .select()

  if (error && error.message?.includes('clases_tipo_clase_check') && payload.tipo_clase === 'rotativa') {
    console.warn('[clasesApi] DB check constraint fallback: saving tipo_clase as "individual"')
    payload = { ...payload, tipo_clase: 'individual' }
    const retry = await supabase.from('clases').insert([payload]).select()
    data = retry.data
    error = retry.error
  }

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
      maestro_id: claseCreada.maestro_principal_id // Sincronizar maestro_id en clase_horarios
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

  let updatePayload = fusionada.toJSON()
  let { data, error } = await supabase
    .from('clases')
    .update(updatePayload)
    .eq('id', id)
    .select()

  if (error && error.message?.includes('clases_tipo_clase_check') && updatePayload.tipo_clase === 'rotativa') {
    console.warn('[clasesApi] DB check constraint fallback: updating tipo_clase as "individual"')
    updatePayload = { ...updatePayload, tipo_clase: 'individual' }
    const retry = await supabase
      .from('clases')
      .update(updatePayload)
      .eq('id', id)
      .select()
    data = retry.data
    error = retry.error
  }

  if (error) {
    console.error('Error actualizando clase:', error.message)
    throw new Error('No se pudo actualizar la clase')
  }

  if (actualizaciones.horarios) {
    const { error: errorDelete } = await supabase
      .from('clase_horarios')
      .delete()
      .eq('clase_id', id)

    if (errorDelete) {
      console.error('Error eliminando horarios anteriores:', errorDelete.message)
      throw new Error('No se pudieron actualizar los horarios de la clase')
    }

    if (actualizaciones.horarios.length > 0) {
      const horariosData = actualizaciones.horarios.map(h => ({
        clase_id: id,
        dia: h.dia,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
        salon_id: h.salon_id || null,
        maestro_id: fusionada.maestro_principal_id // Sincronizar maestro_id si la tabla lo tiene
      }))

      const { error: errorInsert } = await supabase
        .from('clase_horarios')
        .insert(horariosData)

      if (errorInsert) {
        console.error('Error insertando nuevos horarios:', errorInsert.message)
        throw new Error('No se pudieron guardar los nuevos horarios de la clase: ' + errorInsert.message)
      }
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
    .select(`
      *,
      clase_horarios ( dia, hora_inicio, hora_fin, salon_id ),
      alumnos_clases ( id )
    `)
    .or(`maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId}`)
    .order('nombre', { ascending: true })

  if (error) throw error

  return (data || []).map(c => {
    const clase = normalizeClase(c)
    clase.horarios = c.clase_horarios || []
    clase.total_alumnos = (c.alumnos_clases || []).length
    clase.es_suplente = c.maestro_principal_id !== maestroId
    return clase
  })
}

export async function inscribirAlumno(claseId, alumnoId, horaInicio = null, horaFin = null) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .insert([{ 
      clase_id: claseId, 
      alumno_id: alumnoId, 
      activo: true, 
      fecha_inscripcion: new Date().toISOString().split('T')[0],
      hora_inicio: horaInicio,
      hora_fin: horaFin
    }])
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

export async function actualizarTurnoInscripcion(claseId, alumnoId, horaInicio, horaFin) {
  const { data, error } = await supabase
    .from('alumnos_clases')
    .update({ hora_inicio: horaInicio, hora_fin: horaFin })
    .eq('clase_id', claseId)
    .eq('alumno_id', alumnoId)
    .select()

  if (error) throw error
  return data[0]
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

export async function obtenerAlumnosInscritosPorClases(claseIds = []) {
  const ids = [...new Set((claseIds || []).filter(Boolean))]
  if (ids.length === 0) return {}

  const { data, error } = await supabase
    .from('alumnos_clases')
    .select('*, alumno:alumnos(*)')
    .in('clase_id', ids)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).reduce((acc, inscripcion) => {
    const claseId = inscripcion.clase_id
    if (!acc[claseId]) acc[claseId] = []
    acc[claseId].push(inscripcion)
    return acc
  }, {})
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
    'alumnos': 'Conflicto de alumnos coincidentes'
  }
  return labels[tipo] || tipo
}

/**
 * Verifica exhaustivamente solapes de maestro, salón y alumnos coincidentes para una clase.
 */
export async function verificarSolapamientoCompleto({ claseId = null, maestroId, horarios = [], alumnosIds = [] }) {
  const conflictos = []
  if (!horarios || horarios.length === 0) return conflictos

  const { data: todasClases, error } = await supabase
    .from('clases')
    .select(`
      id,
      nombre,
      maestro_principal_id,
      maestro_suplente_id,
      clase_horarios ( dia, hora_inicio, hora_fin, salon_id, salones(nombre) ),
      alumnos_clases ( alumno_id, alumnos(nombre_completo) )
    `)

  if (error || !todasClases) return conflictos

  for (const newH of horarios) {
    if (!newH?.dia || !newH?.hora_inicio || !newH?.hora_fin) continue
    const startNew = timeToMinutes(newH.hora_inicio)
    const endNew = timeToMinutes(newH.hora_fin)

    for (const c of todasClases) {
      if (claseId && c.id === claseId) continue

      for (const exH of (c.clase_horarios || [])) {
        if (!exH?.dia || exH.dia.toLowerCase() !== newH.dia.toLowerCase()) continue
        const startEx = timeToMinutes(exH.hora_inicio)
        const endEx = timeToMinutes(exH.hora_fin)

        if (startNew < endEx && startEx < endNew) {
          // Datos estructurados del horario en conflicto, para poder actuar
          // sobre él (no solo mostrarlo) cuando el usuario confirme.
          const exHorario = { dia: exH.dia, hora_inicio: exH.hora_inicio, hora_fin: exH.hora_fin }

          // 1. Mismo Maestro
          if (maestroId && (c.maestro_principal_id === maestroId || c.maestro_suplente_id === maestroId)) {
            conflictos.push({
              tipo: 'maestro',
              clase_id: c.id,
              clase_nombre: c.nombre,
              detalle: `El maestro ya tiene asignada la clase "${c.nombre}" en este horario.`,
              horario: `${exH.dia} ${formatHora(exH.hora_inicio)} - ${formatHora(exH.hora_fin)}`,
              ...exHorario,
            })
          }

          // 2. Mismo Salón
          if (newH.salon_id && exH.salon_id && newH.salon_id === exH.salon_id) {
            const salonNombre = exH.salones?.nombre || 'el salón'
            conflictos.push({
              tipo: 'salón',
              clase_id: c.id,
              clase_nombre: c.nombre,
              detalle: `El salón "${salonNombre}" está ocupado por la clase "${c.nombre}".`,
              horario: `${exH.dia} ${formatHora(exH.hora_inicio)} - ${formatHora(exH.hora_fin)}`,
              ...exHorario,
            })
          }

          // 3. Alumnos Coincidentes
          if (alumnosIds.length > 0 && exH.alumnos_clases?.length > 0) {
            const alumnosCoincidentes = exH.alumnos_clases.filter(ac => alumnosIds.includes(ac.alumno_id))
            if (alumnosCoincidentes.length > 0) {
              const nombres = alumnosCoincidentes.map(ac => ac.alumnos?.nombre_completo || 'Alumno').join(', ')
              conflictos.push({
                tipo: 'alumnos',
                clase_id: c.id,
                clase_nombre: c.nombre,
                detalle: `${alumnosCoincidentes.length} ${alumnosCoincidentes.length === 1 ? 'alumno' : 'alumnos'} (${nombres}) en dos clases a la misma hora.`,
                horario: `${exH.dia} ${formatHora(exH.hora_inicio)} - ${formatHora(exH.hora_fin)}`,
                ...exHorario,
              })
            }
          }
        }
      }
    }
  }

  return Array.from(new Set(conflictos.map(JSON.stringify))).map(JSON.parse)
}

/**
 * Marca las clases en conflicto como pendientes de revisión, en vez de
 * mutar sus datos en automático (desalojar salón, quitar alumnos): quien
 * coordina horarios decide cómo resolver el solape, no el sistema.
 *
 * @param {Array} conflictos - conflictos devueltos por verificarSolapamientoCompleto
 * @param {string} nuevaClaseNombre - nombre de la clase que se guardó pese al solape
 */
export async function resolverConflictosClases(conflictos = [], nuevaClaseNombre = '') {
  const porClase = new Map()
  for (const c of conflictos) {
    if (!c.clase_id) continue
    if (!porClase.has(c.clase_id)) porClase.set(c.clase_id, [])
    porClase.get(c.clase_id).push(c)
  }
  if (porClase.size === 0) return

  await Promise.all(Array.from(porClase.entries()).map(async ([claseId, confs]) => {
    const acciones = []

    // Salón: recurso físico, no hay ambigüedad pedagógica en liberarlo.
    // La clase nueva pasa a usarlo; la vieja queda sin salón en ese
    // horario hasta que alguien le asigne otro.
    for (const c of confs.filter(c => c.tipo === 'salón' && c.dia && c.hora_inicio && c.hora_fin)) {
      await supabase
        .from('clase_horarios')
        .update({ salon_id: null })
        .eq('clase_id', claseId)
        .eq('dia', c.dia)
        .eq('hora_inicio', c.hora_inicio)
        .eq('hora_fin', c.hora_fin)
      acciones.push(
        `Se liberó el salón del ${c.dia} ${formatHora(c.hora_inicio)}-${formatHora(c.hora_fin)} ` +
        `(ahora lo usa "${nuevaClaseNombre}") — asignale uno nuevo a este horario.`
      )
    }

    // Maestro y alumnos: no se mutan. Desasignar un maestro o desinscribir
    // un alumno es una decisión pedagógica — y el solape de alumnos muchas
    // veces es intencional (ensayos generales que se superponen con
    // clases individuales). Quedan señalados para que alguien decida.
    for (const c of confs.filter(c => c.tipo !== 'salón')) {
      acciones.push(c.detalle)
    }

    await supabase
      .from('clases')
      .update({
        necesita_revision: true,
        revision_motivo: `Conflicto con "${nuevaClaseNombre}": ${acciones.join(' ')}`,
      })
      .eq('id', claseId)
  }))
}

/**
 * Alumnos activos que no están inscritos en ninguna clase activa,
 * agrupados por instrumento — para encontrar a quién se le olvidó asignar
 * una clase. El módulo asume que todo alumno activo debería pertenecer a
 * alguna, y hoy no hay forma de verlo sin revisar clase por clase.
 */
export async function obtenerAlumnosSinClase() {
  const [{ data: alumnos, error: errAlumnos }, { data: inscripciones, error: errInscripciones }] = await Promise.all([
    supabase
      .from('alumnos')
      .select('id, nombre_completo, instrumento_principal, tlf_alumno, familiar_telefono, representante_tlf, fecha_ingreso, nivel, promedio_notas')
      .eq('activo', true)
      .order('nombre_completo'),
    supabase
      .from('alumnos_clases')
      .select('alumno_id')
      .eq('activo', true),
  ])

  if (errAlumnos) throw errAlumnos
  if (errInscripciones) throw errInscripciones

  const idsInscritos = new Set((inscripciones || []).map(i => i.alumno_id))
  const sinClase = (alumnos || []).filter(a => !idsInscritos.has(a.id))

  const porInstrumento = new Map()
  for (const alumno of sinClase) {
    const key = alumno.instrumento_principal || 'Sin instrumento definido'
    if (!porInstrumento.has(key)) porInstrumento.set(key, [])
    porInstrumento.get(key).push(alumno)
  }

  return Array.from(porInstrumento.entries())
    .map(([instrumento, alumnosDelInstrumento]) => ({
      instrumento,
      alumnos: alumnosDelInstrumento,
      total: alumnosDelInstrumento.length,
    }))
    .sort((a, b) => b.total - a.total)
}
