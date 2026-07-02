import{i as e}from"./supabase-KnARm58N.js";import{i as t}from"./maestroAuth-CgmSmLyS.js";import{i as n,n as r,o as i,r as a}from"./maestroDataService-9gztUGVK.js";import{t as o}from"./AppToast-3qbHkRVc.js";import{i as s,n as c,t as l}from"./portalUtils-C92TBVO0.js";import{t as u}from"./claseEmergenteModal-Dknu0Ytj.js";var d=[`domingo`,`lunes`,`martes`,`miercoles`,`jueves`,`viernes`,`sabado`];async function f(t,n){let r=[],i=0,[a,o,s]=t.fecha.split(`-`).map(Number),c=d[new Date(a,o-1,s).getDay()],{data:l,error:u}=await e.from(`clases`).select(`id, nombre`).or(`maestro_principal_id.eq.${n},maestro_suplente_id.eq.${n},maestro_id.eq.${n}`);if(u||!l?.length)return{justificadas:0,errores:[]};let f=l.map(e=>e.id),{data:p,error:m}=await e.from(`clase_horarios`).select(`clase_id, hora_inicio, hora_fin`).in(`clase_id`,f).eq(`dia`,c);if(m||!p?.length)return{justificadas:0,errores:[]};let h=p.map(e=>({...e,nombre:l.find(t=>t.id===e.clase_id)?.nombre||``}));for(let a of h)try{let{data:o}=await e.from(`alumnos_clases`).select(`alumno_id`).eq(`clase_id`,a.clase_id).eq(`activo`,!0),s=(o||[]).map(e=>({alumno_id:e.alumno_id,estado:`justificado`})),c=`Clase suspendida por actividad especial: "${t.actividad||`Actividad especial`}".`+(t.motivo?` Motivo: ${t.motivo}.`:``)+` Todos los alumnos quedan justificados.`,{error:l}=await e.from(`sesiones_clase`).upsert({clase_id:a.clase_id,fecha:t.fecha,maestro_id:n,emergente_id:t.id,hora_inicio:a.hora_inicio,hora_fin:a.hora_fin,estado:`registrada`,borrador:!1,asistencia:s,contenido:c},{onConflict:`clase_id,fecha,maestro_id`});l?r.push(`${a.nombre}: ${l.message}`):i++}catch(e){r.push(`${a.nombre}: ${e.message}`)}return{justificadas:i,errores:r}}var p=[`Do`,`Lu`,`Ma`,`Mi`,`Ju`,`Vi`,`Sa`],m=7;async function h(e,{onFechaClick:n}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let r=t();if(!r){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let i=new Date,a=i.getFullYear(),o=i.getMonth();async function c(){try{let t=await g(r.id,a,o);_(e,a,o,i,t,{onFechaClick:e=>{v(e),n?.(e)},onPrev:()=>{o===0?(a--,o=11):o--,c()},onNext:()=>{o===11?(a++,o=0):o++,c()}})}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar calendario: ${s(t.message)}</p>`}}await c()}async function g(e,t,a){let o=new Date(t,a,1),s=new Date(t,a+1,0),c=o.toISOString().split(`T`)[0],u=s.toISOString().split(`T`)[0],d=(await n()).map(e=>e.id);if(d.length===0)return new Map;let f=await r(d),p=new Set(f.map(e=>e.dia?.toLowerCase())),h=new Map;f.forEach(e=>{let t=e.dia?.toLowerCase(),n=e.hora_fin||`23:59`;(t&&!h.has(t)||n>h.get(t))&&h.set(t,n)});let g=await i(e,c,u),_=g.filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return e.estado===`registrada`||e.estado===`cerrada`||t||e.borrador===!1&&n}),v=new Set(_.map(e=>e.fecha)),y=new Set(g.filter(e=>e.clase_id&&e.emergente_id).map(e=>e.fecha)),b=new Map;g.filter(e=>!e.clase_id).forEach(e=>{b.has(e.fecha)||b.set(e.fecha,[]),b.get(e.fecha).push(e)});let x=new Map,S=new Date;S.setHours(0,0,0,0);for(let e=new Date(o);e<=s;e.setDate(e.getDate()+1)){let t=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=l[e.getDay()],r=p.has(n),i=b.get(t)||[];if(!r&&i.length===0){x.set(t,`sin-clase`);continue}let a=new Date(e),o=Math.floor((S-a)/864e5);if(o===0){let e=g.find(e=>e.fecha===t);if(e&&Array.isArray(e.asistencia)&&e.asistencia.length>0){x.set(t,`registrada`);continue}if(y.has(t)){x.set(t,`cubierta-emergente`);continue}let r=h.get(n);if(r){let e=new Date,[n,i]=r.split(`:`),a=parseInt(n)*60*60*1e3+parseInt(i||0)*60*1e3;if(e.getHours()*60*60*1e3+e.getMinutes()*60*1e3<a){x.set(t,`sin-clase`);continue}}x.set(t,`pendiente`);continue}if(o>0&&y.has(t)){x.set(t,`cubierta-emergente`);continue}if(o>0&&v.has(t)){x.set(t,`registrada`);continue}o<0?x.set(t,`sin-clase`):o<=m?x.set(t,`pendiente`):x.set(t,`vencida`)}return x}function _(e,t,n,r,i,{onFechaClick:a,onPrev:o,onNext:s}){let l=new Date(t,n,1),u=new Date(t,n+1,0),d=l.getDay(),f=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,`0`)}-${String(r.getDate()).padStart(2,`0`)}`,m=u.getDate(),h=`${t}-${String(n+1).padStart(2,`0`)}-01`,g=`${t}-${String(n+1).padStart(2,`0`)}-${String(m).padStart(2,`0`)}`,_=f>=h&&f<=g?f:h,v=p.map(e=>`<div class="pm-cal-day-header">${e}</div>`).join(``);for(let e=0;e<d;e++)v+=`<div class="pm-cal-day otro-mes"></div>`;for(let e=1;e<=m;e++){let r=`${t}-${String(n+1).padStart(2,`0`)}-${String(e).padStart(2,`0`)}`,a=i.get(r)||`sin-clase`,o=r===f?`today`:``,s=r===_,l=`${e} de ${c[n]} ${t}`;v+=`
      <div class="pm-cal-day estado-${a} ${o}" data-fecha="${r}" title="${r}" role="gridcell" tabindex="${s?`0`:`-1`}" aria-label="${l}" aria-selected="false"${r===f?` aria-current="date"`:``}>
        ${e}
      </div>
    `}e.innerHTML=`
    <div class="pm-calendar-wrapper">
      <div class="pm-calendar-container">
        <div class="pm-cal-header">
        <button id="pm-cal-prev" class="pm-cal-nav-btn">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h2 class="pm-month-title">
          ${c[n]} ${t}
        </h2>
        <button id="pm-cal-next" class="pm-cal-nav-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div class="pm-cal-grid-container">
        <div class="pm-cal-grid" role="grid" aria-label="Calendario ${c[n]} ${t}">
          ${v}
        </div>
      </div>

      <div class="pm-cal-legend">
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-success)"></div> Registrada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:#0891b2"></div> Cubierta por actividad especial
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-warning)"></div> Pendiente
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-danger)"></div> Sin registro >7 días
        </div>
</div>
      </div>
    </div>
  `,e.querySelector(`#pm-cal-prev`).addEventListener(`click`,o),e.querySelector(`#pm-cal-next`).addEventListener(`click`,s),e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(e=>e.setAttribute(`aria-selected`,`false`)),t.setAttribute(`aria-selected`,`true`),a?.(t.dataset.fecha)})});let y=e.querySelector(`.pm-cal-grid`);y&&y.addEventListener(`keydown`,function(e){let t=[...y.querySelectorAll(`.pm-cal-day[data-fecha]`)];if(t.length===0)return;let n=y.querySelector(`[tabindex="0"]`),r=n?t.indexOf(n):-1,i=e=>{e<0||e>=t.length||(t.forEach(e=>e.setAttribute(`tabindex`,`-1`)),t[e].setAttribute(`tabindex`,`0`),t[e].focus())};switch(e.key){case`ArrowLeft`:e.preventDefault(),r>0&&i(r-1);break;case`ArrowRight`:e.preventDefault(),r<t.length-1&&i(r+1);break;case`ArrowUp`:e.preventDefault(),i(Math.max(0,r-7));break;case`ArrowDown`:e.preventDefault(),i(Math.min(t.length-1,r+7));break;case`Home`:e.preventDefault(),i(Math.floor(Math.max(r,0)/7)*7);break;case`End`:e.preventDefault(),i(Math.min(t.length-1,Math.floor(Math.max(r,0)/7)*7+6));break;case`PageUp`:e.preventDefault(),typeof o==`function`&&o();break;case`PageDown`:e.preventDefault(),typeof s==`function`&&s();break;case`Enter`:case` `:e.preventDefault(),n&&n.click();break}})}async function v(n){let r=t();if(!r)return;let i=new Date,a=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,`0`)}-${String(i.getDate()).padStart(2,`0`)}`,o=document.getElementById(`pm-action-drawer`);o||(o=document.createElement(`div`),o.id=`pm-action-drawer`,o.className=`pm-drawer-overlay`,document.body.appendChild(o));let c=n===a,l=n<a,u=[],d=[],f=[],p=[];try{let{data:t}=await e.from(`clases_emergentes`).select(`*`).eq(`maestro_id`,r.id).eq(`fecha`,n).order(`hora_inicio`,{ascending:!0,nullsFirst:!1}),{data:i}=await e.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,r.id).eq(`fecha`,n);u=i||[],p=u.filter(e=>e.clase_id&&e.emergente_id);let{data:a}=await e.from(`clases`).select(`id, nombre, instrumento`).or(`maestro_principal_id.eq.${r.id},maestro_suplente_id.eq.${r.id},maestro_id.eq.${r.id}`);d=a||[];let o=d.map(e=>e.id);if(o.length>0){let{data:t}=await e.from(`clase_horarios`).select(`clase_id, hora_inicio, hora_fin, dia`).in(`clase_id`,o);f=t||[]}}catch(e){console.error(`Error fetching drawer data:`,e)}let[m,h,g]=n.split(`-`).map(Number),_=new Date(m,h-1,g),v=_.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),b=d.filter(e=>f.some(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===v)).map(e=>{let t=f.find(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===v),n=u.find(t=>t.clase_id===e.id);return{...e,hora_inicio:t?.hora_inicio,hora_fin:t?.hora_fin,sesion:n}}).sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)),x=u.filter(e=>!e.clase_id).sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)),S=``;x.length>0?S=x.map(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=e.estado===`registrada`||e.estado===`cerrada`||t;return`
        <div class="pm-drawer-clase-item" style="border-left: 3px solid var(--pm-warning);">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(e.hora_inicio||`--:--`).slice(0,5)} - ${(e.hora_fin||`--:--`).slice(0,5)}</span>
            <span class="pm-drawer-clase-nombre">${s(e.actividad||`Clase Emergente`)}</span>
            <span class="pm-drawer-clase-instrumento" style="color:var(--pm-warning);">
              <i class="bi bi-lightning-charge-fill"></i> Actividad especial
            </span>
          </div>
          <div class="pm-drawer-clase-actions">
            <button class="pm-btn btn-ver-sesion-emergente"
              data-sesion="${e.id}"
              style="background:var(--pm-${n?`success`:`primary`}); border-color:var(--pm-${n?`success`:`primary`});">
              <i class="bi bi-${n?`eye`:`person-check`}"></i>
              ${n?`Ver asistencia`:`Pasar asistencia`}
            </button>
          </div>
          <div class="pm-clase-status ${n?`completed`:``}" style="margin-left: auto;">
            ${n?`<i class="bi bi-check-circle-fill" style="color:var(--pm-success)"></i>`:``}
          </div>
        </div>
      `}).join(``):b.length>0&&(S=b.map(e=>{let t=e.sesion&&(()=>{let t=Array.isArray(e.sesion.asistencia)&&e.sesion.asistencia.length>0,n=typeof e.sesion.contenido==`string`&&e.sesion.contenido.trim().length>0;return e.sesion.estado===`registrada`||e.sesion.estado===`cerrada`||t||e.sesion.borrador===!1&&n})(),n=e.sesion&&!t&&(e.sesion.estado===`pendiente`||e.sesion.borrador===!0);return`
        <div class="pm-drawer-clase-item">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(e.hora_inicio||`--:--`).slice(0,5)} - ${(e.hora_fin||`--:--`).slice(0,5)}</span>
            <span class="pm-drawer-clase-nombre">${s(e.nombre)}</span>
            <span class="pm-drawer-clase-instrumento">${s(e.instrumento||``)}</span>
          </div>

          <div class="pm-drawer-clase-actions">
            ${t?``:`
              <button class="pm-btn pm-btn-primary btn-pasar-asistencia" data-clase="${e.id}">
                <i class="bi bi-person-check"></i> Pasar asistencia
              </button>
            `}
            ${t?`
              <button class="pm-btn btn-ver-sesion" data-clase="${e.id}" style="background:var(--pm-success); border-color:var(--pm-success);">
                <i class="bi bi-eye"></i> Ver
              </button>
            `:``}
            ${n?`
              <button class="pm-btn btn-continuar-sesion" data-clase="${e.id}">
                <i class="bi bi-pencil"></i> Continuar
              </button>
            `:``}
          </div>

          <div class="pm-clase-status ${t?`completed`:n?`pending`:``}" style="margin-left: auto;">
             ${t?`<i class="bi bi-check-circle-fill" style="color:var(--pm-success)"></i>`:n?`<i class="bi bi-pencil-fill" style="color:var(--pm-warning)"></i>`:``}
          </div>
        </div>
      `}).join(``));let C=``;if(p.length>0&&(C=`
      <div style="margin-top:0.75rem;">
        <p style="font-size:0.7rem; font-weight:600; color:#0891b2; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.5rem;">
          <i class="bi bi-slash-circle"></i> Clases suspendidas
        </p>
        ${p.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)).map(e=>{let t=d.find(t=>t.id===e.clase_id);return`
            <div class="pm-drawer-clase-item" style="border-left:3px solid #0891b2; opacity:0.85;">
              <div class="pm-drawer-clase-info">
                <span class="pm-drawer-clase-hora">${(e.hora_inicio||`--:--`).slice(0,5)} - ${(e.hora_fin||`--:--`).slice(0,5)}</span>
                <span class="pm-drawer-clase-nombre">${s(t?.nombre||`Clase`)}</span>
                <span class="pm-drawer-clase-instrumento" style="color:#0891b2;">
                  <i class="bi bi-check-circle-fill"></i> Justificada · Auto-registrada
                </span>
              </div>
              <div class="pm-drawer-clase-actions">
                <button class="pm-btn btn-ver-clase-suspendida" data-clase="${e.clase_id}"
                  style="background:#0891b2; border-color:#0891b2; color:white;">
                  <i class="bi bi-eye"></i> Ver
                </button>
              </div>
            </div>
          `}).join(``)}
      </div>
    `),o.innerHTML=`
    <div class="pm-drawer-content">
      <div class="pm-drawer-header">
        <div style="flex:1">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700;">${_.toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`})}</h3>
          <p style="margin:0.25rem 0 0; font-size:0.85rem; color:var(--pm-text-muted);">
            ${x.length>0?`<span style="color:var(--pm-warning);"><i class="bi bi-lightning-charge-fill"></i> ${x.length} actividad(es) especial(es)</span>`:b.length>0?`${b.length} clase(s) programada(s)`:`Sin clases programadas`}
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="pm-btn-sm" id="pm-drawer-emergente" style="background:var(--pm-primary); color:white; border:none; font-size:0.7rem; padding: 6px 10px; border-radius: 20px;">
            <i class="bi bi-lightning-charge"></i> Crear Clase Emergente
          </button>
          <button class="pm-drawer-close" id="pm-drawer-close-btn">&times;</button>
        </div>
      </div>
      <div class="pm-drawer-body">
        ${S||`<p style="text-align:center;color:var(--pm-text-muted);padding:2rem 1rem;">No hay clases programadas para esta fecha</p>`}
        ${C}
        ${!l&&!c?`
          <button class="pm-btn pm-btn-secondary" style="margin-top:0.5rem; width:100%;">
            <i class="bi bi-plus-circle"></i> Agregar Clase a Horario
          </button>
        `:``}
      </div>
    </div>
  `,!document.getElementById(`pm-drawer-styles`)){let e=document.createElement(`style`);e.id=`pm-drawer-styles`,e.textContent=`
      .pm-drawer-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); display: none; z-index: 1001; align-items: flex-end;
      }
      .pm-drawer-overlay.open { display: flex; }
      .pm-drawer-content {
        background: var(--pm-surface); width: 100%; border-radius: 1.5rem 1.5rem 0 0;
        padding-bottom: 2rem; transform: translateY(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-height: 80vh; overflow-y: auto;
      }
      .pm-drawer-overlay.open .pm-drawer-content { transform: translateY(0); }
      .pm-drawer-header { padding: 1.25rem 1.25rem 0.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
      .pm-drawer-close { background: none; border: none; font-size: 1.8rem; color: var(--pm-text-muted); cursor: pointer; }
      .pm-drawer-clase-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.75rem; background: var(--pm-surface-2); border-radius: var(--pm-radius-sm); margin-bottom: 0.5rem;
      }
      .pm-drawer-clase-info { display: flex; flex-direction: column; }
      .pm-drawer-clase-hora { font-size: 0.75rem; color: var(--pm-primary); font-weight: 600; }
      .pm-drawer-clase-nombre { font-size: 0.95rem; font-weight: 600; }
      .pm-drawer-clase-instrumento { font-size: 0.75rem; color: var(--pm-text-muted); }
      .pm-drawer-clase-actions { display: flex; gap: 0.5rem; }
    `,document.head.appendChild(e)}let w=()=>o.classList.remove(`open`),T=o.querySelector(`#pm-drawer-close-btn`);T&&(T.onclick=w),o.addEventListener(`click`,e=>{e.target===o&&w()}),o.querySelectorAll(`.btn-pasar-asistencia, .btn-ver-sesion, .btn-continuar-sesion`).forEach(e=>{e&&e.addEventListener(`click`,()=>{let t=e.dataset.clase;w(),window.location.hash=`#/asistencia?clase=${t}&fecha=${n}`})}),o.querySelectorAll(`.btn-ver-sesion-emergente`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sesion;w(),window.location.hash=`#/asistencia?sesion=${t}&fecha=${n}`})}),o.querySelectorAll(`.btn-ver-clase-suspendida`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.clase;w(),window.location.hash=`#/asistencia?clase=${t}&fecha=${n}`})});let E=o.querySelector(`#pm-drawer-emergente`);E&&E.addEventListener(`click`,()=>{y(n,d)}),setTimeout(()=>o.classList.add(`open`),10)}async function y(n,r){let i=[];try{let e=await a(r.map(e=>e.id)),t={};e.forEach(e=>{if(!e.alumnos)return;t[e.alumno_id]||(t[e.alumno_id]=[]);let n=r.find(t=>t.id===e.clase_id);n&&t[e.alumno_id].push(n.nombre)});let n=new Set;i=e.map(e=>e.alumnos).filter(Boolean).filter(e=>n.has(e.id)?!1:(n.add(e.id),!0)).map(e=>({...e,clase_nombres:t[e.id]||[]}))}catch(e){console.warn(`[calendario] No se pudieron cargar alumnos para clase emergente:`,e)}u({fecha:n,clases:r,alumnos:i,maestroId:t().id,onSave:async n=>{try{let{data:r,error:i}=await e.from(`sesiones_clase`).insert([n]).select().single();if(i)throw i;let a=await f(r,t().id);a.errores.length>0?(console.warn(`[calendario] Auto-justificación parcial:`,a.errores),o.warning(`Clase emergente creada. ${a.justificadas} clase(s) justificada(s) automáticamente (${a.errores.length} con error).`)):a.justificadas>0?o.success(`Clase emergente creada. ${a.justificadas} clase(s) programada(s) marcada(s) como justificadas.`):o.success(`Clase emergente creada. Procedé a pasar asistencia.`);let s=document.getElementById(`pm-action-drawer`);s&&s.classList.remove(`open`),window.location.hash=`#/asistencia?sesion=${r.id}&fecha=${n.fecha}`}catch(e){console.error(`Error creando clase emergente:`,e),o.error(`No se pudo crear la clase emergente`)}}})}export{h as renderCalendarioView};