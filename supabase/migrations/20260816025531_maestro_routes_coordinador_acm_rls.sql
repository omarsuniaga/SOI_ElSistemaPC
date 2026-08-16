-- ============================================================================
-- Migration: Coordinador académico (y admin) puede leer/escribir el árbol
--            personal de rutas del maestro (maestro_routes y sus hijas)
-- Date: 2026-08-16
--
-- Contexto (openspec/changes/juego-gamificado-planificacion/spec.md, A-03):
--   Auditoría de las políticas reales (pg_policy) confirmó que hoy SOLO el
--   maestro dueño (maestro_id -> maestros.user_id = auth.uid()) tiene
--   cualquier acceso a maestro_routes/maestro_unidades/maestro_objetivos/
--   maestro_indicadores/indicador_prerequisito. es_admin() solo aparecía en
--   UNA política (maestro_routes_select) — ni siquiera admin podía
--   leer/escribir el resto del árbol, y coordinador académico no tenía
--   acceso a NADA.
--
--   Se agrega `OR es_admin() OR es_coordinador_acm()` a las 19 políticas de
--   las 5 tablas, preservando exactamente la condición de "dueño" existente
--   — el maestro titular no pierde ningún permiso.
-- ============================================================================

-- ── maestro_routes ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "maestro_routes_select" ON maestro_routes;
CREATE POLICY "maestro_routes_select" ON maestro_routes
  FOR SELECT TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "maestro_routes_insert" ON maestro_routes;
CREATE POLICY "maestro_routes_insert" ON maestro_routes
  FOR INSERT TO authenticated
  WITH CHECK (
    es_admin() OR es_coordinador_acm()
    OR maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "maestro_routes_update" ON maestro_routes;
CREATE POLICY "maestro_routes_update" ON maestro_routes
  FOR UPDATE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  )
  WITH CHECK (
    es_admin() OR es_coordinador_acm()
    OR maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "maestro_routes_delete" ON maestro_routes;
CREATE POLICY "maestro_routes_delete" ON maestro_routes
  FOR DELETE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
  );

-- ── maestro_unidades ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "maestro_unidades_select" ON maestro_unidades;
CREATE POLICY "maestro_unidades_select" ON maestro_unidades
  FOR SELECT TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "maestro_unidades_write" ON maestro_unidades;
CREATE POLICY "maestro_unidades_write" ON maestro_unidades
  FOR INSERT TO authenticated
  WITH CHECK (
    es_admin() OR es_coordinador_acm()
    OR ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "maestro_unidades_update" ON maestro_unidades;
CREATE POLICY "maestro_unidades_update" ON maestro_unidades
  FOR UPDATE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    es_admin() OR es_coordinador_acm()
    OR ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "maestro_unidades_delete" ON maestro_unidades;
CREATE POLICY "maestro_unidades_delete" ON maestro_unidades
  FOR DELETE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  );

-- ── maestro_objetivos ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "maestro_objetivos_select" ON maestro_objetivos;
CREATE POLICY "maestro_objetivos_select" ON maestro_objetivos
  FOR SELECT TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR unidad_id IN (
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
    es_admin() OR es_coordinador_acm()
    OR unidad_id IN (
      SELECT id FROM maestro_unidades
      WHERE ruta_id IN (
        SELECT id FROM maestro_routes
        WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "maestro_objetivos_update" ON maestro_objetivos;
CREATE POLICY "maestro_objetivos_update" ON maestro_objetivos
  FOR UPDATE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR unidad_id IN (
      SELECT id FROM maestro_unidades
      WHERE ruta_id IN (
        SELECT id FROM maestro_routes
        WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    es_admin() OR es_coordinador_acm()
    OR unidad_id IN (
      SELECT id FROM maestro_unidades
      WHERE ruta_id IN (
        SELECT id FROM maestro_routes
        WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "maestro_objetivos_delete" ON maestro_objetivos;
CREATE POLICY "maestro_objetivos_delete" ON maestro_objetivos
  FOR DELETE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR unidad_id IN (
      SELECT id FROM maestro_unidades
      WHERE ruta_id IN (
        SELECT id FROM maestro_routes
        WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
      )
    )
  );

-- ── maestro_indicadores ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "maestro_indicadores_select" ON maestro_indicadores;
CREATE POLICY "maestro_indicadores_select" ON maestro_indicadores
  FOR SELECT TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR objetivo_id IN (
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
    es_admin() OR es_coordinador_acm()
    OR objetivo_id IN (
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

DROP POLICY IF EXISTS "maestro_indicadores_update" ON maestro_indicadores;
CREATE POLICY "maestro_indicadores_update" ON maestro_indicadores
  FOR UPDATE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR objetivo_id IN (
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
  WITH CHECK (
    es_admin() OR es_coordinador_acm()
    OR objetivo_id IN (
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

DROP POLICY IF EXISTS "maestro_indicadores_delete" ON maestro_indicadores;
CREATE POLICY "maestro_indicadores_delete" ON maestro_indicadores
  FOR DELETE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR objetivo_id IN (
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

-- ── indicador_prerequisito ───────────────────────────────────────────────

DROP POLICY IF EXISTS "indicador_prerequisito_select" ON indicador_prerequisito;
CREATE POLICY "indicador_prerequisito_select" ON indicador_prerequisito
  FOR SELECT TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR indicador_id IN (
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
    es_admin() OR es_coordinador_acm()
    OR indicador_id IN (
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

DROP POLICY IF EXISTS "indicador_prerequisito_delete" ON indicador_prerequisito;
CREATE POLICY "indicador_prerequisito_delete" ON indicador_prerequisito
  FOR DELETE TO authenticated
  USING (
    es_admin() OR es_coordinador_acm()
    OR indicador_id IN (
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

-- ============================================================================
-- DOWN
-- ============================================================================
-- Revertir a las políticas sin es_admin()/es_coordinador_acm() requiere
-- recrear cada política con la condición original (ver
-- 20260812000001_maestro_routes_schema.sql y
-- 20260814000001_maestro_routes_rls_update_delete.sql para el texto exacto
-- de cada una). No se documenta un DOWN completo acá por el volumen — el
-- cambio es aditivo (OR, nunca AND), revertirlo solo le quita acceso a
-- admin/coordinador, no rompe nada para el maestro titular si no se revierte.
-- ============================================================================
