import { birthdaysAdapter } from '../api/birthdaysAdapter.js'
import { fechaSantoDomingo } from '../../../shared/utils/institutionalDates.js'
import { escHTML } from '../../../portal-maestros/utils/portalUtils.js'

/** Self-service is resolved by auth.uid() in the adapter; no maestro ID is accepted. */
export async function mountTeacherBirthDateField(root, adapter = birthdaysAdapter) {
  root.innerHTML='<p class="apple-caption">Cargando fecha de nacimiento…</p>'
  try {
    const data=await adapter.getOwnBirthDate()
    if(!data.available){root.innerHTML='';return}
    root.innerHTML=`<div class="pm-settings-field"><label for="perfilFechaNacimiento" class="apple-caption">Fecha de nacimiento</label>
      <input type="date" id="perfilFechaNacimiento" class="input-apple" max="${fechaSantoDomingo()}" value="${escHTML(data.date||'')}" aria-describedby="perfilBirthdayHelp">
      <p id="perfilBirthdayHelp" class="apple-caption">En la vista de cumpleañeros solo se mostrarán el día y el mes. Esta fecha se guarda por separado.</p>
      <button type="button" class="btn-apple-secondary" id="perfilGuardarNacimiento">Guardar fecha de nacimiento</button><p role="status" data-birthday-message></p></div>`
    root.querySelector('button').addEventListener('click',async()=>{
      const button=root.querySelector('button');button.disabled=true
      const status=root.querySelector('[data-birthday-message]')
      try{await adapter.saveOwnBirthDate(root.querySelector('input').value);status.textContent='Fecha de nacimiento guardada.'}
      catch(error){status.textContent=error.message}
      finally{button.disabled=false}
    })
  }catch(error){
    root.innerHTML=`<p role="alert">No se pudo cargar la fecha de nacimiento: ${escHTML(error.message)}</p><button type="button" class="btn-apple-secondary">Reintentar</button>`
    root.querySelector('button').addEventListener('click',()=>mountTeacherBirthDateField(root,adapter))
  }
}
