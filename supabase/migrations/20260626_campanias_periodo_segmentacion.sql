-- 20260626_campanias_periodo_segmentacion.sql
-- Subsistema 1: Periodos + Segmentacion de campanias (Inscripcion/Reinscripcion).
-- Seguridad: RLS authenticated+es_admin(), sin {public}, revoke anon, vista security_invoker.
-- NOTA: fn_preview_campania y fn_activar_campania se redefinen en la migracion
--       20260626_campanias_fix_estado_pendiente.sql (la data real usa estado 'pendiente').

CREATE TABLE IF NOT EXISTS public.campanias_periodo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('A','B')),
  accion text NOT NULL CHECK (accion IN ('inscripcion','reinscripcion')),
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  activo boolean NOT NULL DEFAULT false,
  periodo_academico_id uuid REFERENCES public.periodos(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_campania_activa
  ON public.campanias_periodo (tipo, accion) WHERE activo;

ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS es_clase_iniciacion boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.campania_envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campania_id uuid NOT NULL REFERENCES public.campanias_periodo(id) ON DELETE CASCADE,
  fuente text NOT NULL CHECK (fuente IN ('postulante','alumno')),
  persona_id uuid NOT NULL,
  nombre text,
  telefono text,
  jid text NOT NULL,
  segmento text NOT NULL,
  mensaje text,
  estado text NOT NULL DEFAULT 'pendiente_envio',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campania_id, jid)
);

CREATE OR REPLACE VIEW public.vw_cupos_iniciacion WITH (security_invoker = true) AS
SELECT c.id AS clase_id, c.nombre, c.capacidad_maxima,
  (SELECT count(*) FROM public.alumnos_clases ac WHERE ac.clase_id = c.id) AS ocupacion,
  GREATEST(c.capacidad_maxima - (SELECT count(*) FROM public.alumnos_clases ac WHERE ac.clase_id = c.id), 0) AS disponible
FROM public.clases c
WHERE c.es_clase_iniciacion = true AND c.activo = true;

ALTER TABLE public.campanias_periodo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campania_envios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cp_admin_all ON public.campanias_periodo;
CREATE POLICY cp_admin_all ON public.campanias_periodo FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());
DROP POLICY IF EXISTS ce_admin_all ON public.campania_envios;
CREATE POLICY ce_admin_all ON public.campania_envios FOR ALL TO authenticated
  USING (es_admin()) WITH CHECK (es_admin());

REVOKE ALL ON public.campanias_periodo FROM anon;
REVOKE ALL ON public.campania_envios FROM anon;
REVOKE ALL ON public.vw_cupos_iniciacion FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campanias_periodo TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campania_envios TO authenticated;
GRANT SELECT ON public.vw_cupos_iniciacion TO authenticated;

-- Las funciones fn_preview_campania / fn_activar_campania quedan definidas en la
-- migracion de fix posterior (incluyen el estado 'pendiente' real de la data).
