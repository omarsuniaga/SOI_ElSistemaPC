import { SECTIONS } from './fixtures/sections.js'
import { STUDENTS } from './fixtures/students.js'
import { EVALUATIONS } from './fixtures/evaluations.js'
import { REPERTOIRE } from './fixtures/repertoire.js'
import { isEligible } from '../../domain/eligibility.js'

export async function getCurrentUser() {
  return { id: 'usr-jurado-1', email: 'jurado1@test.com', role: 'jurado' }
}

export async function getSections() {
  return structuredClone(SECTIONS)
}

export async function getRepertoire(sectionId) {
  return structuredClone(REPERTOIRE.filter(r => r.section_id === sectionId))
}

export async function getAssignedStudents(juradoId) {
  return structuredClone(STUDENTS)
}

export async function getEvaluationsByJurado(juradoId) {
  return structuredClone(EVALUATIONS.filter(e => e.jurado_id === juradoId))
}

export async function saveEvaluation(payload) {
  if (!isEligible(payload)) {
    throw new Error('incomplete evaluation')
  }
  const idx = EVALUATIONS.findIndex(
    e => e.student_id === payload.student_id && e.jurado_id === payload.jurado_id
  )
  const now = new Date().toISOString()
  const record = {
    id: idx >= 0 ? EVALUATIONS[idx].id : `eval-new-${Date.now()}`,
    ...payload,
    created_at: idx >= 0 ? EVALUATIONS[idx].created_at : now,
    updated_at: now,
  }
  if (idx >= 0) EVALUATIONS[idx] = record
  else EVALUATIONS.push(record)
  return structuredClone(record)
}

export async function getStudentResults() {
  return [
    { student_id: 'stu-1', student_name: 'Ana García', section_name: 'Violines I', avg_score: 3.0, group: 'B' },
    { student_id: 'stu-2', student_name: 'Bruno López', section_name: 'Violines I', avg_score: null, group: null },
    { student_id: 'stu-3', student_name: 'Carla Martín', section_name: 'Violines I', avg_score: 4.0, group: 'A' },
    { student_id: 'stu-4', student_name: 'David Sánchez', section_name: 'Violines II', avg_score: 1.0, group: 'D' },
  ]
}

export async function getAllEvaluations() {
  return structuredClone(EVALUATIONS)
}
