// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const root = process.cwd()
const nodeSuites = [
  'tests/unit/migrations/attendanceStatusDominicanClock.test.mjs',
  'tests/unit/migrations/cepmPublicBalance.test.mjs',
  'tests/unit/migrations/serviceBalanceRefreshPolicy.test.mjs',
]
const dedicatedSuites = [
  'tools/unicode-reviewer/revisar-textos.test.mjs',
]

describe('test runner discovery contract', () => {
  it('discovers every repository test or assigns it explicitly to Node', () => {
    const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' })
      .split('\0').filter(file => /\.(test|spec)\.[cm]?[jt]sx?$/.test(file))
    const vitestBin = path.join(path.dirname(require.resolve('vitest/package.json')), 'vitest.mjs')
    const listed = JSON.parse(execFileSync(process.execPath, [vitestBin, 'list', '--filesOnly', '--json'], { cwd: root, encoding: 'utf8' }))
      .map(({ file }) => path.relative(root, file).replaceAll('\\', '/'))
    const nonVitestSuites = [...nodeSuites, ...dedicatedSuites]
    expect(files.filter(file => !nonVitestSuites.includes(file) && !listed.includes(file))).toEqual([])
    expect(listed.filter(file => nonVitestSuites.includes(file))).toEqual([])
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts
    for (const file of nodeSuites) expect(scripts['test:node']).toContain(file)
    expect(scripts['unicode:test']).toContain('vitest.unicode.config.mjs')
  }, 30000)
})
