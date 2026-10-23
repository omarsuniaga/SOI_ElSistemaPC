import fixture from '../../../assets/data/mocks/initiation-auditions.json'
import { DEFAULT_RUBRIC, evaluateScores, needsException, validateDecision } from './domain.js'
export function createMockAdapter(seed = fixture, options = {}) {
  const state = structuredClone({ ...seed, campaigns: seed.campaigns || [], candidates: seed.candidates || [], evaluations: seed.evaluations || [], decisions: seed.decisions || [] })
  let actor = state.actors[0]
  let sequence = 0
  const today = () => options.today || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' })
  const id = () => `demo-initiation-${++sequence}`
  const requireAdmin = () => { if (!actor?.canManage) throw new Error('Solo coordinación puede decidir') }
  const canRead = c => actor && (actor.canManage || c.jurados.includes(actor.id) || state.candidates.some(a => a.convocatoria_id === c.id && state.classes.find(k => k.id === a.clase_destino_id)?.teacher_user_id === actor.id))
  const campaign = cid => { const c = state.campaigns.find(c => c.id === cid); if (!c || !canRead(c)) throw new Error('Convocatoria no accesible'); return c }
  const candidate = cid => { const a = state.candidates.find(a => a.id === cid); if (!a) throw new Error('Candidato no encontrado'); campaign(a.convocatoria_id); return a }
  return {
    setActor(userId) { actor = state.actors.find(a => a.id === userId) },
    async getContext() { if (!actor) throw new Error('Sin sesión activa'); return structuredClone({ user: actor, jurados: actor.canManage ? state.actors : [], clases: state.classes.map(c => ({ ...c, puede_evaluar_revision: c.teacher_user_id === actor.id })) }) },
    async listCampaigns() { return structuredClone(state.campaigns.filter(canRead)) },
    async createCampaign(payload) {
      requireAdmin()
      if (!payload.nombre?.trim() || payload.cohorte_hasta < payload.cohorte_desde || payload.fecha_audicion < payload.cohorte_desde) throw new Error('Convocatoria inválida')
      if (!state.classes.some(c => c.id === payload.clase_origen_id && c.es_clase_iniciacion && c.activo)) throw new Error('La clase de origen debe ser Iniciación activa')
      if (!payload.jurados?.length || new Set(payload.jurados).size !== payload.jurados.length || payload.jurados.some(id => !state.actors.some(a => a.id === id)) || payload.min_jurados < 1 || payload.min_jurados > payload.jurados.length) throw new Error('Jurado inválido')
      const c = { ...structuredClone(payload), rubrica: structuredClone(payload.rubrica || DEFAULT_RUBRIC), id: id(), estado: 'abierta' }
      state.campaigns.push(c); return structuredClone(c)
    },
    async getCampaign(cid) {
      const c = campaign(cid)
      const candidates = state.candidates.filter(a => a.convocatoria_id === cid && (actor.canManage || c.jurados.includes(actor.id) || state.classes.find(k => k.id === a.clase_destino_id)?.teacher_user_id === actor.id))
      const ids = new Set(candidates.map(a => a.id))
      return structuredClone({ candidates, evaluations: state.evaluations.filter(e => ids.has(e.candidato_id) && (actor.canManage || e.jurado_id === actor.id)), decisions: state.decisions.filter(d => ids.has(d.candidato_id)) })
    },
    async listSourceStudents(classId) { requireAdmin(); return structuredClone(state.students.filter(s => s.activo && state.enrollments.some(e => e.alumno_id === s.id && e.clase_id === classId && e.activo))) },
    async addCandidate(payload) {
      requireAdmin(); const c = campaign(payload.convocatoria_id)
      const student = state.students.find(s => s.id === payload.alumno_id && s.activo)
      if (!student || !state.enrollments.some(e => e.alumno_id === student.id && e.clase_id === c.clase_origen_id && e.activo)) throw new Error('Sin matrícula de origen activa')
      if (needsException(student, c) && !payload.motivo_excepcion?.trim()) throw new Error('Se requiere justificar la excepción de cohorte o preparación')
      if (state.candidates.some(a => a.convocatoria_id === c.id && a.alumno_id === student.id)) throw new Error('Candidato duplicado')
      const a = { ...payload, alumno_nombre: student.nombre_completo, id: id(), estado: 'pendiente', ronda: 0, version: 0 }
      state.candidates.push(a); return structuredClone(a)
    },
    async saveEvaluation(payload) {
      const a = candidate(payload.candidato_id), c = campaign(a.convocatoria_id)
      const receiver = state.classes.find(k => k.id === a.clase_destino_id)?.teacher_user_id === actor.id
      if (a.ronda !== payload.ronda || !['pendiente', 'invitado'].includes(a.estado) || !(c.jurados.includes(actor.id) || (a.estado === 'invitado' && receiver))) throw new Error('No autorizado para esta valoración')
      const score = evaluateScores(c.rubrica, payload.notas)
      const existing = state.evaluations.find(e => e.candidato_id === a.id && e.ronda === a.ronda && e.jurado_id === actor.id)
      const e = { ...structuredClone(payload), jurado_id: actor.id, completa: score.complete, id: existing?.id || id() }
      if (existing) Object.assign(existing, e); else state.evaluations.push(e)
      return structuredClone(e)
    },
    async decide({ candidato_id, version, accion, datos }) {
      requireAdmin(); const a = candidate(candidato_id), c = campaign(a.convocatoria_id)
      if (version !== a.version) throw new Error('La candidatura cambió; recargue antes de decidir')
      validateDecision(a, c, state.evaluations.filter(e => e.candidato_id === a.id), accion, datos, today())
      if (!state.enrollments.some(e => e.alumno_id === a.alumno_id && e.clase_id === c.clase_origen_id && e.activo)) throw new Error('Revise la matrícula de Iniciación antes de decidir')
      const before = structuredClone(a)
      if (accion === 'invitar') {
        const dest = state.classes.find(k => k.id === datos.clase_destino_id && k.activo)
        if (!dest || dest.id === c.clase_origen_id) throw new Error('Destino inválido')
        let e = state.enrollments.find(e => e.alumno_id === a.alumno_id && e.clase_id === dest.id)
        if (e?.activo) throw new Error('El alumno ya está inscrito en destino')
        if (!dest.capacidad_maxima || state.enrollments.filter(e => e.clase_id === dest.id && e.activo).length >= dest.capacidad_maxima) throw new Error('Clase sin cupo disponible o capacidad definida')
        if (!e) { e = { id: id(), alumno_id: a.alumno_id, clase_id: dest.id }; state.enrollments.push(e) }
        Object.assign(e, { activo: true, condicion: 'invitado', invitacion_revision: datos.revision_fecha, audicion_candidato_id: a.id })
        Object.assign(a, { estado: 'invitado', ronda: 1, clase_destino_id: dest.id, inscripcion_id: e.id, revision_fecha: datos.revision_fecha, objetivos: datos.objetivos })
      } else if (accion === 'prorrogar') {
        a.ronda++; a.revision_fecha = datos.revision_fecha
        state.enrollments.find(e => e.id === a.inscripcion_id).invitacion_revision = datos.revision_fecha
      } else {
        const e = state.enrollments.find(e => e.id === a.inscripcion_id)
        if (e) Object.assign(e, { activo: accion === 'confirmar', condicion: 'fijo', invitacion_revision: null })
        a.estado = accion === 'confirmar' ? 'fijo' : 'continua_iniciacion'; a.revision_fecha = null
      }
      a.version++
      state.decisions.push({ id: id(), candidato_id: a.id, accion, observacion: datos.observacion, datos: structuredClone(datos), antes: before, despues: structuredClone(a), actor_id: actor.id, creado_at: new Date().toISOString() })
      return structuredClone(a)
    },
    // Only the demo/testing provider exposes its own synthetic enrollments.
    getDemoEnrollments() { return structuredClone(state.enrollments) },
  }
}
export const demoAdapter = createMockAdapter()
