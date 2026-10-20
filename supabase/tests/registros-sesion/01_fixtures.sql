-- Minimal subset of production needed by registros_sesion and cerrar_sesion (TEST HARNESS ONLY).
-- Columns and checks copied from supabase/migrations/schema_reference.sql (read-only dump).
-- asistencias.valoracion/valorada_por/valorada_at and their trigger come from the real
-- migration 20261020170631_asistencias_valoracion_clase.sql, replayed by run_tests.mjs.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id)
);

CREATE TABLE public.maestros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id),
  nombre_completo text NOT NULL
);

CREATE TABLE public.alumnos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL
);

CREATE TABLE public.clases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_principal_id uuid REFERENCES public.maestros(id),
  maestro_suplente_id uuid REFERENCES public.maestros(id)
);

CREATE TABLE public.maestro_indicadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE public.permisos_maestros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id uuid NOT NULL REFERENCES public.maestros(id),
  permiso text NOT NULL
);

CREATE TABLE public.sesiones_clase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id uuid NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  maestro_id uuid NOT NULL REFERENCES public.maestros(id) ON DELETE RESTRICT,
  fecha date NOT NULL,
  estado text NOT NULL DEFAULT 'abierta',
  contenido text,
  asistencia jsonb DEFAULT '[]'::jsonb,
  borrador boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT sesiones_clase_estado_check CHECK ((estado = ANY (ARRAY['programada'::text, 'abierta'::text, 'asistencia_registrada'::text, 'progreso_registrado'::text, 'cerrada'::text, 'pendiente'::text, 'atrasada'::text, 'cancelada'::text, 'registrada'::text]))),
  CONSTRAINT sesiones_clase_clase_fecha_maestro_unique UNIQUE (clase_id, fecha, maestro_id)
);

CREATE TABLE public.asistencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_clase_id uuid NOT NULL REFERENCES public.sesiones_clase(id) ON DELETE CASCADE,
  clase_id uuid NOT NULL REFERENCES public.clases(id) ON DELETE CASCADE,
  alumno_id uuid NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  estado text NOT NULL,
  registrado_por uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT asistencias_estado_check CHECK ((estado = ANY (ARRAY['presente'::text, 'ausente'::text, 'tarde'::text, 'justificado'::text]))),
  CONSTRAINT asistencias_unica_por_sesion UNIQUE (sesion_clase_id, alumno_id),
  CONSTRAINT uk_asistencias_clase_alumno_fecha UNIQUE (clase_id, alumno_id, fecha)
);

-- Helpers with the same behaviour as production (bodies from schema_reference.sql).
CREATE FUNCTION public.maestro_actual() RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN (SELECT id FROM public.maestros WHERE user_id = auth.uid() OR (user_id IS NULL AND id = auth.uid()));
END;
$$;

CREATE FUNCTION public.maestro_en_clase(p_clase_id uuid) RETURNS boolean
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.clases WHERE id = p_clase_id
    AND (maestro_principal_id = public.maestro_actual() OR maestro_suplente_id = public.maestro_actual()));
END;
$$;

-- Simplified: admin only when the JWT app_metadata says so (production reads profiles).
CREATE FUNCTION public.es_admin() RETURNS boolean
LANGUAGE sql STABLE AS $$ SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'rol', '') = 'admin' $$;

-- Production-like RLS on the sessions and attendance tables that the RPC reads.
ALTER TABLE public.sesiones_clase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Maestros ven sus sesiones" ON public.sesiones_clase FOR SELECT TO authenticated
  USING (((maestro_id = public.maestro_actual()) OR public.maestro_en_clase(clase_id)));

ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "asistencias_admin_select" ON public.asistencias FOR SELECT TO authenticated
  USING ((public.es_admin() OR (EXISTS (SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = asistencias.sesion_clase_id AND ((s.maestro_id = public.maestro_actual()) OR public.maestro_en_clase(s.clase_id))))));
