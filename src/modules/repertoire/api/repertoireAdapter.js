import { assertEnum, validateMontajeDates, MONTAJE_ESTADOS, APLICABILIDAD_COMPAS, ESTADOS_PREPARACION } from '../domain/repertoireFoundation.js'
import { assertFilaEditable } from '../domain/studentPreparation.js'
import { createSessionRepertoireWork } from '../domain/sessionRepertoireWork.js'
import { createMilestone, createTarget } from '../domain/trajectory.js'
import { pickPrincipalEvent } from '../domain/montagePresentation.js'
import { buildStudentRoster } from '../domain/studentRoster.js'
import { collectEditableFilaIds } from '../domain/filaAuthorization.js'

const TABLES = Object.freeze({
  obras: 'obras',
  versiones: 'obra_versiones',
  montajes: 'montajes',
  secciones: 'montaje_secciones',
  filas: 'montaje_filas',
  alumnos: 'montaje_alumnos',
  alumnoCompases: 'montaje_alumno_compases',
  filaMaestros: 'montaje_fila_maestros',
  estadosCompases: 'montaje_compases',
  compases: 'obra_compases',
  estados: 'catalogo_estados_preparacion'
  ,pasajes: 'montaje_pasajes', pasajeCompases: 'montaje_pasaje_compases', grupos: 'montaje_grupos_compases', grupoCompases: 'montaje_grupo_compases'
  ,sessionWorks: 'sesion_repertorio_trabajos', sessionWorkMeasures: 'sesion_repertorio_trabajo_compases', observationContext: 'observacion_sesion_repertorio', preparationHistory: 'montaje_preparacion_historial', targets: 'montaje_targets', milestones: 'montaje_target_milestones', eventRelations: 'montaje_eventos', signals: 'repertoire_signals', signalDeliveries: 'repertoire_signal_deliveries'
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
  // El alcance editable se aprende de las asignaciones reales al listar los
  // montajes. Antes llegaba vacío y el guard local rechazaba toda edición aun
  // con la asignación cargada en la base.
  const editableFilas = new Set(editableFilaIds)
  return {
    get editableFilaIds() { return [...editableFilas] },
    // Marcar aplicabilidad está autorizado por la misma asignación de fila que
    // la preparación: si el maestro puede editar una fila, puede decir qué toca.
    get canEditApplicability() { return editableFilas.size > 0 },
    // La vista muestra el sello "DEMO" según esto: con datos reales no debe
    // aparecer, porque le diría al maestro que su trabajo es de mentira.
    mode: 'real',
    async listMontajes() {
      const { data: montajes, error } = await supabase.from(TABLES.montajes).select('*, obra_versiones(*, obras(*))').order('created_at', { ascending: false })
      if (error) throw error
      const rows = montajes || []
      if (!rows.length) return []
      const montageIds = rows.map((row) => row.id)
      const versionIds = rows.map((row) => row.obra_version_id).filter(Boolean)
      const [sections, measures, eventLinks] = await Promise.all([
        supabase.from(TABLES.secciones).select('*, montaje_filas(*, montaje_alumnos(*, alumnos(id, nombre_completo)))').in('montaje_id', montageIds).order('orden'),
        supabase.from(TABLES.compases).select('*, montaje_compases!inner(*)').in('obra_version_id', versionIds).order('orden'),
        // El evento no es adorno: de él salen la cuenta regresiva de la tarjeta
        // y las señales de preparación. Sin esta consulta la vista mostraba
        // "Sin evento" y "Fecha pendiente" con el vínculo ya cargado.
        supabase.from(TABLES.eventRelations).select('*, calendario_institucional(id, titulo, fecha_inicio)').in('montaje_id', montageIds)
      ])
      if (sections.error) throw sections.error
      if (measures.error) throw measures.error
      if (eventLinks.error) throw eventLinks.error
      // Estados individuales por compás. Sin esto la vista no tenía con qué
      // pintar las excepciones de cada alumno y el detalle por alumno quedaba
      // vacío en modo real.
      const assignmentIds = (sections.data || []).flatMap((section) =>
        (section.montaje_filas || []).flatMap((fila) => (fila.montaje_alumnos || []).map((alumno) => alumno.id))
      )
      if (actorId) {
        const asignaciones = await supabase.from(TABLES.filaMaestros).select('fila_id, maestro_id, can_edit_preparation, active').in('montaje_id', montageIds)
        if (asignaciones.error) throw asignaciones.error
        for (const filaId of collectEditableFilaIds(asignaciones.data, actorId)) editableFilas.add(filaId)
      }
      let overrideRows = []
      if (assignmentIds.length) {
        const overrides = await supabase.from(TABLES.alumnoCompases).select('*').in('montaje_alumno_id', assignmentIds)
        if (overrides.error) throw overrides.error
        overrideRows = overrides.data || []
      }
      const eventsByMontage = new Map()
      for (const link of eventLinks.data || []) {
        const current = eventsByMontage.get(link.montaje_id) || []
        current.push(link)
        eventsByMontage.set(link.montaje_id, current)
      }
      const sectionsByMontage = new Map()
      for (const section of sections.data || []) {
        const filas = (section.montaje_filas || []).map((fila) => ({ ...fila, alumnos: buildStudentRoster(fila.montaje_alumnos, overrideRows) }))
        const current = sectionsByMontage.get(section.montaje_id) || []
        current.push({ ...section, filas })
        sectionsByMontage.set(section.montaje_id, current)
      }
      const measuresByMontage = new Map()
      for (const row of measures.data || []) {
        for (const state of row.montaje_compases || []) {
          const current = measuresByMontage.get(state.montaje_id) || []
          current.push({ ...row, ...state })
          measuresByMontage.set(state.montaje_id, current)
        }
      }
      return rows.map((montage) => ({
        ...montage,
        obra: montage.obra_versiones?.obras || {},
        version: montage.obra_versiones || {},
        evento: pickPrincipalEvent(eventsByMontage.get(montage.id)),
        filas: (sectionsByMontage.get(montage.id) || []).flatMap((section) => section.filas),
        secciones: sectionsByMontage.get(montage.id) || [],
        alumnos: (sectionsByMontage.get(montage.id) || []).flatMap((section) => section.filas.flatMap((fila) => fila.alumnos)),
        compases: measuresByMontage.get(montage.id) || []
      }))
    },
    async updateMeasureState(id, state, options = {}) {
      assertEnum(state, ESTADOS_PREPARACION, 'estado_preparacion')
      // `id` es el del compás DENTRO del montaje (`montaje_compases`), que es lo
      // que la vista tiene y lo que espera el RPC. Buscarlo en `obra_compases`
      // —donde ese id no existe— hacía fallar toda edición antes de la red.
      let montageId = options.montageId
      if (!montageId) {
        const { data, error } = await supabase.from(TABLES.estadosCompases).select('montaje_id').eq('id', id).single()
        if (error) throw error
        montageId = data?.montaje_id
      }
      if (!montageId) throw new Error('Montaje del compás no encontrado')
      return this.updatePreparationAtomically({ montageId, measureId: id, newState: state, filaId: options.filaId, scope: 'collective' })
    },
    async updateMeasureApplicability(id, applicability, { montageId = null, filaId = null } = {}) {
      assertEnum(applicability, APLICABILIDAD_COMPAS, 'aplicabilidad')
      let resolvedMontageId = montageId
      if (!resolvedMontageId) {
        const { data: measure, error: measureError } = await supabase.from('montaje_compases').select('montaje_id').eq('id', id).single()
        if (measureError) throw measureError
        resolvedMontageId = measure?.montaje_id
      }
      const { data, error } = await supabase.rpc('fn_repertoire_update_applicability', { p_montage_id: resolvedMontageId, p_measure_id: id, p_applicability: applicability, p_fila_id: filaId })
      if (error) throw error
      return data
    },
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
    async updateRowPreparation(id, state, { filaId, montageId = null } = {}) {
      assertFilaEditable({ editableFilaIds: [...editableFilas], filaId })
      assertEnum(state, ESTADOS_PREPARACION, 'estado_preparacion')
      return this.updatePreparationAtomically({ montageId, measureId: id, newState: state, filaId, scope: 'collective' })
    },
    async updateStudentPreparation(payload) {
      if (!payload?.montaje_alumno_id || !payload?.montaje_compas_id) throw new TypeError('La preparación individual requiere alumno y compás')
      assertEnum(payload.estado_preparacion, ESTADOS_PREPARACION, 'estado_preparacion')
      return this.updatePreparationAtomically({ montageId: payload.montageId || payload.montaje_id, measureId: payload.montaje_compas_id, newState: payload.estado_preparacion, studentId: payload.studentId || payload.alumno_id, filaId: payload.filaId || payload.montaje_fila_id, scope: 'student' })
    },
    async updateStudentState(studentAssignmentId, measureId, state) {
      if (!studentAssignmentId || !measureId) throw new TypeError('La preparación individual requiere alumno y compás')
      if (state !== null) assertEnum(state, ESTADOS_PREPARACION, 'estado_preparacion')
      const { data: measure, error: measureError } = await supabase.from('montaje_compases').select('montaje_id').eq('id', measureId).single()
      if (measureError) throw measureError
      return this.updatePreparationAtomically({ montageId: measure.montaje_id, measureId, newState: state, studentId: studentAssignmentId, scope: 'student', source: state === null ? 'OVERRIDE_REMOVED' : 'INDIVIDUAL_OVERRIDE' })
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
    async listFilaAssignments(montageId) {
      if (!montageId) throw new TypeError('La asignación requiere montaje')
      const { data, error } = await supabase.from('montaje_fila_maestros').select('*').eq('montaje_id', montageId).eq('active', true)
      if (error) throw error
      return data || []
    },
    async createFilaAssignment(payload) {
      if (!payload?.montaje_id || !payload?.fila_id || !payload?.maestro_id) throw new TypeError('La asignación requiere montaje, fila y maestro')
      return insert(supabase, 'montaje_fila_maestros', payload)
    },
    async updateFilaAssignment(id, payload) {
      if (!id) throw new TypeError('La asignación requiere id')
      const { data, error } = await supabase.from('montaje_fila_maestros').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    async archiveFilaAssignment(id) {
      return this.updateFilaAssignment(id, { active: false })
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
    async listInAppSignals() { const { data, error } = await supabase.from(TABLES.signalDeliveries).select('*, repertoire_signals(*)').eq('channel', 'IN_APP').order('created_at', { ascending: false }); if (error) throw error; return data || [] },
    async acknowledgeSignal(deliveryId) { const { data, error } = await supabase.from(TABLES.signalDeliveries).update({ status: 'READ', read_at: new Date().toISOString() }).eq('id', deliveryId).select().single(); if (error || !data) throw error || new Error('Señal no encontrada'); return data },
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
      const montage = await supabase.from(TABLES.grupoCompases).select('montaje_grupos_compases(montaje_id)').eq('grupo_id', groupId)
      if (montage.error) throw montage.error
      const montageId = montage.data?.[0]?.montaje_grupos_compases?.montaje_id
      if (!montageId) throw new Error('Montaje del grupo no encontrado')
      for (const measureId of ids) await this.updatePreparationAtomically({ montageId, measureId, newState: state, scope: 'collective', source: 'LINKED_GROUP_PROPAGATION' })
      return { affected: ids.length }
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
