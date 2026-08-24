import{c as e,d as t,f as n}from"./pwaInstaller-CABasb_l.js";import{i as r}from"./supabase-Cgh_dhNB.js";import{i}from"./maestroAuth-BMzDPnai.js";import{c as a,d as o,f as s,l as c,r as l,s as u,t as d,u as f}from"./reportService-C177RavV.js";import{i as p,o as m,r as h}from"./portalUtils-CkF82Yyk.js";var g=[{dias:7,label:`Últimos 7 días`},{dias:30,label:`Últimos 30 días`},{dias:90,label:`Últimos 90 días`}],_=[`P`,`A`,`J`],v={P:`Presente`,A:`Ausente`,J:`Justificado`},y={maestroId:null,maestroNombre:null,dias:30,claseId:`todas`},b={clases:[],sesiones:[]};function x(e){let t=new Date,n=new Date(t);return n.setDate(n.getDate()-e),{desde:n.toISOString().split(`T`)[0],hasta:t.toISOString().split(`T`)[0]}}async function S(e){let{data:t,error:n}=await r.from(`alumnos`).select(`id, nombre_completo`).in(`id`,e);return n?(console.warn(`[MisClases] Error cargando nombres de alumnos:`,n.message),[]):t||[]}async function C(e){let{data:t,error:n}=await r.from(`justificaciones`).select(`sesion_id, alumno_id, motivo`).in(`sesion_id`,e);return n?(console.warn(`[MisClases] Error cargando justificaciones:`,n.message),[]):t||[]}async function w(r,i,a){let{desde:o,hasta:s}=x(i),[c,l]=await Promise.all([e(),n(r,o,s)]),u=new Map(c.map(e=>[e.id,e])),f=l.filter(e=>e.borrador===!1);a!==`todas`&&(f=f.filter(e=>e.clase_id===a));let p=[...new Set(f.map(e=>e.salon_id).filter(Boolean))],m=[...new Set(f.flatMap(e=>(e.asistencia||[]).map(e=>e.alumno_id)).filter(Boolean))],h=f.map(e=>e.id),[g,_,v]=await Promise.all([p.length>0?t(p):Promise.resolve([]),m.length>0?S(m):Promise.resolve([]),h.length>0?C(h):Promise.resolve([])]),y=new Map(g.map(e=>[e.id,e.nombre])),b=new Map(_.map(e=>[e.id,e.nombre_completo])),w=new Map(v.map(e=>[`${e.sesion_id}_${e.alumno_id}`,e.motivo]));return{clases:c,sesiones:f.map(e=>{let t=d(e.asistencia),n=(e.asistencia||[]).filter(e=>e.alumno_id).map(t=>({alumnoId:t.alumno_id,nombre:b.get(t.alumno_id)||`Alumno sin nombre`,estado:t.estado,motivo:w.get(`${e.id}_${t.alumno_id}`)||null})).sort((e,t)=>e.nombre.localeCompare(t.nombre));return{id:e.id,fecha:e.fecha,horaInicio:e.hora_inicio,horaFin:e.hora_fin,claseNombre:u.get(e.clase_id)?.nombre||`Clase sin nombre`,salonNombre:e.salon_id&&y.get(e.salon_id)||null,contenido:(e.contenido||``).trim(),presentes:t.P,ausentes:t.A,justificados:t.J,totalRegistros:t.total,roster:n}}).sort((e,t)=>e.fecha===t.fecha?(t.horaInicio||``).localeCompare(e.horaInicio||``):t.fecha.localeCompare(e.fecha))}}function T(e){let t=new Map;for(let n of e)t.has(n.fecha)||t.set(n.fecha,[]),t.get(n.fecha).push(n);return[...t.entries()]}function E(e){let t=new Date(`${e}T12:00:00`);return Number.isNaN(t.getTime())?e:h(t.toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`}))}function D(e){return e?`<p class="pm-misclases-contenido">${p(e)}</p>`:`<p class="pm-misclases-contenido pm-misclases-contenido--vacio">Sin contenido registrado.</p>`}var O={P:{titulo:`Presentes`,clase:`success`},A:{titulo:`Ausentes`,clase:`danger`},J:{titulo:`Justificados`,clase:`warning`}};function k(e){return!e||e.length===0?`<p class="pm-misclases-roster-vacio">Sin registro de asistencia individual para esta sesión.</p>`:_.map(t=>{let n=e.filter(e=>e.estado===t);if(n.length===0)return``;let{titulo:r,clase:i}=O[t]||{titulo:t,clase:`muted`};return`
      <div class="pm-misclases-roster-grupo">
        <h4 class="pm-misclases-roster-titulo pm-misclases-roster-titulo--${i}">${r} (${n.length})</h4>
        <ul class="pm-misclases-roster-lista">
          ${n.map(e=>`
            <li>
              <span class="pm-misclases-roster-nombre">${p(e.nombre)}</span>
              ${e.motivo?`<span class="pm-misclases-roster-motivo">${p(e.motivo)}</span>`:``}
            </li>
          `).join(``)}
        </ul>
      </div>
    `}).join(``)}function A(e){return`
    <article class="pm-card pm-misclases-card">
      <div class="pm-misclases-card-top">
        <div class="pm-misclases-card-meta">
          <strong>${p(e.claseNombre)}</strong>
          <span class="pm-misclases-card-hora">
            <i class="bi bi-clock"></i> ${p(m(e.horaInicio))}–${p(m(e.horaFin))}
          </span>
          ${e.salonNombre?`<span class="pm-misclases-card-salon"><i class="bi bi-geo-alt"></i> ${p(e.salonNombre)}</span>`:``}
        </div>
        <div class="pm-misclases-card-badges">
          <span class="pm-badge pm-badge-success">${e.presentes} P</span>
          <span class="pm-badge pm-badge-danger">${e.ausentes} A</span>
          <span class="pm-badge pm-badge-warning">${e.justificados} J</span>
          <button
            type="button"
            class="btn-icon-pm pm-misclases-btn-reporte"
            data-sesion-id="${e.id}"
            title="Ver / descargar reporte de esta clase"
            aria-label="Ver o descargar reporte de esta clase"
          >
            <i class="bi bi-file-earmark-pdf"></i>
          </button>
        </div>
      </div>

      ${D(e.contenido)}

      <details class="pm-misclases-roster-details">
        <summary>Ver asistencia detallada</summary>
        ${k(e.roster)}
      </details>
    </article>
  `}function j({clases:e,sesiones:t}){let n=T(t),r=e.slice().sort((e,t)=>e.nombre.localeCompare(t.nombre)).map(e=>`<option value="${e.id}" ${y.claseId===e.id?`selected`:``}>${p(e.nombre)}</option>`).join(``),i=n.length===0?`
      <div class="pm-empty">
        <i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.5;"></i>
        No hay clases registradas en este rango.
      </div>
    `:n.map(([e,t])=>`
        <section class="pm-misclases-dia">
          <h3 class="pm-misclases-dia-titulo">${p(E(e))}</h3>
          ${t.map(A).join(``)}
        </section>
      `).join(``);return`
    <div class="pm-misclases" role="main" aria-label="Mis clases dadas">
      <header class="pm-misclases-header">
        <div>
          <h1 class="pm-misclases-title">Mis Clases Dadas</h1>
          <p class="pm-misclases-subtitle">${t.length} sesión${t.length===1?``:`es`} registrada${t.length===1?``:`s`}</p>
        </div>
        <div class="pm-misclases-filtros">
          <select id="pm-misclases-rango" class="pm-apple-select" aria-label="Rango de fechas">
            ${g.map(e=>`<option value="${e.dias}" ${y.dias===e.dias?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
          <select id="pm-misclases-clase" class="pm-apple-select" aria-label="Filtrar por clase">
            <option value="todas" ${y.claseId===`todas`?`selected`:``}>Todas mis clases</option>
            ${r}
          </select>
          <button
            type="button"
            id="pm-misclases-btn-reporte-rango"
            class="pm-btn pm-btn-primary pm-btn-sm"
            style="width:auto;"
            ${t.length===0?`disabled`:``}
          >
            <i class="bi bi-file-earmark-pdf"></i> Descargar reporte
          </button>
        </div>
      </header>

      <div class="pm-misclases-lista">
        ${i}
      </div>
    </div>
  `}function M(e){let t=new Date(`${e}T12:00:00`);return Number.isNaN(t.getTime())?e:t.toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`})}function N(){let e=g.find(e=>e.dias===y.dias);return e?e.label:`Últimos ${y.dias} días`}function P(e,{maestroNombre:t,claseLabel:n}){let r=e.reduce((e,t)=>e+t.presentes,0),i=e.reduce((e,t)=>e+t.ausentes,0),o=e.reduce((e,t)=>e+t.justificados,0),l=e.length+1,d=e.map((e,t)=>`
      <tr>
        <td>${t+1}</td>
        <td>${u(M(e.fecha))}</td>
        <td>${u(m(e.horaInicio))}</td>
        <td>${u(e.claseNombre)}</td>
        <td style="text-align:center">${e.presentes}</td>
        <td style="text-align:center">${e.ausentes}</td>
        <td style="text-align:center">${e.justificados}</td>
      </tr>
    `).join(``);return s(`
    <div class="page">
      ${c({docTag:`REPORTE DE CLASES`,clase:n,docente:t,periodo:N()})}
      ${f([{label:`Sesiones`,value:e.length,type:`navy`},{label:`Presentes`,value:r,type:`ok`},{label:`Ausentes`,value:i,type:`bad`},{label:`Justificados`,value:o,type:`warn`}])}
      <p class="rpt-section-title">Índice de sesiones</p>
      <table class="rpt-table">
        <thead><tr><th>#</th><th>Fecha</th><th>Hora</th><th>Clase</th><th>P</th><th>A</th><th>J</th></tr></thead>
        <tbody>${d}</tbody>
      </table>
      ${a(1,l,N())}
    </div>
  `+e.map((e,n)=>{let r=(e.roster||[]).map((e,t)=>`
        <tr>
          <td>${t+1}</td>
          <td>${u(e.nombre)}</td>
          <td style="text-align:center">${u(v[e.estado]||e.estado)}</td>
          <td style="font-size:6.5pt;color:#6b7085">${u(e.motivo||``)}</td>
        </tr>
      `).join(``);return`
        <div class="page">
          ${c({docTag:`SESIÓN · ${M(e.fecha)}`,clase:e.claseNombre,docente:t,periodo:`${m(e.horaInicio)}–${m(e.horaFin)}${e.salonNombre?` · `+e.salonNombre:``}`})}
          ${f([{label:`Presentes`,value:e.presentes,type:`ok`},{label:`Ausentes`,value:e.ausentes,type:`bad`},{label:`Justificados`,value:e.justificados,type:`warn`},{label:`Total`,value:e.totalRegistros,type:`navy`}])}
          <p class="rpt-section-title">Asistencia detallada</p>
          <table class="rpt-table">
            <thead><tr><th>#</th><th>Alumno</th><th>Estado</th><th>Observación / Justificación</th></tr></thead>
            <tbody>${r||`<tr><td colspan="4">Sin registro de asistencia individual.</td></tr>`}</tbody>
          </table>
          <p class="rpt-section-title">Contenido de la sesión</p>
          <p style="font-size:8pt;line-height:1.4;white-space:pre-wrap;">${u(e.contenido)||`Sin contenido registrado.`}</p>
          ${a(n+2,l,M(e.fecha))}
        </div>
      `}).join(``))}function F(e){e.querySelector(`#pm-misclases-rango`)?.addEventListener(`change`,async t=>{y.dias=Number(t.target.value),await I(e)}),e.querySelector(`#pm-misclases-clase`)?.addEventListener(`change`,async t=>{y.claseId=t.target.value,await I(e)}),e.querySelector(`.pm-misclases-lista`)?.addEventListener(`click`,async e=>{let t=e.target.closest(`.pm-misclases-btn-reporte`);if(!t)return;let n=t.dataset.sesionId;if(!n)return;let r=t.innerHTML;t.disabled=!0,t.innerHTML=`<i class="bi bi-hourglass-split"></i>`;try{await l(n)}finally{t.disabled=!1,t.innerHTML=r}});let t=e.querySelector(`#pm-misclases-btn-reporte-rango`);t?.addEventListener(`click`,()=>{if(b.sesiones.length===0)return;let e=y.claseId===`todas`?`Todas mis clases`:b.clases.find(e=>e.id===y.claseId)?.nombre||`Clase`,n=t.innerHTML;t.disabled=!0,t.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{let t=P(b.sesiones,{maestroNombre:y.maestroNombre||`Docente`,claseLabel:e}),n=new Date().toISOString().split(`T`)[0];o(t,`reporte-clases-${n}`,{title:`Reporte de Clases · ${N()} · ${e}`})}finally{t.disabled=!1,t.innerHTML=n}})}async function I(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let t=await w(y.maestroId,y.dias,y.claseId);b=t,e.innerHTML=j(t),F(e)}catch(t){e.innerHTML=`
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;" role="alert">
        <p style="color:var(--pm-danger);">Error al cargar tus clases</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${p(t.message)}</p>
      </div>`}}async function L(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=i();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}y.maestroId=t.id,y.maestroNombre=t.nombre_completo||null,await I(e)}export{L as renderMisClasesView};