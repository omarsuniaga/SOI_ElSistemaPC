-- Migration: 20260718_fix_maestro_signup_fallback
-- Fixes HTTP 500 error on /signup by handling schema discrepancies in public.maestros (especialidad vs instrumento_principal).
-- Provides dynamic PL/pgSQL try-catch blocks to write to either column depending on schema configuration.

CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
RETURNS TRIGGER AS $$
DECLARE
  v_instrumento TEXT;
  v_resena TEXT;
  v_maestro_id UUID;
BEGIN
  IF NEW.rol = 'maestro' THEN
    SELECT
      NULLIF(raw_user_meta_data->>'instrumento', ''),
      NULLIF(raw_user_meta_data->>'resena', '')
    INTO v_instrumento, v_resena
    FROM auth.users
    WHERE id = NEW.id;

    SELECT id INTO v_maestro_id
    FROM public.maestros
    WHERE LOWER(correo) = LOWER(NEW.email)
    LIMIT 1;

    BEGIN
      -- 1. Intentar con la columna instrumento_principal
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
            resena = COALESCE(v_resena, public.maestros.resena);
      END IF;
    EXCEPTION WHEN undefined_column THEN
      -- 2. Fallback a la columna especialidad si instrumento_principal no existe
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
            resena = COALESCE(v_resena, public.maestros.resena);
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_profile_insert_maestro()
IS 'Trigger function: links or creates maestros upon profile insertion. Tolerant to column name mismatches (especialidad vs instrumento_principal).';

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
  v_caller_role TEXT;
  v_profile RECORD;
  v_maestro_id UUID;
  v_instrumento TEXT;
  v_resena TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No auth context — must be called from an authenticated request'
    );
  END IF;

  SELECT rol INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role NOT IN (
    'admin',
    'superadmin',
    'direccion',
    'coordinacion_academica'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: solo roles administrativos pueden aprobar usuarios'
    );
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_profile_id;

  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile no encontrado'
    );
  END IF;

  SELECT
    NULLIF(raw_user_meta_data->>'instrumento', ''),
    NULLIF(raw_user_meta_data->>'resena', '')
  INTO v_instrumento, v_resena
  FROM auth.users
  WHERE id = p_profile_id;

  UPDATE public.profiles
  SET rol = p_new_rol,
      estado = p_new_estado,
      updated_at = NOW()
  WHERE id = p_profile_id;

  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
                           || jsonb_build_object('rol', p_new_rol)
  WHERE id = p_profile_id;

  IF p_new_rol = 'admin' THEN
    DELETE FROM public.maestros
    WHERE user_id = p_profile_id;

  ELSIF p_new_rol = 'maestro' THEN
    BEGIN
      -- 1. Intentar con la columna instrumento_principal
      INSERT INTO public.maestros (
        user_id,
        nombre_completo,
        correo,
        instrumento_principal,
        resena,
        activo
      )
      VALUES (
        p_profile_id,
        v_profile.nombre_completo,
        v_profile.email,
        COALESCE(v_instrumento, ''),
        v_resena,
        true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        correo = EXCLUDED.correo,
        instrumento_principal = COALESCE(v_instrumento, public.maestros.instrumento_principal),
        resena = COALESCE(v_resena, public.maestros.resena),
        activo = true;
    EXCEPTION WHEN undefined_column THEN
      -- 2. Fallback a la columna especialidad si instrumento_principal no existe
      INSERT INTO public.maestros (
        user_id,
        nombre_completo,
        correo,
        especialidad,
        resena,
        activo
      )
      VALUES (
        p_profile_id,
        v_profile.nombre_completo,
        v_profile.email,
        COALESCE(v_instrumento, ''),
        v_resena,
        true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        correo = EXCLUDED.correo,
        especialidad = COALESCE(v_instrumento, public.maestros.especialidad),
        resena = COALESCE(v_resena, public.maestros.resena),
        activo = true;
    END;

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

  RETURN jsonb_build_object(
    'success', true,
    'profile_id', p_profile_id,
    'rol', p_new_rol,
    'estado', p_new_estado
  );
END;
$$;

COMMENT ON FUNCTION public.approve_maestro_profile IS
'Atomic approval of pending profiles by admin. Tolerant to column name mismatches (especialidad vs instrumento_principal).';
