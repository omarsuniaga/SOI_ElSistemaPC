-- Overlay on top of ../anon-write-fix/prod_schema_subset_2026-10-17.sql.
-- Adds what the base subset did NOT capture about public.permisos_maestros.
-- Sections marked CAPTURED are verbatim from a read-only production capture (2026-10-17,
-- pg_get_functiondef / pg_get_triggerdef / pg_policies). Sections marked MODELLED are minimal
-- stand-ins used only by the flow tests. TEST HARNESS ONLY.

-- ── CAPTURED: tiene_permiso (SECURITY INVOKER, reads the caller's own row through RLS) ────────
CREATE OR REPLACE FUNCTION public.tiene_permiso(p_permiso text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT p_permiso = ANY(permisos)
     FROM public.permisos_maestros
     WHERE maestro_id = public.maestro_actual()),
    false
  );
END;
$function$;

-- ── CAPTURED: timestamp trigger function ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_permisos()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$function$;

-- ── CAPTURED: integrity trigger function (SECURITY DEFINER, owner postgres) ───────────────────
CREATE OR REPLACE FUNCTION public.check_permisos_maestros_integrity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF public.es_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.maestro_id NOT IN (
    SELECT m.id
    FROM public.maestros m
    WHERE m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tenés permisos para modificar el registro de otro maestro.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.puede_registrar_alumnos := false;
    NEW.puede_inscribir_clases := false;
    NEW.puede_crear_clases := false;
    NEW.permisos := ARRAY[]::text[];
    NEW.concedido_por := NULL;

  ELSIF TG_OP = 'UPDATE' THEN
    NEW.puede_registrar_alumnos := OLD.puede_registrar_alumnos;
    NEW.puede_inscribir_clases := OLD.puede_inscribir_clases;
    NEW.puede_crear_clases := OLD.puede_crear_clases;
    NEW.permisos := OLD.permisos;
    NEW.concedido_por := OLD.concedido_por;
  END IF;

  RETURN NEW;
END;
$function$;

-- ── CAPTURED: triggers ────────────────────────────────────────────────────────────────────────
CREATE TRIGGER set_actualizado_en_permisos BEFORE UPDATE ON public.permisos_maestros FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_permisos();
CREATE TRIGGER trigger_check_permisos_maestros_integrity BEFORE INSERT OR UPDATE ON public.permisos_maestros FOR EACH ROW EXECUTE FUNCTION check_permisos_maestros_integrity();

-- ── CAPTURED: FK permisos_maestros.concedido_por -> auth.users(id) ────────────────────────────
ALTER TABLE public.permisos_maestros ADD CONSTRAINT permisos_maestros_concedido_por_fkey FOREIGN KEY (concedido_por) REFERENCES auth.users(id);

-- ── MODELLED: public.solicitudes_permisos (policies are verbatim from production) ─────────────
-- This is the table the teacher portal really writes when asking for a permission.
-- It is NOT touched by the migration under test; the flow tests only prove the request/approve
-- cycle behaves identically before and after.
CREATE TABLE public.solicitudes_permisos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maestro_id uuid NOT NULL REFERENCES public.maestros(id),
  solicita_alumnos boolean DEFAULT false, solicita_clases boolean DEFAULT false,
  tipos text[] DEFAULT '{}', estado text NOT NULL DEFAULT 'pendiente',
  creado_en timestamptz DEFAULT now(), actualizado_en timestamptz DEFAULT now(),
  aprobado_en timestamptz, aprobado_por uuid, motivo_rechazo text);
ALTER TABLE public.solicitudes_permisos ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.solicitudes_permisos TO authenticated, service_role;
CREATE POLICY "Admin puede ver y actualizar todas" ON public.solicitudes_permisos AS PERMISSIVE FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());
CREATE POLICY "Maestro puede crear su solicitud" ON public.solicitudes_permisos AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((maestro_id IN ( SELECT m.id FROM maestros m WHERE (m.user_id = auth.uid()))));
CREATE POLICY "Maestro puede ver su solicitud" ON public.solicitudes_permisos AS PERMISSIVE FOR SELECT TO authenticated USING (((maestro_id IN ( SELECT m.id FROM maestros m WHERE (m.user_id = auth.uid()))) OR es_admin()));

-- ── MODELLED: stand-ins for the SECURITY DEFINER RPCs that write permisos_maestros ────────────
-- (approve_maestro_profile / retirar_maestro_seguro: owner postgres, BYPASSRLS, es_admin() gate;
--  only their permisos_maestros statements are reproduced.)
CREATE OR REPLACE FUNCTION public.t_approve_maestro(p_maestro uuid) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT public.es_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.permisos_maestros (maestro_id) VALUES (p_maestro) ON CONFLICT (maestro_id) DO NOTHING;
END;
$function$;
CREATE OR REPLACE FUNCTION public.t_retirar_maestro(p_maestro uuid) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT public.es_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.permisos_maestros SET puede_planificar = false, puede_asistir = false WHERE maestro_id = p_maestro;
END;
$function$;
GRANT EXECUTE ON FUNCTION public.t_approve_maestro(uuid), public.t_retirar_maestro(uuid) TO authenticated;
