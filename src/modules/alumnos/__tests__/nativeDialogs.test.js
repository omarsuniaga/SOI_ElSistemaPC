/**
 * nativeDialogs.test.js
 * C01 — Structural test: no alert/confirm/prompt in alumnos views
 *
 * This is a source-code analysis test. It reads the actual .js files
 * and verifies they contain no calls to browser native dialogs.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Recursively collect all .js files under a directory
 * (excluding __tests__ to avoid testing test files themselves)
 */
function getJsFiles(dir) {
  const results = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return results
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    let stat
    try {
      stat = statSync(fullPath)
    } catch {
      continue
    }
    if (stat.isDirectory()) {
      if (entry !== '__tests__' && entry !== 'node_modules') {
        results.push(...getJsFiles(fullPath))
      }
    } else if (entry.endsWith('.js')) {
      results.push(fullPath)
    }
  }
  return results
}

const viewsDir = join(__dirname, '..', 'views')
const files = getJsFiles(viewsDir)

describe('C01 — no native dialogs in alumnos views', () => {
  it('no alert() calls in alumnos views', () => {
    const violations = []
    for (const f of files) {
      const content = readFileSync(f, 'utf8')
      // Match alert( but NOT // alert( (commented) and NOT alertMessage or similar
      if (/(?<![/\w])alert\s*\(/.test(content)) {
        violations.push(f.replace(viewsDir, ''))
      }
    }
    expect(violations).toHaveLength(0)
  })

  it('no confirm() calls in alumnos views', () => {
    const violations = []
    for (const f of files) {
      const content = readFileSync(f, 'utf8')
      if (/(?<![/\w])confirm\s*\(/.test(content)) {
        violations.push(f.replace(viewsDir, ''))
      }
    }
    expect(violations).toHaveLength(0)
  })

  it('no prompt() calls in alumnos views', () => {
    const violations = []
    for (const f of files) {
      const content = readFileSync(f, 'utf8')
      if (/(?<![/\w])prompt\s*\(/.test(content)) {
        violations.push(f.replace(viewsDir, ''))
      }
    }
    expect(violations).toHaveLength(0)
  })
})
