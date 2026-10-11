-- set_user_portales() insertaba en user_portal_access.assigned_by, columna
-- que nunca existió (la real es granted_by) -> "Usuario creado, pero hubo un
-- detalle al asignar portales: column assigned_by does not exist" cada vez
-- que se creaba un usuario con portales seleccionados.
CREATE OR REPLACE FUNCTION public.set_user_portales(p_user_id uuid, p_portal_ids text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
      INSERT INTO public.user_portal_access (user_id, portal_id, granted_by)
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
$function$;
