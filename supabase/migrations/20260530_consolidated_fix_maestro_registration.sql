-- Migration: Consolidated Fix for Maestro Registration and Linking
-- Redefines the trigger function public.handle_profile_insert_maestro() to:
-- 1. Correctly extract the 'instrumento' field from the newly registered user's raw metadata.
-- 2. Check if a maestro already exists in public.maestros with the same email address.
-- 3. If a pre-existing maestro exists (even with user_id IS NULL), link the new user_id to it, preventing duplicate key violations on the UNIQUE 'correo' column.
-- 4. If no pre-existing maestro exists, insert a brand new record cleanly.

CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
RETURNS TRIGGER AS $$
DECLARE
  v_instrumento TEXT;
  v_maestro_id UUID;
BEGIN
  IF NEW.rol = 'maestro' THEN
    -- 1. Extraer el instrumento desde los metadatos de auth.users del registro
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
      -- 3. Si el maestro ya existe (por ejemplo, Manuel Marcano pre-existente), 
      -- enlazamos su cuenta asociándole el nuevo user_id en vez de insertar uno nuevo.
      UPDATE public.maestros
      SET user_id = NEW.id,
          especialidad = COALESCE(v_instrumento, especialidad, 'Violín'),
          activo = true
      WHERE id = v_maestro_id;
      
      RAISE NOTICE 'Maestro preexistente con ID % enlazado al nuevo user_id %', v_maestro_id, NEW.id;
    ELSE
      -- 4. Si es un maestro totalmente nuevo, lo insertamos limpiamente
      INSERT INTO public.maestros (user_id, nombre_completo, correo, especialidad, activo)
      VALUES (NEW.id, NEW.nombre_completo, NEW.email, COALESCE(v_instrumento, 'Violín'), true)
      ON CONFLICT (user_id) DO UPDATE 
      SET nombre_completo = EXCLUDED.nombre_completo,
          correo = EXCLUDED.correo,
          especialidad = COALESCE(v_instrumento, public.maestros.especialidad);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_profile_insert_maestro()
IS 'Trigger function: consolidated and robust linking or creation of maestros upon profile insertion.';
