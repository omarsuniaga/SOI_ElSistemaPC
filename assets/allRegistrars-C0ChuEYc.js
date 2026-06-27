import{r as e}from"./rolldown-runtime-DlOssbPu.js";import{i as t}from"./supabase-KnARm58N.js";import"./vendor-CtPF6k7y.js";import{t as n}from"./AppToast-Dk3fEiuP.js";import{n as r}from"./groqService-Cmal3gSu.js";import{t as i}from"./AppModal-2uZhR2ML.js";import{C as a,S as o,T as s,_ as c,a as l,b as u,c as d,d as ee,f as te,g as ne,h as re,i as ie,l as ae,m as oe,n as se,p as ce,r as le,t as ue,u as de,v as fe,w as pe,x as me,y as he}from"./scoreDirectorView-BMWtmf__.js";import{t as f}from"./router-Cvp2VwYy.js";import{a as ge,m as _e,o as ve}from"./tareasApi-CIG7I0P3.js";import{t as ye}from"./tareasView-BbdFc-JR.js";import{i as be,n as xe}from"./instrumentosApi-BC8lM_7y.js";var Se={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`,LUT:`Lutería`},Ce={critica:`danger`,alta:`warning`,media:`info`,baja:`secondary`},p={procedimientos:[],cargando:!1};function m(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}async function we(e){let t=new AbortController;return await Te(e),e.addEventListener(`click`,async t=>{if(t.target.closest(`#btn-refrescar-proc`))return Te(e);if(t.target.closest(`#btn-caso-alumno`)){let t=window.prompt(`Nombre del alumno en riesgo:`);if(!t?.trim())return;let n=window.prompt(`Motivo (ausencias, bajo progreso, morosidad…):`)||``;try{await _e(null,t.trim(),n.trim()),alert(`Caso abierto: se delegaron tareas a Académico, Comunicación, Finanzas y Dirección.`),Te(e)}catch(e){alert(`Error: ${e.message}`)}}},{signal:t.signal}),{teardown:()=>t.abort()}}async function Te(e){try{p.cargando=!0,De(e),p.procedimientos=await ve()}catch(t){e.innerHTML=`<div class="alert alert-danger m-3">Error cargando procedimientos: ${m(t.message)}</div>`;return}finally{p.cargando=!1}De(e)}function Ee(e){return{totalProc:e.length,enCurso:e.filter(e=>e.pct_avance<100&&e.total>e.canceladas).length,bloqueados:e.filter(e=>e.bloqueadas>0).length,observados:e.filter(e=>e.observadas>0).length,criticos:e.filter(e=>e.prioridad_max===`critica`).length}}function De(e){if(p.cargando&&p.procedimientos.length===0){e.innerHTML=`<div class="text-center text-muted py-5"><div class="spinner-border" role="status"></div><p class="mt-2">Cargando procedimientos…</p></div>`;return}let t=p.procedimientos,n=Ee(t),r=(e,t,n,r)=>`
    <div class="col">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body py-3">
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${r} fs-4 text-${n}"></i>
            <div>
              <div class="fs-4 fw-bold lh-1">${t}</div>
              <div class="small text-muted">${e}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`,i=t.length===0?`<div class="text-center text-muted py-5"><i class="bi bi-inbox fs-1"></i><p class="mt-2">No hay procedimientos activos.</p></div>`:t.map(Oe).join(``);e.innerHTML=`
    <div class="p-3 p-md-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 class="mb-0"><i class="bi bi-diagram-3 me-2"></i>Procedimientos institucionales</h3>
          <p class="text-muted mb-0 small">Vista consolidada del Director — avance por caso (correlation_id)</p>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-caso-alumno" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-person-exclamation"></i> Caso: alumno en riesgo
          </button>
          <button id="btn-refrescar-proc" class="btn btn-outline-primary btn-sm" ${p.cargando?`disabled`:``}>
            <i class="bi bi-arrow-clockwise"></i> ${p.cargando?`Actualizando…`:`Refrescar`}
          </button>
        </div>
      </div>

      <div class="row row-cols-2 row-cols-md-5 g-2 mb-4">
        ${r(`Procedimientos`,n.totalProc,`primary`,`bi-diagram-3`)}
        ${r(`En curso`,n.enCurso,`info`,`bi-hourglass-split`)}
        ${r(`Con bloqueos`,n.bloqueados,`danger`,`bi-slash-circle`)}
        ${r(`Con observadas`,n.observados,`warning`,`bi-eye`)}
        ${r(`Críticos`,n.criticos,`danger`,`bi-exclamation-octagon`)}
      </div>

      <div class="row row-cols-1 row-cols-lg-2 g-3">
        ${i}
      </div>
    </div>`}function Oe(e){let t=Ce[e.prioridad_max]||`secondary`,n=e.bloqueadas>0?`bg-danger`:e.pct_avance===100?`bg-success`:`bg-primary`,r=(e.departamentos||[]).map(e=>`<span class="badge bg-light text-dark border me-1">${m(Se[e]||e)}</span>`).join(``),i=[];return e.bloqueadas>0&&i.push(`<span class="badge bg-danger me-1"><i class="bi bi-slash-circle"></i> ${e.bloqueadas} bloqueada${e.bloqueadas>1?`s`:``}</span>`),e.observadas>0&&i.push(`<span class="badge bg-warning text-dark me-1"><i class="bi bi-eye"></i> ${e.observadas} observada${e.observadas>1?`s`:``}</span>`),`
    <div class="col">
      <div class="card h-100 shadow-sm border-0">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h6 class="card-title mb-0">${m(e.titulo_muestra)}</h6>
            <span class="badge bg-${t} text-capitalize">${m(e.prioridad_max)}</span>
          </div>
          <div class="mb-2">${r}</div>
          <div class="progress mb-1" style="height: 8px;" role="progressbar" aria-valuenow="${e.pct_avance}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar ${n}" style="width: ${e.pct_avance}%"></div>
          </div>
          <div class="d-flex justify-content-between small text-muted mb-2">
            <span>${e.pct_avance}% completado</span>
            <span>${e.completadas}/${e.total} tareas</span>
          </div>
          <div>${i.join(``)||`<span class="badge bg-light text-success border"><i class="bi bi-check-circle"></i> sin bloqueos</span>`}</div>
        </div>
      </div>
    </div>`}var ke={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`,LUT:`Lutería`},Ae=[`¿Cómo va la operación en general?`,`¿Qué departamentos tienen tareas pendientes?`,`¿Qué casos requieren atención inmediata?`,`¿Cómo va la reinscripción?`],h={snapshot:null,procedimientos:[],historial:[]};function g(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function je(e){return String(e??``).normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase()}async function Me(e){let t=new AbortController;try{[h.snapshot,h.procedimientos]=await Promise.all([ge(),ve()])}catch(n){return e.innerHTML=`<div class="alert alert-danger m-3">No pude consultar el estado: ${g(n.message)}</div>`,{teardown:()=>t.abort()}}Pe(e);let n=()=>{let t=e.querySelector(`#hermes-q`),n=t.value.trim();if(!n)return;h.historial.push({rol:`user`,texto:n}),h.historial.push({rol:`hermes`,html:Ne(n)}),t.value=``,Pe(e);let r=e.querySelector(`#hermes-log`);r&&(r.scrollTop=r.scrollHeight)};return e.addEventListener(`click`,t=>{t.target.closest(`#hermes-send`)&&n();let r=t.target.closest(`.hermes-sug`);r&&(e.querySelector(`#hermes-q`).value=r.dataset.q,n())},{signal:t.signal}),e.addEventListener(`keydown`,e=>{e.target.id===`hermes-q`&&e.key===`Enter`&&(e.preventDefault(),n())},{signal:t.signal}),{teardown:()=>t.abort()}}function Ne(e){let t=je(e),n=h.snapshot;if(/(atencion|inmediat|urgent|bloque|critic|riesgo|priorid)/.test(t)){let e=n.atencion_inmediata||[];return e.length===0?`<p>✅ No hay tareas bloqueadas ni críticas abiertas. Nada requiere atención inmediata.</p>`:`<p><strong>${e.length}</strong> tarea(s) requieren atención inmediata:</p><ul class="mb-0">`+e.map(e=>`<li><span class="badge bg-${e.estado===`bloqueada`?`danger`:`warning text-dark`} me-1">${g(e.estado)}</span>
        <strong>${g(ke[e.departamento]||e.departamento)}</strong> — ${g(e.titulo)}</li>`).join(``)+`</ul>`}if(/(pendient|departament|quien|quienes|cargad|saturad)/.test(t)){let e=(n.por_departamento||[]).filter(e=>e.abiertas>0);return e.length===0?`<p>No hay tareas abiertas en ningún departamento.</p>`:`<p>Tareas abiertas por departamento:</p><ul class="mb-0">`+e.map(e=>`<li><strong>${g(ke[e.departamento]||e.departamento)}</strong>: ${e.abiertas} abiertas
        (${e.pendientes} pendientes${e.bloqueadas>0?`, <span class="text-danger">${e.bloqueadas} bloqueadas</span>`:``})</li>`).join(``)+`</ul>`}let r=t.split(/\s+/).filter(e=>e.length>=4&&![`como`,`va`,`van`,`esta`,`estan`,`sobre`,`para`,`proceso`,`procedimiento`,`caso`].includes(e));if(/(como va|como van|proceso|procedimiento|caso|estado de)/.test(t)&&r.length>0){let e=h.procedimientos.filter(e=>{let t=je(e.titulo_muestra);return r.some(e=>t.includes(e))});if(e.length>0)return`<p>Encontré ${e.length} procedimiento(s) relacionados:</p><ul class="mb-0">`+e.slice(0,8).map(e=>`<li><strong>${e.pct_avance}%</strong> — ${g(e.titulo_muestra)}
          <span class="text-muted">(${e.completadas}/${e.total} tareas${e.bloqueadas>0?`, ${e.bloqueadas} bloqueadas`:``})</span></li>`).join(``)+`</ul>`}let i=n.tareas,a=i.pendiente+i.en_progreso+i.bloqueada+i.observada;return`<p>Estado general de la operación:</p>
    <ul class="mb-0">
      <li><strong>${n.total_procedimientos}</strong> procedimientos en el sistema</li>
      <li><strong>${i.total}</strong> tareas — ${a} abiertas, ${i.completada} completadas</li>
      <li>Pendientes: ${i.pendiente} · En progreso: ${i.en_progreso}
        ${i.bloqueada>0?`· <span class="text-danger">Bloqueadas: ${i.bloqueada}</span>`:``}
        ${i.observada>0?`· <span class="text-warning">Observadas: ${i.observada}</span>`:``}</li>
    </ul>`}function Pe(e){let t=h.historial.length===0?`<div class="text-muted text-center py-4">
         <i class="bi bi-robot fs-1"></i>
         <p class="mt-2 mb-0">Preguntale a Hermes sobre el estado de la operación.</p>
       </div>`:h.historial.map(e=>e.rol===`user`?`<div class="d-flex justify-content-end mb-2"><div class="p-2 px-3 rounded bg-primary text-white" style="max-width:80%">${g(e.texto)}</div></div>`:`<div class="d-flex justify-content-start mb-3"><div class="p-2 px-3 rounded bg-light border" style="max-width:90%"><div class="small text-muted mb-1"><i class="bi bi-robot"></i> Hermes</div>${e.html}</div></div>`).join(``);e.innerHTML=`
    <div class="p-3 p-md-4" style="max-width:900px;margin:0 auto">
      <h3 class="mb-1"><i class="bi bi-robot me-2"></i>Consultar a Hermes</h3>
      <p class="text-muted small">Respuestas factuales desde el estado real — sin generación libre.</p>

      <div class="mb-2 d-flex flex-wrap gap-2">
        ${Ae.map(e=>`<button class="btn btn-sm btn-outline-secondary hermes-sug" data-q="${g(e)}">${g(e)}</button>`).join(``)}
      </div>

      <div id="hermes-log" class="border rounded p-3 mb-2 bg-white" style="height:380px;overflow-y:auto">
        ${t}
      </div>

      <div class="input-group">
        <input id="hermes-q" type="text" class="form-control" placeholder="Escribí tu pregunta…" autocomplete="off" />
        <button id="hermes-send" class="btn btn-primary"><i class="bi bi-send"></i></button>
      </div>
    </div>`}window.router=f;var Fe=`hermes-tareas`;function Ie(){let e=localStorage.getItem(`app-theme`),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches,n=e===`dark`||e===null&&t;document.documentElement.setAttribute(`data-bs-theme`,n?`dark`:`light`)}function Le(){let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-bs-theme`,e),localStorage.setItem(`app-theme`,e)}var _=null;function Re(e,t){for(let n of e)if(n.items.some(e=>e.id===t))return n.id;return e[0]?.id}function ze(e,n,r){if(_?.abort(),_=new AbortController,document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),!n)return;let i=s.getUser(),a=i?i.email||i.full_name||`Usuario`:``,o=localStorage.getItem(r)||e.defaultRoute,c=Re(e.navGroups,o),l=document.documentElement.getAttribute(`data-bs-theme`)===`dark`,u=document.createElement(`aside`);u.className=`app-sidebar`,u.innerHTML=`
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi ${e.brandIcon}"></i></div>
      <span class="sidebar-brand-text">${e.brandText}</span>
    </div>
    <nav class="sidebar-nav">
      ${e.navGroups.map(e=>`
        <div class="nav-group ${e.id===c?`expanded`:``}" data-group="${e.id}">
          <button class="nav-group-header">
            <i class="bi ${e.icon} group-icon"></i>
            <span>${e.label}</span>
            <i class="bi bi-chevron-down chevron"></i>
          </button>
          <div class="nav-group-items">
            ${e.items.map(e=>`
              <button class="nav-item-btn ${e.id===o?`active`:``}" data-route="${e.id}">
                <i class="bi ${e.icon}"></i>
                <span>${e.label}</span>
              </button>`).join(``)}
          </div>
        </div>`).join(``)}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <i class="bi bi-person-circle"></i>
        <span class="sidebar-user-name" title="${a}">${a.split(`@`)[0]}</span>
      </div>
      <button class="sidebar-action-btn" id="sidebarBtnTheme" title="Cambiar tema">
        <i class="bi ${l?`bi-sun-fill`:`bi-moon-fill`}"></i>
      </button>
      <button class="sidebar-action-btn danger" id="sidebarBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `,document.body.prepend(u);let{signal:d}=_;u.querySelectorAll(`.nav-group-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.nav-group`),n=t.classList.contains(`expanded`);u.querySelectorAll(`.nav-group`).forEach(e=>e.classList.remove(`expanded`)),n||t.classList.add(`expanded`)},{signal:d})}),u.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>f.navigate(e.dataset.route),{signal:d})}),u.querySelector(`#sidebarBtnTheme`).addEventListener(`click`,()=>{Le();let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`;u.querySelector(`#sidebarBtnTheme i`).className=e?`bi bi-sun-fill`:`bi bi-moon-fill`},{signal:d}),u.querySelector(`#sidebarBtnLogout`).addEventListener(`click`,async()=>{await t.auth.signOut(),window.location.reload()},{signal:d})}async function Be(e){let{data:n}=await t.from(`profiles`).select(`rol`).eq(`id`,e).maybeSingle();return n?.rol||null}function Ve(e,n){document.querySelector(`.app-sidebar`)?.remove(),e.innerHTML=`
    <div class="d-flex align-items-center justify-content-center" style="min-height:100vh">
      <div class="text-center p-4">
        <i class="bi bi-shield-lock" style="font-size:3rem;opacity:0.4"></i>
        <h4 class="mt-3">Sin acceso a ${n}</h4>
        <p class="text-muted">Tu cuenta no tiene permiso para este portal.</p>
        <button class="btn btn-outline-secondary btn-sm" id="btnSalir">
          <i class="bi bi-box-arrow-right me-1"></i>Cambiar de cuenta
        </button>
      </div>
    </div>
  `,e.querySelector(`#btnSalir`)?.addEventListener(`click`,async()=>{await t.auth.signOut(),window.location.reload()})}async function He(e){let t=`current-view-${e.hermesDept.toLowerCase()}`,n=document.querySelector(`#app`);if(!n){console.error(`El contenedor #app no existe en el HTML`);return}Ie();try{pe()}catch(e){console.error(`Error registrando auth:`,e)}e.registrars.forEach(e=>{try{e()}catch(e){console.error(`Error registrando módulo:`,e)}}),f.register(Fe,t=>ye(t,{departamento:e.hermesDept,hideCalendarBtn:!0})),f.register(`hermes-procedimientos`,e=>we(e)),f.register(`dir-score`,e=>ue(e)),f.register(`hermes-consulta`,e=>Me(e)),f.initCustomEvents(),await s.refreshAuth(),f.setAuthGuard(()=>s.isAuthenticated(),[`login`,`register`]),f.init=function(){let n=localStorage.getItem(t)||e.defaultRoute;this.navigate(n)};let r=f._navigateTo.bind(f);f._navigateTo=function(e,n={}){r(e,n),localStorage.setItem(t,e)};let i=async()=>{if(!s.isAuthenticated()){ze(e,!1,t),f.navigate(`login`);return}let r=s.getUser()||s.getState?.().user;if(!r?.id){console.warn(`[portalShell] autenticado pero sin user.id; redirigiendo a login`),ze(e,!1,t),f.navigate(`login`);return}let i=await Be(r.id);if(!e.allowedRoles.includes(i)){Ve(n,e.brandText);return}ze(e,!0,t);let a=localStorage.getItem(t);f.navigate(a&&f.routes[a]?a:e.defaultRoute)};try{await i()}catch(t){console.error(`[portalShell] Error en boot:`,t),Ue(n,e.brandText,t);return}let a=!1;s.subscribe(async e=>{if(!a){a=!0;try{e.user?await i():(document.querySelector(`.app-sidebar`)?.remove(),n.innerHTML=``,f.navigate(`login`))}catch(e){console.error(`[portalShell] Error en re-gate:`,e)}finally{a=!1}}})}function Ue(e,t,n){document.querySelector(`.app-sidebar`)?.remove(),e.innerHTML=`
    <div class="d-flex align-items-center justify-content-center" style="min-height:100vh">
      <div class="text-center p-4" style="max-width:520px">
        <i class="bi bi-exclamation-triangle text-danger" style="font-size:2.5rem"></i>
        <h5 class="mt-3">No se pudo iniciar ${t}</h5>
        <pre class="text-start small bg-body-secondary p-3 rounded mt-3" style="white-space:pre-wrap;overflow:auto;max-height:240px">${String(n?.stack||n?.message||n)}</pre>
        <button class="btn btn-outline-secondary btn-sm" onclick="window.location.reload()">
          <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
        </button>
      </div>
    </div>
  `}var We={violin:`Violín`,volín:`Violín`,violín:`Violín`,viola:`Viola`,cello:`Cello`,violoncello:`Cello`,violonchelo:`Cello`,chelo:`Cello`,contrabajo:`Contrabajo`,flauta:`Flauta`,oboe:`Oboe`,clarinete:`Clarinete`,fagot:`Fagot`,saxofon:`Saxofón`,saxofón:`Saxofón`,corno:`Corno`,trompeta:`Trompeta`,trombón:`Trombón`,trombon:`Trombón`,tuba:`Tuba`,percusión:`Percusión`,percusion:`Percusión`,coro:`Coro`,piano:`Piano`},Ge={cuerdas:{label:`Cuerdas`,icon:`bi-music-note-beamed`,instrumentos:[`Violín`,`Viola`,`Cello`,`Contrabajo`]},maderas:{label:`Maderas`,icon:`bi-wind`,instrumentos:[`Flauta`,`Oboe`,`Clarinete`,`Fagot`,`Saxofón`]},metales:{label:`Metales`,icon:`bi-trumpet`,instrumentos:[`Corno`,`Trompeta`,`Trombón`,`Tuba`]},percusion:{label:`Percusión`,icon:`bi-bullseye`,instrumentos:[`Percusión`]},coro:{label:`Coro`,icon:`bi-people`,instrumentos:[`Coro`]},otros:{label:`Otros`,icon:`bi-three-dots`,instrumentos:[`Piano`]}};function v(e){return e?We[String(e).trim().toLowerCase()]||Ye(String(e).trim()):null}function Ke(e){let t=v(e);if(!t)return`otros`;for(let[e,n]of Object.entries(Ge))if(n.instrumentos.includes(t))return e;return`otros`}function y(e){if(!e)return null;let t=String(e).replace(/\D/g,``);return t.length===0||(t.length===10&&(t=`1`+t),t.length<11)?null:t}function qe(e,t=``){let n=y(e);return n?`https://wa.me/${n}${t?`?text=${encodeURIComponent(t)}`:``}`:null}function Je(e,t={}){if(!e)return``;let n=Ge[Ke(t.instrumento)];return e.replace(/\{nombre_alumno\}/g,t.alumno||``).replace(/\{representante\}/g,t.contactoNombre||``).replace(/\{instrumento\}/g,v(t.instrumento)||``).replace(/\{seccion\}/g,n?.label||``)}function Ye(e){return e&&e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()}[[`Ana Lucía Pérez`,`Violín`,`María Pérez`,`8095551001`,`maria.perez@example.com`],[`Carlos Ramírez`,`Violin`,`José Ramírez`,`8295551002`,`jose.ramirez@example.com`],[`Daniela Gómez`,`Viola`,`Rosa Gómez`,`8495551003`,`rosa.gomez@example.com`],[`Esteban Núñez`,`Cello`,`Pedro Núñez`,`8095551004`,`pedro.nunez@example.com`],[`Fabiola Díaz`,`Contrabajo`,`Luisa Díaz`,`8095551005`,null],[`Gabriel Soto`,`Flauta`,`Carmen Soto`,`8295551006`,`carmen.soto@example.com`],[`Helena Cruz`,`Clarinete`,`Marta Cruz`,`8495551007`,`marta.cruz@example.com`],[`Iván Mejía`,`Trompeta`,`Raúl Mejía`,`8095551008`,`raul.mejia@example.com`],[`Julia Vargas`,`Trombón`,`Sofía Vargas`,null,`sofia.vargas@example.com`],[`Kevin Reyes`,`Percusión`,`Ana Reyes`,`8295551010`,`ana.reyes@example.com`]].map((e,t)=>{let[n,r,i,a,o]=e;return{alumnoId:`mock-al-${String(t+1).padStart(3,`0`)}`,alumno:n,instrumento:v(r),familia:Ke(r),contactoNombre:i,whatsapp:a,email:o}}),new Date().toISOString(),new Date().toISOString();var Xe=e({eliminarPlantilla:()=>et,enviarCorreo:()=>tt,getContactos:()=>Ze,getPlantillas:()=>Qe,guardarPlantilla:()=>$e});async function Ze(){let{data:e,error:n}=await t.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, activo, representante_nombre, representante_tlf, madre_nombre, madre_tlf_whatsapp, padre_nombre, padre_tlf_whatsapp, familiar_nombre, familiar_telefono, correo_representante`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});if(n)throw n;return(e||[]).map(e=>{let t=e.madre_tlf_whatsapp||e.padre_tlf_whatsapp||e.representante_tlf||e.familiar_telefono||null,n=e.representante_nombre||e.madre_nombre||e.padre_nombre||e.familiar_nombre||`Representante`;return{alumnoId:e.id,alumno:e.nombre_completo,instrumento:v(e.instrumento_principal),familia:Ke(e.instrumento_principal),contactoNombre:n,whatsapp:t,email:e.correo_representante||null}})}async function Qe(){let{data:e,error:n}=await t.from(`document_templates`).select(`id, nombre, tipo, descripcion, contenido, variables, estado, version, updated_at`).order(`nombre`,{ascending:!0});if(n)throw n;return e||[]}async function $e(e){let n={nombre:e.nombre,tipo:e.tipo||`mensaje`,descripcion:e.descripcion||null,contenido:e.contenido||``,variables:e.variables||[],estado:e.estado||`activa`,updated_at:new Date().toISOString()};if(e.id){let{data:r,error:i}=await t.from(`document_templates`).update(n).eq(`id`,e.id).select().single();if(i)throw i;return r}let{data:r,error:i}=await t.from(`document_templates`).insert(n).select().single();if(i)throw i;return r}async function et(e){let{error:n}=await t.from(`document_templates`).delete().eq(`id`,e);if(n)throw n;return!0}async function tt(e){let{data:n,error:r}=await t.functions.invoke(`send-email`,{body:e});if(r){let e=r.message;try{let t=await r.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e)}if(n&&n.ok===!1&&n.enviados===0)throw Error(n.batches?.[0]?.error||`No se pudo enviar el correo`);return n}var b=Xe,nt=b.getContactos,rt=b.getPlantillas,it=b.guardarPlantilla,at=b.eliminarPlantilla,ot=b.enviarCorreo,st=`Eres el asistente de redacción del Departamento de Comunicaciones de
"El Sistema Punta Cana", una fundación de educación musical para jóvenes de bajos recursos.
Mejorás mensajes institucionales dirigidos a representantes/familias de alumnos.
Reglas:
- Tono cálido, cercano y respetuoso, pero profesional e institucional.
- Español neutro dominicano. Claro y conciso.
- Conservá las variables entre llaves como {nombre_alumno}, {representante}, {instrumento}, {seccion} EXACTAMENTE como están.
- No inventes datos (fechas, lugares, montos) que no estén en el texto original.
- Devolvé SOLO el mensaje mejorado, sin explicaciones ni comillas.`;async function ct(e,t=``){let n=t?`Instrucción adicional: ${t}\n\nMensaje a mejorar:\n${e}`:`Mensaje a mejorar:\n${e}`,i=await r([{role:`system`,content:st},{role:`user`,content:n}]);return typeof i==`string`?i.trim():i&&typeof i.content==`string`?i.content.trim():String(i||``).trim()}function lt(e){let t=new Date;return t.setDate(t.getDate()+e),t.toISOString().slice(0,10)}new Date(Date.now()-2*864e5).toISOString(),lt(-1),new Date(Date.now()-2*864e5).toISOString(),new Date(Date.now()-2*864e5).toISOString(),new Date(Date.now()-1*864e5).toISOString(),lt(0),new Date(Date.now()-1*864e5).toISOString(),new Date(Date.now()-1*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString();var ut=e({actualizarSeguimiento:()=>mt,cerrarSeguimiento:()=>ht,crearSeguimiento:()=>pt,eliminarSeguimiento:()=>gt,getSeguimientos:()=>dt,getSeguimientosByAlumno:()=>ft}),x=`comunicaciones_seguimiento`,S=`id, alumno_id, contacto_nombre, contacto_telefono, contacto_email, canal, fecha, resultado, notas, requiere_seguimiento, proxima_accion, proxima_fecha, estado, responsable_id, created_at, updated_at`;async function dt(e={}){let n=t.from(x).select(S);e.alumno_id&&(n=n.eq(`alumno_id`,e.alumno_id)),e.estado&&(n=n.eq(`estado`,e.estado)),e.canal&&(n=n.eq(`canal`,e.canal));let{data:r,error:i}=await n.order(`fecha`,{ascending:!1});if(i)throw i;return r||[]}async function ft(e){return dt({alumno_id:e})}async function pt(e){let n={alumno_id:e.alumno_id||null,contacto_nombre:e.contacto_nombre||null,contacto_telefono:e.contacto_telefono||null,contacto_email:e.contacto_email||null,canal:e.canal||`llamada`,fecha:e.fecha||new Date().toISOString(),resultado:e.resultado||`contactado`,notas:e.notas||null,requiere_seguimiento:!!e.requiere_seguimiento,proxima_accion:e.proxima_accion||null,proxima_fecha:e.proxima_fecha||null,estado:e.estado||`abierto`},{data:r,error:i}=await t.from(x).insert(n).select(S).single();if(i)throw i;return r}async function mt(e,n={}){let{data:r,error:i}=await t.from(x).update(n).eq(`id`,e).select(S).single();if(i)throw i;return r}async function ht(e){return mt(e,{estado:`cerrado`,requiere_seguimiento:!1})}async function gt(e){let{error:n}=await t.from(x).delete().eq(`id`,e);if(n)throw n;return!0}var C=ut,_t=C.getSeguimientos;C.getSeguimientosByAlumno;var vt=C.crearSeguimiento,yt=C.actualizarSeguimiento,bt=C.cerrarSeguimiento,xt=C.eliminarSeguimiento,w={llamada:{label:`Llamada`,icon:`bi-telephone`},whatsapp:{label:`WhatsApp`,icon:`bi-whatsapp`},correo:{label:`Correo`,icon:`bi-envelope`},reunion:{label:`Reunión`,icon:`bi-people`},otro:{label:`Otro`,icon:`bi-chat-dots`}},St={contactado:{label:`Contactado`,color:`success`},buzon_no_contesto:{label:`Buzón / No contestó`,color:`secondary`},reagendar:{label:`Reagendar`,color:`warning`},sin_interes:{label:`Sin interés`,color:`dark`},resuelto:{label:`Resuelto`,color:`primary`}};function Ct(e){if(e instanceof Date)return new Date(e);if(typeof e==`string`){let t=e.match(/^(\d{4})-(\d{2})-(\d{2})/);if(t)return new Date(Number(t[1]),Number(t[2])-1,Number(t[3]))}return new Date(e)}function wt(e){let t=Ct(e);return t.setHours(0,0,0,0),t}function Tt(e){return e?.proxima_fecha?wt(e.proxima_fecha):null}function Et(e){return e?.estado===`abierto`}function Dt(e,t=new Date){let n=Tt(e);return n?Math.round((n-wt(t))/864e5):null}function Ot(e=[],t=new Date){let n={vencidos:[],hoy:[],proximos:[]};for(let r of e){if(!Et(r)||!r?.requiere_seguimiento)continue;let e=Dt(r,t);e!==null&&(e<0?n.vencidos.push(r):e===0?n.hoy.push(r):n.proximos.push(r))}return n}var T={registros:[],filtroCanal:`todos`,filtroEstado:`abierto`},E=null;async function D(e){E?.abort(),E=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{T.registros=await _t(),kt(e)}catch(t){console.error(`[Seguimiento] Error:`,t),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar seguimiento</h5>
      <p>${A(t.message)}</p></div></div>`}return{teardown:()=>E?.abort()}}function kt(e){let t=Ot(T.registros),n=jt();e.innerHTML=`
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
            style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
            <i class="bi bi-telephone-outbound fs-4"></i>
          </div>
          <div>
            <h1 class="mb-0 h3">Seguimiento de Comunicaciones</h1>
            <p class="text-muted small mb-0">Registro de interacciones · agenda de próximos pasos</p>
          </div>
        </div>
        <button class="btn btn-primary" id="segNuevo"><i class="bi bi-plus-lg me-1"></i>Registrar interacción</button>
      </div>

      <!-- Agenda de follow-up -->
      <div class="row g-3 mb-4">
        ${O(`Vencidos`,t.vencidos,`danger`,`bi-exclamation-octagon`)}
        ${O(`Para hoy`,t.hoy,`warning`,`bi-calendar-day`)}
        ${O(`Próximos`,t.proximos,`info`,`bi-calendar-week`)}
      </div>

      <!-- Historial -->
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h6 class="fw-bold mb-0"><i class="bi bi-clock-history me-1"></i>Historial de interacciones</h6>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" id="segFiltroEstado" style="max-width:140px">
            <option value="todos" ${T.filtroEstado===`todos`?`selected`:``}>Todos</option>
            <option value="abierto" ${T.filtroEstado===`abierto`?`selected`:``}>Abiertos</option>
            <option value="cerrado" ${T.filtroEstado===`cerrado`?`selected`:``}>Cerrados</option>
          </select>
          <select class="form-select form-select-sm" id="segFiltroCanal" style="max-width:140px">
            <option value="todos">Todo canal</option>
            ${Object.entries(w).map(([e,t])=>`<option value="${e}" ${T.filtroCanal===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select>
        </div>
      </div>
      <div id="segLista">
        ${n.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay interacciones para este filtro</div>`:n.map(At).join(``)}
      </div>
    </div>
  `,Mt(e)}function O(e,t,n,r){return`
    <div class="col-md-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-${n} bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
          <span class="fw-bold text-${n}"><i class="bi ${r} me-1"></i>${e}</span>
          <span class="badge bg-${n}">${t.length}</span>
        </div>
        <div class="card-body p-2" style="max-height:240px;overflow-y:auto">
          ${t.length===0?`<p class="text-muted small text-center mb-0 py-3">Sin pendientes</p>`:t.map(e=>`
            <button class="btn btn-light btn-sm w-100 text-start mb-1 seg-agenda-item" data-id="${e.id}">
              <div class="fw-semibold small">${A(e.contacto_nombre||`Contacto`)}</div>
              <div class="text-muted extra-small">${A(e.proxima_accion||`Seguimiento`)}</div>
            </button>`).join(``)}
        </div>
      </div>
    </div>
  `}function At(e){let t=w[e.canal]||w.otro,n=St[e.resultado]||{label:e.resultado,color:`secondary`},r=e.requiere_seguimiento?Dt(e):null,i=r===null?`text-muted`:r<0?`text-danger`:r===0?`text-warning`:`text-muted`;return`
    <div class="card border-0 shadow-sm mb-2 seg-card" data-id="${e.id}">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="bi ${t.icon} text-primary"></i>
              <span class="fw-semibold">${A(e.contacto_nombre||`Contacto`)}</span>
              <span class="badge bg-${n.color} bg-opacity-75">${n.label}</span>
              ${e.estado===`cerrado`?`<span class="badge bg-secondary">Cerrado</span>`:``}
            </div>
            ${e.notas?`<p class="small text-secondary mb-1">${A(e.notas)}</p>`:``}
            ${e.requiere_seguimiento&&e.proxima_fecha?`<div class="small ${i}"><i class="bi bi-arrow-return-right"></i>
                    ${A(e.proxima_accion||`Seguimiento`)} · ${e.proxima_fecha}${r!==null&&r<0?` (vencido)`:r===0?` (hoy)`:``}</div>`:``}
          </div>
          <div class="text-end flex-shrink-0">
            <div class="text-muted extra-small mb-1">${new Date(e.fecha).toLocaleDateString(`es-DO`)}</div>
            <button class="btn btn-sm btn-outline-secondary seg-edit" data-id="${e.id}" title="Editar"><i class="bi bi-pencil"></i></button>
            ${e.estado===`abierto`?`<button class="btn btn-sm btn-outline-success seg-cerrar" data-id="${e.id}" title="Cerrar"><i class="bi bi-check2"></i></button>`:``}
          </div>
        </div>
      </div>
    </div>
  `}function jt(){let e=[...T.registros];return T.filtroEstado!==`todos`&&(e=e.filter(e=>e.estado===T.filtroEstado)),T.filtroCanal!==`todos`&&(e=e.filter(e=>e.canal===T.filtroCanal)),e}function Mt(e){let t=E.signal;e.querySelector(`#segNuevo`)?.addEventListener(`click`,()=>k(null,()=>D(e)),{signal:t}),e.querySelector(`#segFiltroEstado`)?.addEventListener(`change`,t=>{T.filtroEstado=t.target.value,kt(e)},{signal:t}),e.querySelector(`#segFiltroCanal`)?.addEventListener(`change`,t=>{T.filtroCanal=t.target.value,kt(e)},{signal:t});let r=t=>{let n=T.registros.find(e=>e.id===t);n&&k(n,()=>D(e))};e.querySelectorAll(`.seg-agenda-item, .seg-edit`).forEach(e=>e.addEventListener(`click`,()=>r(e.dataset.id),{signal:t})),e.querySelectorAll(`.seg-cerrar`).forEach(r=>r.addEventListener(`click`,async()=>{try{await bt(r.dataset.id),n.show(`Seguimiento cerrado`,`success`),D(e)}catch(e){n.show(`Error: ${e.message}`,`error`)}},{signal:t}))}function k(e,t,r=null){let a=!e,o=e||{alumno_id:r?.alumnoId||null,contacto_nombre:r?.alumno||r?.contactoNombre||``,contacto_telefono:r?.whatsapp||``,contacto_email:r?.email||``,canal:`llamada`,fecha:new Date().toISOString(),resultado:`contactado`,notas:``,requiere_seguimiento:!1,proxima_accion:``,proxima_fecha:``,estado:`abierto`},s=new Date().toISOString().slice(0,10);i.open({title:a?`Registrar interacción`:`Editar seguimiento`,size:`lg`,body:`
      <div class="row g-2 mb-2">
        <div class="col-md-6"><label class="form-label small fw-semibold">Contacto *</label>
          <input type="text" class="form-control form-control-sm" id="segNombre" value="${A(o.contacto_nombre||``)}"></div>
        <div class="col-md-6"><label class="form-label small fw-semibold">Teléfono</label>
          <input type="text" class="form-control form-control-sm" id="segTel" value="${A(o.contacto_telefono||``)}"></div>
      </div>
      <div class="row g-2 mb-2">
        <div class="col-md-4"><label class="form-label small fw-semibold">Canal</label>
          <select class="form-select form-select-sm" id="segCanal">
            ${Object.entries(w).map(([e,t])=>`<option value="${e}" ${o.canal===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Resultado</label>
          <select class="form-select form-select-sm" id="segResultado">
            ${Object.entries(St).map(([e,t])=>`<option value="${e}" ${o.resultado===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segFecha" value="${(o.fecha||``).slice(0,10)||s}"></div>
      </div>
      <div class="mb-2"><label class="form-label small fw-semibold">Notas (¿qué se habló? ¿en qué quedaron?)</label>
        <textarea class="form-control form-control-sm" id="segNotas" rows="3">${A(o.notas||``)}</textarea></div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="segReq" ${o.requiere_seguimiento?`checked`:``}>
        <label class="form-check-label small fw-semibold" for="segReq">Requiere seguimiento (agendar próxima acción)</label>
      </div>
      <div id="segProxWrap" class="row g-2 ${o.requiere_seguimiento?``:`d-none`}">
        <div class="col-md-8"><label class="form-label small">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="segProxAccion" value="${A(o.proxima_accion||``)}" placeholder="Ej. Volver a llamar para confirmar"></div>
        <div class="col-md-4"><label class="form-label small">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segProxFecha" value="${o.proxima_fecha||``}"></div>
      </div>
    `,saveText:a?`Registrar`:`Guardar`,deleteText:`Eliminar`,onDelete:a?null:async()=>{try{await xt(o.id),n.show(`Registro eliminado`,`success`),t?.()}catch(e){return n.show(`Error: ${e.message}`,`error`),!1}},onShow:e=>{e.querySelector(`#segReq`)?.addEventListener(`change`,t=>{e.querySelector(`#segProxWrap`).classList.toggle(`d-none`,!t.target.checked)})},onSave:async e=>{let r=e.querySelector(`#segNombre`).value.trim();if(!r)return n.show(`El contacto es obligatorio`,`error`),!1;let i=e.querySelector(`#segReq`).checked,c={alumno_id:o.alumno_id||null,contacto_nombre:r,contacto_telefono:e.querySelector(`#segTel`).value.trim()||null,contacto_email:o.contacto_email||null,canal:e.querySelector(`#segCanal`).value,resultado:e.querySelector(`#segResultado`).value,fecha:new Date(e.querySelector(`#segFecha`).value||s).toISOString(),notas:e.querySelector(`#segNotas`).value.trim()||null,requiere_seguimiento:i,proxima_accion:i&&e.querySelector(`#segProxAccion`).value.trim()||null,proxima_fecha:i&&e.querySelector(`#segProxFecha`).value||null};try{a?await vt(c):await yt(o.id,c),n.show(`Seguimiento guardado`,`success`),t?.()}catch(e){return n.show(`Error: ${e.message}`,`error`),!1}}})}function A(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}var j=[`{nombre_alumno}`,`{representante}`,`{instrumento}`,`{seccion}`],M={contactos:[],plantillas:[],tab:`directorio`,filtroFamilia:`todas`,busqueda:``,seleccion:new Set,canal:`whatsapp`,asunto:``,mensaje:``},N=null;async function Nt(e){N?.abort(),N=new AbortController,e.innerHTML=Pt();try{let[t,n]=await Promise.all([nt(),rt()]);M.contactos=t,M.plantillas=n,P(e)}catch(t){console.error(`[Comunicaciones] Error:`,t),e.innerHTML=`<div class="container mt-5"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar Comunicaciones</h5>
      <p>${R(t.message)}</p></div></div>`}return{teardown:()=>N?.abort()}}function Pt(){return`<div class="d-flex justify-content-center align-items-center" style="min-height:400px">
    <div class="text-center"><div class="spinner-border text-primary mb-3"></div>
    <p class="text-muted">Cargando central de comunicaciones...</p></div></div>`}function P(e){e.innerHTML=`
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
          <i class="bi bi-megaphone fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Central de Comunicaciones</h1>
          <p class="text-muted small mb-0">Directorio · WhatsApp · Correo · Plantillas · IA</p>
        </div>
      </div>

      <ul class="nav nav-pills comm-tabs mb-3">
        ${F(`directorio`,`bi-journal-text`,`Directorio`)}
        ${F(`compositor`,`bi-pencil-square`,`Compositor${M.seleccion.size?` (${M.seleccion.size})`:``}`)}
        ${F(`plantillas`,`bi-files`,`Plantillas`)}
      </ul>

      <div id="comm-body"></div>
    </div>
  `,e.querySelectorAll(`.comm-tab-btn`).forEach(t=>t.addEventListener(`click`,()=>{M.tab=t.dataset.tab,P(e)},{signal:N.signal})),Ft(e)}function F(e,t,n){return`<li class="nav-item"><button class="nav-link comm-tab-btn ${M.tab===e?`active`:``}" data-tab="${e}">
    <i class="bi ${t} me-1"></i>${n}</button></li>`}function Ft(e){let t=e.querySelector(`#comm-body`);M.tab===`directorio`?Lt(e,t):M.tab===`compositor`?L(e,t):Wt(e,t)}function It(){let e=[...M.contactos];if(M.filtroFamilia!==`todas`&&(e=e.filter(e=>e.familia===M.filtroFamilia)),M.busqueda){let t=M.busqueda.toLowerCase();e=e.filter(e=>(e.alumno||``).toLowerCase().includes(t)||(e.contactoNombre||``).toLowerCase().includes(t)||(e.instrumento||``).toLowerCase().includes(t))}return e}function Lt(e,t){let n=It(),r=Object.entries(Ge),i=e=>M.contactos.filter(t=>t.familia===e).length;t.innerHTML=`
    <div class="d-flex gap-2 flex-wrap mb-3 align-items-center">
      <input type="text" class="form-control form-control-sm" id="commBuscar" style="max-width:260px"
        placeholder="🔍 Buscar alumno, representante o instrumento" value="${R(M.busqueda)}">
      <button class="btn btn-sm ${M.filtroFamilia===`todas`?`btn-primary`:`btn-outline-secondary`} comm-fam" data-fam="todas">
        Todas (${M.contactos.length})
      </button>
      ${r.filter(([e])=>i(e)>0).map(([e,t])=>`<button class="btn btn-sm ${M.filtroFamilia===e?`btn-primary`:`btn-outline-secondary`} comm-fam" data-fam="${e}">
              <i class="bi ${t.icon} me-1"></i>${t.label} (${i(e)})
            </button>`).join(``)}
    </div>

    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="commSelAll">
        <label class="form-check-label small" for="commSelAll">Seleccionar los ${n.length} filtrados</label>
      </div>
      <div class="small text-muted">
        <span class="fw-bold text-primary">${M.seleccion.size}</span> seleccionados
        ${M.seleccion.size?`· <button class="btn btn-link btn-sm p-0 align-baseline" id="commClear">limpiar</button>`:``}
      </div>
    </div>

    <div class="table-responsive comm-table-wrap">
      <table class="table table-sm table-hover align-middle mb-0">
        <thead class="table-light"><tr>
          <th style="width:36px"></th><th>Alumno</th><th>Instrumento</th><th>Representante</th>
          <th>WhatsApp</th><th>Correo</th><th style="width:44px"></th>
        </tr></thead>
        <tbody>
          ${n.length===0?`<tr><td colspan="7" class="text-center text-muted py-4">Sin contactos para este filtro</td></tr>`:n.map(Rt).join(``)}
        </tbody>
      </table>
    </div>

    <div class="comm-sticky-actions mt-3">
      <button class="btn btn-primary" id="commToComposer" ${M.seleccion.size===0?`disabled`:``}>
        <i class="bi bi-pencil-square me-1"></i> Redactar a ${M.seleccion.size} contacto${M.seleccion.size===1?``:`s`}
      </button>
    </div>
  `;let a=N.signal;t.querySelector(`#commBuscar`)?.addEventListener(`input`,n=>{M.busqueda=n.target.value,Lt(e,t)},{signal:a}),t.querySelectorAll(`.comm-fam`).forEach(n=>n.addEventListener(`click`,()=>{M.filtroFamilia=n.dataset.fam,Lt(e,t)},{signal:a}));let o=n.length>0&&n.every(e=>M.seleccion.has(e.alumnoId)),s=t.querySelector(`#commSelAll`);s&&(s.checked=o),s?.addEventListener(`change`,t=>{n.forEach(e=>t.target.checked?M.seleccion.add(e.alumnoId):M.seleccion.delete(e.alumnoId)),P(e)},{signal:a}),t.querySelector(`#commClear`)?.addEventListener(`click`,()=>{M.seleccion.clear(),P(e)},{signal:a}),t.querySelectorAll(`.comm-row-check`).forEach(t=>t.addEventListener(`change`,n=>{n.target.checked?M.seleccion.add(t.dataset.id):M.seleccion.delete(t.dataset.id),P(e)},{signal:a})),t.querySelector(`#commToComposer`)?.addEventListener(`click`,()=>{M.tab=`compositor`,P(e)},{signal:a}),t.querySelectorAll(`.comm-seg-btn`).forEach(e=>e.addEventListener(`click`,()=>{let t=M.contactos.find(t=>t.alumnoId===e.dataset.id);t&&k(null,null,t)},{signal:a}))}function Rt(e){let t=y(e.whatsapp);return`<tr>
    <td><input class="form-check-input comm-row-check" type="checkbox" data-id="${e.alumnoId}" ${M.seleccion.has(e.alumnoId)?`checked`:``}></td>
    <td class="fw-semibold">${R(e.alumno||``)}</td>
    <td><span class="badge bg-light text-dark border">${R(e.instrumento||`—`)}</span></td>
    <td class="small">${R(e.contactoNombre||``)}</td>
    <td class="small">${t?`<i class="bi bi-whatsapp text-success"></i> ${R(e.whatsapp)}`:`<span class="text-muted">—</span>`}</td>
    <td class="small">${e.email?`<i class="bi bi-envelope text-primary"></i> ${R(e.email)}`:`<span class="text-muted">—</span>`}</td>
    <td><button class="btn btn-sm btn-outline-primary comm-seg-btn" data-id="${e.alumnoId}" title="Registrar seguimiento"><i class="bi bi-telephone-plus"></i></button></td>
  </tr>`}function I(){return M.contactos.filter(e=>M.seleccion.has(e.alumnoId))}function L(e,t){let n=I();if(n.length===0){t.innerHTML=`<div class="alert alert-info"><i class="bi bi-info-circle me-1"></i>
      No hay destinatarios. Andá al <button class="btn btn-link btn-sm p-0 align-baseline" id="commGoDir">Directorio</button> y seleccioná contactos.</div>`,t.querySelector(`#commGoDir`)?.addEventListener(`click`,()=>{M.tab=`directorio`,P(e)},{signal:N.signal});return}let r=n.filter(e=>y(e.whatsapp)).length,i=n.filter(e=>e.email).length,a=M.plantillas;t.innerHTML=`
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="btn-group mb-3" role="group">
              <button class="btn btn-sm ${M.canal===`whatsapp`?`btn-success`:`btn-outline-success`} comm-canal" data-canal="whatsapp">
                <i class="bi bi-whatsapp me-1"></i>WhatsApp (${r})
              </button>
              <button class="btn btn-sm ${M.canal===`email`?`btn-primary`:`btn-outline-primary`} comm-canal" data-canal="email">
                <i class="bi bi-envelope me-1"></i>Correo (${i})
              </button>
            </div>

            <div class="mb-2">
              <label class="form-label small fw-semibold d-flex justify-content-between">
                <span>Plantilla</span>
                <span class="text-muted">Variables: insertá con los botones</span>
              </label>
              <select class="form-select form-select-sm mb-2" id="commTpl">
                <option value="">— Sin plantilla (escribir desde cero) —</option>
                ${a.map(e=>`<option value="${e.id}">${R(e.nombre)} · ${R(e.tipo||``)}</option>`).join(``)}
              </select>
            </div>

            ${M.canal===`email`?`<div class="mb-2"><input type="text" class="form-control form-control-sm" id="commAsunto"
                     placeholder="Asunto del correo" value="${R(M.asunto)}"></div>`:``}

            <div class="mb-2 d-flex flex-wrap gap-1">
              ${j.map(e=>`<button class="btn btn-outline-secondary btn-sm py-0 comm-var" data-var="${e}">${e}</button>`).join(``)}
            </div>

            <textarea class="form-control" id="commMsg" rows="8" placeholder="Escribí el mensaje...">${R(M.mensaje)}</textarea>

            <div class="d-flex gap-2 mt-2 flex-wrap">
              <button class="btn btn-sm btn-outline-primary" id="commIA">
                <i class="bi bi-stars me-1"></i>Mejorar con IA
              </button>
              <button class="btn btn-sm btn-outline-secondary" id="commIAOpts">
                <i class="bi bi-sliders me-1"></i>Ajustar tono…
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="fw-bold mb-2"><i class="bi bi-people me-1"></i>${n.length} destinatarios</h6>
            <div class="comm-recipients mb-3">
              ${n.slice(0,40).map(e=>`<span class="badge bg-light text-dark border me-1 mb-1">${R(e.alumno)}</span>`).join(``)}
              ${n.length>40?`<span class="badge bg-secondary">+${n.length-40} más</span>`:``}
            </div>
            <div id="commActionZone"></div>
          </div>
        </div>
      </div>
    </div>
  `;let o=N.signal;t.querySelectorAll(`.comm-canal`).forEach(n=>n.addEventListener(`click`,()=>{M.canal=n.dataset.canal,L(e,t)},{signal:o}));let s=t.querySelector(`#commMsg`);s?.addEventListener(`input`,e=>{M.mensaje=e.target.value},{signal:o}),t.querySelector(`#commAsunto`)?.addEventListener(`input`,e=>{M.asunto=e.target.value},{signal:o}),t.querySelector(`#commTpl`)?.addEventListener(`change`,n=>{let r=M.plantillas.find(e=>e.id===n.target.value);r&&(M.mensaje=r.contenido||``,L(e,t))},{signal:o}),t.querySelectorAll(`.comm-var`).forEach(e=>e.addEventListener(`click`,()=>{qt(s,e.dataset.var),M.mensaje=s.value},{signal:o})),t.querySelector(`#commIA`)?.addEventListener(`click`,()=>Ht(e,t,``),{signal:o}),t.querySelector(`#commIAOpts`)?.addEventListener(`click`,()=>Ut(e,t),{signal:o}),zt(e,t)}function zt(e,t){let n=t.querySelector(`#commActionZone`);if(!n)return;let r=I();if(M.canal===`whatsapp`)n.innerHTML=`
      <button class="btn btn-success w-100" id="commGenWa">
        <i class="bi bi-whatsapp me-1"></i>Generar links de WhatsApp
      </button>
      <p class="text-muted small mt-2 mb-0">Se abre un link por contacto con el mensaje pre-cargado (personalizado con sus variables). Hacés clic y se envía desde tu WhatsApp.</p>
      <div id="commWaLinks" class="mt-2"></div>
    `,t.querySelector(`#commGenWa`)?.addEventListener(`click`,()=>Bt(t),{signal:N.signal});else{let e=r.filter(e=>e.email);n.innerHTML=`
      <button class="btn btn-primary w-100" id="commSendMail" ${e.length===0?`disabled`:``}>
        <i class="bi bi-send me-1"></i>Enviar a ${e.length} correo${e.length===1?``:`s`}
      </button>
      <p class="text-muted small mt-2 mb-0">El correo va por la fundación (Resend). Los destinatarios van en copia oculta (bcc).</p>
    `,t.querySelector(`#commSendMail`)?.addEventListener(`click`,()=>Vt(t),{signal:N.signal})}}function Bt(e){let t=I().filter(e=>y(e.whatsapp)),n=e.querySelector(`#commWaLinks`);if(t.length===0){n.innerHTML=`<div class="alert alert-warning small mb-0">Ningún destinatario tiene un WhatsApp válido.</div>`;return}n.innerHTML=`
    <div class="d-grid gap-1 comm-wa-list">
      ${t.map(e=>`<a href="${qe(e.whatsapp,Je(M.mensaje,e))}" target="_blank" rel="noopener" class="btn btn-outline-success btn-sm text-start">
            <i class="bi bi-whatsapp me-1"></i>${R(e.alumno)} <span class="text-muted">— ${R(e.contactoNombre)}</span>
          </a>`).join(``)}
    </div>
    <button class="btn btn-link btn-sm mt-1 p-0" id="commWaAll">Abrir todos (puede bloquear el navegador)</button>
  `,e.querySelector(`#commWaAll`)?.addEventListener(`click`,()=>{t.forEach(e=>window.open(qe(e.whatsapp,Je(M.mensaje,e)),`_blank`,`noopener`))},{signal:N.signal})}async function Vt(e){let t=I().filter(e=>e.email),r=M.asunto.trim(),i=M.mensaje.trim();if(!r){n.show(`Falta el asunto del correo`,`error`);return}if(!i){n.show(`El mensaje está vacío`,`error`);return}let a=e.querySelector(`#commSendMail`),o=a.innerHTML;a.disabled=!0,a.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Enviando...`;try{let e=Jt(Je(i,t[0])),a=await ot({to:t.map(e=>e.email),subject:r,html:e});n.show(`Correo enviado a ${a.enviados} de ${a.total} destinatarios`,a.fallidos?`warning`:`success`)}catch(e){n.show(`Error: ${e.message}`,`error`)}finally{a.disabled=!1,a.innerHTML=o}}async function Ht(e,t,r){let i=M.mensaje.trim();if(!i){n.show(`Escribí algo primero para mejorarlo`,`error`);return}let a=t.querySelector(`#commIA`),o=a?.innerHTML;a&&(a.disabled=!0,a.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Mejorando...`);try{M.mensaje=await ct(i,r),L(e,t),n.show(`Mensaje mejorado con IA`,`success`)}catch(e){n.show(`IA no disponible: ${e.message}`,`error`),a&&o&&(a.disabled=!1,a.innerHTML=o)}}function Ut(e,t){i.open({title:`Ajustar tono con IA`,body:`
      <p class="small text-muted">Elegí cómo querés que la IA reescriba el mensaje:</p>
      <div class="d-grid gap-2">
        ${[`Más formal`,`Más cálido y cercano`,`Más corto y directo`,`Más motivador`,`Corregir ortografía y gramática`].map(e=>`<button class="btn btn-outline-primary comm-tono" data-tono="${e}">${e}</button>`).join(``)}
      </div>`,hideSave:!0,cancelText:`Cerrar`}),setTimeout(()=>{document.querySelectorAll(`.comm-tono`).forEach(n=>n.addEventListener(`click`,()=>{i.close(),Ht(e,t,n.dataset.tono)},{once:!0}))},50)}function Wt(e,t){t.innerHTML=`
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted small mb-0">Plantillas reutilizables para mensajes y correos. Usá variables como {nombre_alumno}.</p>
      <button class="btn btn-primary btn-sm" id="commNewTpl"><i class="bi bi-plus-lg me-1"></i>Nueva plantilla</button>
    </div>
    <div class="row g-2">
      ${M.plantillas.length===0?`<div class="col-12"><div class="alert alert-info">Aún no hay plantillas.</div></div>`:M.plantillas.map(Gt).join(``)}
    </div>
  `;let n=N.signal;t.querySelector(`#commNewTpl`)?.addEventListener(`click`,()=>Kt(e,null),{signal:n}),t.querySelectorAll(`.comm-tpl-edit`).forEach(t=>t.addEventListener(`click`,()=>Kt(e,M.plantillas.find(e=>e.id===t.dataset.id)),{signal:n})),t.querySelectorAll(`.comm-tpl-use`).forEach(t=>t.addEventListener(`click`,()=>{M.mensaje=M.plantillas.find(e=>e.id===t.dataset.id)?.contenido||``,M.tab=`compositor`,P(e)},{signal:n}))}function Gt(e){return`<div class="col-md-6 col-xl-4">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="fw-bold mb-1">${R(e.nombre)}</h6>
          <span class="badge bg-light text-dark border">${R(e.tipo||`mensaje`)}</span>
        </div>
        <p class="text-muted small mb-2">${R(e.descripcion||``)}</p>
        <p class="small comm-tpl-preview">${R((e.contenido||``).slice(0,120))}${(e.contenido||``).length>120?`…`:``}</p>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary comm-tpl-use" data-id="${e.id}"><i class="bi bi-pencil-square me-1"></i>Usar</button>
          <button class="btn btn-sm btn-outline-secondary comm-tpl-edit" data-id="${e.id}"><i class="bi bi-gear"></i></button>
        </div>
      </div>
    </div>
  </div>`}function Kt(e,t){let r=!t;i.open({title:r?`Nueva plantilla`:`Editar plantilla`,size:`lg`,body:`
      <div class="mb-2"><label class="form-label small fw-semibold">Nombre *</label>
        <input type="text" class="form-control form-control-sm" id="tplNombre" value="${R(t?.nombre||``)}"></div>
      <div class="row g-2 mb-2">
        <div class="col-6"><label class="form-label small fw-semibold">Tipo</label>
          <select class="form-select form-select-sm" id="tplTipo">
            ${[`mensaje`,`correo`,`carta`].map(e=>`<option value="${e}" ${t?.tipo===e?`selected`:``}>${e}</option>`).join(``)}
          </select></div>
        <div class="col-6"><label class="form-label small fw-semibold">Descripción</label>
          <input type="text" class="form-control form-control-sm" id="tplDesc" value="${R(t?.descripcion||``)}"></div>
      </div>
      <div class="mb-1"><label class="form-label small fw-semibold">Contenido</label>
        <div class="mb-1 d-flex flex-wrap gap-1">
          ${j.map(e=>`<button type="button" class="btn btn-outline-secondary btn-sm py-0 tplVar" data-var="${e}">${e}</button>`).join(``)}
        </div>
        <textarea class="form-control" id="tplContenido" rows="6">${R(t?.contenido||``)}</textarea>
      </div>
    `,saveText:r?`Crear`:`Guardar`,deleteText:`Eliminar`,onDelete:r?null:async()=>{try{await at(t.id),M.plantillas=M.plantillas.filter(e=>e.id!==t.id),n.show(`Plantilla eliminada`,`success`),P(e)}catch(e){return n.show(`Error: ${e.message}`,`error`),!1}},onSave:async r=>{let i=r.querySelector(`#tplNombre`).value.trim();if(!i)return n.show(`El nombre es obligatorio`,`error`),!1;let a={id:t?.id,nombre:i,tipo:r.querySelector(`#tplTipo`).value,descripcion:r.querySelector(`#tplDesc`).value.trim(),contenido:r.querySelector(`#tplContenido`).value,variables:j.filter(e=>r.querySelector(`#tplContenido`).value.includes(e)).map(e=>e.replace(/[{}]/g,``))};try{let t=await it(a),r=M.plantillas.findIndex(e=>e.id===t.id);r>=0?M.plantillas[r]=t:M.plantillas.push(t),n.show(`Plantilla guardada`,`success`),P(e)}catch(e){return n.show(`Error: ${e.message}`,`error`),!1}}}),setTimeout(()=>{document.querySelectorAll(`.tplVar`).forEach(e=>e.addEventListener(`click`,()=>{qt(document.querySelector(`#tplContenido`),e.dataset.var)}))},50)}function qt(e,t){if(!e)return;let n=e.selectionStart??e.value.length,r=e.selectionEnd??e.value.length;e.value=e.value.slice(0,n)+t+e.value.slice(r),e.focus(),e.selectionStart=e.selectionEnd=n+t.length}function Jt(e){return`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1f2937">
    ${R(e).replace(/\n/g,`<br>`)}
  </div>`}function R(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function z(e,t=18){let n=new Date;return n.setDate(n.getDate()+e),n.setHours(t,0,0,0),n.toISOString()}z(12),z(12,21),z(3,8),z(20,17),z(8,15),z(8,18),z(5,10),z(5,12),z(25,9),z(25,10);var Yt=e({getEventos:()=>Qt}),Xt=`calendario_institucional`,Zt=`id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, departamento_responsable, estado`;async function Qt(e={}){let n=e.desde||new Date().toISOString(),r=e.dias??120,i=new Date(new Date(n).getTime()+r*864e5).toISOString(),a=t.from(Xt).select(Zt).gte(`fecha_inicio`,n).lte(`fecha_inicio`,i);e.categoria&&e.categoria!==`todas`&&(a=a.eq(`categoria`,e.categoria));let{data:o,error:s}=await a.order(`fecha_inicio`,{ascending:!0});if(s)throw s;return o||[]}var $t=Yt.getEventos,B={concierto:{label:`Concierto`,icon:`bi-music-note-beamed`,color:`primary`},ensayo:{label:`Ensayo`,icon:`bi-music-note`,color:`info`},reunion:{label:`Reunión`,icon:`bi-people`,color:`secondary`},patrocinio:{label:`Patrocinio`,icon:`bi-gift`,color:`success`},pago:{label:`Pago`,icon:`bi-cash-coin`,color:`warning`},corte:{label:`Corte`,icon:`bi-scissors`,color:`dark`},inscripcion:{label:`Inscripción`,icon:`bi-person-plus`,color:`primary`},auditoria:{label:`Auditoría`,icon:`bi-shield-check`,color:`secondary`},otro:{label:`Otro`,icon:`bi-calendar-event`,color:`secondary`}},en=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`];function tn(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function V(e,t=new Date){return e?.fecha_inicio?Math.round((tn(e.fecha_inicio)-tn(t))/864e5):null}function nn(e,t=30,n=new Date){let r=V(e,n);return r!==null&&r>=0&&r<=t}function rn(e=[]){let t=new Map;for(let n of e){if(!n?.fecha_inicio)continue;let e=new Date(n.fecha_inicio),r=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}`;t.has(r)||t.set(r,{clave:r,label:`${en[e.getMonth()]} ${e.getFullYear()}`,eventos:[]}),t.get(r).eventos.push(n)}let n=[...t.values()].sort((e,t)=>e.clave.localeCompare(t.clave));for(let e of n)e.eventos.sort((e,t)=>new Date(e.fecha_inicio)-new Date(t.fecha_inicio));return n}var H={eventos:[],filtroCategoria:`todas`},U=null;async function an(e){U?.abort(),U=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{H.eventos=await $t({dias:120}),on(e)}catch(t){console.error(`[CalendarioCom] Error:`,t),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar el calendario</h5>
      <p>${W(t.message)}</p></div></div>`}return{teardown:()=>U?.abort()}}function on(e){let t=rn(H.filtroCategoria===`todas`?H.eventos:H.eventos.filter(e=>e.categoria===H.filtroCategoria)),n=H.eventos.filter(e=>nn(e,7)).length,r=H.eventos.filter(e=>nn(e,30)).length,i=H.eventos.find(e=>e.categoria===`concierto`&&V(e)>=0),a=[...new Set(H.eventos.map(e=>e.categoria))];e.innerHTML=`
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
          <i class="bi bi-calendar-week fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Calendario de Comunicación</h1>
          <p class="text-muted small mb-0">Eventos, ciclos y temporadas · lente sobre el calendario institucional</p>
        </div>
      </div>

      <div class="tareas-kpis d-flex gap-2 flex-wrap mb-3">
        ${sn(`Próximos 7 días`,n,`danger`)}
        ${sn(`Próximos 30 días`,r,`warning`)}
        ${sn(`Total en agenda`,H.eventos.length,`primary`)}
        ${i?`<div class="kpi-card bg-info bg-opacity-10 p-2 rounded">
                 <small class="text-muted">Próximo concierto</small>
                 <div class="fw-bold text-info">${V(i)} día${V(i)===1?``:`s`}</div>
               </div>`:``}
      </div>

      <div class="d-flex gap-2 flex-wrap mb-3">
        <button class="btn btn-sm ${H.filtroCategoria===`todas`?`btn-primary`:`btn-outline-secondary`} cal-cat" data-cat="todas">Todas</button>
        ${a.map(e=>{let t=B[e]||B.otro;return`<button class="btn btn-sm ${H.filtroCategoria===e?`btn-primary`:`btn-outline-secondary`} cal-cat" data-cat="${e}">
              <i class="bi ${t.icon} me-1"></i>${t.label}</button>`}).join(``)}
      </div>

      <div id="calAgenda">
        ${t.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-calendar-x"></i> No hay eventos próximos para este filtro</div>`:t.map(cn).join(``)}
      </div>
    </div>
  `;let o=U.signal;e.querySelectorAll(`.cal-cat`).forEach(t=>t.addEventListener(`click`,()=>{H.filtroCategoria=t.dataset.cat,on(e)},{signal:o}))}function sn(e,t,n){return`<div class="kpi-card bg-${n} bg-opacity-10 p-2 rounded">
    <small class="text-muted">${e}</small>
    <div class="fs-5 fw-bold text-${n}">${t}</div>
  </div>`}function cn(e){return`
    <div class="mb-4">
      <h6 class="fw-bold text-uppercase small text-muted mb-2 border-bottom pb-1">${W(e.label)}</h6>
      ${e.eventos.map(ln).join(``)}
    </div>
  `}function ln(e){let t=B[e.categoria]||B.otro,n=V(e),r=new Date(e.fecha_inicio),i=r.toLocaleDateString(`es-DO`,{weekday:`short`,day:`2-digit`,month:`short`}),a=r.toLocaleTimeString(`es-DO`,{hour:`2-digit`,minute:`2-digit`}),o=n===0?`Hoy`:n===1?`Mañana`:n>0?`En ${n} días`:`Pasado`;return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">
          <div class="text-center flex-shrink-0" style="width:54px">
            <div class="badge bg-${t.color} bg-opacity-10 text-${t.color} border border-${t.color}-subtle w-100 py-1">
              <i class="bi ${t.icon}"></i>
            </div>
            <div class="extra-small text-muted mt-1">${o}</div>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold">${W(e.titulo)}</div>
            <div class="small text-secondary">${W(e.descripcion||``)}</div>
            <div class="d-flex flex-wrap gap-3 mt-1 small text-muted">
              <span><i class="bi bi-calendar3 me-1"></i>${i} · ${a}</span>
              ${e.ubicacion&&e.ubicacion!==`—`?`<span><i class="bi bi-geo-alt me-1"></i>${W(e.ubicacion)}</span>`:``}
              <span><i class="bi bi-building me-1"></i>${W(e.departamento_responsable||``)}</span>
              <span class="badge bg-${t.color} bg-opacity-75">${t.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function W(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function un(){f.register(`comunicaciones`,e=>Nt(e)),f.register(`com-seguimiento`,e=>D(e)),f.register(`com-calendario`,e=>an(e))}var G=(e,t)=>({id:`mock-dep-${e.toLowerCase()}`,codigo:e,nombre:t,descripcion:null,email:null,responsable_nombre:null,responsable_email:null,activo:!0,updated_at:new Date().toISOString()});G(`DIR`,`Dirección`),G(`ACM`,`Académica`),G(`ADM`,`Administración`),G(`FIN`,`Financiero`),G(`COM`,`Comunicaciones`),G(`LOG`,`Logística`),G(`TECNICO`,`Técnico`);var dn=e({actualizarDepartamento:()=>hn,enviarCorreoPrueba:()=>gn,getDepartamentos:()=>mn}),fn=`departamentos`,pn=`id, codigo, nombre, descripcion, email, responsable_nombre, responsable_email, activo, updated_at`;async function mn(){let{data:e,error:n}=await t.from(fn).select(pn).order(`codigo`,{ascending:!0});if(n)throw n;return e||[]}async function hn(e,n={}){let r={};n.nombre!==void 0&&(r.nombre=n.nombre),n.email!==void 0&&(r.email=n.email||null),n.responsable_nombre!==void 0&&(r.responsable_nombre=n.responsable_nombre||null),n.responsable_email!==void 0&&(r.responsable_email=n.responsable_email||null),n.activo!==void 0&&(r.activo=n.activo),r.updated_at=new Date().toISOString();let{data:i,error:a}=await t.from(fn).update(r).eq(`id`,e).select(pn).single();if(a)throw a;return i}async function gn(e,n=``){let{data:r,error:i}=await t.functions.invoke(`send-email`,{body:{to:e,subject:`Correo de prueba — Departamento ${n}`.trim(),html:`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#1f2937">
        <p>Este es un <strong>correo de prueba</strong> del SOI (El Sistema Punta Cana).</p>
        <p>Si lo recibís, la casilla del departamento <strong>${_n(n)}</strong> está configurada correctamente
        y Hermes podrá despachar correos a este destino. 🎻</p>
      </div>`}});if(i){let e=i.message;try{let t=await i.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e)}if(r&&r.ok===!1&&r.enviados===0)throw Error(r.batches?.[0]?.error||`No se pudo enviar el correo de prueba`);return r}function _n(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var vn=dn,yn=vn.getDepartamentos,bn=vn.actualizarDepartamento,xn=vn.enviarCorreoPrueba,Sn=/^[^@\s]+@[^@\s]+\.[^@\s]+$/,K=null;async function Cn(e){K?.abort(),K=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{wn(e,await yn())}catch(t){console.error(`[Departamentos] Error:`,t),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar departamentos</h5>
      <p>${q(t.message)}</p></div></div>`}return{teardown:()=>K?.abort()}}function wn(e,t){let n=t.filter(e=>!e.email).length;e.innerHTML=`
    <div class="page-container" style="max-width:960px;margin:0 auto;padding:1.25rem">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(124,58,237,0.1);color:#7c3aed">
          <i class="bi bi-envelope-at fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Correos de Departamentos</h1>
          <p class="text-muted small mb-0">Correo institucional y responsable de cada departamento. Hermes los usa para despachar mensajes.</p>
        </div>
      </div>

      ${n>0?`<div class="alert alert-warning small py-2"><i class="bi bi-exclamation-triangle me-1"></i>
              ${n} departamento${n===1?``:`s`} sin correo definido. Hermes no podrá enviarles hasta cargarlo.</div>`:`<div class="alert alert-success small py-2"><i class="bi bi-check-circle me-1"></i>
              Todos los departamentos tienen correo configurado.</div>`}

      <div class="row g-3">
        ${t.map(Tn).join(``)}
      </div>
    </div>
  `,En(e,t)}function Tn(e){return`
    <div class="col-12 col-lg-6">
      <div class="card border-0 shadow-sm h-100 dep-card" data-id="${e.id}">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary">${q(e.codigo)}</span>
              <input type="text" class="form-control form-control-sm dep-nombre" style="max-width:200px"
                value="${q(e.nombre||``)}">
            </div>
            <div class="form-check form-switch m-0" title="Activo">
              <input class="form-check-input dep-activo" type="checkbox" ${e.activo?`checked`:``}>
            </div>
          </div>

          <label class="form-label small fw-semibold mb-1">Correo institucional</label>
          <input type="email" class="form-control form-control-sm mb-2 dep-email"
            placeholder="ej. finanzas@funeyca.org" value="${q(e.email||``)}">

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Responsable</label>
              <input type="text" class="form-control form-control-sm dep-resp-nombre"
                placeholder="Nombre" value="${q(e.responsable_nombre||``)}">
            </div>
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Correo responsable</label>
              <input type="email" class="form-control form-control-sm dep-resp-email"
                placeholder="opcional" value="${q(e.responsable_email||``)}">
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-primary dep-save" data-id="${e.id}">
              <i class="bi bi-check-lg me-1"></i>Guardar
            </button>
            <button class="btn btn-sm btn-outline-secondary dep-test" data-id="${e.id}" data-codigo="${q(e.codigo)}"
              ${e.email?``:`disabled`} title="${e.email?`Enviar correo de prueba`:`Cargá un correo primero`}">
              <i class="bi bi-send me-1"></i>Probar
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function En(e,t){let n=K.signal;e.querySelectorAll(`.dep-save`).forEach(r=>r.addEventListener(`click`,()=>Dn(e,t,r),{signal:n})),e.querySelectorAll(`.dep-test`).forEach(t=>t.addEventListener(`click`,()=>On(e,t),{signal:n}))}async function Dn(e,t,r){let i=r.closest(`.dep-card`),a=i.querySelector(`.dep-nombre`).value.trim(),o=i.querySelector(`.dep-email`).value.trim(),s=i.querySelector(`.dep-resp-nombre`).value.trim(),c=i.querySelector(`.dep-resp-email`).value.trim(),l=i.querySelector(`.dep-activo`).checked;if(!a){n.show(`El nombre es obligatorio`,`error`);return}if(o&&!Sn.test(o)){n.show(`El correo institucional no es válido`,`error`);return}if(c&&!Sn.test(c)){n.show(`El correo del responsable no es válido`,`error`);return}let u=r.innerHTML;r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;try{let i=await bn(r.dataset.id,{nombre:a,email:o,activo:l,responsable_nombre:s,responsable_email:c}),u=t.findIndex(e=>e.id===i.id);u>=0&&(t[u]=i),n.show(`${i.codigo} actualizado`,`success`),wn(e,t)}catch(e){n.show(`Error: ${e.message}`,`error`),r.disabled=!1,r.innerHTML=u}}async function On(e,t){let r=t.closest(`.dep-card`).querySelector(`.dep-email`).value.trim();if(!r||!Sn.test(r)){n.show(`Cargá un correo válido antes de probar`,`error`);return}let i=t.innerHTML;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;try{await xn(r,t.dataset.codigo),n.show(`Correo de prueba enviado a ${r}`,`success`)}catch(e){n.show(`No se pudo enviar: ${e.message}`,`error`)}finally{t.disabled=!1,t.innerHTML=i}}function q(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function kn(){f.register(`departamentos`,e=>Cn(e))}async function An(){let{data:e,error:n}=await t.from(`campanias_periodo`).select(`*`).order(`created_at`,{ascending:!1});if(n)throw n;return e??[]}async function jn(e){let{data:n,error:r}=await t.from(`campanias_periodo`).insert(e).select().single();if(r)throw r;return n}async function Mn(e,n){let{data:r,error:i}=await t.from(`campanias_periodo`).update({...n,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}async function Nn(e){return Mn(e,{activo:!1})}async function Pn(e){let{data:n,error:r}=await t.rpc(`fn_preview_campania`,{p_id:e});if(r)throw r;return n}async function Fn(e){let{data:n,error:r}=await t.rpc(`fn_activar_campania`,{p_id:e});if(r)throw r;return n}async function In(e,n=null){let{data:r,error:i}=await t.rpc(`fn_encolar_campania`,{p_campania_id:e,p_limite:n});if(i)throw i;return r}var J={campanias:[],seleccionada:null,preview:null,cargando:!1},Ln={inscripcion:`Inscripción`,reinscripcion:`Reinscripción`};async function Rn(e){await Y(e)}async function Y(e){try{zn(e),J.campanias=await An(),X(e)}catch(t){Bn(e,t.message)}}function zn(e){e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <h1 class="h3 fw-bold mb-4">Períodos / Campañas</h1>
      <div class="d-flex justify-content-center py-5"><div class="spinner-border text-primary"></div></div>
    </div>`}function Bn(e,t){e.innerHTML=`
    <div class="container py-5 text-center">
      <div class="alert alert-danger border-0 shadow-sm p-4 rounded-3">
        <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
        <h4 class="fw-bold">Error al cargar campañas</h4>
        <p>${Z(t)}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-retry">Reintentar</button>
      </div>
    </div>`,document.getElementById(`btn-retry`)?.addEventListener(`click`,()=>Rn(e))}function X(e){let t=J.campanias.find(e=>e.id===J.seleccionada)||null;e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 class="h3 fw-bold mb-1">Períodos / Campañas</h1>
          <p class="text-body-secondary mb-0 small">Inscripción y reinscripción · activación con previsualización</p>
        </div>
      </div>

      <div class="alert alert-warning border-0 shadow-sm small d-flex align-items-start gap-2" role="alert">
        <i class="bi bi-shield-exclamation fs-5"></i>
        <div>El envío real está <strong>bloqueado</strong> hasta el módulo anti-ban. Activar una campaña
        <strong>materializa la audiencia</strong> (deduplicada y trazable), pero <strong>no manda WhatsApps</strong>.</div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-7">
          ${Vn()}
        </div>
        <div class="col-12 col-lg-5">
          ${Hn()}
          ${t?Un(t):``}
        </div>
      </div>
    </div>`,Wn(e)}function Vn(){return J.campanias.length===0?`<div class="card border-0 shadow-sm rounded-3"><div class="card-body text-body-secondary text-center py-5">
      <i class="bi bi-megaphone fs-1 d-block mb-2 opacity-50"></i>No hay campañas. Creá una a la derecha.</div></div>`:`<div class="card border-0 shadow-sm rounded-3 overflow-hidden">
    <div class="list-group list-group-flush">${J.campanias.map(e=>{let t=e.activo,n=e.id===J.seleccionada;return`
      <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2 ${n?`active`:``}" data-sel="${e.id}">
        <span class="text-truncate">
          <span class="fw-semibold">${Z(e.nombre)}</span>
          <span class="badge text-bg-secondary ms-1">${Ln[e.accion]||e.accion} ${Z(e.tipo)}</span>
          <br><small class="${n?``:`text-body-secondary`}">${Z(e.fecha_inicio)} → ${Z(e.fecha_fin)}</small>
        </span>
        <span class="badge rounded-pill ${t?`text-bg-success`:`text-bg-light`}">${t?`Activa`:`Inactiva`}</span>
      </button>`}).join(``)}</div></div>`}function Hn(){return`
    <div class="card border-0 shadow-sm rounded-3 mb-3">
      <div class="card-body">
        <h2 class="h6 fw-bold mb-3"><i class="bi bi-plus-circle me-1"></i>Nueva campaña</h2>
        <form id="form-campania" class="row g-2">
          <div class="col-12">
            <input class="form-control form-control-sm" name="nombre" placeholder="Nombre (ej: Inscripción A 2026)" required>
          </div>
          <div class="col-6">
            <select class="form-select form-select-sm" name="accion" required>
              <option value="inscripcion">Inscripción</option>
              <option value="reinscripcion">Reinscripción</option>
            </select>
          </div>
          <div class="col-6">
            <select class="form-select form-select-sm" name="tipo" required>
              <option value="A">Semestre A</option>
              <option value="B">Semestre B</option>
            </select>
          </div>
          <div class="col-6">
            <input type="date" class="form-control form-control-sm" name="fecha_inicio" required>
          </div>
          <div class="col-6">
            <input type="date" class="form-control form-control-sm" name="fecha_fin" required>
          </div>
          <div class="col-12">
            <button class="btn btn-sm btn-primary rounded-pill px-3 w-100" type="submit">Crear campaña</button>
          </div>
        </form>
      </div>
    </div>`}function Un(e){let t=J.preview,n;if(J.cargando)n=`<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>`;else if(!t)n=`<p class="text-body-secondary small mb-0">Previsualizá la audiencia antes de activar.</p>`;else if(t.accion===`inscripcion`){let e=t.primer_contacto+t.recuperacion>t.cupo_disponible;n=`
      <ul class="list-unstyled small mb-2">
        <li>• Primer contacto: <strong>${t.primer_contacto}</strong></li>
        <li>• Recuperación: <strong>${t.recuperacion}</strong></li>
        <li class="text-body-secondary">• Sin teléfono: ${t.sin_telefono}</li>
        <li>• Cupo disponible: <strong>${t.cupo_disponible}</strong> / ${t.cupo_total}</li>
      </ul>
      ${e?`<div class="alert alert-warning py-2 px-2 small mb-2">⚠️ La audiencia supera el cupo disponible. Abrí otro grupo de Iniciación Musical o enviá en tandas.</div>`:``}`}else n=`
      <ul class="list-unstyled small mb-2">
        <li>• Reinscripción: <strong>${t.reinscripcion}</strong></li>
        <li class="text-body-secondary">• Sin teléfono: ${t.sin_telefono}</li>
      </ul>`;return`
    <div class="card border-0 shadow-sm rounded-3">
      <div class="card-body">
        <h2 class="h6 fw-bold mb-2"><i class="bi bi-play-circle me-1"></i>${Z(e.nombre)}</h2>
        ${n}
        <div class="d-flex gap-2 flex-wrap mt-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" id="btn-preview">
            <i class="bi bi-search me-1"></i>Previsualizar
          </button>
          <button class="btn btn-sm btn-primary rounded-pill px-3" id="btn-activar" ${J.preview?``:`disabled`}>
            <i class="bi bi-megaphone me-1"></i>Activar y materializar
          </button>
          ${e.activo?`<button class="btn btn-sm btn-success rounded-pill px-3" id="btn-encolar" title="Mueve una tanda a la cola respetando opt-out y tope diario">
            <i class="bi bi-send me-1"></i>Encolar tanda (anti-ban)
          </button>`:``}
          ${e.activo?`<button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-desactivar">Desactivar</button>`:``}
        </div>
      </div>
    </div>`}function Wn(e){e.querySelectorAll(`[data-sel]`).forEach(t=>t.addEventListener(`click`,()=>{J.seleccionada=t.dataset.sel,J.preview=null,X(e)})),e.querySelector(`#form-campania`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=new FormData(t.target);try{J.seleccionada=(await jn({nombre:n.get(`nombre`),accion:n.get(`accion`),tipo:n.get(`tipo`),fecha_inicio:n.get(`fecha_inicio`),fecha_fin:n.get(`fecha_fin`)})).id,J.preview=null,await Y(e)}catch(e){alert(`Error al crear campaña: ${e.message}`)}}),e.querySelector(`#btn-preview`)?.addEventListener(`click`,async()=>{J.cargando=!0,X(e);try{J.preview=await Pn(J.seleccionada)}catch(e){alert(`Error en preview: ${e.message}`)}finally{J.cargando=!1,X(e)}}),e.querySelector(`#btn-activar`)?.addEventListener(`click`,async()=>{if(confirm(`Esto materializa la audiencia deduplicada (no envía WhatsApps). ¿Continuar?`))try{let t=await Fn(J.seleccionada);alert(`Campaña activada. Audiencia materializada: ${t.materializados} contacto(s).`),J.preview=null,await Y(e)}catch(e){alert(`Error al activar: ${e.message}`)}}),e.querySelector(`#btn-encolar`)?.addEventListener(`click`,async()=>{if(confirm(`Esto mueve una tanda a la cola de envío (respeta opt-out y tope diario). Los mensajes se despachan con ritmo anti-ban solo si el gateway está activo. ¿Continuar?`))try{let t=await In(J.seleccionada);alert(`Encolados: ${t.encolados}. Tope hoy: ${t.cap_hoy} · Enviados hoy: ${t.enviados_hoy} · Restante: ${t.restante_tras_encolar}.`),await Y(e)}catch(e){alert(`Error al encolar: ${e.message}`)}}),e.querySelector(`#btn-desactivar`)?.addEventListener(`click`,async()=>{try{await Nn(J.seleccionada),await Y(e)}catch(e){alert(`Error al desactivar: ${e.message}`)}})}function Z(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function Gn(){f.register(`campanias`,Rn)}async function Kn(){let{data:e,error:n}=await t.from(`hermes_whatsapp_config`).select(`*`).eq(`activo`,!0).single();if(n&&n.code!==`PGRST116`)throw n;return e||null}async function qn(e){let n=await Kn();if(!n)throw Error(`No existe configuracion activa`);let{data:r,error:i}=await t.from(`hermes_whatsapp_config`).update(e).eq(`id`,n.id).select().single();if(i)throw i;return r}var Q={config:null,edit:{},cargando:!0};async function Jn(e){try{Q.cargando=!0,Q.config=await Kn(),$(e)}catch(t){Xn(e,t.message)}finally{Q.cargando=!1}}async function Yn(e){if(Object.keys(Q.edit).length)try{Q.cargando=!0,Q.config=await qn(Q.edit),Q.edit={},$(e)}catch(t){Xn(e,t.message)}finally{Q.cargando=!1}}function $(e){let{config:t,edit:n,cargando:r}=Q;if(e.innerHTML=`
    <div style="max-width: 700px; font-family: monospace;">
      <h1>Gateway WhatsApp (Baileys) — Subsistema 4</h1>
      ${t?`
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold; width: 180px;">Número dedicado</td>
              <td style="padding: 12px;">
                <strong>${n.numero_wid??t.numero_wid??`(sin asignar)`}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="text" id="inp_numero_wid"
                  value="${n.numero_wid??t.numero_wid??``}"
                  placeholder="Ej: +1 (829) 555-0123"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Nombre amigable</td>
              <td style="padding: 12px;">
                <strong>${n.numero_nombre??t.numero_nombre??`(sin nombre)`}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="text" id="inp_numero_nombre"
                  value="${n.numero_nombre??t.numero_nombre??``}"
                  placeholder="Ej: Inscripción 2026"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Cap diario (msgs)</td>
              <td style="padding: 12px;">
                <strong>${n.cap_diario??t.cap_diario}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="number" id="inp_cap_diario"
                  value="${n.cap_diario??t.cap_diario}"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Warmup desde</td>
              <td style="padding: 12px;">
                <strong>${n.warmup_desde??t.warmup_desde??`(no iniciado)`}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="date" id="inp_warmup_desde"
                  value="${n.warmup_desde??t.warmup_desde??``}"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Warmup dias</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${t.warmup_dias}</strong> (fijo)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Jitter (seg)</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${t.jitter_min_seg}–${t.jitter_max_seg}s</strong> (fijo)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Rate limit</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${t.rate_limit_hora} msgs/hora</strong> (fijo)
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold;">Activo</td>
              <td colspan="2" style="padding: 12px;">
                <strong style="color: ${t.activo?`green`:`red`};">
                  ${t.activo?`✓ SÍ`:`✗ NO`}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 24px;">
          <button id="btn_guardar"
            style="
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              ${r||!Object.keys(n).length?`opacity: 0.5; cursor: not-allowed;`:``}
            "
            ${r||!Object.keys(n).length?`disabled`:``}
          >
            ${r?`Guardando...`:`Guardar cambios`}
          </button>
        </div>
      `:`<p style="color: #666;">No hay configuración activa. Contacta al administrador.</p>`}
    </div>
  `,t&&!r){let t=e.querySelector(`#inp_numero_wid`),n=e.querySelector(`#inp_numero_nombre`),r=e.querySelector(`#inp_cap_diario`),i=e.querySelector(`#inp_warmup_desde`),a=e.querySelector(`#btn_guardar`);t&&t.addEventListener(`change`,t=>{Q.edit.numero_wid=t.target.value||null,$(e)}),n&&n.addEventListener(`change`,t=>{Q.edit.numero_nombre=t.target.value||null,$(e)}),r&&r.addEventListener(`change`,t=>{Q.edit.cap_diario=parseInt(t.target.value)||null,$(e)}),i&&i.addEventListener(`change`,t=>{Q.edit.warmup_desde=t.target.value||null,$(e)}),a&&a.addEventListener(`click`,()=>Yn(e))}}function Xn(e,t){e.innerHTML=`<div style="color: red; padding: 20px;">Error: ${t}</div>`}function Zn(){f.register(`gateway-config`,Jn)}var Qn={en_reparacion:{label:`En reparación`,color:`#d97706`,bg:`#fef3c7`},disponible:{label:`Disponible`,color:`#059669`,bg:`#d1fae5`},fuera_de_uso:{label:`Fuera de uso`,color:`#6b7280`,bg:`#f3f4f6`}};function $n(e){let t={danado:{label:`Dañado`,color:`#dc2626`,bg:`#fee2e2`},en_reparacion:{label:`En reparación`,color:`#d97706`,bg:`#fef3c7`},disponible:{label:`Disponible`,color:`#059669`,bg:`#d1fae5`},fuera_de_uso:{label:`Fuera de uso`,color:`#6b7280`,bg:`#f3f4f6`},asignado:{label:`Asignado`,color:`#2563eb`,bg:`#dbeafe`}}[e]||{label:e,color:`#374151`,bg:`#f9fafb`};return`<span style="display:inline-block;padding:0.2rem 0.6rem;border-radius:9999px;
    font-size:0.75rem;font-weight:600;background:${t.bg};color:${t.color}">${t.label}</span>`}function er(e,t){let n=document.createElement(`div`);return n.className=`luteria-card`,n.style.cssText=`background:#fff;border:1px solid #e2e8f0;border-radius:12px;
    padding:1rem 1.25rem;margin-bottom:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.06)`,n.innerHTML=`
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
          <span style="font-weight:700;font-size:0.9rem;color:#111">${e.nombre}</span>
          ${$n(e.estado)}
        </div>
        <div style="font-size:0.8125rem;color:#6b7280;margin-bottom:0.25rem">
          <span class="me-2"><i class="bi bi-tag me-1"></i>${e.codigo}</span>
          ${e.marca?`<span class="me-2"><i class="bi bi-award me-1"></i>${e.marca}</span>`:``}
          ${e.tipo?`<span><i class="bi bi-music-note me-1"></i>${e.tipo}</span>`:``}
        </div>
        ${e.notas?`<div style="font-size:0.8125rem;color:#374151;margin-top:0.25rem;
          padding:0.375rem 0.625rem;background:#f8fafc;border-radius:6px;border-left:3px solid #cbd5e1">
          ${e.notas}</div>`:``}
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;flex-shrink:0" data-inst-id="${e.id}">
        ${Object.entries(Qn).filter(([t])=>t!==e.estado).map(([t,n])=>`<button class="btn-estado-action" data-id="${e.id}" data-estado="${t}"
              style="border:none;border-radius:8px;padding:0.3rem 0.75rem;font-size:0.8rem;
              font-weight:600;cursor:pointer;background:${n.bg};color:${n.color}">
              ${n.label}
            </button>`).join(``)}
      </div>
    </div>
  `,n.querySelectorAll(`.btn-estado-action`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.dataset.estado;n.disabled=!0,n.textContent=`Guardando...`;try{await t(e.id,r)}catch(e){n.disabled=!1,n.textContent=Qn[r]?.label||r,console.error(`[luteriaView] cambiarEstado error:`,e)}})}),n}async function tr(e){let t=new AbortController;e.innerHTML=`
    <div style="padding:1.5rem;max-width:900px;margin:0 auto">
      <div style="margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div>
          <h5 style="margin:0;font-weight:700;color:#111">Taller de Lutería — Diagnósticos</h5>
          <p style="margin:0.25rem 0 0;font-size:0.875rem;color:#6b7280">
            Instrumentos dañados o en reparación
          </p>
        </div>
        <button id="btn-refresh-luteria" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
        </button>
      </div>
      <div id="luteria-list">
        <div class="d-flex justify-content-center align-items-center" style="min-height:200px">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
  `;let n=e.querySelector(`#luteria-list`);async function r(){n.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:200px">
      <div class="spinner-border text-warning" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>`;try{let[e,t]=await Promise.all([be({estado:`danado`}),be({estado:`en_reparacion`})]),i=[...e,...t].sort((e,t)=>e.nombre.localeCompare(t.nombre));if(i.length===0){n.innerHTML=`
          <div style="text-align:center;padding:3rem 1rem;color:#6b7280">
            <i class="bi bi-check-circle" style="font-size:2.5rem;color:#059669;display:block;margin-bottom:0.75rem"></i>
            <p style="font-weight:600;margin:0">Sin instrumentos dañados o en reparación</p>
            <p style="margin:0.25rem 0 0;font-size:0.875rem">El taller está al día.</p>
          </div>`;return}n.innerHTML=``;let a=document.createDocumentFragment();i.forEach(e=>{let t=er(e,async(e,t)=>{await xe(e,t),await r()});a.appendChild(t)}),n.appendChild(a)}catch(e){n.innerHTML=`<div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar instrumentos: ${e.message}
      </div>`}}return e.querySelector(`#btn-refresh-luteria`)?.addEventListener(`click`,r,{signal:t.signal}),await r(),{teardown(){t.abort()}}}function nr(){f.register(`luteria-diagnosticos`,e=>tr(e))}var rr=[un,kn,o,he,u,d,ae,c,ne,re,se,fe,oe,te,me,a,de,ce,ee,l,ie,le,Gn,Zn,nr];export{He as n,rr as t};