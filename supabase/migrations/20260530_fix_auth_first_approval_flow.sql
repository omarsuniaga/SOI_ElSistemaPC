-- Migration: Keep registration auth-first and create maestros only after approval.
--
-- Registration must create an auth.users row and a pending profile. The admin
-- approval step decides whether the user becomes an admin or a maestro. Because
-- of that, pending registrations should not be created in public.maestros; that
-- table represents approved teachers.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS solicitud_instrumento TEXT,
  ADD COLUMN IF NOT EXISTS solicitud_resena TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_rol TEXT;
BEGIN
  v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'user');

  INSERT INTO public.profiles (
    id,
    email,
    nombre_completo,
    rol,
    estado,
    solicitud_instrumento,
    solicitud_resena
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

UPDATE public.profiles AS p
SET solicitud_instrumento = COALESCE(p.solicitud_instrumento, NULLIF(u.raw_user_meta_data->>'instrumento', '')),
    solicitud_resena = COALESCE(p.solicitud_resena, NULLIF(u.raw_user_meta_data->>'resena', '')),
    updated_at = NOW()
FROM auth.users AS u
WHERE p.id = u.id
  AND (
    p.solicitud_instrumento IS NULL
    OR p.solicitud_resena IS NULL
  );

CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
RETURNS TRIGGER AS $$
BEGIN
  -- Maestro records are created only by public.approve_maestro_profile().
  -- A pending registration is an auth.users + profiles row until an admin
  -- chooses the final role.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_profile_insert_maestro()
IS 'No-op compatibility trigger: pending registrations stay in profiles until admin approval creates maestros.';

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
      'error', 'No auth context ? must be called from an authenticated request'
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

  IF p_new_rol NOT IN ('admin', 'maestro') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rol de aprobaci?n inv?lido'
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
    COALESCE(v_profile.solicitud_instrumento, NULLIF(raw_user_meta_data->>'instrumento', '')),
    COALESCE(v_profile.solicitud_resena, NULLIF(raw_user_meta_data->>'resena', ''))
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
'Atomic approval of pending profiles by institutional admin roles. Confirms email, syncs metadata role, creates maestros only when final role is maestro, and grants default permissions.';
