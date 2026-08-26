-- Cierra brechas de RLS abierto detectadas en auditoria de deuda de esquema (2026-08-20).
--
-- hermes_whatsapp_queue / hermes_whatsapp_config: policy "allow_all_*" con
-- USING(true) WITH CHECK(true) permite que cualquier usuario autenticado
-- escriba directo en la cola, saltandose fn_hermes_aprobar_whatsapp /
-- fn_hermes_rechazar_whatsapp (creadas hoy en 20260820000000_r6_requiere_aprobacion.sql).
--
-- whatsapp_webhook_log: misma policy pero SIN clausula TO -> default PUBLIC,
-- es decir alcanzable incluso por el rol anon.
--
-- plantillas_planificacion: 20260729040000_create_plantillas_planificacion.sql
-- agrego policies "TO public USING(true)" que conviven con las policies
-- admin/coordinador de 20260605000004_create_plantillas_planificacion.sql
-- (CREATE TABLE IF NOT EXISTS fue no-op porque la tabla ya existia), dejando
-- INSERT/UPDATE publico sobre plantillas de planificacion.
--
-- Esta migracion NO se aplica automaticamente: debe correrse manualmente via
-- Supabase SQL Editor o `supabase db push`, igual que el resto de migraciones
-- pendientes (ver tarea de desfase schema_migrations).

BEGIN;

-- hermes_whatsapp_queue: lectura amplia a autenticados, escritura solo via
-- RPC SECURITY DEFINER (fn_hermes_aprobar_whatsapp / fn_hermes_rechazar_whatsapp,
-- que corren con privilegios del owner y no dependen de esta policy) o
-- via service_role (dispatcher backend / fn_whatsapp_reclamar_pendientes).
DROP POLICY IF EXISTS allow_all_wa_queue ON public.hermes_whatsapp_queue;

CREATE POLICY wa_queue_read_authenticated ON public.hermes_whatsapp_queue
  FOR SELECT TO authenticated USING (true);

CREATE POLICY wa_queue_service_role_all ON public.hermes_whatsapp_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE INSERT, UPDATE, DELETE ON public.hermes_whatsapp_queue FROM authenticated;
REVOKE ALL ON public.hermes_whatsapp_queue FROM anon;

-- hermes_whatsapp_config: contiene configuracion/credenciales del canal -> solo admin.
DROP POLICY IF EXISTS allow_all_wa_config ON public.hermes_whatsapp_config;

CREATE POLICY wa_config_admin_all ON public.hermes_whatsapp_config
  FOR ALL TO authenticated USING (es_admin()) WITH CHECK (es_admin());

CREATE POLICY wa_config_service_role_all ON public.hermes_whatsapp_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON public.hermes_whatsapp_config FROM anon;

-- whatsapp_webhook_log: contiene numeros de telefono y texto de mensajes.
-- Sin clausula TO quedaba abierta a PUBLIC (incluye anon).
DROP POLICY IF EXISTS allow_all_webhook_log ON public.whatsapp_webhook_log;

CREATE POLICY webhook_log_admin_read ON public.whatsapp_webhook_log
  FOR SELECT TO authenticated USING (es_admin());

CREATE POLICY webhook_log_service_role_all ON public.whatsapp_webhook_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON public.whatsapp_webhook_log FROM anon, authenticated;
GRANT SELECT ON public.whatsapp_webhook_log TO authenticated;

-- plantillas_planificacion: elimina las policies "_all" (TO public, USING true)
-- introducidas por 20260729040000, dejando vigentes las policies de
-- 20260605000004 (lectura activo=true a authenticated, escritura admin/coordinador).
DROP POLICY IF EXISTS plantillas_planificacion_read_all ON public.plantillas_planificacion;
DROP POLICY IF EXISTS plantillas_planificacion_insert_all ON public.plantillas_planificacion;
DROP POLICY IF EXISTS plantillas_planificacion_update_all ON public.plantillas_planificacion;

REVOKE ALL ON public.plantillas_planificacion FROM anon;

COMMIT;
