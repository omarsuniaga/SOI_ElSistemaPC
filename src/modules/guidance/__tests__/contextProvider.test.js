/**
 * Tests for contextProvider.js
 * @module guidance/context/__tests__
 */

import { describe, it, expect, vi } from 'vitest'
import { createContextProvider } from '../context/contextProvider.js'

describe('createContextProvider', () => {
  it('should create a provider with default context', () => {
    const provider = createContextProvider()
    const ctx = provider.getContext()

    expect(ctx.view).toBeNull()
    expect(ctx.role).toBeNull()
    expect(ctx.data).toEqual({})
    expect(ctx.timestamp).toBe(0)
  })

  it('should set a view and update context', async () => {
    const provider = createContextProvider()
    await provider.setView('asistencia')

    const ctx = provider.getContext()
    expect(ctx.view).toBe('asistencia')
    expect(ctx.timestamp).toBeGreaterThan(0)
  })

  it('should set role separately', () => {
    const provider = createContextProvider()
    provider.setRole('maestro')

    const ctx = provider.getContext()
    expect(ctx.role).toBe('maestro')
  })

  it('should merge data into context', () => {
    const provider = createContextProvider()
    provider.mergeData({ hasNewStudents: true, count: 5 })

    const ctx = provider.getContext()
    expect(ctx.data.hasNewStudents).toBe(true)
    expect(ctx.data.count).toBe(5)
  })

  it('should notify subscribers on context change', async () => {
    const provider = createContextProvider()
    const callback = vi.fn()
    provider.subscribe(callback)

    await provider.setView('calificaciones')

    expect(callback).toHaveBeenCalledTimes(1)
    const receivedCtx = callback.mock.calls[0][0]
    expect(receivedCtx.view).toBe('calificaciones')
  })

  it('should unsubscribe correctly', () => {
    const provider = createContextProvider()
    const callback = vi.fn()
    const unsub = provider.subscribe(callback)

    unsub()
    provider.setRole('admin')

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not notify on duplicate role set', () => {
    const provider = createContextProvider()
    provider.setRole('maestro')
    const callback = vi.fn()
    provider.subscribe(callback)

    provider.setRole('maestro') // same role

    expect(callback).not.toHaveBeenCalled()
  })

  it('should track visited views', async () => {
    const provider = createContextProvider()

    expect(provider.isVisited('hoy')).toBe(false)
    await provider.setView('hoy')
    expect(provider.isVisited('hoy')).toBe(true)
    expect(provider.isVisited('asistencia')).toBe(false)
  })

  it('should mark isFirstVisit in context', async () => {
    const provider = createContextProvider()
    await provider.setView('hoy')

    const ctx = provider.getContext()
    expect(ctx.isFirstVisit).toBe(true)

    await provider.setView('hoy')
    const ctx2 = provider.getContext()
    expect(ctx2.isFirstVisit).toBe(false)
  })

  it('should reset context completely', () => {
    const provider = createContextProvider()
    provider.setRole('maestro')
    provider.mergeData({ foo: 'bar' })

    provider.reset()

    const ctx = provider.getContext()
    expect(ctx.view).toBeNull()
    expect(ctx.role).toBeNull()
    expect(ctx.data).toEqual({})
  })

  it('should call dataFetcher when setView is called', async () => {
    const fetcher = vi.fn().mockResolvedValue({ fetched: true })
    const provider = createContextProvider({ dataFetcher: fetcher })

    await provider.setView('hoy')

    expect(fetcher).toHaveBeenCalledWith('hoy', expect.objectContaining({ view: 'hoy' }))
    const ctx = provider.getContext()
    expect(ctx.data.fetched).toBe(true)
  })

  it('should handle dataFetcher errors gracefully', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('DB down'))
    const provider = createContextProvider({ dataFetcher: fetcher })

    // Should not throw
    await provider.setView('hoy')

    const ctx = provider.getContext()
    expect(ctx.view).toBe('hoy')
  })
})
