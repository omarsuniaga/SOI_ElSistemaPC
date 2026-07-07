import { supabase } from '../../lib/supabaseClient.js'

export async function uploadPlanningDoc({ maestroId, claseId, title, file, description }) {
  if (!file || !title) throw new Error('file and title are required')
  if (file.size > 10 * 1024 * 1024) throw new Error('File size must be < 10MB')

  const path = `planning/${maestroId}/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(path, file, { contentType: file.type })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('documentos')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('planning_documents')
    .insert({
      maestro_id: maestroId,
      clase_id: claseId || null,
      title,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      description: description || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDocuments(maestroId, claseId) {
  let query = supabase
    .from('planning_documents')
    .select('*, clases(nombre)')
    .eq('maestro_id', maestroId)
    .order('created_at', { ascending: false })

  if (claseId) query = query.eq('clase_id', claseId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function deleteDocument(docId, filePath) {
  if (filePath) {
    await supabase.storage.from('documentos').remove([filePath])
  }
  const { error } = await supabase
    .from('planning_documents')
    .delete()
    .eq('id', docId)
  if (error) throw error
}

export function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

export function getFileIcon(mimeType) {
  if (!mimeType) return '📄'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
  return '📄'
}
