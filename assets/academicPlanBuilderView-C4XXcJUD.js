import{i as e}from"./supabase--PHJV0L9.js";import{t}from"./academicService-BPPis8H2.js";import{i as n}from"./portalUtils-CkF82Yyk.js";async function r(r,{alumnoId:i}){r.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let a=await t.getStudent(i),o=await t.fetchRoutes();r.innerHTML=`
      <div class="pm-asist-header">
        <h2 class="apple-display-md">Asignar Ruta</h2>
        <p class="apple-caption">Configura el plan académico para <strong>${n(a.name)} ${n(a.last_name||``)}</strong></p>
      </div>

      <div class="card-apple pm-animate-slide-up" style="margin-top: 1.5rem; padding: 1.5rem;">
        <div class="mb-4">
          <label class="apple-label" style="display: block; margin-bottom: 0.5rem;">Seleccionar Ruta</label>
          <select id="route-selector" class="input-apple">
            <option value="" disabled selected>Elegí una ruta...</option>
            ${o.map(e=>`<option value="${e.id}">${n(e.name)} (${n(e.instrument||`General`)})</option>`).join(``)}
          </select>
        </div>

        <div id="level-selection-container" style="display: none;" class="pm-animate-fade-in">
          <div class="mb-4">
            <label class="apple-label" style="display: block; margin-bottom: 0.5rem;">Nivel Inicial</label>
            <select id="level-selector" class="input-apple">
              <option value="" disabled selected>Cargando niveles...</option>
            </select>
          </div>

          <div id="plan-summary" class="pm-placeholder" style="padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; background: var(--pm-bg-alt);">
            <p class="apple-caption" style="margin: 0;">Seleccioná una ruta y nivel para ver el resumen del plan.</p>
          </div>

          <button id="btn-create-plan" class="btn-apple-primary w-100" disabled>
            Comenzar Plan Académico
          </button>
        </div>
      </div>

      <button class="btn-apple-secondary w-100 mt-3" onclick="window.history.back()">
        Cancelar
      </button>
    `;let s=r.querySelector(`#route-selector`),c=r.querySelector(`#level-selection-container`),l=r.querySelector(`#level-selector`),u=r.querySelector(`#btn-create-plan`),d=r.querySelector(`#plan-summary`),f=null,p=null,m=null;s.addEventListener(`change`,async e=>{f=e.target.value,c.style.display=`block`,l.innerHTML=`<option value="" disabled selected>Cargando niveles...</option>`,u.disabled=!0;try{p=await t.getPublishedVersionId(f),m=await t.getRouteDetail(f,p);let e=[];m.forEach(t=>{t.levels.forEach(n=>{e.push({id:n.id,name:n.name,blockName:t.name})})}),l.innerHTML=`
          <option value="" disabled selected>Seleccioná nivel inicial...</option>
          ${e.map(e=>`<option value="${e.id}">${n(e.blockName)} - ${n(e.name)}</option>`).join(``)}
        `}catch(e){console.error(`Error loading route detail:`,e),l.innerHTML=`<option value="" disabled>Error al cargar niveles</option>`}}),l.addEventListener(`change`,()=>{u.disabled=!1;let e=l.value,t=null;m.forEach(n=>{let r=n.levels.find(t=>t.id===e);r&&(t={...r,blockName:n.name})}),t&&(d.innerHTML=`
          <div style="text-align: left;">
            <p class="apple-caption" style="margin-bottom: 0.25rem; font-weight: 600; color: var(--pm-primary);">Resumen del Nivel:</p>
            <h4 style="margin: 0; font-size: 1rem;">${n(t.blockName)} - ${n(t.name)}</h4>
            <p class="apple-caption" style="margin-top: 0.25rem;">
              Contiene ${t.nodes?.length||0} competencias y 
              ${t.nodes?.reduce((e,t)=>e+(t.indicators?.length||0),0)} indicadores medibles.
            </p>
          </div>
        `)}),u.addEventListener(`click`,async()=>{u.disabled=!0,u.innerHTML=`<div class="pm-spinner pm-spinner-sm"></div> Creando...`;try{await t.createAcademicPlan(i,p),await e.from(`student_level_progress`).upsert({student_id:i,level_id:l.value,status:`in_process`}),alert(`Plan académico creado con éxito`),window.location.hash=`#/alumno?id=${i}`}catch(e){console.error(`Error creating plan:`,e),alert(`Error al crear el plan: `+e.message),u.disabled=!1,u.textContent=`Comenzar Plan Académico`}})}catch(e){r.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error: ${n(e.message)}</p></div>`}}export{r as renderAcademicPlanBuilderView};