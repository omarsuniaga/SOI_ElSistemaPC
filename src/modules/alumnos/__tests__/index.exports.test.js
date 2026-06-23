import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readIndexSource() {
  return readFileSync(join(__dirname, '..', 'index.js'), 'utf8')
}

describe('E03 — alumnos index.js public API', () => {
  it('does not export useAlumnos', () => {
    const src = readIndexSource()
    expect(src).not.toMatch(/export\s*\{[^}]*useAlumnos[^}]*\}/)
  })

  it('does not export AlumnosHook', () => {
    const src = readIndexSource()
    expect(src).not.toMatch(/AlumnosHook/)
  })

  it('still exports registerRoutesAlumnos', () => {
    const src = readIndexSource()
    expect(src).toMatch(/registerRoutesAlumnos/)
  })
})
