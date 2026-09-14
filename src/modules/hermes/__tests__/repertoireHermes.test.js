import { describe, expect, it } from 'vitest'
import { detectMaterialSignals, explainSignal, proposeTaskFromSignal, routeMutationRequest } from '../logic/repertoireHermes.js'

const signal = { id: 's1', severity: 'CRITICAL', lifecycle: 'OPEN', reason: 'milestone vencido', deepLink: '/repertoire/measure/1', evidence: { passageName: 'Tema B', redMeasures: 4, milestoneOverdue: true, daysToEvent: 8 } }

describe('Hermes repertoire boundary', () => {
  it('detects material changes without recomputing priority', () => {
    expect(detectMaterialSignals([signal], new Map())).toHaveLength(1)
    expect(detectMaterialSignals([signal], new Map([['s1', signal]]) )).toHaveLength(0)
  })
  it('explains only supplied evidence and preserves sources', () => {
    const result = explainSignal(signal)
    expect(result.text).toContain('Tema B')
    expect(result.text).toContain('4 compases en rojo')
    expect(result.text).not.toContain('mejoró')
    expect(result.sources).toContain('SIGNAL')
  })
  it('proposes a bounded, traceable task and never mutates preparation', () => {
    expect(proposeTaskFromSignal(signal, 'actor-1')).toMatchObject({ source_signal_id: 's1', deep_link: '/repertoire/measure/1' })
    expect(routeMutationRequest({ intent: 'CONSOLIDADO' }, signal.deepLink).allowed).toBe(false)
  })
})
