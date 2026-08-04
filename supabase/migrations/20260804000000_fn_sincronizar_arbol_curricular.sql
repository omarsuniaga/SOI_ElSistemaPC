-- ============================================================================
-- DEPLOY: fn_sincronizar_arbol_curricular — Persistencia del Diseñador Curricular
-- Fecha: 2026-08-04
-- Motivo:
--   El RLS de public.indicators (20260605000001_planning_draft_versions.sql)
--   sólo permite escribir a maestros sobre indicadores vinculados a
--   route_versions propias en estado 'draft'. El Diseñador Curricular genera
--   indicadores POR CLASE que no pertenecen a ninguna ruta institucional
--   (node_id NULL), por lo que un INSERT/upsert directo desde el cliente es
--   rechazado por RLS y el error se pierde (console.warn), dejando un flag
--   `persistido` mentiroso y una FK rota en evaluacion_indicador →
--   public.indicators(id).
--
--   Esta RPC SECURITY DEFINER valida la autorización real (admin o maestro
--   asignado a la clase vía maestro_en_clase) y persiste de forma atómica la
--   plantilla + los indicadores, sin deshabilitar RLS ni inventar tablas.
--   Patrón consistente con approve_maestro_profile() y
--   clone_route_version_as_draft().
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_sincronizar_arbol_curricular(
  p_clase_id uuid,
  p_nombre text,
  p_objetivos jsonb,
  p_plantilla_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plantilla_id uuid;
  v_unidad jsonb;
  v_objetivo jsonb;
  v_indicador jsonb;
  v_o_idx integer;
  v_i_idx integer;
BEGIN
  -- Autorización: admin o maestro principal/suplente de la clase
  IF NOT (public.es_admin() OR public.maestro_en_clase(p_clase_id)) THEN
    RAISE EXCEPTION 'No autorizado: solo un admin o el maestro de la clase puede sincronizar el árbol curricular';
  END IF;

  IF p_nombre IS NULL OR btrim(p_nombre) = '' THEN
    RAISE EXCEPTION 'El nombre del plan curricular no puede estar vacío';
  END IF;

  IF p_objetivos IS NULL OR jsonb_typeof(p_objetivos) <> 'array' THEN
    RAISE EXCEPTION 'El árbol curricular debe ser un arreglo JSON de unidades';
  END IF;

  -- Resolver el id de la plantilla: el indicado por el cliente, el de la
  -- clase, o uno nuevo.
  IF p_plantilla_id IS NOT NULL THEN
    v_plantilla_id := p_plantilla_id;
  ELSE
    SELECT id INTO v_plantilla_id
    FROM public.plantillas_planificacion
    WHERE clase_id = p_clase_id
    ORDER BY updated_at DESC
    LIMIT 1;

    IF v_plantilla_id IS NULL THEN
      v_plantilla_id := gen_random_uuid();
    END IF;
  END IF;

  -- 1. Upsert de la plantilla. `objetivos` se persiste como TEXT según el
  --    esquema (20260605000004) y `contenido` se regenera como resumen texto.
  INSERT INTO public.plantillas_planificacion (
    id, nombre, objetivos, contenido, recursos, evaluacion_metodo,
    clase_id, activo, updated_at
  )
  VALUES (
    v_plantilla_id,
    btrim(p_nombre),
    p_objetivos::text,
    '',
    '',
    '',
    p_clase_id,
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET nombre = EXCLUDED.nombre,
      objetivos = EXCLUDED.objetivos,
      contenido = EXCLUDED.contenido,
      clase_id = EXCLUDED.clase_id,
      activo = true,
      updated_at = now();

  -- 2. Upsert de indicadores. node_id NULL: pertenecen al plan de la clase,
  --    no a una ruta institucional. Se omiten objetivo_id/node_id porque los
  --    objetivos del Diseñador viven en el JSON de la plantilla.
  FOR v_unidad IN
    SELECT value FROM jsonb_array_elements(p_objetivos)
  LOOP
    FOR v_objetivo, v_o_idx IN
      SELECT value, ordinality
      FROM jsonb_array_elements(COALESCE(v_unidad->'objetivos', '[]'::jsonb)) WITH ORDINALITY
    LOOP
      FOR v_indicador, v_i_idx IN
        SELECT value, ordinality
        FROM jsonb_array_elements(COALESCE(v_objetivo->'indicadores', '[]'::jsonb)) WITH ORDINALITY
      LOOP
        -- Sólo indicadores con id UUID válido; los de demo/preview (ind-1,
        -- obj-ia-seq-*, etc.) nunca se persisten.
        IF v_indicador->>'id' IS NULL
           OR v_indicador->>'id' !~
             '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
          CONTINUE;
        END IF;

        INSERT INTO public.indicators (id, node_id, nombre, description, is_required, activo, order_index)
        VALUES (
          (v_indicador->>'id')::uuid,
          NULL,
          COALESCE(v_indicador->>'titulo', ''),
          COALESCE(v_indicador->>'descripcion', v_indicador->>'titulo', ''),
          true,
          true,
          v_i_idx
        )
        ON CONFLICT (id) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            description = EXCLUDED.description,
            is_required = EXCLUDED.is_required,
            activo = EXCLUDED.activo,
            order_index = EXCLUDED.order_index;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN v_plantilla_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_sincronizar_arbol_curricular(uuid, text, jsonb, uuid) TO authenticated;

COMMENT ON FUNCTION public.fn_sincronizar_arbol_curricular IS
  'Persiste el árbol curricular del Diseñador (unidad → objetivo → indicador) para una clase: valida autorización real (admin o maestro de la clase), upserta la plantilla y sincroniza los indicadores con UUID real a public.indicators.';
