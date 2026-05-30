-- ============================================================================
-- Migration: Fix Maestro Approval — atomic RPC with SECURITY DEFINER
-- 
-- Root cause: When admin approves a pending teacher and changes their role
-- to 'admin', the on_profile_insert_maestro trigger already ran (inserting
-- a maestros row), and auth.users.raw_user_meta_data.rol was never updated.
-- Login was fragile — it depended on fallback queries to profiles.rol.
--
-- Fix:
--   1. Creates approve_maestro_profile() — an atomic SECURITY DEFINER RPC
--      that updates profiles, auth.users (confirms email, syncs metadata),
--      cleans/or creates maestros row, and grants permissions — all in
--      one transaction.
--   2. The caller's admin role is verified INSIDE the function.
--   3. No more orphaned maestros rows when role changes to 'admin'.
-- ============================================================================

-- Drop if exists for idempotent re-runs
DROP FUNCTION IF EXISTS public.approve_maestro_profile;

CREATE OR REPLACE FUNCTION public.approve_maestro_profile(
  p_profile_id UUID,
  p_new_rol TEXT,
  p_new_estado TEXT DEFAULT 'activo'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role   TEXT;
  v_profile       RECORD;
  v_maestro_id    UUID;
BEGIN
  -- ============================================================
  -- 1. Security: only admins can call this
  -- ============================================================
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No auth context — must be called from an authenticated request'
    );
  END IF;

  SELECT rol INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: solo admins pueden aprobar usuarios'
    );
  END IF;

  -- ============================================================
  -- 2. Validate target profile exists
  -- ============================================================
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_profile_id;

  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile no encontrado'
    );
  END IF;

  -- ============================================================
  -- 3. Update profile: rol + estado
  -- ============================================================
  UPDATE public.profiles
  SET rol = p_new_rol,
      estado = p_new_estado,
      updated_at = NOW()
  WHERE id = p_profile_id;

  -- ============================================================
  -- 4. Sync auth.users: confirm email + sync metadata.rol
  --    This fixes the root cause: raw_user_meta_data.rol now
  --    matches profiles.rol, so login functions don't need
  --    fallback queries anymore.
  -- ============================================================
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
                           || jsonb_build_object('rol', p_new_rol)
  WHERE id = p_profile_id;

  -- ============================================================
  -- 5. Handle maestros row based on new role
  -- ============================================================
  IF p_new_rol = 'admin' THEN
    -- Remove orphaned maestros row (created by trigger when profile
    -- was originally inserted with rol='maestro')
    DELETE FROM public.maestros
    WHERE user_id = p_profile_id;

  ELSIF p_new_rol = 'maestro' THEN
    -- Ensure maestros row exists (in case the trigger failed silently)
    INSERT INTO public.maestros (user_id, nombre_completo, correo, activo)
    SELECT p_profile_id, v_profile.nombre_completo, v_profile.email, true
    WHERE NOT EXISTS (
      SELECT 1 FROM public.maestros WHERE user_id = p_profile_id
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- ============================================================
    -- 6. Grant default permissions for maestro
    -- ============================================================
    SELECT id INTO v_maestro_id
    FROM public.maestros
    WHERE user_id = p_profile_id;

    IF v_maestro_id IS NOT NULL THEN
      INSERT INTO public.permisos_maestros
        (maestro_id, puede_registrar_alumnos, puede_inscribir_clases, permisos)
      VALUES (
        v_maestro_id,
        true,
        true,
        ARRAY['alumnos:create', 'clases:enroll', 'registrar_alumnos', 'inscribir_clases']
      )
      ON CONFLICT (maestro_id) DO UPDATE SET
        puede_registrar_alumnos = true,
        puede_inscribir_clases = true,
        permisos = ARRAY['alumnos:create', 'clases:enroll', 'registrar_alumnos', 'inscribir_clases'];
    END IF;
  END IF;

  -- ============================================================
  -- 7. Return success
  -- ============================================================
  RETURN jsonb_build_object(
    'success', true,
    'profile_id', p_profile_id,
    'rol', p_new_rol,
    'estado', p_new_estado
  );
END;
$$;

COMMENT ON FUNCTION public.approve_maestro_profile IS
'Atomic approval of pending maestro profiles by admin. Confirms email in auth.users, syncs raw_user_meta_data.rol, creates/cleans maestros row, and grants default permissions. SECURITY DEFINER — caller must be admin.';

-- ============================================================================
-- Verification
-- ============================================================================
SELECT '✅ Migration 20260530_fix_approve_maestro_rpc applied' AS status;
