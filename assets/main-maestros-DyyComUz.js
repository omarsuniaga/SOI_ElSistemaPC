const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/metricasView-Cax1vJxj.js","assets/pwaInstaller-CABasb_l.js","assets/supabase-Cgh_dhNB.js","assets/maestroAuth-BMzDPnai.js","assets/portalUtils-CkF82Yyk.js","assets/a11yUtils-DRYT20ux.js","assets/claseAnalysisModal-D4_bAre7.js","assets/groqService-BEo2aU8D.js","assets/loginView-8mM0cW_f.js","assets/login-C-9dKvTL.css","assets/registerView-VoMTp5G2.js","assets/pendingApprovalView-S9oaKwsg.js","assets/hoyView-D0OEk7kb.js","assets/AppModal-Du6jXNYA.js","assets/jspdf.plugin.autotable-DPzO4huE.js","assets/academicService-CgmFcPKt.js","assets/maestroRouteService-C-CCRznf.js","assets/weeklyPlanAdapter-E65PNMYx.js","assets/config-CNiOV0RX.js","assets/weeklyPlanSupabase-BMw9Kvzq.js","assets/periodoSniffer-ZO5JsHUX.js","assets/catalogService-M5LBxZnn.js","assets/idb-hTByFGMt.js","assets/claseEmergenteModal-DzBloOSJ.js","assets/calendarioView-CZyiXzMS.js","assets/planificacion-BdwKIwFz.js","assets/vendor-mK9cUK6A.js","assets/vendor-COf7rB16.css","assets/planificacionAdapter-C-rXyuPH.js","assets/clases-knAl1xY0.js","assets/evaluacionClaseService-PzaE8gD7.js","assets/IndicadorLogro-CUm_IXl5.js","assets/clasesApi-DGHemn9O.js","assets/normalizeText-DvPabODc.js","assets/aiEvaluacionService-_0RGpDzq.js","assets/MapaContenidoSVG-B-8-5_NT.js","assets/mapaClaseService-DaoOTdhF.js","assets/asistenciasSupabase-BCw50kNC.js","assets/asistenciaView-DWHGnG33.js","assets/asistenciasApi-CKT-fCIb.js","assets/reportService-RG3W9EjK.js","assets/calificacionIndicadorPanel-BK40cdMQ.js","assets/evaluationService-Obv-vQVO.js","assets/boletinesService-BS6UlP4L.js","assets/claseEmergenteView-CzYUhK8p.js","assets/perfilView-CpNVhHrk.js","assets/pushService-DExWNx3J.js","assets/phoneUtils-Cpl-jyW9.js","assets/disponibilidadApi-xm0wbIpZ.js","assets/CHANGELOG-DPV2OdzA.js","assets/ausenciaModal-cpnoXd1I.js","assets/planificacionView-CPdhTq2H.js","assets/MapaClaseView-2TUEAf3I.js","assets/alumnoPerfilView-C5Covml4.js","assets/gamificacionView-DzV73nr3.js","assets/rutaGameificadaView-oHYDwM5J.js","assets/crearClaseView-DOzx27-V.js","assets/academicPlanBuilderView-Iu2ERXHt.js","assets/weeklyPlanView-C6OqyCbA.js","assets/routeLibraryView-CNR4y44v.js","assets/routeDetailView-BeL0HvF5.js","assets/gestionarClasesView-CSq5nRFk.js","assets/disponibilidadView-uvpBl1ix.js","assets/proponerContenidoView-CLOfAhHb.js"])))=>i.map(i=>d[i]);
import{i as e,s as t}from"./AppModal-Du6jXNYA.js";import"./early-error-suppression-K9hxPIVV.js";import{_ as n,c as r,f as i,m as a,r as o}from"./pwaInstaller-CABasb_l.js";import{a as s,i as c}from"./supabase-Cgh_dhNB.js";import{i as l,o as u,r as d,t as f}from"./maestroAuth-BMzDPnai.js";import{r as p}from"./vendor-mK9cUK6A.js";import{t as m}from"./idb-hTByFGMt.js";import{o as h,t as ee}from"./pushService-DExWNx3J.js";import{C as te,E as ne,T as re,g as ie,w as ae}from"./planificacion-BdwKIwFz.js";var oe=!1,g=[],se=10;function ce(e={}){let{dsn:t,environment:n=`development`,tracesSampleRate:r=.1}=e;if(t&&typeof window<`u`&&window.Sentry){let e=[];window.Sentry.Replay&&e.push(new window.Sentry.Replay({maskAllText:!0,blockAllMedia:!0})),window.Sentry.init({dsn:t,environment:n,tracesSampleRate:r,integrations:e,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1}),oe=!0,console.log(`[ErrorReporter] Initialized:`,n)}}function le(e,t={}){let n=new Date().toISOString(),r=e instanceof Error?e.message:String(e),i=e instanceof Error?e.stack:null;if(g.push({message:r,stack:i,context:t.context||`unknown`,level:t.level||`error`,timestamp:n}),g.length>se&&g.shift(),!oe&&!window.Sentry)return;let{userId:a,context:o,level:s=`error`,...c}=t;a&&window.Sentry?.setUser({id:a}),o&&window.Sentry?.setTag(`context`,o),Object.keys(c).length>0&&window.Sentry?.setContext(`details`,c),e instanceof Error?(window.Sentry?.captureException(e,{level:s}),console.error(`[Error] ${e.message}`,e)):(window.Sentry?.captureMessage(String(e),s),console.warn(`[${s}] ${e}`))}function ue(){return[...g]}var de=!1;function fe(e={}){let{enabled:t=!1,consent:n=!1}=e;de=t&&n,console.log(`[Analytics] Initialized, enabled:`,de)}var _={windowMs:6e4,max:100};function pe(e={}){_={..._,...e},console.log(`[RateLimit] Initialized: ${_.max} requests per ${_.windowMs}ms`)}var me=null,he=new Set;function ge(e=32){let t=``,n=new Uint32Array(e);if(typeof crypto<`u`&&crypto.getRandomValues)crypto.getRandomValues(n);else for(let t=0;t<e;t++)n[t]=Math.floor(Math.random()*62);for(let r=0;r<e;r++)t+=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`[n[r]%62];return t}function _e(e={}){me=ge(e.length||32),he.clear(),he.add(me),console.log(`[CSRF] Initialized`)}var v={LCP:null,FID:null,CLS:null,FCP:null,TTFB:null};function ve(){return typeof window>`u`?!1:typeof PerformanceObserver<`u`}function ye(e={}){let{debug:t=!1,onReport:n=null}=e;if(!ve()){console.warn(`[WebVitals] Not supported in this environment`);return}console.log(`[WebVitals] Initialized`),be(t,n),xe(t,n),Se(t,n),Ce(t,n),we(t,n)}function be(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries(),i=r[r.length-1];v.LCP=i.value,e&&console.log(`[LCP]`,i.value),t&&t(`LCP`,i.value)}).observe({entryTypes:[`largest-contentful-paint`]})}catch{e&&console.log(`[LCP] Not available`)}}function xe(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];v.FID=r.value,e&&console.log(`[FID]`,r.value),t&&t(`FID`,r.value)}).observe({entryTypes:[`first-input`]})}catch{e&&console.log(`[FID] Not available`)}}function Se(e,t){try{let n=0;new PerformanceObserver(r=>{for(let e of r.getEntries())e.hadRecentInput||(n+=e.value);v.CLS=n,e&&console.log(`[CLS]`,n),t&&t(`CLS`,n)}).observe({entryTypes:[`layout-shift`]})}catch{e&&console.log(`[CLS] Not available`)}}function Ce(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];v.FCP=r.value,e&&console.log(`[FCP]`,r.value),t&&t(`FCP`,r.value)}).observe({entryTypes:[`paint`]})}catch{e&&console.log(`[FCP] Not available`)}}function we(e,t){try{new PerformanceObserver(n=>{let r=n.getEntries()[0];v.TTFB=r.responseStart,e&&console.log(`[TTFB]`,r.responseStart),t&&t(`TTFB`,r.responseStart)}).observe({entryTypes:[`navigation`]})}catch{e&&console.log(`[TTFB] Not available`)}}var y={maestro:null,loading:!0,pendingApproval:!1,listeners:[]},Te=null,b=!1;function x(){y.listeners.forEach(e=>e({...y}))}var S={subscribe(e){return y.listeners.push(e),()=>{y.listeners=y.listeners.filter(t=>t!==e)}},async init(){b=!0;try{if(console.log(`[usePortalAuth.init] Iniciando...`),y.maestro=l(),console.log(`[usePortalAuth.init] Maestro local:`,y.maestro?`found`:`not found`),y.loading=!0,x(),typeof process<`u`&&{}.VITEST)return y.loading=!1,x(),console.log(`[usePortalAuth.init] Completado (Test Env)`),y.maestro;if(!Te){let{data:{subscription:e}}=c.auth.onAuthStateChange(async(e,t)=>{if(console.log(`[usePortalAuth] Evento de auth disparado: ${e}`),b&&(e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)){console.log(`[usePortalAuth] Ignorando SIGNED_IN durante inicialización (lo maneja init())`);return}if(e===`SIGNED_OUT`||e===`USER_DELETED`){localStorage.removeItem(`portal-maestros:maestro`),y.maestro=null,x();let e=[`login`,`register`,`pending-approval`],t=(window.router?.currentRoute?.()||`login`).split(`?`)[0];e.includes(t)||(console.log(`[usePortalAuth] Sesión inactiva o expirada en ruta privada. Recargando aplicación...`),window.location.reload())}else if((e===`SIGNED_IN`||e===`TOKEN_REFRESHED`)&&t?.user){let e=l();if(!e||e.user_id!==t.user.id){console.log(`[usePortalAuth] Nueva sesión detectada. Sincronizando datos de maestro...`);try{let e=await d();e&&(y.maestro=e,x())}catch(e){console.warn(`[usePortalAuth] Error sincronizando maestro post-login:`,e.message)}}}});Te=e}try{console.log(`[usePortalAuth.init] Iniciando detectarRolMaestro() con timeout de 8s...`);let e=new Promise((e,t)=>setTimeout(()=>t(Error(`Auth timeout after 8s`)),8e3)),t=await Promise.race([d(),e]);console.log(`[usePortalAuth.init] detectarRolMaestro completado:`,t?t.__pendingApproval?`pendiente de aprobación`:`con datos`:`sin datos`),t===f||t?.__pendingApproval?(y.maestro=null,y.pendingApproval=!0):(y.maestro=t,y.pendingApproval=!1)}catch(e){console.warn(`[usePortalAuth.init] Error:`,e.message),y.maestro=null,y.pendingApproval=!1}return y.loading=!1,x(),console.log(`[usePortalAuth.init] Completado`),y.maestro}finally{b=!1}},setMaestro(e){y.maestro=e,y.loading=!1,x()},async logout(){await u(),y.maestro=null,x()},getMaestro:()=>y.maestro,isAuthenticated:()=>!!y.maestro,isLoading:()=>y.loading,isPendingApproval:()=>y.pendingApproval},Ee=S.logout,C=`hoy`;function De(){let e=new Map,t=null,n=null,r=null,i=[`login`],a=!1;function o(){let e=window.location.pathname,t=window.location.hash;return t&&t!==`#`?t.replace(`#/`,``).replace(`#`,``):e&&e!==`/`?e.replace(/^\//,``):C}function s(e,t=[`login`]){r=e,i=t,a=!0}let c=null;function l(e,t={}){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.pushState({route:`login`},``,`/login`),h(`login`);return}if(a&&r&&i.includes(e)&&r()){history.replaceState({route:C},``,`/`),h(C);return}t&&Object.keys(t).length>0&&(c=t,n=null);let o=e===`hoy`?`/`:`/${e}`;history.pushState({route:e},``,o),h(e)}function u(e){if(a&&r&&!i.includes(e)&&!r()){localStorage.setItem(`intended-route`,e),history.replaceState({route:`login`},``,`/login`),h(`login`);return}let t=e===`hoy`?`/`:`/${e}`;history.replaceState({route:e},``,t),h(e)}function d(t,n){e.set(t,n)}function f(e){t=e}let p=null;function m(e){let t=e.querySelector(`h1, h2, [role="main"]`);t&&(t.hasAttribute(`tabindex`)||t.setAttribute(`tabindex`,`-1`),t.focus({preventScroll:!0}))}function h(r){if(n===r&&n!==null)return;n=r;let i=r.split(`?`)[0],a=e.get(i),o={};if(!a){for(let[t,n]of e.entries())if(t.includes(`:`)){let e=`^`+t.replace(/:[^\s/]+/g,`([^\\/]+)`)+`$`,r=new RegExp(e),s=i.match(r);if(s){a=n,t.match(/:[^\s/]+/g).forEach((e,t)=>{o[e.substring(1)]=s[t+1]});break}}}c&&=(o={...o,...c},null);let s=a||t;if(!s)return;let l=async()=>{typeof s==`function`&&await s(r,o)};if(!document.startViewTransition||p){p&&=(p.skipTransition(),null);let e=document.querySelector(`.pm-view-content.active`);e&&(e.classList.remove(`pm-animate-fade-in`,`pm-view-enter`,`pm-view-enter-active`),e.offsetWidth),l();let t=document.querySelector(`.pm-view-content.active`);t&&(t.classList.add(`pm-animate-fade-in`),t.classList.add(`pm-view-enter`),requestAnimationFrame(()=>{t.classList.add(`pm-view-enter-active`),m(t);let e=()=>{t.classList.remove(`pm-view-enter`,`pm-view-enter-active`)};t.addEventListener(`transitionend`,e,{once:!0}),setTimeout(e,250)}));return}try{let e=document.startViewTransition(async()=>{await l()});p=e;let t=e=>e.catch(()=>{});t(e.ready),t(e.updateCallbackDone),t(e.finished),e.finished.finally(()=>{p=null;let e=document.querySelector(`.pm-view-content.active`);e&&requestAnimationFrame(()=>m(e))})}catch{p=null,l()}}function ee(){window.addEventListener(`popstate`,e=>{e.state?.route?h(e.state.route):h(o())}),window.addEventListener(`hashchange`,()=>{let e=window.location.hash;if(e&&e.startsWith(`#/`)){let t=e.replace(`#/`,``);history.replaceState(null,``,window.location.pathname+window.location.search),l(t)}}),l(o())}return{currentRoute:o,setAuthGuard:s,navigate:l,replace:u,on:d,onNotFound:f,start:ee,_dispatch:h}}var Oe=t({dequeue:()=>Pe,enqueue:()=>Me,getQueue:()=>E,getQueueCount:()=>Ne,processQueue:()=>Fe}),ke=`portal-maestros`,Ae=1,w=`sync_queue`,je=null;async function T(){return je||(je=await m(ke,Ae,{upgrade(e){e.objectStoreNames.contains(w)||e.createObjectStore(w,{keyPath:`id`,autoIncrement:!0}).createIndex(`by_created_at`,`created_at`)}}),je)}async function Me({tabla:e,operacion:t,payload:n}){await(await T()).add(w,{tabla:e,operacion:t,payload:n,intentos:0,created_at:new Date().toISOString()})}async function E(){return(await T()).getAll(w)}async function Ne(){return(await T()).count(w)}async function Pe(e){await(await T()).delete(w,e)}async function Fe(e){let t=await E();for(let n of t)try{await e(n),await Pe(n.id)}catch{let e=await T();n.intentos>=5?await Pe(n.id):await e.put(w,{...n,intentos:n.intentos+1})}}var Ie=t({getPermisos:()=>D,obtenerSolicitudActual:()=>Le,solicitarPermiso:()=>Re});async function D(e){let t={puede_registrar_alumnos:!1,puede_inscribir_clases:!1,puede_planificar:!1,puede_asistir:!1,solicitudes:[],solicitud_actual:null};if(!e)return t;try{let n=null;try{n=await ne(e)}catch(e){console.debug(`[PermisoService] No solicitud found or table not ready:`,e.message)}let r=await re(e);if(!r){let e=n?.estado===`aprobado`?n:null;return{...t,puede_registrar_alumnos:e?.solicita_alumnos??!1,puede_inscribir_clases:e?.solicita_clases??!1,solicitud_actual:n}}let i=r.permisos||[],a=r.solicitudes||[],o=n?.estado===`aprobado`?n:null;return{puede_registrar_alumnos:i.includes(`alumnos:create`)||i.includes(`registrar_alumnos`)||(r.puede_registrar_alumnos??!1)||(o?.solicita_alumnos??!1),puede_inscribir_clases:i.includes(`clases:enroll`)||i.includes(`inscribir_clases`)||i.includes(`clases:create`)||(r.puede_inscribir_clases??!1)||(o?.solicita_clases??!1),puede_planificar:i.includes(`planificacion:write`)||!1,puede_asistir:i.includes(`asistencias:write`)||!1,solicitudes:a,solicitud_actual:n}}catch(e){return console.warn(`[PermisoService] Error obteniendo permisos, fail-closed:`,e.message),t}}async function Le(e){if(!e)return null;try{return await ne(e)}catch(e){return console.warn(`[PermisoService] Error obteniendo solicitud actual:`,e.message),null}}async function Re(e,t){if(!e||!t)throw Error(`ID de maestro y clave de permiso son requeridos`);let n=t===`alumnos:create`,r=t===`clases:enroll`;if(!n&&!r)throw Error(`Clave de permiso no reconocida: `+t);try{return await ae(e,n,r)}catch(t){if(t.message?.includes(`solicitud pendiente`))return await Le(e)||{};throw t}}var ze=null;function Be(e,t){ze=e}function Ve(e){ze&&ze(e)}var He=new class{constructor(){this.storageKey=`portal-maestros-theme`,this.fontScaleKey=`portal-maestros-font-scale`,this.init()}init(){let e=localStorage.getItem(this.storageKey),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`;this.currentTheme=e||t,this.applyTheme(this.currentTheme),this.applyFontScale(this.getSavedFontScale()),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(this.storageKey)||(this.currentTheme=e.matches?`dark`:`light`,this.applyTheme(this.currentTheme))})}applyTheme(e){document.documentElement.setAttribute(`data-bs-theme`,e),document.documentElement.setAttribute(`data-portal-theme`,e),this.updateCustomProperties(e)}updateCustomProperties(e){let t=document.documentElement;e===`dark`?(t.style.setProperty(`--pm-glass-bg`,`rgba(30, 41, 59, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(255, 255, 255, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(15, 23, 42, 0.95)`)):(t.style.setProperty(`--pm-glass-bg`,`rgba(255, 255, 255, 0.8)`),t.style.setProperty(`--pm-glass-border`,`rgba(0, 0, 0, 0.1)`),t.style.setProperty(`--pm-header-glass`,`rgba(242, 242, 247, 0.95)`))}getSavedFontScale(){let e=localStorage.getItem(this.fontScaleKey);return new Set([`0.92`,`1`,`1.08`,`1.16`]).has(e)?e:`1`}applyFontScale(e){let t=this.normalizeFontScale(e);document.documentElement.style.setProperty(`--pm-font-scale`,t),localStorage.setItem(this.fontScaleKey,String(t)),window.dispatchEvent(new CustomEvent(`fontScaleChanged`,{detail:{scale:t}}))}normalizeFontScale(e){let t=new Set([`0.92`,`1`,`1.08`,`1.16`]),n=String(e);return t.has(n)?n:`1`}toggle(){this.currentTheme=this.currentTheme===`dark`?`light`:`dark`,this.applyTheme(this.currentTheme),localStorage.setItem(this.storageKey,this.currentTheme),window.dispatchEvent(new CustomEvent(`themeChanged`,{detail:{theme:this.currentTheme}}))}getCurrentTheme(){return this.currentTheme}getCurrentFontScale(){return this.getSavedFontScale()}createToggleButton(){let e=document.createElement(`button`);return e.className=`pm-theme-toggle`,e.setAttribute(`aria-label`,`Cambiar tema`),e.innerHTML=`
      <div class="pm-theme-toggle-track">
        <div class="pm-theme-toggle-thumb">
          <i class="bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon"></i>
        </div>
      </div>
    `,e.addEventListener(`click`,()=>{this.toggle(),this.updateButtonIcon(e)}),window.addEventListener(`themeChanged`,()=>{this.updateButtonIcon(e)}),e}updateButtonIcon(e){let t=e.querySelector(`.pm-theme-icon`);t&&(t.className=`bi ${this.currentTheme===`dark`?`bi-moon-fill`:`bi-sun-fill`} pm-theme-icon`)}};function Ue(e=new Date){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function We(e){if(!e||typeof e!=`string`)return{claseId:null,fecha:null,isValid:!1};let t=e.match(/^\/asistencia\/([a-f0-9-]{36})\/(\d{4}-\d{2}-\d{2})$/);return t?{claseId:t[1],fecha:t[2],isValid:!0}:{claseId:null,fecha:null,isValid:!1}}function Ge(e){let{claseId:t,fecha:n,isValid:r}=We(e);if(!r){console.warn(`[notificationService] Invalid deep link:`,e);return}window.appNavigate?.({view:`asistencia`,claseId:t,fecha:n})}h(e=>{if(e.event===`subscriptionChanged`)console.log(`[Notif] Push subscription changed:`,e.subscribed);else if(e.event===`notificationReceived`){console.log(`[Notif] Real-time push received:`,e.notification),Qe(e.notification);let t=e.notification;t?.data?.deep_link?Ge(t.data.deep_link):t?.data?.deep_link_url&&Ge(t.data.deep_link_url),A.some(t=>t.id===e.notification.id)||(A.unshift({...e.notification,created_at:e.notification.created_at||new Date().toISOString()}),M())}});var Ke=new te(`maestro-notifications`),qe=30*1e3,Je=60*1e3,Ye=120*1e3,O=new Map;function Xe(e){return`${e.tipo||`unknown`}:${e.clase_id||e.alumno_id||e.id||`generic`}:${Math.floor(Date.now()/Je)}`}function Ze(){let e=Date.now();for(let[t,n]of O.entries())e>n&&O.delete(t)}function Qe(e){let t=Xe(e),n=Date.now()+Ye;O.set(t,n)}function $e(){return Ze(),O.size}function et(e){return`notif_cache_${e}`}function k(e){try{let t=A.filter(e=>!String(e.id).startsWith(`local_`)).slice(0,30);localStorage.setItem(et(e),JSON.stringify(t))}catch{}}function tt(e){try{let t=localStorage.getItem(et(e));return t?JSON.parse(t):[]}catch{return[]}}var A=[],j=[];function nt(e){return j.push(e),e(A),()=>{j=j.filter(t=>t!==e)}}function M(){j.forEach(e=>e([...A]))}async function N(){let e=l();if(!e)return[];A.length===0&&(A=tt(e.id),A.length>0&&M());try{let{data:t,error:n}=await c.from(`notificaciones`).select(`*`).eq(`profile_id`,e.id).order(`created_at`,{ascending:!1}).limit(30);if(n)return console.warn(`[NotifService] Error fetch:`,n),A;let r=(t||[]).map(e=>({...e,created_at:e.created_at||new Date().toISOString()})),i=A.filter(e=>String(e.id).startsWith(`local_`));return A=[...r,...i],await rt(e.id),k(e.id),M(),A}catch(e){return console.error(`[NotifService]`,e),A}}async function rt(e){try{let t=new Date,n=Ue(t),a=t.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[s,c]=await Promise.all([r(),i(e,n,n)]),l=s.map(e=>e.id),u=Object.fromEntries(s.map(e=>[e.id,e])),d=(await o(l)).filter(e=>e.dia?.toLowerCase()===a);c.filter(e=>e.estado===`pendiente`||e.estado===`borrador`||e.borrador===!0);let f=new Set(c.filter(e=>e.borrador===!1||e.estado===`registrada`||e.estado===`cerrada`).map(e=>e.clase_id));A=A.filter(e=>!String(e.id).startsWith(`local_`)||!f.has(e.clase_id));let p=new Date;for(let e of d){if(!e.hora_fin||f.has(e.clase_id))continue;let[t,r]=e.hora_fin.split(`:`),i=new Date;i.setHours(parseInt(t,10),parseInt(r,10),0,0);let a=(p-i)/6e4;if(a<30)continue;let o=u[e.clase_id],s=`${e.clase_id}_${n}`;if(A.some(e=>e.referencia_id===s&&e.tipo===`sesion_sin_registrar`))continue;let c=e.hora_fin?e.hora_fin.slice(0,5):``,l=e.hora_inicio?e.hora_inicio.slice(0,5):``,d=l&&c?` (${l}–${c})`:``,m=Math.round(a),h=m>=60?`hace ${Math.floor(m/60)}h ${m%60}min`:`hace ${m} min`;A.unshift({id:`local_`+s,tipo:`sesion_sin_registrar`,titulo:`Clase sin registrar`,mensaje:`${o?.nombre||`Tu clase`}${d} terminó ${h}. Registrá la asistencia para que quede guardada.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:s,clase_id:e.clase_id,fecha:n})}for(let e of d){if(!e.hora_inicio)continue;let[t,r]=e.hora_inicio.split(`:`),i=new Date;i.setHours(parseInt(t,10),parseInt(r,10),0,0);let a=(i-p)/6e4;if(a<0||a>15)continue;let o=u[e.clase_id],s=`prox_${e.clase_id}_${n}`;if(A.some(e=>e.referencia_id===s))continue;let c=e.hora_inicio?e.hora_inicio.slice(0,5):``,l=Math.round(a);A.unshift({id:`local_`+s,tipo:`recordatorio_clase`,titulo:`Clase por empezar`,mensaje:`${o?.nombre||`Tu clase`}${c?` a las ${c}`:``} empieza en ${l} ${l===1?`minuto`:`minutos`}. Prepará la planificación.`,estado:`pendiente`,created_at:new Date().toISOString(),referencia_id:s,clase_id:e.clase_id,fecha:n})}}catch(e){console.warn(`[NotifService] Error local alerts:`,e)}}async function P(e){let t=l(),n=A.find(t=>t.id===e);if(n&&(n.estado=`leida`),M(),t&&k(t.id),!String(e).startsWith(`local_`))try{await c.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`id`,e)}catch(e){console.warn(`[NotifService] Error al marcar leída`,e)}}async function it(e){let t=l();if(A=A.filter(t=>t.id!==e),M(),t&&k(t.id),String(e).startsWith(`local_`))return{success:!0};try{let{error:t}=await c.from(`notificaciones`).delete().eq(`id`,e);return t?(console.error(`[NotifService] Error al eliminar en base de datos:`,t.message),{success:!1,error:t}):{success:!0}}catch(e){return console.error(`[NotifService] Excepción al eliminar:`,e),{success:!1,error:e}}}async function at(){let e=l();if(A.forEach(e=>{e.estado!==`leida`&&(e.estado=`leida`)}),M(),e&&k(e.id),e)try{await c.from(`notificaciones`).update({estado:`leida`,leida_en:new Date().toISOString()}).eq(`profile_id`,e.id).neq(`estado`,`leida`)}catch(e){console.warn(`[NotifService] Error al marcar todas`,e)}}function ot(){return A.filter(e=>e.estado===`pendiente`||e.estado===`enviada`).length}var F=null;function st(){let e=l();e&&(F||(F=c.channel(`notificaciones:${e.id}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${e.id}`},t=>{let n={...t.new,created_at:t.new.created_at||new Date().toISOString()};A.some(e=>e.id===n.id)||(A.unshift(n),k(e.id),M(),ct(n),console.log(`[Realtime] Nueva notificación recibida:`,n.titulo))}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`notificaciones`,filter:`profile_id=eq.${e.id}`},t=>{let n=A.findIndex(e=>e.id===t.new.id);n!==-1&&(A[n]={...A[n],...t.new},k(e.id),M())}).subscribe(e=>{console.log(`[Realtime] Canal notificaciones: ${e}`),(e===`CHANNEL_ERROR`||e===`SUBSCRIPTION_ERROR`)&&(console.warn(`[Realtime] Canal cerrado, activando polling como fallback`),F=null,ft())}),Ke.registerChannel(F)))}function ct(e){if(document.getElementById(`pm-notificaciones-drawer-overlay`)?.classList.contains(`open`))return;let t=document.getElementById(`pm-notif-inapp-toast`);t&&t.remove();let n=lt(e.tipo),r=document.createElement(`div`);r.id=`pm-notif-inapp-toast`,r.setAttribute(`role`,`alert`),r.setAttribute(`aria-live`,`polite`),r.innerHTML=`
    <div class="pm-iat-content">
      <div class="pm-iat-icon">${n}</div>
      <div class="pm-iat-text">
        <strong class="pm-iat-title">${e.titulo||`Nueva notificación`}</strong>
        <span class="pm-iat-msg">${e.mensaje||``}</span>
      </div>
      <button class="pm-iat-close" aria-label="Cerrar">×</button>
    </div>
  `,document.body.appendChild(r),dt(),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add(`pm-iat-visible`))});let i=()=>{r.classList.remove(`pm-iat-visible`),setTimeout(()=>r.remove(),350)};r.querySelector(`.pm-iat-close`).addEventListener(`click`,i),r.addEventListener(`click`,e=>{e.target.classList.contains(`pm-iat-close`)||(document.getElementById(`pm-bell-btn`)?.click(),i())}),setTimeout(i,6e3)}function lt(e){return{sesion_sin_registrar:`⚠️`,recordatorio_clase:`⏰`,mensaje_admin:`📣`,tarea_vencida:`📕`,in_app:`🔔`}[e]||`🔔`}var ut=!1;function dt(){if(ut)return;ut=!0;let e=document.createElement(`style`);e.textContent=`
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
  `,document.head.appendChild(e)}var I=null;function ft(){I===null&&(I=setInterval(()=>{document.visibilityState!==`hidden`&&N()},qe),Ke.registerInterval(I))}function pt(){I!==null&&(clearInterval(I),I=null)}document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`?(N(),ft()):pt()});function mt(){let e=Ue();A=A.filter(t=>!String(t.id).startsWith(`local_`)||t.referencia_id?.includes(e))}mt(),document.visibilityState!==`hidden`&&ft();function ht(e,{onClose:t}={}){if(!e)return{dispose:()=>{}};let n=document.activeElement;function r(){return Array.from(e.querySelectorAll(`button:not([disabled]):not([hidden]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])`))}function i(){let e=r();e.length>0&&e[0].focus()}function a(e){if(e.key===`Escape`){e.preventDefault(),typeof t==`function`&&t();return}if(e.key!==`Tab`)return;let n=r();if(n.length===0){e.preventDefault();return}e.preventDefault();let i=n.indexOf(document.activeElement);e.shiftKey?n[i<=0?n.length-1:i-1].focus():n[i===-1||i===n.length-1?0:i+1].focus()}i(),e.addEventListener(`keydown`,a);function o(){e.removeEventListener(`keydown`,a),n&&typeof n.focus==`function`&&n.focus()}return{dispose:o}}`serviceWorker`in navigator&&navigator.serviceWorker.addEventListener(`message`,e=>{if(e.data?.type===`NAVIGATE_TO`){let t=e.data.url||e.data.hash;t&&(window.location.hash=t.startsWith(`#`)?t.slice(1):t)}});var gt=null,L=null;function _t(e){let t=new Date(e),n=new Date-t,r=Math.floor(n/1e3),i=Math.floor(r/60),a=Math.floor(i/60),o=Math.floor(a/24),s=new Intl.RelativeTimeFormat(`es`,{numeric:`auto`});return o>0?s.format(-o,`day`):a>0?s.format(-a,`hour`):i>0?s.format(-i,`minute`):`hace un momento`}var vt={init(){document.getElementById(`pm-notificaciones-drawer-overlay`)||(gt=document.createElement(`div`),gt.innerHTML=`
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
    `,document.body.appendChild(gt),document.getElementById(`pm-notificaciones-close`).addEventListener(`click`,this.close),document.getElementById(`pm-notificaciones-drawer-overlay`).addEventListener(`click`,e=>{e.target.id===`pm-notificaciones-drawer-overlay`&&this.close()}),document.getElementById(`pm-notif-mark-all`).addEventListener(`click`,()=>{at()}),L=nt(e=>{this.renderList(e)}),N())},_updateDedupBadge(){let e=document.getElementById(`pm-notif-dedup-badge`);if(!e)return;let t=$e();t>0?(e.textContent=`🔄 ${t} dedup`,e.style.display=`inline-flex`):e.style.display=`none`},renderList(e){let t=document.getElementById(`pm-notificaciones-list`);if(t){if(this._updateDedupBadge(),e.length===0){t.innerHTML=`
        <div class="text-center text-muted mt-5">
          <i class="bi bi-bell-slash" style="font-size: 2rem; opacity: 0.5;"></i>
          <p class="mt-2">No tienes notificaciones recientes.</p>
        </div>
      `;return}t.innerHTML=xt(e).map(e=>{let t=e.count>1,n=e.items.some(e=>e.estado!==`leida`),r=St(e.tipo,e.items[0]),i=e.tipo===`sesion_sin_registrar`;return`
        <div
          class="pm-notif-item ${n?``:`leida`} ${i?`pm-notif-item--urgent`:``}"
          data-ids="${e.items.map(e=>e.id).join(`,`)}"
          data-route="${r}"
          title="${t?`Ver todo`:e.items[0].titulo}"
        >
          <div class="pm-notif-icon ${bt(e.tipo)}">
            <i class="bi ${yt(e.tipo)}"></i>
          </div>
          <div class="pm-notif-content">
            <div class="pm-notif-title">
              ${t?`${e.items[0].titulo} <span class="pm-notif-count">${e.count}</span>`:e.items[0].titulo}
            </div>
            <div class="pm-notif-msg">
              ${t?`${e.count} clases sin registrar`:e.items[0].mensaje}
            </div>
            <div class="pm-notif-footer-row">
              <span class="pm-notif-time">${_t(e.items[0].created_at)}</span>
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
      `}).join(``),t.querySelectorAll(`.pm-notif-cta`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation(),e.closest(`.pm-notif-item`).dataset.ids.split(`,`).forEach(e=>P(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``),vt.close())})}),t.querySelectorAll(`.pm-notif-item`).forEach(e=>{e.addEventListener(`click`,t=>{if(t.target.closest(`.pm-notif-actions`)||t.target.closest(`.pm-notif-cta`))return;e.dataset.ids.split(`,`).forEach(e=>P(e));let n=e.dataset.route;n&&n!==`#/`&&(window.location.hash=n.replace(/^#/,``))})}),t.querySelectorAll(`.pm-notif-btn-mark`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),e.dataset.ids.split(`,`).forEach(e=>P(e))})}),t.querySelectorAll(`.pm-notif-btn-delete`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.dataset.ids.split(`,`);if(!confirm(`¿Estás seguro de que querés eliminar esta notificación?`))return;let r=!0;for(let e of n)(await it(e)).success||(r=!1);r?window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Notificación eliminada correctamente.`,type:`info`}})):window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Hubo un problema al eliminar la notificación.`,type:`danger`}})),N()})})}},open(){this.init(),this._triggerEl=document.activeElement;let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e.style.display=`block`,e.offsetHeight,e.classList.add(`open`);let t=document.querySelector(`#pm-notificaciones-drawer-overlay .pm-drawer`);t&&(this._trap&&this._trap.dispose(),this._trap=ht(t,{onClose:()=>this.close()}));let n=document.getElementById(`pm-notificaciones-close`);n&&n.focus(),this._updateDedupBadge(),N()},close(){this._trap&&=(this._trap.dispose(),null),L&&typeof L==`function`&&(L(),L=null);let e=document.getElementById(`pm-notificaciones-drawer-overlay`);e&&(e.classList.remove(`open`),setTimeout(()=>{e.style.display=`none`},300)),this._triggerEl&&typeof this._triggerEl.focus==`function`&&this._triggerEl.focus(),this._triggerEl=null}};function yt(e){switch(e){case`sesion_sin_registrar`:return`bi-exclamation-triangle`;case`recordatorio_clase`:return`bi-clock-history`;case`mensaje_admin`:return`bi-megaphone`;case`tarea_vencida`:return`bi-journal-x`;default:return`bi-bell`}}function bt(e){switch(e){case`sesion_sin_registrar`:return`bg-danger text-white`;case`recordatorio_clase`:return`bg-warning text-dark`;case`mensaje_admin`:return`bg-primary text-white`;default:return`bg-secondary text-white`}}function xt(e){let t=new Set([`recordatorio_clase`,`in_app`]),n=[],r=new Map;for(let i of e)if(t.has(i.tipo)&&r.has(i.tipo)){let e=n[r.get(i.tipo)];e.items.push(i),e.count++}else r.set(i.tipo,n.length),n.push({tipo:i.tipo,items:[i],count:1});return n}function St(e,t){let n=t.clase_id||t.data?.clase_id,r=t.alumno_id||t.data?.alumno_id,i=new Date,a=`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,`0`)}-${String(i.getDate()).padStart(2,`0`)}`,o=t.fecha||a;switch(e){case`sesion_sin_registrar`:case`recordatorio_clase`:return n?`#/asistencia?clase=${n}&fecha=${o}`:`#/hoy`;case`mensaje_admin`:return`#/perfil`;case`tarea_vencida`:return r?`#/alumno?id=${r}`:`#/hoy`;default:return`#/hoy`}}if(!document.getElementById(`pm-notif-styles`)){let e=document.createElement(`style`);e.id=`pm-notif-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}var Ct=R();function R(){let e=window.innerWidth;return e<768?`mobile`:e<1024?`tablet`:`desktop`}window.addEventListener(`resize`,()=>{let e=R();e!==Ct&&(Ct=e,document.body.dataset.pmLayout=e)},{passive:!0});function wt(){let e=document.getElementById(`portal-app`);if(!e)return;let t=e.querySelector(`.pm-header`),n=e.querySelector(`.pm-footer-nav, .pm-bottom-nav`),r=e.querySelector(`.pm-view`);t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.display=`none`)}function Tt(e){document.querySelectorAll(`.pm-nav-tab`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)}),document.querySelectorAll(`.pm-sidebar-link`).forEach(t=>{t.classList.toggle(`active`,t.dataset.route===e)})}function Et(e,t,n,r,i){let a=t?.es_admin?`<a href="/admin" class="pm-admin-link" title="Ir al Panel Admin">
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
      <nav class="pm-footer-nav pm-bottom-nav" id="pm-footer-nav">
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
  `,i();let o=document.getElementById(`pm-theme-toggle-container`);o&&o.appendChild(He.createToggleButton()),document.getElementById(`pm-footer-nav`)?.querySelectorAll(`.pm-nav-tab`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),r(e.dataset.route)})}),document.getElementById(`pm-sidebar`)?.querySelectorAll(`.pm-sidebar-link[data-route]`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),r(e.dataset.route)})}),document.getElementById(`pm-btn-perfil`)?.addEventListener(`click`,e=>{e.preventDefault(),r(`perfil`)}),document.getElementById(`pm-bell-btn`)?.addEventListener(`click`,()=>vt.open()),Dt(r)}function Dt(e){let t=document.getElementById(`pm-header`),n=document.getElementById(`pm-header-search-input`),r=document.getElementById(`pm-search-toggle-btn`),i=document.getElementById(`pm-search-back-btn`),a=()=>{t?.classList.add(`search-active`),setTimeout(()=>n?.focus(),50)},o=()=>{t?.classList.remove(`search-active`),n&&(n.value=``),document.getElementById(`pm-header-search-dropdown`)?.remove()};r?.addEventListener(`click`,e=>{e.stopPropagation(),a()}),i?.addEventListener(`click`,e=>{e.stopPropagation(),o()});let l=null,u=null,d=()=>{l?.remove(),l=null},f=t=>{if(d(),!t.length)return;let r=document.createElement(`div`);r.id=`pm-header-search-dropdown`,r.setAttribute(`role`,`listbox`),r.innerHTML=t.map(e=>`
      <div class="pm-hsd-item" role="option" tabindex="0" data-id="${e.id}">
        <i class="bi bi-person-fill pm-hsd-icon"></i>
        <div class="pm-hsd-info">
          <span class="pm-hsd-name">${e.nombre_completo}</span>
          ${e.instrumento_principal?`<span class="pm-hsd-meta">${e.instrumento_principal}</span>`:``}
        </div>
        <i class="bi bi-chevron-right pm-hsd-arrow"></i>
      </div>`).join(``),document.body.appendChild(r);let i=n.getBoundingClientRect();r.style.cssText=`position:fixed;top:${i.bottom+4}px;left:${Math.max(8,i.left)}px;width:${Math.min(320,window.innerWidth-16)}px;z-index:9999;background:var(--pm-surface);border:1px solid var(--pm-border);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.18);overflow:hidden;`,l=r,r.querySelectorAll(`.pm-hsd-item`).forEach(t=>{let n=()=>{o(),d(),e(`alumno`,{id:t.dataset.id})};t.addEventListener(`click`,n),t.addEventListener(`keypress`,e=>{e.key===`Enter`&&n()})})};if(n?.addEventListener(`input`,async()=>{let e=n.value.trim();if(clearTimeout(u),e.length<1){d();return}let{getAlumnoIndexFromMetricas:t}=await s(async()=>{let{getAlumnoIndexFromMetricas:e}=await import(`./metricasView-Cax1vJxj.js`);return{getAlumnoIndexFromMetricas:e}},__vite__mapDeps([0,1,2,3,4,5,6,7])),r=t();if(r){let t=e.toLowerCase(),n=r.filter(e=>e.nombre_completo?.toLowerCase().includes(t)).slice(0,8).map(e=>({...e,instrumento_principal:e.clases?.join(`, `)||null}));f(n);return}u=setTimeout(async()=>{try{let{data:t}=await c.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).ilike(`nombre_completo`,`%${e}%`).limit(8);f(t||[])}catch{d()}},200)}),n?.addEventListener(`keydown`,e=>{e.key===`Escape`&&(o(),d())}),!document.getElementById(`pm-hsd-styles`)){let e=document.createElement(`style`);e.id=`pm-hsd-styles`,e.textContent=`.pm-hsd-item{display:flex;align-items:center;gap:0.625rem;padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid var(--pm-border);transition:background 0.1s}.pm-hsd-item:last-child{border-bottom:none}.pm-hsd-item:hover,.pm-hsd-item:focus{background:var(--pm-surface-2);outline:none}.pm-hsd-icon{font-size:1rem;color:var(--pm-primary);flex-shrink:0}.pm-hsd-info{flex:1;min-width:0}.pm-hsd-name{display:block;font-size:0.875rem;font-weight:500;color:var(--pm-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-hsd-meta{font-size:0.7rem;color:var(--pm-text-muted)}.pm-hsd-arrow{color:var(--pm-text-muted);font-size:0.75rem}`,document.head.appendChild(e)}document.addEventListener(`click`,e=>{!n?.contains(e.target)&&!l?.contains(e.target)&&d()})}var Ot={login:()=>s(()=>import(`./loginView-8mM0cW_f.js`),__vite__mapDeps([8,3,2,5,9])),register:()=>s(()=>import(`./registerView-VoMTp5G2.js`),__vite__mapDeps([10,2,5,9])),"pending-approval":()=>s(()=>import(`./pendingApprovalView-S9oaKwsg.js`),__vite__mapDeps([11,2])),hoy:()=>s(()=>import(`./hoyView-D0OEk7kb.js`),__vite__mapDeps([12,13,1,2,3,14,7,15,4,16,17,18,19,20,21,22,23,6])),fechas:()=>s(()=>import(`./calendarioView-CZyiXzMS.js`),__vite__mapDeps([24,13,1,2,3,25,26,27,18,28,29,30,31,22,32,33,20,34,35,36,37,4,23])),calendario:()=>s(()=>import(`./calendarioView-CZyiXzMS.js`),__vite__mapDeps([24,13,1,2,3,25,26,27,18,28,29,30,31,22,32,33,20,34,35,36,37,4,23])),clases:()=>s(()=>import(`./calendarioView-CZyiXzMS.js`),__vite__mapDeps([24,13,1,2,3,25,26,27,18,28,29,30,31,22,32,33,20,34,35,36,37,4,23])),metricas:()=>s(()=>import(`./metricasView-Cax1vJxj.js`),__vite__mapDeps([0,1,2,3,4,5,6,7])),asistencia:()=>s(()=>import(`./asistenciaView-DWHGnG33.js`),__vite__mapDeps([38,13,1,2,3,25,26,27,18,28,29,30,31,22,32,33,20,34,35,36,39,37,40,7,15,41,4,5,17,19,42,43,21])),"clase-emergente":()=>s(()=>import(`./claseEmergenteView-CzYUhK8p.js`),__vite__mapDeps([44,2])),perfil:()=>s(()=>import(`./perfilView-CpNVhHrk.js`),__vite__mapDeps([45,13,2,3,46,22,47,48,49,4,50])),planificacion:()=>s(()=>import(`./planificacionView-CPdhTq2H.js`),__vite__mapDeps([51,13,1,2,3,26,27,31,22,30,32,33,20,35,5,17,18,19])),"planificacion-disenador":()=>s(()=>import(`./planificacion-BdwKIwFz.js`).then(e=>e.v),__vite__mapDeps([25,13,2,26,27,18,28,29,30,31,22,32,33,20,34,35,36])),"planificacion-ruta":()=>s(()=>import(`./planificacion-BdwKIwFz.js`).then(e=>e._),__vite__mapDeps([25,13,2,26,27,18,28,29,30,31,22,32,33,20,34,35,36])),"planificacion-mapa-clase":()=>s(()=>import(`./MapaClaseView-2TUEAf3I.js`),__vite__mapDeps([52,13,39,25,2,26,27,18,28,29,30,31,22,32,33,20,34,35,36,37,14,41])),alumno:()=>s(()=>import(`./alumnoPerfilView-C5Covml4.js`),__vite__mapDeps([53,13,2,3,47,4])),gamificacion:()=>s(()=>import(`./gamificacionView-DzV73nr3.js`),__vite__mapDeps([54,2,3,4])),ruta:()=>s(()=>import(`./rutaGameificadaView-oHYDwM5J.js`),__vite__mapDeps([55,1,2,3,42,7,43,13,25,26,27,18,28,29,30,31,22,32,33,20,34,35,36,39,37])),"crear-clase":()=>s(()=>import(`./crearClaseView-DOzx27-V.js`),__vite__mapDeps([56,2,3,4])),"ruta-plan-builder":()=>s(()=>import(`./academicPlanBuilderView-Iu2ERXHt.js`),__vite__mapDeps([57,2,15,13,4])),"ruta-semanal":()=>s(()=>import(`./weeklyPlanView-C6OqyCbA.js`),__vite__mapDeps([58,2,15,13,4])),"ruta-libreria":()=>s(()=>import(`./routeLibraryView-CNR4y44v.js`),__vite__mapDeps([59,15,13,2])),"ruta-detalle":()=>s(()=>import(`./routeDetailView-BeL0HvF5.js`),__vite__mapDeps([60,15,13,2])),"gestionar-clases":()=>s(()=>import(`./gestionarClasesView-CSq5nRFk.js`),__vite__mapDeps([61,13,3,2,25,26,27,18,28,29,30,31,22,32,33,20,34,35,36])),"gestionar-horario":()=>s(()=>import(`./disponibilidadView-uvpBl1ix.js`),__vite__mapDeps([62,13,48,2,5])),"proponer-contenido":()=>s(()=>import(`./proponerContenidoView-CLOfAhHb.js`),__vite__mapDeps([63,13,2,25,26,27,18,28,29,30,31,22,32,33,20,34,35,36,7]))},kt=Object.keys(Ot).concat([`logout`]),At=new Set([`hoy`,`fechas`,`calendario`,`metricas`,`perfil`,`ruta`,`gamificacion`,`crear-clase`,`planificacion`,`planificacion-disenador`,`planificacion-ruta`,`ruta-libreria`,`gestionar-horario`]);function jt(e,t,n){`login.logout.fechas.calendario.clases.hoy.asistencia.metricas.perfil.clase-emergente.planificacion.planificacion-disenador.planificacion-ruta.planificacion-mapa-clase.alumno.gamificacion.ruta.crear-clase.ruta-plan-builder.ruta-semanal.ruta-libreria.gestionar-clases.register.pending-approval.gestionar-horario.proponer-contenido`.split(`.`).forEach(t=>e.on(t,(e,r)=>n(t,r))),e.on(`ruta-detalle/:id`,(e,t)=>n(`ruta-detalle`,t)),e.onNotFound(()=>n(`hoy`))}function z(){let e=document.getElementById(`pm-view-container`);if(!e)return{};e.innerHTML=``;let t={};return kt.forEach(n=>{let r=document.createElement(`div`);r.id=`pm-view-${n}`,r.className=`pm-view-content`,r.style.display=`none`,e.appendChild(r),t[n]=r}),t}async function Mt(e,t,n,r,i){let{maestroId:a,permisos:o,router:s,showLoginScreen:c,cleanupPushService:l,stopRealtime:u,logoutMaestro:d}=i;if(e===`logout`)return c(),l(),u(),d().then(()=>window.location.reload()),null;if(e===`gestionar-clases`&&!o?.puede_inscribir_clases){s.navigate(`hoy`);return}let f=Ot[e];if(!f)return null;let p=await f();switch(e){case`login`:p.renderLoginView(t,{onSuccess:i.onLoginSuccess});break;case`register`:p.renderRegisterView(t,{onSuccess:()=>s.navigate(`pending-approval`)});break;case`pending-approval`:p.renderPendingApprovalView(t,{onBackToLogin:()=>s.navigate(`login`)});break;case`fechas`:case`calendario`:case`clases`:return await p.renderCalendarioView(t);case`hoy`:return await p.renderHoyView(t,{onClaseClick:e=>s.navigate(`asistencia?clase=${e}`)});case`asistencia`:return await p.renderAsistenciaView(t,{claseId:r.get(`clase`),fecha:r.get(`fecha`),sesionId:r.get(`sesion`),router:s});case`metricas`:return p.renderMetricasView(t);case`perfil`:return p.renderPerfilView(t);case`clase-emergente`:return p.renderClaseEmergenteView(t,{maestroId:a});case`planificacion`:return await p.renderPlanificacionView(t,{maestroId:a});case`planificacion-disenador`:return await p.renderDisenadorCurricularView(t);case`planificacion-ruta`:return await p.renderRutaPedagogicaView(t);case`planificacion-mapa-clase`:return await p.renderMapaClaseView(t,{claseId:r.get(`clase`),maestroId:a});case`alumno`:return p.renderAlumnoPerfilView(t,{alumnoId:r.get(`id`)||n.id});case`gamificacion`:await p.renderGamificacionView(t);break;case`ruta`:await p.renderRutaGameificadaView(t,{onTopicSelected:e=>s.navigate(`asistencia?clase=${e}`)});break;case`crear-clase`:p.renderCrearClaseView(t);break;case`ruta-plan-builder`:p.renderAcademicPlanBuilderView(t,{alumnoId:r.get(`id`)});break;case`ruta-semanal`:p.renderWeeklyPlanView(t,{alumnoId:r.get(`id`)});break;case`ruta-libreria`:p.RouteLibraryView.render().then(e=>{t.innerHTML=``,t.appendChild(e)});break;case`ruta-detalle`:p.RouteDetailView.render(n).then(e=>{t.innerHTML=``,t.appendChild(e)});break;case`gestionar-clases`:return await p.renderGestionarClasesView(t);case`gestionar-horario`:return await p.renderDisponibilidadView(t,{maestroId:a});case`proponer-contenido`:return p.renderProponerContenidoView(t,{maestroId:a,claseId:r.get(`clase`)})}return null}var Nt=!1,B=null;function Pt({isAdmin:e,getMaestro:t,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i,onResize:a}){if(Nt)return;Nt=!0,nt(()=>{let e=document.getElementById(`pm-notif-badge`);if(!e)return;let t=ot();t>0?(e.textContent=t>9?`9+`:t,e.style.display=`flex`):e.style.display=`none`}),N(),st(),e||Ft({getMaestro:t,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i}),document.addEventListener(`keydown`,e=>{if(R()!==`desktop`||e.target.tagName===`INPUT`||e.target.tagName===`TEXTAREA`)return;window._globalAppKeys||(window._globalAppKeys=[]);let t=window._globalAppKeys;if(t.push(e.key.toLowerCase()),t[t.length-2]===`g`){let n={h:`hoy`,c:`fechas`,r:`ruta`,m:`metricas`,p:`perfil`}[e.key.toLowerCase()];n&&(i(n),t.length=0)}t.length>3&&t.splice(0,t.length-2)});let o=null,s=R();window.addEventListener(`resize`,()=>{clearTimeout(o),o=setTimeout(()=>{let e=R();e!==s&&(s=e,a())},250)},{passive:!0})}function Ft({getMaestro:t,getPermisosCached:n,onPermisosUpdate:r,onNavigate:i}){let a=t();a?.id&&(B&&=(c.removeChannel(B),null),B=c.channel(`permisos-maestro:${a.id}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`permisos_maestros`,filter:`maestro_id=eq.${a.id}`},async t=>{console.log(`[Realtime] Permisos actualizados:`,t.new);try{let t=await D(a.id),i=n(),o=[],s=[];t.puede_inscribir_clases&&!i?.puede_inscribir_clases&&o.push(`Gestionar e Inscribir Clases`),i?.puede_inscribir_clases&&!t.puede_inscribir_clases&&s.push(`Gestionar e Inscribir Clases`),await r(t,{ganados:o,perdidos:s}),o.length>0?e.success(`¡Nuevos permisos activados: ${o.join(`, `)}! Ahora podés acceder desde el Perfil o la barra de navegación.`):s.length>0?e.show(`El administrador removió tu acceso a: ${s.join(`, `)}.`,`warning`):e.show(`Tus permisos fueron actualizados por el administrador.`,`info`)}catch(e){console.warn(`[Realtime] Error actualizando permisos:`,e.message)}}).subscribe(e=>console.log(`[Realtime] Canal permisos_maestros:`,e)),window.addEventListener(`beforeunload`,()=>c.removeChannel(B),{once:!0}))}n();var V=null,It=null;function Lt(){if(It)return;if(It=!0,!document.getElementById(`app-toast-styles`)){let e=document.createElement(`style`);e.id=`app-toast-styles`,e.textContent=`
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
  `,e.appendChild(t),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add(`app-toast--visible`))),t.querySelector(`#pm-update-btn`)?.addEventListener(`click`,()=>{V?.waiting&&V.waiting.postMessage({type:`SKIP_WAITING`}),t.remove()});let n=!1;navigator.serviceWorker.addEventListener(`controllerchange`,()=>{n||(n=!0,window.location.reload())})}if(`serviceWorker`in navigator){let e=async()=>{try{V=await navigator.serviceWorker.register(`/sw.js`),console.log(`[PWA] Service Worker registered:`,V.scope),V.waiting&&Lt(),V.addEventListener(`updatefound`,()=>{let e=V.installing;e&&e.addEventListener(`statechange`,()=>{e.state===`installed`&&navigator.serviceWorker.controller&&Lt()})})}catch(e){console.log(`[PWA] Service Worker registration failed:`,e)}};document.readyState===`complete`?e():window.addEventListener(`load`,e)}else`serviceWorker`in navigator;_e(),pe({windowMs:6e4,max:100}),fe({enabled:!1,consent:!1}),ye({debug:!1}),ce({dsn:null,environment:`production`}),window.bootstrap=p,window.addEventListener(`showToast`,t=>{let{message:n,type:r=`info`}=t.detail||{};n&&e.show(n,r)});var H=null,U=null,Rt=!1,W=De();window.router=W;var G={},K=null,q=new Set;function zt(e){let t=[{id:`fechas`,label:`Fechas`,icon:`bi-calendar3`},{id:`hoy`,label:`Hoy`,icon:`bi-house-door`},{id:`planificacion`,label:`Plan`,icon:`bi-signpost-split`},{id:`metricas`,label:`Métricas`,icon:`bi-bar-chart-line`}];return e?.puede_inscribir_clases&&t.push({id:`gestionar-clases`,label:`Clases`,icon:`bi-mortarboard`}),t}async function Bt(e){let{tabla:t,operacion:n,payload:r}=e,i={...r};t===`sesiones_clase`&&(i.contenido_dsl!==void 0&&(i.contenido=i.contenido_dsl,delete i.contenido_dsl),i.asistencias!==void 0&&i.asistencia===void 0&&(i.asistencia=i.asistencias,delete i.asistencias)),console.log(`[SYNC] Intentando ${n} en ${t}:`,i);try{if(n===`insert`){let{error:e}=await c.from(t).insert([i]);if(e)throw e}else if(n===`update`){let{id:e,...n}=i,{error:r}=await c.from(t).update(n).eq(`id`,e);if(r)throw r}else if(n===`delete`){let{error:e}=await c.from(t).delete().eq(`id`,i.id);if(e)throw e}}catch(e){if(e.code===`PGRST204`){let{data:e}=await c.from(t).select().limit(1);e?.length>0?console.warn(`[SYNC] Columnas REALES encontradas:`,Object.keys(e[0])):console.warn(`[SYNC] No se pueden leer las columnas. ¿Ejecutaste el SQL en Supabase?`)}throw console.error(`[SYNC] Error crítico:`,e),e}}var Vt=null;async function Ht(){if(navigator.setAppBadge)try{let e=(await E()).length;e>0?await navigator.setAppBadge(e):await navigator.clearAppBadge()}catch{}}async function J(){let e=document.getElementById(`pm-sync-indicator`);if(e){try{let t=await E();t.length===0?(e.className=`pm-online-dot synced`,e.title=`Sincronizado`):(e.className=`pm-online-dot pending`,e.title=`Pendiente (${t.length})`)}catch{e.className=`pm-online-dot error`,e.title=`Error de sincronización`}await Ht()}}async function Ut(){clearTimeout(Vt),Vt=setTimeout(async()=>{if(navigator.onLine)try{await Fe(Bt)}finally{await J()}},1e3)}window.addEventListener(`online`,Ut),window.addEventListener(`offline`,J);function Wt(){q.clear()}function Gt(e){q.delete(e)}async function Y(e,t={},{silent:n=!1}={}){let r=window.location.search||(window.location.hash.includes(`?`)?window.location.hash.split(`?`)[1]:``),i=new URLSearchParams(r),a=e.split(`?`)[0];if(!n){let e=document.getElementById(`pm-header`);if(e?.classList.contains(`search-active`)){e.classList.remove(`search-active`);let t=document.getElementById(`pm-header-search-input`);t&&(t.value=``)}Tt(a),window.pwaInstaller?.evaluateInsights()}let o=G[a];if(!o){console.warn(`[Router] Contenedor no encontrado: ${a}`);return}if(n||(typeof K==`function`&&(K(),K=null),Object.values(G).forEach(e=>{e.style.display=`none`,e.classList.remove(`active`)}),o.style.display=`block`,o.offsetHeight,o.classList.add(`active`)),q.has(a))return;let s=setTimeout(()=>{o.querySelectorAll(`.pm-loading-overlay`).forEach(e=>e.remove());let e=document.createElement(`div`);e.className=`pm-loading pm-loading-overlay`,e.innerHTML=`<div class="pm-spinner"></div>`,o.prepend(e)},300);try{let e=await Mt(a,o,t,i,{maestroId:H?.id,permisos:U,router:W,showLoginScreen:qt,cleanupPushService:ee,stopRealtime:()=>{},logoutMaestro:Ee,onLoginSuccess:()=>$()});e&&(K=e),clearTimeout(s),o.querySelector(`.pm-loading-overlay`)?.remove(),At.has(a)&&q.add(a)}catch(e){clearTimeout(s),o.innerHTML=`<p class="pm-error">Error cargando vista: ${e.message}</p>`}}function Kt(e,t,n){H=t,U=n||U,Et(e,t,zt(U),(e,t)=>W.navigate(e,t),J),document.getElementById(`pm-sync-indicator`)?.addEventListener(`click`,async e=>{e.target.classList.contains(`error`)&&await Ut()});let r=(W.currentRoute?.()||`hoy`).split(`?`)[0];Tt(r)}function qt(){let e=document.getElementById(`portal-app`);if(!e)return;let t=[`login`,`register`,`pending-approval`],n=(W.currentRoute?.()||`login`).split(`?`)[0];if(t.includes(n)&&n!==`login`){document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(G,z()),X(),W.setAuthGuard(()=>S.isAuthenticated(),t),W.start();return}let r=G.login;if(r){wt(),r.style.display=`block`,r.innerHTML=``,Mt(`login`,r,{},new URLSearchParams,{router:W,onLoginSuccess:e=>{e&&e!==`login`?W.navigate(e):$()}});return}e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`,Object.assign(G,z()),X(),W.setAuthGuard(()=>S.isAuthenticated(),t),history.replaceState({route:`login`},``,`/login`),Y(`login`)}function X(){ie(),jt(W,Rt,Y)}var Jt={auth:{bar:25},profile:{bar:50,txt:`Cargando tu perfil...`},preparing:{bar:75,txt:`Preparando tu espacio de trabajo...`},ready:{bar:100,txt:`¡Listo!`}};function Z(){let e=document.getElementById(`pm-loading-splash`);e&&(e.style.transition=`opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)`,e.style.opacity=`0`,e.style.transform=`scale(0.97)`,e.style.pointerEvents=`none`,setTimeout(()=>e.remove(),400))}function Q(e,t){if(!document.getElementById(`pm-loading-splash`))return;if(e===`remove`){Z();return}let n=Jt[e];if(!n)return;let r=document.getElementById(`pm-loading-status`),i=document.getElementById(`pm-loading-greeting`),a=document.getElementById(`pm-loading-progress-bar`),o=document.getElementById(`pm-loading-spinner`);switch(e){case`auth`:i&&(i.textContent=`Hola, ${t?.nombre_completo||`Maestro`}!`),r&&(r.textContent=`Conectando...`);break;case`profile`:r&&n.txt&&(r.textContent=n.txt);break;case`preparing`:r&&n.txt&&(r.textContent=n.txt),o&&(o.style.opacity=`0.5`);break;case`ready`:r&&n.txt&&(r.textContent=n.txt),o&&o.remove();break}a&&(a.style.transition=`width 0.6s cubic-bezier(0.22,1,0.36,1)`,a.style.width=n.bar+`%`),e===`ready`&&setTimeout(()=>Z(),400)}async function $(){let e=document.getElementById(`portal-app`);if(!e)return;console.log(`[Init] Iniciando Portal...`);let t=await S.init();if(console.log(`[Init] Auth:`,t?`con maestro`:`sin maestro`),t&&Q(`auth`,t),S.isPendingApproval()){console.log(`[Init] Cuenta pendiente de aprobación — mostrando pantalla de espera`),document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(G,z(!1)),X(),history.replaceState({route:`pending-approval`},``,`/pending-approval`),Y(`pending-approval`),Z();return}let n=[`login`,`register`,`pending-approval`],r=(window.router||W).currentRoute().split(`?`)[0],i=n.includes(r);if(!t&&!i){qt(),Z();return}if(!t&&i){document.getElementById(`pm-view-container`)||(e.innerHTML=`<main class="pm-view" id="pm-view-container"></main>`),Object.assign(G,z()),X(),W.setAuthGuard(()=>S.isAuthenticated(),n),W.start(),Z();return}if(t.es_admin&&!t.es_maestro){console.log(`[Init] Admin puro detectado → redirigiendo a /admin`),Z(),window.location.href=`/admin`;return}Q(`profile`,t);let o=null;try{o=await D(t.id)}catch(e){console.warn(`[Init] Error fetching permissions:`,e.message)}Kt(e,t,o),Q(`preparing`),Object.assign(G,z()),Pt({isAdmin:!1,getMaestro:()=>H,getPermisosCached:()=>U,onPermisosUpdate:async(t,{ganados:r,perdidos:i})=>{let a=(W.currentRoute?.()||`perfil`).split(`?`)[0],o=a===`gestionar-clases`&&!t.puede_inscribir_clases||a===`pending-approval`&&r.length>0?`hoy`:a;Kt(e,H,t),Object.assign(G,z()),X(),W.setAuthGuard(()=>S.isAuthenticated(),n),q.clear(),await Y(o),W.navigate(o)},onNavigate:e=>W.navigate(e),onResize:()=>{let e=(W.currentRoute?.()||`hoy`).split(`?`)[0];Tt(e),J()}}),Be(Gt,Wt),X(),W.setAuthGuard(()=>S.isAuthenticated(),n),W.start(),Q(`ready`);let s=(W.currentRoute?.()||``).split(`?`)[0];(!s||s===`login`||s===`logout`)&&W.navigate(`hoy`),a().then(async()=>{let e=[`hoy`,`fechas`,`calendario`,`metricas`],t=(W.currentRoute?.()||`hoy`).split(`?`)[0],n=e.filter(e=>e!==t&&!q.has(e));await Promise.all(n.map(e=>{if(G[e])return Y(e,{},{silent:!0})})),window.pwaInstaller?.evaluateInsights()}).catch(e=>console.warn(`[Prefetch] Error:`,e.message)),Ut()}var Yt=(e,t,n,r)=>`
  <div style="padding:40px;color:#fff;font-family:'Outfit',sans-serif;background:radial-gradient(circle at top right,#1e293b,#0f172a);z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <div style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;max-width:600px;width:90%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <div style="width:80px;height:80px;background:rgba(239,68,68,0.1);color:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 24px;"><i class="bi ${e}"></i></div>
      <h2 style="margin-bottom:16px;font-weight:700;">${t}</h2>
      <p style="color:rgba(255,255,255,0.6);margin-bottom:24px;">${n}</p>
      <div style="background:rgba(0,0,0,0.3);padding:16px;border-radius:12px;text-align:left;font-family:monospace;font-size:13px;margin-bottom:24px;overflow:auto;max-height:200px;border-left:4px solid #ef4444;">${r}</div>
      <button onclick="window.location.reload()" style="background:var(--pm-primary,#3b82f6);color:white;border:none;padding:12px 32px;border-radius:12px;font-weight:600;cursor:pointer;">Recargar Aplicación</button>
    </div>
  </div>`;window.addEventListener(`error`,e=>{if([`useCache`,`WebSocket`,`content.js`].some(t=>(e.message||``).includes(t))){console.warn(`[Ignored Error]`,e.message);return}le(Error(e.message),{context:`window.error`,filename:e.filename,lineno:e.lineno});let t=document.getElementById(`portal-app`);t&&(t.innerHTML=Yt(`bi-x-circle-fill`,`Ups! Algo salió mal`,`Se ha producido un error inesperado en la aplicación.`,`<div style="color:#ef4444;font-weight:bold;margin-bottom:8px;">${e.message}</div><div style="color:rgba(255,255,255,0.4);">${e.filename?.split(`/`).pop()}:${e.lineno}</div>`))}),window.addEventListener(`unhandledrejection`,e=>{le(e.reason instanceof Error?e.reason:Error(String(e.reason)),{context:`unhandledRejection`});let t=document.getElementById(`portal-app`);t&&(t.innerHTML=Yt(`bi-exclamation-triangle-fill`,`Error de Sincronización`,`Hubo un problema al procesar una solicitud de red.`,`<div style="color:#ef4444;font-weight:bold;margin-bottom:8px;">Promise Rejection</div><div style="color:rgba(255,255,255,0.4);">${String(e.reason)}</div>`))}),$().catch(e=>{let t=document.getElementById(`portal-app`);t&&(t.innerHTML=`<div style="padding:20px;color:red;font-family:monospace;background:#fff;z-index:9999;position:fixed;top:0;left:0;right:0;bottom:0;overflow:auto;"><h2>❌ initPortal() falló</h2><pre>${e?.message||e}\n${e?.stack||``}</pre></div>`)});export{Ie as a,Ne as c,ue as d,D as i,Oe as l,N as n,Re as o,Ve as r,Me as s,ht as t,S as u};