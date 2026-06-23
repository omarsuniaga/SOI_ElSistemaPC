-- Migration: audiciones-integration — PR 1
-- Schema + RLS + role fix, idempotent.
-- Runs after all prior migrations.

-- Step 1: Add 'jurado' to profiles role CHECK constraint
ALTER TABLE IF EXISTS public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE IF EXISTS public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (rol = ANY (ARRAY[
      'superadmin'::text,
      'admin'::text,
      'direccion'::text,
      'coordinacion_academica'::text,
      'maestro'::text,
      'monitor'::text,
      'finanzas'::text,
      'operaciones'::text,
      'representante'::text,
      'alumno'::text,
      'jurado'::text,
      'user'::text
    ]));

-- Step 2: Core tables

CREATE TABLE IF NOT EXISTS public.sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  instrument_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sections_pkey PRIMARY KEY (id)
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.repertoire_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  composer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT repertoire_items_pkey PRIMARY KEY (id)
);

ALTER TABLE public.repertoire_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.repertoire_fragments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.repertoire_items(id) ON DELETE CASCADE,
  fragment_label text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT repertoire_fragments_pkey PRIMARY KEY (id)
);

ALTER TABLE public.repertoire_fragments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  jurado_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES public.sections(id),
  -- 8 criteria (1-4 scale)
  afinacion_general integer NOT NULL CHECK (afinacion_general BETWEEN 1 AND 4),
  ritmo_escala integer NOT NULL CHECK (ritmo_escala BETWEEN 1 AND 4),
  sonido integer NOT NULL CHECK (sonido BETWEEN 1 AND 4),
  digitacion integer NOT NULL CHECK (digitacion BETWEEN 1 AND 4),
  afinacion_rep integer NOT NULL CHECK (afinacion_rep BETWEEN 1 AND 4),
  ritmo_rep integer NOT NULL CHECK (ritmo_rep BETWEEN 1 AND 4),
  articulacion integer NOT NULL CHECK (articulacion BETWEEN 1 AND 4),
  lectura integer NOT NULL CHECK (lectura BETWEEN 1 AND 4),
  -- Generated score columns
  score_escala integer GENERATED ALWAYS AS (afinacion_general + ritmo_escala + sonido + digitacion) STORED,
  score_danzon integer GENERATED ALWAYS AS (afinacion_rep + ritmo_rep + articulacion + lectura) STORED,
  score_total integer GENERATED ALWAYS AS (
    (afinacion_general + ritmo_escala + sonido + digitacion) +
    (afinacion_rep + ritmo_rep + articulacion + lectura)
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT evaluations_pkey PRIMARY KEY (id),
  CONSTRAINT evaluations_student_jurado_unique UNIQUE (student_id, jurado_id)
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_evaluations_jurado ON public.evaluations(jurado_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON public.evaluations(student_id);

-- Step 3: student_results VIEW (aggregates across jurados, admin only)

CREATE OR REPLACE VIEW public.student_results
WITH (security_invoker = true)
AS
SELECT
  e.student_id,
  e.section_id,
  s.name AS section_name,
  ROUND(AVG(e.score_total)::numeric, 2) AS avg_total,
  CASE
    WHEN AVG(e.score_total) >= 28 THEN 'A'
    WHEN AVG(e.score_total) >= 20 THEN 'B'
    WHEN AVG(e.score_total) >= 12 THEN 'C'
    ELSE 'D'
  END AS group_assignment
FROM public.evaluations e
JOIN public.sections s ON s.id = e.section_id
GROUP BY e.student_id, e.section_id, s.name;

-- Step 4: RLS policies

-- evaluations
DROP POLICY IF EXISTS evaluations_jurado_select ON public.evaluations;
CREATE POLICY evaluations_jurado_select ON public.evaluations
  FOR SELECT
  USING (get_user_role() = 'jurado' AND jurado_id = auth.uid());

DROP POLICY IF EXISTS evaluations_admin_select ON public.evaluations;
CREATE POLICY evaluations_admin_select ON public.evaluations
  FOR SELECT
  USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS evaluations_jurado_insert ON public.evaluations;
CREATE POLICY evaluations_jurado_insert ON public.evaluations
  FOR INSERT
  WITH CHECK (get_user_role() = 'jurado' AND jurado_id = auth.uid());

DROP POLICY IF EXISTS evaluations_jurado_update ON public.evaluations;
CREATE POLICY evaluations_jurado_update ON public.evaluations
  FOR UPDATE
  USING (get_user_role() = 'jurado' AND jurado_id = auth.uid())
  WITH CHECK (get_user_role() = 'jurado' AND jurado_id = auth.uid());

-- sections
DROP POLICY IF EXISTS sections_read ON public.sections;
CREATE POLICY sections_read ON public.sections
  FOR SELECT
  USING (get_user_role() = ANY (ARRAY['jurado'::text, 'admin'::text]));

-- repertoire_items
DROP POLICY IF EXISTS repertoire_items_read ON public.repertoire_items;
CREATE POLICY repertoire_items_read ON public.repertoire_items
  FOR SELECT
  USING (get_user_role() = ANY (ARRAY['jurado'::text, 'admin'::text]));

-- repertoire_fragments
DROP POLICY IF EXISTS repertoire_fragments_read ON public.repertoire_fragments;
CREATE POLICY repertoire_fragments_read ON public.repertoire_fragments
  FOR SELECT
  USING (get_user_role() = ANY (ARRAY['jurado'::text, 'admin'::text]));

-- Step 5: Verify get_user_role() is STABLE (no-op DDL, idempotent)
SELECT pg_catalog.pg_proc.prosrc
FROM pg_catalog.pg_proc
JOIN pg_catalog.pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
WHERE pg_proc.proname = 'get_user_role'
  AND pg_namespace.nspname = 'public';
