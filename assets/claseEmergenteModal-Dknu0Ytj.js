import{t as e}from"./AppToast-3qbHkRVc.js";import{t}from"./AppModal-CBzMtyFx.js";var n=null,r=null;function i(i={}){let{fecha:o=``,claseId:s=``,clases:c=[],alumnos:l=[],maestroId:u=null,onSave:d=null}=i;n=d,r=u,t.open({title:`Nueva Clase Emergente`,size:`lg`,saveText:`Crear Clase`,cancelText:`Cancelar`,body:`
      <form id="formClaseEmergente" class="pm-emergente-form">
        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">Informaci&oacute;n de la Sesi&oacute;n</h3>
          <div class="pm-emergente-grid">
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Fecha</label>
              <input type="date" class="pm-emergente-input" id="modal-fecha" required value="${o}">
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Actividad / clase</label>
              <input type="text" class="pm-emergente-input" id="modal-clase_id" required placeholder="Ej: Clase grupal de violín, Ensayo de orquesta, Taller de teoría...">
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Hora inicio</label>
              <input type="time" class="pm-emergente-input" id="modal-hora_inicio" required>
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Hora fin</label>
              <input type="time" class="pm-emergente-input" id="modal-hora_fin" required>
            </div>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">Contenido</h3>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Actividad / t&iacute;tulo</label>
            <input type="text" class="pm-emergente-input" id="modal-tema" required placeholder="Ej: Concierto institucional">
          </div>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Descripci&oacute;n</label>
            <textarea class="pm-emergente-textarea" id="modal-contenido" rows="3" placeholder="Describe qu&eacute; ocurri&oacute; o qu&eacute; se trabaj&oacute;..."></textarea>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">Motivo</h3>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Motivo libre</label>
            <input type="text" class="pm-emergente-input" id="modal-motivo" list="modal-motivos-sugeridos" required maxlength="120" placeholder="Ej: Concierto, masterclass, reuni&oacute;n, capacitaci&oacute;n...">
            <datalist id="modal-motivos-sugeridos">
              <option value="Concierto">
              <option value="Masterclass">
              <option value="Reunion">
              <option value="Evento institucional">
              <option value="Capacitacion">
              <option value="Ensayo general anticipado">
            </datalist>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">Alumnos participantes</h3>
          <div class="pm-emergente-filters">
            <input type="search" class="pm-emergente-input" id="modal-alumnos-buscar" placeholder="Buscar por nombre, clase o instrumento...">
          </div>
          <div class="pm-emergente-select-all">
            <label class="pm-emergente-checkbox-sm">
              <input type="checkbox" id="modal-seleccionar-todos">
              <span class="pm-emergente-checkbox-mark-sm">✓</span>
              <span class="pm-emergente-select-all-text">Seleccionar todos los visibles</span>
            </label>
          </div>
          <div class="pm-emergente-field full">
            <div id="modal-alumnos-lista" class="pm-emergente-students"></div>
            <span class="pm-emergente-hint" id="modal-alumnos-resumen">Selecciona al menos un alumno para crear el registro.</span>
          </div>
        </div>

        <div class="pm-emergente-section">
          <label class="pm-emergente-checkbox">
            <input type="checkbox" id="modal-es_co-docencia">
            <span class="pm-emergente-checkbox-mark">✓</span>
            <span class="pm-emergente-checkbox-text">&iquest;Esta clase tiene co-docencia?</span>
          </label>
          
          <div id="codocencia-fields" class="pm-emergente-codocencia" style="display: none;">
            <div class="pm-emergente-codocencia-card">
              <label class="pm-emergente-label">Maestro auxiliar</label>
              <select class="pm-emergente-select" id="modal-maestro_auxiliar_id">
                <option value="">Seleccionar maestro...</option>
              </select>
              <span class="pm-emergente-hint">El maestro auxiliar podr&aacute; ver y editar esta sesi&oacute;n.</span>
            </div>
          </div>
        </div>

        <style>
          .pm-emergente-form { display: flex; flex-direction: column; gap: 1.25rem; }
          .pm-emergente-section { display: flex; flex-direction: column; gap: 0.75rem; }
          .pm-emergente-section-title { font-size: 0.8125rem; font-weight: 600; color: var(--pm-text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid var(--pm-border); }
          .pm-emergente-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .pm-emergente-field { display: flex; flex-direction: column; gap: 0.375rem; }
          .pm-emergente-field.full { grid-column: span 2; }
          .pm-emergente-label { font-size: 0.8125rem; font-weight: 500; color: var(--pm-text); }
          .pm-emergente-input, .pm-emergente-select, .pm-emergente-textarea { padding: 0.625rem 0.875rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.875rem; background: var(--pm-surface); color: var(--pm-text); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
          .pm-emergente-input:focus, .pm-emergente-select:focus, .pm-emergente-textarea:focus { border-color: var(--pm-primary); box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1); }
          .pm-emergente-textarea { resize: vertical; min-height: 80px; }
          .pm-emergente-checkbox { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--pm-surface-2); border-radius: 10px; }
          .pm-emergente-checkbox input { display: none; }
          .pm-emergente-checkbox-mark { width: 22px; height: 22px; border: 2px solid var(--pm-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: transparent; transition: all 0.2s; }
          .pm-emergente-checkbox input:checked + .pm-emergente-checkbox-mark { background: var(--pm-primary); border-color: var(--pm-primary); color: white; }
          .pm-emergente-checkbox-text { font-size: 0.875rem; color: var(--pm-text); }
          .pm-emergente-codocencia { margin-top: 0.5rem; }
          .pm-emergente-codocencia-card { padding: 1rem; background: linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(88, 86, 214, 0.05) 100%); border: 1px solid rgba(88, 86, 214, 0.2); border-radius: 12px; display: flex; flex-direction: column; gap: 0.5rem; }
          .pm-emergente-filters { display: grid; gap: 0.5rem; }
          .pm-emergente-hint { font-size: 0.75rem; color: var(--pm-text-muted); }
          .pm-emergente-students { display: grid; gap: 0.4rem; max-height: 220px; overflow-y: auto; padding: 0.5rem; border: 1px solid var(--pm-border); border-radius: 10px; background: var(--pm-surface-2); }
          .pm-emergente-student { display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.5rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem; flex-wrap: wrap; }
          .pm-emergente-student:hover { background: var(--pm-surface); }
          .pm-emergente-student-tags { display: inline-flex; gap: 0.3rem; margin-left: auto; flex-wrap: wrap; }
          .pm-emergente-tag { font-size: 0.65rem; padding: 0.1rem 0.45rem; border-radius: 999px; background: var(--pm-surface); color: var(--pm-text-muted); border: 1px solid var(--pm-border); white-space: nowrap; }
          .pm-emergente-tag-instrument { background: rgba(88,86,214,0.08); color: var(--pm-primary); border-color: rgba(88,86,214,0.2); }
          .pm-emergente-select-all { display: flex; align-items: center; gap: 0.5rem; }
          .pm-emergente-checkbox-sm { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.8rem; color: var(--pm-text-muted); }
          .pm-emergente-checkbox-sm input { display: none; }
          .pm-emergente-checkbox-mark-sm { width: 18px; height: 18px; border: 2px solid var(--pm-border); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: transparent; transition: all 0.2s; flex-shrink: 0; }
          .pm-emergente-checkbox-sm input:checked + .pm-emergente-checkbox-mark-sm { background: var(--pm-primary); border-color: var(--pm-primary); color: white; }
          .pm-emergente-select-all-text { font-size: 0.8rem; color: var(--pm-text-muted); }
        </style>
      </form>
    `,onShow:e=>{let t=e.querySelector(`#modal-es_co-docencia`),n=e.querySelector(`#codocencia-fields`),r=e.querySelector(`#modal-alumnos-lista`),i=e.querySelector(`#modal-alumnos-buscar`),o=e.querySelector(`#modal-seleccionar-todos`),s=e.querySelector(`#modal-alumnos-resumen`);t?.addEventListener(`change`,e=>{n.style.display=e.target.checked?`block`:`none`});let c=Array.from(new Map((l||[]).filter(Boolean).map(e=>[e.id,e])).values()).sort((e,t)=>(e.nombre_completo||``).localeCompare(t.nombre_completo||``)),u=new Set,d=()=>{let e=u.size;s.textContent=e>0?`${e} alumno(s) seleccionado(s).`:`Selecciona al menos un alumno para crear el registro.`},f=()=>{let e=(i?.value||``).trim().toLowerCase();return c.filter(t=>e?[t.nombre_completo||``,t.instrumento_principal||``,...t.clase_nombres||[]].join(` `).toLowerCase().includes(e):!0)},p=()=>{let e=f(),t=e.length>0&&e.every(e=>u.has(e.id));o.checked=t,o.indeterminate=!t&&e.some(e=>u.has(e.id))},m=()=>{let t=f();r.innerHTML=t.length?t.map(e=>`
            <label class="pm-emergente-student">
              <input type="checkbox" class="modal-alumno-check" value="${e.id}" ${u.has(e.id)?`checked`:``}>
              <span>${a(e.nombre_completo||`Alumno sin nombre`)}</span>
              <span class="pm-emergente-student-tags">
                ${e.instrumento_principal?`<span class="pm-emergente-tag pm-emergente-tag-instrument">${a(e.instrumento_principal)}</span>`:``}
                ${(e.clase_nombres||[]).map(e=>`<span class="pm-emergente-tag">${a(e)}</span>`).join(``)}
              </span>
            </label>
          `).join(``):`<p class="pm-emergente-hint" style="margin:0;">No hay alumnos que coincidan con los filtros.</p>`,r.querySelectorAll(`.modal-alumno-check`).forEach(t=>{t.addEventListener(`change`,()=>{t.checked?u.add(t.value):u.delete(t.value),e.dataset.selectedAlumnoIds=Array.from(u).join(`,`),p(),d()})}),p(),d()};o?.addEventListener(`change`,()=>{let t=f();o.checked?t.forEach(e=>u.add(e.id)):t.forEach(e=>u.delete(e.id)),e.dataset.selectedAlumnoIds=Array.from(u).join(`,`),m()}),i?.addEventListener(`input`,m),m()},onSave:async t=>{let i=(t.dataset.selectedAlumnoIds||``).split(`,`).map(e=>e.trim()).filter(Boolean),a={fecha:t.querySelector(`#modal-fecha`).value,actividad:t.querySelector(`#modal-clase_id`).value,clase_id:null,hora_inicio:t.querySelector(`#modal-hora_inicio`).value,hora_fin:t.querySelector(`#modal-hora_fin`).value,tema_principal:t.querySelector(`#modal-tema`).value.trim(),contenido:t.querySelector(`#modal-contenido`).value.trim(),motivo:t.querySelector(`#modal-motivo`).value.trim(),es_codocencia:t.querySelector(`#modal-es_co-docencia`).checked,maestro_auxiliar_id:t.querySelector(`#modal-maestro_auxiliar_id`)?.value||null,estado:`pendiente`,maestro_id:r,asistencia:i.map(e=>({alumno_id:e,estado:null}))};return!a.fecha||!a.actividad||!a.hora_inicio||!a.hora_fin||!a.tema_principal||!a.motivo?(e.error(`Todos los campos obligatorios deben completarse`),!1):i.length===0?(e.error(`Selecciona al menos un alumno participante`),!1):a.hora_inicio>=a.hora_fin?(e.error(`La hora de inicio debe ser menor que la hora de fin`),!1):(n&&await n(a),!0)}})}function a(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}export{i as t};