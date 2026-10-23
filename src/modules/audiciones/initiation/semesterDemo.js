import { evaluateScores } from './domain.js'

// Executable demo contract only. Production authorization must be enforced by RPC/RLS.
export function createSemesterDemo(seed) {
  const state = structuredClone({ evaluations: [], invitations: [], enrollments: [], followUps: [], history: [], ...seed })
  let actorId = seed.actorId
  let sequence = 0
  const actor = () => {
    const found = state.actors.find(a => a.id === actorId && a.active)
    if (!found) throw new Error('Se requiere un perfil activo')
    return found
  }
  const candidate = id => {
    const found = state.candidates.find(c => c.id === id)
    if (!found || !state.campaign.sourceClassIds.includes(found.sourceClassId)) throw new Error('Candidato fuera de convocatoria')
    return found
  }
  const invitation = id => {
    const found = state.invitations.find(i => i.id === id)
    if (!found) throw new Error('Invitación no encontrada')
    return found
  }
  const decide = () => { if (!actor().canDecide) throw new Error('Solo dirección o coordinación puede decidir') }
  const note = value => { if (!value?.trim()) throw new Error('Se requiere observación') }
  const date = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value || value <= state.today) throw new Error('La revisión debe ser una fecha futura válida')
  }
  const receiver = entry => {
    const person = actor()
    if (!person.canEnroll || !person.classIds?.includes(entry.classId)) throw new Error('No autorizado para inscribir en esta clase')
  }
  const record = (action, subjectId, details = {}) => state.history.push({ id: `event-${++sequence}`, actorId, action, subjectId, date: state.today, ...structuredClone(details) })
  return {
    setActor(id) { actorId = id },
    snapshot() { decide(); return structuredClone(state) },
    saveEvaluation({ candidateId, scores, observation = '' }) {
      actor(); candidate(candidateId)
      if (!state.campaign.juryIds.includes(actorId)) throw new Error('No está asignado como jurado')
      if (state.invitations.some(i => i.candidateId === candidateId)) throw new Error('La evaluación ya tiene una decisión; requiere reapertura')
      const result = evaluateScores(state.campaign.criteria, scores)
      const entry = { candidateId, actorId, scores: structuredClone(scores), observation, complete: result.complete }
      const index = state.evaluations.findIndex(e => e.candidateId === candidateId && e.actorId === actorId)
      if (index < 0) state.evaluations.push(entry)
      else state.evaluations[index] = entry
      return structuredClone(entry)
    },
    authorizeDestination({ candidateId, classId, objectives, reviewDate, observation }) {
      decide(); candidate(candidateId); note(observation); date(reviewDate)
      if (!Array.isArray(objectives) || !objectives.length || objectives.some(o => typeof o !== 'string' || !o.trim())) throw new Error('Defina objetivos observables')
      if (!state.classes.some(c => c.id === classId) || state.campaign.sourceClassIds.includes(classId)) throw new Error('Destino inválido')
      const jurors = new Set(state.evaluations.filter(e => e.candidateId === candidateId && e.complete && state.campaign.juryIds.includes(e.actorId)).map(e => e.actorId))
      if (jurors.size < state.campaign.minJury) throw new Error('Faltan valoraciones completas')
      if (state.invitations.some(i => i.candidateId === candidateId && i.classId === classId && i.status !== 'finalizada')) throw new Error('Ya existe una autorización para este destino')
      const entry = { id: `invitation-${++sequence}`, candidateId, classId, objectives: [...objectives], reviewDate, status: 'autorizada', version: 0 }
      state.invitations.push(entry); record('autorizar', entry.id, { observation })
      return structuredClone(entry)
    },
    setRegularClassActive(candidateId, active) {
      decide(); candidate(candidateId).regularClassActive = Boolean(active)
      record('regularizar_matricula', candidateId, { active: Boolean(active) })
    },
    authorizeRegularException(candidateId, observation) {
      decide(); note(observation); candidate(candidateId).regularException = { observation, actorId }
      record('excepcion_teoria', candidateId, { observation })
    },
    enrollGuest(id) {
      const entry = invitation(id); receiver(entry)
      const alumno = candidate(entry.candidateId)
      const existing = state.enrollments.find(e => e.alumnoId === alumno.alumnoId && e.classId === entry.classId && e.active)
      if (entry.status === 'invitado' && existing?.invitationId === id) return structuredClone(existing)
      if (entry.status !== 'autorizada') throw new Error('Autorización no vigente')
      if (existing) throw new Error('El alumno ya está inscrito en destino')
      if (!alumno.regularClassActive && !alumno.regularException) throw new Error('Regularice teoría y solfeo o solicite excepción académica')
      date(entry.reviewDate)
      const target = state.classes.find(c => c.id === entry.classId)
      if (!Number.isInteger(target?.capacity) || target.capacity <= state.enrollments.filter(e => e.classId === entry.classId && e.active).length) throw new Error('Clase sin cupo disponible')
      const enrollment = { alumnoId: alumno.alumnoId, classId: entry.classId, invitationId: id, condition: 'invitado', active: true }
      state.enrollments.push(enrollment); entry.status = 'invitado'; entry.version++
      record('incorporar', id)
      return structuredClone(enrollment)
    },
    saveFollowUp({ invitationId, observation, evidenceIds = [] }) {
      const entry = invitation(invitationId)
      const person = actor()
      if (!person.classIds?.includes(entry.classId)) throw new Error('Seguimiento reservado al maestro receptor')
      if (entry.status !== 'invitado') throw new Error('Se requiere invitación vigente')
      note(observation)
      const followUp = { invitationId, actorId, observation, evidenceIds: [...evidenceIds], date: state.today }
      state.followUps.push(followUp); record('seguimiento', invitationId)
      return structuredClone(followUp)
    },
    resolveGuest({ invitationId, action, observation, reviewDate, version }) {
      decide(); note(observation)
      const entry = invitation(invitationId)
      if (entry.version !== version) throw new Error('La invitación cambió; recargue')
      if (entry.status !== 'invitado') throw new Error('Se requiere invitación vigente')
      if (!state.followUps.some(f => f.invitationId === invitationId)) throw new Error('Falta evidencia de seguimiento')
      if (!['confirmar', 'prorrogar', 'finalizar'].includes(action)) throw new Error('Decisión desconocida')
      if (action === 'prorrogar') {
        date(reviewDate)
        if (reviewDate <= entry.reviewDate) throw new Error('La prórroga debe ser posterior')
      }
      const enrollment = state.enrollments.find(e => e.invitationId === invitationId && e.active)
      if (!enrollment) throw new Error('La matrícula de destino cambió')
      const previous = structuredClone(entry)
      if (action === 'prorrogar') entry.reviewDate = reviewDate
      else {
        entry.status = action === 'confirmar' ? 'fijo' : 'finalizada'
        entry.reviewDate = null
        enrollment.condition = action === 'confirmar' ? 'fijo' : 'invitado'
        enrollment.active = action === 'confirmar'
      }
      entry.version++
      record(action, invitationId, { observation, previous, next: structuredClone(entry) })
      return structuredClone(entry)
    },
  }
}
