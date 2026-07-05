-- RLS policy: allow ACM/admin to UPDATE route_versions (publish/return maestro proposals)
-- Critical fix for curriculo-tres-planos SDD
-- Enables: propuestasApi.publicarPropuesta(), devolverPropuesta()

CREATE POLICY "route_versions_admin_update_propuesta" ON public.route_versions
  FOR UPDATE
  USING (public.es_admin())
  WITH CHECK (public.es_admin());
