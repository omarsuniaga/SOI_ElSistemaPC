-- ============================================================================
-- Migration: 20260719_fix_profiles_schema_and_triggers
-- ============================================================================
-- ROOT CAUSE: Migration 003 created profiles with (full_name, role, is_active).
-- Later migrations (20260526, 20260530, 20260718) assumed columns
-- (nombre_completo, rol, estado, solicitud_instrumento, solicitud_resena)
-- that were never created via migration. This causes handle_new_user() to fail
-- with "column does not exist" → Supabase returns HTTP 500 on /auth/v1/signup.
--
-- This migration is FULLY IDEMPOTENT — safe to run multiple times.
-- ============================================================================

-- ============================================================================
-- STEP 1: Diagnose current state (informational only)
-- ============================================================================
DO $$
DECLARE
  v_has_full_name BOOLEAN;
  v_has_nombre BOOLEAN;
  v_has_role BOOLEAN;
  v_has_rol BOOLEAN;
  v_has_is_active BOOLEAN;
  v_has_estado BOOLEAN;
  v_has_solicitud BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name')
    INTO v_has_full_name;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='nombre_completo')
    INTO v_has_nombre;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role')
    INTO v_has_role;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rol')
    INTO v_has_rol;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_active')
    INTO v_has_is_active;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='estado')
    INTO v_has_estado;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='solicitud_instrumento')
    INTO v_has_solicitud;

  RAISE NOTICE '=== PROFILES SCHEMA DIAGNOSTIC ===';
  RAISE NOTICE 'full_name: %, nombre_completo: %', v_has_full_name, v_has_nombre;
  RAISE NOTICE 'role: %, rol: %', v_has_role, v_has_rol;
  RAISE NOTICE 'is_active: %, estado: %', v_has_is_active, v_has_estado;
  RAISE NOTICE 'solicitud_instrumento: %', v_has_solicitud;
END $$;

-- ============================================================================
-- STEP 2: Rename old columns to new names (idempotent)
-- ============================================================================

-- full_name → nombre_completo
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='nombre_completo')
  THEN
    ALTER TABLE public.profiles RENAME COLUMN full_name TO nombre_completo;
    RAISE NOTICE 'RENAME: full_name → nombre_completo';
  END IF;
END $$;

-- role → rol
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rol')
  THEN
    ALTER TABLE public.profiles RENAME COLUMN role TO rol;
    RAISE NOTICE 'RENAME: role → rol';
  END IF;
END $$;

-- is_active → add 'estado' column (boolean → text with CHECK)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='estado')
  THEN
    ALTER TABLE public.profiles ADD COLUMN estado TEXT NOT NULL DEFAULT 'activo'
      CHECK (estado IN ('pendiente', 'activo', 'rechazado'));

    -- Backfill from is_active if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_active')
    THEN
      UPDATE public.profiles
      SET estado = CASE WHEN is_active THEN 'activo' ELSE 'rechazado' END;
      RAISE NOTICE 'ADDED estado column, backfilled from is_active';
    ELSE
      RAISE NOTICE 'ADDED estado column with default activo';
    END IF;
  ELSE
    RAISE NOTICE 'estado column already exists';
  END IF;
END $$;

-- Add solicitud_instrumento if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='solicitud_instrumento')
  THEN
    ALTER TABLE public.profiles ADD COLUMN solicitud_instrumento TEXT;
    RAISE NOTICE 'ADDED solicitud_instrumento';
  END IF;
END $$;

-- Add solicitud_resena if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='solicitud_resena')
  THEN
    ALTER TABLE public.profiles ADD COLUMN solicitud_resena TEXT;
    RAISE NOTICE 'ADDED solicitud_resena';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Fix CHECK constraint on rol
-- ============================================================================

-- Drop ALL possible old constraint names
DO $$
DECLARE
  v_constraint RECORD;
BEGIN
  FOR v_constraint IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%rol%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', v_constraint.conname);
    RAISE NOTICE 'Dropped constraint: %', v_constraint.conname;
  END LOOP;
END $$;

-- Add the correct CHECK constraint (if rol column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rol')
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conrelid = 'public.profiles'::regclass
         AND contype = 'c'
         AND pg_get_constraintdef(oid) LIKE '%''maestro''%'
     )
  THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_rol_check
      CHECK (rol IN (
        'superadmin', 'admin', 'direccion', 'coordinacion_academica',
        'maestro', 'monitor', 'finanzas', 'operaciones',
        'representante', 'alumno', 'jurado', 'user'
      ));
    RAISE NOTICE 'ADDED profiles_rol_check with all roles';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Recreate RLS helper functions with correct column names
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT rol::TEXT FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() IN ('admin', 'superadmin');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() = 'maestro';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.profile_is_active()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND estado = 'activo'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- STEP 5: Recreate handle_new_user() trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_rol TEXT;
BEGIN
  v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'user');

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

  -- Auto-confirm email for maestros (no SMTP needed)
  IF v_rol = 'maestro' THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user()
IS 'Creates profile on auth.users INSERT. Auto-confirms email for maestros.';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 6: Recreate on_profile_insert_maestro trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
RETURNS TRIGGER AS $$
DECLARE
  v_instrumento TEXT;
  v_resena TEXT;
  v_maestro_id UUID;
BEGIN
  IF NEW.rol = 'maestro' THEN
    -- Read instrumento/resena from auth.users metadata
    SELECT
      NULLIF(raw_user_meta_data->>'instrumento', ''),
      NULLIF(raw_user_meta_data->>'resena', '')
    INTO v_instrumento, v_resena
    FROM auth.users
    WHERE id = NEW.id;

    -- Check if a maestro row already exists for this email
    SELECT id INTO v_maestro_id
    FROM public.maestros
    WHERE LOWER(correo) = LOWER(NEW.email)
    LIMIT 1;

    BEGIN
      -- 1. Try with instrumento_principal column
      IF v_maestro_id IS NOT NULL THEN
        UPDATE public.maestros
        SET user_id = NEW.id,
            instrumento_principal = COALESCE(v_instrumento, instrumento_principal),
            resena = COALESCE(v_resena, resena),
            activo = true
        WHERE id = v_maestro_id;
      ELSE
        INSERT INTO public.maestros (user_id, nombre_completo, correo, instrumento_principal, resena, activo)
        VALUES (NEW.id, NEW.nombre_completo, NEW.email, COALESCE(v_instrumento, ''), v_resena, true)
        ON CONFLICT (user_id) DO UPDATE
        SET nombre_completo = EXCLUDED.nombre_completo,
            correo = EXCLUDED.correo,
            instrumento_principal = COALESCE(v_instrumento, public.maestros.instrumento_principal),
            resena = COALESCE(v_resena, public.maestros.resena),
            activo = true;
      END IF;
    EXCEPTION WHEN undefined_column THEN
      -- 2. Fallback: use especialidad column
      IF v_maestro_id IS NOT NULL THEN
        UPDATE public.maestros
        SET user_id = NEW.id,
            especialidad = COALESCE(v_instrumento, especialidad),
            resena = COALESCE(v_resena, resena),
            activo = true
        WHERE id = v_maestro_id;
      ELSE
        INSERT INTO public.maestros (user_id, nombre_completo, correo, especialidad, resena, activo)
        VALUES (NEW.id, NEW.nombre_completo, NEW.email, COALESCE(v_instrumento, ''), v_resena, true)
        ON CONFLICT (user_id) DO UPDATE
        SET nombre_completo = EXCLUDED.nombre_completo,
            correo = EXCLUDED.correo,
            especialidad = COALESCE(v_instrumento, public.maestros.especialidad),
            resena = COALESCE(v_resena, public.maestros.resena),
            activo = true;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_profile_insert_maestro()
IS 'Creates maestros row when profile with rol=maestro is inserted. Tolerant to column mismatches.';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_profile_insert_maestro ON public.profiles;
CREATE TRIGGER on_profile_insert_maestro
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_insert_maestro();

-- ============================================================================
-- STEP 7: Create diagnostic RPC (user can call from browser console)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.diagnose_profiles_schema()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_columns JSONB;
  v_constraints JSONB;
  v_triggers JSONB;
  v_functions JSONB;
BEGIN
  -- Columns
  SELECT jsonb_agg(jsonb_build_object(
    'column_name', column_name,
    'data_type', data_type,
    'is_nullable', is_nullable,
    'column_default', column_default
  ) ORDER BY ordinal_position)
  INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles';

  -- Check constraints
  SELECT jsonb_agg(jsonb_build_object(
    'constraint_name', conname,
    'definition', pg_get_constraintdef(oid)
  ))
  INTO v_constraints
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass AND contype = 'c';

  -- Triggers on auth.users
  SELECT jsonb_agg(jsonb_build_object(
    'trigger_name', tgname,
    'function', p.proname,
    'event', tgtype::text
  ))
  INTO v_triggers
  FROM pg_trigger t
  JOIN pg_proc p ON t.tgfoid = p.oid
  WHERE t.tgrelid = 'auth.users'::regclass
    AND NOT t.tgisinternal;

  -- Trigger functions
  SELECT jsonb_agg(jsonb_build_object(
    'function_name', p.proname,
    'owner', pg_catalog.pg_get_userbyid(p.proowner),
    'secdef', p.prosecdef
  ))
  INTO v_functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('handle_new_user', 'handle_profile_insert_maestro', 'get_user_role', 'is_admin', 'is_teacher', 'profile_is_active');

  RETURN jsonb_build_object(
    'profiles_columns', v_columns,
    'profiles_check_constraints', v_constraints,
    'auth_users_triggers', v_triggers,
    'public_functions', v_functions
  );
END;
$$;

-- ============================================================================
-- STEP 8: Verify
-- ============================================================================

DO $$
DECLARE
  v_handle_new_user_exists BOOLEAN;
  v_on_profile_trigger_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user' AND p.prosecdef
  ) INTO v_handle_new_user_exists;

  SELECT EXISTS(
    SELECT 1 FROM pg_trigger t
    WHERE t.tgrelid = 'auth.users'::regclass
      AND t.tgname = 'on_auth_user_created'
      AND NOT t.tgisinternal
  ) INTO v_on_profile_trigger_exists;

  IF v_handle_new_user_exists AND v_on_profile_trigger_exists THEN
    RAISE NOTICE '=== MIGRATION SUCCESSFUL ===';
    RAISE NOTICE 'handle_new_user() exists with SECURITY DEFINER: YES';
    RAISE NOTICE 'on_auth_user_created trigger exists: YES';
    RAISE NOTICE 'Run: SELECT public.diagnose_profiles_schema(); from browser console to verify.';
  ELSE
    RAISE WARNING '=== MIGRATION INCOMPLETE ===';
    RAISE WARNING 'handle_new_user: %, trigger: %', v_handle_new_user_exists, v_on_profile_trigger_exists;
  END IF;
END $$;
