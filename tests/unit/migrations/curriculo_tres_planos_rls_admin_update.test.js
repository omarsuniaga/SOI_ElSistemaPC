import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('RLS: route_versions admin UPDATE policy (curriculo-tres-planos fix)', () => {
  it('should have route_versions_admin_update_propuesta policy in migration 20260705_000001', () => {
    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations/20260705_000001_add_route_versions_admin_update_policy.sql'
    )
    const content = fs.readFileSync(migrationPath, 'utf-8')

    // Verify policy name exists
    expect(content).toContain('route_versions_admin_update_propuesta')

    // Verify FOR UPDATE clause
    expect(content).toContain('FOR UPDATE')

    // Verify es_admin() check
    expect(content).toContain('public.es_admin()')

    // Verify WITH CHECK (idempotent write safety)
    expect(content).toContain('WITH CHECK')
  })

  it('should enable ACM to UPDATE route_versions status for publish/return flow', () => {
    const apiPath = path.join(
      process.cwd(),
      'src/modules/planificacion/api/propuestasApi.js'
    )
    const content = fs.readFileSync(apiPath, 'utf-8')

    // publicarPropuesta and devolverPropuesta both call .update() on route_versions
    expect(content).toContain('publicarPropuesta')
    expect(content).toContain('devolverPropuesta')
    expect(content).toMatch(/route_versions[\s\S]*?\.update\(/i)
  })
})
