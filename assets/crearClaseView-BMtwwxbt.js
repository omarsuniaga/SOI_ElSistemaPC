import{i as e}from"./supabase-KnARm58N.js";import{i as t}from"./maestroAuth-CgmSmLyS.js";import{i as n}from"./portalUtils-C92TBVO0.js";var r=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`,`domingo`];async function i(i){i.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let a=t();if(!a){i.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let{data:t}=await e.from(`system_config`).select(`value`).eq(`key`,`maestros_pueden_crear_clases`).maybeSingle();if(t?.value!==`true`){i.innerHTML=`
        <div class="pm-empty" style="text-align:center;padding:3rem 1rem;">
          <i class="bi bi-lock" style="font-size:3rem;color:var(--pm-text-muted);"></i>
          <p style="margin-top:1rem;"><strong>Crear clases deshabilitado</strong></p>
          <p style="font-size:0.85rem;color:var(--pm-text-muted);">Solo los administradores pueden crear nuevas clases. Contacta al admin si necesitas una nueva clase.</p>
        </div>
      `;return}let{data:o}=await e.from(`instrumentos`).select(`id, nombre`).order(`nombre`),{data:s}=await e.from(`maestros`).select(`id, nombre, email`).neq(`id`,a.id).order(`nombre`);i.innerHTML=`
      <div class="pm-crear-clase">
        <h2 class="pm-title">
          <i class="bi bi-plus-circle"></i> Crear Nueva Clase
        </h2>
        <p class="pm-subtitle">Esta clase será visible para ti y tus alumnos</p>

        <div class="pm-form-section">
          <h3 class="pm-section-title">Información básica</h3>
          
          <div class="pm-form-group">
            <label class="pm-label">Nombre de la clase *</label>
            <input type="text" id="nueva-clase-nombre" class="pm-input" 
              placeholder="Ej: Guitarra Beginners, Piano Intermedio">
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Instrumento *</label>
            <select id="nueva-clase-instrumento" class="pm-input">
              <option value="">Seleccionar instrumento...</option>
              ${(o||[]).map(e=>`<option value="${e.id}">${n(e.nombre)}</option>`).join(``)}
            </select>
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Capacidad máxima de alumnos</label>
            <input type="number" id="nueva-clase-capacidad" class="pm-input" 
              value="10" min="1" max="50">
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Salón / Ubicación</label>
            <input type="text" id="nueva-clase-salon" class="pm-input" 
              placeholder="Ej: Salon 1, Room A">
          </div>
        </div>

        <div class="pm-form-section">
          <h3 class="pm-section-title">Horario</h3>
          
          <div id="nueva-clase-horarios">
            <div class="pm-horario-row" data-index="0">
              <select class="pm-input pm-horario-dia">
                ${r.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
              </select>
              <input type="time" class="pm-input pm-horario-inicio" value="15:30">
              <span>a</span>
              <input type="time" class="pm-input pm-horario-fin" value="17:00">
              <button class="pm-btn-remove" type="button"><i class="bi bi-x"></i></button>
              </div>
          </div>
          
          <button class="pm-btn pm-btn-secondary" id="btn-agregar-horario" style="margin-top:0.5rem;">
            <i class="bi bi-plus"></i> Agregar horario
          </button>
        </div>

        <div class="pm-form-section">
          <h3 class="pm-section-title">Maestro(es)</h3>
          
          <div class="pm-form-group">
            <label class="pm-label">Maestro titular *</label>
            <input type="text" class="pm-input" value="${n(a.nombre_completo||a.nombre||`Tú`)}" disabled>
            <input type="hidden" id="nueva-clase-maestro-titular" value="${a.id}">
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Maestro auxiliar (opcional)</label>
            <select id="nueva-clase-maestro-aux" class="pm-input">
              <option value="">Sin maestro auxiliar</option>
              ${(s||[]).map(e=>`<option value="${e.id}">${n(e.nombre||e.email)}</option>`).join(``)}
            </select>
          </div>
        </div>

        <div class="pm-form-actions">
          <button class="pm-btn" id="btn-cancelar-clase">Cancelar</button>
          <button class="pm-btn pm-btn-primary" id="btn-guardar-clase">Crear Clase</button>
        </div>
      </div>
    `,document.getElementById(`btn-agregar-horario`).onclick=()=>{let e=document.getElementById(`nueva-clase-horarios`),t=e.children.length,n=document.createElement(`div`);n.className=`pm-horario-row`,n.dataset.index=t,n.innerHTML=`
        <select class="pm-input pm-horario-dia">
          ${r.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
        </select>
        <input type="time" class="pm-input pm-horario-inicio" value="15:30">
        <span>a</span>
        <input type="time" class="pm-input pm-horario-fin" value="17:00">
        <button class="pm-btn-remove" type="button"><i class="bi bi-x"></i></button>
      `,n.querySelector(`.pm-btn-remove`).onclick=()=>n.remove(),e.appendChild(n)},document.getElementById(`btn-guardar-clase`).onclick=async()=>{let t=document.getElementById(`nueva-clase-nombre`).value.trim(),n=document.getElementById(`nueva-clase-instrumento`).value,r=parseInt(document.getElementById(`nueva-clase-capacidad`).value)||10,i=document.getElementById(`nueva-clase-salon`).value.trim(),o=document.getElementById(`nueva-clase-maestro-aux`).value;if(!t){alert(`El nombre de la clase es obligatorio`);return}if(!n){alert(`Selecciona un instrumento`);return}let s=document.getElementById(`btn-guardar-clase`);s.disabled=!0,s.textContent=`Creando...`;try{let{data:s,error:c}=await e.from(`clases`).insert({nombre:t,instrumento_id:n,capacidad_maxima:r,salon:i,maestro_principal_id:a.id,maestro_suplente_id:o||null,activo:!0}).select().single();if(c)throw c;let l=document.querySelectorAll(`.pm-horario-row`),u=[];for(let e of l){let t=e.querySelector(`.pm-horario-dia`).value,n=e.querySelector(`.pm-horario-inicio`).value,r=e.querySelector(`.pm-horario-fin`).value;t&&n&&r&&u.push({clase_id:s.id,dia:t,hora_inicio:n,hora_fin:r})}if(u.length>0){let{error:t}=await e.from(`clase_horarios`).insert(u);if(t)throw t}alert(`¡Clase creada exitosamente!`),window.location.hash=`#/fechas`}catch(e){console.error(e),alert(`Error al crear la clase: `+e.message),s.disabled=!1,s.textContent=`Crear Clase`}},document.getElementById(`btn-cancelar-clase`).onclick=()=>{window.history.back()}}catch(e){i.innerHTML=`
      <div class="pm-empty" style="color:var(--pm-danger)">
        Error: ${n(e.message)}
      </div>
    `}}export{i as renderCrearClaseView};