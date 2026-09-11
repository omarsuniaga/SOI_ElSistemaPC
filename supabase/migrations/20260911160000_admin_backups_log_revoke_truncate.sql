-- Cierra un gap de permisos en admin_backups_log (creada por la migración
-- 20260911135128_admin_db_backup_feature, aplicada directo a producción,
-- fuera de este repo y del alcance del parche F0 del PR #82).
--
-- La política RLS admin_backups_log_superadmin_all (USING/WITH CHECK
-- is_super_admin()) protege SELECT/INSERT/UPDATE/DELETE correctamente, pero
-- Postgres no aplica RLS sobre TRUNCATE. El GRANT por defecto de Supabase le
-- dio TRUNCATE a anon y authenticated: cualquier usuario autenticado -- y
-- potencialmente anon, sin sesión -- podía vaciar el historial de auditoría
-- de backups sin pasar por is_super_admin(). No destructivo: solo revoca
-- privilegios, no toca filas existentes.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

REVOKE ALL ON public.admin_backups_log FROM PUBLIC, anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.admin_backups_log FROM authenticated;

COMMIT;
