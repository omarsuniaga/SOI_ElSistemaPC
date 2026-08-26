-- Fix: get_user_department() referenciaba profiles.profile_data, columna que
-- no existe (la real es profiles.rol). Esto rompía RLS para CUALQUIER usuario
-- sin el claim app_metadata.departamento en su JWT, en todas las tablas que
-- usan esta función (hermes_reactive_rules, soi_eventos, etc.) — el fallback
-- siempre lanzaba "column profile_data does not exist" (42703).
--
-- Descubierto al simular la Fase 3 (aprobación humana WhatsApp) end-to-end:
-- la vista de Reglas Reactivas fallaba al cargar para el usuario admin de prueba.

CREATE OR REPLACE FUNCTION public.get_user_department()
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_department text;
  v_rol text;
BEGIN
  v_department := auth.jwt() -> 'app_metadata' ->> 'departamento';
  IF v_department IS NOT NULL THEN
    RETURN v_department;
  END IF;

  SELECT rol INTO v_rol FROM public.profiles WHERE id = auth.uid();

  RETURN CASE v_rol
    WHEN 'admin' THEN 'DIR'
    WHEN 'superadmin' THEN 'DIR'
    WHEN 'direccion' THEN 'DIR'
    WHEN 'coordinacion_academica' THEN 'ACM'
    WHEN 'finanzas' THEN 'FIN'
    WHEN 'operaciones' THEN 'ADM'
    ELSE 'TECNICO'
  END;
END;
$function$;
