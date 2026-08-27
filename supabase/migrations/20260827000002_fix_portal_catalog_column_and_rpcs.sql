-- ============================================================================
-- MIGRATION: 20260827000002_fix_portal_catalog_column_and_rpcs.sql
-- 1. Agregar columna is_active en portal_catalog sincronizada con activo
-- 2. Actualizar funciones RPC para usar activo/is_active de forma robusta
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'portal_catalog' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.portal_catalog ADD COLUMN is_active boolean DEFAULT true;
    UPDATE public.portal_catalog SET is_active = activo;
  END IF;
END $$;

-- 1. has_portal_access
CREATE OR REPLACE FUNCTION public.has_portal_access(
  p_portal_id text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_target_user_id uuid;
  v_caller_id uuid;
  v_caller_role text;
  v_user_role text;
  v_is_active boolean;
  v_has_explicit boolean;
  v_has_role_default boolean;
BEGIN
  v_caller_id := auth.uid();
  v_target_user_id := COALESCE(p_user_id, v_caller_id);

  IF v_target_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Protección IDOR: Si consulta por otro usuario, quien consulta debe ser admin o superadmin
  IF v_caller_id IS NOT NULL AND v_caller_id != v_target_user_id THEN
    SELECT rol INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF v_caller_role NOT IN ('admin', 'superadmin') THEN
      RETURN false;
    END IF;
  END IF;

  -- 1. Verificar si el portal existe y está activo
  SELECT COALESCE(activo, is_active, true) INTO v_is_active
  FROM public.portal_catalog
  WHERE portal_id = upper(trim(p_portal_id));

  IF v_is_active IS NOT TRUE THEN
    RETURN false;
  END IF;

  -- 2. Obtener el rol del usuario target
  SELECT rol INTO v_user_role
  FROM public.profiles
  WHERE id = v_target_user_id;

  -- 3. Superadmin tiene acceso irrestricto
  IF v_user_role = 'superadmin' THEN
    RETURN true;
  END IF;

  -- 4. Verificar asignación explícita
  SELECT EXISTS (
    SELECT 1
    FROM public.user_portal_access
    WHERE user_id = v_target_user_id
      AND portal_id = upper(trim(p_portal_id))
  ) INTO v_has_explicit;

  IF v_has_explicit THEN
    RETURN true;
  END IF;

  -- 5. Verificar rol por defecto en catálogo
  IF v_user_role IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.portal_catalog
      WHERE portal_id = upper(trim(p_portal_id))
        AND v_user_role = ANY(roles_default)
    ) INTO v_has_role_default;

    IF v_has_role_default THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- 2. get_user_portales
DROP FUNCTION IF EXISTS public.get_user_portales(uuid);

CREATE OR REPLACE FUNCTION public.get_user_portales(
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE (
  portal_id text,
  nombre text,
  ruta text,
  icono text,
  orden integer,
  origen_acceso text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_target_user_id uuid;
  v_caller_id uuid;
  v_caller_role text;
  v_user_role text;
BEGIN
  v_caller_id := auth.uid();
  v_target_user_id := COALESCE(p_user_id, v_caller_id);

  IF v_target_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Protección IDOR: Si consulta por otro usuario, quien consulta debe ser admin o superadmin
  IF v_caller_id IS NOT NULL AND v_caller_id != v_target_user_id THEN
    SELECT rol INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF v_caller_role NOT IN ('admin', 'superadmin') THEN
      RETURN;
    END IF;
  END IF;

  SELECT rol INTO v_user_role
  FROM public.profiles
  WHERE id = v_target_user_id;

  -- Caso SuperAdmin: retorna todos los portales activos
  IF v_user_role = 'superadmin' THEN
    RETURN QUERY
    SELECT 
      c.portal_id,
      c.nombre,
      c.ruta,
      c.icono,
      c.orden,
      'superadmin'::text AS origen_acceso
    FROM public.portal_catalog c
    WHERE COALESCE(c.activo, c.is_active, true) = true
    ORDER BY c.orden ASC;
    RETURN;
  END IF;

  -- Caso general: Asignaciones explícitas + roles por defecto
  RETURN QUERY
  WITH accessible AS (
    -- Explícitos
    SELECT 
      c.portal_id,
      c.nombre,
      c.ruta,
      c.icono,
      c.orden,
      'asignado'::text AS origen_acceso
    FROM public.portal_catalog c
    INNER JOIN public.user_portal_access a ON a.portal_id = c.portal_id
    WHERE a.user_id = v_target_user_id AND COALESCE(c.activo, c.is_active, true) = true

    UNION

    -- Roles por defecto
    SELECT 
      c.portal_id,
      c.nombre,
      c.ruta,
      c.icono,
      c.orden,
      'rol_default'::text AS origen_acceso
    FROM public.portal_catalog c
    WHERE COALESCE(c.activo, c.is_active, true) = true
      AND v_user_role IS NOT NULL
      AND v_user_role = ANY(c.roles_default)
  )
  SELECT DISTINCT ON (accessible.portal_id)
    accessible.portal_id,
    accessible.nombre,
    accessible.ruta,
    accessible.icono,
    accessible.orden,
    accessible.origen_acceso
  FROM accessible
  ORDER BY accessible.portal_id, accessible.orden ASC;
END;
$$;

-- 3. set_user_portales
CREATE OR REPLACE FUNCTION public.set_user_portales(
  p_user_id uuid,
  p_portal_ids text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_target_role text;
  v_cleaned_portals text[];
  v_clean_id text;
  v_inserted_count integer := 0;
BEGIN
  v_caller_id := auth.uid();

  -- 1. Validar que el invocador sea administrador o superadministrador
  SELECT rol INTO v_caller_role
  FROM public.profiles
  WHERE id = v_caller_id;

  IF v_caller_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'No autorizado: se requieren permisos de administrador para asignar portales';
  END IF;

  -- 2. Validar que el usuario objetivo exista
  SELECT rol INTO v_target_role
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'El usuario destino no existe';
  END IF;

  -- 3. Blindaje de escalamiento: Solo superadmin puede asignar el portal SUPERADMIN
  IF 'SUPERADMIN' = ANY(p_portal_ids) AND v_caller_role != 'superadmin' THEN
    RAISE EXCEPTION 'Solo un SuperAdmin puede conceder acceso al portal SUPERADMIN';
  END IF;

  -- 4. Validar que los portal_ids sean válidos y activos antes de modificar
  IF p_portal_ids IS NOT NULL AND array_length(p_portal_ids, 1) > 0 THEN
    FOREACH v_clean_id IN ARRAY p_portal_ids LOOP
      v_clean_id := upper(trim(v_clean_id));
      IF NOT EXISTS (SELECT 1 FROM public.portal_catalog WHERE portal_id = v_clean_id AND COALESCE(activo, is_active, true) = true) THEN
        RAISE EXCEPTION 'El portal % no existe o no está activo', v_clean_id;
      END IF;
      v_cleaned_portals := array_append(v_cleaned_portals, v_clean_id);
    END LOOP;
  END IF;

  -- 5. Eliminar asignaciones previas del usuario
  DELETE FROM public.user_portal_access
  WHERE user_id = p_user_id;

  -- 6. Insertar nuevas asignaciones validadas
  IF v_cleaned_portals IS NOT NULL AND array_length(v_cleaned_portals, 1) > 0 THEN
    FOREACH v_clean_id IN ARRAY v_cleaned_portals LOOP
      INSERT INTO public.user_portal_access (user_id, portal_id, assigned_by)
      VALUES (p_user_id, v_clean_id, v_caller_id)
      ON CONFLICT (user_id, portal_id) DO NOTHING;

      v_inserted_count := v_inserted_count + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'assigned_count', v_inserted_count,
    'assigned_by', v_caller_id
  );
END;
$$;

-- 4. Permisos
REVOKE ALL ON FUNCTION public.has_portal_access(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_portal_access(text, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_portales(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_portales(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.set_user_portales(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_portales(uuid, text[]) TO authenticated;
