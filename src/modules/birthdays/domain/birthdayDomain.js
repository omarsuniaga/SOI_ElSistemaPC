import { fechaSantoDomingo } from '../../../shared/utils/institutionalDates.js'
export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
export const CELEBRATION_STATES = { borrador:'Por organizar',programado:'Programado',completado:'Realizado',cancelado:'Cancelado' }
export function currentBirthdayPeriod(now = new Date()) { return fechaSantoDomingo(now).slice(0,7) }
export function suggestCelebrationDate(year,month) { return new Date(Date.UTC(year,month,0)).toISOString().slice(0,10) }
export function validBirthDate(value, today = fechaSantoDomingo()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const date = new Date(value+'T12:00:00Z')
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10)===value && value<=today
}
export function projectBirthday(row, kind, today = fechaSantoDomingo()) {
  const valid=validBirthDate(row.fecha_nacimiento,today)
  return {id:row.id,kind,name:row.nombre_completo || '',active:row.activo===true,context:row.context || row.especialidad || 'Sin clase activa',day:valid?Number(row.fecha_nacimiento.slice(8,10)):null,month:valid?Number(row.fecha_nacimiento.slice(5,7)):null,needsReview:!!row.fecha_nacimiento&&!valid}
}
export function summarizeBirthdays(records, month, {includeInactive=false,kind='all',search=''}={}) {
  const scope=records.filter(p=>(includeInactive||p.active)&&(kind==='all'||p.kind===kind))
  const needle=search.trim().toLocaleLowerCase('es')
  const people=scope.filter(p=>p.month===Number(month)&&(!needle||(p.name||'').toLocaleLowerCase('es').includes(needle))).sort((a,b)=>a.day-b.day||(a.name||'').localeCompare(b.name||'','es'))
  const missingPeople=scope.filter(p=>!p.month&&(!needle||(p.name||'').toLocaleLowerCase('es').includes(needle)))
  return {people,missingPeople,total:people.length,alumnos:people.filter(p=>p.kind==='alumno').length,maestros:people.filter(p=>p.kind==='maestro').length,missing:missingPeople.length,totalRecords:scope.length}
}
export function validateCelebration(p) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p.period||'')||!p.date?.startsWith(p.period+'-')||!validBirthDate(p.date,'2100-12-31')) throw new Error('La fecha debe pertenecer al mes seleccionado')
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.start||'')||!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.end||'')||p.end<=p.start) throw new Error('La hora final debe ser posterior a la inicial')
  if(!p.location?.trim()||!p.responsible?.trim()) throw new Error('Lugar y responsable son obligatorios')
  if(!CELEBRATION_STATES[p.status])throw new Error('Estado inválido')
  if(p.location.length>300||p.responsible.length>200||(p.notes||'').length>4000)throw new Error('Texto demasiado largo')
  return p
}
