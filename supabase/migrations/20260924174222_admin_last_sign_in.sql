-- Gestión de Usuarios muestra la última conexión de cada cuenta. Ese dato
-- vive en auth.users, que el cliente no puede leer: esta función lo expone
-- solo a admin/superadmin y solo esas dos columnas.
CREATE OR REPLACE FUNCTION public.admin_last_sign_in()
RETURNS TABLE (id uuid, last_sign_in_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.rol IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Solo administradores' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY SELECT u.id, u.last_sign_in_at FROM auth.users u;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_last_sign_in() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_last_sign_in() TO authenticated;
