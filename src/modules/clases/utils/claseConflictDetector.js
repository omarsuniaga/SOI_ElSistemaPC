/**
 * claseConflictDetector.js
 * Motor de Detección de Conflictos, Solapamientos y Acuerdos de Maestros en Clases Académicas.
 */

import { timeToMinutes } from './clasesUtils.js'

/**
 * Normaliza un string removiendo tildes y mayúsculas
 */
function normalizeText(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

/**
 * Evalúa si dos bloques de horario se solapan en el tiempo
 */
function haySolapeHorario(h1, h2) {
  if (!h1 || !h2) return false
  const dia1 = normalizeText(h1.dia || h1.dia_semana)
  const dia2 = normalizeText(h2.dia || h2.dia_semana)
  if (!dia1 || !dia2 || dia1 !== dia2) return false

  const start1 = timeToMinutes(h1.hora_inicio || '00:00')
  const end1 = timeToMinutes(h1.hora_fin || '00:00')
  const start2 = timeToMinutes(h2.hora_inicio || '00:00')
  const end2 = timeToMinutes(h2.hora_fin || '00:00')

  if (start1 >= end1 || start2 >= end2) return false

  return start1 < end2 && start2 < end1
}

/**
 * Analiza todo el catálogo de clases y genera un mapa de conflictos por clase_id
 * @param {Array} clases - Catálogo completo de clases
 * @param {Array} maestros - Catálogo de docentes
 * @param {Array} salones - Catálogo de salones
 * @param {Array} alumnos - Catálogo de alumnos
 * @param {Array} acuerdos - Catálogo de acuerdos de maestros (franjas compartidas)
 * @returns {Map<string, Array>} Mapa con clase_id -> Array de conflictos detectados
 */
export function detectarConflictosDeClases(clases = [], maestros = [], salones = [], alumnos = [], acuerdos = []) {
  const conflictosMap = new Map()

  const maestrosMap = new Map((maestros || []).map(m => [m.id, m.nombre_completo || m.nombre]))
  const salonesMap = new Map((salones || []).map(s => [s.id, s.nombre]))
  const alumnosMap = new Map((alumnos || []).map(a => [
    a.id, 
    a.nombre_completo || `${a.nombre || ''} ${a.apellido || ''}`.trim() || 'Estudiante'
  ]))

  // Inicializar mapa para todas las clases
  clases.forEach(c => conflictosMap.set(c.id, []))

  // 1. Detección individual por clase (Falta de horario, falta de docente, revisión)
  clases.forEach((clase) => {
    const issues = conflictosMap.get(clase.id) || []
    const horarios = Array.isArray(clase.horarios) ? clase.horarios : (clase.clase_horarios || [])

    // A. Pendiente de Revisión
    if (clase.necesita_revision) {
      issues.push({
        id: `rev-${clase.id}`,
        tipo: 'revision',
        nivel: 'warning',
        icon: 'bi-flag-fill',
        titulo: 'Pendiente de Revisión',
        detalle: clase.revision_motivo || 'Marcada para revisión por coordinación académica.',
      })
    }

    // B. Sin Horario Asignado
    if (!horarios.length) {
      issues.push({
        id: `nohorario-${clase.id}`,
        tipo: 'horario',
        nivel: 'info',
        icon: 'bi-calendar-x',
        titulo: 'Sin Horario',
        detalle: 'Esta clase no tiene días ni horas configuradas.',
      })
    }

    // C. Sin Maestro Asignado
    const maestroId = clase.maestro_principal_id || clase.maestro_id
    if (!maestroId || !maestrosMap.has(maestroId)) {
      issues.push({
        id: `nomaestro-${clase.id}`,
        tipo: 'maestro-faltante',
        nivel: 'info',
        icon: 'bi-person-x',
        titulo: 'Sin Docente Titular',
        detalle: 'No se ha asignado un maestro titular para esta cátedra.',
      })
    }

    // D. Alumnos Duplicados en la misma clase
    const alumnosList = Array.isArray(clase.alumnos_ids) ? clase.alumnos_ids : []
    const uniqueAlumnos = new Set()
    const duplicados = []
    alumnosList.forEach((aId) => {
      if (uniqueAlumnos.has(aId)) duplicados.push(aId)
      else uniqueAlumnos.add(aId)
    })

    if (duplicados.length > 0) {
      const duplicadosNombres = duplicados.map(id => alumnosMap.get(id) || 'Estudiante')
      issues.push({
        id: `dup-${clase.id}`,
        tipo: 'duplicados',
        nivel: 'danger',
        icon: 'bi-people-fill',
        titulo: 'Alumnos Duplicados',
        detalle: `${duplicados.length} ${duplicados.length === 1 ? 'inscripción duplicada' : 'inscripciones duplicadas'}: ${duplicadosNombres.join(', ')}.`,
        duplicados,
        duplicadosNombres,
      })
    }
  })

  // 2. Detección cruzada entre clases (Solapes de Salón, Maestro y Alumnos)
  for (let i = 0; i < clases.length; i++) {
    const c1 = clases[i]
    const h1List = Array.isArray(c1.horarios) ? c1.horarios : (c1.clase_horarios || [])
    const alumnos1 = new Set(c1.alumnos_ids || [])
    const maestro1 = c1.maestro_principal_id || c1.maestro_id

    for (let j = i + 1; j < clases.length; j++) {
      const c2 = clases[j]
      const h2List = Array.isArray(c2.horarios) ? c2.horarios : (c2.clase_horarios || [])
      const alumnos2 = new Set(c2.alumnos_ids || [])
      const maestro2 = c2.maestro_principal_id || c2.maestro_id

      for (const h1 of h1List) {
        for (const h2 of h2List) {
          if (!haySolapeHorario(h1, h2)) continue

          const diaStr = h1.dia || h1.dia_semana || 'Día'
          const horaStr = `${String(h1.hora_inicio).slice(0, 5)} - ${String(h1.hora_fin).slice(0, 5)}`

          // A. Conflicto de Salón
          const salon1 = h1.salon_id || c1.salon_id
          const salon2 = h2.salon_id || c2.salon_id
          if (salon1 && salon2 && salon1 === salon2) {
            const salonNombre = salonesMap.get(salon1) || 'Salón compartido'
            
            conflictosMap.get(c1.id).push({
              id: `salon-${c1.id}-${c2.id}`,
              tipo: 'salon',
              nivel: 'danger',
              icon: 'bi-door-closed-fill',
              titulo: 'Solape de Salón',
              detalle: `Compite con "${c2.nombre}" en ${salonNombre} (${diaStr} ${horaStr}).`,
              otraClaseId: c2.id,
              otraClaseNombre: c2.nombre,
              salonId: salon1,
              salonNombre,
            })

            conflictosMap.get(c2.id).push({
              id: `salon-${c2.id}-${c1.id}`,
              tipo: 'salon',
              nivel: 'danger',
              icon: 'bi-door-closed-fill',
              titulo: 'Solape de Salón',
              detalle: `Compite con "${c1.nombre}" en ${salonNombre} (${diaStr} ${horaStr}).`,
              otraClaseId: c1.id,
              otraClaseNombre: c1.nombre,
              salonId: salon1,
              salonNombre,
            })
          }

          // B. Conflicto de Docente
          if (maestro1 && maestro2 && maestro1 === maestro2) {
            const maestroNombre = maestrosMap.get(maestro1) || 'Docente titular'

            conflictosMap.get(c1.id).push({
              id: `maestro-${c1.id}-${c2.id}`,
              tipo: 'maestro',
              nivel: 'danger',
              icon: 'bi-person-workspace',
              titulo: 'Solape de Docente',
              detalle: `${maestroNombre} asignado a la vez en "${c2.nombre}" (${diaStr} ${horaStr}).`,
              otraClaseId: c2.id,
              otraClaseNombre: c2.nombre,
              maestroId: maestro1,
              maestroNombre,
            })

            conflictosMap.get(c2.id).push({
              id: `maestro-${c2.id}-${c1.id}`,
              tipo: 'maestro',
              nivel: 'danger',
              icon: 'bi-person-workspace',
              titulo: 'Solape de Docente',
              detalle: `${maestroNombre} asignado a la vez en "${c1.nombre}" (${diaStr} ${horaStr}).`,
              otraClaseId: c1.id,
              otraClaseNombre: c1.nombre,
              maestroId: maestro1,
              maestroNombre,
            })
          }

          // C. Conflicto de Alumnos en 2 clases simultáneas (Con discriminación de Acuerdos de Maestros)
          if (alumnos1.size > 0 && alumnos2.size > 0) {
            const comunesConConflicto = []
            const comunesConAcuerdo = []

            alumnos1.forEach((aId) => {
              if (alumnos2.has(aId)) {
                // Verificar si existe un acuerdo inter-cátedra validado para este alumno entre c1 y c2
                const acuerdoExistente = (acuerdos || []).find(ac =>
                  ac.activo &&
                  ac.alumno_id === aId &&
                  ((ac.clase_origen_id === c1.id && ac.clase_destino_id === c2.id) ||
                   (ac.clase_origen_id === c2.id && ac.clase_destino_id === c1.id))
                )

                if (acuerdoExistente) {
                  comunesConAcuerdo.push({
                    alumnoId: aId,
                    alumnoNombre: alumnosMap.get(aId) || 'Estudiante',
                    acuerdo: acuerdoExistente,
                  })
                } else {
                  comunesConConflicto.push(aId)
                }
              }
            })

            // 1. Registrar Acuerdos Validados (Informativo, sin alerta roja/amarilla)
            comunesConAcuerdo.forEach(({ alumnoId, alumnoNombre, acuerdo }) => {
              const infoAcuerdo = {
                id: `acuerdo-${c1.id}-${c2.id}-${alumnoId}`,
                tipo: 'acuerdo_maestros',
                nivel: 'info',
                icon: 'bi-handshake-fill',
                titulo: 'Acuerdo Inter-Cátedra',
                detalle: `Acuerdo entre docentes para ${alumnoNombre}: ${c1.nombre} ➔ ${c2.nombre} (Transición: ${acuerdo.hora_transicion || '16:15'}).`,
                otraClaseId: c2.id,
                otraClaseNombre: c2.nombre,
                alumnoId,
                alumnoNombre,
                horaTransicion: acuerdo.hora_transicion,
                acuerdoId: acuerdo.id,
              }
              conflictosMap.get(c1.id).push(infoAcuerdo)
              conflictosMap.get(c2.id).push({
                ...infoAcuerdo,
                otraClaseId: c1.id,
                otraClaseNombre: c1.nombre,
              })
            })

            // 2. Registrar Conflictos Reales no acordados
            if (comunesConConflicto.length > 0) {
              const comunesNombres = comunesConConflicto.map(id => alumnosMap.get(id) || 'Estudiante')
              
              conflictosMap.get(c1.id).push({
                id: `alumnos-${c1.id}-${c2.id}`,
                tipo: 'alumnos',
                nivel: 'warning',
                icon: 'bi-people-fill',
                titulo: 'Solape de Alumnos',
                detalle: `${comunesConConflicto.length} ${comunesConConflicto.length === 1 ? 'alumno' : 'alumnos'} (${comunesNombres.join(', ')}) en "${c2.nombre}" (${diaStr} ${horaStr}).`,
                otraClaseId: c2.id,
                otraClaseNombre: c2.nombre,
                alumnosComunes: comunesConConflicto,
                alumnosNombres: comunesNombres,
              })

              conflictosMap.get(c2.id).push({
                id: `alumnos-${c2.id}-${c1.id}`,
                tipo: 'alumnos',
                nivel: 'warning',
                icon: 'bi-people-fill',
                titulo: 'Solape de Alumnos',
                detalle: `${comunesConConflicto.length} ${comunesConConflicto.length === 1 ? 'alumno' : 'alumnos'} (${comunesNombres.join(', ')}) en "${c1.nombre}" (${diaStr} ${horaStr}).`,
                otraClaseId: c1.id,
                otraClaseNombre: c1.nombre,
                alumnosComunes: comunesConConflicto,
                alumnosNombres: comunesNombres,
              })
            }
          }
        }
      }
    }
  }

  return conflictosMap
}

/**
 * Agrupa los conflictos de una clase para mostrar EXACTAMENTE UN BADGE por categoría en la tarjeta
 * @param {Array} issues - Lista de issues detectados en la clase
 * @returns {Array} Array de badges consolidados para la ficha
 */
export function consolidarBadgesFichaClase(issues = []) {
  if (!issues || issues.length === 0) return []

  const badges = []
  const issuesPorTipo = new Map()

  issues.forEach(i => {
    if (!issuesPorTipo.has(i.tipo)) issuesPorTipo.set(i.tipo, [])
    issuesPorTipo.get(i.tipo).push(i)
  })

  // 1. Solape de Salón
  if (issuesPorTipo.has('salon')) {
    const list = issuesPorTipo.get('salon')
    badges.push({
      tipo: 'salon',
      nivel: 'danger',
      icon: 'bi-door-closed-fill',
      label: 'Solape Salón',
      tooltip: list.map(x => x.detalle).join(' · '),
    })
  }

  // 2. Solape de Maestro
  if (issuesPorTipo.has('maestro')) {
    const list = issuesPorTipo.get('maestro')
    badges.push({
      tipo: 'maestro',
      nivel: 'danger',
      icon: 'bi-person-workspace',
      label: 'Solape Docente',
      tooltip: list.map(x => x.detalle).join(' · '),
    })
  }

  // 3. Solape de Alumnos (Consolidado: cuenta el total de alumnos únicos afectados sin acuerdo)
  if (issuesPorTipo.has('alumnos')) {
    const list = issuesPorTipo.get('alumnos')
    const todosAlumnosIds = new Set()
    const todosAlumnosNombres = new Set()
    list.forEach(item => {
      (item.alumnosComunes || []).forEach(id => todosAlumnosIds.add(id));
      (item.alumnosNombres || []).forEach(nom => todosAlumnosNombres.add(nom));
    })

    const count = todosAlumnosIds.size
    badges.push({
      tipo: 'alumnos',
      nivel: 'warning',
      icon: 'bi-people-fill',
      label: `${count} ${count === 1 ? 'Alumno Solapado' : 'Alumnos Solapados'}`,
      tooltip: `Afecta a: ${Array.from(todosAlumnosNombres).join(', ')}`,
    })
  }

  // 4. Acuerdos de Maestros (Informativo neutral / positivo)
  if (issuesPorTipo.has('acuerdo_maestros')) {
    const list = issuesPorTipo.get('acuerdo_maestros')
    badges.push({
      tipo: 'acuerdo_maestros',
      nivel: 'info',
      icon: 'bi-handshake-fill',
      label: `${list.length} ${list.length === 1 ? 'Acuerdo Docente' : 'Acuerdos Docentes'}`,
      tooltip: list.map(x => x.detalle).join(' · '),
    })
  }

  // 5. Duplicados
  if (issuesPorTipo.has('duplicados')) {
    const list = issuesPorTipo.get('duplicados')
    badges.push({
      tipo: 'duplicados',
      nivel: 'danger',
      icon: 'bi-people',
      label: 'Alumnos Duplicados',
      tooltip: list.map(x => x.detalle).join(' · '),
    })
  }

  // 6. Pendiente de Revisión
  if (issuesPorTipo.has('revision')) {
    const item = issuesPorTipo.get('revision')[0]
    badges.push({
      tipo: 'revision',
      nivel: 'warning',
      icon: 'bi-flag-fill',
      label: 'En Revisión',
      tooltip: item.detalle,
    })
  }

  // 7. Sin Horario o Sin Maestro
  if (issuesPorTipo.has('horario')) {
    badges.push({
      tipo: 'horario',
      nivel: 'info',
      icon: 'bi-calendar-x',
      label: 'Sin Horario',
      tooltip: 'Clase sin horario asignado',
    })
  }
  if (issuesPorTipo.has('maestro-faltante')) {
    badges.push({
      tipo: 'maestro-faltante',
      nivel: 'info',
      icon: 'bi-person-x',
      label: 'Sin Docente',
      tooltip: 'Clase sin maestro asignado',
    })
  }

  return badges
}
