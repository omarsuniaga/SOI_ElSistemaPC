import { beforeEach, describe, expect, it, vi } from 'vitest';
const client = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock('../../src/lib/supabaseClient.js', () => ({ supabase: client }));
import { cerrarPeriodoAcademico } from '../../src/modules/metricas/api/metricsApi.js';
const input={periodoId:'periodo',fechaInicio:'2026-09-01',fechaFin:'2026-09-30',observaciones:' Cierre sintético '};
beforeEach(() => { vi.resetAllMocks(); client.from.mockImplementation(() => { throw new Error('Direct table mutation is forbidden'); }); });
describe('Cierre del portal ACM', () => {
  it('delegates to one atomic RPC and exposes its authoritative receipt', async () => {
    client.rpc.mockResolvedValue({data:{ok:true,snapshot_id:'snapshot',periodo_id:'periodo'},error:null});
    const result=await cerrarPeriodoAcademico(input);
    expect(client.rpc).toHaveBeenCalledExactlyOnceWith('fn_cerrar_periodo_academico',{
      p_periodo_id:'periodo',p_fecha_inicio:'2026-09-01',p_fecha_fin:'2026-09-30',
      p_observaciones:'Cierre sintético',p_forzar:false,
    });
    expect(result.snapshotId).toBe('snapshot');
    expect(client.from).not.toHaveBeenCalled();
  });
  it('propagates a denied close', async () => {
    client.rpc.mockResolvedValue({data:null,error:{message:'No autorizado',code:'42501'}});
    await expect(cerrarPeriodoAcademico(input)).rejects.toThrow('No autorizado');
  });
  it.each([null,{ok:false},{ok:true}])('never turns an invalid receipt into success: %j', async data => {
    client.rpc.mockResolvedValue({data,error:null});
    await expect(cerrarPeriodoAcademico(input)).rejects.toThrow(/confirm/i);
  });
});
