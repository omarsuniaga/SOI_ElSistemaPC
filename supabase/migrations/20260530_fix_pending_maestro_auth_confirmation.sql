-- Migration: Let admin approval, not email confirmation, control teacher access.
--
-- Supabase Auth blocks sign-in with "Email not confirmed" before the app can
-- check profiles.estado. For this portal, the real gate is manual admin
-- approval: profiles.estado = pendiente/activo/rechazado.
--
-- This confirms maestro auth users at signup so they can reach the pending
-- approval flow, while login code still blocks non-active profiles.

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

  IF v_rol = 'maestro' THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

UPDATE auth.users AS u
SET email_confirmed_at = COALESCE(u.email_confirmed_at, NOW())
FROM public.profiles AS p
WHERE p.id = u.id
  AND p.rol = 'maestro'
  AND p.estado = 'pendiente'
  AND u.email_confirmed_at IS NULL;
