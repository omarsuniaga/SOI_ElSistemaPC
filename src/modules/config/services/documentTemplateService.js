import { supabase } from '../../../lib/supabaseClient.js'

export async function listTemplates({ tipo, estado } = {}) {
  let q = supabase.from('document_templates').select('*').order('nombre')
  if (tipo)   q = q.eq('tipo', tipo)
  if (estado) q = q.eq('estado', estado)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getTemplateById(id) {
  const { data, error } = await supabase
    .from('document_templates').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createTemplate(payload) {
  const vars = extractVariablesFromContent(payload.contenido || '')
  const { data, error } = await supabase
    .from('document_templates')
    .insert({ ...payload, variables: vars, updated_at: new Date().toISOString() })
    .select().single()
  if (error) throw error
  return data
}

export async function updateTemplate(id, payload) {
  const update = { ...payload, updated_at: new Date().toISOString() }
  if (payload.contenido) update.variables = extractVariablesFromContent(payload.contenido)
  const { data, error } = await supabase
    .from('document_templates').update(update).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function archiveTemplate(id) {
  return updateTemplate(id, { estado: 'archivada' })
}

export async function duplicateTemplate(id) {
  const original = await getTemplateById(id)
  return createTemplate({
    ...original,
    id:      undefined,
    nombre:  `${original.nombre} (copia)`,
    estado:  'inactiva',
    version: 1,
  })
}

export function extractVariablesFromContent(content = '') {
  const matches = content.match(/\{(\w+)\}/g) || []
  return [...new Set(matches)]
}
