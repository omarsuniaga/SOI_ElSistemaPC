import { config } from '../../../core/config/config.js'
import { parseDsl, getTokenSummary } from '../utils/dslParser.js'

const LOG_KEY = 'sesion_alumno_log'
const TAREA_KEY = 'maestro_tarea'

async function getSesionAlumnoLogMock(sesionId) {
  const stored = localStorage.getItem(`${LOG_KEY}_${sesionId}`)
  return stored ? JSON.parse(stored) : []
}

async function saveSesionAlumnoLogMock(sesionId, data) {
  localStorage.setItem(`${LOG_KEY}_${sesionId}`, JSON.stringify(data))
  return data
}

async function createMaestroTareaMock(tareaData) {
  const stored = localStorage.getItem(TAREA_KEY)
  const tareas = stored ? JSON.parse(stored) : []

  const nuevaTarea = {
    id: `tarea_${Date.now()}`,
    ...tareaData,
    created_at: new Date().toISOString(),
    estado: 'pendiente',
  }

  tareas.push(nuevaTarea)
  localStorage.setItem(TAREA_KEY, JSON.stringify(tareas))

  return nuevaTarea
}

async function saveDslToSesion(sesionId, dslContent) {
  const parsed = parseDsl(dslContent)

  if (parsed.alumnos.length === 0) {
    return { success: false, message: 'No se encontraron alumnos en el contenido DSL' }
  }

  const logs = []

  for (const nombreAlumno of parsed.alumnos) {
    const log = {
      sesion_id: sesionId,
      alumno_nombre: nombreAlumno,
      contenido: parsed.contenido,
      sugerencias: parsed.sugerencias,
      tareas: parsed.tareas,
      medidas: parsed.medidas,
      calificacion: parsed.calificacion,
      objetivo_id: parsed.objetivos[0] || null,
      created_at: new Date().toISOString(),
    }

    logs.push(log)

    if (parsed.tareas.length > 0) {
      for (const tareaDesc of parsed.tareas) {
        await createMaestroTareaMock({
          descripcion: tareaDesc,
          alumno_nombre: nombreAlumno,
          sesion_id: sesionId,
          fecha_asignacion: new Date().toISOString(),
          fecha_entrega: null,
        })
      }
    }
  }

  if (config.isDemoMode) {
    await saveSesionAlumnoLogMock(sesionId, logs)
  }

  return {
    success: true,
    message: `Guardado para ${logs.length} alumno(s): ${getTokenSummary(parsed)}`,
    logs,
    tareasCreadas: parsed.tareas.length,
  }
}

async function loadDslFromSesion(sesionId) {
  if (config.isDemoMode) {
    return getSesionAlumnoLogMock(sesionId)
  }

  return []
}

export async function saveDslContent(sesionId, dslContent) {
  return saveDslToSesion(sesionId, dslContent)
}

export async function loadDslContent(sesionId) {
  return loadDslFromSesion(sesionId)
}

export function extractTokensFromDsl(dslContent) {
  return parseDsl(dslContent)
}

export function summarizeDsl(dslContent) {
  const parsed = parseDsl(dslContent)
  return getTokenSummary(parsed)
}