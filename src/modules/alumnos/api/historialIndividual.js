import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'
import demo from '../../../assets/data/mocks/student-class-history.json'
import { readHistoryPages } from '../../../portal-maestros/services/studentClassHistoryAdapter.js'
import { buildStudentHistory } from '../../../portal-maestros/domain/studentClassHistory.js'

const sessionColumns = 'id,clase_id,fecha,contenido,contenido_dsl,tema_principal,asistencia,borrador,estado'
const pages = query => readHistoryPages(() => query().order('id'))
async function related(table, columns, key, ids) {
  const result = []
  const unique = [...new Set(ids.filter(Boolean))]
  for (let i = 0; i < unique.length; i += 100) {
    result.push(...await pages(() => supabase.from(table).select(columns).in(key, unique.slice(i, i + 100))))
  }
  return result
}

export function proyectarHistorial(id, data) {
  const entries = buildStudentHistory(id, data)
  const linked = new Set(entries.flatMap(e => e.notes.flatMap(n => n.sources.map(s => s.id))))
  const individual = [
    ...data.progress.filter(p => p.alumno_id === id && !linked.has(p.id)).map(p => ({
      date: p.fecha_evaluacion, text: [p.contenido_dsl, p.observaciones, p.estado_cualitativo,
        p.calificacion != null ? `Calificación: ${p.calificacion}` : '', p.indicadores?.tarea].filter(Boolean).join(' · '),
    })),
    ...data.studentObservations.filter(o => o.alumno_id === id && !linked.has(o.id)).map(o => ({
      date: o.fecha_observacion || o.fecha, text: o.descripcion || o.observacion,
    })),
  ].filter(row => row.text).sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return { entries, individual }
}

export async function cargarHistorialIndividual(id) {
  if (config.isDemoMode) return proyectarHistorial(id, demo)
  const own = table => pages(() => supabase.from(table).select('*').eq('alumno_id', id))
  const [attendance, progress, studentObservations, snapshot] = await Promise.all([
    own('asistencias'), own('progresos'), own('observaciones_alumnos'),
    pages(() => supabase.from('sesiones_clase').select(sessionColumns).filter('asistencia', 'cs', JSON.stringify([{ alumno_id: id }]))),
  ])
  const known = new Set(snapshot.map(s => s.id))
  const missing = attendance.map(a => a.sesion_clase_id).filter(key => !known.has(key))
  const sessions = snapshot.concat(await related('sesiones_clase', sessionColumns, 'id', missing))
  const [classes, sessionObservations] = await Promise.all([
    related('clases', 'id,nombre,instrumento', 'id', sessions.map(s => s.clase_id)),
    related('observaciones_sesion', 'id,sesion_id,contenido_parsed,es_borrador', 'sesion_id', sessions.map(s => s.id)),
  ])
  return proyectarHistorial(id, { sessions, attendance, progress, studentObservations, sessionObservations, classes })
}
