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
  const horarioLocal = { dia, hora_inicio: horaInicio, hora_fin: horaFin, salon_id: salonId || null }

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
            clase_id: h.clase_id,
            clase_horario_id: h.id,
            detalle: `El salón ya está ocupado por "${h.clases?.nombre}"`,
            horario: `${h.dia} de ${formatHora(h.hora_inicio)} a ${formatHora(h.hora_fin)}`,
            horario_local: horarioLocal,
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
            clase_id: h.clase_id,
            clase_horario_id: h.id,
            detalle: `El maestro ya tiene otra clase asignada ("${h.clases?.nombre}")`,
            horario: `${h.dia} de ${formatHora(h.hora_inicio)} a ${formatHora(h.hora_fin)}`,
            horario_local: horarioLocal,
          }
        }
      }
    }
  }

  return null
}

/**
 * Normaliza el 3er parámetro de crearClase/actualizarClase.
 * Acepta el legado (boolean "force") o un objeto { force, resolvedConflicts }.
 * @param {boolean|Object} opt
 * @returns {{force: boolean, resolvedConflicts: Array}}
 */
function _normalizeOptions(opt) {
  if (typeof opt === 'boolean') {
    return { force: opt, resolvedConflicts: [] }
  }
  if (opt && typeof opt === 'object') {
    return {
      force: !!opt.force,
      resolvedConflicts: Array.isArray(opt.resolvedConflicts) ? opt.resolvedConflicts : [],
    }
  }
  return { force: false, resolvedConflicts: [] }
}

/**
 * Aplica la resolución de un conflicto: borra el horario conflictivo de LA OTRA
 * clase y la marca como necesita_revision=true con el motivo indicado.
 * @param {{clase_horario_id: string, clase_id: string, motivo: string}} resolved
 */
async function _aplicarResolucionConflicto(resolved) {
  if (!resolved) return

  if (resolved.clase_horario_id) {
    const { error: errorDeleteHorario } = await supabase
      .from('clase_horarios')
      .delete()
      .eq('id', resolved.clase_horario_id)

    if (errorDeleteHorario) {
      console.error('Error eliminando horario en conflicto:', errorDeleteHorario.message)
      throw new Error('No se pudo eliminar el horario en conflicto de la otra clase')
    }
  }

  if (resolved.clase_id) {
    const { error: errorUpdateClase } = await supabase
      .from('clases')
      .update({ necesita_revision: true, revision_motivo: resolved.motivo || null })
      .eq('id', resolved.clase_id)

    if (errorUpdateClase) {
      console.error('Error marcando clase para revisión:', errorUpdateClase.message)
      throw new Error('No se pudo marcar la otra clase para revisión')
    }
  }
}

/**
 * Busca si el conflicto encontrado corresponde a alguno de los resolvedConflicts
 * ya aceptados por el admin (mismo clase_horario_id).
 */
function _buscarResolucion(solapamiento, resolvedConflicts) {
  if (!solapamiento || !resolvedConflicts?.length) return null
  return resolvedConflicts.find(r => r.clase_horario_id === solapamiento.clase_horario_id) || null
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

export async function crearClase(claseData, opt = false) {
  const { force, resolvedConflicts } = _normalizeOptions(opt)
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
        const resolucion = _buscarResolucion(solapamiento, resolvedConflicts)
        if (resolucion) {
          await _aplicarResolucionConflicto(resolucion)
          continue
        }
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

export async function actualizarClase(id, actualizaciones, opt = false) {
  const { force, resolvedConflicts } = _normalizeOptions(opt)
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
        const resolucion = _buscarResolucion(solapamiento, resolvedConflicts)
        if (resolucion) {
          await _aplicarResolucionConflicto(resolucion)
          continue
        }
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
  }
  return labels[tipo] || tipo
}

/**
 * Verifica si inscribir a un alumno en `claseDestinoId` genera un conflicto de
 * horario con alguna OTRA clase (activa) en la que el alumno ya está inscrito.
 * A diferencia de verificarSolapamiento, esto ignora el salón: un alumno no
 * puede estar físicamente en dos lugares al mismo tiempo, sin importar dónde.
 * @param {string} alumnoId
 * @param {string} claseDestinoId
 * @returns {Promise<{clase_id: string, clase_nombre: string, horario: string}|null>}
 */
export async function verificarConflictoInscripcion(alumnoId, claseDestinoId) {
  if (!alumnoId || !claseDestinoId) return null

  const claseDestino = await obtenerClase(claseDestinoId)
  const horariosDestino = claseDestino.horarios || []
  if (horariosDestino.length === 0) return null

  const { data: inscripciones, error: errorInscripciones } = await supabase
    .from('alumnos_clases')
    .select('clase_id, clases(id, nombre)')
    .eq('alumno_id', alumnoId)
    .eq('activo', true)

  if (errorInscripciones || !inscripciones) return null

  const otrasClasesIds = [...new Set(
    inscripciones.map(i => i.clase_id).filter(id => id && id !== claseDestinoId)
  )]
  if (otrasClasesIds.length === 0) return null

  const { data: horariosOtras, error: errorHorarios } = await supabase
    .from('clase_horarios')
    .select('*, clases(id, nombre)')
    .in('clase_id', otrasClasesIds)

  if (errorHorarios || !horariosOtras) return null

  for (const hDestino of horariosDestino) {
    if (!hDestino.dia || !hDestino.hora_inicio || !hDestino.hora_fin) continue
    const startMin = timeToMinutes(hDestino.hora_inicio)
    const endMin = timeToMinutes(hDestino.hora_fin)

    for (const hOtra of horariosOtras) {
      if ((hOtra.dia || '').toLowerCase().trim() !== (hDestino.dia || '').toLowerCase().trim()) continue
      const hStartMin = timeToMinutes(hOtra.hora_inicio)
      const hEndMin = timeToMinutes(hOtra.hora_fin)
      if (startMin < hEndMin && hStartMin < endMin) {
        return {
          clase_id: hOtra.clase_id,
          clase_nombre: hOtra.clases?.nombre || 'Otra clase',
          horario: `${hOtra.dia} de ${formatHora(hOtra.hora_inicio)} a ${formatHora(hOtra.hora_fin)}`,
        }
      }
    }
  }

  return null
}

/**
 * Resuelve un conflicto de inscripción: desinscribe al alumno de `claseId`
 * (la clase que "pierde") y la marca para revisión administrativa.
 * @param {string} claseId
 * @param {string} alumnoId
 * @param {string} motivoTexto
 */
export async function resolverConflictoInscripcion(claseId, alumnoId, motivoTexto) {
  await desinscribirAlumno(claseId, alumnoId)

  const { error } = await supabase
    .from('clases')
    .update({ necesita_revision: true, revision_motivo: motivoTexto || null })
    .eq('id', claseId)

  if (error) {
    console.error('Error marcando clase para revisión:', error.message)
    throw new Error('No se pudo marcar la clase para revisión')
  }
}

/**
 * Limpia el flag de revisión administrativa de una clase.
 * @param {string} claseId
 */
export async function marcarComoRevisado(claseId) {
  const { error } = await supabase
    .from('clases')
    .update({ necesita_revision: false, revision_motivo: null })
    .eq('id', claseId)

  if (error) {
    console.error('Error al marcar clase como revisada:', error.message)
    throw new Error('No se pudo marcar la clase como revisada')
  }
}
