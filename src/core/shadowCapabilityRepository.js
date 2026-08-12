import { supabase } from '../lib/supabaseClient.js'

const throwIfError = ({ error, data }) => {
  if (error) throw error
  return data
}

export function createShadowCapabilityRepository(client = supabase) {
  if (!client?.from || !client?.rpc) throw new TypeError('A Supabase-compatible client is required.')

  return Object.freeze({
    async listProposals(filters = {}) {
      let query = client.from('shadow_capability_proposals').select('*').order('updated_at', { ascending: false })
      for (const [field, value] of Object.entries({
        status: filters.status, portal_id: filters.portalId, module_id: filters.moduleId,
      })) if (value != null) query = query.eq(field, value)
      if (filters.limit != null) query = query.limit(filters.limit)
      return throwIfError(await query) || []
    },

    async getProposal(id) {
      const proposal = throwIfError(await client.from('shadow_capability_proposals').select('*').eq('id', id).single())
      const events = throwIfError(await client.from('shadow_capability_audit_events')
        .select('*').eq('proposal_id', id).order('sequence', { ascending: true })) || []
      return Object.freeze({ ...proposal, auditEvents: Object.freeze(events) })
    },

    async createProposal(payload, { requestKey } = {}) {
      return throwIfError(await client.rpc('create_shadow_capability_proposal', {
        p_payload: payload, p_request_key: requestKey,
      }))
    },

    async transitionProposal(id, action, { expectedVersion, requestKey } = {}) {
      return throwIfError(await client.rpc('transition_shadow_capability_proposal', {
        p_proposal_id: id, p_action: action, p_expected_version: expectedVersion, p_request_key: requestKey,
      }))
    },
  })
}

export const shadowCapabilityRepository = supabase ? createShadowCapabilityRepository() : null
