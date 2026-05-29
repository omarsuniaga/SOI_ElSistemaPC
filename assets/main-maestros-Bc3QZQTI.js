const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/academicService-76BH8TVA.js","assets/rolldown-runtime-tcWNtVWY.js","assets/preload-helper-CsoeaaUJ.js","assets/supabase-DJmkTfk1.js","assets/AchievementsSummaryModal-BQVYinl0.js","assets/portalUtils-CisZ9vg-.js","assets/pushService-CMJuokQ6.js","assets/maestroAuth-uDodKUJN.js","assets/permisoService-B2O2fSHa.js","assets/permisosSupabase-DyHvcCfe.js","assets/ausenciasPanel-Z45kwhVa.js","assets/ausenciaModal-CvmYhx0a.js","assets/AppModal-DIPPctm9.js","assets/AppToast-BOjiJExQ.js","assets/planningParserService-D5EOk4om.js","assets/groqService-CboUohPW.js"])))=>i.map(i=>d[i]);
import{A as e,D as t,E as n,R as r,S as i,V as a,_ as o,_t as s,a as c,at as l,bt as u,c as d,ct as f,dt as p,et as m,g as h,gt as g,ht as _,i as v,l as y,m as b,mt as x,nt as S,o as C,ot as w,pt as T,q as E,s as D,t as O,v as k,vt as A,x as ee,xt as te,y as ne,yt as re,z as ie}from"./adminNotificacionesView-DQc9ydCG.js";import{i as j}from"./supabase-DJmkTfk1.js";import{a as M,i as ae,n as oe,r as N,t as se}from"./maestroAuth-uDodKUJN.js";import{t as ce}from"./idb-DOPm7uLh.js";import{i as le,n as ue,t as de}from"./offlineQueue-Cjwl3aiF.js";import{a as fe,c as pe,d as me,f as he,i as ge,l as _e,n as ve,r as P,s as ye,t as be,u as xe}from"./pushService-CMJuokQ6.js";import"./vendor-BhXhnmkW.js";import{t as F}from"./AppToast-BOjiJExQ.js";import{t as Se}from"./preload-helper-CsoeaaUJ.js";import{t as I}from"./academicService-76BH8TVA.js";import{a as Ce,c as we,i as L,l as Te,n as Ee,o as De,r as Oe,s as ke,t as Ae}from"./portalUtils-CisZ9vg-.js";import{t as je}from"./AppModal-DIPPctm9.js";import{a as Me,i as Ne,o as Pe,s as Fe,t as Ie}from"./groqService-CboUohPW.js";import{n as Le,t as Re}from"./ausenciaModal-CvmYhx0a.js";import{n as ze,r as Be,t as Ve}from"./reportService-vdrVPOl2.js";import{r as He,t as Ue}from"./permisoService-B2O2fSHa.js";var We=[`useCache`,`WebSocket closed without opened`,`Could not establish connection`,`Receiving end does not exist`,`chrome-extension://`,`polyfill`,`content.js`,`Failed to load module script`,`net::ERR_BLOCKED_BY_CLIENT`];function Ge(e=``){let t=String(e).toLowerCase();return We.some(e=>t.includes(e.toLowerCase()))}var Ke=console.error;console.error=function(...e){e.length>0&&!Ge(e[0])&&Ke.apply(console,e)};var qe=console.warn;console.warn=function(...e){e.length>0&&!Ge(e[0])&&qe.apply(console,e)},window.addEventListener(`unhandledrejection`,e=>{Ge(String(e.reason||``))&&(e.preventDefault(),e.stopImmediatePropagation())},!0),window.addEventListener(`error`,e=>{Ge(e.message||``)&&(e.preventDefault(),e.stopImmediatePropagation())},!0);var Je=window.fetch;window.fetch=async function(...e){try{return await Je.apply(window,e)}catch(e){if(!Ge(e.message))throw e;return null}};var Ye=!1;function Xe(e={}){let{dsn:t,environment:n=`development`,tracesSampleRate:r=.1}=e;if(t&&typeof window<`u`&&window.Sentry){let e=[];window.Sentry.Replay&&e.push(new window.Sentry.Replay({maskAllText:!0,blockAllMedia:!0})),window.Sentry.init({dsn:t,environment:n,tracesSampleRate:r,integrations:e,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1}),Ye=!0,console.log(`[ErrorReporter] Initialized:`,n)}}function Ze(e,t={}){if(!Ye&&!window.Sentry)return;let{userId:n,context:r,level:i=`error`,...a}=t;n&&window.Sentry?.setUser({id:n}),r&&window.Sentry?.setTag(`context`,r),Object.keys(a).length>0&&window.Sentry?.setContext(`details`,a),e instanceof Error?(window.Sentry?.captureException(e,{level:i}),console.error(`[Error] ${e.message}`,e)):(window.Sentry?.captureMessage(String(e),i),console.warn(`[${i}] ${e}`))}var Qe=!1;function $e(e={}){let{enabled:t=!1,consent:n=!1}=e;Qe=t&&n,console.log(`[Analytics] Initialized, enabled:`,Qe)}var et={windowMs:6e4,max:100};function tt(e={}){et={...et,...e},console.log(`[RateLimit] Initialized: ${et.max} requests per ${et.windowMs}ms`)}var nt=null,rt=new Set;function it(e=32){let t=``,n=new Uint32Array(e);if(typeof crypto<`u`&&crypto.getRandomValues)crypto.getRandomValues(n);else for(let t=0;t<e;t++)n[t]=Math.floor(Math.random()*62);for(let r=0;r<e;r++)t+=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`[n[r]%62];return t}function at(e={}){nt=it(e.length||32),rt.clear(),rt.add(nt),console.log(`[CSRF] Initialized`)}var ot={LCP:null,FID:null,CLS:null,FCP:null,TTFB:null};function st(){return typeof window>`u`?!1:typeof PerformanceObserver<`u`}function ct(e={}){let{debug:t=!1,onReport:n=null}=e;if(!st()){console.warn(`[WebVitals] Not supported in this environment`);return}console.log(`[WebVitals] Initialized`),lt(t,n),ut(t,n),dt(t,n),ft(t,n),pt(t,n)}function lt(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries(),i=r[r.length-1];ot.LCP=i.value,e&&console.log(`[LCP]`,i.value),t&&t(`LCP`,i.value)}).observe({entryTypes:[`largest-contentful-paint`]})}catch{e&&console.log(`[LCP] Not available`)}}function ut(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];ot.FID=r.value,e&&console.log(`[FID]`,r.value),t&&t(`FID`,r.value)}).observe({entryTypes:[`first-input`]})}catch{e&&console.log(`[FID] Not available`)}}function dt(e,t){try{let n=0;new PerformanceObserver(r=>{for(let e of r.getEntries())e.hadRecentInput||(n+=e.value);ot.CLS=n,e&&console.log(`[CLS]`,n),t&&t(`CLS`,n)}).observe({entryTypes:[`layout-shift`]})}catch{e&&console.log(`[CLS] Not available`)}}function ft(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];ot.FCP=r.value,e&&console.log(`[FCP]`,r.value),t&&t(`FCP`,r.value)}).observe({entryTypes:[`paint`]})}catch{e&&console.log(`[FCP] Not available`)}}function pt(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];ot.TTFB=r.responseStart,e&&console.log(`[TTFB]`,r.responseStart),t&&t(`TTFB`,r.responseStart)}).observe({entryTypes:[`navigation`]})}catch{e&&console.log(`[TTFB] Not available`)}}var R={maestro:null,loading:!0,listeners:[]},mt=null;function ht(){R.listeners.forEach(e=>e({...R}))}var gt={subscribe(e){return R.listeners.push(e),()=>{R.listeners=R.listeners.filter(t=>t!==e)}},async init(){if(console.log(`[usePortalAuth.init] Iniciando...`),R.maestro=N(),console.log(`[usePortalAuth.init] Maestro local:`,R.maestro?`found`:`not found`),R.loading=!0,ht(),typeof process<`u`&&{}.VITEST)return R.loading=!1,ht(),console.log(`[usePortalAuth.init] Completado (Test Env)`),R.maestro;if(!mt){let{data:{subscription:e}}=j.auth.onAuthStateChange(async(e,t)=>{if(console.log(`[usePortalAuth] Evento de auth disparado: ${e}`),e===`SIGNED_OUT`||e===`USER_DELETED`){localStorage.removeItem(`portal-maestros:maestro`),R.maestro=null,ht();let e=[`login`,`register`,`pending-approval`],t=(window.router?.currentRoute?.()||`login`).split(`?`)[0];e.includes(t)||(console.log(`[usePortalAuth] Sesión inactiva o expirada en ruta privada. Recargando aplicación...`),window.location.reload())}else if((e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)&&t?.user){let e=N();if(!e||e.user_id!==t.user.id){console.log(`[usePortalAuth] Nueva sesión detectada. Sincronizando datos de maestro...`);let e=await oe();e&&(R.maestro=e,ht())}}});mt=e}try{console.log(`[usePortalAuth.init] Iniciando detectarRolMaestro() con timeout de 8s...`);let e=new Promise((e,t)=>setTimeout(()=>t(Error(`Auth timeout after 8s`)),8e3)),t=await Promise.race([oe(),e]);console.log(`[usePortalAuth.init] detectarRolMaestro completado:`,t?`con datos`:`sin datos`),R.maestro=t}catch(e){console.warn(`[usePortalAuth.init] Error:`,e.message),R.maestro=null}return R.loading=!1,ht(),console.log(`[usePortalAuth.init] Completado`),R.maestro},setMaestro(e){R.maestro=e,R.loading=!1,ht()},async logout(){await M(),R.maestro=null,ht()},getMaestro:()=>R.maestro,isAuthenticated:()=>!!R.maestro,isLoading:()=>R.loading},_t=gt.logout,vt=`calendario`;function yt(){let e=new Map,t=null,n=null,r=null,i=[`login`],a=!1;function o(){let e=window.location.pathname,t=window.location.hash;return t&&t!==`#`?t.replace(`#/`,``).replace(`#`,``):e&&e!==`/`?e.replace(`/`,``):vt}function s(e,t=[`login`]){r=e,i=t,a=!0}let c=null;function l(e,t={}){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.pushState({route:`login`},``,`#/login`),h(`login`);return}t&&Object.keys(t).length>0&&(c=t,n=null);let o=`#/${e}`;history.pushState({route:e},``,o),h(e)}function u(e){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.replaceState({route:`login`},``,`#/login`),h(`login`);return}let t=`#/${e}`;history.replaceState({route:e},``,t),h(e)}function d(t,n){e.set(t,n)}function f(e){t=e}let p=null;function m(e){let t=e.querySelector(`h1, h2, [role="main"]`);t&&(t.hasAttribute(`tabindex`)||t.setAttribute(`tabindex`,`-1`),t.focus({preventScroll:!0}))}function h(r){if(n===r&&n!==null)return;n=r;let i=r.split(`?`)[0],a=e.get(i),o={};if(!a){for(let[t,n]of e.entries())if(t.includes(`:`)){let e=`^`+t.replace(/:[^\s/]+/g,`([^\\/]+)`)+`$`,r=new RegExp(e),s=i.match(r);if(s){a=n,t.match(/:[^\s/]+/g).forEach((e,t)=>{o[e.substring(1)]=s[t+1]});break}}}c&&=(o={...o,...c},null);let s=a||t;if(!s)return;let l=async()=>{typeof s==`function`&&await s(r,o)};if(!document.startViewTransition||p){p&&=(p.skipTransition(),null);let e=document.querySelector(`.pm-view-content.active`);e&&(e.classList.remove(`pm-animate-fade-in`,`pm-view-enter`,`pm-view-enter-active`),e.offsetWidth),l();let t=document.querySelector(`.pm-view-content.active`);t&&(t.classList.add(`pm-animate-fade-in`),t.classList.add(`pm-view-enter`),requestAnimationFrame(()=>{t.classList.add(`pm-view-enter-active`),m(t);let e=()=>{t.classList.remove(`pm-view-enter`,`pm-view-enter-active`)};t.addEventListener(`transitionend`,e,{once:!0}),setTimeout(e,250)}));return}try{let e=document.startViewTransition(async()=>{await l()});p=e;let t=e=>e.catch(()=>{});t(e.ready),t(e.updateCallbackDone),t(e.finished),e.finished.finally(()=>{p=null;let e=document.querySelector(`.pm-view-content.active`);e&&requestAnimationFrame(()=>m(e))})}catch{p=null,l()}}function g(){window.addEventListener(`popstate`,e=>{e.state?.route?h(e.state.route):h(o())});let e=o();e!==vt&&history.replaceState({route:e},``,`#/${e}`),h(e)}return{currentRoute:o,setAuthGuard:s,navigate:l,replace:u,on:d,onNotFound:f,start:g,_dispatch:h}}var z=null,bt=null;function xt(e,t=`polite`){z||(z=document.createElement(`div`),z.setAttribute(`aria-live`,t),z.setAttribute(`aria-atomic`,`true`),z.classList.add(`pm-visually-hidden`),document.body.appendChild(z)),t===`assertive`?(z.setAttribute(`role`,`alert`),z.setAttribute(`aria-live`,`assertive`)):(z.removeAttribute(`role`),z.setAttribute(`aria-live`,`polite`)),clearTimeout(bt),bt=setTimeout(()=>{z.textContent=``,requestAnimationFrame(()=>{z.textContent=e})},50)}function St(e,t){if(!e||!e.id)return;Ct(e);let n=`${e.id}-error`,r=document.createElement(`span`);r.id=n,r.className=`pm-field-error`,r.setAttribute(`role`,`alert`),r.textContent=t,e.nextSibling?e.parentNode.insertBefore(r,e.nextSibling):e.parentNode.appendChild(r),e.setAttribute(`aria-invalid`,`true`),e.setAttribute(`aria-describedby`,n)}function Ct(e){if(e&&(e.removeAttribute(`aria-invalid`),e.removeAttribute(`aria-describedby`),e.id)){let t=document.getElementById(`${e.id}-error`);t&&t.remove()}}function wt(e){(e||document).querySelectorAll(`[aria-invalid="true"]`).forEach(e=>Ct(e))}function Tt(e,{onSuccess:t}){e.innerHTML=`
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
  `;let n=e.querySelector(`#pm-email`),r=e.querySelector(`#pm-password`),i=e.querySelector(`#pm-login-btn`),a=e.querySelector(`#pm-login-error`),o=e.querySelector(`#pm-toggle-password`),s=e.querySelector(`#pm-remember-email`),c=e.querySelector(`#pm-keep-session`),l=!1;o.addEventListener(`click`,()=>{l=!l,r.type=l?`text`:`password`,o.querySelector(`i`).className=l?`bi bi-eye-slash`:`bi bi-eye`,o.title=l?`Ocultar contraseña`:`Mostrar contraseña`,o.setAttribute(`aria-label`,l?`Ocultar contraseña`:`Mostrar contraseña`),o.setAttribute(`aria-pressed`,l?`true`:`false`)});let u=localStorage.getItem(`pm-saved-email`);u&&(n.value=u,s.checked=!0),s.addEventListener(`change`,()=>{s.checked?localStorage.setItem(`pm-saved-email`,n.value):localStorage.removeItem(`pm-saved-email`)}),n.addEventListener(`input`,()=>{s.checked&&localStorage.setItem(`pm-saved-email`,n.value)});async function d(){let i=n.value.trim(),o=r.value;a.textContent=``,wt(e),p(!1);let s=!1;if(i||(St(n,`Ingresa tu correo electrónico`),n.focus(),s=!0),o||(St(r,`Ingresa tu contraseña`),s||r.focus(),s=!0),s)return;f(!0);let l=c.checked?720*60*60*1e3:void 0;l&&localStorage.setItem(`pm-session-expires`,new Date(Date.now()+l).toISOString());let u=await ae(i,o);if(u.success){gt.setMaestro(u.maestro);let e=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),t&&t(e)}else a.textContent=u.error,f(!1),localStorage.removeItem(`pm-session-expires`),r.value=``,r.focus()}function f(e){i.disabled=e,n.disabled=e,r.disabled=e,c.disabled=e,o.disabled=e;let t=i.querySelector(`.pm-btn-text`),a=i.querySelector(`.pm-btn-loader`);e?(t?.classList.add(`d-none`),a?.classList.remove(`d-none`)):(t?.classList.remove(`d-none`),a?.classList.add(`d-none`))}function p(e){n.disabled=e,r.disabled=e,c.disabled=e,o.disabled=e}i.addEventListener(`click`,d),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&d()});let m=e.querySelector(`#pm-biometric-btn`);async function h(){if(!window.PublicKeyCredential)return!1;try{return await navigator.credentials.get({mediation:`optional`}),!0}catch{return!1}}async function g(){try{if(await navigator.credentials.get({mediation:`required`,publicKey:{challenge:new TextEncoder().encode(`login-challenge`)}})){let e=localStorage.getItem(`portal-maestros:maestro`);if(e){let n=JSON.parse(e);gt.setMaestro(n);let r=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),t&&t(r)}else a.textContent=`No hay sesión biométrica guardada. Iniciá sesión con contraseña primero.`}}catch(e){console.log(`[WebAuthn] No se pudo usar biometría:`,e.message)}}h().then(e=>{e&&(m.style.display=`flex`,m.onclick=g)}),e.querySelector(`[data-route="register"]`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router?window.router.navigate(`register`):console.error(`[LoginView] Router not found in window`)}),requestAnimationFrame(()=>n.focus())}function Et(e,{onSuccess:t}){e.innerHTML=`
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
  `;let n=e.querySelector(`#pm-reg-nombre`),r=e.querySelector(`#pm-reg-email`),i=e.querySelector(`#pm-reg-password`),a=e.querySelector(`#pm-reg-confirm-password`),o=e.querySelector(`#pm-reg-instrumento`),s=e.querySelector(`#pm-reg-resena`),c=e.querySelector(`#pm-register-btn`),l=e.querySelector(`#pm-reg-error`),u=e.querySelector(`#pm-reg-toggle-password`),d=e.querySelector(`#pm-reg-toggle-confirm-password`),f=!1;u.addEventListener(`click`,()=>{f=!f,i.type=f?`text`:`password`,u.querySelector(`i`).className=f?`bi bi-eye-slash`:`bi bi-eye`,u.title=f?`Ocultar contraseña`:`Mostrar contraseña`,u.setAttribute(`aria-label`,f?`Ocultar contraseña`:`Mostrar contraseña`)});let p=!1;d.addEventListener(`click`,()=>{p=!p,a.type=p?`text`:`password`,d.querySelector(`i`).className=p?`bi bi-eye-slash`:`bi bi-eye`,d.title=p?`Ocultar contraseña`:`Mostrar contraseña`,d.setAttribute(`aria-label`,p?`Ocultar contraseña`:`Mostrar contraseña`)});async function m(){let c=n.value.trim(),u=r.value.trim(),d=i.value,f=a.value,p=o.value.trim();l.textContent=``,wt(e),g(!1);let m=!1;if(c||(St(n,`Ingresá tu nombre completo`),m||n.focus(),m=!0),u||(St(r,`Ingresá tu correo electrónico`),m||r.focus(),m=!0),(!d||d.length<6)&&(St(i,`La contraseña debe tener al menos 6 caracteres`),m||i.focus(),m=!0),f?d!==f&&(St(a,`Las contraseñas no coinciden`),m||a.focus(),m=!0):(St(a,`Confirmá tu contraseña`),m||a.focus(),m=!0),m)return;h(!0);let{data:_,error:v}=await j.auth.signUp({email:u,password:d,options:{data:{full_name:c,rol:`maestro`,instrumento:p,resena:s.value.trim()}}});if(v){l.textContent=v.message===`User already registered`?`Este correo ya está registrado`:v.message||`Error al registrarse. Intentá de nuevo.`,h(!1);return}h(!1),t&&t()}function h(e){c.disabled=e,n.disabled=e,r.disabled=e,i.disabled=e,a.disabled=e,o.disabled=e,s.disabled=e,u.disabled=e,d.disabled=e;let t=c.querySelector(`.pm-btn-text`),l=c.querySelector(`.pm-btn-loader`);e?(t?.classList.add(`d-none`),l?.classList.remove(`d-none`)):(t?.classList.remove(`d-none`),l?.classList.add(`d-none`))}function g(e){n.disabled=e,r.disabled=e,i.disabled=e,a.disabled=e,o.disabled=e,s.disabled=e,u.disabled=e,d.disabled=e}c.addEventListener(`click`,m),a.addEventListener(`keydown`,e=>{e.key===`Enter`&&m()}),e.querySelector(`[data-route="login"]`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router?window.router.navigate(`login`):console.error(`[RegisterView] Router not found in window`)}),requestAnimationFrame(()=>n.focus())}function Dt(e,{onBackToLogin:t}){e.innerHTML=`
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
  `,e.querySelector(`[data-route="login"]`)?.addEventListener(`click`,e=>{e.preventDefault(),t?t():(history.pushState({route:`login`},``,`#/login`),window.dispatchEvent(new PopStateEvent(`popstate`,{state:{route:`login`}})))})}async function Ot(e,{onClaseClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let n=N();if(!n){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let r=new Date,i=r.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),a=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,`0`)}-${String(r.getDate()).padStart(2,`0`)}`;try{let o=await g();if(!o||o.length===0){e.innerHTML=`<p class="pm-empty">No tenés clases asignadas.</p>`;return}let c=o.map(e=>e.id),l=Object.fromEntries(o.map(e=>[e.id,e])),u=(await x(c)).filter(e=>e.dia?.toLowerCase()===i).sort((e,t)=>e.hora_inicio.localeCompare(t.hora_inicio));if(!u||u.length===0){e.innerHTML=`
        <h2 class="pm-date-header">${Oe(i)} ${Ce(r)}</h2>
        <p class="pm-empty">No tenés clases hoy.</p>
      `;return}let d=new Date(r);d.setDate(d.getDate()-3);let f=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,`0`)}-${String(d.getDate()).padStart(2,`0`)}`,p=new Date(r);p.setDate(p.getDate()-1);let m=`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,`0`)}-${String(p.getDate()).padStart(2,`0`)}`,h=(await A(n.id,f,m)||[]).filter(e=>{if(!c.includes(e.clase_id))return!1;let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),v=(await A(n.id,a,a)).filter(e=>c.includes(e.clase_id)).filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return t||e.borrador===!1&&n}),y=new Set(v.map(e=>e.clase_id)),b=await _(c),S={};for(let e of b||[])e.clase_id&&(S[e.clase_id]=(S[e.clase_id]||0)+1);let C=[...new Set(u.map(e=>e.salon_id).filter(Boolean))],w=C.length>0?await s(C):[],T=Object.fromEntries(w.map(e=>[e.id,e.nombre])),E=u.map(e=>{let t=l[e.clase_id],n=y.has(t.id),r=S[t.id]||0,i=n?`registrada`:`sin-registrar`,a=n?`<span class="pm-badge pm-badge-success"><i class="bi bi-check-circle-fill me-1"></i>Registrada</span>`:`<span class="pm-badge pm-badge-danger">Sin registrar</span>`;return`
        <div class="pm-clase-card ${i}" data-clase-id="${t.id}">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="pm-clase-nombre">${L(t.nombre)}</div>
            ${a}
          </div>
          <div class="pm-clase-meta">
            <div class="meta-item"><i class="bi bi-clock"></i> ${De(e.hora_inicio)} – ${De(e.hora_fin)}</div>
            <div class="meta-item"><i class="bi bi-music-note-beamed"></i> ${L(t.instrumento||`—`)}</div>
            <div class="meta-item"><i class="bi bi-people"></i> ${r} alumnos</div>
            ${e.salon_id?`<div class="meta-item"><i class="bi bi-geo-alt"></i> ${L(T[e.salon_id]||`Salón`)}</div>`:``}
          </div>
        </div>
      `}).join(``),D=h.length>0?`
      <div class="pm-pendientes-banner">
        <div class="pm-pendientes-header">
          <i class="bi bi-clipboard-x-fill"></i>
          <span>${h.length===1?`1 clase sin registrar de los últimos días`:`${h.length} clases sin registrar de los últimos días`}</span>
        </div>
        <div class="pm-pendientes-list">
          ${h.map(e=>{let t=l[e.clase_id];if(!t)return``;let n=e.fecha?e.fecha.split(`-`).reverse().slice(0,2).join(`/`):`—`;return`
              <button class="pm-pendiente-item" data-clase-id="${t.id}" data-fecha="${e.fecha}">
                <div class="pm-pendiente-info">
                  <span class="pm-pendiente-nombre">${L(t.nombre)}</span>
                  <span class="pm-pendiente-fecha">${n}</span>
                </div>
                <span class="pm-pendiente-cta">Registrar <i class="bi bi-arrow-right"></i></span>
              </button>`}).join(``)}
        </div>
      </div>`:``;e.innerHTML=`
      <div style="padding: 1rem 1rem 2rem;">
        <h2 class="pm-date-header">${Oe(i)} ${Ce(r)}</h2>
        ${D}
        <div class="pm-clases-container">
          ${E}
        </div>
      </div>
    `,e.querySelectorAll(`.pm-pendiente-item`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.claseId,r=e.dataset.fecha;try{await I.createSnapshotFromPlan(t,r,n.id)}catch{}window.router&&window.router.navigate(`asistencia?clase=${t}&fecha=${r}`)})}),e.querySelectorAll(`.pm-clase-card`).forEach(e=>{e.addEventListener(`click`,async()=>{if(e.classList.contains(`pm-card-loading`))return;e.classList.add(`pm-card-loading`);let r=e.dataset.claseId;try{await I.createSnapshotFromPlan(r,a,n.id)}catch(e){console.error(`Error generando snapshot:`,e)}e.classList.remove(`pm-card-loading`),t?.(r)})})}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar clases: ${L(t.message)}</p>`}}if(!document.getElementById(`pm-hoy-pendientes-styles`)){let e=document.createElement(`style`);e.id=`pm-hoy-pendientes-styles`,e.textContent=`
    .pm-pendientes-banner {
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    }
    .pm-pendientes-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--pm-danger, #ef4444);
      margin-bottom: 0.6rem;
    }
    .pm-pendientes-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .pm-pendiente-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--pm-surface);
      border: 1px solid rgba(239,68,68,0.15);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: background 0.15s, border-color 0.15s;
      gap: 0.5rem;
    }
    .pm-pendiente-item:hover {
      background: rgba(239,68,68,0.06);
      border-color: rgba(239,68,68,0.35);
    }
    .pm-pendiente-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .pm-pendiente-nombre {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text);
    }
    .pm-pendiente-fecha {
      font-size: 0.72rem;
      color: var(--pm-text-muted);
    }
    .pm-pendiente-cta {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--pm-danger, #ef4444);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  `,document.head.appendChild(e)}var kt=null,At=null;function jt(e={}){let{fecha:t=``,claseId:n=``,clases:r=[],alumnos:i=[],maestroId:a=null,onSave:o=null}=e;kt=o,At=a,je.open({title:`Nueva Clase Emergente`,size:`lg`,saveText:`Crear Clase`,cancelText:`Cancelar`,body:`
      <form id="formClaseEmergente" class="pm-emergente-form">
        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">Informaci&oacute;n de la Sesi&oacute;n</h3>
          <div class="pm-emergente-grid">
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Fecha</label>
              <input type="date" class="pm-emergente-input" id="modal-fecha" required value="${t}">
            </div>
            <div class="pm-emergente-field">
              <label class="pm-emergente-label">Actividad / clase</label>
              <input type="text" class="pm-emergente-input" id="modal-clase_id" required placeholder="Ej: Clase grupal de violín, Ensayo de orquesta, Taller de teoría...">
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
          <h3 class="pm-emergente-section-title">Contenido</h3>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Actividad / t&iacute;tulo</label>
            <input type="text" class="pm-emergente-input" id="modal-tema" required placeholder="Ej: Concierto institucional">
          </div>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Descripci&oacute;n</label>
            <textarea class="pm-emergente-textarea" id="modal-contenido" rows="3" placeholder="Describe qu&eacute; ocurri&oacute; o qu&eacute; se trabaj&oacute;..."></textarea>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">Motivo</h3>
          <div class="pm-emergente-field full">
            <label class="pm-emergente-label">Motivo libre</label>
            <input type="text" class="pm-emergente-input" id="modal-motivo" list="modal-motivos-sugeridos" required maxlength="120" placeholder="Ej: Concierto, masterclass, reuni&oacute;n, capacitaci&oacute;n...">
            <datalist id="modal-motivos-sugeridos">
              <option value="Concierto">
              <option value="Masterclass">
              <option value="Reunion">
              <option value="Evento institucional">
              <option value="Capacitacion">
              <option value="Ensayo general anticipado">
            </datalist>
          </div>
        </div>

        <div class="pm-emergente-section">
          <h3 class="pm-emergente-section-title">Alumnos participantes</h3>
          <div class="pm-emergente-filters">
            <input type="search" class="pm-emergente-input" id="modal-alumnos-buscar" placeholder="Buscar por nombre, clase o instrumento...">
          </div>
          <div class="pm-emergente-select-all">
            <label class="pm-emergente-checkbox-sm">
              <input type="checkbox" id="modal-seleccionar-todos">
              <span class="pm-emergente-checkbox-mark-sm">✓</span>
              <span class="pm-emergente-select-all-text">Seleccionar todos los visibles</span>
            </label>
          </div>
          <div class="pm-emergente-field full">
            <div id="modal-alumnos-lista" class="pm-emergente-students"></div>
            <span class="pm-emergente-hint" id="modal-alumnos-resumen">Selecciona al menos un alumno para crear el registro.</span>
          </div>
        </div>

        <div class="pm-emergente-section">
          <label class="pm-emergente-checkbox">
            <input type="checkbox" id="modal-es_co-docencia">
            <span class="pm-emergente-checkbox-mark">✓</span>
            <span class="pm-emergente-checkbox-text">&iquest;Esta clase tiene co-docencia?</span>
          </label>
          
          <div id="codocencia-fields" class="pm-emergente-codocencia" style="display: none;">
            <div class="pm-emergente-codocencia-card">
              <label class="pm-emergente-label">Maestro auxiliar</label>
              <select class="pm-emergente-select" id="modal-maestro_auxiliar_id">
                <option value="">Seleccionar maestro...</option>
              </select>
              <span class="pm-emergente-hint">El maestro auxiliar podr&aacute; ver y editar esta sesi&oacute;n.</span>
            </div>
          </div>
        </div>

        <style>
          .pm-emergente-form { display: flex; flex-direction: column; gap: 1.25rem; }
          .pm-emergente-section { display: flex; flex-direction: column; gap: 0.75rem; }
          .pm-emergente-section-title { font-size: 0.8125rem; font-weight: 600; color: var(--pm-text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid var(--pm-border); }
          .pm-emergente-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .pm-emergente-field { display: flex; flex-direction: column; gap: 0.375rem; }
          .pm-emergente-field.full { grid-column: span 2; }
          .pm-emergente-label { font-size: 0.8125rem; font-weight: 500; color: var(--pm-text); }
          .pm-emergente-input, .pm-emergente-select, .pm-emergente-textarea { padding: 0.625rem 0.875rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.875rem; background: var(--pm-surface); color: var(--pm-text); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
          .pm-emergente-input:focus, .pm-emergente-select:focus, .pm-emergente-textarea:focus { border-color: var(--pm-primary); box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1); }
          .pm-emergente-textarea { resize: vertical; min-height: 80px; }
          .pm-emergente-checkbox { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.75rem; background: var(--pm-surface-2); border-radius: 10px; }
          .pm-emergente-checkbox input { display: none; }
          .pm-emergente-checkbox-mark { width: 22px; height: 22px; border: 2px solid var(--pm-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: transparent; transition: all 0.2s; }
          .pm-emergente-checkbox input:checked + .pm-emergente-checkbox-mark { background: var(--pm-primary); border-color: var(--pm-primary); color: white; }
          .pm-emergente-checkbox-text { font-size: 0.875rem; color: var(--pm-text); }
          .pm-emergente-codocencia { margin-top: 0.5rem; }
          .pm-emergente-codocencia-card { padding: 1rem; background: linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(88, 86, 214, 0.05) 100%); border: 1px solid rgba(88, 86, 214, 0.2); border-radius: 12px; display: flex; flex-direction: column; gap: 0.5rem; }
          .pm-emergente-filters { display: grid; gap: 0.5rem; }
          .pm-emergente-hint { font-size: 0.75rem; color: var(--pm-text-muted); }
          .pm-emergente-students { display: grid; gap: 0.4rem; max-height: 220px; overflow-y: auto; padding: 0.5rem; border: 1px solid var(--pm-border); border-radius: 10px; background: var(--pm-surface-2); }
          .pm-emergente-student { display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.5rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem; flex-wrap: wrap; }
          .pm-emergente-student:hover { background: var(--pm-surface); }
          .pm-emergente-student-tags { display: inline-flex; gap: 0.3rem; margin-left: auto; flex-wrap: wrap; }
          .pm-emergente-tag { font-size: 0.65rem; padding: 0.1rem 0.45rem; border-radius: 999px; background: var(--pm-surface); color: var(--pm-text-muted); border: 1px solid var(--pm-border); white-space: nowrap; }
          .pm-emergente-tag-instrument { background: rgba(88,86,214,0.08); color: var(--pm-primary); border-color: rgba(88,86,214,0.2); }
          .pm-emergente-select-all { display: flex; align-items: center; gap: 0.5rem; }
          .pm-emergente-checkbox-sm { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.8rem; color: var(--pm-text-muted); }
          .pm-emergente-checkbox-sm input { display: none; }
          .pm-emergente-checkbox-mark-sm { width: 18px; height: 18px; border: 2px solid var(--pm-border); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: transparent; transition: all 0.2s; flex-shrink: 0; }
          .pm-emergente-checkbox-sm input:checked + .pm-emergente-checkbox-mark-sm { background: var(--pm-primary); border-color: var(--pm-primary); color: white; }
          .pm-emergente-select-all-text { font-size: 0.8rem; color: var(--pm-text-muted); }
        </style>
      </form>
    `,onShow:e=>{let t=e.querySelector(`#modal-es_co-docencia`),n=e.querySelector(`#codocencia-fields`),r=e.querySelector(`#modal-alumnos-lista`),a=e.querySelector(`#modal-alumnos-buscar`),o=e.querySelector(`#modal-seleccionar-todos`),s=e.querySelector(`#modal-alumnos-resumen`);t?.addEventListener(`change`,e=>{n.style.display=e.target.checked?`block`:`none`});let c=Array.from(new Map((i||[]).filter(Boolean).map(e=>[e.id,e])).values()).sort((e,t)=>(e.nombre_completo||``).localeCompare(t.nombre_completo||``)),l=new Set,u=()=>{let e=l.size;s.textContent=e>0?`${e} alumno(s) seleccionado(s).`:`Selecciona al menos un alumno para crear el registro.`},d=()=>{let e=(a?.value||``).trim().toLowerCase();return c.filter(t=>e?[t.nombre_completo||``,t.instrumento_principal||``,...t.clase_nombres||[]].join(` `).toLowerCase().includes(e):!0)},f=()=>{let e=d(),t=e.length>0&&e.every(e=>l.has(e.id));o.checked=t,o.indeterminate=!t&&e.some(e=>l.has(e.id))},p=()=>{let t=d();r.innerHTML=t.length?t.map(e=>`
            <label class="pm-emergente-student">
              <input type="checkbox" class="modal-alumno-check" value="${e.id}" ${l.has(e.id)?`checked`:``}>
              <span>${Mt(e.nombre_completo||`Alumno sin nombre`)}</span>
              <span class="pm-emergente-student-tags">
                ${e.instrumento_principal?`<span class="pm-emergente-tag pm-emergente-tag-instrument">${Mt(e.instrumento_principal)}</span>`:``}
                ${(e.clase_nombres||[]).map(e=>`<span class="pm-emergente-tag">${Mt(e)}</span>`).join(``)}
              </span>
            </label>
          `).join(``):`<p class="pm-emergente-hint" style="margin:0;">No hay alumnos que coincidan con los filtros.</p>`,r.querySelectorAll(`.modal-alumno-check`).forEach(t=>{t.addEventListener(`change`,()=>{t.checked?l.add(t.value):l.delete(t.value),e.dataset.selectedAlumnoIds=Array.from(l).join(`,`),f(),u()})}),f(),u()};o?.addEventListener(`change`,()=>{let t=d();o.checked?t.forEach(e=>l.add(e.id)):t.forEach(e=>l.delete(e.id)),e.dataset.selectedAlumnoIds=Array.from(l).join(`,`),p()}),a?.addEventListener(`input`,p),p()},onSave:async e=>{let t=(e.dataset.selectedAlumnoIds||``).split(`,`).map(e=>e.trim()).filter(Boolean),n={fecha:e.querySelector(`#modal-fecha`).value,actividad:e.querySelector(`#modal-clase_id`).value,clase_id:null,hora_inicio:e.querySelector(`#modal-hora_inicio`).value,hora_fin:e.querySelector(`#modal-hora_fin`).value,tema_principal:e.querySelector(`#modal-tema`).value.trim(),contenido:e.querySelector(`#modal-contenido`).value.trim(),motivo:e.querySelector(`#modal-motivo`).value.trim(),es_codocencia:e.querySelector(`#modal-es_co-docencia`).checked,maestro_auxiliar_id:e.querySelector(`#modal-maestro_auxiliar_id`)?.value||null,estado:`pendiente`,maestro_id:At,asistencia:t.map(e=>({alumno_id:e,estado:null}))};return!n.fecha||!n.actividad||!n.hora_inicio||!n.hora_fin||!n.tema_principal||!n.motivo?(F.error(`Todos los campos obligatorios deben completarse`),!1):t.length===0?(F.error(`Selecciona al menos un alumno participante`),!1):n.hora_inicio>=n.hora_fin?(F.error(`La hora de inicio debe ser menor que la hora de fin`),!1):(kt&&await kt(n),!0)}})}function Mt(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}var Nt=[`Do`,`Lu`,`Ma`,`Mi`,`Ju`,`Vi`,`Sa`],Pt=7;async function Ft(e,{onFechaClick:t}={}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let n=N();if(!n){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}let r=new Date,i=r.getFullYear(),a=r.getMonth();async function o(){try{let s=await It(n.id,i,a);Lt(e,i,a,r,s,{onFechaClick:e=>{Rt(e),t?.(e)},onPrev:()=>{a===0?(i--,a=11):a--,o()},onNext:()=>{a===11?(i++,a=0):a++,o()}})}catch(t){e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error al cargar calendario: ${L(t.message)}</p>`}}await o()}async function It(e,t,n){let r=new Date(t,n,1),i=new Date(t,n+1,0),a=r.toISOString().split(`T`)[0],o=i.toISOString().split(`T`)[0],s=(await g()).map(e=>e.id);if(s.length===0)return new Map;let c=await x(s),l=new Set(c.map(e=>e.dia?.toLowerCase())),u=new Map;c.forEach(e=>{let t=e.dia?.toLowerCase(),n=e.hora_fin||`23:59`;(t&&!u.has(t)||n>u.get(t))&&u.set(t,n)});let d=await A(e,a,o),f=d.filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return e.estado===`registrada`||e.estado===`cerrada`||t||e.borrador===!1&&n}),p=new Set(f.map(e=>e.fecha)),m=new Map,h=new Date;h.setHours(0,0,0,0);for(let e=new Date(r);e<=i;e.setDate(e.getDate()+1)){let t=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,n=Ae[e.getDay()];if(!l.has(n)){m.set(t,`sin-clase`);continue}let r=new Date(e),i=Math.floor((h-r)/864e5);if(i===0){let e=d.find(e=>e.fecha===t);if(e&&Array.isArray(e.asistencia)&&e.asistencia.length>0){m.set(t,`registrada`);continue}let r=u.get(n);if(r){let e=new Date,[n,i]=r.split(`:`),a=parseInt(n)*60*60*1e3+parseInt(i||0)*60*1e3;if(e.getHours()*60*60*1e3+e.getMinutes()*60*1e3<a){m.set(t,`sin-clase`);continue}}m.set(t,`pendiente`);continue}if(i>0&&p.has(t)){m.set(t,`registrada`);continue}i<0?m.set(t,`sin-clase`):i<=Pt?m.set(t,`pendiente`):m.set(t,`vencida`)}return m}function Lt(e,t,n,r,i,{onFechaClick:a,onPrev:o,onNext:s}){let c=new Date(t,n,1),l=new Date(t,n+1,0),u=c.getDay(),d=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,`0`)}-${String(r.getDate()).padStart(2,`0`)}`,f=l.getDate(),p=`${t}-${String(n+1).padStart(2,`0`)}-01`,m=`${t}-${String(n+1).padStart(2,`0`)}-${String(f).padStart(2,`0`)}`,h=d>=p&&d<=m?d:p,g=Nt.map(e=>`<div class="pm-cal-day-header">${e}</div>`).join(``);for(let e=0;e<u;e++)g+=`<div class="pm-cal-day otro-mes"></div>`;for(let e=1;e<=f;e++){let r=`${t}-${String(n+1).padStart(2,`0`)}-${String(e).padStart(2,`0`)}`,a=i.get(r)||`sin-clase`,o=r===d?`today`:``,s=r===h,c=`${e} de ${Ee[n]} ${t}`;g+=`
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
          ${Ee[n]} ${t}
        </h2>
        <button id="pm-cal-next" class="pm-cal-nav-btn">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div class="pm-cal-grid-container">
        <div class="pm-cal-grid" role="grid" aria-label="Calendario ${Ee[n]} ${t}">
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
  `,e.querySelector(`#pm-cal-prev`).addEventListener(`click`,o),e.querySelector(`#pm-cal-next`).addEventListener(`click`,s),e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.pm-cal-day[data-fecha]`).forEach(e=>e.setAttribute(`aria-selected`,`false`)),t.setAttribute(`aria-selected`,`true`),a?.(t.dataset.fecha)})});let _=e.querySelector(`.pm-cal-grid`);_&&_.addEventListener(`keydown`,function(e){let t=[..._.querySelectorAll(`.pm-cal-day[data-fecha]`)];if(t.length===0)return;let n=_.querySelector(`[tabindex="0"]`),r=n?t.indexOf(n):-1,i=e=>{e<0||e>=t.length||(t.forEach(e=>e.setAttribute(`tabindex`,`-1`)),t[e].setAttribute(`tabindex`,`0`),t[e].focus())};switch(e.key){case`ArrowLeft`:e.preventDefault(),r>0&&i(r-1);break;case`ArrowRight`:e.preventDefault(),r<t.length-1&&i(r+1);break;case`ArrowUp`:e.preventDefault(),i(Math.max(0,r-7));break;case`ArrowDown`:e.preventDefault(),i(Math.min(t.length-1,r+7));break;case`Home`:e.preventDefault(),i(Math.floor(Math.max(r,0)/7)*7);break;case`End`:e.preventDefault(),i(Math.min(t.length-1,Math.floor(Math.max(r,0)/7)*7+6));break;case`PageUp`:e.preventDefault(),typeof o==`function`&&o();break;case`PageDown`:e.preventDefault(),typeof s==`function`&&s();break;case`Enter`:case` `:e.preventDefault(),n&&n.click();break}})}async function Rt(e){let t=N();if(!t)return;let n=new Date,r=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}-${String(n.getDate()).padStart(2,`0`)}`,i=document.getElementById(`pm-action-drawer`);i||(i=document.createElement(`div`),i.id=`pm-action-drawer`,i.className=`pm-drawer-overlay`,document.body.appendChild(i));let a=e===r,o=e<r,s=[],c=[],l=[];try{let{data:n}=await j.from(`sesiones_clase`).select(`*`).eq(`maestro_id`,t.id).eq(`fecha`,e);s=n||[];let{data:r}=await j.from(`clases`).select(`id, nombre, instrumento`).or(`maestro_principal_id.eq.${t.id},maestro_suplente_id.eq.${t.id},maestro_id.eq.${t.id}`);c=r||[];let i=c.map(e=>e.id);if(i.length>0){let{data:e}=await j.from(`clase_horarios`).select(`clase_id, hora_inicio, hora_fin, dia`).in(`clase_id`,i);l=e||[]}}catch(e){console.error(`Error fetching drawer data:`,e)}let[u,d,f]=e.split(`-`).map(Number),p=new Date(u,d-1,f),m=p.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),h=c.filter(e=>l.some(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===m)).map(e=>{let t=l.find(t=>t.clase_id===e.id&&t.dia?.toLowerCase()===m),n=s.find(t=>t.clase_id===e.id);return{...e,hora_inicio:t?.hora_inicio,hora_fin:t?.hora_fin,sesion:n}}).sort((e,t)=>(e.hora_inicio||``).localeCompare(t.hora_inicio||``)),g=``;if(h.length>0&&(g=h.map(e=>{let t=e.sesion&&(()=>{let t=Array.isArray(e.sesion.asistencia)&&e.sesion.asistencia.length>0,n=typeof e.sesion.contenido==`string`&&e.sesion.contenido.trim().length>0;return e.sesion.estado===`registrada`||e.sesion.estado===`cerrada`||t||e.sesion.borrador===!1&&n})(),n=e.sesion&&!t&&(e.sesion.estado===`pendiente`||e.sesion.borrador===!0);return`
        <div class="pm-drawer-clase-item">
          <div class="pm-drawer-clase-info">
            <span class="pm-drawer-clase-hora">${(e.hora_inicio||`--:--`).slice(0,5)} - ${(e.hora_fin||`--:--`).slice(0,5)}</span>
            <span class="pm-drawer-clase-nombre">${L(e.nombre)}</span>
            <span class="pm-drawer-clase-instrumento">${L(e.instrumento||``)}</span>
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
    `,document.head.appendChild(e)}let _=()=>i.classList.remove(`open`),v=i.querySelector(`#pm-drawer-close-btn`);v&&(v.onclick=_),i.addEventListener(`click`,e=>{e.target===i&&_()}),i.querySelectorAll(`.btn-pasar-asistencia, .btn-ver-sesion, .btn-continuar-sesion`).forEach(t=>{t&&t.addEventListener(`click`,()=>{let n=t.dataset.clase;_(),window.location.hash=`#/asistencia?clase=${n}&fecha=${e}`})});let y=i.querySelector(`#pm-drawer-emergente`);y&&y.addEventListener(`click`,()=>{zt(e,c)}),setTimeout(()=>i.classList.add(`open`),10)}async function zt(e,t){let n=[];try{let e=await _(t.map(e=>e.id)),r={};e.forEach(e=>{if(!e.alumnos)return;r[e.alumno_id]||(r[e.alumno_id]=[]);let n=t.find(t=>t.id===e.clase_id);n&&r[e.alumno_id].push(n.nombre)});let i=new Set;n=e.map(e=>e.alumnos).filter(Boolean).filter(e=>i.has(e.id)?!1:(i.add(e.id),!0)).map(e=>({...e,clase_nombres:r[e.id]||[]}))}catch(e){console.warn(`[calendario] No se pudieron cargar alumnos para clase emergente:`,e)}jt({fecha:e,clases:t,alumnos:n,maestroId:N().id,onSave:async e=>{try{let{data:t,error:n}=await j.from(`sesiones_clase`).insert([e]).select().single();if(n)throw n;let r=document.getElementById(`pm-action-drawer`);r&&r.classList.remove(`open`),window.location.hash=`#/asistencia?sesion=${t.id}&fecha=${e.fecha}`,F.success(`Clase emergente creada. Procedé a pasar asistencia.`)}catch(e){console.error(`Error creando clase emergente:`,e),F.error(`No se pudo crear la clase emergente`)}}})}var B={periodo:4,maestroId:null,clasesData:[],todasSesiones:[],inscripcionesPorClase:{},alertasRiesgo:[]};async function Bt(e,t){let n=await g();n.sort((e,t)=>e.nombre.localeCompare(t.nombre));let r=new Date;r.setDate(r.getDate()-e*7);let i=r.toISOString().split(`T`)[0],a=new Date().toISOString().split(`T`)[0],o=await A(t,i,a)||[],s=n.map(e=>e.id);if(s.length===0)return{clases:n,sesiones:o,inscripcionesPorClase:{}};let{data:c}=await j.from(`alumnos_clases`).select(`clase_id, alumno:alumnos(id, nombre_completo)`).in(`clase_id`,s).eq(`activo`,!0),l={};for(let e of c||[])!e.clase_id||!e.alumno||(l[e.clase_id]||(l[e.clase_id]=[]),l[e.clase_id].push(e.alumno));return{clases:n,sesiones:o,inscripcionesPorClase:l}}function Vt({clases:e,sesiones:t,inscripcionesPorClase:n}){let r=t.filter(e=>e.estado===`registrada`).length,i=t.filter(e=>e.estado===`pendiente`).length,a=t.filter(e=>e.borrador===!0).length,o=0,s=0,c=0,l=0;t.forEach(e=>{(e.asistencia||[]).forEach(e=>{l++,e.estado===`P`?o++:e.estado===`A`?s++:e.estado===`J`&&c++})});let u=l>0?Math.round(o/l*100):0,d=e.map(e=>{let r=t.filter(t=>t.clase_id===e.id),i=r.filter(e=>e.estado===`registrada`).length,a=r.filter(e=>e.estado===`pendiente`).length,o=n[e.id]||[],s=o.length,c=r.filter(e=>e.estado===`registrada`).slice(-8).map(e=>{let t=(e.asistencia||[]).filter(e=>e.estado===`P`).length,n=(e.asistencia||[]).length;return n>0?Math.round(t/n*100):0}),l=0,u=0;r.forEach(e=>{(e.asistencia||[]).forEach(e=>{u++,e.estado===`P`&&l++})});let d=u>0?Math.round(l/u*100):0,f=r.filter(e=>e.contenido_dsl?.trim()).length,p=r.length>0?Math.min(100,Math.round(f/Math.max(i,1)*100)):0,m=[];for(let e of o){let t=r.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).map(t=>t.asistencia.find(t=>t.alumno_id===e.id)),n=t.filter(e=>e?.estado===`P`).length,i=t.length>0?Math.round(n/t.length*100):0;i>0&&i<70&&m.push({id:e.id,nombre:e.nombre_completo,pct:i})}return{...e,totalAlumnos:s,sesionesCompletadas:i,sesionesPendientes:a,sessionAttendance:c,avgAttendance:d,progress:p,riskStudents:m,alumnos:o}}),f=[];for(let e of d)for(let t of e.riskStudents)f.push({tipo:`baja_asistencia`,alumnoId:t.id,nombre:t.nombre,clase:e.nombre,valor:t.pct,mensaje:`${t.pct}%`});return{totalClases:e.length,sesionesCompletadas:r,sesionesPendientes:i+a,totalPresentes:o,totalAusentes:s,totalJustificados:c,totalRegistros:l,asistenciaPromedio:u,clasesData:d,alertasRiesgo:f,inscripcionesPorClase:n}}function Ht(e){let{totalClases:t,sesionesCompletadas:n,sesionesPendientes:r,totalPresentes:i,totalAusentes:a,totalJustificados:o,totalRegistros:s,asistenciaPromedio:c,clasesData:l,alertasRiesgo:u}=e,d=s>0?Math.round(i/s*100):0,f=s>0?Math.round(a/s*100):0,p=s>0?Math.round(o/s*100):0;return`
    <div class="pm-dashboard" role="main" aria-label="Panel de métricas">
      <div role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden">${L(`Dashboard: ${c}% asistencia general, ${t} clases, ${n} sesiones registradas, ${r} pendientes.`)}</div>
      <header class="pm-dashboard-header">
        <div>
          <h1 class="pm-dashboard-title">Dashboard</h1>
          <p class="pm-dashboard-subtitle">Resumen académico</p>
        </div>
        <select id="pm-filter-periodo" class="pm-dashboard-select" aria-label="Período de análisis">
          <option value="4" ${B.periodo===4?`selected`:``}>4 semanas</option>
          <option value="8" ${B.periodo===8?`selected`:``}>8 semanas</option>
          <option value="12" ${B.periodo===12?`selected`:``}>12 semanas</option>
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
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-check-circle-fill" style="color:#30d158"></i> Presentes</span>
              <span>${i} &nbsp;·&nbsp; ${d}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill success" style="width:${d}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-x-circle-fill" style="color:#ff3b30"></i> Ausentes</span>
              <span>${a} &nbsp;·&nbsp; ${f}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill danger" style="width:${f}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-exclamation-circle-fill" style="color:#ff9500"></i> Justificados</span>
              <span>${o} &nbsp;·&nbsp; ${p}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill warning" style="width:${p}%"></div></div>
          </div>
        </div>
      </section>

      ${u.length>0?`
      <section class="pm-dashboard-section" aria-label="Alumnos en riesgo">
        <h2 class="pm-section-title">Alumnos en Riesgo <span class="pm-section-badge">${u.length}</span></h2>
        <div class="pm-risk-list" role="list">
          ${u.slice(0,5).map(e=>`
            <div class="pm-risk-item" role="listitem" tabindex="0" data-alumno="${e.alumnoId}" aria-label="Ver perfil de ${L(e.nombre)}">
              <div class="pm-risk-avatar" aria-hidden="true">${(e.nombre||`A`)[0].toUpperCase()}</div>
              <div class="pm-risk-info">
                <span class="pm-risk-name">${L(e.nombre)}</span>
                <span class="pm-risk-class">${L(e.clase)}</span>
              </div>
              <span class="pm-risk-pct">${e.mensaje}</span>
            </div>
          `).join(``)}
        </div>
      </section>`:``}

      <section class="pm-dashboard-section" aria-label="Resumen por clase">
        <h2 class="pm-section-title">Clases</h2>
        <div class="pm-classes-list" id="pm-clases-grid">
          ${l.map(e=>{let t=e.avgAttendance,n=t<70?`danger`:t<85?`warning`:`success`,r=t<70?`linear-gradient(135deg,#ff3b30,#ff6b6b)`:t<85?`linear-gradient(135deg,#ff9500,#ffcc00)`:`linear-gradient(135deg,#30d158,#34c759)`,i=e.sessionAttendance.length>0?e.sessionAttendance.map((e,t,n)=>{let r=Math.max(8,e),i=e<70?`#ff3b30`:e<85?`#ff9500`:`#30d158`;return`<div class="pm-spark-bar ${t===n.length-1?`pm-spark-last`:``}" style="height:${r}%;background:${i};" title="${e}%"></div>`}).join(``):`<span class="pm-spark-empty">—</span>`;return`
            <div class="pm-class-card2" data-clase-id="${e.id}" role="article" aria-label="Clase ${L(e.nombre)}">
              <div class="pm-class-card2__accent" style="background:${r}"></div>
              <div class="pm-class-card2__body">
                <div class="pm-class-card2__top">
                  <div class="pm-class-card2__info">
                    <span class="pm-class-card2__name">${L(e.nombre)}</span>
                    ${e.instrumento?`<span class="pm-class-card2__inst"><i class="bi bi-music-note-beamed"></i> ${L(e.instrumento)}</span>`:``}
                  </div>
                  <div class="pm-class-card2__badge-wrap">
                    <span class="pm-class-card2__pct ${n}" aria-label="Asistencia ${t}%">${t}%</span>
                    <button class="pm-class-btn2" data-clase-id="${e.id}" aria-label="Ver alumnos" title="Ver alumnos">
                      <i class="bi bi-people-fill"></i>
                    </button>
                  </div>
                </div>

                <div class="pm-class-card2__spark" aria-label="Tendencia de asistencia últimas sesiones">
                  ${i}
                </div>

                <div class="pm-class-card2__stats">
                  <div class="pm-cs2 pm-cs2--success">
                    <i class="bi bi-check-circle-fill"></i>
                    <span class="pm-cs2__val">${e.sesionesCompletadas}</span>
                    <span class="pm-cs2__lbl">REG.</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--warning">
                    <i class="bi bi-clock-fill"></i>
                    <span class="pm-cs2__val">${e.sesionesPendientes}</span>
                    <span class="pm-cs2__lbl">PEN.</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--blue">
                    <i class="bi bi-people-fill"></i>
                    <span class="pm-cs2__val">${e.totalAlumnos}</span>
                    <span class="pm-cs2__lbl">ALUM.</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--purple">
                    <i class="bi bi-journal-check"></i>
                    <span class="pm-cs2__val">${e.progress}%</span>
                    <span class="pm-cs2__lbl">CONT.</span>
                  </div>
                </div>

                ${e.riskStudents.length>0?`
                <div class="pm-class-card2__risk">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  ${e.riskStudents.length} alumno${e.riskStudents.length>1?`s`:``} con asistencia &lt;70%
                </div>`:``}
              </div>
            </div>`}).join(``)}
        </div>
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

      .pm-attendance-bars { display: flex; flex-direction: column; gap: 0.75rem; }
      .pm-attendance-bar-item { display: flex; flex-direction: column; gap: 0.375rem; }
      .pm-attendance-bar-label { display: flex; justify-content: space-between; align-items: center; }
      .pm-attendance-bar-label span:first-child { font-size: 0.8125rem; font-weight: 500; color: var(--pm-text); display: flex; align-items: center; gap: 0.375rem; }
      .pm-attendance-bar-label span:last-child { font-size: 0.75rem; font-weight: 600; color: var(--pm-text-muted); }
      .pm-attendance-bar-track { height: 8px; background: var(--pm-border); border-radius: 4px; overflow: hidden; }
      .pm-attendance-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(.22,.61,.36,1); }
      .pm-attendance-bar-fill.success { background: linear-gradient(90deg,#30d158,#34c759); }
      .pm-attendance-bar-fill.danger  { background: linear-gradient(90deg,#ff3b30,#ff6b6b); }
      .pm-attendance-bar-fill.warning { background: linear-gradient(90deg,#ff9500,#ffcc00); }

      .pm-risk-list { display: flex; flex-direction: column; gap: 0.5rem; }
      .pm-risk-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; background: var(--pm-surface); border-radius: 10px; cursor: pointer; transition: transform 0.15s ease; }
      .pm-risk-item:active { transform: scale(0.99); }
      .pm-risk-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--pm-danger) 0%, #ff6b6b 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
      .pm-risk-info { flex: 1; min-width: 0; }
      .pm-risk-name { display: block; font-size: 0.875rem; font-weight: 600; color: var(--pm-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pm-risk-class { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-risk-pct { font-size: 0.8125rem; font-weight: 700; color: var(--pm-danger); background: var(--pm-danger-bg); padding: 0.25rem 0.5rem; border-radius: 6px; }

      /* ── Class card v2 ─────────────────────────────────────── */
      .pm-classes-list { display: flex; flex-direction: column; gap: 0.75rem; }

      .pm-class-card2 {
        display: flex;
        background: var(--pm-surface);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .pm-class-card2:active { transform: scale(0.99); }

      .pm-class-card2__accent {
        width: 4px;
        flex-shrink: 0;
        border-radius: 0;
      }
      .pm-class-card2__body {
        flex: 1;
        padding: 0.875rem 0.875rem 0.875rem 0.75rem;
        min-width: 0;
      }

      .pm-class-card2__top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.625rem;
      }
      .pm-class-card2__info { flex: 1; min-width: 0; }
      .pm-class-card2__name {
        display: block;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--pm-text);
        line-height: 1.25;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .pm-class-card2__inst {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: var(--pm-text-muted);
        margin-top: 0.125rem;
      }
      .pm-class-card2__badge-wrap {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex-shrink: 0;
      }
      .pm-class-card2__pct {
        font-size: 1rem;
        font-weight: 800;
        padding: 0.25rem 0.625rem;
        border-radius: 10px;
        line-height: 1;
      }
      .pm-class-card2__pct.success {
        background: rgba(52,199,89,0.15);
        color: #30d158;
      }
      .pm-class-card2__pct.warning {
        background: rgba(255,149,0,0.15);
        color: #ff9500;
      }
      .pm-class-card2__pct.danger  {
        background: rgba(255,59,48,0.15);
        color: #ff3b30;
      }

      /* Spark chart */
      .pm-class-card2__spark {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 32px;
        margin: 0 0 0.625rem;
        padding: 4px 0 0;
      }
      .pm-spark-bar {
        flex: 1;
        border-radius: 3px 3px 0 0;
        min-height: 4px;
        opacity: 0.75;
        transition: opacity 0.2s;
      }
      .pm-spark-bar.pm-spark-last { opacity: 1; }
      .pm-spark-empty {
        font-size: 0.75rem;
        color: var(--pm-text-muted);
        align-self: center;
      }

      /* Stats row */
      .pm-class-card2__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border-top: 1px solid var(--pm-border);
        padding-top: 0.5rem;
        gap: 0;
      }
      .pm-cs2 {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.25rem 0.125rem;
        gap: 0.0625rem;
      }
      .pm-cs2 i {
        font-size: 0.6875rem;
        margin-bottom: 0.125rem;
        opacity: 0.7;
      }
      .pm-cs2__val {
        font-size: 1rem;
        font-weight: 800;
        color: var(--pm-text);
        line-height: 1;
      }
      .pm-cs2__lbl {
        font-size: 0.5rem;
        color: var(--pm-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 600;
      }
      .pm-cs2--success { color: #30d158; }
      .pm-cs2--success .pm-cs2__val { color: #30d158; }
      .pm-cs2--warning { color: #ff9500; }
      .pm-cs2--warning .pm-cs2__val { color: #ff9500; }
      .pm-cs2--blue { color: #0a84ff; }
      .pm-cs2--blue .pm-cs2__val { color: var(--pm-text); }
      .pm-cs2--purple { color: #bf5af2; }
      .pm-cs2--purple .pm-cs2__val { color: var(--pm-text); }

      .pm-class-card2__risk {
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.625rem;
        background: rgba(255,59,48,0.1);
        border-radius: 8px;
        font-size: 0.6875rem;
        color: #ff3b30;
        font-weight: 500;
      }
      .pm-class-btn2 {
        background: var(--pm-surface-2);
        border: none;
        padding: 0.375rem 0.5rem;
        border-radius: 8px;
        color: var(--pm-text-muted);
        cursor: pointer;
        font-size: 0.75rem;
        transition: background 0.15s, color 0.15s;
      }
      .pm-class-btn2:hover { background: var(--pm-border); color: var(--pm-text); }
      /* Legacy .pm-class-card kept for compatibility */
      .pm-class-card { background: var(--pm-surface); border-radius: 12px; padding: 0.875rem; position: relative; }
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
  `}function Ut(e){e.querySelector(`#pm-filter-periodo`)?.addEventListener(`change`,async t=>{let n=parseInt(t.target.value,10);B.periodo=n,e.innerHTML=`<div class="pm-loading" style="padding:2rem;"><div class="pm-spinner"></div></div>`;try{let t=await Bt(n,B.maestroId),r=Vt(t);B.clasesData=r.clasesData,B.todasSesiones=t.sesiones,B.inscripcionesPorClase=t.inscripcionesPorClase,B.alertasRiesgo=r.alertasRiesgo,e.innerHTML=Ht(r),Ut(e),xt(`Período actualizado a ${n} semanas. ${r.asistenciaPromedio}% de asistencia general.`)}catch(t){e.innerHTML=`<p class="pm-empty">Error al cargar datos: ${L(t.message)}</p>`}}),e.querySelectorAll(`.pm-risk-item`).forEach(e=>{let t=e.dataset.alumno,n=()=>{window.location.hash=`#/alumno?id=${t}`};e.addEventListener(`click`,n),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&n()})}),e.querySelectorAll(`.pm-class-btn, .pm-class-btn2`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.closest(`.pm-class-card2, .pm-class-card`),r=n.querySelector(`.pm-clase-students-panel`);if(r){r.remove();return}let i=e.dataset.claseId,a=B.clasesData.find(e=>e.id===i)?.alumnos||[],o=B.todasSesiones.filter(e=>e.clase_id===i),s=a.map(e=>{let t=o.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).map(t=>t.asistencia.find(t=>t.alumno_id===e.id)),n=t.filter(e=>e?.estado===`P`).length,r=t.length,i=r>0?Math.round(n/r*100):0,a=o.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).sort((e,t)=>t.fecha.localeCompare(e.fecha))[0];return{...e,pct:i,total:r,lastFecha:a?.fecha}});s.sort((e,t)=>e.pct-t.pct);let c=document.createElement(`div`);c.className=`pm-clase-students-panel`,c.innerHTML=`
        <div class="pm-clase-students-header">
          <span>Alumnos (${s.length})</span>
          <button class="pm-clase-students-close" aria-label="Cerrar panel">×</button>
        </div>
        <div class="pm-clase-students-list" role="list">
          ${s.map(e=>`
            <div class="pm-clase-student-row" role="listitem" tabindex="0" data-alumno="${e.id}">
              <div class="pm-student-info">
                <span class="pm-student-nombre">${L(e.nombre_completo)}</span>
                <span class="pm-student-meta">${e.total} sesiones · Última: ${e.lastFecha?new Date(e.lastFecha).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}):`—`}</span>
              </div>
              <div class="pm-student-attendance ${e.pct<70?`danger`:e.pct<85?`warning`:`success`}">
                <span>${e.pct}%</span>
                <div class="pm-student-att-bar"><div class="pm-student-att-fill" style="width:${e.pct}%"></div></div>
              </div>
            </div>
          `).join(``)}
        </div>`,n.appendChild(c),c.querySelector(`.pm-clase-students-close`).addEventListener(`click`,()=>c.remove());let l=t=>{!c.contains(t.target)&&t.target!==e&&(c.remove(),document.removeEventListener(`click`,l))};setTimeout(()=>document.addEventListener(`click`,l),10),c.querySelectorAll(`.pm-clase-student-row`).forEach(e=>{let t=()=>window.location.hash=`#/alumno?id=${e.dataset.alumno}`;e.addEventListener(`click`,t),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&t()})})})})}function Wt(){if(!B.clasesData.length&&!Object.keys(B.inscripcionesPorClase).length)return null;let e=new Map;for(let[t,n]of Object.entries(B.inscripcionesPorClase)){let r=B.clasesData.find(e=>e.id===t);for(let t of n)e.has(t.id)||e.set(t.id,{...t,clases:[]}),r&&e.get(t.id).clases.push(r.nombre)}return[...e.values()]}async function Gt(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=N();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}B.maestroId=t.id;try{let n=await Bt(B.periodo,t.id),r=Vt(n);B.clasesData=r.clasesData,B.todasSesiones=n.sesiones,B.inscripcionesPorClase=n.inscripcionesPorClase,B.alertasRiesgo=r.alertasRiesgo,e.innerHTML=Ht(r),Ut(e),xt(`Métricas actualizadas. ${r.asistenciaPromedio}% de asistencia general.`)}catch(t){e.innerHTML=`
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;" role="alert">
        <p style="color:var(--pm-danger);">Error al cargar métricas</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${L(t.message)}</p>
      </div>`}}var V={alumnos:/#(todos\b|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|la|las|los|del|y|el)\b)?(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*|[A-Za-zÁÉÍÓÚáéíóúÑñ]+)/g,contenido:/\[([^\]]+)\]/g,sugerencias:/\(([^)]+)\)/g,tareas:/\{([^}]+)\}/g,medidas:/\$([^\s$]+)/g,objetivos:/>([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,niveles:/>NIVEL-(\d{1,2})/g,nodos:/>NODO:([A-Z_]+)/g,capas:/:::CAPA:\s*([A-Z_]+)/g,calificacion:/(\d)\/(\d)/g,estados:/!(LOGRADO|EN_PROGRESO|INICIADO)\b/gi},Kt={alumnos:`#0d6efd`,contenido:`#198754`,sugerencias:`#fd7e14`,tareas:`#9333ea`,medidas:`#6dd5ed`,calificacion:`#dc3545`,objetivos:`#6c757d`,niveles:`#5856d6`,nodos:`#af52de`,capas:`#ff9500`,estados:{LOGRADO:`#198754`,EN_PROGRESO:`#0d6efd`,INICIADO:`#6c757d`}};function qt(e,t){if(!e)return[];let n=[],r,i=new RegExp(t.source,t.flags);for(;(r=i.exec(e))!==null;)if(r[1]){let e=r[1].trim();t.source.includes(`#`)&&(e=e.split(/(?=\s[#\[\(\{\$>])/)[0].trim()),n.push(e)}return n}function Jt(e){if(!e)return null;let t=e.match(/(\d)\/(\d)/);if(!t)return null;let n=parseInt(t[1],10),r=parseInt(t[2],10);return n<0||n>5||r!==5?null:{valor:n,sobre:r}}function Yt(e){return{alumnos:qt(e,V.alumnos),contenido:qt(e,V.contenido),sugerencias:qt(e,V.sugerencias),tareas:qt(e,V.tareas),medidas:qt(e,V.medidas),calificacion:Jt(e),objetivos:qt(e,V.objetivos),niveles:qt(e,V.niveles),nodos:qt(e,V.nodos),capas:qt(e,V.capas),estados:qt(e,V.estados).map(e=>e.toUpperCase())}}function Xt(e){if(!e||typeof e!=`string`)return{alumnos:[],contenido:[],sugerencias:[],tareas:[],medidas:[],calificacion:null,objetivos:[],niveles:[],nodos:[],capas:[],estados:[],por_capas:{}};let t=e.split(/:::CAPA:/),n={};return t.length>1&&t.forEach(e=>{if(!e.trim())return;let t=e.split(`
`),r=t[0].trim().toUpperCase(),i=t.slice(1).join(`
`);r&&(n[r]=Yt(i))}),{...Yt(e),por_capas:n}}function Zt(e){if(!e)return``;let t=Qt(e),n=[];function r(e){let t=`__DSL_TOKEN_${n.length}__`;return n.push({id:t,html:e}),t}t=t.replace(V.capas,(e,t)=>r(`<span class="dsl-token dsl-capa" style="background:${Kt.capas}22; color:${Kt.capas}; font-weight:800; padding:2px 6px; border-radius:4px">:::CAPA: ${t}</span>`)),t=t.replace(/&gt;NIVEL-(\d{1,2})/g,(e,t)=>r(`<span class="dsl-token dsl-nivel" style="color:${Kt.niveles}; font-weight:700">&gt;NIVEL-${t}</span>`)),t=t.replace(/&gt;NODO:([A-Z_]+)/g,(e,t)=>r(`<span class="dsl-token dsl-nodo" style="color:${Kt.nodos}; font-weight:600">&gt;NODO:${t}</span>`)),t=t.replace(/&gt;([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,(e,t)=>r(`<span class="dsl-token dsl-objetivo" data-objetivo="${t}">&gt;${t}</span>`)),t=t.replace(V.alumnos,(e,t)=>r(`<span class="dsl-token dsl-alumno" data-nombre="${t}">#${t}</span>`)),t=t.replace(V.contenido,(e,t)=>r(`<span class="dsl-token dsl-contenido" data-contenido="${t}">[${t}]</span>`)),t=t.replace(V.sugerencias,(e,t)=>r(`<span class="dsl-token dsl-sugerencia" data-sugerencia="${t}">(${t})</span>`)),t=t.replace(V.tareas,(e,t)=>r(`<span class="dsl-token dsl-tarea" data-tarea="${t}">{${t}}</span>`)),t=t.replace(V.medidas,(e,t)=>r(`<span class="dsl-token dsl-medida" data-medida="${t}">$${t}</span>`)),t=t.replace(/!(LOGRADO|EN_PROGRESO|INICIADO)/gi,(e,t)=>{let n=t.toUpperCase(),i={LOGRADO:`#198754`,EN_PROGRESO:`#0d6efd`,INICIADO:`#6c757d`}[n]??`#6c757d`;return r(`<span class="dsl-token dsl-estado" style="color:${i};font-weight:700;background:${i}18;padding:1px 4px;border-radius:3px">!${n}</span>`)}),t=t.replace(V.calificacion,(e,t,n)=>r(`<span class="dsl-token dsl-calificacion" data-valor="${t}" data-sobre="${n}">${t}/${n}</span>`));for(let e=n.length-1;e>=0;e--)t=t.replace(n[e].id,n[e].html);return t}function Qt(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var $t=[{trigger:`escalas`,label:`Escalas`,icon:`🎼`,expand:`[Escala Do Mayor] [Escala Re Mayor] [Escala Sol Mayor]`},{trigger:`arpegios`,label:`Arpegios`,icon:`🎹`,expand:`[Arpegio Do Mayor] [Arpegio La menor] [Arpegio Sol Mayor]`},{trigger:`tecnica`,label:`Técnica`,icon:`🎸`,expand:`$Tecnica_mano_derecha $Tecnica_mano_izquierda`},{trigger:`postura`,label:`Postura`,icon:`🧘`,expand:`$Postura_corporal $Posicion_manos`},{trigger:`evaluar`,label:`Evaluar`,icon:`📝`,expand:`4/5 (buen trabajo) {practicar 30 min diarios}`},{trigger:`mejorar`,label:`Mejorar`,icon:`💪`,expand:`(continuar mejorando la digitación) {repetir练习}`},{trigger:`ritmo`,label:`Ritmo`,icon:`🥁`,expand:`$Ritmo_binario $Ritmo_ternario`},{trigger:`dinamica`,label:`Dinámica`,icon:`🔊`,expand:`$Dinamica_piano $Dinamica_forte $Dinamica_mezzo`},{trigger:`afinacion`,label:`Afinación`,icon:`🎵`,expand:`$Afinacion_precisa $Afinacion_relativa`},{trigger:`lectura`,label:`Lectura`,icon:`📖`,expand:`[Lectura a primera vista] [Lectura de notas]`},{trigger:`respiracion`,label:`Respiración`,icon:`🌬️`,expand:`$Respiracion_diafragmatica $Respiracion_costeado`},{trigger:`memo`,label:`Memoria`,icon:`🧠`,expand:`[Técnica de memorización] {practicar de memoria}`}];function en(e){if(!e||e.length===0)return $t.slice(0,6);let t=e.toLowerCase();return $t.filter(e=>e.trigger.toLowerCase().includes(t)||e.label.toLowerCase().includes(t)).slice(0,6)}function tn(e){let t=$t.find(t=>t.trigger===e);return t?t.expand:null}function nn(e,{onAccept:t}){let n=document.getElementById(`pm-structure-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-structure-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
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
      `,document.head.appendChild(e)}let r=n.querySelector(`#pm-structure-original`),i=n.querySelector(`#pm-structure-dsl`);function a({original:e,dsl:t}){r.textContent=e,i.textContent=t,n.classList.add(`open`)}function o(){n.classList.remove(`open`)}return n.querySelector(`#pm-structure-close`).onclick=o,n.querySelector(`#pm-structure-reject`).onclick=o,n.querySelector(`#pm-structure-accept`).onclick=()=>{t&&t(i.textContent),o()},{open:a,close:o}}function rn(e,t={}){let n=document.getElementById(`pm-toolbar-help-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-toolbar-help-modal`,n.className=`pm-help-modal-overlay`,n.innerHTML=`
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
      `,document.head.appendChild(e)}let r=null;function i(){n.classList.add(`open`),n.querySelector(`.pm-help-primary-btn`)?.focus(),r&&r.dispose(),r=Le(n.querySelector(`.pm-help-modal`),{onClose:()=>a()})}function a(){r&&=(r.dispose(),null),n.classList.remove(`open`)}return n.querySelector(`#pm-help-close`).onclick=a,n.querySelector(`#pm-help-close-btn`).onclick=a,n.onclick=e=>{e.target===n&&a()},document.addEventListener(`keydown`,function e(t){t.key===`Escape`&&n.classList.contains(`open`)&&(a(),document.removeEventListener(`keydown`,e))}),{open:i,close:a}}function an(e,{onInsert:t,onLoading:n,onIaProposal:r,getEditorContent:i,aiService:a,onImproveClick:o,onStructureClick:s,onAnalyzeClick:c}){let l={presentes:[],indicadorActivo:null,indicadoresDisponibles:[]},u=[{token:`alumno`,label:`#`,title:`Etiquetar alumno`,text:`#`,offset:1,icon:`👤`,triggerAC:`#`},{token:`contenido`,label:`[ ]`,title:`Contenido de clase`,text:`[]`,offset:1,icon:`📚`,triggerAC:`[`},{token:`sugerencia`,label:`( )`,title:`Sugerencia pedagógica`,text:`()`,offset:1,icon:`💡`,triggerAC:`(`},{token:`tarea`,label:`{ }`,title:`Tarea / Asignación`,text:`{}`,offset:1,icon:`📝`,triggerAC:`{`},{token:`medida`,label:`$`,title:`Medida técnica`,text:`$`,offset:1,icon:`🎯`,triggerAC:`$`},{token:`objetivo`,label:`>`,title:`Objetivo curricular`,text:`>`,offset:1,icon:`🎓`,triggerAC:`>`}];if(e.innerHTML=`
    <div class="pm-dsl-toolbar">
      ${u.map(e=>`
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
      <button class="pm-dsl-tool-btn ai ai-primary" id="btn-analizar-progreso" title="La IA lee tu texto y extrae los avances de cada alumno automáticamente">✨ Analizar con IA</button>
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
      .pm-dsl-tool-btn.ai-primary {
        padding: 0 0.85rem;
        font-weight: 700;
        font-size: 0.82rem;
        background: var(--pm-primary, #6366f1);
        color: #fff;
        border-color: var(--pm-primary, #6366f1);
        gap: 4px;
        min-width: unset;
        width: auto;
        letter-spacing: 0.01em;
      }
      .pm-dsl-tool-btn.ai-primary:hover {
        background: var(--pm-primary-dark, #4f46e5);
        border-color: var(--pm-primary-dark, #4f46e5);
        color: #fff;
        transform: translateY(-1px);
      }
      .pm-dsl-tool-btn.ai-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
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


    `,document.head.appendChild(e)}let d=new Map(u.map(e=>[e.token,e]));e.querySelectorAll(`.pm-dsl-tool-btn[data-token]`).forEach(e=>{e.onclick=()=>{let n=d.get(e.dataset.token);n&&(e.style.transform=`scale(0.9)`,setTimeout(()=>{e.style.transform=``},100),t(n.text,n.offset,n.triggerAC))}});async function f(){let e=i?i():``;if(e.trim()&&o)try{o(e)}catch(e){alert(`Error al generar informe: `+e.message)}}async function p(){let e=i?i():``;if(e.trim()&&s)try{s(e)}catch(e){alert(`Error al estructurar con IA: `+e.message)}}e.querySelector(`#btn-generar-informe`).onclick=f,e.querySelector(`#btn-ia-magic`).onclick=p;let m=e.querySelector(`#btn-analizar-progreso`);m&&(m.onclick=async()=>{let e=i?i():``;if(e.trim()&&c){m.disabled=!0,m.textContent=`⏳ Analizando...`;try{await c(e)}catch{}finally{m.disabled=!1,m.textContent=`✨ Analizar con IA`}}});let h=e.querySelector(`#pm-snippet-popup`);function g(n=``){let r=en(n);if(r.length===0){h.style.display=`none`;return}h.innerHTML=r.map(e=>`
      <div class="pm-snippet-item" data-trigger="${e.trigger}">
        <span class="pm-snippet-icon">${e.icon}</span>
        <span class="pm-snippet-label">/${e.trigger}</span>
        <span class="pm-snippet-preview">${e.label}</span>
      </div>
    `).join(``);let i=e.getBoundingClientRect(),a=i.top;h.style.position=`fixed`,h.style.left=`${i.left}px`,h.style.width=`${i.width}px`,a>220?(h.style.top=`auto`,h.style.bottom=`${window.innerHeight-i.top+8}px`,h.style.transformOrigin=`bottom left`):(h.style.bottom=`auto`,h.style.top=`${i.bottom+8}px`,h.style.transformOrigin=`top left`),h.style.display=`block`,h.querySelectorAll(`.pm-snippet-item`).forEach(e=>{e.onclick=()=>{t(tn(e.dataset.trigger)+` `),_()}})}function _(){h.style.display=`none`}if(!document.getElementById(`pm-snippet-styles`)){let e=document.createElement(`style`);e.id=`pm-snippet-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}e.querySelector(`#btn-snippets`).onclick=()=>{h.style.display===`block`?_():g()};let v=rn(e);return e.querySelector(`#btn-help`).onclick=()=>{v.open()},{setContext(e={}){e.presentes!==void 0&&(l.presentes=e.presentes),e.indicadorActivo!==void 0&&(l.indicadorActivo=e.indicadorActivo),e.indicadoresDisponibles!==void 0&&(l.indicadoresDisponibles=e.indicadoresDisponibles)}}}var H=null,on=[],sn=null,U=-1,cn=!1,ln=null,un=!1,dn=0,fn=0;function pn(){if(!H){if(H=document.createElement(`div`),H.id=`pm-autocomplete-popup`,H.className=`pm-autocomplete-popup`,H.style.cssText=`
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
    `,document.head.appendChild(e)}document.body.appendChild(H)}}function mn(e,t,n={}){if(pn(),on=e||[],sn=t,ln=n.trigger||null,U=-1,cn=!0,bn(e),n.position){let e=n.position,t=window.innerWidth,r=window.innerHeight,i=e.x,a=e.y+20;i+320>t-20&&(i=Math.max(10,e.x-320-10)),a+280>r-20&&(a=Math.max(10,e.y-280-10)),H.style.left=`${i}px`,H.style.top=`${a}px`}H.onmousedown=hn,document.addEventListener(`mousemove`,gn),document.addEventListener(`mouseup`,_n),H.style.display=`block`}function hn(e){e.target.closest(`.pm-ac-option`)||(un=!0,dn=e.clientX-H.offsetLeft,fn=e.clientY-H.offsetTop,H.style.cursor=`grabbing`,H.style.transition=`none`)}function gn(e){if(!un)return;let t=e.clientX-dn,n=e.clientY-fn;H.style.left=`${Math.max(0,t)}px`,H.style.top=`${Math.max(0,n)}px`}function _n(){un&&(un=!1,H.style.cursor=``)}function vn(){H&&(H.style.display=`none`,un=!1,document.removeEventListener(`mousemove`,gn),document.removeEventListener(`mouseup`,_n)),on=[],sn=null,U=-1,cn=!1,ln=null}function yn(e){on=e||[],U=-1,bn(e)}function bn(e){if(!H)return;if(!e||e.length===0){H.innerHTML=`
      <div class="pm-ac-empty">
        <span>No hay opciones disponibles</span>
      </div>
    `;return}let t=`<div class="pm-ac-header">${wn(ln)}</div>`;e.forEach((e,n)=>{let r=e.nombre||e.name||e.label||e.description||``,i=e.instrumento||e.descripcion||e.codigo||e.type||``,a=n===U,o=Tn(ln,e),s=e.is_historial?`<span class="pm-ac-badge">Reciente</span>`:``;t+=`
      <div class="pm-ac-option ${a?`selected`:``}" data-index="${n}">
        <div class="pm-ac-icon">${o}</div>
        <div class="pm-ac-text">
          <div class="pm-ac-label">${Dn(r)}</div>
          ${i?`<div class="pm-ac-sublabel">${Dn(i)}</div>`:``}
        </div>
        ${s}
      </div>
    `}),H.innerHTML=t,H.querySelectorAll(`.pm-ac-option`).forEach(e=>{e.addEventListener(`click`,()=>{xn(parseInt(e.dataset.index,10))})})}function xn(e){if(e>=0&&e<on.length){let t=on[e];sn&&sn(t),vn()}}function Sn(e){if(!(!cn||on.length===0))switch(e.key){case`ArrowDown`:e.preventDefault(),U=Math.min(U+1,on.length-1),bn(on),Cn();break;case`ArrowUp`:e.preventDefault(),U=Math.max(U-1,0),bn(on),Cn();break;case`Enter`:e.preventDefault(),U>=0?xn(U):on.length>0&&xn(0);break;case`Escape`:e.preventDefault(),vn();break;case`Tab`:on.length>0&&U===-1&&(e.preventDefault(),xn(0));break}}function Cn(){if(!H||U<0)return;let e=H.querySelector(`.pm-ac-option[data-index="${U}"]`);e&&e.scrollIntoView({block:`nearest`,behavior:`smooth`})}function wn(e){switch(e){case`#`:return`👤 Alumnos`;case`[`:return`📚 Contenidos`;case`(`:return`💡 Sugerencias`;case`{`:return`📝 Tareas`;case`$`:return`🎯 Medidas`;case`>`:return`🎓 Objetivos`;default:return`Opciones`}}function Tn(e,t){if(e===`#`){let e=t.nombre||t.name||``;return t.value===`todos`||e.toLowerCase()===`todos`?`👥`:e.charAt(0).toUpperCase()}return e===`$`?`🎯`:e===`>`&&t.level_number?t.level_number:e===`>`&&t.type?En(t.type):`•`}function En(e){return{ESCALA:`🎼`,ARPEGIO:`🎹`,MANO_IZQ:`✋`,ARCO:`🎻`,SONIDO:`🔊`,AFINACION:`🎵`,TECNICA:`⚙️`,REPERTORIO:`📖`}[e]||`•`}function Dn(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function On(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0).getBoundingClientRect();return{x:t.left,y:t.top}}function kn(){return cn}function An(){return U}var jn={show:mn,hide:vn,updateOptions:yn,handleKeyDown:Sn,getCursorPosition:On,isOpen:kn,getSelectedIndex:An},Mn=`portal-maestros-catalogs`,Nn=1,Pn={alumnos:{ttl:1440*60*1e3},contenidos:{ttl:10080*60*1e3},medidas:{ttl:720*60*60*1e3},sugerencias:{ttl:720*60*60*1e3},tareas:{ttl:720*60*60*1e3},nodos:{ttl:10080*60*1e3},niveles:{ttl:10080*60*1e3},indicadores:{ttl:10080*60*1e3},historial:{ttl:null}},Fn=null;async function In(){return Fn||(Fn=await ce(Mn,Nn,{upgrade(e){for(let[t,n]of Object.entries(Pn))if(!e.objectStoreNames.contains(t)){let n=e.createObjectStore(t,{keyPath:`id`});n.createIndex(`by_updated`,`updated_at`),t===`alumnos`&&n.createIndex(`by_clase`,`clase_id`)}}}),Fn)}async function Ln(e,t){let n=await In(),r=await n.get(e,t);if(!r)return null;let i=Pn[e];if(i?.ttl&&r.updated_at){let a=new Date(r.updated_at).getTime()+i.ttl;if(Date.now()>a)return await n.delete(e,t),null}return r}async function Rn(e){let t=await(await In()).getAll(e),n=Pn[e];if(!n?.ttl)return t;let r=Date.now();return t.filter(e=>e.updated_at?r<=new Date(e.updated_at).getTime()+n.ttl:!0)}async function zn(e,t,n){return(await In()).getAllFromIndex(e,t,n)}async function Bn(e,t){let n=await In(),r={...t,updated_at:new Date().toISOString()};return await n.put(e,r),r}async function Vn(e,t){let n=(await In()).transaction(e,`readwrite`);for(let e of t)await n.store.put({...e,updated_at:new Date().toISOString()});await n.done}async function Hn(e,t){await(await In()).delete(e,t)}async function Un(e){await(await In()).clear(e)}async function Wn(e){let t=await In(),n=Pn[e];if(!n?.ttl)return;let r=await t.getAll(e),i=Date.now();for(let a of r)a.updated_at&&i>new Date(a.updated_at).getTime()+n.ttl&&await t.delete(e,a.id)}async function Gn(){let e=await In();for(let t of Object.keys(Pn))await e.clear(t)}async function Kn(e){return(await Rn(e)).length}async function qn(e,t){let n=await In(),r=new Date().toISOString(),i=await n.get(`historial`,e);i?(i.count=(i.count||0)+1,i.last_used=r,i.recent_selections=[t,...(i.recent_selections||[]).slice(0,9)],await n.put(`historial`,i)):await n.put(`historial`,{id:e,trigger:e,count:1,last_used:r,recent_selections:[t],updated_at:r})}async function Jn(e){return(await In()).get(`historial`,e)}async function Yn(e,t=5){return(await(await In()).getAll(`historial`)).filter(t=>t.trigger===e).sort((e,t)=>(t.count||0)-(e.count||0)).slice(0,t)}var W={get:Ln,getAll:Rn,getByIndex:zn,set:Bn,setBulk:Vn,remove:Hn,clear:Un,cleanExpired:Wn,clearAll:Gn,getStoreSize:Kn,addToHistorial:qn,getHistorial:Jn,getTopUsed:Yn};async function Xn(e){if(!e)return[];try{let{data:t,error:n}=await j.from(`alumnos_clases`).select(`alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).eq(`clase_id`,e).eq(`activo`,!0);if(n)throw n;if(t)return t.map(e=>e.alumnos).filter(Boolean).map(e=>({id:e.id,nombre:e.nombre_completo||``,instrumento:e.instrumento_principal}))}catch(e){console.warn(`[CatalogService] Error cargando alumnos:`,e)}return[]}async function Zn(){let e=await W.getAll(`contenidos`);if(e.length>0)return e;try{let{data:e,error:t}=await j.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`contenidos`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await W.setBulk(`contenidos`,e),e}catch(e){console.warn(`[CatalogService] Error cargando contenidos:`,e)}return[]}async function Qn(){let e=await W.getAll(`medidas`);if(e.length>0)return e;try{let{data:e,error:t}=await j.from(`catalogos`).select(`id, nombre, codigo, categoria`).eq(`tipo`,`medidas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await W.setBulk(`medidas`,e),e}catch(e){console.warn(`[CatalogService] Error cargando medidas:`,e)}return[]}async function $n(){let e=await W.getAll(`sugerencias`);if(e.length>0)return e;try{let{data:e,error:t}=await j.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`sugerencias`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await W.setBulk(`sugerencias`,e),e}catch(e){console.warn(`[CatalogService] Error cargando sugerencias:`,e)}return[]}async function er(){let e=await W.getAll(`tareas`);if(e.length>0)return e;try{let{data:e,error:t}=await j.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`tareas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await W.setBulk(`tareas`,e),e}catch(e){console.warn(`[CatalogService] Error cargando tareas:`,e)}return[]}async function tr(){let e=await W.getAll(`niveles`);if(e.length>0)return e;try{let{data:e}=await j.from(`routes`).select(`id`).eq(`instrument`,`violín`).eq(`status`,`published`).limit(1);if(!e||e.length===0)return[];let t=e[0].id,{data:n}=await j.from(`route_versions`).select(`id`).eq(`route_id`,t).eq(`status`,`published`).order(`version`,{ascending:!1}).limit(1);if(!n||n.length===0)return[];let r=n[0].id,{data:i,error:a}=await j.from(`levels`).select(`id, level_number, name, main_objective`).eq(`route_version_id`,r).order(`level_number`,{ascending:!0});if(a)throw a;if(i)return await W.setBulk(`niveles`,i),i}catch(e){console.warn(`[CatalogService] Error cargando niveles:`,e)}return[]}async function nr(e=null){let t=await W.getAll(`nodos`);if(e&&t.length>0){if(t=t.filter(t=>t.level_id===e),t.length>0)return t}else if(t.length>0)return t;try{let t=j.from(`nodes`).select(`id, name, type, is_critical, is_required, objective, level_id, order_index`);e&&(t=t.eq(`level_id`,e));let{data:n,error:r}=await t.order(`order_index`,{ascending:!0});if(r)throw r;if(n)return await W.setBulk(`nodos`,n),n}catch(e){console.warn(`[CatalogService] Error cargando nodos:`,e)}return[]}async function rr(e,t=``,n={}){let r=[];switch(e){case`#`:r=[{label:`todos`,value:`todos`,icon:`👥`,description:`Todos los presentes`}],r=r.concat(await Xn(n.claseId));break;case`[`:r=await Zn();break;case`(`:r=await $n();break;case`{`:r=await er();break;case`$`:r=await Qn();break;case`>`:r=t.toUpperCase().startsWith(`NIVEL`)?await tr():await nr(n.nivelId);break;default:r=[]}if(t&&r.length>0&&(r=ir(r,t)),e&&e!==`#`){let t=(await W.getTopUsed(e,3)).flatMap(e=>e.recent_selections||[]).filter(Boolean).slice(0,3);for(let e of t)r.some(t=>(t.nombre||t.name||``).toLowerCase()===e.toLowerCase())||r.unshift({nombre:e,id:`hist-${e}`,is_historial:!0})}return r}function ir(e,t,n=`nombre`){if(!t)return e;let r=t.toLowerCase(),i=r.length;return e.map(e=>{let t=(e[n]||e.name||e.nombre||``).toLowerCase(),a=0;if(t.startsWith(r))a+=10;else if(t.includes(r))a+=5;else{let e=ar(t,r);if(e<=2&&i>3)a+=3-e;else return null}return t.length<20&&(a+=1),{...e,_score:a}}).filter(Boolean).sort((e,t)=>(t._score||0)-(e._score||0)).slice(0,15)}function ar(e,t){let n=[];for(let e=0;e<=t.length;e++)n[e]=[e];for(let t=0;t<=e.length;t++)n[0][t]=t;for(let r=1;r<=t.length;r++)for(let i=1;i<=e.length;i++)t.charAt(r-1)===e.charAt(i-1)?n[r][i]=n[r-1][i-1]:n[r][i]=Math.min(n[r-1][i-1]+1,n[r][i-1]+1,n[r-1][i]+1);return n[t.length][e.length]}async function or(e,t){await W.addToHistorial(e,t)}var sr=`
  <div class="pm-dsl-placeholder-title">✨ Escribí lo que pasó en clase con tus propias palabras</div>
  <div class="pm-dsl-placeholder-example" style="font-style:italic;color:var(--pm-text-muted,#888);font-size:0.85rem;margin-bottom:6px">
    "Yereni y Santa avanzaron muy bien hoy con el cambio de posición. Santiago necesita practicar más el arco."
  </div>
  <div class="pm-dsl-placeholder-guide">
    Presioná <strong>✨ Analizar con IA</strong> y Groq va a extraer los avances automáticamente. · O usá los tokens del toolbar si preferís escribir directo: # alumno · [] contenido · {} tarea
  </div>
`;function cr(e,{initialContent:t=``,onChange:n,onAlumnosNeeded:r}){let i=t,a=!1,o={};e.innerHTML=`
    <div class="pm-dsl-editor-container">
      <div 
        id="pm-dsl-editable" 
        class="pm-dsl-editable" 
        contenteditable="true" 
        spellcheck="false"
      ></div>
      <div class="pm-dsl-placeholder" id="pm-dsl-placeholder">${sr}</div>
    </div>
  `;let s=e.querySelector(`#pm-dsl-editable`),c=e.querySelector(`#pm-dsl-placeholder`),l=document.createElement(`div`);l.className=`dsl-tooltip`,e.appendChild(l);function u(){i=s.innerText,c.style.display=i.trim()===``?`block`:`none`,n&&n(i)}s.addEventListener(`mouseover`,t=>{let n=t.target.closest(`.dsl-objetivo`);if(n){l.textContent=`Objetivo: ${n.dataset.objetivo}`,l.style.display=`block`;let t=n.getBoundingClientRect(),r=e.getBoundingClientRect();l.style.left=`${t.left-r.left}px`,l.style.top=`${t.top-r.top-25}px`}}),s.addEventListener(`mouseout`,()=>{l.style.display=`none`});function d(){if(!a){a=!0;try{let e=window.getSelection();if(!e||e.rangeCount===0){a=!1;return}let t=S(s,e.getRangeAt(0));i=s.innerText,s.innerHTML=Zt(i),C(s,t)}catch(e){console.warn(`[DSL] Error en highlight:`,e),i=s.innerText}a=!1}}function f(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0),n=document.createRange();n.selectNodeContents(s),n.setEnd(t.endContainer,t.endOffset);let r=n.toString().match(/([#\[\(\{\$>])\s*([^\[\(\{\$]*)$/);return r?{trigger:r[1],query:r[2]||``}:null}let p=null;s.addEventListener(`mousedown`,()=>{p=null});function m(){let e=window.getSelection();!e||e.rangeCount===0||(p=S(s,e.getRangeAt(0)))}function h(){s.focus(),p!==null&&C(s,p)}let g=null;async function _(e=null){let t,n;if(e)t=e,n=``;else{let e=f();if(!e){jn.hide();return}t=e.trigger,n=e.query}try{let e=await rr(t,n,o);if(e.length>0){let r=On();r&&(m(),jn.show(e,e=>{v(e,t,n)},{trigger:t,position:r}))}else jn.hide()}catch(e){console.warn(`[DSL] Error en autocompletado:`,e)}}function v(e,t,n){let r=b(e.nombre||e.name||e.label||e.descripcion||``),i=``;switch(t){case`#`:i=r;break;case`[`:i=r+`]`;break;case`(`:i=r+`)`;break;case`{`:i=r+`}`;break;case`$`:i=e.codigo||r;break;case`>`:i=e.level_number?`NIVEL-${e.level_number}`:e.type?`NODO:${e.type}`:r;break}h();let a=window.getSelection();if(!a||a.rangeCount===0){console.warn(`[DSL] Sin selección activa al insertar autocomplete`);return}if(n.length>0){let e=a.getRangeAt(0),t=document.createRange();t.selectNodeContents(s),t.setEnd(e.endContainer,e.endOffset);let r=t.toString(),i=r.length-n.length;try{let e=document.createRange();y(s,e,i,r.length),e.deleteContents()}catch(e){console.warn(`[DSL] Error limpiando query parcial:`,e)}}x(i+` `),or(t,r)}function y(e,t,n,r){let i=0,a=[e],o=!1;for(;a.length>0;){let e=a.pop();if(e.nodeType===3){let a=i+e.length;if(!o&&n<=a&&(t.setStart(e,n-i),o=!0),o&&r<=a){t.setEnd(e,r-i);return}i=a}else for(let t=e.childNodes.length-1;t>=0;t--)a.push(e.childNodes[t])}}function b(e){if(!e)return``;let t=document.createElement(`div`);return t.innerHTML=e,t.textContent||t.innerText||``}function x(e){let t=b(e),n=window.getSelection();if(!n||n.rangeCount===0)return;let r=n.getRangeAt(0);r.deleteContents();let i=document.createTextNode(t);r.insertNode(i),r.setStartAfter(i),r.collapse(!0),n.removeAllRanges(),n.addRange(r),u(),d()}function S(e,t){let n=t.cloneRange();return n.selectNodeContents(e),n.setEnd(t.endContainer,t.endOffset),n.toString().length}function C(e,t){let n=document.createRange(),r=window.getSelection();if(!r)return;let i=0,a=[e],o,s=!1;for(;a.length>0&&!s;)if(o=a.pop(),o.nodeType===3){let e=i+o.length;t<=e&&(n.setStart(o,t-i),n.collapse(!0),s=!0),i=e}else{let e=o.childNodes.length;for(;e--;)a.push(o.childNodes[e])}r.removeAllRanges(),r.addRange(n)}let w=null;s.oninput=()=>{u(),clearTimeout(w),w=setTimeout(d,150),clearTimeout(g),g=setTimeout(()=>_(),300)},s.addEventListener(`keydown`,e=>{kn()&&Sn(e)}),s.addEventListener(`paste`,e=>{let t=e.clipboardData?.items;if(t&&Array.from(t).some(e=>e.type&&e.type.startsWith(`image/`))){e.preventDefault();let t=document.createElement(`div`);t.className=`pm-toast-image-blocked`,t.textContent=`🚫 No puedes pegar imágenes. Usa 🎤 para grabar audio o describe el contenido.`,t.style.cssText=`position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#dc3545; color:white; padding:12px 20px; border-radius:8px; z-index:10000; font-size:14px;`,document.body.appendChild(t),setTimeout(()=>t.remove(),4e3)}});function T(e,t=0,n=null){s.focus();let r=window.getSelection();if(!r||r.rangeCount===0)return;let i=r.getRangeAt(0);i.deleteContents();let a=b(e),o=document.createTextNode(a);if(i.insertNode(o),t>0&&t<e.length){let e=document.createRange();e.setStart(o,t),e.collapse(!0),r.removeAllRanges(),r.addRange(e)}else i.setStartAfter(o),i.collapse(!0),r.removeAllRanges(),r.addRange(i);u(),d(),n&&setTimeout(()=>_(n),50)}return t&&(s.innerText=t,u(),d()),{insertText:T,getValue:()=>i,setValue:e=>{s.innerText=e,u(),d()},setContext:e=>{o=e}}}function lr(e,{indicator:t,sessionId:n,studentId:r,teacherId:i,onSave:a}){let o=t.status||`pending`;I.getStatusToken(o);let s=document.createElement(`div`);s.className=`pm-node-eval-card pm-animate-fade-in status-${o}`,s.dataset.indicatorId=t.indicator_id,s.innerHTML=`
    <div class="pm-eval-card-header">
      <div class="pm-eval-node-info">
        <span class="pm-eval-node-name">${L(t.node_name)}</span>
        <p class="pm-eval-indicator-desc">${L(t.indicator_description||`Evaluación de nodo`)}</p>
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
      <textarea placeholder="Feedback pedagógico (opcional)..." class="pm-eval-feedback-input">${L(t.feedback||``)}</textarea>
    </div>

    <div class="pm-eval-card-footer">
      <span class="pm-eval-save-status"></span>
    </div>
  `;let c=s.querySelectorAll(`.pm-eval-btn`),l=s.querySelector(`.pm-eval-feedback-input`),u=s.querySelector(`.pm-eval-save-status`),d=null,f=async(e=null)=>{let c=e||s.dataset.status||o;u.innerHTML=`<i class="pm-spinner-sm"></i> Guardando...`;try{let e={student_id:r,indicator_id:t.indicator_id,session_id:n,created_by:i,status:c,feedback:l.value,attempt_number:(t.attempt_number||0)+1};await I.saveIndicatorAttempt(e),u.innerHTML=`<i class="bi bi-check-all"></i> Guardado localmente`,s.className=`pm-node-eval-card status-${c}`,a&&a(e)}catch(e){console.error(`Error saving evaluation:`,e),u.innerHTML=`<i class="bi bi-exclamation-circle"></i> Error al guardar`}};c.forEach(e=>{e.onclick=()=>{let t=e.dataset.status;c.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),s.dataset.status=t,f(t)}}),l.oninput=()=>{d&&clearTimeout(d),d=setTimeout(()=>f(),1500)},e.appendChild(s)}function ur(e,{student:t,sessionId:n,teacherId:r,snapshots:i=[]}){let a=document.getElementById(`pm-evaluation-drawer`);a&&a.remove();let o=document.createElement(`div`);o.id=`pm-evaluation-drawer`,o.className=`pm-drawer-overlay`,o.innerHTML=`
    <div class="pm-drawer">
      <div class="pm-drawer-header">
        <div class="pm-drawer-title-group">
          <h4 class="pm-drawer-title">Evaluar Avance</h4>
          <p class="pm-drawer-subtitle" style="font-size: 0.85rem; color: var(--pm-text-muted); margin: 0;">${L(t.nombre_completo)}</p>
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
  `,e.appendChild(o);let s=o.querySelector(`#pm-evaluation-cards-container`);s&&i.forEach(e=>{lr(s,{indicator:e,sessionId:n,studentId:t.id,teacherId:r,onSave:e=>{console.log(`Progress saved:`,e)}})}),setTimeout(()=>o.classList.add(`open`),10);let c=()=>{o.classList.remove(`open`),setTimeout(()=>o.remove(),400)},l=o.querySelector(`#pm-close-eval-drawer`),u=o.querySelector(`#pm-finish-eval`);return l&&l.addEventListener(`click`,c),o.addEventListener(`click`,e=>{e.target===o&&c()}),u&&u.addEventListener(`click`,c),{close:c}}function dr(e,{onAceptar:t}){let n=document.getElementById(`pm-generar-informe-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-generar-informe-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
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
    `),t.document.close()}n.querySelector(`#btn-informe-copy`).onclick=s,n.querySelector(`#btn-informe-whatsapp`).onclick=c,n.querySelector(`#btn-informe-email`).onclick=l,n.querySelector(`#btn-informe-pdf`).onclick=u;function d({original:e,improved:t}){r.textContent=e,a.textContent=t,i&&(i.style.display=e?``:`none`),n.classList.add(`open`)}function f(){n.classList.remove(`open`)}return n.querySelector(`#pm-informe-close`).onclick=f,n.querySelector(`#pm-informe-descartar`).onclick=f,n.querySelector(`#pm-informe-aceptar`).onclick=()=>{t&&t(o()),f()},{open:d,close:f}}var fr=`pm_tour_completed`,pr=1500,mr=[{target:`.pm-asist-header`,title:`📍 Cabecera de Clase`,body:`Aquí puede ver los datos de la clase, el salón y la fecha. Es su panel de control principal.`},{target:`.pm-asist-bulk-circles`,title:`👥 Asistencia Rápida`,body:`¿Asistieron todos? Presione "P" para marcar a todos los alumnos como presentes en un solo clic.`},{target:`#pm-alumnos-list`,title:`🙋‍♂️ Lista de Alumnos`,body:`Presione el círculo de cada alumno para cambiar entre Presente, Ausente o Retraso.`},{target:`#pm-planificacion-card`,title:`🗺️ Planificación Académica`,body:`Seleccione una Ruta o busque en la Biblioteca. Los temas que ya impartió aparecerán con un check ✅ verde.`},{target:`#pm-dsl-toolbar-container`,title:`🛠️ Caja de Herramientas`,body:`Use el micrófono 🎤 para dictar la clase, o el botón de IA ✨ para mejorar y profesionalizar su redacción automáticamente.`},{target:`#pm-dsl-editor-container`,title:`✍️ Escritura Inteligente (DSL)`,body:`Use [Corchetes] para vincular temas de la planificación y asteriscos * para puntos clave. La IA le ayudará a darle formato profesional.`},{target:`#btn-guardar`,title:`💾 Guardar Sesión`,body:`Al finalizar, no olvide guardar su sesión para que el progreso de los alumnos se registre en el sistema.`}],hr=`
  .pm-tour-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8); z-index: 10000;
    pointer-events: auto; display: none; opacity: 0;
    transition: opacity 0.3s;
  }
  .pm-tour-spotlight {
    position: fixed; border-radius: 12px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
    z-index: 10001; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none; border: 2px solid var(--pm-primary);
  }
  .pm-tour-tooltip {
    position: fixed; width: 280px; background: var(--pm-surface);
    border: 1px solid var(--pm-border); border-radius: 16px;
    padding: 1.5rem; z-index: 10002; color: #fff;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    transition: top 0.4s, left 0.4s; pointer-events: auto;
  }
  .pm-tour-tooltip h4 {
    margin: 0 0 0.5rem; color: var(--pm-primary);
    font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .pm-tour-tooltip p { margin: 0; font-size: 0.9rem; line-height: 1.4; color: var(--pm-text-muted); }
  .pm-tour-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
  .pm-tour-progress { font-size: 0.75rem; color: var(--pm-text-muted); }
  .pm-tour-btn-skip { background: none; border: none; color: var(--pm-text-muted); font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 0; }
  .pm-tour-btn-next {
    background: var(--pm-primary); color: #fff; border: none;
    padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; cursor: pointer;
    font-size: 0.85rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  .pm-help-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(var(--pm-primary-rgb), 0.15); color: var(--pm-primary);
    border: 1px solid rgba(var(--pm-primary-rgb), 0.3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; font-size: 1rem;
  }
  .pm-help-btn:hover { background: var(--pm-primary); color: #fff; transform: scale(1.1); }
  [data-theme="light"] .pm-tour-tooltip { background: #fff; color: #111; }
  @media (max-width: 480px) {
    .pm-tour-tooltip { width: calc(100% - 40px); left: 20px !important; font-size: 0.85rem; }
  }
`,gr=class{constructor(e,t=mr){this._container=e,this._steps=t,this._step=0,this._autoTimer=null,this._overlay=null,this._spotlight=null,this._tooltip=null,this._mounted=!1,this._styleEl=null}mount(){this._mounted||(this._injectStyles(),this._injectDOM(),this._bindEvents(),this._mounted=!0,localStorage.getItem(fr)||(this._autoTimer=setTimeout(()=>this.start(),pr)))}start(){this._overlay&&(this._step=0,this._tooltip.style.display=`block`,this._spotlight.style.display=`block`,this._overlay.style.display=`block`,this._overlay.offsetHeight,this._overlay.style.opacity=`1`,this._showStep(0),localStorage.setItem(fr,`true`))}destroy(){this._autoTimer!==null&&(clearTimeout(this._autoTimer),this._autoTimer=null),this._overlay&&=(this._overlay.style.transition=`none`,this._overlay.style.opacity=`0`,this._overlay.style.display=`none`,this._overlay.remove(),null),this._spotlight&&=(this._spotlight.remove(),null),this._tooltip&&=(this._tooltip.remove(),null),this._styleEl&&=(this._styleEl.remove(),null),this._mounted=!1}_injectStyles(){if(document.getElementById(`pm-tour-styles`))return;let e=document.createElement(`style`);e.id=`pm-tour-styles`,e.textContent=hr,document.head.appendChild(e),this._styleEl=e}_injectDOM(){document.getElementById(`pm-tour-overlay`)?.remove(),document.getElementById(`pm-tour-spotlight`)?.remove(),document.getElementById(`pm-tour-tooltip`)?.remove();let e=document.createElement(`div`);e.id=`pm-tour-overlay`,e.className=`pm-tour-overlay`,e.setAttribute(`role`,`dialog`),e.setAttribute(`aria-modal`,`true`),e.setAttribute(`aria-label`,`Guía interactiva`),document.body.appendChild(e),this._overlay=e;let t=document.createElement(`div`);t.id=`pm-tour-spotlight`,t.className=`pm-tour-spotlight`,t.style.display=`none`,document.body.appendChild(t),this._spotlight=t;let n=document.createElement(`div`);n.id=`pm-tour-tooltip`,n.className=`pm-tour-tooltip`,n.style.display=`none`,n.innerHTML=`
      <h4 id="pm-tour-title"></h4>
      <p  id="pm-tour-body"></p>
      <div class="pm-tour-footer">
        <span class="pm-tour-progress" id="pm-tour-progress"></span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button id="pm-tour-skip" class="pm-tour-btn-skip">Saltar guía</button>
          <button id="pm-tour-next" class="pm-tour-btn-next">Siguiente</button>
        </div>
      </div>
    `,document.body.appendChild(n),this._tooltip=n}_bindEvents(){this._tooltip.querySelector(`#pm-tour-next`).addEventListener(`click`,()=>this._nextStep()),this._tooltip.querySelector(`#pm-tour-skip`).addEventListener(`click`,()=>this._close()),this._onKeydown=e=>{e.key===`Escape`&&this._close()},document.addEventListener(`keydown`,this._onKeydown),this._onResize=()=>{this._overlay?.style.display!==`none`&&this._showStep(this._step)},window.addEventListener(`resize`,this._onResize,{passive:!0})}_showStep(e){let t=this._steps[e],n=this._container.querySelector(t.target);if(!n){this._nextStep();return}n.scrollIntoView({behavior:`smooth`,block:`center`}),setTimeout(()=>this._positionOnElement(n,t,e),400)}_positionOnElement(e,t,n){let r=e.getBoundingClientRect();this._spotlight.style.width=`${r.width+20}px`,this._spotlight.style.height=`${r.height+20}px`,this._spotlight.style.top=`${r.top-10}px`,this._spotlight.style.left=`${r.left-10}px`;let i=r.bottom+16;i+200>window.innerHeight&&(i=r.top-200-16);let a=Math.max(16,Math.min(window.innerWidth-280-16,r.left));this._tooltip.style.top=`${i}px`,this._tooltip.style.left=`${a}px`,this._tooltip.querySelector(`#pm-tour-title`).innerHTML=`<span>${t.title}</span>`,this._tooltip.querySelector(`#pm-tour-body`).textContent=t.body,this._tooltip.querySelector(`#pm-tour-progress`).textContent=`${n+1} / ${this._steps.length}`,this._tooltip.querySelector(`#pm-tour-next`).textContent=n===this._steps.length-1?`Finalizar ✓`:`Siguiente →`}_nextStep(){this._step++,this._step<this._steps.length?this._showStep(this._step):this._close()}_close(){this._overlay&&(localStorage.setItem(fr,`true`),this._onKeydown&&document.removeEventListener(`keydown`,this._onKeydown),this._onResize&&window.removeEventListener(`resize`,this._onResize),this._tooltip&&(this._tooltip.style.display=`none`),this._spotlight&&(this._spotlight.style.display=`none`),this._overlay.style.opacity=`0`,setTimeout(()=>{this._overlay&&(this._overlay.style.display=`none`)},300))}},_r=[{id:`tecnica`,nombre:`Técnica`,objetivos:`Desarrollar la técnica instrumental del alumno.
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
4. Discusión y reseña`,recursos:`Audio, videos, partituras de referencia`,evaluacion_metodo:`Participación en discusión, trabajo escrito`},{id:`blanco`,nombre:`En blanco`,objetivos:``,contenido:``,recursos:``,evaluacion_metodo:``}];function vr(e,t=null,n=[],r=[],i={},a){let o=e===`edit`&&!!t,s=o?t:{...i};!o&&i.contenido&&!s.notas_dsl&&(s.notas_dsl=i.contenido),!o&&i.maestro_nombre&&!r.find(e=>e.nombre===i.maestro_nombre)&&(r=[{id:i.maestro_id,nombre:i.maestro_nombre},...r]);let c=new T(s),l=document.getElementById(`pm-planificacion-modal`);if(l&&l.remove(),l=document.createElement(`div`),l.id=`pm-planificacion-modal`,l.className=`pm-plan-modal-overlay`,l.innerHTML=br(o,c,n,r),document.body.appendChild(l),!document.getElementById(`pm-plan-modal-styles`)){let e=document.createElement(`style`);e.id=`pm-plan-modal-styles`,e.textContent=xr(),document.head.appendChild(e)}let u=()=>{l.classList.remove(`open`),setTimeout(()=>l.remove(),200)};l.querySelector(`.pm-plan-close-x`).onclick=u,l.querySelector(`.pm-plan-cancel-btn`).onclick=u,l.querySelector(`.pm-plan-backdrop`).onclick=u;let d=e=>{e.key===`Escape`&&(u(),document.removeEventListener(`keydown`,d))};document.addEventListener(`keydown`,d);let f=l.querySelector(`#pl-plantilla`);f&&f.addEventListener(`change`,e=>{let t=_r.find(t=>t.id===e.target.value);t&&t.id!==`blanco`&&(l.querySelector(`#pl-objetivos`).value=t.objetivos,l.querySelector(`#pl-contenido`).value=t.contenido,l.querySelector(`#pl-recursos`).value=t.recursos,l.querySelector(`#pl-evaluacion`).value=t.evaluacion_metodo,Cr(l))});let m=l.querySelector(`#pl-clase_id`);m&&m.addEventListener(`change`,()=>{let e=l.querySelector(`#pl-instrumento`);if(e){let t=e.value;e.innerHTML=`<option value="">Todos los instrumentos</option>${wr(n,m.value,null)}`,e.querySelector(`option[value="${t}"]`)&&(e.value=t)}}),Sr(l);let h=l.querySelector(`#dsl-editor-container`);if(h){let e=S({onSelect:async e=>{let n=(await w()).filter(t=>e.includes(t.id)).map(e=>`#${e.nombre_completo}`).join(`, `);t.component&&t.component.insertText(n+` `)}});document.body.appendChild(e);let t=p({initialContent:c.notas_dsl||``,onChange:(e,t)=>{let n=l.querySelector(`#dsl-summary`);n&&(n.textContent=Er(t))},onAlumnoClick:()=>e.openModal()});h.appendChild(t),l._dslEditor=t}let g=l.querySelector(`.pm-plan-save-btn`);g.onclick=async()=>{let e=l.querySelector(`#pl-tema`)?.value.trim(),t=l.querySelector(`#pl-clase_id`)?.value;if(!e){l.querySelector(`#pl-tema`).focus();return}if(!t){l.querySelector(`#pl-clase_id`).focus();return}g.disabled=!0,g.innerHTML=`<span class="pm-plan-spinner"></span> Guardando...`;try{let n=l.querySelector(`#pl-recursos`)?.value||``,r=l._dslEditor,i={clase_id:t,maestro_id:l.querySelector(`#pl-maestro_id`)?.value||null,instrumento:l.querySelector(`#pl-instrumento`)?.value||null,tema:e,fecha_inicio:l.querySelector(`#pl-fecha_inicio`)?.value||null,objetivos:l.querySelector(`#pl-objetivos`)?.value.trim(),contenido:l.querySelector(`#pl-contenido`)?.value.trim(),recursos:n.split(`,`).map(e=>e.trim()).filter(Boolean),evaluacion_metodo:l.querySelector(`#pl-evaluacion`)?.value.trim(),observaciones:l.querySelector(`#pl-observaciones`)?.value.trim(),notas_dsl:r?r.getContent():``,estado:o&&l.querySelector(`#pl-estado`)?.value||`planificado`};a&&await a(i),u()}catch(e){console.error(`[planificacionModal] Error:`,e),g.disabled=!1,g.textContent=o?`Guardar cambios`:`Guardar`}};let _=l.querySelector(`.pm-plan-body`);if(_){let e=document.createElement(`div`);e.style.cssText=`display:flex;gap:1rem;align-items:flex-start`;let t=document.createDocumentFragment();for(;_.firstChild;)t.appendChild(_.firstChild);let r=document.createElement(`div`);r.style.cssText=`flex:1;min-width:0`,r.appendChild(t),e.appendChild(r),e.insertAdjacentHTML(`beforeend`,`
      <div style="position:sticky;top:0;width:220px;flex-shrink:0" id="pl-curriculo-wrapper">
        <div class="card border-0 bg-body-secondary">
          <div class="card-header bg-transparent py-2 border-bottom">
            <span class="small fw-semibold"><i class="bi bi-journal-bookmark me-1 text-primary"></i>Guía curricular</span>
          </div>
          <div class="card-body p-2 small" id="pl-curriculo-body" style="max-height:350px;overflow-y:auto">
            <div class="text-muted text-center small py-3">Seleccioná una clase para ver la guía</div>
          </div>
        </div>
      </div>`),_.appendChild(e);let i=l.querySelector(`#pl-clase_id`);if(i&&(i.addEventListener(`change`,()=>{let e=i.value;if(!e)return;let t=n.find(t=>t.id===e);t?.instrumento&&t?.plan_estudio&&yr(t.instrumento,t.plan_estudio,l)}),c.clase_id)){let e=n.find(e=>e.id===c.clase_id);e?.instrumento&&e?.plan_estudio&&yr(e.instrumento,e.plan_estudio,l)}}requestAnimationFrame(()=>{l.classList.add(`open`),l.querySelector(`#pl-tema`)?.focus()})}async function yr(e,t,n){let r=n.querySelector(`#pl-curriculo-body`);if(r){r.innerHTML=`<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-muted"></div></div>`;try{let n=await m(e,t);if(!n){r.innerHTML=`<p class="text-muted small text-center py-2">Sin guía curricular<br>para ${e} — ${t}</p>`;return}r.innerHTML=n.curriculo_pilares.map(e=>`
      <div class="mb-2">
        <div class="fw-semibold text-uppercase text-muted mb-1" style="font-size:.7rem;letter-spacing:.05em">${e.nombre}</div>
        ${e.curriculo_objetivos.map(e=>`
          <div class="d-flex align-items-start gap-1 mb-1">
            <i class="bi bi-circle text-muted" style="font-size:.65rem;margin-top:3px;flex-shrink:0"></i>
            <span style="font-size:.78rem">${e.descripcion}</span>
          </div>`).join(``)}
      </div>`).join(``)}catch(e){r.innerHTML=`<p class="text-danger small">${e.message}</p>`}}}function br(e,t,n,r){let i=n.length?n.map(e=>`<option value="${e.id}" ${t.clase_id===e.id?`selected`:``}>${Tr(e.nombre||e.id)}</option>`).join(``):`<option value="">Sin clases disponibles</option>`,a=r.length?`<option value="">Sin asignar</option>`+r.map(e=>`<option value="${e.id}" ${t.maestro_id===e.id?`selected`:``}>${Tr(e.nombre||e.id)}</option>`).join(``):`<option value="">Sin maestros disponibles</option>`,o=Array.isArray(t.recursos)?t.recursos.join(`, `):``,s=_r.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``);return`
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
                ${wr(n,t.clase_id,t.instrumento)}
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
              value="${Tr(t.tema||``)}">
            <span class="pm-plan-char-count"><span id="pl-tema-count">${(t.tema||``).length}</span>/200</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-objetivos">Objetivos</label>
            <textarea class="pm-plan-textarea" id="pl-objetivos" rows="2" maxlength="1000"
              placeholder="¿Qué quieres lograr en esta clase?">${Tr(t.objetivos||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-obj-count">${(t.objetivos||``).length}</span>/1000</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-contenido">Contenido</label>
            <textarea class="pm-plan-textarea" id="pl-contenido" rows="3" maxlength="2000"
              placeholder="Desarrollo del tema, actividades...">${Tr(t.contenido||``)}</textarea>
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
              value="${Tr(o)}">
            <span class="pm-plan-hint">Separa múltiples recursos con coma</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-evaluacion">Método de Evaluación</label>
            <textarea class="pm-plan-textarea" id="pl-evaluacion" rows="2" maxlength="500"
              placeholder="¿Cómo evaluarás el aprendizaje?">${Tr(t.evaluacion_metodo||``)}</textarea>
            <span class="pm-plan-char-count"><span id="pl-eval-count">${(t.evaluacion_metodo||``).length}</span>/500</span>
          </div>
          <div class="pm-plan-field">
            <label class="pm-plan-label" for="pl-observaciones">Observaciones</label>
            <textarea class="pm-plan-textarea" id="pl-observaciones" rows="2" maxlength="1000"
              placeholder="Notas adicionales...">${Tr(t.observaciones||``)}</textarea>
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
  `}function xr(){return`
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
  `}function Sr(e){[{input:`pl-tema`,count:`pl-tema-count`},{input:`pl-objetivos`,count:`pl-obj-count`},{input:`pl-contenido`,count:`pl-cont-count`},{input:`pl-evaluacion`,count:`pl-eval-count`},{input:`pl-observaciones`,count:`pl-obs-count`}].forEach(({input:t,count:n})=>{let r=e.querySelector(`#`+t),i=e.querySelector(`#`+n);r&&i&&r.addEventListener(`input`,()=>{i.textContent=r.value.length})})}function Cr(e){[{input:`pl-objetivos`,count:`pl-obj-count`},{input:`pl-contenido`,count:`pl-cont-count`},{input:`pl-evaluacion`,count:`pl-eval-count`},{input:`pl-observaciones`,count:`pl-obs-count`}].forEach(({input:t,count:n})=>{let r=e.querySelector(`#`+t),i=e.querySelector(`#`+n);r&&i&&(i.textContent=r.value.length)})}function wr(e,t,n){let r=e.find(e=>e.id===t);return r?.instrumento?r.instrumento.split(`,`).map(e=>e.trim()).filter(Boolean).map(e=>`<option value="${Tr(e)}" ${n===e?`selected`:``}>${Tr(e)}</option>`).join(``):``}function Tr(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function Er(e){let t=[];return e.alumnos.length&&t.push(`${e.alumnos.length} alum.`),e.contenido.length&&t.push(`${e.contenido.length} cont.`),e.tareas.length&&t.push(`${e.tareas.length} tar.`),e.calificacion&&t.push(`${e.calificacion.valor}/${e.calificacion.sobre}`),t.length?t.join(`, `):`Sin tokens`}var G={async getClasses(){let{data:e,error:t}=await j.from(`plan_clases`).select(`*`).eq(`activo`,!0).order(`nombre`);return t?(console.error(`Error loading classes:`,t),[]):e},async resolveSmartPlan(e){let t=await this.getClasses();if(!t.length)return null;let n=(e.nombre||``).toLowerCase(),r=(e.instrumento||``).toLowerCase(),i=t.find(e=>(e.nombre||``).toLowerCase()===n);return i||r&&(i=t.find(e=>(e.nombre||``).toLowerCase().includes(r)),i)?i:(i=t.find(e=>{let t=(e.nombre||``).toLowerCase();return n.includes(t)||t.includes(n)}),i||t[0])},async addClass(e){let{data:t,error:n}=await j.from(`plan_clases`).insert([{nombre:e}]).select().single();if(n)throw n;return t},async updateClass(e,t){let{error:n}=await j.from(`plan_clases`).update({nombre:t}).eq(`id`,e);if(n)throw n},async deleteClass(e){let{error:t}=await j.from(`plan_clases`).delete().eq(`id`,e);if(t)throw t},async getLevelsByClass(e){let{data:t,error:n}=await j.from(`plan_niveles`).select(`*`).eq(`clase_id`,e).order(`numero_nivel`,{ascending:!0});return n?(console.error(`Error loading levels:`,n),[]):t},async addLevel({clase_id:e,nombre:t,numero_nivel:n}){let{data:r,error:i}=await j.from(`plan_niveles`).insert([{clase_id:e,nombre:t,numero_nivel:n||1}]).select().single();if(i)throw i;return r},async updateLevel(e,t){let{error:n}=await j.from(`plan_niveles`).update(t).eq(`id`,e);if(n)throw n},async deleteLevel(e){let{error:t}=await j.from(`plan_niveles`).delete().eq(`id`,e);if(t)throw t},async getNodesByLevel(e){let{data:t,error:n}=await j.from(`plan_temas`).select(`*`).eq(`nivel_id`,e).order(`orden_index`);return n?(console.error(`Error loading topics:`,n),[]):t},async addNode({nivel_id:e,nombre:t,tipo:n}){let{data:r,error:i}=await j.from(`plan_temas`).insert([{nivel_id:e,nombre:t,tipo:n||`TECNICA`}]).select().single();if(i)throw i;return r},async updateNode(e,t){let{error:n}=await j.from(`plan_temas`).update(t).eq(`id`,e);if(n)throw n},async deleteNode(e){let{error:t}=await j.from(`plan_temas`).delete().eq(`id`,e);if(t)throw t},async getObjectivesByNode(e){let{data:t,error:n}=await j.from(`plan_objetivos`).select(`*`).eq(`tema_id`,e).order(`orden_index`);return n?(console.error(`Error loading objectives:`,n),[]):t},async addObjective({tema_id:e,nombre:t}){let{data:n,error:r}=await j.from(`plan_objetivos`).insert([{tema_id:e,nombre:t}]).select().single();if(r)throw r;return n},async updateObjective(e,t){let{error:n}=await j.from(`plan_objetivos`).update({nombre:t}).eq(`id`,e);if(n)throw n},async deleteObjective(e){let{error:t}=await j.from(`plan_objetivos`).delete().eq(`id`,e);if(t)throw t},async getIndicatorsByObjective(e){let{data:t,error:n}=await j.from(`plan_indicadores`).select(`*`).eq(`objetivo_id`,e).order(`orden_index`);return n?(console.error(`Error loading indicators:`,n),[]):t},async addIndicator({objetivo_id:e,descripcion:t,es_requerido:n}){let{data:r,error:i}=await j.from(`plan_indicadores`).insert([{objetivo_id:e,descripcion:t,es_requerido:n??!0}]).select().single();if(i)throw i;return r},async updateIndicator(e,t){let{error:n}=await j.from(`plan_indicadores`).update(t).eq(`id`,e);if(n)throw n},async deleteIndicator(e){let{error:t}=await j.from(`plan_indicadores`).delete().eq(`id`,e);if(t)throw t},async getRouteHierarchy(e){let t=e;if(!t){let e=await this.getClasses();if(e.length>0)t=e[0].id;else return null}let{data:n,error:r}=await j.from(`plan_niveles`).select(`
        *,
        plan_temas (
          *,
          plan_objetivos (
            *,
            plan_indicadores (*)
          )
        )
      `).eq(`clase_id`,t).order(`numero_nivel`);return r?(console.error(`Error loading hierarchy:`,r),null):n},async importStructure(e,t){if(!e||!t)throw Error(`Faltan datos para la importación.`);console.log(`[Adapter] Iniciando importación masiva optimizada (4 niveles) para clase: ${e}`);for(let n of t.niveles||[]){let{data:t,error:r}=await j.from(`plan_niveles`).insert([{clase_id:e,nombre:n.nombre,numero_nivel:n.numero_nivel||1,objetivo_general:n.objetivo_general}]).select().single();if(r)throw r;let i=(n.temas||[]).map(e=>({nivel_id:t.id,nombre:e.nombre,tipo:e.tipo||`TECNICA`,es_critico:e.es_critico||!1,_originalRef:e}));if(!i.length)continue;let{data:a,error:o}=await j.from(`plan_temas`).insert(i.map(({_originalRef:e,...t})=>t)).select();if(o)throw o;for(let e=0;e<a.length;e++){let t=a[e],n=i[e]._originalRef.objetivos||[];if(!n.length)continue;let r=n.map(e=>({tema_id:t.id,nombre:e.nombre||e,_originalRef:e})),{data:o,error:s}=await j.from(`plan_objetivos`).insert(r.map(({_originalRef:e,...t})=>t)).select();if(s)throw s;let c=[];if(o.forEach((e,t)=>{let n=r[t]._originalRef;n.indicadores&&n.indicadores.length>0&&n.indicadores.forEach(t=>{c.push({objetivo_id:e.id,descripcion:t.descripcion,es_requerido:t.es_requerido??!0})})}),c.length>0){let{error:e}=await j.from(`plan_indicadores`).insert(c);if(e)throw e}}}return console.log(`[Adapter] Importación masiva (4 niveles) completada con éxito.`),!0}},K={activeClassId:null,activeLevelId:null,activeNodeId:null,activeObjectiveId:null};async function Dr(e,t=null){t&&(K.activeClassId=t),e.innerHTML=`
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
  `,await Ar()}async function Or(e,t,n,r){je.open({title:`Editar ${e}`,body:`
      <div class="pm-form-group" style="margin-bottom:0;">
        <label class="pm-label" style="color:var(--pm-text-muted); font-size:0.7rem; margin-bottom:8px; display:block; text-transform:uppercase; font-weight:700;">Contenido del ${e}</label>
        <textarea id="edit-item-content" class="pm-input" style="width:100%; min-height:120px; padding:1rem; border-radius:12px; background:var(--pm-surface-3); color:var(--pm-text); border:1px solid var(--pm-border); font-family:inherit; font-size:0.85rem; line-height:1.5; resize:none; outline:none; transition:border-color 0.2s;">${L(n)}</textarea>
        <p class="pm-help-text" style="font-size:0.65rem; margin-top:8px; color:var(--pm-text-muted); line-height:1.4;">
          <i class="bi bi-info-circle me-1"></i> Esta modificación afectará a todas las instancias donde se utilice este ${e.toLowerCase()}.
        </p>
      </div>
    `,onSave:async n=>{let i=n.querySelector(`#edit-item-content`).value.trim();if(!i)return!1;try{switch(e){case`Clase`:await G.updateClass(t,i);break;case`Nivel`:await G.updateLevel(t,{nombre:i});break;case`Tema`:await G.updateNode(t,{nombre:i});break;case`Objetivo`:await G.updateObjective(t,i);break;case`Indicador`:await G.updateIndicator(t,{descripcion:i});break}return r(),!0}catch(e){return console.error(`Error saving change:`,e),alert(`Error al guardar: `+(e.message||`Error desconocido`)),!1}},onDelete:async()=>{try{switch(e){case`Clase`:await G.deleteClass(t);break;case`Nivel`:await G.deleteLevel(t);break;case`Tema`:await G.deleteNode(t);break;case`Objetivo`:await G.deleteObjective(t);break;case`Indicador`:await G.deleteIndicator(t);break}return r(),!0}catch(e){return console.error(`Error deleting item:`,e),alert(`No se pudo eliminar: `+(e.message||`Error de base de datos`)),!1}}})}async function kr(e,t,n){if(!t&&e!==`Clase`){alert(`Primero seleccioná el elemento superior para agregar un ${e}`);return}je.open({title:`Agregar Nuevo ${e}`,body:`
      <div class="pm-form-group" style="margin-bottom:0;">
        <label class="pm-label" style="color:var(--pm-text-muted); font-size:0.7rem; margin-bottom:8px; display:block; text-transform:uppercase; font-weight:700;">Contenido del Nuevo ${e}</label>
        <textarea id="new-item-content" class="pm-input" placeholder="Escribí aquí..." style="width:100%; min-height:120px; padding:1rem; border-radius:12px; background:var(--pm-surface-3); color:var(--pm-text); border:1px solid var(--pm-border); font-family:inherit; font-size:0.85rem; line-height:1.5; resize:none; outline:none;"></textarea>
      </div>
    `,onSave:async r=>{let i=r.querySelector(`#new-item-content`).value.trim();if(!i)return!1;try{switch(e){case`Clase`:await G.addClass(i);break;case`Nivel`:await G.addLevel({clase_id:t,nombre:i,numero_nivel:1});break;case`Tema`:await G.addNode({nivel_id:t,nombre:i,tipo:`TECNICA`});break;case`Objetivo`:await G.addObjective({tema_id:t,nombre:i});break;case`Indicador`:await G.addIndicator({objetivo_id:t,descripcion:i,es_requerido:!0});break}return n(),!0}catch(e){return console.error(`Error adding item:`,e),alert(`No se pudo crear: `+(e.message||`Error de base de datos`)),!1}}})}async function Ar(){let e=document.getElementById(`pm-rc-classes-wrapper`),t=await G.getClasses();!t.some(e=>e.id===K.activeClassId)&&t.length>0?K.activeClassId=t[0].id:t.length===0&&(K.activeClassId=null),e.innerHTML=`
    <div class="pm-rc-header">
      <h4>1. Clase</h4> 
      <button class="pm-rc-btn-add" id="btn-add-class" title="Agregar Clase"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${t.map(e=>`
        <div class="pm-rc-item ${K.activeClassId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${L(e.nombre)}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,e.querySelector(`#btn-add-class`).onclick=()=>kr(`Clase`,null,()=>Ar()),K.activeClassId?jr(K.activeClassId):Fr(`#pm-rc-levels-wrapper`,`Elegí Clase`),e.querySelectorAll(`.pm-rc-item`).forEach(e=>{let t=e.dataset.id;e.querySelector(`.btn-edit`).onclick=n=>{n.stopPropagation(),Or(`Clase`,t,e.querySelector(`.pm-rc-item-text`).innerText,()=>Ar())},e.onclick=()=>{K.activeClassId=t,K.activeLevelId=K.activeNodeId=K.activeObjectiveId=null,Ar(),jr(t),Fr(`#pm-rc-nodes-wrapper`,`Elegí Nivel`),Fr(`#pm-rc-objs-wrapper`,`Elegí Tema`),Fr(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function jr(e){let t=document.getElementById(`pm-rc-levels-wrapper`),n=await G.getLevelsByClass(e);!n.some(e=>e.id===K.activeLevelId)&&n.length>0?K.activeLevelId=n[0].id:n.length===0&&(K.activeLevelId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>2. Nivel</h4> 
      <button class="pm-rc-btn-add" id="btn-add-level" title="Agregar Nivel"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${K.activeLevelId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${L(e.nombre)}</span>
          <span class="pm-rc-item-sub">Nivel ${e.numero_nivel}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-level`).onclick=()=>kr(`Nivel`,e,()=>jr(e)),K.activeLevelId?Mr(K.activeLevelId):Fr(`#pm-rc-nodes-wrapper`,`Elegí Nivel`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),Or(`Nivel`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>jr(e))},t.onclick=()=>{K.activeLevelId=n,K.activeNodeId=K.activeObjectiveId=null,jr(e),Mr(n),Fr(`#pm-rc-objs-wrapper`,`Elegí Tema`),Fr(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function Mr(e){let t=document.getElementById(`pm-rc-nodes-wrapper`),n=await G.getNodesByLevel(e);!n.some(e=>e.id===K.activeNodeId)&&n.length>0?K.activeNodeId=n[0].id:n.length===0&&(K.activeNodeId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>3. Tema</h4> 
      <button class="pm-rc-btn-add" id="btn-add-node" title="Agregar Tema"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${K.activeNodeId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${L(e.nombre)}</span>
          <span class="pm-rc-item-badge" style="font-size:0.5rem;background:var(--pm-surface-3);padding:1px 4px;border-radius:3px;margin-top:2px;align-self:flex-start;">${e.tipo}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-node`).onclick=()=>kr(`Tema`,e,()=>Mr(e)),K.activeNodeId?Nr(K.activeNodeId):Fr(`#pm-rc-objs-wrapper`,`Elegí Tema`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),Or(`Tema`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>Mr(e))},t.onclick=()=>{K.activeNodeId=n,K.activeObjectiveId=null,Mr(e),Nr(n),Fr(`#pm-rc-inds-wrapper`,`Elegí Objetivo`)}})}async function Nr(e){let t=document.getElementById(`pm-rc-objs-wrapper`),n=await G.getObjectivesByNode(e);!n.some(e=>e.id===K.activeObjectiveId)&&n.length>0?K.activeObjectiveId=n[0].id:n.length===0&&(K.activeObjectiveId=null),t.innerHTML=`
    <div class="pm-rc-header">
      <h4>4. Objetivo</h4> 
      <button class="pm-rc-btn-add" id="btn-add-obj" title="Agregar Objetivo"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${n.map(e=>`
        <div class="pm-rc-item ${K.activeObjectiveId===e.id?`active`:``}" data-id="${e.id}">
          <span class="pm-rc-item-text">${L(e.nombre)}</span>
          <div class="pm-rc-actions">
            <button class="pm-rc-btn-action btn-edit" title="Editar"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-obj`).onclick=()=>kr(`Objetivo`,e,()=>Nr(e)),K.activeObjectiveId?Pr(K.activeObjectiveId):Fr(`#pm-rc-inds-wrapper`,`Elegí Objetivo`),t.querySelectorAll(`.pm-rc-item`).forEach(t=>{let n=t.dataset.id;t.querySelector(`.btn-edit`).onclick=r=>{r.stopPropagation(),Or(`Objetivo`,n,t.querySelector(`.pm-rc-item-text`).innerText,()=>Nr(e))},t.onclick=()=>{K.activeObjectiveId=n,Nr(e),Pr(n)}})}async function Pr(e){let t=document.getElementById(`pm-rc-inds-wrapper`);t.innerHTML=`
    <div class="pm-rc-header">
      <h4>5. Indicador</h4> 
      <button class="pm-rc-btn-add" id="btn-add-ind" title="Agregar Indicador"><i class="bi bi-plus"></i></button>
    </div>
    <div class="pm-rc-list">
      ${(await G.getIndicatorsByObjective(e)).map(e=>`
        <div class="pm-rc-ind-card" style="position:relative;">
          <i class="bi ${e.es_requerido?`bi-check-circle-fill`:`bi-circle`}"></i>
          <span class="ind-text">${L(e.descripcion)}</span>
          <div class="pm-rc-actions" style="display:flex;opacity:0.6;">
             <button class="pm-rc-btn-action btn-edit-ind" data-id="${e.id}"><i class="bi bi-pencil"></i></button>
          </div>
        </div>
      `).join(``)}
    </div>
  `,t.querySelector(`#btn-add-ind`).onclick=()=>kr(`Indicador`,e,()=>Pr(e)),t.querySelectorAll(`.btn-edit-ind`).forEach(t=>{t.onclick=()=>{let n=t.dataset.id,r=t.closest(`.pm-rc-ind-card`).querySelector(`.ind-text`).innerText;Or(`Indicador`,n,r,()=>Pr(e))}})}function Fr(e,t){let n=document.querySelector(e);n&&(n.innerHTML=`<div class="pm-rc-empty">${t}</div>`)}var Ir=null;function Lr(e,t){Ir=e}function Rr(e){Ir&&Ir(e)}function zr(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function Br(e,{claseId:t,rutaId:n,completedTopics:r=[],onIndicadorSelect:i}){let a=[],o=!1,s=null,c=document.createElement(`div`);if(c.className=`pm-route-bar-wrapper`,e.appendChild(c),!document.getElementById(`pm-route-bar-styles`)){let e=document.createElement(`style`);e.id=`pm-route-bar-styles`,e.textContent=`
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
          ${zr(e.nombre)}
        </div>
        ${(e.plan_temas||[]).map(e=>`
          <div class="pm-tree-node" data-type="node">
            <div class="pm-tree-header">
              <span class="pm-tree-title">${zr(e.nombre)}</span>
              <span class="pm-tree-badge">${e.tipo}</span>
            </div>
          </div>
          <div class="pm-tree-children">
            ${(e.plan_objetivos||[]).map(e=>{let t=(r||[]).includes(e.nombre);return`
                <div class="pm-tree-obj" data-type="obj" data-id="${e.id}" data-nombre="${zr(e.nombre)}">
                  <i class="bi ${t?`bi-check-circle-fill text-success`:s?.id===e.id?`bi-circle-fill text-primary`:`bi-circle`}"></i>
                  <span style="${t?`text-decoration: line-through; opacity: 0.6;`:``}">${zr(e.nombre)}</span>
                </div>
              `}).join(``)}
          </div>
        `).join(``)}
      </div>
    `).join(``)}async function d(){if(n){o=!0,u();try{a=await G.getRouteHierarchy(n)}catch(e){console.error(`[routeTreeBar] Error:`,e)}finally{o=!1,u()}}}function f(){c.removeEventListener(`click`,l),c.remove()}function p(){return s}return d(),{refresh:d,destroy:f,getActiveIndicador:p}}function Vr(e){return!e||typeof e!=`string`||!e.trim()||/[#\[\(\{\$>]/.test(e)?`dsl`:`natural`}function Hr(e){return!e||typeof e!=`string`?[]:e.split(`
`).map(e=>e.trim()).filter(e=>e.length>0).map(e=>{let t=Xt(e);return{alumnos:t.alumnos,nota:t.calificacion?t.calificacion.valor:null,observacion:t.sugerencias.length>0?t.sugerencias[0]:null,tarea:t.tareas.length>0?t.tareas[0]:null}}).filter(e=>e.alumnos.length>0)}function Ur(e,t){let n=e.filter(e=>e.alumnos.includes(`todos`)),r=e.filter(e=>!e.alumnos.includes(`todos`)),i=new Map;if(n.length>0){let e=n[n.length-1];for(let n of t)i.set(n.id,{alumno_id:n.id,nota:e.nota,observacion:e.observacion,tarea:e.tarea})}for(let e of r)for(let n of e.alumnos){let r=n.toLowerCase(),a=t.filter(e=>e.nombre_completo.toLowerCase().includes(r));for(let t of a)i.set(t.id,{alumno_id:t.id,nota:e.nota,observacion:e.observacion,tarea:e.tarea})}return Array.from(i.values())}function Wr(e,t){if(!e||e.length===0)return`gray`;let n=t>0&&e.length>=t,r=e.every(e=>e.nota!=null&&e.nota>=4);return n&&r?`green`:`yellow`}async function Gr(e,t,n,r){if(!r)return console.error(`[evaluationService] Error: teacherId is required for saveEvaluaciones (RLS)`),{error:{message:`teacherId is required`}};let i=n.map(n=>({session_id:e,indicator_id:t,student_id:n.alumno_id,created_by:r,nota:n.nota,observations:n.observacion,tarea:n.tarea})),{data:a,error:o}=await j.from(`indicator_attempts`).upsert(i,{onConflict:`session_id,indicator_id,student_id`,ignoreDuplicates:!1});return{data:a,error:o}}async function Kr(e,t){let{data:n,error:r}=await j.from(`indicators`).select(`id`).eq(`node_id`,e).eq(`activo`,!0);if(r)throw r;if(!n||n.length===0)return{semaphore:`gray`,indicators:[]};let i=n.map(e=>e.id),{data:a,error:o}=await j.from(`indicator_attempts`).select(`indicator_id, student_id, nota`).in(`indicator_id`,i);if(o)throw o;let{data:s,error:c}=await j.from(`alumnos_clases`).select(`alumno_id`).eq(`clase_id`,t).eq(`activo`,!0);if(c)throw c;let l=s?s.length:0;return{semaphore:Wr(a??[],l),indicators:n,totalAlumnos:l}}async function qr(e,t,n,r=null){if(!e||!e.trim())return{modo:`error`,dslGenerado:null,evaluaciones:[],missing:[],error:`Texto vacío`};let i=Vr(e);try{let t=e;i===`natural`&&(t=await Pe(e,{presentes:n.map(e=>e.nombre_completo),indicadorActivo:r}));let a=Ur(Hr(t),n),o=new Set(a.map(e=>e.alumno_id)),s=n.filter(e=>!o.has(e.id)).map(e=>e.nombre_completo);return{modo:i,dslGenerado:i===`natural`?t:null,evaluaciones:a,missing:s,error:null}}catch(e){return console.error(`[evaluationService] Error en processarEvaluacion:`,e),{modo:i,dslGenerado:null,evaluaciones:[],missing:[],error:e.message||`Error desconocido`}}}function Jr(){if(document.getElementById(`pm-student-panel-styles`))return;let e=document.createElement(`style`);e.id=`pm-student-panel-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function q(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function Yr(e){return e?e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join(``):`?`}function Xr(e){return e?new Date(e).toLocaleDateString(`es-AR`,{day:`2-digit`,month:`2-digit`,year:`2-digit`}):``}function Zr(e){return e==null?{color:`gray`,icon:`⚫`,label:`Sin evaluar`}:e>=4?{color:`green`,icon:`🟢`,label:`Dominado`}:e>=2?{color:`yellow`,icon:`🟡`,label:`En progreso`}:{color:`red`,icon:`🔴`,label:`Necesita trabajo`}}async function Qr(e,t){let{data:n,error:r}=await j.from(`indicators`).select(`id, nombre, description, order_index, node_id, nodes(id, name, order_index, level_id, levels(id, name, level_number))`).eq(`nodes.route_version_id`,t).eq(`activo`,!0).order(`order_index`);if(r)throw r;let i=(n??[]).filter(e=>e.nodes!==null),{data:a,error:o}=await j.from(`indicator_attempts`).select(`id, indicator_id, nota, observations, tarea, created_at, node_id, status, session_id`).eq(`student_id`,e).order(`created_at`,{ascending:!1});if(o)throw o;let s={};for(let e of a??[])s[e.indicator_id]||(s[e.indicator_id]=[]),s[e.indicator_id].push(e);let c=i.map(e=>{let t=s[e.id]??[],n=t[0]??null,r=Zr(n?.nota??null);return{id:e.id,nombre:e.nombre||e.description||`Indicador ${e.id}`,node:e.nodes,latestNota:n?.nota??null,latestObs:n?.observations??null,latestTarea:n?.tarea??null,semColor:r.color,semIcon:r.icon,history:t}}),l=c.filter(e=>e.latestNota>=4).length,u=c.length,d=u>0?Math.round(l/u*100):0,f=new Set;return{indicatorSummaries:c.filter(e=>{if(f.has(e.id))return!1;f.add(e.id);let t=e.history.length>0,n=e.latestNota!==null&&e.latestNota!==0;return t||n}),dominados:l,total:u,avance:d,pendingTasks:c.filter(e=>e.latestTarea).map(e=>({indicadorNombre:e.nombre,tarea:e.latestTarea}))}}function $r(e,t){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">${q(Yr(e.nombre_completo))}</div>
      <div>
        <div class="pm-student-panel__name">${q(e.nombre_completo)}</div>
        <div class="pm-student-panel__meta">Avance: ${t}%</div>
        <div class="pm-student-panel__progress-bar">
          <div class="pm-student-panel__progress-fill" style="width:${t}%"></div>
        </div>
      </div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
  `}function ei(e,t){return`
    <div class="pm-timeline-actions">
      <button class="pm-btn-add-eval" data-action="new-eval" data-idx="${t}">
        <i class="bi bi-plus-circle"></i> Nueva evaluación
      </button>
    </div>
    <ul class="pm-eval-timeline">
      ${e.map((e,n)=>`
    <li class="pm-eval-timeline__item">
      <div class="pm-eval-timeline__header">
        <span class="pm-eval-timeline__date">${q(Xr(e.created_at))}</span>
        <button class="pm-eval-timeline__edit" data-action="edit-eval" data-idx="${t}" data-hidx="${n}">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
      <span class="pm-eval-timeline__nota">Nota: ${q(String(e.nota??`-`))}</span>
      ${e.observations?`<span class="pm-eval-timeline__detail">${q(e.observations)}</span>`:``}
      ${e.tarea?`<span class="pm-eval-timeline__detail"><strong>Tarea:</strong> ${q(e.tarea)}</span>`:``}
    </li>
  `).join(``)||`<p class="pm-empty-history">Sin evaluaciones previas</p>`}
    </ul>
  `}function ti(e){return e.length?e.map((e,t)=>`
    <div class="pm-route-indicador pm-route-indicador--${q(e.semColor)}"
         data-action="toggle-history"
         data-idx="${t}"
         role="button"
         tabindex="0"
         aria-expanded="false">
      <span class="pm-route-indicador__icon">${e.semIcon}</span>
      <div class="pm-route-indicador__info">
        <span class="pm-route-indicador__name">${q(e.nombre)}</span>
        <span class="pm-route-indicador__stats">
          ${e.latestNota==null?`Sin evaluar`:`Última nota: ${e.latestNota}`}
          · ${e.history.length} eval${e.history.length===1?``:`s`}
        </span>
      </div>
    </div>
    <div class="pm-route-indicador__timeline" data-timeline="${t}" hidden>
      ${ei(e.history,t)}
    </div>
  `).join(``):`<p style="padding:8px">No hay indicadores en esta ruta.</p>`}function ni(e){return e.length?`
    <section class="pm-student-panel__section">
      <h3 class="pm-student-panel__section-title">Tareas pendientes</h3>
      <ul class="pm-pending-tasks">
        ${e.map(e=>`
          <li class="pm-pending-tasks__item">
            <strong>${q(e.indicadorNombre)}:</strong> ${q(e.tarea)}
          </li>
        `).join(``)}
      </ul>
    </section>
  `:``}function ri(e,{indicatorSummaries:t,avance:n,pendingTasks:r}){return`
    ${$r(e,n)}
    <div class="pm-student-panel__body">
      ${ni(r)}
      <section class="pm-student-panel__section">
        <h3 class="pm-student-panel__section-title">Ruta de aprendizaje</h3>
        <div class="pm-route-map">
          ${ti(t)}
        </div>
      </section>
    </div>
  `}function ii(){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">…</div>
      <div><div class="pm-student-panel__name">Cargando…</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:var(--color-text-muted,#888)">
      Cargando datos del alumno…
    </div>
  `}function ai(e){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">!</div>
      <div><div class="pm-student-panel__name">Error</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:#c00">
      ${q(e)}
    </div>
  `}function oi({alumno:e,rutaId:t,sessionId:n,claseId:r,fecha:i,horaInicio:a}){Jr();let o=document.createElement(`aside`);o.className=`pm-student-panel`,o.setAttribute(`role`,`dialog`),o.setAttribute(`aria-modal`,`false`),o.setAttribute(`aria-label`,`Progreso de ${e.nombre_completo}`),document.body.appendChild(o);let s=[],c=null;function l(){ke()===`desktop`?o.classList.add(`pm-student-panel--desktop`):o.classList.remove(`pm-student-panel--desktop`)}let u=Te(l);l();function d(e){let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;if(n===`close`){h();return}if(n===`toggle-history`){let e=t.dataset.idx,n=o.querySelector(`[data-timeline="${e}"]`);if(!n)return;let r=!n.hidden;n.hidden=r,t.setAttribute(`aria-expanded`,String(!r));return}if(n===`new-eval`){let e=t.dataset.idx;f(e);return}if(n===`edit-eval`){let e=t.dataset.idx,n=t.dataset.hidx;f(e,n);return}}async function f(e,t=null){let n=s[e],r=t===null?null:n.history[t],i=r?.nota??null,a=document.createElement(`div`);a.className=`pm-student-panel__modal-overlay pm-animate-fade-in`,a.innerHTML=`
      <div class="pm-student-panel__modal-content">
        <div class="pm-student-panel__modal-header">
          <h4>${r?`Editar`:`Nueva`} Evaluación</h4>
          <button class="pm-student-panel__modal-close" data-action="modal-close">&times;</button>
        </div>
        <p class="pm-student-panel__modal-indicator-name">${q(n.nombre)}</p>
        
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
            <textarea id="modal-obs" rows="4" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 12px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Escribe aquí las observaciones...">${r?q(r.observations):``}</textarea>
          </div>
        </div>

        <div class="pm-student-panel__modal-footer">
          <button class="pm-btn pm-btn-outline" data-action="modal-close">Cancelar</button>
          <button class="pm-btn pm-btn-primary" data-action="modal-save">
            ${r?`Actualizar`:`Guardar Evaluación`}
          </button>
        </div>
      </div>
    `,document.body.appendChild(a),a.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-nota]`);if(t){a.querySelectorAll(`[data-nota]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),i=parseInt(t.dataset.nota);return}let o=e.target.closest(`[data-action]`)?.dataset.action;if(o===`modal-close`)a.remove();else if(o===`modal-save`){let e=a.querySelector(`#modal-obs`).value;await p(n.id,i,e,r?.id),a.remove()}}),a.addEventListener(`click`,e=>{e.target===a&&a.remove()})}async function p(t,n,o,s=null){try{let s=N();if(!s)throw Error(`No hay sesión de maestro activa.`);console.log(`[studentProgressPanel] Saving via RPC...`,{claseId:r,fecha:i,horaInicio:a,indicatorId:t,studentId:e.id,nota:n});let{data:c,error:l}=await j.rpc(`ensure_session_and_save_evaluation`,{p_clase_id:r,p_maestro_id:s.id,p_fecha:i,p_hora_inicio:a,p_indicator_id:t,p_student_id:e.id,p_nota:n,p_observations:(o||``).trim()});if(l)throw l;console.log(`[studentProgressPanel] Save successful. Session ID:`,c),await m()}catch(e){console.error(`[studentProgressPanel] Error during RPC save flow:`,e),alert(`Error al guardar la evaluación: `+(e.message||`Error de base de datos`))}}o.addEventListener(`click`,d),o.addEventListener(`keydown`,e=>{if(e.key===`Enter`||e.key===` `){let t=e.target.closest(`[data-action="toggle-history"]`);t&&(e.preventDefault(),t.click())}});async function m(){o.innerHTML=ii(),o.classList.add(`pm-student-panel--open`),c&&c.dispose(),c=Le(o,{onClose:()=>h()});try{let n=await Qr(e.id,t);s=n.indicatorSummaries,o.innerHTML=ri(e,n)}catch(e){console.error(`[studentProgressPanel] Error loading progress:`,e),o.innerHTML=ai(e?.message??`Error desconocido al cargar datos.`)}}function h(){o.classList.remove(`pm-student-panel--open`),c&&=(c.dispose(),null),setTimeout(()=>{o.classList.contains(`pm-student-panel--open`)||(o.innerHTML=``,s=[])},300)}function g(){c&&=(c.dispose(),null),u(),o.removeEventListener(`click`,d),o.remove()}return{open:m,close:h,destroy:g}}var si={LOGRADO:{label:`Logrado`,color:`var(--pm-success, #198754)`,bg:`#19875418`},EN_PROGRESO:{label:`En Progreso`,color:`var(--pm-primary, #0d6efd)`,bg:`#0d6efd18`},INICIADO:{label:`Iniciado`,color:`var(--pm-muted,   #6c757d)`,bg:`#6c757d18`}},ci=[`LOGRADO`,`EN_PROGRESO`,`INICIADO`],li={CONDUCTA:{label:`Conducta`,icon:`🚨`},ATENCION:{label:`Atención y concentración`,icon:`🔔`},RIESGO_PEDAGOGICO:{label:`Riesgo pedagógico`,icon:`📉`}};function ui(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function di(){let e=null,t=[],n=null;function r(e,t){let n=!!e.alerta,r=Array.isArray(e.alumnos)&&e.alumnos.length?e.alumnos.join(`, `):e.scope===`grupo`||e.scope===`all`?`Todos los presentes`:`—`;if(n){let t=li[e.alertaTipo]??{label:`Alerta`,icon:`⚠️`};return`
        <div class="ssp-card ssp-card--alerta">
          <div class="ssp-card-header">
            <span class="ssp-alerta-badge">${t.icon} ${ui(t.label)}</span>
            <span class="ssp-alumno">${ui(r)}</span>
          </div>
          <div class="ssp-contenido ssp-contenido--alerta">${ui(e.contenido_dsl)||`—`}</div>
          ${e.observacion?`<div class="ssp-obs">${ui(e.observacion)}</div>`:``}
          ${e.tarea?`<div class="ssp-tarea">📝 ${ui(e.tarea)}</div>`:``}
        </div>
      `}let i=si[e.estado]??si.EN_PROGRESO;return`
      <div class="ssp-card">
        <div class="ssp-card-header">
          <span class="ssp-alumno">${ui(r)}</span>
          <button
            class="ssp-estado-btn"
            data-idx="${t}"
            style="color:${i.color};background:${i.bg};border-color:${i.color}"
            title="Click para cambiar estado"
          >${i.label}</button>
        </div>
        <div class="ssp-contenido">${ui(e.contenido_dsl)||`—`}</div>
        ${e.observacion?`<div class="ssp-obs">${ui(e.observacion)}</div>`:``}
        ${e.tarea?`<div class="ssp-tarea">📝 ${ui(e.tarea)}</div>`:``}
      </div>
    `}function i(e,n){let r=(()=>{try{let[e,t,r]=n.split(`-`);return`${r}/${t}/${e}`}catch{return n}})(),i=t.filter(e=>e.alerta),a=t.filter(e=>!e.alerta),o=[`📚 Resumen clase ${e} — ${r}`];if(i.length){o.push(``,`⚠️ Alertas:`);for(let e of i){let t=Array.isArray(e.alumnos)&&e.alumnos.length?e.alumnos[0]:`Alumno`,n=li[e.alertaTipo]??{label:`Alerta`},r=e.tarea?` — ${e.tarea}`:``;o.push(`• ${t}: ${n.label}${r}`)}}if(a.length){o.push(``,`✅ Logros:`);for(let e of a){let t=Array.isArray(e.alumnos)&&e.alumnos.length?e.alumnos.join(`, `):`Todos`,n=si[e.estado]?.label??e.estado;o.push(`• ${t}: ${e.contenido_dsl||`—`} — ${n}`)}}return o.push(``,`🎯 El Sistema PC`),o.join(`
`)}function a(n,a){if(!e)return;let s=t.filter(e=>e.alerta),l=t.filter(e=>!e.alerta),u=t.length>0;e.innerHTML=`
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog" role="dialog" aria-modal="true" aria-label="Resumen pedagógico">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div>
            <strong>Resumen Pedagógico</strong>
            <div class="ssp-subtitle">${ui(n)} · ${ui(a)}</div>
          </div>
        </div>

        ${u?`
          ${s.length?`
            <div class="ssp-section-title ssp-section-title--alerta">⚠️ Alertas (${s.length})</div>
            ${s.map((e,t)=>r(e,t)).join(``)}
          `:``}

          ${l.length?`
            <div class="ssp-section-title">✅ Progresos (${l.length})</div>
            ${l.map((e,t)=>r(e,s.length+t)).join(``)}
          `:``}
        `:`
          <div class="ssp-empty">
            No hay registros de progreso para esta sesión.<br>
            Usá el botón 🎯 <strong>Analizar</strong> en el editor para generarlos.
          </div>
        `}

        <div class="ssp-footer">
          <button class="pm-btn pm-btn-success ssp-btn-wa" id="ssp-whatsapp">
            <i class="bi bi-whatsapp"></i> Compartir WhatsApp
          </button>
          <button class="pm-btn pm-btn-outline ssp-btn-close" id="ssp-close">✕ Cerrar</button>
        </div>
      </div>
    `,fi(),e.querySelectorAll(`.ssp-estado-btn`).forEach(e=>{e.onclick=()=>o(parseInt(e.dataset.idx),n,a)}),e.querySelector(`#ssp-whatsapp`).onclick=()=>{let e=i(n,a);window.open(`https://wa.me/?text=${encodeURIComponent(e)}`,`_blank`)},e.querySelector(`#ssp-close`).onclick=c,e.querySelector(`.ssp-backdrop`).onclick=c}async function o(e,r,i){let o=t[e];if(!o||!n)return;let s=ci[(ci.indexOf(o.estado)+1)%ci.length];t[e]={...o,estado:s},a(r,i);let{error:c}=await n.from(`progresos`).update({estado:s}).eq(`id`,o.id);c&&(console.error(`[SessionSummaryPanel] Error actualizando estado:`,c),t[e]=o,a(r,i))}async function s({sesionId:r,claseNombre:i,fecha:o,supabase:s}){n=s,e||(e=document.createElement(`div`),e.className=`ssp-wrapper`,document.body.appendChild(e)),e.style.display=`flex`,e.innerHTML=`
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div><strong>Resumen Pedagógico</strong><div class="ssp-subtitle">${ui(i)}</div></div>
        </div>
        <div class="ssp-loading">Cargando registros...</div>
      </div>
    `,fi(),e.querySelector(`.ssp-backdrop`).onclick=c;let{data:l,error:u}=await s.from(`progresos`).select(`id, alumno_id, contenido_dsl, estado, observacion, tarea, alerta, alertaTipo, scope, alumnos`).eq(`sesion_clase_id`,r).order(`alerta`,{ascending:!1});u?(console.error(`[SessionSummaryPanel] Error cargando progresos:`,u),t=[]):t=l||[],a(i,o)}function c(){e&&(e.style.display=`none`,e.innerHTML=``),t=[],n=null}return{open:s,close:c}}function fi(){if(document.getElementById(`ssp-styles`))return;let e=document.createElement(`style`);e.id=`ssp-styles`,e.textContent=`
    /* ── Wrapper & backdrop ────────────────────────── */
    .ssp-wrapper {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .ssp-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(2px);
    }

    /* ── Dialog ────────────────────────────────────── */
    .ssp-dialog {
      position: relative;
      z-index: 1;
      background: var(--pm-surface, #fff);
      border-radius: var(--pm-radius, 12px);
      box-shadow: 0 8px 40px rgba(0,0,0,0.22);
      width: 100%;
      max-width: 480px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ── Header ────────────────────────────────────── */
    .ssp-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .ssp-icon { font-size: 1.5rem; }
    .ssp-subtitle {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      margin-top: 0.1rem;
    }

    /* ── Section titles ────────────────────────────── */
    .ssp-section-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--pm-text-muted, #6c757d);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }
    .ssp-section-title--alerta { color: #dc3545; }

    /* ── Cards ─────────────────────────────────────── */
    .ssp-card {
      background: var(--pm-surface-2, #f8f9fa);
      border: 1px solid var(--pm-border, #dee2e6);
      border-radius: var(--pm-radius-sm, 8px);
      padding: 0.6rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .ssp-card--alerta {
      border-color: #dc3545 !important;
      background: #fff5f5 !important;
    }
    .dark .ssp-card--alerta,
    [data-theme="dark"] .ssp-card--alerta {
      background: #2a1215 !important;
    }

    /* ── Card internals ────────────────────────────── */
    .ssp-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }
    .ssp-alumno {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--pm-text, #212529);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ssp-alerta-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: #dc3545;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .ssp-contenido {
      font-size: 0.85rem;
      color: var(--pm-text, #212529);
    }
    .ssp-contenido--alerta {
      color: #dc3545;
      font-weight: 600;
    }
    .ssp-obs {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      font-style: italic;
    }
    .ssp-tarea {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
    }

    /* ── Estado button ─────────────────────────────── */
    .ssp-estado-btn {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      border: 1.5px solid;
      cursor: pointer;
      white-space: nowrap;
      background: transparent;
      transition: opacity 0.15s;
    }
    .ssp-estado-btn:hover { opacity: 0.75; }

    /* ── Empty & loading ───────────────────────────── */
    .ssp-empty {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1rem 0;
      line-height: 1.6;
    }
    .ssp-loading {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1.5rem 0;
    }

    /* ── Footer ────────────────────────────────────── */
    .ssp-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.25rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--pm-border, #dee2e6);
    }
    .ssp-btn-wa { flex: 1; }
    .ssp-btn-close { flex-shrink: 0; }
  `,document.head.appendChild(e)}function pi({saveFn:e,debounceMs:t=3e4}){let n=null,r=[];function i(i){n!==null&&(clearTimeout(n),n=null),!(!i||!i.trim())&&(n=setTimeout(async()=>{n=null,await e(i),r.forEach(e=>e(i))},t))}function a(){n!==null&&(clearTimeout(n),n=null)}function o(e){r.push(e)}return{onInput:i,destroy:a,onSaved:o}}async function mi(e,t,n){let{data:r,error:i}=await j.from(`observaciones_sesion`).select(`id`).eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0).limit(1).maybeSingle();if(i)throw i;if(r){let{data:e,error:t}=await j.from(`observaciones_sesion`).update({contenido_raw:n}).eq(`id`,r.id).select().single();if(t)throw t;return e}else{let{data:r,error:i}=await j.from(`observaciones_sesion`).insert({sesion_id:e,maestro_id:t,contenido_raw:n,es_borrador:!0}).select().single();if(i)throw i;return r}}async function hi(e,t){let{data:n,error:r}=await j.from(`observaciones_sesion`).select(`id, contenido_raw, updated_at`).eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0).limit(1).maybeSingle();if(r)throw r;return n??null}async function gi(e){let{error:t}=await j.from(`observaciones_sesion`).delete().eq(`id`,e);if(t)throw t}async function _i(e,t,n,r,i=null){let{error:a}=await j.from(`observaciones_sesion`).delete().eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0);if(a)throw a;let{data:o,error:s}=await j.from(`observaciones_sesion`).insert({sesion_id:e,maestro_id:t,contenido_raw:n,contenido_parsed:r,contenido_ia_dsl:i,es_borrador:!1}).select().single();if(s)throw s;return o}var vi=`soi_ruta_tema_pendiente`;function yi(e){sessionStorage.setItem(vi,JSON.stringify(e))}function bi(){let e=sessionStorage.getItem(vi);if(!e)return null;sessionStorage.removeItem(vi);try{return JSON.parse(e)}catch{return null}}function xi(e,{onSave:t,onCancel:n,onDelete:r}){let i=document.getElementById(`pm-justif-modal`);if(!i&&(i=document.createElement(`div`),i.id=`pm-justif-modal`,i.className=`pm-justif-modal-overlay`,i.innerHTML=`
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
          <button class="pm-justif-delete" id="pm-justif-delete" style="display:none;" title="Eliminar justificación">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Eliminar
          </button>
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
    `,document.body.appendChild(i),!document.getElementById(`pm-justif-styles`))){let e=document.createElement(`style`);e.id=`pm-justif-styles`,e.textContent=`
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
        .pm-justif-delete {
          margin-right: auto;
          background: transparent;
          border: 1px solid var(--pm-danger);
          border-radius: 8px;
          padding: 0.5rem 0.9rem;
          font-size: 0.825rem;
          font-weight: 500;
          color: var(--pm-danger);
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .pm-justif-delete:hover {
          background: var(--pm-danger);
          color: white;
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
      `,document.head.appendChild(e)}let a=null,o=null,s=null,c=null,l=!1,u=null,d=null,f=i.querySelector(`#pm-justif-title`),p=i.querySelector(`#pm-justif-subtitle`),m=i.querySelector(`#pm-justif-btn-text`),h=i.querySelector(`#pm-justif-alumno-nombre`),g=i.querySelector(`#pm-justif-motivo`),_=i.querySelector(`#pm-justif-file`),v=i.querySelector(`.pm-justif-file-placeholder`),y=i.querySelector(`.pm-justif-file-preview`),b=i.querySelector(`#pm-justif-preview-img`),x=i.querySelector(`#pm-justif-remove-file`),S=i.querySelector(`#pm-justif-delete`);function C(e,t=null,n=null){a=e,o=t,s=null,c=null,l=!!t,u=n,l?(f.textContent=`Editar Justificación`,p.textContent=`Modifica el motivo de la inasistencia`,m.textContent=`Actualizar`,S.style.display=`flex`):(f.textContent=`Justificar Inasistencia`,p.textContent=`Registra el motivo de la ausencia`,m.textContent=`Guardar Justificación`,S.style.display=`none`),h.textContent=e.nombre_completo,g.value=t?.motivo||``;let r=t?.evidencia_url||t?.evidencia_base64;r?(c=r,b.src=r,v.style.display=`none`,y.style.display=`block`):(c=null,v.style.display=`flex`,y.style.display=`none`),_.value=``,i.classList.add(`open`),g.focus();let x=i.querySelector(`.pm-justif-modal`);x&&(d&&d.dispose(),d=Le(x,{onClose:()=>w(!0)}))}function w(e=!1){e&&n&&a&&u!==null&&n(a.id,u),i.classList.remove(`open`),a=null,o=null,s=null,c=null,u=null,d&&=(d.dispose(),null)}i.querySelector(`#pm-justif-close`).onclick=()=>w(!0),i.querySelector(`#pm-justif-cancel`).onclick=()=>w(!0),S.onclick=()=>{a&&confirm(`¿Eliminar la justificación de ${a.nombre_completo}?`)&&(r&&r({alumnoId:a.id,justificacionId:o?.id,existingUrl:o?.evidencia_url||o?.evidencia_base64}),w(!1))},i.querySelector(`.pm-justif-backdrop`).onclick=()=>w(!0),_.onchange=e=>{let t=e.target.files[0];t&&(s=t,c=URL.createObjectURL(t),b.src=c,v.style.display=`none`,y.style.display=`block`)},x.onclick=()=>{c&&!(o?.evidencia_url||o?.evidencia_base64)&&URL.revokeObjectURL(c),s=null,c=null,_.value=``,v.style.display=`flex`,y.style.display=`none`},i.querySelector(`#pm-justif-save`).onclick=()=>{let e=g.value.trim();if(!e){g.focus(),g.style.borderColor=`var(--pm-danger)`,setTimeout(()=>{g.style.borderColor=``},2e3);return}t&&a&&t({alumnoId:a.id,motivo:e,evidenciaFile:s,evidenciaPreview:c,justificacionId:o?.id||null,existingUrl:o?.evidencia_url||o?.evidencia_base64||null,isEdit:l})};let T=e=>{e.key===`Escape`&&(w(),document.removeEventListener(`keydown`,T))};return document.addEventListener(`keydown`,T),{open:C,close:w}}var Si=`documentos`;async function Ci(e,t=`justificaciones`){let n=e.name.split(`.`).pop(),r=`${t}/${`${Date.now()}_${Math.random().toString(36).slice(2)}.${n}`}`,{data:i,error:a}=await j.storage.from(Si).upload(r,e,{cacheControl:`3600`,upsert:!1});if(a)throw a;let{data:o}=j.storage.from(Si).getPublicUrl(r);return o.publicUrl}async function wi({sesionId:e,alumnoId:t,claseId:n,fecha:r,motivo:i,evidenciaBase64:a,creadoPor:o},s=null){if(!e||!t||!n||!r||!i)return{error:{message:`Faltan campos requeridos`}};let c=null;if(s)try{c=await Ci(s)}catch(e){console.warn(`[JustificacionService] Error subiendo evidencia a Storage:`,e)}let l={sesion_id:e,alumno_id:t,clase_id:n,fecha:r,motivo:i,evidencia_url:c||null,evidencia_base64:null,creado_por:o,estado:`pendiente`},{data:u,error:d}=await j.from(`justificaciones`).upsert([l],{onConflict:`sesion_id,alumno_id`,ignoreDuplicates:!1}).select().single();return{data:u,error:d}}async function Ti(e,t){if(!e||!t)return null;let{data:n,error:r}=await j.from(`justificaciones`).select(`*`).eq(`sesion_id`,e).eq(`alumno_id`,t).single();return r&&r.code!==`PGRST116`?(console.warn(`[JustificacionService] Error obteniendo justificación:`,r),null):n||null}async function Ei(e){if(!e)return{error:{message:`ID requerido`}};let{error:t}=await j.from(`justificaciones`).delete().eq(`id`,e);return{error:t}}async function Di(e,t,n,r,i=`Clase`){if(!r||r.length===0)return{success:!0};let a=r.filter(e=>e.observacion&&e.observacion.trim().length>0);if(a.length===0)return{success:!0};let o=a.map(r=>new ie({alumno_id:r.alumno_id,maestro_id:n,clase_id:t,sesion_clase_id:e,tipo:`academico`,titulo:`Evaluación SOI: ${i}`,descripcion:r.observacion,prioridad:`media`,estado:`abierta`,fecha_observacion:new Date().toISOString().split(`T`)[0]}).toJSON()),{data:s,error:c}=await j.from(`observaciones_alumnos`).upsert(o,{onConflict:`sesion_clase_id,alumno_id`});return c?(console.error(`[Promotion] Error promoviendo observaciones:`,c),{success:!1,error:c.message}):{success:!0,data:s}}function Oi(){let e=Promise.resolve();return{run(t){if(typeof t!=`function`)throw TypeError(`asyncMutex.run expects a function`);let n=e.then(()=>t());return e=n.then(()=>{},()=>{}),n}}}function ki(e){return(e||``).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).trim()}function Ai(e,t){let n=ki(e);return t.find(e=>ki(e.nombre)===n||ki(e.nombreCorto||e.nombre.split(` `)[0])===n||n.length>=3&&ki(e.nombre).includes(n)||n.length>=3&&n.includes(ki(e.nombreCorto||e.nombre.split(` `)[0])))??null}function ji(e,t){let n=[],r=[];for(let i of e){if(ki(i)===`todos`){n.push(...t);continue}let e=Ai(i,t);e?n.push(e):r.push(`No se encontró el alumno: "${i}"`)}let i=new Set;return{resolved:n.filter(e=>i.has(e.id)?!1:(i.add(e.id),!0)),errors:r}}async function Mi(e){if(e.length===0)return{data:[],error:null};let t=new Set,n=e.filter(e=>{let n=`${e.alumno_id}|${e.clase_id}|${e.sesion_clase_id}|${e.contenido_dsl}`;return t.has(n)?!1:(t.add(n),!0)}),{data:r,error:i}=await j.from(`progresos`).upsert(n,{onConflict:`alumno_id,clase_id,sesion_clase_id,contenido_dsl`,ignoreDuplicates:!1}).select(`id, alumno_id, contenido_dsl, estado_cualitativo`);return{data:r,error:i}}async function Ni({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,progressRecords:i,alumnos:a}){if(!i||i.length===0)return{saved:[],errors:[]};if(!t)return console.warn(`[Progress] Skip saveProgressFromAI — emergente session sin clase_id`),{saved:[],errors:[]};let o=[],s=[];for(let c of i){let{resolved:i,errors:l}=ji(c.alumnos||[],a);s.push(...l);for(let a of i)o.push({alumno_id:a.id,clase_id:t,sesion_clase_id:e,maestro_id:n,fecha_evaluacion:r,evaluacion_tipo:`observacion`,estado_cualitativo:c.estado||`EN_PROGRESO`,calificacion:c.nota??null,contenido_dsl:c.contenido||``,observaciones:c.observacion||null,indicadores:{tipo:c.tipo||`otro`,es_colectivo:c.es_colectivo??!1,tarea:c.tarea||null},objetivo_id:null})}try{let{data:e,error:t}=await Mi(o);if(t)throw t;return{saved:(e||[]).map(e=>({alumnoId:e.alumno_id,contenido:e.contenido_dsl,estado:e.estado_cualitativo})),errors:s}}catch(e){return console.warn(`[Progress] Error al guardar progreso:`,e.message),{saved:[],errors:[...s,e.message]}}}async function Pi({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,dslText:i,alumnos:a}){if(!i||!i.trim())return{saved:[],errors:[]};if(!t)return console.warn(`[Progress] Skip saveProgressFromDSL — emergente session sin clase_id`),{saved:[],errors:[]};let o=i.split(`
`),s=[];for(let e of o){let t=Xt(e);if(!t.estados||t.estados.length===0||!t.contenido||t.contenido.length===0)continue;let n=t.estados[0],r=t.contenido[0],i=t.alumnos.length>0?t.alumnos:[`todos`],a=t.calificacion?.valor??null;s.push({alumnos:i,contenido:r,tipo:`tecnica`,estado:n,nota:a,tarea:t.tareas[0]||null,observacion:t.sugerencias[0]||null,es_colectivo:i.includes(`todos`)})}return s.length===0?{saved:[],errors:[]}:Ni({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,progressRecords:s,alumnos:a})}async function Fi({claseId:e,objetivos:t}){if(!e||!t||t.length===0)return{linked:0};let{data:n,error:r}=await j.from(`progresos`).select(`id, contenido_dsl`).eq(`clase_id`,e).is(`objetivo_id`,null).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``);if(r)return console.warn(`[Progress] linkProgresosToObjetivos fetch error:`,r.message),{linked:0};if(!n||n.length===0)return{linked:0};let i=t.map(e=>({id:e.id,norm:ki(e.descripcion),raw:e.descripcion})),a=new Map;for(let e of n){let t=ki(e.contenido_dsl);if(!t)continue;let n=i.find(e=>e.norm===t);if(!n&&t.length>=5&&(n=i.find(e=>e.norm.length>=5&&e.norm.includes(t))),!n&&t.length>=5&&(n=i.find(e=>e.norm.length>=5&&t.includes(e.norm))),n){let t=a.get(n.id)||[];t.push(e.id),a.set(n.id,t)}}if(a.size===0)return{linked:0};let o=0;for(let[e,t]of a.entries()){let{error:n}=await j.from(`progresos`).update({objetivo_id:e}).in(`id`,t);n?console.warn(`[Progress] linkProgresosToObjetivos update error:`,n.message):o+=t.length}return console.debug(`[Progress] linkProgresosToObjetivos: linked ${o} records`),{linked:o}}var Ii={LOGRADO:{label:`Logrado`,color:`var(--pm-success, #198754)`,bg:`#19875418`},EN_PROGRESO:{label:`En Progreso`,color:`var(--pm-primary, #0d6efd)`,bg:`#0d6efd18`},INICIADO:{label:`Iniciado`,color:`var(--pm-muted,   #6c757d)`,bg:`#6c757d18`}},Li=[`LOGRADO`,`EN_PROGRESO`,`INICIADO`];function Ri(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}var zi={CONDUCTA:{label:`conducta`,icon:`🚨`},ATENCION:{label:`atención`,icon:`🔔`},RIESGO_PEDAGOGICO:{label:`riesgo pedagógico`,icon:`📉`}};function Bi(e){let t={};for(let n of e){let e=n.alertaTipo??n.alertDetails?.type??`CONDUCTA`;t[e]=(t[e]??0)+1}return`${Object.entries(t).map(([e,t])=>{let n=zi[e]??{label:e.toLowerCase(),icon:`⚠️`};return`${n.icon} ${t} ${n.label}${t>1?`s`:``}`}).join(` · `)} — revisá antes de guardar`}function Vi(e,{onConfirm:t,onCancel:n}){let r=[],i=null;function a(e){let t=e.scope||(e.es_colectivo?`grupo`:`individual`),n=e.alumnos||[];if(e.requires_confirmation)return`<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`;switch(t){case`grupo`:case`all`:return`<span class="ppp-scope-chip ppp-scope--all">👥 Todos los presentes</span>`;case`grupo_excluyendo`:case`group_excluding`:return`<span class="ppp-scope-chip ppp-scope--excluding">👥 Resto del grupo</span>`;case`subgrupo_indeterminado`:case`subgroup_unknown`:return`<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`;default:return n.length?n.length===1?`<span class="ppp-scope-chip ppp-scope--individual">👤 ${Ri(n[0])}</span>`:`<span class="ppp-scope-chip ppp-scope--individual">👤 ${Ri(n.join(`, `))}</span>`:``}}function o(e,t){let n=Ii[e.estado]??Ii.EN_PROGRESO,r=e.nota?` · ${Ri(e.nota)}/5`:``,i=e.tarea?`<div class="ppp-tarea">📝 ${Ri(e.tarea)}</div>`:``,o=!!e.alerta,s=a(e);if(o){let n=zi[e.alertaTipo]??{label:`Alerta pedagógica`,icon:`⚠️`};return`
        <div class="ppp-card ppp-card--alerta" data-idx="${t}">
          <div class="ppp-card-header">
            <span class="ppp-alerta-badge">${n.icon} ${Ri(n.label===`conducta`?`Conducta`:n.label===`atención`?`Atención pedagógica`:`Riesgo pedagógico`)}</span>
            <button class="ppp-remove" data-idx="${t}" title="Quitar este registro">✕</button>
          </div>
          ${s?`<div class="ppp-scope-row">${s}</div>`:``}
          <div class="ppp-card-body">
            <span class="ppp-contenido ppp-contenido--alerta">${Ri(e.contenido)||`—`}</span>
          </div>
          ${e.observacion?`<div class="ppp-obs ppp-obs--alerta">${Ri(e.observacion)}</div>`:``}
          ${i}
        </div>
      `}return`
      <div class="ppp-card" data-idx="${t}">
        <div class="ppp-card-header">
          ${s||`<span class="ppp-alumnos">${Ri((e.alumnos||[]).join(`, `))}</span>`}
          <button class="ppp-remove" data-idx="${t}" title="Quitar este registro">✕</button>
        </div>
        <div class="ppp-card-body">
          <span class="ppp-contenido">${Ri(e.contenido)||`—`}</span>
          <span class="ppp-sep">·</span>
          <button
            class="ppp-estado-btn"
            data-idx="${t}"
            style="color:${n.color};background:${n.bg};border-color:${n.color}"
            title="Click para cambiar estado"
          >${n.label}${r}</button>
        </div>
        ${e.observacion?`<div class="ppp-obs">${Ri(e.observacion)}</div>`:``}
        ${i}
      </div>
    `}function s(e){if(!i)return;let a=r.length>0,c=r.filter(e=>e.alerta),u=c.length>0?`<div class="ppp-alert-banner">⚠️ ${Bi(c)}</div>`:``,d=Fe(r),f=d.length>0?`
      <div class="ppp-clarification-banner">
        <div class="ppp-clarification-title">✏️ El texto puede ser más específico</div>
        <div class="ppp-clarification-body">
          ${d.map(e=>`<div class="ppp-clarification-item">• ${Ri(e.reason)}</div>`).join(``)}
        </div>
        <div class="ppp-clarification-hint">Podés guardar igual o editar el texto arriba para separar mejor las ideas.</div>
      </div>
    `:``;i.innerHTML=`
      <div class="ppp-header">
        <span class="ppp-icon">🎯</span>
        <div class="ppp-header-text">
          <strong>La IA detectó estos avances</strong>
          ${e?`<div class="ppp-resumen">${Ri(e)}</div>`:``}
        </div>
      </div>
      ${u}
      ${f}
      <div class="ppp-cards">
        ${a?r.map((e,t)=>o(e,t)).join(``):`<div class="ppp-empty">No se detectaron registros de progreso en este texto.</div>`}
      </div>
      <div class="ppp-footer">
        <button class="pm-btn pm-btn-outline ppp-btn-cancel" id="ppp-cancel">Cancelar</button>
        <button class="pm-btn pm-btn-primary ppp-btn-confirm" id="ppp-confirm" ${a?``:`disabled`}>
          ✓ Confirmar y guardar (${r.length})
        </button>
      </div>
    `,Hi(),i.querySelectorAll(`.ppp-remove`).forEach(t=>{t.onclick=()=>{r.splice(parseInt(t.dataset.idx),1),s(e)}}),i.querySelectorAll(`.ppp-estado-btn`).forEach(t=>{t.onclick=()=>{let n=parseInt(t.dataset.idx),i=r[n].estado,a=(Li.indexOf(i)+1)%Li.length;r[n].estado=Li[a],s(e)}}),i.querySelector(`#ppp-confirm`).onclick=()=>{t([...r]),l()},i.querySelector(`#ppp-cancel`).onclick=()=>{n&&n(),l()}}function c({progreso:t=[],resumen:n=``}){r=t.map(e=>({...e})),i||(i=document.createElement(`div`),i.className=`pm-progress-preview`,e.appendChild(i)),i.style.display=`block`,s(n),setTimeout(()=>i.scrollIntoView({behavior:`smooth`,block:`start`}),80)}function l(){i&&(i.style.display=`none`,i.innerHTML=``)}return{open:c,close:l}}function Hi(){if(document.getElementById(`ppp-alert-styles`))return;let e=document.createElement(`style`);e.id=`ppp-alert-styles`,e.textContent=`
    /* ── Alert banner ────────────────────────────────────────── */
    .ppp-alert-banner {
      margin: 0 0 0.5rem 0;
      padding: 0.5rem 0.75rem;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 6px;
      color: #856404;
      font-size: 0.82rem;
      font-weight: 600;
    }

    /* ── Alert card ──────────────────────────────────────────── */
    .ppp-card--alerta {
      border: 1.5px solid #dc3545 !important;
      background: #fff5f5 !important;
    }
    .dark .ppp-card--alerta,
    [data-theme="dark"] .ppp-card--alerta {
      background: #2a1215 !important;
      border-color: #f87171 !important;
    }

    .ppp-alerta-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #dc3545;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .ppp-alerta-alumno {
      font-size: 0.82rem;
      font-weight: 600;
      color: #dc3545;
      margin: 0.15rem 0 0.25rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ppp-contenido--alerta {
      color: #dc3545 !important;
      font-weight: 700;
    }

    .ppp-obs--alerta {
      color: #b91c1c;
      font-style: italic;
      font-size: 0.8rem;
      margin-top: 0.2rem;
    }

    /* ── Clarification banner ────────────────────────────────── */
    .ppp-clarification-banner {
      margin: 0 0 0.5rem 0;
      padding: 0.6rem 0.75rem;
      background: #f0f4ff;
      border: 1px solid #93c5fd;
      border-radius: 6px;
      font-size: 0.82rem;
    }
    .dark .ppp-clarification-banner,
    [data-theme="dark"] .ppp-clarification-banner {
      background: #1e2a3a;
      border-color: #3b82f6;
    }
    .ppp-clarification-title {
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 0.25rem;
    }
    .ppp-clarification-item {
      color: #1e40af;
      margin: 0.1rem 0;
    }
    .dark .ppp-clarification-item,
    [data-theme="dark"] .ppp-clarification-item {
      color: #93c5fd;
    }
    .ppp-clarification-hint {
      color: #6b7280;
      margin-top: 0.35rem;
      font-style: italic;
    }

    /* ── Scope chips ─────────────────────────────────────────── */
    .ppp-scope-row {
      margin: 0.1rem 0 0.2rem 0;
    }
    .ppp-scope-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.1rem 0.5rem;
      border-radius: 99px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .ppp-scope--all {
      background: #e0f2fe;
      color: #0369a1;
    }
    .dark .ppp-scope--all,
    [data-theme="dark"] .ppp-scope--all {
      background: #0c3554;
      color: #7dd3fc;
    }
    .ppp-scope--individual {
      background: #f0fdf4;
      color: #15803d;
    }
    .dark .ppp-scope--individual,
    [data-theme="dark"] .ppp-scope--individual {
      background: #052e16;
      color: #86efac;
    }
    .ppp-scope--excluding {
      background: #fef9c3;
      color: #854d0e;
    }
    .dark .ppp-scope--excluding,
    [data-theme="dark"] .ppp-scope--excluding {
      background: #3a2900;
      color: #fde047;
    }
    .ppp-scope--unknown {
      background: #faf5ff;
      color: #7c3aed;
      border: 1px dashed #c4b5fd;
    }
    .dark .ppp-scope--unknown,
    [data-theme="dark"] .ppp-scope--unknown {
      background: #1e1030;
      color: #c4b5fd;
    }
  `,document.head.appendChild(e)}async function Ui(e,t=12){let n=new Date;n.setDate(n.getDate()-t*7);let r=n.toISOString().split(`T`)[0],{data:i,error:a}=await j.from(`progresos`).select(`
      contenido_dsl,
      tipo,
      estado_cualitativo,
      fecha_evaluacion,
      alumnos ( nombre_completo )
    `).eq(`clase_id`,e).eq(`evaluacion_tipo`,`observacion`).gte(`fecha_evaluacion`,r).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``).order(`fecha_evaluacion`,{ascending:!1});if(a)throw Error(`Error al obtener registros de progreso: `+a.message);if(!i||i.length===0)return{totalSesiones:0,fechaDesde:r,registros:[]};let o=new Set(i.map(e=>e.fecha_evaluacion)),s=new Map;for(let e of i){let t=(e.contenido_dsl||``).trim().toLowerCase();if(!t)continue;s.has(t)||s.set(t,{contenido_dsl:e.contenido_dsl.trim(),tipo:e.tipo||`otro`,estados:[],fechas:new Set,alumnos:new Set});let n=s.get(t);n.estados.push(e.estado_cualitativo||`EN_PROGRESO`),n.fechas.add(e.fecha_evaluacion);let r=e.alumnos?.nombre_completo;r&&n.alumnos.add(r)}let c=Array.from(s.values()).map(e=>({contenido_dsl:e.contenido_dsl,tipo:e.tipo,estado:e.estados[0]||`EN_PROGRESO`,frecuencia:e.fechas.size,alumnos:Array.from(e.alumnos)}));return c.sort((e,t)=>t.frecuencia-e.frecuencia),{totalSesiones:o.size,fechaDesde:r,registros:c}}var Wi={tecnica:{color:`#0d6efd`,bg:`#0d6efd15`},repertorio:{color:`#198754`,bg:`#19875415`},teoria:{color:`#fd7e14`,bg:`#fd7e1415`},interpretacion:{color:`#6f42c1`,bg:`#6f42c115`},otro:{color:`#6c757d`,bg:`#6c757d15`}},Gi={alta:{label:`Foco`,color:`#dc3545`},media:{label:`Secundario`,color:`#fd7e14`},consolidacion:{label:`Consolidar`,color:`#198754`}};function Ki(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function qi(e,{onAdopt:t,onCancel:n}){let r=[],i=``,a=null;function o(e,t,n){let r=Gi[e.prioridad]??Gi.media;return`
      <div class="cpp-objetivo-row" data-pilar="${t}" data-obj="${n}">
        <span
          class="cpp-objetivo-text"
          data-pilar="${t}"
          data-obj="${n}"
          title="Click para editar"
        >${Ki(e.descripcion)}</span>
        <span class="cpp-prioridad-badge" style="color:${r.color}">${r.label}</span>
        <button class="cpp-remove-obj" data-pilar="${t}" data-obj="${n}" title="Quitar objetivo">✕</button>
      </div>
    `}function s(e,t){let n=Wi[e.tipo]??Wi.otro,r=(e.objetivos||[]).map((e,n)=>o(e,t,n)).join(``);return`
      <div class="cpp-pilar" data-pilar="${t}" style="border-left:3px solid ${n.color};background:${n.bg}">
        <div class="cpp-pilar-header">
          <span
            class="cpp-pilar-title"
            data-pilar="${t}"
            title="Click para editar nombre"
          >${Ki(e.nombre)}</span>
          <button class="cpp-remove-pilar" data-pilar="${t}" title="Quitar pilar">✕</button>
        </div>
        <div class="cpp-objetivos">
          ${r||`<div class="cpp-no-obj">Sin objetivos</div>`}
        </div>
      </div>
    `}function c(){return a?.querySelector(`#cpp-instrumento`)?.value?.trim()||``}function l(){return a?.querySelector(`#cpp-nivel`)?.value?.trim()||``}function u(){return!c()||r.length===0?!1:r.every(e=>(e.objetivos||[]).length>0)}function d(e,o){if(!a)return;let f=r.length>0;a.innerHTML=`
      <div class="cpp-header">
        <span class="cpp-icon">✨</span>
        <div class="cpp-header-text">
          <strong>Propuesta curricular generada por IA</strong>
          ${i?`<div class="cpp-resumen">${Ki(i)}</div>`:``}
        </div>
      </div>
      <div class="cpp-pilares">
        ${f?r.map((e,t)=>s(e,t)).join(``):`<div class="cpp-empty">La IA no detectó suficientes datos para generar una propuesta.</div>`}
      </div>
      <div class="cpp-footer">
        <div class="cpp-fields">
          <label class="cpp-field-label">Instrumento
            <input type="text" id="cpp-instrumento" class="cpp-input" value="${Ki(e)}" placeholder="ej. Violín" />
          </label>
          <label class="cpp-field-label">Nivel
            <input type="text" id="cpp-nivel" class="cpp-input" value="${Ki(o)}" placeholder="ej. Básico" />
          </label>
        </div>
        <div class="cpp-actions">
          <button class="pm-btn pm-btn-outline" id="cpp-cancel">Cancelar</button>
          <button class="pm-btn pm-btn-primary" id="cpp-adopt" ${u()?``:`disabled`}>
            ✓ Adoptar plan (${r.length} pilares)
          </button>
        </div>
      </div>
    `,a.querySelectorAll(`.cpp-pilar-title`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=document.createElement(`input`);n.type=`text`,n.className=`cpp-input cpp-inline-input`,n.value=r[t].nombre,e.replaceWith(n),n.focus();let i=()=>{r[t].nombre=n.value.trim()||r[t].nombre,d(c(),l())};n.onblur=i,n.onkeydown=e=>{e.key===`Enter`&&(e.preventDefault(),i())}}}),a.querySelectorAll(`.cpp-objetivo-text`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=parseInt(e.dataset.obj),i=document.createElement(`input`);i.type=`text`,i.className=`cpp-input cpp-inline-input`,i.value=r[t].objetivos[n].descripcion,e.replaceWith(i),i.focus();let a=()=>{r[t].objetivos[n].descripcion=i.value.trim()||r[t].objetivos[n].descripcion,d(c(),l())};i.onblur=a,i.onkeydown=e=>{e.key===`Enter`&&(e.preventDefault(),a())}}}),a.querySelectorAll(`.cpp-remove-obj`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=parseInt(e.dataset.obj);r[t].objetivos.splice(n,1),d(c(),l())}}),a.querySelectorAll(`.cpp-remove-pilar`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar);r.splice(t,1),d(c(),l())}});let m=a.querySelector(`#cpp-instrumento`),h=a.querySelector(`#cpp-adopt`);m&&h&&(m.oninput=()=>{h.disabled=!u()}),h&&(h.onclick=()=>{let e=c(),n=l();if(!e){m?.focus();return}t({instrumento:e,nivel:n,resumen:i,pilares:r}),p()});let g=a.querySelector(`#cpp-cancel`);g&&(g.onclick=()=>{n&&n(),p()})}function f({pilares:t=[],resumen:n=``,instrumento:o=``,nivel:s=``}){r=t.map(e=>({...e,objetivos:(e.objetivos||[]).map(e=>({...e}))})),i=n,a||(a=document.createElement(`div`),a.className=`cpp-panel`,e.appendChild(a)),a.style.display=`block`,d(o,s),setTimeout(()=>a.scrollIntoView({behavior:`smooth`,block:`nearest`}),50)}function p(){a&&(a.style.display=`none`,a.innerHTML=``)}return{open:f,close:p}}function Ji(e){if(!e||typeof e!=`string`)return{claseId:null,fecha:null,isValid:!1};let t=e.match(/^\/asistencia\/([a-f0-9-]{36})\/(\d{4}-\d{2}-\d{2})$/);return t?{claseId:t[1],fecha:t[2],isValid:!0}:{claseId:null,fecha:null,isValid:!1}}function Yi(e){let{claseId:t,fecha:n,isValid:r}=Ji(e);if(!r){console.warn(`[notificationService] Invalid deep link:`,e);return}window.appNavigate?.({view:`asistencia`,claseId:t,fecha:n})}fe(e=>{if(e.event===`subscriptionChanged`)console.log(`[Notif] Push subscription changed:`,e.subscribed);else if(e.event===`notificationReceived`){console.log(`[Notif] Real-time push received:`,e.notification),na(e.notification);let t=e.notification;t?.data?.deep_link?Yi(t.data.deep_link):t?.data?.deep_link_url&&Yi(t.data.deep_link_url),J.some(t=>t.id===e.notification.id)||(J.unshift({...e.notification,created_at:e.notification.created_at||new Date().toISOString()}),la())}});var Xi=30*1e3,Zi=60*1e3,Qi=120*1e3,$i=new Map;function ea(e){return`${e.tipo||`unknown`}:${e.clase_id||e.alumno_id||e.id||`generic`}:${Math.floor(Date.now()/Zi)}`}function ta(){let e=Date.now();for(let[t,n]of $i.entries())e>n&&$i.delete(t)}function na(e){let t=ea(e),n=Date.now()+Qi;$i.set(t,n)}function ra(){return ta(),$i.size}function ia(e){return`notif_cache_${e}`}function aa(e){try{let t=J.filter(e=>!String(e.id).startsWith(`local_`)).slice(0,30);localStorage.setItem(ia(e),JSON.stringify(t))}catch{}}function oa(e){try{let t=localStorage.getItem(ia(e));return t?JSON.parse(t):[]}catch{return[]}}var J=[],sa=[];function ca(e){return sa.push(e),e(J),()=>{sa=sa.filter(t=>t!==e)}}function la(){sa.forEach(e=>e([...J]))}async function ua(){let e=N();if(!e)return[];J.length===0&&(J=oa(e.id),J.length>0&&la());try{let{data:t,error:n}=await j.from(`notificaciones`).select(`*`).eq(`profile_id`,e.id).order(`created_at`,{ascending:!1}).limit(30);if(n)return console.warn(`[NotifService] Error fetch:`,n),J;let r=(t||[]).map(e=>({...e,created_at:e.created_at||new Date().toISOString()})),i=J.filter(e=>String(e.id).startsWith(`local_`));return J=[...r,...i],await da(e.id),aa(e.id),la(),J}catch(e){return console.error(`[NotifService]`,e),J}}async function da(e){try{let t=new Date,n=t.toISOString().split(`T`)[0],r=t.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[i,a]=await Promise.all([g(),A(e,n,n)]),o=i.map(e=>e.id),s=Object.fromEntries(i.map(e=>[e.id,e])),c=(await x(o)).filter(e=>e.dia?.toLowerCase()===r);a.filter(e=>e.estado===`pendiente`||e.estado===`borrador`||e.borrador===!0);let l=new Set(a.filter(e=>e.borrador===!1||e.estado===`registrada`).map(e=>e.clase_id)),u=new Date;for(let e of c){if(!e.hora_fin||l.has(e.clase_id))continue;let[t,r]=e.hora_fin.split(`:`),i=new Date;i.setHours(parseInt(t,10),parseInt(r,10),0,0);let a=(u-i)/6e4;if(a<30)continue;let o=s[e.clase_id],c=`${e.clase_id}_${n}`;if(J.some(e=>e.referencia_id===c&&e.tipo===`sesion_sin_registrar`))continue;let d=e.hora_fin?e.hora_fin.slice(0,5):``,f=e.hora_inicio?e.hora_inicio.slice(0,5):``,p=f&&d?` (${f}–${d})`:``,m=Math.round(a),h=m>=60?`hace ${Math.floor(m/60)}h ${m%60}min`:`hace ${m} min`;J.unshift({id:`local_`+c,tipo:`sesion_sin_registrar`,titulo:`Clase sin registrar`,mensaje:`${o?.nombre||`Tu clase`}${p} terminó ${h}. Registrá la asistencia para que quede guardada.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:c,clase_id:e.clase_id,fecha:n})}for(let e of c){if(!e.hora_inicio)continue;let[t,r]=e.hora_inicio.split(`:`),i=new Date;i.setHours(parseInt(t,10),parseInt(r,10),0,0);let a=(i-u)/6e4;if(a<0||a>15)continue;let o=s[e.clase_id],c=`prox_${e.clase_id}_${n}`;if(J.some(e=>e.referencia_id===c))continue;let l=e.hora_inicio?e.hora_inicio.slice(0,5):``,d=Math.round(a);J.unshift({id:`local_`+c,tipo:`recordatorio_clase`,titulo:`Clase por empezar`,mensaje:`${o?.nombre||`Tu clase`}${l?` a las ${l}`:``} empieza en ${d} ${d===1?`minuto`:`minutos`}. Prepará la planificación.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:c,clase_id:e.clase_id,fecha:n})}}catch(e){console.warn(`[NotifService] Error local alerts:`,e)}}async function fa(e){let t=N(),n=J.find(t=>t.id===e);if(n&&(n.estado=`leida`),la(),t&&aa(t.id),!String(e).startsWith(`local_`))try{await j.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`id`,e)}catch(e){console.warn(`[NotifService] Error al marcar leída`,e)}}async function pa(e){let t=N();if(J=J.filter(t=>t.id!==e),la(),t&&aa(t.id),String(e).startsWith(`local_`))return{success:!0};try{let{error:t}=await j.from(`notificaciones`).delete().eq(`id`,e);return t?(console.error(`[NotifService] Error al eliminar en base de datos:`,t.message),{success:!1,error:t}):{success:!0}}catch(e){return console.error(`[NotifService] Excepción al eliminar:`,e),{success:!1,error:e}}}async function ma(){let e=N();if(J.forEach(e=>{e.estado!==`leida`&&(e.estado=`leida`)}),la(),e&&aa(e.id),e)try{await j.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`profile_id`,e.id).neq(`estado`,`leida`)}catch(e){console.warn(`[NotifService] Error al marcar todas`,e)}}function ha(){return J.filter(e=>e.estado===`pendiente`||e.estado===`enviada`).length}var ga=null;function _a(){let e=N();e&&(ga||=j.channel(`notificaciones:${e.id}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${e.id}`},t=>{let n={...t.new,created_at:t.new.created_at||new Date().toISOString()};J.some(e=>e.id===n.id)||(J.unshift(n),aa(e.id),la(),ya(n),console.log(`[Realtime] Nueva notificación recibida:`,n.titulo))}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${e.id}`},t=>{let n=J.findIndex(e=>e.id===t.new.id);n!==-1&&(J[n]={...J[n],...t.new},aa(e.id),la())}).subscribe(e=>{console.log(`[Realtime] Canal notificaciones: ${e}`),e===`CHANNEL_ERROR`&&(console.warn(`[Realtime] Canal cerrado, el polling de fallback sigue activo.`),ga=null)}))}function va(){ga&&=(j.removeChannel(ga),null)}function ya(e){if(document.getElementById(`pm-notificaciones-drawer-overlay`)?.classList.contains(`open`))return;let t=document.getElementById(`pm-notif-inapp-toast`);t&&t.remove();let n=ba(e.tipo),r=document.createElement(`div`);r.id=`pm-notif-inapp-toast`,r.setAttribute(`role`,`alert`),r.setAttribute(`aria-live`,`polite`),r.innerHTML=`
    <div class="pm-iat-content">
      <div class="pm-iat-icon">${n}</div>
      <div class="pm-iat-text">
        <strong class="pm-iat-title">${e.titulo||`Nueva notificación`}</strong>
        <span class="pm-iat-msg">${e.mensaje||``}</span>
      </div>
      <button class="pm-iat-close" aria-label="Cerrar">×</button>
    </div>
  `,document.body.appendChild(r),Sa(),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add(`pm-iat-visible`))});let i=()=>{r.classList.remove(`pm-iat-visible`),setTimeout(()=>r.remove(),350)};r.querySelector(`.pm-iat-close`).addEventListener(`click`,i),r.addEventListener(`click`,e=>{e.target.classList.contains(`pm-iat-close`)||(document.getElementById(`pm-bell-btn`)?.click(),i())}),setTimeout(i,6e3)}function ba(e){return{sesion_sin_registrar:`⚠️`,recordatorio_clase:`⏰`,mensaje_admin:`📣`,tarea_vencida:`📕`,in_app:`🔔`}[e]||`🔔`}var xa=!1;function Sa(){if(xa)return;xa=!0;let e=document.createElement(`style`);e.textContent=`
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
  `,document.head.appendChild(e)}var Ca=null;function wa(){Ca===null&&(Ca=setInterval(()=>{document.visibilityState!==`hidden`&&ua()},Xi))}function Ta(){Ca!==null&&(clearInterval(Ca),Ca=null)}document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`?(ua(),wa()):Ta()});function Ea(){let e=new Date().toISOString().split(`T`)[0];J=J.filter(t=>String(t.id).startsWith(`local_`)?t.referencia_id?.includes(e):!0)}Ea(),document.visibilityState!==`hidden`&&wa();async function Da(e,{onError:t,silent:n=!1}={}){try{return await e()}catch(e){return console.error(`[safeAsync]`,e),t?t(e):n||F!==void 0&&F&&F.error(`Error inesperado: `+(e.message||e)),null}}async function Oa(e,{sesionId:t,fecha:n,maestro:r}){try{let{data:i,error:a}=await j.from(`sesiones_clase`).select(`*`).eq(`id`,t).single();if(a||!i){e.innerHTML=`<p class="pm-empty">Sesión no encontrada.</p>`;return}let o=n||i.fecha||new Date().toISOString().split(`T`)[0],s={id:t,nombre:i.actividad||`Clase Emergente`,instrumento:``};localStorage.setItem(`pm_active_clase_id`,t);let c=Array.isArray(i.asistencia)?i.asistencia:[],l=c.map(e=>e.alumno_id).filter(Boolean),u=[];if(l.length>0){let{data:e}=await j.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,l);u=e||[]}let d={};u.forEach(e=>{d[e.id]=null}),c.forEach(e=>{e.estado&&u.some(t=>t.id===e.alumno_id)&&(d[e.alumno_id]=e.estado)}),Aa(e,{clase:s,horario:null,alumnos:u,estado:d,justificaciones:{},maestro:r,fechaHoy:o,claseId:null,sesionId:t,hasConflict:!1,serverDSL:i.contenido||``,snapshots:[],salonNombre:null,rutaId:null,sesionExistenteData:i})}catch(t){console.error(`[asistenciaView] Error en sesión emergente:`,t.message,t.stack),e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${L(t.message)}</p>`}}async function ka(e,{claseId:t,fecha:n,sesionId:r}={}){let i=typeof e==`string`?document.getElementById(e):e;if(!i){console.error(`[asistenciaView] Container not found:`,e);return}i.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let a=N();if(!a){i.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}if(!t){if(r)return Oa(i,{sesionId:r,fecha:n,maestro:a,containerOrId:e});i.innerHTML=`<p class="pm-empty">No se indicó la clase.</p>`;return}localStorage.setItem(`pm_active_clase_id`,t);let o=n||new Date().toISOString().split(`T`)[0];try{let e=new Date().toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[n,r,c,l]=await Promise.all([g(),x([t]),_([t]),j.from(`sesiones_clase`).select(`*`).eq(`clase_id`,t).eq(`maestro_id`,a.id).eq(`fecha`,o).order(`borrador`,{ascending:!0}).order(`updated_at`,{ascending:!1}).limit(1)]);console.log(`[DEBUG] Finished Batch 1`);let u=n.find(e=>e.id===t);if(!u){console.log(`[DEBUG] Clase not found in misClases`),i.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Clase no encontrada.</p>`;return}let d=r.find(t=>t.dia?.toLowerCase()===e),f=(c||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>{let n=(e.instrumento_principal||``).localeCompare(t.instrumento_principal||``);return n===0?(e.nombre_completo||``).localeCompare(t.nombre_completo||``):n}),p=l.data?.[0],m=Array.isArray(p?.asistencia)?p.asistencia.map(e=>e?.alumno_id).filter(Boolean):[];if(p?.tipo===`emergente`&&m.length>0){let e=new Set(m),t=new Set(f.map(e=>e.id)),n=m.filter(e=>!t.has(e));if(n.length>0)try{let{data:e}=await j.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,n);f=f.concat(e||[])}catch(e){console.warn(`[asistencia] No se pudieron cargar alumnos extra de clase emergente:`,e)}f=f.filter(t=>e.has(t.id))}let h=p?.id||null,v=p?.updated_at||null,y=p?.contenido||``,b=u.salon?[u.salon]:[],[S,C]=await Promise.all([h?j.from(`class_session_content_snapshots`).select(`*`).eq(`session_id`,h).then(e=>e.data||[]):Promise.resolve([]),b.length>0?s(b):Promise.resolve([])]);console.log(`[DEBUG] Finished Batch 2`);let w=C.length>0?C[0].nombre:null,T=`pm_asistencia_${t||h}_${o}`,E=localStorage.getItem(`${T}_updated`),D=!1;v&&E&&new Date(v).getTime()>new Date(E).getTime()+5e3&&(D=!0);let O=null;try{let e=n?.find(e=>e.id===t)?.instrumento;if(e){let t=e.split(`,`)[0].trim().toLowerCase(),{data:n}=await j.from(`routes`).select(`id, route_versions!inner(id)`).ilike(`instrument`,`%${t}%`).eq(`route_versions.status`,`published`).limit(1).maybeSingle();O=n?.route_versions?.[0]?.id||n?.route_versions?.id||null}}catch(e){console.warn(`[asistencia] No se pudo resolver route_version_id:`,e)}let k={},A={};f.forEach(e=>{k[e.id]=null});let ee=p?.asistencia||[];if(ee.length===0&&h)try{let{data:e}=await j.from(`asistencias`).select(`alumno_id, estado`).eq(`sesion_clase_id`,h);if(e?.length>0){console.log(`[asistencia] Restaurando desde tabla asistencias:`,e.length);let t={presente:`P`,ausente:`A`,justificado:`J`,tarde:`T`};ee=e.map(e=>({alumno_id:e.alumno_id,estado:t[e.estado]??e.estado}))}}catch(e){console.warn(`[asistencia] No se pudo restaurar desde tabla asistencias:`,e)}let te={presente:`P`,ausente:`A`,justificado:`J`,tarde:`T`};ee.forEach(e=>{if(Object.prototype.hasOwnProperty.call(k,e.alumno_id)){let t=te[e.estado]??e.estado;k[e.alumno_id]=t}});let ne=[];if(h)try{ne=await j.from(`justificaciones`).select(`alumno_id`).eq(`sesion_id`,h).then(e=>e.data||[]),ne.forEach(e=>{Object.prototype.hasOwnProperty.call(k,e.alumno_id)&&(k[e.alumno_id]=`J`)})}catch(e){console.warn(`[asistencia] No se pudieron restaurar justificaciones:`,e)}Aa(i,{clase:u,horario:d,alumnos:f,estado:k,justificaciones:A,maestro:a,fechaHoy:o,claseId:t,sesionId:h,hasConflict:D,serverDSL:y,snapshots:S,salonNombre:w,rutaId:O,sesionExistenteData:p})}catch(e){console.error(`[asistenciaView] Error fatal:`,e.message,e.stack),i.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${L(e.message)}</p>`}}function Aa(e,t){let{clase:n,horario:i,alumnos:o,estado:s,justificaciones:c,maestro:l,fechaHoy:u,claseId:d,snapshots:f,serverDSL:p,hasConflict:m,salonNombre:h,rutaId:_,sesionExistenteData:v}=t,y=t.sesionId,b=[],x=`pm_asistencia_${d}_${u}`,S=p,C=null,w=Oi(),T=null;if(!document.getElementById(`pm-asist-badge-styles`)){let e=document.createElement(`style`);e.id=`pm-asist-badge-styles`,e.textContent=`
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
      /* Estilos del tour movidos a AsistenciaTour.js */
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

    <!-- Tour inyectado por AsistenciaTour.js -->

    <div class="pm-asist-root pm-animate-fade-in" style="position:relative; min-height:100vh; padding: 0;">
      ${m?`
        <div class="pm-conflict-banner">
          <i class="bi bi-exclamation-triangle"></i>
          <span>Sesión modificada externamente. Guardado como revisión.</span>
          <button id="pm-conflict-dismiss">&times;</button>
        </div>
      `:``}
      
      <div class="pm-asist-header">
        <button id="pm-asist-back" class="pm-icon-btn"><i class="bi bi-arrow-left"></i></button>
        <div style="flex:1">
          <h2 class="pm-asist-title">${L(n.nombre)}</h2>
          <p class="pm-asist-subtitle">
            ${h?`📍 ${L(h)} · `:``}
            ${i?`${De(i.hora_inicio)} – ${De(i.hora_fin)} · `:``}
            <span style="color:var(--pm-primary); font-weight:700;">${Ce(new Date(u+`T12:00:00`))}</span> · 
            ${o.length} alumnos
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
          <span class="pm-asist-progress-label" id="pm-progress-label">0/${o.length}</span>
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
          <div id="pm-curriculo-proposal-trigger" style="padding:0.5rem 0.75rem 0.75rem;">
            <button class="pm-btn pm-btn-outline" id="btn-proponer-curriculo" style="width:100%;font-size:0.82rem;">
              <i class="bi bi-stars"></i> Proponer plan curricular con IA
            </button>
          </div>
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
  `;let D=e.querySelector(`#pm-dsl-toolbar-container`),O=e.querySelector(`#pm-dsl-editor-container`),k=cr(O,{initialContent:p,onChange:e=>{S=e}});k.setContext({claseId:d});let A=dr(e,{onAceptar:e=>{k.setValue(e)}}),ee=nn(e,{onAccept:e=>{k.setValue(e)}}),te=Vi(O.parentNode,{onConfirm:async t=>{try{let n=o.map(e=>({id:e.id,nombre:e.nombre_completo||e.nombre||``,nombreCorto:(e.nombre_completo||e.nombre||``).split(` `)[0]})),{saved:r,errors:i}=await Ni({sesionId:y,claseId:d,maestroId:l.id,fechaHoy:u,progressRecords:t,alumnos:n});i.length&&console.warn(`[Progress] Errores parciales:`,i);let a=e.querySelector(`#btn-guardar`);a&&(a.style.removeProperty(`display`),a.click())}catch(t){e.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),F.error(`Error al guardar progreso: `+t.message)}},onCancel:()=>{e.querySelector(`#btn-guardar`)?.style.removeProperty(`display`)}}),ne=qi(e.querySelector(`#pm-planificacion-dropdown`)||e,{onAdopt:async({instrumento:e,nivel:t,resumen:n,pilares:r})=>{try{let{curriculo:i,allObjetivos:a}=await E({instrumento:e,nivel:t,descripcion:n,pilares:r}),{linked:o}=await Fi({claseId:d,objetivos:a}),s=o>0?`Plan creado · ${o} registro${o===1?``:`s`} vinculado${o===1?``:`s`}`:`Plan curricular creado correctamente.`;F.success(s)}catch(e){F.error(`Error al crear el plan: `+e.message)}},onCancel:()=>{}}),ie=an(D,{onInsert:(e,t,n)=>k.insertText(e,t,n),getEditorContent:()=>k.getValue(),onLoading:e=>{},onIaProposal:async e=>{},onImproveClick:async e=>{let t=D.querySelector(`#btn-generar-informe`);t&&(t.disabled=!0);try{let t=await Ne(e);A.open({original:e,improved:t})}catch(e){F.error(`Error al generar informe: `+e.message)}finally{t&&(t.disabled=!1)}},onStructureClick:async e=>{let t=D.querySelector(`#btn-ia-magic`);t&&(t.disabled=!0);try{let t=T?.getActiveIndicador(),n=await Pe(e,{presentes:o.filter(e=>s[e.id]===`P`).map(e=>e.nombre_completo),indicadorActivo:t?.nombre||null});ee.open({original:e,dsl:n})}catch(e){F.error(`Error al estructurar con IA: `+e.message)}finally{t&&(t.disabled=!1)}},onAnalyzeClick:async t=>{await Da(async()=>{let r=o.filter(e=>s[e.id]&&s[e.id]!==`A`),i=(e,t)=>{let n=e.trim().split(/\s+/),r=n[0];return t.filter(e=>e.trim().split(/\s+/)[0]===r).length>1?n.slice(0,2).join(` `):r},a=o.map(e=>e.nombre_completo||e.nombre||``),c={alumnos:o.map(e=>{let t=e.nombre_completo||e.nombre||``;return{id:e.id,nombre:t,nombreCorto:i(t,a)}}),presentes:r.map(e=>{let t=e.nombre_completo||e.nombre||``;return{id:e.id,nombre:t,nombreCorto:i(t,a)}}),tipoClase:Oe(n),instrumento:n.instrumento||``,sesionesRecientes:(f||[]).slice(-2).map(e=>e.contenido||``).filter(Boolean),indicadorActivo:T?.getActiveIndicador()?.nombre||``};e.querySelector(`#btn-guardar`)?.style.setProperty(`display`,`none`);let l=await Ie(t,c);if(!l?.progreso?.length){e.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),F!==void 0&&F&&F.warning(`La IA no detectó registros de progreso en este texto.`);return}te.open({progreso:l.progreso,resumen:l.resumen})},{onError:t=>{e.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),F!==void 0&&F&&F.error(`Error al analizar con IA: `+t.message)}})}}),M=null,ae=e.querySelector(`#pm-planificacion-card`),oe=e.querySelector(`#pm-planificacion-dropdown`),N=e.querySelector(`#pm-planificacion-nombre`);e.querySelector(`#pm-planificacion-detail`);let se=e.querySelector(`#pm-plan-list-rutas`),ce=e.querySelector(`#pm-plan-list-planificaciones`),le=e.querySelector(`#pm-planificacion-header`);le&&le.addEventListener(`click`,()=>{let e=ae.classList.toggle(`open`);oe.style.display=e?`block`:`none`}),e.querySelectorAll(`.pm-plan-tab-pill`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`.pm-plan-tab-pill`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`);let n=t.dataset.tab;se.style.display=n===`rutas`?``:`none`,ce.style.display=n===`planificaciones`?``:`none`})});function ue(t){M=t.id,localStorage.setItem(`pm_default_plan_${d}`,t.id),N&&(N.textContent=t.nombre||t.name||`Sin nombre`),ce.querySelectorAll(`.pm-plan-item`).forEach(e=>{e.classList.toggle(`active`,e.dataset.planId===t.id)}),T&&=(T.destroy(),null);let n=e.querySelector(`#pm-route-tree-container`),r=e.querySelector(`#pm-active-tema-badge`);M&&n&&(n.innerHTML=``,Le(d).then(e=>{T=Br(n,{claseId:d,rutaId:M,completedTopics:e,onIndicadorSelect:e=>{k.insertText(`[${e.nombre}] `),ie.setContext({indicadorActivo:e.nombre}),r&&(r.textContent=e.nombre,r.style.display=`inline-block`),ae.classList.remove(`open`),oe.style.display=`none`}}),b.push(()=>T.destroy())}))}let fe=e.querySelector(`#btn-manage-planning`);fe&&(fe.onclick=e=>{if(e.stopPropagation(),!M){je.open({title:`Atención`,body:`<p>Seleccioná una planificación primero para poder gestionarla.</p>`,confirmText:`Entendido`,hideCancel:!0});return}je.open({title:`Gestionar Estructura: ${N.textContent}`,size:`xl`,body:`<div id="modal-route-config-root"></div>`,saveText:`Cerrar y Actualizar`,onSave:async()=>(T&&T.refresh(),!0)});let t=document.getElementById(`modal-route-config-root`);t&&Dr(t,M)}),ae&&(async()=>{try{let e=await G.getClasses(),t=localStorage.getItem(`pm_default_plan_${d}`),r=(n.instrumento||``).toLowerCase().split(`,`).map(e=>e.trim()),i=e.filter(e=>{if(e.id===t)return!0;let n=(e.nombre||``).toLowerCase();return r.some(e=>n.includes(e))});se&&(se.innerHTML=i.length?i.map(e=>`
              <div class="pm-plan-item ${e.id===t?`active`:``}" data-plan-id="${e.id}">
                <span class="pm-plan-item-icon">📍</span>
                <span class="pm-plan-item-name">${L(e.nombre||`Ruta sin nombre`)}</span>
                ${e.id===t?`<span class="pm-tree-badge">ACTIVA</span>`:``}
              </div>`).join(``):`<div style="padding:0.5rem;font-size:0.8rem;color:var(--pm-text-muted)">No hay planes sugeridos para este instrumento</div>`,se.querySelectorAll(`.pm-plan-item`).forEach(e=>{e.addEventListener(`click`,()=>{let t=i.find(t=>t.id===e.dataset.planId);t&&ue(t)})})),ce&&(ce.innerHTML=e.map(e=>`
            <div class="pm-plan-item" data-plan-id="${e.id}">
              <span class="pm-plan-item-icon">📚</span>
              <span class="pm-plan-item-name">${L(e.nombre||e.name)}</span>
            </div>`).join(``),ce.querySelectorAll(`.pm-plan-item`).forEach(t=>{t.addEventListener(`click`,()=>{let n=e.find(e=>e.id===t.dataset.planId);n&&ue(n)})})),ae.style.display=``;let a=e.find(e=>e.id===t)||i[0]||await G.resolveSmartPlan(n);a&&ue(a)}catch(e){console.warn(`[asistencia] Error cargando planificación unificada:`,e)}})();let pe=e.querySelector(`#btn-proponer-curriculo`);pe&&(pe.onclick=async()=>{pe.disabled=!0,pe.innerHTML=`<i class="bi bi-hourglass-split"></i> Analizando...`;try{let e=await Ui(d,12);if(e.registros.length===0){F.error(`No hay registros de progreso suficientes en las últimas 12 semanas para generar una propuesta.`);return}let t=await Me(e,{instrumento:n?.instrumento||``,nivel:``,nombreClase:n?.nombre||``});ne.open({pilares:t.pilares,resumen:t.resumen,instrumento:n?.instrumento||``,nivel:``})}catch(e){F.error(`Error al generar propuesta: `+e.message)}finally{pe.disabled=!1,pe.innerHTML=`<i class="bi bi-stars"></i> Proponer plan curricular con IA`}});let me=e.querySelector(`#btn-copy-as-plan`);me&&me.addEventListener(`click`,async()=>{let e=k.getValue();vr(`create`,null,await g(),[],{clase_id:d,maestro_id:l?.id||null,maestro_nombre:l?.nombre_completo||null,contenido:e||``,fecha_inicio:u},async e=>{try{await a({...e,estado:`planificado`});let t=document.createElement(`div`);t.className=`pm-toast-success`,t.innerHTML=`
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Planificación creada exitosamente
          `,document.body.appendChild(t),setTimeout(()=>t.remove(),3e3)}catch(e){console.error(`[asistencia] Error guardando planificación:`,e),F.error(`Error al guardar la planificación: `+(e.message||e))}})}),_&&(T=Br(e.querySelector(`#pm-route-tree-container`),{claseId:d,rutaId:_,onIndicadorSelect:t=>{k.insertText(`[${t.nombre}] `),ie.setContext({indicadorActivo:t.nombre});let n=e.querySelector(`#btn-guardar-obs`);n&&(n.style.display=``)}}),b.push(()=>T.destroy())),console.log(`[DEBUG] Reached handoff section`);let he=bi();if(he&&he.claseId===d){let t=`[${he.nombre}] `;k.insertText(t),ie.setContext({indicadorActivo:he.nombre});let n=e.querySelector(`#btn-guardar-obs`);n&&(n.style.display=``);let r=e.querySelector(`#pm-dsl-editor-container`);if(r){let e=document.createElement(`div`);e.style.cssText=`
        background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;
        padding:8px 12px;margin-bottom:8px;font-size:12px;color:#1d4ed8;
        display:flex;align-items:center;gap:8px;
      `,e.innerHTML=`
        <i class="bi bi-diagram-3"></i>
        Tema cargado desde Ruta: <strong>${he.nombre.replace(/</g,`&lt;`)}</strong>
        <button onclick="this.parentElement.remove()" style="
          margin-left:auto;background:none;border:none;cursor:pointer;
          font-size:12px;color:#1d4ed8;
        ">✕</button>
      `,r.parentElement.insertBefore(e,r)}}let ge=xi(document.body,{onDelete:async({alumnoId:e,justificacionId:t,existingUrl:n})=>{if(n){let e=n.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&j.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}t&&Ei(t).catch(console.warn),s[e]=null,delete c[e],xe(e),we(),await Te(!0),xt(`Justificación eliminada.`)},onSave:async({alumnoId:e,motivo:t,evidenciaFile:n,justificacionId:r,existingUrl:i,isEdit:a})=>{let o=document.getElementById(`pm-justif-save`);o&&(o.disabled=!0);try{let o=null;if(a&&r){let e=i;if(n){if(i){let e=i.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&await j.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}let{data:t}=await j.storage.from(`documentos`).upload(`justificaciones/${Date.now()}_${Math.random().toString(36).slice(2)}.${n.name.split(`.`).pop()}`,n).catch(()=>({data:null}));if(t){let{data:n}=j.storage.from(`documentos`).getPublicUrl(t.path);e=n.publicUrl}}let{data:a,error:s}=await j.from(`justificaciones`).update({motivo:t,evidencia_url:e}).eq(`id`,r).select().single();if(s)throw s;o=a}else{y||await Te(!0,!1);let r=await wi({sesionId:y,alumnoId:e,claseId:d,fecha:u,motivo:t,creadoPor:l.id},n);if(r.error)throw r.error;o=r.data}o&&(c[e]=o),ge.close()}catch(e){console.error(`[justificacion] Error guardando:`,e),alert(`Error al guardar la justificación: `+e.message)}finally{o&&(o.disabled=!1)}},onCancel:(e,t)=>{s[e]=t,xe(e),we()}});b.push(()=>{try{ge.close()}catch{}});let _e=null,ve=e.querySelector(`#pm-draft-indicator`);if(y){_e=pi({saveFn:async e=>{y&&await mi(y,l.id,e)},debounceMs:3e4}),_e.onSaved(()=>{let e=new Date;ve.textContent=`Borrador guardado ${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`,ve.style.display=``}),k.getValue;let e=O.querySelector(`#pm-dsl-editable`);if(e){let t=e.oninput;e.oninput=function(e){t&&t.call(this,e),_e&&_e.onInput(k.getValue())}}b.push(()=>_e.destroy()),v?.borrador===!0&&hi(y,l.id).then(e=>{if(e&&e.contenido_raw&&e.contenido_raw.trim()){let t=e.updated_at?new Date(e.updated_at).toLocaleString(`es-AR`):``;confirm(`Hay un borrador guardado${t?` (${t})`:``}.\n\n¿Deseas recuperarlo?`)?(k.setValue(e.contenido_raw),S=e.contenido_raw):gi(e.id).catch(e=>console.warn(`[autoDraft] Error discarding:`,e))}}).catch(e=>console.warn(`[autoDraft] Error loading draft:`,e))}e.querySelector(`#pm-academic-tools`);let P=e.querySelector(`#btn-guardar-obs`);P&&(_&&(P.style.display=``),P.onclick=async()=>{let t=k.getValue();if(!t||!t.trim()){F.warning(`El editor está vacío. Escribe observaciones antes de guardar.`);return}if(!y){F.warning(`Primero guarda la sesión (asistencia) para poder registrar observaciones.`);return}let r=null,i=await Re(t),a=T?.getActiveIndicador();if(r=i||a,!r){F.warning(`Seleccione un indicador en la ruta antes de guardar la observación o escríbalo entre corchetes [Ejemplo].`);return}let c=e.querySelector(`#pm-active-tema-badge`);c&&r.nombre&&(c.textContent=r.nombre,c.style.display=`inline-block`),P.disabled=!0,P.textContent=`Procesando...`;try{let e=o.filter(e=>s[e.id]===`P`),i=await qr(t,r.id,e,r.nombre);if(i.error)throw Error(i.error);if(i.modo===`natural`&&i.dslGenerado&&!confirm(`📝 Texto convertido a formato estructurado:

`+i.dslGenerado+`

¿Guardar la evaluación?`)){P.disabled=!1,P.textContent=`Guardar observación`;return}if(i.missing.length>0&&!confirm(`Faltan ${i.missing.length} alumno(s) sin evaluar:\n${i.missing.join(`, `)}\n\n¿Guardar de todas formas?`)){P.disabled=!1,P.textContent=`Guardar observación`;return}if(i.evaluaciones.length>0){let{error:e}=await Gr(y,r.id,i.evaluaciones,l.id);if(e)throw e}let a={indicador_id:r.id,evaluaciones:i.evaluaciones};await _i(y,l.id,t,a,i.dslGenerado||null);let c=Xt(t);if(c.estados&&c.estados.length>0){let e=o.map(e=>({id:e.id,nombre:e.nombre_completo||e.nombre||``,nombreCorto:(e.nombre_completo||e.nombre||``).split(` `)[0]}));Pi({sesionId:y,claseId:d,maestroId:l.id,fechaHoy:u,dslText:t,alumnos:e}).then(({saved:e,errors:t})=>{t.length&&console.warn(`[Progress DSL] Errores:`,t),e.length&&ke(e,O)}).catch(e=>console.warn(`[Progress DSL] Error:`,e.message))}let f=await Di(y,d,l.id,i.evaluaciones,n.nombre||`Clase`);f.success||console.warn(`[Fase C] Fallo parcial en promoción:`,f.error),T&&await T.refresh(),k.setValue(``),S=``;let p=document.createElement(`div`);p.innerHTML=`
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <span>✅ Observación guardada exitosamente (${i.evaluaciones.length} eval.)</span>
            <span style="font-size:0.85em; opacity:0.9;">Tema detectado: <b>${r.nombre}</b></span>
          </div>
        `,p.style.cssText=`position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--pm-surface, #1e1e1e);color:#fff;padding:12px 24px;border-radius:12px;z-index:10000;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.3); border: 1px solid var(--apple-success, #22c55e);`,document.body.appendChild(p),setTimeout(()=>p.remove(),4500),P.textContent=`¡Guardado!`,setTimeout(()=>{P.textContent=`Guardar observación`,P.disabled=!1},2e3)}catch(e){console.error(`[asistencia] Error saving observation:`,e),F.error(`Error al guardar: `+(e.message||e)),P.disabled=!1,P.textContent=`Guardar observación`}});let ye=null,be=e.querySelector(`#pm-alumnos-list`);function xe(e=null){let t=ja(o,s),n=null;if(e){let t=be.querySelector(`[data-id="${e}"]`);t&&(n=t.getBoundingClientRect())}if(be.innerHTML=t.map(e=>I(e,s[e.id])).join(``),e&&n){let t=be.querySelector(`[data-id="${e}"]`),r=t.getBoundingClientRect(),i=n.top-r.top;t.animate([{transform:`translateY(${i}px)`,opacity:.7},{transform:`translateY(0)`,opacity:1}],{duration:300,easing:`cubic-bezier(0.4, 0, 0.2, 1)`})}}function I(e,t){return`
      <div class="pm-asist-item ${t?`estado-${t.toLowerCase()}`:``}" data-id="${e.id}">
        <div class="pm-asist-avatar">${e.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${L(e.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${L(e.instrumento_principal||`—`)}</span>
        </div>
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${t===`P`?`active-p`:``}" data-action="P" data-id="${e.id}">P</button>
          <button class="pm-asist-btn ${t===`J`?`active-j`:``}" data-action="J" data-id="${e.id}">J</button>
          <button class="pm-asist-btn ${t===`A`?`active-a`:``}" data-action="A" data-id="${e.id}">A</button>
        </div>
    </div>
    `}be.onclick=async t=>{let n=t.target.closest(`.pm-asist-btn`),r=t.target.closest(`.pm-asist-nombre`);if(r){let t=r.closest(`.pm-asist-item`).dataset.id,n=o.find(e=>e.id===t);if(_){ye&&ye.destroy(),ye=oi({alumno:n,rutaId:_,sessionId:y,claseId:d,fecha:u,horaInicio:i?.hora_inicio||null}),ye.open(),b.push(()=>{ye&&ye.destroy()});return}let a=f.filter(e=>e.student_id===t);if(a.length===0)try{let{academicService:e}=await Se(async()=>{let{academicService:e}=await import(`./academicService-76BH8TVA.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2,3])),n=await e.createSnapshotForStudent(y,t,u);n?(a=n,f.push(...n)):console.warn(`No se encontró planificación activa para el alumno ${t}`)}catch(e){console.error(`Error creando snapshot on-demand:`,e)}ur(e,{student:n,sessionId:y,teacherId:l.id,snapshots:a});return}if(!n)return;let{id:a,action:p}=n.dataset;if(window.navigator.vibrate&&window.navigator.vibrate(10),p===`J`){let e=o.find(e=>e.id===a);if(!e)return;if(s[a]===`J`){let t=c[a]||null;!t&&y&&(t=await Ti(y,a),t&&(c[a]=t)),ge.open(e,t,null),xt(`Editando justificación de ${e.nombre_completo}.`)}else s[a]=`J`,xe(a),we(),await Te(!0),ge.open(e,null,null),xt(`Justificación marcada para ${e.nombre_completo}.`);return}s[a]=s[a]===p?null:p,xe(a),we();let m=Object.values(s).filter(e=>e===`P`).length,h=Object.values(s).filter(e=>e===`A`).length,g=Object.values(s).filter(e=>e===`J`).length;xt(`Asistencia actualizada. ${m} presentes, ${h} ausentes, ${g} justificados.`),await Te(!0)};function we(){let t=o.length,n=Object.values(s).filter(e=>e!==null).length,r=e.querySelector(`#pm-progress-wrap`),i=e.querySelector(`#pm-progress-fill`),a=e.querySelector(`#pm-progress-label`);if(n===0){r.style.display=`none`;return}r.style.display=`flex`,i.style.width=`${n/t*100}%`,a.textContent=`${n}/${t}`}async function Te(e=!1,t=!1){C&&clearTimeout(C);let n=async()=>{let e=o.filter(e=>s[e.id]).map(e=>({alumno_id:e.id,estado:s[e.id]})),t={...y?{}:{clase_id:d},maestro_id:l.id,fecha:u,estado:`pendiente`,borrador:!0,asistencia:e||[],contenido:S||``};if(navigator.onLine)try{if(y){let{error:e}=await j.from(`sesiones_clase`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,y);if(!e){localStorage.setItem(`${x}_updated`,new Date().toISOString());return}throw e}else{let{data:e,error:n}=await j.from(`sesiones_clase`).insert([t]).select(`id`).single();if(!n&&e){y=e.id,console.log(`[asistencia] Nueva sesión creada:`,y),localStorage.setItem(`${x}_updated`,new Date().toISOString());return}throw n||Error(`No se pudo crear la sesión`)}}catch(e){console.warn(`[asistencia] Fallo operación directa, usando cola offline:`,e.message)}await de({tabla:`sesiones_clase`,operacion:y?`update`:`insert`,payload:{...y?{id:y}:{},...t}}),localStorage.setItem(`${x}_updated`,new Date().toISOString())};e?t?await n():await w.run(n):C=setTimeout(()=>{w.run(n).catch(e=>console.error(`[asistencia] Autosave error:`,e))},2e3)}let Ee=e.querySelector(`.pm-asist-actions-fixed`);if(Ee){let e=document.createElement(`button`);e.id=`btn-reporte-dia`,e.className=`pm-asist-btn-obs`,e.innerHTML=`📄 Reporte`,e.title=`Genera el Reporte Diario de Asistencia (PDF)`,e.style.flex=`1`,e.style.display=`none`,e.addEventListener(`click`,async t=>{t.preventDefault(),y&&(e.disabled=!0,e.innerHTML=`⏳...`,await Ve(y),e.disabled=!1,e.innerHTML=`📄 Reporte`)});let t=Ee.querySelector(`#btn-guardar`);Ee.insertBefore(e,t);let n=document.createElement(`button`);n.id=`btn-resumen-mes`,n.className=`pm-asist-btn-obs`,n.innerHTML=`📊 Resumen`,n.title=`Genera el Resumen Mensual de Asistencia (PDF)`,n.style.flex=`1`,n.style.display=`none`;let r=new Date;n.addEventListener(`click`,async e=>{e.preventDefault(),d&&(n.disabled=!0,n.innerHTML=`⏳...`,await ze(d,r.getFullYear(),r.getMonth()+1),n.disabled=!1,n.innerHTML=`📊 Resumen`)}),Ee.insertBefore(n,t)}e.querySelector(`#btn-guardar`).onclick=async()=>{let t=e.querySelector(`#btn-guardar`),i=t.textContent;t.textContent=`Guardando...`,t.disabled=!0,await w.run(async()=>{try{let i=o.filter(e=>s[e.id]).map(e=>({...d?{clase_id:d}:{},alumno_id:e.id,fecha:u,estado:s[e.id],registrado_por:l.id})),a=i.length>0,c=S&&S.trim().length>0;if(!a&&!c)throw Error(`Debes marcar asistencia o agregar contenido para guardar`);if(await Te(!0,!0),!y){let{data:e}=await j.from(`sesiones_clase`).select(`id`).eq(`clase_id`,d).eq(`maestro_id`,l.id).eq(`fecha`,u).maybeSingle();e&&(y=e.id)}if(a&&d)try{let e=i.map(e=>({...e,...y&&{sesion_clase_id:y}}));await r(e),console.log(`[asistencia] Registradas asistencias individuales:`,e.length)}catch(e){if(console.error(`[asistencia] Error registrando asistencias en bulk:`,e),!navigator.onLine||!y){console.warn(`[asistencia] Encolando asistencias para sync offline...`);for(let e of i)await de({tabla:`asistencias`,operacion:`upsert`,payload:{clase_id:d,alumno_id:e.alumno_id,fecha:u,estado:e.estado,registrado_por:l.id,...y?{sesion_clase_id:y}:{}}})}else throw Error(`No se pudieron registrar las asistencias individuales: `+e.message)}if(y&&(a||c)){let e=o.filter(e=>s[e.id]).map(e=>({alumno_id:e.id,estado:s[e.id]})),{error:t}=await j.from(`sesiones_clase`).update({borrador:!1,estado:`registrada`,asistencia:e,contenido:S||``,updated_at:new Date().toISOString()}).eq(`id`,y).select();if(t){console.warn(`estado "registrada" no permitido, usando fallback "cerrada":`,t.message);let{error:n}=await j.from(`sesiones_clase`).update({borrador:!1,estado:`cerrada`,asistencia:e,contenido:S||``,updated_at:new Date().toISOString()}).eq(`id`,y).select();n&&(console.warn(`Fallback "cerrada" también falló, actualizando solo borrador:`,n.message),await j.from(`sesiones_clase`).update({borrador:!1,asistencia:e,contenido:S||``,updated_at:new Date().toISOString()}).eq(`id`,y))}re(),Rr(`hoy`),Rr(`calendario`),Rr(`metricas`),ua().catch(e=>console.warn(`[asistenciaView] Error al actualizar notificaciones:`,e))}if(y){let{academicService:n}=await Se(async()=>{let{academicService:e}=await import(`./academicService-76BH8TVA.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2,3])),{createAchievementsSummaryModal:r}=await Se(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-BQVYinl0.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([4,5])),i=await n.processSessionClosure(y);i&&i.length>0?(t.textContent=`¡Logros detectados!`,t.style.background=`var(--pm-success)`,await r(e,i)):console.warn(`[asistencia] processSessionClosure devolvió 0 logros (puede que no haya progresos vinculados a esta sesión aún).`)}else console.warn(`[asistencia] No se pudo obtener sesionId para procesar logros.`);t.textContent=`✓ Guardado`,t.style.background=`var(--apple-success)`;let f=Ee?.querySelector(`#btn-reporte-dia`);f&&(f.style.display=``);let p=Ee?.querySelector(`#btn-resumen-mes`);p&&(p.style.display=``);let m=Object.values(s).filter(e=>e===`P`).length,h=Object.values(s).filter(e=>e===`A`).length;xt(`Sesión guardada exitosamente. ${m} presentes, ${h} ausentes.`);let g=document.createElement(`div`);g.className=`pm-saved-overlay`,g.innerHTML=`
        <div class="pm-saved-options">
          <div class="pm-saved-header">
            <div class="pm-saved-check-anim">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3>Sesión Guardada</h3>
            <p>¿Qué deseas hacer ahora?</p>
          </div>
          <div class="pm-saved-actions">
            <button class="pm-btn pm-btn-primary" id="btn-resumen-pedagogico">
              <i class="bi bi-bar-chart-steps"></i> Resumen pedagógico
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-editar-asistencia">
              <i class="bi bi-pencil"></i> Editar Asistencia
            </button>
            <button class="pm-btn pm-btn-primary" id="btn-reporte-dia-overlay">
              <i class="bi bi-file-earmark-pdf"></i> Reporte del día (PDF)
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-resumen-mes-overlay">
              <i class="bi bi-bar-chart-line"></i> Resumen del mes (PDF)
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-informe-ped-overlay">
              <i class="bi bi-mortarboard"></i> Informe pedagógico (PDF)
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
      `,document.body.appendChild(g);let _=g.querySelector(`#btn-resumen-pedagogico`),v=g.querySelector(`#btn-editar-asistencia`),b=g.querySelector(`#btn-compartir-correo`),x=g.querySelector(`#btn-compartir-whatsapp`),C=g.querySelector(`#btn-volver-hoy`),w=g.querySelector(`#btn-ir-calendario`),T=di();_&&(_.onclick=()=>{T.open({sesionId:y,claseNombre:n?.nombre||`Clase`,fecha:u,supabase:j})}),v&&(v.onclick=()=>{g.remove(),t.textContent=`Guardar sesión`,t.style.background=``,t.disabled=!1,t.style.display=``}),b&&(b.onclick=async()=>{let e=o.filter(e=>s[e.id]).map(e=>({alumno_id:e.id,estado:s[e.id]})),t=encodeURIComponent(`Reporte de Clase - ${n?.nombre||``} - ${u}`),r=Ae(e,S,o,n);Fe(`mailto:?subject=${t}&body=`,r,1800)}),x&&(x.onclick=async()=>{Fe(`https://wa.me/?text=`,Ae(o.filter(e=>s[e.id]).map(e=>({alumno_id:e.id,estado:s[e.id]})),S,o,n),1600)}),C&&(C.onclick=()=>{window.location.hash=`#/hoy`}),w&&(w.onclick=()=>{window.location.hash=`#/calendario`});let E=g.querySelector(`#btn-reporte-dia-overlay`);E&&(E.onclick=async()=>{E.disabled=!0,E.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`,await Ve(y),E.disabled=!1,E.innerHTML=`<i class="bi bi-file-earmark-pdf"></i> Reporte del día (PDF)`});let D=g.querySelector(`#btn-resumen-mes-overlay`);D&&(D.onclick=async()=>{D.disabled=!0,D.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;let e=new Date;await ze(d,e.getFullYear(),e.getMonth()+1),D.disabled=!1,D.innerHTML=`<i class="bi bi-bar-chart-line"></i> Resumen del mes (PDF)`});let O=g.querySelector(`#btn-informe-ped-overlay`);O&&(O.onclick=async()=>{O.disabled=!0,O.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;let e=new Date;await Be(d,e.getFullYear(),e.getMonth()+1),O.disabled=!1,O.innerHTML=`<i class="bi bi-mortarboard"></i> Informe pedagógico (PDF)`})}catch(e){console.error(`Error al guardar sesión:`,e),t.textContent=e.message||`Error al guardar`,t.style.background=`var(--pm-danger)`,t.disabled=!1,setTimeout(()=>{t.textContent=i,t.style.background=``},3e3)}})};function Oe(e){let t=(e?.nombre||``).toLowerCase();return(e?.instrumento||``).toLowerCase(),/orquesta|ensamble|ensemble|coro|ensayo/.test(t)?`ensayo_general`:/teor[ií]a|solfeo|lenguaje\s+musical/.test(t)?`teoria`:`instrumento`}function ke(e,t){if(!e||e.length===0)return;t.parentNode.querySelectorAll(`.pm-progress-feedback`).forEach(e=>e.remove());let n=[...new Set(e.slice(0,3).map(e=>e.contenido||`progreso`))].join(` · `)+(e.length>3?` y ${e.length-3} más`:``),r=document.createElement(`div`);r.className=`pm-progress-feedback`,r.innerHTML=`<i class="bi bi-check-circle-fill"></i> <span>${e.length} registro(s) guardados — ${n}</span>`,t.parentNode.insertBefore(r,t.nextSibling),setTimeout(()=>r.remove(),4200)}function Ae(e,t,n,r){if(!r)return`No hay datos de clase disponibles.`;let i=(e||[]).filter(e=>e.estado===`P`).length,a=(e||[]).filter(e=>e.estado===`A`).length,o=(e||[]).filter(e=>e.estado===`J`).length,s=`Reporte de Clase - ${r.nombre||`Sin nombre`}\n`;return s+=`Fecha: ${u||``}\n`,s+=`Instrumento: ${r.instrumento||`N/A`}\n\n`,s+=`RESUMEN DE ASISTENCIA
`,s+=`Presentes: ${i} | Ausentes: ${a} | Justificados: ${o}\n\n`,t&&t.trim()&&(s+=`CONTENIDO DE LA CLASE:\n${t}\n\n`),s+=`DETALLE DE ALUMNOS:
`,(e||[]).forEach(e=>{let t=(n||[]).find(t=>t.id===e.alumno_id)?.nombre_completo||`Alumno`,r=e.estado===`P`?`Presente`:e.estado===`A`?`Ausente`:`Justificado`;s+=`- ${t}: ${r}\n`}),s}function Fe(e,t,n=1800){if(t.length>n){let r=t.slice(0,n)+`…

[Texto truncado — el reporte completo excede el límite de caracteres]`;F.warn(`El texto se truncó (${t.length} caracteres, máximo ${n}). Usá la opción PDF para ver el reporte completo.`),window.open(e+encodeURIComponent(r),`_blank`)}else window.open(e+encodeURIComponent(t),`_blank`)}e.querySelector(`#pm-asist-back`).onclick=()=>{He.destroy();try{ge.close()}catch{}b.forEach(e=>{try{e()}catch{}}),window.location.hash=`#/hoy`},e.querySelector(`#btn-bulk-p`).onclick=async()=>{o.forEach(e=>{s[e.id]=`P`}),xe(),we(),await Te(!0),xt(`Todos los ${o.length} alumnos marcados como presentes.`)},e.querySelector(`#btn-bulk-a`).onclick=async()=>{o.forEach(e=>{s[e.id]=`A`}),xe(),we(),await Te(!0),xt(`Todos los ${o.length} alumnos marcados como ausentes.`)},xe();async function Le(e){try{let{data:t}=await j.from(`sesiones_clase`).select(`contenido`).eq(`clase_id`,e).not(`contenido`,`is`,null);if(!t)return[];let n=new Set,r=/\[(.*?)\]/g;return t.forEach(e=>{if(!e.contenido)return;let t;for(;(t=r.exec(e.contenido))!==null;)t[1]&&n.add(t[1].trim())}),Array.from(n)}catch(e){return console.warn(`[AsistenciaView] Error calculando progreso histórico:`,e),[]}}async function Re(e){if(!e||!M)return null;let t=e.match(/\[(.*?)\]/);if(!t||!t[1])return null;let n=t[1].trim().toLowerCase(),r=e=>{let t=[`se`,`hizo`,`la`,`el`,`los`,`las`,`un`,`una`,`de`,`del`,`en`,`con`,`por`,`para`,`y`,`o`,`tema`,`indicador`];return e.toLowerCase().replace(/[^\w\sáéíóúñ]/g,``).split(/\s+/).filter(e=>e.length>2&&!t.includes(e))},i=r(n);if(i.length===0)return null;try{let e=await G.getRouteHierarchy(M),t=null,a=0;for(let o of e)for(let e of o.plan_temas||[])for(let o of e.plan_objetivos||[]){let e=r(o.nombre),s=0;for(let t of i)e.some(e=>e.includes(t)||t.includes(e))&&s++;o.nombre.toLowerCase().includes(n)&&(s+=5);let c=s/(e.length||1);s>0&&c>a&&(a=c,t={id:o.id,nombre:o.nombre})}if(t)return console.log(`[asistencia] Indicador auto-resuelto con fuzzy match: '${t.nombre}' (Score: ${a.toFixed(2)})`),t}catch(e){console.warn(`[asistencia] Error en auto-resolución de indicador:`,e)}return null}let He=new gr(e);He.mount();let Ue=e.querySelector(`#pm-btn-help`);return Ue&&(Ue.onclick=()=>He.start()),()=>{console.log(`[AsistenciaView] Cleanup ejecutado por el Router`),He.destroy();try{ge.close()}catch{}b.forEach(e=>{try{e()}catch{}})}}function ja(e,t){return[...e].sort((e,n)=>{let r=t[e.id]!==null,i=t[n.id]!==null;return!r&&i?-1:r&&!i?1:0})}function Ma(e,{alumnos:t=[],onSelect:n}){let r=document.getElementById(`pm-alumno-picker-modal`);r||(r=document.createElement(`div`),r.id=`pm-alumno-picker-modal`,r.className=`pm-modal-overlay`,r.innerHTML=`
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
    `).join(``)}function c(){s(),r.classList.add(`open`)}function l(){r.classList.remove(`open`)}return a.onclick=l,o.onclick=()=>{let e=Array.from(r.querySelectorAll(`.pm-alumno-check:checked`)).map(e=>`#${e.value}`);e.length>0&&n(e.join(`, `)+` `),l()},{open:c,close:l}}async function Na(e,{maestroId:t}){e.innerHTML=`
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
  `,e.querySelector(`#eme-alumnos-chips`);let n=[];try{let{data:e}=await j.from(`alumnos_clases`).select(`alumno:alumnos(id, nombre_completo)`).eq(`activo`,!0);n=(e||[]).map(e=>e.alumno).filter(Boolean)}catch(e){console.error(e)}let r=Ma(e,{alumnos:n,onSelect:e=>{alert(`Alumnos seleccionados correctamente`)}});e.querySelector(`#btn-eme-pick-alumnos`).onclick=()=>r.open(),e.querySelector(`#btn-eme-guardar`).onclick=async()=>{let n={maestro_id:t,fecha:e.querySelector(`#eme-fecha`).value,motivo:e.querySelector(`#eme-motivo`).value,nombre_clase:e.querySelector(`#eme-nombre`).value,contenido:e.querySelector(`#eme-contenido`).value,created_at:new Date().toISOString()};if(!n.nombre_clase){alert(`Por favor ingresa un nombre para la clase.`);return}await de({tabla:`clases_emergentes`,operacion:`insert`,payload:n}),alert(`Clase emergente registrada. Redirigiendo...`),window.location.hash=`#/hoy`}}var Pa={async open(){let e=await be(),t=await P();je.open({title:`Notificaciones`,size:`md`,body:this._renderBody(e,t),saveText:`Hecho`,onShow:e=>this._initLogic(e),onSave:async e=>(await this._handleSave(e),!0)})},_renderBody(e,t){return`
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
    `},_initLogic(e){e.querySelector(`#modal-notif-test`).addEventListener(`click`,async()=>{await me()||window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Primero activa las notificaciones`,type:`warning`}}))});let t=e.querySelector(`#modal-notif-push`);t.addEventListener(`change`,async()=>{if(t.checked,t.checked){let e=await xe();e.success?this._toast(`Notificaciones activadas`,`success`):(t.checked=!1,this._toast(e.error||`Error al suscribir`,`danger`))}else (await he()).success&&this._toast(`Notificaciones desactivadas`,`info`)})},async _handleSave(e){await pe({alerta_pre_clase:e.querySelector(`#modal-notif-pre`).checked,min_antes_clase:parseInt(e.querySelector(`#modal-notif-min-antes`).value,10),alerta_post_clase:e.querySelector(`#modal-notif-post`).checked,min_post_clase_sin_registro:parseInt(e.querySelector(`#modal-notif-min-post`).value,10),alerta_24h:e.querySelector(`#modal-notif-24h`).checked,alerta_48h:!0}),this._toast(`Preferencias guardadas`,`success`)},_toast(e,t){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:t}}))}},Fa={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`,"/":`&#x2F;`};function Ia(e){return e==null?``:String(e).replace(/[&<>"'/]/g,e=>Fa[e])}var La={container:null,async init(){document.getElementById(`push-diagnostic-panel`)||(this.createPanel(),await this.checkStatus())},createPanel(){this.container=document.createElement(`div`),this.container.id=`push-diagnostic-panel`,this.container.innerHTML=`
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
    `,document.head.appendChild(e)},bindEvents(){document.getElementById(`push-diagnostic-close`).addEventListener(`click`,()=>this.close()),document.getElementById(`push-diagnostic-overlay`).addEventListener(`click`,e=>{e.target.id===`push-diagnostic-overlay`&&this.close()}),document.getElementById(`btn-enable-push`).addEventListener(`click`,()=>this.enablePush()),document.getElementById(`btn-test-push`).addEventListener(`click`,()=>this.testPush())},async checkStatus(){let e=[],t=document.getElementById(`diagnostic-details`),n=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),r=/iPhone|iPad|iPod/i.test(navigator.userAgent),i=/^((?!chrome|android).)*safari/i.test(navigator.userAgent);e.push({text:`📱 Dispositivo: ${n?r?`iOS`:`Android`:`Desktop`}`,type:`info`}),n&&i&&e.push({text:`⚠️ iOS Safari: Requiere iOS 16.4+ y agregar a pantalla de inicio`,type:`warn`});let a=ge();e.push({text:`Navegador: ${a?`✅ Compatible`:`❌ No compatible`}`,type:a?`ok`:`error`}),this.updateStatusItem(`status-browser`,a);let o=`default`;`Notification`in window&&(o=Notification.permission);let s=o===`granted`;e.push({text:`Permiso: ${o===`granted`?`✅ Otorgado`:o===`denied`?`❌ Denegado - ve a Configuración del navegador`:`⚠️ No solicitado - click en Activar abajo`}`,type:s?`ok`:`warn`}),this.updateStatusItem(`status-permission`,s,o);let c=`no-registrado`,l=!1;if(`serviceWorker`in navigator)try{let t=await navigator.serviceWorker.getRegistration(`/sw.js`);t?(c=t.active?`✅ Activo`:`⏳ Registrado`,l=!!t.active,e.push({text:`Service Worker: ${c}`,type:`ok`})):e.push({text:`Service Worker: ❌ No registrado`,type:`error`}),this.updateStatusItem(`status-serviceworker`,l)}catch(t){e.push({text:`Service Worker: ❌ Error - ${t.message}`,type:`error`}),this.updateStatusItem(`status-serviceworker`,!1)}else e.push({text:`Service Worker: ❌ No soportado`,type:`error`}),this.updateStatusItem(`status-serviceworker`,!1);let u=`no-suscrito`;if(l)try{let t=await ve();u=t.subscribed?`✅ Suscrito`:`❌ No suscrito`,e.push({text:`Suscripción: ${u}`,type:t.subscribed?`ok`:`warn`}),this.updateStatusItem(`status-subscription`,t.subscribed)}catch(t){e.push({text:`Suscripción: ❌ Error - ${t.message}`,type:`error`}),this.updateStatusItem(`status-subscription`,!1)}else e.push({text:`Suscripción: ⚠️ SW inactivo`,type:`warn`}),this.updateStatusItem(`status-subscription`,!1);return t.innerHTML=e.map(e=>`<div class="log-item log-${e.type}">${e.text}</div>`).join(``),{browserSupported:a,permOk:s,swActive:l}},updateStatusItem(e,t,n=``){let r=document.getElementById(e);r.className=`push-status-item ${t?`success`:`warning`}`;let i=r.querySelector(`.status-value`);i.textContent=t?`✓ Listo`:`⚠ Revisar`,n&&(i.textContent+=` (${n})`)},async enablePush(){let e=document.getElementById(`diagnostic-result`),t=document.getElementById(`btn-enable-push`);t.disabled=!0,t.innerHTML=`<span class="pm-spinner-sm me-2"></span> Configurando...`;try{e.className=`push-diagnostic-result info`;let t=/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent),n=/iPhone|iPad|iPod/i.test(navigator.userAgent);t&&n?e.innerHTML=`📱 iOS detectado: Se abrirá una solicitud de permiso...`:t?e.innerHTML=`📱 Android detectado: Solicitando permiso...`:e.innerHTML=`Solicitando permiso de notificaciones...`;let{granted:r,error:i}=await ye();if(!r)throw Error((i||`Permiso denegado`)+(t?`<br><br><strong>En móvil:</strong> Ve a Configuración → Safari → Notificaciones → Permitir`:``));e.innerHTML=`Registrando en el sistema de notificaciones...`;let a=await xe();if(!a.success)throw Error(a.error||`Error al suscribirse a push`);e.className=`push-diagnostic-result success`;let o=/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent),s=`✅ ¡Notificaciones push activadas!`;o&&(s+=`<br><small>💡 En móvil, agrega la app a pantalla de inicio para notificaciones completas (botón Compartir → Agregar a pantalla de inicio)</small>`),e.innerHTML=s,await this.checkStatus(),setTimeout(()=>this.testPush(),2e3)}catch(t){e.className=`push-diagnostic-result error`,e.innerHTML=`❌ ${t.message}`}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-bell me-2"></i>Activar Notificaciones Push`}},async testPush(){let e=document.getElementById(`diagnostic-result`);try{let t=await me();t.success?(e.className=`push-diagnostic-result success`,e.innerHTML=`✅ ${t.method===`serviceWorker`?`¡Notificación del sistema enviada! Deberías verla en tu escritorio.`:`Notificación enviada (modo local).`}`):(e.className=`push-diagnostic-result error`,e.innerHTML=`❌ ${Ia(t.error)}`)}catch(t){e.className=`push-diagnostic-result error`,e.innerHTML=`❌ Error: ${Ia(t.message)}`}},open(){this.init();let e=document.getElementById(`push-diagnostic-overlay`);e.style.display=`flex`;let t=document.querySelector(`#push-diagnostic-panel .push-diagnostic-card`);t&&(this._trap&&this._trap.dispose(),this._trap=Le(t,{onClose:()=>this.close()}))},close(){this._trap&&=(this._trap.dispose(),null);let e=document.getElementById(`push-diagnostic-overlay`);e&&(e.style.display=`none`)}},Y={dirty:!1,saving:!1,theme:localStorage.getItem(`portal-maestros-theme`)||`system`,pushEnabled:!1},Ra=[{key:`lunes`,label:`Lunes`},{key:`martes`,label:`Martes`},{key:`miércoles`,label:`Miércoles`},{key:`jueves`,label:`Jueves`},{key:`viernes`,label:`Viernes`},{key:`sábado`,label:`Sábado`},{key:`domingo`,label:`Domingo`}];function za(e){let t=N();if(!t){e.innerHTML=`
      <div class="pm-settings-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa.</p>
      </div>`;return}Y.dirty=!1,Y.saving=!1,Se(()=>import(`./pushService-CMJuokQ6.js`).then(e=>e.o).then(async e=>{Y.pushEnabled=(await e.getNotificationPreferences()).push_activo;let t=document.querySelector(`#btn-toggle-push-main input`);t&&(t.checked=Y.pushEnabled);let n=document.getElementById(`pm-notif-sub-badge`);n&&(n.textContent=Y.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`)}),__vite__mapDeps([6,1,3,7])),e.innerHTML=`
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
    </div>`;let n=document.getElementById(`col-izquierda`),r=document.getElementById(`col-derecha`);Ba(n,t),Va(n,t),Ja(n,t),Ha(r),Ua(r,t),Wa(r),r.insertAdjacentHTML(`beforeend`,`<div id="pm-collaboration-container"></div>`),Ga(r),Ka(r),no(t),Za(t),ro(),Se(async()=>{let{getPermisos:e,solicitarPermiso:t}=await import(`./permisoService-B2O2fSHa.js`).then(e=>e.n);return{getPermisos:e,solicitarPermiso:t}},__vite__mapDeps([8,1,9,3])).then(async({getPermisos:e,solicitarPermiso:n})=>{try{let r=await e(t.id),i=document.getElementById(`pm-collaboration-container`);i&&qa(i,r,t.id,n)}catch(e){console.warn(`[PerfilView] Error cargando permisos de colaboración:`,e.message)}})}function Ba(e,t){let n=we(t.nombre_completo);e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-profile-hero" aria-label="Información del perfil">
      <div class="pm-profile-hero__content">
        <div class="pm-settings-avatar">
          ${t.avatar_url?`<img src="${L(t.avatar_url)}" alt="Avatar" class="pm-settings-avatar__img">`:`<div class="pm-settings-avatar__placeholder" aria-hidden="true">${L(n)}</div>`}
          <button class="pm-settings-avatar__edit" id="btnCambiarAvatar" title="Cambiar foto" aria-label="Cambiar foto de perfil">
            <i class="bi bi-camera" aria-hidden="true"></i>
          </button>
        </div>
        <div class="pm-profile-hero__info">
          <h2 class="pm-profile-hero__name">${L(t.nombre_completo)}</h2>
          <p class="pm-profile-hero__email">${L(t.email)}</p>
          ${t.especialidad?`
            <span class="chip-apple active" aria-label="Especialidad: ${L(t.especialidad)}">
              <i class="bi bi-mortarboard" aria-hidden="true"></i> ${L(t.especialidad)}
            </span>`:``}
        </div>
      </div>
    </section>`)}function Va(e,t){e.insertAdjacentHTML(`beforeend`,`
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
          <input type="text" class="input-apple" id="perfilNombre" value="${L(t.nombre_completo)}" placeholder="Tu nombre">
        </div>
        <div class="pm-settings-field">
          <label for="perfilTelefono" class="apple-caption">Teléfono</label>
          <input type="tel" class="input-apple" id="perfilTelefono" value="${L(t.tlf||t.telefono||``)}" placeholder="809-000-0000" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
        </div>
        <div class="pm-settings-field">
          <label for="perfilEspecialidad" class="apple-caption">Especialidad</label>
          <input type="text" class="input-apple" id="perfilEspecialidad" value="${L(t.especialidad||``)}" placeholder="Ej. Violín">
        </div>
      </div>
      <div class="pm-settings-actions">
        <button class="btn-apple-primary" id="btnGuardarPerfil" disabled>
          <i class="bi bi-check2" aria-hidden="true"></i>
          <span>Guardar Cambios</span>
        </button>
      </div>
    </section>`)}function Ha(e){e.insertAdjacentHTML(`beforeend`,`
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
    </section>`)}function Ua(e,t){let n=ge(),r=n?`<span class="pm-badge-sub" id="pm-notif-sub-badge" aria-live="polite" aria-atomic="true">${Y.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`}</span>`:``;e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="notif-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-bell pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 id="notif-title" class="pm-settings-section__title">Notificaciones</h3>
          <p class="pm-settings-section__desc">Gestiona tus alertas y avisos</p>
        </div>
        <label class="pm-apple-switch" id="btn-toggle-push-main" aria-label="Activar notificaciones push">
          <input type="checkbox" ${Y.pushEnabled?`checked`:``}>
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
        <button class="btn-apple-utility" id="btn-push-diagnostic">
          <i class="bi bi-broadcast"></i> Diagnosticar
        </button>
      </div>
      ${n?``:`<p class="apple-caption mt-2" style="color:var(--pm-danger)">Push no soportado en este navegador.</p>`}
    </section>`)}function Wa(e){e.insertAdjacentHTML(`beforeend`,`
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
    </section>`)}function Ga(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section" aria-labelledby="install-title" id="pm-install-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-phone-fill pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 id="install-title" class="pm-settings-section__title">Instalar App</h3>
          <p class="pm-settings-section__desc">Acceso rápido desde tu dispositivo</p>
        </div>
      </div>
      <div id="pm-install-body">
        <p style="font-size:0.82rem;color:var(--pm-text-muted);margin:0 0 0.75rem;">
          Instalá el portal como aplicación nativa para usarlo sin navegador, con acceso offline y notificaciones push.
        </p>
        <div class="pm-settings-actions-row">
          <button class="btn-apple-primary w-100" id="pm-btn-install-profile" style="gap:0.5rem;">
            <i class="bi bi-download"></i> Instalar en este dispositivo
          </button>
        </div>
        <p id="pm-install-note" class="pm-install-note" style="display:none;"></p>
      </div>
    </section>`);let t=document.getElementById(`pm-btn-install-profile`),n=document.getElementById(`pm-install-note`);if(window.matchMedia(`(display-mode: standalone)`).matches||window.navigator.standalone===!0||localStorage.getItem(`pwa-installed`)===`true`){t.innerHTML=`<i class="bi bi-check-circle-fill"></i> App ya instalada`,t.disabled=!0,t.style.opacity=`0.6`;return}t?.addEventListener(`click`,()=>{window.pwaInstaller?window.pwaInstaller.promptInstall():(n.style.display=`block`,n.innerHTML=`
        <strong>Instalación manual:</strong><br>
        • <b>Chrome/Edge (Android/PC):</b> Menú ⋮ → "Instalar app"<br>
        • <b>Safari (iPhone/iPad):</b> Compartir <i class="bi bi-box-arrow-up"></i> → "Añadir a pantalla inicio"<br>
        • <b>Firefox:</b> no admite PWA nativa.`)}),window.addEventListener(`beforeinstallprompt`,()=>{t&&(t.disabled=!1)},{once:!0})}function Ka(e){e.insertAdjacentHTML(`beforeend`,`
    <section class="card-apple pm-settings-section pm-section-danger" aria-labelledby="sesion-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-shield-lock pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 id="sesion-title" class="pm-settings-section__title">Seguridad</h3>
          <p class="pm-settings-section__desc">Cerrar sesión en este equipo</p>
        </div>
        <button class="btn-apple-secondary" id="btnCerrarSesion" style="border-color:var(--pm-danger);color:var(--pm-danger)">Salir</button>
      </div>
    </section>`)}function qa(e,t,n,r){let i=t?.solicitud_actual,a=i?.solicita_alumnos||!1,o=i?.solicita_clases||!1,s=i?.estado||null;e.innerHTML=`
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
  `,e.querySelectorAll(`.pm-collab-request-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{let i=t.dataset.key;t.disabled=!0;let a=t.innerHTML;t.innerHTML=`<span class="pm-settings-spinner"></span> Enviando...`;try{await r(n,i),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Solicitud enviada correctamente. Esperando aprobación admin.`,type:`success`}}));let{getPermisos:t}=await Se(async()=>{let{getPermisos:e}=await import(`./permisoService-B2O2fSHa.js`).then(e=>e.n);return{getPermisos:e}},__vite__mapDeps([8,1,9,3]));qa(e,await t(n),n,r)}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al enviar solicitud: `+e.message,type:`danger`}})),t.disabled=!1,t.innerHTML=a}})}),e.querySelectorAll(`.pm-collab-action-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.route;t===`registrar-alumno`?window.router&&window.router.navigate(`registrar-alumno`):t===`gestionar-clases`&&window.router&&window.router.navigate(`gestionar-clases`)})})}function Ja(e,t){let n=t.disponibilidad||{},r=!t.especialidad||!t.disponibilidad||Object.keys(t.disponibilidad).length===0;e.insertAdjacentHTML(`beforeend`,`
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
        ${Ra.map(e=>Ya(e.key,n[e.key]||[],e.label)).join(``)}
      </div>
    </section>`)}function Ya(e,t,n){let r=t.length>0;return`
    <div class="pm-avail-dia ${r?`open`:``}" data-dia="${e}" role="listitem">
      <button class="pm-avail-dia__header" aria-expanded="${r?`true`:`false`}" aria-controls="pm-avail-body-${e}" data-dia="${e}">
        <span class="pm-avail-dia__label">${n}</span>
        <span class="pm-avail-dia__count">${t.length} franja${t.length===1?``:`s`}</span>
        <i class="bi bi-chevron-down pm-avail-dia__arrow" aria-hidden="true"></i>
      </button>
      <div class="pm-avail-dia__body" id="pm-avail-body-${e}">
        <div class="pm-avail-franjas" id="pm-avail-franjas-${e}">
          ${t.map((t,n)=>Xa(e,n,t)).join(``)}
        </div>
        <button class="btn-apple-utility btn-apple-sm pm-avail-add-btn" data-dia="${e}">
          <i class="bi bi-plus-lg" aria-hidden="true"></i> Agregar franja
        </button>
      </div>
    </div>`}function Xa(e,t,n){return`
    <div class="pm-avail-franja" data-dia="${e}" data-index="${t}">
      <input type="time" class="pm-apple-time" value="${n.inicio||`08:00`}" data-field="inicio" aria-label="Hora inicio">
      <span>a</span>
      <input type="time" class="pm-apple-time" value="${n.fin||`12:00`}" data-field="fin" aria-label="Hora fin">
      <button class="pm-avail-franja__del" aria-label="Eliminar franja"><i class="bi bi-trash" aria-hidden="true"></i></button>
    </div>`}function Za(e){document.querySelectorAll(`#perfilNombre, #perfilTelefono, #perfilEspecialidad, .pm-apple-time`).forEach(e=>{e.addEventListener(`input`,()=>{Y.dirty=!0;let e=document.getElementById(`btnGuardarPerfil`);e&&(e.disabled=!1)})}),document.getElementById(`btnGuardarPerfil`)?.addEventListener(`click`,()=>Qa(e)),document.getElementById(`btnCerrarSesion`)?.addEventListener(`click`,eo),document.getElementById(`btnCambiarAvatar`)?.addEventListener(`click`,()=>{window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Cambio de avatar disponible próximamente`,type:`info`}}))});let t=document.querySelector(`#btn-toggle-push-main input`);t?.addEventListener(`change`,async e=>{if(t.disabled=!0,t.checked){let e=await xe();e.success?(Y.pushEnabled=!0,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificaciones activadas`,type:`success`}}))):(t.checked=!1,Y.pushEnabled=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e.error||`Error al activar`,type:`danger`}})))}else await he(),Y.pushEnabled=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificaciones desactivadas`,type:`info`}}));t.disabled=!1;let n=document.getElementById(`pm-notif-sub-badge`);n&&(n.textContent=Y.pushEnabled?`✅ Suscripción activa`:`⏸ Pausada`)}),document.getElementById(`btn-abrir-config-notif`)?.addEventListener(`click`,()=>Pa.open()),document.getElementById(`btn-push-diagnostic`)?.addEventListener(`click`,()=>La.open()),document.getElementById(`btn-probar-notificacion`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`btn-probar-notificacion`);e.disabled=!0,e.innerHTML=`<span class="pm-settings-spinner"></span> Enviando...`;let t=await me();t.success?(e.innerHTML=`<i class="bi bi-check2"></i> Notificación enviada`,setTimeout(()=>{e.innerHTML=`<i class="bi bi-send"></i> Probar notificación`,e.disabled=!1},2e3)):(e.innerHTML=`<i class="bi bi-exclamation-triangle"></i> Error`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:t.error||`No se pudo enviar notificación de prueba. Verifica los permisos.`,type:`danger`}})),setTimeout(()=>{e.innerHTML=`<i class="bi bi-send"></i> Probar notificación`,e.disabled=!1},2e3))}),document.getElementById(`pm-theme-light`)?.addEventListener(`click`,()=>to(`light`)),document.getElementById(`pm-theme-dark`)?.addEventListener(`click`,()=>to(`dark`)),document.getElementById(`pm-theme-system`)?.addEventListener(`click`,()=>to(`system`)),document.getElementById(`pm-btn-ver-ausencias`)?.addEventListener(`click`,async()=>{let{ausenciasPanel:e}=await Se(async()=>{let{ausenciasPanel:e}=await import(`./ausenciasPanel-Z45kwhVa.js`);return{ausenciasPanel:e}},__vite__mapDeps([10,3,11,7,5,12,1,13]));e.open()}),document.getElementById(`pm-btn-solicitar-ausencia`)?.addEventListener(`click`,()=>Re.open()),document.querySelectorAll(`.pm-avail-dia__header`).forEach(e=>{e.addEventListener(`click`,()=>{e.dataset.dia;let t=e.closest(`.pm-avail-dia`),n=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,!n),t.classList.toggle(`open`,!n)})}),document.querySelectorAll(`.pm-avail-add-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.dia,n=e.closest(`.pm-avail-dia`),r=document.getElementById(`pm-avail-franjas-${t}`),i=r.querySelectorAll(`.pm-avail-franja`).length;r.insertAdjacentHTML(`beforeend`,Xa(t,i,{inicio:`08:00`,fin:`12:00`})),n.classList.add(`open`),n.querySelector(`.pm-avail-dia__header`).setAttribute(`aria-expanded`,`true`),Y.dirty=!0,document.getElementById(`btnGuardarPerfil`).disabled=!1})}),document.addEventListener(`click`,e=>{let t=e.target.closest(`.pm-avail-franja__del`);t&&(t.closest(`.pm-avail-franja`).remove(),Y.dirty=!0,document.getElementById(`btnGuardarPerfil`).disabled=!1)})}async function Qa(n){let r=document.getElementById(`perfilNombre`).value.trim(),i=t(document.getElementById(`perfilTelefono`).value.trim())||document.getElementById(`perfilTelefono`).value.trim(),a=document.getElementById(`perfilEspecialidad`).value.trim(),o=$a();if(!r){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`El nombre es obligatorio`,type:`danger`}}));return}Y.saving=!0;let s=document.getElementById(`btnGuardarPerfil`),c=s.innerHTML;s.disabled=!0,s.innerHTML=`<span class="pm-settings-spinner"></span><span>Guardando...</span>`;try{let t=await e(n.id,o);if(!t.success){let e=t.errors.join(`
`);throw Error(e)}let{error:s}=await j.from(`maestros`).update({nombre_completo:r,tlf:i,especialidad:a}).eq(`id`,n.id);if(s)throw s;let c={...n,nombre_completo:r,nombre:r,telefono:i,tlf:i,especialidad:a,disponibilidad:o};localStorage.setItem(se,JSON.stringify(c)),Y.dirty=!1,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Perfil actualizado`,type:`success`}})),window.pwaInstaller&&window.pwaInstaller.evaluateInsights()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al guardar: `+e.message,type:`danger`}}))}finally{Y.saving=!1,s.disabled=!1,s.innerHTML=c}}function $a(){let e={};return Ra.forEach(({key:t})=>{let n=[];document.querySelectorAll(`[data-dia="${t}"].pm-avail-franja`).forEach(e=>{let t=e.querySelector(`[data-field="inicio"]`)?.value,r=e.querySelector(`[data-field="fin"]`)?.value;t&&r&&n.push({inicio:t,fin:r})}),e[t]=n}),e}function eo(){je.open({title:`¿Cerrar Sesión?`,size:`sm`,body:`
      <div style="text-align:center; padding:1rem 0;">
        <i class="bi bi-box-arrow-right" style="font-size:2.5rem;color:var(--pm-danger);opacity:0.8;"></i>
        <p style="margin-top:1rem;">¿Estás seguro que quieres salir?</p>
      </div>`,saveText:`Salir`,cancelText:`Cancelar`,onSave:async()=>(await M(),window.location.reload(),!0)})}function to(e){let t=e===`system`?window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`:e;document.documentElement.setAttribute(`data-bs-theme`,t),document.documentElement.setAttribute(`data-portal-theme`,t),document.documentElement.classList.toggle(`pm-dark`,t===`dark`),document.querySelectorAll(`.pm-theme-opt`).forEach(t=>{t.setAttribute(`aria-checked`,t.dataset.theme===e?`true`:`false`),t.classList.toggle(`active`,t.dataset.theme===e)}),localStorage.setItem(`portal-maestros-theme`,e),Y.theme=e}function no(e){let t=!e.especialidad||!e.disponibilidad||Object.keys(e.disponibilidad||{}).length===0,n=document.getElementById(`pm-banner-perfil-incompleto`);n&&(t?(n.style.display=`block`,n.innerHTML=`
      <div class="pm-profile-alert__inner">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        <div><strong>Completa tu perfil</strong><p>Agrega tu especialidad y disponibilidad horaria.</p></div>
      </div>`):n.style.display=`none`)}function ro(){document.querySelectorAll(`.card-apple`).forEach((e,t)=>{e.style.opacity=`0`,e.style.transform=`translateY(12px)`,setTimeout(()=>{e.style.transition=`opacity 0.4s ease, transform 0.4s ease`,e.style.opacity=`1`,e.style.transform=`translateY(0)`},50*t)})}var io=`
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

  /* Lista alumnos/clases en gestionAlumnosClasesView */
  .pgac-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.6rem;
  }
  .pgac-list-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.5rem 0.6rem;
    background: var(--pm-surface-2);
    border-radius: 8px;
    border: 1px solid var(--pm-border);
    transition: background 0.15s;
  }
  .pgac-list-item:hover { background: var(--pm-border); }
  .pgac-list-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(59,130,246,0.15);
    color: var(--pm-primary, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .pgac-list-avatar--teal {
    background: rgba(20,184,166,0.15);
    color: #14b8a6;
  }
  .pgac-list-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }
  .pgac-list-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--pm-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pgac-list-sub {
    font-size: 0.72rem;
    color: var(--pm-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Nota instalación manual */
  .pm-install-note {
    font-size: 0.78rem;
    color: var(--pm-text-muted);
    background: var(--pm-surface-2);
    border: 1px solid var(--pm-border);
    border-radius: 8px;
    padding: 0.65rem 0.85rem;
    margin-top: 0.65rem;
    line-height: 1.6;
  }
`;if(!document.getElementById(`pm-avail-styles`)){let e=document.createElement(`style`);e.id=`pm-avail-styles`,e.textContent=io,document.head.appendChild(e)}async function ao(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=N();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let n=await G.getClasses(),{data:r}=await j.from(`clases`).select(`id, nombre, instrumento`).eq(`maestro_id`,t.id).order(`nombre`),i=async(e=null)=>{if(!e)return`<p class="pm-empty">Seleccioná una clase para ver su ruta académica.</p>`;let t=await G.getRouteHierarchy(e);if(!t||t.length===0)return`<p class="pm-empty">Esta clase aún no tiene una ruta configurada.</p>`;let n=e=>({ESCALA:`🎼`,ARPEGIO:`🎹`,MANO_IZQ:`✋`,ARCO:`🎻`,SONIDO:`🔊`,AFINACION:`🎵`,TECNICA:`⚙️`,REPERTORIO:`📖`})[e]||`•`,r=e=>e?`var(--pm-danger)`:`var(--pm-primary)`;return`
        <div class="pm-route-niveles">
          ${t.map(e=>`
            <div class="pm-route-nivel expanded">
              <div class="pm-nivel-toggle" data-level="${e.id}">
                <div class="pm-nivel-num">${e.numero_nivel}</div>
                <div class="pm-nivel-info">
                  <span class="pm-nivel-name">${L(e.nombre)}</span>
                  <span class="pm-nivel-obj">${L(e.objetivo_general||`Objetivo no especificado`)}</span>
                </div>
                <i class="bi bi-chevron-down pm-nivel-arrow"></i>
              </div>
              <div class="pm-nivel-nodos">
                ${(e.plan_temas||[]).map(e=>`
                  <div class="pm-nodo-card ${e.es_critico?`critical`:``}">
                    <div class="pm-nodo-icon" style="color: ${r(e.es_critico)}">${n(e.tipo)}</div>
                    <div class="pm-nodo-info">
                      <span class="pm-nodo-name">${L(e.nombre)}</span>
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
              ${n?.map(e=>`<option value="${e.id}">${L(e.nombre||e.name||`Sin nombre`)}</option>`).join(``)||``}
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
    `;let a=e.querySelector(`#pm-planif-clase-select`),o=e.querySelector(`#pm-route-container`);a&&o&&(a.onchange=async()=>{o.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`,o.innerHTML=await i(a.value),o.querySelectorAll(`.pm-nivel-toggle`).forEach(e=>{e.onclick=()=>{e.closest(`.pm-route-nivel`).classList.toggle(`expanded`)}})});let s=e.querySelectorAll(`.pm-tab-btn`),c=e.querySelectorAll(`.pm-tab-pane`);s.forEach(t=>{t.onclick=()=>{s.forEach(e=>e.classList.remove(`active`)),c.forEach(e=>{e.classList.remove(`active`),e.style.display=`none`}),t.classList.add(`active`);let n=t.getAttribute(`data-tab`),r=e.querySelector(`#${n}`);r&&(r.classList.add(`active`),r.style.display=`block`)}});let l=localStorage.getItem(`pm_active_clase_id`),u=null;if(l){let e=r?.find(e=>e.id===l);if(e){let t=n.find(t=>e.nombre.toLowerCase().includes(t.nombre.toLowerCase())||t.nombre.toLowerCase().includes(e.nombre.toLowerCase()));t&&(u=t.id)}}!u&&n&&n.length>0&&(u=n[0].id),u&&a&&o&&(a.value=u,o.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`,i(u).then(e=>{o.innerHTML=e,o.querySelectorAll(`.pm-nivel-toggle`).forEach(e=>{e.onclick=()=>{e.closest(`.pm-route-nivel`).classList.toggle(`expanded`)}})}));let d=e.querySelector(`#pm-route-config-root`);d&&Dr(d,u);let f=e.querySelector(`#pm-btn-import-ia`),p=e.querySelector(`#pm-import-file`),m=e.querySelector(`#pm-import-status`),h=e.querySelector(`#pm-import-status-text`);f&&p&&(f.onclick=()=>p.click(),p.onchange=async t=>{let n=t.target.files[0];if(n){f.disabled=!0,m.style.display=`flex`,h.textContent=`Iniciando... 0%`;try{let{parsePlanningFile:t}=await Se(async()=>{let{parsePlanningFile:e}=await import(`./planningParserService-D5EOk4om.js`);return{parsePlanningFile:e}},__vite__mapDeps([14,15,3])),{AppModal:r}=await Se(async()=>{let{AppModal:e}=await import(`./AppModal-DIPPctm9.js`).then(e=>e.n);return{AppModal:e}},__vite__mapDeps([12,1])),i=await t(n,e=>{h.textContent=`Analizando... ${e}%`});h.textContent=`Estructurando con IA...`;let a=oo(i,await G.getClasses()||[]);r.open({title:`Previsualización de Importación IA`,size:`lg`,saveText:`Confirmar e Importar`,body:a,onSave:async t=>{try{let n=t.querySelector(`#preview-class-selector`).value,a=n;if(n===`NEW`){let e=t.querySelector(`#preview-class-name`).value.trim();if(!e)return alert(`Asigná un nombre.`),!1;h.textContent=`Creando clase...`,a=(await G.addClass(e)).id}return t.querySelectorAll(`.preview-nivel-input`).forEach(e=>{i.niveles[e.dataset.nIdx].nombre=e.value}),t.querySelectorAll(`.preview-tema-input`).forEach(e=>{i.niveles[e.dataset.nIdx].temas[e.dataset.tIdx].nombre=e.value}),t.querySelectorAll(`.preview-obj-input`).forEach(e=>{i.niveles[e.dataset.nIdx].temas[e.dataset.tIdx].objetivos[e.dataset.oIdx].nombre=e.value}),h.textContent=`Importando...`,await G.importStructure(a,i),r.open({title:`¡Éxito!`,body:`<p>La planificación ha sido importada correctamente.</p>`,confirmText:`Genial`,hideCancel:!0}),ao(e),!0}catch(e){return r.open({title:`Error de Importación`,body:`<p>No se pudo importar la planificación: ${e.message}</p>`,confirmText:`Cerrar`,hideCancel:!0}),!1}},onCancel:()=>{m.style.display=`none`,f.disabled=!1}})}catch(e){je.open({title:`Error inesperado`,body:`<p>${e.message}</p>`,confirmText:`Cerrar`,hideCancel:!0})}finally{f.disabled=!1,m.style.display=`none`,p.value=``}}})}catch(t){e.innerHTML=`<p class="pm-empty">Error: ${t.message}</p>`}return()=>{console.log(`[PlanificacionView] Cleanup ejecutado`)}}function oo(e,t=[]){let n=e.niveles||[],r=0,i=0;return n.forEach(e=>{r+=(e.temas||[]).length,e.temas?.forEach(e=>i+=(e.objetivos||[]).length)}),`
    <div class="pm-import-preview">
      <div style="margin-bottom:1.5rem; padding:1rem; background:var(--pm-surface-2); border-radius:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:10px;">¿DÓNDE IMPORTAR?</label>
        <select id="preview-class-selector" class="pm-input" onchange="document.getElementById('new-class-name-wrapper').style.display = (this.value === 'NEW' ? 'block' : 'none')">
          <option value="NEW">-- [ + ] CREAR NUEVA CLASE --</option>
          ${t.map(e=>`<option value="${e.id}">Añadir a: ${L(e.nombre||e.name)}</option>`).join(``)}
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
              <input type="text" class="preview-nivel-input pm-input" value="${L(e.nombre)}" data-n-idx="${t}" />
            </div>
            <div style="padding:0.5rem;">
              ${(e.temas||[]).map((e,n)=>`
                <div style="margin-bottom:0.5rem; padding-left:0.5rem; border-left:2px solid var(--pm-primary);">
                  <input type="text" class="preview-tema-input pm-input" value="${L(e.nombre)}" data-n-idx="${t}" data-t-idx="${n}" style="font-size:0.8rem;" />
                  ${(e.objetivos||[]).map((e,r)=>`
                    <input type="text" class="preview-obj-input pm-input" value="${L(e.nombre)}" data-n-idx="${t}" data-t-idx="${n}" data-o-idx="${r}" style="font-size:0.75rem; margin-top:2px;" />
                  `).join(``)}
                </div>
              `).join(``)}
            </div>
          </div>
        `).join(``)}
      </div>
    </div>
  `}var so=`alumno_plan_entradas`;async function co(e){let{data:t,error:n}=await j.from(so).select(`id, tipo, titulo, descripcion, nivel_referencia, objetivo_id, sesion_id, created_at, maestro_id`).eq(`alumno_id`,e).order(`created_at`,{ascending:!1});if(n)throw Error(n.message);return t||[]}async function lo(e){if(!e.titulo?.trim())throw Error(`titulo requerido`);let{data:t,error:n}=await j.from(so).insert({alumno_id:e.alumno_id,maestro_id:e.maestro_id,tipo:e.tipo,titulo:e.titulo.trim(),descripcion:e.descripcion?.trim()||null,nivel_referencia:e.nivel_referencia||null,objetivo_id:e.objetivo_id||null,sesion_id:e.sesion_id||null}).select().single();if(n)throw Error(n.message);return t}async function uo(e){let{error:t}=await j.from(so).delete().eq(`id`,e);if(t)throw Error(t.message)}var fo={diagnostico:{label:`Diagnóstico`,icon:`🔍`,color:`#6366f1`,bg:`#6366f115`},logro:{label:`Logro`,icon:`✅`,color:`#16a34a`,bg:`#16a34a15`},en_progreso:{label:`En progreso`,icon:`📈`,color:`#2563eb`,bg:`#2563eb15`},dificultad:{label:`Dificultad`,icon:`⚠️`,color:`#dc2626`,bg:`#dc262615`},objetivo:{label:`Objetivo`,icon:`🎯`,color:`#d97706`,bg:`#d9770615`}},po=[`diagnostico`,`logro`,`en_progreso`,`dificultad`,`objetivo`],mo=class{constructor({container:e,alumnoId:t,maestroId:n}){this._container=e,this._alumnoId=t,this._maestroId=n,this._entries=[],this._formOpen=!1}async init(){this._container.innerHTML=`<div class="pm-loading-zen"><div class="pm-pulse"></div></div>`,await this._load(),this._render()}async _load(){this._entries=await co(this._alumnoId)}_render(){this._container.innerHTML=this._buildHTML(),this._attachEvents()}_buildHTML(){let e=this._entries.length>0,t=this._entries.some(e=>e.tipo===`diagnostico`);return`
      <div class="pe-panel">
        ${this._buildToolbar(t)}
        ${e?this._buildTimeline():this._buildEmpty()}
        ${this._formOpen?this._buildForm(t):``}
      </div>
      ${this._buildStyles()}
    `}_buildToolbar(e){return`
      <div class="pe-toolbar">
        <span class="pe-toolbar__count">${this._entries.length} entrada${this._entries.length===1?``:`s`}</span>
        <button class="pe-btn pe-btn-primary" data-testid="pe-btn-add" data-action="open-form">
          <span>+</span>
          ${e?`Nueva entrada`:`Registrar diagnóstico`}
        </button>
      </div>
    `}_buildEmpty(){return`
      <div class="pe-empty" data-testid="pe-empty">
        <span style="font-size:2rem;">📋</span>
        <p>Sin entradas registradas.</p>
        <p style="font-size:0.78rem;color:var(--pm-text-muted);">
          Comenzá con un <strong>diagnóstico inicial</strong> para documentar el nivel actual del alumno.
        </p>
      </div>
    `}_buildTimeline(){return`
      <div class="pe-timeline">
        ${this._entries.map(e=>this._buildEntry(e)).join(``)}
      </div>
    `}_buildEntry(e){let t=fo[e.tipo]||fo.logro,n=new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`});return`
      <div class="pe-entry" data-testid="pe-entry" data-id="${e.id}">
        <div class="pe-entry__dot" style="background:${t.color}"></div>
        <div class="pe-entry__body">
          <div class="pe-entry__header">
            <span class="pe-badge" data-testid="pe-tipo-badge" style="color:${t.color};background:${t.bg}">
              ${t.icon} ${t.label}
            </span>
            <span class="pe-entry__date">${n}</span>
            <button class="pe-btn-icon pe-btn-delete" data-action="delete" data-id="${e.id}" title="Eliminar">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
          <p class="pe-entry__titulo" data-testid="pe-entry-titulo">${L(e.titulo)}</p>
          ${e.descripcion?`<p class="pe-entry__desc">${L(e.descripcion)}</p>`:``}
          ${e.nivel_referencia?`<span class="pe-nivel">${e.nivel_referencia}</span>`:``}
        </div>
      </div>
    `}_buildForm(e){let t=e?`logro`:`diagnostico`;return`
      <div class="pe-form-overlay">
        <div class="pe-form">
          <div class="pe-form__header">
            <strong>${e?`Nueva entrada`:`Diagnóstico inicial`}</strong>
            <button class="pe-btn-icon" data-action="close-form"><i class="bi bi-x-lg"></i></button>
          </div>

          <label class="pe-label">Tipo</label>
          <select class="pe-select" id="pe-tipo">
            ${po.map(e=>`
              <option value="${e}" ${e===t?`selected`:``}>${fo[e].icon} ${fo[e].label}</option>
            `).join(``)}
          </select>

          <label class="pe-label">Título <span style="color:var(--pm-danger)">*</span></label>
          <input class="pe-input" id="pe-titulo" type="text" maxlength="200"
            placeholder="${e?`Ej: Dominó escala de Do mayor`:`Ej: Conoce posición 1 en violín`}" />

          <label class="pe-label">Descripción (opcional)</label>
          <textarea class="pe-textarea" id="pe-descripcion" rows="3"
            placeholder="Detalles, contexto, observaciones del maestro..."></textarea>

          <label class="pe-label">Nivel de referencia</label>
          <select class="pe-select" id="pe-nivel">
            <option value="">— Sin especificar —</option>
            <option value="inicial">Inicial</option>
            <option value="basico">Básico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

          <div class="pe-form__actions">
            <button class="pe-btn pe-btn-ghost" data-action="close-form">Cancelar</button>
            <button class="pe-btn pe-btn-primary" data-action="save-entry" id="pe-save-btn">
              Guardar
            </button>
          </div>
        </div>
      </div>
    `}_buildStyles(){return`
      <style>
        .pe-panel { display:flex; flex-direction:column; gap:0.75rem; }
        .pe-toolbar { display:flex; align-items:center; justify-content:space-between; }
        .pe-toolbar__count { font-size:0.75rem; color:var(--pm-text-muted); }
        .pe-btn { display:inline-flex; align-items:center; gap:0.35rem; padding:0.4rem 0.85rem;
          border-radius:8px; border:none; font-size:0.82rem; font-weight:600; cursor:pointer;
          transition:opacity 0.15s; }
        .pe-btn:active { opacity:0.7; }
        .pe-btn-primary { background:var(--pm-primary); color:#fff; }
        .pe-btn-ghost { background:var(--pm-surface-2); color:var(--pm-text-muted);
          border:1px solid var(--pm-border); }
        .pe-btn-icon { background:none; border:none; cursor:pointer; color:var(--pm-text-muted);
          padding:0.2rem 0.4rem; border-radius:6px; font-size:0.8rem; transition:color 0.15s; }
        .pe-btn-delete:hover { color:var(--pm-danger); }
        .pe-empty { text-align:center; padding:1.25rem 0.5rem; color:var(--pm-text-muted); }
        .pe-empty p { margin:0.25rem 0; font-size:0.85rem; }
        .pe-timeline { display:flex; flex-direction:column; gap:0; position:relative; }
        .pe-timeline::before { content:''; position:absolute; left:9px; top:14px; bottom:14px;
          width:2px; background:var(--pm-border); border-radius:1px; }
        .pe-entry { display:flex; gap:0.75rem; padding:0.45rem 0; position:relative; }
        .pe-entry__dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:8px;
          border:2px solid var(--pm-surface, #fff); position:relative; z-index:1; }
        .pe-entry__body { flex:1; min-width:0; background:var(--pm-surface-2);
          border:1px solid var(--pm-border); border-radius:10px; padding:0.6rem 0.75rem; }
        .pe-entry__header { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;
          flex-wrap:wrap; }
        .pe-badge { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px;
          flex-shrink:0; }
        .pe-entry__date { font-size:0.68rem; color:var(--pm-text-muted); margin-left:auto; }
        .pe-entry__titulo { font-size:0.85rem; font-weight:600; margin:0; color:var(--pm-text); }
        .pe-entry__desc { font-size:0.78rem; color:var(--pm-text-muted); margin:0.25rem 0 0;
          line-height:1.45; font-style:italic; }
        .pe-nivel { display:inline-block; font-size:0.65rem; font-weight:600;
          text-transform:uppercase; letter-spacing:0.04em; color:var(--pm-primary);
          background:rgba(99,102,241,0.12); padding:1px 6px; border-radius:4px; margin-top:0.3rem; }
        .pe-form-overlay { position:relative; }
        .pe-form { background:var(--pm-surface-2); border:1px solid var(--pm-border);
          border-radius:14px; padding:1rem; display:flex; flex-direction:column; gap:0.6rem; }
        .pe-form__header { display:flex; justify-content:space-between; align-items:center;
          margin-bottom:0.1rem; }
        .pe-form__header strong { font-size:0.9rem; }
        .pe-label { font-size:0.72rem; font-weight:600; color:var(--pm-text-muted);
          text-transform:uppercase; letter-spacing:0.04em; margin-bottom:-0.25rem; }
        .pe-input, .pe-select, .pe-textarea {
          width:100%; border:1px solid var(--pm-border); border-radius:8px;
          padding:0.5rem 0.65rem; font-size:0.85rem; background:var(--pm-surface);
          color:var(--pm-text); font-family:inherit; box-sizing:border-box;
          outline:none; transition:border-color 0.15s; }
        .pe-input:focus, .pe-select:focus, .pe-textarea:focus { border-color:var(--pm-primary); }
        .pe-textarea { resize:vertical; min-height:70px; line-height:1.45; }
        .pe-form__actions { display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.25rem; }
      </style>
    `}_attachEvents(){this._container.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.action;n===`open-form`&&this._openForm(),n===`close-form`&&this._closeForm(),n===`save-entry`&&this._handleSave(),n===`delete`&&this.deleteEntry(e.dataset.id)})})}_openForm(){this._formOpen=!0,this._render(),setTimeout(()=>this._container.querySelector(`#pe-titulo`)?.focus(),50)}_closeForm(){this._formOpen=!1,this._render()}async _handleSave(){let e=this._container.querySelector(`#pe-tipo`)?.value,t=this._container.querySelector(`#pe-titulo`)?.value?.trim(),n=this._container.querySelector(`#pe-descripcion`)?.value?.trim(),r=this._container.querySelector(`#pe-nivel`)?.value;if(!t){this._container.querySelector(`#pe-titulo`)?.focus();return}let i=this._container.querySelector(`#pe-save-btn`);i&&(i.disabled=!0,i.textContent=`Guardando...`);try{await this.addEntry({tipo:e,titulo:t,descripcion:n||null,nivel_referencia:r||null}),this._formOpen=!1}catch(e){console.error(`[PlanEstudiosPanel] save error:`,e),i&&(i.disabled=!1,i.textContent=`Guardar`)}}async addEntry(e){let t=await lo({alumno_id:this._alumnoId,maestro_id:this._maestroId,tipo:e.tipo,titulo:e.titulo,descripcion:e.descripcion||null,nivel_referencia:e.nivel_referencia||null});this._entries=[t,...this._entries],this._render()}async deleteEntry(e){this._entries=this._entries.filter(t=>t.id!==e),this._render(),await uo(e)}};function ho(e){if(!e)return null;let t=e.replace(/\D/g,``);return t.length===10&&/^(809|829|849)/.test(t)?`1`+t:t.length===11&&t.startsWith(`1`)||t.length>=10?t:null}var go=e=>`soi_wa_templates_${e}`,_o=[{id:`tpl-1`,label:`📋 Asistencia`,text:`Hola Saludos, le escribo de "El Sistema Punta Cana" para informarle sobre las asistencias de clases de {alumno}. Por favor comuníquese con nosotros para más detalles.`},{id:`tpl-2`,label:`📝 Evaluación`,text:`Hola Saludos, le informamos que {alumno} tiene evaluaciones recientes disponibles para revisión. Puede consultar su progreso con nosotros.`},{id:`tpl-3`,label:`📅 Recordatorio`,text:`Hola Saludos, le recordamos que {alumno} tiene clase próximamente. Cualquier ausencia debe ser justificada con anticipación.`},{id:`tpl-4`,label:`🤝 Reunión`,text:`Hola Saludos, me gustaría coordinar una reunión para conversar sobre el progreso de {alumno}. ¿Cuándo le viene bien?`}];function vo(e){try{let t=localStorage.getItem(go(e));return t?JSON.parse(t):_o.map(e=>({...e}))}catch{return _o.map(e=>({...e}))}}function yo(e,t){localStorage.setItem(go(e),JSON.stringify(t))}function bo(e,{alumno:t,contacto:n}){return e.replace(/\{alumno\}/g,t).replace(/\{contacto\}/g,n)}function xo(e){return e?e.replace(/\[([^\]]+)\]/g,(e,t)=>{let n=t.indexOf(`:`);if(n>0){let e=t.slice(0,n).trim(),r=t.slice(n+1).trim();return r?`${e}: ${r}`:e}return t.trim()}).replace(/\n{3,}/g,`

`).trim():``}var So={LOGRADO:{label:`Logrado`,color:`#198754`,bg:`#19875418`,icon:`✅`},EN_PROGRESO:{label:`En progreso`,color:`#0d6efd`,bg:`#0d6efd18`,icon:`📈`},INICIADO:{label:`Iniciado`,color:`#6c757d`,bg:`#6c757d18`,icon:`🔰`},DIFICULTAD:{label:`Dificultad`,color:`#dc3545`,bg:`#dc354518`,icon:`⚠️`}};async function Co(e,t,n=0){let r=e.querySelector(`#pm-alumno-progresos-root`);if(!r)return;let i=n===0;i&&(r.innerHTML=`<div class="pm-loading-zen"><div class="pm-pulse"></div></div>`);try{let{data:a,error:o}=await j.from(`progresos`).select(`id, contenido_dsl, estado_cualitativo, calificacion, observaciones, fecha_evaluacion, clase_id, indicadores`).eq(`alumno_id`,t).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``).order(`fecha_evaluacion`,{ascending:!1}).range(n,n+19);if(o)throw o;if(!a||a.length===0){i&&(r.innerHTML=`<p style="font-size:0.82rem;color:var(--pm-text-muted);text-align:center;padding:1rem 0;">Sin registros de progreso generados por IA aún.</p>`);return}let s=[...new Set(a.map(e=>e.clase_id).filter(Boolean))],{data:c}=s.length?await j.from(`clases`).select(`id, nombre`).in(`id`,s):{data:[]},l=new Map((c||[]).map(e=>[e.id,e.nombre])),u=new Map;for(let e of a){let t=e.contenido_dsl;u.has(t)||u.set(t,{contenido:t,entries:[]}),u.get(t).entries.push(e)}let d=Array.from(u.values()).map(({contenido:e,entries:t})=>{let n=t[0],r=So[n.estado_cualitativo]??So.EN_PROGRESO,i=new Date(n.fecha_evaluacion).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`2-digit`});return`
        <details class="pm-prog-card">
          <summary class="pm-prog-card__summary">
            <span class="pm-prog-card__icon" style="color:${r.color}">${r.icon}</span>
            <div class="pm-prog-card__info">
              <span class="pm-prog-card__name">${L(e)}</span>
              <span class="pm-prog-card__meta">${t.length} registro${t.length===1?``:`s`} · último: ${i}</span>
            </div>
            <span class="pm-prog-card__badge" style="color:${r.color};background:${r.bg}">${r.label}</span>
            <i class="bi bi-chevron-down pm-prog-card__chevron"></i>
          </summary>
          <div class="pm-prog-card__timeline">
            ${t.map(e=>{let t=So[e.estado_cualitativo]??So.EN_PROGRESO,n=new Date(e.fecha_evaluacion).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}),r=l.get(e.clase_id)||`Clase`,i=e.indicadores?.tarea,a=e.calificacion==null?null:`${e.calificacion}/5`;return`
                <div class="pm-prog-entry">
                  <div class="pm-prog-entry__dot" style="background:${t.color}"></div>
                  <div class="pm-prog-entry__body">
                    <div class="pm-prog-entry__header">
                      <span class="pm-prog-entry__fecha">${n}</span>
                      <span class="pm-prog-entry__clase">${L(r)}</span>
                      ${a?`<span class="pm-prog-entry__nota" style="color:${t.color}">${a}</span>`:``}
                    </div>
                    <span class="pm-prog-entry__estado" style="color:${t.color}">${t.icon} ${t.label}</span>
                    ${e.observaciones?`<p class="pm-prog-entry__obs">${L(e.observaciones)}</p>`:``}
                    ${i?`<p class="pm-prog-entry__tarea">📋 ${L(i)}</p>`:``}
                  </div>
                </div>
              `}).join(``)}
          </div>
        </details>
      `}).join(``);if(i)r.innerHTML=`
        <div class="pm-prog-list">
          ${d}
        </div>
        <style>
          .pm-prog-list { display: flex; flex-direction: column; gap: 0.5rem; }
          .pm-prog-card {
            border: 1px solid var(--pm-border);
            border-radius: 10px;
            overflow: hidden;
            background: var(--pm-surface-2);
          }
          .pm-prog-card__summary {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.65rem 0.75rem;
            cursor: pointer;
            list-style: none;
            user-select: none;
          }
          .pm-prog-card__summary::-webkit-details-marker { display: none; }
          .pm-prog-card__icon { font-size: 1.1rem; flex-shrink: 0; }
          .pm-prog-card__info { flex: 1; min-width: 0; }
          .pm-prog-card__name {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--pm-text);
          }
          .pm-prog-card__meta {
            display: block;
            font-size: 0.68rem;
            color: var(--pm-text-muted);
            margin-top: 1px;
          }
          .pm-prog-card__badge {
            font-size: 0.7rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 99px;
            flex-shrink: 0;
          }
          .pm-prog-card__chevron {
            font-size: 0.75rem;
            color: var(--pm-text-muted);
            transition: transform 0.2s;
            flex-shrink: 0;
          }
          details[open] .pm-prog-card__chevron { transform: rotate(180deg); }
          .pm-prog-card__timeline {
            border-top: 1px solid var(--pm-border);
            padding: 0.5rem 0.75rem 0.5rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0;
            position: relative;
          }
          .pm-prog-card__timeline::before {
            content: '';
            position: absolute;
            left: 1.15rem;
            top: 0.75rem;
            bottom: 0.75rem;
            width: 2px;
            background: var(--pm-border);
            border-radius: 1px;
          }
          .pm-prog-entry {
            display: flex;
            gap: 0.75rem;
            padding: 0.4rem 0;
            position: relative;
          }
          .pm-prog-entry__dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 4px;
            border: 2px solid var(--pm-surface-2);
            position: relative;
            z-index: 1;
          }
          .pm-prog-entry__body { flex: 1; }
          .pm-prog-entry__header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 0.1rem;
          }
          .pm-prog-entry__fecha { font-size: 0.72rem; color: var(--pm-text-muted); font-weight: 600; }
          .pm-prog-entry__clase {
            font-size: 0.68rem;
            color: var(--pm-text-muted);
            background: var(--pm-surface);
            padding: 1px 6px;
            border-radius: 4px;
          }
          .pm-prog-entry__nota { font-size: 0.72rem; font-weight: 700; margin-left: auto; }
          .pm-prog-entry__estado { font-size: 0.72rem; font-weight: 600; }
          .pm-prog-entry__obs {
            font-size: 0.78rem;
            color: var(--pm-text);
            margin: 0.15rem 0 0;
            line-height: 1.45;
            font-style: italic;
          }
          .pm-prog-entry__tarea {
            font-size: 0.72rem;
            color: var(--pm-text-muted);
            margin: 0.1rem 0 0;
          }
        </style>
      `;else{let e=r.querySelector(`.pm-prog-list`);if(e){let t=document.createElement(`div`);t.innerHTML=d,e.append(...t.children)}}if(a&&a.length===20){let i=document.createElement(`button`);i.className=`pm-btn pm-btn-outline`,i.style.cssText=`display:block;margin:0.75rem auto 0;font-size:0.82rem;`,i.textContent=`Cargar más`,i.onclick=()=>{i.remove(),Co(e,t,n+20)},r.appendChild(i)}}catch(e){i?r.innerHTML=`<p style="color:var(--pm-danger);font-size:0.82rem;">Error al cargar historial: ${L(e.message)}</p>`:(console.error(`[_renderProgresos] Error loading page:`,e),typeof AppToast<`u`&&AppToast&&AppToast.error(`Error al cargar más registros: `+e.message))}}async function wo(e,{alumnoId:t}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let r=N();if(!r){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}if(!t){e.innerHTML=`<p class="pm-empty">No se especificó el alumno.</p>`;return}try{let{data:i,error:a}=await j.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, tlf_alumno, fecha_nacimiento, created_at, nivel_actual, representante_nombre, representante_tlf, correo_representante, direccion`).eq(`id`,t).single();if(a||!i){console.error(`[AlumnoPerfil] Error al obtener alumno:`,a),e.innerHTML=`
        <div class="pm-empty" style="padding:3rem 1rem;">
          <i class="bi bi-person-x" style="font-size:3rem;opacity:0.3;"></i>
          <p>Alumno no encontrado o error de acceso.</p>
          <button class="pm-btn pm-btn-secondary" onclick="window.history.back()" style="margin-top:1rem;">Volver</button>
        </div>
      `;return}let{data:o}=await j.from(`alumnos_clases`).select(`clase_id`).eq(`alumno_id`,t).eq(`activo`,!0),s=(o||[]).map(e=>e.clase_id).filter(Boolean),{data:c}=await j.from(`sesiones_clase`).select(`id, clase_id, fecha, contenido_dsl, asistencia`).filter(`asistencia`,`cs`,JSON.stringify([{alumno_id:t}])).order(`fecha`,{ascending:!1}).limit(60),l=(c||[]).map(e=>{let n=e.asistencia?.find(e=>e.alumno_id===t);return n?{fecha:e.fecha,estado:n.estado,clase_id:e.clase_id,sesion_id:e.id,contenido_dsl:e.contenido_dsl,observaciones:n.observaciones||null}:null}).filter(Boolean);new Map(l.map(e=>[e.sesion_id,e.contenido_dsl]));let{data:u}=await j.from(`indicator_attempts`).select(`id, nota, observations, tarea, created_at, indicator_id`).eq(`student_id`,t).order(`created_at`,{ascending:!1}).limit(30),{data:d}=await j.from(`ausencias`).select(`id, fecha_inicio, fecha_fin, motivo, estado, clase_id`).eq(`alumno_id`,t).order(`fecha_inicio`,{ascending:!1}).limit(10),{data:f}=await j.from(`justificaciones`).select(`sesion_id, motivo, evidencia_url, estado, fecha`).eq(`alumno_id`,t).order(`fecha`,{ascending:!1}),p=new Map((f||[]).map(e=>[e.sesion_id,e])),m=l.length,h=l.filter(e=>e.estado===`P`).length,g=l.filter(e=>e.estado===`A`).length,_=l.filter(e=>e.estado===`J`).length,v=l.filter(e=>e.estado===`T`).length,y=m>0?Math.round(h/m*100):0,b=u?.filter(e=>e.nota!=null&&e.nota!==0)||[],x=b.length>0?Math.round(b.reduce((e,t)=>e+t.nota,0)/b.length*10)/10:0,S=b.filter(e=>e.nota>=4).length,C=b.length,w=C>0?Math.round(S/C*100):0,T={};l.forEach(e=>{T[e.clase_id]||(T[e.clase_id]={P:0,A:0,J:0,T:0,total:0}),e.estado&&(T[e.clase_id][e.estado]=(T[e.clase_id][e.estado]||0)+1,T[e.clase_id].total++)});let E=new Set([...s,...Object.keys(T)]),{data:D}=E.size>0?await j.from(`clases`).select(`id, nombre, instrumento, nivel`).in(`id`,[...E]):{data:[]},O=new Map((D||[]).map(e=>[e.id,e])),k=l.filter(e=>e.estado===`P`&&e.contenido_dsl?.trim()),A=u?.filter(e=>e.observations?.trim())||[],ee=`—`;if(i.fecha_nacimiento){let e=new Date(i.fecha_nacimiento),t=new Date;ee=t.getFullYear()-e.getFullYear(),(t.getMonth()<e.getMonth()||t.getMonth()===e.getMonth()&&t.getDate()<e.getDate())&&ee--}let te=i.created_at?new Date(i.created_at).toLocaleDateString(`es-ES`,{month:`long`,year:`numeric`}):`Reciente`,ne=(i.instrumento_principal||``).toLowerCase(),re=`var(--pm-primary)`;(ne.includes(`violin`)||ne.includes(`cuerda`))&&(re=`#FF3B30`),(ne.includes(`piano`)||ne.includes(`teclado`))&&(re=`#FF9500`),ne.includes(`guitarra`)&&(re=`#5856D6`),(ne.includes(`canto`)||ne.includes(`voz`))&&(re=`#AF52DE`),e.innerHTML=`
      <div class="pm-alumno-zen pm-animate-fade-in">
        <!-- Hero Section -->
        <div class="pm-zen-hero" style="--accent-gradient: ${re}">
          <div class="pm-zen-hero__overlay"></div>
          <header class="pm-zen-header">
            <button id="pm-alumno-back" class="pm-zen-back">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="pm-zen-header-tag">Perfil Académico</span>
          </header>
          
          <div class="pm-zen-hero__content">
            <div class="pm-zen-avatar" style="width:70px;height:70px;font-size:1.8rem;">
              ${(i.nombre_completo||`A`)[0].toUpperCase()}
            </div>
            <div class="pm-zen-info">
              <h1 class="pm-zen-name">${L(i.nombre_completo)}</h1>
              <p class="pm-zen-instrument">${L(i.instrumento_principal||`Estudiante`)}</p>
              <p style="font-size:0.8rem;opacity:0.8;margin-top:4px;">Nivel ${i.nivel_actual||1} • ${ee} años</p>
            </div>
          </div>
        </div>

        <div class="pm-zen-body">
          <!-- 📊 Panel de Métricas Principales -->
          <div class="pm-zen-mosaic" style="grid-template-columns: repeat(2, 1fr);">
            <div class="pm-zen-card pm-zen-card--large pm-glass" style="grid-column: span 2;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                <span class="pm-zen-card__label" style="font-size:0.78rem;font-weight:500;">📈 Rendimiento Académico</span>
                ${C>0?`<span style="font-size:1.4rem;font-weight:700;line-height:1;color:${x>=4?`var(--pm-success)`:x>=2?`var(--pm-warning)`:`var(--pm-danger)`}">${x.toFixed(1)}</span>`:`<span style="font-size:0.8rem;color:var(--pm-text-muted);">Sin datos</span>`}
              </div>
              ${C>0?`
              <div class="pm-student-panel__progress-bar" style="height:6px;border-radius:3px;background:var(--pm-border);">
                <div style="width:${w}%;background:${x>=4?`var(--pm-success)`:x>=2?`var(--pm-warning)`:`var(--pm-danger)`};height:100%;border-radius:3px;"></div>
              </div>
              <p style="font-size:0.72rem;color:var(--pm-text-muted);margin-top:0.4rem;">
                ${S} de ${C} indicadores aprobados · ${w}%
              </p>`:`<p style="font-size:0.72rem;color:var(--pm-text-muted);margin-top:0.25rem;">Aún no hay evaluaciones registradas</p>`}
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">✅ Asistencia</span>
              ${m>0?`<div style="display:flex;align-items:baseline;gap:0.25rem;">
                     <span class="pm-zen-card__value" style="font-size:1.8rem;color:${y>=75?`var(--pm-success)`:y>=50?`var(--pm-warning)`:`var(--pm-danger)`};line-height:1;">${h}</span>
                     <span style="font-size:1rem;color:var(--pm-text-muted);font-weight:500;">/ ${m}</span>
                   </div>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;margin-top:2px;">
                     ${y}% asistencia
                     ${g>0?`· <span style="color:var(--pm-danger)">${g} ausente${g>1?`s`:``}</span>`:``}
                     ${_>0?`· <span style="color:var(--pm-warning)">${_} justif.</span>`:``}
                     ${v>0?`· <span style="color:#FF9500">${v} tarde${v>1?`s`:``}</span>`:``}
                   </p>`:`<span class="pm-zen-card__value" style="font-size:1.1rem;color:var(--pm-text-muted);">Sin clases</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">No hay sesiones registradas</p>`}
            </div>

            <div class="pm-zen-card pm-glass">
              <span class="pm-zen-card__label">📅 Clases Activas</span>
              ${s.length>0?`<span class="pm-zen-card__value" style="font-size:1.8rem;">${s.length}</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">Materias inscritas</p>`:`<span class="pm-zen-card__value" style="font-size:1.1rem;color:var(--pm-text-muted);">Sin inscripción</span>
                   <p class="pm-zen-card__sub" style="font-size:0.7rem;">No está en ninguna clase activa</p>`}
            </div>
          </div>

          <!-- 🎵 Clases Inscritas -->
          ${s.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🎵 Clases Inscritas</h3>
            <div class="pm-zen-clases-grid">
              ${s.map(e=>{let t=O.get(e);if(!t)return``;let n=T[e]||{P:0,A:0,J:0,T:0,total:0},r=n.total>0?Math.round(n.P/n.total*100):null;return`
                  <div class="pm-zen-clase-card pm-glass">
                    <div class="pm-zen-clase-header">
                      <strong>${L(t.nombre)}</strong>
                      ${t.nivel?`<span class="pm-zen-clase-nivel">Nivel ${t.nivel}</span>`:``}
                    </div>
                    <p class="pm-zen-clase-inst">${L(t.instrumento||``)}</p>
                    <div class="pm-zen-clase-stats">
                      <div class="pm-zen-clase-stat" style="flex:1.2;">
                        <div style="display:flex;align-items:baseline;gap:3px;">
                          <span class="pm-zen-stat-value" style="color:${r===null?`var(--pm-text-muted)`:r>=75?`var(--pm-success)`:r>=50?`var(--pm-warning)`:`var(--pm-danger)`};">${n.P}</span>
                          <span style="font-size:0.7rem;color:var(--pm-text-muted);">/ ${n.total||`—`}</span>
                        </div>
                        <span class="pm-zen-stat-label">${r===null?`Sin datos`:r+`%`}</span>
                      </div>
                      ${n.A>0?`<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-danger);">${n.A}</span>
                        <span class="pm-zen-stat-label">Ausente${n.A>1?`s`:``}</span>
                      </div>`:``}
                      ${n.J>0?`<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-warning);">${n.J}</span>
                        <span class="pm-zen-stat-label">Justif.</span>
                      </div>`:``}
                      ${n.T>0?`<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:#FF9500;">${n.T}</span>
                        <span class="pm-zen-stat-label">Tarde${n.T>1?`s`:``}</span>
                      </div>`:``}
                      ${n.total===0?`<div class="pm-zen-clase-stat">
                        <span class="pm-zen-stat-value" style="color:var(--pm-text-muted);">—</span>
                        <span class="pm-zen-stat-label">Sin registros</span>
                      </div>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </div>
          `:``}

          <!-- 📖 Bitácora de Clases -->
          ${k.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">📖 Bitácora de Clases</h3>
            <div class="pm-zen-bitacora">
              ${k.map(e=>{let t=O.get(e.clase_id),n=xo(e.contenido_dsl);return`
                  <div class="pm-zen-bitacora-item pm-glass">
                    <div class="pm-zen-bitacora-header">
                      <span class="pm-zen-bitacora-clase">${L(t?.nombre||`Clase`)}</span>
                      <span class="pm-zen-bitacora-fecha">${new Date(e.fecha).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`2-digit`})}</span>
                    </div>
                    <p class="pm-zen-bitacora-contenido">${L(n)}</p>
                  </div>
                `}).join(``)}
            </div>
          </div>
          `:``}

          <!-- 📝 Últimas Evaluaciones -->
          ${b.length>0?`
          <details class="pm-zen-section pm-zen-accordion">
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">📝 Últimas Evaluaciones</span>
              <span class="pm-zen-accordion-meta">${b.length} registro${b.length===1?``:`s`}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-evaluaciones" style="margin-top:0.75rem;">
              ${b.slice(0,8).map(e=>{let t=new Date(e.created_at),n=e.nota>=4?`var(--pm-success)`:e.nota>=2?`var(--pm-warning)`:`var(--pm-danger)`;return`
                  <div class="pm-zen-eval-item">
                    <div class="pm-zen-eval-icon" style="background:${n}20;color:${n}">${e.nota>=4?`✅`:e.nota>=2?`⚠️`:`❌`}</div>
                    <div class="pm-zen-eval-content">
                      <div class="pm-zen-eval-header">
                        <strong>Nota: ${e.nota}</strong>
                        <span>${t.toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`})}</span>
                      </div>
                      ${e.tarea?`<p class="pm-zen-eval-tarea">${L(e.tarea)}</p>`:``}
                      ${e.observations?`<p class="pm-zen-eval-obs">${L(e.observations.substring(0,80))}${e.observations.length>80?`...`:``}</p>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </details>
          `:``}

          <!-- 💬 Desenvolvimiento del Alumno -->
          ${A.length>0?`
          <details class="pm-zen-section pm-zen-accordion">
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">💬 Desenvolvimiento</span>
              <span class="pm-zen-accordion-meta">${A.length} observación${A.length===1?``:`es`}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-desenvolvimiento" style="margin-top:0.75rem;">
              ${A.map(e=>{let t=e.nota>=4?`var(--pm-success)`:e.nota>=2?`var(--pm-warning)`:`var(--pm-danger)`;return`
                  <div class="pm-zen-desenv-item">
                    <div class="pm-zen-desenv-dot" style="background:${e.nota==null?`var(--pm-primary)`:t}"></div>
                    <div class="pm-zen-desenv-content">
                      <div class="pm-zen-desenv-header">
                        <span class="pm-zen-desenv-fecha">${new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`})}</span>
                        ${e.nota==null?``:`<span class="pm-zen-desenv-nota" style="color:${t};">Nota: ${e.nota}</span>`}
                      </div>
                      <p class="pm-zen-desenv-obs">${L(e.observations)}</p>
                      ${e.tarea?`<p class="pm-zen-desenv-tarea">📋 ${L(e.tarea)}</p>`:``}
                    </div>
                  </div>
                `}).join(``)}
            </div>
          </details>
          `:``}

          <!-- 📅 Historial de Asistencia -->
          <details class="pm-zen-section pm-zen-accordion" ${l.length>0?`open`:``}>
            <summary class="pm-zen-accordion-header">
              <span class="pm-zen-section-title" style="margin:0;">📅 Historial de Asistencia</span>
              <span class="pm-zen-accordion-meta">${m} sesión${m===1?``:`es`}</span>
              <i class="bi bi-chevron-down pm-accordion-chevron"></i>
            </summary>
            <div class="pm-zen-asistencia-timeline" style="margin-top:0.75rem;">
              ${l.length===0?`<p class="pm-zen-empty">Sin registros de asistencia</p>`:l.slice(0,30).map(e=>{let t={P:`Presente`,A:`Ausente`,J:`Justificado`,T:`Tardanza`},n={P:`var(--pm-success)`,A:`var(--pm-danger)`,J:`var(--pm-warning)`,T:`#FF9500`},r=O.get(e.clase_id),i=e.estado===`J`?p.get(e.sesion_id):null;return`
                      <div class="pm-zen-asistencia-item">
                        <div class="pm-zen-asistencia-dot" style="background:${n[e.estado]||`var(--pm-border)`}"></div>
                        <div class="pm-zen-asistencia-content">
                          <div class="pm-zen-asistencia-header">
                            <strong style="color:${n[e.estado]||`inherit`}">${t[e.estado]||e.estado}</strong>
                            <span>${new Date(e.fecha).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`2-digit`})}</span>
                          </div>
                          <span class="pm-zen-asistencia-clase">${L(r?.nombre||`Clase`)}</span>
                          ${i?`
                            <div class="pm-zen-justif-box">
                              <div class="pm-zen-justif-header">
                                <i class="bi bi-file-earmark-text" style="font-size:0.75rem;"></i>
                                <span>Justificación</span>
                                <span class="pm-zen-justif-estado" style="color:${{pendiente:`var(--pm-warning)`,aprobado:`var(--pm-success)`,rechazado:`var(--pm-danger)`}[i.estado]||`var(--pm-text-muted)`};">${i.estado}</span>
                              </div>
                              <p class="pm-zen-justif-motivo">${L(i.motivo)}</p>
                              ${i.evidencia_url?`<a class="pm-zen-justif-evidencia" href="${i.evidencia_url}" target="_blank" rel="noopener"><i class="bi bi-paperclip"></i> Ver evidencia</a>`:``}
                            </div>
                          `:e.estado===`J`?`<span class="pm-zen-asistencia-obs" style="color:var(--pm-warning);">Justificado — sin detalle registrado</span>`:``}
                          ${e.observaciones?`<span class="pm-zen-asistencia-obs">${L(e.observaciones)}</span>`:``}
                        </div>
                      </div>
                    `}).join(``)}
            </div>
          </details>

          <!-- 🚨 Ausencias Recientes -->
          ${d&&d.length>0?`
          <div class="pm-zen-section">
            <h3 class="pm-zen-section-title">🚨 Ausencias Registradas</h3>
            <div class="pm-zen-ausencias">
              ${d.map(e=>{let t=new Date(e.fecha_inicio).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}),n=e.fecha_fin?new Date(e.fecha_fin).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}):t,r={pendiente:`var(--pm-warning)`,aprobada:`var(--pm-success)`,rechazada:`var(--pm-danger)`};return`
                  <div class="pm-zen-ausencia-item">
                    <div class="pm-zen-ausencia-icon" style="background:${r[e.estado]||`var(--pm-border)`}20">
                      <i class="bi bi-calendar-x" style="color:${r[e.estado]||`var(--pm-text-muted)`}"></i>
                    </div>
                    <div class="pm-zen-ausencia-content">
                      <div class="pm-zen-ausencia-header">
                        <strong>${t===n?t:`${t} - ${n}`}</strong>
                        <span class="pm-zen-ausencia-estado" style="color:${r[e.estado]||`var(--pm-text-muted)`}">${e.estado||`pendiente`}</span>
                      </div>
                      ${e.motivo?`<p class="pm-zen-ausencia-motivo">${L(e.motivo.substring(0,60))}${e.motivo.length>60?`...`:``}</p>`:``}
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
                <div style="flex:1;min-width:0;">
                  <span>${i.tlf_alumno?`Teléfono alumno`:i.representante_tlf?`Teléfono representante`:`Teléfono`}</span>
                  <strong>${n(i.tlf_alumno||i.representante_tlf)||`—`}</strong>
                </div>
                ${i.tlf_alumno||i.representante_tlf?`
                <button
                  id="btn-whatsapp-alumno"
                  class="pm-btn-whatsapp"
                  data-phone="${i.tlf_alumno||i.representante_tlf}"
                  title="Enviar mensaje por WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>`:``}
              </div>
              ${i.representante_nombre?`
              <div class="pm-zen-detail">
                <i class="bi bi-person-vcard"></i>
                <div>
                  <span>Representante</span>
                  <strong>${L(i.representante_nombre)}</strong>
                </div>
              </div>`:``}
              ${i.correo_representante?`
              <div class="pm-zen-detail">
                <i class="bi bi-envelope"></i>
                <div>
                  <span>Correo representante</span>
                  <strong>${L(i.correo_representante)}</strong>
                </div>
              </div>`:``}
              ${i.direccion?`
              <div class="pm-zen-detail">
                <i class="bi bi-geo-alt"></i>
                <div>
                  <span>Dirección</span>
                  <strong>${L(i.direccion)}</strong>
                </div>
              </div>`:``}
              <div class="pm-zen-detail">
                <i class="bi bi-calendar-check"></i>
                <div>
                  <span>Fecha de ingreso</span>
                  <strong>${te}</strong>
                </div>
              </div>
              <div class="pm-zen-detail">
                <i class="bi bi-cake"></i>
                <div>
                  <span>Fecha de nacimiento</span>
                  <strong>${i.fecha_nacimiento?new Date(i.fecha_nacimiento).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`}):`No registrada`}</strong>
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

          <!-- 🎯 Historial de Progreso (IA) -->
          <div class="pm-zen-section">
            <div class="pm-zen-section-header">
              <h3 class="pm-zen-section-title">🎯 Historial de Progreso (IA)</h3>
            </div>
            <div id="pm-alumno-progresos-root" class="pm-zen-progress-container">
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
        .pm-zen-asistencia-obs {
          display: block;
          font-size: 0.68rem;
          color: var(--pm-text-muted);
          font-style: italic;
          margin-top: 1px;
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
        /* Botón WhatsApp */
        .pm-btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          border: none;
          background: #25D366;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }
        .pm-btn-whatsapp:hover { background: #1ebe5a; transform: scale(1.03); }
        .pm-btn-whatsapp:active { transform: scale(0.97); }
        /* Modal WhatsApp */
        #pm-wa-modal { display: none; }
        #pm-wa-modal.open { display: block; }
        .pm-wa-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 1050;
        }
        .pm-wa-dialog {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1051;
          background: var(--pm-surface, #fff);
          border-radius: 20px 20px 0 0;
          max-width: 520px;
          margin: 0 auto;
          box-shadow: 0 -4px 30px rgba(0,0,0,0.15);
          animation: waSlideUp 0.25s ease;
        }
        @keyframes waSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .pm-wa-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 1rem 1rem 0.75rem;
          border-bottom: 1px solid var(--pm-border);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .pm-wa-header span { flex: 1; }
        .pm-wa-close {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: var(--pm-text-muted);
          padding: 0 0.25rem;
        }
        .pm-wa-body { padding: 0.85rem 1rem; }
        .pm-wa-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--pm-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0 0 0.5rem;
        }
        .pm-wa-templates {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .pm-wa-tpl {
          padding: 0.3rem 0.75rem;
          border-radius: 16px;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--pm-text);
        }
        .pm-wa-tpl:hover { border-color: #25D366; color: #25D366; }
        .pm-wa-tpl.active { background: #25D36615; border-color: #25D366; color: #1a9e4d; font-weight: 600; }
        .pm-wa-textarea {
          width: 100%;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          padding: 0.65rem 0.75rem;
          font-size: 0.85rem;
          line-height: 1.5;
          resize: vertical;
          background: var(--pm-surface-2);
          color: var(--pm-text);
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s;
        }
        .pm-wa-textarea:focus { border-color: #25D366; }
        .pm-wa-footer {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1rem 1.25rem;
          border-top: 1px solid var(--pm-border);
        }
        .pm-wa-cancel {
          flex: 1;
          padding: 0.6rem;
          border-radius: 10px;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          color: var(--pm-text-muted);
          font-size: 0.85rem;
          cursor: pointer;
        }
        .pm-wa-send {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem;
          border-radius: 10px;
          background: #25D366;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
        }
        .pm-wa-send:hover { background: #1ebe5a; }
        .pm-wa-tpl-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem; }
        .pm-wa-tpl-row .pm-wa-label { margin:0; }
        .pm-wa-manage-btn {
          font-size: 0.72rem; background: none; border: 1px solid var(--pm-border);
          border-radius: 8px; padding: 2px 10px; cursor: pointer; color: var(--pm-text-muted);
        }
        .pm-wa-manage-btn:hover { border-color: var(--pm-primary); color: var(--pm-primary); }
        .pm-wa-hint { font-size: 0.68rem; color: var(--pm-text-muted); margin: 0.3rem 0 0; }
        .pm-wa-hint code { background: var(--pm-surface-2); padding: 1px 4px; border-radius: 4px; }
        .pm-wa-back {
          background: none; border: none; font-size: 0.9rem; cursor: pointer;
          color: var(--pm-primary); font-weight: 600; padding: 0 0.5rem 0 0;
        }
        .pm-wa-add-tpl {
          display: block; width: 100%; margin-top: 0.75rem; padding: 0.55rem;
          border: 1px dashed var(--pm-border); border-radius: 10px; background: none;
          color: var(--pm-primary); font-size: 0.82rem; cursor: pointer; text-align: center;
        }
        .pm-wa-add-tpl:hover { background: var(--pm-surface-2); }
        .pm-wa-mgr-item {
          background: var(--pm-surface-2); border-radius: 10px;
          padding: 0.65rem 0.75rem; margin-bottom: 0.6rem;
        }
        .pm-wa-mgr-item-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; }
        .pm-wa-mgr-label {
          flex: 1; border: 1px solid var(--pm-border); border-radius: 7px;
          padding: 0.3rem 0.5rem; font-size: 0.82rem; font-weight: 600;
          background: var(--pm-surface); color: var(--pm-text);
        }
        .pm-wa-mgr-del {
          background: none; border: none; cursor: pointer; font-size: 1rem;
          opacity: 0.5; flex-shrink: 0;
        }
        .pm-wa-mgr-del:hover { opacity: 1; }
        .pm-wa-mgr-text {
          width: 100%; border: 1px solid var(--pm-border); border-radius: 7px;
          padding: 0.4rem 0.5rem; font-size: 0.8rem; resize: vertical;
          background: var(--pm-surface); color: var(--pm-text);
          font-family: inherit; box-sizing: border-box; line-height: 1.45;
        }
        .pm-wa-mgr-save {
          margin-top: 0.4rem; padding: 0.3rem 0.85rem; border-radius: 7px;
          border: none; background: var(--pm-primary); color: white;
          font-size: 0.78rem; cursor: pointer; font-weight: 600;
        }
        .pm-wa-mgr-save:hover { opacity: 0.85; }
        /* Acordeón */
        .pm-zen-accordion { list-style: none; }
        .pm-zen-accordion summary { list-style: none; }
        .pm-zen-accordion summary::-webkit-details-marker { display: none; }
        .pm-zen-accordion-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.1rem 0;
          user-select: none;
        }
        .pm-zen-accordion-header:hover .pm-zen-section-title { opacity: 0.8; }
        .pm-zen-accordion-meta {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          background: var(--pm-surface-2);
          padding: 2px 7px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .pm-accordion-chevron {
          margin-left: auto;
          font-size: 0.8rem;
          color: var(--pm-text-muted);
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        details[open] .pm-accordion-chevron { transform: rotate(180deg); }
        /* Justificaciones */
        .pm-zen-justif-box {
          margin-top: 0.35rem;
          background: var(--pm-warning)15;
          border: 1px solid var(--pm-warning)40;
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
        }
        .pm-zen-justif-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--pm-text-muted);
          margin-bottom: 0.25rem;
        }
        .pm-zen-justif-estado {
          margin-left: auto;
          font-size: 0.68rem;
          text-transform: capitalize;
          font-weight: 700;
        }
        .pm-zen-justif-motivo {
          font-size: 0.8rem;
          line-height: 1.45;
          margin: 0;
          color: var(--pm-text);
        }
        .pm-zen-justif-evidencia {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          color: var(--pm-primary);
          margin-top: 0.3rem;
          text-decoration: none;
        }
        .pm-zen-justif-evidencia:hover { text-decoration: underline; }
        /* Bitácora de Clases */
        .pm-zen-bitacora {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .pm-zen-bitacora-item {
          padding: 0.75rem;
          border-radius: var(--pm-radius-sm);
          background: var(--pm-surface-2);
          border-left: 3px solid var(--pm-primary);
        }
        .pm-zen-bitacora-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
        }
        .pm-zen-bitacora-clase {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--pm-primary);
        }
        .pm-zen-bitacora-fecha {
          font-size: 0.72rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-bitacora-contenido {
          font-size: 0.8rem;
          line-height: 1.5;
          margin: 0;
          color: var(--pm-text);
          white-space: pre-wrap;
        }
        /* Desenvolvimiento */
        .pm-zen-desenvolvimiento {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          padding-left: 1.25rem;
        }
        .pm-zen-desenvolvimiento::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: var(--pm-border);
          border-radius: 1px;
        }
        .pm-zen-desenv-item {
          display: flex;
          gap: 0.75rem;
          padding-bottom: 1rem;
          position: relative;
        }
        .pm-zen-desenv-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 3px;
          position: absolute;
          left: -1.35rem;
          border: 2px solid var(--pm-surface);
        }
        .pm-zen-desenv-content {
          flex: 1;
          background: var(--pm-surface-2);
          border-radius: var(--pm-radius-sm);
          padding: 0.6rem 0.75rem;
        }
        .pm-zen-desenv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        .pm-zen-desenv-fecha {
          font-size: 0.72rem;
          color: var(--pm-text-muted);
        }
        .pm-zen-desenv-nota {
          font-size: 0.72rem;
          font-weight: 700;
        }
        .pm-zen-desenv-obs {
          font-size: 0.82rem;
          line-height: 1.55;
          margin: 0;
          color: var(--pm-text);
        }
        .pm-zen-desenv-tarea {
          font-size: 0.73rem;
          color: var(--pm-text-muted);
          margin: 0.3rem 0 0;
        }
      </style>
    `,e.querySelector(`#pm-alumno-back`).onclick=()=>window.history.back();let ie=ho(i.tlf_alumno||i.representante_tlf);if(ie){let t=i.nombre_completo||`el alumno`,n=i.representante_nombre||t,a={alumno:t,contacto:n},o=document.createElement(`div`);o.id=`pm-wa-modal`,o.innerHTML=`
        <div class="pm-wa-backdrop"></div>
        <div class="pm-wa-dialog">
          <!-- Vista: Enviar mensaje -->
          <div id="pm-wa-view-send">
            <div class="pm-wa-header">
              <svg viewBox="0 0 24 24" fill="#25D366" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>Mensaje para <strong>${L(n)}</strong></span>
              <button class="pm-wa-close" id="pm-wa-close">✕</button>
            </div>
            <div class="pm-wa-body">
              <div class="pm-wa-tpl-row">
                <p class="pm-wa-label">Plantillas</p>
                <button class="pm-wa-manage-btn" id="pm-wa-manage">✏️ Gestionar</button>
              </div>
              <div class="pm-wa-templates" id="pm-wa-tpl-list"></div>
              <p class="pm-wa-label" style="margin-top:0.85rem;">Mensaje</p>
              <textarea id="pm-wa-text" class="pm-wa-textarea" rows="5" placeholder="Escribí tu mensaje aquí..."></textarea>
              <p class="pm-wa-hint">Usá <code>{alumno}</code> y <code>{contacto}</code> como variables dinámicas.</p>
            </div>
            <div class="pm-wa-footer">
              <button class="pm-wa-cancel" id="pm-wa-cancel">Cancelar</button>
              <a id="pm-wa-send" class="pm-wa-send" href="#" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Abrir en WhatsApp
              </a>
            </div>
          </div>

          <!-- Vista: Gestionar plantillas -->
          <div id="pm-wa-view-mgr" style="display:none;">
            <div class="pm-wa-header">
              <button class="pm-wa-back" id="pm-wa-back">‹ Volver</button>
              <span style="flex:1;font-weight:600;">Gestionar plantillas</span>
              <button class="pm-wa-close" id="pm-wa-close2">✕</button>
            </div>
            <div class="pm-wa-body" style="max-height:55vh;overflow-y:auto;">
              <div id="pm-wa-tpl-mgr-list"></div>
              <button class="pm-wa-add-tpl" id="pm-wa-add-tpl">+ Nueva plantilla</button>
            </div>
          </div>
        </div>
      `,e.appendChild(o);let s=o.querySelector(`#pm-wa-view-send`),c=o.querySelector(`#pm-wa-view-mgr`),l=o.querySelector(`#pm-wa-tpl-list`),u=o.querySelector(`#pm-wa-tpl-mgr-list`),d=o.querySelector(`#pm-wa-text`),f=o.querySelector(`#pm-wa-send`);function p(){return vo(r.id)}function m(e){yo(r.id,e)}function h(){let e=d.value.trim();f.href=e?`https://wa.me/${ie}?text=${encodeURIComponent(e)}`:`https://wa.me/${ie}`}function g(e){l.querySelectorAll(`.pm-wa-tpl`).forEach(e=>e.classList.remove(`active`)),l.querySelector(`[data-id="${e.id}"]`)?.classList.add(`active`),d.value=bo(e.text,a),h()}function _(){let e=p();l.innerHTML=e.length?e.map(e=>`<button class="pm-wa-tpl" data-id="${e.id}">${L(e.label)}</button>`).join(``):`<span style="font-size:0.78rem;color:var(--pm-text-muted);">Sin plantillas — creá una en Gestionar.</span>`,l.querySelectorAll(`.pm-wa-tpl`).forEach(e=>{e.addEventListener(`click`,()=>{let t=p().find(t=>t.id===e.dataset.id);t&&g(t)})});let t=p()[0];t&&g(t)}function v(){let e=p();u.innerHTML=e.length===0?`<p style="font-size:0.82rem;color:var(--pm-text-muted);text-align:center;padding:1rem 0;">Sin plantillas todavía.</p>`:e.map(e=>`
            <div class="pm-wa-mgr-item" data-id="${e.id}">
              <div class="pm-wa-mgr-item-header">
                <input class="pm-wa-mgr-label" value="${L(e.label)}" placeholder="Nombre de la plantilla" />
                <button class="pm-wa-mgr-del" data-id="${e.id}" title="Eliminar">🗑</button>
              </div>
              <textarea class="pm-wa-mgr-text" rows="3">${L(e.text)}</textarea>
              <button class="pm-wa-mgr-save" data-id="${e.id}">Guardar</button>
            </div>
          `).join(``),u.querySelectorAll(`.pm-wa-mgr-save`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.pm-wa-mgr-item`),n=e.dataset.id,r=p(),i=r.findIndex(e=>e.id===n);i!==-1&&(r[i].label=t.querySelector(`.pm-wa-mgr-label`).value.trim()||r[i].label,r[i].text=t.querySelector(`.pm-wa-mgr-text`).value.trim(),m(r),e.textContent=`✓ Guardado`,setTimeout(()=>{e.textContent=`Guardar`},1500))})}),u.querySelectorAll(`.pm-wa-mgr-del`).forEach(e=>{e.addEventListener(`click`,()=>{m(p().filter(t=>t.id!==e.dataset.id)),v()})})}o.querySelector(`#pm-wa-add-tpl`).addEventListener(`click`,()=>{let e=p();e.push({id:`tpl-${Date.now()}`,label:`✏️ Nueva plantilla`,text:`Hola {contacto}, le escribo sobre {alumno}.`}),m(e),v()}),o.querySelector(`#pm-wa-manage`).addEventListener(`click`,()=>{s.style.display=`none`,c.style.display=`block`,v()}),o.querySelector(`#pm-wa-back`).addEventListener(`click`,()=>{c.style.display=`none`,s.style.display=`block`,_()});let y=()=>{o.classList.add(`open`),_()},b=()=>{o.classList.remove(`open`),c.style.display=`none`,s.style.display=`block`};e.querySelector(`#btn-whatsapp-alumno`)?.addEventListener(`click`,y),o.querySelector(`#pm-wa-close`).addEventListener(`click`,b),o.querySelector(`#pm-wa-close2`).addEventListener(`click`,b),o.querySelector(`#pm-wa-cancel`).addEventListener(`click`,b),o.querySelector(`.pm-wa-backdrop`).addEventListener(`click`,b),d.addEventListener(`input`,h),f.addEventListener(`click`,()=>setTimeout(b,300))}let M=e.querySelector(`#pm-alumno-progreso-root`);M&&new mo({container:M,alumnoId:t,maestroId:r.id}).init().catch(e=>{console.error(`[AlumnoPerfil] PlanEstudiosPanel error:`,e),M.innerHTML=`<p style="color:var(--pm-danger);font-size:0.82rem;">Error al cargar plan de estudios: ${L(e.message)}</p>`}),Co(e,t)}catch(t){console.error(`[AlumnoPerfil] Error crítico:`,t),e.innerHTML=`
      <div class="pm-zen-error">
        <i class="bi bi-exclamation-octagon"></i>
        <p>No pudimos cargar el perfil en este momento</p>
        <button class="pm-btn pm-btn-secondary" onclick="window.history.back()">Regresar</button>
      </div>
    `}}var To={scales:`🎼`,arpeggios:`🎹`,left_hand:`✋`,bow:`🎻`,sound:`🔊`,intonation:`🎵`,studies:`⚙️`,repertoire:`📖`},Eo={approved:`#34C759`,in_process:`#007AFF`,pending:`#ccc`,failed:`#FF3B30`},Do={approved:`Aprobado`,in_process:`En proceso`,pending:`Pendiente`,failed:`Fallido`};function Oo(e){let t=(e||``).toLowerCase();for(let[e,n]of Object.entries(To))if(t.includes(e))return n;return t.includes(`escala`)?`🎼`:t.includes(`arpegio`)?`🎹`:t.includes(`mano`)||t.includes(`izquierda`)?`✋`:t.includes(`arco`)?`🎻`:t.includes(`sonido`)?`🔊`:t.includes(`afinación`)||t.includes(`entonación`)?`🎵`:t.includes(`estudio`)?`⚙️`:t.includes(`repertorio`)||t.includes(`obra`)?`📖`:`📋`}async function ko(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=N();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let{data:n}=await j.from(`clases`).select(`id, nombre`).eq(`maestro_id`,t.id).order(`nombre`);if(!n||n.length===0){e.innerHTML=`<p class="pm-empty">No tienes clases asignadas.</p>`;return}let{data:r}=await j.from(`inscripciones`).select(`alumno_id, alumnos(id, nombre, apellido)`).in(`clase_id`,n.map(e=>e.id));e.innerHTML=`
      <div class="pm-progress-root">
        <div class="pm-progress-header">
          <h2><i class="bi bi-trophy"></i> Progresos y Logros</h2>
          <select id="pm-student-select" class="pm-input">
            <option value="">Seleccionar alumno...</option>
            ${[...new Map(r?.map(e=>[e.alumnos.id,e.alumnos])||[]).values()].map(e=>`<option value="${e.id}">${L(e.nombre)} ${L(e.apellido)}</option>`).join(``)}
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
    `,e.querySelector(`#pm-student-select`).addEventListener(`change`,async t=>{let n=t.target.value;if(!n){e.querySelector(`#pm-progress-content`).innerHTML=``;return}await Ao(e,n)})}catch(t){e.innerHTML=`<p class="pm-empty">Error: ${L(t.message)}</p>`}}async function Ao(e,t){let n=e.querySelector(`#pm-progress-content`);n.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let{data:e}=await j.from(`alumnos`).select(`nombre, apellido`).eq(`id`,t).single(),{data:r}=await j.from(`academic_plans`).select(`id, route_version_id, status`).eq(`student_id`,t).in(`status`,[`in_process`,`active`]).order(`created_at`,{ascending:!1}).limit(1).maybeSingle();if(!r){n.innerHTML=`
        <div class="pm-empty-state">
          <p>Este alumno no tiene un plan académico activo.</p>
          <a href="#/ruta-plan-builder?id=${t}" class="pm-btn pm-btn-primary" style="display:inline-block;margin-top:0.5rem;">
            Crear Plan
          </a>
        </div>
      `;return}let{data:i}=await j.from(`levels`).select(`*`).eq(`route_version_id`,r.route_version_id).order(`level_number`,{ascending:!0}),{data:a}=await j.from(`student_level_progress`).select(`*`).eq(`student_id`,t),{data:o}=await j.from(`nodes`).select(`*, indicators(*)`).in(`level_id`,(i||[]).map(e=>e.id)).order(`order_index`,{ascending:!0}),{data:s}=await j.from(`student_node_progress`).select(`*, indicator_attempts(*)`).eq(`student_id`,t),c=(a||[]).filter(e=>e.status===`approved`).length,l=i?.length||0,u=l>0?Math.round(c/l*100):0;n.innerHTML=`
      <div class="pm-student-summary">
        <div class="pm-summary-row">
          <span class="pm-summary-label">Alumno</span>
          <span class="pm-summary-value">${L(e.nombre)} ${L(e.apellido)}</span>
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
                  Nivel ${e.level_number}: ${L(e.name)}
                </div>
                <div class="pm-level-obj">${L(e.main_objective||``)}</div>
                <div class="pm-level-nodes">
                  ${n.map(e=>{let t=s?.find(t=>t.node_id===e.id),n=t?.status||`pending`,r=e.indicators||[],i=t?.indicator_attempts||[];return`
                      <div class="pm-node-card" onclick="this.classList.toggle('expanded')">
                        <div class="pm-node-icon">${Oo(e.name)}</div>
                        <div class="pm-node-info">
                          <span class="pm-node-name">${L(e.name)}</span>
                          <span class="pm-node-status">${Do[n]}</span>
                        </div>
                        ${e.is_critical?`<span style="color:var(--pm-danger);font-size:0.6rem;font-weight:700;">CRÍTICO</span>`:``}
                        <div class="pm-indicators">
                          ${r.length===0?`<p style="font-size:0.7rem;color:var(--pm-text-muted);">Sin indicadores</p>`:r.map(e=>{let t=i.find(t=>t.indicator_id===e.id);return`
                                <div class="pm-indicator">
                                  <span class="pm-indicator-dot" style="background:${Eo[t?.status||`pending`]};"></span>
                                  <span class="pm-indicator-desc">${L(e.description)}</span>
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
    `}catch(e){n.innerHTML=`<p class="pm-empty">Error: ${L(e.message)}</p>`}}async function jo(e){let t=(await g())?.find(t=>t.id===e)?.instrumento;if(!t)return null;let n=t.split(`,`)[0].trim().toLowerCase(),{data:r,error:i}=await j.from(`routes`).select(`id, route_versions!inner(id)`).ilike(`instrument`,`%${n}%`).eq(`route_versions.status`,`published`).limit(1).maybeSingle();return i?(console.warn(`[rutaService] resolveRutaIdForClase error:`,i.message),null):r?.route_versions?.[0]?.id||r?.route_versions?.id||null}async function Mo(e,t){let{data:n,error:r}=await j.from(`blocks`).select(`id, nombre:name, order_index`).eq(`route_version_id`,e).order(`order_index`,{ascending:!0});if(r)throw Error(`[rutaService] blocks: `+r.message);if(!n||n.length===0)return[];let i=n.map(e=>e.id),{data:a,error:o}=await j.from(`levels`).select(`id, block_id, nombre:name, order_index`).in(`block_id`,i).eq(`route_version_id`,e).order(`order_index`,{ascending:!0});if(o)throw Error(`[rutaService] levels: `+o.message);let s=(a??[]).map(e=>e.id);if(s.length===0)return n.map(e=>({...e,levels:[]}));let{data:c,error:l}=await j.from(`nodes`).select(`id, level_id, nombre:name, order_index`).in(`level_id`,s).eq(`route_version_id`,e).order(`order_index`,{ascending:!0});if(l)throw Error(`[rutaService] nodes: `+l.message);let u=(c??[]).map(e=>e.id),{data:d,error:f}=u.length>0?await j.from(`indicators`).select(`id, node_id, nombre:description, order_index`).in(`node_id`,u).eq(`activo`,!0).order(`order_index`,{ascending:!0}):{data:[],error:null};if(f)throw Error(`[rutaService] indicators: `+f.message);let p=await Promise.all((c??[]).map(e=>Kr(e.id,t).then(t=>({nodeId:e.id,semaphore:t.semaphore})).catch(()=>({nodeId:e.id,semaphore:`gray`})))),m=new Map(p.map(e=>[e.nodeId,e.semaphore])),h=new Map;for(let e of d??[])h.has(e.node_id)||h.set(e.node_id,[]),h.get(e.node_id).push({...e,semaphore:m.get(e.node_id)??`gray`});let g=new Map;for(let e of c??[])g.has(e.level_id)||g.set(e.level_id,[]),g.get(e.level_id).push({...e,semaphore:m.get(e.id)??`gray`,indicators:h.get(e.id)??[]});let _=new Map;for(let[e]of i.map(e=>[e]))_.set(e,[]);let v=new Map;for(let e of a??[])v.has(e.block_id)||v.set(e.block_id,[]),v.get(e.block_id).push(e);for(let[e,t]of v){let n=t.map((e,t,n)=>{let r=g.get(e.id)??[],i=r.flatMap(e=>h.get(e.id)??[]),a=i.filter(e=>(m.get(e.node_id)??`gray`)===`green`).length,o=i.length>0?Math.round(a/i.length*100):0,s=r.map(e=>e.semaphore),c=s.every(e=>e===`green`)&&s.length>0?`green`:s.every(e=>e===`gray`)||s.length===0?`gray`:`yellow`,l=!1;if(t>0){let e=n[t-1],r=(g.get(e.id)??[]).flatMap(e=>h.get(e.id)??[]),i=r.filter(e=>(m.get(e.node_id)??`gray`)===`green`).length;l=r.length>0&&i/r.length<.8}return{...e,semaphore:c,locked:l,percentage:o,nodes:r}});_.set(e,n)}return n.map(e=>({...e,levels:_.get(e.id)??[]}))}var No=new Map,Po={on(e,t){No.has(e)||No.set(e,[]),No.get(e).push(t)},off(e,t){if(!No.has(e))return;let n=No.get(e),r=n.indexOf(t);r>-1&&n.splice(r,1)},emit(e,t){No.has(e)&&No.get(e).forEach(n=>{try{n(t)}catch(t){console.error(`[rutaEventEmitter] Error in listener for ${e}:`,t)}})},clearAllListeners(){No.clear()}};function Fo(e,t){let{blockId:n,blockName:r,isExpanded:i,childCount:a,onToggle:o}=t;e.innerHTML=`
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
  `,e.querySelector(`.block-section-header`)?.addEventListener(`click`,()=>{o(n)})}var Io=()=>typeof global<`u`&&global.getMaestroLocal?global.getMaestroLocal():N(),Lo=(...e)=>typeof global<`u`&&global.getMisClases?global.getMisClases(...e):g(...e),Ro=(...e)=>typeof global<`u`&&global.loadRouteTree?global.loadRouteTree(...e):Mo(...e),X={clases:[],activeClaseId:null,rutaId:null,blocks:[],loading:!1,expandedBlocks:new Set,expandedLevels:new Set,selectedIndicator:null,onTopicSelected:null},zo=!1;async function Bo(e,{onTopicSelected:t}={}){if(X={clases:[],activeClaseId:null,rutaId:null,blocks:[],loading:!1,expandedBlocks:new Set,expandedLevels:new Set,selectedIndicator:null,onTopicSelected:t},e.innerHTML=`<div class="pm-ruta-gamificada"><div class="pm-loading"><div class="pm-spinner"></div></div></div>`,!Io()){e.innerHTML=`<div class="pm-ruta-gamificada"><p class="pm-empty">No hay sesión activa.</p></div>`;return}try{if(re(),X.clases=await Lo(!0),!X.clases?.length){e.innerHTML=`<div class="pm-ruta-gamificada"><p class="pm-empty">No tenés clases asignadas.</p></div>`;return}X.activeClaseId=X.clases[0].id,await Vo(),Ho(e),Ko(e),qo(e)}catch(t){console.error(`[rutaGameificadaView]`,t),e.innerHTML=`<div style="color:red;padding:20px;"><i class="bi bi-exclamation"></i> Error: ${t.message}</div>`}}async function Vo(){X.loading=!0,X.rutaId=await jo(X.activeClaseId),X.rutaId?X.blocks=await Ro(X.rutaId,X.activeClaseId):X.blocks=[],X.loading=!1}function Ho(e){e.innerHTML=`
    <div class="pm-ruta-gamificada">
      <div class="pm-ruta-gamificada-container" style="max-width: 800px; margin: 0 auto; padding-bottom: 100px;">
        <div id="ruta-header" style="background: white; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #e2e8f0; padding: 16px;">
          <div class="d-flex align-items-center justify-content-between">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b;">Mi Ruta</h2>
            <select id="ruta-clase-select" style="padding: 6px 12px; border-radius: 20px; border: 1px solid #cbd5e1; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
              ${X.clases.map(e=>`<option value="${e.id}" ${e.id===X.activeClaseId?`selected`:``}>${e.nombre}</option>`).join(``)}
            </select>
          </div>
        </div>
        
        <div id="ruta-tree-area" style="padding-top: 8px;"></div>
      </div>
      <div id="ruta-action-panel"></div>
    </div>
  `;let t=e.querySelector(`#ruta-tree-area`);if(!X.rutaId){t.innerHTML=`<div style="padding:60px; text-align:center; color:#94a3b8;"><i class="bi bi-map fs-1 d-block mb-3"></i>No se encontró ruta publicada para esta clase.</div>`;return}if(X.blocks.length===0){t.innerHTML=`<div style="padding:60px; text-align:center; color:#94a3b8;">La ruta no tiene bloques configurados.</div>`;return}X.blocks.forEach(n=>{let r=document.createElement(`div`);if(t.appendChild(r),Fo(r,{blockId:n.id,blockName:n.nombre,isExpanded:X.expandedBlocks.has(n.id),childCount:n.levels?.length||0,onToggle:t=>{X.expandedBlocks.has(t)?X.expandedBlocks.delete(t):X.expandedBlocks.add(t),Ho(e)}}),X.expandedBlocks.has(n.id)){let t=r.querySelector(`.block-section-content`);n.levels.forEach(n=>{t.appendChild(Uo(n,e))})}}),Wo(e)}function Uo(e,t){let n=document.createElement(`div`);n.className=`pm-level-row`,n.style.cssText=`
    border-bottom: 1px solid #f1f5f9;
    background: ${e.locked?`#f8fafc`:`white`};
    opacity: ${e.locked?`0.7`:`1`};
  `;let r=X.expandedLevels.has(e.id);return n.innerHTML=`
    <div class="level-header" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: ${e.locked?`not-allowed`:`pointer`};">
      <div class="level-icon" style="width: 32px; height: 32px; border-radius: 8px; background: ${Go(e.semaphore)}; display: flex; align-items: center; justify-content: center; color: white;">
        <i class="bi ${e.locked?`bi-lock-fill`:`bi-layers`}"></i>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.9rem; color: #334155;">${e.nombre}</div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
          <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
            <div style="width: ${e.percentage}%; height: 100%; background: ${Go(e.semaphore)}; transition: width 0.3s ease;"></div>
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
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${Go(t.semaphore)};"></span>
            <span style="font-weight: 600; font-size: 0.85rem; color: #475569;">${t.nombre}</span>
          </div>
          <div class="indicators-list" style="display: flex; flex-direction: column; gap: 4px;">
            ${(t.indicators||[]).map(n=>`
              <div class="indicator-row" 
                data-id="${n.id}" 
                data-nombre="${n.nombre}"
                data-node="${t.nombre}"
                data-level="${e.nombre}"
                data-block="${X.blocks.find(t=>t.id===e.block_id)?.nombre||``}"
                style="padding: 6px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; border: 1px solid ${X.selectedIndicator?.id===n.id?`#3b82f6`:`transparent`}; background: ${X.selectedIndicator?.id===n.id?`#eff6ff`:`white`}; transition: all 0.2s;"
              >
                ${n.nombre}
              </div>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    </div>
  `,e.locked||n.querySelector(`.level-header`).addEventListener(`click`,()=>{X.expandedLevels.has(e.id)?X.expandedLevels.delete(e.id):X.expandedLevels.add(e.id),Ho(t)}),n.querySelectorAll(`.indicator-row`).forEach(e=>{e.addEventListener(`click`,n=>{n.stopPropagation(),X.selectedIndicator={id:e.dataset.id,nombre:e.dataset.nombre,nodeNombre:e.dataset.node,levelNombre:e.dataset.level,blockNombre:e.dataset.block},Ho(t)})}),n}function Wo(e){let t=e.querySelector(`#ruta-action-panel`);if(!X.selectedIndicator){t.innerHTML=``;return}t.innerHTML=`
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 20px rgba(0,0,0,0.08); padding: 16px; z-index: 100;">
      <div style="max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div style="flex: 1; overflow: hidden;">
          <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 2px;">
            ${X.selectedIndicator.blockNombre} › ${X.selectedIndicator.levelNombre}
          </div>
          <div style="font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${X.selectedIndicator.nombre}
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
  `,t.querySelector(`#btn-cancel-select`).addEventListener(`click`,()=>{X.selectedIndicator=null,Ho(e)}),t.querySelector(`#btn-use-topic`).addEventListener(`click`,()=>{yi({...X.selectedIndicator,indicatorId:X.selectedIndicator.id,claseId:X.activeClaseId}),X.onTopicSelected&&X.onTopicSelected(X.activeClaseId)})}function Go(e){switch(e){case`green`:return`#22c55e`;case`yellow`:return`#eab308`;case`gray`:return`#94a3b8`;default:return`#94a3b8`}}function Ko(e){e.querySelector(`#ruta-clase-select`)?.addEventListener(`change`,async t=>{X.activeClaseId=t.target.value,e.innerHTML=`<div class="pm-ruta-gamificada"><div class="pm-loading"><div class="pm-spinner"></div></div></div>`,await Vo(),Ho(e),Ko(e)})}function qo(e){zo||(zo=!0,Po.on(`node-covered`,()=>{Vo().then(()=>{Ho(e),Ko(e)})}))}var Jo=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`,`domingo`];async function Yo(e){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=N();if(!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let{data:n}=await j.from(`system_config`).select(`value`).eq(`key`,`maestros_pueden_crear_clases`).maybeSingle();if(n?.value!==`true`){e.innerHTML=`
        <div class="pm-empty" style="text-align:center;padding:3rem 1rem;">
          <i class="bi bi-lock" style="font-size:3rem;color:var(--pm-text-muted);"></i>
          <p style="margin-top:1rem;"><strong>Crear clases deshabilitado</strong></p>
          <p style="font-size:0.85rem;color:var(--pm-text-muted);">Solo los administradores pueden crear nuevas clases. Contacta al admin si necesitas una nueva clase.</p>
        </div>
      `;return}let{data:r}=await j.from(`instrumentos`).select(`id, nombre`).order(`nombre`),{data:i}=await j.from(`maestros`).select(`id, nombre, email`).neq(`id`,t.id).order(`nombre`);e.innerHTML=`
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
              ${(r||[]).map(e=>`<option value="${e.id}">${L(e.nombre)}</option>`).join(``)}
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
                ${Jo.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
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
            <input type="text" class="pm-input" value="${L(t.nombre_completo||t.nombre||`Tú`)}" disabled>
            <input type="hidden" id="nueva-clase-maestro-titular" value="${t.id}">
          </div>

          <div class="pm-form-group">
            <label class="pm-label">Maestro auxiliar (opcional)</label>
            <select id="nueva-clase-maestro-aux" class="pm-input">
              <option value="">Sin maestro auxiliar</option>
              ${(i||[]).map(e=>`<option value="${e.id}">${L(e.nombre||e.email)}</option>`).join(``)}
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
          ${Jo.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1)}</option>`).join(``)}
        </select>
        <input type="time" class="pm-input pm-horario-inicio" value="15:30">
        <span>a</span>
        <input type="time" class="pm-input pm-horario-fin" value="17:00">
        <button class="pm-btn-remove" type="button"><i class="bi bi-x"></i></button>
      `,n.querySelector(`.pm-btn-remove`).onclick=()=>n.remove(),e.appendChild(n)},document.getElementById(`btn-guardar-clase`).onclick=async()=>{let e=document.getElementById(`nueva-clase-nombre`).value.trim(),n=document.getElementById(`nueva-clase-instrumento`).value,r=parseInt(document.getElementById(`nueva-clase-capacidad`).value)||10,i=document.getElementById(`nueva-clase-salon`).value.trim(),a=document.getElementById(`nueva-clase-maestro-aux`).value;if(!e){alert(`El nombre de la clase es obligatorio`);return}if(!n){alert(`Selecciona un instrumento`);return}let o=document.getElementById(`btn-guardar-clase`);o.disabled=!0,o.textContent=`Creando...`;try{let{data:o,error:s}=await j.from(`clases`).insert({nombre:e,instrumento_id:n,capacidad_maxima:r,salon:i,maestro_principal_id:t.id,maestro_suplente_id:a||null,activo:!0}).select().single();if(s)throw s;let c=document.querySelectorAll(`.pm-horario-row`),l=[];for(let e of c){let t=e.querySelector(`.pm-horario-dia`).value,n=e.querySelector(`.pm-horario-inicio`).value,r=e.querySelector(`.pm-horario-fin`).value;t&&n&&r&&l.push({clase_id:o.id,dia:t,hora_inicio:n,hora_fin:r})}if(l.length>0){let{error:e}=await j.from(`clase_horarios`).insert(l);if(e)throw e}alert(`¡Clase creada exitosamente!`),window.location.hash=`#/calendario`}catch(e){console.error(e),alert(`Error al crear la clase: `+e.message),o.disabled=!1,o.textContent=`Crear Clase`}},document.getElementById(`btn-cancelar-clase`).onclick=()=>{window.history.back()}}catch(t){e.innerHTML=`
      <div class="pm-empty" style="color:var(--pm-danger)">
        Error: ${L(t.message)}
      </div>
    `}}async function Xo(e,{alumnoId:t}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let n=await I.getStudent(t),r=await I.fetchRoutes();e.innerHTML=`
      <div class="pm-asist-header">
        <h2 class="apple-display-md">Asignar Ruta</h2>
        <p class="apple-caption">Configura el plan académico para <strong>${L(n.name)} ${L(n.last_name||``)}</strong></p>
      </div>

      <div class="card-apple pm-animate-slide-up" style="margin-top: 1.5rem; padding: 1.5rem;">
        <div class="mb-4">
          <label class="apple-label" style="display: block; margin-bottom: 0.5rem;">Seleccionar Ruta</label>
          <select id="route-selector" class="input-apple">
            <option value="" disabled selected>Elegí una ruta...</option>
            ${r.map(e=>`<option value="${e.id}">${L(e.name)} (${e.instrument_id||`General`})</option>`).join(``)}
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
    `;let i=e.querySelector(`#route-selector`),a=e.querySelector(`#level-selection-container`),o=e.querySelector(`#level-selector`),s=e.querySelector(`#btn-create-plan`),c=e.querySelector(`#plan-summary`),l=null,u=null,d=null;i.addEventListener(`change`,async e=>{l=e.target.value,a.style.display=`block`,o.innerHTML=`<option value="" disabled selected>Cargando niveles...</option>`,s.disabled=!0;try{let{data:e}=await j.from(`route_versions`).select(`id`).eq(`route_id`,l).eq(`is_current`,!0).single();u=e.id,d=await I.getRouteDetail(l);let t=[];d.forEach(e=>{e.levels.forEach(n=>{t.push({id:n.id,name:n.name,blockName:e.name})})}),o.innerHTML=`
          <option value="" disabled selected>Seleccioná nivel inicial...</option>
          ${t.map(e=>`<option value="${e.id}">${L(e.blockName)} - ${L(e.name)}</option>`).join(``)}
        `}catch(e){console.error(`Error loading route detail:`,e),o.innerHTML=`<option value="" disabled>Error al cargar niveles</option>`}}),o.addEventListener(`change`,()=>{s.disabled=!1;let e=o.value,t=null;d.forEach(n=>{let r=n.levels.find(t=>t.id===e);r&&(t={...r,blockName:n.name})}),t&&(c.innerHTML=`
          <div style="text-align: left;">
            <p class="apple-caption" style="margin-bottom: 0.25rem; font-weight: 600; color: var(--pm-primary);">Resumen del Nivel:</p>
            <h4 style="margin: 0; font-size: 1rem;">${L(t.blockName)} - ${L(t.name)}</h4>
            <p class="apple-caption" style="margin-top: 0.25rem;">
              Contiene ${t.nodes?.length||0} competencias y 
              ${t.nodes?.reduce((e,t)=>e+(t.indicators?.length||0),0)} indicadores medibles.
            </p>
          </div>
        `)}),s.addEventListener(`click`,async()=>{s.disabled=!0,s.innerHTML=`<div class="pm-spinner pm-spinner-sm"></div> Creando...`;try{await I.createAcademicPlan(t,u),await j.from(`student_level_progress`).upsert({student_id:t,level_id:o.value,status:`in_process`}),alert(`Plan académico creado con éxito`),window.location.hash=`#/alumno?id=${t}`}catch(e){console.error(`Error creating plan:`,e),alert(`Error al crear el plan: `+e.message),s.disabled=!1,s.textContent=`Comenzar Plan Académico`}})}catch(t){e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error: ${L(t.message)}</p></div>`}}async function Zo(e,{alumnoId:t}){e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let{data:n,error:r}=await j.from(`academic_plans`).select(`*, route_versions(route_id, version_number, routes(name, instrument_id))`).eq(`student_id`,t).eq(`status`,`in_process`).maybeSingle();if(r)throw r;if(!n){e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-journal-x"></i>
          <p>El alumno no tiene un plan académico activo.</p>
          <button class="btn-apple-primary mt-3" onclick="window.location.hash='#/ruta-plan-builder?id=${t}'">
            Asignar Ruta
          </button>
        </div>
      `;return}let i=await I.getRouteDetail(n.route_versions.route_id),{data:a,error:o}=await j.from(`weekly_plan_entries`).select(`*`).eq(`academic_plan_id`,n.id).order(`start_date`,{ascending:!1});if(o)throw o;e.innerHTML=`
      <div class="pm-asist-header">
        <h2 class="apple-display-md">Planificación Semanal</h2>
        <p class="apple-caption">${L(n.route_versions.routes.name)} - v${n.route_versions.version_number}</p>
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
              ${(e.planned_nodes||[]).map(e=>`<span class="badge-apple" style="background: var(--pm-bg-alt); font-size: 0.7rem;">${L(e.title)}</span>`).join(``)}
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
                  <small style="font-weight: 700; color: var(--pm-text-muted); text-transform: uppercase; font-size: 0.65rem;">${L(e.name)}</small>
                  ${e.levels.map(e=>`
                    ${e.nodes.map(e=>`
                      <div class="form-check" style="padding-left: 1.5rem; margin-top: 0.25rem;">
                        <input class="form-check-input node-checkbox" type="checkbox" value="${e.id}" data-title="${L(e.title)}" id="node-${e.id}">
                        <label class="form-check-label" for="node-${e.id}" style="font-size: 0.85rem;">
                          ${L(e.title)}
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
    `;let s=e.querySelector(`#planning-modal`),c=e.querySelector(`#btn-new-week`),l=e.querySelector(`#btn-cancel-modal`),u=e.querySelector(`#btn-save-planning`);c.addEventListener(`click`,()=>{let t=new Date,n=new Date(t);n.setDate(t.getDate()+(8-t.getDay())%7);let r=new Date(n);r.setDate(n.getDate()+6),e.querySelector(`#start-date`).value=n.toISOString().split(`T`)[0],e.querySelector(`#end-date`).value=r.toISOString().split(`T`)[0],s.style.display=`flex`}),l.addEventListener(`click`,()=>{s.style.display=`none`}),u.addEventListener(`click`,async()=>{let r=e.querySelector(`#start-date`).value,o=e.querySelector(`#end-date`).value,s=e.querySelector(`#week-focus`).value,c=Array.from(e.querySelectorAll(`.node-checkbox:checked`)).map(e=>({node_id:e.value,title:e.dataset.title})),l=[];i.forEach(e=>e.levels.forEach(e=>e.nodes.forEach(e=>{c.some(t=>t.node_id===e.id)&&e.indicators.forEach(t=>{l.push({indicator_id:t.id,description:t.description,node_id:e.id,node_name:e.title,is_critical:e.is_critical})})})));try{u.disabled=!0,u.innerHTML=`<div class="pm-spinner pm-spinner-sm"></div> Guardando...`,await I.createWeeklyEntry(n.id,{week_number:a.length+1,start_date:r,end_date:o,focus:s,planned_nodes:c,planned_indicators:l}),alert(`Planificación guardada`),Zo(e,{alumnoId:t})}catch(e){alert(`Error: `+e.message),u.disabled=!1,u.textContent=`Guardar`}})}catch(t){e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error: ${L(t.message)}</p></div>`}}var Qo={async render(){let e=document.createElement(`div`);return e.className=`pm-view pm-animate-fade-in`,e.innerHTML=`
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
    `,this.loadRoutes(e),e},async loadRoutes(e){let t=e.querySelector(`#routes-grid`);try{let n=await I.fetchRoutes();if(!n||n.length===0){t.innerHTML=`
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
      `}}},$o={async render(e){let t=e?.id,n=new URLSearchParams(window.location.hash.split(`?`)[1]).get(`studentId`),r=document.createElement(`div`);return r.className=`pm-view pm-animate-fade-in`,r.innerHTML=`
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
    `,r.querySelector(`#back-to-library`).onclick=()=>{window.location.hash=`#/ruta-libreria`},t?this.loadRouteDetail(r,t,n):r.innerHTML=`<div class="pm-placeholder"><i class="bi bi-x-circle"></i><p>ID de ruta no proporcionado.</p></div>`,r},async loadRouteDetail(e,t,n){let r=e.querySelector(`#route-header-content`),i=e.querySelector(`#route-hierarchy`);try{let[e,a]=await Promise.all([I.getRouteDetail(t),n?I.getStudentProgress(n,t):Promise.resolve([])]),o=new Map(a.map(e=>[e.node_id,e]));if(r.innerHTML=`
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
                ${e.nodes.map(e=>{let t=o.get(e.id)?.status||`pending`,n=I.getStatusToken(t);return`
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
      `).join(``)}catch(e){console.error(`Error al cargar detalle de ruta:`,e),i.innerHTML=`<p class="pm-error-msg">Error al cargar la estructura académica.</p>`}}};function es(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function ts(e){return String(e||`?`).trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function ns(e){if(!e||e.length===0)return`<span style="color:var(--pm-text-muted);font-size:.8rem;">Sin horario asignado</span>`;let t={lunes:`Lun`,martes:`Mar`,miercoles:`Mié`,miércoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sabado:`Sáb`,sábado:`Sáb`,domingo:`Dom`};return e.map(e=>`<span class="gcv-horario-chip">${t[e.dia]||e.dia||``} ${(e.hora_inicio||``).slice(0,5)}–${(e.hora_fin||``).slice(0,5)}</span>`).join(` `)}var rs=null,is=[],as=new Set;async function os(e){e.innerHTML=ys();let t=N();if(!t){e.innerHTML=bs(`bi-lock`,`Sin sesión activa`,`Por favor ingresá nuevamente.`);return}try{let n=await Ue(t.id);if(!n.puede_inscribir_clases){e.innerHTML=cs(n),ls(t.id);return}let[r,i]=await Promise.all([ne(t.id),f().catch(()=>[])]);is=i.filter(e=>e.activo!==!1&&e.is_active!==!1),e.innerHTML=us(r),gs(r),r.length>0&&await fs(r[0].id,r)}catch(t){console.error(`[GestionarClases]`,t),e.innerHTML=bs(`bi-exclamation-triangle`,`Error al cargar`,es(t.message))}}function ss(e){let t=e?.solicitudes||[],n=e?.solicitud_actual;return t.includes(`clases:enroll`)||t.includes(`inscribir_clases`)||n?.estado===`pendiente`&&n?.solicita_clases}function cs(e){return`
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
          ${ss(e)?`
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
  `}function ls(e){let t=document.getElementById(`gcv-btn-request-classes`);t&&t.addEventListener(`click`,async()=>{t.disabled=!0;let n=t.innerHTML;t.innerHTML=`<span class="gcv-spinner-sm"></span> Enviando...`;try{await He(e,`clases:enroll`),F.success(`Solicitud de permiso enviada correctamente.`);let t=document.getElementById(`gcv-permission-action`);t&&(t.innerHTML=`
          <div class="gcv-pending-badge">
            <i class="bi bi-clock-history"></i>
            Solicitud Pendiente de Aprobación
          </div>`)}catch(e){F.error(`Error al solicitar: `+e.message),t.disabled=!1,t.innerHTML=n}})}function us(e){return`
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

      ${e.length===0?bs(`bi-calendar-x`,`Sin clases asignadas`,`El administrador debe asignarte clases primero.`):`<div class="gcv-layout">
            <div class="gcv-clase-list" id="gcv-clase-list">
              ${e.map(e=>ds(e)).join(``)}
            </div>
            <div class="gcv-panel" id="gcv-panel">
              <div class="gcv-panel-placeholder">
                <i class="bi bi-arrow-left-circle" style="font-size:2.5rem;opacity:.3;"></i>
                <p style="margin-top:.75rem;opacity:.4;">Seleccioná una clase</p>
              </div>
            </div>
          </div>`}
    </div>
  `}function ds(e){let t=es(e.nombre||`Clase sin nombre`),n=ns(e.horarios||[]),r=es(e.nivel||``),i=e.capacidad_maxima??e.max_alumnos??`–`;return`
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
  `}async function fs(e,t){rs=e,document.querySelectorAll(`.gcv-clase-card`).forEach(e=>e.classList.remove(`active`)),document.getElementById(`gcv-card-${e}`)?.classList.add(`active`);let n=document.getElementById(`gcv-panel`);if(!n)return;let r=t.find(t=>t.id===e);if(r){n.innerHTML=`<div class="gcv-loading"><div class="gcv-spinner"></div></div>`;try{let i=await k(e),a=i.map(e=>e.alumno).filter(Boolean);as=new Set(i.map(e=>e.alumno_id)),n.innerHTML=ps(r,a,is.filter(e=>!as.has(e.id))),_s(e,t)}catch(e){n.innerHTML=bs(`bi-exclamation-circle`,`Error al cargar alumnos`,es(e.message))}}}function ps(e,t,n){return`
    <div class="gcv-panel-inner">
      <div class="gcv-panel-header">
        <h3 class="gcv-panel-title"><i class="bi bi-people-fill"></i> ${es(e.nombre||`Clase`)}</h3>
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
          ${t.length===0?`<p class="gcv-empty-list">Sin alumnos inscritos aún.</p>`:t.map(e=>ms(e)).join(``)}
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
          ${n.length===0?`<p class="gcv-empty-list">Todos los alumnos activos ya están inscritos.</p>`:n.map(e=>hs(e)).join(``)}
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
  `}function ms(e){let t=es(e.nombre_completo||e.nombre||`Alumno`),n=es(e.instrumento_principal||e.instrumento||``);return`
    <div class="gcv-student-row inscrito-item"
         data-alumno-id="${e.id}"
         data-name="${t.toLowerCase()}"
         data-instrumento="${n.toLowerCase()}">
      <div class="gcv-student-avatar gcv-avatar-success">${ts(t)}</div>
      <div class="gcv-student-data">
        <span class="gcv-student-name">${t}</span>
        ${n?`<span class="gcv-student-sub"><i class="bi bi-music-note"></i> ${n}</span>`:``}
      </div>
      <button type="button" class="gcv-btn-remove desinscribir-btn" data-alumno-id="${e.id}" title="Quitar de la clase">
        <i class="bi bi-person-x"></i>
      </button>
    </div>
  `}function hs(e){let t=es(e.nombre_completo||e.nombre||`Alumno`),n=es(e.instrumento_principal||e.instrumento||``);return`
    <label class="gcv-student-row gcv-student-selectable disponible-item"
           data-alumno-id="${e.id}"
           data-name="${t.toLowerCase()}"
           data-instrumento="${n.toLowerCase()}">
      <input class="gcv-checkbox" type="checkbox" value="${e.id}" />
      <div class="gcv-student-avatar gcv-avatar-primary">${ts(t)}</div>
      <div class="gcv-student-data">
        <span class="gcv-student-name">${t}</span>
        ${n?`<span class="gcv-student-sub"><i class="bi bi-music-note"></i> ${n}</span>`:``}
      </div>
    </label>
  `}function gs(e){document.getElementById(`gcv-clase-list`)?.addEventListener(`click`,async t=>{let n=t.target.closest(`.gcv-clase-card`);if(!n)return;let r=n.dataset.claseId;r&&r!==rs&&await fs(r,e)})}function _s(e,t){document.getElementById(`gcv-search`)?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();document.querySelectorAll(`.inscrito-item`).forEach(e=>{let n=!t||(e.dataset.name||``).includes(t)||(e.dataset.instrumento||``).includes(t);e.style.display=n?``:`none`}),document.querySelectorAll(`.disponible-item`).forEach(e=>{let n=!t||(e.dataset.name||``).includes(t)||(e.dataset.instrumento||``).includes(t);e.style.display=n?``:`none`})}),document.getElementById(`gcv-btn-nuevo`)?.addEventListener(`click`,()=>{document.getElementById(`gcv-new-form`)?.classList.remove(`d-none`),document.getElementById(`gcv-nuevo-nombre`)?.focus()}),document.getElementById(`gcv-btn-cancelar-nuevo`)?.addEventListener(`click`,vs),document.getElementById(`gcv-btn-guardar-nuevo`)?.addEventListener(`click`,async()=>{let n=document.getElementById(`gcv-nuevo-nombre`).value.trim(),r=document.getElementById(`gcv-nuevo-instrumento`).value.trim(),i=document.getElementById(`gcv-nuevo-telefono`).value.trim();if(!n||!r||!i){F.error(`Nombre, instrumento y teléfono son obligatorios`);return}let a=document.getElementById(`gcv-btn-guardar-nuevo`);a.disabled=!0,a.innerHTML=`<span class="gcv-spinner-sm"></span> Guardando...`;try{await o(e,(await l({nombre_completo:n,instrumento_principal:r,familiar_telefono:i,activo:!0})).id),F.success(`${n} registrado e inscrito exitosamente`),is=(await f().catch(()=>is)).filter(e=>e.activo!==!1&&e.is_active!==!1),await fs(e,t)}catch(e){F.error(`Error: `+e.message),a.disabled=!1,a.innerHTML=`<i class="bi bi-floppy"></i> Guardar e inscribir`}}),document.getElementById(`gcv-lista-inscritos`)?.addEventListener(`click`,async n=>{let r=n.target.closest(`.desinscribir-btn`);if(!r)return;let i=r.dataset.alumnoId,a=r.closest(`.gcv-student-row`)?.querySelector(`.gcv-student-name`)?.textContent||`este alumno`;if(confirm(`¿Quitar a ${a} de esta clase?`)){r.disabled=!0,r.innerHTML=`<span class="gcv-spinner-sm"></span>`;try{await h(e,i),F.success(`${a} quitado de la clase`),await fs(e,t)}catch(e){F.error(`Error: `+e.message),r.disabled=!1,r.innerHTML=`<i class="bi bi-person-x"></i>`}}}),document.getElementById(`gcv-btn-inscribir`)?.addEventListener(`click`,async()=>{let n=[...document.querySelectorAll(`#gcv-lista-disponibles .gcv-checkbox:checked`)];if(!n.length){F.error(`Seleccioná al menos un alumno`);return}let r=document.getElementById(`gcv-btn-inscribir`);r.disabled=!0,r.innerHTML=`<span class="gcv-spinner-sm"></span> Inscribiendo...`;try{for(let t of n)await o(e,t.value);F.success(`${n.length} alumno${n.length>1?`s`:``} inscrito${n.length>1?`s`:``} correctamente`),await fs(e,t)}catch(e){F.error(`Error: `+e.message),r.disabled=!1,r.innerHTML=`<i class="bi bi-person-check"></i> Inscribir seleccionados`}})}function vs(){let e=document.getElementById(`gcv-new-form`);e&&e.classList.add(`d-none`),[`gcv-nuevo-nombre`,`gcv-nuevo-instrumento`,`gcv-nuevo-telefono`].forEach(e=>{let t=document.getElementById(e);t&&(t.value=``)})}function ys(){return`
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
  `}function bs(e,t,n){return`
    <div class="gcv-empty-state">
      <i class="bi ${e} gcv-empty-icon"></i>
      <p class="gcv-empty-title">${t}</p>
      <p class="gcv-empty-msg">${n}</p>
    </div>
  `}var xs=null,Ss=!1,Cs={enfermedad:`Médica`,personal:`Personal`,capacitacion:`Capacitación`,vacaciones:`Vacaciones`,otro:`Otro`};function ws(e){if(!e)return``;let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}function Ts(e){return e===`alta`?`<i class="bi bi-exclamation-circle-fill" style="color:#ef4444"></i>`:e===`media`?`<i class="bi bi-exclamation-circle-fill" style="color:#f59e0b"></i>`:`<i class="bi bi-info-circle-fill" style="color:#22c55e"></i>`}function Es(){if(document.getElementById(`admin-ausencias-insights-styles`))return;let e=document.createElement(`style`);e.id=`admin-ausencias-insights-styles`,e.textContent=`
    /* ── Admin Ausencias Insights Banner ── */
    #admin-ausencias-insights {
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%) translateY(-120%);
      z-index: 1080;
      width: min(92vw, 500px);
      background: rgba(30, 30, 46, 0.82);
      backdrop-filter: blur(20px) saturate(1.8);
      -webkit-backdrop-filter: blur(20px) saturate(1.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 1.25rem;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.35),
        0 1px 0 rgba(255,255,255,0.08) inset;
      padding: 0.85rem 1rem;
      transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.28s ease;
      opacity: 0;
      pointer-events: none;
      color: #f0f0f5;
    }

    [data-bs-theme="light"] #admin-ausencias-insights,
    [data-portal-theme="light"] #admin-ausencias-insights {
      background: rgba(255, 255, 255, 0.88);
      border-color: rgba(0,0,0,0.1);
      color: #1a1a2e;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.15),
        0 1px 0 rgba(255,255,255,0.6) inset;
    }

    #admin-ausencias-insights.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    .aai-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .aai-icon-wrap {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .aai-icon-wrap i {
      font-size: 1.1rem;
      color: #ef4444;
    }

    .aai-body {
      flex: 1;
      min-width: 0;
    }

    .aai-title {
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .aai-sub {
      font-size: 0.74rem;
      opacity: 0.72;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .aai-badge {
      background: #ef4444;
      color: #fff;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15em 0.55em;
      min-width: 1.4rem;
      text-align: center;
      flex-shrink: 0;
    }

    .aai-actions {
      display: flex;
      gap: 0.45rem;
      align-items: center;
    }

    .aai-btn-revisar {
      background: #ef4444;
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 0.32rem 0.9rem;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s;
      white-space: nowrap;
    }
    .aai-btn-revisar:hover { background: #dc2626; }

    .aai-btn-dismiss {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.45;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.2rem;
      line-height: 1;
      transition: opacity 0.18s;
    }
    .aai-btn-dismiss:hover { opacity: 0.85; }

    /* Preview list for single request */
    .aai-preview {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    [data-bs-theme="light"] .aai-preview,
    [data-portal-theme="light"] .aai-preview {
      border-color: rgba(0,0,0,0.1);
    }

    .aai-preview-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.76rem;
    }

    .aai-chip {
      background: rgba(255,255,255,0.1);
      border-radius: 999px;
      padding: 0.1em 0.6em;
      font-size: 0.7rem;
      font-weight: 500;
    }

    [data-bs-theme="light"] .aai-chip,
    [data-portal-theme="light"] .aai-chip {
      background: rgba(0,0,0,0.07);
    }

    /* ── Nav badge ── */
    .aai-nav-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #ef4444;
      color: #fff;
      border-radius: 999px;
      font-size: 0.6rem;
      font-weight: 700;
      min-width: 1.1rem;
      height: 1.1rem;
      padding: 0 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      pointer-events: none;
      z-index: 10;
    }

    /* Sidebar link needs relative positioning for badge */
    .pm-sidebar-link[data-route="admin-ausencias"],
    .pm-nav-tab[data-route="admin-ausencias"],
    .pm-sidebar-link[data-route="admin-notificaciones"],
    .pm-nav-tab[data-route="admin-notificaciones"] {
      position: relative;
    }
  `,document.head.appendChild(e)}function Ds(e){document.querySelectorAll(`[data-route="admin-ausencias"],[data-route="admin-notificaciones"]`).forEach(t=>{let n=t.querySelector(`.aai-nav-badge`);e>0?(n||(n=document.createElement(`span`),n.className=`aai-nav-badge`,t.appendChild(n)),n.textContent=e>99?`99+`:String(e),n.style.display=`flex`):n&&(n.style.display=`none`)})}function Os(){return xs||(xs=document.createElement(`div`),xs.id=`admin-ausencias-insights`,xs.setAttribute(`role`,`status`),xs.setAttribute(`aria-live`,`polite`),document.body.appendChild(xs),xs)}function ks(e){let t=Os(),n=e.length,r=e[0],i=n===1&&r?`
    <div class="aai-preview">
      <div class="aai-preview-row">
        ${Ts(r.urgencia)}
        <span>${r.maestros?.nombre_completo??`Maestro`}</span>
        <span class="aai-chip">${Cs[r.tipo_ausencia]??r.tipo_ausencia??`—`}</span>
        <span style="opacity:.7">${ws(r.fecha_inicio)}${r.fecha_fin&&r.fecha_fin!==r.fecha_inicio?` → `+ws(r.fecha_fin):``}</span>
      </div>
    </div>
  `:``;t.innerHTML=`
    <div class="aai-row">
      <div class="aai-icon-wrap">
        <i class="bi bi-calendar-x-fill"></i>
      </div>
      <div class="aai-body">
        <div class="aai-title">
          Solicitudes de Ausencia
          <span class="aai-badge">${n}</span>
        </div>
        <div class="aai-sub">${n===1?`Hay una solicitud esperando tu decisión`:`${n} maestros esperan tu aprobación`}</div>
      </div>
      <div class="aai-actions">
        <button class="aai-btn-revisar" id="aai-btn-revisar">
          <i class="bi bi-eye"></i> Revisar
        </button>
        <button class="aai-btn-dismiss" id="aai-btn-dismiss" title="Ocultar" aria-label="Ocultar alerta">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
    ${i}
  `,requestAnimationFrame(()=>{t.classList.add(`visible`)}),t.querySelector(`#aai-btn-revisar`)?.addEventListener(`click`,()=>{As(),window.router&&window.router.navigate(`admin-ausencias`)}),t.querySelector(`#aai-btn-dismiss`)?.addEventListener(`click`,()=>{js()})}function As(){xs&&xs.classList.remove(`visible`)}function js(){As();let e=Date.now()+1800*1e3;localStorage.setItem(`admin-ausencias-insights-dismiss`,String(e))}function Ms(){let e=localStorage.getItem(`admin-ausencias-insights-dismiss`);return e?Date.now()<Number(e):!1}var Ns={init(){window.adminAusenciasInsights=this,Es(),Os(),this.evaluate()},async evaluate(){if(!Ss){Ss=!0;try{if((window.router?.currentRoute?.()??``).split(`?`)[0]===`admin-ausencias`){As(),Ds((await c())?.length??0);return}if(Ms())return;let e=await c();if(Ds(e?.length??0),!e||e.length===0){As();return}ks(e)}catch(e){console.warn(`[adminAusenciasInsights] Error evaluando:`,e),As()}finally{Ss=!1}}}},Ps=new class{constructor(){this.storageKey=`portal-maestros-theme`,this.init()}init(){let e=localStorage.getItem(this.storageKey),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`;this.currentTheme=e||t,this.applyTheme(this.currentTheme),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(this.storageKey)||(this.currentTheme=e.matches?`dark`:`light`,this.applyTheme(this.currentTheme))})}applyTheme(e){document.documentElement.setAttribute(`data-bs-theme`,e),document.documentElement.setAttribute(`data-portal-theme`,e),this.updateCustomProperties(e)}updateCustomProperties(e){let t=document.documentElement;e===`dark`?(t.style.setProperty(`--pm-glass-bg`,`rgba(30, 41, 59, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(255, 255, 255, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(15, 23, 42, 0.95)`)):(t.style.setProperty(`--pm-glass-bg`,`rgba(255, 255, 255, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(0, 0, 0, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(242, 242, 247, 0.95)`))}toggle(){this.currentTheme=this.currentTheme===`dark`?`light`:`dark`,this.applyTheme(this.currentTheme),localStorage.setItem(this.storageKey,this.currentTheme),window.dispatchEvent(new CustomEvent(`themeChanged`,{detail:{theme:this.currentTheme}}))}getCurrentTheme(){return this.currentTheme}createToggleButton(){let e=document.createElement(`button`);return e.className=`pm-theme-toggle`,e.setAttribute(`aria-label`,`Cambiar tema`),e.innerHTML=`
      <div class="pm-theme-toggle-track">
        <div class="pm-theme-toggle-thumb">
          <i class="bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon"></i>
        </div>
      </div>
    `,e.addEventListener(`click`,()=>{this.toggle(),this.updateButtonIcon(e)}),window.addEventListener(`themeChanged`,()=>{this.updateButtonIcon(e)}),e}updateButtonIcon(e){let t=e.querySelector(`.pm-theme-icon`);t&&(t.className=`bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon`)}};`serviceWorker`in navigator&&navigator.serviceWorker.addEventListener(`message`,e=>{if(e.data?.type===`NAVIGATE_TO`){let t=e.data.url||e.data.hash;t&&(window.location.hash=t.startsWith(`#`)?t.slice(1):t)}});var Fs=null;function Is(e){let t=new Date(e),n=new Date-t,r=Math.floor(n/1e3),i=Math.floor(r/60),a=Math.floor(i/60),o=Math.floor(a/24),s=new Intl.RelativeTimeFormat(`es`,{numeric:`auto`});return o>0?s.format(-o,`day`):a>0?s.format(-a,`hour`):i>0?s.format(-i,`minute`):`hace un momento`}var Ls={init(){document.getElementById(`pm-notificaciones-drawer-overlay`)||(Fs=document.createElement(`div`),Fs.innerHTML=`
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
    `,document.body.appendChild(Fs),document.getElementById(`pm-notificaciones-close`).addEventListener(`click`,this.close),document.getElementById(`pm-notificaciones-drawer-overlay`).addEventListener(`click`,e=>{e.target.id===`pm-notificaciones-drawer-overlay`&&this.close()}),document.getElementById(`pm-notif-mark-all`).addEventListener(`click`,()=>{ma()}),ca(e=>{this.renderList(e)}),ua())},_updateDedupBadge(){let e=document.getElementById(`pm-notif-dedup-badge`);if(!e)return;let t=ra();t>0?(e.textContent=`🔄 ${t} dedup`,e.style.display=`inline-flex`):e.style.display=`none`},renderList(e){let t=document.getElementById(`pm-notificaciones-list`);if(t){if(this._updateDedupBadge(),e.length===0){t.innerHTML=`
        <div class="text-center text-muted mt-5">
          <i class="bi bi-bell-slash" style="font-size: 2rem; opacity: 0.5;"></i>
          <p class="mt-2">No tenés notificaciones recientes.</p>
        </div>
      `;return}t.innerHTML=Bs(e).map(e=>{let t=e.count>1,n=e.items.some(e=>e.estado!==`leida`),r=Vs(e.tipo,e.items[0]),i=e.tipo===`sesion_sin_registrar`;return`
        <div
          class="pm-notif-item ${n?``:`leida`} ${i?`pm-notif-item--urgent`:``}"
          data-ids="${e.items.map(e=>e.id).join(`,`)}"
          data-route="${r}"
          title="${t?`Ver todo`:e.items[0].titulo}"
        >
          <div class="pm-notif-icon ${zs(e.tipo)}">
            <i class="bi ${Rs(e.tipo)}"></i>
          </div>
          <div class="pm-notif-content">
            <div class="pm-notif-title">
              ${t?`${e.items[0].titulo} <span class="pm-notif-count">${e.count}</span>`:e.items[0].titulo}
            </div>
            <div class="pm-notif-msg">
              ${t?`${e.count} clases sin registrar`:e.items[0].mensaje}
            </div>
            <div class="pm-notif-footer-row">
              <span class="pm-notif-time">${Is(e.items[0].created_at)}</span>
              ${i&&r!==`#/`?`<a class="pm-notif-cta" data-route="${r}" href="javascript:void(0)">Registrar ahora →</a>`:``}
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
      `}).join(``),t.querySelectorAll(`.pm-notif-cta`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),e.closest(`.pm-notif-item`).dataset.ids.split(`,`).forEach(e=>fa(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``),Ls.close())})}),t.querySelectorAll(`.pm-notif-item`).forEach(e=>{e.addEventListener(`click`,t=>{if(t.target.closest(`.pm-notif-actions`)||t.target.closest(`.pm-notif-cta`))return;e.dataset.ids.split(`,`).forEach(e=>fa(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``))})}),t.querySelectorAll(`.pm-notif-btn-mark`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),e.dataset.ids.split(`,`).forEach(e=>fa(e))})}),t.querySelectorAll(`.pm-notif-btn-delete`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.dataset.ids.split(`,`);if(!confirm(`¿Estás seguro de que querés eliminar esta notificación?`))return;let r=!0;for(let e of n)(await pa(e)).success||(r=!1);r?window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificación eliminada correctamente.`,type:`info`}})):window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Hubo un problema al eliminar la notificación.`,type:`danger`}})),ua()})})}},open(){this.init(),this._triggerEl=document.activeElement;let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e.style.display=`block`,e.offsetHeight,e.classList.add(`open`);let t=document.querySelector(`#pm-notificaciones-drawer-overlay .pm-drawer`);t&&(this._trap&&this._trap.dispose(),this._trap=Le(t,{onClose:()=>this.close()}));let n=document.getElementById(`pm-notificaciones-close`);n&&n.focus(),this._updateDedupBadge(),ua()},close(){this._trap&&=(this._trap.dispose(),null);let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e&&(e.classList.remove(`open`),setTimeout(()=>{e.style.display=`none`},300)),this._triggerEl&&typeof this._triggerEl.focus==`function`&&this._triggerEl.focus(),this._triggerEl=null}};function Rs(e){switch(e){case`sesion_sin_registrar`:return`bi-exclamation-triangle`;case`recordatorio_clase`:return`bi-clock-history`;case`mensaje_admin`:return`bi-megaphone`;case`tarea_vencida`:return`bi-journal-x`;default:return`bi-bell`}}function zs(e){switch(e){case`sesion_sin_registrar`:return`bg-danger text-white`;case`recordatorio_clase`:return`bg-warning text-dark`;case`mensaje_admin`:return`bg-primary text-white`;default:return`bg-secondary text-white`}}function Bs(e){let t=new Set([`recordatorio_clase`,`in_app`]),n=[],r=new Map;for(let i of e)if(t.has(i.tipo)&&r.has(i.tipo)){let e=n[r.get(i.tipo)];e.items.push(i),e.count++}else r.set(i.tipo,n.length),n.push({tipo:i.tipo,items:[i],count:1});return n}function Vs(e,t){let n=t.clase_id||t.data?.clase_id,r=t.alumno_id||t.data?.alumno_id,i=t.fecha||new Date().toISOString().split(`T`)[0];switch(e){case`sesion_sin_registrar`:case`recordatorio_clase`:return n?`#/asistencia?clase=${n}&fecha=${i}`:`#/hoy`;case`mensaje_admin`:return`#/perfil`;case`tarea_vencida`:return r?`#/alumno?id=${r}`:`#/hoy`;default:return`#/hoy`}}if(!document.getElementById(`pm-notif-styles`)){let e=document.createElement(`style`);e.id=`pm-notif-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}if(te(),`serviceWorker`in navigator){let e=async()=>{try{let e=await navigator.serviceWorker.register(`/sw.js`);console.log(`[PWA] Service Worker registered:`,e.scope)}catch(e){console.log(`[PWA] Service Worker registration failed:`,e)}};document.readyState===`complete`?e():window.addEventListener(`load`,e)}else `serviceWorker`in navigator;console.log(`[SOI] Initializing professionalization services...`),at(),tt({windowMs:6e4,max:100}),$e({enabled:!1,consent:!1}),ct({debug:!1}),Xe({dsn:null,environment:`production`}),window.addEventListener(`showToast`,e=>{let{message:t,type:n=`info`}=e.detail||{};t&&F.show(t,n)});var Hs=!1,Us=null;function Ws(e,t=!1){let n=[{id:`calendario`,label:`Calendario`,icon:`bi-calendar3`},{id:`hoy`,label:`Hoy`,icon:`bi-house-door`},{id:`planificacion`,label:`Plan`,icon:`bi-signpost-split`}];return n.push({id:`metricas`,label:`Métricas`,icon:`bi-bar-chart-line`}),e?.puede_inscribir_clases&&n.push({id:`gestionar-clases`,label:`Clases`,icon:`bi-mortarboard`}),n}var Gs=[{id:`admin-alumnos`,label:`Alumnos`,icon:`bi-people-fill`},{id:`admin-programas`,label:`Programas`,icon:`bi-grid-1x2`},{id:`admin-maestros`,label:`Maestros`,icon:`bi-person-badge`},{id:`admin-notificaciones`,label:`Actividad`,icon:`bi-bell-fill`},{id:`admin-ausencias`,label:`Ausencias`,icon:`bi-calendar-x`},{id:`admin-metricas`,label:`Métricas`,icon:`bi-bar-chart-line`}],Ks=e=>Hs?[...Gs,...Ws(e,!0)]:Ws(e,!1),qs=null,Js=null,Z=yt();window.router=Z;async function Ys(e){let{tabla:t,operacion:n,payload:r}=e,i={...r};t===`sesiones_clase`&&(i.contenido_dsl!==void 0&&(i.contenido=i.contenido_dsl,delete i.contenido_dsl),i.asistencias!==void 0&&i.asistencia===void 0&&(i.asistencia=i.asistencias,delete i.asistencias)),console.log(`[SYNC] Intentando ${n} en ${t}:`,i);try{if(n===`insert`){let{error:e}=await j.from(t).insert([i]);if(e)throw console.error(`[SYNC] Error en INSERT ${t}:`,e),e}else if(n===`update`){let{id:e,...n}=i,{error:r}=await j.from(t).update(n).eq(`id`,e);if(r)throw console.error(`[SYNC] Error en UPDATE ${t}:`,r),r}else if(n===`delete`){let{error:e}=await j.from(t).delete().eq(`id`,i.id);if(e)throw console.error(`[SYNC] Error en DELETE ${t}:`,e),e}}catch(e){if(e.code===`PGRST204`){let{data:e}=await j.from(t).select().limit(1);e&&e.length>0?console.warn(`[SYNC] Columnas REALES encontradas:`,Object.keys(e[0])):console.warn(`[SYNC] No se pueden leer las columnas. ¿Ejecutaste el SQL en Supabase?`)}throw console.error(`[SYNC] Error crítico en _syncWithSupabase:`,e),e}}var Xs=null;async function Zs(){let e=document.getElementById(`pm-sync-indicator`);if(e)try{let t=await ue();t.length===0?(e.className=`pm-online-dot synced`,e.title=`Sincronizado`):(e.className=`pm-online-dot pending`,e.title=`Pendiente (${t.length})`)}catch{e.className=`pm-online-dot error`,e.title=`Error de sincronización`}}async function Qs(){clearTimeout(Xs),Xs=setTimeout(async()=>{if(navigator.onLine)try{await le(Ys)}finally{await Zs()}},1e3)}window.addEventListener(`online`,Qs),window.addEventListener(`offline`,Zs);function $s(){let e=document.getElementById(`portal-app`);if(!e)return;let t=e.querySelector(`.pm-header`),n=e.querySelector(`.pm-bottom-nav`),r=e.querySelector(`.pm-view`);t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.display=`none`)}function ec(){let e=document.getElementById(`portal-app`);if(!e)return;let t=e.querySelector(`.pm-header`),n=e.querySelector(`.pm-bottom-nav`),r=e.querySelector(`.pm-view`);t&&(t.style.display=``),n&&(n.style.display=``),r&&(r.style.display=``)}function tc(){let e=document.getElementById(`portal-app`);if(!e)return;let t=[`login`,`register`,`pending-approval`],n=(Z.currentRoute?.()||`login`).split(`?`)[0];if(t.includes(n)&&n!==`login`){console.log(`[Auth] Manteniendo ruta pública:`,n),document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),dc(),nc(),Z.setAuthGuard(()=>gt.isAuthenticated(),t),Z.start();return}let r=lc.login;if(r){$s(),r.style.display=`block`,r.innerHTML=``,Tt(r,{onSuccess:e=>{e&&e!==`login`?(ec(),Z.navigate(e)):hc()}});return}e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`,dc(),nc(),Z.setAuthGuard(()=>gt.isAuthenticated(),t),history.replaceState({route:`login`},``,`#/login`),$(`login`)}function nc(){Z.on(`login`,(e,t)=>$(`login`,t)),Z.on(`logout`,(e,t)=>$(`logout`,t)),Z.on(`calendario`,(e,t)=>$(`calendario`,t)),Z.on(`clases`,(e,t)=>$(`clases`,t)),Z.on(`hoy`,(e,t)=>$(`hoy`,t)),Z.on(`asistencia`,(e,t)=>$(`asistencia`,t)),Z.on(`metricas`,(e,t)=>$(`metricas`,t)),Z.on(`perfil`,(e,t)=>$(`perfil`,t)),Z.on(`clase-emergente`,(e,t)=>$(`clase-emergente`,t)),Z.on(`planificacion`,(e,t)=>$(`planificacion`,t)),Z.on(`alumno`,(e,t)=>$(`alumno`,t)),Z.on(`gamificacion`,(e,t)=>$(`gamificacion`,t)),Z.on(`ruta`,(e,t)=>$(`ruta`,t)),Z.on(`crear-clase`,(e,t)=>$(`crear-clase`,t)),Z.on(`ruta-plan-builder`,(e,t)=>$(`ruta-plan-builder`,t)),Z.on(`ruta-semanal`,(e,t)=>$(`ruta-semanal`,t)),Z.on(`ruta-libreria`,(e,t)=>$(`ruta-libreria`,t)),Z.on(`ruta-detalle/:id`,(e,t)=>$(`ruta-detalle`,t)),Z.on(`gestionar-clases`,(e,t)=>$(`gestionar-clases`,t)),Z.on(`register`,(e,t)=>$(`register`,t)),Z.on(`pending-approval`,(e,t)=>$(`pending-approval`,t)),Hs?(Z.on(`admin-alumnos`,(e,t)=>$(`admin-alumnos`,t)),Z.on(`admin-programas`,(e,t)=>$(`admin-programas`,t)),Z.on(`admin-maestros`,(e,t)=>$(`admin-maestros`,t)),Z.on(`admin-metricas`,(e,t)=>$(`admin-metricas`,t)),Z.on(`admin-config`,(e,t)=>$(`admin-config`,t)),Z.on(`admin-clases`,(e,t)=>$(`admin-clases`,t)),Z.on(`admin-sesiones`,(e,t)=>$(`admin-sesiones`,t)),Z.on(`admin-aprobacion`,(e,t)=>$(`admin-aprobacion`,t)),Z.on(`admin-ausencias`,(e,t)=>$(`admin-ausencias`,t)),Z.on(`admin-notificaciones`,(e,t)=>$(`admin-notificaciones`,t)),Z.onNotFound(()=>$(`admin-alumnos`))):Z.onNotFound(()=>$(`hoy`))}function rc(){let e=window.innerWidth;return e<768?`mobile`:e<1024?`tablet`:`desktop`}var ic=rc();window.addEventListener(`resize`,()=>{let e=rc();e!==ic&&(ic=e,document.body.dataset.pmLayout=e)},{passive:!0});function ac(e,t,n){qs=t,Js=n||Js;let r=Ks(Js);e.innerHTML=`
    <!-- Sidebar (desktop only) -->
    <aside class="pm-sidebar" id="pm-sidebar">
      <div class="pm-sidebar-header">
        <div class="pm-sidebar-logo">
          <i class="bi bi-music-note-beamed"></i>
          <span>SOI</span>
        </div>
      </div>
      <nav class="pm-sidebar-nav">
        ${r.map(e=>`
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
    <div class="pm-main-area ${Hs?`pm-main-area--admin`:``}">
      <!-- Header -->
      <header class="pm-header" id="pm-header">
        <div class="pm-header-left" id="pm-header-left">
          <span class="pm-header-greeting">${Hs?`Panel Admin`:`Portal Maestros`}</span>
          <span class="pm-header-title" style="font-size:clamp(1rem,3.5vw,1.5rem);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52vw;">
            ${Hs?t?.nombre_completo??`Administrador`:`Prof. `+(t?.nombre_completo??``)}
            <span class="pm-online-dot" id="pm-sync-indicator" title="Sincronizado"></span>
          </span>
        </div>

        <!-- Dynamic WhatsApp-Style Search Container -->
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
          <!-- Botón de búsqueda para mobile/tablet (WhatsApp Lupa) -->
          <button id="pm-search-toggle-btn" class="pm-icon-btn pm-search-toggle-btn" title="Buscar alumno">
            <i class="bi bi-search"></i>
          </button>

          <!-- Toggle de tema -->
          <div id="pm-theme-toggle-container"></div>

          <!-- Botón de notificaciones -->
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

      <!-- Footer Nav (mobile/tablet only - hidden on desktop) -->
      <nav class="pm-footer-nav ${Hs?`pm-footer-nav--admin`:``}" id="pm-footer-nav">
        <div class="pm-footer-nav__inner">
          ${r.map(e=>`
            <button class="pm-nav-tab" data-route="${e.id}" title="${e.label}" aria-label="${e.label}">
              <i class="bi ${e.icon}"></i>
              <span>${e.label}</span>
            </button>
          `).join(``)}
        </div>
      </nav>
    </div>
  `,Zs();let i=document.getElementById(`pm-theme-toggle-container`);i&&i.appendChild(Ps.createToggleButton());let a=document.getElementById(`pm-footer-nav`);a&&a.querySelectorAll(`.pm-nav-tab`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),Z.navigate(e.dataset.route)})});let o=document.getElementById(`pm-sidebar`);o&&o.querySelectorAll(`.pm-sidebar-link`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),Z.navigate(e.dataset.route)})}),document.getElementById(`pm-btn-perfil`).addEventListener(`click`,e=>{e.preventDefault(),Z.navigate(`perfil`)});let s=document.getElementById(`pm-header`),c=document.getElementById(`pm-header-search-input`),l=document.getElementById(`pm-search-toggle-btn`),u=document.getElementById(`pm-search-back-btn`),d=()=>{s?.classList.add(`search-active`),setTimeout(()=>{c?.focus()},50)},f=()=>{s?.classList.remove(`search-active`),c&&(c.value=``),document.getElementById(`pm-header-search-dropdown`)?.remove()};l?.addEventListener(`click`,e=>{e.stopPropagation(),d()}),u?.addEventListener(`click`,e=>{e.stopPropagation(),f()});let p=null,m=null,h=()=>{p?.remove(),p=null},g=e=>{if(h(),!e.length)return;let t=document.createElement(`div`);t.id=`pm-header-search-dropdown`,t.setAttribute(`role`,`listbox`),t.innerHTML=e.map(e=>`
      <div class="pm-hsd-item" role="option" tabindex="0" data-id="${e.id}">
        <i class="bi bi-person-fill pm-hsd-icon"></i>
        <div class="pm-hsd-info">
          <span class="pm-hsd-name">${e.nombre_completo}</span>
          ${e.instrumento_principal?`<span class="pm-hsd-meta">${e.instrumento_principal}</span>`:``}
        </div>
        <i class="bi bi-chevron-right pm-hsd-arrow"></i>
      </div>`).join(``),document.body.appendChild(t);let n=c.getBoundingClientRect();t.style.cssText=`position:fixed;top:${n.bottom+4}px;left:${Math.max(8,n.left)}px;width:${Math.min(320,window.innerWidth-16)}px;z-index:9999;background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.18);overflow:hidden;`,p=t,t.querySelectorAll(`.pm-hsd-item`).forEach(e=>{let t=()=>{f(),h(),Z.navigate(`alumno`,{id:e.dataset.id})};e.addEventListener(`click`,t),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&t()})})};if(c?.addEventListener(`input`,()=>{let e=c.value.trim();if(clearTimeout(m),e.length<1){h();return}let t=Wt();if(t){let n=e.toLowerCase();g(t.filter(e=>e.nombre_completo?.toLowerCase().includes(n)).slice(0,8).map(e=>({...e,instrumento_principal:e.clases?.join(`, `)||null})));return}m=setTimeout(async()=>{try{let{data:t}=await j.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).ilike(`nombre_completo`,`%${e}%`).limit(8);g(t||[])}catch{h()}},200)}),c?.addEventListener(`keydown`,e=>{e.key===`Escape`&&(f(),h())}),!document.getElementById(`pm-hsd-styles`)){let e=document.createElement(`style`);e.id=`pm-hsd-styles`,e.textContent=`.pm-hsd-item{display:flex;align-items:center;gap:0.625rem;padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid var(--pm-border);transition:background 0.1s}.pm-hsd-item:last-child{border-bottom:none}.pm-hsd-item:hover,.pm-hsd-item:focus{background:var(--pm-surface-2);outline:none}.pm-hsd-icon{font-size:1rem;color:var(--pm-primary);flex-shrink:0}.pm-hsd-info{flex:1;min-width:0}.pm-hsd-name{display:block;font-size:0.875rem;font-weight:500;color:var(--pm-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-hsd-meta{font-size:0.7rem;color:var(--pm-text-muted)}.pm-hsd-arrow{color:var(--pm-text-muted);font-size:0.75rem}`,document.head.appendChild(e)}document.addEventListener(`click`,e=>{!c?.contains(e.target)&&!p?.contains(e.target)&&h()}),document.getElementById(`pm-sync-indicator`).addEventListener(`click`,async e=>{e.target.classList.contains(`error`)&&await Qs()}),document.getElementById(`pm-bell-btn`)?.addEventListener(`click`,()=>{Ls.open()});let _=(Z.currentRoute?.()||`hoy`).split(`?`)[0];cc(_)}var oc=!1;function sc(){if(oc)return;if(oc=!0,ca(()=>{let e=document.getElementById(`pm-notif-badge`);if(!e)return;let t=ha();t>0?(e.textContent=t>9?`9+`:t,e.style.display=`flex`):e.style.display=`none`}),ua(),_a(),!Hs){Us!==void 0&&Us&&(j.removeChannel(Us),Us=null);let e=qs;e?.id&&(Us=j.channel(`permisos-maestro:${e.id}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`permisos_maestros`,filter:`maestro_id=eq.${e.id}`},async t=>{console.log(`[Realtime] Permisos actualizados:`,t.new);try{let t=await Ue(e.id),n=document.getElementById(`portal-app`);if(!n)return;let r=[];t.puede_inscribir_clases&&!Js?.puede_inscribir_clases&&r.push(`Gestionar e Inscribir Clases`);let i=[];Js?.puede_inscribir_clases&&!t.puede_inscribir_clases&&i.push(`Gestionar e Inscribir Clases`);let a=(Z.currentRoute?.()||`perfil`).split(`?`)[0],o=a===`gestionar-clases`&&!t.puede_inscribir_clases?`hoy`:a;a===`pending-approval`&&r.length>0&&(o=`hoy`),ac(n,e,t),dc(),nc(),Z.setAuthGuard(()=>gt.isAuthenticated(),[`login`,`register`,`pending-approval`]),uc.clear(),await $(o),Z.navigate(o),r.length>0?F.success(`¡Nuevos permisos activados: ${r.join(`, `)}! Ahora podés acceder desde el Perfil o la barra de navegación.`):i.length>0?F.show(`El administrador removió tu acceso a: ${i.join(`, `)}.`,`warning`):F.show(`Tus permisos fueron actualizados por el administrador.`,`info`)}catch(e){console.warn(`[Realtime] Error actualizando permisos:`,e.message)}}).subscribe(e=>{console.log(`[Realtime] Canal permisos_maestros:`,e)}),window.addEventListener(`beforeunload`,()=>{j.removeChannel(permisosChannel)},{once:!0}))}document.addEventListener(`keydown`,e=>{if(rc()!==`desktop`||e.target.tagName===`INPUT`||e.target.tagName===`TEXTAREA`)return;window._globalAppKeys||(window._globalAppKeys=[]);let t=window._globalAppKeys;if(t.push(e.key.toLowerCase()),t[t.length-2]===`g`)switch(e.key.toLowerCase()){case`h`:Z.navigate(`hoy`),t.length=0;break;case`c`:Z.navigate(`calendario`),t.length=0;break;case`r`:Z.navigate(`ruta`),t.length=0;break;case`m`:Z.navigate(`metricas`),t.length=0;break;case`p`:Z.navigate(`perfil`),t.length=0;break;default:break}t.length>3&&t.splice(0,t.length-2)});let e=null;window.addEventListener(`resize`,()=>{clearTimeout(e),e=setTimeout(()=>{let e=rc();if(e!==ic){ic=e,document.body.dataset.pmLayout=e,ac(document.getElementById(`portal-app`),qs),dc();let t=(Z.currentRoute?.()||`hoy`).split(`?`)[0];cc(t)}},250)},{passive:!0})}function cc(e){document.querySelectorAll(`.pm-nav-tab`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)}),document.querySelectorAll(`.pm-sidebar-link`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)})}var lc={},Q=null,uc=new Set;function dc(){let e=document.getElementById(`pm-view-container`);e&&(e.innerHTML=``,[`login`,`logout`,`register`,`pending-approval`,`calendario`,`clases`,`hoy`,`asistencia`,`metricas`,`perfil`,`clase-emergente`,`planificacion`,`alumno`,`gamificacion`,`ruta`,`crear-clase`,`ruta-plan-builder`,`ruta-semanal`,`ruta-libreria`,`ruta-detalle`,`gestionar-clases`].forEach(t=>{let n=document.createElement(`div`);n.id=`pm-view-${t}`,n.className=`pm-view-content`,n.style.display=`none`,e.appendChild(n),lc[t]=n}),Hs&&[`admin-alumnos`,`admin-programas`,`admin-maestros`,`admin-metricas`,`admin-config`,`admin-clases`,`admin-sesiones`,`admin-aprobacion`,`admin-ausencias`,`admin-notificaciones`].forEach(t=>{let n=document.createElement(`div`);n.id=`pm-view-${t}`,n.className=`pm-view-content`,n.style.display=`none`,e.appendChild(n),lc[t]=n}))}async function $(e,t={},{silent:n=!1}={}){let r=window.location.hash.includes(`?`)?window.location.hash.split(`?`)[1]:``,a=new URLSearchParams(r),o=e.split(`?`)[0];if(!n){let e=document.getElementById(`pm-header`);if(e&&e.classList.contains(`search-active`)){e.classList.remove(`search-active`);let t=document.getElementById(`pm-header-search-input`);t&&(t.value=``)}cc(o),window.pwaInstaller&&window.pwaInstaller.evaluateInsights(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}let s=lc[o];if(!s){console.warn(`[Router] Contenedor no encontrado: ${o}`);return}if(n||(typeof Q==`function`&&(console.log(`[Router] Ejecutando cleanup de vista anterior...`),Q(),Q=null),Object.values(lc).forEach(e=>{e.style.display=`none`,e.classList.remove(`active`)}),s.style.display=`block`,s.offsetHeight,s.classList.add(`active`)),uc.has(o))return;let c=setTimeout(()=>{s.querySelectorAll(`.pm-loading-overlay`).forEach(e=>e.remove());let e=document.createElement(`div`);e.className=`pm-loading pm-loading-overlay`,e.innerHTML=`<div class="pm-spinner"></div>`,s.prepend(e)},300);try{switch(o){case`login`:Tt(s,{onSuccess:()=>hc()});break;case`register`:Et(s,{onSuccess:()=>Z.navigate(`pending-approval`)});break;case`pending-approval`:Dt(s,{onBackToLogin:()=>Z.navigate(`login`)});break;case`logout`:tc(),va(),_t().then(()=>window.location.reload());break;case`calendario`:case`clases`:Q=await Ft(s);break;case`hoy`:Q=await Ot(s,{onClaseClick:e=>Z.navigate(`asistencia?clase=${e}`)});break;case`asistencia`:Q=await ka(s,{claseId:a.get(`clase`),fecha:a.get(`fecha`),sesionId:a.get(`sesion`)});break;case`metricas`:Q=Gt(s);break;case`perfil`:Q=za(s);break;case`clase-emergente`:Q=Na(s,{maestroId:qs?.id});break;case`planificacion`:Q=await ao(s);break;case`alumno`:Q=wo(s,{alumnoId:a.get(`id`)||t.id});break;case`gamificacion`:await ko(s);break;case`ruta`:await Bo(s,{onTopicSelected:e=>Z.navigate(`asistencia?clase=${e}`)});break;case`crear-clase`:Yo(s);break;case`ruta-plan-builder`:Xo(s,{alumnoId:a.get(`id`)});break;case`ruta-semanal`:Zo(s,{alumnoId:a.get(`id`)});break;case`ruta-libreria`:Qo.render().then(e=>{s.innerHTML=``,s.appendChild(e)});break;case`ruta-detalle`:$o.render(t).then(e=>{s.innerHTML=``,s.appendChild(e)});break;case`admin-alumnos`:i(s);break;case`admin-programas`:ee(s);break;case`admin-maestros`:b(s);break;case`admin-metricas`:y(s);break;case`admin-config`:d(s);break;case`admin-clases`:D?.(s);break;case`admin-sesiones`:break;case`admin-aprobacion`:await C(s),Q=null;break;case`admin-ausencias`:await v(s),Q=null;break;case`admin-notificaciones`:Q=await O(s);break;case`gestionar-clases`:if(!Js?.puede_inscribir_clases){Z.navigate(`hoy`);return}Q=await os(s);break;default:}clearTimeout(c),s.querySelector(`.pm-loading-overlay`)?.remove(),new Set([`hoy`,`calendario`,`metricas`,`perfil`,`ruta`,`gamificacion`,`crear-clase`,`planificacion`,`ruta-libreria`]).has(o)&&uc.add(o)}catch(e){clearTimeout(c),s.innerHTML=`<p class="pm-error">Error cargando vista: ${e.message}</p>`}}async function fc(){if(qs)try{let e=new Date,t=e.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),n=e.toISOString().split(`T`)[0],[r,i,a]=await Promise.all([g(),g().then(e=>x(e.map(e=>e.id))),g().then(()=>A(qs.id,n,n))]),o=Object.fromEntries(r.map(e=>[e.id,e]));await _e(i.filter(e=>e.dia?.toLowerCase()===t).map(e=>({...e,clase_nombre:o[e.clase_id]?.nombre||`Clase`})),a.filter(e=>e.borrador===!1||e.estado===`registrada`).map(e=>e.clase_id))}catch(e){console.warn(`[Alerts] Error programando alertas:`,e.message)}}function pc(){uc.clear()}function mc(e){uc.delete(e)}async function hc(){let e=document.getElementById(`portal-app`);if(!e)return;console.log(`[Init] Iniciando Portal...`),console.log(`[Init] Llamando usePortalAuth.init()...`);let t=await gt.init();console.log(`[Init] Auth completado:`,t?`con maestro`:`sin maestro`),Hs=t?.es_admin===!0,console.log(`[Init] IS_ADMIN:`,Hs,`| maestro.es_admin:`,t?.es_admin,`| tipo:`,typeof t?.es_admin);let n=window.router||yt(),r=[`login`,`register`,`pending-approval`],i=n.currentRoute().split(`?`)[0],a=r.includes(i);if(!t&&!a){console.log(`[Init] No maestro y ruta privada, mostrando login screen`),tc();return}if(!t&&a){console.log(`[Init] No maestro pero ruta pública detectada:`,i),document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),dc(),nc(),Z.setAuthGuard(()=>gt.isAuthenticated(),r),Z.start();return}let o=null;if(!Hs)try{o=await Ue(t.id)}catch(e){console.warn(`[Init] Error fetching permissions:`,e.message)}console.log(`[Init] Renderizando shell...`),ac(e,t,o),console.log(`[Init] Shell renderizado`),Hs&&Ns.init(),dc(),sc(),Lr(mc,pc),nc(),Z.setAuthGuard(()=>gt.isAuthenticated(),[`login`,`register`,`pending-approval`]),Z.start(),u().then(async()=>{let e=[`hoy`,`calendario`,`metricas`],t=(Z.currentRoute?.()||`hoy`).split(`?`)[0];await e.filter(e=>e!==t&&!uc.has(e)).reduce((e,t)=>e.then(()=>{if(lc[t])return $(t,{},{silent:!0})}),Promise.resolve()),fc(),window.pwaInstaller&&window.pwaInstaller.evaluateInsights(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}).catch(e=>console.warn(`[Prefetch] Error:`,e.message)),Qs()}window.addEventListener(`error`,e=>{let t=[`useCache`,`WebSocket`,`content.js`],n=e.message||``;if(t.some(e=>n.includes(e))){console.warn(`[Ignored Error]`,n);return}Ze(Error(e.message),{context:`window.error`,filename:e.filename,lineno:e.lineno});let r=document.getElementById(`portal-app`);r&&(r.innerHTML=`
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
    </div>`)}),window.addEventListener(`unhandledrejection`,e=>{Ze(e.reason instanceof Error?e.reason:Error(String(e.reason)),{context:`unhandledRejection`});let t=document.getElementById(`portal-app`);t&&(t.innerHTML=`
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
    </div>`)}),hc().catch(e=>{let t=document.getElementById(`portal-app`);t&&(t.innerHTML=`<div style="padding:20px;color:red;font-family:monospace;background:#fff;z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;"><h2>❌ initPortal() falló</h2><pre>${e?.message||e}\n${e?.stack||``}</pre></div>`)});