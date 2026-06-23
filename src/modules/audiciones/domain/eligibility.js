export function isEligible(evaluation) {
  if (!evaluation || !evaluation.student_id || !evaluation.jurado_id) {
    return false
  }

  const keys = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
  for (const key of keys) {
    const val = evaluation[key]
    if (val === null || val === undefined || !Number.isInteger(val) || val < 1 || val > 4) {
      return false
    }
  }

  return true
}
