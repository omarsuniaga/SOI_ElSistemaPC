/**
 * Calculate the Levenshtein distance between two strings.
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, substitutions) required to change one string into another.
 *
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} The Levenshtein distance
 */
export function levenshteinDistance(a, b) {
  const lenA = a.length
  const lenB = b.length

  // Create a matrix to store distances
  const matrix = Array.from({ length: lenA + 1 }, (_, i) => [i])

  // Initialize first row
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j
  }

  // Fill the matrix
  for (let i = 1; i <= lenA; i++) {
    matrix[i][0] = i
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[lenA][lenB]
}

/**
 * Calculate a fuzzy match score between two strings (0 to 1).
 * Uses Levenshtein distance to determine similarity.
 * Score of 1.0 means identical, 0.0 means completely different.
 *
 * The score is calculated as: 1 - (distance / max_length)
 * This ensures the score is always between 0 and 1.
 *
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Similarity score between 0 and 1
 */
export function fuzzyMatch(a, b) {
  // Normalize strings: lowercase for case-insensitive matching
  const normalizedA = a.toLowerCase()
  const normalizedB = b.toLowerCase()

  // Handle empty strings
  if (normalizedA === normalizedB) return 1.0
  if (normalizedA.length === 0 || normalizedB.length === 0) {
    return 0.0
  }

  const distance = levenshteinDistance(normalizedA, normalizedB)
  const maxLen = Math.max(normalizedA.length, normalizedB.length)

  // Calculate score: 1 - (distance / maxLen)
  // This gives higher scores for strings with smaller distances
  return Math.max(0, 1 - (distance / maxLen))
}

/**
 * Find the best fuzzy match from a list of candidates.
 * Returns the candidate with the highest match score.
 *
 * @param {string} query - The search query
 * @param {string[]} candidates - Array of strings to match against
 * @param {number} threshold - Minimum score to consider (default: 0.6)
 * @returns {Object|null} { candidate, score } or null if no match above threshold
 */
export function fuzzyMatchBest(query, candidates, threshold = 0.6) {
  let bestMatch = null
  let bestScore = 0

  for (const candidate of candidates) {
    const score = fuzzyMatch(query, candidate)
    if (score > bestScore && score >= threshold) {
      bestScore = score
      bestMatch = candidate
    }
  }

  return bestMatch ? { candidate: bestMatch, score: bestScore } : null
}

/**
 * Filter and sort candidates by fuzzy match score.
 *
 * @param {string} query - The search query
 * @param {string[]} candidates - Array of strings to match against
 * @param {number} threshold - Minimum score to include (default: 0.6)
 * @returns {Array} Array of { candidate, score } sorted by score descending
 */
export function fuzzyMatchAll(query, candidates, threshold = 0.6) {
  const results = []

  for (const candidate of candidates) {
    const score = fuzzyMatch(query, candidate)
    if (score >= threshold) {
      results.push({ candidate, score })
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score)
}
