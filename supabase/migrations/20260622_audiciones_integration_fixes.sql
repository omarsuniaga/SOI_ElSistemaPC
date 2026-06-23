-- =============================================
-- OSIJ-PC Audiciones Integration — Migration Addendum
-- AFTER: 20260622_audiciones_schema.sql
--
-- Replaces the standalone audiciones auth model (app_users +
-- handle_new_auth_user) with the main PWA's unified auth
-- model (profiles + get_user_role()).
--
-- Idempotent: all operations use IF EXISTS / IF NOT NULL.
-- =============================================

-- =============================================
-- Step 1: Add 'jurado' to profiles.rol CHECK
-- Constraint last modified by inventario-profesional
-- to allow ('admin', 'maestro', 'inventarista').
-- We add 'jurado' (and 'cajero' which was already
-- in use by caja-fundacion RLS but missing from
-- the constraint — fixing existing deviation).
-- =============================================
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

UPDATE public.profiles
  SET rol = 'user'
  WHERE rol IS NULL
     OR rol NOT IN ('admin','maestro','inventarista','cajero','jurado');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (rol IN ('admin','maestro','inventarista','cajero','jurado'));

-- =============================================
-- Step 2: Verify get_user_role() is STABLE
-- Already STABLE per 004_rls_policies.sql and
-- 20260517_auth_rls_fix.sql. No DDL needed.
-- =============================================

-- =============================================
-- Step 3: Backfill profiles from app_users
-- BEFORE dropping app_users, ensure every user
-- has a profile row in the main system.
-- =============================================
INSERT INTO public.profiles (id, email, nombre_completo, rol, estado)
SELECT
  au.id,
  COALESCE(au.email, ''),
  COALESCE(NULLIF(au.display_name, ''), 'Usuario Audiciones'),
  COALESCE(NULLIF(au.role, ''), 'jurado'),
  CASE WHEN au.is_active THEN 'activo' ELSE 'inactivo' END
FROM public.app_users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- =============================================
-- Step 4: Drop app_users and stale functions
-- app_users was a shadow auth table that caused
-- the dual-identity problem (proposal §1).
-- =============================================
DROP TABLE IF EXISTS public.app_users CASCADE;

DROP FUNCTION IF EXISTS public.get_app_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_app_admin() CASCADE;

-- =============================================
-- Step 5: Drop audiciones-specific trigger,
-- restore the main system's auth trigger
--
-- 20260622_audiciones_schema.sql replaced the
-- original on_auth_user_created trigger with
-- handle_new_auth_user() (inserts into app_users).
-- We restore handle_new_user() (inserts into
-- profiles) and accept both 'rol' and 'role'
-- metadata keys for Edge Function compatibility.
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_rol TEXT;
BEGIN
  v_rol := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'rol', ''),
    NULLIF(NEW.raw_user_meta_data->>'role', ''),
    'user'
  );

  INSERT INTO public.profiles (
    id, email, nombre_completo, rol, estado,
    solicitud_instrumento, solicitud_resena
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_rol,
    CASE WHEN v_rol = 'maestro' THEN 'pendiente' ELSE 'activo' END,
    NULLIF(NEW.raw_user_meta_data->>'instrumento', ''),
    NULLIF(NEW.raw_user_meta_data->>'resena', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nombre_completo = COALESCE(NULLIF(EXCLUDED.nombre_completo, ''), public.profiles.nombre_completo),
    solicitud_instrumento = COALESCE(EXCLUDED.solicitud_instrumento, public.profiles.solicitud_instrumento),
    solicitud_resena = COALESCE(EXCLUDED.solicitud_resena, public.profiles.solicitud_resena),
    updated_at = NOW();

  IF v_rol = 'maestro' THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Step 6: Update RLS policies on audiciones
-- tables to use get_user_role() instead of
-- app_users-based checks.
--
-- DESIGN DEVIATION: evaluations.jurado_id is
-- TEXT (not UUID). auth.uid() returns UUID.
-- We use auth.uid()::TEXT for comparison.
-- New evaluations will store the UUID-as-text.
-- Existing evaluations with human-readable IDs
-- won't match — acceptable since standalone app
-- is removed (R-13).
-- =============================================

-- evaluations
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Evaluations read policy"   ON public.evaluations;
DROP POLICY IF EXISTS "Evaluations insert policy"  ON public.evaluations;
DROP POLICY IF EXISTS "Evaluations update policy"  ON public.evaluations;
DROP POLICY IF EXISTS "Evaluations delete policy"  ON public.evaluations;
DROP POLICY IF EXISTS "jurado_own_evaluations"     ON public.evaluations;
DROP POLICY IF EXISTS "admin_all_evaluations"      ON public.evaluations;

CREATE POLICY evaluations_jurado_select ON public.evaluations
  FOR SELECT
  USING (
    get_user_role() = 'jurado'
    AND jurado_id = auth.uid()::TEXT
  );

CREATE POLICY evaluations_admin_select ON public.evaluations
  FOR SELECT
  USING (get_user_role() = 'admin');

CREATE POLICY evaluations_jurado_insert ON public.evaluations
  FOR INSERT
  WITH CHECK (
    get_user_role() = 'jurado'
    AND jurado_id = auth.uid()::TEXT
  );

CREATE POLICY evaluations_jurado_update ON public.evaluations
  FOR UPDATE
  USING (
    get_user_role() = 'jurado'
    AND jurado_id = auth.uid()::TEXT
  );

-- sections
DROP POLICY IF EXISTS "Allow public read sections" ON public.sections;
DROP POLICY IF EXISTS "Allow admin modify sections" ON public.sections;
DROP POLICY IF EXISTS "authenticated_read_sections" ON public.sections;

CREATE POLICY sections_read ON public.sections
  FOR SELECT
  USING (get_user_role() IN ('jurado', 'admin'));

CREATE POLICY sections_admin_write ON public.sections
  FOR ALL
  USING (get_user_role() = 'admin');

-- repertoire_items
DROP POLICY IF EXISTS "Allow public read repertoire_items"    ON public.repertoire_items;
DROP POLICY IF EXISTS "Allow admin modify repertoire_items"    ON public.repertoire_items;
DROP POLICY IF EXISTS "authenticated_read_repertoire"         ON public.repertoire_items;

CREATE POLICY repertoire_items_read ON public.repertoire_items
  FOR SELECT
  USING (get_user_role() IN ('jurado', 'admin'));

CREATE POLICY repertoire_items_admin_write ON public.repertoire_items
  FOR ALL
  USING (get_user_role() = 'admin');

-- repertoire_fragments
DROP POLICY IF EXISTS "Allow public read repertoire_fragments"   ON public.repertoire_fragments;
DROP POLICY IF EXISTS "Allow admin modify repertoire_fragments"  ON public.repertoire_fragments;
DROP POLICY IF EXISTS "authenticated_read_fragments"             ON public.repertoire_fragments;

CREATE POLICY repertoire_fragments_read ON public.repertoire_fragments
  FOR SELECT
  USING (get_user_role() IN ('jurado', 'admin'));

CREATE POLICY repertoire_fragments_admin_write ON public.repertoire_fragments
  FOR ALL
  USING (get_user_role() = 'admin');

-- =============================================
-- Step 7: Recreate student_results VIEW with
-- security_invoker = true so RLS on underlying
-- evaluations table is checked for view access.
-- Requires Postgres 15+.
-- =============================================
DROP VIEW IF EXISTS public.student_results CASCADE;

CREATE OR REPLACE VIEW public.student_results WITH (security_invoker = true) AS
SELECT
    s.id,
    s.nombre_completo AS name,
    CASE
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%violin%'
          OR LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%violín%'
          OR LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%volin%'
          THEN 'Violines I'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%viola%'
          THEN 'Violas'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%cello%'
          OR LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%violoncello%'
          THEN 'Violoncellos'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%contrabajo%'
          THEN 'Contrabajos'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%flauta%'
          THEN 'Flautas'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%oboe%'
          THEN 'Oboes'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%clarinete%'
          THEN 'Clarinetes'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%corno%'
          THEN 'Cornos'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%trompeta%'
          THEN 'Trompetas'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%trombo%'
          THEN 'Trombones'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%tuba%'
          THEN 'Tuba'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%percu%'
          THEN 'Percusión'
        WHEN LOWER(COALESCE(s.instrumento_principal, s.instrumento_interes)) LIKE '%piano%'
          THEN 'Pianistas'
        ELSE COALESCE(s.instrumento_principal, s.instrumento_interes, 'Sin sección')
    END AS section,
    COUNT(e.id) AS eval_count,
    ROUND(AVG(e.score_escala)::numeric, 1) AS avg_escala,
    ROUND(AVG(e.score_danzon)::numeric, 1) AS avg_danzon,
    ROUND(AVG(e.score_total)::numeric, 1) AS avg_total,
    CASE
        WHEN AVG(e.score_total) >= 28 THEN 'A'
        WHEN AVG(e.score_total) >= 20 THEN 'B'
        WHEN AVG(e.score_total) >= 12 THEN 'C'
        WHEN AVG(e.score_total) >=  8 THEN 'D'
        ELSE NULL
    END AS assigned_group
FROM public.alumnos s
LEFT JOIN evaluations e ON s.id = e.student_id
WHERE s.activo = true
GROUP BY s.id, s.nombre_completo, s.instrumento_principal, s.instrumento_interes;
