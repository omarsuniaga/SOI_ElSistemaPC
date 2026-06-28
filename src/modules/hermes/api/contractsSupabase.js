import { supabase } from '../../../lib/supabaseClient.js'

const CONTRACT_COLUMNS = `
  uuid, contract_id, emitted_at, emitted_by, source_event, soi_policy_ref,
  assignee, assignee_user_id, action_required, evidence_required, close_criteria,
  deadline, priority, escalation_path, state, state_updated_at, linked_task_id,
  supersedes, superseded_by, tags
`

export async function createTaskContract(payload) {
  const { data, error } = await supabase
    .from('task_contracts')
    .insert(payload)
    .select(CONTRACT_COLUMNS)
    .single()

  if (error) throw error

  const { error: eventError } = await supabase
    .from('task_contract_events')
    .insert({
      contract_uuid: data.uuid,
      event_type: 'emit',
      actor: payload.emitted_by,
      payload: {
        contract_id: data.contract_id,
        linked_task_id: data.linked_task_id,
        soi_policy_ref: data.soi_policy_ref,
      },
    })

  if (eventError) throw eventError
  return data
}

export async function getTaskContracts() {
  const { data, error } = await supabase
    .from('task_contracts')
    .select(CONTRACT_COLUMNS)
    .order('emitted_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getTaskContractAudit(contractUuid) {
  const { data, error } = await supabase
    .from('task_contract_events')
    .select('id, contract_uuid, occurred_at, event_type, actor, payload')
    .eq('contract_uuid', contractUuid)
    .order('occurred_at', { ascending: true })
  if (error) throw error
  return data || []
}
