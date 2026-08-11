-- ============================================================================
-- Migration: Create maestro_routes schema for personal lesson-plan routes
-- Date: 2026-08-12
-- Purpose: Foundation tables for teacher-defined hierarchical routes
--          (UNIDADES > OBJETIVOS > INDICADORES) with prerequisite chains
-- ============================================================================

-- 1. maestro_routes: Base route container (one per teacher+class combo)
CREATE TABLE IF NOT EXISTS maestro_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  clase_id UUID NOT NULL REFERENCES clases(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(maestro_id, clase_id)
);

CREATE INDEX idx_maestro_routes_maestro ON maestro_routes(maestro_id);
CREATE INDEX idx_maestro_routes_clase ON maestro_routes(clase_id);
CREATE INDEX idx_maestro_routes_maestro_clase ON maestro_routes(maestro_id, clase_id);

-- 2. maestro_unidades: Level 1 - Teaching units (Unidades)
CREATE TABLE IF NOT EXISTS maestro_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID NOT NULL REFERENCES maestro_routes(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_orden CHECK (orden >= 0)
);

CREATE INDEX idx_maestro_unidades_ruta ON maestro_unidades(ruta_id, orden);

-- 3. maestro_objetivos: Level 2 - Learning objectives (Objetivos)
CREATE TABLE IF NOT EXISTS maestro_objetivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidad_id UUID NOT NULL REFERENCES maestro_unidades(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_orden CHECK (orden >= 0)
);

CREATE INDEX idx_maestro_objetivos_unidad ON maestro_objetivos(unidad_id, orden);

-- 4. maestro_indicadores: Level 3 - Performance indicators (Indicadores)
CREATE TABLE IF NOT EXISTS maestro_indicadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objetivo_id UUID NOT NULL REFERENCES maestro_objetivos(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  nombre TEXT NOT NULL,
  criterios_json JSONB, -- { "escala": "1-5", "competencias": [...] }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_orden CHECK (orden >= 0)
);

CREATE INDEX idx_maestro_indicadores_objetivo ON maestro_indicadores(objetivo_id, orden);

-- 5. indicador_prerequisito: Prerequisite relationships (linear chains in Phase 1)
-- Prevents self-reference and circular dependencies via CHECK + trigger
CREATE TABLE IF NOT EXISTS indicador_prerequisito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id UUID NOT NULL REFERENCES maestro_indicadores(id) ON DELETE CASCADE,
  prerequisito_indicador_id UUID NOT NULL REFERENCES maestro_indicadores(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(indicador_id, prerequisito_indicador_id),
  CONSTRAINT no_self_reference CHECK (indicador_id != prerequisito_indicador_id)
);

CREATE INDEX idx_indicador_prerequisito_indicador ON indicador_prerequisito(indicador_id);
CREATE INDEX idx_indicador_prerequisito_prerequisito ON indicador_prerequisito(prerequisito_indicador_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- maestro_routes: Teachers see/manage only their own routes
ALTER TABLE maestro_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maestro_routes_select" ON maestro_routes;
CREATE POLICY "maestro_routes_select" ON maestro_routes
  FOR SELECT TO authenticated
  USING (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM maestros WHERE user_id = auth.uid() AND es_admin())
  );

DROP POLICY IF EXISTS "maestro_routes_insert" ON maestro_routes;
CREATE POLICY "maestro_routes_insert" ON maestro_routes
  FOR INSERT TO authenticated
  WITH CHECK (
    maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "maestro_routes_update" ON maestro_routes;
CREATE POLICY "maestro_routes_update" ON maestro_routes
  FOR UPDATE TO authenticated
  USING (maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid()))
  WITH CHECK (maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "maestro_routes_delete" ON maestro_routes;
CREATE POLICY "maestro_routes_delete" ON maestro_routes
  FOR DELETE TO authenticated
  USING (maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid()));

-- maestro_unidades: Inherited permissions from maestro_routes
ALTER TABLE maestro_unidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maestro_unidades_select" ON maestro_unidades;
CREATE POLICY "maestro_unidades_select" ON maestro_unidades
  FOR SELECT TO authenticated
  USING (
    ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "maestro_unidades_write" ON maestro_unidades;
CREATE POLICY "maestro_unidades_write" ON maestro_unidades
  FOR INSERT TO authenticated
  WITH CHECK (
    ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  );

-- maestro_objetivos: Inherited permissions from maestro_unidades
ALTER TABLE maestro_objetivos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maestro_objetivos_select" ON maestro_objetivos;
CREATE POLICY "maestro_objetivos_select" ON maestro_objetivos
  FOR SELECT TO authenticated
  USING (
    unidad_id IN (
      SELECT id FROM maestro_unidades
      WHERE ruta_id IN (
        SELECT id FROM maestro_routes
        WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "maestro_objetivos_write" ON maestro_objetivos;
CREATE POLICY "maestro_objetivos_write" ON maestro_objetivos
  FOR INSERT TO authenticated
  WITH CHECK (
    unidad_id IN (
      SELECT id FROM maestro_unidades
      WHERE ruta_id IN (
        SELECT id FROM maestro_routes
        WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
      )
    )
  );

-- maestro_indicadores: Inherited permissions
ALTER TABLE maestro_indicadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maestro_indicadores_select" ON maestro_indicadores;
CREATE POLICY "maestro_indicadores_select" ON maestro_indicadores
  FOR SELECT TO authenticated
  USING (
    objetivo_id IN (
      SELECT id FROM maestro_objetivos
      WHERE unidad_id IN (
        SELECT id FROM maestro_unidades
        WHERE ruta_id IN (
          SELECT id FROM maestro_routes
          WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
        )
      )
    )
  );

DROP POLICY IF EXISTS "maestro_indicadores_write" ON maestro_indicadores;
CREATE POLICY "maestro_indicadores_write" ON maestro_indicadores
  FOR INSERT TO authenticated
  WITH CHECK (
    objetivo_id IN (
      SELECT id FROM maestro_objetivos
      WHERE unidad_id IN (
        SELECT id FROM maestro_unidades
        WHERE ruta_id IN (
          SELECT id FROM maestro_routes
          WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
        )
      )
    )
  );

-- indicador_prerequisito: Inherited permissions
ALTER TABLE indicador_prerequisito ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "indicador_prerequisito_select" ON indicador_prerequisito;
CREATE POLICY "indicador_prerequisito_select" ON indicador_prerequisito
  FOR SELECT TO authenticated
  USING (
    indicador_id IN (
      SELECT id FROM maestro_indicadores
      WHERE objetivo_id IN (
        SELECT id FROM maestro_objetivos
        WHERE unidad_id IN (
          SELECT id FROM maestro_unidades
          WHERE ruta_id IN (
            SELECT id FROM maestro_routes
            WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "indicador_prerequisito_write" ON indicador_prerequisito;
CREATE POLICY "indicador_prerequisito_write" ON indicador_prerequisito
  FOR INSERT TO authenticated
  WITH CHECK (
    indicador_id IN (
      SELECT id FROM maestro_indicadores
      WHERE objetivo_id IN (
        SELECT id FROM maestro_objetivos
        WHERE unidad_id IN (
          SELECT id FROM maestro_unidades
          WHERE ruta_id IN (
            SELECT id FROM maestro_routes
            WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
          )
        )
      )
    )
  );
