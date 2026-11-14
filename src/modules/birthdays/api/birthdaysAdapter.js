import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'
import { demoBirthdayCelebrations } from '../../../assets/data/mocks/birthdayCelebrationsStore.js'
import fixture from '../../../assets/data/mocks/birthdays.json'
import { projectBirthday, validBirthDate, validateCelebration } from '../domain/birthdayDomain.js'

export function createBirthdaysAdapter(client = supabase, options = {}) {
  const demoData=structuredClone(options.data||fixture)
  if(!options.data)demoData.celebrations=demoBirthdayCelebrations
  const isDemo=()=>options.demo ?? config.isDemoMode
  const rpc=async(name,args)=>{
    const {data,error}=await client.rpc(name,args)
    if(error)throw new Error(error.message || 'No se pudo completar la operación de cumpleaños')
    return data
  }
  async function load(year,{includeInactive=false}={}) {
    if(!Number.isInteger(Number(year))||year<1900||year>2099)throw new Error('Año inválido')
    const data=isDemo()?{
      people:demoData.people.filter(p=>includeInactive||p.activo).map(p=>projectBirthday(p,p.kind)),
      celebrations:demoData.celebrations.filter(c=>c.period.startsWith(year+'-')),
    }:await rpc('fn_birthdays_overview',{p_year:Number(year),p_include_inactive:includeInactive})
    if(!data||!Array.isArray(data.people)||!Array.isArray(data.celebrations))throw new Error('Respuesta de cumpleaños incompleta')
    return structuredClone(data)
  }
  async function saveBirthDate(kind,id,date) {
    if(!['alumno','maestro'].includes(kind)||!id||!validBirthDate(date))throw new Error('Introduce una fecha de nacimiento válida, no futura')
    if(isDemo()){
      const person=demoData.people.find(p=>p.id===id&&p.kind===kind)
      if(!person)throw new Error('Persona no encontrada')
      person.fecha_nacimiento=date
    }else await rpc('fn_birthdays_save_date',{p_kind:kind,p_id:id,p_date:date})
  }
  async function saveCelebration(payload) {
    validateCelebration(payload)
    let id=payload.id
    if(isDemo()){
      const current=demoData.celebrations.find(c=>c.period===payload.period)
      if(current&&(!id||id!==current.id||current.version!==payload.version))throw new Error('El compartir cambió; recarga antes de editar')
      if(id&&!current)throw new Error('Compartir no encontrado')
      const event={...payload,id:id||crypto.randomUUID(),version:(current?.version||0)+1}
      if(current)demoData.celebrations.splice(demoData.celebrations.indexOf(current),1,event)
      else demoData.celebrations.push(event)
      id=event.id
    }else id=await rpc('fn_birthdays_save_celebration',{
      p_period:payload.period,p_date:payload.date,p_start:payload.start,p_end:payload.end,p_location:payload.location.trim(),
      p_responsible:payload.responsible.trim(),p_status:payload.status,p_notes:payload.notes||'',p_id:id||null,p_version:payload.version||null,
    })
    return id
  }
  async function getOwnBirthDate() {
    return isDemo()?{available:true,date:demoData.people.find(p=>p.kind==='maestro')?.fecha_nacimiento||null}:rpc('fn_birthdays_my_date')
  }
  async function saveOwnBirthDate(date) {
    if(!validBirthDate(date))throw new Error('Introduce una fecha de nacimiento válida, no futura')
    if(isDemo())demoData.people.find(p=>p.kind==='maestro').fecha_nacimiento=date
    else await rpc('fn_birthdays_save_my_date',{p_date:date})
  }
  return {load,saveBirthDate,saveCelebration,getOwnBirthDate,saveOwnBirthDate,get isDemo(){return isDemo()}}
}
export const birthdaysAdapter=createBirthdaysAdapter()
