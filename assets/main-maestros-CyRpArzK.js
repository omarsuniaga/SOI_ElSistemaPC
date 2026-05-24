const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/academicService-DX1WEsMf.js","assets/rolldown-runtime-tcWNtVWY.js","assets/preload-helper-CsoeaaUJ.js","assets/supabase-C4ics26R.js","assets/AchievementsSummaryModal-D1ugzeQx.js","assets/portalUtils-CisZ9vg-.js","assets/pushService-DQD3mJWH.js","assets/maestroAuth-Cae-9DFh.js","assets/permisoService-DqFoRP7a.js","assets/permisosSupabase-klEyJeUD.js","assets/ausenciasPanel-DIdVZoeQ.js","assets/ausenciaModal-C0HADYv1.js","assets/AppModal-CLA9fW7x.js","assets/AppToast-BOjiJExQ.js","assets/planningParserService-C3d6Zdil.js","assets/groqService-CcQv6lIL.js","assets/clasesApi-3E3-66yq.js"])))=>i.map(i=>d[i]);
import{B as e,G as t,H as n,I as r,J as i,R as a,S as o,U as s,V as c,c as l,d as u,f as d,n as f,p,q as m,r as h,t as g,u as _,w as v,x as y,z as b}from"./clasesView-ZzEVIV_i.js";import{i as x}from"./supabase-C4ics26R.js";import{a as S,i as ee,n as te,r as C,t as ne}from"./maestroAuth-Cae-9DFh.js";import{t as w}from"./idb-DOPm7uLh.js";import{i as T,n as re,t as ie}from"./offlineQueue-Cjwl3aiF.js";import{a as ae,c as oe,d as se,f as ce,i as le,l as ue,n as de,r as fe,s as pe,t as me,u as he}from"./pushService-DQD3mJWH.js";import"./vendor-BWfrAznO.js";import{t as E}from"./AppToast-BOjiJExQ.js";import{t as D}from"./preload-helper-CsoeaaUJ.js";import{t as O}from"./academicService-DX1WEsMf.js";import{a as ge,c as _e,i as k,l as ve,n as ye,o as be,r as A,s as xe,t as Se}from"./portalUtils-CisZ9vg-.js";import{t as Ce}from"./AppModal-CLA9fW7x.js";import{n as we,r as Te}from"./groqService-CcQv6lIL.js";import{n as j,t as Ee}from"./ausenciaModal-C0HADYv1.js";import{r as De,t as M}from"./permisoService-DqFoRP7a.js";import{a as Oe,c as ke,s as Ae,u as je}from"./clasesApi-3E3-66yq.js";var Me=[`useCache`,`WebSocket closed without opened`,`Could not establish connection`,`Receiving end does not exist`,`chrome-extension://`,`polyfill`,`content.js`,`Failed to load module script`,`net::ERR_BLOCKED_BY_CLIENT`];function Ne(e=``){let t=String(e).toLowerCase();return Me.some(e=>t.includes(e.toLowerCase()))}var Pe=console.error;console.error=function(...e){e.length>0&&!Ne(e[0])&&Pe.apply(console,e)};var Fe=console.warn;console.warn=function(...e){e.length>0&&!Ne(e[0])&&Fe.apply(console,e)},window.addEventListener(`unhandledrejection`,e=>{Ne(String(e.reason||``))&&(e.preventDefault(),e.stopImmediatePropagation())},!0),window.addEventListener(`error`,e=>{Ne(e.message||``)&&(e.preventDefault(),e.stopImmediatePropagation())},!0);var Ie=window.fetch;window.fetch=async function(...e){try{return await Ie.apply(window,e)}catch(e){if(!Ne(e.message))throw e;return null}};var Le=!1;function Re(e={}){let{dsn:t,environment:n=`development`,tracesSampleRate:r=.1}=e;if(t&&typeof window<`u`&&window.Sentry){let e=[];window.Sentry.Replay&&e.push(new window.Sentry.Replay({maskAllText:!0,blockAllMedia:!0})),window.Sentry.init({dsn:t,environment:n,tracesSampleRate:r,integrations:e,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1}),Le=!0,console.log(`[ErrorReporter] Initialized:`,n)}}function ze(e,t={}){if(!Le&&!window.Sentry)return;let{userId:n,context:r,level:i=`error`,...a}=t;n&&window.Sentry?.setUser({id:n}),r&&window.Sentry?.setTag(`context`,r),Object.keys(a).length>0&&window.Sentry?.setContext(`details`,a),e instanceof Error?(window.Sentry?.captureException(e,{level:i}),console.error(`[Error] ${e.message}`,e)):(window.Sentry?.captureMessage(String(e),i),console.warn(`[${i}] ${e}`))}var Be=!1;function Ve(e={}){let{enabled:t=!1,consent:n=!1}=e;Be=t&&n,console.log(`[Analytics] Initialized, enabled:`,Be)}var He={windowMs:6e4,max:100};function Ue(e={}){He={...He,...e},console.log(`[RateLimit] Initialized: ${He.max} requests per ${He.windowMs}ms`)}var We=null,Ge=new Set;function Ke(e=32){let t=``,n=new Uint32Array(e);if(typeof crypto<`u`&&crypto.getRandomValues)crypto.getRandomValues(n);else for(let t=0;t<e;t++)n[t]=Math.floor(Math.random()*62);for(let r=0;r<e;r++)t+=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`[n[r]%62];return t}function qe(e={}){We=Ke(e.length||32),Ge.clear(),Ge.add(We),console.log(`[CSRF] Initialized`)}var Je={LCP:null,FID:null,CLS:null,FCP:null,TTFB:null};function Ye(){return typeof window>`u`?!1:typeof PerformanceObserver<`u`}function Xe(e={}){let{debug:t=!1,onReport:n=null}=e;if(!Ye()){console.warn(`[WebVitals] Not supported in this environment`);return}console.log(`[WebVitals] Initialized`),Ze(t,n),Qe(t,n),$e(t,n),et(t,n),tt(t,n)}function Ze(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries(),i=r[r.length-1];Je.LCP=i.value,e&&console.log(`[LCP]`,i.value),t&&t(`LCP`,i.value)}).observe({entryTypes:[`largest-contentful-paint`]})}catch{e&&console.log(`[LCP] Not available`)}}function Qe(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];Je.FID=r.value,e&&console.log(`[FID]`,r.value),t&&t(`FID`,r.value)}).observe({entryTypes:[`first-input`]})}catch{e&&console.log(`[FID] Not available`)}}function $e(e,t){try{let n=0;new PerformanceObserver(r=>{for(let e of r.getEntries())e.hadRecentInput||(n+=e.value);Je.CLS=n,e&&console.log(`[CLS]`,n),t&&t(`CLS`,n)}).observe({entryTypes:[`layout-shift`]})}catch{e&&console.log(`[CLS] Not available`)}}function et(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];Je.FCP=r.value,e&&console.log(`[FCP]`,r.value),t&&t(`FCP`,r.value)}).observe({entryTypes:[`paint`]})}catch{e&&console.log(`[FCP] Not available`)}}function tt(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];Je.TTFB=r.responseStart,e&&console.log(`[TTFB]`,r.responseStart),t&&t(`TTFB`,r.responseStart)}).observe({entryTypes:[`navigation`]})}catch{e&&console.log(`[TTFB] Not available`)}}var N={maestro:null,loading:!0,listeners:[]},nt=null;function rt(){N.listeners.forEach(e=>e({...N}))}var it={subscribe(e){return N.listeners.push(e),()=>{N.listeners=N.listeners.filter(t=>t!==e)}},async init(){if(console.log(`[usePortalAuth.init] Iniciando...`),N.maestro=C(),console.log(`[usePortalAuth.init] Maestro local:`,N.maestro?`found`:`not found`),N.loading=!0,rt(),typeof process<`u`&&{}.VITEST)return N.loading=!1,rt(),console.log(`[usePortalAuth.init] Completado (Test Env)`),N.maestro;if(!nt){let{data:{subscription:e}}=x.auth.onAuthStateChange(async(e,t)=>{if(console.log(`[usePortalAuth] Evento de auth disparado: ${e}`),e===`SIGNED_OUT`||e===`USER_DELETED`){localStorage.removeItem(`portal-maestros:maestro`),N.maestro=null,rt();let e=[`login`,`register`,`pending-approval`],t=(window.router?.currentRoute?.()||`login`).split(`?`)[0];e.includes(t)||(console.log(`[usePortalAuth] Sesión inactiva o expirada en ruta privada. Recargando aplicación...`),window.location.reload())}else if((e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)&&t?.user){let e=C();if(!e||e.user_id!==t.user.id){console.log(`[usePortalAuth] Nueva sesión detectada. Sincronizando datos de maestro...`);let e=await te();e&&(N.maestro=e,rt())}}});nt=e}try{console.log(`[usePortalAuth.init] Iniciando detectarRolMaestro() con timeout de 8s...`);let e=new Promise((e,t)=>setTimeout(()=>t(Error(`Auth timeout after 8s`)),8e3)),t=await Promise.race([te(),e]);console.log(`[usePortalAuth.init] detectarRolMaestro completado:`,t?`con datos`:`sin datos`),N.maestro=t}catch(e){console.warn(`[usePortalAuth.init] Error:`,e.message),N.maestro=null}return N.loading=!1,rt(),console.log(`[usePortalAuth.init] Completado`),N.maestro},setMaestro(e){N.maestro=e,N.loading=!1,rt()},async logout(){await S(),N.maestro=null,rt()},getMaestro:()=>N.maestro,isAuthenticated:()=>!!N.maestro,isLoading:()=>N.loading},at=it.logout,ot=`calendario`;function st(){let e=new Map,t=null,n=null,r=null,i=[`login`],a=!1;function o(){let e=window.location.pathname,t=window.location.hash;return t&&t!==`#`?t.replace(`#/`,``).replace(`#`,``):e&&e!==`/`?e.replace(`/`,``):ot}function s(e,t=[`login`]){r=e,i=t,a=!0}function c(e){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.pushState({route:`login`},``,`#/login`),m(`login`);return}let t=`#/${e}`;history.pushState({route:e},``,t),m(e)}function l(e){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.replaceState({route:`login`},``,`#/login`),m(`login`);return}let t=`#/${e}`;history.replaceState({route:e},``,t),m(e)}function u(t,n){e.set(t,n)}function d(e){t=e}let f=null;function p(e){let t=e.querySelector(`h1, h2, [role="main"]`);t&&(t.hasAttribute(`tabindex`)||t.setAttribute(`tabindex`,`-1`),t.focus({preventScroll:!0}))}function m(r){if(n===r&&n!==null)return;n=r;let i=r.split(`?`)[0],a=e.get(i),o={};if(!a){for(let[t,n]of e.entries())if(t.includes(`:`)){let e=`^`+t.replace(/:[^\s/]+/g,`([^\\/]+)`)+`$`,r=new RegExp(e),s=i.match(r);if(s){a=n,t.match(/:[^\s/]+/g).forEach((e,t)=>{o[e.substring(1)]=s[t+1]});break}}}let s=a||t;if(!s)return;let c=async()=>{typeof s==`function`&&await s(r,o)};if(!document.startViewTransition||f){f&&=(f.skipTransition(),null);let e=document.querySelector(`.pm-view-content.active`);e&&(e.classList.remove(`pm-animate-fade-in`,`pm-view-enter`,`pm-view-enter-active`),e.offsetWidth),c();let t=document.querySelector(`.pm-view-content.active`);t&&(t.classList.add(`pm-animate-fade-in`),t.classList.add(`pm-view-enter`),requestAnimationFrame(()=>{t.classList.add(`pm-view-enter-active`),p(t);let e=()=>{t.classList.remove(`pm-view-enter`,`pm-view-enter-active`)};t.addEventListener(`transitionend`,e,{once:!0}),setTimeout(e,250)}));return}try{let e=document.startViewTransition(async()=>{await c()});f=e;let t=e=>e.catch(()=>{});t(e.ready),t(e.updateCallbackDone),t(e.finished),e.finished.finally(()=>{f=null;let e=document.querySelector(`.pm-view-content.active`);e&&requestAnimationFrame(()=>p(e))})}catch{f=null,c()}}function h(){window.addEventListener(`popstate`,e=>{e.state?.route?m(e.state.route):m(o())});let e=o();e!==ot&&history.replaceState({route:e},``,`#/${e}`),m(e)}return{currentRoute:o,setAuthGuard:s,navigate:c,replace:l,on:u,onNotFound:d,start:h,_dispatch:m}}var ct={misClases:6e5,horarios:6e5,sesiones:12e4,inscripciones:6e5,salones:36e5,ausencias:12e4,metricasSesiones:12e4},lt=new Map,ut=new Map;function dt(e){let t=ut.get(e);return t?Date.now()-t.timestamp<t.ttl:!1}function ft(e,t,n){lt.set(e,t),ut.set(e,{timestamp:Date.now(),ttl:n||6e4})}function pt(e){return dt(e)?lt.get(e):(lt.delete(e),ut.delete(e),null)}function mt(e,t,n){ft(e,t,ct[n]||6e4)}function ht(e){for(let t of lt.keys())t.includes(e)&&(lt.delete(t),ut.delete(t))}function gt(){lt.clear(),ut.clear()}function _t(e){return pt(e)}function vt(){return[...lt.keys()]}var P={get:pt,set:mt,invalidate:ht,invalidateAll:gt,getCached:_t,_keys:vt},yt={MIS_CLASES:`mis_clases`,HORARIOS:`horarios`,SESIONES:`sesiones`,INSCRIPCIONES:`inscripciones`,SALONES:`salones`,AUSENCIAS:`ausencias`,RUTAS:`rutas`};async function bt(){let e=C();return e?.id?e.id:null}async function F(e=!1){if(typeof process<`u`&&{}.VITEST)return[{id:`550e8400-e29b-41d4-a716-446655440000`,nombre:`Violin 101`,instrumento:`Violin`,capacidad_maxima:20,maestro_principal_id:`dc73014a-9528-4081-84eb-f713b72031ff`}];let t=await bt();if(!t)return[];if(!e){let e=P.getCached(`${yt.MIS_CLASES}_${t}`);if(e)return e}let{data:n,error:r}=await x.from(`clases`).select(`id, nombre, instrumento, plan_estudio, capacidad_maxima, maestro_principal_id`).or(`maestro_principal_id.eq.${t},maestro_suplente_id.eq.${t},maestro_id.eq.${t}`);if(r)return console.warn(`[MaestroData] Error cargando clases:`,r.message),[];let i=n||[];return P.set(`${yt.MIS_CLASES}_${t}`,i,`misClases`),i}async function xt(e,t=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,dia:`jueves`,hora_inicio:`08:00:00`,hora_fin:`09:00:00`,salon_id:`salon-1`}];if(!e||e.length===0)return[];let n=`horarios_${e.sort().join(`,`)}`;if(!t){let e=P.getCached(n);if(e)return e}let{data:r,error:i}=await x.from(`clase_horarios`).select(`hora_inicio, hora_fin, salon_id, clase_id, dia`).in(`clase_id`,e);if(i)return console.warn(`[MaestroData] Error cargando horarios:`,i.message),[];let a=r||[];return P.set(n,a,`horarios`),a}async function St(e,t,n,r=!1){if(!e)return[];if(!r){let r=Ct(e,t,n);if(r){let e=P.getCached(r);if(e)return e.filter(e=>e.fecha>=t&&e.fecha<=n)}let i=`sesiones_${e}_${t}_${n}`,a=P.getCached(i);if(a)return a}let{data:i,error:a}=await x.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,e).gte(`fecha`,t).lte(`fecha`,n);if(a)return console.warn(`[MaestroData] Error cargando sesiones:`,a.message),[];let o=i||[];return P.set(`sesiones_${e}_${t}_${n}`,o,`sesiones`),o}function Ct(e,t,n){let r=`sesiones_${e}_`;for(let e of wt()){if(!e.startsWith(r))continue;let i=e.replace(r,``).split(`_`);if(i.length===2){let[r,a]=i;if(r<=t&&a>=n)return e}}return null}function wt(){return P._keys?P._keys():[]}async function Tt(e,t=!1){if(typeof process<`u`&&{}.VITEST)return[{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`1`,alumnos:{id:`1`,nombre_completo:`Estudiante 1`,instrumento_principal:`Violin`}},{clase_id:`550e8400-e29b-41d4-a716-446655440000`,alumno_id:`2`,alumnos:{id:`2`,nombre_completo:`Estudiante 2`,instrumento_principal:`Violin`}}];if(!e||e.length===0)return[];let n=`inscripciones_${e.sort().join(`,`)}`;if(!t){let e=P.getCached(n);if(e)return e}let{data:r,error:i}=await x.from(`alumnos_clases`).select(`clase_id, alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).in(`clase_id`,e).eq(`activo`,!0);if(i)return console.warn(`[MaestroData] Error cargando inscripciones:`,i.message),[];let a=r||[];return P.set(n,a,`inscripciones`),a}async function Et(e,t=!1){if(!e||e.length===0)return[];let n=`salones_${e.sort().join(`,`)}`;if(!t){let e=P.getCached(n);if(e)return e}let{data:r,error:i}=await x.from(`salones`).select(`id, nombre`).in(`id`,e);if(i)return console.warn(`[MaestroData] Error cargando salones:`,i.message),[];let a=r||[];return P.set(n,a,`salones`),a}async function Dt(){let e=await bt();if(!e)return;let t=await F(),n=t.map(e=>e.id);if(n.length===0)return;let r=new Date,i=new Date(r.getFullYear(),r.getMonth(),1),a=new Date(r.getFullYear(),r.getMonth()+1,0),o=new Date(r);o.setDate(o.getDate()-28);let s=o<i?o.toISOString().split(`T`)[0]:i.toISOString().split(`T`)[0],c=a.toISOString().split(`T`)[0],[l,u,,d]=await Promise.all([xt(n),Tt(n),St(e,s,c),Promise.resolve(null)]),f=[...new Set(l.map(e=>e.salon_id).filter(Boolean))];f.length>0&&await Et(f),console.log(`[Prefetch] Mes cargado: ${t.length} clases, ${l.length} horarios, ${u.length} inscripciones`)}function Ot(){P.invalidate(`mis_clases`),P.invalidate(`horarios`),P.invalidate(`inscripciones`),P.invalidate(`sesiones`)}var I=null,kt=null;function At(e,t=`polite`){I||(I=document.createElement(`div`),I.setAttribute(`aria-live`,t),I.setAttribute(`aria-atomic`,`true`),I.classList.add(`pm-visually-hidden`),document.body.appendChild(I)),t===`assertive`?(I.setAttribute(`role`,`alert`),I.setAttribute(`aria-live`,`assertive`)):(I.removeAttribute(`role`),I.setAttribute(`aria-live`,`polite`)),clearTimeout(kt),kt=setTimeout(()=>{I.textContent=``,requestAnimationFrame(()=>{I.textContent=e})},50)}function jt(e,t){if(!e||!e.id)return;Mt(e);let n=`${e.id}-error`,r=document.createElement(`span`);r.id=n,r.className=`pm-field-error`,r.setAttribute(`role`,`alert`),r.textContent=t,e.nextSibling?e.parentNode.insertBefore(r,e.nextSibling):e.parentNode.appendChild(r),e.setAttribute(`aria-invalid`,`true`),e.setAttribute(`aria-describedby`,n)}function Mt(e){if(e&&(e.removeAttribute(`aria-invalid`),e.removeAttribute(`aria-describedby`),e.id)){let t=document.getElementById(`${e.id}-error`);t&&t.remove()}}function Nt(e){(e||document).querySelectorAll(`[aria-invalid="true"]`).forEach(e=>Mt(e))}function Pt(e,{onSuccess:t}){e.innerHTML=`
    <div class="pm-login">
      <!-- Branding Side (Desktop) -->
      <div class="pm-login-branding">
        <div class="pm-login-logo"><i class="bi bi-music-note-beamed"></i></div>
        <h1 class="pm-login-title">Portal Maestros</h1>
        <p class="pm-login-subtitle">Sistema Operativo Institucional — SOI</p>
      </div>

      <!-- Form Side -->
      <div class="pm-login-form">
        <div class="pm-login-card">
          <div class="pm-input-group">
            <label for="pm-email">Correo electrónico</label>
            <input
              type="email"
              id="pm-email"
              class="pm-input"
              placeholder="tu@correo.com"
              autocomplete="username"
              inputmode="email"
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-password">Contraseña</label>
            <div class="pm-password-wrapper">
              <input
                type="password"
                id="pm-password"
                class="pm-input"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button
                type="button"
                id="pm-toggle-password"
                class="pm-password-toggle"
                title="Mostrar contraseña"
                aria-label="Mostrar contraseña"
              >
                <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>

        <div class="pm-checkbox-group">
          <label class="pm-checkbox-label">
            <input type="checkbox" id="pm-remember-email" />
            Recordar correo electrónico
          </label>
          <label class="pm-checkbox-label">
            <input type="checkbox" id="pm-keep-session" />
            Mantener sesión abierta por 30 días
          </label>
        </div>

        <button type="button" class="pm-btn-primary" id="pm-login-btn">
          <span class="pm-btn-text">Iniciar sesión</span>
          <span class="pm-btn-loader d-none">
            <span class="pm-spinner-sm"></span>
            Validando...
          </span>
        </button>

        <button type="button" class="pm-btn-secondary" id="pm-biometric-btn" style="display:none;">
          <i class="bi bi-fingerprint"></i> Usar huella o Face ID
        </button>

        <p class="pm-error-msg" id="pm-login-error" aria-live="polite"></p>

        <p class="pm-login-register-link">
          <a href="#" data-route="register" class="pm-link">¿No tenés cuenta? Registrate como maestro</a>
        </p>
      </div>
    </div>
    <style>
      .pm-input[aria-invalid="true"] {
        border-color: var(--pm-danger, #ef4444);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
      }
    </style>
  `;let n=e.querySelector(`#pm-email`),r=e.querySelector(`#pm-password`),i=e.querySelector(`#pm-login-btn`),a=e.querySelector(`#pm-login-error`),o=e.querySelector(`#pm-toggle-password`),s=e.querySelector(`#pm-remember-email`),c=e.querySelector(`#pm-keep-session`),l=!1;o.addEventListener(`click`,()=>{l=!l,r.type=l?`text`:`password`,o.querySelector(`i`).className=l?`bi bi-eye-slash`:`bi bi-eye`,o.title=l?`Ocultar contraseña`:`Mostrar contraseña`,o.setAttribute(`aria-label`,l?`Ocultar contraseña`:`Mostrar contraseña`),o.setAttribute(`aria-pressed`,l?`true`:`false`)});let u=localStorage.getItem(`pm-saved-email`);u&&(n.value=u,s.checked=!0),s.addEventListener(`change`,()=>{s.checked?localStorage.setItem(`pm-saved-email`,n.value):localStorage.removeItem(`pm-saved-email`)}),n.addEventListener(`input`,()=>{s.checked&&localStorage.setItem(`pm-saved-email`,n.value)});async function d(){let i=n.value.trim(),o=r.value;a.textContent=``,Nt(e),p(!1);let s=!1;if(i||(jt(n,`Ingresa tu correo electrónico`),n.focus(),s=!0),o||(jt(r,`Ingresa tu contraseña`),s||r.focus(),s=!0),s)return;f(!0);let l=c.checked?720*60*60*1e3:void 0;l&&localStorage.setItem(`pm-session-expires`,new Date(Date.now()+l).toISOString());let u=await ee(i,o);if(u.success){it.setMaestro(u.maestro);let e=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),t&&t(e)}else a.textContent=u.error,f(!1),localStorage.removeItem(`pm-session-expires`),r.value=``,r.focus()}function f(e){i.disabled=e,n.disabled=e,r.disabled=e,c.disabled=e,o.disabled=e;let t=i.querySelector(`.pm-btn-text`),a=i.querySelector(`.pm-btn-loader`);e?(t?.classList.add(`d-none`),a?.classList.remove(`d-none`)):(t?.classList.remove(`d-none`),a?.classList.add(`d-none`))}function p(e){n.disabled=e,r.disabled=e,c.disabled=e,o.disabled=e}i.addEventListener(`click`,d),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&d()});let m=e.querySelector(`#pm-biometric-btn`);async function h(){if(!window.PublicKeyCredential)return!1;try{return await navigator.credentials.get({mediation:`optional`}),!0}catch{return!1}}async function g(){try{if(await navigator.credentials.get({mediation:`required`,publicKey:{challenge:new TextEncoder().encode(`login-challenge`)}})){let e=localStorage.getItem(`portal-maestros:maestro`);if(e){let n=JSON.parse(e);it.setMaestro(n);let r=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),t&&t(r)}else a.textContent=`No hay sesión biométrica guardada. Iniciá sesión con contraseña primero.`}}catch(e){console.log(`[WebAuthn] No se pudo usar biometría:`,e.message)}}h().then(e=>{e&&(m.style.display=`flex`,m.onclick=g)}),e.querySelector(`[data-route="register"]`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router?window.router.navigate(`register`):console.error(`[LoginView] Router not found in window`)}),requestAnimationFrame(()=>n.focus())}function Ft(e,{onSuccess:t}){e.innerHTML=`
    <div class="pm-login">
      <!-- Branding Side (Desktop) -->
      <div class="pm-login-branding">
        <div class="pm-login-logo"><i class="bi bi-music-note-beamed"></i></div>
        <h1 class="pm-login-title">Registro de Maestro</h1>
        <p class="pm-login-subtitle">Sistema Operativo Institucional — SOI</p>
      </div>

      <!-- Form Side -->
      <div class="pm-login-form">
        <div class="pm-login-card">
          <div class="pm-input-group">
            <label for="pm-reg-nombre">Nombre completo</label>
            <input
              type="text"
              id="pm-reg-nombre"
              class="pm-input"
              placeholder="Tu nombre completo"
              autocomplete="name"
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-email">Correo electrónico</label>
            <input
              type="email"
              id="pm-reg-email"
              class="pm-input"
              placeholder="tu@correo.com"
              autocomplete="email"
              inputmode="email"
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-password">Contraseña</label>
            <div class="pm-password-wrapper">
              <input
                type="password"
                id="pm-reg-password"
                class="pm-input"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
              />
              <button
                type="button"
                id="pm-reg-toggle-password"
                class="pm-password-toggle"
                title="Mostrar contraseña"
                aria-label="Mostrar contraseña"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-confirm-password">Confirmar contraseña</label>
            <div class="pm-password-wrapper">
              <input
                type="password"
                id="pm-reg-confirm-password"
                class="pm-input"
                placeholder="Repetí tu contraseña"
                autocomplete="new-password"
              />
              <button
                type="button"
                id="pm-reg-toggle-confirm-password"
                class="pm-password-toggle"
                title="Mostrar contraseña"
                aria-label="Mostrar contraseña"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-instrumento">Instrumento principal</label>
            <input
              type="text"
              id="pm-reg-instrumento"
              class="pm-input"
              placeholder="Ej: Violín, Piano, Guitarra..."
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-resena">Breve reseña (opcional)</label>
            <textarea
              id="pm-reg-resena"
              class="pm-input"
              placeholder="Contanos brevemente sobre tu experiencia..."
              rows="3"
            ></textarea>
          </div>

          <button type="button" class="pm-btn-primary" id="pm-register-btn">
            <span class="pm-btn-text">Crear cuenta</span>
            <span class="pm-btn-loader d-none">
              <span class="pm-spinner-sm"></span>
              Registrando...
            </span>
          </button>

          <p class="pm-error-msg" id="pm-reg-error" aria-live="polite"></p>

          <p class="pm-login-register-link">
            <a href="#" data-route="login" class="pm-link">¿Ya tenés cuenta? Iniciar sesión</a>
          </p>
        </div>
      </div>
    </div>
  `;let n=e.querySelector(`#pm-reg-nombre`),r=e.querySelector(`#pm-reg-email`),i=e.querySelector(`#pm-reg-password`),a=e.querySelector(`#pm-reg-confirm-password`),o=e.querySelector(`#pm-reg-instrumento`),s=e.querySelector(`#pm-reg-resena`),c=e.querySelector(`#pm-register-btn`),l=e.querySelector(`#pm-reg-error`),u=e.querySelector(`#pm-reg-toggle-password`),d=e.querySelector(`#pm-reg-toggle-confirm-password`),f=!1;u.addEventListener(`click`,()=>{f=!f,i.type=f?`text`:`password`,u.querySelector(`i`).className=f?`bi bi-eye-slash`:`bi bi-eye`,u.title=f?`Ocultar contraseña`:`Mostrar contraseña`,u.setAttribute(`aria-label`,f?`Ocultar contraseña`:`Mostrar contraseña`)});let p=!1;d.addEventListener(`click`,()=>{p=!p,a.type=p?`text`:`password`,d.querySelector(`i`).className=p?`bi bi-eye-slash`:`bi bi-eye`,d.title=p?`Ocultar contraseña`:`Mostrar contraseña`,d.setAttribute(`aria-label`,p?`Ocultar contraseña`:`Mostrar contraseña`)});async function m(){let c=n.value.trim(),u=r.value.trim(),d=i.value,f=a.value,p=o.value.trim();l.textContent=``,Nt(e),g(!1);let m=!1;if(c||(jt(n,`Ingresá tu nombre completo`),m||n.focus(),m=!0),u||(jt(r,`Ingresá tu correo electrónico`),m||r.focus(),m=!0),(!d||d.length<6)&&(jt(i,`La contraseña debe tener al menos 6 caracteres`),m||i.focus(),m=!0),f?d!==f&&(jt(a,`Las contraseñas no coinciden`),m||a.focus(),m=!0):(jt(a,`Confirmá tu contraseña`),m||a.focus(),m=!0),m)return;h(!0);let{data:_,error:v}=await x.auth.signUp({email:u,password:d,options:{data:{full_name:c,rol:`maestro`,instrumento:p,resena:s.value.trim()}}});if(v){l.textContent=v.message===`User already registered`?`Este correo ya está registrado`:v.message||`Error al registrarse. Intentá de nuevo.`,h(!1);return}h(!1),t&&t()}function h(e){c.disabled=e,n.disabled=e,r.disabled=e,i.disabled=e,a.disabled=e,o.disabled=e,s.disabled=e,u.disabled=e,d.disabled=e;let t=c.querySelector(`.pm-btn-text`),l=c.querySelector(`.pm-btn-loader`);e?(t?.classList.add(`d-none`),l?.classList.remove(`d-none`)):(t?.classList.remove(`d-none`),l?.classList.add(`d-none`))}function g(e){n.disabled=e,r.disabled=e,i.disabled=e,a.disabled=e,o.disabled=e,s.disabled=e,u.disabled=e,d.disabled=e}c.addEventListener(`click`,m),a.addEventListener(`keydown`,e=>{e.key===`Enter`&&m()}),e.querySelector(`[data-route="login"]`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router?window.router.navigate(`login`):console.error(`[RegisterView] Router not found in window`)}),requestAnimationFrame(()=>n.focus())}function It(e,{onBackToLogin:t}){e.innerHTML=`
    <div class="pm-login">
      <div class="pm-login-branding">
        <div class="pm-login-logo"><i class="bi bi-clock"></i></div>
        <h1 class="pm-login-title">Registro exitoso</h1>
        <p class="pm-login-subtitle">Sistema Operativo Institucional — SOI</p>
      </div>

      <div class="pm-login-form">
        <div class="pm-login-card" style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--pm-primary, #3b82f6);">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <h2 style="margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;">
            ¡Registro exitoso!
          </h2>
          <p style="margin-bottom: 1.5rem; color: rgba(255,255,255,0.6); line-height: 1.6;">
            Esperá la aprobación del administrador para poder acceder al sistema.
            Te notificaremos cuando tu cuenta esté activa.
          </p>
          <button type="button" class="pm-btn-primary" data-route="login">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  `,e.querySelector(`[data-route="login"]`)?.addEventListener(`click`,e=>{e.preventDefault(),t?t():(history.pushState({route:`login`},``,`#/login`),window.dispatchEvent(new PopStateEvent(`popstate`,{state:{route:`login`}})))})}async function Lt(e,{onClaseClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let n=C();if(!n){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let r=new Date,i=r.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),a=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,`0`)}-${String(r.getDate()).padStart(2,`0`)}`;try{let o=await F();if(!o||o.length===0){e.innerHTML=`<p class="pm-empty">No tenés clases asignadas.</p>`;return}let s=o.map(e=>e.id),c=Object.fromEntries(o.map(e=>[e.id,e])),l=(await xt(s)).filter(e=>e.dia?.toLowerCase()===i).sort((e,t)=>e.hora_inicio.localeCompare(t.hora_inicio));if(!l||l.length===0){e.innerHTML=`
        <h2 class="pm-date-header">${A(i)} ${ge(r)}</h2>
        <p class="pm-empty">No tenés clases hoy.</p>
      `;return}let u=(await St(n.id,a,a)).filter(e=>s.includes(e.clase_id)).filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return t||e.borrador===!1&&n}),d=new Set(u.map(e=>e.clase_id)),f=await Tt(s),p={};for(let e of f||[])e.clase_id&&(p[e.clase_id]=(p[e.clase_id]||0)+1);let m=[...new Set(l.map(e=>e.salon_id).filter(Boolean))],h=m.length>0?await Et(m):[],g=Object.fromEntries(h.map(e=>[e.id,e.nombre])),_=l.map(e=>{let t=c[e.clase_id],n=d.has(t.id),r=p[t.id]||0,i=n?`registrada`:`sin-registrar`,a=n?`<span class="pm-badge pm-badge-success"><i class="bi bi-check-circle-fill me-1"></i>Registrada</span>`:`<span class="pm-badge pm-badge-danger">Sin registrar</span>`;return`
        <div class="pm-clase-card ${i}" data-clase-id="${t.id}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="pm-clase-nombre">${k(t.nombre)}</div>
            ${a}
          </div>
          <div class="pm-clase-meta">
            <div class="meta-item"><i class="bi bi-clock"></i> ${be(e.hora_inicio)} – ${be(e.hora_fin)}</div>
            <div class="meta-item"><i class="bi bi-music-note-beamed"></i> ${k(t.instrumento||`—`)}</div>
            <div class="meta-item"><i class="bi bi-people"></i> ${r} alumnos</div>
            ${e.salon_id?`<div class="meta-item"><i class="bi bi-geo-alt"></i> ${k(g[e.salon_id]||`Salón`)}</div>`:``}
          </div>
        </div>
      `}).join(``);e.innerHTML=`
      <div style="padding: 1rem 1rem 2rem;">
        <h2 class="pm-date-header">${A(i)} ${ge(r)}</h2>
        <div class="pm-clases-container">
          ${_}
        </div>
      </div>
    `,e.querySelectorAll(`.pm-clase-card`).forEach(e=>{e.addEventListener(`click`,async()=>{if(e.classList.contains(`pm-card-loading`))return;e.classList.add(`pm-card-loading`);let r=e.dataset.claseId;try{await O.createSnapshotFromPlan(r,a,n.id)}catch(e){console.error(`Error generando snapshot:`,e)}e.classList.remove(`pm-card-loading`),t?.(r)})})}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${k(t.message)}</p>`}}var Rt=null,zt=null;function Bt(e={}){let{fecha:t=``,claseId:n=``,clases:r=[],maestroId:i=null,onSave:a=null}=e;Rt=a,zt=i,Ce.open({title:`⚡ Nueva Clase Emergente`,size:`lg`,saveText:`Crear Clase`,cancelText:`Cancelar`,body:`
      <form id="formClaseEmergente" class="pm-emergente-form">
        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">📅 Información de la Sesión</h3>
          <div class="pm-emergente-grid">
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Fecha</label>
              <input type="date" class="pm-emergente-input" id="modal-fecha" required value="${t}">
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Clase</label>
              <select class="pm-emergente-select" id="modal-clase_id" required>
                <option value="">Seleccionar...</option>
                ${r.map(e=>`<option value="${e.id}" ${e.id===n?`selected`:``}>${Vt(e.nombre)}</option>`).join(``)}
              </select>
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Hora inicio</label>
              <input type="time" class="pm-emergente-input" id="modal-hora_inicio" required>
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Hora fin</label>
              <input type="time" class="pm-emergente-input" id="modal-hora_fin" required>
            </div>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">📝 Contenido</h3>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Tema / Título</label>
            <input type="text" class="pm-emergente-input" id="modal-tema" required placeholder="Ej: Clase especial de repertorio">
          </div>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Descripción</label>
            <textarea class="pm-emergente-textarea" id="modal-contenido" rows="3" placeholder="Describe los objetivos de esta clase especial..."></textarea>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">⚠️ Motivo</h3>
          <div class="pm-emergente-field full">
            <select class="pm-emergente-select" id="modal-motivo" required>
              <option value="">Seleccionar motivo...</option>
              <option value="recuperacion">🔄 Recuperación (feriado/ausencia)</option>
              <option value="concierto">🎭 Preparación para concerto/recital</option>
              <option value="examen">📋 Examen parcial</option>
              <option value="reemplazo">👥 Reemplazo de maestro</option>
              <option value="especial">⭐ Clase especial programada</option>
              <option value="otro">📌 Otro motivo</option>
            </select>
          </div>
        </div>

        <div class="pm-emergente-section">
          <label class="pm-emergente-checkbox">
            <input type="checkbox" id="modal-es_co-docencia">
            <span class="pm-emergente-checkbox-mark">✓</span>
            <span class="pm-emergente-checkbox-text">¿Esta clase tiene co-docencia?</span>
          </label>
          
          <div id="codocencia-fields" class="pm-emergente-codocencia" style="display: none;">
            <div class="pm-emergente-codocencia-card">
              <label class="pm-emergente-label">Maestro auxiliar</label>
              <select class="pm-emergente-select" id="modal-maestro_auxiliar_id">
                <option value="">Seleccionar maestro...</option>
              </select>
              <span class="pm-emergente-hint">El maestro auxiliar podrá ver y editar esta sesión.</span>
            </div>
          </div>
        </div>

        <style>
          .pm-emergente-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }
          .pm-emergente-section {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .pm-emergente-section-title {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--pm-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin: 0;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--pm-border);
          }
          .pm-emergente-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .pm-emergente-field {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
          }
          .pm-emergente-field.full {
            grid-column: span 2;
          }
          .pm-emergente-label {
            font-size: 0.8125rem;
            font-weight: 500;
            color: var(--pm-text);
          }
          .pm-emergente-input,
          .pm-emergente-select,
          .pm-emergente-textarea {
            padding: 0.625rem 0.875rem;
            border: 1px solid var(--pm-border);
            border-radius: 10px;
            font-size: 0.875rem;
            background: var(--pm-surface);
            color: var(--pm-text);
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .pm-emergente-input:focus,
          .pm-emergente-select:focus,
          .pm-emergente-textarea:focus {
            border-color: var(--pm-primary);
            box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
          }
          .pm-emergente-textarea {
            resize: vertical;
            min-height: 80px;
          }
          .pm-emergente-checkbox {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 0.75rem;
            background: var(--pm-surface-2);
            border-radius: 10px;
          }
          .pm-emergente-checkbox input {
            display: none;
          }
          .pm-emergente-checkbox-mark {
            width: 22px;
            height: 22px;
            border: 2px solid var(--pm-border);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            color: transparent;
            transition: all 0.2s;
          }
          .pm-emergente-checkbox input:checked + .pm-emergente-checkbox-mark {
            background: var(--pm-primary);
            border-color: var(--pm-primary);
            color: white;
          }
          .pm-emergente-checkbox-text {
            font-size: 0.875rem;
            color: var(--pm-text);
          }
          .pm-emergente-codocencia {
            margin-top: 0.5rem;
          }
          .pm-emergente-codocencia-card {
            padding: 1rem;
            background: linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(88, 86, 214, 0.05) 100%);
            border: 1px solid rgba(88, 86, 214, 0.2);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .pm-emergente-hint {
            font-size: 0.75rem;
            color: var(--pm-text-muted);
          }
        </style>
      </form>
    `,onShow:e=>{let t=e.querySelector(`#modal-es_co-docencia`),n=e.querySelector(`#codocencia-fields`);t?.addEventListener(`change`,e=>{n.style.display=e.target.checked?`block`:`none`}),e.querySelector(`#modal-clase_id`)?.addEventListener(`change`,async n=>{let i=n.target.value,a=r.find(e=>e.id===i);if(a?.maestro_auxiliar_id&&t.checked){let t=e.querySelector(`#modal-maestro_auxiliar_id`);t.value=a.maestro_auxiliar_id}})},onSave:async e=>{let t={fecha:e.querySelector(`#modal-fecha`).value,clase_id:e.querySelector(`#modal-clase_id`).value,hora_inicio:e.querySelector(`#modal-hora_inicio`).value,hora_fin:e.querySelector(`#modal-hora_fin`).value,tema:e.querySelector(`#modal-tema`).value.trim(),contenido:e.querySelector(`#modal-contenido`).value.trim(),motivo:e.querySelector(`#modal-motivo`).value,tipo:`emergente`,es_codocencia:e.querySelector(`#modal-es_co-docencia`).checked,maestro_auxiliar_id:e.querySelector(`#modal-maestro_auxiliar_id`)?.value||null,estado:`pendiente`,maestro_id:zt};return!t.fecha||!t.clase_id||!t.hora_inicio||!t.hora_fin||!t.tema||!t.motivo?(E.error(`Todos los campos obligatorios deben completarse`),!1):t.hora_inicio>=t.hora_fin?(E.error(`La hora de inicio debe ser menor que la hora de fin`),!1):(Rt&&await Rt(t),!0)}})}function Vt(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}var Ht=[`Do`,`Lu`,`Ma`,`Mi`,`Ju`,`Vi`,`Sa`],Ut=7;async function Wt(e,{onFechaClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let n=C();if(!n){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let r=new Date,i=r.getFullYear(),a=r.getMonth();async function o(){try{let s=await Gt(n.id,i,a);Kt(e,i,a,r,s,{onFechaClick:e=>{qt(e),t?.(e)},onPrev:()=>{a===0?(i--,a=11):a--,o()},onNext:()=>{a===11?(i++,a=0):a++,o()}})}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar calendario: ${k(t.message)}</p>`}}await o()}async function Gt(e,t,n){let r=new Date(t,n,1),i=new Date(t,n+1,0),a=r.toISOString().split(`T`)[0],o=i.toISOString().split(`T`)[0],s=(await F()).map(e=>e.id);if(s.length===0)return new Map;let c=await xt(s),l=new Set(c.map(e=>e.dia?.toLowerCase())),u=new Map;c.forEach(e=>{let t=e.dia?.toLowerCase(),n=e.hora_fin||`23:59`;(t&&!u.has(t)||n>u.get(t))&&u.set(t,n)});let d=await St(e,a,o),f=d.filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return e.estado===`registrada`||e.estado===`cerrada`||t||e.borrador===!1&&n}),p=new Set(f.map(e=>e.fecha)),m=new Map,h=new Date;h.setHours(0,0,0,0);for(let e=new Date(r);e<=i;e.setDate(e.getDate()+1)){let t=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=Se[e.getDay()];if(!l.has(n)){m.set(t,`sin-clase`);continue}let r=new Date(e),i=Math.floor((h-r)/864e5);if(i===0){let e=d.find(e=>e.fecha===t);if(e&&Array.isArray(e.asistencia)&&e.asistencia.length>0){m.set(t,`registrada`);continue}let r=u.get(n);if(r){let e=new Date,[n,i]=r.split(`:`),a=parseInt(n)*60*60*1e3+parseInt(i||0)*60*1e3;if(e.getHours()*60*60*1e3+e.getMinutes()*60*1e3<a){m.set(t,`sin-clase`);continue}}m.set(t,`pendiente`);continue}if(i>0&&p.has(t)){m.set(t,`registrada`);continue}i<0?m.set(t,`sin-clase`):i<=Ut?m.set(t,`pendiente`):m.set(t,`vencida`)}return m}function Kt(e,t,n,r,i,{onFechaClick:a,onPrev:o,onNext:s}){let c=new Date(t,n,1),l=new Date(t,n+1,0),u=c.getDay(),d=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,`0`)}-${String(r.getDate()).padStart(2,`0`)}`,f=l.getDate(),p=`${t}-${String(n+1).padStart(2,`0`)}-01`,m=`${t}-${String(n+1).padStart(2,`0`)}-${String(f).padStart(2,`0`)}`,h=d>=p&&d<=m?d:p,g=Ht.map(e=>`<div class="pm-cal-day-header">${e}</div>`).join(``);for(let e=0;e<u;e++)g+=`<div class="pm-cal-day otro-mes"></div>`;for(let e=1;e<=f;e++){let r=`${t}-${String(n+1).padStart(2,`0`)}-${String(e).padStart(2,`0`)}`,a=i.get(r)||`sin-clase`,o=r===d?`today`:``,s=r===h,c=`${e} de ${ye[n]} ${t}`;g+=`
      <div class="pm-cal-day estado-${a} ${o}" data-fecha="${r}" title="${r}" role="gridcell" tabindex="${s?`0`:`-1`}" aria-label="${c}" aria-selected="false"${r===d?` aria-current="date"`:``}>
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
          ${ye[n]} ${t}
        </h2>
        <button id="pm-cal-next" class="pm-cal-nav-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div class="pm-cal-grid-container">
        <div class="pm-cal-grid" role="grid" aria-label="Calendario ${ye[n]} ${t}">
          ${g}
        </div>
      </div>

      <div class="pm-cal-legend">
        <div class="pm-cal-legend-item">
          <div class="pm-cal-legend-dot" style="background:var(--pm-success)"></div> Registrada
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
  `,e.querySelector(`#pm-cal-prev`).addEventListener(`click`,o),e.querySelector(`#pm-cal-next`).addEventListener(`click`,s),e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(e=>e.setAttribute(`aria-selected`,`false`)),t.setAttribute(`aria-selected`,`true`),a?.(t.dataset.fecha)})});let _=e.querySelector(`.pm-cal-grid`);_&&_.addEventListener(`keydown`,function(e){let t=[..._.querySelectorAll(`.pm-cal-day[data-fecha]`)];if(t.length===0)return;let n=_.querySelector(`[tabindex="0"]`),r=n?t.indexOf(n):-1,i=e=>{e<0||e>=t.length||(t.forEach(e=>e.setAttribute(`tabindex`,`-1`)),t[e].setAttribute(`tabindex`,`0`),t[e].focus())};switch(e.key){case`ArrowLeft`:e.preventDefault(),r>0&&i(r-1);break;case`ArrowRight`:e.preventDefault(),r<t.length-1&&i(r+1);break;case`ArrowUp`:e.preventDefault(),i(Math.max(0,r-7));break;case`ArrowDown`:e.preventDefault(),i(Math.min(t.length-1,r+7));break;case`Home`:e.preventDefault(),i(Math.floor(Math.max(r,0)/7)*7);break;case`End`:e.preventDefault(),i(Math.min(t.length-1,Math.floor(Math.max(r,0)/7)*7+6));break;case`PageUp`:e.preventDefault(),typeof o==`function`&&o();break;case`PageDown`:e.preventDefault(),typeof s==`function`&&s();break;case`Enter`:case` `:e.preventDefault(),n&&n.click();break}})}async function qt(e){let t=C();if(!t)return;let n=new Date,r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}-${String(n.getDate()).padStart(2,`0`)}`,i=document.getElementById(`pm-action-drawer`);i||(i=document.createElement(`div`),i.id=`pm-action-drawer`,i.className=`pm-drawer-overlay`,document.body.appendChild(i));let a=e===r,o=e<r,s=[],c=[],l=[];try{let{data:n}=await x.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,t.id).eq(`fecha`,e);s=n||[];let{data:r}=await x.from(`clases`).select(`id, nombre, instrumento`).or(`maestro_principal_id.eq.${t.id},maestro_suplente_id.eq.${t.id},maestro_id.eq.${t.id}`);c=r||[];let i=c.map(e=>e.id);if(i.length>0){let{data:e}=await x.from(`clase_horarios`).select(`clase_id, hora_inicio, hora_fin, dia`).in(`clase_id`,i);l=e||[]}}catch(e){console.error(`Error fetching drawer data:`,e)}let[u,d,f]=e.split(`-`).map(Number),p=new Date(u,d-1,f),m=p.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),h=c.filter(e=>l.some(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===m)).map(e=>{let t=l.find(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===m),n=s.find(t=>t.clase_id===e.id);return{...e,hora_inicio:t?.hora_inicio,hora_fin:t?.hora_fin,sesion:n}}).sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)),g=``;if(h.length>0&&(g=h.map(e=>{let t=e.sesion&&(()=>{let t=Array.isArray(e.sesion.asistencia)&&e.sesion.asistencia.length>0,n=typeof e.sesion.contenido==`string`&&e.sesion.contenido.trim().length>0;return e.sesion.estado===`registrada`||e.sesion.estado===`cerrada`||t||e.sesion.borrador===!1&&n})(),n=e.sesion&&!t&&(e.sesion.estado===`pendiente`||e.sesion.borrador===!0);return`
        <div class="pm-drawer-clase-item">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(e.hora_inicio||`--:--`).slice(0,5)} - ${(e.hora_fin||`--:--`).slice(0,5)}</span>
            <span class="pm-drawer-clase-nombre">${k(e.nombre)}</span>
            <span class="pm-drawer-clase-instrumento">${k(e.instrumento||``)}</span>
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
      `}).join(``)),i.innerHTML=`
    <div class="pm-drawer-content">
      <div class="pm-drawer-header">
        <div style="flex:1">
          <h3 style="margin:0; font-size:1.1rem; font-weight:700;">${p.toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`})}</h3>
          <p style="margin:0.25rem 0 0; font-size:0.85rem; color:var(--pm-text-muted);">
            ${h.length>0?`${h.length} clase(s) programada(s)`:`Sin clases programadas`}
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
        ${g||`<p style="text-align:center;color:var(--pm-text-muted);padding:2rem 1rem;">No hay clases programadas para esta fecha</p>`}
        ${!o&&!a?`
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
    `,document.head.appendChild(e)}let _=()=>i.classList.remove(`open`),v=i.querySelector(`#pm-drawer-close-btn`);v&&(v.onclick=_),i.addEventListener(`click`,e=>{e.target===i&&_()}),i.querySelectorAll(`.btn-pasar-asistencia, .btn-ver-sesion, .btn-continuar-sesion`).forEach(t=>{t&&t.addEventListener(`click`,()=>{let n=t.dataset.clase;_(),window.location.hash=`#/asistencia?clase=${n}&fecha=${e}`})});let y=i.querySelector(`#pm-drawer-emergente`);y&&y.addEventListener(`click`,()=>{Jt(e,c)}),setTimeout(()=>i.classList.add(`open`),10)}async function Jt(e,t){Bt({fecha:e,clases:t,maestroId:C().id,onSave:async e=>{try{let{data:t,error:n}=await x.from(`sesiones_clase`).insert([e]).select().single();if(n)throw n;let r=document.getElementById(`pm-action-drawer`);r&&r.classList.remove(`open`),window.location.hash=`#/asistencia?clase=${e.clase_id}&fecha=${e.fecha}`,E.success(`Clase emergente creada. Procedé a pasar asistencia.`)}catch(e){console.error(`Error creando clase emergente:`,e),E.error(`No se pudo crear la clase emergente`)}}})}function Yt(e,t,n=160,r=36){if(!e||e.length===0)return`<text x="${n/2}" y="${r/2+4}" text-anchor="middle" font-size="9" fill="var(--pm-text-muted)">Sin datos</text>`;let i=Math.max(10,Math.min(24,(n-(e.length-1)*4)/e.length)),a=(n-i*e.length)/(e.length+1),o=Math.max(...e,1);return e.map((e,t)=>{let n=Math.max(4,e/o*(r-10)),s=a+t*(i+a),c=r-n-6;return`<rect x="${s}" y="${c}" width="${i}" height="${n}" rx="3" fill="${e>=70?`var(--pm-success)`:e>=50?`var(--pm-warning)`:`var(--pm-danger)`}" aria-label="${e}%"/>
      <text x="${s+i/2}" y="${c-3}" text-anchor="middle" font-size="7" fill="var(--pm-text-muted)">${e}%</text>`}).join(``)}var L={periodo:4,maestroId:null,clasesData:[],todasSesiones:[],inscripcionesPorClase:{},alertasRiesgo:[]};async function Xt(e,t){let n=await F();n.sort((e,t)=>e.nombre.localeCompare(t.nombre));let r=new Date;r.setDate(r.getDate()-e*7);let i=r.toISOString().split(`T`)[0],a=new Date().toISOString().split(`T`)[0],o=await St(t,i,a)||[],s=n.map(e=>e.id);if(s.length===0)return{clases:n,sesiones:o,inscripcionesPorClase:{}};let{data:c}=await x.from(`alumnos_clases`).select(`clase_id, alumno:alumnos(id, nombre_completo)`).in(`clase_id`,s).eq(`activo`,!0),l={};for(let e of c||[])!e.clase_id||!e.alumno||(l[e.clase_id]||(l[e.clase_id]=[]),l[e.clase_id].push(e.alumno));return{clases:n,sesiones:o,inscripcionesPorClase:l}}function Zt({clases:e,sesiones:t,inscripcionesPorClase:n}){let r=t.filter(e=>e.estado===`registrada`).length,i=t.filter(e=>e.estado===`pendiente`).length,a=t.filter(e=>e.borrador===!0).length,o=0,s=0,c=0,l=0;t.forEach(e=>{(e.asistencia||[]).forEach(e=>{l++,e.estado===`P`?o++:e.estado===`A`?s++:e.estado===`J`&&c++})});let u=l>0?Math.round(o/l*100):0,d=e.map(e=>{let r=t.filter(t=>t.clase_id===e.id),i=r.filter(e=>e.estado===`registrada`).length,a=r.filter(e=>e.estado===`pendiente`).length,o=n[e.id]||[],s=o.length,c=r.filter(e=>e.estado===`registrada`).slice(-8).map(e=>{let t=(e.asistencia||[]).filter(e=>e.estado===`P`).length,n=(e.asistencia||[]).length;return n>0?Math.round(t/n*100):0}),l=0,u=0;r.forEach(e=>{(e.asistencia||[]).forEach(e=>{u++,e.estado===`P`&&l++})});let d=u>0?Math.round(l/u*100):0,f=r.filter(e=>e.contenido_dsl?.trim()).length,p=r.length>0?Math.min(100,Math.round(f/Math.max(i,1)*100)):0,m=[];for(let e of o){let t=r.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).map(t=>t.asistencia.find(t=>t.alumno_id===e.id)),n=t.filter(e=>e?.estado===`P`).length,i=t.length>0?Math.round(n/t.length*100):0;i>0&&i<70&&m.push({id:e.id,nombre:e.nombre_completo,pct:i})}return{...e,totalAlumnos:s,sesionesCompletadas:i,sesionesPendientes:a,sessionAttendance:c,avgAttendance:d,progress:p,riskStudents:m,alumnos:o}}),f=[];for(let e of d)for(let t of e.riskStudents)f.push({tipo:`baja_asistencia`,alumnoId:t.id,nombre:t.nombre,clase:e.nombre,valor:t.pct,mensaje:`${t.pct}%`});return{totalClases:e.length,sesionesCompletadas:r,sesionesPendientes:i+a,totalPresentes:o,totalAusentes:s,totalJustificados:c,totalRegistros:l,asistenciaPromedio:u,clasesData:d,alertasRiesgo:f,inscripcionesPorClase:n}}function Qt(e){let{totalClases:t,sesionesCompletadas:n,sesionesPendientes:r,totalPresentes:i,totalAusentes:a,totalJustificados:o,totalRegistros:s,asistenciaPromedio:c,clasesData:l,alertasRiesgo:u}=e,d=s>0?Math.round(i/s*100):0,f=s>0?Math.round(a/s*100):0,p=s>0?Math.round(o/s*100):0;return`
    <div class="pm-dashboard" role="main" aria-label="Panel de métricas">
      <div role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden">${k(`Dashboard: ${c}% asistencia general, ${t} clases, ${n} sesiones registradas, ${r} pendientes.`)}</div>
      <header class="pm-dashboard-header">
        <div>
          <h1 class="pm-dashboard-title">Dashboard</h1>
          <p class="pm-dashboard-subtitle">Resumen académico</p>
        </div>
        <select id="pm-filter-periodo" class="pm-dashboard-select" aria-label="Período de análisis">
          <option value="4" ${L.periodo===4?`selected`:``}>4 semanas</option>
          <option value="8" ${L.periodo===8?`selected`:``}>8 semanas</option>
          <option value="12" ${L.periodo===12?`selected`:``}>12 semanas</option>
        </select>
      </header>

      <section class="pm-dashboard-overview" aria-label="Indicadores generales">
        <div class="pm-overview-card primary">
          <div class="pm-overview-ring" aria-label="Asistencia general ${c}%">
            <svg viewBox="0 0 36 36" class="pm-circular-chart">
              <path class="pm-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="pm-circle" stroke-dasharray="${c}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" class="pm-percentage">${c}%</text>
            </svg>
          </div>
          <div class="pm-overview-info">
            <span class="pm-overview-label">Asistencia</span>
            <span class="pm-overview-detail">${i} de ${s} registros</span>
          </div>
        </div>
        <div class="pm-overview-stat"><span class="pm-overview-number">${t}</span><span class="pm-overview-text">Clases</span></div>
        <div class="pm-overview-stat"><span class="pm-overview-number">${n}</span><span class="pm-overview-text">Registradas</span></div>
        <div class="pm-overview-stat warning"><span class="pm-overview-number">${r}</span><span class="pm-overview-text">Pendientes</span></div>
      </section>

      <section class="pm-dashboard-section" aria-label="Desglose de asistencia">
        <h2 class="pm-section-title">Asistencia</h2>
        <div class="pm-attendance-bars">
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label"><span>Presentes</span><span>${i} (${d}%)</span></div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill success" style="width:${d}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label"><span>Ausentes</span><span>${a} (${f}%)</span></div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill danger" style="width:${f}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label"><span>Justificados</span><span>${o} (${p}%)</span></div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill warning" style="width:${p}%"></div></div>
          </div>
        </div>
      </section>

      ${u.length>0?`
      <section class="pm-dashboard-section" aria-label="Alumnos en riesgo">
        <h2 class="pm-section-title">Alumnos en Riesgo <span class="pm-section-badge">${u.length}</span></h2>
        <div class="pm-risk-list" role="list">
          ${u.slice(0,5).map(e=>`
            <div class="pm-risk-item" role="listitem" tabindex="0" data-alumno="${e.alumnoId}" aria-label="Ver perfil de ${k(e.nombre)}">
              <div class="pm-risk-avatar" aria-hidden="true">${(e.nombre||`A`)[0].toUpperCase()}</div>
              <div class="pm-risk-info">
                <span class="pm-risk-name">${k(e.nombre)}</span>
                <span class="pm-risk-class">${k(e.clase)}</span>
              </div>
              <span class="pm-risk-pct">${e.mensaje}</span>
            </div>
          `).join(``)}
        </div>
      </section>`:``}

      <section class="pm-dashboard-section" aria-label="Resumen por clase">
        <h2 class="pm-section-title">Clases</h2>
        <div class="pm-classes-list" id="pm-clases-grid">
          ${l.map(e=>`
          <div class="pm-class-card" data-clase-id="${e.id}" role="article" aria-label="Clase ${k(e.nombre)}">
            <div class="pm-class-header">
              <div>
                <span class="pm-class-name">${k(e.nombre)}</span>
                <span class="pm-class-inst">${k(e.instrumento||``)}</span>
              </div>
              <span class="pm-class-badge ${e.avgAttendance<70?`danger`:e.avgAttendance<85?`warning`:`success`}" aria-label="Asistencia media ${e.avgAttendance}%">
                ${e.avgAttendance}%
              </span>
            </div>
            <div class="pm-class-chart" aria-label="Evolución de asistencia">
              <svg viewBox="0 0 160 36" width="100%" height="28">
                ${Yt(e.sessionAttendance,100,160,36)}
              </svg>
            </div>
            <div class="pm-class-stats">
              <div class="pm-class-stat"><span>${e.sesionesCompletadas}</span><small>Reg.</small></div>
              <div class="pm-class-stat"><span>${e.sesionesPendientes}</span><small>Pen.</small></div>
              <div class="pm-class-stat"><span>${e.totalAlumnos}</span><small>Alum.</small></div>
              <div class="pm-class-stat"><span>${e.progress}%</span><small>Cont.</small></div>
            </div>
            ${e.riskStudents.length>0?`
            <div class="pm-class-risk"><i class="bi bi-exclamation-circle"></i> ${e.riskStudents.length} con &lt;70%</div>`:``}
            <button class="pm-class-btn" data-clase-id="${e.id}" aria-label="Ver alumnos de la clase" title="Ver alumnos">⋮</button>
          </div>`).join(``)}
        </div>
      </section>

      <section class="pm-dashboard-section" aria-label="Buscar alumno">
        <h2 class="pm-section-title">Buscar Alumno</h2>
        <div class="pm-search-wrapper">
          <i class="bi bi-search" aria-hidden="true"></i>
          <input id="pm-alumno-search" type="text" placeholder="Nombre del alumno..." aria-label="Buscar alumno por nombre">
        </div>
        <div id="pm-alumno-search-results" class="pm-search-results" role="listbox"></div>
      </section>
    </div>

    <style>
      .pm-dashboard { padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .pm-dashboard-header { background: linear-gradient(135deg, var(--pm-primary) 0%, #5856d6 100%); padding: 1.25rem 1rem; color: white; display: flex; justify-content: space-between; align-items: center; }
      .pm-dashboard-title { margin: 0; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
      .pm-dashboard-subtitle { margin: 0.125rem 0 0; font-size: 0.8125rem; opacity: 0.75; }
      .pm-dashboard-select { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.8125rem; cursor: pointer; }
      .pm-dashboard-select option { color: #000; }

      .pm-dashboard-overview { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0.5rem; padding: 0.75rem; background: var(--pm-surface); margin: -0.5rem 0.75rem 0.75rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
      .pm-overview-card { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem; border-radius: 10px; background: var(--pm-surface-2); }
      .pm-overview-card.primary { background: linear-gradient(135deg, rgba(52,199,89,0.1) 0%, rgba(52,199,89,0.05) 100%); border: 1px solid rgba(52,199,89,0.2); }
      .pm-overview-ring { width: 48px; height: 48px; flex-shrink: 0; }
      .pm-circular-chart { display: block; width: 100%; height: 100%; }
      .pm-circle-bg { fill: none; stroke: var(--pm-border); stroke-width: 3; }
      .pm-circle { fill: none; stroke: var(--pm-success); stroke-width: 3; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dasharray 0.5s ease; }
      .pm-percentage { fill: var(--pm-text); font-size: 0.5em; text-anchor: middle; font-weight: 600; }
      .pm-overview-info { display: flex; flex-direction: column; }
      .pm-overview-label { font-size: 0.75rem; font-weight: 600; color: var(--pm-text); }
      .pm-overview-detail { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-overview-stat { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.5rem; border-radius: 10px; background: var(--pm-surface-2); }
      .pm-overview-number { font-size: 1.25rem; font-weight: 700; color: var(--pm-text); line-height: 1; }
      .pm-overview-text { font-size: 0.625rem; color: var(--pm-text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-top: 0.125rem; }
      .pm-overview-stat.warning .pm-overview-number { color: var(--pm-warning); }

      .pm-dashboard-section { padding: 0.75rem 1rem; }
      .pm-section-title { font-size: 0.9375rem; font-weight: 600; color: var(--pm-text); margin: 0 0 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
      .pm-section-badge { background: var(--pm-danger); color: white; font-size: 0.6875rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 6px; margin-left: auto; }

      .pm-attendance-bars { display: flex; flex-direction: column; gap: 0.625rem; }
      .pm-attendance-bar-item { display: flex; flex-direction: column; gap: 0.25rem; }
      .pm-attendance-bar-label { display: flex; justify-content: space-between; font-size: 0.8125rem; }
      .pm-attendance-bar-label span:first-child { color: var(--pm-text); }
      .pm-attendance-bar-value { color: var(--pm-text-muted); font-size: 0.75rem; }
      .pm-attendance-bar-track { height: 6px; background: var(--pm-border); border-radius: 3px; overflow: hidden; }
      .pm-attendance-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
      .pm-attendance-bar-fill.success { background: var(--pm-success); }
      .pm-attendance-bar-fill.danger { background: var(--pm-danger); }
      .pm-attendance-bar-fill.warning { background: var(--pm-warning); }

      .pm-risk-list { display: flex; flex-direction: column; gap: 0.5rem; }
      .pm-risk-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; background: var(--pm-surface); border-radius: 10px; cursor: pointer; transition: transform 0.15s ease; }
      .pm-risk-item:active { transform: scale(0.99); }
      .pm-risk-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--pm-danger) 0%, #ff6b6b 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
      .pm-risk-info { flex: 1; min-width: 0; }
      .pm-risk-name { display: block; font-size: 0.875rem; font-weight: 600; color: var(--pm-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pm-risk-class { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-risk-pct { font-size: 0.8125rem; font-weight: 700; color: var(--pm-danger); background: var(--pm-danger-bg); padding: 0.25rem 0.5rem; border-radius: 6px; }

      .pm-classes-list { display: flex; flex-direction: column; gap: 0.625rem; }
      .pm-class-card { background: var(--pm-surface); border-radius: 12px; padding: 0.875rem; position: relative; }
      .pm-class-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
      .pm-class-name { display: block; font-size: 0.9375rem; font-weight: 600; color: var(--pm-text); }
      .pm-class-inst { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-class-badge { font-size: 0.875rem; font-weight: 700; padding: 0.25rem 0.625rem; border-radius: 8px; }
      .pm-class-badge.success { background: var(--pm-success-bg); color: var(--pm-success); }
      .pm-class-badge.warning { background: var(--pm-warning-bg); color: var(--pm-warning); }
      .pm-class-badge.danger { background: var(--pm-danger-bg); color: var(--pm-danger); }
      .pm-class-chart { margin: 0.375rem 0; height: 28px; }
      .pm-class-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.25rem; padding-top: 0.625rem; border-top: 1px solid var(--pm-border); }
      .pm-class-stat { text-align: center; padding: 0.25rem; }
      .pm-class-stat span { display: block; font-size: 0.9375rem; font-weight: 700; color: var(--pm-text); }
      .pm-class-stat small { font-size: 0.5625rem; color: var(--pm-text-muted); text-transform: uppercase; }
      .pm-class-risk { margin-top: 0.5rem; padding: 0.375rem 0.625rem; background: var(--pm-danger-bg); border-radius: 6px; font-size: 0.6875rem; color: var(--pm-danger); display: flex; align-items: center; gap: 0.375rem; }
      .pm-class-btn { position: absolute; top: 0.625rem; right: 0.625rem; background: none; border: none; padding: 0.25rem; color: var(--pm-text-muted); cursor: pointer; font-size: 1.25rem; }

      .pm-search-wrapper { position: relative; margin-bottom: 0.5rem; }
      .pm-search-wrapper i { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--pm-text-muted); font-size: 0.875rem; }
      .pm-search-wrapper input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.25rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.875rem; background: var(--pm-surface); color: var(--pm-text); outline: none; transition: border-color 0.2s; }
      .pm-search-wrapper input:focus { border-color: var(--pm-primary); }
      .pm-search-wrapper input::placeholder { color: var(--pm-text-muted); }
      .pm-search-results { display: none; background: var(--pm-surface); border-radius: 10px; overflow: hidden; }
      .pm-search-results.show { display: block; }
      
      /* Panel de estudiantes por clase */
      .pm-clase-students-panel { margin-top: 0.75rem; border-top: 1px solid var(--pm-border); padding-top: 0.75rem; }
      .pm-clase-students-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.8125rem; font-weight: 600; }
      .pm-clase-students-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--pm-text-muted); }
      .pm-clase-students-list { display: flex; flex-direction: column; gap: 0.375rem; max-height: 200px; overflow-y: auto; }
      .pm-clase-student-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--pm-surface-2); border-radius: 6px; cursor: pointer; }
      .pm-clase-student-row:hover { background: var(--pm-border); }
      .pm-student-info { flex: 1; min-width: 0; }
      .pm-student-nombre { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--pm-text); }
      .pm-student-meta { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-student-attendance { text-align: right; }
      .pm-student-attendance span { font-size: 0.8125rem; font-weight: 600; }
      .pm-student-attendance.danger span { color: var(--pm-danger); }
      .pm-student-attendance.warning span { color: var(--pm-warning); }
      .pm-student-attendance.success span { color: var(--pm-success); }
      .pm-student-att-bar { width: 50px; height: 4px; background: var(--pm-border); border-radius: 2px; margin-top: 2px; }
      .pm-student-att-fill { height: 100%; border-radius: 2px; }
      .pm-student-attendance.danger .pm-student-att-fill { background: var(--pm-danger); }
      .pm-student-attendance.warning .pm-student-att-fill { background: var(--pm-warning); }
      .pm-student-attendance.success .pm-student-att-fill { background: var(--pm-success); }

      /* Search results */
      .pm-search-result-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; cursor: pointer; border-bottom: 1px solid var(--pm-border); }
      .pm-search-result-item:last-child { border-bottom: none; }
      .pm-search-result-item:hover { background: var(--pm-surface-2); }
      .pm-search-result-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--pm-primary); color: white; display: flex; align-items: center; justify-content: center; }
      .pm-search-result-info { flex: 1; }
      .pm-search-result-name { display: block; font-size: 0.875rem; font-weight: 500; color: var(--pm-text); }
      .pm-search-result-meta { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-search-result-arrow { color: var(--pm-text-muted); }

      @media (max-width: 600px) {
        .pm-dashboard-overview { grid-template-columns: 1fr 1fr; }
        .pm-overview-card.primary { grid-column: span 2; }
      }
    </style>
  `}function $t(e){e.querySelector(`#pm-filter-periodo`)?.addEventListener(`change`,async t=>{let n=parseInt(t.target.value,10);L.periodo=n,e.innerHTML=`<div class="pm-loading" style="padding:2rem;"><div class="pm-spinner"></div></div>`;try{let t=await Xt(n,L.maestroId),r=Zt(t);L.clasesData=r.clasesData,L.todasSesiones=t.sesiones,L.inscripcionesPorClase=t.inscripcionesPorClase,L.alertasRiesgo=r.alertasRiesgo,e.innerHTML=Qt(r),$t(e),At(`Período actualizado a ${n} semanas. ${r.asistenciaPromedio}% de asistencia general.`)}catch(t){e.innerHTML=`<p class="pm-empty">Error al cargar datos: ${k(t.message)}</p>`}}),e.querySelectorAll(`.pm-risk-item`).forEach(e=>{let t=e.dataset.alumno,n=()=>{window.location.hash=`#/alumno?id=${t}`};e.addEventListener(`click`,n),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&n()})}),e.querySelectorAll(`.pm-class-btn`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.closest(`.pm-class-card`),r=n.querySelector(`.pm-clase-students-panel`);if(r){r.remove();return}let i=e.dataset.claseId,a=L.clasesData.find(e=>e.id===i)?.alumnos||[],o=L.todasSesiones.filter(e=>e.clase_id===i),s=a.map(e=>{let t=o.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).map(t=>t.asistencia.find(t=>t.alumno_id===e.id)),n=t.filter(e=>e?.estado===`P`).length,r=t.length,i=r>0?Math.round(n/r*100):0,a=o.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).sort((e,t)=>t.fecha.localeCompare(e.fecha))[0];return{...e,pct:i,total:r,lastFecha:a?.fecha}});s.sort((e,t)=>e.pct-t.pct);let c=document.createElement(`div`);c.className=`pm-clase-students-panel`,c.innerHTML=`
        <div class="pm-clase-students-header">
          <span>Alumnos (${s.length})</span>
          <button class="pm-clase-students-close" aria-label="Cerrar panel">×</button>
        </div>
        <div class="pm-clase-students-list" role="list">
          ${s.map(e=>`
            <div class="pm-clase-student-row" role="listitem" tabindex="0" data-alumno="${e.id}">
              <div class="pm-student-info">
                <span class="pm-student-nombre">${k(e.nombre_completo)}</span>
                <span class="pm-student-meta">${e.total} sesiones · Última: ${e.lastFecha?new Date(e.lastFecha).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}):`—`}</span>
              </div>
              <div class="pm-student-attendance ${e.pct<70?`danger`:e.pct<85?`warning`:`success`}">
                <span>${e.pct}%</span>
                <div class="pm-student-att-bar"><div class="pm-student-att-fill" style="width:${e.pct}%"></div></div>
              </div>
            </div>
          `).join(``)}
        </div>`,n.appendChild(c),c.querySelector(`.pm-clase-students-close`).addEventListener(`click`,()=>c.remove());let l=t=>{!c.contains(t.target)&&t.target!==e&&(c.remove(),document.removeEventListener(`click`,l))};setTimeout(()=>document.addEventListener(`click`,l),10),c.querySelectorAll(`.pm-clase-student-row`).forEach(e=>{let t=()=>window.location.hash=`#/alumno?id=${e.dataset.alumno}`;e.addEventListener(`click`,t),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&t()})})})});let t=e.querySelector(`#pm-alumno-search`),n=e.querySelector(`#pm-alumno-search-results`),r;t?.addEventListener(`input`,()=>{clearTimeout(r);let e=t.value.trim();if(!e){n.style.display=`none`;return}r=setTimeout(async()=>{try{let t=Object.values(L.inscripcionesPorClase).flat(),r=[...new Set(t.map(e=>e.id))];if(r.length===0){n.innerHTML=`<p class="pm-empty" style="padding:0.75rem;">No se encontraron alumnos.</p>`,n.style.display=`block`;return}let{data:i}=await x.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,r).ilike(`nombre_completo`,`%${e}%`).limit(10);if(!i?.length){n.innerHTML=`<p class="pm-empty" style="padding:0.75rem;">Sin resultados.</p>`,n.style.display=`block`;return}n.innerHTML=i.map(e=>`
          <div class="pm-search-result-item" role="option" data-id="${e.id}" tabindex="0">
            <div class="pm-search-result-avatar"><i class="bi bi-person-fill"></i></div>
            <div class="pm-search-result-info">
              <span class="pm-search-result-name">${k(e.nombre_completo)}</span>
              <span class="pm-search-result-meta">${k(e.instrumento_principal||`—`)}</span>
            </div>
            <i class="bi bi-chevron-right pm-search-result-arrow"></i>
          </div>`).join(``),n.style.display=`block`,n.querySelectorAll(`.pm-search-result-item`).forEach(e=>{let t=()=>window.location.hash=`#/alumno?id=${e.dataset.id}`;e.addEventListener(`click`,t),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&t()})})}catch{n.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger);padding:0.75rem;">Error al buscar.</p>`,n.style.display=`block`}},300)}),document.addEventListener(`click`,e=>{!t?.contains(e.target)&&!n?.contains(e.target)&&(n.style.display=`none`)})}async function en(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=C();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}L.maestroId=t.id;try{let n=await Xt(L.periodo,t.id),r=Zt(n);L.clasesData=r.clasesData,L.todasSesiones=n.sesiones,L.inscripcionesPorClase=n.inscripcionesPorClase,L.alertasRiesgo=r.alertasRiesgo,e.innerHTML=Qt(r),$t(e),At(`Métricas actualizadas. ${r.asistenciaPromedio}% de asistencia general.`)}catch(t){e.innerHTML=`
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;" role="alert">
        <p style="color:var(--pm-danger);">Error al cargar métricas</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${k(t.message)}</p>
      </div>`}}var R={alumnos:/#(todos\b|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|la|las|los|del|y|el)\b)?(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*|[A-Za-zÁÉÍÓÚáéíóúÑñ]+)/g,contenido:/\[([^\]]+)\]/g,sugerencias:/\(([^)]+)\)/g,tareas:/\{([^}]+)\}/g,medidas:/\$([^\s$]+)/g,objetivos:/>([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,niveles:/>NIVEL-(\d{1,2})/g,nodos:/>NODO:([A-Z_]+)/g,capas:/:::CAPA:\s*([A-Z_]+)/g,calificacion:/(\d)\/(\d)/g},tn={alumnos:`#0d6efd`,contenido:`#198754`,sugerencias:`#fd7e14`,tareas:`#9333ea`,medidas:`#6dd5ed`,calificacion:`#dc3545`,objetivos:`#6c757d`,niveles:`#5856d6`,nodos:`#af52de`,capas:`#ff9500`};function nn(e,t){if(!e)return[];let n=[],r,i=new RegExp(t.source,t.flags);for(;(r=i.exec(e))!==null;)if(r[1]){let e=r[1].trim();t.source.includes(`#`)&&(e=e.split(/(?=\s[#\[\(\{\$>])/)[0].trim()),n.push(e)}return n}function rn(e){if(!e)return null;let t=e.match(/(\d)\/(\d)/);if(!t)return null;let n=parseInt(t[1],10),r=parseInt(t[2],10);return n<0||n>5||r!==5?null:{valor:n,sobre:r}}function an(e){return{alumnos:nn(e,R.alumnos),contenido:nn(e,R.contenido),sugerencias:nn(e,R.sugerencias),tareas:nn(e,R.tareas),medidas:nn(e,R.medidas),calificacion:rn(e),objetivos:nn(e,R.objetivos),niveles:nn(e,R.niveles),nodos:nn(e,R.nodos),capas:nn(e,R.capas)}}function on(e){if(!e||typeof e!=`string`)return{alumnos:[],contenido:[],sugerencias:[],tareas:[],medidas:[],calificacion:null,objetivos:[],niveles:[],nodos:[],capas:[],por_capas:{}};let t=e.split(/:::CAPA:/),n={};return t.length>1&&t.forEach(e=>{if(!e.trim())return;let t=e.split(`
`),r=t[0].trim().toUpperCase(),i=t.slice(1).join(`
`);r&&(n[r]=an(i))}),{...an(e),por_capas:n}}function sn(e){if(!e)return``;let t=cn(e),n=[];function r(e){let t=`__DSL_TOKEN_${n.length}__`;return n.push({id:t,html:e}),t}t=t.replace(R.capas,(e,t)=>r(`<span class="dsl-token dsl-capa" style="background:${tn.capas}22; color:${tn.capas}; font-weight:800; padding:2px 6px; border-radius:4px">:::CAPA: ${t}</span>`)),t=t.replace(/&gt;NIVEL-(\d{1,2})/g,(e,t)=>r(`<span class="dsl-token dsl-nivel" style="color:${tn.niveles}; font-weight:700">&gt;NIVEL-${t}</span>`)),t=t.replace(/&gt;NODO:([A-Z_]+)/g,(e,t)=>r(`<span class="dsl-token dsl-nodo" style="color:${tn.nodos}; font-weight:600">&gt;NODO:${t}</span>`)),t=t.replace(/&gt;([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,(e,t)=>r(`<span class="dsl-token dsl-objetivo" data-objetivo="${t}">&gt;${t}</span>`)),t=t.replace(R.alumnos,(e,t)=>r(`<span class="dsl-token dsl-alumno" data-nombre="${t}">#${t}</span>`)),t=t.replace(R.contenido,(e,t)=>r(`<span class="dsl-token dsl-contenido" data-contenido="${t}">[${t}]</span>`)),t=t.replace(R.sugerencias,(e,t)=>r(`<span class="dsl-token dsl-sugerencia" data-sugerencia="${t}">(${t})</span>`)),t=t.replace(R.tareas,(e,t)=>r(`<span class="dsl-token dsl-tarea" data-tarea="${t}">{${t}}</span>`)),t=t.replace(R.medidas,(e,t)=>r(`<span class="dsl-token dsl-medida" data-medida="${t}">$${t}</span>`)),t=t.replace(R.calificacion,(e,t,n)=>r(`<span class="dsl-token dsl-calificacion" data-valor="${t}" data-sobre="${n}">${t}/${n}</span>`));for(let e=n.length-1;e>=0;e--)t=t.replace(n[e].id,n[e].html);return t}function cn(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var ln=[{trigger:`escalas`,label:`Escalas`,icon:`🎼`,expand:`[Escala Do Mayor] [Escala Re Mayor] [Escala Sol Mayor]`},{trigger:`arpegios`,label:`Arpegios`,icon:`🎹`,expand:`[Arpegio Do Mayor] [Arpegio La menor] [Arpegio Sol Mayor]`},{trigger:`tecnica`,label:`Técnica`,icon:`🎸`,expand:`$Tecnica_mano_derecha $Tecnica_mano_izquierda`},{trigger:`postura`,label:`Postura`,icon:`🧘`,expand:`$Postura_corporal $Posicion_manos`},{trigger:`evaluar`,label:`Evaluar`,icon:`📝`,expand:`4/5 (buen trabajo) {practicar 30 min diarios}`},{trigger:`mejorar`,label:`Mejorar`,icon:`💪`,expand:`(continuar mejorando la digitación) {repetir练习}`},{trigger:`ritmo`,label:`Ritmo`,icon:`🥁`,expand:`$Ritmo_binario $Ritmo_ternario`},{trigger:`dinamica`,label:`Dinámica`,icon:`🔊`,expand:`$Dinamica_piano $Dinamica_forte $Dinamica_mezzo`},{trigger:`afinacion`,label:`Afinación`,icon:`🎵`,expand:`$Afinacion_precisa $Afinacion_relativa`},{trigger:`lectura`,label:`Lectura`,icon:`📖`,expand:`[Lectura a primera vista] [Lectura de notas]`},{trigger:`respiracion`,label:`Respiración`,icon:`🌬️`,expand:`$Respiracion_diafragmatica $Respiracion_costeado`},{trigger:`memo`,label:`Memoria`,icon:`🧠`,expand:`[Técnica de memorización] {practicar de memoria}`}];function un(e){if(!e||e.length===0)return ln.slice(0,6);let t=e.toLowerCase();return ln.filter(e=>e.trigger.toLowerCase().includes(t)||e.label.toLowerCase().includes(t)).slice(0,6)}function dn(e){let t=ln.find(t=>t.trigger===e);return t?t.expand:null}function fn(e,{onAccept:t}){let n=document.getElementById(`pm-structure-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-structure-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
      <div class="pm-modal-content pm-structure-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">🚀 Estructurar con IA</h3>
          <button class="pm-modal-close" id="pm-structure-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-structure-body">
          <div class="pm-structure-panels">
            <div class="pm-structure-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Original</h4>
              <div id="pm-structure-original" class="pm-structure-text" style="background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text);"></div>
            </div>
            <div class="pm-structure-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Estructura DSL</h4>
              <div id="pm-structure-dsl" class="pm-structure-text" contenteditable="true" style="background: var(--pm-surface); border: 1.5px solid var(--pm-primary); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.9rem;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="pm-btn" id="pm-structure-reject" style="flex: 1; background: var(--pm-surface); border: 1px solid var(--pm-border);">Descartar</button>
            <button class="pm-btn pm-btn-primary" id="pm-structure-accept" style="flex: 1;">Insertar</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-structure-modal-styles`))){let e=document.createElement(`style`);e.id=`pm-structure-modal-styles`,e.textContent=`
        .pm-structure-content {
          max-width: 900px;
          width: 90vw;
        }

        .pm-structure-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pm-structure-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .pm-structure-panel {
          display: flex;
          flex-direction: column;
        }

        .pm-structure-text {
          font-size: 0.9rem;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }

        @media (max-width: 768px) {
          .pm-structure-panels {
            grid-template-columns: 1fr;
          }
        }
      `,document.head.appendChild(e)}let r=n.querySelector(`#pm-structure-original`),i=n.querySelector(`#pm-structure-dsl`);function a({original:e,dsl:t}){r.textContent=e,i.textContent=t,n.classList.add(`open`)}function o(){n.classList.remove(`open`)}return n.querySelector(`#pm-structure-close`).onclick=o,n.querySelector(`#pm-structure-reject`).onclick=o,n.querySelector(`#pm-structure-accept`).onclick=()=>{t&&t(i.textContent),o()},{open:a,close:o}}function pn(e,t={}){let n=document.getElementById(`pm-toolbar-help-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-toolbar-help-modal`,n.className=`pm-help-modal-overlay`,n.innerHTML=`
      <div class="pm-help-modal">
        <div class="pm-help-modal-header">
          <div class="pm-help-header-content">
            <div class="pm-help-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h2 class="pm-help-modal-title">Guía de la Toolbar DSL</h2>
              <p class="pm-help-modal-subtitle">Referencia rápida de tokens y atajos</p>
            </div>
          </div>
          <button class="pm-help-close-btn" id="pm-help-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="pm-help-modal-body">
          ${[{category:`Referencia`,items:[{icon:`👤`,label:`#`,title:`Alumno`,description:`Etiqueta a un alumno individual`,example:`#María, #Pedro`,color:`#3b82f6`},{icon:`📚`,label:`[ ]`,title:`Contenido`,description:`Marca el tema abordado en la clase`,example:`[Escala Do Mayor]`,color:`#10b981`},{icon:`💡`,label:`( )`,title:`Sugerencia`,description:`Anotación de mejora pedagógica`,example:`(Mejorar postura)`,color:`#f59e0b`},{icon:`📝`,label:`{ }`,title:`Tarea`,description:`Asignación para completar`,example:`{Practicar 30 min}`,color:`#8b5cf6`}]},{category:`Técnico`,items:[{icon:`🎯`,label:`$`,title:`Medida`,description:`Término técnico musical`,example:`$vibrato, $legato`,color:`#06b6d4`},{icon:`🎓`,label:`>`,title:`Objetivo`,description:`Meta curricular o achievement`,example:`>NIVEL-3`,color:`#6366f1`}]},{category:`Inteligencia Artificial`,items:[{icon:`✨`,label:`Mejorar`,title:`Mejorar Texto`,description:`Mejora gramática y claridad con IA`,example:`"María no entiende" → texto mejorado`,color:`#ec4899`},{icon:`🚀`,label:`Estructurar`,title:`Estructurar con DSL`,description:`Convierte texto libre a formato DSL`,example:`"María tocando escalas" → #María [Escalas]`,color:`#f97316`}]}].map(e=>`
            <div class="pm-help-section">
              <h3 class="pm-help-section-title">${e.category}</h3>
              <div class="pm-help-grid">
                ${e.items.map(e=>`
                  <div class="pm-help-card" style="--card-accent: ${e.color}">
                    <div class="pm-help-card-header">
                      <div class="pm-help-card-icon">${e.icon}</div>
                      <div class="pm-help-card-label">${e.label}</div>
                      <div class="pm-help-card-title">${e.title}</div>
                    </div>
                    <p class="pm-help-card-desc">${e.description}</p>
                    <div class="pm-help-card-example">
                      <span class="pm-help-example-label">Ejemplo:</span>
                      <code class="pm-help-example-code">${e.example}</code>
                    </div>
                  </div>
                `).join(``)}
              </div>
            </div>
          `).join(``)}
          
          <div class="pm-help-tips">
            <div class="pm-help-tip-icon">💡</div>
            <div class="pm-help-tip-content">
              <strong>Tip:</strong> Escribe el token directamente en el editor para activar el autocompletado. Presiona <kbd>Tab</kbd> para aceptar la primera sugerencia.
            </div>
          </div>
        </div>
        
        <div class="pm-help-modal-footer">
          <button class="pm-help-primary-btn" id="pm-help-close-btn">
            Entendido
          </button>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-help-modal-styles`))){let e=document.createElement(`style`);e.id=`pm-help-modal-styles`,e.textContent=`
        .pm-help-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .pm-help-modal-overlay.open {
          display: flex;
          opacity: 1;
        }
        
        .pm-help-modal {
          background: var(--pm-surface);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                      0 0 0 1px var(--pm-border);
          max-width: 720px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.95) translateY(10px);
          transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        
        .pm-help-modal-overlay.open .pm-help-modal {
          transform: scale(1) translateY(0);
        }
        
        .pm-help-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem;
          background: var(--pm-surface-2);
          border-bottom: 1px solid var(--pm-border);
        }
        
        .pm-help-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .pm-help-icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--pm-primary) 0%, #6366f1 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .pm-help-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--pm-text);
          margin: 0;
          line-height: 1.3;
        }
        
        .pm-help-modal-subtitle {
          font-size: 0.875rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
        
        .pm-help-close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: var(--pm-surface-2);
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pm-text-muted);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        
        .pm-help-close-btn:hover {
          background: var(--pm-border);
          color: var(--pm-text);
        }
        
        .pm-help-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        
        .pm-help-section {
          margin-bottom: 1.5rem;
        }
        
        .pm-help-section:last-of-type {
          margin-bottom: 0;
        }
        
        .pm-help-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--pm-text-muted);
          margin: 0 0 0.75rem;
          padding-left: 0.5rem;
        }
        
        .pm-help-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .pm-help-card {
          background: var(--pm-surface-2);
          border: 1px solid var(--pm-border);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .pm-help-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-accent, var(--pm-primary));
          opacity: 0.6;
        }
        
        .pm-help-card:hover {
          border-color: var(--card-accent, var(--pm-primary));
          box-shadow: var(--pm-shadow-sm);
          transform: translateY(-1px);
        }
        
        .pm-help-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        
        .pm-help-card-icon {
          font-size: 1.25rem;
          line-height: 1;
        }
        
        .pm-help-card-label {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          background: var(--pm-primary);
          color: white;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
        
        .pm-help-card-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--pm-text);
        }
        
        .pm-help-card-desc {
          font-size: 0.8rem;
          color: var(--pm-text-muted);
          margin: 0 0 0.75rem;
          line-height: 1.4;
        }
        
        .pm-help-card-example {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .pm-help-example-label {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
        }
        
        .pm-help-example-code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.75rem;
          background: var(--pm-surface);
          color: var(--card-accent, var(--pm-primary));
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--pm-border);
        }
        
        .pm-help-tips {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: var(--pm-warning-bg);
          border: 1px solid var(--pm-warning-text);
          border-radius: 10px;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .pm-help-tip-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .pm-help-tip-content {
          font-size: 0.85rem;
          color: var(--pm-warning-text);
          line-height: 1.5;
        }
        
        .pm-help-tip-content kbd {
          display: inline-block;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.75rem;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 4px;
          padding: 0.1rem 0.35rem;
          margin: 0 0.1rem;
        }
        
        .pm-help-modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--pm-border);
          display: flex;
          justify-content: flex-end;
        }
        
        .pm-help-primary-btn {
          background: linear-gradient(135deg, var(--pm-primary) 0%, var(--apple-primary-dark, #2563eb) 100%);
          color: white;
          border: none;
          padding: 0.625rem 1.5rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
        }
        
        .pm-help-primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
        }
        
        .pm-help-primary-btn:active {
          transform: translateY(0);
        }
        
        /* Scrollbar styling */
        .pm-help-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-thumb {
          background: var(--pm-border);
          border-radius: 3px;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-thumb:hover {
          background: var(--pm-text-muted);
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .pm-help-modal {
            max-height: 95vh;
          }
          
          .pm-help-modal-header {
            padding: 1rem;
          }
          
          .pm-help-icon-wrapper {
            width: 40px;
            height: 40px;
          }
          
          .pm-help-modal-title {
            font-size: 1.1rem;
          }
          
          .pm-help-modal-body {
            padding: 1rem;
          }
          
          .pm-help-grid {
            grid-template-columns: 1fr;
          }
        }
      `,document.head.appendChild(e)}let r=null;function i(){n.classList.add(`open`),n.querySelector(`.pm-help-primary-btn`)?.focus(),r&&r.dispose(),r=j(n.querySelector(`.pm-help-modal`),{onClose:()=>a()})}function a(){r&&=(r.dispose(),null),n.classList.remove(`open`)}return n.querySelector(`#pm-help-close`).onclick=a,n.querySelector(`#pm-help-close-btn`).onclick=a,n.onclick=e=>{e.target===n&&a()},document.addEventListener(`keydown`,function e(t){t.key===`Escape`&&n.classList.contains(`open`)&&(a(),document.removeEventListener(`keydown`,e))}),{open:i,close:a}}function mn(e,{onInsert:t,onLoading:n,onIaProposal:r,getEditorContent:i,aiService:a,onImproveClick:o,onStructureClick:s}){let c={presentes:[],indicadorActivo:null,indicadoresDisponibles:[]},l=[{token:`alumno`,label:`#`,title:`Etiquetar alumno`,text:`#`,offset:1,icon:`👤`,triggerAC:`#`},{token:`contenido`,label:`[ ]`,title:`Contenido de clase`,text:`[]`,offset:1,icon:`📚`,triggerAC:`[`},{token:`sugerencia`,label:`( )`,title:`Sugerencia pedagógica`,text:`()`,offset:1,icon:`💡`,triggerAC:`(`},{token:`tarea`,label:`{ }`,title:`Tarea / Asignación`,text:`{}`,offset:1,icon:`📝`,triggerAC:`{`},{token:`medida`,label:`$`,title:`Medida técnica`,text:`$`,offset:1,icon:`🎯`,triggerAC:`$`},{token:`objetivo`,label:`>`,title:`Objetivo curricular`,text:`>`,offset:1,icon:`🎓`,triggerAC:`>`}];if(e.innerHTML=`
    <div class="pm-dsl-toolbar">
      ${l.map(e=>`
        <button class="pm-dsl-tool-btn" data-token="${e.token}" title="${e.title}">
          <span class="pm-dsl-tool-symbol">${e.label}</span>
        </button>
      `).join(``)}
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn snippet-btn" id="btn-snippets" title="Snippets / Banco">
        <span class="snippet-icon">/</span>
      </button>
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn ai" id="btn-generar-informe" title="Generar informe para padres/tutores">📋</button>
      <button class="pm-dsl-tool-btn ai" id="btn-ia-magic" title="Estructurar con IA">🚀</button>
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn" id="btn-help" title="Ayuda">❓</button>

    </div>
    <div id="pm-snippet-popup" class="pm-snippet-popup" style="display:none;"></div>
  `,!document.getElementById(`pm-dsl-toolbar-styles`)){let e=document.createElement(`style`);e.id=`pm-dsl-toolbar-styles`,e.textContent=`
      .pm-dsl-toolbar {
        display: flex;
        gap: 0.25rem;
        padding: 0.5rem;
        background: var(--pm-surface);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-sm) var(--pm-radius-sm) 0 0;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        align-items: center;
      }
      .pm-dsl-toolbar::-webkit-scrollbar { display: none; }
      
      .pm-dsl-tool-btn {
        min-width: 32px;
        height: 32px;
        padding: 0 0.5rem;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        position: relative;
      }
      .pm-dsl-tool-btn:hover {
        background: var(--pm-surface-2);
        border-color: var(--pm-primary);
        color: var(--pm-primary);
        transform: translateY(-1px);
      }
      .pm-dsl-tool-btn:active { 
        background: var(--pm-border); 
        transform: translateY(1px); 
      }
      .pm-dsl-tool-btn.ai { 
        border-color: var(--pm-primary); 
        color: var(--pm-primary); 
        background: rgba(99, 102, 241, 0.05); 
      }

      
      .pm-dsl-tool-symbol {
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      
      .pm-dsl-divider {
        width: 1px;
        background: var(--pm-border);
        margin: 4px 2px;
        height: 20px;
      }


    `,document.head.appendChild(e)}let u=new Map(l.map(e=>[e.token,e]));e.querySelectorAll(`.pm-dsl-tool-btn[data-token]`).forEach(e=>{e.onclick=()=>{let n=u.get(e.dataset.token);n&&(e.style.transform=`scale(0.9)`,setTimeout(()=>{e.style.transform=``},100),t(n.text,n.offset,n.triggerAC))}});async function d(){let e=i?i():``;if(e.trim()&&o)try{o(e)}catch(e){alert(`Error al generar informe: `+e.message)}}async function f(){let e=i?i():``;if(e.trim()&&s)try{s(e)}catch(e){alert(`Error al estructurar con IA: `+e.message)}}e.querySelector(`#btn-generar-informe`).onclick=d,e.querySelector(`#btn-ia-magic`).onclick=f;let p=e.querySelector(`#pm-snippet-popup`);function m(n=``){let r=un(n);if(r.length===0){p.style.display=`none`;return}p.innerHTML=r.map(e=>`
      <div class="pm-snippet-item" data-trigger="${e.trigger}">
        <span class="pm-snippet-icon">${e.icon}</span>
        <span class="pm-snippet-label">/${e.trigger}</span>
        <span class="pm-snippet-preview">${e.label}</span>
      </div>
    `).join(``);let i=e.getBoundingClientRect(),a=i.top;p.style.position=`fixed`,p.style.left=`${i.left}px`,p.style.width=`${i.width}px`,a>220?(p.style.top=`auto`,p.style.bottom=`${window.innerHeight-i.top+8}px`,p.style.transformOrigin=`bottom left`):(p.style.bottom=`auto`,p.style.top=`${i.bottom+8}px`,p.style.transformOrigin=`top left`),p.style.display=`block`,p.querySelectorAll(`.pm-snippet-item`).forEach(e=>{e.onclick=()=>{t(dn(e.dataset.trigger)+` `),h()}})}function h(){p.style.display=`none`}if(!document.getElementById(`pm-snippet-styles`)){let e=document.createElement(`style`);e.id=`pm-snippet-styles`,e.textContent=`
      .snippet-btn { font-size: 1rem; font-weight: 800; }
      .snippet-icon { font-weight: 900; color: var(--pm-text-muted); }
      .pm-snippet-popup {
        position: fixed;
        left: 0;
        background: var(--pm-surface);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-md);
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 2000;
        max-height: 250px;
        overflow-y: auto;
        min-width: 240px;
        animation: pm-pop-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes pm-pop-up {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .pm-snippet-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        border-bottom: 1px solid var(--pm-border);
      }
      .pm-snippet-item:last-child { border-bottom: none; }
      .pm-snippet-item:hover { background: var(--pm-surface-2); }
      .pm-snippet-icon { font-size: 1rem; }
      .pm-snippet-label {
        font-family: monospace;
        font-weight: 600;
        color: var(--pm-primary);
      }
      .pm-snippet-preview {
        font-size: 0.8rem;
        color: var(--pm-text-muted);
      }
    `,document.head.appendChild(e)}e.querySelector(`#btn-snippets`).onclick=()=>{p.style.display===`block`?h():m()};let g=pn(e);return e.querySelector(`#btn-help`).onclick=()=>{g.open()},{setContext(e={}){e.presentes!==void 0&&(c.presentes=e.presentes),e.indicadorActivo!==void 0&&(c.indicadorActivo=e.indicadorActivo),e.indicadoresDisponibles!==void 0&&(c.indicadoresDisponibles=e.indicadoresDisponibles)}}}var z=null,B=[],hn=null,V=-1,gn=!1,_n=null,vn=!1,yn=0,bn=0;function xn(){if(!z){if(z=document.createElement(`div`),z.id=`pm-autocomplete-popup`,z.className=`pm-autocomplete-popup`,z.style.cssText=`
    position: fixed;
    display: none;
    background: var(--pm-surface, #fff);
    border: 1px solid var(--pm-border, #ddd);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    z-index: 9999;
    min-width: 280px;
    max-width: 360px;
    max-height: 280px;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: pm-ac-fadein 0.15s ease-out;
    user-select: none;
  `,!document.getElementById(`pm-ac-styles`)){let e=document.createElement(`style`);e.id=`pm-ac-styles`,e.textContent=`
      @keyframes pm-ac-fadein {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pm-ac-option {
        padding: 10px 14px;
        cursor: pointer;
        border-bottom: 1px solid var(--pm-border, #eee);
        transition: background 0.1s;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .pm-ac-option:last-child { border-bottom: none; }
      .pm-ac-option:hover, .pm-ac-option.selected {
        background: var(--pm-primary-light, #f0f4ff);
      }
      .pm-ac-option.selected {
        background: var(--pm-primary, #007aff);
        color: white;
      }
      .pm-ac-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--pm-surface-2, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      .pm-ac-option.selected .pm-ac-icon {
        background: rgba(255,255,255,0.2);
      }
      .pm-ac-text {
        flex: 1;
        min-width: 0;
      }
      .pm-ac-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--pm-text, #333);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pm-ac-option.selected .pm-ac-label {
        color: white;
      }
      .pm-ac-sublabel {
        font-size: 12px;
        color: var(--pm-text-muted, #888);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pm-ac-option.selected .pm-ac-sublabel {
        color: rgba(255,255,255,0.7);
      }
      .pm-ac-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--pm-primary-light, #e8f0ff);
        color: var(--pm-primary, #007aff);
        font-weight: 600;
      }
      .pm-ac-option.selected .pm-ac-badge {
        background: rgba(255,255,255,0.2);
        color: white;
      }
      .pm-ac-header {
        padding: 8px 14px;
        font-size: 11px;
        color: var(--pm-text-muted, #888);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--pm-border, #eee);
        background: var(--pm-surface-2, #fafafa);
      }
      .pm-ac-empty {
        padding: 20px;
        text-align: center;
        color: var(--pm-text-muted, #888);
        font-size: 13px;
      }
      .pm-ac-loading {
        padding: 20px;
        text-align: center;
        color: var(--pm-text-muted, #888);
        font-size: 13px;
      }
    `,document.head.appendChild(e)}document.body.appendChild(z)}}function Sn(e,t,n={}){if(xn(),B=e||[],hn=t,_n=n.trigger||null,V=-1,gn=!0,On(e),n.position){let e=n.position,t=window.innerWidth,r=window.innerHeight,i=e.x,a=e.y+20;i+320>t-20&&(i=Math.max(10,e.x-320-10)),a+280>r-20&&(a=Math.max(10,e.y-280-10)),z.style.left=`${i}px`,z.style.top=`${a}px`}z.onmousedown=Cn,document.addEventListener(`mousemove`,wn),document.addEventListener(`mouseup`,Tn),z.style.display=`block`}function Cn(e){e.target.closest(`.pm-ac-option`)||(vn=!0,yn=e.clientX-z.offsetLeft,bn=e.clientY-z.offsetTop,z.style.cursor=`grabbing`,z.style.transition=`none`)}function wn(e){if(!vn)return;let t=e.clientX-yn,n=e.clientY-bn;z.style.left=`${Math.max(0,t)}px`,z.style.top=`${Math.max(0,n)}px`}function Tn(){vn&&(vn=!1,z.style.cursor=``)}function En(){z&&(z.style.display=`none`,vn=!1,document.removeEventListener(`mousemove`,wn),document.removeEventListener(`mouseup`,Tn)),B=[],hn=null,V=-1,gn=!1,_n=null}function Dn(e){B=e||[],V=-1,On(e)}function On(e){if(!z)return;if(!e||e.length===0){z.innerHTML=`
      <div class="pm-ac-empty">
        <span>No hay opciones disponibles</span>
      </div>
    `;return}let t=`<div class="pm-ac-header">${Mn(_n)}</div>`;e.forEach((e,n)=>{let r=e.nombre||e.name||e.label||e.description||``,i=e.instrumento||e.descripcion||e.codigo||e.type||``,a=n===V,o=Nn(_n,e),s=e.is_historial?`<span class="pm-ac-badge">Reciente</span>`:``;t+=`
      <div class="pm-ac-option ${a?`selected`:``}" data-index="${n}">
        <div class="pm-ac-icon">${o}</div>
        <div class="pm-ac-text">
          <div class="pm-ac-label">${Fn(r)}</div>
          ${i?`<div class="pm-ac-sublabel">${Fn(i)}</div>`:``}
        </div>
        ${s}
      </div>
    `}),z.innerHTML=t,z.querySelectorAll(`.pm-ac-option`).forEach(e=>{e.addEventListener(`click`,()=>{kn(parseInt(e.dataset.index,10))})})}function kn(e){if(e>=0&&e<B.length){let t=B[e];hn&&hn(t),En()}}function An(e){if(!(!gn||B.length===0))switch(e.key){case`ArrowDown`:e.preventDefault(),V=Math.min(V+1,B.length-1),On(B),jn();break;case`ArrowUp`:e.preventDefault(),V=Math.max(V-1,0),On(B),jn();break;case`Enter`:e.preventDefault(),V>=0?kn(V):B.length>0&&kn(0);break;case`Escape`:e.preventDefault(),En();break;case`Tab`:B.length>0&&V===-1&&(e.preventDefault(),kn(0));break}}function jn(){if(!z||V<0)return;let e=z.querySelector(`.pm-ac-option[data-index="${V}"]`);e&&e.scrollIntoView({block:`nearest`,behavior:`smooth`})}function Mn(e){switch(e){case`#`:return`👤 Alumnos`;case`[`:return`📚 Contenidos`;case`(`:return`💡 Sugerencias`;case`{`:return`📝 Tareas`;case`$`:return`🎯 Medidas`;case`>`:return`🎓 Objetivos`;default:return`Opciones`}}function Nn(e,t){if(e===`#`){let e=t.nombre||t.name||``;return t.value===`todos`||e.toLowerCase()===`todos`?`👥`:e.charAt(0).toUpperCase()}return e===`$`?`🎯`:e===`>`&&t.level_number?t.level_number:e===`>`&&t.type?Pn(t.type):`•`}function Pn(e){return{ESCALA:`🎼`,ARPEGIO:`🎹`,MANO_IZQ:`✋`,ARCO:`🎻`,SONIDO:`🔊`,AFINACION:`🎵`,TECNICA:`⚙️`,REPERTORIO:`📖`}[e]||`•`}function Fn(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function In(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0).getBoundingClientRect();return{x:t.left,y:t.top}}function Ln(){return gn}function Rn(){return V}var zn={show:Sn,hide:En,updateOptions:Dn,handleKeyDown:An,getCursorPosition:In,isOpen:Ln,getSelectedIndex:Rn},Bn=`portal-maestros-catalogs`,Vn=1,Hn={alumnos:{ttl:1440*60*1e3},contenidos:{ttl:10080*60*1e3},medidas:{ttl:720*60*60*1e3},sugerencias:{ttl:720*60*60*1e3},tareas:{ttl:720*60*60*1e3},nodos:{ttl:10080*60*1e3},niveles:{ttl:10080*60*1e3},indicadores:{ttl:10080*60*1e3},historial:{ttl:null}},Un=null;async function H(){return Un||(Un=await w(Bn,Vn,{upgrade(e){for(let[t,n]of Object.entries(Hn))if(!e.objectStoreNames.contains(t)){let n=e.createObjectStore(t,{keyPath:`id`});n.createIndex(`by_updated`,`updated_at`),t===`alumnos`&&n.createIndex(`by_clase`,`clase_id`)}}}),Un)}async function Wn(e,t){let n=await H(),r=await n.get(e,t);if(!r)return null;let i=Hn[e];if(i?.ttl&&r.updated_at){let a=new Date(r.updated_at).getTime()+i.ttl;if(Date.now()>a)return await n.delete(e,t),null}return r}async function Gn(e){let t=await(await H()).getAll(e),n=Hn[e];if(!n?.ttl)return t;let r=Date.now();return t.filter(e=>e.updated_at?r<=new Date(e.updated_at).getTime()+n.ttl:!0)}async function Kn(e,t,n){return(await H()).getAllFromIndex(e,t,n)}async function qn(e,t){let n=await H(),r={...t,updated_at:new Date().toISOString()};return await n.put(e,r),r}async function Jn(e,t){let n=(await H()).transaction(e,`readwrite`);for(let e of t)await n.store.put({...e,updated_at:new Date().toISOString()});await n.done}async function Yn(e,t){await(await H()).delete(e,t)}async function Xn(e){await(await H()).clear(e)}async function Zn(e){let t=await H(),n=Hn[e];if(!n?.ttl)return;let r=await t.getAll(e),i=Date.now();for(let a of r)a.updated_at&&i>new Date(a.updated_at).getTime()+n.ttl&&await t.delete(e,a.id)}async function Qn(){let e=await H();for(let t of Object.keys(Hn))await e.clear(t)}async function $n(e){return(await Gn(e)).length}async function er(e,t){let n=await H(),r=new Date().toISOString(),i=await n.get(`historial`,e);i?(i.count=(i.count||0)+1,i.last_used=r,i.recent_selections=[t,...(i.recent_selections||[]).slice(0,9)],await n.put(`historial`,i)):await n.put(`historial`,{id:e,trigger:e,count:1,last_used:r,recent_selections:[t],updated_at:r})}async function tr(e){return(await H()).get(`historial`,e)}async function nr(e,t=5){return(await(await H()).getAll(`historial`)).filter(t=>t.trigger===e).sort((e,t)=>(t.count||0)-(e.count||0)).slice(0,t)}var U={get:Wn,getAll:Gn,getByIndex:Kn,set:qn,setBulk:Jn,remove:Yn,clear:Xn,cleanExpired:Zn,clearAll:Qn,getStoreSize:$n,addToHistorial:er,getHistorial:tr,getTopUsed:nr};async function rr(e){if(!e)return[];try{let{data:t,error:n}=await x.from(`alumnos_clases`).select(`alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).eq(`clase_id`,e).eq(`activo`,!0);if(n)throw n;if(t)return t.map(e=>e.alumnos).filter(Boolean).map(e=>({id:e.id,nombre:e.nombre_completo||``,instrumento:e.instrumento_principal}))}catch(e){console.warn(`[CatalogService] Error cargando alumnos:`,e)}return[]}async function ir(){let e=await U.getAll(`contenidos`);if(e.length>0)return e;try{let{data:e,error:t}=await x.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`contenidos`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await U.setBulk(`contenidos`,e),e}catch(e){console.warn(`[CatalogService] Error cargando contenidos:`,e)}return[]}async function ar(){let e=await U.getAll(`medidas`);if(e.length>0)return e;try{let{data:e,error:t}=await x.from(`catalogos`).select(`id, nombre, codigo, categoria`).eq(`tipo`,`medidas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await U.setBulk(`medidas`,e),e}catch(e){console.warn(`[CatalogService] Error cargando medidas:`,e)}return[]}async function or(){let e=await U.getAll(`sugerencias`);if(e.length>0)return e;try{let{data:e,error:t}=await x.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`sugerencias`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await U.setBulk(`sugerencias`,e),e}catch(e){console.warn(`[CatalogService] Error cargando sugerencias:`,e)}return[]}async function sr(){let e=await U.getAll(`tareas`);if(e.length>0)return e;try{let{data:e,error:t}=await x.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`tareas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await U.setBulk(`tareas`,e),e}catch(e){console.warn(`[CatalogService] Error cargando tareas:`,e)}return[]}async function cr(){let e=await U.getAll(`niveles`);if(e.length>0)return e;try{let{data:e}=await x.from(`routes`).select(`id`).eq(`instrument`,`violín`).eq(`status`,`published`).limit(1);if(!e||e.length===0)return[];let t=e[0].id,{data:n}=await x.from(`route_versions`).select(`id`).eq(`route_id`,t).eq(`status`,`published`).order(`version`,{ascending:!1}).limit(1);if(!n||n.length===0)return[];let r=n[0].id,{data:i,error:a}=await x.from(`levels`).select(`id, level_number, name, main_objective`).eq(`route_version_id`,r).order(`level_number`,{ascending:!0});if(a)throw a;if(i)return await U.setBulk(`niveles`,i),i}catch(e){console.warn(`[CatalogService] Error cargando niveles:`,e)}return[]}async function lr(e=null){let t=await U.getAll(`nodos`);if(e&&t.length>0){if(t=t.filter(t=>t.level_id===e),t.length>0)return t}else if(t.length>0)return t;try{let t=x.from(`nodes`).select(`id, name, type, is_critical, is_required, objective, level_id, order_index`);e&&(t=t.eq(`level_id`,e));let{data:n,error:r}=await t.order(`order_index`,{ascending:!0});if(r)throw r;if(n)return await U.setBulk(`nodos`,n),n}catch(e){console.warn(`[CatalogService] Error cargando nodos:`,e)}return[]}async function ur(e,t=``,n={}){let r=[];switch(e){case`#`:r=[{label:`todos`,value:`todos`,icon:`👥`,description:`Todos los presentes`}],r=r.concat(await rr(n.claseId));break;case`[`:r=await ir();break;case`(`:r=await or();break;case`{`:r=await sr();break;case`$`:r=await ar();break;case`>`:r=t.toUpperCase().startsWith(`NIVEL`)?await cr():await lr(n.nivelId);break;default:r=[]}if(t&&r.length>0&&(r=dr(r,t)),e&&e!==`#`){let t=(await U.getTopUsed(e,3)).flatMap(e=>e.recent_selections||[]).filter(Boolean).slice(0,3);for(let e of t)r.some(t=>(t.nombre||t.name||``).toLowerCase()===e.toLowerCase())||r.unshift({nombre:e,id:`hist-${e}`,is_historial:!0})}return r}function dr(e,t,n=`nombre`){if(!t)return e;let r=t.toLowerCase(),i=r.length;return e.map(e=>{let t=(e[n]||e.name||e.nombre||``).toLowerCase(),a=0;if(t.startsWith(r))a+=10;else if(t.includes(r))a+=5;else{let e=fr(t,r);if(e<=2&&i>3)a+=3-e;else return null}return t.length<20&&(a+=1),{...e,_score:a}}).filter(Boolean).sort((e,t)=>(t._score||0)-(e._score||0)).slice(0,15)}function fr(e,t){let n=[];for(let e=0;e<=t.length;e++)n[e]=[e];for(let t=0;t<=e.length;t++)n[0][t]=t;for(let r=1;r<=t.length;r++)for(let i=1;i<=e.length;i++)t.charAt(r-1)===e.charAt(i-1)?n[r][i]=n[r-1][i-1]:n[r][i]=Math.min(n[r-1][i-1]+1,n[r][i-1]+1,n[r-1][i]+1);return n[t.length][e.length]}async function pr(e,t){await U.addToHistorial(e,t)}function mr(e,{initialContent:t=``,onChange:n,onAlumnosNeeded:r}){let i=t,a=!1,o={};e.innerHTML=`
    <div class="pm-dsl-editor-container">
      <div 
        id="pm-dsl-editable" 
        class="pm-dsl-editable" 
        contenteditable="true" 
        spellcheck="false"
      ></div>
      <div class="pm-dsl-placeholder" id="pm-dsl-placeholder">Escribe el registro de la clase... Usa #alumno, [contenido], (sugerencia)...</div>
    </div>
  `;let s=e.querySelector(`#pm-dsl-editable`),c=e.querySelector(`#pm-dsl-placeholder`),l=document.createElement(`div`);l.className=`dsl-tooltip`,e.appendChild(l);function u(){i=s.innerText,c.style.display=i.trim()===``?`block`:`none`,n&&n(i)}s.addEventListener(`mouseover`,t=>{let n=t.target.closest(`.dsl-objetivo`);if(n){l.textContent=`Objetivo: ${n.dataset.objetivo}`,l.style.display=`block`;let t=n.getBoundingClientRect(),r=e.getBoundingClientRect();l.style.left=`${t.left-r.left}px`,l.style.top=`${t.top-r.top-25}px`}}),s.addEventListener(`mouseout`,()=>{l.style.display=`none`});function d(){if(!a){a=!0;try{let e=window.getSelection();if(!e||e.rangeCount===0){a=!1;return}let t=S(s,e.getRangeAt(0));i=s.innerText,s.innerHTML=sn(i),ee(s,t)}catch(e){console.warn(`[DSL] Error en highlight:`,e),i=s.innerText}a=!1}}function f(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0),n=document.createRange();n.selectNodeContents(s),n.setEnd(t.endContainer,t.endOffset);let r=n.toString().match(/([#\[\(\{\$>])\s*([^\[\(\{\$]*)$/);return r?{trigger:r[1],query:r[2]||``}:null}let p=null;s.addEventListener(`mousedown`,()=>{p=null});function m(){let e=window.getSelection();!e||e.rangeCount===0||(p=S(s,e.getRangeAt(0)))}function h(){s.focus(),p!==null&&ee(s,p)}let g=null;async function _(e=null){let t,n;if(e)t=e,n=``;else{let e=f();if(!e){zn.hide();return}t=e.trigger,n=e.query}try{let e=await ur(t,n,o);if(e.length>0){let r=In();r&&(m(),zn.show(e,e=>{v(e,t,n)},{trigger:t,position:r}))}else zn.hide()}catch(e){console.warn(`[DSL] Error en autocompletado:`,e)}}function v(e,t,n){let r=b(e.nombre||e.name||e.label||e.descripcion||``),i=``;switch(t){case`#`:i=r;break;case`[`:i=r+`]`;break;case`(`:i=r+`)`;break;case`{`:i=r+`}`;break;case`$`:i=e.codigo||r;break;case`>`:i=e.level_number?`NIVEL-${e.level_number}`:e.type?`NODO:${e.type}`:r;break}h();let a=window.getSelection();if(!a||a.rangeCount===0){console.warn(`[DSL] Sin selección activa al insertar autocomplete`);return}if(n.length>0){let e=a.getRangeAt(0),t=document.createRange();t.selectNodeContents(s),t.setEnd(e.endContainer,e.endOffset);let r=t.toString(),i=r.length-n.length;try{let e=document.createRange();y(s,e,i,r.length),e.deleteContents()}catch(e){console.warn(`[DSL] Error limpiando query parcial:`,e)}}x(i+` `),pr(t,r)}function y(e,t,n,r){let i=0,a=[e],o=!1;for(;a.length>0;){let e=a.pop();if(e.nodeType===3){let a=i+e.length;if(!o&&n<=a&&(t.setStart(e,n-i),o=!0),o&&r<=a){t.setEnd(e,r-i);return}i=a}else for(let t=e.childNodes.length-1;t>=0;t--)a.push(e.childNodes[t])}}function b(e){if(!e)return``;let t=document.createElement(`div`);return t.innerHTML=e,t.textContent||t.innerText||``}function x(e){let t=b(e),n=window.getSelection();if(!n||n.rangeCount===0)return;let r=n.getRangeAt(0);r.deleteContents();let i=document.createTextNode(t);r.insertNode(i),r.setStartAfter(i),r.collapse(!0),n.removeAllRanges(),n.addRange(r),u(),d()}function S(e,t){let n=t.cloneRange();return n.selectNodeContents(e),n.setEnd(t.endContainer,t.endOffset),n.toString().length}function ee(e,t){let n=document.createRange(),r=window.getSelection();if(!r)return;let i=0,a=[e],o,s=!1;for(;a.length>0&&!s;)if(o=a.pop(),o.nodeType===3){let e=i+o.length;t<=e&&(n.setStart(o,t-i),n.collapse(!0),s=!0),i=e}else{let e=o.childNodes.length;for(;e--;)a.push(o.childNodes[e])}r.removeAllRanges(),r.addRange(n)}let te=null;s.oninput=()=>{u(),clearTimeout(te),te=setTimeout(d,150),clearTimeout(g),g=setTimeout(()=>_(),300)},s.addEventListener(`keydown`,e=>{Ln()&&An(e)}),s.addEventListener(`paste`,e=>{let t=e.clipboardData?.items;if(t&&Array.from(t).some(e=>e.type&&e.type.startsWith(`image/`))){e.preventDefault();let t=document.createElement(`div`);t.className=`pm-toast-image-blocked`,t.textContent=`🚫 No puedes pegar imágenes. Usa 🎤 para grabar audio o describe el contenido.`,t.style.cssText=`position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#dc3545; color:white; padding:12px 20px; border-radius:8px; z-index:10000; font-size:14px;`,document.body.appendChild(t),setTimeout(()=>t.remove(),4e3)}});function C(e,t=0,n=null){s.focus();let r=window.getSelection();if(!r||r.rangeCount===0)return;let i=r.getRangeAt(0);i.deleteContents();let a=b(e),o=document.createTextNode(a);if(i.insertNode(o),t>0&&t<e.length){let e=document.createRange();e.setStart(o,t),e.collapse(!0),r.removeAllRanges(),r.addRange(e)}else i.setStartAfter(o),i.collapse(!0),r.removeAllRanges(),r.addRange(i);u(),d(),n&&setTimeout(()=>_(n),50)}return t&&(s.innerText=t,u(),d()),{insertText:C,getValue:()=>i,setValue:e=>{s.innerText=e,u(),d()},setContext:e=>{o=e}}}function hr(e,{indicator:t,sessionId:n,studentId:r,teacherId:i,onSave:a}){let o=t.status||`pending`;O.getStatusToken(o);let s=document.createElement(`div`);s.className=`pm-node-eval-card pm-animate-fade-in status-${o}`,s.dataset.indicatorId=t.indicator_id,s.innerHTML=`
    <div class="pm-eval-card-header">
      <div class="pm-eval-node-info">
        <span class="pm-eval-node-name">${k(t.node_name)}</span>
        <p class="pm-eval-indicator-desc">${k(t.indicator_description||`Evaluación de nodo`)}</p>
      </div>
      ${t.is_critical?`<span class="pm-badge-critical" title="Nodo Crítico"><i class="bi bi-exclamation-octagon"></i></span>`:``}
    </div>

    <div class="pm-eval-status-selector">
      <button class="pm-eval-btn btn-approved ${o===`approved`?`active`:``}" data-status="approved">
        <i class="bi bi-check-lg"></i> Logrado
      </button>
      <button class="pm-eval-btn btn-in-process ${o===`in_process`?`active`:``}" data-status="in_process">
        <i class="bi bi-arrow-repeat"></i> En Proceso
      </button>
      <button class="pm-eval-btn btn-failed ${o===`failed`?`active`:``}" data-status="failed">
        <i class="bi bi-x-lg"></i> No Logrado
      </button>
    </div>

    <div class="pm-eval-feedback-area">
      <textarea placeholder="Feedback pedagógico (opcional)..." class="pm-eval-feedback-input">${k(t.feedback||``)}</textarea>
    </div>

    <div class="pm-eval-card-footer">
      <span class="pm-eval-save-status"></span>
    </div>
  `;let c=s.querySelectorAll(`.pm-eval-btn`),l=s.querySelector(`.pm-eval-feedback-input`),u=s.querySelector(`.pm-eval-save-status`),d=null,f=async(e=null)=>{let c=e||s.dataset.status||o;u.innerHTML=`<i class="pm-spinner-sm"></i> Guardando...`;try{let e={student_id:r,indicator_id:t.indicator_id,session_id:n,created_by:i,status:c,feedback:l.value,attempt_number:(t.attempt_number||0)+1};await O.saveIndicatorAttempt(e),u.innerHTML=`<i class="bi bi-check-all"></i> Guardado localmente`,s.className=`pm-node-eval-card status-${c}`,a&&a(e)}catch(e){console.error(`Error saving evaluation:`,e),u.innerHTML=`<i class="bi bi-exclamation-circle"></i> Error al guardar`}};c.forEach(e=>{e.onclick=()=>{let t=e.dataset.status;c.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),s.dataset.status=t,f(t)}}),l.oninput=()=>{d&&clearTimeout(d),d=setTimeout(()=>f(),1500)},e.appendChild(s)}function gr(e,{student:t,sessionId:n,teacherId:r,snapshots:i=[]}){let a=document.getElementById(`pm-evaluation-drawer`);a&&a.remove();let o=document.createElement(`div`);o.id=`pm-evaluation-drawer`,o.className=`pm-drawer-overlay`,o.innerHTML=`
    <div class="pm-drawer">
      <div class="pm-drawer-header">
        <div class="pm-drawer-title-group">
          <h4 class="pm-drawer-title">Evaluar Avance</h4>
          <p class="pm-drawer-subtitle" style="font-size: 0.85rem; color: var(--pm-text-muted); margin: 0;">${k(t.nombre_completo)}</p>
        </div>
        <button class="pm-drawer-close" id="pm-close-eval-drawer">&times;</button>
      </div>
      
      <div class="pm-drawer-body pm-scroll-y">
        ${i.length===0?`
          <div class="pm-empty-state" style="text-align:center; padding: 2rem; color: var(--pm-text-muted);">
            <i class="bi bi-journal-check" style="font-size: 2.5rem; display: block; margin-bottom: 1rem;"></i>
            <p>No hay objetivos planificados para esta sesión.</p>
          </div>
        `:`
          <div id="pm-evaluation-cards-container" class="pm-eval-list"></div>
        `}
      </div>
      
      <div class="pm-drawer-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border);">
        <button class="pm-btn pm-btn-primary pm-btn-block" id="pm-finish-eval" style="width:100%">Listo</button>
      </div>
    </div>
  `,e.appendChild(o);let s=o.querySelector(`#pm-evaluation-cards-container`);s&&i.forEach(e=>{hr(s,{indicator:e,sessionId:n,studentId:t.id,teacherId:r,onSave:e=>{console.log(`Progress saved:`,e)}})}),setTimeout(()=>o.classList.add(`open`),10);let c=()=>{o.classList.remove(`open`),setTimeout(()=>o.remove(),400)},l=o.querySelector(`#pm-close-eval-drawer`),u=o.querySelector(`#pm-finish-eval`);return l&&l.addEventListener(`click`,c),o.addEventListener(`click`,e=>{e.target===o&&c()}),u&&u.addEventListener(`click`,c),{close:c}}function _r(e,{onAceptar:t}){let n=document.getElementById(`pm-generar-informe-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-generar-informe-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
      <div class="pm-modal-content pm-generar-informe-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">
            📋 Generar Informe
          </h3>
          <button class="pm-modal-close" id="pm-informe-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-generar-informe-body">
          <p style="font-size:0.85rem;color:var(--pm-text-muted);margin:0 0 1rem;">
            Este informe es para compartir con padres o tutores. No se registra como evaluación.
          </p>
          <div id="pm-informe-original-panel" style="display:none; margin-bottom:1rem;">
            <h4 style="margin:0 0 0.5rem;font-size:0.8rem;color:var(--pm-text-muted);">Tu registro original</h4>
            <div id="pm-informe-original" class="pm-informe-text" style="background:var(--pm-surface-2);border:1px solid var(--pm-border);border-radius:var(--pm-radius-sm);padding:0.75rem;font-size:0.85rem;color:var(--pm-text-muted);white-space:pre-wrap;max-height:120px;overflow-y:auto;"></div>
          </div>
          <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--pm-text);font-weight:600;">Informe generado</h4>
          <div id="pm-informe-texto" class="pm-informe-text" contenteditable="true"
            style="background:var(--pm-surface);border:1.5px solid var(--pm-primary);border-radius:var(--pm-radius-sm);padding:0.75rem;min-height:180px;max-height:300px;overflow-y:auto;color:var(--pm-text);font-size:0.9rem;line-height:1.6;white-space:pre-wrap;"></div>

          <div class="pm-informe-acciones">
            <button class="pm-btn pm-btn-share" id="btn-informe-copy" title="Copiar al portapapeles">
              <span>📋</span> Copiar
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-whatsapp" title="Compartir por WhatsApp">
              <span>💬</span> WhatsApp
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-email" title="Enviar por email">
              <span>✉️</span> Email
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-pdf" title="Exportar a PDF">
              <span>📄</span> PDF
            </button>
          </div>

          <div style="display:flex;gap:0.75rem;margin-top:1.25rem;">
            <button class="pm-btn" id="pm-informe-descartar" style="flex:1;background:var(--pm-surface);border:1px solid var(--pm-border);">Cerrar</button>
            <button class="pm-btn pm-btn-primary" id="pm-informe-aceptar" style="flex:1;">Usar en el editor</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-generar-informe-styles`))){let e=document.createElement(`style`);e.id=`pm-generar-informe-styles`,e.textContent=`
        .pm-generar-informe-content {
          max-width: 640px;
          width: 95vw;
        }
        .pm-generar-informe-body {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .pm-informe-text {
          font-size: 0.9rem;
          line-height: 1.6;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }
        .pm-informe-acciones {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }
        .pm-btn-share {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          color: var(--pm-text);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          flex: 1;
          justify-content: center;
        }
        .pm-btn-share:hover {
          background: var(--pm-primary);
          color: #fff;
          border-color: var(--pm-primary);
        }
        .pm-btn-share span { font-size: 0.95rem; }
      `,document.head.appendChild(e)}let r=n.querySelector(`#pm-informe-original`),i=n.querySelector(`#pm-informe-original-panel`),a=n.querySelector(`#pm-informe-texto`);function o(){return a.textContent.trim()}async function s(){try{await navigator.clipboard.writeText(o());let e=n.querySelector(`#btn-informe-copy`),t=e.textContent;e.textContent=`✓ Copiado`,setTimeout(()=>{e.textContent=t},2e3)}catch{alert(`No se pudo copiar al portapapeles.`)}}function c(){let e=encodeURIComponent(o());window.open(`https://wa.me/?text=${e}`,`_blank`)}function l(){let e=encodeURIComponent(o());window.open(`mailto:?subject=Informe de clase&body=${e}`,`_blank`)}function u(){let e=o(),t=window.open(``,`_blank`);t.document.write(`
      <html><head><title>Informe de Clase</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 700px; margin: auto; line-height: 1.6; color: #333; }
        h2 { color: #007aff; border-bottom: 2px solid #007aff; padding-bottom: 0.5rem; }
        p { white-space: pre-wrap; }
        @media print { body { padding: 1rem; } }
      </style></head>
      <body>
        <h2>📋 Informe de Clase</h2>
        <p>${e}</p>
        <script>window.print();<\/script>
      </body></html>
    `),t.document.close()}n.querySelector(`#btn-informe-copy`).onclick=s,n.querySelector(`#btn-informe-whatsapp`).onclick=c,n.querySelector(`#btn-informe-email`).onclick=l,n.querySelector(`#btn-informe-pdf`).onclick=u;function d({original:e,improved:t}){r.textContent=e,a.textContent=t,i&&(i.style.display=e?``:`none`),n.classList.add(`open`)}function f(){n.classList.remove(`open`)}return n.querySelector(`#pm-informe-close`).onclick=f,n.querySelector(`#pm-informe-descartar`).onclick=f,n.querySelector(`#pm-informe-aceptar`).onclick=()=>{t&&t(o()),f()},{open:d,close:f}}var vr=[{id:`tecnica`,nombre:`Técnica`,objetivos:`Desarrollar la técnica instrumental del alumno.
- Postura correcta
- Digitación
- Control del tempo
- Calidad del sonido`,contenido:`Ejercicios de técnica:
1. Escalas mayores y menores
2. Arpegios
3. Ejercicios de digitación
4. Estudios técnicos`,recursos:`Método del nivel, estudios técnicos, metrónomo`,evaluacion_metodo:`Observación directa, ejecución de escalas sin errores`},{id:`teoria`,nombre:`Teoría Musical`,objetivos:`Comprender los fundamentos teóricos de la música.
- Lectura rítmica
- Reconocimiento de intervalos
- Armonía básica
- Análisis de obras`,contenido:`Contenidos:
1. Teoría musical básica
2. Lectura a primera vista
3. Dictado melódico
4. Análisis armónico`,recursos:`Libro de teoría, cuaderno de ejercicios, pizarra`,evaluacion_metodo:`Prueba escrita, lectura a primera vista, dictados`},{id:`repertorio`,nombre:`Repertorio`,objetivos:`Desarrollar el repertorio musical del alumno.
- Interpretación de obras
- Expresión musical
- Memorización
- Presentación en público`,contenido:`Obras del programa:
1. Pieza de repertorio
2. Ejercicios de interpretación
3. Trabajo de dinámica y fraseo
4. Práctica con acompañamiento`,recursos:`Partituras, grabaciones de referencia, piano acompañante`,evaluacion_metodo:`Audición interna, evaluación de interpretación`},{id:`improvisacion`,nombre:`Improvisación`,objetivos:`Fomentar la creatividad musical y la improvisación.
- Exploración sonora
- Improvisación libre
- Improvisación estructurada
- Composición guiada`,contenido:`Actividades:
1. Ejercicios de exploración sonora
2. Improvisación libre
3. Improvisación sobre cambios armónicos
4. Composición guiada`,recursos:`Instrumento, pistas de acompañamiento, grabadora`,evaluacion_metodo:`Observación de creatividad, coherencia musical`},{id:`audicion`,nombre:`Audición`,objetivos:`Desarrollar la capacidad de escuchar y analizar música.
- Escucha activa
- Identificación de elementos
- Análisis formal
- Reseñas musicales`,contenido:`Actividades:
1. Audición de obras del repertorio
2. Identificación de instrumentos
3. Análisis de forma y estructura
4. Discusión y reseña`,recursos:`Audio, videos, partituras de referencia`,evaluacion_metodo:`Participación en discusión, trabajo escrito`},{id:`blanco`,nombre:`En blanco`,objetivos:``,contenido:``,recursos:``,evaluacion_metodo:``}];function yr(n,r=null,i=[],o=[],s={},c){let l=n===`edit`&&!!r,u=l?r:{...s};!l&&s.contenido&&!u.notas_dsl&&(u.notas_dsl=s.contenido),!l&&s.maestro_nombre&&!o.find(e=>e.nombre===s.maestro_nombre)&&(o=[{id:s.maestro_id,nombre:s.maestro_nombre},...o]);let d=new m(u),f=document.getElementById(`pm-planificacion-modal`);if(f&&f.remove(),f=document.createElement(`div`),f.id=`pm-planificacion-modal`,f.className=`pm-plan-modal-overlay`,f.innerHTML=xr(l,d,i,o),document.body.appendChild(f),!document.getElementById(`pm-plan-modal-styles`)){let e=document.createElement(`style`);e.id=`pm-plan-modal-styles`,e.textContent=Sr(),document.head.appendChild(e)}let p=()=>{f.classList.remove(`open`),setTimeout(()=>f.remove(),200)};f.querySelector(`.pm-plan-close-x`).onclick=p,f.querySelector(`.pm-plan-cancel-btn`).onclick=p,f.querySelector(`.pm-plan-backdrop`).onclick=p;let h=e=>{e.key===`Escape`&&(p(),document.removeEventListener(`keydown`,h))};document.addEventListener(`keydown`,h);let g=f.querySelector(`#pl-plantilla`);g&&g.addEventListener(`change`,e=>{let t=vr.find(t=>t.id===e.target.value);t&&t.id!==`blanco`&&(f.querySelector(`#pl-objetivos`).value=t.objetivos,f.querySelector(`#pl-contenido`).value=t.contenido,f.querySelector(`#pl-recursos`).value=t.recursos,f.querySelector(`#pl-evaluacion`).value=t.evaluacion_metodo,wr(f))});let _=f.querySelector(`#pl-clase_id`);_&&_.addEventListener(`change`,()=>{let e=f.querySelector(`#pl-instrumento`);if(e){let t=e.value;e.innerHTML=`<option value="">Todos los instrumentos</option>${Tr(i,_.value,null)}`,e.querySelector(`option[value="${t}"]`)&&(e.value=t)}}),Cr(f);let v=f.querySelector(`#dsl-editor-container`);if(v){let n=a({onSelect:async t=>{let n=(await e()).filter(e=>t.includes(e.id)).map(e=>`#${e.nombre_completo}`).join(`, `);r.component&&r.component.insertText(n+` `)}});document.body.appendChild(n);let r=t({initialContent:d.notas_dsl||``,onChange:(e,t)=>{let n=f.querySelector(`#dsl-summary`);n&&(n.textContent=Dr(t))},onAlumnoClick:()=>n.openModal()});v.appendChild(r),f._dslEditor=r}let y=f.querySelector(`.pm-plan-save-btn`);y.onclick=async()=>{let e=f.querySelector(`#pl-tema`)?.value.trim(),t=f.querySelector(`#pl-clase_id`)?.value;if(!e){f.querySelector(`#pl-tema`).focus();return}if(!t){f.querySelector(`#pl-clase_id`).focus();return}y.disabled=!0,y.innerHTML=`<span class="pm-plan-spinner"></span> Guardando...`;try{let n=f.querySelector(`#pl-recursos`)?.value||``,r=f._dslEditor,i={clase_id:t,maestro_id:f.querySelector(`#pl-maestro_id`)?.value||null,instrumento:f.querySelector(`#pl-instrumento`)?.value||null,tema:e,fecha_inicio:f.querySelector(`#pl-fecha_inicio`)?.value||null,objetivos:f.querySelector(`#pl-objetivos`)?.value.trim(),contenido:f.querySelector(`#pl-contenido`)?.value.trim(),recursos:n.split(`,`).map(e=>e.trim()).filter(Boolean),evaluacion_metodo:f.querySelector(`#pl-evaluacion`)?.value.trim(),observaciones:f.querySelector(`#pl-observaciones`)?.value.trim(),notas_dsl:r?r.getContent():``,estado:l&&f.querySelector(`#pl-estado`)?.value||`planificado`};c&&await c(i),p()}catch(e){console.error(`[planificacionModal] Error:`,e),y.disabled=!1,y.textContent=l?`Guardar cambios`:`Guardar`}};let b=f.querySelector(`.pm-plan-body`);if(b){let e=document.createElement(`div`);e.style.cssText=`display:flex;gap:1rem;align-items:flex-start`;let t=document.createDocumentFragment();for(;b.firstChild;)t.appendChild(b.firstChild);let n=document.createElement(`div`);n.style.cssText=`flex:1;min-width:0`,n.appendChild(t),e.appendChild(n),e.insertAdjacentHTML(`beforeend`,`
      <div style="position:sticky;top:0;width:220px;flex-shrink:0" id="pl-curriculo-wrapper">
        <div class="card border-0 bg-body-secondary">
          <div class="card-header bg-transparent py-2 border-bottom">
            <span class="small fw-semibold"><i class="bi bi-journal-bookmark me-1 text-primary"></i>Guía curricular</span>
          </div>
          <div class="card-body p-2 small" id="pl-curriculo-body" style="max-height:350px;overflow-y:auto">
            <div class="text-muted text-center small py-3">Seleccioná una clase para ver la guía</div>
          </div>
        </div>
      </div>`),b.appendChild(e);let r=f.querySelector(`#pl-clase_id`);if(r&&(r.addEventListener(`change`,()=>{let e=r.value;if(!e)return;let t=i.find(t=>t.id===e);t?.instrumento&&t?.plan_estudio&&br(t.instrumento,t.plan_estudio,f)}),d.clase_id)){let e=i.find(e=>e.id===d.clase_id);e?.instrumento&&e?.plan_estudio&&br(e.instrumento,e.plan_estudio,f)}}requestAnimationFrame(()=>{f.classList.add(`open`),f.querySelector(`#pl-tema`)?.focus()})}async function br(e,t,n){let i=n.querySelector(`#pl-curriculo-body`);if(i){i.innerHTML=`<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-muted"></div></div>`;try{let n=await r(e,t);if(!n){i.innerHTML=`<p class="text-muted small text-center py-2">Sin guía curricular<br>para ${e} — ${t}</p>`;return}i.innerHTML=n.curriculo_pilares.map(e=>`
      <div class="mb-2">
        <div class="fw-semibold text-uppercase text-muted mb-1" style="font-size:.7rem;letter-spacing:.05em">${e.nombre}</div>
        ${e.curriculo_objetivos.map(e=>`
          <div class="d-flex align-items-start gap-1 mb-1">
            <i class="bi bi-circle text-muted" style="font-size:.65rem;margin-top:3px;flex-shrink:0"></i>
            <span style="font-size:.78rem">${e.descripcion}</span>
          </div>`).join(``)}
      </div>`).join(``)}catch(e){i.innerHTML=`<p class="text-danger small">${e.message}</p>`}}}function xr(e,t,n,r){let i=n.length?n.map(e=>`<option value="${e.id}" ${t.clase_id===e.id?`selected`:``}>${Er(e.nombre||e.id)}</option>`).join(``):`<option value="">Sin clases disponibles</option>`,a=r.length?`<option value="">Sin asignar</option>`+r.map(e=>`<option value="${e.id}" ${t.maestro_id===e.id?`selected`:``}>${Er(e.nombre||e.id)}</option>`).join(``):`<option value="">Sin maestros disponibles</option>`,o=Array.isArray(t.recursos)?t.recursos.join(`, `):``,s=vr.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``);return`
    <div class="pm-plan-backdrop"></div>
    <div class="pm-plan-modal">
      <!-- Header -->
      <div class="pm-plan-header">
        <div class="pm-plan-header-left">
          <div class="pm-plan-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h2 class="pm-plan-title">${e?`Editar Planificación`:`Nueva Planificación`}</h2>
            <p class="pm-plan-subtitle">Completa los datos para crear tu planificación</p>
          </div>
        </div>
        <button class="pm-plan-close-x" aria-label="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="pm-plan-body">
        ${e?``:`
        <div class="pm-plan-section">
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-plantilla">Plantilla</label>
            <select class="pm-plan-select" id="pl-plantilla">
              ${s}
            </select>
            <span class="pm-plan-hint">Selecciona una plantilla para préllenar el formulario</span>
          </div>
        </div>
        `}

        <!-- Datos básicos -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Datos Básicos</h3>
          <div class="pm-plan-grid-2">
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-clase_id">Clase *</label>
              <select class="pm-plan-select" id="pl-clase_id" required>
                <option value="">Seleccionar clase</option>
                ${i}
              </select>
            </div>
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-maestro_id">Maestro</label>
              <select class="pm-plan-select" id="pl-maestro_id">
                ${a}
              </select>
            </div>
          </div>
          <div class="pm-plan-grid-2">
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-instrumento">Instrumento / Grupo</label>
              <select class="pm-plan-select" id="pl-instrumento">
                <option value="">Todos los instrumentos</option>
                ${Tr(n,t.clase_id,t.instrumento)}
              </select>
              <span class="pm-plan-hint">Dejar vacío si aplica a todos</span>
            </div>
            <div class="pm-plan-field">
              <label class="pm-plan-label" for="pl-fecha_inicio">Fecha de Inicio</label>
              <input type="date" class="pm-plan-input" id="pl-fecha_inicio" value="${t.fecha_inicio||``}">
            </div>
          </div>
          ${e?`
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-estado">Estado</label>
            <select class="pm-plan-select" id="pl-estado">
              <option value="planificado" ${t.estado===`planificado`?`selected`:``}>Planificado</option>
              <option value="ejecutado" ${t.estado===`ejecutado`?`selected`:``}>Ejecutado</option>
              <option value="revisado" ${t.estado===`revisado`?`selected`:``}>Revisado</option>
            </select>
          </div>
          `:``}
        </div>

        <!-- Tema y objetivos -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Contenido</h3>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-tema">Tema *</label>
            <input type="text" class="pm-plan-input" id="pl-tema" maxlength="200"
              placeholder="Ej: Introducción a la escala mayor" autocomplete="off"
              value="${Er(t.tema||``)}">
            <span class="pm-plan-char-count"><span id="pl-tema-count">${(t.tema||``).length}</span>/200</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-objetivos">Objetivos</label>
            <textarea class="pm-plan-textarea" id="pl-objetivos" rows="2" maxlength="1000"
              placeholder="¿Qué quieres lograr en esta clase?">${Er(t.objetivos||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obj-count">${(t.objetivos||``).length}</span>/1000</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-contenido">Contenido</label>
            <textarea class="pm-plan-textarea" id="pl-contenido" rows="3" maxlength="2000"
              placeholder="Desarrollo del tema, actividades...">${Er(t.contenido||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-cont-count">${(t.contenido||``).length}</span>/2000</span>
          </div>
        </div>

        <!-- Recursos y evaluación -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Recursos y Evaluación</h3>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-recursos">Recursos</label>
            <input type="text" class="pm-plan-input" id="pl-recursos"
              placeholder="Partitura, audio, pizarra (separados por coma)" autocomplete="off"
              value="${Er(o)}">
            <span class="pm-plan-hint">Separa múltiples recursos con coma</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-evaluacion">Método de Evaluación</label>
            <textarea class="pm-plan-textarea" id="pl-evaluacion" rows="2" maxlength="500"
              placeholder="¿Cómo evaluarás el aprendizaje?">${Er(t.evaluacion_metodo||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-eval-count">${(t.evaluacion_metodo||``).length}</span>/500</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-observaciones">Observaciones</label>
            <textarea class="pm-plan-textarea" id="pl-observaciones" rows="2" maxlength="1000"
              placeholder="Notas adicionales...">${Er(t.observaciones||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obs-count">${(t.observaciones||``).length}</span>/1000</span>
          </div>
        </div>

        <!-- DSL Notes -->
        <div class="pm-plan-section">
          <h3 class="pm-plan-section-title">Notas DSL</h3>
          <p class="pm-plan-section-desc">Usa notación simplificada: <code>#Alumno</code> <code>[Contenido]</code> <code>(Sugerencia)</code> <code>{Tarea}</code> <code>$Medida</code> <code>&gt;Objetivo</code></p>
          <div id="dsl-editor-container"></div>
          <span class="pm-plan-dsl-summary"><span id="dsl-summary">Sin tokens</span></span>
        </div>
      </div>

      <!-- Footer -->
      <div class="pm-plan-footer">
        <button class="pm-plan-cancel-btn">Cancelar</button>
        <button class="pm-plan-save-btn">${e?`Guardar cambios`:`Guardar`}</button>
      </div>
    </div>
  `}function Sr(){return`
    .pm-plan-modal-overlay {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    
    .pm-plan-modal-overlay.open {
      display: flex;
      opacity: 1;
    }
    
    .pm-plan-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    .pm-plan-modal {
      position: relative;
      background: var(--pm-surface);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                  0 0 0 1px var(--pm-border);
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
    }
    
    .pm-plan-modal-overlay.open .pm-plan-modal {
      transform: scale(1) translateY(0);
    }
    
    .pm-plan-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: var(--pm-surface-2);
      border-bottom: 1px solid var(--pm-border);
      flex-shrink: 0;
    }
    
    .pm-plan-header-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    
    .pm-plan-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--pm-primary) 0%, #6366f1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .pm-plan-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--pm-text);
      margin: 0;
    }
    
    .pm-plan-subtitle {
      font-size: 0.8rem;
      color: var(--pm-text-muted);
      margin: 0.2rem 0 0;
    }
    
    .pm-plan-close-x {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--pm-surface-2);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--pm-text-muted);
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    
    .pm-plan-close-x:hover {
      background: var(--pm-border);
      color: var(--pm-text);
    }
    
    .pm-plan-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
    }
    
    .pm-plan-body::-webkit-scrollbar {
      width: 6px;
    }
    
    .pm-plan-body::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .pm-plan-body::-webkit-scrollbar-thumb {
      background: var(--pm-border);
      border-radius: 3px;
    }
    
    .pm-plan-section {
      margin-bottom: 1.5rem;
    }
    
    .pm-plan-section:last-child {
      margin-bottom: 0;
    }
    
    .pm-plan-section-title {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--pm-text-muted);
      margin: 0 0 0.75rem;
    }
    
    .pm-plan-section-desc {
      font-size: 0.75rem;
      color: var(--pm-text-muted);
      margin: 0 0 0.75rem;
      line-height: 1.4;
    }
    
    .pm-plan-section-desc code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.7rem;
      background: var(--pm-surface-2);
      border: 1px solid var(--pm-border);
      border-radius: 4px;
      padding: 0.1rem 0.3rem;
    }
    
    .pm-plan-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    
    .pm-plan-field {
      margin-bottom: 0.75rem;
      position: relative;
    }
    
    .pm-plan-field:last-child {
      margin-bottom: 0;
    }
    
    .pm-plan-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--pm-text);
      margin-bottom: 0.35rem;
    }
    
    .pm-plan-label small {
      font-weight: 400;
      color: var(--pm-text-muted);
    }
    
    .pm-plan-input,
    .pm-plan-select,
    .pm-plan-textarea {
      width: 100%;
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--pm-text);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    
    .pm-plan-input:focus,
    .pm-plan-select:focus,
    .pm-plan-textarea:focus {
      outline: none;
      border-color: var(--pm-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    
    .pm-plan-textarea {
      resize: vertical;
      min-height: 60px;
      line-height: 1.5;
    }
    
    .pm-plan-hint {
      display: block;
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      margin-top: 0.25rem;
    }
    
    .pm-plan-char-count {
      display: block;
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      text-align: right;
      margin-top: 0.2rem;
    }
    
    .pm-plan-dsl-summary {
      display: block;
      font-size: 0.75rem;
      color: var(--pm-text-muted);
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: var(--pm-surface-2);
      border-radius: 6px;
      text-align: center;
    }
    
    .pm-plan-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--pm-border);
      background: var(--pm-surface-2);
      flex-shrink: 0;
    }
    
    .pm-plan-cancel-btn {
      background: var(--pm-surface);
      border: 1px solid var(--pm-border);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--pm-text);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    
    .pm-plan-cancel-btn:hover {
      background: var(--pm-border);
    }
    
    .pm-plan-save-btn {
      background: linear-gradient(135deg, var(--pm-primary) 0%, #2563eb 100%);
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .pm-plan-save-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .pm-plan-save-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .pm-plan-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: pm-plan-spin 0.6s linear infinite;
    }
    
    @keyframes pm-plan-spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 640px) {
      .pm-plan-modal {
        max-height: 95vh;
      }
      
      .pm-plan-header {
        padding: 1rem;
      }
      
      .pm-plan-body {
        padding: 1rem;
      }
      
      .pm-plan-grid-2 {
        grid-template-columns: 1fr;
      }
      
      .pm-plan-footer {
        padding: 0.875rem 1rem;
      }
    }
  `}function Cr(e){[{input:`pl-tema`,count:`pl-tema-count`},{input:`pl-objetivos`,count:`pl-obj-count`},{input:`pl-contenido`,count:`pl-cont-count`},{input:`pl-evaluacion`,count:`pl-eval-count`},{input:`pl-observaciones`,count:`pl-obs-count`}].forEach(({input:t,count:n})=>{let r=e.querySelector(`#`+t),i=e.querySelector(`#`+n);r&&i&&r.addEventListener(`input`,()=>{i.textContent=r.value.length})})}function wr(e){[{input:`pl-objetivos`,count:`pl-obj-count`},{input:`pl-contenido`,count:`pl-cont-count`},{input:`pl-evaluacion`,count:`pl-eval-count`},{input:`pl-observaciones`,count:`pl-obs-count`}].forEach(({input:t,count:n})=>{let r=e.querySelector(`#`+t),i=e.querySelector(`#`+n);r&&i&&(i.textContent=r.value.length)})}function Tr(e,t,n){let r=e.find(e=>e.id===t);return r?.instrumento?r.instrumento.split(`,`).map(e=>e.trim()).filter(Boolean).map(e=>`<option value="${Er(e)}" ${n===e?`selected`:``}>${Er(e)}</option>`).join(``):``}function Er(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function Dr(e){let t=[];return e.alumnos.length&&t.push(`${e.alumnos.length} alum.`),e.contenido.length&&t.push(`${e.contenido.length} cont.`),e.tareas.length&&t.push(`${e.tareas.length} tar.`),e.calificacion&&t.push(`${e.calificacion.valor}/${e.calificacion.sobre}`),t.length?t.join(`, `):`Sin tokens`}var W={async getClasses(){let{data:e,error:t}=await x.from(`plan_clases`).select(`*`).eq(`activo`,!0).order(`nombre`);return t?(console.error(`Error loading classes:`,t),[]):e},async resolveSmartPlan(e){let t=await this.getClasses();if(!t.length)return null;let n=(e.nombre||``).toLowerCase(),r=(e.instrumento||``).toLowerCase(),i=t.find(e=>(e.nombre||``).toLowerCase()===n);return i||r&&(i=t.find(e=>(e.nombre||``).toLowerCase().includes(r)),i)?i:(i=t.find(e=>{let t=(e.nombre||``).toLowerCase();return n.includes(t)||t.includes(n)}),i||t[0])},async addClass(e){let{data:t,error:n}=await x.from(`plan_clases`).insert([{nombre:e}]).select().single();if(n)throw n;return t},async updateClass(e,t){let{error:n}=await x.from(`plan_clases`).update({nombre:t}).eq(`id`,e);if(n)throw n},async deleteClass(e){let{error:t}=await x.from(`plan_clases`).delete().eq(`id`,e);if(t)throw t},async getLevelsByClass(e){let{data:t,error:n}=await x.from(`plan_niveles`).select(`*`).eq(`clase_id`,e).order(`numero_nivel`,{ascending:!0});return n?(console.error(`Error loading levels:`,n),[]):t},async addLevel({clase_id:e,nombre:t,numero_nivel:n}){let{data:r,error:i}=await x.from(`plan_niveles`).insert([{clase_id:e,nombre:t,numero_nivel:n||1}]).select().single();if(i)throw i;return r},async updateLevel(e,t){let{error:n}=await x.from(`plan_niveles`).update(t).eq(`id`,e);if(n)throw n},async deleteLevel(e){let{error:t}=await x.from(`plan_niveles`).delete().eq(`id`,e);if(t)throw t},async getNodesByLevel(e){let{data:t,error:n}=await x.from(`plan_temas`).select(`*`).eq(`nivel_id`,e).order(`orden_index`);return n?(console.error(`Error loading topics:`,n),[]):t},async addNode({nivel_id:e,nombre:t,tipo:n}){let{data:r,error:i}=await x.from(`plan_temas`).insert([{nivel_id:e,nombre:t,tipo:n||`TECNICA`}]).select().single();if(i)throw i;return r},async updateNode(e,t){let{error:n}=await x.from(`plan_temas`).update(t).eq(`id`,e);if(n)throw n},async deleteNode(e){let{error:t}=await x.from(`plan_temas`).delete().eq(`id`,e);if(t)throw t},async getObjectivesByNode(e){let{data:t,error:n}=await x.from(`plan_objetivos`).select(`*`).eq(`tema_id`,e).order(`orden_index`);return n?(console.error(`Error loading objectives:`,n),[]):t},async addObjective({tema_id:e,nombre:t}){let{data:n,error:r}=await x.from(`plan_objetivos`).insert([{tema_id:e,nombre:t}]).select().single();if(r)throw r;return n},async updateObjective(e,t){let{error:n}=await x.from(`plan_objetivos`).update({nombre:t}).eq(`id`,e);if(n)throw n},async deleteObjective(e){let{error:t}=await x.from(`plan_objetivos`).delete().eq(`id`,e);if(t)throw t},async getIndicatorsByObjective(e){let{data:t,error:n}=await x.from(`plan_indicadores`).select(`*`).eq(`objetivo_id`,e).order(`orden_index`);return n?(console.error(`Error loading indicators:`,n),[]):t},async addIndicator({objetivo_id:e,descripcion:t,es_requerido:n}){let{data:r,error:i}=await x.from(`plan_indicadores`).insert([{objetivo_id:e,descripcion:t,es_requerido:n??!0}]).select().single();if(i)throw i;return r},async updateIndicator(e,t){let{error:n}=await x.from(`plan_indicadores`).update(t).eq(`id`,e);if(n)throw n},async deleteIndicator(e){let{error:t}=await x.from(`plan_indicadores`).delete().eq(`id`,e);if(t)throw t},async getRouteHierarchy(e){let t=e;if(!t){let e=await this.getClasses();if(e.length>0)t=e[0].id;else return null}let{data:n,error:r}=await x.from(`plan_niveles`).select(`
        *,
        plan_temas (
          *,
          plan_objetivos (
            *,
            plan_indicadores (*)
          )
        )
      `).eq(`clase_id`,t).order(`numero_nivel`);return r?(console.error(`Error loading hierarchy:`,r),null):n},async importStructure(e,t){if(!e||!t)throw Error(`Faltan datos para la importación.`);console.log(`[Adapter] Iniciando importación masiva optimizada (4 niveles) para clase: ${e}`);for(let n of t.niveles||[]){let{data:t,error:r}=await x.from(`plan_niveles`).insert([{clase_id:e,nombre:n.nombre,numero_nivel:n.numero_nivel||1,objetivo_general:n.objetivo_general}]).select().single();if(r)throw r;let i=(n.temas||[]).map(e=>({nivel_id:t.id,nombre:e.nombre,tipo:e.tipo||`TECNICA`,es_critico:e.es_critico||!1,_originalRef:e}));if(!i.length)continue;let{data:a,error:o}=await x.from(`plan_temas`).insert(i.map(({_originalRef:e,...t})=>t)).select();if(o)throw o;for(let e=0;e<a.length;e++){let t=a[e],n=i[e]._originalRef.objetivos||[];if(!n.length)continue;let r=n.map(e=>({tema_id:t.id,nombre:e.nombre||e,_originalRef:e})),{data:o,error:s}=await x.from(`plan_objetivos`).insert(r.map(({_originalRef:e,...t})=>t)).select();if(s)throw s;let c=[];if(o.forEach((e,t)=>{let n=r[t]._originalRef;n.indicadores&&n.indicadores.length>0&&n.indicadores.forEach(t=>{c.push({objetivo_id:e.id,descripcion:t.descripcion,es_requerido:t.es_requerido??!0})})}),c.length>0){let{error:e}=await x.from(`plan_indicadores`).insert(c);if(e)throw e}}}return console.log(`[Adapter] Importación masiva (4 niveles) completada con éxito.`),!0}},G={activeClassId:null,activeLevelId:null,activeNodeId:null,activeObjectiveId:null};async function Or(e,t=null){t&&(G.activeClassId=t),e.innerHTML=`
    <div class="pm-rc-container">
      <div class="pm-rc-col" id="pm-rc-classes-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-levels-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-nodes-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-objs-wrapper"></div>
      <div class="pm-rc-col" id="pm-rc-inds-wrapper"></div>
    </div>
    <style>
      .pm-rc-container { display: flex; gap: 0; height: 600px; border: 1px solid var(--pm-border); border-radius: 12px; overflow-x: auto; background: var(--pm-surface-2); box-shadow: var(--pm-shadow-sm); }
      .pm-rc-col { flex: 1; min-width: 160px; display: flex; flex-direction: column; border-right: 1px solid var(--pm-border); background: var(--pm-surface); }
      .pm-rc-col:last-child { border-right: none; }
      
      .pm-rc-header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; border-bottom: 1px solid var(--pm-border); background: rgba(255,255,255,0.05); }
      .pm-rc-header h4 { margin: 0; font-size: 0.7rem; font-weight: 800; color: var(--pm-primary); text-transform: uppercase; letter-spacing: 0.8px; }
      
      .pm-rc-btn-add { background: var(--pm-primary); border: none; color: white; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      .pm-rc-btn-add:hover { transform: scale(1.1); background: var(--pm-primary-dark); }
      .pm-rc-btn-add i { font-size: 0.9rem; }

      .pm-rc-list { flex: 1; overflow-y: auto; padding: 0.6rem; display: flex; flex-direction: column; gap: 0.5rem; }
      
      .pm-rc-item { padding: 0.7rem 0.9rem; border-radius: 10px; cursor: pointer; border: 1px solid var(--pm-border); transition: all 0.2s; position: relative; display: flex; flex-direction: column; background: var(--pm-surface-3); }
      .pm-rc-item:hover { background: var(--pm-surface-2); border-color: var(--pm-primary); transform: translateX(2px); }
      .pm-rc-item.active { background: var(--pm-primary); border-color: var(--pm-primary); color: white; box-shadow: 0 4px 12px rgba(var(--pm-primary-rgb), 0.3); }
      .pm-rc-item.active .pm-rc-item-sub { color: rgba(255,255,255,0.8); }
      
      .pm-rc-actions { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: none; gap: 4px; }
      .pm-rc-item:hover .pm-rc-actions { display: flex; }
      .pm-rc-btn-action { background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 6px; padding: 4px; font-size: 0.7rem; cursor: pointer; color: var(--pm-text); display: flex; align-items: center; justify-content: center; }
      .pm-rc-btn-action:hover { color: var(--pm-primary); border-color: var(--pm-primary); background: white; }

      .pm-rc-item-text { font-size: 0.85rem; font-weight: 600; line-height: 1.3; word-break: break-word; padding-right: 35px; color: inherit; }
      .pm-rc-item-sub { font-size: 0.65rem; color: var(--pm-text-muted); margin-top: 4px; }
      
      .pm-rc-empty { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; color: var(--pm-text-muted); text-align: center; font-size: 0.8rem; font-style: italic; opacity: 0.6; }
      .pm-rc-ind-card { padding: 0.8rem; border-radius: 10px; border: 1px solid var(--pm-border); font-size: 0.8rem; background: var(--pm-surface-3); display: flex; gap: 0.6rem; color: var(--pm-text); }
      .pm-rc-ind-card i { color: var(--pm-primary); font-size: 1rem; }
    </style>
  `,await jr()}async function kr(e,t,n,r){Ce.open({title:`Editar ${e}`,body:`
      <div class="pm-form-group" style="margin-bottom:0;">
        <label class="pm-label" style="color:var(--pm-text-muted); font-size:0.7rem; margin-bottom:8px; display:block; text-transform:uppercase; font-weight:700;">Contenido del ${e}</label>
        <textarea id="edit-item-content" class="pm-input" style="width:100%; min-height:120px; padding:1rem; border-radius:12px; background:var(--pm-surface-3); color:var(--pm-text); border:1px solid var(--pm-border); font-family:inherit; font-size:0.85rem; line-height:1.5; resize:none; outline:none; transition:border-color 0.2s;">${k(n)}</textarea>
        <p class="pm-help-text" style="font-size:0.65rem; margin-top:8px; color:var(--pm-text-muted); line-height:1.4;">
          <i class="bi bi-info-circle me-1"></i> Esta modificación afectará a todas las instancias donde se utilice este ${e.toLowerCase()}.
        </p>
      </div>
    `,onSave:async n=>{let i=n.querySelector(`#edit-item-content`).value.trim();if(!i)return!1;try{switch(e){case`Clase`:await W.updateClass(t,i);break;case`Nivel`:await W.updateLevel(t,{nombre:i});break;case`Tema`:await W.updateNode(t,{nombre:i});break;case`Objetivo`:await W.updateObjective(t,i);break;case`Indicador`:await W.updateIndicator(t,{descripcion:i});break}return r(),!0}catch(e){return console.error(`Error saving change:`,e),alert(`Error al guardar: `+(e.message||`Error desconocido`)),!1}},onDelete:async()=>{try{switch(e){case`Clase`:await W.deleteClass(t);break;case`Nivel`:await W.deleteLevel(t);break;case`Tema`:await W.deleteNode(t);break;case`Objetivo`:await W.deleteObjective(t);break;case`Indicador`:await W.deleteIndicator(t);break}return r(),!0}catch(e){return console.error(`Error deleting item:`,e),alert(`No se pudo eliminar: `+(e.message||`Error de base de datos`)),!1}}})}async function Ar(e,t,n){if(!t&&e!==`Clase`){alert(`Primero seleccioná el elemento superior para agregar un ${e}`);return}Ce.open({title:`Agregar Nuevo ${e}`,body:`
      <div class="pm-form-group" style="margin-bottom:0;">
        <label class="pm-label" style="color:var(--pm-text-muted); font-size:0.7rem; margin-bottom:8px; display:block; text-transform:uppercase; font-weight:700;">Contenido del Nuevo ${e}</label>
        <textarea id="new-item-content" class="pm-input" placeholder="Escribí aquí..." style="width:100%; min-height:120px; padding:1rem; border-radius:12px; background:var(--pm-surface-3); color:var(--pm-text); border:1px solid var(--pm-border); font-family:inherit; font-size:0.85rem; line-height:1.5; resize:none; outline:none;"></textarea>
      </div>
    `,onSave:async r=>{let i=r.querySelector(`#new-item-content`).value.trim();if(!i)return!1;try{switch(e){case`Clase`:await W.addClass(i);break;case`Nivel`:await W.addLevel({clase_id:t,nombre:i,numero_nivel:1});break;case`Tema`:await W.addNode({nivel_id:t,nombre:i,tipo:`TECNICA`});break;case`Objetivo`:await W.addObjective({tema_id:t,nombre:i});break;case`Indicador`:await W.addIndicator({objetivo_id:t,descripcion:i,es_requerido:!0});break}return n(),!0}catch(e){return console.error(`Error adding item:`,e),alert(`No se pudo crear: `+(e.message||`Error de base de datos`)),!1}}})}async function jr(){let e=document.getElementById(`pm-rc-classes-wrapper`),t=await W.getClasses();!t.some(e=>e.id===G.activeClassId)&&t.length>0?G.activeClassId=t[0].id:t.length===0&&(G.activeClassId=null),e.innerHTML=`
    <div class="pm-rc-header">
      <h4>1. Clase</h4> 
      <button class="pm-rc-btn-add" id="btn-add-class" title="Agregar Clase"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${t.map(e=>`
        <div class="pm-rc-item ${G.activeClassId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${k(e.nombre)}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,e.querySelector(`#btn-add-class`).onclick=()=>Ar(`Clase`,null,()=>jr()),G.activeClassId?Mr(G.activeClassId):Ir(`#pm-rc-levels-wrapper`,`Elegí Clase`),e.querySelectorAll(`.pm-rc-item`).forEach(e=>{let t=e.dataset.id;e.querySelector(`.btn-edit`).onclick=n=>{n.stopPropagation(),kr(`Clase`,t,e.querySelector(`.pm-rc-item-text`).innerText,()=>jr())},e.onclick=()=>{G.activeClassId=t,G.activeLevelId=G.activeNodeId=G.activeObjectiveId=null,jr(),Mr(t),Ir(`#pm-rc-nodes-wrapper`,`Elegí Nivel`),Ir(`#pm-rc-objs-wrapper`,`Elegí Tema`),Ir(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function Mr(e){let t=document.getElementById(`pm-rc-levels-wrapper`),n=await W.getLevelsByClass(e);!n.some(e=>e.id===G.activeLevelId)&&n.length>0?G.activeLevelId=n[0].id:n.length===0&&(G.activeLevelId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>2. Nivel</h4> 
      <button class="pm-rc-btn-add" id="btn-add-level" title="Agregar Nivel"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${G.activeLevelId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${k(e.nombre)}</span>
          <span class="pm-rc-item-sub">Nivel ${e.numero_nivel}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-level`).onclick=()=>Ar(`Nivel`,e,()=>Mr(e)),G.activeLevelId?Nr(G.activeLevelId):Ir(`#pm-rc-nodes-wrapper`,`Elegí Nivel`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),kr(`Nivel`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>Mr(e))},t.onclick=()=>{G.activeLevelId=n,G.activeNodeId=G.activeObjectiveId=null,Mr(e),Nr(n),Ir(`#pm-rc-objs-wrapper`,`Elegí Tema`),Ir(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function Nr(e){let t=document.getElementById(`pm-rc-nodes-wrapper`),n=await W.getNodesByLevel(e);!n.some(e=>e.id===G.activeNodeId)&&n.length>0?G.activeNodeId=n[0].id:n.length===0&&(G.activeNodeId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>3. Tema</h4> 
      <button class="pm-rc-btn-add" id="btn-add-node" title="Agregar Tema"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${G.activeNodeId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${k(e.nombre)}</span>
          <span class="pm-rc-item-badge" style="font-size:0.5rem;background:var(--pm-surface-3);padding:1px 4px;border-radius:3px;margin-top:2px;align-self:flex-start;">${e.tipo}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-node`).onclick=()=>Ar(`Tema`,e,()=>Nr(e)),G.activeNodeId?Pr(G.activeNodeId):Ir(`#pm-rc-objs-wrapper`,`Elegí Tema`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),kr(`Tema`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>Nr(e))},t.onclick=()=>{G.activeNodeId=n,G.activeObjectiveId=null,Nr(e),Pr(n),Ir(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function Pr(e){let t=document.getElementById(`pm-rc-objs-wrapper`),n=await W.getObjectivesByNode(e);!n.some(e=>e.id===G.activeObjectiveId)&&n.length>0?G.activeObjectiveId=n[0].id:n.length===0&&(G.activeObjectiveId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>4. Objetivo</h4> 
      <button class="pm-rc-btn-add" id="btn-add-obj" title="Agregar Objetivo"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${G.activeObjectiveId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${k(e.nombre)}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-obj`).onclick=()=>Ar(`Objetivo`,e,()=>Pr(e)),G.activeObjectiveId?Fr(G.activeObjectiveId):Ir(`#pm-rc-inds-wrapper`,`Elegí Objetivo`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),kr(`Objetivo`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>Pr(e))},t.onclick=()=>{G.activeObjectiveId=n,Pr(e),Fr(n)}})}async function Fr(e){let t=document.getElementById(`pm-rc-inds-wrapper`);t.innerHTML=`
    <div class="pm-rc-header">
      <h4>5. Indicador</h4> 
      <button class="pm-rc-btn-add" id="btn-add-ind" title="Agregar Indicador"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${(await W.getIndicatorsByObjective(e)).map(e=>`
        <div class="pm-rc-ind-card" style="position:relative;">
          <i class="bi ${e.es_requerido?`bi-check-circle-fill`:`bi-circle`}"></i>
          <span class="ind-text">${k(e.descripcion)}</span>
          <div class="pm-rc-actions" style="display:flex;opacity:0.6;">
             <button class="pm-rc-btn-action btn-edit-ind" data-id="${e.id}"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-ind`).onclick=()=>Ar(`Indicador`,e,()=>Fr(e)),t.querySelectorAll(`.btn-edit-ind`).forEach(t=>{t.onclick=()=>{let n=t.dataset.id,r=t.closest(`.pm-rc-ind-card`).querySelector(`.ind-text`).innerText;kr(`Indicador`,n,r,()=>Fr(e))}})}function Ir(e,t){let n=document.querySelector(e);n&&(n.innerHTML=`<div class="pm-rc-empty">${t}</div>`)}var Lr=null;function Rr(e,t){Lr=e}function zr(e){Lr&&Lr(e)}function Br(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function Vr(e,{claseId:t,rutaId:n,completedTopics:r=[],onIndicadorSelect:i}){let a=[],o=!1,s=null,c=document.createElement(`div`);if(c.className=`pm-route-bar-wrapper`,e.appendChild(c),!document.getElementById(`pm-route-bar-styles`)){let e=document.createElement(`style`);e.id=`pm-route-bar-styles`,e.textContent=`
      .pm-route-bar-wrapper { margin: 0.5rem 1rem; background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 12px; overflow: hidden; }
      .pm-tree-node { padding: 0.75rem 1rem; border-bottom: 1px solid var(--pm-border); cursor: pointer; transition: background 0.2s; }
      .pm-tree-node:hover { background: var(--pm-surface-2); }
      .pm-tree-node.active { border-left: 4px solid var(--pm-primary); background: rgba(var(--pm-primary-rgb), 0.05); }
      .pm-tree-header { display: flex; align-items: center; justify-content: space-between; }
      .pm-tree-title { font-weight: 700; font-size: 0.85rem; color: var(--pm-text); }
      .pm-tree-badge { font-size: 0.65rem; background: var(--pm-primary-light); color: var(--pm-primary); padding: 2px 6px; border-radius: 4px; font-weight: 800; }
      .pm-tree-children { padding-left: 1rem; background: var(--pm-surface-2); display: none; }
      .pm-tree-node.expanded + .pm-tree-children { display: block; }
      .pm-tree-obj { padding: 0.5rem 1rem; font-size: 0.8rem; color: var(--pm-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
      .pm-tree-obj:hover { color: var(--pm-primary); background: rgba(var(--pm-primary-rgb), 0.03); }
      .pm-tree-icon { width: 24px; height: 24px; border-radius: 50%; background: var(--pm-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }
    `,document.head.appendChild(e)}function l(e){let t=e.target.closest(`[data-type="node"]`);if(t){t.classList.toggle(`expanded`);return}let n=e.target.closest(`[data-type="obj"]`);if(n){let e=n.dataset.id,t=n.dataset.nombre;s={id:e,nombre:t},i?.({id:e,nombre:t}),u()}}c.addEventListener(`click`,l);function u(){if(o){c.innerHTML=`<div style="padding:1rem; text-align:center; font-size:0.8rem; color:var(--pm-text-muted);">Cargando ruta...</div>`;return}if(!a||a.length===0){c.innerHTML=`<div style="padding:1rem; text-align:center; font-size:0.8rem; color:var(--pm-text-muted);">No hay objetivos configurados para esta clase.</div>`;return}c.innerHTML=a.map(e=>`
      <div class="pm-tree-level">
        <div style="background:var(--pm-surface-2); padding: 0.4rem 1rem; font-size:0.7rem; font-weight:800; color:var(--pm-primary); text-transform:uppercase; letter-spacing:0.5px;">
          ${Br(e.nombre)}
        </div>
        ${(e.plan_temas||[]).map(e=>`
          <div class="pm-tree-node" data-type="node">
            <div class="pm-tree-header">
              <span class="pm-tree-title">${Br(e.nombre)}</span>
              <span class="pm-tree-badge">${e.tipo}</span>
            </div>
          </div>
          <div class="pm-tree-children">
            ${(e.plan_objetivos||[]).map(e=>{let t=(r||[]).includes(e.nombre);return`
                <div class="pm-tree-obj" data-type="obj" data-id="${e.id}" data-nombre="${Br(e.nombre)}">
                  <i class="bi ${t?`bi-check-circle-fill text-success`:s?.id===e.id?`bi-circle-fill text-primary`:`bi-circle`}"></i>
                  <span style="${t?`text-decoration: line-through; opacity: 0.6;`:``}">${Br(e.nombre)}</span>
                </div>
              `}).join(``)}
          </div>
        `).join(``)}
      </div>
    `).join(``)}async function d(){if(n){o=!0,u();try{a=await W.getRouteHierarchy(n)}catch(e){console.error(`[routeTreeBar] Error:`,e)}finally{o=!1,u()}}}function f(){c.removeEventListener(`click`,l),c.remove()}function p(){return s}return d(),{refresh:d,destroy:f,getActiveIndicador:p}}function Hr(e){return!e||typeof e!=`string`||!e.trim()||/[#\[\(\{\$>]/.test(e)?`dsl`:`natural`}function Ur(e){return!e||typeof e!=`string`?[]:e.split(`
`).map(e=>e.trim()).filter(e=>e.length>0).map(e=>{let t=on(e);return{alumnos:t.alumnos,nota:t.calificacion?t.calificacion.valor:null,observacion:t.sugerencias.length>0?t.sugerencias[0]:null,tarea:t.tareas.length>0?t.tareas[0]:null}}).filter(e=>e.alumnos.length>0)}function Wr(e,t){let n=e.filter(e=>e.alumnos.includes(`todos`)),r=e.filter(e=>!e.alumnos.includes(`todos`)),i=new Map;if(n.length>0){let e=n[n.length-1];for(let n of t)i.set(n.id,{alumno_id:n.id,nota:e.nota,observacion:e.observacion,tarea:e.tarea})}for(let e of r)for(let n of e.alumnos){let r=n.toLowerCase(),a=t.filter(e=>e.nombre_completo.toLowerCase().includes(r));for(let t of a)i.set(t.id,{alumno_id:t.id,nota:e.nota,observacion:e.observacion,tarea:e.tarea})}return Array.from(i.values())}function Gr(e,t){if(!e||e.length===0)return`gray`;let n=t>0&&e.length>=t,r=e.every(e=>e.nota!=null&&e.nota>=4);return n&&r?`green`:`yellow`}async function Kr(e,t,n,r){if(!r)return console.error(`[evaluationService] Error: teacherId is required for saveEvaluaciones (RLS)`),{error:{message:`teacherId is required`}};let i=n.map(n=>({session_id:e,indicator_id:t,student_id:n.alumno_id,created_by:r,nota:n.nota,observations:n.observacion,tarea:n.tarea})),{data:a,error:o}=await x.from(`indicator_attempts`).upsert(i,{onConflict:`session_id,indicator_id,student_id`,ignoreDuplicates:!1});return{data:a,error:o}}async function qr(e,t){let{data:n,error:r}=await x.from(`indicators`).select(`id`).eq(`node_id`,e).eq(`activo`,!0);if(r)throw r;if(!n||n.length===0)return{semaphore:`gray`,indicators:[]};let i=n.map(e=>e.id),{data:a,error:o}=await x.from(`indicator_attempts`).select(`indicator_id, student_id, nota`).in(`indicator_id`,i);if(o)throw o;let{data:s,error:c}=await x.from(`alumnos_clases`).select(`alumno_id`).eq(`clase_id`,t).eq(`activo`,!0);if(c)throw c;let l=s?s.length:0;return{semaphore:Gr(a??[],l),indicators:n,totalAlumnos:l}}async function Jr(e,t,n,r=null){if(!e||!e.trim())return{modo:`error`,dslGenerado:null,evaluaciones:[],missing:[],error:`Texto vacío`};let i=Hr(e);try{let t=e;i===`natural`&&(t=await Te(e,{presentes:n.map(e=>e.nombre_completo),indicadorActivo:r}));let a=Wr(Ur(t),n),o=new Set(a.map(e=>e.alumno_id)),s=n.filter(e=>!o.has(e.id)).map(e=>e.nombre_completo);return{modo:i,dslGenerado:i===`natural`?t:null,evaluaciones:a,missing:s,error:null}}catch(e){return console.error(`[evaluationService] Error en processarEvaluacion:`,e),{modo:i,dslGenerado:null,evaluaciones:[],missing:[],error:e.message||`Error desconocido`}}}function Yr(){if(document.getElementById(`pm-student-panel-styles`))return;let e=document.createElement(`style`);e.id=`pm-student-panel-styles`,e.textContent=`
    .pm-student-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 400px;
      background: var(--pm-surface, #1e293b); color: #fff; z-index: 1000;
      transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -10px 0 30px rgba(0,0,0,0.3); display: flex; flex-direction: column;
    }
    .pm-student-panel--open { transform: translateX(0); }
    .pm-student-panel__header { 
      padding: 20px; display: flex; align-items: center; gap: 15px; 
      border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
    }
    .pm-student-panel__avatar {
      width: 48px; height: 48px; border-radius: 12px; background: var(--pm-primary, #3b82f6);
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem;
    }
    .pm-student-panel__name { font-weight: 700; font-size: 1.1rem; line-height: 1.2; }
    .pm-student-panel__progress-bar { 
      height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 8px; overflow: hidden;
    }
    .pm-student-panel__progress-fill { height: 100%; background: #10b981; transition: width 1s ease-out; }
    
    .pm-student-panel__body { flex: 1; overflow-y: auto; padding: 20px; }
    .pm-student-panel__section { margin-bottom: 24px; }
    .pm-student-panel__section-title { 
      font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
      color: rgba(255,255,255,0.5); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }

    /* Indicators & Timeline */
    .pm-route-indicador {
      background: rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px;
      display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .pm-route-indicador:hover { background: rgba(255,255,255,0.08); transform: translateY(-1px); }
    .pm-route-indicador__icon { font-size: 1.2rem; }
    .pm-route-indicador__name { font-weight: 600; font-size: 0.95rem; }
    .pm-route-indicador__stats { font-size: 0.75rem; color: rgba(255,255,255,0.5); display: block; }
    
    .pm-route-indicador__timeline { 
      margin: -4px 0 12px 0; padding: 12px; background: rgba(255,255,255,0.02); 
      border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.05); border-top: none;
    }
    .pm-timeline-actions { margin-bottom: 12px; }
    .pm-btn-add-eval {
      width: 100%; background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px dashed rgba(96,165,250,0.3);
      padding: 8px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
    }
    .pm-btn-add-eval:hover { background: rgba(59,130,246,0.15); border-color: rgba(96,165,250,0.5); }

    .pm-eval-timeline__item {
      padding: 10px; border-left: 2px solid rgba(255,255,255,0.1); margin-left: 10px; margin-bottom: 12px;
      position: relative; list-style: none;
    }
    .pm-eval-timeline__item::before {
      content: ''; position: absolute; left: -6px; top: 12px; width: 10px; height: 10px;
      background: #1e293b; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
    }
    .pm-eval-timeline__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .pm-eval-timeline__date { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 600; }
    .pm-eval-timeline__edit { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px; }
    .pm-eval-timeline__edit:hover { color: #60a5fa; }
    .pm-eval-timeline__nota { font-weight: 700; font-size: 0.85rem; color: #60a5fa; display: block; }
    .pm-eval-timeline__detail { font-size: 0.85rem; color: rgba(255,255,255,0.8); display: block; margin-top: 4px; }

    /* Modal */
    .pm-student-panel__modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
      z-index: 2100; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .pm-student-panel__modal-content {
      background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
      width: 100%; max-width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      animation: pm-panel-modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes pm-panel-modal-in { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    
    .pm-student-panel__modal-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
    .pm-student-panel__modal-header h4 { margin: 0; font-size: 1.1rem; }
    .pm-student-panel__modal-close { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; opacity: 0.5; }
    .pm-student-panel__modal-close:hover { opacity: 1; }
    
    .pm-student-panel__modal-indicator-name { padding: 0 20px; margin-top: 12px; font-size: 0.85rem; color: #60a5fa; font-weight: 600; }
    .pm-student-panel__modal-body { padding: 20px; }
    .pm-student-panel__modal-field { margin-bottom: 20px; }
    .pm-student-panel__modal-field label { display: block; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; }
    
    .pm-student-panel__nota-picker { display: flex; justify-content: space-between; gap: 8px; }
    .pm-student-panel__nota-btn {
      flex: 1; aspect-ratio: 1; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .pm-student-panel__nota-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
    .pm-student-panel__nota-btn.active { background: #3b82f6; border-color: #3b82f6; box-shadow: 0 0 15px rgba(59,130,246,0.5); }
    
    .pm-student-panel__modal-footer { padding: 20px; display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
    .pm-btn {
      flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none;
    }
    .pm-btn-primary { background: #3b82f6; color: #fff; }
    .pm-btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
    .pm-btn-outline { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
    .pm-btn-outline:hover { background: rgba(255,255,255,0.08); }
  `,document.head.appendChild(e)}function K(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function Xr(e){return e?e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join(``):`?`}function Zr(e){return e?new Date(e).toLocaleDateString(`es-AR`,{day:`2-digit`,month:`2-digit`,year:`2-digit`}):``}function Qr(e){return e==null?{color:`gray`,icon:`⚫`,label:`Sin evaluar`}:e>=4?{color:`green`,icon:`🟢`,label:`Dominado`}:e>=2?{color:`yellow`,icon:`🟡`,label:`En progreso`}:{color:`red`,icon:`🔴`,label:`Necesita trabajo`}}async function $r(e,t){let{data:n,error:r}=await x.from(`indicators`).select(`id, nombre, description, order_index, node_id, nodes(id, name, order_index, level_id, levels(id, name, level_number))`).eq(`nodes.route_version_id`,t).eq(`activo`,!0).order(`order_index`);if(r)throw r;let i=(n??[]).filter(e=>e.nodes!==null),{data:a,error:o}=await x.from(`indicator_attempts`).select(`id, indicator_id, nota, observations, tarea, created_at, node_id, status, session_id`).eq(`student_id`,e).order(`created_at`,{ascending:!1});if(o)throw o;let s={};for(let e of a??[])s[e.indicator_id]||(s[e.indicator_id]=[]),s[e.indicator_id].push(e);let c=i.map(e=>{let t=s[e.id]??[],n=t[0]??null,r=Qr(n?.nota??null);return{id:e.id,nombre:e.nombre||e.description||`Indicador ${e.id}`,node:e.nodes,latestNota:n?.nota??null,latestObs:n?.observations??null,latestTarea:n?.tarea??null,semColor:r.color,semIcon:r.icon,history:t}}),l=c.filter(e=>e.latestNota>=4).length,u=c.length,d=u>0?Math.round(l/u*100):0,f=new Set;return{indicatorSummaries:c.filter(e=>{if(f.has(e.id))return!1;f.add(e.id);let t=e.history.length>0,n=e.latestNota!==null&&e.latestNota!==0;return t||n}),dominados:l,total:u,avance:d,pendingTasks:c.filter(e=>e.latestTarea).map(e=>({indicadorNombre:e.nombre,tarea:e.latestTarea}))}}function ei(e,t){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">${K(Xr(e.nombre_completo))}</div>
      <div>
        <div class="pm-student-panel__name">${K(e.nombre_completo)}</div>
        <div class="pm-student-panel__meta">Avance: ${t}%</div>
        <div class="pm-student-panel__progress-bar">
          <div class="pm-student-panel__progress-fill" style="width:${t}%"></div>
        </div>
      </div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
  `}function ti(e,t){return`
    <div class="pm-timeline-actions">
      <button class="pm-btn-add-eval" data-action="new-eval" data-idx="${t}">
        <i class="bi bi-plus-circle"></i> Nueva evaluación
      </button>
    </div>
    <ul class="pm-eval-timeline">
      ${e.map((e,n)=>`
    <li class="pm-eval-timeline__item">
      <div class="pm-eval-timeline__header">
        <span class="pm-eval-timeline__date">${K(Zr(e.created_at))}</span>
        <button class="pm-eval-timeline__edit" data-action="edit-eval" data-idx="${t}" data-hidx="${n}">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
      <span class="pm-eval-timeline__nota">Nota: ${K(String(e.nota??`-`))}</span>
      ${e.observations?`<span class="pm-eval-timeline__detail">${K(e.observations)}</span>`:``}
      ${e.tarea?`<span class="pm-eval-timeline__detail"><strong>Tarea:</strong> ${K(e.tarea)}</span>`:``}
    </li>
  `).join(``)||`<p class="pm-empty-history">Sin evaluaciones previas</p>`}
    </ul>
  `}function ni(e){return e.length?e.map((e,t)=>`
    <div class="pm-route-indicador pm-route-indicador--${K(e.semColor)}"
         data-action="toggle-history"
         data-idx="${t}"
         role="button"
         tabindex="0"
         aria-expanded="false">
      <span class="pm-route-indicador__icon">${e.semIcon}</span>
      <div class="pm-route-indicador__info">
        <span class="pm-route-indicador__name">${K(e.nombre)}</span>
        <span class="pm-route-indicador__stats">
          ${e.latestNota==null?`Sin evaluar`:`Última nota: ${e.latestNota}`}
          · ${e.history.length} eval${e.history.length===1?``:`s`}
        </span>
      </div>
    </div>
    <div class="pm-route-indicador__timeline" data-timeline="${t}" hidden>
      ${ti(e.history,t)}
    </div>
  `).join(``):`<p style="padding:8px">No hay indicadores en esta ruta.</p>`}function ri(e){return e.length?`
    <section class="pm-student-panel__section">
      <h3 class="pm-student-panel__section-title">Tareas pendientes</h3>
      <ul class="pm-pending-tasks">
        ${e.map(e=>`
          <li class="pm-pending-tasks__item">
            <strong>${K(e.indicadorNombre)}:</strong> ${K(e.tarea)}
          </li>
        `).join(``)}
      </ul>
    </section>
  `:``}function ii(e,{indicatorSummaries:t,avance:n,pendingTasks:r}){return`
    ${ei(e,n)}
    <div class="pm-student-panel__body">
      ${ri(r)}
      <section class="pm-student-panel__section">
        <h3 class="pm-student-panel__section-title">Ruta de aprendizaje</h3>
        <div class="pm-route-map">
          ${ni(t)}
        </div>
      </section>
    </div>
  `}function ai(){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">…</div>
      <div><div class="pm-student-panel__name">Cargando…</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:var(--color-text-muted,#888)">
      Cargando datos del alumno…
    </div>
  `}function oi(e){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">!</div>
      <div><div class="pm-student-panel__name">Error</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:#c00">
      ${K(e)}
    </div>
  `}function si({alumno:e,rutaId:t,sessionId:n,claseId:r,fecha:i,horaInicio:a}){Yr();let o=document.createElement(`aside`);o.className=`pm-student-panel`,o.setAttribute(`role`,`dialog`),o.setAttribute(`aria-modal`,`false`),o.setAttribute(`aria-label`,`Progreso de ${e.nombre_completo}`),document.body.appendChild(o);let s=[],c=null;function l(){xe()===`desktop`?o.classList.add(`pm-student-panel--desktop`):o.classList.remove(`pm-student-panel--desktop`)}let u=ve(l);l();function d(e){let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;if(n===`close`){h();return}if(n===`toggle-history`){let e=t.dataset.idx,n=o.querySelector(`[data-timeline="${e}"]`);if(!n)return;let r=!n.hidden;n.hidden=r,t.setAttribute(`aria-expanded`,String(!r));return}if(n===`new-eval`){let e=t.dataset.idx;f(e);return}if(n===`edit-eval`){let e=t.dataset.idx,n=t.dataset.hidx;f(e,n);return}}async function f(e,t=null){let n=s[e],r=t===null?null:n.history[t],i=r?.nota??null,a=document.createElement(`div`);a.className=`pm-student-panel__modal-overlay pm-animate-fade-in`,a.innerHTML=`
      <div class="pm-student-panel__modal-content">
        <div class="pm-student-panel__modal-header">
          <h4>${r?`Editar`:`Nueva`} Evaluación</h4>
          <button class="pm-student-panel__modal-close" data-action="modal-close">&times;</button>
        </div>
        <p class="pm-student-panel__modal-indicator-name">${K(n.nombre)}</p>
        
        <div class="pm-student-panel__modal-body">
          <div class="pm-student-panel__modal-field">
            <label>Nota del indicador</label>
            <div class="pm-student-panel__nota-picker">
              ${[0,1,2,3,4,5].map(e=>`
                <button class="pm-student-panel__nota-btn ${i===e?`active`:``}" data-nota="${e}">${e}</button>
              `).join(``)}
            </div>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Observaciones / Comentarios</label>
            <textarea id="modal-obs" rows="4" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 12px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Escribe aquí las observaciones...">${r?K(r.observations):``}</textarea>
          </div>
        </div>

        <div class="pm-student-panel__modal-footer">
          <button class="pm-btn pm-btn-outline" data-action="modal-close">Cancelar</button>
          <button class="pm-btn pm-btn-primary" data-action="modal-save">
            ${r?`Actualizar`:`Guardar Evaluación`}
          </button>
        </div>
      </div>
    `,document.body.appendChild(a),a.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-nota]`);if(t){a.querySelectorAll(`[data-nota]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),i=parseInt(t.dataset.nota);return}let o=e.target.closest(`[data-action]`)?.dataset.action;if(o===`modal-close`)a.remove();else if(o===`modal-save`){let e=a.querySelector(`#modal-obs`).value;await p(n.id,i,e,r?.id),a.remove()}}),a.addEventListener(`click`,e=>{e.target===a&&a.remove()})}async function p(t,n,o,s=null){try{let s=C();if(!s)throw Error(`No hay sesión de maestro activa.`);console.log(`[studentProgressPanel] Saving via RPC...`,{claseId:r,fecha:i,horaInicio:a,indicatorId:t,studentId:e.id,nota:n});let{data:c,error:l}=await x.rpc(`ensure_session_and_save_evaluation`,{p_clase_id:r,p_maestro_id:s.id,p_fecha:i,p_hora_inicio:a,p_indicator_id:t,p_student_id:e.id,p_nota:n,p_observations:(o||``).trim()});if(l)throw l;console.log(`[studentProgressPanel] Save successful. Session ID:`,c),await m()}catch(e){console.error(`[studentProgressPanel] Error during RPC save flow:`,e),alert(`Error al guardar la evaluación: `+(e.message||`Error de base de datos`))}}o.addEventListener(`click`,d),o.addEventListener(`keydown`,e=>{if(e.key===`Enter`||e.key===` `){let t=e.target.closest(`[data-action="toggle-history"]`);t&&(e.preventDefault(),t.click())}});async function m(){o.innerHTML=ai(),o.classList.add(`pm-student-panel--open`),c&&c.dispose(),c=j(o,{onClose:()=>h()});try{let n=await $r(e.id,t);s=n.indicatorSummaries,o.innerHTML=ii(e,n)}catch(e){console.error(`[studentProgressPanel] Error loading progress:`,e),o.innerHTML=oi(e?.message??`Error desconocido al cargar datos.`)}}function h(){o.classList.remove(`pm-student-panel--open`),c&&=(c.dispose(),null),setTimeout(()=>{o.classList.contains(`pm-student-panel--open`)||(o.innerHTML=``,s=[])},300)}function g(){c&&=(c.dispose(),null),u(),o.removeEventListener(`click`,d),o.remove()}return{open:m,close:h,destroy:g}}function ci({saveFn:e,debounceMs:t=3e4}){let n=null,r=[];function i(i){n!==null&&(clearTimeout(n),n=null),!(!i||!i.trim())&&(n=setTimeout(async()=>{n=null,await e(i),r.forEach(e=>e(i))},t))}function a(){n!==null&&(clearTimeout(n),n=null)}function o(e){r.push(e)}return{onInput:i,destroy:a,onSaved:o}}async function li(e,t,n){let{data:r,error:i}=await x.from(`observaciones_sesion`).select(`id`).eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0).limit(1).maybeSingle();if(i)throw i;if(r){let{data:e,error:t}=await x.from(`observaciones_sesion`).update({contenido_raw:n}).eq(`id`,r.id).select().single();if(t)throw t;return e}else{let{data:r,error:i}=await x.from(`observaciones_sesion`).insert({sesion_id:e,maestro_id:t,contenido_raw:n,es_borrador:!0}).select().single();if(i)throw i;return r}}async function ui(e,t){let{data:n,error:r}=await x.from(`observaciones_sesion`).select(`id, contenido_raw, updated_at`).eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0).limit(1).maybeSingle();if(r)throw r;return n??null}async function di(e){let{error:t}=await x.from(`observaciones_sesion`).delete().eq(`id`,e);if(t)throw t}async function fi(e,t,n,r,i=null){let{error:a}=await x.from(`observaciones_sesion`).delete().eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0);if(a)throw a;let{data:o,error:s}=await x.from(`observaciones_sesion`).insert({sesion_id:e,maestro_id:t,contenido_raw:n,contenido_parsed:r,contenido_ia_dsl:i,es_borrador:!1}).select().single();if(s)throw s;return o}var pi=`soi_ruta_tema_pendiente`;function mi(e){sessionStorage.setItem(pi,JSON.stringify(e))}function hi(){let e=sessionStorage.getItem(pi);if(!e)return null;sessionStorage.removeItem(pi);try{return JSON.parse(e)}catch{return null}}function gi(e,{onSave:t,onCancel:n}){let r=document.getElementById(`pm-justif-modal`);if(!r&&(r=document.createElement(`div`),r.id=`pm-justif-modal`,r.className=`pm-justif-modal-overlay`,r.innerHTML=`
      <div class="pm-justif-backdrop"></div>
      <div class="pm-justif-modal">
        <div class="pm-justif-header">
          <div class="pm-justif-header-content">
            <div class="pm-justif-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h2 class="pm-justif-title" id="pm-justif-title">Justificar Inasistencia</h2>
              <p class="pm-justif-subtitle" id="pm-justif-subtitle">Registra el motivo de la ausencia</p>
            </div>
          </div>
          <button class="pm-justif-close" id="pm-justif-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="pm-justif-body">
          <p id="pm-justif-alumno-nombre" class="pm-justif-alumno"></p>
          
          <div class="pm-justif-field">
            <label for="pm-justif-motivo">Motivo de la ausencia *</label>
            <textarea id="pm-justif-motivo" rows="3" 
              placeholder="Ej: Certificado médico, cita médica, viaje familiar, motivo personal..."></textarea>
            <span class="pm-justif-hint">Describe el motivo de la inasistencia</span>
          </div>
          
          <div class="pm-justif-field">
            <label>Evidencia (Opcional)</label>
            <div class="pm-justif-file-area" id="pm-justif-file-area">
              <input type="file" id="pm-justif-file" class="pm-justif-file-input" accept="image/*" capture="environment" />
              <div class="pm-justif-file-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Adjuntar foto del justificante</span>
              </div>
              <div class="pm-justif-file-preview" id="pm-justif-file-preview" style="display:none;">
                <img id="pm-justif-preview-img" src="" alt="Vista previa" />
                <button class="pm-justif-remove-file" id="pm-justif-remove-file" type="button">×</button>
              </div>
            </div>
            <span class="pm-justif-hint">Ej: foto del certificado médico</span>
          </div>
        </div>
        
        <div class="pm-justif-footer">
          <button class="pm-justif-cancel" id="pm-justif-cancel">Cancelar</button>
          <button class="pm-justif-save" id="pm-justif-save">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span id="pm-justif-btn-text">Guardar Justificación</span>
          </button>
        </div>
      </div>
    `,document.body.appendChild(r),!document.getElementById(`pm-justif-styles`))){let e=document.createElement(`style`);e.id=`pm-justif-styles`,e.textContent=`
        .pm-justif-modal-overlay {
          position: fixed;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .pm-justif-modal-overlay.open {
          display: flex;
          opacity: 1;
        }
        .pm-justif-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
        }
        .pm-justif-modal {
          position: relative;
          background: var(--pm-surface);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.95) translateY(10px);
          transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .pm-justif-modal-overlay.open .pm-justif-modal {
          transform: scale(1) translateY(0);
        }
        .pm-justif-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.25rem 1.25rem 0.75rem;
          background: var(--pm-surface-2);
          border-bottom: 1px solid var(--pm-border);
        }
        .pm-justif-header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .pm-justif-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--pm-warning) 0%, #d97706 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .pm-justif-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--pm-text);
          margin: 0;
        }
        .pm-justif-subtitle {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.2rem 0 0;
        }
        .pm-justif-close {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--pm-surface-2);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pm-text-muted);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .pm-justif-close:hover {
          background: var(--pm-border);
          color: var(--pm-text);
        }
        .pm-justif-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
        }
        .pm-justif-alumno {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--pm-primary);
          margin: 0 0 1rem;
          padding: 0.5rem 0.75rem;
          background: rgba(59, 130, 246, 0.08);
          border-radius: 8px;
          border-left: 3px solid var(--pm-primary);
        }
        .pm-justif-field {
          margin-bottom: 1rem;
        }
        .pm-justif-field:last-child {
          margin-bottom: 0;
        }
        .pm-justif-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--pm-text);
          margin-bottom: 0.35rem;
        }
        .pm-justif-field textarea {
          width: 100%;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--pm-text);
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          min-height: 70px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pm-justif-field textarea:focus {
          outline: none;
          border-color: var(--pm-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .pm-justif-hint {
          display: block;
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          margin-top: 0.25rem;
        }
        .pm-justif-file-area {
          position: relative;
          border: 2px dashed var(--pm-border);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pm-justif-file-area:hover {
          border-color: var(--pm-primary);
          background: rgba(59, 130, 246, 0.05);
        }
        .pm-justif-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .pm-justif-file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--pm-text-muted);
        }
        .pm-justif-file-placeholder svg {
          opacity: 0.5;
        }
        .pm-justif-file-placeholder span {
          font-size: 0.8rem;
        }
        .pm-justif-file-preview {
          position: relative;
        }
        .pm-justif-file-preview img {
          max-width: 100%;
          max-height: 120px;
          border-radius: 8px;
          object-fit: cover;
        }
        .pm-justif-remove-file {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: var(--pm-danger);
          color: white;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pm-justif-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
        }
        .pm-justif-cancel {
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--pm-text);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pm-justif-cancel:hover {
          background: var(--pm-border);
        }
        .pm-justif-save {
          background: linear-gradient(135deg, var(--pm-warning) 0%, #d97706 100%);
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pm-justif-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
        }
        @media (max-width: 480px) {
          .pm-justif-modal {
            max-width: 100%;
          }
        }
      `,document.head.appendChild(e)}let i=null,a=null,o=null,s=null,c=!1,l=null,u=null,d=r.querySelector(`#pm-justif-title`),f=r.querySelector(`#pm-justif-subtitle`),p=r.querySelector(`#pm-justif-btn-text`),m=r.querySelector(`#pm-justif-alumno-nombre`),h=r.querySelector(`#pm-justif-motivo`),g=r.querySelector(`#pm-justif-file`),_=r.querySelector(`.pm-justif-file-placeholder`),v=r.querySelector(`.pm-justif-file-preview`),y=r.querySelector(`#pm-justif-preview-img`),b=r.querySelector(`#pm-justif-remove-file`);function x(e,t=null,n=null){i=e,a=t,o=null,s=null,c=!!t,l=n,c?(d.textContent=`Editar Justificación`,f.textContent=`Modifica el motivo de la inasistencia`,p.textContent=`Actualizar`):(d.textContent=`Justificar Inasistencia`,f.textContent=`Registra el motivo de la ausencia`,p.textContent=`Guardar Justificación`),m.textContent=e.nombre_completo,h.value=t?.motivo||``;let b=t?.evidencia_url||t?.evidencia_base64;b?(s=b,y.src=b,_.style.display=`none`,v.style.display=`block`):(s=null,_.style.display=`flex`,v.style.display=`none`),g.value=``,r.classList.add(`open`),h.focus();let x=r.querySelector(`.pm-justif-modal`);x&&(u&&u.dispose(),u=j(x,{onClose:()=>S(!0)}))}function S(e=!1){e&&n&&i&&l!==null&&n(i.id,l),r.classList.remove(`open`),i=null,a=null,o=null,s=null,l=null,u&&=(u.dispose(),null)}r.querySelector(`#pm-justif-close`).onclick=()=>S(!0),r.querySelector(`#pm-justif-cancel`).onclick=()=>S(!0),r.querySelector(`.pm-justif-backdrop`).onclick=()=>S(!0),g.onchange=e=>{let t=e.target.files[0];t&&(o=t,s=URL.createObjectURL(t),y.src=s,_.style.display=`none`,v.style.display=`block`)},b.onclick=()=>{s&&!(a?.evidencia_url||a?.evidencia_base64)&&URL.revokeObjectURL(s),o=null,s=null,g.value=``,_.style.display=`flex`,v.style.display=`none`},r.querySelector(`#pm-justif-save`).onclick=()=>{let e=h.value.trim();if(!e){h.focus(),h.style.borderColor=`var(--pm-danger)`,setTimeout(()=>{h.style.borderColor=``},2e3);return}t&&i&&t({alumnoId:i.id,motivo:e,evidenciaFile:o,evidenciaPreview:s,justificacionId:a?.id||null,existingUrl:a?.evidencia_url||a?.evidencia_base64||null,isEdit:c})};let ee=e=>{e.key===`Escape`&&(S(),document.removeEventListener(`keydown`,ee))};return document.addEventListener(`keydown`,ee),{open:x,close:S}}var _i=`documentos`;async function vi(e,t=`justificaciones`){let n=e.name.split(`.`).pop(),r=`${t}/${`${Date.now()}_${Math.random().toString(36).slice(2)}.${n}`}`,{data:i,error:a}=await x.storage.from(_i).upload(r,e,{cacheControl:`3600`,upsert:!1});if(a)throw a;let{data:o}=x.storage.from(_i).getPublicUrl(r);return o.publicUrl}async function yi({sesionId:e,alumnoId:t,claseId:n,fecha:r,motivo:i,evidenciaBase64:a,creadoPor:o},s=null){if(!e||!t||!n||!r||!i)return{error:{message:`Faltan campos requeridos`}};let c=null;if(s)try{c=await vi(s)}catch(e){console.warn(`[JustificacionService] Error subiendo evidencia a Storage:`,e)}let l={sesion_id:e,alumno_id:t,clase_id:n,fecha:r,motivo:i,evidencia_url:c||null,evidencia_base64:null,creado_por:o,estado:`pendiente`},{data:u,error:d}=await x.from(`justificaciones`).upsert([l],{onConflict:`sesion_id,alumno_id`,ignoreDuplicates:!1}).select().single();return{data:u,error:d}}async function bi(e,t){if(!e||!t)return null;let{data:n,error:r}=await x.from(`justificaciones`).select(`*`).eq(`sesion_id`,e).eq(`alumno_id`,t).single();return r&&r.code!==`PGRST116`?(console.warn(`[JustificacionService] Error obteniendo justificación:`,r),null):n||null}async function xi(e){if(!e)return{error:{message:`ID requerido`}};let{error:t}=await x.from(`justificaciones`).delete().eq(`id`,e);return{error:t}}async function Si(e,t,n,r,i=`Clase`){if(!r||r.length===0)return{success:!0};let a=r.filter(e=>e.observacion&&e.observacion.trim().length>0);if(a.length===0)return{success:!0};let s=a.map(r=>new o({alumno_id:r.alumno_id,maestro_id:n,clase_id:t,sesion_clase_id:e,tipo:`academico`,titulo:`Evaluación SOI: ${i}`,descripcion:r.observacion,prioridad:`media`,estado:`abierta`,fecha_observacion:new Date().toISOString().split(`T`)[0]}).toJSON()),{data:c,error:l}=await x.from(`observaciones_alumnos`).upsert(s,{onConflict:`sesion_clase_id,alumno_id`});return l?(console.error(`[Promotion] Error promoviendo observaciones:`,l),{success:!1,error:l.message}):{success:!0,data:c}}function Ci(){let e=Promise.resolve();return{run(t){if(typeof t!=`function`)throw TypeError(`asyncMutex.run expects a function`);let n=e.then(()=>t());return e=n.then(()=>{},()=>{}),n}}}async function wi(e,{claseId:t,fecha:n}={}){let r=typeof e==`string`?document.getElementById(e):e;if(!r){console.error(`[asistenciaView] Container not found:`,e);return}r.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let i=C();if(!i){r.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}if(!t){r.innerHTML=`<p class="pm-empty">No se indicó la clase.</p>`;return}localStorage.setItem(`pm_active_clase_id`,t);let a=n||new Date().toISOString().split(`T`)[0];try{let e=new Date().toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[n,o,s,c]=await Promise.all([F(),xt([t]),Tt([t]),x.from(`sesiones_clase`).select(`*`).eq(`clase_id`,t).eq(`maestro_id`,i.id).eq(`fecha`,a).order(`borrador`,{ascending:!0}).order(`updated_at`,{ascending:!1}).limit(1)]);console.log(`[DEBUG] Finished Batch 1`);let l=n.find(e=>e.id===t);if(!l){console.log(`[DEBUG] Clase not found in misClases`),r.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Clase no encontrada.</p>`;return}let u=o.find(t=>t.dia?.toLowerCase()===e),d=(s||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>{let n=(e.instrumento_principal||``).localeCompare(t.instrumento_principal||``);return n===0?(e.nombre_completo||``).localeCompare(t.nombre_completo||``):n}),f=c.data?.[0],p=f?.id||null,m=f?.updated_at||null,h=f?.contenido||``,g=l.salon?[l.salon]:[],[_,v]=await Promise.all([p?x.from(`class_session_content_snapshots`).select(`*`).eq(`session_id`,p).then(e=>e.data||[]):Promise.resolve([]),g.length>0?Et(g):Promise.resolve([])]);console.log(`[DEBUG] Finished Batch 2`);let y=v.length>0?v[0].nombre:null,b=`pm_asistencia_${t}_${a}`,S=localStorage.getItem(`${b}_updated`),ee=!1;m&&S&&new Date(m).getTime()>new Date(S).getTime()+5e3&&(ee=!0);let te=null;try{let e=n?.find(e=>e.id===t)?.instrumento;if(e){let t=e.split(`,`)[0].trim().toLowerCase(),{data:n}=await x.from(`routes`).select(`id, route_versions!inner(id)`).ilike(`instrument`,`%${t}%`).eq(`route_versions.status`,`published`).limit(1).maybeSingle();te=n?.route_versions?.[0]?.id||n?.route_versions?.id||null}}catch(e){console.warn(`[asistencia] No se pudo resolver route_version_id:`,e)}let C={},ne={};d.forEach(e=>{C[e.id]=null});let w=f?.asistencia||[];if(w.length===0&&p)try{let{data:e}=await x.from(`asistencias`).select(`alumno_id, estado`).eq(`sesion_clase_id`,p);if(e?.length>0){console.log(`[asistencia] Restaurando desde tabla asistencias:`,e.length);let t={presente:`P`,ausente:`A`,justificado:`J`,tarde:`T`};w=e.map(e=>({alumno_id:e.alumno_id,estado:t[e.estado]??e.estado}))}}catch(e){console.warn(`[asistencia] No se pudo restaurar desde tabla asistencias:`,e)}let T={presente:`P`,ausente:`A`,justificado:`J`,tarde:`T`};w.forEach(e=>{if(C.hasOwnProperty(e.alumno_id)){let t=T[e.estado]??e.estado;C[e.alumno_id]=t}});let re=[];if(p)try{re=await x.from(`justificaciones`).select(`alumno_id`).eq(`sesion_id`,p).then(e=>e.data||[]),re.forEach(e=>{C.hasOwnProperty(e.alumno_id)&&(C[e.alumno_id]=`J`)})}catch(e){console.warn(`[asistencia] No se pudieron restaurar justificaciones:`,e)}let ie=gi(document.body,{onSave:async({alumnoId:e,motivo:n,evidenciaFile:r,evidenciaPreview:o,justificacionId:s,existingUrl:c,isEdit:l})=>{try{if(l&&s){let e=c;if(r){if(c){let e=c.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&await x.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}let{data:t}=await x.storage.from(`documentos`).upload(`justificaciones/${Date.now()}_${Math.random().toString(36).slice(2)}.${r.name.split(`.`).pop()}`,r).catch(()=>({data:null}));if(t){let{data:n}=x.storage.from(`documentos`).getPublicUrl(t.path);e=n.publicUrl}}let{error:t}=await x.from(`justificaciones`).update({motivo:n,evidencia_url:e}).eq(`id`,s).select().single();if(t)throw t}else{let o=await yi({sesionId:p,alumnoId:e,claseId:t,fecha:a,motivo:n,creadoPor:i.id},r);if(o.error)throw o.error}ie.close()}catch(e){console.error(`[justificacion] Error guardando:`,e)}},onCancel:(e,t)=>{C[e]=t,renderLista(e),_updateProgress()}});Ti(r,{clase:l,horario:u,alumnos:d,estado:C,justificaciones:ne,maestro:i,fechaHoy:a,claseId:t,sesionId:p,hasConflict:ee,serverDSL:h,snapshots:_,salonNombre:y,rutaId:te,_justifModal:ie})}catch(e){console.error(`[asistenciaView] Error fatal:`,e.message,e.stack),r.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${k(e.message)}</p>`}}function Ti(e,t){let{clase:n,horario:r,alumnos:i,estado:a,justificaciones:o,maestro:s,fechaHoy:c,claseId:l,snapshots:u,serverDSL:d,hasConflict:f,salonNombre:p,rutaId:m,_justifModal:h}=t,g=t.sesionId,_=[],b=`pm_asistencia_${l}_${c}`,S=d,ee=null,te=Ci(),C=null;if(!document.getElementById(`pm-asist-badge-styles`)){let e=document.createElement(`style`);e.id=`pm-asist-badge-styles`,e.textContent=`
      .pm-badge { 
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; 
        background: var(--pm-primary-light, rgba(59,130,246,0.15)); color: var(--pm-primary, #3b82f6);
        white-space: nowrap; border: 1px solid rgba(59,130,246,0.3);
      }
      .pm-badge-warning { background: rgba(245,158,11,0.15); color: #d97706; border-color: rgba(245,158,11,0.3); }
      .pm-badge-danger { background: rgba(239,68,68,0.15); color: #dc2626; border-color: rgba(239,68,68,0.3); }
      .pm-badge-muted { background: var(--pm-surface-2, #374151); color: #e5e7eb; border-color: rgba(255,255,255,0.2); }
      [data-theme="light"] .pm-badge-muted { background: #e5e7eb; color: #374151; border-color: #d1d5db; }
    `,document.head.appendChild(e)}e.innerHTML=`
    <style>
      .pm-asist-header { 
        display: flex; align-items: center; gap: 1rem;
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8); 
        color: white; 
        padding: 1.25rem 1.25rem 2.25rem 1.25rem; 
        border-bottom-left-radius: 28px; 
        border-bottom-right-radius: 28px;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 10;
        width: 100%;
      }
      [data-portal-theme="dark"] .pm-asist-header,
      [data-bs-theme="dark"] .pm-asist-header {
        background: var(--pm-surface-2);
        border-bottom: 1px solid var(--pm-border);
        box-shadow: none;
      }
      .pm-asist-title { margin: 0; font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
      .pm-asist-subtitle { margin: 4px 0 0; font-size: 0.75rem; opacity: 0.85; font-weight: 500; color: rgba(255, 255, 255, 0.9); }
      .pm-asist-bulk-circles { display: flex; gap: 0.75rem; align-items: center; }
      .pm-bulk-circle {
        width: 34px; height: 34px; border-radius: 50%; border: 2px solid currentColor;
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.1);
      }
      .pm-bulk-circle.p { color: #4ade80; border-color: rgba(74, 222, 128, 0.4); }
      .pm-bulk-circle.a { color: #f87171; border-color: rgba(248, 113, 113, 0.4); }
      .pm-bulk-circle:hover { transform: scale(1.1); background: currentColor; color: var(--pm-surface-2); }
      .pm-asist-nombre { cursor: pointer; text-decoration: underline dotted; text-underline-offset: 3px; }
      .pm-asist-nombre:hover { color: var(--pm-primary); }
      .pm-copy-plan-btn {
        display: inline-flex; align-items: center; gap: 0.35rem;
        padding: 0.35rem 0.75rem; border-radius: 20px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        background: var(--pm-surface-2, #374151); color: var(--pm-text-muted, #9ca3af);
        font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
      }
      .pm-copy-plan-btn:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      [data-theme="light"] .pm-copy-plan-btn { background: #f3f4f6; color: #6b7280; border-color: #d1d5db; }
      [data-theme="light"] .pm-copy-plan-btn:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      .pm-route-selector-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: var(--pm-surface-2, #374151);
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        border-radius: 12px;
        margin: 0 1rem 1rem;
      }
      /* Contenedor de la lista para dar aire lateral */
      .pm-asist-alumnos-container {
        padding: 0 1rem 2rem;
      }
      .pm-route-selector-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--pm-text-muted, #9ca3af);
        white-space: nowrap;
      }
      .pm-route-selector {
        flex: 1;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.2));
        background: var(--pm-surface, #2d3748);
        color: var(--pm-text, #e5e7eb);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%239ca3af' d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        padding-right: 2rem;
      }
      .pm-route-selector:focus {
        outline: none;
        border-color: var(--pm-primary, #007aff);
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
      }
      [data-theme="light"] .pm-route-selector-wrap { background: #f9fafb; border-color: #e5e7eb; }
      [data-theme="light"] .pm-route-selector { background: #fff; color: #374151; border-color: #d1d5db; }
      [data-theme="light"] .pm-route-selector-label { color: #6b7280; }

      /* ── Planificacion Card Premium (Glassmorphism) ── */
      .pm-planificacion-card {
        background: rgba(var(--pm-surface-rgb, 30, 41, 59), 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        margin: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }
      .pm-planificacion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .pm-planificacion-header:hover { background: rgba(255, 255, 255, 0.05); }
      .pm-planificacion-header-left { display: flex; align-items: center; gap: 1rem; }
      .pm-planificacion-icon-box {
        width: 42px; height: 42px; background: linear-gradient(135deg, var(--pm-primary), #60a5fa);
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
        font-size: 1.4rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      .pm-planificacion-info { display: flex; flex-direction: column; }
      .pm-planificacion-label { font-size: 0.65rem; font-weight: 800; color: var(--pm-primary); text-transform: uppercase; letter-spacing: 1px; }
      .pm-planificacion-nombre { font-size: 1.1rem; font-weight: 700; color: #fff; margin-top: 2px; }
      
      .pm-planificacion-actions { display: flex; align-items: center; gap: 0.75rem; }
      .pm-btn-circle {
        width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; display: flex;
        align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
      }
      .pm-btn-circle:hover { background: var(--pm-primary); border-color: var(--pm-primary); transform: rotate(45deg); }
      
      .pm-planificacion-dropdown {
        padding: 0 1.5rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      .pm-planificacion-tabs-pill {
        display: flex; background: rgba(0, 0, 0, 0.2); padding: 4px;
        border-radius: 30px; margin: 1.5rem 0; border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .pm-plan-tab-pill {
        flex: 1; padding: 0.6rem; border: none; background: none; color: var(--pm-text-muted);
        font-size: 0.8rem; font-weight: 700; cursor: pointer; border-radius: 25px; transition: all 0.3s;
      }
      .pm-plan-tab-pill.active { background: var(--pm-primary); color: #fff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
      
      .pm-plan-list { max-height: 250px; overflow-y: auto; padding-right: 5px; }
      .pm-plan-item {
        display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
        border-radius: 12px; margin-bottom: 0.5rem; background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: all 0.2s;
      }
      .pm-plan-item:hover { background: rgba(255, 255, 255, 0.08); transform: translateX(5px); }
      .pm-plan-item.active { border-color: var(--pm-primary); background: rgba(59, 130, 246, 0.1); }
      .pm-plan-item-icon { font-size: 1.1rem; }
      .pm-plan-item-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
      [data-theme="light"] .pm-planificacion-card { background: #fff; border-color: #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
      [data-theme="light"] .pm-planificacion-header:hover { background: #f9fafb; }
      [data-theme="light"] .pm-planificacion-dropdown { background: #f9fafb; }
      [data-theme="light"] .pm-plan-item:hover { background: rgba(0,122,255,0.05); }

      .pm-active-tema-badge {
        font-size: 0.75rem;
        background: rgba(59, 130, 246, 0.15);
        color: var(--pm-primary);
        padding: 3px 10px;
        border-radius: 12px;
        margin-top: 5px;
        display: inline-block;
        font-weight: 600;
        border: 1px solid rgba(59, 130, 246, 0.3);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .pm-route-tree-dropdown-box {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
        max-height: 350px;
        overflow-y: auto;
        padding-right: 5px;
      }
      /* Scrollbar minimalista para el árbol */
      .pm-route-tree-dropdown-box::-webkit-scrollbar { width: 4px; }
      .pm-route-tree-dropdown-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      [data-theme="light"] .pm-active-tema-badge {
        background: rgba(0, 122, 255, 0.08);
        border-color: rgba(0, 122, 255, 0.2);
      }
      [data-theme="light"] .pm-route-tree-dropdown-box {
        border-top-color: #e5e7eb;
      }
      /* --- ESTILOS DEL TOUR INTERACTIVO --- */
      .pm-tour-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8); z-index: 10000;
        pointer-events: auto; display: none;
        transition: opacity 0.3s;
      }
      .pm-tour-spotlight {
        position: absolute; border-radius: 12px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8);
        z-index: 10001; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none; border: 2px solid var(--pm-primary);
      }
      .pm-tour-tooltip {
        position: absolute; width: 280px; background: var(--pm-surface);
        border: 1px solid var(--pm-border); border-radius: 16px;
        padding: 1.5rem; z-index: 10002; color: #fff;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        transition: all 0.4s; pointer-events: auto;
      }
      .pm-tour-tooltip h4 { margin: 0 0 0.5rem; color: var(--pm-primary); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; }
      .pm-tour-tooltip p { margin: 0; font-size: 0.9rem; line-height: 1.4; color: var(--pm-text-muted); }
      .pm-tour-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
      .pm-tour-btn-skip { background: none; border: none; color: var(--pm-text-muted); font-size: 0.8rem; cursor: pointer; text-decoration: underline; }
      .pm-tour-btn-next { 
        background: var(--pm-primary); color: #fff; border: none; 
        padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; cursor: pointer;
        font-size: 0.85rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      
      .pm-help-btn {
        width: 32px; height: 32px; border-radius: 50%; background: rgba(var(--pm-primary-rgb), 0.15);
        color: var(--pm-primary); border: 1px solid rgba(var(--pm-primary-rgb), 0.3);
        display: flex; align-items: center; justify-content: center; cursor: pointer;
        transition: all 0.2s; font-size: 1rem;
      }
      .pm-help-btn:hover { background: var(--pm-primary); color: #fff; transform: scale(1.1); }

      @media (max-width: 480px) {
        .pm-tour-tooltip {
          width: calc(100% - 40px);
          left: 20px !important;
          font-size: 0.85rem;
        }
      }

      [data-theme="light"] .pm-tour-tooltip { background: #fff; color: #111; }
      .pm-asist-actions-fixed {
        position: fixed;
        bottom: 80px; /* Por encima del menú inferior */
        left: 0; right: 0;
        padding: 0.75rem 1rem;
        background: rgba(var(--pm-bg-rgb), 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        gap: 0.75rem;
        z-index: 1000;
        border-top: 1px solid rgba(255,255,255,0.05);
        box-shadow: 0 -10px 30px rgba(0,0,0,0.2);
      }
      .pm-asist-btn-obs {
        flex: 1;
        background: var(--pm-surface-2);
        color: var(--pm-text);
        border: 1px solid var(--pm-border);
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pm-asist-btn-save {
        flex: 1.5;
        background: var(--pm-primary);
        color: #fff;
        border: none;
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(var(--pm-primary-rgb), 0.3);
        transition: all 0.2s;
      }
      .pm-asist-btn-obs:active, .pm-asist-btn-save:active { transform: scale(0.96); }
    </style>

    <!-- Overlay del Tour -->
    <div id="pm-tour-overlay" class="pm-tour-overlay">
      <div id="pm-tour-spotlight" class="pm-tour-spotlight"></div>
      <div id="pm-tour-tooltip" class="pm-tour-tooltip">
        <h4 id="pm-tour-title"></h4>
        <p id="pm-tour-body"></p>
        <div class="pm-tour-footer">
          <button id="pm-tour-skip" class="pm-tour-btn-skip">Saltar guía</button>
          <button id="pm-tour-next" class="pm-tour-btn-next">Siguiente</button>
        </div>
      </div>
    </div>

    <div class="pm-asist-root pm-animate-fade-in" style="position:relative; min-height:100vh; padding: 0;">
      ${f?`
        <div class="pm-conflict-banner">
          <i class="bi bi-exclamation-triangle"></i>
          <span>Sesión modificada externamente. Guardado como revisión.</span>
          <button id="pm-conflict-dismiss">&times;</button>
        </div>
      `:``}
      
      <div class="pm-asist-header">
        <button id="pm-asist-back" class="pm-icon-btn"><i class="bi bi-arrow-left"></i></button>
        <div style="flex:1">
          <h2 class="pm-asist-title">${k(n.nombre)}</h2>
          <p class="pm-asist-subtitle">
            ${p?`📍 ${k(p)} · `:``}
            ${r?`${be(r.hora_inicio)} – ${be(r.hora_fin)} · `:``}
            <span style="color:var(--pm-primary); font-weight:700;">${ge(new Date(c+`T12:00:00`))}</span> · 
            ${i.length} alumnos
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <button id="pm-btn-help" class="pm-help-btn" title="Guía rápida"><i class="bi bi-question-lg"></i></button>
          <div class="pm-asist-bulk-circles">
            <button id="btn-bulk-p" class="pm-bulk-circle p" title="Todos presentes">P</button>
            <button id="btn-bulk-a" class="pm-bulk-circle a" title="Todos ausentes">A</button>
          </div>
        </div>
      </div>

      <div class="pm-asist-content" style="padding: 0 1rem 160px;">
        <div class="pm-asist-progress-wrap" id="pm-progress-wrap" style="display:none; margin: 1rem 0;">
          <div class="pm-asist-progress-bar">
            <div class="pm-asist-progress-fill" id="pm-progress-fill"></div>
          </div>
          <span class="pm-asist-progress-label" id="pm-progress-label">0/${i.length}</span>
        </div>

        <div id="pm-asist-announce" role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden"></div>

        <div id="pm-alumnos-list" class="pm-alumnos-queue"></div>

        <div id="pm-planificacion-card" class="pm-planificacion-card" style="display:none; margin: 1rem 0;">
        <div id="pm-planificacion-header" class="pm-planificacion-header">
          <div class="pm-planificacion-header-left">
            <div class="pm-planificacion-icon-box">🗺️</div>
            <div class="pm-planificacion-info">
              <div class="pm-planificacion-label">Planificación Académica</div>
              <div id="pm-planificacion-nombre" class="pm-planificacion-nombre">Cargando...</div>
              <div id="pm-active-tema-badge" class="pm-active-tema-badge" style="display:none;"></div>
            </div>
          </div>
          <div class="pm-planificacion-actions">
            <button id="btn-manage-planning" class="pm-btn-circle" title="Ajustar Estructura">
              <i class="bi bi-gear-fill"></i>
            </button>
            <i class="bi bi-chevron-down pm-planificacion-toggle-btn"></i>
          </div>
        </div>
        <div id="pm-planificacion-dropdown" class="pm-planificacion-dropdown" style="display:none;">
          <div class="pm-planificacion-tabs-pill">
            <button class="pm-plan-tab-pill active" data-tab="rutas">Mis Rutas</button>
            <button class="pm-plan-tab-pill" data-tab="planificaciones">Biblioteca</button>
          </div>
          <div id="pm-plan-list-rutas" class="pm-plan-list"></div>
          <div id="pm-plan-list-planificaciones" class="pm-plan-list" style="display:none;"></div>
          
          <!-- EL ARBOL AHORA VIVE AQUI DENTRO -->
          <div id="pm-route-tree-container" class="pm-route-tree-dropdown-box"></div>
        </div>
      </div>

      <div class="pm-asist-dsl-section" style="margin-top:2rem;">
        <h3 class="pm-asist-section-title"><i class="bi bi-stars"></i> Registro de Clase</h3>
        <div id="pm-dsl-toolbar-container" style="margin-bottom:0.5rem;"></div>
        <div id="pm-dsl-editor-container"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.5rem;">
          <div id="pm-draft-indicator" style="display:none; padding:0.25rem 0.5rem; font-size:0.75rem; color:var(--pm-text-muted);"></div>
          <button class="pm-copy-plan-btn" id="btn-copy-as-plan" title="Copiar este contenido como borrador de planificación">
            <i class="bi bi-clipboard-plus"></i> Copiar como planificación
          </button>
        </div>
      </div>

      <div id="pm-academic-tools" style="margin-top:1.5rem; display:none;"></div>

      <!-- Barra de Acciones Fija (Por encima del menú inferior) -->
      <div class="pm-asist-actions-fixed">
        <button id="btn-guardar-obs" class="pm-asist-btn-obs" style="display:none;">
          <i class="bi bi-chat-left-text"></i> Observación
        </button>
        <button id="btn-guardar" class="pm-asist-btn-save">
          <i class="bi bi-cloud-upload"></i> Guardar sesión
        </button>
      </div>
    </div> <!-- Fin pm-asist-content -->
    </div>

    <!-- Modales... -->
  `;let ne=e.querySelector(`#pm-dsl-toolbar-container`),w=e.querySelector(`#pm-dsl-editor-container`),T=mr(w,{initialContent:d,onChange:e=>{S=e}});T.setContext({claseId:l});let re=_r(e,{onAceptar:e=>{T.setValue(e)}}),ae=fn(e,{onAccept:e=>{T.setValue(e)}}),oe=mn(ne,{onInsert:(e,t,n)=>T.insertText(e,t,n),getEditorContent:()=>T.getValue(),onLoading:e=>{},onIaProposal:async e=>{},onImproveClick:async e=>{let t=ne.querySelector(`#btn-generar-informe`);t&&(t.disabled=!0);try{let t=await we(e);re.open({original:e,improved:t})}catch(e){E.error(`Error al generar informe: `+e.message)}finally{t&&(t.disabled=!1)}},onStructureClick:async e=>{let t=ne.querySelector(`#btn-ia-magic`);t&&(t.disabled=!0);try{let t=C?.getActiveIndicador(),n=await Te(e,{presentes:i.filter(e=>a[e.id]===`P`).map(e=>e.nombre_completo),indicadorActivo:t?.nombre||null});ae.open({original:e,dsl:n})}catch(e){E.error(`Error al estructurar con IA: `+e.message)}finally{t&&(t.disabled=!1)}}}),se=null,ce=e.querySelector(`#pm-planificacion-card`),le=e.querySelector(`#pm-planificacion-dropdown`),ue=e.querySelector(`#pm-planificacion-nombre`);e.querySelector(`#pm-planificacion-detail`);let de=e.querySelector(`#pm-plan-list-rutas`),fe=e.querySelector(`#pm-plan-list-planificaciones`),pe=e.querySelector(`#pm-planificacion-header`);pe&&pe.addEventListener(`click`,()=>{let e=ce.classList.toggle(`open`);le.style.display=e?`block`:`none`}),e.querySelectorAll(`.pm-plan-tab-pill`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.pm-plan-tab-pill`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`);let n=t.dataset.tab;de.style.display=n===`rutas`?``:`none`,fe.style.display=n===`planificaciones`?``:`none`})});function me(t){se=t.id,localStorage.setItem(`pm_default_plan_${l}`,t.id),ue&&(ue.textContent=t.nombre||t.name||`Sin nombre`),fe.querySelectorAll(`.pm-plan-item`).forEach(e=>{e.classList.toggle(`active`,e.dataset.planId===t.id)}),C&&=(C.destroy(),null);let n=e.querySelector(`#pm-route-tree-container`),r=e.querySelector(`#pm-active-tema-badge`);se&&n&&(n.innerHTML=``,ke(l).then(e=>{C=Vr(n,{claseId:l,rutaId:se,completedTopics:e,onIndicadorSelect:e=>{T.insertText(`[${e.nombre}] `),oe.setContext({indicadorActivo:e.nombre}),r&&(r.textContent=e.nombre,r.style.display=`inline-block`),ce.classList.remove(`open`),le.style.display=`none`}}),_.push(()=>C.destroy())}))}let he=e.querySelector(`#btn-manage-planning`);he&&(he.onclick=e=>{if(e.stopPropagation(),!se){Ce.open({title:`Atención`,body:`<p>Seleccioná una planificación primero para poder gestionarla.</p>`,confirmText:`Entendido`,hideCancel:!0});return}Ce.open({title:`Gestionar Estructura: ${ue.textContent}`,size:`xl`,body:`<div id="modal-route-config-root"></div>`,saveText:`Cerrar y Actualizar`,onSave:async()=>(C&&C.refresh(),!0)});let t=document.getElementById(`modal-route-config-root`);t&&Or(t,se)}),ce&&(async()=>{try{let e=await W.getClasses(),t=localStorage.getItem(`pm_default_plan_${l}`),r=(n.instrumento||``).toLowerCase().split(`,`).map(e=>e.trim()),i=e.filter(e=>{if(e.id===t)return!0;let n=(e.nombre||``).toLowerCase();return r.some(e=>n.includes(e))});de&&(de.innerHTML=i.length?i.map(e=>`
              <div class="pm-plan-item ${e.id===t?`active`:``}" data-plan-id="${e.id}">
                <span class="pm-plan-item-icon">📍</span>
                <span class="pm-plan-item-name">${k(e.nombre||`Ruta sin nombre`)}</span>
                ${e.id===t?`<span class="pm-tree-badge">ACTIVA</span>`:``}
              </div>`).join(``):`<div style="padding:0.5rem;font-size:0.8rem;color:var(--pm-text-muted)">No hay planes sugeridos para este instrumento</div>`,de.querySelectorAll(`.pm-plan-item`).forEach(e=>{e.addEventListener(`click`,()=>{let t=i.find(t=>t.id===e.dataset.planId);t&&me(t)})})),fe&&(fe.innerHTML=e.map(e=>`
            <div class="pm-plan-item" data-plan-id="${e.id}">
              <span class="pm-plan-item-icon">📚</span>
              <span class="pm-plan-item-name">${k(e.nombre||e.name)}</span>
            </div>`).join(``),fe.querySelectorAll(`.pm-plan-item`).forEach(t=>{t.addEventListener(`click`,()=>{let n=e.find(e=>e.id===t.dataset.planId);n&&me(n)})})),ce.style.display=``;let a=e.find(e=>e.id===t)||i[0]||await W.resolveSmartPlan(n);a&&me(a)}catch(e){console.warn(`[asistencia] Error cargando planificación unificada:`,e)}})();let O=e.querySelector(`#btn-copy-as-plan`);O&&O.addEventListener(`click`,async()=>{let e=T.getValue();yr(`create`,null,await F(),[],{clase_id:l,maestro_id:s?.id||null,maestro_nombre:s?.nombre_completo||null,contenido:e||``,fecha_inicio:c},async e=>{try{await v({...e,estado:`planificado`});let t=document.createElement(`div`);t.className=`pm-toast-success`,t.innerHTML=`
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Planificación creada exitosamente
          `,document.body.appendChild(t),setTimeout(()=>t.remove(),3e3)}catch(e){console.error(`[asistencia] Error guardando planificación:`,e),E.error(`Error al guardar la planificación: `+(e.message||e))}})}),m&&(C=Vr(e.querySelector(`#pm-route-tree-container`),{claseId:l,rutaId:m,onIndicadorSelect:t=>{T.insertText(`[${t.nombre}] `),oe.setContext({indicadorActivo:t.nombre});let n=e.querySelector(`#btn-guardar-obs`);n&&(n.style.display=``)}}),_.push(()=>C.destroy())),console.log(`[DEBUG] Reached handoff section`);let _e=hi();if(_e&&_e.claseId===l){let t=`[${_e.nombre}] `;T.insertText(t),oe.setContext({indicadorActivo:_e.nombre});let n=e.querySelector(`#btn-guardar-obs`);n&&(n.style.display=``);let r=e.querySelector(`#pm-dsl-editor-container`);if(r){let e=document.createElement(`div`);e.style.cssText=`
        background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;
        padding:8px 12px;margin-bottom:8px;font-size:12px;color:#1d4ed8;
        display:flex;align-items:center;gap:8px;
      `,e.innerHTML=`
        <i class="bi bi-diagram-3"></i>
        Tema cargado desde Ruta: <strong>${_e.nombre.replace(/</g,`&lt;`)}</strong>
        <button onclick="this.parentElement.remove()" style="
          margin-left:auto;background:none;border:none;cursor:pointer;
          font-size:12px;color:#1d4ed8;
        ">✕</button>
      `,r.parentElement.insertBefore(e,r)}}let ve=null,ye=e.querySelector(`#pm-draft-indicator`);if(g){ve=ci({saveFn:async e=>{g&&await li(g,s.id,e)},debounceMs:3e4}),ve.onSaved(()=>{let e=new Date;ye.textContent=`Borrador guardado ${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`,ye.style.display=``}),T.getValue;let e=w.querySelector(`#pm-dsl-editable`);if(e){let t=e.oninput;e.oninput=function(e){t&&t.call(this,e),ve&&ve.onInput(T.getValue())}}_.push(()=>ve.destroy()),sesionExistenteData?.borrador===!0&&ui(g,s.id).then(e=>{if(e&&e.contenido_raw&&e.contenido_raw.trim()){let t=e.updated_at?new Date(e.updated_at).toLocaleString(`es-AR`):``;confirm(`Hay un borrador guardado${t?` (${t})`:``}.\n\n¿Deseas recuperarlo?`)?(T.setValue(e.contenido_raw),S=e.contenido_raw):di(e.id).catch(e=>console.warn(`[autoDraft] Error discarding:`,e))}}).catch(e=>console.warn(`[autoDraft] Error loading draft:`,e))}e.querySelector(`#pm-academic-tools`);let A=e.querySelector(`#btn-guardar-obs`);A&&(m&&(A.style.display=``),A.onclick=async()=>{let t=T.getValue();if(!t||!t.trim()){E.warning(`El editor está vacío. Escribe observaciones antes de guardar.`);return}if(!g){E.warning(`Primero guarda la sesión (asistencia) para poder registrar observaciones.`);return}let r=null,o=await Ae(t),c=C?.getActiveIndicador();if(r=o||c,!r){E.warning(`Seleccione un indicador en la ruta antes de guardar la observación o escríbalo entre corchetes [Ejemplo].`);return}let u=e.querySelector(`#pm-active-tema-badge`);u&&r.nombre&&(u.textContent=r.nombre,u.style.display=`inline-block`),A.disabled=!0,A.textContent=`Procesando...`;try{let e=i.filter(e=>a[e.id]===`P`),o=await Jr(t,r.id,e,r.nombre);if(o.error)throw Error(o.error);if(o.modo===`natural`&&o.dslGenerado&&!confirm(`📝 Texto convertido a formato estructurado:

`+o.dslGenerado+`

¿Guardar la evaluación?`)){A.disabled=!1,A.textContent=`Guardar observación`;return}if(o.missing.length>0&&!confirm(`Faltan ${o.missing.length} alumno(s) sin evaluar:\n${o.missing.join(`, `)}\n\n¿Guardar de todas formas?`)){A.disabled=!1,A.textContent=`Guardar observación`;return}if(o.evaluaciones.length>0){let{error:e}=await Kr(g,r.id,o.evaluaciones,s.id);if(e)throw e}let c={indicador_id:r.id,evaluaciones:o.evaluaciones};await fi(g,s.id,t,c,o.dslGenerado||null);let u=await Si(g,l,s.id,o.evaluaciones,n.nombre||`Clase`);u.success||console.warn(`[Fase C] Fallo parcial en promoción:`,u.error),C&&await C.refresh(),T.setValue(``),S=``;let d=document.createElement(`div`);d.innerHTML=`
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <span>✅ Observación guardada exitosamente (${o.evaluaciones.length} eval.)</span>
            <span style="font-size:0.85em; opacity:0.9;">Tema detectado: <b>${r.nombre}</b></span>
          </div>
        `,d.style.cssText=`position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--pm-surface, #1e1e1e);color:#fff;padding:12px 24px;border-radius:12px;z-index:10000;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.3); border: 1px solid var(--apple-success, #22c55e);`,document.body.appendChild(d),setTimeout(()=>d.remove(),4500),A.textContent=`¡Guardado!`,setTimeout(()=>{A.textContent=`Guardar observación`,A.disabled=!1},2e3)}catch(e){console.error(`[asistencia] Error saving observation:`,e),E.error(`Error al guardar: `+(e.message||e)),A.disabled=!1,A.textContent=`Guardar observación`}});let xe=null,Se=e.querySelector(`#pm-alumnos-list`);function j(e=null){let t=Ei(i,a),n=null;if(e){let t=Se.querySelector(`[data-id="${e}"]`);t&&(n=t.getBoundingClientRect())}if(Se.innerHTML=t.map(e=>Ee(e,a[e.id])).join(``),e&&n){let t=Se.querySelector(`[data-id="${e}"]`),r=t.getBoundingClientRect(),i=n.top-r.top;t.animate([{transform:`translateY(${i}px)`,opacity:.7},{transform:`translateY(0)`,opacity:1}],{duration:300,easing:`cubic-bezier(0.4, 0, 0.2, 1)`})}}function Ee(e,t){return`
      <div class="pm-asist-item ${t?`estado-${t.toLowerCase()}`:``}" data-id="${e.id}">
        <div class="pm-asist-avatar">${e.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${k(e.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${k(e.instrumento_principal||`—`)}</span>
        </div>
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${t===`P`?`active-p`:``}" data-action="P" data-id="${e.id}">P</button>
          <button class="pm-asist-btn ${t===`J`?`active-j`:``}" data-action="J" data-id="${e.id}">J</button>
          <button class="pm-asist-btn ${t===`A`?`active-a`:``}" data-action="A" data-id="${e.id}">A</button>
        </div>
    </div>
    `}Se.onclick=async t=>{let n=t.target.closest(`.pm-asist-btn`),o=t.target.closest(`.pm-asist-nombre`);if(o){let t=o.closest(`.pm-asist-item`).dataset.id,n=i.find(e=>e.id===t);if(m){xe&&xe.destroy(),xe=si({alumno:n,rutaId:m,sessionId:g,claseId:l,fecha:c,horaInicio:r?.hora_inicio||null}),xe.open(),_.push(()=>{xe&&xe.destroy()});return}let a=u.filter(e=>e.student_id===t);if(a.length===0)try{let{academicService:e}=await D(async()=>{let{academicService:e}=await import(`./academicService-DX1WEsMf.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2,3])),n=await e.createSnapshotForStudent(g,t,c);n?(a=n,u.push(...n)):console.warn(`No se encontró planificación activa para el alumno ${t}`)}catch(e){console.error(`Error creando snapshot on-demand:`,e)}gr(e,{student:n,sessionId:g,teacherId:s.id,snapshots:a});return}if(!n)return;let{id:d,action:f}=n.dataset;if(window.navigator.vibrate&&window.navigator.vibrate(10),f===`J`){let e=i.find(e=>e.id===d);if(!e)return;if(a[d]===`J`){if(g){let e=await bi(g,d);if(e?.id){if(e.evidencia_url){let t=e.evidencia_url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);t&&x.storage.from(`documentos`).remove([t[1]]).catch(()=>{})}xi(e.id).catch(console.warn)}}a[d]=null,j(d),De(),await M(!0),At(`Justificación eliminada para ${e.nombre_completo}.`)}else{a[d]=`J`,j(d),De(),await M(!0);let t=null;g&&(t=await bi(g,d)),h.open(e,t,null),At(`Justificación marcada para ${e.nombre_completo}.`)}return}a[d]=a[d]===f?null:f,j(d),De();let p=Object.values(a).filter(e=>e===`P`).length,v=Object.values(a).filter(e=>e===`A`).length,y=Object.values(a).filter(e=>e===`J`).length;At(`Asistencia actualizada. ${p} presentes, ${v} ausentes, ${y} justificados.`),await M(!0)};function De(){let t=i.length,n=Object.values(a).filter(e=>e!==null).length,r=e.querySelector(`#pm-progress-wrap`),o=e.querySelector(`#pm-progress-fill`),s=e.querySelector(`#pm-progress-label`);if(n===0){r.style.display=`none`;return}r.style.display=`flex`,o.style.width=`${n/t*100}%`,s.textContent=`${n}/${t}`}async function M(e=!1,t=!1){ee&&clearTimeout(ee);let n=async()=>{let e=i.filter(e=>a[e.id]).map(e=>({alumno_id:e.id,estado:a[e.id]})),t={clase_id:l,maestro_id:s.id,fecha:c,estado:`pendiente`,borrador:!0,asistencia:e||[],contenido:S||``};if(navigator.onLine)try{if(g){let{error:e}=await x.from(`sesiones_clase`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,g);if(!e){localStorage.setItem(`${b}_updated`,new Date().toISOString());return}throw e}else{let{data:e,error:n}=await x.from(`sesiones_clase`).insert([t]).select(`id`).single();if(!n&&e){g=e.id,console.log(`[asistencia] Nueva sesión creada:`,g),localStorage.setItem(`${b}_updated`,new Date().toISOString());return}throw n||Error(`No se pudo crear la sesión`)}}catch(e){console.warn(`[asistencia] Fallo operación directa, usando cola offline:`,e.message)}await ie({tabla:`sesiones_clase`,operacion:g?`update`:`insert`,payload:{...g?{id:g}:{},...t}}),localStorage.setItem(`${b}_updated`,new Date().toISOString())};e?t?await n():await te.run(n):ee=setTimeout(()=>{te.run(n).catch(e=>console.error(`[asistencia] Autosave error:`,e))},2e3)}e.querySelector(`#btn-guardar`).onclick=async()=>{let t=e.querySelector(`#btn-guardar`),r=t.textContent;t.textContent=`Guardando...`,t.disabled=!0,await te.run(async()=>{try{let r=i.filter(e=>a[e.id]).map(e=>({clase_id:l,alumno_id:e.id,fecha:c,estado:a[e.id],registrado_por:s.id})),o=r.length>0,u=S&&S.trim().length>0;if(!o&&!u)throw Error(`Debes marcar asistencia o agregar contenido para guardar`);if(await M(!0,!0),!g){let{data:e}=await x.from(`sesiones_clase`).select(`id`).eq(`clase_id`,l).eq(`maestro_id`,s.id).eq(`fecha`,c).maybeSingle();e&&(g=e.id)}if(o)try{let e=r.map(e=>({...e,...g&&{sesion_clase_id:g}}));await y(e),console.log(`[asistencia] Registradas asistencias individuales:`,e.length)}catch(e){throw console.error(`[asistencia] Error registrando asistencias en bulk:`,e),Error(`No se pudieron registrar las asistencias individuales: `+e.message)}if(g&&(o||u)){let e=i.filter(e=>a[e.id]).map(e=>({alumno_id:e.id,estado:a[e.id]})),{error:t}=await x.from(`sesiones_clase`).update({borrador:!1,estado:`registrada`,asistencia:e,contenido:S||``,updated_at:new Date().toISOString()}).eq(`id`,g).select();if(t){console.warn(`estado "registrada" no permitido, usando fallback "cerrada":`,t.message);let{error:n}=await x.from(`sesiones_clase`).update({borrador:!1,estado:`cerrada`,asistencia:e,contenido:S||``,updated_at:new Date().toISOString()}).eq(`id`,g).select();n&&(console.warn(`Fallback "cerrada" también falló, actualizando solo borrador:`,n.message),await x.from(`sesiones_clase`).update({borrador:!1,asistencia:e,contenido:S||``,updated_at:new Date().toISOString()}).eq(`id`,g))}Ot(),zr(`hoy`),zr(`calendario`),zr(`metricas`)}if(g){let{academicService:n}=await D(async()=>{let{academicService:e}=await import(`./academicService-DX1WEsMf.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2,3])),{createAchievementsSummaryModal:r}=await D(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-D1ugzeQx.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([4,5])),i=await n.processSessionClosure(g);i&&i.length>0&&(t.textContent=`¡Logros detectados!`,t.style.background=`var(--pm-success)`,await r(e,i))}else console.warn(`[asistencia] No se pudo obtener sesionId para procesar logros.`);t.textContent=`✓ Guardado`,t.style.background=`var(--apple-success)`;let d=Object.values(a).filter(e=>e===`P`).length,f=Object.values(a).filter(e=>e===`A`).length;At(`Sesión guardada exitosamente. ${d} presentes, ${f} ausentes.`);let p=document.createElement(`div`);if(p.className=`pm-saved-overlay`,p.innerHTML=`
        <div class="pm-saved-options">
          <div class="pm-saved-header">
            <div class="pm-saved-check-anim">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3>Sesión Guardada</h3>
            <p>¿Qué deseas hacer ahora?</p>
          </div>
          <div class="pm-saved-actions">
            <button class="pm-btn pm-btn-secondary" id="btn-editar-asistencia">
              <i class="bi bi-pencil"></i> Editar Asistencia
            </button>
            <button class="pm-btn pm-btn-outline" id="btn-compartir-correo">
              <i class="bi bi-envelope"></i> Compartir por Correo
            </button>
            <button class="pm-btn pm-btn-success" id="btn-compartir-whatsapp">
              <i class="bi bi-whatsapp"></i> Compartir por WhatsApp
            </button>
          </div>
          <div class="pm-saved-nav">
            <button class="pm-saved-nav-btn" id="btn-volver-hoy" title="Volver a Hoy">
              <i class="bi bi-arrow-left-circle"></i>
            </button>
            <button class="pm-saved-nav-btn" id="btn-ir-calendario" title="Ir al Calendario">
              <i class="bi bi-calendar3"></i>
            </button>
          </div>
        </div>
      `,e.querySelector(`.pm-asist-root`).appendChild(p),!document.getElementById(`pm-saved-styles`)){let e=document.createElement(`style`);e.id=`pm-saved-styles`,e.textContent=`
          .pm-saved-overlay {
            position: absolute;
            inset: 0;
            background: var(--pm-bg, #0f1923);
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pmSavedFadeIn 0.35s ease;
          }
          .pm-saved-options { text-align: center; padding: 2rem 1.5rem; width: 100%; max-width: 380px; }
          .pm-saved-header { margin-bottom: 2rem; }
          .pm-saved-check-anim i {
            font-size: 3rem;
            color: var(--pm-success, #22c55e);
            animation: pmSavedPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .pm-saved-header h3 { margin: 1rem 0 0.5rem; font-size: 1.5rem; font-weight: 700; }
          .pm-saved-header p { color: var(--pm-text-muted); margin: 0; font-size: 0.95rem; }
          .pm-saved-actions { display: flex; flex-direction: column; gap: 0.75rem; margin: 0 auto 2rem; }
          .pm-saved-nav {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--pm-border, rgba(255,255,255,0.08));
          }
          .pm-saved-nav-btn {
            background: none;
            border: none;
            color: var(--pm-text-muted, #888);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.75rem;
            border-radius: 50%;
            transition: all 0.2s ease;
          }
          .pm-saved-nav-btn:hover {
            color: var(--pm-primary, #007aff);
            background: rgba(0, 122, 255, 0.08);
            transform: scale(1.1);
          }
          @keyframes pmSavedFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pmSavedPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        `,document.head.appendChild(e)}let m=p.querySelector(`#btn-editar-asistencia`),h=p.querySelector(`#btn-compartir-correo`),_=p.querySelector(`#btn-compartir-whatsapp`),v=p.querySelector(`#btn-volver-hoy`),b=p.querySelector(`#btn-ir-calendario`);m&&(m.onclick=()=>{p.remove(),t.textContent=`Guardar sesión`,t.style.background=``,t.disabled=!1,t.style.display=``}),h&&(h.onclick=async()=>{let e=i.filter(e=>a[e.id]).map(e=>({alumno_id:e.id,estado:a[e.id]})),t=encodeURIComponent(`Reporte de Clase - ${n.nombre} - ${c}`),r=encodeURIComponent(Oe(e,S,i,n));window.open(`mailto:?subject=${t}&body=${r}`,`_blank`)}),_&&(_.onclick=async()=>{let e=i.filter(e=>a[e.id]).map(e=>({alumno_id:e.id,estado:a[e.id]})),t=encodeURIComponent(Oe(e,S,i,n));window.open(`https://wa.me/?text=${t}`,`_blank`)}),v&&(v.onclick=()=>{window.location.hash=`#/hoy`}),b&&(b.onclick=()=>{window.location.hash=`#/calendario`})}catch(e){console.error(`Error al guardar sesión:`,e),t.textContent=e.message||`Error al guardar`,t.style.background=`var(--pm-danger)`,t.disabled=!1,setTimeout(()=>{t.textContent=r,t.style.background=``},3e3)}})};function Oe(e,t,n,r){let i=e.filter(e=>e.estado===`P`).length,a=e.filter(e=>e.estado===`A`).length,o=e.filter(e=>e.estado===`J`).length,s=`Reporte de Clase - ${r.nombre}\n`;return s+=`Fecha: ${c}\n`,s+=`Instrumento: ${r.instrumento||`N/A`}\n\n`,s+=`RESUMEN DE ASISTENCIA
`,s+=`Presentes: ${i} | Ausentes: ${a} | Justificados: ${o}\n\n`,t&&t.trim()&&(s+=`CONTENIDO DE LA CLASE:\n${t}\n\n`),s+=`DETALLE DE ALUMNOS:
`,e.forEach(e=>{let t=n.find(t=>t.id===e.alumno_id)?.nombre_completo||`Alumno`,r=e.estado===`P`?`Presente`:e.estado===`A`?`Ausente`:`Justificado`;s+=`- ${t}: ${r}\n`}),s}e.querySelector(`#pm-asist-back`).onclick=()=>{_.forEach(e=>{try{e()}catch{}}),window.location.hash=`#/hoy`},e.querySelector(`#btn-bulk-p`).onclick=async()=>{i.forEach(e=>{a[e.id]=`P`}),j(),De(),await M(!0),At(`Todos los ${i.length} alumnos marcados como presentes.`)},e.querySelector(`#btn-bulk-a`).onclick=async()=>{i.forEach(e=>{a[e.id]=`A`}),j(),De(),await M(!0),At(`Todos los ${i.length} alumnos marcados como ausentes.`)},j();async function ke(e){try{let{data:t}=await x.from(`sesiones_clase`).select(`contenido`).eq(`clase_id`,e).not(`contenido`,`is`,null);if(!t)return[];let n=new Set,r=/\[(.*?)\]/g;return t.forEach(e=>{if(!e.contenido)return;let t;for(;(t=r.exec(e.contenido))!==null;)t[1]&&n.add(t[1].trim())}),Array.from(n)}catch(e){return console.warn(`[AsistenciaView] Error calculando progreso histórico:`,e),[]}}async function Ae(e){if(!e||!se)return null;let t=e.match(/\[(.*?)\]/);if(!t||!t[1])return null;let n=t[1].trim().toLowerCase(),r=e=>{let t=[`se`,`hizo`,`la`,`el`,`los`,`las`,`un`,`una`,`de`,`del`,`en`,`con`,`por`,`para`,`y`,`o`,`tema`,`indicador`];return e.toLowerCase().replace(/[^\w\sáéíóúñ]/g,``).split(/\s+/).filter(e=>e.length>2&&!t.includes(e))},i=r(n);if(i.length===0)return null;try{let e=await W.getRouteHierarchy(se),t=null,a=0;for(let o of e)for(let e of o.plan_temas||[])for(let o of e.plan_objetivos||[]){let e=r(o.nombre),s=0;for(let t of i)e.some(e=>e.includes(t)||t.includes(e))&&s++;o.nombre.toLowerCase().includes(n)&&(s+=5);let c=s/(e.length||1);s>0&&c>a&&(a=c,t={id:o.id,nombre:o.nombre})}if(t)return console.log(`[asistencia] Indicador auto-resuelto con fuzzy match: '${t.nombre}' (Score: ${a.toFixed(2)})`),t}catch(e){console.warn(`[asistencia] Error en auto-resolución de indicador:`,e)}return null}let je=[{target:`.pm-asist-header`,title:`📍 Cabecera de Clase`,body:`Aquí puede ver los datos de la clase, el salón y la fecha. Es su panel de control principal.`},{target:`.pm-asist-bulk-circles`,title:`👥 Asistencia Rápida`,body:`¿Asistieron todos? Presione "P" para marcar a todos los alumnos como presentes en un solo clic.`},{target:`#pm-alumnos-list`,title:`🙋‍♂️ Lista de Alumnos`,body:`Presione el círculo de cada alumno para cambiar entre Presente, Ausente o Retraso.`},{target:`#pm-planificacion-card`,title:`🗺️ Planificación Académica`,body:`Seleccione una Ruta o busque en la Biblioteca. Los temas que ya impartió aparecerán con un check ✅ verde.`},{target:`#pm-dsl-toolbar-container`,title:`🛠️ Caja de Herramientas`,body:`Use el micrófono 🎤 para dictar la clase, o el botón de IA ✨ para mejorar y profesionalizar su redacción automáticamente.`},{target:`#pm-dsl-editor-container`,title:`✍️ Escritura Inteligente (DSL)`,body:`Use [Corchetes] para vincular temas de la planificación y asteriscos * para puntos clave. La IA le ayudará a darle formato profesional.`},{target:`#btn-guardar`,title:`💾 Guardar Sesión`,body:`Al finalizar, no olvide guardar su sesión para que el progreso de los alumnos se registre en el sistema.`}],Me=0,Ne=e.querySelector(`#pm-tour-overlay`),Pe=e.querySelector(`#pm-tour-spotlight`),Fe=e.querySelector(`#pm-tour-tooltip`),Ie=e.querySelector(`#pm-tour-title`),Le=e.querySelector(`#pm-tour-body`),Re=e.querySelector(`#pm-tour-next`),ze=e.querySelector(`#pm-tour-skip`);function Be(){Me=0,Ne.style.display=`block`,setTimeout(()=>Ne.style.opacity=`1`,10),Ve(0)}function Ve(t){let n=je[t],r=e.querySelector(n.target);if(!r){He();return}r.scrollIntoView({behavior:`smooth`,block:`center`});let i=r.getBoundingClientRect(),a=window.scrollY;Pe.style.width=`${i.width+20}px`,Pe.style.height=`${i.height+20}px`,Pe.style.top=`${i.top+a-10}px`,Pe.style.left=`${i.left-10}px`,Ie.innerHTML=`<span>${n.title}</span>`,Le.textContent=n.body,Re.textContent=t===je.length-1?`Finalizar`:`Siguiente`;let o=i.bottom+a+20;o+200>document.documentElement.scrollHeight&&(o=i.top+a-220),Fe.style.top=`${o}px`,Fe.style.left=`${Math.max(10,Math.min(window.innerWidth-300,i.left))}px`}function He(){Me++,Me<je.length?Ve(Me):Ue()}function Ue(){Ne.style.opacity=`0`,setTimeout(()=>{Ne.style.display=`none`,localStorage.setItem(`pm_tour_completed`,`true`)},300)}Re.onclick=He,ze.onclick=Ue;let We=e.querySelector(`#pm-btn-help`);return We&&(We.onclick=Be),localStorage.getItem(`pm_tour_completed`)||setTimeout(Be,1500),()=>{console.log(`[AsistenciaView] Cleanup ejecutado por el Router`),_.forEach(e=>{try{e()}catch{}})}}function Ei(e,t){return[...e].sort((e,n)=>{let r=t[e.id]!==null,i=t[n.id]!==null;return!r&&i?-1:r&&!i?1:0})}function Di(e,{alumnos:t=[],onSelect:n}){let r=document.getElementById(`pm-alumno-picker-modal`);r||(r=document.createElement(`div`),r.id=`pm-alumno-picker-modal`,r.className=`pm-modal-overlay`,r.innerHTML=`
      <div class="pm-modal-content">
        <div class="pm-modal-header">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Mencionar Alumnos</h3>
          <button class="pm-modal-close" id="pm-picker-close">&times;</button>
        </div>
        <div class="pm-modal-body" style="max-height: 300px; overflow-y: auto;">
          <div id="pm-picker-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <!-- Lista de alumnos con checkboxes -->
          </div>
        </div>
        <div class="pm-modal-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border);">
          <button class="pm-btn pm-btn-primary" id="pm-picker-insert">Insertar Menciones</button>
        </div>
      </div>
    `,document.body.appendChild(r));let i=r.querySelector(`#pm-picker-list`),a=r.querySelector(`#pm-picker-close`),o=r.querySelector(`#pm-picker-insert`);function s(){i.innerHTML=t.map(e=>`
      <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--pm-surface-2);">
        <input type="checkbox" class="pm-alumno-check" value="${e.nombre_completo.replace(/\s+/g,``)}" data-id="${e.id}">
        <span style="font-size: 0.9rem;">${e.nombre_completo}</span>
      </label>
    `).join(``)}function c(){s(),r.classList.add(`open`)}function l(){r.classList.remove(`open`)}return a.onclick=l,o.onclick=()=>{let e=Array.from(r.querySelectorAll(`.pm-alumno-check:checked`)).map(e=>`#${e.value}`);e.length>0&&n(e.join(`, `)+` `),l()},{open:c,close:l}}async function Oi(e,{maestroId:t}){e.innerHTML=`
    <div style="padding-bottom: 2rem;">
      <h2 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem;">Crear Clase Emergente</h2>
      
      <div class="pm-card" style="padding: 1rem;">
        <div class="mb-3">
          <label class="pm-label">Fecha</label>
          <input type="date" id="eme-fecha" class="pm-input" value="${new URLSearchParams(window.location.hash.split(`?`)[1]||``).get(`fecha`)||new Date().toISOString().split(`T`)[0]}">
        </div>

        <div class="mb-3">
          <label class="pm-label">Motivo de la Clase</label>
          <select id="eme-motivo" class="pm-input">
            <option value="suplencia">Suplencia de maestro</option>
            <option value="eventual">Actividad eventual</option>
            <option value="reforzamiento">Reforzamiento académico</option>
            <option value="otro">Otro motivo</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="pm-label">Nombre de la Clase / Instrumento</label>
          <input type="text" id="eme-nombre" class="pm-input" placeholder="Ej: Refuerzo de Violín I">
        </div>

        <div class="mb-3">
          <label class="pm-label">Alumnos Participantes</label>
          <div id="eme-alumnos-chips" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
            <span style="color:var(--pm-text-muted); font-size:0.8rem;">Ningún alumno seleccionado</span>
          </div>
          <button class="pm-btn" id="btn-eme-pick-alumnos" style="width:auto; padding:0.5rem 1rem; font-size:0.8rem; border:1px solid var(--pm-primary); color:var(--pm-primary);">
            + Seleccionar Alumnos
          </button>
        </div>

        <div class="mb-4">
          <label class="pm-label">Contenido / Observaciones</label>
          <textarea id="eme-contenido" class="pm-input" rows="3" placeholder="¿Qué se dio en esta clase?"></textarea>
        </div>

        <button class="pm-btn pm-btn-primary" id="btn-eme-guardar">Guardar y Continuar a Asistencia</button>
      </div>
    </div>
  `,e.querySelector(`#eme-alumnos-chips`);let n=[];try{let{data:e}=await x.from(`alumnos_clases`).select(`alumno:alumnos(id, nombre_completo)`).eq(`activo`,!0);n=(e||[]).map(e=>e.alumno).filter(Boolean)}catch(e){console.error(e)}let r=Di(e,{alumnos:n,onSelect:e=>{alert(`Alumnos seleccionados correctamente`)}});e.querySelector(`#btn-eme-pick-alumnos`).onclick=()=>r.open(),e.querySelector(`#btn-eme-guardar`).onclick=async()=>{let n={maestro_id:t,fecha:e.querySelector(`#eme-fecha`).value,motivo:e.querySelector(`#eme-motivo`).value,nombre_clase:e.querySelector(`#eme-nombre`).value,contenido:e.querySelector(`#eme-contenido`).value,created_at:new Date().toISOString()};if(!n.nombre_clase){alert(`Por favor ingresa un nombre para la clase.`);return}await ie({tabla:`clases_emergentes`,operacion:`insert`,payload:n}),alert(`Clase emergente registrada. Redirigiendo...`),window.location.hash=`#/hoy`}}var ki={async open(){let e=await me(),t=await fe();Ce.open({title:`Notificaciones`,size:`md`,body:this._renderBody(e,t),saveText:`Hecho`,onShow:e=>this._initLogic(e),onSave:async e=>(await this._handleSave(e),!0)})},_renderBody(e,t){return`
      <div class="pm-notif-config pm-fade-in">
        <p class="apple-caption mb-4">Gestiona cómo y cuándo quieres recibir las alertas del sistema SOI.</p>

        <!-- Grupo 1: Estado General -->
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-primary">
              <i class="bi bi-broadcast"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Alertas Push</span>
              <span class="pm-settings-row__desc">Habilitar en este dispositivo</span>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-push" ${t?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Grupo 2: Recordatorios de Clase -->
        <div class="pm-settings-label">RECORDATORIOS DE CLASE</div>
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-warning">
              <i class="bi bi-clock-history"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Antes de empezar</span>
              <select id="modal-notif-min-antes" class="pm-apple-select-inline">
                <option value="5" ${e.min_antes_clase===5?`selected`:``}>5 min</option>
                <option value="15" ${e.min_antes_clase===15?`selected`:``}>15 min</option>
                <option value="30" ${e.min_antes_clase===30?`selected`:``}>30 min</option>
              </select>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-pre" ${e.alerta_pre_clase?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>

          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-danger">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Pase de lista pendiente</span>
              <select id="modal-notif-min-post" class="pm-apple-select-inline">
                <option value="30" ${e.min_post_clase_sin_registro===30?`selected`:``}>30 min</option>
                <option value="60" ${e.min_post_clase_sin_registro===60?`selected`:``}>1 hora</option>
              </select>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-post" ${e.alerta_post_clase?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <!-- Grupo 3: Otras Alertas -->
        <div class="pm-settings-label">OTRAS ALERTAS</div>
        <div class="pm-settings-group">
          <div class="pm-settings-row">
            <div class="pm-settings-row__icon bg-info">
              <i class="bi bi-calendar-check"></i>
            </div>
            <div class="pm-settings-row__info">
              <span class="pm-settings-row__title">Resumen de 24 horas</span>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="modal-notif-24h" ${e.alerta_24h?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </div>
        </div>

        <div class="mt-4">
          <button class="btn-apple-secondary w-100" id="modal-notif-test">
            <i class="bi bi-send me-2"></i> Enviar prueba de diagnóstico
          </button>
        </div>

        <style>
          .pm-settings-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: var(--pm-text-muted);
            margin: 1.5rem 0 0.5rem 0.5rem;
            letter-spacing: 0.05em;
          }
          .pm-settings-group {
            background: var(--pm-surface-2);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--pm-border);
          }
          .pm-settings-row {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 1rem;
            border-bottom: 1px solid var(--pm-border);
          }
          .pm-settings-row:last-child { border-bottom: none; }
          .pm-settings-row__icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.1rem;
            flex-shrink: 0;
          }
          .pm-settings-row__info { flex: 1; min-width: 0; }
          .pm-settings-row__title { display: block; font-size: 0.95rem; font-weight: 500; color: var(--pm-text); }
          .pm-settings-row__desc { display: block; font-size: 0.75rem; color: var(--pm-text-muted); }
          
          .pm-apple-select-inline {
            background: transparent;
            border: none;
            color: var(--pm-primary);
            font-size: 0.85rem;
            font-weight: 600;
            padding: 0;
            cursor: pointer;
            outline: none;
          }
          
          /* Switch iOS Style */
          .pm-apple-switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
            flex-shrink: 0;
          }
          .pm-apple-switch input { opacity: 0; width: 0; height: 0; }
          .pm-apple-switch-slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background-color: var(--pm-border);
            transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 24px;
          }
          .pm-apple-switch-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          input:checked + .pm-apple-switch-slider { background-color: var(--pm-success); }
          input:checked + .pm-apple-switch-slider:before { transform: translateX(20px); }
        </style>
      </div>
    `},_initLogic(e){e.querySelector(`#modal-notif-test`).addEventListener(`click`,async()=>{await se()||window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Primero activa las notificaciones`,type:`warning`}}))});let t=e.querySelector(`#modal-notif-push`);t.addEventListener(`change`,async()=>{if(t.checked,t.checked){let e=await he();e.success?this._toast(`Notificaciones activadas`,`success`):(t.checked=!1,this._toast(e.error||`Error al suscribir`,`danger`))}else (await ce()).success&&this._toast(`Notificaciones desactivadas`,`info`)})},async _handleSave(e){await oe({alerta_pre_clase:e.querySelector(`#modal-notif-pre`).checked,min_antes_clase:parseInt(e.querySelector(`#modal-notif-min-antes`).value,10),alerta_post_clase:e.querySelector(`#modal-notif-post`).checked,min_post_clase_sin_registro:parseInt(e.querySelector(`#modal-notif-min-post`).value,10),alerta_24h:e.querySelector(`#modal-notif-24h`).checked,alerta_48h:!0}),this._toast(`Preferencias guardadas`,`success`)},_toast(e,t){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:t}}))}};function Ai(){let e=!1,t=null,n=document.createElement(`div`);n.id=`registrar-alumno-modal`,n.className=`modal modal-fade`,n.setAttribute(`role`,`dialog`),n.setAttribute(`aria-labelledby`,`registrar-alumno-title`),n.innerHTML=`
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-apple-primary text-white border-0">
          <h5 class="modal-title" id="registrar-alumno-title">
            <i class="bi bi-person-plus-fill"></i> Registrar Nuevo Alumno
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <form id="registrar-alumno-form">
            <div class="mb-3">
              <label for="alumno-nombre" class="form-label">Nombre Completo *</label>
              <input
                type="text"
                class="form-control"
                id="alumno-nombre"
                placeholder="Ej: Juan Pérez"
                required
              />
              <div class="form-text text-danger d-none" id="alumno-nombre-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-apellido" class="form-label">Apellido *</label>
              <input
                type="text"
                class="form-control"
                id="alumno-apellido"
                placeholder="Ej: González"
                required
              />
              <div class="form-text text-danger d-none" id="alumno-apellido-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-email" class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                id="alumno-email"
                placeholder="alumno@example.com"
              />
              <div class="form-text text-danger d-none" id="alumno-email-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-dni" class="form-label">DNI</label>
              <input
                type="text"
                class="form-control"
                id="alumno-dni"
                placeholder="Ej: 12345678"
              />
              <div class="form-text text-danger d-none" id="alumno-dni-error"></div>
            </div>

            <div class="mb-3">
              <label for="alumno-estado" class="form-label">Estado *</label>
              <select class="form-select" id="alumno-estado" required>
                <option value="">-- Seleccionar estado --</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="egresado">Egresado</option>
              </select>
              <div class="form-text text-danger d-none" id="alumno-estado-error"></div>
            </div>
          </form>

          <div id="registrar-alumno-error" class="alert alert-danger d-none mt-3" role="alert">
            <i class="bi bi-exclamation-circle"></i>
            <span id="registrar-alumno-error-message"></span>
          </div>
        </div>

        <div class="modal-footer border-0">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-apple-primary" id="btn-registrar-alumno">
            <i class="bi bi-check-circle"></i> Registrar
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(n);let r=n.querySelector(`#registrar-alumno-form`),i=n.querySelector(`#btn-registrar-alumno`),a=n.querySelector(`#registrar-alumno-error`),o=n.querySelector(`#registrar-alumno-error-message`);i.addEventListener(`click`,async()=>{if(!r.checkValidity()){r.reportValidity();return}await s()});async function s(){let e=``;try{i.disabled=!0,e=i.innerHTML,i.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Registrando...`;let o={nombre:n.querySelector(`#alumno-nombre`).value.trim(),apellido:n.querySelector(`#alumno-apellido`).value.trim(),correo:n.querySelector(`#alumno-email`).value.trim()||null,dni:n.querySelector(`#alumno-dni`).value.trim()||null,estado:n.querySelector(`#alumno-estado`).value,creado_por:t,creado_en:new Date().toISOString()};if(!o.nombre||!o.apellido||!o.estado)throw Error(`Por favor completa los campos requeridos`);let{data:s,error:c}=await x.from(`alumnos`).insert([o]).select().single();if(c)throw c;r.reset(),a.classList.add(`d-none`),window.dispatchEvent(new CustomEvent(`alumno-registrado`,{detail:{alumno:s}})),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Alumno "${o.nombre} ${o.apellido}" registrado exitosamente`,type:`success`}})),bootstrap.Modal.getInstance(n)?.hide()}catch(e){console.error(`[registrarAlumnoModal] Error:`,e),o.textContent=e.message||`Error al registrar el alumno`,a.classList.remove(`d-none`)}finally{i.disabled=!1,e&&(i.innerHTML=e)}}return{show(r){t=r,new bootstrap.Modal(n).show(),e=!0,setTimeout(()=>{n.querySelector(`#alumno-nombre`).focus()},200)},hide(){bootstrap.Modal.getInstance(n)?.hide(),e=!1},destroy(){n.remove()},isOpen(){return e}}}function ji(){let e=!1,t=null,n=[],r=document.createElement(`div`);r.id=`gestionar-clases-modal`,r.className=`modal modal-fade`,r.setAttribute(`role`,`dialog`),r.setAttribute(`aria-labelledby`,`gestionar-clases-title`),r.innerHTML=`
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-apple-primary text-white border-0">
          <h5 class="modal-title" id="gestionar-clases-title">
            <i class="bi bi-mortarboard-fill"></i> Gestionar Clases
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <!-- Tabs para listar y crear -->
          <ul class="nav nav-tabs mb-3" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="clases-list-tab" type="button" role="tab" aria-controls="clases-list" aria-selected="true">
                <i class="bi bi-list-check"></i> Mis Clases
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="clases-create-tab" type="button" role="tab" aria-controls="clases-create" aria-selected="false">
                <i class="bi bi-plus-circle"></i> Crear Clase
              </button>
            </li>
          </ul>

          <!-- Tab: Listar clases -->
          <div class="tab-pane fade show active" id="clases-list" role="tabpanel" aria-labelledby="clases-list-tab">
            <div id="clases-loading" class="text-center">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2">Cargando clases...</p>
            </div>
            <div id="clases-container" style="display: none;"></div>
            <div id="clases-empty" style="display: none;" class="text-center py-4">
              <i class="bi bi-inbox" style="font-size: 2rem; color: #ccc;"></i>
              <p class="text-muted mt-2">No hay clases registradas</p>
            </div>
            <div id="clases-error" style="display: none;" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-circle"></i>
              <span id="clases-error-message"></span>
            </div>
          </div>

          <!-- Tab: Crear clase -->
          <div class="tab-pane fade" id="clases-create" role="tabpanel" aria-labelledby="clases-create-tab">
            <form id="crear-clase-form">
              <div class="mb-3">
                <label for="clase-nombre" class="form-label">Nombre de la Clase *</label>
                <input
                  type="text"
                  class="form-control"
                  id="clase-nombre"
                  placeholder="Ej: Matemáticas Básicas"
                  required
                />
                <div class="form-text text-danger d-none" id="clase-nombre-error"></div>
              </div>

              <div class="mb-3">
                <label for="clase-codigo" class="form-label">Código de Clase *</label>
                <input
                  type="text"
                  class="form-control"
                  id="clase-codigo"
                  placeholder="Ej: MAT-101"
                  required
                />
                <div class="form-text text-muted small">Identificador único para la clase</div>
              </div>

              <div class="mb-3">
                <label for="clase-descripcion" class="form-label">Descripción</label>
                <textarea
                  class="form-control"
                  id="clase-descripcion"
                  rows="3"
                  placeholder="Describe el contenido y objetivos de la clase..."
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="clase-horario" class="form-label">Horario</label>
                <input
                  type="text"
                  class="form-control"
                  id="clase-horario"
                  placeholder="Ej: Lunes 10:00 - 12:00"
                />
              </div>

              <div class="mb-3">
                <label for="clase-ubicacion" class="form-label">Ubicación / Aula</label>
                <input
                  type="text"
                  class="form-control"
                  id="clase-ubicacion"
                  placeholder="Ej: Aula 101"
                />
              </div>

              <div id="crear-clase-error" class="alert alert-danger d-none mt-3" role="alert">
                <i class="bi bi-exclamation-circle"></i>
                <span id="crear-clase-error-message"></span>
              </div>
            </form>
          </div>
        </div>

        <div class="modal-footer border-0">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-apple-primary" id="btn-crear-clase" style="display: none;">
            <i class="bi bi-check-circle"></i> Crear Clase
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(r);let i=r.querySelectorAll(`[role="tab"]`),a=r.querySelector(`#btn-crear-clase`),o=r.querySelector(`#crear-clase-form`),s=r.querySelector(`#crear-clase-error`),c=r.querySelector(`#crear-clase-error-message`);i.forEach(e=>{e.addEventListener(`click`,()=>{e.getAttribute(`aria-controls`)===`clases-create`?a.style.display=`inline-block`:a.style.display=`none`})}),a.addEventListener(`click`,p);async function l(){try{let e=r.querySelector(`#clases-container`),i=r.querySelector(`#clases-loading`),a=r.querySelector(`#clases-empty`),o=r.querySelector(`#clases-error`);i.style.display=`block`,e.style.display=`none`,a.style.display=`none`,o.style.display=`none`;let{data:s,error:c}=await x.from(`clases`).select(`*`).eq(`maestro_id`,t).order(`creado_en`,{ascending:!1});if(c)throw c;n=s||[],i.style.display=`none`,n.length===0?a.style.display=`block`:(e.innerHTML=u(n),e.style.display=`block`,d(e))}catch(e){console.error(`[gestionarClasesModal] Error loading clases:`,e);let t=r.querySelector(`#clases-error`),n=r.querySelector(`#clases-error-message`);n.textContent=e.message||`Error al cargar las clases`,t.style.display=`block`,r.querySelector(`#clases-loading`).style.display=`none`}}function u(e){return`
      <div class="list-group">
        ${e.map(e=>`
          <div class="list-group-item" data-clase-id="${e.id}">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1 fw-bold">${e.nombre}</h6>
                <p class="mb-1 text-muted small">
                  <i class="bi bi-code"></i> ${e.codigo}
                </p>
                ${e.descripcion?`<p class="mb-1 small">${e.descripcion}</p>`:``}
                ${e.horario?`<p class="mb-1 small"><i class="bi bi-clock"></i> ${e.horario}</p>`:``}
                ${e.ubicacion?`<p class="mb-0 small"><i class="bi bi-geo-alt"></i> ${e.ubicacion}</p>`:``}
              </div>
              <div class="btn-group-sm" role="group">
                <button type="button" class="btn btn-sm btn-outline-primary btn-editar" data-clase-id="${e.id}">
                  <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-clase-id="${e.id}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join(``)}
      </div>
    `}function d(e){e.querySelectorAll(`.btn-eliminar`).forEach(e=>{e.addEventListener(`click`,async t=>{let n=e.getAttribute(`data-clase-id`);confirm(`¿Estás seguro de que quieres eliminar esta clase?`)&&await f(n)})}),e.querySelectorAll(`.btn-editar`).forEach(e=>{e.addEventListener(`click`,t=>{e.getAttribute(`data-clase-id`),alert(`Funcionalidad de edición próximamente`)})})}async function f(e){try{let{error:n}=await x.from(`clases`).delete().eq(`id`,e).eq(`maestro_id`,t);if(n)throw n;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Clase eliminada exitosamente`,type:`success`}})),await l()}catch(e){console.error(`[gestionarClasesModal] Error deleting clase:`,e),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al eliminar la clase`,type:`danger`}}))}}async function p(){let e=``;try{if(!o.checkValidity()){o.reportValidity();return}a.disabled=!0,e=a.innerHTML,a.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Creando...`;let n={maestro_id:t,nombre:r.querySelector(`#clase-nombre`).value.trim(),codigo:r.querySelector(`#clase-codigo`).value.trim(),descripcion:r.querySelector(`#clase-descripcion`).value.trim()||null,horario:r.querySelector(`#clase-horario`).value.trim()||null,ubicacion:r.querySelector(`#clase-ubicacion`).value.trim()||null,creado_en:new Date().toISOString()},{data:i,error:c}=await x.from(`clases`).insert([n]).select().single();if(c)throw c;o.reset(),s.classList.add(`d-none`),window.dispatchEvent(new CustomEvent(`clase-creada`,{detail:{clase:i}})),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Clase "${n.nombre}" creada exitosamente`,type:`success`}}));let u=r.querySelector(`#clases-list-tab`);new bootstrap.Tab(u).show(),await l()}catch(e){console.error(`[gestionarClasesModal] Error:`,e),c.textContent=e.message||`Error al crear la clase`,s.classList.remove(`d-none`)}finally{a.disabled=!1,e&&(a.innerHTML=e)}}return{show(n){t=n,new bootstrap.Modal(r).show(),e=!0,l()},hide(){bootstrap.Modal.getInstance(r)?.hide(),e=!1},destroy(){r.remove()},isOpen(){return e}}}async function Mi(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=C();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let n=await M(t.id),{data:r}=await x.from(`alumnos`).select(`id, nombre, apellido, email, telefono`).eq(`maestro_id`,t.id),{data:i}=await x.from(`clases`).select(`id, nombre, instrumento, descripcion`).eq(`maestro_id`,t.id);e.innerHTML=`
      <div class="pm-container">
        <div class="pm-header">
          <h1>⚙️ Gestión de Alumnos y Clases</h1>
          <p class="pm-text-muted">Administra tus alumnos y clases</p>
        </div>

        <div class="pm-sections">
          <!-- ALUMNOS -->
          <section class="pm-section">
            <div class="pm-section-header">
              <h2>👥 Alumnos (${r?.length||0})</h2>
              ${n.puede_registrar_alumnos?`<button id="pm-btn-new-alumno" class="btn-apple-primary btn-apple-sm">
                  <i class="bi bi-plus-lg"></i> Agregar Alumno
                </button>`:`<button id="pm-btn-req-alumno" class="btn btn-outline-secondary btn-sm" title="Solicitar permiso al Administrador">
                <i class="bi bi-lock"></i> Solicitar Permiso
              </button>`}
            </div>

            <div class="pm-list">
              ${r&&r.length>0?r.map(e=>`
                  <div class="pm-list-item">
                    <div class="pm-list-content">
                      <h3>${k(e.nombre)} ${k(e.apellido||``)}</h3>
                      <p>${k(e.email||`Sin email`)}</p>
                    </div>
                  </div>
                `).join(``):`<p class="pm-text-muted">No tienes alumnos registrados aún.</p>`}
            </div>
          </section>

          <!-- CLASES -->
          <section class="pm-section">
            <div class="pm-section-header">
              <h2>🎵 Clases (${i?.length||0})</h2>
              ${n.puede_inscribir_clases?`<button id="pm-btn-new-clase" class="btn-apple-primary btn-apple-sm">
                  <i class="bi bi-plus-lg"></i> Gestionar / Agregar Clases
                </button>`:`<button id="pm-btn-req-clase" class="btn btn-outline-secondary btn-sm" title="Solicitar permiso al Administrador">
                <i class="bi bi-lock"></i> Solicitar Permiso
              </button>`}
            </div>

            <div class="pm-list">
              ${i&&i.length>0?i.map(e=>`
                  <div class="pm-list-item">
                    <div class="pm-list-content">
                      <h3>${k(e.nombre)} - ${k(e.instrumento||`Instrumento`)}</h3>
                      <p>${k(e.descripcion||`Sin descripción`)}</p>
                    </div>
                  </div>
                `).join(``):`<p class="pm-text-muted">No tienes clases creadas aún.</p>`}
            </div>
          </section>
        </div>
      </div>

      <style>
        .pm-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--pm-border);
        }
        .pm-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .pm-section-header h2 { margin: 0; font-size: 1.1rem; }
        .pm-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .pm-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--pm-surface);
          border-radius: 6px;
          border: 1px solid var(--pm-border);
        }
        .pm-list-item:hover { background: var(--pm-surface-2); }
        .pm-list-content h3 { margin: 0 0 0.3rem 0; font-size: 0.95rem; }
        .pm-list-content p { margin: 0; font-size: 0.8rem; color: var(--pm-text-muted); }
      </style>
    `,(()=>{let e=null,n=null,r=document.getElementById(`pm-btn-new-alumno`);r&&r.addEventListener(`click`,()=>{e||=Ai(),e.show(t.id)});let i=document.getElementById(`pm-btn-new-clase`);i&&i.addEventListener(`click`,()=>{n||=ji(),n.show(t.id)})})(),document.getElementById(`pm-btn-req-alumno`)?.addEventListener(`click`,async n=>{try{n.target.disabled=!0,n.target.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Solicitando...`,await De(t.id,`alumnos:create`),alert(`Solicitud enviada al administrador.`),Mi(e)}catch(e){alert(`Error al solicitar permiso: `+e.message),n.target.disabled=!1,n.target.innerHTML=`<i class="bi bi-lock"></i> Solicitar Permiso`}}),document.getElementById(`pm-btn-req-clase`)?.addEventListener(`click`,async n=>{try{n.target.disabled=!0,n.target.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Solicitando...`,await De(t.id,`clases:enroll`),alert(`Solicitud enviada al administrador.`),Mi(e)}catch(e){alert(`Error al solicitar permiso: `+e.message),n.target.disabled=!1,n.target.innerHTML=`<i class="bi bi-lock"></i> Solicitar Permiso`}});let a=()=>Mi(e);window.removeEventListener(`alumno-registrado`,a),window.addEventListener(`alumno-registrado`,a,{once:!0}),window.removeEventListener(`clase-creada`,a),window.addEventListener(`clase-creada`,a,{once:!0})}catch(t){e.innerHTML=`<p class="pm-empty" style="color:red">Error: ${k(t.message)}</p>`,console.error(`[GestionAlumnosClasesView]`,t)}}var q={dirty:!1,saving:!1,theme:localStorage.getItem(`portal-maestros-theme`)||`system`,pushEnabled:!1},Ni=[{key:`lunes`,label:`Lunes`},{key:`martes`,label:`Martes`},{key:`miércoles`,label:`Miércoles`},{key:`jueves`,label:`Jueves`},{key:`viernes`,label:`Viernes`},{key:`sábado`,label:`Sábado`},{key:`domingo`,label:`Domingo`}];function Pi(e){let t=C();if(!t){e.innerHTML=`
      <div class="pm-settings-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa.</p>
      </div>`;return}q.dirty=!1,q.saving=!1,D(()=>import(`./pushService-DQD3mJWH.js`).then(e=>e.o).then(async e=>{q.pushEnabled=(await e.getNotificationPreferences()).push_activo;let t=document.querySelector(`#btn-toggle-push-main input`);t&&(t.checked=q.pushEnabled);let n=document.getElementById(`pm-notif-sub-badge`);n&&(n.textContent=q.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`)}),__vite__mapDeps([6,1,3,7])),e.innerHTML=`
    <div class="pm-settings pm-fade-in" role="main" aria-label="Configuración del perfil">
      <header class="pm-settings-header">
        <h1 class="apple-display-md">Perfil</h1>
        <p class="apple-caption">Gestiona tu cuenta, apariencia y notificaciones</p>
      </header>
      <div class="pm-settings-grid">
        <div id="pm-banner-perfil-incompleto" style="display:none;" class="pm-profile-alert"></div>
        <div class="pm-settings-col" id="col-izquierda"></div>
        <div class="pm-settings-col" id="col-derecha"></div>
      </div>
      <footer class="pm-settings-footer">
        <p>SOI Sistema Operativo Institucional</p>
        <p class="pm-settings-footer__version">v2.5.0 &copy; 2026</p>
      </footer>
    </div>`;let n=document.getElementById(`col-izquierda`),r=document.getElementById(`col-derecha`);Fi(n,t),Ii(n,t),Hi(n,t),Li(r),Ri(r,t),zi(r),r.insertAdjacentHTML(`beforeend`,`<div id="pm-collaboration-container"></div>`),r.insertAdjacentHTML(`beforeend`,`<div id="pm-gestion-container" style="display:none;"></div>`),Bi(r),Xi(t),Gi(t),Zi(),D(async()=>{let{getPermisos:e,solicitarPermiso:t}=await import(`./permisoService-DqFoRP7a.js`).then(e=>e.n);return{getPermisos:e,solicitarPermiso:t}},__vite__mapDeps([8,1,9,3])).then(async({getPermisos:e,solicitarPermiso:n})=>{try{let r=await e(t.id),i=document.getElementById(`pm-collaboration-container`);i&&Vi(i,r,t.id,n);let a=document.getElementById(`pm-gestion-container`);a&&(r.puede_registrar_alumnos||r.puede_inscribir_clases)&&(a.style.display=`block`,await Mi(a))}catch(e){console.warn(`[PerfilView] Error cargando permisos de colaboración:`,e.message)}})}function Fi(e,t){let n=_e(t.nombre_completo);e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-profile-hero" aria-label="Información del perfil">
      <div class="pm-profile-hero__content">
        <div class="pm-settings-avatar">
          ${t.avatar_url?`<img src="${k(t.avatar_url)}" alt="Avatar" class="pm-settings-avatar__img">`:`<div class="pm-settings-avatar__placeholder" aria-hidden="true">${k(n)}</div>`}
          <button class="pm-settings-avatar__edit" id="btnCambiarAvatar" title="Cambiar foto" aria-label="Cambiar foto de perfil">
            <i class="bi bi-camera" aria-hidden="true"></i>
          </button>
        </div>
        <div class="pm-profile-hero__info">
          <h2 class="pm-profile-hero__name">${k(t.nombre_completo)}</h2>
          <p class="pm-profile-hero__email">${k(t.email)}</p>
          ${t.especialidad?`
            <span class="chip-apple active" aria-label="Especialidad: ${k(t.especialidad)}">
              <i class="bi bi-mortarboard" aria-hidden="true"></i> ${k(t.especialidad)}
            </span>`:``}
        </div>
      </div>
    </section>`)}function Ii(e,t){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="datos-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-person-circle pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 id="datos-title" class="pm-settings-section__title">Datos Personales</h3>
          <p class="pm-settings-section__desc">Información básica de tu cuenta</p>
        </div>
      </div>
      <div class="pm-settings-form-grid">
        <div class="pm-settings-field">
          <label for="perfilNombre" class="apple-caption">Nombre Completo</label>
          <input type="text" class="input-apple" id="perfilNombre" value="${k(t.nombre_completo)}" placeholder="Tu nombre">
        </div>
        <div class="pm-settings-field">
          <label for="perfilTelefono" class="apple-caption">Teléfono</label>
          <input type="tel" class="input-apple" id="perfilTelefono" value="${k(t.tlf||t.telefono||``)}" placeholder="809-000-0000" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
        </div>
        <div class="pm-settings-field">
          <label for="perfilEspecialidad" class="apple-caption">Especialidad</label>
          <input type="text" class="input-apple" id="perfilEspecialidad" value="${k(t.especialidad||``)}" placeholder="Ej. Violín">
        </div>
      </div>
      <div class="pm-settings-actions">
        <button class="btn-apple-primary" id="btnGuardarPerfil" disabled>
          <i class="bi bi-check2" aria-hidden="true"></i>
          <span>Guardar Cambios</span>
        </button>
      </div>
    </section>`)}function Li(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="apariencia-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-palette pm-icon-amber" aria-hidden="true"></i>
        <div>
          <h3 id="apariencia-title" class="pm-settings-section__title">Apariencia</h3>
          <p class="pm-settings-section__desc">Personaliza el tema visual</p>
        </div>
      </div>
      <div class="pm-theme-picker" role="radiogroup" aria-label="Seleccionar tema">
        <button class="pm-theme-opt" data-theme="light" id="pm-theme-light" role="radio" aria-checked="false">
          <div class="pm-theme-preview light"></div><span>Claro</span>
        </button>
        <button class="pm-theme-opt" data-theme="dark" id="pm-theme-dark" role="radio" aria-checked="false">
          <div class="pm-theme-preview dark"></div><span>Oscuro</span>
        </button>
        <button class="pm-theme-opt" data-theme="system" id="pm-theme-system" role="radio" aria-checked="false">
          <div class="pm-theme-preview system"></div><span>Auto</span>
        </button>
      </div>
    </section>`)}function Ri(e,t){let n=le(),r=n?`<span class="pm-badge-sub" id="pm-notif-sub-badge" aria-live="polite" aria-atomic="true">${q.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`}</span>`:``;e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="notif-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-bell pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 id="notif-title" class="pm-settings-section__title">Notificaciones</h3>
          <p class="pm-settings-section__desc">Gestiona tus alertas y avisos</p>
        </div>
        <label class="pm-apple-switch" id="btn-toggle-push-main" aria-label="Activar notificaciones push">
          <input type="checkbox" ${q.pushEnabled?`checked`:``}>
          <span class="pm-apple-switch-slider"></span>
        </label>
      </div>
      ${r}
      <div class="pm-settings-actions-row" style="margin-top:0.5rem;">
        <button class="btn-apple-utility w-100" id="btn-abrir-config-notif">
          <i class="bi bi-gear-wide-connected" aria-hidden="true"></i> Configurar preferencias...
        </button>
      </div>
      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility" id="btn-probar-notificacion">
          <i class="bi bi-send"></i> Probar notificación
        </button>
      </div>
      ${n?``:`<p class="apple-caption mt-2" style="color:var(--pm-danger)">Push no soportado en este navegador.</p>`}
    </section>`)}function zi(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="ausencias-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-calendar-event pm-icon-teal" aria-hidden="true"></i>
        <div>
          <h3 id="ausencias-title" class="pm-settings-section__title">Ausencias</h3>
          <p class="pm-settings-section__desc">Gestiona tus permisos</p>
        </div>
      </div>
      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility" id="pm-btn-ver-ausencias"><i class="bi bi-clock-history" aria-hidden="true"></i> Historial</button>
        <button class="btn-apple-utility" id="pm-btn-solicitar-ausencia"><i class="bi bi-plus-lg" aria-hidden="true"></i> Solicitar</button>
      </div>
    </section>`)}function Bi(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section pm-section-danger" aria-labelledby="sesion-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-shield-lock pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 id="sesion-title" class="pm-settings-section__title">Seguridad</h3>
          <p class="pm-settings-section__desc">Cerrar sesión en este equipo</p>
        </div>
        <button class="btn-apple-secondary" id="btnCerrarSesion" style="border-color:var(--pm-danger);color:var(--pm-danger)">Salir</button>
      </div>
    </section>`)}function Vi(e,t,n,r){let i=t?.solicitud_actual,a=i?.solicita_alumnos||!1,o=i?.solicita_clases||!1,s=i?.estado||null;e.innerHTML=`
    <section class="card-apple pm-settings-section" aria-labelledby="collab-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-shield-check pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 id="collab-title" class="pm-settings-section__title">Colaboración de Inscripción</h3>
          <p class="pm-settings-section__desc">Solicitá permisos especiales para coadyuvar en la matrícula</p>
        </div>
      </div>
      <div class="pm-collab-cards">
        ${[{key:`alumnos:create`,title:`Registrar Alumnos`,desc:`Matricular nuevos estudiantes directamente en el sistema desde tu portal.`,icon:`bi-person-plus`,iconClass:`pm-icon-blue`,active:t.puede_registrar_alumnos,pending:a&&s===`pendiente`,pending_alumnos:!0},{key:`clases:enroll`,title:`Gestionar e Inscribir Clases`,desc:`Asignar alumnos matriculados a tus clases vigentes sin intermediarios.`,icon:`bi-journal-bookmark`,iconClass:`pm-icon-teal`,active:t.puede_inscribir_clases,pending:o&&s===`pendiente`,pending_clases:!0}].map(e=>{let t=``,n=``;return e.active?(t=`<span class="pm-collab-badge active"><i class="bi bi-patch-check-fill"></i> Concedido</span>`,n=e.key===`alumnos:create`?`
                <button class="btn-apple-primary btn-apple-sm w-100 pm-collab-action-btn" data-route="registrar-alumno"
                  style="padding: 0.45rem 0.9rem; font-size: 0.8rem; display:flex; align-items:center; justify-content:center; gap:0.4rem;">
                  <i class="bi bi-person-plus-fill"></i> Registrar Alumno
                </button>`:e.key===`clases:enroll`?`
                <button class="btn-apple-primary btn-apple-sm w-100 pm-collab-action-btn" data-route="gestionar-clases"
                  style="padding: 0.45rem 0.9rem; font-size: 0.8rem; display:flex; align-items:center; justify-content:center; gap:0.4rem; background: linear-gradient(135deg, #0d9488, #0891b2);">
                  <i class="bi bi-mortarboard-fill"></i> Gestionar Clases
                </button>`:`<p class="pm-collab-help-text">Permiso activo.</p>`):e.pending?(t=`<span class="pm-collab-badge pending"><i class="bi bi-clock-history"></i> Pendiente</span>`,n=`<p class="pm-collab-help-text">Tu solicitud está siendo revisada por la administración.</p>`):(t=`<span class="pm-collab-badge inactive"><i class="bi bi-slash-circle"></i> Inactivo</span>`,n=`
              <button class="btn-apple-primary btn-apple-sm w-100 pm-collab-request-btn" data-key="${e.key}" style="padding: 0.4rem 0.75rem; font-size: 0.75rem;">
                <i class="bi bi-send"></i> Solicitar Acceso
              </button>`),`
            <div class="pm-collab-card ${e.active?`active`:e.pending?`pending`:``}">
              <div class="pm-collab-card__header">
                <div class="pm-collab-card__icon ${e.iconClass}">
                  <i class="bi ${e.icon}"></i>
                </div>
                <div class="pm-collab-card__info">
                  <h4 class="pm-collab-card__name">${e.title}</h4>
                  <p class="pm-collab-card__desc">${e.desc}</p>
                </div>
              </div>
              <div class="pm-collab-card__footer">
                ${t}
                <div class="pm-collab-card__action">
                  ${n}
                </div>
              </div>
            </div>
          `}).join(``)}
      </div>
    </section>
  `,e.querySelectorAll(`.pm-collab-request-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{let i=t.dataset.key;t.disabled=!0;let a=t.innerHTML;t.innerHTML=`<span class="pm-settings-spinner"></span> Enviando...`;try{await r(n,i),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Solicitud enviada correctamente. Esperando aprobación admin.`,type:`success`}}));let{getPermisos:t}=await D(async()=>{let{getPermisos:e}=await import(`./permisoService-DqFoRP7a.js`).then(e=>e.n);return{getPermisos:e}},__vite__mapDeps([8,1,9,3]));Vi(e,await t(n),n,r)}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al enviar solicitud: `+e.message,type:`danger`}})),t.disabled=!1,t.innerHTML=a}})}),e.querySelectorAll(`.pm-collab-action-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.route;if(t===`registrar-alumno`){Ai().show(n);let e=t=>{window.removeEventListener(`alumno-registrado`,e)};window.addEventListener(`alumno-registrado`,e)}else if(t===`gestionar-clases`){ji().show(n);let e=t=>{window.removeEventListener(`clase-creada`,e)};window.addEventListener(`clase-creada`,e)}})})}function Hi(e,t){let n=t.disponibilidad||{},r=!t.especialidad||!t.disponibilidad||Object.keys(t.disponibilidad).length===0;e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section ${r?`pm-section-warning`:``}" aria-labelledby="disp-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-calendar-week pm-icon-teal" aria-hidden="true"></i>
        <div>
          <h3 id="disp-title" class="pm-settings-section__title">Disponibilidad Horaria</h3>
          <p class="pm-settings-section__desc">Bloques de horarios por día</p>
        </div>
        ${r?`<span class="pm-badge-warning">Requerido</span>`:``}
      </div>
      <div id="pm-avail-days" class="pm-avail-days" role="list">
        ${Ni.map(e=>Ui(e.key,n[e.key]||[],e.label)).join(``)}
      </div>
    </section>`)}function Ui(e,t,n){let r=t.length>0;return`
    <div class="pm-avail-dia ${r?`open`:``}" data-dia="${e}" role="listitem">
      <button class="pm-avail-dia__header" aria-expanded="${r?`true`:`false`}" aria-controls="pm-avail-body-${e}" data-dia="${e}">
        <span class="pm-avail-dia__label">${n}</span>
        <span class="pm-avail-dia__count">${t.length} franja${t.length===1?``:`s`}</span>
        <i class="bi bi-chevron-down pm-avail-dia__arrow" aria-hidden="true"></i>
      </button>
      <div class="pm-avail-dia__body" id="pm-avail-body-${e}">
        <div class="pm-avail-franjas" id="pm-avail-franjas-${e}">
          ${t.map((t,n)=>Wi(e,n,t)).join(``)}
        </div>
        <button class="btn-apple-utility btn-apple-sm pm-avail-add-btn" data-dia="${e}">
          <i class="bi bi-plus-lg" aria-hidden="true"></i> Agregar franja
        </button>
      </div>
    </div>`}function Wi(e,t,n){return`
    <div class="pm-avail-franja" data-dia="${e}" data-index="${t}">
      <input type="time" class="pm-apple-time" value="${n.inicio||`08:00`}" data-field="inicio" aria-label="Hora inicio">
      <span>a</span>
      <input type="time" class="pm-apple-time" value="${n.fin||`12:00`}" data-field="fin" aria-label="Hora fin">
      <button class="pm-avail-franja__del" aria-label="Eliminar franja"><i class="bi bi-trash" aria-hidden="true"></i></button>
    </div>`}function Gi(e){document.querySelectorAll(`#perfilNombre, #perfilTelefono, #perfilEspecialidad, .pm-apple-time`).forEach(e=>{e.addEventListener(`input`,()=>{q.dirty=!0;let e=document.getElementById(`btnGuardarPerfil`);e&&(e.disabled=!1)})}),document.getElementById(`btnGuardarPerfil`)?.addEventListener(`click`,()=>Ki(e)),document.getElementById(`btnCerrarSesion`)?.addEventListener(`click`,Ji),document.getElementById(`btnCambiarAvatar`)?.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Cambio de avatar disponible próximamente`,type:`info`}}))});let t=document.querySelector(`#btn-toggle-push-main input`);t?.addEventListener(`change`,async e=>{if(t.disabled=!0,t.checked){let e=await he();e.success?(q.pushEnabled=!0,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificaciones activadas`,type:`success`}}))):(t.checked=!1,q.pushEnabled=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e.error||`Error al activar`,type:`danger`}})))}else await ce(),q.pushEnabled=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificaciones desactivadas`,type:`info`}}));t.disabled=!1;let n=document.getElementById(`pm-notif-sub-badge`);n&&(n.textContent=q.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`)}),document.getElementById(`btn-abrir-config-notif`)?.addEventListener(`click`,()=>ki.open()),document.getElementById(`btn-probar-notificacion`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`btn-probar-notificacion`);e.disabled=!0,e.innerHTML=`<span class="pm-settings-spinner"></span> Enviando...`;let t=await se();t.success?(e.innerHTML=`<i class="bi bi-check2"></i> Notificación enviada`,setTimeout(()=>{e.innerHTML=`<i class="bi bi-send"></i> Probar notificación`,e.disabled=!1},2e3)):(e.innerHTML=`<i class="bi bi-exclamation-triangle"></i> Error`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:t.error||`No se pudo enviar notificación de prueba. Verifica los permisos.`,type:`danger`}})),setTimeout(()=>{e.innerHTML=`<i class="bi bi-send"></i> Probar notificación`,e.disabled=!1},2e3))}),document.getElementById(`pm-theme-light`)?.addEventListener(`click`,()=>Yi(`light`)),document.getElementById(`pm-theme-dark`)?.addEventListener(`click`,()=>Yi(`dark`)),document.getElementById(`pm-theme-system`)?.addEventListener(`click`,()=>Yi(`system`)),document.getElementById(`pm-btn-ver-ausencias`)?.addEventListener(`click`,async()=>{let{ausenciasPanel:e}=await D(async()=>{let{ausenciasPanel:e}=await import(`./ausenciasPanel-DIdVZoeQ.js`);return{ausenciasPanel:e}},__vite__mapDeps([10,3,11,7,5,12,1,13]));e.open()}),document.getElementById(`pm-btn-solicitar-ausencia`)?.addEventListener(`click`,()=>Ee.open()),document.querySelectorAll(`.pm-avail-dia__header`).forEach(e=>{e.addEventListener(`click`,()=>{e.dataset.dia;let t=e.closest(`.pm-avail-dia`),n=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,!n),t.classList.toggle(`open`,!n)})}),document.querySelectorAll(`.pm-avail-add-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.dia,n=e.closest(`.pm-avail-dia`),r=document.getElementById(`pm-avail-franjas-${t}`),i=r.querySelectorAll(`.pm-avail-franja`).length;r.insertAdjacentHTML(`beforeend`,Wi(t,i,{inicio:`08:00`,fin:`12:00`})),n.classList.add(`open`),n.querySelector(`.pm-avail-dia__header`).setAttribute(`aria-expanded`,`true`),q.dirty=!0,document.getElementById(`btnGuardarPerfil`).disabled=!1})}),document.addEventListener(`click`,e=>{let t=e.target.closest(`.pm-avail-franja__del`);t&&(t.closest(`.pm-avail-franja`).remove(),q.dirty=!0,document.getElementById(`btnGuardarPerfil`).disabled=!1)})}async function Ki(e){let t=document.getElementById(`perfilNombre`).value.trim(),n=p(document.getElementById(`perfilTelefono`).value.trim())||document.getElementById(`perfilTelefono`).value.trim(),r=document.getElementById(`perfilEspecialidad`).value.trim(),i=qi();if(!t){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`El nombre es obligatorio`,type:`danger`}}));return}q.saving=!0;let a=document.getElementById(`btnGuardarPerfil`),o=a.innerHTML;a.disabled=!0,a.innerHTML=`<span class="pm-settings-spinner"></span><span>Guardando...</span>`;try{let{error:a}=await x.from(`maestros`).update({nombre_completo:t,tlf:n,especialidad:r,disponibilidad:i}).eq(`id`,e.id);if(a)throw a;let o={...e,nombre_completo:t,nombre:t,telefono:n,tlf:n,especialidad:r,disponibilidad:i};localStorage.setItem(ne,JSON.stringify(o)),q.dirty=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Perfil actualizado`,type:`success`}}))}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al guardar: `+e.message,type:`danger`}}))}finally{q.saving=!1,a.disabled=!1,a.innerHTML=o}}function qi(){let e={};return Ni.forEach(({key:t})=>{let n=[];document.querySelectorAll(`[data-dia="${t}"].pm-avail-franja`).forEach(e=>{let t=e.querySelector(`[data-field="inicio"]`)?.value,r=e.querySelector(`[data-field="fin"]`)?.value;t&&r&&n.push({inicio:t,fin:r})}),e[t]=n}),e}function Ji(){Ce.open({title:`¿Cerrar Sesión?`,size:`sm`,body:`
      <div style="text-align:center; padding:1rem 0;">
        <i class="bi bi-box-arrow-right" style="font-size:2.5rem;color:var(--pm-danger);opacity:0.8;"></i>
        <p style="margin-top:1rem;">¿Estás seguro que quieres salir?</p>
      </div>`,saveText:`Salir`,cancelText:`Cancelar`,onSave:async()=>(await S(),window.location.reload(),!0)})}function Yi(e){let t=e===`system`?window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`:e;document.documentElement.setAttribute(`data-bs-theme`,t),document.documentElement.setAttribute(`data-portal-theme`,t),document.documentElement.classList.toggle(`pm-dark`,t===`dark`),document.querySelectorAll(`.pm-theme-opt`).forEach(t=>{t.setAttribute(`aria-checked`,t.dataset.theme===e?`true`:`false`),t.classList.toggle(`active`,t.dataset.theme===e)}),localStorage.setItem(`portal-maestros-theme`,e),q.theme=e}function Xi(e){let t=!e.especialidad||!e.disponibilidad||Object.keys(e.disponibilidad||{}).length===0,n=document.getElementById(`pm-banner-perfil-incompleto`);n&&(t?(n.style.display=`block`,n.innerHTML=`
      <div class="pm-profile-alert__inner">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        <div><strong>Completa tu perfil</strong><p>Agrega tu especialidad y disponibilidad horaria.</p></div>
      </div>`):n.style.display=`none`)}function Zi(){document.querySelectorAll(`.card-apple`).forEach((e,t)=>{e.style.opacity=`0`,e.style.transform=`translateY(12px)`,setTimeout(()=>{e.style.transition=`opacity 0.4s ease, transform 0.4s ease`,e.style.opacity=`1`,e.style.transform=`translateY(0)`},50*t)})}var Qi=`
  .pm-profile-alert {
    grid-column: 1 / -1;
    padding: 0 0 0.5rem;
  }
  .pm-profile-alert__inner {
    background: rgba(234, 179, 8, 0.12);
    border: 1px solid rgba(234, 179, 8, 0.4);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--pm-warning);
  }
  .pm-profile-alert__inner i { font-size: 1.4rem; flex-shrink: 0; }
  .pm-profile-alert__inner strong { display: block; font-size: 0.9rem; }
  .pm-profile-alert__inner p { margin: 0.15rem 0 0; font-size: 0.78rem; opacity: 0.85; }
  .pm-badge-warning {
    background: rgba(234, 179, 8, 0.15);
    color: var(--pm-warning);
    font-size: 0.68rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 20px;
    letter-spacing: 0.05em;
  }
  .pm-avail-days { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
  .pm-avail-dia { border: 1px solid var(--pm-border); border-radius: 10px; overflow: hidden; }
  .pm-avail-dia__header {
    width: 100%;
    background: var(--pm-surface-2);
    border: none;
    padding: 0.6rem 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--pm-text);
    transition: background 0.15s;
  }
  .pm-avail-dia__header:hover { background: var(--pm-border); }
  .pm-avail-dia__label { font-size: 0.85rem; font-weight: 600; flex: 1; text-align: left; }
  .pm-avail-dia__count { font-size: 0.72rem; color: var(--pm-text-muted); }
  .pm-avail-dia__arrow { font-size: 0.8rem; color: var(--pm-text-muted); transition: transform 0.2s; }
  .pm-avail-dia.open .pm-avail-dia__arrow { transform: rotate(180deg); }
  .pm-avail-dia__body { 
    padding: 0; 
    background: var(--pm-surface); 
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  }
  .pm-avail-dia.open .pm-avail-dia__body {
    max-height: 1000px;
    padding: 0.85rem;
  }
  .pm-avail-franjas { display: flex; flex-direction: column; gap: 0.4rem; }
  .pm-avail-franja {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--pm-surface-2);
    border-radius: 8px;
    padding: 0.4rem 0.6rem;
  }
  .pm-avail-franja span { font-size: 0.75rem; color: var(--pm-text-muted); flex-shrink: 0; }
  .pm-apple-time {
    background: var(--pm-surface);
    border: 1px solid var(--pm-border);
    border-radius: 6px;
    padding: 0.3rem 0.5rem;
    font-size: 0.8rem;
    color: var(--pm-text);
    font-family: inherit;
    color-scheme: light;
  }
  .pm-avail-franja__del {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--pm-text-muted);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 4px;
    transition: color 0.15s;
    flex-shrink: 0;
  }
  .pm-avail-franja__del:hover { color: var(--pm-danger); }
  .pm-avail-add-btn { margin-top: 0.5rem; width: 100%; }
  .pm-avail-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  .pm-avail-actions .pm-avail-add-btn { flex: 1; }
  .pm-avail-actions .pm-avail-copy-btn { flex: 0 0 auto; }
  
  /* Popup de copiar horario */
  .pm-copy-popup { position: fixed; inset: 0; z-index: 9999; }
  .pm-copy-popup__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
  .pm-badge-sub {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 12px;
    background: var(--pm-primary-light, rgba(59,130,246,0.12));
    color: var(--pm-primary, #3b82f6);
    margin: 0.25rem 0 0 0;
  }
  .pm-copy-popup__content { 
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: var(--pm-surface); border-radius: 12px; padding: 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 200px;
  }
  .pm-copy-popup__title { margin: 0 0 0.75rem; font-weight: 600; font-size: 0.9rem; }
  .pm-copy-popup__options { display: flex; flex-direction: column; gap: 0.25rem; }
  .pm-copy-dest-btn { 
    background: var(--pm-surface-2); border: none; padding: 0.5rem 0.75rem; 
    border-radius: 6px; text-align: left; cursor: pointer; color: var(--pm-text);
  }
  .pm-copy-dest-btn:hover { background: var(--pm-border); }

  /* Colaboración de permisos */
  .pm-collab-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  .pm-collab-card {
    background: var(--pm-surface-2);
    border: 1px solid var(--pm-border);
    border-radius: 12px;
    padding: 0.85rem;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .pm-collab-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: rgba(59, 130, 246, 0.3);
  }
  .pm-collab-card.active {
    border-color: rgba(34, 197, 94, 0.3);
  }
  .pm-collab-card.active:hover {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.05);
  }
  .pm-collab-card.pending {
    border-color: rgba(234, 179, 8, 0.3);
  }
  .pm-collab-card.pending:hover {
    border-color: rgba(234, 179, 8, 0.5);
    box-shadow: 0 4px 12px rgba(234, 179, 8, 0.05);
  }
  .pm-collab-card__header {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .pm-collab-card__icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: var(--pm-surface);
    box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    flex-shrink: 0;
  }
  .pm-collab-card__info {
    flex: 1;
  }
  .pm-collab-card__name {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: var(--pm-text);
  }
  .pm-collab-card__desc {
    font-size: 0.75rem;
    color: var(--pm-text-muted);
    margin: 0.2rem 0 0;
    line-height: 1.3;
  }
  .pm-collab-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.75rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--pm-border);
    gap: 0.75rem;
  }
  .pm-collab-badge {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .pm-collab-badge.active {
    background: rgba(34, 197, 94, 0.12);
    color: #22c55e;
  }
  .pm-collab-badge.pending {
    background: rgba(234, 179, 8, 0.12);
    color: #eab308;
  }
  .pm-collab-badge.inactive {
    background: var(--pm-surface);
    color: var(--pm-text-muted);
    border: 1px solid var(--pm-border);
  }
  .pm-collab-card__action {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
  .pm-collab-help-text {
    font-size: 0.7rem;
    color: var(--pm-text-muted);
    margin: 0;
    text-align: right;
  }
`;if(!document.getElementById(`pm-avail-styles`)){let e=document.createElement(`style`);e.id=`pm-avail-styles`,e.textContent=Qi,document.head.appendChild(e)}async function $i(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=C();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let n=await W.getClasses(),{data:r}=await x.from(`clases`).select(`id, nombre, instrumento`).eq(`maestro_id`,t.id).order(`nombre`),i=async(e=null)=>{if(!e)return`<p class="pm-empty">Seleccioná una clase para ver su ruta académica.</p>`;let t=await W.getRouteHierarchy(e);if(!t||t.length===0)return`<p class="pm-empty">Esta clase aún no tiene una ruta configurada.</p>`;let n=e=>({ESCALA:`🎼`,ARPEGIO:`🎹`,MANO_IZQ:`✋`,ARCO:`🎻`,SONIDO:`🔊`,AFINACION:`🎵`,TECNICA:`⚙️`,REPERTORIO:`📖`})[e]||`•`,r=e=>e?`var(--pm-danger)`:`var(--pm-primary)`;return`
        <div class="pm-route-niveles">
          ${t.map(e=>`
            <div class="pm-route-nivel expanded">
              <div class="pm-nivel-toggle" data-level="${e.id}">
                <div class="pm-nivel-num">${e.numero_nivel}</div>
                <div class="pm-nivel-info">
                  <span class="pm-nivel-name">${k(e.nombre)}</span>
                  <span class="pm-nivel-obj">${k(e.objetivo_general||`Objetivo no especificado`)}</span>
                </div>
                <i class="bi bi-chevron-down pm-nivel-arrow"></i>
              </div>
              <div class="pm-nivel-nodos">
                ${(e.plan_temas||[]).map(e=>`
                  <div class="pm-nodo-card ${e.es_critico?`critical`:``}">
                    <div class="pm-nodo-icon" style="color: ${r(e.es_critico)}">${n(e.tipo)}</div>
                    <div class="pm-nodo-info">
                      <span class="pm-nodo-name">${k(e.nombre)}</span>
                      <span class="pm-nodo-type">${e.tipo}</span>
                      ${e.es_critico?`<span class="pm-nodo-critical">CRÍTICO</span>`:``}
                      
                      <div style="font-size:0.6rem; color:var(--pm-text-muted); margin-top:4px;">
                        ${(e.plan_objetivos||[]).length} objetivos definidos
                      </div>
                    </div>
                  </div>
                `).join(``)}
                ${(e.plan_temas||[]).length===0?`<p style="font-size:0.7rem; color:var(--pm-text-muted); padding:10px;">Sin temas configurados.</p>`:``}
              </div>
            </div>
          `).join(``)}
        </div>
      `};e.innerHTML=`
      <div class="pm-planif-root">
        <h2 class="pm-planif-title">
          <i class="bi bi-signpost-split"></i> Ruta Académica por Nodos
        </h2>
        <p class="pm-planif-subtitle">Estructura curricular progresiva - El alumno avanza por dominio</p>

        <!-- Pestañas -->
        <div class="pm-tabs-nav">
          <button class="pm-tab-btn active" data-tab="tab-visualizador">
            <i class="bi bi-eye"></i> Visualizador (Ruta)
          </button>
          <button class="pm-tab-btn" data-tab="tab-configurador">
            <i class="bi bi-gear"></i> Configurar Planificación
          </button>
        </div>

        <!-- PESTAÑA 1: VISUALIZADOR -->
        <div id="tab-visualizador" class="pm-tab-pane active">
          <!-- Selector de clase de PLANIFICACIÓN -->
          <div class="pm-planif-selector">
            <label class="pm-planif-label">Ruta de:</label>
            <select id="pm-planif-clase-select" class="pm-input">
              <option value="">Seleccionar planificación...</option>
              ${n?.map(e=>`<option value="${e.id}">${k(e.nombre||e.name||`Sin nombre`)}</option>`).join(``)||``}
            </select>
          </div>

          <!-- Ruta Académica -->
          <h3 class="pm-planif-section-title">
            <i class="bi bi-signpost-split"></i> Estructura de la Ruta
          </h3>
          <div id="pm-route-container" class="pm-route-container">
            <p class="pm-empty">Seleccioná una planificación arriba.</p>
          </div>

          <!-- Leyenda -->
          <div class="pm-route-leyenda">
            <div class="pm-leyenda-item"><span class="pm-leyenda-icon" style="background: var(--pm-primary-light);">🎼</span><span>Escalas</span></div>
            <div class="pm-leyenda-item"><span class="pm-leyenda-icon" style="background: var(--pm-primary-light);">🎹</span><span>Arpegios</span></div>
            <div class="pm-leyenda-item"><span class="pm-leyenda-icon" style="background: var(--pm-danger-light);">🔊</span><span>Sonido (Crítico)</span></div>
            <div class="pm-leyenda-item"><span class="pm-leyenda-icon" style="background: var(--pm-danger-light);">🎵</span><span>Afinación (Crítico)</span></div>
          </div>
        </div>

        <!-- PESTAÑA 2: CONFIGURADOR CRUD -->
        <div id="tab-configurador" class="pm-tab-pane" style="display:none;">
          <div class="pm-config-header-panel">
            <div class="pm-config-scope">
              <div class="pm-config-actions">
                <input type="file" id="pm-import-file" style="display:none" accept=".pdf,.docx,.md,.txt,.jpg,.jpeg,.png" />
                <button id="pm-btn-import-ia" class="pm-btn pm-btn-outline-primary" style="padding: 0.8rem 1.5rem; font-size: 1.1rem; border-width:2px;">
                  <i class="bi bi-stars"></i> Importar Nueva Planificación con IA
                </button>
                
                <div id="pm-import-status" class="pm-import-status" style="display:none;">
                  <div class="pm-spinner" style="width:16px; height:16px;"></div>
                  <span id="pm-import-status-text">Procesando documento con IA...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div id="pm-route-config-root"></div>
        </div>
      </div>

      <style>
        .pm-tabs-nav { display:flex; gap:0.5rem; margin-bottom:1.5rem; border-bottom:1px solid var(--pm-border); padding-bottom:0; }
        .pm-tab-btn { background:none; border:none; border-bottom:3px solid transparent; padding:0.75rem 1rem; cursor:pointer; font-weight:600; color:var(--pm-text-muted); transition:all 0.2s; display:flex; align-items:center; gap:0.5rem; font-size:0.95rem; }
        .pm-tab-btn:hover { color:var(--pm-primary); }
        .pm-tab-btn.active { color:var(--pm-primary); border-bottom-color:var(--pm-primary); background:var(--pm-primary-light); border-top-left-radius:8px; border-top-right-radius:8px; }
        .pm-tab-pane { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .pm-config-header-panel { background: var(--pm-surface-2); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--pm-border); }
        .pm-config-actions { display: flex; gap: 0.5rem; align-items: center; }
        .pm-import-status { display: flex; align-items: center; gap: 0.75rem; color: var(--pm-primary); font-size: 0.85rem; font-weight: 600; }
        .pm-btn-outline-primary { background: transparent; border: 2px solid var(--pm-primary); color: var(--pm-primary); border-radius: 8px; padding: 0.6rem 1.2rem; cursor: pointer; transition: all 0.2s; font-weight: 600; }
        .pm-btn-outline-primary:hover { background: var(--pm-primary); color: white; }

        .pm-route-nivel { margin-bottom: 0.75rem; border: 1px solid var(--pm-border); border-radius: 10px; overflow: hidden; background: var(--pm-surface); }
        .pm-nivel-toggle { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; }
        .pm-nivel-num { width: 32px; height: 32px; background: var(--pm-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .pm-nivel-name { font-weight: 600; font-size: 0.95rem; }
        .pm-nivel-obj { display: block; font-size: 0.75rem; color: var(--pm-text-muted); }
        .pm-nivel-nodos { display: none; padding: 0.75rem; background: var(--pm-surface-2); gap: 0.5rem; flex-wrap: wrap; }
        .pm-route-nivel.expanded .pm-nivel-nodos { display: flex; }
        .pm-nodo-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--pm-surface); border-radius: 8px; border: 1px solid var(--pm-border); min-width: 140px; }
        .pm-nodo-card.critical { border-color: var(--pm-danger); background: var(--pm-danger-light); color: var(--pm-danger-dark); }
        .pm-route-leyenda { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--pm-border); }
        .pm-leyenda-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--pm-text-muted); }
        .pm-leyenda-icon { width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
      </style>
    `;let a=e.querySelector(`#pm-planif-clase-select`),o=e.querySelector(`#pm-route-container`);a&&o&&(a.onchange=async()=>{o.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`,o.innerHTML=await i(a.value),o.querySelectorAll(`.pm-nivel-toggle`).forEach(e=>{e.onclick=()=>{e.closest(`.pm-route-nivel`).classList.toggle(`expanded`)}})});let s=e.querySelectorAll(`.pm-tab-btn`),c=e.querySelectorAll(`.pm-tab-pane`);s.forEach(t=>{t.onclick=()=>{s.forEach(e=>e.classList.remove(`active`)),c.forEach(e=>{e.classList.remove(`active`),e.style.display=`none`}),t.classList.add(`active`);let n=t.getAttribute(`data-tab`),r=e.querySelector(`#${n}`);r&&(r.classList.add(`active`),r.style.display=`block`)}});let l=localStorage.getItem(`pm_active_clase_id`),u=null;if(l){let e=r?.find(e=>e.id===l);if(e){let t=n.find(t=>e.nombre.toLowerCase().includes(t.nombre.toLowerCase())||t.nombre.toLowerCase().includes(e.nombre.toLowerCase()));t&&(u=t.id)}}!u&&n&&n.length>0&&(u=n[0].id),u&&a&&o&&(a.value=u,o.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`,i(u).then(e=>{o.innerHTML=e,o.querySelectorAll(`.pm-nivel-toggle`).forEach(e=>{e.onclick=()=>{e.closest(`.pm-route-nivel`).classList.toggle(`expanded`)}})}));let d=e.querySelector(`#pm-route-config-root`);d&&Or(d,u);let f=e.querySelector(`#pm-btn-import-ia`),p=e.querySelector(`#pm-import-file`),m=e.querySelector(`#pm-import-status`),h=e.querySelector(`#pm-import-status-text`);f&&p&&(f.onclick=()=>p.click(),p.onchange=async t=>{let n=t.target.files[0];if(n){f.disabled=!0,m.style.display=`flex`,h.textContent=`Iniciando... 0%`;try{let{parsePlanningFile:t}=await D(async()=>{let{parsePlanningFile:e}=await import(`./planningParserService-C3d6Zdil.js`);return{parsePlanningFile:e}},__vite__mapDeps([14,15,3])),{AppModal:r}=await D(async()=>{let{AppModal:e}=await import(`./AppModal-CLA9fW7x.js`).then(e=>e.n);return{AppModal:e}},__vite__mapDeps([12,1])),i=await t(n,e=>{h.textContent=`Analizando... ${e}%`});h.textContent=`Estructurando con IA...`;let a=ea(i,await W.getClasses()||[]);r.open({title:`Previsualización de Importación IA`,size:`lg`,saveText:`Confirmar e Importar`,body:a,onSave:async t=>{try{let n=t.querySelector(`#preview-class-selector`).value,a=n;if(n===`NEW`){let e=t.querySelector(`#preview-class-name`).value.trim();if(!e)return alert(`Asigná un nombre.`),!1;h.textContent=`Creando clase...`,a=(await W.addClass(e)).id}return t.querySelectorAll(`.preview-nivel-input`).forEach(e=>{i.niveles[e.dataset.nIdx].nombre=e.value}),t.querySelectorAll(`.preview-tema-input`).forEach(e=>{i.niveles[e.dataset.nIdx].temas[e.dataset.tIdx].nombre=e.value}),t.querySelectorAll(`.preview-obj-input`).forEach(e=>{i.niveles[e.dataset.nIdx].temas[e.dataset.tIdx].objetivos[e.dataset.oIdx].nombre=e.value}),h.textContent=`Importando...`,await W.importStructure(a,i),r.open({title:`¡Éxito!`,body:`<p>La planificación ha sido importada correctamente.</p>`,confirmText:`Genial`,hideCancel:!0}),$i(e),!0}catch(e){return r.open({title:`Error de Importación`,body:`<p>No se pudo importar la planificación: ${e.message}</p>`,confirmText:`Cerrar`,hideCancel:!0}),!1}},onCancel:()=>{m.style.display=`none`,f.disabled=!1}})}catch(e){Ce.open({title:`Error inesperado`,body:`<p>${e.message}</p>`,confirmText:`Cerrar`,hideCancel:!0})}finally{f.disabled=!1,m.style.display=`none`,p.value=``}}})}catch(t){e.innerHTML=`<p class="pm-empty">Error: ${t.message}</p>`}return()=>{console.log(`[PlanificacionView] Cleanup ejecutado`)}}function ea(e,t=[]){let n=e.niveles||[],r=0,i=0;return n.forEach(e=>{r+=(e.temas||[]).length,e.temas?.forEach(e=>i+=(e.objetivos||[]).length)}),`
    <div class="pm-import-preview">
      <div style="margin-bottom:1.5rem; padding:1rem; background:var(--pm-surface-2); border-radius:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:10px;">¿DÓNDE IMPORTAR?</label>
        <select id="preview-class-selector" class="pm-input" onchange="document.getElementById('new-class-name-wrapper').style.display = (this.value === 'NEW' ? 'block' : 'none')">
          <option value="NEW">-- [ + ] CREAR NUEVA CLASE --</option>
          ${t.map(e=>`<option value="${e.id}">Añadir a: ${k(e.nombre||e.name)}</option>`).join(``)}
        </select>
        <div id="new-class-name-wrapper" style="display:block; padding-top:0.5rem;">
          <input type="text" id="preview-class-name" class="pm-input" placeholder="Nombre de la nueva clase..." />
        </div>
      </div>

      <div style="display:flex; gap:1rem; margin-bottom:1rem; padding:1rem; background:var(--pm-surface-2); border-radius:8px; text-align:center;">
        <div style="flex:1;"><b>${n.length}</b><br><small>NIVELES</small></div>
        <div style="flex:1; border-left:1px solid var(--pm-border);"><b>${r}</b><br><small>TEMAS</small></div>
        <div style="flex:1; border-left:1px solid var(--pm-border);"><b>${i}</b><br><small>OBJETIVOS</small></div>
      </div>

      <div style="max-height:400px; overflow-y:auto;">
        ${n.map((e,t)=>`
          <div style="margin-bottom:1rem; border:1px solid var(--pm-border); border-radius:8px;">
            <div style="background:var(--pm-surface-2); padding:0.5rem; display:flex; gap:0.5rem;">
              <input type="text" class="preview-nivel-input pm-input" value="${k(e.nombre)}" data-n-idx="${t}" />
            </div>
            <div style="padding:0.5rem;">
              ${(e.temas||[]).map((e,n)=>`
                <div style="margin-bottom:0.5rem; padding-left:0.5rem; border-left:2px solid var(--pm-primary);">
                  <input type="text" class="preview-tema-input pm-input" value="${k(e.nombre)}" data-n-idx="${t}" data-t-idx="${n}" style="font-size:0.8rem;" />
                  ${(e.objetivos||[]).map((e,r)=>`
                    <input type="text" class="preview-obj-input pm-input" value="${k(e.nombre)}" data-n-idx="${t}" data-t-idx="${n}" data-o-idx="${r}" style="font-size:0.75rem; margin-top:2px;" />
                  `).join(``)}
                </div>
              `).join(``)}
            </div>
          </div>
        `).join(``)}
      </div>
    </div>
  `}async function ta(e,t){let n=e.querySelector(`#pm-alumno-progreso-root`);if(n)try{let{data:e,error:r}=await x.from(`indicator_attempts`).select(`id, nota, observations, tarea, created_at, indicator_id`).eq(`student_id`,t).order(`created_at`,{ascending:!1});if(r)throw r;if(!e||e.length===0){n.innerHTML=`<p class="pm-empty">Sin evaluaciones registradas.</p>`;return}let i=[...new Set(e.map(e=>e.indicator_id))],{data:a}=await x.from(`indicators`).select(`id, nombre, node_id`).in(`id`,i),o=[...new Set((a||[]).map(e=>e.node_id).filter(Boolean))],{data:s}=await x.from(`nodes`).select(`id, name`).in(`id`,o),c=new Map((s||[]).map(e=>[e.id,e.name])),l=new Map((a||[]).map(e=>[e.id,e])),u=new Map;for(let t of e){if(u.has(t.indicator_id))continue;let e=l.get(t.indicator_id);u.set(t.indicator_id,{id:t.indicator_id,nombre:e?.nombre||``,nodeName:c.get(e?.node_id)||``,latest:t,history:[]})}for(let t of e)if(u.has(t.indicator_id)){let e=u.get(t.indicator_id);(e.history.length===0||e.history[0].id!==t.id)&&e.history.push(t)}let d=Array.from(u.values()).filter(e=>e.latest.nota!=null&&e.latest.nota!==0||e.latest.observations&&e.latest.observations.trim()!==``),f=d.filter(e=>e.latest.nota>=4).length,p=d.length,m=p>0?Math.round(f/p*100):0;function h(e){return e==null?`⚫`:e>=4?`🟢`:e>=2?`🟡`:`🔴`}function g(e){return e==null?`pm-route-indicador--gray`:e>=4?`pm-route-indicador--green`:e>=2?`pm-route-indicador--yellow`:`pm-route-indicador--red`}n.innerHTML=`
      <div class="pm-student-panel__progress-bar" style="margin-bottom:0.75rem;">
        <div class="pm-student-panel__progress-fill" style="width:${m}%"></div>
      </div>
      <p style="font-size:0.85rem;color:var(--pm-text-muted);margin-bottom:1rem;">
        🎯 Progreso Académico — <strong>${m}% avance</strong>
        (${f}/${d.length} indicadores aprobados)
      </p>
      <div class="pm-eval-indicadores">
        ${d.map(e=>`
          <div class="pm-eval-indicador ${g(e.latest.nota)}" data-ind-id="${e.id}">
            <div class="pm-eval-indicador-header">
              <span class="pm-eval-semaforo">${h(e.latest.nota)}</span>
              <span class="pm-eval-nombre">${k(e.nombre)}</span>
              <span class="pm-eval-node" style="font-size:0.75rem;color:var(--pm-text-muted);margin-left:auto;">${k(e.nodeName)}</span>
              <span class="pm-eval-nota" style="font-weight:700;margin-left:0.5rem;">${e.latest.nota??`—`}</span>
              <i class="bi bi-chevron-down pm-eval-toggle" style="margin-left:0.5rem;font-size:0.8rem;"></i>
            </div>
            <div class="pm-eval-timeline" style="display:none;">
              ${e.history.map(e=>`
                <div class="pm-eval-entry" style="padding:0.5rem 0;border-bottom:1px solid var(--pm-border,#eee);">
                  <span style="font-size:0.8rem;color:var(--pm-text-muted);">
                    ${new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`})}
                  </span>
                  <strong style="margin-left:0.5rem;">${h(e.nota)} ${e.nota??`—`}</strong>
                  ${e.observations?`<p style="margin:0.25rem 0 0;font-size:0.8rem;">${k(e.observations)}</p>`:``}
                  ${e.tarea?`<p style="margin:0.2rem 0 0;font-size:0.75rem;color:var(--pm-text-muted);">Tarea: ${k(e.tarea)}</p>`:``}
                </div>
              `).join(``)}
            </div>
          </div>
        `).join(``)}
      </div>
    `,n.querySelectorAll(`.pm-eval-indicador`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.querySelector(`.pm-eval-timeline`),n=e.querySelector(`.pm-eval-toggle`),r=t.style.display!==`none`;t.style.display=r?`none`:`block`,n.classList.toggle(`bi-chevron-down`,r),n.classList.toggle(`bi-chevron-up`,!r)})})}catch(t){let n=e.querySelector(`#pm-alumno-progreso-root`);n&&(n.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger);">Error al cargar evaluaciones: ${k(t.message)}</p>`)}}async function na(e,{alumnoId:t}){if(e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`,!C()){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}if(!t){e.innerHTML=`<p class="pm-empty">No se especificó el alumno.</p>`;return}try{let{data:n,error:r}=await x.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, tlf_alumno, fecha_nacimiento, created_at, nivel_actual`).eq(`id`,t).single();if(r||!n){console.error(`[AlumnoPerfil] Error al obtener alumno:`,r),e.innerHTML=`
        <div class="pm-empty" style="padding:3rem 1rem;">
          <i class="bi bi-person-x" style="font-size:3rem;opacity:0.3;"></i>
          <p>Alumno no encontrado o error de acceso.</p>
          <button class="pm-btn pm-btn-secondary" onclick="window.history.back()" style="margin-top:1rem;">Volver</button>
        </div>
      `;return}let{data:i}=await x.from(`alumnos_clases`).select(`clase:clases(id, nombre, instrumento, nivel)`).eq(`alumno_id`,t).eq(`activo`,!0),{data:a}=await x.from(`sesiones_clase`).select(`id, clase_id, fecha, contenido_dsl, asistencia`).contains(`asistencia`,[{alumno_id:t}]).order(`fecha`,{ascending:!1}).limit(50),{data:o}=await x.from(`indicator_attempts`).select(`id, nota, observations, tarea, created_at, indicator_id`).eq(`student_id`,t).order(`created_at`,{ascending:!1}).limit(30),{data:s}=await x.from(`ausencias`).select(`id, fecha_inicio, fecha_fin, motivo, estado, clase_id`).eq(`alumno_id`,t).order(`fecha_inicio`,{ascending:!1}).limit(10),c=a?.length||0,l=a?.map(e=>e.asistencia?.find(e=>e.alumno_id===t)?.estado||null)||[],u=l.filter(e=>e===`P`).length,f=l.filter(e=>e===`A`).length,p=l.filter(e=>e===`J`).length;l.filter(e=>e===`T`).length;let m=c>0?Math.round(u/c*100):0,h=o?.filter(e=>e.nota!=null&&e.nota!==0)||[],g=h.length>0?Math.round(h.reduce((e,t)=>e+t.nota,0)/h.length*10)/10:0,_=h.filter(e=>e.nota>=4).length,v=h.length,y=v>0?Math.round(_/v*100):0,b={};a?.forEach(e=>{b[e.clase_id]||(b[e.clase_id]={P:0,A:0,J:0,T:0,total:0});let n=e.asistencia?.find(e=>e.alumno_id===t);n?.estado&&(b[e.clase_id][n.estado]++,b[e.clase_id].total++)});let S=Object.keys(b),{data:ee}=await x.from(`clases`).select(`id, nombre, instrumento`).in(`id`,S),te=new Map((ee||[]).map(e=>[e.id,e])),C=`—`;if(n.fecha_nacimiento){let e=new Date(n.fecha_nacimiento),t=new Date;C=t.getFullYear()-e.getFullYear(),(t.getMonth()<e.getMonth()||t.getMonth()===e.getMonth()&&t.getDate()<e.getDate())&&C--}let ne=n.created_at?new Date(n.created_at).toLocaleDateString(`es-ES`,{month:`long`,year:`numeric`}):`Reciente`,w=(n.instrumento_principal||``).toLowerCase(),T=`var(--pm-primary)`;(w.includes(`violin`)||w.includes(`cuerda`))&&(T=`#FF3B30`),(w.includes(`piano`)||w.includes(`teclado`))&&(T=`#FF9500`),w.includes(`guitarra`)&&(T=`#5856D6`),(w.includes(`canto`)||w.includes(`voz`))&&(T=`#AF52DE`),e.innerHTML=`
      <div class="pm-alumno-zen pm-animate-fade-in">
        <!-- Hero Section -->
        <div class="pm-zen-hero" style="--accent-gradient: ${T}">
          <div class="pm-zen-hero__overlay"></div>
          <header class="pm-zen-header">
            <button id="pm-alumno-back" class="pm-zen-back">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="pm-zen-header-tag">Perfil Académico</span>
          </header>
          
          <div class="pm-zen-hero__content">
            <div class="pm-zen-avatar" style="width:70px;height:70px;font-size:1.8rem;">
              ${(n.nombre_completo||`A`)[0].toUpperCase()}
            </div>
            <div class="pm-zen-info">
              <h1 class="pm-zen-name">${k(n.nombre_completo)}</h1>
              <p class="pm-zen-instrument">${k(n.instrumento_principal||`Estudiante`)}</p>
              <p style="font-size:0.8rem;opacity:0.8;margin-top:4px;">Nivel ${n.nivel_actual||1} • ${C} años</p>
            </div>
          </div>
        </div>

        <div class="pm-zen-body">
          <!-- 📊 Panel de Métricas Principales -->
          <div class="pm-zen-mosaic" style="grid-template-columns: repeat(2, 1fr);">
            <div class="pm-zen-card pm-zen-card--large pm-glass" style="grid-column: span 2;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                <span class="pm-zen-card__label" style="font-size:0.85rem;">📈 Rendimiento Académico</span>
                <span style="font-size:1.5rem;font-weight:700;color:${g>=4?`var(--pm-success)`:g>=2?`var(--pm-warning)`:`var(--pm-danger)`}">${g.toFixed(1)}</span>
              </div>
              <div class="pm-student-panel__progress-bar" style="height:8px;border-radius:4px;background:var(--pm-border);">
                <div class="pm-student-panel__progress-fill" style="width:${y}%;background:${g>=4?`var(--pm-success)`:g>=2?`var(--pm-warning)`:`var(--pm-danger)`};height:100%;border-radius:4px;"></div>
              </div>
              <p style="font-size:0.75rem;color:var(--pm-text-muted);margin-top:0.5rem;display:flex;justify-content:space-between;">
                <span>${_}/${v} indicadores aprobados (${y}%)</span>
              </p>
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">✅ Asistencia</span>
              <span class="pm-zen-card__value" style="font-size:1.8rem;">${m}%</span>
              <p class="pm-zen-card__sub" style="font-size:0.7rem;">
                <span style="color:var(--pm-success)">${u} P</span> • 
                <span style="color:var(--pm-danger)">${f} A</span> • 
                <span style="color:var(--pm-warning)">${p} J</span>
              </p>
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">📅 Clases Activas</span>
              <span class="pm-zen-card__value" style="font-size:1.8rem;">${i?.length||0}</span>
              <p class="pm-zen-card__sub" style="font-size:0.7rem;">Materias inscritas</p>
            </div>
          </div>

          <!-- 🎵 Clases Activas -->
          ${i&&i.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🎵 Clases Inscritas</h3>
            <div class="pm-zen-clases-grid">
              ${i.map(e=>{let t=b[e.clase.id]||{P:0,A:0,J:0,total:0},n=t.total>0?Math.round(t.P/t.total*100):100;return`
                  <div class="pm-zen-clase-card pm-glass">
                    <div class="pm-zen-clase-header">
                      <strong>${k(e.clase.nombre)}</strong>
                      <span class="pm-zen-clase-nivel">Nivel ${e.clase.nivel||1}</span>
                    </div>
                    <p class="pm-zen-clase-inst">${k(e.clase.instrumento||``)}</p>
                    <div class="pm-zen-clase-stats">
                      <div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-success)">${t.P}</span>
                        <span class="pm-zen-stat-label">Presente</span>
                      </div>
                      <div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-danger)">${t.A}</span>
                        <span class="pm-zen-stat-label">Ausente</span>
                      </div>
                      <div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value">${n}%</span>
                        <span class="pm-zen-stat-label">Asistencia</span>
                      </div>
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </div>
          `:``}

          <!-- 📝 Últimas Evaluaciones -->
          ${h.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📝 Últimas Evaluaciones</h3>
            <div class="pm-zen-evaluaciones">
              ${h.slice(0,8).map(e=>{let t=new Date(e.created_at),n=e.nota>=4?`var(--pm-success)`:e.nota>=2?`var(--pm-warning)`:`var(--pm-danger)`;return`
                  <div class="pm-zen-eval-item">
                    <div class="pm-zen-eval-icon" style="background:${n}20;color:${n}">${e.nota>=4?`✅`:e.nota>=2?`⚠️`:`❌`}</div>
                    <div class="pm-zen-eval-content">
                      <div class="pm-zen-eval-header">
                        <strong>Nota: ${e.nota}</strong>
                        <span>${t.toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`})}</span>
                      </div>
                      ${e.tarea?`<p class="pm-zen-eval-tarea">${k(e.tarea)}</p>`:``}
                      ${e.observations?`<p class="pm-zen-eval-obs">${k(e.observations.substring(0,80))}${e.observations.length>80?`...`:``}</p>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </div>
          `:``}

          <!-- 📅 Historial de Asistencia -->
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📅 Historial de Asistencia</h3>
            <div class="pm-zen-asistencia-timeline">
              ${a?.slice(0,15).map(e=>{let n=e.asistencia?.find(e=>e.alumno_id===t)?.estado||null,r={P:`Presente`,A:`Ausente`,J:`Justificado`,T:`Tardanza`},i={P:`var(--pm-success)`,A:`var(--pm-danger)`,J:`var(--pm-warning)`,T:`#FF9500`},a=te.get(e.clase_id);return n?`
                  <div class="pm-zen-asistencia-item">
                    <div class="pm-zen-asistencia-dot" style="background:${i[n]||`var(--pm-border)`}"></div>
                    <div class="pm-zen-asistencia-content">
                      <div class="pm-zen-asistencia-header">
                        <strong>${r[n]||`Sin registro`}</strong>
                        <span>${new Date(e.fecha).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`2-digit`})}</span>
                      </div>
                      <span class="pm-zen-asistencia-clase">${k(a?.nombre||`Clase`)}</span>
                    </div>
                  </div>
                `:``}).join(``)||`<p class="pm-zen-empty">Sin registros de asistencia</p>`}
            </div>
          </div>

          <!-- 🚨 Ausencias Recientes -->
          ${s&&s.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🚨 Ausencias Registradas</h3>
            <div class="pm-zen-ausencias">
              ${s.map(e=>{let t=new Date(e.fecha_inicio).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}),n=e.fecha_fin?new Date(e.fecha_fin).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}):t,r={pendiente:`var(--pm-warning)`,aprobada:`var(--pm-success)`,rechazada:`var(--pm-danger)`};return`
                  <div class="pm-zen-ausencia-item">
                    <div class="pm-zen-ausencia-icon" style="background:${r[e.estado]||`var(--pm-border)`}20">
                      <i class="bi bi-calendar-x" style="color:${r[e.estado]||`var(--pm-text-muted)`}"></i>
                    </div>
                    <div class="pm-zen-ausencia-content">
                      <div class="pm-zen-ausencia-header">
                        <strong>${t===n?t:`${t} - ${n}`}</strong>
                        <span class="pm-zen-ausencia-estado" style="color:${r[e.estado]||`var(--pm-text-muted)`}">${e.estado||`pendiente`}</span>
                      </div>
                      ${e.motivo?`<p class="pm-zen-ausencia-motivo">${k(e.motivo.substring(0,60))}${e.motivo.length>60?`...`:``}</p>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </div>
          `:``}

          <!-- 📞 Información de Contacto -->
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📞 Datos de Contacto</h3>
            <div class="pm-zen-details-grid">
              <div class="pm-zen-detail">
                <i class="bi bi-telephone-fill"></i>
                <div>
                  <span>Teléfono</span>
                  <strong>${d(n.tlf_alumno)||`No registrado`}</strong>
                </div>
              </div>
              <div class="pm-zen-detail">
                <i class="bi bi-calendar-check"></i>
                <div>
                  <span>Fecha de ingreso</span>
                  <strong>${ne}</strong>
                </div>
              </div>
              <div class="pm-zen-detail">
                <i class="bi bi-cake"></i>
                <div>
                  <span>Fecha de nacimiento</span>
                  <strong>${n.fecha_nacimiento?new Date(n.fecha_nacimiento).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`}):`No registrada`}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Progreso Académico (Interactive) -->
          <div class="pm-zen-section">
            <div class="pm-zen-section-header">
              <h3 class="pm-zen-section-title">📚 Plan de Estudios</h3>
            </div>
            <div id="pm-alumno-progreso-root" class="pm-zen-progress-container">
              <div class="pm-loading-zen"><div class="pm-pulse"></div></div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .pm-zen-clases-grid {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
        .pm-zen-clase-card {
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
          padding: 0.75rem;
        }
        .pm-zen-clase-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .pm-zen-clase-header strong {
          font-size: 0.85rem;
          line-height: 1.2;
        }
        .pm-zen-clase-nivel {
          font-size: 0.65rem;
          color: var(--pm-primary);
          background: var(--pm-primary);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .pm-zen-clase-inst {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0.5rem;
        }
        .pm-zen-clase-stats {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--pm-border);
          padding-top: 0.5rem;
        }
        .pm-zen-clase-stat {
          text-align: center;
        }
        .pm-zen-stat-value {
          display: block;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .pm-zen-stat-label {
          font-size: 0.6rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-evaluaciones {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pm-zen-eval-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
        }
        .pm-zen-eval-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .pm-zen-eval-content {
          flex: 1;
          min-width: 0;
        }
        .pm-zen-eval-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .pm-zen-eval-tarea {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
        .pm-zen-eval-obs {
          font-size: 0.75rem;
          color: var(--pm-text);
          margin: 0.25rem 0 0;
          font-style: italic;
        }
        .pm-zen-asistencia-timeline {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .pm-zen-asistencia-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 0.25rem 0;
        }
        .pm-zen-asistencia-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .pm-zen-asistencia-content {
          flex: 1;
        }
        .pm-zen-asistencia-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }
        .pm-zen-asistencia-clase {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-ausencias {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pm-zen-ausencia-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
        }
        .pm-zen-ausencia-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pm-zen-ausencia-content {
          flex: 1;
        }
        .pm-zen-ausencia-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .pm-zen-ausencia-estado {
          font-size: 0.7rem;
          text-transform: capitalize;
        }
        .pm-zen-ausencia-motivo {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
      </style>
    `,e.querySelector(`#pm-alumno-back`).onclick=()=>window.history.back(),ta(e,t)}catch(t){console.error(`[AlumnoPerfil] Error crítico:`,t),e.innerHTML=`
      <div class="pm-zen-error">
        <i class="bi bi-exclamation-octagon"></i>
        <p>No pudimos cargar el perfil en este momento</p>
        <button class="pm-btn pm-btn-secondary" onclick="window.history.back()">Regresar</button>
      </div>
    `}}var ra={scales:`🎼`,arpeggios:`🎹`,left_hand:`✋`,bow:`🎻`,sound:`🔊`,intonation:`🎵`,studies:`⚙️`,repertoire:`📖`},ia={approved:`#34C759`,in_process:`#007AFF`,pending:`#ccc`,failed:`#FF3B30`},aa={approved:`Aprobado`,in_process:`En proceso`,pending:`Pendiente`,failed:`Fallido`};function oa(e){let t=(e||``).toLowerCase();for(let[e,n]of Object.entries(ra))if(t.includes(e))return n;return t.includes(`escala`)?`🎼`:t.includes(`arpegio`)?`🎹`:t.includes(`mano`)||t.includes(`izquierda`)?`✋`:t.includes(`arco`)?`🎻`:t.includes(`sonido`)?`🔊`:t.includes(`afinación`)||t.includes(`entonación`)?`🎵`:t.includes(`estudio`)?`⚙️`:t.includes(`repertorio`)||t.includes(`obra`)?`📖`:`📋`}async function sa(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=C();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let{data:n}=await x.from(`clases`).select(`id, nombre`).eq(`maestro_id`,t.id).order(`nombre`);if(!n||n.length===0){e.innerHTML=`<p class="pm-empty">No tienes clases asignadas.</p>`;return}let{data:r}=await x.from(`inscripciones`).select(`alumno_id, alumnos(id, nombre, apellido)`).in(`clase_id`,n.map(e=>e.id));e.innerHTML=`
      <div class="pm-progress-root">
        <div class="pm-progress-header">
          <h2><i class="bi bi-trophy"></i> Progresos y Logros</h2>
          <select id="pm-student-select" class="pm-input">
            <option value="">Seleccionar alumno...</option>
            ${[...new Map(r?.map(e=>[e.alumnos.id,e.alumnos])||[]).values()].map(e=>`<option value="${e.id}">${k(e.nombre)} ${k(e.apellido)}</option>`).join(``)}
          </select>
        </div>
        <div id="pm-progress-content"></div>
      </div>

      <style>
        .pm-progress-root { padding: 1rem; }
        .pm-progress-header { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .pm-progress-header h2 { margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .pm-progress-header select { max-width: 100%; }

        .pm-student-summary { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; background: var(--pm-surface); padding: 1rem; border-radius: 12px; }
        .pm-summary-row { display: flex; justify-content: space-between; align-items: center; }
        .pm-summary-label { font-size: 0.9rem; color: var(--pm-text-muted); }
        .pm-summary-value { font-weight: 700; font-size: 1rem; }
        .pm-progress-bar { width: 100%; height: 8px; background: var(--pm-border); border-radius: 4px; overflow: hidden; }
        .pm-progress-fill { height: 100%; background: var(--apple-success); transition: width 0.3s; }

        .pm-duolingo-path { display: flex; flex-direction: column; gap: 1rem; position: relative; padding: 1rem 0; }
        .pm-duolingo-path::before { content: ''; position: absolute; left: 23px; top: 0; bottom: 0; width: 2px; background: var(--pm-border); }

        .pm-level-circle { display: flex; align-items: flex-start; gap: 1rem; position: relative; z-index: 1; }
        .pm-circle { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; flex-shrink: 0; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .pm-circle:hover { transform: scale(1.1); }
        .pm-circle.approved { background: var(--apple-success); }
        .pm-circle.in_process { background: var(--apple-primary); animation: pulse 2s infinite; }
        .pm-circle.pending { background: var(--pm-border); }
        .pm-circle.failed { background: var(--pm-danger); }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .pm-level-content { flex: 1; }
        .pm-level-title { font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 0.5rem; }
        .pm-level-obj { font-size: 0.8rem; color: var(--pm-text-muted); margin-bottom: 0.5rem; }
        .pm-level-nodes { display: none; gap: 0.5rem; flex-wrap: wrap; }
        .pm-level-circle.expanded .pm-level-nodes { display: flex; }

        .pm-node-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--pm-surface-2); border-radius: 8px; border: 1px solid var(--pm-border); min-width: 150px; cursor: pointer; transition: border-color 0.2s; }
        .pm-node-card:hover { border-color: var(--apple-primary); }
        .pm-node-icon { font-size: 1.2rem; flex-shrink: 0; }
        .pm-node-info { flex: 1; min-width: 0; }
        .pm-node-name { display: block; font-size: 0.75rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pm-node-status { display: block; font-size: 0.65rem; color: var(--pm-text-muted); }

        .pm-indicators { display: none; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--pm-border); }
        .pm-node-card.expanded .pm-indicators { display: block; }
        .pm-indicator { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; font-size: 0.75rem; }
        .pm-indicator-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .pm-indicator-desc { flex: 1; }
        .pm-indicator-date { font-size: 0.65rem; color: var(--pm-text-muted); }

        .pm-empty-state { padding: 2rem 1rem; text-align: center; color: var(--pm-text-muted); }
      </style>
    `,e.querySelector(`#pm-student-select`).addEventListener(`change`,async t=>{let n=t.target.value;if(!n){e.querySelector(`#pm-progress-content`).innerHTML=``;return}await ca(e,n)})}catch(t){e.innerHTML=`<p class="pm-empty">Error: ${k(t.message)}</p>`}}async function ca(e,t){let n=e.querySelector(`#pm-progress-content`);n.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let{data:e}=await x.from(`alumnos`).select(`nombre, apellido`).eq(`id`,t).single(),{data:r}=await x.from(`academic_plans`).select(`id, route_version_id, status`).eq(`student_id`,t).in(`status`,[`in_process`,`active`]).order(`created_at`,{ascending:!1}).limit(1).maybeSingle();if(!r){n.innerHTML=`
        <div class="pm-empty-state">
          <p>Este alumno no tiene un plan académico activo.</p>
          <a href="#/ruta-plan-builder?id=${t}" class="pm-btn pm-btn-primary" style="display:inline-block;margin-top:0.5rem;">
            Crear Plan
          </a>
        </div>
      `;return}let{data:i}=await x.from(`levels`).select(`*`).eq(`route_version_id`,r.route_version_id).order(`level_number`,{ascending:!0}),{data:a}=await x.from(`student_level_progress`).select(`*`).eq(`student_id`,t),{data:o}=await x.from(`nodes`).select(`*, indicators(*)`).in(`level_id`,(i||[]).map(e=>e.id)).order(`order_index`,{ascending:!0}),{data:s}=await x.from(`student_node_progress`).select(`*, indicator_attempts(*)`).eq(`student_id`,t),c=(a||[]).filter(e=>e.status===`approved`).length,l=i?.length||0,u=l>0?Math.round(c/l*100):0;n.innerHTML=`
      <div class="pm-student-summary">
        <div class="pm-summary-row">
          <span class="pm-summary-label">Alumno</span>
          <span class="pm-summary-value">${k(e.nombre)} ${k(e.apellido)}</span>
        </div>
        <div class="pm-summary-row">
          <span class="pm-summary-label">Progreso</span>
          <span class="pm-summary-value">${c}/${l} niveles</span>
        </div>
        <div class="pm-progress-bar">
          <div class="pm-progress-fill" style="width:${u}%"></div>
        </div>
      </div>

      <div class="pm-duolingo-path">
        ${(i||[]).map(e=>{let t=a?.find(t=>t.level_id===e.id)?.status||`pending`,n=o?.filter(t=>t.level_id===e.id)||[];return`
            <div class="pm-level-circle" data-level-id="${e.id}">
              <div class="pm-circle ${t}">
                ${t===`approved`?`✓`:t===`in_process`?e.level_number:t===`failed`?`✕`:`🔒`}
              </div>
              <div class="pm-level-content">
                <div class="pm-level-title" style="cursor:pointer;" onclick="this.closest('.pm-level-circle').classList.toggle('expanded')">
                  <i class="bi bi-chevron-down" style="display:inline-block;transition:transform 0.2s;"></i>
                  Nivel ${e.level_number}: ${k(e.name)}
                </div>
                <div class="pm-level-obj">${k(e.main_objective||``)}</div>
                <div class="pm-level-nodes">
                  ${n.map(e=>{let t=s?.find(t=>t.node_id===e.id),n=t?.status||`pending`,r=e.indicators||[],i=t?.indicator_attempts||[];return`
                      <div class="pm-node-card" onclick="this.classList.toggle('expanded')">
                        <div class="pm-node-icon">${oa(e.name)}</div>
                        <div class="pm-node-info">
                          <span class="pm-node-name">${k(e.name)}</span>
                          <span class="pm-node-status">${aa[n]}</span>
                        </div>
                        ${e.is_critical?`<span style="color:var(--pm-danger);font-size:0.6rem;font-weight:700;">CRÍTICO</span>`:``}
                        <div class="pm-indicators">
                          ${r.length===0?`<p style="font-size:0.7rem;color:var(--pm-text-muted);">Sin indicadores</p>`:r.map(e=>{let t=i.find(t=>t.indicator_id===e.id);return`
                                <div class="pm-indicator">
                                  <span class="pm-indicator-dot" style="background:${ia[t?.status||`pending`]};"></span>
                                  <span class="pm-indicator-desc">${k(e.description)}</span>
                                  ${t?.created_at?`<span class="pm-indicator-date">${new Date(t.created_at).toLocaleDateString(`es`)}</span>`:``}
                                </div>
                              `}).join(``)}
                        </div>
                      </div>
                    `}).join(``)}
                </div>
              </div>
            </div>
          `}).join(``)}
      </div>
    `}catch(e){n.innerHTML=`<p class="pm-empty">Error: ${k(e.message)}</p>`}}async function la(e){let t=(await F())?.find(t=>t.id===e)?.instrumento;if(!t)return null;let n=t.split(`,`)[0].trim().toLowerCase(),{data:r,error:i}=await x.from(`routes`).select(`id, route_versions!inner(id)`).ilike(`instrument`,`%${n}%`).eq(`route_versions.status`,`published`).limit(1).maybeSingle();return i?(console.warn(`[rutaService] resolveRutaIdForClase error:`,i.message),null):r?.route_versions?.[0]?.id||r?.route_versions?.id||null}async function ua(e,t){let{data:n,error:r}=await x.from(`blocks`).select(`id, nombre:name, order_index`).eq(`route_version_id`,e).order(`order_index`,{ascending:!0});if(r)throw Error(`[rutaService] blocks: `+r.message);if(!n||n.length===0)return[];let i=n.map(e=>e.id),{data:a,error:o}=await x.from(`levels`).select(`id, block_id, nombre:name, order_index`).in(`block_id`,i).eq(`route_version_id`,e).order(`order_index`,{ascending:!0});if(o)throw Error(`[rutaService] levels: `+o.message);let s=(a??[]).map(e=>e.id);if(s.length===0)return n.map(e=>({...e,levels:[]}));let{data:c,error:l}=await x.from(`nodes`).select(`id, level_id, nombre:name, order_index`).in(`level_id`,s).eq(`route_version_id`,e).order(`order_index`,{ascending:!0});if(l)throw Error(`[rutaService] nodes: `+l.message);let u=(c??[]).map(e=>e.id),{data:d,error:f}=u.length>0?await x.from(`indicators`).select(`id, node_id, nombre:description, order_index`).in(`node_id`,u).eq(`activo`,!0).order(`order_index`,{ascending:!0}):{data:[],error:null};if(f)throw Error(`[rutaService] indicators: `+f.message);let p=await Promise.all((c??[]).map(e=>qr(e.id,t).then(t=>({nodeId:e.id,semaphore:t.semaphore})).catch(()=>({nodeId:e.id,semaphore:`gray`})))),m=new Map(p.map(e=>[e.nodeId,e.semaphore])),h=new Map;for(let e of d??[])h.has(e.node_id)||h.set(e.node_id,[]),h.get(e.node_id).push({...e,semaphore:m.get(e.node_id)??`gray`});let g=new Map;for(let e of c??[])g.has(e.level_id)||g.set(e.level_id,[]),g.get(e.level_id).push({...e,semaphore:m.get(e.id)??`gray`,indicators:h.get(e.id)??[]});let _=new Map;for(let[e]of i.map(e=>[e]))_.set(e,[]);let v=new Map;for(let e of a??[])v.has(e.block_id)||v.set(e.block_id,[]),v.get(e.block_id).push(e);for(let[e,t]of v){let n=t.map((e,t,n)=>{let r=g.get(e.id)??[],i=r.flatMap(e=>h.get(e.id)??[]),a=i.filter(e=>(m.get(e.node_id)??`gray`)===`green`).length,o=i.length>0?Math.round(a/i.length*100):0,s=r.map(e=>e.semaphore),c=s.every(e=>e===`green`)&&s.length>0?`green`:s.every(e=>e===`gray`)||s.length===0?`gray`:`yellow`,l=!1;if(t>0){let e=n[t-1],r=(g.get(e.id)??[]).flatMap(e=>h.get(e.id)??[]),i=r.filter(e=>(m.get(e.node_id)??`gray`)===`green`).length;l=r.length>0&&i/r.length<.8}return{...e,semaphore:c,locked:l,percentage:o,nodes:r}});_.set(e,n)}return n.map(e=>({...e,levels:_.get(e.id)??[]}))}var da=new Map,fa={on(e,t){da.has(e)||da.set(e,[]),da.get(e).push(t)},off(e,t){if(!da.has(e))return;let n=da.get(e),r=n.indexOf(t);r>-1&&n.splice(r,1)},emit(e,t){da.has(e)&&da.get(e).forEach(n=>{try{n(t)}catch(t){console.error(`[rutaEventEmitter] Error in listener for ${e}:`,t)}})},clearAllListeners(){da.clear()}};function pa(e,t){let{blockId:n,blockName:r,isExpanded:i,childCount:a,onToggle:o}=t;e.innerHTML=`
    <div class="block-section" data-block-id="${n}">
      <div class="block-section-header" style="
        padding: 12px 16px;
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
      ">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="
            display: inline-block;
            width: 20px;
            height: 20px;
            text-align: center;
            font-size: 0.75rem;
            color: #64748b;
            ${i?`transform: rotate(90deg);`:``}
            transition: transform 0.2s ease;
          ">▶</span>
          <span style="font-weight: 600; color: #1e293b;">${r}</span>
        </div>
        <span style="
          background: #e2e8f0;
          color: #475569;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 0.75rem;
          font-weight: 500;
        ">${a}</span>
      </div>

      <div class="block-section-content" style="${i?``:`display: none;`}">
        <!-- Child levels/nodes will be inserted here by parent -->
      </div>
    </div>
  `,e.querySelector(`.block-section-header`)?.addEventListener(`click`,()=>{o(n)})}var ma=()=>typeof global<`u`&&global.getMaestroLocal?global.getMaestroLocal():C(),ha=(...e)=>typeof global<`u`&&global.getMisClases?global.getMisClases(...e):F(...e),ga=(...e)=>typeof global<`u`&&global.loadRouteTree?global.loadRouteTree(...e):ua(...e),J={clases:[],activeClaseId:null,rutaId:null,blocks:[],loading:!1,expandedBlocks:new Set,expandedLevels:new Set,selectedIndicator:null,onTopicSelected:null},_a=!1;async function va(e,{onTopicSelected:t}={}){if(J={clases:[],activeClaseId:null,rutaId:null,blocks:[],loading:!1,expandedBlocks:new Set,expandedLevels:new Set,selectedIndicator:null,onTopicSelected:t},e.innerHTML=`<div class="pm-ruta-gamificada"><div class="pm-loading"><div class="pm-spinner"></div></div></div>`,!ma()){e.innerHTML=`<div class="pm-ruta-gamificada"><p class="pm-empty">No hay sesión activa.</p></div>`;return}try{if(Ot(),J.clases=await ha(!0),!J.clases?.length){e.innerHTML=`<div class="pm-ruta-gamificada"><p class="pm-empty">No tenés clases asignadas.</p></div>`;return}J.activeClaseId=J.clases[0].id,await ya(),ba(e),wa(e),Ta(e)}catch(t){console.error(`[rutaGameificadaView]`,t),e.innerHTML=`<div style="color:red;padding:20px;"><i class="bi bi-exclamation"></i> Error: ${t.message}</div>`}}async function ya(){J.loading=!0,J.rutaId=await la(J.activeClaseId),J.rutaId?J.blocks=await ga(J.rutaId,J.activeClaseId):J.blocks=[],J.loading=!1}function ba(e){e.innerHTML=`
    <div class="pm-ruta-gamificada">
      <div class="pm-ruta-gamificada-container" style="max-width: 800px; margin: 0 auto; padding-bottom: 100px;">
        <div id="ruta-header" style="background: white; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #e2e8f0; padding: 16px;">
          <div class="d-flex align-items-center justify-content-between">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b;">Mi Ruta</h2>
            <select id="ruta-clase-select" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #cbd5e1; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
              ${J.clases.map(e=>`<option value="${e.id}" ${e.id===J.activeClaseId?`selected`:``}>${e.nombre}</option>`).join(``)}
            </select>
          </div>
        </div>
        
        <div id="ruta-tree-area" style="padding-top: 8px;"></div>
      </div>
      <div id="ruta-action-panel"></div>
    </div>
  `;let t=e.querySelector(`#ruta-tree-area`);if(!J.rutaId){t.innerHTML=`<div style="padding:60px; text-align:center; color:#94a3b8;"><i class="bi bi-map fs-1 d-block mb-3"></i>No se encontró ruta publicada para esta clase.</div>`;return}if(J.blocks.length===0){t.innerHTML=`<div style="padding:60px; text-align:center; color:#94a3b8;">La ruta no tiene bloques configurados.</div>`;return}J.blocks.forEach(n=>{let r=document.createElement(`div`);if(t.appendChild(r),pa(r,{blockId:n.id,blockName:n.nombre,isExpanded:J.expandedBlocks.has(n.id),childCount:n.levels?.length||0,onToggle:t=>{J.expandedBlocks.has(t)?J.expandedBlocks.delete(t):J.expandedBlocks.add(t),ba(e)}}),J.expandedBlocks.has(n.id)){let t=r.querySelector(`.block-section-content`);n.levels.forEach(n=>{t.appendChild(xa(n,e))})}}),Sa(e)}function xa(e,t){let n=document.createElement(`div`);n.className=`pm-level-row`,n.style.cssText=`
    border-bottom: 1px solid #f1f5f9;
    background: ${e.locked?`#f8fafc`:`white`};
    opacity: ${e.locked?`0.7`:`1`};
  `;let r=J.expandedLevels.has(e.id);return n.innerHTML=`
    <div class="level-header" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: ${e.locked?`not-allowed`:`pointer`};">
      <div class="level-icon" style="width: 32px; height: 32px; border-radius: 8px; background: ${Ca(e.semaphore)}; display: flex; align-items: center; justify-content: center; color: white;">
        <i class="bi ${e.locked?`bi-lock-fill`:`bi-layers`}"></i>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.9rem; color: #334155;">${e.nombre}</div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
          <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
            <div style="width: ${e.percentage}%; height: 100%; background: ${Ca(e.semaphore)}; transition: width 0.3s ease;"></div>
          </div>
          <span style="font-size: 0.65rem; font-weight: 800; color: #64748b; min-width: 30px; text-align: right;">${e.percentage}%</span>
        </div>
        <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">${e.nodes?.length||0} nodos • ${e.locked?`Bloqueado`:`Disponible`}</div>
      </div>
      ${e.locked?``:`<i class="bi bi-chevron-right" style="transition: transform 0.2s; ${r?`transform: rotate(90deg);`:``}"></i>`}
    </div>
    <div class="level-content" style="${r?`display: block;`:`display: none;`} padding: 0 16px 16px 56px;">
      ${(e.nodes||[]).map(t=>`
        <div class="node-item" style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${Ca(t.semaphore)};"></span>
            <span style="font-weight: 600; font-size: 0.85rem; color: #475569;">${t.nombre}</span>
          </div>
          <div class="indicators-list" style="display: flex; flex-direction: column; gap: 4px;">
            ${(t.indicators||[]).map(n=>`
              <div class="indicator-row" 
                data-id="${n.id}" 
                data-nombre="${n.nombre}"
                data-node="${t.nombre}"
                data-level="${e.nombre}"
                data-block="${J.blocks.find(t=>t.id===e.block_id)?.nombre||``}"
                style="padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; border: 1px solid ${J.selectedIndicator?.id===n.id?`#3b82f6`:`transparent`}; background: ${J.selectedIndicator?.id===n.id?`#eff6ff`:`white`}; transition: all 0.2s;"
              >
                ${n.nombre}
              </div>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    </div>
  `,e.locked||n.querySelector(`.level-header`).addEventListener(`click`,()=>{J.expandedLevels.has(e.id)?J.expandedLevels.delete(e.id):J.expandedLevels.add(e.id),ba(t)}),n.querySelectorAll(`.indicator-row`).forEach(e=>{e.addEventListener(`click`,n=>{n.stopPropagation(),J.selectedIndicator={id:e.dataset.id,nombre:e.dataset.nombre,nodeNombre:e.dataset.node,levelNombre:e.dataset.level,blockNombre:e.dataset.block},ba(t)})}),n}function Sa(e){let t=e.querySelector(`#ruta-action-panel`);if(!J.selectedIndicator){t.innerHTML=``;return}t.innerHTML=`
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); padding: 16px; z-index: 100;">
      <div style="max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div style="flex: 1; overflow: hidden;">
          <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 2px;">
            ${J.selectedIndicator.blockNombre} › ${J.selectedIndicator.levelNombre}
          </div>
          <div style="font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${J.selectedIndicator.nombre}
          </div>
        </div>
        <div class="d-flex gap-2">
          <button id="btn-cancel-select" class="btn btn-outline-secondary btn-sm" style="border-radius: 20px; padding: 8px 16px; font-weight: 600;">Cancelar</button>
          <button id="btn-use-topic" class="btn btn-primary btn-sm" style="border-radius: 20px; padding: 8px 20px; font-weight: 600; background: #3b82f6; border-color: #3b82f6;">
            📌 Usar como tema
          </button>
        </div>
      </div>
    </div>
  `,t.querySelector(`#btn-cancel-select`).addEventListener(`click`,()=>{J.selectedIndicator=null,ba(e)}),t.querySelector(`#btn-use-topic`).addEventListener(`click`,()=>{mi({...J.selectedIndicator,indicatorId:J.selectedIndicator.id,claseId:J.activeClaseId}),J.onTopicSelected&&J.onTopicSelected(J.activeClaseId)})}function Ca(e){switch(e){case`green`:return`#22c55e`;case`yellow`:return`#eab308`;case`gray`:return`#94a3b8`;default:return`#94a3b8`}}function wa(e){e.querySelector(`#ruta-clase-select`)?.addEventListener(`change`,async t=>{J.activeClaseId=t.target.value,e.innerHTML=`<div class="pm-ruta-gamificada"><div class="pm-loading"><div class="pm-spinner"></div></div></div>`,await ya(),ba(e),wa(e)})}function Ta(e){_a||(_a=!0,fa.on(`node-covered`,()=>{ya().then(()=>{ba(e),wa(e)})}))}var Ea=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`,`domingo`];async function Da(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=C();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let{data:n}=await x.from(`system_config`).select(`value`).eq(`key`,`maestros_pueden_crear_clases`).maybeSingle();if(n?.value!==`true`){e.innerHTML=`
        <div class="pm-empty" style="text-align:center;padding:3rem 1rem;">
          <i class="bi bi-lock" style="font-size:3rem;color:var(--pm-text-muted);"></i>
          <p style="margin-top:1rem;"><strong>Crear clases deshabilitado</strong></p>
          <p style="font-size:0.85rem;color:var(--pm-text-muted);">Solo los administradores pueden crear nuevas clases. Contacta al admin si necesitas una nueva clase.</p>
        </div>
      `;return}let{data:r}=await x.from(`instrumentos`).select(`id, nombre`).order(`nombre`),{data:i}=await x.from(`maestros`).select(`id, nombre, email`).neq(`id`,t.id).order(`nombre`);e.innerHTML=`
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
              ${(r||[]).map(e=>`<option value="${e.id}">${k(e.nombre)}</option>`).join(``)}
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
                ${Ea.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
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
            <input type="text" class="pm-input" value="${k(t.nombre_completo||t.nombre||`Tú`)}" disabled>
            <input type="hidden" id="nueva-clase-maestro-titular" value="${t.id}">
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Maestro auxiliar (opcional)</label>
            <select id="nueva-clase-maestro-aux" class="pm-input">
              <option value="">Sin maestro auxiliar</option>
              ${(i||[]).map(e=>`<option value="${e.id}">${k(e.nombre||e.email)}</option>`).join(``)}
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
          ${Ea.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
        </select>
        <input type="time" class="pm-input pm-horario-inicio" value="15:30">
        <span>a</span>
        <input type="time" class="pm-input pm-horario-fin" value="17:00">
        <button class="pm-btn-remove" type="button"><i class="bi bi-x"></i></button>
      `,n.querySelector(`.pm-btn-remove`).onclick=()=>n.remove(),e.appendChild(n)},document.getElementById(`btn-guardar-clase`).onclick=async()=>{let e=document.getElementById(`nueva-clase-nombre`).value.trim(),n=document.getElementById(`nueva-clase-instrumento`).value,r=parseInt(document.getElementById(`nueva-clase-capacidad`).value)||10,i=document.getElementById(`nueva-clase-salon`).value.trim(),a=document.getElementById(`nueva-clase-maestro-aux`).value;if(!e){alert(`El nombre de la clase es obligatorio`);return}if(!n){alert(`Selecciona un instrumento`);return}let o=document.getElementById(`btn-guardar-clase`);o.disabled=!0,o.textContent=`Creando...`;try{let{data:o,error:s}=await x.from(`clases`).insert({nombre:e,instrumento_id:n,capacidad_maxima:r,salon:i,maestro_principal_id:t.id,maestro_suplente_id:a||null,activo:!0}).select().single();if(s)throw s;let c=document.querySelectorAll(`.pm-horario-row`),l=[];for(let e of c){let t=e.querySelector(`.pm-horario-dia`).value,n=e.querySelector(`.pm-horario-inicio`).value,r=e.querySelector(`.pm-horario-fin`).value;t&&n&&r&&l.push({clase_id:o.id,dia:t,hora_inicio:n,hora_fin:r})}if(l.length>0){let{error:e}=await x.from(`clase_horarios`).insert(l);if(e)throw e}alert(`¡Clase creada exitosamente!`),window.location.hash=`#/calendario`}catch(e){console.error(e),alert(`Error al crear la clase: `+e.message),o.disabled=!1,o.textContent=`Crear Clase`}},document.getElementById(`btn-cancelar-clase`).onclick=()=>{window.history.back()}}catch(t){e.innerHTML=`
      <div class="pm-empty" style="color:var(--pm-danger)">
        Error: ${k(t.message)}
      </div>
    `}}async function Oa(e,{alumnoId:t}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let n=await O.getStudent(t),r=await O.fetchRoutes();e.innerHTML=`
      <div class="pm-asist-header">
        <h2 class="apple-display-md">Asignar Ruta</h2>
        <p class="apple-caption">Configura el plan académico para <strong>${k(n.name)} ${k(n.last_name||``)}</strong></p>
      </div>

      <div class="card-apple pm-animate-slide-up" style="margin-top: 1.5rem; padding: 1.5rem;">
        <div class="mb-4">
          <label class="apple-label" style="display: block; margin-bottom: 0.5rem;">Seleccionar Ruta</label>
          <select id="route-selector" class="input-apple">
            <option value="" disabled selected>Elegí una ruta...</option>
            ${r.map(e=>`<option value="${e.id}">${k(e.name)} (${e.instrument_id||`General`})</option>`).join(``)}
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
    `;let i=e.querySelector(`#route-selector`),a=e.querySelector(`#level-selection-container`),o=e.querySelector(`#level-selector`),s=e.querySelector(`#btn-create-plan`),c=e.querySelector(`#plan-summary`),l=null,u=null,d=null;i.addEventListener(`change`,async e=>{l=e.target.value,a.style.display=`block`,o.innerHTML=`<option value="" disabled selected>Cargando niveles...</option>`,s.disabled=!0;try{let{data:e}=await x.from(`route_versions`).select(`id`).eq(`route_id`,l).eq(`is_current`,!0).single();u=e.id,d=await O.getRouteDetail(l);let t=[];d.forEach(e=>{e.levels.forEach(n=>{t.push({id:n.id,name:n.name,blockName:e.name})})}),o.innerHTML=`
          <option value="" disabled selected>Seleccioná nivel inicial...</option>
          ${t.map(e=>`<option value="${e.id}">${k(e.blockName)} - ${k(e.name)}</option>`).join(``)}
        `}catch(e){console.error(`Error loading route detail:`,e),o.innerHTML=`<option value="" disabled>Error al cargar niveles</option>`}}),o.addEventListener(`change`,()=>{s.disabled=!1;let e=o.value,t=null;d.forEach(n=>{let r=n.levels.find(t=>t.id===e);r&&(t={...r,blockName:n.name})}),t&&(c.innerHTML=`
          <div style="text-align: left;">
            <p class="apple-caption" style="margin-bottom: 0.25rem; font-weight: 600; color: var(--pm-primary);">Resumen del Nivel:</p>
            <h4 style="margin: 0; font-size: 1rem;">${k(t.blockName)} - ${k(t.name)}</h4>
            <p class="apple-caption" style="margin-top: 0.25rem;">
              Contiene ${t.nodes?.length||0} competencias y 
              ${t.nodes?.reduce((e,t)=>e+(t.indicators?.length||0),0)} indicadores medibles.
            </p>
          </div>
        `)}),s.addEventListener(`click`,async()=>{s.disabled=!0,s.innerHTML=`<div class="pm-spinner pm-spinner-sm"></div> Creando...`;try{await O.createAcademicPlan(t,u),await x.from(`student_level_progress`).upsert({student_id:t,level_id:o.value,status:`in_process`}),alert(`Plan académico creado con éxito`),window.location.hash=`#/alumno?id=${t}`}catch(e){console.error(`Error creating plan:`,e),alert(`Error al crear el plan: `+e.message),s.disabled=!1,s.textContent=`Comenzar Plan Académico`}})}catch(t){e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error: ${k(t.message)}</p></div>`}}async function ka(e,{alumnoId:t}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let{data:n,error:r}=await x.from(`academic_plans`).select(`*, route_versions(route_id, version_number, routes(name, instrument_id))`).eq(`student_id`,t).eq(`status`,`in_process`).maybeSingle();if(r)throw r;if(!n){e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-journal-x"></i>
          <p>El alumno no tiene un plan académico activo.</p>
          <button class="btn-apple-primary mt-3" onclick="window.location.hash='#/ruta-plan-builder?id=${t}'">
            Asignar Ruta
          </button>
        </div>
      `;return}let i=await O.getRouteDetail(n.route_versions.route_id),{data:a,error:o}=await x.from(`weekly_plan_entries`).select(`*`).eq(`academic_plan_id`,n.id).order(`start_date`,{ascending:!1});if(o)throw o;e.innerHTML=`
      <div class="pm-asist-header">
        <h2 class="apple-display-md">Planificación Semanal</h2>
        <p class="apple-caption">${k(n.route_versions.routes.name)} - v${n.route_versions.version_number}</p>
      </div>

      <div class="d-flex gap-2 mb-3">
        <button id="btn-new-week" class="btn-apple-primary flex-grow-1">
          <i class="bi bi-plus-lg"></i> Planificar Semana
        </button>
      </div>

      <div id="entries-list" class="mt-4">
        ${a.length===0?`
          <div class="pm-placeholder">
            <p>No hay planificación registrada aún.</p>
          </div>
        `:a.map(e=>`
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
              ${(e.planned_nodes||[]).map(e=>`<span class="badge-apple" style="background: var(--pm-bg-alt); font-size: 0.7rem;">${k(e.title)}</span>`).join(``)}
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
              ${i.map(e=>`
                <div class="mb-2">
                  <small style="font-weight: 700; color: var(--pm-text-muted); text-transform: uppercase; font-size: 0.65rem;">${k(e.name)}</small>
                  ${e.levels.map(e=>`
                    ${e.nodes.map(e=>`
                      <div class="form-check" style="padding-left: 1.5rem; margin-top: 0.25rem;">
                        <input class="form-check-input node-checkbox" type="checkbox" value="${e.id}" data-title="${k(e.title)}" id="node-${e.id}">
                        <label class="form-check-label" for="node-${e.id}" style="font-size: 0.85rem;">
                          ${k(e.title)}
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
    `;let s=e.querySelector(`#planning-modal`),c=e.querySelector(`#btn-new-week`),l=e.querySelector(`#btn-cancel-modal`),u=e.querySelector(`#btn-save-planning`);c.addEventListener(`click`,()=>{let t=new Date,n=new Date(t);n.setDate(t.getDate()+(8-t.getDay())%7);let r=new Date(n);r.setDate(n.getDate()+6),e.querySelector(`#start-date`).value=n.toISOString().split(`T`)[0],e.querySelector(`#end-date`).value=r.toISOString().split(`T`)[0],s.style.display=`flex`}),l.addEventListener(`click`,()=>{s.style.display=`none`}),u.addEventListener(`click`,async()=>{let r=e.querySelector(`#start-date`).value,o=e.querySelector(`#end-date`).value,s=e.querySelector(`#week-focus`).value,c=Array.from(e.querySelectorAll(`.node-checkbox:checked`)).map(e=>({node_id:e.value,title:e.dataset.title})),l=[];i.forEach(e=>e.levels.forEach(e=>e.nodes.forEach(e=>{c.some(t=>t.node_id===e.id)&&e.indicators.forEach(t=>{l.push({indicator_id:t.id,description:t.description,node_id:e.id,node_name:e.title,is_critical:e.is_critical})})})));try{u.disabled=!0,u.innerHTML=`<div class="pm-spinner pm-spinner-sm"></div> Guardando...`,await O.createWeeklyEntry(n.id,{week_number:a.length+1,start_date:r,end_date:o,focus:s,planned_nodes:c,planned_indicators:l}),alert(`Planificación guardada`),ka(e,{alumnoId:t})}catch(e){alert(`Error: `+e.message),u.disabled=!1,u.textContent=`Guardar`}})}catch(t){e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error: ${k(t.message)}</p></div>`}}var Aa={async render(){let e=document.createElement(`div`);return e.className=`pm-view pm-animate-fade-in`,e.innerHTML=`
      <div class="pm-asist-header">
        <h2 class="apple-display-md" style="font-size: 1.75rem;">Librería de Rutas</h2>
        <p class="apple-caption">Explora y selecciona las rutas académicas disponibles.</p>
      </div>

      <div class="pm-search-bar" style="margin-bottom: 1.5rem;">
        <div class="input-apple-group" style="position: relative;">
          <i class="bi bi-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--pm-text-muted);"></i>
          <input type="text" id="route-search" class="input-apple" placeholder="Buscar ruta o instrumento..." style="padding-left: 36px;">
        </div>
      </div>

      <div id="routes-grid" class="pm-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
        <div class="pm-loading">
          <div class="pm-spinner"></div>
        </div>
      </div>
    `,this.loadRoutes(e),e},async loadRoutes(e){let t=e.querySelector(`#routes-grid`);try{let n=await O.fetchRoutes();if(!n||n.length===0){t.innerHTML=`
          <div class="pm-placeholder" style="grid-column: 1 / -1;">
            <i class="bi bi-journal-x"></i>
            <p>No se encontraron rutas académicas activas.</p>
          </div>
        `;return}t.innerHTML=n.map(e=>`
        <div class="card-apple route-card pm-animate-slide-up" data-id="${e.id}" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <span class="badge-apple" style="background: var(--pm-primary); padding: 4px 10px; border-radius: 8px;">
                ${e.instrument_id||`General`}
              </span>
              <span class="apple-caption" style="font-size: 0.7rem; font-weight: 600;">
                v${e.route_versions?.[0]?.version_number||`1.0`}
              </span>
            </div>
            <h3 class="pm-card-title" style="font-size: 1.1rem; margin-bottom: 0.5rem;">${e.name}</h3>
            <p class="apple-caption" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;">
              ${e.description||`Sin descripción disponible.`}
            </p>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
             <span class="apple-caption" style="font-size: 0.75rem;">
               <i class="bi bi-calendar-event"></i> ${new Date(e.created_at).toLocaleDateString()}
             </span>
             <button class="btn-apple-utility" style="padding: 4px 12px; font-size: 0.8rem;">Ver Detalle</button>
          </div>
        </div>
      `).join(``),t.querySelectorAll(`.route-card`).forEach(e=>{e.onclick=()=>{let t=e.getAttribute(`data-id`);window.location.hash=`#/ruta-detalle/${t}`}});let r=e.querySelector(`#route-search`);r.oninput=e=>{let n=e.target.value.toLowerCase();t.querySelectorAll(`.route-card`).forEach(e=>{let t=e.textContent.toLowerCase();e.style.display=t.includes(n)?`flex`:`none`})}}catch(e){console.error(`Error al cargar rutas:`,e),t.innerHTML=`
        <div class="pm-placeholder" style="grid-column: 1 / -1;">
          <i class="bi bi-exclamation-triangle" style="color: var(--apple-danger);"></i>
          <p>Error al cargar las rutas académicas.</p>
        </div>
      `}}},ja={async render(e){let t=e?.id,n=new URLSearchParams(window.location.hash.split(`?`)[1]).get(`studentId`),r=document.createElement(`div`);return r.className=`pm-view pm-animate-fade-in`,r.innerHTML=`
      <div class="pm-asist-header" style="margin-bottom: 2rem;">
        <button class="btn-icon-pm" id="back-to-library" style="margin-bottom: 0.5rem; margin-left: -8px;">
          <i class="bi bi-chevron-left"></i> Volver a Librería
        </button>
        <div id="route-header-content">
          <div class="pm-loading"><div class="pm-spinner"></div></div>
        </div>
      </div>

      <div id="route-hierarchy" class="pm-hierarchy-container">
        <!-- Árbol de Niveles y Nodos -->
      </div>
    `,r.querySelector(`#back-to-library`).onclick=()=>{window.location.hash=`#/ruta-libreria`},t?this.loadRouteDetail(r,t,n):r.innerHTML=`<div class="pm-placeholder"><i class="bi bi-x-circle"></i><p>ID de ruta no proporcionado.</p></div>`,r},async loadRouteDetail(e,t,n){let r=e.querySelector(`#route-header-content`),i=e.querySelector(`#route-hierarchy`);try{let[e,a]=await Promise.all([O.getRouteDetail(t),n?O.getStudentProgress(n,t):Promise.resolve([])]),o=new Map(a.map(e=>[e.node_id,e]));if(r.innerHTML=`
        <h2 class="apple-display-md" style="font-size: 1.5rem;">Estructura Académica</h2>
        <p class="apple-caption">Visualización de niveles, nodos e indicadores.</p>
        ${n?`
          <div class="badge-apple" style="background: var(--apple-secondary); padding: 4px 12px; margin-top: 8px;">
            Viendo progreso de alumno
          </div>
        `:``}
      `,!e||e.length===0){i.innerHTML=`
          <div class="pm-placeholder">
            <i class="bi bi-diagram-3"></i>
            <p>Esta ruta no tiene niveles o bloques definidos.</p>
          </div>
        `;return}i.innerHTML=e.map(e=>`
        <div class="pm-block-section" style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--apple-primary); margin-bottom: 1rem; border-bottom: 1px solid var(--pm-border); padding-bottom: 0.5rem;">
            ${e.name}
          </h3>
          ${e.levels.map(e=>`
            <div class="pm-level-card card-apple" style="margin-bottom: 1rem; border-left: 4px solid var(--apple-secondary);">
              <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">${e.name}</h4>
              <div class="pm-nodes-grid" style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${e.nodes.map(e=>{let t=o.get(e.id)?.status||`pending`,n=O.getStatusToken(t);return`
                    <div class="pm-node-item" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: var(--pm-surface-2); border-radius: 10px;">
                      <div class="node-status-icon" style="color: ${n.color}; font-size: 1.25rem;">
                        <i class="bi ${n.icon}"></i>
                      </div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-weight: 600; font-size: 0.9rem;">${e.title}</span>
                          <span class="apple-caption" style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${n.bg}; color: ${n.color};">
                            ${n.label}
                          </span>
                        </div>
                        <p class="apple-caption" style="margin: 0.25rem 0;">${e.description||``}</p>
                        
                        <!-- Indicadores colapsables o miniatura -->
                        <div class="pm-indicators-list" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem;">
                          ${e.indicators.map(e=>`
                            <span class="apple-caption" style="font-size: 0.65rem; padding: 2px 8px; background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 99px;">
                              ${e.description}
                            </span>
                          `).join(``)}
                        </div>
                      </div>
                    </div>
                  `}).join(``)}
              </div>
            </div>
          `).join(``)}
        </div>
      `).join(``)}catch(e){console.error(`Error al cargar detalle de ruta:`,e),i.innerHTML=`<p class="pm-error-msg">Error al cargar la estructura académica.</p>`}}},Y={maestro:null,permisos:null,clases:[],submitting:!1,checked:!1};async function Ma(e){let t=C();if(!t){e.innerHTML=`
      <div class="pm-settings-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa. Inicia sesión para continuar.</p>
      </div>`;return}Y.maestro=t,Y.submitting=!1;let n=await M(t.id);if(Y.permisos=n,Y.checked=!0,!n.puede_registrar_alumnos){Na(e,n,t.id);return}try{let e=await F();Y.clases=Array.isArray(e)?e:[]}catch(e){console.warn(`[RegistroAlumno] Error cargando clases:`,e.message),Y.clases=[]}Pa(e),La(),za()}function Na(e,t,n){let r=t?.solicitudes||[],i=t?.solicitud_actual;e.innerHTML=`
    <div class="pm-settings pm-fade-in registro-alumno-view" role="main" aria-label="Registro de alumnos">
      <div class="pm-settings-empty" style="padding: 4rem 2rem; text-align: center; background: var(--pm-surface-2); border-radius: 16px; border: 1px solid var(--pm-border); max-width: 500px; margin: 2rem auto;">
        <div style="width:80px; height:80px; background:rgba(59,130,246,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 1.5rem;">
          <i class="bi bi-shield-exclamation" style="font-size:2.5rem; color:var(--pm-primary, #3b82f6);"></i>
        </div>
        <h2 style="font-weight:700; margin-bottom:0.75rem; color: var(--pm-text);">Acceso de Colaborador Requerido</h2>
        <p style="color:var(--pm-text-muted); max-width:400px; margin:0 auto 1.5rem; line-height: 1.5; font-size: 0.9rem;">
          Para poder registrar nuevos alumnos en el sistema y asignarlos a tus clases, necesitás tener activo el permiso de inscripción.
        </p>
        <div id="pm-register-action-container">
          ${r.includes(`alumnos:create`)||r.includes(`registrar_alumnos`)||i?.estado===`pendiente`&&i?.solicita_alumnos?`
            <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); padding: 0.85rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; color: #eab308; font-weight: 600; font-size: 0.85rem;">
              <i class="bi bi-clock-history"></i> Solicitud Pendiente de Aprobación
            </div>
          `:`
            <button class="btn-apple-primary" id="btn-solicitar-acceso-registro" style="padding: 0.6rem 1.5rem; font-size: 0.9rem;">
              <i class="bi bi-send-fill" style="margin-right: 6px;"></i> Solicitar Permiso de Registro
            </button>
          `}
        </div>
      </div>
    </div>`;let a=document.getElementById(`btn-solicitar-acceso-registro`);a&&a.addEventListener(`click`,async()=>{a.disabled=!0;let e=a.innerHTML;a.innerHTML=`<span class="pm-settings-spinner"></span> Enviando...`;try{let{solicitarPermiso:e}=await D(async()=>{let{solicitarPermiso:e}=await import(`./permisoService-DqFoRP7a.js`).then(e=>e.n);return{solicitarPermiso:e}},__vite__mapDeps([8,1,9,3]));await e(n,`alumnos:create`),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Solicitud de permiso enviada correctamente.`,type:`success`}}));let t=document.getElementById(`pm-register-action-container`);t&&(t.innerHTML=`
            <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); padding: 0.85rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; color: #eab308; font-weight: 600; font-size: 0.85rem; animation: pm-error-fade-in 0.3s ease;">
              <i class="bi bi-clock-history"></i> Solicitud Pendiente de Aprobación
            </div>`)}catch(t){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al solicitar: `+t.message,type:`danger`}})),a.disabled=!1,a.innerHTML=e}})}function Pa(e){e.innerHTML=`
    <div class="pm-settings pm-fade-in registro-alumno-view" role="main" aria-label="Registro de alumnos">
      <header class="pm-settings-header">
        <h1 class="apple-display-md">Registrar Alumno</h1>
        <p class="apple-caption">Completa los datos del nuevo estudiante</p>
      </header>

      <div class="pm-settings-grid" style="grid-template-columns: 1fr;">
        <!-- Datos del Estudiante -->
        <section class="card-apple pm-settings-section" aria-labelledby="alumno-title">
          <div class="pm-settings-section__header">
            <i class="bi bi-person-plus pm-icon-blue" aria-hidden="true"></i>
            <div>
              <h3 id="alumno-title" class="pm-settings-section__title">Datos del Estudiante</h3>
              <p class="pm-settings-section__desc">Información básica del alumno</p>
            </div>
          </div>
          <div class="pm-settings-form-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="pm-settings-field" style="grid-column: 1 / -1;">
              <label for="reg-nombre" class="apple-caption">Nombre Completo *</label>
              <input type="text" class="input-apple" id="reg-nombre" placeholder="Nombre y apellidos del alumno" autocomplete="off" maxlength="100">
            </div>
            <div class="pm-settings-field">
              <label for="reg-fecha-nac" class="apple-caption">Fecha de Nacimiento *</label>
              <input type="date" class="input-apple" id="reg-fecha-nac">
            </div>
            <div class="pm-settings-field">
              <label for="reg-instrumento" class="apple-caption">Instrumento Principal *</label>
              <input type="text" class="input-apple" id="reg-instrumento" placeholder="Ej. Violín, Piano..." autocomplete="off" maxlength="100">
            </div>
          </div>
        </section>

        <!-- Representante -->
        <section class="card-apple pm-settings-section" aria-labelledby="representante-title">
          <div class="pm-settings-section__header">
            <i class="bi bi-people pm-icon-teal" aria-hidden="true"></i>
            <div>
              <h3 id="representante-title" class="pm-settings-section__title">Representante</h3>
              <p class="pm-settings-section__desc">Datos del padre, madre o tutor legal</p>
            </div>
          </div>
          <div class="pm-settings-form-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="pm-settings-field">
              <label for="reg-rep-nombre" class="apple-caption">Nombre Completo *</label>
              <input type="text" class="input-apple" id="reg-rep-nombre" placeholder="Nombre del representante" autocomplete="off" maxlength="100">
            </div>
            <div class="pm-settings-field">
              <label for="reg-rep-tlf" class="apple-caption">Teléfono *</label>
              <input type="tel" class="input-apple" id="reg-rep-tlf" placeholder="809-000-0000" autocomplete="off" maxlength="20">
            </div>
            <div class="pm-settings-field">
              <label for="reg-rep-cedula" class="apple-caption">Cédula</label>
              <input type="text" class="input-apple" id="reg-rep-cedula" placeholder="000-0000000-0" autocomplete="off" maxlength="20">
            </div>
            <div class="pm-settings-field">
              <label for="reg-rep-email" class="apple-caption">Correo Electrónico</label>
              <input type="email" class="input-apple" id="reg-rep-email" placeholder="correo@ejemplo.com" autocomplete="off" maxlength="100">
            </div>
            <div class="pm-settings-field" style="grid-column: 1 / -1;">
              <label for="reg-direccion" class="apple-caption">Dirección</label>
              <input type="text" class="input-apple" id="reg-direccion" placeholder="Dirección completa del alumno" autocomplete="off" maxlength="255">
            </div>
          </div>
        </section>

        <!-- Asignación de Clase -->
        <section class="card-apple pm-settings-section" aria-labelledby="clase-title">
          <div class="pm-settings-section__header">
            <i class="bi bi-easel pm-icon-amber" aria-hidden="true"></i>
            <div>
              <h3 id="clase-title" class="pm-settings-section__title">Asignar a una Clase</h3>
              <p class="pm-settings-section__desc">Selecciona la clase del alumno (opcional)</p>
            </div>
          </div>
          <div class="pm-settings-form-grid" style="grid-template-columns: 1fr;">
            <div class="pm-settings-field">
              <label for="reg-clase" class="apple-caption">Clase</label>
              <select class="input-apple" id="reg-clase">
                <option value="">Sin clase (solo registro)</option>
                ${Y.clases.map(e=>`<option value="${k(e.id)}">${k(e.nombre||`Clase sin nombre`)}</option>`).join(``)}
              </select>
              ${Y.clases.length===0?`<p class="apple-caption" style="color:var(--pm-warning); margin-top:0.25rem;"><i class="bi bi-exclamation-triangle"></i> No tienes clases asignadas</p>`:``}
            </div>
          </div>
        </section>

        <!-- Acciones -->
        <div class="pm-settings-actions" style="gap: 0.75rem;">
          <button class="btn-apple-primary" id="btn-registrar-alumno" style="flex: 1;">
            <i class="bi bi-person-plus-fill" aria-hidden="true"></i>
            <span>Registrar Alumno</span>
          </button>
          <button class="btn-apple-secondary" id="btn-cancelar-registro">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
            <span>Cancelar</span>
          </button>
        </div>
      </div>

      <footer class="pm-settings-footer">
        <p>SOI Sistema Operativo Institucional</p>
        <p class="pm-settings-footer__version">v2.5.0 &copy; 2026</p>
      </footer>
    </div>

    <style>
      .input-apple[aria-invalid="true"] {
        border-color: var(--pm-danger, #ef4444);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
      }
      .registro-alumno-view .card-apple {
        background: var(--pm-surface);
        color: var(--pm-text);
        border-color: var(--pm-border);
      }
      .registro-alumno-view .pm-settings-section__title,
      .registro-alumno-view .apple-display-md {
        color: var(--pm-text);
      }
      .registro-alumno-view .input-apple,
      .registro-alumno-view select.input-apple {
        background: var(--pm-surface);
        color: var(--pm-text);
        border-color: var(--pm-border);
      }
      .registro-alumno-view .input-apple::placeholder {
        color: var(--pm-text-muted);
        opacity: .9;
      }
      [data-bs-theme="dark"] .registro-alumno-view .card-apple,
      [data-portal-theme="dark"] .registro-alumno-view .card-apple {
        background: rgba(28, 28, 30, .92);
        border-color: rgba(148, 163, 184, .28);
        box-shadow: 0 18px 45px rgba(0, 0, 0, .24);
      }
      [data-bs-theme="dark"] .registro-alumno-view .input-apple,
      [data-bs-theme="dark"] .registro-alumno-view select.input-apple,
      [data-portal-theme="dark"] .registro-alumno-view .input-apple,
      [data-portal-theme="dark"] .registro-alumno-view select.input-apple {
        background: rgba(15, 23, 42, .72);
        color: var(--pm-text);
        border-color: rgba(148, 163, 184, .35);
      }
      .pm-field-error {
        display: block;
        font-size: 0.75rem;
        color: var(--pm-danger, #ef4444);
        margin-top: 0.25rem;
        font-weight: 500;
        animation: pm-error-fade-in 0.2s ease;
      }
      @keyframes pm-error-fade-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>`}function Fa(){return{nombre:document.getElementById(`reg-nombre`)?.value.trim(),fechaNac:document.getElementById(`reg-fecha-nac`)?.value,instrumento:document.getElementById(`reg-instrumento`)?.value.trim(),repNombre:document.getElementById(`reg-rep-nombre`)?.value.trim(),repTlf:document.getElementById(`reg-rep-tlf`)?.value.trim(),repCedula:document.getElementById(`reg-rep-cedula`)?.value.trim(),repEmail:document.getElementById(`reg-rep-email`)?.value.trim(),direccion:document.getElementById(`reg-direccion`)?.value.trim(),claseId:document.getElementById(`reg-clase`)?.value}}function Ia(e){let t=[];if(e.nombre?e.nombre.length<3?t.push({fieldId:`reg-nombre`,message:`El nombre debe tener al menos 3 caracteres`}):e.nombre.length>100&&t.push({fieldId:`reg-nombre`,message:`El nombre no puede exceder 100 caracteres`}):t.push({fieldId:`reg-nombre`,message:`El nombre del alumno es obligatorio`}),!e.fechaNac)t.push({fieldId:`reg-fecha-nac`,message:`La fecha de nacimiento es obligatoria`});else{let n=new Date(e.fechaNac),r=new Date;n>r&&t.push({fieldId:`reg-fecha-nac`,message:`La fecha de nacimiento no puede ser futura`});let i=r.getFullYear()-n.getFullYear();i<3&&t.push({fieldId:`reg-fecha-nac`,message:`El alumno debe tener mínimo 3 años`}),i>100&&t.push({fieldId:`reg-fecha-nac`,message:`Verifica la fecha de nacimiento`})}return e.instrumento?e.instrumento.length>100&&t.push({fieldId:`reg-instrumento`,message:`El instrumento no puede exceder 100 caracteres`}):t.push({fieldId:`reg-instrumento`,message:`El instrumento principal es obligatorio`}),e.repNombre?e.repNombre.length>100&&t.push({fieldId:`reg-rep-nombre`,message:`El nombre del representante no puede exceder 100 caracteres`}):t.push({fieldId:`reg-rep-nombre`,message:`El nombre del representante es obligatorio`}),e.repTlf?e.repTlf.length>20&&t.push({fieldId:`reg-rep-tlf`,message:`El teléfono no puede exceder 20 caracteres`}):t.push({fieldId:`reg-rep-tlf`,message:`El teléfono del representante es obligatorio`}),e.repCedula&&e.repCedula.length>20&&t.push({fieldId:`reg-rep-cedula`,message:`La cédula no puede exceder 20 caracteres`}),e.repEmail&&(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.repEmail)?e.repEmail.length>100&&t.push({fieldId:`reg-rep-email`,message:`El correo no puede exceder 100 caracteres`}):t.push({fieldId:`reg-rep-email`,message:`El formato del correo electrónico no es válido`})),e.direccion&&e.direccion.length>255&&t.push({fieldId:`reg-direccion`,message:`La dirección no puede exceder 255 caracteres`}),t}function La(){document.getElementById(`btn-registrar-alumno`)?.addEventListener(`click`,Ra),document.getElementById(`btn-cancelar-registro`)?.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Registro cancelado`,type:`info`}})),window.location.hash=`#/hoy`})}async function Ra(){if(Y.submitting)return;let e=Fa(),t=Ia(e);if(t.length>0){Nt(document.getElementById(`reg-nombre`)?.closest(`.pm-settings`)||document),t.forEach(e=>{let t=document.getElementById(e.fieldId);t&&jt(t,e.message)});return}if(e.repEmail&&await s(e.repEmail)){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`El correo del representante ya está registrado en el sistema`,type:`danger`}})),Y.submitting=!1;return}if(e.repCedula&&await n(e.repCedula)){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`La cédula del representante ya está registrada en el sistema`,type:`danger`}})),Y.submitting=!1;return}Y.submitting=!0;let r=document.getElementById(`btn-registrar-alumno`),i=r.innerHTML;r.disabled=!0,r.innerHTML=`<span class="pm-settings-spinner"></span><span>Registrando...</span>`;try{let t=await b({nombre:e.nombre,nombre_completo:e.nombre,fecha_nacimiento:e.fechaNac,instrumento:e.instrumento,instrumento_principal:e.instrumento,representante_nombre:e.repNombre,familiar_nombre:e.repNombre,representante_tlf:p(e.repTlf)||e.repTlf,familiar_telefono:p(e.repTlf)||e.repTlf,representante_cedula:e.repCedula||null,correo_representante:e.repEmail||null,direccion:e.direccion||null,is_active:!0,activo:!0});if(e.claseId)try{let{inscribirAlumno:n}=await D(async()=>{let{inscribirAlumno:e}=await import(`./clasesApi-3E3-66yq.js`).then(e=>e.r);return{inscribirAlumno:e}},__vite__mapDeps([16,1,3]));typeof n==`function`&&await n(e.claseId,t.id)}catch(e){console.warn(`[Registro] No se pudo inscribir en clase:`,e.message)}window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Alumno ${e.nombre} registrado exitosamente`,type:`success`}})),document.getElementById(`reg-nombre`).value=``,document.getElementById(`reg-fecha-nac`).value=``,document.getElementById(`reg-instrumento`).value=``,document.getElementById(`reg-rep-nombre`).value=``,document.getElementById(`reg-rep-tlf`).value=``,document.getElementById(`reg-rep-cedula`).value=``,document.getElementById(`reg-rep-email`).value=``,document.getElementById(`reg-direccion`).value=``,document.getElementById(`reg-clase`).value=``}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al registrar: `+e.message,type:`danger`}}))}finally{Y.submitting=!1,r.disabled=!1,r.innerHTML=i}}function za(){document.querySelectorAll(`.card-apple`).forEach((e,t)=>{e.style.opacity=`0`,e.style.transform=`translateY(12px)`,setTimeout(()=>{e.style.transition=`opacity 0.4s ease, transform 0.4s ease`,e.style.opacity=`1`,e.style.transform=`translateY(0)`},50*t)})}function Ba(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function Va(e){return String(e||`?`).trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function Ha(e){if(!e||e.length===0)return`<span style="color:var(--pm-text-muted);font-size:.8rem;">Sin horario asignado</span>`;let t={lunes:`Lun`,martes:`Mar`,miercoles:`Mié`,miércoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sabado:`Sáb`,sábado:`Sáb`,domingo:`Dom`};return e.map(e=>`<span class="gcv-horario-chip">${t[e.dia]||e.dia||``} ${(e.hora_inicio||``).slice(0,5)}–${(e.hora_fin||``).slice(0,5)}</span>`).join(` `)}var Ua=null,Wa=[],Ga=new Set;async function Ka(e){e.innerHTML=ao();let t=C();if(!t){e.innerHTML=oo(`bi-lock`,`Sin sesión activa`,`Por favor ingresá nuevamente.`);return}try{let n=await M(t.id);if(!n.puede_inscribir_clases){e.innerHTML=Ja(n),Ya(t.id);return}let[r,i]=await Promise.all([je(t.id),c().catch(()=>[])]);Wa=i.filter(e=>e.activo!==!1&&e.is_active!==!1),e.innerHTML=Xa(r),no(r),r.length>0&&await Qa(r[0].id,r)}catch(t){console.error(`[GestionarClases]`,t),e.innerHTML=oo(`bi-exclamation-triangle`,`Error al cargar`,Ba(t.message))}}function qa(e){let t=e?.solicitudes||[],n=e?.solicitud_actual;return t.includes(`clases:enroll`)||t.includes(`inscribir_clases`)||n?.estado===`pendiente`&&n?.solicita_clases}function Ja(e){return`
    <div class="gcv-root">
      <div class="gcv-permission-card">
        <div class="gcv-permission-icon">
          <i class="bi bi-shield-exclamation"></i>
        </div>
        <h2 class="gcv-permission-title">Acceso de Colaborador Requerido</h2>
        <p class="gcv-permission-copy">
          Para gestionar clases e inscribir alumnos, necesitás que Admin active tu permiso de clases.
        </p>
        <div id="gcv-permission-action">
          ${qa(e)?`
            <div class="gcv-pending-badge">
              <i class="bi bi-clock-history"></i>
              Solicitud Pendiente de Aprobación
            </div>
          `:`
            <button class="gcv-btn gcv-btn-primary" id="gcv-btn-request-classes" type="button">
              <i class="bi bi-send-fill"></i>
              Solicitar Permiso de Clases
            </button>
          `}
        </div>
      </div>
    </div>
  `}function Ya(e){let t=document.getElementById(`gcv-btn-request-classes`);t&&t.addEventListener(`click`,async()=>{t.disabled=!0;let n=t.innerHTML;t.innerHTML=`<span class="gcv-spinner-sm"></span> Enviando...`;try{await De(e,`clases:enroll`),E.success(`Solicitud de permiso enviada correctamente.`);let t=document.getElementById(`gcv-permission-action`);t&&(t.innerHTML=`
          <div class="gcv-pending-badge">
            <i class="bi bi-clock-history"></i>
            Solicitud Pendiente de Aprobación
          </div>`)}catch(e){E.error(`Error al solicitar: `+e.message),t.disabled=!1,t.innerHTML=n}})}function Xa(e){return`
    <div class="gcv-root">
      <div class="gcv-header">
        <div class="gcv-header-left">
          <i class="bi bi-mortarboard gcv-header-icon"></i>
          <div>
            <h2 class="gcv-title">Mis Clases</h2>
            <p class="gcv-subtitle">${e.length} clase${e.length===1?``:`s`} asignada${e.length===1?``:`s`}</p>
          </div>
        </div>
      </div>

      ${e.length===0?oo(`bi-calendar-x`,`Sin clases asignadas`,`El administrador debe asignarte clases primero.`):`<div class="gcv-layout">
            <div class="gcv-clase-list" id="gcv-clase-list">
              ${e.map(e=>Za(e)).join(``)}
            </div>
            <div class="gcv-panel" id="gcv-panel">
              <div class="gcv-panel-placeholder">
                <i class="bi bi-arrow-left-circle" style="font-size:2.5rem;opacity:.3;"></i>
                <p style="margin-top:.75rem;opacity:.4;">Seleccioná una clase</p>
              </div>
            </div>
          </div>`}
    </div>
  `}function Za(e){let t=Ba(e.nombre||`Clase sin nombre`),n=Ha(e.horarios||[]),r=Ba(e.nivel||``),i=e.capacidad_maxima??e.max_alumnos??`–`;return`
    <button class="gcv-clase-card" data-clase-id="${e.id}" id="gcv-card-${e.id}" type="button">
      <div class="gcv-clase-card-top">
        <div class="gcv-clase-avatar">
          <i class="bi bi-music-note-beamed"></i>
        </div>
        <div class="gcv-clase-info">
          <span class="gcv-clase-name">${t}</span>
          ${r?`<span class="gcv-clase-nivel">${r}</span>`:``}
        </div>
        <i class="bi bi-chevron-right gcv-clase-arrow"></i>
      </div>
      <div class="gcv-clase-horarios">${n}</div>
      <div class="gcv-clase-meta">
        <span><i class="bi bi-people"></i> Cap. ${i}</span>
      </div>
    </button>
  `}async function Qa(e,t){Ua=e,document.querySelectorAll(`.gcv-clase-card`).forEach(e=>e.classList.remove(`active`)),document.getElementById(`gcv-card-${e}`)?.classList.add(`active`);let n=document.getElementById(`gcv-panel`);if(!n)return;let r=t.find(t=>t.id===e);if(r){n.innerHTML=`<div class="gcv-loading"><div class="gcv-spinner"></div></div>`;try{let i=await ke(e),a=i.map(e=>e.alumno).filter(Boolean);Ga=new Set(i.map(e=>e.alumno_id)),n.innerHTML=$a(r,a,Wa.filter(e=>!Ga.has(e.id))),ro(e,t)}catch(e){n.innerHTML=oo(`bi-exclamation-circle`,`Error al cargar alumnos`,Ba(e.message))}}}function $a(e,t,n){return`
    <div class="gcv-panel-inner">
      <div class="gcv-panel-header">
        <h3 class="gcv-panel-title"><i class="bi bi-people-fill"></i> ${Ba(e.nombre||`Clase`)}</h3>
        <span class="gcv-enrolled-badge">${t.length} alumno${t.length===1?``:`s`}</span>
      </div>

      <!-- Search bar -->
      <div class="gcv-search-bar">
        <i class="bi bi-search gcv-search-icon"></i>
        <input
          type="text"
          id="gcv-search"
          class="gcv-search-input"
          placeholder="Buscar alumno por nombre o instrumento..."
          autocomplete="off"
        />
        <button class="gcv-btn-new" id="gcv-btn-nuevo" type="button" title="Registrar nuevo alumno">
          <i class="bi bi-person-plus"></i>
          <span>Nuevo</span>
        </button>
      </div>

      <!-- Quick register form -->
      <div class="gcv-new-form d-none" id="gcv-new-form">
        <p class="gcv-new-form-title"><i class="bi bi-person-plus-fill"></i> Registrar nuevo alumno</p>
        <div class="gcv-new-form-grid">
          <input type="text" id="gcv-nuevo-nombre" class="gcv-input" placeholder="Nombre completo *" />
          <input type="text" id="gcv-nuevo-instrumento" class="gcv-input" placeholder="Instrumento *" />
          <input type="tel" id="gcv-nuevo-telefono" class="gcv-input" placeholder="Teléfono representante *" />
        </div>
        <div class="gcv-new-form-actions">
          <button type="button" class="gcv-btn gcv-btn-ghost" id="gcv-btn-cancelar-nuevo">Cancelar</button>
          <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-guardar-nuevo">
            <i class="bi bi-floppy"></i> Guardar e inscribir
          </button>
        </div>
      </div>

      <!-- Enrolled students -->
      <div class="gcv-section">
        <div class="gcv-section-header">
          <span class="gcv-section-label"><i class="bi bi-check-circle-fill gcv-icon-success"></i> Inscritos</span>
          <span class="gcv-section-count" id="gcv-count-inscritos">${t.length}</span>
        </div>
        <div id="gcv-lista-inscritos" class="gcv-student-list">
          ${t.length===0?`<p class="gcv-empty-list">Sin alumnos inscritos aún.</p>`:t.map(e=>eo(e)).join(``)}
        </div>
      </div>

      <div class="gcv-divider"></div>

      <!-- Available students -->
      <div class="gcv-section">
        <div class="gcv-section-header">
          <span class="gcv-section-label"><i class="bi bi-person-plus-fill gcv-icon-primary"></i> Agregar alumno</span>
          <span class="gcv-section-count" id="gcv-count-disponibles">${n.length} disponibles</span>
        </div>
        <div id="gcv-lista-disponibles" class="gcv-student-list gcv-available-list">
          ${n.length===0?`<p class="gcv-empty-list">Todos los alumnos activos ya están inscritos.</p>`:n.map(e=>to(e)).join(``)}
        </div>
        ${n.length>0?`
          <div class="gcv-add-actions">
            <button type="button" class="gcv-btn gcv-btn-primary" id="gcv-btn-inscribir">
              <i class="bi bi-person-check"></i> Inscribir seleccionados
            </button>
          </div>
        `:``}
      </div>
    </div>
  `}function eo(e){let t=Ba(e.nombre_completo||e.nombre||`Alumno`),n=Ba(e.instrumento_principal||e.instrumento||``);return`
    <div class="gcv-student-row inscrito-item"
         data-alumno-id="${e.id}"
         data-name="${t.toLowerCase()}"
         data-instrumento="${n.toLowerCase()}">
      <div class="gcv-student-avatar gcv-avatar-success">${Va(t)}</div>
      <div class="gcv-student-data">
        <span class="gcv-student-name">${t}</span>
        ${n?`<span class="gcv-student-sub"><i class="bi bi-music-note"></i> ${n}</span>`:``}
      </div>
      <button type="button" class="gcv-btn-remove desinscribir-btn" data-alumno-id="${e.id}" title="Quitar de la clase">
        <i class="bi bi-person-x"></i>
      </button>
    </div>
  `}function to(e){let t=Ba(e.nombre_completo||e.nombre||`Alumno`),n=Ba(e.instrumento_principal||e.instrumento||``);return`
    <label class="gcv-student-row gcv-student-selectable disponible-item"
           data-alumno-id="${e.id}"
           data-name="${t.toLowerCase()}"
           data-instrumento="${n.toLowerCase()}">
      <input class="gcv-checkbox" type="checkbox" value="${e.id}" />
      <div class="gcv-student-avatar gcv-avatar-primary">${Va(t)}</div>
      <div class="gcv-student-data">
        <span class="gcv-student-name">${t}</span>
        ${n?`<span class="gcv-student-sub"><i class="bi bi-music-note"></i> ${n}</span>`:``}
      </div>
    </label>
  `}function no(e){document.getElementById(`gcv-clase-list`)?.addEventListener(`click`,async t=>{let n=t.target.closest(`.gcv-clase-card`);if(!n)return;let r=n.dataset.claseId;r&&r!==Ua&&await Qa(r,e)})}function ro(e,t){document.getElementById(`gcv-search`)?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();document.querySelectorAll(`.inscrito-item`).forEach(e=>{let n=!t||(e.dataset.name||``).includes(t)||(e.dataset.instrumento||``).includes(t);e.style.display=n?``:`none`}),document.querySelectorAll(`.disponible-item`).forEach(e=>{let n=!t||(e.dataset.name||``).includes(t)||(e.dataset.instrumento||``).includes(t);e.style.display=n?``:`none`})}),document.getElementById(`gcv-btn-nuevo`)?.addEventListener(`click`,()=>{document.getElementById(`gcv-new-form`)?.classList.remove(`d-none`),document.getElementById(`gcv-nuevo-nombre`)?.focus()}),document.getElementById(`gcv-btn-cancelar-nuevo`)?.addEventListener(`click`,io),document.getElementById(`gcv-btn-guardar-nuevo`)?.addEventListener(`click`,async()=>{let n=document.getElementById(`gcv-nuevo-nombre`).value.trim(),r=document.getElementById(`gcv-nuevo-instrumento`).value.trim(),i=document.getElementById(`gcv-nuevo-telefono`).value.trim();if(!n||!r||!i){E.error(`Nombre, instrumento y teléfono son obligatorios`);return}let a=document.getElementById(`gcv-btn-guardar-nuevo`);a.disabled=!0,a.innerHTML=`<span class="gcv-spinner-sm"></span> Guardando...`;try{await Ae(e,(await b({nombre_completo:n,instrumento_principal:r,familiar_telefono:i,activo:!0})).id),E.success(`${n} registrado e inscrito exitosamente`),Wa=(await c().catch(()=>Wa)).filter(e=>e.activo!==!1&&e.is_active!==!1),await Qa(e,t)}catch(e){E.error(`Error: `+e.message),a.disabled=!1,a.innerHTML=`<i class="bi bi-floppy"></i> Guardar e inscribir`}}),document.getElementById(`gcv-lista-inscritos`)?.addEventListener(`click`,async n=>{let r=n.target.closest(`.desinscribir-btn`);if(!r)return;let i=r.dataset.alumnoId,a=r.closest(`.gcv-student-row`)?.querySelector(`.gcv-student-name`)?.textContent||`este alumno`;if(confirm(`¿Quitar a ${a} de esta clase?`)){r.disabled=!0,r.innerHTML=`<span class="gcv-spinner-sm"></span>`;try{await Oe(e,i),E.success(`${a} quitado de la clase`),await Qa(e,t)}catch(e){E.error(`Error: `+e.message),r.disabled=!1,r.innerHTML=`<i class="bi bi-person-x"></i>`}}}),document.getElementById(`gcv-btn-inscribir`)?.addEventListener(`click`,async()=>{let n=[...document.querySelectorAll(`#gcv-lista-disponibles .gcv-checkbox:checked`)];if(!n.length){E.error(`Seleccioná al menos un alumno`);return}let r=document.getElementById(`gcv-btn-inscribir`);r.disabled=!0,r.innerHTML=`<span class="gcv-spinner-sm"></span> Inscribiendo...`;try{for(let t of n)await Ae(e,t.value);E.success(`${n.length} alumno${n.length>1?`s`:``} inscrito${n.length>1?`s`:``} correctamente`),await Qa(e,t)}catch(e){E.error(`Error: `+e.message),r.disabled=!1,r.innerHTML=`<i class="bi bi-person-check"></i> Inscribir seleccionados`}})}function io(){let e=document.getElementById(`gcv-new-form`);e&&e.classList.add(`d-none`),[`gcv-nuevo-nombre`,`gcv-nuevo-instrumento`,`gcv-nuevo-telefono`].forEach(e=>{let t=document.getElementById(e);t&&(t.value=``)})}function ao(){return`
    <div class="gcv-root">
      <div class="gcv-header">
        <div class="gcv-skeleton gcv-skel-title"></div>
      </div>
      <div class="gcv-layout">
        <div class="gcv-clase-list">
          ${[1,2,3].map(()=>`<div class="gcv-skeleton gcv-skel-card"></div>`).join(``)}
        </div>
        <div class="gcv-panel">
          <div class="gcv-loading"><div class="gcv-spinner"></div></div>
        </div>
      </div>
    </div>
  `}function oo(e,t,n){return`
    <div class="gcv-empty-state">
      <i class="bi ${e} gcv-empty-icon"></i>
      <p class="gcv-empty-title">${t}</p>
      <p class="gcv-empty-msg">${n}</p>
    </div>
  `}async function so(e){e.innerHTML=`
    <div class="pm-view-header">
      <h2><i class="bi bi-person-check"></i> Aprobación de Maestros</h2>
      <p class="pm-view-subtitle">Revisá y aprobá las solicitudes de registro de maestros</p>
    </div>
    <div id="aprobacion-content">
      <div class="pm-loading">
        <div class="pm-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    </div>
  `;try{let{data:t,error:n}=await x.from(`profiles`).select(`id, email, nombre_completo, created_at`).eq(`rol`,`maestro`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(n)throw n;let r=e.querySelector(`#aprobacion-content`);if(!t||t.length===0){r.innerHTML=`
        <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
            <i class="bi bi-inbox"></i>
          </div>
          <h3>No hay maestros pendientes de aprobación</h3>
          <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
        </div>
      `;return}r.innerHTML=`
      <div class="table-responsive" style="margin-top: 1rem;">
        <table class="table table-dark table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Email</th>
              <th>Instrumento</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>`
              <tr data-profile-id="${e.id}">
                <td>${lo(e.nombre_completo||`—`)}</td>
                <td>${lo(e.email)}</td>
                <td>${lo(e.instrumento||`—`)}</td>
                <td>${uo(e.created_at)}</td>
                <td class="aprobacion-actions">
                  <button class="btn btn-success btn-sm btn-aprobar" data-id="${e.id}">
                    <i class="bi bi-check-circle"></i> Aprobar
                  </button>
                  <button class="btn btn-danger btn-sm btn-rechazar" data-id="${e.id}">
                    <i class="bi bi-x-circle"></i> Rechazar
                  </button>
                </td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `,r.querySelectorAll(`.btn-aprobar`).forEach(e=>{e.addEventListener(`click`,()=>co(e.dataset.id,`activo`,r))}),r.querySelectorAll(`.btn-rechazar`).forEach(e=>{e.addEventListener(`click`,()=>co(e.dataset.id,`rechazado`,r))})}catch(t){let n=e.querySelector(`#aprobacion-content`);n.innerHTML=`
      <div class="pm-error" style="text-align: center; padding: 2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar solicitudes: ${t.message}</p>
        <button class="btn btn-outline-light btn-sm" onclick="this.closest('[id]').__reload?.()">
          Intentar de nuevo
        </button>
      </div>
    `,console.error(`[AprobacionView] Error:`,t.message)}}async function co(e,t,n){let r=n.querySelector(`tr[data-profile-id="${e}"]`);if(r){r.querySelectorAll(`button`).forEach(e=>e.disabled=!0);try{let{error:i}=await x.from(`profiles`).update({estado:t}).eq(`id`,e);if(i)throw i;r.style.transition=`opacity 0.3s ease`,r.style.opacity=`0`,setTimeout(()=>r.remove(),300),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:t===`activo`?`Maestro aprobado correctamente`:`Maestro rechazado`,type:`success`}}));let a=n.querySelector(`tbody`);a&&a.querySelectorAll(`tr`).length===0&&(n.innerHTML=`
        <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
            <i class="bi bi-inbox"></i>
          </div>
          <h3>No hay maestros pendientes de aprobación</h3>
          <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
        </div>
      `)}catch(e){r.querySelectorAll(`button`).forEach(e=>e.disabled=!1),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al ${t===`activo`?`aprobar`:`rechazar`} maestro: ${e.message}`,type:`error`}})),console.error(`[AprobacionView] Action error:`,e.message)}}}function lo(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function uo(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`})}catch{return e}}async function fo(){let{data:e,error:t}=await x.from(`ausencias_maestros`).select(`
      id,
      maestro_id,
      tipo_ausencia,
      urgencia,
      fecha_inicio,
      fecha_fin,
      motivo,
      estado,
      clases_afectadas,
      actividades_por_clase,
      clase_emergente,
      archivo_url,
      created_at,
      maestros:maestro_id(nombre_completo, correo)
    `).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(t)throw t;return e||[]}async function po(e,t,n){let{data:r,error:i}=await x.from(`ausencias_maestros`).update({estado:t,decision_notas:n||null,decidido_en:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}function mo(e,t=``){return po(e,`aprobada`,t)}function ho(e,t=``){return po(e,`rechazada`,t)}function go(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function _o(e){return e.fecha_inicio===e.fecha_fin?e.fecha_inicio:`${e.fecha_inicio} al ${e.fecha_fin}`}function vo(e){return e.maestros?.nombre_completo||e.maestro_nombre||`Maestro no especificado`}function yo(e){return e.clase_emergente?.fecha?`Reprogramada para ${e.clase_emergente.fecha}${e.clase_emergente.hora?` a las ${e.clase_emergente.hora}`:``}`:e.maestro_suplente_id||e.suplente_nombre?`Suplente: ${e.suplente_nombre||e.maestro_suplente_id}`:`Pendiente de coordinación`}function bo(e,{onApprove:t=()=>{},onReject:n=()=>{}}={}){let r=document.createElement(`article`);r.className=`ausencia-approval-card`,r.dataset.ausenciaCard=e.id;let i=Array.isArray(e.clases_afectadas)?e.clases_afectadas.length:0;r.innerHTML=`
    <div class="ausencia-card-header">
      <div>
        <h3>${go(vo(e))}</h3>
        <p>${go(_o(e))}</p>
      </div>
      <span class="badge bg-warning text-dark">${go(e.estado||`pendiente`)}</span>
    </div>

    <dl class="ausencia-card-details">
      <div><dt>Tipo</dt><dd>${go(e.tipo_ausencia)}</dd></div>
      <div><dt>Urgencia</dt><dd>${go(e.urgencia)}</dd></div>
      <div><dt>Clases afectadas</dt><dd>Clases afectadas: ${i}</dd></div>
      <div><dt>Cobertura</dt><dd>${go(yo(e))}</dd></div>
    </dl>

    <p class="ausencia-card-motivo">${go(e.motivo||`Sin motivo especificado`)}</p>

    <label class="form-label">
      Notas de decisión
      <textarea class="form-control" data-decision-notes rows="2" placeholder="Agregá una nota para historial"></textarea>
    </label>

    <div class="ausencia-card-actions">
      <button type="button" class="btn btn-success btn-sm" data-action="approve">
        <i class="bi bi-check-circle"></i> Aprobar
      </button>
      <button type="button" class="btn btn-danger btn-sm" data-action="reject">
        <i class="bi bi-x-circle"></i> Rechazar
      </button>
    </div>
  `;let a=()=>r.querySelector(`[data-decision-notes]`)?.value?.trim()||``;return r.querySelector(`[data-action="approve"]`).addEventListener(`click`,()=>t(e.id,a())),r.querySelector(`[data-action="reject"]`).addEventListener(`click`,()=>n(e.id,a())),r}function xo(e,t=`success`){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:t}}))}function So(e){e.innerHTML=`
    <div class="pm-view-header">
      <h2><i class="bi bi-calendar-x"></i> Solicitudes de Ausencia</h2>
      <p class="pm-view-subtitle">Revisá y decidí las ausencias solicitadas por maestros.</p>
    </div>
    <div id="ausencias-admin-content">
      <div class="pm-loading">
        <div class="pm-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    </div>
  `}function Co(e){e.innerHTML=`
    <div class="pm-empty-state" style="text-align:center; padding:3rem 1rem;">
      <div style="font-size:3rem; margin-bottom:1rem; opacity:.5;">
        <i class="bi bi-inbox"></i>
      </div>
      <h3>No hay solicitudes de ausencia pendientes</h3>
      <p style="opacity:.65;">Las nuevas solicitudes aparecerán acá automáticamente.</p>
    </div>
  `}async function wo(e){let t=e.querySelector(`#ausencias-admin-content`);t||(t=document.createElement(`div`),t.id=`ausencias-admin-content`,e.appendChild(t));let n=await fo();if(!n.length){Co(t);return}t.innerHTML=`<div class="ausencias-admin-list"></div>`;let r=t.querySelector(`.ausencias-admin-list`);for(let t of n)r.appendChild(bo(t,{onApprove:async(t,n)=>{await mo(t,n),xo(`Ausencia aprobada correctamente`,`success`),await wo(e)},onReject:async(t,n)=>{await ho(t,n),xo(`Ausencia rechazada`,`success`),await wo(e)}}))}async function To(e){So(e);try{await wo(e)}catch(t){let n=e.querySelector(`#ausencias-admin-content`);n||=(So(e),e.querySelector(`#ausencias-admin-content`)),n||(n=document.createElement(`div`),n.id=`ausencias-admin-content`,e.appendChild(n)),n.innerHTML=`
      <div class="pm-error" style="text-align:center; padding:2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar ausencias: ${t.message}</p>
      </div>
    `,xo(`Error al cargar ausencias: ${t.message}`,`error`)}}var Eo=new class{constructor(){this.storageKey=`portal-maestros-theme`,this.init()}init(){let e=localStorage.getItem(this.storageKey),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`;this.currentTheme=e||t,this.applyTheme(this.currentTheme),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(this.storageKey)||(this.currentTheme=e.matches?`dark`:`light`,this.applyTheme(this.currentTheme))})}applyTheme(e){document.documentElement.setAttribute(`data-bs-theme`,e),document.documentElement.setAttribute(`data-portal-theme`,e),this.updateCustomProperties(e)}updateCustomProperties(e){let t=document.documentElement;e===`dark`?(t.style.setProperty(`--pm-glass-bg`,`rgba(30, 41, 59, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(255, 255, 255, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(15, 23, 42, 0.95)`)):(t.style.setProperty(`--pm-glass-bg`,`rgba(255, 255, 255, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(0, 0, 0, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(242, 242, 247, 0.95)`))}toggle(){this.currentTheme=this.currentTheme===`dark`?`light`:`dark`,this.applyTheme(this.currentTheme),localStorage.setItem(this.storageKey,this.currentTheme),window.dispatchEvent(new CustomEvent(`themeChanged`,{detail:{theme:this.currentTheme}}))}getCurrentTheme(){return this.currentTheme}createToggleButton(){let e=document.createElement(`button`);return e.className=`pm-theme-toggle`,e.setAttribute(`aria-label`,`Cambiar tema`),e.innerHTML=`
      <div class="pm-theme-toggle-track">
        <div class="pm-theme-toggle-thumb">
          <i class="bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon"></i>
        </div>
      </div>
    `,e.addEventListener(`click`,()=>{this.toggle(),this.updateButtonIcon(e)}),window.addEventListener(`themeChanged`,()=>{this.updateButtonIcon(e)}),e}updateButtonIcon(e){let t=e.querySelector(`.pm-theme-icon`);t&&(t.className=`bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon`)}};function Do(e){if(!e||typeof e!=`string`)return{claseId:null,fecha:null,isValid:!1};let t=e.match(/^\/asistencia\/([a-f0-9-]{36})\/(\d{4}-\d{2}-\d{2})$/);return t?{claseId:t[1],fecha:t[2],isValid:!0}:{claseId:null,fecha:null,isValid:!1}}function Oo(e){let{claseId:t,fecha:n,isValid:r}=Do(e);if(!r){console.warn(`[notificationService] Invalid deep link:`,e);return}window.appNavigate?.({view:`asistencia`,claseId:t,fecha:n})}ae(e=>{if(e.event===`subscriptionChanged`)console.log(`[Notif] Push subscription changed:`,e.subscribed);else if(e.event===`notificationReceived`){console.log(`[Notif] Real-time push received:`,e.notification),Fo(e.notification);let t=e.notification;t?.data?.deep_link?Oo(t.data.deep_link):t?.data?.deep_link_url&&Oo(t.data.deep_link_url),X.some(t=>t.id===e.notification.id)||(X.unshift({...e.notification,created_at:e.notification.created_at||new Date().toISOString()}),Ho())}});var ko=30*1e3,Ao=60*1e3,jo=120*1e3,Mo=new Map;function No(e){return`${e.tipo||`unknown`}:${e.clase_id||e.alumno_id||e.id||`generic`}:${Math.floor(Date.now()/Ao)}`}function Po(){let e=Date.now();for(let[t,n]of Mo.entries())e>n&&Mo.delete(t)}function Fo(e){let t=No(e),n=Date.now()+jo;Mo.set(t,n)}function Io(){return Po(),Mo.size}function Lo(e){return`notif_cache_${e}`}function Ro(e){try{let t=X.filter(e=>!String(e.id).startsWith(`local_`)).slice(0,30);localStorage.setItem(Lo(e),JSON.stringify(t))}catch{}}function zo(e){try{let t=localStorage.getItem(Lo(e));return t?JSON.parse(t):[]}catch{return[]}}var X=[],Bo=[];function Vo(e){return Bo.push(e),e(X),()=>{Bo=Bo.filter(t=>t!==e)}}function Ho(){Bo.forEach(e=>e([...X]))}async function Uo(){let e=C();if(!e)return[];X.length===0&&(X=zo(e.id),X.length>0&&Ho());try{let{data:t,error:n}=await x.from(`notificaciones`).select(`*`).eq(`profile_id`,e.id).order(`created_at`,{ascending:!1}).limit(30);if(n)return console.warn(`[NotifService] Error fetch:`,n),X;let r=(t||[]).map(e=>({...e,created_at:e.created_at||new Date().toISOString()})),i=X.filter(e=>String(e.id).startsWith(`local_`));return X=[...r,...i],await Wo(e.id),Ro(e.id),Ho(),X}catch(e){return console.error(`[NotifService]`,e),X}}async function Wo(e){try{let t=new Date,n=t.toISOString().split(`T`)[0],r=t.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[i,a]=await Promise.all([F(),St(e,n,n)]),o=i.map(e=>e.id),s=Object.fromEntries(i.map(e=>[e.id,e])),c=(await xt(o)).filter(e=>e.dia?.toLowerCase()===r);a.filter(e=>e.estado===`pendiente`||e.estado===`borrador`||e.borrador===!0);let l=new Set(a.filter(e=>e.borrador===!1||e.estado===`registrada`).map(e=>e.clase_id)),u=new Date;for(let e of c){if(!e.hora_fin||l.has(e.clase_id))continue;let[t,r]=e.hora_fin.split(`:`),i=new Date;i.setHours(parseInt(t,10),parseInt(r,10),0,0);let a=(u-i)/6e4;if(a<30)continue;let o=s[e.clase_id],c=`${e.clase_id}_${n}`;X.some(e=>e.referencia_id===c&&e.tipo===`in_app`)||X.unshift({id:`local_`+c,tipo:`in_app`,titulo:`Clase sin registrar`,mensaje:`${o?.nombre||`Tu clase`} terminó hace ${Math.round(a)} min y no registraste asistencia.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:c})}for(let e of c){if(!e.hora_inicio)continue;let[t,r]=e.hora_inicio.split(`:`),i=new Date;i.setHours(parseInt(t,10),parseInt(r,10),0,0);let a=(i-u)/6e4;if(a<0||a>15)continue;let o=s[e.clase_id],c=`prox_${e.clase_id}_${n}`;X.some(e=>e.referencia_id===c)||X.unshift({id:`local_`+c,tipo:`recordatorio_clase`,titulo:`Clase por empezar`,mensaje:`${o?.nombre||`Tu clase`} empieza en ${Math.round(a)} minutos.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:c})}}catch(e){console.warn(`[NotifService] Error local alerts:`,e)}}async function Go(e){let t=C(),n=X.find(t=>t.id===e);if(n&&(n.estado=`leida`),Ho(),t&&Ro(t.id),!String(e).startsWith(`local_`))try{await x.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`id`,e)}catch(e){console.warn(`[NotifService] Error al marcar leída`,e)}}async function Ko(e){let t=C();if(X=X.filter(t=>t.id!==e),Ho(),t&&Ro(t.id),String(e).startsWith(`local_`))return{success:!0};try{let{error:t}=await x.from(`notificaciones`).delete().eq(`id`,e);return t?(console.error(`[NotifService] Error al eliminar en base de datos:`,t.message),{success:!1,error:t}):{success:!0}}catch(e){return console.error(`[NotifService] Excepción al eliminar:`,e),{success:!1,error:e}}}async function qo(){let e=C();if(X.forEach(e=>{e.estado!==`leida`&&(e.estado=`leida`)}),Ho(),e&&Ro(e.id),e)try{await x.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`profile_id`,e.id).neq(`estado`,`leida`)}catch(e){console.warn(`[NotifService] Error al marcar todas`,e)}}function Jo(){return X.filter(e=>e.estado===`pendiente`||e.estado===`enviada`).length}var Yo=null;function Xo(){let e=C();e&&(Yo||=x.channel(`notificaciones:${e.id}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${e.id}`},t=>{let n={...t.new,created_at:t.new.created_at||new Date().toISOString()};X.some(e=>e.id===n.id)||(X.unshift(n),Ro(e.id),Ho(),Qo(n),console.log(`[Realtime] Nueva notificación recibida:`,n.titulo))}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${e.id}`},t=>{let n=X.findIndex(e=>e.id===t.new.id);n!==-1&&(X[n]={...X[n],...t.new},Ro(e.id),Ho())}).subscribe(e=>{console.log(`[Realtime] Canal notificaciones: ${e}`),e===`CHANNEL_ERROR`&&(console.warn(`[Realtime] Canal cerrado, el polling de fallback sigue activo.`),Yo=null)}))}function Zo(){Yo&&=(x.removeChannel(Yo),null)}function Qo(e){if(document.getElementById(`pm-notificaciones-drawer-overlay`)?.classList.contains(`open`))return;let t=document.getElementById(`pm-notif-inapp-toast`);t&&t.remove();let n=$o(e.tipo),r=document.createElement(`div`);r.id=`pm-notif-inapp-toast`,r.setAttribute(`role`,`alert`),r.setAttribute(`aria-live`,`polite`),r.innerHTML=`
    <div class="pm-iat-content">
      <div class="pm-iat-icon">${n}</div>
      <div class="pm-iat-text">
        <strong class="pm-iat-title">${e.titulo||`Nueva notificación`}</strong>
        <span class="pm-iat-msg">${e.mensaje||``}</span>
      </div>
      <button class="pm-iat-close" aria-label="Cerrar">×</button>
    </div>
  `,document.body.appendChild(r),ts(),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add(`pm-iat-visible`))});let i=()=>{r.classList.remove(`pm-iat-visible`),setTimeout(()=>r.remove(),350)};r.querySelector(`.pm-iat-close`).addEventListener(`click`,i),r.addEventListener(`click`,e=>{e.target.classList.contains(`pm-iat-close`)||(document.getElementById(`pm-bell-btn`)?.click(),i())}),setTimeout(i,6e3)}function $o(e){return{sesion_sin_registrar:`⚠️`,recordatorio_clase:`⏰`,mensaje_admin:`📣`,tarea_vencida:`📕`,in_app:`🔔`}[e]||`🔔`}var es=!1;function ts(){if(es)return;es=!0;let e=document.createElement(`style`);e.textContent=`
    #pm-notif-inapp-toast {
      position: fixed;
      top: 72px;
      right: 16px;
      z-index: 10002;
      max-width: 340px;
      width: calc(100vw - 32px);
      opacity: 0;
      transform: translateY(-12px);
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
      cursor: pointer;
    }
    #pm-notif-inapp-toast.pm-iat-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .pm-iat-content {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(22, 22, 30, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 12px 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    }
    .pm-iat-icon { font-size: 22px; flex-shrink: 0; line-height: 1.4; }
    .pm-iat-text { flex: 1; min-width: 0; }
    .pm-iat-title {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 2px;
    }
    .pm-iat-msg {
      display: block;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .pm-iat-close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.35);
      font-size: 18px;
      cursor: pointer;
      padding: 0 2px;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    .pm-iat-close:hover { color: #fff; }
    @media (max-width: 400px) {
      #pm-notif-inapp-toast { right: 8px; max-width: calc(100vw - 16px); }
    }
  `,document.head.appendChild(e)}var ns=null;function rs(){ns===null&&(ns=setInterval(()=>{document.visibilityState!==`hidden`&&Uo()},ko))}function is(){ns!==null&&(clearInterval(ns),ns=null)}document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`?(Uo(),rs()):is()});function as(){let e=new Date().toISOString().split(`T`)[0];X=X.filter(t=>String(t.id).startsWith(`local_`)?t.referencia_id?.includes(e):!0)}as(),document.visibilityState!==`hidden`&&rs(),`serviceWorker`in navigator&&navigator.serviceWorker.addEventListener(`message`,e=>{e.data?.type===`NAVIGATE_TO`&&e.data.hash&&(window.location.hash=e.data.hash)});var os=null;function ss(e){let t=new Date(e),n=new Date-t,r=Math.floor(n/1e3),i=Math.floor(r/60),a=Math.floor(i/60),o=Math.floor(a/24),s=new Intl.RelativeTimeFormat(`es`,{numeric:`auto`});return o>0?s.format(-o,`day`):a>0?s.format(-a,`hour`):i>0?s.format(-i,`minute`):`hace un momento`}var cs={init(){document.getElementById(`pm-notificaciones-drawer-overlay`)||(os=document.createElement(`div`),os.innerHTML=`
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
    `,document.body.appendChild(os),document.getElementById(`pm-notificaciones-close`).addEventListener(`click`,this.close),document.getElementById(`pm-notificaciones-drawer-overlay`).addEventListener(`click`,e=>{e.target.id===`pm-notificaciones-drawer-overlay`&&this.close()}),document.getElementById(`pm-notif-mark-all`).addEventListener(`click`,()=>{qo()}),Vo(e=>{this.renderList(e)}),Uo())},_updateDedupBadge(){let e=document.getElementById(`pm-notif-dedup-badge`);if(!e)return;let t=Io();t>0?(e.textContent=`🔄 ${t} dedup`,e.style.display=`inline-flex`):e.style.display=`none`},renderList(e){let t=document.getElementById(`pm-notificaciones-list`);if(t){if(this._updateDedupBadge(),e.length===0){t.innerHTML=`
        <div class="text-center text-muted mt-5">
          <i class="bi bi-bell-slash" style="font-size: 2rem; opacity: 0.5;"></i>
          <p class="mt-2">No tenés notificaciones recientes.</p>
        </div>
      `;return}t.innerHTML=ds(e).map(e=>{let t=e.count>1,n=e.items.some(e=>e.estado!==`leida`),r=fs(e.tipo,e.items[0]);return`
        <div
          class="pm-notif-item ${n?``:`leida`}"
          data-ids="${e.items.map(e=>e.id).join(`,`)}"
          data-route="${r}"
          title="${t?`Ver todo`:e.items[0].titulo}"
        >
          <div class="pm-notif-icon ${us(e.tipo)}">
            <i class="bi ${ls(e.tipo)}"></i>
          </div>
          <div class="pm-notif-content">
            <div class="pm-notif-title">
              ${t?`${e.items[0].titulo} <span class="pm-notif-count">${e.count}</span>`:e.items[0].titulo}
            </div>
            <div class="pm-notif-msg">
              ${t?`${e.count} alertas de este tipo`:e.items[0].mensaje}
            </div>
            <div class="pm-notif-time">${ss(e.items[0].created_at)}</div>
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
      `}).join(``),t.querySelectorAll(`.pm-notif-item`).forEach(e=>{e.addEventListener(`click`,t=>{if(t.target.closest(`.pm-notif-actions`))return;e.dataset.ids.split(`,`).forEach(e=>Go(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``))})}),t.querySelectorAll(`.pm-notif-btn-mark`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),e.dataset.ids.split(`,`).forEach(e=>Go(e))})}),t.querySelectorAll(`.pm-notif-btn-delete`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.dataset.ids.split(`,`);if(!confirm(`¿Estás seguro de que querés eliminar esta notificación?`))return;let r=!0;for(let e of n)(await Ko(e)).success||(r=!1);r?window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificación eliminada correctamente.`,type:`info`}})):window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Hubo un problema al eliminar la notificación.`,type:`danger`}})),Uo()})})}},open(){this.init(),this._triggerEl=document.activeElement;let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e.style.display=`block`,e.offsetHeight,e.classList.add(`open`);let t=document.querySelector(`#pm-notificaciones-drawer-overlay .pm-drawer`);t&&(this._trap&&this._trap.dispose(),this._trap=j(t,{onClose:()=>this.close()}));let n=document.getElementById(`pm-notificaciones-close`);n&&n.focus(),this._updateDedupBadge(),Uo()},close(){this._trap&&=(this._trap.dispose(),null);let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e&&(e.classList.remove(`open`),setTimeout(()=>{e.style.display=`none`},300)),this._triggerEl&&typeof this._triggerEl.focus==`function`&&this._triggerEl.focus(),this._triggerEl=null}};function ls(e){switch(e){case`sesion_sin_registrar`:return`bi-exclamation-triangle`;case`recordatorio_clase`:return`bi-clock-history`;case`mensaje_admin`:return`bi-megaphone`;case`tarea_vencida`:return`bi-journal-x`;default:return`bi-bell`}}function us(e){switch(e){case`sesion_sin_registrar`:return`bg-danger text-white`;case`recordatorio_clase`:return`bg-warning text-dark`;case`mensaje_admin`:return`bg-primary text-white`;default:return`bg-secondary text-white`}}function ds(e){let t=new Set([`recordatorio_clase`,`in_app`]),n=[],r=new Map;for(let i of e)if(t.has(i.tipo)&&r.has(i.tipo)){let e=n[r.get(i.tipo)];e.items.push(i),e.count++}else r.set(i.tipo,n.length),n.push({tipo:i.tipo,items:[i],count:1});return n}function fs(e,t){let n=t.clase_id||t.data?.clase_id,r=t.alumno_id||t.data?.alumno_id,i=t.fecha||new Date().toISOString().split(`T`)[0];switch(e){case`sesion_sin_registrar`:case`recordatorio_clase`:return n?`#/asistencia?clase=${n}&fecha=${i}`:`#/hoy`;case`mensaje_admin`:return`#/perfil`;case`tarea_vencida`:return r?`#/alumno?id=${r}`:`#/hoy`;default:return`#/hoy`}}if(!document.getElementById(`pm-notif-styles`)){let e=document.createElement(`style`);e.id=`pm-notif-styles`,e.textContent=`
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
    .pm-notif-time {
      font-size: 0.7rem;
      color: var(--pm-text-muted);
      margin-top: 0.4rem;
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
  `,document.head.appendChild(e)}var ps={container:null,async init(){document.getElementById(`push-diagnostic-panel`)||(this.createPanel(),await this.checkStatus())},createPanel(){this.container=document.createElement(`div`),this.container.id=`push-diagnostic-panel`,this.container.innerHTML=`
      <div class="push-diagnostic-overlay" id="push-diagnostic-overlay">
        <div class="push-diagnostic-card">
          <div class="push-diagnostic-header">
            <h5><i class="bi bi-bell-fill"></i> Configuración de Notificaciones</h5>
            <button class="btn-close" id="push-diagnostic-close"></button>
          </div>
          
          <div class="push-diagnostic-body">
            <!-- Estado General -->
            <div class="mb-4">
              <div class="push-status-grid">
                <div class="push-status-item" id="status-browser">
                  <div class="status-icon"><i class="bi bi-browser-chrome"></i></div>
                  <div class="status-label">Navegador</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-permission">
                  <div class="status-icon"><i class="bi bi-shield-check"></i></div>
                  <div class="status-label">Permiso</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-serviceworker">
                  <div class="status-icon"><i class="bi bi-gear"></i></div>
                  <div class="status-label">Service Worker</div>
                  <div class="status-value">...</div>
                </div>
                <div class="push-status-item" id="status-subscription">
                  <div class="status-icon"><i class="bi bi-radioactive"></i></div>
                  <div class="status-label">Suscripción</div>
                  <div class="status-value">...</div>
                </div>
              </div>
            </div>

            <!-- Diagnóstico Detallado -->
            <div class="push-diagnostic-details" id="diagnostic-details">
              <!-- Se llena dinámicamente -->
            </div>

            <!-- Acciones -->
            <div class="push-diagnostic-actions mt-4">
              <button class="btn-push-ios-primary w-100" id="btn-enable-push">
                <i class="bi bi-bell-fill"></i> Activar Notificaciones
              </button>
              <button class="btn-push-ios-secondary w-100" id="btn-test-push">
                <i class="bi bi-send-fill"></i> Probar Notificación
              </button>
            </div>

            <!-- Resultado -->
            <div class="push-diagnostic-result mt-3" id="diagnostic-result"></div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(this.container),this.injectStyles(),this.bindEvents()},injectStyles(){if(document.getElementById(`push-diagnostic-styles`))return;let e=document.createElement(`style`);e.id=`push-diagnostic-styles`,e.textContent=`
      .push-diagnostic-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        animation: pm-fade-in 0.3s ease-out;
      }
      
      .push-diagnostic-card {
        background: var(--pm-surface, #fff);
        border-radius: 24px;
        width: 92%;
        max-width: 440px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: pm-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .push-diagnostic-header {
        background: var(--pm-primary);
        color: white;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
      }
      
      .push-diagnostic-header h5 {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      
      .push-diagnostic-body {
        padding: 1.5rem;
        background: var(--pm-surface);
      }
      
      .push-status-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 1.5rem;
      }
      
      .push-status-item {
        background: var(--pm-surface-2);
        border-radius: 20px;
        padding: 1.25rem;
        text-align: center;
        border: 1px solid var(--pm-border);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .push-status-item.success { border-color: rgba(74, 222, 128, 0.4); background: rgba(74, 222, 128, 0.05); }
      .push-status-item.warning { border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.05); }
      .push-status-item.error { border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); }
      
      .push-status-item .status-icon {
        font-size: 1.75rem;
        margin-bottom: 0.75rem;
        color: var(--pm-primary);
      }
      
      .push-status-item.success .status-icon { color: #22c55e; }
      .push-status-item.warning .status-icon { color: #f59e0b; }
      
      .push-status-item .status-label {
        font-size: 0.7rem;
        color: var(--pm-text-muted);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      
      .push-status-item .status-value {
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--pm-text);
      }
      
      .push-diagnostic-details {
        background: var(--pm-surface-2);
        border-radius: 16px;
        padding: 0.5rem 1rem;
        border: 1px solid var(--pm-border);
        margin-bottom: 1.5rem;
      }
      
      .push-diagnostic-details .log-item {
        padding: 10px 0;
        border-bottom: 1px solid var(--pm-border);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .push-diagnostic-details .log-item:last-child { border-bottom: none; }
      .push-diagnostic-details .log-ok { color: #22c55e; }
      .push-diagnostic-details .log-warn { color: #f59e0b; }
      .push-diagnostic-details .log-error { color: #ef4444; }
      
      .push-diagnostic-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .btn-push-ios-primary {
        background: var(--pm-primary);
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 14px;
        font-weight: 700;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        transition: all 0.2s;
      }
      
      .btn-push-ios-secondary {
        background: var(--pm-surface-2);
        color: var(--pm-text);
        border: 1px solid var(--pm-border);
        padding: 0.85rem;
        border-radius: 14px;
        font-weight: 600;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }
      
      .btn-push-ios-primary:active, .btn-push-ios-secondary:active {
        transform: scale(0.97);
        opacity: 0.8;
      }

      .push-diagnostic-result {
        margin-top: 1.25rem;
        padding: 1rem;
        border-radius: 14px;
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
        animation: pm-fade-in 0.3s;
      }
      
      .push-diagnostic-result.success { background: rgba(34, 197, 94, 0.1); color: #166534; }
      .push-diagnostic-result.error { background: rgba(239, 68, 68, 0.1); color: #991b1b; }
      .push-diagnostic-result.info { background: rgba(59, 130, 246, 0.1); color: #1e40af; }

      [data-portal-theme="dark"] .push-diagnostic-card { background: #1c1c1e; }
      [data-portal-theme="dark"] .push-status-item { background: #2c2c2e; }
    `,document.head.appendChild(e)},bindEvents(){document.getElementById(`push-diagnostic-close`).addEventListener(`click`,()=>this.close()),document.getElementById(`push-diagnostic-overlay`).addEventListener(`click`,e=>{e.target.id===`push-diagnostic-overlay`&&this.close()}),document.getElementById(`btn-enable-push`).addEventListener(`click`,()=>this.enablePush()),document.getElementById(`btn-test-push`).addEventListener(`click`,()=>this.testPush())},async checkStatus(){let e=[],t=document.getElementById(`diagnostic-details`),n=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),r=/iPhone|iPad|iPod/i.test(navigator.userAgent),i=/^((?!chrome|android).)*safari/i.test(navigator.userAgent);e.push({text:`📱 Dispositivo: ${n?r?`iOS`:`Android`:`Desktop`}`,type:`info`}),n&&i&&e.push({text:`⚠️ iOS Safari: Requiere iOS 16.4+ y agregar a pantalla de inicio`,type:`warn`});let a=le();e.push({text:`Navegador: ${a?`✅ Compatible`:`❌ No compatible`}`,type:a?`ok`:`error`}),this.updateStatusItem(`status-browser`,a);let o=`default`;`Notification`in window&&(o=Notification.permission);let s=o===`granted`;e.push({text:`Permiso: ${o===`granted`?`✅ Otorgado`:o===`denied`?`❌ Denegado - ve a Configuración del navegador`:`⚠️ No solicitado - click en Activar abajo`}`,type:s?`ok`:`warn`}),this.updateStatusItem(`status-permission`,s,o);let c=`no-registrado`,l=!1;if(`serviceWorker`in navigator)try{let t=await navigator.serviceWorker.getRegistration(`/sw.js`);t?(c=t.active?`✅ Activo`:`⏳ Registrado`,l=!!t.active,e.push({text:`Service Worker: ${c}`,type:`ok`})):e.push({text:`Service Worker: ❌ No registrado`,type:`error`}),this.updateStatusItem(`status-serviceworker`,l)}catch(t){e.push({text:`Service Worker: ❌ Error - ${t.message}`,type:`error`}),this.updateStatusItem(`status-serviceworker`,!1)}else e.push({text:`Service Worker: ❌ No soportado`,type:`error`}),this.updateStatusItem(`status-serviceworker`,!1);let u=`no-suscrito`;if(l)try{let t=await de();u=t.subscribed?`✅ Suscrito`:`❌ No suscrito`,e.push({text:`Suscripción: ${u}`,type:t.subscribed?`ok`:`warn`}),this.updateStatusItem(`status-subscription`,t.subscribed)}catch(t){e.push({text:`Suscripción: ❌ Error - ${t.message}`,type:`error`}),this.updateStatusItem(`status-subscription`,!1)}else e.push({text:`Suscripción: ⚠️ SW inactivo`,type:`warn`}),this.updateStatusItem(`status-subscription`,!1);return t.innerHTML=e.map(e=>`<div class="log-item log-${e.type}">${e.text}</div>`).join(``),{browserSupported:a,permOk:s,swActive:l}},updateStatusItem(e,t,n=``){let r=document.getElementById(e);r.className=`push-status-item ${t?`success`:`warning`}`;let i=r.querySelector(`.status-value`);i.textContent=t?`✓ Listo`:`⚠ Revisar`,n&&(i.textContent+=` (${n})`)},async enablePush(){let e=document.getElementById(`diagnostic-result`),t=document.getElementById(`btn-enable-push`);t.disabled=!0,t.innerHTML=`<span class="pm-spinner-sm me-2"></span> Configurando...`;try{e.className=`push-diagnostic-result info`;let t=/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent),n=/iPhone|iPad|iPod/i.test(navigator.userAgent);t&&n?e.innerHTML=`📱 iOS detectado: Se abrirá una solicitud de permiso...`:t?e.innerHTML=`📱 Android detectado: Solicitando permiso...`:e.innerHTML=`Solicitando permiso de notificaciones...`;let{granted:r,error:i}=await pe();if(!r)throw Error((i||`Permiso denegado`)+(t?`<br><br><strong>En móvil:</strong> Ve a Configuración → Safari → Notificaciones → Permitir`:``));e.innerHTML=`Registrando en el sistema de notificaciones...`;let a=await he();if(!a.success)throw Error(a.error||`Error al suscribirse a push`);e.className=`push-diagnostic-result success`;let o=/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent),s=`✅ ¡Notificaciones push activadas!`;o&&(s+=`<br><small>💡 En móvil, agrega la app a pantalla de inicio para notificaciones completas (botón Compartir → Agregar a pantalla de inicio)</small>`),e.innerHTML=s,await this.checkStatus(),setTimeout(()=>this.testPush(),2e3)}catch(t){e.className=`push-diagnostic-result error`,e.innerHTML=`❌ ${t.message}`}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-bell me-2"></i>Activar Notificaciones Push`}},async testPush(){let e=document.getElementById(`diagnostic-result`);try{let t=await se();t.success?(e.className=`push-diagnostic-result success`,e.innerHTML=`✅ ${t.method===`serviceWorker`?`¡Notificación del sistema enviada! Deberías verla en tu escritorio.`:`Notificación enviada (modo local).`}`):(e.className=`push-diagnostic-result error`,e.innerHTML=`❌ ${t.error}`)}catch(t){e.className=`push-diagnostic-result error`,e.innerHTML=`❌ Error: ${t.message}`}},open(){this.init();let e=document.getElementById(`push-diagnostic-overlay`);e.style.display=`flex`;let t=document.querySelector(`#push-diagnostic-panel .push-diagnostic-card`);t&&(this._trap&&this._trap.dispose(),this._trap=j(t,{onClose:()=>this.close()}))},close(){this._trap&&=(this._trap.dispose(),null);let e=document.getElementById(`push-diagnostic-overlay`);e&&(e.style.display=`none`)}};if(i(),`serviceWorker`in navigator){let e=async()=>{try{let e=await navigator.serviceWorker.register(`/sw.js`);console.log(`[PWA] Service Worker registered:`,e.scope)}catch(e){console.log(`[PWA] Service Worker registration failed:`,e)}};document.readyState===`complete`?e():window.addEventListener(`load`,e)}console.log(`[SOI] Initializing professionalization services...`),qe(),Ue({windowMs:6e4,max:100}),Ve({enabled:!1,consent:!1}),Xe({debug:!1}),Re({dsn:null,environment:`production`}),window.addEventListener(`showToast`,e=>{let{message:t,type:n=`info`}=e.detail||{};t&&E.show(t,n)});var ms=window.__SOI_MODE__===`admin`;function hs(e){let t=[{id:`calendario`,label:`Calendario`,icon:`bi-calendar3`},{id:`hoy`,label:`Hoy`,icon:`bi-house-door`},{id:`planificacion`,label:`Plan`,icon:`bi-signpost-split`},{id:`metricas`,label:`Métricas`,icon:`bi-bar-chart-line`}];return e?.puede_registrar_alumnos&&t.push({id:`registrar-alumno`,label:`Registrar`,icon:`bi-person-plus`}),e?.puede_inscribir_clases&&t.push({id:`gestionar-clases`,label:`Clases`,icon:`bi-mortarboard`}),t}var gs=[{id:`admin-alumnos`,label:`Alumnos`,icon:`bi-people-fill`},{id:`admin-programas`,label:`Programas`,icon:`bi-grid-1x2`},{id:`admin-maestros`,label:`Maestros`,icon:`bi-person-badge`},{id:`admin-aprobacion`,label:`Aprobación`,icon:`bi-check-circle-fill`},{id:`admin-ausencias`,label:`Ausencias`,icon:`bi-calendar-x`},{id:`admin-metricas`,label:`Métricas`,icon:`bi-bar-chart-line`}],_s=e=>ms?gs:hs(e),vs=null,ys=null,Z=st();window.router=Z;async function bs(e){let{tabla:t,operacion:n,payload:r}=e,i={...r};t===`sesiones_clase`&&(i.contenido_dsl!==void 0&&(i.contenido=i.contenido_dsl,delete i.contenido_dsl),i.asistencias!==void 0&&i.asistencia===void 0&&(i.asistencia=i.asistencias,delete i.asistencias)),console.log(`[SYNC] Intentando ${n} en ${t}:`,i);try{if(n===`insert`){let{error:e}=await x.from(t).insert([i]);if(e)throw console.error(`[SYNC] Error en INSERT ${t}:`,e),e}else if(n===`update`){let{id:e,...n}=i,{error:r}=await x.from(t).update(n).eq(`id`,e);if(r)throw console.error(`[SYNC] Error en UPDATE ${t}:`,r),r}else if(n===`delete`){let{error:e}=await x.from(t).delete().eq(`id`,i.id);if(e)throw console.error(`[SYNC] Error en DELETE ${t}:`,e),e}}catch(e){if(e.code===`PGRST204`){let{data:e}=await x.from(t).select().limit(1);e&&e.length>0?console.warn(`[SYNC] Columnas REALES encontradas:`,Object.keys(e[0])):console.warn(`[SYNC] No se pueden leer las columnas. ¿Ejecutaste el SQL en Supabase?`)}throw console.error(`[SYNC] Error crítico en _syncWithSupabase:`,e),e}}var xs=null;async function Ss(){let e=document.getElementById(`pm-sync-indicator`);if(e)try{let t=await re();t.length===0?(e.className=`pm-sync-indicator synced`,e.innerHTML=`✓ <span class="pm-hide-mobile">Sincronizado</span>`):(e.className=`pm-sync-indicator pending`,e.innerHTML=`⏳ <span class="pm-hide-mobile">Pendiente (${t.length})</span>`)}catch{e.className=`pm-sync-indicator error`,e.innerHTML=`⚠️ <span class="pm-hide-mobile">Error de sync</span>`}}async function Cs(){clearTimeout(xs),xs=setTimeout(async()=>{if(navigator.onLine)try{await T(bs)}finally{await Ss()}},1e3)}window.addEventListener(`online`,Cs),window.addEventListener(`offline`,Ss);function ws(){let e=document.getElementById(`portal-app`);if(!e)return;let t=e.querySelector(`.pm-header`),n=e.querySelector(`.pm-bottom-nav`),r=e.querySelector(`.pm-view`);t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.display=`none`)}function Ts(){let e=document.getElementById(`portal-app`);if(!e)return;let t=e.querySelector(`.pm-header`),n=e.querySelector(`.pm-bottom-nav`),r=e.querySelector(`.pm-view`);t&&(t.style.display=``),n&&(n.style.display=``),r&&(r.style.display=``)}function Es(){let e=document.getElementById(`portal-app`);if(!e)return;let t=[`login`,`register`,`pending-approval`],n=(Z.currentRoute?.()||`login`).split(`?`)[0];if(t.includes(n)&&n!==`login`){console.log(`[Auth] Manteniendo ruta pública:`,n),document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Is(),Ds(),Z.setAuthGuard(()=>it.isAuthenticated(),t),Z.start();return}let r=Ps.login;if(r){ws(),r.style.display=`block`,r.innerHTML=``,Pt(r,{onSuccess:e=>{e&&e!==`login`?(Ts(),Z.navigate(e)):Bs()}});return}e.innerHTML=``,Pt(e,{onSuccess:()=>Bs()})}function Ds(){Z.on(`login`,(e,t)=>$(`login`,t)),Z.on(`logout`,(e,t)=>$(`logout`,t)),Z.on(`calendario`,(e,t)=>$(`calendario`,t)),Z.on(`clases`,(e,t)=>$(`clases`,t)),Z.on(`hoy`,(e,t)=>$(`hoy`,t)),Z.on(`asistencia`,(e,t)=>$(`asistencia`,t)),Z.on(`metricas`,(e,t)=>$(`metricas`,t)),Z.on(`perfil`,(e,t)=>$(`perfil`,t)),Z.on(`clase-emergente`,(e,t)=>$(`clase-emergente`,t)),Z.on(`planificacion`,(e,t)=>$(`planificacion`,t)),Z.on(`alumno`,(e,t)=>$(`alumno`,t)),Z.on(`gamificacion`,(e,t)=>$(`gamificacion`,t)),Z.on(`ruta`,(e,t)=>$(`ruta`,t)),Z.on(`crear-clase`,(e,t)=>$(`crear-clase`,t)),Z.on(`ruta-plan-builder`,(e,t)=>$(`ruta-plan-builder`,t)),Z.on(`ruta-semanal`,(e,t)=>$(`ruta-semanal`,t)),Z.on(`ruta-libreria`,(e,t)=>$(`ruta-libreria`,t)),Z.on(`ruta-detalle/:id`,(e,t)=>$(`ruta-detalle`,t)),Z.on(`registrar-alumno`,(e,t)=>$(`registrar-alumno`,t)),Z.on(`gestionar-clases`,(e,t)=>$(`gestionar-clases`,t)),Z.on(`register`,(e,t)=>$(`register`,t)),Z.on(`pending-approval`,(e,t)=>$(`pending-approval`,t)),ms?(Z.on(`admin-alumnos`,(e,t)=>$(`admin-alumnos`,t)),Z.on(`admin-programas`,(e,t)=>$(`admin-programas`,t)),Z.on(`admin-maestros`,(e,t)=>$(`admin-maestros`,t)),Z.on(`admin-metricas`,(e,t)=>$(`admin-metricas`,t)),Z.on(`admin-config`,(e,t)=>$(`admin-config`,t)),Z.on(`admin-clases`,(e,t)=>$(`admin-clases`,t)),Z.on(`admin-sesiones`,(e,t)=>$(`admin-sesiones`,t)),Z.on(`admin-aprobacion`,(e,t)=>$(`admin-aprobacion`,t)),Z.on(`admin-ausencias`,(e,t)=>$(`admin-ausencias`,t)),Z.onNotFound(()=>$(`admin-alumnos`))):Z.onNotFound(()=>$(`hoy`))}function Os(){let e=window.innerWidth;return e<768?`mobile`:e<1024?`tablet`:`desktop`}var ks=Os();window.addEventListener(`resize`,()=>{let e=Os();e!==ks&&(ks=e,document.body.dataset.pmLayout=e)},{passive:!0});function As(e,t,n){vs=t,ys=n||ys;let r=ks,i=_s(ys);e.innerHTML=`
    <!-- Sidebar (desktop only) -->
    <aside class="pm-sidebar" id="pm-sidebar">
      <div class="pm-sidebar-header">
        <div class="pm-sidebar-logo">
          <i class="bi bi-music-note-beamed"></i>
          <span>SOI</span>
        </div>
      </div>
      <nav class="pm-sidebar-nav">
        ${i.map(e=>`
          <a class="pm-sidebar-link" data-route="${e.id}" title="${e.label}">
            <i class="bi ${e.icon}"></i>
            <span>${e.label}</span>
          </a>
        `).join(``)}
      </nav>
      <div class="pm-sidebar-footer">
        <button id="pm-btn-perfil-sidebar" class="pm-sidebar-link" data-route="perfil">
          <i class="bi bi-person-circle"></i>
          <span>Perfil</span>
        </button>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="pm-main-area">
      <!-- Header -->
      <header class="pm-header">
        <div class="pm-header-left">
          <span class="pm-header-greeting">${ms?`Panel Admin`:`Hola,`}</span>
          <span class="pm-header-title">
            ${ms?t?.nombre_completo?.split(` `)[0]??`Administrador`:t?.nombre_completo?.split(` `)[0]??`Maestro`}
          </span>
        </div>

        <!-- Header right controls -->
        <div class="pm-header-right">
          <!-- Search (desktop only) -->
          ${r===`desktop`?`
            <div class="pm-header-search">
              <i class="bi bi-search"></i>
              <input type="search" placeholder="Buscar alumno..." id="pm-header-search-input" />
            </div>
          `:``}

          <span class="pm-sync-indicator synced" id="pm-sync-indicator">✓</span>

          <!-- Toggle de tema -->
          <div id="pm-theme-toggle-container"></div>

          <!-- Botón de notificaciones -->
          <button id="pm-bell-btn" class="pm-icon-btn" title="Notificaciones" style="position: relative;">
            <i class="bi bi-bell"></i>
            <span class="pm-ausencias-badge" id="pm-notif-badge" style="display: none; background: var(--pm-danger);">0</span>
          </button>
          
          <!-- Botón instalación PWA -->
          <button id="pm-btn-install" class="pm-icon-btn pm-hide-mobile" title="Instalar app">
            <i class="bi bi-download"></i>
          </button>

          <!-- Botón diagnóstico de push -->
          <button id="pm-btn-push-diagnostic" class="pm-icon-btn pm-hide-mobile" title="Diagnosticar Notificaciones" style="opacity: 0.7;">
            <i class="bi bi-broadcast"></i>
          </button>

          <button id="pm-btn-perfil" class="pm-avatar-btn" title="Perfil">
            ${t?.avatar_url?`<img src="${t.avatar_url}" alt="Avatar">`:`<i class="bi bi-person-circle"></i>`}
          </button>
        </div>

        <!-- Header tabs (tablet only - hidden on desktop) -->
        <div class="pm-header-tabs" id="pm-header-tabs">
          ${i.map(e=>`
            <button class="pm-header-tab" data-route="${e.id}" title="${e.label}">
              <i class="bi ${e.icon}"></i>
              <span>${e.label}</span>
            </button>
          `).join(``)}
        </div>
      </header>

      <!-- Contenido de la vista activa -->
      <main class="pm-view" id="pm-view-container"></main>

      <!-- Footer Nav (mobile/tablet only - hidden on desktop) -->
      <nav class="pm-footer-nav" id="pm-footer-nav">
        <div class="pm-footer-nav__inner">
          ${i.map(e=>`
            <button class="pm-nav-tab" data-route="${e.id}" title="${e.label}">
              <i class="bi ${e.icon}"></i>
            </button>
          `).join(``)}
        </div>
      </nav>
    </div>
  `,Ss();let a=document.getElementById(`pm-theme-toggle-container`);a&&a.appendChild(Eo.createToggleButton());let o=document.getElementById(`pm-footer-nav`);o&&o.querySelectorAll(`.pm-nav-tab`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),Z.navigate(e.dataset.route)})});let s=document.getElementById(`pm-header-tabs`);s&&s.querySelectorAll(`.pm-header-tab`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),Z.navigate(e.dataset.route)})});let c=document.getElementById(`pm-sidebar`);c&&c.querySelectorAll(`.pm-sidebar-link`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),Z.navigate(e.dataset.route)})}),document.getElementById(`pm-btn-perfil`).addEventListener(`click`,e=>{e.preventDefault(),Z.navigate(`perfil`)}),document.getElementById(`pm-header-search-input`)?.addEventListener(`keydown`,e=>{if(e.key===`Enter`){let t=e.target.value.trim();t.length>1&&Z.navigate(`alumno?id=${encodeURIComponent(t)}`)}}),document.getElementById(`pm-sync-indicator`).addEventListener(`click`,async e=>{e.target.classList.contains(`error`)&&await Cs()}),document.getElementById(`pm-bell-btn`)?.addEventListener(`click`,()=>{cs.open()}),document.getElementById(`pm-btn-push-diagnostic`)?.addEventListener(`click`,()=>{ps.open()}),document.getElementById(`pm-btn-install`)?.addEventListener(`click`,()=>{window.pwaInstaller&&window.pwaInstaller.promptInstall()});let l=(Z.currentRoute?.()||`hoy`).split(`?`)[0];Ns(l)}var js=!1;function Ms(){if(js)return;if(js=!0,Vo(()=>{let e=document.getElementById(`pm-notif-badge`);if(!e)return;let t=Jo();t>0?(e.textContent=t>9?`9+`:t,e.style.display=`flex`):e.style.display=`none`}),Uo(),Xo(),!ms){let e=vs;if(e?.id){let t=x.channel(`permisos-maestro:${e.id}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`permisos_maestros`,filter:`maestro_id=eq.${e.id}`},async t=>{console.log(`[Realtime] Permisos actualizados:`,t.new);try{let t=await M(e.id),n=document.getElementById(`portal-app`);if(!n)return;let r=[];t.puede_registrar_alumnos&&!ys?.puede_registrar_alumnos&&r.push(`Registrar Alumnos`),t.puede_inscribir_clases&&!ys?.puede_inscribir_clases&&r.push(`Gestionar e Inscribir Clases`);let i=(Z.currentRoute?.()||`perfil`).split(`?`)[0];As(n,e,t),Is(),Ds(),Z.setAuthGuard(()=>it.isAuthenticated(),[`login`,`register`,`pending-approval`]),Fs.clear(),await $(i),Z.navigate(i),r.length>0?E.success(`¡Nuevos permisos activados: ${r.join(`, `)}! Ahora podés acceder desde el Perfil o la barra de navegación.`):E.show(`Tus permisos fueron actualizados por el administrador.`,`info`)}catch(e){console.warn(`[Realtime] Error actualizando permisos:`,e.message)}}).subscribe(e=>{console.log(`[Realtime] Canal permisos_maestros:`,e)});window.addEventListener(`beforeunload`,()=>{x.removeChannel(t)},{once:!0})}}document.addEventListener(`keydown`,e=>{if(Os()!==`desktop`||e.target.tagName===`INPUT`||e.target.tagName===`TEXTAREA`)return;window._globalAppKeys||(window._globalAppKeys=[]);let t=window._globalAppKeys;if(t.push(e.key.toLowerCase()),t[t.length-2]===`g`)switch(e.key.toLowerCase()){case`h`:Z.navigate(`hoy`),t.length=0;break;case`c`:Z.navigate(`calendario`),t.length=0;break;case`r`:Z.navigate(`ruta`),t.length=0;break;case`m`:Z.navigate(`metricas`),t.length=0;break;case`p`:Z.navigate(`perfil`),t.length=0;break;default:break}t.length>3&&t.splice(0,t.length-2)});let e=null;window.addEventListener(`resize`,()=>{clearTimeout(e),e=setTimeout(()=>{let e=Os();if(e!==ks){ks=e,document.body.dataset.pmLayout=e,As(document.getElementById(`portal-app`),vs),Is();let t=(Z.currentRoute?.()||`hoy`).split(`?`)[0];Ns(t)}},250)},{passive:!0})}function Ns(e){document.querySelectorAll(`.pm-nav-tab`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)}),document.querySelectorAll(`.pm-sidebar-link`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)}),document.querySelectorAll(`.pm-header-tab`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)})}var Ps={},Q=null,Fs=new Set;function Is(){let e=document.getElementById(`pm-view-container`);e&&(e.innerHTML=``,[`login`,`logout`,`register`,`pending-approval`,`calendario`,`clases`,`hoy`,`asistencia`,`metricas`,`perfil`,`clase-emergente`,`planificacion`,`alumno`,`gamificacion`,`ruta`,`crear-clase`,`ruta-plan-builder`,`ruta-semanal`,`ruta-libreria`,`ruta-detalle`,`registrar-alumno`,`gestionar-clases`].forEach(t=>{let n=document.createElement(`div`);n.id=`pm-view-${t}`,n.className=`pm-view-content`,n.style.display=`none`,e.appendChild(n),Ps[t]=n}),ms&&[`admin-alumnos`,`admin-programas`,`admin-maestros`,`admin-metricas`,`admin-config`,`admin-clases`,`admin-sesiones`,`admin-aprobacion`,`admin-ausencias`].forEach(t=>{let n=document.createElement(`div`);n.id=`pm-view-${t}`,n.className=`pm-view-content`,n.style.display=`none`,e.appendChild(n),Ps[t]=n}))}async function $(e,t={},{silent:n=!1}={}){let r=window.location.hash.includes(`?`)?window.location.hash.split(`?`)[1]:``,i=new URLSearchParams(r),a=e.split(`?`)[0];n||Ns(a);let o=Ps[a];if(!o){console.warn(`[Router] Contenedor no encontrado: ${a}`);return}if(n||(typeof Q==`function`&&(console.log(`[Router] Ejecutando cleanup de vista anterior...`),Q(),Q=null),Object.values(Ps).forEach(e=>{e.style.display=`none`,e.classList.remove(`active`)}),o.style.display=`block`,o.offsetHeight,o.classList.add(`active`)),Fs.has(a))return;let s=setTimeout(()=>{o.querySelectorAll(`.pm-loading-overlay`).forEach(e=>e.remove());let e=document.createElement(`div`);e.className=`pm-loading pm-loading-overlay`,e.innerHTML=`<div class="pm-spinner"></div>`,o.prepend(e)},300);try{switch(a){case`login`:Pt(o,{onSuccess:()=>Bs()});break;case`register`:Ft(o,{onSuccess:()=>Z.navigate(`pending-approval`)});break;case`pending-approval`:It(o,{onBackToLogin:()=>Z.navigate(`login`)});break;case`logout`:Es(),Zo(),at().then(()=>window.location.reload());break;case`calendario`:case`clases`:Q=await Wt(o);break;case`hoy`:Q=await Lt(o,{onClaseClick:e=>Z.navigate(`asistencia?clase=${e}`)});break;case`asistencia`:Q=await wi(o,{claseId:i.get(`clase`),fecha:i.get(`fecha`)});break;case`metricas`:Q=en(o);break;case`perfil`:Q=Pi(o);break;case`clase-emergente`:Q=Oi(o,{maestroId:vs?.id});break;case`planificacion`:Q=await $i(o);break;case`alumno`:Q=na(o,{alumnoId:i.get(`id`)});break;case`gamificacion`:await sa(o);break;case`ruta`:await va(o,{onTopicSelected:e=>Z.navigate(`asistencia?clase=${e}`)});break;case`crear-clase`:Da(o);break;case`ruta-plan-builder`:Oa(o,{alumnoId:i.get(`id`)});break;case`ruta-semanal`:ka(o,{alumnoId:i.get(`id`)});break;case`ruta-libreria`:Aa.render().then(e=>{o.innerHTML=``,o.appendChild(e)});break;case`ruta-detalle`:ja.render(t).then(e=>{o.innerHTML=``,o.appendChild(e)});break;case`admin-alumnos`:u(o);break;case`admin-programas`:_(o);break;case`admin-maestros`:l(o);break;case`admin-metricas`:h(o);break;case`admin-config`:f(o);break;case`admin-clases`:g?.(o);break;case`admin-sesiones`:break;case`admin-aprobacion`:await so(o),Q=null;break;case`admin-ausencias`:await To(o),Q=null;break;case`registrar-alumno`:Ma(o);break;case`gestionar-clases`:Q=await Ka(o);break;default:}clearTimeout(s),o.querySelector(`.pm-loading-overlay`)?.remove(),new Set([`hoy`,`calendario`,`metricas`,`perfil`,`ruta`,`gamificacion`,`crear-clase`,`planificacion`,`ruta-libreria`]).has(a)&&Fs.add(a)}catch(e){clearTimeout(s),o.innerHTML=`<p class="pm-error">Error cargando vista: ${e.message}</p>`}}async function Ls(){if(vs)try{let e=new Date,t=e.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),n=e.toISOString().split(`T`)[0],[r,i,a]=await Promise.all([F(),F().then(e=>xt(e.map(e=>e.id))),F().then(()=>St(vs.id,n,n))]),o=Object.fromEntries(r.map(e=>[e.id,e]));await ue(i.filter(e=>e.dia?.toLowerCase()===t).map(e=>({...e,clase_nombre:o[e.clase_id]?.nombre||`Clase`})),a.filter(e=>e.borrador===!1||e.estado===`registrada`).map(e=>e.clase_id))}catch(e){console.warn(`[Alerts] Error programando alertas:`,e.message)}}function Rs(){Fs.clear()}function zs(e){Fs.delete(e)}async function Bs(){let e=document.getElementById(`portal-app`);if(!e)return;console.log(`[Init] Iniciando Portal...`),console.log(`[Init] Llamando usePortalAuth.init()...`);let t=await it.init();console.log(`[Init] Auth completado:`,t?`con maestro`:`sin maestro`);let n=window.router||st(),r=[`login`,`register`,`pending-approval`],i=n.currentRoute().split(`?`)[0],a=r.includes(i);if(!t&&!a){console.log(`[Init] No maestro y ruta privada, mostrando login screen`),Es();return}if(!t&&a){console.log(`[Init] No maestro pero ruta pública detectada:`,i),document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Is(),Ds(),Z.setAuthGuard(()=>it.isAuthenticated(),r),Z.start();return}let o=null;if(!ms)try{o=await M(t.id)}catch(e){console.warn(`[Init] Error fetching permissions:`,e.message)}console.log(`[Init] Renderizando shell...`),As(e,t,o),console.log(`[Init] Shell renderizado`),Is(),Ms(),Rr(zs,Rs),Ds(),Z.setAuthGuard(()=>it.isAuthenticated(),[`login`,`register`,`pending-approval`]),Z.start(),Dt().then(async()=>{let e=[`hoy`,`calendario`,`metricas`],t=(Z.currentRoute?.()||`hoy`).split(`?`)[0];await e.filter(e=>e!==t&&!Fs.has(e)).reduce((e,t)=>e.then(()=>{if(Ps[t])return $(t,{},{silent:!0})}),Promise.resolve()),Ls()}).catch(e=>console.warn(`[Prefetch] Error:`,e.message)),Cs()}window.addEventListener(`error`,e=>{let t=[`useCache`,`WebSocket`,`content.js`],n=e.message||``;if(t.some(e=>n.includes(e))){console.warn(`[Ignored Error]`,n);return}ze(Error(e.message),{context:`window.error`,filename:e.filename,lineno:e.lineno});let r=document.getElementById(`portal-app`);r&&(r.innerHTML=`
    <div style="padding:40px; color:#fff; font-family:'Outfit',sans-serif; background:radial-gradient(circle at top right, #1e293b, #0f172a); z-index:9999; position:fixed; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
      <div style="background:rgba(255,255,255,0.05); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:40px; max-width:600px; width:90%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        <div style="width:80px; height:80px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40px; margin:0 auto 24px;">
          <i class="bi bi-x-circle-fill"></i>
        </div>
        <h2 style="margin-bottom:16px; font-weight:700;">Ups! Algo salió mal</h2>
        <p style="color:rgba(255,255,255,0.6); margin-bottom:24px;">Se ha producido un error inesperado en la aplicación.</p>
        <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:12px; text-align:left; font-family:monospace; font-size:13px; margin-bottom:24px; overflow:auto; max-height:200px; border-left:4px solid #ef4444;">
          <div style="color:#ef4444; font-weight:bold; margin-bottom:8px;">${e.message}</div>
          <div style="color:rgba(255,255,255,0.4);">${e.filename?.split(`/`).pop()}:${e.lineno}</div>
        </div>
        <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6); color:white; border:none; padding:12px 32px; border-radius:12px; font-weight:600; cursor:pointer; transition:all 0.2s;">
          Recargar Aplicación
        </button>
      </div>
    </div>`)}),window.addEventListener(`unhandledrejection`,e=>{ze(e.reason instanceof Error?e.reason:Error(String(e.reason)),{context:`unhandledRejection`});let t=document.getElementById(`portal-app`);t&&(t.innerHTML=`
    <div style="padding:40px; color:#fff; font-family:'Outfit',sans-serif; background:radial-gradient(circle at top right, #1e293b, #0f172a); z-index:9999; position:fixed; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
      <div style="background:rgba(255,255,255,0.05); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:40px; max-width:600px; width:90%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        <div style="width:80px; height:80px; background:rgba(239,68,68,0.1); color:#ef4444; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40px; margin:0 auto 24px;">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h2 style="margin-bottom:16px; font-weight:700;">Error de Sincronización</h2>
        <p style="color:rgba(255,255,255,0.6); margin-bottom:24px;">Hubo un problema al procesar una solicitud de red.</p>
        <div style="background:rgba(0,0,0,0.3); padding:16px; border-radius:12px; text-align:left; font-family:monospace; font-size:13px; margin-bottom:24px; overflow:auto; max-height:200px; border-left:4px solid #ef4444;">
          <div style="color:#ef4444; font-weight:bold; margin-bottom:8px;">Promise Rejection</div>
          <div style="color:rgba(255,255,255,0.4);">${String(e.reason)}</div>
        </div>
        <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6); color:white; border:none; padding:12px 32px; border-radius:12px; font-weight:600; cursor:pointer; transition:all 0.2s;">
          Recargar Aplicación
        </button>
      </div>
    </div>`)}),Bs().catch(e=>{let t=document.getElementById(`portal-app`);t&&(t.innerHTML=`<div style="padding:20px;color:red;font-family:monospace;background:#fff;z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;"><h2>❌ initPortal() falló</h2><pre>${e?.message||e}\n${e?.stack||``}</pre></div>`)});