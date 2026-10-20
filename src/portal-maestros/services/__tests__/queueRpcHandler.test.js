import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()
const from = vi.fn()
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { rpc: (...a) => rpc(...a), from: (...a) => from(...a) } }))

import { syncQueueItem } from '../queueSyncHandler.js'
import { syncRpcItem, RPC_ALLOWLIST } from '../queueRpcHandler.js'

const item = (extra = {}) => ({
  tabla: 'registros_sesion',
  operacion: 'rpc',
  payload: { fn: 'cerrar_sesion', args: { p_payload: { sesion_id: 's1' } } },
  ...extra,
})

describe('queued RPC items', () => {
  beforeEach(() => { rpc.mockReset(); from.mockReset(); rpc.mockResolvedValue({ data: { registros: 2 }, error: null }) })

  it('calls the allowlisted function with the stored arguments', async () => {
    await syncRpcItem(item())
    expect(rpc).toHaveBeenCalledWith('cerrar_sesion', { p_payload: { sesion_id: 's1' } })
  })

  it('is reached through the production sync path (syncQueueItem)', async () => {
    await syncQueueItem(item())
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(from).not.toHaveBeenCalled()
  })

  it('throws the RPC error so the queue keeps and retries the item', async () => {
    rpc.mockResolvedValue({ data: null, error: Object.assign(new Error('offline'), { code: 'PGRST301' }) })
    await expect(syncRpcItem(item())).rejects.toThrow('offline')
  })

  it('rejects a function that is not allowlisted without calling it', async () => {
    await expect(syncRpcItem(item({ payload: { fn: 'drop_everything', args: {} } }))).rejects.toThrow(/allowlist|permitid/i)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('rejects an item without a function name', async () => {
    await expect(syncRpcItem(item({ payload: { args: {} } }))).rejects.toThrow()
    expect(rpc).not.toHaveBeenCalled()
  })

  it('only allows cerrar_sesion for now', () => {
    expect(RPC_ALLOWLIST).toEqual(['cerrar_sesion'])
  })
})
