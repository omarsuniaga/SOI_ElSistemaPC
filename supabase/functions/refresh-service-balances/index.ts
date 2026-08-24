import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getRefreshIntervalDecision, getRefreshMinIntervalSeconds } from './refreshPolicy.js'
import { isValidCepmMeter, parseCepmPublicBalance } from './cepmPublicBalance.js'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const INTERNAL_FUNCTION_KEY = Deno.env.get('INTERNAL_FN_KEY') ?? ''
const MIN_REFRESH_INTERVAL_SECONDS = getRefreshMinIntervalSeconds(
  Deno.env.get('FIN_SERVICE_REFRESH_MIN_INTERVAL_SECONDS'),
)

// The canonical FIN browser origin is not configured in this repository. Keep
// this unchanged until a verified deployment origin can be configured server-side.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type TriggerSource = 'schedule' | 'manual'
type RefreshStatus = 'success' | 'unsupported' | 'skipped' | 'error'
type ConnectorResult =
  | { kind: 'success'; balanceCentavos?: number; amountDueCentavos?: number; dueDate?: string; observedAt: string; snapshotKey: string; providerSummary: Record<string, unknown> }
  | { kind: 'unsupported'; code: string; message: string }

interface ServiceAccount {
  id: string
  external_account_ref: string
  currency_code: string
  provider: { connector_key: string; connector_status: string } | null
}

interface ProviderConnector {
  refresh(account: ServiceAccount): Promise<ConnectorResult>
}

interface AccountRefreshResult {
  serviceAccountId: string
  status: RefreshStatus
  code: string | null
  message: string | null
  retryAfterSeconds?: number
}

function json(body: Record<string, unknown>, status = 200, additionalHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, ...additionalHeaders, 'Content-Type': 'application/json' },
  })
}

function outcome(
  serviceAccountId: string,
  status: RefreshStatus,
  code: string | null = null,
  message: string | null = null,
  retryAfterSeconds?: number,
): AccountRefreshResult {
  return { serviceAccountId, status, code, message, ...(retryAfterSeconds ? { retryAfterSeconds } : {}) }
}

const unsupportedConnector = (providerName: string): ProviderConnector => ({
  async refresh(): Promise<ConnectorResult> {
    return {
      kind: 'unsupported',
      code: 'connector_unconfigured',
      message: `${providerName} no tiene una integración oficial configurada. No se consultó ni se creó un balance.`,
    }
  },
})

const CEPM_BALANCE_URL = 'https://oficina.cepm.com.do/balance'
const CEPM_MAX_RESPONSE_BYTES = 256_000

async function readBoundedResponse(response: Response): Promise<string> {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > CEPM_MAX_RESPONSE_BYTES) {
    throw new Error('CEPM response exceeds the permitted size')
  }
  if (!response.body) throw new Error('CEPM returned an empty response')

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      size += value.byteLength
      if (size > CEPM_MAX_RESPONSE_BYTES) throw new Error('CEPM response exceeds the permitted size')
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(body)
}

const cepmConnector: ProviderConnector = {
  async refresh(account): Promise<ConnectorResult> {
    if (!isValidCepmMeter(account.external_account_ref)) {
      return { kind: 'unsupported', code: 'invalid_meter_reference', message: 'La referencia del medidor CEPM no tiene un formato válido.' }
    }

    const url = new URL(CEPM_BALANCE_URL)
    url.searchParams.set('Medidor', account.external_account_ref)
    url.searchParams.set('btnConsultar', 'Consultar')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    try {
      const response = await fetch(url, { method: 'GET', signal: controller.signal, redirect: 'follow' })
      if (!response.ok) throw new Error(`CEPM returned HTTP ${response.status}`)
      const parsed = parseCepmPublicBalance(await readBoundedResponse(response), account.external_account_ref)
      return {
        kind: 'success',
        observedAt: parsed.observedAt,
        dueDate: parsed.cutoffAt.slice(0, 10),
        snapshotKey: `cepm:${parsed.sourceSummary.meter}:${parsed.observedAt}:${parsed.balanceKwh}:${parsed.readingKwh}:${parsed.cutoffAt}`,
        providerSummary: {
          ...parsed.sourceSummary,
          balanceKwh: parsed.balanceKwh,
          readingKwh: parsed.readingKwh,
          suspensionThresholdKwh: parsed.suspensionThresholdKwh,
          cutoffAt: parsed.cutoffAt,
        },
      }
    } finally {
      clearTimeout(timeout)
    }
  },
}

// A provider is only added here after its official API/auth contract is reviewed.
// This prevents UI fixtures from ever being mistaken for provider balances.
const CONNECTORS: Record<string, ProviderConnector> = {
  cepm: cepmConnector,
}

async function authorize(req: Request, supabase: SupabaseClient): Promise<{ triggerSource: TriggerSource; userId: string | null } | null> {
  if (INTERNAL_FUNCTION_KEY && req.headers.get('x-internal-key') === INTERNAL_FUNCTION_KEY) {
    return { triggerSource: 'schedule', userId: null }
  }

  const bearer = req.headers.get('authorization')
  if (!bearer?.startsWith('Bearer ')) return null
  const token = bearer.slice('Bearer '.length)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', data.user.id)
    .maybeSingle()
  if (profileError || !profile || !['admin', 'superadmin', 'finanzas'].includes(profile.rol)) return null

  return { triggerSource: 'manual', userId: data.user.id }
}

async function updateRun(
  supabase: SupabaseClient,
  runId: string,
  status: RefreshStatus,
  errorCode: string | null,
  errorMessage: string | null,
) {
  const { error } = await supabase
    .from('fin_service_refresh_runs')
    .update({ status, error_code: errorCode, error_message: errorMessage, finished_at: new Date().toISOString() })
    .eq('id', runId)
  if (error) throw new Error(`Unable to update refresh audit record: ${error.message}`)
}

async function completeState(
  supabase: SupabaseClient,
  accountId: string,
  runId: string,
  status: RefreshStatus,
  errorCode: string | null,
  recordQuery: boolean,
) {
  const { data, error } = await supabase.rpc('fn_fin_complete_service_refresh', {
    p_service_account_id: accountId,
    p_refresh_run_id: runId,
    p_status: status,
    p_error_code: errorCode,
    p_record_query: recordQuery,
    p_success: status === 'success',
  })
  if (error) throw new Error(`Unable to complete refresh state: ${error.message}`)
  return data === true
}

async function refreshAccount(
  supabase: SupabaseClient,
  account: ServiceAccount,
  triggerSource: TriggerSource,
  userId: string | null,
): Promise<AccountRefreshResult> {
  const { data: run, error: runError } = await supabase
    .from('fin_service_refresh_runs')
    .insert({
      service_account_id: account.id,
      trigger_source: triggerSource,
      status: 'running',
      created_by: userId,
    })
    .select('id')
    .single()
  if (runError || !run) throw new Error('Unable to create refresh audit record')

  const finish = async (
    status: RefreshStatus,
    errorCode: string | null = null,
    errorMessage: string | null = null,
    recordQuery = true,
    retryAfterSeconds?: number,
  ) => {
    try {
      const released = await completeState(supabase, account.id, run.id, status, errorCode, recordQuery)
      if (!released) {
        await updateRun(supabase, run.id, 'error', 'lock_lost', 'El bloqueo ya no pertenece a esta ejecución.')
        return outcome(account.id, 'error', 'lock_lost', 'La actualización perdió su bloqueo de seguridad.')
      }
    } catch (error) {
      try {
        await updateRun(supabase, run.id, 'error', 'state_write_failed', 'No se pudo cerrar el estado de actualización.')
      } catch (auditError) {
        console.error('[refresh-service-balances] state and audit completion failed', account.id, error, auditError)
      }
      return outcome(account.id, 'error', 'state_write_failed', 'No se pudo cerrar el estado de actualización.')
    }

    try {
      await updateRun(supabase, run.id, status, errorCode, errorMessage)
      return outcome(account.id, status, errorCode, errorMessage, retryAfterSeconds)
    } catch (error) {
      console.error('[refresh-service-balances] audit completion failed', account.id, error)
      return outcome(account.id, 'error', 'audit_write_failed', 'La actualización no pudo registrarse de forma segura.')
    }
  }

  const { data: claimed, error: claimError } = await supabase.rpc('fn_fin_acquire_service_refresh_lock', {
    p_service_account_id: account.id,
    p_refresh_run_id: run.id,
    p_lease_seconds: 300,
  })
  if (claimError) {
    await updateRun(supabase, run.id, 'error', 'lock_error', 'No se pudo obtener el bloqueo de actualización.')
    return outcome(account.id, 'error', 'lock_error', 'No se pudo obtener el bloqueo de actualización.')
  }
  if (claimed !== true) {
    // Do not call finish here: this worker did not acquire the lease and must
    // never release or overwrite the state owned by the active worker.
    await updateRun(supabase, run.id, 'skipped', 'refresh_in_progress', 'Ya hay una actualización en curso para este servicio.')
    return outcome(account.id, 'skipped', 'refresh_in_progress', 'Ya hay una actualización en curso para este servicio.')
  }

  try {
    const { data: state, error: stateError } = await supabase
      .from('fin_service_refresh_state')
      .select('last_query_at')
      .eq('service_account_id', account.id)
      .single()
    if (stateError) return finish('error', 'state_read_failed', 'No se pudo verificar la última actualización.', false)

    const interval = getRefreshIntervalDecision(state?.last_query_at ?? null, MIN_REFRESH_INTERVAL_SECONDS)
    if (!interval.allowed) {
      return finish('skipped', 'refresh_too_soon', 'Este servicio se actualizó recientemente.', false, interval.retryAfterSeconds)
    }

    const connector = account.provider ? CONNECTORS[account.provider.connector_key] : undefined
    if (!connector || account.provider?.connector_status !== 'active') {
      return finish('unsupported', 'connector_unconfigured', 'El conector del proveedor no está configurado.')
    }

    const result = await connector.refresh(account)
    if (result.kind === 'unsupported') return finish('unsupported', result.code, result.message)

    const { error: snapshotError } = await supabase.from('fin_service_balance_snapshots').insert({
      service_account_id: account.id,
      refresh_run_id: run.id,
      observed_at: result.observedAt,
      balance_centavos: result.balanceCentavos ?? null,
      amount_due_centavos: result.amountDueCentavos ?? null,
      due_date: result.dueDate ?? null,
      currency_code: account.currency_code,
      source_snapshot_key: result.snapshotKey,
      provider_summary: result.providerSummary,
    })
    if (snapshotError && snapshotError.code !== '23505') {
      return finish('error', 'snapshot_write_failed', 'No se pudo guardar el balance consultado.')
    }
    return finish('success')
  } catch (error) {
    console.error('[refresh-service-balances] account refresh failed', account.id, error)
    return finish('error', 'connector_error', 'La consulta al proveedor falló.')
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ error: 'Configuración de servidor incompleta' }, 500)

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const auth = await authorize(req, supabase)
  if (!auth) return json({ error: 'No autorizado' }, 401)

  const body = await req.json().catch(() => ({})) as { service_account_id?: string }
  let query = supabase
    .from('fin_service_accounts')
    .select('id, external_account_ref, currency_code, provider:fin_service_providers(connector_key, connector_status)')
    .eq('active', true)
    .eq('refresh_enabled', true)
  if (body.service_account_id) query = query.eq('id', body.service_account_id)

  const { data: accounts, error } = await query
  if (error) return json({ error: 'No se pudieron cargar los servicios habilitados.' }, 500)

  const results = { success: 0, unsupported: 0, skipped: 0, error: 0 }
  const accountResults: AccountRefreshResult[] = []
  for (const account of (accounts ?? []) as ServiceAccount[]) {
    try {
      const accountResult = await refreshAccount(supabase, account, auth.triggerSource, auth.userId)
      results[accountResult.status]++
      accountResults.push(accountResult)
    } catch (accountError) {
      console.error('[refresh-service-balances] isolated account failure', account.id, accountError)
      results.error++
      accountResults.push(outcome(account.id, 'error', 'internal_error', 'No se pudo completar la actualización de este servicio.'))
    }
  }

  const rateLimited = auth.triggerSource === 'manual'
    && accountResults.length > 0
    && accountResults.every((item) => item.status === 'skipped' && item.code === 'refresh_too_soon')
  const retryAfterSeconds = rateLimited
    ? Math.max(...accountResults.map((item) => item.retryAfterSeconds ?? 0))
    : 0

  return json(
    {
      ok: results.error === 0,
      accounts: accounts?.length ?? 0,
      results,
      account_results: accountResults,
      minimum_refresh_interval_seconds: MIN_REFRESH_INTERVAL_SECONDS,
    },
    rateLimited ? 429 : 200,
    rateLimited ? { 'Retry-After': String(retryAfterSeconds) } : {},
  )
})
