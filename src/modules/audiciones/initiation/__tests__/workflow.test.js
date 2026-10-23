import { describe, expect, it } from 'vitest'
import { DEFAULT_RUBRIC, calendarMonthsAfter, evaluateScores, needsException, renderEnrollmentBadge } from '../domain.js'
import { createMockAdapter } from '../mock.js'
import fixture from '../../../../assets/data/mocks/initiation-auditions.json'
const scores = Object.fromEntries(DEFAULT_RUBRIC.map(c => [c.key, 3]))
export async function scenario() {
  const adapter = createMockAdapter(fixture, { today: '2026-05-01' })
  const campaign = await adapter.createCampaign({ nombre: 'Audición de prueba', clase_origen_id: 'source', cohorte_desde: '2026-01-01', cohorte_hasta: '2026-02-01', fecha_audicion: '2026-04-15', jurados: ['demo-admin', 'demo-jury'], min_jurados: 1, rubrica: DEFAULT_RUBRIC })
  const candidate = await adapter.addCandidate({ convocatoria_id: campaign.id, alumno_id: 'demo-student-1' })
  return { adapter, campaign, candidate }
}
describe('initiation audition domain and demo contract', () => {
  it('does not treat No observado as zero or auto-approve incomplete evidence', () => {
    expect(evaluateScores(DEFAULT_RUBRIC, { ...scores, teoria: null })).toMatchObject({ complete: false, observed: 5, average: 3 })
    expect(() => evaluateScores(DEFAULT_RUBRIC, { ...scores, teoria: 0 })).toThrow()
    expect(() => evaluateScores(DEFAULT_RUBRIC, { ...scores, fake: 4 })).toThrow('desconocido')
  })
  it('uses calendar months and requires a reason for missing/outside dates', () => {
    expect(calendarMonthsAfter('2026-01-31', 3)).toBe('2026-04-30')
    expect(needsException({}, { cohorte_desde: '2026-01-01', cohorte_hasta: '2026-06-30', fecha_audicion: '2026-04-30' })).toBe(true)
  })
  it('preserves the origin and makes invitations and confirmation explicit', async () => {
    const { adapter, campaign, candidate } = await scenario()
    await adapter.saveEvaluation({ candidato_id: candidate.id, ronda: 0, notas: scores, observacion: 'Progreso observado' })
    expect((await adapter.getCampaign(campaign.id)).candidates[0].estado).toBe('pendiente')
    let current = await adapter.decide({ candidato_id: candidate.id, version: 0, accion: 'invitar', datos: { clase_destino_id: 'choir', objetivos: 'Escuchar al grupo', revision_fecha: '2026-07-01', observacion: 'Invitación supervisada' } })
    expect(adapter.getDemoEnrollments().find(e => e.clase_id === 'source').activo).toBe(true)
    expect(adapter.getDemoEnrollments().find(e => e.clase_id === 'choir').condicion).toBe('invitado')
    adapter.setActor('demo-receiver')
    await adapter.saveEvaluation({ candidato_id: candidate.id, ronda: 1, notas: scores, observacion: 'Se integra' })
    adapter.setActor('demo-admin')
    current = await adapter.decide({ candidato_id: candidate.id, version: current.version, accion: 'confirmar', datos: { observacion: 'Objetivos logrados' } })
    expect(current.estado).toBe('fijo')
    expect((await adapter.getCampaign(campaign.id)).decisions).toHaveLength(2)
    expect(adapter.getDemoEnrollments().find(e => e.clase_id === 'choir').condicion).toBe('fijo')
  })
  it('requires evidence, rejects stale versions and denies unassigned access', async () => {
    const { adapter, campaign, candidate } = await scenario()
    await expect(adapter.decide({ candidato_id: candidate.id, version: 0, accion: 'continuar', datos: { observacion: 'Revisión' } })).rejects.toThrow('valoraciones')
    await adapter.saveEvaluation({ candidato_id: candidate.id, ronda: 0, notas: scores })
    await expect(adapter.decide({ candidato_id: candidate.id, version: 4, accion: 'continuar', datos: { observacion: 'Revisión' } })).rejects.toThrow('cambió')
    adapter.setActor('demo-receiver')
    expect(await adapter.listCampaigns()).toHaveLength(0)
    await expect(adapter.getCampaign(campaign.id)).rejects.toThrow('accesible')
  })
  it('scopes the invited badge to a particular enrollment and escapes dates', () => {
    expect(renderEnrollmentBadge({ condicion: 'fijo' })).toBe('')
    expect(renderEnrollmentBadge({ condicion: 'invitado', invitacion_revision: '<img>' })).toContain('&lt;img&gt;')
  })
})
