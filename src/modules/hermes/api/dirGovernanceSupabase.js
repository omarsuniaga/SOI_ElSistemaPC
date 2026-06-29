import { supabase } from '../../../lib/supabaseClient.js'

const TABLE = 'dir_decisions'

export async function createDecision(payload) {
  const row = {
    decision_type: payload.decision_type,
    title: payload.title,
    summary: payload.summary || null,
    status: payload.status || 'pending_review',
    amount_rd: payload.amount_rd ?? null,
    requires_dual_signature: Boolean(payload.requires_dual_signature),
    requires_board_review: Boolean(payload.requires_board_review),
    source_doc_refs: payload.source_doc_refs || [],
    related_minuta_id: payload.related_minuta_id || null,
    correlation_id: payload.correlation_id || null,
    metadata: payload.metadata || {},
    created_by: payload.created_by || null,
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getDecisions() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
