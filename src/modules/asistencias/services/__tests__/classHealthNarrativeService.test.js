import { describe, it, expect, vi, afterEach } from 'vitest'

// Stub the groq proxy module so importing the service never loads the Supabase client.
vi.mock('../../../../portal-maestros/services/groqService.js', () => ({
  callGroq: vi.fn(),
  parseGroqJSON: (raw) => JSON.parse(raw),
}))

import { generateClassNarratives } from '../classHealthNarrativeService.js'

function classWith(className, entries, classId = `uuid-${className}`) {
  return {
    classId,
    className,
    content: {
      entries: entries.map((text, i) => ({ date: `2026-09-${String(i + 1).padStart(2, '0')}`, text })),
    },
  }
}

const EMPTY = { classId: 'uuid-empty', className: 'Coro', content: { entries: [] } }

function respond(resumenes) {
  return JSON.stringify({ resumenes })
}

function promptOf(callModel, callIndex = 0) {
  const messages = callModel.mock.calls[callIndex][0]
  return messages.map((m) => m.content).join('\n')
}

afterEach(() => {
  vi.useRealTimers()
})

describe('generateClassNarratives - mapping', () => {
  it('maps narratives by index and leaves classes without content as null', async () => {
    const callModel = vi.fn().mockResolvedValue(respond([
      { id: 'c0', resumen: 'Se trabajaron escalas.' },
      { id: 'c2', resumen: 'Se practicaron arpegios.' },
    ]))
    const classes = [classWith('Violín', ['Escalas']), EMPTY, classWith('Viola', ['Arpegios'])]

    const result = await generateClassNarratives(classes, { monthLabel: 'Septiembre 2026', callModel })

    expect(result).toEqual({
      narratives: ['Se trabajaron escalas.', null, 'Se practicaron arpegios.'],
      failed: 0,
    })
    expect(callModel).toHaveBeenCalledTimes(1)
  })

  it('makes zero model calls when no class has content', async () => {
    const callModel = vi.fn()
    const result = await generateClassNarratives([EMPTY, { ...EMPTY, classId: 'x' }], { callModel })

    expect(callModel).not.toHaveBeenCalled()
    expect(result).toEqual({ narratives: [null, null], failed: 0 })
  })

  it('sends classes in sequential batches of batchSize', async () => {
    const callModel = vi.fn()
      .mockResolvedValueOnce(respond([{ id: 'c0', resumen: 'Uno.' }, { id: 'c1', resumen: 'Dos.' }]))
      .mockResolvedValueOnce(respond([{ id: 'c2', resumen: 'Tres.' }]))
    const classes = [classWith('A', ['a']), classWith('B', ['b']), classWith('C', ['c'])]

    const result = await generateClassNarratives(classes, { callModel, batchSize: 2 })

    expect(callModel).toHaveBeenCalledTimes(2)
    expect(promptOf(callModel, 0)).toContain('c1')
    expect(promptOf(callModel, 0)).not.toContain('c2')
    expect(promptOf(callModel, 1)).toContain('c2')
    expect(result.narratives).toEqual(['Uno.', 'Dos.', 'Tres.'])
    expect(result.failed).toBe(0)
  })

  it('ignores response items whose id does not belong to the batch', async () => {
    const callModel = vi.fn().mockResolvedValue(respond([
      { id: 'c0', resumen: 'Válido.' },
      { id: 'c7', resumen: 'Inventado.' },
    ]))
    const classes = [classWith('A', ['a']), classWith('B', ['b'])]

    const result = await generateClassNarratives(classes, { callModel })

    expect(result.narratives).toEqual(['Válido.', null])
    expect(result.failed).toBe(1)
  })

  it('trims narratives, rejects empty ones and caps them at 600 characters', async () => {
    const callModel = vi.fn().mockResolvedValue(respond([
      { id: 'c0', resumen: `  ${'x'.repeat(700)}  ` },
      { id: 'c1', resumen: '   ' },
    ]))
    const classes = [classWith('A', ['a']), classWith('B', ['b'])]

    const result = await generateClassNarratives(classes, { callModel })

    expect(result.narratives[0]).toBe('x'.repeat(600))
    expect(result.narratives[1]).toBeNull()
    expect(result.failed).toBe(1)
  })
})

describe('generateClassNarratives - failures never throw', () => {
  it('a rejected batch leaves its classes null and counts them, while later batches still succeed', async () => {
    const callModel = vi.fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(respond([{ id: 'c2', resumen: 'Tercera clase.' }]))
    const classes = [classWith('A', ['a']), classWith('B', ['b']), classWith('C', ['c'])]

    const result = await generateClassNarratives(classes, { callModel, batchSize: 2 })

    expect(result).toEqual({ narratives: [null, null, 'Tercera clase.'], failed: 2 })
  })

  it('a timed-out batch leaves its classes null', async () => {
    vi.useFakeTimers()
    const callModel = vi.fn(() => new Promise(() => {}))
    const classes = [classWith('A', ['a'])]

    const pending = generateClassNarratives(classes, { callModel, timeoutMs: 20000 })
    await vi.advanceTimersByTimeAsync(20000)
    const result = await pending

    expect(result).toEqual({ narratives: [null], failed: 1 })
  })

  it('unparseable JSON leaves its classes null and counts them', async () => {
    const callModel = vi.fn().mockResolvedValue('esto no es json {')
    const classes = [classWith('A', ['a'])]

    const result = await generateClassNarratives(classes, { callModel })

    expect(result).toEqual({ narratives: [null], failed: 1 })
  })

  it('a missing resumenes array leaves its classes null', async () => {
    const callModel = vi.fn().mockResolvedValue(JSON.stringify({ otra: 1 }))
    const classes = [classWith('A', ['a'])]

    const result = await generateClassNarratives(classes, { callModel })

    expect(result).toEqual({ narratives: [null], failed: 1 })
  })
})

describe('generateClassNarratives - prompt', () => {
  it('uses system and user messages and identifies classes by positional id, never by classId', async () => {
    const callModel = vi.fn().mockResolvedValue(respond([{ id: 'c0', resumen: 'Resumen.' }]))
    const classes = [classWith('Violín N2', ['Escalas mayores'], 'b7f3e2-secret-id')]

    await generateClassNarratives(classes, { callModel, monthLabel: 'Septiembre 2026' })

    const messages = callModel.mock.calls[0][0]
    expect(messages.map((m) => m.role)).toEqual(['system', 'user'])
    const text = messages.map((m) => m.content).join('\n')
    expect(text).toContain('c0')
    expect(text).toContain('Violín N2')
    expect(text).toContain('Septiembre 2026')
    expect(text).toContain('2026-09-01: Escalas mayores')
    expect(text).not.toContain('b7f3e2-secret-id')
    expect(text).toContain('"resumenes"')
  })

  it('truncates each entry to 400 characters in the prompt', async () => {
    const callModel = vi.fn().mockResolvedValue(respond([{ id: 'c0', resumen: 'Resumen.' }]))
    const classes = [classWith('A', ['a'.repeat(500)])]

    await generateClassNarratives(classes, { callModel })

    const text = promptOf(callModel)
    expect(text).toContain('a'.repeat(400))
    expect(text).not.toContain('a'.repeat(401))
  })
})
