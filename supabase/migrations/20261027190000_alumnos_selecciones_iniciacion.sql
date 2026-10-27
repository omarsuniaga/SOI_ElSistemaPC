-- Selecciones desde Iniciación: decisión académica, nunca matrícula automática.
-- Aplicar con Supabase CLI tras revisión del PR, ANTES de desplegar el frontend.
CREATE TABLE public.alumnos_selecciones_iniciacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  destino text NOT NULL CHECK (destino IN ('orquesta', 'coro')),
  activo boolean NOT NULL DEFAULT true,
  fecha_seleccion timestamptz NOT NULL DEFAULT now(),
  registrado_por uuid DEFAULT auth.uid(),
  actualizado_por uuid DEFAULT auth.uid(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT alumnos_selecciones_iniciacion_unico UNIQUE (alumno_id, destino)
);

COMMENT ON TABLE public.alumnos_selecciones_iniciacion IS
'Decisión de selección desde Iniciación; no da de alta en alumnos_programas ni alumnos_clases.';
CREATE INDEX idx_alumnos_selecciones_iniciacion_activas
  ON public.alumnos_selecciones_iniciacion (alumno_id) WHERE activo;

-- Evita reasignar una selección a otro alumno/destino o falsear su autor original.
CREATE FUNCTION public.fn_proteger_seleccion_iniciacion()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
BEGIN
  IF NEW.alumno_id IS DISTINCT FROM OLD.alumno_id
     OR NEW.destino IS DISTINCT FROM OLD.destino
     OR NEW.registrado_por IS DISTINCT FROM OLD.registrado_por THEN
    RAISE EXCEPTION 'No se permite reasignar ni alterar el autor de una selección';
  END IF;
  NEW.actualizado_en := now();
  NEW.actualizado_por := auth.uid();
  IF NEW.activo IS TRUE AND OLD.activo IS FALSE THEN
    NEW.fecha_seleccion := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_proteger_seleccion_iniciacion
BEFORE UPDATE ON public.alumnos_selecciones_iniciacion
FOR EACH ROW EXECUTE FUNCTION public.fn_proteger_seleccion_iniciacion();

ALTER TABLE public.alumnos_selecciones_iniciacion ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.alumnos_selecciones_iniciacion FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.alumnos_selecciones_iniciacion TO authenticated;
GRANT ALL ON public.alumnos_selecciones_iniciacion TO service_role;

-- Se puede consultar únicamente para alumnos visibles al usuario según RLS de alumnos.
CREATE POLICY "selecciones_iniciacion_staff_lectura"
ON public.alumnos_selecciones_iniciacion FOR SELECT TO authenticated
USING (
  (SELECT soi_security.has_role(ARRAY[
    'admin', 'superadmin', 'direccion', 'coordinacion_academica', 'maestro'
  ]))
  AND EXISTS (SELECT 1 FROM public.alumnos a WHERE a.id = alumno_id)
);

-- Solo Dirección/Coordinación/Administración pueden marcar una selección.
-- Debe existir una matrícula ACTIVA en uno de los programas de Iniciación,
-- o en una clase activa marcada como Iniciación.
CREATE POLICY "selecciones_iniciacion_gestores_insert"
ON public.alumnos_selecciones_iniciacion FOR INSERT TO authenticated
WITH CHECK (
  (SELECT soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica']))
  AND registrado_por = (SELECT auth.uid())
  AND (
    activo IS FALSE OR
    EXISTS (
      SELECT 1 FROM public.alumnos_programas ap
      JOIN public.programas p ON p.id = ap.programa_id
      WHERE ap.alumno_id = alumno_id AND ap.activo IS TRUE
        AND p.codigo IN ('I.N', 'C.I')
    )
    OR EXISTS (
      SELECT 1 FROM public.alumnos_clases ac
      JOIN public.clases c ON c.id = ac.clase_id
      WHERE ac.alumno_id = alumno_id AND ac.activo IS TRUE
        AND c.activo IS TRUE AND c.es_clase_iniciacion IS TRUE
    )
  )
);

CREATE POLICY "selecciones_iniciacion_gestores_update"
ON public.alumnos_selecciones_iniciacion FOR UPDATE TO authenticated
USING ((SELECT soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica'])))
WITH CHECK (
  (SELECT soi_security.has_role(ARRAY['admin','superadmin','direccion','coordinacion_academica']))
  AND (
    activo IS FALSE OR
    EXISTS (
      SELECT 1 FROM public.alumnos_programas ap
      JOIN public.programas p ON p.id = ap.programa_id
      WHERE ap.alumno_id = alumno_id AND ap.activo IS TRUE
        AND p.codigo IN ('I.N', 'C.I')
    )
    OR EXISTS (
      SELECT 1 FROM public.alumnos_clases ac
      JOIN public.clases c ON c.id = ac.clase_id
      WHERE ac.alumno_id = alumno_id AND ac.activo IS TRUE
        AND c.activo IS TRUE AND c.es_clase_iniciacion IS TRUE
    )
  )
);
