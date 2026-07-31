import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { clonarPlantillaAClase, _resetContadorParaTests } from '../domain/ClonarPlantilla.js'

/**
 * clonarPlantilla.test.js — Tarea 1.5 (openspec/changes/mapa-gamificado-planificacion)
 *
 * Dos frentes, mismo patrón que idJerarquico.test.js / estrellas.test.js:
 * 1. Espejo JS puro del algoritmo de copia del RPC `clonar_plantilla_a_clase`
 *    (SECURITY DEFINER, no ejecutable desde Vitest sin BD real) + un test de
 *    integración que mockea `supabase.rpc(...)` devolviendo el resultado del
 *    espejo, verificando que la copia es independiente (IDs nuevos) y trae
 *    los `origen_*` poblados (REQ-10, design.md Decisión 6).
 * 2. Guard de migración: el archivo existe, tiene DOWN block, la tabla
 *    `mapa_plantillas` + su RLS, el RPC con SECURITY DEFINER +
 *    search_path = public, pg_temp, y el COMMENT de deprecación sobre
 *    `plantillas_planificacion`.
 */

describe('ClonarPlantilla (espejo JS del RPC clonar_plantilla_a_clase)', () => {
  beforeEach(() => {
    _resetContadorParaTests()
  })

  const objetivosGlobales = [
    {
      id: 'obj-global-1',
      nodeId: 'node-1',
      nombre: 'La 3ª posición',
      descripcion: 'Dominio de la tercera posición',
      indicadores: [
        { id: 'ind-global-1', descripcion: 'Afinación en 3ra posición' },
        { id: 'ind-global-2', descripcion: 'Cambios de posición fluidos' },
      ],
    },
    {
      id: 'obj-global-2',
      nodeId: 'node-2',
      nombre: 'Escalas mayores',
      descripcion: null,
      indicadores: [{ id: 'ind-global-3', descripcion: 'Escala de Do mayor' }],
    },
  ]

  it('produces a copy with NEW ids, independent from the global catalog', () => {
    const copia = clonarPlantillaAClase({
      claseId: 'clase-1',
      levelId: 'level-1',
      objetivosGlobales,
    })

    expect(copia).toHaveLength(2)
    copia.forEach((objetivoClonado, idx) => {
      expect(objetivoClonado.id).not.toBe(objetivosGlobales[idx].id)
      objetivoClonado.indicadores.forEach((indClonado, j) => {
        expect(indClonado.id).not.toBe(objetivosGlobales[idx].indicadores[j].id)
      })
    })
  })

  it('populates origen_node_id / origen_objetivo_id / origen_indicator_id pointing back to the global catalog', () => {
    const [objetivoClonado] = clonarPlantillaAClase({
      claseId: 'clase-1',
      levelId: 'level-1',
      objetivosGlobales: [objetivosGlobales[0]],
    })

    expect(objetivoClonado.origen_node_id).toBe('node-1')
    expect(objetivoClonado.origen_objetivo_id).toBe('obj-global-1')
    expect(objetivoClonado.clase_id).toBe('clase-1')
    expect(objetivoClonado.level_id).toBe('level-1')
    expect(objetivoClonado.indicadores[0].origen_indicator_id).toBe('ind-global-1')
    expect(objetivoClonado.indicadores[0].objetivo_id).toBe(objetivoClonado.id)
  })

  it('copies nombre/descripcion verbatim from the global objetivo', () => {
    const [objetivoClonado] = clonarPlantillaAClase({
      claseId: 'clase-1',
      levelId: 'level-1',
      objetivosGlobales: [objetivosGlobales[0]],
    })
    expect(objetivoClonado.nombre).toBe('La 3ª posición')
    expect(objetivoClonado.descripcion).toBe('Dominio de la tercera posición')
  })

  it('mutating the clone does not affect the original global catalog (independent copy, not a shared reference)', () => {
    const [objetivoClonado] = clonarPlantillaAClase({
      claseId: 'clase-1',
      levelId: 'level-1',
      objetivosGlobales: [objetivosGlobales[0]],
    })

    objetivoClonado.nombre = 'Nombre editado por el maestro'
    objetivoClonado.indicadores[0].descripcion = 'Editado'

    expect(objetivosGlobales[0].nombre).toBe('La 3ª posición')
    expect(objetivosGlobales[0].indicadores[0].descripcion).toBe('Afinación en 3ra posición')
  })

  it('respects p_node_ids filter — only clones objetivos whose node is in the list', () => {
    const copia = clonarPlantillaAClase({
      claseId: 'clase-1',
      levelId: 'level-1',
      objetivosGlobales,
      nodeIdsFiltro: ['node-1'],
    })

    expect(copia).toHaveLength(1)
    expect(copia[0].origen_node_id).toBe('node-1')
  })

  it('clones ALL objetivos of the level when nodeIdsFiltro is null (default)', () => {
    const copia = clonarPlantillaAClase({
      claseId: 'clase-1',
      levelId: 'level-1',
      objetivosGlobales,
      nodeIdsFiltro: null,
    })
    expect(copia).toHaveLength(2)
  })
})

describe('Integración (mock Supabase): RPC clonar_plantilla_a_clase', () => {
  beforeEach(() => {
    _resetContadorParaTests()
    vi.resetModules()
  })

  it('rpc("clonar_plantilla_a_clase", {...}) returns an independent copy with origen_* populated', async () => {
    const objetivosGlobales = [
      {
        id: 'obj-global-1',
        nodeId: 'node-1',
        nombre: 'La 3ª posición',
        descripcion: 'Dominio de la tercera posición',
        indicadores: [{ id: 'ind-global-1', descripcion: 'Afinación en 3ra posición' }],
      },
    ]

    const rpcMock = vi.fn(async (fnName, params) => {
      expect(fnName).toBe('clonar_plantilla_a_clase')
      expect(params).toEqual({
        p_clase_id: 'clase-1',
        p_plantilla_id: 'plantilla-1',
        p_node_ids: null,
      })

      const copia = clonarPlantillaAClase({
        claseId: params.p_clase_id,
        levelId: 'level-1',
        objetivosGlobales,
        nodeIdsFiltro: params.p_node_ids,
      })

      // Espejo del RETURNS TABLE(objetivo_id, origen_objetivo_id, indicador_id, origen_indicator_id)
      const rows = copia.flatMap((obj) =>
        obj.indicadores.map((ind) => ({
          objetivo_id: obj.id,
          origen_objetivo_id: obj.origen_objetivo_id,
          indicador_id: ind.id,
          origen_indicator_id: ind.origen_indicator_id,
        }))
      )
      return { data: rows, error: null }
    })

    vi.doMock('../../../lib/supabaseClient.js', () => ({
      supabase: { rpc: rpcMock },
    }))

    const { supabase } = await import('../../../lib/supabaseClient.js')
    const { data, error } = await supabase.rpc('clonar_plantilla_a_clase', {
      p_clase_id: 'clase-1',
      p_plantilla_id: 'plantilla-1',
      p_node_ids: null,
    })

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data[0].objetivo_id).not.toBe('obj-global-1')
    expect(data[0].origen_objetivo_id).toBe('obj-global-1')
    expect(data[0].indicador_id).not.toBe('ind-global-1')
    expect(data[0].origen_indicator_id).toBe('ind-global-1')

    vi.doUnmock('../../../lib/supabaseClient.js')
  })
})

// ── Migration guard (Tarea 1.5) ───────────────────────────────────────────

const MIGRATION_PATH = resolve(process.cwd(), 'supabase/migrations/20260731000005_mapa_plantillas.sql')

let sql

beforeAll(() => {
  try {
    sql = readFileSync(MIGRATION_PATH, 'utf-8')
  } catch {
    sql = null
  }
})

describe('Migration: 20260731000005_mapa_plantillas.sql', () => {
  it('should exist at the expected path', () => {
    expect(sql).not.toBeNull()
  })

  it('should have a commented DOWN block', () => {
    expect(sql).toMatch(/--\s*={5,}\s*\n--\s*DOWN\s*\n--\s*={5,}/i)
    expect(sql).toMatch(/--\s*DROP\s+FUNCTION\s+IF\s+EXISTS\s+public\.clonar_plantilla_a_clase/i)
    expect(sql).toMatch(/--\s*DROP\s+TABLE\s+IF\s+EXISTS\s+public\.mapa_plantillas/i)
  })

  describe('Tabla mapa_plantillas (design.md Decisión 6, DDL exacto)', () => {
    it('should CREATE TABLE mapa_plantillas with the exact columns from design.md', () => {
      expect(sql).toMatch(/CREATE\s+TABLE\s+public\.mapa_plantillas/i)
      expect(sql).toMatch(/nombre\s+text\s+NOT\s+NULL/i)
      expect(sql).toMatch(/instrumento\s+text\s+NOT\s+NULL/i)
      expect(sql).toMatch(/route_version_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.route_versions\(id\)\s+ON\s+DELETE\s+RESTRICT/i)
      expect(sql).toMatch(/level_id\s+uuid\s+NOT\s+NULL\s+REFERENCES\s+public\.levels\(id\)\s+ON\s+DELETE\s+CASCADE/i)
      expect(sql).toMatch(/activo\s+boolean\s+NOT\s+NULL\s+DEFAULT\s+true/i)
      expect(sql).toMatch(/publicada_por\s+uuid\s+REFERENCES\s+public\.maestros\(id\)/i)
    })

    it('should UNIQUE (route_version_id, level_id)', () => {
      expect(sql).toMatch(/UNIQUE\s*\(\s*route_version_id\s*,\s*level_id\s*\)/i)
    })
  })

  describe('RLS mapa_plantillas', () => {
    it('plantillas_read: FOR SELECT USING (true) — visible a cualquier autenticado', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"?plantillas_read"?[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/FOR\s+SELECT/i)
      expect(policyMatch[0]).toMatch(/USING\s*\(\s*true\s*\)/i)
    })

    it('plantillas_admin: FOR ALL USING/WITH CHECK es_admin()', () => {
      const policyMatch = sql.match(/CREATE\s+POLICY\s+"?plantillas_admin"?[\s\S]*?;/i)
      expect(policyMatch).not.toBeNull()
      expect(policyMatch[0]).toMatch(/FOR\s+ALL/i)
      expect(policyMatch[0]).toMatch(/USING\s*\(\s*public\.es_admin\(\)\s*\)/i)
      expect(policyMatch[0]).toMatch(/WITH\s+CHECK\s*\(\s*public\.es_admin\(\)\s*\)/i)
    })
  })

  describe('RPC clonar_plantilla_a_clase (SECURITY DEFINER)', () => {
    it('should define the function with the exact signature', () => {
      expect(sql).toMatch(
        /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.clonar_plantilla_a_clase\s*\(\s*p_clase_id\s+uuid\s*,\s*p_plantilla_id\s+uuid\s*,\s*p_node_ids\s+uuid\[\]\s+DEFAULT\s+NULL\s*\)/i
      )
    })

    it('should be SECURITY DEFINER with SET search_path = public, pg_temp (same pattern as es_maestro_de_clase)', () => {
      expect(sql).toMatch(/SECURITY\s+DEFINER/i)
      expect(sql).toMatch(/SET\s+search_path\s*=\s*public\s*,\s*pg_temp/i)
    })

    it('should validate es_maestro_de_clase(p_clase_id) and RAISE EXCEPTION if not authorized', () => {
      expect(sql).toMatch(/es_maestro_de_clase\s*\(\s*p_clase_id\s*\)/i)
      expect(sql).toMatch(/RAISE\s+EXCEPTION/i)
    })

    it('should validate the plantilla level_id is assigned to the clase via acm_active_routes', () => {
      expect(sql).toMatch(/acm_active_routes/i)
      expect(sql).toMatch(/SOI-MAPA-02/i)
    })

    it('should populate origen_node_id / origen_objetivo_id / origen_indicator_id when inserting the copy', () => {
      expect(sql).toMatch(/origen_node_id/i)
      expect(sql).toMatch(/origen_objetivo_id/i)
      expect(sql).toMatch(/origen_indicator_id/i)
    })

    it('should GRANT EXECUTE to authenticated', () => {
      expect(sql).toMatch(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.clonar_plantilla_a_clase/i)
    })
  })

  describe('Deprecación de plantillas_planificacion (design.md Decisión 6 — NO se borra)', () => {
    it('should COMMENT ON TABLE plantillas_planificacion marking it DEPRECATED', () => {
      expect(sql).toMatch(/COMMENT\s+ON\s+TABLE\s+public\.plantillas_planificacion\s+IS\s+'DEPRECATED/i)
    })

    it('should NOT drop or truncate plantillas_planificacion', () => {
      expect(sql).not.toMatch(/DROP\s+TABLE\s+(IF\s+EXISTS\s+)?public\.plantillas_planificacion/i)
      expect(sql).not.toMatch(/TRUNCATE\s+(TABLE\s+)?public\.plantillas_planificacion/i)
    })
  })
})
