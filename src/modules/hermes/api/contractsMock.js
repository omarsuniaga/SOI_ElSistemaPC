const contracts = []
const events = []
let seq = 1

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function nextContractId() {
  return `TC-2026-${String(seq++).padStart(5, '0')}`
}

function buildEmitEvent(contract) {
  return {
    id: events.length + 1,
    contract_uuid: contract.uuid,
    occurred_at: contract.emitted_at,
    event_type: 'emit',
    actor: contract.emitted_by,
    payload: {
      contract_id: contract.contract_id,
      linked_task_id: contract.linked_task_id,
      soi_policy_ref: contract.soi_policy_ref,
    },
  }
}

export async function createTaskContract(payload) {
  const contract = {
    uuid: crypto.randomUUID(),
    contract_id: nextContractId(),
    emitted_at: new Date().toISOString(),
    emitted_by: payload.emitted_by || 'hermes:manual',
    source_event: payload.source_event || {},
    soi_policy_ref: payload.soi_policy_ref || {},
    assignee: payload.assignee || {},
    assignee_user_id: payload.assignee_user_id || null,
    action_required: payload.action_required,
    evidence_required: payload.evidence_required || {},
    close_criteria: payload.close_criteria,
    deadline: payload.deadline,
    priority: payload.priority || 'normal',
    escalation_path: payload.escalation_path || [],
    state: payload.state || 'emitted',
    state_updated_at: new Date().toISOString(),
    linked_task_id: payload.linked_task_id || null,
    supersedes: payload.supersedes || null,
    superseded_by: payload.superseded_by || null,
    tags: payload.tags || [],
  }
  contracts.unshift(contract)
  events.push(buildEmitEvent(contract))
  return clone(contract)
}

export async function getTaskContracts() {
  return clone(contracts)
}

export async function getTaskContractAudit(contractUuid) {
  return clone(events.filter((e) => e.contract_uuid === contractUuid))
}
