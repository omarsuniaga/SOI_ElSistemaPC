-- Cierra la fuga de secretos en system_config sin romper la lectura de config
-- no-sensible que necesitan los maestros. Aplicada en producción vía MCP el 2026-06-25.
--
-- Antes: policies con qual=true para 'authenticated' permitían a CUALQUIER usuario
-- logueado leer groq_api_key, openrouter_api_key, vapid_private_key, admin_invite_code.
-- Las API keys además se migraron a Edge Function secrets (ver groq-proxy).

drop policy if exists "Allow read system_config" on public.system_config;
drop policy if exists "Allow update system_config" on public.system_config;
drop policy if exists "system_config_select_admin" on public.system_config;
drop policy if exists "system_config_update_admin" on public.system_config;
drop policy if exists "system_config_insert_admin" on public.system_config;

drop policy if exists "system_config_public_keys_read" on public.system_config;
create policy "system_config_public_keys_read" on public.system_config
  for select to authenticated
  using (
    key not in ('groq_api_key','openrouter_api_key','vapid_private_key','admin_invite_code')
  );

delete from public.system_config where key in ('groq_api_key','openrouter_api_key');
