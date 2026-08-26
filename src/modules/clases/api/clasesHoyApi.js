import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'
import { normalizeText } from '../../../core/utils/normalizeText.js'
import { formatHora, timeToMinutes } from '../utils/clasesUtils.js'

export const DIAS_SEMANA = [
  { key: 'lunes', label: 'Lunes', short: 'Lun' },
  { key: 'martes', label: 'Martes', short: 'Mar' },
  { key: 'miercoles', label: 'Miércoles', short: 'Mié' },
  { key: 'jueves', label: 'Jueves', short: 'Jue' },
  { key: 'viernes', label: 'Viernes', short: 'Vie' },
  { key: 'sabado', label: 'Sábado', short: 'Sáb' },
  { key: 'domingo', label: 'Domingo', short: 'Dom' },
]

/**
 * Obtiene el nombre normalizado del día actual (ej: 'lunes', 'martes', etc.)
 */
export function getDiaActualKey(date = new Date()) {
  const dayIndex = date.getDay() // 0 = Domingo, 1 = Lunes, ...
  const map = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  return map[dayIndex]
}

/**
 * Calcula la fecha YYYY-MM-DD correspondiente al día de la semana objetivo en la semana en curso.
 */
export function getFechaParaDiaKey(diaKey) {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Domingo, 1 = Lunes, ...
  const map = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 }
  const targetDay = map[diaKey] !== undefined ? map[diaKey] : currentDay

  const diff = targetDay - currentDay
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff)
  
  const y = targetDate.getFullYear()
  const m = String(targetDate.getMonth() + 1).padStart(2, '0')
  const d = String(targetDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Determina el estado temporal de la clase (en-curso, proxima, pasada, futura)
 */
function calcularEstadoTemporal(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 'futura'
  
  const now = new Date()
  const currentMin = now.getHours() * 60 + now.getMinutes()
  
  const startMin = timeToMinutes(horaInicio)
  const endMin = timeToMinutes(horaFin)
  
  if (currentMin >= startMin && currentMin < endMin) {
    return 'en-curso'
  }
  if (currentMin >= endMin) {
    return 'pasada'
  }
  if (startMin - currentMin <= 30 && startMin - currentMin > 0) {
    return 'proxima'
  }
  return 'futura'
}

/**
 * Normaliza y resuelve la identidad del maestro con fallbacks exhaustivos.
 */
function resolverMaestro(maestroId, maestrosList, maestrosMap, maestrosUserMap) {
  if (!maestroId) {
    return {
      id: null,
      nombre_completo: 'Maestro no asignado',
      email: '',
      telefono: '',
      especialidad: '',
    }
  }

  const m = maestrosMap.get(maestroId) || maestrosUserMap.get(maestroId) || maestrosList.find(x => x.id === maestroId || x.user_id === maestroId)
  if (!m) {
    return {
      id: maestroId,
      nombre_completo: 'Maestro no asignado',
      email: '',
      telefono: '',
      especialidad: '',
    }
  }

  const nombreCompleto = m.nombre_completo?.trim() || 
    (`${m.nombre || ''} ${m.apellido || ''}`).trim() || 
    m.full_name?.trim() || 
    m.email?.split('@')[0] || 
    'Maestro sin nombre'

  return {
    id: m.id,
    nombre_completo: nombreCompleto,
    email: m.email || m.correo || '',
    telefono: m.telefono || m.tlf || '',
    especialidad: m.especialidad_principal || m.instrumento_principal || m.especialidad || '',
  }
}

/**
 * Obtiene las clases programadas para un día específico con maestros, salones, nómina de alumnos
 * y estados de asistencia registrados (presente / ausente / justificado).
 * @param {string|null} diaFiltro - 'lunes', 'martes', etc. Si es null usa el día de hoy.
 */
export async function obtenerClasesDelDia(diaFiltro = null) {
  const diaTarget = (diaFiltro || getDiaActualKey()).toLowerCase()
  const diaNormalized = normalizeText(diaTarget)
  const fechaTarget = getFechaParaDiaKey(diaTarget)

  // 1. Consultas paralelas a todas las fuentes de datos relacionales
  const [
    horariosRes,
    clasesRes,
    salonesRes,
    maestrosRes,
    alumnosClasesRes,
    alumnosRes,
    programasRes,
    asistenciasRes,
    justificacionesRes,
    sesionesClaseRes,
  ] = await Promise.all([
    supabase.from('clase_horarios').select('*').order('hora_inicio', { ascending: true }),
    supabase.from('clases').select('*'),
    supabase.from('salones').select('*'),
    supabase.from('maestros').select('*'),
    supabase.from('alumnos_clases').select('*'),
    supabase.from('alumnos').select('*'),
    supabase.from('programas').select('id, nombre'),
    supabase.from('asistencias').select('*').eq('fecha', fechaTarget),
    supabase.from('justificaciones').select('*').eq('fecha', fechaTarget),
    supabase.from('sesiones_clase').select('*').eq('fecha', fechaTarget),
  ])

  if (horariosRes.error) console.warn('[clasesHoyApi] Warning al cargar clase_horarios:', horariosRes.error)
  if (clasesRes.error) console.warn('[clasesHoyApi] Warning al cargar clases:', clasesRes.error)
  if (alumnosClasesRes.error) console.warn('[clasesHoyApi] Warning al cargar alumnos_clases:', alumnosClasesRes.error)
  if (alumnosRes.error) console.warn('[clasesHoyApi] Warning al cargar alumnos:', alumnosRes.error)

  const rawHorarios = Array.isArray(horariosRes.data) ? horariosRes.data : []
  const rawClases = Array.isArray(clasesRes.data) ? clasesRes.data : []
  const rawSalones = Array.isArray(salonesRes.data) ? salonesRes.data : []
  const rawMaestros = Array.isArray(maestrosRes.data) ? maestrosRes.data : []
  const rawAlumnosClases = Array.isArray(alumnosClasesRes.data) ? alumnosClasesRes.data : []
  const rawAlumnos = Array.isArray(alumnosRes.data) ? alumnosRes.data : []
  const rawProgramas = Array.isArray(programasRes.data) ? programasRes.data : []
  const rawAsistencias = Array.isArray(asistenciasRes.data) ? asistenciasRes.data : []
  const rawJustificaciones = Array.isArray(justificacionesRes.data) ? justificacionesRes.data : []
  const rawSesionesClase = Array.isArray(sesionesClaseRes.data) ? sesionesClaseRes.data : []

  // Mapas para joins en O(1)
  const clasesMap = new Map(rawClases.map(c => [c.id, c]))
  const salonesMap = new Map(rawSalones.map(s => [s.id, s]))
  const maestrosMap = new Map(rawMaestros.map(m => [m.id, m]))
  const maestrosUserMap = new Map(rawMaestros.filter(m => m.user_id).map(m => [m.user_id, m]))
  const programasMap = new Map(rawProgramas.map(p => [p.id, p]))
  const alumnosMap = new Map(rawAlumnos.map(a => [a.id, a]))

  // Indexar Asistencias y Justificaciones de la fecha
  const asistenciasMap = new Map()
  const clasesConAsistenciaSet = new Set()

  for (const a of rawAsistencias) {
    if (a.clase_id && a.alumno_id) {
      asistenciasMap.set(`${a.clase_id}_${a.alumno_id}`, a)
      clasesConAsistenciaSet.add(a.clase_id)
    }
  }

  for (const sc of rawSesionesClase) {
    if (sc.clase_id && (sc.asistencia_tomada || sc.asistencia_registrada || sc.estado === 'realizada' || sc.estado === 'completada')) {
      clasesConAsistenciaSet.add(sc.clase_id)
    }
  }

  const justificacionesMap = new Map()
  for (const j of rawJustificaciones) {
    if (j.alumno_id) {
      if (j.clase_id) justificacionesMap.set(`${j.clase_id}_${j.alumno_id}`, j)
      justificacionesMap.set(`alumno_${j.alumno_id}`, j)
      if (j.clase_id) clasesConAsistenciaSet.add(j.clase_id)
    }
  }

  // Agrupar alumnos inscritos por clase
  const alumnosPorClaseMap = new Map()

  for (const ac of rawAlumnosClases) {
    if (!ac.clase_id || !ac.alumno_id) continue
    if (ac.activo === false) continue // Omitir solo si está explícitamente dado de baja

    const alumno = alumnosMap.get(ac.alumno_id) || ac.alumno || ac.alumnos
    const nombre = alumno?.nombre_completo?.trim() || 
      (`${alumno?.nombre || ''} ${alumno?.apellido || ''}`).trim() || 
      alumno?.full_name?.trim() || 
      'Estudiante sin nombre'

    if (!alumnosPorClaseMap.has(ac.clase_id)) {
      alumnosPorClaseMap.set(ac.clase_id, [])
    }
    
    alumnosPorClaseMap.get(ac.clase_id).push({
      id: ac.alumno_id,
      nombre,
      codigo: alumno?.codigo_alumno || alumno?.codigo || '',
      instrumento: alumno?.instrumento_principal || alumno?.instrumento || '',
      nivel: alumno?.nivel || '',
      hora_inicio: ac.hora_inicio || null,
      hora_fin: ac.hora_fin || null,
      is_active: alumno?.activo !== false,
    })
  }

  // Fallback complementario: Si una clase contiene alumnos_ids directamente en el modelo
  for (const c of rawClases) {
    if (Array.isArray(c.alumnos_ids) && c.alumnos_ids.length > 0) {
      if (!alumnosPorClaseMap.has(c.id)) {
        alumnosPorClaseMap.set(c.id, [])
      }
      const existingSet = new Set((alumnosPorClaseMap.get(c.id) || []).map(a => a.id))
      for (const alId of c.alumnos_ids) {
        if (!existingSet.has(alId)) {
          const alumno = alumnosMap.get(alId)
          if (alumno) {
            alumnosPorClaseMap.get(c.id).push({
              id: alId,
              nombre: alumno.nombre_completo || `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim() || 'Estudiante',
              codigo: alumno.codigo_alumno || '',
              instrumento: alumno.instrumento_principal || '',
              nivel: alumno.nivel || '',
              is_active: alumno.activo !== false,
            })
          }
        }
      }
    }
  }

  // Filtrar horarios que correspondan al día objetivo
  const horariosDelDia = rawHorarios.filter(h => {
    if (!h.dia) return false
    const hDiaNorm = normalizeText(h.dia.toLowerCase().trim())
    return hDiaNorm === diaNormalized || hDiaNorm.startsWith(diaNormalized.slice(0, 4))
  })

  // Construir las entidades completas
  const sesiones = []
  const salonesOcupadosSet = new Set()
  const maestrosActivosSet = new Set()
  let totalAlumnosConvocados = 0

  for (const h of horariosDelDia) {
    const clase = clasesMap.get(h.clase_id)
    if (!clase) continue
    if (clase.activo === false) continue // Omitir clases inactivas

    const salon = salonesMap.get(h.salon_id) || {
      id: h.salon_id,
      nombre: 'Salón no asignado',
      capacidad: clase.capacidad_maxima ?? 20,
      ubicacion: '',
    }

    // Resolver ID del maestro titular
    const maestroId = clase.maestro_principal_id || clase.maestro_id || h.maestro_id || clase.profesor_id || clase.docente_id
    const maestroPrincipal = resolverMaestro(maestroId, rawMaestros, maestrosMap, maestrosUserMap)

    const suplenteId = clase.maestro_suplente_id || clase.maestro_auxiliar_id || h.maestro_suplente_id
    const maestroSuplente = suplenteId ? resolverMaestro(suplenteId, rawMaestros, maestrosMap, maestrosUserMap) : null

    const rawAlumnosList = [...(alumnosPorClaseMap.get(clase.id) || [])]
    rawAlumnosList.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    const isAsistenciaRegistrada = clasesConAsistenciaSet.has(clase.id)
    let totalPresentes = 0
    let totalAusentes = 0
    let totalJustificados = 0

    const alumnosInscritos = rawAlumnosList.map((al) => {
      if (!isAsistenciaRegistrada) {
        return {
          ...al,
          estado_asistencia: null,
          asistencia_registrada: false,
          justificacion: null,
        }
      }

      const asisRecord = asistenciasMap.get(`${clase.id}_${al.id}`)
      const justRecord = justificacionesMap.get(`${clase.id}_${al.id}`) || justificacionesMap.get(`alumno_${al.id}`)

      let estadoAsis = 'ausente'
      let motivoJust = null
      let evidenciaJust = null

      if (justRecord || asisRecord?.estado === 'justificado' || asisRecord?.estado === 'J') {
        estadoAsis = 'justificado'
        totalJustificados += 1
        motivoJust = justRecord?.motivo || asisRecord?.justificacion_texto || asisRecord?.observaciones || asisRecord?.motivo || 'Justificación médica / académica asentada por el docente titular.'
        evidenciaJust = justRecord?.evidencia_url || null
      } else if (asisRecord?.estado === 'presente' || asisRecord?.estado === 'P' || asisRecord?.estado === 'tarde' || asisRecord?.estado === 'T') {
        estadoAsis = 'presente'
        totalPresentes += 1
      } else if (asisRecord?.estado === 'ausente' || asisRecord?.estado === 'A') {
        estadoAsis = 'ausente'
        totalAusentes += 1
      } else {
        estadoAsis = 'ausente'
        totalAusentes += 1
      }

      return {
        ...al,
        estado_asistencia: estadoAsis,
        asistencia_registrada: true,
        justificacion: estadoAsis === 'justificado' ? {
          motivo: motivoJust,
          evidencia_url: evidenciaJust,
          fecha: fechaTarget,
        } : null,
      }
    })

    const estadoTemporal = calcularEstadoTemporal(h.hora_inicio, h.hora_fin)

    if (salon.id) salonesOcupadosSet.add(salon.id)
    if (maestroPrincipal.id) maestrosActivosSet.add(maestroPrincipal.id)
    totalAlumnosConvocados += alumnosInscritos.length

    const programaNombre = clase.programas?.nombre || (clase.programa_id ? programasMap.get(clase.programa_id)?.nombre : null) || 'General'

    sesiones.push({
      horario_id: h.id,
      clase_id: clase.id,
      clase_nombre: clase.nombre || 'Clase sin nombre',
      programa_nombre: programaNombre,
      instrumento: clase.instrumento || 'General',
      nivel: clase.nivel_id || clase.nivel || 'Nivel 1',
      dia: h.dia,
      fecha: fechaTarget,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      hora_inicio_formato: formatHora(h.hora_inicio),
      hora_fin_formato: formatHora(h.hora_fin),
      estado_temporal: estadoTemporal,
      asistencia_registrada: isAsistenciaRegistrada,
      total_presentes: totalPresentes,
      total_ausentes: totalAusentes,
      total_justificados: totalJustificados,
      capacidad_maxima: clase.capacidad_maxima ?? salon.capacidad ?? 20,
      salon,
      maestro_principal: maestroPrincipal,
      maestro_suplente: maestroSuplente,
      alumnos: alumnosInscritos,
      total_alumnos: alumnosInscritos.length,
      porcentaje_ocupacion: Math.min(100, Math.round((alumnosInscritos.length / (clase.capacidad_maxima || 20)) * 100)),
    })
  }

  // Ordenar por hora de inicio cronológicamente
  sesiones.sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio))

  const enCursoCount = sesiones.filter(s => s.estado_temporal === 'en-curso').length
  const proximaCount = sesiones.filter(s => s.estado_temporal === 'proxima').length

  return {
    dia: diaTarget,
    fecha: fechaTarget,
    diaLabel: DIAS_SEMANA.find(d => d.key === diaTarget)?.label || diaTarget,
    totalClases: sesiones.length,
    enCursoCount,
    proximaCount,
    salonesOcupadosCount: salonesOcupadosSet.size,
    maestrosActivosCount: maestrosActivosSet.size,
    totalAlumnosConvocados,
    sesiones,
  }
}
