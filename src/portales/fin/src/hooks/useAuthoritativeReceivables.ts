import { useState, useEffect, useCallback } from 'react';
import { Familia, Alumno, Cuota, Pago, Representante } from '../types';
import { supabaseRest } from '../infrastructure/supabase/SupabaseRestClient';
import { getSupabaseConfig, checkSupabaseConnection } from '../infrastructure/supabase/SupabaseClient';
import { LocalStorageReadCacheAdapter } from '../infrastructure/cache/LocalStorageReadCacheAdapter';
import { Database } from '../infrastructure/supabase/database.types';

type FamiliaRow = Database['public']['Tables']['familias']['Row'];
type AlumnoRow = Database['public']['Tables']['alumnos']['Row'];
type CuotaRow = Database['public']['Tables']['cuotas']['Row'];
type PagoRow = Database['public']['Tables']['pagos']['Row'];

export interface ReceivablesSyncState {
  familias: Familia[];
  alumnos: Alumno[];
  representantes: Representante[];
  cuotas: Cuota[];
  pagos: Pago[];
  isLoading: boolean;
  isAuthoritativeOnline: boolean;
  isReadCacheDegraded: boolean;
  lastSyncTimestamp: string | null;
  errorMessage: string | null;
  refreshFromSupabase: () => Promise<void>;
}

const cacheAdapter = new LocalStorageReadCacheAdapter();
const CACHE_KEY = 'RECEIVABLES_READ_CACHE_V1';

export function useAuthoritativeReceivables(): ReceivablesSyncState {
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthoritativeOnline, setIsAuthoritativeOnline] = useState<boolean>(false);
  const [isReadCacheDegraded, setIsReadCacheDegraded] = useState<boolean>(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAuthoritativeData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      // Degraded read-cache mode only
      const cached = await cacheAdapter.get<any>(CACHE_KEY);
      if (cached) {
        setFamilias(cached.familias || []);
        setAlumnos(cached.alumnos || []);
        setRepresentantes(cached.representantes || []);
        setCuotas(cached.cuotas || []);
        setPagos(cached.pagos || []);
        setIsReadCacheDegraded(true);
        setIsAuthoritativeOnline(false);
        setErrorMessage('Supabase no está configurado en .env. Usando caché de solo lectura.');
      } else {
        setFamilias([]);
        setAlumnos([]);
        setRepresentantes([]);
        setCuotas([]);
        setPagos([]);
        setIsReadCacheDegraded(false);
        setIsAuthoritativeOnline(false);
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

      // Fetch Real Authoritative Entities concurrently with pagination/limits
      const [fRows, aRows, cRows, pRows] = await Promise.all([
        supabaseRest<FamiliaRow[]>('familias?select=*&order=nombre_familia.asc&limit=300'),
        supabaseRest<AlumnoRow[]>('alumnos?select=*&limit=500'),
        supabaseRest<CuotaRow[]>('cuotas?select=*&order=fecha_vencimiento.desc&limit=500'),
        supabaseRest<PagoRow[]>('pagos?select=*&order=created_at.desc&limit=300')
      ]);

      // Map Alumnos to Canonical Domain Model
      const domainAlumnos: Alumno[] = aRows.map(a => ({
        id: a.id || '',
        nombre_completo: a.nombre_completo || 'Estudiante',
        instrumento_principal: a.instrumento_principal || 'Violín',
        nivel: (a.nivel as any) || 'Iniciación',
        familia_id: a.familia_id || '',
        fecha_ingreso: a.fecha_ingreso || '2026-01-15',
        exento_mensualidad: Boolean(a.acepta_beca_4500),
        activo: a.activo ?? true,
        mora_flag: Boolean(a.mora_flag),
        representante_nombre: a.representante_nombre || undefined,
        representante_cedula: a.representante_cedula || undefined,
        representante_tlf: a.representante_tlf || undefined,
        correo_representante: a.correo_representante || undefined,
      }));

      // Index Alumnos by Familia
      const alumnosByFamilia = new Map<string, Alumno[]>();
      const repsByFamilia = new Map<string, Representante>();

      for (const al of aRows) {
        if (al.familia_id) {
          const domAl = domainAlumnos.find(d => d.id === al.id);
          if (domAl) {
            const list = alumnosByFamilia.get(al.familia_id) || [];
            list.push(domAl);
            alumnosByFamilia.set(al.familia_id, list);
          }

          if (!repsByFamilia.has(al.familia_id) && al.representante_nombre) {
            repsByFamilia.set(al.familia_id, {
              id: `rep-${al.id?.slice(0, 8)}`,
              familia_id: al.familia_id,
              nombre_completo: al.representante_nombre || 'Representante Legal',
              cedula: al.representante_cedula || '402-0000000-0',
              telefono: al.representante_tlf || '+18095550000',
              email: al.correo_representante || 'representante@elsistema-pc.org',
              parentesco: (al.representante_parentesco as any) || 'Madre'
            });
          }
        }
      }

      // Map Cuotas to Canonical Domain Model
      const domainCuotas: Cuota[] = cRows.map(c => {
        const al = domainAlumnos.find(a => a.id === c.alumno_id);
        const neto = c.monto_final_centavos || c.monto_base_centavos || 60000;
        const pagado = c.monto_pagado_centavos || 0;
        const saldo = Math.max(0, neto - pagado);
        const estado = saldo === 0 ? 'pagada' : pagado > 0 ? 'parcial' : (c.estado as any) || 'pendiente';

        return {
          id: c.id || '',
          alumno_id: c.alumno_id || '',
          alumno_nombre: al?.nombre_completo || 'Estudiante',
          representante_id: repsByFamilia.get(c.familia_id || '')?.id || 'rep-001',
          familia_id: c.familia_id || '',
          arancel_concepto: c.concepto || 'Mensualidad Musical',
          periodo: `${c.ciclo_anio || 2026}-${String(c.ciclo_mes || 8).padStart(2, '0')}`,
          ciclo_academico: `${c.ciclo_anio || 2026}-2027`,
          monto_bruto_centavos: c.monto_base_centavos || 60000,
          descuento_beca_centavos: c.descuento_centavos || 0,
          monto_neto_centavos: neto,
          monto_pagado_centavos: pagado,
          saldo_centavos: saldo,
          fecha_emision: c.fecha_generacion || '2026-08-01',
          fecha_vencimiento: c.fecha_vencimiento || '2026-08-05',
          estado,
          es_prorrateada: false,
          version: 1
        };
      });

      // Map Familias to Canonical Domain Model
      const domainFamilias: Familia[] = fRows.map(f => {
        const familyAlumnos = alumnosByFamilia.get(f.id || '') || [];
        const familyCuotas = domainCuotas.filter(c => c.familia_id === f.id);
        const rep = repsByFamilia.get(f.id || '');

        const saldoPendiente = familyCuotas
          .filter(c => c.estado === 'pendiente' || c.estado === 'parcial')
          .reduce((acc, c) => acc + c.saldo_centavos, 0);

        const hasOverdue = familyCuotas.some(c => (c.estado === 'pendiente' || c.estado === 'parcial') && new Date(c.fecha_vencimiento) < new Date());

        return {
          id: f.id || '',
          codigo_familia: `FAM-${f.id?.slice(0, 4).toUpperCase()}`,
          apellidos: f.nombre_familia || 'Familia',
          representante_id: rep?.id,
          representante_principal: rep,
          telefono_principal: rep?.telefono || '+18097176627',
          email_principal: rep?.email || 'familia@elsistema-pc.org',
          saldo_pendiente_centavos: saldoPendiente,
          credito_favor_centavos: 0,
          alumnos_ids: familyAlumnos.map(a => a.id),
          estado_cartera: saldoPendiente === 0 ? 'al_dia' : hasOverdue ? 'mora_temprana' : 'preventivo',
          consentimiento_whatsapp: true,
          opt_out_mensajeria: false,
          isp: {
            valor: saldoPendiente === 0 ? 100 : 75,
            categoria: saldoPendiente === 0 ? 'A' : 'B',
            cobertura_datos: 0.95,
            confiabilidad: 'alta',
            penalizaciones: 0,
            desglose: [],
            ventana_pago_sugerida: {
              inicio_dia: 1,
              fin_dia: 5,
              patron: 'quincenal',
              confianza: 0.9
            },
            requiere_aprobacion_humana: false
          },
          created_at: f.created_at || new Date().toISOString()
        };
      });

      // Map Pagos to Canonical Domain Model
      const domainPagos: Pago[] = pRows.map(p => {
        const f = domainFamilias.find(fam => fam.id === p.familia_id);
        return {
          id: p.id || '',
          numero_recibo: p.referencia || `REC-${p.id?.slice(0, 8).toUpperCase()}`,
          familia_id: p.familia_id || '',
          familia_nombre: f?.apellidos || 'Familia',
          representante_id: f?.representante_id,
          representante_nombre: f?.representante_principal?.nombre_completo || 'Representante Legal',
          monto_total_centavos: p.monto_centavos || 0,
          credito_generado_centavos: 0,
          fecha_pago: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          fecha_registro: p.created_at || new Date().toISOString(),
          metodo_pago: (p.metodo_pago as any) || 'efectivo',
          referencia_bancaria: p.referencia || undefined,
          estado: 'confirmado',
          registrado_por: p.cajero_id || 'cajero-principal',
          registrado_por_nombre: 'Cajero Principal',
          aplicaciones: [],
          observaciones: p.notas || undefined,
          comprobante_url: p.recibo_url || undefined
        };
      });

      const allReps = Array.from(repsByFamilia.values());

      setFamilias(domainFamilias);
      setAlumnos(domainAlumnos);
      setRepresentantes(allReps);
      setCuotas(domainCuotas);
      setPagos(domainPagos);

      setIsAuthoritativeOnline(true);
      setIsReadCacheDegraded(false);
      const syncTime = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTimestamp(syncTime);

      // Save to local cache purely as a read cache (safe fallback)
      await cacheAdapter.set(CACHE_KEY, {
        familias: domainFamilias,
        alumnos: domainAlumnos,
        representantes: allReps,
        cuotas: domainCuotas,
        pagos: domainPagos,
        cachedAt: new Date().toISOString()
      });

    } catch (err: any) {
      console.error('[Supabase Receivables Sync Error]', err);
      // Fallback to read cache if Supabase is down
      const cached = await cacheAdapter.get<any>(CACHE_KEY);
      if (cached) {
        setFamilias(cached.familias || []);
        setAlumnos(cached.alumnos || []);
        setRepresentantes(cached.representantes || []);
        setCuotas(cached.cuotas || []);
        setPagos(cached.pagos || []);
        setIsReadCacheDegraded(true);
        setIsAuthoritativeOnline(false);
        setErrorMessage(`Error de conexión con Supabase: ${err.message}. Mostrando caché local de solo lectura.`);
      } else {
        setIsReadCacheDegraded(false);
        setIsAuthoritativeOnline(false);
        setErrorMessage(`FAIL_CLOSED: No se pudo conectar a Supabase: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthoritativeData();
  }, [fetchAuthoritativeData]);

  return {
    familias,
    alumnos,
    representantes,
    cuotas,
    pagos,
    isLoading,
    isAuthoritativeOnline,
    isReadCacheDegraded,
    lastSyncTimestamp,
    errorMessage,
    refreshFromSupabase: fetchAuthoritativeData
  };
}
