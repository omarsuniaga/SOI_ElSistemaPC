import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Migration validation tests for:
 * - 20260722_planificacion_rediseño_modificaciones.sql (Task 1.2)
 * - 20260722_planificacion_rediseño_limpieza.sql (Task 1.3)
 * - 20260722_planificacion_rediseño_rpcs.sql (Task 1.4)
 */

const P = (name) => `(public\\.)?${name}`

function readMigration(filename) {
  const path = resolve(process.cwd(), `supabase/migrations/${filename}`)
  try {
    return readFileSync(path, 'utf-8')
  } catch {
    return null
  }
}

let modificaciones
let limpieza
let rpcs

beforeAll(() => {
  modificaciones = readMigration('20260722_planificacion_rediseño_modificaciones.sql')
  limpieza = readMigration('20260722_planificacion_rediseño_limpieza.sql')
  rpcs = readMigration('20260722_planificacion_rediseño_rpcs.sql')
})

// ============================================================================
// Task 1.2: Modifications migration
// ============================================================================
describe('Migration: planificacion_rediseño_modificaciones.sql', () => {
  describe('File existence', () => {
    it('should exist at the expected path', () => {
      expect(modificaciones).not.toBeNull()
    })
  })

  describe('ALTER planificaciones — add route_version_id', () => {
    it('should ADD COLUMN route_version_id UUID to planificaciones', () => {
      expect(modificaciones).toMatch(/ALTER\s+TABLE\s+(public\.)?planificaciones\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+route_version_id\s+UUID/i)
    })

    it('should have FK reference to route_versions ON DELETE SET NULL', () => {
      expect(modificaciones).toMatch(/REFERENCES\s+public\.route_versions\(id\)\s+ON\s+DELETE\s+SET\s+NULL/i)
    })
  })

  describe('ALTER planificaciones — add class_curriculum_plan_id', () => {
    it('should ADD COLUMN class_curriculum_plan_id UUID to planificaciones', () => {
      expect(modificaciones).toMatch(/ALTER\s+TABLE\s+(public\.)?planificaciones\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+class_curriculum_plan_id\s+UUID/i)
    })

    it('should have FK reference to class_curriculum_plan ON DELETE SET NULL', () => {
      expect(modificaciones).toMatch(/REFERENCES\s+public\.class_curriculum_plan\(id\)\s+ON\s+DELETE\s+SET\s+NULL/i)
    })
  })

  describe('Data migration', () => {
    it('should INSERT INTO class_curriculum_plan to backfill existing data', () => {
      expect(modificaciones).toMatch(/INSERT\s+INTO\s+(public\.)?class_curriculum_plan/i)
    })

    it('should use ON CONFLICT DO NOTHING for idempotency', () => {
      expect(modificaciones).toMatch(/ON\s+CONFLICT\s+DO\s+NOTHING/i)
    })

    it('should UPDATE planificaciones to set class_curriculum_plan_id from backfill', () => {
      expect(modificaciones).toMatch(/UPDATE\s+(public\.)?planificaciones\s+p\s+SET\s+class_curriculum_plan_id/i)
    })
  })

  describe('Index additions', () => {
    it('should add index on route_version_id in planificaciones', () => {
      expect(modificaciones).toMatch(/CREATE\s+INDEX\s+(IF\s+NOT\s+EXISTS\s+)?idx_planificaciones_route/i)
    })

    it('should add index on class_curriculum_plan_id in planificaciones', () => {
      expect(modificaciones).toMatch(/CREATE\s+INDEX\s+(IF\s+NOT\s+EXISTS\s+)?idx_planificaciones_ccp/i)
    })
  })
})

// ============================================================================
// Task 1.3: Cleanup migration (drop deprecated tables)
// ============================================================================
describe('Migration: planificacion_rediseño_limpieza.sql', () => {
  describe('File existence', () => {
    it('should exist at the expected path', () => {
      expect(limpieza).not.toBeNull()
    })
  })

  describe('DROP deprecated plan_* tables', () => {
    it('should DROP TABLE IF EXISTS plan_indicator_links CASCADE', () => {
      expect(limpieza).toMatch(/DROP\s+TABLE\s+IF\s+EXISTS\s+(public\.)?plan_indicator_links\s+CASCADE/i)
    })

    it('should DROP TABLE IF EXISTS plan_indicadores CASCADE', () => {
      expect(limpieza).toMatch(/DROP\s+TABLE\s+IF\s+EXISTS\s+(public\.)?plan_indicadores\s+CASCADE/i)
    })

    it('should DROP TABLE IF EXISTS plan_objetivos CASCADE', () => {
      expect(limpieza).toMatch(/DROP\s+TABLE\s+IF\s+EXISTS\s+(public\.)?plan_objetivos\s+CASCADE/i)
    })

    it('should DROP TABLE IF EXISTS plan_temas CASCADE', () => {
      expect(limpieza).toMatch(/DROP\s+TABLE\s+IF\s+EXISTS\s+(public\.)?plan_temas\s+CASCADE/i)
    })

    it('should DROP TABLE IF EXISTS plan_niveles CASCADE', () => {
      expect(limpieza).toMatch(/DROP\s+TABLE\s+IF\s+EXISTS\s+(public\.)?plan_niveles\s+CASCADE/i)
    })

    it('should DROP TABLE IF EXISTS plan_clases CASCADE', () => {
      expect(limpieza).toMatch(/DROP\s+TABLE\s+IF\s+EXISTS\s+(public\.)?plan_clases\s+CASCADE/i)
    })

    it('should DROP TABLE IF EXISTS planificacion_nodos CASCADE', () => {
      expect(limpieza).toMatch(/DROP\s+TABLE\s+IF\s+EXISTS\s+(public\.)?planificacion_nodos\s+CASCADE/i)
    })
  })

  describe('Safety measures', () => {
    it('should have a comment or guard about running after verification', () => {
      // The cleanup should include a comment warning about production safety
      expect(limpieza).toMatch(/--.*(?:verify|verificar|caution|precaución|safety|seguro|production|producción|backup)/i)
    })

    it('should use IF EXISTS for safety', () => {
      const dropCount = (limpieza.match(/DROP\s+TABLE\s+IF\s+EXISTS/gi) || []).length
      expect(dropCount).toBeGreaterThanOrEqual(7)
    })
  })
})

// ============================================================================
// Task 1.4: RPCs
// ============================================================================
describe('Migration: planificacion_rediseño_rpcs.sql', () => {
  describe('File existence', () => {
    it('should exist at the expected path', () => {
      expect(rpcs).not.toBeNull()
    })
  })

  describe('fn_obtener_ruta_por_clase', () => {
    it('should CREATE OR REPLACE FUNCTION fn_obtener_ruta_por_clase', () => {
      expect(rpcs).toMatch(new RegExp(`CREATE\\s+(OR\\s+REPLACE\\s+)?FUNCTION\\s+${P('fn_obtener_ruta_por_clase')}\\s*\\(`, 'i'))
    })

    it('should accept p_clase_id UUID parameter', () => {
      expect(rpcs).toMatch(/fn_obtener_ruta_por_clase\s*\(\s*p_clase_id\s+UUID/i)
    })

    it('should RETURN TABLE with route_version_id and estado', () => {
      expect(rpcs).toMatch(/RETURNS\s+TABLE\s*\([^)]*route_version_id[^)]*estado/i)
    })

    it('should query class_curriculum_plan WHERE estado = activo', () => {
      expect(rpcs).toMatch(/class_curriculum_plan[\s\S]*WHERE[\s\S]*estado\s*=\s*'activo'/i)
    })
  })

  describe('fn_evaluacion_indicadores_por_clase', () => {
    it('should CREATE OR REPLACE FUNCTION fn_evaluacion_indicadores_por_clase', () => {
      expect(rpcs).toMatch(new RegExp(`CREATE\\s+(OR\\s+REPLACE\\s+)?FUNCTION\\s+${P('fn_evaluacion_indicadores_por_clase')}\\s*\\(`, 'i'))
    })

    it('should accept p_clase_id UUID parameter', () => {
      expect(rpcs).toMatch(/fn_evaluacion_indicadores_por_clase\s*\(\s*p_clase_id\s+UUID/i)
    })

    it('should return per-alumno aggregation with indicator counts', () => {
      expect(rpcs).toMatch(/fn_evaluacion_indicadores_por_clase[\s\S]*alumno_id/i)
    })
  })

  describe('fn_registrar_evaluacion_indicador', () => {
    it('should CREATE OR REPLACE FUNCTION fn_registrar_evaluacion_indicador', () => {
      expect(rpcs).toMatch(new RegExp(`CREATE\\s+(OR\\s+REPLACE\\s+)?FUNCTION\\s+${P('fn_registrar_evaluacion_indicador')}\\s*\\(`, 'i'))
    })

    it('should accept alumno_id, indicator_id, clase_id parameters', () => {
      expect(rpcs).toMatch(/fn_registrar_evaluacion_indicador\s*\([^)]*p_alumno_id\s+UUID/i)
      expect(rpcs).toMatch(/fn_registrar_evaluacion_indicador\s*\([^)]*p_indicator_id\s+UUID/i)
      expect(rpcs).toMatch(/fn_registrar_evaluacion_indicador\s*\([^)]*p_clase_id\s+UUID/i)
    })

    it('should perform UPSERT on evaluacion_indicador', () => {
      expect(rpcs).toMatch(/INSERT\s+INTO\s+(public\.)?evaluacion_indicador[\s\S]*ON\s+CONFLICT/i)
    })
  })

  describe('RPC safety', () => {
    it('should use SECURITY DEFINER for RPCs', () => {
      const definers = (rpcs.match(/SECURITY\s+DEFINER/gi) || []).length
      expect(definers).toBeGreaterThanOrEqual(1)
    })

    it('should use LANGUAGE plpgsql', () => {
      expect(rpcs).toMatch(/LANGUAGE\s+plpgsql/gi)
    })
  })
})
