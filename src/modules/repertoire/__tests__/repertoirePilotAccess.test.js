import { describe, expect, it } from 'vitest'
import { isRepertoirePilotUser, parseRepertoirePilotIds } from '../api/repertoirePilotAccess.js'

describe('Repertoire pilot access', () => {
  it('parses a comma-separated explicit allowlist', () => {
    expect(parseRepertoirePilotIds(' maestro-a, ,maestro-b ')).toEqual(['maestro-a', 'maestro-b'])
  })

  it('requires both the global flag and an explicit pilot user', () => {
    expect(isRepertoirePilotUser('maestro-a', { enabled: false, pilotIds: 'maestro-a' })).toBe(false)
    expect(isRepertoirePilotUser('maestro-a', { enabled: true, pilotIds: 'maestro-b' })).toBe(false)
    expect(isRepertoirePilotUser('maestro-a', { enabled: true, pilotIds: 'maestro-a' })).toBe(true)
  })

  it('fails closed for blank identities and allowlists', () => {
    expect(isRepertoirePilotUser('', { enabled: true, pilotIds: 'maestro-a' })).toBe(false)
    expect(isRepertoirePilotUser('maestro-a', { enabled: true, pilotIds: '' })).toBe(false)
  })
})
