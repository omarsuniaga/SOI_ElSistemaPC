const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/loginView-BTJON_t5.js","assets/maestroAuth-lT-ZcZZd.js","assets/supabase-KnARm58N.js","assets/usePortalAuth-Cvu3esVL.js","assets/a11yUtils-DoZA0IX7.js","assets/registerView-Cw1yLeAo.js","assets/pendingApprovalView-BN9eTg6p.js","assets/calendarioView-KFD6AZHh.js","assets/maestroDataService-BGjCE976.js","assets/portalUtils-DbrsCFDo.js","assets/AppModal-Fjeb_yOo.js","assets/AppToast-Bli1nFQQ.js","assets/hoyView-B08_ysDy.js","assets/academicService-dKTfSUQ8.js","assets/rolldown-runtime-DlOssbPu.js","assets/preload-helper-lqsI3teB.js","assets/claseAnalysisModal-CVDuqLFh.js","assets/groqService-DqCFHp7y.js","assets/asistenciaView-Dc4VZIZU.js","assets/idb-DphCmdhj.js","assets/planificacionAdapter-YQ-GJwgP.js","assets/clases-CdwqU54c.js","assets/config-Bj9A07Ke.js","assets/observacion.model-BCtZv8mL.js","assets/alumnosApi-Bzqf1UxF.js","assets/alumnos-D7LnSF97.js","assets/rutaTopicStore-BYhY7krO.js","assets/offlineQueue-C8tVR5V3.js","assets/notificationService-CNqqkcMX.js","assets/pushService-DVAfSSV4.js","assets/lifecycleManager-CSbEuGDH.js","assets/reportService-UN38zrj6.js","assets/focusTrap-_L6o1rch.js","assets/metricasView-DrA0PgKt.js","assets/perfilView-Deest3TN.js","assets/CHANGELOG-BUFzQeSb.js","assets/ausenciaModal-D8oQIM5E.js","assets/disponibilidadApi-CWsB8tCY.js","assets/phoneUtils-BhES4eRi.js","assets/sanitize-rcBeFe96.js","assets/claseEmergenteView-Cplig-HK.js","assets/planificacionView-D18_8Zd5.js","assets/planningService-CW5PRb28.js","assets/alumnoPerfilView-X67hc89R.js","assets/gamificacionView-Bj6AVWZB.js","assets/rutaGameificadaView-CWy8Qi0v.js","assets/crearClaseView-CLJcqDSt.js","assets/academicPlanBuilderView-Dp9mUTVj.js","assets/weeklyPlanView-ByIBSk-2.js","assets/routeLibraryView-B8EfhfY9.js","assets/routeDetailView-Dbfu14fp.js","assets/gestionarClasesView-DO5cBgn7.js","assets/clasesApi-BkawMRh5.js","assets/permisoService-C_6egrWz.js","assets/permisosSupabase-BFQ2fEUb.js"])))=>i.map(i=>d[i]);
import{t as e}from"./pwaInstaller-lF8xX1Dv.js";import{i as t}from"./supabase-KnARm58N.js";import{i as n,l as r,n as i,s as a}from"./maestroDataService-BGjCE976.js";import{n as o,r as s}from"./errorReporter-CDvSLm79.js";import"./vendor-BUMNmNsE.js";import{n as c,t as l}from"./usePortalAuth-Cvu3esVL.js";import{a as u,n as d}from"./offlineQueue-C8tVR5V3.js";import{t as f,u as p}from"./pushService-DVAfSSV4.js";import{t as m}from"./permisoService-C_6egrWz.js";import{a as h,c as g,i as ee,n as _,o as te,r as ne,s as v,t as re,u as ie}from"./notificationService-CNqqkcMX.js";import{t as y}from"./AppToast-Bli1nFQQ.js";import{t as ae}from"./focusTrap-_L6o1rch.js";import{t as oe}from"./metricasView-DrA0PgKt.js";import{t as b}from"./preload-helper-lqsI3teB.js";var se=[`useCache`,`WebSocket closed without opened`,`Could not establish connection`,`Receiving end does not exist`,`chrome-extension://`,`polyfill`,`content.js`,`Failed to load module script`,`net::ERR_BLOCKED_BY_CLIENT`];function x(e=``){let t=String(e).toLowerCase();return se.some(e=>t.includes(e.toLowerCase()))}var ce=console.error;console.error=function(...e){e.length>0&&!x(e[0])&&ce.apply(console,e)};var le=console.warn;console.warn=function(...e){e.length>0&&!x(e[0])&&le.apply(console,e)},window.addEventListener(`unhandledrejection`,e=>{x(String(e.reason||``))&&(e.preventDefault(),e.stopImmediatePropagation())},!0),window.addEventListener(`error`,e=>{x(e.message||``)&&(e.preventDefault(),e.stopImmediatePropagation())},!0);var ue=window.fetch;window.fetch=async function(...e){try{return await ue.apply(window,e)}catch(e){if(!x(e.message))throw e;return null}};var S=!1;function de(e={}){let{enabled:t=!1,consent:n=!1}=e;S=t&&n,console.log(`[Analytics] Initialized, enabled:`,S)}var C={windowMs:6e4,max:100};function fe(e={}){C={...C,...e},console.log(`[RateLimit] Initialized: ${C.max} requests per ${C.windowMs}ms`)}var w=null,T=new Set;function pe(e=32){let t=``,n=new Uint32Array(e);if(typeof crypto<`u`&&crypto.getRandomValues)crypto.getRandomValues(n);else for(let t=0;t<e;t++)n[t]=Math.floor(Math.random()*62);for(let r=0;r<e;r++)t+=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`[n[r]%62];return t}function me(e={}){w=pe(e.length||32),T.clear(),T.add(w),console.log(`[CSRF] Initialized`)}var E={LCP:null,FID:null,CLS:null,FCP:null,TTFB:null};function he(){return typeof window>`u`?!1:typeof PerformanceObserver<`u`}function ge(e={}){let{debug:t=!1,onReport:n=null}=e;if(!he()){console.warn(`[WebVitals] Not supported in this environment`);return}console.log(`[WebVitals] Initialized`),_e(t,n),ve(t,n),ye(t,n),be(t,n),xe(t,n)}function _e(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries(),i=r[r.length-1];E.LCP=i.value,e&&console.log(`[LCP]`,i.value),t&&t(`LCP`,i.value)}).observe({entryTypes:[`largest-contentful-paint`]})}catch{e&&console.log(`[LCP] Not available`)}}function ve(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];E.FID=r.value,e&&console.log(`[FID]`,r.value),t&&t(`FID`,r.value)}).observe({entryTypes:[`first-input`]})}catch{e&&console.log(`[FID] Not available`)}}function ye(e,t){try{let n=0;new PerformanceObserver(r=>{for(let e of r.getEntries())e.hadRecentInput||(n+=e.value);E.CLS=n,e&&console.log(`[CLS]`,n),t&&t(`CLS`,n)}).observe({entryTypes:[`layout-shift`]})}catch{e&&console.log(`[CLS] Not available`)}}function be(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];E.FCP=r.value,e&&console.log(`[FCP]`,r.value),t&&t(`FCP`,r.value)}).observe({entryTypes:[`paint`]})}catch{e&&console.log(`[FCP] Not available`)}}function xe(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];E.TTFB=r.responseStart,e&&console.log(`[TTFB]`,r.responseStart),t&&t(`TTFB`,r.responseStart)}).observe({entryTypes:[`navigation`]})}catch{e&&console.log(`[TTFB] Not available`)}}var D=`hoy`;function Se(){let e=new Map,t=null,n=null,r=null,i=[`login`],a=!1;function o(){let e=window.location.pathname,t=window.location.hash;return t&&t!==`#`?t.replace(`#/`,``).replace(`#`,``):e&&e!==`/`?e.replace(/^\//,``):D}function s(e,t=[`login`]){r=e,i=t,a=!0}let c=null;function l(e,t={}){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.pushState({route:`login`},``,`/login`),h(`login`);return}if(a&&r&&i.includes(e)&&r()){history.replaceState({route:D},``,D===`hoy`?`/`:`/${D}`),h(D);return}t&&Object.keys(t).length>0&&(c=t,n=null);let o=e===`hoy`?`/`:`/${e}`;history.pushState({route:e},``,o),h(e)}function u(e){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.replaceState({route:`login`},``,`/login`),h(`login`);return}let t=e===`hoy`?`/`:`/${e}`;history.replaceState({route:e},``,t),h(e)}function d(t,n){e.set(t,n)}function f(e){t=e}let p=null;function m(e){let t=e.querySelector(`h1, h2, [role="main"]`);t&&(t.hasAttribute(`tabindex`)||t.setAttribute(`tabindex`,`-1`),t.focus({preventScroll:!0}))}function h(r){if(n===r&&n!==null)return;n=r;let i=r.split(`?`)[0],a=e.get(i),o={};if(!a){for(let[t,n]of e.entries())if(t.includes(`:`)){let e=`^`+t.replace(/:[^\s/]+/g,`([^\\/]+)`)+`$`,r=new RegExp(e),s=i.match(r);if(s){a=n,t.match(/:[^\s/]+/g).forEach((e,t)=>{o[e.substring(1)]=s[t+1]});break}}}c&&=(o={...o,...c},null);let s=a||t;if(!s)return;let l=async()=>{typeof s==`function`&&await s(r,o)};if(!document.startViewTransition||p){p&&=(p.skipTransition(),null);let e=document.querySelector(`.pm-view-content.active`);e&&(e.classList.remove(`pm-animate-fade-in`,`pm-view-enter`,`pm-view-enter-active`),e.offsetWidth),l();let t=document.querySelector(`.pm-view-content.active`);t&&(t.classList.add(`pm-animate-fade-in`),t.classList.add(`pm-view-enter`),requestAnimationFrame(()=>{t.classList.add(`pm-view-enter-active`),m(t);let e=()=>{t.classList.remove(`pm-view-enter`,`pm-view-enter-active`)};t.addEventListener(`transitionend`,e,{once:!0}),setTimeout(e,250)}));return}try{let e=document.startViewTransition(async()=>{await l()});p=e;let t=e=>e.catch(()=>{});t(e.ready),t(e.updateCallbackDone),t(e.finished),e.finished.finally(()=>{p=null;let e=document.querySelector(`.pm-view-content.active`);e&&requestAnimationFrame(()=>m(e))})}catch{p=null,l()}}function g(){window.addEventListener(`popstate`,e=>{e.state?.route?h(e.state.route):h(o())}),window.addEventListener(`hashchange`,()=>{let e=window.location.hash;if(e&&e.startsWith(`#/`)){let t=e.replace(`#/`,``);history.replaceState(null,``,window.location.pathname+window.location.search),l(t)}}),l(o())}return{currentRoute:o,setAuthGuard:s,navigate:l,replace:u,on:d,onNotFound:f,start:g,_dispatch:h}}var Ce=new class{constructor(){this.storageKey=`portal-maestros-theme`,this.init()}init(){let e=localStorage.getItem(this.storageKey),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`;this.currentTheme=e||t,this.applyTheme(this.currentTheme),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(this.storageKey)||(this.currentTheme=e.matches?`dark`:`light`,this.applyTheme(this.currentTheme))})}applyTheme(e){document.documentElement.setAttribute(`data-bs-theme`,e),document.documentElement.setAttribute(`data-portal-theme`,e),this.updateCustomProperties(e)}updateCustomProperties(e){let t=document.documentElement;e===`dark`?(t.style.setProperty(`--pm-glass-bg`,`rgba(30, 41, 59, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(255, 255, 255, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(15, 23, 42, 0.95)`)):(t.style.setProperty(`--pm-glass-bg`,`rgba(255, 255, 255, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(0, 0, 0, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(242, 242, 247, 0.95)`))}toggle(){this.currentTheme=this.currentTheme===`dark`?`light`:`dark`,this.applyTheme(this.currentTheme),localStorage.setItem(this.storageKey,this.currentTheme),window.dispatchEvent(new CustomEvent(`themeChanged`,{detail:{theme:this.currentTheme}}))}getCurrentTheme(){return this.currentTheme}createToggleButton(){let e=document.createElement(`button`);return e.className=`pm-theme-toggle`,e.setAttribute(`aria-label`,`Cambiar tema`),e.innerHTML=`
      <div class="pm-theme-toggle-track">
        <div class="pm-theme-toggle-thumb">
          <i class="bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon"></i>
        </div>
      </div>
    `,e.addEventListener(`click`,()=>{this.toggle(),this.updateButtonIcon(e)}),window.addEventListener(`themeChanged`,()=>{this.updateButtonIcon(e)}),e}updateButtonIcon(e){let t=e.querySelector(`.pm-theme-icon`);t&&(t.className=`bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon`)}};`serviceWorker`in navigator&&navigator.serviceWorker.addEventListener(`message`,e=>{if(e.data?.type===`NAVIGATE_TO`){let t=e.data.url||e.data.hash;t&&(window.location.hash=t.startsWith(`#`)?t.slice(1):t)}});var O=null,k=null;function we(e){let t=new Date(e),n=new Date-t,r=Math.floor(n/1e3),i=Math.floor(r/60),a=Math.floor(i/60),o=Math.floor(a/24),s=new Intl.RelativeTimeFormat(`es`,{numeric:`auto`});return o>0?s.format(-o,`day`):a>0?s.format(-a,`hour`):i>0?s.format(-i,`minute`):`hace un momento`}var A={init(){document.getElementById(`pm-notificaciones-drawer-overlay`)||(O=document.createElement(`div`),O.innerHTML=`
      <div id="pm-notificaciones-drawer-overlay" class="pm-drawer-overlay" role="dialog" aria-modal="true" aria-labelledby="pm-notif-dialog-title">
        <div class="pm-drawer">
          <div class="pm-drawer-header">
            <h4 id="pm-notif-dialog-title"><i class="bi bi-bell"></i> Notificaciones <span id="pm-notif-dedup-badge" class="pm-dedup-badge" style="display:none;"></span></h4>
            <div style="display:flex; gap: 0.5rem;">
              <button id="pm-notif-mark-all" class="pm-icon-btn" title="Marcar todas como leídas" style="font-size: 1rem;">
                <i class="bi bi-check2-all"></i>
              </button>
              <button class="pm-drawer-close" id="pm-notificaciones-close" aria-label="Cerrar">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div class="pm-drawer-body" id="pm-notificaciones-list">
            <!-- Render list here -->
            <div class="text-center text-muted mt-4">
              <div class="spinner-border spinner-border-sm mb-2"></div><br>
              Cargando...
            </div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(O),document.getElementById(`pm-notificaciones-close`).addEventListener(`click`,this.close),document.getElementById(`pm-notificaciones-drawer-overlay`).addEventListener(`click`,e=>{e.target.id===`pm-notificaciones-drawer-overlay`&&this.close()}),document.getElementById(`pm-notif-mark-all`).addEventListener(`click`,()=>{te()}),k=v(e=>{this.renderList(e)}),_())},_updateDedupBadge(){let e=document.getElementById(`pm-notif-dedup-badge`);if(!e)return;let t=ne();t>0?(e.textContent=`🔄 ${t} dedup`,e.style.display=`inline-flex`):e.style.display=`none`},renderList(e){let t=document.getElementById(`pm-notificaciones-list`);if(t){if(this._updateDedupBadge(),e.length===0){t.innerHTML=`
        <div class="text-center text-muted mt-5">
          <i class="bi bi-bell-slash" style="font-size: 2rem; opacity: 0.5;"></i>
          <p class="mt-2">No tienes notificaciones recientes.</p>
        </div>
      `;return}t.innerHTML=De(e).map(e=>{let t=e.count>1,n=e.items.some(e=>e.estado!==`leida`),r=Oe(e.tipo,e.items[0]),i=e.tipo===`sesion_sin_registrar`;return`
        <div
          class="pm-notif-item ${n?``:`leida`} ${i?`pm-notif-item--urgent`:``}"
          data-ids="${e.items.map(e=>e.id).join(`,`)}"
          data-route="${r}"
          title="${t?`Ver todo`:e.items[0].titulo}"
        >
          <div class="pm-notif-icon ${Ee(e.tipo)}">
            <i class="bi ${Te(e.tipo)}"></i>
          </div>
          <div class="pm-notif-content">
            <div class="pm-notif-title">
              ${t?`${e.items[0].titulo} <span class="pm-notif-count">${e.count}</span>`:e.items[0].titulo}
            </div>
            <div class="pm-notif-msg">
              ${t?`${e.count} clases sin registrar`:e.items[0].mensaje}
            </div>
            <div class="pm-notif-footer-row">
              <span class="pm-notif-time">${we(e.items[0].created_at)}</span>
              ${i&&r!==`#/`?`<a class="pm-notif-cta" data-route="${r}" href="#">Registrar ahora →</a>`:``}
            </div>
          </div>
          <div class="pm-notif-actions">
            <button class="pm-notif-btn-mark" data-ids="${e.items.map(e=>e.id).join(`,`)}" title="Marcar como leída">
              <i class="bi bi-check-circle"></i>
            </button>
            <button class="pm-notif-btn-delete" data-ids="${e.items.map(e=>e.id).join(`,`)}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          ${n?`<div class="pm-notif-dot"></div>`:``}
        </div>
      `}).join(``),t.querySelectorAll(`.pm-notif-cta`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation(),e.closest(`.pm-notif-item`).dataset.ids.split(`,`).forEach(e=>h(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``),A.close())})}),t.querySelectorAll(`.pm-notif-item`).forEach(e=>{e.addEventListener(`click`,t=>{if(t.target.closest(`.pm-notif-actions`)||t.target.closest(`.pm-notif-cta`))return;e.dataset.ids.split(`,`).forEach(e=>h(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``))})}),t.querySelectorAll(`.pm-notif-btn-mark`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),e.dataset.ids.split(`,`).forEach(e=>h(e))})}),t.querySelectorAll(`.pm-notif-btn-delete`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.dataset.ids.split(`,`);if(!confirm(`¿Estás seguro de que querés eliminar esta notificación?`))return;let r=!0;for(let e of n)(await re(e)).success||(r=!1);r?window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificación eliminada correctamente.`,type:`info`}})):window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Hubo un problema al eliminar la notificación.`,type:`danger`}})),_()})})}},open(){this.init(),this._triggerEl=document.activeElement;let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e.style.display=`block`,e.offsetHeight,e.classList.add(`open`);let t=document.querySelector(`#pm-notificaciones-drawer-overlay .pm-drawer`);t&&(this._trap&&this._trap.dispose(),this._trap=ae(t,{onClose:()=>this.close()}));let n=document.getElementById(`pm-notificaciones-close`);n&&n.focus(),this._updateDedupBadge(),_()},close(){this._trap&&=(this._trap.dispose(),null),k&&typeof k==`function`&&(k(),k=null);let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e&&(e.classList.remove(`open`),setTimeout(()=>{e.style.display=`none`},300)),this._triggerEl&&typeof this._triggerEl.focus==`function`&&this._triggerEl.focus(),this._triggerEl=null}};function Te(e){switch(e){case`sesion_sin_registrar`:return`bi-exclamation-triangle`;case`recordatorio_clase`:return`bi-clock-history`;case`mensaje_admin`:return`bi-megaphone`;case`tarea_vencida`:return`bi-journal-x`;default:return`bi-bell`}}function Ee(e){switch(e){case`sesion_sin_registrar`:return`bg-danger text-white`;case`recordatorio_clase`:return`bg-warning text-dark`;case`mensaje_admin`:return`bg-primary text-white`;default:return`bg-secondary text-white`}}function De(e){let t=new Set([`recordatorio_clase`,`in_app`]),n=[],r=new Map;for(let i of e)if(t.has(i.tipo)&&r.has(i.tipo)){let e=n[r.get(i.tipo)];e.items.push(i),e.count++}else r.set(i.tipo,n.length),n.push({tipo:i.tipo,items:[i],count:1});return n}function Oe(e,t){let n=t.clase_id||t.data?.clase_id,r=t.alumno_id||t.data?.alumno_id,i=new Date,a=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,`0`)}-${String(i.getDate()).padStart(2,`0`)}`,o=t.fecha||a;switch(e){case`sesion_sin_registrar`:case`recordatorio_clase`:return n?`#/asistencia?clase=${n}&fecha=${o}`:`#/hoy`;case`mensaje_admin`:return`#/perfil`;case`tarea_vencida`:return r?`#/alumno?id=${r}`:`#/hoy`;default:return`#/hoy`}}if(!document.getElementById(`pm-notif-styles`)){let e=document.createElement(`style`);e.id=`pm-notif-styles`,e.textContent=`
    .pm-notif-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid var(--pm-border);
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }
    .pm-notif-item:hover {
      background: var(--pm-surface-2);
    }
    .pm-notif-item.leida {
      opacity: 0.7;
    }
    .pm-notif-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .pm-notif-content {
      flex: 1;
      min-width: 0;
    }
    .pm-notif-title {
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.2rem;
      color: var(--pm-text);
    }
    .pm-notif-msg {
      font-size: 0.8rem;
      color: var(--pm-text-muted);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pm-notif-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.4rem;
      gap: 0.5rem;
    }
    .pm-notif-time {
      font-size: 0.7rem;
      color: var(--pm-text-muted);
    }
    /* CTA "Registrar ahora" */
    .pm-notif-cta {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--pm-danger, #ef4444);
      text-decoration: none;
      white-space: nowrap;
      padding: 2px 8px;
      border-radius: 99px;
      border: 1px solid currentColor;
      line-height: 1.6;
      transition: background 0.15s, color 0.15s;
    }
    .pm-notif-cta:hover {
      background: var(--pm-danger, #ef4444);
      color: #fff;
    }
    /* Borde izquierdo urgente para clases sin registrar */
    .pm-notif-item--urgent {
      border-left: 3px solid var(--pm-danger, #ef4444);
    }
    .pm-notif-dot {
      width: 8px;
      height: 8px;
      background: var(--pm-primary);
      border-radius: 50%;
      position: absolute;
      top: 1.2rem;
      right: 1rem;
    }

    /* Badge de conteo para grupos */
    .pm-notif-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: var(--pm-primary);
      color: #fff;
      border-radius: 9px;
      font-size: 0.68rem;
      font-weight: 700;
      margin-left: 6px;
      vertical-align: middle;
      letter-spacing: 0;
    }

    /* Dedup badge in panel header */
    .pm-dedup-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(245, 158, 11, 0.15);
      color: #d97706;
      vertical-align: middle;
      margin-left: 6px;
      letter-spacing: 0;
    }

    /* Action buttons */
    .pm-notif-actions {
      display: flex;
      gap: 0.5rem;
      margin-left: 0.5rem;
      flex-shrink: 0;
    }

    .pm-notif-btn-mark,
    .pm-notif-btn-delete {
      background: none;
      border: none;
      padding: 0.4rem;
      cursor: pointer;
      color: var(--pm-text-muted);
      border-radius: 4px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .pm-notif-btn-mark:hover {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .pm-notif-btn-delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Dark mode */
    [data-portal-theme="dark"] .pm-notif-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  `,document.head.appendChild(e)}var j=M();function M(){let e=window.innerWidth;return e<768?`mobile`:e<1024?`tablet`:`desktop`}window.addEventListener(`resize`,()=>{let e=M();e!==j&&(j=e,document.body.dataset.pmLayout=e)},{passive:!0});function ke(){let e=document.getElementById(`portal-app`);if(!e)return;let t=e.querySelector(`.pm-header`),n=e.querySelector(`.pm-bottom-nav`),r=e.querySelector(`.pm-view`);t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.display=`none`)}function N(e){document.querySelectorAll(`.pm-nav-tab`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)}),document.querySelectorAll(`.pm-sidebar-link`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)})}function Ae(e,t,n,r,i){let a=t?.es_admin?`<a href="/admin" class="pm-admin-link" title="Ir al Panel Admin">
         <i class="bi bi-grid-1x2-fill"></i><span>Panel Admin</span>
       </a>`:``;e.innerHTML=`
    <!-- Sidebar (desktop only) -->
    <aside class="pm-sidebar" id="pm-sidebar">
      <div class="pm-sidebar-header">
        <div class="pm-sidebar-logo">
          <i class="bi bi-music-note-beamed"></i>
          <span>SOI</span>
        </div>
      </div>
      <nav class="pm-sidebar-nav">
        ${n.map(e=>`
          <a class="pm-sidebar-link" data-route="${e.id}" title="${e.label}">
            <i class="bi ${e.icon}"></i>
            <span>${e.label}</span>
          </a>
        `).join(``)}
      </nav>
      <div class="pm-sidebar-footer">
        ${a}
        <button id="pm-btn-perfil-sidebar" class="pm-sidebar-link" data-route="perfil">
          <i class="bi bi-person-circle"></i>
          <span>Perfil</span>
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="pm-main-area">
      <!-- Header -->
      <header class="pm-header" id="pm-header">
        <div class="pm-header-left" id="pm-header-left">
          <span class="pm-header-greeting">Portal Maestros</span>
          <span class="pm-header-title" style="font-size:clamp(1rem,3.5vw,1.5rem);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52vw;">
            Prof. ${t?.nombre_completo??``}
            <span class="pm-online-dot" id="pm-sync-indicator" title="Sincronizado"></span>
          </span>
        </div>

        <!-- Search -->
        <div class="pm-header-search-container" id="pm-header-search-container">
          <button id="pm-search-back-btn" class="pm-icon-btn pm-search-back-btn" title="Cerrar búsqueda">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div class="pm-header-search" id="pm-header-search">
            <i class="bi bi-search"></i>
            <input type="search" placeholder="Buscar alumno..." id="pm-header-search-input" autocomplete="off" />
          </div>
        </div>

        <!-- Header right controls -->
        <div class="pm-header-right" id="pm-header-right">
          <button id="pm-search-toggle-btn" class="pm-icon-btn pm-search-toggle-btn" title="Buscar alumno">
            <i class="bi bi-search"></i>
          </button>

          <div id="pm-theme-toggle-container"></div>

          <button id="pm-bell-btn" class="pm-icon-btn" title="Notificaciones" style="position: relative;">
            <i class="bi bi-bell"></i>
            <span class="pm-ausencias-badge" id="pm-notif-badge" style="display: none; background: var(--pm-danger);">0</span>
          </button>

          <button id="pm-btn-perfil" class="pm-avatar-btn" title="Perfil">
            ${t?.avatar_url?`<img src="${t.avatar_url}" alt="Avatar">`:`<i class="bi bi-person-circle"></i>`}
          </button>
        </div>
      </header>

      <!-- Contenido de la vista activa -->
      <main class="pm-view" id="pm-view-container"></main>

      <!-- Footer Nav (mobile/tablet only) -->
      <nav class="pm-footer-nav" id="pm-footer-nav">
        <div class="pm-footer-nav__inner">
          ${n.map(e=>`
            <button class="pm-nav-tab" data-route="${e.id}" title="${e.label}" aria-label="${e.label}">
              <i class="bi ${e.icon}"></i>
              <span>${e.label}</span>
            </button>
          `).join(``)}
        </div>
      </nav>
    </div>
  `,i();let o=document.getElementById(`pm-theme-toggle-container`);o&&o.appendChild(Ce.createToggleButton()),document.getElementById(`pm-footer-nav`)?.querySelectorAll(`.pm-nav-tab`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),r(e.dataset.route)})}),document.getElementById(`pm-sidebar`)?.querySelectorAll(`.pm-sidebar-link[data-route]`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),r(e.dataset.route)})}),document.getElementById(`pm-btn-perfil`)?.addEventListener(`click`,e=>{e.preventDefault(),r(`perfil`)}),document.getElementById(`pm-bell-btn`)?.addEventListener(`click`,()=>A.open()),P(r)}function P(e){let n=document.getElementById(`pm-header`),r=document.getElementById(`pm-header-search-input`),i=document.getElementById(`pm-search-toggle-btn`),a=document.getElementById(`pm-search-back-btn`),o=()=>{n?.classList.add(`search-active`),setTimeout(()=>r?.focus(),50)},s=()=>{n?.classList.remove(`search-active`),r&&(r.value=``),document.getElementById(`pm-header-search-dropdown`)?.remove()};i?.addEventListener(`click`,e=>{e.stopPropagation(),o()}),a?.addEventListener(`click`,e=>{e.stopPropagation(),s()});let c=null,l=null,u=()=>{c?.remove(),c=null},d=t=>{if(u(),!t.length)return;let n=document.createElement(`div`);n.id=`pm-header-search-dropdown`,n.setAttribute(`role`,`listbox`),n.innerHTML=t.map(e=>`
      <div class="pm-hsd-item" role="option" tabindex="0" data-id="${e.id}">
        <i class="bi bi-person-fill pm-hsd-icon"></i>
        <div class="pm-hsd-info">
          <span class="pm-hsd-name">${e.nombre_completo}</span>
          ${e.instrumento_principal?`<span class="pm-hsd-meta">${e.instrumento_principal}</span>`:``}
        </div>
        <i class="bi bi-chevron-right pm-hsd-arrow"></i>
      </div>`).join(``),document.body.appendChild(n);let i=r.getBoundingClientRect();n.style.cssText=`position:fixed;top:${i.bottom+4}px;left:${Math.max(8,i.left)}px;width:${Math.min(320,window.innerWidth-16)}px;z-index:9999;background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.18);overflow:hidden;`,c=n,n.querySelectorAll(`.pm-hsd-item`).forEach(t=>{let n=()=>{s(),u(),e(`alumno`,{id:t.dataset.id})};t.addEventListener(`click`,n),t.addEventListener(`keypress`,e=>{e.key===`Enter`&&n()})})};if(r?.addEventListener(`input`,()=>{let e=r.value.trim();if(clearTimeout(l),e.length<1){u();return}let n=oe();if(n){let t=e.toLowerCase();d(n.filter(e=>e.nombre_completo?.toLowerCase().includes(t)).slice(0,8).map(e=>({...e,instrumento_principal:e.clases?.join(`, `)||null})));return}l=setTimeout(async()=>{try{let{data:n}=await t.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).ilike(`nombre_completo`,`%${e}%`).limit(8);d(n||[])}catch{u()}},200)}),r?.addEventListener(`keydown`,e=>{e.key===`Escape`&&(s(),u())}),!document.getElementById(`pm-hsd-styles`)){let e=document.createElement(`style`);e.id=`pm-hsd-styles`,e.textContent=`.pm-hsd-item{display:flex;align-items:center;gap:0.625rem;padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid var(--pm-border);transition:background 0.1s}.pm-hsd-item:last-child{border-bottom:none}.pm-hsd-item:hover,.pm-hsd-item:focus{background:var(--pm-surface-2);outline:none}.pm-hsd-icon{font-size:1rem;color:var(--pm-primary);flex-shrink:0}.pm-hsd-info{flex:1;min-width:0}.pm-hsd-name{display:block;font-size:0.875rem;font-weight:500;color:var(--pm-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-hsd-meta{font-size:0.7rem;color:var(--pm-text-muted)}.pm-hsd-arrow{color:var(--pm-text-muted);font-size:0.75rem}`,document.head.appendChild(e)}document.addEventListener(`click`,e=>{!r?.contains(e.target)&&!c?.contains(e.target)&&u()})}var je=[`login`,`logout`,`register`,`pending-approval`,`calendario`,`clases`,`hoy`,`asistencia`,`metricas`,`perfil`,`clase-emergente`,`planificacion`,`alumno`,`gamificacion`,`ruta`,`crear-clase`,`ruta-plan-builder`,`ruta-semanal`,`ruta-libreria`,`ruta-detalle`,`gestionar-clases`],Me=new Set([`hoy`,`calendario`,`metricas`,`perfil`,`ruta`,`gamificacion`,`crear-clase`,`planificacion`,`ruta-libreria`]);function Ne(e,t,n){[`login`,`logout`,`calendario`,`clases`,`hoy`,`asistencia`,`metricas`,`perfil`,`clase-emergente`,`planificacion`,`alumno`,`gamificacion`,`ruta`,`crear-clase`,`ruta-plan-builder`,`ruta-semanal`,`ruta-libreria`,`gestionar-clases`,`register`,`pending-approval`].forEach(t=>e.on(t,(e,r)=>n(t,r))),e.on(`ruta-detalle/:id`,(e,t)=>n(`ruta-detalle`,t)),e.onNotFound(()=>n(`hoy`))}function F(){let e=document.getElementById(`pm-view-container`);if(!e)return{};e.innerHTML=``;let t={};return je.forEach(n=>{let r=document.createElement(`div`);r.id=`pm-view-${n}`,r.className=`pm-view-content`,r.style.display=`none`,e.appendChild(r),t[n]=r}),t}async function I(e,t,n,r,i){let{maestroId:a,permisos:o,router:s,showLoginScreen:c,cleanupPushService:l,stopRealtime:u,logoutMaestro:d}=i;switch(e){case`login`:{let{renderLoginView:e}=await b(async()=>{let{renderLoginView:e}=await import(`./loginView-BTJON_t5.js`);return{renderLoginView:e}},__vite__mapDeps([0,1,2,3,4]));e(t,{onSuccess:i.onLoginSuccess});break}case`register`:{let{renderRegisterView:e}=await b(async()=>{let{renderRegisterView:e}=await import(`./registerView-Cw1yLeAo.js`);return{renderRegisterView:e}},__vite__mapDeps([5,2,4]));e(t,{onSuccess:()=>s.navigate(`pending-approval`)});break}case`pending-approval`:{let{renderPendingApprovalView:e}=await b(async()=>{let{renderPendingApprovalView:e}=await import(`./pendingApprovalView-BN9eTg6p.js`);return{renderPendingApprovalView:e}},__vite__mapDeps([6,2]));e(t,{onBackToLogin:()=>s.navigate(`login`)});break}case`logout`:c(),l(),u(),d().then(()=>window.location.reload());break;case`calendario`:case`clases`:{let{renderCalendarioView:e}=await b(async()=>{let{renderCalendarioView:e}=await import(`./calendarioView-KFD6AZHh.js`);return{renderCalendarioView:e}},__vite__mapDeps([7,2,1,8,9,10,11]));return await e(t)}case`hoy`:{let{renderHoyView:e}=await b(async()=>{let{renderHoyView:e}=await import(`./hoyView-B08_ysDy.js`);return{renderHoyView:e}},__vite__mapDeps([12,2,13,14,15,1,16,17,8,9,11]));return await e(t,{onClaseClick:e=>s.navigate(`asistencia?clase=${e}`)})}case`asistencia`:{let{renderAsistenciaView:e}=await b(async()=>{let{renderAsistenciaView:e}=await import(`./asistenciaView-Dc4VZIZU.js`);return{renderAsistenciaView:e}},__vite__mapDeps([18,15,2,19,20,14,21,22,13,23,24,25,1,17,26,27,8,28,29,30,31,11,4,32,9,10]));return await e(t,{claseId:r.get(`clase`),fecha:r.get(`fecha`),sesionId:r.get(`sesion`),router:s})}case`metricas`:{let{renderMetricasView:e}=await b(async()=>{let{renderMetricasView:e}=await import(`./metricasView-DrA0PgKt.js`).then(e=>e.n);return{renderMetricasView:e}},__vite__mapDeps([33,14,2,1,16,17,8,4,9]));return e(t)}case`perfil`:{let{renderPerfilView:e}=await b(async()=>{let{renderPerfilView:e}=await import(`./perfilView-Deest3TN.js`);return{renderPerfilView:e}},__vite__mapDeps([34,15,2,35,36,1,32,9,10,11,37,29,14,38,39]));return e(t)}case`clase-emergente`:{let{renderClaseEmergenteView:e}=await b(async()=>{let{renderClaseEmergenteView:e}=await import(`./claseEmergenteView-Cplig-HK.js`);return{renderClaseEmergenteView:e}},__vite__mapDeps([40,2,27,14,19]));return e(t,{maestroId:a})}case`planificacion`:{let{renderPlanificacionView:e}=await b(async()=>{let{renderPlanificacionView:e}=await import(`./planificacionView-D18_8Zd5.js`);return{renderPlanificacionView:e}},__vite__mapDeps([41,15,24,14,2,25,22,42,8,1,4,11]));return await e(t,{maestroId:a})}case`alumno`:{let{renderAlumnoPerfilView:e}=await b(async()=>{let{renderAlumnoPerfilView:e}=await import(`./alumnoPerfilView-X67hc89R.js`);return{renderAlumnoPerfilView:e}},__vite__mapDeps([43,2,1,9,11,38]));return e(t,{alumnoId:r.get(`id`)||n.id})}case`gamificacion`:{let{renderGamificacionView:e}=await b(async()=>{let{renderGamificacionView:e}=await import(`./gamificacionView-Bj6AVWZB.js`);return{renderGamificacionView:e}},__vite__mapDeps([44,2,1,9]));await e(t);break}case`ruta`:{let{renderRutaGameificadaView:e}=await b(async()=>{let{renderRutaGameificadaView:e}=await import(`./rutaGameificadaView-CWy8Qi0v.js`);return{renderRutaGameificadaView:e}},__vite__mapDeps([45,2,1,26,17,27,14,19,8]));await e(t,{onTopicSelected:e=>s.navigate(`asistencia?clase=${e}`)});break}case`crear-clase`:{let{renderCrearClaseView:e}=await b(async()=>{let{renderCrearClaseView:e}=await import(`./crearClaseView-CLJcqDSt.js`);return{renderCrearClaseView:e}},__vite__mapDeps([46,2,1,9]));e(t);break}case`ruta-plan-builder`:{let{renderAcademicPlanBuilderView:e}=await b(async()=>{let{renderAcademicPlanBuilderView:e}=await import(`./academicPlanBuilderView-Dp9mUTVj.js`);return{renderAcademicPlanBuilderView:e}},__vite__mapDeps([47,2,13,14,15,9]));e(t,{alumnoId:r.get(`id`)});break}case`ruta-semanal`:{let{renderWeeklyPlanView:e}=await b(async()=>{let{renderWeeklyPlanView:e}=await import(`./weeklyPlanView-ByIBSk-2.js`);return{renderWeeklyPlanView:e}},__vite__mapDeps([48,2,13,14,15,9]));e(t,{alumnoId:r.get(`id`)});break}case`ruta-libreria`:{let{RouteLibraryView:e}=await b(async()=>{let{RouteLibraryView:e}=await import(`./routeLibraryView-B8EfhfY9.js`);return{RouteLibraryView:e}},__vite__mapDeps([49,13,14,15,2]));e.render().then(e=>{t.innerHTML=``,t.appendChild(e)});break}case`ruta-detalle`:{let{RouteDetailView:e}=await b(async()=>{let{RouteDetailView:e}=await import(`./routeDetailView-Dbfu14fp.js`);return{RouteDetailView:e}},__vite__mapDeps([50,13,14,15,2]));e.render(n).then(e=>{t.innerHTML=``,t.appendChild(e)});break}case`gestionar-clases`:{if(!o?.puede_inscribir_clases){s.navigate(`hoy`);return}let{renderGestionarClasesView:e}=await b(async()=>{let{renderGestionarClasesView:e}=await import(`./gestionarClasesView-DO5cBgn7.js`);return{renderGestionarClasesView:e}},__vite__mapDeps([51,24,14,2,25,22,52,1,53,54,11]));return await e(t)}default:break}return null}var L=!1,R=null;function Pe({isAdmin:e,getMaestro:t,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i,onResize:a}){if(L)return;L=!0,v(()=>{let e=document.getElementById(`pm-notif-badge`);if(!e)return;let t=ee();t>0?(e.textContent=t>9?`9+`:t,e.style.display=`flex`):e.style.display=`none`}),_(),g(),e||Fe({getMaestro:t,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i}),document.addEventListener(`keydown`,e=>{if(M()!==`desktop`||e.target.tagName===`INPUT`||e.target.tagName===`TEXTAREA`)return;window._globalAppKeys||(window._globalAppKeys=[]);let t=window._globalAppKeys;if(t.push(e.key.toLowerCase()),t[t.length-2]===`g`){let n={h:`hoy`,c:`calendario`,r:`ruta`,m:`metricas`,p:`perfil`}[e.key.toLowerCase()];n&&(i(n),t.length=0)}t.length>3&&t.splice(0,t.length-2)});let o=null,s=M();window.addEventListener(`resize`,()=>{clearTimeout(o),o=setTimeout(()=>{let e=M();e!==s&&(s=e,a())},250)},{passive:!0})}function Fe({getMaestro:e,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i}){let a=e();a?.id&&(R&&=(t.removeChannel(R),null),R=t.channel(`permisos-maestro:${a.id}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`permisos_maestros`,filter:`maestro_id=eq.${a.id}`},async e=>{console.log(`[Realtime] Permisos actualizados:`,e.new);try{let e=await m(a.id),t=n(),i=[],o=[];e.puede_inscribir_clases&&!t?.puede_inscribir_clases&&i.push(`Gestionar e Inscribir Clases`),t?.puede_inscribir_clases&&!e.puede_inscribir_clases&&o.push(`Gestionar e Inscribir Clases`),await r(e,{ganados:i,perdidos:o}),i.length>0?y.success(`¡Nuevos permisos activados: ${i.join(`, `)}! Ahora podés acceder desde el Perfil o la barra de navegación.`):o.length>0?y.show(`El administrador removió tu acceso a: ${o.join(`, `)}.`,`warning`):y.show(`Tus permisos fueron actualizados por el administrador.`,`info`)}catch(e){console.warn(`[Realtime] Error actualizando permisos:`,e.message)}}).subscribe(e=>console.log(`[Realtime] Canal permisos_maestros:`,e)),window.addEventListener(`beforeunload`,()=>t.removeChannel(R),{once:!0}))}if(e(),`serviceWorker`in navigator){let e=async()=>{try{let e=await navigator.serviceWorker.register(`/sw.js`);console.log(`[PWA] Service Worker registered:`,e.scope)}catch(e){console.log(`[PWA] Service Worker registration failed:`,e)}};document.readyState===`complete`?e():window.addEventListener(`load`,e)}else `serviceWorker`in navigator;me(),fe({windowMs:6e4,max:100}),de({enabled:!1,consent:!1}),ge({debug:!1}),o({dsn:null,environment:`production`}),window.addEventListener(`showToast`,e=>{let{message:t,type:n=`info`}=e.detail||{};t&&y.show(t,n)});var z=null,B=null,Ie=!1,V=Se();window.router=V;var H={},U=null,W=new Set;function Le(e){let t=[{id:`calendario`,label:`Calendario`,icon:`bi-calendar3`},{id:`hoy`,label:`Hoy`,icon:`bi-house-door`},{id:`planificacion`,label:`Plan`,icon:`bi-signpost-split`},{id:`metricas`,label:`Métricas`,icon:`bi-bar-chart-line`}];return e?.puede_inscribir_clases&&t.push({id:`gestionar-clases`,label:`Clases`,icon:`bi-mortarboard`}),t}async function Re(e){let{tabla:n,operacion:r,payload:i}=e,a={...i};n===`sesiones_clase`&&(a.contenido_dsl!==void 0&&(a.contenido=a.contenido_dsl,delete a.contenido_dsl),a.asistencias!==void 0&&a.asistencia===void 0&&(a.asistencia=a.asistencias,delete a.asistencias)),console.log(`[SYNC] Intentando ${r} en ${n}:`,a);try{if(r===`insert`){let{error:e}=await t.from(n).insert([a]);if(e)throw e}else if(r===`update`){let{id:e,...r}=a,{error:i}=await t.from(n).update(r).eq(`id`,e);if(i)throw i}else if(r===`delete`){let{error:e}=await t.from(n).delete().eq(`id`,a.id);if(e)throw e}}catch(e){if(e.code===`PGRST204`){let{data:e}=await t.from(n).select().limit(1);e?.length>0?console.warn(`[SYNC] Columnas REALES encontradas:`,Object.keys(e[0])):console.warn(`[SYNC] No se pueden leer las columnas. ¿Ejecutaste el SQL en Supabase?`)}throw console.error(`[SYNC] Error crítico:`,e),e}}var G=null;async function K(){let e=document.getElementById(`pm-sync-indicator`);if(e)try{let t=await d();t.length===0?(e.className=`pm-online-dot synced`,e.title=`Sincronizado`):(e.className=`pm-online-dot pending`,e.title=`Pendiente (${t.length})`)}catch{e.className=`pm-online-dot error`,e.title=`Error de sincronización`}}async function q(){clearTimeout(G),G=setTimeout(async()=>{if(navigator.onLine)try{await u(Re)}finally{await K()}},1e3)}window.addEventListener(`online`,q),window.addEventListener(`offline`,K);function ze(){W.clear()}function Be(e){W.delete(e)}async function J(e,t={},{silent:n=!1}={}){let r=window.location.search||(window.location.hash.includes(`?`)?window.location.hash.split(`?`)[1]:``),i=new URLSearchParams(r),a=e.split(`?`)[0];if(!n){let e=document.getElementById(`pm-header`);if(e?.classList.contains(`search-active`)){e.classList.remove(`search-active`);let t=document.getElementById(`pm-header-search-input`);t&&(t.value=``)}N(a),window.pwaInstaller?.evaluateInsights()}let o=H[a];if(!o){console.warn(`[Router] Contenedor no encontrado: ${a}`);return}if(n||(typeof U==`function`&&(U(),U=null),Object.values(H).forEach(e=>{e.style.display=`none`,e.classList.remove(`active`)}),o.style.display=`block`,o.offsetHeight,o.classList.add(`active`)),W.has(a))return;let s=setTimeout(()=>{o.querySelectorAll(`.pm-loading-overlay`).forEach(e=>e.remove());let e=document.createElement(`div`);e.className=`pm-loading pm-loading-overlay`,e.innerHTML=`<div class="pm-spinner"></div>`,o.prepend(e)},300);try{let e=await I(a,o,t,i,{maestroId:z?.id,permisos:B,router:V,showLoginScreen:X,cleanupPushService:f,stopRealtime:()=>{},logoutMaestro:l,onLoginSuccess:()=>Q()});e&&(U=e),clearTimeout(s),o.querySelector(`.pm-loading-overlay`)?.remove(),Me.has(a)&&W.add(a)}catch(e){clearTimeout(s),o.innerHTML=`<p class="pm-error">Error cargando vista: ${e.message}</p>`}}function Y(e,t,n){z=t,B=n||B,Ae(e,t,Le(B),(e,t)=>V.navigate(e,t),K),document.getElementById(`pm-sync-indicator`)?.addEventListener(`click`,async e=>{e.target.classList.contains(`error`)&&await q()});let r=(V.currentRoute?.()||`hoy`).split(`?`)[0];N(r)}function X(){let e=document.getElementById(`portal-app`);if(!e)return;let t=[`login`,`register`,`pending-approval`],n=(V.currentRoute?.()||`login`).split(`?`)[0];if(t.includes(n)&&n!==`login`){document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(H,F()),Z(),V.setAuthGuard(()=>c.isAuthenticated(),t),V.start();return}let r=H.login;if(r){ke(),r.style.display=`block`,r.innerHTML=``,I(`login`,r,{},new URLSearchParams,{router:V,onLoginSuccess:e=>{e&&e!==`login`?V.navigate(e):Q()}});return}e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`,Object.assign(H,F()),Z(),V.setAuthGuard(()=>c.isAuthenticated(),t),history.replaceState({route:`login`},``,`/login`),J(`login`)}function Z(){Ne(V,Ie,J)}async function Ve(){if(z)try{let e=new Date,t=e.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),r=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,[o,s,c]=await Promise.all([n(),n().then(e=>i(e.map(e=>e.id))),n().then(()=>a(z.id,r,r))]),l=Object.fromEntries(o.map(e=>[e.id,e]));await p(s.filter(e=>e.dia?.toLowerCase()===t).map(e=>({...e,clase_nombre:l[e.clase_id]?.nombre||`Clase`})),c.filter(e=>e.borrador===!1||e.estado===`registrada`).map(e=>e.clase_id))}catch(e){console.warn(`[Alerts] Error programando alertas:`,e.message)}}async function Q(){let e=document.getElementById(`portal-app`);if(!e)return;console.log(`[Init] Iniciando Portal...`);let t=await c.init();if(console.log(`[Init] Auth:`,t?`con maestro`:`sin maestro`),c.isPendingApproval()){console.log(`[Init] Cuenta pendiente de aprobación — mostrando pantalla de espera`),document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(H,F(!1)),Z(),history.replaceState({route:`pending-approval`},``,`/pending-approval`),J(`pending-approval`);return}let n=[`login`,`register`,`pending-approval`],i=(window.router||V).currentRoute().split(`?`)[0],a=n.includes(i);if(!t&&!a){X();return}if(!t&&a){document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(H,F()),Z(),V.setAuthGuard(()=>c.isAuthenticated(),n),V.start();return}if(t.es_admin&&!t.es_maestro){console.log(`[Init] Admin puro detectado → redirigiendo a /admin`),window.location.href=`/admin`;return}let o=null;try{o=await m(t.id)}catch(e){console.warn(`[Init] Error fetching permissions:`,e.message)}Y(e,t,o),Object.assign(H,F()),Pe({isAdmin:!1,getMaestro:()=>z,getPermisosCached:()=>B,onPermisosUpdate:async(t,{ganados:r,perdidos:i})=>{let a=(V.currentRoute?.()||`perfil`).split(`?`)[0],o=a===`gestionar-clases`&&!t.puede_inscribir_clases||a===`pending-approval`&&r.length>0?`hoy`:a;Y(e,z,t),Object.assign(H,F()),Z(),V.setAuthGuard(()=>c.isAuthenticated(),n),W.clear(),await J(o),V.navigate(o)},onNavigate:e=>V.navigate(e),onResize:()=>{Y(e,z,B),Object.assign(H,F());let t=(V.currentRoute?.()||`hoy`).split(`?`)[0];N(t)}}),ie(Be,ze),Z(),V.setAuthGuard(()=>c.isAuthenticated(),n),V.start();let s=(V.currentRoute?.()||``).split(`?`)[0];(!s||s===`login`||s===`logout`)&&V.navigate(`hoy`),r().then(async()=>{let e=[`hoy`,`calendario`,`metricas`],t=(V.currentRoute?.()||`hoy`).split(`?`)[0];await e.filter(e=>e!==t&&!W.has(e)).reduce((e,t)=>e.then(()=>{if(H[t])return J(t,{},{silent:!0})}),Promise.resolve()),Ve(),window.pwaInstaller?.evaluateInsights()}).catch(e=>console.warn(`[Prefetch] Error:`,e.message)),q()}var $=(e,t,n,r)=>`
  <div style="padding:40px;color:#fff;font-family:'Outfit',sans-serif;background:radial-gradient(circle at top right,#1e293b,#0f172a);z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;max-width:600px;width:90%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <div style="width:80px;height:80px;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 24px;"><i class="bi ${e}"></i></div>
      <h2 style="margin-bottom:16px;font-weight:700;">${t}</h2>
      <p style="color:rgba(255,255,255,0.6);margin-bottom:24px;">${n}</p>
      <div style="background:rgba(0,0,0,0.3);padding:16px;border-radius:12px;text-align:left;font-family:monospace;font-size:13px;margin-bottom:24px;overflow:auto;max-height:200px;border-left:4px solid #ef4444;">${r}</div>
      <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6);color:white;border:none;padding:12px 32px;border-radius:12px;font-weight:600;cursor:pointer;">Recargar Aplicación</button>
    </div>
  </div>`;window.addEventListener(`error`,e=>{if([`useCache`,`WebSocket`,`content.js`].some(t=>(e.message||``).includes(t))){console.warn(`[Ignored Error]`,e.message);return}s(Error(e.message),{context:`window.error`,filename:e.filename,lineno:e.lineno});let t=document.getElementById(`portal-app`);t&&(t.innerHTML=$(`bi-x-circle-fill`,`Ups! Algo salió mal`,`Se ha producido un error inesperado en la aplicación.`,`<div style="color:#ef4444;font-weight:bold;margin-bottom:8px;">${e.message}</div><div style="color:rgba(255,255,255,0.4);">${e.filename?.split(`/`).pop()}:${e.lineno}</div>`))}),window.addEventListener(`unhandledrejection`,e=>{s(e.reason instanceof Error?e.reason:Error(String(e.reason)),{context:`unhandledRejection`});let t=document.getElementById(`portal-app`);t&&(t.innerHTML=$(`bi-exclamation-triangle-fill`,`Error de Sincronización`,`Hubo un problema al procesar una solicitud de red.`,`<div style="color:#ef4444;font-weight:bold;margin-bottom:8px;">Promise Rejection</div><div style="color:rgba(255,255,255,0.4);">${String(e.reason)}</div>`))}),Q().catch(e=>{let t=document.getElementById(`portal-app`);t&&(t.innerHTML=`<div style="padding:20px;color:red;font-family:monospace;background:#fff;z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;"><h2>❌ initPortal() falló</h2><pre>${e?.message||e}\n${e?.stack||``}</pre></div>`)});