/**
 * tests/edge/whatsapp-gateway.test.ts
 * SDD whatsapp-gateway-multidepto · F2 · Work Unit 4
 *
 * Testea los handlers de la Edge Function con un cliente Supabase mockeado.
 * Cubre spec "Revocación inmediata" (token inválido -> 401) y "El cliente no
 * puede elevar su alcance" (el departamento sale del device, no del body).
 */

import { describe, it, expect, vi } from 'vitest'
import {
  authDevice,
  extractBearerToken,
  handleClaim,
  handleHeartbeat,
  handleReport,
  routeFromPath,
} from '../../supabase/functions/whatsapp-gateway/handlers.ts'

describe('helpers de ruteo y auth', () => {
  it('extractBearerToken', () => {
    expect(extractBearerToken('Bearer abc123')).toBe('abc123')
    expect(extractBearerToken('bearer  xyz ')).toBe('xyz')
    expect(extractBearerToken('abc123')).toBe('')
    expect(extractBearerToken(null)).toBe('')
    expect(extractBearerToken(undefined)).toBe('')
  })

  it('routeFromPath', () => {
    expect(routeFromPath('/functions/v1/whatsapp-gateway/claim')).toBe('claim')
    expect(routeFromPath('/whatsapp-gateway/report/')).toBe('report')
    expect(routeFromPath('/whatsapp-gateway/heartbeat')).toBe('heartbeat')
    expect(routeFromPath('/whatsapp-gateway')).toBeNull()
    expect(routeFromPath('/whatsapp-gateway/otra')).toBeNull()
  })
})

describe('authDevice', () => {
  it('token vacío -> null sin llamar a la DB', async () => {
    const rpc = vi.fn()
    const res = await authDevice({ rpc } as any, '')
    expect(res).toBeNull()
    expect(rpc).not.toHaveBeenCalled()
  })

  it('token válido -> { deviceId, departamento }', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ device_id: 'd1', departamento: 'FIN' }], error: null })
    const res = await authDevice({ rpc } as any, 'tok')
    expect(res).toEqual({ deviceId: 'd1', departamento: 'FIN' })
    expect(rpc).toHaveBeenCalledWith('fn_whatsapp_device_validate', { p_token: 'tok' })
  })

  it('token revocado / inexistente -> null (0 filas)', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null })
    expect(await authDevice({ rpc } as any, 'tok')).toBeNull()
  })

  it('error de RPC -> null', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } })
    expect(await authDevice({ rpc } as any, 'tok')).toBeNull()
  })
})

describe('handleClaim', () => {
  it('usa el departamento del device, ignora el del body', async () => {
    const rpc = vi.fn((name: string) => {
      if (name === 'fn_whatsapp_reclamar_pendientes') {
        return Promise.resolve({ data: [{ id: 'q1', jid: '18291112222', mensaje: 'hola' }], error: null })
      }
      if (name === 'fn_whatsapp_cap_hoy') return Promise.resolve({ data: 200, error: null })
      if (name === 'fn_whatsapp_enviados_hoy') return Promise.resolve({ data: 158, error: null })
      if (name === 'fn_whatsapp_ventana_abierta') return Promise.resolve({ data: true, error: null })
      return Promise.resolve({ data: null, error: null })
    })

    const out = await handleClaim({ rpc } as any, 'ADM', { departamento: 'FIN', limite: 5 })

    expect(rpc).toHaveBeenCalledWith('fn_whatsapp_reclamar_pendientes', { p_departamento: 'ADM', p_limite: 5 })
    expect(out.mensajes).toEqual([{ id: 'q1', jid: '18291112222', mensaje: 'hola' }])
    expect(out.ventana_ok).toBe(true)
    expect(out.cap_restante).toBe(42)
  })

  it('fuera de ventana -> mensajes vacíos y ventana_ok=false', async () => {
    const rpc = vi.fn((name: string) => {
      if (name === 'fn_whatsapp_reclamar_pendientes') return Promise.resolve({ data: [], error: null })
      if (name === 'fn_whatsapp_cap_hoy') return Promise.resolve({ data: 200, error: null })
      if (name === 'fn_whatsapp_enviados_hoy') return Promise.resolve({ data: 0, error: null })
      if (name === 'fn_whatsapp_ventana_abierta') return Promise.resolve({ data: false, error: null })
      return Promise.resolve({ data: null, error: null })
    })
    const out = await handleClaim({ rpc } as any, 'ADM', null)
    expect(out).toEqual({ mensajes: [], ventana_ok: false, cap_restante: 200 })
  })
})

describe('handleReport', () => {
  // Mock que registra cada `.eq(col, val)` y la `.in(col, vals)` del SELECT y del UPDATE.
  function mockSupabase(filas: any[], sink: { updates: any[]; selectEq: any[][]; updateEq: any[][] }) {
    return {
      from: () => {
        let modo: 'select' | 'update' = 'select'
        const push = (entry: any[]) => (modo === 'select' ? sink.selectEq : sink.updateEq).push(entry)
        const q: any = {
          select: () => { modo = 'select'; return q },
          update: (patch: any) => { modo = 'update'; sink.updates.push(patch); return q },
          in: (col: string, vals: any[]) => { push(['in', col, vals]); return q },
          eq: (col: string, val: any) => { push([col, val]); return q },
          then: (r: any) => Promise.resolve(modo === 'select' ? { data: filas, error: null } : { error: null }).then(r),
        }
        return q
      },
    }
  }
  const sink = () => ({ updates: [] as any[], selectEq: [] as any[][], updateEq: [] as any[][] })

  it('el SELECT filtra por id + departamento; el guard de estado va en el UPDATE', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 1, estado: 'procesando', departamento: 'ADM' }], s)
    await handleReport(sb as any, 'ADM', { resultados: [{ id: 'q1', estado: 'enviado' }] })
    expect(s.selectEq).toContainEqual(['in', 'id', ['q1']])
    expect(s.selectEq).toContainEqual(['departamento', 'ADM'])
    // 'enviado' del cliente aplica si la fila está en procesando O pendiente
    expect(s.updateEq).toContainEqual(['in', 'estado', ['procesando', 'pendiente']])
    expect(s.updateEq).toContainEqual(['departamento', 'ADM'])
  })

  it('fila que el SELECT no devolvió (otro depto / inexistente) -> ignorada', async () => {
    const s = sink()
    const sb = mockSupabase([], s) // SELECT no devuelve nada
    const out = await handleReport(sb as any, 'ADM', { resultados: [{ id: 'q1', estado: 'enviado' }] })
    expect(out).toMatchObject({ aplicados: 0, ignorados: 1, procesados: ['q1'] })
    expect(s.updates).toHaveLength(0)
  })

  it('fila ya resuelta (enviado) -> se ignora, va en procesados (idempotente)', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 1, estado: 'enviado', departamento: 'ADM' }], s)
    const out = await handleReport(sb as any, 'ADM', { resultados: [{ id: 'q1', estado: 'enviado' }] })
    expect(out).toMatchObject({ aplicados: 0, ignorados: 1, procesados: ['q1'] })
    expect(s.updates).toHaveLength(0)
  })

  it('el reaper devolvió la fila a pendiente pero el cliente la reporta enviada -> se marca enviado (no se re-envía)', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 1, estado: 'pendiente', departamento: 'ADM' }], s)
    const out = await handleReport(sb as any, 'ADM', { resultados: [{ id: 'q1', estado: 'enviado' }] })
    expect(out).toMatchObject({ aplicados: 1, procesados: ['q1'] })
    expect(s.updates[0].estado).toBe('enviado')
  })

  it('fallido TERMINAL sobre una fila que el reaper devolvió a pendiente -> se marca fallido (no se re-envía)', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 1, estado: 'pendiente', departamento: 'ADM' }], s)
    const out = await handleReport(sb as any, 'ADM', { resultados: [{ id: 'q1', estado: 'fallido', terminal: true }] })
    expect(out).toMatchObject({ aplicados: 1 })
    expect(s.updates[0].estado).toBe('fallido')
    expect(s.updateEq).toContainEqual(['in', 'estado', ['procesando', 'pendiente']])
  })

  it('fallido NO terminal solo transiciona desde procesando (una fila en pendiente se ignora)', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 1, estado: 'pendiente', departamento: 'ADM' }], s)
    const out = await handleReport(sb as any, 'ADM', { resultados: [{ id: 'q1', estado: 'fallido' }] })
    expect(out).toMatchObject({ aplicados: 0, ignorados: 1 })
    expect(s.updates).toHaveLength(0)
  })

  it('enviado -> procesado_at del SERVIDOR (ignora el del cliente)', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 1, estado: 'procesando', departamento: 'ADM' }], s)
    const out = await handleReport(sb as any, 'ADM', {
      resultados: [{ id: 'q1', estado: 'enviado', procesado_at: '2000-01-01T00:00:00Z' }],
    })
    expect(out).toMatchObject({ aplicados: 1, ignorados: 0 })
    expect(s.updates[0].estado).toBe('enviado')
    expect(s.updates[0].procesado_at).not.toBe('2000-01-01T00:00:00Z')
    expect(Date.parse(s.updates[0].procesado_at)).toBeGreaterThan(Date.parse('2026-01-01'))
  })

  it('fallido con intentos < 3 -> vuelve a pendiente', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 1, estado: 'procesando', departamento: 'ADM' }], s)
    await handleReport(sb as any, 'ADM', { resultados: [{ id: 'q1', estado: 'fallido', error_msg: 'x' }] })
    expect(s.updates[0]).toMatchObject({ estado: 'pendiente', error_msg: 'x' })
  })

  it('fallido con intentos >= 3 -> fallido definitivo', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 3, estado: 'procesando', departamento: 'ADM' }], s)
    await handleReport(sb as any, 'ADM', { resultados: [{ id: 'q1', estado: 'fallido' }] })
    expect(s.updates[0].estado).toBe('fallido')
  })

  it('fallido con terminal:true -> fallido aunque intentos < 3 (evita el doble envío)', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 0, estado: 'procesando', departamento: 'ADM' }], s)
    await handleReport(sb as any, 'ADM', {
      resultados: [{ id: 'q1', estado: 'fallido', terminal: true, error_msg: 'sin ACK' }],
    })
    expect(s.updates[0].estado).toBe('fallido')
  })

  it('id duplicado en el payload no infla aplicados (se procesa una vez)', async () => {
    const s = sink()
    const sb = mockSupabase([{ id: 'q1', intentos: 1, estado: 'procesando', departamento: 'ADM' }], s)
    const out = await handleReport(sb as any, 'ADM', {
      resultados: [
        { id: 'q1', estado: 'enviado' },
        { id: 'q1', estado: 'fallido' },
      ],
    })
    expect(out.aplicados).toBe(1)
    expect(out.aplicados + out.ignorados).toBe(2)
    expect(s.updates).toHaveLength(1)
  })
})

describe('handleHeartbeat', () => {
  function sbWithRpc(rpcData: any, rpcError: any = null) {
    const rpc = vi.fn().mockResolvedValue({ data: rpcData, error: rpcError })
    return { rpc, sb: { rpc } as any }
  }

  it('la decisión de standby la hace el RPC atómico, no un read-then-write', async () => {
    const { rpc, sb } = sbWithRpc([{ gano: false, owner_equipo: 'PC-ADM-01', seconds_since_heartbeat: 12.3 }])
    const out = await handleHeartbeat(sb, 'ADM', { nombre_equipo: 'PC-ADM-02', status: 'connected' })
    expect(rpc).toHaveBeenCalledWith('fn_hermes_gateway_reclamar_instancia', expect.objectContaining({
      p_instance_name: 'adm-gateway',
      p_nombre_equipo: 'PC-ADM-02',
    }))
    expect(out).toMatchObject({ ok: false, standby: true, owner_equipo: 'PC-ADM-01', seconds_since_heartbeat: 12.3 })
  })

  it('gano=true -> ok:true, standby:false', async () => {
    const { sb } = sbWithRpc([{ gano: true, owner_equipo: 'PC-ADM-01', seconds_since_heartbeat: 0 }])
    const out = await handleHeartbeat(sb, 'ADM', { nombre_equipo: 'PC-ADM-01' })
    expect(out).toMatchObject({ ok: true, standby: false, instance_name: 'adm-gateway', owner_equipo: 'PC-ADM-01' })
  })

  it('nombre_equipo vacío -> RequestError 400, no llama al RPC', async () => {
    const { rpc, sb } = sbWithRpc([{ gano: true }])
    await expect(handleHeartbeat(sb, 'ADM', { nombre_equipo: '  ' })).rejects.toMatchObject({ name: 'RequestError', status: 400 })
    expect(rpc).not.toHaveBeenCalled()
  })

  it('error del RPC -> se propaga (no devuelve ok:true en falso)', async () => {
    const { sb } = sbWithRpc(null, { message: 'boom' })
    await expect(handleHeartbeat(sb, 'ADM', { nombre_equipo: 'PC-ADM-01' })).rejects.toThrow(/heartbeat rpc/)
  })
})
