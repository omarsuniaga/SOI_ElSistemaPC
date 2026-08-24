-- Safe teacher retirement: preserve academic history, resolve active ownership,
-- revoke portal access and keep an auditable record. This deliberately does
-- not hard-delete maestros or auth users.

ALTER TABLE public.maestros
  ADD COLUMN IF NOT EXISTS retirado_en timestamptz,
  ADD COLUMN IF NOT EXISTS retirado_por uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS motivo_retiro text;

CREATE TABLE IF NOT EXISTS public.maestro_retiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL REFERENCES public.maestros(id) ON DELETE RESTRICT,
  reemplazo_maestro_id uuid REFERENCES public.maestros(id) ON DELETE SET NULL,
  retirado_por uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  motivo text,
  resumen_dependencias jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maestro_retiros_maestro_created
  ON public.maestro_retiros(maestro_id, created_at DESC);

ALTER TABLE public.maestro_retiros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS maestro_retiros_admin_read ON public.maestro_retiros;
CREATE POLICY maestro_retiros_admin_read ON public.maestro_retiros
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Returns every direct FK that currently references maestros, using PostgreSQL
-- catalog metadata. This prevents the UI from silently missing a new relation
-- introduced by a future migration.
CREATE OR REPLACE FUNCTION public.preview_retiro_maestro(p_maestro_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_maestro public.maestros%ROWTYPE;
  v_relation record;
  v_count bigint;
  v_dependencies jsonb := '{}'::jsonb;
  v_clases_principales jsonb := '[]'::jsonb;
  v_clases_suplente jsonb := '[]'::jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden retirar maestros.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_maestro FROM public.maestros WHERE id = p_maestro_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maestro no encontrado.' USING ERRCODE = 'P0002';
  END IF;

  FOR v_relation IN
    SELECT
      c.conrelid::regclass AS relation_name,
      a.attname AS column_name,
      CASE c.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
      END AS on_delete
    FROM pg_constraint c
    JOIN LATERAL unnest(c.conkey) WITH ORDINALITY AS keys(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = keys.attnum
    WHERE c.contype = 'f'
      AND c.confrelid = 'public.maestros'::regclass
      AND array_length(c.conkey, 1) = 1
    ORDER BY c.conrelid::regclass::text, a.attname
  LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE %I = $1', v_relation.relation_name, v_relation.column_name)
      INTO v_count USING p_maestro_id;
    IF v_count > 0 THEN
      v_dependencies := v_dependencies || jsonb_build_object(
        v_relation.relation_name::text || '.' || v_relation.column_name,
        jsonb_build_object('count', v_count, 'on_delete', v_relation.on_delete)
      );
    END IF;
  END LOOP;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'estado', estado) ORDER BY nombre), '[]'::jsonb)
    INTO v_clases_principales
    FROM public.clases
   WHERE maestro_principal_id = p_maestro_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'estado', estado) ORDER BY nombre), '[]'::jsonb)
    INTO v_clases_suplente
    FROM public.clases
   WHERE maestro_suplente_id = p_maestro_id;

  RETURN jsonb_build_object(
    'maestro', jsonb_build_object(
      'id', v_maestro.id,
      'nombre', v_maestro.nombre_completo,
      'activo', v_maestro.activo,
      'user_id', v_maestro.user_id
    ),
    'clases_principales', v_clases_principales,
    'clases_suplente', v_clases_suplente,
    'dependencias', v_dependencies,
    'requiere_reemplazo', jsonb_array_length(v_clases_principales) > 0
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.retirar_maestro_seguro(
  p_maestro_id uuid,
  p_reemplazo_maestro_id uuid DEFAULT NULL,
  p_motivo text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_maestro public.maestros%ROWTYPE;
  v_resumen jsonb;
  v_clases_principales integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden retirar maestros.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_maestro FROM public.maestros WHERE id = p_maestro_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maestro no encontrado.' USING ERRCODE = 'P0002';
  END IF;
  IF NOT v_maestro.activo THEN
    RAISE EXCEPTION 'El maestro ya está retirado.' USING ERRCODE = 'P0001';
  END IF;
  IF v_maestro.user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes retirar tu propia cuenta.' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_clases_principales
    FROM public.clases WHERE maestro_principal_id = p_maestro_id;

  IF v_clases_principales > 0 AND p_reemplazo_maestro_id IS NULL THEN
    RAISE EXCEPTION 'Debes seleccionar un reemplazo para las clases principales.' USING ERRCODE = '23514';
  END IF;

  IF p_reemplazo_maestro_id IS NOT NULL THEN
    IF p_reemplazo_maestro_id = p_maestro_id THEN
      RAISE EXCEPTION 'El reemplazo debe ser otro maestro.' USING ERRCODE = '23514';
    END IF;
    PERFORM 1 FROM public.maestros WHERE id = p_reemplazo_maestro_id AND activo = true FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'El maestro de reemplazo no existe o está inactivo.' USING ERRCODE = '23503';
    END IF;
  END IF;

  v_resumen := public.preview_retiro_maestro(p_maestro_id);

  -- A class cannot exist without a primary teacher. Transfer that operational
  -- responsibility; preserve every student enrollment and historical session.
  IF p_reemplazo_maestro_id IS NOT NULL THEN
    UPDATE public.clases
       SET maestro_principal_id = CASE WHEN maestro_principal_id = p_maestro_id THEN p_reemplazo_maestro_id ELSE maestro_principal_id END,
           maestro_suplente_id = CASE WHEN maestro_suplente_id = p_maestro_id THEN NULL ELSE maestro_suplente_id END,
           maestro_id = CASE WHEN maestro_id = p_maestro_id THEN p_reemplazo_maestro_id ELSE maestro_id END,
           updated_at = now()
     WHERE maestro_principal_id = p_maestro_id
        OR maestro_suplente_id = p_maestro_id
        OR maestro_id = p_maestro_id;
  ELSE
    UPDATE public.clases
       SET maestro_suplente_id = NULL,
           maestro_id = NULL,
           updated_at = now()
     WHERE maestro_suplente_id = p_maestro_id OR maestro_id = p_maestro_id;
  END IF;

  -- Revocar facultades y acceso sin borrar información ni relaciones históricas.
  UPDATE public.permisos_maestros
     SET puede_registrar_alumnos = false,
         puede_inscribir_clases = false,
         puede_crear_clases = false,
         puede_planificar = false,
         puede_asistir = false
   WHERE maestro_id = p_maestro_id;

  UPDATE public.profiles
     SET activo = false,
         updated_at = now()
   WHERE id = v_maestro.user_id;

  UPDATE public.maestros
     SET activo = false,
         retirado_en = now(),
         retirado_por = auth.uid(),
         motivo_retiro = NULLIF(trim(p_motivo), ''),
         updated_at = now()
   WHERE id = p_maestro_id;

  INSERT INTO public.maestro_retiros (
    maestro_id, reemplazo_maestro_id, retirado_por, motivo, resumen_dependencias
  ) VALUES (
    p_maestro_id, p_reemplazo_maestro_id, auth.uid(), NULLIF(trim(p_motivo), ''), v_resumen
  );

  RETURN v_resumen || jsonb_build_object(
    'retirado', true,
    'reemplazo_maestro_id', p_reemplazo_maestro_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reactivar_maestro_seguro(p_maestro_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden reactivar maestros.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.maestros
     SET activo = true,
         retirado_en = NULL,
         retirado_por = NULL,
         motivo_retiro = NULL,
         updated_at = now()
   WHERE id = p_maestro_id
   RETURNING user_id INTO v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maestro no encontrado.' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.profiles SET activo = true, updated_at = now() WHERE id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.preview_retiro_maestro(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.retirar_maestro_seguro(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reactivar_maestro_seguro(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.preview_retiro_maestro(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.retirar_maestro_seguro(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reactivar_maestro_seguro(uuid) TO authenticated;

-- Make the new RPC endpoints visible to PostgREST immediately.
NOTIFY pgrst, 'reload schema';
