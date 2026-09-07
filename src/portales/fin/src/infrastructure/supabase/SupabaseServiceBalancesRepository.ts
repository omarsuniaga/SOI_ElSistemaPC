import { AuthoritativeServiceBalance } from '../../types';
import { supabaseRpc } from './SupabaseRestClient';

type ServiceBalanceDashboardRow = {
  service_account_id: string;
  provider_key: string;
  provider_name: string;
  account_name: string;
  service_type: string;
  essential: boolean;
  refresh_enabled: boolean;
  connector_status: AuthoritativeServiceBalance['connectorStatus'];
  observed_at: string | null;
  balance_centavos: number | string | null;
  amount_due_centavos: number | string | null;
  due_date: string | null;
  currency_code: string | null;
  days_remaining: number | string | null;
  last_query_at: string | null;
  last_success_at: string | null;
  last_status: AuthoritativeServiceBalance['lastStatus'] | null;
  last_error_code: string | null;
};

function nullableNumber(value: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapRow(row: ServiceBalanceDashboardRow): AuthoritativeServiceBalance {
  return {
    serviceAccountId: row.service_account_id,
    providerKey: row.provider_key,
    providerName: row.provider_name,
    accountName: row.account_name,
    serviceType: row.service_type,
    essential: Boolean(row.essential),
    refreshEnabled: Boolean(row.refresh_enabled),
    connectorStatus: row.connector_status,
    observedAt: row.observed_at,
    balanceCentavos: nullableNumber(row.balance_centavos),
    amountDueCentavos: nullableNumber(row.amount_due_centavos),
    dueDate: row.due_date,
    currencyCode: row.currency_code || 'DOP',
    daysRemaining: nullableNumber(row.days_remaining),
    lastQueryAt: row.last_query_at,
    lastSuccessAt: row.last_success_at,
    lastStatus: row.last_status || 'never',
    lastErrorCode: row.last_error_code,
  };
}

export async function listAuthoritativeServiceBalances(): Promise<AuthoritativeServiceBalance[]> {
  const rows = await supabaseRpc<ServiceBalanceDashboardRow[]>('fn_fin_service_dashboard', {});
  return (rows || []).map(mapRow);
}
