import{t as e}from"./AppToast-BfaQtGFE.js";import{i as t,n,o as r,r as i}from"./pwaInstaller-BEgVc-OU.js";import{i as a}from"./supabase-Cgh_dhNB.js";import{i as o}from"./maestroAuth-DOk-16l6.js";import{i as s,n as c,t as l}from"./portalUtils-CkF82Yyk.js";import{t as u}from"./claseEmergenteModal-D-MYHqWO.js";var d=[`domingo`,`lunes`,`martes`,`miercoles`,`jueves`,`viernes`,`sabado`];async function f(e,t){let n=[],r=0,[i,o,s]=e.fecha.split(`-`).map(Number),c=d[new Date(i,o-1,s).getDay()],{data:l,error:u}=await a.from(`clases`).select(`id, nombre`).or(`maestro_principal_id.eq.${t},maestro_suplente_id.eq.${t},maestro_id.eq.${t}`);if(u||!l?.length)return{justificadas:0,errores:[]};let f=l.map(e=>e.id),{data:p,error:m}=await a.from(`clase_horarios`).select(`clase_id, hora_inicio, hora_fin`).in(`clase_id`,f).eq(`dia`,c);if(m||!p?.length)return{justificadas:0,errores:[]};let h=p.map(e=>({...e,nombre:l.find(t=>t.id===e.clase_id)?.nombre||``}));for(let i of h)try{let{data:o}=await a.from(`alumnos_clases`).select(`alumno_id`).eq(`clase_id`,i.clase_id).eq(`activo`,!0),s=(o||[]).map(e=>({alumno_id:e.alumno_id,estado:`justificado`})),c=`Clase suspendida por actividad especial: "${e.actividad||`Actividad especial`}".`+(e.motivo?` Motivo: ${e.motivo}.`:``)+` Todos los alumnos quedan justificados.`,{error:l}=await a.from(`sesiones_clase`).upsert({clase_id:i.clase_id,fecha:e.fecha,maestro_id:t,emergente_id:e.id,hora_inicio:i.hora_inicio,hora_fin:i.hora_fin,estado:`registrada`,borrador:!1,asistencia:s,contenido:c},{onConflict:`clase_id,fecha,maestro_id`});l?n.push(`${i.nombre}: ${l.message}`):r++}catch(e){n.push(`${i.nombre}: ${e.message}`)}return{justificadas:r,errores:n}}var p=[`Do`,`Lu`,`Ma`,`Mi`,`Ju`,`Vi`,`Sa`],m=7;async function h(e,{onFechaClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let n=o();if(!n){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let r=new Date,i=r.getFullYear(),a=r.getMonth();async function c(){try{let{estadoMap:o,dotsMap:s}=await g(n.id,i,a);v(e,i,a,r,o,s,{onFechaClick:e=>{y(e),t?.(e)},onPrev:()=>{a===0?(i--,a=11):a--,c()},onNext:()=>{a===11?(i++,a=0):a++,c()}})}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar calendario: ${s(t.message)}</p>`}}await c()}async function g(e,i,a){let o=new Date(i,a,1),s=new Date(i,a+1,0),c=o.toISOString().split(`T`)[0],u=s.toISOString().split(`T`)[0],d=(await t()).map(e=>e.id);if(d.length===0)return new Map;let f=await n(d),p=new Set(f.map(e=>e.dia?.toLowerCase())),h=new Map;f.forEach(e=>{let t=e.dia?.toLowerCase(),n=e.hora_fin||`23:59`;(t&&!h.has(t)||n>h.get(t))&&h.set(t,n)});let g=await r(e,c,u),v=e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return e.estado===`registrada`||e.estado===`cerrada`||t||e.borrador===!1&&n},y=g.filter(v),b=new Set(y.map(e=>e.fecha)),x=new Set(g.filter(e=>e.clase_id&&e.emergente_id).map(e=>e.fecha)),S=new Map;g.filter(e=>!e.clase_id).forEach(e=>{S.has(e.fecha)||S.set(e.fecha,[]),S.get(e.fecha).push(e)});let C=new Map,w=new Map;f.forEach(e=>{let t=e.dia?.toLowerCase();if(!t||!e.clase_id)return;C.has(t)||C.set(t,new Set),C.get(t).add(e.clase_id);let n=`${t}|${e.clase_id}`,r=e.hora_fin||`23:59`;(!w.has(n)||r>w.get(n))&&w.set(n,r)});let T=new Map;g.filter(e=>e.clase_id).forEach(e=>{let t=`${e.fecha}|${e.clase_id}`,n=T.get(t);(!n||!v(n)&&v(e))&&T.set(t,e)});let E=new Map,D=new Map,O=new Date;O.setHours(0,0,0,0);for(let e=new Date(o);e<=s;e.setDate(e.getDate()+1)){let t=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=l[e.getDay()],r=p.has(n),i=S.get(t)||[],a=new Date(e),o=Math.floor((O-a)/864e5),s=[];if((C.get(n)||new Set).forEach(e=>{let r=T.get(`${t}|${e}`);if(o===0){let t=r&&Array.isArray(r.asistencia)&&r.asistencia.length>0;r&&(r.emergente_id||t)?s.push(`verde`):r?s.push(`amarillo`):_(w.get(`${n}|${e}`))?s.push(`rojo`):s.push(`gris`);return}r&&(r.emergente_id||v(r))?s.push(`verde`):r?s.push(`amarillo`):o<0?s.push(`gris`):s.push(`rojo`)}),i.forEach(e=>{s.push(v(e)?`verde`:`amarillo`)}),D.set(t,s),!r&&i.length===0){E.set(t,`sin-clase`);continue}if(o===0){let e=g.find(e=>e.fecha===t);if(e&&Array.isArray(e.asistencia)&&e.asistencia.length>0){E.set(t,`registrada`);continue}if(x.has(t)){E.set(t,`cubierta-emergente`);continue}let r=h.get(n);if(r){let e=new Date,[n,i]=r.split(`:`),a=parseInt(n)*60*60*1e3+parseInt(i||0)*60*1e3;if(e.getHours()*60*60*1e3+e.getMinutes()*60*1e3<a){E.set(t,`sin-clase`);continue}}E.set(t,`pendiente`);continue}if(o>0&&x.has(t)){E.set(t,`cubierta-emergente`);continue}if(o>0&&b.has(t)){E.set(t,`registrada`);continue}o<0?E.set(t,`sin-clase`):o<=m?E.set(t,`pendiente`):E.set(t,`vencida`)}return{estadoMap:E,dotsMap:D}}function _(e){let t=(e||`23:59`).slice(0,5),n=new Date;return`${String(n.getHours()).padStart(2,`0`)}:${String(n.getMinutes()).padStart(2,`0`)}`>=t}function v(e,t,n,r,i,a,{onFechaClick:o,onPrev:s,onNext:l}){let u=new Date(t,n,1),d=new Date(t,n+1,0),f=u.getDay(),m=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,`0`)}-${String(r.getDate()).padStart(2,`0`)}`,h=d.getDate(),g=`${t}-${String(n+1).padStart(2,`0`)}-01`,_=`${t}-${String(n+1).padStart(2,`0`)}-${String(h).padStart(2,`0`)}`,v=m>=g&&m<=_?m:g,y=p.map(e=>`<div class="pm-cal-day-header">${e}</div>`).join(``);for(let e=0;e<f;e++)y+=`<div class="pm-cal-day otro-mes"></div>`;for(let e=1;e<=h;e++){let r=`${t}-${String(n+1).padStart(2,`0`)}-${String(e).padStart(2,`0`)}`,o=i.get(r)||`sin-clase`,s=a?.get(r)||[],l=s.includes(`rojo`)||s.includes(`amarillo`),u=s.length?`<div class="pm-day-dots">${s.map(e=>`<span class="pm-day-dot pm-dot-${e}"></span>`).join(``)}</div>`:``,d=r===m?`today`:``,f=r===v,p=`${e} de ${c[n]} ${t}${s.length?`, ${s.length} clase(s)`:``}`;y+=`
      <div class="pm-cal-day estado-${o}${l?` dia-alerta`:``} ${d}" data-fecha="${r}" title="${r}" role="gridcell" tabindex="${f?`0`:`-1`}" aria-label="${p}" aria-selected="false"${r===m?` aria-current="date"`:``}>
        <span class="pm-cal-day-num">${e}</span>
        ${u}
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
          ${y}
        </div>
      </div>

      <div class="pm-cal-legend">
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-success)"></div> Clase registrada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-warning)"></div> Borrador
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-danger)"></div> Sin registrar
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-text-muted);opacity:.5"></div> Programada
        </div>
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-warning-bg);border:1px solid var(--pm-warning);border-radius:3px"></div> Día con registro pendiente
        </div>
</div>
      </div>
    </div>
  `,e.querySelector(`#pm-cal-prev`).addEventListener(`click`,s),e.querySelector(`#pm-cal-next`).addEventListener(`click`,l),e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(e=>e.setAttribute(`aria-selected`,`false`)),t.setAttribute(`aria-selected`,`true`),o?.(t.dataset.fecha)})});let b=e.querySelector(`.pm-cal-grid`);b&&b.addEventListener(`keydown`,function(e){let t=[...b.querySelectorAll(`.pm-cal-day[data-fecha]`)];if(t.length===0)return;let n=b.querySelector(`[tabindex="0"]`),r=n?t.indexOf(n):-1,i=e=>{e<0||e>=t.length||(t.forEach(e=>e.setAttribute(`tabindex`,`-1`)),t[e].setAttribute(`tabindex`,`0`),t[e].focus())};switch(e.key){case`ArrowLeft`:e.preventDefault(),r>0&&i(r-1);break;case`ArrowRight`:e.preventDefault(),r<t.length-1&&i(r+1);break;case`ArrowUp`:e.preventDefault(),i(Math.max(0,r-7));break;case`ArrowDown`:e.preventDefault(),i(Math.min(t.length-1,r+7));break;case`Home`:e.preventDefault(),i(Math.floor(Math.max(r,0)/7)*7);break;case`End`:e.preventDefault(),i(Math.min(t.length-1,Math.floor(Math.max(r,0)/7)*7+6));break;case`PageUp`:e.preventDefault(),typeof s==`function`&&s();break;case`PageDown`:e.preventDefault(),typeof l==`function`&&l();break;case`Enter`:case` `:e.preventDefault(),n&&n.click();break}})}async function y(e){let t=o();if(!t)return;let n=new Date,r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}-${String(n.getDate()).padStart(2,`0`)}`,i=document.getElementById(`pm-action-drawer`);i||(i=document.createElement(`div`),i.id=`pm-action-drawer`,i.className=`pm-drawer-overlay`,document.body.appendChild(i));let c=e===r,l=e<r,u=[],d=[],f=[],p=[];try{let{data:n}=await a.from(`clases_emergentes`).select(`*`).eq(`maestro_id`,t.id).eq(`fecha`,e).order(`hora_inicio`,{ascending:!0,nullsFirst:!1}),{data:r}=await a.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,t.id).eq(`fecha`,e);u=r||[],p=u.filter(e=>e.clase_id&&e.emergente_id);let{data:i}=await a.from(`clases`).select(`id, nombre, instrumento`).or(`maestro_principal_id.eq.${t.id},maestro_suplente_id.eq.${t.id},maestro_id.eq.${t.id}`);d=i||[];let o=d.map(e=>e.id);if(o.length>0){let{data:e}=await a.from(`clase_horarios`).select(`clase_id, hora_inicio, hora_fin, dia`).in(`clase_id`,o);f=e||[]}}catch(e){console.error(`Error fetching drawer data:`,e)}let[m,h,g]=e.split(`-`).map(Number),_=new Date(m,h-1,g),v=_.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),y=d.filter(e=>f.some(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===v)).map(e=>{let t=f.find(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===v),n=u.find(t=>t.clase_id===e.id);return{...e,hora_inicio:t?.hora_inicio,hora_fin:t?.hora_fin,sesion:n}}).sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)),x=u.filter(e=>!e.clase_id).sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)),S=``;x.length>0?S=x.map(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=e.estado===`registrada`||e.estado===`cerrada`||t;return`
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
      `}).join(``):y.length>0&&(S=y.map(e=>{let t=e.sesion&&(()=>{let t=Array.isArray(e.sesion.asistencia)&&e.sesion.asistencia.length>0,n=typeof e.sesion.contenido==`string`&&e.sesion.contenido.trim().length>0;return e.sesion.estado===`registrada`||e.sesion.estado===`cerrada`||t||e.sesion.borrador===!1&&n})(),n=e.sesion&&!t&&(e.sesion.estado===`pendiente`||e.sesion.borrador===!0);return`
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
    `),i.innerHTML=`
    <div class="pm-drawer-content">
      <div class="pm-drawer-header">
        <div style="flex:1">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700;">${_.toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`})}</h3>
          <p style="margin:0.25rem 0 0; font-size:0.85rem; color:var(--pm-text-muted);">
            ${x.length>0?`<span style="color:var(--pm-warning);"><i class="bi bi-lightning-charge-fill"></i> ${x.length} actividad(es) especial(es)</span>`:y.length>0?`${y.length} clase(s) programada(s)`:`Sin clases programadas`}
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
    `,document.head.appendChild(e)}let w=()=>i.classList.remove(`open`),T=i.querySelector(`#pm-drawer-close-btn`);T&&(T.onclick=w),i.addEventListener(`click`,e=>{e.target===i&&w()}),i.querySelectorAll(`.btn-pasar-asistencia, .btn-ver-sesion, .btn-continuar-sesion`).forEach(t=>{t&&t.addEventListener(`click`,()=>{let n=t.dataset.clase;w(),window.location.hash=`#/asistencia?clase=${n}&fecha=${e}`})}),i.querySelectorAll(`.btn-ver-sesion-emergente`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.sesion;w(),window.location.hash=`#/asistencia?sesion=${n}&fecha=${e}`})}),i.querySelectorAll(`.btn-ver-clase-suspendida`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.clase;w(),window.location.hash=`#/asistencia?clase=${n}&fecha=${e}`})});let E=i.querySelector(`#pm-drawer-emergente`);E&&E.addEventListener(`click`,()=>{b(e,d)}),setTimeout(()=>i.classList.add(`open`),10)}async function b(t,n){let r=[];try{let e=await i(n.map(e=>e.id)),t={};e.forEach(e=>{if(!e.alumnos)return;t[e.alumno_id]||(t[e.alumno_id]=[]);let r=n.find(t=>t.id===e.clase_id);r&&t[e.alumno_id].push(r.nombre)});let a=new Set;r=e.map(e=>e.alumnos).filter(Boolean).filter(e=>a.has(e.id)?!1:(a.add(e.id),!0)).map(e=>({...e,clase_nombres:t[e.id]||[]}))}catch(e){console.warn(`[calendario] No se pudieron cargar alumnos para clase emergente:`,e)}u({fecha:t,clases:n,alumnos:r,maestroId:o().id,onSave:async t=>{try{let{data:n,error:r}=await a.from(`sesiones_clase`).insert([t]).select().single();if(r)throw r;let i=await f(n,o().id);i.errores.length>0?(console.warn(`[calendario] Auto-justificación parcial:`,i.errores),e.warning(`Clase emergente creada. ${i.justificadas} clase(s) justificada(s) automáticamente (${i.errores.length} con error).`)):i.justificadas>0?e.success(`Clase emergente creada. ${i.justificadas} clase(s) programada(s) marcada(s) como justificadas.`):e.success(`Clase emergente creada. Procedé a pasar asistencia.`);let s=document.getElementById(`pm-action-drawer`);s&&s.classList.remove(`open`),window.location.hash=`#/asistencia?sesion=${n.id}&fecha=${t.fecha}`}catch(t){console.error(`Error creando clase emergente:`,t),e.error(`No se pudo crear la clase emergente`)}}})}export{h as renderCalendarioView};