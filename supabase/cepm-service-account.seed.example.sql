-- Manual, non-deployment example. Apply only after the FIN migration is live.
-- It creates no balance snapshot and must not be placed in supabase/migrations.
INSERT INTO public.fin_service_providers (connector_key, display_name, connector_status, active)
VALUES ('cepm', 'CEPM', 'active', true)
ON CONFLICT (connector_key) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      connector_status = EXCLUDED.connector_status,
      active = EXCLUDED.active;

INSERT INTO public.fin_service_accounts (
  provider_id, display_name, external_account_ref, service_type, currency_code, essential, active, refresh_enabled
)
SELECT id, 'Energía eléctrica CEPM', 'D035044532', 'energia', 'DOP', true, true, true
FROM public.fin_service_providers
WHERE connector_key = 'cepm'
ON CONFLICT (provider_id, external_account_ref) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      active = EXCLUDED.active,
      refresh_enabled = EXCLUDED.refresh_enabled;
