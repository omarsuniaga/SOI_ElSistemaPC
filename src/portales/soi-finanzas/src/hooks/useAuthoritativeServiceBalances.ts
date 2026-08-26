import { useCallback, useEffect, useState } from 'react';
import { AuthoritativeServiceBalance, ServiceBalanceLoadStatus } from '../types';
import { getSupabaseConfig } from '../infrastructure/supabase/SupabaseClient';
import { getValidAccessToken } from '../infrastructure/supabase/SupabaseAuthClient';
import { listAuthoritativeServiceBalances } from '../infrastructure/supabase/SupabaseServiceBalancesRepository';

export interface ServiceBalanceSyncState {
  status: ServiceBalanceLoadStatus;
  items: AuthoritativeServiceBalance[];
  errorMessage: string | null;
  isRefreshing: boolean;
  canRequestManualRefresh: boolean;
  manualRefreshOutcome: 'idle' | 'success' | 'skipped' | 'error';
  manualRefreshMessage: string | null;
  reload: () => Promise<void>;
  requestManualRefresh: () => Promise<{ success: boolean; skipped?: boolean; error?: string }>;
}

type RefreshResponse = {
  error?: string;
  results?: { success?: number; error?: number };
  account_results?: Array<{ status?: string; message?: string; retryAfterSeconds?: number }>;
};

export function useAuthoritativeServiceBalances(): ServiceBalanceSyncState {
  const [status, setStatus] = useState<ServiceBalanceLoadStatus>('loading');
  const [items, setItems] = useState<AuthoritativeServiceBalance[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualRefreshOutcome, setManualRefreshOutcome] = useState<'idle' | 'success' | 'skipped' | 'error'>('idle');
  const [manualRefreshMessage, setManualRefreshMessage] = useState<string | null>(null);
  const [manualRefreshAuthorized, setManualRefreshAuthorized] = useState(true);

  const reload = useCallback(async () => {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      setItems([]);
      setStatus('unconfigured');
      setErrorMessage('Supabase no está configurado; no se muestran balances de servicios.');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);
    try {
      const nextItems = await listAuthoritativeServiceBalances();
      setItems(nextItems);
      setStatus(nextItems.length ? 'online' : 'empty');
    } catch (error) {
      setItems([]);
      setStatus('error');
      setErrorMessage('No se pudieron consultar los balances canónicos de servicios.');
      console.warn('[FIN] Service balance dashboard query failed', error);
    }
  }, []);

  const requestManualRefresh = useCallback(async () => {
    const config = getSupabaseConfig();
    const token = await getValidAccessToken();
    if (!config.isConfigured || !token) {
      const error = 'Inicie sesión para solicitar una actualización segura.';
      setManualRefreshAuthorized(false);
      setManualRefreshOutcome('error');
      setManualRefreshMessage(error);
      return { success: false, error };
    }

    setIsRefreshing(true);
    setManualRefreshOutcome('idle');
    setManualRefreshMessage(null);
    try {
      const response = await fetch(`${config.url}/functions/v1/refresh-service-balances`, {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      const payload = await response.json().catch(() => ({})) as RefreshResponse;
      if (response.status === 401 || response.status === 403) {
        const error = payload.error || 'No tiene autorización para actualizar balances de servicios.';
        setManualRefreshAuthorized(false);
        setManualRefreshOutcome('error');
        setManualRefreshMessage(error);
        return { success: false, error };
      }
      if (response.status === 429) {
        const retryAfter = payload.account_results?.[0]?.retryAfterSeconds;
        const error = retryAfter
          ? `Este servicio se actualizó recientemente. Intente de nuevo en ${retryAfter} segundos.`
          : 'Este servicio se actualizó recientemente. Intente de nuevo más tarde.';
        setManualRefreshOutcome('skipped');
        setManualRefreshMessage(error);
        return { success: false, skipped: true, error };
      }
      if (!response.ok) {
        const error = payload.error || 'La actualización fue rechazada o no está disponible.';
        setManualRefreshOutcome('error');
        setManualRefreshMessage(error);
        return { success: false, error };
      }
      await reload();
      if ((payload.results?.error || 0) > 0) {
        const error = payload.account_results?.find((item) => item.status === 'error')?.message || 'Una o más actualizaciones no se completaron.';
        setManualRefreshOutcome('error');
        setManualRefreshMessage(error);
        return { success: false, error };
      }
      if ((payload.results?.success || 0) === 0) {
        const message = payload.account_results?.[0]?.message || 'No hay un conector de proveedor listo para actualizar.';
        setManualRefreshOutcome('skipped');
        setManualRefreshMessage(message);
        return { success: false, skipped: true, error: message };
      }
      setManualRefreshOutcome('success');
      setManualRefreshMessage('Los balances solicitados se actualizaron correctamente.');
      return { success: true };
    } catch (error) {
      console.warn('[FIN] Manual service balance refresh failed', error);
      const errorMessage = 'No se pudo solicitar la actualización segura.';
      setManualRefreshOutcome('error');
      setManualRefreshMessage(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsRefreshing(false);
    }
  }, [reload]);

  useEffect(() => {
    reload();
  }, [reload]);

  const hasReadyConnector = items.some((item) => item.refreshEnabled && item.connectorStatus === 'active');
  const canRequestManualRefresh = manualRefreshAuthorized && status === 'online' && hasReadyConnector;

  return {
    status,
    items,
    errorMessage,
    isRefreshing,
    canRequestManualRefresh,
    manualRefreshOutcome,
    manualRefreshMessage,
    reload,
    requestManualRefresh,
  };
}
