-- ============================================================================
-- MAPA GAMIFICADO DE PLANIFICACIÓN — Plantillas semilla clonables (Tarea 1.5)
-- Fecha: 2026-07-31
-- Contexto (openspec/changes/mapa-gamificado-planificacion/design.md,
--   Decisión 6, REQ-10):
--
--   El catálogo global (routes -> route_versions -> blocks -> levels ->
--   nodes -> objetivos -> indicators) ES la plantilla. `mapa_plantillas`
--   guarda únicamente CURACIÓN (qué route_version_id + level_id +
--   instrumento es una plantilla semilla oficial), no contenido. Clonar es
--   un RPC que copia objetivos/indicators de ese nivel hacia las tablas
--   class-owned (`clase_mapa_objetivos` / `clase_mapa_indicadores`),
--   produciendo una copia INDEPENDIENTE y editable — nunca una referencia
--   compartida (REQ-10).
--
--   Estado real de los DOS mecanismos que este cambio unifica (verificado,
--   difiere de lo que asumía la propuesta original — ver design.md tabla):
--     · `planificaciones.esPlantillaOficial`: NO existe como columna, es un
--       campo fantasma. Se elimina de los 3 archivos JS que lo escriben
--       (Fase 3, fuera de este archivo SQL).
--     · `plantillas_planificacion`: existe, 6 filas de texto plano. Sirve al
--       modal de planificación textual, NO al mapa. Se conserva de solo
--       lectura (NO se borra) — se marca DEPRECATED vía COMMENT.
--     · `mapa_plantillas`: mecanismo único nuevo, de acá en adelante.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA: mapa_plantillas — curación (no contenido)
-- ----------------------------------------------------------------------------

CREATE TABLE public.mapa_plantillas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  instrumento text NOT NULL,
  descripcion text,
  route_version_id uuid NOT NULL REFERENCES public.route_versions(id) ON DELETE RESTRICT,
  level_id         uuid NOT NULL REFERENCES public.levels(id)         ON DELETE CASCADE,
  activo boolean NOT NULL DEFAULT true,
  publicada_por uuid REFERENCES public.maestros(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (route_version_id, level_id)
);

CREATE INDEX idx_mp_route_version ON public.mapa_plantillas(route_version_id);
CREATE INDEX idx_mp_level ON public.mapa_plantillas(level_id);
CREATE INDEX idx_mp_activo ON public.mapa_plantillas(activo);

CREATE OR REPLACE FUNCTION public.update_mp_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mp_updated_at
  BEFORE UPDATE ON public.mapa_plantillas
  FOR EACH ROW EXECUTE FUNCTION public.update_mp_timestamp();

-- ----------------------------------------------------------------------------
-- 2. RLS mapa_plantillas — visible a cualquier autenticado, solo ACM/admin
--    puede curarlas (design.md tabla "RLS concreta")
-- ----------------------------------------------------------------------------

ALTER TABLE public.mapa_plantillas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plantillas_read" ON public.mapa_plantillas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "plantillas_admin" ON public.mapa_plantillas
  FOR ALL TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

-- ----------------------------------------------------------------------------
-- 3. RPC: clonar_plantilla_a_clase — copia objetivos/indicators del catálogo
--    global (filtrados por route_version_id + level_id de la plantilla,
--    opcionalmente por p_node_ids) hacia clase_mapa_objetivos /
--    clase_mapa_indicadores, poblando origen_node_id / origen_objetivo_id /
--    origen_indicator_id. Copia independiente y editable, no referencia
--    compartida.
--
--    SECURITY DEFINER + SET search_path = public, pg_temp: mismo patrón que
--    es_maestro_titular_de_clase() / es_maestro_de_clase() de la migración
--    20260731000001 (Tarea 1.1) — evita que un search_path manipulado por el
--    caller redirija las referencias sin esquema dentro de la función.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.clonar_plantilla_a_clase(
  p_clase_id uuid,
  p_plantilla_id uuid,
  p_node_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  objetivo_id uuid,
  origen_objetivo_id uuid,
  indicador_id uuid,
  origen_indicator_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plantilla record;
  v_maestro_id uuid;
  v_next_orden_objetivo integer;
  v_objetivo record;
  v_indicador record;
  v_nuevo_objetivo_id uuid;
  v_start_ts timestamptz := clock_timestamp();
BEGIN
  IF NOT public.es_maestro_de_clase(p_clase_id) THEN
    RAISE EXCEPTION 'SOI-MAPA-06: el maestro actual no tiene acceso a la clase %', p_clase_id;
  END IF;

  SELECT mp.id, mp.route_version_id, mp.level_id, mp.activo
    INTO v_plantilla
  FROM public.mapa_plantillas mp
  WHERE mp.id = p_plantilla_id;

  IF v_plantilla.id IS NULL OR v_plantilla.activo IS NOT TRUE THEN
    RAISE EXCEPTION 'SOI-MAPA-05: plantilla % no existe o está inactiva', p_plantilla_id;
  END IF;

  -- El nivel de la plantilla debe estar asignado a la clase (mismo guard de
  -- REQ-01/REQ-02 que el trigger de la migración 20260731000007).
  IF NOT EXISTS (
    SELECT 1 FROM public.acm_active_routes ar
    WHERE ar.group_id = p_clase_id
      AND ar.level_id = v_plantilla.level_id
      AND ar.status = 'active'
  ) THEN
    RAISE EXCEPTION 'SOI-MAPA-02: nivel no asignado a la clase';
  END IF;

  v_maestro_id := public.maestro_actual();

  SELECT COALESCE(MAX(cmo.orden_objetivo), 0)
    INTO v_next_orden_objetivo
  FROM public.clase_mapa_objetivos cmo
  WHERE cmo.clase_id = p_clase_id AND cmo.level_id = v_plantilla.level_id;

  FOR v_objetivo IN
    SELECT o.id, o.nombre, o.descripcion, n.id AS node_id
    FROM public.objetivos o
    JOIN public.nodes n ON n.id = o.node_id
    WHERE n.level_id = v_plantilla.level_id
      AND o.activo = true
      AND (p_node_ids IS NULL OR n.id = ANY (p_node_ids))
    ORDER BY n.order_index, o.order_index
  LOOP
    v_next_orden_objetivo := v_next_orden_objetivo + 1;

    INSERT INTO public.clase_mapa_objetivos (
      clase_id, level_id, origen_node_id, origen_objetivo_id,
      nombre, descripcion, orden_objetivo, created_by
    ) VALUES (
      p_clase_id, v_plantilla.level_id, v_objetivo.node_id, v_objetivo.id,
      v_objetivo.nombre, v_objetivo.descripcion, v_next_orden_objetivo, v_maestro_id
    )
    RETURNING id INTO v_nuevo_objetivo_id;

    FOR v_indicador IN
      SELECT i.id, i.description
      FROM public.indicators i
      WHERE i.objetivo_id = v_objetivo.id
      ORDER BY i.order_index
    LOOP
      -- orden_indicador se omite: fn_asignar_id_jerarquico() (migración
      -- 20260731000002, Tarea 1.2) lo autogenera BEFORE INSERT.
      INSERT INTO public.clase_mapa_indicadores (
        objetivo_id, origen_indicator_id, descripcion
      ) VALUES (
        v_nuevo_objetivo_id, v_indicador.id, v_indicador.description
      );
    END LOOP;
  END LOOP;

  RETURN QUERY
  SELECT cmo.id, cmo.origen_objetivo_id, cmi.id, cmi.origen_indicator_id
  FROM public.clase_mapa_objetivos cmo
  LEFT JOIN public.clase_mapa_indicadores cmi ON cmi.objetivo_id = cmo.id
  WHERE cmo.clase_id = p_clase_id
    AND cmo.created_at >= v_start_ts;
END;
$$;

GRANT EXECUTE ON FUNCTION public.clonar_plantilla_a_clase(uuid, uuid, uuid[]) TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. Deprecación de plantillas_planificacion — se conserva de solo lectura
--    (NO se borra, design.md Decisión 6) hasta que se retire el modal de
--    planificación textual que la consume (fuera de alcance de este cambio).
-- ----------------------------------------------------------------------------

COMMENT ON TABLE public.plantillas_planificacion IS
  'DEPRECATED: reemplazada por mapa_plantillas para el mapa gamificado';

-- ============================================================================
-- DOWN
-- ============================================================================
-- COMMENT ON TABLE public.plantillas_planificacion IS NULL;
-- DROP FUNCTION IF EXISTS public.clonar_plantilla_a_clase(uuid, uuid, uuid[]);
-- DROP POLICY IF EXISTS "plantillas_admin" ON public.mapa_plantillas;
-- DROP POLICY IF EXISTS "plantillas_read" ON public.mapa_plantillas;
-- DROP TRIGGER IF EXISTS trg_mp_updated_at ON public.mapa_plantillas;
-- DROP FUNCTION IF EXISTS public.update_mp_timestamp();
-- DROP TABLE IF EXISTS public.mapa_plantillas;
-- ============================================================================
