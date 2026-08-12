import { describe, expect, it, vi } from 'vitest'
import { createShadowCapabilityRepository } from './shadowCapabilityRepository.js'

const chain = result => {
  const query = {
    select: vi.fn(() => query), order: vi.fn(() => query), eq: vi.fn(() => query),
    limit: vi.fn(() => query), single: vi.fn(() => Promise.resolve(result)),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }
  return query
}

describe('shadowCapabilityRepository', () => {
  it('creates and transitions exclusively through the two shadow RPCs', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { id: 'p1', version: 1 }, error: null })
    const client = { rpc, from: vi.fn(() => chain({ data: [], error: null })) }
    const repository = createShadowCapabilityRepository(client)

    await repository.createProposal({ changeId: 'shadow-a' }, { requestKey: 'request-1' })
    await repository.transitionProposal('p1', 'submit', { expectedVersion: 1, requestKey: 'request-2' })

    expect(rpc).toHaveBeenNthCalledWith(1, 'create_shadow_capability_proposal', {
      p_payload: { changeId: 'shadow-a' }, p_request_key: 'request-1',
    })
    expect(rpc).toHaveBeenNthCalledWith(2, 'transition_shadow_capability_proposal', {
      p_proposal_id: 'p1', p_action: 'submit', p_expected_version: 1, p_request_key: 'request-2',
    })
    expect(repository).not.toHaveProperty('apply')
    expect(repository).not.toHaveProperty('update')
    expect(repository).not.toHaveProperty('delete')
  })

  it('lists with bounded filters and returns audit events in sequence order', async () => {
    const proposalQuery = chain({ data: [{ id: 'p1' }], error: null })
    const eventQuery = chain({ data: [{ sequence: 1 }], error: null })
    const client = {
      rpc: vi.fn(),
      from: vi.fn(table => table === 'shadow_capability_audit_events' ? eventQuery : proposalQuery),
    }
    const repository = createShadowCapabilityRepository(client)
    expect(await repository.listProposals({ portalId: 'ACM', status: 'draft', limit: 10 })).toEqual([{ id: 'p1' }])
    const detail = await repository.getProposal('p1')
    expect(detail.auditEvents).toEqual([{ sequence: 1 }])
    expect(eventQuery.order).toHaveBeenCalledWith('sequence', { ascending: true })
  })

  it('propagates database/RLS errors', async () => {
    const denied = new Error('permission denied')
    const repository = createShadowCapabilityRepository({
      from: vi.fn(() => chain({ data: null, error: denied })),
      rpc: vi.fn().mockResolvedValue({ data: null, error: denied }),
    })
    await expect(repository.createProposal({}, { requestKey: 'x' })).rejects.toBe(denied)
    await expect(repository.listProposals()).rejects.toBe(denied)
  })
})

