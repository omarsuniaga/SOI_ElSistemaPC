import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

let sql
beforeAll(() => {
  sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260812000006_shadow_capability_persistence.sql'), 'utf8')
})

describe('shadow capability persistence migration', () => {
  it('creates only proposal and append-only audit storage with forced RLS', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.shadow_capability_proposals')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.shadow_capability_audit_events')
    expect(sql.match(/FORCE ROW LEVEL SECURITY/g)).toHaveLength(2)
    expect(sql).toContain('ON DELETE RESTRICT')
    expect(sql).not.toMatch(/status[^\n]+applied/i)
    expect(sql).not.toMatch(/\bapply_shadow|\bapply_capability/i)
  })

  it('uses the canonical profile-backed admin helper, never paths or mutable metadata', () => {
    expect(sql).toMatch(/v_actor(?: uuid)?(?: :=)? .*auth\.uid\(\)/)
    expect(sql).toMatch(/v_actor IS NULL OR NOT public\.is_admin\(\)/)
    expect(sql.match(/USING \(\(SELECT public\.is_admin\(\)\)\)/g)).toHaveLength(2)
    expect(sql).not.toMatch(/user_metadata|app_metadata|auth\.jwt|\/admin/)
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION[\s\S]+FROM PUBLIC, anon/)
  })

  it('keeps mutations atomic, idempotent and concurrency-safe', () => {
    expect(sql).toContain('UNIQUE (request_key)')
    expect(sql).toContain('FOR UPDATE')
    expect(sql).toContain('p_expected_version')
    expect(sql).toContain("ERRCODE = '40001'")
    expect(sql.match(/EXCEPTION WHEN unique_violation/g)).toHaveLength(2)
    expect(sql).toMatch(/FOUND AND v_existing\.proposal_id = p_proposal_id AND v_existing\.action = p_action/)
    expect(sql).toContain('Re-read after waiting on the row lock')
    expect(sql).toContain('SECURITY DEFINER')
    expect(sql.match(/SET search_path = pg_catalog, public/g)).toHaveLength(2)
    expect(sql).not.toMatch(/CREATE POLICY[\s\S]{0,100}FOR (INSERT|UPDATE|DELETE)/i)
  })

  it('revokes defaults before narrow authenticated grants and validates required keys', () => {
    expect(sql).toContain('FROM PUBLIC, anon, authenticated')
    expect(sql).toContain("p_payload ?& ARRAY['changeId','portalId','moduleId','capabilityId','operation','reasonCode']")
    expect(sql).toContain('UUID primary keys create no sequences')
    expect(sql).toContain('GRANT SELECT ON TABLE public.shadow_capability_proposals TO authenticated')
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.create_shadow_capability_proposal')
  })

  it('matches the local state machine exactly', () => {
    const transitions = [
      ["v_result.status = 'draft' AND p_action = 'submit'", "THEN 'submitted'"],
      ["v_result.status = 'submitted' AND p_action = 'approve'", "THEN 'approved'"],
      ["v_result.status = 'submitted' AND p_action = 'reject'", "THEN 'rejected'"],
      ["v_result.status = 'rejected' AND p_action = 'revise'", "THEN 'draft'"],
      ["v_result.status = 'approved' AND p_action = 'simulate'", "THEN 'simulated'"],
    ]
    for (const [from, to] of transitions) {
      expect(sql).toContain(from)
      expect(sql).toContain(to)
    }
  })
})
