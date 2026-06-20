import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readApiSource() {
  return readFileSync(join(__dirname, '..', 'api', 'postulantesApi.js'), 'utf8')
}

describe('postuladosApi dispatcher', () => {
  it('routes to mock when isDemoMode is true, supabase when false', () => {
    const source = readApiSource()
    expect(source).toMatch(/config\.isDemoMode/)
    expect(source).toMatch(/\? mockImpl : supabaseImpl/)
    expect(source).toMatch(/mockImpl/)
    expect(source).toMatch(/supabaseImpl/)
  })

  it('dispatches all postulados functions through the same pattern', () => {
    const source = readApiSource()
    const lines = source.split('\n').filter(l => l.includes('=> getApi()'))
    expect(lines.length).toBeGreaterThanOrEqual(8)
    lines.forEach(line => {
      expect(line).toMatch(/getApi\(\)\./)
    })
  })

  it('postulantesSupabase re-exports are marked @deprecated', () => {
    const source = readFileSync(
      join(__dirname, '..', 'api', 'postulantesSupabase.js'),
      'utf8'
    )
    const exportLine = source.split('\n').find(l => l.includes('export * from'))
    expect(exportLine).toBeTruthy()
    const lineIdx = source.split('\n').indexOf(exportLine)
    const lines = source.split('\n')
    const before = lines.slice(Math.max(0, lineIdx - 3), lineIdx).join('\n')
    expect(before).toMatch(/@deprecated/i)
  })
})
