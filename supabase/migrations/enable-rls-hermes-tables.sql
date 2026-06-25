-- Seguridad: cierra la exposición al anon key en 6 tablas internas de Hermes.
-- Aplicada en producción vía MCP el 2026-06-25. Versionada aquí para trazabilidad.
--
-- Contexto verificado antes de aplicar:
--   - Ni el cliente web (src/) ni las edge functions (supabase/functions) consultan estas tablas.
--   - Hermes (Ubuntu) usa service_role, que BYPASSA RLS.
--   - Los triggers (fn_hermes_*) corren como owner, también bypassan RLS.
-- Resultado: el advisor pasó de 6 alertas 'rls_disabled' (crítico) a 'rls_policy_always_true'
-- (informativo), alineado con la convención del resto de la base (using(true) para authenticated).

do $$
declare
  t text;
  tablas text[] := array[
    'alertas_log','hermes_acciones','hermes_evaluaciones',
    'hermes_feedback','hermes_notificaciones','tareas_portales'
  ];
begin
  foreach t in array tablas loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%s_authenticated_all" on public.%I;', t, t);
    execute format(
      'create policy "%s_authenticated_all" on public.%I for all to authenticated using (true) with check (true);',
      t, t
    );
  end loop;
end $$;
