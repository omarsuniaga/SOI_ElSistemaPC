import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ call: vi.fn(), config: { isDemoMode: false } }))
vi.mock('../groqService.js', () => ({ callGroq: mocks.call, parseGroqJSON: JSON.parse }))
vi.mock('../../../core/config/config.js', () => ({ config: mocks.config }))
import { reviewLessonObservation } from '../lessonReviewService.js'

describe('assisted lesson review service', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.config.isDemoMode = false })
  it('uses one analysis call without invoking the legacy grader', async () => {
    mocks.call.mockResolvedValue(JSON.stringify({ blocks: [{ source: 'Escalas.', text: 'Escalas.', kind: 'contenido', scope: 'presentes', studentIds: [], nota: 5 }] }))
    const result = await reviewLessonObservation('Escalas.', { roster: [] })
    expect(mocks.call).toHaveBeenCalledTimes(1)
    expect(result.blocks[0]).not.toHaveProperty('nota')
  })
  it('preserves all source text on a malformed response or provider failure', async () => {
    mocks.call.mockResolvedValue('{}')
    expect((await reviewLessonObservation('No logró la escala.')).blocks[0].text).toBe('No logró la escala.')
    mocks.call.mockRejectedValue(new Error('offline'))
    expect((await reviewLessonObservation('No logró la escala.')).warning).toContain('Conservamos')
  })
  it('does not send demo student data to AI', async () => {
    mocks.config.isDemoMode = true
    expect((await reviewLessonObservation('Practicamos arco.')).warning).toContain('Demo')
    expect(mocks.call).not.toHaveBeenCalled()
  })
})
