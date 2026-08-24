// Types for SOI FINANZAS - El Sistema Punta Cana (FUNEYCA-PC)

export type Moneda = 'DOP' | 'USD';

export type UserRole = 'admin' | 'director' | 'finanzas' | 'coordinacion' | 'auditor' | 'junta';

export interface UsuarioActual {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  departamento: 'FIN' | 'DIR' | 'ACM' | 'ADM' | 'LOG' | 'LUT';
  avatar?: string;
}

// Representación monetaria segura en centavos
export interface Dinero {
  centavos: number; // Siempre entero
  moneda: Moneda;
}

export type EstadoCuota = 'pendiente' | 'parcial' | 'pagada' | 'condonada' | 'anulada';
export type MetodoPago = 'efectivo' | 'transferencia' | 'pago_movil' | 'tarjeta' | 'mixto' | 'credito_favor';

export interface Alumno {
  id: string;
  nombre_completo: string;
  instrumento_principal: string;
  nivel: string;
  familia_id: string;
  fecha_ingreso: string;
  exento_mensualidad: boolean;
  activo: boolean;
  mora_flag?: boolean;
  bloqueo_certificado?: boolean;
  bloqueo_evento?: boolean;
  abandono_score?: number;
  // fallback de contacto si no hay representante explícito
  representante_nombre?: string;
  representante_cedula?: string;
  representante_tlf?: string;
  correo_representante?: string;
}

export interface Representante {
  id: string;
  familia_id: string;
  nombre_completo: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion?: string;
  parentesco?: string;
}

export interface ISPComponente {
  nombre: string;
  puntos: number;
  peso: number;
  disponible: boolean;
  dato_crudo: string;
  descripcion: string;
}

export interface ISPScore {
  valor: number; // 0 - 100
  categoria: 'A' | 'B' | 'C' | 'D' | 'E' | 'SIN_HISTORIAL';
  cobertura_datos: number; // 0 - 1 (e.g. 0.85 = 85%)
  confiabilidad: 'alta' | 'media' | 'baja' | 'sin_historial';
  mensaje?: string;
  penalizaciones: number;
  desglose: ISPComponente[];
  ventana_pago_sugerida: {
    inicio_dia: number;
    fin_dia: number;
    patron: 'quincenal' | 'fin_de_mes' | 'irregular';
    confianza: number;
  };
  requiere_aprobacion_humana: boolean; // Salvaguarda ética (SDD §8.2)
}

export interface Familia {
  id: string;
  codigo_familia: string;
  apellidos: string;
  representante_id?: string;
  representante_principal?: Representante;
  telefono_principal: string;
  email_principal: string;
  saldo_pendiente_centavos: number;
  credito_favor_centavos: number;
  isp: ISPScore;
  estado_cartera: 'al_dia' | 'preventivo' | 'mora_temprana' | 'mora_critica' | 'convenio' | 'becado_total';
  consentimiento_whatsapp: boolean;
  opt_out_mensajeria: boolean;
  alumnos_ids: string[];
  notas_cobranza?: string;
  created_at: string;
}

export interface Cuota {
  id: string;
  alumno_id: string;
  alumno_nombre: string;
  representante_id: string;
  familia_id: string;
  arancel_concepto: string;
  periodo: string; // YYYY-MM
  ciclo_academico: string;
  monto_bruto_centavos: number;
  descuento_beca_centavos: number;
  monto_neto_centavos: number; // = bruto - beca (INV-02)
  monto_pagado_centavos: number;
  saldo_centavos: number; // = neto - pagado (INV-03)
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_pago_completo?: string;
  estado: EstadoCuota;
  es_prorrateada: boolean;
  dias_prorrateo?: number;
  beca_id?: string;
  beca_nombre?: string;
  asiento_id?: string;
  version: number;
}

export interface AplicacionPago {
  id: string;
  pago_id: string;
  cuota_id: string;
  monto_aplicado_centavos: number;
  dias_atraso_al_aplicar: number;
  cuota_periodo: string;
  cuota_concepto: string;
  alumno_nombre: string;
}

export interface Pago {
  id: string;
  numero_recibo: string; // REC-00012345 correlativo sin huecos (G-02)
  familia_id: string;
  familia_nombre: string;
  representante_id?: string;
  representante_nombre: string;
  monto_total_centavos: number;
  credito_generado_centavos: number;
  fecha_pago: string; // fecha de valor
  fecha_registro: string; // fecha de captura
  metodo_pago: MetodoPago;
  referencia_bancaria?: string;
  comprobante_url?: string;
  estado: 'confirmado' | 'pendiente_verificacion' | 'reversado';
  registrado_por: string;
  registrado_por_nombre: string;
  aplicaciones: AplicacionPago[];
  asiento_id?: string;
  observaciones?: string;
  idempotency_key?: string;
}

export interface CompromisoPago {
  id: string;
  familia_id: string;
  representante_id: string;
  cuotas_ids: string[];
  monto_comprometido_centavos: number;
  fecha_compromiso: string;
  fecha_limite: string;
  estado: 'pendiente' | 'cumplido' | 'incumplido' | 'renegociado';
  acuerdo_texto: string;
  registrado_por: string;
}

/**
 * Refleja la tabla real `public.becas` (verificada en vivo, 2026-08-23) — no
 * la tabla `programas_beneficio`/`alumnos_beneficios` que aparece en
 * `20260823192500_programa_becas_patrocinios.sql` pero NUNCA se aplicó.
 * `becas` no tiene columna `estado` ni `tipo`: se derivan aquí de `activa`
 * y `aprobado_por`/`porcentaje` para no romper la UI existente, y tampoco
 * referencia patrocinantes — el vínculo con `patrocinios` es independiente.
 */
export interface Beca {
  id: string;
  alumno_id: string;
  alumno_nombre?: string; // Hydrated from alumno
  familia_id: string;
  porcentaje: number;
  motivo: string;
  aprobado_por?: string;
  aprobado_por_nombre?: string; // Hydrated, best-effort
  activa: boolean;
  fecha_inicio: string;
  fecha_fin?: string;
  indicador_progreso_minimo?: string;

  // Derivados para la UI (sin columna propia en `becas`):
  estado: 'solicitado' | 'activo' | 'revocado';
  tipo: 'total' | 'parcial_porcentaje';
  motivo_socioeconomico: string; // alias de `motivo`
  patrocinador_nombre?: string; // becas no enlaza a patrocinantes; casi siempre undefined
}

export type TipoPatrocinante = 'persona' | 'empresa';
export type PatrocinioCubre = 'cuotas' | 'wallet' | 'accesorios' | 'todo';

/** Refleja la tabla real `public.patrocinantes` (no `patrocinadores`, que no existe). */
export interface Patrocinador {
  id: string;
  nombre: string;
  tipo: TipoPatrocinante;
  contacto?: string;
  email?: string;
  telefono?: string;
  activo: boolean;
  notas?: string;

  // Derivados de `patrocinios` — no son columnas propias de `patrocinantes`:
  monto_comprometido_anual_centavos: number; // suma de patrocinios activos * 12
  monto_recibido_acumulado_centavos: number; // sin tabla de cobros reales todavía; siempre 0, no inventado
  moneda_acordada: 'DOP';
}

/** Refleja la tabla real `public.patrocinios`. */
export interface Patrocinio {
  id: string;
  patrocinante_id: string;
  patrocinante_nombre?: string; // Hydrated
  alumno_id: string;
  familia_id: string;
  cubre: PatrocinioCubre;
  monto_mensual_centavos: number;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin?: string;
}

export interface CierreCaja {
  id: string;
  numero_cierre: string; // CC-000123
  fecha: string;
  monto_apertura_centavos: number;
  efectivo_cobrado_centavos: number;
  efectivo_egresos_centavos: number;
  monto_esperado_centavos: number;
  monto_contado_centavos: number;
  diferencia_centavos: number;
  motivo_diferencia?: string;
  estado: 'borrador' | 'cerrado' | 'auditado';
  cajero_id: string;
  cajero_nombre: string;
  auditado_por?: string;
  auditado_at?: string;
  pagos_incluidos_ids: string[];
  observaciones?: string;
}

export interface Proveedor {
  id: string;
  rnc_cedula: string;
  nombre_comercial: string;
  razon_social: string;
  categoria: 'instrumentos' | 'servicios_basicos' | 'alquiler' | 'suministros' | 'mantenimiento' | 'honorarios' | 'otro';
  contacto: string;
  telefono: string;
  email: string;
  cuenta_bancaria_info?: string;
  activo: boolean;
}

export type EstadoFactura = 'borrador' | 'recibida' | 'validada' | 'aprobada' | 'programada' | 'pagada' | 'anulada';

export interface FacturaGasto {
  id: string;
  numero_factura: string;
  ncf?: string; // Número de Comprobante Fiscal (DGII)
  proveedor_id: string;
  proveedor_nombre: string;
  concepto: string;
  centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
  partida_presupuestaria_id: string;
  monto_bruto_centavos: number;
  itbis_centavos: number;
  retencion_centavos: number;
  monto_neto_centavos: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_pago?: string;
  estado: EstadoFactura;
  solicitado_por: string;
  solicitado_por_nombre: string;
  aprobado_por?: string;
  aprobado_por_nombre?: string;
  metodo_pago?: MetodoPago;
  referencia_pago?: string;
  documento_adjunto_url?: string;
  asiento_id?: string;
}

export type CategoriaGastoFijo = 'comunicaciones' | 'energia' | 'agua' | 'limpieza' | 'personal' | 'alquiler' | 'software' | 'seguro' | 'otro';

export interface ServicioRecurrente {
  id: string;
  nombre: string;
  tipo: 'energia' | 'internet' | 'alquiler' | 'otro';
  proveedor_id?: string;
  proveedor_nombre: string;
  numero_contrato_cuenta: string;
  monto_promedio_mensual_centavos: number;
  monto_ultimo_facturado_centavos?: number;
  proxima_fecha_vencimiento: string;
  dias_restantes: number;
  estado: 'al_dia' | 'por_vencer' | 'vencido';
  es_servicio_esencial?: boolean;
}

/** Plantilla recurrente — tabla real `gastos_fijos`. Ventana de pago (día_inicio-día_fin), no un solo día de vencimiento. */
export interface GastoFijo {
  id: string;
  nombre: string;
  categoria: CategoriaGastoFijo;
  centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
  monto_centavos: number;
  dia_inicio: number;
  dia_fin: number;
  repetir_mensual: boolean;
  activo: boolean;
  notas?: string;
  created_at: string;
}

/** Instancia mensual de un gasto fijo — tabla real `gastos_fijos_pagos`. */
export interface GastoFijoPago {
  id: string;
  gasto_fijo_id: string;
  periodo_anio: number;
  periodo_mes: number;
  monto_centavos: number;
  estado: 'pendiente' | 'pagado';
  fecha_pago?: string;
  referencia?: string;
}

export type ServiceBalanceLoadStatus = 'loading' | 'online' | 'empty' | 'unconfigured' | 'error';

/** Safe projection returned by the FIN dashboard RPC; it never contains account credentials. */
export interface AuthoritativeServiceBalance {
  serviceAccountId: string;
  providerKey: string;
  providerName: string;
  accountName: string;
  serviceType: string;
  essential: boolean;
  refreshEnabled: boolean;
  connectorStatus: 'unconfigured' | 'active' | 'disabled' | 'unsupported';
  observedAt: string | null;
  balanceCentavos: number | null;
  amountDueCentavos: number | null;
  dueDate: string | null;
  currencyCode: string;
  daysRemaining: number | null;
  lastQueryAt: string | null;
  lastSuccessAt: string | null;
  lastStatus: 'never' | 'success' | 'unsupported' | 'skipped' | 'error';
  lastErrorCode: string | null;
}

export interface CuentaBancaria {
  id: string;
  banco: string; // 'Banco Popular Dominicano', 'Banreservas'
  numero_cuenta: string;
  tipo_cuenta: 'corriente' | 'ahorros';
  moneda: Moneda;
  saldo_libro_centavos: number;
  saldo_extracto_centavos: number;
  ultimo_extracto_fecha: string;
}

export interface TransaccionBancaria {
  id: string;
  cuenta_id: string;
  fecha: string;
  descripcion: string;
  referencia: string;
  debito_centavos: number; // Salida
  credito_centavos: number; // Entrada
  estado_conciliacion: 'conciliada' | 'sugerida' | 'pendiente' | 'discrepancia';
  pago_id?: string;
  factura_id?: string;
  confianza_match?: number; // 0 - 100%
  nota_discrepancia?: string;
}

export interface PartidaPresupuestaria {
  id: string;
  codigo_partida: string;
  nombre: string;
  centro_costo: 'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT';
  monto_anual_centavos: number;
  comprometido_centavos: number;
  devengado_centavos: number;
  pagado_centavos: number;
  disponible_centavos: number; // = anual - comprometido - pagado (INV-07)
  distribucion_mensual_centavos: number[];
}

export type EstadoSolicitudNecesidad = 
  | 'pendiente'
  | 'pre_aprobada_acm'
  | 'en_presupuesto'
  | 'presupuestada'
  | 'aprobada'
  | 'rechazada'
  | 'comprada'
  | 'entregada'
  | 'cancelada';

export interface SolicitudNecesidad {
  id: string;
  titulo: string;
  descripcion: string;
  area: 'ACM' | 'LUT' | 'LOG' | 'ADM' | 'FIN';
  solicitante_id: string;
  solicitante_nombre: string;
  categoria: 'instrumentos' | 'accesorios' | 'partituras' | 'mobiliario' | 'insumos_lutería' | 'tecnologia';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  cantidad: number;
  costo_estimado_centavos: number;
  presupuesto_disponible_centavos?: number;
  cotizaciones_urls?: string[];
  estado: EstadoSolicitudNecesidad;
  pre_aprobada_por_acm?: string;
  presupuestado_por_fin?: string;
  aprobado_por_dir?: string;
  proveedor_sugerido?: string;
  fecha_solicitud: string;
}

export interface LineaNomina {
  id: string;
  maestro_id: string;
  maestro_nombre: string;
  especialidad: string;
  horas_asignadas: number;
  horas_trabajadas_validadas: number;
  ausencias_injustificadas: number;
  tarifa_hora_centavos: number;
  monto_base_centavos: number;
  bonos_centavos: number;
  retencion_tss_centavos: number;
  retencion_isr_centavos: number;
  monto_neto_centavos: number;
  aprobado_coordinacion: boolean;
  aprobado_coordinacion_por?: string; // Validación INV-12: aprobador != maestro_id
  aprobado_direccion: boolean;
  estado_pago: 'borrador' | 'validado' | 'aprobado' | 'pagado';
}

export interface ActivoInstrumento {
  id: string;
  codigo_inventario: string;
  tipo_instrumento: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  valor_adquisicion_centavos: number;
  estado_conservacion: 'excelente' | 'bueno' | 'regular' | 'requiere_reparacion' | 'baja_propuesta';
  estado_uso: 'disponible' | 'en_comodato' | 'en_reparacion' | 'baja_confirmada';
  alumno_asignado_nombre?: string;
  comodato_contrato_url?: string;
  costo_acumulado_reparaciones_centavos: number;
  presupuesto_reparacion_pendiente_centavos?: number;
  requiere_aprobacion_financiera_reparacion: boolean; // si presupuesto > RD$5,000
}

export interface ObligacionFiscal {
  id: string;
  nombre: string; // 'Formato 606 DGII Compras', 'TSS Pago Nómina', 'Declaración Jurada IR-2'
  entidad: 'DGII' | 'TSS' | 'MINERD' | 'OTRO';
  periodo_fiscal: string;
  fecha_limite: string;
  dias_restantes: number;
  monto_estimado_centavos?: number;
  estado: 'pendiente_preparacion' | 'validado_listo' | 'presentado_pagado' | 'vencido';
  comprobante_url?: string;
}

export interface AsientoLinea {
  cuenta_codigo: string;
  cuenta_nombre: string;
  centro_costo: string;
  debito_centavos: number;
  credito_centavos: number;
}

export interface AsientoContable {
  id: string;
  numero: number; // Correlativo estricto sin huecos
  plantilla_id: string; // 'AS-01', 'AS-02', etc.
  fecha_contable: string;
  periodo: string;
  descripcion: string;
  tipo: 'automatico' | 'manual' | 'ajuste' | 'cierre' | 'apertura';
  origen_entidad?: string;
  origen_id?: string;
  lineas: AsientoLinea[];
  total_debitos_centavos: number;
  total_creditos_centavos: number;
  cuadrado: boolean; // INV-01
  estado: 'borrador' | 'contabilizado' | 'anulado';
}

export interface TareaHistorialLog {
  id: string;
  actor: string;
  rol: string;
  departamento: string;
  accion: string;
  campo?: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  timestamp: string;
}

export interface TareaComentario {
  id: string;
  autor: string;
  rol: string;
  departamento: string;
  fecha: string;
  texto: string;
}

export interface TareaInstitucional {
  id: string;
  titulo: string;
  descripcion: string;
  departamento_origen: 'FIN' | 'DIR' | 'ACM' | 'ADM' | 'LOG' | 'LUT';
  departamento_destino: 'FIN' | 'DIR' | 'ACM' | 'ADM' | 'LOG' | 'LUT';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
  categoria?: 'director' | 'hermes' | 'rutina' | 'cobranza' | 'auditoria';
  fecha_limite: string;
  fecha_creacion?: string;
  fecha_completada?: string;
  asignado_a?: string;
  resolucion?: string;
  vinculo_entidad_tipo?: string;
  vinculo_entidad_id?: string;
  creada_por: string;
  comentarios?: TareaComentario[];
  historial?: TareaHistorialLog[];
}

export interface InvarianteCheckResult {
  id: string;
  nombre: string;
  cumple: boolean;
  detalles: string;
  formula: string;
}

export interface FichaDiagnosticoLutheria {
  id: string;
  numero_ficha: string; // LUTH-2026-001
  fecha_ingreso: string;
  luthier_nombre: string;
  codigo_patrimonial: string;
  tipo_instrumento: string;
  marca_modelo: string;
  numero_serie: string;
  alumno_asociado_nombre?: string;
  alumno_uuid?: string;
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
  costo_total_centavos: number;
  requiere_aprobacion_financiera: boolean; // Si >= RD$3,000 (FIN-P18 §3)
  aprobacion_financiera_estado: 'pendiente' | 'autorizado' | 'rechazado' | 'no_requerida';
  aprobado_por_nombre?: string;
  fecha_aprobacion?: string;
  estado_activo_final: 'en_reparacion' | 'reparado_calibrado' | 'desincorporado_baja';
  fecha_entrega?: string;
}

export interface ContratoComodato {
  id: string;
  numero_contrato: string; // COM-2026-042
  fecha_inicio: string;
  fecha_termino: string;
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
  hash_firma_sha256: string;
  estado: 'vigente' | 'devuelto' | 'rescision_inasistencias' | 'reclamacion_dano';
}

export interface EvaluacionPeriodoPrueba {
  id: string;
  fecha_evaluacion: string;
  nombre_colaborador: string;
  puesto_trabajo: string;
  departamento: string;
  fecha_ingreso: string;
  nombre_evaluador: string;
  calif_calidad: number; // 1 a 5 (Peso 25%)
  notas_calidad: string;
  calif_asistencia: number; // 1 a 5 (Peso 25%)
  notas_asistencia: string;
  calif_equipo: number; // 1 a 5 (Peso 25%)
  notas_equipo: string;
  calif_iniciativa: number; // 1 a 5 (Peso 25%)
  notas_iniciativa: string;
  promedio_ponderado: number; // Formula: sum(calif * 0.25)
  dictamen: 'aprobado' | 'prorroga' | 'no_aprobado';
  fortalezas: string;
  areas_mejora: string;
  aprobado_direccion: boolean;
}

// ==========================================
// MÓDULO PROCUREMENT INTELLIGENCE ("TIENDITA")
// ==========================================

export type MarketplaceId = 'amazon' | 'aliexpress' | 'alibaba' | 'ebay' | 'temu' | 'shein' | 'local_do';

export type ResultSourceType = 'LIVE_API' | 'SAVED_PRICE' | 'MANUAL_QUOTE' | 'EXTERNAL_SEARCH';

export interface PriceHistoryPoint {
  date: string;
  priceUsd: number;
  source: string;
}

export interface LandedCostEstimate {
  unitPriceUsd: number;
  quantity: number;
  subtotalUsd: number;
  shippingUsd: number;
  customsTaxUsd: number; // Arancel / ITBIS de importación
  localHandlingUsd: number; // Courier / Despacho local
  totalLandedUsd: number;
  exchangeRateDop: number;
  totalLandedDop: number;
}

export interface NormalizedProductResult {
  id: string;
  marketplace: MarketplaceId;
  marketplaceName: string;
  marketplaceLogo?: string;
  title: string;
  imageUrl: string;
  unitPriceUsd: number;
  shippingCostUsd: number;
  estimatedTotalUsd: number;
  estimatedTotalDop: number;
  seller: string;
  sellerRating: number; // 0 - 5 or %
  deliveryDaysEstimated: number;
  matchScore: number; // 0 - 100%
  matchReasons: string[];
  specs: Record<string, string>;
  productUrl: string;
  moq: number; // Minimum Order Quantity (1 for retail, >1 for wholesale/Alibaba)
  tieredPricing?: Array<{ minUnits: number; pricePerUnitUsd: number }>;
  resultType: ResultSourceType;
  inStock: boolean;
  notes?: string;
}

export interface SavedProduct {
  id: string;
  title: string;
  category: string;
  marketplace: MarketplaceId;
  marketplaceName: string;
  productUrl: string;
  imageUrl: string;
  currentPriceUsd: number;
  currency: Moneda;
  shippingCostUsd: number;
  estimatedTotalUsd: number;
  seller: string;
  specs: Record<string, string>;
  variant?: string;
  quantity: number;
  moq: number;
  dateChecked: string;
  firstObservedPriceUsd: number;
  lowestObservedPriceUsd: number;
  highestObservedPriceUsd: number;
  priceHistory: PriceHistoryPoint[];
  targetPriceAlertUsd?: number;
  alertTriggered?: boolean;
  linkedSolicitudId?: string;
  status: 'guardado' | 'en_evaluacion' | 'seleccionado' | 'descartado';
  lifecycleStatus: 'researching' | 'quotation_selected' | 'budget_review' | 'approval' | 'ready_to_purchase' | 'purchased' | 'in_transit' | 'received' | 'invoice_attached' | 'paid' | 'closed';
  notes?: string;
}

export interface ProcurementRequirement {
  id: string;
  category: string;
  title: string;
  description: string;
  specifications: Record<string, string>;
  quantity: number;
  budgetTargetUnitUsd?: number;
  budgetTargetTotalUsd?: number;
  preferredMarketplaces: MarketplaceId[];
  linkedSolicitudId?: string;
  status: 'abierto' | 'con_cotizaciones' | 'aprobado' | 'cerrado';
  createdAt: string;
}

export interface LocalSupplierQuote {
  id: string;
  supplierName: string;
  rnc: string;
  contactPhone: string;
  contactEmail: string;
  itemDescription: string;
  quantity: number;
  unitPriceDop: number;
  itbisDop: number;
  deliveryCostDop: number;
  totalDop: number;
  totalUsdEquivalent: number;
  quotationNumber: string;
  validityDate: string;
  deliveryDays: number;
  notes?: string;
  linkedSolicitudId?: string;
}

export interface ProcurementComparison {
  id: string;
  solicitudId: string;
  solicitudTitulo: string;
  department: string;
  quantityRequested: number;
  availableBudgetDop: number;
  committedBudgetDop: number;
  projectedRemainingDop: number;
  offers: Array<{
    id: string;
    source: string;
    type: 'online' | 'local';
    providerName: string;
    productTitle: string;
    unitCostDop: number;
    totalCostDop: number;
    deliveryTimeline: string;
    matchScore: number;
    status: 'recomendada' | 'seleccionada' | 'rechazada' | 'evaluando';
    justification?: string;
    url?: string;
  }>;
  selectedOfferId?: string;
  selectionJustification?: string;
}

// ==========================================
// MÓDULO DE CONEXIÓN Y DIAGNÓSTICO SUPABASE
// ==========================================

export interface SupabaseConfigState {
  supabaseUrl: string;
  publishableKey: string;
  environment: 'production' | 'staging' | 'development';
  isConnected: boolean;
  lastTestTimestamp?: string;
  authenticatedUser?: {
    id: string;
    email: string;
    role: string;
  };
  rlsStatus: 'enforced' | 'permissive' | 'disabled' | 'unknown';
}

export interface DiagnosticTestItem {
  id: string;
  category: 'connection' | 'auth' | 'tables' | 'rpcs' | 'storage' | 'security';
  name: string;
  description: string;
  status: 'passed' | 'warning' | 'failed' | 'pending';
  latencyMs?: number;
  details: string;
  resourceName?: string;
}
