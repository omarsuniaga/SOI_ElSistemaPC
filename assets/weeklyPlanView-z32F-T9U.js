import{i as e}from"./supabase-DtQm9tmr.js";import{t}from"./academicService-Bu6TOmHf.js";import{i as n}from"./portalUtils-CkF82Yyk.js";async function r(i,{alumnoId:a}){i.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let{data:o,error:s}=await e.from(`academic_plans`).select(`*, route_versions(route_id, version_number, routes(name, instrument_id))`).eq(`student_id`,a).eq(`status`,`in_process`).maybeSingle();if(s)throw s;if(!o){i.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-journal-x"></i>
          <p>El alumno no tiene un plan académico activo.</p>
          <button class="btn-apple-primary mt-3" onclick="window.location.hash='#/ruta-plan-builder?id=${a}'">
            Asignar Ruta
          </button>
        </div>
      `;return}let c=await t.getRouteDetail(o.route_versions.route_id),{data:l,error:u}=await e.from(`weekly_plan_entries`).select(`*`).eq(`academic_plan_id`,o.id).order(`start_date`,{ascending:!1});if(u)throw u;i.innerHTML=`
      <div class="pm-asist-header">
        <h2 class="apple-display-md">Planificación Semanal</h2>
        <p class="apple-caption">${n(o.route_versions.routes.name)} - v${o.route_versions.version_number}</p>
      </div>

      <div class="d-flex gap-2 mb-3">
        <button id="btn-new-week" class="btn-apple-primary flex-grow-1">
          <i class="bi bi-plus-lg"></i> Planificar Semana
        </button>
      </div>

      <div id="entries-list" class="mt-4">
        ${l.length===0?`
          <div class="pm-placeholder">
            <p>No hay planificación registrada aún.</p>
          </div>
        `:l.map(e=>`
          <div class="card-apple mb-3 pm-animate-slide-up" style="padding: 1rem;">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="apple-caption" style="font-weight: 600; color: var(--pm-primary);">
                  Semana ${e.week_number}
                </span>
                <h4 style="margin: 0.25rem 0; font-size: 1rem;">${e.focus||`Sin enfoque definido`}</h4>
                <p class="apple-caption" style="margin: 0;">
                  ${new Date(e.start_date).toLocaleDateString()} - ${new Date(e.end_date).toLocaleDateString()}
                </p>
              </div>
              <button class="pm-icon-btn btn-edit-entry" data-id="${e.id}">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
            <div class="mt-2" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${(e.planned_nodes||[]).map(e=>`<span class="badge-apple" style="background: var(--pm-bg-alt); font-size: 0.7rem;">${n(e.title)}</span>`).join(``)}
            </div>
          </div>
        `).join(``)}
      </div>

      <!-- Modal / Overlay para nueva entrada (Simplificado como un div que se muestra) -->
      <div id="planning-modal" class="pm-modal-overlay" style="display: none;">
        <div class="pm-modal-content">
          <h3 class="apple-display-sm mb-3">Planificar Semana</h3>
          
          <div class="mb-3">
            <label class="apple-label">Fechas (Inicio - Fin)</label>
            <div class="d-flex gap-2">
              <input type="date" id="start-date" class="input-apple">
              <input type="date" id="end-date" class="input-apple">
            </div>
          </div>

          <div class="mb-3">
            <label class="apple-label">Foco de trabajo</label>
            <input type="text" id="week-focus" class="input-apple" placeholder="Ej: Postura de mano izquierda">
          </div>

          <div class="mb-3">
            <label class="apple-label">Objetivos (Nodos)</label>
            <div id="nodes-checklist" style="max-height: 200px; overflow-y: auto; background: var(--pm-bg-alt); padding: 0.5rem; border-radius: 8px;">
              ${c.map(e=>`
                <div class="mb-2">
                  <small style="font-weight: 700; color: var(--pm-text-muted); text-transform: uppercase; font-size: 0.65rem;">${n(e.name)}</small>
                  ${e.levels.map(e=>`
                    ${e.nodes.map(e=>`
                      <div class="form-check" style="padding-left: 1.5rem; margin-top: 0.25rem;">
                        <input class="form-check-input node-checkbox" type="checkbox" value="${e.id}" data-title="${n(e.title)}" id="node-${e.id}">
                        <label class="form-check-label" for="node-${e.id}" style="font-size: 0.85rem;">
                          ${n(e.title)}
                        </label>
                      </div>
                    `).join(``)}
                  `).join(``)}
                </div>
              `).join(``)}
            </div>
          </div>

          <div class="d-flex gap-2">
            <button id="btn-cancel-modal" class="btn-apple-secondary flex-grow-1">Cancelar</button>
            <button id="btn-save-planning" class="btn-apple-primary flex-grow-1">Guardar</button>
          </div>
        </div>
      </div>
    `;let d=i.querySelector(`#planning-modal`),f=i.querySelector(`#btn-new-week`),p=i.querySelector(`#btn-cancel-modal`),m=i.querySelector(`#btn-save-planning`);f.addEventListener(`click`,()=>{let e=new Date,t=new Date(e);t.setDate(e.getDate()+(8-e.getDay())%7);let n=new Date(t);n.setDate(t.getDate()+6),i.querySelector(`#start-date`).value=t.toISOString().split(`T`)[0],i.querySelector(`#end-date`).value=n.toISOString().split(`T`)[0],d.style.display=`flex`}),p.addEventListener(`click`,()=>{d.style.display=`none`}),m.addEventListener(`click`,async()=>{let e=i.querySelector(`#start-date`).value,n=i.querySelector(`#end-date`).value,s=i.querySelector(`#week-focus`).value,u=Array.from(i.querySelectorAll(`.node-checkbox:checked`)).map(e=>({node_id:e.value,title:e.dataset.title})),d=[];c.forEach(e=>e.levels.forEach(e=>e.nodes.forEach(e=>{u.some(t=>t.node_id===e.id)&&e.indicators.forEach(t=>{d.push({indicator_id:t.id,description:t.description,node_id:e.id,node_name:e.title,is_critical:e.is_critical})})})));try{m.disabled=!0,m.innerHTML=`<div class="pm-spinner pm-spinner-sm"></div> Guardando...`,await t.createWeeklyEntry(o.id,{week_number:l.length+1,start_date:e,end_date:n,focus:s,planned_nodes:u,planned_indicators:d}),alert(`Planificación guardada`),r(i,{alumnoId:a})}catch(e){alert(`Error: `+e.message),m.disabled=!1,m.textContent=`Guardar`}})}catch(e){i.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error: ${n(e.message)}</p></div>`}}export{r as renderWeeklyPlanView};