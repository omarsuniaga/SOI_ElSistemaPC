import { supabase } from '../../lib/supabaseClient.js'
import { config } from '../../core/config/config.js'
import demo from '../../assets/data/mocks/student-class-history.json'
import { buildStudentHistory } from '../domain/studentClassHistory.js'
import { buildObservationSignature } from './observationSignature.js'

const PAGE_SIZE = 500
const CHUNK_SIZE = 100
export async function readHistoryPages(makeQuery) {
  const rows = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await makeQuery().range(offset, offset + PAGE_SIZE - 1)
    if (error) throw new Error(error.message || 'No se pudo consultar el historial')
    rows.push(...(data || []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}
const chunks = ids => Array.from({ length: Math.ceil(ids.length / CHUNK_SIZE) }, (_, i) => ids.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE))
const order = query => query.order('fecha', { ascending: false }).order('id', { ascending: false })
const inPeriod = (query, from, to) => {
  if (from) query = query.gte('fecha', from)
  if (to) query = query.lte('fecha', to)
  return query
}

/** Narrow adapter: the view receives authorized, student-specific evidence, never raw group observations. */
export function createStudentClassHistoryAdapter(client = supabase, options = {}) {
  const useDemo = () => options.demo ?? (config.isDemoMode || import.meta.env.VITE_USE_MOCK === 'true')
  const demoData = structuredClone(options.data || demo)

  async function load(studentId, maestroId, { from = null, to = null } = {}) {
    if (!studentId || !maestroId) throw new Error('Falta alumno o maestro para consultar el historial')
    let classes, sessions, attendance, progress, studentObservations, sessionObservations, teachers
    if (useDemo()) {
      classes = demoData.classes.filter(c => [c.maestro_principal_id, c.maestro_suplente_id, c.maestro_id].includes(maestroId))
      const allowed = new Set(classes.map(c => c.id))
      sessions = demoData.sessions.filter(s => allowed.has(s.clase_id) && (!from || s.fecha >= from) && (!to || s.fecha <= to))
      ;({ attendance = [], progress = [], studentObservations = [], sessionObservations = [], teachers = [] } = demoData)
    } else {
      const classResult = await client.from('clases').select('id,nombre,instrumento,maestro_principal_id,maestro_suplente_id,maestro_id')
        .or(`maestro_principal_id.eq.${maestroId},maestro_suplente_id.eq.${maestroId},maestro_id.eq.${maestroId}`)
      if (classResult.error) throw new Error(classResult.error.message)
      classes = classResult.data || []
      const classIds = classes.map(c => c.id)
      if (!classIds.length) throw new Error('No tienes clases autorizadas para consultar este historial')
      attendance = (await Promise.all(chunks(classIds).map(ids => readHistoryPages(() => order(inPeriod(client.from('asistencias')
        .select('id,alumno_id,sesion_clase_id,clase_id,fecha,estado,observaciones,valoracion').eq('alumno_id', studentId).in('clase_id', ids), from, to)))))).flat()
      const byJson = (await Promise.all(chunks(classIds).map(ids => readHistoryPages(() => order(inPeriod(client.from('sesiones_clase')
        .select('id,clase_id,maestro_id,fecha,contenido,contenido_dsl,tema_principal,asistencia,borrador,estado').in('clase_id', ids)
        .filter('asistencia', 'cs', JSON.stringify([{ alumno_id: studentId }])), from, to)))))).flat()
      // Relational attendance may survive an older JSON snapshot. Resolve only sessions in authorized classes.
      const known = new Set(byJson.map(s => s.id))
      const missingIds = [...new Set(attendance.map(a => a.sesion_clase_id).filter(id => id && !known.has(id)))]
      const extra = (await Promise.all(chunks(missingIds).map(ids => readHistoryPages(() => order(client.from('sesiones_clase')
        .select('id,clase_id,maestro_id,fecha,contenido,contenido_dsl,tema_principal,asistencia,borrador,estado').in('id', ids).in('clase_id', classIds)))))).flat()
      sessions = [...byJson, ...extra].filter(s => (!from || s.fecha >= from) && (!to || s.fecha <= to))
      const sessionIds = [...new Set(sessions.map(s => s.id))]
      // No query for all student notes: scope by student AND the authorized session IDs.
      const related = async (table, columns, field, studentField) => (await Promise.all(chunks(sessionIds).map(ids => readHistoryPages(() => {
        let q = client.from(table).select(columns).in(field, ids)
        if (studentField) q = q.eq(studentField, studentId)
        return q.order('id', { ascending: true })
      })))).flat()
      ;[progress, studentObservations, sessionObservations] = await Promise.all([
        related('progresos', 'id,alumno_id,sesion_clase_id,clase_id,maestro_id,contenido_dsl,estado_cualitativo,calificacion,observaciones,indicadores', 'sesion_clase_id', 'alumno_id'),
        related('observaciones_alumnos', 'id,alumno_id,sesion_clase_id,maestro_id,descripcion,observacion', 'sesion_clase_id', 'alumno_id'),
        related('observaciones_sesion', 'id,sesion_id,contenido_parsed,es_borrador,created_at', 'sesion_id'),
      ])
      const teacherIds = [...new Set([...studentObservations, ...progress].map(o => o.maestro_id).filter(Boolean))]
      teachers = (await Promise.all(chunks(teacherIds).map(ids => readHistoryPages(() => client.from('maestros')
        .select('id,nombre_completo').in('id', ids).order('id', { ascending: true }))))).flat()
    }
    const entries = buildStudentHistory(studentId, { classes, sessions, attendance, progress, studentObservations, sessionObservations, teachers })
    const allowedIds = new Set(classes.map(c => c.id))
    // Permit an empty timeline for a currently enrolled student, but reject arbitrary profile IDs.
    let enrolled = false
    if (!entries.length && !useDemo()) {
      const result = await client.from('alumnos_clases').select('clase_id').eq('alumno_id', studentId).eq('activo', true).in('clase_id', [...allowedIds])
      if (result.error) throw new Error(result.error.message)
      enrolled = !!result.data?.length
    }
    if (!entries.length && !enrolled && !useDemo()) throw new Error('Alumno fuera de tus clases autorizadas')
    return { entries, classes, source: useDemo() ? 'demo' : 'real', student: useDemo() ? demoData.students?.find(s => s.id === studentId) : null }
  }

  async function confirmRecovery({ studentId, maestro, originalId, recoveryId }) {
    if (!useDemo() && navigator.onLine === false) throw new Error('Conéctate para confirmar una recuperación; tus observaciones guardadas sin conexión siguen sincronizándose normalmente.')
    // Re-read at action time. Never trust a cached card or a caller-provided class ID.
    const { entries, classes } = await load(studentId, maestro?.id)
    const original = entries.find(e => e.id === originalId)
    const recovery = entries.find(e => e.id === recoveryId)
    if (!original || original.participated || !recovery?.participated || original.classId !== recovery.classId || recovery.date <= original.date) throw new Error('Selecciona una clase posterior asistida de la misma cátedra')
    if (original.recovery) return { saved: true, alreadyConfirmed: true }
    const clazz = classes.find(c => c.id === recovery.classId)
    const payload = { id: crypto.randomUUID(), sesion_id: recovery.id, maestro_id: clazz.maestro_principal_id || clazz.maestro_id || maestro.id,
      contenido_raw: 'Recuperación confirmada por el maestro', es_borrador: false,
      contenido_parsed: { _author: buildObservationSignature(maestro.id, { clase: clazz, actorMaestroId: maestro.id, actorNombre: maestro.nombre_completo || maestro.nombre, maestroUserId: maestro.user_id }),
        _history_recovery: { alumno_id: studentId, original_sesion_id: originalId } } }
    if (useDemo()) { demoData.sessionObservations.push(payload); return { saved: true } }
    const { error } = await client.from('observaciones_sesion').upsert(payload, { onConflict: 'id' })
    if (error) throw new Error(error.message)
    return { saved: true }
  }
  return { load, confirmRecovery, get isDemo() { return useDemo() } }
}
export const studentClassHistoryAdapter = createStudentClassHistoryAdapter()
