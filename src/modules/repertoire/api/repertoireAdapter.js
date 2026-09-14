import { assertEnum, validateMontajeDates, MONTAJE_ESTADOS, APLICABILIDAD_COMPAS, ESTADOS_PREPARACION } from '../domain/repertoireFoundation.js'
import { assertFilaEditable } from '../domain/studentPreparation.js'
import { createSessionRepertoireWork } from '../domain/sessionRepertoireWork.js'
import { createMilestone, createTarget } from '../domain/trajectory.js'

const TABLES = Object.freeze({
  obras: 'obras',
  versiones: 'obra_versiones',
  montajes: 'montajes',
  secciones: 'montaje_secciones',
  filas: 'montaje_filas',
  alumnos: 'montaje_alumnos',
  compases: 'obra_compases',
  estados: 'catalogo_estados_preparacion'
  ,pasajes: 'montaje_pasajes', pasajeCompases: 'montaje_pasaje_compases', grupos: 'montaje_grupos_compases', grupoCompases: 'montaje_grupo_compases'
  ,sessionWorks: 'sesion_repertorio_trabajos', sessionWorkMeasures: 'sesion_repertorio_trabajo_compases', observationContext: 'observacion_sesion_repertorio', preparationHistory: 'montaje_preparacion_historial', targets: 'montaje_targets', milestones: 'montaje_target_milestones', eventRelations: 'montaje_eventos'
})

function requireClient(client) {
  if (!client?.from) throw new TypeError('Se requiere un cliente Supabase compatible')
  return client
}

async function insert(client, table, payload) {
  const { data, error } = await client.from(table).insert(payload).select().single()
  if (error) throw error
  return data
}

export function createRepertoireAdapter(client, { editableFilaIds = [], actorId = null, canEditTargets = () => false } = {}) {
  const supabase = requireClient(client)
  return {
    async createObra(payload) {
      if (!payload?.titulo?.trim()) throw new TypeError('La obra requiere título')
      return insert(supabase, TABLES.obras, payload)
    },
    async createVersion(payload) {
      if (!payload?.obra_id || !payload?.nombre?.trim()) throw new TypeError('La versión requiere obra_id y nombre')
      return insert(supabase, TABLES.versiones, payload)
    },
    async createMontaje(payload) {
      if (!payload?.obra_version_id) throw new TypeError('El montaje requiere obra_version_id')
      assertEnum(payload.estado || 'PLANIFICADO', MONTAJE_ESTADOS, 'estado')
      validateMontajeDates(payload)
      return insert(supabase, TABLES.montajes, { estado: 'PLANIFICADO', ...payload })
    },
    async updateRowPreparation(id, state, { filaId } = {}) {
      assertFilaEditable({ editableFilaIds, filaId })
      assertEnum(state, ESTADOS_PREPARACION, 'estado_preparacion')
      const { data, error } = await supabase.from('montaje_compases').update({ estado_preparacion: state }).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    async updateStudentPreparation(payload) {
      if (!payload?.montaje_alumno_id || !payload?.montaje_compas_id) throw new TypeError('La preparación individual requiere alumno y compás')
      assertEnum(payload.estado_preparacion, ESTADOS_PREPARACION, 'estado_preparacion')
      return insert(supabase, 'montaje_alumno_compases', payload)
    },
    async updateStudentState(studentAssignmentId, measureId, state) {
      if (!studentAssignmentId || !measureId) throw new TypeError('La preparación individual requiere alumno y compás')
      if (state !== null) assertEnum(state, ESTADOS_PREPARACION, 'estado_preparacion')
      const query = supabase.from('montaje_alumno_compases')
      if (state === null) {
        const { data, error } = await query.delete().eq('montaje_alumno_id', studentAssignmentId).eq('montaje_compas_id', measureId).select()
        if (error) throw error
        if (!data?.length) throw new Error('No se encontró el override individual')
        return data[0]
      }
      const { data, error } = await query.upsert({ montaje_alumno_id: studentAssignmentId, montaje_compas_id: measureId, estado_preparacion: state }, { onConflict: 'montaje_alumno_id,montaje_compas_id' }).select().single()
      if (error) throw error
      return data
    },
    async addSection(payload) {
      if (!payload?.montaje_id || !payload?.nombre?.trim()) throw new TypeError('La sección requiere montaje_id y nombre')
      return insert(supabase, TABLES.secciones, payload)
    },
    async addRow(payload) {
      if (!payload?.montaje_seccion_id || !payload?.nombre?.trim()) throw new TypeError('La fila requiere sección y nombre')
      return insert(supabase, TABLES.filas, payload)
    },
    async assignStudent(payload) {
      if (!payload?.montaje_fila_id || !payload?.alumno_id) throw new TypeError('La asignación requiere fila y alumno')
      return insert(supabase, TABLES.alumnos, payload)
    },
    async addMeasure(payload) {
      if (!payload?.obra_version_id || payload.indice_interno == null || !payload.numero_visible) {
        throw new TypeError('El compás requiere versión, índice interno y número visible')
      }
      return insert(supabase, TABLES.compases, payload)
    },
    async createSessionRepertoireWork(payload) {
      const work = createSessionRepertoireWork(payload)
      const created = await insert(supabase, TABLES.sessionWorks, {
        sesion_id: work.sessionId, montaje_id: work.montajeId, montaje_fila_id: work.filaId, alumno_id: work.alumnoId,
        pasaje_id: work.passageId, notas: work.notes, focus_tags: work.focusTags, tempo_actual: work.tempoActual, tempo_objetivo: work.tempoObjetivo, created_by: work.createdBy
      })
      return { ...created, measureIds: work.measureIds }
    },
    async addSessionRepertoireWorkMeasures(workId, measureIds) {
      const ids = [...new Set((measureIds || []).filter(Boolean))]
      if (!workId || !ids.length) throw new TypeError('El trabajo requiere id y compases')
      const rows = ids.map((montajeCompasId, orden) => ({ trabajo_id: workId, montaje_compas_id: montajeCompasId, orden }))
      const { data, error } = await supabase.from(TABLES.sessionWorkMeasures).insert(rows).select()
      if (error || data?.length !== rows.length) throw error || new Error('Persistencia parcial de compases trabajados')
      return data
    },
    async linkObservationToSessionRepertoire(observationId, workId) {
      if (!observationId || !workId) throw new TypeError('La observación requiere contexto de repertorio')
      return insert(supabase, TABLES.observationContext, { observacion_id: observationId, trabajo_id: workId })
    },
    async recordPreparationTransition(payload) {
      if (!payload?.montageId || !payload?.measureId || !payload?.newState) throw new TypeError('La transición requiere montaje, compás y estado')
      return insert(supabase, TABLES.preparationHistory, { montaje_id: payload.montageId, montaje_fila_id: payload.filaId || null, alumno_id: payload.studentId || null, montaje_compas_id: payload.measureId, estado_anterior: payload.previousState || null, estado_nuevo: payload.newState, actor_maestro_id: payload.actorId || null, alcance: payload.scope || 'collective', fuente: payload.source || 'PREPARATION_MUTATION', sesion_id: payload.sessionId || null, operacion_masiva_id: payload.bulkOperationId || null })
    },
    async updatePreparationAtomically(payload) {
      const { data, error } = await supabase.rpc('fn_repertoire_update_preparation', { p_montage_id: payload.montageId, p_measure_id: payload.measureId, p_new_state: payload.newState, p_actor_id: payload.actorId || actorId, p_scope: payload.scope || 'collective', p_source: payload.source || 'PREPARATION_MUTATION', p_fila_id: payload.filaId || null, p_student_id: payload.studentId || null, p_session_id: payload.sessionId || null, p_bulk_operation_id: payload.bulkOperationId || null })
      if (error) throw error
      return data
    },
    async historyByMeasure(montageId, measureId) {
      if (!montageId || !measureId) throw new TypeError('El historial requiere montaje y compás')
      const { data, error } = await supabase.from(TABLES.preparationHistory).select('*').eq('montaje_id', montageId).eq('montaje_compas_id', measureId).order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
    async preparationHistoryByFila(montageId, filaId) {
      const { data, error } = await supabase.from(TABLES.preparationHistory).select('*').eq('montaje_id', montageId).eq('montaje_fila_id', filaId).order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
    async preparationHistoryByStudent(montageId, studentId) {
      const { data, error } = await supabase.from(TABLES.preparationHistory).select('*').eq('montaje_id', montageId).eq('alumno_id', studentId).order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
    async createTarget(payload) {
      if (!canEditTargets({ actorId, scope: payload?.alcance, filaId: payload?.filaId || payload?.montaje_fila_id, studentId: payload?.studentId || payload?.alumno_id })) throw new Error('No autorizado para crear este objetivo')
      const target = createTarget({ montageId: payload.montageId || payload.montaje_id, scope: payload.scope || payload.alcance, filaId: payload.filaId || payload.montaje_fila_id, passageId: payload.passageId || payload.pasaje_id, studentId: payload.studentId || payload.alumno_id, targetState: payload.targetState || payload.estado_objetivo, targetDate: payload.targetDate || payload.fecha_objetivo, thresholdPercent: payload.thresholdPercent ?? payload.umbral_porcentaje, targetTempo: payload.targetTempo ?? payload.tempo_objetivo, priority: payload.priority || payload.prioridad, notes: payload.notes || payload.notas, createdBy: payload.createdBy || payload.created_by || actorId })
      return insert(supabase, TABLES.targets, { montaje_id: target.montageId, alcance: target.scope, montaje_fila_id: target.filaId, pasaje_id: target.passageId, alumno_id: target.studentId, estado_objetivo: target.targetState, fecha_objetivo: target.targetDate, umbral_porcentaje: target.thresholdPercent, tempo_objetivo: target.targetTempo, prioridad: target.priority, notas: target.notes, created_by: target.createdBy })
    },
    async updateTarget(id, payload) { if (!canEditTargets({ actorId, targetId: id })) throw new Error('No autorizado para editar este objetivo'); const { data, error } = await supabase.from(TABLES.targets).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).is('archived_at', null).select().single(); if (error || !data) throw error || new Error('Objetivo no encontrado'); return data },
    async archiveTarget(id) { if (!canEditTargets({ actorId, targetId: id })) throw new Error('No autorizado para archivar este objetivo'); return this.updateTarget(id, { archived_at: new Date().toISOString() }) },
    async createMilestone(payload) { if (!canEditTargets({ actorId, targetId: payload?.targetId || payload?.target_id })) throw new Error('No autorizado para crear este hito'); const milestone = createMilestone({ targetId: payload.targetId || payload.target_id, label: payload.label || payload.etiqueta, targetDate: payload.targetDate || payload.fecha_objetivo, targetState: payload.targetState || payload.estado_objetivo, thresholdPercent: payload.thresholdPercent ?? payload.umbral_porcentaje, targetTempo: payload.targetTempo ?? payload.tempo_objetivo, notes: payload.notes || payload.notas }); return insert(supabase, TABLES.milestones, { target_id: milestone.targetId, etiqueta: milestone.label, fecha_objetivo: milestone.targetDate, estado_objetivo: milestone.targetState, umbral_porcentaje: milestone.thresholdPercent, tempo_objetivo: milestone.targetTempo, notas: milestone.notes }) },
    async updateMilestone(id, payload) { if (!canEditTargets({ actorId, milestoneId: id })) throw new Error('No autorizado para editar este hito'); const { data, error } = await supabase.from(TABLES.milestones).update(payload).eq('id', id).select().single(); if (error || !data) throw error || new Error('Hito no encontrado'); return data },
    async archiveMilestone(id) { if (!canEditTargets({ actorId, milestoneId: id })) throw new Error('No autorizado para archivar este hito'); const { data, error } = await supabase.from(TABLES.milestones).update({ archived_at: new Date().toISOString() }).eq('id', id).is('archived_at', null).select().single(); if (error || !data) throw error || new Error('Hito no encontrado'); return data },
    async listTargets(montageId) {
      if (!montageId) throw new TypeError('La trayectoria requiere montaje')
      const { data, error } = await supabase.from(TABLES.targets).select('*, montaje_target_milestones(*)').eq('montaje_id', montageId).is('archived_at', null).order('fecha_objetivo', { ascending: true })
      if (error) throw error
      return data || []
    },
    async listMontagesForEvent(eventId) { const { data, error } = await supabase.from(TABLES.eventRelations).select('*, montajes(*)').eq('calendario_evento_id', eventId); if (error) throw error; return data || [] },
    async historyBySession(sessionId) {
      if (!sessionId) throw new TypeError('El historial requiere sesión')
      const { data, error } = await supabase.from(TABLES.sessionWorks).select('*, sesion_repertorio_trabajo_compases(*), observacion_sesion_repertorio(*)').eq('sesion_id', sessionId).order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
    async historyByMontaje(montajeId) {
      if (!montajeId) throw new TypeError('El historial requiere montaje')
      const { data, error } = await supabase.from(TABLES.sessionWorks).select('*, sesion_repertorio_trabajo_compases(*), sesiones_clase(id, fecha, clase_id)').eq('montaje_id', montajeId).order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
    async historyByFila(montajeId, filaId) {
      const rows = await this.historyByMontaje(montajeId)
      return rows.filter((row) => row.montaje_fila_id === filaId)
    },
    async historyByPassage(passageId) {
      if (!passageId) throw new TypeError('El historial requiere pasaje')
      const { data, error } = await supabase.from(TABLES.sessionWorks).select('*, sesion_repertorio_trabajo_compases(*), sesiones_clase(id, fecha, clase_id)').eq('pasaje_id', passageId).order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
    async historyByMeasureRange(montajeId, filaId, measures) {
      const wanted = [...new Set((measures || []).filter(Boolean))]
      if (!montajeId || !wanted.length) throw new TypeError('El historial requiere montaje y compases')
      const { data: links, error: linksError } = await supabase.from(TABLES.sessionWorkMeasures).select('trabajo_id, montaje_compas_id').in('montaje_compas_id', wanted)
      if (linksError) throw linksError
      const workIds = [...new Set((links || []).map((link) => link.trabajo_id))]
      if (!workIds.length) return []
      const { data, error } = await supabase.from(TABLES.sessionWorks).select('*, sesion_repertorio_trabajo_compases(*), sesiones_clase(id, fecha, clase_id)').eq('montaje_id', montajeId).in('id', workIds).order('created_at', { ascending: true })
      if (error) throw error
      return (data || []).filter((row) => !filaId || row.montaje_fila_id === filaId)
    },
    async createPassage(payload) { return insert(supabase, TABLES.pasajes, payload) },
    async updatePassage(id, payload) {
      const { data, error } = await supabase.from(TABLES.pasajes).update(payload).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    async archivePassage(id) {
      return this.updatePassage(id, { archived_at: new Date().toISOString() })
    },
    async createLinkedGroup(payload) { return insert(supabase, TABLES.grupos, payload) },
    async addLinkedMeasures(rows) {
      if (!rows?.length) throw new TypeError('El grupo requiere compases')
      const { data, error } = await supabase.from(TABLES.grupoCompases).insert(rows).select()
      if (error || data?.length !== rows.length) throw error || new Error('Persistencia parcial de compases vinculados')
      return data
    },
    async updateLinkedGroupState(groupId, state) {
      assertEnum(state, ESTADOS_PREPARACION, 'estado_preparacion')
      const memberships = await supabase.from(TABLES.grupoCompases).select('montaje_compas_id').eq('grupo_id', groupId)
      if (memberships.error) throw memberships.error
      const ids = (memberships.data || []).map((row) => row.montaje_compas_id)
      if (!ids.length) throw new Error('Grupo sin compases')
      const { data, error } = await supabase.from('montaje_compases').update({ estado_preparacion: state }).in('id', ids).select()
      if (error) throw error
      if (data?.length !== ids.length) throw new Error('Persistencia parcial del grupo vinculado')
      return { affected: data.length }
    },
    async removeLinkedMeasure(groupId, measureId) {
      const { data, error } = await supabase.from(TABLES.grupoCompases).delete().eq('grupo_id', groupId).eq('montaje_compas_id', measureId).select()
      if (error) throw error
      if (!data?.length) throw new Error('Compás no vinculado')
      return data[0]
    },
    async removeLinkedMeasures(groupId, measureIds) {
      if (!measureIds?.length) return { affected: 0 }
      const { data, error } = await supabase.from(TABLES.grupoCompases).delete().eq('grupo_id', groupId).in('montaje_compas_id', measureIds).select()
      if (error) throw error
      if (data?.length !== measureIds.length) throw new Error('Persistencia parcial al desvincular compases')
      return { affected: data.length }
    },
    async renameLinkedGroup(id, nombre) { return this.updateLinkedGroup(id, { nombre }) },
    async updateLinkedGroup(id, payload) {
      const { data, error } = await supabase.from(TABLES.grupos).update(payload).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    async breakLinkedGroup(id) {
      const { data, error } = await supabase.from(TABLES.grupos).delete().eq('id', id).select()
      if (error) throw error
      if (!data?.length) throw new Error('Grupo no encontrado')
      return data[0]
    },
    async listPreparationCatalog() {
      const { data, error } = await supabase.from(TABLES.estados).select('*').order('orden')
      if (error) throw error
      return data || []
    },
    assertApplicability(value) { return assertEnum(value, APLICABILIDAD_COMPAS, 'aplicabilidad') },
    assertPreparationState(value) { return assertEnum(value, ESTADOS_PREPARACION, 'estado_preparacion') }
  }
}
