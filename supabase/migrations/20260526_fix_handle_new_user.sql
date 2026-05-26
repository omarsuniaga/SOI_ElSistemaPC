-- Fix handle_new_user trigger to properly set rol, nombre_completo, and estado
-- from raw_user_meta_data passed during signUp.
--
-- Root cause: previous version only inserted (id, email, full_name) — missing
-- rol and estado caused the entire registration→approval→login chain to fail:
--   1. rol stayed 'user' → on_profile_insert_maestro trigger never fired → no maestros row
--   2. Admin aprobacionView (queries rol='maestro' AND estado='pendiente') saw nothing
--   3. loginMaestro (queries maestros WHERE user_id) always failed

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_rol TEXT;
BEGIN
  v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'user');

  INSERT INTO public.profiles (id, email, nombre_completo, rol, estado)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_rol,
    CASE WHEN v_rol = 'maestro' THEN 'pendiente' ELSE 'activo' END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
