/**
 * Ítems `rpc` de `sync_queue`: una operación atómica del servidor que se encoló sin conexión
 * (p. ej. el cierre de clase). El ítem lleva todo lo necesario en su payload:
 *
 *   { tabla: 'registros_sesion', operacion: 'rpc', preservar: true,
 *     payload: { fn: 'cerrar_sesion', args: { p_payload: {...} } } }
 *
 * Los ids de los registros se fijan al encolar, así que reintentar es idempotente. Solo se
 * ejecutan funciones de la lista permitida: lo guardado en IndexedDB no es una orden de confianza.
 */

import { supabase } from '../../lib/supabaseClient.js'

export const RPC_ALLOWLIST = ['cerrar_sesion']

export async function syncRpcItem(item) {
  const { fn, args } = item?.payload || {}
  if (!fn) throw new Error('[SYNC] ítem rpc sin nombre de función')
  if (!RPC_ALLOWLIST.includes(fn)) throw new Error(`[SYNC] función rpc no permitida: ${fn}`)
  const { error } = await supabase.rpc(fn, args || {})
  if (error) throw error
}
