import { describe, it, expect, vi } from 'vitest'
import { publishStudentRosterChange, subscribeStudentRosterChanges } from '../studentRosterEvents.js'

describe('roster change notifications', () => {
  it('notifies the current tab and other tabs, and unsubscribes cleanly', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeStudentRosterChanges(listener)
    publishStudentRosterChange()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('soi:student-roster-revision')).toBeTruthy()
    window.dispatchEvent(new StorageEvent('storage', { key: 'soi:student-roster-revision', newValue: 'changed' }))
    expect(listener).toHaveBeenCalledTimes(2)
    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated', newValue: 'ignored' }))
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    publishStudentRosterChange()
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
