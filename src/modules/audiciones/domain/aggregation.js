import { scoreCriteria } from './scoring.js'
import { assignGroup } from './groupAssignment.js'

export function aggregateResults(evaluations, students, sections) {
  const sectionMap = Object.fromEntries(sections.map(s => [s.id, s.name]))
  const studentMap = Object.fromEntries(students.map(s => [s.id, s]))

  const grouped = {}
  for (const ev of evaluations) {
    if (!grouped[ev.student_id]) {
      grouped[ev.student_id] = []
    }
    grouped[ev.student_id].push(ev)
  }

  const results = []
  for (const [studentId, evals] of Object.entries(grouped)) {
    const student = studentMap[studentId]
    if (!student) continue

    const scores = evals.map(e => scoreCriteria(e))
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

    results.push({
      student_id: studentId,
      student_name: student.name,
      section_name: sectionMap[student.section_id] || '',
      avg_score: avgScore,
      group: assignGroup(avgScore),
      jurado_count: evals.length,
    })
  }

  results.sort((a, b) => {
    if (a.section_name !== b.section_name) {
      return a.section_name.localeCompare(b.section_name)
    }
    if (a.group !== b.group) {
      return a.group.localeCompare(b.group)
    }
    return b.avg_score - a.avg_score
  })

  return results
}
