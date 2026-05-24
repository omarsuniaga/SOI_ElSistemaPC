const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ausenciaForm-BFnjR3BI.js","assets/supabase-C4ics26R.js","assets/ausenciaHistorial-C8p_dKbb.js","assets/jspdf.es.min-Cp9PwTtV.js","assets/rolldown-runtime-tcWNtVWY.js","assets/preload-helper-CsoeaaUJ.js","assets/typeof-Jix6Nskq.js","assets/configView-CoG83rdM.js","assets/pushService-DQD3mJWH.js","assets/maestroAuth-Cae-9DFh.js","assets/importView-uwHskkD8.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{A as t,C as n,D as r,E as i,F as a,I as o,J as s,K as c,L as l,M as u,N as d,O as f,P as ee,S as p,T as te,V as ne,W as m,_ as re,a as ie,b as ae,c as oe,d as se,g as ce,h as le,i as ue,j as de,k as fe,l as pe,m as me,n as he,o as ge,q as h,r as g,s as _e,t as ve,u as ye,v as be,w as xe,y as Se}from"./clasesView-ZzEVIV_i.js";import{i as _,n as Ce,r as we,t as Te}from"./supabase-C4ics26R.js";import{n as Ee,r as De,t as Oe}from"./vendor-BWfrAznO.js";import{t as v}from"./AppToast-BOjiJExQ.js";import{t as y}from"./preload-helper-CsoeaaUJ.js";import{t as b}from"./AppModal-CLA9fW7x.js";import{t as ke}from"./groqService-CcQv6lIL.js";import{i as Ae}from"./permisosSupabase-klEyJeUD.js";import{f as x}from"./clasesApi-3E3-66yq.js";var S={routes:{},_authCheck:null,_publicRoutes:[`login`,`register`],_guardEnabled:!1,register(e,t){this.routes[e]=t},setAuthGuard(e,t=[`login`,`register`]){this._authCheck=e,this._publicRoutes=t,this._guardEnabled=!0},_cleanupModals(){document.querySelectorAll(`.modal.show, .modal.fade`).forEach(e=>{try{let t=Oe.getInstance(e);t&&t.dispose()}catch{}}),document.querySelectorAll(`.modal-backdrop`).forEach(e=>e.remove()),document.body.classList.remove(`modal-open`),document.body.style.removeProperty(`overflow`),document.body.style.removeProperty(`padding-right`)},navigate(e,t={}){if(!this.routes[e]){console.error(`Route ${e} not found`);return}if(this._guardEnabled&&this._authCheck&&!this._publicRoutes.includes(e)&&!this._authCheck()){localStorage.setItem(`current-view`,`login`),localStorage.setItem(`intended-route`,e),this._navigateTo(`login`,{});return}this._navigateTo(e,t)},_navigateTo(e,t={}){let n=document.querySelector(`#app`);n&&(this._cleanupModals(),n.innerHTML=``,this.routes[e](n,t),localStorage.setItem(`current-view`,e),t&&Object.keys(t).length>0?localStorage.setItem(`current-view-params`,JSON.stringify(t)):localStorage.removeItem(`current-view-params`),window.dispatchEvent(new CustomEvent(`routeChanged`,{detail:e})))},init(){let e=localStorage.getItem(`current-view`)||`programas`,t=localStorage.getItem(`current-view-params`),n=t?JSON.parse(t):{};this.navigate(e,n)},initCustomEvents(){window.addEventListener(`navigate:alumno`,e=>{let t=e.detail?.alumnoId||e.detail?.id;t&&this.navigate(`alumnos`,{selectedId:t})}),window.addEventListener(`navigate:observaciones`,e=>{let t=e.detail?.alumnoId;t&&this.navigate(`observaciones`,{filtroAlumnoId:t})}),window.addEventListener(`navigate:metricas-alumno`,e=>{let t=e.detail?.alumnoId||e.detail?.id;t&&this.navigate(`metricas-riesgo`,{highlightId:t})})}},C=`auth-session`;function je(e,t=!0){let n={access_token:e.access_token,refresh_token:e.refresh_token,user:e.user,expires_at:e.expires_at,persistent:t};(t?localStorage:sessionStorage).setItem(C,JSON.stringify(n)),t?sessionStorage.removeItem(C):localStorage.removeItem(C)}function Me(){let e=localStorage.getItem(C),t=sessionStorage.getItem(C),n=e||t;if(!n)return null;try{return JSON.parse(n)}catch{return null}}function Ne(){localStorage.removeItem(C),sessionStorage.removeItem(C)}function Pe(){let e=Me();return!e||!e.expires_at?!1:Date.now()/1e3<e.expires_at-10}var Fe=[];async function Ie(e,t,n=!1){console.log(`🔑 authManager.login:`,e,`remember:`,n);let{data:r,error:i}=await Te(e,t);return console.log(`🔑 login result:`,{data:r,error:i}),i?(console.error(`🔑 login error:`,i),{user:null,session:null,error:i}):(r.session&&je(r.session,n),{user:r.user,session:r.session,error:null})}async function Le(e,t,n={}){let{data:r,error:i}=await we(e,t,n);return i?{user:null,session:null,error:i}:{user:r.user,session:r.session,error:null}}async function Re(){let{error:e}=await Ce();return Ne(),Fe.forEach(e=>e(null)),{error:e}}function ze(){return Pe()}function Be(){return Me()?.user||null}var w={user:null,session:null,loading:!0,error:null,listeners:[]};function T(){w.listeners.forEach(e=>e(w))}function Ve(e){return w.listeners.push(e),()=>{w.listeners=w.listeners.filter(t=>t!==e)}}async function He(e,t,n=!1){if(w.loading=!0,w.error=null,T(),e===`demo@soi.com`&&t===`demo123`){let e={id:`demo-user-id`,email:`demo@soi.com`,user_metadata:{full_name:`Usuario Demo`},role:`admin`},t={user:e,access_token:`demo-token`};return localStorage.setItem(`demo_mode`,`true`),m.isDemoMode=!0,je(t,n),w.user=e,w.session=t,w.loading=!1,T(),{success:!0,user:e,session:t}}try{let r=await Ie(e,t,n),i=r?.error&&(r.error.message||r.error),a=r?.user&&!i;return w.user=a?r.user:null,w.session=a?r.session:null,w.loading=!1,T(),i?{success:!1,error:typeof i==`string`?i:i.message||`Error desconocido`}:{success:a,user:w.user,session:w.session}}catch(e){return w.loading=!1,w.error=e.message,T(),{success:!1,error:e.message}}}async function Ue(e,t,n){w.loading=!0,w.error=null,T();try{let r=await Le(e,t,n);return w.user=r.user,w.session=r.session,w.loading=!1,T(),{...r,success:!r.error&&!!r.user}}catch(e){return w.loading=!1,w.error=e.message,T(),{success:!1,error:e.message}}}function We(){Re(),localStorage.removeItem(`demo_mode`),m.isDemoMode=!1,w.user=null,w.session=null,w.error=null,T()}function Ge(){return Be()}function Ke(){return w.user?!0:ze()}async function qe(){let{data:{session:e},error:t}=await _.auth.getSession();return t||!e?(Ne(),w.user=null,w.session=null,w.loading=!1,T(),{authenticated:!1}):(je(e,Me()?.persistent??!0),w.session=e,w.user=e.user,w.loading=!1,T(),{authenticated:!0,user:w.user})}qe();var E={subscribe:Ve,login:He,register:Ue,logout:We,getUser:Ge,isAuthenticated:Ke,notifyListeners:T,refreshAuth:qe,getState:()=>({...w})},Je={config:{fontSizeBase:`0.8rem`,fontSizeSmall:`0.7rem`,paddingX:`0.5rem`,paddingY:`0.35rem`,gap:`0.35rem`},styles:`
    /* Compact Tables */
    .table-compact {
      font-size: 0.8rem;
      --bs-table-hover-bg: var(--bs-primary-bg-subtle);
    }
    .table-compact th {
      font-size: 0.7rem;
      padding: 0.4rem 0.5rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .table-compact td {
      padding: 0.4rem 0.5rem;
      vertical-align: middle;
    }
    .table-compact .form-control,
    .table-compact .form-select {
      font-size: 0.8rem;
      padding: 0.3rem 0.5rem;
    }

    /* Compact Cards Grid */
    .compact-grid {
      display: grid;
      gap: 0.5rem;
    }
    .compact-card {
      font-size: 0.8rem;
      padding: 0.5rem;
      transition: all 0.15s ease;
    }
    .compact-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* Compact Buttons */
    .btn-compact {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      line-height: 1.3;
    }
    .btn-compact i {
      font-size: 0.85rem;
    }
    .btn-icon-sm {
      width: 28px;
      height: 28px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Compact Badges */
    .badge-compact {
      font-size: 0.65rem;
      padding: 0.2rem 0.4rem;
      font-weight: 500;
    }

    /* Dense Inputs */
    .input-dense {
      font-size: 0.8rem;
      padding: 0.35rem 0.5rem;
    }
    .input-dense-sm {
      font-size: 0.75rem;
      padding: 0.25rem 0.4rem;
    }

    /* Toolbar Compact */
    .toolbar-dense {
      gap: 0.5rem;
      padding: 0.5rem;
      background: var(--bs-body-bg);
      border-radius: 0.375rem;
      border: 1px solid var(--bs-border-color);
    }

    /* Status Dots */
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-dot.active { background: #198754; }
    .status-dot.inactive { background: #6c757d; }
    .status-dot.pending { background: #ffc107; }
    .status-dot.error { background: #dc3545; }

    /* Avatar Compact */
    .avatar-compact {
      width: 32px;
      height: 32px;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 600;
    }

    /* Info Row Compact */
    .info-row {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
    }
    .info-row-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .info-row-item i {
      font-size: 0.85rem;
      opacity: 0.7;
    }

    /* Quick Actions Bar */
    .quick-actions {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.15s;
    }
    tr:hover .quick-actions {
      opacity: 1;
    }

    /* Search Bar */
    .search-bar {
      position: relative;
    }
    .search-bar i {
      position: absolute;
      left: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.85rem;
      opacity: 0.5;
    }
    .search-bar input {
      padding-left: 2rem;
    }

    /* Stats Card */
    .stat-mini {
      text-align: center;
      padding: 0.5rem;
      border-radius: 0.375rem;
      background: var(--bs-body-bg);
      border: 1px solid var(--bs-border-color);
    }
    .stat-mini .value {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
    }
    .stat-mini .label {
      font-size: 0.65rem;
      opacity: 0.7;
      text-transform: uppercase;
    }

    /* Scrollable Table Container */
    .table-scroll-container {
      max-height: calc(100vh - 250px);
      overflow-y: auto;
    }

    /* Modal Compact */
    .modal-compact .modal-body {
      padding: 1rem;
    }
    .modal-compact .modal-header,
    .modal-compact .modal-footer {
      padding: 0.75rem 1rem;
    }

    /* Form Labels */
    .form-label-compact {
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    /* Truncate Text */
    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,injectStyles(){if(document.getElementById(`compact-ui-styles`))return;let e=document.createElement(`style`);e.id=`compact-ui-styles`,e.textContent=this.styles,document.head.appendChild(e)},templates:{statCard(e,t,n,r=`primary`){return`
        <div class="stat-mini">
          <div class="value text-${r}">${t}</div>
          <div class="label">${e}</div>
        </div>
      `},searchToolbar(e=`Buscar...`){return`
        <div class="toolbar-dense d-flex flex-wrap align-items-center">
          <div class="search-bar flex-grow-1" style="min-width: 200px; max-width: 400px;">
            <i class="bi bi-search"></i>
            <input type="text" class="form-control input-dense" placeholder="${e}" id="searchInput">
          </div>
          <div id="filtersContainer"></div>
          <button class="btn btn-primary btn-compact" id="btnNew">
            <i class="bi bi-plus-lg"></i> Nuevo
          </button>
        </div>
      `},pageHeader(e,t=`bi-collection`){return`
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 class="mb-0 fw-bold"><i class="${t} me-2"></i>${e}</h5>
          </div>
          <div class="d-flex gap-2" id="headerActions"></div>
        </div>
      `},statusBadge(e,t){return`<span class="badge badge-compact bg-${{activo:`success`,active:`success`,inactivo:`secondary`,inactive:`secondary`,pendiente:`warning`,pending:`warning`,resuelto:`info`,resolved:`info`,cancelado:`danger`,canceled:`danger`}[e]||`secondary`}">${t}</span>`},avatar(e,t=`md`){let n={sm:24,md:32,lg:40}[t]||32;return`
        <div class="avatar-compact bg-primary text-white" style="width: ${n}px; height: ${n}px;">
          ${e}
        </div>
      `},quickActions(e,t,n){return`
        <div class="quick-actions">
          <button class="btn btn-sm btn-outline-primary btn-icon-sm" data-id="${e}" data-action="edit" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-info btn-icon-sm" data-id="${t}" data-action="view" title="Ver">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-icon-sm" data-id="${n}" data-action="delete" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `}},utils:{getInitials(e){if(!e)return`?`;let t=e.trim().split(` `);return t.length>=2?(t[0][0]+t[t.length-1][0]).toUpperCase():e.substring(0,2).toUpperCase()},formatPhone(e){return e||`-`},truncate(e,t=30){return e?e.length<=t?e:e.substring(0,t-3)+`...`:``},formatDateShort(e){return e?new Date(e).toLocaleDateString(`es-VE`,{day:`numeric`,month:`short`}):`-`}}},Ye={loading:!1};function Xe(e){Je.injectStyles(),Ze(e),Qe(e)}function Ze(e){e.innerHTML=`
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <i class="bi bi-mortarboard-fill"></i>
            </div>
            <h4 class="auth-title">Sistema Académico</h4>
            <p class="auth-subtitle">Ingresa a tu cuenta</p>
          </div>

          <form id="loginForm" class="auth-form">
            <div class="mb-3">
              <label class="form-label-compact">Correo electrónico</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-envelope"></i>
                </span>
                <input 
                  type="email" 
                  class="form-control input-dense" 
                  id="loginEmail" 
                  placeholder="correo@ejemplo.com"
                  required
                  autocomplete="email"
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label-compact">Contraseña</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-lock"></i>
                </span>
                <input 
                  type="password" 
                  class="form-control input-dense" 
                  id="loginPassword" 
                  placeholder="••••••••"
                  required
                  autocomplete="current-password"
                >
                <button class="btn btn-outline-secondary input-dense" type="button" id="togglePassword">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-4">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="rememberMe">
                <label class="form-check-label" for="rememberMe">
                  Recordar contraseña
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-sm-compact w-100" id="btnLogin">
              <span class="btn-text">Iniciar sesión</span>
              <span class="btn-loading d-none">
                <span class="spinner-border spinner-border-sm me-2"></span>Autenticando...
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p class="mb-0">
              ¿No tienes cuenta?
              <a href="#" id="linkRegister" class="auth-link">Regístrate aquí</a>
            </p>
          </div>
        </div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>

    <style>
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--bs-primary) 0%, #1a365d 100%);
        padding: 1rem;
      }
      .auth-container {
        width: 100%;
        max-width: 400px;
      }
      .auth-card {
        background: var(--bs-body-bg);
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        padding: 2rem;
      }
      .auth-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .auth-logo {
        width: 60px;
        height: 60px;
        background: var(--bs-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.75rem;
        color: white;
      }
      .auth-title {
        margin-bottom: 0.25rem;
        font-weight: 600;
      }
      .auth-subtitle {
        color: var(--bs-secondary);
        font-size: 0.875rem;
        margin-bottom: 0;
      }
      .auth-form .input-group-text {
        border-right: none;
        background: var(--bs-body-bg);
      }
      .auth-form .form-control:focus {
        border-left: none;
      }
      .auth-form .form-check-label {
        font-size: 0.8rem;
      }
      .auth-footer {
        text-align: center;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--bs-border-color);
        font-size: 0.875rem;
      }
      .auth-link {
        color: var(--bs-primary);
        text-decoration: none;
        font-weight: 500;
      }
      .auth-link:hover {
        text-decoration: underline;
      }
    </style>
  `}function Qe(e){let t=document.getElementById(`loginForm`),n=document.getElementById(`loginEmail`),r=document.getElementById(`loginPassword`),i=document.getElementById(`togglePassword`),a=document.getElementById(`linkRegister`);t?.addEventListener(`submit`,async t=>{t.preventDefault();let i=n.value.trim(),a=r.value;await $e(i,a,document.getElementById(`rememberMe`)?.checked||!1,e)}),i?.addEventListener(`click`,()=>{let e=r.type===`password`?`text`:`password`;r.type=e,i.innerHTML=e===`password`?`<i class="bi bi-eye"></i>`:`<i class="bi bi-eye-slash"></i>`}),a?.addEventListener(`click`,e=>{e.preventDefault(),S.navigate(`register`)})}async function $e(e,t,n,r){if(!e||!t){D(`Por favor ingresa email y contraseña`,`error`,r);return}Ye.loading=!0,et(!0);try{let i=await E.login(e,t,n);i.success?(D(`¡Bienvenido!`,`success`,r),setTimeout(()=>{let e=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),S.navigate(e||`programas`)},500)):D(i.error||`Error al iniciar sesión`,`error`,r)}catch(e){console.error(`Login error:`,e),D(`Error de conexión`,`error`,r)}finally{Ye.loading=!1,et(!1)}}function et(e){let t=document.getElementById(`btnLogin`),n=t?.querySelector(`.btn-text`),r=t?.querySelector(`.btn-loading`);t&&(t.disabled=e,e?(n?.classList.add(`d-none`),r?.classList.remove(`d-none`)):(n?.classList.remove(`d-none`),r?.classList.add(`d-none`)))}function D(e,t,n){let r=document.getElementById(`toastContainer`);if(!r)return;let i=e&&typeof e==`object`?e.message||e.error||JSON.stringify(e):String(e||`Error`),a=`
    <div id="${`toast-`+Date.now()}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${t===`success`?`bg-success`:t===`error`?`bg-danger`:`bg-info`} text-white">
        <i class="bi ${t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:`bi-info-circle`} me-2"></i>
        <strong class="me-auto">${t===`success`?`Éxito`:t===`error`?`Error`:`Información`}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${i}
      </div>
    </div>
  `,o=document.createElement(`div`);o.innerHTML=a;let s=o.firstElementChild;r.appendChild(s),new Ee(s,{autohide:!0,delay:3e3}).show(),s.addEventListener(`hidden.bs.toast`,()=>{s.remove()})}var tt={loading:!1},nt=[{test:e=>e.length>=8,message:`Mínimo 8 caracteres`},{test:e=>/[A-Z]/.test(e),message:`Al menos 1 mayúscula`},{test:e=>/[0-9]/.test(e),message:`Al menos 1 número`},{test:e=>/[!@#$%^&*(),.?":{}|<>]/.test(e),message:`Al menos 1 símbolo`}];function rt(e){Je.injectStyles(),it(e),ot(e)}function it(e){e.innerHTML=`
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <i class="bi bi-person-plus-fill"></i>
            </div>
            <h4 class="auth-title">Crear Cuenta</h4>
            <p class="auth-subtitle">Regístrate para comenzar</p>
          </div>

          <form id="registerForm" class="auth-form">
            <div class="mb-3">
              <label class="form-label-compact">Nombre completo</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-person"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control input-dense" 
                  id="registerName" 
                  placeholder="Juan Pérez"
                  required
                  autocomplete="name"
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label-compact">Correo electrónico</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-envelope"></i>
                </span>
                <input 
                  type="email" 
                  class="form-control input-dense" 
                  id="registerEmail" 
                  placeholder="correo@ejemplo.com"
                  required
                  autocomplete="email"
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label-compact">Contraseña</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-lock"></i>
                </span>
                <input 
                  type="password" 
                  class="form-control input-dense" 
                  id="registerPassword" 
                  placeholder="••••••••"
                  required
                  autocomplete="new-password"
                >
                <button class="btn btn-outline-secondary input-dense" type="button" id="togglePassword">
                  <i class="bi bi-eye"></i>
                </button>
              </div>
              <div class="password-requirements mt-2" id="passwordRequirements">
                ${at(``)}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label-compact">Confirmar contraseña</label>
              <div class="input-group">
                <span class="input-group-text input-dense">
                  <i class="bi bi-lock-fill"></i>
                </span>
                <input 
                  type="password" 
                  class="form-control input-dense" 
                  id="registerConfirmPassword" 
                  placeholder="••••••••"
                  required
                  autocomplete="new-password"
                >
              </div>
              <div class="invalid-feedback d-none" id="confirmPasswordError">
                Las contraseñas no coinciden
              </div>
            </div>

            <div class="mb-4">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="acceptTerms" required>
                <label class="form-check-label" for="acceptTerms">
                  Acepto los <a href="#" id="linkTerms" class="auth-link">términos y condiciones</a>
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-sm-compact w-100" id="btnRegister">
              <span class="btn-text">Crear cuenta</span>
              <span class="btn-loading d-none">
                <span class="spinner-border spinner-border-sm me-2"></span>Registrando...
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p class="mb-0">
              ¿Ya tienes cuenta?
              <a href="#" id="linkLogin" class="auth-link">Iniciar sesión</a>
            </p>
          </div>
        </div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>

    <style>
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--bs-primary) 0%, #1a365d 100%);
        padding: 1rem;
      }
      .auth-container {
        width: 100%;
        max-width: 420px;
      }
      .auth-card {
        background: var(--bs-body-bg);
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        padding: 2rem;
      }
      .auth-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .auth-logo {
        width: 60px;
        height: 60px;
        background: var(--bs-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.75rem;
        color: white;
      }
      .auth-title {
        margin-bottom: 0.25rem;
        font-weight: 600;
      }
      .auth-subtitle {
        color: var(--bs-secondary);
        font-size: 0.875rem;
        margin-bottom: 0;
      }
      .auth-form .input-group-text {
        border-right: none;
        background: var(--bs-body-bg);
      }
      .auth-form .form-control:focus {
        border-left: none;
      }
      .auth-form .form-check-label {
        font-size: 0.8rem;
      }
      .auth-form .form-check-label .auth-link {
        color: var(--bs-primary);
      }
      .auth-footer {
        text-align: center;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--bs-border-color);
        font-size: 0.875rem;
      }
      .auth-link {
        color: var(--bs-primary);
        text-decoration: none;
        font-weight: 500;
      }
      .auth-link:hover {
        text-decoration: underline;
      }
      .password-requirements {
        font-size: 0.75rem;
      }
      .password-requirement {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-bottom: 0.25rem;
        color: var(--bs-secondary);
      }
      .password-requirement.valid {
        color: var(--bs-success);
      }
      .password-requirement.invalid {
        color: var(--bs-secondary);
      }
      .password-requirement i {
        font-size: 0.7rem;
      }
    </style>
  `}function at(e){return nt.map((t,n)=>{let r=t.test(e);return`
      <div class="password-requirement ${r?`valid`:`invalid`}" id="req-${n}">
        <i class="bi ${r?`bi-check-circle-fill`:`bi-circle`}"></i>
        <span>${t.message}</span>
      </div>
    `}).join(``)}function ot(e){let t=document.getElementById(`registerForm`);document.getElementById(`registerName`),document.getElementById(`registerEmail`);let n=document.getElementById(`registerPassword`),r=document.getElementById(`registerConfirmPassword`),i=document.getElementById(`togglePassword`),a=document.getElementById(`linkLogin`);n?.addEventListener(`input`,e=>{let t=e.target.value;st(t),ct()}),r?.addEventListener(`input`,ct),t?.addEventListener(`submit`,async t=>{t.preventDefault(),await ut(e)}),i?.addEventListener(`click`,()=>{let e=n.type===`password`?`text`:`password`;n.type=e,r.type=e,i.innerHTML=e===`password`?`<i class="bi bi-eye"></i>`:`<i class="bi bi-eye-slash"></i>`}),a?.addEventListener(`click`,e=>{e.preventDefault(),S.navigate(`login`)})}function st(e){document.getElementById(`passwordRequirements`)&&nt.forEach((t,n)=>{let r=document.getElementById(`req-${n}`);if(r){let n=t.test(e);r.className=`password-requirement ${n?`valid`:`invalid`}`,r.innerHTML=`
        <i class="bi ${n?`bi-check-circle-fill`:`bi-circle`}"></i>
        <span>${t.message}</span>
      `}})}function ct(){let e=document.getElementById(`registerPassword`).value,t=document.getElementById(`registerConfirmPassword`).value,n=document.getElementById(`confirmPasswordError`),r=document.getElementById(`registerConfirmPassword`);return t&&e!==t?(n?.classList.remove(`d-none`),r?.classList.add(`is-invalid`),!1):(n?.classList.add(`d-none`),r?.classList.remove(`is-invalid`),!0)}function lt(e){return nt.every(t=>t.test(e))}async function ut(e){let t=document.getElementById(`registerName`).value.trim(),n=document.getElementById(`registerEmail`).value.trim(),r=document.getElementById(`registerPassword`).value,i=document.getElementById(`registerConfirmPassword`).value,a=document.getElementById(`acceptTerms`).checked;if(!t||!n||!r||!i){O(`Por favor completa todos los campos`,`error`,e);return}if(!lt(r)){O(`La contraseña no cumple los requisitos`,`error`,e);return}if(r!==i){O(`Las contraseñas no coinciden`,`error`,e);return}if(!a){O(`Debes aceptar los términos y condiciones`,`error`,e);return}tt.loading=!0,dt(!0);try{let i=await E.register(n,r,{full_name:t});i.success?i.needsConfirmation?(O(i.message,`info`,e),setTimeout(()=>{S.navigate(`login`)},2e3)):(O(`¡Cuenta creada exitosamente!`,`success`,e),setTimeout(()=>{S.navigate(`programas`)},500)):O(i.error||`Error al registrar`,`error`,e)}catch(t){console.error(`Register error:`,t),O(`Error de conexión`,`error`,e)}finally{tt.loading=!1,dt(!1)}}function dt(e){let t=document.getElementById(`btnRegister`),n=t?.querySelector(`.btn-text`),r=t?.querySelector(`.btn-loading`);t&&(t.disabled=e,e?(n?.classList.add(`d-none`),r?.classList.remove(`d-none`)):(n?.classList.remove(`d-none`),r?.classList.add(`d-none`)))}function O(e,t,n){let r=document.getElementById(`toastContainer`);if(!r)return;let i=`
    <div id="${`toast-`+Date.now()}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${t===`success`?`bg-success`:t===`error`?`bg-danger`:t===`info`?`bg-info`:`bg-warning`} text-white">
        <i class="bi ${t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:t===`info`?`bi-info-circle`:`bi-exclamation-triangle`} me-2"></i>
        <strong class="me-auto">${t===`success`?`Éxito`:t===`error`?`Error`:t===`info`?`Información`:`Advertencia`}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${ft(e)}
      </div>
    </div>
  `,a=document.createElement(`div`);a.innerHTML=i;let o=a.firstElementChild;r.appendChild(o),new Ee(o,{autohide:!0,delay:3e3}).show(),o.addEventListener(`hidden.bs.toast`,()=>{o.remove()})}function ft(e){return e?e.replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e]):``}var k={loading:!1,error:null};function pt(e){let t=E.getUser();if(!t){e.innerHTML=`
      <div class="container py-4">
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Debes iniciar sesión para ver tu perfil.
        </div>
      </div>
    `;return}e.innerHTML=`
    <div class="container py-4">
      <div class="perfil-header mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-person-circle me-2"></i>Mi Perfil
        </h2>
        <p class="text-muted">Gestiona tu información personal y contraseña</p>
      </div>

      <div class="row">
        <div class="col-lg-4 mb-4">
          <div class="card-apple p-4 text-center">
            <div class="perfil-avatar mx-auto mb-3">
              ${t.user_metadata?.avatar_url?`<img src="${t.user_metadata.avatar_url}" alt="Avatar" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;">`:`<i class="bi bi-person-fill" style="font-size: 3rem;"></i>`}
            </div>
            <h5 class="fw-bold">${t.user_metadata?.full_name||t.email?.split(`@`)[0]}</h5>
            <span class="badge bg-primary bg-opacity-10 text-primary">${t.role||`Usuario`}</span>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card-apple p-4 mb-4">
            <h5 class="fw-bold mb-3">
              <i class="bi bi-person me-2"></i>Datos Personales
            </h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label label-apple">Nombre completo</label>
                <input type="text" class="input-apple" id="perfilNombre" 
                  value="${t.user_metadata?.full_name||``}" 
                  placeholder="Tu nombre completo">
              </div>
              <div class="col-md-6">
                <label class="form-label label-apple">Correo electrónico</label>
                <input type="email" class="input-apple" id="perfilEmail" 
                  value="${t.email||``}" disabled>
                <small class="text-muted">El correo no puede cambiarse</small>
              </div>
              <div class="col-12">
                <button class="btn-apple-primary" id="btnGuardarDatos">
                  <i class="bi bi-check-lg me-1"></i>Guardar cambios
                </button>
              </div>
            </div>
          </div>

          <div class="card-apple p-4 mb-4">
            <h5 class="fw-bold mb-3">
              <i class="bi bi-key me-2"></i>Cambiar Contraseña
            </h5>
            <form id="perfilPasswordForm">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label label-apple">Contraseña actual</label>
                  <input type="password" class="input-apple" id="passwordActual" required
                    placeholder="Ingresa tu contraseña actual">
                </div>
                <div class="col-md-6">
                  <label class="form-label label-apple">Nueva contraseña</label>
                  <input type="password" class="input-apple" id="passwordNueva" required
                    placeholder="Mínimo 8 caracteres">
                </div>
                <div class="col-md-6">
                  <label class="form-label label-apple">Confirmar contraseña</label>
                  <input type="password" class="input-apple" id="passwordConfirmar" required
                    placeholder="Repite la nueva contraseña">
                </div>
                <div class="col-12">
                  <div id="passwordError" class="alert alert-danger d-none"></div>
                  <button type="submit" class="btn-apple-secondary" id="btnCambiarPassword">
                    <i class="bi bi-key-fill me-1"></i>Cambiar contraseña
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div class="card-apple p-4">
            <h5 class="fw-bold mb-3">
              <i class="bi bi-calendar-minus me-2"></i>Solicitar Ausencia
            </h5>
            <p class="text-muted mb-3">Solicita días de ausencia y Assigna un maestro sustituto</p>
            <button class="btn-apple-primary" data-bs-toggle="modal" data-bs-target="#ausenciaModal">
              <i class="bi bi-plus-lg me-1"></i>Nueva solicitud
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="ausenciaModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calendar-minus me-2"></i>Solicitud de Ausencia
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ausenciaModalBody">
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-muted">Cargando formulario...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,mt(e)}async function mt(e){let{renderAusenciaForm:t}=await y(async()=>{let{renderAusenciaForm:e}=await import(`./ausenciaForm-BFnjR3BI.js`);return{renderAusenciaForm:e}},__vite__mapDeps([0,1])),{renderAusenciaHistorial:n}=await y(async()=>{let{renderAusenciaHistorial:e}=await import(`./ausenciaHistorial-C8p_dKbb.js`);return{renderAusenciaHistorial:e}},__vite__mapDeps([2,1]));document.getElementById(`ausenciaModalBody`).innerHTML=t();let r=e.querySelector(`.card-apple:last-child`);if(r){let e=document.createElement(`div`);e.className=`mt-4`,e.innerHTML=`
      <h6 class="fw-bold mb-3">
        <i class="bi bi-clock-history me-2"></i>Historial de Ausencias
      </h6>
      <div id="ausenciaHistorialContainer"></div>
    `,r.appendChild(e),document.getElementById(`ausenciaHistorialContainer`).innerHTML=n()}e.querySelector(`#btnGuardarDatos`)?.addEventListener(`click`,ht),e.querySelector(`#perfilPasswordForm`)?.addEventListener(`submit`,gt)}async function ht(){let e=document.getElementById(`perfilNombre`).value.trim();if(!e){_t(`El nombre no puede estar vacío`);return}k.loading=!0;let t=document.getElementById(`btnGuardarDatos`);t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;try{let{error:t}=await _.auth.updateUser({data:{full_name:e}});if(t)throw t;vt(`Datos guardados correctamente`)}catch(e){_t(e.message)}finally{k.loading=!1,t.disabled=!1,t.innerHTML=`<i class="bi bi-check-lg me-1"></i>Guardar cambios`}}async function gt(e){e.preventDefault(),document.getElementById(`passwordActual`).value;let t=document.getElementById(`passwordNueva`).value,n=document.getElementById(`passwordConfirmar`).value;if(document.getElementById(`passwordError`),t.length<8){A(`La contraseña debe tener al menos 8 caracteres`);return}if(t!==n){A(`Las contraseñas no coinciden`);return}k.loading=!0;let r=document.getElementById(`btnCambiarPassword`);r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Cambiando...`;try{let{error:e}=await _.auth.updateUser({password:t});if(e)throw e;document.getElementById(`perfilPasswordForm`).reset(),vt(`Contraseña cambiada correctamente`)}catch(e){e.message.includes(`same`)?A(`La nueva contraseña debe ser diferente a la actual`):A(e.message)}finally{k.loading=!1,r.disabled=!1,r.innerHTML=`<i class="bi bi-key-fill me-1"></i>Cambiar contraseña`}}function _t(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:`danger`}}))}function vt(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:`success`}}))}function A(e){let t=document.getElementById(`passwordError`);t&&(t.textContent=e,t.classList.remove(`d-none`))}function yt(){S.register(`login`,Xe),S.register(`register`,rt),S.register(`perfil`,pt)}yt();function bt(){S.register(`maestros`,oe)}function xt(){S.register(`programas`,ye)}function St(){S.register(`alumnos`,se)}function Ct(e){return e?{...e,nombre:e.nombre??e.name??``,codigo:e.codigo_salon??``,ubicacion:e.ubicacion??e.location??``,condicion:e.condicion_fisica??`buena`,is_active:e.is_active??e.isActive??e.activo??!0,capacidad:parseInt(e.capacidad)||20,piso:e.piso!==void 0&&e.piso!==null?parseInt(e.piso):null,equipamiento:Array.isArray(e.equipamiento)?e.equipamiento.join(`, `):e.equipamiento||``,descripcion:e.descripcion||``}:null}async function wt(){let{data:e,error:t}=await _.from(`salones`).select(`*`).order(`nombre`,{ascending:!0});if(t)throw console.error(`Error cargando salones:`,t.message),Error(`No se pudieron cargar los salones`);return e.map(Ct)}async function Tt(e){let t=(e.nombre||``).trim(),n=(e.codigo_salon||``).trim();if(!t)throw Error(`El nombre es obligatorio`);let{data:r,error:i}=await _.from(`salones`).select(`id, nombre, codigo_salon`).or(`nombre.eq."${t}", codigo_salon.eq."${n}"`).maybeSingle();if(i&&console.error(`Error validando duplicados:`,i),r){if(r.nombre.toLowerCase()===t.toLowerCase())throw Error(`Ya existe un salón con ese nombre`);if(n&&r.codigo_salon?.toLowerCase()===n.toLowerCase())throw Error(`Ya existe un salón con ese código`)}let a={nombre:t,codigo_salon:n||void 0,capacidad:parseInt(e.capacidad)||20,ubicacion:(e.ubicacion||``).trim(),piso:e.piso===void 0?null:parseInt(e.piso),condicion_fisica:e.condicion_fisica||`buena`,equipamiento:typeof e.equipamiento==`string`?e.equipamiento.split(`,`).map(e=>e.trim()).filter(Boolean):Array.isArray(e.equipamiento)?e.equipamiento:[],descripcion:(e.descripcion||``).trim(),is_active:e.is_active===void 0?!0:e.is_active,responsable_id:e.responsable_id||null},{data:o,error:s}=await _.from(`salones`).insert([a]).select();if(s)throw s.code===`23505`?Error(`El nombre o código del salón ya está registrado`):(console.error(`Error creando salon:`,s.message),Error(`No se pudo crear el salon`));return o[0]}async function Et(e,t){let n=(t.nombre||``).trim(),r=(t.codigo_salon||``).trim();if(n||r){let{data:t}=await _.from(`salones`).select(`id, nombre, codigo_salon`).neq(`id`,e);if(t){if(n&&t.find(e=>e.nombre.toLowerCase()===n.toLowerCase()))throw Error(`Ya existe otro salón con ese nombre`);if(r&&t.find(e=>e.codigo_salon?.toLowerCase()===r.toLowerCase()))throw Error(`Ya existe otro salón con ese código`)}}let i={...t};n&&(i.nombre=n),r&&(i.codigo_salon=r),i.capacidad&&=parseInt(i.capacidad),i.piso!==void 0&&(i.piso=parseInt(i.piso)),i.equipamiento!==void 0&&(i.equipamiento=typeof i.equipamiento==`string`?i.equipamiento.split(`,`).map(e=>e.trim()).filter(Boolean):Array.isArray(i.equipamiento)?i.equipamiento:[]),i.updated_at=new Date().toISOString();let{data:a,error:o}=await _.from(`salones`).update(i).eq(`id`,e).select();if(o)throw o.code===`23505`?Error(`El nombre o código del salón ya está registrado`):(console.error(`Error actualizando salon:`,o.message),Error(`No se pudo actualizar el salon`));return a[0]}async function Dt(e){let{error:t}=await _.from(`salones`).update({is_active:!1,updated_at:new Date().toISOString()}).eq(`id`,e);if(t)throw console.error(`Error eliminando salon:`,t.message),Error(`No se pudo inactivar el salon`)}var j=new class{constructor(){this.salones=[],this.cargando=!1,this.error=null,this.listeners=[]}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){this.listeners.forEach(e=>e(this))}async fetchSalones(){this.cargando=!0,this.error=null,this.notify();try{this.salones=await wt()}catch(e){this.error=e.message,console.error(e)}finally{this.cargando=!1,this.notify()}}getFiltered(e=``,t=``,n=``){return this.salones.filter(r=>{let i=e.toLowerCase(),a=r.nombre.toLowerCase().includes(i)||r.codigo&&r.codigo.toLowerCase().includes(i)||r.ubicacion.toLowerCase().includes(i),o=t===``||String(r.piso)===String(t),s=n===``||r.condicion===n;return a&&o&&s})}},Ot={editandoId:null};function M(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function kt(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].substring(0,2).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function At(e){e.innerHTML=`
    <div class="page-container">
      <div class="salones-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-door-open fs-4"></i>
          </div>
          <div>
            <h1 class="salones-title-premium mb-0">Salones</h1>
            <p class="text-muted small mb-0"><span id="salonesCount">0</span> salones en total</p>
          </div>
        </div>
        
        <div class="salones-header-actions">
          <button class="btn btn-premium-action" id="btnCrearSalon">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Salón
          </button>
        </div>
      </div>

      <div class="salones-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar por nombre, código o ubicación..." id="searchSalon" autocomplete="off">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filterCondicion">
            <option value="">Todas las condiciones</option>
            <option value="excelente">Excelente</option>
            <option value="buena">Buena</option>
            <option value="regular">Regular</option>
            <option value="mala">Mala</option>
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-layers select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filterPiso">
            <option value="">Todos los pisos</option>
            <option value="0">Planta Baja</option>
            <option value="1">Piso 1</option>
            <option value="2">Piso 2</option>
            <option value="3">Piso 3</option>
            <option value="4">Piso 4</option>
          </select>
        </div>
      </div>

      <!-- Table Compact Overhauled to modern List-Group -->
      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="salonesTableBody">
          <div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>
        </div>
      </div>

    </div>
  `;let t=e.querySelector(`#salonesTableBody`),n=e.querySelector(`#searchSalon`),r=e.querySelector(`#filterCondicion`),i=e.querySelector(`#filterPiso`),a=e.querySelector(`#salonesCount`),o=()=>{let e=n.value,o=r.value,c=i.value,l=j.getFiltered(e,c,o);if(j.cargando){t.innerHTML=`<div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>`;return}if(j.error){t.innerHTML=`<div class="text-center py-5 text-danger"><i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i> Error: ${M(j.error)}</div>`;return}if(l.length===0){t.innerHTML=`
        <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
          <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
          No se encontraron salones con esos filtros.
        </div>`;return}a.textContent=l.length,t.innerHTML=l.map(e=>{let t=kt(e.nombre||`S`),n=e.is_active!==!1,r=s(e.condicion),i=`border-accent-${n?`success`:`secondary`}`,a=`bg-${n?`success`:`secondary`}`;return`
        <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${i}" data-id="${e.id}" style="cursor: pointer;">
          <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
            <div class="position-relative flex-shrink-0">
              <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">${t}</div>
              <span class="position-absolute bottom-0 end-0 p-1 ${a} border border-light rounded-circle" style="transform: translate(10%, 10%);">
                <span class="visually-hidden">${n?`Activo`:`Inactivo`}</span>
              </span>
            </div>
            <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${M(e.nombre||`-`)}</span>
              <small class="text-muted text-truncate">Capacidad: ${e.capacidad||`-`} personas • Piso: ${e.piso===0||e.piso===`0`?`Planta Baja`:`Piso ${e.piso}`}</small>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            ${r}
            <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
          </div>
        </div>
      `}).join(``)},s=e=>`<span class="badge badge-compact ${{excelente:`bg-success`,buena:`bg-primary`,regular:`bg-warning`,mala:`bg-danger`}[e]||`bg-secondary`}">${{excelente:`Excelente`,buena:`Buena`,regular:`Regular`,mala:`Mala`}[e]||`-`}</span>`,c=j.subscribe(o),l;n.addEventListener(`input`,()=>{clearTimeout(l),l=setTimeout(o,300)}),r.addEventListener(`change`,o),i.addEventListener(`change`,o),e.querySelector(`#btnCrearSalon`)?.addEventListener(`click`,()=>{jt()}),t?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t){let e=t.dataset.id;Nt(e)}}),j.fetchSalones(),e.cleanup=()=>{c()}}function jt(){Ot.editandoId=null,b.open({title:`Crear Nuevo Salón`,body:`<form class="row g-2" id="formSalon">
      <div class="col-12">
        <label class="form-label-compact">Nombre *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Salón de Música A">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Capacidad *</label>
        <input type="number" class="form-control input-dense" id="modal-capacidad" required placeholder="30" min="1">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Piso *</label>
        <select class="form-select input-dense" id="modal-piso" required>
          <option value="">Seleccionar</option>
          <option value="0">Planta Baja</option>
          <option value="1">Piso 1</option>
          <option value="2">Piso 2</option>
          <option value="3">Piso 3</option>
          <option value="4">Piso 4</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Condición</label>
        <select class="form-select input-dense" id="modal-condicion">
          <option value="excelente">Excelente</option>
          <option value="buena" selected>Buena</option>
          <option value="regular">Regular</option>
          <option value="mala">Mala</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-esActivo">
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Equipamiento</label>
        <textarea class="form-control input-dense" id="modal-equipamiento" rows="2" placeholder="Piano, sillas, escritorio, pizarra..."></textarea>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="2" placeholder="Descripción adicional del salón..."></textarea>
      </div>
    </form>`,saveText:`Guardar`,onSave:async e=>{let t=e.querySelector(`#modal-nombre`).value.trim(),n=parseInt(e.querySelector(`#modal-capacidad`).value),r=e.querySelector(`#modal-piso`).value,i=e.querySelector(`#modal-condicion`).value,a=e.querySelector(`#modal-esActivo`).value===`true`,o=e.querySelector(`#modal-equipamiento`).value.trim(),s=e.querySelector(`#modal-descripcion`).value.trim();if(!t||!n||!r)return v.error(`Por favor complete los campos obligatorios`),!1;await Tt({nombre:t,capacidad:n,piso:r,condicion_fisica:i,is_active:a,equipamiento:o,descripcion:s}),j.fetchSalones(),v.success(`Salón creado correctamente`)}})}function Mt(e){let t=j.salones.find(t=>t.id===e);if(!t){v.error(`Salón no encontrado`);return}Ot.editandoId=e,b.open({title:`Editar Salón`,body:`<form class="row g-2" id="formSalon">
      <div class="col-12">
        <label class="form-label-compact">Nombre *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required value="${M(t.nombre||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Capacidad *</label>
        <input type="number" class="form-control input-dense" id="modal-capacidad" required value="${t.capacidad||``}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Piso *</label>
        <select class="form-select input-dense" id="modal-piso" required>
          <option value="">Seleccionar</option>
          <option value="0" ${String(t.piso)===`0`?`selected`:``}>Planta Baja</option>
          <option value="1" ${String(t.piso)===`1`?`selected`:``}>Piso 1</option>
          <option value="2" ${String(t.piso)===`2`?`selected`:``}>Piso 2</option>
          <option value="3" ${String(t.piso)===`3`?`selected`:``}>Piso 3</option>
          <option value="4" ${String(t.piso)===`4`?`selected`:``}>Piso 4</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Condición</label>
        <select class="form-select input-dense" id="modal-condicion">
          <option value="excelente" ${t.condicion===`excelente`?`selected`:``}>Excelente</option>
          <option value="buena" ${t.condicion===`buena`?`selected`:``}>Buena</option>
          <option value="regular" ${t.condicion===`regular`?`selected`:``}>Regular</option>
          <option value="mala" ${t.condicion===`mala`?`selected`:``}>Mala</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-esActivo">
          <option value="true" ${t.is_active===!1?``:`selected`}>Activo</option>
          <option value="false" ${t.is_active===!1?`selected`:``}>Inactivo</option>
        </select>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Equipamiento</label>
        <textarea class="form-control input-dense" id="modal-equipamiento" rows="2">${M(t.equipamiento||``)}</textarea>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="2">${M(t.descripcion||``)}</textarea>
      </div>
    </form>`,saveText:`Guardar cambios`,onSave:async t=>{try{let n=t.querySelector(`#modal-nombre`).value.trim(),r=parseInt(t.querySelector(`#modal-capacidad`).value),i=t.querySelector(`#modal-piso`).value,a=t.querySelector(`#modal-condicion`).value,o=t.querySelector(`#modal-esActivo`).value===`true`,s=t.querySelector(`#modal-equipamiento`).value.trim(),c=t.querySelector(`#modal-descripcion`).value.trim();return!n||!r||!i?(v.error(`Por favor complete los campos obligatorios`),!1):(await Et(e,{nombre:n,capacidad:r,piso:i,condicion_fisica:a,is_active:o,equipamiento:s,descripcion:c}),await j.fetchSalones(),v.success(`Salón actualizado correctamente`),!0)}catch(e){return console.error(`Error al actualizar salón:`,e),v.error(e.message||`Error al actualizar el salón`),!1}}})}function Nt(e){let t=j.salones.find(t=>t.id===e);if(!t){showToast(`Salón no encontrado`,`error`);return}let n=t.piso===0||t.piso===`0`?`Planta Baja`:`Piso ${t.piso}`,r={excelente:`Excelente`,buena:`Buena`,regular:`Regular`,mala:`Mala`}[t.condicion]||`-`,i=t.is_active===!1?`Inactivo`:`Activo`,a=t.is_active===!1?`bg-secondary`:`bg-success`;b.open({title:M(t.nombre||`Salón`),hideSave:!0,cancelText:`Cerrar`,onShow:t=>{t.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{b.close(),setTimeout(()=>Mt(e),300)}),t.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{b.close(),setTimeout(()=>Pt(e),300)})},body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Código</label>
            <p class="form-control-plaintext"><code>${M(t.codigo||`-`)}</code></p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${M(t.nombre||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Capacidad</label>
            <p class="form-control-plaintext">${t.capacidad||`-`} personas</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Ubicación</label>
            <p class="form-control-plaintext">${M(n)}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Condición</label>
            <p class="form-control-plaintext">
              <span class="badge ${t.condicion===`excelente`?`bg-success`:t.condicion===`buena`?`bg-primary`:t.condicion===`regular`?`bg-warning`:`bg-danger`}">${r}</span>
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${a}">${i}</span>
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Equipamiento</label>
            <p class="form-control-plaintext">${M(t.equipamiento||`Sin equipamiento registrado`)}</p>
          </div>
        </div>
      </div>
      ${t.descripcion?`
      <hr>
      <div class="row">
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label fw-bold">Descripción</label>
            <p class="form-control-plaintext">${M(t.descripcion)}</p>
          </div>
        </div>
      </div>
      `:``}
      
      <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
        <button class="btn btn-outline-danger" id="modal-view-btn-delete">
          <i class="bi bi-trash me-1"></i> Inactivar
        </button>
        <button class="btn btn-primary" id="modal-view-btn-edit">
          <i class="bi bi-pencil me-1"></i> Editar
        </button>
      </div>
    `})}function Pt(e){let t=j.salones.find(t=>t.id===e);if(!t){v.error(`Salón no encontrado`);return}b.open({title:`⚠️ Inactivar Salón`,size:`sm`,saveText:`Inactivar`,body:`<p>¿Inactivar el salón <strong>${M(t.nombre)}</strong>?</p>
           <p class="text-muted small mb-0">Esta acción lo ocultará de las asignaciones de clases.</p>`,onSave:async()=>{await Dt(e),j.fetchSalones(),v.success(`Salón inactivado correctamente`)}})}function Ft(){S.register(`salones`,At)}function It(){S.register(`clases`,ve)}var N={timeline:[],periodos:[],periodoActivo:null,clases:[],resumenGlobal:null,cargando:!1,filtroPeriodo:null,filtroClase:`todas`,container:null};async function Lt(e){if(e)try{N.container=e,N.cargando=!0,zt(e);let[t,n,r]=await Promise.all([be(),re(),le()]);N.periodos=t,N.periodoActivo=n,n?.id?N.filtroPeriodo=n.id:t&&t.length>0?N.filtroPeriodo=t[0].id:N.filtroPeriodo=null,N.clases=r,console.log(`🔍 renderAsistenciasView init:`,{periodosCount:t?.length||0,periodoActivo:n?.nombre,filtroPeriodo:N.filtroPeriodo}),await Rt(),Vt(e),Gt(e)}catch(t){console.error(t),Bt(e,t.message)}}async function Rt(){let{timelineByDate:e,resumenGlobal:t}=await Se({periodoId:N.filtroPeriodo});N.timeline=e||[],N.resumenGlobal=t||{totalClases:0,totalPresentes:0,totalAusentes:0,totalJustificados:0,totalRegistros:0,totalSesiones:0}}function zt(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `}function Bt(e,t){e.innerHTML=`
    <div class="alert alert-danger m-3">
      <h5 class="alert-heading">Error al cargar asistencias</h5>
      <p>${x(t)}</p>
      <button class="btn btn-primary btn-sm" id="retry-btn">Reintentar</button>
    </div>
  `,e.querySelector(`#retry-btn`)?.addEventListener(`click`,()=>Lt(e))}function Vt(e){e.innerHTML=`
    <div class="page-container">
      <div class="asistencias-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-calendar-check fs-4"></i>
          </div>
          <div>
            <h1 class="asistencias-title-premium page-title mb-0">Asistencias</h1>
            <p class="text-muted small mb-0">${N.resumenGlobal?.totalRegistros||0} registros en total</p>
          </div>
        </div>
        <div class="asistencias-header-actions">
          <button class="btn btn-premium-action" id="btn-nueva-sesion">
            <i class="bi bi-plus-lg me-1.5"></i>Tomar Asistencia
          </button>
        </div>
      </div>

      <!-- Panel de Estadísticas Globales -->
      <div class="stats-panel mb-4">
        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-label">Total Registros</div>
            <div class="stat-value">${N.resumenGlobal?.totalRegistros||0}</div>
          </div>
          <div class="stat-card stat-present">
            <div class="stat-label">Presentes</div>
            <div class="stat-value">${N.resumenGlobal?.totalPresentes||0}</div>
          </div>
          <div class="stat-card stat-absent">
            <div class="stat-label">Ausentes</div>
            <div class="stat-value">${N.resumenGlobal?.totalAusentes||0}</div>
          </div>
          <div class="stat-card stat-justified">
            <div class="stat-label">Justificados</div>
            <div class="stat-value">${N.resumenGlobal?.totalJustificados||0}</div>
          </div>
          <div class="stat-card stat-sessions">
            <div class="stat-label">Sesiones</div>
            <div class="stat-value">${N.resumenGlobal?.totalSesiones||0}</div>
          </div>
        </div>
      </div>

      <div class="asistencias-filter-toolbar mb-4">
        <div class="premium-select-container" style="max-width: 250px;">
          <i class="bi bi-calendar3 select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-periodo">
            ${N.periodos.map(e=>`<option value="${e.id}" ${e.id===N.filtroPeriodo?`selected`:``}>${x(e.nombre)}</option>`).join(``)}
          </select>
        </div>
      </div>

      <!-- Acordeons por Día -->
      <div class="accordion accordion-asistencias" id="accordion-dias">
        ${Ht()}
      </div>
    </div>
  `}function Ht(){return N.timeline.length===0?`<div class="text-center py-5 text-muted"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay clases registradas.</div>`:N.timeline.map((e,t)=>{let n=Wt(e.fecha),r=`accordion-fecha-${t}`,i=e.clases.map((e,n)=>{let r=`accordion-clase-${t}-${n}`,i=e.hora_inicio?`${e.hora_inicio.slice(0,5)} - ${e.hora_fin?.slice(0,5)||`??:??`}`:`Sin horario`;return`
        <div class="accordion-item accordion-clase">
          <h2 class="accordion-header" id="heading-clase-${t}-${n}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${r}" aria-expanded="false" aria-controls="${r}">
              <div class="clase-header-info">
                <div class="clase-name">${x(e.clase_nombre)}</div>
                <div class="clase-meta">
                  <span class="horario">${i}</span>
                  <span class="maestro">Prof. ${x(e.maestro_nombre)}</span>
                  ${e.maestro_auxiliar_nombre?`<span class="auxiliar">Aux. ${x(e.maestro_auxiliar_nombre)}</span>`:``}
                </div>
              </div>
              <div class="clase-header-stats">
                <div class="stat-badge stat-present">
                  <span class="value">${e.presentes}</span>
                  <span class="label">P</span>
                </div>
                <div class="stat-badge stat-absent">
                  <span class="value">${e.ausentes}</span>
                  <span class="label">A</span>
                </div>
                <div class="stat-badge stat-justified">
                  <span class="value">${e.justificados}</span>
                  <span class="label">J</span>
                </div>
              </div>
            </button>
          </h2>
          <div id="${r}" class="accordion-collapse collapse" aria-labelledby="heading-clase-${t}-${n}">
            <div class="accordion-body">
              ${Ut(e)}
            </div>
          </div>
        </div>
      `}).join(``);return`
      <div class="accordion-item accordion-fecha">
        <h2 class="accordion-header" id="heading-fecha-${t}">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${r}" aria-expanded="true" aria-controls="${r}">
            <strong>${n}</strong>
            <span class="ms-auto text-muted small">${e.clases.length} clase${e.clases.length===1?``:`s`}</span>
          </button>
        </h2>
        <div id="${r}" class="accordion-collapse collapse show" aria-labelledby="heading-fecha-${t}">
          <div class="accordion-body p-0">
            <div class="accordion accordion-asistencias-clases">
              ${i}
            </div>
          </div>
        </div>
      </div>
    `}).join(``)}function Ut(e){let t=e.asistencias||[],n=t.filter(e=>e.estado===`presente`),r=t.filter(e=>e.estado===`ausente`),i=t.filter(e=>e.estado===`justificado`),a=(e,t,n)=>t.length===0?``:`
      <div class="mb-3">
        <h6 class="fw-bold mb-2">
          <span class="badge bg-${n} me-2">${t.length}</span>
          ${e}
        </h6>
        <div class="listado-alumnos ps-3" style="border-left: 2px solid #dee2e6; padding-left: 1rem;">
          ${t.map((e,n)=>`
            <div class="alumno-item mb-2">
              <span style="color: #6c757d; margin-right: 0.5rem;">
                ${n===t.length-1?`└─`:`├─`}
              </span>
              <span>${x(e.alumno_nombre||`Sin nombre`)}</span>
            </div>
          `).join(``)}
        </div>
      </div>
    `;return`
    <div class="clase-details-container">
      <!-- Listado de Alumnos por Estado -->
      <div class="alumnos-por-estado mb-4">
        ${a(`Presentes`,n,`success`)}
        ${a(`Ausentes`,r,`danger`)}
        ${a(`Justificados`,i,`warning`)}
      </div>

      <!-- Observaciones del Maestro -->
      ${e.observacion_sesion||e.observacion_clase||e.tema_principal?`
        <div class="observaciones-section border-top pt-3">
          <h6 class="fw-bold mb-2"><i class="bi bi-chat-left-text me-2"></i>Observaciones de la Clase</h6>
          <div class="alert alert-light border">
            <p class="mb-0 text-secondary">
              ${x(e.observacion_sesion||e.observacion_clase||`Sin observaciones registradas`)}
            </p>
          </div>
        </div>
      `:`
        <div class="text-muted small text-center py-3">
          <i class="bi bi-info-circle me-2"></i>No hay observaciones registradas para esta clase.
        </div>
      `}
    </div>
  `}function Wt(e){return new Date(e+`T12:00:00`).toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`})}function Gt(e){e.querySelector(`#select-periodo`)?.addEventListener(`change`,async e=>{N.filtroPeriodo=e.target.value,await Kt()}),e.querySelector(`#accordion-dias`)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="view-detail"]`);t&&qt(t.dataset.id)}),e.querySelector(`#btn-nueva-sesion`)?.addEventListener(`click`,()=>Jt())}async function Kt(){let e=N.container;v.info(`Cargando asistencias...`),await Rt();let t=e.querySelector(`.asistencias-header-premium p.text-muted`);t&&(t.textContent=`${N.resumenGlobal?.totalRegistros||0} registros en total`);let n=e.querySelector(`.stats-panel`);n&&(n.innerHTML=`
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <div class="stat-label">Total Registros</div>
          <div class="stat-value">${N.resumenGlobal?.totalRegistros||0}</div>
        </div>
        <div class="stat-card stat-present">
          <div class="stat-label">Presentes</div>
          <div class="stat-value">${N.resumenGlobal?.totalPresentes||0}</div>
        </div>
        <div class="stat-card stat-absent">
          <div class="stat-label">Ausentes</div>
          <div class="stat-value">${N.resumenGlobal?.totalAusentes||0}</div>
        </div>
        <div class="stat-card stat-justified">
          <div class="stat-label">Justificados</div>
          <div class="stat-value">${N.resumenGlobal?.totalJustificados||0}</div>
        </div>
        <div class="stat-card stat-sessions">
          <div class="stat-label">Sesiones</div>
          <div class="stat-value">${N.resumenGlobal?.totalSesiones||0}</div>
        </div>
      </div>
    `);let r=e.querySelector(`#accordion-dias`);r&&(r.innerHTML=Ht()),Gt(e),v.success(`Asistencias cargadas`)}async function qt(e){v.info(`Cargando detalle...`);try{let t=await ce(e);b.open({title:`Sesión: ${t.sesion.claseNombre}`,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
        <div class="row g-4">
          <div class="col-md-8">
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Tema Principal</label>
            <p class="fw-semibold">${x(t.sesion.temaPrincipal||`No especificado`)}</p>
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Observaciones Generales</label>
            <p class="text-secondary small">${x(t.sesion.observacionesGenerales||`Sin observaciones.`)}</p>
          </div>
          <div class="col-md-4 bg-body-tertiary p-3 rounded">
            <div class="d-flex justify-content-between mb-2"><span>Fecha:</span> <strong>${t.sesion.fecha}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${(t.sesion.horaInicio||`--:--`).slice(0,5)} - ${(t.sesion.horaFin||`--:--`).slice(0,5)}</strong></div>
            <div class="d-flex justify-content-between"><span>Maestro:</span> <strong>${x(t.sesion.maestroNombre)}</strong></div>
          </div>
          <div class="col-12">
            <h6 class="fw-bold border-bottom pb-2 mb-3">Listado de Asistencia</h6>
            <div class="table-responsive">
              <table class="table table-compact">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th class="text-center">Estado</th>
                    <th>Observaciones / Justificación</th>
                  </tr>
                </thead>
                <tbody>
                  ${t.asistencias.map(e=>`
                    <tr>
                      <td>${x(e.alumnoNombre)}</td>
                      <td class="text-center">
                        <span class="badge bg-${me[e.estado]?.css||`secondary`}">${me[e.estado]?.label||e.estado}</span>
                      </td>
                      <td class="small text-muted">${x(e.observacion||e.justificacionTexto||`-`)}</td>
                    </tr>
                  `).join(``)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `})}catch(e){v.error(`Error al cargar detalle: `+e.message)}}async function Jt(){v.info(`Funcionalidad de toma manual en desarrollo. Use el flujo desde la Ruta Gamificada.`)}function P({titulo:e,valor:t,subtitulo:n,colorClass:r=`primary`,icono:i,tendencia:a}){let o=a&&[`subiendo`,`bajando`,`estable`].includes(a),s=a===`subiendo`?`↑`:a===`bajando`?`↓`:`→`,c=a===`subiendo`?`text-success`:a===`bajando`?`text-danger`:`text-muted`;return`
    <div class="card kpi-card h-100 border-0 border-start border-4 border-${r} shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="card-subtitle text-muted text-uppercase small fw-bold mb-0" style="font-size: 0.65rem; letter-spacing: 0.05em;">${e}</h6>
          ${i?`<i class="bi ${i} text-${r} fs-4"></i>`:``}
        </div>
        <div class="d-flex align-items-baseline gap-2">
          <h3 class="card-title mb-0 fw-bold">${t}</h3>
          ${o?`<span class="small ${c} fw-bold" style="font-size: 0.8rem;">${s}</span>`:``}
        </div>
        ${n?`<p class="card-text text-muted small mb-0 mt-1" style="font-size: 0.75rem;">${n}</p>`:``}
      </div>
    </div>
  `}var F={periodoActivo:null,periodos:[],datos:{programas:{},niveles:{},totales:{sesiones:0,presentes:0,ausentes:0,justificados:0}},cargando:!1};async function Yt(e){F.cargando=!0,e.innerHTML=Xt(),await Zt(),F.cargando=!1,$t(e)}function Xt(){return`
    <div class="admin-report-view">
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="text-muted">Cargando reportes de asistencia...</p>
      </div>
    </div>
  `}async function Zt(){let[e,t]=await Promise.all([be(),re()]);F.periodos=e,F.periodoActivo=t,t&&(F.datos=Qt(await ae({periodoId:t.id})))}function Qt(e){let t={},n={},r=0,i=0,a=0,o=0;for(let s of e)for(let e of s.sesiones){let s=e.claseNombre?.split(`-`)[0]?.trim()||`General`,c=e.instrumento||`General`;t[s]||(t[s]={total:0,presentes:0,ausentes:0,justificados:0}),t[s].total+=e.totalRegistros||0,t[s].presentes+=e.totalPresentes||0,t[s].ausentes+=e.totalAusentes||0,t[s].justificados+=e.totalJustificados||0,n[c]||(n[c]={total:0,presentes:0,ausentes:0,justificados:0}),n[c].total+=e.totalRegistros||0,n[c].presentes+=e.totalPresentes||0,n[c].ausentes+=e.totalAusentes||0,n[c].justificados+=e.totalJustificados||0,r++,i+=e.totalPresentes||0,a+=e.totalAusentes||0,o+=e.totalJustificados||0}return{programas:t,niveles:n,totales:{sesiones:r,presentes:i,ausentes:a,justificados:o}}}function $t(e){let{programas:t,niveles:n,totales:r}=F.datos,i=r.presentes+r.ausentes+r.justificados?Math.round(r.presentes/i*100):0;e.innerHTML=`
    <div class="page-container py-3">
      <div class="asistencias-reportes-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-graph-up fs-4"></i>
          </div>
          <div>
            <h1 class="asistencias-reportes-title-premium page-title mb-0">Reportes de Asistencia</h1>
            <p class="text-muted small mb-0">Panel administrativo de análisis de asistencia</p>
          </div>
        </div>
        
        <div class="asistencias-reportes-header-actions">
          <button class="btn btn-outline-success btn-sm-compact me-2" id="exportXlsx">
            <i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel
          </button>
          <button class="btn btn-outline-danger btn-sm-compact" id="exportPdf">
            <i class="bi bi-file-earmark-pdf me-1"></i>PDF
          </button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">${P({titulo:`Sesiones`,valor:r.sesiones,colorClass:`primary`,icono:`bi-calendar3`})}</div>
        <div class="col-md-3">${P({titulo:`Tasa Asistencia`,valor:`${i}%`,colorClass:i>=80?`success`:i>=50?`warning`:`danger`,icono:`bi-check-circle`})}</div>
        <div class="col-md-3">${P({titulo:`Ausentes`,valor:r.ausentes,colorClass:`danger`,icono:`bi-x-circle`})}</div>
        <div class="col-md-3">${P({titulo:`Justificados`,valor:r.justificados,colorClass:`warning`,icono:`bi-file-earmark-check`})}</div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-pie-chart me-2"></i>Por Programa</h5>
            </div>
            <div class="card-body" id="programasChart">
              ${en(t,`programa`)}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-bar-chart me-2"></i>Por Instrumento/Nivel</h5>
            </div>
            <div class="card-body" id="nivelesChart">
              ${en(n,`nivel`)}
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mt-2">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-list-ul me-2"></i>Detalle por Programa</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Programa</th>
                      <th class="text-center">Total Registros</th>
                      <th class="text-center">Presentes</th>
                      <th class="text-center">Ausentes</th>
                      <th class="text-center">Justificados</th>
                      <th class="text-center">Tasa</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(t).map(([e,t])=>{let n=t.presentes+t.ausentes+t.justificados,r=n?Math.round(t.presentes/n*100):0;return`
                        <tr>
                          <td class="fw-semibold">${e}</td>
                          <td class="text-center">${n}</td>
                          <td class="text-center text-success">${t.presentes}</td>
                          <td class="text-center text-danger">${t.ausentes}</td>
                          <td class="text-center text-warning">${t.justificados}</td>
                          <td class="text-center">
                            <span class="badge bg-${r>=80?`success`:r>=50?`warning`:`danger`}">${r}%</span>
                          </td>
                        </tr>
                      `}).join(``)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function en(e,t){if(!Object.keys(e).length)return`<p class="text-muted text-center py-3">Sin datos disponibles</p>`;let n=Object.entries(e).sort((e,t)=>t[1].presentes+t[1].ausentes-(e[1].presentes+e[1].ausentes));return Math.max(...n.map(([,e])=>e.presentes+e.ausentes+e.justificados)),n.slice(0,8).map(([e,t])=>{let n=t.presentes+t.ausentes+t.justificados,r=n?t.presentes/n*100:0,i=n?t.ausentes/n*100:0,a=n?t.justificados/n*100:0;return`
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span class="small fw-semibold">${e}</span>
          <span class="small text-muted">${n} registros</span>
        </div>
        <div class="progress" style="height: 20px; border-radius: 4px;">
          <div class="progress-bar bg-success" style="width: ${r}%">${r>15?Math.round(r)+`%`:``}</div>
          <div class="progress-bar bg-danger" style="width: ${i}%">${i>15?Math.round(i)+`%`:``}</div>
          <div class="progress-bar bg-warning" style="width: ${a}%">${a>15?Math.round(a)+`%`:``}</div>
        </div>
      </div>
    `}).join(``)}function tn(){S.register(`asistencias`,Lt),S.register(`asistencias-reportes`,Yt)}window.location.href.includes(`supabase`);async function nn(e){let{data:t,error:n}=await _.from(`cobertura_alumno_objetivo`).upsert(e,{onConflict:`alumno_id,objetivo_id`}).select();if(n)throw n;return t}async function rn(e){let{data:t,error:n}=await _.from(`cobertura_alumno_objetivo`).select(`
      id, nivel, confirmado, fecha, plan_id, objetivo_id,
      curriculo_objetivos ( id, descripcion, pilar_id,
        curriculo_pilares ( id, nombre )
      )
    `).eq(`alumno_id`,e);if(n)throw n;return t||[]}async function an(e,t,n){let r=`Eres un asistente pedagógico musical. Dado el contenido de un plan de clase y una lista de objetivos curriculares, identifica cuáles objetivos probablemente se cubrieron.

Plan de clase:
- Tema: ${e.tema}
- Objetivos escritos por el maestro: ${e.objetivos||`(ninguno)`}
- Contenido: ${e.contenido||`(ninguno)`}
- Notas DSL: ${e.notas_dsl||`(ninguno)`}

Alumnos mencionados: ${t.join(`, `)||`(ninguno)`}

Objetivos curriculares a evaluar:
${n.map(e=>`- id:${e.id} → ${e.descripcion}`).join(`
`)}

Responde SOLO en JSON válido con este formato exacto:
{
  "coberturas": [
    { "alumno": "nombre", "objetivo_id": "uuid", "nivel": "iniciando|en_proceso|logrado", "razon": "breve justificación" }
  ]
}
Solo incluye objetivos que tengan evidencia real en el plan. No inventes coberturas. Si no hay evidencia clara, devuelve coberturas vacías.`;if(m.isDemoMode||!m.groq.apiKey)return{success:!0,coberturas:t.slice(0,2).flatMap(e=>n.slice(0,2).map(t=>({alumno:e,objetivo_id:t.id,nivel:`en_proceso`,razon:`Demo: objetivo relacionado con el tema`}))),isMock:!0};try{let e=await fetch(`${m.groq.endpoint}/chat/completions`,{method:`POST`,headers:{Authorization:`Bearer ${m.groq.apiKey}`,"Content-Type":`application/json`},body:JSON.stringify({model:m.groq.model,messages:[{role:`user`,content:r}],max_tokens:1500,temperature:.3,response_format:{type:`json_object`}})});if(!e.ok){let t=await e.json();throw Error(t.error?.message||`Error GROQ extraerCobertura`)}let t=await e.json();return{success:!0,coberturas:JSON.parse(t.choices[0]?.message?.content||`{"coberturas":[]}`).coberturas||[],isMock:!1}}catch(e){return console.error(`extraerCobertura error:`,e),{success:!1,coberturas:[],error:e.message}}}async function on(e,t,n){let r=`Eres un asistente pedagógico musical. Genera un borrador de plan de clase personalizado.

Alumno: ${e.nombre}, instrumento: ${e.instrumento}, nivel: ${e.nivel}

Objetivos pendientes del currículo (priorizar estos):
${t.map(e=>`- ${e.descripcion}`).join(`
`)||`(sin objetivos pendientes registrados)`}

Últimas clases trabajadas (no repetir):
${n.join(`, `)||`(ninguna)`}

Responde SOLO en JSON válido con este formato exacto:
{
  "tema": "...",
  "objetivos": "...",
  "contenido": "...",
  "recursos": ["..."]
}
Sé específico y pedagógicamente relevante para el instrumento y nivel.`;if(m.isDemoMode||!m.groq.apiKey)return{success:!0,plan:{tema:`Clase de ${e.instrumento} — Nivel ${e.nivel}`,objetivos:t[0]?.descripcion||`Repaso general`,contenido:`Ejercicios de calentamiento, escala mayor, pieza del repertorio.`,recursos:[`Partitura del repertorio`,`Metrónomo`]},isMock:!0};try{let e=await fetch(`${m.groq.endpoint}/chat/completions`,{method:`POST`,headers:{Authorization:`Bearer ${m.groq.apiKey}`,"Content-Type":`application/json`},body:JSON.stringify({model:m.groq.model,messages:[{role:`user`,content:r}],max_tokens:800,temperature:.7,response_format:{type:`json_object`}})});if(!e.ok){let t=await e.json();throw Error(t.error?.message||`Error GROQ sugerirPlan`)}let t=await e.json();return{success:!0,plan:JSON.parse(t.choices[0]?.message?.content||`{}`),isMock:!1}}catch(e){return console.error(`sugerirPlan error:`,e),{success:!1,plan:null,error:e.message}}}async function sn(e,t,n,r){let i=`Eres un mentor pedagógico musical. Analiza el trabajo de un maestro y da retroalimentación constructiva.

Instrumento principal: ${e}

Currículo de referencia:
${n?.curriculo_pilares?.map(e=>`Pilar "${e.nombre}": ${e.curriculo_objetivos?.map(e=>e.descripcion).join(`; `)}`).join(`
`)||`(sin currículo definido)`}

Planes ejecutados (últimas 8 semanas):
${t.map((e,t)=>`Clase ${t+1}: ${e.tema} — ${e.contenido||e.objetivos||``}`).join(`
`)||`(ninguno)`}

Cobertura de objetivos actual:
${r||`(sin datos)`}

Escribe 2-3 párrafos:
1. Fortalezas del enfoque actual
2. Áreas del currículo que podrían reforzarse
3. Sugerencias concretas para próximas semanas

Tono: colega experto, respetuoso, propositivo. Sin tecnicismos innecesarios. Responde en español.`;if(m.isDemoMode||!m.groq.apiKey)return{success:!0,feedback:`Tu enfoque en las últimas semanas muestra consistencia y dedicación. Se nota claridad en la presentación de contenidos técnicos.

Hay oportunidad de ampliar el trabajo en repertorio variado y lectura a primera vista, áreas que aparecen menos frecuentes en los planes recientes.

Para las próximas semanas, te sugiero incorporar al menos una pieza nueva por mes y dedicar 5-10 minutos de cada clase a ejercicios de lectura rítmica.`,isMock:!0};try{let e=await fetch(`${m.groq.endpoint}/chat/completions`,{method:`POST`,headers:{Authorization:`Bearer ${m.groq.apiKey}`,"Content-Type":`application/json`},body:JSON.stringify({model:m.groq.model,messages:[{role:`user`,content:i}],max_tokens:600,temperature:.8})});if(!e.ok){let t=await e.json();throw Error(t.error?.message||`Error GROQ analizarEnfoque`)}return{success:!0,feedback:(await e.json()).choices[0]?.message?.content?.trim()||``,isMock:!1}}catch(e){return console.error(`analizarEnfoque error:`,e),{success:!1,feedback:``,error:e.message}}}var cn=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),ln=`
<style id="cobertura-modal-style">
.cob-alumno-block { border: 1px solid var(--bs-border-color); border-radius:8px; padding:.75rem; margin-bottom:.75rem; }
.cob-alumno-name { font-weight:600; margin-bottom:.5rem; }
.cob-obj-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.25rem; font-size:.875rem; }
.cob-nivel-sel { width: auto; font-size:.8rem; }
.cob-ai-badge { font-size:.7rem; color: var(--bs-warning-text-emphasis); }
</style>`;async function un({plan:e,claseId:t,instrumento:n,nivel:r,maestroId:i,onConfirm:a,onSkip:s}){let l=document.createElement(`div`);l.innerHTML=`${ln}
    <div class="modal fade" id="cob-modal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-check2-circle me-2 text-success"></i>Cobertura Curricular</h5>
          </div>
          <div class="modal-body" id="cob-body">
            <div class="text-center py-5">
              <div class="spinner-border text-primary mb-3"></div>
              <div class="text-muted small">Analizando el plan con IA...</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary btn-sm" id="cob-btn-skip">Saltar</button>
            <button class="btn btn-success btn-sm" id="cob-btn-confirm" disabled>
              <i class="bi bi-check2 me-1"></i>Confirmar y ejecutar
            </button>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(l);let u=l.querySelector(`#cob-modal`),d=new bootstrap.Modal(u),f=[];l.querySelector(`#cob-btn-skip`).addEventListener(`click`,()=>{d.hide(),s?.()}),l.querySelector(`#cob-btn-confirm`).addEventListener(`click`,async()=>{let t=f.filter(e=>e.checked).map(t=>({alumno_id:t.alumno_id,objetivo_id:t.objetivo_id,plan_id:e.id,maestro_id:i,nivel:t.nivel,confirmado:!0,fecha:e.fecha_inicio||new Date().toISOString().slice(0,10)}));try{t.length>0&&await nn(t),v.success(`Cobertura registrada`),d.hide(),a?.()}catch(e){v.error(e.message)}}),u.addEventListener(`hidden.bs.modal`,()=>l.remove()),d.show();try{let i=n&&r?await o(n,r):null,a=c(e.notas_dsl||e.contenido||``).alumnos||[],s=[];if(a.length>0||t){let{data:e}=await _.from(`alumnos`).select(`id, nombre_completo`);a.length>0&&(s=(e||[]).filter(e=>a.some(t=>e.nombre_completo.toLowerCase().includes(t.toLowerCase()))))}if(s.length===0&&t){let{data:e}=await _.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,t);s=(e||[]).map(e=>e.alumnos).filter(Boolean)}let u=i?i.curriculo_pilares.flatMap(e=>e.curriculo_objetivos.map(t=>({...t,pilar_nombre:e.nombre}))):[],d=[];i&&u.length>0&&(d=(await an({tema:e.tema,objetivos:e.objetivos,contenido:e.contenido,notas_dsl:e.notas_dsl},a,u.map(e=>({id:e.id,descripcion:e.descripcion})))).coberturas||[]),f=[],s.forEach(e=>{u.forEach(t=>{let n=d.find(n=>n.objetivo_id===t.id&&e.nombre_completo.toLowerCase().includes((n.alumno||``).toLowerCase()));f.push({alumno_id:e.id,alumno_nombre:e.nombre_completo,objetivo_id:t.id,obj_descripcion:t.descripcion,pilar_nombre:t.pilar_nombre,nivel:n?.nivel||`en_proceso`,checked:!!n,ai_suggested:!!n,razon:n?.razon||``})})}),ee(),l.querySelector(`#cob-btn-confirm`).disabled=!1}catch(e){document.getElementById(`cob-body`).innerHTML=`
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se pudo analizar automáticamente: ${e.message}
        <br><small>Podés saltar este paso o confirmar sin cobertura.</small>
      </div>`,l.querySelector(`#cob-btn-confirm`).disabled=!1}function ee(){let e=document.getElementById(`cob-body`);if(!f.length){e.innerHTML=`
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No hay currículo activo para este instrumento/nivel, o no se encontraron alumnos.
          Podés saltar este paso.
        </div>`;return}let t={};f.forEach(e=>{t[e.alumno_id]||(t[e.alumno_id]={nombre:e.alumno_nombre,rows:[]}),t[e.alumno_id].rows.push(e)}),e.innerHTML=`
      <p class="text-muted small mb-3">
        <i class="bi bi-robot me-1"></i>
        La IA pre-marcó los objetivos que probablemente se cubrieron. Revisá y ajustá según corresponda.
      </p>
      ${Object.entries(t).map(([e,{nombre:t,rows:n}])=>`
        <div class="cob-alumno-block">
          <div class="cob-alumno-name"><i class="bi bi-person me-1"></i>${cn(t)}</div>
          ${n.map(e=>{let t=f.indexOf(e);return`
            <div class="cob-obj-row">
              <input type="checkbox" class="form-check-input cob-check" data-idx="${t}" ${e.checked?`checked`:``}>
              <span style="flex:1">
                <span class="text-muted small">${cn(e.pilar_nombre)} /</span> ${cn(e.obj_descripcion)}
                ${e.ai_suggested?`<span class="cob-ai-badge ms-1"><i class="bi bi-stars"></i> IA</span>`:``}
              </span>
              <select class="form-select form-select-sm cob-nivel-sel" data-idx="${t}" ${e.checked?``:`disabled`}>
                <option value="iniciando" ${e.nivel===`iniciando`?`selected`:``}>Iniciando</option>
                <option value="en_proceso" ${e.nivel===`en_proceso`?`selected`:``}>En proceso</option>
                <option value="logrado" ${e.nivel===`logrado`?`selected`:``}>Logrado</option>
              </select>
            </div>`}).join(``)}
        </div>`).join(``)}`,e.querySelectorAll(`.cob-check`).forEach(t=>{t.addEventListener(`change`,()=>{let n=+t.dataset.idx;f[n].checked=t.checked;let r=e.querySelector(`.cob-nivel-sel[data-idx="${n}"]`);r&&(r.disabled=!t.checked)})}),e.querySelectorAll(`.cob-nivel-sel`).forEach(e=>{e.addEventListener(`change`,()=>{f[+e.dataset.idx].nivel=e.value})})}}var I=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);async function dn(e){e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-robot fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Asistente IA</h1>
          <p class="text-muted small mb-0">Análisis curricular personalizado para tus alumnos</p>
        </div>
      </div>

      <!-- Block 1: Gap analysis -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-bar-chart-line text-primary"></i>
          <span class="fw-semibold">Análisis de brechas por alumno</span>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label-compact">Seleccionar alumno</label>
            <select class="form-select form-select-sm" id="ap-alumno-sel" style="max-width:300px">
              <option value="">Cargando alumnos...</option>
            </select>
          </div>
          <div id="ap-brechas-content">
            <p class="text-muted small">Seleccioná un alumno para ver su cobertura curricular.</p>
          </div>
        </div>
      </div>

      <!-- Block 2: Draft next class -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-magic text-success"></i>
          <span class="fw-semibold">Borrador para próxima clase</span>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-3">Generá un borrador de plan basado en los objetivos pendientes del alumno seleccionado.</p>
          <button class="btn btn-outline-success btn-sm" id="ap-btn-draft" disabled>
            <i class="bi bi-stars me-1"></i>Generar borrador
          </button>
          <div id="ap-draft-content" class="mt-3"></div>
        </div>
      </div>

      <!-- Block 3: Qualitative feedback -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-lightbulb text-warning"></i>
          <span class="fw-semibold">Retroalimentación pedagógica</span>
        </div>
        <div class="card-body">
          <p class="text-muted small mb-3">Análisis de tu enfoque pedagógico basado en los últimos 2 meses de clases.</p>
          <button class="btn btn-outline-warning btn-sm" id="ap-btn-feedback">
            <i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque
          </button>
          <div id="ap-feedback-content" class="mt-3"></div>
        </div>
      </div>
    </div>`;let t={alumnos:[],selectedAlumnoId:null,selectedAlumno:null,cobertura:[],curriculo:null,maestroId:null,instrumento:null},{data:{user:n}}=await _.auth.getUser(),{data:r}=await _.from(`maestros`).select(`id, instrumento`).eq(`user_id`,n.id).single();t.maestroId=r?.id,t.instrumento=r?.instrumento;let{data:i}=await _.from(`alumnos_clases`).select(`alumnos(id, nombre_completo), clases(instrumento, plan_estudio, maestro_principal_id)`).eq(`clases.maestro_principal_id`,t.maestroId),a={};(i||[]).forEach(e=>{e.alumnos&&e.clases&&(a[e.alumnos.id]={...e.alumnos,instrumento:e.clases.instrumento,nivel:e.clases.plan_estudio})}),t.alumnos=Object.values(a);let s=e.querySelector(`#ap-alumno-sel`);s.innerHTML=`<option value="">Seleccionar alumno...</option>`+t.alumnos.map(e=>`<option value="${e.id}">${I(e.nombre_completo)}</option>`).join(``),s.addEventListener(`change`,async()=>{let n=s.value;if(!n){e.querySelector(`#ap-brechas-content`).innerHTML=`<p class="text-muted small">Seleccioná un alumno.</p>`,e.querySelector(`#ap-btn-draft`).disabled=!0,t.selectedAlumnoId=null,t.selectedAlumno=null;return}t.selectedAlumnoId=n,t.selectedAlumno=t.alumnos.find(e=>e.id===n),e.querySelector(`#ap-btn-draft`).disabled=!1,await c()});async function c(){let n=e.querySelector(`#ap-brechas-content`);n.innerHTML=`<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-muted"></div></div>`;try{let e=t.selectedAlumno;if(t.curriculo=e.instrumento&&e.nivel?await o(e.instrumento,e.nivel):null,!t.curriculo){n.innerHTML=`<div class="alert alert-secondary py-2 small">Sin guía curricular definida para <strong>${I(e.instrumento||`este instrumento`)}</strong> — <strong>${I(e.nivel||`este nivel`)}</strong>.</div>`;return}t.cobertura=await rn(t.selectedAlumnoId);let r={};t.cobertura.forEach(e=>{let t=e.curriculo_objetivos?.id||e.objetivo_id;t&&(r[t]=e)});let i=t.curriculo.curriculo_pilares.flatMap(e=>e.curriculo_objetivos.map(t=>({...t,pilar_nombre:e.nombre}))),a=i.filter(e=>r[e.id]?.nivel===`logrado`).length,s=i.filter(e=>r[e.id]&&r[e.id].nivel!==`logrado`).length;n.innerHTML=`
        <div class="mb-3">
          <span class="badge bg-success me-1">${a} logrados</span>
          <span class="badge bg-warning text-dark me-1">${s} en proceso</span>
          <span class="badge bg-secondary me-1">${i.length-a-s} no iniciados</span>
          <span class="text-muted small">de ${i.length} objetivos totales</span>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle small">
            <thead class="table-light">
              <tr><th>Pilar</th><th>Objetivo</th><th>Estado</th><th>Fuente</th></tr>
            </thead>
            <tbody>
              ${i.map(e=>{let t=r[e.id],n=t?.nivel||`no_iniciado`,i=n===`logrado`?`<span class="badge bg-success">✓ Logrado</span>`:n===`en_proceso`?`<span class="badge bg-warning text-dark">⟳ En proceso</span>`:n===`iniciando`?`<span class="badge bg-info text-dark">Iniciando</span>`:`<span class="badge bg-secondary">○ No iniciado</span>`,a=t?t.confirmado?`<i class="bi bi-check-circle text-success" title="Confirmado por maestro"></i>`:`<i class="bi bi-stars text-warning" title="Sugerido por IA"></i>`:`—`;return`<tr>
                  <td class="text-muted">${I(e.pilar_nombre)}</td>
                  <td>${I(e.descripcion)}</td>
                  <td>${i}</td>
                  <td class="text-center">${a}</td>
                </tr>`}).join(``)}
            </tbody>
          </table>
        </div>`}catch(e){n.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}}e.querySelector(`#ap-btn-draft`).addEventListener(`click`,async()=>{if(!t.selectedAlumno)return;let n=e.querySelector(`#ap-btn-draft`),r=e.querySelector(`#ap-draft-content`);n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Generando...`,r.innerHTML=``;try{let n=t.selectedAlumno,i=t.curriculo?.curriculo_pilares?.flatMap(e=>e.curriculo_objetivos.map(e=>e))||[],a={};t.cobertura.forEach(e=>{let t=e.curriculo_objetivos?.id||e.objetivo_id;t&&(a[t]=e)});let o=i.filter(e=>!a[e.id]||a[e.id].nivel!==`logrado`),{data:s}=await _.from(`planificaciones`).select(`tema`).eq(`maestro_id`,t.maestroId).eq(`estado`,`ejecutado`).order(`created_at`,{ascending:!1}).limit(3),c=(s||[]).map(e=>e.tema),l=await on({nombre:n.nombre_completo,instrumento:n.instrumento||`(sin instrumento)`,nivel:n.nivel||`(sin nivel)`},o,c);if(!l.success||!l.plan)throw Error(l.error||`Sin respuesta de la IA`);let u=l.plan;r.innerHTML=`
        <div class="card border-success border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-success bg-opacity-15 text-success">Borrador generado por IA</span>
              <button class="btn btn-sm btn-success" id="ap-btn-save-draft">
                <i class="bi bi-floppy me-1"></i>Guardar como plan
              </button>
            </div>
            <div class="mb-2"><span class="fw-semibold">Tema:</span> ${I(u.tema||``)}</div>
            <div class="mb-2"><span class="fw-semibold">Objetivos:</span> ${I(u.objetivos||``)}</div>
            <div class="mb-2"><span class="fw-semibold">Contenido:</span> ${I(u.contenido||``)}</div>
            ${u.recursos?.length?`<div><span class="fw-semibold">Recursos:</span> ${u.recursos.map(e=>`<span class="badge bg-light text-dark border me-1">${I(e)}</span>`).join(``)}</div>`:``}
          </div>
        </div>`,e.querySelector(`#ap-btn-save-draft`)?.addEventListener(`click`,()=>{document.dispatchEvent(new CustomEvent(`planificacion:nuevoPlan`,{detail:{tema:u.tema,objetivos:u.objetivos,contenido:u.contenido}})),v.success(`Borrador listo — abrí "Nuevo plan" para completar los detalles`)})}catch(e){r.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}finally{n.disabled=!1,n.innerHTML=`<i class="bi bi-stars me-1"></i>Generar borrador`}}),e.querySelector(`#ap-btn-feedback`).addEventListener(`click`,async()=>{let n=e.querySelector(`#ap-btn-feedback`),r=e.querySelector(`#ap-feedback-content`);n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Analizando...`,r.innerHTML=``;try{let n=new Date;n.setDate(n.getDate()-56);let{data:i}=await _.from(`planificaciones`).select(`tema, contenido, objetivos, instrumento`).eq(`maestro_id`,t.maestroId).eq(`estado`,`ejecutado`).gte(`created_at`,n.toISOString()),a=t.instrumento||i?.[0]?.instrumento||`Instrumento`,s=null;try{s=a?await o(a,null):null}catch{}let c=t.selectedAlumnoId&&t.selectedAlumno?`Alumno seleccionado: ${t.selectedAlumno.nombre_completo}. ${t.cobertura.length} objetivos trabajados.`:`No hay alumno seleccionado.`,l=await sn(a,i||[],s,c);if(!l.success)throw Error(l.error||`Sin respuesta de la IA`);r.innerHTML=`
        <div class="card border-warning border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge bg-warning bg-opacity-15 text-warning-emphasis">Análisis pedagógico</span>
              <button class="btn btn-sm btn-outline-secondary" id="ap-btn-regenerate">
                <i class="bi bi-arrow-clockwise me-1"></i>Regenerar
              </button>
            </div>
            <div class="text-body" style="line-height:1.7; white-space:pre-line">${I(l.feedback)}</div>
          </div>
        </div>`,e.querySelector(`#ap-btn-regenerate`)?.addEventListener(`click`,()=>{e.querySelector(`#ap-btn-feedback`).click()})}catch(e){r.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}finally{n.disabled=!1,n.innerHTML=`<i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque`}})}var fn=`
<style id="curriculo-modal-style">
.cm-pilar { border: 1px solid var(--bs-border-color); border-radius: 8px; margin-bottom: .75rem; }
.cm-pilar-header { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; background:var(--bs-tertiary-bg); border-radius:7px 7px 0 0; }
.cm-pilar-body { padding:.5rem .75rem; }
.cm-obj-row { display:flex; align-items:center; gap:.5rem; padding:.25rem 0; border-bottom: 1px solid var(--bs-border-color-translucent); }
.cm-obj-row:last-child { border-bottom: none; }
.cm-obj-input { flex:1; }
</style>`;function pn(e){let t=document.getElementById(`curriculo-list-modal`);t&&t.remove();let n=document.createElement(`div`);n.id=`curriculo-list-modal`,n.innerHTML=`${fn}
    <div class="modal fade" id="curriculo-list-modal-dialog" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-journal-bookmark me-2"></i>Gestión de Currículos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="cl-body">
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm text-muted"></div></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-sm" id="cl-btn-nuevo">
              <i class="bi bi-plus me-1"></i>Nuevo Currículo
            </button>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(n);let r=n.querySelector(`#curriculo-list-modal-dialog`),i=new bootstrap.Modal(r);async function o(){let e=document.getElementById(`cl-body`);try{let t=await a();if(t.length===0){e.innerHTML=`<p class="text-muted text-center py-4">No hay currículos creados aún.</p>`;return}e.innerHTML=`
        <table class="table table-sm table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Instrumento</th><th>Nivel</th><th>Objetivos</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>`
              <tr>
                <td class="fw-semibold">${e.instrumento}</td>
                <td>${e.nivel}</td>
                <td><span class="badge bg-secondary bg-opacity-15 text-secondary">${e.total_objetivos}</span></td>
                <td>
                  <div class="form-check form-switch mb-0">
                    <input class="form-check-input cl-toggle" type="checkbox" data-id="${e.id}" ${e.activo?`checked`:``}>
                  </div>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-secondary btn-icon-compact cl-btn-edit" data-id="${e.id}" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                </td>
              </tr>`).join(``)}
          </tbody>
        </table>`,e.querySelectorAll(`.cl-toggle`).forEach(e=>{e.addEventListener(`change`,async()=>{await l(e.dataset.id,e.checked),v.success(e.checked?`Currículo activado`:`Currículo desactivado`)})}),e.querySelectorAll(`.cl-btn-edit`).forEach(e=>{e.addEventListener(`click`,()=>hn(e.dataset.id,o))})}catch(t){e.innerHTML=`<p class="text-danger">${t.message}</p>`}}n.querySelector(`#cl-btn-nuevo`).addEventListener(`click`,()=>{mn(o)}),r.addEventListener(`hidden.bs.modal`,()=>{n.remove(),e?.()}),i.show(),o()}function mn(e){let n=document.createElement(`div`);n.innerHTML=`
    <div class="modal fade" id="cc-modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nuevo Currículo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Instrumento *</label>
              <input type="text" class="form-control" id="cc-instrumento" placeholder="ej. Guitarra">
            </div>
            <div class="mb-3">
              <label class="form-label">Nivel *</label>
              <input type="text" class="form-control" id="cc-nivel" placeholder="ej. inicial, intermedio, 1, 2...">
            </div>
            <div class="mb-3">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" id="cc-desc" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary btn-sm" id="cc-btn-save">Crear</button>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(n);let r=n.querySelector(`#cc-modal`),i=new bootstrap.Modal(r);n.querySelector(`#cc-btn-save`).addEventListener(`click`,async()=>{let r=n.querySelector(`#cc-instrumento`).value.trim(),a=n.querySelector(`#cc-nivel`).value.trim();if(!r||!a){v.error(`Instrumento y nivel son obligatorios`);return}try{await t({instrumento:r,nivel:a,descripcion:n.querySelector(`#cc-desc`).value.trim()}),v.success(`Currículo creado`),i.hide(),e?.()}catch(e){v.error(e.message)}}),r.addEventListener(`hidden.bs.modal`,()=>n.remove()),i.show()}async function hn(e,t){let{data:n,error:r}=await _.from(`curriculos`).select(`id, instrumento, nivel, descripcion, curriculo_pilares(id, nombre, orden, curriculo_objetivos(id, descripcion, orden))`).eq(`id`,e).single();if(r){v.error(r.message);return}let i=document.createElement(`div`);i.innerHTML=`
    <div class="modal fade" id="ce-modal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Editar: ${n.instrumento} — ${n.nivel}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ce-body"></div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(i);let a=i.querySelector(`#ce-modal`),o=new bootstrap.Modal(a);function s(){let e=document.getElementById(`ce-body`);e.innerHTML=`
      <div class="mb-3">
        <label class="form-label fw-semibold">Pilares</label>
        <div id="ce-pilares">
          ${(n.curriculo_pilares||[]).map(e=>`
            <div class="cm-pilar" data-pilar-id="${e.id}">
              <div class="cm-pilar-header">
                <input class="form-control form-control-sm flex-grow-1 pilar-nombre" value="${e.nombre}">
                <button class="btn btn-sm btn-outline-danger btn-icon-compact pilar-del" title="Eliminar pilar"><i class="bi bi-trash"></i></button>
              </div>
              <div class="cm-pilar-body">
                ${(e.curriculo_objetivos||[]).map(e=>`
                  <div class="cm-obj-row" data-obj-id="${e.id}">
                    <input class="form-control form-control-sm cm-obj-input obj-desc" value="${e.descripcion}">
                    <button class="btn btn-sm btn-outline-danger btn-icon-compact obj-del" title="Eliminar"><i class="bi bi-x"></i></button>
                  </div>`).join(``)}
                <div class="mt-2 d-flex gap-2">
                  <input class="form-control form-control-sm new-obj-input" placeholder="Nuevo objetivo...">
                  <button class="btn btn-sm btn-outline-primary btn-icon-compact new-obj-btn" title="Agregar"><i class="bi bi-plus"></i></button>
                </div>
              </div>
            </div>`).join(``)}
        </div>
        <button class="btn btn-outline-secondary btn-sm mt-2" id="ce-add-pilar">
          <i class="bi bi-plus me-1"></i>Agregar pilar
        </button>
      </div>`,e.querySelectorAll(`.pilar-nombre`).forEach(e=>{e.addEventListener(`blur`,async()=>{await fe(e.closest(`[data-pilar-id]`).dataset.pilarId,{nombre:e.value.trim()})})}),e.querySelectorAll(`.pilar-del`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-pilar-id]`).dataset.pilarId;confirm(`¿Eliminar este pilar y todos sus objetivos?`)&&(await ee(t),n.curriculo_pilares=n.curriculo_pilares.filter(e=>e.id!==t),s())})}),e.querySelectorAll(`.obj-desc`).forEach(e=>{e.addEventListener(`blur`,async()=>{await f(e.closest(`[data-obj-id]`).dataset.objId,{descripcion:e.value.trim()})})}),e.querySelectorAll(`.obj-del`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-obj-id]`),r=t.dataset.objId;await d(r);let i=t.closest(`[data-pilar-id]`).dataset.pilarId,a=n.curriculo_pilares.find(e=>e.id===i);a&&(a.curriculo_objetivos=a.curriculo_objetivos.filter(e=>e.id!==r)),s()})}),e.querySelectorAll(`.new-obj-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-pilar-id]`),r=t.dataset.pilarId,i=t.querySelector(`.new-obj-input`),a=i.value.trim();if(!a)return;let o=n.curriculo_pilares.find(e=>e.id===r),c=(o?.curriculo_objetivos||[]).length,l=await de(r,a,c);o&&(o.curriculo_objetivos=[...o.curriculo_objetivos||[],l]),i.value=``,s()})}),document.getElementById(`ce-add-pilar`)?.addEventListener(`click`,async()=>{let e=prompt(`Nombre del nuevo pilar:`);if(!e?.trim())return;let t=n.curriculo_pilares.length,r=await u(n.id,e.trim(),t);n.curriculo_pilares.push({...r,curriculo_objetivos:[]}),s()})}a.addEventListener(`hidden.bs.modal`,()=>{i.remove(),t?.()}),o.show(),s()}var gn=[{id:`escala`,nombre:`Escala Mayor`,instrumento:`Piano / Guitarra`,descripcion:`Trabajo de escalas diatónicas mayores en posición cerrada.`,contenido:`[Indicador] Ejecuta la escala de Do mayor en dos octavas con digitación correcta
[Indicador] Mantiene tempo estable con metrónomo a 60 bpm
{Actividad} Calentamiento de dedos: ejercicios de Hanon 5 min
{Actividad} Escala lenta con atención al peso del brazo
{Actividad} Escala en tempo progresivo hasta 80 bpm`},{id:`lectura`,nombre:`Lectura a Primera Vista`,instrumento:`General`,descripcion:`Desarrollar la capacidad de leer y ejecutar partituras sin preparación previa.`,contenido:`[Indicador] Lee correctamente las figuras rítmicas (negra, corchea, blanca)
[Indicador] Identifica la clave y armadura antes de comenzar
{Actividad} Análisis visual de 2 min antes de tocar
{Actividad} Ejecución a tempo lento sin parar
{Actividad} Revisión de errores y segunda lectura`},{id:`repertorio`,nombre:`Montaje de Repertorio`,instrumento:`General`,descripcion:`Proceso sistemático de aprendizaje de una obra musical.`,contenido:`[Indicador] Memoriza la estructura formal de la obra (A-B-A)
[Indicador] Ejecuta las secciones complejas de manera fluida
{Actividad} División por secciones: aprender A, luego B
{Actividad} Trabajo de manos separadas en pasajes difíciles
{Actividad} Ensamble y trabajo de empalmes entre secciones`},{id:`teoria`,nombre:`Teoría Musical Aplicada`,instrumento:`Teoría`,descripcion:`Integración de conceptos teóricos con la práctica instrumental.`,contenido:`[Indicador] Identifica intervalos en el instrumento (2da, 3ra, 4ta, 5ta)
[Indicador] Construye y ejecuta acordes mayores y menores
{Actividad} Dictado rítmico (4 compases)
{Actividad} Identificación auditiva de intervalos
{Actividad} Construcción de acordes en el instrumento`}],L={planes:[],planesOriginales:[],cargando:!1,viewMode:`maestro`,activeTab:`planes`,asistenteRendered:!1,seleccionados:new Set,container:null};async function R(e,{viewMode:t=`maestro`}={}){if(e){if(L.container=e,L.viewMode=t,L.seleccionados=new Set,L.asistenteRendered=!1,t===`plantillas`){Cn(e);return}try{L.cargando=!0,_n(e);let t=await r();L.planes=t,L.planesOriginales=[...t],L.cargando=!1,yn(e),Tn(e)}catch(t){console.error(`[planificacionView]`,t),vn(e,t.message)}}}function _n(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>`}function vn(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${x(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>planificaciones</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`}function yn(e){let t=L.viewMode===`admin`,n=t?`Todas las Planificaciones`:`Mis Planes de Clase`,r=t?`bi-shield-check`:`bi-journal-check`,i=t?`${L.planesOriginales.length} planes pendientes de revisión`:`${L.planesOriginales.length} planes registrados`,a=t?bn():``;e.innerHTML=`
    <div class="page-container">
      <!-- Header -->
      <div class="planificacion-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi ${r} fs-4"></i>
          </div>
          <div>
            <h1 class="planificacion-title-premium page-title mb-0">${n}</h1>
            <p class="text-muted small mb-0">${i}</p>
          </div>
        </div>
        <div class="planificacion-header-actions">
          <button class="btn-help-trigger" id="btn-help-planificacion" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          ${t?`
            <button class="btn btn-outline-secondary btn-sm" id="btn-curriculo-admin">
              <i class="bi bi-journal-bookmark me-1"></i>Currículo
            </button>
            <button class="btn btn-outline-success btn-sm" id="btn-aprobar-bulk" style="display:none">
              <i class="bi bi-check-all me-1"></i>Aprobar Seleccionados
            </button>
          `:`
            <button class="btn btn-premium-action" id="btn-nuevo-plan">
              <i class="bi bi-plus-lg me-1"></i>Nuevo Plan
            </button>
          `}
        </div>
      </div>

      ${a}

      <!-- Toolbar -->
      <div class="planificacion-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar por tema o clase..." id="buscar-plan">
        </div>
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-estado">
            <option value="">Todos los estados</option>
            ${h.getEstados().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
          </select>
        </div>
      </div>

      ${t?``:`
      <ul class="nav nav-tabs mb-3" id="planificacion-tabs">
        <li class="nav-item">
          <button class="nav-link active" data-tab="planes">
            <i class="bi bi-journal-text me-1"></i>
            Mis planes
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-tab="plantillas">
            <i class="bi bi-file-earmark-template me-1"></i>Plantillas
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-tab="asistente">
            <i class="bi bi-robot me-1"></i>Asistente IA
          </button>
        </li>
      </ul>
      `}

      <div id="tab-content-planes">
      <!-- Table -->
      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                ${t?`<th style="width:36px"><input type="checkbox" id="check-all" title="Seleccionar todos"></th>`:``}
                <th>Clase / Tema</th>
                ${t?`<th class="d-none d-md-table-cell">Maestro</th>`:``}
                <th class="d-none d-md-table-cell">Estado</th>
                <th class="d-none d-lg-table-cell">Fecha</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="planes-tbody">
              ${xn(L.planes)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${L.planes.length===0?Sn():``}</div>
      </div>
      </div>

      ${t?``:`
      <div id="tab-content-plantillas" style="display:none">
        <div class="alert alert-info border-0 py-3" style="font-size:0.875rem;">
          <i class="bi bi-file-earmark-template me-2"></i>
          Las plantillas de planificación estarán disponibles próximamente.
        </div>
      </div>
      <div id="tab-content-asistente" style="display:none"></div>
      `}
    </div>
  `}function bn(){let e=L.planesOriginales,t=e.filter(e=>e.estado===`ejecutado`).length,n=e.filter(e=>e.estado===`revisado`).length,r=e.length;return`
    <div class="stats-panel mb-4">
      <div class="stats-grid">
        <div class="stat-card border-start border-4 border-primary">
          <div class="stat-label">Total</div>
          <div class="stat-value">${r}</div>
        </div>
        <div class="stat-card border-start border-4 border-warning">
          <div class="stat-label">Pendientes revisión</div>
          <div class="stat-value">${t}</div>
        </div>
        <div class="stat-card border-start border-4 border-success">
          <div class="stat-label">Revisados</div>
          <div class="stat-value">${n}</div>
        </div>
        <div class="stat-card border-start border-4 border-info">
          <div class="stat-label">Tasa aprobación</div>
          <div class="stat-value">${r>0?Math.round(n/r*100):0}%</div>
        </div>
      </div>
    </div>
  `}function xn(e){if(!e||e.length===0)return``;let t=L.viewMode===`admin`;return e.map(e=>{let n=h.getEstadoConfig(e.estado),r=e.estado===`revisado`?`border-accent-success`:e.estado===`ejecutado`?`border-accent-warning`:`border-accent-secondary`;return`
      <tr data-id="${e.id}" class="border-start-accent ${r}">
        ${t?`<td><input type="checkbox" class="plan-check" value="${e.id}" ${L.seleccionados.has(e.id)?`checked`:``}></td>`:``}
        <td>
          <div class="fw-bold">${x(e.clase_nombre||`Sin clase`)}</div>
          <div class="small text-muted text-truncate" style="max-width: 260px">${x(e.tema)}</div>
        </td>
        ${t?`<td class="d-none d-md-table-cell align-middle small text-muted">${x(e.maestro_nombre||`N/A`)}</td>`:``}
        <td class="d-none d-md-table-cell align-middle">
          <span class="badge badge-compact ${n.color}">${n.label}</span>
        </td>
        <td class="d-none d-lg-table-cell text-muted small align-middle">${e.fecha_inicio||`-`}</td>
        <td class="text-end align-middle">
          <div class="quick-actions justify-content-end">
            ${t?``:`
              <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${e.id}" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
            `}
            ${t&&e.canApprove()?`
              <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="approve" data-id="${e.id}" title="Aprobar">
                <i class="bi bi-check-circle"></i>
              </button>
            `:``}
            ${!t&&e.estado===`planificado`?`
              <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="ejecutar" data-id="${e.id}" title="Marcar como ejecutado">
                <i class="bi bi-play-fill"></i>
              </button>
            `:``}
            <button class="btn btn-sm btn-outline-secondary btn-icon-compact" data-action="view" data-id="${e.id}" title="Ver detalle">
              <i class="bi bi-eye"></i>
            </button>
            ${e.isLocked()?``:`
              <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${e.id}" title="Eliminar">
                <i class="bi bi-trash"></i>
              </button>
            `}
          </div>
        </td>
      </tr>
    `}).join(``)}function Sn(){let e=L.viewMode===`admin`;return`
    <div class="text-center py-5 px-3">
      <i class="bi bi-journal-x text-muted d-block mb-3" style="font-size: 3rem; opacity: .4"></i>
      <h5 class="text-muted fw-normal mb-1">
        ${e?`No hay planificaciones registradas aún`:`Todavía no tenés planes de clase`}
      </h5>
      <p class="text-muted small mb-0">
        ${e?`Una vez que los maestros creen sus planes, aparecerán aquí para revisión.`:`Creá tu primer plan de clase usando el botón de arriba o usá una plantilla.`}
      </p>
    </div>
  `}function Cn(e){e.innerHTML=`
    <div class="page-container">
      <div class="planificacion-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-file-earmark-text fs-4"></i>
          </div>
          <div>
            <h1 class="planificacion-title-premium page-title mb-0">Plantillas de Planificación</h1>
            <p class="text-muted small mb-0">Plantillas listas para usar — seleccioná una y personalizala</p>
          </div>
        </div>
      </div>

      <div class="row g-3">
        ${gn.map(e=>`
          <div class="col-md-6">
            <div class="page-glass rounded p-4 h-100 d-flex flex-column">
              <div class="d-flex align-items-start gap-3 mb-3">
                <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px;height:40px">
                  <i class="bi bi-journal-text fs-5"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0">${x(e.nombre)}</h5>
                  <span class="badge bg-secondary bg-opacity-10 text-secondary border small">${x(e.instrumento)}</span>
                </div>
              </div>
              <p class="text-muted small flex-grow-1">${x(e.descripcion)}</p>
              <details class="mb-3">
                <summary class="small text-primary" style="cursor:pointer">Ver contenido DSL</summary>
                <pre class="mt-2 p-2 bg-body-tertiary rounded small border" style="font-size:.75rem;white-space:pre-wrap">${x(e.contenido)}</pre>
              </details>
              <button class="btn btn-outline-primary btn-sm" data-template-id="${e.id}">
                <i class="bi bi-plus-circle me-1"></i>Usar esta plantilla
              </button>
            </div>
          </div>
        `).join(``)}
      </div>
    </div>
  `,e.querySelectorAll(`button[data-template-id]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=gn.find(t=>t.id===e.dataset.templateId);t&&wn(t)})})}function wn(e){b.open({title:`Usar plantilla: ${e.nombre}`,saveText:`Crear Plan`,size:`lg`,body:`
      <form id="form-tpl" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="tpl-tema" value="${x(e.nombre)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="tpl-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="tpl-objetivos" rows="2">${x(e.descripcion)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido DSL</label>
          <textarea class="form-control input-dense font-monospace" id="tpl-contenido" rows="7">${x(e.contenido)}</textarea>
        </div>
      </form>
    `,onOpen:async e=>{let{data:t}=await _.from(`clases`).select(`id, nombre`).order(`nombre`),n=e.querySelector(`#tpl-clase_id`);n.innerHTML=`<option value="">Seleccionar clase...</option>`+(t||[]).map(e=>`<option value="${e.id}">${x(e.nombre)}</option>`).join(``)},onSave:async e=>{let t={tema:e.querySelector(`#tpl-tema`).value.trim(),clase_id:e.querySelector(`#tpl-clase_id`).value,objetivos:e.querySelector(`#tpl-objetivos`).value.trim(),contenido:e.querySelector(`#tpl-contenido`).value.trim()};try{return await xe(t),v.success(`Plan creado desde plantilla`),!0}catch(e){return v.error(e.message),!1}}})}function Tn(e){let t=L.viewMode===`admin`;e.querySelector(`#buscar-plan`)?.addEventListener(`input`,En),e.querySelector(`#select-estado`)?.addEventListener(`change`,En),e.querySelector(`#btn-help-planificacion`)?.addEventListener(`click`,()=>{pe.open({title:`Planificación`,intro:`Módulo para gestionar los planes de clase. Cada plan documenta qué se trabajará en una clase, en qué fecha, y si fue ejecutado o no.`,sections:[{icon:`bi-journal-text`,title:`Tab Mis planes`,description:`Lista tus planes personales. Filtrá por estado (planificado, ejecutado, cancelado) y creá nuevos desde "Nuevo plan".`,color:`#3b82f6`},{icon:`bi-file-earmark-template`,title:`Tab Plantillas`,description:`Plantillas reutilizables en formato DSL. Sirven como base para crear nuevos planes rápidamente.`,color:`#6366f1`},{icon:`bi-journal-check`,title:`Todas las planes (admin)`,description:`Solo visible para administradores. Muestra los planes de todos los maestros para supervisión.`,color:`#10b981`},{icon:`bi-circle-fill`,title:`Estados del plan`,description:`"Planificado" = no dictado aún. "Ejecutado" = clase dada. "Cancelado" = no se realizó. Mantenerlos actualizados mejora los reportes.`,color:`#f59e0b`}]})}),t||e.querySelector(`#btn-nuevo-plan`)?.addEventListener(`click`,()=>On(null)),t&&(e.querySelector(`#check-all`)?.addEventListener(`change`,t=>{let n=t.target.checked;L.seleccionados=n?new Set(L.planes.map(e=>e.id)):new Set,e.querySelectorAll(`.plan-check`).forEach(e=>{e.checked=n}),Dn()}),e.querySelector(`#btn-aprobar-bulk`)?.addEventListener(`click`,async()=>{let t=[...L.seleccionados];if(t.length)try{await i(t),v.success(`${t.length} plan(es) aprobados`),R(e,{viewMode:L.viewMode})}catch(e){v.error(e.message)}})),e.querySelectorAll(`#planificacion-tabs .nav-link`).forEach(t=>{t.addEventListener(`click`,()=>{if(L.activeTab=t.dataset.tab,[`planes`,`plantillas`,`asistente`].forEach(t=>{let n=e.querySelector(`#tab-content-${t}`);n&&(n.style.display=L.activeTab===t?`block`:`none`)}),e.querySelectorAll(`#planificacion-tabs .nav-link`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),L.activeTab===`asistente`&&!L.asistenteRendered){let t=e.querySelector(`#tab-content-asistente`);t&&(dn(t),L.asistenteRendered=!0)}})}),document.addEventListener(`planificacion:nuevoPlan`,e=>{On(null)},{once:!0}),t&&e.querySelector(`#btn-curriculo-admin`)?.addEventListener(`click`,()=>{pn()}),e.querySelector(`#planes-tbody`)?.addEventListener(`change`,e=>{if(!e.target.classList.contains(`plan-check`))return;let t=e.target.value;e.target.checked?L.seleccionados.add(t):L.seleccionados.delete(t),Dn()}),e.querySelector(`#planes-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit`&&On(r),n===`delete`&&Mn(r),n===`approve`&&An(r),n===`view`&&kn(r),n===`ejecutar`&&jn(r)})}function En(){let e=L.container.querySelector(`#buscar-plan`)?.value.toLowerCase()||``,t=L.container.querySelector(`#select-estado`)?.value||``;L.planes=L.planesOriginales.filter(n=>{let r=(n.tema||``).toLowerCase().includes(e)||(n.clase_nombre||``).toLowerCase().includes(e),i=!t||n.estado===t;return r&&i});let n=L.container.querySelector(`#planes-tbody`),r=L.container.querySelector(`#empty-container`);n&&(n.innerHTML=xn(L.planes)),r&&(r.innerHTML=L.planes.length===0?Sn():``)}function Dn(){let e=L.container?.querySelector(`#btn-aprobar-bulk`);e&&(e.style.display=L.seleccionados.size>0?``:`none`)}async function On(e,t={}){let r=e?L.planesOriginales.find(t=>t.id===e):new h(t);b.open({title:e?`Editar Plan de Clase`:`Nuevo Plan de Clase`,saveText:`Guardar Plan`,size:`lg`,body:`
      <form id="form-plan" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="plan-tema" value="${x(r.tema)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="plan-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="plan-objetivos" rows="2">${x(r.objetivos)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido Pedagógico (DSL)</label>
          <div class="border rounded p-2 bg-body-tertiary mb-1 d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '[Indicador] '">+ Indicador</button>
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '{Actividad} '">+ Actividad</button>
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '# Nota: '">+ Nota</button>
          </div>
          <textarea class="form-control input-dense font-monospace" id="plan-contenido" rows="6" placeholder="[Indicador] Descripción del indicador&#10;{Actividad} Descripción de la actividad">${x(r.contenido)}</textarea>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Fecha de inicio</label>
          <input type="date" class="form-control input-dense" id="plan-fecha" value="${r.fecha_inicio||``}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Instrumento / Área</label>
          <input type="text" class="form-control input-dense" id="plan-instrumento" value="${x(r.instrumento||``)}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Método de evaluación</label>
          <input type="text" class="form-control input-dense" id="plan-eval" value="${x(r.evaluacion_metodo||``)}">
        </div>
      </form>
    `,onOpen:async e=>{let{data:t}=await _.from(`clases`).select(`id, nombre`).order(`nombre`),n=e.querySelector(`#plan-clase_id`);n.innerHTML=`<option value="">Seleccionar clase...</option>`+(t||[]).map(e=>`<option value="${e.id}" ${e.id===r.clase_id?`selected`:``}>${x(e.nombre)}</option>`).join(``)},onSave:async t=>{let r={tema:t.querySelector(`#plan-tema`).value.trim(),clase_id:t.querySelector(`#plan-clase_id`).value,objetivos:t.querySelector(`#plan-objetivos`).value.trim(),contenido:t.querySelector(`#plan-contenido`).value.trim(),fecha_inicio:t.querySelector(`#plan-fecha`).value||null,instrumento:t.querySelector(`#plan-instrumento`).value.trim()||null,evaluacion_metodo:t.querySelector(`#plan-eval`).value.trim()||null},i=new h(r).validate();if(i.length>0)return v.error(i[0]),!1;try{return e?(await n(e,r),v.success(`Plan actualizado correctamente`)):(await xe(r),v.success(`Plan creado correctamente`)),R(L.container,{viewMode:L.viewMode}),!0}catch(e){return v.error(e.message),!1}}})}function kn(e){let t=L.planesOriginales.find(t=>t.id===e);if(!t)return;let n=h.getEstadoConfig(t.estado);b.open({title:`Plan: ${t.clase_nombre||`Sin clase`}`,hideSave:!0,size:`lg`,body:`
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <div class="small text-muted text-uppercase fw-bold mb-1">Tema</div>
          <div class="fw-bold">${x(t.tema)}</div>
        </div>
        <div class="col-md-4 text-md-end">
          <span class="badge ${n.color} fs-6">${n.label}</span>
        </div>
      </div>
      ${t.maestro_nombre?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Maestro</div>
          <div>${x(t.maestro_nombre)}</div>
        </div>
      `:``}
      ${t.objetivos?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Objetivos</div>
          <div class="text-muted">${x(t.objetivos)}</div>
        </div>
      `:``}
      ${t.contenido?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Contenido DSL</div>
          <pre class="p-3 rounded border bg-body-tertiary small" style="white-space:pre-wrap">${x(t.contenido)}</pre>
        </div>
      `:``}
      <div class="row g-2">
        ${t.fecha_inicio?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-calendar me-1"></i>${t.fecha_inicio}</span></div>`:``}
        ${t.instrumento?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-music-note me-1"></i>${x(t.instrumento)}</span></div>`:``}
        ${t.evaluacion_metodo?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-clipboard-check me-1"></i>${x(t.evaluacion_metodo)}</span></div>`:``}
      </div>
    `})}async function An(e){try{await i([e]),v.success(`Plan aprobado y marcado como revisado`),R(L.container,{viewMode:L.viewMode})}catch(e){v.error(e.message)}}async function jn(e){let t=L.planesOriginales.find(t=>t.id===e);if(!t)return;let r=t.instrumento,i=null,a=t.clase_id;if(a){let{data:e}=await _.from(`clases`).select(`instrumento, plan_estudio`).eq(`id`,a).single();e&&(r||=e.instrumento,i=e.plan_estudio)}let{data:{user:o}}=await _.auth.getUser(),{data:s}=await _.from(`maestros`).select(`id`).eq(`user_id`,o.id).single(),c=s?.id;un({plan:t,claseId:a,instrumento:r,nivel:i,maestroId:c,onConfirm:async()=>{try{await n(e,{estado:`ejecutado`}),v.success(`Plan marcado como ejecutado`),R(L.container,{viewMode:L.viewMode})}catch(e){v.error(e.message)}},onSkip:async()=>{try{await n(e,{estado:`ejecutado`}),v.success(`Plan ejecutado (sin cobertura)`),R(L.container,{viewMode:L.viewMode})}catch(e){v.error(e.message)}}})}async function Mn(e){let t=L.planesOriginales.find(t=>t.id===e);t&&b.open({title:`⚠️ Eliminar Plan`,saveText:`Eliminar`,body:`<p>¿Estás seguro de eliminar el plan <strong>"${x(t.tema)}"</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await te(e),v.success(`Plan eliminado`),R(L.container,{viewMode:L.viewMode}),!0}catch(e){return v.error(e.message),!1}}})}function Nn(){S.register(`planificacion`,e=>R(e,{viewMode:`maestro`})),S.register(`planificacion-plantillas`,e=>R(e,{viewMode:`plantillas`})),S.register(`planificacion-maestros`,e=>R(e,{viewMode:`admin`}))}var z={attendance_min_rate:.7,attendance_window_weeks:4,grade_min_avg:6,grade_window_count:3,indicator_min_pass_rate:.5,indicator_window_weeks:4};async function Pn(){let{data:e,error:t}=await _.from(`alumnos`).select(`*`).order(`nombre_completo`,{ascending:!0});if(t)throw console.error(`Error cargando alumnos:`,t.message),Error(`No se pudieron cargar los alumnos`);return e}async function Fn(){let{data:e,error:t}=await _.from(`clases`).select(`*`).order(`nombre`,{ascending:!0});if(t)throw console.error(`Error cargando clases:`,t.message),Error(`No se pudieron cargar las clases`);return e}async function In(){let{data:e,error:t}=await _.from(`progresos`).select(`*`).order(`fecha_evaluacion`,{ascending:!1});if(t)throw console.error(`Error cargando progresos:`,t.message),Error(`No se pudieron cargar los progresos`);return e}async function Ln(e){if(!e.alumno_id)throw Error(`El alumno es obligatorio`);if(!e.clase_id)throw Error(`La clase es obligatoria`);if(!e.evaluacion_tipo)throw Error(`El tipo de evaluacion es obligatorio`);let t={alumno_id:e.alumno_id,clase_id:e.clase_id,maestro_id:e.maestro_id||null,fecha_evaluacion:e.fecha_evaluacion||null,evaluacion_tipo:e.evaluacion_tipo.trim(),calificacion:e.calificacion!==void 0&&e.calificacion!==null?parseFloat(e.calificacion):null,estado_cualitativo:(e.estado_cualitativo||`en_progreso`).trim(),observaciones:(e.observaciones||``).trim(),indicadores:e.indicadores||null};if(e.sesion_clase_id&&(t.sesion_clase_id=e.sesion_clase_id),e.asistencia_id&&(t.asistencia_id=e.asistencia_id),e.ejercicio_id&&(t.ejercicio_id=e.ejercicio_id),t.calificacion!==null&&(t.calificacion<0||t.calificacion>5))throw Error(`La calificacion debe estar entre 0 y 5`);let{data:n,error:r}=await _.from(`progresos`).insert([t]).select();if(r)throw r.message.includes(`duplicate key`)||r.code===`23505`?Error(`Ya existe una evaluacion con ese tipo para este alumno en esta clase`):(console.error(`Error creando progreso:`,r.message),Error(`No se pudo crear el progreso`));return n[0]}async function Rn(e){let{data:t,error:n}=await _.from(`progresos`).select(`*`).eq(`clase_id`,e).order(`fecha_evaluacion`,{ascending:!1});if(n)throw console.error(`Error cargando progresos de la clase:`,n.message),Error(`No se pudieron cargar los progresos de la clase`);return t}async function zn(e){let{data:t,error:n}=await _.from(`progresos`).select(`calificacion`).eq(`alumno_id`,e).not(`calificacion`,`is`,null);if(n)throw console.error(`Error calculando promedio:`,n.message),Error(`No se pudo calcular el promedio`);if(!t||t.length===0)return null;let r=t.reduce((e,t)=>e+parseFloat(t.calificacion),0);return parseFloat((r/t.length).toFixed(2))}async function Bn(e,t){let{jsPDF:n}=await y(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-Cp9PwTtV.js`);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:r}=await y(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BcXxEeZj.js`);return{default:e}},[]),i=new n,a=e.name||e.nombre||`Sin nombre`,o=e.section||`Sin sección`,s=Vn(t),c=s!==null&&Hn(s);i.setFontSize(18),i.text(`Boletín Académico`,14,22),i.setFontSize(11),i.text(`Alumno: ${a}`,14,32),i.text(`Sección: ${o}`,14,38),i.text(`Fecha: ${new Date().toLocaleDateString(`es-ES`)}`,14,44);let l=c?`EN RIESGO`:`SATISFACTORIO`,u=c?[185,27,27]:[39,174,96];i.setFillColor(...u),i.rect(14,50,60,10,`F`),i.setTextColor(255,255,255),i.setFontSize(10),i.text(l,18,57),i.setTextColor(0,0,0),i.setFontSize(12),i.text(`Promedio: ${s===null?`N/A`:s.toFixed(2)}`,80,55),i.text(`Evaluaciones: ${t.length}`,80,62),t.length>0&&r(i,{head:[[`Fecha`,`Tipo`,`Calificación`,`Etiqueta`,`Observaciones`]],body:t.map(e=>[e.fecha_evaluacion?Un(e.fecha_evaluacion):`-`,Wn(e.tipo_evaluacion),e.calificacion===null?`-`:e.calificacion.toFixed(2),Gn(e.calificacion),e.observaciones?e.observaciones.substring(0,40)+(e.observaciones.length>40?`...`:``):`-`]),startY:70,styles:{fontSize:9},headStyles:{fillColor:[41,128,185]}}),i.save(`boletin-${a.replace(/\s+/g,`-`).toLowerCase()}.pdf`)}function Vn(e){if(!e||e.length===0)return null;let t=e.filter(e=>e.calificacion!==null&&e.calificacion!==void 0).map(e=>parseFloat(e.calificacion));return t.length===0?null:t.reduce((e,t)=>e+t,0)/t.length}function Hn(e){return e==null?!1:parseFloat(e)<3}function Un(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):`-`}function Wn(e){return{oral:`Oral`,escrita:`Escrita`,practica:`Práctica`,evaluacion_parcial:`Parcial`,evaluacion_final:`Final`}[e]||e||`-`}function Gn(e){if(e==null)return`-`;let t=parseFloat(e);return t>=4.5?`Sobresaliente`:t>=4?`Muy Bueno`:t>=3?`Bueno`:t>=2?`En Progreso`:`Necesita Mejorar`}var Kn=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||``,this.clase_id=e.clase_id||``,this.maestro_id=e.maestro_id||null,this.fecha_evaluacion=e.fecha_evaluacion||``,this.tipo_evaluacion=e.tipo_evaluacion||e.evaluacion_tipo||``,this.calificacion=e.calificacion!==void 0&&e.calificacion!==null?parseFloat(e.calificacion):null,this.observaciones=e.observaciones||``,this.estado=e.estado||`en_progreso`,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];this.alumno_id||t.push(`El alumno es obligatorio`),this.clase_id||t.push(`La clase es obligatoria`),!this.tipo_evaluacion||!this.tipo_evaluacion.trim()?t.push(`El tipo de evaluación es obligatorio`):e.getTiposEvaluacion().map(e=>e.value).includes(this.tipo_evaluacion)||t.push(`Tipo de evaluación no válido`),this.calificacion!==null&&this.calificacion!==void 0&&(isNaN(this.calificacion)||this.calificacion<0||this.calificacion>5)&&t.push(`La calificación debe estar entre 0.0 y 5.0`),this.observaciones&&this.observaciones.length>500&&t.push(`Las observaciones no pueden exceder 500 caracteres`);let n=e.getEstados().map(e=>e.value);return this.estado&&!n.includes(this.estado)&&t.push(`Estado no válido`),t}static getTiposEvaluacion(){return[{value:`parcial`,label:`Parcial`},{value:`final`,label:`Final`},{value:`continua`,label:`Continua`},{value:`oral`,label:`Oral`},{value:`escrita`,label:`Escrita`},{value:`practica`,label:`Práctica`}]}static getEstados(){return[{value:`en_progreso`,label:`En Progreso`,color:`bg-primary`},{value:`completado`,label:`Completado`,color:`bg-success`},{value:`pendiente`,label:`Pendiente`,color:`bg-secondary`}]}static getEstadoConfig(e){return this.getEstados().find(t=>t.value===e)||{value:e,label:e,color:`bg-secondary`}}toJSON(){return{alumno_id:this.alumno_id,clase_id:this.clase_id,maestro_id:this.maestro_id,fecha_evaluacion:this.fecha_evaluacion||null,tipo_evaluacion:this.tipo_evaluacion.trim(),calificacion:this.calificacion,observaciones:this.observaciones?this.observaciones.trim():null,estado:this.estado}}};function qn(e){if(!e||e.length===0)return{promedio:null,total:0,enRiesgo:!1};let t=e.map(e=>e.calificacion).filter(e=>e!=null&&!isNaN(e));if(t.length===0)return{promedio:null,total:e.length,enRiesgo:!1};let n=t.reduce((e,t)=>e+t,0),r=parseFloat((n/t.length).toFixed(2));return{promedio:r,total:e.length,enRiesgo:r<3}}async function Jn(e){let t=await Rn(e),n={};return t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]=[]),n[e.alumno_id].push(e)}),Object.entries(n).map(([e,t])=>({alumnoId:e,progresos:t,rendimiento:qn(t)}))}var Yn={calcularRendimiento:qn,getResumenProgresosClase:Jn},B={progresos:[],progresosOriginales:[],alumnos:[],clases:[],cargando:!1,filtroClase:`todas`,container:null};async function Xn(e){if(e)try{B.container=e,B.cargando=!0,Zn(e);let[t,n,r]=await Promise.all([In(),Pn(),Fn()]);B.progresos=(t||[]).map(e=>new Kn(e)),B.progresosOriginales=[...B.progresos],B.alumnos=n||[],B.clases=r||[],B.cargando=!1,$n(e),tr(e)}catch(t){console.error(t),Qn(e,t.message)}}function Zn(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function Qn(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${x(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>progresos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`}function $n(e){let t=B.progresosOriginales.length,n=B.progresosOriginales.filter(e=>e.calificacion!=null).map(e=>parseFloat(e.calificacion)),r=n.length>0?(n.reduce((e,t)=>e+t,0)/n.length).toFixed(2):null,i={};B.progresosOriginales.forEach(e=>{i[e.alumno_id]||(i[e.alumno_id]=[]),e.calificacion!=null&&i[e.alumno_id].push(parseFloat(e.calificacion))});let a=0;Object.values(i).forEach(e=>{e.length!==0&&e.reduce((e,t)=>e+t,0)/e.length<3&&a++});let o=Object.keys(i).length,s=new Set(B.progresosOriginales.map(e=>e.clase_id)).size;e.innerHTML=`
    <div class="page-container">
      <div class="progresos-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-graph-up-arrow fs-4"></i>
          </div>
          <div>
            <h1 class="progresos-title-premium page-title mb-0">Calificaciones</h1>
            <p class="text-muted small mb-0">${t} evaluaciones registradas · ${o} alumnos</p>
          </div>
        </div>
        <div class="progresos-header-actions">
          <button class="btn btn-premium-action" id="btn-nueva-nota">
            <i class="bi bi-plus-lg me-1"></i>Registrar Nota
          </button>
        </div>
      </div>

      <!-- Mini-Dashboard -->
      <div class="stats-panel mb-4">
        <div class="stats-grid">
          <div class="stat-card border-start border-4 border-primary">
            <div class="stat-label">Promedio General</div>
            <div class="stat-value ${r!==null&&parseFloat(r)<3?`text-danger`:`text-success`}">${r===null?`–`:r}</div>
          </div>
          <div class="stat-card border-start border-4 border-info">
            <div class="stat-label">Alumnos evaluados</div>
            <div class="stat-value">${o}</div>
          </div>
          <div class="stat-card border-start border-4 border-danger">
            <div class="stat-label">En riesgo</div>
            <div class="stat-value ${a>0?`text-danger`:`text-success`}">${a}</div>
          </div>
          <div class="stat-card border-start border-4 border-secondary">
            <div class="stat-label">Clases activas</div>
            <div class="stat-value">${s}</div>
          </div>
        </div>
      </div>

      <div class="progresos-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar por alumno o programa..." id="buscar-progreso">
        </div>
        <div class="premium-select-container select-clase-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-clase">
            <option value="todas">Todas las clases</option>
            ${B.clases.map(e=>`<option value="${e.id}" ${e.id===B.filtroClase?`selected`:``}>${x(e.nombre)}</option>`).join(``)}
          </select>
        </div>
      </div>

      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Alumno / Clase</th>
                <th class="text-center">Promedio</th>
                <th class="d-none d-md-table-cell">Evaluaciones</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="progresos-tbody">
              ${er()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function er(){let e=B.container.querySelector(`#buscar-progreso`)?.value.trim().toLowerCase()||``,t=B.filtroClase,n={};B.progresosOriginales.forEach(r=>{let i=B.alumnos.find(e=>e.id===r.alumno_id),a=B.clases.find(e=>e.id===r.clase_id);t!==`todas`&&r.clase_id!==t||e&&!i?.nombre_completo.toLowerCase().includes(e)&&!a?.nombre.toLowerCase().includes(e)||(n[r.alumno_id]||(n[r.alumno_id]={alumno:i,lista:[]}),n[r.alumno_id].lista.push(r))});let r=Object.values(n);return r.length===0?`<tr><td colspan="5" class="text-center py-5 text-muted">No hay resultados.</td></tr>`:r.map(({alumno:e,lista:t})=>{let n=Yn.calcularRendimiento(t);return`
      <tr class="border-start-accent ${n.enRiesgo?`border-accent-danger`:`border-accent-success`}">
        <td>
          <div class="fw-bold">${x(e?.nombre_completo||`Desconocido`)}</div>
          <div class="small text-muted">${t.length>0?x(B.clases.find(e=>e.id===t[0].clase_id)?.nombre):``}</div>
        </td>
        <td class="text-center align-middle">
          <div class="fw-bold ${n.enRiesgo?`text-danger`:`text-success`}" style="font-size: 1.1rem;">
            ${n.promedio===null?`-.--`:n.promedio.toFixed(2)}
          </div>
        </td>
        <td class="d-none d-md-table-cell text-center align-middle">
          <span class="badge bg-light text-dark border">${n.total}</span>
        </td>
        <td class="align-middle">
          ${n.enRiesgo?`<span class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle"><i class="bi bi-exclamation-circle me-1"></i>En Riesgo</span>`:`<span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">Satisfactorio</span>`}
        </td>
        <td class="text-end align-middle">
          <div class="quick-actions justify-content-end">
            <button class="btn btn-sm btn-outline-secondary btn-icon-compact" data-action="pdf" data-alumno-id="${e?.id}" title="Generar Boletín">
              <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="view-detail" data-alumno-id="${e?.id}" title="Ver Detalle">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `}).join(``)}function tr(e){e.querySelector(`#select-clase`)?.addEventListener(`change`,t=>{B.filtroClase=t.target.value,e.querySelector(`#progresos-tbody`).innerHTML=er()}),e.querySelector(`#buscar-progreso`)?.addEventListener(`input`,()=>{e.querySelector(`#progresos-tbody`).innerHTML=er()}),e.querySelector(`#progresos-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,alumnoId:r}=t.dataset;n===`pdf`&&nr(r),n===`view-detail`&&rr(r)}),e.querySelector(`#btn-nueva-nota`)?.addEventListener(`click`,()=>ir())}async function nr(e){let t=B.alumnos.find(t=>t.id===e),n=B.progresosOriginales.filter(t=>t.alumno_id===e);v.info(`Generando boletín institucional...`);try{await Bn(t,n),v.success(`Boletín generado exitosamente`)}catch(e){v.error(`Error al generar PDF: `+e.message)}}function rr(e){let t=B.alumnos.find(t=>t.id===e),n=B.progresosOriginales.filter(t=>t.alumno_id===e),r=Yn.calcularRendimiento(n);b.open({title:`Detalle Académico: ${t.nombre_completo}`,size:`lg`,hideSave:!0,body:`
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="p-3 rounded bg-body-tertiary text-center border">
            <div class="small text-muted text-uppercase fw-bold mb-1">Promedio General</div>
            <div class="h3 mb-0 ${r.enRiesgo?`text-danger`:`text-success`}">${r.promedio?.toFixed(2)||`-`}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 rounded bg-body-tertiary text-center border">
            <div class="small text-muted text-uppercase fw-bold mb-1">Evaluaciones</div>
            <div class="h3 mb-0">${r.total}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 rounded bg-body-tertiary text-center border">
            <div class="small text-muted text-uppercase fw-bold mb-1">Estado Institucional</div>
            <div class="h5 mb-0 mt-2">${r.enRiesgo?`🚨 En Riesgo`:`✅ Estable`}</div>
          </div>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-compact">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th class="text-center">Nota</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(e=>`
              <tr>
                <td class="small">${e.fecha_evaluacion||`-`}</td>
                <td><span class="badge bg-light text-dark border small">${e.tipo_evaluacion}</span></td>
                <td class="text-center fw-bold ${e.calificacion<3?`text-danger`:``}">${e.calificacion?.toFixed(1)||`-`}</td>
                <td class="small text-muted">${x(e.observaciones||`-`)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `})}function ir(){b.open({title:`Registrar Nueva Calificación`,saveText:`Guardar Nota`,body:`
      <form id="form-nota" class="row g-3">
        <div class="col-md-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="nota-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${B.alumnos.map(e=>`<option value="${e.id}">${e.nombre_completo}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="nota-clase_id" required>
            <option value="">Seleccionar...</option>
            ${B.clases.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo de Evaluación *</label>
          <select class="form-select input-dense" id="nota-tipo" required>
            ${Kn.getTiposEvaluacion().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Calificación (0-5) *</label>
          <input type="number" class="form-control input-dense" id="nota-valor" min="0" max="5" step="0.1" required>
        </div>
        <div class="col-md-8">
          <label class="form-label-compact">Fecha</label>
          <input type="date" class="form-control input-dense" id="nota-fecha" value="${new Date().toISOString().split(`T`)[0]}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Observaciones</label>
          <textarea class="form-control input-dense" id="nota-obs" rows="2"></textarea>
        </div>
      </form>
    `,onSave:async e=>{let t={alumno_id:e.querySelector(`#nota-alumno_id`).value,clase_id:e.querySelector(`#nota-clase_id`).value,tipo_evaluacion:e.querySelector(`#nota-tipo`).value,calificacion:parseFloat(e.querySelector(`#nota-valor`).value),fecha_evaluacion:e.querySelector(`#nota-fecha`).value,observaciones:e.querySelector(`#nota-obs`).value.trim()},n=new Kn(t).validate();if(n.length>0)return v.error(n[0]),!1;try{return await Ln(t),v.success(`Nota registrada exitosamente`),Xn(B.container),!0}catch(e){return v.error(e.message),!1}}})}function ar(){S.register(`progresos`,Xn)}function or(e){return e?Array.isArray(e)?e.map(e=>new p(e)):new p(e):null}async function sr(){let{data:e,error:t}=await _.from(`observaciones_alumnos`).select(`
      *,
      alumno:alumnos(nombre_completo),
      maestro:maestros(nombre_completo)
    `).order(`fecha_observacion`,{ascending:!1});if(t)throw console.error(`Error cargando observaciones:`,t.message),Error(`No se pudieron cargar las observaciones`);return e.map(e=>{let t=new p(e);return t.alumno_nombre=e.alumno?.nombre_completo||`Desconocido`,t.maestro_nombre=e.maestro?.nombre_completo||`N/A`,t})}async function cr(e){let t=new p(e),n=t.validate();if(n.length>0)throw Error(n[0]);let{data:r,error:i}=await _.from(`observaciones_alumnos`).insert([t.toJSON()]).select();if(i)throw i;return or(r[0])}async function lr(e,t){let{data:n}=await _.from(`observaciones_alumnos`).select(`*`).eq(`id`,e).single(),r=new p({...n,...t}),i=r.validate();if(i.length>0)throw Error(i[0]);let{data:a,error:o}=await _.from(`observaciones_alumnos`).update(r.toJSON()).eq(`id`,e).select();if(o)throw o;return or(a[0])}async function ur(e){let{error:t}=await _.from(`observaciones_alumnos`).delete().eq(`id`,e);if(t)throw t}async function dr(e,t){let{data:n,error:r}=await _.from(`observaciones_alumnos`).update({seguimiento_observacion:t.trim(),seguimiento_fecha:new Date().toISOString().split(`T`)[0],estado:`seguimiento`,requiere_seguimiento:!0}).eq(`id`,e).select();if(r)throw r;return or(n[0])}async function fr(){let{data:e,error:t}=await _.from(`observaciones_alumnos`).select(`estado, prioridad, tipo`);if(t)throw t;return{total:e.length,abiertas:e.filter(e=>e.estado===`abierta`).length,seguimiento:e.filter(e=>e.estado===`seguimiento`).length,altas:e.filter(e=>e.prioridad===`alta`).length,porTipo:e.reduce((e,t)=>(e[t.tipo]=(e[t.tipo]||0)+1,e),{})}}function V(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}var H={observaciones:[],observacionesOriginales:[],alumnos:[],estadisticas:null,cargando:!1,filtroTipo:``,filtroEstado:`todos`,container:null};async function U(e){if(e)try{H.container=e,H.cargando=!0,pr(e);let[t,n,r]=await Promise.all([sr(),ne().catch(()=>[]),fr().catch(()=>null)]);H.observaciones=t,H.observacionesOriginales=[...t],H.alumnos=n,H.estadisticas=r,H.cargando=!1,hr(e),vr(e)}catch(t){console.error(t),mr(e,t.message)}}function pr(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function mr(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${V(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>observaciones_alumnos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
          <button class="btn btn-outline-warning btn-sm mt-3" id="retry-btn">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>
    </div>`,e.querySelector(`#retry-btn`)?.addEventListener(`click`,()=>U(e))}function hr(e){e.innerHTML=`
    <div class="page-container">
      <div class="observaciones-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-clipboard2-pulse fs-4"></i>
          </div>
          <div>
            <h1 class="observaciones-title-premium page-title mb-0">Observaciones</h1>
            <p class="text-muted small mb-0">${H.observaciones.length} observaciones en total</p>
          </div>
        </div>
        <div class="observaciones-header-actions">
          <button class="btn btn-premium-action" id="btn-nueva-obs">
            <i class="bi bi-plus-lg me-1.5"></i>Nueva Observación
          </button>
        </div>
      </div>

      <!-- Panel de Estadísticas / KPIs Premium -->
      <div class="stats-panel mb-4">
        <div class="stats-grid">
          <div class="stat-card stat-total border-start border-4 border-primary">
            <div class="stat-label">Abiertas</div>
            <div class="stat-value">${H.estadisticas?.abiertas||0}</div>
          </div>
          <div class="stat-card stat-justified border-start border-4 border-warning">
            <div class="stat-label">Seguimiento</div>
            <div class="stat-value">${H.estadisticas?.seguimiento||0}</div>
          </div>
          <div class="stat-card stat-absent border-start border-4 border-danger">
            <div class="stat-label">Alta Prioridad</div>
            <div class="stat-value">${H.estadisticas?.altas||0}</div>
          </div>
          <div class="stat-card stat-present border-start border-4 border-success">
            <div class="stat-label">Total</div>
            <div class="stat-value">${H.estadisticas?.total||0}</div>
          </div>
        </div>
      </div>

      <div class="observaciones-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar observación..." id="buscar-obs">
        </div>
        <div class="premium-select-container select-tipo-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-tipo">
            <option value="">Todos los tipos</option>
            ${p.getTipos().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
          </select>
        </div>
      </div>

      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Alumno / Título</th>
                <th class="d-none d-md-table-cell">Tipo / Prioridad</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="obs-tbody">
              ${gr(H.observaciones)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${H.observaciones.length===0?_r():``}</div>
      </div>
    </div>
  `}function gr(e){return e.map(e=>{let t=p.getTipos().find(t=>t.value===e.tipo),n=p.getPrioridades().find(t=>t.value===e.prioridad),r=p.getEstados().find(t=>t.value===e.estado),i=e.prioridad===`alta`?`border-accent-danger`:e.prioridad===`media`?`border-accent-warning`:`border-accent-secondary`;return`
      <tr data-id="${e.id}" class="border-start-accent ${i}">
        <td>
          <div class="fw-bold text-truncate" style="max-width: 250px;">${V(e.titulo)}</div>
          <div class="small text-muted">${V(e.alumno_nombre)}</div>
        </td>
        <td class="d-none d-md-table-cell align-middle">
          <div class="d-flex align-items-center gap-2">
            <i class="bi ${t?.icon||`bi-info-circle`} text-muted"></i>
            <span class="small ${n?.color} fw-bold">${n?.label||e.prioridad}</span>
          </div>
        </td>
        <td class="align-middle">
          <span class="badge badge-compact ${r?.color}">${r?.label||e.estado}</span>
        </td>
        <td class="text-end align-middle">
          <div class="quick-actions justify-content-end">
            <button class="btn btn-sm btn-outline-warning btn-icon-compact" data-action="follow" data-id="${e.id}" title="Seguimiento">
              <i class="bi bi-arrow-repeat"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary btn-icon-compact" data-action="edit" data-id="${e.id}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-icon-compact" data-action="delete" data-id="${e.id}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `}).join(``)}function _r(){return`<div class="text-center py-5 text-muted"><i class="bi bi-chat-left-dots fs-1 d-block mb-2"></i>No se encontraron observaciones.</div>`}function vr(e){e.querySelector(`#buscar-obs`)?.addEventListener(`input`,yr),e.querySelector(`#select-tipo`)?.addEventListener(`change`,yr),e.querySelector(`#obs-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit`&&br(r),n===`delete`&&Sr(r),n===`follow`&&xr(r)}),e.querySelector(`#btn-nueva-obs`)?.addEventListener(`click`,()=>br(null))}function yr(){let e=H.container.querySelector(`#buscar-obs`).value.toLowerCase(),t=H.container.querySelector(`#select-tipo`).value;H.observaciones=H.observacionesOriginales.filter(n=>{let r=n.titulo.toLowerCase().includes(e)||n.alumno_nombre.toLowerCase().includes(e),i=!t||n.tipo===t;return r&&i}),H.container.querySelector(`#obs-tbody`).innerHTML=gr(H.observaciones)}async function br(e){let t=e?H.observacionesOriginales.find(t=>t.id===e):new p;b.open({title:e?`Editar Observación`:`Nueva Observación`,saveText:`Guardar`,body:`
      <form id="form-obs" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="obs-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${H.alumnos.map(e=>`<option value="${e.id}" ${e.id===t.alumno_id?`selected`:``}>${V(e.nombre_completo)}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-8">
          <label class="form-label-compact">Título de la Incidencia *</label>
          <input type="text" class="form-control input-dense" id="obs-titulo" value="${V(t.titulo)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Prioridad</label>
          <select class="form-select input-dense" id="obs-prioridad">
            ${p.getPrioridades().map(e=>`<option value="${e.value}" ${e.value===t.prioridad?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo</label>
          <select class="form-select input-dense" id="obs-tipo">
            ${p.getTipos().map(e=>`<option value="${e.value}" ${e.value===t.tipo?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Fecha</label>
          <input type="date" class="form-control input-dense" id="obs-fecha" value="${t.fecha_observacion||new Date().toISOString().split(`T`)[0]}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción Detallada *</label>
          <textarea class="form-control input-dense" id="obs-descripcion" rows="4" required>${V(t.descripcion)}</textarea>
        </div>
      </form>
    `,onSave:async t=>{let n={alumno_id:t.querySelector(`#obs-alumno_id`).value,titulo:t.querySelector(`#obs-titulo`).value.trim(),prioridad:t.querySelector(`#obs-prioridad`).value,tipo:t.querySelector(`#obs-tipo`).value,fecha_observacion:t.querySelector(`#obs-fecha`).value,descripcion:t.querySelector(`#obs-descripcion`).value.trim()},r=new p(n).validate();if(r.length>0)return v.error(r[0]),!1;try{return e?(await lr(e,n),v.success(`Observación actualizada`)):(await cr(n),v.success(`Observación registrada`)),U(H.container),!0}catch(e){return v.error(e.message),!1}}})}function xr(e){let t=H.observacionesOriginales.find(t=>t.id===e);b.open({title:`Añadir Seguimiento`,saveText:`Guardar Seguimiento`,body:`
      <p class="small text-muted mb-3">Estás añadiendo una nota de seguimiento a: <strong>${V(t.titulo)}</strong></p>
      <div class="mb-3">
        <label class="form-label-compact">Nota de seguimiento</label>
        <textarea class="form-control input-dense" id="follow-obs" rows="4" placeholder="Describe las acciones tomadas..."></textarea>
      </div>
    `,onSave:async t=>{let n=t.querySelector(`#follow-obs`).value.trim();if(!n)return v.error(`La nota es obligatoria`),!1;try{return await dr(e,n),v.success(`Seguimiento registrado`),U(H.container),!0}catch(e){return v.error(e.message),!1}}})}function Sr(e){let t=H.observacionesOriginales.find(t=>t.id===e);b.open({title:`⚠️ Eliminar Observación`,saveText:`Eliminar`,body:`<p>¿Estás seguro de eliminar "${V(t.titulo)}"?</p>`,onSave:async()=>(await ur(e),U(H.container),!0)})}function Cr(){S.register(`observaciones`,U)}var wr=[{id:`rpt_master`,nombre:`Analítica Crítica Institucional`,descripcion:`Visión 360°: Cruce de asistencia, rendimiento y gestión docente con IA`,frecuencia:`mensual`,tipo:`global`,icon:`bi-shield-shaded`},{id:`rpt_003`,nombre:`Reporte de Alumnos en Riesgo`,descripcion:`Detección automática de bajo rendimiento y ausentismo con IA`,frecuencia:`semanal`,tipo:`riesgo`,icon:`bi-exclamation-triangle`},{id:`rpt_002`,nombre:`Boletín de Progreso General`,descripcion:`Resumen de calificaciones y evolución por programa`,frecuencia:`mensual`,tipo:`progreso`,icon:`bi-graph-up`},{id:`rpt_001`,nombre:`Análisis de Asistencia Crítica`,descripcion:`Identificación de patrones de deserción y faltas injustificadas`,frecuencia:`semanal`,tipo:`asistencia`,icon:`bi-calendar-check`}],W={reportes:[],programada:!1};async function Tr(e){W.reportes=[...wr],Er(e),Or(e)}function Er(e){e.innerHTML=`
    <div class="ia-reporte-view px-3 px-md-4 py-3">
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-0 fw-semibold"><i class="bi bi-file-earmark-richtext me-2 text-primary"></i>Generador de Reportes</h4>
          <p class="text-secondary small mb-0">Crea y programa reportes automáticos con IA</p>
        </div>
        <button class="btn btn-primary btn-sm" id="btnNuevoReporte">
          <i class="bi bi-plus-lg me-1"></i>Nuevo Reporte
        </button>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent">
          <h5 class="fw-bold mb-0"><i class="bi bi-clock me-2"></i>Programación Automática</h5>
        </div>
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-md-4">
              <label class="form-label small">Frecuencia</label>
              <select class="form-select form-select-sm" id="programacionFrecuencia">
                <option value="diaria">Diaria</option>
                <option value="semanal" selected>Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Día/Hora</label>
              <div class="d-flex gap-2">
                <select class="form-select form-select-sm" id="programacionDia">
                  <option value="1">Lunes</option>
                  <option value="5" selected>Viernes</option>
                </select>
                <input type="time" class="form-control form-control-sm" value="08:00" style="width: 100px;">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-check form-switch mt-4">
                <input class="form-check-input" type="checkbox" id="programacionActiva" ${W.programada?`checked`:``}>
                <label class="form-check-label" for="programacionActiva">Activar programación</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-12">
          <h5 class="fw-semibold mb-3"><i class="bi bi-file-earmark-text me-2"></i>Plantillas de Reportes</h5>
        </div>
        ${W.reportes.map(e=>Dr(e)).join(``)}
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent">
              <h5 class="fw-bold mb-0"><i class="bi bi-play-circle me-2"></i>Generar Ahora</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Seleccionar reporte</label>
                <select class="form-select" id="generarAhoraSelect">
                  <option value="">-- Seleccionar --</option>
                  ${W.reportes.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Período</label>
                <div class="d-flex gap-2">
                  <input type="date" class="form-control form-control-sm" id="genDesde" value="${Ir()}">
                  <input type="date" class="form-control form-control-sm" id="genHasta" value="${Fr()}">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Formato</label>
                <div class="btn-group w-100" role="group">
                  <input type="radio" class="btn-check" name="genFormat" id="fmtPdf" value="pdf" checked>
                  <label class="btn btn-outline-primary btn-sm" for="fmtPdf"><i class="bi bi-file-earmark-pdf me-1"></i>PDF</label>
                  <input type="radio" class="btn-check" name="genFormat" id="fmtXlsx" value="xlsx">
                  <label class="btn btn-outline-success btn-sm" for="fmtXlsx"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel</label>
                  <input type="radio" class="btn-check" name="genFormat" id="fmtMd" value="md">
                  <label class="btn btn-outline-secondary btn-sm" for="fmtMd"><i class="bi bi-file-earmark-markdown me-1"></i>MD</label>
                </div>
              </div>
              <button class="btn btn-primary w-100" id="btnGenerarAhora">
                <i class="bi bi-lightning me-1"></i>Generar Reporte
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent">
              <h5 class="fw-bold mb-0"><i class="bi bi-send me-2"></i>Enviar por Email</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Destinatarios</label>
                <input type="text" class="form-control" id="emailDest" placeholder="admin@escuela.edu, director@escuela.edu">
                <small class="text-muted">Separar múltiples emails con coma</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Asunto</label>
                <input type="text" class="form-control" id="emailAsunto" value="Reporte Semanal - SOI">
              </div>
              <div class="mb-3">
                <label class="form-label">Incluir</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="incPDF" checked>
                  <label class="form-check-label" for="incPDF">Adjunto PDF</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="incResumen">
                  <label class="form-check-label" for="incResumen">Resumen en cuerpo del email</label>
                </div>
              </div>
              <button class="btn btn-outline-primary w-100" id="btnEnviarEmail">
                <i class="bi bi-send me-1"></i>Enviar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function Dr(e){let t={diaria:`danger`,semanal:`warning`,mensual:`info`}[e.frecuencia]||`secondary`;return`
    <div class="col-md-6 col-lg-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center gap-2">
              <div class="bg-primary-subtle text-primary rounded p-2">
                <i class="bi ${e.icon}"></i>
              </div>
              <div>
                <h6 class="mb-0 fw-semibold">${e.nombre}</h6>
              </div>
            </div>
            <span class="badge bg-${t} bg-opacity-10 text-${t}" style="font-size: 0.7rem;">${e.frecuencia}</span>
          </div>
          <p class="text-muted small mb-2">${e.descripcion}</p>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary flex-grow-1" data-action="generar" data-id="${e.id}">
              <i class="bi bi-play me-1"></i>Generar
            </button>
            <button class="btn btn-sm btn-outline-secondary" data-action="editar" data-id="${e.id}">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function Or(e){e.querySelector(`#btnNuevoReporte`)?.addEventListener(`click`,()=>kr(e)),e.querySelectorAll(`[data-action]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.id;t.dataset.action===`generar`?Ar(n):t.dataset.action===`editar`&&Nr(n,e)})}),e.querySelector(`#btnGenerarAhora`)?.addEventListener(`click`,()=>Pr(e)),e.querySelector(`#btnEnviarEmail`)?.addEventListener(`click`,()=>_enviarEmail(e)),e.querySelector(`#programacionActiva`)?.addEventListener(`change`,e=>{W.programada=e.target.checked,b.open({title:W.programada?`Programación Activada`:`Programación Desactivada`,body:`<div class="alert alert-${W.programada?`success`:`warning`} mb-0">La generación de reportes está ahora ${W.programada?`activa`:`inactiva`}.</div>`,hideSave:!0,cancelText:`Cerrar`})})}function kr(e){b.open({title:`Nueva Plantilla de Reporte`,size:`md`,saveText:`Crear`,body:`
      <div class="mb-3">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-control" id="newReporteNombre" placeholder="Mi Reporte Personalizado">
      </div>
      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea class="form-control" id="newReporteDesc" rows="2" placeholder="Describe qué incluirá el reporte"></textarea>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Tipo</label>
          <select class="form-select" id="newReporteTipo">
            <option value="asistencia">Asistencia</option>
            <option value="progreso">Progreso</option>
            <option value="riesgo">Riesgo</option>
            <option value="maestros">Maestros</option>
            <option value="contenido">Contenido</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Frecuencia</label>
          <select class="form-select" id="newReporteFreq">
            <option value="diaria">Diaria</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
      </div>
    `,onSave:()=>{let t=document.getElementById(`newReporteNombre`).value.trim();if(!t)return alert(`El nombre es obligatorio`),!1;W.reportes.unshift({id:`rpt_`+Date.now(),nombre:t,descripcion:document.getElementById(`newReporteDesc`).value,tipo:document.getElementById(`newReporteTipo`).value,frecuencia:document.getElementById(`newReporteFreq`).value,icon:`bi-file-earmark-text`}),Er(e),b.close()}})}async function Ar(e){let t=W.reportes.find(t=>t.id===e);if(t){b.showLoading(`Analizando datos para: ${t.nombre}...`);try{let[e,n,r]=await Promise.all([ne(),Fn(),In()]),i=``,a=[];if(t.tipo===`riesgo`){let t=(await Promise.all(e.map(async e=>{let t=await zn(e.id);return{...e,promedio:t}}))).filter(e=>e.promedio!==null&&e.promedio<3);a=t.map(e=>({nombre:e.nombre,valor:e.promedio,unidad:`Promedio`})),i=`
        Se han detectado ${t.length} alumnos con promedio menor a 3.0 de un total de ${e.length} inscritos.
        Detalle de alumnos críticos:
        ${t.map(e=>`- ${e.nombre}: Promedio ${e.promedio}`).join(`
`)}
        
        Por favor, genera un análisis ejecutivo para la dirección escolar, identificando posibles causas generales y sugiriendo un plan de intervención pedagógica.
      `}else if(t.tipo===`asistencia`){let{data:t,error:n}=await _.from(`sesiones_clase`).select(`asistencia`).eq(`borrador`,!1);if(n)throw n;let r={};t.forEach(e=>{(e.asistencia||[]).forEach(e=>{r[e.alumno_id]||(r[e.alumno_id]={total:0,presentes:0}),r[e.alumno_id].total++,e.estado===`presente`&&r[e.alumno_id].presentes++})});let o=e.map(e=>{let t=r[e.id]||{total:0,presentes:0},n=t.total>0?Math.round(t.presentes/t.total*100):100;return{...e,asistenciaPct:n}}).filter(e=>e.asistenciaPct<80);a=o.map(e=>({nombre:e.nombre,valor:e.asistenciaPct+`%`,unidad:`Asistencia`})),i=`
        Reporte de Asistencia Crítica (Menos del 80%).
        Se han detectado ${o.length} alumnos en riesgo de deserción o falta de compromiso.
        Detalle de alumnos con baja asistencia:
        ${o.map(e=>`- ${e.nombre}: ${e.asistenciaPct}% de asistencia`).join(`
`)}
        
        Analiza estos datos y sugiere estrategias de retención y comunicación con los representantes.
      `}else if(t.tipo===`global`){let[t,o]=await Promise.all([_.from(`sesiones_clase`).select(`asistencia`).eq(`borrador`,!1),_.from(`maestros`).select(`nombre_completo, especialidad`)]),s=t.data?.length||0,c=r.length>0?(r.reduce((e,t)=>e+(t.calificacion||0),0)/r.length).toFixed(2):`N/A`;i=`
        ANÁLISIS GLOBAL DE LA INSTITUCIÓN.
        - Total Estudiantes: ${e.length}
        - Total Clases: ${n.length}
        - Total Maestros: ${o.data?.length||0}
        - Promedio Académico General: ${c}
        - Sesiones de clase registradas: ${s}
        
        Realiza un diagnóstico profundo de la salud académica de la institución. Identifica fortalezas basadas en el volumen de datos y debilidades si el promedio o la asistencia muestran alarmas. Proyecta los resultados para el próximo período. Genera conclusiones críticas para la toma de decisiones.
      `,a=[{nombre:`Promedio Institucional`,valor:c,unidad:`Puntos`},{nombre:`Cobertura de Clases`,valor:s,unidad:`Sesiones`},{nombre:`Población Estudiantil`,valor:e.length,unidad:`Alumnos`}]}else i=`Genera un resumen ejecutivo para un reporte de tipo ${t.tipo} basado en ${e.length} alumnos y ${n.length} clases activas.`;let o=await ke([{role:`system`,content:`Eres un experto en gestión educativa y análisis de datos académicos.`},{role:`user`,content:`Actúa como un Coordinador Académico Senior. Basado en los siguientes datos reales del sistema SOI:\n${i}\n\nGenera el reporte en formato Markdown, con secciones claras: # Resumen Ejecutivo, ## Hallazgos Clave, y ## Recomendaciones.`}]);b.close(),b.open({title:`<i class="bi bi-stars text-primary me-2"></i>Análisis de IA: ${t.nombre}`,size:`lg`,saveText:`<i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF`,body:`
        <div class="reporte-preview p-3">
          <div class="mb-4 bg-light p-3 rounded border-start border-primary border-4">
            <h6 class="fw-bold mb-1"><i class="bi bi-info-circle me-2"></i>Resumen de Datos Analizados</h6>
            <p class="small text-muted mb-0">Se procesaron registros de ${e.length} estudiantes y ${r.length} evaluaciones recientes.</p>
          </div>
          
          <div class="ia-content markdown-body mb-4">
            ${jr(o)}
          </div>

          ${a.length>0?`
            <div class="mt-4">
              <h6 class="fw-bold mb-3">Métricas e Indicadores Identificados</h6>
              <div class="table-responsive">
                <table class="table table-sm table-hover border">
                  <thead class="table-light">
                    <tr>
                      <th>Indicador / Estudiante</th>
                      <th class="text-center">Valor</th>
                      <th class="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${a.map(e=>`
                      <tr>
                        <td>${e.nombre}</td>
                        <td class="text-center fw-bold text-danger">${e.valor} <small class="text-muted fw-normal">${e.unidad}</small></td>
                        <td class="text-center"><span class="badge bg-danger bg-opacity-10 text-danger">Revisión</span></td>
                      </tr>
                    `).join(``)}
                  </tbody>
                </table>
              </div>
            </div>
          `:``}
        </div>
      `,onSave:async()=>(Mr(t.nombre,o,a),!1)})}catch(e){console.error(e),b.close(),v.error(`Error al generar el análisis: `+e.message)}}}function jr(e){return e.replace(/^### (.*$)/gim,`<h5 class="fw-bold mt-4 mb-2">$1</h5>`).replace(/^## (.*$)/gim,`<h4 class="fw-bold mt-4 mb-2 border-bottom pb-1">$1</h4>`).replace(/^# (.*$)/gim,`<h3 class="fw-bold mb-3 text-primary">$1</h3>`).replace(/^\* (.*$)/gim,`<li class="ms-3 mb-1">$1</li>`).replace(/\*\*(.*)\*\*/gim,`<strong>$1</strong>`).replace(/\n/g,`<br>`)}async function Mr(e,t,n){let{jsPDF:r}=await y(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-Cp9PwTtV.js`);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:i}=await y(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BcXxEeZj.js`);return{default:e}},[]);v.info(`Generando documento PDF...`);let a=new r,o=a.internal.pageSize.width;a.setFillColor(41,128,185),a.rect(0,0,o,40,`F`),a.setTextColor(255,255,255),a.setFontSize(22),a.text(`SOI - Sistema Operativo Institucional`,14,20),a.setFontSize(12),a.text(e.toUpperCase(),14,30),a.text(new Date().toLocaleDateString(),o-40,30),a.setTextColor(0,0,0),a.setFontSize(14),a.setFont(void 0,`bold`),a.text(`Análisis Crítico con IA`,14,55),a.setFontSize(10),a.setFont(void 0,`normal`);let s=t.replace(/[#*]/g,``).split(`
`).filter(e=>e.trim()!==``),c=65;s.forEach(e=>{let t=a.splitTextToSize(e.trim(),o-28);c+t.length*5>280&&(a.addPage(),c=20),a.text(t,14,c),c+=t.length*5+2}),n&&n.length>0&&i(a,{startY:c+10,head:[[`Indicador / Estudiante`,`Valor`,`Unidad`]],body:n.map(e=>[e.nombre,e.valor,e.unidad]),theme:`striped`,headStyles:{fillColor:[41,128,185]},styles:{fontSize:9}});let l=a.internal.getNumberOfPages();for(let e=1;e<=l;e++)a.setPage(e),a.setFontSize(8),a.setTextColor(150),a.text(`Página ${e} de ${l} - Generado por SOI Intelligence`,o/2,290,{align:`center`});a.save(`Reporte_SOI_${e.replace(/\s+/g,`_`)}.pdf`),v.success(`PDF descargado con éxito`)}function Nr(e,t){let n=W.reportes.find(t=>t.id===e);n&&b.open({title:`Editar Reporte`,size:`md`,saveText:`Guardar`,body:`
      <div class="mb-3">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-control" id="editReporteNombre" value="${n.nombre}">
      </div>
      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea class="form-control" id="editReporteDesc" rows="2">${n.descripcion}</textarea>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Tipo</label>
          <select class="form-select" id="editReporteTipo">
            <option value="asistencia" ${n.tipo===`asistencia`?`selected`:``}>Asistencia</option>
            <option value="progreso" ${n.tipo===`progreso`?`selected`:``}>Progreso</option>
            <option value="riesgo" ${n.tipo===`riesgo`?`selected`:``}>Riesgo</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Frecuencia</label>
          <select class="form-select" id="editReporteFreq">
            <option value="semanal" ${n.frecuencia===`semanal`?`selected`:``}>Semanal</option>
            <option value="mensual" ${n.frecuencia===`mensual`?`selected`:``}>Mensual</option>
          </select>
        </div>
      </div>
    `,onSave:()=>{let n=W.reportes.findIndex(t=>t.id===e);n!==-1&&(W.reportes[n]={...W.reportes[n],nombre:document.getElementById(`editReporteNombre`).value,descripcion:document.getElementById(`editReporteDesc`).value,tipo:document.getElementById(`editReporteTipo`).value,frecuencia:document.getElementById(`editReporteFreq`).value}),Er(t),b.close()}})}function Pr(e){let t=e.querySelector(`#generarAhoraSelect`).value;e.querySelector(`#genDesde`).value,e.querySelector(`#genHasta`).value;let n=e.querySelector(`input[name="genFormat"]:checked`).value;if(!t){alert(`Selecciona un reporte`);return}b.showLoading(`Generando reporte...`),setTimeout(()=>{b.close();let e=new Blob([`Reporte generado`],{type:`text/plain`}),r=URL.createObjectURL(e),i=document.createElement(`a`);i.href=r,i.download=`reporte-${t}-${new Date().toISOString().slice(0,10)}.${n}`,i.click(),URL.revokeObjectURL(r)},1500)}function Fr(){return new Date().toISOString().slice(0,10)}function Ir(){let e=new Date;return e.setDate(e.getDate()-7),e.toISOString().slice(0,10)}function Lr(){S.register(`metricas`,g),S.register(`metricas-alertas`,g),S.register(`metricas-riesgo`,g),S.register(`metricas-maestros`,g),S.register(`metricas-destacados`,g),S.register(`metricas-ia-reportes`,Tr)}new class{constructor(){this.cache=new Map,this.cacheExpiry=300*1e3}getCached(e){let t=this.cache.get(e);return t&&Date.now()-t.timestamp<this.cacheExpiry?t.data:null}setCached(e,t){this.cache.set(e,{data:t,timestamp:Date.now()})}async getDashboardData(){let e=this.getCached(`dashboard`);if(e)return e;let t={periodoActivo:await ie(),alertas:await ge(),alertasActivas:await ue()};return this.setCached(`dashboard`,t),t}async getTasaAsistenciaAlumno(e,t=30){let n=new Date;return n.setDate(n.getDate()-t),_e(e,n.toISOString().split(`T`)[0])}calcularPorcentaje(e,t){return e<t.rojo?`rojo`:e<t.naranja?`naranja`:e<t.amarillo?`amarillo`:`verde`}generarAlertas(e,t){let n=[];return e<t.umbral_rojo?n.push({nivel:`rojo`,mensaje:`Asistencia crítica`}):e<t.umbral_naranja?n.push({nivel:`naranja`,mensaje:`Asistencia baja`}):e<t.umbral_amarillo&&n.push({nivel:`amarillo`,mensaje:`Precaución`}),n}clearCache(){this.cache.clear()}};var Rr=`system_config`;async function zr(e){let{data:t,error:n}=await _.from(Rr).select(`value`).eq(`key`,e).single();return n?(console.warn(`Config not found:`,e),null):t?.value}async function Br(e,t){let{error:n}=await _.from(Rr).upsert({key:e,value:t,updated_at:new Date().toISOString()},{onConflict:`key`});if(n)throw console.error(`Error saving config:`,n),n;return{key:e,value:t}}async function Vr(){return zr(`groq_api_key`)}async function Hr(e){return Br(`groq_api_key`,e)}async function Ur(){return zr(`openrouter_api_key`)}async function Wr(e){return Br(`openrouter_api_key`,e)}async function Gr(){return zr(`preferred_ai_model`)}async function Kr(e){return Br(`preferred_ai_model`,e)}function qr(){S.register(`configuracion`,async e=>{let{renderConfigView:t}=await y(async()=>{let{renderConfigView:e}=await import(`./configView-CoG83rdM.js`);return{renderConfigView:e}},__vite__mapDeps([7,8,4,1,9]));await t(e)}),S.register(`importar-datos`,async e=>{let{renderImportView:t}=await y(async()=>{let{renderImportView:e}=await import(`./importView-uwHskkD8.js`);return{renderImportView:e}},__vite__mapDeps([10,1]));await t(e)})}function Jr(e=[]){return!e||e.length===0?`
            <div class="pm-empty">
                <i class="bi bi-person-badge"></i>
                <p>No hay datos disponibles en el radar institucional.</p>
            </div>
        `:`
        <div class="aa-table-container pm-animate-fade-in">
            <table class="aa-table">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Nivel Actual</th>
                        <th>Progreso</th>
                        <th>Última Actividad</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${e.map(e=>Yr(e)).join(``)}
                </tbody>
            </table>
        </div>
    `}function Yr(e){let t=e.progress_percentage||0,n=t<40?`progress-low`:t<80?`progress-mid`:`progress-high`,r=e.health_status||`not_started`,i=e.last_activity_at?new Date(e.last_activity_at).toLocaleDateString():`Sin actividad`;return`
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="pm-asist-avatar">${e.student_name.charAt(0)}</div>
                    <div>
                        <div class="aa-hotspot-name">${e.student_name}</div>
                        <div class="aa-hotspot-level">${e.seccion||`S/S`}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="pm-asist-instrumento">${e.current_level||`Nivel 0`}</span>
            </td>
            <td>
                <div class="aa-progress-wrapper" title="${t}% completado">
                    <div class="aa-progress-bar">
                        <div class="aa-progress-fill ${n}" style="width: ${t}%"></div>
                    </div>
                    <span class="pm-asist-instrumento">${t}%</span>
                </div>
            </td>
            <td>
                <span class="pm-asist-instrumento" title="Inactivo hace ${e.days_inactive} días">
                    ${i}
                </span>
            </td>
            <td>
                <span class="aa-badge aa-badge-${r}">
                    ${r.replace(`_`,` `)}
                </span>
            </td>
        </tr>
    `}function Xr(e=[]){return!e||e.length===0?`
            <div class="pm-empty">
                <i class="bi bi-fire"></i>
                <p>No se han detectado puntos críticos pedagógicos.</p>
            </div>
        `:`
        <div class="aa-hotspots-grid pm-animate-fade-in">
            ${e.map(e=>Zr(e)).join(``)}
        </div>
    `}function Zr(e){let t=e.failure_percentage||0;return`
        <div class="aa-hotspot-card">
            <div class="aa-hotspot-header">
                <div>
                    <div class="aa-hotspot-name">${e.node_name}</div>
                    <div class="aa-hotspot-level">${e.level_name}</div>
                </div>
                <div class="aa-hotspot-rate">${t}%</div>
            </div>
            <div class="aa-hotspot-meta">
                <span>Total intentos: ${e.total_attempts}</span>
                <span class="ms-2">Fallidos: ${e.failed_attempts}</span>
            </div>
            <div class="aa-progress-bar">
                <div class="aa-progress-fill progress-low" style="width: ${t}%"></div>
            </div>
        </div>
    `}async function Qr(){return`
        <div class="academic-admin-container">
            <header class="mb-5">
                <h1 class="aa-title">Torre de Control</h1>
                <p class="aa-subtitle">Análisis de Progreso Académico Institucional</p>
            </header>

            <!-- Sección 1: Radar Institucional (Visión General Alumnos) -->
            <section class="aa-glass-panel">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="aa-hotspot-name fs-4">Radar de Estudiantes</h2>
                    <div class="aa-badge aa-badge-active">Actualizado ahora</div>
                </div>
                <div id="radar-container">
                    ${Jr([])}
                </div>
            </section>

            <!-- Sección 2: Hotspots Pedagógicos (Dificultad por Nodo) -->
            <section class="mt-5">
                <h2 class="aa-hotspot-name fs-4 mb-4">Puntos de Calor Pedagógicos</h2>
                <div id="hotspots-container">
                    ${Xr([])}
                </div>
            </section>
        </div>
    `}function $r(){S.register(`gestion-curricular`,e=>{he(e)}),S.register(`planificacion-curricular`,e=>{he(e)}),S.register(`torre-de-control`,async e=>{e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{e.innerHTML=await Qr()}catch(t){e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el dashboard: ${t.message}</p></div>`}})}async function ei(){try{let{data:e,error:t}=await _.from(`maestro_desempeño`).select(`
        id,
        maestro_id,
        maestros(id, nombre_completo),
        total_sesiones,
        sesiones_verde,
        sesiones_amarillo,
        sesiones_naranja,
        sesiones_rojo,
        categoria,
        tendencia,
        fecha_ultima_evaluacion,
        updated_at
        `).order(`updated_at`,{ascending:!1});if(t)throw console.error(`[getMaestrosComplianceStatus] Error:`,t),t;return e||[]}catch(e){throw console.error(`[getMaestrosComplianceStatus] Exception:`,e),e}}async function ti(e){try{let{data:t,error:n}=await _.from(`registros_pendientes`).select(`
        id,
        created_at,
        notification_state,
        notif_count,
        last_notified_at,
        clases(nombre),
        sesiones_clase(fecha, hora_inicio)
        `).eq(`maestro_id`,e).eq(`estado`,`pendiente`).in(`tipo`,[`asistencia_pendiente`,`contenido_pendiente`]).order(`created_at`,{ascending:!1});if(n)throw console.error(`[getMaestroPendingRegistros] Error:`,n),n;return t||[]}catch(e){throw console.error(`[getMaestroPendingRegistros] Exception:`,e),e}}var ni=class{constructor(e){this.containerId=e,this.container=document.getElementById(e),this.maestros=[],this.filteredMaestros=[],this.currentFilter={categoria:null,estado:null,diasAtrasoMin:0,diasAtrasoMax:999}}async init(){try{this.container.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando cumplimiento de maestros...</div>
        </div>
      `,await this.loadData(),this.render(),this.attachEventListeners(),console.log(`[CumplimientoMaestrosWidget] Initialized with`,this.maestros.length,`maestros`)}catch(e){console.error(`[CumplimientoMaestrosWidget] Init error:`,e),this.container.innerHTML=`
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando datos: ${e.message}</div>
        </div>
      `}}async loadData(){let e=await ei();this.maestros=await Promise.all(e.map(async e=>{let t=await this.getPendingCount(e.maestro_id),n=await this.getOldestDiasAtraso(e.maestro_id);return{...e,pendingCount:t,oldestDiasAtraso:n,statusColor:this.getStatusColor(e.categoria),categoryLabel:this.getCategoryLabel(e.categoria)}})),this.filteredMaestros=[...this.maestros]}async getPendingCount(e){try{return(await ti(e)).length}catch{return 0}}async getOldestDiasAtraso(e){try{let t=await ti(e);return t.length===0?0:t.reduce((e,t)=>{let n=new Date(t.created_at).getTime(),r=Math.ceil((Date.now()-n)/(1e3*60*60*24));return Math.max(e,r)},0)}catch{return 0}}getStatusColor(e){return{responsable:`#10b981`,regular:`#f59e0b`,incumplidor:`#f97316`,negligente:`#dc2626`}[e]||`#9ca3af`}getCategoryLabel(e){return{responsable:`Responsable ✓`,regular:`Regular`,incumplidor:`Incumplidor`,negligente:`Negligente ⚠️`}[e]||e}applyFilter(e){this.currentFilter={...this.currentFilter,...e},this.filteredMaestros=this.maestros.filter(e=>!(this.currentFilter.categoria&&e.categoria!==this.currentFilter.categoria||this.currentFilter.diasAtrasoMin&&e.oldestDiasAtraso<this.currentFilter.diasAtrasoMin||this.currentFilter.diasAtrasoMax&&e.oldestDiasAtraso>this.currentFilter.diasAtrasoMax)),this.render()}render(){let e=`
      <div class="distribution-card">
        <div class="admin-header-brand mb-4">
          <div class="admin-header-icon-wrapper" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="admin-header-title-section">
            <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em;">Cumplimiento de Maestros</h3>
            <p class="subtitle" style="margin: 0.25rem 0 0; color: #6b7280; font-size: 0.85rem;">
              Estado de registros de asistencias y observaciones
            </p>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="admin-toolbar-dense">
          <div class="premium-select-container">
            <i class="bi bi-funnel"></i>
            <select id="filterCategoria" class="premium-select">
              <option value="">Todas las Categorías</option>
              <option value="responsable" ${this.currentFilter.categoria===`responsable`?`selected`:``}>Responsable</option>
              <option value="regular" ${this.currentFilter.categoria===`regular`?`selected`:``}>Regular</option>
              <option value="incumplidor" ${this.currentFilter.categoria===`incumplidor`?`selected`:``}>Incumplidor</option>
              <option value="negligente" ${this.currentFilter.categoria===`negligente`?`selected`:``}>Negligente</option>
            </select>
          </div>

          <div class="premium-select-container">
            <i class="bi bi-clock-history"></i>
            <select id="filterDiasAtraso" class="premium-select">
              <option value="">Cualquier Atraso</option>
              <option value="1-2">1-2 días</option>
              <option value="3-6">3-6 días</option>
              <option value="7-999">7+ días</option>
            </select>
          </div>

          <button id="btnRefresh" class="btn-premium-action btn-premium-secondary ms-auto">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
        </div>

        <!-- Stats Overview Cards -->
        <div class="metrics-grid mb-4">
          <div class="stat-card success" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem;">${this.maestros.filter(e=>e.categoria===`responsable`).length}</div>
            <div class="stat-label" style="font-size: 0.7rem; margin-bottom: 0;">Responsables</div>
          </div>
          <div class="stat-card warning" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem;">${this.maestros.filter(e=>e.categoria===`regular`).length}</div>
            <div class="stat-label" style="font-size: 0.7rem; margin-bottom: 0;">Regulares</div>
          </div>
          <div class="stat-card alert" style="padding: 1rem 1.25rem; border-left-color: #f97316; background: linear-gradient(135deg, rgba(249, 115, 22, 0.03) 0%, rgba(245, 158, 11, 0.03) 100%);">
            <div class="stat-value" style="font-size: 1.75rem;">${this.maestros.filter(e=>e.categoria===`incumplidor`).length}</div>
            <div class="stat-label" style="font-size: 0.7rem; margin-bottom: 0;">Incumplidores</div>
          </div>
          <div class="stat-card alert" style="padding: 1rem 1.25rem;">
            <div class="stat-value" style="font-size: 1.75rem;">${this.maestros.filter(e=>e.categoria===`negligente`).length}</div>
            <div class="stat-label" style="font-size: 0.7rem; margin-bottom: 0;">Negligentes</div>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="premium-table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Maestro</th>
                <th>Estado</th>
                <th>Días de Atraso</th>
                <th>Categoría</th>
                <th>Sesiones Pendientes</th>
                <th>Última Notificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${this.filteredMaestros.length===0?`<tr><td colspan="7" class="premium-no-data"><i class="bi bi-inbox fs-4 d-block mb-2 text-secondary"></i>No hay maestros que coincidan con los filtros</td></tr>`:this.filteredMaestros.map(e=>this.renderMaestroRow(e)).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `;this.container.innerHTML=e}renderMaestroRow(e){let t=e.updated_at?new Date(e.updated_at).toLocaleString():`Nunca`,n=this.getStatusColor(e.categoria);return`
      <tr>
        <td><strong>${e.maestros?.nombre_completo||`Unknown`}</strong></td>
        <td>
          <span class="status-badge" style="background-color: ${n}">
            ${e.categoria.toUpperCase()}
          </span>
        </td>
        <td><strong>${e.oldestDiasAtraso}</strong> días</td>
        <td>
          <span class="category-badge" style="background-color: ${n}15; color: ${n}">
            ${e.categoryLabel}
          </span>
        </td>
        <td><strong>${e.pendingCount}</strong> sesiones</td>
        <td class="text-secondary" style="font-size: 0.8rem;">${t}</td>
        <td>
          <button class="btn-action-small btn-action-success-light btn-contactar" data-maestro-id="${e.maestro_id}">
            <i class="bi bi-chat-dots"></i> Contactar
          </button>
          <button class="btn-action-small btn-action-primary-light btn-detalle" data-maestro-id="${e.maestro_id}">
            <i class="bi bi-eye"></i> Detalle
          </button>
        </td>
      </tr>
    `}attachEventListeners(){let e=document.getElementById(`filterCategoria`),t=document.getElementById(`filterDiasAtraso`),n=document.getElementById(`btnRefresh`);e?.addEventListener(`change`,e=>{this.applyFilter({categoria:e.target.value||null})}),t?.addEventListener(`change`,e=>{if(!e.target.value)this.applyFilter({diasAtrasoMin:0,diasAtrasoMax:999});else{let t=e.target.value.split(`-`);this.applyFilter({diasAtrasoMin:t[0]?parseInt(t[0]):0,diasAtrasoMax:t[1]?parseInt(t[1]):999})}}),n?.addEventListener(`click`,()=>{this.init()}),this.container.querySelectorAll(`.btn-contactar`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.closest(`.btn-contactar`).dataset.maestroId;this.onContactarMaestro(t)})}),this.container.querySelectorAll(`.btn-detalle`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.closest(`.btn-detalle`).dataset.maestroId;this.onDetalleMaestro(t)})})}onContactarMaestro(e){let t=this.maestros.find(t=>t.maestro_id===e);if(!t)return;let n=t.maestros?.email;n?window.location.href=`mailto:${n}?subject=Seguimiento%20Registros%20Asistencias`:alert(`No hay email disponible para este maestro`)}onDetalleMaestro(e){let t=this.maestros.find(t=>t.maestro_id===e);t&&(console.log(`View detail for maestro:`,e,t),window.location.href=`/admin/maestros/${e}/detail`)}};async function ri(){try{let{data:e,error:t}=await _.from(`teacher_class_fill_metrics_aggregated`).select(`*`).order(`maestro_nombre`,{ascending:!0});if(t)throw t;return e||[]}catch(e){throw console.error(`[getTeacherFillingMetrics] Error:`,e),e}}function ii(e){let t={};e.forEach(e=>{t[e.fecha]||(t[e.fecha]={total_classes:0,asistencia_first:0,ai_usage_sum:0,observaciones_first:0}),t[e.fecha].total_classes++,e.orden_asistencia_primero===1&&t[e.fecha].asistencia_first++,t[e.fecha].ai_usage_sum+=e.uso_ai_fill_percent||0,e.orden_observaciones_primero===1&&t[e.fecha].observaciones_first++});let n={};return Object.entries(t).forEach(([e,t])=>{n[e]={total_classes:t.total_classes,asistencia_first_percent:(t.asistencia_first/t.total_classes*100).toFixed(1),avg_ai_usage_percent:(t.ai_usage_sum/t.total_classes).toFixed(1),observaciones_first_percent:(t.observaciones_first/t.total_classes*100).toFixed(1)}}),n}function ai(e){let t={};e.forEach(e=>{t[e.maestro_id]||(t[e.maestro_id]={maestro_nombre:e.maestro_nombre,total_classes:0,asistencia_first:0,ai_usage_sum:0,avg_duration:0,duration_count:0}),t[e.maestro_id].total_classes++,e.orden_asistencia_primero===1&&t[e.maestro_id].asistencia_first++,t[e.maestro_id].ai_usage_sum+=e.uso_ai_fill_percent||0,e.promedio_duracion_observaciones&&(t[e.maestro_id].avg_duration+=e.promedio_duracion_observaciones,t[e.maestro_id].duration_count++)});let n={};return Object.entries(t).forEach(([e,t])=>{n[e]={maestro_nombre:t.maestro_nombre,total_classes:t.total_classes,asistencia_first_percent:(t.asistencia_first/t.total_classes*100).toFixed(1),avg_ai_usage_percent:(t.ai_usage_sum/t.total_classes).toFixed(1),avg_observation_duration:t.duration_count>0?(t.avg_duration/t.duration_count).toFixed(1):0}}),n}async function oi(){try{let{data:e,error:t}=await _.from(`maestro_desempeño`).select(`
        id,
        maestro_id,
        maestros(nombre_completo),
        categoria,
        tendencia,
        total_sesiones,
        sesiones_verde,
        sesiones_amarillo,
        sesiones_naranja,
        sesiones_rojo,
        updated_at
        `).order(`updated_at`,{ascending:!1});if(t)throw t;let n=(e||[]).reduce((e,t)=>(e[t.categoria]=(e[t.categoria]||0)+1,e),{}),r=(e||[]).reduce((e,t)=>(e[t.tendencia]=(e[t.tendencia]||0)+1,e),{}),i=(e||[]).reduce((e,t)=>e+t.total_sesiones,0),a=(e||[]).reduce((e,t)=>e+t.sesiones_verde,0),o=i>0?(a/i*100).toFixed(2):0;return{totalMaestros:e?.length||0,byCategory:n,byTrend:r,overallComplianceRate:o,totalSessions:i,completedSessions:a,data:e||[],generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getInstitutionComplianceSummary] Error:`,e),e}}async function si(){try{let{data:e,error:t}=await _.from(`registros_pendientes`).select(`
        id,
        maestro_id,
        notification_state,
        created_at,
        notif_count,
        maestros(nombre_completo)
        `).in(`notification_state`,[`NARANJA`,`ROJO`]).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!1});if(t)throw t;let n=(e||[]).reduce((e,t)=>(e[t.maestro_id]||(e[t.maestro_id]={maestroId:t.maestro_id,nombre:t.maestros?.nombre_completo,email:t.maestros?.email,naranja:[],rojo:[]}),t.notification_state===`NARANJA`?e[t.maestro_id].naranja.push(t):e[t.maestro_id].rojo.push(t),e),{}),r=Object.values(n).map(e=>{let t=[...e.naranja,...e.rojo],n=Math.max(...t.map(e=>new Date(e.created_at).getTime())),r=Math.ceil((Date.now()-n)/(1e3*60*60*24));return{...e,diasAtraso:r,naranjaCount:e.naranja.length,rojoCount:e.rojo.length,totalCount:t.length,urgency:e.rojo.length>0?`CRITICA`:`ALTA`}});return{totalCritical:r.length,byUrgency:{critica:r.filter(e=>e.urgency===`CRITICA`).length,alta:r.filter(e=>e.urgency===`ALTA`).length},maestros:r.sort((e,t)=>t.diasAtraso-e.diasAtraso),generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getCriticalMaestrosReport] Error:`,e),e}}async function ci(e=`csv`){try{let t=await oi();if(e===`csv`){let e=`REPORTE DE CUMPLIMIENTO DE MAESTROS
`;return e+=`Generado: ${new Date().toLocaleString()}\n\n`,e+=`RESUMEN GENERAL
`,e+=`Total de Maestros,${t.totalMaestros}\n`,e+=`Tasa de Cumplimiento,${t.overallComplianceRate}%\n`,e+=`Sesiones Completadas,${t.completedSessions}/${t.totalSessions}\n\n`,e+=`POR CATEGORÍA
`,e+=`Categoría,Cantidad
`,Object.entries(t.byCategory).forEach(([t,n])=>{e+=`${t},${n}\n`}),e+=`
POR TENDENCIA
`,e+=`Tendencia,Cantidad
`,Object.entries(t.byTrend).forEach(([t,n])=>{e+=`${t},${n}\n`}),e}return t}catch(e){throw console.error(`[exportComplianceReport] Error:`,e),e}}async function li(e=30){try{let t=new Date(Date.now()-e*24*60*60*1e3).toISOString().split(`T`)[0],n=(await ri()).filter(e=>e.fecha>=t),r=ii(n),i=ai(n);return{daysBack:e,total_classes:n.length,total_maestros:Object.keys(i).length,date_trends:r,maestro_trends:i,institution_summary:{avg_ai_usage_institution:n.length>0?(n.reduce((e,t)=>e+(t.uso_ai_fill_percent||0),0)/n.length).toFixed(1):0,asistencia_first_percent:n.length>0?(n.filter(e=>e.orden_asistencia_primero===1).length/n.length*100).toFixed(1):0,observaciones_first_percent:n.length>0?(n.filter(e=>e.orden_observaciones_primero===1).length/n.length*100).toFixed(1):0},generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getInstitutionTrendReportWithFilling] Error:`,e),e}}var ui=class{constructor(e){this.containerId=e,this.container=document.getElementById(e),this.summary=null,this.critical=null}async init(){try{this.container.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando reportes institucionales...</div>
        </div>
      `,await this.loadData(),this.render(),this.attachEventListeners(),console.log(`[DirectorReportingPanel] Initialized`)}catch(e){console.error(`[DirectorReportingPanel] Init error:`,e),this.container.innerHTML=`
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando reportes: ${e.message}</div>
        </div>
      `}}async loadData(){this.summary=await oi(),this.critical=await si()}render(){let e=`
      <div class="admin-dashboard-container">
        <!-- Premium Page Header -->
        <div class="admin-header-premium mb-4">
          <div class="admin-header-brand">
            <div class="admin-header-icon-wrapper">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <div class="admin-header-title-section">
              <h1 class="page-title">Reporte Institucional de Cumplimiento</h1>
              <div class="admin-header-subtitle">
                Análisis de desempeño de maestros en registro de asistencias
                <span class="badge">${this.summary.totalMaestros} Maestros</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Metrics -->
        <section class="metrics-section">
          <h2>Métricas Generales</h2>
          <div class="metrics-grid">
            <div class="stat-card primary">
              <div class="stat-label">Tasa de Cumplimiento</div>
              <div class="stat-value">${this.summary.overallComplianceRate}%</div>
              <div class="stat-subtitle">${this.summary.completedSessions}/${this.summary.totalSessions} sesiones</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total de Maestros</div>
              <div class="stat-value">${this.summary.totalMaestros}</div>
              <div class="stat-subtitle">Plantilla institucional</div>
            </div>
            <div class="stat-card success">
              <div class="stat-label">Maestros Responsables</div>
              <div class="stat-value">${this.summary.byCategory.responsable||0}</div>
              <div class="stat-subtitle">Cumplimiento óptimo</div>
            </div>
            <div class="stat-card alert">
              <div class="stat-label">Críticos (NARANJA/ROJO)</div>
              <div class="stat-value">${this.critical.totalCritical}</div>
              <div class="stat-subtitle">Requieren atención</div>
            </div>
          </div>
        </section>

        <!-- Category & Trend Distributions -->
        <section class="distribution-section">
          <div class="distribution-card">
            <h3>Distribución por Categoría</h3>
            <div class="distribution-chart">
              ${this.renderCategoryDistribution()}
            </div>
          </div>
          <div class="distribution-card">
            <h3>Distribución por Tendencia</h3>
            <div class="distribution-chart">
              ${this.renderTrendDistribution()}
            </div>
          </div>
        </section>

        <!-- Critical Maestros Alert -->
        ${this.critical.totalCritical>0?`
          <section class="critical-section">
            <h2><i class="bi bi-exclamation-octagon"></i> Maestros en Estado Crítico (${this.critical.totalCritical})</h2>
            <div class="premium-table-container">
              ${this.renderCriticalTable()}
            </div>
          </section>
        `:``}

        <!-- Actions Toolbar -->
        <div class="admin-toolbar-dense">
          <button id="btnExportCSV" class="btn-premium-action btn-premium-success">
            <i class="bi bi-download"></i> Descargar Reporte CSV
          </button>
          <button id="btnRefresh" class="btn-premium-action btn-premium-primary">
            <i class="bi bi-arrow-clockwise"></i> Actualizar
          </button>
        </div>

        <div class="generated-timestamp-premium">
          Generado: ${new Date(this.summary.generatedAt).toLocaleString()}
        </div>
      </div>
    `;this.container.innerHTML=e}renderCategoryDistribution(){let e=Math.max(...Object.values(this.summary.byCategory));return Object.entries(this.summary.byCategory).map(([t,n])=>{let r=(n/e*100).toFixed(1);return`
          <div class="distribution-item">
            <div class="distribution-label">${t.toUpperCase()}</div>
            <div class="distribution-bar">
              <div class="distribution-fill" style="width: ${r}%">${r}%</div>
            </div>
            <div class="distribution-count">${n}</div>
          </div>
        `}).join(``)}renderTrendDistribution(){let e=Math.max(...Object.values(this.summary.byTrend));return Object.entries(this.summary.byTrend).map(([t,n])=>{let r=(n/e*100).toFixed(1);return`
          <div class="distribution-item">
            <div class="distribution-label">${t.toUpperCase()}</div>
            <div class="distribution-bar">
              <div class="distribution-fill" style="width: ${r}%">${r}%</div>
            </div>
            <div class="distribution-count">${n}</div>
          </div>
        `}).join(``)}renderCriticalTable(){return`
      <table class="premium-table">
        <thead>
          <tr>
            <th>Maestro</th>
            <th>Días de Atraso</th>
            <th>NARANJA</th>
            <th>ROJO</th>
            <th>Total Pendiente</th>
            <th>Urgencia</th>
          </tr>
        </thead>
        <tbody>
          ${this.critical.maestros.map(e=>`
            <tr>
              <td><strong>${e.nombre}</strong></td>
              <td>${e.diasAtraso} días</td>
              <td><span class="badge bg-warning bg-opacity-10 text-warning px-2 py-1">${e.naranjaCount}</span></td>
              <td>
                <span class="badge ${e.rojoCount>0?`bg-danger text-white`:`bg-secondary bg-opacity-10 text-secondary`} px-2 py-1">
                  ${e.rojoCount}
                </span>
              </td>
              <td><strong>${e.totalCount}</strong></td>
              <td>
                <span class="urgency-indicator ${e.urgency===`CRITICA`?`text-danger`:`text-warning`}">
                  <i class="bi ${e.urgency===`CRITICA`?`bi-fire`:`bi-exclamation-triangle`}"></i> ${e.urgency}
                </span>
              </td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `}attachEventListeners(){let e=document.getElementById(`btnExportCSV`),t=document.getElementById(`btnRefresh`);e?.addEventListener(`click`,()=>this.exportReport()),t?.addEventListener(`click`,()=>this.init())}async exportReport(){try{let e=await ci(`csv`),t=new Blob([e],{type:`text/csv`}),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`reporte-cumplimiento-${new Date().toISOString().split(`T`)[0]}.csv`,r.click(),window.URL.revokeObjectURL(n),console.log(`[DirectorReportingPanel] CSV exported`)}catch(e){console.error(`[DirectorReportingPanel] Export error:`,e),alert(`Error al descargar reporte: `+e.message)}}};function di(e){let t=document.getElementById(e);function n(e){return`
      <div class="premium-table-container">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Maestro</th>
              <th>Total Clases</th>
              <th>Asistencia 1°</th>
              <th>Duración Obs (seg)</th>
              <th>IA Promedio</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(e=>`
              <tr>
                <td><strong>${e.maestro_nombre}</strong></td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">${e.total_clases||0}</span></td>
                <td><span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1">${e.orden_asistencia_primero||0}</span></td>
                <td><span class="badge bg-warning bg-opacity-10 text-warning px-2 py-1">${e.promedio_duracion_observaciones||0}s</span></td>
                <td>
                  <span class="badge ${e.uso_ai_fill_percent>70?`bg-success text-white`:e.uso_ai_fill_percent>30?`bg-primary text-white`:`bg-secondary bg-opacity-10 text-secondary`} px-2 py-1">
                    ${e.uso_ai_fill_percent||0}%
                  </span>
                </td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `}function r(e){let t=e.length,n=e.filter(e=>e.orden_asistencia_primero===1).length,r=e.filter(e=>e.orden_observaciones_primero===1).length,i=e.filter(e=>e.orden_simultaneo===1).length,a=e.length>0?(e.reduce((e,t)=>e+(t.uso_ai_fill_percent||0),0)/e.length).toFixed(1):0;return{asistenciaPrimero:t>0?(n/t*100).toFixed(1):0,observacionesPrimero:t>0?(r/t*100).toFixed(1):0,simultaneo:t>0?(i/t*100).toFixed(1):0,avgAiUsage:a,total:t}}return{async init(){t.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando analítica...</div>
        </div>
      `;try{let e=await ri();if(!e||e.length===0){t.innerHTML=`
            <div class="analytics-widget">
              <div class="premium-no-data">No hay datos disponibles</div>
            </div>
          `;return}this.render(e)}catch(e){console.error(`[analyticsFillingBehaviorWidget] Error:`,e),t.innerHTML=`
          <div class="premium-error-card">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>Error cargando analítica: ${e.message}</div>
          </div>
        `}},render(e){if(e.length===0)return;let i=r(e);t.innerHTML=`
        <div class="analytics-widget">
          <h2><i class="bi bi-bar-chart-steps text-primary"></i> Analítica de Llenado de Asistencias</h2>
          
          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-label">Asistencia Primero</div>
              <div class="stat-value">${i.asistenciaPrimero}%</div>
              <div class="stat-subtitle">Orden de llenado preferido</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Observaciones Primero</div>
              <div class="stat-value">${i.observacionesPrimero}%</div>
              <div class="stat-subtitle">Enfoque en comentarios</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-label">Simultáneo</div>
              <div class="stat-value">${i.simultaneo}%</div>
              <div class="stat-subtitle">Registro en tiempo real</div>
            </div>
            <div class="stat-card success">
              <div class="stat-label">Uso IA Promedio</div>
              <div class="stat-value">${i.avgAiUsage}%</div>
              <div class="stat-subtitle">Asistente activado</div>
            </div>
          </div>

          <section class="maestro-metrics-section">
            <h3>Detalle por Maestro</h3>
            ${n(e)}
          </section>
        </div>
      `}}}function fi(e){let t=document.getElementById(e),n=null;function r(e){return`
      <div class="trend-summary-cards">
        <div class="trend-card primary">
          <div class="card-label">Uso de IA Promedio</div>
          <div class="card-value">${e.avg_ai_usage_institution||0}%</div>
          <div class="stat-subtitle">De las clases registradas</div>
        </div>
        <div class="trend-card success">
          <div class="card-label">Asistencia Primero</div>
          <div class="card-value">${e.asistencia_first_percent||0}%</div>
          <div class="stat-subtitle">Orden de llenado preferente</div>
        </div>
        <div class="trend-card warning">
          <div class="card-label">Observaciones Primero</div>
          <div class="card-value">${e.observaciones_first_percent||0}%</div>
          <div class="stat-subtitle">Enfoque en comentarios iniciales</div>
        </div>
      </div>
    `}function i(e){return`
      <div class="premium-table-container">
        <table class="trends-table premium-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total Clases</th>
              <th>Asistencia 1°</th>
              <th>Promedio IA</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(e).sort().reverse().slice(0,10).map(t=>`
              <tr>
                <td><strong>${t}</strong></td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">${e[t].total_classes||0}</span></td>
                <td><span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1">${e[t].asistencia_first_percent||0}%</span></td>
                <td><span class="badge bg-success bg-opacity-10 text-success px-2 py-1">${e[t].avg_ai_usage_percent||0}%</span></td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `}return{async init(){t.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando reportes de tendencias...</div>
        </div>
      `;try{n=await li(30),this.render()}catch(e){console.error(`[directorTrendReportView] Error:`,e),t.innerHTML=`
          <div class="premium-error-card">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>Error cargando tendencias: ${e.message}</div>
          </div>
        `}},render(){t.innerHTML=`
        <div class="director-trend-report">
          <!-- Premium Page Header -->
          <div class="report-header mb-4">
            <div class="admin-header-brand">
              <div class="admin-header-icon-wrapper">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <div class="admin-header-title-section">
                <h1>Reporte de Tendencias Institucionales</h1>
                <p>Análisis de comportamiento de llenado de asistencias últimos 30 días</p>
              </div>
            </div>
          </div>

          ${r(n.institution_summary)}

          <section class="date-trends-section">
            <h2>Tendencias por Fecha</h2>
            ${i(n.date_trends)}
          </section>

          <div class="generated-timestamp">
            Generado: ${new Date(n.generatedAt).toLocaleString()}
          </div>
        </div>
      `}}}function pi(){S.register(`admin-dashboard`,e=>{try{e.innerHTML=`<div id="admin-dashboard-container"></div>`,new ni(`admin-dashboard-container`).init()}catch(t){console.error(`[admin-dashboard] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar cumplimiento: ${t.message}</p></div>`}}),S.register(`admin-dashboard-reportes`,e=>{try{e.innerHTML=`<div id="director-reporting-container"></div>`,new ui(`director-reporting-container`).init()}catch(t){console.error(`[admin-dashboard-reportes] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar reportes: ${t.message}</p></div>`}}),S.register(`admin-dashboard-analitca-llenado`,e=>{try{e.innerHTML=`<div id="analytics-filling-container"></div>`,di(`analytics-filling-container`).init()}catch(t){console.error(`[admin-dashboard-analitca-llenado] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar analítica: ${t.message}</p></div>`}}),S.register(`admin-dashboard-tendencias`,e=>{try{e.innerHTML=`<div id="trend-report-container"></div>`,fi(`trend-report-container`).init()}catch(t){console.error(`[admin-dashboard-tendencias] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar tendencias: ${t.message}</p></div>`}})}var mi=[{id:`perm-001`,maestro_id:`maestro_001`,maestro_nombre:`Carlos Méndez`,maestro_email:`carlos.mendez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`planificacion:write`,`asistencias:write`],solicitudes:[],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-01-15T10:00:00Z`,actualizado_en:`2026-05-01T14:30:00Z`},{id:`perm-002`,maestro_id:`maestro_002`,maestro_nombre:`María López`,maestro_email:`maria.lopez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!1,permisos:[`alumnos:create`,`planificacion:write`],solicitudes:[`clases:enroll`],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-02-20T09:00:00Z`,actualizado_en:`2026-04-10T11:00:00Z`},{id:`perm-003`,maestro_id:`maestro_003`,maestro_nombre:`Ana Martínez`,maestro_email:`ana.martinez@ejemplo.com`,puede_registrar_alumnos:!1,puede_inscribir_clases:!1,permisos:[],solicitudes:[`alumnos:create`],concedido_por:null,concedido_por_nombre:null,creado_en:`2026-03-01T08:00:00Z`,actualizado_en:`2026-03-01T08:00:00Z`},{id:`perm-004`,maestro_id:`maestro_004`,maestro_nombre:`Pedro Ramírez`,maestro_email:`pedro.ramirez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`asistencias:write`],solicitudes:[],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-01-20T15:00:00Z`,actualizado_en:`2026-05-05T09:00:00Z`},{id:`perm-005`,maestro_id:`maestro_005`,maestro_nombre:`Laura Fernández`,maestro_email:`laura.fernandez@ejemplo.com`,puede_registrar_alumnos:!1,puede_inscribir_clases:!0,permisos:[`clases:enroll`],solicitudes:[`alumnos:create`],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-04-01T12:00:00Z`,actualizado_en:`2026-04-15T16:00:00Z`}],hi=e({actualizarPermiso:()=>yi,obtenerPermisoPorMaestro:()=>vi,obtenerPermisos:()=>_i}),gi=(e=300)=>new Promise(t=>setTimeout(t,e)),G=[...mi];function K(e){return e?{id:e.id,maestro_id:e.maestro_id??``,maestro_nombre:e.maestro_nombre??``,maestro_email:e.maestro_email??``,puede_registrar_alumnos:e.puede_registrar_alumnos??!1,puede_inscribir_clases:e.puede_inscribir_clases??!1,permisos:Array.isArray(e.permisos)?e.permisos:[],solicitudes:Array.isArray(e.solicitudes)?e.solicitudes:[],concedido_por:e.concedido_por??null,concedido_por_nombre:e.concedido_por_nombre??null,creado_en:e.creado_en||null,actualizado_en:e.actualizado_en||null}:null}async function _i(){return await gi(),G.map(K)}async function vi(e){await gi();let t=G.find(t=>t.maestro_id===e);return t?K(t):{id:null,maestro_id:e,maestro_nombre:``,maestro_email:``,puede_registrar_alumnos:!1,puede_inscribir_clases:!1,permisos:[],solicitudes:[],concedido_por:null,concedido_por_nombre:null,creado_en:null,actualizado_en:null}}async function yi(e,t){await gi();let n=G.findIndex(t=>t.maestro_id===e),r=new Date().toISOString();if(n===-1){let n={id:Math.random().toString(36).substr(2,9),maestro_id:e,maestro_nombre:t.maestro_nombre||``,maestro_email:t.maestro_email||``,puede_registrar_alumnos:t.puede_registrar_alumnos??!1,puede_inscribir_clases:t.puede_inscribir_clases??!1,permisos:Array.isArray(t.permisos)?t.permisos:[],solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:[],concedido_por:t.concedido_por||null,concedido_por_nombre:t.concedido_por_nombre||null,creado_en:r,actualizado_en:r};return G.push(n),K(n)}return G[n]={...G[n],puede_registrar_alumnos:t.puede_registrar_alumnos??G[n].puede_registrar_alumnos,puede_inscribir_clases:t.puede_inscribir_clases??G[n].puede_inscribir_clases,permisos:Array.isArray(t.permisos)?t.permisos:G[n].permisos,solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:G[n].solicitudes,concedido_por:t.concedido_por??G[n].concedido_por,concedido_por_nombre:t.concedido_por_nombre??G[n].concedido_por_nombre,actualizado_en:r},K(G[n])}var bi=()=>m.isDemoMode?hi:Ae,xi=(...e)=>bi().obtenerPermisos(...e),Si=(...e)=>bi().actualizarPermiso(...e),q={permisos:[],cargando:!1,togglingId:null,togglingField:null};function J(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function Ci(e){try{q.cargando=!0,wi(e),q.permisos=await xi(),q.cargando=!1,Ei(e),Ai(e)}catch(t){console.error(t),Ti(e,t.message)}}function wi(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando permisos...</p>
      </div>
    </div>
  `}function Ti(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${J(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>Ci(e))}function Ei(e){let t=E.getUser?E.getUser():null;t?.nombre_completo||t?.email,e.innerHTML=`
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-shield-lock me-2 text-primary"></i>Permisos de Maestros</span>
          <span class="badge bg-secondary">${q.permisos.length}</span>
        </div>
      </div>

      ${q.permisos.length?`
      <!-- Table -->
      <div class="table-scroll-container">
        <table class="table table-compact table-hover mb-0" id="permisosTable">
          <thead>
            <tr>
              <th style="width: 20%;">Maestro</th>
              <th style="width: 20%;">Email</th>
              <th style="width: 18%;">Registrar Alumnos</th>
              <th style="width: 18%;">Inscribir Clases</th>
              <th style="width: 14%;">Concedido por</th>
              <th style="width: 10%;">Actualizado</th>
            </tr>
          </thead>
          <tbody id="permisosTBody">
            ${Di()}
          </tbody>
        </table>
      </div>
      `:Oi()}

      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle"></i>
        Los cambios se guardan automáticamente al alternar un permiso.
        ${m.isDemoMode?`<span class="badge bg-warning text-dark ms-1">Demo</span>`:``}
      </div>
    </div>
  `}function Di(){return q.permisos.map(e=>{let t=q.togglingId===e.maestro_id,n=e.concedido_por_nombre||e.concedido_por||`-`,r=e.actualizado_en?new Date(e.actualizado_en).toLocaleDateString(`es-ES`,{day:`numeric`,month:`short`}):`-`,i=e.solicitudes||[],a=!e.puede_registrar_alumnos&&i.includes(`alumnos:create`),o=!e.puede_inscribir_clases&&i.includes(`clases:enroll`);return`
      <tr data-maestro-id="${J(e.maestro_id)}">
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-compact bg-primary text-white">${ki(e.maestro_nombre||e.maestro_id)}</div>
            <span class="text-truncate" style="max-width: 150px;" title="${J(e.maestro_nombre)}">${J(e.maestro_nombre||`Sin nombre`)}</span>
          </div>
        </td>
        <td class="text-truncate" style="max-width: 150px;" title="${J(e.maestro_email)}">${J(e.maestro_email||`-`)}</td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${J(e.maestro_id)}"
              data-field="puede_registrar_alumnos"
              ${e.puede_registrar_alumnos?`checked`:``}
              ${t?`disabled`:``}>
            <span class="small ${e.puede_registrar_alumnos?`text-success`:`text-muted`}">
              ${e.puede_registrar_alumnos?`Sí`:`No`}
            </span>
          </div>
          ${a?`
            <div class="mt-1 d-flex align-items-center gap-1">
              <span class="badge bg-warning text-dark" style="font-size: 0.65rem; padding: 2px 4px;"><i class="bi bi-exclamation-triangle"></i> Solicitado</span>
              <button class="btn btn-sm btn-outline-primary aprobar-btn px-1 py-0" 
                data-maestro-id="${J(e.maestro_id)}" 
                data-permiso="alumnos:create" 
                data-field="puede_registrar_alumnos" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          `:``}
        </td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${J(e.maestro_id)}"
              data-field="puede_inscribir_clases"
              ${e.puede_inscribir_clases?`checked`:``}
              ${t?`disabled`:``}>
            <span class="small ${e.puede_inscribir_clases?`text-success`:`text-muted`}">
              ${e.puede_inscribir_clases?`Sí`:`No`}
            </span>
          </div>
          ${o?`
            <div class="mt-1 d-flex align-items-center gap-1">
              <span class="badge bg-warning text-dark" style="font-size: 0.65rem; padding: 2px 4px;"><i class="bi bi-exclamation-triangle"></i> Solicitado</span>
              <button class="btn btn-sm btn-outline-primary aprobar-btn px-1 py-0" 
                data-maestro-id="${J(e.maestro_id)}" 
                data-permiso="clases:enroll" 
                data-field="puede_inscribir_clases" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          `:``}
        </td>
        <td class="small text-muted">${J(n)}</td>
        <td class="small text-muted">${r}</td>
      </tr>
    `}).join(``)}function Oi(){return`
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-shield-exclamation" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay permisos configurados</h4>
      <p class="text-muted">Los permisos aparecerán aquí cuando los administradores los configuren.</p>
    </div>
  `}function ki(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}function Ai(e){let t=e.querySelector(`#permisosTable`);t&&(t.addEventListener(`change`,async t=>{let n=t.target.closest(`.permiso-toggle`);if(!n)return;let r=n.dataset.maestroId,i=n.dataset.field,a=n.checked;n.disabled=!0,q.togglingId=r,q.togglingField=i;let o=n.closest(`.form-check`)?.querySelector(`span`);o&&(o.textContent=a?`Sí`:`No`,o.className=`small ${a?`text-success`:`text-muted`}`);try{let t=q.permisos.find(e=>e.maestro_id===r),n={[i]:a};if(t){if(a){let e=i===`puede_registrar_alumnos`?`alumnos:create`:`clases:enroll`,r=t.permisos||[];r.includes(e)||r.push(e);let a=(t.solicitudes||[]).filter(t=>t!==e),o=E.getUser?E.getUser():null,s=o?.nombre_completo||o?.email||`Administrador`;n={...n,permisos:r,solicitudes:a,concedido_por:o?.id||`admin`,concedido_por_nombre:s},t.permisos=r,t.solicitudes=a,t.concedido_por=o?.id||`admin`,t.concedido_por_nombre=s}else{let e=i===`puede_registrar_alumnos`?`alumnos:create`:`clases:enroll`,r=(t.permisos||[]).filter(t=>t!==e);n={...n,permisos:r},t.permisos=r}t.actualizado_en=new Date().toISOString()}await Si(r,n),t&&(t[i]=a),v.success(`Permiso actualizado: ${i===`puede_registrar_alumnos`?`Registrar Alumnos`:`Inscribir Clases`}`);let o=e.querySelector(`#permisosTBody`);o&&(o.innerHTML=Di())}catch(e){n.checked=!a,o&&(o.textContent=a?`No`:`Sí`,o.className=`small ${a?`text-muted`:`text-success`}`),v.error(`Error al actualizar permiso: `+e.message)}finally{n.disabled=!1,q.togglingId=null,q.togglingField=null}}),t.addEventListener(`click`,async t=>{let n=t.target.closest(`.aprobar-btn`);if(!n)return;let r=n.dataset.maestroId,i=n.dataset.permiso,a=n.dataset.field;n.disabled=!0;let o=n.innerHTML;n.innerHTML=`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;try{let t=q.permisos.find(e=>e.maestro_id===r);if(!t)throw Error(`No se encontró el registro de permisos del maestro`);let n=t.permisos||[];n.includes(i)||n.push(i);let o=(t.solicitudes||[]).filter(e=>e!==i),s=E.getUser?E.getUser():null,c=s?.nombre_completo||s?.email||`Administrador`;await Si(r,{permisos:n,solicitudes:o,concedido_por:s?.id||`admin`,concedido_por_nombre:c,[a]:!0}),t.permisos=n,t.solicitudes=o,t.concedido_por=s?.id||`admin`,t.concedido_por_nombre=c,t[a]=!0,t.actualizado_en=new Date().toISOString(),v.success(`Solicitud aprobada: ${a===`puede_registrar_alumnos`?`Registrar Alumnos`:`Inscribir Clases`}`);let l=e.querySelector(`#permisosTBody`);l&&(l.innerHTML=Di())}catch(e){v.error(`Error al aprobar solicitud: `+e.message),n.disabled=!1,n.innerHTML=o}}))}function ji(){S.register(`permisos`,Ci)}async function Mi(e){if(e){e.innerHTML=Fi();try{let[t,n]=await Promise.all([Ni(),Pi()]);e.innerHTML=Ii(t,n),Li(e)}catch(t){console.error(`[DashboardPedagogico]`,t),e.innerHTML=`
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar el dashboard: ${t.message}</div>
      </div>`}}}async function Ni(){let[e,t,n,r]=await Promise.all([_.from(`alumnos`).select(`id`,{count:`exact`}).eq(`activo`,!0),_.from(`planificaciones`).select(`id, estado`).gte(`fecha_inicio`,new Date(Date.now()-10080*60*1e3).toISOString().split(`T`)[0]),_.from(`clases`).select(`id`,{count:`exact`}).eq(`estado`,`activa`),_.from(`asistencias`).select(`estado`).gte(`fecha`,new Date(Date.now()-10080*60*1e3).toISOString().split(`T`)[0])]),i=r.data?.length||0,a=r.data?.filter(e=>e.estado===`P`).length||0,o=i>0?Math.round(a/i*100):null,s=t.data?.filter(e=>e.estado===`ejecutado`).length||0,c=t.data?.filter(e=>e.estado===`planificado`).length||0;return{alumnosActivos:e.count||0,clasesActivas:n.count||0,planesEstaSemana:t.data?.length||0,planesEjecutados:s,planesPlanificados:c,tasaAsistencia:o}}async function Pi(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],{data:t}=await _.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e);if(!t?.length)return[];let n={};t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]={total:0,presentes:0}),n[e.alumno_id].total++,e.estado===`P`&&n[e.alumno_id].presentes++});let r=Object.entries(n).filter(([,e])=>e.total>=4&&e.presentes/e.total<z.attendance_min_rate).map(([e])=>e);if(!r.length)return[];let{data:i}=await _.from(`alumnos`).select(`id, nombre_completo`).in(`id`,r.slice(0,5));return i||[]}function Fi(){return`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-grid-1x2 fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Dashboard Pedagógico</h1>
          <p class="text-muted small mb-0">Resumen del estado académico</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-dashboard" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>
      <div class="row g-3">
        ${[1,2,3,4].map(()=>`
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm" style="height:100px;">
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </div>
            </div>
          </div>`).join(``)}
      </div>
    </div>`}function Ii(e,t){let n=e.tasaAsistencia===null?`secondary`:e.tasaAsistencia>=80?`success`:e.tasaAsistencia>=60?`warning`:`danger`;return`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-grid-1x2 fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Dashboard Pedagógico</h1>
          <p class="text-muted small mb-0">Resumen del estado académico</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-dashboard" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <div class="row g-3 mb-4">
        ${Y(`bi-people-fill`,`Alumnos activos`,e.alumnosActivos,`primary`,null)}
        ${Y(`bi-easel2`,`Clases activas`,e.clasesActivas,`indigo`,null)}
        ${Y(`bi-journal-text`,`Planes esta semana`,e.planesEstaSemana,`success`,`${e.planesEjecutados} ejecutados · ${e.planesPlanificados} pendientes`)}
        ${Y(`bi-calendar-check`,`Asistencia (7 días)`,e.tasaAsistencia===null?`—`:e.tasaAsistencia+`%`,n,null)}
      </div>

      ${t.length?`
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-danger-subtle border-0 d-flex align-items-center justify-content-between">
          <span class="fw-semibold text-danger" style="font-size:0.9rem;">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Alumnos con asistencia baja (últimas 4 semanas)
          </span>
          <button class="btn btn-sm btn-outline-danger" data-nav="pedagogico-seguimiento">Ver todos</button>
        </div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            ${t.map(e=>`
              <li class="list-group-item d-flex align-items-center gap-3 py-2">
                <div class="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                     style="width:32px;height:32px;font-size:0.75rem;font-weight:700;">
                  ${e.nombre_completo.charAt(0)}
                </div>
                <span style="font-size:0.875rem;">${e.nombre_completo}</span>
                <span class="badge bg-danger-subtle text-danger ms-auto rounded-pill" style="font-size:0.65rem;">Riesgo</span>
              </li>`).join(``)}
          </ul>
        </div>
      </div>`:``}

      <div class="row g-3">
        ${X(`bi-journal-text`,`Planificación`,`Planes de clase, plantillas y revisión`,`planificacion`,`primary`)}
        ${X(`bi-person-lines-fill`,`Seguimiento`,`Progreso y asistencia por alumno`,`pedagogico-seguimiento`,`success`)}
        ${X(`bi-graph-up`,`Evaluaciones`,`Calificaciones y boletines`,`progresos`,`warning`)}
        ${X(`bi-file-earmark-bar-graph`,`Reportes`,`Rendimiento por clase y riesgo`,`pedagogico-reportes`,`info`)}
      </div>
    </div>`}function Y(e,t,n,r,i){return`
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi ${e} text-${r}" style="font-size:1.1rem;"></i>
            <span class="text-muted" style="font-size:0.75rem;">${t}</span>
          </div>
          <div class="fw-bold" style="font-size:1.6rem;line-height:1;">${n}</div>
          ${i?`<div class="text-muted mt-1" style="font-size:0.7rem;">${i}</div>`:``}
        </div>
      </div>
    </div>`}function X(e,t,n,r,i){return`
    <div class="col-12 col-sm-6 col-md-3">
      <div class="card border-0 shadow-sm h-100 quick-nav-card" data-nav="${r}"
           style="cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;">
        <div class="card-body d-flex flex-column gap-2">
          <div class="rounded-3 bg-${i} bg-opacity-10 text-${i} d-flex align-items-center justify-content-center"
               style="width:40px;height:40px;">
            <i class="bi ${e}" style="font-size:1.1rem;"></i>
          </div>
          <div class="fw-semibold" style="font-size:0.9rem;">${t}</div>
          <div class="text-muted" style="font-size:0.78rem;">${n}</div>
          <div class="mt-auto text-${i}" style="font-size:0.75rem;">
            Ir a ${t} <i class="bi bi-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>`}function Li(e){e.querySelectorAll(`[data-nav]`).forEach(e=>{e.addEventListener(`click`,()=>S.navigate(e.dataset.nav)),e.classList.contains(`quick-nav-card`)&&(e.addEventListener(`mouseenter`,()=>{e.style.transform=`translateY(-2px)`,e.style.boxShadow=`0 8px 25px rgba(0,0,0,0.12)`}),e.addEventListener(`mouseleave`,()=>{e.style.transform=``,e.style.boxShadow=``}))}),e.querySelector(`#btn-help-dashboard`)?.addEventListener(`click`,()=>{pe.open({title:`Dashboard Pedagógico`,intro:`Resumen general del estado académico de la institución. Te permite ver de un vistazo cómo están los alumnos, clases y planificaciones.`,sections:[{icon:`bi-people-fill`,title:`Alumnos activos`,description:`Cantidad total de alumnos con estado activo en el sistema.`,color:`#3b82f6`},{icon:`bi-easel2`,title:`Clases activas`,description:`Número de clases con estado "activa". Las clases inactivas o suspendidas no se cuentan.`,color:`#6366f1`},{icon:`bi-journal-text`,title:`Planes esta semana`,description:`Planificaciones con fecha de inicio en los últimos 7 días. Muestra cuántas fueron ejecutadas y cuántas siguen pendientes.`,color:`#10b981`},{icon:`bi-calendar-check`,title:`Asistencia (7 días)`,description:`Porcentaje de asistencia del total de la institución en los últimos 7 días. Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%.`,color:`#f59e0b`},{icon:`bi-exclamation-triangle-fill`,title:`Alumnos con asistencia baja`,description:`Alumnos que en las últimas 4 semanas tuvieron menos del 70% de asistencia (mínimo 4 clases). Requieren atención prioritaria.`,color:`#ef4444`},{icon:`bi-grid-1x2`,title:`Acceso rápido`,description:`Los 4 cards al pie llevan directamente a Planificación, Seguimiento de alumnos, Evaluaciones y Reportes. Hacé clic para navegar.`,color:`#3b82f6`}]})})}var Z={alumnos:[],asistenciaMap:{},progresosMap:{},observacionesMap:{},busqueda:``,container:null};async function Ri(e){if(e){Z.container=e,e.innerHTML=Ui();try{await zi(),Bi(),Hi()}catch(t){console.error(`[SeguimientoAlumnos]`,t),e.innerHTML=`<div class="page-container"><div class="alert alert-warning">${t.message}</div></div>`}}}async function zi(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],[t,n,r,i]=await Promise.all([_.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, activo`).eq(`activo`,!0).order(`nombre_completo`),_.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e),_.from(`progresos`).select(`alumno_id, calificacion`).not(`calificacion`,`is`,null),_.from(`observaciones`).select(`alumno_id, tipo, estado`).eq(`estado`,`activo`)]);Z.alumnos=t.data||[],Z.asistenciaMap={},(n.data||[]).forEach(e=>{Z.asistenciaMap[e.alumno_id]||(Z.asistenciaMap[e.alumno_id]={total:0,presentes:0}),Z.asistenciaMap[e.alumno_id].total++,e.estado===`P`&&Z.asistenciaMap[e.alumno_id].presentes++}),Object.values(Z.asistenciaMap).forEach(e=>{e.rate=e.total>0?e.presentes/e.total:null}),Z.progresosMap={};let a={};(r.data||[]).forEach(e=>{a[e.alumno_id]||(a[e.alumno_id]=[]),a[e.alumno_id].push(e.calificacion)}),Object.entries(a).forEach(([e,t])=>{let n=t.slice(-3);Z.progresosMap[e]={count:n.length,promedio:n.reduce((e,t)=>e+t,0)/n.length}}),Z.observacionesMap={},(i.data||[]).forEach(e=>{Z.observacionesMap[e.alumno_id]||(Z.observacionesMap[e.alumno_id]=[]),Z.observacionesMap[e.alumno_id].push(e)})}function Q(e){let t=Z.asistenciaMap[e],n=Z.progresosMap[e],r=[];return t?.total>=4&&t.rate<z.attendance_min_rate&&r.push(`asistencia`),n?.count>=1&&n.promedio<z.grade_min_avg&&r.push(`calificacion`),(Z.observacionesMap[e]||[]).some(e=>e.tipo===`disciplina`)&&r.push(`disciplina`),r}function Bi(){let e=Z.busqueda.toLowerCase(),t=Z.alumnos.filter(t=>!e||t.nombre_completo.toLowerCase().includes(e)||(t.instrumento_principal||``).toLowerCase().includes(e)),n=t.filter(e=>Q(e.id).length>0),r=t.filter(e=>Q(e.id).length===0),i=[...n,...r];Z.container.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-person-lines-fill fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Seguimiento de Alumnos</h1>
          <p class="text-muted small mb-0">${Z.alumnos.length} alumnos activos · ${n.length} en riesgo</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-seguimiento" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <div class="input-group mb-3" style="max-width:360px;">
        <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
        <input type="text" class="form-control border-start-0" id="busqueda-alumno"
               placeholder="Buscar alumno o instrumento..." value="${Z.busqueda}">
      </div>

      ${n.length?`
        <div class="alert alert-warning border-0 d-flex align-items-center gap-2 mb-3 py-2">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span style="font-size:0.85rem;"><strong>${n.length}</strong> alumno${n.length===1?``:`s`} requiere${n.length===1?``:`n`} atención</span>
        </div>`:``}

      <div class="d-flex flex-column gap-2" id="lista-alumnos">
        ${i.map(e=>Vi(e)).join(``)||`<div class="text-center text-muted py-5">Sin resultados</div>`}
      </div>
    </div>`,Hi()}function Vi(e){let t=Q(e.id),n=Z.asistenciaMap[e.id],r=Z.progresosMap[e.id],i=Z.observacionesMap[e.id]||[],a=n?.rate==null?null:Math.round(n.rate*100),o=a===null?`secondary`:a>=80?`success`:a>=60?`warning`:`danger`,s=r?r.promedio>=7?`success`:r.promedio>=5?`warning`:`danger`:`secondary`;return`
    <div class="alumno-row card border-0 shadow-sm" data-id="${e.id}"
         style="cursor:pointer;${t.length?`border-left:3px solid #f59e0b !important;`:``}transition:box-shadow 0.15s;">
      <div class="card-body py-2 px-3 d-flex align-items-center gap-3">
        <div class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold"
             style="width:38px;height:38px;font-size:0.85rem;background:${t.length?`#fef3c7`:`var(--bs-primary-bg-subtle)`};color:${t.length?`#92400e`:`var(--bs-primary)`};">
          ${e.nombre_completo.charAt(0)}
        </div>
        <div class="flex-grow-1 overflow-hidden">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="fw-semibold text-truncate" style="font-size:0.87rem;">${e.nombre_completo}</span>
            ${t.includes(`asistencia`)?`<span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill" style="font-size:0.6rem;">Asistencia baja</span>`:``}
            ${t.includes(`calificacion`)?`<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill" style="font-size:0.6rem;">Nota baja</span>`:``}
            ${t.includes(`disciplina`)?`<span class="badge rounded-pill" style="font-size:0.6rem;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;">Observación</span>`:``}
          </div>
          <div class="d-flex gap-3 mt-1" style="font-size:0.73rem;color:var(--bs-secondary-color);">
            ${e.instrumento_principal?`<span><i class="bi bi-music-note me-1"></i>${e.instrumento_principal}</span>`:``}
            <span title="Asistencia últimas 4 semanas">
              <i class="bi bi-calendar-check me-1 text-${o}"></i>
              ${a===null?`Sin datos`:`${a}%`}
            </span>
            <span title="Promedio últimas calificaciones">
              <i class="bi bi-star me-1 text-${s}"></i>
              ${r?r.promedio.toFixed(1):`Sin notas`}
            </span>
            ${i.length?`<span><i class="bi bi-chat-quote me-1 text-muted"></i>${i.length} obs.</span>`:``}
          </div>
        </div>
        <i class="bi bi-chevron-right text-muted flex-shrink-0"></i>
      </div>
    </div>`}function Hi(){Z.container.querySelector(`#btn-help-seguimiento`)?.addEventListener(`click`,()=>{pe.open({title:`Seguimiento de Alumnos`,intro:`Vista unificada del estado académico de cada alumno. Los alumnos con riesgo aparecen primero, destacados con una barra lateral amarilla.`,sections:[{icon:`bi-search`,title:`Buscador`,description:`Filtrá por nombre del alumno o por instrumento en tiempo real.`,color:`#6b7280`},{icon:`bi-exclamation-triangle-fill`,title:`Alerta de riesgo`,description:`Aparece cuando hay alumnos que requieren atención. Muestra el total con algún indicador activo.`,color:`#f59e0b`},{icon:`bi-person-fill`,title:`Fila del alumno`,description:`Nombre, instrumento, % de asistencia (últimas 4 semanas) y promedio de las últimas 3 calificaciones. Barra amarilla izquierda = en riesgo.`,color:`#3b82f6`},{icon:`bi-tags-fill`,title:`Badges de riesgo`,description:`"Asistencia baja" < 70% en 4 semanas. "Nota baja" promedio < 6.0. "Observación" cuando hay observaciones de disciplina activas.`,color:`#ef4444`},{icon:`bi-window-sidebar`,title:`Panel de detalle`,description:`Clic en cualquier alumno → panel con asistencia reciente (20 clases), últimas calificaciones por clase y observaciones activas.`,color:`#10b981`}]})}),Z.container.querySelector(`#busqueda-alumno`)?.addEventListener(`input`,e=>{Z.busqueda=e.target.value,Bi()}),Z.container.querySelectorAll(`.alumno-row`).forEach(e=>{e.addEventListener(`click`,()=>Wi(e.dataset.id)),e.addEventListener(`mouseenter`,()=>{e.style.boxShadow=`0 4px 15px rgba(0,0,0,0.1)`}),e.addEventListener(`mouseleave`,()=>{e.style.boxShadow=``})})}function Ui(){return`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
    <div class="spinner-border text-primary"></div>
  </div>`}async function Wi(e){let t=Z.alumnos.find(t=>t.id===e);if(!t)return;let[n,r,i,a]=await Promise.all([_.from(`asistencias`).select(`fecha, estado, clase_id`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1}).limit(20),_.from(`progresos`).select(`*, clase:clases(nombre)`).eq(`alumno_id`,e).order(`fecha_evaluacion`,{ascending:!1}).limit(10),_.from(`observaciones`).select(`*`).eq(`alumno_id`,e).order(`created_at`,{ascending:!1}).limit(5),_.from(`alumnos_clases`).select(`clase:clases(id, nombre, instrumento)`).eq(`alumno_id`,e)]),o=(a.data||[]).map(e=>e.clase).filter(Boolean),s=Q(e);b.open({title:t.nombre_completo,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="d-flex gap-2 flex-wrap mb-3">
        ${t.instrumento_principal?`<span class="badge bg-primary-subtle text-primary">${t.instrumento_principal}</span>`:``}
        ${s.map(e=>`<span class="badge bg-warning-subtle text-warning">${e===`asistencia`?`Asistencia baja`:e===`calificacion`?`Nota baja`:`Con observación`}</span>`).join(``)}
        ${o.map(e=>`<span class="badge bg-body-secondary text-body-secondary">${e.nombre}</span>`).join(``)}
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 bg-body-tertiary h-100">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-calendar-check me-1 text-success"></i>Asistencia reciente</div>
              <div style="max-height:160px;overflow-y:auto;">
                ${(n.data||[]).length?n.data.map(e=>`
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom" style="font-size:0.78rem;">
                    <span class="text-muted">${e.fecha}</span>
                    <span class="badge rounded-pill ${e.estado===`P`?`bg-success-subtle text-success`:e.estado===`J`?`bg-warning-subtle text-warning`:`bg-danger-subtle text-danger`}">
                      ${e.estado===`P`?`Presente`:e.estado===`J`?`Justificado`:`Ausente`}
                    </span>
                  </div>`).join(``):`<p class="text-muted small mb-0">Sin registros</p>`}
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 bg-body-tertiary h-100">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-star me-1 text-warning"></i>Últimas calificaciones</div>
              <div style="max-height:160px;overflow-y:auto;">
                ${(r.data||[]).length?r.data.map(e=>`
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom" style="font-size:0.78rem;">
                    <span class="text-truncate me-2" style="max-width:140px;">${e.clase?.nombre||`Sin clase`}</span>
                    <span class="fw-semibold ${e.calificacion>=7?`text-success`:e.calificacion>=5?`text-warning`:`text-danger`}">${e.calificacion?.toFixed(1)??`–`}</span>
                  </div>`).join(``):`<p class="text-muted small mb-0">Sin calificaciones</p>`}
              </div>
            </div>
          </div>
        </div>

        ${(i.data||[]).length?`
        <div class="col-12">
          <div class="card border-0 bg-body-tertiary">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-chat-quote me-1 text-info"></i>Observaciones activas</div>
              ${i.data.map(e=>`
                <div class="border rounded-2 p-2 mb-2" style="font-size:0.8rem;">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="badge bg-secondary-subtle text-secondary">${e.tipo||`General`}</span>
                    <span class="text-muted">${(e.created_at||``).slice(0,10)}</span>
                  </div>
                  <p class="mb-0">${e.descripcion||``}</p>
                </div>`).join(``)}
            </div>
          </div>
        </div>`:``}
      </div>`})}async function Gi(e){if(e){e.innerHTML=`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>`;try{let[t,n]=await Promise.all([Ki(),qi()]);e.innerHTML=Ji(t,n),e.querySelector(`#btn-help-reportes`)?.addEventListener(`click`,()=>{pe.open({title:`Reportes Pedagógicos`,intro:`Vista agregada del rendimiento por clase y alumnos en riesgo. Útil para detectar patrones y tomar decisiones de intervención.`,sections:[{icon:`bi-table`,title:`Rendimiento por clase`,description:`Cada clase activa con: alumnos inscriptos, % asistencia (4 semanas), promedio de calificaciones y nivel de ocupación.`,color:`#3b82f6`},{icon:`bi-bar-chart-fill`,title:`Barra de ocupación`,description:`Verde < 70% ocupado. Amarillo 70-90%. Rojo > 90%. Detecta clases saturadas.`,color:`#10b981`},{icon:`bi-percent`,title:`Columna Asistencia`,description:`Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%. Basado en registros de las últimas 4 semanas.`,color:`#f59e0b`},{icon:`bi-star-half`,title:`Columna Prom. Nota`,description:`Promedio de calificaciones de la clase. Verde ≥ 7.0, amarillo ≥ 5.0, rojo < 5.0.`,color:`#6366f1`},{icon:`bi-exclamation-triangle-fill`,title:`Alumnos en riesgo`,description:`Asistencia < 70% en 4 semanas (mínimo 4 clases evaluadas). Ordenados de menor a mayor tasa.`,color:`#ef4444`}]})})}catch(t){console.error(`[ReportesPedagogicos]`,t),e.innerHTML=`<div class="page-container"><div class="alert alert-warning">${t.message}</div></div>`}}}async function Ki(){let{data:e}=await _.from(`clases`).select(`id, nombre, instrumento, capacidad_maxima`).eq(`estado`,`activa`).order(`nombre`);if(!e?.length)return[];let t=e.map(e=>e.id),[n,r,i]=await Promise.all([_.from(`alumnos_clases`).select(`clase_id, alumno_id`).in(`clase_id`,t),_.from(`asistencias`).select(`clase_id, estado`).in(`clase_id`,t).gte(`fecha`,new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0]),_.from(`progresos`).select(`clase_id, calificacion`).in(`clase_id`,t).not(`calificacion`,`is`,null)]);return e.map(e=>{let t=(n.data||[]).filter(t=>t.clase_id===e.id),a=(r.data||[]).filter(t=>t.clase_id===e.id),o=(i.data||[]).filter(t=>t.clase_id===e.id),s=a.length>0?Math.round(a.filter(e=>e.estado===`P`).length/a.length*100):null,c=o.length>0?o.reduce((e,t)=>e+t.calificacion,0)/o.length:null,l=e.capacidad_maxima?Math.round(t.length/e.capacidad_maxima*100):null;return{...e,totalAlumnos:t.length,tasaAsist:s,promNotas:c,ocupacion:l}})}async function qi(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],{data:t}=await _.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e);if(!t?.length)return[];let n={};t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]={total:0,presentes:0}),n[e.alumno_id].total++,e.estado===`P`&&n[e.alumno_id].presentes++});let r=Object.entries(n).filter(([,e])=>e.total>=4&&e.presentes/e.total<z.attendance_min_rate).map(([e,t])=>({id:e,rate:t.presentes/t.total,total:t.total}));if(!r.length)return[];let{data:i}=await _.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,r.map(e=>e.id));return(i||[]).map(e=>({...e,...r.find(t=>t.id===e.id)})).sort((e,t)=>e.rate-t.rate)}function Ji(e,t){let n=e=>e===null?`secondary`:e>=80?`success`:e>=60?`warning`:`danger`,r=e=>e===null?`secondary`:e>=7?`success`:e>=5?`warning`:`danger`;return`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-file-earmark-bar-graph fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Reportes Pedagógicos</h1>
          <p class="text-muted small mb-0">Rendimiento por clase · Alumnos en riesgo</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-reportes" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <h6 class="text-muted text-uppercase mb-2" style="font-size:0.72rem;letter-spacing:0.08em;">Rendimiento por clase (últimas 4 semanas)</h6>
      <div class="card border-0 shadow-sm mb-4">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle" style="font-size:0.83rem;">
            <thead class="table-light">
              <tr>
                <th>Clase</th>
                <th class="text-center">Alumnos</th>
                <th class="text-center">Asistencia</th>
                <th class="text-center">Prom. Nota</th>
                <th class="text-center">Ocupación</th>
              </tr>
            </thead>
            <tbody>
              ${e.length?e.map(e=>`
                <tr>
                  <td>
                    <div class="fw-semibold">${e.nombre}</div>
                    ${e.instrumento?`<div class="text-muted" style="font-size:0.75rem;">${e.instrumento}</div>`:``}
                  </td>
                  <td class="text-center">${e.totalAlumnos}</td>
                  <td class="text-center">
                    ${e.tasaAsist===null?`<span class="text-muted">–</span>`:`<span class="badge bg-${n(e.tasaAsist)}-subtle text-${n(e.tasaAsist)} rounded-pill">${e.tasaAsist}%</span>`}
                  </td>
                  <td class="text-center">
                    ${e.promNotas===null?`<span class="text-muted">–</span>`:`<span class="fw-semibold text-${r(e.promNotas)}">${e.promNotas.toFixed(1)}</span>`}
                  </td>
                  <td class="text-center">
                    ${e.ocupacion===null?`<span class="text-muted">–</span>`:`
                      <div class="d-flex align-items-center gap-2">
                        <div style="flex:1;height:6px;background:var(--bs-tertiary-bg);border-radius:3px;overflow:hidden;">
                          <div style="width:${Math.min(e.ocupacion,100)}%;height:100%;background:${e.ocupacion>=90?`#ef4444`:e.ocupacion>=70?`#f59e0b`:`#10b981`};border-radius:3px;"></div>
                        </div>
                        <span style="font-size:0.72rem;color:var(--bs-secondary-color);min-width:28px;">${e.ocupacion}%</span>
                      </div>`}
                  </td>
                </tr>`).join(``):`
                <tr><td colspan="5" class="text-center text-muted py-4">Sin clases activas</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <h6 class="text-muted text-uppercase mb-2" style="font-size:0.72rem;letter-spacing:0.08em;">
        Alumnos en riesgo — asistencia &lt; ${Math.round(z.attendance_min_rate*100)}% (4 semanas)
      </h6>
      ${t.length?`
      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle" style="font-size:0.83rem;">
            <thead class="table-light">
              <tr>
                <th>Alumno</th>
                <th>Instrumento</th>
                <th class="text-center">Tasa asistencia</th>
                <th class="text-center">Clases evaluadas</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(e=>`
                <tr>
                  <td class="fw-semibold">${e.nombre_completo}</td>
                  <td class="text-muted">${e.instrumento_principal||`–`}</td>
                  <td class="text-center">
                    <span class="badge bg-danger-subtle text-danger rounded-pill">${Math.round(e.rate*100)}%</span>
                  </td>
                  <td class="text-center text-muted">${e.total}</td>
                </tr>`).join(``)}
            </tbody>
          </table>
        </div>
      </div>`:`
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center text-muted py-4">
          <i class="bi bi-check-circle-fill text-success fs-3 d-block mb-2"></i>
          <span style="font-size:0.875rem;">Sin alumnos en riesgo detectados en las últimas 4 semanas.</span>
        </div>
      </div>`}
    </div>`}function Yi(){S.register(`pedagogico-dashboard`,e=>Mi(e)),S.register(`pedagogico-seguimiento`,e=>Ri(e)),S.register(`pedagogico-reportes`,e=>Gi(e))}if(s(),`serviceWorker`in navigator){let e=async()=>{try{let e=await navigator.serviceWorker.register(`/sw.js`);console.log(`[PWA] Service Worker registered:`,e.scope)}catch(e){console.log(`[PWA] Service Worker registration failed:`,e)}};document.readyState===`complete`?e():window.addEventListener(`load`,e)}window.bootstrap=De;var Xi=[{id:`programas`,label:`Programas`,icon:`bi-book`,description:`Gestión de programas académicos`,enabled:!0,register:xt},{id:`academic-admin`,label:`Gestión Curricular`,icon:`bi-diagram-3`,description:`Gestión de mapa curricular y recursos`,enabled:!0,register:$r},{id:`admin-dashboard`,label:`Dashboard Administrativo`,icon:`bi-speedometer2`,description:`Panel de control, reportes y analítica de maestros`,enabled:!0,register:pi},{id:`maestros`,label:`Maestros`,icon:`bi-person-check`,description:`Gestión de maestros/docentes`,enabled:!0,register:bt},{id:`alumnos`,label:`Alumnos`,icon:`bi-people`,description:`Gestión de estudiantes`,enabled:!0,register:St},{id:`salones`,label:`Salones`,icon:`bi-door-open`,description:`Gestión de espacios de clase`,enabled:!0,register:Ft},{id:`clases`,label:`Clases`,icon:`bi-easel`,description:`Gestión de clases y horarios`,enabled:!0,register:It},{id:`asistencias`,label:`Asistencias`,icon:`bi-calendar-check`,description:`Control de asistencia`,enabled:!0,register:tn},{id:`planificacion`,label:`Planificación`,icon:`bi-journal-text`,description:`Planificación pedagógica`,enabled:!0,register:Nn},{id:`progresos`,label:`Progresos`,icon:`bi-graph-up`,description:`Calificaciones y progreso`,enabled:!0,register:ar},{id:`observaciones`,label:`Observaciones`,icon:`bi-chat-quote`,description:`Anotaciones disciplinarias`,enabled:!0,register:Cr},{id:`metricas`,label:`Métricas`,icon:`bi-bar-chart-line`,description:`KPIs, alertas y análisis institucional`,enabled:!0,register:Lr},{id:`permisos`,label:`Permisos`,icon:`bi-shield-lock`,description:`Permisos y roles de maestros`,enabled:!0,register:ji},{id:`pedagogico`,label:`Pedagógico`,icon:`bi-journal-check`,description:`Dashboard, seguimiento y reportes pedagógicos`,enabled:!0,register:Yi},{id:`config`,label:`Configuración`,icon:`bi-gear`,description:`Configuración del sistema`,enabled:!0,register:qr}];function Zi(){let e=localStorage.getItem(`app-theme`),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches,n=e===`dark`||e===null&&t;return document.documentElement.setAttribute(`data-bs-theme`,n?`dark`:`light`),n}function Qi(){let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-bs-theme`,e),localStorage.setItem(`app-theme`,e)}var $=[{id:`academico`,label:`Académico`,icon:`bi-easel`,items:[{id:`programas`,label:`Programas`,icon:`bi-book`},{id:`clases`,label:`Clases`,icon:`bi-easel2`},{id:`salones`,label:`Salones`,icon:`bi-door-open`}]},{id:`personas`,label:`Personas`,icon:`bi-people`,items:[{id:`alumnos`,label:`Alumnos`,icon:`bi-people`},{id:`maestros`,label:`Maestros`,icon:`bi-person-check`}]},{id:`pedagogico`,label:`Pedagógico`,icon:`bi-journal-check`,items:[{id:`pedagogico-dashboard`,label:`Dashboard`,icon:`bi-grid-1x2`},{id:`planificacion`,label:`Planificación`,icon:`bi-journal-text`},{id:`planificacion-maestros`,label:`Todas las Planes`,icon:`bi-journal-check`},{id:`pedagogico-seguimiento`,label:`Seguimiento`,icon:`bi-person-lines-fill`},{id:`pedagogico-reportes`,label:`Reportes`,icon:`bi-file-earmark-bar-graph`}]},{id:`analisis`,label:`Análisis`,icon:`bi-bar-chart-line`,items:[{id:`metricas`,label:`Dashboard`,icon:`bi-bar-chart-line`},{id:`admin-dashboard`,label:`Cumplimiento Maestros`,icon:`bi-clipboard-check`},{id:`admin-dashboard-reportes`,label:`Reportes Director`,icon:`bi-file-earmark-pdf`},{id:`admin-dashboard-analitca-llenado`,label:`Analítica Llenado`,icon:`bi-graph-up`},{id:`admin-dashboard-tendencias`,label:`Tendencias`,icon:`bi-arrow-up-right`}]},{id:`sistema`,label:`Sistema`,icon:`bi-gear`,items:[{id:`configuracion`,label:`Configuración`,icon:`bi-sliders`},{id:`permisos`,label:`Permisos`,icon:`bi-shield-lock`},{id:`importar-datos`,label:`Importar Datos`,icon:`bi-cloud-upload`}]}];function $i(e){for(let t of $)if(t.items.some(t=>t.id===e))return t.id;return $[0].id}var ea=null;function ta(e,t=!1){ea?.abort(),ea=new AbortController;let{signal:n}=ea;if(document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),!t)return;let r=E.getUser(),i=r?r.email||r.full_name||`Usuario`:``,a=localStorage.getItem(`current-view`)||`programas`,o=$i(a),s=document.documentElement.getAttribute(`data-bs-theme`)===`dark`,c=m.isDemoMode,l=document.createElement(`aside`);l.className=`app-sidebar`,l.innerHTML=`
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
      <span class="sidebar-brand-text">SOI</span>
      ${c?`<span class="badge bg-warning text-dark ms-2" style="font-size: 0.6rem;">DEMO</span>`:``}
    </div>
    <nav class="sidebar-nav">
      ${$.map(e=>`
        <div class="nav-group ${e.id===o?`expanded`:``}" data-group="${e.id}">
          <button class="nav-group-header">
            <i class="bi ${e.icon} group-icon"></i>
            <span>${e.label}</span>
            <i class="bi bi-chevron-down chevron"></i>
          </button>
          <div class="nav-group-items">
            ${e.items.map(e=>`
              <button class="nav-item-btn ${e.id===a?`active`:``}" data-route="${e.id}">
                <i class="bi ${e.icon}"></i>
                <span>${e.label}</span>
              </button>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <i class="bi bi-person-circle"></i>
        <span class="sidebar-user-name" title="${i}">${i.split(`@`)[0]}</span>
      </div>
      <button class="sidebar-action-btn" id="sidebarBtnTheme" title="Cambiar tema">
        <i class="bi ${s?`bi-sun-fill`:`bi-moon-fill`}"></i>
      </button>
      <button class="sidebar-action-btn danger" id="sidebarBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `;let u=document.createElement(`nav`);u.className=`app-bottom-nav`,u.innerHTML=$.map(e=>`
    <button class="bottom-tab ${e.id===o?`active`:``}" data-group="${e.id}">
      <i class="bi ${e.icon}"></i>
      <span>${e.label}</span>
    </button>
  `).join(``);let d=document.createElement(`div`);d.className=`mobile-sub-sheet`,d.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-title" id="sheetTitle"></div>
    <div class="sheet-items" id="sheetItems"></div>
  `,document.body.prepend(d),document.body.prepend(u),document.body.prepend(l),l.querySelectorAll(`.nav-group-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.nav-group`),n=t.classList.contains(`expanded`);l.querySelectorAll(`.nav-group`).forEach(e=>e.classList.remove(`expanded`)),n||t.classList.add(`expanded`)})}),l.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>S.navigate(e.dataset.route))}),l.querySelector(`#sidebarBtnTheme`).addEventListener(`click`,()=>{Qi();let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`;l.querySelector(`#sidebarBtnTheme i`).className=e?`bi bi-sun-fill`:`bi bi-moon-fill`}),l.querySelector(`#sidebarBtnLogout`).addEventListener(`click`,async()=>{await E.logout(),S.navigate(`login`)});function f(e){let t=$.find(t=>t.id===e);if(!t)return;let n=localStorage.getItem(`current-view`)||``;document.getElementById(`sheetTitle`).textContent=t.label,document.getElementById(`sheetItems`).innerHTML=t.items.map(e=>`
      <button class="sheet-item ${e.id===n?`active`:``}" data-route="${e.id}">
        <i class="bi ${e.icon}"></i>
        <span>${e.label}</span>
      </button>
    `).join(``),d.dataset.group=e,d.classList.add(`open`),d.querySelectorAll(`.sheet-item`).forEach(e=>{e.addEventListener(`click`,()=>{S.navigate(e.dataset.route),d.classList.remove(`open`)})})}u.querySelectorAll(`.bottom-tab`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.group;d.classList.contains(`open`)&&d.dataset.group===t?d.classList.remove(`open`):(f(t),u.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===t)))})}),document.addEventListener(`click`,e=>{d.classList.contains(`open`)&&!d.contains(e.target)&&!u.contains(e.target)&&d.classList.remove(`open`)},{signal:n}),window.addEventListener(`routeChanged`,e=>{let t=e.detail,n=$i(t);l.querySelectorAll(`.nav-item-btn`).forEach(e=>e.classList.toggle(`active`,e.dataset.route===t)),l.querySelectorAll(`.nav-group`).forEach(e=>{e.dataset.group===n?e.classList.add(`expanded`):e.classList.remove(`expanded`)}),u.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===n))},{signal:n})}function na(){try{yt()}catch(e){console.error(`Error registering auth routes:`,e)}Xi.filter(e=>e.enabled&&e.register).forEach(e=>{try{e.register()}catch(t){console.error(`Error registering module ${e.id}:`,t)}})}async function ra(){let e=document.querySelector(`#app`);if(!e){console.error(`El contenedor #app no existe en el HTML`);return}Zi(),na(),S.initCustomEvents(),console.log(`🔄 Sincronizando sesión...`),await E.refreshAuth();let t=[`login`,`register`];S.setAuthGuard(()=>E.isAuthenticated(),t);let n=localStorage.getItem(`current-view`)||`programas`,r=E.isAuthenticated();!r&&!t.includes(n)?(localStorage.setItem(`current-view`,`login`),S.navigate(`login`)):r&&t.includes(n)?(localStorage.setItem(`current-view`,`programas`),ta(e,!0),S.navigate(`programas`)):(r&&ta(e,!0),S.init()),E.subscribe(t=>{if(t.user)ta(e,!0);else{e.innerHTML=``;let t=document.querySelector(`.app-navbar`);t&&t.remove(),document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),S.navigate(`login`)}})}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,ra):ra();function ia(){let e=localStorage.getItem(`current-view`)||`programas`,t=document.querySelector(`.teacher-bridge`);t&&(e===`programas`?t.classList.add(`visible`):t.classList.remove(`visible`))}ia(),window.addEventListener(`routeChanged`,e=>{ia()});export{Wr as a,Hr as i,Ur as n,Kr as o,Gr as r,Vr as t};