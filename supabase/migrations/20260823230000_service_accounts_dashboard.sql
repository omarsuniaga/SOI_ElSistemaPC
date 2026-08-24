-- Migration: 20260823230000_service_accounts_dashboard.sql
-- Description: Backend real (antes inexistente) para el panel de balances
-- de servicios/cuentas de "Mi Día" en /soi-finanzas.
--
-- `useAuthoritativeServiceBalances.ts` llamaba a `public.fn_fin_service_dashboard()`,
-- que nunca existió (404 PGRST202 en consola). No había ninguna tabla de
-- soporte (`service_accounts`, observaciones, etc.) ni el edge function
-- `refresh-service-balances` (tampoco existe todavía). Esta migración crea
-- el esquema mínimo real y la función — hoy vacíos, sin datos inventados.
--
-- Lo que NO se construye aquí (fuera de alcance, requiere integraciones
-- externas reales con bancos/proveedores de servicios, no se puede fabricar):
-- el edge function `refresh-service-balances` y cualquier conector real
-- (bancario, eléctrico, etc.). El botón de actualización manual en el
-- frontend ya se oculta solo cuando no hay ninguna cuenta con
-- `refresh_enabled=true` y `connector_status='active'` — que es el caso
-- hasta que alguien registre cuentas reales y conecte un proveedor.
--
-- Aplicada en vivo vía execute_sql (mismo patrón de varias migraciones
-- recientes del repo, no aparece en `supabase migration list`).

CREATE TABLE public.service_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text NOT NULL,
  provider_name text NOT NULL,
  account_name text NOT NULL,
  service_type text NOT NULL,
  essential boolean NOT NULL DEFAULT false,
  refresh_enabled boolean NOT NULL DEFAULT false,
  connector_status text NOT NULL DEFAULT 'unconfigured' CHECK (connector_status IN ('unconfigured','active','disabled','unsupported')),
  currency_code text NOT NULL DEFAULT 'DOP',
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

CREATE TABLE public.service_account_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_account_id uuid NOT NULL REFERENCES public.service_accounts(id) ON DELETE CASCADE,
  observed_at timestamptz NOT NULL DEFAULT now(),
  balance_centavos bigint,
  amount_due_centavos bigint,
  due_date date,
  days_remaining integer,
  last_query_at timestamptz,
  last_success_at timestamptz,
  last_status text NOT NULL DEFAULT 'never' CHECK (last_status IN ('never','success','unsupported','skipped','error')),
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_account_observations_account ON public.service_account_observations(service_account_id, observed_at DESC);

ALTER TABLE public.service_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_account_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY service_accounts_select_finanzas_admin
  ON public.service_accounts FOR SELECT
  USING (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE POLICY service_accounts_insert_finanzas_admin
  ON public.service_accounts FOR INSERT
  WITH CHECK (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE POLICY service_accounts_update_admin
  ON public.service_accounts FOR UPDATE
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY service_account_observations_select_finanzas_admin
  ON public.service_account_observations FOR SELECT
  USING (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE POLICY service_account_observations_insert_finanzas_admin
  ON public.service_account_observations FOR INSERT
  WITH CHECK (get_user_role() = ANY (ARRAY['finanzas','admin']));

CREATE OR REPLACE FUNCTION public.fn_fin_service_dashboard()
 RETURNS TABLE (
   service_account_id uuid,
   provider_key text,
   provider_name text,
   account_name text,
   service_type text,
   essential boolean,
   refresh_enabled boolean,
   connector_status text,
   observed_at timestamptz,
   balance_centavos bigint,
   amount_due_centavos bigint,
   due_date date,
   currency_code text,
   days_remaining integer,
   last_query_at timestamptz,
   last_success_at timestamptz,
   last_status text,
   last_error_code text
 )
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
AS $function$
  SELECT
    sa.id,
    sa.provider_key,
    sa.provider_name,
    sa.account_name,
    sa.service_type,
    sa.essential,
    sa.refresh_enabled,
    sa.connector_status,
    latest.observed_at,
    latest.balance_centavos,
    latest.amount_due_centavos,
    latest.due_date,
    sa.currency_code,
    latest.days_remaining,
    latest.last_query_at,
    latest.last_success_at,
    coalesce(latest.last_status, 'never'),
    latest.last_error_code
  FROM public.service_accounts sa
  LEFT JOIN LATERAL (
    SELECT o.*
    FROM public.service_account_observations o
    WHERE o.service_account_id = sa.id
    ORDER BY o.observed_at DESC
    LIMIT 1
  ) latest ON true
  WHERE sa.activo = true
  ORDER BY sa.essential DESC, sa.account_name;
$function$;

GRANT EXECUTE ON FUNCTION public.fn_fin_service_dashboard() TO authenticated;
