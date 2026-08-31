-- Migration: 20260831000002_eliminar_maestro_limpio_rpc.sql
-- Description: Stored procedure for evaluating workload and performing clean maestro deletion if 0 classes exist

CREATE OR REPLACE FUNCTION public.eliminar_maestro_limpio(p_maestro_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_maestro record;
  v_clases_count integer;
BEGIN
  -- 1. Verificar si el maestro existe
  SELECT * INTO v_maestro FROM public.maestros WHERE id = p_maestro_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El maestro no existe.' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Evaluar si tiene clases asignadas (como titular o suplente)
  SELECT count(*) INTO v_clases_count
    FROM public.clases
   WHERE maestro_principal_id = p_maestro_id 
      OR maestro_suplente_id = p_maestro_id 
      OR maestro_id = p_maestro_id;

  IF v_clases_count > 0 THEN
    RAISE EXCEPTION 'No se puede eliminar el maestro porque tiene % clase(s) asignada(s). Reasigna o desvincula las clases primero.', v_clases_count USING ERRCODE = '23503';
  END IF;

  -- 3. Limpiar registros dependientes auxiliares de permisos y credenciales
  DELETE FROM public.maestro_access_credentials WHERE maestro_id = p_maestro_id;
  DELETE FROM public.permisos_maestros WHERE maestro_id = p_maestro_id;
  DELETE FROM public.solicitudes_permisos WHERE maestro_id = p_maestro_id;
  DELETE FROM public.maestro_desempeno WHERE maestro_id = p_maestro_id;
  DELETE FROM public.maestro_retiros WHERE maestro_id = p_maestro_id;
  DELETE FROM public.registros_pendientes WHERE maestro_id = p_maestro_id;
  DELETE FROM public.asistencia_maestros WHERE maestro_id = p_maestro_id OR suplente_id = p_maestro_id;

  -- 4. Eliminar el maestro
  DELETE FROM public.maestros WHERE id = p_maestro_id;

  -- 5. Si existe usuario en profiles vinculado, desactivarlo
  IF v_maestro.user_id IS NOT NULL THEN
    UPDATE public.profiles SET activo = false, updated_at = now() WHERE id = v_maestro.user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'eliminado_id', p_maestro_id,
    'nombre', v_maestro.nombre_completo
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.eliminar_maestro_limpio(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
