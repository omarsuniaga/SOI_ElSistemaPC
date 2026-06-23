export function scoreCriteria(criteria) {
  const keys = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']

  for (const key of keys) {
    if (!(key in criteria)) {
      throw new TypeError('missing criteria')
    }
    const val = criteria[key]
    if (val === null || val === undefined || !Number.isInteger(val) || val < 1 || val > 4) {
      throw new RangeError('criterion out of range')
    }
  }

  return keys.reduce((sum, key) => sum + criteria[key], 0)
}
