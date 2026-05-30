-- Migration: Fix maestro registration to correctly set their 'especialidad' (instrument) from metadata.
-- Previously, the handle_profile_insert_maestro trigger did not extract the 'instrumento' metadata field,
-- leaving the 'especialidad' column to default to 'Violín' or empty, ignoring the user's input.

CREATE OR REPLACE FUNCTION public.handle_profile_insert_maestro()
RETURNS TRIGGER AS $$
DECLARE
  v_instrumento TEXT;
BEGIN
  IF NEW.rol = 'maestro' THEN
    -- 1. Intentar extraer el instrumento desde los metadatos de auth.users del registro
    SELECT COALESCE(raw_user_meta_data->>'instrumento', 'Violín')
    INTO v_instrumento
    FROM auth.users
    WHERE id = NEW.id;

    -- 2. Insertar con el instrumento/especialidad correcto en la tabla maestros
    INSERT INTO public.maestros (user_id, nombre_completo, correo, especialidad, activo)
    VALUES (NEW.id, NEW.nombre_completo, NEW.email, COALESCE(v_instrumento, 'Violín'), true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_profile_insert_maestro()
IS 'Trigger function: when a profile with rol=maestro is inserted, auto-create a maestros row copying the instrument from auth metadata';
