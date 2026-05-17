-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  DEPRECATED — See 20260517_auth_rls_fix.sql for the replacement      ║
-- ║  This trigger created profiles FROM maestros (maestros → profiles).  ║
-- ║  The correct flow is profiles → maestros (auth.users → profiles →   ║
-- ║  maestros). The replacement trigger on_profile_insert_maestro in     ║
-- ║  20260517_auth_rls_fix.sql reverses this direction.                  ║
-- ║  This file is kept for historical reference only.                    ║
-- ║  The actual trigger and function are DROPPED in the new migration.   ║
-- ╚═══════════════════════════════════════════════════════════════════════╝
-- Migration: 20260513_auto_create_profile_for_maestro.sql
-- Crea automáticamente un registro en 'profiles' cuando se inserta un maestro con user_id
-- Soluciona el error FK en push_subscriptions: "Key is not present in table profiles"
-- DEPRECATED: Use the new trigger on_profile_insert_maestro instead

CREATE OR REPLACE FUNCTION public.create_profile_for_maestro()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear si user_id existe y no hay profile previo
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, nombre_completo, rol)
    VALUES (NEW.user_id, NEW.correo, NEW.nombre_completo, 'maestro')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger previo si existe
DROP TRIGGER IF EXISTS trigger_auto_profile_maestro ON public.maestros;

-- Crear trigger AFTER INSERT
CREATE TRIGGER trigger_auto_profile_maestro
  AFTER INSERT ON public.maestros
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_maestro();

-- También ejecutar para los maestros ya existentes sin profile
INSERT INTO public.profiles (id, email, nombre_completo, rol)
SELECT m.user_id, m.correo, m.nombre_completo, 'maestro'
FROM public.maestros m
WHERE m.user_id IS NOT NULL
ON CONFLICT (id) DO NOTHING;
