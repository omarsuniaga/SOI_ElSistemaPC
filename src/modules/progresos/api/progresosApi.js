import { supabase } from '../../../lib/supabaseClient.js'
import { Progreso } from '../models/progreso.model.js'

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

/**
 * Build a structured VALIDATION error from model errors.
 */
function buildValidationError(errores) {
  const e = new Error(errores[0])
  e.code = 'VALIDATION'
  e.errors = errores
  return e
}

/**
 * Translate a Supabase write error into a structured error with a code.
 */
function handleWriteError(error) {
  if (error.code === '23505' || (error.message && error.message.includes('duplicate key'))) {
    const e = new Error('Ya existe una evaluación con ese tipo para este alumno en esta clase')
    e.code = 'DUPLICATE'
    throw e
  }
  if (error.code === '42501' || (error.message && /row-level security/i.test(error.message))) {
    const e = new Error('No tienes permiso para registrar progresos (evaluacion:write).')
    e.code = 'RLS_DENIED'
    throw e
  }
  throw error
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

export async function crearProgreso(progresoData) {
  const model = new Progreso(progresoData)
  const errores = model.validate()
  if (errores.length > 0) throw buildValidationError(errores)

  const payload = model.toJSON() // correctly emits evaluacion_tipo, estado_cualitativo

  // Attach extras not captured by the base model
  if (progresoData.sesion_clase_id) payload.sesion_clase_id = progresoData.sesion_clase_id
  if (progresoData.asistencia_id)   payload.asistencia_id   = progresoData.asistencia_id
  if (progresoData.ejercicio_id)    payload.ejercicio_id    = progresoData.ejercicio_id
  if (progresoData.indicadores)     payload.indicadores     = progresoData.indicadores

  const { data, error } = await supabase
    .from('progresos')
    .insert([payload])
    .select()

  if (error) handleWriteError(error)
  return data[0]
}

export async function actualizarProgreso(id, actualizaciones) {
  // Validate any calificacion change via the model
  if (actualizaciones.calificacion !== undefined) {
    const tempModel = new Progreso({
      alumno_id: 'placeholder',
      clase_id: 'placeholder',
      tipo_evaluacion: 'parcial',
      calificacion: actualizaciones.calificacion,
    })
    const errores = tempModel.validate().filter(e => e.includes('calificación'))
    if (errores.length > 0) throw buildValidationError(errores)
  }

  const datosActualizacion = {}

  if (actualizaciones.alumno_id !== undefined)         datosActualizacion.alumno_id         = actualizaciones.alumno_id
  if (actualizaciones.clase_id !== undefined)          datosActualizacion.clase_id          = actualizaciones.clase_id
  if (actualizaciones.maestro_id !== undefined)        datosActualizacion.maestro_id        = actualizaciones.maestro_id
  if (actualizaciones.fecha_evaluacion !== undefined)  datosActualizacion.fecha_evaluacion  = actualizaciones.fecha_evaluacion
  if (actualizaciones.evaluacion_tipo !== undefined)   datosActualizacion.evaluacion_tipo   = actualizaciones.evaluacion_tipo.trim()
  if (actualizaciones.calificacion !== undefined) {
    const calif = parseFloat(actualizaciones.calificacion)
    datosActualizacion.calificacion = isNaN(calif) ? null : calif
  }
  if (actualizaciones.estado_cualitativo !== undefined) datosActualizacion.estado_cualitativo = actualizaciones.estado_cualitativo
  if (actualizaciones.observaciones !== undefined)      datosActualizacion.observaciones      = (actualizaciones.observaciones || '').trim()
  if (actualizaciones.indicadores !== undefined)        datosActualizacion.indicadores        = actualizaciones.indicadores

  const { data, error } = await supabase
    .from('progresos')
    .update(datosActualizacion)
    .eq('id', id)
    .select()

  if (error) handleWriteError(error)
  return data[0]
}

export async function eliminarProgreso(id) {
  const { error } = await supabase
    .from('progresos')
    .delete()
    .eq('id', id)

  if (error) handleWriteError(error)
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
      getTipoLabelLocal(p.tipo_evaluacion || p.evaluacion_tipo),
      p.calificacion !== null ? p.calificacion.toFixed(2) : '-',
      getCalificacionLabelLocal(p.calificacion),
      p.observaciones ? p.observaciones.substring(0, 40) + (p.observaciones.length > 40 ? '...' : '') : '-',
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
  if (calif >= 9) return 'Sobresaliente'
  if (calif >= 7) return 'Muy Bueno'
  if (calif >= 5) return 'Bueno'
  if (calif >= 3) return 'En Progreso'
  return 'Necesita Mejorar'
}
