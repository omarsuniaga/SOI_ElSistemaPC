-- Restringe los portales FIN, LUT, ACM y CAL a asignación explícita (user_portal_access).
--
-- Hoy entran por `portal_catalog.roles_default` (los 5 admins a ACM/FIN/LUT/CAL, y los
-- 29 maestros a CAL). Esta migración vacía esos roles y asigna los cuatro portales al
-- usuario indicado. Lo evalúan get_user_portales y has_portal_access (SECURITY DEFINER),
-- que usan el guardián del shell (ACM/LUT), el cliente FIN y el cliente Calendario.
--
-- ORDEN DE DESPLIEGUE: primero el código (FIN y Calendario ya consultan has_portal_access
-- y fallan cerrado), luego esta migración. Aplicarla ANTES no bloquea a FIN por rol, porque
-- el cliente FIN anterior aún tenía una lista de roles fija.
--
-- REVERSIBLE: ver el bloque ROLLBACK al final.
--
-- ALCANCE: esto controla el acceso a las PANTALLAS de esos portales. No cambia las
-- políticas RLS: los usuarios con rol 'admin' siguen pudiendo leer/escribir tablas por
-- API (*_admin_all). Restringir los datos requiere una revisión de RLS aparte.

DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = 'osuniagarivera@gmail.com';
  -- Salvaguarda: si el usuario no existe, abortar; si no, nadie tendría acceso.
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario osuniagarivera@gmail.com no encontrado: se aborta para no dejar a todos sin acceso';
  END IF;

  -- 1) Primero asignarle los portales a él (idempotente).
  INSERT INTO public.user_portal_access (user_id, portal_id, granted_by)
  SELECT v_uid, p.portal_id, v_uid
  FROM unnest(ARRAY['FIN', 'LUT', 'ACM', 'CAL']) AS p(portal_id)
  ON CONFLICT (user_id, portal_id) DO NOTHING;

  -- 2) Luego quitar el acceso por rol por defecto.
  UPDATE public.portal_catalog
     SET roles_default = '{}'
   WHERE portal_id IN ('FIN', 'LUT', 'ACM', 'CAL');

  -- 3) Verificación: debe conservar el acceso a los cuatro.
  IF (SELECT count(*) FROM public.user_portal_access
       WHERE user_id = v_uid AND portal_id IN ('FIN', 'LUT', 'ACM', 'CAL')) <> 4 THEN
    RAISE EXCEPTION 'No se pudieron asignar los 4 portales al usuario: se aborta';
  END IF;
END $$;

-- DECISIÓN PENDIENTE: revocar asignaciones explícitas de OTROS usuarios.
-- Hoy existe una: Katherine (admin) tiene FIN asignado a propósito. Si quieres "solo yo",
-- descomenta; si no, conserva su acceso.
--
-- DELETE FROM public.user_portal_access
--  WHERE portal_id IN ('FIN', 'LUT', 'ACM', 'CAL')
--    AND user_id <> (SELECT id FROM auth.users WHERE lower(email) = 'osuniagarivera@gmail.com');

-- ROLLBACK (volver al estado anterior):
-- UPDATE public.portal_catalog SET roles_default = ARRAY['superadmin','admin','direccion','coordinacion_academica'] WHERE portal_id = 'ACM';
-- UPDATE public.portal_catalog SET roles_default = ARRAY['superadmin','admin','finanzas'] WHERE portal_id = 'FIN';
-- UPDATE public.portal_catalog SET roles_default = ARRAY['superadmin','admin','operaciones'] WHERE portal_id = 'LUT';
-- UPDATE public.portal_catalog SET roles_default = ARRAY['superadmin','admin','direccion','coordinacion_academica','maestro','monitor','operaciones'] WHERE portal_id = 'CAL';
