import { describe, expect, it } from 'vitest'
import { createSemesterDemo } from '../semesterDemo.js'

const setup = () => createSemesterDemo({
  today: '2026-10-22', actorId: 'coordinator',
  actors: [
    { id: 'coordinator', active: true, canManage: true, canDecide: true },
    { id: 'jury-a', active: true }, { id: 'jury-b', active: true },
    { id: 'receiver', active: true, classIds: ['choir', 'violin'], canEnroll: true },
    { id: 'other', active: true },
  ],
  campaign: { id: 'midterm', type: 'medio_semestre', sourceClassIds: ['source-a', 'source-b'], juryIds: ['jury-a', 'jury-b'], minJury: 2, criteria: [{ key: 'pulse', required: true, label: 'Mantiene el pulso' }] },
  candidates: [{ id: 'candidate', alumnoId: 'alumno', sourceClassId: 'source-b', regularClassActive: true }],
  classes: [{ id: 'choir', capacity: 1 }, { id: 'violin', capacity: 1 }],
})
function evaluate(demo) {
  for (const actor of ['jury-a', 'jury-b']) {
    demo.setActor(actor)
    demo.saveEvaluation({ candidateId: 'candidate', scores: { pulse: 3 }, observation: 'Mantiene el pulso durante la frase' })
  }
  demo.setActor('coordinator')
}
const authorize = (demo, classId) => demo.authorizeDestination({ candidateId: 'candidate', classId, objectives: ['Mantener el pulso'], reviewDate: '2026-12-15', observation: 'Preparación suficiente' })

describe('semester auditions: independent destinations and authorization', () => {
  it('supports a second source group, two jurors, and independent choir and violin outcomes', () => {
    const demo = setup(); evaluate(demo)
    const choir = authorize(demo, 'choir'); const violin = authorize(demo, 'violin')
    expect(demo.snapshot().enrollments).toHaveLength(0)
    demo.setActor('receiver')
    demo.enrollGuest(choir.id); demo.enrollGuest(violin.id)
    demo.saveFollowUp({ invitationId: choir.id, observation: 'Se integra al canto', evidenceIds: ['class-event-1'] })
    demo.saveFollowUp({ invitationId: violin.id, observation: 'Necesita apoyo en postura', evidenceIds: ['class-event-2'] })
    demo.setActor('coordinator')
    demo.resolveGuest({ invitationId: choir.id, action: 'confirmar', observation: 'Objetivos logrados', version: 1 })
    demo.resolveGuest({ invitationId: violin.id, action: 'prorrogar', observation: 'Continuar apoyo', reviewDate: '2027-02-15', version: 1 })
    const state = demo.snapshot()
    expect(state.enrollments.map(e => e.condition)).toEqual(['fijo', 'invitado'])
    expect(state.candidates[0].regularClassActive).toBe(true)
    expect(state.invitations[1].reviewDate).toBe('2027-02-15')
  })
  it('denies unassigned jurors and prevents approval with missing or unobserved evidence', () => {
    const demo = setup(); demo.setActor('other')
    expect(() => demo.saveEvaluation({ candidateId: 'candidate', scores: { pulse: 4 } })).toThrow('jurado')
    demo.setActor('jury-a'); demo.saveEvaluation({ candidateId: 'candidate', scores: { pulse: null } })
    demo.setActor('coordinator'); expect(() => authorize(demo, 'choir')).toThrow('valoraciones')
    expect(demo.snapshot().invitations).toHaveLength(0)
  })
  it('makes enrollment retry idempotent and rejects unauthorized receivers', () => {
    const demo = setup(); evaluate(demo); const invitation = authorize(demo, 'choir')
    demo.setActor('other'); expect(() => demo.enrollGuest(invitation.id)).toThrow('inscribir')
    demo.setActor('receiver')
    expect(demo.enrollGuest(invitation.id)).toEqual(demo.enrollGuest(invitation.id))
    demo.setActor('coordinator')
    expect(demo.snapshot().enrollments).toHaveLength(1)
    expect(demo.snapshot().history.filter(h => h.action === 'incorporar')).toHaveLength(1)
  })
  it('requires a documented academic exception for missing regular enrollment', () => {
    const demo = setup(); evaluate(demo); const invitation = authorize(demo, 'choir')
    demo.setRegularClassActive('candidate', false)
    demo.setActor('receiver'); expect(() => demo.enrollGuest(invitation.id)).toThrow('teoría')
    demo.setActor('coordinator'); demo.authorizeRegularException('candidate', 'Matrícula pendiente de regularización')
    demo.setActor('receiver'); expect(demo.enrollGuest(invitation.id).condition).toBe('invitado')
  })
  it('rejects stale decisions and requires follow-up instead of attendance alone', () => {
    const demo = setup(); evaluate(demo); const invitation = authorize(demo, 'choir')
    demo.setActor('receiver'); demo.enrollGuest(invitation.id); demo.setActor('coordinator')
    expect(() => demo.resolveGuest({ invitationId: invitation.id, action: 'confirmar', observation: 'Presente', version: 1 })).toThrow('seguimiento')
    demo.setActor('receiver'); demo.saveFollowUp({ invitationId: invitation.id, observation: 'Logra el objetivo', evidenceIds: [] })
    demo.setActor('coordinator')
    expect(() => demo.resolveGuest({ invitationId: invitation.id, action: 'confirmar', observation: 'Logrado', version: 0 })).toThrow('cambió')
  })
  it('keeps demo snapshots detached from internal state', () => {
    const demo = setup(); const state = demo.snapshot(); state.candidates[0].regularClassActive = false
    expect(demo.snapshot().candidates[0].regularClassActive).toBe(true)
  })
})
