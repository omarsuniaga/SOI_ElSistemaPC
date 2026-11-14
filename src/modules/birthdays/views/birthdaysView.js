import { router } from '../../../core/router/router.js'
import { birthdaysAdapter } from '../api/birthdaysAdapter.js'
import { MONTHS, CELEBRATION_STATES, currentBirthdayPeriod, summarizeBirthdays, suggestCelebrationDate } from '../domain/birthdayDomain.js'
import { fechaSantoDomingo } from '../../../shared/utils/institutionalDates.js'
import { escHTML as esc } from '../../../portal-maestros/utils/portalUtils.js'
import './birthdays.css'
const label=kind=>kind==='alumno'?'Alumno':'Maestro'
export async function renderBirthdaysView(container, params={}, adapter=birthdaysAdapter) {
  const period=/^(19|20)\d{2}-(0[1-9]|1[0-2])$/.test(params.period||'')?params.period:currentBirthdayPeriod()
  const state={year:Number(period.slice(0,4)),month:Number(period.slice(5)),kind:'all',search:'',includeInactive:false,visible:30,missingVisible:30,data:null,message:'',busy:false}
  let request=0
  let mountedNode=null
  const owner={};container.__birthdaysOwner=owner
  const active=()=>container.__birthdaysOwner===owner&&(!mountedNode||container.firstElementChild===mountedNode)
  const currentPeriod=()=>`${state.year}-${String(state.month).padStart(2,'0')}`
  async function load(refresh=false){
    if(!active())return
    const ticket=++request
    container.innerHTML='<div class="p-4" role="status">Cargando cumpleaños…</div>'
    mountedNode=container.firstElementChild
    try{
      const data=await adapter.load(state.year,{includeInactive:state.includeInactive,refresh})
      if(ticket!==request||!active())return
      state.data=data;draw()
    }catch(error){if(ticket!==request||!active())return;container.innerHTML=`<div class="alert alert-danger m-3" role="alert">${esc(error.message)} <button class="btn btn-outline-danger" data-retry>Reintentar</button></div>`;mountedNode=container.firstElementChild;container.querySelector('[data-retry]').addEventListener('click',()=>load(true))}
  }
  function personCard(person){
    return `<article class="birthday-person"><div><strong>${esc(person.name)}</strong><p>${label(person.kind)}${person.active?'':' · Inactivo'} · ${esc(person.context||'')}</p></div>
      <span class="birthday-day">${person.day?`${person.day} ${MONTHS[person.month-1].toLocaleLowerCase('es')}`:person.needsReview?'Fecha por revisar':'Sin fecha'}</span>
      <details><summary>${person.day?'Corregir fecha':'Completar fecha'}</summary><form data-person="${esc(person.kind+':'+person.id)}"><label>Fecha de nacimiento completa<input type="date" class="form-control" name="birthDate" max="${fechaSantoDomingo()}" required></label><small>Dato administrativo; el año no se publica en el listado.</small><button class="btn btn-sm btn-outline-primary mt-2" type="submit">Guardar fecha</button></form></details></article>`
  }
  function draw(){
    if(!active())return
    const summary=summarizeBirthdays(state.data.people,state.month,state)
    const event=state.data.celebrations.find(c=>c.period===currentPeriod())
    const allMonth=summarizeBirthdays(state.data.people,state.month,{includeInactive:state.includeInactive})
    const date=event?.date||suggestCelebrationDate(state.year,state.month)
    container.innerHTML=`<section class="birthday-page page-container" aria-label="Cumpleañeros y compartir mensual">
      <header class="birthday-header"><div><h2><i class="bi bi-gift me-2" aria-hidden="true"></i>Cumpleañeros</h2><p>Alumnos y maestros · ${MONTHS[state.month-1]} ${state.year}</p></div><button type="button" class="btn btn-outline-primary" data-current>Mes actual</button></header>
      ${adapter.isDemo?'<p class="alert alert-info">Modo demostración: datos ficticios y cambios solo durante esta sesión de la app.</p>':''}
      <div class="birthday-filters"><label>Mes<select class="form-select" data-month>${MONTHS.map((m,i)=>`<option value="${i+1}" ${i+1===state.month?'selected':''}>${m}</option>`).join('')}</select></label>
      <label>Año del compartir<input class="form-control" type="number" min="1900" max="2099" value="${state.year}" data-year></label>
      <label>Mostrar<select class="form-select" data-kind><option value="all">Alumnos y maestros</option><option value="alumno" ${state.kind==='alumno'?'selected':''}>Alumnos</option><option value="maestro" ${state.kind==='maestro'?'selected':''}>Maestros</option></select></label>
      <label>Buscar nombre<input class="form-control" type="search" value="${esc(state.search)}" data-search placeholder="Nombre del cumpleañero"></label></div>
      <label class="birthday-inactive"><input type="checkbox" data-inactive ${state.includeInactive?'checked':''}> Incluir fichas inactivas</label>
      <div class="birthday-stats" aria-label="Resumen del mes"><div><strong>${summary.total}</strong><span>Registros de cumpleaños</span></div><div><strong>${summary.alumnos}</strong><span>Alumnos</span></div><div><strong>${summary.maestros}</strong><span>Maestros</span></div><div><strong>${summary.missing}</strong><span>Sin fecha válida · del grupo filtrado</span></div></div>
      <p class="birthday-note">Los totales corresponden a los filtros. Cada ficha cuenta una vez por grupo; no se deduplican personas por nombre. Las fechas pendientes no se incluyen como cumpleaños.</p>
      <p role="status" data-message>${esc(state.message)}</p>
      <div class="birthday-columns"><section><h3>Cumpleaños del mes</h3><div class="birthday-list">${summary.people.slice(0,state.visible).map(personCard).join('')||'<p>No hay cumpleaños registrados para estos filtros.</p>'}</div>
      ${summary.people.length>state.visible?'<button class="btn btn-outline-primary mt-2" data-more>Mostrar 30 más</button>':''}
      <details class="birthday-missing"><summary>Fechas pendientes o por revisar (${summary.missing})</summary><p>Completa las fichas para que el conteo del mes sea más completo.</p>${summary.missingPeople.slice(0,state.missingVisible).map(personCard).join('')}${summary.missingPeople.length>state.missingVisible?'<button class="btn btn-outline-primary" data-more-missing>Mostrar 30 más pendientes</button>':''}</details></section>
      <section class="birthday-celebration"><h3>Compartir de ${MONTHS[state.month-1].toLocaleLowerCase('es')}</h3>
      <p>${event?`Estado: <strong>${CELEBRATION_STATES[event.status]||esc(event.status)}</strong>`:'Todavía no hay un compartir guardado.'} · ${allMonth.total} fichas de cumpleaños en el mes${state.includeInactive?' (incluye inactivos)':''}.</p>
      <p class="birthday-note">La fecha sugerida es el último día del mes. Reservar este compartir no suspende clases, no justifica ausencias y no envía convocatorias.</p>
      <form data-celebration><div class="birthday-form-grid"><label>Fecha<input type="date" class="form-control" name="date" min="${currentPeriod()}-01" max="${suggestCelebrationDate(state.year,state.month)}" value="${esc(date)}" required></label>
      <label>Estado<select class="form-select" name="status">${Object.entries(CELEBRATION_STATES).map(([key,value])=>`<option value="${key}" ${(event?.status||'programado')===key?'selected':''}>${value}</option>`).join('')}</select></label>
      <label>Hora inicial<input class="form-control" type="time" name="start" value="${esc(event?.start||'17:00')}" required></label><label>Hora final<input class="form-control" type="time" name="end" value="${esc(event?.end||'19:00')}" required></label></div>
      <label>Lugar<input class="form-control" name="location" maxlength="300" value="${esc(event?.location||'')}" required></label>
      <label>Responsable<input class="form-control" name="responsible" maxlength="200" value="${esc(event?.responsible||'')}" required></label>
      <label>Notas de organización<textarea class="form-control" name="notes" maxlength="4000" rows="3">${esc(event?.notes||'')}</textarea></label>
      <button class="btn btn-primary mt-3" type="submit">${event?'Guardar cambios del compartir':'Reservar día para el compartir'}</button></form>
      ${event?'<p class="birthday-note mt-2">La reserva se conserva al cancelar; puedes reprogramar este mismo registro.</p><button type="button" class="btn btn-outline-secondary" data-activities>Ver en Actividades Institucionales</button>':''}
      </section></div></section>`
    mountedNode=container.firstElementChild
    bind()
  }
  function bind(){
    container.querySelector('[data-activities]')?.addEventListener('click',()=>router.navigate('actividades-institucionales',{estado:''}))
    container.querySelector('[data-month]').addEventListener('change',e=>{state.month=Number(e.target.value);state.visible=30;draw()})
    container.querySelector('[data-year]').addEventListener('change',e=>{if(!e.target.checkValidity())return;state.year=Number(e.target.value);load()})
    container.querySelector('[data-kind]').addEventListener('change',e=>{state.kind=e.target.value;state.visible=30;draw()})
    container.querySelector('[data-search]').addEventListener('input',e=>{const position=e.target.selectionStart;state.search=e.target.value;state.visible=30;draw();const input=container.querySelector('[data-search]');input.focus();input.setSelectionRange(position,position)})
    container.querySelector('[data-inactive]').addEventListener('change',e=>{state.includeInactive=e.target.checked;load()})
    container.querySelector('[data-current]').addEventListener('click',()=>{const p=currentBirthdayPeriod();state.year=Number(p.slice(0,4));state.month=Number(p.slice(5));load()})
    container.querySelector('[data-more]')?.addEventListener('click',()=>{state.visible+=30;draw()})
    container.querySelector('[data-more-missing]')?.addEventListener('click',()=>{state.missingVisible+=30;draw();container.querySelector('.birthday-missing').open=true})
    container.querySelectorAll('[data-person]').forEach(form=>form.addEventListener('submit',async e=>{
      e.preventDefault();const [kind,id]=form.dataset.person.split(':');const value=new FormData(form).get('birthDate')
      await save(()=>adapter.saveBirthDate(kind,id,value),form,'Fecha de nacimiento guardada.')
    }))
    container.querySelector('[data-celebration]').addEventListener('submit',async e=>{
      e.preventDefault();const form=e.currentTarget;const fields=Object.fromEntries(new FormData(form));const existing=state.data.celebrations.find(c=>c.period===currentPeriod())
      await save(()=>adapter.saveCelebration({...fields,period:currentPeriod(),id:existing?.id,version:existing?.version}),form,'Compartir guardado en el calendario institucional.')
    })
  }
  async function save(action,form,message){
    if(state.busy)return
    state.busy=true
    const disabled=[...container.querySelectorAll('.birthday-filters input,.birthday-filters select,[data-inactive],[data-current],form button')]
    disabled.forEach(el=>el.disabled=true)
    try{await action();if(!active())return;state.message=message;await load(true)}
    catch(error){if(!active())return;const status=container.querySelector('[data-message]');if(status)status.textContent=error.message+' Puedes reintentar; los campos se conservan.';form.querySelector('input')?.focus()}
    finally{state.busy=false;disabled.forEach(el=>el.disabled=false)}
  }
  await load()
}
