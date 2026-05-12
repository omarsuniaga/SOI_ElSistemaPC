import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analyzeBundle, getChunkSize, shouldSplitChunk, BUNDLE_THRESHOLDS } from '../bundleAnalyzer.js'

describe('bundleAnalyzer', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', {
      memory: { usedJSHeapSize: 5000000 },
    })
  })

  it('defines bundle thresholds', () => {
    expect(BUNDLE_THRESHOLDS.WARNING).toBe(400 * 1024)
    expect(BUNDLE_THRESHOLDS.ERROR).toBe(500 * 1024)
  })

  it('analyzes bundle size', () => {
    const result = analyzeBundle({ 'main.js': 450000 })
    expect(result.totalSize).toBe(450000)
    expect(result.status).toBe('warning')
  })

  it('detects oversized bundle', () => {
    const result = analyzeBundle({ 'main.js': 600000 })
    expect(result.status).toBe('error')
  })

  it('calculates chunk size', () => {
    const size = getChunkSize(250000)
    expect(size.formatted).toBe('244.14 KB')
  })

  it('identifies large chunks for splitting', () => {
    const shouldSplit = shouldSplitChunk(450000)
    expect(shouldSplit).toBe(true)
  })

  it('identifies small chunks that should not split', () => {
    const shouldSplit = shouldSplitChunk(50000)
    expect(shouldSplit).toBe(false)
  })
})