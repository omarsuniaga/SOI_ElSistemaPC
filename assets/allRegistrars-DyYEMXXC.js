const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/boletinesService-BS6UlP4L.js","assets/AppModal-Du6jXNYA.js","assets/supabase-Cgh_dhNB.js","assets/planificacion-BdwKIwFz.js","assets/vendor-mK9cUK6A.js","assets/vendor-COf7rB16.css","assets/config-CNiOV0RX.js","assets/planificacionAdapter-C-rXyuPH.js","assets/clases-knAl1xY0.js","assets/evaluacionClaseService-PzaE8gD7.js","assets/IndicadorLogro-CUm_IXl5.js","assets/idb-hTByFGMt.js","assets/clasesApi-DGHemn9O.js","assets/normalizeText-DvPabODc.js","assets/periodoSniffer-ZO5JsHUX.js","assets/aiEvaluacionService-_0RGpDzq.js","assets/MapaContenidoSVG-B-8-5_NT.js","assets/mapaClaseService-DaoOTdhF.js","assets/asistenciasApi-CKT-fCIb.js","assets/asistenciasSupabase-BCw50kNC.js","assets/three-HOk4djdv.js","assets/salaTrabajo3dView-CJHsw_Kr.js","assets/simuladorLogMapper-DOwzR9m9.js","assets/salaTrabajoView-D4tYQK6c.js"])))=>i.map(i=>d[i]);
import{i as e,r as t,s as n,t as r}from"./AppModal-Du6jXNYA.js";import{a as i,i as a}from"./supabase-Cgh_dhNB.js";import"./vendor-mK9cUK6A.js";import{b as o,g as s}from"./planificacion-BdwKIwFz.js";import{$ as c,A as l,D as u,I as d,L as f,M as p,N as ee,O as te,P as ne,Q as re,R as ie,a as ae,c as oe,d as se,f as ce,g as le,h as ue,i as de,j as fe,k as pe,l as me,n as he,nt as m,o as ge,r as _e,s as ve,t as ye,tt as be,u as xe,z as Se}from"./hermesConsultaView-D4WBJnjB.js";import{r as Ce}from"./groqService-BEo2aU8D.js";import{t as we}from"./tareasView-Ok_NhFSn.js";window.router=o;var Te=`hermes-tareas`;function Ee(){let e=localStorage.getItem(`app-theme`),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches,n=e===`dark`||e===null&&t;document.documentElement.setAttribute(`data-bs-theme`,n?`dark`:`light`)}function De(){let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-bs-theme`,e),localStorage.setItem(`app-theme`,e)}var Oe=null;function ke(e,t){for(let n of e)if(n.items.some(e=>e.id===t))return n.id;return e[0]?.id}function Ae(e,t,n){if(Oe?.abort(),Oe=new AbortController,document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),!t)return;let r=m.getUser(),i=r?r.email||r.full_name||`Usuario`:``,s=localStorage.getItem(n)||e.defaultRoute,c=ke(e.navGroups,s),l=document.documentElement.getAttribute(`data-bs-theme`)===`dark`,u=document.createElement(`aside`);u.className=`app-sidebar`,u.innerHTML=`
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
              <button class="nav-item-btn ${e.id===s?`active`:``}" data-route="${e.id}">
                <i class="bi ${e.icon}"></i>
                <span>${e.label}</span>
              </button>`).join(``)}
          </div>
        </div>`).join(``)}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <i class="bi bi-person-circle"></i>
        <span class="sidebar-user-name" title="${i}">${i.split(`@`)[0]}</span>
      </div>
      <button class="sidebar-action-btn" id="sidebarBtnTheme" title="Cambiar tema">
        <i class="bi ${l?`bi-sun-fill`:`bi-moon-fill`}"></i>
      </button>
      <button class="sidebar-action-btn danger" id="sidebarBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `;let d=document.createElement(`nav`);d.className=`app-bottom-nav`,d.innerHTML=e.navGroups.map(e=>`
    <button class="bottom-tab ${e.id===c?`active`:``}" data-group="${e.id}">
      <i class="bi ${e.icon}"></i>
      <span>${e.label}</span>
    </button>
  `).join(``);let f=document.createElement(`div`);f.className=`mobile-sub-sheet`,f.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-title" id="sheetTitle"></div>
    <div class="sheet-items" id="sheetItems"></div>
  `,document.body.prepend(u),document.body.prepend(d),document.body.prepend(f);let{signal:p}=Oe,ee=(t=localStorage.getItem(n)||e.defaultRoute)=>{let r=ke(e.navGroups,t);d.querySelectorAll(`.bottom-tab`).forEach(e=>{e.classList.toggle(`active`,e.dataset.group===r)});let i=f.dataset.group;f.classList.contains(`open`)&&i&&i!==r&&f.classList.remove(`open`)};u.querySelectorAll(`.nav-group-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.nav-group`),n=t.classList.contains(`expanded`);u.querySelectorAll(`.nav-group`).forEach(e=>e.classList.remove(`expanded`)),n||t.classList.add(`expanded`)},{signal:p})}),u.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>{o.navigate(e.dataset.route)},{signal:p})}),u.querySelector(`#sidebarBtnTheme`).addEventListener(`click`,()=>{De();let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`;u.querySelector(`#sidebarBtnTheme i`).className=e?`bi bi-sun-fill`:`bi bi-moon-fill`},{signal:p}),u.querySelector(`#sidebarBtnLogout`).addEventListener(`click`,async()=>{await a.auth.signOut(),window.location.reload()},{signal:p});function te(t){let r=e.navGroups.find(e=>e.id===t);if(!r)return;let i=localStorage.getItem(n)||e.defaultRoute,a=document.getElementById(`sheetTitle`),s=document.getElementById(`sheetItems`);!a||!s||(a.textContent=r.label,s.innerHTML=r.items.map(e=>`
      <button class="sheet-item ${e.id===i?`active`:``}" data-route="${e.id}">
        <i class="bi ${e.icon}"></i>
        <span>${e.label}</span>
      </button>
    `).join(``),f.dataset.group=t,f.classList.add(`open`),s.querySelectorAll(`.sheet-item`).forEach(t=>{t.addEventListener(`click`,()=>{o.navigate(t.dataset.route),f.classList.remove(`open`),d.querySelectorAll(`.bottom-tab`).forEach(n=>n.classList.toggle(`active`,n.dataset.group===ke(e.navGroups,t.dataset.route)))})}))}d.querySelectorAll(`.bottom-tab`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.group;f.classList.contains(`open`)&&f.dataset.group===t?f.classList.remove(`open`):(te(t),d.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===t)))})}),window.addEventListener(`routeChanged`,e=>{let t=e.detail;ee(t),u.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.route===t)})},{signal:p}),ee(s)}async function je(e){let{data:t}=await a.from(`profiles`).select(`rol`).eq(`id`,e).maybeSingle();return t?.rol||null}function Me(e,t){document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),e.innerHTML=`
    <div class="d-flex align-items-center justify-content-center" style="min-height:100vh">
      <div class="text-center p-4">
        <i class="bi bi-shield-lock" style="font-size:3rem;opacity:0.4"></i>
        <h4 class="mt-3">Sin acceso a ${t}</h4>
        <p class="text-muted">Tu cuenta no tiene permiso para este portal.</p>
        <button class="btn btn-outline-secondary btn-sm" id="btnSalir">
          <i class="bi bi-box-arrow-right me-1"></i>Cambiar de cuenta
        </button>
      </div>
    </div>
  `,e.querySelector(`#btnSalir`)?.addEventListener(`click`,async()=>{await a.auth.signOut(),window.location.reload()})}async function Ne(e){let t=`current-view-${e.hermesDept.toLowerCase()}`,n=document.querySelector(`#app`);if(!n){console.error(`El contenedor #app no existe en el HTML`);return}Ee();try{be()}catch(e){console.error(`Error registrando auth:`,e)}e.registrars.forEach(e=>{try{e()}catch(e){console.error(`Error registrando módulo:`,e)}}),o.register(Te,(t,n={})=>we(t,{departamento:e.hermesDept,hideCalendarBtn:!0,...n})),o.register(`hermes-evento`,(e,t={})=>ae(e,{...t})),o.register(`dir-alianzas`,e=>de(e)),o.register(`hermes-caso`,(e,t={})=>_e(e,t)),o.register(`cierre-academico`,e=>p(e)),o.register(`hermes-procedimientos`,e=>he(e)),o.register(`dir-score`,e=>ge(e)),o.register(`hermes-consulta`,e=>ye(e)),o.initCustomEvents(),await m.refreshAuth(),o.setAuthGuard(()=>m.isAuthenticated(),[`login`,`register`]),o.init=function(){let n=localStorage.getItem(t)||e.defaultRoute;this.navigate(n)};let r=o._navigateTo.bind(o);o._navigateTo=function(e,n={}){r(e,n),localStorage.setItem(t,e)};let i=async()=>{if(!m.isAuthenticated()){Ae(e,!1,t),o.navigate(`login`);return}let r=m.getUser()||m.getState?.().user;if(!r?.id){console.warn(`[portalShell] autenticado pero sin user.id; redirigiendo a login`),Ae(e,!1,t),o.navigate(`login`);return}let i=await je(r.id);if(!e.allowedRoles.includes(i)){Me(n,e.brandText);return}Ae(e,!0,t);let a=localStorage.getItem(t);o.navigate(a&&o.routes[a]?a:e.defaultRoute)};try{await i()}catch(t){console.error(`[portalShell] Error en boot:`,t),Pe(n,e.brandText,t);return}let a=!1;m.subscribe(async e=>{if(!a){a=!0;try{e.user?await i():(document.querySelector(`.app-sidebar`)?.remove(),n.innerHTML=``,o.navigate(`login`))}catch(e){console.error(`[portalShell] Error en re-gate:`,e)}finally{a=!1}}})}function Pe(e,t,n){document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),e.innerHTML=`
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
  `}var Fe={violin:`Violín`,volín:`Violín`,violín:`Violín`,viola:`Viola`,cello:`Cello`,violoncello:`Cello`,violonchelo:`Cello`,chelo:`Cello`,contrabajo:`Contrabajo`,flauta:`Flauta`,oboe:`Oboe`,clarinete:`Clarinete`,fagot:`Fagot`,saxofon:`Saxofón`,saxofón:`Saxofón`,corno:`Corno`,trompeta:`Trompeta`,trombón:`Trombón`,trombon:`Trombón`,tuba:`Tuba`,percusión:`Percusión`,percusion:`Percusión`,coro:`Coro`,piano:`Piano`},Ie={cuerdas:{label:`Cuerdas`,icon:`bi-music-note-beamed`,instrumentos:[`Violín`,`Viola`,`Cello`,`Contrabajo`]},maderas:{label:`Maderas`,icon:`bi-wind`,instrumentos:[`Flauta`,`Oboe`,`Clarinete`,`Fagot`,`Saxofón`]},metales:{label:`Metales`,icon:`bi-trumpet`,instrumentos:[`Corno`,`Trompeta`,`Trombón`,`Tuba`]},percusion:{label:`Percusión`,icon:`bi-bullseye`,instrumentos:[`Percusión`]},coro:{label:`Coro`,icon:`bi-people`,instrumentos:[`Coro`]},otros:{label:`Otros`,icon:`bi-three-dots`,instrumentos:[`Piano`]}};function h(e){return e?Fe[String(e).trim().toLowerCase()]||Be(String(e).trim()):null}function Le(e){let t=h(e);if(!t)return`otros`;for(let[e,n]of Object.entries(Ie))if(n.instrumentos.includes(t))return e;return`otros`}function g(e){if(!e)return null;let t=String(e).replace(/\D/g,``);return t.length===0||(t.length===10&&(t=`1`+t),t.length<11)?null:t}function Re(e,t=``){let n=g(e);return n?`https://wa.me/${n}${t?`?text=${encodeURIComponent(t)}`:``}`:null}function ze(e,t={}){if(!e)return``;let n=Ie[Le(t.instrumento)];return e.replace(/\{nombre_alumno\}/g,t.alumno||``).replace(/\{representante\}/g,t.contactoNombre||``).replace(/\{instrumento\}/g,h(t.instrumento)||``).replace(/\{seccion\}/g,n?.label||``)}function Be(e){return e&&e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()}[[`Ana Lucía Pérez`,`Violín`,`María Pérez`,`8095551001`,`maria.perez@example.com`],[`Carlos Ramírez`,`Violin`,`José Ramírez`,`8295551002`,`jose.ramirez@example.com`],[`Daniela Gómez`,`Viola`,`Rosa Gómez`,`8495551003`,`rosa.gomez@example.com`],[`Esteban Núñez`,`Cello`,`Pedro Núñez`,`8095551004`,`pedro.nunez@example.com`],[`Fabiola Díaz`,`Contrabajo`,`Luisa Díaz`,`8095551005`,null],[`Gabriel Soto`,`Flauta`,`Carmen Soto`,`8295551006`,`carmen.soto@example.com`],[`Helena Cruz`,`Clarinete`,`Marta Cruz`,`8495551007`,`marta.cruz@example.com`],[`Iván Mejía`,`Trompeta`,`Raúl Mejía`,`8095551008`,`raul.mejia@example.com`],[`Julia Vargas`,`Trombón`,`Sofía Vargas`,null,`sofia.vargas@example.com`],[`Kevin Reyes`,`Percusión`,`Ana Reyes`,`8295551010`,`ana.reyes@example.com`]].map((e,t)=>{let[n,r,i,a,o]=e;return{alumnoId:`mock-al-${String(t+1).padStart(3,`0`)}`,alumno:n,instrumento:h(r),familia:Le(r),contactoNombre:i,whatsapp:a,email:o}}),new Date().toISOString(),new Date().toISOString();var Ve=n({eliminarPlantilla:()=>Ge,enviarCorreo:()=>Ke,getContactos:()=>He,getPlantillas:()=>Ue,guardarPlantilla:()=>We});async function He(){let{data:e,error:t}=await a.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, activo, representante_nombre, representante_tlf, madre_nombre, madre_tlf_whatsapp, padre_nombre, padre_tlf_whatsapp, familiar_nombre, familiar_telefono, correo_representante`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0});if(t)throw t;return(e||[]).map(e=>{let t=e.madre_tlf_whatsapp||e.padre_tlf_whatsapp||e.representante_tlf||e.familiar_telefono||null,n=e.representante_nombre||e.madre_nombre||e.padre_nombre||e.familiar_nombre||`Representante`;return{alumnoId:e.id,alumno:e.nombre_completo,instrumento:h(e.instrumento_principal),familia:Le(e.instrumento_principal),contactoNombre:n,whatsapp:t,email:e.correo_representante||null}})}async function Ue(){let{data:e,error:t}=await a.from(`document_templates`).select(`id, nombre, tipo, descripcion, contenido, variables, estado, version, updated_at`).order(`nombre`,{ascending:!0});if(t)throw t;return e||[]}async function We(e){let t={nombre:e.nombre,tipo:e.tipo||`mensaje`,descripcion:e.descripcion||null,contenido:e.contenido||``,variables:e.variables||[],estado:e.estado||`activa`,updated_at:new Date().toISOString()};if(e.id){let{data:n,error:r}=await a.from(`document_templates`).update(t).eq(`id`,e.id).select().single();if(r)throw r;return n}let{data:n,error:r}=await a.from(`document_templates`).insert(t).select().single();if(r)throw r;return n}async function Ge(e){let{error:t}=await a.from(`document_templates`).delete().eq(`id`,e);if(t)throw t;return!0}async function Ke(e){let{data:t,error:n}=await a.functions.invoke(`send-email`,{body:e});if(n){let e=n.message;try{let t=await n.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e)}if(t&&t.ok===!1&&t.enviados===0)throw Error(t.batches?.[0]?.error||`No se pudo enviar el correo`);return t}var _=Ve,qe=_.getContactos,Je=_.getPlantillas,Ye=_.guardarPlantilla,Xe=_.eliminarPlantilla,Ze=_.enviarCorreo,Qe=`Eres el asistente de redacción del Departamento de Comunicaciones de
"El Sistema Punta Cana", una fundación de educación musical para jóvenes de bajos recursos.
Mejorás mensajes institucionales dirigidos a representantes/familias de alumnos.
Reglas:
- Tono cálido, cercano y respetuoso, pero profesional e institucional.
- Español neutro dominicano. Claro y conciso.
- Conservá las variables entre llaves como {nombre_alumno}, {representante}, {instrumento}, {seccion} EXACTAMENTE como están.
- No inventes datos (fechas, lugares, montos) que no estén en el texto original.
- Devolvé SOLO el mensaje mejorado, sin explicaciones ni comillas.`;async function $e(e,t=``){let n=t?`Instrucción adicional: ${t}\n\nMensaje a mejorar:\n${e}`:`Mensaje a mejorar:\n${e}`,r=await Ce([{role:`system`,content:Qe},{role:`user`,content:n}]);return typeof r==`string`?r.trim():r&&typeof r.content==`string`?r.content.trim():String(r||``).trim()}function et(e){let t=new Date;return t.setDate(t.getDate()+e),t.toISOString().slice(0,10)}new Date(Date.now()-2*864e5).toISOString(),et(-1),new Date(Date.now()-2*864e5).toISOString(),new Date(Date.now()-2*864e5).toISOString(),new Date(Date.now()-1*864e5).toISOString(),et(0),new Date(Date.now()-1*864e5).toISOString(),new Date(Date.now()-1*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString(),new Date(Date.now()-5*864e5).toISOString();var tt=n({actualizarSeguimiento:()=>ot,cerrarSeguimiento:()=>st,crearSeguimiento:()=>at,eliminarSeguimiento:()=>ct,getSeguimientos:()=>rt,getSeguimientosByAlumno:()=>it}),v=`comunicaciones_seguimiento`,nt=`id, alumno_id, contacto_nombre, contacto_telefono, contacto_email, canal, fecha, resultado, notas, requiere_seguimiento, proxima_accion, proxima_fecha, estado, responsable_id, created_at, updated_at`;async function rt(e={}){let t=a.from(v).select(nt);e.alumno_id&&(t=t.eq(`alumno_id`,e.alumno_id)),e.estado&&(t=t.eq(`estado`,e.estado)),e.canal&&(t=t.eq(`canal`,e.canal));let{data:n,error:r}=await t.order(`fecha`,{ascending:!1});if(r)throw r;return n||[]}async function it(e){return rt({alumno_id:e})}async function at(e){let t={alumno_id:e.alumno_id||null,contacto_nombre:e.contacto_nombre||null,contacto_telefono:e.contacto_telefono||null,contacto_email:e.contacto_email||null,canal:e.canal||`llamada`,fecha:e.fecha||new Date().toISOString(),resultado:e.resultado||`contactado`,notas:e.notas||null,requiere_seguimiento:!!e.requiere_seguimiento,proxima_accion:e.proxima_accion||null,proxima_fecha:e.proxima_fecha||null,estado:e.estado||`abierto`},{data:n,error:r}=await a.from(v).insert(t).select(nt).single();if(r)throw r;return n}async function ot(e,t={}){let{data:n,error:r}=await a.from(v).update(t).eq(`id`,e).select(nt).single();if(r)throw r;return n}async function st(e){return ot(e,{estado:`cerrado`,requiere_seguimiento:!1})}async function ct(e){let{error:t}=await a.from(v).delete().eq(`id`,e);if(t)throw t;return!0}var y=tt,lt=y.getSeguimientos;y.getSeguimientosByAlumno;var ut=y.crearSeguimiento,dt=y.actualizarSeguimiento,ft=y.cerrarSeguimiento,pt=y.eliminarSeguimiento,b={llamada:{label:`Llamada`,icon:`bi-telephone`},whatsapp:{label:`WhatsApp`,icon:`bi-whatsapp`},correo:{label:`Correo`,icon:`bi-envelope`},reunion:{label:`Reunión`,icon:`bi-people`},otro:{label:`Otro`,icon:`bi-chat-dots`}},mt={contactado:{label:`Contactado`,color:`success`},buzon_no_contesto:{label:`Buzón / No contestó`,color:`secondary`},reagendar:{label:`Reagendar`,color:`warning`},sin_interes:{label:`Sin interés`,color:`dark`},resuelto:{label:`Resuelto`,color:`primary`}};function ht(e){if(e instanceof Date)return new Date(e);if(typeof e==`string`){let t=e.match(/^(\d{4})-(\d{2})-(\d{2})/);if(t)return new Date(Number(t[1]),Number(t[2])-1,Number(t[3]))}return new Date(e)}function gt(e){let t=ht(e);return t.setHours(0,0,0,0),t}function _t(e){return e?.proxima_fecha?gt(e.proxima_fecha):null}function vt(e){return e?.estado===`abierto`}function yt(e,t=new Date){let n=_t(e);return n?Math.round((n-gt(t))/864e5):null}function bt(e=[],t=new Date){let n={vencidos:[],hoy:[],proximos:[]};for(let r of e){if(!vt(r)||!r?.requiere_seguimiento)continue;let e=yt(r,t);e!==null&&(e<0?n.vencidos.push(r):e===0?n.hoy.push(r):n.proximos.push(r))}return n}var x={registros:[],filtroCanal:`todos`,filtroEstado:`abierto`},S=null;async function C(e){S?.abort(),S=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{x.registros=await lt(),xt(e)}catch(n){console.error(`[Seguimiento] Error:`,n),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar seguimiento</h5>
      <p>${t(n.message)}</p></div></div>`}return{teardown:()=>S?.abort()}}function xt(e){let t=bt(x.registros),n=wt();e.innerHTML=`
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
        ${St(`Vencidos`,t.vencidos,`danger`,`bi-exclamation-octagon`)}
        ${St(`Para hoy`,t.hoy,`warning`,`bi-calendar-day`)}
        ${St(`Próximos`,t.proximos,`info`,`bi-calendar-week`)}
      </div>

      <!-- Historial -->
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h6 class="fw-bold mb-0"><i class="bi bi-clock-history me-1"></i>Historial de interacciones</h6>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" id="segFiltroEstado" style="max-width:140px">
            <option value="todos" ${x.filtroEstado===`todos`?`selected`:``}>Todos</option>
            <option value="abierto" ${x.filtroEstado===`abierto`?`selected`:``}>Abiertos</option>
            <option value="cerrado" ${x.filtroEstado===`cerrado`?`selected`:``}>Cerrados</option>
          </select>
          <select class="form-select form-select-sm" id="segFiltroCanal" style="max-width:140px">
            <option value="todos">Todo canal</option>
            ${Object.entries(b).map(([e,t])=>`<option value="${e}" ${x.filtroCanal===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select>
        </div>
      </div>
      <div id="segLista">
        ${n.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay interacciones para este filtro</div>`:n.map(Ct).join(``)}
      </div>
    </div>
  `,Tt(e)}function St(e,n,r,i){return`
    <div class="col-md-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-${r} bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
          <span class="fw-bold text-${r}"><i class="bi ${i} me-1"></i>${e}</span>
          <span class="badge bg-${r}">${n.length}</span>
        </div>
        <div class="card-body p-2" style="max-height:240px;overflow-y:auto">
          ${n.length===0?`<p class="text-muted small text-center mb-0 py-3">Sin pendientes</p>`:n.map(e=>`
            <button class="btn btn-light btn-sm w-100 text-start mb-1 seg-agenda-item" data-id="${e.id}">
              <div class="fw-semibold small">${t(e.contacto_nombre||`Contacto`)}</div>
              <div class="text-muted extra-small">${t(e.proxima_accion||`Seguimiento`)}</div>
            </button>`).join(``)}
        </div>
      </div>
    </div>
  `}function Ct(e){let n=b[e.canal]||b.otro,r=mt[e.resultado]||{label:e.resultado,color:`secondary`},i=e.requiere_seguimiento?yt(e):null,a=i===null?`text-muted`:i<0?`text-danger`:i===0?`text-warning`:`text-muted`;return`
    <div class="card border-0 shadow-sm mb-2 seg-card" data-id="${e.id}">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i class="bi ${n.icon} text-primary"></i>
              <span class="fw-semibold">${t(e.contacto_nombre||`Contacto`)}</span>
              <span class="badge bg-${r.color} bg-opacity-75">${r.label}</span>
              ${e.estado===`cerrado`?`<span class="badge bg-secondary">Cerrado</span>`:``}
            </div>
            ${e.notas?`<p class="small text-secondary mb-1">${t(e.notas)}</p>`:``}
            ${e.requiere_seguimiento&&e.proxima_fecha?`<div class="small ${a}"><i class="bi bi-arrow-return-right"></i>
                    ${t(e.proxima_accion||`Seguimiento`)} · ${e.proxima_fecha}${i!==null&&i<0?` (vencido)`:i===0?` (hoy)`:``}</div>`:``}
          </div>
          <div class="text-end flex-shrink-0">
            <div class="text-muted extra-small mb-1">${new Date(e.fecha).toLocaleDateString(`es-DO`)}</div>
            <button class="btn btn-sm btn-outline-secondary seg-edit" data-id="${e.id}" title="Editar"><i class="bi bi-pencil"></i></button>
            ${e.estado===`abierto`?`<button class="btn btn-sm btn-outline-success seg-cerrar" data-id="${e.id}" title="Cerrar"><i class="bi bi-check2"></i></button>`:``}
          </div>
        </div>
      </div>
    </div>
  `}function wt(){let e=[...x.registros];return x.filtroEstado!==`todos`&&(e=e.filter(e=>e.estado===x.filtroEstado)),x.filtroCanal!==`todos`&&(e=e.filter(e=>e.canal===x.filtroCanal)),e}function Tt(t){let n=S.signal;t.querySelector(`#segNuevo`)?.addEventListener(`click`,()=>Et(null,()=>C(t)),{signal:n}),t.querySelector(`#segFiltroEstado`)?.addEventListener(`change`,e=>{x.filtroEstado=e.target.value,xt(t)},{signal:n}),t.querySelector(`#segFiltroCanal`)?.addEventListener(`change`,e=>{x.filtroCanal=e.target.value,xt(t)},{signal:n});let r=e=>{let n=x.registros.find(t=>t.id===e);n&&Et(n,()=>C(t))};t.querySelectorAll(`.seg-agenda-item, .seg-edit`).forEach(e=>e.addEventListener(`click`,()=>r(e.dataset.id),{signal:n})),t.querySelectorAll(`.seg-cerrar`).forEach(r=>r.addEventListener(`click`,async()=>{try{await ft(r.dataset.id),e.show(`Seguimiento cerrado`,`success`),C(t)}catch(t){e.show(`Error: ${t.message}`,`error`)}},{signal:n}))}function Et(n,i,a=null){let o=!n,s=n||{alumno_id:a?.alumnoId||null,contacto_nombre:a?.alumno||a?.contactoNombre||``,contacto_telefono:a?.whatsapp||``,contacto_email:a?.email||``,canal:`llamada`,fecha:new Date().toISOString(),resultado:`contactado`,notas:``,requiere_seguimiento:!1,proxima_accion:``,proxima_fecha:``,estado:`abierto`},c=new Date().toISOString().slice(0,10);r.open({title:o?`Registrar interacción`:`Editar seguimiento`,size:`lg`,body:`
      <div class="row g-2 mb-2">
        <div class="col-md-6"><label class="form-label small fw-semibold">Contacto *</label>
          <input type="text" class="form-control form-control-sm" id="segNombre" value="${t(s.contacto_nombre||``)}"></div>
        <div class="col-md-6"><label class="form-label small fw-semibold">Teléfono</label>
          <input type="text" class="form-control form-control-sm" id="segTel" value="${t(s.contacto_telefono||``)}"></div>
      </div>
      <div class="row g-2 mb-2">
        <div class="col-md-4"><label class="form-label small fw-semibold">Canal</label>
          <select class="form-select form-select-sm" id="segCanal">
            ${Object.entries(b).map(([e,t])=>`<option value="${e}" ${s.canal===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Resultado</label>
          <select class="form-select form-select-sm" id="segResultado">
            ${Object.entries(mt).map(([e,t])=>`<option value="${e}" ${s.resultado===e?`selected`:``}>${t.label}</option>`).join(``)}
          </select></div>
        <div class="col-md-4"><label class="form-label small fw-semibold">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segFecha" value="${(s.fecha||``).slice(0,10)||c}"></div>
      </div>
      <div class="mb-2"><label class="form-label small fw-semibold">Notas (¿qué se habló? ¿en qué quedaron?)</label>
        <textarea class="form-control form-control-sm" id="segNotas" rows="3">${t(s.notas||``)}</textarea></div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="segReq" ${s.requiere_seguimiento?`checked`:``}>
        <label class="form-check-label small fw-semibold" for="segReq">Requiere seguimiento (agendar próxima acción)</label>
      </div>
      <div id="segProxWrap" class="row g-2 ${s.requiere_seguimiento?``:`d-none`}">
        <div class="col-md-8"><label class="form-label small">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="segProxAccion" value="${t(s.proxima_accion||``)}" placeholder="Ej. Volver a llamar para confirmar"></div>
        <div class="col-md-4"><label class="form-label small">Fecha</label>
          <input type="date" class="form-control form-control-sm" id="segProxFecha" value="${s.proxima_fecha||``}"></div>
      </div>
    `,saveText:o?`Registrar`:`Guardar`,deleteText:`Eliminar`,onDelete:o?null:async()=>{try{await pt(s.id),e.show(`Registro eliminado`,`success`),i?.()}catch(t){return e.show(`Error: ${t.message}`,`error`),!1}},onShow:e=>{e.querySelector(`#segReq`)?.addEventListener(`change`,t=>{e.querySelector(`#segProxWrap`).classList.toggle(`d-none`,!t.target.checked)})},onSave:async t=>{let n=t.querySelector(`#segNombre`).value.trim();if(!n)return e.show(`El contacto es obligatorio`,`error`),!1;let r=t.querySelector(`#segReq`).checked,a={alumno_id:s.alumno_id||null,contacto_nombre:n,contacto_telefono:t.querySelector(`#segTel`).value.trim()||null,contacto_email:s.contacto_email||null,canal:t.querySelector(`#segCanal`).value,resultado:t.querySelector(`#segResultado`).value,fecha:new Date(t.querySelector(`#segFecha`).value||c).toISOString(),notas:t.querySelector(`#segNotas`).value.trim()||null,requiere_seguimiento:r,proxima_accion:r&&t.querySelector(`#segProxAccion`).value.trim()||null,proxima_fecha:r&&t.querySelector(`#segProxFecha`).value||null};try{o?await ut(a):await dt(s.id,a),e.show(`Seguimiento guardado`,`success`),i?.()}catch(t){return e.show(`Error: ${t.message}`,`error`),!1}}})}var Dt=[`{nombre_alumno}`,`{representante}`,`{instrumento}`,`{seccion}`],w={contactos:[],plantillas:[],tab:`directorio`,filtroFamilia:`todas`,busqueda:``,seleccion:new Set,canal:`whatsapp`,asunto:``,mensaje:``},T=null;async function Ot(e){T?.abort(),T=new AbortController,e.innerHTML=kt();try{let[t,n]=await Promise.all([qe(),Je()]);w.contactos=t,w.plantillas=n,E(e)}catch(n){console.error(`[Comunicaciones] Error:`,n),e.innerHTML=`<div class="container mt-5"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar Comunicaciones</h5>
      <p>${t(n.message)}</p></div></div>`}return{teardown:()=>T?.abort()}}function kt(){return`<div class="d-flex justify-content-center align-items-center" style="min-height:400px">
    <div class="text-center"><div class="spinner-border text-primary mb-3"></div>
    <p class="text-muted">Cargando central de comunicaciones...</p></div></div>`}function E(e){e.innerHTML=`
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
        ${D(`directorio`,`bi-journal-text`,`Directorio`)}
        ${D(`compositor`,`bi-pencil-square`,`Compositor${w.seleccion.size?` (${w.seleccion.size})`:``}`)}
        ${D(`plantillas`,`bi-files`,`Plantillas`)}
        ${D(`boletines`,`bi-robot`,`Boletines Automáticos`)}
      </ul>

      <div id="comm-body"></div>
    </div>
  `,e.querySelectorAll(`.comm-tab-btn`).forEach(t=>t.addEventListener(`click`,()=>{w.tab=t.dataset.tab,E(e)},{signal:T.signal})),At(e)}function D(e,t,n){return`<li class="nav-item"><button class="nav-link comm-tab-btn ${w.tab===e?`active`:``}" data-tab="${e}">
    <i class="bi ${t} me-1"></i>${n}</button></li>`}function At(e){let t=e.querySelector(`#comm-body`);w.tab===`directorio`?Mt(e,t):w.tab===`compositor`?k(e,t):w.tab===`plantillas`?zt(e,t):A(e,t)}function jt(){let e=[...w.contactos];if(w.filtroFamilia!==`todas`&&(e=e.filter(e=>e.familia===w.filtroFamilia)),w.busqueda){let t=w.busqueda.toLowerCase();e=e.filter(e=>(e.alumno||``).toLowerCase().includes(t)||(e.contactoNombre||``).toLowerCase().includes(t)||(e.instrumento||``).toLowerCase().includes(t))}return e}function Mt(e,n){let r=jt(),i=Object.entries(Ie),a=e=>w.contactos.filter(t=>t.familia===e).length;n.innerHTML=`
    <div class="d-flex gap-2 flex-wrap mb-3 align-items-center">
      <input type="text" class="form-control form-control-sm" id="commBuscar" style="max-width:260px"
        placeholder="🔍 Buscar alumno, representante o instrumento" value="${t(w.busqueda)}">
      <button class="btn btn-sm ${w.filtroFamilia===`todas`?`btn-primary`:`btn-outline-secondary`} comm-fam" data-fam="todas">
        Todas (${w.contactos.length})
      </button>
      ${i.filter(([e])=>a(e)>0).map(([e,t])=>`<button class="btn btn-sm ${w.filtroFamilia===e?`btn-primary`:`btn-outline-secondary`} comm-fam" data-fam="${e}">
              <i class="bi ${t.icon} me-1"></i>${t.label} (${a(e)})
            </button>`).join(``)}
    </div>

    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="commSelAll">
        <label class="form-check-label small" for="commSelAll">Seleccionar los ${r.length} filtrados</label>
      </div>
      <div class="small text-muted">
        <span class="fw-bold text-primary">${w.seleccion.size}</span> seleccionados
        ${w.seleccion.size?`· <button class="btn btn-link btn-sm p-0 align-baseline" id="commClear">limpiar</button>`:``}
      </div>
    </div>

    <div class="table-responsive comm-table-wrap">
      <table class="table table-sm table-hover align-middle mb-0">
        <thead class="table-light"><tr>
          <th style="width:36px"></th><th>Alumno</th><th>Instrumento</th><th>Representante</th>
          <th>WhatsApp</th><th>Correo</th><th style="width:44px"></th>
        </tr></thead>
        <tbody>
          ${r.length===0?`<tr><td colspan="7" class="text-center text-muted py-4">Sin contactos para este filtro</td></tr>`:r.map(Nt).join(``)}
        </tbody>
      </table>
    </div>

    <div class="comm-sticky-actions mt-3">
      <button class="btn btn-primary" id="commToComposer" ${w.seleccion.size===0?`disabled`:``}>
        <i class="bi bi-pencil-square me-1"></i> Redactar a ${w.seleccion.size} contacto${w.seleccion.size===1?``:`s`}
      </button>
    </div>
  `;let o=T.signal;n.querySelector(`#commBuscar`)?.addEventListener(`input`,t=>{w.busqueda=t.target.value,Mt(e,n)},{signal:o}),n.querySelectorAll(`.comm-fam`).forEach(t=>t.addEventListener(`click`,()=>{w.filtroFamilia=t.dataset.fam,Mt(e,n)},{signal:o}));let s=r.length>0&&r.every(e=>w.seleccion.has(e.alumnoId)),c=n.querySelector(`#commSelAll`);c&&(c.checked=s),c?.addEventListener(`change`,t=>{r.forEach(e=>t.target.checked?w.seleccion.add(e.alumnoId):w.seleccion.delete(e.alumnoId)),E(e)},{signal:o}),n.querySelector(`#commClear`)?.addEventListener(`click`,()=>{w.seleccion.clear(),E(e)},{signal:o}),n.querySelectorAll(`.comm-row-check`).forEach(t=>t.addEventListener(`change`,n=>{n.target.checked?w.seleccion.add(t.dataset.id):w.seleccion.delete(t.dataset.id),E(e)},{signal:o})),n.querySelector(`#commToComposer`)?.addEventListener(`click`,()=>{w.tab=`compositor`,E(e)},{signal:o}),n.querySelectorAll(`.comm-seg-btn`).forEach(e=>e.addEventListener(`click`,()=>{let t=w.contactos.find(t=>t.alumnoId===e.dataset.id);t&&Et(null,null,t)},{signal:o}))}function Nt(e){let n=g(e.whatsapp);return`<tr>
    <td><input class="form-check-input comm-row-check" type="checkbox" data-id="${e.alumnoId}" ${w.seleccion.has(e.alumnoId)?`checked`:``}></td>
    <td class="fw-semibold">${t(e.alumno||``)}</td>
    <td><span class="badge bg-light text-dark border">${t(e.instrumento||`—`)}</span></td>
    <td class="small">${t(e.contactoNombre||``)}</td>
    <td class="small">${n?`<i class="bi bi-whatsapp text-success"></i> ${t(e.whatsapp)}`:`<span class="text-muted">—</span>`}</td>
    <td class="small">${e.email?`<i class="bi bi-envelope text-primary"></i> ${t(e.email)}`:`<span class="text-muted">—</span>`}</td>
    <td><button class="btn btn-sm btn-outline-primary comm-seg-btn" data-id="${e.alumnoId}" title="Registrar seguimiento"><i class="bi bi-telephone-plus"></i></button></td>
  </tr>`}function O(){return w.contactos.filter(e=>w.seleccion.has(e.alumnoId))}function k(e,n){let r=O();if(r.length===0){n.innerHTML=`<div class="alert alert-info"><i class="bi bi-info-circle me-1"></i>
      No hay destinatarios. Andá al <button class="btn btn-link btn-sm p-0 align-baseline" id="commGoDir">Directorio</button> y seleccioná contactos.</div>`,n.querySelector(`#commGoDir`)?.addEventListener(`click`,()=>{w.tab=`directorio`,E(e)},{signal:T.signal});return}let i=r.filter(e=>g(e.whatsapp)).length,a=r.filter(e=>e.email).length,o=w.plantillas;n.innerHTML=`
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="btn-group mb-3" role="group">
              <button class="btn btn-sm ${w.canal===`whatsapp`?`btn-success`:`btn-outline-success`} comm-canal" data-canal="whatsapp">
                <i class="bi bi-whatsapp me-1"></i>WhatsApp (${i})
              </button>
              <button class="btn btn-sm ${w.canal===`email`?`btn-primary`:`btn-outline-primary`} comm-canal" data-canal="email">
                <i class="bi bi-envelope me-1"></i>Correo (${a})
              </button>
            </div>

            <div class="mb-2">
              <label class="form-label small fw-semibold d-flex justify-content-between">
                <span>Plantilla</span>
                <span class="text-muted">Variables: insertá con los botones</span>
              </label>
              <select class="form-select form-select-sm mb-2" id="commTpl">
                <option value="">— Sin plantilla (escribir desde cero) —</option>
                ${o.map(e=>`<option value="${e.id}">${t(e.nombre)} · ${t(e.tipo||``)}</option>`).join(``)}
              </select>
            </div>

            ${w.canal===`email`?`<div class="mb-2"><input type="text" class="form-control form-control-sm" id="commAsunto"
                     placeholder="Asunto del correo" value="${t(w.asunto)}"></div>`:``}

            <div class="mb-2 d-flex flex-wrap gap-1">
              ${Dt.map(e=>`<button class="btn btn-outline-secondary btn-sm py-0 comm-var" data-var="${e}">${e}</button>`).join(``)}
            </div>

            <textarea class="form-control" id="commMsg" rows="8" placeholder="Escribí el mensaje...">${t(w.mensaje)}</textarea>

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
            <h6 class="fw-bold mb-2"><i class="bi bi-people me-1"></i>${r.length} destinatarios</h6>
            <div class="comm-recipients mb-3">
              ${r.slice(0,40).map(e=>`<span class="badge bg-light text-dark border me-1 mb-1">${t(e.alumno)}</span>`).join(``)}
              ${r.length>40?`<span class="badge bg-secondary">+${r.length-40} más</span>`:``}
            </div>
            <div id="commActionZone"></div>
          </div>
        </div>
      </div>
    </div>
  `;let s=T.signal;n.querySelectorAll(`.comm-canal`).forEach(t=>t.addEventListener(`click`,()=>{w.canal=t.dataset.canal,k(e,n)},{signal:s}));let c=n.querySelector(`#commMsg`);c?.addEventListener(`input`,e=>{w.mensaje=e.target.value},{signal:s}),n.querySelector(`#commAsunto`)?.addEventListener(`input`,e=>{w.asunto=e.target.value},{signal:s}),n.querySelector(`#commTpl`)?.addEventListener(`change`,t=>{let r=w.plantillas.find(e=>e.id===t.target.value);r&&(w.mensaje=r.contenido||``,k(e,n))},{signal:s}),n.querySelectorAll(`.comm-var`).forEach(e=>e.addEventListener(`click`,()=>{Ht(c,e.dataset.var),w.mensaje=c.value},{signal:s})),n.querySelector(`#commIA`)?.addEventListener(`click`,()=>Lt(e,n,``),{signal:s}),n.querySelector(`#commIAOpts`)?.addEventListener(`click`,()=>Rt(e,n),{signal:s}),Pt(e,n)}function Pt(e,t){let n=t.querySelector(`#commActionZone`);if(!n)return;let r=O();if(w.canal===`whatsapp`)n.innerHTML=`
      <button class="btn btn-success w-100" id="commGenWa">
        <i class="bi bi-whatsapp me-1"></i>Generar links de WhatsApp
      </button>
      <p class="text-muted small mt-2 mb-0">Se abre un link por contacto con el mensaje pre-cargado (personalizado con sus variables). Hacés clic y se envía desde tu WhatsApp.</p>
      <div id="commWaLinks" class="mt-2"></div>
    `,t.querySelector(`#commGenWa`)?.addEventListener(`click`,()=>Ft(t),{signal:T.signal});else{let e=r.filter(e=>e.email);n.innerHTML=`
      <button class="btn btn-primary w-100" id="commSendMail" ${e.length===0?`disabled`:``}>
        <i class="bi bi-send me-1"></i>Enviar a ${e.length} correo${e.length===1?``:`s`}
      </button>
      <p class="text-muted small mt-2 mb-0">El correo va por la fundación (Resend). Los destinatarios van en copia oculta (bcc).</p>
    `,t.querySelector(`#commSendMail`)?.addEventListener(`click`,()=>It(t),{signal:T.signal})}}function Ft(e){let n=O().filter(e=>g(e.whatsapp)),r=e.querySelector(`#commWaLinks`);if(n.length===0){r.innerHTML=`<div class="alert alert-warning small mb-0">Ningún destinatario tiene un WhatsApp válido.</div>`;return}r.innerHTML=`
    <div class="d-grid gap-1 comm-wa-list">
      ${n.map(e=>`<a href="${Re(e.whatsapp,ze(w.mensaje,e))}" target="_blank" rel="noopener" class="btn btn-outline-success btn-sm text-start">
            <i class="bi bi-whatsapp me-1"></i>${t(e.alumno)} <span class="text-muted">— ${t(e.contactoNombre)}</span>
          </a>`).join(``)}
    </div>
    <button class="btn btn-link btn-sm mt-1 p-0" id="commWaAll">Abrir todos (puede bloquear el navegador)</button>
  `,e.querySelector(`#commWaAll`)?.addEventListener(`click`,()=>{n.forEach(e=>window.open(Re(e.whatsapp,ze(w.mensaje,e)),`_blank`,`noopener`))},{signal:T.signal})}async function It(t){let n=O().filter(e=>e.email),r=w.asunto.trim(),i=w.mensaje.trim();if(!r){e.show(`Falta el asunto del correo`,`error`);return}if(!i){e.show(`El mensaje está vacío`,`error`);return}let a=t.querySelector(`#commSendMail`),o=a.innerHTML;a.disabled=!0,a.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Enviando...`;try{let t=Ut(ze(i,n[0])),a=await Ze({to:n.map(e=>e.email),subject:r,html:t});e.show(`Correo enviado a ${a.enviados} de ${a.total} destinatarios`,a.fallidos?`warning`:`success`)}catch(t){e.show(`Error: ${t.message}`,`error`)}finally{a.disabled=!1,a.innerHTML=o}}async function Lt(t,n,r){let i=w.mensaje.trim();if(!i){e.show(`Escribí algo primero para mejorarlo`,`error`);return}let a=n.querySelector(`#commIA`),o=a?.innerHTML;a&&(a.disabled=!0,a.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Mejorando...`);try{w.mensaje=await $e(i,r),k(t,n),e.show(`Mensaje mejorado con IA`,`success`)}catch(t){e.show(`IA no disponible: ${t.message}`,`error`),a&&o&&(a.disabled=!1,a.innerHTML=o)}}function Rt(e,t){r.open({title:`Ajustar tono con IA`,body:`
      <p class="small text-muted">Elegí cómo querés que la IA reescriba el mensaje:</p>
      <div class="d-grid gap-2">
        ${[`Más formal`,`Más cálido y cercano`,`Más corto y directo`,`Más motivador`,`Corregir ortografía y gramática`].map(e=>`<button class="btn btn-outline-primary comm-tono" data-tono="${e}">${e}</button>`).join(``)}
      </div>`,hideSave:!0,cancelText:`Cerrar`}),setTimeout(()=>{document.querySelectorAll(`.comm-tono`).forEach(n=>n.addEventListener(`click`,()=>{r.close(),Lt(e,t,n.dataset.tono)},{once:!0}))},50)}function zt(e,t){t.innerHTML=`
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted small mb-0">Plantillas reutilizables para mensajes y correos. Usá variables como {nombre_alumno}.</p>
      <button class="btn btn-primary btn-sm" id="commNewTpl"><i class="bi bi-plus-lg me-1"></i>Nueva plantilla</button>
    </div>
    <div class="row g-2">
      ${w.plantillas.length===0?`<div class="col-12"><div class="alert alert-info">Aún no hay plantillas.</div></div>`:w.plantillas.map(Bt).join(``)}
    </div>
  `;let n=T.signal;t.querySelector(`#commNewTpl`)?.addEventListener(`click`,()=>Vt(e,null),{signal:n}),t.querySelectorAll(`.comm-tpl-edit`).forEach(t=>t.addEventListener(`click`,()=>Vt(e,w.plantillas.find(e=>e.id===t.dataset.id)),{signal:n})),t.querySelectorAll(`.comm-tpl-use`).forEach(t=>t.addEventListener(`click`,()=>{w.mensaje=w.plantillas.find(e=>e.id===t.dataset.id)?.contenido||``,w.tab=`compositor`,E(e)},{signal:n}))}function Bt(e){return`<div class="col-md-6 col-xl-4">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="fw-bold mb-1">${t(e.nombre)}</h6>
          <span class="badge bg-light text-dark border">${t(e.tipo||`mensaje`)}</span>
        </div>
        <p class="text-muted small mb-2">${t(e.descripcion||``)}</p>
        <p class="small comm-tpl-preview">${t((e.contenido||``).slice(0,120))}${(e.contenido||``).length>120?`…`:``}</p>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary comm-tpl-use" data-id="${e.id}"><i class="bi bi-pencil-square me-1"></i>Usar</button>
          <button class="btn btn-sm btn-outline-secondary comm-tpl-edit" data-id="${e.id}"><i class="bi bi-gear"></i></button>
        </div>
      </div>
    </div>
  </div>`}function Vt(n,i){let a=!i;r.open({title:a?`Nueva plantilla`:`Editar plantilla`,size:`lg`,body:`
      <div class="mb-2"><label class="form-label small fw-semibold">Nombre *</label>
        <input type="text" class="form-control form-control-sm" id="tplNombre" value="${t(i?.nombre||``)}"></div>
      <div class="row g-2 mb-2">
        <div class="col-6"><label class="form-label small fw-semibold">Tipo</label>
          <select class="form-select form-select-sm" id="tplTipo">
            ${[`mensaje`,`correo`,`carta`].map(e=>`<option value="${e}" ${i?.tipo===e?`selected`:``}>${e}</option>`).join(``)}
          </select></div>
        <div class="col-6"><label class="form-label small fw-semibold">Descripción</label>
          <input type="text" class="form-control form-control-sm" id="tplDesc" value="${t(i?.descripcion||``)}"></div>
      </div>
      <div class="mb-1"><label class="form-label small fw-semibold">Contenido</label>
        <div class="mb-1 d-flex flex-wrap gap-1">
          ${Dt.map(e=>`<button type="button" class="btn btn-outline-secondary btn-sm py-0 tplVar" data-var="${e}">${e}</button>`).join(``)}
        </div>
        <textarea class="form-control" id="tplContenido" rows="6">${t(i?.contenido||``)}</textarea>
      </div>
    `,saveText:a?`Crear`:`Guardar`,deleteText:`Eliminar`,onDelete:a?null:async()=>{try{await Xe(i.id),w.plantillas=w.plantillas.filter(e=>e.id!==i.id),e.show(`Plantilla eliminada`,`success`),E(n)}catch(t){return e.show(`Error: ${t.message}`,`error`),!1}},onSave:async t=>{let r=t.querySelector(`#tplNombre`).value.trim();if(!r)return e.show(`El nombre es obligatorio`,`error`),!1;let a={id:i?.id,nombre:r,tipo:t.querySelector(`#tplTipo`).value,descripcion:t.querySelector(`#tplDesc`).value.trim(),contenido:t.querySelector(`#tplContenido`).value,variables:Dt.filter(e=>t.querySelector(`#tplContenido`).value.includes(e)).map(e=>e.replace(/[{}]/g,``))};try{let t=await Ye(a),r=w.plantillas.findIndex(e=>e.id===t.id);r>=0?w.plantillas[r]=t:w.plantillas.push(t),e.show(`Plantilla guardada`,`success`),E(n)}catch(t){return e.show(`Error: ${t.message}`,`error`),!1}}}),setTimeout(()=>{document.querySelectorAll(`.tplVar`).forEach(e=>e.addEventListener(`click`,()=>{Ht(document.querySelector(`#tplContenido`),e.dataset.var)}))},50)}function Ht(e,t){if(!e)return;let n=e.selectionStart??e.value.length,r=e.selectionEnd??e.value.length;e.value=e.value.slice(0,n)+t+e.value.slice(r),e.focus(),e.selectionStart=e.selectionEnd=n+t.length}function Ut(e){return`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1f2937">
    ${t(e).replace(/\n/g,`<br>`)}
  </div>`}async function A(n,r){let a=await i(()=>import(`./boletinesService-BS6UlP4L.js`).then(e=>e.t),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])),o=a.obtenerBoletinesEnviados(),s={ausencia_irregular:{label:`Ausencia Irregular`,css:`bg-danger-subtle text-danger border border-danger-subtle`},desempeno_bajo:{label:`Desempeño Bajo`,css:`bg-warning-subtle text-warning-emphasis border border-warning-subtle`},logro_pedagogico:{label:`Logro Pedagógico`,css:`bg-success-subtle text-success border border-success-subtle`},cumpleanos:{label:`Cumpleaños`,css:`bg-info-subtle text-info-emphasis border border-info-subtle`}};r.innerHTML=`
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-3 mb-3">
          <div class="card-body p-3">
            <h6 class="card-title fw-bold mb-2"><i class="bi bi-gear-fill text-primary"></i> Disparadores de Boletines</h6>
            <p class="text-muted small">Simula los disparos automáticos del sistema o tareas programadas (Fase 1).</p>
            <div class="d-grid gap-2">
              <button class="btn btn-outline-danger btn-sm text-start" id="btnRunAusencias">
                <i class="bi bi-calendar-x me-1"></i> Verificar Ausencias Semanales
              </button>
              <button class="btn btn-outline-info btn-sm text-start" id="btnRunCumpleanos">
                <i class="bi bi-gift me-1"></i> Verificar Cumpleaños Diarios
              </button>
              <button class="btn btn-outline-success btn-sm text-start" id="btnRunAvanceMock">
                <i class="bi bi-trophy me-1"></i> Simular Avance Pedagógico (Logro)
              </button>
            </div>
            <hr class="my-3">
            <div class="bg-light p-2 rounded-2 small text-muted">
              <i class="bi bi-info-circle me-1"></i> En producción, estos disparadores corren como tareas programadas (cron jobs) o ganchos del servidor.
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0"><i class="bi bi-clock-history"></i> Boletines Enviados Recientemente</h6>
              <span class="badge bg-secondary rounded-pill small">${o.length} en total</span>
            </div>

            ${o.length===0?`
              <div class="text-center py-5 text-muted">
                <i class="bi bi-chat-left-dots fs-1 mb-2 d-block"></i>
                No se han disparado boletines automáticos todavía hoy.
              </div>
            `:`
              <div class="table-responsive" style="max-height: 450px;">
                <table class="table table-hover align-middle table-sm border-0">
                  <thead>
                    <tr class="table-light">
                      <th class="border-0 small">Fecha y Hora</th>
                      <th class="border-0 small">Estudiante</th>
                      <th class="border-0 small">Tipo</th>
                      <th class="border-0 small">Mensaje Pre-cargado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${o.map(e=>{let n=s[e.tipo]||{label:e.tipo,css:`bg-secondary`};return`
                        <tr>
                          <td class="small text-muted">${new Date(e.fecha_envio).toLocaleString(`es-ES`,{month:`short`,day:`numeric`,hour:`2-digit`,minute:`2-digit`})}</td>
                          <td>
                            <div class="fw-semibold small">${t(e.alumno_nombre)}</div>
                            <div class="text-muted small" style="font-size:11px">${t(e.contacto_nombre)} (${t(e.contacto_telefono)})</div>
                          </td>
                          <td><span class="badge rounded-pill ${n.css} small" style="font-size:10px">${n.label}</span></td>
                          <td class="small text-muted" style="max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" 
                              title="${t(e.mensaje)}">${t(e.mensaje)}</td>
                        </tr>
                      `}).join(``)}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `,r.querySelector(`#btnRunAusencias`).addEventListener(`click`,async()=>{try{let t=await a.procesarAusenciasSemanales();e.show(`Simulación completada: ${t.procesados} estudiantes analizados, ${t.enviados} boletines enviados.`,`success`),A(n,r)}catch(t){e.show(`Error: ${t.message}`,`error`)}}),r.querySelector(`#btnRunCumpleanos`).addEventListener(`click`,async()=>{try{let t=await a.procesarCumpleanosDiarios();e.show(`Simulación completada: ${t.enviados} saludos de cumpleaños enviados.`,`success`),A(n,r)}catch(t){e.show(`Error: ${t.message}`,`error`)}}),r.querySelector(`#btnRunAvanceMock`).addEventListener(`click`,async()=>{try{await a.procesarAvancePedagogico(`1`,`demo-ind-2`),e.show(`Simulación completada: Logro pedagógico registrado y notificado.`,`success`),A(n,r)}catch(t){e.show(`Error: ${t.message}`,`error`)}})}function j(e,t=18){let n=new Date;return n.setDate(n.getDate()+e),n.setHours(t,0,0,0),n.toISOString()}j(12),j(12,21),j(3,8),j(20,17),j(8,15),j(8,18),j(5,10),j(5,12),j(25,9),j(25,10);var Wt=n({getEventos:()=>qt}),Gt=`calendario_institucional`,Kt=`id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, departamento_responsable, estado`;async function qt(e={}){let t=e.desde||new Date().toISOString(),n=e.dias??120,r=new Date(new Date(t).getTime()+n*864e5).toISOString(),i=a.from(Gt).select(Kt).gte(`fecha_inicio`,t).lte(`fecha_inicio`,r);e.categoria&&e.categoria!==`todas`&&(i=i.eq(`categoria`,e.categoria));let{data:o,error:s}=await i.order(`fecha_inicio`,{ascending:!0});if(s)throw s;return o||[]}var Jt=Wt.getEventos,M={concierto:{label:`Concierto`,icon:`bi-music-note-beamed`,color:`primary`},ensayo:{label:`Ensayo`,icon:`bi-music-note`,color:`info`},reunion:{label:`Reunión`,icon:`bi-people`,color:`secondary`},patrocinio:{label:`Patrocinio`,icon:`bi-gift`,color:`success`},pago:{label:`Pago`,icon:`bi-cash-coin`,color:`warning`},corte:{label:`Corte`,icon:`bi-scissors`,color:`dark`},inscripcion:{label:`Inscripción`,icon:`bi-person-plus`,color:`primary`},auditoria:{label:`Auditoría`,icon:`bi-shield-check`,color:`secondary`},otro:{label:`Otro`,icon:`bi-calendar-event`,color:`secondary`}},Yt=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`];function Xt(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function N(e,t=new Date){return e?.fecha_inicio?Math.round((Xt(e.fecha_inicio)-Xt(t))/864e5):null}function Zt(e,t=30,n=new Date){let r=N(e,n);return r!==null&&r>=0&&r<=t}function Qt(e=[]){let t=new Map;for(let n of e){if(!n?.fecha_inicio)continue;let e=new Date(n.fecha_inicio),r=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}`;t.has(r)||t.set(r,{clave:r,label:`${Yt[e.getMonth()]} ${e.getFullYear()}`,eventos:[]}),t.get(r).eventos.push(n)}let n=[...t.values()].sort((e,t)=>e.clave.localeCompare(t.clave));for(let e of n)e.eventos.sort((e,t)=>new Date(e.fecha_inicio)-new Date(t.fecha_inicio));return n}var P={eventos:[],filtroCategoria:`todas`},F=null;async function $t(e){F?.abort(),F=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{P.eventos=await Jt({dias:120}),en(e)}catch(n){console.error(`[CalendarioCom] Error:`,n),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar el calendario</h5>
      <p>${t(n.message)}</p></div></div>`}return{teardown:()=>F?.abort()}}function en(e){let t=Qt(P.filtroCategoria===`todas`?P.eventos:P.eventos.filter(e=>e.categoria===P.filtroCategoria)),n=P.eventos.filter(e=>Zt(e,7)).length,r=P.eventos.filter(e=>Zt(e,30)).length,i=P.eventos.find(e=>e.categoria===`concierto`&&N(e)>=0),a=[...new Set(P.eventos.map(e=>e.categoria))];e.innerHTML=`
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
        ${tn(`Próximos 7 días`,n,`danger`)}
        ${tn(`Próximos 30 días`,r,`warning`)}
        ${tn(`Total en agenda`,P.eventos.length,`primary`)}
        ${i?`<div class="kpi-card bg-info bg-opacity-10 p-2 rounded">
                 <small class="text-muted">Próximo concierto</small>
                 <div class="fw-bold text-info">${N(i)} día${N(i)===1?``:`s`}</div>
               </div>`:``}
      </div>

      <div class="d-flex gap-2 flex-wrap mb-3">
        <button class="btn btn-sm ${P.filtroCategoria===`todas`?`btn-primary`:`btn-outline-secondary`} cal-cat" data-cat="todas">Todas</button>
        ${a.map(e=>{let t=M[e]||M.otro;return`<button class="btn btn-sm ${P.filtroCategoria===e?`btn-primary`:`btn-outline-secondary`} cal-cat" data-cat="${e}">
              <i class="bi ${t.icon} me-1"></i>${t.label}</button>`}).join(``)}
      </div>

      <div id="calAgenda">
        ${t.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-calendar-x"></i> No hay eventos próximos para este filtro</div>`:t.map(nn).join(``)}
      </div>
    </div>
  `;let o=F.signal;e.querySelectorAll(`.cal-cat`).forEach(t=>t.addEventListener(`click`,()=>{P.filtroCategoria=t.dataset.cat,en(e)},{signal:o}))}function tn(e,t,n){return`<div class="kpi-card bg-${n} bg-opacity-10 p-2 rounded">
    <small class="text-muted">${e}</small>
    <div class="fs-5 fw-bold text-${n}">${t}</div>
  </div>`}function nn(e){return`
    <div class="mb-4">
      <h6 class="fw-bold text-uppercase small text-muted mb-2 border-bottom pb-1">${t(e.label)}</h6>
      ${e.eventos.map(rn).join(``)}
    </div>
  `}function rn(e){let n=M[e.categoria]||M.otro,r=N(e),i=new Date(e.fecha_inicio),a=i.toLocaleDateString(`es-DO`,{weekday:`short`,day:`2-digit`,month:`short`}),o=i.toLocaleTimeString(`es-DO`,{hour:`2-digit`,minute:`2-digit`}),s=r===0?`Hoy`:r===1?`Mañana`:r>0?`En ${r} días`:`Pasado`;return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex align-items-start gap-3">
          <div class="text-center flex-shrink-0" style="width:54px">
            <div class="badge bg-${n.color} bg-opacity-10 text-${n.color} border border-${n.color}-subtle w-100 py-1">
              <i class="bi ${n.icon}"></i>
            </div>
            <div class="extra-small text-muted mt-1">${s}</div>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold">${t(e.titulo)}</div>
            <div class="small text-secondary">${t(e.descripcion||``)}</div>
            <div class="d-flex flex-wrap gap-3 mt-1 small text-muted">
              <span><i class="bi bi-calendar3 me-1"></i>${a} · ${o}</span>
              ${e.ubicacion&&e.ubicacion!==`—`?`<span><i class="bi bi-geo-alt me-1"></i>${t(e.ubicacion)}</span>`:``}
              <span><i class="bi bi-building me-1"></i>${t(e.departamento_responsable||``)}</span>
              <span class="badge bg-${n.color} bg-opacity-75">${n.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function an(){o.register(`comunicaciones`,e=>Ot(e)),o.register(`com-seguimiento`,e=>C(e)),o.register(`com-calendario`,e=>$t(e))}var I=(e,t)=>({id:`mock-dep-${e.toLowerCase()}`,codigo:e,nombre:t,descripcion:null,email:null,responsable_nombre:null,responsable_email:null,activo:!0,updated_at:new Date().toISOString()});I(`DIR`,`Dirección`),I(`ACM`,`Académica`),I(`ADM`,`Administración`),I(`FIN`,`Financiero`),I(`COM`,`Comunicaciones`),I(`LOG`,`Logística`),I(`TECNICO`,`Técnico`);var on=n({actualizarDepartamento:()=>un,enviarCorreoPrueba:()=>dn,getDepartamentos:()=>ln}),sn=`departamentos`,cn=`id, codigo, nombre, descripcion, email, responsable_nombre, responsable_email, activo, updated_at`;async function ln(){let{data:e,error:t}=await a.from(sn).select(cn).order(`codigo`,{ascending:!0});if(t)throw t;return e||[]}async function un(e,t={}){let n={};t.nombre!==void 0&&(n.nombre=t.nombre),t.email!==void 0&&(n.email=t.email||null),t.responsable_nombre!==void 0&&(n.responsable_nombre=t.responsable_nombre||null),t.responsable_email!==void 0&&(n.responsable_email=t.responsable_email||null),t.activo!==void 0&&(n.activo=t.activo),n.updated_at=new Date().toISOString();let{data:r,error:i}=await a.from(sn).update(n).eq(`id`,e).select(cn).single();if(i)throw i;return r}async function dn(e,t=``){let{data:n,error:r}=await a.functions.invoke(`send-email`,{body:{to:e,subject:`Correo de prueba — Departamento ${t}`.trim(),html:`<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#1f2937">
        <p>Este es un <strong>correo de prueba</strong> del SOI (El Sistema Punta Cana).</p>
        <p>Si lo recibís, la casilla del departamento <strong>${fn(t)}</strong> está configurada correctamente
        y Hermes podrá despachar correos a este destino. 🎻</p>
      </div>`}});if(r){let e=r.message;try{let t=await r.context?.json?.();t?.error&&(e=t.error)}catch{}throw Error(e)}if(n&&n.ok===!1&&n.enviados===0)throw Error(n.batches?.[0]?.error||`No se pudo enviar el correo de prueba`);return n}function fn(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}var pn=on,mn=pn.getDepartamentos,hn=pn.actualizarDepartamento,gn=pn.enviarCorreoPrueba,_n=/^[^@\s]+@[^@\s]+\.[^@\s]+$/,L=null;async function vn(e){L?.abort(),L=new AbortController,e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height:300px">
    <div class="spinner-border text-primary"></div></div>`;try{yn(e,await mn())}catch(n){console.error(`[Departamentos] Error:`,n),e.innerHTML=`<div class="container mt-4"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar departamentos</h5>
      <p>${t(n.message)}</p></div></div>`}return{teardown:()=>L?.abort()}}function yn(e,t){let n=t.filter(e=>!e.email).length;e.innerHTML=`
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
              ${n} departamento${n===1?``:`s`} sin correo definido. Hermes no podrÃ¡ enviarles hasta cargarlo.</div>`:`<div class="alert alert-success small py-2"><i class="bi bi-check-circle me-1"></i>
              Todos los departamentos tienen correo configurado.</div>`}

      <div class="row g-3">
        ${t.map(bn).join(``)}
      </div>
    </div>
  `,xn(e,t)}function bn(e){return`
    <div class="col-12 col-lg-6">
      <div class="card border-0 shadow-sm h-100 dep-card" data-id="${e.id}">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary">${t(e.codigo)}</span>
              <input type="text" class="form-control form-control-sm dep-nombre" style="max-width:200px"
                value="${t(e.nombre||``)}">
            </div>
            <div class="form-check form-switch m-0" title="Activo">
              <input class="form-check-input dep-activo" type="checkbox" ${e.activo?`checked`:``}>
            </div>
          </div>

          <label class="form-label small fw-semibold mb-1">Correo institucional</label>
          <input type="email" class="form-control form-control-sm mb-2 dep-email"
            placeholder="ej. finanzas@funeyca.org" value="${t(e.email||``)}">

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Responsable</label>
              <input type="text" class="form-control form-control-sm dep-resp-nombre"
                placeholder="Nombre" value="${t(e.responsable_nombre||``)}">
            </div>
            <div class="col-6">
              <label class="form-label small fw-semibold mb-1">Correo responsable</label>
              <input type="email" class="form-control form-control-sm dep-resp-email"
                placeholder="opcional" value="${t(e.responsable_email||``)}">
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-primary dep-save" data-id="${e.id}">
              <i class="bi bi-check-lg me-1"></i>Guardar
            </button>
            <button class="btn btn-sm btn-outline-secondary dep-test" data-id="${e.id}" data-codigo="${t(e.codigo)}"
              ${e.email?``:`disabled`} title="${e.email?`Enviar correo de prueba`:`CargÃ¡ un correo primero`}">
              <i class="bi bi-send me-1"></i>Probar
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function xn(e,t){let n=L.signal;e.querySelectorAll(`.dep-save`).forEach(r=>r.addEventListener(`click`,()=>Sn(e,t,r),{signal:n})),e.querySelectorAll(`.dep-test`).forEach(t=>t.addEventListener(`click`,()=>Cn(e,t),{signal:n}))}async function Sn(t,n,r){let i=r.closest(`.dep-card`),a=i.querySelector(`.dep-nombre`).value.trim(),o=i.querySelector(`.dep-email`).value.trim(),s=i.querySelector(`.dep-resp-nombre`).value.trim(),c=i.querySelector(`.dep-resp-email`).value.trim(),l=i.querySelector(`.dep-activo`).checked;if(!a){e.show(`El nombre es obligatorio`,`error`);return}if(o&&!_n.test(o)){e.show(`El correo institucional no es vÃ¡lido`,`error`);return}if(c&&!_n.test(c)){e.show(`El correo del responsable no es vÃ¡lido`,`error`);return}let u=r.innerHTML;r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;try{let i=await hn(r.dataset.id,{nombre:a,email:o,activo:l,responsable_nombre:s,responsable_email:c}),u=n.findIndex(e=>e.id===i.id);u>=0&&(n[u]=i),e.show(`${i.codigo} actualizado`,`success`),yn(t,n)}catch(t){e.show(`Error: ${t.message}`,`error`),r.disabled=!1,r.innerHTML=u}}async function Cn(t,n){let r=n.closest(`.dep-card`).querySelector(`.dep-email`).value.trim();if(!r||!_n.test(r)){e.show(`CargÃ¡ un correo vÃ¡lido antes de probar`,`error`);return}let i=n.innerHTML;n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`;try{await gn(r,n.dataset.codigo),e.show(`Correo de prueba enviado a ${r}`,`success`)}catch(t){e.show(`No se pudo enviar: ${t.message}`,`error`)}finally{n.disabled=!1,n.innerHTML=i}}function wn(){o.register(`departamentos`,e=>vn(e))}async function Tn(){let{data:e,error:t}=await a.from(`campanias_periodo`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw t;return e??[]}async function En(e){let{data:t,error:n}=await a.from(`campanias_periodo`).insert(e).select().single();if(n)throw n;return t}async function Dn(e,t){let{data:n,error:r}=await a.from(`campanias_periodo`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(r)throw r;return n}async function On(e){return Dn(e,{activo:!1})}async function kn(e){let{data:t,error:n}=await a.rpc(`fn_preview_campania`,{p_id:e});if(n)throw n;return t}async function An(e){let{data:t,error:n}=await a.rpc(`fn_activar_campania`,{p_id:e});if(n)throw n;return t}async function jn(e,t=null){let{data:n,error:r}=await a.rpc(`fn_encolar_campania`,{p_campania_id:e,p_limite:t});if(r)throw r;return n}var R={campanias:[],seleccionada:null,preview:null,cargando:!1},Mn={inscripcion:`Inscripción`,reinscripcion:`Reinscripción`};async function Nn(e){await z(e)}async function z(e){try{Pn(e),R.campanias=await Tn(),B(e)}catch(t){Fn(e,t.message)}}function Pn(e){e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <h1 class="h3 fw-bold mb-4">Períodos / Campañas</h1>
      <div class="d-flex justify-content-center py-5"><div class="spinner-border text-primary"></div></div>
    </div>`}function Fn(e,t){e.innerHTML=`
    <div class="container py-5 text-center">
      <div class="alert alert-danger border-0 shadow-sm p-4 rounded-3">
        <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
        <h4 class="fw-bold">Error al cargar campañas</h4>
        <p>${V(t)}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-retry">Reintentar</button>
      </div>
    </div>`,document.getElementById(`btn-retry`)?.addEventListener(`click`,()=>Nn(e))}function B(e){let t=R.campanias.find(e=>e.id===R.seleccionada)||null;e.innerHTML=`
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
          ${In()}
        </div>
        <div class="col-12 col-lg-5">
          ${Ln()}
          ${t?Rn(t):``}
        </div>
      </div>
    </div>`,zn(e)}function In(){return R.campanias.length===0?`<div class="card border-0 shadow-sm rounded-3"><div class="card-body text-body-secondary text-center py-5">
      <i class="bi bi-megaphone fs-1 d-block mb-2 opacity-50"></i>No hay campañas. Creá una a la derecha.</div></div>`:`<div class="card border-0 shadow-sm rounded-3 overflow-hidden">
    <div class="list-group list-group-flush">${R.campanias.map(e=>{let t=e.activo,n=e.id===R.seleccionada;return`
      <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2 ${n?`active`:``}" data-sel="${e.id}">
        <span class="text-truncate">
          <span class="fw-semibold">${V(e.nombre)}</span>
          <span class="badge text-bg-secondary ms-1">${Mn[e.accion]||e.accion} ${V(e.tipo)}</span>
          <br><small class="${n?``:`text-body-secondary`}">${V(e.fecha_inicio)} → ${V(e.fecha_fin)}</small>
        </span>
        <span class="badge rounded-pill ${t?`text-bg-success`:`text-bg-light`}">${t?`Activa`:`Inactiva`}</span>
      </button>`}).join(``)}</div></div>`}function Ln(){return`
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
    </div>`}function Rn(e){let t=R.preview,n;if(R.cargando)n=`<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>`;else if(!t)n=`<p class="text-body-secondary small mb-0">Previsualizá la audiencia antes de activar.</p>`;else if(t.accion===`inscripcion`){let e=t.primer_contacto+t.recuperacion>t.cupo_disponible;n=`
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
        <h2 class="h6 fw-bold mb-2"><i class="bi bi-play-circle me-1"></i>${V(e.nombre)}</h2>
        ${n}
        <div class="d-flex gap-2 flex-wrap mt-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" id="btn-preview">
            <i class="bi bi-search me-1"></i>Previsualizar
          </button>
          <button class="btn btn-sm btn-primary rounded-pill px-3" id="btn-activar" ${R.preview?``:`disabled`}>
            <i class="bi bi-megaphone me-1"></i>Activar y materializar
          </button>
          ${e.activo?`<button class="btn btn-sm btn-success rounded-pill px-3" id="btn-encolar" title="Mueve una tanda a la cola respetando opt-out y tope diario">
            <i class="bi bi-send me-1"></i>Encolar tanda (anti-ban)
          </button>`:``}
          ${e.activo?`<button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-desactivar">Desactivar</button>`:``}
        </div>
      </div>
    </div>`}function zn(e){e.querySelectorAll(`[data-sel]`).forEach(t=>t.addEventListener(`click`,()=>{R.seleccionada=t.dataset.sel,R.preview=null,B(e)})),e.querySelector(`#form-campania`)?.addEventListener(`submit`,async t=>{t.preventDefault();let n=new FormData(t.target);try{R.seleccionada=(await En({nombre:n.get(`nombre`),accion:n.get(`accion`),tipo:n.get(`tipo`),fecha_inicio:n.get(`fecha_inicio`),fecha_fin:n.get(`fecha_fin`)})).id,R.preview=null,await z(e)}catch(e){alert(`Error al crear campaña: ${e.message}`)}}),e.querySelector(`#btn-preview`)?.addEventListener(`click`,async()=>{R.cargando=!0,B(e);try{R.preview=await kn(R.seleccionada)}catch(e){alert(`Error en preview: ${e.message}`)}finally{R.cargando=!1,B(e)}}),e.querySelector(`#btn-activar`)?.addEventListener(`click`,async()=>{if(confirm(`Esto materializa la audiencia deduplicada (no envía WhatsApps). ¿Continuar?`))try{let t=await An(R.seleccionada);alert(`Campaña activada. Audiencia materializada: ${t.materializados} contacto(s).`),R.preview=null,await z(e)}catch(e){alert(`Error al activar: ${e.message}`)}}),e.querySelector(`#btn-encolar`)?.addEventListener(`click`,async()=>{if(confirm(`Esto mueve una tanda a la cola de envío (respeta opt-out y tope diario). Los mensajes se despachan con ritmo anti-ban solo si el gateway está activo. ¿Continuar?`))try{let t=await jn(R.seleccionada);alert(`Encolados: ${t.encolados}. Tope hoy: ${t.cap_hoy} · Enviados hoy: ${t.enviados_hoy} · Restante: ${t.restante_tras_encolar}.`),await z(e)}catch(e){alert(`Error al encolar: ${e.message}`)}}),e.querySelector(`#btn-desactivar`)?.addEventListener(`click`,async()=>{try{await On(R.seleccionada),await z(e)}catch(e){alert(`Error al desactivar: ${e.message}`)}})}function V(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function Bn(){o.register(`campanias`,Nn)}async function Vn(){let{data:e,error:t}=await a.from(`hermes_whatsapp_config`).select(`*`).eq(`activo`,!0).single();if(t&&t.code!==`PGRST116`)throw t;return e||null}async function Hn(e){let t=await Vn();if(!t)throw Error(`No existe configuracion activa`);let{data:n,error:r}=await a.from(`hermes_whatsapp_config`).update(e).eq(`id`,t.id).select().single();if(r)throw r;return n}var H={config:null,edit:{},cargando:!0};async function Un(e){try{H.cargando=!0,H.config=await Vn(),U(e)}catch(t){Gn(e,t.message)}finally{H.cargando=!1}}async function Wn(e){if(Object.keys(H.edit).length)try{H.cargando=!0,H.config=await Hn(H.edit),H.edit={},U(e)}catch(t){Gn(e,t.message)}finally{H.cargando=!1}}function U(e){let{config:t,edit:n,cargando:r}=H;if(e.innerHTML=`
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
  `,t&&!r){let t=e.querySelector(`#inp_numero_wid`),n=e.querySelector(`#inp_numero_nombre`),r=e.querySelector(`#inp_cap_diario`),i=e.querySelector(`#inp_warmup_desde`),a=e.querySelector(`#btn_guardar`);t&&t.addEventListener(`change`,t=>{H.edit.numero_wid=t.target.value||null,U(e)}),n&&n.addEventListener(`change`,t=>{H.edit.numero_nombre=t.target.value||null,U(e)}),r&&r.addEventListener(`change`,t=>{H.edit.cap_diario=parseInt(t.target.value)||null,U(e)}),i&&i.addEventListener(`change`,t=>{H.edit.warmup_desde=t.target.value||null,U(e)}),a&&a.addEventListener(`click`,()=>Wn(e))}}function Gn(e,t){e.innerHTML=`<div style="color: red; padding: 20px;">Error: ${t}</div>`}function Kn(){o.register(`gateway-config`,Un)}var qn=[`creado`,`corriendo`,`pausado`,`finalizado`,`error`];async function Jn(e){let{data:t,error:n}=await a.from(`sim_runs`).select(`*`).eq(`id`,e).single();if(n)throw n;return t}async function W(e,t){if(!qn.includes(t))throw Error(`estado inválido: "${t}". Debe ser uno de: ${qn.join(`, `)}`);let{data:n,error:r}=await a.from(`sim_runs`).update({estado:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(r)throw r;return n}async function Yn(e,t){if(!(t>0))throw Error(`nuevaVelocidad debe ser mayor que 0`);let{data:n,error:r}=await a.from(`sim_runs`).update({velocidad:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(r)throw r;return n}async function Xn(e,t){let{data:n,error:r}=await a.from(`sim_runs`).update({fecha_actual_virtual:t,updated_at:new Date().toISOString()}).eq(`id`,e).select(`*`).single();if(r)throw r;return n}async function Zn(e){let{data:t,error:n}=await a.from(`sim_calendario`).select(`*`).eq(`run_id`,e).order(`fecha_inicio`,{ascending:!0});if(n)throw n;return t||[]}async function Qn(e,t){let n=new Date(t),r=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate(),0,0,0)),i=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate(),23,59,59,999)),{data:o,error:s}=await a.from(`sim_calendario`).select(`*`).eq(`run_id`,e).gte(`fecha_inicio`,r.toISOString()).lte(`fecha_inicio`,i.toISOString()).order(`fecha_inicio`,{ascending:!0});if(s)throw s;return o||[]}async function $n(e,{departamento:t=null}={}){let n=a.from(`sim_log`).select(`*`).eq(`run_id`,e);t&&(n=n.eq(`departamento`,t));let{data:r,error:i}=await n.order(`created_at`,{ascending:!1});if(i)throw i;return r||[]}async function er(e){let{data:t,error:n}=await a.from(`sim_outbox`).select(`*`).eq(`run_id`,e).order(`created_at`,{ascending:!1});if(n)throw n;return t||[]}async function tr({run_id:e,fecha_simulada:t,eventos:n}={}){if(!e)throw Error(`run_id es requerido para invocar simulador-tick`);if(!t)throw Error(`fecha_simulada es requerida para invocar simulador-tick`);let{data:r,error:i}=await a.functions.invoke(`simulador-tick`,{body:{run_id:e,fecha_simulada:t,eventos:n||[]}});if(i)throw Error(i.message||`Error al invocar simulador-tick`);if(r?.error)throw Error(r.error);return r}function nr({velocidad:e,onTick:t}){if(typeof e!=`number`||!(e>0))throw Error(`velocidad debe ser un número mayor que 0 (segundos reales por día simulado)`);if(typeof t!=`function`)throw Error(`onTick debe ser una función`);let n=e,r=`pausado`,i=null;function a(){i!=null&&(clearInterval(i),i=null)}function o(){a(),r===`corriendo`&&(i=setInterval(()=>{t()},n*1e3))}function s(){r!==`corriendo`&&(r=`corriendo`,o())}function c(){r=`pausado`,a()}function l(){r!==`corriendo`&&(r=`corriendo`,o())}function u(){r=`pausado`,a()}function d(e){if(typeof e!=`number`||!(e>0))throw Error(`nuevaVelocidad debe ser un número mayor que 0`);n=e,r===`corriendo`&&o()}function f(){return r}function p(){return n}return{start:s,pause:c,resume:l,stop:u,cambiarVelocidad:d,getEstado:f,getVelocidad:p}}var rr=Object.freeze({creado:Object.freeze({label:`Creado`,color:`secondary`}),corriendo:Object.freeze({label:`Corriendo`,color:`success`}),pausado:Object.freeze({label:`Pausado`,color:`warning`}),finalizado:Object.freeze({label:`Finalizado`,color:`primary`}),error:Object.freeze({label:`Error`,color:`danger`})}),ir=Object.freeze({pendiente:Object.freeze({label:`Pendiente`,color:`secondary`}),enviado:Object.freeze({label:`Enviado`,color:`success`}),fallido:Object.freeze({label:`Fallido`,color:`danger`})});function ar(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?`—`:t.toLocaleDateString(`es-ES`,{year:`numeric`,month:`long`,day:`numeric`})}function or(e){if(!e?.fecha_inicio_virtual||!e?.fecha_fin_virtual||!e?.fecha_actual_virtual)return 0;let t=new Date(e.fecha_inicio_virtual).getTime(),n=new Date(e.fecha_fin_virtual).getTime(),r=new Date(e.fecha_actual_virtual).getTime();if(Number.isNaN(t)||Number.isNaN(n)||Number.isNaN(r)||n<=t)return 0;let i=(r-t)/(n-t)*100;return Math.max(0,Math.min(100,Math.round(i)))}function sr(e){return rr[e]||{label:e,color:`secondary`}}function cr(e){return ir[e]||{label:e,color:`secondary`}}function lr(e){let t={};for(let n of e||[])n?.fecha_inicio&&(t[n.fecha_inicio]||(t[n.fecha_inicio]=[]),t[n.fecha_inicio].push(n));return t}var ur=`00000000-0000-0000-0000-000000000001`,dr=[1,2,5,10,30,60],fr=1440*60*1e3,G={run:null,cargando:!1,procesandoTick:!1},K=null,q=null;function pr(){q?.stop(),q=null}async function mr(t){if(!(!G.run||G.procesandoTick)){G.procesandoTick=!0;try{let n=new Date(G.run.fecha_actual_virtual),r=G.run.fecha_fin_virtual?new Date(G.run.fecha_fin_virtual):null,i=new Date(n.getTime()+fr);if(r&&i.getTime()>=r.getTime()){pr(),G.run=await W(G.run.id,`finalizado`),e.show(`Simulación finalizada: se alcanzó la fecha de fin`,`success`),J(t);return}let a=i.toISOString(),o=await Qn(G.run.id,a);o.length>0&&await tr({run_id:G.run.id,fecha_simulada:a,eventos:o}),G.run=await Xn(G.run.id,a),J(t)}catch(t){console.error(`[panelControlView] Error al avanzar el reloj:`,t.message),e.show(`Error al procesar el tick: ${t.message}`,`error`)}finally{G.procesandoTick=!1}}}function hr(e){return q||(q=nr({velocidad:G.run?.velocidad||10,onTick:()=>mr(e)}),q)}function J(e){K?.signal.aborted||(yr(e),br(e))}async function gr(e,t={}){K?.abort(),K=new AbortController;try{G.cargando=!0,_r(e),G.run=await Jn(t.runId||ur).catch(()=>null),G.cargando=!1,yr(e),br(e)}catch(t){console.error(`[panelControlView] Error:`,t.message),vr(e,t.message)}return{teardown:()=>{K?.abort(),pr()}}}function _r(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function vr(e,n){e.innerHTML=`
    <div class="alert alert-danger m-4">
      <i class="bi bi-exclamation-triangle"></i> Error: ${t(n)}
    </div>
  `}function yr(e){let n=G.run,r=n?sr(n.estado):null,i=n?or(n):0,a=n?.velocidad||10;e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-sliders fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Panel de Control</h1>
          <p class="text-muted small mb-0">Simulación operativa institucional (sandbox)</p>
        </div>
      </div>

      ${n?`
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1">${t(n.nombre)}</h5>
                <span class="badge bg-${r.color}">${r.label}</span>
              </div>
              <div class="text-end">
                <small class="text-muted d-block">Fecha simulada</small>
                <strong id="fechaSimuladaActual">${ar(n.fecha_actual_virtual)}</strong>
              </div>
            </div>

            <div class="progress mb-3" style="height: 10px;">
              <div class="progress-bar" style="width: ${i}%;"></div>
            </div>
            <small class="text-muted">${i}% completado</small>

            <div class="d-flex gap-2 flex-wrap mt-3">
              <button class="btn btn-success btn-sm" id="btnIniciar" ${n.estado===`corriendo`?`disabled`:``}>
                <i class="bi bi-play-fill me-1"></i>Iniciar
              </button>
              <button class="btn btn-warning btn-sm" id="btnPausar" ${n.estado===`corriendo`?``:`disabled`}>
                <i class="bi bi-pause-fill me-1"></i>Pausar
              </button>
              <button class="btn btn-outline-secondary btn-sm" id="btnReanudar" ${n.estado===`pausado`?``:`disabled`}>
                <i class="bi bi-arrow-clockwise me-1"></i>Reanudar
              </button>

              <select class="form-select form-select-sm" id="selectVelocidad" style="max-width: 160px;">
                ${dr.map(e=>`<option value="${e}" ${a===e?`selected`:``}>${e}s / día simulado</option>`).join(``)}
              </select>
            </div>
          </div>
        </div>`:`<div class="alert alert-info">
               <p class="mb-2">No hay corrida activa.</p>
               <button class="btn btn-primary btn-sm" id="btnCrearRun">
                 <i class="bi bi-plus-circle me-1"></i>Crear corrida desde seed
               </button>
             </div>`}
    </div>
  `}function br(t){let n=K.signal;t.querySelector(`#btnCrearRun`)?.addEventListener(`click`,async()=>{try{G.run=await Jn(ur),e.show(`Corrida demo cargada`,`success`),J(t)}catch(t){e.show(`Error al crear la corrida: ${t.message}`,`error`)}},{signal:n}),t.querySelector(`#btnIniciar`)?.addEventListener(`click`,async()=>{try{G.run=await W(G.run.id,`corriendo`),hr(t).start(),J(t)}catch(t){e.show(`Error al iniciar: ${t.message}`,`error`)}},{signal:n}),t.querySelector(`#btnPausar`)?.addEventListener(`click`,async()=>{try{q?.pause(),G.run=await W(G.run.id,`pausado`),J(t)}catch(t){e.show(`Error al pausar: ${t.message}`,`error`)}},{signal:n}),t.querySelector(`#btnReanudar`)?.addEventListener(`click`,async()=>{try{G.run=await W(G.run.id,`corriendo`),hr(t).resume(),J(t)}catch(t){e.show(`Error al reanudar: ${t.message}`,`error`)}},{signal:n}),t.querySelector(`#selectVelocidad`)?.addEventListener(`change`,async t=>{let n=parseInt(t.target.value,10);try{G.run=await Yn(G.run.id,n),q?.cambiarVelocidad(n),e.show(`Velocidad actualizada: ${n}s / día simulado`,`success`)}catch(t){e.show(`Error al cambiar velocidad: ${t.message}`,`error`)}},{signal:n})}var xr=`00000000-0000-0000-0000-000000000001`,Y={eventos:[],cargando:!1,runId:xr},Sr=null;async function Cr(e,t={}){Sr?.abort(),Sr=new AbortController,Y.runId=t.runId||xr;try{Y.cargando=!0,wr(e),Y.eventos=await Zn(Y.runId),Y.cargando=!1,Dr(e)}catch(t){console.error(`[calendarioRunView] Error:`,t.message),Tr(e,t.message)}return{teardown:()=>{Sr?.abort()}}}function wr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function Tr(e,n){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${t(n)}</div>`}var Er={programado:`secondary`,en_curso:`info`,completado:`success`,cancelado:`danger`};function Dr(e){let t=lr(Y.eventos),n=Object.keys(t).sort();e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-calendar-event fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Calendario de la Corrida</h1>
          <p class="text-muted small mb-0">${Y.eventos.length} evento(s) sembrado(s)</p>
        </div>
      </div>

      ${n.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> No hay eventos en esta corrida</div>`:n.map(e=>`
        <div class="mb-3">
          <h6 class="text-muted mb-2">${ar(e)}${t[e].length>1?` <span class="badge bg-info">${t[e].length} eventos concurrentes</span>`:``}</h6>
          ${t[e].map(Or).join(``)}
        </div>`).join(``)}
    </div>
  `}function Or(e){let n=Er[e.estado]||`secondary`;return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3 d-flex justify-content-between align-items-center">
        <div>
          <strong>${t(e.titulo)}</strong>
          <p class="text-muted small mb-0">${t(e.descripcion||``)}</p>
          <span class="text-muted small"><i class="bi bi-building"></i> ${t(e.departamento_responsable)} · ${t(e.categoria)}</span>
        </div>
        <span class="badge bg-${n}">${t(e.estado)}</span>
      </div>
    </div>
  `}var kr=`00000000-0000-0000-0000-000000000001`,Ar=[`DIR`,`ACM`,`ADM`,`FIN`,`LOG`,`COM`,`TECNICO`],X={entradas:[],cargando:!1,filtroDepartamento:`todos`,runId:kr},Z=null,Q=null;async function jr(e){let t=X.filtroDepartamento===`todos`?{}:{departamento:X.filtroDepartamento};X.entradas=await $n(X.runId,t),Ir(e),Rr(e)}function Mr(e){a?.channel&&(Q?.unsubscribe?.(),Q=a.channel(`simulador:sim_log:${X.runId}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`sim_log`},async t=>{if(!Z?.signal.aborted&&t?.new?.run_id===X.runId)try{await jr(e)}catch(e){console.error(`[logView] Realtime refresh error:`,e.message)}}).subscribe())}async function Nr(e,t={}){Z?.abort(),Z=new AbortController,X.runId=t.runId||kr;try{X.cargando=!0,Pr(e),await jr(e),Mr(e)}catch(t){console.error(`[logView] Error:`,t.message),Fr(e,t.message)}return{teardown:()=>{Z?.abort(),Q?.unsubscribe?.(),Q=null}}}function Pr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function Fr(e,n){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${t(n)}</div>`}function Ir(e){e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-journal-text fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Log en Vivo</h1>
          <p class="text-muted small mb-0">Auditoría de acciones de agentes (sim_log)</p>
        </div>
      </div>

      <div class="mb-3">
        <select class="form-select form-select-sm" id="filtroDepartamentoLog" style="max-width: 200px;">
          <option value="todos" ${X.filtroDepartamento===`todos`?`selected`:``}>Todos los departamentos</option>
          ${Ar.map(e=>`<option value="${e}" ${X.filtroDepartamento===e?`selected`:``}>${e}</option>`).join(``)}
        </select>
      </div>

      <div id="logList">
        ${X.entradas.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Sin entradas de log todavía</div>`:X.entradas.map(Lr).join(``)}
      </div>
    </div>
  `}function Lr(e){return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-secondary me-2">${t(e.departamento)}</span>
            <strong>${t(e.agente)}</strong>
            <span class="text-muted"> — ${t(e.accion)}</span>
          </div>
          <small class="text-muted">${new Date(e.created_at).toLocaleString(`es-ES`)}</small>
        </div>
      </div>
    </div>
  `}function Rr(e){let t=Z.signal;e.querySelector(`#filtroDepartamentoLog`)?.addEventListener(`change`,async t=>{X.filtroDepartamento=t.target.value;try{await jr(e)}catch(e){console.error(`[logView] Error al filtrar:`,e.message)}},{signal:t})}var zr=`00000000-0000-0000-0000-000000000001`,$={mensajes:[],cargando:!1,runId:zr},Br=null;async function Vr(e,t={}){Br?.abort(),Br=new AbortController,$.runId=t.runId||zr;try{$.cargando=!0,Hr(e),$.mensajes=await er($.runId),$.cargando=!1,Wr(e)}catch(t){console.error(`[outboxView] Error:`,t.message),Ur(e,t.message)}return{teardown:()=>{Br?.abort()}}}function Hr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>
  `}function Ur(e,n){e.innerHTML=`<div class="alert alert-danger m-4"><i class="bi bi-exclamation-triangle"></i> Error: ${t(n)}</div>`}function Wr(e){e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
          <i class="bi bi-send fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 fs-4">Outbox</h1>
          <p class="text-muted small mb-0">Mensajes salientes simulados — SIEMPRE redirigidos a la whitelist de seguridad</p>
        </div>
      </div>

      ${$.mensajes.length===0?`<div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Sin mensajes en el outbox todavía</div>`:`<div class="table-responsive">
               <table class="table table-sm align-middle">
                 <thead>
                   <tr>
                     <th>Canal</th>
                     <th>Destinatario original</th>
                     <th>Destinatario redirigido (real)</th>
                     <th>Estado</th>
                     <th>Fecha</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${$.mensajes.map(Gr).join(``)}
                 </tbody>
               </table>
             </div>`}
    </div>
  `}function Gr(e){let n=cr(e.estado);return`
    <tr>
      <td><span class="badge bg-info">${t(e.canal)}</span></td>
      <td class="text-muted">${t(e.destinatario_original)}</td>
      <td><strong>${t(e.destinatario_redirigido)}</strong></td>
      <td><span class="badge bg-${n.color}">${n.label}</span></td>
      <td><small class="text-muted">${new Date(e.created_at).toLocaleString(`es-ES`)}</small></td>
    </tr>
  `}function Kr(){try{let e=document.createElement(`canvas`);return!!(e.getContext(`webgl2`)||e.getContext(`webgl`))}catch{return!1}}function qr(e){if(e!==void 0)try{return!!e()}catch{return!1}return Kr()}async function Jr(e){if(qr())try{let t=await i(()=>import(`./three-HOk4djdv.js`).then(e=>e.n),__vite__mapDeps([20,1])),{renderSalaTrabajo3dView:n}=await i(async()=>{let{renderSalaTrabajo3dView:e}=await import(`./salaTrabajo3dView-CJHsw_Kr.js`);return{renderSalaTrabajo3dView:e}},__vite__mapDeps([21,2,20,1,22]));return await n(e,{},t)}catch(e){console.warn(`[salaTrabajo3DEntryView] 3D falló, cayendo a 2D:`,e.message)}let{renderSalaTrabajoView:t}=await i(async()=>{let{renderSalaTrabajoView:e}=await import(`./salaTrabajoView-D4tYQK6c.js`);return{renderSalaTrabajoView:e}},__vite__mapDeps([23,1,2,22]));return t(e,{modoFallback:!0})}function Yr(){o.register(`simulador-sala-trabajo`,e=>Jr(e)),o.register(`simulador-panel-control`,e=>gr(e)),o.register(`simulador-calendario`,e=>Cr(e)),o.register(`simulador-log`,e=>Nr(e)),o.register(`simulador-outbox`,e=>Vr(e))}var Xr=[ve,an,wn,re,f,ie,ue,le,s,ne,ee,me,d,fe,pe,Se,c,u,l,te,ce,se,xe,Bn,Kn,oe,Yr];export{Jn as a,$n as i,ar as n,Ne as o,sr as r,Xr as t};