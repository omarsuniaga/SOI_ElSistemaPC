import { getExemptionCandidates, listRecordExemptions } from '../api/recordExemptionsAdapter.js'
import { openRecordExemptionDialog } from './recordExemptionDialog.js'
import { escapeHTML as esc } from '../../../shared/utils/sanitize.js'

/** Starts from the teacher card: choose a date, then the actual scheduled class. */
export async function openExemptionDatePicker({ maestroId, nombre, onSaved }) {
  const dialog = document.createElement('dialog')
  dialog.setAttribute('aria-label', 'Exonerar clases')
  dialog.style.cssText='width:calc(100% - 24px);max-width:520px;max-height:90vh;overflow:auto;border:1px solid var(--bs-border-color,#ddd);border-radius:16px;padding:24px;background:var(--bs-body-bg,#fff);color:var(--bs-body-color,#222)'
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santo_Domingo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
  dialog.innerHTML=`<h3 class="fs-5 mb-1">Exonerar clases</h3><p class="text-muted mb-3">${esc(nombre)}</p>
    <p class="small">Elige la fecha y la clase que quieres exonerar. En el siguiente paso indicarás el motivo.</p>
    <label class="d-block mb-3">1. Fecha de la clase<input class="form-control mt-1" type="date" name="fecha" max="${today}" required></label>
    <label class="d-block mb-2">2. Clase<select class="form-select mt-1" name="clase" disabled><option value="">Primero elige una fecha</option></select></label>
    <p role="status" class="small text-muted" aria-live="polite">Puedes escoger una fecha anterior al rango del panel.</p>
    <p role="alert" class="text-danger small"></p>
    <div class="d-flex gap-2 justify-content-end mt-3"><button class="btn btn-outline-secondary" data-close>Cancelar</button><button class="btn btn-primary" data-continue disabled>Continuar al motivo <i class="bi bi-arrow-right" aria-hidden="true"></i></button></div>`
  const focused = document.activeElement
  const close=()=>{ dialog.remove(); focused?.focus() }
  dialog.addEventListener('cancel',close)
  document.body.append(dialog)
  if(dialog.showModal) dialog.showModal(); else dialog.setAttribute('open','')
  const date=dialog.querySelector('[name=fecha]'), select=dialog.querySelector('select'), next=dialog.querySelector('[data-continue]'), status=dialog.querySelector('[role=status]'), error=dialog.querySelector('[role=alert]')
  dialog.querySelector('[data-close]').onclick=close
  let rows=[], history=[], generation=0
  date.onchange=async()=>{
    const token=++generation
    rows=[]; history=[];next.disabled=true;select.disabled=true;error.textContent=''
    select.innerHTML='<option value="">Selecciona una clase</option>'
    if(!date.value || !date.checkValidity()) { status.textContent='Elige una fecha válida hasta hoy.';return }
    status.textContent='Buscando clases de esa fecha…'
    try {
      const [candidates, exemptions]=await Promise.all([getExemptionCandidates(maestroId,date.value),listRecordExemptions(maestroId,date.value,date.value)])
      if(token!==generation || !dialog.isConnected) return
      rows=candidates;history=exemptions
      const labels={registrada:'Registrada',vencida:'Sin registrar',pendiente:'Pendiente',exonerada:'Exonerada',cubierta_emergente:'Justificada',futura:'Aún no finaliza'}
      select.innerHTML='<option value="">Selecciona una clase</option>'+rows.map((row,i)=>`<option value="${i}">${esc(row.clase_nombre)}${row.hora_inicio ? ` · ${esc(row.hora_inicio.slice(0,5))}` : ''} — ${labels[row.estado] || esc(row.estado)}</option>`).join('')
      select.disabled=rows.length===0
      status.textContent=rows.length ? 'Selecciona la clase. Podrás exonerar asistencia, contenido o ambos.' : 'No hay clases programadas para esa fecha dentro del período activo. Prueba otra fecha.'
    } catch(e) { if(token===generation && dialog.isConnected) { error.textContent=e.message;status.textContent='No se pudieron cargar las clases. Puedes volver a elegir la fecha.' } }
  }
  select.onchange=()=>{ next.disabled=select.value==='' }
  next.onclick=async()=>{
    const row=rows[Number(select.value)]
    if(select.value==='' || !row) return
    close()
    await openRecordExemptionDialog({row,maestroId,exemptions:history,onSaved})
  }
  date.focus()
}
