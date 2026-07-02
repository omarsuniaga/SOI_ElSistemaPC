const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/metricasView-8TM7RuUL.js","assets/pwaInstaller-Dg2tWEty.js","assets/supabase--PHJV0L9.js","assets/maestroAuth-CaKoHPVh.js","assets/portalUtils-CkF82Yyk.js","assets/a11yUtils-DRYT20ux.js","assets/claseAnalysisModal-mPmgDUB5.js","assets/groqService-D8E46nwB.js","assets/loginView-C7qEU6VW.js","assets/login-C-9dKvTL.css","assets/registerView-C8ZgFCPC.js","assets/pendingApprovalView-Bd3CoXfX.js","assets/hoyView-CHtH1Ckh.js","assets/AppToast-DNGTRY9B.js","assets/weeklyPlanAdapter-DIRb7zzn.js","assets/config-DI7hr8LK.js","assets/academicService-BPPis8H2.js","assets/preload-helper-CZgWQFsJ.js","assets/claseEmergenteModal-DtKzxPON.js","assets/AppModal-B_r6aHTM.js","assets/calendarioView-DicCtN37.js","assets/asistenciaView-pYxyphCp.js","assets/idb-CdbSE3_O.js","assets/reportService-C9d5pN9Q.js","assets/evaluationService-7N-EeFWR.js","assets/claseEmergenteView-CQYNaeb4.js","assets/perfilView-BWTWNaHP.js","assets/pushService-CUXNWsRr.js","assets/phoneUtils-Cpl-jyW9.js","assets/sanitize-9bDGu3i_.js","assets/disponibilidadApi-B58xp3Uh.js","assets/CHANGELOG-DPV2OdzA.js","assets/ausenciaModal-DfA7GVyd.js","assets/planificacionView-Cev2-Yul.js","assets/vendor-fghBzJSA.js","assets/vendor-COf7rB16.css","assets/alumnoPerfilView-DKMlN4uj.js","assets/gamificacionView-Dn3OnDIQ.js","assets/rutaGameificadaView-ZGHt1etV.js","assets/crearClaseView-D_yN353s.js","assets/academicPlanBuilderView-C4XXcJUD.js","assets/weeklyPlanView-DykQtXRF.js","assets/routeLibraryView-BDbQ4tDE.js","assets/routeDetailView-BJ5A2viT.js","assets/gestionarClasesView-DdI1Iy9C.js","assets/alumnosApi-DJRplIuz.js","assets/disponibilidadView-B2GTIbIu.js"])))=>i.map(i=>d[i]);
import{i as e,t}from"./AppToast-DNGTRY9B.js";import{c as n,i as r,l as i,n as a,o}from"./pwaInstaller-Dg2tWEty.js";import{i as s}from"./supabase--PHJV0L9.js";import{i as c,o as l,r as u,t as d}from"./maestroAuth-CaKoHPVh.js";import"./vendor-fghBzJSA.js";import{t as f}from"./idb-CdbSE3_O.js";import{o as p,t as m,u as h}from"./pushService-CUXNWsRr.js";import{i as ee,n as te,r as ne,t as re}from"./lifecycleManager-CgTzdkZX.js";import{t as g}from"./preload-helper-CZgWQFsJ.js";var ie=[`useCache`,`WebSocket closed without opened`,`Could not establish connection`,`Receiving end does not exist`,`chrome-extension://`,`polyfill`,`content.js`,`Failed to load module script`,`net::ERR_BLOCKED_BY_CLIENT`];function _(e=``){let t=String(e).toLowerCase();return ie.some(e=>t.includes(e.toLowerCase()))}var ae=console.error;console.error=function(...e){e.length>0&&!_(e[0])&&ae.apply(console,e)};var oe=console.warn;console.warn=function(...e){e.length>0&&!_(e[0])&&oe.apply(console,e)},window.addEventListener(`unhandledrejection`,e=>{_(String(e.reason||``))&&(e.preventDefault(),e.stopImmediatePropagation())},!0),window.addEventListener(`error`,e=>{_(e.message||``)&&(e.preventDefault(),e.stopImmediatePropagation())},!0);var se=window.fetch;window.fetch=async function(...e){try{return await se.apply(window,e)}catch(e){if(!_(e.message))throw e;return null}};var ce=!1,v=[],le=10;function ue(e={}){let{dsn:t,environment:n=`development`,tracesSampleRate:r=.1}=e;if(t&&typeof window<`u`&&window.Sentry){let e=[];window.Sentry.Replay&&e.push(new window.Sentry.Replay({maskAllText:!0,blockAllMedia:!0})),window.Sentry.init({dsn:t,environment:n,tracesSampleRate:r,integrations:e,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1}),ce=!0,console.log(`[ErrorReporter] Initialized:`,n)}}function de(e,t={}){let n=new Date().toISOString(),r=e instanceof Error?e.message:String(e),i=e instanceof Error?e.stack:null;if(v.push({message:r,stack:i,context:t.context||`unknown`,level:t.level||`error`,timestamp:n}),v.length>le&&v.shift(),!ce&&!window.Sentry)return;let{userId:a,context:o,level:s=`error`,...c}=t;a&&window.Sentry?.setUser({id:a}),o&&window.Sentry?.setTag(`context`,o),Object.keys(c).length>0&&window.Sentry?.setContext(`details`,c),e instanceof Error?(window.Sentry?.captureException(e,{level:s}),console.error(`[Error] ${e.message}`,e)):(window.Sentry?.captureMessage(String(e),s),console.warn(`[${s}] ${e}`))}function fe(){return[...v]}var pe=!1;function me(e={}){let{enabled:t=!1,consent:n=!1}=e;pe=t&&n,console.log(`[Analytics] Initialized, enabled:`,pe)}var y={windowMs:6e4,max:100};function he(e={}){y={...y,...e},console.log(`[RateLimit] Initialized: ${y.max} requests per ${y.windowMs}ms`)}var ge=null,_e=new Set;function ve(e=32){let t=``,n=new Uint32Array(e);if(typeof crypto<`u`&&crypto.getRandomValues)crypto.getRandomValues(n);else for(let t=0;t<e;t++)n[t]=Math.floor(Math.random()*62);for(let r=0;r<e;r++)t+=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`[n[r]%62];return t}function ye(e={}){ge=ve(e.length||32),_e.clear(),_e.add(ge),console.log(`[CSRF] Initialized`)}var b={LCP:null,FID:null,CLS:null,FCP:null,TTFB:null};function be(){return typeof window>`u`?!1:typeof PerformanceObserver<`u`}function xe(e={}){let{debug:t=!1,onReport:n=null}=e;if(!be()){console.warn(`[WebVitals] Not supported in this environment`);return}console.log(`[WebVitals] Initialized`),Se(t,n),Ce(t,n),we(t,n),Te(t,n),Ee(t,n)}function Se(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries(),i=r[r.length-1];b.LCP=i.value,e&&console.log(`[LCP]`,i.value),t&&t(`LCP`,i.value)}).observe({entryTypes:[`largest-contentful-paint`]})}catch{e&&console.log(`[LCP] Not available`)}}function Ce(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];b.FID=r.value,e&&console.log(`[FID]`,r.value),t&&t(`FID`,r.value)}).observe({entryTypes:[`first-input`]})}catch{e&&console.log(`[FID] Not available`)}}function we(e,t){try{let n=0;new PerformanceObserver(r=>{for(let e of r.getEntries())e.hadRecentInput||(n+=e.value);b.CLS=n,e&&console.log(`[CLS]`,n),t&&t(`CLS`,n)}).observe({entryTypes:[`layout-shift`]})}catch{e&&console.log(`[CLS] Not available`)}}function Te(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];b.FCP=r.value,e&&console.log(`[FCP]`,r.value),t&&t(`FCP`,r.value)}).observe({entryTypes:[`paint`]})}catch{e&&console.log(`[FCP] Not available`)}}function Ee(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];b.TTFB=r.responseStart,e&&console.log(`[TTFB]`,r.responseStart),t&&t(`TTFB`,r.responseStart)}).observe({entryTypes:[`navigation`]})}catch{e&&console.log(`[TTFB] Not available`)}}var x={maestro:null,loading:!0,pendingApproval:!1,listeners:[]},De=null,Oe=!1;function S(){x.listeners.forEach(e=>e({...x}))}var C={subscribe(e){return x.listeners.push(e),()=>{x.listeners=x.listeners.filter(t=>t!==e)}},async init(){Oe=!0;try{if(console.log(`[usePortalAuth.init] Iniciando...`),x.maestro=c(),console.log(`[usePortalAuth.init] Maestro local:`,x.maestro?`found`:`not found`),x.loading=!0,S(),typeof process<`u`&&{}.VITEST)return x.loading=!1,S(),console.log(`[usePortalAuth.init] Completado (Test Env)`),x.maestro;if(!De){let{data:{subscription:e}}=s.auth.onAuthStateChange(async(e,t)=>{if(console.log(`[usePortalAuth] Evento de auth disparado: ${e}`),Oe&&(e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)){console.log(`[usePortalAuth] Ignorando SIGNED_IN durante inicialización (lo maneja init())`);return}if(e===`SIGNED_OUT`||e===`USER_DELETED`){localStorage.removeItem(`portal-maestros:maestro`),x.maestro=null,S();let e=[`login`,`register`,`pending-approval`],t=(window.router?.currentRoute?.()||`login`).split(`?`)[0];e.includes(t)||(console.log(`[usePortalAuth] Sesión inactiva o expirada en ruta privada. Recargando aplicación...`),window.location.reload())}else if((e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)&&t?.user){let e=c();if(!e||e.user_id!==t.user.id){console.log(`[usePortalAuth] Nueva sesión detectada. Sincronizando datos de maestro...`);try{let e=await u();e&&(x.maestro=e,S())}catch(e){console.warn(`[usePortalAuth] Error sincronizando maestro post-login:`,e.message)}}}});De=e}try{console.log(`[usePortalAuth.init] Iniciando detectarRolMaestro() con timeout de 8s...`);let e=new Promise((e,t)=>setTimeout(()=>t(Error(`Auth timeout after 8s`)),8e3)),t=await Promise.race([u(),e]);console.log(`[usePortalAuth.init] detectarRolMaestro completado:`,t?t.__pendingApproval?`pendiente de aprobación`:`con datos`:`sin datos`),t===d||t?.__pendingApproval?(x.maestro=null,x.pendingApproval=!0):(x.maestro=t,x.pendingApproval=!1)}catch(e){console.warn(`[usePortalAuth.init] Error:`,e.message),x.maestro=null,x.pendingApproval=!1}return x.loading=!1,S(),console.log(`[usePortalAuth.init] Completado`),x.maestro}finally{Oe=!1}},setMaestro(e){x.maestro=e,x.loading=!1,S()},async logout(){await l(),x.maestro=null,S()},getMaestro:()=>x.maestro,isAuthenticated:()=>!!x.maestro,isLoading:()=>x.loading,isPendingApproval:()=>x.pendingApproval},ke=C.logout,Ae=`hoy`;function je(){let e=new Map,t=null,n=null,r=null,i=[`login`],a=!1;function o(){let e=window.location.pathname,t=window.location.hash;return t&&t!==`#`?t.replace(`#/`,``).replace(`#`,``):e&&e!==`/`?e.replace(/^\//,``):Ae}function s(e,t=[`login`]){r=e,i=t,a=!0}let c=null;function l(e,t={}){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.pushState({route:`login`},``,`/login`),h(`login`);return}if(a&&r&&i.includes(e)&&r()){history.replaceState({route:Ae},``,`/`),h(Ae);return}t&&Object.keys(t).length>0&&(c=t,n=null);let o=e===`hoy`?`/`:`/${e}`;history.pushState({route:e},``,o),h(e)}function u(e){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.replaceState({route:`login`},``,`/login`),h(`login`);return}let t=e===`hoy`?`/`:`/${e}`;history.replaceState({route:e},``,t),h(e)}function d(t,n){e.set(t,n)}function f(e){t=e}let p=null;function m(e){let t=e.querySelector(`h1, h2, [role="main"]`);t&&(t.hasAttribute(`tabindex`)||t.setAttribute(`tabindex`,`-1`),t.focus({preventScroll:!0}))}function h(r){if(n===r&&n!==null)return;n=r;let i=r.split(`?`)[0],a=e.get(i),o={};if(!a){for(let[t,n]of e.entries())if(t.includes(`:`)){let e=`^`+t.replace(/:[^\s/]+/g,`([^\\/]+)`)+`$`,r=new RegExp(e),s=i.match(r);if(s){a=n,t.match(/:[^\s/]+/g).forEach((e,t)=>{o[e.substring(1)]=s[t+1]});break}}}c&&=(o={...o,...c},null);let s=a||t;if(!s)return;let l=async()=>{typeof s==`function`&&await s(r,o)};if(!document.startViewTransition||p){p&&=(p.skipTransition(),null);let e=document.querySelector(`.pm-view-content.active`);e&&(e.classList.remove(`pm-animate-fade-in`,`pm-view-enter`,`pm-view-enter-active`),e.offsetWidth),l();let t=document.querySelector(`.pm-view-content.active`);t&&(t.classList.add(`pm-animate-fade-in`),t.classList.add(`pm-view-enter`),requestAnimationFrame(()=>{t.classList.add(`pm-view-enter-active`),m(t);let e=()=>{t.classList.remove(`pm-view-enter`,`pm-view-enter-active`)};t.addEventListener(`transitionend`,e,{once:!0}),setTimeout(e,250)}));return}try{let e=document.startViewTransition(async()=>{await l()});p=e;let t=e=>e.catch(()=>{});t(e.ready),t(e.updateCallbackDone),t(e.finished),e.finished.finally(()=>{p=null;let e=document.querySelector(`.pm-view-content.active`);e&&requestAnimationFrame(()=>m(e))})}catch{p=null,l()}}function ee(){window.addEventListener(`popstate`,e=>{e.state?.route?h(e.state.route):h(o())}),window.addEventListener(`hashchange`,()=>{let e=window.location.hash;if(e&&e.startsWith(`#/`)){let t=e.replace(`#/`,``);history.replaceState(null,``,window.location.pathname+window.location.search),l(t)}}),l(o())}return{currentRoute:o,setAuthGuard:s,navigate:l,replace:u,on:d,onNotFound:f,start:ee,_dispatch:h}}var Me=e({dequeue:()=>Re,enqueue:()=>Ie,getQueue:()=>E,getQueueCount:()=>Le,processQueue:()=>ze}),Ne=`portal-maestros`,Pe=1,w=`sync_queue`,Fe=null;async function T(){return Fe||(Fe=await f(Ne,Pe,{upgrade(e){e.objectStoreNames.contains(w)||e.createObjectStore(w,{keyPath:`id`,autoIncrement:!0}).createIndex(`by_created_at`,`created_at`)}}),Fe)}async function Ie({tabla:e,operacion:t,payload:n}){await(await T()).add(w,{tabla:e,operacion:t,payload:n,intentos:0,created_at:new Date().toISOString()})}async function E(){return(await T()).getAll(w)}async function Le(){return(await T()).count(w)}async function Re(e){await(await T()).delete(w,e)}async function ze(e){let t=await E();for(let n of t)try{await e(n),await Re(n.id)}catch{let e=await T();n.intentos>=5?await Re(n.id):await e.put(w,{...n,intentos:n.intentos+1})}}var Be=e({getPermisos:()=>D,obtenerSolicitudActual:()=>Ve,solicitarPermiso:()=>He});async function D(e){let t={puede_registrar_alumnos:!1,puede_inscribir_clases:!1,puede_planificar:!1,puede_asistir:!1,solicitudes:[],solicitud_actual:null};if(!e)return t;try{let n=null;try{n=await ee(e)}catch(e){console.debug(`[PermisoService] No solicitud found or table not ready:`,e.message)}let r=await ne(e);if(!r){let e=n?.estado===`aprobado`?n:null;return{...t,puede_registrar_alumnos:e?.solicita_alumnos??!1,puede_inscribir_clases:e?.solicita_clases??!1,solicitud_actual:n}}let i=r.permisos||[],a=r.solicitudes||[],o=n?.estado===`aprobado`?n:null;return{puede_registrar_alumnos:i.includes(`alumnos:create`)||i.includes(`registrar_alumnos`)||(r.puede_registrar_alumnos??!1)||(o?.solicita_alumnos??!1),puede_inscribir_clases:i.includes(`clases:enroll`)||i.includes(`inscribir_clases`)||i.includes(`clases:create`)||(r.puede_inscribir_clases??!1)||(o?.solicita_clases??!1),puede_planificar:i.includes(`planificacion:write`)||!1,puede_asistir:i.includes(`asistencias:write`)||!1,solicitudes:a,solicitud_actual:n}}catch(e){return console.warn(`[PermisoService] Error obteniendo permisos, fail-closed:`,e.message),t}}async function Ve(e){if(!e)return null;try{return await ee(e)}catch(e){return console.warn(`[PermisoService] Error obteniendo solicitud actual:`,e.message),null}}async function He(e,t){if(!e||!t)throw Error(`ID de maestro y clave de permiso son requeridos`);let n=t===`alumnos:create`,r=t===`clases:enroll`;if(!n&&!r)throw Error(`Clave de permiso no reconocida: `+t);try{return await te(e,n,r)}catch(t){if(t.message?.includes(`solicitud pendiente`))return await Ve(e)||{};throw t}}var Ue=null;function We(e,t){Ue=e}function Ge(e){Ue&&Ue(e)}var Ke=new class{constructor(){this.storageKey=`portal-maestros-theme`,this.init()}init(){let e=localStorage.getItem(this.storageKey),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`;this.currentTheme=e||t,this.applyTheme(this.currentTheme),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(this.storageKey)||(this.currentTheme=e.matches?`dark`:`light`,this.applyTheme(this.currentTheme))})}applyTheme(e){document.documentElement.setAttribute(`data-bs-theme`,e),document.documentElement.setAttribute(`data-portal-theme`,e),this.updateCustomProperties(e)}updateCustomProperties(e){let t=document.documentElement;e===`dark`?(t.style.setProperty(`--pm-glass-bg`,`rgba(30, 41, 59, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(255, 255, 255, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(15, 23, 42, 0.95)`)):(t.style.setProperty(`--pm-glass-bg`,`rgba(255, 255, 255, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(0, 0, 0, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(242, 242, 247, 0.95)`))}toggle(){this.currentTheme=this.currentTheme===`dark`?`light`:`dark`,this.applyTheme(this.currentTheme),localStorage.setItem(this.storageKey,this.currentTheme),window.dispatchEvent(new CustomEvent(`themeChanged`,{detail:{theme:this.currentTheme}}))}getCurrentTheme(){return this.currentTheme}createToggleButton(){let e=document.createElement(`button`);return e.className=`pm-theme-toggle`,e.setAttribute(`aria-label`,`Cambiar tema`),e.innerHTML=`
      <div class="pm-theme-toggle-track">
        <div class="pm-theme-toggle-thumb">
          <i class="bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon"></i>
        </div>
      </div>
    `,e.addEventListener(`click`,()=>{this.toggle(),this.updateButtonIcon(e)}),window.addEventListener(`themeChanged`,()=>{this.updateButtonIcon(e)}),e}updateButtonIcon(e){let t=e.querySelector(`.pm-theme-icon`);t&&(t.className=`bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon`)}};function qe(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function Je(e){if(!e||typeof e!=`string`)return{claseId:null,fecha:null,isValid:!1};let t=e.match(/^\/asistencia\/([a-f0-9-]{36})\/(\d{4}-\d{2}-\d{2})$/);return t?{claseId:t[1],fecha:t[2],isValid:!0}:{claseId:null,fecha:null,isValid:!1}}function Ye(e){let{claseId:t,fecha:n,isValid:r}=Je(e);if(!r){console.warn(`[notificationService] Invalid deep link:`,e);return}window.appNavigate?.({view:`asistencia`,claseId:t,fecha:n})}p(e=>{if(e.event===`subscriptionChanged`)console.log(`[Notif] Push subscription changed:`,e.subscribed);else if(e.event===`notificationReceived`){console.log(`[Notif] Real-time push received:`,e.notification),nt(e.notification);let t=e.notification;t?.data?.deep_link?Ye(t.data.deep_link):t?.data?.deep_link_url&&Ye(t.data.deep_link_url),A.some(t=>t.id===e.notification.id)||(A.unshift({...e.notification,created_at:e.notification.created_at||new Date().toISOString()}),M())}});var Xe=new re(`maestro-notifications`),Ze=30*1e3,Qe=60*1e3,$e=120*1e3,O=new Map;function et(e){return`${e.tipo||`unknown`}:${e.clase_id||e.alumno_id||e.id||`generic`}:${Math.floor(Date.now()/Qe)}`}function tt(){let e=Date.now();for(let[t,n]of O.entries())e>n&&O.delete(t)}function nt(e){let t=et(e),n=Date.now()+$e;O.set(t,n)}function rt(){return tt(),O.size}function it(e){return`notif_cache_${e}`}function k(e){try{let t=A.filter(e=>!String(e.id).startsWith(`local_`)).slice(0,30);localStorage.setItem(it(e),JSON.stringify(t))}catch{}}function at(e){try{let t=localStorage.getItem(it(e));return t?JSON.parse(t):[]}catch{return[]}}var A=[],j=[];function ot(e){return j.push(e),e(A),()=>{j=j.filter(t=>t!==e)}}function M(){j.forEach(e=>e([...A]))}async function N(){let e=c();if(!e)return[];A.length===0&&(A=at(e.id),A.length>0&&M());try{let{data:t,error:n}=await s.from(`notificaciones`).select(`*`).eq(`profile_id`,e.id).order(`created_at`,{ascending:!1}).limit(30);if(n)return console.warn(`[NotifService] Error fetch:`,n),A;let r=(t||[]).map(e=>({...e,created_at:e.created_at||new Date().toISOString()})),i=A.filter(e=>String(e.id).startsWith(`local_`));return A=[...r,...i],await st(e.id),k(e.id),M(),A}catch(e){return console.error(`[NotifService]`,e),A}}async function st(e){try{let t=new Date,n=qe(t),i=t.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[s,c]=await Promise.all([r(),o(e,n,n)]),l=s.map(e=>e.id),u=Object.fromEntries(s.map(e=>[e.id,e])),d=(await a(l)).filter(e=>e.dia?.toLowerCase()===i);c.filter(e=>e.estado===`pendiente`||e.estado===`borrador`||e.borrador===!0);let f=new Set(c.filter(e=>e.borrador===!1||e.estado===`registrada`||e.estado===`cerrada`).map(e=>e.clase_id));A=A.filter(e=>String(e.id).startsWith(`local_`)?!f.has(e.clase_id):!0);let p=new Date;for(let e of d){if(!e.hora_fin||f.has(e.clase_id))continue;let[t,r]=e.hora_fin.split(`:`),i=new Date;i.setHours(parseInt(t,10),parseInt(r,10),0,0);let a=(p-i)/6e4;if(a<30)continue;let o=u[e.clase_id],s=`${e.clase_id}_${n}`;if(A.some(e=>e.referencia_id===s&&e.tipo===`sesion_sin_registrar`))continue;let c=e.hora_fin?e.hora_fin.slice(0,5):``,l=e.hora_inicio?e.hora_inicio.slice(0,5):``,d=l&&c?` (${l}–${c})`:``,m=Math.round(a),h=m>=60?`hace ${Math.floor(m/60)}h ${m%60}min`:`hace ${m} min`;A.unshift({id:`local_`+s,tipo:`sesion_sin_registrar`,titulo:`Clase sin registrar`,mensaje:`${o?.nombre||`Tu clase`}${d} terminó ${h}. Registrá la asistencia para que quede guardada.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:s,clase_id:e.clase_id,fecha:n})}for(let e of d){if(!e.hora_inicio)continue;let[t,r]=e.hora_inicio.split(`:`),i=new Date;i.setHours(parseInt(t,10),parseInt(r,10),0,0);let a=(i-p)/6e4;if(a<0||a>15)continue;let o=u[e.clase_id],s=`prox_${e.clase_id}_${n}`;if(A.some(e=>e.referencia_id===s))continue;let c=e.hora_inicio?e.hora_inicio.slice(0,5):``,l=Math.round(a);A.unshift({id:`local_`+s,tipo:`recordatorio_clase`,titulo:`Clase por empezar`,mensaje:`${o?.nombre||`Tu clase`}${c?` a las ${c}`:``} empieza en ${l} ${l===1?`minuto`:`minutos`}. Prepará la planificación.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:s,clase_id:e.clase_id,fecha:n})}}catch(e){console.warn(`[NotifService] Error local alerts:`,e)}}async function P(e){let t=c(),n=A.find(t=>t.id===e);if(n&&(n.estado=`leida`),M(),t&&k(t.id),!String(e).startsWith(`local_`))try{await s.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`id`,e)}catch(e){console.warn(`[NotifService] Error al marcar leída`,e)}}async function ct(e){let t=c();if(A=A.filter(t=>t.id!==e),M(),t&&k(t.id),String(e).startsWith(`local_`))return{success:!0};try{let{error:t}=await s.from(`notificaciones`).delete().eq(`id`,e);return t?(console.error(`[NotifService] Error al eliminar en base de datos:`,t.message),{success:!1,error:t}):{success:!0}}catch(e){return console.error(`[NotifService] Excepción al eliminar:`,e),{success:!1,error:e}}}async function lt(){let e=c();if(A.forEach(e=>{e.estado!==`leida`&&(e.estado=`leida`)}),M(),e&&k(e.id),e)try{await s.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`profile_id`,e.id).neq(`estado`,`leida`)}catch(e){console.warn(`[NotifService] Error al marcar todas`,e)}}function ut(){return A.filter(e=>e.estado===`pendiente`||e.estado===`enviada`).length}var F=null;function dt(){let e=c();e&&(F||(F=s.channel(`notificaciones:${e.id}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${e.id}`},t=>{let n={...t.new,created_at:t.new.created_at||new Date().toISOString()};A.some(e=>e.id===n.id)||(A.unshift(n),k(e.id),M(),ft(n),console.log(`[Realtime] Nueva notificación recibida:`,n.titulo))}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${e.id}`},t=>{let n=A.findIndex(e=>e.id===t.new.id);n!==-1&&(A[n]={...A[n],...t.new},k(e.id),M())}).subscribe(e=>{console.log(`[Realtime] Canal notificaciones: ${e}`),(e===`CHANNEL_ERROR`||e===`SUBSCRIPTION_ERROR`)&&(console.warn(`[Realtime] Canal cerrado, activando polling como fallback`),F=null,gt())}),Xe.registerChannel(F)))}function ft(e){if(document.getElementById(`pm-notificaciones-drawer-overlay`)?.classList.contains(`open`))return;let t=document.getElementById(`pm-notif-inapp-toast`);t&&t.remove();let n=pt(e.tipo),r=document.createElement(`div`);r.id=`pm-notif-inapp-toast`,r.setAttribute(`role`,`alert`),r.setAttribute(`aria-live`,`polite`),r.innerHTML=`
    <div class="pm-iat-content">
      <div class="pm-iat-icon">${n}</div>
      <div class="pm-iat-text">
        <strong class="pm-iat-title">${e.titulo||`Nueva notificación`}</strong>
        <span class="pm-iat-msg">${e.mensaje||``}</span>
      </div>
      <button class="pm-iat-close" aria-label="Cerrar">×</button>
    </div>
  `,document.body.appendChild(r),ht(),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add(`pm-iat-visible`))});let i=()=>{r.classList.remove(`pm-iat-visible`),setTimeout(()=>r.remove(),350)};r.querySelector(`.pm-iat-close`).addEventListener(`click`,i),r.addEventListener(`click`,e=>{e.target.classList.contains(`pm-iat-close`)||(document.getElementById(`pm-bell-btn`)?.click(),i())}),setTimeout(i,6e3)}function pt(e){return{sesion_sin_registrar:`⚠️`,recordatorio_clase:`⏰`,mensaje_admin:`📣`,tarea_vencida:`📕`,in_app:`🔔`}[e]||`🔔`}var mt=!1;function ht(){if(mt)return;mt=!0;let e=document.createElement(`style`);e.textContent=`
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
  `,document.head.appendChild(e)}var I=null;function gt(){I===null&&(I=setInterval(()=>{document.visibilityState!==`hidden`&&N()},Ze),Xe.registerInterval(I))}function _t(){I!==null&&(clearInterval(I),I=null)}document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`?(N(),gt()):_t()});function vt(){let e=qe();A=A.filter(t=>String(t.id).startsWith(`local_`)?t.referencia_id?.includes(e):!0)}vt(),document.visibilityState!==`hidden`&&gt();function yt(e,{onClose:t}={}){if(!e)return{dispose:()=>{}};let n=document.activeElement;function r(){return Array.from(e.querySelectorAll(`button:not([disabled]):not([hidden]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])`))}function i(){let e=r();e.length>0&&e[0].focus()}function a(e){if(e.key===`Escape`){e.preventDefault(),typeof t==`function`&&t();return}if(e.key!==`Tab`)return;let n=r();if(n.length===0){e.preventDefault();return}e.preventDefault();let i=n.indexOf(document.activeElement);e.shiftKey?n[i<=0?n.length-1:i-1].focus():n[i===-1||i===n.length-1?0:i+1].focus()}i(),e.addEventListener(`keydown`,a);function o(){e.removeEventListener(`keydown`,a),n&&typeof n.focus==`function`&&n.focus()}return{dispose:o}}`serviceWorker`in navigator&&navigator.serviceWorker.addEventListener(`message`,e=>{if(e.data?.type===`NAVIGATE_TO`){let t=e.data.url||e.data.hash;t&&(window.location.hash=t.startsWith(`#`)?t.slice(1):t)}});var bt=null,L=null;function xt(e){let t=new Date(e),n=new Date-t,r=Math.floor(n/1e3),i=Math.floor(r/60),a=Math.floor(i/60),o=Math.floor(a/24),s=new Intl.RelativeTimeFormat(`es`,{numeric:`auto`});return o>0?s.format(-o,`day`):a>0?s.format(-a,`hour`):i>0?s.format(-i,`minute`):`hace un momento`}var St={init(){document.getElementById(`pm-notificaciones-drawer-overlay`)||(bt=document.createElement(`div`),bt.innerHTML=`
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
    `,document.body.appendChild(bt),document.getElementById(`pm-notificaciones-close`).addEventListener(`click`,this.close),document.getElementById(`pm-notificaciones-drawer-overlay`).addEventListener(`click`,e=>{e.target.id===`pm-notificaciones-drawer-overlay`&&this.close()}),document.getElementById(`pm-notif-mark-all`).addEventListener(`click`,()=>{lt()}),L=ot(e=>{this.renderList(e)}),N())},_updateDedupBadge(){let e=document.getElementById(`pm-notif-dedup-badge`);if(!e)return;let t=rt();t>0?(e.textContent=`🔄 ${t} dedup`,e.style.display=`inline-flex`):e.style.display=`none`},renderList(e){let t=document.getElementById(`pm-notificaciones-list`);if(t){if(this._updateDedupBadge(),e.length===0){t.innerHTML=`
        <div class="text-center text-muted mt-5">
          <i class="bi bi-bell-slash" style="font-size: 2rem; opacity: 0.5;"></i>
          <p class="mt-2">No tienes notificaciones recientes.</p>
        </div>
      `;return}t.innerHTML=Tt(e).map(e=>{let t=e.count>1,n=e.items.some(e=>e.estado!==`leida`),r=Et(e.tipo,e.items[0]),i=e.tipo===`sesion_sin_registrar`;return`
        <div
          class="pm-notif-item ${n?``:`leida`} ${i?`pm-notif-item--urgent`:``}"
          data-ids="${e.items.map(e=>e.id).join(`,`)}"
          data-route="${r}"
          title="${t?`Ver todo`:e.items[0].titulo}"
        >
          <div class="pm-notif-icon ${wt(e.tipo)}">
            <i class="bi ${Ct(e.tipo)}"></i>
          </div>
          <div class="pm-notif-content">
            <div class="pm-notif-title">
              ${t?`${e.items[0].titulo} <span class="pm-notif-count">${e.count}</span>`:e.items[0].titulo}
            </div>
            <div class="pm-notif-msg">
              ${t?`${e.count} clases sin registrar`:e.items[0].mensaje}
            </div>
            <div class="pm-notif-footer-row">
              <span class="pm-notif-time">${xt(e.items[0].created_at)}</span>
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
      `}).join(``),t.querySelectorAll(`.pm-notif-cta`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation(),e.closest(`.pm-notif-item`).dataset.ids.split(`,`).forEach(e=>P(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``),St.close())})}),t.querySelectorAll(`.pm-notif-item`).forEach(e=>{e.addEventListener(`click`,t=>{if(t.target.closest(`.pm-notif-actions`)||t.target.closest(`.pm-notif-cta`))return;e.dataset.ids.split(`,`).forEach(e=>P(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``))})}),t.querySelectorAll(`.pm-notif-btn-mark`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),e.dataset.ids.split(`,`).forEach(e=>P(e))})}),t.querySelectorAll(`.pm-notif-btn-delete`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.dataset.ids.split(`,`);if(!confirm(`¿Estás seguro de que querés eliminar esta notificación?`))return;let r=!0;for(let e of n)(await ct(e)).success||(r=!1);r?window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificación eliminada correctamente.`,type:`info`}})):window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Hubo un problema al eliminar la notificación.`,type:`danger`}})),N()})})}},open(){this.init(),this._triggerEl=document.activeElement;let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e.style.display=`block`,e.offsetHeight,e.classList.add(`open`);let t=document.querySelector(`#pm-notificaciones-drawer-overlay .pm-drawer`);t&&(this._trap&&this._trap.dispose(),this._trap=yt(t,{onClose:()=>this.close()}));let n=document.getElementById(`pm-notificaciones-close`);n&&n.focus(),this._updateDedupBadge(),N()},close(){this._trap&&=(this._trap.dispose(),null),L&&typeof L==`function`&&(L(),L=null);let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e&&(e.classList.remove(`open`),setTimeout(()=>{e.style.display=`none`},300)),this._triggerEl&&typeof this._triggerEl.focus==`function`&&this._triggerEl.focus(),this._triggerEl=null}};function Ct(e){switch(e){case`sesion_sin_registrar`:return`bi-exclamation-triangle`;case`recordatorio_clase`:return`bi-clock-history`;case`mensaje_admin`:return`bi-megaphone`;case`tarea_vencida`:return`bi-journal-x`;default:return`bi-bell`}}function wt(e){switch(e){case`sesion_sin_registrar`:return`bg-danger text-white`;case`recordatorio_clase`:return`bg-warning text-dark`;case`mensaje_admin`:return`bg-primary text-white`;default:return`bg-secondary text-white`}}function Tt(e){let t=new Set([`recordatorio_clase`,`in_app`]),n=[],r=new Map;for(let i of e)if(t.has(i.tipo)&&r.has(i.tipo)){let e=n[r.get(i.tipo)];e.items.push(i),e.count++}else r.set(i.tipo,n.length),n.push({tipo:i.tipo,items:[i],count:1});return n}function Et(e,t){let n=t.clase_id||t.data?.clase_id,r=t.alumno_id||t.data?.alumno_id,i=new Date,a=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,`0`)}-${String(i.getDate()).padStart(2,`0`)}`,o=t.fecha||a;switch(e){case`sesion_sin_registrar`:case`recordatorio_clase`:return n?`#/asistencia?clase=${n}&fecha=${o}`:`#/hoy`;case`mensaje_admin`:return`#/perfil`;case`tarea_vencida`:return r?`#/alumno?id=${r}`:`#/hoy`;default:return`#/hoy`}}if(!document.getElementById(`pm-notif-styles`)){let e=document.createElement(`style`);e.id=`pm-notif-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}var Dt=R();function R(){let e=window.innerWidth;return e<768?`mobile`:e<1024?`tablet`:`desktop`}window.addEventListener(`resize`,()=>{let e=R();e!==Dt&&(Dt=e,document.body.dataset.pmLayout=e)},{passive:!0});function Ot(){let e=document.getElementById(`portal-app`);if(!e)return;let t=e.querySelector(`.pm-header`),n=e.querySelector(`.pm-bottom-nav`),r=e.querySelector(`.pm-view`);t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.display=`none`)}function kt(e){document.querySelectorAll(`.pm-nav-tab`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)}),document.querySelectorAll(`.pm-sidebar-link`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)})}function At(e,t,n,r,i){let a=t?.es_admin?`<a href="/admin" class="pm-admin-link" title="Ir al Panel Admin">
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
  `,i();let o=document.getElementById(`pm-theme-toggle-container`);o&&o.appendChild(Ke.createToggleButton()),document.getElementById(`pm-footer-nav`)?.querySelectorAll(`.pm-nav-tab`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),r(e.dataset.route)})}),document.getElementById(`pm-sidebar`)?.querySelectorAll(`.pm-sidebar-link[data-route]`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),r(e.dataset.route)})}),document.getElementById(`pm-btn-perfil`)?.addEventListener(`click`,e=>{e.preventDefault(),r(`perfil`)}),document.getElementById(`pm-bell-btn`)?.addEventListener(`click`,()=>St.open()),jt(r)}function jt(e){let t=document.getElementById(`pm-header`),n=document.getElementById(`pm-header-search-input`),r=document.getElementById(`pm-search-toggle-btn`),i=document.getElementById(`pm-search-back-btn`),a=()=>{t?.classList.add(`search-active`),setTimeout(()=>n?.focus(),50)},o=()=>{t?.classList.remove(`search-active`),n&&(n.value=``),document.getElementById(`pm-header-search-dropdown`)?.remove()};r?.addEventListener(`click`,e=>{e.stopPropagation(),a()}),i?.addEventListener(`click`,e=>{e.stopPropagation(),o()});let c=null,l=null,u=()=>{c?.remove(),c=null},d=t=>{if(u(),!t.length)return;let r=document.createElement(`div`);r.id=`pm-header-search-dropdown`,r.setAttribute(`role`,`listbox`),r.innerHTML=t.map(e=>`
      <div class="pm-hsd-item" role="option" tabindex="0" data-id="${e.id}">
        <i class="bi bi-person-fill pm-hsd-icon"></i>
        <div class="pm-hsd-info">
          <span class="pm-hsd-name">${e.nombre_completo}</span>
          ${e.instrumento_principal?`<span class="pm-hsd-meta">${e.instrumento_principal}</span>`:``}
        </div>
        <i class="bi bi-chevron-right pm-hsd-arrow"></i>
      </div>`).join(``),document.body.appendChild(r);let i=n.getBoundingClientRect();r.style.cssText=`position:fixed;top:${i.bottom+4}px;left:${Math.max(8,i.left)}px;width:${Math.min(320,window.innerWidth-16)}px;z-index:9999;background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.18);overflow:hidden;`,c=r,r.querySelectorAll(`.pm-hsd-item`).forEach(t=>{let n=()=>{o(),u(),e(`alumno`,{id:t.dataset.id})};t.addEventListener(`click`,n),t.addEventListener(`keypress`,e=>{e.key===`Enter`&&n()})})};if(n?.addEventListener(`input`,async()=>{let e=n.value.trim();if(clearTimeout(l),e.length<1){u();return}let{getAlumnoIndexFromMetricas:t}=await g(async()=>{let{getAlumnoIndexFromMetricas:e}=await import(`./metricasView-8TM7RuUL.js`);return{getAlumnoIndexFromMetricas:e}},__vite__mapDeps([0,1,2,3,4,5,6,7])),r=t();if(r){let t=e.toLowerCase(),n=r.filter(e=>e.nombre_completo?.toLowerCase().includes(t)).slice(0,8).map(e=>({...e,instrumento_principal:e.clases?.join(`, `)||null}));d(n);return}l=setTimeout(async()=>{try{let{data:t}=await s.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).ilike(`nombre_completo`,`%${e}%`).limit(8);d(t||[])}catch{u()}},200)}),n?.addEventListener(`keydown`,e=>{e.key===`Escape`&&(o(),u())}),!document.getElementById(`pm-hsd-styles`)){let e=document.createElement(`style`);e.id=`pm-hsd-styles`,e.textContent=`.pm-hsd-item{display:flex;align-items:center;gap:0.625rem;padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid var(--pm-border);transition:background 0.1s}.pm-hsd-item:last-child{border-bottom:none}.pm-hsd-item:hover,.pm-hsd-item:focus{background:var(--pm-surface-2);outline:none}.pm-hsd-icon{font-size:1rem;color:var(--pm-primary);flex-shrink:0}.pm-hsd-info{flex:1;min-width:0}.pm-hsd-name{display:block;font-size:0.875rem;font-weight:500;color:var(--pm-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-hsd-meta{font-size:0.7rem;color:var(--pm-text-muted)}.pm-hsd-arrow{color:var(--pm-text-muted);font-size:0.75rem}`,document.head.appendChild(e)}document.addEventListener(`click`,e=>{!n?.contains(e.target)&&!c?.contains(e.target)&&u()})}var Mt={login:()=>g(()=>import(`./loginView-C7qEU6VW.js`),__vite__mapDeps([8,3,2,5,9])),register:()=>g(()=>import(`./registerView-C8ZgFCPC.js`),__vite__mapDeps([10,2,5,9])),"pending-approval":()=>g(()=>import(`./pendingApprovalView-Bd3CoXfX.js`),__vite__mapDeps([11,2])),hoy:()=>g(()=>import(`./hoyView-CHtH1Ckh.js`),__vite__mapDeps([12,13,1,2,3,14,15,16,17,4,18,19,6,7])),fechas:()=>g(()=>import(`./calendarioView-DicCtN37.js`),__vite__mapDeps([20,13,1,2,3,4,18,19])),calendario:()=>g(()=>import(`./calendarioView-DicCtN37.js`),__vite__mapDeps([20,13,1,2,3,4,18,19])),clases:()=>g(()=>import(`./calendarioView-DicCtN37.js`),__vite__mapDeps([20,13,1,2,3,4,18,19])),metricas:()=>g(()=>import(`./metricasView-8TM7RuUL.js`),__vite__mapDeps([0,1,2,3,4,5,6,7])),asistencia:()=>g(()=>import(`./asistenciaView-pYxyphCp.js`),__vite__mapDeps([21,13,1,2,3,22,17,15,23,7,14,16,4,5,24])),"clase-emergente":()=>g(()=>import(`./claseEmergenteView-CQYNaeb4.js`),__vite__mapDeps([25,2])),perfil:()=>g(()=>import(`./perfilView-BWTWNaHP.js`),__vite__mapDeps([26,2,3,27,13,17,19,28,29,30,31,4,32])),planificacion:()=>g(()=>import(`./planificacionView-Cev2-Yul.js`),__vite__mapDeps([33,13,1,2,3,34,35,14,15,5])),alumno:()=>g(()=>import(`./alumnoPerfilView-DKMlN4uj.js`),__vite__mapDeps([36,13,2,3,28,4])),gamificacion:()=>g(()=>import(`./gamificacionView-Dn3OnDIQ.js`),__vite__mapDeps([37,2,3,4])),ruta:()=>g(()=>import(`./rutaGameificadaView-ZGHt1etV.js`),__vite__mapDeps([38,1,2,3,24,7])),"crear-clase":()=>g(()=>import(`./crearClaseView-D_yN353s.js`),__vite__mapDeps([39,2,3,4])),"ruta-plan-builder":()=>g(()=>import(`./academicPlanBuilderView-C4XXcJUD.js`),__vite__mapDeps([40,2,16,13,17,4])),"ruta-semanal":()=>g(()=>import(`./weeklyPlanView-DykQtXRF.js`),__vite__mapDeps([41,2,16,13,17,4])),"ruta-libreria":()=>g(()=>import(`./routeLibraryView-BDbQ4tDE.js`),__vite__mapDeps([42,16,13,2,17])),"ruta-detalle":()=>g(()=>import(`./routeDetailView-BJ5A2viT.js`),__vite__mapDeps([43,16,13,2,17])),"gestionar-clases":()=>g(()=>import(`./gestionarClasesView-DdI1Iy9C.js`),__vite__mapDeps([44,13,3,2,45,15])),"gestionar-horario":()=>g(()=>import(`./disponibilidadView-B2GTIbIu.js`),__vite__mapDeps([46,13,30,2,5]))},Nt=Object.keys(Mt).concat([`logout`]),Pt=new Set([`hoy`,`fechas`,`calendario`,`metricas`,`perfil`,`ruta`,`gamificacion`,`crear-clase`,`planificacion`,`ruta-libreria`,`gestionar-horario`]);function Ft(e,t,n){[`login`,`logout`,`fechas`,`calendario`,`clases`,`hoy`,`asistencia`,`metricas`,`perfil`,`clase-emergente`,`planificacion`,`alumno`,`gamificacion`,`ruta`,`crear-clase`,`ruta-plan-builder`,`ruta-semanal`,`ruta-libreria`,`gestionar-clases`,`register`,`pending-approval`,`gestionar-horario`].forEach(t=>e.on(t,(e,r)=>n(t,r))),e.on(`ruta-detalle/:id`,(e,t)=>n(`ruta-detalle`,t)),e.onNotFound(()=>n(`hoy`))}function z(){let e=document.getElementById(`pm-view-container`);if(!e)return{};e.innerHTML=``;let t={};return Nt.forEach(n=>{let r=document.createElement(`div`);r.id=`pm-view-${n}`,r.className=`pm-view-content`,r.style.display=`none`,e.appendChild(r),t[n]=r}),t}async function It(e,t,n,r,i){let{maestroId:a,permisos:o,router:s,showLoginScreen:c,cleanupPushService:l,stopRealtime:u,logoutMaestro:d}=i;if(e===`logout`)return c(),l(),u(),d().then(()=>window.location.reload()),null;if(e===`gestionar-clases`&&!o?.puede_inscribir_clases){s.navigate(`hoy`);return}let f=Mt[e];if(!f)return null;let p=await f();switch(e){case`login`:p.renderLoginView(t,{onSuccess:i.onLoginSuccess});break;case`register`:p.renderRegisterView(t,{onSuccess:()=>s.navigate(`pending-approval`)});break;case`pending-approval`:p.renderPendingApprovalView(t,{onBackToLogin:()=>s.navigate(`login`)});break;case`fechas`:case`calendario`:case`clases`:return await p.renderCalendarioView(t);case`hoy`:return await p.renderHoyView(t,{onClaseClick:e=>s.navigate(`asistencia?clase=${e}`)});case`asistencia`:return await p.renderAsistenciaView(t,{claseId:r.get(`clase`),fecha:r.get(`fecha`),sesionId:r.get(`sesion`),router:s});case`metricas`:return p.renderMetricasView(t);case`perfil`:return p.renderPerfilView(t);case`clase-emergente`:return p.renderClaseEmergenteView(t,{maestroId:a});case`planificacion`:return await p.renderPlanificacionView(t,{maestroId:a});case`alumno`:return p.renderAlumnoPerfilView(t,{alumnoId:r.get(`id`)||n.id});case`gamificacion`:await p.renderGamificacionView(t);break;case`ruta`:await p.renderRutaGameificadaView(t,{onTopicSelected:e=>s.navigate(`asistencia?clase=${e}`)});break;case`crear-clase`:p.renderCrearClaseView(t);break;case`ruta-plan-builder`:p.renderAcademicPlanBuilderView(t,{alumnoId:r.get(`id`)});break;case`ruta-semanal`:p.renderWeeklyPlanView(t,{alumnoId:r.get(`id`)});break;case`ruta-libreria`:p.RouteLibraryView.render().then(e=>{t.innerHTML=``,t.appendChild(e)});break;case`ruta-detalle`:p.RouteDetailView.render(n).then(e=>{t.innerHTML=``,t.appendChild(e)});break;case`gestionar-clases`:return await p.renderGestionarClasesView(t);case`gestionar-horario`:return await p.renderDisponibilidadView(t,{maestroId:a})}return null}var Lt=!1,B=null;function Rt({isAdmin:e,getMaestro:t,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i,onResize:a}){if(Lt)return;Lt=!0,ot(()=>{let e=document.getElementById(`pm-notif-badge`);if(!e)return;let t=ut();t>0?(e.textContent=t>9?`9+`:t,e.style.display=`flex`):e.style.display=`none`}),N(),dt(),e||zt({getMaestro:t,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i}),document.addEventListener(`keydown`,e=>{if(R()!==`desktop`||e.target.tagName===`INPUT`||e.target.tagName===`TEXTAREA`)return;window._globalAppKeys||(window._globalAppKeys=[]);let t=window._globalAppKeys;if(t.push(e.key.toLowerCase()),t[t.length-2]===`g`){let n={h:`hoy`,c:`fechas`,r:`ruta`,m:`metricas`,p:`perfil`}[e.key.toLowerCase()];n&&(i(n),t.length=0)}t.length>3&&t.splice(0,t.length-2)});let o=null,s=R();window.addEventListener(`resize`,()=>{clearTimeout(o),o=setTimeout(()=>{let e=R();e!==s&&(s=e,a())},250)},{passive:!0})}function zt({getMaestro:e,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i}){let a=e();a?.id&&(B&&=(s.removeChannel(B),null),B=s.channel(`permisos-maestro:${a.id}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`permisos_maestros`,filter:`maestro_id=eq.${a.id}`},async e=>{console.log(`[Realtime] Permisos actualizados:`,e.new);try{let e=await D(a.id),i=n(),o=[],s=[];e.puede_inscribir_clases&&!i?.puede_inscribir_clases&&o.push(`Gestionar e Inscribir Clases`),i?.puede_inscribir_clases&&!e.puede_inscribir_clases&&s.push(`Gestionar e Inscribir Clases`),await r(e,{ganados:o,perdidos:s}),o.length>0?t.success(`¡Nuevos permisos activados: ${o.join(`, `)}! Ahora podés acceder desde el Perfil o la barra de navegación.`):s.length>0?t.show(`El administrador removió tu acceso a: ${s.join(`, `)}.`,`warning`):t.show(`Tus permisos fueron actualizados por el administrador.`,`info`)}catch(e){console.warn(`[Realtime] Error actualizando permisos:`,e.message)}}).subscribe(e=>console.log(`[Realtime] Canal permisos_maestros:`,e)),window.addEventListener(`beforeunload`,()=>s.removeChannel(B),{once:!0}))}i();var V=null,Bt=null;function Vt(){if(Bt)return;if(Bt=!0,!document.getElementById(`app-toast-styles`)){let e=document.createElement(`style`);e.id=`app-toast-styles`,e.textContent=`
      #app-toast-container {
        position: fixed; bottom: 1.25rem; right: 1.25rem;
        z-index: 11020; display: flex; flex-direction: column;
        gap: 0.5rem; pointer-events: none;
      }
      .app-toast {
        pointer-events: all; display: flex; align-items: flex-start;
        gap: 0.65rem; min-width: 280px; max-width: 360px;
        padding: 0.85rem 1rem; border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(24,24,32,0.97);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.3); color: #fff;
        font-size: 0.875rem; line-height: 1.4;
        opacity: 0; transform: translateY(12px) scale(0.97);
        transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
      }
      .app-toast--visible { opacity: 1; transform: translateY(0) scale(1); }
      .app-toast__icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
      .app-toast__body { flex: 1; min-width: 0; }
      .app-toast__title { font-weight: 700; font-size: 0.78rem; letter-spacing: 0.03em; text-transform: uppercase; margin-bottom: 2px; opacity: 0.75; }
      .app-toast__msg { font-size: 0.875rem; color: rgba(255,255,255,0.9); }
      .app-toast--info .app-toast__icon { color: #60a5fa; }
      .app-toast--info { border-color: rgba(96,165,250,0.2); }
      @media (max-width: 400px) {
        #app-toast-container { right: 0.75rem; left: 0.75rem; }
        .app-toast { min-width: unset; max-width: 100%; }
      }
    `,document.head.appendChild(e)}let e=document.getElementById(`app-toast-container`);e||(e=document.createElement(`div`),e.id=`app-toast-container`,document.body.appendChild(e));let t=document.createElement(`div`);t.className=`app-toast app-toast--info`,t.setAttribute(`role`,`alert`),t.innerHTML=`
    <i class="bi bi-arrow-clockwise app-toast__icon" aria-hidden="true"></i>
    <div class="app-toast__body">
      <div class="app-toast__title">ACTUALIZACIÓN</div>
      <div class="app-toast__msg">Nueva versión disponible</div>
    </div>
    <button class="app-toast__close" id="pm-update-btn" style="background:var(--pm-primary,#007aff);color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;">Actualizar</button>
  `,e.appendChild(t),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add(`app-toast--visible`))),t.querySelector(`#pm-update-btn`)?.addEventListener(`click`,()=>{V?.waiting&&V.waiting.postMessage({type:`SKIP_WAITING`}),t.remove()});let n=!1;navigator.serviceWorker.addEventListener(`controllerchange`,()=>{n||(n=!0,window.location.reload())})}if(`serviceWorker`in navigator){let e=async()=>{try{V=await navigator.serviceWorker.register(`/sw.js`),console.log(`[PWA] Service Worker registered:`,V.scope),V.waiting&&Vt(),V.addEventListener(`updatefound`,()=>{let e=V.installing;e&&e.addEventListener(`statechange`,()=>{e.state===`installed`&&navigator.serviceWorker.controller&&Vt()})})}catch(e){console.log(`[PWA] Service Worker registration failed:`,e)}};document.readyState===`complete`?e():window.addEventListener(`load`,e)}else`serviceWorker`in navigator;ye(),he({windowMs:6e4,max:100}),me({enabled:!1,consent:!1}),xe({debug:!1}),ue({dsn:null,environment:`production`}),window.addEventListener(`showToast`,e=>{let{message:n,type:r=`info`}=e.detail||{};n&&t.show(n,r)});var H=null,U=null,Ht=!1,W=je();window.router=W;var G={},K=null,q=new Set;function Ut(e){let t=[{id:`fechas`,label:`Fechas`,icon:`bi-calendar3`},{id:`hoy`,label:`Hoy`,icon:`bi-house-door`},{id:`planificacion`,label:`Plan`,icon:`bi-signpost-split`},{id:`metricas`,label:`Métricas`,icon:`bi-bar-chart-line`}];return e?.puede_inscribir_clases&&t.push({id:`gestionar-clases`,label:`Clases`,icon:`bi-mortarboard`}),t}async function Wt(e){let{tabla:t,operacion:n,payload:r}=e,i={...r};t===`sesiones_clase`&&(i.contenido_dsl!==void 0&&(i.contenido=i.contenido_dsl,delete i.contenido_dsl),i.asistencias!==void 0&&i.asistencia===void 0&&(i.asistencia=i.asistencias,delete i.asistencias)),console.log(`[SYNC] Intentando ${n} en ${t}:`,i);try{if(n===`insert`){let{error:e}=await s.from(t).insert([i]);if(e)throw e}else if(n===`update`){let{id:e,...n}=i,{error:r}=await s.from(t).update(n).eq(`id`,e);if(r)throw r}else if(n===`delete`){let{error:e}=await s.from(t).delete().eq(`id`,i.id);if(e)throw e}}catch(e){if(e.code===`PGRST204`){let{data:e}=await s.from(t).select().limit(1);e?.length>0?console.warn(`[SYNC] Columnas REALES encontradas:`,Object.keys(e[0])):console.warn(`[SYNC] No se pueden leer las columnas. ¿Ejecutaste el SQL en Supabase?`)}throw console.error(`[SYNC] Error crítico:`,e),e}}var Gt=null;async function Kt(){if(navigator.setAppBadge)try{let e=(await E()).length;e>0?await navigator.setAppBadge(e):await navigator.clearAppBadge()}catch{}}async function J(){let e=document.getElementById(`pm-sync-indicator`);if(e){try{let t=await E();t.length===0?(e.className=`pm-online-dot synced`,e.title=`Sincronizado`):(e.className=`pm-online-dot pending`,e.title=`Pendiente (${t.length})`)}catch{e.className=`pm-online-dot error`,e.title=`Error de sincronización`}await Kt()}}async function qt(){clearTimeout(Gt),Gt=setTimeout(async()=>{if(navigator.onLine)try{await ze(Wt)}finally{await J()}},1e3)}window.addEventListener(`online`,qt),window.addEventListener(`offline`,J);function Jt(){q.clear()}function Yt(e){q.delete(e)}async function Y(e,t={},{silent:n=!1}={}){let r=window.location.search||(window.location.hash.includes(`?`)?window.location.hash.split(`?`)[1]:``),i=new URLSearchParams(r),a=e.split(`?`)[0];if(!n){let e=document.getElementById(`pm-header`);if(e?.classList.contains(`search-active`)){e.classList.remove(`search-active`);let t=document.getElementById(`pm-header-search-input`);t&&(t.value=``)}kt(a),window.pwaInstaller?.evaluateInsights()}let o=G[a];if(!o){console.warn(`[Router] Contenedor no encontrado: ${a}`);return}if(n||(typeof K==`function`&&(K(),K=null),Object.values(G).forEach(e=>{e.style.display=`none`,e.classList.remove(`active`)}),o.style.display=`block`,o.offsetHeight,o.classList.add(`active`)),q.has(a))return;let s=setTimeout(()=>{o.querySelectorAll(`.pm-loading-overlay`).forEach(e=>e.remove());let e=document.createElement(`div`);e.className=`pm-loading pm-loading-overlay`,e.innerHTML=`<div class="pm-spinner"></div>`,o.prepend(e)},300);try{let e=await It(a,o,t,i,{maestroId:H?.id,permisos:U,router:W,showLoginScreen:Zt,cleanupPushService:m,stopRealtime:()=>{},logoutMaestro:ke,onLoginSuccess:()=>$()});e&&(K=e),clearTimeout(s),o.querySelector(`.pm-loading-overlay`)?.remove(),Pt.has(a)&&q.add(a)}catch(e){clearTimeout(s),o.innerHTML=`<p class="pm-error">Error cargando vista: ${e.message}</p>`}}function Xt(e,t,n){H=t,U=n||U,At(e,t,Ut(U),(e,t)=>W.navigate(e,t),J),document.getElementById(`pm-sync-indicator`)?.addEventListener(`click`,async e=>{e.target.classList.contains(`error`)&&await qt()});let r=(W.currentRoute?.()||`hoy`).split(`?`)[0];kt(r)}function Zt(){let e=document.getElementById(`portal-app`);if(!e)return;let t=[`login`,`register`,`pending-approval`],n=(W.currentRoute?.()||`login`).split(`?`)[0];if(t.includes(n)&&n!==`login`){document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(G,z()),X(),W.setAuthGuard(()=>C.isAuthenticated(),t),W.start();return}let r=G.login;if(r){Ot(),r.style.display=`block`,r.innerHTML=``,It(`login`,r,{},new URLSearchParams,{router:W,onLoginSuccess:e=>{e&&e!==`login`?W.navigate(e):$()}});return}e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`,Object.assign(G,z()),X(),W.setAuthGuard(()=>C.isAuthenticated(),t),history.replaceState({route:`login`},``,`/login`),Y(`login`)}function X(){Ft(W,Ht,Y)}async function Qt(){if(H)try{let e=new Date,t=e.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),n=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,i=await r(),[s,c]=await Promise.all([a(i.map(e=>e.id)),o(H.id,n,n)]),l=Object.fromEntries(i.map(e=>[e.id,e]));await h(s.filter(e=>e.dia?.toLowerCase()===t).map(e=>({...e,clase_nombre:l[e.clase_id]?.nombre||`Clase`})),c.filter(e=>e.borrador===!1||e.estado===`registrada`).map(e=>e.clase_id))}catch(e){console.warn(`[Alerts] Error programando alertas:`,e.message)}}var $t={auth:{bar:25},profile:{bar:50,txt:`Cargando tu perfil...`},preparing:{bar:75,txt:`Preparando tu espacio de trabajo...`},ready:{bar:100,txt:`¡Listo!`}};function Z(){let e=document.getElementById(`pm-loading-splash`);e&&(e.style.transition=`opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)`,e.style.opacity=`0`,e.style.transform=`scale(0.97)`,e.style.pointerEvents=`none`,setTimeout(()=>e.remove(),400))}function Q(e,t){if(!document.getElementById(`pm-loading-splash`))return;if(e===`remove`){Z();return}let n=$t[e];if(!n)return;let r=document.getElementById(`pm-loading-status`),i=document.getElementById(`pm-loading-greeting`),a=document.getElementById(`pm-loading-progress-bar`),o=document.getElementById(`pm-loading-spinner`);switch(e){case`auth`:i&&(i.textContent=`Hola, ${t?.nombre_completo||`Maestro`}!`),r&&(r.textContent=`Conectando...`);break;case`profile`:r&&n.txt&&(r.textContent=n.txt);break;case`preparing`:r&&n.txt&&(r.textContent=n.txt),o&&(o.style.opacity=`0.5`);break;case`ready`:r&&n.txt&&(r.textContent=n.txt),o&&o.remove();break}a&&(a.style.transition=`width 0.6s cubic-bezier(0.22,1,0.36,1)`,a.style.width=n.bar+`%`),e===`ready`&&setTimeout(()=>Z(),400)}async function $(){let e=document.getElementById(`portal-app`);if(!e)return;console.log(`[Init] Iniciando Portal...`);let t=await C.init();if(console.log(`[Init] Auth:`,t?`con maestro`:`sin maestro`),t&&Q(`auth`,t),C.isPendingApproval()){console.log(`[Init] Cuenta pendiente de aprobación — mostrando pantalla de espera`),document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(G,z(!1)),X(),history.replaceState({route:`pending-approval`},``,`/pending-approval`),Y(`pending-approval`),Z();return}let r=[`login`,`register`,`pending-approval`],i=(window.router||W).currentRoute().split(`?`)[0],a=r.includes(i);if(!t&&!a){Zt(),Z();return}if(!t&&a){document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(G,z()),X(),W.setAuthGuard(()=>C.isAuthenticated(),r),W.start(),Z();return}if(t.es_admin&&!t.es_maestro){console.log(`[Init] Admin puro detectado → redirigiendo a /admin`),Z(),window.location.href=`/admin`;return}Q(`profile`,t);let o=null;try{o=await D(t.id)}catch(e){console.warn(`[Init] Error fetching permissions:`,e.message)}Xt(e,t,o),Q(`preparing`),Object.assign(G,z()),Rt({isAdmin:!1,getMaestro:()=>H,getPermisosCached:()=>U,onPermisosUpdate:async(t,{ganados:n,perdidos:i})=>{let a=(W.currentRoute?.()||`perfil`).split(`?`)[0],o=a===`gestionar-clases`&&!t.puede_inscribir_clases||a===`pending-approval`&&n.length>0?`hoy`:a;Xt(e,H,t),Object.assign(G,z()),X(),W.setAuthGuard(()=>C.isAuthenticated(),r),q.clear(),await Y(o),W.navigate(o)},onNavigate:e=>W.navigate(e),onResize:()=>{let e=(W.currentRoute?.()||`hoy`).split(`?`)[0];kt(e),J()}}),We(Yt,Jt),X(),W.setAuthGuard(()=>C.isAuthenticated(),r),W.start(),Q(`ready`);let s=(W.currentRoute?.()||``).split(`?`)[0];(!s||s===`login`||s===`logout`)&&W.navigate(`hoy`),n().then(async()=>{let e=[`hoy`,`fechas`,`calendario`,`metricas`],t=(W.currentRoute?.()||`hoy`).split(`?`)[0],n=e.filter(e=>e!==t&&!q.has(e));await Promise.all(n.map(e=>{if(G[e])return Y(e,{},{silent:!0})})),Qt(),window.pwaInstaller?.evaluateInsights()}).catch(e=>console.warn(`[Prefetch] Error:`,e.message)),qt()}var en=(e,t,n,r)=>`
  <div style="padding:40px;color:#fff;font-family:'Outfit',sans-serif;background:radial-gradient(circle at top right,#1e293b,#0f172a);z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;max-width:600px;width:90%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <div style="width:80px;height:80px;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 24px;"><i class="bi ${e}"></i></div>
      <h2 style="margin-bottom:16px;font-weight:700;">${t}</h2>
      <p style="color:rgba(255,255,255,0.6);margin-bottom:24px;">${n}</p>
      <div style="background:rgba(0,0,0,0.3);padding:16px;border-radius:12px;text-align:left;font-family:monospace;font-size:13px;margin-bottom:24px;overflow:auto;max-height:200px;border-left:4px solid #ef4444;">${r}</div>
      <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6);color:white;border:none;padding:12px 32px;border-radius:12px;font-weight:600;cursor:pointer;">Recargar Aplicación</button>
    </div>
  </div>`;window.addEventListener(`error`,e=>{if([`useCache`,`WebSocket`,`content.js`].some(t=>(e.message||``).includes(t))){console.warn(`[Ignored Error]`,e.message);return}de(Error(e.message),{context:`window.error`,filename:e.filename,lineno:e.lineno});let t=document.getElementById(`portal-app`);t&&(t.innerHTML=en(`bi-x-circle-fill`,`Ups! Algo salió mal`,`Se ha producido un error inesperado en la aplicación.`,`<div style="color:#ef4444;font-weight:bold;margin-bottom:8px;">${e.message}</div><div style="color:rgba(255,255,255,0.4);">${e.filename?.split(`/`).pop()}:${e.lineno}</div>`))}),window.addEventListener(`unhandledrejection`,e=>{de(e.reason instanceof Error?e.reason:Error(String(e.reason)),{context:`unhandledRejection`});let t=document.getElementById(`portal-app`);t&&(t.innerHTML=en(`bi-exclamation-triangle-fill`,`Error de Sincronización`,`Hubo un problema al procesar una solicitud de red.`,`<div style="color:#ef4444;font-weight:bold;margin-bottom:8px;">Promise Rejection</div><div style="color:rgba(255,255,255,0.4);">${String(e.reason)}</div>`))}),$().catch(e=>{let t=document.getElementById(`portal-app`);t&&(t.innerHTML=`<div style="padding:20px;color:red;font-family:monospace;background:#fff;z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;"><h2>❌ initPortal() falló</h2><pre>${e?.message||e}\n${e?.stack||``}</pre></div>`)});export{Be as a,Le as c,fe as d,D as i,Me as l,N as n,He as o,Ge as r,Ie as s,yt as t,C as u};