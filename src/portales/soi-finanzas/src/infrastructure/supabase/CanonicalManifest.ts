/**
 * CANONICAL SOI DATABASE MANIFEST
 * 
 * Maps FIN financial domain concepts to authoritative Supabase tables and RPCs in SOI.
 * Reference: Live OpenAPI Schema from Supabase project zmhmdvmyeyswunurcyow
 */

export interface CanonicalMapping {
  domainConcept: string;
  soiResource: string;
  resourceType: 'table' | 'rpc' | 'view';
  status: 'MAPPED_AND_ACTIVE' | 'RESOURCE_NOT_MAPPED' | 'PLANNED';
  keyFieldsOrSignature: string;
  notes: string;
}

export const CANONICAL_SOI_MANIFEST: CanonicalMapping[] = [
  {
    domainConcept: 'Families (Familias)',
    soiResource: 'public.familias',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), nombre_familia (text), activa (bool), fecha_ingreso (date), datos_extra (jsonb), created_at (timestamptz)',
    notes: 'System of Record for family units. Linked to Alumnos via alumnos.familia_id'
  },
  {
    domainConcept: 'Students (Alumnos)',
    soiResource: 'public.alumnos',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), familia_id (uuid), nombre_completo (text), representante_nombre (text), representante_cedula (text), representante_tlf (text), correo_representante (text), mora_flag (bool), activo (bool)',
    notes: 'System of Record for enrolled music students and legal guardians'
  },
  {
    domainConcept: 'Fees & Invoices (Cuotas)',
    soiResource: 'public.cuotas',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), familia_id (uuid), alumno_id (uuid), concepto (text), monto_base_centavos (bigint), monto_final_centavos (bigint), descuento_centavos (bigint), monto_pagado_centavos (bigint), fecha_vencimiento (date), estado (text), ciclo_mes (int), ciclo_anio (int)',
    notes: 'System of Record for monthly tuition and fee receivables in integer cents'
  },
  {
    domainConcept: 'Payments (Pagos)',
    soiResource: 'public.pagos',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), familia_id (uuid), cuota_ids (uuid[]), monto_centavos (bigint), metodo_pago (text), referencia (text), cajero_id (uuid), notas (text), recibo_url (text), created_at (timestamptz)',
    notes: 'System of Record for collected payments and cash receipts'
  },
  {
    domainConcept: 'Payment Allocations (Aplicaciones de Pago)',
    soiResource: 'public.aplicaciones_pago',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), pago_id (uuid), cuota_id (uuid), monto_aplicado_centavos (bigint), dias_atraso_al_aplicar (int)',
    notes: 'Audit log of partial/total allocations per payment to specific fees'
  },
  {
    domainConcept: 'Transactional Payment Registration',
    soiResource: 'public.fn_registrar_pago_transaccional',
    resourceType: 'rpc',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'fn_registrar_pago_transaccional(p_familia_id uuid, p_cuota_ids uuid[], p_monto_centavos bigint, p_metodo_pago text, p_referencia text, p_notas text)',
    notes: 'Authoritative backend ACID stored procedure for atomic payment registration'
  },
  {
    domainConcept: 'Fee Cycle Billing Generator',
    soiResource: 'public.fn_generar_ciclo_cuotas',
    resourceType: 'rpc',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'fn_generar_ciclo_cuotas(p_mes int, p_anio int, p_monto_centavos bigint)',
    notes: 'Batch monthly billing generation procedure'
  },
  {
    domainConcept: 'Scholarships (Becas)',
    soiResource: 'public.becas',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), alumno_id (uuid), familia_id (uuid), porcentaje (int), motivo (text), activa (bool)',
    notes: 'Student scholarship registry'
  },
  {
    domainConcept: 'Payment Commitments (Compromisos de Pago)',
    soiResource: 'public.compromisos_pago',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), familia_id (uuid), monto_comprometido_centavos (bigint), fecha_comprometida (date), cumplido (bool)',
    notes: 'Portfolio recovery commitment tracker'
  },
  {
    domainConcept: 'Cashbox Notifications (Notificaciones Caja)',
    soiResource: 'public.notificaciones_caja',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), familia_id (uuid), tipo (text), canal (text), estado_whatsapp (text), estado_portal (text)',
    notes: 'Automated notification dispatch log'
  },
  {
    domainConcept: 'Cashbox Daily Closures (Cierres Caja)',
    soiResource: 'public.cierres_caja',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), fecha (date), total_general_centavos (bigint), por_metodo (jsonb), estado (text)',
    notes: 'Daily cashier closeout record'
  },
  {
    domainConcept: 'Recurring Fixed Expenses (Gastos Fijos)',
    soiResource: 'public.gastos_fijos',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), nombre (text), categoria (text), centro_costo (soi_departamento), monto_centavos (bigint), dia_inicio (smallint), dia_fin (smallint), repetir_mensual (bool), activo (bool)',
    notes: 'Recurring expense template with a payment window (dia_inicio-dia_fin), not a single due date. Verified live 2026-08-23; not present in supabase/migrations tracked history (applied via execute_sql, same drift pattern as several other recent tables — see 20260823220000_gastos_fijos_mensuales.sql).'
  },
  {
    domainConcept: 'Recurring Fixed Expense Payments (Gastos Fijos Pagos)',
    soiResource: 'public.gastos_fijos_pagos',
    resourceType: 'table',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'id (uuid), gasto_fijo_id (uuid), periodo_anio (int), periodo_mes (int), monto_centavos (bigint), estado (text), fecha_pago (date), referencia (text)',
    notes: 'One row per (gasto_fijo_id, periodo_anio, periodo_mes) — generated idempotently by fn_generar_instancias_gastos_fijos.'
  },
  {
    domainConcept: 'Recurring Fixed Expense Instance Generator',
    soiResource: 'public.fn_generar_instancias_gastos_fijos',
    resourceType: 'rpc',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'fn_generar_instancias_gastos_fijos(p_mes int, p_anio int)',
    notes: 'Idempotent monthly instance generator, same pattern as fn_generar_ciclo_cuotas.'
  },
  {
    domainConcept: 'Service Account Balance Dashboard (Mi Día)',
    soiResource: 'public.fn_fin_service_dashboard',
    resourceType: 'rpc',
    status: 'MAPPED_AND_ACTIVE',
    keyFieldsOrSignature: 'fn_fin_service_dashboard() -> one row per public.service_accounts, left-joined to its latest public.service_account_observations',
    notes: 'Verified live 2026-08-23 — previously 404 (function did not exist, no backing tables). Schema created empty: 0 service accounts registered. The manual-refresh Edge Function (refresh-service-balances) still does not exist; the UI already hides that button when no account has refresh_enabled+connector_status=active, which is always true today. Real bank/utility connector integration is out of scope, not fabricated.'
  },
  {
    domainConcept: 'Double-Entry General Ledger (Asientos Contables)',
    soiResource: 'public.asientos_contables',
    resourceType: 'table',
    status: 'RESOURCE_NOT_MAPPED',
    keyFieldsOrSignature: 'N/A in remote Supabase (currently domain in-memory / local draft only)',
    notes: 'Double-entry engine runs locally in memory until remote accounting table is provisioned in SOI DB.'
  }
];

export function getCanonicalResourceStatus(concept: string): CanonicalMapping | undefined {
  return CANONICAL_SOI_MANIFEST.find(m => m.domainConcept.toLowerCase().includes(concept.toLowerCase()));
}
