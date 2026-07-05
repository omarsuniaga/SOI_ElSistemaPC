/**
 * Bundle Analyzer
 * Tracks bundle size and suggests code splitting
 */

export const BUNDLE_THRESHOLDS = {
  WARNING: 400 * 1024,
  ERROR: 500 * 1024,
  TARGET: 500 * 1024,
}

const CHUNK_SPLIT_THRESHOLD = 300 * 1024

/**
 * Analyze bundle chunks
 * @param {Object} chunks - Object with chunk names and sizes
 * @returns {Object} Analysis result
 */
export function analyzeBundle(chunks = {}) {
  const entries = Object.entries(chunks)
  const totalSize = entries.reduce((sum, [, size]) => sum + size, 0)
  
  const analysis = {
    totalSize,
    totalFormatted: formatBytes(totalSize),
    chunks: entries.map(([name, size]) => ({
      name,
      size,
      formatted: formatBytes(size),
    })),
    status: 'ok',
    recommendations: [],
  }

  if (totalSize > BUNDLE_THRESHOLDS.ERROR) {
    analysis.status = 'error'
    analysis.recommendations.push('Bundle exceeds 500KB target - split into smaller chunks')
  } else if (totalSize > BUNDLE_THRESHOLDS.WARNING) {
    analysis.status = 'warning'
    analysis.recommendations.push('Bundle approaching size limit - consider lazy loading routes')
  }

  const largeChunks = entries.filter(([, size]) => size > CHUNK_SPLIT_THRESHOLD)
  if (largeChunks.length > 0) {
    analysis.recommendations.push(`Found ${largeChunks.length} large chunks that should be split`)
  }

  return analysis
}

/**
 * Get formatted size for a chunk
 * @param {number} bytes
 */
export function getChunkSize(bytes) {
  return {
    bytes,
    formatted: formatBytes(bytes),
  }
}

/**
 * Determine if chunk should be split
 * @param {number} size - Chunk size in bytes
 * @returns {boolean}
 */
export function shouldSplitChunk(size) {
  return size > CHUNK_SPLIT_THRESHOLD
}

/**
 * Format bytes to human readable
 * @param {number} bytes
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Log bundle analysis to console
 * @param {Object} chunks
 */
export function logAnalysis(chunks) {
  const analysis = analyzeBundle(chunks)
  console.log(`[Bundle] Total: ${analysis.totalFormatted} - Status: ${analysis.status}`)
  
  if (analysis.recommendations.length > 0) {
    console.log('[Bundle] Recommendations:')
    analysis.recommendations.forEach(r => console.log(`  - ${r}`))
  }
  
  return analysis
}

export default {
  BUNDLE_THRESHOLDS,
  analyzeBundle,
  getChunkSize,
  shouldSplitChunk,
  logAnalysis,
}