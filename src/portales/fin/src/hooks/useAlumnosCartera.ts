import { useState, useEffect, useCallback } from 'react';
import { supabaseRest } from '../infrastructure/supabase/SupabaseRestClient';
import { getSupabaseConfig, checkSupabaseConnection } from '../infrastructure/supabase/SupabaseClient';
import { LocalStorageReadCacheAdapter } from '../infrastructure/cache/LocalStorageReadCacheAdapter';
import { Database } from '../infrastructure/supabase/database.types';

export type AlumnoCarteraRow = Database['public']['Views']['vw_alumno_estado_pago']['Row'];
export type CuotaRow = Database['public']['Tables']['cuotas']['Row'];

export interface AlumnosCarteraState {
  alumnos: AlumnoCarteraRow[];
  isLoading: boolean;
  isOnline: boolean;
  isReadCacheDegraded: boolean;
  lastSyncTimestamp: string | null;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  getCuotasByAlumno: (alumnoId: string) => Promise<CuotaRow[]>;
}

const cacheAdapter = new LocalStorageReadCacheAdapter();
const CACHE_KEY = 'ALUMNOS_CARTERA_READ_CACHE_V1';

export function useAlumnosCartera(): AlumnosCarteraState {
  const [alumnos, setAlumnos] = useState<AlumnoCarteraRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isReadCacheDegraded, setIsReadCacheDegraded] = useState<boolean>(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCartera = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      const cached = cacheAdapter.get<AlumnoCarteraRow[]>(CACHE_KEY);
      if (cached) {
        setAlumnos(cached);
        setIsReadCacheDegraded(true);
        setIsOnline(false);
        setErrorMessage('Supabase no está configurado en .env. Usando caché de solo lectura.');
      } else {
        setAlumnos([]);
        setIsReadCacheDegraded(false);
        setIsOnline(false);
        setErrorMessage('FAIL_CLOSED: Sin conexión a Supabase y sin caché previo.');
      }
      setIsLoading(false);
      return;
    }

    try {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error('El servidor de base de datos Supabase no respondió al chequeo de salud.');
      }

      const rows = await supabaseRest<AlumnoCarteraRow[]>(
        'vw_alumno_estado_pago?select=*&order=alumno_nombre.asc'
      );

      setAlumnos(rows || []);
      setIsOnline(true);
      setIsReadCacheDegraded(false);
      const syncTime = new Date().toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSyncTimestamp(syncTime);

      cacheAdapter.set(CACHE_KEY, rows || []);
    } catch (err: any) {
      console.error('[useAlumnosCartera Sync Error]', err);
      const cached = cacheAdapter.get<AlumnoCarteraRow[]>(CACHE_KEY);
      if (cached) {
        setAlumnos(cached);
        setIsReadCacheDegraded(true);
        setIsOnline(false);
        setErrorMessage(`Error de conexión con Supabase: ${err.message}. Mostrando caché local.`);
      } else {
        setIsReadCacheDegraded(false);
        setIsOnline(false);
        setErrorMessage(`FAIL_CLOSED: No se pudo conectar a Supabase: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCuotasByAlumno = useCallback(async (alumnoId: string): Promise<CuotaRow[]> => {
    try {
      const rows = await supabaseRest<CuotaRow[]>(
        `cuotas?alumno_id=eq.${alumnoId}&estado=in.(pendiente,vencida,en_mora)&select=*&order=fecha_vencimiento.asc`
      );
      return rows || [];
    } catch (err) {
      console.error(`[getCuotasByAlumno Error for ${alumnoId}]`, err);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchCartera();
  }, [fetchCartera]);

  return {
    alumnos,
    isLoading,
    isOnline,
    isReadCacheDegraded,
    lastSyncTimestamp,
    errorMessage,
    refresh: fetchCartera,
    getCuotasByAlumno,
  };
}
