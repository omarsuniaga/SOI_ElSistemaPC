-- ============================================================================
-- Migration: Add missing UPDATE/DELETE RLS policies for maestro_routes hierarchy
-- Date: 2026-08-14
-- Motivo:
--   20260812000001_maestro_routes_schema.sql solo definió políticas SELECT e
--   INSERT ("_write") para maestro_unidades, maestro_objetivos,
--   maestro_indicadores e indicador_prerequisito. Con RLS habilitado y sin
--   política para UPDATE/DELETE, Postgres no da error — el comando afecta
--   0 filas en silencio. TeacherRouteBuilder.updateRoute() (que hace UPDATE
--   sobre las 3 primeras tablas y DELETE sobre indicador_prerequisito para
--   recalcular prerrequisitos) reportaba éxito sin haber persistido nada.
-- ============================================================================

-- maestro_unidades: UPDATE/DELETE si la ruta le pertenece al maestro
DROP POLICY IF EXISTS "maestro_unidades_update" ON maestro_unidades;
CREATE POLICY "maestro_unidades_update" ON maestro_unidades
  FOR UPDATE TO authenticated
  USING (
    ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "maestro_unidades_delete" ON maestro_unidades;
CREATE POLICY "maestro_unidades_delete" ON maestro_unidades
  FOR DELETE TO authenticated
  USING (
    ruta_id IN (
      SELECT id FROM maestro_routes
      WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
    )
  );

-- maestro_objetivos: UPDATE/DELETE si la unidad (y por tanto la ruta) le pertenece
DROP POLICY IF EXISTS "maestro_objetivos_update" ON maestro_objetivos;
CREATE POLICY "maestro_objetivos_update" ON maestro_objetivos
  FOR UPDATE TO authenticated
  USING (
    unidad_id IN (
      SELECT id FROM maestro_unidades
      WHERE ruta_id IN (
        SELECT id FROM maestro_routes
        WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    unidad_id IN (
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
    unidad_id IN (
      SELECT id FROM maestro_unidades
      WHERE ruta_id IN (
        SELECT id FROM maestro_routes
        WHERE maestro_id IN (SELECT id FROM maestros WHERE user_id = auth.uid())
      )
    )
  );

-- maestro_indicadores: UPDATE/DELETE si el objetivo (y por tanto la ruta) le pertenece
DROP POLICY IF EXISTS "maestro_indicadores_update" ON maestro_indicadores;
CREATE POLICY "maestro_indicadores_update" ON maestro_indicadores
  FOR UPDATE TO authenticated
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
  )
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

DROP POLICY IF EXISTS "maestro_indicadores_delete" ON maestro_indicadores;
CREATE POLICY "maestro_indicadores_delete" ON maestro_indicadores
  FOR DELETE TO authenticated
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

-- indicador_prerequisito: UPDATE/DELETE si el indicador le pertenece.
-- Crítico: sin esta política, updateRoute() no puede borrar el vínculo viejo
-- al cambiar el prerrequisito de un indicador, lo que deja filas duplicadas
-- (violando la asunción de "un solo prerrequisito por indicador" que usa
-- getDirectPrerequisite() con .maybeSingle()).
DROP POLICY IF EXISTS "indicador_prerequisito_delete" ON indicador_prerequisito;
CREATE POLICY "indicador_prerequisito_delete" ON indicador_prerequisito
  FOR DELETE TO authenticated
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
