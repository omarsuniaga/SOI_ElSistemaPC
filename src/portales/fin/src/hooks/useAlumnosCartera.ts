import { useState, useEffect, useCallback } from 'react';
import { supabaseRest } from '../infrastructure/supabase/SupabaseRestClient';
import { Database } from '../infrastructure/supabase/database.types';

/**
 * Fila de vw_alumno_estado_pago — modelo de lectura de ventanilla, ya agregado
 * por alumno en la BD (una fila por alumno, contacto en cascada, saldo, semáforo).
 * NO re-agregar cuotas crudas en el cliente.
 */
export type AlumnoCarteraRow = Database['public']['Views']['vw_alumno_estado_pago']['Row'];

export type EstadoPago = 'inactivo' | 'exento' | 'mora' | 'debe' | 'al_dia';

export interface AlumnosCarteraState {
  rows: AlumnoCarteraRow[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAlumnosCartera(): AlumnosCarteraState {
  const [rows, setRows] = useState<AlumnoCarteraRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supabaseRest<AlumnoCarteraRow[]>(
        'vw_alumno_estado_pago?select=*&order=alumno_nombre.asc',
      );
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la cartera de alumnos');
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, isLoading, error, refresh: load };
}
