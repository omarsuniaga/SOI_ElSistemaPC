import { birthdaysAdapter } from '../api/birthdaysAdapter.js'
import { currentBirthdayPeriod, MONTHS, summarizeBirthdays } from '../domain/birthdayDomain.js'
import { router } from '../../../core/router/router.js'
export async function renderBirthdaySummary(root, adapter=birthdaysAdapter) {
  const period=currentBirthdayPeriod()
  root.innerHTML='<p class="small text-body-secondary" role="status">Cargando cumpleañeros del mes…</p>'
  try{
    const data=await adapter.load(Number(period.slice(0,4)))
    const summary=summarizeBirthdays(data.people,Number(period.slice(5)))
    const event=data.celebrations.find(c=>c.period===period)
    root.innerHTML=`<div class="card bg-body border rounded-4 p-3 mb-3"><div class="d-flex flex-wrap align-items-center justify-content-between gap-2"><div><strong><i class="bi bi-gift me-2" aria-hidden="true"></i>Cumpleañeros de ${MONTHS[Number(period.slice(5))-1].toLowerCase()}</strong><p class="small mb-0">${summary.total} registros · ${summary.alumnos} alumnos · ${summary.maestros} maestros · ${summary.missing} fechas pendientes</p><p class="small text-body-secondary mb-0">${event?'Compartir registrado en el calendario.':'Compartir del mes por organizar.'}</p></div><button class="btn btn-outline-primary" type="button">Ver y organizar</button></div></div>`
    root.querySelector('button').addEventListener('click',()=>router.navigate('cumpleaneros',{period}))
  }catch{
    root.innerHTML='<div class="alert alert-warning">No se pudo cargar el resumen de cumpleaños. <button class="btn btn-sm btn-outline-secondary">Reintentar</button></div>'
    root.querySelector('button').addEventListener('click',()=>renderBirthdaySummary(root,adapter))
  }
}
