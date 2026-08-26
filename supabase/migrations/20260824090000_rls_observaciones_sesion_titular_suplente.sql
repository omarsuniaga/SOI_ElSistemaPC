-- Cierra un agujero real: observaciones_sesion quedó con las policies
-- originales de 20260507_create_observaciones_sesion.sql (obs_insert_all,
-- obs_select_all, obs_update_all, todas con USING/WITH CHECK (true)) sin
-- reemplazar nunca por el patrón maestro_en_clase() que ya usa el resto de
-- las tablas de sesión (asistencias, contenidos_sesion) desde
-- 20260518_rls_strict_membership.sql. Hoy cualquier usuario autenticado
-- puede leer o escribir la observación de CUALQUIER sesión de CUALQUIER
-- clase, no solo la propia.
--
-- Esto también es un prerequisito funcional del feature de suplencias con
-- sesión compartida: una vez que sesiones_clase/observaciones_sesion se
-- guardan siempre bajo el maestro_id del TITULAR (ver
-- src/portal-maestros/SPEC_suplencias_auditoria.md §4.3), la policy vieja
-- de "Maestros ven observaciones de sus sesiones" (que comparaba
-- maestro_id = maestro_actual() directo, sin reconocer al suplente) hubiera
-- bloqueado al suplente en cuanto alguien revocara las policies permisivas
-- por separado. Se resuelve todo de una vez, con el mismo patrón que ya usa
-- el resto del esquema.

DROP POLICY IF EXISTS "obs_insert_all" ON public.observaciones_sesion;
DROP POLICY IF EXISTS "obs_select_all" ON public.observaciones_sesion;
DROP POLICY IF EXISTS "obs_update_all" ON public.observaciones_sesion;
DROP POLICY IF EXISTS "obs_delete_drafts" ON public.observaciones_sesion;
DROP POLICY IF EXISTS "Maestros ven observaciones de sus sesiones" ON public.observaciones_sesion;

-- Se deja "observaciones_sesion_admin_read" (es_admin()) intacta: administración
-- necesita seguir pudiendo leer el contenido de clase para reportes.

CREATE POLICY "Maestros gestionan observaciones de sus sesiones" ON public.observaciones_sesion
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = observaciones_sesion.sesion_id
    AND (s.maestro_id = public.maestro_actual() OR public.maestro_en_clase(s.clase_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sesiones_clase s
    WHERE s.id = observaciones_sesion.sesion_id
    AND (s.maestro_id = public.maestro_actual() OR public.maestro_en_clase(s.clase_id))
  )
);
