import{i as e}from"./AppModal-Du6jXNYA.js";import{i as t,n,o as r,r as i,s as a}from"./pwaInstaller-B9BMrkti.js";import{i as o}from"./supabase-Cgh_dhNB.js";import{i as s}from"./maestroAuth-BMzDPnai.js";import{r as c}from"./main-maestros-D98x9e4o.js";import{S as l}from"./planificacion-BdwKIwFz.js";import{n as u,r as d}from"./asistenciasSupabase-BCw50kNC.js";import{i as f,n as p,t as m}from"./portalUtils-CkF82Yyk.js";import{t as h}from"./claseEmergenteModal-DzBloOSJ.js";var g=[`domingo`,`lunes`,`martes`,`miercoles`,`jueves`,`viernes`,`sabado`];async function _(e,t){let n=[],r=0,[i,a,s]=e.fecha.split(`-`).map(Number),c=g[new Date(i,a-1,s).getDay()],{data:l,error:u}=await o.from(`clases`).select(`id, nombre`).or(`maestro_principal_id.eq.${t},maestro_suplente_id.eq.${t},maestro_id.eq.${t}`);if(u||!l?.length)return{justificadas:0,errores:[]};let d=l.map(e=>e.id),{data:f,error:p}=await o.from(`clase_horarios`).select(`clase_id, hora_inicio, hora_fin`).in(`clase_id`,d).eq(`dia`,c);if(p||!f?.length)return{justificadas:0,errores:[]};let m=f.map(e=>({...e,nombre:l.find(t=>t.id===e.clase_id)?.nombre||``}));for(let i of m)try{let{data:a}=await o.from(`alumnos_clases`).select(`alumno_id`).eq(`clase_id`,i.clase_id).eq(`activo`,!0),s=(a||[]).map(e=>({alumno_id:e.alumno_id,estado:`justificado`})),c=`Clase suspendida por actividad especial: "${e.actividad||`Actividad especial`}".`+(e.motivo?` Motivo: ${e.motivo}.`:``)+` Todos los alumnos quedan justificados.`,{error:l}=await o.from(`sesiones_clase`).upsert({clase_id:i.clase_id,fecha:e.fecha,maestro_id:t,emergente_id:e.id,hora_inicio:i.hora_inicio,hora_fin:i.hora_fin,estado:`registrada`,borrador:!1,asistencia:s,contenido:c},{onConflict:`clase_id,fecha,maestro_id`});l?n.push(`${i.nombre}: ${l.message}`):r++}catch(e){n.push(`${i.nombre}: ${e.message}`)}return{justificadas:r,errores:n}}var v=[`Do`,`Lu`,`Ma`,`Mi`,`Ju`,`Vi`,`Sa`],y=7;async function b(e,{onFechaClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let n=s();if(!n){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let r=new Date,i=r.getFullYear(),a=r.getMonth();async function o(){try{let{estadoMap:s,dotsMap:c}=await x(n.id,i,a);C(e,i,a,r,s,c,{onFechaClick:e=>{w(e),t?.(e)},onPrev:()=>{a===0?(i--,a=11):a--,o()},onNext:()=>{a===11?(i++,a=0):a++,o()}})}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar calendario: ${f(t.message)}</p>`}}await o()}async function x(e,i,a){let o=new Date(i,a,1),s=new Date(i,a+1,0),c=o.toISOString().split(`T`)[0],l=s.toISOString().split(`T`)[0],f=(await t()).map(e=>e.id);if(f.length===0)return{estadoMap:new Map,dotsMap:new Map};let p=await n(f),h=new Set(p.map(e=>e.dia?.toLowerCase())),g=new Map;p.forEach(e=>{let t=e.dia?.toLowerCase(),n=e.hora_fin||`23:59`;(t&&!g.has(t)||n>g.get(t))&&g.set(t,n)});let _=await r(e,c,l),v=e=>{if(!e||e.borrador===!0||e.estado===`pendiente`)return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return e.estado===`registrada`||e.estado===`cerrada`||e.borrador===!1&&(t||n)},b=_.filter(v),x=new Set(b.map(e=>e.fecha)),C=new Set(_.filter(e=>e.clase_id&&e.emergente_id).map(e=>e.fecha)),w=new Map;_.filter(e=>!e.clase_id).forEach(e=>{w.has(e.fecha)||w.set(e.fecha,[]),w.get(e.fecha).push(e)});let T=new Map,E=new Map;p.forEach(e=>{let t=e.dia?.toLowerCase();if(!t||!e.clase_id)return;T.has(t)||T.set(t,new Set),T.get(t).add(e.clase_id);let n=`${t}|${e.clase_id}`,r=e.hora_fin||`23:59`;(!E.has(n)||r>E.get(n))&&E.set(n,r)});let D=new Map;_.filter(e=>e.clase_id).forEach(e=>{let t=`${e.fecha}|${e.clase_id}`,n=D.get(t);(!n||!v(n)&&v(e))&&D.set(t,e)});let O=new Map,k=new Map,A=new Date;A.setHours(0,0,0,0);let j=await u().catch(()=>null);await d(e,j?.id).catch(()=>({esCompleto:!0,pendientesCount:0}));for(let e=new Date(o);e<=s;e.setDate(e.getDate()+1)){let t=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=m[e.getDay()],r=h.has(n),i=w.get(t)||[],a=new Date(e),o=Math.floor((A-a)/864e5),s=j&&(t<j.fecha_inicio||t>j.fecha_fin),c=Array.from(D.keys()).some(e=>e.startsWith(`${t}|`))||i.length>0;if(s&&!c){O.set(t,`receso-academico`),k.set(t,[]);continue}let l=[];if((T.get(n)||new Set).forEach(e=>{let r=D.get(`${t}|${e}`);if(o===0){r&&r.borrador===!1&&(r.emergente_id||v(r))?l.push(`verde`):r?l.push(`amarillo`):S(E.get(`${n}|${e}`))?l.push(`rojo`):l.push(`gris`);return}r&&(r.emergente_id||v(r))?l.push(`verde`):r?l.push(`amarillo`):o<0?l.push(`gris`):l.push(`rojo`)}),i.forEach(e=>{l.push(v(e)?`verde`:`amarillo`)}),k.set(t,l),!r&&i.length===0){O.set(t,`sin-clase`);continue}if(o===0){let e=_.find(e=>e.fecha===t);if(e&&e.borrador===!1&&v(e)){O.set(t,`registrada`);continue}if(e&&(e.borrador===!0||e.estado===`pendiente`)){O.set(t,`pendiente`);continue}if(C.has(t)){O.set(t,`cubierta-emergente`);continue}let r=g.get(n);if(r){let e=new Date,[n,i]=r.split(`:`),a=parseInt(n)*60*60*1e3+parseInt(i||0)*60*1e3;if(e.getHours()*60*60*1e3+e.getMinutes()*60*1e3<a){O.set(t,`sin-clase`);continue}}O.set(t,`pendiente`);continue}if(o>0&&C.has(t)){O.set(t,`cubierta-emergente`);continue}if(o>0&&x.has(t)){O.set(t,`registrada`);continue}o<0?O.set(t,`sin-clase`):o<=y?O.set(t,`pendiente`):O.set(t,`vencida`)}return{estadoMap:O,dotsMap:k}}function S(e){let t=(e||`23:59`).slice(0,5),n=new Date;return`${String(n.getHours()).padStart(2,`0`)}:${String(n.getMinutes()).padStart(2,`0`)}`>=t}function C(e,t,n,r,i,a,{onFechaClick:o,onPrev:s,onNext:c}){let l=new Date(t,n,1),u=new Date(t,n+1,0),d=l.getDay(),f=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,`0`)}-${String(r.getDate()).padStart(2,`0`)}`,m=u.getDate(),h=`${t}-${String(n+1).padStart(2,`0`)}-01`,g=`${t}-${String(n+1).padStart(2,`0`)}-${String(m).padStart(2,`0`)}`,_=f>=h&&f<=g?f:h,y=v.map(e=>`<div class="pm-cal-day-header">${e}</div>`).join(``);for(let e=0;e<d;e++)y+=`<div class="pm-cal-day otro-mes"></div>`;for(let e=1;e<=m;e++){let r=`${t}-${String(n+1).padStart(2,`0`)}-${String(e).padStart(2,`0`)}`,o=i.get(r)||`sin-clase`,s=a?.get(r)||[],c=s.includes(`rojo`)||s.includes(`amarillo`),l=s.length?`<div class="pm-day-dots">${s.map(e=>`<span class="pm-day-dot pm-dot-${e}"></span>`).join(``)}</div>`:``,u=r===f?`today`:``,d=r===_,m=`${e} de ${p[n]} ${t}${s.length?`, ${s.length} clase(s)`:``}`;y+=`
      <div class="pm-cal-day estado-${o}${c?` dia-alerta`:``} ${u}" data-fecha="${r}" title="${r}" role="gridcell" tabindex="${d?`0`:`-1`}" aria-label="${m}" aria-selected="false"${r===f?` aria-current="date"`:``}>
        <span class="pm-cal-day-num">${e}</span>
        ${l}
      </div>
    `}e.innerHTML=`
    <div class="pm-calendar-wrapper">
      <div class="pm-calendar-container">
        <div class="pm-cal-header">
        <button id="pm-cal-prev" class="pm-cal-nav-btn">
          <i class="bi bi-chevron-left"></i>
        </button>
        <h2 class="pm-month-title">
          ${p[n]} ${t}
        </h2>
        <button id="pm-cal-next" class="pm-cal-nav-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div class="pm-cal-grid-container">
        <div class="pm-cal-grid" role="grid" aria-label="Calendario ${p[n]} ${t}">
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
  `,e.querySelector(`#pm-cal-prev`).addEventListener(`click`,s),e.querySelector(`#pm-cal-next`).addEventListener(`click`,c),e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(e=>e.setAttribute(`aria-selected`,`false`)),t.setAttribute(`aria-selected`,`true`),o?.(t.dataset.fecha)})});let b=e.querySelector(`.pm-cal-grid`);b&&b.addEventListener(`keydown`,function(e){let t=[...b.querySelectorAll(`.pm-cal-day[data-fecha]`)];if(t.length===0)return;let n=b.querySelector(`[tabindex="0"]`),r=n?t.indexOf(n):-1,i=e=>{e<0||e>=t.length||(t.forEach(e=>e.setAttribute(`tabindex`,`-1`)),t[e].setAttribute(`tabindex`,`0`),t[e].focus())};switch(e.key){case`ArrowLeft`:e.preventDefault(),r>0&&i(r-1);break;case`ArrowRight`:e.preventDefault(),r<t.length-1&&i(r+1);break;case`ArrowUp`:e.preventDefault(),i(Math.max(0,r-7));break;case`ArrowDown`:e.preventDefault(),i(Math.min(t.length-1,r+7));break;case`Home`:e.preventDefault(),i(Math.floor(Math.max(r,0)/7)*7);break;case`End`:e.preventDefault(),i(Math.min(t.length-1,Math.floor(Math.max(r,0)/7)*7+6));break;case`PageUp`:e.preventDefault(),typeof s==`function`&&s();break;case`PageDown`:e.preventDefault(),typeof c==`function`&&c();break;case`Enter`:case` `:e.preventDefault(),n&&n.click();break}})}async function w(t){let n=s();if(!n)return;let r=new Date;`${r.getFullYear()}${String(r.getMonth()+1).padStart(2,`0`)}${String(r.getDate()).padStart(2,`0`)}`;let i=document.getElementById(`pm-action-drawer`);i||(i=document.createElement(`div`),i.id=`pm-action-drawer`,i.className=`pm-drawer-overlay`,document.body.appendChild(i));let p=[],m=[],h=[],g=[];try{let{data:e}=await o.from(`clases_emergentes`).select(`*`).eq(`maestro_id`,n.id).eq(`fecha`,t).order(`hora_inicio`,{ascending:!0,nullsFirst:!1}),{data:r}=await o.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,n.id).eq(`fecha`,t);p=r||[],g=p.filter(e=>e.clase_id&&e.emergente_id);let{data:i}=await o.from(`clases`).select(`id, nombre, instrumento`).or(`maestro_principal_id.eq.${n.id},maestro_suplente_id.eq.${n.id},maestro_id.eq.${n.id}`);m=i||[];let a=m.map(e=>e.id);if(a.length>0){let{data:e}=await o.from(`clase_horarios`).select(`clase_id, hora_inicio, hora_fin, dia`).in(`clase_id`,a);h=e||[]}}catch(e){console.error(`Error fetching drawer data:`,e)}let[_,v,y]=t.split(`-`).map(Number),x=new Date(_,v-1,y),S=x.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),C=await u().catch(()=>null),w=await d(n.id,C?.id).catch(()=>({esCompleto:!0,pendientesCount:0})),E=C&&(t<C.fecha_inicio||t>C.fecha_fin),D=``;E&&(D=w.esCompleto?`
        <div style="background:rgba(59,130,246,0.12); color:#60a5fa; border:1px solid rgba(59,130,246,0.25); border-radius:12px; padding:12px; margin-bottom:12px; display:flex; align-items:center; gap:10px;">
          <i class="bi bi-sun-fill" style="font-size:1.4rem;"></i>
          <div>
            <div style="font-weight:700; font-size:0.9rem;">RECESO ACADÉMICO</div>
            <div style="font-size:0.78rem; opacity:0.9;">Has completado el 100% de tus asistencias del período (${f(C.nombre)}). Disfruta tu receso.</div>
          </div>
        </div>
      `:`
        <div style="background:rgba(245,158,11,0.12); color:#fbbf24; border:1px solid rgba(245,158,11,0.25); border-radius:12px; padding:12px; margin-bottom:12px; display:flex; align-items:center; gap:10px;">
          <i class="bi bi-exclamation-triangle-fill" style="font-size:1.4rem;"></i>
          <div>
            <div style="font-weight:700; font-size:0.9rem;">PENDIENTE DE CIERRE DE SEMESTRE</div>
            <div style="font-size:0.78rem; opacity:0.9;">Tienes ${w.pendientesCount} clase(s) sin finalizar en el período (${f(C.nombre)}). Completa tus asistencias para entrar en Receso Académico.</div>
          </div>
        </div>
      `);let O=m.filter(e=>h.some(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===S)).map(e=>{let t=h.find(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===S),n=p.find(t=>t.clase_id===e.id);return{...e,hora_inicio:t?.hora_inicio,hora_fin:t?.hora_fin,sesion:n}}).sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)),k=p.filter(e=>!e.clase_id).sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)),A=``;k.length>0?A=k.map(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=e.estado===`registrada`||e.estado===`cerrada`||t;return`
        <div class="pm-drawer-clase-item btn-ver-sesion-emergente" data-sesion="${e.id}" style="border-left: 3px solid var(--pm-warning); cursor: pointer;">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(e.hora_inicio||`--:--`).slice(0,5)} - ${(e.hora_fin||`--:--`).slice(0,5)}</span>
            <span class="pm-drawer-clase-nombre">${f(e.actividad||`Clase Emergente`)}</span>
            <span class="pm-drawer-clase-instrumento" style="color:var(--pm-warning);">
              <i class="bi bi-lightning-charge-fill"></i> Actividad especial
            </span>
          </div>
          <div class="pm-clase-status ${n?`completed`:``}" style="margin-left: auto; display:flex; align-items:center;">
            ${n?`<i class="bi bi-check-circle-fill" style="color:var(--pm-success); font-size:1.2rem;"></i>`:`<i class="bi bi-chevron-right" style="color:var(--pm-text-muted); font-size:1.2rem;"></i>`}
          </div>
        </div>
      `}).join(``):O.length>0&&(A=O.map(e=>{let t=e.sesion&&(()=>{let t=Array.isArray(e.sesion.asistencia)&&e.sesion.asistencia.length>0,n=typeof e.sesion.contenido==`string`&&e.sesion.contenido.trim().length>0;return e.sesion.estado===`registrada`||e.sesion.estado===`cerrada`||t||e.sesion.borrador===!1&&n})(),n=e.sesion&&!t&&(e.sesion.estado===`pendiente`||e.sesion.borrador===!0);return`
        <div class="pm-drawer-clase-item btn-ver-sesion" data-clase="${e.id}" style="cursor: pointer;">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(e.hora_inicio||`--:--`).slice(0,5)} - ${(e.hora_fin||`--:--`).slice(0,5)}</span>
            <span class="pm-drawer-clase-nombre">${f(e.nombre)}</span>
            <span class="pm-drawer-clase-instrumento">${f(e.instrumento||``)}</span>
          </div>

          <div class="pm-clase-status ${t?`completed`:n?`pending`:``}" style="margin-left: auto; display:flex; align-items:center;">
             ${t?`<i class="bi bi-check-circle-fill" style="color:var(--pm-success); font-size:1.2rem;"></i>`:n?`<i class="bi bi-pencil-fill" style="color:var(--pm-warning); font-size:1.2rem;"></i>`:`<i class="bi bi-chevron-right" style="color:var(--pm-text-muted); font-size:1.2rem;"></i>`}
          </div>
        </div>
      `}).join(``));let j=``;if(g.length>0&&(j=`
      <div style="margin-top:0.75rem;">
        <p style="font-size:0.7rem; font-weight:600; color:#0891b2; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 0.5rem;">
          <i class="bi bi-slash-circle"></i> Clases suspendidas
        </p>
        ${g.sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)).map(e=>{let t=m.find(t=>t.id===e.clase_id);return`
            <div class="pm-drawer-clase-item" style="border-left:3px solid #0891b2; opacity:0.85;">
              <div class="pm-drawer-clase-info">
                <span class="pm-drawer-clase-hora">${(e.hora_inicio||`--:--`).slice(0,5)} - ${(e.hora_fin||`--:--`).slice(0,5)}</span>
                <span class="pm-drawer-clase-nombre">${f(t?.nombre||`Clase`)}</span>
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
          <h3 style="margin:0; font-size:1.1rem; font-weight:700;">${x.toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`})}</h3>
          <p style="margin:0.25rem 0 0; font-size:0.85rem; color:var(--pm-text-muted);">
            ${k.length>0?`<span style="color:var(--pm-warning);"><i class="bi bi-lightning-charge-fill"></i> ${k.length} actividad(es) especial(es)</span>`:O.length>0?`${O.length} clase(s) programada(s)`:`Sin clases programadas`}
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
        ${D}
        ${A||`
          <div style="text-align:center; padding:1.5rem 1rem; background:rgba(255,255,255,0.03); border-radius:12px; margin:0.5rem 0; border:1px dashed var(--pm-border-color, #334155);">
            <i class="bi bi-calendar-x" style="font-size:2rem; color:var(--pm-text-muted); display:block; margin-bottom:0.5rem;"></i>
            <p style="margin:0 0 1rem; color:var(--pm-text-muted); font-size:0.9rem;">No hay clases programadas para esta fecha</p>
            <button class="pm-btn pm-btn-primary" id="pm-drawer-emergente-body" style="background:var(--pm-primary); border:none; padding:0.6rem 1.2rem; border-radius:10px; font-weight:600;">
              <i class="bi bi-lightning-charge-fill"></i> Crear Clase Emergente
            </button>
          </div>
        `}
        ${j}
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
    `,document.head.appendChild(e)}let M=()=>i.classList.remove(`open`),N=i.querySelector(`#pm-drawer-close-btn`);N&&(N.onclick=M),i.addEventListener(`click`,e=>{e.target===i&&M()}),i.querySelectorAll(`.btn-pasar-asistencia, .btn-ver-sesion, .btn-continuar-sesion`).forEach(e=>{e&&e.addEventListener(`click`,()=>{let n=e.dataset.clase;M(),window.location.hash=`#/asistencia?clase=${n}&fecha=${t}`})}),i.querySelectorAll(`.btn-ver-sesion-emergente`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.sesion;M(),window.location.hash=`#/asistencia?sesion=${n}&fecha=${t}`})}),i.querySelectorAll(`.btn-ver-clase-suspendida`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.clase;M(),window.location.hash=`#/asistencia?clase=${n}&fecha=${t}`})}),i.querySelectorAll(`.btn-descartar-borrador`).forEach(t=>{t.addEventListener(`click`,async n=>{n.stopPropagation();let r=t.dataset.sesion;if(r&&confirm(`¿Deseas descartar este borrador? La fecha se desmarcará por completo.`))try{await l(r),a(),c(`calendario`),e.show(`Borrador descartado. Fecha desmarcada.`,`success`),M(),await b(container)}catch(t){e.show(`Error al descartar: `+t.message,`danger`)}})}),i.querySelectorAll(`#pm-drawer-emergente, #pm-drawer-emergente-body`).forEach(e=>{e.addEventListener(`click`,()=>{T(t,m)})}),setTimeout(()=>i.classList.add(`open`),10)}async function T(t,n){let r=[];try{let e=await i(n.map(e=>e.id)),t={};e.forEach(e=>{if(!e.alumnos)return;t[e.alumno_id]||(t[e.alumno_id]=[]);let r=n.find(t=>t.id===e.clase_id);r&&t[e.alumno_id].push(r.nombre)});let a=new Set;r=e.map(e=>e.alumnos).filter(Boolean).filter(e=>a.has(e.id)?!1:(a.add(e.id),!0)).map(e=>({...e,clase_nombres:t[e.id]||[]}))}catch(e){console.warn(`[calendario] No se pudieron cargar alumnos para clase emergente:`,e)}h({fecha:t,clases:n,alumnos:r,maestroId:s().id,onSave:async t=>{try{let{data:n,error:r}=await o.from(`sesiones_clase`).insert([t]).select().single();if(r)throw r;let i=await _(n,s().id);i.errores.length>0?(console.warn(`[calendario] Auto-justificación parcial:`,i.errores),e.warning(`Clase emergente creada. ${i.justificadas} clase(s) justificada(s) automáticamente (${i.errores.length} con error).`)):i.justificadas>0?e.success(`Clase emergente creada. ${i.justificadas} clase(s) programada(s) marcada(s) como justificadas.`):e.success(`Clase emergente creada. Procedé a pasar asistencia.`);let a=document.getElementById(`pm-action-drawer`);a&&a.classList.remove(`open`),window.location.hash=`#/asistencia?sesion=${n.id}&fecha=${t.fecha}`}catch(t){console.error(`Error creando clase emergente:`,t),e.error(`No se pudo crear la clase emergente`)}}})}export{b as renderCalendarioView};