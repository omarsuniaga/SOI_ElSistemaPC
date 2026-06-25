-- departamentos tenía RLS ON sin policies → bloqueaba al portal ADM (authenticated).
-- Agrega acceso para authenticated (mismo patrón del resto de la base).
-- Aplicada en producción vía MCP el 2026-06-25.

drop policy if exists "departamentos_authenticated_all" on public.departamentos;
create policy "departamentos_authenticated_all" on public.departamentos
  for all to authenticated using (true) with check (true);
