import { describe, expect, it, vi } from 'vitest'
import { confirmRepertoireTask, detectRepertoireSignals, explainRepertoireSignal, observeRepertoireSignals, proposeRepertoireTask, routeHermesMutation } from '../api/repertoireHermesApi.js'

const signal = { id: 's1', severity: 'CRITICAL', lifecycle: 'OPEN', reason: 'hito vencido', deepLink: '/repertoire/measure/1', evidence: { passageName: 'Tema B' } }
const access = () => true

describe('Hermes repertoire orchestration contract', () => {
  it('observes and detects only authorized material signals', async () => {
    const observed = await observeRepertoireSignals({ signalReader: async () => [signal, { ...signal, id: 'other' }], authorizedSignalIds: ['s1'] })
    expect(observed).toHaveLength(1)
    expect(detectRepertoireSignals(observed)).toHaveLength(1)
  })
  it('keeps explanation and recommendation traceable to the signal', () => {
    expect(explainRepertoireSignal(signal, access).signalId).toBe('s1')
    expect(proposeRepertoireTask(signal, 'actor-1', access).source_signal_id).toBe('s1')
  })
  it('requires explicit confirmation before using the institutional task API', async () => {
    const crear = vi.fn().mockResolvedValue({ id: 'task-1' })
    expect(crear).not.toHaveBeenCalled()
    const result = await confirmRepertoireTask(signal, { actorId: 'actor-1', canAccess: access, taskApi: { crearTareaInstitucional: crear } })
    expect(crear).toHaveBeenCalledOnce()
    expect(result.sourceSignalId).toBe('s1')
  })
  it('routes requested preparation mutations instead of applying them', () => {
    expect(routeHermesMutation({ intent: 'CONSOLIDADO', deepLink: '/repertoire/measure/1' }, access).allowed).toBe(false)
  })
})
