export function assignGroup(score) {
  if (score < 8 || score > 32) {
    throw new RangeError('score out of range')
  }
  if (score >= 28) return 'A'
  if (score >= 20) return 'B'
  if (score >= 12) return 'C'
  return 'D'
}
