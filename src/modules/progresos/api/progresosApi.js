import { supabase } from '../../../lib/supabaseClient.js'
import { aggregateStudentProgress, aggregateBatch, InvalidWindowError } from '../services/progresoAggregationService.js'
import { format as formatProgressHistory } from '../services/progressHistoryFormatter.js'
import * as asistenciasRepo from '../repositories/asistenciasRepo.js'
import * as progresosRepo from '../repositories/progresosRepo.js'
import * as indicatorAttemptsRepo from '../repositories/indicatorAttemptsRepo.js'
import * as observacionesRepo from '../repositories/observacionesRepo.js'

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

export function getNivelLabel(nivel) {
  const found = NIVELES.find(n => n.value === nivel)
  return found ? found.label : nivel || '-'
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

  return data
}

export async function obtenerClases() {
  const { data, error } = await supabase
    .from('clases')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error cargando clases:', error.message)
    throw new Error('No se pudieron cargar las clases')
  }

  return data
}

export async function obtenerMaestros() {
  const { data, error } = await supabase
    .from('maestros')
    .select('*')
    .order('nombre_completo', { ascending: true })

  if (error) {
    console.error('Error cargando maestros:', error.message)
    throw new Error('No se pudieron cargar los maestros')
  }

  return data
}

export async function obtenerProgresos() {
  const { data, error } = await supabase
    .from('progresos')
    .select('*')
    .order('fecha_evaluacion', { ascending: false })

  if (error) {
    console.error('Error cargando progresos:', error.message)
    throw new Error('No se pudieron cargar los progresos')
  }

  return data
}

export async function obtenerProgreso(id) {
  const { data, error } = await supabase
    .from('progresos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error cargando progreso:', error.message)
    throw new Error('Progreso no encontrado')
  }

  return data
}

export async function crearProgreso(progreso) {
  if (!progreso.alumno_id) {
    throw new Error('El alumno es obligatorio')
  }

  if (!progreso.clase_id) {
    throw new Error('La clase es obligatoria')
  }

  if (!progreso.evaluacion_tipo) {
    throw new Error('El tipo de evaluacion es obligatorio')
  }

  const datosLimpios = {
    alumno_id: progreso.alumno_id,
    clase_id: progreso.clase_id,
    maestro_id: progreso.maestro_id || null,
    fecha_evaluacion: progreso.fecha_evaluacion || null,
    evaluacion_tipo: progreso.evaluacion_tipo.trim(),
    calificacion: progreso.calificacion !== undefined && progreso.calificacion !== null
      ? parseFloat(progreso.calificacion)
      : null,
    estado_cualitativo: (progreso.estado_cualitativo || 'en_progreso').trim(),
    observaciones: (progreso.observaciones || '').trim(),
    indicadores: progreso.indicadores || null,
  }

  if (progreso.sesion_clase_id) datosLimpios.sesion_clase_id = progreso.sesion_clase_id
  if (progreso.asistencia_id) datosLimpios.asistencia_id = progreso.asistencia_id
  if (progreso.ejercicio_id) datosLimpios.ejercicio_id = progreso.ejercicio_id

  if (datosLimpios.calificacion !== null) {
    if (datosLimpios.calificacion < 0 || datosLimpios.calificacion > 5) {
      throw new Error('La calificacion debe estar entre 0 y 5')
    }
  }

  const { data, error } = await supabase
    .from('progresos')
    .insert([datosLimpios])
    .select()

  if (error) {
    if (error.message.includes('duplicate key') || error.code === '23505') {
      throw new Error('Ya existe una evaluacion con ese tipo para este alumno en esta clase')
    }
    console.error('Error creando progreso:', error.message)
    throw new Error('No se pudo crear el progreso')
  }

  return data[0]
}

export async function actualizarProgreso(id, actualizaciones) {
  const datosActualizacion = {}

  if (actualizaciones.alumno_id !== undefined) {
    datosActualizacion.alumno_id = actualizaciones.alumno_id
  }

  if (actualizaciones.clase_id !== undefined) {
    datosActualizacion.clase_id = actualizaciones.clase_id
  }

  if (actualizaciones.maestro_id !== undefined) {
    datosActualizacion.maestro_id = actualizaciones.maestro_id
  }

  if (actualizaciones.fecha_evaluacion !== undefined) {
    datosActualizacion.fecha_evaluacion = actualizaciones.fecha_evaluacion
  }

  if (actualizaciones.evaluacion_tipo !== undefined) {
    datosActualizacion.evaluacion_tipo = actualizaciones.evaluacion_tipo.trim()
  }

  if (actualizaciones.calificacion !== undefined) {
    const calif = parseFloat(actualizaciones.calificacion)
    if (!isNaN(calif) && (calif < 0 || calif > 5)) {
      throw new Error('La calificacion debe estar entre 0 y 5')
    }
    datosActualizacion.calificacion = isNaN(calif) ? null : calif
  }

  if (actualizaciones.estado_cualitativo !== undefined) {
    datosActualizacion.estado_cualitativo = actualizaciones.estado_cualitativo
  }

  if (actualizaciones.observaciones !== undefined) {
    datosActualizacion.observaciones = (actualizaciones.observaciones || '').trim()
  }

  if (actualizaciones.indicadores !== undefined) {
    datosActualizacion.indicadores = actualizaciones.indicadores
  }

  const { data, error } = await supabase
    .from('progresos')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) {
    if (error.message.includes('duplicate key') || error.code === '23505') {
      throw new Error('Ya existe una evaluacion con ese tipo para este alumno en esta clase')
    }
    console.error('Error actualizando progreso:', error.message)
    throw new Error('No se pudo actualizar el progreso')
  }

  return data[0]
}

export async function eliminarProgreso(id) {
  const { error } = await supabase
    .from('progresos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error eliminando progreso:', error.message)
    throw new Error('No se pudo eliminar el progreso')
  }
}

export async function obtenerProgresosPorAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('progresos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha_evaluacion', { ascending: false })

  if (error) {
    console.error('Error cargando progresos del alumno:', error.message)
    throw new Error('No se pudieron cargar los progresos del alumno')
  }

  return data
}

export async function obtenerProgresosPorClase(claseId) {
  const { data, error } = await supabase
    .from('progresos')
    .select('*')
    .eq('clase_id', claseId)
    .order('fecha_evaluacion', { ascending: false })

  if (error) {
    console.error('Error cargando progresos de la clase:', error.message)
    throw new Error('No se pudieron cargar los progresos de la clase')
  }

  return data
}

export async function obtenerProgresosPorMaestro(maestroId) {
  const { data, error } = await supabase
    .from('progresos')
    .select('*')
    .eq('maestro_id', maestroId)
    .order('fecha_evaluacion', { ascending: false })

  if (error) {
    console.error('Error cargando progresos del maestro:', error.message)
    throw new Error('No se pudieron cargar los progresos del maestro')
  }

  return data
}

export async function obtenerBoletinAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('progresos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha_evaluacion', { ascending: false })

  if (error) {
    console.error('Error cargando boletin:', error.message)
    throw new Error('No se pudo cargar el boletin del alumno')
  }

  return data
}

export async function getPromedioAlumno(alumnoId) {
  const { data, error } = await supabase
    .from('progresos')
    .select('calificacion')
    .eq('alumno_id', alumnoId)
    .not('calificacion', 'is', null)

  if (error) {
    console.error('Error calculando promedio:', error.message)
    throw new Error('No se pudo calcular el promedio')
  }

  if (!data || data.length === 0) return null

  const suma = data.reduce((acc, p) => acc + parseFloat(p.calificacion), 0)
  return parseFloat((suma / data.length).toFixed(2))
}

export async function getPromedioClase(claseId) {
  const { data, error } = await supabase
    .from('progresos')
    .select('calificacion')
    .eq('clase_id', claseId)
    .not('calificacion', 'is', null)

  if (error) {
    console.error('Error calculando promedio de clase:', error.message)
    throw new Error('No se pudo calcular el promedio de la clase')
  }

  if (!data || data.length === 0) return null

  const suma = data.reduce((acc, p) => acc + parseFloat(p.calificacion), 0)
  return parseFloat((suma / data.length).toFixed(2))
}

export async function exportarBoletinPDF(alumno, progresos) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()
  const nombreAlumno = alumno.name || alumno.nombre || 'Sin nombre'
  const seccion = alumno.section || 'Sin sección'
  const promedio = calcularPromedioLocal(progresos)
  const enRiesgo = promedio !== null && getRiesgoLocal(promedio)

  doc.setFontSize(18)
  doc.text('Boletín Académico', 14, 22)

  doc.setFontSize(11)
  doc.text(`Alumno: ${nombreAlumno}`, 14, 32)
  doc.text(`Sección: ${seccion}`, 14, 38)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 44)

  const estadoTexto = enRiesgo ? 'EN RIESGO' : 'SATISFACTORIO'
  const estadoColor = enRiesgo ? [185, 27, 27] : [39, 174, 96]
  
  doc.setFillColor(...estadoColor)
  doc.rect(14, 50, 60, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text(estadoTexto, 18, 57)
  doc.setTextColor(0, 0, 0)

  doc.setFontSize(12)
  doc.text(`Promedio: ${promedio !== null ? promedio.toFixed(2) : 'N/A'}`, 80, 55)
  doc.text(`Evaluaciones: ${progresos.length}`, 80, 62)

  if (progresos.length > 0) {
    const tableData = progresos.map(p => [
      p.fecha_evaluacion ? formatDateLocal(p.fecha_evaluacion) : '-',
      getTipoLabelLocal(p.tipo_evaluacion),
      p.calificacion !== null ? p.calificacion.toFixed(2) : '-',
      getCalificacionLabelLocal(p.calificacion),
      p.observaciones ? p.observaciones.substring(0, 40) + (p.observaciones.length > 40 ? '...' : '') : '-'
    ])

    autoTable(doc, {
      head: [['Fecha', 'Tipo', 'Calificación', 'Etiqueta', 'Observaciones']],
      body: tableData,
      startY: 70,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    })
  }

  doc.save(`boletin-${nombreAlumno.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

function calcularPromedioLocal(arr) {
  if (!arr || arr.length === 0) return null
  const nums = arr.filter(p => p.calificacion !== null && p.calificacion !== undefined).map(p => parseFloat(p.calificacion))
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function getRiesgoLocal(calificacion) {
  if (calificacion === null || calificacion === undefined) return false
  return parseFloat(calificacion) < 3
}

function formatDateLocal(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getTipoLabelLocal(tipo) {
  const labels = { oral: 'Oral', escrita: 'Escrita', practica: 'Práctica', evaluacion_parcial: 'Parcial', evaluacion_final: 'Final' }
  return labels[tipo] || tipo || '-'
}

function getCalificacionLabelLocal(calificacion) {
  if (calificacion === null || calificacion === undefined) return '-'
  const calif = parseFloat(calificacion)
  if (calif >= 4.5) return 'Sobresaliente'
  if (calif >= 4) return 'Muy Bueno'
  if (calif >= 3) return 'Bueno'
  if (calif >= 2) return 'En Progreso'
  return 'Necesita Mejorar'
}

/**
 * Phase B: Aggregates student progress from all sources
 * Orchestrates bulk fetches and aggregation
 * @param {string} alumnoId - Student ID
 * @param {Object} options - { claseId, periodoId, from, to }
 * @returns {Promise<Object>} StudentProgress DTO
 * @throws {InvalidWindowError} if from > to
 */
export async function getStudentProgress(alumnoId, { claseId, periodoId, from, to }) {
  if (from > to) {
    throw new InvalidWindowError('Date window invalid: from must be <= to')
  }

  // Parallel fetch from all sources
  const [asistencias, progresos, indicatorAttempts, observaciones] = await Promise.all([
    asistenciasRepo.fetchBulk({ alumnoIds: [alumnoId], claseId, periodoId, from, to }),
    progresosRepo.fetchBulk({ alumnoIds: [alumnoId], claseId, periodoId, from, to }),
    indicatorAttemptsRepo.fetchBulk({ alumnoIds: [alumnoId], claseId, periodoId, from, to }),
    observacionesRepo.fetchBulk({ alumnoIds: [alumnoId], claseId, periodoId, from, to }),
  ])

  // Aggregate into DTO
  return aggregateStudentProgress(alumnoId, {
    from,
    to,
    sources: { asistencias, progresos, indicatorAttempts, observaciones },
  })
}

/**
 * Phase B: Aggregates progress for multiple students in one batch
 * Executes exactly 4 database round-trips regardless of student count (no N+1)
 * @param {Array<string>} alumnoIds - List of student IDs
 * @param {Object} options - { claseId, periodoId, from, to }
 * @returns {Promise<Map>} Map<alumnoId, StudentProgress>
 * @throws {InvalidWindowError} if from > to
 */
export async function getStudentProgressBatch(alumnoIds, { claseId, periodoId, from, to }) {
  if (from > to) {
    throw new InvalidWindowError('Date window invalid: from must be <= to')
  }

  // Parallel fetch from all sources (uses .in() for bulk filter, no N+1)
  const [asistencias, progresos, indicatorAttempts, observaciones] = await Promise.all([
    asistenciasRepo.fetchBulk({ alumnoIds, claseId, periodoId, from, to }),
    progresosRepo.fetchBulk({ alumnoIds, claseId, periodoId, from, to }),
    indicatorAttemptsRepo.fetchBulk({ alumnoIds, claseId, periodoId, from, to }),
    observacionesRepo.fetchBulk({ alumnoIds, claseId, periodoId, from, to }),
  ])

  // Aggregate all students in one pass
  return aggregateBatch(alumnoIds, {
    from,
    to,
    sources: { asistencias, progresos, indicatorAttempts, observaciones },
  })
}

/**
 * Phase B: Gets progress history for multiple students with configurable granularity
 * Executes exactly 4 database round-trips regardless of student count (no N+1)
 * @param {Object} options - { alumnoIds, from, to, granularity = 'week' }
 * @returns {Promise<Map>} Map<alumnoId, ProgressHistory>
 * @throws {InvalidWindowError} if from > to
 */
export async function getProgressHistory({
  alumnoIds,
  from,
  to,
  granularity = 'week',
  claseId,
  periodoId,
}) {
  if (from > to) {
    throw new InvalidWindowError('Date window invalid: from must be <= to')
  }

  // Parallel fetch from all sources (uses .in() for bulk filter, no N+1)
  const [asistencias, progresos, indicatorAttempts, observaciones] = await Promise.all([
    asistenciasRepo.fetchBulk({ alumnoIds, claseId, periodoId, from, to }),
    progresosRepo.fetchBulk({ alumnoIds, claseId, periodoId, from, to }),
    indicatorAttemptsRepo.fetchBulk({ alumnoIds, claseId, periodoId, from, to }),
    observacionesRepo.fetchBulk({ alumnoIds, claseId, periodoId, from, to }),
  ])

  // Format into continuous timeline with bucketing
  return formatProgressHistory({
    alumnoIds,
    from,
    to,
    granularity,
    asis: asistencias,
    prog: progresos,
    attempts: indicatorAttempts,
    obs: observaciones,
  })
}
