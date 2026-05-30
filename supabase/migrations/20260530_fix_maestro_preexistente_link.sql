-- Migration: Fix pre-existing maestro linking during PWA registration.
-- If a maestro already exists in the public.maestros table (loaded manually or seeded by sheet)
-- with the same email, but user_id IS NULL, we must update the existing record with the new NEW.id (user_id)
-- instead of trying to insert a duplicate, which violates the UNIQUE constraint on public.maestros.correo.

CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
RETURNS TRIGGER AS $$
DECLARE
  v_instrumento TEXT;
  v_maestro_id UUID;
BEGIN
  IF NEW.rol = 'maestro' THEN
    -- 1. Intentar extraer el instrumento desde los metadatos de auth.users del registro
    SELECT COALESCE(raw_user_meta_data->>'instrumento', 'Violín')
    INTO v_instrumento
    FROM auth.users
    WHERE id = NEW.id;

    -- 2. Verificar si ya existe un maestro registrado con ese mismo correo electrónico
    SELECT id INTO v_maestro_id
    FROM public.maestros
    WHERE LOWER(correo) = LOWER(NEW.email)
    LIMIT 1;

    IF v_maestro_id IS NOT NULL THEN
      -- 3. Si el maestro ya existe, enlazamos su cuenta asociándole el nuevo user_id
      UPDATE public.maestros
      SET user_id = NEW.id,
          especialidad = COALESCE(v_instrumento, especialidad, 'Violín'),
          activo = true
      WHERE id = v_maestro_id AND user_id IS NULL;
    ELSE
      -- 4. Si es un maestro totalmente nuevo, lo insertamos
      INSERT INTO public.maestros (user_id, nombre_completo, correo, especialidad, activo)
      VALUES (NEW.id, NEW.nombre_completo, NEW.email, COALESCE(v_instrumento, 'Violín'), true)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_profile_insert_maestro()
IS 'Trigger function: when a profile with rol=maestro is inserted, auto-create or link existing maestros row copying the instrument from auth metadata';
