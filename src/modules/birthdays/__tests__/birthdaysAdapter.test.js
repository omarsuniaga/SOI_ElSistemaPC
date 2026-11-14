import { describe, it, expect, vi } from 'vitest'
import { createBirthdaysAdapter } from '../api/birthdaysAdapter.js'
const data={people:[{id:'a1',kind:'alumno',activo:true,nombre_completo:'Ana',fecha_nacimiento:null},{id:'m1',kind:'maestro',activo:true,nombre_completo:'Laura',fecha_nacimiento:null}],celebrations:[]}
describe('birthdays adapter',()=>{
  it('demo persists a date and one monthly event across reloads without calling Supabase',async()=>{
    const client={rpc:vi.fn()};const adapter=createBirthdaysAdapter(client,{demo:true,data})
    await adapter.saveBirthDate('alumno','a1','2010-11-21')
    const event={period:'2026-11',date:'2026-11-30',start:'17:00',end:'19:00',location:'Sede',responsible:'Omar',status:'programado'}
    const id=await adapter.saveCelebration(event)
    expect((await adapter.load(2026)).people[0]).toMatchObject({day:21,month:11})
    expect((await adapter.load(2026)).celebrations).toHaveLength(1)
    await expect(adapter.saveCelebration(event)).rejects.toThrow('cambió')
    await adapter.saveCelebration({...event,id,version:1,status:'completado'})
    expect((await adapter.load(2026)).celebrations[0].status).toBe('completado')
    expect(client.rpc).not.toHaveBeenCalled()
  })
  it('uses only current-session identity for maestro self service',async()=>{
    const client={rpc:vi.fn().mockResolvedValue({data:null,error:null})};const adapter=createBirthdaysAdapter(client,{demo:false})
    await adapter.saveOwnBirthDate('1990-11-20')
    expect(client.rpc).toHaveBeenCalledWith('fn_birthdays_save_my_date',{p_date:'1990-11-20'})
  })
  it('rechecks server authorization on every load and never reports query errors as zero birthdays',async()=>{
    const rpc=vi.fn().mockResolvedValueOnce({data:{people:[],celebrations:[]},error:null}).mockResolvedValueOnce({error:{message:'Sin permiso'}})
    const adapter=createBirthdaysAdapter({rpc},{demo:false})
    await adapter.load(2026)
    await expect(adapter.load(2026)).rejects.toThrow('Sin permiso')
    expect(rpc).toHaveBeenCalledTimes(2)
  })
})
