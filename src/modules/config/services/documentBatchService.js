import { supabase } from '../../../lib/supabaseClient.js'
import { buildStudentDocumentContext, getActiveSchooling, getMissingDocumentFields, getStudentDocumentStatus } from './studentDocumentDataService.js'

export async function createBatch(payload) {
  const { data, error } = await supabase
    .from('document_batches').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateBatchTotals(batchId, { generados, advertencias, excluidos }) {
  await supabase.from('document_batches').update({
    total_generados:        generados,
    total_con_advertencias: advertencias,
    total_excluidos:        excluidos,
    estado:                 'generado',
    generated_at:           new Date().toISOString(),
  }).eq('id', batchId)
}

export async function diagnoseBatchStudents(alumnos) {
  const results = await Promise.all(
    alumnos.map(async (alumno) => {
      const escolaridad = await getActiveSchooling(alumno.id)
      const context     = buildStudentDocumentContext({ alumno, escolaridad })
      const missing     = getMissingDocumentFields(context)
      const status      = getStudentDocumentStatus(context)
      return { alumno, escolaridad, context, status, missing }
    })
  )
  return results
}

export async function saveGeneratedDocument(payload) {
  const { data, error } = await supabase
    .from('generated_documents').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function listGeneratedDocuments({ limit = 50, tipo, estado } = {}) {
  let q = supabase.from('generated_documents').select('*')
    .order('created_at', { ascending: false }).limit(limit)
  if (tipo)   q = q.eq('tipo', tipo)
  if (estado) q = q.eq('estado', estado)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function archiveDocument(id) {
  await supabase.from('generated_documents').update({ estado: 'archivado' }).eq('id', id)
}

export async function anularDocument(id) {
  await supabase.from('generated_documents').update({ estado: 'anulado' }).eq('id', id)
}
