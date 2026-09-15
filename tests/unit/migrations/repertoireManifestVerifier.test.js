import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('R1-A migration manifest verifier', () => {
  it('verifies canonical Git bytes instead of checkout line endings', () => {
    const script = resolve(process.cwd(), 'scripts/verify-repertoire-r1a-manifest.mjs')
    const output = execFileSync(process.execPath, [script, 'HEAD'], { encoding: 'utf8' })
    expect(output).toContain('Migration manifest verification passed: 10/10 canonical Git hashes for HEAD')
  })
})
