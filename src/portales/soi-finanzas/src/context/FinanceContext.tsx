import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Familia,
  Representante,
  Alumno,
  Cuota,
  Pago,
  Beca,
  Patrocinador,
  Patrocinio,
  Proveedor,
  FacturaGasto,
  ServicioRecurrente,
  GastoFijo,
  GastoFijoPago,
  CategoriaGastoFijo,
  CuentaBancaria,
  TransaccionBancaria,
  PartidaPresupuestaria,
  SolicitudNecesidad,
  LineaNomina,
  ActivoInstrumento,
  ObligacionFiscal,
  AsientoContable,
  TareaInstitucional,
  UsuarioActual,
  InvarianteCheckResult,
  MetodoPago,
  CierreCaja,
  CompromisoPago,
  FichaDiagnosticoLutheria,
  ContratoComodato,
  EvaluacionPeriodoPrueba,
  AplicacionPago,
  AuthoritativeServiceBalance,
  ServiceBalanceLoadStatus
} from '../types';
import { useAuthoritativeServiceBalances } from '../hooks/useAuthoritativeServiceBalances';
import { Payment as DomainPayment } from '../domain/entities/Payment';

import { RegisterPaymentUseCase } from '../application/use-cases/receivables/RegisterPaymentUseCase';
import {
  StateBridgeFamilyRepository,
  StateBridgeFeeRepository,
  StateBridgePaymentRepository
} from '../infrastructure/repositories/StateBridgeReceivablesRepository';
import { SupabasePaymentTransactionAdapter } from '../infrastructure/supabase/SupabasePaymentTransactionAdapter';
import { LocalStorageReadCacheAdapter } from '../infrastructure/cache/LocalStorageReadCacheAdapter';
import { supabaseRest, supabaseRpc } from '../infrastructure/supabase/SupabaseRestClient';
import { getSupabaseConfig, checkSupabaseConnection } from '../infrastructure/supabase/SupabaseClient';
import { Database } from '../infrastructure/supabase/database.types';

type FamiliaRow = Database['public']['Tables']['familias']['Row'];
type AlumnoRow = Database['public']['Tables']['alumnos']['Row'];
type CuotaRow = Database['public']['Tables']['cuotas']['Row'];
type PagoRow = Database['public']['Tables']['pagos']['Row'];
type RepresentanteRow = Database['public']['Tables']['representantes']['Row'];
type AplicacionPagoRow = Database['public']['Tables']['aplicaciones_pago']['Row'];
type WalletMovimientoRow = Database['public']['Tables']['wallet_movimientos']['Row'];

interface FinanceContextType {
  currentUser: UsuarioActual;
  setCurrentUser: (user: UsuarioActual) => void;
  availableUsers: UsuarioActual[];
  periodoActivo: string; // '2026-08'
  setPeriodoActivo: (periodo: string) => void;
  
  // Data entities
  familias: Familia[];
  representantes: Representante[];
  alumnos: Alumno[];
  cuotas: Cuota[];
  pagos: Pago[];
  compromisos: CompromisoPago[];
  becas: Beca[];
  patrocinadores: Patrocinador[];
  patrocinios: Patrocinio[];
  proveedores: Proveedor[];
  gastosFijos: GastoFijo[];
  gastosFijosPagos: GastoFijoPago[];
  serviciosRecurrentes: ServicioRecurrente[];
  facturasGasto: FacturaGasto[];
  cuentasBancarias: CuentaBancaria[];
  transaccionesBancarias: TransaccionBancaria[];
  partidas: PartidaPresupuestaria[];
  solicitudesNecesidades: SolicitudNecesidad[];
  nomina: LineaNomina[];
  activos: ActivoInstrumento[];
  fichasLutheria: FichaDiagnosticoLutheria[];
  contratosComodato: ContratoComodato[];
  evaluacionesPrueba: EvaluacionPeriodoPrueba[];
  obligacionesFiscales: ObligacionFiscal[];
  asientos: AsientoContable[];
  tareas: TareaInstitucional[];
  cierresCaja: CierreCaja[];
  selectedFamiliaIdForPayment: string | null;
  setSelectedFamiliaIdForPayment: (id: string | null) => void;
  iniciarCobroFamilia: (familia_id: string, cuota_id?: string) => void;

  // Supabase Authoritative Sync State
  supabaseStatus: 'authoritative_online' | 'read_cache_degraded' | 'offline_blocked' | 'loading';
  lastSupabaseSync: string | null;
  supabaseErrorMessage: string | null;
  refreshAuthoritativeReceivables: () => Promise<ReceivablesBundle | null>;
  serviceBalanceStatus: ServiceBalanceLoadStatus;
  authoritativeServiceBalances: AuthoritativeServiceBalance[];
  serviceBalanceErrorMessage: string | null;
  serviceBalanceRefreshing: boolean;
  canRequestServiceBalanceRefresh: boolean;
  serviceBalanceRefreshOutcome: 'idle' | 'success' | 'skipped' | 'error';
  serviceBalanceRefreshMessage: string | null;
  requestServiceBalanceRefresh: () => Promise<{ success: boolean; skipped?: boolean; error?: string }>;

  // Actions
  registrarPagoTransaccional: (params: {
    familia_id: string;
    monto_total_centavos: number;
    metodo_pago: MetodoPago;
    fecha_pago: string;
    referencia?: string;
    observaciones?: string;
    cuotas_especificas_ids?: string[];
  }) => Promise<{ success: boolean; pago?: Pago; error?: string }>;

  generarCuotasMensuales: (periodo: string) => { generadas: number; omitidas: number };
  
  crearCompromisoPago: (params: {
    familia_id: string;
    representante_id: string;
    cuotas_ids: string[];
    monto_centavos: number;
    fecha_limite: string;
    acuerdo_texto: string;
  }) => void;

  aprobarBeca: (beca_id: string, aprobado: boolean) => void;
  crearSolicitudBeca: (params: {
    alumno_id: string;
    porcentaje: number;
    motivo_socioeconomico: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  aprobarFacturaGasto: (factura_id: string) => { success: boolean; error?: string };
  registrarPagoFacturaGasto: (factura_id: string, metodo: MetodoPago, referencia: string) => { success: boolean; error?: string };
  crearFacturaGasto: (params: {
    proveedor_id: string;
    proveedor_nombre: string;
    concepto: string;
    centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    partida_presupuestaria_id: string;
    monto_bruto_centavos: number;
    itbis_centavos: number;
    retencion_centavos: number;
    fecha_emision: string;
    fecha_vencimiento: string;
    numero_factura: string;
    ncf?: string;
  }) => { success: boolean; error?: string };

  crearGastoFijo: (params: {
    nombre: string;
    categoria: CategoriaGastoFijo;
    centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    monto_centavos: number;
    dia_inicio: number;
    dia_fin: number;
    repetir_mensual?: boolean;
    notas?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  registrarPagoGastoFijo: (params: {
    gasto_fijo_id: string;
    periodo_anio: number;
    periodo_mes: number;
    monto_centavos: number;
    referencia?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  generarInstanciasGastosFijosMes: (periodoAnio: number, periodoMes: number) => Promise<{ success: boolean; generadas?: number; error?: string }>;
  
  crearServicioRecurrente: (params: {
    nombre: string;
    tipo: 'energia' | 'internet' | 'alquiler' | 'otro';
    proveedor_id?: string;
    proveedor_nombre: string;
    numero_contrato_cuenta: string;
    monto_promedio_mensual_centavos: number;
    dia_vencimiento_mes: number;
    es_servicio_esencial: boolean;
  }) => void;
  registrarPagoServicioRecurrente: (params: {
    servicio_id: string;
    cuenta_bancaria_id: string;
    monto_centavos: number;
    referencia?: string;
  }) => { success: boolean; error?: string };

  crearCierreCaja: (params: {
    monto_apertura_centavos: number;
    monto_contado_centavos: number;
    motivo_diferencia?: string;
  }) => { success: boolean; cierre?: CierreCaja; error?: string };

  conciliarTransaccion: (trx_id: string, matched_entity_id?: string) => void;
  conciliarTodoAutomatico: () => { conciliadas: number };
  importarExtractoBancario: (cuenta_bancaria_id: string, transacciones: Array<{
    fecha: string;
    descripcion: string;
    referencia?: string;
    debito_centavos: number;
    credito_centavos: number;
  }>) => { agregadas: number };
  
  crearPartidaPresupuestaria: (params: {
    codigo_partida: string;
    nombre: string;
    centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    monto_anual_centavos: number;
  }) => { success: boolean; error?: string };

  trasladarPresupuesto: (params: {
    origen_id: string;
    destino_id: string;
    monto_centavos: number;
    justificacion: string;
  }) => { success: boolean; error?: string };

  crearTareaInstitucional: (params: {
    titulo: string;
    descripcion: string;
    prioridad: 'baja' | 'media' | 'alta' | 'critica';
    departamento_origen: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    departamento_destino: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    fecha_limite: string;
    categoria?: 'director' | 'hermes' | 'rutina' | 'cobranza' | 'auditoria';
    asignado_a?: string;
    vinculo_entidad_tipo?: string;
    vinculo_entidad_id?: string;
  }) => { success: boolean; tarea?: TareaInstitucional };

  actualizarEstadoTarea: (params: {
    tarea_id: string;
    nuevo_estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
    resolucion?: string;
  }) => { success: boolean };

  agregarComentarioTarea: (params: {
    tarea_id: string;
    texto: string;
  }) => { success: boolean };

  escalarTareaADireccion: (params: {
    tarea_id: string;
    justificacion: string;
  }) => { success: boolean };

  generarRutinasAutomaticas: (tipo: 'todas' | 'cierre' | 'mora' | 'backfill' | 'dgii') => { creadas: number };

  crearNuevaFamilia: (params: {
    codigo_familia: string;
    apellidos: string;
    representante_nombre: string;
    representante_cedula: string;
    representante_telefono: string;
    representante_email: string;
    alumno_nombre: string;
    instrumento: string;
    nivel: string;
  }) => { success: boolean; error?: string };

  aprobarLineaNomina: (nomina_id: string) => { success: boolean; error?: string };
  dispersarNominaDocente: (cuenta_bancaria_id?: string) => { success: boolean; dispersadas?: number; total_neto_centavos?: number; error?: string };
  
  aprobarSolicitudNecesidad: (solicitud_id: string, etapa: 'pre_aprobacion' | 'presupuesto' | 'aprobacion_final') => { success: boolean; error?: string };

  aprobarReparacionActivo: (activo_id: string, aprobado: boolean) => void;
  
  crearFichaLutheria: (params: {
    codigo_patrimonial: string;
    tipo_instrumento: string;
    marca_modelo: string;
    numero_serie: string;
    alumno_asociado_nombre?: string;
    profesor_catedra: string;
    reporte_usuario: string;
    evaluacion_luthier: string;
    clasificacion_dano: 'menor' | 'mayor' | 'critico';
    trabajos_planificados: string;
    repuestos: Array<{
      cantidad: number;
      descripcion: string;
      costo_unitario_centavos: number;
      costo_total_centavos: number;
    }>;
  }) => { success: boolean; ficha?: FichaDiagnosticoLutheria; error?: string };

  aprobarFichaLutheria: (ficha_id: string, aprobado: boolean) => { success: boolean; error?: string };

  crearContratoComodato: (params: {
    nombre_representante: string;
    nacionalidad_representante: string;
    estado_civil_representante: string;
    cedula_representante: string;
    direccion_representante: string;
    nombre_estudiante: string;
    alumno_id: string;
    tipo_instrumento: string;
    marca_modelo: string;
    numero_serie: string;
    codigo_patrimonial: string;
    valor_estimado_libros_centavos: number;
    fecha_inicio: string;
    fecha_termino: string;
  }) => { success: boolean; contrato?: ContratoComodato; error?: string };

  crearEvaluacionPeriodoPrueba: (params: {
    nombre_colaborador: string;
    puesto_trabajo: string;
    departamento: string;
    fecha_ingreso: string;
    nombre_evaluador: string;
    calif_calidad: number;
    notas_calidad: string;
    calif_asistencia: number;
    notas_asistencia: string;
    calif_equipo: number;
    notas_equipo: string;
    calif_iniciativa: number;
    notas_iniciativa: string;
    fortalezas: string;
    areas_mejora: string;
  }) => { success: boolean; evaluacion?: EvaluacionPeriodoPrueba; error?: string };
  
  completarTarea: (tarea_id: string) => void;
  
  verificarInvariantes: () => InvarianteCheckResult[];
  
  resetearDatos: () => void;
}

/**
 * Best-effort fallback only: builds a receipt-shaped Pago from the domain
 * Payment the use case constructed BEFORE calling the RPC (client-generated
 * id/receipt), for the rare case where the post-payment refresh doesn't yet
 * include the confirmed row (e.g. >300 pagos, or a slow re-fetch). The
 * transaction itself already committed successfully server-side by the time
 * this is used — this only affects what the receipt modal displays.
 */
function mapDomainPaymentToViewPago(payment: DomainPayment): Pago {
  return {
    id: payment.id,
    numero_recibo: payment.numeroRecibo,
    familia_id: payment.familiaId,
    familia_nombre: payment.familiaNombre || 'Familia',
    representante_id: payment.representanteId,
    representante_nombre: payment.representanteNombre || 'Representante Legal',
    monto_total_centavos: payment.montoTotal.cents,
    credito_generado_centavos: payment.creditoGenerado.cents,
    fecha_pago: payment.fechaPago,
    fecha_registro: payment.fechaRegistro,
    metodo_pago: payment.metodoPago as MetodoPago,
    referencia_bancaria: payment.referenciaBancaria,
    // Domain PaymentStatus includes 'anulado', which the view-level Pago type
    // doesn't model; this fallback path only runs right after a successful
    // commit, so 'anulado' can't actually occur here.
    estado: (payment.estado === 'anulado' ? 'reversado' : payment.estado),
    registrado_por: payment.registradoPor,
    registrado_por_nombre: payment.registradoPorNombre || '',
    aplicaciones: payment.aplicaciones.map((a): AplicacionPago => ({
      id: a.id,
      pago_id: a.pagoId,
      cuota_id: a.cuotaId,
      monto_aplicado_centavos: a.montoAplicado.cents,
      dias_atraso_al_aplicar: 0,
      cuota_periodo: a.periodo || '',
      cuota_concepto: a.concepto,
      alumno_nombre: a.alumnoNombre || '',
    })),
    observaciones: payment.observaciones,
    comprobante_url: payment.reciboUrl,
  };
}

interface ReceivablesBundle {
  familias: Familia[];
  alumnos: Alumno[];
  representantes: Representante[];
  cuotas: Cuota[];
  pagos: Pago[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'SOI_FINANZAS_STATE_V1';

/**
 * `saveState()` below writes each operational module (facturas, nómina,
 * presupuesto, etc. — everything that has no Supabase table yet) into this
 * key, but nothing ever read it back: the draft was lost on every reload.
 * These lazy initializers restore it so a capture at least survives a
 * refresh in the same browser — still not institutional persistence, which
 * is why DraftOnlyBanner keeps warning on those views.
 */
function readDraftState<T>(field: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && parsed[field] !== undefined ? (parsed[field] as T) : fallback;
  } catch {
    return fallback;
  }
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UsuarioActual>({
    id: 'loading',
    nombre: 'Cargando usuario...',
    email: '',
    rol: 'finanzas',
    departamento: 'FIN',
  });
  const [availableUsers, setAvailableUsers] = useState<UsuarioActual[]>([]);
  const [periodoActivo, setPeriodoActivo] = useState<string>('2026-08');

  // Core collections
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [compromisos, setCompromisos] = useState<CompromisoPago[]>([]);
  const [becas, setBecas] = useState<Beca[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [patrocinios, setPatrocinios] = useState<Patrocinio[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [gastosFijos, setGastosFijos] = useState<GastoFijo[]>([]);
  const [gastosFijosPagos, setGastosFijosPagos] = useState<GastoFijoPago[]>([]);
  const [serviciosRecurrentes, setServiciosRecurrentes] = useState<ServicioRecurrente[]>(() => readDraftState('serviciosRecurrentes', [
    {
      id: 'srv-1',
      nombre: 'Energía Eléctrica (CEPM)',
      tipo: 'energia',
      proveedor_id: 'prov-1',
      proveedor_nombre: 'Consorcio Energético Punta Cana Macao',
      numero_contrato_cuenta: 'NIC-8849201',
      monto_ultimo_facturado_centavos: 4250000,
      monto_promedio_mensual_centavos: 4250000,
      proxima_fecha_vencimiento: '2026-08-28',
      dias_restantes: 4,
      estado: 'al_dia',
      es_servicio_esencial: true
    },
    {
      id: 'srv-2',
      nombre: 'Internet & Enlace Dedicado (Claro)',
      tipo: 'internet',
      proveedor_id: 'prov-2',
      proveedor_nombre: 'Claro Dominicana',
      numero_contrato_cuenta: 'TEL-8095521000',
      monto_ultimo_facturado_centavos: 1850000,
      monto_promedio_mensual_centavos: 1850000,
      proxima_fecha_vencimiento: '2026-08-25',
      dias_restantes: 1,
      estado: 'por_vencer',
      es_servicio_esencial: true
    },
    {
      id: 'srv-3',
      nombre: 'Alquiler Sede Principal (Bávaro)',
      tipo: 'alquiler',
      proveedor_id: 'prov-3',
      proveedor_nombre: 'Inmobiliaria Punta Cana Real',
      numero_contrato_cuenta: 'CONTR-ALQ-2025-01',
      monto_ultimo_facturado_centavos: 8500000,
      monto_promedio_mensual_centavos: 8500000,
      proxima_fecha_vencimiento: '2026-09-05',
      dias_restantes: 12,
      estado: 'al_dia',
      es_servicio_esencial: true
    }
  ]));
  const [facturasGasto, setFacturasGasto] = useState<FacturaGasto[]>(() => readDraftState('facturasGasto', []));
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>(() => readDraftState('cuentasBancarias', []));
  const [transaccionesBancarias, setTransaccionesBancarias] = useState<TransaccionBancaria[]>(() => readDraftState('transaccionesBancarias', []));
  const [partidas, setPartidas] = useState<PartidaPresupuestaria[]>(() => readDraftState('partidas', []));
  const [solicitudesNecesidades, setSolicitudesNecesidades] = useState<SolicitudNecesidad[]>(() => readDraftState('solicitudesNecesidades', []));
  const [nomina, setNomina] = useState<LineaNomina[]>(() => readDraftState('nomina', []));
  const [activos, setActivos] = useState<ActivoInstrumento[]>(() => readDraftState('activos', []));
  const [fichasLutheria, setFichasLutheria] = useState<FichaDiagnosticoLutheria[]>(() => readDraftState('fichasLutheria', []));
  const [contratosComodato, setContratosComodato] = useState<ContratoComodato[]>(() => readDraftState('contratosComodato', []));
  const [evaluacionesPrueba, setEvaluacionesPrueba] = useState<EvaluacionPeriodoPrueba[]>(() => readDraftState('evaluacionesPrueba', []));
  const [obligacionesFiscales, setObligacionesFiscales] = useState<ObligacionFiscal[]>(() => readDraftState('obligacionesFiscales', []));
  const [asientos, setAsientos] = useState<AsientoContable[]>(() => readDraftState('asientos', []));
  const [tareas, setTareas] = useState<TareaInstitucional[]>(() => readDraftState('tareas', []));
  const [cierresCaja, setCierresCaja] = useState<CierreCaja[]>(() => readDraftState('cierresCaja', []));
  const [selectedFamiliaIdForPayment, setSelectedFamiliaIdForPayment] = useState<string | null>(null);

  // Supabase Authoritative Sync State
  const [supabaseStatus, setSupabaseStatus] = useState<'authoritative_online' | 'read_cache_degraded' | 'offline_blocked' | 'loading'>('loading');
  const [lastSupabaseSync, setLastSupabaseSync] = useState<string | null>(null);
  const [supabaseErrorMessage, setSupabaseErrorMessage] = useState<string | null>(null);
  const serviceBalances = useAuthoritativeServiceBalances();

  const iniciarCobroFamilia = (familia_id: string, cuota_id?: string) => {
    setSelectedFamiliaIdForPayment(familia_id);
  };

  const cacheAdapter = new LocalStorageReadCacheAdapter();
  const CACHE_RECEIVABLES_KEY = 'RECEIVABLES_READ_CACHE_V1';

  // Authoritative load function from Supabase System of Record.
  // Returns the fetched bundle so callers (e.g. a just-completed payment) can
  // use the fresh data synchronously instead of reading stale closure state.
  const refreshAuthoritativeReceivables = async (): Promise<ReceivablesBundle | null> => {
    setSupabaseStatus('loading');
    setSupabaseErrorMessage(null);

    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      // Degraded read cache fallback
      const cached = await cacheAdapter.get<any>(CACHE_RECEIVABLES_KEY);
      if (cached) {
        setFamilias(cached.familias || []);
        setAlumnos(cached.alumnos || []);
        setRepresentantes(cached.representantes || []);
        setCuotas(cached.cuotas || []);
        setPagos(cached.pagos || []);
        setSupabaseStatus('read_cache_degraded');
        setSupabaseErrorMessage('Supabase no está configurado. Usando caché de solo lectura.');
        return cached as ReceivablesBundle;
      } else {
        setSupabaseStatus('offline_blocked');
        setSupabaseErrorMessage('FAIL_CLOSED: Sin conexión a Supabase y sin caché previo.');
        return null;
      }
    }

    try {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error('El servidor de base de datos Supabase no respondió.');
      }

      // Fetch Authoritative Entities from SOI Supabase
      const [fRows, aRows, cRows, pRows, repRows, apRows, wmRows] = await Promise.all([
        supabaseRest<FamiliaRow[]>('familias?select=*&order=nombre_familia.asc&limit=300'),
        supabaseRest<AlumnoRow[]>('alumnos?select=*&limit=500'),
        supabaseRest<CuotaRow[]>('cuotas?select=*&order=fecha_vencimiento.desc&limit=500'),
        supabaseRest<PagoRow[]>('pagos?select=*&order=created_at.desc&limit=300'),
        supabaseRest<RepresentanteRow[]>('representantes?select=*&limit=500'),
        supabaseRest<AplicacionPagoRow[]>('aplicaciones_pago?select=*&limit=1000'),
        supabaseRest<WalletMovimientoRow[]>('wallet_movimientos?select=*&order=created_at.desc&limit=1000')
      ]);

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

      const alumnosByFamilia = new Map<string, Alumno[]>();
      for (const al of aRows) {
        if (!al.familia_id) continue;
        const domAl = domainAlumnos.find(d => d.id === al.id);
        if (domAl) {
          const list = alumnosByFamilia.get(al.familia_id) || [];
          list.push(domAl);
          alumnosByFamilia.set(al.familia_id, list);
        }
      }

      // Real representantes table read (canonical). No fabrication: a family
      // with no representantes row simply has no representante_principal —
      // the UI must show that honestly instead of inventing one.
      const domainRepresentantes: Representante[] = repRows.map(r => ({
        id: r.id || '',
        familia_id: r.familia_id || '',
        nombre_completo: r.nombre || 'Representante sin nombre registrado',
        cedula: r.cedula || '',
        telefono: r.telefono_whatsapp || '',
        email: r.email || '',
        parentesco: r.relacion || undefined,
      }));

      // Pick one "principal" rep per family: prefer the designated payer
      // (es_pagador), else the first active one found, else none.
      const primaryRepRowByFamilia = new Map<string, RepresentanteRow>();
      for (const r of repRows) {
        if (!r.familia_id) continue;
        const existing = primaryRepRowByFamilia.get(r.familia_id);
        if (!existing || (r.es_pagador && !existing.es_pagador)) {
          primaryRepRowByFamilia.set(r.familia_id, r);
        }
      }
      const repsByFamilia = new Map<string, Representante>();
      for (const [famId, row] of primaryRepRowByFamilia.entries()) {
        const domRep = domainRepresentantes.find(r => r.id === row.id);
        if (domRep) repsByFamilia.set(famId, domRep);
      }

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
          // '' (not a fabricated id) when the family has no representante on file.
          representante_id: repsByFamilia.get(c.familia_id || '')?.id || '',
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

      // Latest wallet_movimientos.saldo_resultante_centavos per familia = current wallet balance.
      // wmRows is already ordered created_at.desc, so the first match per familia is the latest.
      const walletBalanceByFamilia = new Map<string, number>();
      for (const wm of wmRows) {
        if (!wm.familia_id || walletBalanceByFamilia.has(wm.familia_id)) continue;
        walletBalanceByFamilia.set(wm.familia_id, wm.saldo_resultante_centavos || 0);
      }

      try {
        const { restoreSession } = await import('../infrastructure/supabase/SupabaseAuthClient');
        const sessionProfile = await restoreSession();
        if (sessionProfile) {
          const mappedUser: UsuarioActual = {
            id: sessionProfile.id,
            nombre: sessionProfile.nombreCompleto,
            email: '', 
            rol: sessionProfile.rol as any,
            departamento: 'FIN'
          };
          setCurrentUser(mappedUser);
          setAvailableUsers([mappedUser]); // Not strictly needed anymore, but keeps state consistent
        }
      } catch (e) {
        console.warn("Could not fetch current session profile:", e);
      }

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
          telefono_principal: rep?.telefono || '',
          email_principal: rep?.email || '',
          saldo_pendiente_centavos: saldoPendiente,
          credito_favor_centavos: walletBalanceByFamilia.get(f.id || '') || 0,
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

      // aplicaciones_pago (FIFO allocation lines), joined client-side against
      // the cuotas we just fetched purely for display labels on the receipt.
      const aplicacionesPorPago = new Map<string, AplicacionPago[]>();
      for (const ap of apRows) {
        if (!ap.pago_id) continue;
        const cuota = domainCuotas.find(c => c.id === ap.cuota_id);
        const list = aplicacionesPorPago.get(ap.pago_id) || [];
        list.push({
          id: ap.id || '',
          pago_id: ap.pago_id,
          cuota_id: ap.cuota_id || '',
          monto_aplicado_centavos: ap.monto_aplicado_centavos || 0,
          dias_atraso_al_aplicar: ap.dias_atraso_al_aplicar || 0,
          cuota_periodo: cuota?.periodo || '',
          cuota_concepto: cuota?.arancel_concepto || '',
          alumno_nombre: cuota?.alumno_nombre || '',
        });
        aplicacionesPorPago.set(ap.pago_id, list);
      }

      // Wallet credit generated by each pago = its own 'credito' wallet_movimientos row(s).
      const creditoPorPago = new Map<string, number>();
      for (const wm of wmRows) {
        if (wm.origen !== 'pago' || wm.tipo !== 'credito' || !wm.referencia_id) continue;
        creditoPorPago.set(wm.referencia_id, (creditoPorPago.get(wm.referencia_id) || 0) + (wm.monto_centavos || 0));
      }

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
          credito_generado_centavos: creditoPorPago.get(p.id || '') || 0,
          fecha_pago: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          fecha_registro: p.created_at || new Date().toISOString(),
          metodo_pago: (p.metodo_pago as any) || 'efectivo',
          referencia_bancaria: p.referencia || undefined,
          estado: 'confirmado',
          registrado_por: p.cajero_id || 'cajero-principal',
          registrado_por_nombre: 'Cajero Principal',
          aplicaciones: aplicacionesPorPago.get(p.id || '') || [],
          observaciones: p.notas || undefined,
          comprobante_url: p.recibo_url || undefined
        };
      });

      setFamilias(domainFamilias);
      setAlumnos(domainAlumnos);
      setRepresentantes(domainRepresentantes);
      setCuotas(domainCuotas);
      setPagos(domainPagos);

      // ---------------------------------------------------------
      // Fetch Becas & Patrocinios from Supabase
      // Tablas reales verificadas en vivo (2026-08-23): becas, patrocinantes,
      // patrocinios. NO programas_beneficio/patrocinadores/alumnos_beneficios
      // — esas vienen de 20260823192500_programa_becas_patrocinios.sql, que
      // nunca se aplicó a la base real (confirmado: no existen en pg_tables).
      // ---------------------------------------------------------
      try {
        const [becasRows, patRows, patrocinioRows] = await Promise.all([
          supabaseRest<any[]>('becas?select=*'),
          supabaseRest<any[]>('patrocinantes?select=*'),
          supabaseRest<any[]>('patrocinios?select=*')
        ]);

        const domainPatrocinios = (patrocinioRows || []).map(ps => ({
          id: ps.id,
          patrocinante_id: ps.patrocinante_id,
          alumno_id: ps.alumno_id,
          familia_id: ps.familia_id,
          cubre: ps.cubre,
          monto_mensual_centavos: ps.monto_mensual_centavos || 0,
          activo: ps.activo,
          fecha_inicio: ps.fecha_inicio,
          fecha_fin: ps.fecha_fin || undefined,
        }));

        const domainPatrocinadores: Patrocinador[] = (patRows || []).map(p => {
          const suyos = domainPatrocinios.filter(ps => ps.patrocinante_id === p.id && ps.activo);
          const montoAnual = suyos.reduce((acc, ps) => acc + ps.monto_mensual_centavos * 12, 0);
          return {
            id: p.id,
            nombre: p.nombre,
            tipo: p.tipo,
            contacto: p.contacto || undefined,
            email: p.email || undefined,
            telefono: p.telefono || undefined,
            activo: p.activo,
            notas: p.notas || undefined,
            monto_comprometido_anual_centavos: montoAnual,
            // No existe tabla de cobros reales de patrocinio todavía — 0, no inventado.
            monto_recibido_acumulado_centavos: 0,
            moneda_acordada: 'DOP',
          };
        });

        const domainBecas: Beca[] = (becasRows || []).map(b => {
          const alu = domainAlumnos.find(a => a.id === b.alumno_id);
          const estado: Beca['estado'] = !b.aprobado_por ? 'solicitado' : b.activa ? 'activo' : 'revocado';
          return {
            id: b.id,
            alumno_id: b.alumno_id,
            alumno_nombre: alu?.nombre_completo,
            familia_id: b.familia_id,
            porcentaje: b.porcentaje,
            motivo: b.motivo,
            aprobado_por: b.aprobado_por || undefined,
            activa: b.activa,
            fecha_inicio: b.fecha_inicio,
            fecha_fin: b.fecha_fin || undefined,
            indicador_progreso_minimo: b.indicador_progreso_minimo || undefined,
            estado,
            tipo: Number(b.porcentaje) >= 100 ? 'total' : 'parcial_porcentaje',
            motivo_socioeconomico: b.motivo,
            // `becas` no tiene FK a patrocinantes — el patrocinio es un registro aparte.
            patrocinador_nombre: undefined,
          };
        });

        setPatrocinadores(domainPatrocinadores);
        setPatrocinios(domainPatrocinios.map(ps => ({
          ...ps,
          patrocinante_nombre: domainPatrocinadores.find(p => p.id === ps.patrocinante_id)?.nombre,
        })));
        setBecas(domainBecas);
      } catch (e) {
        console.warn('Could not fetch becas and patrocinios', e);
      }

      // ---------------------------------------------------------
      // Fetch Gastos Fijos Mensuales from Supabase
      // ---------------------------------------------------------
      try {
        const [gfRows, gfpRows] = await Promise.all([
          supabaseRest<any[]>('gastos_fijos?select=*&order=nombre.asc'),
          supabaseRest<any[]>('gastos_fijos_pagos?select=*&order=periodo_anio.desc,periodo_mes.desc')
        ]);

        setGastosFijos((gfRows || []).map(g => ({
          id: g.id,
          nombre: g.nombre,
          categoria: g.categoria,
          centro_costo: g.centro_costo,
          monto_centavos: g.monto_centavos,
          dia_inicio: g.dia_inicio,
          dia_fin: g.dia_fin,
          repetir_mensual: g.repetir_mensual,
          activo: g.activo,
          notas: g.notas || undefined,
          created_at: g.created_at,
        })));

        setGastosFijosPagos((gfpRows || []).map(p => ({
          id: p.id,
          gasto_fijo_id: p.gasto_fijo_id,
          periodo_anio: p.periodo_anio,
          periodo_mes: p.periodo_mes,
          monto_centavos: p.monto_centavos,
          estado: p.estado,
          fecha_pago: p.fecha_pago || undefined,
          referencia: p.referencia || undefined,
        })));
      } catch (e) {
        console.warn('Could not fetch gastos fijos', e);
      }

      setSupabaseStatus('authoritative_online');
      const syncTime = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSupabaseSync(syncTime);

      const bundle: ReceivablesBundle = {
        familias: domainFamilias,
        alumnos: domainAlumnos,
        representantes: domainRepresentantes,
        cuotas: domainCuotas,
        pagos: domainPagos
      };

      // Safe read cache only
      await cacheAdapter.set(CACHE_RECEIVABLES_KEY, { ...bundle, cachedAt: new Date().toISOString() });

      return bundle;

    } catch (err: any) {
      console.error('[Supabase Init Receivables Error]', err);
      const cached = await cacheAdapter.get<any>(CACHE_RECEIVABLES_KEY);
      if (cached) {
        setFamilias(cached.familias || []);
        setAlumnos(cached.alumnos || []);
        setRepresentantes(cached.representantes || []);
        setCuotas(cached.cuotas || []);
        setPagos(cached.pagos || []);
        setSupabaseStatus('read_cache_degraded');
        setSupabaseErrorMessage(`Error conectando a Supabase: ${err.message}. Mostrando caché de solo lectura.`);
        return cached as ReceivablesBundle;
      } else {
        setSupabaseStatus('offline_blocked');
        setSupabaseErrorMessage(`FAIL_CLOSED: Fallo de conexión: ${err.message}`);
        return null;
      }
    }
  };

  useEffect(() => {
    refreshAuthoritativeReceivables();
  }, []);

  // Save other operational modules to local draft
  const saveState = (updatedState: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (e) {
      console.warn('Error saving state', e);
    }
  };

  // Hexagonal Adapters & Use Cases Instances (Receivables Module).
  // Three distinct repository instances — NOT the same object for all three
  // roles. StateBridgeReceivablesRepository's generic findById/findByFamilyId
  // methods are ambiguous when the same instance plays family+fee+payment
  // roles at once (they always resolved to the fee repo internally), which
  // would have silently fed the wrong entity type into RegisterPaymentUseCase.
  const familyRepository = new StateBridgeFamilyRepository(() => familias);
  const feeRepository = new StateBridgeFeeRepository(() => cuotas);
  const paymentRepository = new StateBridgePaymentRepository(() => pagos);
  const paymentTransactionPort = new SupabasePaymentTransactionAdapter();
  const registerPaymentUseCase = new RegisterPaymentUseCase(
    paymentTransactionPort,
    familyRepository,
    feeRepository,
    paymentRepository
  );

  /**
   * SDD §5.3 / G-01 / G-02: Payment registration.
   * Server is authoritative: this awaits RegisterPaymentUseCase.execute(),
   * which calls fn_registrar_pago_transaccional through the Supabase
   * adapter. Local state (cuotas/pagos/familias) is only updated by
   * re-fetching from Supabase AFTER the RPC confirms success — never before,
   * never speculatively. On failure, no local state changes, no receipt.
   */
  const registrarPagoTransaccional = async (params: {
    familia_id: string;
    monto_total_centavos: number;
    metodo_pago: MetodoPago;
    fecha_pago: string;
    referencia?: string;
    observaciones?: string;
    cuotas_especificas_ids?: string[];
  }): Promise<{ success: boolean; pago?: Pago; error?: string }> => {
    const { familia_id, monto_total_centavos, metodo_pago, fecha_pago, referencia, observaciones, cuotas_especificas_ids } = params;

    const familia = familias.find(f => f.id === familia_id);
    if (!familia) return { success: false, error: 'Familia no encontrada' };

    let result;
    try {
      result = await registerPaymentUseCase.execute({
        familiaId: familia_id,
        montoTotalCentavos: monto_total_centavos,
        metodoPago: metodo_pago,
        fechaPago: fecha_pago,
        referenciaBancaria: referencia,
        observaciones,
        cuotasEspecificasIds: cuotas_especificas_ids,
        cajeroId: currentUser.id,
        cajeroNombre: currentUser.nombre,
        periodoActivo,
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error inesperado al registrar el pago.' };
    }

    if (!result.success) {
      // fn_registrar_pago_transaccional rejected or failed to commit: no
      // local state touched, no cuota marked paid, no receipt generated.
      return { success: false, error: result.error || 'No se pudo registrar el pago.' };
    }

    // Server is authoritative: re-fetch canonical familias/cuotas/pagos from
    // Supabase rather than trusting the client-side FIFO preview that was
    // only used to decide which cuota_ids to send to the RPC.
    const refreshed = await refreshAuthoritativeReceivables();

    const confirmedPago = refreshed?.pagos.find(p => p.id === result.confirmedPaymentId);

    // Non-authoritative local accounting preview (Accounting/asientos stays
    // out of scope for Milestone 1 — no Supabase table exists for it yet —
    // but we can still show a preview sourced from the CONFIRMED payment).
    const creditoGenerado = confirmedPago?.credito_generado_centavos ?? result.payment?.creditoGenerado.cents ?? 0;
    const nuevoAsientoNumero = asientos.length + 1045;
    const nuevoAsiento: AsientoContable = {
      id: `ast-${Date.now()}`,
      numero: nuevoAsientoNumero,
      plantilla_id: creditoGenerado > 0 ? 'AS-04' : 'AS-03',
      fecha_contable: fecha_pago,
      periodo: periodoActivo,
      descripcion: `Cobro de cuotas familia ${familia.apellidos} - Recibo ${confirmedPago?.numero_recibo || result.payment?.numeroRecibo || ''}`,
      tipo: 'automatico',
      origen_entidad: 'pago',
      origen_id: result.confirmedPaymentId || result.payment?.id || '',
      lineas: [
        {
          cuenta_codigo: metodo_pago === 'efectivo' ? '1.1.01.01' : '1.1.01.02',
          cuenta_nombre: metodo_pago === 'efectivo' ? 'Caja General Ventanilla' : 'Banco Popular Dominicano',
          centro_costo: 'FIN',
          debito_centavos: monto_total_centavos,
          credito_centavos: 0,
        },
        {
          cuenta_codigo: '1.1.03.01',
          cuenta_nombre: 'Cuentas por Cobrar Representantes',
          centro_costo: 'FIN',
          debito_centavos: 0,
          credito_centavos: monto_total_centavos - creditoGenerado,
        },
        ...(creditoGenerado > 0 ? [{
          cuenta_codigo: '2.1.04.01',
          cuenta_nombre: 'Anticipos y Créditos de Representantes (Wallet)',
          centro_costo: 'FIN',
          debito_centavos: 0,
          credito_centavos: creditoGenerado,
        }] : [])
      ],
      total_debitos_centavos: monto_total_centavos,
      total_creditos_centavos: monto_total_centavos,
      cuadrado: true,
      estado: 'contabilizado',
    };
    const newAsientos = [nuevoAsiento, ...asientos];
    setAsientos(newAsientos);
    // Accounting stays local-only/non-authoritative for this milestone —
    // deliberately NOT part of SOI_FINANZAS_STATE_V1's receivables slice.
    saveState({ asientos: newAsientos });

    return { success: true, pago: confirmedPago || (result.payment ? mapDomainPaymentToViewPago(result.payment) : undefined) };
  };

  /**
   * SDD §5.1: Generate monthly fees with scholarship logic
   */
  const generarCuotasMensuales = (periodo: string) => {
    let generadas = 0;
    let omitidas = 0;
    const nuevasCuotas: Cuota[] = [];

    alumnos.forEach(alumno => {
      if (!alumno.activo) {
        omitidas++;
        return;
      }

      // Idempotency check: alumno_id + arancel + periodo
      const exists = cuotas.some(c => c.alumno_id === alumno.id && c.periodo === periodo);
      if (exists) {
        omitidas++;
        return;
      }

      const montoBruto = 125000; // RD$1,250.00
      let descuento = 0;

      // Find active scholarship
      const activeBeca = becas.find(b => b.alumno_id === alumno.id && b.estado === 'aprobada');
      if (activeBeca) {
        if (activeBeca.tipo === 'total') {
          descuento = montoBruto;
        } else if (activeBeca.tipo === 'parcial_porcentaje' && activeBeca.porcentaje) {
          descuento = Math.round((montoBruto * activeBeca.porcentaje) / 100);
        }
      }

      if (alumno.exento_mensualidad) {
        descuento = montoBruto;
      }

      const montoNeto = montoBruto - descuento;

      const nuevaCuota: Cuota = {
        id: `cuo-${Date.now()}-${alumno.id.substr(4, 3)}`,
        alumno_id: alumno.id,
        alumno_nombre: alumno.nombre_completo,
        representante_id: alumno.familia_id, // fallback
        familia_id: alumno.familia_id,
        arancel_concepto: descuento > 0 ? `Mensualidad Académica (Beca ${activeBeca?.porcentaje || 100}%)` : 'Mensualidad Académica',
        periodo,
        ciclo_academico: '2025-2026',
        monto_bruto_centavos: montoBruto,
        descuento_beca_centavos: descuento,
        monto_neto_centavos: montoNeto,
        monto_pagado_centavos: 0,
        saldo_centavos: montoNeto,
        fecha_emision: `${periodo}-01`,
        fecha_vencimiento: `${periodo}-10`,
        estado: montoNeto === 0 ? 'pagada' : 'pendiente',
        fecha_pago_completo: montoNeto === 0 ? `${periodo}-01` : undefined,
        es_prorrateada: false,
        beca_id: activeBeca?.id,
        beca_nombre: activeBeca ? (activeBeca.porcentaje ? `Beca ${activeBeca.porcentaje}%` : 'Beca Total') : undefined,
        version: 1,
      };

      nuevasCuotas.push(nuevaCuota);
      generadas++;
    });

    const allCuotas = [...cuotas, ...nuevasCuotas];
    setCuotas(allCuotas);
    saveState({ cuotas: allCuotas });

    return { generadas, omitidas };
  };

  const crearCompromisoPago = (params: {
    familia_id: string;
    representante_id: string;
    cuotas_ids: string[];
    monto_centavos: number;
    fecha_limite: string;
    acuerdo_texto: string;
  }) => {
    const nuevoCompromiso: CompromisoPago = {
      id: `com-${Date.now()}`,
      familia_id: params.familia_id,
      representante_id: params.representante_id,
      cuotas_ids: params.cuotas_ids,
      monto_comprometido_centavos: params.monto_centavos,
      fecha_compromiso: new Date().toISOString().split('T')[0],
      fecha_limite: params.fecha_limite,
      estado: 'pendiente',
      acuerdo_texto: params.acuerdo_texto,
      registrado_por: currentUser.nombre,
    };

    const updatedCompromisos = [nuevoCompromiso, ...compromisos];
    setCompromisos(updatedCompromisos);

    // Update family state to 'convenio'
    const updatedFamilias = familias.map(f => {
      if (f.id === params.familia_id) {
        return { ...f, estado_cartera: 'convenio' as const };
      }
      return f;
    });
    setFamilias(updatedFamilias);
  };

  const aprobarBeca = async (beca_id: string, aprobado: boolean) => {
    try {
      // `becas` real: no hay columna `estado`, se aprueba/revoca con
      // `activa` + `aprobado_por` (ver types/index.ts Beca para la derivación de `estado`).
      await supabaseRest(`becas?id=eq.${beca_id}`, {
        method: 'PATCH',
        body: { activa: aprobado, aprobado_por: currentUser.id }
      });

      const updated = becas.map(b => {
        if (b.id === beca_id) {
          return {
            ...b,
            activa: aprobado,
            aprobado_por: currentUser.id,
            estado: (aprobado ? 'activo' : 'revocado') as Beca['estado'],
          };
        }
        return b;
      });
      setBecas(updated);
    } catch (e) {
      console.error('Failed to update beca status', e);
    }
  };

  const aprobarFacturaGasto = (factura_id: string) => {
    // Segregation of duties check (INV-11)
    const factura = facturasGasto.find(f => f.id === factura_id);
    if (!factura) return { success: false, error: 'Factura no encontrada' };

    if (currentUser.rol !== 'director' && currentUser.rol !== 'finanzas') {
      return { success: false, error: 'Solo Dirección o Finanzas pueden aprobar gastos institucionales' };
    }

    const updated = facturasGasto.map(f => {
      if (f.id === factura_id) {
        return {
          ...f,
          estado: 'aprobada' as const,
          aprobado_por: currentUser.id,
          aprobado_por_nombre: currentUser.nombre,
        };
      }
      return f;
    });
    setFacturasGasto(updated);
    saveState({ facturasGasto: updated });
    return { success: true };
  };

  const registrarPagoFacturaGasto = (factura_id: string, metodo: MetodoPago, referencia: string) => {
    const factura = facturasGasto.find(f => f.id === factura_id);
    if (!factura) return { success: false, error: 'Factura no encontrada' };
    if (factura.estado !== 'aprobada') return { success: false, error: 'La factura debe estar aprobada antes de ejecutar el pago' };

    const updatedFacturas = facturasGasto.map(f => {
      if (f.id === factura_id) {
        return {
          ...f,
          estado: 'pagada' as const,
          fecha_pago: new Date().toISOString().split('T')[0],
          metodo_pago: metodo,
          referencia_pago: referencia,
        };
      }
      return f;
    });

    // Update budget execution (INV-07)
    const updatedPartidas = partidas.map(p => {
      if (p.id === factura.partida_presupuestaria_id) {
        const pagado = p.pagado_centavos + factura.monto_neto_centavos;
        const devengado = p.devengado_centavos + factura.monto_neto_centavos;
        const comprometido = Math.max(0, p.comprometido_centavos - factura.monto_neto_centavos);
        const disponible = p.monto_anual_centavos - comprometido - pagado;
        return {
          ...p,
          pagado_centavos: pagado,
          devengado_centavos: devengado,
          comprometido_centavos: comprometido,
          disponible_centavos: disponible,
        };
      }
      return p;
    });

    // Double Entry Accounting (AS-08)
    const nuevoAsiento: AsientoContable = {
      id: `ast-${Date.now()}`,
      numero: asientos.length + 1045,
      plantilla_id: 'AS-08',
      fecha_contable: new Date().toISOString().split('T')[0],
      periodo: periodoActivo,
      descripcion: `Pago a proveedor ${factura.proveedor_nombre} - Factura ${factura.numero_factura}`,
      tipo: 'automatico',
      origen_entidad: 'factura',
      origen_id: factura_id,
      lineas: [
        {
          cuenta_codigo: '2.1.01.01',
          cuenta_nombre: 'Cuentas por Pagar Proveedores',
          centro_costo: factura.centro_costo,
          debito_centavos: factura.monto_neto_centavos,
          credito_centavos: 0,
        },
        {
          cuenta_codigo: '1.1.01.02',
          cuenta_nombre: 'Banco Popular Dominicano',
          centro_costo: 'FIN',
          debito_centavos: 0,
          credito_centavos: factura.monto_neto_centavos,
        }
      ],
      total_debitos_centavos: factura.monto_neto_centavos,
      total_creditos_centavos: factura.monto_neto_centavos,
      cuadrado: true,
      estado: 'contabilizado',
    };

    setFacturasGasto(updatedFacturas);
    setPartidas(updatedPartidas);
    setAsientos([nuevoAsiento, ...asientos]);

    saveState({
      facturasGasto: updatedFacturas,
      partidas: updatedPartidas,
      asientos: [nuevoAsiento, ...asientos],
    });

    return { success: true };
  };

  const crearCierreCaja = (params: {
    monto_apertura_centavos: number;
    monto_contado_centavos: number;
    motivo_diferencia?: string;
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const pagosEfectivoHoy = pagos.filter(p => p.metodo_pago === 'efectivo' && p.fecha_pago === today);
    const efectivoCobrado = pagosEfectivoHoy.reduce((acc, p) => acc + p.monto_total_centavos, 0);
    const efectivoEgresos = 0; // standard box
    const esperado = params.monto_apertura_centavos + efectivoCobrado - efectivoEgresos;
    const diferencia = params.monto_contado_centavos - esperado;

    const nuevoCierre: CierreCaja = {
      id: `cc-${Date.now()}`,
      numero_cierre: `CC-${(cierresCaja.length + 1).toString().padStart(6, '0')}`,
      fecha: today,
      monto_apertura_centavos: params.monto_apertura_centavos,
      efectivo_cobrado_centavos: efectivoCobrado,
      efectivo_egresos_centavos: efectivoEgresos,
      monto_esperado_centavos: esperado,
      monto_contado_centavos: params.monto_contado_centavos,
      diferencia_centavos: diferencia,
      motivo_diferencia: params.motivo_diferencia,
      estado: 'cerrado',
      cajero_id: currentUser.id,
      cajero_nombre: currentUser.nombre,
      pagos_incluidos_ids: pagosEfectivoHoy.map(p => p.id),
      observaciones: diferencia === 0 ? 'Cierre cuadrado al centavo.' : `Diferencia de arqueo registrada: ${diferencia / 100} DOP`,
    };

    const updatedCierres = [nuevoCierre, ...cierresCaja];
    setCierresCaja(updatedCierres);
    saveState({ cierresCaja: updatedCierres });

    return { success: true, cierre: nuevoCierre };
  };

  const conciliarTransaccion = (trx_id: string, matched_entity_id?: string) => {
    const updated = transaccionesBancarias.map(t => {
      if (t.id === trx_id) {
        return {
          ...t,
          estado_conciliacion: 'conciliada' as const,
          confianza_match: 100,
          pago_id: matched_entity_id || t.pago_id,
        };
      }
      return t;
    });
    setTransaccionesBancarias(updated);
    saveState({ transaccionesBancarias: updated });
  };

  const aprobarLineaNomina = (nomina_id: string) => {
    const linea = nomina.find(n => n.id === nomina_id);
    if (!linea) return { success: false, error: 'Línea de nómina no encontrada' };

    // SDD G-06 / INV-12: Anti-self-approval rule!
    if (currentUser.id === linea.maestro_id || currentUser.nombre.toLowerCase().includes(linea.maestro_nombre.toLowerCase())) {
      return {
        success: false,
        error: 'INV-12 Violada: Nadie puede aprobar su propia compensación. Escalar a Dirección Ejecutiva.'
      };
    }

    const updated = nomina.map(n => {
      if (n.id === nomina_id) {
        return {
          ...n,
          aprobado_direccion: true,
          estado_pago: 'aprobado' as const,
        };
      }
      return n;
    });
    setNomina(updated);
    saveState({ nomina: updated });
    return { success: true };
  };

  const dispersarNominaDocente = (cuenta_bancaria_id?: string) => {
    const aprobadas = nomina.filter(n => n.estado_pago === 'aprobado');
    if (aprobadas.length === 0) {
      return { success: false, error: 'No hay líneas de nómina aprobadas listas para dispersión electrónica.' };
    }

    const totalNetoCentavos = aprobadas.reduce((acc, n) => acc + n.monto_neto_centavos, 0);
    const totalBrutoCentavos = aprobadas.reduce((acc, n) => acc + n.monto_base_centavos + n.bonos_centavos, 0);
    const totalRetencionesCentavos = aprobadas.reduce((acc, n) => acc + n.retencion_tss_centavos + n.retencion_isr_centavos, 0);

    const cuenta = cuentasBancarias.find(c => c.id === cuenta_bancaria_id) || cuentasBancarias[0];
    const today = new Date().toISOString().split('T')[0];

    const updatedNomina = nomina.map(n => {
      if (n.estado_pago === 'aprobado') {
        return {
          ...n,
          estado_pago: 'pagado' as const,
          fecha_pago: today,
        };
      }
      return n;
    });

    const updatedCuentas = cuentasBancarias.map(c => {
      if (c.id === cuenta.id) {
        return {
          ...c,
          saldo_libro_centavos: c.saldo_libro_centavos - totalNetoCentavos,
          saldo_disponible_centavos: c.saldo_disponible_centavos - totalNetoCentavos,
        };
      }
      return c;
    });

    const nuevaTrx: TransaccionBancaria = {
      id: `trx-nom-${Date.now()}`,
      cuenta_id: cuenta.id,
      fecha: today,
      referencia: `DISP-NOM-${Date.now().toString().slice(-6)}`,
      descripcion: `Dispersión electrónica de nómina docente (${aprobadas.length} cátedras) - ${periodoActivo}`,
      debito_centavos: totalNetoCentavos,
      credito_centavos: 0,
      estado_conciliacion: 'conciliada',
      confianza_match: 100,
    };

    const nuevoAsiento: AsientoContable = {
      id: `ast-nom-${Date.now()}`,
      numero: asientos.length + 1047,
      plantilla_id: 'AS-06',
      fecha_contable: today,
      periodo: periodoActivo,
      descripcion: `Liquidación y dispersión de nómina docente: ${periodoActivo}`,
      tipo: 'automatico',
      origen_entidad: 'nomina',
      origen_id: `nom-${periodoActivo}`,
      lineas: [
        {
          cuenta_codigo: '5.1.01.01',
          cuenta_nombre: 'Gasto de Honorarios y Cátedras Docentes',
          centro_costo: 'ACM',
          debito_centavos: totalBrutoCentavos,
          credito_centavos: 0,
        },
        {
          cuenta_codigo: '2.1.02.01',
          cuenta_nombre: 'Retenciones TSS e ISR por Pagar',
          centro_costo: 'FIN',
          debito_centavos: 0,
          credito_centavos: totalRetencionesCentavos,
        },
        {
          cuenta_codigo: cuenta.banco.includes('Popular') ? '1.1.02.01' : '1.1.02.02',
          cuenta_nombre: cuenta.nombre,
          centro_costo: 'FIN',
          debito_centavos: 0,
          credito_centavos: totalNetoCentavos,
        }
      ],
      total_debitos_centavos: totalBrutoCentavos,
      total_creditos_centavos: totalRetencionesCentavos + totalNetoCentavos,
      cuadrado: true,
      estado: 'contabilizado',
    };

    setNomina(updatedNomina);
    setCuentasBancarias(updatedCuentas);
    setTransaccionesBancarias([nuevaTrx, ...transaccionesBancarias]);
    setAsientos([nuevoAsiento, ...asientos]);

    saveState({
      nomina: updatedNomina,
      cuentasBancarias: updatedCuentas,
      transaccionesBancarias: [nuevaTrx, ...transaccionesBancarias],
      asientos: [nuevoAsiento, ...asientos],
    });

    return {
      success: true,
      dispersadas: aprobadas.length,
      total_neto_centavos: totalNetoCentavos,
    };
  };

  const crearSolicitudBeca = async (params: {
    alumno_id: string;
    porcentaje: number;
    motivo_socioeconomico: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const alumno = alumnos.find(a => a.id === params.alumno_id);
    if (!alumno) return { success: false, error: 'Alumno no encontrado' };

    try {
      const [row] = await supabaseRest<any[]>('becas', {
        method: 'POST',
        body: {
          alumno_id: alumno.id,
          familia_id: alumno.familia_id,
          porcentaje: params.porcentaje,
          motivo: params.motivo_socioeconomico,
          fecha_inicio: `${periodoActivo}-01`,
        },
        prefer: 'return=representation',
      });

      const nuevaBeca: Beca = {
        id: row.id,
        alumno_id: row.alumno_id,
        alumno_nombre: alumno.nombre_completo,
        familia_id: row.familia_id,
        porcentaje: row.porcentaje,
        motivo: row.motivo,
        aprobado_por: row.aprobado_por || undefined,
        activa: row.activa,
        fecha_inicio: row.fecha_inicio,
        fecha_fin: row.fecha_fin || undefined,
        estado: 'solicitado',
        tipo: Number(row.porcentaje) >= 100 ? 'total' : 'parcial_porcentaje',
        motivo_socioeconomico: row.motivo,
      };

      setBecas([nuevaBeca, ...becas]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al crear la solicitud de beca.' };
    }
  };

  const crearFacturaGasto = (params: {
    proveedor_id: string;
    proveedor_nombre: string;
    concepto: string;
    centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    partida_presupuestaria_id: string;
    monto_bruto_centavos: number;
    itbis_centavos: number;
    retencion_centavos: number;
    fecha_emision: string;
    fecha_vencimiento: string;
    numero_factura: string;
    ncf?: string;
  }) => {
    const montoNeto = params.monto_bruto_centavos + params.itbis_centavos - params.retencion_centavos;
    
    const nuevaFactura: FacturaGasto = {
      id: `fac-${Date.now()}`,
      numero_factura: params.numero_factura,
      ncf: params.ncf || `B01000${Math.floor(10000 + Math.random() * 90000)}`,
      proveedor_id: params.proveedor_id,
      proveedor_nombre: params.proveedor_nombre,
      concepto: params.concepto,
      centro_costo: params.centro_costo,
      partida_presupuestaria_id: params.partida_presupuestaria_id,
      monto_bruto_centavos: params.monto_bruto_centavos,
      itbis_centavos: params.itbis_centavos,
      retencion_centavos: params.retencion_centavos,
      monto_neto_centavos: montoNeto,
      fecha_emision: params.fecha_emision,
      fecha_vencimiento: params.fecha_vencimiento,
      estado: 'recibida',
      solicitado_por: currentUser.id,
      solicitado_por_nombre: currentUser.nombre,
    };

    // Update budget committed amount
    const updatedPartidas = partidas.map(p => {
      if (p.id === params.partida_presupuestaria_id) {
        const comprometido = p.comprometido_centavos + montoNeto;
        const disponible = Math.max(0, p.monto_anual_centavos - comprometido - p.pagado_centavos);
        return { ...p, comprometido_centavos: comprometido, disponible_centavos: disponible };
      }
      return p;
    });

    const updatedFacturas = [nuevaFactura, ...facturasGasto];
    setFacturasGasto(updatedFacturas);
    setPartidas(updatedPartidas);
    saveState({ facturasGasto: updatedFacturas, partidas: updatedPartidas });
    return { success: true };
  };

  /**
   * Gastos Fijos Mensuales: a diferencia de casi todo lo demás en este
   * archivo, estas tres acciones SÍ persisten en Supabase (tablas reales
   * `gastos_fijos`/`gastos_fijos_pagos`) — no son estado local que se
   * pierde al recargar. Insert/update directo vía PostgREST es suficiente
   * aquí (a diferencia de `registrarPagoTransaccional`, no hay riesgo de
   * condición de carrera entre cajeros concurrentes sobre un mismo gasto).
   */
  const crearGastoFijo = async (params: {
    nombre: string;
    categoria: CategoriaGastoFijo;
    centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    monto_centavos: number;
    dia_inicio: number;
    dia_fin: number;
    repetir_mensual?: boolean;
    notas?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const [row] = await supabaseRest<any[]>('gastos_fijos', {
        method: 'POST',
        body: {
          nombre: params.nombre,
          categoria: params.categoria,
          centro_costo: params.centro_costo,
          monto_centavos: params.monto_centavos,
          dia_inicio: params.dia_inicio,
          dia_fin: params.dia_fin,
          repetir_mensual: params.repetir_mensual ?? true,
          notas: params.notas,
        },
        prefer: 'return=representation',
      });

      setGastosFijos([
        ...gastosFijos,
        {
          id: row.id,
          nombre: row.nombre,
          categoria: row.categoria,
          centro_costo: row.centro_costo,
          monto_centavos: row.monto_centavos,
          dia_inicio: row.dia_inicio,
          dia_fin: row.dia_fin,
          repetir_mensual: row.repetir_mensual,
          activo: row.activo,
          notas: row.notas || undefined,
          created_at: row.created_at,
        },
      ]);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al crear el gasto fijo.' };
    }
  };

  const registrarPagoGastoFijo = async (params: {
    gasto_fijo_id: string;
    periodo_anio: number;
    periodo_mes: number;
    monto_centavos: number;
    referencia?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const fechaPago = new Date().toISOString().split('T')[0];
      const existente = gastosFijosPagos.find(
        p =>
          p.gasto_fijo_id === params.gasto_fijo_id &&
          p.periodo_anio === params.periodo_anio &&
          p.periodo_mes === params.periodo_mes
      );

      let row: any;
      if (existente) {
        [row] = await supabaseRest<any[]>(`gastos_fijos_pagos?id=eq.${existente.id}`, {
          method: 'PATCH',
          body: {
            estado: 'pagado',
            fecha_pago: fechaPago,
            referencia: params.referencia,
            monto_centavos: params.monto_centavos,
          },
          prefer: 'return=representation',
        });
      } else {
        [row] = await supabaseRest<any[]>('gastos_fijos_pagos', {
          method: 'POST',
          body: {
            gasto_fijo_id: params.gasto_fijo_id,
            periodo_anio: params.periodo_anio,
            periodo_mes: params.periodo_mes,
            monto_centavos: params.monto_centavos,
            estado: 'pagado',
            fecha_pago: fechaPago,
            referencia: params.referencia,
          },
          prefer: 'return=representation',
        });
      }

      const nuevoPago: GastoFijoPago = {
        id: row.id,
        gasto_fijo_id: row.gasto_fijo_id,
        periodo_anio: row.periodo_anio,
        periodo_mes: row.periodo_mes,
        monto_centavos: row.monto_centavos,
        estado: row.estado,
        fecha_pago: row.fecha_pago || undefined,
        referencia: row.referencia || undefined,
      };

      setGastosFijosPagos([nuevoPago, ...gastosFijosPagos.filter(p => p.id !== nuevoPago.id)]);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al registrar el pago del gasto fijo.' };
    }
  };

  const generarInstanciasGastosFijosMes = async (
    periodoAnio: number,
    periodoMes: number
  ): Promise<{ success: boolean; generadas?: number; error?: string }> => {
    try {
      const generadas = await supabaseRpc<number>('fn_generar_instancias_gastos_fijos', {
        p_mes: periodoMes,
        p_anio: periodoAnio,
      });
      await refreshAuthoritativeReceivables();
      return { success: true, generadas };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al generar las instancias del mes.' };
    }
  };

  const crearServicioRecurrente = (params: {
    nombre: string;
    tipo: 'energia' | 'internet' | 'alquiler' | 'otro';
    proveedor_id?: string;
    proveedor_nombre: string;
    numero_contrato_cuenta: string;
    monto_promedio_mensual_centavos: number;
    dia_vencimiento_mes: number;
    es_servicio_esencial: boolean;
  }) => {
    const nuevo: ServicioRecurrente = {
      id: `srv-${Date.now()}`,
      nombre: params.nombre,
      tipo: params.tipo,
      proveedor_id: params.proveedor_id,
      proveedor_nombre: params.proveedor_nombre,
      numero_contrato_cuenta: params.numero_contrato_cuenta,
      monto_promedio_mensual_centavos: params.monto_promedio_mensual_centavos,
      monto_ultimo_facturado_centavos: params.monto_promedio_mensual_centavos,
      proxima_fecha_vencimiento: `2026-08-${String(params.dia_vencimiento_mes).padStart(2, '0')}`,
      dias_restantes: Math.max(1, params.dia_vencimiento_mes - 23),
      estado: 'al_dia',
      es_servicio_esencial: params.es_servicio_esencial
    };
    const updated = [...serviciosRecurrentes, nuevo];
    setServiciosRecurrentes(updated);
    saveState({ serviciosRecurrentes: updated });
  };

  const registrarPagoServicioRecurrente = (params: {
    servicio_id: string;
    cuenta_bancaria_id: string;
    monto_centavos: number;
    referencia?: string;
  }): { success: boolean; error?: string } => {
    const srv = serviciosRecurrentes.find(s => s.id === params.servicio_id);
    if (!srv) return { success: false, error: 'Servicio no encontrado' };

    const updated = serviciosRecurrentes.map(s => {
      if (s.id === params.servicio_id) {
        return {
          ...s,
          dias_restantes: 30,
          proxima_fecha_vencimiento: '2026-09-28',
          estado: 'al_dia' as const
        };
      }
      return s;
    });
    setServiciosRecurrentes(updated);
    saveState({ serviciosRecurrentes: updated });
    return { success: true };
  };

  const conciliarTodoAutomatico = () => {
    let count = 0;
    const updated = transaccionesBancarias.map(t => {
      if (t.estado_conciliacion !== 'conciliada' && (t.confianza_match && t.confianza_match >= 75)) {
        count++;
        return {
          ...t,
          estado_conciliacion: 'conciliada' as const,
          confianza_match: 100,
        };
      }
      return t;
    });

    if (count > 0) {
      setTransaccionesBancarias(updated);
      saveState({ transaccionesBancarias: updated });
    }
    return { conciliadas: count };
  };

  const importarExtractoBancario = (cuenta_bancaria_id: string, transacciones: Array<{
    fecha: string;
    descripcion: string;
    referencia?: string;
    debito_centavos: number;
    credito_centavos: number;
  }>) => {
    const cuenta = cuentasBancarias.find(c => c.id === cuenta_bancaria_id) || cuentasBancarias[0];

    const newTrxs: TransaccionBancaria[] = transacciones.map((t, idx) => {
      const isFeeMatch = t.credito_centavos > 0;
      return {
        id: `trx-imp-${Date.now()}-${idx}`,
        cuenta_id: cuenta.id,
        fecha: t.fecha,
        referencia: t.referencia || `IMP-${Date.now().toString().slice(-4)}`,
        descripcion: t.descripcion,
        debito_centavos: t.debito_centavos,
        credito_centavos: t.credito_centavos,
        estado_conciliacion: isFeeMatch ? 'sugerida' : 'pendiente',
        confianza_match: isFeeMatch ? 92 : 45,
      };
    });

    const updated = [...newTrxs, ...transaccionesBancarias];
    setTransaccionesBancarias(updated);
    saveState({ transaccionesBancarias: updated });
    return { agregadas: newTrxs.length };
  };

  const crearPartidaPresupuestaria = (params: {
    codigo_partida: string;
    nombre: string;
    centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    monto_anual_centavos: number;
  }) => {
    const nuevaPartida: PartidaPresupuestaria = {
      id: `par-${Date.now()}`,
      codigo_partida: params.codigo_partida,
      nombre: params.nombre,
      centro_costo: params.centro_costo,
      monto_anual_centavos: params.monto_anual_centavos,
      comprometido_centavos: 0,
      devengado_centavos: 0,
      pagado_centavos: 0,
      disponible_centavos: params.monto_anual_centavos,
      distribucion_mensual_centavos: Array(12).fill(Math.round(params.monto_anual_centavos / 12)),
    };

    const updated = [...partidas, nuevaPartida];
    setPartidas(updated);
    saveState({ partidas: updated });
    return { success: true };
  };

  const trasladarPresupuesto = (params: {
    origen_id: string;
    destino_id: string;
    monto_centavos: number;
    justificacion: string;
  }) => {
    const origen = partidas.find(p => p.id === params.origen_id);
    const destino = partidas.find(p => p.id === params.destino_id);

    if (!origen || !destino) return { success: false, error: 'Partidas no encontradas' };
    if (origen.disponible_centavos < params.monto_centavos) {
      return { success: false, error: 'La partida de origen no cuenta con suficiente saldo disponible' };
    }

    const updated = partidas.map(p => {
      if (p.id === origen.id) {
        const nuevoAnual = p.monto_anual_centavos - params.monto_centavos;
        const nuevoDisponible = p.disponible_centavos - params.monto_centavos;
        return { ...p, monto_anual_centavos: nuevoAnual, disponible_centavos: nuevoDisponible };
      }
      if (p.id === destino.id) {
        const nuevoAnual = p.monto_anual_centavos + params.monto_centavos;
        const nuevoDisponible = p.disponible_centavos + params.monto_centavos;
        return { ...p, monto_anual_centavos: nuevoAnual, disponible_centavos: nuevoDisponible };
      }
      return p;
    });

    setPartidas(updated);
    saveState({ partidas: updated });
    return { success: true };
  };

  const crearTareaInstitucional = (params: {
    titulo: string;
    descripcion: string;
    prioridad: 'baja' | 'media' | 'alta' | 'critica';
    departamento_origen: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    departamento_destino: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
    fecha_limite: string;
    categoria?: 'director' | 'hermes' | 'rutina' | 'cobranza' | 'auditoria';
    asignado_a?: string;
    vinculo_entidad_tipo?: string;
    vinculo_entidad_id?: string;
  }) => {
    const nuevaTarea: TareaInstitucional = {
      id: `task-${Date.now()}`,
      titulo: params.titulo,
      descripcion: params.descripcion,
      prioridad: params.prioridad,
      departamento_origen: params.departamento_origen,
      departamento_destino: params.departamento_destino,
      fecha_limite: params.fecha_limite,
      categoria: params.categoria || (params.departamento_destino === 'DIR' || params.departamento_origen === 'DIR' ? 'director' : 'hermes'),
      asignado_a: params.asignado_a || `${params.departamento_destino} Equipo`,
      vinculo_entidad_tipo: params.vinculo_entidad_tipo,
      vinculo_entidad_id: params.vinculo_entidad_id,
      fecha_creacion: new Date().toISOString().split('T')[0],
      creada_por: currentUser.nombre,
      estado: 'pendiente',
      comentarios: [],
      historial: [
        {
          id: `h-${Date.now()}`,
          actor: currentUser.nombre,
          rol: currentUser.rol,
          departamento: currentUser.rol === 'admin' ? 'DIR' : currentUser.rol === 'finanzas' ? 'FIN' : currentUser.rol === 'lutheria' ? 'LUT' : 'ADM',
          accion: 'creacion_tarea',
          valor_nuevo: params.titulo,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    };

    const updated = [nuevaTarea, ...tareas];
    setTareas(updated);
    saveState({ tareas: updated });
    return { success: true, tarea: nuevaTarea };
  };

  const crearNuevaFamilia = (params: {
    codigo_familia: string;
    apellidos: string;
    representante_nombre: string;
    representante_cedula: string;
    representante_telefono: string;
    representante_email: string;
    alumno_nombre: string;
    instrumento: string;
    nivel: string;
  }) => {
    const repId = `rep-${Date.now()}`;
    const famId = `fam-${Date.now()}`;
    const almId = `alm-${Date.now()}`;

    const newRep: Representante = {
      id: repId,
      familia_id: famId,
      nombre_completo: params.representante_nombre,
      cedula: params.representante_cedula,
      telefono: params.representante_telefono,
      email: params.representante_email,
    };

    const newAlm: Alumno = {
      id: almId,
      nombre_completo: params.alumno_nombre,
      instrumento_principal: params.instrumento,
      nivel: params.nivel,
      familia_id: famId,
      fecha_ingreso: new Date().toISOString().split('T')[0],
      exento_mensualidad: false,
      activo: true,
    };

    const newFam: Familia = {
      id: famId,
      codigo_familia: params.codigo_familia || `FAM-${(familias.length + 101).toString()}`,
      apellidos: params.apellidos,
      representante_id: repId,
      representante_principal: newRep,
      telefono_principal: params.representante_telefono,
      email_principal: params.representante_email,
      saldo_pendiente_centavos: 250000,
      credito_favor_centavos: 0,
      isp: {
        valor: 85,
        categoria: 'B',
        cobertura_datos: 0.8,
        confiabilidad: 'media',
        mensaje: 'Familia de nuevo ingreso con perfil inicial asignado.',
        penalizaciones: 0,
        desglose: [],
        ventana_pago_sugerida: {
          inicio_dia: 1,
          fin_dia: 10,
          patron: 'quincenal',
          confianza: 85,
        },
        requiere_aprobacion_humana: false,
      },
      estado_cartera: 'al_dia',
      consentimiento_whatsapp: true,
      opt_out_mensajeria: false,
      alumnos_ids: [almId],
      created_at: new Date().toISOString(),
    };

    // Create initial tuition fee
    const nuevaCuota: Cuota = {
      id: `cuota-${Date.now()}`,
      alumno_id: almId,
      alumno_nombre: params.alumno_nombre,
      representante_id: repId,
      familia_id: famId,
      arancel_concepto: 'Matrícula & Cuota Académica',
      periodo: periodoActivo,
      ciclo_academico: '2026-2027',
      monto_bruto_centavos: 250000,
      descuento_beca_centavos: 0,
      monto_neto_centavos: 250000,
      monto_pagado_centavos: 0,
      saldo_centavos: 250000,
      fecha_emision: `${periodoActivo}-01`,
      fecha_vencimiento: `${periodoActivo}-10`,
      estado: 'pendiente',
      es_prorrateada: false,
      version: 1,
    };

    const updatedReps = [...representantes, newRep];
    const updatedAlms = [...alumnos, newAlm];
    const updatedFams = [...familias, newFam];
    const updatedCuotas = [nuevaCuota, ...cuotas];

    setRepresentantes(updatedReps);
    setAlumnos(updatedAlms);
    setFamilias(updatedFams);
    setCuotas(updatedCuotas);

    saveState({
      representantes: updatedReps,
      alumnos: updatedAlms,
      familias: updatedFams,
      cuotas: updatedCuotas,
    });

    return { success: true };
  };

  const aprobarSolicitudNecesidad = (solicitud_id: string, etapa: 'pre_aprobacion' | 'presupuesto' | 'aprobacion_final') => {
    const updated = solicitudesNecesidades.map(s => {
      if (s.id === solicitud_id) {
        if (etapa === 'pre_aprobacion') {
          return { ...s, estado: 'en_presupuesto' as const, pre_aprobada_por_acm: currentUser.nombre };
        }
        if (etapa === 'presupuesto') {
          return { ...s, estado: 'presupuestada' as const, presupuestado_por_fin: currentUser.nombre };
        }
        if (etapa === 'aprobacion_final') {
          return { ...s, estado: 'aprobada' as const, aprobado_por_dir: currentUser.nombre };
        }
      }
      return s;
    });
    setSolicitudesNecesidades(updated);
    saveState({ solicitudesNecesidades: updated });
    return { success: true };
  };

  const aprobarReparacionActivo = (activo_id: string, aprobado: boolean) => {
    const updated = activos.map(a => {
      if (a.id === activo_id) {
        return {
          ...a,
          requiere_aprobacion_financiera_reparacion: !aprobado,
          estado_uso: aprobado ? ('en_reparacion' as const) : a.estado_uso,
        };
      }
      return a;
    });
    setActivos(updated);
  };

  const crearFichaLutheria = (params: {
    codigo_patrimonial: string;
    tipo_instrumento: string;
    marca_modelo: string;
    numero_serie: string;
    alumno_asociado_nombre?: string;
    profesor_catedra: string;
    reporte_usuario: string;
    evaluacion_luthier: string;
    clasificacion_dano: 'menor' | 'mayor' | 'critico';
    trabajos_planificados: string;
    repuestos: Array<{
      cantidad: number;
      descripcion: string;
      costo_unitario_centavos: number;
      costo_total_centavos: number;
    }>;
  }) => {
    const totalCost = params.repuestos.reduce((acc, r) => acc + r.costo_total_centavos, 0);
    // FIN-P18 §3: Limite de aprobación >= RD$3,000 (300,000 centavos)
    const reqApproval = totalCost >= 300000;
    const today = new Date().toISOString().split('T')[0];

    const nuevaFicha: FichaDiagnosticoLutheria = {
      id: `luth-${Date.now()}`,
      numero_ficha: `LUTH-${new Date().getFullYear()}-${String(fichasLutheria.length + 1).padStart(3, '0')}`,
      fecha_ingreso: today,
      luthier_nombre: 'Kalani (Luthier Sede)',
      codigo_patrimonial: params.codigo_patrimonial,
      tipo_instrumento: params.tipo_instrumento,
      marca_modelo: params.marca_modelo,
      numero_serie: params.numero_serie,
      alumno_asociado_nombre: params.alumno_asociado_nombre,
      profesor_catedra: params.profesor_catedra,
      reporte_usuario: params.reporte_usuario,
      evaluacion_luthier: params.evaluacion_luthier,
      clasificacion_dano: params.clasificacion_dano,
      trabajos_planificados: params.trabajos_planificados,
      repuestos: params.repuestos,
      costo_total_centavos: totalCost,
      requiere_aprobacion_financiera: reqApproval,
      aprobacion_financiera_estado: reqApproval ? 'pendiente' : 'no_requerida',
      estado_activo_final: reqApproval ? 'en_reparacion' : (params.clasificacion_dano === 'critico' ? 'desincorporado_baja' : 'reparado_calibrado'),
    };

    const updatedFichas = [nuevaFicha, ...fichasLutheria];
    setFichasLutheria(updatedFichas);

    // Update asset state if present
    const updatedActivos = activos.map(a => {
      if (a.codigo_inventario === params.codigo_patrimonial) {
        return {
          ...a,
          estado_conservacion: params.clasificacion_dano === 'critico' ? ('baja_propuesta' as const) : ('requiere_reparacion' as const),
          estado_uso: reqApproval ? ('en_reparacion' as const) : ('disponible' as const),
          costo_acumulado_reparaciones_centavos: a.costo_acumulado_reparaciones_centavos + totalCost,
          presupuesto_reparacion_pendiente_centavos: reqApproval ? totalCost : 0,
          requiere_aprobacion_financiera_reparacion: reqApproval,
        };
      }
      return a;
    });
    setActivos(updatedActivos);

    saveState({
      fichasLutheria: updatedFichas,
      activos: updatedActivos,
    });

    return { success: true, ficha: nuevaFicha };
  };

  const aprobarFichaLutheria = (ficha_id: string, aprobado: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const ficha = fichasLutheria.find(f => f.id === ficha_id);
    if (!ficha) return { success: false, error: 'Ficha no encontrada.' };

    const updatedFichas = fichasLutheria.map(f => {
      if (f.id === ficha_id) {
        return {
          ...f,
          aprobacion_financiera_estado: (aprobado ? 'autorizado' : 'rechazado') as any,
          aprobado_por_nombre: currentUser.nombre,
          fecha_aprobacion: today,
          estado_activo_final: (aprobado ? 'reparado_calibrado' : 'en_reparacion') as any,
        };
      }
      return f;
    });

    // If damage was critical and approved for write-off, record accounting entry AS-07 (Baja de Activo)
    let updatedAsientos = asientos;
    if (aprobado && ficha.clasificacion_dano === 'critico') {
      const nuevoAsientoBaja: AsientoContable = {
        id: `ast-baja-${Date.now()}`,
        numero: asientos.length + 1048,
        plantilla_id: 'AS-07',
        fecha_contable: today,
        periodo: periodoActivo,
        descripcion: `Desincorporación / Baja técnica de instrumento irreparable: ${ficha.codigo_patrimonial} (${ficha.tipo_instrumento})`,
        tipo: 'automatico',
        origen_entidad: 'lutheria',
        origen_id: ficha.id,
        lineas: [
          {
            cuenta_codigo: '5.2.05.01',
            cuenta_nombre: 'Pérdida por Desincorporación de Activos Fijos',
            centro_costo: 'LUT',
            debito_centavos: ficha.costo_total_centavos || 2800000,
            credito_centavos: 0,
          },
          {
            cuenta_codigo: '1.2.01.01',
            cuenta_nombre: 'Instrumentos Musicales Patrimoniales',
            centro_costo: 'LUT',
            debito_centavos: 0,
            credito_centavos: ficha.costo_total_centavos || 2800000,
          }
        ],
        total_debitos_centavos: ficha.costo_total_centavos || 2800000,
        total_creditos_centavos: ficha.costo_total_centavos || 2800000,
        cuadrado: true,
        estado: 'contabilizado',
      };
      updatedAsientos = [nuevoAsientoBaja, ...asientos];
      setAsientos(updatedAsientos);
    }

    setFichasLutheria(updatedFichas);
    saveState({
      fichasLutheria: updatedFichas,
      asientos: updatedAsientos,
    });

    return { success: true };
  };

  const crearContratoComodato = (params: {
    nombre_representante: string;
    nacionalidad_representante: string;
    estado_civil_representante: string;
    cedula_representante: string;
    direccion_representante: string;
    nombre_estudiante: string;
    alumno_id: string;
    tipo_instrumento: string;
    marca_modelo: string;
    numero_serie: string;
    codigo_patrimonial: string;
    valor_estimado_libros_centavos: number;
    fecha_inicio: string;
    fecha_termino: string;
  }) => {
    // Generate pseudo SHA-256 hash for signature stamp
    const raw = `${params.cedula_representante}-${params.codigo_patrimonial}-${Date.now()}`;
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += '0123456789abcdef'[Math.floor(Math.random() * 16)];
    }

    const nuevoContrato: ContratoComodato = {
      id: `com-${Date.now()}`,
      numero_contrato: `COM-${new Date().getFullYear()}-${String(contratosComodato.length + 1).padStart(3, '0')}`,
      fecha_inicio: params.fecha_inicio,
      fecha_termino: params.fecha_termino,
      nombre_representante: params.nombre_representante,
      nacionalidad_representante: params.nacionalidad_representante,
      estado_civil_representante: params.estado_civil_representante,
      cedula_representante: params.cedula_representante,
      direccion_representante: params.direccion_representante,
      nombre_estudiante: params.nombre_estudiante,
      alumno_id: params.alumno_id,
      tipo_instrumento: params.tipo_instrumento,
      marca_modelo: params.marca_modelo,
      numero_serie: params.numero_serie,
      codigo_patrimonial: params.codigo_patrimonial,
      valor_estimado_libros_centavos: params.valor_estimado_libros_centavos,
      hash_firma_sha256: hash,
      estado: 'vigente',
    };

    const updatedContratos = [nuevoContrato, ...contratosComodato];
    setContratosComodato(updatedContratos);

    // Update asset state
    const updatedActivos = activos.map(a => {
      if (a.codigo_inventario === params.codigo_patrimonial) {
        return {
          ...a,
          estado_uso: 'en_comodato' as const,
          alumno_asignado_nombre: params.nombre_estudiante,
        };
      }
      return a;
    });
    setActivos(updatedActivos);

    saveState({
      contratosComodato: updatedContratos,
      activos: updatedActivos,
    });

    return { success: true, contrato: nuevoContrato };
  };

  const crearEvaluacionPeriodoPrueba = (params: {
    nombre_colaborador: string;
    puesto_trabajo: string;
    departamento: string;
    fecha_ingreso: string;
    nombre_evaluador: string;
    calif_calidad: number;
    notas_calidad: string;
    calif_asistencia: number;
    notas_asistencia: string;
    calif_equipo: number;
    notas_equipo: string;
    calif_iniciativa: number;
    notas_iniciativa: string;
    fortalezas: string;
    areas_mejora: string;
  }) => {
    const promedio = Number(
      (
        params.calif_calidad * 0.25 +
        params.calif_asistencia * 0.25 +
        params.calif_equipo * 0.25 +
        params.calif_iniciativa * 0.25
      ).toFixed(2)
    );

    let dictamen: 'aprobado' | 'prorroga' | 'no_aprobado' = 'aprobado';
    if (promedio >= 3.0) {
      dictamen = 'aprobado';
    } else if (promedio >= 2.5) {
      dictamen = 'prorroga';
    } else {
      dictamen = 'no_aprobado';
    }

    const nuevaEval: EvaluacionPeriodoPrueba = {
      id: `eval-${Date.now()}`,
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      nombre_colaborador: params.nombre_colaborador,
      puesto_trabajo: params.puesto_trabajo,
      departamento: params.departamento,
      fecha_ingreso: params.fecha_ingreso,
      nombre_evaluador: params.nombre_evaluador,
      calif_calidad: params.calif_calidad,
      notas_calidad: params.notas_calidad,
      calif_asistencia: params.calif_asistencia,
      notas_asistencia: params.notas_asistencia,
      calif_equipo: params.calif_equipo,
      notas_equipo: params.notas_equipo,
      calif_iniciativa: params.calif_iniciativa,
      notas_iniciativa: params.notas_iniciativa,
      promedio_ponderado: promedio,
      dictamen,
      fortalezas: params.fortalezas,
      areas_mejora: params.areas_mejora,
      aprobado_direccion: true,
    };

    const updatedEvals = [nuevaEval, ...evaluacionesPrueba];
    setEvaluacionesPrueba(updatedEvals);
    saveState({ evaluacionesPrueba: updatedEvals });

    return { success: true, evaluacion: nuevaEval };
  };

  const completarTarea = (tarea_id: string) => {
    actualizarEstadoTarea({ tarea_id, nuevo_estado: 'completada' });
  };

  const actualizarEstadoTarea = (params: {
    tarea_id: string;
    nuevo_estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
    resolucion?: string;
  }) => {
    const actorDept = currentUser.rol === 'admin' ? 'DIR' : currentUser.rol === 'finanzas' ? 'FIN' : currentUser.rol === 'lutheria' ? 'LUT' : 'ADM';
    const updated = tareas.map(t => {
      if (t.id === params.tarea_id) {
        const prevEstado = t.estado;
        const newHistorial = [
          ...(t.historial || []),
          {
            id: `h-${Date.now()}`,
            actor: currentUser.nombre,
            rol: currentUser.rol,
            departamento: actorDept,
            accion: 'cambio_estado',
            campo: 'estado',
            valor_anterior: prevEstado,
            valor_nuevo: params.nuevo_estado,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
          }
        ];
        return {
          ...t,
          estado: params.nuevo_estado,
          resolucion: params.resolucion || t.resolucion,
          fecha_completada: params.nuevo_estado === 'completada' ? new Date().toISOString().split('T')[0] : t.fecha_completada,
          historial: newHistorial
        };
      }
      return t;
    });

    setTareas(updated);
    saveState({ tareas: updated });
    return { success: true };
  };

  const agregarComentarioTarea = (params: {
    tarea_id: string;
    texto: string;
  }) => {
    const actorDept = currentUser.rol === 'admin' ? 'DIR' : currentUser.rol === 'finanzas' ? 'FIN' : currentUser.rol === 'lutheria' ? 'LUT' : 'ADM';
    const nuevoComentario = {
      id: `c-${Date.now()}`,
      autor: currentUser.nombre,
      rol: currentUser.rol,
      departamento: actorDept,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      texto: params.texto
    };

    const updated = tareas.map(t => {
      if (t.id === params.tarea_id) {
        const comments = [...(t.comentarios || []), nuevoComentario];
        const newHistorial = [
          ...(t.historial || []),
          {
            id: `h-${Date.now()}`,
            actor: currentUser.nombre,
            rol: currentUser.rol,
            departamento: actorDept,
            accion: 'nuevo_comentario',
            valor_nuevo: params.texto.slice(0, 60),
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
          }
        ];
        return {
          ...t,
          comentarios: comments,
          historial: newHistorial
        };
      }
      return t;
    });

    setTareas(updated);
    saveState({ tareas: updated });
    return { success: true };
  };

  const escalarTareaADireccion = (params: {
    tarea_id: string;
    justificacion: string;
  }) => {
    const actorDept = currentUser.rol === 'admin' ? 'DIR' : currentUser.rol === 'finanzas' ? 'FIN' : currentUser.rol === 'lutheria' ? 'LUT' : 'ADM';
    const nuevoComentario = {
      id: `c-${Date.now()}`,
      autor: currentUser.nombre,
      rol: currentUser.rol,
      departamento: actorDept,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      texto: `[ESCALADO A DIRECCIÓN GENERAL]: ${params.justificacion}`
    };

    const updated = tareas.map(t => {
      if (t.id === params.tarea_id) {
        const comments = [...(t.comentarios || []), nuevoComentario];
        const newHistorial = [
          ...(t.historial || []),
          {
            id: `h-${Date.now()}`,
            actor: currentUser.nombre,
            rol: currentUser.rol,
            departamento: actorDept,
            accion: 'escalamiento_director',
            campo: 'departamento_destino',
            valor_anterior: t.departamento_destino,
            valor_nuevo: 'DIR',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
          }
        ];
        return {
          ...t,
          departamento_destino: 'DIR' as const,
          categoria: 'director' as const,
          prioridad: 'critica' as const,
          estado: 'en_progreso' as const,
          asignado_a: 'Dirección General (DIR)',
          comentarios: comments,
          historial: newHistorial
        };
      }
      return t;
    });

    setTareas(updated);
    saveState({ tareas: updated });
    return { success: true };
  };

  const generarRutinasAutomaticas = (tipo: 'todas' | 'cierre' | 'mora' | 'backfill' | 'dgii'): { creadas: number } => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nuevas: TareaInstitucional[] = [];

    if (tipo === 'todas' || tipo === 'cierre') {
      const existeCierre = tareas.some(t => t.titulo.includes('Cierre de Caja Diario') && t.fecha_limite === todayStr);
      if (!existeCierre) {
        nuevas.push({
          id: `task-cierre-${Date.now()}`,
          titulo: `Cierre de Caja Diario en Ventanilla (${todayStr})`,
          descripcion: 'Arqueo de efectivo en ventanilla física, conciliación contra recibos de cobro emitidos y firma de Ficha Oficial FIN-P14.',
          departamento_origen: 'FIN',
          departamento_destino: 'FIN',
          prioridad: 'media',
          estado: 'pendiente',
          categoria: 'rutina',
          fecha_creacion: todayStr,
          fecha_limite: todayStr,
          asignado_a: 'Katherine Sánchez (Caja)',
          creada_por: 'Sistema SOI Automatizado',
          comentarios: [],
          historial: [
            {
              id: `h-${Date.now()}-1`,
              actor: 'Sistema SOI',
              rol: 'sistema',
              departamento: 'FIN',
              accion: 'creacion_automatica',
              valor_nuevo: 'Rutina Diaria Cierre',
              timestamp: `${todayStr} 07:00`
            }
          ]
        });
      }
    }

    if (tipo === 'todas' || tipo === 'mora') {
      const cuotasMora = cuotas.filter(c => c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < new Date());
      if (cuotasMora.length > 0) {
        const existeMora = tareas.some(t => t.titulo.includes('Cobranza Preventiva y Acuerdos de Pago'));
        if (!existeMora) {
          nuevas.push({
            id: `task-mora-${Date.now()}`,
            titulo: `Cobranza Preventiva y Acuerdos de Pago (${cuotasMora.length} cuotas en mora)`,
            descripcion: 'Contactar a representantes con cuotas vencidas > 15 días para acordar compromisos de pago según protocolo humanizado FIN-P13.',
            departamento_origen: 'FIN',
            departamento_destino: 'ADM',
            prioridad: 'alta',
            estado: 'pendiente',
            categoria: 'cobranza',
            fecha_creacion: todayStr,
            fecha_limite: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
            asignado_a: 'Admisiones & Registro (ADM)',
            creada_por: 'Sistema SOI Automatizado',
            comentarios: [],
            historial: [
              {
                id: `h-${Date.now()}-2`,
                actor: 'Sistema SOI',
                rol: 'sistema',
                departamento: 'FIN',
                accion: 'creacion_automatica',
                valor_nuevo: 'Alerta Cartera Vencida',
                timestamp: `${todayStr} 07:05`
              }
            ]
          });
        }
      }
    }

    if (tipo === 'todas' || tipo === 'backfill') {
      const existeBackfill = tareas.some(t => t.titulo.includes('Campaña Backfill'));
      if (!existeBackfill) {
        nuevas.push({
          id: `task-backfill-${Date.now()}`,
          titulo: 'Campaña Backfill: Recolección de Contactos Representantes (232 Familias)',
          descripcion: 'Recolección de datos de contacto (cédula, teléfono WhatsApp y correo) para completar expedientes y habilitar avisos automatizados.',
          departamento_origen: 'FIN',
          departamento_destino: 'ADM',
          prioridad: 'alta',
          estado: 'en_progreso',
          categoria: 'hermes',
          fecha_creacion: todayStr,
          fecha_limite: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          asignado_a: 'Admisiones & Registro (ADM)',
          creada_por: 'Katherine Sánchez',
          comentarios: [],
          historial: [
            {
              id: `h-${Date.now()}-3`,
              actor: 'Sistema SOI',
              rol: 'sistema',
              departamento: 'FIN',
              accion: 'creacion_automatica',
              valor_nuevo: 'Backfill Contactos',
              timestamp: `${todayStr} 07:10`
            }
          ]
        });
      }
    }

    if (tipo === 'todas' || tipo === 'dgii') {
      const existeDGII = tareas.some(t => t.titulo.includes('Formato 606 DGII'));
      if (!existeDGII) {
        nuevas.push({
          id: `task-dgii-${Date.now()}`,
          titulo: 'Preparación y Validación de Formato 606 DGII (Gastos Agosto 2026)',
          descripcion: 'Verificar NCFs de gastos, retenciones de ITBIS e ISR en facturas del período antes de la fecha límite fiscal.',
          departamento_origen: 'FIN',
          departamento_destino: 'FIN',
          prioridad: 'alta',
          estado: 'pendiente',
          categoria: 'auditoria',
          fecha_creacion: todayStr,
          fecha_limite: '2026-09-15',
          asignado_a: 'Katherine Sánchez (Finanzas)',
          creada_por: 'Sistema SOI Automatizado',
          comentarios: [],
          historial: [
            {
              id: `h-${Date.now()}-4`,
              actor: 'Sistema SOI',
              rol: 'sistema',
              departamento: 'FIN',
              accion: 'creacion_automatica',
              valor_nuevo: 'Calendario Fiscal DGII',
              timestamp: `${todayStr} 07:15`
            }
          ]
        });
      }
    }

    if (nuevas.length > 0) {
      const updated = [...nuevas, ...tareas];
      setTareas(updated);
      saveState({ tareas: updated });
    }

    return { creadas: nuevas.length };
  };

  /**
   * SDD §3.2 & §13: Verificador de Invariantes (INV-01 a INV-14)
   */
  const verificarInvariantes = (): InvarianteCheckResult[] => {
    const results: InvarianteCheckResult[] = [];

    // INV-01: Σ débitos = Σ créditos en asientos
    const asientosDescuadrados = asientos.filter(a => a.total_debitos_centavos !== a.total_creditos_centavos);
    results.push({
      id: 'INV-01',
      nombre: 'Cuadre de Partida Doble',
      cumple: asientosDescuadrados.length === 0,
      detalles: asientosDescuadrados.length === 0
        ? `Todos los ${asientos.length} asientos del libro mayor cumplen Débitos = Créditos.`
        : `${asientosDescuadrados.length} asiento(s) descuadrado(s) detectado(s).`,
      formula: 'Σ Débitos === Σ Créditos en todo asiento contabilizado',
    });

    // INV-02: cuota.monto_neto = monto_bruto - descuento_beca
    const cuotasNetoInvalido = cuotas.filter(c => c.monto_neto_centavos !== (c.monto_bruto_centavos - c.descuento_beca_centavos));
    results.push({
      id: 'INV-02',
      nombre: 'Integridad de Cuota Neta',
      cumple: cuotasNetoInvalido.length === 0,
      detalles: cuotasNetoInvalido.length === 0
        ? `Las ${cuotas.length} cuotas activas cuadran exactamente Neto = Bruto - Beca.`
        : `${cuotasNetoInvalido.length} cuota(s) con discrepancia de beca.`,
      formula: 'cuota.monto_neto = monto_bruto − descuento_beca',
    });

    // INV-03: cuota.saldo = monto_neto - monto_pagado y 0 <= pagado <= neto
    const cuotasSaldoInvalido = cuotas.filter(c => c.saldo_centavos !== (c.monto_neto_centavos - c.monto_pagado_centavos) || c.monto_pagado_centavos > c.monto_neto_centavos);
    results.push({
      id: 'INV-03',
      nombre: 'Integridad de Saldo de Cartera',
      cumple: cuotasSaldoInvalido.length === 0,
      detalles: cuotasSaldoInvalido.length === 0
        ? 'Ninguna cuota sobrepagada ni con saldo negativo.'
        : `${cuotasSaldoInvalido.length} cuota(s) con saldo incongruente.`,
      formula: 'cuota.saldo = monto_neto − monto_pagado (0 ≤ pagado ≤ neto)',
    });

    // INV-04 & INV-05: pago.monto - Σ aplicaciones = crédito generado
    const pagosIncongruentes = pagos.filter(p => {
      const sumaApps = p.aplicaciones.reduce((acc, a) => acc + a.monto_aplicado_centavos, 0);
      return (p.monto_total_centavos - sumaApps) !== p.credito_generado_centavos;
    });
    results.push({
      id: 'INV-04/05',
      nombre: 'Conservación Monetaria de Pagos y Wallet',
      cumple: pagosIncongruentes.length === 0,
      detalles: pagosIncongruentes.length === 0
        ? `Todos los ${pagos.length} pagos cumplen Monto = Aplicado + Crédito Wallet.`
        : `${pagosIncongruentes.length} pago(s) con fuga de centavos detectada.`,
      formula: 'pago.monto − Σ aplicaciones = crédito_generado',
    });

    // INV-07: partida.disponible = presupuestado - comprometido - pagado
    const partidasSobregiradas = partidas.filter(p => p.disponible_centavos < 0);
    results.push({
      id: 'INV-07',
      nombre: 'No Sobregiro Presupuestario',
      cumple: partidasSobregiradas.length === 0,
      detalles: partidasSobregiradas.length === 0
        ? 'Todas las 5 partidas presupuestarias tienen saldo disponible >= 0.'
        : `${partidasSobregiradas.length} partida(s) con sobregiro no autorizado.`,
      formula: 'partida.disponible = anual − comprometido − pagado ≥ 0',
    });

    // INV-12: aprobador_id != personal_id en nómina (G-06)
    const autoAprobados = nomina.filter(n => n.aprobado_direccion && n.maestro_id === currentUser.id && currentUser.rol === 'coordinacion');
    results.push({
      id: 'INV-12',
      nombre: 'Segregación Anti-Autoaprobación en Nómina',
      cumple: autoAprobados.length === 0,
      detalles: autoAprobados.length === 0
        ? 'Regla dura respetada: ningún coordinador aprueba sus propios honorarios.'
        : 'Violación de segregación de funciones detectada en nómina.',
      formula: 'aprobador_id ≠ personal_id en toda compensación aprobada',
    });

    return results;
  };

  const resetearDatos = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Receivables (familias/representantes/alumnos/cuotas/pagos) are NEVER
    // reset to demo data — Supabase is their only source of truth. "Reset"
    // for this module means re-sync from the authoritative backend, not
    // reload fixtures.
    refreshAuthoritativeReceivables();
    setCompromisos([]);
    setBecas([]);
    setPatrocinadores([]);
    setProveedores([]);
    setFacturasGasto([]);
    setCuentasBancarias([]);
    setTransaccionesBancarias([]);
    setPartidas([]);
    setSolicitudesNecesidades([]);
    setNomina([]);
    setActivos([]);
    setObligacionesFiscales([]);
    setAsientos([]);
    setTareas([]);
    setCierresCaja([]);
  };

  return (
    <FinanceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers,
        periodoActivo,
        setPeriodoActivo,
        familias,
        representantes,
        alumnos,
        cuotas,
        pagos,
        compromisos,
        becas,
        patrocinadores,
        patrocinios,
        proveedores,
        gastosFijos,
        gastosFijosPagos,
        serviciosRecurrentes,
        facturasGasto,
        cuentasBancarias,
        transaccionesBancarias,
        partidas,
        solicitudesNecesidades,
        nomina,
        activos,
        fichasLutheria,
        contratosComodato,
        evaluacionesPrueba,
        obligacionesFiscales,
        asientos,
        tareas,
        cierresCaja,
        selectedFamiliaIdForPayment,
        setSelectedFamiliaIdForPayment,
        iniciarCobroFamilia,
        supabaseStatus,
        lastSupabaseSync,
        supabaseErrorMessage,
        refreshAuthoritativeReceivables,
        serviceBalanceStatus: serviceBalances.status,
        authoritativeServiceBalances: serviceBalances.items,
        serviceBalanceErrorMessage: serviceBalances.errorMessage,
        serviceBalanceRefreshing: serviceBalances.isRefreshing,
        canRequestServiceBalanceRefresh: serviceBalances.canRequestManualRefresh,
        serviceBalanceRefreshOutcome: serviceBalances.manualRefreshOutcome,
        serviceBalanceRefreshMessage: serviceBalances.manualRefreshMessage,
        requestServiceBalanceRefresh: serviceBalances.requestManualRefresh,
        registrarPagoTransaccional,
        generarCuotasMensuales,
        crearCompromisoPago,
        aprobarBeca,
        crearSolicitudBeca,
        aprobarFacturaGasto,
        registrarPagoFacturaGasto,
        crearFacturaGasto,
        crearGastoFijo,
        registrarPagoGastoFijo,
        generarInstanciasGastosFijosMes,
        crearServicioRecurrente,
        registrarPagoServicioRecurrente,
        crearCierreCaja,
        conciliarTransaccion,
        conciliarTodoAutomatico,
        importarExtractoBancario,
        crearPartidaPresupuestaria,
        trasladarPresupuesto,
        crearTareaInstitucional,
        crearNuevaFamilia,
        aprobarLineaNomina,
        dispersarNominaDocente,
        aprobarSolicitudNecesidad,
        aprobarReparacionActivo,
        crearFichaLutheria,
        aprobarFichaLutheria,
        crearContratoComodato,
        crearEvaluacionPeriodoPrueba,
        completarTarea,
        actualizarEstadoTarea,
        agregarComentarioTarea,
        escalarTareaADireccion,
        generarRutinasAutomaticas,
        verificarInvariantes,
        resetearDatos,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
