import { IPaymentTransactionPort, PaymentTransactionPayload, PaymentTransactionResult } from '../../application/ports/IPaymentTransactionPort';
import { supabaseRpc, SupabaseFetchError } from './SupabaseRestClient';
import { getSupabaseConfig, checkSupabaseConnection } from './SupabaseClient';

/**
 * PostgREST returns RPC errors (including RAISE EXCEPTION from
 * fn_registrar_pago_transaccional, e.g. role rejection) as a JSON body of
 * shape { message, details, hint, code }. Extract the human-readable message
 * so the UI can show an actionable error instead of a raw HTTP body.
 */
function extractRpcErrorMessage(err: unknown): string {
  if (err instanceof SupabaseFetchError) {
    try {
      const parsed = JSON.parse(err.errorDetails);
      if (parsed?.message) return parsed.message;
    } catch {
      // errorDetails wasn't JSON — fall through to raw text below
    }
    return err.errorDetails || err.message;
  }
  return err instanceof Error ? err.message : 'Error desconocido al invocar fn_registrar_pago_transaccional.';
}

export class SupabasePaymentTransactionAdapter implements IPaymentTransactionPort {
  /**
   * Commits payment using canonical Postgres stored procedure fn_registrar_pago_transaccional
   * Enforces fail-closed: prohibits financial writes if remote backend is unreachable.
   */
  public async executePaymentTransaction(payload: PaymentTransactionPayload): Promise<PaymentTransactionResult> {
    const config = getSupabaseConfig();

    if (!config.isConfigured) {
      return {
        success: false,
        error: 'FAIL_CLOSED: Supabase no está configurado. No se permite registrar pagos sin backend autoritativo.',
        isOfflineDegraded: false
      };
    }

    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      return {
        success: false,
        error: 'FAIL_CLOSED: El servidor de base de datos Supabase no responde. Operación financiera bloqueada por seguridad.',
        isOfflineDegraded: false
      };
    }

    try {
      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      const familiaIdVal = payload.payment.familiaId;
      
      const cuotaIds = payload.payment.aplicaciones
        .map(a => a.cuotaId)
        .filter(id => isUUID(id));

      if (!isUUID(familiaIdVal)) {
        return {
          success: false,
          error: `FAIL_CLOSED: ID de familia "${familiaIdVal}" no es un UUID válido de Supabase.`
        };
      }

      // Invoke Canonical Authoritative RPC fn_registrar_pago_transaccional.
      // This is the ONLY write path: the RPC does row-locked, server-side FIFO
      // allocation across cuotas plus wallet overpayment credit atomically.
      // There is deliberately no client-side fallback here — a partial
      // multi-step client write on RPC failure is exactly the non-atomic
      // failure mode this adapter exists to prevent (see G-01 in the
      // official FIN portal's cajaSupabase.js). If the RPC fails, the
      // transaction failed; the caller must not treat it as a success.
      try {
        const rpcResult = await supabaseRpc<{ id: string } & Record<string, unknown>>(
          'fn_registrar_pago_transaccional',
          {
            p_familia_id: familiaIdVal,
            p_cuota_ids: cuotaIds,
            p_monto_centavos: payload.payment.montoTotal.cents,
            p_metodo_pago: payload.payment.metodoPago,
            p_referencia: payload.payment.referenciaBancaria || payload.payment.numeroRecibo,
            p_notas: payload.payment.observaciones || `Recibo: ${payload.payment.numeroRecibo}`
          }
        );

        return {
          success: true,
          // fn_registrar_pago_transaccional RETURNS pagos, so the DB-assigned
          // id is rpcResult.id (the table has no pago_id column).
          paymentId: rpcResult?.id || payload.payment.id,
          receiptNumber: payload.payment.numeroRecibo,
          isOfflineDegraded: false
        };
      } catch (rpcErr: unknown) {
        return {
          success: false,
          error: `FAIL_CLOSED: fn_registrar_pago_transaccional rechazó la transacción: ${extractRpcErrorMessage(rpcErr)}`,
          isOfflineDegraded: false
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: `FAIL_CLOSED: Fallo en la transacción atómica de pago con Supabase: ${err.message || 'Error desconocido'}`
      };
    }
  }
}
