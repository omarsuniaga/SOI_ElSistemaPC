import { describe, expect, it } from 'vitest'
import { createTaskContract, getTaskContracts, getTaskContractAudit } from '../../../src/modules/hermes/api/contractsMock.js'

describe('contractsMock', () => {
  it('crea contrato y lo lista', async () => {
    const contract = await createTaskContract({
      emitted_by: 'hermes:manual',
      source_event: { summary: 'Caso de mora' },
      soi_policy_ref: { doc_id: 'FIN-P13' },
      assignee: {},
      action_required: 'Contactar familia',
      evidence_required: { type: 'manual_review' },
      close_criteria: 'Registrar contacto',
      deadline: new Date().toISOString(),
      priority: 'urgente',
      escalation_path: [],
      state: 'emitted',
      linked_task_id: 'task-1',
      tags: ['FIN-P13'],
    })
    const all = await getTaskContracts()
    expect(all.some((item) => item.uuid === contract.uuid)).toBe(true)
  })

  it('genera audit trail emit', async () => {
    const contract = await createTaskContract({
      emitted_by: 'hermes:manual',
      source_event: { summary: 'Caso de crisis' },
      soi_policy_ref: { doc_id: 'DIR-P05' },
      assignee: {},
      action_required: 'Escalar a dirección',
      evidence_required: { type: 'manual_review' },
      close_criteria: 'Dirección recibe el caso',
      deadline: new Date().toISOString(),
      priority: 'critica',
      escalation_path: [],
      state: 'emitted',
      linked_task_id: 'task-2',
      tags: ['DIR-P05'],
    })
    const audit = await getTaskContractAudit(contract.uuid)
    expect(audit.length).toBeGreaterThan(0)
    expect(audit[0].event_type).toBe('emit')
  })
})
