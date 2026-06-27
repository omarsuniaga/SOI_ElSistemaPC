import { supabase } from '../../../lib/supabaseClient.js'

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw new Error(`auth failed: ${error.message}`)
  const { data: role } = await supabase.rpc('get_user_role')
  return { id: user.id, email: user.email, role }
}

export async function getSections() {
  const { data, error } = await supabase.from('sections').select('*').order('name')
  if (error) throw new Error(`getSections failed: ${error.message}`)
  return data
}

export async function getRepertoire(sectionId) {
  const { data, error } = await supabase
    .from('repertoire_items')
    .select('*')
    .eq('section_id', sectionId)
    .order('name')
  if (error) throw new Error(`getRepertoire failed: ${error.message}`)
  return data
}

export async function getAssignedStudents(juradoId) {
  const { data, error } = await supabase.from('students').select('*').order('full_name')
  if (error) throw new Error(`getAssignedStudents failed: ${error.message}`)
  return data
}

export async function getEvaluationsByJurado(juradoId) {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('jurado_id', juradoId)
    .order('created_at')
  if (error) throw new Error(`getEvaluationsByJurado failed: ${error.message}`)
  return data
}

export async function saveEvaluation(payload) {
  const { data, error } = await supabase
    .from('evaluations')
    .upsert(payload, { onConflict: 'student_id,jurado_id' })
    .select()
    .single()
  if (error) throw new Error(`saveEvaluation failed: ${error.message}`)
  return data
}

export async function getStudentResults() {
  const { data, error } = await supabase.from('student_results').select('*')
  if (error) throw new Error(`getStudentResults failed: ${error.message}`)
  return data
}

export async function getAllEvaluations() {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*, students(full_name), sections(name)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`getAllEvaluations failed: ${error.message}`)
  return data
}
