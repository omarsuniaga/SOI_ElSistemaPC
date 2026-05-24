import{i as e}from"./supabase-C4ics26R.js";import{r as t}from"./maestroAuth-Cae-9DFh.js";import{t as n}from"./AppToast-BOjiJExQ.js";import{i as r}from"./portalUtils-CisZ9vg-.js";import{t as i}from"./AppModal-CLA9fW7x.js";function a(e,{onClose:t}={}){if(!e)return{dispose:()=>{}};let n=document.activeElement;function r(){return Array.from(e.querySelectorAll(`button:not([disabled]):not([hidden]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])`))}function i(){let e=r();e.length>0&&e[0].focus()}function a(e){if(e.key===`Escape`){e.preventDefault(),typeof t==`function`&&t();return}if(e.key!==`Tab`)return;let n=r();if(n.length===0){e.preventDefault();return}e.preventDefault();let i=n.indexOf(document.activeElement);e.shiftKey?n[i<=0?n.length-1:i-1].focus():n[i===-1||i===n.length-1?0:i+1].focus()}i(),e.addEventListener(`keydown`,a);function o(){e.removeEventListener(`keydown`,a),n&&typeof n.focus==`function`&&n.focus()}return{dispose:o}}async function o(t){let{data:n,error:r}=await e.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`maestro_id`,t);if(r)throw r;return n||[]}async function s(t,n,r){if(!t||t.length===0)return[];let{data:i,error:a}=await e.from(`sesiones`).select(`id, clase_id, fecha, hora_inicio, hora_fin, salon_id`).in(`clase_id`,t).gte(`fecha`,n).lte(`fecha`,r).order(`fecha`,{ascending:!0});if(a)throw a;return i||[]}async function c(t){if(!t||t.length===0)return[];let{data:n,error:r}=await e.from(`horarios`).select(`id, clase_id, dia, hora_inicio, hora_fin`).in(`clase_id`,t);if(r)throw r;return n||[]}async function l(){let{data:t,error:n}=await e.from(`salones`).select(`id, nombre, capacidad, ubicacion`).eq(`activo`,!0).order(`nombre`,{ascending:!0});if(n)throw n;return t||[]}async function u(t,n){if(!t||!n)return[];let{data:r,error:i}=await e.from(`sesiones`).select(`id, salon_id, clase_id, fecha, hora_inicio, hora_fin`).eq(`fecha`,t).order(`hora_inicio`,{ascending:!0});if(i)throw i;return(r||[]).filter(e=>!e.hora_inicio||!e.hora_fin?!1:n>=e.hora_inicio&&n<e.hora_fin)}async function d(t){let{data:n,error:r}=await e.from(`ausencias_maestros`).insert([{maestro_id:t.maestro_id,tipo_ausencia:t.tipo_ausencia,fecha_inicio:t.fecha_inicio,fecha_fin:t.fecha_fin,motivo:t.motivo,urgencia:t.urgencia,duracion_tipo:t.duracion_tipo,clases_afectadas:t.clases_afectadas,actividades_por_clase:t.actividades_por_clase,clase_emergente:t.clase_emergente,archivo_url:t.archivo_url,estado:t.estado||`pendiente`,creado_en:new Date().toISOString()}]).select().single();if(r)throw r;return n}async function f({ausencia:t,maestro:n,approvalUrl:r}){if(!t||!n)return null;let i=t.fecha_inicio===t.fecha_fin?t.fecha_inicio:`${t.fecha_inicio} al ${t.fecha_fin}`,a=`Nueva solicitud de ausencia: ${n.nombre_completo||n.nombre} (${i}) - Tipo: ${t.tipo_ausencia}`,{data:o,error:s}=await e.from(`notificaciones`).insert([{profile_id:null,tipo:`sistema`,titulo:`Nueva Solicitud de Ausencia`,mensaje:a,deep_link:r||`/ausencias/pendientes`,estado:`pendiente`,ausencia_id:t.id,creado_en:new Date().toISOString()}]).select().single();if(s)throw s;return o}var p=500,m=5*1024*1024,h=new Set([`application/pdf`,`image/jpeg`,`image/png`]),g=new Set([`enfermedad`,`personal`,`capacitacion`,`vacaciones`,`otro`]),_=new Set([`baja`,`media`,`alta`,`critica`]);function v(e){return typeof e==`string`&&e.trim().length>0}function y(e,t){let n={};v(e)||(n.fechaInicio=`Indicá la fecha inicial.`),v(t)||(n.fechaFin=`Indicá la fecha final.`),!n.fechaInicio&&!n.fechaFin&&t<e&&(n.fechaFin=`La fecha final no puede ser anterior a la fecha inicial.`);let r=Object.keys(n).length===0;return{valid:r,duracionTipo:r&&e===t?`un_dia`:`varios_dias`,errors:n}}function b(e){let t={};return e?(h.has(e.type)?e.size>m&&(t.archivo=`El documento no puede superar 5MB.`):t.archivo=`El documento debe ser PDF, JPG o PNG.`,{valid:Object.keys(t).length===0,errors:t}):{valid:!0,errors:t}}function x(e={}){let t=y(e.fechaInicio,e.fechaFin),n=b(e.archivo?.file||e.archivo||null),r={...t.errors,...n.errors};g.has(e.tipoAusencia)||(r.tipoAusencia=`Seleccioná un tipo de ausencia válido.`),_.has(e.urgencia)||(r.urgencia=`Seleccioná una urgencia válida.`),v(e.motivo)?e.motivo.trim().length>p&&(r.motivo=`El motivo no puede superar ${p} caracteres.`):r.motivo=`Explicá el motivo de la ausencia.`;let i=(e.clasesAfectadas||[]).filter(e=>e.selected!==!1);for(let e of i)v(e.actividadReemplazo)||(r[`actividad_${e.claseId}`]=`Indicá la actividad de reemplazo para esta clase.`);return e.claseEmergente?.activo&&(v(e.claseEmergente.fechaNueva)||(r.claseEmergenteFecha=`Indicá la fecha de recuperación.`),v(e.claseEmergente.horaNueva)||(r.claseEmergenteHora=`Indicá la hora de recuperación.`),v(e.claseEmergente.salonIdNuevo)||(r.claseEmergenteSalon=`Seleccioná un salón disponible.`)),{valid:Object.keys(r).length===0,duracionTipo:t.duracionTipo,errors:r}}[...h];var S=`documentos`,C=[`domingo`,`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`];function w(e){return String(e||``).trim().toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``)}function T(e,t){let n=new Set,r=new Date(`${e}T00:00:00`),i=new Date(`${t}T00:00:00`);for(;r<=i;)n.add(w(C[r.getDay()])),r.setDate(r.getDate()+1);return n}function E(e){return!e?.hora_inicio&&!e?.hora_fin?``:e.hora_fin?`${e.hora_inicio} - ${e.hora_fin}`:e.hora_inicio}function D(e){return String(e||`soporte`).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-zA-Z0-9._-]/g,`_`)}async function O(e,t,n){let r=await o(e),i=(r||[]).map(e=>e.id);if(!i.length)return[];let[a,l]=await Promise.all([s(i,t,n),c(i)]),u=new Map(r.map(e=>[e.id,e])),d=new Map;for(let e of a||[]){let n=u.get(e.clase_id);n&&d.set(e.clase_id,{claseId:e.clase_id,className:n.nombre,instrumento:n.instrumento||``,sessionDate:e.fecha||t,sessionTime:E(e),actividadReemplazo:``,selected:!0})}let f=T(t,n);for(let e of l||[]){if(!f.has(w(e.dia))||d.has(e.clase_id))continue;let t=u.get(e.clase_id);t&&d.set(e.clase_id,{claseId:e.clase_id,className:t.nombre,instrumento:t.instrumento||``,sessionDate:``,sessionTime:E(e),actividadReemplazo:``,selected:!0})}return[...d.values()]}async function k(e,t){if(!e||!t)return[];let[n,r]=await Promise.all([l(),u(e,t)]),i=new Set((r||[]).map(e=>e.salon_id).filter(Boolean));return(n||[]).filter(e=>!i.has(e.id))}async function A({maestroId:t,file:n}){if(!n)return null;let r=`ausencias/${t}/${Date.now()}_${D(n.name)}`,{error:i}=await e.storage.from(S).upload(r,n,{contentType:n.type});if(i)throw i;let{data:a}=e.storage.from(S).getPublicUrl(r);return a.publicUrl}function j({maestro:e,formState:t,archivoUrl:n=null}){let r=(t.clasesAfectadas||[]).filter(e=>e.selected!==!1),i=Object.fromEntries(r.map(e=>[e.claseId,e.actividadReemplazo||``])),a=t.claseEmergente?.activo?{activo:!0,clase_id:t.claseEmergente.claseId||null,fecha:t.claseEmergente.fechaNueva||null,hora:t.claseEmergente.horaNueva||null,salon_id:t.claseEmergente.salonIdNuevo||null}:null;return{maestro_id:e.id,tipo_ausencia:t.tipoAusencia,fecha_inicio:t.fechaInicio,fecha_fin:t.fechaFin,motivo:t.motivo?.trim()||``,urgencia:t.urgencia,duracion_tipo:t.duracionTipo||(t.fechaInicio===t.fechaFin?`un_dia`:`varios_dias`),clases_afectadas:r.map(e=>e.claseId),actividades_por_clase:i,clase_emergente:a,archivo_url:n,estado:`pendiente`}}function M({maestro:e,ausencia:t,clasesAfectadas:n=[],coverageSummary:r=`Pendiente de coordinación`,approvalUrl:i=``}){let a=t.fecha_inicio===t.fecha_fin?t.fecha_inicio:`${t.fecha_inicio} al ${t.fecha_fin}`;return[`Solicitud de ausencia`,`Maestro: ${e?.nombre_completo||e?.nombre||`No especificado`}`,`Tipo: ${t.tipo_ausencia}`,`Urgencia: ${t.urgencia}`,`Fechas: ${a}`,`Clases afectadas: ${n.length}`,`Solución: ${r}`,i?`Aprobación: ${i}`:``,``,`Enviado desde Portal SOI`].filter(Boolean).join(`
`)}async function N({maestro:e,formState:t,notifyDirector:n=!0,approvalUrl:r=``}){let i=x(t);if(!i.valid){let e=Error(`La solicitud de ausencia tiene errores de validación.`);throw e.validationErrors=i.errors,e}let a=await A({maestroId:e.id,file:t.archivo?.file||null}),o=await d(j({maestro:e,formState:{...t,duracionTipo:i.duracionTipo},archivoUrl:a}));return{ausencia:o,whatsappText:M({maestro:e,ausencia:o,clasesAfectadas:t.clasesAfectadas||[],coverageSummary:t.coverageSummary,approvalUrl:r}),notification:n&&f?await f({ausencia:o,maestro:e,approvalUrl:r}):null}}var P=[{value:`enfermedad`,label:`Médica`},{value:`personal`,label:`Personal`},{value:`capacitacion`,label:`Curso`},{value:`vacaciones`,label:`Vacaciones`},{value:`otro`,label:`Otro`}],F=[{value:`baja`,label:`Baja`},{value:`media`,label:`Media`},{value:`alta`,label:`Alta`}],I=new class{constructor(){this.maestro=null,this._focusTrap=null,this.state=this._defaultState()}_defaultState(){return{fechaInicio:``,fechaFin:``,tipoAusencia:`personal`,urgencia:`media`,motivo:``,notifyDirector:!0,clasesAfectadas:[],coverageType:`activities`,claseEmergente:{fecha:``,hora:``,salonIdNuevo:null},archivo:{file:null,uploadedUrl:null},availableSalons:[],submitted:!1,whatsappText:``}}_renderForm(){let e=new Date().toISOString().split(`T`)[0];return`
      <form class="pm-ausencia-form" id="ausencia-form" novalidate>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Fechas de ausencia</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <label class="pm-form-label">
              Desde <span class="pm-required">*</span>
              <input type="date" id="fecha-inicio" value="${r(this.state.fechaInicio)}" min="${e}">
            </label>
            <label class="pm-form-label">
              Hasta <span class="pm-required">*</span>
              <input type="date" id="fecha-fin" value="${r(this.state.fechaFin)}" min="${e}">
            </label>
          </div>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Clases afectadas</h3>
          <div id="clases-afectadas-container">
            <p style="color:var(--pm-text-muted);">Seleccioná las fechas para cargar las clases.</p>
          </div>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Opciones de cobertura</h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
              <input type="radio" name="coverage-type" id="coverage-activities" value="activities"
                ${this.state.coverageType===`activities`?`checked`:``}>
              <span>Asignar actividades/tareas</span>
            </label>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
              <input type="radio" name="coverage-type" id="coverage-reschedule" value="reschedule"
                ${this.state.coverageType===`reschedule`?`checked`:``}>
              <span>Reprogramar clase emergente</span>
            </label>
          </div>

          <div id="reschedule-panel" style="${this.state.coverageType===`reschedule`?``:`display:none;`}margin-top:1rem;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label class="pm-form-label">
                Fecha emergente
                <input type="date" id="emergente-fecha" value="${r(this.state.claseEmergente.fecha)}" min="${e}">
              </label>
              <label class="pm-form-label">
                Hora emergente
                <input type="time" id="emergente-hora" value="${r(this.state.claseEmergente.hora)}">
              </label>
            </div>
            <div id="salones-container"></div>
          </div>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Motivo</h3>
          <textarea id="motivo" maxlength="500" placeholder="Explicá brevemente el motivo de la ausencia"
            style="width:100%;min-height:80px;padding:0.5rem;border:1px solid var(--pm-border);border-radius:8px;font-family:inherit;"
          >${r(this.state.motivo)}</textarea>
          <small style="color:var(--pm-text-muted);"><span id="motivo-count">${this.state.motivo.length}</span>/500</small>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Tipo de ausencia</h3>
          <select id="tipo-ausencia">
            ${P.map(e=>`<option value="${e.value}" ${e.value===this.state.tipoAusencia?`selected`:``}>${r(e.label)}</option>`).join(``)}
          </select>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Urgencia</h3>
          <select id="urgencia">
            ${F.map(e=>`<option value="${e.value}" ${e.value===this.state.urgencia?`selected`:``}>${r(e.label)}</option>`).join(``)}
          </select>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Documento soporte</h3>
          <input type="file" id="archivo-soporte" accept=".pdf,.jpg,.jpeg,.png">
          <small style="color:var(--pm-text-muted);">PDF, JPG o PNG. Máximo 5MB.</small>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Mensaje WhatsApp</h3>
          <p style="color:var(--pm-text-muted);font-size:0.9rem;">Se generará automáticamente al enviar la solicitud.</p>
          <div id="whatsapp-preview" style="display:none;"></div>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Notificación al director</h3>
          <label style="display:flex;align-items:center;gap:0.75rem;cursor:pointer;">
            <input type="checkbox" id="notify-director" ${this.state.notifyDirector?`checked`:``}>
            <span>Notificar al director automáticamente</span>
          </label>
        </section>

        <div id="ausencia-errors" role="alert" style="color:var(--pm-danger);margin-top:1rem;"></div>
      </form>
    `}_renderSuccess(e){return`
      <div style="text-align:center;padding:1rem;">
        <p style="font-size:1.25rem;font-weight:600;color:var(--pm-success);">Solicitud enviada</p>
        <p style="color:var(--pm-text-muted);">Tu solicitud de ausencia fue enviada correctamente.</p>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;justify-content:center;">
          <button type="button" id="copy-whatsapp"
            style="padding:0.75rem 1.25rem;background:var(--pm-primary);color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;">
            📋 Copiar mensaje
          </button>
          <button type="button" id="open-whatsapp-btn"
            style="padding:0.75rem 1.25rem;background:#25D366;color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;">
            💬 Enviar por WhatsApp
          </button>
        </div>
      </div>
    `}open(){if(this._focusTrap?.dispose?.(),this._focusTrap=null,this.maestro=t(),!this.maestro){n.error(`Iniciá sesión para solicitar ausencias`);return}this.state=this._defaultState(),i.open({title:`Nueva Solicitud de Ausencia`,size:`lg`,body:this._renderForm(),saveText:`Enviar solicitud`,onSave:()=>this._handleSubmit(),onShow:()=>this._attachEvents()})}_attachEvents(){let e=document.querySelector(`.app-modal-dialog`);e&&(this._focusTrap=a(e,{onClose:()=>i.close()}));let t=document.getElementById(`fecha-inicio`),n=document.getElementById(`fecha-fin`),r=()=>{t&&(this.state.fechaInicio=t.value),n&&(this.state.fechaFin=n.value),this.state.fechaInicio&&this.state.fechaFin&&this._loadAffectedClasses()};t?.addEventListener(`change`,r),n?.addEventListener(`change`,r),document.querySelectorAll(`input[name="coverage-type"]`).forEach(e=>{e.addEventListener(`change`,e=>{this.state.coverageType=e.target.value;let t=document.getElementById(`reschedule-panel`);t&&(t.style.display=e.target.value===`reschedule`?``:`none`)})});let o=()=>{let e=document.getElementById(`emergente-fecha`)?.value,t=document.getElementById(`emergente-hora`)?.value;e&&(this.state.claseEmergente.fecha=e),t&&(this.state.claseEmergente.hora=t),this.state.claseEmergente.fecha&&this.state.claseEmergente.hora&&this._loadAvailableSalons()};document.getElementById(`emergente-fecha`)?.addEventListener(`change`,o),document.getElementById(`emergente-hora`)?.addEventListener(`change`,o),document.getElementById(`motivo`)?.addEventListener(`input`,e=>{this.state.motivo=e.target.value;let t=document.getElementById(`motivo-count`);t&&(t.textContent=String(e.target.value.length))}),document.getElementById(`tipo-ausencia`)?.addEventListener(`change`,e=>{this.state.tipoAusencia=e.target.value}),document.getElementById(`urgencia`)?.addEventListener(`change`,e=>{this.state.urgencia=e.target.value}),document.getElementById(`notify-director`)?.addEventListener(`change`,e=>{this.state.notifyDirector=e.target.checked}),document.getElementById(`archivo-soporte`)?.addEventListener(`change`,e=>{this.state.archivo.file=e.target.files?.[0]||null})}async _loadAffectedClasses(){let e=document.getElementById(`clases-afectadas-container`);if(e){e.innerHTML=`<p style="color:var(--pm-text-muted);">Cargando clases...</p>`;try{let t=await O(this.maestro.id,this.state.fechaInicio,this.state.fechaFin);if(this.state.clasesAfectadas=t.map(e=>({...e,actividadReemplazo:e.actividadReemplazo||``})),t.length===0){e.innerHTML=`<p style="color:var(--pm-text-muted);">No hay clases en el período seleccionado.</p>`;return}e.innerHTML=t.map(e=>`
        <div class="pm-step-card" style="margin-bottom:0.75rem;padding:0.75rem;border:1px solid var(--pm-border);border-radius:8px;">
          <h4 style="margin:0 0 0.25rem;">${r(e.className||e.nombre||`Clase`)}</h4>
          <p style="margin:0;color:var(--pm-text-muted);font-size:0.85rem;">${r(e.sessionDate||e.fecha||``)} ${r(e.sessionTime||e.hora||``)}</p>
          <textarea data-activity-class-id="${r(e.claseId||e.id||``)}"
            placeholder="Actividad de reemplazo..."
            style="margin-top:0.5rem;width:100%;min-height:50px;padding:0.4rem;border:1px solid var(--pm-border);border-radius:6px;font-family:inherit;"
          >${r(e.actividadReemplazo||``)}</textarea>
        </div>
      `).join(``),e.querySelectorAll(`[data-activity-class-id]`).forEach(e=>{e.addEventListener(`input`,e=>{let t=e.target.dataset.activityClassId,n=this.state.clasesAfectadas.findIndex(e=>(e.claseId||e.id)===t);n!==-1&&(this.state.clasesAfectadas[n].actividadReemplazo=e.target.value)})})}catch(t){console.warn(`[AusenciaModal] Error loading affected classes:`,t),e.innerHTML=`<p style="color:var(--pm-danger);">Error al cargar las clases.</p>`}}}async _loadAvailableSalons(){let e=document.getElementById(`salones-container`);if(e){e.innerHTML=`<p style="color:var(--pm-text-muted);">Cargando salones...</p>`;try{let t=await k(this.state.claseEmergente.fecha,this.state.claseEmergente.hora);if(this.state.availableSalons=t,t.length===0){e.innerHTML=`<p style="color:var(--pm-text-muted);">No hay salones disponibles.</p>`;return}e.innerHTML=`
        <div style="margin-top:0.75rem;">
          <h4 style="margin:0 0 0.5rem;font-size:0.9rem;">Salón disponible:</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${t.map(e=>`
              <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                <input type="radio" name="salon-emergente" value="${r(e.id)}"
                  ${this.state.claseEmergente.salonIdNuevo===e.id?`checked`:``}>
                <span>${r(e.nombre)} (cap. ${r(String(e.capacidad))})</span>
              </label>
            `).join(``)}
          </div>
        </div>
      `,e.querySelectorAll(`[name="salon-emergente"]`).forEach(e=>{e.addEventListener(`change`,e=>{this.state.claseEmergente.salonIdNuevo=e.target.value}),e.addEventListener(`click`,e=>{this.state.claseEmergente.salonIdNuevo=e.target.value})})}catch(t){console.warn(`[AusenciaModal] Error loading salons:`,t),e.innerHTML=`<p style="color:var(--pm-danger);">Error al cargar los salones.</p>`}}}_validate(){let e=[];return this.state.fechaInicio||e.push(`Seleccioná la fecha de inicio`),this.state.fechaFin||e.push(`Seleccioná la fecha de fin`),this.state.fechaInicio&&this.state.fechaFin&&this.state.fechaInicio>this.state.fechaFin&&e.push(`La fecha final debe ser después de la fecha inicial`),(!this.state.motivo||this.state.motivo.trim().length===0)&&e.push(`Explicá el motivo de la ausencia`),e}async _handleSubmit(){let e=document.getElementById(`fecha-inicio`),t=document.getElementById(`fecha-fin`),r=document.getElementById(`motivo`);e&&(this.state.fechaInicio=e.value),t&&(this.state.fechaFin=t.value),r&&(this.state.motivo=r.value);let a=this._validate();if(a.length>0){let e=document.getElementById(`ausencia-errors`);return e&&(e.textContent=a.join(`; `)),!1}try{let e=(await N({maestro:this.maestro,fechaInicio:this.state.fechaInicio,fechaFin:this.state.fechaFin,tipoAusencia:this.state.tipoAusencia,urgencia:this.state.urgencia,motivo:this.state.motivo,notifyDirector:this.state.notifyDirector,clasesAfectadas:this.state.clasesAfectadas,coverageType:this.state.coverageType,claseEmergente:this.state.claseEmergente}))?.whatsappText||``;this.state.whatsappText=e,this.state.submitted=!0;let t=document.querySelector(`.app-modal-body`);t&&(t.innerHTML=this._renderSuccess(e),this._attachSuccessEvents(t,e)),i.resetSaveBtn(`Cerrar`)}catch(e){console.error(`[AusenciaModal] Error submitting form:`,e),n.error(`Error al enviar la solicitud`)}return!1}_attachSuccessEvents(e,t){e.querySelector(`#copy-whatsapp`)?.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(t),n.success(`Mensaje copiado`)}catch{n.error(`No se pudo copiar el mensaje`)}}),e.querySelector(`#open-whatsapp-btn`)?.addEventListener(`click`,()=>{let e=encodeURIComponent(t);window.open(`https://wa.me/?text=${e}`,`_blank`,`noopener,noreferrer`)})}};export{a as n,I as t};