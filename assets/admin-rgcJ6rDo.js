const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ausenciaForm-CnFFACcx.js","assets/supabase-BryBf0UA.js","assets/ausenciaHistorial-BSQNwCRE.js","assets/jspdf.es.min-CBtVkUg2.js","assets/rolldown-runtime-tcWNtVWY.js","assets/preload-helper-CQ36nxok.js","assets/typeof-uSHhYthB.js","assets/jspdf.plugin.autotable-C032RTqY.js","assets/planificacionAdapter-Ii4BlFQr.js","assets/clases-Dt16onyD.js","assets/config-BwkWvi5v.js","assets/alumnos-DdhAG3eL.js","assets/configView-CoCzNtv-.js","assets/pushService-DsWSFa6I.js","assets/maestroAuth-BZ2ChDTg.js","assets/importView-DaZM1Z_2.js","assets/exportView-BSO1lxRD.js","assets/alumnosApi-L2o0ngo-.js","assets/router-C2kyANVn.js","assets/vendor-CAKU_njC.js","assets/vendor-COf7rB16.css","assets/reportService-C5aMGas5.js","assets/groqService-CNWH1ut_.js","assets/AppToast-L43yfvBt.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{B as t,C as n,D as r,E as i,G as a,H as o,I as s,K as c,L as l,M as u,N as d,O as f,P as p,R as m,T as ee,U as te,V as ne,W as re,_ as ie,a as ae,b as oe,c as se,d as h,f as ce,g as le,h as ue,i as de,j as g,k as fe,l as pe,m as me,n as he,nt as ge,o as _e,p as ve,r as ye,s as be,t as xe,u as Se,v as Ce,w as we,x as Te,y as Ee,z as De}from"./clasesApi-BulK2__e.js";import{i as _,n as Oe,r as ke,t as Ae}from"./supabase-BryBf0UA.js";import{n as je,r as Me}from"./vendor-CAKU_njC.js";import{i as Ne}from"./permisosSupabase-DX8LFO6R.js";import{t as v}from"./AppToast-L43yfvBt.js";import{t as y}from"./preload-helper-CQ36nxok.js";import{t as b}from"./AppModal-BlN8abkL.js";import{n as Pe}from"./groqService-CNWH1ut_.js";import{a as Fe,c as Ie,f as Le,i as Re,l as ze,n as Be,o as Ve,r as He,s as Ue,t as We,u as Ge}from"./planificacionAdapter-Ii4BlFQr.js";import{t as x}from"./config-BwkWvi5v.js";import{a as Ke,c as qe,i as Je,l as Ye,n as Xe,o as Ze,r as Qe,s as $e,t as et}from"./alumnosApi-L2o0ngo-.js";import{t as tt}from"./clases-Dt16onyD.js";import{t as S}from"./router-C2kyANVn.js";import{t as nt}from"./jspdf.es.min-CBtVkUg2.js";import{t as rt}from"./jspdf.plugin.autotable-C032RTqY.js";var it=`auth-session`;function at(e,t=!0){let n={access_token:e.access_token,refresh_token:e.refresh_token,user:e.user,expires_at:e.expires_at,persistent:t};(t?localStorage:sessionStorage).setItem(it,JSON.stringify(n)),t?sessionStorage.removeItem(it):localStorage.removeItem(it)}function ot(){let e=localStorage.getItem(it),t=sessionStorage.getItem(it),n=e||t;if(!n)return null;try{return JSON.parse(n)}catch{return null}}function st(){localStorage.removeItem(it),sessionStorage.removeItem(it)}function ct(){let e=ot();return!e||!e.expires_at?!1:Date.now()/1e3<e.expires_at-10}var lt=[];async function ut(e,t,n=!1){let{data:r,error:i}=await Ae(e,t);return i?(console.error(`🔑 login error:`,i),{user:null,session:null,error:i}):(r.session&&at(r.session,n),{user:r.user,session:r.session,error:null})}async function dt(e,t,n={}){let{data:r,error:i}=await ke(e,t,n);return i?{user:null,session:null,error:i}:{user:r.user,session:r.session,error:null}}async function ft(){let{error:e}=await Oe();return st(),lt.forEach(e=>e(null)),{error:e}}function pt(){return ct()}function mt(){return ot()?.user||null}var C={user:null,session:null,loading:!0,error:null,listeners:[]};function ht(){C.listeners.forEach(e=>e(C))}function gt(e){return C.listeners.push(e),()=>{C.listeners=C.listeners.filter(t=>t!==e)}}async function _t(e,t,n=!1){if(C.loading=!0,C.error=null,ht(),e===`demo@soi.com`&&t===`demo123`){let e={id:`demo-user-id`,email:`demo@soi.com`,user_metadata:{full_name:`Usuario Demo`},role:`admin`},t={user:e,access_token:`demo-token`};return localStorage.setItem(`demo_mode`,`true`),x.isDemoMode=!0,at(t,n),C.user=e,C.session=t,C.loading=!1,ht(),{success:!0,user:e,session:t}}try{let r=await ut(e,t,n),i=r?.error&&(r.error.message||r.error),a=r?.user&&!i;return C.user=a?r.user:null,C.session=a?r.session:null,C.loading=!1,ht(),i?{success:!1,error:typeof i==`string`?i:i.message||`Error desconocido`}:{success:a,user:C.user,session:C.session}}catch(e){return C.loading=!1,C.error=e.message,ht(),{success:!1,error:e.message}}}async function vt(e,t,n){C.loading=!0,C.error=null,ht();try{let r=await dt(e,t,n);C.user=r.user,C.session=r.session,C.loading=!1,ht();let i=!r.error&&!!r.user,a=i&&!r.session;return{...r,success:i,needsConfirmation:a,message:a?`Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.`:void 0}}catch(e){return C.loading=!1,C.error=e.message,ht(),{success:!1,error:e.message}}}function yt(){ft(),localStorage.removeItem(`demo_mode`),x.isDemoMode=!1,C.user=null,C.session=null,C.error=null,ht()}function bt(){return mt()}function xt(){return C.user?!0:pt()}async function St(){let{data:{session:e},error:t}=await _.auth.getSession();return t||!e?(st(),C.user=null,C.session=null,C.loading=!1,ht(),{authenticated:!1}):(at(e,ot()?.persistent??!0),C.session=e,C.user=e.user,C.loading=!1,ht(),{authenticated:!0,user:C.user})}St();var w={subscribe:gt,login:_t,register:vt,logout:yt,getUser:bt,isAuthenticated:xt,notifyListeners:ht,refreshAuth:St,getState:()=>({...C})},Ct={config:{fontSizeBase:`0.8rem`,fontSizeSmall:`0.7rem`,paddingX:`0.5rem`,paddingY:`0.35rem`,gap:`0.35rem`},styles:`
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
      `}},utils:{getInitials(e){if(!e)return`?`;let t=e.trim().split(` `);return t.length>=2?(t[0][0]+t[t.length-1][0]).toUpperCase():e.substring(0,2).toUpperCase()},formatPhone(e){return e||`-`},truncate(e,t=30){return e?e.length<=t?e:e.substring(0,t-3)+`...`:``},formatDateShort(e){return e?new Date(e).toLocaleDateString(`es-VE`,{day:`numeric`,month:`short`}):`-`}}},wt={loading:!1};function Tt(e){Ct.injectStyles(),Et(e),Dt(e)}function Et(e){e.innerHTML=`
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
  `}function Dt(e){let t=document.getElementById(`loginForm`),n=document.getElementById(`loginEmail`),r=document.getElementById(`loginPassword`),i=document.getElementById(`togglePassword`),a=document.getElementById(`linkRegister`);t?.addEventListener(`submit`,async t=>{t.preventDefault();let i=n.value.trim(),a=r.value;await Ot(i,a,document.getElementById(`rememberMe`)?.checked||!1,e)}),i?.addEventListener(`click`,()=>{let e=r.type===`password`?`text`:`password`;r.type=e,i.innerHTML=e===`password`?`<i class="bi bi-eye"></i>`:`<i class="bi bi-eye-slash"></i>`}),a?.addEventListener(`click`,e=>{e.preventDefault(),S.navigate(`register`)})}async function Ot(e,t,n,r){if(!e||!t){At(`Por favor ingresa email y contraseña`,`error`,r);return}wt.loading=!0,kt(!0);try{let i=await w.login(e,t,n);i.success?(At(`¡Bienvenido!`,`success`,r),setTimeout(()=>{let e=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),S.navigate(e||`programas`)},500)):At(i.error||`Error al iniciar sesión`,`error`,r)}catch(e){console.error(`Login error:`,e),At(`Error de conexión`,`error`,r)}finally{wt.loading=!1,kt(!1)}}function kt(e){let t=document.getElementById(`btnLogin`),n=t?.querySelector(`.btn-text`),r=t?.querySelector(`.btn-loading`);t&&(t.disabled=e,e?(n?.classList.add(`d-none`),r?.classList.remove(`d-none`)):(n?.classList.remove(`d-none`),r?.classList.add(`d-none`)))}function At(e,t,n){let r=document.getElementById(`toastContainer`);if(!r)return;let i=e&&typeof e==`object`?e.message||e.error||JSON.stringify(e):String(e||`Error`),a=`
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
  `,o=document.createElement(`div`);o.innerHTML=a;let s=o.firstElementChild;r.appendChild(s),new je(s,{autohide:!0,delay:3e3}).show(),s.addEventListener(`hidden.bs.toast`,()=>{s.remove()})}var jt={loading:!1},Mt=[{test:e=>e.length>=8,message:`Mínimo 8 caracteres`},{test:e=>/[A-Z]/.test(e),message:`Al menos 1 mayúscula`},{test:e=>/[0-9]/.test(e),message:`Al menos 1 número`},{test:e=>/[!@#$%^&*(),.?":{}|<>]/.test(e),message:`Al menos 1 símbolo`}];function Nt(e){Ct.injectStyles(),Pt(e),It(e)}function Pt(e){e.innerHTML=`
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
                ${Ft(``)}
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
  `}function Ft(e){return Mt.map((t,n)=>{let r=t.test(e);return`
      <div class="password-requirement ${r?`valid`:`invalid`}" id="req-${n}">
        <i class="bi ${r?`bi-check-circle-fill`:`bi-circle`}"></i>
        <span>${t.message}</span>
      </div>
    `}).join(``)}function It(e){let t=document.getElementById(`registerForm`);document.getElementById(`registerName`),document.getElementById(`registerEmail`);let n=document.getElementById(`registerPassword`),r=document.getElementById(`registerConfirmPassword`),i=document.getElementById(`togglePassword`),a=document.getElementById(`linkLogin`);n?.addEventListener(`input`,e=>{let t=e.target.value;Lt(t),Rt()}),r?.addEventListener(`input`,Rt),t?.addEventListener(`submit`,async t=>{t.preventDefault(),await Bt(e)}),i?.addEventListener(`click`,()=>{let e=n.type===`password`?`text`:`password`;n.type=e,r.type=e,i.innerHTML=e===`password`?`<i class="bi bi-eye"></i>`:`<i class="bi bi-eye-slash"></i>`}),a?.addEventListener(`click`,e=>{e.preventDefault(),S.navigate(`login`)})}function Lt(e){document.getElementById(`passwordRequirements`)&&Mt.forEach((t,n)=>{let r=document.getElementById(`req-${n}`);if(r){let n=t.test(e);r.className=`password-requirement ${n?`valid`:`invalid`}`,r.innerHTML=`
        <i class="bi ${n?`bi-check-circle-fill`:`bi-circle`}"></i>
        <span>${t.message}</span>
      `}})}function Rt(){let e=document.getElementById(`registerPassword`).value,t=document.getElementById(`registerConfirmPassword`).value,n=document.getElementById(`confirmPasswordError`),r=document.getElementById(`registerConfirmPassword`);return t&&e!==t?(n?.classList.remove(`d-none`),r?.classList.add(`is-invalid`),!1):(n?.classList.add(`d-none`),r?.classList.remove(`is-invalid`),!0)}function zt(e){return Mt.every(t=>t.test(e))}async function Bt(e){let t=document.getElementById(`registerName`).value.trim(),n=document.getElementById(`registerEmail`).value.trim(),r=document.getElementById(`registerPassword`).value,i=document.getElementById(`registerConfirmPassword`).value,a=document.getElementById(`acceptTerms`).checked;if(!t||!n||!r||!i){Ht(`Por favor completa todos los campos`,`error`,e);return}if(!zt(r)){Ht(`La contraseña no cumple los requisitos`,`error`,e);return}if(r!==i){Ht(`Las contraseñas no coinciden`,`error`,e);return}if(!a){Ht(`Debes aceptar los términos y condiciones`,`error`,e);return}jt.loading=!0,Vt(!0);try{let i=await w.register(n,r,{full_name:t,rol:`maestro`});i.success?i.needsConfirmation?(Ht(i.message,`info`,e),setTimeout(()=>{S.navigate(`login`)},2e3)):(Ht(`¡Cuenta creada exitosamente!`,`success`,e),setTimeout(()=>{S.navigate(`programas`)},500)):Ht(i.error||`Error al registrar`,`error`,e)}catch(t){console.error(`Register error:`,t),Ht(`Error de conexión`,`error`,e)}finally{jt.loading=!1,Vt(!1)}}function Vt(e){let t=document.getElementById(`btnRegister`),n=t?.querySelector(`.btn-text`),r=t?.querySelector(`.btn-loading`);t&&(t.disabled=e,e?(n?.classList.add(`d-none`),r?.classList.remove(`d-none`)):(n?.classList.remove(`d-none`),r?.classList.add(`d-none`)))}function Ht(e,t,n){let r=document.getElementById(`toastContainer`);if(!r)return;let i=`
    <div id="${`toast-`+Date.now()}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${t===`success`?`bg-success`:t===`error`?`bg-danger`:t===`info`?`bg-info`:`bg-warning`} text-white">
        <i class="bi ${t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:t===`info`?`bi-info-circle`:`bi-exclamation-triangle`} me-2"></i>
        <strong class="me-auto">${t===`success`?`Éxito`:t===`error`?`Error`:t===`info`?`Información`:`Advertencia`}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${Ut(e)}
      </div>
    </div>
  `,a=document.createElement(`div`);a.innerHTML=i;let o=a.firstElementChild;r.appendChild(o),new je(o,{autohide:!0,delay:3e3}).show(),o.addEventListener(`hidden.bs.toast`,()=>{o.remove()})}function Ut(e){return e?e.replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e]):``}var Wt={loading:!1,error:null};function Gt(e){let t=w.getUser();if(!t){e.innerHTML=`
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
  `,Kt(e)}async function Kt(e){let{renderAusenciaForm:t}=await y(async()=>{let{renderAusenciaForm:e}=await import(`./ausenciaForm-CnFFACcx.js`);return{renderAusenciaForm:e}},__vite__mapDeps([0,1])),{renderAusenciaHistorial:n}=await y(async()=>{let{renderAusenciaHistorial:e}=await import(`./ausenciaHistorial-BSQNwCRE.js`);return{renderAusenciaHistorial:e}},__vite__mapDeps([2,1]));document.getElementById(`ausenciaModalBody`).innerHTML=t();let r=e.querySelector(`.card-apple:last-child`);if(r){let e=document.createElement(`div`);e.className=`mt-4`,e.innerHTML=`
      <h6 class="fw-bold mb-3">
        <i class="bi bi-clock-history me-2"></i>Historial de Ausencias
      </h6>
      <div id="ausenciaHistorialContainer"></div>
    `,r.appendChild(e),document.getElementById(`ausenciaHistorialContainer`).innerHTML=n()}e.querySelector(`#btnGuardarDatos`)?.addEventListener(`click`,qt),e.querySelector(`#perfilPasswordForm`)?.addEventListener(`submit`,Jt)}async function qt(){let e=document.getElementById(`perfilNombre`).value.trim();if(!e){Yt(`El nombre no puede estar vacío`);return}Wt.loading=!0;let t=document.getElementById(`btnGuardarDatos`);t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;try{let{error:t}=await _.auth.updateUser({data:{full_name:e}});if(t)throw t;Xt(`Datos guardados correctamente`)}catch(e){Yt(e.message)}finally{Wt.loading=!1,t.disabled=!1,t.innerHTML=`<i class="bi bi-check-lg me-1"></i>Guardar cambios`}}async function Jt(e){e.preventDefault(),document.getElementById(`passwordActual`).value;let t=document.getElementById(`passwordNueva`).value,n=document.getElementById(`passwordConfirmar`).value;if(document.getElementById(`passwordError`),t.length<8){Zt(`La contraseña debe tener al menos 8 caracteres`);return}if(t!==n){Zt(`Las contraseñas no coinciden`);return}Wt.loading=!0;let r=document.getElementById(`btnCambiarPassword`);r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Cambiando...`;try{let{error:e}=await _.auth.updateUser({password:t});if(e)throw e;document.getElementById(`perfilPasswordForm`).reset(),Xt(`Contraseña cambiada correctamente`)}catch(e){e.message.includes(`same`)?Zt(`La nueva contraseña debe ser diferente a la actual`):Zt(e.message)}finally{Wt.loading=!1,r.disabled=!1,r.innerHTML=`<i class="bi bi-key-fill me-1"></i>Cambiar contraseña`}}function Yt(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:`danger`}}))}function Xt(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:`success`}}))}function Zt(e){let t=document.getElementById(`passwordError`);t&&(t.textContent=e,t.classList.remove(`d-none`))}function Qt(){S.register(`login`,Tt),S.register(`register`,Nt),S.register(`perfil`,Gt)}Qt();function $t(e){return e?{...e,user_id:e.user_id??null,nombre:e.nombre_completo??``,email:e.correo??``,telefono:e.tlf??``,instrumento:e.especialidad??``,bio:e.resena??``,is_active:e.activo??!0,especialidades:Array.isArray(e.especialidades)?e.especialidades:[]}:null}async function en(){let{data:e,error:t}=await _.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0});if(t)throw console.error(`Error cargando maestros:`,t.message),Error(`No se pudieron cargar los maestros`);return e.map($t)}async function tn(e,t){let n={},r=t.nombre||t.nombre_completo;r!==void 0&&(n.nombre_completo=r.trim());let i=t.email||t.correo;i!==void 0&&(n.correo=i.trim().toLowerCase());let a=t.telefono||t.tlf;a!==void 0&&(n.tlf=a.trim());let o=t.instrumento||t.especialidad;o!==void 0&&(n.especialidad=o.trim());let s=t.bio||t.resena;s!==void 0&&(n.resena=s.trim()),t.is_active!==void 0&&(n.activo=t.is_active),t.activo!==void 0&&(n.activo=t.activo),t.especialidades!==void 0&&(n.especialidades=Array.isArray(t.especialidades)?t.especialidades:[]);let{data:c,error:l}=await _.from(`maestros`).update(n).eq(`id`,e).select();if(l)throw console.error(`Error actualizando maestro:`,l.message),Error(`No se pudo actualizar el maestro`);return $t(c[0])}async function nn(e){let{error:t}=await _.from(`maestros`).update({activo:!1}).eq(`id`,e);if(t)throw console.error(`Error inactivando maestro:`,t.message),Error(`No se pudo desactivar el maestro`)}async function rn(e){let{error:t}=await _.from(`maestros`).update({activo:!0}).eq(`id`,e);if(t)throw console.error(`Error activando maestro:`,t.message),Error(`No se pudo activar el maestro`)}async function an(e){let{data:t,error:n}=await _.from(`maestros`).select(`id`).eq(`correo`,e.trim().toLowerCase()).maybeSingle();return n&&n.code!==`PGRST116`&&console.error(`Error validando email:`,n.message),!!t}function T(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function on(e){return e?`success`:`secondary`}function sn(e){return e?`Activo`:`Inactivo`}function cn(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}var ln=class{constructor(e={}){this.id=e.id,this.instrumento=e.instrumento,this.nivel=e.nivel,this.nombre=e.nombre,this.tipo=e.tipo,this.estado=e.estado,this.descripcion=e.descripcion,this.ruta_base_id=e.ruta_base_id,this.duracion_semanas=e.duracion_semanas||40,this.creada_por=e.creada_por,this.aprobada_por=e.aprobada_por,this.fecha_aprobacion=e.fecha_aprobacion,this.objetivos=e.objetivos||[],this.created_at=e.created_at,this.updated_at=e.updated_at}validate(){let e=[];return this.instrumento?.trim()||e.push(`Instrumento es requerido`),this.nivel?.trim()||e.push(`Nivel es requerido`),this.nombre?.trim()||e.push(`Nombre es requerido`),this.nombre?.length>200&&e.push(`Nombre máximo 200 caracteres`),[`soi-estandar`,`maestro-variante`].includes(this.tipo)||e.push(`Tipo debe ser soi-estandar o maestro-variante`),[`activa`,`pendiente`,`aprobada`,`rechazada`].includes(this.estado)||e.push(`Estado inválido`),this.tipo===`maestro-variante`&&!this.ruta_base_id&&e.push(`Variante debe referenciar ruta base`),(this.duracion_semanas<1||this.duracion_semanas>52)&&e.push(`Duración debe estar entre 1 y 52 semanas`),(!Array.isArray(this.objetivos)||this.objetivos.length===0)&&e.push(`Debe haber al menos 1 objetivo`),this.objetivos.forEach((t,n)=>{t.descripcion?.trim()||e.push(`Objetivo ${n+1}: descripción requerida`),t.semana_inicio<1&&e.push(`Objetivo ${n+1}: semana_inicio >= 1`),t.semana_fin>this.duracion_semanas&&e.push(`Objetivo ${n+1}: semana_fin <= ${this.duracion_semanas}`),t.semana_fin<t.semana_inicio&&e.push(`Objetivo ${n+1}: semana_fin >= semana_inicio`)}),e}isVariante(){return this.tipo===`maestro-variante`}isActiva(){return this.estado===`activa`}isPendiente(){return this.estado===`pendiente`}toJSON(){return{id:this.id,instrumento:this.instrumento,nivel:this.nivel,nombre:this.nombre,tipo:this.tipo,estado:this.estado,descripcion:this.descripcion,ruta_base_id:this.ruta_base_id,duracion_semanas:this.duracion_semanas,creada_por:this.creada_por,aprobada_por:this.aprobada_por,fecha_aprobacion:this.fecha_aprobacion,objetivos:this.objetivos,created_at:this.created_at,updated_at:this.updated_at}}static getEstados(){return[{value:`activa`,label:`Activa`,color:`bg-success`},{value:`pendiente`,label:`Pendiente de aprobación`,color:`bg-warning`},{value:`aprobada`,label:`Aprobada`,color:`bg-info`},{value:`rechazada`,label:`Rechazada`,color:`bg-danger`}]}};async function un(e){let t=new ln(e).validate();if(t.length>0)throw Error(`Validación fallida: ${t.join(`, `)}`);let{data:n,error:r}=await _.from(`rutas_contenido`).insert({instrumento:e.instrumento,nivel:e.nivel,nombre:e.nombre,tipo:e.tipo,estado:e.estado,descripcion:e.descripcion,ruta_base_id:e.ruta_base_id,duracion_semanas:e.duracion_semanas,creada_por:e.creada_por}).select().single();if(r)throw r;let i=e.objetivos.map((e,t)=>({ruta_id:n.id,descripcion:e.descripcion,semana_inicio:e.semana_inicio,semana_fin:e.semana_fin,orden:e.orden||t+1,objetivo_id:e.objetivo_id||null})),{data:a,error:o}=await _.from(`ruta_contenido_objetivos`).insert(i).select();if(o)throw o;return{...n,objetivos:a}}async function dn(e){let{data:t,error:n}=await _.from(`rutas_contenido`).select(`*`).eq(`id`,e).single();if(n)throw n;let{data:r,error:i}=await _.from(`ruta_contenido_objetivos`).select(`*`).eq(`ruta_id`,e).order(`orden`,{ascending:!0});if(i)throw i;return{...t,objetivos:r}}async function fn(e={}){let t=_.from(`rutas_contenido`).select(`*`);e.instrumento&&(t=t.eq(`instrumento`,e.instrumento)),e.nivel&&(t=t.eq(`nivel`,e.nivel)),e.estado&&(t=t.eq(`estado`,e.estado)),e.tipo&&(t=t.eq(`tipo`,e.tipo));let{data:n,error:r}=await t.order(`created_at`,{ascending:!1});if(r)throw r;return n||[]}async function pn(){let{data:e,error:t}=await _.from(`rutas_contenido`).select(`*, rutas_contenido!ruta_base_id(nombre)`).eq(`tipo`,`maestro-variante`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(t)throw t;return e||[]}async function mn(e,t,n=null){let{data:r}=await _.auth.getUser(),{data:i,error:a}=await _.from(`rutas_contenido`).update({estado:t?`aprobada`:`rechazada`,aprobada_por:r?.user?.id,fecha_aprobacion:new Date().toISOString(),descripcion:t?void 0:n,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(a)throw a;return i}async function hn(e,t,n,r){let i=await dn(e),{data:a}=await _.auth.getUser();return await un({instrumento:i.instrumento,nivel:i.nivel,nombre:t,tipo:`maestro-variante`,estado:`pendiente`,descripcion:n,ruta_base_id:e,duracion_semanas:i.duracion_semanas,creada_por:a?.user?.id,objetivos:r})}var gn=`
<style id="ruta-selector-style">
.ruta-option { padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
.ruta-option:hover { background: #f8f9fa; border-color: #007bff; }
.ruta-option.selected { background: #e7f1ff; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.25); }
.ruta-info { font-size: 0.85rem; color: #666; margin-top: 4px; }
</style>`;function _n(e,t,n){let r=document.getElementById(`ruta-selector-modal`);r&&r.remove();let i=document.createElement(`div`);i.id=`ruta-selector-modal`,i.innerHTML=`${gn}
    <div class="modal fade" id="ruta-selector-dialog" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-diagram-3 me-2"></i>Selecciona Ruta de Contenidos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ruta-selector-body">
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></div>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(i);let a=document.getElementById(`ruta-selector-dialog`),o=new bootstrap.Modal(a);async function s(){let r=document.getElementById(`ruta-selector-body`);try{let i=await fn({instrumento:e,nivel:t,estado:`activa`});if(i.length===0){r.innerHTML=`<p class="text-muted text-center">No hay rutas disponibles para este instrumento/nivel.</p>`;return}let s=null,c=i.find(e=>e.tipo===`soi-estandar`);c&&(s=c.id),r.innerHTML=`
        <div class="alert alert-info small mb-3">
          <i class="bi bi-lightbulb me-2"></i>La ruta define los objetivos que cubrirás en este período.
        </div>
        <div id="ruta-list">${i.map(e=>`
          <div class="ruta-option ${s===e.id?`selected`:``}" data-ruta-id="${e.id}">
            <strong>${e.tipo===`soi-estandar`?`📌`:`⚡`} ${e.nombre}</strong>
            <div class="ruta-info">
              ${e.duracion_semanas} semanas
              ${e.tipo===`maestro-variante`?`| Variante aprobada`:`| Estándar SOI`}
            </div>
          </div>
        `).join(``)}</div>
      `,document.querySelectorAll(`.ruta-option`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.ruta-option`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),s=e.dataset.rutaId})});let l=a.querySelector(`.btn-close`);l.onclick=()=>{o.hide(),s&&n(s)}}catch(e){r.innerHTML=`<div class="alert alert-danger">${e.message}</div>`,v.error(`Error cargando rutas`)}}a.addEventListener(`shown.bs.modal`,s),o.show()}var vn={maestros:[],salones:[],programas:[],alumnos:[],onSuccess:null},yn={nombreMax:100,notasMax:500};async function bn(e=null,t={}){vn={...vn,...t};let n=!!e,r=[],i=[];if(n){v.info(`Cargando datos de la clase...`);let t=await be(e.id);r=(t||[]).map(e=>e.alumno_id),i=t||[]}let a=n?`Editar Clase: ${e.nombre}`:`Nueva Clase`,o=n?`Guardar Cambios`:`Crear Clase`;b.open({title:a,saveText:o,size:`lg`,body:xn(e,r,i),onShow:t=>{Cn(t,e)},onSave:async t=>await wn(t,e)})}function xn(e,t,n=[]){return`
    <form class="row g-3" id="formClase">
      <div class="col-md-6">
        <label class="form-label-compact">Nombre de la Clase *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Ej: Violín Básico A" value="${h(e?.nombre||``)}" maxlength="${yn.nombreMax}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" list="instrumentos-list" required placeholder="Seleccionar..." value="${h(e?.instrumento||``)}">
        ${kn()}
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Ruta de Contenido</label>
        <div class="d-flex gap-2">
          <input type="text" class="form-control input-dense" id="modal-ruta-display" readonly placeholder="Seleccionar ruta..." value="${e?.ruta_id?`Ruta seleccionada`:``}">
          <button type="button" class="btn btn-outline-primary btn-sm" id="btn-seleccionar-ruta" style="white-space: nowrap;">
            <i class="bi bi-diagram-3 me-1"></i>Elegir
          </button>
        </div>
        <input type="hidden" id="modal-ruta_id" value="${e?.ruta_id||``}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Programa *</label>
        <select class="form-select input-dense" id="modal-programa_id" required>
          ${Dn(e?.programa_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Maestro Titular *</label>
        <select class="form-select input-dense" id="modal-maestro_id" required>
          ${Tn(e?.maestro_principal_id)}
        </select>
      </div>
      <div class="col-md-6">
        <div class="d-flex align-items-center gap-2">
          <label class="form-label-compact mb-0">Maestro Suplente</label>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="modal-tiene_suplente" ${e?.tiene_suplente?`checked`:``}>
          </div>
        </div>
        <select class="form-select input-dense" id="modal-maestro_suplente_id" style="display: ${e?.tiene_suplente?`block`:`none`}; margin-top: 8px;">
          ${Tn(e?.maestro_suplente_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Máx. Alumnos</label>
        <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${e?.capacidad_maxima||20}" min="1" max="50">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-estado">
          ${On(e?.estado||`activa`)}
        </select>
      </div>
      
      <div class="col-12 mt-3 pt-2 border-top">
        <label class="form-label-compact d-block mb-2"><i class="bi bi-gear me-1"></i> Dinámica de la Clase *</label>
        <div class="d-flex align-items-center bg-body-tertiary p-2 rounded border">
          <div class="form-check me-4">
            <input class="form-check-input cursor-pointer" type="radio" name="modal-tipo_clase" id="tipo-grupal" value="grupal" ${!e||e.tipo_clase!==`rotativa`?`checked`:``}>
            <label class="form-check-label small cursor-pointer lh-sm" for="tipo-grupal">
              <strong>Grupal</strong><br>
              <span class="text-muted" style="font-size: 0.75rem;">Asistencia global, todos los alumnos asisten en el mismo horario.</span>
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input cursor-pointer" type="radio" name="modal-tipo_clase" id="tipo-rotativa" value="rotativa" ${e?.tipo_clase===`rotativa`?`checked`:``}>
            <label class="form-check-label small cursor-pointer lh-sm" for="tipo-rotativa">
              <strong>Rotativa (Turnos)</strong><br>
              <span class="text-muted" style="font-size: 0.75rem;">Clase individual o micro-grupos. Se asignan slots de tiempo a cada alumno.</span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="col-12 mt-4">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label-compact mb-0">Horarios y Salones *</label>
          <button type="button" class="btn btn-sm btn-outline-primary" id="btn-add-horario">
            <i class="bi bi-plus-circle me-1"></i> Agregar Horario
          </button>
        </div>
        <div id="modal-horarios-container" class="mb-3">
          ${jn(e?.horarios||[])}
        </div>
      </div>

      <div class="col-12">
        <label class="form-label-compact">Notas Pedagógicas</label>
        <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="2" placeholder="Observaciones sobre el grupo o metodología..." maxlength="${yn.notasMax}">${h(e?.descripcion||``)}</textarea>
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-grupal" style="display:${e?.tipo_clase===`rotativa`?`none`:`block`}">
        <label class="form-label-compact mb-2"><i class="bi bi-people me-1"></i>Inscribir Alumnos</label>
        ${Mn(t)}
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-rotativa" style="display:${e?.tipo_clase===`rotativa`?`block`:`none`}">
        <label class="form-label-compact mb-2"><i class="bi bi-person-lines-fill me-1"></i>Turnos individuales</label>
        ${Sn(n)}
      </div>
    </form>
  `}function Sn(e=[]){let t=vn.alumnos||[],n=(e=``,n=``,r=``)=>(t.find(t=>t.id===e),`
      <div class="slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary">
        <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
          <option value="">Seleccionar alumno…</option>
          ${t.map(t=>`
            <option value="${t.id}" ${t.id===e?`selected`:``}>
              ${h(t.nombre_completo)}${t.instrumento_principal?` — ${h(t.instrumento_principal)}`:``}
            </option>`).join(``)}
        </select>
        <div class="d-flex align-items-center gap-1 flex-shrink-0">
          <input type="time" class="form-control form-control-sm slot-hora-inicio" value="${n}" style="width:110px;" required title="Hora inicio">
          <span class="text-muted small">–</span>
          <input type="time" class="form-control form-control-sm slot-hora-fin" value="${r}" style="width:110px;" required title="Hora fin">
        </div>
        <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
          <i class="bi bi-x-circle-fill fs-5"></i>
        </button>
      </div>`);return`
    <div id="slots-container" class="mb-2">
      ${e.length?e.map(e=>n(e.alumno_id,(e.hora_inicio||``).slice(0,5),(e.hora_fin||``).slice(0,5))).join(``):n()}
    </div>
    <button type="button" class="btn btn-sm btn-outline-primary w-100" id="btn-add-slot">
      <i class="bi bi-plus-circle me-1"></i> Agregar turno
    </button>
    <div class="text-end mt-1">
      <small class="text-muted" id="slots-count">
        ${e.length||0} turno${e.length===1?``:`s`} asignado${e.length===1?``:`s`}
      </small>
    </div>`}function Cn(e,t){let n=e.querySelector(`#btn-seleccionar-ruta`);n&&n.addEventListener(`click`,async t=>{t.preventDefault();let n=e.querySelector(`#modal-instrumento`)?.value?.trim();if(!n){v.warning(`Selecciona un instrumento primero`);return}_n(n,`Cualquier Nivel`,t=>{e.querySelector(`#modal-ruta_id`).value=t,e.querySelector(`#modal-ruta-display`).value=`Ruta seleccionada ✓`,v.success(`Ruta asignada a la clase`)})});let r=e.querySelector(`#modal-tiene_suplente`),i=e.querySelector(`#modal-maestro_suplente_id`);r&&i&&r.addEventListener(`change`,e=>{i.style.display=e.target.checked?`block`:`none`,e.target.checked||(i.value=``)}),e.querySelector(`#btn-add-horario`).addEventListener(`click`,()=>{let t=e.querySelector(`#modal-horarios-container`),n=t.children.length,r=document.createElement(`div`);r.innerHTML=An(null,n),t.appendChild(r.firstElementChild)}),e.querySelector(`#modal-horarios-container`).addEventListener(`click`,t=>{let n=t.target.closest(`.btn-remove-horario`);n&&(e.querySelector(`#modal-horarios-container`).children.length>1?n.closest(`.horario-row`).remove():v.warning(`La clase debe tener al menos un horario`))});let a=e.querySelector(`#seccion-alumnos-grupal`),o=e.querySelector(`#seccion-alumnos-rotativa`);e.querySelectorAll(`input[name="modal-tipo_clase"]`).forEach(t=>{t.addEventListener(`change`,()=>{let t=e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value===`rotativa`;a.style.display=t?`none`:`block`,o.style.display=t?`block`:`none`})});let s=e.querySelector(`#slots-container`),c=e.querySelector(`#slots-count`),l=()=>{let e=s.querySelectorAll(`.slot-row`).length;c.textContent=`${e} turno${e===1?``:`s`} asignado${e===1?``:`s`}`};e.querySelector(`#btn-add-slot`)?.addEventListener(`click`,()=>{let e=vn.alumnos||[],t=document.createElement(`div`);t.innerHTML=(Sn([]).split(`id="slots-container"`)[1],``);let n=document.createElement(`div`);n.className=`slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary`,n.innerHTML=`
      <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
        <option value="">Seleccionar alumno…</option>
        ${e.map(e=>`<option value="${e.id}">${h(e.nombre_completo)}${e.instrumento_principal?` — ${h(e.instrumento_principal)}`:``}</option>`).join(``)}
      </select>
      <div class="d-flex align-items-center gap-1 flex-shrink-0">
        <input type="time" class="form-control form-control-sm slot-hora-inicio" style="width:110px;" required title="Hora inicio">
        <span class="text-muted small">–</span>
        <input type="time" class="form-control form-control-sm slot-hora-fin" style="width:110px;" required title="Hora fin">
      </div>
      <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
        <i class="bi bi-x-circle-fill fs-5"></i>
      </button>`,s.appendChild(n),l()}),s?.addEventListener(`click`,e=>{if(e.target.closest(`.btn-remove-slot`)){if(s.querySelectorAll(`.slot-row`).length<=1){v.warning(`Debe haber al menos un turno en una clase rotativa`);return}e.target.closest(`.slot-row`).remove(),l()}});let u=e.querySelector(`#search-modal-alumnos`),d=e.querySelectorAll(`.alumno-check-item`);u?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();d.forEach(e=>{let n=e.dataset.nombre.includes(t)||e.dataset.instrumento.includes(t);e.style.display=n?`block`:`none`})});let f=e.querySelectorAll(`.alumnos-list input[type="checkbox"]`),p=e.querySelector(`#alumnos-selection-count`),m=()=>{let e=Array.from(f).filter(e=>e.checked).length;p&&(p.textContent=`${e} alumnos seleccionados`)};f.forEach(e=>e.addEventListener(`change`,m)),m()}async function wn(e,t){let n=!!t,r=(()=>{let t=e.querySelector(`#modal-maestro_suplente_id`).value,n=e.querySelector(`#modal-tiene_suplente`).checked;return{nombre:e.querySelector(`#modal-nombre`).value.trim(),programa_id:e.querySelector(`#modal-programa_id`).value,maestro_principal_id:e.querySelector(`#modal-maestro_id`).value,maestro_suplente_id:n?t:null,tiene_suplente:n,instrumento:e.querySelector(`#modal-instrumento`).value.trim(),capacidad_maxima:parseInt(e.querySelector(`#modal-max_alumnos`).value)||20,estado:e.querySelector(`#modal-estado`).value,tipo_clase:e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value||`grupal`,descripcion:e.querySelector(`#modal-notas_pedagogicas`).value.trim(),ruta_id:e.querySelector(`#modal-ruta_id`)?.value||null,horarios:Array.from(e.querySelectorAll(`.horario-row`)).map(e=>({dia:e.querySelector(`[name="horario-dia"]`).value,hora_inicio:e.querySelector(`[name="horario-hora_inicio"]`).value,hora_fin:e.querySelector(`[name="horario-hora_fin"]`).value,salon_id:e.querySelector(`[name="horario-salon_id"]`).value||null}))}})(),i=new Se(r).validate();if(i.length>0)return v.error(i[0]),!1;let a=()=>Array.from(e.querySelectorAll(`#slots-container .slot-row`)).map(e=>({alumno_id:e.querySelector(`.slot-alumno-select`).value,hora_inicio:e.querySelector(`.slot-hora-inicio`).value,hora_fin:e.querySelector(`.slot-hora-fin`).value})).filter(e=>e.alumno_id),o=async t=>{let n=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value),r=(await be(t)).map(e=>e.alumno_id),i=n.filter(e=>!r.includes(e)),a=r.filter(e=>!n.includes(e));await Promise.all([...i.map(e=>_e(t,e)),...a.map(e=>de(t,e))])},s=async e=>{let t=a();if(t.length===0)return v.warning(`Agregá al menos un turno`),!1;if(t.find(e=>!e.hora_inicio||!e.hora_fin))return v.error(`Todos los turnos deben tener hora de inicio y fin`),!1;let n=(await be(e)).map(e=>e.alumno_id),r=t.map(e=>e.alumno_id),i=n.filter(e=>!r.includes(e));return await Promise.all(i.map(t=>de(e,t))),await Promise.all(t.map(t=>n.includes(t.alumno_id)?he(e,t.alumno_id,t.hora_inicio,t.hora_fin):_e(e,t.alumno_id,t.hora_inicio,t.hora_fin))),!0};try{let i;if(n)if(i=await xe(t.id,r),r.tipo_clase===`rotativa`){if(!await s(i.id))return!1}else await o(i.id);else if(i=await ye(r),r.tipo_clase===`rotativa`){if(!await s(i.id))return!1}else{let t=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value);t.length>0&&await Promise.all(t.map(e=>_e(i.id,e)))}return v.success(n?`Clase actualizada`:`Clase creada`),vn.onSuccess&&vn.onSuccess(),!0}catch(e){return e.isConflict?v.warning(`Conflicto detected: ${e.message}`):v.error(e.message),!1}}function Tn(e=``){return`<option value="">Seleccionar maestro...</option>`+vn.maestros.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${h(t.nombre_completo||t.nombre)}</option>`).join(``)}function En(e=``){return`<option value="">Sin salón (Online/Otro)</option>`+vn.salones.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${h(t.nombre)}</option>`).join(``)}function Dn(e=``){return`<option value="">Seleccionar programa...</option>`+vn.programas.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${h(t.nombre)}</option>`).join(``)}function On(e=`activa`){return Se.getEstados().map(t=>`<option value="${t}" ${t===e?`selected`:``}>${Se.getEstadoLabel(t)}</option>`).join(``)}function kn(){return`<datalist id="instrumentos-list">${[`Violín`,`Viola`,`Cello`,`Piano`,`Flauta`,`Teoría`,`Coro`].map(e=>`<option value="${e}">`).join(``)}</datalist>`}function An(e,t){return`
    <div class="horario-row bg-body-tertiary p-2 rounded mb-2 border" data-index="${t}">
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <select class="form-select form-select-sm" name="horario-dia" required>
            <option value="">Día...</option>
            ${[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`].map(t=>`<option value="${t}" ${e?.dia===t?`selected`:``}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-3">
          <input type="time" class="form-control form-control-sm" name="horario-hora_inicio" value="${(e?.hora_inicio||``).slice(0,5)}" required>
        </div>
        <div class="col-md-3">
          <input type="time" class="form-control form-control-sm" name="horario-hora_fin" value="${(e?.hora_fin||``).slice(0,5)}" required>
        </div>
        <div class="col-md-2 d-flex justify-content-end">
          <button type="button" class="btn btn-sm btn-link text-danger btn-remove-horario" title="Quitar"><i class="bi bi-x-circle"></i></button>
        </div>
        <div class="col-12 mt-1">
          <select class="form-select form-select-sm" name="horario-salon_id">
            ${En(e?.salon_id)}
          </select>
        </div>
      </div>
    </div>
  `}function jn(e=[]){return e.length===0?An(null,0):e.map((e,t)=>An(e,t)).join(``)}function Mn(e=[]){return`
    <div class="alumnos-selector-container">
      <div class="input-group input-group-sm mb-2">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control" id="search-modal-alumnos" placeholder="Filtrar por nombre o instrumento...">
      </div>
      <div class="alumnos-list border rounded bg-body-tertiary" style="max-height: 200px; overflow-y: auto; padding: 8px;">
        ${(vn.alumnos||[]).map(t=>`
          <div class="form-check alumno-check-item" data-nombre="${t.nombre_completo.toLowerCase()}" data-instrumento="${(t.instrumento_principal||``).toLowerCase()}">
            <input class="form-check-input" type="checkbox" value="${t.id}" id="chk-a-${t.id}" ${e.includes(t.id)?`checked`:``}>
            <label class="form-check-label small w-100 cursor-pointer" for="chk-a-${t.id}">
              ${h(t.nombre_completo)} <span class="text-muted">(${h(t.instrumento_principal||`N/A`)})</span>
            </label>
          </div>
        `).join(``)}
      </div>
      <div class="text-end mt-1"><small class="text-muted" id="alumnos-selection-count">0 seleccionados</small></div>
    </div>
  `}var Nn=`app-help-panel`,Pn=`app-help-overlay`,Fn=!1;function In(){if(Fn)return;Fn=!0;let e=document.createElement(`style`);e.id=`app-help-panel-styles`,e.textContent=`
    /* ── Overlay ─────────────────────────────────────────── */
    #app-help-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.18);
      z-index: 3000;
      opacity: 0;
      transition: opacity 0.22s ease;
    }
    #app-help-overlay.hp-visible { opacity: 1; }

    /* ── Panel ───────────────────────────────────────────── */
    #app-help-panel {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(380px, 94vw);
      background: var(--bs-body-bg, #fff);
      border-left: 1px solid var(--bs-border-color, #e5e7eb);
      box-shadow: -12px 0 40px rgba(0,0,0,0.08);
      z-index: 3001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.26s cubic-bezier(0.32,0,0.08,1);
      overflow: hidden;
    }
    #app-help-panel.hp-visible { transform: translateX(0); }

    /* ── Header ──────────────────────────────────────────── */
    #ahp-header {
      display: flex;
      align-items: center;
      padding: 0 1.25rem;
      height: 56px;
      border-bottom: 1px solid var(--bs-border-color, #e5e7eb);
      flex-shrink: 0;
      gap: 0.625rem;
    }
    #ahp-badge {
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 1.5px solid var(--bs-border-color, #d1d5db);
      display: flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #6b7280);
      font-size: 0.78rem;
      flex-shrink: 0;
    }
    #ahp-title {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--bs-body-color, #111827);
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #ahp-close {
      background: none; border: none; cursor: pointer;
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #9ca3af);
      transition: background 0.12s, color 0.12s;
      flex-shrink: 0;
    }
    #ahp-close:hover {
      background: var(--bs-tertiary-bg, #f3f4f6);
      color: var(--bs-body-color, #374151);
    }

    /* ── Body ────────────────────────────────────────────── */
    #ahp-body {
      overflow-y: auto;
      padding: 1.5rem 1.25rem 2rem;
      flex: 1;
    }
    #ahp-body::-webkit-scrollbar { width: 4px; }
    #ahp-body::-webkit-scrollbar-track { background: transparent; }
    #ahp-body::-webkit-scrollbar-thumb { background: var(--bs-border-color, #d1d5db); border-radius: 2px; }

    /* ── Intro ───────────────────────────────────────────── */
    .ahp-intro {
      font-size: 0.8125rem;
      color: var(--bs-secondary-color, #6b7280);
      line-height: 1.65;
      margin: 0 0 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--bs-border-color, #f0f0f0);
    }

    /* ── Section label ───────────────────────────────────── */
    .ahp-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color, #9ca3af);
      margin-bottom: 0.75rem;
    }

    /* ── Section item ────────────────────────────────────── */
    .ahp-item {
      display: flex;
      gap: 0.875rem;
      padding: 0.875rem 0 0.875rem 0.875rem;
      border-left: 2px solid var(--ahp-accent, #e5e7eb);
      margin-bottom: 0.5rem;
      transition: border-color 0.15s;
    }
    .ahp-item:last-child { margin-bottom: 0; }
    .ahp-item:hover { border-left-color: var(--ahp-accent-hover, #93c5fd); }

    .ahp-item-icon {
      font-size: 0.9rem;
      color: var(--ahp-accent, #6b7280);
      flex-shrink: 0;
      margin-top: 1px;
      width: 16px;
      text-align: center;
    }
    .ahp-item-body {}
    .ahp-item-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--bs-body-color, #111827);
      margin-bottom: 0.2rem;
      line-height: 1.3;
    }
    .ahp-item-desc {
      font-size: 0.77rem;
      color: var(--bs-secondary-color, #6b7280);
      line-height: 1.6;
      margin: 0;
    }

    /* ── Help trigger button (usado en los headers de vistas) */
    .btn-help-trigger {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 1.5px solid var(--bs-border-color, #d1d5db);
      background: transparent;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #9ca3af);
      font-size: 0.75rem;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .btn-help-trigger:hover {
      border-color: var(--bs-primary, #3b82f6);
      color: var(--bs-primary, #3b82f6);
      background: var(--bs-primary-bg-subtle, #eff6ff);
    }
  `,document.head.appendChild(e)}function Ln(){if(document.getElementById(Nn))return;In();let e=document.createElement(`div`);e.id=Pn,document.body.appendChild(e);let t=document.createElement(`div`);t.id=Nn,t.setAttribute(`role`,`complementary`),t.setAttribute(`aria-label`,`Ayuda`),t.innerHTML=`
    <div id="ahp-header">
      <div id="ahp-badge"><i class="bi bi-question"></i></div>
      <span id="ahp-title">Ayuda</span>
      <button id="ahp-close" aria-label="Cerrar">
        <i class="bi bi-x" style="font-size:1.1rem;"></i>
      </button>
    </div>
    <div id="ahp-body"></div>
  `,document.body.appendChild(t),e.addEventListener(`click`,()=>Rn.close()),t.querySelector(`#ahp-close`).addEventListener(`click`,()=>Rn.close()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&Rn.close()})}var Rn={open({title:e,intro:t,sections:n=[]}){Ln();let r=document.getElementById(Nn),i=document.getElementById(Pn);document.getElementById(`ahp-title`).textContent=e||`Ayuda`,document.getElementById(`ahp-body`).innerHTML=`
      ${t?`<p class="ahp-intro">${t}</p>`:``}
      ${n.length?`<div class="ahp-label">En esta pantalla</div>`:``}
      ${n.map(e=>{let t=e.color||`#6b7280`;return`
          <div class="ahp-item" style="--ahp-accent:${t};--ahp-accent-hover:${e.color?e.color+`60`:`#d1d5db`};">
            <i class="bi ${e.icon||`bi-dot`} ahp-item-icon" style="color:${t};"></i>
            <div class="ahp-item-body">
              <div class="ahp-item-title">${e.title}</div>
              <p class="ahp-item-desc">${e.description}</p>
            </div>
          </div>`}).join(``)}
    `,i.style.display=`block`,requestAnimationFrame(()=>{i.classList.add(`hp-visible`),r.classList.add(`hp-visible`)})},close(){let e=document.getElementById(Nn),t=document.getElementById(Pn);!e||!e.classList.contains(`hp-visible`)||(e.classList.remove(`hp-visible`),t.classList.remove(`hp-visible`),setTimeout(()=>{t&&(t.style.display=`none`)},280))}},E={maestros:[],maestrosOriginales:[],editando:null,deletingId:null},zn={nombreMax:100},Bn=null,Vn=[`Piano`,`Guitarra`,`Violín`,`Viola`,`Cello`,`Contrabajo`,`Flauta`,`Clarinete`,`Oboe`,`Fagot`,`Saxofón`,`Trompeta`,`Trombón`,`Corno`,`Tuba`,`Percusión`,`Batería`,`Canto`,`Teoría`,`Solfeo`,`Dirección`,`Composición`,`Arreglos`];async function Hn(e){try{Un(e);let t=await en();E.maestros=t,E.maestrosOriginales=[...t],Jn(e),Xn(e)}catch(t){console.error(t),Wn(e,t.message)}}function Un(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando maestros...</p>
      </div>
    </div>
  `}function Wn(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${T(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>Hn(e))}function Gn(e=[],t=`modal-especialidades-input`){return`
    <div class="mb-3">
      <label class="form-label-compact">Especialidades</label>
      <div class="especialidades-chips-container" id="modal-especialidades-container">
        <div class="chips-wrapper d-flex flex-wrap gap-1 mb-2">
          ${e.map(e=>`
            <span class="badge bg-primary-subtle text-primary rounded-pill chip-item">
              ${T(e)}
              <i class="bi bi-x-lg chip-remove" data-especialidad="${T(e)}" style="cursor:pointer;margin-left:4px;"></i>
            </span>
          `).join(``)}
        </div>
        <div class="d-flex gap-2">
          <input type="text" class="form-control input-dense" id="${t}" placeholder="Escribir y presionar Enter...">
          <button type="button" class="btn btn-outline-secondary btn-sm-compact" id="btnAddEspecialidad">
            <i class="bi bi-plus-lg"></i>
          </button>
        </div>
        <div class="mt-2">
          <small class="text-muted">Sugerencias:</small>
          <div class="d-flex flex-wrap gap-1 mt-1">
            ${Vn.slice(0,8).map(e=>`
              <button type="button" class="btn btn-link btn-sm p-0 suggest-chip" data-especialidad="${T(e)}">${T(e)}</button>
            `).join(`, `)}
          </div>
        </div>
      </div>
    </div>
  `}function Kn(e){let t=e.querySelector(`.especialidades-chips-container`);if(!t)return[];let n=t.querySelectorAll(`.chip-item`);return Array.from(n).map(e=>e.textContent.replace(/×$/,``).trim())}function qn(e,t){let n=e.querySelector(`#modal-especialidades-input`),r=e.querySelector(`#btnAddEspecialidad`),i=e.querySelector(`.especialidades-chips-container`),a=r=>{let a=r.trim();if(a){if(!Kn(e).includes(a)){let e=i.querySelector(`.chips-wrapper`),n=document.createElement(`span`);n.className=`badge bg-primary-subtle text-primary rounded-pill chip-item`,n.innerHTML=`${T(a)}<i class="bi bi-x-lg chip-remove" data-especialidad="${T(a)}" style="cursor:pointer;margin-left:4px;"></i>`,e.appendChild(n),t&&t()}n.value=``}};n?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(e.preventDefault(),a(n.value))}),r?.addEventListener(`click`,()=>a(n.value)),i?.addEventListener(`click`,e=>{e.target.classList.contains(`chip-remove`)&&(e.target.closest(`.chip-item`).remove(),t&&t()),e.target.classList.contains(`suggest-chip`)&&(e.preventDefault(),a(e.target.dataset.especialidad))})}function Jn(e){e.innerHTML=`
    <div class="page-container">
      <div class="maestros-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-person-check fs-4"></i>
          </div>
          <div>
            <h1 class="maestros-title-premium mb-0">Maestros</h1>
            <p class="text-muted small mb-0">${E.maestros.length} maestros en total</p>
          </div>
        </div>
        
        <div class="maestros-header-actions">
          <button class="btn-help-trigger" id="btn-help-maestros" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <button class="btn btn-outline-success btn-sm-compact me-2" id="btnExportarCSV" title="Exportar CSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-premium-action" id="btnAgregarMaestro">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Maestro
          </button>
        </div>
      </div>

      <div class="maestros-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar maestro..." id="buscar" autocomplete="off">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="maestrosTBody">
          ${Yn(E.maestros)}
        </div>
      </div>

      <div class="toast-container position-fixed top-0 end-0 p-3" id="toastContainer"></div>
    </div>
  `}function Yn(e){return e.length?e.map(e=>{let t=e.nombre||e.name||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${cn(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${T(t)}</span>
            <small class="text-muted text-truncate">
              ${T(e.instrumento||`Sin instrumento especificado`)}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          ${e.telefono?`
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${e.id}" title="Enviar WhatsApp" style="min-height: 32px;" ${n?``:`disabled`}>
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${T(e.telefono)}</span>
            </button>
          `:`<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin número</span>`}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):`
      <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
        <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
        No hay maestros registrados.
      </div>`}function Xn(e){Bn=e,e.querySelector(`#btnAgregarMaestro`).addEventListener(`click`,()=>$n()),e.querySelector(`#btn-help-maestros`)?.addEventListener(`click`,()=>{Rn.open({title:`Maestros`,intro:`Gestión del plantel docente. Desde acá podés ver, agregar, editar y desactivar maestros, y acceder al perfil completo de cada uno.`,sections:[{icon:`bi-search`,title:`Buscador y filtros`,description:`Filtrá por nombre, instrumento o estado (activo/inactivo) en tiempo real.`,color:`#6b7280`},{icon:`bi-person-badge`,title:`Tarjeta de maestro`,description:`Nombre, instrumento principal, clases activas y estado. Badge verde = activo, gris = inactivo.`,color:`#3b82f6`},{icon:`bi-eye`,title:`Ver perfil`,description:`Perfil completo: datos personales, clases (titular y suplente), horarios y ocupación.`,color:`#10b981`},{icon:`bi-pencil`,title:`Editar desde el perfil`,description:`Desde el perfil podés editar cualquier clase que dicte directamente, sin salir del modal.`,color:`#f59e0b`},{icon:`bi-person-x`,title:`Desactivar maestro`,description:`Desactivar oculta al maestro de listas operativas pero conserva su historial. No elimina datos.`,color:`#ef4444`}]})}),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>ar()),e.querySelector(`#buscar`).addEventListener(`input`,()=>Qn()),e.querySelector(`#filtroEstado`).addEventListener(`change`,()=>Qn()),e.querySelector(`#maestrosTBody`).addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){tr(t.dataset.id);return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id,i=n.dataset.action;i===`edit`?er(r):i===`delete`?nr(r):i===`whatsapp`&&Zn(r)})}function Zn(e){let t=E.maestrosOriginales.find(t=>t.id===e);if(!t||!t.telefono)return;let n=t.telefono.replace(/\D/g,``);b.open({title:`Enviar WhatsApp a `+T(t.nombre||t.name||``),size:`md`,saveText:`Enviar WhatsApp`,body:`
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> +${n}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
      </p>
    `,onSave:async e=>{let t=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=`https://wa.me/${n}?text=${encodeURIComponent(t)}`;window.open(r,`_blank`)}})}function Qn(){let e=Bn.querySelector(`#buscar`).value.trim().toLowerCase(),t=Bn.querySelector(`#filtroEstado`).value;E.maestros=E.maestrosOriginales.filter(n=>{let r=(n.nombre||n.name||``).toLowerCase(),i=!e||r.includes(e)||(n.email||``).toLowerCase().includes(e)||(n.instrumento||``).toLowerCase().includes(e)||(n.especialidad||``).toLowerCase().includes(e)||(n.especialidades||[]).some(t=>t.toLowerCase().includes(e)),a=n.is_active??!0;return i&&(t===`todos`||t===`activo`&&a||t===`inactivo`&&!a)}),rr()}function $n(){E.editando=null,b.open({title:`Crear Nuevo Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${zn.nombreMax}" placeholder="Juan Pérez">
        <small class="text-muted" id="modal-nombreCount">0/${zn.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required placeholder="email@ejemplo.com">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Contraseña *</label>
        <input type="password" class="form-control input-dense" id="modal-password" required placeholder="Contraseña para iniciar sesión" minlength="6">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" placeholder="+58 412 1234567">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required placeholder="Violín">
      </div>
      ${Gn([],`modal-especialidades-input`)}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2" placeholder="Breve descripción..."></textarea>
      </div>
    </form>`,onShow:e=>qn(e),saveText:`Guardar`,onSave:async e=>{let t=e.querySelector(`#modal-nombre`).value.trim(),n=e.querySelector(`#modal-email`).value.trim().toLowerCase(),r=e.querySelector(`#modal-password`)?.value,i=e.querySelector(`#modal-telefono`).value.trim(),a=e.querySelector(`#modal-instrumento`).value.trim(),o=e.querySelector(`#modal-bio`).value.trim();if(!t)return D(`El nombre es obligatorio`,`error`),!1;if(!n)return D(`El email es obligatorio`,`error`),!1;if(!ir(n))return D(`El formato del email no es válido`,`error`),!1;if(!r||r.length<6)return D(`La contraseña debe tener al menos 6 caracteres`,`error`),!1;if(!a)return D(`El instrumento es obligatorio`,`error`),!1;if(n&&await an(n))return D(`El email ya está registrado`,`error`),!1;let s=Kn(e);try{let{data:e,error:c}=await _.auth.signUp({email:n,password:r,options:{data:{full_name:t,rol:`maestro`}}});if(c)return D(c.message||`Error al crear usuario`,`error`),!1;if(!e?.user)return D(`No se pudo crear el usuario`,`error`),!1;let l=e.user.id;await _.from(`profiles`).update({estado:`activo`}).eq(`id`,l),await _.from(`maestros`).update({tlf:i||null,especialidad:a||null,resena:o||null,especialidades:s}).eq(`user_id`,l);let u=await en();E.maestros=u,E.maestrosOriginales=[...u],Qn(),D(`Maestro creado exitosamente. Ya puede iniciar sesión.`,`success`)}catch(e){console.error(`Error creando maestro:`,e),D(`Error al crear el maestro: `+e.message,`error`)}}})}function er(e){let t=E.maestrosOriginales.find(t=>t.id===e);if(!t){D(`Maestro no encontrado`,`error`);return}E.editando=e,b.open({title:`Editar Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${zn.nombreMax}" value="${T(t.nombre||t.name||``)}">
        <small class="text-muted" id="modal-nombreCount">${(t.nombre||t.name||``).length}/${zn.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required value="${T(t.email||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" value="${T(t.telefono||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required value="${T(t.instrumento||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" value="${T(t.especialidad||``)}">
      </div>
      ${Gn(t.especialidades||[],`modal-especialidades-input`)}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2">${T(t.bio||``)}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${t.is_active===!1?``:`checked`}>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,onShow:e=>qn(e),saveText:`Guardar cambios`,onSave:async e=>{let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-telefono`).value.trim(),a=e.querySelector(`#modal-instrumento`).value.trim(),o=e.querySelector(`#modal-especialidad`).value.trim(),s=e.querySelector(`#modal-bio`).value.trim(),c=e.querySelector(`#modal-esActivo`).checked;if(!n)return D(`El nombre es obligatorio`,`error`),!1;if(!r)return D(`El email es obligatorio`,`error`),!1;if(!ir(r))return D(`El formato del email no es válido`,`error`),!1;if(r&&t.email!==r&&await an(r))return D(`El email ya está registrado`,`error`),!1;let l=Kn(e),u={nombre:n,email:r||null,telefono:i||null,instrumento:a||null,especialidad:o||null,bio:s||null,is_active:c,especialidades:l};await tn(E.editando,u);let d=E.maestrosOriginales.findIndex(e=>e.id===E.editando);d!==-1&&(E.maestrosOriginales[d]={...E.maestrosOriginales[d],...u}),Qn(),D(`Maestro actualizado correctamente`,`success`)}})}function tr(e){let t=E.maestrosOriginales.find(t=>t.id===e);if(!t){D(`Maestro no encontrado`,`error`);return}let n=t.nombre||t.name||`-`,r=t.is_active??!0;b.open({title:n,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${T(n)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${t.email?`<a href="mailto:${T(t.email)}">${T(t.email)}</a>`:`-`}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${T(t.telefono||`-`)}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${T(t.instrumento||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidad</label>
            <p class="form-control-plaintext">${T(t.especialidad||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidades</label>
            <p class="form-control-plaintext">
              ${(t.especialidades||[]).length?t.especialidades.map(e=>`<span class="badge bg-primary-subtle text-primary me-1">${T(e)}</span>`).join(``):`Sin especialidades`}
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${on(r)}">${sn(r)}</span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-4">
        <label class="form-label fw-bold">Biografía</label>
        <p class="form-control-plaintext">${T(t.bio||`Sin biografía`)}</p>
      </div>
      <hr>
      <div class="mb-2">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="fw-bold" style="font-size:0.95rem;"><i class="bi bi-journal-text me-1 text-primary"></i> Clases Asignadas</span>
          <span id="maestro-clases-badge" class="badge bg-primary-subtle text-primary rounded-pill" style="font-size:0.75rem;">Cargando...</span>
        </div>
        <div id="maestro-clases-container">
          <div class="d-flex align-items-center gap-2 text-muted py-2">
            <div class="spinner-border spinner-border-sm text-primary"></div>
            <small>Cargando clases...</small>
          </div>
        </div>
      </div>
      
      <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-auto">
        <button class="btn btn-outline-danger" id="modal-view-btn-delete">
          <i class="bi bi-trash me-1"></i> Eliminar
        </button>
        <button class="btn btn-primary" id="modal-view-btn-edit">
          <i class="bi bi-pencil me-1"></i> Editar Perfil
        </button>
      </div>
    `,onShow:async t=>{t.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{b.close(),setTimeout(()=>er(e),300)}),t.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{b.close(),setTimeout(()=>nr(e),300)});let n=t.querySelector(`#maestro-clases-container`),r=t.querySelector(`#maestro-clases-badge`);(async()=>{try{let[t,i,a,o,s]=await Promise.all([pe(e),_.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),_.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),_.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),_.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]),c={maestros:i.data||[],salones:a.data||[],programas:o.data||[],alumnos:s.data||[]};if(r.textContent=`${t.length} clase${t.length===1?``:`s`}`,t.length===0){n.innerHTML=`
              <div class="text-center py-4 text-muted">
                <i class="bi bi-journal-x" style="font-size:2rem; opacity:0.4;"></i>
                <p class="mt-2 mb-0 small">Sin clases asignadas actualmente.</p>
              </div>`;return}let l={lunes:`Lun`,martes:`Mar`,miercoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sabado:`Sáb`,domingo:`Dom`},u=e=>e?.slice(0,5)||``,d=e=>`${l[e.dia]||e.dia} ${u(e.hora_inicio)}–${u(e.hora_fin)}`;n.innerHTML=`
            <div class="d-flex flex-column gap-2">
              ${t.map(e=>{let t=e.estado===`activa`||e.estado==null,n=e.capacidad_maxima?Math.round(e.total_alumnos/e.capacidad_maxima*100):null,r=n>=90?`#ef4444`:n>=70?`#f59e0b`:`#10b981`,i=e.horarios.map(e=>`<span style="background:var(--bs-tertiary-bg);border:1px solid var(--bs-border-color);border-radius:20px;padding:1px 8px;font-size:0.7rem;white-space:nowrap;">${d(e)}</span>`).join(``);return`
                  <div class="clase-card" data-clase-id="${e.id}" style="
                    border-radius: 10px;
                    border: 1px solid var(--bs-border-color);
                    overflow: hidden;
                    transition: box-shadow 0.15s;
                    ${t?``:`opacity:0.6;`}
                  ">
                    <div class="d-flex align-items-stretch">

                      <!-- Indicador de rol -->
                      <div style="width:4px;flex-shrink:0;background:${e.es_suplente?`#f59e0b`:`#6366f1`};"></div>

                      <!-- Info -->
                      <div class="flex-grow-1 px-3 py-2 overflow-hidden">
                        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <span class="fw-semibold text-truncate" style="font-size:0.87rem;" title="${T(e.nombre)}">${T(e.nombre)}</span>
                          ${t?``:`<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;">Inactiva</span>`}
                          ${e.es_suplente?`<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#fffbeb;color:#92400e;border:1px solid #fde68a;">Suplente</span>`:``}
                        </div>

                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1" style="font-size:0.75rem;color:var(--bs-secondary-color);">
                          ${e.instrumento?`<span>${T(e.instrumento)}</span><span style="opacity:0.3;">·</span>`:``}
                          ${e.horarios.length?i:`<span class="fst-italic" style="opacity:0.5;">Sin horario</span>`}
                        </div>

                        <div class="d-flex align-items-center gap-1" style="font-size:0.72rem;">
                          <i class="bi bi-people" style="color:var(--bs-secondary-color);"></i>
                          <span style="color:var(--bs-secondary-color);">${e.total_alumnos}${e.capacidad_maxima?`/${e.capacidad_maxima}`:``}</span>
                          ${n===null?``:`
                            <div style="flex:1;max-width:60px;height:4px;background:var(--bs-tertiary-bg);border-radius:2px;overflow:hidden;margin-left:4px;">
                              <div style="width:${n}%;height:100%;background:${r};border-radius:2px;transition:width 0.3s;"></div>
                            </div>
                            <span style="color:${r};font-weight:600;">${n}%</span>`}
                        </div>
                      </div>

                      <!-- Acciones -->
                      <div class="d-flex flex-column" style="border-left:1px solid var(--bs-border-color);flex-shrink:0;">
                        <button class="btn btn-link btn-editar-clase d-flex flex-column align-items-center justify-content-center gap-1 flex-fill px-3"
                          data-clase-id="${e.id}" title="Editar"
                          style="font-size:0.65rem;color:#6366f1;text-decoration:none;border-radius:0;border-bottom:1px solid var(--bs-border-color);">
                          <i class="bi bi-pencil" style="font-size:0.95rem;"></i>
                          Editar
                        </button>
                        <button class="btn btn-link btn-desvincular-clase d-flex flex-column align-items-center justify-content-center gap-1 flex-fill px-3"
                          data-clase-id="${e.id}"
                          data-clase-nombre="${T(e.nombre)}"
                          data-es-suplente="${e.es_suplente}"
                          title="Quitar"
                          style="font-size:0.65rem;color:#ef4444;text-decoration:none;border-radius:0;">
                          <i class="bi bi-person-dash" style="font-size:0.95rem;"></i>
                          Quitar
                        </button>
                      </div>

                    </div>
                  </div>`}).join(``)}
            </div>`,n.querySelectorAll(`.btn-editar-clase`).forEach(n=>{n.addEventListener(`click`,n=>{let r=n.currentTarget.dataset.claseId,i=t.find(e=>e.id===r);i&&(b.close(),setTimeout(()=>{bn(i,{...c,onSuccess:()=>{setTimeout(()=>tr(e),300)}})},300))})}),n.querySelectorAll(`.btn-desvincular-clase`).forEach(t=>{t.addEventListener(`click`,async t=>{let n=t.currentTarget.dataset.claseId,r=t.currentTarget.dataset.claseNombre,i=t.currentTarget.dataset.esSuplente===`true`?`maestro_suplente_id`:`maestro_principal_id`;if(confirm(`¿Quitar a este maestro de "${r}"?`))try{t.currentTarget.disabled=!0,t.currentTarget.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`,await xe(n,{[i]:null},!0),D(`Maestro desvinculado correctamente`,`success`),b.close(),setTimeout(()=>tr(e),300)}catch(e){D(`Error al desvincular: `+e.message,`error`),t.currentTarget.disabled=!1,t.currentTarget.innerHTML=`<i class="bi bi-person-dash" style="font-size:1rem;"></i><span>Quitar</span>`}})})}catch{r.textContent=`Error`,n.innerHTML=`
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar las clases.
            </div>`}})()}})}function nr(e){let t=E.maestrosOriginales.find(t=>t.id===e);if(!t){D(`Maestro no encontrado`,`error`);return}E.deletingId=e;let n=t.nombre||t.name||``,r=t.is_active!==!1;b.open({title:r?`⏸️ Desactivar Maestro`:`▶️ Reactivar Maestro`,size:`sm`,saveText:r?`Desactivar`:`Reactivar`,body:r?`<p>¿Desactivar al maestro <strong>${T(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro no aparecerá en las listas, pero sus datos se conservarán.</p>`:`<p>¿Reactivar al maestro <strong>${T(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro volverá a aparecer en las listas.</p>`,onSave:async()=>{r?(await nn(e),D(`Maestro desactivado correctamente`,`success`)):(await rn(e),D(`Maestro reactivado correctamente`,`success`)),Qn()}})}function rr(){let e=Bn.querySelector(`#maestrosTBody`);if(!e)return;e.innerHTML=Yn(E.maestros);let t=Bn.querySelector(`.maestros-header-premium p.text-muted`);t&&(t.textContent=`${E.maestros.length} maestros en total`)}function ir(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function ar(){if(E.maestrosOriginales.length===0){D(`No hay maestros para exportar`,`error`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Instrumento`,`Especialidad`,`Estado`],...E.maestrosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.instrumento||``,e.especialidad||``,e.is_active===!1?`Inactivo`:`Activo`])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`maestros-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),D(`CSV exportado exitosamente`,`success`)}function D(e,t=`info`){let n=Bn.querySelector(`#toastContainer`);if(!n)return;let r=t===`success`?`bg-success`:t===`error`?`bg-danger`:`bg-info`,i=t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:`bi-info-circle`,a=t===`success`?`Éxito`:t===`error`?`Error`:`Información`,o=document.createElement(`div`);o.className=`toast`,o.setAttribute(`role`,`alert`),o.setAttribute(`aria-live`,`assertive`),o.setAttribute(`aria-atomic`,`true`),o.innerHTML=`
    <div class="toast-header ${r} text-white">
      <i class="bi ${i} me-2"></i>
      <strong class="me-auto">${a}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">${T(e)}</div>
  `,n.appendChild(o),new je(o,{autohide:!0,delay:3e3}).show(),o.addEventListener(`hidden.bs.toast`,()=>o.remove())}function or(){S.register(`maestros`,Hn)}var sr=class{constructor(e={}){this.id=e.id||null,this.nombre=e.nombre||``,this.descripcion=e.descripcion||``,this.nivel=e.nivel||``,this.duracion_anios=e.duracion_anios||null,this.activo=e.activo===void 0?!0:e.activo,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(e=[]){let t=[];return!this.nombre||!this.nombre.trim()?t.push(`El nombre del programa es obligatorio`):this.nombre.length>100&&t.push(`El nombre no puede exceder los 100 caracteres`),this.nivel?e.length>0&&!e.includes(this.nivel)&&t.push(`El nivel seleccionado no es válido`):t.push(`El nivel es obligatorio`),this.descripcion&&this.descripcion.length>500&&t.push(`La descripción no puede exceder los 500 caracteres`),this.duracion_anios!==null&&(isNaN(this.duracion_anios)||this.duracion_anios<0)&&t.push(`La duración debe ser un número positivo`),t}toJSON(){return{nombre:this.nombre.trim(),descripcion:this.descripcion?this.descripcion.trim():``,nivel:this.nivel,duracion_anios:this.duracion_anios,activo:this.activo}}},cr=[{value:``,label:`Sin nivel específico`},{value:`1`,label:`1° Año`},{value:`2`,label:`2° Año`},{value:`3`,label:`3° Año`},{value:`4`,label:`4° Año`},{value:`5`,label:`5° Año`},{value:`6`,label:`6° Año`},{value:`inicial`,label:`Nivel Inicial`},{value:`intermedio`,label:`Nivel Intermedio`},{value:`avanzado`,label:`Nivel Avanzado`},{value:`preuniversitario`,label:`Pre-Universitario`}];function lr(e){let t=cr.find(t=>t.value===e);return t?t.label:e||`-`}async function ur(){let{data:e,error:t}=await _.from(`programas`).select(`*`).order(`nombre`,{ascending:!0});if(t)throw console.error(`Error cargando programas:`,t.message),t;return(e||[]).map(e=>new sr(e))}async function dr(e){let t=new sr(e),n=cr.map(e=>e.value).filter(Boolean),r=t.validate(n);if(r.length>0)throw Error(r.join(`. `));let{data:i,error:a}=await _.from(`programas`).insert([t.toJSON()]).select();if(a)throw console.error(`Error creando programa:`,a.message),a;return new sr(i[0])}async function fr(e,t){let n=new sr(t),r=cr.map(e=>e.value).filter(Boolean),i=n.validate(r);if(i.length>0)throw Error(i.join(`. `));let{data:a,error:o}=await _.from(`programas`).update(n.toJSON()).eq(`id`,e).select();if(o)throw console.error(`Error actualizando programa:`,o.message),o;return new sr(a[0])}async function pr(e){let{error:t}=await _.from(`programas`).delete().eq(`id`,e);if(t)throw console.error(`Error eliminando programa:`,t.message),t}async function mr(e){let{jsPDF:t}=await y(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-CBtVkUg2.js`).then(e=>e.n);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:n}=await y(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-C032RTqY.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([7,4])),r=new t;r.setFontSize(18),r.text(`Programas Académicos`,14,22),r.setFontSize(10),r.text(`Fecha: ${new Date().toLocaleDateString(`es-ES`)}`,14,30),n(r,{head:[[`Nombre`,`Nivel`,`Descripción`,`Estado`,`Creado`]],body:e.map(e=>[e.nombre,lr(e.nivel),e.descripcion?e.descripcion.substring(0,50)+(e.descripcion.length>50?`...`:``):`-`,e.activo?`Activo`:`Inactivo`,e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`):`-`]),startY:35,styles:{fontSize:9},headStyles:{fillColor:[41,128,185]}}),r.save(`programas.pdf`)}var O={programas:[],programasOriginales:[],cargando:!1},hr={nombreMax:100,descripcionMax:500};function gr(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function _r(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`N/A`}function vr(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].charAt(0).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function yr(e=``){return cr.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}async function br(e){try{O.cargando=!0,xr(e);let t=await ur();O.programas=t,O.programasOriginales=[...t],O.cargando=!1,Cr(e),Dr(e)}catch(t){console.error(`[ProgramasView]`,t),Sr(e,t.message)}}function xr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando programas...</p>
      </div>
    </div>
  `}function Sr(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${gr(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>br(e))}function Cr(e){e.innerHTML=`
    <div class="page-container">
      <div class="programas-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-journal-bookmark fs-4"></i>
          </div>
          <div>
            <h1 class="programas-title-premium page-title mb-0">Programas</h1>
            <p class="text-muted small mb-0">${O.programas.length} programas en total</p>
          </div>
        </div>
        
        <div class="programas-header-actions">
          <button class="btn btn-outline-secondary btn-sm-compact me-2" id="btnExportarPDF" title="Exportar PDF">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button class="btn btn-premium-action" id="btnAgregarPrograma">
            <i class="bi bi-plus-lg me-1.5"></i>Nuevo Programa
          </button>
        </div>
      </div>

      <div class="programas-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar programa..." id="buscar">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="programasTBody">
          ${wr(O.programas)}
        </div>
        <div id="emptyContainer">
          ${O.programas.length===0?Tr():``}
        </div>
      </div>
    </div>
  `}function wr(e){return e.length?e.map(e=>{let t=vr(e.nombre),n=lr(e.nivel),r=gr(e.descripcion||`Sin descripción`),i=`border-accent-${e.activo?`success`:`secondary`}`,a=`bg-${e.activo?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${i}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${t}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${a} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${gr(e.nombre)}</span>
            <small class="text-muted text-truncate">${n} • ${r.substring(0,50)}${r.length>50?`...`:``}</small>
          </div>
        </div>
        <div class="flex-shrink-0 text-muted ms-2 pe-1">
          <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):``}function Tr(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No hay programas que coincidan con la búsqueda.</p>
    </div>
  `}var Er=null;function Dr(e){Er=e,e.querySelector(`#btnAgregarPrograma`)?.addEventListener(`click`,()=>Ar()),e.querySelector(`#btnExportarPDF`)?.addEventListener(`click`,async()=>{try{await mr(O.programas),v.success(`PDF generado exitosamente`)}catch{v.error(`Error al generar PDF`)}}),e.querySelector(`#buscar`)?.addEventListener(`input`,Or),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,Or),e.querySelector(`#programasTBody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t){let t=e.target.closest(`.list-group-item[data-id]`);t&&Nr(t.dataset.id);return}let{action:n,id:r}=t.dataset;n===`edit`&&jr(r),n===`delete`&&Pr(r)})}function Or(){let e=Er.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=Er.querySelector(`#filtroEstado`)?.value||`todos`;O.programas=O.programasOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||(n.descripcion||``).toLowerCase().includes(e),i=t===`todos`||t===`activo`&&n.activo||t===`inactivo`&&!n.activo;return r&&i}),kr()}function kr(){let e=Er.querySelector(`#programasTBody`);e&&(e.innerHTML=wr(O.programas));let t=Er.querySelector(`#emptyContainer`);t&&(t.innerHTML=O.programas.length===0?Tr():``)}function Ar(){Mr({title:`Nuevo Programa`,saveText:`Crear Programa`})}function jr(e){let t=O.programasOriginales.find(t=>t.id===e);if(!t)return v.error(`Programa no encontrado`);Mr({title:`Editar Programa`,saveText:`Guardar Cambios`,programa:t})}function Mr({title:e,saveText:t,programa:n=null}){b.open({title:e,saveText:t,body:`
      <form id="form-programa" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Nombre del Programa *</label>
          <input type="text" class="form-control input-dense" id="prog-nombre" required maxlength="${hr.nombreMax}" value="${gr(n?.nombre||``)}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Nivel / Año *</label>
          <select class="form-select input-dense" id="prog-nivel">
            ${yr(n?.nivel||``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Duración (años)</label>
          <input type="number" class="form-control input-dense" id="prog-duracion" min="0" step="0.5" value="${n?.duracion_anios||``}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción</label>
          <textarea class="form-control input-dense" id="prog-descripcion" rows="3" maxlength="${hr.descripcionMax}">${gr(n?.descripcion||``)}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="prog-activo" ${n?.activo===!1?``:`checked`}>
            <label class="form-check-label" for="prog-activo">Programa Activo</label>
          </div>
        </div>
      </form>
    `,onSave:async e=>{let t={nombre:e.querySelector(`#prog-nombre`).value.trim(),nivel:e.querySelector(`#prog-nivel`).value,duracion_anios:e.querySelector(`#prog-duracion`).value?parseFloat(e.querySelector(`#prog-duracion`).value):null,descripcion:e.querySelector(`#prog-descripcion`).value.trim(),activo:e.querySelector(`#prog-activo`).checked},r=new sr(t),i=cr.map(e=>e.value).filter(Boolean),a=r.validate(i);if(a.length>0)return v.error(a[0]),!1;try{if(n){let e=await fr(n.id,t),r=O.programasOriginales.findIndex(e=>e.id===n.id);O.programasOriginales[r]=e,v.success(`Programa actualizado`)}else{let e=await dr(t);O.programasOriginales.unshift(e),v.success(`Programa creado`)}return Or(),!0}catch(e){return v.error(e.message),!1}}})}function Nr(e){let t=O.programasOriginales.find(t=>t.id===e);t&&b.open({title:`Perfil del Programa`,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="programa-profile">
        <!-- Header Banner / Avatar Section -->
        <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
          <div class="position-relative" style="flex-shrink: 0;">
            <div class="avatar-large bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center fw-bold" 
                 style="width: 60px; height: 60px; font-size: 1.6rem; border-radius: 50%;">
              ${vr(t.nombre)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 bg-${t.activo?`success`:`danger`} border border-light rounded-circle" 
                  style="transform: translate(10%, 10%);"
                  title="${t.activo?`Activo`:`Inactivo`}">
            </span>
          </div>
          <div class="overflow-hidden">
            <h4 class="h5 mb-1 fw-bold text-truncate" style="letter-spacing: -0.01em;">${gr(t.nombre)}</h4>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">${lr(t.nivel)}</span>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="row g-3">
          <div class="col-md-6">
            <div class="programa-profile-card h-100">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-clock me-1 text-primary"></i> Duración
              </label>
              <p class="mb-0 fw-semibold programa-profile-value" style="font-size: 0.95rem;">
                ${t.duracion_anios?`${t.duracion_anios} ${t.duracion_anios===1?`año`:`años`}`:`No especificada`}
              </p>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="programa-profile-card h-100 d-flex flex-column justify-content-between">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-fingerprint me-1 text-primary"></i> Identificador
              </label>
              <div class="d-flex align-items-center justify-content-between">
                <span class="font-monospace programa-profile-value small text-truncate pe-2" style="font-size: 0.85rem;">${t.id}</span>
                <button class="btn btn-link btn-sm p-0 text-decoration-none text-muted" id="copy-id-btn" title="Copiar ID" style="cursor: pointer;">
                  <i class="bi bi-copy"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="programa-profile-card">
              <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="bi bi-file-text me-1 text-primary"></i> Descripción
              </label>
              <p class="mb-0 programa-profile-desc" style="font-size: 0.9rem; line-height: 1.5; white-space: pre-line;">
                ${gr(t.descripcion||`Sin descripción detallada.`)}
              </p>
            </div>
          </div>

          <div class="col-12">
            <div class="programa-profile-card">
              <div class="row g-2">
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-check me-1"></i> Creado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${_r(t.created_at)}</p>
                </div>
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-event me-1"></i> Modificado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${t.updated_at?_r(t.updated_at):_r(t.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="col-12 text-end d-flex align-items-center justify-content-end gap-2 mt-2">
            <button class="btn btn-outline-danger btn-sm px-3" id="view-delete-btn" title="Eliminar programa">
              <i class="bi bi-trash me-1"></i> Eliminar
            </button>
            <button class="btn btn-primary btn-sm px-4" id="view-edit-btn" title="Editar programa">
              <i class="bi bi-pencil me-1"></i> Editar
            </button>
          </div>
        </div>
      </div>
    `,onShow:n=>{n.querySelector(`#view-edit-btn`).addEventListener(`click`,()=>{b.close(),setTimeout(()=>jr(e),300)}),n.querySelector(`#view-delete-btn`).addEventListener(`click`,()=>{b.close(),setTimeout(()=>Pr(e),300)}),n.querySelector(`#copy-id-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(t.id),v.success(`ID copiado al portapapeles`)})}})}function Pr(e){let t=O.programasOriginales.find(t=>t.id===e);t&&b.open({title:`⚠️ Eliminar Programa`,saveText:`Confirmar Eliminación`,body:`
      <p>¿Estás seguro de eliminar el programa <strong>${gr(t.nombre)}</strong>?</p>
      <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Esta acción no se puede deshacer.</p>
    `,onSave:async()=>{try{return await pr(e),O.programasOriginales=O.programasOriginales.filter(t=>t.id!==e),Or(),v.success(`Programa eliminado`),!0}catch{return v.error(`Error al eliminar`),!1}}})}function Fr(){S.register(`programas`,br)}var Ir=[{key:`nombre_completo`,label:`Nombre completo`,peso:10,grupo:`Personal`},{key:`fecha_nacimiento`,label:`Fecha de nacimiento`,peso:8,grupo:`Personal`},{key:`genero`,label:`Género`,peso:3,grupo:`Personal`},{key:`nacionalidad`,label:`Nacionalidad`,peso:3,grupo:`Personal`},{key:`municipio_residencia`,label:`Municipio`,peso:4,grupo:`Personal`},{key:`direccion`,label:`Dirección`,peso:4,grupo:`Personal`},{key:`madre_tlf_whatsapp`,label:`WhatsApp de la madre`,peso:8,grupo:`Contacto`},{key:`padre_tlf_whatsapp`,label:`WhatsApp del padre`,peso:5,grupo:`Contacto`},{key:`representante_tlf`,label:`Teléfono representante`,peso:5,grupo:`Contacto`},{key:`madre_nombre`,label:`Nombre de la madre`,peso:6,grupo:`Familia`},{key:`padre_nombre`,label:`Nombre del padre`,peso:5,grupo:`Familia`},{key:`representante_nombre`,label:`Nombre del representante`,peso:6,grupo:`Familia`},{key:`representante_parentesco`,label:`Parentesco representante`,peso:3,grupo:`Familia`},{key:`contacto_emergencia_nombre`,label:`Contacto de emergencia`,peso:4,grupo:`Familia`},{key:`instrumento_principal`,label:`Instrumento principal`,peso:8,grupo:`Musical`},{key:`instrumento_interes`,label:`Instrumento de interés`,peso:4,grupo:`Musical`},{key:`nivel_actual`,label:`Nivel actual`,peso:4,grupo:`Musical`},{key:`centro_estudios`,label:`Centro de estudios`,peso:4,grupo:`Escolar`},{key:`grado_nivel`,label:`Grado / Nivel`,peso:3,grupo:`Escolar`},{key:`alergias_descripcion`,label:`Alergias (declaradas)`,peso:3,grupo:`Salud`,opcional:!0},{key:`problemas_conducta`,label:`Conducta (declarada)`,peso:3,grupo:`Salud`,opcional:!0},{key:`acepta_pago_600`,label:`Acepta pago RD$600`,peso:5,grupo:`Compromisos`},{key:`autoriza_fotos_redes`,label:`Autoriza fotos en redes`,peso:3,grupo:`Compromisos`}],Lr=Ir.reduce((e,t)=>e+t.peso,0);function Rr(e,t){let n=e[t];return!(n==null||n===``||typeof n==`string`&&n.trim()===``)}function zr(e){let t=[],n=[];for(let r of Ir)Rr(e,r.key)?n.push(r):t.push(r);let r=n.reduce((e,t)=>e+t.peso,0),i=Math.round(r/Lr*100),a=i>=90?`completo`:i>=65?`bueno`:i>=35?`parcial`:`critico`,o={};for(let t of Ir)o[t.grupo]||(o[t.grupo]={total:0,completos:0,porcentaje:0,faltantes:[]}),o[t.grupo].total++,Rr(e,t.key)?o[t.grupo].completos++:o[t.grupo].faltantes.push(t.label);for(let e of Object.values(o))e.porcentaje=Math.round(e.completos/e.total*100);return{porcentaje:i,nivel:a,camposFaltantes:t,camposCompletos:n,porGrupo:o}}var Br={critico:`danger`,parcial:`warning`,bueno:`info`,completo:`success`},Vr={critico:`Crítico`,parcial:`Parcial`,bueno:`Bueno`,completo:`Completo`};function Hr(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`Fecha desconocida`}function Ur(e){if(!e)return null;let t=new Date,n=new Date(e),r=t.getFullYear()-n.getFullYear(),i=t.getMonth()-n.getMonth();return(i<0||i===0&&t.getDate()<n.getDate())&&r--,r}function k(e){return e==null?``:String(e).replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e})}function Wr(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}var A={alumnos:[],alumnosOriginales:[],cargando:!1,editando:null,viewingId:null,deletingId:null,filtroGenero:``,filtroEstado:`todos`},Gr=null,Kr={nombreMax:100,emailMax:100,cedulaMax:20,telefonoMax:20,acudienteMax:100,direccionMax:255,sectionMax:100};async function qr(e){try{A.cargando=!0,Jr(e);let t=await $e();A.alumnos=t,A.alumnosOriginales=[...t],A.cargando=!1,Xr(e),$r(e)}catch(t){console.error(t),Yr(e,t.message)}}function Jr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando alumnos...</p>
      </div>
    </div>
  `}function Yr(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${k(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>qr(e))}function Xr(e){e.innerHTML=`
    <div class="page-container">
      <div class="alumnos-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-people fs-4"></i>
          </div>
          <div>
            <h1 class="alumnos-title-premium mb-0">Alumnos</h1>
            <p class="text-muted small mb-0">${A.alumnos.length} alumnos en total</p>
          </div>
        </div>
        
        <div class="alumnos-header-actions flex-wrap">
          <button class="btn btn-outline-success btn-sm-compact" id="btnExportarCSV" title="Exportar CSV">
            <i class="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
          <button class="btn btn-outline-secondary btn-sm-compact" id="btnReporteMes" title="Inscritos por mes">
            <i class="bi bi-bar-chart"></i> Reporte
          </button>
          <button class="btn btn-outline-danger btn-sm-compact" id="btnPdfDemo" title="Vista previa PDFs">
            <i class="bi bi-file-earmark-pdf"></i> PDFs
          </button>
          <button class="btn btn-success btn-sm-compact" id="btnInscribir">
            <i class="bi bi-person-plus me-1"></i>Inscribir
          </button>
          <button class="btn btn-premium-action" id="btnAgregarAlumno">
            <i class="bi bi-plus-lg me-1"></i>Nuevo Alumno
          </button>
        </div>
      </div>

      <div class="alumnos-filter-toolbar mb-4 flex-wrap">
        <div class="premium-search-container flex-grow-1" style="min-width: 180px;">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar alumno..." id="buscar" autocomplete="off">
        </div>

        <!-- Dropdown de Filtros Múltiples -->
        <div class="dropdown">
          <button class="btn btn-outline-secondary btn-sm-compact d-flex align-items-center gap-2 dropdown-toggle position-relative" type="button" id="btnDropdownFiltros" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" style="min-height: 32px; border-radius: 8px;">
            <i class="bi bi-funnel"></i> <span>Filtros</span>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary d-none" id="filtrosBadgeCount" style="font-size: 0.65rem; padding: 0.25em 0.5em;">
              0
            </span>
          </button>
          <div class="dropdown-menu dropdown-menu-end p-3 shadow-lg border" aria-labelledby="btnDropdownFiltros" style="min-width: 270px; border-radius: 12px; background: var(--bs-body-bg); z-index: 1050;">
            <h6 class="dropdown-header px-0 mb-2 text-primary d-flex align-items-center gap-2" style="font-size: 0.85rem; font-weight: 700; background: transparent; border: none; color: var(--bs-primary) !important;">
              <i class="bi bi-sliders"></i> Segmentar Alumnos
            </h6>
            
            <!-- Filtro WhatsApp -->
            <div class="mb-2">
              <label class="form-label-compact mb-1" style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">WhatsApp</label>
              <div class="position-relative d-flex align-items-center w-100">
                <i class="bi bi-whatsapp select-icon-muted" style="left: 10px; font-size: 0.85rem;"></i>
                <select class="form-select premium-filter-select" id="filtroWhatsapp" style="padding-left: 28px !important;">
                  <option value="todos">Todos</option>
                  <option value="con_whatsapp">Con WhatsApp</option>
                  <option value="sin_whatsapp">Sin WhatsApp</option>
                </select>
              </div>
            </div>

            <!-- Filtro Completitud -->
            <div class="mb-2">
              <label class="form-label-compact mb-1" style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">Completitud Perfil</label>
              <div class="position-relative d-flex align-items-center w-100">
                <i class="bi bi-shield-check select-icon-muted" style="left: 10px; font-size: 0.85rem;"></i>
                <select class="form-select premium-filter-select" id="filtroCompletitud" style="padding-left: 28px !important;">
                  <option value="todos">Todos los rangos</option>
                  <option value="critico">Crítico (Rojo)</option>
                  <option value="parcial">Parcial (Amarillo)</option>
                  <option value="bueno">Bueno (Turquesa)</option>
                  <option value="completo">Completo (Sin badge)</option>
                </select>
              </div>
            </div>

            <!-- Filtro Instrumento -->
            <div class="mb-3">
              <label class="form-label-compact mb-1" style="font-size: 0.75rem; font-weight: 600; opacity: 0.85;">Instrumento</label>
              <div class="position-relative d-flex align-items-center w-100">
                <i class="bi bi-music-note select-icon-muted" style="left: 10px; font-size: 0.85rem;"></i>
                <select class="form-select premium-filter-select" id="filtroInstrumento" style="padding-left: 28px !important;">
                  <option value="todos">Todos</option>
                  <option value="con_instrumento">Con Instrumento</option>
                  <option value="sin_instrumento">Sin Instrumento</option>
                </select>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
              <button class="btn btn-link btn-sm text-decoration-none text-muted p-0" id="btnLimpiarFiltros" style="font-size: 0.75rem;">
                <i class="bi bi-trash3 me-0.5"></i> Limpiar
              </button>
              <span class="text-muted" id="filtrosActivosCount" style="font-size: 0.72rem; font-weight: 600; opacity: 0.8;">
                Filtros activos: 0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="alumnosTBody">
          ${Zr(A.alumnos)}
        </div>
        <div id="emptyContainer">
          ${A.alumnos.length===0?Qr():``}
        </div>
      </div>

    </div>
  `}function Zr(e){return e.length?e.map(e=>{let t=e.nombre||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`,{porcentaje:a,nivel:o}=zr(e),s=o!==`completo`,c=s?Br[o]:``;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${Wr(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${k(t)}</span>
            </div>
            <small class="text-muted text-truncate">
              ${k(e.instrumento||`Sin instrumento especificado`)} ${e.familiar_nombre?`• Rep: ${k(e.familiar_nombre)}`:``}
            </small>
          </div>
        </div>
        
        <!-- Acciones y Estados perfectamente alineados a la derecha -->
        <div class="d-flex align-items-center gap-3 flex-shrink-0">
          <!-- Columna Badge Completitud (52px de ancho fijo) -->
          <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 52px;">
            ${s?`
              <span class="badge badge-completitud badge-completitud-${c}" title="Perfil ${a}% completo — ${Vr[o]}">
                ${a}%
              </span>
            `:``}
          </div>
          
          <!-- Columna Botón Editar (36px de ancho fijo) -->
          <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 36px;">
            <button class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" data-action="edit" data-id="${e.id}" title="Editar alumno" style="height: 32px; width: 32px; min-height: 32px; padding: 0;">
              <i class="bi bi-pencil-square"></i>
            </button>
          </div>
          
          <!-- Columna Botón WhatsApp (36px de ancho fijo) -->
          <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 36px;">
            ${e.telefono?`
              <button class="btn btn-sm btn-success bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" data-action="whatsapp" data-id="${e.id}" title="Enviar WhatsApp" style="height: 32px; width: 32px; min-height: 32px; padding: 0;">
                <i class="bi bi-whatsapp"></i>
              </button>
            `:``}
          </div>
          
          <!-- Flecha de Navegación -->
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):``}function Qr(){return`
    <div class="text-center py-5 w-100 list-group-item text-muted" style="background: transparent; border: none;">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos</h4>
      <p class="text-muted mb-0">Crea tu primer alumno haciendo clic en el botón "Nuevo"</p>
    </div>
  `}function $r(e){Gr=e,e.querySelector(`#btnAgregarAlumno`)?.addEventListener(`click`,()=>ai()),e.querySelector(`#btnInscribir`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-inscribir`)),e.querySelector(`#btnReporteMes`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-reporte-mes`)),e.querySelector(`#btnPdfDemo`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-pdf-demo`)),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>ci()),e.querySelector(`#buscar`)?.addEventListener(`input`,ti),e.querySelector(`#filtroWhatsapp`)?.addEventListener(`change`,ti),e.querySelector(`#filtroCompletitud`)?.addEventListener(`change`,ti),e.querySelector(`#filtroInstrumento`)?.addEventListener(`change`,ti),e.querySelector(`#btnLimpiarFiltros`)?.addEventListener(`click`,t=>{t.stopPropagation();let n=e.querySelector(`#filtroWhatsapp`),r=e.querySelector(`#filtroCompletitud`),i=e.querySelector(`#filtroInstrumento`);n&&(n.value=`todos`),r&&(r.value=`todos`),i&&(i.value=`todos`),ti()}),e.querySelector(`#alumnosTBody`)?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){window.router?.navigate(`alumno`,{id:t.dataset.id});return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id;n.dataset.action===`edit`?window.router?.navigate(`alumno`,{id:r}):n.dataset.action===`delete`?oi(r):n.dataset.action===`whatsapp`&&ei(r)})}function ei(e){let t=A.alumnosOriginales.find(t=>t.id===e);!t||!t.telefono||b.open({title:`Enviar WhatsApp a `+k(t.nombre),size:`md`,saveText:`Enviar WhatsApp`,body:`
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> ${Ce(t.telefono)}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
      </p>
    `,onSave:async e=>{let n=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=oe(t.telefono,n);r&&window.open(r,`_blank`)}})}function ti(){let e=Gr.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=Gr.querySelector(`#filtroWhatsapp`)?.value||`todos`,n=Gr.querySelector(`#filtroCompletitud`)?.value||`todos`,r=Gr.querySelector(`#filtroInstrumento`)?.value||`todos`;A.alumnos=A.alumnosOriginales.filter(i=>{let a=!e||(i.nombre||``).toLowerCase().includes(e)||(i.instrumento||``).toLowerCase().includes(e)||(i.telefono||``).toLowerCase().includes(e)||(i.familiar_nombre||``).toLowerCase().includes(e),o=!!i.telefono&&i.telefono.trim()!==``,s=t===`todos`||t===`con_whatsapp`&&o||t===`sin_whatsapp`&&!o,{nivel:c}=zr(i),l=n===`todos`||n===c,u=!!i.instrumento&&i.instrumento.trim()!==``&&i.instrumento.toLowerCase()!==`sin instrumento especificado`;return a&&s&&l&&(r===`todos`||r===`con_instrumento`&&u||r===`sin_instrumento`&&!u)});let i=0;t!==`todos`&&i++,n!==`todos`&&i++,r!==`todos`&&i++;let a=Gr.querySelector(`#filtrosBadgeCount`);a&&(a.textContent=i,i>0?a.classList.remove(`d-none`):a.classList.add(`d-none`));let o=Gr.querySelector(`#filtrosActivosCount`);o&&(o.textContent=`Filtros activos: ${i}`),si()}function ni(e=``){return et.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}function ri(e=null){let t=e||{};return`<form class="row g-2">
    <div class="col-12">
      <label class="form-label-compact">Nombre Completo *</label>
      <input type="text" class="form-control input-dense" id="modal-nombre" maxlength="${Kr.nombreMax}" required placeholder="Juan Pérez" autocomplete="off" value="${k(t.nombre||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Teléfono (WhatsApp) *</label>
      <input type="tel" class="form-control input-dense" id="modal-telefono" required placeholder="+58 412 555 1234" autocomplete="off" value="${k(t.telefono||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Email</label>
      <input type="email" class="form-control input-dense" id="modal-email" maxlength="${Kr.emailMax}" placeholder="representante@ejemplo.com" autocomplete="off" value="${k(t.email||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Cédula del Alumno</label>
      <input type="text" class="form-control input-dense" id="modal-cedula" maxlength="${Kr.cedulaMax}" placeholder="12345678" autocomplete="off" value="${k(t.cedula||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Fecha de Nacimiento</label>
      <input type="date" class="form-control input-dense" id="modal-fechaNacimiento" value="${t.fecha_nacimiento||``}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Género</label>
      <select class="form-select input-dense" id="modal-genero">
        <option value="" ${t.genero?``:`selected`}>No especificado</option>
        <option value="M" ${t.genero===`M`?`selected`:``}>Masculino</option>
        <option value="F" ${t.genero===`F`?`selected`:``}>Femenino</option>
        <option value="O" ${t.genero===`O`?`selected`:``}>Otro</option>
        <option value="N" ${t.genero===`N`?`selected`:``}>No binario</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Instrumento *</label>
      <input type="text" class="form-control input-dense" id="modal-instrumento" required maxlength="${Kr.sectionMax}" placeholder="Violín, Piano..." autocomplete="off" value="${k(t.instrumento||``)}">
    </div>
    <div class="col-12">
      <label class="form-label-compact">Dirección</label>
      <input type="text" class="form-control input-dense" id="modal-direccion" maxlength="${Kr.direccionMax}" placeholder="Dirección completa" autocomplete="off" value="${k(t.direccion||``)}">
    </div>
    
    <div class="col-12 mt-3">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-contacto-emergencia-nombre" placeholder="Nombre contacto" value="${k(t.contacto_emergencia_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-contacto-emergencia-telefono" placeholder="+58 412 555 1234" value="${k(t.contacto_emergencia_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-contacto-emergencia-parentesco">
              ${ni(t.contacto_emergencia_parentesco)}
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-people me-1"></i>Datos del Familiar</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-familiar-nombre" placeholder="Nombre familiar" value="${k(t.familiar_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-familiar-telefono-input" placeholder="+58 412 555 1234" value="${k(t.familiar_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-familiar-parentesco-input">
              ${ni(t.familiar_parentesco)}
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="border rounded p-2 bg-warning bg-opacity-10">
        <h6 class="mb-2"><i class="bi bi-heart-pulse me-1"></i>Información Médica</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Condiciones médicas</label>
            <textarea class="form-control input-dense" id="modal-condiciones-medicas" rows="2" placeholder="Diabetes, epilepsia, etc.">${k(t.condiciones_medicas||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Alergias</label>
            <textarea class="form-control input-dense" id="modal-alergias" rows="2" placeholder="Alimentos, medicamentos, etc.">${k(t.alergias||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Medicamentos</label>
            <textarea class="form-control input-dense" id="modal-medicamentos" rows="2" placeholder="Medicamentos actuales">${k(t.medicamentos||``)}</textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="modal-esActivo" ${t.is_active===!1?``:`checked`}>
        <label class="form-check-label" for="modal-esActivo">Alumno activo</label>
      </div>
    </div>
  </form>`}async function ii(e,t=null){let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-telefono`).value.trim(),a=e.querySelector(`#modal-cedula`).value.trim(),o=e.querySelector(`#modal-fechaNacimiento`).value,s=e.querySelector(`#modal-genero`).value,c=e.querySelector(`#modal-instrumento`).value.trim(),l=e.querySelector(`#modal-familiar-nombre`).value.trim(),u=e.querySelector(`#modal-familiar-telefono-input`).value.trim()||i,d=e.querySelector(`#modal-familiar-parentesco-input`).value,f=e.querySelector(`#modal-esActivo`).checked;return n?c?i?{nombre:n,email:r||null,telefono:Ee(i)||i,cedula:a||null,fecha_nacimiento:o||null,genero:s||null,instrumento:c,is_active:f,familiar_nombre:l||null,familiar_telefono:Ee(u)||u||null,familiar_parentesco:d||null,contacto_emergencia_nombre:e.querySelector(`#modal-contacto-emergencia-nombre`).value.trim()||null,contacto_emergencia_telefono:Ee(e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim())||e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim()||null,contacto_emergencia_parentesco:e.querySelector(`#modal-contacto-emergencia-parentesco`).value||null,condiciones_medicas:e.querySelector(`#modal-condiciones-medicas`).value.trim()||null,alergias:e.querySelector(`#modal-alergias`).value.trim()||null,medicamentos:e.querySelector(`#modal-medicamentos`).value.trim()||null}:(v.error(`El teléfono es obligatorio para WhatsApp`),null):(v.error(`El instrumento es obligatorio`),null):(v.error(`El nombre es obligatorio`),null)}function ai(){A.editando=null,b.open({title:`Crear Nuevo Alumno`,size:`lg`,body:ri(),saveText:`Guardar`,onSave:async e=>{let t=await ii(e);if(!t)return!1;let n=await Qe(t);A.alumnosOriginales.push(n),ti(),v.success(`Alumno creado exitosamente`)}})}function oi(e){let t=A.alumnosOriginales.find(t=>t.id===e);if(!t){v.error(`Alumno no encontrado`);return}A.deletingId=e,b.open({title:`⚠️ Eliminar Alumno`,size:`md`,saveText:`Eliminar`,body:`<div class="d-flex flex-column align-items-center justify-content-center py-5">
             <div class="spinner-border text-primary mb-3" role="status">
               <span class="visually-hidden">Cargando...</span>
             </div>
             <p class="text-muted mb-0">Analizando estado de inscripciones...</p>
           </div>`,onSave:async()=>{await Je(e),A.alumnosOriginales=A.alumnosOriginales.filter(t=>t.id!==e),ti(),b.close(),v.success(`Alumno eliminado correctamente`)}});let n=document.querySelector(`#app-global-modal .app-modal-btn-save`);n&&(n.style.display=`none`),setTimeout(async()=>{try{if(A.deletingId!==e)return;let r=await Ye(e),i=document.querySelector(`#app-global-modal .app-modal-body`);if(!i||A.deletingId!==e)return;n&&(n.style.display=``),r.length===0?i.innerHTML=`
          <div class="alert alert-success d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-4" style="background: rgba(40, 167, 69, 0.08); color: #155724;">
            <i class="bi bi-person-check-fill fs-3 text-success mt-1"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1" style="color: #0f6826;">Contacto Huérfano / Eliminación Segura</h6>
              <p class="mb-0 small" style="opacity: 0.9;">Este alumno no posee matrículas registradas ni está inscrito en ninguna clase activa en el período actual. Su eliminación no afectará datos académicos.</p>
            </div>
          </div>
          <p class="mb-2">¿Estás seguro de que querés eliminar permanentemente al alumno <strong>${k(t.nombre)}</strong>?</p>
          <p class="text-muted small mb-0"><i class="bi bi-info-circle me-1"></i> Esta acción es irreversible y limpiará todo su registro de contacto del sistema.</p>
        `:i.innerHTML=`
          <div class="alert alert-danger d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-4" style="background: rgba(220, 53, 69, 0.08); color: #721c24;">
            <i class="bi bi-exclamation-triangle-fill fs-3 text-danger mt-1"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1" style="color: #af232f;">¡Alumno con Clases Activas!</h6>
              <p class="mb-2 small" style="opacity: 0.9;">Este alumno está matriculado e inscrito en las siguientes clases del período actual:</p>
              <ul class="list-unstyled mb-2 ps-0" style="max-height: 150px; overflow-y: auto;">
                ${r.map(e=>`
          <li class="d-flex align-items-center gap-2 py-2 border-bottom border-light">
            <i class="bi bi-journal-bookmark-fill text-danger fs-5"></i>
            <span class="fw-semibold text-dark" style="font-size: 0.9rem;">${k(e.clase_nombre)}</span>
          </li>
        `).join(``)}
              </ul>
              <p class="mb-0 small fw-bold mt-2"><i class="bi bi-slash-circle-fill me-1"></i> ADVERTENCIA CRÍTICA: Eliminar a este alumno borrará físicamente su registro de asistencia, calificaciones históricas y matrículas activas.</p>
            </div>
          </div>
          <p class="mb-2">¿Realmente querés eliminar permanentemente al alumno <strong>${k(t.nombre)}</strong> y todos sus registros?</p>
          <p class="text-muted small mb-0"><i class="bi bi-exclamation-octagon-fill text-danger me-1"></i> Esta acción no se puede deshacer y puede provocar inconsistencias en los reportes de estas clases.</p>
        `}catch(r){if(console.error(r),A.deletingId!==e)return;let i=document.querySelector(`#app-global-modal .app-modal-body`);i&&(n&&(n.style.display=``),i.innerHTML=`
          <div class="alert alert-warning d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-3">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
            <div>
              <h6 class="alert-heading fw-bold mb-1">Error de Verificación</h6>
              <p class="mb-0 small">No se pudo comprobar si el alumno tiene clases activas. Procedé con precaución.</p>
            </div>
          </div>
          <p>¿Querés eliminar al alumno <strong>${k(t.nombre)}</strong> de todas formas?</p>
        `)}},300)}function si(){let e=Gr.querySelector(`#alumnosTBody`);if(!e)return;A.alumnos.length===0?e.innerHTML=Qr():e.innerHTML=Zr(A.alumnos);let t=Gr.querySelector(`#emptyContainer`);t&&(t.innerHTML=A.alumnos.length===0?Qr():``);let n=Gr.querySelector(`.alumnos-header-premium p.text-muted`);n&&(n.textContent=`${A.alumnos.length} alumnos en total`)}function ci(){if(A.alumnosOriginales.length===0){v.error(`No hay alumnos para exportar`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Estado`,`Fecha Nac.`,`Sección`],...A.alumnosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.estado||`activo`,e.fecha_nacimiento||``,e.section||``])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`alumnos-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),v.success(`CSV exportado exitosamente`)}var li=[0,86,179],ui=[255,193,7],di=[30,30,30],fi=[``,`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`];function pi(e,t=`—`){return String(e??``).trim()||t}function mi(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,String(a)}catch{return`—`}}function hi(e){return{cantar:`Cantar`,instrumento:`Instrumento`,ambas:`Ambas`}[e]??pi(e)}function gi(e,t,n){let r=e.internal.pageSize.getWidth();e.setFillColor(...li),e.rect(0,0,r,26,`F`),e.setFillColor(...ui),e.rect(0,26,r,2,`F`),e.setTextColor(255,255,255),e.setFontSize(14),e.setFont(`helvetica`,`bold`),e.text(`El Sistema Punta Cana`,14,10),e.setFontSize(10),e.setFont(`helvetica`,`normal`),e.text(t,14,18),e.setFontSize(7.5),e.text(n,14,24),e.setTextColor(...di)}function _i(e,t,n){let r=e.internal.pageSize.getWidth(),i=e.internal.pageSize.getHeight();e.setFillColor(...li),e.rect(0,i-8,r,8,`F`),e.setTextColor(255,255,255),e.setFontSize(6.5);let a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});e.text(`El Sistema Punta Cana — Generado: ${a}`,10,i-3),e.text(`Página ${t} de ${n}`,r-10,i-3,{align:`right`})}function vi(e,t,n){let r=new nt({orientation:`landscape`,unit:`mm`,format:`letter`});r.internal.pageSize.getWidth();let i=`${fi[n]} ${t}`,a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});gi(r,`REPORTE DE INSCRIPCIONES — ${i.toUpperCase()}`,`Generado: ${a} · Total inscritos: ${e.length}`);let o=e.filter(e=>e.tiene_conocimientos_musicales===!0).length,s=e.filter(e=>e.tiene_conocimientos_musicales===!1||e.requiere_iniciacion_musical).length,c=e.filter(e=>e.beneficiario_subsidio_estado===!0).length,l=e.filter(e=>e.familia_monoparental===!0).length,u=e.filter(e=>e.autoriza_fotos_redes===!0).length;rt(r,{startY:36,margin:{left:10,right:10},theme:`grid`,head:[[`Total inscritos`,`Con conocimientos`,`Requieren iniciación`,`Beneficiarios subsidio`,`Fam. monoparental`,`Autorizan fotos`]],body:[[e.length,o,s,c,l,u]],headStyles:{fillColor:li,textColor:255,fontStyle:`bold`,fontSize:8,halign:`center`},bodyStyles:{halign:`center`,fontSize:11,fontStyle:`bold`}}),rt(r,{startY:r.lastAutoTable.finalY+6,margin:{left:10,right:10},theme:`striped`,head:[[`#`,`Nombre completo`,`Edad`,`Nac.`,`Municipio`,`Representante / Tlf`,`Interés`,`Instrumento`,`Iniciación`,`Pagó 600`]],body:e.map((e,t)=>[t+1,pi(e.nombre_completo),mi(e.fecha_nacimiento),pi(e.nacionalidad),pi(e.municipio_residencia),pi(e.representante_nombre)+`
`+pi(e.representante_tlf),hi(e.interes_musical),pi(e.instrumento_interes),e.requiere_iniciacion_musical?`Sí`:`No`,e.acepta_pago_600?`Sí`:`No`]),headStyles:{fillColor:li,textColor:255,fontStyle:`bold`,fontSize:7.5},bodyStyles:{fontSize:7,cellPadding:1.5},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:7,halign:`center`},1:{cellWidth:42},2:{cellWidth:10,halign:`center`},3:{cellWidth:14},4:{cellWidth:20},5:{cellWidth:42},6:{cellWidth:16},7:{cellWidth:22},8:{cellWidth:15,halign:`center`},9:{cellWidth:14,halign:`center`}},didDrawPage:e=>{let t=r.internal.getNumberOfPages();_i(r,e.pageNumber,t)}}),e.length>0&&(r.addPage(),gi(r,`PERFIL SOCIOCULTURAL — ${i.toUpperCase()}`,`Información motivacional y social de los alumnos inscritos`),rt(r,{startY:36,margin:{left:10,right:10},theme:`striped`,head:[[`#`,`Nombre`,`Colegio`,`Grado`,`Padres en vida`,`Monopar.`,`Subsidio`,`¿Por qué se unió?`,`Músico favorito`]],body:e.map((e,t)=>[t+1,pi(e.nombre_completo),pi(e.centro_estudios),pi(e.grado_nivel),e.padres_en_vida===`ambos`?`Ambos`:e.padres_en_vida===`solo_madre`?`Solo madre`:e.padres_en_vida===`solo_padre`?`Solo padre`:e.padres_en_vida===`ninguno`?`Ninguno`:`—`,e.familia_monoparental?`Sí`:`No`,e.beneficiario_subsidio_estado?`Sí`:`No`,pi(e.por_que_unirse).slice(0,80)+(pi(e.por_que_unirse).length>80?`…`:``),pi(e.musico_favorito)]),headStyles:{fillColor:li,textColor:255,fontStyle:`bold`,fontSize:7.5},bodyStyles:{fontSize:7,cellPadding:1.5},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:7,halign:`center`},1:{cellWidth:38},2:{cellWidth:38},3:{cellWidth:16},4:{cellWidth:20},5:{cellWidth:14,halign:`center`},6:{cellWidth:14,halign:`center`},7:{cellWidth:55},8:{cellWidth:28}},didDrawPage:e=>{let t=r.internal.getNumberOfPages();_i(r,e.pageNumber,t)}}));let d=r.internal.getNumberOfPages();for(let e=1;e<=d;e++)r.setPage(e),_i(r,e,d);return r}function yi(e,t,n){vi(e,t,n).save(`reporte-inscripciones-${[``,`enero`,`febrero`,`marzo`,`abril`,`mayo`,`junio`,`julio`,`agosto`,`septiembre`,`octubre`,`noviembre`,`diciembre`][n]}-${t}.pdf`)}function bi(e){return et.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}function xi(e){let t=e||{};return`<form class="row g-3">
    <div class="col-12">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person me-1 text-primary"></i>Datos del Alumno</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre completo</label>
      <input type="text" class="form-control form-control-sm" id="ed-nombre" value="${t.nombre_completo||``}" readonly>
    </div>
    <div class="col-md-3">
      <label class="form-label small fw-semibold">Fecha de nacimiento</label>
      <input type="date" class="form-control form-control-sm" id="ed-fecha-nacimiento" value="${t.fecha_nacimiento||``}">
    </div>
    <div class="col-md-2">
      <label class="form-label small fw-semibold">Nacionalidad</label>
      <select class="form-select form-select-sm" id="ed-nacionalidad">
        <option value="">Seleccionar...</option>
        <option value="dominicana" ${t.nacionalidad===`dominicana`?`selected`:``}>Dominicana</option>
        <option value="extranjero" ${t.nacionalidad===`extranjero`?`selected`:``}>Extranjero</option>
      </select>
    </div>
    <div class="col-md-3">
      <label class="form-label small fw-semibold">Municipio de residencia</label>
      <input type="text" class="form-control form-control-sm" id="ed-municipio" value="${t.municipio_residencia||``}">
    </div>
    <div class="col-12">
      <label class="form-label small fw-semibold">Dirección / Sector + Calle + Número</label>
      <input type="text" class="form-control form-control-sm" id="ed-direccion" value="${t.sector_calle_numero||``}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person-fill me-1 text-info"></i>Datos de la Madre</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre completo</label>
      <input type="text" class="form-control form-control-sm" id="ed-madre-nombre" value="${t.madre_nombre||``}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Cédula</label>
      <input type="text" class="form-control form-control-sm" id="ed-madre-cedula" value="${t.madre_cedula||``}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Teléfono WhatsApp</label>
      <input type="tel" class="form-control form-control-sm" id="ed-madre-tlf" value="${t.madre_tlf_whatsapp||``}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person-fill me-1 text-info"></i>Datos del Padre</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre completo</label>
      <input type="text" class="form-control form-control-sm" id="ed-padre-nombre" value="${t.padre_nombre||``}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Cédula</label>
      <input type="text" class="form-control form-control-sm" id="ed-padre-cedula" value="${t.padre_cedula||``}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Teléfono WhatsApp</label>
      <input type="tel" class="form-control form-control-sm" id="ed-padre-tlf" value="${t.padre_tlf_whatsapp||``}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person-badge me-1 text-primary"></i>Representante</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre</label>
      <input type="text" class="form-control form-control-sm" id="ed-rep-nombre" value="${t.representante_nombre||``}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Parentesco</label>
      <select class="form-select form-select-sm" id="ed-rep-parentesco">
        ${bi(t.representante_parentesco)}
      </select>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Teléfono</label>
      <input type="tel" class="form-control form-control-sm" id="ed-rep-tlf" value="${t.representante_tlf||``}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-music-note-beamed me-1 text-success"></i>Perfil Musical</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Interés musical</label>
      <select class="form-select form-select-sm" id="ed-interes">
        <option value="">Seleccionar...</option>
        <option value="cantar" ${t.interes_musical===`cantar`?`selected`:``}>Cantar</option>
        <option value="instrumento" ${t.interes_musical===`instrumento`?`selected`:``}>Instrumento</option>
        <option value="ambas" ${t.interes_musical===`ambas`?`selected`:``}>Ambas</option>
      </select>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Instrumento de interés</label>
      <input type="text" class="form-control form-control-sm" id="ed-instrumento" value="${t.instrumento_interes||``}">
    </div>
    <div class="col-md-4">
      <label class="form-check form-switch pt-4">
        <input class="form-check-input" type="checkbox" id="ed-conocimientos" ${t.tiene_conocimientos_musicales?`checked`:``}>
        <span class="form-check-label small">Tiene conocimientos musicales</span>
      </label>
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-mortarboard me-1 text-secondary"></i>Datos Escolares</h6>
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">Centro de estudios</label>
      <input type="text" class="form-control form-control-sm" id="ed-centro-estudios" value="${t.centro_estudios||``}">
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">Grado / Nivel</label>
      <input type="text" class="form-control form-control-sm" id="ed-grado" value="${t.grado_nivel||``}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-check-circle me-1 text-warning"></i>Compromisos</h6>
    </div>
    <div class="col-md-4">
      <label class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="ed-pago-600" ${t.acepta_pago_600?`checked`:``}>
        <span class="form-check-label small">Acepta aporte RD$600</span>
      </label>
    </div>
    <div class="col-md-4">
      <label class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="ed-fotos-redes" ${t.autoriza_fotos_redes?`checked`:``}>
        <span class="form-check-label small">Autoriza fotos / redes</span>
      </label>
    </div>
    <div class="col-md-4">
      <label class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="ed-beca-4500" ${t.acepta_beca_4500?`checked`:``}>
        <span class="form-check-label small">Acepta beca RD$4,500</span>
      </label>
    </div>
  </form>`}function Si(){let e=e=>document.getElementById(e),t=t=>e(t)?.value?.trim()||null,n=t=>e(t)?.checked??!1,r=e=>e!==null&&e!==``?e:null;return{fecha_nacimiento:t(`ed-fecha-nacimiento`),nacionalidad:t(`ed-nacionalidad`),municipio_residencia:t(`ed-municipio`),sector_calle_numero:t(`ed-direccion`),madre_nombre:t(`ed-madre-nombre`),madre_cedula:t(`ed-madre-cedula`),madre_tlf_whatsapp:r(t(`ed-madre-tlf`)),padre_nombre:t(`ed-padre-nombre`),padre_cedula:t(`ed-padre-cedula`),padre_tlf_whatsapp:r(t(`ed-padre-tlf`)),representante_nombre:t(`ed-rep-nombre`),representante_parentesco:t(`ed-rep-parentesco`),representante_tlf:r(t(`ed-rep-tlf`)),interes_musical:t(`ed-interes`),instrumento_interes:t(`ed-instrumento`),tiene_conocimientos_musicales:n(`ed-conocimientos`),centro_estudios:t(`ed-centro-estudios`),grado_nivel:t(`ed-grado`),acepta_pago_600:n(`ed-pago-600`),autoriza_fotos_redes:n(`ed-fotos-redes`),acepta_beca_4500:n(`ed-beca-4500`)}}async function Ci(e,{onSaved:t}={}){let n;try{n=await Ze(e)}catch{v.error(`Error al cargar datos del alumno`);return}b.open({title:`Editar: ${n.nombre_completo||`Alumno`}`,size:`xl`,saveText:`Guardar cambios`,body:xi(n),onSave:async()=>{try{await Xe(e,Si()),v.success(`Alumno actualizado correctamente`),t&&t()}catch(e){return v.error(e.message||`Error al guardar los cambios`),!1}}})}var wi=[``,`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],Ti=[{key:`fecha_nacimiento`,label:`Fecha de nacimiento`},{key:`nacionalidad`,label:`Nacionalidad`},{key:`municipio_residencia`,label:`Municipio de residencia`},{key:`sector_calle_numero`,label:`Dirección / Sector`},{key:`madre_nombre`,label:`Nombre de la madre`},{key:`madre_tlf_whatsapp`,label:`Teléfono de la madre`},{key:`representante_nombre`,label:`Nombre del representante`},{key:`representante_parentesco`,label:`Parentesco del representante`},{key:`representante_tlf`,label:`Teléfono del representante`},{key:`interes_musical`,label:`Interés musical`},{key:`instrumento_interes`,label:`Instrumento de interés`},{key:`centro_estudios`,label:`Centro de estudios`},{key:`acepta_pago_600`,label:`Acepta pago RD$600`},{key:`autoriza_fotos_redes`,label:`Autoriza fotos/redes`}];function Ei(){let e=new Date,t=``;for(let n=0;n<24;n++){let r=new Date(e.getFullYear(),e.getMonth()-n,1),i=r.getFullYear(),a=r.getMonth()+1;t+=`<option value="${i}-${a}" ${n===0?`selected`:``}>${wi[a]} ${i}</option>`}return t}function Di(e){if(!e)return null;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,a}catch{return null}}function Oi(e){return e==null?!1:typeof e==`boolean`?!0:typeof e==`string`?e.trim()!==``:!0}function ki(e){let t=Ti.filter(t=>!Oi(e[t.key])),n=Ti.length-t.length,r=Math.round(n/Ti.length*100),i;return i=r===100?`completa`:r>=70?`casi_completa`:`incompleta`,{completados:n,total:Ti.length,porcentaje:r,camposFaltantes:t,estado:i}}function Ai(e,t){({completa:{rgb:`var(--bs-success-rgb)`,color:`var(--bs-success)`},casi_completa:{rgb:`var(--bs-warning-rgb)`,color:`var(--bs-warning)`},incompleta:{rgb:`var(--bs-danger-rgb)`,color:`var(--bs-danger)`}})[e];let n=e===`completa`?`Completa`:`${t}% — ${e===`casi_completa`?`Faltan campos`:`Incompleta`}`;return`<span class="badge border px-2 py-1"
            style="background-color: rgba(var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}-rgb), 0.12); color: var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}); border-color: rgba(var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}-rgb), 0.3) !important;">
            <i class="bi ${e===`completa`?`bi-check-circle-fill`:e===`casi_completa`?`bi-exclamation-circle-fill`:`bi-x-circle-fill`} me-1"></i>${n}
          </span>`}function ji(e){if(!e.length)return``;let t=e.length,n=e.filter(e=>ki(e).estado===`completa`).length,r=e.filter(e=>ki(e).estado===`incompleta`).length;return`
    <div class="row g-3 mt-1 mb-2">
      <div class="col-6 col-md-3">
        <div class="card text-center border-primary h-100">
          <div class="card-body py-3">
            <div class="fs-2 fw-bold text-primary">${t}</div>
            <div class="small text-muted">Total inscritos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-success h-100">
          <div class="card-body py-3">
            <div class="fs-2 fw-bold text-success">${n}</div>
            <div class="small text-muted">Completas</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-warning h-100">
          <div class="card-body py-3">
            <div class="fs-2 fw-bold text-warning-emphasis">${e.filter(e=>ki(e).estado===`casi_completa`).length}</div>
            <div class="small text-muted">Casi completas</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center border-danger h-100">
          <div class="card-body py-3">
            <div class="fs-2 fw-bold text-danger">${r}</div>
            <div class="small text-muted">Incompletas</div>
          </div>
        </div>
      </div>
    </div>`}function Mi(e){if(!e.length)return`<div class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>No hay alumnos inscritos en este período.
            </div>`;let t=e.map((e,t)=>{let{porcentaje:n,camposFaltantes:r,estado:i,completados:a,total:o}=ki(e),s=e.representante_tlf||e.madre_tlf_whatsapp||`—`,c=Di(e.fecha_nacimiento),l=c===null?``:`${c} años`,u=r.length>0?`<div class="d-flex flex-wrap gap-1 mt-1">
             ${r.slice(0,4).map(e=>`<span class="badge reporte-theme-badge border px-1 py-0" style="font-size:.6rem;">${e.label}</span>`).join(``)}
             ${r.length>4?`<span class="badge reporte-theme-badge border px-1 py-0" style="font-size:.6rem">+${r.length-4}</span>`:``}
           </div>`:``;return`
      <div class="list-group-item list-group-item-action px-3 py-2" data-alumno-id="${e.id}" role="button">
        <div class="d-flex align-items-center gap-3">
          <div class="flex-shrink-0 text-center" style="width:28px">
            <span class="text-muted small">${t+1}</span>
          </div>
          <div class="flex-grow-1 min-width-0">
            <div class="fw-semibold text-truncate">${e.nombre_completo||`—`}</div>
            <div class="small text-muted">
              ${s===`—`?``:`<i class="bi bi-telephone me-1"></i>${s}`}
              ${l?`<span class="ms-2"><i class="bi bi-calendar3 me-1"></i>${l}</span>`:``}
            </div>
            ${u}
          </div>
          <div class="flex-shrink-0 text-end ms-2">
            ${Ai(i,n)}
            <div class="small text-muted mt-1">${a}/${o}</div>
          </div>
          <div class="flex-shrink-0 text-muted">
            <i class="bi bi-arrow-up-right-square"></i>
          </div>
        </div>
      </div>`}).join(``);return`
    <div class="card shadow-sm mt-3">
      <div class="card-header bg-white py-2 d-flex justify-content-between align-items-center">
        <span class="fw-semibold small text-muted">ALUMNOS INSCRITOS</span>
        <span class="badge reporte-theme-badge rounded-pill">${e.length}</span>
      </div>
      <div class="list-group list-group-flush" id="lista-inscritos">
        ${t}
      </div>
    </div>`}function Ni(e){e.addEventListener(`click`,e=>{let t=e.target.closest(`[data-alumno-id]`);if(!t)return;let n=t.dataset.alumnoId;if(!n)return;let r=t.closest(`#reporte-resultado`)?.querySelector(`#btn-filtrar`);Ci(n,{onSaved:()=>r?.click()})})}async function Pi(e){let t=new Date,n=t.getFullYear(),r=t.getMonth()+1,i=[];async function a(t,n){let r=e.querySelector(`#reporte-resultado`);r&&(r.innerHTML=`
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Cargando inscritos de ${wi[n]} ${t}...</p>
      </div>`);try{i=await qe(t,n),r&&(r.innerHTML=ji(i)+Mi(i),Ni(r));let a=e.querySelector(`#btn-descargar-pdf`);a&&(a.disabled=i.length===0,a.textContent=i.length>0?`Descargar PDF (${i.length} alumnos)`:`Sin inscritos`)}catch(e){console.error(e),r&&(r.innerHTML=`
        <div class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar los datos. Por favor intenta de nuevo.
        </div>`)}}e.innerHTML=`
    <div class="container-fluid py-3">
      <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 class="mb-0"><i class="bi bi-file-earmark-bar-graph me-2 text-primary"></i>Reporte de Inscripciones</h4>
          <p class="text-muted small mb-0">Alumnos inscritos por mes — El Sistema Punta Cana</p>
        </div>
        <button id="btn-descargar-pdf" class="btn btn-primary" disabled>
          <i class="bi bi-file-earmark-pdf me-2"></i>Descargar PDF
        </button>
      </div>

      <div class="card shadow-sm">
        <div class="card-body pb-2">
          <div class="row align-items-end g-2">
            <div class="col-auto">
              <label class="form-label mb-1 small fw-semibold">Período</label>
              <select id="select-mes" class="form-select form-select-sm" style="min-width:180px">
                ${Ei()}
              </select>
            </div>
            <div class="col-auto">
              <button id="btn-filtrar" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-search me-1"></i>Consultar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="reporte-resultado"></div>
    </div>`,e.querySelector(`#btn-filtrar`)?.addEventListener(`click`,()=>{let[t,i]=(e.querySelector(`#select-mes`)?.value??``).split(`-`).map(Number);t&&i&&(n=t,r=i,a(t,i))}),e.querySelector(`#btn-descargar-pdf`)?.addEventListener(`click`,()=>{try{yi(i,n,r)}catch(e){console.error(`Error generando PDF:`,e),alert(`Error al generar el PDF. Por favor intenta de nuevo.`)}}),a(n,r)}function Fi(e){return{currentStep:1,totalSteps:e,maxReachedStep:e,draft:{},errors:{},submitted:!1}}function Ii(e,t,n){if(e.currentStep>=e.totalSteps)return e;let r={...e.draft,...t};if(n){let{valid:t,errors:i}=n(r);if(!t)return{...e,draft:r,errors:i||{}}}let i=e.currentStep+1;return{...e,draft:r,errors:{},currentStep:i,maxReachedStep:Math.max(e.maxReachedStep,i)}}function Li(e){return e.currentStep<=1?{...e,errors:{}}:{...e,currentStep:e.currentStep-1,errors:{}}}function Ri(e,t){return t<1||t>e.maxReachedStep?e:{...e,currentStep:t,errors:{}}}function zi(e){return{...e,submitted:!0}}var Bi=`wizard-inscripcion-draft`;function Vi(e){localStorage.setItem(Bi,JSON.stringify(e))}function Hi(){let e=localStorage.getItem(Bi);if(e===null)return null;try{return JSON.parse(e)}catch{return null}}function Ui(){localStorage.removeItem(Bi)}function Wi({currentStep:e,totalSteps:t}){let n=Math.round(e/t*100);return`
    <div class="progress mb-3" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del formulario">
      <div class="progress-bar" style="width: ${n}%">${n}%</div>
    </div>`}function Gi({steps:e,currentStep:t,maxReachedStep:n}){return`<ul class="nav nav-pills nav-fill mb-3 flex-wrap">${e.map((e,r)=>{let i=r+1,a=i===t,o=i<=n,s=a?`active`:``,c=o?``:`disabled aria-disabled="true"`;return`
        <li class="nav-item" role="presentation">
          <button
            class="nav-link ${s}"
            type="button"
            ${`data-step="${i}"`}
            ${c}
            aria-label="Paso ${i}: ${e.title}"
          >
            <span class="d-none d-md-inline">${i}. ${e.title}</span>
            <span class="d-md-none">${i}</span>
          </button>
        </li>`}).join(``)}</ul>`}var Ki=`system_config`;async function qi(e){let{data:t,error:n}=await _.from(Ki).select(`value`).eq(`key`,e).single();return n?(console.warn(`Config not found:`,e),null):t?.value}async function Ji(e,t){let{error:n}=await _.from(Ki).upsert({key:e,value:t,updated_at:new Date().toISOString()},{onConflict:`key`});if(n)throw console.error(`Error saving config:`,n),n;return{key:e,value:t}}async function Yi(){return qi(`groq_api_key`)}async function Xi(e){return Ji(`groq_api_key`,e)}async function Zi(){return qi(`openrouter_api_key`)}async function Qi(e){return Ji(`openrouter_api_key`,e)}async function $i(){return qi(`preferred_ai_model`)}async function ea(e){return Ji(`preferred_ai_model`,e)}var ta={URL_REGLAMENTO:`url_reglamento`,URL_HORARIO:`url_horario`,URL_BIENVENIDA:`url_bienvenida`};async function na(){let[e,t,n]=await Promise.all([qi(ta.URL_REGLAMENTO),qi(ta.URL_HORARIO),qi(ta.URL_BIENVENIDA)]);return{reglamento:e,horario:t,bienvenida:n}}async function ra({reglamento:e,horario:t,bienvenida:n}){let r=[];e!==void 0&&r.push(Ji(ta.URL_REGLAMENTO,e)),t!==void 0&&r.push(Ji(ta.URL_HORARIO,t)),n!==void 0&&r.push(Ji(ta.URL_BIENVENIDA,n)),await Promise.all(r)}var j={azul:[20,60,130],azulMedio:[40,90,170],azulClaro:[220,232,250],dorado:[198,160,20],doradoClaro:[255,245,200],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],rojo:[180,20,20],verde:[20,120,60]},ia={id:`demo-0001-uuid`,nombre_completo:`María Gabriela Rodríguez Pérez`,fecha_nacimiento:`2013-06-15`,genero:`F`,nacionalidad:`Dominicana`,tiene_pasaporte:!1,sabe_leer:!0,sabe_escribir:!0,tlf_alumno:`8091234567`,como_se_entero:`Redes sociales`,municipio_residencia:`bavaro`,sector_calle_numero:`Bávaro, Calle Los Corales #12`,direccion:`Sector Los Corales, Bávaro, La Altagracia`,ubicacion_maps_url:`https://maps.google.com`,madre_nombre:`Carmen Pérez de Rodríguez`,madre_cedula:`001-1234567-8`,madre_tlf_whatsapp:`8097654321`,padre_nombre:`José Rafael Rodríguez`,padre_cedula:`001-9876543-2`,padre_tlf_whatsapp:`8299876543`,representante_nombre:`Carmen Pérez de Rodríguez`,representante_parentesco:`Madre`,representante_cedula:`001-1234567-8`,representante_tlf:`8097654321`,correo_representante:`carmen.perez@email.com`,otro_responsable_nombre:`José Rafael Rodríguez`,otro_responsable_cedula:`001-9876543-2`,otro_responsable_tlf:`8299876543`,contacto_emergencia_nombre:`Luisa Martínez`,contacto_emergencia_telefono:`8091112222`,beneficiario_subsidio_estado:!1,subsidio_descripcion:null,apoyo_actividades:`Disponible para apoyo en actividades los fines de semana`,instrumento_principal:`Violín`,nivel_actual:`Iniciación`,tiene_conocimientos_musicales:!1,instrumento_previo:null,nivel_lectura_musical:`Ninguno`,interes_musical:`instrumento`,instrumento_interes:`Violín`,sentimiento_musica_clasica:`Me emociona mucho y me parece muy bonita`,sentimiento_aprender_instrumento:`Estoy muy emocionada y quiero aprender rápido`,aspiracion_instrumento:`Llegar a tocar en una orquesta`,musico_favorito:`Beethoven`,preferencia_aprendizaje_musical:`Visual y auditiva`,por_que_unirse:`Siempre soñé con tocar un instrumento y El Sistema me da esa oportunidad`,alergias_descripcion:null,condicion_transmisible_desc:null,alergia_medicamento_desc:null,problemas_conducta:`no`,tiene_alergias:!1,tiene_condicion_transmisible:!1,tiene_alergia_medicamento:!1,centro_estudios:`Colegio San Juan Bosco`,grado_nivel:`5to de Primaria`,padres_en_vida:`ambos`,autoriza_fotos_redes:!0,acepta_beca_4500:!0,acepta_pago_600:!0,fecha_aceptacion_compromisos:new Date().toISOString(),requiere_iniciacion_musical:!0,familia_monoparental:!1};function M(e,t=`—`){return String(e??``).trim()||t}function aa(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function oa(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,`${a} años`}catch{return`—`}}function N(e){return e===!0||e===`true`||e===`t`?`Sí`:e===!1||e===`false`||e===`f`?`No`:`—`}function sa(e){return{punta_cana:`Punta Cana`,bavaro:`Bávaro`,veron:`Verón`,friusa:`Friusa`,el_cortecito:`El Cortecito`,los_corales:`Los Corales`,otro:`Otro`}[e]??M(e)}function ca(e){return{cantar:`Cantar`,instrumento:`Instrumento`,ambas:`Ambas`}[e]??M(e)}function la(e){return{ambos:`Ambos`,solo_madre:`Solo madre`,solo_padre:`Solo padre`,ninguno:`Ninguno`}[e]??M(e)}function ua(e){return{no:`Sin problemas`,pocas_veces:`Pocas veces`,si:`Sí presenta`,violento:`Conducta violenta`}[e]??M(e)}function da(e){return`SOI-PC-${new Date().getFullYear()}-${e.id?e.id.replace(/-/g,``).slice(-8).toUpperCase():Date.now().toString(36).toUpperCase().slice(-8)}`}function fa(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}var P=215.9,pa=279.4,F=14;function ma(e,t,n=``){return e.setFillColor(...j.azul),e.rect(0,0,P,32,`F`),e.setFillColor(...j.dorado),e.rect(0,32,P,2.5,`F`),e.setFillColor(...j.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...j.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,F+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,F+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...j.dorado),e.text(t,P-F,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,P-F,20,{align:`right`})),e.setTextColor(...j.grisOscuro),38}function ha(e,t=1){e.setFillColor(...j.azul),e.rect(0,pa-12,P,12,`F`),e.setFillColor(...j.dorado),e.rect(0,pa-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...j.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,F+2,pa-4.5),e.text(`Pág. ${t}`,P-F,pa-4.5,{align:`right`})}function ga(e,t,n,r=j.azul){return e.setFillColor(...r),e.rect(F,n,P-F*2,6.5,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...j.blanco),e.text(t,F+3,n+4.4),e.setTextColor(...j.grisOscuro),n+7.5}function _a(e,t,n,r={}){return rt(e,{startY:n,margin:{left:F,right:F},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:j.grisOscuro,font:`helvetica`},alternateRowStyles:{fillColor:j.grisClaro},columnStyles:{0:{fontStyle:`bold`,cellWidth:r.labelW??42,fillColor:j.azulClaro,textColor:j.azul},2:{fontStyle:`bold`,cellWidth:r.labelW??42,fillColor:j.azulClaro,textColor:j.azul}},body:t,...r.extra}),e.lastAutoTable.finalY+2.5}function va(e,t,n,r={}){return rt(e,{startY:n,margin:{left:F,right:F},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:j.grisOscuro},columnStyles:{0:{fontStyle:`bold`,cellWidth:r.labelW??52,fillColor:j.azulClaro,textColor:j.azul}},body:t,...r.extra}),e.lastAutoTable.finalY+2.5}function ya(e,t,n,r){return ha(e,r-1),e.addPage(),ma(e,t,`Continuación · ${n}`)}function ba(e,t,n,r,i,a){return t+n>pa-22?(a.n++,ya(e,r,i,a.n)):t}function xa(e){let t=new nt({unit:`mm`,format:`letter`}),n={n:1},r=`FICHA TÉCNICA DEL ALUMNO`,i=ma(t,r,`Generado: ${fa()}`);t.setFont(`helvetica`,`bold`),t.setFontSize(55),t.setTextColor(235,240,252),t.text(`USO INTERNO`,P/2,pa/2,{align:`center`,angle:45}),t.setTextColor(...j.grisOscuro),t.setFillColor(...j.azulClaro),t.roundedRect(F,i,P-F*2,18,2,2,`F`),t.setFont(`helvetica`,`bold`),t.setFontSize(13),t.setTextColor(...j.azul),t.text(M(e.nombre_completo),F+4,i+7),t.setFont(`helvetica`,`normal`),t.setFontSize(8.5),t.setTextColor(...j.grisMedio);let a=[`Edad: ${oa(e.fecha_nacimiento)}`,`F. Nac.: ${aa(e.fecha_nacimiento)}`,`Instrumento: ${M(e.instrumento_principal)}`,`Nivel: ${M(e.nivel_actual)}`].join(`    ·    `);t.text(a,F+4,i+13),t.setTextColor(...j.grisOscuro),i+=22,i=ga(t,`1 · DATOS PERSONALES`,i),i=_a(t,[[`Nombre completo`,M(e.nombre_completo),`Fecha de nacimiento`,aa(e.fecha_nacimiento)],[`Edad`,oa(e.fecha_nacimiento),`Nacionalidad`,M(e.nacionalidad)],[`Género`,M(e.genero),`Tiene pasaporte`,N(e.tiene_pasaporte)],[`Sabe leer`,N(e.sabe_leer),`Sabe escribir`,N(e.sabe_escribir)],[`Cómo se enteró`,M(e.como_se_entero),`Municipio`,sa(e.municipio_residencia)],[`Sector / Calle`,M(e.sector_calle_numero),`Teléfono`,M(e.tlf_alumno)]],i),i=va(t,[[`Dirección completa`,M(e.direccion)],[`Enlace Google Maps`,M(e.ubicacion_maps_url)]],i),i=ba(t,i,40,r,e.nombre_completo,n),i=ga(t,`2 · DATOS DE LA MADRE / 3 · DATOS DEL PADRE`,i),i=_a(t,[[`Nombre (Madre)`,M(e.madre_nombre),`Nombre (Padre)`,M(e.padre_nombre)],[`Cédula Madre`,M(e.madre_cedula),`Cédula Padre`,M(e.padre_cedula)],[`WhatsApp Madre`,M(e.madre_tlf_whatsapp),`WhatsApp Padre`,M(e.padre_tlf_whatsapp)]],i),i=ba(t,i,60,r,e.nombre_completo,n),i=ga(t,`4 · REPRESENTANTE Y CONTACTOS`,i),i=_a(t,[[`Representante`,M(e.representante_nombre),`Parentesco`,M(e.representante_parentesco)],[`Cédula`,M(e.representante_cedula),`Teléfono`,M(e.representante_tlf)],[`Correo`,M(e.correo_representante),`Fam. monoparen.`,N(e.familia_monoparental)],[`Otro responsable`,M(e.otro_responsable_nombre),`Cédula`,M(e.otro_responsable_cedula)],[`Tlf otro resp.`,M(e.otro_responsable_tlf),``,``],[`Emergencia 1`,M(e.contacto_emergencia_nombre),`Tlf`,M(e.contacto_emergencia_telefono)],[`Emergencia 2`,M(e.contacto_emergencia_2_nombre),`Tlf`,M(e.contacto_emergencia_2_telefono)]],i),i=ga(t,`5 · SITUACIÓN SOCIAL`,i),i=_a(t,[[`Beneficiario subsidio`,N(e.beneficiario_subsidio_estado),`Descripción`,M(e.subsidio_descripcion)],[`Apoyo actividades`,{content:M(e.apoyo_actividades),colSpan:3}]],i,{extra:{columnStyles:{0:{fontStyle:`bold`,cellWidth:42,fillColor:j.azulClaro,textColor:j.azul},2:{fontStyle:`bold`,cellWidth:42,fillColor:j.azulClaro,textColor:j.azul}}}}),i=ba(t,i,70,r,e.nombre_completo,n),i=ga(t,`6 · PERFIL MUSICAL`,i,j.dorado),t.setFillColor(...j.doradoClaro),i=_a(t,[[`Conocimientos musicales`,N(e.tiene_conocimientos_musicales),`Instrumento previo`,M(e.instrumento_previo)],[`Nivel lectura musical`,M(e.nivel_lectura_musical),`Interés`,ca(e.interes_musical)],[`Instrumento de interés`,M(e.instrumento_interes),`Requiere iniciación`,N(e.requiere_iniciacion_musical)],[`Músico favorito`,M(e.musico_favorito),`Pref. aprendizaje`,M(e.preferencia_aprendizaje_musical)]],i),i=va(t,[[`Por qué quiere unirse`,M(e.por_que_unirse)],[`Sentimiento música clásica`,M(e.sentimiento_musica_clasica)],[`Sentimiento al aprender`,M(e.sentimiento_aprender_instrumento)],[`Aspiración con instrumento`,M(e.aspiracion_instrumento)]],i,{labelW:55}),i=ba(t,i,50,r,e.nombre_completo,n),i=ga(t,`7 · SALUD Y CONDUCTA`,i,j.rojo),i=_a(t,[[`Tiene alergias`,N(e.tiene_alergias),`Cuáles`,M(e.alergias_descripcion)],[`Cond. transmisible`,N(e.tiene_condicion_transmisible),`Cuál`,M(e.condicion_transmisible_desc)],[`Alergia medicamento`,N(e.tiene_alergia_medicamento),`Cuál`,M(e.alergia_medicamento_desc)],[`Impedimento social`,N(e.impedimento_social),`Conducta`,ua(e.problemas_conducta)]],i),i=ga(t,`8 · DATOS ESCOLARES`,i),i=_a(t,[[`Centro de estudios`,M(e.centro_estudios),`Grado / Nivel`,M(e.grado_nivel)],[`Padres en vida`,la(e.padres_en_vida),``,``]],i),i=ba(t,i,55,r,e.nombre_completo,n),i=ga(t,`9 · COMPROMISOS Y AUTORIZACIONES`,i,j.verde),i=_a(t,[[`Acepta beca RD$4,500`,N(e.acepta_beca_4500),`Acepta pago RD$600/mes`,N(e.acepta_pago_600)],[`Autoriza fotos/redes`,N(e.autoriza_fotos_redes),`Fecha compromisos`,aa(e.fecha_aceptacion_compromisos?.slice(0,10))]],i),i=ba(t,i,45,r,e.nombre_completo,n),i+=8,t.setDrawColor(...j.grisMedio),t.setLineWidth(.3),t.line(F,i+18,F+78,i+18),t.setFont(`helvetica`,`bold`),t.setFontSize(7.5),t.setTextColor(...j.grisOscuro),t.text(`Firma del Representante`,F,i+23),t.setFont(`helvetica`,`normal`),t.setFontSize(7),t.setTextColor(...j.grisMedio),t.text(M(e.representante_nombre),F,i+27),t.text(`C.I.: ${M(e.representante_cedula)}`,F,i+31);let o=P/2+8;return t.setDrawColor(...j.grisMedio),t.line(o,i+18,P-F,i+18),t.setFont(`helvetica`,`bold`),t.setFontSize(7.5),t.setTextColor(...j.grisOscuro),t.text(`Encargado Administrativo`,o,i+23),t.setFont(`helvetica`,`normal`),t.setFontSize(7),t.setTextColor(...j.grisMedio),t.text(`El Sistema Punta Cana`,o,i+27),t.text(`Fecha: ${fa()}`,o,i+31),ha(t,n.n),t}function Sa(e,t={}){let n=new nt({unit:`mm`,format:`letter`}),r=da(e),i=fa(),a=ma(n,`CONSTANCIA DE INSCRIPCIÓN`,`Serie: ${r}`);n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.setTextColor(...j.dorado),n.setDrawColor(...j.dorado),n.setLineWidth(.6),n.roundedRect(P-F-28,36,28,7,1,1,`S`),n.text(`ORIGINAL`,P-F-14,41,{align:`center`}),n.setTextColor(...j.grisOscuro),n.setLineWidth(.2),n.setFont(`helvetica`,`normal`),n.setFontSize(9.5),n.setTextColor(...j.grisMedio),n.text(`Punta Cana, ${i}`,P-F,a,{align:`right`}),a+=8,n.setFont(`helvetica`,`bold`),n.setFontSize(10.5),n.setTextColor(...j.azul),n.text(`A QUIEN PUEDA INTERESAR:`,F,a),a+=10,n.setFont(`helvetica`,`normal`),n.setFontSize(10),n.setTextColor(...j.grisOscuro);let o=M(e.nombre_completo).toUpperCase(),s=M(e.representante_nombre),c=M(e.representante_parentesco);[`Por medio de la presente, El Sistema Punta Cana hace constar que:`,``,`El/La estudiante ${o}, de ${oa(e.fecha_nacimiento)}, nacido/a el ${aa(e.fecha_nacimiento)}, de nacionalidad ${M(e.nacionalidad)}, ha sido debidamente inscrito/a en el Programa de Formación Musical de El Sistema Punta Cana, a partir del día ${i}.`,``,e.requiere_iniciacion_musical?`El/La estudiante participará en el programa de iniciación musical, con interés en ${ca(e.interes_musical).toLowerCase()} — instrumento asignado: ${M(e.instrumento_interes)}.`:`El/La estudiante cuenta con conocimientos musicales previos, con interés en ${ca(e.interes_musical).toLowerCase()} — instrumento: ${M(e.instrumento_interes)}.`,``,`El representante, ${s} (${c}), ha aceptado los términos del programa, incluyendo el aporte mensual de RD$600, con pleno conocimiento de que el/la estudiante recibe una beca valorada en RD$4,500 mensuales, la cual se mantendrá mientras demuestre rendimiento, interés y asistencia notable.`].forEach(e=>{if(!e){a+=4;return}let t=n.splitTextToSize(e,P-F*2);n.text(t,F,a),a+=t.length*5.8}),a+=6;let l=[[`bi-credit-card`,`✓  Tarjeta de pagos mensuales`],[`bi-calendar`,`✓  Horario de clases asignado`],[`bi-pencil`,`✓  Lista de útiles: lápiz HB, cuaderno pentagramado, borrador`],[`bi-shirt`,`✓  T-Shirt oficial de El Sistema Punta Cana`]],u=9+l.length*7+12;n.setFillColor(...j.azulClaro),n.setDrawColor(...j.azulMedio),n.setLineWidth(.5),n.roundedRect(F,a,P-F*2,u,3,3,`FD`),n.setFillColor(...j.azul),n.roundedRect(F,a,P-F*2,9,3,3,`F`),n.rect(F,a+5,P-F*2,4,`F`),n.setFont(`helvetica`,`bold`),n.setFontSize(9),n.setTextColor(...j.blanco),n.text(`AL PRESENTAR ESTA CONSTANCIA EN CAJA RECIBIRÁ:`,F+4,a+6.5),a+=13,n.setFont(`helvetica`,`normal`),n.setFontSize(9.5),n.setTextColor(...j.azul),l.forEach(([,e])=>{n.text(e,F+5,a),a+=7}),a+=1,n.setFillColor(...j.rojo),n.roundedRect(F+3,a,P-F*2-6,8,1.5,1.5,`F`),n.setFont(`helvetica`,`bold`),n.setFontSize(8.5),n.setTextColor(...j.blanco),n.text(`PAGO OBLIGATORIO: RD$600 en caja al retirar los materiales`,F+(P-F*2)/2,a+5.2,{align:`center`}),a+=16;let d=[t.horario&&{icon:`📅`,label:`Consultar horario de clases:`,url:t.horario},t.reglamento&&{icon:`📋`,label:`Reglamento / Manual de convivencia:`,url:t.reglamento},t.bienvenida&&{icon:`⭐`,label:`Manual de bienvenida al programa:`,url:t.bienvenida}].filter(Boolean);d.length>0?(n.setFont(`helvetica`,`bold`),n.setFontSize(9),n.setTextColor(...j.azul),n.text(`Recursos digitales para el representante:`,F,a),a+=6,d.forEach(({icon:e,label:t,url:r})=>{n.setFont(`helvetica`,`bold`),n.setFontSize(8.5),n.setTextColor(...j.grisOscuro),n.text(`${e}  ${t}`,F+2,a),a+=5,n.setFont(`helvetica`,`normal`),n.setFontSize(8),n.setTextColor(...j.azulMedio);let i=n.splitTextToSize(r,P-F*2-10);n.textWithLink(i[0],F+6,a,{url:r}),a+=7}),a+=2):(n.setFont(`helvetica`,`italic`),n.setFontSize(8),n.setTextColor(...j.grisMedio),n.text(`Los recursos digitales serán comunicados por el coordinador del programa.`,F,a),a+=8),a>pa-55&&(ha(n,1),n.addPage(),a=ma(n,`CONSTANCIA DE INSCRIPCIÓN (cont.)`,`Serie: ${r}`)),a+=6,n.setDrawColor(...j.grisMedio),n.setLineWidth(.3),n.setTextColor(...j.grisOscuro),n.line(F,a+20,F+80,a+20),n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.text(`Encargado Administrativo`,F,a+25),n.setFont(`helvetica`,`normal`),n.setFontSize(7.5),n.setTextColor(...j.grisMedio),n.text(`El Sistema Punta Cana`,F,a+29),n.text(i,F,a+33);let f=P/2+6;return n.setTextColor(...j.grisOscuro),n.line(f,a+20,P-F,a+20),n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.text(`Firma del Representante`,f,a+25),n.setFont(`helvetica`,`normal`),n.setFontSize(7.5),n.setTextColor(...j.grisMedio),n.text(M(e.representante_nombre),f,a+29),n.text(`C.I.: ${M(e.representante_cedula)}`,f,a+33),n.setFont(`helvetica`,`normal`),n.setFontSize(6.5),n.setTextColor(170,170,170),n.text(`Serie: ${r}`,P-F,pa-15,{align:`right`}),ha(n,1),n}function Ca(e){let t=xa(e),n=(e.nombre_completo??`alumno`).toLowerCase().replace(/\s+/g,`-`);t.save(`ficha-${n}.pdf`)}async function wa(e){let t={};try{t=await na()}catch{}let n=Sa(e,t),r=(e.nombre_completo??`alumno`).toLowerCase().replace(/\s+/g,`-`);n.save(`constancia-${r}.pdf`)}function Ta(){Ca(ia)}async function Ea(){await wa(ia)}var Da={postulado:[`contactado`,`descartado`],contactado:[`cita_agendada`,`descartado`],cita_agendada:[`documentos_ok`,`no_show`,`descartado`],no_show:[`reprogramado`,`descartado`],reprogramado:[`cita_agendada`,`descartado`],documentos_ok:[`inscrito`,`en_espera`],en_espera:[`cita_agendada`,`descartado`],inscrito:[],descartado:[]},Oa={postulado:`Postulado`,contactado:`Contactado`,cita_agendada:`Cita agendada`,documentos_ok:`Documentos OK`,inscrito:`Inscrito`,no_show:`No show`,reprogramado:`Reprogramado`,en_espera:`En espera`,descartado:`Descartado`},ka={postulado:`secondary`,contactado:`info`,cita_agendada:`primary`,documentos_ok:`warning`,inscrito:`success`,no_show:`danger`,reprogramado:`warning`,en_espera:`secondary`,descartado:`dark`};function Aa(e,t){if(!e||!t)return!1;let n=Da[e];return n?n.includes(t):!1}function ja(e,t,n={}){if(!e)throw Error(`El postulante es requerido para aplicar la transición`);let r=e.estado||`postulado`;if(!Aa(r,t))throw Error(`Transición inválida: no se puede pasar del estado "${r}" al estado "${t}"`);let i={...e,estado:t};return n.fecha_cita!==void 0&&(i.fecha_cita=n.fecha_cita),n.notas_seguimiento!==void 0&&(i.notas_seguimiento?i.notas_seguimiento=`${i.notas_seguimiento}\n${n.notas_seguimiento}`.trim():i.notas_seguimiento=n.notas_seguimiento),n.alumno_id!==void 0&&(i.alumno_id=n.alumno_id),t===`contactado`&&(i.fecha_contacto=new Date().toISOString()),i}async function Ma(e){let{data:t,error:n}=await _.from(`postulantes`).select(`*`).eq(`id`,e).maybeSingle();if(n)throw console.error(`[postuladosSupabase] Error al obtener postulante:`,n),Error(`Error al obtener postulante: ${n.message}`);return t}async function Na(e,t,n={}){try{let r=await Ma(e);if(!r)throw Error(`Postulante con ID ${e} no encontrado`);let i=r.estado||`postulado`;if(!Aa(i,t))throw Error(`Transición inválida: No se puede pasar de "${i}" a "${t}"`);let a={estado:t};n.fecha_cita!==void 0&&(a.fecha_cita=n.fecha_cita),n.notas_seguimiento!==void 0&&(r.notes||r.notas_seguimiento?a.notas_seguimiento=`${r.notas_seguimiento||r.notes||``}\n${n.notas_seguimiento}`.trim():a.notas_seguimiento=n.notas_seguimiento),n.alumno_id!==void 0&&(a.alumno_id=n.alumno_id),t===`contactado`&&(a.fecha_contacto=new Date().toISOString());let{data:o,error:s}=await _.from(`postulantes`).update(a).eq(`id`,e).select().single();if(s)throw console.error(`[postuladosSupabase] Error en update:`,s),s;return o}catch(e){throw console.error(`[postuladosSupabase] Error al actualizar estado:`,e.message),e}}async function Pa(e,t){try{let n=new Date(e,t-1,1).toISOString(),r=new Date(e,t,1).toISOString(),{data:i,error:a}=await _.from(`postulantes`).select(`*`).gte(`created_at`,n).lt(`created_at`,r).order(`created_at`,{ascending:!1});if(a)throw console.error(`[postuladosSupabase] Error al listar por mes:`,a),a;return i??[]}catch(e){throw console.error(`[postuladosSupabase] Error en listarPostulantesPorMes:`,e.message),e}}async function Fa(e,t){try{let{data:n,error:r}=await _.from(`postulantes`).select(`*`).gte(`created_at`,e).lte(`created_at`,t+`T23:59:59.999Z`).order(`created_at`,{ascending:!1});if(r)throw console.error(`[postuladosSupabase] Error al listar por rango:`,r),r;return n??[]}catch(e){throw console.error(`[postuladosSupabase] Error en listarPostulantesPorRango:`,e.message),e}}async function Ia(e,t){try{let{data:n,error:r}=await _.from(`postulantes`).select(`*`).gte(`fecha_cita`,e).lte(`fecha_cita`,t).not(`fecha_cita`,`is`,null).order(`fecha_cita`,{ascending:!0});if(r)throw console.error(`[postuladosSupabase] Error al listar citas:`,r),r;return n??[]}catch(e){throw console.error(`[postuladosSupabase] Error en listarCitas:`,e.message),e}}async function La(e,t=null){try{let n=new Date(e).getTime();if(isNaN(n))throw Error(`Fecha/Hora de cita inválida`);let r=new Date(n-1800*1e3).toISOString(),i=new Date(n+1800*1e3).toISOString(),a=_.from(`postulantes`).select(`id, nombre_completo, fecha_cita`).gte(`fecha_cita`,r).lte(`fecha_cita`,i).not(`fecha_cita`,`is`,null);t&&(a=a.ne(`id`,t));let{data:o,error:s}=await a;if(s)throw console.error(`[postuladosSupabase] Error al verificar conflicto de cita:`,s),s;return(o??[]).length>0}catch(e){throw console.error(`[postuladosSupabase] Error en hayConflictoCita:`,e.message),e}}async function Ra(e,t){try{if(!t||!t.trim())return;let n=await Ma(e);if(!n)throw Error(`Postulante con ID ${e} no encontrado`);let r=n.notas_seguimiento||n.notes||``,i=r?`${r}\n${t}`.trim():t.trim(),{data:a,error:o}=await _.from(`postulantes`).update({notas_seguimiento:i}).eq(`id`,e).select().single();if(o)throw console.error(`[postuladosSupabase] Error al agregar nota:`,o),o;return a}catch(e){throw console.error(`[postuladosSupabase] Error en agregarNota:`,e.message),e}}async function za(e){try{let{error:t}=await _.from(`postulantes`).delete().eq(`id`,e);if(t)throw console.error(`[postuladosSupabase] Error al eliminar postulante:`,t),t;return!0}catch(e){throw console.error(`[postuladosSupabase] Error en eliminarPostulante:`,e.message),e}}var Ba=e({actualizarEstadoPostulante:()=>Na,agregarNota:()=>Ra,backfillDesdePostulantes:()=>Ka,buscarPostulante:()=>Ha,eliminarPostulante:()=>za,hayConflictoCita:()=>La,listarCitas:()=>Ia,listarPostulantes:()=>Ga,listarPostulantesPorMes:()=>Pa,listarPostulantesPorRango:()=>Fa,obtenerPostulante:()=>Ua,sincronizarPostulantes:()=>Wa});function Va(e){return(e??``).toLowerCase().replace(/\s+/g,` `).trim()}async function Ha(e){let t=Va(e);if(!t||t.length<2)return[];let{data:n,error:r}=await _.from(`postulantes`).select(`*`).or(`nombre_completo.ilike.*${t}*,telefono_alumno.ilike.*${t}*,madre_tlf_whatsapp.ilike.*${t}*,padre_tlf_whatsapp.ilike.*${t}*`).limit(20);if(r)throw console.error(`[postulantesSupabase] Error searching:`,r),r;let i=new Set;return(n??[]).filter(e=>{let t=`${e.nombre_completo||``}|${e.correo||``}`;return i.has(t)?!1:(i.add(t),!0)})}async function Ua(e){let{data:t,error:n}=await _.from(`postulantes`).select(`*`).eq(`id`,e).maybeSingle();if(n)throw console.error(`[postulantesSupabase] Error fetching:`,n),n;return t}async function Wa(){let{data:e,error:t}=await _.functions.invoke(`sync-postulantes`,{method:`POST`});if(t){console.error(`[postulantesSupabase] Error syncing:`,t);let e=t.context?.status??0,n=t.context?.body??{},r=Error(n?.error||t.message||`Error al sincronizar`);throw r.status=e,r}return e}async function Ga(){let{data:e,error:t}=await _.from(`postulantes`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw console.error(`[postulantesSupabase] Error listing:`,t),t;return e??[]}async function Ka(e=!1){let{data:t,error:n}=await _.rpc(`backfill_alumnos_desde_postulantes`,{dry_run:e});if(n)throw console.error(`[postulantesSupabase] Error backfilling:`,n.message),Error(`Error al backfillear: ${n.message}`);return{success:!0,data:t??[],dry_run:e}}var qa=[{id:`post-001`,nombre_completo:`Marcos Merone Cocco`,fecha_nacimiento:`2015-08-30`,telefono_alumno:`8295577722`,correo:`elisabetta.cocco@hotmail.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Avenida real norte MC1-10-b`,madre_nombre:`Elisabetta Cocco`,madre_tlf_whatsapp:`8295577722`,padre_nombre:`Esnor Merone`,padre_tlf_whatsapp:``,representante_parentesco:`ambos`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-002`,nombre_completo:`Ana Pérez Guerrero`,fecha_nacimiento:`2017-03-15`,telefono_alumno:`8091112233`,correo:`ana.perez@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Los Robles #45`,madre_nombre:`María Guerrero`,madre_tlf_whatsapp:`8091112233`,padre_nombre:`Juan Pérez`,padre_tlf_whatsapp:`8091112234`,representante_parentesco:`madre`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Fines de semana`,tiene_transporte:!0,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-003`,nombre_completo:`Luis Gómez Rodríguez`,fecha_nacimiento:`2016-11-22`,telefono_alumno:`8297778899`,correo:`luis.gomez@example.com`,nacionalidad:`Venezolana`,sector_calle_numero:`Residencial Punta Cana, Edif 3 Apto 2B`,madre_nombre:`Carmen Rodríguez`,madre_tlf_whatsapp:`8297778899`,padre_nombre:`Pedro Gómez`,padre_tlf_whatsapp:``,representante_parentesco:`madre`,acepta_pago_600:!1,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!1,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-004`,nombre_completo:`María José López`,fecha_nacimiento:`2014-06-10`,telefono_alumno:`8493334455`,correo:`maria.lopez@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Principal #12, Verón`,madre_nombre:`Sofía López`,madre_tlf_whatsapp:`8493334455`,padre_nombre:`Carlos López`,padre_tlf_whatsapp:`8493334456`,representante_parentesco:`ambos`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Tardes después de las 3pm`,tiene_transporte:!0,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-005`,nombre_completo:`Juan García Marte`,fecha_nacimiento:`2018-01-05`,telefono_alumno:`8095556677`,correo:`juan.garcia@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Las Palmas #7, Bavaro`,madre_nombre:`Ana Marte`,madre_tlf_whatsapp:`8095556677`,padre_nombre:`Roberto García`,padre_tlf_whatsapp:``,representante_parentesco:`madre`,acepta_pago_600:!0,autoriza_fotos_redes:!1,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`}],Ja=(e=50)=>new Promise(t=>setTimeout(t,e)),I=[...qa];function Ya(){I=[...qa]}async function Xa(e,t,n={}){await Ja();let r=I.findIndex(t=>t.id===e);if(r===-1)throw Error(`Postulante con ID ${e} no encontrado`);let i=I[r],a=ja(i,t,n);return I[r]=a,a}async function Za(e,t){return await Ja(),I.filter(n=>{if(!n.created_at)return!1;let r=new Date(n.created_at);return r.getFullYear()===e&&r.getMonth()+1===t})}async function Qa(e,t){await Ja();let n=new Date(e).getTime(),r=new Date(t+`T23:59:59.999Z`).getTime();return I.filter(e=>{if(!e.created_at)return!1;let t=new Date(e.created_at).getTime();return t>=n&&t<=r}).sort((e,t)=>new Date(t.created_at)-new Date(e.created_at))}async function $a(e,t){await Ja();let n=new Date(e).getTime(),r=new Date(t).getTime();return I.filter(e=>{if(!e.fecha_cita)return!1;let t=new Date(e.fecha_cita).getTime();return t>=n&&t<=r}).sort((e,t)=>new Date(e.fecha_cita)-new Date(t.fecha_cita))}async function eo(e,t=null){await Ja();let n=new Date(e).getTime();if(isNaN(n))throw Error(`Fecha/Hora de cita inválida`);return I.some(e=>{if(t&&e.id===t||!e.fecha_cita||e.estado!==`cita_agendada`&&e.estado!==`reprogramado`)return!1;let r=new Date(e.fecha_cita).getTime();return Math.abs(r-n)<=18e5})}async function to(e,t){await Ja();let n=I.findIndex(t=>t.id===e);if(n===-1)throw Error(`Postulante con ID ${e} no encontrado`);let r=I[n],i=r.notas_seguimiento||r.notes||``,a=i?`${i}\n${t}`.trim():t.trim(),o={...r,notas_seguimiento:a};return I[n]=o,o}async function no(e){await Ja();let t=I.findIndex(t=>t.id===e);if(t===-1)throw Error(`Postulante con ID ${e} no encontrado`);return I.splice(t,1),!0}var ro=e({actualizarEstadoPostulante:()=>Xa,agregarNota:()=>to,backfillDesdePostulantes:()=>uo,buscarPostulante:()=>oo,data:()=>I,eliminarPostulante:()=>no,hayConflictoCita:()=>eo,listarCitas:()=>$a,listarPostulantes:()=>lo,listarPostulantesPorMes:()=>Za,listarPostulantesPorRango:()=>Qa,obtenerPostulante:()=>so,resetMockData:()=>Ya,sincronizarPostulantes:()=>co}),io=(e=300)=>new Promise(t=>setTimeout(t,e));function ao(e){return(e??``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/\s+/g,` `).trim()}async function oo(e){await io();let t=ao(e);return!t||t.length<2?[]:I.filter(e=>{let n=ao(e.nombre_completo),r=ao(e.telefono_alumno),i=ao(e.madre_tlf_whatsapp),a=ao(e.padre_tlf_whatsapp);return n.includes(t)||r.includes(t)||i.includes(t)||a.includes(t)})}async function so(e){return await io(100),I.find(t=>t.id===e)??null}async function co(){return await io(500),{status:`success`,total_rows:I.length,upserted:I.length,errors:0,timestamp:new Date().toISOString(),_mock:!0}}async function lo(){return await io(),[...I]}async function uo(e=!1){await io(400);let t=I.filter(e=>e.estado!==`inscrito`).map(t=>({alumno_id:`mock-`+t.id,alumno_nombre:t.nombre_completo,postulante_id:t.id,postulante_nombre:t.nombre_completo,match_tipo:`email`,campos_llenados:5,accion:e?`preview`:`updated`}));return e||t.forEach(e=>{let t=I.findIndex(t=>t.id===e.postulante_id);t!==-1&&(I[t]={...I[t],estado:`inscrito`,alumno_id:e.alumno_id})}),{success:!0,data:t,dry_run:e}}var fo=()=>x.isDemoMode?ro:Ba,po=(...e)=>fo().buscarPostulante(...e),mo=(...e)=>fo().obtenerPostulante(...e),ho=(...e)=>fo().sincronizarPostulantes(...e),go=(...e)=>fo().backfillDesdePostulantes(...e),_o=(...e)=>fo().actualizarEstadoPostulante(...e),vo=(...e)=>fo().listarPostulantesPorMes(...e),yo=(...e)=>fo().listarPostulantesPorRango(...e),bo=(...e)=>fo().listarCitas(...e),xo=(...e)=>fo().hayConflictoCita(...e),So=(...e)=>fo().agregarNota(...e),Co=(...e)=>fo().eliminarPostulante(...e);function wo(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`})}catch{return`—`}}function To(e){return e.estado===`inscrito`?`<span class="badge bg-success-subtle text-success-emphasis"><i class="bi bi-check-circle-fill me-1"></i>Inscrito</span>`:`<span class="badge bg-warning-subtle text-warning-emphasis"><i class="bi bi-clock me-1"></i>Pendiente</span>`}function Eo(e){return new Promise(t=>{if((()=>{try{return JSON.parse(localStorage.getItem(`wizard-inscripcion-draft`)||`null`)}catch{return null}})()?._postulante_id){t(null);return}let n=`pendiente`;e.innerHTML=`
      <div class="preload-search card shadow-sm mb-4">
        <div class="card-header d-flex align-items-center gap-2">
          <i class="bi bi-cloud-download text-primary fs-5"></i>
          <div class="flex-grow-1">
            <h5 class="mb-0">Buscar postulante</h5>
            <small class="text-muted">Busca por nombre o teléfono para precargar los datos del formulario de postulación</small>
          </div>
          <button id="preload-btn-sync" class="btn btn-outline-secondary btn-sm" title="Sincronizar postulantes desde Google">
            <i class="bi bi-arrow-repeat"></i>
          </button>
          <button id="preload-btn-backfill" class="btn btn-outline-secondary btn-sm" title="Llenar datos de alumnos desde postulantes">
            <i class="bi bi-database-fill-up"></i>
          </button>
        </div>
        <div class="card-body">
          <div id="preload-sync-panel" class="d-none mb-3">
            <div class="alert alert-info py-2 mb-0 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-cloud-arrow-up me-1"></i> Sincronizar postulantes desde Google</span>
              <button id="preload-btn-sync-confirm" class="btn btn-primary btn-sm">
                <i class="bi bi-check2-circle me-1"></i>Sincronizar ahora
              </button>
            </div>
            <div id="preload-sync-result" class="mt-2"></div>
          </div>

          <div id="preload-backfill-panel" class="d-none mb-3">
            <div class="alert alert-info py-2 mb-0">
              <div class="d-flex align-items-center justify-content-between">
                <span><i class="bi bi-database-fill-up me-1"></i> <strong>Backfill:</strong> llena campos vacíos de alumnos inscritos con datos de postulantes</span>
                <button id="preload-btn-backfill-run" class="btn btn-primary btn-sm">
                  <i class="bi bi-play-fill me-1"></i>Ejecutar backfill
                </button>
              </div>
              <div class="d-flex align-items-center gap-2 mt-2">
                <button id="preload-btn-backfill-preview" class="btn btn-outline-info btn-sm">
                  <i class="bi bi-eye me-1"></i>Previsualizar
                </button>
                <span class="small text-muted">Muestra qué registros se llenarían sin escribir nada</span>
              </div>
              <div id="preload-backfill-result" class="mt-2"></div>
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-sm-8">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input id="preload-query" type="text" class="form-control" placeholder="Nombre del alumno o número de teléfono..." autocomplete="off" />
                <button id="preload-btn-search" class="btn btn-primary" type="button">Buscar</button>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="preload-filtro" id="filtro-pendiente" value="pendiente" checked>
                <label class="btn btn-outline-secondary btn-sm" for="filtro-pendiente"><i class="bi bi-clock me-1"></i>Pendientes</label>
                <input type="radio" class="btn-check" name="preload-filtro" id="filtro-todos" value="todos">
                <label class="btn btn-outline-secondary btn-sm" for="filtro-todos"><i class="bi bi-list me-1"></i>Todos</label>
              </div>
            </div>
          </div>

          <div id="preload-results"></div>
        </div>
        <div class="card-footer d-flex justify-content-end">
          <button id="preload-btn-skip" class="btn btn-link text-muted btn-sm">
            <i class="bi bi-skip-forward me-1"></i>Continuar sin buscar
          </button>
        </div>
      </div>`;let r=e.querySelector(`#preload-query`),i=e.querySelector(`#preload-btn-search`),a=e.querySelector(`#preload-btn-skip`),o=e.querySelector(`#preload-results`);function s(){return e.querySelector(`[name="preload-filtro"]:checked`)?.value??`pendiente`}e.querySelectorAll(`[name="preload-filtro"]`).forEach(e=>{e.addEventListener(`change`,()=>{n=s();let e=r.value.trim();e.length>=2&&c(e)})});async function c(e){if(e??=r.value.trim(),e.length<2){o.innerHTML=`<div class="text-muted small">Ingresa al menos 2 caracteres.</div>`;return}o.innerHTML=`
        <div class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span class="ms-2 text-muted small">Buscando...</span>
        </div>`;try{let r=await po(e);if(n===`pendiente`&&(r=r.filter(e=>e.estado!==`inscrito`)),!r.length){o.innerHTML=`
            <div class="alert alert-warning py-2 mb-0">
              <i class="bi bi-exclamation-circle me-1"></i>
              No se encontró ningún postulante con este nombre o teléfono.
            </div>`;return}o.innerHTML=`
          <div class="list-group">${r.map((e,t)=>{let n=e.estado===`inscrito`,r=e.fecha_postulacion||e.created_at||e.sincronizado_en;return`
          <div class="list-group-item list-group-item-action py-3 ${n?`opacity-75`:``}"
               data-idx="${t}" role="button" style="cursor:pointer">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <span class="fw-semibold">${e.nombre_completo||`(sin nombre)`}</span>
                  ${To(e)}
                </div>

                <div class="small text-muted d-flex flex-wrap gap-3">
                  ${r?`<span><i class="bi bi-calendar3 me-1"></i>${wo(r)}</span>`:``}
                  ${e.telefono_alumno?`<span><i class="bi bi-telephone me-1"></i>${e.telefono_alumno}</span>`:``}
                  ${e.correo?`<span><i class="bi bi-envelope me-1"></i>${e.correo}</span>`:``}
                  ${e.madre_tlf_whatsapp?`<span><i class="bi bi-person me-1"></i>Madre: ${e.madre_tlf_whatsapp}</span>`:``}
                </div>
              </div>
              <button class="btn btn-sm ${n?`btn-outline-secondary`:`btn-outline-primary`} ms-2 flex-shrink-0" data-pick="${t}" ${n?`disabled`:``}>
                <i class="bi bi-check2-circle me-1"></i>Usar datos
              </button>
            </div>
          </div>`}).join(``)}</div>
          <p class="text-muted small mt-2 mb-0">
            <i class="bi bi-info-circle me-1"></i>
            Se precargarán los campos disponibles. Podés editarlos antes de guardar.
          </p>`;function i(e){let n=r[e];n.estado!==`inscrito`&&t({...n,_postulante_id:n.id})}o.querySelectorAll(`[data-pick]:not([disabled])`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),i(parseInt(e.getAttribute(`data-pick`),10))})}),o.querySelectorAll(`[data-idx]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.getAttribute(`data-idx`),10);r[t].estado!==`inscrito`&&i(t)})})}catch(e){console.error(`Error buscando postulante:`,e),o.innerHTML=`
          <div class="alert alert-danger py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i>
            Error al conectar. Continuá sin búsqueda.
          </div>`}}i.addEventListener(`click`,()=>c()),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()}),a.addEventListener(`click`,()=>t(null));let l=e.querySelector(`#preload-btn-sync`),u=e.querySelector(`#preload-sync-panel`),d=e.querySelector(`#preload-btn-sync-confirm`),f=e.querySelector(`#preload-sync-result`);l.addEventListener(`click`,()=>{u.classList.toggle(`d-none`),f.innerHTML=``});let p=e.querySelector(`#preload-btn-backfill`),m=e.querySelector(`#preload-backfill-panel`),ee=e.querySelector(`#preload-btn-backfill-run`),te=e.querySelector(`#preload-btn-backfill-preview`),ne=e.querySelector(`#preload-backfill-result`);p.addEventListener(`click`,()=>{m.classList.toggle(`d-none`),ne.innerHTML=``});async function re(e){ee.disabled=!0,te.disabled=!0,ne.innerHTML=`
        <div class="text-center py-2">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span class="ms-2 small">${e?`Previsualizando`:`Ejecutando`}...</span>
        </div>`;try{let t=await go(e),n=t.data.length,r=t.data.filter(e=>e.campos_llenados>0).length,i=t.data.reduce((e,t)=>e+t.campos_llenados,0);if(e){ne.innerHTML=`
            <div class="alert alert-info py-2 mb-0 small">
              <i class="bi bi-eye me-1"></i>
              <strong>Previsualización:</strong> ${n} alumnos coinciden con postulantes.
              ${r} tendrían campos por llenar (${i} campos en total).
              ${n>0?`<br><button id="preload-btn-backfill-confirm" class="btn btn-primary btn-sm mt-2"><i class="bi bi-play-fill me-1"></i>Confirmar y ejecutar</button>`:``}
            </div>
            ${ie(t.data)}`;let e=ne.querySelector(`#preload-btn-backfill-confirm`);e&&e.addEventListener(`click`,()=>re(!1))}else{let e=t.data.filter(e=>e.accion===`updated`).length;ne.innerHTML=`
            <div class="alert alert-success py-2 mb-0 small">
              <i class="bi bi-check-circle me-1"></i>
              <strong>Backfill completado:</strong> ${e} alumnos actualizados
              (${i} campos llenados de ${n} coincidencias).
            </div>
            ${ie(t.data)}`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Backfill: ${e} alumnos actualizados, ${i} campos llenados`,type:`success`}}))}}catch(e){ne.innerHTML=`
          <div class="alert alert-danger py-2 mb-0 small">
            <i class="bi bi-exclamation-triangle me-1"></i>
            ${e.message||`Error al ejecutar backfill`}
          </div>`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error en backfill: `+(e.message||`desconocido`),type:`danger`}}))}finally{ee.disabled=!1,te.disabled=!1}}function ie(e){return e.length?`
        <div class="table-responsive mt-2" style="max-height:250px;overflow-y:auto">
          <table class="table table-sm table-striped mb-0 small">
            <thead class="table-light"><tr>
              <th>Alumno</th><th>Postulante</th><th>Match</th><th class="text-center">Campos</th><th>Acción</th>
            </tr></thead>
            <tbody>${e.map(e=>`
        <tr>
          <td class="text-truncate" title="${ae(e.alumno_nombre)}">${ae(e.alumno_nombre)}</td>
          <td class="text-truncate" title="${ae(e.postulante_nombre)}">${ae(e.postulante_nombre)}</td>
          <td><span class="badge bg-${e.match_tipo===`email`?`primary`:`secondary`}">${e.match_tipo}</span></td>
          <td class="text-center">${e.campos_llenados}</td>
          <td>${e.accion===`preview`?`<span class="text-info">Previo</span>`:`<span class="text-success">Actualizado</span>`}</td>
        </tr>`).join(``)}</tbody>
          </table>
        </div>`:``}function ae(e){if(!e)return`—`;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}ee.addEventListener(`click`,()=>re(!1)),te.addEventListener(`click`,()=>re(!0)),d.addEventListener(`click`,async()=>{d.disabled=!0,d.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Sincronizando...`;try{let e=await ho();f.innerHTML=`
          <div class="alert alert-success py-2 mb-0">
            <i class="bi bi-check-circle me-1"></i>
            ${e.upserted} registros sincronizados (${e.total_rows} total). 0 errores.
          </div>`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Postulantes sincronizados: ${e.upserted} registros`,type:`success`}}))}catch(e){let t=e.status===401?`No tienes permisos de administrador para sincronizar.`:e.message||`Error al sincronizar`;f.innerHTML=`
          <div class="alert alert-danger py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i>${t}
          </div>`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:t,type:`danger`}}))}finally{d.disabled=!1,d.innerHTML=`<i class="bi bi-check2-circle me-1"></i>Sincronizar ahora`}})})}function Do({currentStep:e,totalSteps:t,title:n,content:r,canGoPrev:i,canGoNext:a,isLastStep:o,isLastRequiredStep:s,isLastOptionalStep:c,isOptionalStep:l,steps:u,maxReachedStep:d}){return`
    <div class="wizard-inscripcion container-fluid py-3">
      ${Wi({currentStep:e,totalSteps:t})}
      ${Gi({steps:u,currentStep:e,maxReachedStep:d})}
      <div class="card shadow-sm">
        <div class="card-header">
          <h5 class="card-title mb-0">Paso ${e} de ${t}: ${n}</h5>
        </div>
        <div class="card-body">
          <div id="wizard-step-slot">
            ${r}
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <button
            type="button"
            id="wiz-btn-prev"
            class="btn btn-outline-secondary"
            ${i?``:`disabled`}
          >
            <i class="bi bi-arrow-left"></i> Atrás
          </button>
          <button type="button" id="wiz-btn-draft" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-floppy"></i> Guardar borrador
          </button>
          <div class="d-flex gap-2 flex-wrap">
            ${c?`<button type="button" id="wiz-btn-submit" class="btn btn-success">
                   <i class="bi bi-check-circle"></i> Finalizar inscripción completa
                 </button>`:s?`<button type="button" id="wiz-btn-submit-basic" class="btn btn-outline-success">
                     <i class="bi bi-check2"></i> Finalizar inscripción
                   </button>
                   <button type="button" id="wiz-btn-next" class="btn btn-primary">
                     Agregar perfil <i class="bi bi-arrow-right"></i>
                   </button>`:l?`<button type="button" id="wiz-btn-submit-basic" class="btn btn-outline-secondary btn-sm">
                       <i class="bi bi-skip-forward"></i> Completar después
                     </button>
                     <button type="button" id="wiz-btn-next" class="btn btn-primary">
                       Siguiente <i class="bi bi-arrow-right"></i>
                     </button>`:`<button type="button" id="wiz-btn-next" class="btn btn-primary">
                       Siguiente <i class="bi bi-arrow-right"></i>
                     </button>`}
          </div>
        </div>
      </div>
    </div>`}function Oo(e,t,n,r){let i=r??t.length,a=Hi(),o=Fi(t.length);a&&(o={...o,draft:a});function s(){return t[o.currentStep-1]}function c(){let n=s(),r=o.currentStep,a=n.render(o.draft);e.innerHTML=Do({currentStep:r,totalSteps:o.totalSteps,title:n.title,content:a,canGoPrev:r>1,canGoNext:!0,isLastStep:r===o.totalSteps,isLastRequiredStep:r===i,isLastOptionalStep:r===o.totalSteps&&r>i,isOptionalStep:r>i&&r<o.totalSteps,steps:t.map((e,t)=>({id:e.id,title:e.title,optional:t>=i})),maxReachedStep:o.maxReachedStep}),u()}async function l(t){t&&(t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`);try{let t=s().getState(e);o={...o,draft:{...o.draft,...t}};let r=await n({...o.draft,fecha_aceptacion_compromisos:new Date().toISOString()}),i=o.draft._postulante_id;if(i&&r?.id)try{await _.from(`postulantes`).update({estado:`inscrito`,alumno_id:r.id}).eq(`id`,i)}catch(e){console.warn(`[Wizard] Could not update postulante estado:`,e.message)}Ui(),o=zi(o);let a={...o.draft,...r??{}};e.innerHTML=`
        <div class="card shadow-sm mt-4">
          <div class="card-body text-center py-4">
            <i class="bi bi-check-circle-fill text-success" style="font-size:3rem"></i>
            <h4 class="mt-3 text-success">¡Inscripción completada!</h4>
            <p class="text-muted mb-4">
              <strong>${a.nombre_completo??`El alumno`}</strong> ha sido registrado exitosamente en El Sistema Punta Cana.
            </p>

            <div class="alert alert-warning text-start mb-4">
              <i class="bi bi-cash-coin me-2"></i>
              <strong>Próximo paso:</strong> Dirigirse a caja para realizar el pago de <strong>RD$600</strong> y recibir:
              tarjeta de pagos mensuales, horario de clases, lista de útiles y T-shirt del programa.
            </div>

            <div class="d-flex flex-wrap justify-content-center gap-3">
              <button id="btn-pdf-ficha" class="btn btn-primary btn-lg">
                <i class="bi bi-file-earmark-person me-2"></i>Descargar Ficha del Alumno
              </button>
              <button id="btn-pdf-constancia" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-file-earmark-text me-2"></i>Descargar Constancia
              </button>
            </div>

            <p class="text-muted small mt-3">
              <i class="bi bi-printer me-1"></i>
              Imprime la ficha para la carpeta interna y la constancia para entregársela al representante.
            </p>
          </div>
        </div>`,e.querySelector(`#btn-pdf-ficha`)?.addEventListener(`click`,()=>{try{Ca(a)}catch(e){console.error(`Error generando ficha:`,e)}}),e.querySelector(`#btn-pdf-constancia`)?.addEventListener(`click`,()=>{try{wa(a)}catch(e){console.error(`Error generando constancia:`,e)}})}catch{t&&(t.disabled=!1,t.innerHTML=t.dataset.label??`Finalizar`);let n=e.querySelector(`#wizard-step-slot`);if(n){let e=document.createElement(`div`);e.className=`alert alert-danger mt-3`,e.textContent=`Error al guardar. Por favor intenta de nuevo.`,n.after(e)}}}function u(){let t=e.querySelector(`#wiz-btn-prev`),n=e.querySelector(`#wiz-btn-next`),r=e.querySelector(`#wiz-btn-submit`),i=e.querySelector(`#wiz-btn-submit-basic`),a=e.querySelector(`#wiz-btn-draft`);t&&t.addEventListener(`click`,()=>{o=Li(o),c()}),n&&n.addEventListener(`click`,()=>{let t=s().getState(e);o=Ii(o,t),Vi(o.draft),c()}),r&&(r.dataset.label=r.textContent,r.addEventListener(`click`,()=>l(r))),i&&(i.dataset.label=i.textContent,i.addEventListener(`click`,()=>l(i))),a&&a.addEventListener(`click`,()=>{let t=s().getState(e);o={...o,draft:{...o.draft,...t}},Vi(o.draft),a.textContent=`¡Guardado!`,setTimeout(()=>{a.innerHTML=`<i class="bi bi-floppy"></i> Guardar borrador`},1500)}),e.querySelectorAll(`[data-step]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-step`),10),r=s().getState(e);o={...o,draft:{...o.draft,...r}},Vi(o.draft),o=Ri(o,n),c()})})}return Eo(e).then(e=>{e&&(o={...o,draft:{...o.draft,...e}}),c()}),{destroy(){e.innerHTML=``}}}function ko(e){return String(e??``).replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function Ao(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function L(e){let{name:t,label:n,type:r=`text`,value:i=``,error:a=``,required:o=!1,placeholder:s=``,hint:c=``,options:l=[],readOnly:u=!1}=e,d=`wiz-${t}`,f=o?`required`:``,p=u?`readonly`:``,m=a?`is-invalid`:``,ee=a?`<div class="invalid-feedback">${Ao(a)}</div>`:``,te=c?`<div class="form-text">${Ao(c)}</div>`:``;if(r===`select`){let e=l.map(e=>`<option value="${ko(e.value)}"${i===e.value?` selected`:``}>${Ao(e.label)}</option>`).join(``);return`
      <div class="mb-3">
        <label for="${d}" class="form-label">${Ao(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        <select id="${d}" name="${t}" class="form-select ${m}" ${f}>
          <option value="">Selecciona una opción</option>
          ${e}
        </select>
        ${ee}${te}
      </div>`}if(r===`radio`){let e=l.map(e=>`
        <div class="form-check">
          <input class="form-check-input ${m}" type="radio" name="${t}" id="${d}-${ko(e.value)}" value="${ko(e.value)}"${i===e.value?` checked`:``} ${f}>
          <label class="form-check-label" for="${d}-${ko(e.value)}">${Ao(e.label)}</label>
        </div>`).join(``);return`
      <div class="mb-3">
        <label class="form-label">${Ao(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        ${e}
        ${a?`<div class="text-danger small">${Ao(a)}</div>`:``}
        ${te}
      </div>`}return r===`checkbox`?`
      <div class="mb-3 form-check">
        <input class="form-check-input ${m}" type="checkbox" id="${d}" name="${t}"${i===!0||i===`true`?` checked`:``}>
        <label class="form-check-label" for="${d}">${Ao(n)}</label>
        ${ee}${te}
      </div>`:r===`textarea`?`
      <div class="mb-3">
        <label for="${d}" class="form-label">${Ao(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        <textarea id="${d}" name="${t}" class="form-control ${m}" placeholder="${ko(s)}" ${f} ${p} rows="3">${Ao(i)}</textarea>
        ${ee}${te}
      </div>`:`
    <div class="mb-3">
      <label for="${d}" class="form-label">${Ao(n)}${o?` <span class="text-danger">*</span>`:``}</label>
      <input
        type="${ko(r)}"
        id="${d}"
        name="${t}"
        class="form-control ${m}"
        value="${ko(i)}"
        placeholder="${ko(s)}"
        ${f}
        ${p}
      >
      ${ee}${te}
    </div>`}var jo=/^https?:\/\/(www\.)?google\.com\/maps|^https?:\/\/goo\.gl\/maps/;function Mo(e){return{valid:Object.keys(e).length===0,errors:e}}function No(e){let t={};if((!e.nombre_completo||!e.nombre_completo.trim())&&(t.nombre_completo=`El nombre completo es requerido`),!e.fecha_nacimiento)t.fecha_nacimiento=`La fecha de nacimiento es requerida`;else{let n=new Date(e.fecha_nacimiento);isNaN(n.getTime())?t.fecha_nacimiento=`Fecha de nacimiento inválida`:n>new Date&&(t.fecha_nacimiento=`La fecha de nacimiento no puede ser en el futuro`)}return(!e.nacionalidad||!e.nacionalidad.trim())&&(t.nacionalidad=`La nacionalidad es requerida`),(!e.como_se_entero||!e.como_se_entero.trim())&&(t.como_se_entero=`Este campo es requerido`),(!e.direccion||!e.direccion.trim())&&(t.direccion=`La dirección es requerida`),e.ubicacion_maps_url&&e.ubicacion_maps_url.trim()&&(jo.test(e.ubicacion_maps_url.trim())||(t.ubicacion_maps_url=`URL debe ser de Google Maps`)),Mo(t)}function Po(e,t=new Date){if(!e)throw Error(`fechaNacimiento is required`);let n=new Date(e);if(isNaN(n.getTime()))throw Error(`Invalid date: "${e}"`);if(n>t)throw Error(`fechaNacimiento cannot be in the future`);let r=t.getFullYear()-n.getFullYear(),i=t.getMonth()-n.getMonth(),a=t.getDate()-n.getDate();return(i<0||i===0&&a<0)&&--r,r}var Fo=e({getState:()=>Bo,id:()=>Io,render:()=>Ro,title:()=>Lo,validate:()=>zo}),Io=`step1`,Lo=`Datos del Alumno`;function Ro(e,t={}){let n=e.fecha_nacimiento?(()=>{try{return Po(e.fecha_nacimiento)}catch{return``}})():``;return`
    <form id="wiz-form-step1" novalidate>
      ${L({name:`nombre_completo`,label:`Nombre completo del alumno`,type:`text`,value:e.nombre_completo??``,error:t.nombre_completo??``,required:!0,hint:`Tal como aparece en el documento de identidad`})}

      <div class="row g-2">
        <div class="col-sm-8">
          ${L({name:`fecha_nacimiento`,label:`Fecha de nacimiento`,type:`date`,value:e.fecha_nacimiento??``,error:t.fecha_nacimiento??``,required:!0})}
        </div>
        <div class="col-sm-4">
          ${L({name:`edad_display`,label:`Edad actual`,type:`text`,value:n===``?`—`:n+` años`,readOnly:!0})}
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6">
          ${L({name:`sabe_leer`,label:`¿Sabe leer?`,type:`radio`,value:e.sabe_leer===!0?`true`:e.sabe_leer===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
        </div>
        <div class="col-6">
          ${L({name:`sabe_escribir`,label:`¿Sabe escribir?`,type:`radio`,value:e.sabe_escribir===!0?`true`:e.sabe_escribir===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
        </div>
      </div>

      <div class="row g-2">
        <div class="col-sm-8">
          ${L({name:`nacionalidad`,label:`Nacionalidad`,type:`text`,value:e.nacionalidad??``,error:t.nacionalidad??``,required:!0})}
        </div>
        <div class="col-sm-4">
          ${L({name:`tiene_pasaporte`,label:`¿Tiene pasaporte?`,type:`checkbox`,value:e.tiene_pasaporte??!1})}
        </div>
      </div>

      ${L({name:`como_se_entero`,label:`¿Cómo se enteró de El Sistema Punta Cana?`,type:`select`,value:e.como_se_entero??``,error:t.como_se_entero??``,required:!0,options:[{value:``,label:`Selecciona una opción...`},{value:`amigo_familiar`,label:`Un amigo o familiar`},{value:`redes_sociales`,label:`Redes sociales`},{value:`colegio`,label:`Colegio / Escuela`},{value:`iglesia`,label:`Iglesia`},{value:`vecino`,label:`Un vecino`},{value:`otro`,label:`Otro`}]})}

      ${L({name:`municipio_residencia`,label:`Municipio de residencia`,type:`select`,value:e.municipio_residencia??``,error:t.municipio_residencia??``,required:!0,options:[{value:``,label:`Selecciona...`},{value:`punta_cana`,label:`Punta Cana`},{value:`bavaro`,label:`Bávaro`},{value:`veron`,label:`Verón`},{value:`friusa`,label:`Friusa`},{value:`el_cortecito`,label:`El Cortecito`},{value:`los_corales`,label:`Los Corales`},{value:`otro`,label:`Otro sector / municipio`}]})}

      <div id="sector-calle-block" style="${e.municipio_residencia===`otro`?``:`display:none`}">
        ${L({name:`sector_calle_numero`,label:`Sector, Calle y Número`,type:`text`,value:e.sector_calle_numero??``,error:t.sector_calle_numero??``,hint:`Ej: Sector Los Pinos, Calle 3, #14`})}
      </div>

      ${L({name:`direccion`,label:`Dirección completa`,type:`textarea`,value:e.direccion??``,error:t.direccion??``,required:!0})}
      ${L({name:`ubicacion_maps_url`,label:`Enlace de Google Maps (opcional)`,type:`text`,value:e.ubicacion_maps_url??``,error:t.ubicacion_maps_url??``,hint:`Copia el enlace desde Google Maps para la ubicación exacta del hogar`})}
    </form>

    <script>
    (function() {
      const fechaEl = document.querySelector('[name="fecha_nacimiento"]')
      const edadEl = document.getElementById('wiz-edad_display')
      const municipioEl = document.querySelector('[name="municipio_residencia"]')
      const sectorBlock = document.getElementById('sector-calle-block')

      if (fechaEl && edadEl) {
        fechaEl.addEventListener('change', function() {
          try {
            const y = parseInt(this.value.slice(0,4)), m = parseInt(this.value.slice(5,7))-1, d = parseInt(this.value.slice(8,10))
            const today = new Date()
            let age = today.getFullYear() - y
            if (today.getMonth() < m || (today.getMonth() === m && today.getDate() < d)) age--
            edadEl.value = age >= 0 ? age + ' años' : '—'
          } catch { edadEl.value = '—' }
        })
      }
      if (municipioEl && sectorBlock) {
        municipioEl.addEventListener('change', function() {
          sectorBlock.style.display = this.value === 'otro' ? '' : 'none'
        })
      }
    })()
    <\/script>`}function zo(e){return No(e)}function Bo(e){let t=e?.querySelector(`#wiz-form-step1`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{nombre_completo:t.querySelector(`[name="nombre_completo"]`)?.value?.trim()??``,fecha_nacimiento:t.querySelector(`[name="fecha_nacimiento"]`)?.value??``,sabe_leer:n(`sabe_leer`),sabe_escribir:n(`sabe_escribir`),nacionalidad:t.querySelector(`[name="nacionalidad"]`)?.value?.trim()??``,tiene_pasaporte:t.querySelector(`[name="tiene_pasaporte"]`)?.checked??!1,como_se_entero:t.querySelector(`[name="como_se_entero"]`)?.value??``,municipio_residencia:t.querySelector(`[name="municipio_residencia"]`)?.value??``,sector_calle_numero:t.querySelector(`[name="sector_calle_numero"]`)?.value?.trim()??``,direccion:t.querySelector(`[name="direccion"]`)?.value?.trim()??``,ubicacion_maps_url:t.querySelector(`[name="ubicacion_maps_url"]`)?.value?.trim()??``}}var Vo=e({getState:()=>Ko,id:()=>Ho,render:()=>Wo,title:()=>Uo,validate:()=>Go}),Ho=`step2`,Uo=`Datos de la Madre`;function Wo(e,t={}){return`
    <form id="wiz-form-step2" novalidate>
      <div class="alert alert-secondary py-2 mb-3">
        <i class="bi bi-person-heart me-1"></i>
        Ingresa los datos de la madre del alumno tal como aparecen en su documento de identidad.
        Si la madre no está en vida o no aplica, puedes dejar estos campos vacíos.
      </div>

      ${L({name:`madre_nombre`,label:`Nombre y apellido completo de la madre`,type:`text`,value:e.madre_nombre??``,error:t.madre_nombre??``,hint:`Tal como aparece en la cédula`})}
      ${L({name:`madre_cedula`,label:`Cédula / Pasaporte / Documento de identidad`,type:`text`,value:e.madre_cedula??``,error:t.madre_cedula??``,hint:`En su defecto, número de pasaporte o documento nacional`})}
      ${L({name:`madre_tlf_whatsapp`,label:`Número de WhatsApp de la madre`,type:`tel`,value:e.madre_tlf_whatsapp??``,error:t.madre_tlf_whatsapp??``,hint:`Número con código de país, Ej: +1 829 000 0000`})}
    </form>`}function Go(e){return{valid:!0,errors:{}}}function Ko(e){let t=e?.querySelector(`#wiz-form-step2`);return t?{madre_nombre:t.querySelector(`[name="madre_nombre"]`)?.value?.trim()??``,madre_cedula:t.querySelector(`[name="madre_cedula"]`)?.value?.trim()??``,madre_tlf_whatsapp:t.querySelector(`[name="madre_tlf_whatsapp"]`)?.value?.trim()??``}:{}}var qo=e({getState:()=>Qo,id:()=>Jo,render:()=>Xo,title:()=>Yo,validate:()=>Zo}),Jo=`step3`,Yo=`Datos del Padre`;function Xo(e,t={}){return`
    <form id="wiz-form-step3" novalidate>
      <div class="alert alert-secondary py-2 mb-3">
        <i class="bi bi-person-heart me-1"></i>
        Ingresa los datos del padre del alumno tal como aparecen en su documento de identidad.
        Si el padre no está en vida o no aplica, puedes dejar estos campos vacíos.
      </div>

      ${L({name:`padre_nombre`,label:`Nombre y apellido completo del padre`,type:`text`,value:e.padre_nombre??``,error:t.padre_nombre??``,hint:`Tal como aparece en la cédula`})}
      ${L({name:`padre_cedula`,label:`Cédula / Pasaporte / Documento de identidad`,type:`text`,value:e.padre_cedula??``,error:t.padre_cedula??``,hint:`En su defecto, número de pasaporte o documento nacional`})}
      ${L({name:`padre_tlf_whatsapp`,label:`Número de WhatsApp del padre`,type:`tel`,value:e.padre_tlf_whatsapp??``,error:t.padre_tlf_whatsapp??``,hint:`Número con código de país, Ej: +1 829 000 0000`})}
    </form>`}function Zo(e){return{valid:!0,errors:{}}}function Qo(e){let t=e?.querySelector(`#wiz-form-step3`);return t?{padre_nombre:t.querySelector(`[name="padre_nombre"]`)?.value?.trim()??``,padre_cedula:t.querySelector(`[name="padre_cedula"]`)?.value?.trim()??``,padre_tlf_whatsapp:t.querySelector(`[name="padre_tlf_whatsapp"]`)?.value?.trim()??``}:{}}var $o=e({getState:()=>is,id:()=>es,render:()=>ns,title:()=>ts,validate:()=>rs}),es=`step4`,ts=`Representante y Entorno`;function ns(e,t={}){let n=e.beneficiario_subsidio_estado===!0;return`
    <form id="wiz-form-step4" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-person-check me-1"></i>Representante oficial ante El Sistema PC</h6>
      ${L({name:`representante_nombre`,label:`Nombre y apellido completo`,type:`text`,value:e.representante_nombre??``,error:t.representante_nombre??``,required:!0,hint:`Tal como aparece en la cédula`})}
      <div class="row g-2">
        <div class="col-sm-6">
          ${L({name:`representante_parentesco`,label:`Parentesco con el alumno`,type:`text`,value:e.representante_parentesco??``,error:t.representante_parentesco??``,required:!0})}
        </div>
        <div class="col-sm-6">
          ${L({name:`representante_cedula`,label:`Cédula / Pasaporte`,type:`text`,value:e.representante_cedula??``,error:t.representante_cedula??``,required:!0})}
        </div>
      </div>
      ${L({name:`representante_tlf`,label:`Teléfono / WhatsApp del representante`,type:`tel`,value:e.representante_tlf??``,error:t.representante_tlf??``,required:!0})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-person-plus me-1"></i>Otro responsable (opcional)</h6>
      ${L({name:`otro_responsable_nombre`,label:`Nombre y apellido completo`,type:`text`,value:e.otro_responsable_nombre??``,error:t.otro_responsable_nombre??``,hint:`Tal como aparece en la cédula`})}
      <div class="row g-2">
        <div class="col-sm-6">
          ${L({name:`otro_responsable_cedula`,label:`Cédula / Pasaporte`,type:`text`,value:e.otro_responsable_cedula??``,error:t.otro_responsable_cedula??``})}
        </div>
        <div class="col-sm-6">
          ${L({name:`otro_responsable_tlf`,label:`Teléfono (si tiene)`,type:`tel`,value:e.otro_responsable_tlf??``,error:t.otro_responsable_tlf??``})}
        </div>
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-telephone-fill me-1"></i>Contactos de emergencia</h6>
      <div class="row g-2">
        <div class="col-sm-8">
          ${L({name:`contacto_emergencia_nombre`,label:`Contacto de emergencia #1`,type:`text`,value:e.contacto_emergencia_nombre??``})}
        </div>
        <div class="col-sm-4">
          ${L({name:`contacto_emergencia_telefono`,label:`Teléfono`,type:`tel`,value:e.contacto_emergencia_telefono??``})}
        </div>
      </div>
      <div class="row g-2">
        <div class="col-sm-8">
          ${L({name:`contacto_emergencia_2_nombre`,label:`Contacto de emergencia #2`,type:`text`,value:e.contacto_emergencia_2_nombre??``})}
        </div>
        <div class="col-sm-4">
          ${L({name:`contacto_emergencia_2_telefono`,label:`Teléfono`,type:`tel`,value:e.contacto_emergencia_2_telefono??``})}
        </div>
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-house-heart me-1"></i>Situación familiar y social</h6>

      ${L({name:`familia_monoparental`,label:`¿El alumno pertenece a una familia monoparental (sin padre o sin madre)?`,type:`radio`,value:e.familia_monoparental===!0?`true`:e.familia_monoparental===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      ${L({name:`beneficiario_subsidio_estado`,label:`¿Algún miembro del hogar es beneficiario de un subsidio del Estado?`,type:`radio`,value:n?`true`:e.beneficiario_subsidio_estado===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      <div id="subsidio-block" style="${n?``:`display:none`}">
        ${L({name:`subsidio_descripcion`,label:`¿Qué tipo de subsidio? (adjunte prueba de beneficio al momento de inscripción)`,type:`textarea`,value:e.subsidio_descripcion??``,hint:`Ej: Supérate, Progresando con Solidaridad, SIUBEN...`})}
      </div>

      ${L({name:`apoyo_actividades`,label:`¿De qué forma el hogar podría apoyar las actividades de El Sistema Punta Cana?`,type:`textarea`,value:e.apoyo_actividades??``,hint:`Ej: transporte, logística, voluntariado, donaciones, etc.`})}
    </form>

    <script>
    (function() {
      const subsidioRadios = document.querySelectorAll('[name="beneficiario_subsidio_estado"]')
      const subsidioBlock = document.getElementById('subsidio-block')
      subsidioRadios.forEach(function(r) {
        r.addEventListener('change', function() {
          if (subsidioBlock) subsidioBlock.style.display = this.value === 'true' ? '' : 'none'
        })
      })
    })()
    <\/script>`}function rs(e){let t={};return e.representante_nombre?.trim()||(t.representante_nombre=`Campo requerido`),e.representante_parentesco?.trim()||(t.representante_parentesco=`Campo requerido`),e.representante_cedula?.trim()||(t.representante_cedula=`Campo requerido`),e.representante_tlf?.trim()||(t.representante_tlf=`Campo requerido`),{valid:Object.keys(t).length===0,errors:t}}function is(e){let t=e?.querySelector(`#wiz-form-step4`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{representante_nombre:t.querySelector(`[name="representante_nombre"]`)?.value?.trim()??``,representante_parentesco:t.querySelector(`[name="representante_parentesco"]`)?.value?.trim()??``,representante_cedula:t.querySelector(`[name="representante_cedula"]`)?.value?.trim()??``,representante_tlf:t.querySelector(`[name="representante_tlf"]`)?.value?.trim()??``,otro_responsable_nombre:t.querySelector(`[name="otro_responsable_nombre"]`)?.value?.trim()??``,otro_responsable_cedula:t.querySelector(`[name="otro_responsable_cedula"]`)?.value?.trim()??``,otro_responsable_tlf:t.querySelector(`[name="otro_responsable_tlf"]`)?.value?.trim()??``,contacto_emergencia_nombre:t.querySelector(`[name="contacto_emergencia_nombre"]`)?.value?.trim()??``,contacto_emergencia_telefono:t.querySelector(`[name="contacto_emergencia_telefono"]`)?.value?.trim()??``,contacto_emergencia_2_nombre:t.querySelector(`[name="contacto_emergencia_2_nombre"]`)?.value?.trim()??``,contacto_emergencia_2_telefono:t.querySelector(`[name="contacto_emergencia_2_telefono"]`)?.value?.trim()??``,familia_monoparental:n(`familia_monoparental`),beneficiario_subsidio_estado:n(`beneficiario_subsidio_estado`),subsidio_descripcion:t.querySelector(`[name="subsidio_descripcion"]`)?.value?.trim()??``,apoyo_actividades:t.querySelector(`[name="apoyo_actividades"]`)?.value?.trim()??``}}var as=e({getState:()=>us,id:()=>os,render:()=>cs,title:()=>ss,validate:()=>ls}),os=`step7`,ss=`Compromisos`;function cs(e,t={}){return`
    <form id="wiz-form-step7" novalidate>

      <div class="card border-warning mb-4">
        <div class="card-body">
          <h6 class="card-title text-warning"><i class="bi bi-star-fill me-1"></i>Beca El Sistema Punta Cana</h6>
          <p class="card-text mb-1">Al inscribirse, el alumno recibe una <strong>beca por RD$4,500</strong> que cubre materiales y programa de formación.</p>
          <p class="card-text mb-1">El representante realizará un <strong>aporte mensual de RD$600</strong> para el sostenimiento del programa.</p>
          <p class="card-text small text-muted mb-0">La beca se mantiene siempre que el alumno demuestre <strong>rendimiento, interés y asistencia notable</strong>.</p>
        </div>
      </div>

      <div class="card border-primary mb-4">
        <div class="card-body">
          <h6 class="card-title text-primary"><i class="bi bi-music-note-list me-1"></i>Al completar la inscripción recibirás:</h6>
          <ul class="mb-0">
            <li>Ficha oficial del alumno (para la carpeta del programa)</li>
            <li>Constancia de inscripción en El Sistema Punta Cana</li>
            <li>Tarjeta de pago mensual</li>
            <li>Horario de clases asignado</li>
            <li>Lista de útiles: lápiz, cuaderno pentagramado, borrador, T-shirt de El Sistema PC</li>
          </ul>
          <p class="mt-2 mb-0 small text-muted">El pago inicial de <strong>RD$600</strong> se realiza en caja al momento de recibir estos materiales.</p>
        </div>
      </div>

      <h6 class="fw-semibold mb-3">Para confirmar la inscripción, debe aceptar los siguientes puntos:</h6>

      <div class="mb-3 p-3 bg-light rounded">
        ${L({name:`acepta_beca_4500`,label:`Estoy consciente de que el alumno recibe una beca de RD$4,500 y que solo pagaré RD$600 mensuales, siempre que el rendimiento, interés y asistencia sean notables.`,type:`checkbox`,value:e.acepta_beca_4500??!1,error:t.acepta_beca_4500??``})}
      </div>

      <div class="mb-3 p-3 bg-light rounded">
        ${L({name:`acepta_pago_600`,label:`Me comprometo a realizar el aporte mensual de RD$600 de manera responsable y puntual.`,type:`checkbox`,value:e.acepta_pago_600??!1,error:t.acepta_pago_600??``})}
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold mb-3"><i class="bi bi-camera me-1"></i>Autorización de imagen</h6>
      <div class="mb-3 p-3 bg-light rounded">
        ${L({name:`autoriza_fotos_redes`,label:`Autorizo a "El Sistema Punta Cana" a compartir por redes sociales y/o medios de comunicación fotos y videos donde pueda aparecer el rostro del alumno.`,type:`checkbox`,value:e.autoriza_fotos_redes??!1,error:t.autoriza_fotos_redes??``})}
      </div>

    </form>`}function ls(e){let t={};return e.acepta_beca_4500||(t.acepta_beca_4500=`Debe aceptar los términos de la beca para continuar`),e.acepta_pago_600||(t.acepta_pago_600=`Debe comprometerse con el aporte mensual para continuar`),{valid:Object.keys(t).length===0,errors:t}}function us(e){let t=e?.querySelector(`#wiz-form-step7`);return t?{acepta_beca_4500:t.querySelector(`[name="acepta_beca_4500"]`)?.checked??!1,acepta_pago_600:t.querySelector(`[name="acepta_pago_600"]`)?.checked??!1,autoriza_fotos_redes:t.querySelector(`[name="autoriza_fotos_redes"]`)?.checked??!1}:{}}var ds=e({getState:()=>gs,id:()=>fs,render:()=>ms,title:()=>ps,validate:()=>hs}),fs=`step5`,ps=`Perfil Musical`;function ms(e,t={}){let n=e.tiene_conocimientos_musicales===!0;return`
    <form id="wiz-form-step5" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-music-note-beamed me-1"></i>Conocimientos musicales</h6>

      ${L({name:`tiene_conocimientos_musicales`,label:`¿Has aprendido a tocar algún instrumento musical antes?`,type:`radio`,value:n?`true`:e.tiene_conocimientos_musicales===!1?`false`:``,error:t.tiene_conocimientos_musicales??``,required:!0,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      <div id="conocimientos-block" style="${n?``:`display:none`}">
        ${L({name:`instrumento_previo`,label:`¿Qué instrumento has tocado?`,type:`text`,value:e.instrumento_previo??``,error:t.instrumento_previo??``})}
        ${L({name:`nivel_lectura_musical`,label:`Nivel de lectura musical`,type:`select`,value:e.nivel_lectura_musical??``,error:t.nivel_lectura_musical??``,options:[{value:``,label:`Selecciona...`},{value:`basico`,label:`Básico — conozco pocas notas`},{value:`intermedio`,label:`Intermedio — leo partituras simples`},{value:`avanzado`,label:`Avanzado — leo con fluidez`}]})}
      </div>

      <div id="iniciacion-block" style="${n?`display:none`:``}">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-1"></i>
          <strong>Iniciación musical:</strong> El alumno recibirá una clase obligatoria de iniciación musical durante los primeros <strong>6 meses</strong>.
          A los 3 meses podrá audicionarse para avanzar al semestre completo del programa.
        </div>
      </div>

      ${L({name:`interes_musical`,label:`¿Qué te interesa aprender?`,type:`radio`,value:e.interes_musical??``,error:t.interes_musical??``,required:!0,options:[{value:`cantar`,label:`Cantar`},{value:`instrumento`,label:`Tocar un instrumento`},{value:`ambas`,label:`Ambas cosas`}]})}

      ${L({name:`instrumento_interes`,label:`¿Qué instrumento te gustaría tocar?`,type:`text`,value:e.instrumento_interes??``,error:t.instrumento_interes??``,hint:`Ej: violín, flauta, cello, piano, trompeta...`})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-heart-pulse me-1"></i>Tu relación con la música</h6>

      ${L({name:`sentimiento_musica_clasica`,label:`¿Qué sientes cuando escuchas música clásica?`,type:`textarea`,value:e.sentimiento_musica_clasica??``,hint:`Responde con tus propias palabras, no hay respuesta incorrecta`})}
      ${L({name:`sentimiento_aprender_instrumento`,label:`¿Cómo te sientes cuando piensas en aprender un instrumento?`,type:`textarea`,value:e.sentimiento_aprender_instrumento??``})}
      ${L({name:`aspiracion_instrumento`,label:`¿Qué te gustaría hacer si aprendes a tocar un instrumento?`,type:`textarea`,value:e.aspiracion_instrumento??``})}
      ${L({name:`musico_favorito`,label:`¿Tienes algún músico o cantante favorito?`,type:`text`,value:e.musico_favorito??``})}

      ${L({name:`preferencia_aprendizaje_musical`,label:`¿Cómo prefieres aprender música?`,type:`select`,value:e.preferencia_aprendizaje_musical??``,options:[{value:``,label:`Selecciona...`},{value:`individual`,label:`Clases individuales (uno a uno con el maestro)`},{value:`grupal`,label:`Clases en grupo`},{value:`ambas`,label:`Me es igual, ambas formas`},{value:`autodidacta`,label:`Prefiero aprender por mi cuenta también`}]})}

      ${L({name:`por_que_unirse`,label:`¿Por qué deseas formar parte de "El Sistema Punta Cana"?`,type:`textarea`,value:e.por_que_unirse??``,hint:`Cuéntanos tu motivación para unirte al programa`})}

    </form>

    <script>
    (function() {
      const radios = document.querySelectorAll('[name="tiene_conocimientos_musicales"]')
      const conocBlock = document.getElementById('conocimientos-block')
      const inicBlock = document.getElementById('iniciacion-block')
      radios.forEach(function(r) {
        r.addEventListener('change', function() {
          if (!conocBlock || !inicBlock) return
          if (this.value === 'true') {
            conocBlock.style.display = ''
            inicBlock.style.display = 'none'
          } else {
            conocBlock.style.display = 'none'
            inicBlock.style.display = ''
          }
        })
      })
    })()
    <\/script>`}function hs(e){let t={};return(e.tiene_conocimientos_musicales===void 0||e.tiene_conocimientos_musicales===null)&&(t.tiene_conocimientos_musicales=`Indica si tiene conocimientos musicales`),e.interes_musical||(t.interes_musical=`Indica el interés musical`),{valid:Object.keys(t).length===0,errors:t}}function gs(e){let t=e?.querySelector(`#wiz-form-step5`);return t?{tiene_conocimientos_musicales:(e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`})(`tiene_conocimientos_musicales`),instrumento_previo:t.querySelector(`[name="instrumento_previo"]`)?.value?.trim()??null,nivel_lectura_musical:t.querySelector(`[name="nivel_lectura_musical"]`)?.value||null,interes_musical:t.querySelector(`[name="interes_musical"]:checked`)?.value??``,instrumento_interes:t.querySelector(`[name="instrumento_interes"]`)?.value?.trim()??``,sentimiento_musica_clasica:t.querySelector(`[name="sentimiento_musica_clasica"]`)?.value?.trim()??``,sentimiento_aprender_instrumento:t.querySelector(`[name="sentimiento_aprender_instrumento"]`)?.value?.trim()??``,aspiracion_instrumento:t.querySelector(`[name="aspiracion_instrumento"]`)?.value?.trim()??``,musico_favorito:t.querySelector(`[name="musico_favorito"]`)?.value?.trim()??``,preferencia_aprendizaje_musical:t.querySelector(`[name="preferencia_aprendizaje_musical"]`)?.value??``,por_que_unirse:t.querySelector(`[name="por_que_unirse"]`)?.value?.trim()??``}:{}}var _s=e({getState:()=>Ss,id:()=>vs,render:()=>bs,title:()=>ys,validate:()=>xs}),vs=`step6`,ys=`Salud y Educación`;function bs(e,t={}){let n=e.tiene_alergias===!0,r=e.tiene_condicion_transmisible===!0,i=e.tiene_alergia_medicamento===!0;return`
    <form id="wiz-form-step6" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-heart-pulse me-1"></i>Información de salud</h6>

      ${L({name:`tiene_alergias`,label:`¿El alumno es alérgico a algo?`,type:`radio`,value:n?`true`:e.tiene_alergias===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="alergias-block" style="${n?``:`display:none`}">
        ${L({name:`alergias_descripcion`,label:`¿A qué es alérgico?`,type:`textarea`,value:e.alergias_descripcion??``})}
      </div>

      ${L({name:`tiene_condicion_transmisible`,label:`¿El alumno padece alguna condición médica transmisible?`,type:`radio`,value:r?`true`:e.tiene_condicion_transmisible===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="condicion-block" style="${r?``:`display:none`}">
        ${L({name:`condicion_transmisible_desc`,label:`¿Cuál condición?`,type:`textarea`,value:e.condicion_transmisible_desc??``})}
      </div>

      ${L({name:`tiene_alergia_medicamento`,label:`¿El alumno es alérgico a algún medicamento?`,type:`radio`,value:i?`true`:e.tiene_alergia_medicamento===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="med-block" style="${i?``:`display:none`}">
        ${L({name:`alergia_medicamento_desc`,label:`¿A qué medicamento?`,type:`textarea`,value:e.alergia_medicamento_desc??``})}
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-people me-1"></i>Socialización y conducta</h6>

      ${L({name:`impedimento_social`,label:`¿El alumno tiene alguna condición especial que le impida socializar?`,type:`radio`,value:e.impedimento_social===!0?`true`:e.impedimento_social===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      ${L({name:`problemas_conducta`,label:`¿Presenta problemas de conducta?`,type:`select`,value:e.problemas_conducta??``,error:t.problemas_conducta??``,options:[{value:``,label:`Selecciona...`},{value:`no`,label:`No presenta problemas`},{value:`pocas_veces`,label:`Pocas veces`},{value:`si`,label:`Sí`},{value:`violento`,label:`Presenta conducta violenta`}]})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-book me-1"></i>Datos escolares</h6>

      ${L({name:`centro_estudios`,label:`¿En dónde estudia actualmente?`,type:`text`,value:e.centro_estudios??``,error:t.centro_estudios??``,hint:`Nombre del colegio o escuela`})}
      ${L({name:`grado_nivel`,label:`Grado o nivel escolar`,type:`text`,value:e.grado_nivel??``,hint:`Ej: 4to grado primaria, 2do bachillerato...`})}

      ${L({name:`padres_en_vida`,label:`¿Los dos padres del alumno están en vida?`,type:`select`,value:e.padres_en_vida??``,error:t.padres_en_vida??``,options:[{value:``,label:`Selecciona...`},{value:`ambos`,label:`Sí, ambos`},{value:`solo_madre`,label:`Solo la madre`},{value:`solo_padre`,label:`Solo el padre`},{value:`ninguno`,label:`Ninguno`}]})}

    </form>

    <script>
    (function() {
      function toggle(radioName, blockId) {
        const radios = document.querySelectorAll('[name="' + radioName + '"]')
        const block = document.getElementById(blockId)
        if (!block) return
        radios.forEach(function(r) {
          r.addEventListener('change', function() {
            block.style.display = this.value === 'true' ? '' : 'none'
          })
        })
      }
      toggle('tiene_alergias', 'alergias-block')
      toggle('tiene_condicion_transmisible', 'condicion-block')
      toggle('tiene_alergia_medicamento', 'med-block')
    })()
    <\/script>`}function xs(e){return{valid:!0,errors:{}}}function Ss(e){let t=e?.querySelector(`#wiz-form-step6`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{tiene_alergias:n(`tiene_alergias`),alergias_descripcion:t.querySelector(`[name="alergias_descripcion"]`)?.value?.trim()??``,tiene_condicion_transmisible:n(`tiene_condicion_transmisible`),condicion_transmisible_desc:t.querySelector(`[name="condicion_transmisible_desc"]`)?.value?.trim()??``,tiene_alergia_medicamento:n(`tiene_alergia_medicamento`),alergia_medicamento_desc:t.querySelector(`[name="alergia_medicamento_desc"]`)?.value?.trim()??``,impedimento_social:n(`impedimento_social`),problemas_conducta:t.querySelector(`[name="problemas_conducta"]`)?.value??``,centro_estudios:t.querySelector(`[name="centro_estudios"]`)?.value?.trim()??``,grado_nivel:t.querySelector(`[name="grado_nivel"]`)?.value?.trim()??``,padres_en_vida:t.querySelector(`[name="padres_en_vida"]`)?.value??``}}var Cs=[Fo,Vo,qo,$o,as,ds,_s];async function ws(e){async function t(e){return await Qe(e)}Oo(e,Cs,t,5)}function Ts(e){let{porcentaje:t,nivel:n,camposFaltantes:r,porGrupo:i}=zr(e),a=Br[n],o=Vr[n];if(n===`completo`)return``;let s=Object.entries(i).filter(([,e])=>e.faltantes.length>0).map(([e,t])=>`
      <div class="mb-1">
        <span class="fw-semibold small text-body">${e}</span>
        <span class="text-muted small ms-1">(${t.completos}/${t.total})</span>
        <div class="small text-muted">${t.faltantes.join(`, `)}</div>
      </div>`).join(``);return`
    <div class="card border-${a} mb-3" id="completitud-banner">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-${a}">${o}</span>
              <span class="small fw-semibold">Perfil ${t}% completo</span>
              <span class="text-muted small">· ${r.length} campo(s) pendiente(s)</span>
              <button class="btn btn-link btn-sm p-0 ms-auto text-muted" id="btn-toggle-completitud">
                <i class="bi bi-chevron-down"></i> Ver detalle
              </button>
            </div>
            <div class="progress" style="height:6px">
              <div class="progress-bar bg-${a}" style="width:${t}%"></div>
            </div>
          </div>
        </div>
        <div id="completitud-detalle" class="mt-2 pt-2 border-top" style="display:none">
          ${s}
        </div>
      </div>
    </div>`}function Es(e){if(!e)return[];let t=String(e).match(/\d[\d\s\-\.]{6,}\d/g);return t?t.map(e=>e.replace(/[\s\-\.]/g,``)).filter(e=>e.length>=7):[e.trim()]}function R(e){return e==null||e===``?`<span class="text-muted fst-italic small">—</span>`:k(String(e))}function Ds(e){return e===!0||e===`true`||e===1||e===`1`?`Sí`:e===!1||e===`false`||e===0||e===`0`?`No`:`<span class="text-muted fst-italic small">—</span>`}function Os(e){if(!e)return`<span class="text-muted fst-italic small">—</span>`;let t=Es(e);if(t.length<=1){let t=Ce(e)||k(e),n=oe(e),r=n?` <a href="${k(n)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-0 ms-1" title="WhatsApp"><i class="bi bi-whatsapp"></i></a>`:``;return`<span>${k(t)}</span>${r}`}return t.map((e,t)=>{let n=Ce(e)||e,r=oe(e),i=r?`<a href="${k(r)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-0 ms-1" title="WhatsApp ${t+1}"><i class="bi bi-whatsapp"></i></a>`:``;return`<span class="me-2">${k(n)}${i}</span>`}).join(`<span class="text-muted mx-1">·</span>`)}var ks={personal:[{key:`nombre_completo`,label:`Nombre completo`},{key:`fecha_nacimiento`,label:`Fecha de nacimiento`,type:`date`},{key:`genero`,label:`Género`,type:`select`,options:[{v:``,l:`—`},{v:`M`,l:`Masculino`},{v:`F`,l:`Femenino`},{v:`O`,l:`Otro`}]},{key:`nacionalidad`,label:`Nacionalidad`},{key:`tiene_pasaporte`,label:`Tiene pasaporte`,type:`checkbox`},{key:`sabe_leer`,label:`Sabe leer`,type:`checkbox`},{key:`sabe_escribir`,label:`Sabe escribir`,type:`checkbox`},{key:`como_se_entero`,label:`Cómo se enteró`},{key:`municipio_residencia`,label:`Municipio`},{key:`sector_calle_numero`,label:`Sector / Calle / Número`},{key:`direccion`,label:`Dirección completa`,type:`textarea`},{key:`ubicacion_maps_url`,label:`URL Google Maps`},{key:`activo`,label:`Alumno activo`,type:`checkbox`}],madre:[{key:`madre_nombre`,label:`Nombre`},{key:`madre_cedula`,label:`Cédula`},{key:`madre_tlf_whatsapp`,label:`Teléfono / WhatsApp`,type:`phone`}],padre:[{key:`padre_nombre`,label:`Nombre`},{key:`padre_cedula`,label:`Cédula`},{key:`padre_tlf_whatsapp`,label:`Teléfono / WhatsApp`,type:`phone`}],representante:[{key:`representante_nombre`,label:`Nombre`},{key:`representante_parentesco`,label:`Parentesco`},{key:`representante_cedula`,label:`Cédula`},{key:`representante_tlf`,label:`Teléfono`,type:`phone`},{key:`correo_representante`,label:`Correo electrónico`},{key:`otro_responsable_nombre`,label:`Otro responsable — Nombre`},{key:`otro_responsable_cedula`,label:`Otro responsable — Cédula`},{key:`otro_responsable_tlf`,label:`Otro responsable — Teléfono`,type:`phone`},{key:`contacto_emergencia_nombre`,label:`Emergencia — Nombre`},{key:`contacto_emergencia_telefono`,label:`Emergencia — Teléfono`,type:`phone`},{key:`beneficiario_subsidio_estado`,label:`Beneficiario subsidio`,type:`checkbox`},{key:`subsidio_descripcion`,label:`Descripción subsidio`,type:`textarea`},{key:`apoyo_actividades`,label:`Apoyo en actividades`,type:`textarea`}],salud:[{key:`tiene_alergias`,label:`Tiene alergias`,type:`checkbox`},{key:`alergias_descripcion`,label:`Descripción alergias`,type:`textarea`},{key:`tiene_condicion_transmisible`,label:`Tiene condición transmisible`,type:`checkbox`},{key:`condicion_transmisible_desc`,label:`Descripción condición`,type:`textarea`},{key:`tiene_alergia_medicamento`,label:`Tiene alergia a medicamento`,type:`checkbox`},{key:`alergia_medicamento_desc`,label:`Descripción alergia medicamento`,type:`textarea`},{key:`impedimento_social`,label:`Impedimento social`,type:`checkbox`},{key:`problemas_conducta`,label:`Problemas de conducta`},{key:`centro_estudios`,label:`Centro de estudios`},{key:`grado_nivel`,label:`Grado / Nivel`},{key:`padres_en_vida`,label:`Padres en vida`}],musical:[{key:`instrumento_principal`,label:`Instrumento principal`},{key:`nivel_actual`,label:`Nivel actual`},{key:`tiene_conocimientos_musicales`,label:`Tiene conocimientos musicales`,type:`checkbox`},{key:`instrumento_previo`,label:`Instrumento previo`},{key:`nivel_lectura_musical`,label:`Nivel de lectura musical`},{key:`interes_musical`,label:`Interés musical`},{key:`instrumento_interes`,label:`Instrumento de interés`},{key:`sentimiento_musica_clasica`,label:`Sentimiento hacia música clásica`,type:`textarea`},{key:`sentimiento_aprender_instrumento`,label:`Sentimiento al aprender instrumento`,type:`textarea`},{key:`aspiracion_instrumento`,label:`Aspiración con el instrumento`,type:`textarea`},{key:`musico_favorito`,label:`Músico favorito`},{key:`preferencia_aprendizaje_musical`,label:`Preferencia de aprendizaje`,type:`textarea`},{key:`por_que_unirse`,label:`Por qué unirse`,type:`textarea`},{key:`autoriza_fotos_redes`,label:`Autoriza fotos en redes`,type:`checkbox`}]},As={personal:`Personal`,madre:`Madre`,padre:`Padre`,representante:`Representante`,salud:`Salud`,musical:`Musical`,clases:`Clases`,progreso:`Progreso`,asistencias:`Asistencias`};function js(e,t){let n=t[e.key];return e.type===`checkbox`?Ds(n):e.type===`phone`?Os(n):e.type===`date`?R(n?Hr(n):null):R(n)}function Ms(e,t){return e.map(e=>`
    <div class="row mb-2 align-items-start">
      <div class="col-5 col-md-4 text-muted small fw-semibold">${k(e.label)}</div>
      <div class="col-7 col-md-8">${js(e,t)}</div>
    </div>
  `).join(``)}function Ns(e,t){let n=t[e.key],r=`modal-field-${e.key}`;if(e.type===`checkbox`){let t=n===!0||n===`true`||n===1||n===`1`?`checked`:``;return`
      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="${r}" name="${k(e.key)}" ${t}>
        <label class="form-check-label" for="${r}">${k(e.label)}</label>
      </div>
    `}if(e.type===`textarea`)return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${k(e.label)}</label>
        <textarea class="form-control" id="${r}" name="${k(e.key)}" rows="3">${n==null?``:k(String(n))}</textarea>
      </div>
    `;if(e.type===`select`){let t=(e.options||[]).map(e=>`<option value="${k(e.v)}" ${n===e.v?`selected`:``}>${k(e.l)}</option>`).join(``);return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${k(e.label)}</label>
        <select class="form-select" id="${r}" name="${k(e.key)}">${t}</select>
      </div>
    `}if(e.type===`date`){let t=n?String(n).slice(0,10):``;return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${k(e.label)}</label>
        <input type="date" class="form-control" id="${r}" name="${k(e.key)}" value="${k(t)}">
      </div>
    `}return`
    <div class="mb-3">
      <label class="form-label fw-semibold" for="${r}">${k(e.label)}</label>
      <input type="text" class="form-control" id="${r}" name="${k(e.key)}" value="${n==null?``:k(String(n))}">
    </div>
  `}function Ps(e){if(!e)return`?`;let t=e.trim().split(/\s+/);return t.length===1?t[0][0].toUpperCase():(t[0][0]+t[t.length-1][0]).toUpperCase()}async function Fs(e,t={}){let n=t.alumnoId||t.id;if(!n){e.innerHTML=`<div class="alert alert-danger m-4">ID de alumno no especificado.</div>`;return}e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height:300px">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;let{data:r,error:i}=await _.from(`alumnos`).select(`*`).eq(`id`,n).single();if(i||!r){e.innerHTML=`<div class="alert alert-danger m-4">Error al cargar el alumno: ${k(i?.message||`No encontrado`)}</div>`;return}let{data:a}=await _.from(`alumnos_clases`).select(`clase_id, clases(id, nombre, dia, hora_inicio)`).eq(`alumno_id`,n).eq(`activo`,!0),o=(a||[]).map(e=>e.clases).filter(Boolean),s=!1,c=!1;function l(){let t=Ps(r.nombre_completo),n=Ur(r.fecha_nacimiento),i=r.activo?`<span class="badge bg-success">Activo</span>`:`<span class="badge bg-secondary">Inactivo</span>`,a=[`personal`,`madre`,`padre`,`representante`,`salud`,`musical`],s=[...a,`clases`,`progreso`,`asistencias`].map((e,t)=>`
      <li class="nav-item" role="presentation">
        <button
          class="nav-link${t===0?` active`:``}"
          id="tab-${e}"
          data-bs-toggle="tab"
          data-bs-target="#panel-${e}"
          type="button"
          role="tab"
          aria-controls="panel-${e}"
          aria-selected="${t===0}"
        >${k(As[e])}</button>
      </li>
    `).join(``);function c(e){let t=ks[e];return`
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold text-uppercase text-muted small mb-0">${k(As[e])}</h6>
          <button class="btn btn-sm btn-outline-primary" data-edit-section="${k(e)}">
            <i class="bi bi-pencil me-1"></i>Editar
          </button>
        </div>
        <div id="fields-${e}">
          ${Ms(t,r)}
        </div>
      `}let l=`
      ${a.map((e,t)=>`
        <div
          class="tab-pane fade${t===0?` show active`:``}"
          id="panel-${e}"
          role="tabpanel"
          aria-labelledby="tab-${e}"
        >
          <div class="p-3">
            ${c(e)}
          </div>
        </div>
      `).join(``)}

      <div class="tab-pane fade" id="panel-clases" role="tabpanel" aria-labelledby="tab-clases">
        <div class="p-3">
          <h6 class="fw-bold text-uppercase text-muted small mb-3">Clases inscritas</h6>
          ${o.length===0?`<p class="text-muted fst-italic">Sin clases activas.</p>`:`<div class="list-group">
                ${o.map(e=>`
                  <div class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="fw-semibold">${R(e.nombre)}</span>
                    <span class="text-muted small">${R(e.dia)} ${R(e.hora_inicio)}</span>
                  </div>
                `).join(``)}
              </div>`}
        </div>
      </div>

      <div class="tab-pane fade" id="panel-progreso" role="tabpanel" aria-labelledby="tab-progreso">
        <div class="p-3" id="progreso-content">
          <div class="text-muted fst-italic">Cargando progreso...</div>
        </div>
      </div>

      <div class="tab-pane fade" id="panel-asistencias" role="tabpanel" aria-labelledby="tab-asistencias">
        <div class="p-3" id="asistencias-content">
          <div class="text-muted fst-italic">Cargando asistencias...</div>
        </div>
      </div>
    `;e.innerHTML=`
      <div class="container-fluid py-3 px-3 px-md-4">

        <!-- Back -->
        <button class="btn btn-link text-decoration-none ps-0 mb-3" id="btn-back">
          <i class="bi bi-arrow-left me-1"></i>Volver a Alumnos
        </button>

        ${Ts(r)}

        <!-- Header card -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex flex-wrap gap-3 align-items-start justify-content-between">
              <div class="d-flex gap-3 align-items-center">
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                  style="width:64px;height:64px;font-size:1.4rem;background:var(--bs-primary,#0d6efd)"
                >${k(t)}</div>
                <div>
                  <h4 class="mb-1 fw-bold">${R(r.nombre_completo)}</h4>
                  <div class="d-flex flex-wrap gap-2 align-items-center">
                    ${i}
                    ${r.instrumento_principal?`<span class="badge bg-info text-dark">${R(r.instrumento_principal)}</span>`:``}
                    ${r.nivel_actual?`<span class="badge bg-light text-dark border">${R(r.nivel_actual)}</span>`:``}
                    ${n===null?``:`<span class="text-muted small">${k(String(n))} años</span>`}
                    ${r.created_at?`<span class="text-muted small">Inscrito: ${R(Hr(r.created_at))}</span>`:``}
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-outline-secondary btn-sm" id="btn-postulante">
                  <i class="bi bi-search me-1"></i>Buscar postulante
                </button>
                <button class="btn btn-outline-primary btn-sm" id="btn-ficha-pdf">
                  <i class="bi bi-file-earmark-pdf me-1"></i>Ficha PDF
                </button>
                <button class="btn btn-outline-success btn-sm" id="btn-constancia">
                  <i class="bi bi-file-earmark-text me-1"></i>Constancia
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Postulante panel slot -->
        <div id="postulante-panel"></div>

        <!-- Tabs -->
        <div class="card shadow-sm">
          <div class="card-header p-0">
            <ul class="nav nav-tabs border-0 flex-nowrap overflow-auto" role="tablist">
              ${s}
            </ul>
          </div>
          <div class="card-body p-0">
            <div class="tab-content">
              ${l}
            </div>
          </div>
        </div>

      </div>

      <!-- Edit modal -->
      <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editModalLabel">Editar sección</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body" id="editModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" id="btn-modal-save">
                <span id="modal-save-spinner" class="spinner-border spinner-border-sm d-none me-1" role="status"></span>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    `,m()}async function u(){if(s)return;s=!0;let e=document.getElementById(`progreso-content`);if(!e)return;let{data:t,error:r}=await _.from(`progresos`).select(`*`).eq(`alumno_id`,n).order(`fecha`,{ascending:!1});if(r){e.innerHTML=`<div class="alert alert-warning">Error al cargar progreso: ${k(r.message)}</div>`;return}if(!t||t.length===0){e.innerHTML=`<p class="text-muted fst-italic">Sin registros de progreso.</p>`;return}let i={};for(let e of t){let t=e.contenido_dsl||`Sin categoría`;i[t]||(i[t]=[]),i[t].push(e)}function a(e){if(!e)return`bg-secondary`;let t=e.toLowerCase();return t.includes(`excel`)||t.includes(`muy bien`)?`bg-success`:t.includes(`bien`)||t.includes(`regular`)?`bg-info text-dark`:t.includes(`mal`)||t.includes(`inici`)?`bg-warning text-dark`:`bg-secondary`}e.innerHTML=`
      <h6 class="fw-bold text-uppercase text-muted small mb-3">Progreso</h6>
      ${Object.entries(i).map(([e,t])=>`
        <div class="mb-4">
          <div class="fw-semibold mb-2 border-bottom pb-1">${R(e)}</div>
          <div class="list-group list-group-flush">
            ${t.map(e=>`
              <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-start">
                <div>
                  ${R(e.observaciones)}
                  ${e.fecha?`<div class="text-muted small mt-1">${R(Hr(e.fecha))}</div>`:``}
                </div>
                ${e.estado_cualitativo?`<span class="badge ${a(e.estado_cualitativo)} ms-2 flex-shrink-0">${R(e.estado_cualitativo)}</span>`:``}
              </div>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    `}async function d(){if(c)return;c=!0;let e=document.getElementById(`asistencias-content`);if(!e)return;let{data:t,error:r}=await _.from(`asistencias`).select(`*`).eq(`alumno_id`,n).order(`fecha`,{ascending:!1}).limit(30);if(r){e.innerHTML=`<div class="alert alert-warning">Error al cargar asistencias: ${k(r.message)}</div>`;return}if(!t||t.length===0){e.innerHTML=`<p class="text-muted fst-italic">Sin registros de asistencia.</p>`;return}let i=0,a=0,o=0;for(let e of t){let t=(e.estado||e.asistio||``).toString().toLowerCase();t===`true`||t===`presente`||t===`1`?i++:t===`justificado`||t===`justified`?o++:a++}let s=t.length,l=s>0?Math.round(i/s*100):0;function u(e){let t=(e.estado||e.asistio||``).toString().toLowerCase();return t===`true`||t===`presente`||t===`1`?`<span class="badge bg-success">Presente</span>`:t===`justificado`||t===`justified`?`<span class="badge bg-warning text-dark">Justificado</span>`:`<span class="badge bg-danger">Ausente</span>`}e.innerHTML=`
      <h6 class="fw-bold text-uppercase text-muted small mb-3">Asistencias (últimas 30)</h6>
      <div class="row g-2 mb-3">
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-success">${k(String(l))}%</div>
              <div class="small text-muted">Asistencia</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-success">${k(String(i))}</div>
              <div class="small text-muted">Presentes</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-danger">${k(String(a))}</div>
              <div class="small text-muted">Ausentes</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-warning">${k(String(o))}</div>
              <div class="small text-muted">Justificados</div>
            </div>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>`
              <tr>
                <td class="text-nowrap">${R(e.fecha?Hr(e.fecha):null)}</td>
                <td>${u(e)}</td>
                <td>${R(e.observaciones)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `}let f=null,p=null;function m(){document.getElementById(`btn-toggle-completitud`)?.addEventListener(`click`,e=>{let t=document.getElementById(`completitud-detalle`),n=e.currentTarget,r=t.style.display!==`none`;t.style.display=r?`none`:`block`,n.innerHTML=r?`<i class="bi bi-chevron-down"></i> Ver detalle`:`<i class="bi bi-chevron-up"></i> Ocultar`});let t=document.getElementById(`btn-back`);t&&t.addEventListener(`click`,()=>{window.router?.navigate?window.router.navigate(`alumnos`):history.back()});let n=document.getElementById(`btn-ficha-pdf`);n&&n.addEventListener(`click`,async()=>{try{n.disabled=!0,await Ca(r)}catch(e){console.error(`Error generando ficha PDF:`,e)}finally{n.disabled=!1}});let i=document.getElementById(`btn-constancia`);i&&i.addEventListener(`click`,async()=>{try{i.disabled=!0,await wa(r)}catch(e){console.error(`Error generando constancia:`,e)}finally{i.disabled=!1}});let a=document.getElementById(`btn-postulante`);a&&a.addEventListener(`click`,()=>Is(r,e));let o=document.getElementById(`tab-progreso`);o&&o.addEventListener(`shown.bs.tab`,u);let s=document.getElementById(`tab-asistencias`);s&&s.addEventListener(`shown.bs.tab`,d),document.querySelectorAll(`[data-edit-section]`).forEach(e=>{e.addEventListener(`click`,()=>{ee(e.getAttribute(`data-edit-section`))})});let c=document.getElementById(`btn-modal-save`);c&&c.addEventListener(`click`,te)}function ee(e){f=e;let t=ks[e],n=document.getElementById(`editModalBody`),i=document.getElementById(`editModalLabel`);i&&(i.textContent=`Editar — ${As[e]}`),n&&(n.innerHTML=`<form id="edit-form">${t.map(e=>Ns(e,r)).join(``)}</form>`);let a=document.getElementById(`editModal`);a&&(p||=new bootstrap.Modal(a),p.show())}async function te(){if(!f)return;let e=ks[f],t=document.getElementById(`modal-save-spinner`),i=document.getElementById(`btn-modal-save`);t&&t.classList.remove(`d-none`),i&&(i.disabled=!0);let a={};for(let t of e){let e=document.querySelector(`[name="${t.key}"]`);if(e)if(t.type===`checkbox`)a[t.key]=e.checked;else{let n=e.value.trim();a[t.key]=n===``?null:n}}let{error:o}=await _.from(`alumnos`).update(a).eq(`id`,n);if(t&&t.classList.add(`d-none`),i&&(i.disabled=!1),o){alert(`Error al guardar: ${o.message}`);return}Object.assign(r,a);let s=document.getElementById(`fields-${f}`);s&&(s.innerHTML=Ms(e,r)),p&&p.hide()}l()}async function Is(e,t){let n=t.querySelector(`#postulante-panel`);if(n){n.innerHTML=`
    <div class="card border-warning shadow-sm mb-4">
      <div class="card-body text-center py-3">
        <div class="spinner-border spinner-border-sm text-warning me-2"></div>
        <span class="small text-muted">Buscando en postulantes...</span>
      </div>
    </div>`;try{let t=await Ha(e.nombre_completo);if(!t||t.length===0){n.innerHTML=`
        <div class="alert alert-info d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-info-circle"></i>
          <span class="small">No se encontraron postulantes con el nombre <strong>${k(e.nombre_completo)}</strong>.</span>
          <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
        </div>`,n.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>n.innerHTML=``);return}let r=t[0],i=[`madre_nombre`,`madre_cedula`,`madre_tlf_whatsapp`,`padre_nombre`,`padre_cedula`,`padre_tlf_whatsapp`,`representante_nombre`,`representante_parentesco`,`representante_tlf`,`representante_cedula`,`correo_representante`,`municipio_residencia`,`sector_calle_numero`,`direccion`,`nacionalidad`,`centro_estudios`,`grado_nivel`,`instrumento_interes`,`como_se_entero`,`ubicacion_maps_url`],a=i.filter(t=>{let n=e[t],i=r[t];return(!n||n===``)&&i&&i!==``}),o=i.map(t=>{let n=e[t],i=r[t],a=i&&i!==``,o=n&&n!==``;return a?`<tr class="${o?``:`table-warning`}">
        <td class="small fw-semibold">${k(t.replace(/_/g,` `))}</td>
        <td class="small">${k(String(i))}</td>
        <td class="small text-muted">${o?k(String(n)):`<em>vacío</em>`}</td>
        <td class="text-center">${o?``:`<i class="bi bi-arrow-left-circle text-warning"></i>`}</td>
      </tr>`:``}).filter(Boolean).join(``);n.innerHTML=`
      <div class="card border-warning shadow-sm mb-4">
        <div class="card-header d-flex align-items-center gap-2 bg-warning bg-opacity-10">
          <i class="bi bi-person-check text-warning fs-5"></i>
          <div class="flex-grow-1">
            <div class="fw-bold small">Postulante encontrado: ${k(r.nombre_completo||``)}</div>
            <div class="text-muted" style="font-size:0.72rem">Estado: ${k(r.estado||`—`)} · ID: ${k(r.id||``)}</div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" id="btn-close-panel"><i class="bi bi-x"></i></button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr>
                  <th class="small">Campo</th>
                  <th class="small">En postulante</th>
                  <th class="small">En alumno</th>
                  <th class="small text-center">Nuevo</th>
                </tr>
              </thead>
              <tbody>${o||`<tr><td colspan="4" class="text-center text-muted small py-3">Todos los datos ya están cargados en el alumno.</td></tr>`}</tbody>
            </table>
          </div>
        </div>
        ${a.length>0?`
        <div class="card-footer d-flex justify-content-between align-items-center">
          <span class="small text-muted"><i class="bi bi-arrow-left-circle text-warning me-1"></i>${a.length} campo(s) nuevo(s) disponibles</span>
          <button class="btn btn-sm btn-warning" id="btn-precargar">
            <i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes
          </button>
        </div>`:``}
      </div>`,n.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>n.innerHTML=``),n.querySelector(`#btn-precargar`)?.addEventListener(`click`,async()=>{let t=n.querySelector(`#btn-precargar`);t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;try{let t={};a.forEach(e=>{r[e]&&(t[e]=r[e])});let{error:i}=await _.from(`alumnos`).update(t).eq(`id`,e.id);if(i)throw i;Object.assign(e,t),n.innerHTML=`
          <div class="alert alert-success d-flex align-items-center gap-2 mb-4">
            <i class="bi bi-check-circle-fill"></i>
            <span class="small">${a.length} campo(s) precargados correctamente desde postulante. Recargá los tabs para ver los cambios.</span>
            <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel2"><i class="bi bi-x"></i></button>
          </div>`,n.querySelector(`#btn-close-panel2`)?.addEventListener(`click`,()=>n.innerHTML=``)}catch(e){t.disabled=!1,t.innerHTML=`<i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes`,n.insertAdjacentHTML(`beforeend`,`
          <div class="alert alert-danger small mt-2">Error al guardar: ${k(e.message)}</div>`)}})}catch(e){n.innerHTML=`
      <div class="alert alert-danger d-flex align-items-center gap-2 mb-4">
        <i class="bi bi-exclamation-triangle"></i>
        <span class="small">Error al buscar postulante: ${k(e.message)}</span>
        <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
      </div>`,n.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>n.innerHTML=``)}}}async function Ls(e){e.innerHTML=`
    <div class="container py-4" style="max-width:720px">
      <div class="mb-4">
        <h4 class="mb-1"><i class="bi bi-file-earmark-pdf text-danger me-2"></i>Vista previa de documentos PDF</h4>
        <p class="text-muted small mb-0">Generá los PDFs de inscripción con datos de ejemplo para revisar el diseño antes de usarlos en producción.</p>
      </div>

      <div class="row g-3">

        <!-- Ficha técnica -->
        <div class="col-md-6">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">
              <div class="mb-3">
                <span class="badge bg-primary mb-2">Uso interno</span>
                <h5 class="card-title mb-1">Ficha Técnica del Alumno</h5>
                <p class="card-text text-muted small">
                  Documento completo para carpeta física y Google Drive.
                  Incluye todos los datos del alumno: personales, familia, salud, perfil musical, compromisos y firmas.
                </p>
              </div>
              <ul class="list-unstyled small text-muted mb-4">
                <li><i class="bi bi-check2 text-success me-1"></i>Datos personales y de contacto</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Madre, padre y representante</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Situación social y salud</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Perfil y motivación musical</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Compromisos y firmas</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Watermark "USO INTERNO"</li>
              </ul>
              <button id="btn-demo-ficha" class="btn btn-primary mt-auto">
                <i class="bi bi-download me-2"></i>Descargar ficha demo
              </button>
            </div>
          </div>
        </div>

        <!-- Constancia -->
        <div class="col-md-6">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">
              <div class="mb-3">
                <span class="badge bg-success mb-2">Para el representante</span>
                <h5 class="card-title mb-1">Constancia de Inscripción</h5>
                <p class="card-text text-muted small">
                  Carta formal que recibe el representante al inscribir al alumno.
                  Incluye horario, lista de útiles, pago y links institucionales.
                </p>
              </div>
              <ul class="list-unstyled small text-muted mb-4">
                <li><i class="bi bi-check2 text-success me-1"></i>Carta formal con serial único</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Lista de materiales a retirar</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Pago RD$600 destacado</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Links: horario, reglamento, bienvenida</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Firmas director y representante</li>
                <li><i class="bi bi-check2 text-success me-1"></i>Sello ORIGINAL</li>
              </ul>
              <button id="btn-demo-constancia" class="btn btn-success mt-auto">
                <i class="bi bi-download me-2"></i>Descargar constancia demo
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Datos del alumno demo -->
      <div class="card mt-4 border-0 bg-body-secondary">
        <div class="card-body">
          <h6 class="mb-3 text-muted"><i class="bi bi-person-badge me-2"></i>Datos del alumno de ejemplo</h6>
          <div class="row row-cols-2 row-cols-md-3 g-2 small">
            <div><span class="text-muted">Nombre:</span><br><strong>${ia.nombre_completo}</strong></div>
            <div><span class="text-muted">Nacimiento:</span><br><strong>${ia.fecha_nacimiento}</strong></div>
            <div><span class="text-muted">Instrumento:</span><br><strong>${ia.instrumento_principal}</strong></div>
            <div><span class="text-muted">Representante:</span><br><strong>${ia.representante_nombre}</strong></div>
            <div><span class="text-muted">Municipio:</span><br><strong>${ia.municipio_residencia}</strong></div>
            <div><span class="text-muted">Centro estudios:</span><br><strong>${ia.centro_estudios}</strong></div>
          </div>
          <p class="text-muted small mb-0 mt-3">
            <i class="bi bi-info-circle me-1"></i>
            Los PDFs reales se generan con los datos del alumno inscripto. Estos son sólo para previsualizar el diseño.
          </p>
        </div>
      </div>
    </div>`,e.querySelector(`#btn-demo-ficha`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`;try{await Ta()}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-download me-2"></i>Descargar ficha demo`}}),e.querySelector(`#btn-demo-constancia`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`;try{await Ea()}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-download me-2"></i>Descargar constancia demo`}})}var Rs=[0,86,179],zs=[255,193,7],Bs=[30,30,30];function Vs(e){return[e.nombre_completo,e.madre_nombre,e.padre_nombre,e.representante_nombre].map(e=>(e??``).trim()).find(e=>e.length>0)??`Sin nombre registrado`}function Hs(e){let t=[];return e.madre_nombre&&e.madre_nombre.trim()&&t.push(`Madre: ${e.madre_nombre.trim()}`),e.padre_nombre&&e.padre_nombre.trim()&&t.push(`Padre: ${e.padre_nombre.trim()}`),e.representante_nombre&&e.representante_nombre.trim()&&t.push(`Rep: ${e.representante_nombre.trim()}`),t.length>0?t.join(`
`):`—`}function Us(e){let t=[];return e.telefono_alumno&&e.telefono_alumno.trim()&&t.push(`Al: ${e.telefono_alumno.trim()}`),e.madre_tlf_whatsapp&&e.madre_tlf_whatsapp.trim()&&t.push(`Ma: ${e.madre_tlf_whatsapp.trim()}`),e.padre_tlf_whatsapp&&e.padre_tlf_whatsapp.trim()&&t.push(`Pa: ${e.padre_tlf_whatsapp.trim()}`),t.length>0?t.join(`
`):`—`}function Ws(e,t,n){let r=e.internal.pageSize.getWidth();e.setFillColor(...Rs),e.rect(0,0,r,26,`F`),e.setFillColor(...zs),e.rect(0,26,r,2,`F`),e.setTextColor(255,255,255),e.setFontSize(14),e.setFont(`helvetica`,`bold`),e.text(`El Sistema Punta Cana`,14,10),e.setFontSize(10),e.setFont(`helvetica`,`normal`),e.text(t,14,18),e.setFontSize(7.5),e.text(n,14,24),e.setTextColor(...Bs)}function Gs(e,t,n){let r=e.internal.pageSize.getWidth(),i=e.internal.pageSize.getHeight();e.setFillColor(...Rs),e.rect(0,i-8,r,8,`F`),e.setTextColor(255,255,255),e.setFontSize(6.5);let a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});e.text(`El Sistema Punta Cana — Generado: ${a}`,10,i-3),e.text(`Página ${t} de ${n}`,r-10,i-3,{align:`right`})}function Ks(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return`—`}}function qs(e,t,n){let r=new nt({orientation:`landscape`,unit:`mm`,format:`letter`});Ws(r,`LISTADO DE POSTULADOS`,`Rango: ${`${Ks(t)} — ${Ks(n)}`} · Generado: ${new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})} · Total: ${e.length}`),rt(r,{startY:36,margin:{left:8,right:8},theme:`striped`,head:[[`#`,`Nombre del interesado`,`Padres / Representante`,`Teléfonos`,`Correo`,`Fecha`,`Estado`]],body:e.map((e,t)=>[t+1,Vs(e),Hs(e),Us(e),e.correo||`—`,Ks(e.fecha_postulacion||e.created_at),Oa[e.estado||`postulado`]||e.estado||`—`]),headStyles:{fillColor:Rs,textColor:255,fontStyle:`bold`,fontSize:7.5},bodyStyles:{fontSize:7,cellPadding:1.5},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:8,halign:`center`},1:{cellWidth:48},2:{cellWidth:48},3:{cellWidth:40},4:{cellWidth:50},5:{cellWidth:22,halign:`center`},6:{cellWidth:20,halign:`center`}},didDrawPage:e=>{let t=r.internal.getNumberOfPages();Gs(r,e.pageNumber,t)}});let i=r.internal.getNumberOfPages();for(let e=1;e<=i;e++)r.setPage(e),Gs(r,e,i);return r}function Js(e,t,n){qs(e,t,n).save(`postulados-${t}-${n}.pdf`)}function Ys(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-01`}function Xs(){let e=new Date,t=new Date(e.getFullYear(),e.getMonth()+1,0);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}var z={year:new Date().getFullYear(),month:new Date().getMonth()+1,postulantes:[],filtroEstado:`todos`,cargando:!1,page:1,limit:50,pdfDesde:Ys(),pdfHasta:Xs()},Zs=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],Qs=/\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|extracu|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i;function $s(e){if(!e||e.length===0)return!1;let t=e.trim();return!(t.length>70||t.includes(`,`)||t.split(/\s+/).length>5||Qs.test(t)||!/[A-ZÁÉÍÓÚÑ]/.test(t)||t.length<4)}function ec(e){return[e.nombre_completo,e.madre_nombre,e.padre_nombre,e.representante_nombre].map(e=>(e??``).trim()).find(e=>$s(e))??`Sin nombre registrado`}function tc(e){return[{persona:e.madre_nombre,numero:e.madre_tlf_whatsapp,rol:`Madre`},{persona:e.padre_nombre,numero:e.padre_tlf_whatsapp,rol:`Padre`},{persona:e.representante_nombre,numero:e.representante_tlf||e.telefono_representante,rol:`Representante`},{persona:null,numero:e.telefono_alumno,rol:`Alumno`}].filter(({numero:e})=>{let t=(e??``).trim();return t.length>=7&&!/^(sin definir|no tiene|n\/a)$/i.test(t)}).map(({persona:e,numero:t,rol:n})=>({rol:n,nombre:$s(e??``)?e.trim():null,numero:t.trim()}))}function nc(e){return tc(e)[0]?.numero??null}function rc(e){let t=e.replace(/\D/g,``);return t.length===10?`${t.slice(0,3)}-${t.slice(3,6)}-${t.slice(6)}`:e}async function ic(e){z.filtroEstado=`todos`,z.page=1,await ac(e)}async function ac(e){try{z.cargando=!0,oc(e),z.postulantes=(await vo(z.year,z.month)).filter(e=>nc(e)!==null),z.cargando=!1,lc(e)}catch(t){z.cargando=!1,sc(e,t.message)}}function oc(e){e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Módulo de Postulados</h1>
          <p class="text-secondary mb-0">Gestión de admisiones y pipeline de postulaciones</p>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-muted mt-2">Cargando postulados...</p>
        </div>
      </div>
    </div>
  `}function sc(e,t){e.innerHTML=`
    <div class="container py-5">
      <div class="alert alert-danger shadow-sm border-0 d-flex flex-column align-items-center p-4 rounded-3 text-center" role="alert">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3"></i>
        <h4 class="alert-heading fw-bold">Hubo un problema al cargar los datos</h4>
        <p class="mb-4">${t}</p>
        <button class="btn btn-primary" id="btn-error-retry">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>
    </div>
  `,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>ic(e))}function cc(e,t){return t===0?``:`
    <div class="mb-4 mt-2 px-1 small tracking-wide">
      ${[{key:`postulado`,label:`Postulados`},{key:`contactado`,label:`Contactados`},{key:`cita_agendada`,label:`Con Cita`},{key:`documentos_ok`,label:`Docs OK`},{key:`inscrito`,label:`Inscritos`}].map(t=>{let n=e[t.key]||0;return n>0?`<span class="text-body-secondary fw-medium">${n}</span> <span class="text-muted">${t.label}</span>`:null}).filter(Boolean).join(`<span class="text-muted mx-2">/</span>`)}
    </div>
  `}function lc(e){let t=uc();t.sort((e,t)=>{let n=new Date(e.fecha_postulacion||e.created_at);return new Date(t.fecha_postulacion||t.created_at)-n});let n=t.length,r=Math.ceil(n/z.limit)||1;z.page>r&&(z.page=r),z.page<1&&(z.page=1);let i=(z.page-1)*z.limit,a=Math.min(i+z.limit,n),o=t.slice(i,a),s=dc();e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4 max-w-7xl mx-auto">
      
      <!-- MINIMALIST HEADER -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-1 gap-3">
        <div>
          <h1 class="h2 fw-bold text-body tracking-tight mb-0">Postulados</h1>
        </div>
        
        <div class="d-flex align-items-center gap-4">
          <div class="d-flex align-items-center">
            <button class="btn btn-link text-body-secondary p-1 text-decoration-none" id="btn-month-prev">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="fw-semibold text-body mx-3 fs-6">
              ${Zs[z.month-1]} ${z.year}
            </span>
            <button class="btn btn-link text-body-secondary p-1 text-decoration-none" id="btn-month-next">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          
          <button class="btn btn-link text-decoration-none text-primary fw-medium p-0" id="btn-sync">
            <span class="spinner-border spinner-border-sm d-none me-1" id="sync-spinner"></span>
            <i class="bi bi-arrow-repeat me-1" id="sync-icon"></i> Sincronizar
          </button>
        </div>
      </div>

      <!-- DATE RANGE + PDF DOWNLOAD -->
      <div class="d-flex flex-wrap align-items-center gap-3 mb-2">
        <div class="d-flex align-items-center gap-2">
          <label for="pdf-desde" class="form-label small text-body-secondary mb-0">Desde</label>
          <input type="date" class="form-control form-control-sm" id="pdf-desde" value="${z.pdfDesde}">
        </div>
        <div class="d-flex align-items-center gap-2">
          <label for="pdf-hasta" class="form-label small text-body-secondary mb-0">Hasta</label>
          <input type="date" class="form-control form-control-sm" id="pdf-hasta" value="${z.pdfHasta}">
        </div>
        <button class="btn btn-outline-primary btn-sm" id="btn-descargar-pdf">
          <span class="spinner-border spinner-border-sm d-none me-1" id="pdf-spinner"></span>
          <i class="bi bi-file-earmark-pdf me-1" id="pdf-icon"></i> Descargar PDF
        </button>
      </div>

      <!-- PIPELINE SUMMARY -->
      ${cc(s,z.postulantes.length)}

      <!-- MINIMALIST TABS -->
      <div class="d-flex gap-4 overflow-x-auto border-bottom border-secondary-subtle mb-4 scrollbar-hidden" style="white-space: nowrap;">
        <button class="btn btn-link px-1 pb-2 text-decoration-none rounded-0 border-0 ${z.filtroEstado===`todos`?`text-body fw-bold border-bottom border-primary border-2`:`text-body-secondary`}" data-filter="todos">
          Todos <span class="ms-1 small text-body-secondary">${z.postulantes.length}</span>
        </button>
        ${Object.entries(Oa).map(([e,t])=>{let n=s[e]||0;return n===0&&z.filtroEstado!==e?``:`
            <button class="btn btn-link px-1 pb-2 text-decoration-none rounded-0 border-0 ${z.filtroEstado===e?`text-body fw-bold border-bottom border-primary border-2`:`text-body-secondary`}" data-filter="${e}">
              ${t} <span class="ms-1 small text-body-secondary">${n}</span>
            </button>
          `}).join(``)}
      </div>

      <!-- MAIN CONTENT AREA -->
      <div class="bg-transparent">
        ${o.length===0?fc():pc(o)}
        
        <!-- MINIMALIST PAGINATION -->
        ${n>0?`
          <div class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top border-secondary-subtle">
            <span class="text-body-secondary small">
              ${i+1}-${a} de ${n}
            </span>
            <div class="d-flex gap-3">
              <button class="btn btn-link text-decoration-none text-body p-0 ${z.page===1?`opacity-25`:``}" id="btn-page-prev" ${z.page===1?`disabled`:``}>
                <i class="bi bi-arrow-left"></i> Anterior
              </button>
              <button class="btn btn-link text-decoration-none text-body p-0 ${z.page===r?`opacity-25`:``}" id="btn-page-next" ${z.page===r?`disabled`:``}>
                Siguiente <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        `:``}
      </div>
  `,mc(e)}function uc(){return z.filtroEstado===`todos`?[...z.postulantes]:z.postulantes.filter(e=>e.estado===z.filtroEstado)}function dc(){let e={};return Object.keys(Oa).forEach(t=>e[t]=0),z.postulantes.forEach(t=>{let n=t.estado||`postulado`;e[n]!==void 0&&e[n]++}),e}function fc(){return`
    <div class="text-center py-5 my-5">
      <h5 class="text-body-secondary fw-normal">No hay postulantes</h5>
    </div>
  `}function pc(e){return`
    <div class="w-100">
      <!-- VISTA ESCRITORIO -->
      <div class="d-none d-md-block table-responsive">
        <table class="table align-middle mb-0 border-transparent">
          <thead>
            <tr>
              <th class="border-bottom border-secondary-subtle text-body-secondary fw-normal small pb-3">Postulante</th>
              <th class="border-bottom border-secondary-subtle text-body-secondary fw-normal small pb-3">Contacto</th>
              <th class="border-bottom border-secondary-subtle text-body-secondary fw-normal small pb-3">Fecha</th>
              <th class="border-bottom border-secondary-subtle text-end pe-2 fw-normal small pb-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(e=>{let t=tc(e).map(({rol:e,nombre:t,numero:n})=>{let r=`https://wa.me/${n.replace(/\D/g,``)}?text=Hola%2C%20le%20contactamos%20de%20El%20Sistema%20Punta%20Cana.`,i=t?`${t} (${e})`:e;return`<a href="${r}" target="_blank" rel="noopener" class="d-flex align-items-center gap-2 text-decoration-none text-body mb-1" title="${i}">
        <i class="bi bi-whatsapp text-success small"></i>
        <span class="small">${rc(n)}</span>
        <span class="text-body-secondary small fw-light">· ${i}</span>
      </a>`}).join(``),n=e.fecha_postulacion||e.created_at,r=n?new Date(n).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):`-`,i=ka[e.estado||`postulado`],a=Oa[e.estado||`postulado`];return`
      <tr class="cursor-pointer" data-id="${e.id}">
        <td class="py-3">
          <div class="fw-medium text-body">${ec(e)}</div>
          ${a?`
          <div class="d-flex align-items-center gap-1 mt-1">
            <i class="bi bi-circle-fill text-${i}" style="font-size: 8px;"></i>
            <span class="text-body-secondary small">${a}</span>
          </div>
          `:``}
        </td>
        <td class="py-3 align-middle">
          <div class="d-flex flex-column justify-content-center">${t}</div>
        </td>
        <td class="text-body-secondary small py-3 align-middle">${r}</td>
        <td class="text-end pe-2 py-3 align-middle">
          <button class="btn btn-link text-body-secondary p-0 hover-danger btn-delete-postulante" data-id="${e.id}" data-name="${ec(e)}" title="Eliminar">
            <i class="bi bi-x-lg"></i>
          </button>
        </td>
      </tr>
    `}).join(``)}
          </tbody>
        </table>
      </div>

      <!-- VISTA MÓVIL (Lista limpia) -->
      <div class="d-block d-md-none">
        ${e.map(e=>{let t=tc(e).map(({rol:e,nombre:t,numero:n})=>`<a href="${`https://wa.me/${n.replace(/\D/g,``)}?text=Hola%2C%20le%20contactamos%20de%20El%20Sistema%20Punta%20Cana.`}" target="_blank" rel="noopener" class="text-decoration-none text-body me-3 mb-2 d-inline-flex align-items-center gap-1">
        <i class="bi bi-whatsapp text-success"></i> <span class="small fw-medium">${rc(n)}</span>
      </a>`).join(``),n=e.fecha_postulacion||e.created_at,r=n?new Date(n).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}):`-`,i=ka[e.estado||`postulado`],a=Oa[e.estado||`postulado`];return`
      <div class="border-bottom border-secondary-subtle py-3 cursor-pointer" data-id="${e.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-semibold text-body fs-6">${ec(e)}</div>
            ${a?`
            <div class="d-flex align-items-center gap-1 mt-1">
              <i class="bi bi-circle-fill text-${i}" style="font-size: 8px;"></i>
              <span class="text-body-secondary small">${a}</span>
            </div>
            `:``}
          </div>
          <div class="text-end">
            <span class="text-body-secondary small d-block mb-1">${r}</span>
          </div>
        </div>
        <div class="mt-2">
          ${t}
        </div>
      </div>
    `}).join(``)}
      </div>
    </div>
  `}function mc(e){e.querySelectorAll(`.btn-wa-link`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation()})}),document.getElementById(`btn-month-prev`)?.addEventListener(`click`,()=>{z.month--,z.month<1&&(z.month=12,z.year--),z.page=1,ac(e)}),document.getElementById(`btn-month-next`)?.addEventListener(`click`,()=>{z.month++,z.month>12&&(z.month=1,z.year++),z.page=1,ac(e)}),document.getElementById(`btn-sync`)?.addEventListener(`click`,async()=>{let t=document.getElementById(`btn-sync`),n=document.getElementById(`sync-spinner`),r=document.getElementById(`sync-icon`);try{t.disabled=!0,n.classList.remove(`d-none`),r.classList.add(`d-none`);let i=await ho();alert(`Sincronización exitosa. Registros procesados: ${i.total_rows||i.upserted||0}`),z.page=1,ac(e)}catch(e){alert(`Error al sincronizar: ${e.message}`),t.disabled=!1,n.classList.add(`d-none`),r.classList.remove(`d-none`)}}),e.querySelectorAll(`[data-filter]`).forEach(t=>{t.addEventListener(`click`,t=>{z.filtroEstado=t.currentTarget.getAttribute(`data-filter`),z.page=1,lc(e)})}),e.querySelectorAll(`.hover-table-row`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.getAttribute(`data-id`);S.navigate(`postulado`,{id:t})})}),e.querySelectorAll(`.btn-delete-postulante`).forEach(t=>{t.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget,r=n.getAttribute(`data-id`),i=n.getAttribute(`data-name`);if(confirm(`¿Estás seguro de que deseas eliminar permanentemente la postulación de "${i}"?\n\nEsta acción eliminará el registro de la base de datos de forma irreversible.`))try{n.disabled=!0,await Co(r),alert(`Postulación eliminada con éxito`),ac(e)}catch(e){alert(`Error al eliminar: ${e.message}`),n.disabled=!1}})}),document.getElementById(`btn-descargar-pdf`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`pdf-desde`)?.value,t=document.getElementById(`pdf-hasta`)?.value,n=document.getElementById(`btn-descargar-pdf`),r=document.getElementById(`pdf-spinner`),i=document.getElementById(`pdf-icon`);if(!e||!t){alert(`Debe seleccionar una fecha de inicio y una fecha de fin.`);return}if(e>t){alert(`La fecha "Desde" no puede ser posterior a la fecha "Hasta".`);return}try{n.disabled=!0,r.classList.remove(`d-none`),i.classList.add(`d-none`);let a=await yo(e,t);if(!a||a.length===0){alert(`No hay postulados registrados en el rango de fechas seleccionado.`);return}Js(a,e,t)}catch(e){alert(`Error al generar el PDF: ${e.message}`)}finally{n.disabled=!1,r.classList.add(`d-none`),i.classList.remove(`d-none`)}}),document.getElementById(`btn-page-prev`)?.addEventListener(`click`,()=>{z.page>1&&(z.page--,lc(e))}),document.getElementById(`btn-page-next`)?.addEventListener(`click`,()=>{z.page++,lc(e)})}var hc=/\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i,gc=[{id:`cedula_rep`,label:`Cédula del representante`},{id:`partida`,label:`Partida de nacimiento`},{id:`constancia`,label:`Constancia escolar`},{id:`foto`,label:`Foto del alumno`},{id:`docs_medicos`,label:`Documentos médicos (si aplica)`}],_c=[{id:`postulado`,label:`Postulado`,num:1},{id:`contactado`,label:`Contactado`,num:2},{id:`cita_agendada`,label:`Cita agendada`,num:3},{id:`documentos_ok`,label:`Documentos OK`,num:4},{id:`inscrito`,label:`Inscrito`,num:5}],B={postulante:null,cargando:!1};function vc(e){if(!e)return!1;let t=e.trim();return t.length>=4&&t.length<=70&&!t.includes(`,`)&&t.split(/\s+/).length<=5&&!hc.test(t)&&/[A-ZÁÉÍÓÚÑ]/.test(t)}function yc(e){return[e.nombre_completo,e.madre_nombre,e.padre_nombre,e.representante_nombre].map(e=>(e??``).trim()).find(vc)??`Sin nombre registrado`}function bc(e){return{_postulante_id:e.id,nombre_completo:yc(e),fecha_nacimiento:e.fecha_nacimiento||``,nacionalidad:e.nacionalidad||``,tiene_pasaporte:e.tiene_pasaporte??!1,sabe_leer:e.sabe_leer??null,sabe_escribir:e.sabe_escribir??null,genero:e.genero||``,como_se_entero:e.como_se_entero||``,municipio_residencia:e.municipio_residencia||``,sector_calle_numero:e.sector_calle_numero||``,direccion:e.direccion||``,ubicacion_maps_url:e.ubicacion_maps_url||``,madre_nombre:e.madre_nombre||``,madre_cedula:e.madre_cedula||``,madre_tlf_whatsapp:e.madre_tlf_whatsapp||``,padre_nombre:e.padre_nombre||``,padre_cedula:e.padre_cedula||``,padre_tlf_whatsapp:e.padre_tlf_whatsapp||``,representante_nombre:e.representante_nombre||e.madre_nombre||``,representante_parentesco:e.representante_parentesco||``,representante_cedula:e.representante_cedula||``,representante_tlf:e.representante_tlf||e.telefono_representante||e.madre_tlf_whatsapp||``,correo_representante:e.correo||``,beneficiario_subsidio_estado:e.beneficiario_subsidio_estado??!1,acepta_pago_600:e.acepta_pago_600??!1,instrumento_interes:e.instrumento_interes||``,tiene_conocimientos_musicales:e.tiene_conocimientos_musicales??!1,instrumento_previo:e.instrumento_previo||``,nivel_lectura_musical:e.nivel_lectura_musical||``,interes_musical:e.interes_musical||``,por_que_unirse:e.por_que_unirse||``,sentimiento_musica_clasica:e.sentimiento_musica_clasica||``,musico_favorito:e.musico_favorito||``,autoriza_fotos_redes:e.autoriza_fotos_redes??!1}}function xc(e){if(!e)return`Sin definir`;let t=new Date(e);if(isNaN(t.getTime()))return`Sin definir`;let n=new Date,r=n.getFullYear()-t.getFullYear(),i=n.getMonth()-t.getMonth();return(i<0||i===0&&n.getDate()<t.getDate())&&r--,`${r} años`}function Sc(e){return e?new Date(e).toLocaleString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):``}function Cc(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`}):`-`}function wc(e,t,n){return`https://wa.me/${(e||``).replace(/[^0-9]/g,``)}?text=${encodeURIComponent(`Hola ${t}, le contactamos de *El Sistema Punta Cana*. Hemos recibido la postulación de *${n}* y queremos coordinar el proceso de inscripción. ¿Cuándo podría venir a nuestra sede para la entrevista? 🎵`)}`}function Tc(e){return`docs_${e}`}function Ec(e){try{let t=localStorage.getItem(Tc(e));return t?JSON.parse(t):{}}catch{return{}}}function Dc(e,t){localStorage.setItem(Tc(e),JSON.stringify(t))}async function Oc(e,t){let n=t?.id;if(!n){e.innerHTML=`<div class="alert alert-danger m-4">Error: ID de postulante no provisto.</div>`;return}await kc(e,n)}async function kc(e,t){B.cargando=!0,e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height:400px">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando perfil...</span>
      </div>
    </div>`;try{if(B.postulante=await mo(t),B.cargando=!1,!B.postulante){e.innerHTML=`
        <div class="container py-5 text-center">
          <i class="bi bi-person-x display-1 text-muted"></i>
          <h2 class="mt-3 fw-bold">Postulante no encontrado</h2>
          <p class="text-muted">El postulante con ID "${t}" no existe en el sistema.</p>
          <button class="btn btn-primary rounded-pill px-4 mt-3" id="btn-error-back">
            <i class="bi bi-arrow-left me-1"></i> Volver al listado
          </button>
        </div>`,document.getElementById(`btn-error-back`)?.addEventListener(`click`,()=>S.navigate(`postulados`));return}Ac(e)}catch(n){B.cargando=!1,e.innerHTML=`
      <div class="container py-5 text-center">
        <div class="alert alert-danger p-4 rounded-3">
          <i class="bi bi-exclamation-triangle-fill fs-1 mb-2 d-block"></i>
          <h4 class="fw-bold">Error al cargar perfil</h4>
          <p>${n.message}</p>
          <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-error-retry">
            <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      </div>`,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>kc(e,t))}}function Ac(e){let t=B.postulante,n=t.estado||`postulado`,r=yc(t),i=t.representante_nombre||t.madre_nombre||`Representante`,a=ka[n]||`secondary`,o=Oa[n]||`Postulado`;e.innerHTML=`
    <div class="container-fluid py-3 px-3 px-md-4">

      <!-- TOP BAR -->
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <button class="btn btn-link text-decoration-none ps-0 text-secondary" id="btn-back-list">
          <i class="bi bi-arrow-left me-1"></i> Volver a Postulados
        </button>
        <div class="d-flex gap-2 flex-wrap">
          ${t.madre_tlf_whatsapp?`
            <a href="${wc(t.madre_tlf_whatsapp,i,r)}"
               target="_blank" rel="noopener"
               class="btn btn-outline-success btn-sm rounded-pill">
              <i class="bi bi-whatsapp me-1"></i> WhatsApp Madre
            </a>`:``}
          ${t.padre_tlf_whatsapp?`
            <a href="${wc(t.padre_tlf_whatsapp,i,r)}"
               target="_blank" rel="noopener"
               class="btn btn-outline-success btn-sm rounded-pill">
              <i class="bi bi-whatsapp me-1"></i> WhatsApp Padre
            </a>`:``}
        </div>
      </div>

      <!-- NAME + BADGE -->
      <div class="mb-3">
        <h4 class="fw-bold mb-1">${r}
          <span class="badge bg-${a} ms-2 fs-6 align-middle">${o}</span>
        </h4>
        <p class="text-muted small mb-0">
          ${t.instrumento_interes||t.instrumento||``}
          ${t.instrumento_interes||t.instrumento?`·`:``}
          Postulado el: ${Cc(t.created_at)}
        </p>
      </div>

      <!-- PIPELINE -->
      <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4">
        <div class="card-body py-3 px-4 overflow-auto">
          ${jc(n)}
        </div>
      </div>

      <!-- TWO-COLUMN LAYOUT -->
      <div class="row g-4">

        <!-- LEFT col -->
        <div class="col-lg-7">

          <!-- PROXIMO PASO -->
          <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4" id="card-proximo-paso">
            ${Mc(t,n,i,r)}
          </div>

          <!-- NOTAS DE SEGUIMIENTO -->
          <div class="card border-secondary-subtle shadow-sm rounded-3">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-4">
              <h6 class="fw-bold mb-0"><i class="bi bi-pencil-square me-2 text-primary"></i>Notas de seguimiento</h6>
            </div>
            <div class="card-body px-4 pb-4">
              <textarea class="form-control mb-2" id="textarea-nueva-nota" rows="3"
                placeholder="Agregar nota de seguimiento..."></textarea>
              <button class="btn btn-primary btn-sm rounded-pill px-4 fw-semibold" id="btn-save-note">
                <span class="spinner-border spinner-border-sm d-none me-1" id="save-note-spinner"></span>
                Guardar nota
              </button>
              <div class="mt-4" id="notes-timeline">
                ${Fc(t)}
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT col -->
        <div class="col-lg-5">

          <!-- DATOS DEL POSTULANTE -->
          <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-4">
              <h6 class="fw-bold mb-0"><i class="bi bi-person-lines-fill me-2 text-primary"></i>Datos del postulante</h6>
            </div>
            <div class="card-body px-4 pb-4">
              ${Nc(t)}
            </div>
          </div>

          <!-- DOCUMENTOS -->
          <div class="card border-secondary-subtle shadow-sm rounded-3">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-4">
              <h6 class="fw-bold mb-0"><i class="bi bi-folder-check me-2 text-primary"></i>Documentos</h6>
            </div>
            <div class="card-body px-4 pb-4">
              ${Pc(t.id)}
            </div>
          </div>

        </div>
      </div>
    </div>
  `,Ic(e)}function jc(e){let t=[`no_show`,`en_espera`,`descartado`,`reprogramado`].includes(e),n={no_show:2,reprogramado:2,en_espera:3,descartado:-1},r=_c.findIndex(t=>t.id===e);return t&&(r=n[e]??-1),`
    <div class="d-flex align-items-center gap-1 overflow-auto py-1">
      ${_c.map((n,i)=>{let a=i<r,o=i===r&&!t,s=i===r&&t,c=`bg-light border border-secondary text-secondary`,l=`text-secondary`;if(a)c=`bg-success text-white border border-success`,l=`text-success fw-semibold`;else if(o){let e=ka[n.id]||`primary`;c=`bg-${e} text-white border border-${e}`,l=`text-${e} fw-bold`}else if(s){let t=ka[e]||`secondary`;c=`bg-${t} bg-opacity-25 text-${t} border border-${t}`,l=`text-${t} fw-semibold`}let u=i<_c.length-1?`<div class="flex-grow-1 border-top border-secondary-subtle" style="min-width:20px;margin-top:-8px"></div>`:``;return`
          <div class="d-flex flex-column align-items-center" style="min-width:64px">
            <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold ${c}"
                 style="width:36px;height:36px;font-size:.9rem">
              ${a?`<i class="bi bi-check-lg"></i>`:n.num}
            </div>
            <div class="text-center mt-1 small ${l}" style="font-size:.75rem;white-space:nowrap">
              ${n.label}
            </div>
            ${s?`<span class="badge bg-${ka[e]} mt-1" style="font-size:.65rem">${Oa[e]}</span>`:``}
          </div>
          ${u}`}).join(``)}
    </div>
  `}function Mc(e,t,n,r){let i=ka[t]||`secondary`;switch(t){case`postulado`:return`
        <div class="card-header bg-${i} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${i}"><i class="bi bi-telephone-outbound me-2"></i>Próximo paso: Contactar a la familia</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">El representante aún no ha sido contactado. Iniciá la comunicación por WhatsApp.</p>
          <div class="d-flex flex-wrap gap-2 mb-3">
            ${e.madre_tlf_whatsapp?`
              <a href="${wc(e.madre_tlf_whatsapp,n,r)}"
                 target="_blank" rel="noopener"
                 class="btn btn-success btn-sm rounded-pill">
                <i class="bi bi-whatsapp me-1"></i> WhatsApp Madre
              </a>`:``}
            ${e.padre_tlf_whatsapp?`
              <a href="${wc(e.padre_tlf_whatsapp,n,r)}"
                 target="_blank" rel="noopener"
                 class="btn btn-success btn-sm rounded-pill">
                <i class="bi bi-whatsapp me-1"></i> WhatsApp Padre
              </a>`:``}
          </div>
          <button class="btn btn-outline-${i} btn-sm rounded-pill fw-semibold" id="btn-accion-contactado">
            <i class="bi bi-check-lg me-1"></i> Marcar como Contactado
          </button>
        </div>`;case`contactado`:return`
        <div class="card-header bg-${i} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${i}"><i class="bi bi-calendar-plus me-2"></i>Próximo paso: Agendar cita presencial</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">Ya hubo contacto. Coordiná una fecha y hora para la entrevista de inscripción.</p>
          <div class="mb-3">
            <label class="form-label fw-semibold small">Fecha y hora de la cita</label>
            <input type="datetime-local" class="form-control" id="input-fecha-cita">
            <div class="form-text">El sistema validará conflictos con otras citas (±30 min).</div>
          </div>
          <button class="btn btn-${i} btn-sm rounded-pill fw-semibold" id="btn-accion-cita-agendada">
            <span class="spinner-border spinner-border-sm d-none me-1" id="spinner-cita"></span>
            <i class="bi bi-calendar-check me-1"></i> Confirmar cita
          </button>
          <div class="alert alert-danger mt-2 d-none" id="cita-inline-error"></div>
        </div>`;case`cita_agendada`:return`
        <div class="card-header bg-${i} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${i}"><i class="bi bi-calendar-event me-2"></i>Cita agendada para: ${e.fecha_cita?Sc(e.fecha_cita):`Sin fecha registrada`}</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">El día de la cita, confirmá si el representante llegó y revisá los documentos.</p>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-success btn-sm rounded-pill fw-semibold" id="btn-accion-documentos-ok">
              <i class="bi bi-check2-circle me-1"></i> Llegó — revisar documentos
            </button>
            <button class="btn btn-outline-danger btn-sm rounded-pill" id="btn-accion-no-show">
              <i class="bi bi-calendar-x me-1"></i> No se presentó
            </button>
          </div>
        </div>`;case`documentos_ok`:return`
        <div class="card-header bg-${i} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${i}"><i class="bi bi-check-circle me-2"></i>¡Listo para inscribir!</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">Toda la documentación fue verificada. Podés iniciar el proceso formal de inscripción.</p>
          <button class="btn btn-success rounded-pill fw-semibold px-4" id="btn-accion-inscribir">
            <i class="bi bi-mortarboard-fill me-2"></i> Iniciar inscripción
          </button>
        </div>`;case`no_show`:return`
        <div class="card-header bg-${i} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${i}"><i class="bi bi-calendar-x me-2"></i>No se presentó a la cita</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">Podés reprogramar una nueva fecha o descartar la postulación.</p>
          <div class="mb-3">
            <label class="form-label fw-semibold small">Nueva fecha de cita</label>
            <input type="datetime-local" class="form-control" id="input-fecha-reprogramar">
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-warning btn-sm rounded-pill fw-semibold" id="btn-accion-reprogramar">
              <span class="spinner-border spinner-border-sm d-none me-1" id="spinner-reprogramar"></span>
              <i class="bi bi-arrow-clockwise me-1"></i> Reprogramar cita
            </button>
            <button class="btn btn-outline-dark btn-sm rounded-pill" id="btn-accion-descartar">
              <i class="bi bi-person-x me-1"></i> Descartar
            </button>
          </div>
        </div>`;case`en_espera`:return`
        <div class="card-header bg-${i} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${i}"><i class="bi bi-hourglass-split me-2"></i>En lista de espera</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">No hay cupo disponible actualmente. Cuando se libere un lugar, avisales.</p>
          <div class="mb-3">
            <label class="form-label fw-semibold small">Fecha y hora de la nueva cita</label>
            <input type="datetime-local" class="form-control" id="input-fecha-espera">
          </div>
          <button class="btn btn-primary btn-sm rounded-pill fw-semibold" id="btn-accion-espera-cita">
            <span class="spinner-border spinner-border-sm d-none me-1" id="spinner-espera"></span>
            <i class="bi bi-calendar-plus me-1"></i> Disponible — agendar cita
          </button>
          <div class="alert alert-danger mt-2 d-none" id="espera-cita-error"></div>
        </div>`;case`inscrito`:return`
        <div class="card-header bg-success bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-success"><i class="bi bi-person-check-fill me-2"></i>Alumno inscrito</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">El proceso fue completado exitosamente.</p>
          ${e.alumno_id?`
            <button class="btn btn-outline-success btn-sm rounded-pill" id="btn-ver-alumno">
              Ver perfil del alumno <i class="bi bi-arrow-right ms-1"></i>
            </button>`:`<p class="text-muted small">Sin perfil de alumno vinculado.</p>`}
        </div>`;case`descartado`:{let t=(e.notas_seguimiento||``).split(`
`).find(e=>e.toLowerCase().includes(`descart`))||``;return`
        <div class="card-header bg-dark bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-secondary"><i class="bi bi-person-dash me-2"></i>Postulación descartada</h6>
        </div>
        <div class="card-body px-4 pb-4">
          ${t?`<p class="text-muted small mb-0">${t}</p>`:`<p class="text-muted small mb-0">Sin motivo registrado.</p>`}
        </div>`}default:return`
        <div class="card-body px-4 py-4">
          <p class="text-muted small mb-0">Estado desconocido: <code>${t}</code></p>
        </div>`}}function Nc(e){let t=(e,t)=>`
      <div class="d-flex justify-content-between py-1 border-bottom border-light">
        <span class="text-muted small">${e}</span>
        <span class="small text-end">${t!=null&&t!==``?`<span class="fw-medium">${t}</span>`:`<span class="text-muted fst-italic">Sin definir</span>`}</span>
      </div>`,n=[e.representante_nombre||e.nombre_representante||``,e.representante_parentesco||``].filter(Boolean).join(` · `);return`
    ${t(`Instrumento`,e.instrumento_interes||e.instrumento)}
    ${t(`Edad`,xc(e.fecha_nacimiento))}
    ${t(`Municipio`,e.municipio_residencia)}
    ${t(`Madre`,[e.madre_nombre,e.madre_tlf_whatsapp].filter(Boolean).join(` — `))}
    ${t(`Padre`,[e.padre_nombre,e.padre_tlf_whatsapp].filter(Boolean).join(` — `))}
    ${t(`Representante`,n)}
    ${t(`Correo`,e.correo)}
    ${t(`Postulado el`,Cc(e.created_at))}
  `}function Pc(e){let t=Ec(e);return gc.map(e=>`
    <div class="form-check mb-2">
      <input class="form-check-input doc-check" type="checkbox"
             id="doc-${e.id}" data-doc-id="${e.id}"
             ${t[e.id]?`checked`:``}>
      <label class="form-check-label small" for="doc-${e.id}">${e.label}</label>
    </div>
  `).join(``)}function Fc(e){let t=(e.notas_seguimiento||e.notes||``).split(`
`).filter(e=>e.trim());return t.length===0?`<p class="text-muted small fst-italic">Sin notas registradas.</p>`:`
    <h6 class="fw-bold small text-secondary text-uppercase mb-2">Historial</h6>
    ${t.map(e=>`
      <div class="d-flex gap-2 mb-2 pb-2 border-bottom border-light">
        <div class="mt-1 rounded-circle bg-primary flex-shrink-0" style="width:8px;height:8px"></div>
        <p class="small mb-0">${e}</p>
      </div>`).join(``)}
  `}function Ic(e){let t=B.postulante,n=t.id;t.estado,e.querySelector(`#btn-back-list`)?.addEventListener(`click`,()=>{window.router?.navigate(`postulados`)??S.navigate(`postulados`)}),e.querySelector(`#btn-ver-alumno`)?.addEventListener(`click`,()=>{window.router?.navigate(`alumno`,{id:t.alumno_id})??S.navigate(`alumno`,{id:t.alumno_id})}),e.querySelectorAll(`.doc-check`).forEach(e=>{e.addEventListener(`change`,()=>{let t=Ec(n),r=e.getAttribute(`data-doc-id`);e.checked?t[r]=!0:delete t[r],Dc(n,t)})}),e.querySelector(`#btn-save-note`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#textarea-nueva-nota`),r=(t?.value||``).trim();if(!r)return;let i=e.querySelector(`#btn-save-note`),a=e.querySelector(`#save-note-spinner`);try{i.disabled=!0,a?.classList.remove(`d-none`),B.postulante=await So(n,r),t.value=``;let o=e.querySelector(`#notes-timeline`);o&&(o.innerHTML=Fc(B.postulante))}catch(e){alert(`Error al agregar nota: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-contactado`)?.addEventListener(`click`,async()=>{try{B.postulante=await _o(n,`contactado`,{notas_seguimiento:`Contacto iniciado vía WhatsApp.`}),Ac(e)}catch(e){alert(`Error al cambiar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-cita-agendada`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-cita`),r=e.querySelector(`#cita-inline-error`),i=e.querySelector(`#btn-accion-cita-agendada`),a=e.querySelector(`#spinner-cita`);if(!t?.value){r?.classList.remove(`d-none`),r&&(r.textContent=`Debe seleccionar una fecha y hora.`);return}try{i.disabled=!0,a?.classList.remove(`d-none`),r?.classList.add(`d-none`);let o=new Date(t.value).toISOString();if(await xo(o,n)){r?.classList.remove(`d-none`),r&&(r.textContent=`Conflicto: ya existe otra cita en un rango de ±30 minutos.`);return}B.postulante=await _o(n,`cita_agendada`,{fecha_cita:o,notas_seguimiento:`Cita agendada para: ${Sc(o)}`}),Ac(e)}catch(e){alert(`Error al agendar cita: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-documentos-ok`)?.addEventListener(`click`,async()=>{try{B.postulante=await _o(n,`documentos_ok`,{notas_seguimiento:`Representante presente. Documentación revisada.`}),Ac(e)}catch(e){alert(`Error al actualizar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-no-show`)?.addEventListener(`click`,async()=>{try{B.postulante=await _o(n,`no_show`,{notas_seguimiento:`No se presentó a la cita agendada.`}),Ac(e)}catch(e){alert(`Error al actualizar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-inscribir`)?.addEventListener(`click`,()=>{Vi(bc(t)),window.router?.navigate(`alumnos-inscribir`)??S.navigate(`alumnos-inscribir`)}),e.querySelector(`#btn-accion-reprogramar`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-reprogramar`),r=e.querySelector(`#btn-accion-reprogramar`),i=e.querySelector(`#spinner-reprogramar`);if(!t?.value){alert(`Seleccioná una nueva fecha para la cita.`);return}try{r.disabled=!0,i?.classList.remove(`d-none`);let a=new Date(t.value).toISOString();if(await xo(a,n)){alert(`Conflicto: ya existe otra cita en un rango de ±30 minutos.`);return}let o=await _o(n,`reprogramado`,{notas_seguimiento:`Cita reprogramada para: ${Sc(a)}`});o=await _o(n,`cita_agendada`,{fecha_cita:a,notas_seguimiento:`Nueva cita agendada: ${Sc(a)}`}),B.postulante=o,Ac(e)}catch(e){alert(`Error al reprogramar: ${e.message}`)}finally{r.disabled=!1,i?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-descartar`)?.addEventListener(`click`,async()=>{let t=prompt(`Indicá la razón del descarte:`);if(t!==null)try{B.postulante=await _o(n,`descartado`,{notas_seguimiento:`Postulación descartada. Razón: ${t||`Sin detallar`}`}),Ac(e)}catch(e){alert(`Error al descartar: ${e.message}`)}}),e.querySelector(`#btn-accion-espera-cita`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-espera`),r=e.querySelector(`#espera-cita-error`),i=e.querySelector(`#btn-accion-espera-cita`),a=e.querySelector(`#spinner-espera`);if(!t?.value){r?.classList.remove(`d-none`),r&&(r.textContent=`Seleccioná una fecha para la cita.`);return}try{i.disabled=!0,a?.classList.remove(`d-none`),r?.classList.add(`d-none`);let o=new Date(t.value).toISOString();if(await xo(o,n)){r?.classList.remove(`d-none`),r&&(r.textContent=`Conflicto: ya existe otra cita en ±30 minutos.`);return}B.postulante=await _o(n,`cita_agendada`,{fecha_cita:o,notas_seguimiento:`Cita agendada desde lista de espera: ${Sc(o)}`}),Ac(e)}catch(e){alert(`Error al agendar cita: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}})}var V={year:new Date().getFullYear(),month:new Date().getMonth()+1,citas:[],cargando:!1},Lc=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],Rc=[`Dom`,`Lun`,`Mar`,`Mié`,`Jue`,`Vie`,`Sáb`];async function zc(e){await Bc(e)}async function Bc(e){try{V.cargando=!0,Vc(e),V.citas=await bo(new Date(V.year,V.month-1,1,0,0,0).toISOString(),new Date(V.year,V.month,0,23,59,59).toISOString()),V.cargando=!1,Uc(e)}catch(t){V.cargando=!1,Hc(e,t.message)}}function Vc(e){e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Calendario de Citas</h1>
          <p class="text-muted mb-0">Seguimiento mensual de entrevistas de admisión</p>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando calendario...</span>
          </div>
          <p class="text-muted mt-2">Cargando citas...</p>
        </div>
      </div>
    </div>
  `}function Hc(e,t){e.innerHTML=`
    <div class="container py-5 text-center">
      <div class="alert alert-danger shadow-sm border-0 d-flex flex-column align-items-center p-4 rounded-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-1 mb-2"></i>
        <h4 class="alert-heading fw-bold">Error al cargar citas</h4>
        <p>${t}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-3" id="btn-error-retry">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>
    </div>
  `,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>zc(e))}function Uc(e){let t=new Date(V.year,V.month,0).getDate(),n=new Date(V.year,V.month-1,1).getDay();e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Calendario de Citas</h1>
          <p class="text-muted mb-0">Seguimiento mensual de entrevistas de admisión</p>
        </div>
        
        <!-- SELECTOR MES -->
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-today">Hoy</button>
          <div class="input-group input-group-sm shadow-sm" style="max-width: 250px;">
            <button class="btn btn-outline-secondary" id="btn-month-prev" type="button">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="form-control text-center fw-semibold bg-light d-flex align-items-center justify-content-center" style="min-width: 140px;">
              ${Lc[V.month-1]} ${V.year}
            </span>
            <button class="btn btn-outline-secondary" id="btn-month-next" type="button">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- CALENDAR CARD -->
      <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div class="card-body p-0">
          
          <!-- DIAS SEMANA HEADER -->
          <div class="row g-0 bg-light text-center border-bottom py-2 fw-bold text-muted small">
            ${Rc.map(e=>`<div class="col" style="width: 14.28%;">${e}</div>`).join(``)}
          </div>

          <!-- GRID CALENDARIO -->
          <div class="row g-0 flex-wrap" id="calendar-grid">
            ${Wc(n,t)}
          </div>

        </div>
      </div>
    </div>
  `,Kc(e)}function Wc(e,t){let n=``;for(let t=0;t<e;t++)n+=`
      <div class="col p-2 bg-light bg-opacity-25 border-end border-bottom d-none d-md-block" style="width: 14.28%; min-height: 120px;">
        <span class="text-muted opacity-25 small"></span>
      </div>
    `;let r=new Date,i=r.getFullYear()===V.year&&r.getMonth()+1===V.month;for(let e=1;e<=t;e++){let t=i&&r.getDate()===e,a=Gc(e);n+=`
      <div class="col border-end border-bottom position-relative p-2" style="width: 14.28%; min-width: 14%; min-height: 120px; background-color: ${t?`rgba(13, 110, 253, 0.04)`:`#fff`};">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="badge ${t?`bg-primary text-white`:`text-secondary`} fw-bold rounded-circle small p-1 d-inline-flex align-items-center justify-content-center" style="width: 24px; height: 24px;">
            ${e}
          </span>
          ${a.length>0?`<span class="badge bg-light-primary text-primary d-md-none rounded-pill border border-primary border-opacity-25" style="font-size: 0.7rem;">${a.length}</span>`:``}
        </div>
        
        <!-- CITAS CONTAINER -->
        <div class="d-flex flex-column gap-1 overflow-y-auto scrollbar-hidden mt-1" style="max-height: 90px;">
          ${a.map(e=>{let t=new Date(e.fecha_cita).toLocaleTimeString(`es-ES`,{hour:`2-digit`,minute:`2-digit`,hour12:!0});return`
              <div class="calendar-event-badge bg-light-primary text-primary border border-primary border-opacity-10 rounded px-2 py-1 small cursor-pointer hover-shadow transition-all d-none d-md-block btn-goto-perfil" data-id="${e.id}" title="${e.nombre_completo} - ${t}">
                <div class="fw-semibold text-truncate" style="font-size: 0.75rem;">${e.nombre_completo}</div>
                <div class="text-secondary" style="font-size: 0.65rem;"><i class="bi bi-clock me-0.5"></i>${t}</div>
              </div>
            `}).join(``)}
          
          <!-- VISTA MOBILE FLUIDA -->
          ${a.length>0?`
            <div class="d-md-none text-center mt-1">
              <button class="btn btn-link text-decoration-none p-0 text-primary fw-semibold btn-view-mobile-day" style="font-size: 0.7rem;" data-day="${e}">
                Ver ${a.length} citas
              </button>
            </div>
          `:``}
        </div>
      </div>
    `}let a=(e+t)%7;if(a>0){let e=7-a;for(let t=0;t<e;t++)n+=`
        <div class="col p-2 bg-light bg-opacity-25 border-end border-bottom d-none d-md-block" style="width: 14.28%; min-height: 120px;">
          <span class="text-muted opacity-25 small"></span>
        </div>
      `}return n}function Gc(e){return V.citas.filter(t=>{if(!t.fecha_cita)return!1;let n=new Date(t.fecha_cita);return n.getDate()===e&&n.getMonth()+1===V.month&&n.getFullYear()===V.year})}function Kc(e){document.getElementById(`btn-month-prev`)?.addEventListener(`click`,()=>{V.month--,V.month<1&&(V.month=12,V.year--),Bc(e)}),document.getElementById(`btn-month-next`)?.addEventListener(`click`,()=>{V.month++,V.month>12&&(V.month=1,V.year++),Bc(e)}),document.getElementById(`btn-today`)?.addEventListener(`click`,()=>{V.year=new Date().getFullYear(),V.month=new Date().getMonth()+1,Bc(e)}),e.querySelectorAll(`.btn-goto-perfil`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation();let t=e.currentTarget.getAttribute(`data-id`);S.navigate(`postulado`,{id:t})})}),e.querySelectorAll(`.btn-view-mobile-day`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation();let t=parseInt(e.currentTarget.getAttribute(`data-day`)),n=Gc(t),r=n.map(e=>{let t=new Date(e.fecha_cita).toLocaleTimeString(`es-ES`,{hour:`2-digit`,minute:`2-digit`,hour12:!0});return`• ${e.nombre_completo} (${t})`}).join(`
`);alert(`Citas para el día ${t} de ${Lc[V.month-1]}:\n\n${r}\n\nSelecciona el perfil para ver detalles.`),n.length===1&&S.navigate(`postulado`,{id:n[0].id})})})}function qc(){S.register(`alumnos`,qr),S.register(`alumnos-reporte-mes`,Pi),S.register(`alumnos-inscribir`,ws),S.register(`alumnos-pdf-demo`,Ls),S.register(`alumno`,Fs),S.register(`postulados`,ic),S.register(`postulado`,Oc),S.register(`postulados-calendario`,zc)}function Jc(e){return e?{...e,nombre:e.nombre??e.name??``,codigo:e.codigo_salon??``,ubicacion:e.ubicacion??e.location??``,condicion:e.condicion_fisica??`buena`,is_active:e.is_active??e.isActive??e.activo??!0,capacidad:parseInt(e.capacidad)||20,piso:e.piso!==void 0&&e.piso!==null?parseInt(e.piso):null,equipamiento:Array.isArray(e.equipamiento)?e.equipamiento.join(`, `):e.equipamiento||``,descripcion:e.descripcion||``}:null}async function Yc(){let{data:e,error:t}=await _.from(`salones`).select(`*`).order(`nombre`,{ascending:!0});if(t)throw console.error(`Error cargando salones:`,t.message),Error(`No se pudieron cargar los salones`);return e.map(Jc)}async function Xc(e){let t=(e.nombre||``).trim(),n=(e.codigo_salon||``).trim();if(!t)throw Error(`El nombre es obligatorio`);let{data:r,error:i}=await _.from(`salones`).select(`id, nombre, codigo_salon`).or(`nombre.eq."${t}", codigo_salon.eq."${n}"`).maybeSingle();if(i&&console.error(`Error validando duplicados:`,i),r){if(r.nombre.toLowerCase()===t.toLowerCase())throw Error(`Ya existe un salón con ese nombre`);if(n&&r.codigo_salon?.toLowerCase()===n.toLowerCase())throw Error(`Ya existe un salón con ese código`)}let a={nombre:t,codigo_salon:n||void 0,capacidad:parseInt(e.capacidad)||20,ubicacion:(e.ubicacion||``).trim(),piso:e.piso===void 0?null:parseInt(e.piso),condicion_fisica:e.condicion_fisica||`buena`,equipamiento:typeof e.equipamiento==`string`?e.equipamiento.split(`,`).map(e=>e.trim()).filter(Boolean):Array.isArray(e.equipamiento)?e.equipamiento:[],descripcion:(e.descripcion||``).trim(),is_active:e.is_active===void 0?!0:e.is_active,responsable_id:e.responsable_id||null},{data:o,error:s}=await _.from(`salones`).insert([a]).select();if(s)throw s.code===`23505`?Error(`El nombre o código del salón ya está registrado`):(console.error(`Error creando salon:`,s.message),Error(`No se pudo crear el salon`));return o[0]}async function Zc(e,t){let n=(t.nombre||``).trim(),r=(t.codigo_salon||``).trim();if(n||r){let{data:t}=await _.from(`salones`).select(`id, nombre, codigo_salon`).neq(`id`,e);if(t){if(n&&t.find(e=>e.nombre.toLowerCase()===n.toLowerCase()))throw Error(`Ya existe otro salón con ese nombre`);if(r&&t.find(e=>e.codigo_salon?.toLowerCase()===r.toLowerCase()))throw Error(`Ya existe otro salón con ese código`)}}let i={...t};n&&(i.nombre=n),r&&(i.codigo_salon=r),i.capacidad&&=parseInt(i.capacidad),i.piso!==void 0&&(i.piso=parseInt(i.piso)),i.equipamiento!==void 0&&(i.equipamiento=typeof i.equipamiento==`string`?i.equipamiento.split(`,`).map(e=>e.trim()).filter(Boolean):Array.isArray(i.equipamiento)?i.equipamiento:[]),i.updated_at=new Date().toISOString();let{data:a,error:o}=await _.from(`salones`).update(i).eq(`id`,e).select();if(o)throw o.code===`23505`?Error(`El nombre o código del salón ya está registrado`):(console.error(`Error actualizando salon:`,o.message),Error(`No se pudo actualizar el salon`));return a[0]}async function Qc(e){let{error:t}=await _.from(`salones`).update({is_active:!1,updated_at:new Date().toISOString()}).eq(`id`,e);if(t)throw console.error(`Error eliminando salon:`,t.message),Error(`No se pudo inactivar el salon`)}var $c=new class{constructor(){this.salones=[],this.cargando=!1,this.error=null,this.listeners=[]}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){this.listeners.forEach(e=>e(this))}async fetchSalones(){this.cargando=!0,this.error=null,this.notify();try{this.salones=await Yc()}catch(e){this.error=e.message,console.error(e)}finally{this.cargando=!1,this.notify()}}getFiltered(e=``,t=``,n=``){return this.salones.filter(r=>{let i=e.toLowerCase(),a=r.nombre.toLowerCase().includes(i)||r.codigo&&r.codigo.toLowerCase().includes(i)||r.ubicacion.toLowerCase().includes(i),o=t===``||String(r.piso)===String(t),s=n===``||r.condicion===n;return a&&o&&s})}},el={editandoId:null};function tl(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function nl(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].substring(0,2).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function rl(e){e.innerHTML=`
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
  `;let t=e.querySelector(`#salonesTableBody`),n=e.querySelector(`#searchSalon`),r=e.querySelector(`#filterCondicion`),i=e.querySelector(`#filterPiso`),a=e.querySelector(`#salonesCount`),o=()=>{let e=n.value,o=r.value,c=i.value,l=$c.getFiltered(e,c,o);if($c.cargando){t.innerHTML=`<div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>`;return}if($c.error){t.innerHTML=`<div class="text-center py-5 text-danger"><i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i> Error: ${tl($c.error)}</div>`;return}if(l.length===0){t.innerHTML=`
        <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
          <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
          No se encontraron salones con esos filtros.
        </div>`;return}a.textContent=l.length,t.innerHTML=l.map(e=>{let t=nl(e.nombre||`S`),n=e.is_active!==!1,r=s(e.condicion),i=`border-accent-${n?`success`:`secondary`}`,a=`bg-${n?`success`:`secondary`}`;return`
        <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${i}" data-id="${e.id}" style="cursor: pointer;">
          <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
            <div class="position-relative flex-shrink-0">
              <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">${t}</div>
              <span class="position-absolute bottom-0 end-0 p-1 ${a} border border-light rounded-circle" style="transform: translate(10%, 10%);">
                <span class="visually-hidden">${n?`Activo`:`Inactivo`}</span>
              </span>
            </div>
            <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${tl(e.nombre||`-`)}</span>
              <small class="text-muted text-truncate">Capacidad: ${e.capacidad||`-`} personas • Piso: ${e.piso===0||e.piso===`0`?`Planta Baja`:`Piso ${e.piso}`}</small>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            ${r}
            <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
          </div>
        </div>
      `}).join(``)},s=e=>`<span class="badge badge-compact ${{excelente:`bg-success`,buena:`bg-primary`,regular:`bg-warning`,mala:`bg-danger`}[e]||`bg-secondary`}">${{excelente:`Excelente`,buena:`Buena`,regular:`Regular`,mala:`Mala`}[e]||`-`}</span>`,c=$c.subscribe(o),l;n.addEventListener(`input`,()=>{clearTimeout(l),l=setTimeout(o,300)}),r.addEventListener(`change`,o),i.addEventListener(`change`,o),e.querySelector(`#btnCrearSalon`)?.addEventListener(`click`,()=>{il()}),t?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t){let e=t.dataset.id;ol(e)}}),$c.fetchSalones(),e.cleanup=()=>{c()}}function il(){el.editandoId=null,b.open({title:`Crear Nuevo Salón`,body:`<form class="row g-2" id="formSalon">
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
    </form>`,saveText:`Guardar`,onSave:async e=>{let t=e.querySelector(`#modal-nombre`).value.trim(),n=parseInt(e.querySelector(`#modal-capacidad`).value),r=e.querySelector(`#modal-piso`).value,i=e.querySelector(`#modal-condicion`).value,a=e.querySelector(`#modal-esActivo`).value===`true`,o=e.querySelector(`#modal-equipamiento`).value.trim(),s=e.querySelector(`#modal-descripcion`).value.trim();if(!t||!n||!r)return v.error(`Por favor complete los campos obligatorios`),!1;await Xc({nombre:t,capacidad:n,piso:r,condicion_fisica:i,is_active:a,equipamiento:o,descripcion:s}),$c.fetchSalones(),v.success(`Salón creado correctamente`)}})}function al(e){let t=$c.salones.find(t=>t.id===e);if(!t){v.error(`Salón no encontrado`);return}el.editandoId=e,b.open({title:`Editar Salón`,body:`<form class="row g-2" id="formSalon">
      <div class="col-12">
        <label class="form-label-compact">Nombre *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required value="${tl(t.nombre||``)}">
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
        <textarea class="form-control input-dense" id="modal-equipamiento" rows="2">${tl(t.equipamiento||``)}</textarea>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="2">${tl(t.descripcion||``)}</textarea>
      </div>
    </form>`,saveText:`Guardar cambios`,onSave:async t=>{try{let n=t.querySelector(`#modal-nombre`).value.trim(),r=parseInt(t.querySelector(`#modal-capacidad`).value),i=t.querySelector(`#modal-piso`).value,a=t.querySelector(`#modal-condicion`).value,o=t.querySelector(`#modal-esActivo`).value===`true`,s=t.querySelector(`#modal-equipamiento`).value.trim(),c=t.querySelector(`#modal-descripcion`).value.trim();return!n||!r||!i?(v.error(`Por favor complete los campos obligatorios`),!1):(await Zc(e,{nombre:n,capacidad:r,piso:i,condicion_fisica:a,is_active:o,equipamiento:s,descripcion:c}),await $c.fetchSalones(),v.success(`Salón actualizado correctamente`),!0)}catch(e){return console.error(`Error al actualizar salón:`,e),v.error(e.message||`Error al actualizar el salón`),!1}}})}function ol(e){let t=$c.salones.find(t=>t.id===e);if(!t){v.error(`Salón no encontrado`);return}let n=t.piso===0||t.piso===`0`?`Planta Baja`:`Piso ${t.piso}`,r={excelente:`Excelente`,buena:`Buena`,regular:`Regular`,mala:`Mala`}[t.condicion]||`-`,i=t.is_active===!1?`Inactivo`:`Activo`,a=t.is_active===!1?`bg-secondary`:`bg-success`;b.open({title:tl(t.nombre||`Salón`),hideSave:!0,cancelText:`Cerrar`,onShow:t=>{t.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{b.close(),setTimeout(()=>al(e),300)}),t.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{b.close(),setTimeout(()=>sl(e),300)})},body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Código</label>
            <p class="form-control-plaintext"><code>${tl(t.codigo||`-`)}</code></p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${tl(t.nombre||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Capacidad</label>
            <p class="form-control-plaintext">${t.capacidad||`-`} personas</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Ubicación</label>
            <p class="form-control-plaintext">${tl(n)}</p>
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
            <p class="form-control-plaintext">${tl(t.equipamiento||`Sin equipamiento registrado`)}</p>
          </div>
        </div>
      </div>
      ${t.descripcion?`
      <hr>
      <div class="row">
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label fw-bold">Descripción</label>
            <p class="form-control-plaintext">${tl(t.descripcion)}</p>
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
    `})}function sl(e){let t=$c.salones.find(t=>t.id===e);if(!t){v.error(`Salón no encontrado`);return}b.open({title:`⚠️ Inactivar Salón`,size:`sm`,saveText:`Inactivar`,body:`<p>¿Inactivar el salón <strong>${tl(t.nombre)}</strong>?</p>
           <p class="text-muted small mb-0">Esta acción lo ocultará de las asignaciones de clases.</p>`,onSave:async()=>{await Qc(e),$c.fetchSalones(),v.success(`Salón inactivado correctamente`)}})}function cl(){S.register(`salones`,rl)}var H={clases:[],clasesOriginales:[],maestros:[],salones:[],programas:[],alumnos:[],cargando:!1,filtroEstado:`todos`,filtroInstrumento:``,vista:`tabla`,container:null,mostrarDiasVacios:!0};async function ll(e){if(e)try{H.container=e,H.cargando=!0,ul(e);let[t,n,r,i,a]=await Promise.all([se(),_.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),_.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),_.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),_.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]);H.clases=t,H.clasesOriginales=[...t],H.maestros=n.data||[],H.salones=r.data||[],H.programas=i.data||[],H.alumnos=a.data||[],H.cargando=!1,fl(e),vl(e)}catch(t){console.error(t),dl(e,t.message)}}function ul(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando clases...</p>
      </div>
    </div>
  `}function dl(e,t){e.innerHTML=`
    <div class="container mt-5 text-center">
      <div class="alert alert-danger d-inline-block" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${h(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>ll(e))}function fl(e){e.innerHTML=`
    <div class="page-container">
      <div class="clases-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-book fs-4"></i>
          </div>
          <div>
            <h1 class="clases-title-premium mb-0">Clases</h1>
            <p class="text-muted small mb-0">${H.clases.length} clases en total</p>
          </div>
        </div>
        
        <div class="clases-header-actions">
          <button class="btn-help-trigger" id="btn-help-clases" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <div class="view-segmented-control">
            <button class="view-segment-btn ${H.vista===`tabla`?`active`:``}" id="btn-vista-tabla" title="Vista de lista">
              <i class="bi bi-list-ul"></i>
            </button>
            <button class="view-segment-btn ${H.vista===`calendario`?`active`:``}" id="btn-vista-calendario" title="Vista de agenda">
              <i class="bi bi-calendar-week"></i>
            </button>
          </div>
          <button class="btn btn-premium-action" id="btnAgregarClase">
            <i class="bi bi-plus-lg me-1.5"></i>Nueva Clase
          </button>
        </div>
      </div>

      <div class="clases-filter-toolbar mb-4">
        <div class="premium-search-container flex-grow-1">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar clase o instrumento..." id="buscar">
        </div>
        
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="suspendida">Suspendidas</option>
            <option value="finalizada">Finalizadas</option>
          </select>
        </div>
      </div>

      <div id="view-content">
        ${H.vista===`tabla`?pl():gl()}
      </div>
    </div>
  `}function pl(){return H.clases.length===0?hl():`
    <div class="page-glass rounded w-100">
      <div class="list-group list-group-flush w-100" id="clasesListBody">
        ${H.clases.map(e=>ml(e)).join(``)}
      </div>
    </div>
  `}function ml(e){let t=e.nombre||`Sin nombre`,n=H.maestros.find(t=>t.id===e.maestro_principal_id),r=n?n.nombre_completo||n.nombre:`Sin maestro`,i=ue(t),a=e.estado||`activa`,o=`border-accent-${a===`activa`?`success`:a===`suspendida`?`warning`:`secondary`}`,s=`bg-${a===`activa`?`success`:a===`suspendida`?`warning`:`secondary`}`,c=(e.horarios||[]).slice(0,3),l=c.length>0?c.map(e=>`${(e.dia||``).slice(0,2).toUpperCase()} ${(e.hora_inicio||``).slice(0,5)}`).join(` • `):`Sin horarios`;return`
    <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${o}" data-id="${e.id}" style="cursor: pointer;">
      <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
        <div class="position-relative flex-shrink-0">
          <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
            ${i}
          </div>
          <span class="position-absolute bottom-0 end-0 p-1 ${s} border border-light rounded-circle" style="transform: translate(10%, 10%);">
            <span class="visually-hidden">${a}</span>
          </span>
        </div>
        <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
          <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${h(t)}</span>
          <small class="text-muted text-truncate">${h(r)} • ${h(e.instrumento||`-`)}</small>
          <small class="text-muted extra-small mt-1" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i>${h(l)}</small>
        </div>
      </div>
      <div class="flex-shrink-0 text-muted ms-2 pe-1">
        <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
      </div>
    </div>
  `}function hl(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No se encontraron clases.</p>
    </div>
  `}function gl(){if(H.clases.length===0)return hl();let e=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`],t={lunes:`Lunes`,martes:`Martes`,miércoles:`Miércoles`,jueves:`Jueves`,viernes:`Viernes`,sábado:`Sábado`},n={lunes:[],martes:[],miércoles:[],jueves:[],viernes:[],sábado:[]};H.clases.forEach(e=>{(e.horarios||[]).forEach(t=>{let r=(t.dia||``).toLowerCase().trim();n[r]&&n[r].push({...t,clase:e})})}),Object.keys(n).forEach(e=>{n[e].sort((e,t)=>ie(e.hora_inicio)-ie(t.hora_inicio))});let r=H.mostrarDiasVacios?``:`hide-empty-days`;return`
    <div class="weekly-schedule-container">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 px-1 weekly-schedule-toolbar">
        <span class="small text-muted fw-semibold"><i class="bi bi-calendar-week me-1"></i>Agenda Semanal</span>
        <div class="form-check form-switch m-0 d-flex align-items-center gap-2">
          <input class="form-check-input cursor-pointer" type="checkbox" role="switch" id="toggle-empty-days" ${H.mostrarDiasVacios?`checked`:``}>
          <label class="form-check-label select-none small text-muted cursor-pointer" for="toggle-empty-days">Mostrar días vacíos</label>
        </div>
      </div>
      <div class="weekly-schedule-grid ${r}">
        ${e.map(e=>{let r=n[e],i=t[e];return`
            <div class="schedule-day-column ${r.length===0?`is-empty`:``}" data-day="${e}">
              <div class="schedule-day-header">
                <span class="day-label">${i}</span>
                <span class="day-count-badge bg-primary bg-opacity-10 text-primary">${r.length}</span>
              </div>
              <div class="schedule-blocks-container">
                ${r.length>0?r.map(e=>{let t=e.clase,n=t.estado||`activa`,r=ce(e.hora_inicio),i=ce(e.hora_fin),a=H.salones.find(t=>t.id===e.salon_id),o=a?a.nombre:`Online/Otro`;return`
                    <div class="time-block-card p-2 rounded mb-2 border-start-accent ${`border-accent-${n===`activa`?`success`:n===`suspendida`?`warning`:`secondary`}`}" data-id="${t.id}" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="time-range small fw-bold text-primary"><i class="bi bi-clock me-1"></i>${r} - ${i}</span>
                        <i class="bi ${le(t.instrumento)} text-muted" style="font-size: 0.85rem;"></i>
                      </div>
                      <div class="fw-semibold text-truncate small class-name" style="font-size: 0.9rem;">${h(t.nombre)}</div>
                      <div class="d-flex justify-content-between align-items-center mt-1 extra-small text-muted">
                        <span class="text-truncate" style="max-width: 60%;"><i class="bi bi-person me-0.5"></i>${h(H.maestros.find(e=>e.id===t.maestro_principal_id)?.nombre_completo||`Sin maestro`)}</span>
                        <span class="badge bg-body-secondary text-body-secondary-custom px-1.5 py-0.5 rounded" style="font-size: 0.7rem;"><i class="bi bi-geo-alt me-0.5"></i>${h(o)}</span>
                      </div>
                    </div>
                  `}).join(``):`
                  <div class="empty-day-block text-muted text-center py-4 small">
                    <i class="bi bi-calendar-minus d-block mb-1 opacity-50"></i>
                    Sin clases
                  </div>
                `}
              </div>
            </div>
          `}).join(``)}
      </div>
    </div>
  `}async function _l(e){if(e){b.open({title:`Cargando...`,hideSave:!0,size:`md`,body:`
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando perfil de la clase...</p>
      </div>
    `});try{let t=await be(e.id),n=t.length,r=H.maestros.find(t=>t.id===e.maestro_principal_id),i=r?r.nombre_completo||r.nombre:`Sin maestro`,a=e.tiene_suplente||e.maestro_suplente_id?H.maestros.find(t=>t.id===e.maestro_suplente_id):null,o=a?a.nombre_completo||a.nombre:null,s=H.programas.find(t=>t.id===e.programa_id),c=s?s.nombre:`Sin programa`,l=``;l=e.horarios&&e.horarios.length>0?e.horarios.map(e=>{let t=e.dia.charAt(0).toUpperCase()+e.dia.slice(1),n=H.salones.find(t=>t.id===e.salon_id),r=n?n.nombre:`Online/Otro`;return`
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-secondary-subtle text-secondary-custom py-1" style="font-size: 0.75rem; min-width: 60px;">${t}</span>
            <span class="small fw-semibold">${ce(e.hora_inicio)} - ${ce(e.hora_fin)}</span>
            <span class="small text-muted">• <i class="bi bi-geo-alt me-0.5"></i>${h(r)}</span>
          </div>
        `}).join(``):`<div class="text-muted small">Sin horarios asignados</div>`;let u=``;u=t&&t.length>0?`
        <div class="list-group list-group-flush border-top">
          ${t.map(e=>{let t=e.alumno;if(!t)return``;let n=ue(t.nombre_completo||t.nombre||`?`);return`
              <div class="list-group-item d-flex align-items-center gap-3 py-2 px-3 border-bottom-0 bg-transparent">
                <div class="avatar-compact text-white d-flex align-items-center justify-content-center rounded-circle" style="width: 32px; height: 32px; font-size: 0.85rem; background-color: ${ve(t.id)}; font-weight:600;">
                  ${n}
                </div>
                <div class="d-flex flex-column overflow-hidden">
                  <span class="fw-semibold text-truncate small" style="font-size: 0.9rem; color: var(--bs-body-color);">${h(t.nombre_completo||t.nombre)}</span>
                  <small class="text-muted extra-small">${h(t.instrumento_principal||`Sin instrumento`)}</small>
                </div>
              </div>
            `}).join(``)}
        </div>
      `:`
        <div class="text-muted text-center py-4 small bg-body-tertiary rounded">
          <i class="bi bi-people d-block mb-1 opacity-50" style="font-size: 1.25rem;"></i>
          No hay alumnos inscritos en esta clase
        </div>
      `;let d=e.capacidad_maxima||20,f=Math.min(100,Math.round(n/d*100)),p=`bg-success`;f>=90?p=`bg-danger`:f>=70&&(p=`bg-warning`);let m=`
      <div class="class-profile-container">
        <!-- Profile Header / Hero Card -->
        <div class="class-hero-card d-flex align-items-center gap-3 p-3 rounded mb-4" style="background: linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(88,86,214,0.08) 100%); border: 1px solid rgba(13,110,253,0.15);">
          <div class="position-relative">
            <div class="avatar-large bg-primary bg-opacity-15 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 56px; height: 56px; font-size: 1.5rem; font-weight: 700;">
              <i class="bi ${le(e.instrumento)}"></i>
            </div>
            <span class="position-absolute bottom-0 end-0 p-1.5 bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="overflow-hidden">
            <h4 class="mb-1 fw-bold text-truncate" style="letter-spacing: -0.02em; font-size: 1.2rem; color: var(--bs-body-color);">${h(e.nombre)}</h4>
            <span class="badge rounded-pill bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} text-capitalize" style="font-size: 0.75rem;">${me(e.estado)}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-person-badge me-1"></i>Maestro Principal</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${h(i)}</span>
              ${o?`<small class="text-muted d-block extra-small mt-1"><i class="bi bi-person me-0.5"></i>Suplente: ${h(o)}</small>`:``}
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-music-note me-1"></i>Instrumento</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${h(e.instrumento||`Sin asignar`)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-collection me-1"></i>Programa</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${h(c)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-2"><i class="bi bi-calendar3 me-1"></i>Horarios y Salones</small>
              <div class="horarios-list-container">
                ${l}
              </div>
            </div>
          </div>
        </div>

        <!-- Enrollment Progress Bar -->
        <div class="enrollment-occupancy-card p-3 rounded mb-4 border bg-body-tertiary">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold small text-muted"><i class="bi bi-people me-1"></i>Ocupación e Inscripciones</span>
            <span class="badge bg-secondary bg-opacity-10 text-secondary-custom small fw-semibold" style="font-size: 0.75rem;">${n} / ${d} Alumnos</span>
          </div>
          <div class="progress bg-body-secondary" style="height: 10px; border-radius: 6px; overflow: hidden;">
            <div class="progress-bar ${p} progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${f}%" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${d}"></div>
          </div>
        </div>

        <!-- Description / Pedagogical Notes -->
        <div class="description-card p-3 rounded mb-4 border bg-body-tertiary">
          <small class="text-muted d-block mb-1"><i class="bi bi-file-earmark-text me-1"></i>Notas Pedagógicas</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.5;">${h(e.descripcion||`Sin notas pedagógicas registradas.`)}</p>
        </div>

        <!-- Alumnos Inscritos List -->
        <div class="alumnos-inscritos-section mb-4">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="font-size: 0.95rem;">
            <i class="bi bi-person-check text-primary"></i> Alumnos Inscritos
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill small" style="font-size: 0.75rem;">${n}</span>
          </h6>
          <div class="alumnos-scroll-list border rounded" style="max-height: 180px; overflow-y: auto;">
            ${u}
          </div>
        </div>

        <!-- Action Buttons (moved inside profile modal as requested) -->
        <div class="class-profile-actions border-top pt-3 mt-4">
          <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 btn-profile-delete" data-id="${e.id}">
            <i class="bi bi-trash"></i> Eliminar Clase
          </button>
          <div class="class-profile-secondary-actions">
            <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 btn-profile-edit" data-id="${e.id}">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-secondary btn-sm btn-profile-close">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;b.open({title:`Perfil de Clase: ${e.nombre}`,hideSave:!0,size:`md`,body:m,onShow:t=>{let n=t.closest(`.app-modal-dialog`)?.querySelector(`.app-modal-footer`);n&&n.style.setProperty(`display`,`none`,`important`),t.querySelector(`.btn-profile-edit`)?.addEventListener(`click`,()=>{b.close(),setTimeout(()=>{bn(e,{maestros:H.maestros,salones:H.salones,programas:H.programas,alumnos:H.alumnos,onSuccess:()=>ll(H.container)})},250)}),t.querySelector(`.btn-profile-delete`)?.addEventListener(`click`,()=>{b.close(),setTimeout(()=>{bl(e.id)},250)}),t.querySelector(`.btn-profile-close`)?.addEventListener(`click`,()=>{b.close()})}})}catch(e){console.error(e),v.error(`Error al cargar la información detallada de la clase`),b.close()}}}function vl(e){e.querySelector(`#btn-help-clases`)?.addEventListener(`click`,()=>{Rn.open({title:`Clases`,intro:`Gestión completa de clases: creación, horarios, asignación de maestros, inscripción de alumnos y control de capacidad.`,sections:[{icon:`bi-easel2`,title:`Lista de clases`,description:`Todas las clases del sistema. Filtrá por instrumento, nivel y estado. Las activas aparecen primero.`,color:`#3b82f6`},{icon:`bi-clock`,title:`Horarios`,description:`Cada clase puede tener múltiples horarios semanales. El sistema detecta conflictos de salón y de maestro automáticamente.`,color:`#6366f1`},{icon:`bi-people`,title:`Inscripción de alumnos`,description:`"Grupal": todos comparten el horario. "Rotativa (Turnos)": cada alumno tiene su propio horario individual dentro de la clase.`,color:`#10b981`},{icon:`bi-bar-chart`,title:`Capacidad`,description:`Barra de ocupación: inscriptos vs capacidad máxima. Rojo cuando supera el 90%.`,color:`#f59e0b`},{icon:`bi-person-workspace`,title:`Maestro titular y suplente`,description:`Cada clase tiene un maestro principal (obligatorio) y puede tener suplente (opcional). Ambos aparecen en el perfil del maestro.`,color:`#6b7280`}]})}),e.querySelector(`#btnAgregarClase`)?.addEventListener(`click`,()=>{bn(null,{maestros:H.maestros,salones:H.salones,programas:H.programas,alumnos:H.alumnos,onSuccess:()=>ll(e)})}),e.querySelector(`#btn-vista-tabla`)?.addEventListener(`click`,()=>{H.vista=`tabla`,fl(e),vl(e)}),e.querySelector(`#btn-vista-calendario`)?.addEventListener(`click`,()=>{H.vista=`calendario`,fl(e),vl(e)}),e.querySelector(`#buscar`)?.addEventListener(`input`,yl),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,yl);let t=e.querySelector(`#view-content`);t?.addEventListener(`change`,t=>{if(t.target&&t.target.id===`toggle-empty-days`){H.mostrarDiasVacios=t.target.checked;let n=e.querySelector(`.weekly-schedule-grid`);n&&(H.mostrarDiasVacios?n.classList.remove(`hide-empty-days`):n.classList.add(`hide-empty-days`))}}),t?.addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id], .time-block-card[data-id]`);if(t){let e=t.dataset.id,n=H.clasesOriginales.find(t=>t.id===e);n&&_l(n)}})}function yl(){let e=H.container.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=H.container.querySelector(`#filtroEstado`)?.value||`todos`;H.clases=H.clasesOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||n.instrumento.toLowerCase().includes(e),i=t===`todos`||n.estado===t;return r&&i});let n=H.container.querySelector(`#view-content`);n&&(n.innerHTML=H.vista===`tabla`?pl():gl())}function bl(e){let t=H.clasesOriginales.find(t=>t.id===e);t&&b.open({title:`⚠️ Eliminar Clase`,saveText:`Eliminar Definitivamente`,body:`<p>¿Estás seguro de eliminar la clase <strong>${h(t.nombre)}</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await ae(e),v.success(`Clase eliminada`),ll(H.container),!0}catch(e){return v.error(e.message),!1}}})}function xl(){S.register(`clases`,ll)}var U={timeline:[],periodos:[],periodoActivo:null,clases:[],resumenGlobal:null,cargando:!1,filtroPeriodo:null,filtroClase:`todas`,container:null};async function Sl(e){if(e)try{U.container=e,U.cargando=!0,wl(e);let[t,n,a]=await Promise.all([r(),i(),we()]);U.periodos=t,U.periodoActivo=n,n?.id?U.filtroPeriodo=n.id:t&&t.length>0?U.filtroPeriodo=t[0].id:U.filtroPeriodo=null,U.clases=a,await Cl(),El(e),Al(e)}catch(t){console.error(t),Tl(e,t.message)}}async function Cl(){let{timelineByDate:e,resumenGlobal:t}=await f({periodoId:U.filtroPeriodo});U.timeline=e||[],U.resumenGlobal=t||{totalClases:0,totalPresentes:0,totalAusentes:0,totalJustificados:0,totalRegistros:0,totalSesiones:0}}function wl(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `}function Tl(e,t){e.innerHTML=`
    <div class="alert alert-danger m-3">
      <h5 class="alert-heading">Error al cargar asistencias</h5>
      <p>${h(t)}</p>
      <button class="btn btn-primary btn-sm" id="retry-btn">Reintentar</button>
    </div>
  `,e.querySelector(`#retry-btn`)?.addEventListener(`click`,()=>Sl(e))}function El(e){e.innerHTML=`
    <div class="page-container">
      <div class="asistencias-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-calendar-check fs-4"></i>
          </div>
          <div>
            <h1 class="asistencias-title-premium page-title mb-0">Asistencias</h1>
            <p class="text-muted small mb-0">${U.resumenGlobal?.totalRegistros||0} registros en total</p>
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
            <div class="stat-value">${U.resumenGlobal?.totalRegistros||0}</div>
          </div>
          <div class="stat-card stat-present">
            <div class="stat-label">Presentes</div>
            <div class="stat-value">${U.resumenGlobal?.totalPresentes||0}</div>
          </div>
          <div class="stat-card stat-absent">
            <div class="stat-label">Ausentes</div>
            <div class="stat-value">${U.resumenGlobal?.totalAusentes||0}</div>
          </div>
          <div class="stat-card stat-justified">
            <div class="stat-label">Justificados</div>
            <div class="stat-value">${U.resumenGlobal?.totalJustificados||0}</div>
          </div>
          <div class="stat-card stat-sessions">
            <div class="stat-label">Sesiones</div>
            <div class="stat-value">${U.resumenGlobal?.totalSesiones||0}</div>
          </div>
        </div>
      </div>

      <div class="asistencias-filter-toolbar mb-4">
        <div class="premium-select-container" style="max-width: 250px;">
          <i class="bi bi-calendar3 select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-periodo">
            ${U.periodos.map(e=>`<option value="${e.id}" ${e.id===U.filtroPeriodo?`selected`:``}>${h(e.nombre)}</option>`).join(``)}
          </select>
        </div>
      </div>

      <!-- Acordeons por Día -->
      <div class="accordion accordion-asistencias" id="accordion-dias">
        ${Dl()}
      </div>
    </div>
  `}function Dl(){return U.timeline.length===0?`<div class="text-center py-5 text-muted"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay clases registradas.</div>`:U.timeline.map((e,t)=>{let n=kl(e.fecha),r=`accordion-fecha-${t}`,i=e.clases.map((e,n)=>{let r=`accordion-clase-${t}-${n}`,i=e.hora_inicio?`${e.hora_inicio.slice(0,5)} - ${e.hora_fin?.slice(0,5)||`??:??`}`:`Sin horario`;return`
        <div class="accordion-item accordion-clase">
          <h2 class="accordion-header" id="heading-clase-${t}-${n}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${r}" aria-expanded="false" aria-controls="${r}">
              <div class="clase-header-info">
                <div class="clase-name">${h(e.clase_nombre)}</div>
                <div class="clase-meta">
                  <span class="horario">${i}</span>
                  <span class="maestro">Prof. ${h(e.maestro_nombre)}</span>
                  ${e.maestro_auxiliar_nombre?`<span class="auxiliar">Aux. ${h(e.maestro_auxiliar_nombre)}</span>`:``}
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
              ${Ol(e)}
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
    `}).join(``)}function Ol(e){let t=e.asistencias||[],n=t.filter(e=>e.estado===`presente`),r=t.filter(e=>e.estado===`ausente`),i=t.filter(e=>e.estado===`justificado`),a=(e,t,n)=>t.length===0?``:`
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
              <span>${h(e.alumno_nombre||`Sin nombre`)}</span>
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
              ${h(e.observacion_sesion||e.observacion_clase||`Sin observaciones registradas`)}
            </p>
          </div>
        </div>
      `:`
        <div class="text-muted small text-center py-3">
          <i class="bi bi-info-circle me-2"></i>No hay observaciones registradas para esta clase.
        </div>
      `}
    </div>
  `}function kl(e){return new Date(e+`T12:00:00`).toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`})}function Al(e){e.querySelector(`#select-periodo`)?.addEventListener(`change`,async e=>{U.filtroPeriodo=e.target.value,await jl()}),e.querySelector(`#accordion-dias`)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="view-detail"]`);t&&Ml(t.dataset.id)}),e.querySelector(`#btn-nueva-sesion`)?.addEventListener(`click`,()=>Nl())}async function jl(){let e=U.container;v.info(`Cargando asistencias...`),await Cl();let t=e.querySelector(`.asistencias-header-premium p.text-muted`);t&&(t.textContent=`${U.resumenGlobal?.totalRegistros||0} registros en total`);let n=e.querySelector(`.stats-panel`);n&&(n.innerHTML=`
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <div class="stat-label">Total Registros</div>
          <div class="stat-value">${U.resumenGlobal?.totalRegistros||0}</div>
        </div>
        <div class="stat-card stat-present">
          <div class="stat-label">Presentes</div>
          <div class="stat-value">${U.resumenGlobal?.totalPresentes||0}</div>
        </div>
        <div class="stat-card stat-absent">
          <div class="stat-label">Ausentes</div>
          <div class="stat-value">${U.resumenGlobal?.totalAusentes||0}</div>
        </div>
        <div class="stat-card stat-justified">
          <div class="stat-label">Justificados</div>
          <div class="stat-value">${U.resumenGlobal?.totalJustificados||0}</div>
        </div>
        <div class="stat-card stat-sessions">
          <div class="stat-label">Sesiones</div>
          <div class="stat-value">${U.resumenGlobal?.totalSesiones||0}</div>
        </div>
      </div>
    `);let r=e.querySelector(`#accordion-dias`);r&&(r.innerHTML=Dl()),Al(e),v.success(`Asistencias cargadas`)}async function Ml(e){v.info(`Cargando detalle...`);try{let t=await ee(e);b.open({title:`Sesión: ${t.sesion.claseNombre}`,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
        <div class="row g-4">
          <div class="col-md-8">
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Tema Principal</label>
            <p class="fw-semibold">${h(t.sesion.temaPrincipal||`No especificado`)}</p>
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Observaciones Generales</label>
            <p class="text-secondary small">${h(t.sesion.observacionesGenerales||`Sin observaciones.`)}</p>
          </div>
          <div class="col-md-4 bg-body-tertiary p-3 rounded">
            <div class="d-flex justify-content-between mb-2"><span>Fecha:</span> <strong>${t.sesion.fecha}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${(t.sesion.horaInicio||`--:--`).slice(0,5)} - ${(t.sesion.horaFin||`--:--`).slice(0,5)}</strong></div>
            <div class="d-flex justify-content-between"><span>Maestro:</span> <strong>${h(t.sesion.maestroNombre)}</strong></div>
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
                      <td>${h(e.alumnoNombre)}</td>
                      <td class="text-center">
                        <span class="badge bg-${n[e.estado]?.css||`secondary`}">${n[e.estado]?.label||e.estado}</span>
                      </td>
                      <td class="small text-muted">${h(e.observacion||e.justificacionTexto||`-`)}</td>
                    </tr>
                  `).join(``)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `})}catch(e){v.error(`Error al cargar detalle: `+e.message)}}async function Nl(){v.info(`Funcionalidad de toma manual en desarrollo. Use el flujo desde la Ruta Gamificada.`)}function Pl({titulo:e,valor:t,subtitulo:n,colorClass:r=`primary`,icono:i,tendencia:a}){let o=a&&[`subiendo`,`bajando`,`estable`].includes(a),s=a===`subiendo`?`↑`:a===`bajando`?`↓`:`→`,c=a===`subiendo`?`text-success`:a===`bajando`?`text-danger`:`text-muted`;return`
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
  `}var Fl={periodoActivo:null,periodos:[],datos:{programas:{},niveles:{},totales:{sesiones:0,presentes:0,ausentes:0,justificados:0}},cargando:!1};async function Il(e){Fl.cargando=!0,e.innerHTML=Ll(),await Rl(),Fl.cargando=!1,Bl(e)}function Ll(){return`
    <div class="admin-report-view">
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="text-muted">Cargando reportes de asistencia...</p>
      </div>
    </div>
  `}async function Rl(){let[e,t]=await Promise.all([r(),i()]);Fl.periodos=e,Fl.periodoActivo=t,t&&(Fl.datos=zl(await fe({periodoId:t.id})))}function zl(e){let t={},n={},r=0,i=0,a=0,o=0;for(let s of e)for(let e of s.sesiones){let s=e.claseNombre?.split(`-`)[0]?.trim()||`General`,c=e.instrumento||`General`;t[s]||(t[s]={total:0,presentes:0,ausentes:0,justificados:0}),t[s].total+=e.totalRegistros||0,t[s].presentes+=e.totalPresentes||0,t[s].ausentes+=e.totalAusentes||0,t[s].justificados+=e.totalJustificados||0,n[c]||(n[c]={total:0,presentes:0,ausentes:0,justificados:0}),n[c].total+=e.totalRegistros||0,n[c].presentes+=e.totalPresentes||0,n[c].ausentes+=e.totalAusentes||0,n[c].justificados+=e.totalJustificados||0,r++,i+=e.totalPresentes||0,a+=e.totalAusentes||0,o+=e.totalJustificados||0}return{programas:t,niveles:n,totales:{sesiones:r,presentes:i,ausentes:a,justificados:o}}}function Bl(e){let{programas:t,niveles:n,totales:r}=Fl.datos,i=r.presentes+r.ausentes+r.justificados?Math.round(r.presentes/i*100):0;e.innerHTML=`
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
        <div class="col-md-3">${Pl({titulo:`Sesiones`,valor:r.sesiones,colorClass:`primary`,icono:`bi-calendar3`})}</div>
        <div class="col-md-3">${Pl({titulo:`Tasa Asistencia`,valor:`${i}%`,colorClass:i>=80?`success`:i>=50?`warning`:`danger`,icono:`bi-check-circle`})}</div>
        <div class="col-md-3">${Pl({titulo:`Ausentes`,valor:r.ausentes,colorClass:`danger`,icono:`bi-x-circle`})}</div>
        <div class="col-md-3">${Pl({titulo:`Justificados`,valor:r.justificados,colorClass:`warning`,icono:`bi-file-earmark-check`})}</div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-pie-chart me-2"></i>Por Programa</h5>
            </div>
            <div class="card-body" id="programasChart">
              ${Vl(t,`programa`)}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-bar-chart me-2"></i>Por Instrumento/Nivel</h5>
            </div>
            <div class="card-body" id="nivelesChart">
              ${Vl(n,`nivel`)}
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
  `}function Vl(e,t){if(!Object.keys(e).length)return`<p class="text-muted text-center py-3">Sin datos disponibles</p>`;let n=Object.entries(e).sort((e,t)=>t[1].presentes+t[1].ausentes-(e[1].presentes+e[1].ausentes));return Math.max(...n.map(([,e])=>e.presentes+e.ausentes+e.justificados)),n.slice(0,8).map(([e,t])=>{let n=t.presentes+t.ausentes+t.justificados,r=n?t.presentes/n*100:0,i=n?t.ausentes/n*100:0,a=n?t.justificados/n*100:0;return`
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
    `}).join(``)}function Hl(){S.register(`asistencias`,Sl),S.register(`asistencias-reportes`,Il)}var Ul=e({default:()=>Gl,sesiones:()=>Wl}),Wl=[{id:`sesion_001`,clase_id:`clase_001`,maestro_id:`maestro_001`,fecha:`2026-05-05`,hora_inicio:`16:00`,hora_fin:`17:00`,tema:`Escala Do Mayor - posición básica`,contenido:`Practicar primera posición, arco arriba y abajo. Ejercicios de flexibilidad.`,asistencia:{presentes:8,ausentes:2,justificados:2},tipo:`regular`,estado:`registrada`,created_at:`2026-05-05T17:30:00Z`},{id:`sesion_002`,clase_id:`clase_002`,maestro_id:`maestro_002`,fecha:`2026-05-05`,hora_inicio:`17:00`,hora_fin:`18:00`,tema:`Arpegios en Do mayor`,contenido:`Digitación de arpegios, cambio de posición suave.`,asistencia:{presentes:6,ausentes:1,justificados:1},tipo:`regular`,estado:`registrada`,created_at:`2026-05-05T18:15:00Z`},{id:`sesion_003`,clase_id:`clase_001`,maestro_id:`maestro_001`,fecha:`2026-04-30`,hora_inicio:`16:00`,hora_fin:`17:00`,tema:`Notas sostenido - práctica`,contenido:`Introducción a notas sostenido, ejercicios de digitación.`,asistencia:{presentes:7,ausentes:3,justificados:1},tipo:`regular`,estado:`registrada`,created_at:`2026-04-30T17:20:00Z`},{id:`sesion_004`,clase_id:`clase_003`,maestro_id:`maestro_001`,fecha:`2026-04-28`,hora_inicio:`18:00`,hora_fin:`19:30`,tema:`Técnica de rasgueo avanzado`,contenido:`Patrones de rasgueo, práctica de pieza de examen.`,asistencia:{presentes:9,ausentes:1,justificados:0},tipo:`regular`,estado:`registrada`,created_at:`2026-04-28T19:45:00Z`},{id:`sesion_emergente_001`,clase_id:`clase_001`,maestro_id:`maestro_001`,fecha:`2026-05-08`,hora_inicio:`16:00`,hora_fin:`17:00`,tema:`CLASE ESPECIAL - Concerto`,contenido:`Preparación para recital de fin de semester. Sesión adicional programada.`,asistencia:null,tipo:`emergente`,motivo:`Preparación para Concerto de fin de año`,estado:`pendiente`,created_at:`2026-05-05T10:00:00Z`},{id:`sesion_emergente_002`,clase_id:`clase_004`,maestro_id:`maestro_003`,fecha:`2026-05-10`,hora_inicio:`15:00`,hora_fin:`16:00`,tema:`CLASE DE REEMPLAZO`,contenido:`Reemplazo de clase del 9 de mayo (feriado).`,asistencia:null,tipo:`emergente`,motivo:`Recuperación por feriado`,estado:`pendiente`,created_at:`2026-05-05T11:30:00Z`},{id:`sesion_005`,clase_id:`clase_005`,maestro_id:`maestro_004`,fecha:`2026-04-29`,hora_inicio:`16:30`,hora_fin:`17:30`,tema:`Repertorio合唱`,contenido:`Práctica de canciones para actuación escolar.`,asistencia:{presentes:22,ausentes:2,justificados:1},tipo:`regular`,estado:`registrada`,created_at:`2026-04-29T18:00:00Z`}],Gl={sesiones:Wl},Kl=!window.location.href.includes(`supabase`);async function ql(e={}){if(Kl){let t=[...Gl.sesiones];return e.fecha&&(t=t.filter(t=>t.fecha===e.fecha)),e.clase_id&&(t=t.filter(t=>t.clase_id===e.clase_id)),e.maestro_id&&(t=t.filter(t=>t.maestro_id===e.maestro_id)),e.tipo&&(t=t.filter(t=>t.tipo===e.tipo)),t}let t=_.from(`sesiones_clase`).select(`*`).order(`fecha`,{ascending:!1});e.fecha&&(t=t.eq(`fecha`,e.fecha)),e.clase_id&&(t=t.eq(`clase_id`,e.clase_id)),e.maestro_id&&(t=t.eq(`maestro_id`,e.maestro_id)),e.tipo&&(t=t.eq(`tipo`,e.tipo));let{data:n,error:r}=await t;if(r)throw console.error(`Error cargando sesiones:`,r.message),Error(`No se pudieron cargar las sesiones`);return n}async function Jl(e){if(!e.clase_id)throw Error(`La clase es obligatoria`);if(!e.fecha)throw Error(`La fecha es obligatoria`);if(!e.tema)throw Error(`El tema es obligatorio`);let t=null,n=null;if(!Kl){let r=[`domingo`,`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`][new Date(e.fecha).getDay()].toLowerCase(),{data:i,error:a}=await _.from(`clase_horarios`).select(`id, salon_id`).eq(`clase_id`,e.clase_id).eq(`dia`,r).limit(1);!a&&i&&i.length>0&&(t=i[0].id,n=i[0].salon_id)}let r={clase_id:e.clase_id,maestro_id:e.maestro_id||null,fecha:e.fecha,hora_inicio:e.hora_inicio||null,hora_fin:e.hora_fin||null,horario_id:t,salon_id:n,tema:e.tema.trim(),contenido:e.contenido?.trim()||null,motivo:e.motivo?.trim()||null,tipo:e.tipo||`regular`,estado:e.estado||`pendiente`,es_codocencia:e.es_codocencia||!1,maestro_auxiliar_id:e.maestro_auxiliar_id||null,asistencia:null};if(Kl){let e={...r,id:`sesion_${Date.now()}`,created_at:new Date().toISOString()};return Gl.sesiones.push(e),e}let{data:i,error:a}=await _.from(`sesiones_clase`).insert([r]).select();if(a)throw console.error(`Error creando sesión:`,a.message),Error(`No se pudo crear la sesión`);return i[0]}async function Yl(e,t){let n={};if(t.tema!==void 0&&(n.tema=t.tema.trim()),t.contenido!==void 0&&(n.contenido=t.contenido?.trim()||null),t.hora_inicio!==void 0&&(n.hora_inicio=t.hora_inicio),t.hora_fin!==void 0&&(n.hora_fin=t.hora_fin),t.estado!==void 0&&(n.estado=t.estado),t.asistencia!==void 0&&(n.asistencia=t.asistencia),t.es_codocencia!==void 0&&(n.es_codocencia=t.es_codocencia),t.maestro_auxiliar_id!==void 0&&(n.maestro_auxiliar_id=t.maestro_auxiliar_id),Kl){let t=Gl.sesiones.findIndex(t=>t.id===e);if(t===-1)throw Error(`Sesión no encontrada`);return Gl.sesiones[t]={...Gl.sesiones[t],...n,updated_at:new Date().toISOString()},Gl.sesiones[t]}let{data:r,error:i}=await _.from(`sesiones_clase`).update(n).eq(`id`,e).select();if(i)throw console.error(`Error actualizando sesión:`,i.message),Error(`No se pudo actualizar la sesión`);return r[0]}async function Xl(e){if(Kl){let t=Gl.sesiones.findIndex(t=>t.id===e);if(t===-1)throw Error(`Sesión no encontrada`);return Gl.sesiones.splice(t,1),{success:!0}}let{error:t}=await _.from(`sesiones_clase`).delete().eq(`id`,e);if(t)throw console.error(`Error eliminando sesión:`,t.message),Error(`No se pudo eliminar la sesión`);return{success:!0}}async function Zl(e,t){return Yl(e,{asistencia:t||[]})}async function Ql(e){if(Kl)return Gl.sesiones.filter(t=>t.maestro_auxiliar_id===e);let{data:t,error:n}=await _.from(`sesiones_clase`).select(`*`).eq(`maestro_auxiliar_id`,e).order(`fecha`,{ascending:!1});if(n)throw console.error(`Error cargando sesiones de co-docencia:`,n.message),Error(`Error al cargar sesiones`);return t}async function $l(e){if(Kl)return tt.clases.filter(t=>t.maestro_titular_id===e||t.maestro_auxiliar_id===e);let{data:t,error:n}=await _.from(`clases`).select(`*`).or(`maestro_principal_id.eq.${e},maestro_auxiliar_id.eq.${e}`);if(n)throw console.error(`Error cargando clases del maestro:`,n.message),Error(`Error al cargar clases`);return t}var eu=class{constructor(){this.planificaciones=[],this.planificacionActual=null,this.sesiones=[],this.clases=[],this.maestroActualId=null,this.esCoDocencia=!1,this.cargando=!1,this.error=null,this.listeners=[]}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}setMaestroActual(e,t=!1){this.maestroActualId=e,this.esCoDocencia=t,this.notifyListeners()}notifyListeners(){this.listeners.forEach(e=>{e({planificaciones:this.planificaciones,planificacionActual:this.planificacionActual,sesiones:this.sesiones,clases:this.clases,maestroActualId:this.maestroActualId,esCoDocencia:this.esCoDocencia,cargando:this.cargando,error:this.error})})}async fetchPlanificaciones(){this.cargando=!0,this.error=null,this.notifyListeners();try{return this.planificaciones=await ze(this.maestroActualId),this.cargando=!1,this.notifyListeners(),this.planificaciones}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async fetchPlanificacionesConDetalles(){this.cargando=!0,this.error=null,this.notifyListeners();try{return this.planificaciones=await Ge(this.maestroActualId),this.cargando=!1,this.notifyListeners(),this.planificaciones}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async fetchPlanificacion(e){this.cargando=!0,this.error=null,this.notifyListeners();try{return this.planificacionActual=await Ie(e),this.cargando=!1,this.notifyListeners(),this.planificacionActual}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}reset(){this.planificaciones=[],this.planificacionActual=null,this.cargando=!1,this.error=null,this.notifyListeners()}search(e){if(!e)return this.planificaciones;let t=e.toLowerCase();return this.planificaciones.filter(e=>(e.tema||``).toLowerCase().includes(t)||(e.contenido||``).toLowerCase().includes(t)||(e.objetivos||``).toLowerCase().includes(t)||(e.observaciones||``).toLowerCase().includes(t))}filterByClase(e){return this.planificaciones.filter(t=>t.clase_id===e)}filterByMaestro(e){return this.planificaciones.filter(t=>t.maestro_id===e)}filterByEstado(e){return this.planificaciones.filter(t=>t.estado===e)}getById(e){return this.planificaciones.find(t=>t.id===e)||null}getActivas(){return this.planificaciones.filter(e=>e.estado===`planificado`)}count(){return this.planificaciones.length}countByEstado(){return this.planificaciones.reduce((e,t)=>{let n=t.estado||`Sin estado`;return e[n]=(e[n]||0)+1,e},{})}countByClase(){return this.planificaciones.reduce((e,t)=>{let n=t.clase_id||`Sin clase`;return e[n]=(e[n]||0)+1,e},{})}async fetchSesiones(e={}){this.cargando=!0,this.error=null,this.notifyListeners();try{return this.sesiones=await ql(e),this.cargando=!1,this.notifyListeners(),this.sesiones}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async fetchClasesDelMaestro(e){this.cargando=!0,this.error=null;try{return this.clases=await $l(e),this.cargando=!1,this.notifyListeners(),this.clases}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async fetchSesionesCoDocencia(e){this.cargando=!0,this.error=null;try{return this.sesiones=await Ql(e),this.esCoDocencia=!0,this.cargando=!1,this.notifyListeners(),this.sesiones}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async crearSesionEmergente(e){this.cargando=!0,this.error=null;try{let t=await Jl({...e,maestro_id:this.maestroActualId});return this.sesiones.unshift(t),this.cargando=!1,this.notifyListeners(),t}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async actualizarSesionPasada(e,t){this.cargando=!0,this.error=null;try{let n=await Yl(e,t),r=this.sesiones.findIndex(t=>t.id===e);return r!==-1&&(this.sesiones[r]={...this.sesiones[r],...n}),this.cargando=!1,this.notifyListeners(),n}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async eliminarSesion(e){this.cargando=!0,this.error=null;try{return await Xl(e),this.sesiones=this.sesiones.filter(t=>t.id!==e),this.cargando=!1,this.notifyListeners(),{success:!0}}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async registrarAsistencia(e,t){this.cargando=!0,this.error=null;try{let n=await Zl(e,t),r=this.sesiones.findIndex(t=>t.id===e);return r!==-1&&(this.sesiones[r]={...this.sesiones[r],...n}),this.cargando=!1,this.notifyListeners(),n}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}getSesionesPorFecha(e){return this.sesiones.filter(t=>t.fecha===e)}getSesionesEmergentes(){return this.sesiones.filter(e=>e.tipo===`emergente`)}getSesionesRegulares(){return this.sesiones.filter(e=>e.tipo===`regular`)}puedeEditarSesion(e){return this.esCoDocencia?e.maestro_auxiliar_id===this.maestroActualId:e.maestro_id===this.maestroActualId}resetSesiones(){this.sesiones=[],this.clases=[],this.maestroActualId=null,this.esCoDocencia=!1,this.notifyListeners()}},tu=null;function nu(){return tu||=new eu,tu}async function ru(e){let{data:t,error:n}=await _.from(`cobertura_alumno_objetivo`).upsert(e,{onConflict:`alumno_id,objetivo_id`}).select();if(n)throw n;return t}async function iu(e){let{data:t,error:n}=await _.from(`cobertura_alumno_objetivo`).select(`
      id, nivel, confirmado, fecha, plan_id, objetivo_id,
      curriculo_objetivos ( id, descripcion, pilar_id,
        curriculo_pilares ( id, nombre )
      )
    `).eq(`alumno_id`,e);if(n)throw n;return t||[]}function au(){return`/functions/v1/groq-proxy`}async function ou(){let{data:{session:e}}=await _.auth.getSession();return{Authorization:`Bearer ${e?.access_token??``}`,"Content-Type":`application/json`,apikey:``}}async function su(e,{maxTokens:t,temperature:n,responseFormat:r}={}){let i=await ou(),a={model:x.groq.model,messages:e,...t&&{max_tokens:t},...n!==void 0&&{temperature:n},...r&&{response_format:r}},o=await fetch(`${au()}/chat`,{method:`POST`,headers:i,body:JSON.stringify(a)}),s=await o.json();if(!o.ok||s.error)throw Error(s.error?.message??`Groq proxy error ${o.status}`);return s.choices[0].message.content.trim()}async function cu(e,t,n){let r=`Eres un asistente pedagógico musical. Dado el contenido de un plan de clase y una lista de objetivos curriculares, identifica cuáles objetivos probablemente se cubrieron.

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
Solo incluye objetivos que tengan evidencia real en el plan. No inventes coberturas.`;if(x.isDemoMode)return{success:!0,coberturas:t.slice(0,2).flatMap(e=>n.slice(0,2).map(t=>({alumno:e,objetivo_id:t.id,nivel:`en_proceso`,razon:`Demo: objetivo relacionado con el tema`}))),isMock:!0};try{let e=await su([{role:`user`,content:r}],{maxTokens:1500,temperature:.3,responseFormat:{type:`json_object`}});return{success:!0,coberturas:JSON.parse(e||`{"coberturas":[]}`).coberturas||[],isMock:!1}}catch(e){return console.error(`extraerCobertura error:`,e),{success:!1,coberturas:[],error:e.message}}}async function lu(e,t,n){let r=`Eres un asistente pedagógico musical. Genera un borrador de plan de clase personalizado.

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
Sé específico y pedagógicamente relevante para el instrumento y nivel.`;if(x.isDemoMode)return{success:!0,plan:{tema:`Clase de ${e.instrumento} — Nivel ${e.nivel}`,objetivos:t[0]?.descripcion||`Repaso general`,contenido:`Ejercicios de calentamiento, escala mayor, pieza del repertorio.`,recursos:[`Partitura del repertorio`,`Metrónomo`]},isMock:!0};try{let e=await su([{role:`user`,content:r}],{maxTokens:800,temperature:.7,responseFormat:{type:`json_object`}});return{success:!0,plan:JSON.parse(e||`{}`),isMock:!1}}catch(e){return console.error(`sugerirPlan error:`,e),{success:!1,plan:null,error:e.message}}}async function uu(e,t,n,r){let i=`Eres un mentor pedagógico musical. Analiza el trabajo de un maestro y da retroalimentación constructiva.

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

Tono: colega experto, respetuoso, propositivo. Sin tecnicismos innecesarios. Responde en español.`;if(x.isDemoMode)return{success:!0,feedback:`Tu enfoque en las últimas semanas muestra consistencia y dedicación. Se nota claridad en la presentación de contenidos técnicos.

Hay oportunidad de ampliar el trabajo en repertorio variado y lectura a primera vista.

Para las próximas semanas, incorporá al menos una pieza nueva por mes y dedicá 5-10 minutos a ejercicios de lectura rítmica.`,isMock:!0};try{return{success:!0,feedback:await su([{role:`user`,content:i}],{maxTokens:600,temperature:.8}),isMock:!1}}catch(e){return console.error(`analizarEnfoque error:`,e),{success:!1,feedback:``,error:e.message}}}var du=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),fu=`
<style id="cobertura-modal-style">
.cob-alumno-block { border: 1px solid var(--bs-border-color); border-radius:8px; padding:.75rem; margin-bottom:.75rem; }
.cob-alumno-name { font-weight:600; margin-bottom:.5rem; }
.cob-obj-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.25rem; font-size:.875rem; }
.cob-nivel-sel { width: auto; font-size:.8rem; }
.cob-ai-badge { font-size:.7rem; color: var(--bs-warning-text-emphasis); }
</style>`;async function pu({plan:e,claseId:t,instrumento:n,nivel:r,maestroId:i,onConfirm:s,onSkip:c}){let l=document.createElement(`div`);l.innerHTML=`${fu}
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
    </div>`,document.body.appendChild(l);let u=l.querySelector(`#cob-modal`),d=new bootstrap.Modal(u),f=[];l.querySelector(`#cob-btn-skip`).addEventListener(`click`,()=>{d.hide(),c?.()}),l.querySelector(`#cob-btn-confirm`).addEventListener(`click`,async()=>{let t=f.filter(e=>e.checked).map(t=>({alumno_id:t.alumno_id,objetivo_id:t.objetivo_id,plan_id:e.id,maestro_id:i,nivel:t.nivel,confirmado:!0,fecha:e.fecha_inicio||new Date().toISOString().slice(0,10)}));try{t.length>0&&await ru(t),v.success(`Cobertura registrada`),d.hide(),s?.()}catch(e){v.error(e.message)}}),u.addEventListener(`hidden.bs.modal`,()=>l.remove()),d.show();try{let i=[],s=null;if(t){let{data:e}=await _.from(`clases`).select(`ruta_id`).eq(`id`,t).single();e?.ruta_id&&(s=await dn(e.ruta_id),i=s.objetivos.map(e=>({id:e.objetivo_id,descripcion:e.descripcion,pilar_nombre:null})))}let c=null;i.length===0&&n&&r&&(c=await o(n,r),c&&(i=c.curriculo_pilares.flatMap(e=>e.curriculo_objetivos.map(t=>({...t,pilar_nombre:e.nombre})))));let u=a(e.notas_dsl||e.contenido||``).alumnos||[],d=[];if(u.length>0||t){let{data:e}=await _.from(`alumnos`).select(`id, nombre_completo`);u.length>0&&(d=(e||[]).filter(e=>u.some(t=>e.nombre_completo.toLowerCase().includes(t.toLowerCase()))))}if(d.length===0&&t){let{data:e}=await _.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,t);d=(e||[]).map(e=>e.alumnos).filter(Boolean)}let m=[];c&&i.length>0&&(m=(await cu({tema:e.tema,objetivos:e.objetivos,contenido:e.contenido,notas_dsl:e.notas_dsl},u,i.map(e=>({id:e.id,descripcion:e.descripcion})))).coberturas||[]),f=[],d.forEach(e=>{i.forEach(t=>{let n=m.find(n=>n.objetivo_id===t.id&&e.nombre_completo.toLowerCase().includes((n.alumno||``).toLowerCase()));f.push({alumno_id:e.id,alumno_nombre:e.nombre_completo,objetivo_id:t.id,obj_descripcion:t.descripcion,pilar_nombre:t.pilar_nombre,nivel:n?.nivel||`en_proceso`,checked:!!n,ai_suggested:!!n,razon:n?.razon||``})})}),p(),l.querySelector(`#cob-btn-confirm`).disabled=!1}catch(e){document.getElementById(`cob-body`).innerHTML=`
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se pudo analizar automáticamente: ${e.message}
        <br><small>Podés saltar este paso o confirmar sin cobertura.</small>
      </div>`,l.querySelector(`#cob-btn-confirm`).disabled=!1}function p(){let e=document.getElementById(`cob-body`);if(!f.length){e.innerHTML=`
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No hay ruta de contenidos asignada o currículo activo, o no se encontraron alumnos.
          Podés saltar este paso.
        </div>`;return}let t={};f.forEach(e=>{t[e.alumno_id]||(t[e.alumno_id]={nombre:e.alumno_nombre,rows:[]}),t[e.alumno_id].rows.push(e)}),e.innerHTML=`
      <p class="text-muted small mb-3">
        <i class="bi bi-robot me-1"></i>
        La IA pre-marcó los objetivos que probablemente se cubrieron. Revisá y ajustá según corresponda.
      </p>
      ${Object.entries(t).map(([e,{nombre:t,rows:n}])=>`
        <div class="cob-alumno-block">
          <div class="cob-alumno-name"><i class="bi bi-person me-1"></i>${du(t)}</div>
          ${n.map(e=>{let t=f.indexOf(e);return`
            <div class="cob-obj-row">
              <input type="checkbox" class="form-check-input cob-check" data-idx="${t}" ${e.checked?`checked`:``}>
              <span style="flex:1">
                <span class="text-muted small">${du(e.pilar_nombre)} /</span> ${du(e.obj_descripcion)}
                ${e.ai_suggested?`<span class="cob-ai-badge ms-1"><i class="bi bi-stars"></i> IA</span>`:``}
              </span>
              <select class="form-select form-select-sm cob-nivel-sel" data-idx="${t}" ${e.checked?``:`disabled`}>
                <option value="iniciando" ${e.nivel===`iniciando`?`selected`:``}>Iniciando</option>
                <option value="en_proceso" ${e.nivel===`en_proceso`?`selected`:``}>En proceso</option>
                <option value="logrado" ${e.nivel===`logrado`?`selected`:``}>Logrado</option>
              </select>
            </div>`}).join(``)}
        </div>`).join(``)}`,e.querySelectorAll(`.cob-check`).forEach(t=>{t.addEventListener(`change`,()=>{let n=+t.dataset.idx;f[n].checked=t.checked;let r=e.querySelector(`.cob-nivel-sel[data-idx="${n}"]`);r&&(r.disabled=!t.checked)})}),e.querySelectorAll(`.cob-nivel-sel`).forEach(e=>{e.addEventListener(`change`,()=>{f[+e.dataset.idx].nivel=e.value})})}}var mu=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);async function hu(e){e.innerHTML=`
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
    </div>`;let t={alumnos:[],selectedAlumnoId:null,selectedAlumno:null,cobertura:[],curriculo:null,maestroId:null,instrumento:null},{data:{user:n}}=await _.auth.getUser(),{data:r}=await _.from(`maestros`).select(`id, instrumento`).eq(`user_id`,n.id).single();t.maestroId=r?.id,t.instrumento=r?.instrumento;let{data:i}=await _.from(`alumnos_clases`).select(`alumnos(id, nombre_completo), clases(instrumento, plan_estudio, maestro_principal_id)`).eq(`clases.maestro_principal_id`,t.maestroId),a={};(i||[]).forEach(e=>{e.alumnos&&e.clases&&(a[e.alumnos.id]={...e.alumnos,instrumento:e.clases.instrumento,nivel:e.clases.plan_estudio})}),t.alumnos=Object.values(a);let s=e.querySelector(`#ap-alumno-sel`);s.innerHTML=`<option value="">Seleccionar alumno...</option>`+t.alumnos.map(e=>`<option value="${e.id}">${mu(e.nombre_completo)}</option>`).join(``),s.addEventListener(`change`,async()=>{let n=s.value;if(!n){e.querySelector(`#ap-brechas-content`).innerHTML=`<p class="text-muted small">Seleccioná un alumno.</p>`,e.querySelector(`#ap-btn-draft`).disabled=!0,t.selectedAlumnoId=null,t.selectedAlumno=null;return}t.selectedAlumnoId=n,t.selectedAlumno=t.alumnos.find(e=>e.id===n),e.querySelector(`#ap-btn-draft`).disabled=!1,await c()});async function c(){let n=e.querySelector(`#ap-brechas-content`);n.innerHTML=`<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-muted"></div></div>`;try{let e=t.selectedAlumno;if(t.curriculo=e.instrumento&&e.nivel?await o(e.instrumento,e.nivel):null,!t.curriculo){n.innerHTML=`<div class="alert alert-secondary py-2 small">Sin guía curricular definida para <strong>${mu(e.instrumento||`este instrumento`)}</strong> — <strong>${mu(e.nivel||`este nivel`)}</strong>.</div>`;return}t.cobertura=await iu(t.selectedAlumnoId);let r={};t.cobertura.forEach(e=>{let t=e.curriculo_objetivos?.id||e.objetivo_id;t&&(r[t]=e)});let i=t.curriculo.curriculo_pilares.flatMap(e=>e.curriculo_objetivos.map(t=>({...t,pilar_nombre:e.nombre}))),a=i.filter(e=>r[e.id]?.nivel===`logrado`).length,s=i.filter(e=>r[e.id]&&r[e.id].nivel!==`logrado`).length;n.innerHTML=`
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
                  <td class="text-muted">${mu(e.pilar_nombre)}</td>
                  <td>${mu(e.descripcion)}</td>
                  <td>${i}</td>
                  <td class="text-center">${a}</td>
                </tr>`}).join(``)}
            </tbody>
          </table>
        </div>`}catch(e){n.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}}e.querySelector(`#ap-btn-draft`).addEventListener(`click`,async()=>{if(!t.selectedAlumno)return;let n=e.querySelector(`#ap-btn-draft`),r=e.querySelector(`#ap-draft-content`);n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Generando...`,r.innerHTML=``;try{let n=t.selectedAlumno,i=t.curriculo?.curriculo_pilares?.flatMap(e=>e.curriculo_objetivos.map(e=>e))||[],a={};t.cobertura.forEach(e=>{let t=e.curriculo_objetivos?.id||e.objetivo_id;t&&(a[t]=e)});let o=i.filter(e=>!a[e.id]||a[e.id].nivel!==`logrado`),{data:s}=await _.from(`planificaciones`).select(`tema`).eq(`maestro_id`,t.maestroId).eq(`estado`,`ejecutado`).order(`created_at`,{ascending:!1}).limit(3),c=(s||[]).map(e=>e.tema),l=await lu({nombre:n.nombre_completo,instrumento:n.instrumento||`(sin instrumento)`,nivel:n.nivel||`(sin nivel)`},o,c);if(!l.success||!l.plan)throw Error(l.error||`Sin respuesta de la IA`);let u=l.plan;r.innerHTML=`
        <div class="card border-success border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-success bg-opacity-15 text-success">Borrador generado por IA</span>
              <button class="btn btn-sm btn-success" id="ap-btn-save-draft">
                <i class="bi bi-floppy me-1"></i>Guardar como plan
              </button>
            </div>
            <div class="mb-2"><span class="fw-semibold">Tema:</span> ${mu(u.tema||``)}</div>
            <div class="mb-2"><span class="fw-semibold">Objetivos:</span> ${mu(u.objetivos||``)}</div>
            <div class="mb-2"><span class="fw-semibold">Contenido:</span> ${mu(u.contenido||``)}</div>
            ${u.recursos?.length?`<div><span class="fw-semibold">Recursos:</span> ${u.recursos.map(e=>`<span class="badge bg-light text-dark border me-1">${mu(e)}</span>`).join(``)}</div>`:``}
          </div>
        </div>`,e.querySelector(`#ap-btn-save-draft`)?.addEventListener(`click`,()=>{document.dispatchEvent(new CustomEvent(`planificacion:nuevoPlan`,{detail:{tema:u.tema,objetivos:u.objetivos,contenido:u.contenido}})),v.success(`Borrador listo — abrí "Nuevo plan" para completar los detalles`)})}catch(e){r.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}finally{n.disabled=!1,n.innerHTML=`<i class="bi bi-stars me-1"></i>Generar borrador`}}),e.querySelector(`#ap-btn-feedback`).addEventListener(`click`,async()=>{let n=e.querySelector(`#ap-btn-feedback`),r=e.querySelector(`#ap-feedback-content`);n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Analizando...`,r.innerHTML=``;try{let n=new Date;n.setDate(n.getDate()-56);let{data:i}=await _.from(`planificaciones`).select(`tema, contenido, objetivos, instrumento`).eq(`maestro_id`,t.maestroId).eq(`estado`,`ejecutado`).gte(`created_at`,n.toISOString()),a=t.instrumento||i?.[0]?.instrumento||`Instrumento`,s=null;try{s=a?await o(a,null):null}catch{}let c=t.selectedAlumnoId&&t.selectedAlumno?`Alumno seleccionado: ${t.selectedAlumno.nombre_completo}. ${t.cobertura.length} objetivos trabajados.`:`No hay alumno seleccionado.`,l=await uu(a,i||[],s,c);if(!l.success)throw Error(l.error||`Sin respuesta de la IA`);r.innerHTML=`
        <div class="card border-warning border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge bg-warning bg-opacity-15 text-warning-emphasis">Análisis pedagógico</span>
              <button class="btn btn-sm btn-outline-secondary" id="ap-btn-regenerate">
                <i class="bi bi-arrow-clockwise me-1"></i>Regenerar
              </button>
            </div>
            <div class="text-body" style="line-height:1.7; white-space:pre-line">${mu(l.feedback)}</div>
          </div>
        </div>`,e.querySelector(`#ap-btn-regenerate`)?.addEventListener(`click`,()=>{e.querySelector(`#ap-btn-feedback`).click()})}catch(e){r.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}finally{n.disabled=!1,n.innerHTML=`<i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque`}})}var gu=`
<style id="curriculo-modal-style">
.cm-pilar { border: 1px solid var(--bs-border-color); border-radius: 8px; margin-bottom: .75rem; }
.cm-pilar-header { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; background:var(--bs-tertiary-bg); border-radius:7px 7px 0 0; }
.cm-pilar-body { padding:.5rem .75rem; }
.cm-obj-row { display:flex; align-items:center; gap:.5rem; padding:.25rem 0; border-bottom: 1px solid var(--bs-border-color-translucent); }
.cm-obj-row:last-child { border-bottom: none; }
.cm-obj-input { flex:1; }
</style>`;function _u(e){let t=document.getElementById(`curriculo-list-modal`);t&&t.remove();let n=document.createElement(`div`);n.id=`curriculo-list-modal`,n.innerHTML=`${gu}
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
    </div>`,document.body.appendChild(n);let r=n.querySelector(`#curriculo-list-modal-dialog`),i=new bootstrap.Modal(r);async function a(){let e=document.getElementById(`cl-body`);try{let t=await ne();if(t.length===0){e.innerHTML=`<p class="text-muted text-center py-4">No hay currículos creados aún.</p>`;return}e.innerHTML=`
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
        </table>`,e.querySelectorAll(`.cl-toggle`).forEach(e=>{e.addEventListener(`change`,async()=>{await te(e.dataset.id,e.checked),v.success(e.checked?`Currículo activado`:`Currículo desactivado`)})}),e.querySelectorAll(`.cl-btn-edit`).forEach(e=>{e.addEventListener(`click`,()=>yu(e.dataset.id,a))})}catch(t){e.innerHTML=`<p class="text-danger">${t.message}</p>`}}n.querySelector(`#cl-btn-nuevo`).addEventListener(`click`,()=>{vu(a)}),r.addEventListener(`hidden.bs.modal`,()=>{n.remove(),e?.()}),i.show(),a()}function vu(e){let t=document.createElement(`div`);t.innerHTML=`
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
    </div>`,document.body.appendChild(t);let n=t.querySelector(`#cc-modal`),r=new bootstrap.Modal(n);t.querySelector(`#cc-btn-save`).addEventListener(`click`,async()=>{let n=t.querySelector(`#cc-instrumento`).value.trim(),i=t.querySelector(`#cc-nivel`).value.trim();if(!n||!i){v.error(`Instrumento y nivel son obligatorios`);return}try{await s({instrumento:n,nivel:i,descripcion:t.querySelector(`#cc-desc`).value.trim()}),v.success(`Currículo creado`),r.hide(),e?.()}catch(e){v.error(e.message)}}),n.addEventListener(`hidden.bs.modal`,()=>t.remove()),r.show()}async function yu(e,n){let{data:r,error:i}=await _.from(`curriculos`).select(`id, instrumento, nivel, descripcion, curriculo_pilares(id, nombre, orden, curriculo_objetivos(id, descripcion, orden))`).eq(`id`,e).single();if(i){v.error(i.message);return}let a=document.createElement(`div`);a.innerHTML=`
    <div class="modal fade" id="ce-modal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-pencil-square me-2"></i>Editar: ${r.instrumento} — ${r.nivel}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ce-body"></div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(a);let o=a.querySelector(`#ce-modal`),s=new bootstrap.Modal(o);function c(){let e=document.getElementById(`ce-body`);e.innerHTML=`
      <div class="mb-3">
        <label class="form-label fw-semibold">Pilares</label>
        <div id="ce-pilares">
          ${(r.curriculo_pilares||[]).map(e=>`
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
      </div>`,e.querySelectorAll(`.pilar-nombre`).forEach(e=>{e.addEventListener(`blur`,async()=>{await p(e.closest(`[data-pilar-id]`).dataset.pilarId,{nombre:e.value.trim()})})}),e.querySelectorAll(`.pilar-del`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.closest(`[data-pilar-id]`).dataset.pilarId;confirm(`¿Eliminar este pilar y todos sus objetivos?`)&&(await t(n),r.curriculo_pilares=r.curriculo_pilares.filter(e=>e.id!==n),c())})}),e.querySelectorAll(`.obj-desc`).forEach(e=>{e.addEventListener(`blur`,async()=>{await d(e.closest(`[data-obj-id]`).dataset.objId,{descripcion:e.value.trim()})})}),e.querySelectorAll(`.obj-del`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-obj-id]`),n=t.dataset.objId;await De(n);let i=t.closest(`[data-pilar-id]`).dataset.pilarId,a=r.curriculo_pilares.find(e=>e.id===i);a&&(a.curriculo_objetivos=a.curriculo_objetivos.filter(e=>e.id!==n)),c()})}),e.querySelectorAll(`.new-obj-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-pilar-id]`),n=t.dataset.pilarId,i=t.querySelector(`.new-obj-input`),a=i.value.trim();if(!a)return;let o=r.curriculo_pilares.find(e=>e.id===n),s=(o?.curriculo_objetivos||[]).length,u=await l(n,a,s);o&&(o.curriculo_objetivos=[...o.curriculo_objetivos||[],u]),i.value=``,c()})}),document.getElementById(`ce-add-pilar`)?.addEventListener(`click`,async()=>{let e=prompt(`Nombre del nuevo pilar:`);if(!e?.trim())return;let t=r.curriculo_pilares.length,n=await m(r.id,e.trim(),t);r.curriculo_pilares.push({...n,curriculo_objetivos:[]}),c()})}o.addEventListener(`hidden.bs.modal`,()=>{a.remove(),n?.()}),s.show(),c()}var bu=`
<style id="ruta-crear-style">
.objetivo-row { border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin-bottom: 10px; display: grid; grid-template-columns: 80px 1fr auto; gap: 10px; align-items: start; }
.objetivo-row input, .objetivo-row textarea { font-size: 0.9rem; }
</style>`;function xu(e){let t=document.getElementById(`ruta-crear-modal`);t&&t.remove();let n=document.createElement(`div`);n.id=`ruta-crear-modal`,n.innerHTML=`${bu}
    <div class="modal fade" id="ruta-crear-dialog" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-plus-circle me-2"></i>Nueva Ruta SOI</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label"><strong>Instrumento</strong></label>
              <select class="form-select" id="ruta-instrumento">
                <option value="">— Selecciona —</option>
                <option>Guitarra</option>
                <option>Piano</option>
                <option>Violín</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label"><strong>Nivel</strong></label>
              <select class="form-select" id="ruta-nivel">
                <option value="">— Selecciona —</option>
                <option>Nivel 1</option>
                <option>Nivel 2</option>
                <option>Intermedio</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label"><strong>Nombre de la Ruta</strong></label>
              <input type="text" class="form-control" id="ruta-nombre" placeholder="ej: Guitarra Nivel 1 - SOI Estándar">
            </div>

            <div class="mb-3">
              <label class="form-label"><strong>Duración (semanas)</strong></label>
              <input type="number" class="form-control" id="ruta-duracion" value="40" min="1" max="52">
            </div>

            <hr>

            <div class="mb-3">
              <label class="form-label"><strong>Objetivos</strong></label>
              <div id="objetivos-list"></div>
              <button type="button" class="btn btn-outline-primary btn-sm w-100" id="btn-agregar-objetivo">
                <i class="bi bi-plus me-1"></i>Agregar Objetivo
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-crear-ruta">
              <i class="bi bi-check me-1"></i>Crear Ruta
            </button>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(n);let r=document.getElementById(`ruta-crear-dialog`),i=new bootstrap.Modal(r),a=[{descripcion:``,semana_inicio:1,semana_fin:2,orden:1}];function o(){let e=document.getElementById(`objetivos-list`);e.innerHTML=a.map((e,t)=>`
      <div class="objetivo-row" data-idx="${t}">
        <input type="text" class="form-control form-control-sm" placeholder="Semanas" value="${e.semana_inicio}-${e.semana_fin}" style="width: 80px;">
        <textarea class="form-control form-control-sm" rows="2" placeholder="Descripción del objetivo">${e.descripcion}</textarea>
        <button type="button" class="btn btn-sm btn-link text-danger" onclick="this.closest('.objetivo-row').remove()">Eliminar</button>
      </div>
    `).join(``)}document.getElementById(`btn-agregar-objetivo`).addEventListener(`click`,()=>{let e=Math.max(...a.map(e=>e.semana_fin));a.push({descripcion:``,semana_inicio:e+1,semana_fin:e+2,orden:a.length+1}),o()}),document.getElementById(`btn-crear-ruta`).addEventListener(`click`,async()=>{let t=document.getElementById(`ruta-instrumento`).value,n=document.getElementById(`ruta-nivel`).value,r=document.getElementById(`ruta-nombre`).value,a=parseInt(document.getElementById(`ruta-duracion`).value);if(!t||!n||!r){v.warning(`Completa los campos requeridos`);return}let o=Array.from(document.querySelectorAll(`.objetivo-row`)).map((e,t)=>{let n=e.querySelector(`input`).value.split(`-`),r=e.querySelector(`textarea`).value;return{semana_inicio:parseInt(n[0]),semana_fin:parseInt(n[1]),descripcion:r,orden:t+1}});try{let{data:s}=await _.auth.getUser(),c=await un({instrumento:t,nivel:n,nombre:r,tipo:`soi-estandar`,estado:`activa`,duracion_semanas:a,objetivos:o,creada_por:s?.user?.id});v.success(`Ruta "${r}" creada`),i.hide(),e&&e(c)}catch(e){v.error(`Error: ${e.message}`)}}),o(),i.show()}var Su=`
<style id="ruta-variante-style">
.cambio-item { padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.cambio-add { color: #28a745; }
.cambio-remove { color: #dc3545; }
.cambio-move { color: #ffc107; }
</style>`;function Cu(e,t){let n=document.getElementById(`ruta-variante-modal`);n&&n.remove();let r=document.createElement(`div`);r.id=`ruta-variante-modal`,r.innerHTML=`${Su}
    <div class="modal fade" id="ruta-variante-dialog" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-arrow-repeat me-2"></i>Proponer Variante de Ruta</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="variante-body">
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm"></div></div>
          </div>
        </div>
      </div>
    </div>`,document.body.appendChild(r);let i=document.getElementById(`ruta-variante-dialog`),a=new bootstrap.Modal(i);async function o(){let n=document.getElementById(`variante-body`);try{let r=await dn(e);n.innerHTML=`
        <div class="alert alert-info small mb-3">
          <i class="bi bi-info-circle me-2"></i>
          Estás creando una variante de <strong>${r.nombre}</strong>
        </div>

        <div class="mb-3">
          <label class="form-label"><strong>Nombre de tu Variante</strong></label>
          <input type="text" class="form-control" id="variante-nombre" placeholder="ej: Variante acelerada para grupo avanzado">
        </div>

        <div class="mb-3">
          <label class="form-label"><strong>¿Cuál es la razón del cambio?</strong></label>
          <textarea class="form-control" id="variante-razon" rows="3" placeholder="Explica por qué tu grupo necesita esta variante..."></textarea>
        </div>

        <hr>

        <div class="mb-3">
          <label class="form-label"><strong>Objetivos de tu Variante</strong></label>
          <div id="objetivos-variante"></div>
          <button type="button" class="btn btn-outline-primary btn-sm w-100" id="btn-agregar-obj-var">
            <i class="bi bi-plus me-1"></i>Agregar Objetivo
          </button>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" id="btn-proponer-variante">
            <i class="bi bi-send me-1"></i>Enviar para Aprobación
          </button>
        </div>
      `;let i=JSON.parse(JSON.stringify(r.objetivos));function o(){let e=document.getElementById(`objetivos-variante`);e.innerHTML=i.map((e,t)=>`
          <div class="mb-2" data-idx="${t}">
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: start;">
              <div style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; background: #f9f9f9;">
                <small style="color: #999;">Semana ${e.semana_inicio}-${e.semana_fin}</small>
                <div style="font-weight: 500;">${e.descripcion}</div>
              </div>
              <button type="button" class="btn btn-sm btn-link text-danger" data-remove-idx="${t}">Quitar</button>
            </div>
          </div>
        `).join(``),document.querySelectorAll(`[data-remove-idx]`).forEach(e=>{e.addEventListener(`click`,e=>{let t=parseInt(e.target.dataset.removeIdx);i.splice(t,1),o()})})}document.getElementById(`btn-agregar-obj-var`).addEventListener(`click`,()=>{let e=Math.max(...i.map(e=>e.semana_fin));i.push({descripcion:``,semana_inicio:e+1,semana_fin:e+2,orden:i.length+1}),o()}),document.getElementById(`btn-proponer-variante`).addEventListener(`click`,async()=>{let n=document.getElementById(`variante-nombre`).value,r=document.getElementById(`variante-razon`).value;if(!n||!r){v.warning(`Completa nombre y razón`);return}try{let o=await hn(e,n,r,i);v.success(`Variante propuesta para aprobación`),a.hide(),t&&t(o)}catch(e){v.error(`Error: ${e.message}`)}}),o()}catch(e){n.innerHTML=`<div class="alert alert-danger">${e.message}</div>`}}i.addEventListener(`shown.bs.modal`,o),a.show()}var wu=`
<style id="ruta-variantes-dashboard-style">
.variante-card { border: 1px solid #dee2e6; border-radius: 6px; padding: 15px; margin-bottom: 15px; transition: all 0.2s; }
.variante-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.variante-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; }
.cambio-list { background: #f9f9f9; border-left: 4px solid #007bff; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 0.9rem; }
</style>`;async function Tu(e){if(e)try{let t=await pn();if(t.length===0){e.innerHTML=`${wu}<div class="alert alert-info">No hay variantes pendientes de aprobación.</div>`;return}let n=`${wu}
      <div class="mb-3">
        <h5><span class="badge bg-warning">${t.length} pendientes</span></h5>
      </div>`;for(let e of t){let t=e.ruta_base_id?await dn(e.ruta_base_id):null;n+=`
        <div class="variante-card">
          <div class="variante-header">
            <div>
              <h6 class="mb-1"><strong>${e.nombre}</strong></h6>
              <small class="text-muted">
                Propuesta por maestro • ${new Date(e.created_at).toLocaleDateString()}
              </small>
            </div>
            <span class="badge bg-warning">Pendiente</span>
          </div>

          <p class="mb-2" style="font-size: 0.9rem; color: #555;">${e.descripcion}</p>

          <div class="cambio-list">
            <strong>Cambios:</strong>
            <div style="margin-top: 8px;">
              ${e.objetivos?.length||0} objetivos en esta variante
              (base: ${t?.objetivos?.length||0})
            </div>
          </div>

          <div class="d-flex gap-2" style="margin-top: 12px;">
            <button class="btn btn-sm btn-success" data-approve-id="${e.id}">
              <i class="bi bi-check me-1"></i>Aprobar
            </button>
            <button class="btn btn-sm btn-outline-danger" data-reject-id="${e.id}">
              <i class="bi bi-x me-1"></i>Rechazar
            </button>
          </div>
        </div>
      `}e.innerHTML=n,document.querySelectorAll(`[data-approve-id]`).forEach(e=>{e.addEventListener(`click`,async e=>{let t=e.target.closest(`button`).dataset.approveId;try{await mn(t,!0),v.success(`Variante aprobada`),location.reload()}catch(e){v.error(`Error: ${e.message}`)}})}),document.querySelectorAll(`[data-reject-id]`).forEach(e=>{e.addEventListener(`click`,async e=>{let t=e.target.closest(`button`).dataset.rejectId,n=prompt(`Razón del rechazo:`);if(n)try{await mn(t,!1,n),v.success(`Variante rechazada`),location.reload()}catch(e){v.error(`Error: ${e.message}`)}})})}catch(t){e.innerHTML=`<div class="alert alert-danger">${t.message}</div>`}}var Eu=`
<style id="rutas-management-style">
.rutas-panel { background: white; border-radius: 8px; padding: 24px; }
.rutas-section { margin-bottom: 32px; }
.rutas-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}
.rutas-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.rutas-actions button { white-space: nowrap; }
.rutas-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}
.rutas-empty i {
  font-size: 2rem;
  display: block;
  margin-bottom: 12px;
  color: #ddd;
}
</style>
`;async function Du(e,t=`maestro`){if(!e)return;let n=t===`admin`;try{let r=Eu;if(n?r+=`
        <div class="rutas-panel">
          <div class="rutas-section">
            <div class="rutas-section-title">
              <i class="bi bi-diagram-3 me-2"></i>
              Crear Ruta SOI Estándar
            </div>
            <p class="text-muted small mb-3">
              Define las rutas de contenido estándar por instrumento/nivel que los maestros pueden adoptar.
            </p>
            <div class="rutas-actions">
              <button class="btn btn-primary" id="btn-crear-ruta-soi">
                <i class="bi bi-plus-circle me-1"></i>Nueva Ruta SOI
              </button>
            </div>
          </div>

          <div class="rutas-section">
            <div class="rutas-section-title">
              <i class="bi bi-clipboard-check me-2"></i>
              Revisar Variantes Propuestas
            </div>
            <p class="text-muted small mb-3">
              Los maestros pueden proponer variantes de las rutas estándar para sus grupos especiales.
              Revisá y aprobá o rechazá según sea necesario.
            </p>
            <div id="variantes-dashboard-container" class="mt-3"></div>
          </div>
        </div>
      `:r+=`
        <div class="rutas-panel">
          <div class="rutas-section">
            <div class="rutas-section-title">
              <i class="bi bi-arrow-repeat me-2"></i>
              Proponer Variante de Ruta
            </div>
            <p class="text-muted small mb-3">
              ¿Tu grupo necesita una ruta diferente? Podés proponer una variante de una ruta estándar
              para que los administradores la revisen y aprueben.
            </p>
            <div class="rutas-actions">
              <button class="btn btn-info" id="btn-proponer-variante">
                <i class="bi bi-arrow-repeat me-1"></i>Proponer Variante
              </button>
            </div>
          </div>

          <div class="rutas-section">
            <div class="rutas-section-title">
              <i class="bi bi-diagram-3 me-2"></i>
              Rutas Disponibles
            </div>
            <div id="rutas-list-container" class="mt-3"></div>
          </div>
        </div>
      `,e.innerHTML=r,n){e.querySelector(`#btn-crear-ruta-soi`)?.addEventListener(`click`,()=>{xu(n=>{v.success(`Ruta "${n.nombre}" creada exitosamente`),Du(e,t)})});let n=e.querySelector(`#variantes-dashboard-container`);n&&Tu(n)}else{e.querySelector(`#btn-proponer-variante`)?.addEventListener(`click`,async()=>{try{let n=await fn({tipo:`soi-estandar`,estado:`activa`});if(n.length===0){v.warning(`No hay rutas estándar disponibles para proponer variantes`);return}let r=await Ou(n);if(!r)return;Cu(r.id,n=>{v.success(`Variante propuesta para aprobación`),Du(e,t)})}catch(e){v.error(`Error: ${e.message}`)}});let n=e.querySelector(`#rutas-list-container`);if(n)try{let e=await fn({estado:`activa`});e.length===0?n.innerHTML=`
              <div class="rutas-empty">
                <i class="bi bi-inbox"></i>
                <p>No hay rutas disponibles</p>
              </div>
            `:n.innerHTML=`
              <div class="list-group">
                ${e.map(e=>`
                  <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 class="mb-1">${e.nombre}</h6>
                        <small class="text-muted">
                          ${e.instrumento} • ${e.nivel} • ${e.duracion_semanas} semanas
                          ${e.tipo===`maestro-variante`?` • Variante aprobada`:` • Estándar`}
                        </small>
                      </div>
                      <span class="badge ${e.tipo===`soi-estandar`?`bg-primary`:`bg-success`}">
                        ${e.tipo===`soi-estandar`?`SOI`:`Variante`}
                      </span>
                    </div>
                  </div>
                `).join(``)}
              </div>
            `}catch(e){n.innerHTML=`
            <div class="alert alert-warning small">Error cargando rutas: ${e.message}</div>
          `}}}catch(t){e.innerHTML=`
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Error cargando panel de rutas: ${t.message}
      </div>
    `}}async function Ou(e){return new Promise(t=>{let n=document.createElement(`div`);n.innerHTML=`
      <div class="modal fade" id="select-ruta-modal" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Selecciona una Ruta para Proponer Variante</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="list-group" id="ruta-options">
                ${e.map(e=>`
                  <button type="button" class="list-group-item list-group-item-action" data-ruta-id="${e.id}">
                    <h6 class="mb-1">${e.nombre}</h6>
                    <small>${e.instrumento} • ${e.nivel}</small>
                  </button>
                `).join(``)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `,document.body.appendChild(n);let r=new bootstrap.Modal(n.querySelector(`#select-ruta-modal`)),i=null;n.querySelectorAll(`#ruta-options button`).forEach(t=>{t.addEventListener(`click`,()=>{i=e.find(e=>e.id===t.dataset.rutaId),r.hide()})}),n.addEventListener(`hidden.bs.modal`,()=>{n.remove(),t(i)}),r.show()})}var ku=[{id:`escala`,nombre:`Escala Mayor`,instrumento:`Piano / Guitarra`,descripcion:`Trabajo de escalas diatónicas mayores en posición cerrada.`,contenido:`[Indicador] Ejecuta la escala de Do mayor en dos octavas con digitación correcta
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
{Actividad} Construcción de acordes en el instrumento`}],W={planes:[],cargando:!1,viewMode:`maestro`,activeTab:`planes`,asistenteRendered:!1,rutasRendered:!1,seleccionados:new Set,container:null},Au=nu();async function ju(e,{viewMode:t=`maestro`}={}){if(e){if(W.container=e,W.viewMode=t,W.seleccionados=new Set,W.asistenteRendered=!1,W.rutasRendered=!1,t===`plantillas`){Ru(e);return}try{W.cargando=!0,Mu(e),await Au.fetchPlanificacionesConDetalles(),W.planes=[...Au.planificaciones],W.cargando=!1,Pu(e),Bu(e)}catch(t){console.error(`[planificacionView]`,t),Nu(e,t.message)}}}function Mu(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>`}function Nu(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${h(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>planificaciones</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`}function Pu(e){let t=W.viewMode===`admin`,n=t?`Todas las Planificaciones`:`Mis Planes de Clase`,r=t?`bi-shield-check`:`bi-journal-check`,i=t?`${Au.planificaciones.length} planes pendientes de revisión`:`${Au.planificaciones.length} planes registrados`,a=t?Fu():``;e.innerHTML=`
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
        <div class="premium-search-container flex-grow-1" style="min-width: 200px;">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar por tema..." id="buscar-plan">
        </div>
        ${t?`
        <div class="premium-select-container">
          <i class="bi bi-person select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-maestro">
            <option value="">Todos los maestros</option>
            ${Array.from(new Set(Au.planificaciones.map(e=>e.maestro_nombre).filter(e=>e&&e!==`Sin asignar`))).sort().map(e=>`<option value="${h(e)}">${h(e)}</option>`).join(``)}
          </select>
        </div>
        `:``}
        <div class="premium-select-container">
          <i class="bi bi-book select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-clase">
            <option value="">Todas las clases</option>
            ${Array.from(new Set(Au.planificaciones.map(e=>e.clase_nombre).filter(e=>e&&e!==`Sin asignar`))).sort().map(e=>`<option value="${h(e)}">${h(e)}</option>`).join(``)}
          </select>
        </div>
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-estado">
            <option value="">Todos los estados</option>
            ${Le.getEstados().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
          <button class="nav-link" data-tab="rutas">
            <i class="bi bi-diagram-3 me-1"></i>Rutas
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
              ${Iu(W.planes)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${W.planes.length===0?Lu():``}</div>
      </div>
      </div>

      ${t?``:`
      <div id="tab-content-plantillas" style="display:none">
        <div class="alert alert-info border-0 py-3" style="font-size:0.875rem;">
          <i class="bi bi-file-earmark-template me-2"></i>
          Las plantillas de planificación estarán disponibles próximamente.
        </div>
      </div>
      <div id="tab-content-rutas" style="display:none"></div>
      <div id="tab-content-asistente" style="display:none"></div>
      `}
    </div>
  `}function Fu(){let e=Au.planificaciones,t=e.filter(e=>e.estado===`ejecutado`).length,n=e.filter(e=>e.estado===`revisado`).length,r=e.length;return`
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
  `}function Iu(e){if(!e||e.length===0)return``;let t=W.viewMode===`admin`;return e.map(e=>{let n=Le.getEstadoConfig(e.estado),r=e.estado===`revisado`?`border-accent-success`:e.estado===`ejecutado`?`border-accent-warning`:`border-accent-secondary`;return`
      <tr data-id="${e.id}" class="border-start-accent ${r}">
        ${t?`<td><input type="checkbox" class="plan-check" value="${e.id}" ${W.seleccionados.has(e.id)?`checked`:``}></td>`:``}
        <td>
          <div class="fw-bold">${h(e.clase_nombre||`Sin clase`)}</div>
          <div class="small text-muted text-truncate" style="max-width: 260px">${h(e.tema)}</div>
        </td>
        ${t?`<td class="d-none d-md-table-cell align-middle small text-muted">${h(e.maestro_nombre||`N/A`)}</td>`:``}
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
    `}).join(``)}function Lu(){let e=W.viewMode===`admin`;return`
    <div class="text-center py-5 px-3">
      <i class="bi bi-journal-x text-muted d-block mb-3" style="font-size: 3rem; opacity: .4"></i>
      <h5 class="text-muted fw-normal mb-1">
        ${e?`No hay planificaciones registradas aún`:`Todavía no tienes planes de clase`}
      </h5>
      <p class="text-muted small mb-0">
        ${e?`Una vez que los maestros creen sus planes, aparecerán aquí para revisión.`:`Crea tu primer plan de clase usando el botón de arriba o usa una plantilla.`}
      </p>
    </div>
  `}function Ru(e){e.innerHTML=`
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
        ${ku.map(e=>`
          <div class="col-md-6">
            <div class="page-glass rounded p-4 h-100 d-flex flex-column">
              <div class="d-flex align-items-start gap-3 mb-3">
                <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px;height:40px">
                  <i class="bi bi-journal-text fs-5"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0">${h(e.nombre)}</h5>
                  <span class="badge bg-secondary bg-opacity-10 text-secondary border small">${h(e.instrumento)}</span>
                </div>
              </div>
              <p class="text-muted small flex-grow-1">${h(e.descripcion)}</p>
              <details class="mb-3">
                <summary class="small text-primary" style="cursor:pointer">Ver contenido DSL</summary>
                <pre class="mt-2 p-2 bg-body-tertiary rounded small border" style="font-size:.75rem;white-space:pre-wrap">${h(e.contenido)}</pre>
              </details>
              <button class="btn btn-outline-primary btn-sm" data-template-id="${e.id}">
                <i class="bi bi-plus-circle me-1"></i>Usar esta plantilla
              </button>
            </div>
          </div>
        `).join(``)}
      </div>
    </div>
  `,e.querySelectorAll(`button[data-template-id]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=ku.find(t=>t.id===e.dataset.templateId);t&&zu(t)})})}function zu(e){b.open({title:`Usar plantilla: ${e.nombre}`,saveText:`Crear Plan`,size:`lg`,body:`
      <form id="form-tpl" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="tpl-tema" value="${h(e.nombre)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="tpl-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="tpl-objetivos" rows="2">${h(e.descripcion)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido DSL</label>
          <textarea class="form-control input-dense font-monospace" id="tpl-contenido" rows="7">${h(e.contenido)}</textarea>
        </div>
      </form>
    `,onOpen:async e=>{let t=await Fe(),n=e.querySelector(`#tpl-clase_id`);n.innerHTML=`<option value="">Seleccionar clase...</option>`+t.map(e=>`<option value="${e.id}">${h(e.nombre)}</option>`).join(``)},onSave:async e=>{let t={tema:e.querySelector(`#tpl-tema`).value.trim(),clase_id:e.querySelector(`#tpl-clase_id`).value,objetivos:e.querySelector(`#tpl-objetivos`).value.trim(),contenido:e.querySelector(`#tpl-contenido`).value.trim()};try{return await Be(t),v.success(`Plan creado desde plantilla`),!0}catch(e){return v.error(e.message),!1}}})}function Bu(e){let t=W.viewMode===`admin`;e.querySelector(`#buscar-plan`)?.addEventListener(`input`,Vu),e.querySelector(`#select-estado`)?.addEventListener(`change`,Vu),e.querySelector(`#select-clase`)?.addEventListener(`change`,Vu),t&&e.querySelector(`#select-maestro`)?.addEventListener(`change`,Vu),e.querySelector(`#btn-help-planificacion`)?.addEventListener(`click`,()=>{Rn.open({title:`Planificación`,intro:`Módulo para gestionar los planes de clase. Cada plan documenta qué se trabajará en una clase, en qué fecha, y si fue ejecutado o no.`,sections:[{icon:`bi-journal-text`,title:`Tab Mis planes`,description:`Lista tus planes personales. Filtrá por estado (planificado, ejecutado, cancelado) y creá nuevos desde "Nuevo plan".`,color:`#3b82f6`},{icon:`bi-file-earmark-template`,title:`Tab Plantillas`,description:`Plantillas reutilizables en formato DSL. Sirven como base para crear nuevos planes rápidamente.`,color:`#6366f1`},{icon:`bi-journal-check`,title:`Todas las planes (admin)`,description:`Solo visible para administradores. Muestra los planes de todos los maestros para supervisión.`,color:`#10b981`},{icon:`bi-circle-fill`,title:`Estados del plan`,description:`"Planificado" = no dictado aún. "Ejecutado" = clase dada. "Cancelado" = no se realizó. Mantenerlos actualizados mejora los reportes.`,color:`#f59e0b`}]})}),t||e.querySelector(`#btn-nuevo-plan`)?.addEventListener(`click`,()=>Uu(null)),t&&(e.querySelector(`#check-all`)?.addEventListener(`change`,t=>{let n=t.target.checked;W.seleccionados=n?new Set(W.planes.map(e=>e.id)):new Set,e.querySelectorAll(`.plan-check`).forEach(e=>{e.checked=n}),Hu()}),e.querySelector(`#btn-aprobar-bulk`)?.addEventListener(`click`,async()=>{let t=[...W.seleccionados];if(t.length)try{await Re(t),v.success(`${t.length} plan(es) aprobados`),ju(e,{viewMode:W.viewMode})}catch(e){v.error(e.message)}})),e.querySelectorAll(`#planificacion-tabs .nav-link`).forEach(t=>{t.addEventListener(`click`,()=>{if(W.activeTab=t.dataset.tab,[`planes`,`plantillas`,`rutas`,`asistente`].forEach(t=>{let n=e.querySelector(`#tab-content-${t}`);n&&(n.style.display=W.activeTab===t?`block`:`none`)}),e.querySelectorAll(`#planificacion-tabs .nav-link`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),W.activeTab===`rutas`&&!W.rutasRendered){let t=e.querySelector(`#tab-content-rutas`);t&&(Du(t,W.viewMode),W.rutasRendered=!0)}if(W.activeTab===`asistente`&&!W.asistenteRendered){let t=e.querySelector(`#tab-content-asistente`);t&&(hu(t),W.asistenteRendered=!0)}})}),document.addEventListener(`planificacion:nuevoPlan`,e=>{Uu(null)},{once:!0}),t&&e.querySelector(`#btn-curriculo-admin`)?.addEventListener(`click`,()=>{_u()}),e.querySelector(`#planes-tbody`)?.addEventListener(`change`,e=>{if(!e.target.classList.contains(`plan-check`))return;let t=e.target.value;e.target.checked?W.seleccionados.add(t):W.seleccionados.delete(t),Hu()}),e.querySelector(`#planes-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit`&&Uu(r),n===`delete`&&qu(r),n===`approve`&&Gu(r),n===`view`&&Wu(r),n===`ejecutar`&&Ku(r)})}function Vu(){let e=W.container.querySelector(`#buscar-plan`)?.value.toLowerCase()||``,t=W.container.querySelector(`#select-estado`)?.value||``,n=W.container.querySelector(`#select-clase`)?.value||``,r=W.container.querySelector(`#select-maestro`)?.value||``;W.planes=Au.planificaciones.filter(i=>{let a=(i.tema||``).toLowerCase().includes(e)||(i.clase_nombre||``).toLowerCase().includes(e),o=!t||i.estado===t,s=!n||i.clase_nombre===n,c=!r||i.maestro_nombre===r;return a&&o&&s&&c});let i=W.container.querySelector(`#planes-tbody`),a=W.container.querySelector(`#empty-container`);i&&(i.innerHTML=Iu(W.planes)),a&&(a.innerHTML=W.planes.length===0?Lu():``)}function Hu(){let e=W.container?.querySelector(`#btn-aprobar-bulk`);e&&(e.style.display=W.seleccionados.size>0?``:`none`)}async function Uu(e,t={}){let n=e&&Au.getById(e)||new Le(t);b.open({title:e?`Editar Plan de Clase`:`Nuevo Plan de Clase`,saveText:`Guardar Plan`,size:`lg`,body:`
      <form id="form-plan" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="plan-tema" value="${h(n.tema)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="plan-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="plan-objetivos" rows="2">${h(n.objetivos)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido Pedagógico (DSL)</label>
          <div id="plan-dsl-container" style="margin-bottom: 1rem;"></div>
          <div class="small text-muted" id="plan-dsl-summary" style="margin-top: 0.5rem;"></div>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Fecha de inicio</label>
          <input type="date" class="form-control input-dense" id="plan-fecha" value="${n.fecha_inicio||``}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Instrumento / Área</label>
          <input type="text" class="form-control input-dense" id="plan-instrumento" value="${h(n.instrumento||``)}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Método de evaluación</label>
          <input type="text" class="form-control input-dense" id="plan-eval" value="${h(n.evaluacion_metodo||``)}">
        </div>
      </form>
    `,onOpen:async e=>{let t=await Fe(),r=e.querySelector(`#plan-clase_id`);r.innerHTML=`<option value="">Seleccionar clase...</option>`+t.map(e=>`<option value="${e.id}" ${e.id===n.clase_id?`selected`:``}>${h(e.nombre)}</option>`).join(``);let i=e.querySelector(`#plan-dsl-container`),a=re({initialContent:n.notas_dsl||``,onChange:(t,n)=>{let r=e.querySelector(`#plan-dsl-summary`);r&&n.items&&n.items.length>0&&(r.innerHTML=`<strong>Elementos:</strong> ${n.items.length} indicadores/actividades parseadas`)},onAlumnoClick:async()=>{let e=(await Ke()).slice(0,3).map(e=>`#${e.nombre_completo}`).join(`, `);a.component&&a.component.insertText(e+` `)}});i.appendChild(a),e._dslEditor=a},onSave:async t=>{let n=t._dslEditor,r={tema:t.querySelector(`#plan-tema`).value.trim(),clase_id:t.querySelector(`#plan-clase_id`).value,objetivos:t.querySelector(`#plan-objetivos`).value.trim(),contenido:t.querySelector(`#plan-contenido`)?.value.trim()||``,notas_dsl:n?n.getContent():``,fecha_inicio:t.querySelector(`#plan-fecha`).value||null,instrumento:t.querySelector(`#plan-instrumento`).value.trim()||null,evaluacion_metodo:t.querySelector(`#plan-eval`).value.trim()||null},i=new Le(r).validate();if(i.length>0)return v.error(i[0]),!1;try{return e?(await We(e,r),v.success(`Plan actualizado correctamente`)):(await Be(r),v.success(`Plan creado correctamente`)),ju(W.container,{viewMode:W.viewMode}),!0}catch(e){return v.error(e.message),!1}}})}function Wu(e){let t=Au.getById(e);if(!t)return;let n=Le.getEstadoConfig(t.estado);b.open({title:`Plan: ${t.clase_nombre||`Sin clase`}`,hideSave:!0,size:`lg`,body:`
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <div class="small text-muted text-uppercase fw-bold mb-1">Tema</div>
          <div class="fw-bold">${h(t.tema)}</div>
        </div>
        <div class="col-md-4 text-md-end">
          <span class="badge ${n.color} fs-6">${n.label}</span>
        </div>
      </div>
      ${t.maestro_nombre?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Maestro</div>
          <div>${h(t.maestro_nombre)}</div>
        </div>
      `:``}
      ${t.objetivos?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Objetivos</div>
          <div class="text-muted">${h(t.objetivos)}</div>
        </div>
      `:``}
      ${t.contenido?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Contenido DSL</div>
          <pre class="p-3 rounded border bg-body-tertiary small" style="white-space:pre-wrap">${h(t.contenido)}</pre>
        </div>
      `:``}
      <div class="row g-2">
        ${t.fecha_inicio?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-calendar me-1"></i>${t.fecha_inicio}</span></div>`:``}
        ${t.instrumento?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-music-note me-1"></i>${h(t.instrumento)}</span></div>`:``}
        ${t.evaluacion_metodo?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-clipboard-check me-1"></i>${h(t.evaluacion_metodo)}</span></div>`:``}
      </div>
    `})}async function Gu(e){try{await Re([e]),v.success(`Plan aprobado y marcado como revisado`),ju(W.container,{viewMode:W.viewMode})}catch(e){v.error(e.message)}}async function Ku(e){let t=Au.getById(e);if(!t)return;let n=t.instrumento,r=null,i=t.clase_id;if(i){let e=(await Fe()).find(e=>e.id===i);e&&(n||=e.instrumento,r=e.plan_estudio)}let a=Au.maestroActualId||t.maestro_id;pu({plan:t,claseId:i,instrumento:n,nivel:r,maestroId:a,onConfirm:async()=>{try{await We(e,{estado:`ejecutado`}),v.success(`Plan marcado como ejecutado`),ju(W.container,{viewMode:W.viewMode})}catch(e){v.error(e.message)}},onSkip:async()=>{try{await We(e,{estado:`ejecutado`}),v.success(`Plan ejecutado (sin cobertura)`),ju(W.container,{viewMode:W.viewMode})}catch(e){v.error(e.message)}}})}async function qu(e){let t=Au.getById(e);t&&b.open({title:`⚠️ Eliminar Plan`,saveText:`Eliminar`,body:`<p>¿Estás seguro de eliminar el plan <strong>"${h(t.tema)}"</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await He(e),v.success(`Plan eliminado`),ju(W.container,{viewMode:W.viewMode}),!0}catch(e){return v.error(e.message),!1}}})}async function Ju(e){if(e)try{e.innerHTML=`
      <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando cobertura...</span>
        </div>
      </div>`;let t=await Ve(),n=t.length,r=t.filter(e=>e.tiene_plan).length,i=n-r,a=n>0?Math.round(r/n*100):0;e.innerHTML=`
    <div class="page-container">
      <div class="planificacion-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-grid-3x3-gap fs-4"></i>
          </div>
          <div>
            <h1 class="planificacion-title-premium page-title mb-0">Cobertura Curricular</h1>
            <p class="text-muted small mb-0">Todas las clases con su estado de planificación</p>
          </div>
        </div>
        <div class="planificacion-header-actions">
          <button class="btn btn-premium-action" id="btn-refresh-cobertura">
            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
          </button>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm bg-light rounded-3 p-3 text-center">
            <div class="fs-3 fw-bold text-primary">${n}</div>
            <div class="small text-muted">Total clases</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm bg-light rounded-3 p-3 text-center">
            <div class="fs-3 fw-bold text-success">${r}</div>
            <div class="small text-muted">Con plan</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm bg-light rounded-3 p-3 text-center">
            <div class="fs-3 fw-bold text-danger">${i}</div>
            <div class="small text-muted">Sin plan</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm bg-light rounded-3 p-3 text-center">
            <div class="fs-3 fw-bold ${a>=80?`text-success`:a>=50?`text-warning`:`text-danger`}">${a}%</div>
            <div class="small text-muted">Cobertura</div>
          </div>
        </div>
      </div>

      <div class="page-glass rounded">
        <div class="table-responsive">
          <table class="table table-compact table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Clase</th>
                <th>Instrumento</th>
                <th>Maestro</th>
                <th>Plan</th>
                <th class="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${t.map(Yu).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,e.querySelector(`#btn-refresh-cobertura`).addEventListener(`click`,()=>{Ju(e)}),e.querySelectorAll(`.btn-crear-plan-cobertura`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.dataset.claseId,[r,i]=await Promise.all([Fe(),Ue()]);u(`create`,null,r,i,{clase_id:n},async t=>{await Be(t),v.success(`Plan creado correctamente`),Ju(e)})})}),e.querySelectorAll(`.btn-ver-plan-cobertura`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.dataset.planId,[r,i,a]=await Promise.all([y(()=>import(`./planificacionAdapter-Ii4BlFQr.js`).then(e=>e.d).then(e=>e.obtenerPlanificacion(n)),__vite__mapDeps([8,4,1,9,10])),Fe(),Ue()]);u(`edit`,r,i,a,{},async t=>{await We(n,t),v.success(`Plan actualizado`),Ju(e)})})})}catch(t){console.error(`[coberturaView]`,t),e.innerHTML=`
      <div class="page-container">
        <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
          <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
          <div>
            <h5 class="alert-heading mb-1">Error al cargar cobertura</h5>
            <p class="mb-0 small">${h(t.message)}</p>
          </div>
        </div>
      </div>`}}function Yu(e){let t=e.tiene_plan?Xu(e.plan_estado):`<span class="badge bg-secondary">Sin plan</span>`,n=e.tiene_plan?`<button class="btn btn-outline-primary btn-sm btn-ver-plan-cobertura" data-plan-id="${h(e.plan_id)}">
        <i class="bi bi-eye me-1"></i>Ver plan
      </button>`:`<button class="btn btn-success btn-sm btn-crear-plan-cobertura" data-clase-id="${h(e.clase_id)}" data-clase-nombre="${h(e.clase_nombre)}">
        <i class="bi bi-plus-lg me-1"></i>Crear plan
      </button>`;return`
    <tr>
      <td class="fw-medium">${h(e.clase_nombre)}</td>
      <td>${h(e.instrumento)}</td>
      <td>${h(e.maestro_nombre)}</td>
      <td>${t}</td>
      <td class="text-end">${n}</td>
    </tr>`}function Xu(e){let t={planificado:{cls:`bg-primary`,icon:`bi-file-text`},ejecutado:{cls:`bg-warning text-dark`,icon:`bi-play-circle`},revisado:{cls:`bg-success`,icon:`bi-check-circle`}}[e]||{cls:`bg-secondary`,icon:`bi-question`};return`<span class="badge `+t.cls+`"><i class="bi `+t.icon+` me-1"></i>`+e+`</span>`}var Zu=e({getClasses:()=>Qu,getFullHierarchy:()=>rd,getIndicatorsByObjective:()=>nd,getLevelsByClass:()=>$u,getNodesByLevel:()=>ed,getObjectivesByNode:()=>td,updateIndicatorCalificacion:()=>id});async function Qu(e=null){let t=_.from(`plan_clases`).select(`*`).eq(`activo`,!0);e&&(t=t.eq(`maestro_id`,e));let{data:n,error:r}=await t.order(`nombre`);if(r)throw r;return n||[]}async function $u(e){let{data:t,error:n}=await _.from(`plan_niveles`).select(`*`).eq(`clase_id`,e).order(`numero_nivel`);if(n)throw n;return t||[]}async function ed(e){let{data:t,error:n}=await _.from(`plan_temas`).select(`*`).eq(`nivel_id`,e).order(`orden_index`);if(n)throw n;return t||[]}async function td(e){let{data:t,error:n}=await _.from(`plan_objetivos`).select(`*`).eq(`tema_id`,e).order(`orden_index`);if(n)throw n;return t||[]}async function nd(e){let{data:t,error:n}=await _.from(`plan_indicadores`).select(`*`).eq(`objetivo_id`,e).order(`orden_index`);if(n)throw n;return t||[]}async function rd(e){let{data:t,error:n}=await _.from(`plan_niveles`).select(`
      *,
      plan_temas (
        *,
        plan_objetivos (
          *,
          plan_indicadores (*)
        )
      )
    `).eq(`clase_id`,e).order(`numero_nivel`);if(n)throw n;return t||[]}async function id(e,t){let{error:n}=await _.from(`plan_indicadores`).update({calificacion:t}).eq(`id`,e);if(n)throw n}var ad={plan_clases:[{id:`pclase_001`,nombre:`Violín Principiantes`,maestro_id:`maestro_001`,clase_id:`clase_001`,activo:!0},{id:`pclase_002`,nombre:`Piano Intermedio`,maestro_id:`maestro_002`,clase_id:`clase_002`,activo:!0}],plan_niveles:[{id:`pnivel_001`,clase_id:`pclase_001`,nombre:`Nivel 1 — Introducción`,numero_nivel:1,objetivo_general:`Familiarizar al estudiante con el instrumento y la postura básica`},{id:`pnivel_002`,clase_id:`pclase_001`,nombre:`Nivel 2 — Escalas y Arpegios`,numero_nivel:2,objetivo_general:`Desarrollar la técnica de escalas mayores`},{id:`pnivel_003`,clase_id:`pclase_002`,nombre:`Nivel 1 — Fundamentos`,numero_nivel:1,objetivo_general:`Afianzar la lectura de partituras y coordinación`},{id:`pnivel_004`,clase_id:`pclase_002`,nombre:`Nivel 2 — Técnica Avanzada`,numero_nivel:2,objetivo_general:`Desarrollar velocidad y dinámica`}],plan_temas:[{id:`ptema_001`,nivel_id:`pnivel_001`,nombre:`Postura y sujeción del arco`,tipo:`TECNICA`,orden_index:1},{id:`ptema_002`,nivel_id:`pnivel_001`,nombre:`Cuerdas al aire`,tipo:`TECNICA`,orden_index:2},{id:`ptema_003`,nivel_id:`pnivel_002`,nombre:`Escala de Do Mayor`,tipo:`ESCALA`,orden_index:1},{id:`ptema_004`,nivel_id:`pnivel_002`,nombre:`Arpegio de Do Mayor`,tipo:`ARPEGIO`,orden_index:2},{id:`ptema_005`,nivel_id:`pnivel_003`,nombre:`Lectura de claves`,tipo:`TEORIA`,orden_index:1},{id:`ptema_006`,nivel_id:`pnivel_003`,nombre:`Coordinación manos`,tipo:`TECNICA`,orden_index:2},{id:`ptema_007`,nivel_id:`pnivel_004`,nombre:`Escalas cromáticas`,tipo:`ESCALA`,orden_index:1},{id:`ptema_008`,nivel_id:`pnivel_004`,nombre:`Estudio de velocidad`,tipo:`TECNICA`,orden_index:2}],plan_objetivos:[{id:`pobj_001`,tema_id:`ptema_001`,nombre:`Mantener postura erguida sin tensión`,orden_index:1},{id:`pobj_002`,tema_id:`ptema_001`,nombre:`Sujetar el arco con ángulo correcto`,orden_index:2},{id:`pobj_003`,tema_id:`ptema_002`,nombre:`Ejecutar cuerdas al aire con sonido parejo`,orden_index:1},{id:`pobj_004`,tema_id:`ptema_003`,nombre:`Ejecutar escala ascendente y descendente`,orden_index:1},{id:`pobj_005`,tema_id:`ptema_003`,nombre:`Mantener tempo constante a 60 bpm`,orden_index:2},{id:`pobj_006`,tema_id:`ptema_004`,nombre:`Ejecutar arpegio con cambio de cuerda fluido`,orden_index:1},{id:`pobj_007`,tema_id:`ptema_005`,nombre:`Identificar notas en clave de Sol y Fa`,orden_index:1},{id:`pobj_008`,tema_id:`ptema_005`,nombre:`Leer ritmos básicos (negra, corchea)`,orden_index:2},{id:`pobj_009`,tema_id:`ptema_006`,nombre:`Tocar melodía simple con manos juntas`,orden_index:1},{id:`pobj_010`,tema_id:`ptema_007`,nombre:`Ejecutar escala cromática completa`,orden_index:1},{id:`pobj_011`,tema_id:`ptema_008`,nombre:`Ejecutar pasaje a 120 bpm con precisión`,orden_index:1}],plan_indicadores:[{id:`pind_001`,objetivo_id:`pobj_001`,descripcion:`Hombros relajados y pies apoyados`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_002`,objetivo_id:`pobj_001`,descripcion:`Columna alineada sin inclinación`,es_requerido:!0,calificacion:0,orden_index:2},{id:`pind_003`,objetivo_id:`pobj_002`,descripcion:`Dedo pulgar relajado en la vara`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_004`,objetivo_id:`pobj_003`,descripcion:`Sonido uniforme en toda la longitud del arco`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_005`,objetivo_id:`pobj_004`,descripcion:`Digita correctamente las 8 notas`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_006`,objetivo_id:`pobj_004`,descripcion:`Mantiene la misma velocidad en ambos sentidos`,es_requerido:!1,calificacion:0,orden_index:2},{id:`pind_007`,objetivo_id:`pobj_005`,descripcion:`Coincide con el clic del metrónomo`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_008`,objetivo_id:`pobj_006`,descripcion:`Cambio de cuerda sin interrupción`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_009`,objetivo_id:`pobj_007`,descripcion:`Nombra las notas del pentagrama en menos de 3s`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_010`,objetivo_id:`pobj_008`,descripcion:`Ejecuta correctamente patrones rítmicos simples`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_011`,objetivo_id:`pobj_009`,descripcion:`Mantiene coordinación entre ambas manos`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_012`,objetivo_id:`pobj_010`,descripcion:`Ejecuta las 12 notas sin errores de digitación`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_013`,objetivo_id:`pobj_011`,descripcion:`Mantiene precisión rítmica a velocidad`,es_requerido:!0,calificacion:0,orden_index:1}]},od=e({getClasses:()=>fd,getFullHierarchy:()=>_d,getIndicatorsByObjective:()=>gd,getLevelsByClass:()=>pd,getNodesByLevel:()=>md,getObjectivesByNode:()=>hd,updateIndicatorCalificacion:()=>vd}),sd=`ruta_academica_demo`,cd=1,G=null;function ld(){if(G===null){try{let e=localStorage.getItem(sd);if(e){let t=JSON.parse(e);if(t&&t.schemaVersion===cd){G=t;return}}}catch{}G=JSON.parse(JSON.stringify(ad)),ud()}}function ud(){try{localStorage.setItem(sd,JSON.stringify({...G,schemaVersion:cd}))}catch(e){console.warn(`[routeMock] Failed to persist:`,e.message)}}function dd(e=100){return new Promise(t=>setTimeout(t,e))}async function fd(e=null){await dd(),ld();let t=G.plan_clases.filter(e=>e.activo);return e&&(t=t.filter(t=>t.maestro_id===e)),[...t]}async function pd(e){return await dd(),ld(),G.plan_niveles.filter(t=>t.clase_id===e).sort((e,t)=>e.numero_nivel-t.numero_nivel)}async function md(e){return await dd(),ld(),G.plan_temas.filter(t=>t.nivel_id===e).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0))}async function hd(e){return await dd(),ld(),G.plan_objetivos.filter(t=>t.tema_id===e).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0))}async function gd(e){return await dd(),ld(),G.plan_indicadores.filter(t=>t.objetivo_id===e).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0))}async function _d(e){return await dd(150),ld(),G.plan_niveles.filter(t=>t.clase_id===e).sort((e,t)=>e.numero_nivel-t.numero_nivel).map(e=>({...e,plan_temas:G.plan_temas.filter(t=>t.nivel_id===e.id).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0)).map(e=>({...e,plan_objetivos:G.plan_objetivos.filter(t=>t.tema_id===e.id).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0)).map(e=>({...e,plan_indicadores:G.plan_indicadores.filter(t=>t.objetivo_id===e.id).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0))}))}))}))}async function vd(e,t){await dd(),ld();let n=G.plan_indicadores.findIndex(t=>t.id===e);if(n===-1)throw Error(`Indicador no encontrado`);G.plan_indicadores[n]={...G.plan_indicadores[n],calificacion:t},ud()}var yd=x.isDemoMode?od:Zu,bd=e=>yd.getClasses(e),xd=e=>yd.getFullHierarchy(e),Sd={0:`Sin eval.`,1:`Inicial`,2:`En desarrollo`,3:`Logrado`,4:`Destacado`,5:`Superado`},Cd={0:`#9ca3af`,1:`#ef4444`,2:`#f97316`,3:`#22c55e`,4:`#06b6d4`,5:`#8b5cf6`};async function wd(e){kd(),e.innerHTML=`
    <div class="ra-container">
      <div class="ra-header">
        <div class="ra-header-left">
          <div class="ra-icon">
            <i class="bi bi-diagram-3"></i>
          </div>
          <div>
            <h1 class="ra-title">Ruta Académica</h1>
            <p class="ra-subtitle">Contenidos curriculares por clase — nivel, tema, objetivo e indicador</p>
          </div>
        </div>
      </div>

      <div class="ra-toolbar">
        <div class="ra-select-wrapper">
          <i class="bi bi-book"></i>
          <select id="ra-clase-select" class="ra-select">
            <option value="">Cargando clases...</option>
          </select>
        </div>
        <div class="ra-stats" id="ra-stats"></div>
      </div>

      <div id="ra-tree-container" class="ra-tree-container">
        <div class="ra-placeholder">
          <i class="bi bi-arrow-up-circle"></i>
          <p>Seleccioná una clase para ver su ruta académica</p>
        </div>
      </div>
    </div>
  `;try{let t=await bd(),n=e.querySelector(`#ra-clase-select`);n.innerHTML=`<option value="">Seleccionar clase...</option>`+t.map(e=>`<option value="${e.id}">${h(e.nombre)}</option>`).join(``),n.addEventListener(`change`,()=>{let t=n.value;t?Td(e,t):(e.querySelector(`#ra-tree-container`).innerHTML=`
          <div class="ra-placeholder">
            <i class="bi bi-arrow-up-circle"></i>
            <p>Seleccioná una clase para ver su ruta académica</p>
          </div>`,e.querySelector(`#ra-stats`).innerHTML=``)})}catch(t){console.error(`[rutaAcademica] Error loading classes:`,t),e.querySelector(`#ra-clase-select`).innerHTML=`<option value="">Error al cargar clases</option>`}}async function Td(e,t){let n=e.querySelector(`#ra-tree-container`),r=e.querySelector(`#ra-stats`);n.innerHTML=`
    <div class="ra-loading">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Cargando ruta académica...</span>
    </div>
  `;try{let e=await xd(t);if(!e||e.length===0){n.innerHTML=`
        <div class="ra-placeholder">
          <i class="bi bi-journal-x"></i>
          <p>Esta clase no tiene niveles configurados</p>
        </div>`,r.innerHTML=``;return}let i=0,a=0,o=0,s=0;e.forEach(e=>{let t=e.plan_temas||[];i+=t.length,t.forEach(e=>{let t=e.plan_objetivos||[];a+=t.length,t.forEach(e=>{let t=e.plan_indicadores||[];o+=t.length,s+=t.filter(e=>e.calificacion>0).length})})}),r.innerHTML=`
      <span class="ra-stat"><strong>${e.length}</strong> niveles</span>
      <span class="ra-stat"><strong>${i}</strong> temas</span>
      <span class="ra-stat"><strong>${a}</strong> objetivos</span>
      <span class="ra-stat"><strong>${o}</strong> indicadores</span>
      <span class="ra-stat"><strong>${s}</strong> calificados</span>
    `,n.innerHTML=`
      <div class="ra-tree">
        ${e.map((e,t)=>`
          <div class="ra-level">
            <div class="ra-level-header" data-level-idx="${t}">
              <i class="bi bi-chevron-right ra-chevron"></i>
              <span class="ra-level-badge">Nivel ${e.numero_nivel}</span>
              <span class="ra-level-name">${h(e.nombre)}</span>
              ${e.objetivo_general?`<span class="ra-level-goal">— ${h(e.objetivo_general)}</span>`:``}
              <span class="ra-level-count">${(e.plan_temas||[]).length} temas</span>
            </div>
            <div class="ra-level-body" style="display:none;">
              ${Ed(e.plan_temas||[])}
            </div>
          </div>
        `).join(``)}
      </div>
    `,n.querySelectorAll(`.ra-level-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.nextElementSibling,n=e.querySelector(`.ra-chevron`),r=t.style.display!==`none`;t.style.display=r?`none`:`block`,n.style.transform=r?`rotate(0deg)`:`rotate(90deg)`})}),n.querySelectorAll(`.ra-tema-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.nextElementSibling,n=e.querySelector(`.ra-chevron`),r=t.style.display!==`none`;t.style.display=r?`none`:`block`,n.style.transform=r?`rotate(0deg)`:`rotate(90deg)`})})}catch(e){console.error(`[rutaAcademica] Error loading hierarchy:`,e),n.innerHTML=`
      <div class="ra-placeholder text-danger">
        <i class="bi bi-exclamation-triangle"></i>
        <p>Error al cargar la ruta: ${h(e.message)}</p>
      </div>`}}function Ed(e){return e.map((e,t)=>`
    <div class="ra-tema">
      <div class="ra-tema-header" data-tema-idx="${t}">
        <i class="bi bi-chevron-right ra-chevron"></i>
        <span class="ra-tema-badge">${h(e.tipo||`TEMA`)}</span>
        <span class="ra-tema-name">${h(e.nombre)}</span>
        <span class="ra-tema-count">${(e.plan_objetivos||[]).length} objetivos</span>
      </div>
      <div class="ra-tema-body" style="display:none;">
        ${Dd(e.plan_objetivos||[])}
      </div>
    </div>
  `).join(``)}function Dd(e){return e.map(e=>`
    <div class="ra-objetivo">
      <div class="ra-objetivo-header">
        <i class="bi bi-bullseye ra-obj-icon"></i>
        <span class="ra-obj-name">${h(e.nombre)}</span>
      </div>
      ${Od(e.plan_indicadores||[])}
    </div>
  `).join(``)}function Od(e){return`
    <div class="ra-indicadores">
      ${e.map(e=>`
        <div class="ra-indicador">
          <span class="ra-ind-text">${h(e.descripcion)}</span>
          <span class="ra-ind-calif" style="background:${Cd[e.calificacion]||Cd[0]};">
            ${e.calificacion||0} — ${Sd[e.calificacion]||Sd[0]}
          </span>
        </div>
      `).join(``)}
    </div>
  `}function kd(){if(document.getElementById(`ra-styles`))return;let e=document.createElement(`style`);e.id=`ra-styles`,e.textContent=`
    .ra-container { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }
    .ra-header { margin-bottom: 1.5rem; }
    .ra-header-left { display: flex; align-items: center; gap: 1rem; }
    .ra-icon { width: 42px; height: 42px; background: linear-gradient(135deg,#6366f1,#8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.2rem; flex-shrink: 0; }
    .ra-title { font-size: 1.4rem; font-weight: 700; margin: 0; }
    .ra-subtitle { font-size: 0.85rem; color: var(--bs-secondary-color); margin: 0.2rem 0 0; }
    .ra-toolbar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .ra-select-wrapper { position: relative; min-width: 280px; }
    .ra-select-wrapper i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--bs-secondary-color); }
    .ra-select { width: 100%; padding: 0.6rem 1rem 0.6rem 2.2rem; border: 1px solid var(--bs-border-color); border-radius: 10px; font-size: 0.9rem; background: var(--bs-body-bg); color: var(--bs-body-color); appearance: none; cursor: pointer; }
    .ra-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .ra-stat { font-size: 0.75rem; color: var(--bs-secondary-color); background: var(--bs-tertiary-bg); padding: 0.3rem 0.6rem; border-radius: 6px; white-space: nowrap; }
    .ra-tree-container { min-height: 200px; }
    .ra-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; color: var(--bs-secondary-color); text-align: center; }
    .ra-placeholder i { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.3; }
    .ra-placeholder p { margin: 0; font-size: 0.9rem; }
    .ra-loading { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 3rem; color: var(--bs-secondary-color); }
    .ra-tree { display: flex; flex-direction: column; gap: 0.5rem; }
    .ra-level { background: var(--bs-body-bg); border: 1px solid var(--bs-border-color); border-radius: 12px; overflow: hidden; }
    .ra-level-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem; cursor: pointer; transition: background 0.15s; user-select: none; min-height: 44px; }
    .ra-level-header:hover { background: var(--bs-tertiary-bg); }
    .ra-chevron { transition: transform 0.2s; font-size: 0.8rem; color: var(--bs-secondary-color); flex-shrink: 0; }
    .ra-level-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--bs-primary,#6366f1); color: #fff; padding: 0.15rem 0.5rem; border-radius: 4px; flex-shrink: 0; }
    .ra-level-name { font-weight: 600; font-size: 0.9rem; }
    .ra-level-goal { font-size: 0.8rem; color: var(--bs-secondary-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ra-level-count { margin-left: auto; font-size: 0.7rem; color: var(--bs-secondary-color); flex-shrink: 0; }
    .ra-level-body { border-top: 1px solid var(--bs-border-color); padding: 0.5rem 0.5rem 0.5rem 0; }
    .ra-tema { margin: 0 0 0.25rem 1.5rem; border: 1px solid var(--bs-border-color); border-radius: 8px; overflow: hidden; background: var(--bs-tertiary-bg); }
    .ra-tema-header { display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0.75rem; cursor: pointer; transition: background 0.15s; user-select: none; min-height: 44px; }
    .ra-tema-header:hover { background: var(--bs-body-bg); }
    .ra-tema-badge { font-size: 0.55rem; font-weight: 700; background: var(--bs-info,#3b82f6); color: #fff; padding: 0.1rem 0.4rem; border-radius: 3px; flex-shrink: 0; }
    .ra-tema-name { font-weight: 500; font-size: 0.85rem; }
    .ra-tema-count { margin-left: auto; font-size: 0.65rem; color: var(--bs-secondary-color); }
    .ra-tema-body { border-top: 1px solid var(--bs-border-color); padding: 0.5rem 0; }
    .ra-objetivo { padding: 0.5rem 0.75rem; margin: 0 0.5rem 0.5rem 1.5rem; background: var(--bs-body-bg); border: 1px solid var(--bs-border-color); border-radius: 8px; }
    .ra-objetivo-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .ra-obj-icon { color: var(--bs-warning,#f59e0b); font-size: 0.85rem; }
    .ra-obj-name { font-weight: 500; font-size: 0.8rem; color: var(--bs-body-color); }
    .ra-indicadores { display: flex; flex-direction: column; gap: 0.3rem; margin-left: 1.5rem; }
    .ra-indicador { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.5rem; border-radius: 6px; background: var(--bs-tertiary-bg); font-size: 0.8rem; }
    .ra-ind-text { flex: 1; color: var(--bs-body-color); }
    .ra-ind-calif { font-size: 0.6rem; font-weight: 700; color: #fff; padding: 0.15rem 0.5rem; border-radius: 10px; white-space: nowrap; flex-shrink: 0; }

    [data-bs-theme="dark"] .ra-level-badge { background: #818cf8; }
    [data-bs-theme="dark"] .ra-tema-badge { background: #60a5fa; }
    [data-bs-theme="dark"] .ra-obj-icon { color: #fbbf24; }
    [data-bs-theme="dark"] .ra-indicador { background: rgba(255,255,255,0.04); }
    [data-bs-theme="dark"] .ra-tema { background: rgba(255,255,255,0.03); }

    @media (max-width: 768px) {
      .ra-container { padding: 1rem; }
      .ra-toolbar { flex-direction: column; align-items: stretch; }
      .ra-select-wrapper { min-width: unset; width: 100%; }
      .ra-select { min-height: 44px; }
      .ra-stats { gap: 0.4rem; }
      .ra-stat { font-size: 0.65rem; padding: 0.2rem 0.5rem; }
      .ra-level { border-radius: 10px; }
      .ra-level-header { padding: 0.7rem 0.75rem; gap: 0.5rem; }
      .ra-level-goal { display: none; }
      .ra-tema { margin-left: 0.75rem; }
      .ra-objetivo { margin-left: 0.75rem; padding: 0.4rem 0.6rem; }
      .ra-indicadores { margin-left: 0.75rem; }
      .ra-indicador { flex-direction: column; align-items: flex-start; gap: 0.3rem; }
      .ra-ind-calif { align-self: flex-start; }
    }

    @media (max-width: 480px) {
      .ra-container { padding: 0.75rem; }
      .ra-title { font-size: 1.1rem; }
      .ra-icon { width: 36px; height: 36px; font-size: 1rem; }
      .ra-tema { margin-left: 0.5rem; }
      .ra-objetivo { margin-left: 0.5rem; }
      .ra-indicadores { margin-left: 0.5rem; }
    }
  `,document.head.appendChild(e)}function Ad(){S.register(`planificacion`,e=>ju(e,{viewMode:`maestro`})),S.register(`planificacion-plantillas`,e=>ju(e,{viewMode:`plantillas`})),S.register(`planificacion-maestros`,e=>ju(e,{viewMode:`admin`})),S.register(`planificacion-cobertura`,e=>Ju(e)),S.register(`planificacion-ruta`,e=>wd(e))}var jd={attendance_min_rate:.7,attendance_window_weeks:4,grade_min_avg:6,grade_window_count:3,indicator_min_pass_rate:.5,indicator_window_weeks:4};async function Md(){let{data:e,error:t}=await _.from(`alumnos`).select(`*`).order(`nombre_completo`,{ascending:!0});if(t)throw console.error(`Error cargando alumnos:`,t.message),Error(`No se pudieron cargar los alumnos`);return e}async function Nd(){let{data:e,error:t}=await _.from(`clases`).select(`*`).order(`nombre`,{ascending:!0});if(t)throw console.error(`Error cargando clases:`,t.message),Error(`No se pudieron cargar las clases`);return e}async function Pd(){let{data:e,error:t}=await _.from(`progresos`).select(`*`).order(`fecha_evaluacion`,{ascending:!1});if(t)throw console.error(`Error cargando progresos:`,t.message),Error(`No se pudieron cargar los progresos`);return e}async function Fd(e){if(!e.alumno_id)throw Error(`El alumno es obligatorio`);if(!e.clase_id)throw Error(`La clase es obligatoria`);if(!e.evaluacion_tipo)throw Error(`El tipo de evaluacion es obligatorio`);let t={alumno_id:e.alumno_id,clase_id:e.clase_id,maestro_id:e.maestro_id||null,fecha_evaluacion:e.fecha_evaluacion||null,evaluacion_tipo:e.evaluacion_tipo.trim(),calificacion:e.calificacion!==void 0&&e.calificacion!==null?parseFloat(e.calificacion):null,estado_cualitativo:(e.estado_cualitativo||`en_progreso`).trim(),observaciones:(e.observaciones||``).trim(),indicadores:e.indicadores||null};if(e.sesion_clase_id&&(t.sesion_clase_id=e.sesion_clase_id),e.asistencia_id&&(t.asistencia_id=e.asistencia_id),e.ejercicio_id&&(t.ejercicio_id=e.ejercicio_id),t.calificacion!==null&&(t.calificacion<0||t.calificacion>5))throw Error(`La calificacion debe estar entre 0 y 5`);let{data:n,error:r}=await _.from(`progresos`).insert([t]).select();if(r)throw r.message.includes(`duplicate key`)||r.code===`23505`?Error(`Ya existe una evaluacion con ese tipo para este alumno en esta clase`):(console.error(`Error creando progreso:`,r.message),Error(`No se pudo crear el progreso`));return n[0]}async function Id(e){let{data:t,error:n}=await _.from(`progresos`).select(`*`).eq(`alumno_id`,e).order(`fecha_evaluacion`,{ascending:!1});if(n)throw console.error(`Error cargando progresos del alumno:`,n.message),Error(`No se pudieron cargar los progresos del alumno`);return t}async function Ld(e){let{data:t,error:n}=await _.from(`progresos`).select(`*`).eq(`clase_id`,e).order(`fecha_evaluacion`,{ascending:!1});if(n)throw console.error(`Error cargando progresos de la clase:`,n.message),Error(`No se pudieron cargar los progresos de la clase`);return t}async function Rd(e,t){let{jsPDF:n}=await y(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-CBtVkUg2.js`).then(e=>e.n);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:r}=await y(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-C032RTqY.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([7,4])),i=new n,a=e.name||e.nombre||`Sin nombre`,o=e.section||`Sin sección`,s=zd(t),c=s!==null&&Bd(s);i.setFontSize(18),i.text(`Boletín Académico`,14,22),i.setFontSize(11),i.text(`Alumno: ${a}`,14,32),i.text(`Sección: ${o}`,14,38),i.text(`Fecha: ${new Date().toLocaleDateString(`es-ES`)}`,14,44);let l=c?`EN RIESGO`:`SATISFACTORIO`,u=c?[185,27,27]:[39,174,96];i.setFillColor(...u),i.rect(14,50,60,10,`F`),i.setTextColor(255,255,255),i.setFontSize(10),i.text(l,18,57),i.setTextColor(0,0,0),i.setFontSize(12),i.text(`Promedio: ${s===null?`N/A`:s.toFixed(2)}`,80,55),i.text(`Evaluaciones: ${t.length}`,80,62),t.length>0&&r(i,{head:[[`Fecha`,`Tipo`,`Calificación`,`Etiqueta`,`Observaciones`]],body:t.map(e=>[e.fecha_evaluacion?Vd(e.fecha_evaluacion):`-`,Hd(e.tipo_evaluacion),e.calificacion===null?`-`:e.calificacion.toFixed(2),Ud(e.calificacion),e.observaciones?e.observaciones.substring(0,40)+(e.observaciones.length>40?`...`:``):`-`]),startY:70,styles:{fontSize:9},headStyles:{fillColor:[41,128,185]}}),i.save(`boletin-${a.replace(/\s+/g,`-`).toLowerCase()}.pdf`)}function zd(e){if(!e||e.length===0)return null;let t=e.filter(e=>e.calificacion!==null&&e.calificacion!==void 0).map(e=>parseFloat(e.calificacion));return t.length===0?null:t.reduce((e,t)=>e+t,0)/t.length}function Bd(e){return e==null?!1:parseFloat(e)<3}function Vd(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):`-`}function Hd(e){return{oral:`Oral`,escrita:`Escrita`,practica:`Práctica`,evaluacion_parcial:`Parcial`,evaluacion_final:`Final`}[e]||e||`-`}function Ud(e){if(e==null)return`-`;let t=parseFloat(e);return t>=4.5?`Sobresaliente`:t>=4?`Muy Bueno`:t>=3?`Bueno`:t>=2?`En Progreso`:`Necesita Mejorar`}var Wd=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||``,this.clase_id=e.clase_id||``,this.maestro_id=e.maestro_id||null,this.fecha_evaluacion=e.fecha_evaluacion||``,this.tipo_evaluacion=e.tipo_evaluacion||e.evaluacion_tipo||``,this.calificacion=e.calificacion!==void 0&&e.calificacion!==null?parseFloat(e.calificacion):null,this.observaciones=e.observaciones||``,this.estado=e.estado||`en_progreso`,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];this.alumno_id||t.push(`El alumno es obligatorio`),this.clase_id||t.push(`La clase es obligatoria`),!this.tipo_evaluacion||!this.tipo_evaluacion.trim()?t.push(`El tipo de evaluación es obligatorio`):e.getTiposEvaluacion().map(e=>e.value).includes(this.tipo_evaluacion)||t.push(`Tipo de evaluación no válido`),this.calificacion!==null&&this.calificacion!==void 0&&(isNaN(this.calificacion)||this.calificacion<0||this.calificacion>5)&&t.push(`La calificación debe estar entre 0.0 y 5.0`),this.observaciones&&this.observaciones.length>500&&t.push(`Las observaciones no pueden exceder 500 caracteres`);let n=e.getEstados().map(e=>e.value);return this.estado&&!n.includes(this.estado)&&t.push(`Estado no válido`),t}static getTiposEvaluacion(){return[{value:`parcial`,label:`Parcial`},{value:`final`,label:`Final`},{value:`continua`,label:`Continua`},{value:`oral`,label:`Oral`},{value:`escrita`,label:`Escrita`},{value:`practica`,label:`Práctica`}]}static getEstados(){return[{value:`en_progreso`,label:`En Progreso`,color:`bg-primary`},{value:`completado`,label:`Completado`,color:`bg-success`},{value:`pendiente`,label:`Pendiente`,color:`bg-secondary`}]}static getEstadoConfig(e){return this.getEstados().find(t=>t.value===e)||{value:e,label:e,color:`bg-secondary`}}toJSON(){return{alumno_id:this.alumno_id,clase_id:this.clase_id,maestro_id:this.maestro_id,fecha_evaluacion:this.fecha_evaluacion||null,tipo_evaluacion:this.tipo_evaluacion.trim(),calificacion:this.calificacion,observaciones:this.observaciones?this.observaciones.trim():null,estado:this.estado}}};function Gd(e){if(!e||e.length===0)return{promedio:null,total:0,enRiesgo:!1};let t=e.map(e=>e.calificacion).filter(e=>e!=null&&!isNaN(e));if(t.length===0)return{promedio:null,total:e.length,enRiesgo:!1};let n=t.reduce((e,t)=>e+t,0),r=parseFloat((n/t.length).toFixed(2));return{promedio:r,total:e.length,enRiesgo:r<3}}async function Kd(e){let t=await Ld(e),n={};return t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]=[]),n[e.alumno_id].push(e)}),Object.entries(n).map(([e,t])=>({alumnoId:e,progresos:t,rendimiento:Gd(t)}))}var qd={calcularRendimiento:Gd,getResumenProgresosClase:Kd},K={progresos:[],progresosOriginales:[],alumnos:[],clases:[],cargando:!1,filtroClase:`todas`,container:null};async function Jd(e){if(e)try{K.container=e,K.cargando=!0,Yd(e);let[t,n,r]=await Promise.all([Pd(),Md(),Nd()]);K.progresos=(t||[]).map(e=>new Wd(e)),K.progresosOriginales=[...K.progresos],K.alumnos=n||[],K.clases=r||[],K.cargando=!1,Zd(e),$d(e)}catch(t){console.error(t),Xd(e,t.message)}}function Yd(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function Xd(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${h(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>progresos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`}function Zd(e){let t=K.progresosOriginales.length,n=K.progresosOriginales.filter(e=>e.calificacion!=null).map(e=>parseFloat(e.calificacion)),r=n.length>0?(n.reduce((e,t)=>e+t,0)/n.length).toFixed(2):null,i={};K.progresosOriginales.forEach(e=>{i[e.alumno_id]||(i[e.alumno_id]=[]),e.calificacion!=null&&i[e.alumno_id].push(parseFloat(e.calificacion))});let a=0;Object.values(i).forEach(e=>{e.length!==0&&e.reduce((e,t)=>e+t,0)/e.length<3&&a++});let o=Object.keys(i).length,s=new Set(K.progresosOriginales.map(e=>e.clase_id)).size;e.innerHTML=`
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
            ${K.clases.map(e=>`<option value="${e.id}" ${e.id===K.filtroClase?`selected`:``}>${h(e.nombre)}</option>`).join(``)}
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
              ${Qd()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function Qd(){let e=K.container.querySelector(`#buscar-progreso`)?.value.trim().toLowerCase()||``,t=K.filtroClase,n={};K.progresosOriginales.forEach(r=>{let i=K.alumnos.find(e=>e.id===r.alumno_id),a=K.clases.find(e=>e.id===r.clase_id);t!==`todas`&&r.clase_id!==t||e&&!i?.nombre_completo.toLowerCase().includes(e)&&!a?.nombre.toLowerCase().includes(e)||(n[r.alumno_id]||(n[r.alumno_id]={alumno:i,lista:[]}),n[r.alumno_id].lista.push(r))});let r=Object.values(n);return r.length===0?`<tr><td colspan="5" class="text-center py-5 text-muted">No hay resultados.</td></tr>`:r.map(({alumno:e,lista:t})=>{let n=qd.calcularRendimiento(t);return`
      <tr class="border-start-accent ${n.enRiesgo?`border-accent-danger`:`border-accent-success`}">
        <td>
          <div class="fw-bold">${h(e?.nombre_completo||`Desconocido`)}</div>
          <div class="small text-muted">${t.length>0?h(K.clases.find(e=>e.id===t[0].clase_id)?.nombre):``}</div>
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
    `}).join(``)}function $d(e){e.querySelector(`#select-clase`)?.addEventListener(`change`,t=>{K.filtroClase=t.target.value,e.querySelector(`#progresos-tbody`).innerHTML=Qd()}),e.querySelector(`#buscar-progreso`)?.addEventListener(`input`,()=>{e.querySelector(`#progresos-tbody`).innerHTML=Qd()}),e.querySelector(`#progresos-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,alumnoId:r}=t.dataset;n===`pdf`&&ef(r),n===`view-detail`&&tf(r)}),e.querySelector(`#btn-nueva-nota`)?.addEventListener(`click`,()=>nf())}async function ef(e){let t=K.alumnos.find(t=>t.id===e),n=K.progresosOriginales.filter(t=>t.alumno_id===e);v.info(`Generando boletín institucional...`);try{await Rd(t,n),v.success(`Boletín generado exitosamente`)}catch(e){v.error(`Error al generar PDF: `+e.message)}}function tf(e){let t=K.alumnos.find(t=>t.id===e),n=K.progresosOriginales.filter(t=>t.alumno_id===e),r=qd.calcularRendimiento(n);b.open({title:`Detalle Académico: ${t.nombre_completo}`,size:`lg`,hideSave:!0,body:`
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
                <td class="small text-muted">${h(e.observaciones||`-`)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `})}function nf(){b.open({title:`Registrar Nueva Calificación`,saveText:`Guardar Nota`,body:`
      <form id="form-nota" class="row g-3">
        <div class="col-md-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="nota-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${K.alumnos.map(e=>`<option value="${e.id}">${e.nombre_completo}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="nota-clase_id" required>
            <option value="">Seleccionar...</option>
            ${K.clases.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo de Evaluación *</label>
          <select class="form-select input-dense" id="nota-tipo" required>
            ${Wd.getTiposEvaluacion().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
    `,onSave:async e=>{let t={alumno_id:e.querySelector(`#nota-alumno_id`).value,clase_id:e.querySelector(`#nota-clase_id`).value,tipo_evaluacion:e.querySelector(`#nota-tipo`).value,calificacion:parseFloat(e.querySelector(`#nota-valor`).value),fecha_evaluacion:e.querySelector(`#nota-fecha`).value,observaciones:e.querySelector(`#nota-obs`).value.trim()},n=new Wd(t).validate();if(n.length>0)return v.error(n[0]),!1;try{return await Fd(t),v.success(`Nota registrada exitosamente`),Jd(K.container),!0}catch(e){return v.error(e.message),!1}}})}function rf(){S.register(`progresos`,Jd)}function af(e){return e?Array.isArray(e)?e.map(e=>new g(e)):new g(e):null}async function of(){let{data:e,error:t}=await _.from(`observaciones_alumnos`).select(`
      *,
      alumno:alumnos(nombre_completo),
      maestro:maestros(nombre_completo)
    `).order(`fecha_observacion`,{ascending:!1});if(t)throw console.error(`Error cargando observaciones:`,t.message),Error(`No se pudieron cargar las observaciones`);return e.map(e=>{let t=new g(e);return t.alumno_nombre=e.alumno?.nombre_completo||`Desconocido`,t.maestro_nombre=e.maestro?.nombre_completo||`N/A`,t})}async function sf(e){let t=new g(e),n=t.validate();if(n.length>0)throw Error(n[0]);let{data:r,error:i}=await _.from(`observaciones_alumnos`).insert([t.toJSON()]).select();if(i)throw i;return af(r[0])}async function cf(e,t){let{data:n}=await _.from(`observaciones_alumnos`).select(`*`).eq(`id`,e).single(),r=new g({...n,...t}),i=r.validate();if(i.length>0)throw Error(i[0]);let{data:a,error:o}=await _.from(`observaciones_alumnos`).update(r.toJSON()).eq(`id`,e).select();if(o)throw o;return af(a[0])}async function lf(e){let{error:t}=await _.from(`observaciones_alumnos`).delete().eq(`id`,e);if(t)throw t}async function uf(e,t){let{data:n,error:r}=await _.from(`observaciones_alumnos`).update({seguimiento_observacion:t.trim(),seguimiento_fecha:new Date().toISOString().split(`T`)[0],estado:`seguimiento`,requiere_seguimiento:!0}).eq(`id`,e).select();if(r)throw r;return af(n[0])}async function df(){let{data:e,error:t}=await _.from(`observaciones_alumnos`).select(`estado, prioridad, tipo`);if(t)throw t;return{total:e.length,abiertas:e.filter(e=>e.estado===`abierta`).length,seguimiento:e.filter(e=>e.estado===`seguimiento`).length,altas:e.filter(e=>e.prioridad===`alta`).length,porTipo:e.reduce((e,t)=>(e[t.tipo]=(e[t.tipo]||0)+1,e),{})}}function ff(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}var q={observaciones:[],observacionesOriginales:[],alumnos:[],estadisticas:null,cargando:!1,filtroTipo:``,filtroEstado:`todos`,container:null};async function pf(e){if(e)try{q.container=e,q.cargando=!0,mf(e);let[t,n,r]=await Promise.all([of(),$e().catch(()=>[]),df().catch(()=>null)]);q.observaciones=t,q.observacionesOriginales=[...t],q.alumnos=n,q.estadisticas=r,q.cargando=!1,gf(e),yf(e)}catch(t){console.error(t),hf(e,t.message)}}function mf(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function hf(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${ff(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>observaciones_alumnos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
          <button class="btn btn-outline-warning btn-sm mt-3" id="retry-btn">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>
    </div>`,e.querySelector(`#retry-btn`)?.addEventListener(`click`,()=>pf(e))}function gf(e){e.innerHTML=`
    <div class="page-container">
      <div class="observaciones-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-clipboard2-pulse fs-4"></i>
          </div>
          <div>
            <h1 class="observaciones-title-premium page-title mb-0">Observaciones</h1>
            <p class="text-muted small mb-0">${q.observaciones.length} observaciones en total</p>
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
            <div class="stat-value">${q.estadisticas?.abiertas||0}</div>
          </div>
          <div class="stat-card stat-justified border-start border-4 border-warning">
            <div class="stat-label">Seguimiento</div>
            <div class="stat-value">${q.estadisticas?.seguimiento||0}</div>
          </div>
          <div class="stat-card stat-absent border-start border-4 border-danger">
            <div class="stat-label">Alta Prioridad</div>
            <div class="stat-value">${q.estadisticas?.altas||0}</div>
          </div>
          <div class="stat-card stat-present border-start border-4 border-success">
            <div class="stat-label">Total</div>
            <div class="stat-value">${q.estadisticas?.total||0}</div>
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
            ${g.getTipos().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
              ${_f(q.observaciones)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${q.observaciones.length===0?vf():``}</div>
      </div>
    </div>
  `}function _f(e){return e.map(e=>{let t=g.getTipos().find(t=>t.value===e.tipo),n=g.getPrioridades().find(t=>t.value===e.prioridad),r=g.getEstados().find(t=>t.value===e.estado),i=e.prioridad===`alta`?`border-accent-danger`:e.prioridad===`media`?`border-accent-warning`:`border-accent-secondary`;return`
      <tr data-id="${e.id}" class="border-start-accent ${i}">
        <td>
          <div class="fw-bold text-truncate" style="max-width: 250px;">${ff(e.titulo)}</div>
          <div class="small text-muted">${ff(e.alumno_nombre)}</div>
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
    `}).join(``)}function vf(){return`<div class="text-center py-5 text-muted"><i class="bi bi-chat-left-dots fs-1 d-block mb-2"></i>No se encontraron observaciones.</div>`}function yf(e){e.querySelector(`#buscar-obs`)?.addEventListener(`input`,bf),e.querySelector(`#select-tipo`)?.addEventListener(`change`,bf),e.querySelector(`#obs-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit`&&xf(r),n===`delete`&&Cf(r),n===`follow`&&Sf(r)}),e.querySelector(`#btn-nueva-obs`)?.addEventListener(`click`,()=>xf(null))}function bf(){let e=q.container.querySelector(`#buscar-obs`).value.toLowerCase(),t=q.container.querySelector(`#select-tipo`).value;q.observaciones=q.observacionesOriginales.filter(n=>{let r=n.titulo.toLowerCase().includes(e)||n.alumno_nombre.toLowerCase().includes(e),i=!t||n.tipo===t;return r&&i}),q.container.querySelector(`#obs-tbody`).innerHTML=_f(q.observaciones)}async function xf(e){let t=e?q.observacionesOriginales.find(t=>t.id===e):new g;b.open({title:e?`Editar Observación`:`Nueva Observación`,saveText:`Guardar`,body:`
      <form id="form-obs" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="obs-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${q.alumnos.map(e=>`<option value="${e.id}" ${e.id===t.alumno_id?`selected`:``}>${ff(e.nombre_completo)}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-8">
          <label class="form-label-compact">Título de la Incidencia *</label>
          <input type="text" class="form-control input-dense" id="obs-titulo" value="${ff(t.titulo)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Prioridad</label>
          <select class="form-select input-dense" id="obs-prioridad">
            ${g.getPrioridades().map(e=>`<option value="${e.value}" ${e.value===t.prioridad?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo</label>
          <select class="form-select input-dense" id="obs-tipo">
            ${g.getTipos().map(e=>`<option value="${e.value}" ${e.value===t.tipo?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Fecha</label>
          <input type="date" class="form-control input-dense" id="obs-fecha" value="${t.fecha_observacion||new Date().toISOString().split(`T`)[0]}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción Detallada *</label>
          <textarea class="form-control input-dense" id="obs-descripcion" rows="4" required>${ff(t.descripcion)}</textarea>
        </div>
      </form>
    `,onSave:async t=>{let n={alumno_id:t.querySelector(`#obs-alumno_id`).value,titulo:t.querySelector(`#obs-titulo`).value.trim(),prioridad:t.querySelector(`#obs-prioridad`).value,tipo:t.querySelector(`#obs-tipo`).value,fecha_observacion:t.querySelector(`#obs-fecha`).value,descripcion:t.querySelector(`#obs-descripcion`).value.trim()},r=new g(n).validate();if(r.length>0)return v.error(r[0]),!1;try{return e?(await cf(e,n),v.success(`Observación actualizada`)):(await sf(n),v.success(`Observación registrada`)),pf(q.container),!0}catch(e){return v.error(e.message),!1}}})}function Sf(e){let t=q.observacionesOriginales.find(t=>t.id===e);b.open({title:`Añadir Seguimiento`,saveText:`Guardar Seguimiento`,body:`
      <p class="small text-muted mb-3">Estás añadiendo una nota de seguimiento a: <strong>${ff(t.titulo)}</strong></p>
      <div class="mb-3">
        <label class="form-label-compact">Nota de seguimiento</label>
        <textarea class="form-control input-dense" id="follow-obs" rows="4" placeholder="Describe las acciones tomadas..."></textarea>
      </div>
    `,onSave:async t=>{let n=t.querySelector(`#follow-obs`).value.trim();if(!n)return v.error(`La nota es obligatoria`),!1;try{return await uf(e,n),v.success(`Seguimiento registrado`),pf(q.container),!0}catch(e){return v.error(e.message),!1}}})}function Cf(e){let t=q.observacionesOriginales.find(t=>t.id===e);b.open({title:`⚠️ Eliminar Observación`,saveText:`Eliminar`,body:`<p>¿Estás seguro de eliminar "${ff(t.titulo)}"?</p>`,onSave:async()=>(await lf(e),pf(q.container),!0)})}function wf(){S.register(`observaciones`,pf)}var Tf=e({getAlertasActivas:()=>Af,getAlertasRojas:()=>jf,getAlumnosDestacados:()=>zf,getAlumnosEnRiesgoAcademico:()=>Bf,getAlumnosEnRiesgoAlto:()=>kf,getCorrelacionAsistenciaRendimiento:()=>Uf,getDestacadosYRiesgoAcademico:()=>Rf,getEstadisticasPeriodoActivo:()=>Lf,getEstadisticasPeriodos:()=>If,getHistorialEstadoAlumno:()=>Wf,getPatronAsistencia:()=>Ff,getRachaAusencias:()=>Vf,getRendimientoMaestro:()=>Pf,getRendimientoMaestros:()=>Nf,getResumenAlertas:()=>Mf,getResumenAlumno:()=>Df,getResumenAlumnos:()=>Ef,getRiesgoAbandono:()=>Of,getTasaAsistenciaPeriodo:()=>Hf,registrarCambioEstadoAlumno:()=>Gf});async function Ef(){let{data:e,error:t}=await _.from(`vw_resumen_alumno`).select(`*`).order(`nombre_completo`);if(t)throw Error(`No se pudo cargar el resumen de alumnos`);return e}async function Df(e){let{data:t,error:n}=await _.from(`vw_resumen_alumno`).select(`*`).eq(`id`,e).single();if(n)throw Error(`No se pudo cargar el resumen del alumno`);return t}async function Of({nivel:e=null}={}){let t=_.from(`vw_riesgo_abandono`).select(`*`).order(`score_riesgo`,{ascending:!1});e&&(t=t.eq(`nivel_riesgo`,e));let{data:n,error:r}=await t;if(r)throw Error(`No se pudo cargar el análisis de riesgo`);return n}async function kf(){return Of({nivel:`alto`})}async function Af({color:e=null,alumnoId:t=null}={}){let n=_.from(`vw_alertas_activas`).select(`*`).order(`fecha_referencia`,{ascending:!0});e&&(n=n.eq(`color`,e)),t&&(n=n.eq(`alumno_id`,t));let{data:r,error:i}=await n;if(i)throw Error(`No se pudieron cargar las alertas`);return r}async function jf(){return Af({color:`rojo`})}async function Mf(){let{data:e,error:t}=await _.from(`vw_alertas_activas`).select(`color, tipo_alerta`);if(t)throw Error(`No se pudo obtener el resumen de alertas`);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length,porTipo:e.reduce((e,t)=>(e[t.tipo_alerta]=(e[t.tipo_alerta]||0)+1,e),{})}}async function Nf(){let{data:e,error:t}=await _.from(`vw_rendimiento_maestro`).select(`*`);if(t)throw Error(`No se pudo cargar el rendimiento de maestros`);return e}async function Pf(e){let{data:t,error:n}=await _.from(`vw_rendimiento_maestro`).select(`*`).eq(`maestro_id`,e).single();if(n)throw Error(`No se pudo cargar el rendimiento del maestro`);return t}async function Ff({instrumento:e=null}={}){let t=_.from(`vw_patron_asistencia`).select(`*`).order(`dia_semana_num`);e&&(t=t.eq(`instrumento_principal`,e));let{data:n,error:r}=await t;if(r)throw Error(`No se pudo cargar el patrón de asistencia`);return n}async function If(){let{data:e,error:t}=await _.from(`vw_estadisticas_periodo`).select(`*`);if(t)throw Error(`No se pudieron cargar las estadísticas por período`);return e}async function Lf(){let{data:e,error:t}=await _.from(`vw_estadisticas_periodo`).select(`*`).eq(`activo`,!0).order(`fecha_inicio`,{ascending:!1}).limit(1);if(t)throw Error(`No se pudieron cargar las estadísticas del período activo: `+t.message);return e&&e.length>0?e[0]:null}async function Rf({categoria:e=null}={}){let t=_.from(`vw_destacados_y_riesgo_academico`).select(`*`);e&&(t=t.eq(`categoria`,e));let{data:n,error:r}=await t;if(r)throw Error(`No se pudo cargar el análisis académico`);return n}async function zf(){return Rf({categoria:`destacado`})}async function Bf(){return Rf({categoria:`riesgo_academico`})}async function Vf(e){let{data:t,error:n}=await _.rpc(`fn_racha_ausencias`,{p_alumno_id:e});if(n)throw Error(`No se pudo calcular la racha de ausencias`);return t}async function Hf(e,t,n=null){let r={p_alumno_id:e,p_desde:t};n&&(r.p_hasta=n);let{data:i,error:a}=await _.rpc(`fn_tasa_asistencia_periodo`,r);if(a)throw Error(`No se pudo calcular la tasa de asistencia`);return i}async function Uf(){let{data:e,error:t}=await _.rpc(`fn_correlacion_asistencia_rendimiento`);if(t)throw Error(`No se pudo calcular la correlación`);return e}async function Wf(e){let{data:t,error:n}=await _.from(`historial_estado_alumno`).select(`*`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1});if(n)throw Error(`No se pudo cargar el historial`);return t}async function Gf(e,t,n,r=null){if(![`activo`,`baja_voluntaria`,`baja_academica`,`suspendido`,`egresado`].includes(t))throw Error(`Estado no válido`);let{data:i,error:a}=await _.from(`historial_estado_alumno`).insert([{alumno_id:e,estado:t,motivo:n?.trim()||null,registrado_por:r||null,fecha:new Date().toISOString().split(`T`)[0]}]).select();if(a)throw Error(`No se pudo registrar el cambio de estado`);return i[0]}async function Kf(e){let t={"/assets/data/mocks/alumnos.json":()=>y(()=>import(`./alumnos-DdhAG3eL.js`).then(e=>e.n),__vite__mapDeps([11,4])),"/assets/data/mocks/clases.json":()=>y(()=>import(`./clases-Dt16onyD.js`).then(e=>e.n),__vite__mapDeps([9,4])),"/assets/data/mocks/sesiones.json":()=>y(()=>Promise.resolve().then(()=>Ul),void 0),"/assets/data/mocks/maestro_tareas.json":()=>y(()=>import(`./maestro_tareas-TPZWleVI.js`),[]),"/assets/data/mocks/metricas_periodo.json":()=>y(()=>import(`./metricas_periodo-gepmL6tN.js`),[]),"/assets/data/mocks/alertas_config.json":()=>y(()=>import(`./alertas_config-DCp_tTci.js`),[]),"/assets/data/mocks/objetivos_gamificacion.json":()=>y(()=>import(`./objetivos_gamificacion-C3kQ9kzr.js`),[]),"/assets/data/mocks/ausencias.json":()=>y(()=>import(`./ausencias-DTEI0TfJ.js`),[]),"/assets/data/mocks/planificacion-curricular.json":()=>y(()=>import(`./planificacion-curricular-Ck0dUw6K.js`),[])}[e];if(t){let e=await t();return e.default||e}return console.warn(`loadJsonMock: ruta no mapeada: ${e}`),null}var qf=e({getAlertasActivas:()=>np,getAlertasConfig:()=>ep,getAlumnosDestacados:()=>sp,getEstadisticasPeriodo:()=>Zf,getEstadisticasPeriodoActivo:()=>Qf,getHistorialEstadoAlumno:()=>ip,getRachaAusencias:()=>ap,getResumenAlertas:()=>rp,getResumenAlumno:()=>Xf,getResumenAlumnos:()=>Yf,getRiesgoAbandono:()=>op,getTasaAsistenciaPeriodo:()=>$f,updateAlertaConfig:()=>tp}),Jf=`/assets/data/mocks/metricas_periodo.json`;async function Yf(){return(await Kf(Jf)).estadisticas_periodo[0]?.total_alumnos||0}async function Xf(e){return null}async function Zf(){return(await Kf(Jf)).configuraciones}async function Qf(){let e=await Kf(Jf),t=e.configuraciones.find(e=>e.activo),n=e.estadisticas_periodo.find(e=>e.periodo_id===t?.id);return t?{...t,...n}:null}async function $f(e,t,n=null){return 87.5}async function ep(){return await Kf(`/assets/data/mocks/alertas_config.json`)}async function tp(e,t){return console.log(`Mock: updateAlertaConfig`,e,t),{id:e,...t}}async function np(e={}){return(await Kf(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo)}async function rp(){let e=(await Kf(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length}}async function ip(e){return[]}async function ap(e){return 0}async function op({nivel:e=null}={}){let t=[{nombre_completo:`Mateo Fernández`,score_riesgo:88,nivel_riesgo:`alto`},{nombre_completo:`Lucía Benítez`,score_riesgo:65,nivel_riesgo:`medio`},{nombre_completo:`Santiago Morales`,score_riesgo:35,nivel_riesgo:`bajo`}];return e?t.filter(t=>t.nivel_riesgo===e):t}async function sp(){return[{nombre_completo:`Valeria Russo`,promedio:9.85,programa:`Violín Cátedra`},{nombre_completo:`Thiago Silva`,promedio:9.72,programa:`Violín Inicial`},{nombre_completo:`Delfina Lombardi`,promedio:9.6,programa:`Violín Cátedra`}]}var cp=()=>x.isDemoMode?qf:Tf,lp=(...e)=>cp().getEstadisticasPeriodoActivo(...e),up=(...e)=>cp().getTasaAsistenciaPeriodo(...e),dp=(...e)=>cp().getAlertasActivas(...e),fp=(...e)=>cp().getResumenAlertas(...e),pp=(...e)=>cp().getAlumnosDestacados(...e),mp=e({callDslRpc:()=>bp,getAuditLogs:()=>vp,getOperaciones:()=>yp,getSystemLogs:()=>gp,recordSystemLog:()=>_p}),hp=`soi_system_logs`;async function gp(){try{let e=localStorage.getItem(hp),t=e?JSON.parse(e):[];if(t.length===0){let e={timestamp:new Date().toISOString(),level:`INFO`,module:`PWA`,message:`System logs initialized. Tracking core activities.`,network:navigator.onLine?`Online`:`Offline`};t.push(e),localStorage.setItem(hp,JSON.stringify(t))}return t}catch(e){return console.error(`Error al leer los logs del sistema local:`,e),[]}}async function _p(e){try{let t=await gp(),n={timestamp:new Date().toISOString(),level:e.level||`INFO`,module:e.module||`Client`,message:e.message||`Sin mensaje de error especificado`,network:navigator.onLine?`Online`:`Offline`,stack:e.stack||``};return t.unshift(n),t.length>100&&t.pop(),localStorage.setItem(hp,JSON.stringify(t)),n}catch(e){console.error(`Error al registrar log de sistema:`,e)}}async function vp(){try{let{data:e,error:t}=await _.from(`ausencias_auditoria`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw await _p({level:`ERROR`,module:`SupabaseClient`,message:`Falla al consultar ausencias_auditoria (RLS o Permisos): ${t.message}`}),t;return(e||[]).map(e=>({id:e.id,ausencia_id:e.ausencia_id,actor_id:e.actor_id,usuario_id:e.actor_id,creado_a:e.created_at,created_at:e.created_at,accion:e.accion,notas:e.notas,detalles:e.notas?{notas:e.notas}:{}}))}catch(e){return console.warn(`Excepción de RLS controlada con éxito en getAuditLogs:`,e.message||e),await _p({level:`WARNING`,module:`ObservabilidadAPI`,message:`Audit logs no disponibles (RLS o Red caída). Retornando lista vacía resiliente.`}),[]}}async function yp(){try{let{data:e,error:t}=await _.from(`operaciones_sistema`).select(`*`).order(`created_at`,{ascending:!1}).limit(50);return t?(await _p({level:`WARNING`,module:`ObservabilidadAPI`,message:`Error al consultar operaciones_sistema: ${t.message}`}),[]):(e||[]).map(e=>({id:e.id,tipo:e.tipo,descripcion:e.descripcion,estado:e.estado,timestamp:e.created_at||e.timestamp,detalles:e.detalles||{}}))}catch(e){return console.warn(`Error al obtener operaciones del sistema:`,e.message||e),await _p({level:`WARNING`,module:`ObservabilidadAPI`,message:`Operaciones del sistema no disponibles. Retornando lista vacía.`}),[]}}async function bp(){let[e,t,n]=await Promise.all([_.from(`view_institutional_radar`).select(`*`),_.from(`view_node_difficulty`).select(`*`).order(`failure_percentage`,{ascending:!1}),_.from(`vw_rendimiento_maestro`).select(`*`)]);return{radarData:e.data||[],nodeDifficulty:t.data||[],complianceData:n.data||[]}}var xp=e({callDslRpc:()=>kp,getAuditLogs:()=>Ep,getOperaciones:()=>Op,getSystemLogs:()=>Tp,recordSystemLog:()=>Dp}),Sp=[{timestamp:new Date(Date.now()-36e5*48).toISOString(),level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 12ms, LCP: 950ms, CLS: 0.01.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*36).toISOString(),level:`INFO`,module:`SyncManager`,message:`Network online detected. Synchronizing queue of 3 records.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*24).toISOString(),level:`INFO`,module:`ServiceWorker`,message:`SW cached all static assets successfully. Version 2.1.0.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*18).toISOString(),level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 11ms (Excelente), LCP: 980ms (Excelente), CLS: 0.012 (Excelente).`,network:`Online`},{timestamp:new Date(Date.now()-36e5*12).toISOString(),level:`INFO`,module:`AuthModule`,message:`User session validated successfully. Token refreshed.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*6).toISOString(),level:`INFO`,module:`IndexedDB`,message:`Offline store initialized with 12 pending records.`,network:`Offline`},{timestamp:new Date(Date.now()-36e5*1).toISOString(),level:`INFO`,module:`SyncManager`,message:`Background sync completed: 8 records pushed to server.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*30).toISOString(),level:`WARNING`,module:`SyncManager`,message:`Network offline detected. Queuing 3 pending academic attendance records locally.`,network:`Offline`},{timestamp:new Date(Date.now()-36e5*20).toISOString(),level:`WARNING`,module:`HTTPClient`,message:`Request timed out for endpoint /rpc/get_institutional_radar. Falling back to offline fallback state.`,stack:`TimeoutException: Request took longer than 5000ms`,network:`Online`},{timestamp:new Date(Date.now()-36e5*10).toISOString(),level:`WARNING`,module:`SupabaseClient`,message:`Rate limit approaching: 85/100 requests in current window.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*3).toISOString(),level:`WARNING`,module:`CacheAPI`,message:`Cache storage nearly full (42MB / 50MB). Consider clearing old entries.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*48).toISOString(),level:`ERROR`,module:`SupabaseClient`,message:`Failed to query public.ausencias_auditoria due to temporary connection timeout.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*24).toISOString(),level:`ERROR`,module:`AuthModule`,message:`Policy check violation for non-admin user trying to access logs. Terminating session gracefully.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*8).toISOString(),level:`ERROR`,module:`SyncManager`,message:`Failed to push 2 attendance records: 409 Conflict — record already exists.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*2).toISOString(),level:`ERROR`,module:`ServiceWorker`,message:`Unhandled promise rejection: TypeError: Failed to fetch dynamically imported module.`,stack:`TypeError: Failed to fetch
  at HTMLScriptElement.onerror (serviceWorker.js:42)`,network:`Online`},{timestamp:new Date(Date.now()-36e5*.5).toISOString(),level:`ERROR`,module:`IndexedDB`,message:`Transaction aborted: QuotaExceededError when attempting to store log batch.`,network:`Online`}],Cp=[{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a22`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a33`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`APROBACION_FINAL`,notas:`Ausencia aprobada automáticamente por cumplimiento de documentos adjuntos.`,creado_a:new Date(Date.now()-36e5*24*30).toISOString(),created_at:new Date(Date.now()-36e5*24*30).toISOString(),detalles:{motivo:`Médico`,maestro:`Carlos Gómez`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a23`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`CREACION`,notas:`Registro inicial de solicitud de ausencia por comisión de servicios.`,creado_a:new Date(Date.now()-36e5*24*28).toISOString(),created_at:new Date(Date.now()-36e5*24*28).toISOString(),detalles:{motivo:`Capacitación externa`,maestro:`María Luz`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a24`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`RECHAZO`,notas:`Rechazada por falta de justificativo médico oficial impreso.`,creado_a:new Date(Date.now()-36e5*24*25).toISOString(),created_at:new Date(Date.now()-36e5*24*25).toISOString(),detalles:{motivo:`Asuntos personales`,maestro:`Pedro Almonte`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a25`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a35`,usuario_id:`maestro.violin@gentleai.com`,usuario_nombre:`Lucía Mendoza`,accion:`ausencia_creada`,notas:`Solicitud de ausencia por participación en festival regional de cuerdas.`,creado_a:new Date(Date.now()-36e5*24*22).toISOString(),created_at:new Date(Date.now()-36e5*24*22).toISOString(),detalles:{motivo:`Comisión oficial`,maestro:`Lucía Mendoza`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a26`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a36`,usuario_id:`maestro.piano@gentleai.com`,usuario_nombre:`Roberto Díaz`,accion:`ausencia_creada`,notas:`Incapacidad médica por laringitis diagnosticada.`,creado_a:new Date(Date.now()-36e5*24*20).toISOString(),created_at:new Date(Date.now()-36e5*24*20).toISOString(),detalles:{motivo:`Médico`,maestro:`Roberto Díaz`,duracion:`5 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a27`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a37`,usuario_id:`maestro.percusion@gentleai.com`,usuario_nombre:`Ana Martínez`,accion:`ausencia_creada`,notas:`Solicitud por duelo familiar (fallecimiento de familiar directo).`,creado_a:new Date(Date.now()-36e5*24*18).toISOString(),created_at:new Date(Date.now()-36e5*24*18).toISOString(),detalles:{motivo:`Duelo`,maestro:`Ana Martínez`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a28`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a38`,usuario_id:`maestro.cuerdas@gentleai.com`,usuario_nombre:`Pedro Castillo`,accion:`ausencia_creada`,notas:`Ausencia por capacitación pedagógica en el extranjero.`,creado_a:new Date(Date.now()-36e5*24*15).toISOString(),created_at:new Date(Date.now()-36e5*24*15).toISOString(),detalles:{motivo:`Capacitación`,maestro:`Pedro Castillo`,duracion:`7 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a29`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a39`,usuario_id:`maestro.vientos@gentleai.com`,usuario_nombre:`Carmen Rivas`,accion:`ausencia_creada`,notas:`Solicitud por emergencia familiar de último momento.`,creado_a:new Date(Date.now()-36e5*24*12).toISOString(),created_at:new Date(Date.now()-36e5*24*12).toISOString(),detalles:{motivo:`Emergencia familiar`,maestro:`Carmen Rivas`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a30`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a40`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: pendiente → aprobada. Documentación completa.`,creado_a:new Date(Date.now()-36e5*24*10).toISOString(),created_at:new Date(Date.now()-36e5*24*10).toISOString(),detalles:{estado_anterior:`pendiente`,estado_nuevo:`aprobada`,motivo_cambio:`Documentación completa`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a31`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a41`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`estado_modificado`,notas:`Cambio de estado: aprobada → rechazada. Se detectó inconsistencia en fechas.`,creado_a:new Date(Date.now()-36e5*24*8).toISOString(),created_at:new Date(Date.now()-36e5*24*8).toISOString(),detalles:{estado_anterior:`aprobada`,estado_nuevo:`rechazada`,motivo_cambio:`Inconsistencia en fechas`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a32`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a42`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`estado_modificado`,notas:`Cambio de estado: pendiente → en_revision. Se solicitaron documentos adicionales.`,creado_a:new Date(Date.now()-36e5*24*6).toISOString(),created_at:new Date(Date.now()-36e5*24*6).toISOString(),detalles:{estado_anterior:`pendiente`,estado_nuevo:`en_revision`,motivo_cambio:`Documentos adicionales requeridos`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a33`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a43`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: en_revision → aprobada. Todo en orden.`,creado_a:new Date(Date.now()-36e5*24*5).toISOString(),created_at:new Date(Date.now()-36e5*24*5).toISOString(),detalles:{estado_anterior:`en_revision`,estado_nuevo:`aprobada`,motivo_cambio:`Documentación verificada`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a44`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: aprobada → cancelada. El maestro solicitó cancelación.`,creado_a:new Date(Date.now()-36e5*24*3).toISOString(),created_at:new Date(Date.now()-36e5*24*3).toISOString(),detalles:{estado_anterior:`aprobada`,estado_nuevo:`cancelada`,motivo_cambio:`Solicitud del maestro`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a35`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a45`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso especial aprobado para asistir a congreso de educación musical.`,creado_a:new Date(Date.now()-36e5*24*21).toISOString(),created_at:new Date(Date.now()-36e5*24*21).toISOString(),detalles:{tipo_permiso:`Congreso`,maestro:`Santiago Ortiz`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a36`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a46`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`permiso_aprobado`,notas:`Permiso por medio día para trámite personal urgente.`,creado_a:new Date(Date.now()-36e5*24*17).toISOString(),created_at:new Date(Date.now()-36e5*24*17).toISOString(),detalles:{tipo_permiso:`Personal`,maestro:`Valentina Suárez`,duracion:`0.5 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a37`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a47`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso sindical aprobado según convenio colectivo.`,creado_a:new Date(Date.now()-36e5*24*14).toISOString(),created_at:new Date(Date.now()-36e5*24*14).toISOString(),detalles:{tipo_permiso:`Sindical`,maestro:`Ricardo Peña`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a38`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a48`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`permiso_aprobado`,notas:`Permiso académico aprobado para rendir examen de posgrado.`,creado_a:new Date(Date.now()-36e5*24*9).toISOString(),created_at:new Date(Date.now()-36e5*24*9).toISOString(),detalles:{tipo_permiso:`Académico`,maestro:`Daniela Ríos`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a39`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a49`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso especial aprobado para donación de sangre (beneficio institucional).`,creado_a:new Date(Date.now()-36e5*24*4).toISOString(),created_at:new Date(Date.now()-36e5*24*4).toISOString(),detalles:{tipo_permiso:`Beneficio institucional`,maestro:`Fernando Mora`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a40`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a50`,usuario_id:`maestro.vientos@gentleai.com`,usuario_nombre:`Miguel Ángel`,accion:`ausencia_creada`,notas:`Solicitud por enfermedad repentina. Adjunta certificado médico.`,creado_a:new Date(Date.now()-36e5*24*2).toISOString(),created_at:new Date(Date.now()-36e5*24*2).toISOString(),detalles:{motivo:`Enfermedad`,maestro:`Miguel Ángel`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a41`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a51`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`APROBACION_FINAL`,notas:`Aprobación final de ausencia por maternidad. Sustitución asignada.`,creado_a:new Date(Date.now()-36e5*24*1).toISOString(),created_at:new Date(Date.now()-36e5*24*1).toISOString(),detalles:{motivo:`Maternidad`,maestro:`Gabriela Torres`,duracion:`90 días`,sustituto:`María Fernández`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a42`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a52`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`CREACION`,notas:`Registro de ausencia preventiva por brote de gripe en el aula.`,creado_a:new Date(Date.now()-36e5*12).toISOString(),created_at:new Date(Date.now()-36e5*12).toISOString(),detalles:{motivo:`Preventivo`,maestro:`Varios`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a43`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a53`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`RECHAZO`,notas:`Rechazada por superar el límite de días permitidos sin justificación.`,creado_a:new Date(Date.now()-36e5*6).toISOString(),created_at:new Date(Date.now()-36e5*6).toISOString(),detalles:{motivo:`Exceso de días`,maestro:`Laura Jiménez`,duracion:`15 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a44`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a54`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso de cuidado familiar aprobado según normativa institucional.`,creado_a:new Date(Date.now()-36e5*3).toISOString(),created_at:new Date(Date.now()-36e5*3).toISOString(),detalles:{tipo_permiso:`Cuidado familiar`,maestro:`Andrea Vega`,duracion:`2 días`}}],wp=[{id:`op-001`,tipo:`sincronizacion`,descripcion:`Sincronización masiva de asistencias del período`,estado:`completado`,timestamp:new Date(Date.now()-36e5*48).toISOString(),detalles:{registros_sincronizados:234,duracion_ms:3450}},{id:`op-002`,tipo:`reporte`,descripcion:`Generación de reporte mensual de rendimiento`,estado:`completado`,timestamp:new Date(Date.now()-36e5*36).toISOString(),detalles:{tipo_reporte:`rendimiento`,alumnos_incluidos:120}},{id:`op-003`,tipo:`sincronizacion`,descripcion:`Respaldo de base de datos local a la nube`,estado:`fallido`,timestamp:new Date(Date.now()-36e5*30).toISOString(),detalles:{error:`Conexión interrumpida durante la transferencia`,tamano_mb:256}},{id:`op-004`,tipo:`mantenimiento`,descripcion:`Limpieza de registros huérfanos en ausencias_auditoria`,estado:`completado`,timestamp:new Date(Date.now()-36e5*24).toISOString(),detalles:{registros_eliminados:15}},{id:`op-005`,tipo:`reporte`,descripcion:`Exportación de estadísticas a Excel para dirección académica`,estado:`completado`,timestamp:new Date(Date.now()-36e5*18).toISOString(),detalles:{formato:`xlsx`,tamano_kb:450}},{id:`op-006`,tipo:`sincronizacion`,descripcion:`Sincronización de perfiles de nuevos maestros`,estado:`completado`,timestamp:new Date(Date.now()-36e5*12).toISOString(),detalles:{maestros_sincronizados:3,duracion_ms:1200}},{id:`op-007`,tipo:`mantenimiento`,descripcion:`Actualización de índices de base de datos`,estado:`en_progreso`,timestamp:new Date(Date.now()-36e5*8).toISOString(),detalles:{tablas_afectadas:5,progreso:`65%`}},{id:`op-008`,tipo:`reporte`,descripcion:`Generación de alertas tempranas de abandono`,estado:`fallido`,timestamp:new Date(Date.now()-36e5*6).toISOString(),detalles:{error:`Timeout en consulta a vw_riesgo_abandono`,duracion_ms:15e3}},{id:`op-009`,tipo:`sincronizacion`,descripcion:`Carga de planificación curricular del nuevo período`,estado:`pendiente`,timestamp:new Date(Date.now()-36e5*4).toISOString(),detalles:{periodo:`2026-02`,archivos_pendientes:8}},{id:`op-010`,tipo:`mantenimiento`,descripcion:`Compactación de almacenamiento offline (IndexedDB)`,estado:`completado`,timestamp:new Date(Date.now()-36e5*2).toISOString(),detalles:{espacio_liberado_mb:12,registros_compactados:340}},{id:`op-011`,tipo:`reporte`,descripcion:`Reporte de cumplimiento docente semanal`,estado:`completado`,timestamp:new Date(Date.now()-36e5*1).toISOString(),detalles:{tipo_reporte:`cumplimiento`,maestros_evaluados:45}}];async function Tp(){return await new Promise(e=>setTimeout(e,250)),[...Sp]}async function Ep(){return await new Promise(e=>setTimeout(e,300)),[...Cp]}async function Dp(e){await new Promise(e=>setTimeout(e,50));let t={timestamp:new Date().toISOString(),level:e.level||`INFO`,module:e.module||`Client`,message:e.message||`Sin mensaje de error especificado`,network:navigator.onLine?`Online`:`Offline`,stack:e.stack||``};return Sp.unshift(t),console.log(`Mock: System Log registrado`,t),t}async function Op(){return await new Promise(e=>setTimeout(e,200)),[...wp]}async function kp(e){return await new Promise(e=>setTimeout(e,200)),{radarData:[{id:`1`,health_status:`active`,days_inactive:2},{id:`2`,health_status:`stagnant`,days_inactive:15},{id:`3`,health_status:`stagnant`,days_inactive:20},{id:`4`,health_status:`active`,days_inactive:0},{id:`5`,health_status:`not_started`,days_inactive:30}],nodeDifficulty:[{node_name:`Posición de Mano Izquierda (Violín)`,failure_percentage:75},{node_name:`Postura de Arco (Violín)`,failure_percentage:60},{node_name:`Afinación Básica`,failure_percentage:45}],complianceData:[{nombre:`Carlos Gómez`,categoria:`negligente`,sesiones_rojo:8},{nombre:`María Luz`,categoria:`regular`,sesiones_rojo:3},{nombre:`Pedro Almonte`,categoria:`responsable`,sesiones_rojo:0}]}}var Ap=()=>x.isDemoMode?xp:mp,jp=(...e)=>Ap().getSystemLogs(...e),Mp=(...e)=>Ap().getAuditLogs(...e),Np=(...e)=>Ap().recordSystemLog(...e),Pp=(...e)=>Ap().callDslRpc(...e);function Fp({label:e,value:t,color:n=`primary`,icon:r=`bi-graph-up`}){let i=`bg-${n}`,a=`text-${n}`;return`
    <div class="card border-0 shadow-sm h-100 pm-metric-card">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="metric-icon ${i} bg-opacity-10 ${a} rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.5rem;">
            <i class="bi ${r}"></i>
          </div>
          <div>
            <div class="text-muted small fw-bold text-uppercase" style="letter-spacing: 0.5px;">${h(e)}</div>
            <div class="h3 mb-0 fw-extrabold ${a}">${t}</div>
          </div>
        </div>
      </div>
    </div>
  `}function Ip(e){let t=null,n=`ALL`,r=null,i=null;async function a(){t&&(t.innerHTML=`
      <div class="row g-3">
        <div class="col-12 col-lg-8">
          <div class="p-3 bg-light bg-opacity-25 border rounded-3 h-100">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <span class="small fw-semibold text-secondary">Filtro de Severidad:</span>
              <div class="btn-group btn-group-sm shadow-sm" role="group">
                <button class="btn btn-outline-secondary ${n===`ALL`?`active`:``}" data-log-filter="ALL">TODOS</button>
                <button class="btn btn-outline-info ${n===`INFO`?`active`:``}" data-log-filter="INFO">INFO</button>
                <button class="btn btn-outline-warning text-dark ${n===`WARNING`?`active`:``}" data-log-filter="WARNING">WARN</button>
                <button class="btn btn-outline-danger ${n===`ERROR`?`active`:``}" data-log-filter="ERROR">ERROR</button>
              </div>
            </div>

            <!-- Terminal Consola -->
            <div class="obs-terminal-container">
              <div class="obs-terminal-header">
                <div class="obs-terminal-dots">
                  <div class="obs-terminal-dot red"></div>
                  <div class="obs-terminal-dot yellow"></div>
                  <div class="obs-terminal-dot green"></div>
                </div>
                <div class="obs-terminal-title">SOI_OS v1.1.0 // PWA_TERMINAL_LOGS</div>
                <div id="live-net-status"></div>
              </div>
              <div class="obs-terminal-body" id="logs-body">
                <div class="text-center py-5 text-muted">Cargando consola técnica...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="p-3 bg-light bg-opacity-25 border rounded-3 h-100 d-flex flex-column justify-content-between">
            <div>
              <h6 class="fw-bold text-primary mb-2"><i class="bi bi-bug me-1"></i>Simulador de Eventos Técnicos</h6>
              <p class="extra-small text-muted lh-base">
                Genera de manera interactiva excepciones en caliente para evaluar el sistema de alertas tempranas, el flujo RLS de Supabase y la tolerancia offline.
              </p>
              <div class="vstack gap-2 mt-3">
                <button class="btn btn-sm btn-outline-danger text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-rls">
                  <span><i class="bi bi-shield-x me-1"></i> Falla de Permisos RLS</span>
                  <span class="badge bg-danger">ERROR</span>
                </button>
                <button class="btn btn-sm btn-outline-warning text-dark text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-timeout">
                  <span><i class="bi bi-wifi-off me-1"></i> Timeout de Petición HTTP</span>
                  <span class="badge bg-warning text-dark">WARN</span>
                </button>
                <button class="btn btn-sm btn-outline-success text-start px-3 d-flex align-items-center justify-content-between" id="btn-mock-vitals">
                  <span><i class="bi bi-activity me-1"></i> Reportar Core Web Vitals</span>
                  <span class="badge bg-success">INFO</span>
                </button>
              </div>
            </div>

            <div class="mt-4 border-top pt-3">
              <span class="small fw-semibold text-secondary d-block mb-1">Audit Trail de Conectividad</span>
              <p class="extra-small text-muted mb-0">
                La PWA encola de forma resiliente todos los logs de excepción locales en su almacenamiento cacheado cuando no detecta conexión a internet.
              </p>
            </div>
          </div>
        </div>
      </div>
    `,o(),await s(),c())}function o(){let e=t.querySelector(`#live-net-status`);e&&(e.innerHTML=navigator.onLine?`<span class="badge bg-success rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm small"><span class="spinner-grow spinner-grow-sm text-white obs-net-spinner obs-spinner-slow"></span> ONLINE</span>`:`<span class="badge bg-warning text-dark rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm small obs-pulse-offline"><span class="spinner-grow spinner-grow-sm text-dark obs-net-spinner"></span> OFFLINE</span>`)}async function s(){let e=t.querySelector(`#logs-body`);if(!e)return;let r=await jp(),i=n===`ALL`?r:r.filter(e=>e.level===n);if(i.length===0){e.innerHTML=`<div class="text-center text-muted py-5">[Consola vacía. No hay logs registrados con severidad "${n}"]</div>`;return}e.innerHTML=i.map(e=>{let t=`obs-log-level-info`;e.level===`WARNING`&&(t=`obs-log-level-warning`),e.level===`ERROR`&&(t=`obs-log-level-error`);let n=`
        <div class="obs-log-item">
          <span class="obs-log-ts">[${e.timestamp?e.timestamp.substring(11,19):new Date().toISOString().substring(11,19)}]</span>
          <span class="${t}">[${e.level}]</span>
          <span class="obs-log-module">${h(e.module)}</span>:
          <span>${h(e.message)}</span>
          <span class="obs-log-net">${e.network}</span>
      `;return e.stack&&(n+=`<pre class="obs-log-stack">${h(e.stack)}</pre>`),n+=`</div>`,n}).join(``)}function c(){t.querySelectorAll(`[data-log-filter]`).forEach(e=>{e.addEventListener(`click`,()=>{t.querySelectorAll(`[data-log-filter]`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),n=e.dataset.logFilter,s()})}),t.querySelector(`#btn-clear-logs`)?.addEventListener(`click`,()=>{localStorage.setItem(`soi_system_logs`,JSON.stringify([])),v.show(`Consola de logs de sistema limpiada con éxito`,`success`),s()}),t.querySelector(`#btn-mock-rls`)?.addEventListener(`click`,async()=>{await Np({level:`ERROR`,module:`SupabaseClient`,message:`Security policy violation for select on public.ausencias_auditoria table (RLS error).`,stack:`Error: Row Level Security block
  at executeSelect (supabaseClient.js:84:18)
  at getAuditLogs (observabilidadSupabase.js:46:12)`}),v.show(`Log de error de RLS inyectado`,`danger`),s()}),t.querySelector(`#btn-mock-timeout`)?.addEventListener(`click`,async()=>{await Np({level:`WARNING`,module:`HTTPClient`,message:`Request timed out for endpoint /rpc/get_institutional_radar. Falling back to offline fallback state.`,stack:`TimeoutException: Request took longer than 5000ms`}),v.show(`Log de timeout de red inyectado`,`warning`),s()}),t.querySelector(`#btn-mock-vitals`)?.addEventListener(`click`,async()=>{await Np({level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 11ms (Excelente), LCP: 980ms (Excelente), CLS: 0.012 (Excelente).`}),v.show(`Log de Core Web Vitals inyectado`,`success`),s()})}return{async init(){if(t=document.getElementById(e),!t){console.error(`[systemLogsWidget] Contenedor #${e} no encontrado en el DOM`);return}await a(),r=()=>{o(),v.show(`Conectividad restablecida. Sistema Online.`,`success`)},i=()=>{o(),v.show(`Conexión perdida. Trabajando en modo Offline.`,`warning`)},window.addEventListener(`online`,r),window.addEventListener(`offline`,i)},destroy(){r&&window.removeEventListener(`online`,r),i&&window.removeEventListener(`offline`,i)}}}function Lp(e){let t=null,n=``,r=`ALL`;async function i(){t&&(t.innerHTML=`
      <div class="row g-3 mb-4 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small fw-semibold text-secondary">Buscar por Actor / Notas / ID</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control shadow-sm" id="input-audit-search" placeholder="Correo, UUID, notas..." value="${h(n)}">
          </div>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold text-secondary">Acción Transaccional</label>
          <select class="form-select shadow-sm" id="select-audit-action">
            <option value="ALL" ${r===`ALL`?`selected`:``}>Todas las Acciones</option>
            <option value="APROBACION_FINAL" ${r===`APROBACION_FINAL`?`selected`:``}>Aprobación Final</option>
            <option value="CREACION" ${r===`CREACION`?`selected`:``}>Creación</option>
            <option value="RECHAZO" ${r===`RECHAZO`?`selected`:``}>Rechazo</option>
          </select>
        </div>
        <div class="col-12 col-md-3">
          <button class="btn btn-outline-primary w-100 shadow-sm" id="btn-reset-audit-filters"><i class="bi bi-arrow-counterclockwise me-1"></i>Limpiar Filtros</button>
        </div>
      </div>

      <div class="table-responsive page-glass p-0 overflow-hidden shadow-sm border rounded-3">
        <table class="table table-hover table-striped align-middle mb-0" id="table-audit-trail">
          <thead class="table-light">
            <tr>
              <th class="py-3 px-3 obs-audit-header">Fecha y Hora</th>
              <th class="py-3 obs-audit-header">Acción</th>
              <th class="py-3 obs-audit-header">Usuario Actor</th>
              <th class="py-3 obs-audit-header">Notas de Transacción</th>
              <th class="py-3 px-3 text-center obs-audit-header">Detalles</th>
            </tr>
          </thead>
          <tbody class="small" id="audit-trail-tbody">
            <tr>
              <td colspan="5" class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div id="audit-pagination-info" class="text-muted extra-small mt-2 text-end fw-semibold"></div>
    `,await a(),c())}async function a(){let e=t.querySelector(`#audit-trail-tbody`),i=t.querySelector(`#audit-pagination-info`);if(!e)return;let a=await Mp()||[];if(n.trim()!==``){let e=n.toLowerCase();a=a.filter(t=>t.actor_id&&t.actor_id.toLowerCase().includes(e)||t.usuario_id&&t.usuario_id.toLowerCase().includes(e)||t.notas&&t.notas.toLowerCase().includes(e)||t.id&&t.id.toLowerCase().includes(e))}r!==`ALL`&&(a=a.filter(e=>e.accion===r));let s=a.slice(0,50);if(s.length===0){e.innerHTML=`<tr><td colspan="5" class="text-center text-muted py-5"><i class="bi bi-info-circle me-1"></i> No se encontraron registros de auditoría.</td></tr>`,i&&(i.textContent=`Mostrando 0 registros`);return}e.innerHTML=s.map(e=>{let t=`bg-secondary`;e.accion===`APROBACION_FINAL`&&(t=`bg-success bg-opacity-10 text-success border border-success-subtle`),e.accion===`CREACION`&&(t=`bg-primary bg-opacity-10 text-primary border border-primary-subtle`),e.accion===`RECHAZO`&&(t=`bg-danger bg-opacity-10 text-danger border border-danger-subtle`);let n=e.creado_a?new Date(e.creado_a).toLocaleString(`es-ES`):`Fecha no disponible`,r=e.usuario_id||e.actor_id||`Sistema`;return`
        <tr>
          <td class="text-nowrap px-3 text-secondary">${n}</td>
          <td><span class="badge ${t} px-2.5 py-1.5 rounded-pill fw-semibold obs-audit-action-label">${e.accion}</span></td>
          <td class="fw-semibold text-break obs-audit-actor-cell" title="${r}">${r}</td>
          <td class="text-secondary">${h(e.notas||`Sin comentarios adicionales`)}</td>
          <td class="text-center px-3">
            <button class="btn btn-sm btn-outline-secondary btn-audit-detail rounded-circle shadow-sm obs-audit-detail-btn" data-audit-id="${e.id}">
              <i class="bi bi-info-circle-fill obs-audit-detail-icon"></i>
            </button>
          </td>
        </tr>
      `}).join(``),i&&(i.textContent=`Mostrando ${s.length} de ${a.length} registros (límite de 50 registros por página)`),t.querySelectorAll(`.btn-audit-detail`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.auditId,n=s.find(e=>e.id===t);n&&o(n)})})}function o(e){let t=e.detalles?Object.keys(e.detalles).map(t=>`
          <div class="col-6 mb-2">
            <span class="d-block extra-small text-muted text-uppercase fw-bold">${t}</span>
            <span class="small fw-semibold text-secondary">${h(String(e.detalles[t]))}</span>
          </div>
        `).join(``):``,n=`
      <div class="p-3">
        <div class="mb-3">
          <strong class="small text-secondary d-block">ID ÚNICO DE AUDITORÍA:</strong>
          <div class="font-monospace bg-light bg-opacity-50 p-2.5 rounded border text-break extra-small mt-1 text-primary fw-semibold">${e.id}</div>
        </div>
        <div class="row g-2 mb-3 bg-light bg-opacity-25 p-2.5 rounded border">
          <div class="col-6">
            <strong class="extra-small text-secondary d-block text-uppercase">Fecha y Hora:</strong>
            <span class="small fw-semibold">${new Date(e.creado_a).toLocaleString(`es-ES`)}</span>
          </div>
          <div class="col-6">
            <strong class="extra-small text-secondary d-block text-uppercase">Acción Transaccional:</strong>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2.5 py-1 rounded-pill mt-0.5 fw-bold obs-audit-badge">${e.accion}</span>
          </div>
        </div>
        <div class="mb-3">
          <strong class="small text-secondary d-block">USUARIO ACTOR RESPONSABLE:</strong>
          <div class="mt-1 small text-dark fw-bold text-break"><i class="bi bi-person-fill me-1 text-secondary"></i> ${e.usuario_id||e.actor_id}</div>
        </div>
        <div class="mb-3">
          <strong class="small text-secondary d-block">NOTAS / OBSERVACIÓN:</strong>
          <div class="mt-1 p-3 bg-light bg-opacity-25 rounded border text-secondary small lh-base italic">"${h(e.notas||`Sin notas registradas en esta transacción`)}"</div>
        </div>
        ${t?`
          <div class="border-top pt-3">
            <strong class="small text-secondary d-block mb-2">METADATOS EN PAYLOAD (JSON):</strong>
            <div class="row g-2 bg-light bg-opacity-10 p-2 rounded border">
              ${t}
            </div>
          </div>
        `:``}
      </div>
    `;b.open({title:`Detalles del Audit Trail de Seguridad`,body:n,hideSave:!0,cancelText:`Cerrar`})}let s=[];function c(){let e=t.querySelector(`#input-audit-search`),i=e=>{n=e.target.value,a()};e?.addEventListener(`input`,i),e&&s.push({el:e,event:`input`,fn:i});let o=t.querySelector(`#select-audit-action`),c=e=>{r=e.target.value,a()};o?.addEventListener(`change`,c),o&&s.push({el:o,event:`change`,fn:c});let l=t.querySelector(`#btn-reset-audit-filters`),u=()=>{n=``,r=`ALL`,e&&(e.value=``),o&&(o.value=`ALL`),a()};l?.addEventListener(`click`,u),l&&s.push({el:l,event:`click`,fn:u})}return{async init(){if(t=document.getElementById(e),!t){console.error(`[auditTrailWidget] Contenedor #${e} no encontrado en el DOM`);return}await i()},destroy(){s.forEach(({el:e,event:t,fn:n})=>{e.removeEventListener(t,n)}),s=[],t=null}}}var J={activeTab:localStorage.getItem(`pm_metrics_tab`)||`resumen`,stats:null,cargando:!1,container:null,activeWidgetInstances:[],_onlineListener:null,_offlineListener:null};function Rp(){J.activeWidgetInstances.forEach(e=>{if(e&&typeof e.destroy==`function`)try{e.destroy()}catch(e){console.error(`Error destroying widget:`,e)}}),J.activeWidgetInstances=[]}async function zp(e){if(e)try{Rp(),J.container=e,J.cargando=!0,Bp(e),J.stats=await lp(),J.resumenAlertas=await fp(),J.cargando=!1,Hp(e),Xp(e)}catch(t){console.error(t),Vp(e,t.message)}}function Bp(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center obs-loading-area"><div class="spinner-border text-primary" role="status"></div></div>`}function Vp(e,t){e.innerHTML=`<div class="alert alert-danger m-3"><h5>Error analítico</h5><p>${h(t)}</p></div>`}function Hp(e){e.innerHTML=`
    <div class="page-container">
      <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-cpu me-2 text-primary"></i>Analytics & Observability Hub</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <!-- Monitor de Sincronización Offline Reactivo -->
          <div id="offline-network-badge-container"></div>
          <button id="btn-guia-analisis" class="btn btn-outline-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 small fw-semibold transition-all">
            <i class="bi bi-info-circle-fill"></i>
            <span>Guía de Análisis</span>
          </button>
        </div>
      </div>

      <div class="pm-tabs-container mb-4">
        <div class="btn-group w-100 shadow-sm flex-wrap" role="group">
          <button class="btn btn-outline-primary ${J.activeTab===`resumen`?`active`:``}" data-tab="resumen"><i class="bi bi-speedometer2 me-1"></i> Resumen</button>
          <button class="btn btn-outline-primary ${J.activeTab===`operaciones`?`active`:``}" data-tab="operaciones"><i class="bi bi-gear-fill me-1"></i> Operaciones</button>
          <button class="btn btn-outline-primary ${J.activeTab===`logs`?`active`:``}" data-tab="logs"><i class="bi bi-terminal me-1"></i> Logs PWA</button>
          <button class="btn btn-outline-primary ${J.activeTab===`auditoria`?`active`:``}" data-tab="auditoria"><i class="bi bi-shield-check me-1"></i> Auditoría</button>
          <button class="btn btn-outline-primary ${J.activeTab===`ia`?`active`:``}" data-tab="ia"><i class="bi bi-robot me-1"></i> IA Intelligence</button>
        </div>
      </div>

      <div id="hub-content">
        ${Wp()}
      </div>
    </div>
  `,Up()}function Up(){let e=J.container.querySelector(`#offline-network-badge-container`);e&&(e.innerHTML=navigator.onLine?`<span class="badge bg-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-white obs-spinner-slow" role="status"></span><i class="bi bi-cloud-check me-1"></i> Online</span>`:`<span class="badge bg-warning text-dark rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-dark animate-pulse" role="status"></span><i class="bi bi-cloud-slash me-1"></i> Offline - Logs encolados</span>`)}function Wp(){switch(J.activeTab){case`resumen`:return Gp();case`operaciones`:return Kp();case`logs`:return qp();case`auditoria`:return Jp();case`ia`:return Yp();default:return Gp()}}function Gp(){let e=J.stats||{},t=J.resumenAlertas||{total:0,rojas:0};return`
    <div class="row g-3">
      <div class="col-md-6 col-lg-3">
        ${Fp({label:`Alumnos Activos`,value:e.total_alumnos||0,icon:`bi-people`,color:`primary`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${Fp({label:`Promedio Global`,value:(e.promedio_general||0).toFixed(2),icon:`bi-star`,color:`success`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${Fp({label:`Alertas Rojas`,value:t.rojas,icon:`bi-exclamation-octagon`,color:`danger`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${Fp({label:`Asistencia Hoy`,value:(e.asistencia_hoy_porcentaje||0)+`%`,icon:`bi-check2-circle`,color:`info`})}
      </div>
      
      <div class="col-12 mt-4">
        <h5 class="fw-bold mb-3"><i class="bi bi-trophy me-2 text-warning"></i>Alumnos Destacados</h5>
        <div class="page-glass p-0 overflow-hidden">
          <div id="destacados-placeholder" class="p-4 text-center text-muted">Cargando destacados...</div>
        </div>
      </div>
    </div>
  `}function Kp(){return`
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 class="fw-bold m-0"><i class="bi bi-gear-wide-connected text-primary me-2"></i>Monitoreo de Operaciones y Cumplimiento Docente</h5>
        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1.5 rounded-pill">Cruces de Rendimiento</span>
      </div>
      <div class="alert alert-info small mb-4">
        <i class="bi bi-info-circle me-1"></i> <strong>Punto Ciego Analítico:</strong> Este panel cruza la tasa de asistencia de los estudiantes con las demoras y cumplimiento de llenado de registros por parte del personal docente.
      </div>
      <div class="row g-4">
        <div class="col-12 col-xl-7">
          <div class="p-3 border rounded-3 bg-light bg-opacity-25 shadow-sm">
            <h6 class="fw-bold mb-3"><i class="bi bi-person-badge text-primary me-1"></i>Estado de Cumplimiento Docente</h6>
            <div id="cumplimiento-maestros-container">
              <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            </div>
          </div>
        </div>
        <div class="col-12 col-xl-5">
          <div class="p-3 border rounded-3 bg-light bg-opacity-25 shadow-sm">
            <h6 class="fw-bold mb-3"><i class="bi bi-graph-up-arrow text-primary me-1"></i>Velocidad de Llenado de Registros</h6>
            <div id="comportamiento-llenado-container">
              <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function qp(){return`
    <div class="page-glass p-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h5 class="fw-bold m-0"><i class="bi bi-terminal-fill text-danger me-2"></i>Consola Técnica y Monitor de Red</h5>
        <button class="btn btn-sm btn-outline-secondary" id="btn-clear-logs"><i class="bi bi-trash me-1"></i>Limpiar Consola</button>
      </div>
      <!-- Widget Modular de Logs Técnicos -->
      <div id="system-logs-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function Jp(){return`
    <div class="page-glass p-4">
      <!-- Widget Modular de Auditoría -->
      <div id="audit-trail-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function Yp(){return`
    <div class="text-center py-5">
      <i class="bi bi-robot fs-1 text-primary d-block mb-3 animate-bell"></i>
      <h5>SOI Intelligence</h5>
      <p class="text-muted">Genera un análisis narrativo del estado actual de tu grupo.</p>
      <div class="d-flex justify-content-center gap-2 flex-wrap">
        <button class="btn btn-primary px-4 rounded-pill" id="btn-run-ia">
          <i class="bi bi-magic me-1"></i> Iniciar Análisis de IA
        </button>
        <a href="#/metricas-ia-reportes" class="btn btn-outline-secondary px-4 rounded-pill">
          <i class="bi bi-file-earmark-richtext me-1"></i> Generador de Reportes Completo
        </a>
      </div>
      <div id="ia-result-area" class="mt-4 text-start obs-ia-result-box"></div>
    </div>
  `}function Xp(e){e.querySelectorAll(`[data-tab]`).forEach(t=>{t.addEventListener(`click`,()=>{Rp(),J.activeTab=t.dataset.tab,localStorage.setItem(`pm_metrics_tab`,J.activeTab),Hp(e),Xp(e),Zp()})}),e.querySelector(`#btn-guia-analisis`)?.addEventListener(`click`,()=>{em()}),J._onlineListener=Up,J._offlineListener=Up,window.addEventListener(`online`,J._onlineListener),window.addEventListener(`offline`,J._offlineListener),Zp()}async function Zp(){if(J.activeTab===`resumen`){let e=await pp(),t=J.container.querySelector(`#destacados-placeholder`);t&&(t.className=``,t.innerHTML=`
        <table class="table table-compact table-hover mb-0">
          <tbody class="small">
            ${e.slice(0,5).map(e=>`
              <tr>
                <td><i class="bi bi-award text-warning me-2"></i><strong>${h(e.nombre_completo)}</strong></td>
                <td><span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">${e.promedio}</span></td>
                <td class="text-muted">${h(e.programa)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      `)}if(J.activeTab===`operaciones`){try{let{CumplimientoMaestrosWidget:e}=await y(async()=>{let{CumplimientoMaestrosWidget:e}=await Promise.resolve().then(()=>Rm);return{CumplimientoMaestrosWidget:e}},void 0),t=new e(`cumplimiento-maestros-container`);await t.init(),J.activeWidgetInstances.push(t)}catch(e){console.error(`Error al cargar el widget de CumplimientoMaestrosWidget:`,e);let t=J.container.querySelector(`#cumplimiento-maestros-container`);t&&(t.innerHTML=`<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar el Cumplimiento de Maestros.</div>`)}try{let{analyticsFillingBehaviorWidget:e}=await y(async()=>{let{analyticsFillingBehaviorWidget:e}=await Promise.resolve().then(()=>Jm);return{analyticsFillingBehaviorWidget:e}},void 0),t=e(`comportamiento-llenado-container`);await t.init(),J.activeWidgetInstances.push(t)}catch(e){console.error(`Error al cargar el widget de Comportamiento de Llenado:`,e);let t=J.container.querySelector(`#comportamiento-llenado-container`);t&&(t.innerHTML=`<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar la Analítica de Llenado.</div>`)}}if(J.activeTab===`logs`){let e=Ip(`system-logs-container`);J.activeWidgetInstances.push(e),await e.init()}if(J.activeTab===`auditoria`){let e=Lp(`audit-trail-container`);J.activeWidgetInstances.push(e),await e.init()}J.activeTab===`ia`&&Qp()}function Qp(){J.container.querySelector(`#btn-run-ia`)?.addEventListener(`click`,async()=>{let e=J.container.querySelector(`#ia-result-area`);if(e){e.innerHTML=`<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2">Compilando datos y analizando con IA...</p></div>`;try{let t=await Pp(`global`);if(!t){e.innerHTML=`<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No hay datos disponibles para analizar.</div>`;return}let n=$p(t);e.innerHTML=`
        <div class="page-glass p-3 border-primary border-start border-4">
          <p class="small mb-2"><strong>Análisis Institucional:</strong></p>
          <p class="extra-small text-secondary">${h(n)}</p>
          <button class="btn btn-xs btn-outline-primary mt-2" id="btn-copy-report">Copiar Reporte</button>
        </div>
      `,J.container.querySelector(`#btn-copy-report`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(n),v.show(`Reporte copiado al portapapeles`,`success`)})}catch(t){console.error(`Error en análisis IA:`,t),e.innerHTML=`<div class="alert alert-danger small"><i class="bi bi-exclamation-triangle me-1"></i> Error al compilar análisis: ${h(t.message)}</div>`}}})}function $p(e){let t=[];if(e.radarData&&e.radarData.length>0){let n=(e.radarData.reduce((e,t)=>e+(t.value||0),0)/e.radarData.length).toFixed(1);t.push(`Indicadores promedio: ${n}%.`)}if(e.nodeDifficulty&&e.nodeDifficulty.length>0){let n=e.nodeDifficulty.filter(e=>e.difficulty>.7).length;n>0&&t.push(`Se detectaron ${n} nodos de alto riesgo que requieren intervención.`)}return e.complianceData&&t.push(`Estado de cumplimiento docente compilado en el período actual.`),t.length>0?t.join(` `):`Análisis completado. Consulta el Generador de Reportes para análisis más detallados.`}function em(){b.open({title:`Guía de Análisis Académico y Observabilidad`,body:`
    <div class="obs-guia-modal-body container-fluid p-0">
      <div class="row g-0 flex-column flex-md-row">
        <!-- Barra de navegación lateral -->
        <div class="col-12 col-md-4 border-end pb-3 pb-md-0 pe-md-3 mb-3 mb-md-0 obs-border-subtle">
          <div class="d-flex flex-row flex-md-column gap-1 overflow-x-auto overflow-y-hidden obs-scrollbar-none" id="guia-modal-tabs">
            <button class="obs-guia-tab-btn active text-nowrap" data-guia="resumen" type="button">
              <i class="bi bi-speedometer2"></i>
              <span>Resumen & KPIs</span>
            </button>
            <button class="obs-guia-tab-btn text-nowrap" data-guia="operaciones" type="button">
              <i class="bi bi-gear-fill"></i>
              <span>Operaciones & Docencia</span>
            </button>
            <button class="obs-guia-tab-btn text-nowrap" data-guia="logs" type="button">
              <i class="bi bi-terminal"></i>
              <span>Logs de Sistema</span>
            </button>
            <button class="obs-guia-tab-btn text-nowrap" data-guia="auditoria" type="button">
              <i class="bi bi-shield-check"></i>
              <span>Auditoría Trail</span>
            </button>
            <button class="obs-guia-tab-btn text-nowrap" data-guia="ia" type="button">
              <i class="bi bi-robot"></i>
              <span>SOI Intelligence</span>
            </button>
          </div>
        </div>

        <!-- Panel de contenidos principal -->
        <div class="col-12 col-md-8 ps-md-3">
          <div class="guia-panels-content">
            
            <!-- PANEL RESUMEN -->
            <div class="guia-panel active" id="pane-resumen">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-speedometer2"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">Métricas Macro y KPIs de Control</h6>
                  <p class="extra-small text-muted mb-0">El pulso integral del período académico en tiempo real.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold small text-primary obs-guia-card-title">Resumen General</span>
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle extra-small">KPIs</span>
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    Consolida a nivel institucional la cantidad de estudiantes inscritos, el promedio general y el porcentaje de asistencia de la fecha actual.
                  </p>
                  <div class="obs-guia-data-badge">
                    <i class="bi bi-database me-1 text-primary"></i> vw_estadisticas_periodo
                  </div>
                </div>
                
                <div class="obs-guia-panel-card">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="fw-bold small text-warning obs-guia-card-title">Alumnos Destacados</span>
                    <span class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle extra-small">Rendimiento</span>
                  </div>
                  <p class="extra-small text-secondary mb-3 lh-base">
                    Identifica automáticamente a los alumnos sobresalientes con un promedio ponderado mayor o igual a <strong>9.50</strong> para visibilizar e incentivar el mérito académico.
                  </p>
                  <div class="obs-guia-data-badge">
                    <i class="bi bi-database me-1 text-warning"></i> vw_destacados_y_riesgo_academico
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL OPERACIONES -->
            <div class="guia-panel d-none" id="pane-operaciones">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-gear-fill"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">Cumplimiento Operativo y Docencia</h6>
                  <p class="extra-small text-muted mb-0">Cruce dinámico del llenado de clases y estadísticas operativas.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card">
                  <span class="fw-bold small text-primary d-block mb-2">Detección de Puntos Ciegos</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Estudia si el ausentismo estudiantil coincide con retrasos u omisión de registros de asistencia por parte de maestros en categoría irregular o negligente.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL LOGS -->
            <div class="guia-panel d-none" id="pane-logs">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-danger bg-opacity-10 text-danger">
                  <i class="bi bi-terminal"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">Consola de Depuración del Cliente (PWA)</h6>
                  <p class="extra-small text-muted mb-0">Monitoreo de excepciones técnicas, red y tolerancia offline.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card">
                  <span class="fw-bold small text-danger d-block mb-2">Excepciones de Red y RLS</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Muestra fallas al ejecutar políticas de seguridad en la base de datos o caídas en la conexión de Internet del cliente, con logs persistidos.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL AUDITORIA -->
            <div class="guia-panel d-none" id="pane-auditoria">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-success bg-opacity-10 text-success">
                  <i class="bi bi-shield-check"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">Audit Trail - Control de Cambios</h6>
                  <p class="extra-small text-muted mb-0">Trazabilidad histórica de todas las solicitudes y aprobaciones de ausencias.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card">
                  <span class="fw-bold small text-success d-block mb-2">Inmutabilidad Histórica</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Cada vez que un maestro o administrador crea, aprueba o rechaza una ausencia, se graba un log transaccional no-modificable para prevenir el fraude.
                  </p>
                </div>
              </div>
            </div>

            <!-- PANEL IA -->
            <div class="guia-panel d-none" id="pane-ia">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="obs-guia-icon-box bg-info bg-opacity-10 text-info">
                  <i class="bi bi-robot"></i>
                </div>
                <div>
                  <h6 class="fw-bold mb-0 obs-guia-section-title">SOI Intelligence - IA de Confianza</h6>
                  <p class="extra-small text-muted mb-0">Modelos generativos (Groq) con inyección de contexto rigurosa.</p>
                </div>
              </div>
              <hr class="my-3 opacity-25">
              <div class="vstack gap-3">
                <div class="obs-guia-panel-card border-start border-3 border-info">
                  <span class="badge bg-info bg-opacity-10 text-info border border-info-subtle extra-small mb-2">Protocolo Antialucinaciones</span>
                  <p class="extra-small text-secondary mb-0 lh-base">
                    Para asegurar análisis veraces, la IA no tiene acceso general a la base de datos transaccional. En su lugar, el sistema compila paquetes de datos agregados en JSON provenientes de las vistas consolidadas según el tipo de reporte solicitado.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,size:`lg`,hideSave:!0,cancelText:`Entendido`,onShow:e=>{let t=e.querySelectorAll(`#guia-modal-tabs button`),n=e.querySelectorAll(`.guia-panel`);t.forEach(r=>{r.addEventListener(`click`,()=>{t.forEach(e=>e.classList.remove(`active`)),r.classList.add(`active`),n.forEach(e=>e.classList.add(`d-none`));let i=e.querySelector(`#pane-${r.dataset.guia}`);i&&i.classList.remove(`d-none`)})})}})}var tm=[{id:`rpt_master`,nombre:`Analítica Crítica Institucional`,descripcion:`Visión 360°: Cruce de asistencia, rendimiento y gestión docente con IA`,frecuencia:`mensual`,tipo:`global`,icon:`bi-shield-shaded`},{id:`rpt_003`,nombre:`Reporte de Alumnos en Riesgo`,descripcion:`Detección automática de bajo rendimiento y ausentismo con IA`,frecuencia:`semanal`,tipo:`riesgo`,icon:`bi-exclamation-triangle`},{id:`rpt_002`,nombre:`Boletín de Progreso General`,descripcion:`Resumen de calificaciones y evolución por programa`,frecuencia:`mensual`,tipo:`progreso`,icon:`bi-graph-up`},{id:`rpt_001`,nombre:`Análisis de Asistencia Crítica`,descripcion:`Identificación de patrones de deserción y faltas injustificadas`,frecuencia:`semanal`,tipo:`asistencia`,icon:`bi-calendar-check`}],Y={reportes:[],programada:!1,_container:null,_boundListeners:[],_timeouts:[]};async function nm(e){e&&(rm(),Y._container=e,Y.reportes=[...tm],im(e),om(e))}function rm(){Y._boundListeners.forEach(({el:e,event:t,fn:n})=>{e.removeEventListener(t,n)}),Y._boundListeners=[],Y._timeouts.forEach(e=>clearTimeout(e)),Y._timeouts=[],Y._container=null}function im(e){e.innerHTML=`
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
                <input type="time" class="form-control form-control-sm obs-time-input" value="08:00">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-check form-switch mt-4">
                <input class="form-check-input" type="checkbox" id="programacionActiva" ${Y.programada?`checked`:``}>
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
        ${Y.reportes.map(e=>am(e)).join(``)}
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
                  ${Y.reportes.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Período</label>
                <div class="d-flex gap-2">
                  <input type="date" class="form-control form-control-sm" id="genDesde" value="${gm()}">
                  <input type="date" class="form-control form-control-sm" id="genHasta" value="${hm()}">
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
  `}function am(e){let t={diaria:`danger`,semanal:`warning`,mensual:`info`}[e.frecuencia]||`secondary`;return`
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
            <span class="badge bg-${t} bg-opacity-10 text-${t} obs-freq-badge">${e.frecuencia}</span>
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
  `}function om(e){let t=e.querySelector(`#btnNuevoReporte`),n=()=>sm(e);t?.addEventListener(`click`,n),t&&Y._boundListeners.push({el:t,event:`click`,fn:n}),e.querySelectorAll(`[data-action]`).forEach(t=>{let n=()=>{let n=t.dataset.id;t.dataset.action===`generar`?lm(n):t.dataset.action===`editar`&&pm(n,e)};t.addEventListener(`click`,n),Y._boundListeners.push({el:t,event:`click`,fn:n})});let r=e.querySelector(`#btnGenerarAhora`),i=()=>mm(e);r?.addEventListener(`click`,i),r&&Y._boundListeners.push({el:r,event:`click`,fn:i});let a=e.querySelector(`#btnEnviarEmail`),o=()=>dm(e);a?.addEventListener(`click`,o),a&&Y._boundListeners.push({el:a,event:`click`,fn:o});let s=e.querySelector(`#programacionActiva`),c=e=>{Y.programada=e.target.checked,b.open({title:Y.programada?`Programación Activada`:`Programación Desactivada`,body:`<div class="alert alert-${Y.programada?`success`:`warning`} mb-0">La generación de reportes está ahora ${Y.programada?`activa`:`inactiva`}.</div>`,hideSave:!0,cancelText:`Cerrar`})};s?.addEventListener(`change`,c),s&&Y._boundListeners.push({el:s,event:`change`,fn:c})}function sm(e){b.open({title:`Nueva Plantilla de Reporte`,size:`md`,saveText:`Crear`,body:`
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
    `,onSave:()=>{let t=document.getElementById(`newReporteNombre`).value.trim();if(!t)return alert(`El nombre es obligatorio`),!1;Y.reportes.unshift({id:`rpt_`+Date.now(),nombre:t,descripcion:document.getElementById(`newReporteDesc`).value,tipo:document.getElementById(`newReporteTipo`).value,frecuencia:document.getElementById(`newReporteFreq`).value,icon:`bi-file-earmark-text`}),im(e),b.close()}})}async function cm(e){let{radarData:t,nodeDifficulty:n,complianceData:r}=await Pp(e);return{timestamp:new Date().toISOString(),resumen:{total_alumnos:t.length||10,stagnant:t.filter(e=>e.health_status===`stagnant`).length},hotspots:n.slice(0,3).map(e=>({nodo:e.node_name||`Desconocido`,tasa_fallo:e.failure_percentage||0})),docentes_criticos:r.filter(e=>e.categoria===`negligente`||e.sesiones_rojo>4).map(e=>({nombre:e.nombre_completo||e.nombre||`Docente`,atrasos:e.sesiones_rojo||0}))}}async function lm(e){let t=Y.reportes.find(t=>t.id===e);if(t){b.showLoading(`Analizando datos para: ${t.nombre}...`);try{let e=await cm(t.tipo),n=await Pe([{role:`system`,content:`
Actúas como el Auditor de Inteligencia Académica Senior de la institución. 
Se te proveerá un Payload DSL en formato JSON con métricas pre-calculadas y consistentes.
Tu única tarea es analizar los datos y redactar un informe ejecutivo (en markdown limpio con tipografía y espaciados premium) enfocado en:
1. Resumen ejecutivo de la salud escolar (3 frases).
2. Diagnóstico de los 2 hotspots pedagógicos más críticos.
3. Plan de acción recomendado (máximo 3 bullets accionables).

REGLA CRÍTICA: No inventes números, no asumas porcentajes que no estén en el JSON, y sé sumamente conciso.
`},{role:`user`,content:`
Aquí está el Payload DSL estructurado con las métricas académicas de la institución:
${JSON.stringify(e,null,2)}

Por favor, genera el diagnóstico y plan de acción de acuerdo con tus instrucciones del sistema.
`}]),r=[{nombre:`Alumnos en Estancamiento`,valor:e.resumen.stagnant,unidad:`Alumnos`},...e.hotspots.map(e=>({nombre:`Fallo Crítico: ${e.nodo}`,valor:`${e.tasa_fallo}%`,unidad:`Tasa`})),...e.docentes_criticos.map(e=>({nombre:`Atraso Docente: ${e.nombre}`,valor:e.atrasos,unidad:`Sesiones`}))];b.close(),b.open({title:`<i class="bi bi-stars text-primary me-2"></i>SOI Intelligence: ${t.nombre}`,size:`lg`,saveText:`<i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF`,body:`
        <div class="reporte-preview p-3">
          <div class="mb-4 bg-light p-3 rounded border-start border-primary border-4 shadow-sm">
            <h6 class="fw-bold mb-1"><i class="bi bi-cpu me-2 text-primary"></i>Resumen del Payload DSL Procesado</h6>
            <p class="small text-muted mb-0">Datos agregados cruzados con éxito a las ${new Date(e.timestamp).toLocaleTimeString()}.</p>
          </div>
          
          <div class="ia-content markdown-body mb-4 p-3 border rounded-3 bg-light bg-opacity-10 shadow-sm obs-ia-content">
            ${um(n)}
          </div>

          ${r.length>0?`
            <div class="mt-4">
              <h6 class="fw-bold mb-3"><i class="bi bi-table me-2 text-primary"></i>Métricas e Indicadores DSL Mapeados</h6>
              <div class="table-responsive page-glass p-0 border rounded-3 shadow-sm">
                <table class="table table-sm table-hover border-0 mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="py-2 px-3">Indicador Clave</th>
                      <th class="text-center py-2">Valor</th>
                      <th class="text-center py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="small">
                    ${r.map(e=>`
                      <tr>
                        <td class="py-2 px-3 fw-semibold">${e.nombre}</td>
                        <td class="text-center fw-bold text-danger py-2">${e.valor} <small class="text-muted fw-normal">${e.unidad}</small></td>
                        <td class="text-center py-2"><span class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2.5 py-1 rounded-pill">Revisión</span></td>
                      </tr>
                    `).join(``)}
                  </tbody>
                </table>
              </div>
            </div>
          `:``}
        </div>
      `,onSave:async()=>(fm(t.nombre,n,r),!1)})}catch(e){console.error(e),b.close(),v.error(`Error al generar el análisis de IA: `+e.message)}}}function um(e){return e.replace(/^### (.*$)/gim,`<h5 class="fw-bold mt-4 mb-2 text-dark">$1</h5>`).replace(/^## (.*$)/gim,`<h4 class="fw-bold mt-4 mb-2 border-bottom pb-1 text-dark">$1</h4>`).replace(/^# (.*$)/gim,`<h3 class="fw-bold mb-3 text-primary border-bottom pb-2">$1</h3>`).replace(/^\* (.*$)/gim,`<li class="ms-3 mb-1.5 small text-secondary">$1</li>`).replace(/\*\*(.*)\*\*/gim,`<strong class="text-dark">$1</strong>`).replace(/\n/g,`<br>`)}function dm(e){let t=e.querySelector(`#emailDest`).value.trim(),n=e.querySelector(`#emailAsunto`).value.trim();if(!t){v.error(`El campo de destinatario es obligatorio.`);return}b.showLoading(`Enviando reporte por correo electrónico...`),setTimeout(()=>{b.close(),v.success(`Reporte "${n}" enviado con éxito a: ${t}`)},1500)}async function fm(e,t,n){let{jsPDF:r}=await y(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-CBtVkUg2.js`).then(e=>e.n);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:i}=await y(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-C032RTqY.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([7,4]));v.info(`Generando documento PDF...`);let a=new r,o=a.internal.pageSize.width;a.setFillColor(41,128,185),a.rect(0,0,o,40,`F`),a.setTextColor(255,255,255),a.setFontSize(22),a.text(`SOI - Sistema Operativo Institucional`,14,20),a.setFontSize(12),a.text(e.toUpperCase(),14,30),a.text(new Date().toLocaleDateString(),o-40,30),a.setTextColor(0,0,0),a.setFontSize(14),a.setFont(void 0,`bold`),a.text(`Análisis Crítico con IA`,14,55),a.setFontSize(10),a.setFont(void 0,`normal`);let s=t.replace(/[#*]/g,``).split(`
`).filter(e=>e.trim()!==``),c=65;s.forEach(e=>{let t=a.splitTextToSize(e.trim(),o-28);c+t.length*5>280&&(a.addPage(),c=20),a.text(t,14,c),c+=t.length*5+2}),n&&n.length>0&&i(a,{startY:c+10,head:[[`Indicador / Estudiante`,`Valor`,`Unidad`]],body:n.map(e=>[e.nombre,e.valor,e.unidad]),theme:`striped`,headStyles:{fillColor:[41,128,185]},styles:{fontSize:9}});let l=a.internal.getNumberOfPages();for(let e=1;e<=l;e++)a.setPage(e),a.setFontSize(8),a.setTextColor(150),a.text(`Página ${e} de ${l} - Generado por SOI Intelligence`,o/2,290,{align:`center`});a.save(`Reporte_SOI_${e.replace(/\s+/g,`_`)}.pdf`),v.success(`PDF descargado con éxito`)}function pm(e,t){let n=Y.reportes.find(t=>t.id===e);n&&b.open({title:`Editar Reporte`,size:`md`,saveText:`Guardar`,body:`
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
    `,onSave:()=>{let n=Y.reportes.findIndex(t=>t.id===e);n!==-1&&(Y.reportes[n]={...Y.reportes[n],nombre:document.getElementById(`editReporteNombre`).value,descripcion:document.getElementById(`editReporteDesc`).value,tipo:document.getElementById(`editReporteTipo`).value,frecuencia:document.getElementById(`editReporteFreq`).value}),im(t),b.close()}})}function mm(e){let t=e.querySelector(`#generarAhoraSelect`).value;e.querySelector(`#genDesde`).value,e.querySelector(`#genHasta`).value;let n=e.querySelector(`input[name="genFormat"]:checked`).value;if(!t){alert(`Selecciona un reporte`);return}b.showLoading(`Generando reporte...`),setTimeout(()=>{b.close();let e=new Blob([`Reporte generado`],{type:`text/plain`}),r=URL.createObjectURL(e),i=document.createElement(`a`);i.href=r,i.download=`reporte-${t}-${new Date().toISOString().slice(0,10)}.${n}`,i.click(),URL.revokeObjectURL(r)},1500)}function hm(){return new Date().toISOString().slice(0,10)}function gm(){let e=new Date;return e.setDate(e.getDate()-7),e.toISOString().slice(0,10)}function _m(){S.register(`metricas`,zp),S.register(`metricas-alertas`,zp),S.register(`metricas-riesgo`,zp),S.register(`metricas-maestros`,zp),S.register(`metricas-destacados`,zp),S.register(`metricas-ia-reportes`,nm)}new class{constructor(){this.cache=new Map,this.cacheExpiry=300*1e3}getCached(e){let t=this.cache.get(e);return t&&Date.now()-t.timestamp<this.cacheExpiry?t.data:null}setCached(e,t){this.cache.set(e,{data:t,timestamp:Date.now()})}async getDashboardData(){let e=this.getCached(`dashboard`);if(e)return e;let t={periodoActivo:await lp(),alertas:await fp(),alertasActivas:await dp()};return this.setCached(`dashboard`,t),t}async getTasaAsistenciaAlumno(e,t=30){let n=new Date;return n.setDate(n.getDate()-t),up(e,n.toISOString().split(`T`)[0])}calcularPorcentaje(e,t){return e<t.rojo?`rojo`:e<t.naranja?`naranja`:e<t.amarillo?`amarillo`:`verde`}generarAlertas(e,t){let n=[];return e<t.umbral_rojo?n.push({nivel:`rojo`,mensaje:`Asistencia crítica`}):e<t.umbral_naranja?n.push({nivel:`naranja`,mensaje:`Asistencia baja`}):e<t.umbral_amarillo&&n.push({nivel:`amarillo`,mensaje:`Precaución`}),n}clearCache(){this.cache.clear()}};function vm(){S.register(`configuracion`,async e=>{let{renderConfigView:t}=await y(async()=>{let{renderConfigView:e}=await import(`./configView-CoCzNtv-.js`);return{renderConfigView:e}},__vite__mapDeps([12,13,4,1,14]));await t(e)}),S.register(`importar-datos`,async e=>{let{renderImportView:t}=await y(async()=>{let{renderImportView:e}=await import(`./importView-DaZM1Z_2.js`);return{renderImportView:e}},__vite__mapDeps([15,1]));await t(e)}),S.register(`exportar-datos`,async e=>{let{renderExportView:t}=await y(async()=>{let{renderExportView:e}=await import(`./exportView-BSO1lxRD.js`);return{renderExportView:e}},__vite__mapDeps([16,3,4,5,6,1,7,17,11,10]));await t(e)})}var ym=class{constructor(e,t={}){this.container=e,this.data=t.data||[],this.onSelect=t.onSelect||(()=>{}),this.expandedNodes=new Set,this.selectedNodeId=null,this.icons={block:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,level:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20M2 12h20M2 7h20"></path></svg>`,node:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`,indicator:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,expander:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`},this._injectStyles(),this.render(),this._bindEvents()}setData(e){this.data=e,this.render()}render(){this.container.innerHTML=`
      <div class="academic-tree">
        ${this._generateTreeHTML(this.data)}
      </div>
    `}_generateTreeHTML(e,t=0){return!e||e.length===0?``:`
      <ul class="tree-list ${t>0?`tree-sublist`:``}" style="--level: ${t}">
        ${e.map(e=>this._generateNodeHTML(e,t)).join(``)}
      </ul>
    `}_generateNodeHTML(e,t){let n=this.expandedNodes.has(e.id),r=this.selectedNodeId===e.id,i=e.children&&e.children.length>0,a=e.is_critical?`is-critical`:``,o=r?`is-selected`:``,s=e.name||e.description||`Sin nombre`;return e.type===`level`&&(s=`Nivel: ${s}`),e.type===`block`&&(s=`Bloque: ${s}`),`
      <li class="tree-node ${o} ${a}" 
          data-id="${e.id}" 
          data-type="${e.type}" 
          data-level="${t}">
        <div class="tree-node-content" style="padding-left: ${t*16+8}px">
          <span class="tree-expander ${i?``:`is-hidden`} ${n?`is-expanded`:``}">
            ${this.icons.expander}
          </span>
          <span class="tree-icon">${this.icons[e.type]||``}</span>
          <span class="tree-label">${s}</span>
          ${e.is_critical?`<span class="tree-badge-critical">FUEGO</span>`:``}
        </div>
        <div class="tree-children-container" style="display: ${n?`block`:`none`}">
          ${i?this._generateTreeHTML(e.children,t+1):``}
        </div>
      </li>
    `}_bindEvents(){this.container.addEventListener(`click`,e=>{let t=e.target.closest(`.tree-expander`),n=e.target.closest(`.tree-node-content`);if(t&&!t.classList.contains(`is-hidden`)){let n=t.closest(`.tree-node`);this._toggleExpand(n),e.stopPropagation();return}if(n){let e=n.closest(`.tree-node`);this._selectNode(e)}})}_toggleExpand(e){let t=e.dataset.id,n=e.querySelector(`.tree-expander`),r=e.querySelector(`.tree-children-container`);this.expandedNodes.has(t)?(this.expandedNodes.delete(t),n.classList.remove(`is-expanded`),r&&(r.style.display=`none`)):(this.expandedNodes.add(t),n.classList.add(`is-expanded`),r&&(r.style.display=`block`))}_selectNode(e){let t=e.dataset.id;e.dataset.type;let n=this.container.querySelector(`.tree-node.is-selected`);n&&n.classList.remove(`is-selected`),e.classList.add(`is-selected`),this.selectedNodeId=t;let r=this._findNodeById(this.data,t);this.onSelect(r)}_findNodeById(e,t){for(let n of e){if(n.id===t)return n;if(n.children){let e=this._findNodeById(n.children,t);if(e)return e}}return null}_injectStyles(){if(document.getElementById(`tree-view-styles`))return;let e=document.createElement(`style`);e.id=`tree-view-styles`,e.textContent=`
      .academic-tree {
        user-select: none;
        font-family: var(--sans, system-ui);
        color: var(--apple-ink, #1d1d1f);
        padding: 8px 0;
      }
      .tree-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .tree-node-content {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 10px;
        transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        gap: 10px;
        margin: 1px 8px;
        position: relative;
      }
      .tree-node-content:hover {
        background: var(--apple-parchment, #f5f5f7);
      }
      .tree-node.is-selected > .tree-node-content {
        background: var(--apple-primary, #0066cc);
        color: #fff;
      }
      .tree-expander {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--apple-ink-muted-48, #86868b);
        transition: transform 0.2s ease;
      }
      .tree-expander.is-expanded {
        transform: rotate(90deg);
      }
      .tree-expander.is-hidden {
        visibility: hidden;
      }
      .tree-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        color: var(--apple-primary, #0066cc);
      }
      .tree-node.is-selected .tree-icon,
      .tree-node.is-selected .tree-expander {
        color: rgba(255, 255, 255, 0.9);
      }
      .tree-node.is-critical .tree-icon {
        color: #ff3b30;
      }
      .tree-label {
        font-size: 14px;
        font-weight: 400;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tree-node.is-selected .tree-label {
        font-weight: 500;
      }
      .tree-badge-critical {
        font-size: 9px;
        font-weight: 700;
        padding: 2px 6px;
        background: #ff3b30;
        color: #fff;
        border-radius: 4px;
        margin-left: auto;
        letter-spacing: 0.05em;
      }
      .tree-children-container {
        overflow: hidden;
      }
      /* Animación suave para hover */
      .tree-node-content::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 10px;
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .tree-node-content:hover::after {
        opacity: 1;
      }
      [data-bs-theme="dark"] .tree-node-content:hover {
        background: rgba(255,255,255,0.08);
      }
      [data-bs-theme="dark"] .tree-node.is-selected > .tree-node-content {
        background: var(--apple-primary, #0066cc);
      }
    `,document.head.appendChild(e)}};async function bm(){let{data:e,error:t}=await _.from(`routes`).select(`*`).order(`name`);if(t)throw console.error(`Error fetching routes:`,t.message),Error(`No se pudieron cargar las rutas`);return e}async function xm(e){let{data:t,error:n}=await _.from(`route_versions`).select(`*`).eq(`route_id`,e).order(`version_number`,{ascending:!1});if(n)throw console.error(`Error fetching route versions:`,n.message),Error(`No se pudieron cargar las versiones de la ruta`);return t}async function Sm(e){if(!e)return[];try{let{data:t,error:n}=await _.from(`blocks`).select(`*`).eq(`route_version_id`,e).order(`order_index`);if(n)throw n;if(!t.length)return[];let r=t.map(e=>e.id),{data:i,error:a}=await _.from(`levels`).select(`*`).in(`block_id`,r).order(`order_index`);if(a)throw a;let o=i.map(e=>e.id),{data:s,error:c}=await _.from(`nodes`).select(`*`).in(`level_id`,o).order(`order_index`).limit(5e3);if(c)throw c;let l=s.map(e=>e.id),{data:u,error:d}=await _.from(`indicators`).select(`*`).in(`node_id`,l).order(`order_index`).limit(1e4);if(d)throw d;return t.map(e=>({...e,type:`block`,children:i.filter(t=>t.block_id===e.id).map(e=>({...e,type:`level`,children:s.filter(t=>t.level_id===e.id).map(e=>({...e,type:`node`,children:u.filter(t=>t.node_id===e.id).map(e=>({...e,type:`indicator`}))}))}))}))}catch(e){throw console.error(`Error building academic tree:`,e.message),Error(`Error al construir el árbol académico`)}}async function Cm(e){let{data:t,error:n}=await _.from(`node_resources`).select(`*`).eq(`node_id`,e).order(`order_index`);if(n)throw n;return t}async function wm(e){let{id:t,...n}=e;if(t){let{data:e,error:r}=await _.from(`node_resources`).update(n).eq(`id`,t).select().single();if(r)throw r;return e}else{let{data:e,error:t}=await _.from(`node_resources`).insert([n]).select().single();if(t)throw t;return e}}async function Tm(e){let{error:t}=await _.from(`node_resources`).delete().eq(`id`,e);if(t)throw t;return!0}async function Em(e,t){let{data:n,error:r}=await _.from(`nodes`).update(t).eq(`id`,e).select().single();if(r)throw r;return n}var Dm=class{constructor(e,t={}){this.container=e,this.node=null,this.resources=[],this.onUpdate=t.onUpdate||(()=>{}),this._injectStyles(),this.renderEmpty()}async setNode(e){if(!e){this.node=null,this.resources=[],this.renderEmpty();return}this.node=e,this.renderLoading();try{this.resources=await Cm(e.id),this.render()}catch(e){console.error(`Error loading resources:`,e),this.renderError(`No se pudieron cargar los recursos del nodo.`)}}renderEmpty(){this.container.innerHTML=`
      <div class="resource-editor-empty">
        <i class="bi bi-diagram-3"></i>
        <h3>Selecciona un nodo</h3>
        <p>Elige un elemento del árbol curricular para editar sus recursos y metadatos.</p>
      </div>
    `}renderLoading(){this.container.innerHTML=`
      <div class="resource-editor-loading">
        <div class="spinner-border text-primary" role="status"></div>
        <p>Cargando recursos...</p>
      </div>
    `}renderError(e){this.container.innerHTML=`
      <div class="resource-editor-error">
        <i class="bi bi-exclamation-triangle"></i>
        <p>${e}</p>
        <button class="apple-btn apple-btn-secondary" id="retry-node-btn">Reintentar</button>
      </div>
    `,this.container.querySelector(`#retry-node-btn`)?.addEventListener(`click`,()=>this.setNode(this.node))}render(){let e=this.node.type===`node`,t=this.node.type===`indicator`;this.container.innerHTML=`
      <div class="resource-editor">
        <header class="resource-header">
          <div class="header-main">
            <span class="node-badge">${this.node.type.toUpperCase()}</span>
            <h1>${this.node.name||this.node.description||`Sin título`}</h1>
          </div>
          <p class="node-id">ID: ${this.node.id}</p>
        </header>

        <section class="editor-section">
          <div class="section-header">
            <h2>Metadatos</h2>
          </div>
          <div class="apple-card">
            <div class="form-group mb-3">
              <label class="apple-label">Nombre / Descripción</label>
              <input type="text" class="apple-input" id="node-name" value="${this.node.name||this.node.description||``}">
            </div>
            ${e?`
              <div class="form-check form-switch apple-switch">
                <input class="form-check-input" type="checkbox" id="node-critical" ${this.node.is_critical?`checked`:``}>
                <label class="form-check-label" for="node-critical">Marcar como Punto Crítico (FUEGO)</label>
              </div>
            `:``}
            <div class="mt-3 text-end">
              <button class="apple-btn apple-btn-primary" id="save-node-metadata">Guardar Cambios</button>
            </div>
          </div>
        </section>

        ${e||t?`
          <section class="editor-section">
            <div class="section-header">
              <h2>Recursos Educativos</h2>
              <button class="apple-btn apple-btn-secondary btn-sm" id="add-resource-btn">
                <i class="bi bi-plus-lg"></i> Añadir Recurso
              </button>
            </div>
            <div class="resources-list" id="resources-list">
              ${this.resources.length===0?`
                <div class="empty-list-placeholder">No hay recursos asociados a este nodo.</div>
              `:this.resources.map(e=>this._renderResourceCard(e)).join(``)}
            </div>
          </section>
        `:``}
      </div>
    `,this._bindEvents()}_renderResourceCard(e){return`
      <div class="apple-card resource-card" data-id="${e.id}">
        <div class="resource-card-icon ${e.resource_type}">
          <i class="bi ${{video:`bi-play-circle-fill`,pdf:`bi-file-earmark-pdf-fill`,exercise_text:`bi-pencil-square`,link:`bi-link-45deg`}[e.resource_type]||`bi-file-earmark`}"></i>
        </div>
        <div class="resource-card-content">
          <div class="resource-card-info">
            <h3>${e.title}</h3>
            <span class="resource-type-tag">${e.resource_type}</span>
          </div>
          <p class="resource-card-url">${e.url||`Sin URL`}</p>
        </div>
        <div class="resource-card-actions">
          <button class="icon-btn edit-res" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="icon-btn delete-res" title="Eliminar"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `}_bindEvents(){this.container.querySelector(`#save-node-metadata`)?.addEventListener(`click`,async()=>{let e=this.container.querySelector(`#node-name`).value,t=this.container.querySelector(`#node-critical`)?.checked,n=this.container.querySelector(`#save-node-metadata`);n.disabled=!0,n.textContent=`Guardando...`;try{let n={name:e};this.node.type===`node`&&(n.is_critical=t),this.node.type===`indicator`&&(n.description=e),await Em(this.node.id,n),Object.assign(this.node,n),this.onUpdate(this.node),this.render()}catch(e){alert(`Error al guardar: `+e.message)}finally{n.disabled=!1,n.textContent=`Guardar Cambios`}}),this.container.querySelector(`#add-resource-btn`)?.addEventListener(`click`,()=>{this._showResourceModal()}),this.container.querySelectorAll(`.edit-res`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.resource-card`).dataset.id,n=this.resources.find(e=>e.id===t);this._showResourceModal(n)})}),this.container.querySelectorAll(`.delete-res`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`.resource-card`).dataset.id;if(confirm(`¿Estás seguro de que deseas eliminar este recurso?`))try{await Tm(t),this.resources=this.resources.filter(e=>e.id!==t),this.render()}catch(e){alert(`Error al eliminar: `+e.message)}})})}_showResourceModal(e=null){let t=!!e,n=`resourceModal`,r=document.getElementById(n);r&&r.remove(),r=document.createElement(`div`),r.id=n,r.className=`modal fade apple-modal`,r.tabIndex=-1,r.innerHTML=`
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${t?`Editar Recurso`:`Nuevo Recurso`}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="resource-form">
              <div class="form-group mb-3">
                <label class="apple-label">Tipo de Recurso</label>
                <div class="resource-type-selector">
                  ${[{id:`video`,label:`Video (YouTube/Vimeo)`,icon:`bi-play-circle`},{id:`pdf`,label:`Documento PDF`,icon:`bi-file-earmark-pdf`},{id:`exercise_text`,label:`Ejercicio (Markdown)`,icon:`bi-pencil-square`},{id:`link`,label:`Enlace Externo`,icon:`bi-link-45deg`}].map(t=>`
                    <label class="type-option ${e?.resource_type===t.id||!e&&t.id===`video`?`active`:``}">
                      <input type="radio" name="resource_type" value="${t.id}" ${e?.resource_type===t.id||!e&&t.id===`video`?`checked`:``}>
                      <i class="bi ${t.icon}"></i>
                      <span>${t.id.split(`_`)[0]}</span>
                    </label>
                  `).join(``)}
                </div>
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">Título</label>
                <input type="text" class="apple-input" name="title" value="${e?.title||``}" required placeholder="Ej: Video Introductorio">
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">URL / Link</label>
                <input type="url" class="apple-input" name="url" value="${e?.url||``}" placeholder="https://...">
              </div>
              <div class="form-group mb-3">
                <label class="apple-label">Contenido / Instrucciones</label>
                <textarea class="apple-input" name="content" rows="4" placeholder="Contenido o instrucciones para ejercicios...">${e?.content||``}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="apple-btn apple-btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="apple-btn apple-btn-primary" id="save-resource-confirm-btn">${t?`Actualizar`:`Crear Recurso`}</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(r);let i=new bootstrap.Modal(r);i.show(),r.querySelectorAll(`.type-option`).forEach(e=>{e.addEventListener(`click`,()=>{r.querySelectorAll(`.type-option`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`)})}),r.querySelector(`#save-resource-confirm-btn`).addEventListener(`click`,async()=>{let n=r.querySelector(`#resource-form`),a=new FormData(n),o={node_id:this.node.id,resource_type:a.get(`resource_type`),title:a.get(`title`),url:a.get(`url`),content:a.get(`content`),order_index:e?.order_index||this.resources.length};if(t&&(o.id=e.id),!o.title){alert(`El título es obligatorio`);return}try{let e=await wm(o);if(t){let t=this.resources.findIndex(t=>t.id===e.id);this.resources[t]=e}else this.resources.push(e);this.render(),i.hide()}catch(e){alert(`Error al guardar recurso: `+e.message)}})}_injectStyles(){if(document.getElementById(`resource-editor-styles`))return;let e=document.createElement(`style`);e.id=`resource-editor-styles`,e.textContent=`
      .resource-editor {
        padding: 32px;
        max-width: 900px;
        margin: 0 auto;
        animation: fadeIn 0.3s ease;
      }
      .resource-header {
        margin-bottom: 40px;
      }
      .header-main {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
      .node-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 4px 8px;
        background: var(--apple-primary, #0066cc);
        color: #fff;
        border-radius: 6px;
        letter-spacing: 0.05em;
      }
      .resource-header h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .node-id {
        font-size: 12px;
        color: var(--apple-ink-muted-48, #86868b);
      }
      
      .editor-section {
        margin-bottom: 48px;
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .section-header h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }

      /* Apple Cards */
      .apple-card {
        background: var(--apple-background, #fff);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      [data-bs-theme="dark"] .apple-card {
        background: #1c1c1e;
        border: 1px solid rgba(255,255,255,0.05);
      }

      /* Form Elements */
      .apple-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--apple-ink-muted-64, #515154);
        margin-bottom: 8px;
        display: block;
      }
      .apple-input {
        width: 100%;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1px solid var(--apple-parchment-dark, #d2d2d7);
        background: var(--apple-parchment-light, #fbfbfd);
        font-size: 15px;
        transition: all 0.2s ease;
      }
      .apple-input:focus {
        outline: none;
        border-color: var(--apple-primary, #0066cc);
        box-shadow: 0 0 0 4px rgba(0,102,204,0.1);
      }
      [data-bs-theme="dark"] .apple-input {
        background: #2c2c2e;
        border-color: #3a3a3c;
        color: #fff;
      }

      .apple-btn {
        padding: 8px 18px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
      }
      .apple-btn-primary {
        background: var(--apple-primary, #0066cc);
        color: #fff;
      }
      .apple-btn-primary:hover {
        background: #0077ed;
      }
      .apple-btn-secondary {
        background: var(--apple-parchment, #f5f5f7);
        color: var(--apple-primary, #0066cc);
      }
      .apple-btn-secondary:hover {
        background: #e8e8ed;
      }
      
      /* Resources List */
      .resources-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .resource-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
      }
      .resource-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      }
      .resource-card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      .resource-card-icon.video { background: #e3f2fd; color: #1976d2; }
      .resource-card-icon.pdf { background: #fbe9e7; color: #d84315; }
      .resource-card-icon.exercise_text { background: #f3e5f5; color: #7b1fa2; }
      .resource-card-icon.link { background: #e8f5e9; color: #2e7d32; }

      .resource-card-content {
        flex: 1;
        min-width: 0;
      }
      .resource-card-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
      }
      .resource-card-info h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .resource-type-tag {
        font-size: 10px;
        text-transform: uppercase;
        padding: 2px 6px;
        background: rgba(0,0,0,0.05);
        border-radius: 4px;
        color: #666;
      }
      .resource-card-url {
        font-size: 13px;
        color: var(--apple-ink-muted-48, #86868b);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .resource-card-actions {
        display: flex;
        gap: 8px;
      }
      .icon-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--apple-ink-muted-48, #86868b);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-btn:hover {
        background: rgba(0,0,0,0.05);
        color: var(--apple-ink, #1d1d1f);
      }
      .icon-btn.danger:hover {
        color: #ff3b30;
        background: #fff5f5;
      }

      /* Modal Specifics */
      .resource-type-selector {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .type-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        border-radius: 12px;
        border: 2px solid transparent;
        background: var(--apple-parchment, #f5f5f7);
        cursor: pointer;
        transition: all 0.2s;
      }
      .type-option input { display: none; }
      .type-option i { font-size: 20px; margin-bottom: 4px; }
      .type-option span { font-size: 12px; font-weight: 500; }
      .type-option.active {
        border-color: var(--apple-primary, #0066cc);
        background: #fff;
      }

      /* Placeholders */
      .resource-editor-empty, .resource-editor-loading, .resource-editor-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        padding: 40px;
        color: var(--apple-ink-muted-48, #86868b);
      }
      .resource-editor-empty i { font-size: 64px; margin-bottom: 16px; opacity: 0.2; }
      .empty-list-placeholder {
        padding: 40px;
        text-align: center;
        border: 2px dashed var(--apple-parchment-dark, #d2d2d7);
        border-radius: 18px;
        color: var(--apple-ink-muted-48, #86868b);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,document.head.appendChild(e)}};async function Om(e){km(),e.innerHTML=`
    <div class="admin-view-container">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <h1>Mapa Curricular</h1>
          <div class="version-selector-container">
            <select id="route-selector" class="apple-select mb-2">
              <option value="">Seleccionar Ruta...</option>
            </select>
            <select id="version-selector" class="apple-select" disabled>
              <option value="">Versión...</option>
            </select>
          </div>
        </div>
        <div id="tree-container" class="tree-viewport">
          <div class="tree-placeholder">
            <i class="bi bi-arrow-up-circle"></i>
            <p>Selecciona una ruta y versión para comenzar.</p>
          </div>
        </div>
      </div>
      <div class="admin-detail-panel" id="detail-container">
        <!-- NodeResourceEditor se renderiza aquí -->
      </div>
    </div>
  `;let t=e.querySelector(`#tree-container`),n=e.querySelector(`#detail-container`),r=e.querySelector(`#route-selector`),i=e.querySelector(`#version-selector`),a=new Dm(n,{onUpdate:e=>{}}),o=new ym(t,{onSelect:e=>{a.setNode(e)}});try{(await bm()).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name,r.appendChild(t)})}catch(e){console.error(`Error loading routes:`,e)}r.addEventListener(`change`,async()=>{let e=r.value;if(i.innerHTML=`<option value="">Versión...</option>`,i.disabled=!0,t.innerHTML=`<div class="tree-placeholder"><p>Cargando versiones...</p></div>`,!e){t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una ruta para comenzar.</p></div>`;return}try{(await xm(e)).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=`V${e.version_number} - ${new Date(e.created_at).toLocaleDateString()}`,i.appendChild(t)}),i.disabled=!1,t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una versión.</p></div>`}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar versiones.</p></div>`}}),i.addEventListener(`change`,async()=>{let e=i.value;if(e){t.innerHTML=`
      <div class="tree-loading">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Construyendo mapa curricular...</span>
      </div>
    `;try{let t=await Sm(e);o.setData(t)}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar el árbol curricular.</p></div>`}}})}function km(){if(document.getElementById(`academic-admin-layout-styles`))return;let e=document.createElement(`style`);e.id=`academic-admin-layout-styles`,e.textContent=`
    .admin-view-container {
      display: flex;
      height: 100vh;
      width: 100%;
      background: var(--apple-parchment-light, #fbfbfd);
      overflow: hidden;
    }

    .admin-sidebar {
      width: 350px;
      min-width: 350px;
      background: #fff;
      border-right: 1px solid rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      z-index: 10;
    }
    [data-bs-theme="dark"] .admin-sidebar {
      background: #1c1c1e;
      border-right: 1px solid rgba(255,255,255,0.08);
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .sidebar-header h1 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }

    .apple-select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--apple-parchment-dark, #d2d2d7);
      background: var(--apple-parchment, #f5f5f7);
      font-size: 14px;
      font-weight: 500;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2386868b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      cursor: pointer;
    }
    [data-bs-theme="dark"] .apple-select {
      background-color: #2c2c2e;
      border-color: #3a3a3c;
      color: #fff;
    }

    .tree-viewport {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 40px;
    }

    .admin-detail-panel {
      flex: 1;
      overflow-y: auto;
      background: var(--apple-parchment-light, #fbfbfd);
    }
    [data-bs-theme="dark"] .admin-detail-panel {
      background: #000;
    }

    .tree-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      text-align: center;
      padding: 20px;
      color: #86868b;
    }
    .tree-placeholder i { font-size: 32px; margin-bottom: 12px; opacity: 0.3; }
    .tree-placeholder p { font-size: 13px; margin: 0; }

    .tree-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 40px;
      font-size: 13px;
      color: #0066cc;
    }

    /* Ocultar scrollbar pero mantener scroll */
    .tree-viewport::-webkit-scrollbar { width: 6px; }
    .tree-viewport::-webkit-scrollbar-track { background: transparent; }
    .tree-viewport::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
    [data-bs-theme="dark"] .tree-viewport::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
  `,document.head.appendChild(e)}function Am(e=[]){return!e||e.length===0?`
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
                    ${e.map(e=>jm(e)).join(``)}
                </tbody>
            </table>
        </div>
    `}function jm(e){let t=e.progress_percentage||0,n=t<40?`progress-low`:t<80?`progress-mid`:`progress-high`,r=e.health_status||`not_started`,i=e.last_activity_at?new Date(e.last_activity_at).toLocaleDateString():`Sin actividad`;return`
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
    `}function Mm(e=[]){return!e||e.length===0?`
            <div class="pm-empty">
                <i class="bi bi-fire"></i>
                <p>No se han detectado puntos críticos pedagógicos.</p>
            </div>
        `:`
        <div class="aa-hotspots-grid pm-animate-fade-in">
            ${e.map(e=>Nm(e)).join(``)}
        </div>
    `}function Nm(e){let t=e.failure_percentage||0;return`
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
    `}async function Pm(){return`
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
                    ${Am([])}
                </div>
            </section>

            <!-- Sección 2: Hotspots Pedagógicos (Dificultad por Nodo) -->
            <section class="mt-5">
                <h2 class="aa-hotspot-name fs-4 mb-4">Puntos de Calor Pedagógicos</h2>
                <div id="hotspots-container">
                    ${Mm([])}
                </div>
            </section>
        </div>
    `}function Fm(){S.register(`gestion-curricular`,e=>{Om(e)}),S.register(`planificacion-curricular`,e=>{Om(e)}),S.register(`torre-de-control`,async e=>{e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{e.innerHTML=await Pm()}catch(t){e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el dashboard: ${t.message}</p></div>`}})}async function Im(){try{let{data:e,error:t}=await _.from(`maestro_desempeño`).select(`
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
        `).order(`updated_at`,{ascending:!1});if(t)throw console.error(`[getMaestrosComplianceStatus] Error:`,t),t;return e||[]}catch(e){throw console.error(`[getMaestrosComplianceStatus] Exception:`,e),e}}async function Lm(e){try{let{data:t,error:n}=await _.from(`registros_pendientes`).select(`
        id,
        created_at,
        notification_state,
        notif_count,
        last_notified_at,
        clases(nombre),
        sesiones_clase(fecha, hora_inicio)
        `).eq(`maestro_id`,e).eq(`estado`,`pendiente`).in(`tipo`,[`asistencia_pendiente`,`contenido_pendiente`]).order(`created_at`,{ascending:!1});if(n)throw console.error(`[getMaestroPendingRegistros] Error:`,n),n;return t||[]}catch(e){throw console.error(`[getMaestroPendingRegistros] Exception:`,e),e}}var Rm=e({CumplimientoMaestrosWidget:()=>zm,default:()=>zm}),zm=class{constructor(e){this.containerId=e,this.container=document.getElementById(e),this.maestros=[],this.filteredMaestros=[],this.currentFilter={categoria:null,estado:null,diasAtrasoMin:0,diasAtrasoMax:999}}async init(){try{this.container.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando cumplimiento de maestros...</div>
        </div>
      `,await this.loadData(),this.render(),this.attachEventListeners(),console.log(`[CumplimientoMaestrosWidget] Initialized with`,this.maestros.length,`maestros`)}catch(e){console.error(`[CumplimientoMaestrosWidget] Init error:`,e),this.container.innerHTML=`
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando datos: ${e.message}</div>
        </div>
      `}}async loadData(){let e=await Im();this.maestros=await Promise.all(e.map(async e=>{let t=await this.getPendingCount(e.maestro_id),n=await this.getOldestDiasAtraso(e.maestro_id);return{...e,pendingCount:t,oldestDiasAtraso:n,statusColor:this.getStatusColor(e.categoria),categoryLabel:this.getCategoryLabel(e.categoria)}})),this.filteredMaestros=[...this.maestros]}async getPendingCount(e){try{return(await Lm(e)).length}catch{return 0}}async getOldestDiasAtraso(e){try{let t=await Lm(e);return t.length===0?0:t.reduce((e,t)=>{let n=new Date(t.created_at).getTime(),r=Math.ceil((Date.now()-n)/(1e3*60*60*24));return Math.max(e,r)},0)}catch{return 0}}getStatusColor(e){return{responsable:`#10b981`,regular:`#f59e0b`,incumplidor:`#f97316`,negligente:`#dc2626`}[e]||`#9ca3af`}getCategoryLabel(e){return{responsable:`Responsable ✓`,regular:`Regular`,incumplidor:`Incumplidor`,negligente:`Negligente ⚠️`}[e]||e}applyFilter(e){this.currentFilter={...this.currentFilter,...e},this.filteredMaestros=this.maestros.filter(e=>!(this.currentFilter.categoria&&e.categoria!==this.currentFilter.categoria||this.currentFilter.diasAtrasoMin&&e.oldestDiasAtraso<this.currentFilter.diasAtrasoMin||this.currentFilter.diasAtrasoMax&&e.oldestDiasAtraso>this.currentFilter.diasAtrasoMax)),this.render()}render(){let e=`
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
          <button id="btnGotoNotificaciones" class="btn-premium-action btn-premium-primary ms-2" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: none; color: white;">
            <i class="bi bi-bell-fill animate-bell"></i> Centro de Actividad
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
    `}attachEventListeners(){let e=document.getElementById(`filterCategoria`),t=document.getElementById(`filterDiasAtraso`),n=document.getElementById(`btnRefresh`);this._filterCategoriaHandler=e=>{this.applyFilter({categoria:e.target.value||null})},this._filterDiasAtrasoHandler=e=>{if(!e.target.value)this.applyFilter({diasAtrasoMin:0,diasAtrasoMax:999});else{let t=e.target.value.split(`-`);this.applyFilter({diasAtrasoMin:t[0]?parseInt(t[0]):0,diasAtrasoMax:t[1]?parseInt(t[1]):999})}},this._btnRefreshHandler=()=>{this.init()},e?.addEventListener(`change`,this._filterCategoriaHandler),t?.addEventListener(`change`,this._filterDiasAtrasoHandler),n?.addEventListener(`click`,this._btnRefreshHandler);let r=document.getElementById(`btnGotoNotificaciones`);this._btnGotoNotificacionesHandler=()=>{y(async()=>{let{router:e}=await import(`./router-C2kyANVn.js`).then(e=>e.n);return{router:e}},__vite__mapDeps([18,4,19,20])).then(({router:e})=>{e.navigate(`admin-notificaciones`)})},r?.addEventListener(`click`,this._btnGotoNotificacionesHandler),this._contactarHandlers=[],this._detalleHandlers=[],this.container.querySelectorAll(`.btn-contactar`).forEach(e=>{let t=e=>{let t=e.target.closest(`.btn-contactar`).dataset.maestroId;this.onContactarMaestro(t)};this._contactarHandlers.push({btn:e,handler:t}),e.addEventListener(`click`,t)}),this.container.querySelectorAll(`.btn-detalle`).forEach(e=>{let t=e=>{let t=e.target.closest(`.btn-detalle`).dataset.maestroId;this.onDetalleMaestro(t)};this._detalleHandlers.push({btn:e,handler:t}),e.addEventListener(`click`,t)})}destroy(){let e=document.getElementById(`filterCategoria`),t=document.getElementById(`filterDiasAtraso`),n=document.getElementById(`btnRefresh`),r=document.getElementById(`btnGotoNotificaciones`);e&&this._filterCategoriaHandler&&e.removeEventListener(`change`,this._filterCategoriaHandler),t&&this._filterDiasAtrasoHandler&&t.removeEventListener(`change`,this._filterDiasAtrasoHandler),n&&this._btnRefreshHandler&&n.removeEventListener(`click`,this._btnRefreshHandler),r&&this._btnGotoNotificacionesHandler&&r.removeEventListener(`click`,this._btnGotoNotificacionesHandler),this._contactarHandlers&&=(this._contactarHandlers.forEach(({btn:e,handler:t})=>{e.removeEventListener(`click`,t)}),[]),this._detalleHandlers&&=(this._detalleHandlers.forEach(({btn:e,handler:t})=>{e.removeEventListener(`click`,t)}),[]),this.maestros=[],this.filteredMaestros=[],this.container=null}onContactarMaestro(e){let t=this.maestros.find(t=>t.maestro_id===e);if(!t)return;let n=t.maestros?.email;n?window.location.href=`mailto:${n}?subject=Seguimiento%20Registros%20Asistencias`:alert(`No hay email disponible para este maestro`)}onDetalleMaestro(e){this.maestros.find(t=>t.maestro_id===e)&&(window.location.href=`/admin/maestros/${e}/detail`)}};async function Bm(){try{let{data:e,error:t}=await _.from(`teacher_class_fill_metrics_aggregated`).select(`*`).order(`maestro_nombre`,{ascending:!0});if(t)throw t;return e||[]}catch(e){throw console.error(`[getTeacherFillingMetrics] Error:`,e),e}}function Vm(e){let t={};e.forEach(e=>{t[e.fecha]||(t[e.fecha]={total_classes:0,asistencia_first:0,ai_usage_sum:0,observaciones_first:0}),t[e.fecha].total_classes++,e.orden_asistencia_primero===1&&t[e.fecha].asistencia_first++,t[e.fecha].ai_usage_sum+=e.uso_ai_fill_percent||0,e.orden_observaciones_primero===1&&t[e.fecha].observaciones_first++});let n={};return Object.entries(t).forEach(([e,t])=>{n[e]={total_classes:t.total_classes,asistencia_first_percent:(t.asistencia_first/t.total_classes*100).toFixed(1),avg_ai_usage_percent:(t.ai_usage_sum/t.total_classes).toFixed(1),observaciones_first_percent:(t.observaciones_first/t.total_classes*100).toFixed(1)}}),n}function Hm(e){let t={};e.forEach(e=>{t[e.maestro_id]||(t[e.maestro_id]={maestro_nombre:e.maestro_nombre,total_classes:0,asistencia_first:0,ai_usage_sum:0,avg_duration:0,duration_count:0}),t[e.maestro_id].total_classes++,e.orden_asistencia_primero===1&&t[e.maestro_id].asistencia_first++,t[e.maestro_id].ai_usage_sum+=e.uso_ai_fill_percent||0,e.promedio_duracion_observaciones&&(t[e.maestro_id].avg_duration+=e.promedio_duracion_observaciones,t[e.maestro_id].duration_count++)});let n={};return Object.entries(t).forEach(([e,t])=>{n[e]={maestro_nombre:t.maestro_nombre,total_classes:t.total_classes,asistencia_first_percent:(t.asistencia_first/t.total_classes*100).toFixed(1),avg_ai_usage_percent:(t.ai_usage_sum/t.total_classes).toFixed(1),avg_observation_duration:t.duration_count>0?(t.avg_duration/t.duration_count).toFixed(1):0}}),n}async function Um(){try{let{data:e,error:t}=await _.from(`maestro_desempeño`).select(`
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
        `).order(`updated_at`,{ascending:!1});if(t)throw t;let n=(e||[]).reduce((e,t)=>(e[t.categoria]=(e[t.categoria]||0)+1,e),{}),r=(e||[]).reduce((e,t)=>(e[t.tendencia]=(e[t.tendencia]||0)+1,e),{}),i=(e||[]).reduce((e,t)=>e+t.total_sesiones,0),a=(e||[]).reduce((e,t)=>e+t.sesiones_verde,0),o=i>0?(a/i*100).toFixed(2):0;return{totalMaestros:e?.length||0,byCategory:n,byTrend:r,overallComplianceRate:o,totalSessions:i,completedSessions:a,data:e||[],generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getInstitutionComplianceSummary] Error:`,e),e}}async function Wm(){try{let{data:e,error:t}=await _.from(`registros_pendientes`).select(`
        id,
        maestro_id,
        notification_state,
        created_at,
        notif_count,
        maestros(nombre_completo)
        `).in(`notification_state`,[`NARANJA`,`ROJO`]).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!1});if(t)throw t;let n=(e||[]).reduce((e,t)=>(e[t.maestro_id]||(e[t.maestro_id]={maestroId:t.maestro_id,nombre:t.maestros?.nombre_completo,email:t.maestros?.email,naranja:[],rojo:[]}),t.notification_state===`NARANJA`?e[t.maestro_id].naranja.push(t):e[t.maestro_id].rojo.push(t),e),{}),r=Object.values(n).map(e=>{let t=[...e.naranja,...e.rojo],n=Math.max(...t.map(e=>new Date(e.created_at).getTime())),r=Math.ceil((Date.now()-n)/(1e3*60*60*24));return{...e,diasAtraso:r,naranjaCount:e.naranja.length,rojoCount:e.rojo.length,totalCount:t.length,urgency:e.rojo.length>0?`CRITICA`:`ALTA`}});return{totalCritical:r.length,byUrgency:{critica:r.filter(e=>e.urgency===`CRITICA`).length,alta:r.filter(e=>e.urgency===`ALTA`).length},maestros:r.sort((e,t)=>t.diasAtraso-e.diasAtraso),generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getCriticalMaestrosReport] Error:`,e),e}}async function Gm(e=`csv`){try{let t=await Um();if(e===`csv`){let e=`REPORTE DE CUMPLIMIENTO DE MAESTROS
`;return e+=`Generado: ${new Date().toLocaleString()}\n\n`,e+=`RESUMEN GENERAL
`,e+=`Total de Maestros,${t.totalMaestros}\n`,e+=`Tasa de Cumplimiento,${t.overallComplianceRate}%\n`,e+=`Sesiones Completadas,${t.completedSessions}/${t.totalSessions}\n\n`,e+=`POR CATEGORÍA
`,e+=`Categoría,Cantidad
`,Object.entries(t.byCategory).forEach(([t,n])=>{e+=`${t},${n}\n`}),e+=`
POR TENDENCIA
`,e+=`Tendencia,Cantidad
`,Object.entries(t.byTrend).forEach(([t,n])=>{e+=`${t},${n}\n`}),e}return t}catch(e){throw console.error(`[exportComplianceReport] Error:`,e),e}}async function Km(e=30){try{let t=new Date(Date.now()-e*24*60*60*1e3).toISOString().split(`T`)[0],n=(await Bm()).filter(e=>e.fecha>=t),r=Vm(n),i=Hm(n);return{daysBack:e,total_classes:n.length,total_maestros:Object.keys(i).length,date_trends:r,maestro_trends:i,institution_summary:{avg_ai_usage_institution:n.length>0?(n.reduce((e,t)=>e+(t.uso_ai_fill_percent||0),0)/n.length).toFixed(1):0,asistencia_first_percent:n.length>0?(n.filter(e=>e.orden_asistencia_primero===1).length/n.length*100).toFixed(1):0,observaciones_first_percent:n.length>0?(n.filter(e=>e.orden_observaciones_primero===1).length/n.length*100).toFixed(1):0},generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getInstitutionTrendReportWithFilling] Error:`,e),e}}var qm=class{constructor(e){this.containerId=e,this.container=document.getElementById(e),this.summary=null,this.critical=null}async init(){try{this.container.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando reportes institucionales...</div>
        </div>
      `,await this.loadData(),this.render(),this.attachEventListeners(),console.log(`[DirectorReportingPanel] Initialized`)}catch(e){console.error(`[DirectorReportingPanel] Init error:`,e),this.container.innerHTML=`
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando reportes: ${e.message}</div>
        </div>
      `}}async loadData(){this.summary=await Um(),this.critical=await Wm()}render(){let e=`
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
    `}attachEventListeners(){let e=document.getElementById(`btnExportCSV`),t=document.getElementById(`btnRefresh`);e?.addEventListener(`click`,()=>this.exportReport()),t?.addEventListener(`click`,()=>this.init())}async exportReport(){try{let e=await Gm(`csv`),t=new Blob([e],{type:`text/csv`}),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`reporte-cumplimiento-${new Date().toISOString().split(`T`)[0]}.csv`,r.click(),window.URL.revokeObjectURL(n),console.log(`[DirectorReportingPanel] CSV exported`)}catch(e){console.error(`[DirectorReportingPanel] Export error:`,e),alert(`Error al descargar reporte: `+e.message)}}},Jm=e({analyticsFillingBehaviorWidget:()=>Ym});function Ym(e){let t=document.getElementById(e);function n(e){return`
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
      `;try{let e=await Bm();if(!e||e.length===0){t.innerHTML=`
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
      `},destroy(){t&&(t.innerHTML=``)}}}function Xm(e){let t=document.getElementById(e),n=null;function r(e){return`
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
      `;try{n=await Km(30),this.render()}catch(e){console.error(`[directorTrendReportView] Error:`,e),t.innerHTML=`
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
      `}}}function Zm(){S.register(`admin-dashboard`,e=>{try{e.innerHTML=`<div id="admin-dashboard-container"></div>`,new zm(`admin-dashboard-container`).init()}catch(t){console.error(`[admin-dashboard] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar cumplimiento: ${t.message}</p></div>`}}),S.register(`admin-dashboard-reportes`,e=>{try{e.innerHTML=`<div id="director-reporting-container"></div>`,new qm(`director-reporting-container`).init()}catch(t){console.error(`[admin-dashboard-reportes] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar reportes: ${t.message}</p></div>`}}),S.register(`admin-dashboard-analitca-llenado`,e=>{try{e.innerHTML=`<div id="analytics-filling-container"></div>`,Ym(`analytics-filling-container`).init()}catch(t){console.error(`[admin-dashboard-analitca-llenado] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar analítica: ${t.message}</p></div>`}}),S.register(`admin-dashboard-tendencias`,e=>{try{e.innerHTML=`<div id="trend-report-container"></div>`,Xm(`trend-report-container`).init()}catch(t){console.error(`[admin-dashboard-tendencias] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar tendencias: ${t.message}</p></div>`}})}var Qm=[{id:`perm-001`,maestro_id:`maestro_001`,maestro_nombre:`Carlos Méndez`,maestro_email:`carlos.mendez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`planificacion:write`,`asistencias:write`],solicitudes:[],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-01-15T10:00:00Z`,actualizado_en:`2026-05-01T14:30:00Z`},{id:`perm-002`,maestro_id:`maestro_002`,maestro_nombre:`María López`,maestro_email:`maria.lopez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!1,permisos:[`alumnos:create`,`planificacion:write`],solicitudes:[`clases:enroll`],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-02-20T09:00:00Z`,actualizado_en:`2026-04-10T11:00:00Z`},{id:`perm-003`,maestro_id:`maestro_003`,maestro_nombre:`Ana Martínez`,maestro_email:`ana.martinez@ejemplo.com`,puede_registrar_alumnos:!1,puede_inscribir_clases:!1,permisos:[],solicitudes:[`alumnos:create`],concedido_por:null,concedido_por_nombre:null,creado_en:`2026-03-01T08:00:00Z`,actualizado_en:`2026-03-01T08:00:00Z`},{id:`perm-004`,maestro_id:`maestro_004`,maestro_nombre:`Pedro Ramírez`,maestro_email:`pedro.ramirez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`asistencias:write`],solicitudes:[],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-01-20T15:00:00Z`,actualizado_en:`2026-05-05T09:00:00Z`},{id:`perm-005`,maestro_id:`maestro_005`,maestro_nombre:`Laura Fernández`,maestro_email:`laura.fernandez@ejemplo.com`,puede_registrar_alumnos:!1,puede_inscribir_clases:!0,permisos:[`clases:enroll`],solicitudes:[`alumnos:create`],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-04-01T12:00:00Z`,actualizado_en:`2026-04-15T16:00:00Z`}],$m=e({actualizarPermiso:()=>ah,obtenerPermisoPorMaestro:()=>ih,obtenerPermisos:()=>rh}),eh=(e=300)=>new Promise(t=>setTimeout(t,e)),th=[...Qm];function nh(e){return e?{id:e.id,maestro_id:e.maestro_id??``,maestro_nombre:e.maestro_nombre??``,maestro_email:e.maestro_email??``,puede_registrar_alumnos:e.puede_registrar_alumnos??!1,puede_inscribir_clases:e.puede_inscribir_clases??!1,permisos:Array.isArray(e.permisos)?e.permisos:[],solicitudes:Array.isArray(e.solicitudes)?e.solicitudes:[],concedido_por:e.concedido_por??null,concedido_por_nombre:e.concedido_por_nombre??null,creado_en:e.creado_en||null,actualizado_en:e.actualizado_en||null}:null}async function rh(){return await eh(),th.map(nh)}async function ih(e){await eh();let t=th.find(t=>t.maestro_id===e);return t?nh(t):{id:null,maestro_id:e,maestro_nombre:``,maestro_email:``,puede_registrar_alumnos:!1,puede_inscribir_clases:!1,permisos:[],solicitudes:[],concedido_por:null,concedido_por_nombre:null,creado_en:null,actualizado_en:null}}async function ah(e,t){await eh();let n=th.findIndex(t=>t.maestro_id===e),r=new Date().toISOString();if(n===-1){let n={id:Math.random().toString(36).substr(2,9),maestro_id:e,maestro_nombre:t.maestro_nombre||``,maestro_email:t.maestro_email||``,puede_registrar_alumnos:t.puede_registrar_alumnos??!1,puede_inscribir_clases:t.puede_inscribir_clases??!1,permisos:Array.isArray(t.permisos)?t.permisos:[],solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:[],concedido_por:t.concedido_por||null,concedido_por_nombre:t.concedido_por_nombre||null,creado_en:r,actualizado_en:r};return th.push(n),nh(n)}return th[n]={...th[n],puede_registrar_alumnos:t.puede_registrar_alumnos??th[n].puede_registrar_alumnos,puede_inscribir_clases:t.puede_inscribir_clases??th[n].puede_inscribir_clases,permisos:Array.isArray(t.permisos)?t.permisos:th[n].permisos,solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:th[n].solicitudes,concedido_por:t.concedido_por??th[n].concedido_por,concedido_por_nombre:t.concedido_por_nombre??th[n].concedido_por_nombre,actualizado_en:r},nh(th[n])}var oh=()=>x.isDemoMode?$m:Ne,sh=(...e)=>oh().obtenerPermisos(...e),ch=(...e)=>oh().actualizarPermiso(...e),lh={permisos:[],cargando:!1,togglingId:null,togglingField:null};function uh(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function dh(e){try{lh.cargando=!0,fh(e),lh.permisos=await sh(),lh.cargando=!1,mh(e),vh(e)}catch(t){console.error(t),ph(e,t.message)}}function fh(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando permisos...</p>
      </div>
    </div>
  `}function ph(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${uh(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>dh(e))}function mh(e){let t=w.getUser?w.getUser():null;t?.nombre_completo||t?.email,e.innerHTML=`
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-shield-lock me-2 text-primary"></i>Permisos de Maestros</span>
          <span class="badge bg-secondary">${lh.permisos.length}</span>
        </div>
      </div>

      ${lh.permisos.length?`
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
            ${hh()}
          </tbody>
        </table>
      </div>
      `:gh()}

      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle"></i>
        Los cambios se guardan automáticamente al alternar un permiso.
        ${x.isDemoMode?`<span class="badge bg-warning text-dark ms-1">Demo</span>`:``}
      </div>
    </div>
  `}function hh(){return lh.permisos.map(e=>{let t=lh.togglingId===e.maestro_id,n=e.concedido_por_nombre||e.concedido_por||`-`,r=e.actualizado_en?new Date(e.actualizado_en).toLocaleDateString(`es-ES`,{day:`numeric`,month:`short`}):`-`,i=e.solicitudes||[],a=!e.puede_registrar_alumnos&&i.includes(`alumnos:create`),o=!e.puede_inscribir_clases&&i.includes(`clases:enroll`);return`
      <tr data-maestro-id="${uh(e.maestro_id)}">
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-compact bg-primary text-white">${_h(e.maestro_nombre||e.maestro_id)}</div>
            <span class="text-truncate" style="max-width: 150px;" title="${uh(e.maestro_nombre)}">${uh(e.maestro_nombre||`Sin nombre`)}</span>
          </div>
        </td>
        <td class="text-truncate" style="max-width: 150px;" title="${uh(e.maestro_email)}">${uh(e.maestro_email||`-`)}</td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${uh(e.maestro_id)}"
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
                data-maestro-id="${uh(e.maestro_id)}" 
                data-permiso="alumnos:create" 
                data-field="puede_registrar_alumnos" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          `:``}
        </td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${uh(e.maestro_id)}"
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
                data-maestro-id="${uh(e.maestro_id)}" 
                data-permiso="clases:enroll" 
                data-field="puede_inscribir_clases" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          `:``}
        </td>
        <td class="small text-muted">${uh(n)}</td>
        <td class="small text-muted">${r}</td>
      </tr>
    `}).join(``)}function gh(){return`
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-shield-exclamation" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay permisos configurados</h4>
      <p class="text-muted">Los permisos aparecerán aquí cuando los administradores los configuren.</p>
    </div>
  `}function _h(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}function vh(e){let t=e.querySelector(`#permisosTable`);t&&(t.addEventListener(`change`,async t=>{let n=t.target.closest(`.permiso-toggle`);if(!n)return;let r=n.dataset.maestroId,i=n.dataset.field,a=n.checked;n.disabled=!0,lh.togglingId=r,lh.togglingField=i;let o=n.closest(`.form-check`)?.querySelector(`span`);o&&(o.textContent=a?`Sí`:`No`,o.className=`small ${a?`text-success`:`text-muted`}`);try{let t=lh.permisos.find(e=>e.maestro_id===r),n={[i]:a};if(t){if(a){let e=i===`puede_registrar_alumnos`?`alumnos:create`:`clases:enroll`,r=t.permisos||[];r.includes(e)||r.push(e);let a=(t.solicitudes||[]).filter(t=>t!==e),o=w.getUser?w.getUser():null,s=o?.nombre_completo||o?.email||`Administrador`;n={...n,permisos:r,solicitudes:a,concedido_por:o?.id||`admin`,concedido_por_nombre:s},t.permisos=r,t.solicitudes=a,t.concedido_por=o?.id||`admin`,t.concedido_por_nombre=s}else{let e=i===`puede_registrar_alumnos`?`alumnos:create`:`clases:enroll`,r=(t.permisos||[]).filter(t=>t!==e);n={...n,permisos:r},t.permisos=r}t.actualizado_en=new Date().toISOString()}await ch(r,n),t&&(t[i]=a),v.success(`Permiso actualizado: ${i===`puede_registrar_alumnos`?`Registrar Alumnos`:`Inscribir Clases`}`);let o=e.querySelector(`#permisosTBody`);o&&(o.innerHTML=hh())}catch(e){n.checked=!a,o&&(o.textContent=a?`No`:`Sí`,o.className=`small ${a?`text-muted`:`text-success`}`),v.error(`Error al actualizar permiso: `+e.message)}finally{n.disabled=!1,lh.togglingId=null,lh.togglingField=null}}),t.addEventListener(`click`,async t=>{let n=t.target.closest(`.aprobar-btn`);if(!n)return;let r=n.dataset.maestroId,i=n.dataset.permiso,a=n.dataset.field;n.disabled=!0;let o=n.innerHTML;n.innerHTML=`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;try{let t=lh.permisos.find(e=>e.maestro_id===r);if(!t)throw Error(`No se encontró el registro de permisos del maestro`);let n=t.permisos||[];n.includes(i)||n.push(i);let o=(t.solicitudes||[]).filter(e=>e!==i),s=w.getUser?w.getUser():null,c=s?.nombre_completo||s?.email||`Administrador`;await ch(r,{permisos:n,solicitudes:o,concedido_por:s?.id||`admin`,concedido_por_nombre:c,[a]:!0}),t.permisos=n,t.solicitudes=o,t.concedido_por=s?.id||`admin`,t.concedido_por_nombre=c,t[a]=!0,t.actualizado_en=new Date().toISOString(),v.success(`Solicitud aprobada: ${a===`puede_registrar_alumnos`?`Registrar Alumnos`:`Inscribir Clases`}`);let l=e.querySelector(`#permisosTBody`);l&&(l.innerHTML=hh())}catch(e){v.error(`Error al aprobar solicitud: `+e.message),n.disabled=!1,n.innerHTML=o}}))}function yh(){S.register(`permisos`,dh)}async function bh(e){if(e){e.innerHTML=Ch();try{let[t,n]=await Promise.all([xh(),Sh()]);e.innerHTML=wh(t,n),Dh(e)}catch(t){console.error(`[DashboardPedagogico]`,t),e.innerHTML=`
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar el dashboard: ${t.message}</div>
      </div>`}}}async function xh(){let[e,t,n,r]=await Promise.all([_.from(`alumnos`).select(`id`,{count:`exact`}).eq(`activo`,!0),_.from(`planificaciones`).select(`id, estado`).gte(`fecha_inicio`,new Date(Date.now()-10080*60*1e3).toISOString().split(`T`)[0]),_.from(`clases`).select(`id`,{count:`exact`}).eq(`estado`,`activa`),_.from(`asistencias`).select(`estado`).gte(`fecha`,new Date(Date.now()-10080*60*1e3).toISOString().split(`T`)[0])]),i=r.data?.length||0,a=r.data?.filter(e=>e.estado===`P`).length||0,o=i>0?Math.round(a/i*100):null,s=t.data?.filter(e=>e.estado===`ejecutado`).length||0,c=t.data?.filter(e=>e.estado===`planificado`).length||0;return{alumnosActivos:e.count||0,clasesActivas:n.count||0,planesEstaSemana:t.data?.length||0,planesEjecutados:s,planesPlanificados:c,tasaAsistencia:o}}async function Sh(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],{data:t}=await _.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e);if(!t?.length)return[];let n={};t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]={total:0,presentes:0}),n[e.alumno_id].total++,e.estado===`P`&&n[e.alumno_id].presentes++});let r=Object.entries(n).filter(([,e])=>e.total>=4&&e.presentes/e.total<jd.attendance_min_rate).map(([e])=>e);if(!r.length)return[];let{data:i}=await _.from(`alumnos`).select(`id, nombre_completo`).in(`id`,r.slice(0,5));return i||[]}function Ch(){return`
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
    </div>`}function wh(e,t){let n=e.tasaAsistencia===null?`secondary`:e.tasaAsistencia>=80?`success`:e.tasaAsistencia>=60?`warning`:`danger`;return`
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
        ${Th(`bi-people-fill`,`Alumnos activos`,e.alumnosActivos,`primary`,null)}
        ${Th(`bi-easel2`,`Clases activas`,e.clasesActivas,`indigo`,null)}
        ${Th(`bi-journal-text`,`Planes esta semana`,e.planesEstaSemana,`success`,`${e.planesEjecutados} ejecutados · ${e.planesPlanificados} pendientes`)}
        ${Th(`bi-calendar-check`,`Asistencia (7 días)`,e.tasaAsistencia===null?`—`:e.tasaAsistencia+`%`,n,null)}
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
        ${Eh(`bi-journal-text`,`Planificación`,`Planes de clase, plantillas y revisión`,`planificacion`,`primary`)}
        ${Eh(`bi-person-lines-fill`,`Seguimiento`,`Progreso y asistencia por alumno`,`pedagogico-seguimiento`,`success`)}
        ${Eh(`bi-graph-up`,`Evaluaciones`,`Calificaciones y boletines`,`progresos`,`warning`)}
        ${Eh(`bi-file-earmark-bar-graph`,`Reportes`,`Rendimiento por clase y riesgo`,`pedagogico-reportes`,`info`)}
      </div>
    </div>`}function Th(e,t,n,r,i){return`
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
    </div>`}function Eh(e,t,n,r,i){return`
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
    </div>`}function Dh(e){e.querySelectorAll(`[data-nav]`).forEach(e=>{e.addEventListener(`click`,()=>S.navigate(e.dataset.nav)),e.classList.contains(`quick-nav-card`)&&(e.addEventListener(`mouseenter`,()=>{e.style.transform=`translateY(-2px)`,e.style.boxShadow=`0 8px 25px rgba(0,0,0,0.12)`}),e.addEventListener(`mouseleave`,()=>{e.style.transform=``,e.style.boxShadow=``}))}),e.querySelector(`#btn-help-dashboard`)?.addEventListener(`click`,()=>{Rn.open({title:`Dashboard Pedagógico`,intro:`Resumen general del estado académico de la institución. Te permite ver de un vistazo cómo están los alumnos, clases y planificaciones.`,sections:[{icon:`bi-people-fill`,title:`Alumnos activos`,description:`Cantidad total de alumnos con estado activo en el sistema.`,color:`#3b82f6`},{icon:`bi-easel2`,title:`Clases activas`,description:`Número de clases con estado "activa". Las clases inactivas o suspendidas no se cuentan.`,color:`#6366f1`},{icon:`bi-journal-text`,title:`Planes esta semana`,description:`Planificaciones con fecha de inicio en los últimos 7 días. Muestra cuántas fueron ejecutadas y cuántas siguen pendientes.`,color:`#10b981`},{icon:`bi-calendar-check`,title:`Asistencia (7 días)`,description:`Porcentaje de asistencia del total de la institución en los últimos 7 días. Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%.`,color:`#f59e0b`},{icon:`bi-exclamation-triangle-fill`,title:`Alumnos con asistencia baja`,description:`Alumnos que en las últimas 4 semanas tuvieron menos del 70% de asistencia (mínimo 4 clases). Requieren atención prioritaria.`,color:`#ef4444`},{icon:`bi-grid-1x2`,title:`Acceso rápido`,description:`Los 4 cards al pie llevan directamente a Planificación, Seguimiento de alumnos, Evaluaciones y Reportes. Hacé clic para navegar.`,color:`#3b82f6`}]})})}var X={alumnos:[],asistenciaMap:{},progresosMap:{},observacionesMap:{},busqueda:``,container:null};async function Oh(e){if(e){X.container=e,e.innerHTML=Ph();try{await kh(),jh(),Nh()}catch(t){console.error(`[SeguimientoAlumnos]`,t),e.innerHTML=`<div class="page-container"><div class="alert alert-warning">${t.message}</div></div>`}}}async function kh(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],[t,n,r,i]=await Promise.all([_.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, activo`).eq(`activo`,!0).order(`nombre_completo`),_.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e),_.from(`progresos`).select(`alumno_id, calificacion`).not(`calificacion`,`is`,null),_.from(`observaciones`).select(`alumno_id, tipo, estado`).eq(`estado`,`activo`)]);X.alumnos=t.data||[],X.asistenciaMap={},(n.data||[]).forEach(e=>{X.asistenciaMap[e.alumno_id]||(X.asistenciaMap[e.alumno_id]={total:0,presentes:0}),X.asistenciaMap[e.alumno_id].total++,e.estado===`P`&&X.asistenciaMap[e.alumno_id].presentes++}),Object.values(X.asistenciaMap).forEach(e=>{e.rate=e.total>0?e.presentes/e.total:null}),X.progresosMap={};let a={};(r.data||[]).forEach(e=>{a[e.alumno_id]||(a[e.alumno_id]=[]),a[e.alumno_id].push(e.calificacion)}),Object.entries(a).forEach(([e,t])=>{let n=t.slice(-3);X.progresosMap[e]={count:n.length,promedio:n.reduce((e,t)=>e+t,0)/n.length}}),X.observacionesMap={},(i.data||[]).forEach(e=>{X.observacionesMap[e.alumno_id]||(X.observacionesMap[e.alumno_id]=[]),X.observacionesMap[e.alumno_id].push(e)})}function Ah(e){let t=X.asistenciaMap[e],n=X.progresosMap[e],r=[];return t?.total>=4&&t.rate<jd.attendance_min_rate&&r.push(`asistencia`),n?.count>=1&&n.promedio<jd.grade_min_avg&&r.push(`calificacion`),(X.observacionesMap[e]||[]).some(e=>e.tipo===`disciplina`)&&r.push(`disciplina`),r}function jh(){let e=X.busqueda.toLowerCase(),t=X.alumnos.filter(t=>!e||t.nombre_completo.toLowerCase().includes(e)||(t.instrumento_principal||``).toLowerCase().includes(e)),n=t.filter(e=>Ah(e.id).length>0),r=t.filter(e=>Ah(e.id).length===0),i=[...n,...r];X.container.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-person-lines-fill fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Seguimiento de Alumnos</h1>
          <p class="text-muted small mb-0">${X.alumnos.length} alumnos activos · ${n.length} en riesgo</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-seguimiento" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <div class="input-group mb-3" style="max-width:360px;">
        <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
        <input type="text" class="form-control border-start-0" id="busqueda-alumno"
               placeholder="Buscar alumno o instrumento..." value="${X.busqueda}">
      </div>

      ${n.length?`
        <div class="alert alert-warning border-0 d-flex align-items-center gap-2 mb-3 py-2">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span style="font-size:0.85rem;"><strong>${n.length}</strong> alumno${n.length===1?``:`s`} requiere${n.length===1?``:`n`} atención</span>
        </div>`:``}

      <div class="d-flex flex-column gap-2" id="lista-alumnos">
        ${i.map(e=>Mh(e)).join(``)||`<div class="text-center text-muted py-5">Sin resultados</div>`}
      </div>
    </div>`,Nh()}function Mh(e){let t=Ah(e.id),n=X.asistenciaMap[e.id],r=X.progresosMap[e.id],i=X.observacionesMap[e.id]||[],a=n?.rate==null?null:Math.round(n.rate*100),o=a===null?`secondary`:a>=80?`success`:a>=60?`warning`:`danger`,s=r?r.promedio>=7?`success`:r.promedio>=5?`warning`:`danger`:`secondary`;return`
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
    </div>`}function Nh(){X.container.querySelector(`#btn-help-seguimiento`)?.addEventListener(`click`,()=>{Rn.open({title:`Seguimiento de Alumnos`,intro:`Vista unificada del estado académico de cada alumno. Los alumnos con riesgo aparecen primero, destacados con una barra lateral amarilla.`,sections:[{icon:`bi-search`,title:`Buscador`,description:`Filtrá por nombre del alumno o por instrumento en tiempo real.`,color:`#6b7280`},{icon:`bi-exclamation-triangle-fill`,title:`Alerta de riesgo`,description:`Aparece cuando hay alumnos que requieren atención. Muestra el total con algún indicador activo.`,color:`#f59e0b`},{icon:`bi-person-fill`,title:`Fila del alumno`,description:`Nombre, instrumento, % de asistencia (últimas 4 semanas) y promedio de las últimas 3 calificaciones. Barra amarilla izquierda = en riesgo.`,color:`#3b82f6`},{icon:`bi-tags-fill`,title:`Badges de riesgo`,description:`"Asistencia baja" < 70% en 4 semanas. "Nota baja" promedio < 6.0. "Observación" cuando hay observaciones de disciplina activas.`,color:`#ef4444`},{icon:`bi-window-sidebar`,title:`Panel de detalle`,description:`Clic en cualquier alumno → panel con asistencia reciente (20 clases), últimas calificaciones por clase y observaciones activas.`,color:`#10b981`}]})}),X.container.querySelector(`#busqueda-alumno`)?.addEventListener(`input`,e=>{X.busqueda=e.target.value,jh()}),X.container.querySelectorAll(`.alumno-row`).forEach(e=>{e.addEventListener(`click`,()=>Fh(e.dataset.id)),e.addEventListener(`mouseenter`,()=>{e.style.boxShadow=`0 4px 15px rgba(0,0,0,0.1)`}),e.addEventListener(`mouseleave`,()=>{e.style.boxShadow=``})})}function Ph(){return`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
    <div class="spinner-border text-primary"></div>
  </div>`}async function Fh(e){let t=X.alumnos.find(t=>t.id===e);if(!t)return;let[n,r,i,a]=await Promise.all([_.from(`asistencias`).select(`fecha, estado, clase_id`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1}).limit(20),_.from(`progresos`).select(`*, clase:clases(nombre)`).eq(`alumno_id`,e).order(`fecha_evaluacion`,{ascending:!1}).limit(10),_.from(`observaciones`).select(`*`).eq(`alumno_id`,e).order(`created_at`,{ascending:!1}).limit(5),_.from(`alumnos_clases`).select(`clase:clases(id, nombre, instrumento)`).eq(`alumno_id`,e)]),o=(a.data||[]).map(e=>e.clase).filter(Boolean),s=Ah(e);b.open({title:t.nombre_completo,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
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
      </div>`})}async function Ih(e){if(e){e.innerHTML=`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>`;try{let[t,n]=await Promise.all([Lh(),Rh()]);e.innerHTML=zh(t,n),e.querySelectorAll(`.btn-generar-pedagogico`).forEach(e=>{e.addEventListener(`click`,async t=>{t.preventDefault();let n=e.getAttribute(`data-clase-id`);e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;try{let{generateMonthlyPedagogical:e}=await y(async()=>{let{generateMonthlyPedagogical:e}=await import(`./reportService-C5aMGas5.js`).then(e=>e.i);return{generateMonthlyPedagogical:e}},__vite__mapDeps([21,4,1,22,23])),t=new Date;await e(n,t.getFullYear(),t.getMonth()+1)}catch(e){console.error(`[reportesPedagogicos] Error:`,e)}finally{e.disabled=!1,e.innerHTML=`🎓 Generar`}})}),e.querySelector(`#btn-help-reportes`)?.addEventListener(`click`,()=>{Rn.open({title:`Reportes Pedagógicos`,intro:`Vista agregada del rendimiento por clase y alumnos en riesgo. Útil para detectar patrones y tomar decisiones de intervención.`,sections:[{icon:`bi-table`,title:`Rendimiento por clase`,description:`Cada clase activa con: alumnos inscriptos, % asistencia (4 semanas), promedio de calificaciones y nivel de ocupación.`,color:`#3b82f6`},{icon:`bi-bar-chart-fill`,title:`Barra de ocupación`,description:`Verde < 70% ocupado. Amarillo 70-90%. Rojo > 90%. Detecta clases saturadas.`,color:`#10b981`},{icon:`bi-percent`,title:`Columna Asistencia`,description:`Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%. Basado en registros de las últimas 4 semanas.`,color:`#f59e0b`},{icon:`bi-star-half`,title:`Columna Prom. Nota`,description:`Promedio de calificaciones de la clase. Verde ≥ 7.0, amarillo ≥ 5.0, rojo < 5.0.`,color:`#6366f1`},{icon:`bi-exclamation-triangle-fill`,title:`Alumnos en riesgo`,description:`Asistencia < 70% en 4 semanas (mínimo 4 clases evaluadas). Ordenados de menor a mayor tasa.`,color:`#ef4444`}]})})}catch(t){console.error(`[ReportesPedagogicos]`,t),e.innerHTML=`<div class="page-container"><div class="alert alert-warning">${t.message}</div></div>`}}}async function Lh(){let{data:e}=await _.from(`clases`).select(`id, nombre, instrumento, capacidad_maxima`).eq(`estado`,`activa`).order(`nombre`);if(!e?.length)return[];let t=e.map(e=>e.id),[n,r,i]=await Promise.all([_.from(`alumnos_clases`).select(`clase_id, alumno_id`).in(`clase_id`,t),_.from(`asistencias`).select(`clase_id, estado`).in(`clase_id`,t).gte(`fecha`,new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0]),_.from(`progresos`).select(`clase_id, calificacion`).in(`clase_id`,t).not(`calificacion`,`is`,null)]);return e.map(e=>{let t=(n.data||[]).filter(t=>t.clase_id===e.id),a=(r.data||[]).filter(t=>t.clase_id===e.id),o=(i.data||[]).filter(t=>t.clase_id===e.id),s=a.length>0?Math.round(a.filter(e=>e.estado===`P`).length/a.length*100):null,c=o.length>0?o.reduce((e,t)=>e+t.calificacion,0)/o.length:null,l=e.capacidad_maxima?Math.round(t.length/e.capacidad_maxima*100):null;return{...e,totalAlumnos:t.length,tasaAsist:s,promNotas:c,ocupacion:l}})}async function Rh(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],{data:t}=await _.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e);if(!t?.length)return[];let n={};t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]={total:0,presentes:0}),n[e.alumno_id].total++,e.estado===`P`&&n[e.alumno_id].presentes++});let r=Object.entries(n).filter(([,e])=>e.total>=4&&e.presentes/e.total<jd.attendance_min_rate).map(([e,t])=>({id:e,rate:t.presentes/t.total,total:t.total}));if(!r.length)return[];let{data:i}=await _.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,r.map(e=>e.id));return(i||[]).map(e=>({...e,...r.find(t=>t.id===e.id)})).sort((e,t)=>e.rate-t.rate)}function zh(e,t){let n=e=>e===null?`secondary`:e>=80?`success`:e>=60?`warning`:`danger`,r=e=>e===null?`secondary`:e>=7?`success`:e>=5?`warning`:`danger`;return`
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
                <th class="text-center">Reporte</th>
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
                  <td class="text-center">
                    <button class="btn btn-sm btn-light btn-generar-pedagogico py-1 px-2 text-primary" data-clase-id="${e.id}" title="Generar Informe Pedagógico Mensual" style="font-size:0.75rem; font-weight:600; border: 1px solid var(--bs-border-color);">
                      🎓 Generar
                    </button>
                  </td>
                </tr>`).join(``):`
                <tr><td colspan="6" class="text-center text-muted py-4">Sin clases activas</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <h6 class="text-muted text-uppercase mb-2" style="font-size:0.72rem;letter-spacing:0.08em;">
        Alumnos en riesgo — asistencia &lt; ${Math.round(jd.attendance_min_rate*100)}% (4 semanas)
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
    </div>`}function Bh(){S.register(`pedagogico-dashboard`,e=>bh(e)),S.register(`pedagogico-seguimiento`,e=>Oh(e)),S.register(`pedagogico-reportes`,e=>Ih(e))}var Vh=[{id:`m-001`,nombre:`Carlos Méndez`,especialidad:`Violín`,habilidades:[`violín`,`viola`,`solfeo`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`13:00`},{inicio:`14:00`,fin:`18:00`}],martes:[{inicio:`10:00`,fin:`13:00`}],miércoles:[{inicio:`10:00`,fin:`13:00`},{inicio:`14:00`,fin:`18:00`}],jueves:[{inicio:`10:00`,fin:`13:00`}],viernes:[{inicio:`10:00`,fin:`19:00`}],sábado:[],domingo:[]}},{id:`m-002`,nombre:`María Torres`,especialidad:`Piano`,habilidades:[`piano`,`teclado`,`teoría musical`],disponibilidad:{lunes:[{inicio:`14:00`,fin:`19:00`}],martes:[{inicio:`10:00`,fin:`19:00`}],miércoles:[{inicio:`14:00`,fin:`19:00`}],jueves:[{inicio:`10:00`,fin:`19:00`}],viernes:[],sábado:[{inicio:`09:00`,fin:`13:00`}],domingo:[]}},{id:`m-003`,nombre:`José Ramírez`,especialidad:`Percusión`,habilidades:[`percusión`,`batería`,`timbales`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`14:00`}],martes:[{inicio:`10:00`,fin:`14:00`}],miércoles:[{inicio:`10:00`,fin:`14:00`}],jueves:[{inicio:`10:00`,fin:`14:00`}],viernes:[{inicio:`10:00`,fin:`14:00`}],sábado:[{inicio:`09:00`,fin:`12:00`}],domingo:[]}},{id:`m-004`,nombre:`Ana Luisa Herrera`,especialidad:`Cello`,habilidades:[`cello`,`contrabajo`,`música de cámara`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`19:00`}],martes:[],miércoles:[{inicio:`10:00`,fin:`19:00`}],jueves:[],viernes:[{inicio:`10:00`,fin:`19:00`}],sábado:[],domingo:[]}},{id:`m-005`,nombre:`Roberto Sánchez`,especialidad:`Guitarra`,habilidades:[`guitarra`,`cuatro`,`mandolina`],disponibilidad:{lunes:[{inicio:`15:00`,fin:`19:00`}],martes:[{inicio:`15:00`,fin:`19:00`}],miércoles:[{inicio:`15:00`,fin:`19:00`}],jueves:[{inicio:`15:00`,fin:`19:00`}],viernes:[{inicio:`15:00`,fin:`19:00`}],sábado:[{inicio:`09:00`,fin:`13:00`}],domingo:[]}},{id:`m-006`,nombre:`Luisa Fernanda Díaz`,especialidad:`Voz`,habilidades:[`voz`,`coro`,`técnica vocal`,`solfeo`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`13:00`}],martes:[{inicio:`10:00`,fin:`13:00`},{inicio:`15:00`,fin:`18:00`}],miércoles:[{inicio:`10:00`,fin:`13:00`}],jueves:[{inicio:`10:00`,fin:`13:00`},{inicio:`15:00`,fin:`18:00`}],viernes:[{inicio:`10:00`,fin:`13:00`}],sábado:[{inicio:`09:00`,fin:`12:00`}],domingo:[]}}],Hh=[{id:`s-101`,nombre:`Salón Mozart (Grande)`,capacidad:30,piso:1,is_active:!0},{id:`s-102`,nombre:`Salón Beethoven (Mediano)`,capacidad:15,piso:1,is_active:!0},{id:`s-103`,nombre:`Salón Bach (Piano)`,capacidad:10,piso:2,is_active:!0},{id:`s-104`,nombre:`Salón Vivaldi (Violín)`,capacidad:8,piso:2,is_active:!0},{id:`s-105`,nombre:`Salón Chopin (Teclados)`,capacidad:12,piso:2,is_active:!0}],Uh=[{id:`c-001`,nombre:`Violín Inicial`,instrumento:`Violín`,maestro_principal_id:`m-001`,capacidad_maxima:10,total_alumnos:6,horarios:[]},{id:`c-002`,nombre:`Violín Intermedio`,instrumento:`Violín`,maestro_principal_id:`m-001`,capacidad_maxima:8,total_alumnos:5,horarios:[]},{id:`c-003`,nombre:`Piano Inicial A`,instrumento:`Piano`,maestro_principal_id:`m-002`,capacidad_maxima:12,total_alumnos:10,horarios:[]},{id:`c-004`,nombre:`Teoría y Solfeo I`,instrumento:`Solfeo`,maestro_principal_id:`m-006`,capacidad_maxima:25,total_alumnos:18,horarios:[]},{id:`c-005`,nombre:`Batería Básica`,instrumento:`Percusión`,maestro_principal_id:`m-003`,capacidad_maxima:6,total_alumnos:4,horarios:[]},{id:`c-006`,nombre:`Guitarra Clásica I`,instrumento:`Guitarra`,maestro_principal_id:`m-005`,capacidad_maxima:15,total_alumnos:11,horarios:[]},{id:`c-007`,nombre:`Cello y Cámara`,instrumento:`Cello`,maestro_principal_id:`m-004`,capacidad_maxima:8,total_alumnos:3,horarios:[]},{id:`c-008`,nombre:`Técnica Vocal A`,instrumento:`Voz`,maestro_principal_id:`m-006`,capacidad_maxima:10,total_alumnos:8,horarios:[]}],Wh=[];async function Gh(){let{data:e,error:t}=await _.from(`salones`).select(`id, nombre, capacidad, is_active`).eq(`is_active`,!0).order(`nombre`,{ascending:!0});if(t)throw Error(`Error al cargar salones reales: `+t.message);return e}async function Kh(){let{data:e,error:t}=await _.from(`clases`).select(`id, nombre, maestro_principal_id, capacidad_maxima, instrumento`).order(`nombre`,{ascending:!0});if(t)throw Error(`Error al cargar clases reales: `+t.message);let{data:n}=await _.from(`clase_horarios`).select(`*`),{data:r}=await _.from(`alumnos_clases`).select(`clase_id`);return(e||[]).map(e=>{let t=(n||[]).filter(t=>t.clase_id===e.id),i=(r||[]).filter(t=>t.clase_id===e.id).length;return{id:e.id,nombre:e.nombre,instrumento:e.instrumento||`General`,maestro_principal_id:e.maestro_principal_id,capacidad_maxima:e.capacidad_maxima||20,total_alumnos:i,horarios:t.map(e=>({dia:e.dia,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,salon_id:e.salon_id}))}})}async function qh(){if(x.isDemoMode)return{maestros:Vh,salones:Hh,clases:Uh};try{let[e,t,n]=await Promise.all([Te(),Gh(),Kh()]);return{maestros:e,salones:t,clases:n}}catch(e){throw console.error(`[horarioBuilderApi] Error fetching data:`,e),e}}async function Jh(e){if(x.isDemoMode){let t={id:`run-${Date.now()}`,created_at:new Date().toISOString(),estado:e.estado||`borrador`,periodo:e.periodo,config:e.config,resultado:e.resultado,metricas:e.metricas};return Wh.push(t),t}let{data:t,error:n}=await _.from(`schedule_runs`).insert([{periodo:e.periodo,config:e.config,resultado:e.resultado,metricas:e.metricas,estado:e.estado||`borrador`}]).select().single();if(n)throw console.error(`[horarioBuilderApi] Error saving run:`,n),Error(`No se pudo guardar la corrida de horario: `+n.message);return t}async function Yh(){if(x.isDemoMode)return Wh;let{data:e,error:t}=await _.from(`schedule_runs`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw console.error(`[horarioBuilderApi] Error fetching runs:`,t),Error(`No se pudieron obtener las corridas de horarios`);return e}var Xh={lunes:{inicio:`10:00`,fin:`19:00`},martes:{inicio:`10:00`,fin:`19:00`},miércoles:{inicio:`10:00`,fin:`19:00`},jueves:{inicio:`10:00`,fin:`19:00`},viernes:{inicio:`10:00`,fin:`19:00`},sábado:{inicio:`09:00`,fin:`13:00`},domingo:{inicio:`00:00`,fin:`00:00`}},Zh=[{id:`S1-2026`,nombre:`Semestre 1 (Ene–Jul 2026)`,inicio:`2026-01-01`,fin:`2026-07-31`},{id:`S2-2026`,nombre:`Semestre 2 (Ago–Dic 2026)`,inicio:`2026-08-01`,fin:`2026-12-31`}],Qh=[{key:`lunes`,label:`Lunes`},{key:`martes`,label:`Martes`},{key:`miércoles`,label:`Miércoles`},{key:`jueves`,label:`Jueves`},{key:`viernes`,label:`Viernes`},{key:`sábado`,label:`Sábado`}];function $h(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function eg(e,t){let n=$h(e)+t,r=Math.floor(n/60),i=n%60;return`${String(r).padStart(2,`0`)}:${String(i).padStart(2,`0`)}`}function tg(e,t){return $h(t)-$h(e)}function ng(e){if(!e||!e.includes(`:`))return`00:00`;let[t]=e.split(`:`);return`${t.padStart(2,`0`)}:00`}function rg(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function ig(e){let t=Math.floor(e/60),n=e%60;return`${t.toString().padStart(2,`0`)}:${n.toString().padStart(2,`0`)}`}function ag(e,t,n,r,i=0){return e<r+i&&n-i<t}function og(e,t,n){let r=e[t]||[],i=n[t];if(!i||i.inicio===`00:00`&&i.fin===`00:00`)return[];let a=rg(i.inicio),o=rg(i.fin),s=[];return r.forEach(e=>{let t=rg(e.inicio),n=rg(e.fin),r=Math.max(t,a),i=Math.min(n,o);r<i&&s.push({start:r,end:i})}),s}function sg({clasesConMaestro:e,maestros:t,salones:n,config:r}){let i={jornada:r?.jornada||Xh,gapMinimo:r?.gapMinimo===void 0?15:parseInt(r.gapMinimo),duracionBloque:r?.duracionBloque===void 0?60:parseInt(r.duracionBloque)},a=[],o=[],s={};t.forEach(e=>{s[e.id]=[]});let c={};n.forEach(e=>{c[e.id]=[]});let l=e.map(e=>{let n=t.find(t=>t.id===e.maestro_principal_id),r=0;return n&&n.disponibilidad&&Object.keys(n.disponibilidad).forEach(e=>{og(n.disponibilidad,e,i.jornada).forEach(e=>{r+=e.end-e.start})}),{...e,duracion:e.duracion||i.duracionBloque,totalAlumnos:e.total_alumnos||0,availableMinutes:r||1}});l.sort((e,t)=>e.availableMinutes===t.availableMinutes?t.totalAlumnos-e.totalAlumnos:e.availableMinutes-t.availableMinutes),l.forEach(e=>{let r=t.find(t=>t.id===e.maestro_principal_id);if(!r){o.push({clase_id:e.id,nombre:e.nombre,razon:`El maestro principal asignado (ID: ${e.maestro_principal_id}) no está registrado.`});return}let l=e.duracion,u=[];if(Object.keys(i.jornada).forEach(t=>{let a=i.jornada[t];if(!a||a.inicio===`00:00`&&a.fin===`00:00`)return;let o=og(r.disponibilidad||{},t,i.jornada);if(o.length===0)return;rg(a.inicio),rg(a.fin);let d=n.filter(t=>t.capacidad>=e.totalAlumnos&&t.is_active!==!1);d.length!==0&&o.forEach(e=>{for(let n=e.start;n+l<=e.end;n+=30){let e=n+l;(s[r.id]||[]).some(r=>r.day===t&&ag(n,e,r.start,r.end,i.gapMinimo))||d.forEach(a=>{(c[a.id]||[]).some(r=>r.day===t&&ag(n,e,r.start,r.end,i.gapMinimo))||u.push({day:t,start:n,end:e,salon:a,teacher:r})})}})}),u.length===0){let t=n.filter(t=>t.capacidad>=e.totalAlumnos&&t.is_active!==!1),i=`Sin disponibilidad compatible con maestro y salones.`;i=t.length===0?`No hay salones activos con capacidad suficiente para ${e.totalAlumnos} alumnos.`:`Conflicto de agenda: el maestro ${r.nombre} o los salones adecuados están ocupados en sus horas disponibles.`,o.push({clase_id:e.id,nombre:e.nombre,razon:i});return}u.forEach(t=>{let n=100,r=t.salon.capacidad-e.totalAlumnos;n-=Math.min(r*2,40);let i=(s[t.teacher.id]||[]).reduce((e,t)=>e+(t.end-t.start),0)/60;n-=Math.min(i*3,20),(s[t.teacher.id]||[]).some(e=>e.day===t.day&&(e.end===t.start||e.start===t.end))&&(n+=15),t.score=n}),u.sort((e,t)=>t.score-e.score);let d=u[0];a.push({clase_id:e.id,clase_nombre:e.nombre,maestro_id:r.id,maestro_nombre:r.nombre,salon_id:d.salon.id,salon_nombre:d.salon.nombre,dia:d.day,hora_inicio:ig(d.start),hora_fin:ig(d.end),color:cg(r.id)}),s[r.id].push({day:d.day,start:d.start,end:d.end,classId:e.id}),c[d.salon.id].push({day:d.day,start:d.start,end:d.end,classId:e.id})});let u=e.length,d=a.length,f=o.length,p={};n.forEach(e=>{let t=(c[e.id]||[]).reduce((e,t)=>e+(t.end-t.start),0),n=0;Object.keys(i.jornada).forEach(e=>{let t=i.jornada[e];t&&(t.inicio!==`00:00`||t.fin!==`00:00`)&&(n+=rg(t.fin)-rg(t.inicio))}),p[e.id]={nombre:e.nombre,porcentaje:Math.round(t/(n||1)*100)}});let m={};t.forEach(e=>{let t=(s[e.id]||[]).reduce((e,t)=>e+(t.end-t.start),0);m[e.id]={nombre:e.nombre,horas:Math.round(t/60*10)/10}});let ee=u>0?d/u*100:100;return{assignments:a,noAsignadas:o,metricas:{totalClases:u,clasesAsignadas:d,clasesNoAsignadas:f,ocupacionSalones:p,cargaMaestros:m,score:Math.max(0,Math.round(ee))}}}function cg(e){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);return`hsl(${Math.abs(t%360)}, 70%, 88%)`}function lg(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function ug(e,t,n=0){let r=lg(e.hora_inicio),i=lg(e.hora_fin),a=lg(t.hora_inicio);return r<lg(t.hora_fin)+n&&a-n<i}function dg(e,{returnAnnotated:t=!1,gapMinutes:n=0}={}){let r=[],i=new Set;for(let t=0;t<e.length;t++)for(let a=t+1;a<e.length;a++){let o=e[t],s=e[a];o.dia===s.dia&&ug(o,s,n)&&(o.maestro_id&&o.maestro_id===s.maestro_id&&(r.push({type:`teacher`,ids:[o.clase_id,s.clase_id],day:o.dia,hora_inicio:o.hora_inicio,description:`${o.maestro_nombre} tiene dos clases al mismo tiempo: "${o.clase_nombre}" y "${s.clase_nombre}"`}),i.add(o.clase_id),i.add(s.clase_id)),o.salon_id&&o.salon_id===s.salon_id&&(r.push({type:`room`,ids:[o.clase_id,s.clase_id],day:o.dia,hora_inicio:o.hora_inicio,description:`${o.salon_nombre} está ocupado por "${o.clase_nombre}" y "${s.clase_nombre}" al mismo tiempo`}),i.add(o.clase_id),i.add(s.clase_id)))}return t?{conflicts:r,assignments:e.map(e=>({...e,hasConflict:i.has(e.clase_id)}))}:r}function fg({conflictDescription:e}){return new Promise(t=>{let n=document.createElement(`div`);n.className=`modal-backdrop fade show`,n.style.zIndex=`1040`;let r=document.createElement(`div`);r.className=`modal fade show d-block`,r.style.zIndex=`1050`,r.setAttribute(`role`,`dialog`),r.setAttribute(`aria-modal`,`true`),r.innerHTML=`
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
              Conflicto detectado
            </h5>
          </div>
          <div class="modal-body">
            <p></p>
            <p class="text-muted small">¿Querés mover la clase de todas formas?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-action="cancel">Cancelar</button>
            <button type="button" class="btn btn-warning" data-action="confirm">Mover de todas formas</button>
          </div>
        </div>
      </div>
    `;let i=r.querySelector(`.modal-body p`);i&&(i.textContent=e);function a(e){document.body.removeChild(r),document.body.removeChild(n),t(e)}r.querySelector(`[data-action="confirm"]`).addEventListener(`click`,()=>a(!0)),r.querySelector(`[data-action="cancel"]`).addEventListener(`click`,()=>a(!1)),document.body.appendChild(n),document.body.appendChild(r)})}function pg(e,{assignments:t,onMove:n,onConflict:r}){let i=new AbortController,{signal:a}=i,o=null;return e.addEventListener(`dragstart`,e=>{let t=e.target.closest(`[draggable="true"][data-clase-id]`);t&&(o=t.dataset.claseId,t.classList.add(`hb-dragging`),e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,o)))},{signal:a}),e.addEventListener(`dragend`,e=>{let t=e.target.closest(`[draggable="true"][data-clase-id]`);t&&t.classList.remove(`hb-dragging`),o=null},{signal:a}),e.addEventListener(`dragover`,e=>{let t=e.target.closest(`[data-day][data-hour]`);t&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`move`),t.classList.contains(`hb-drop-target`)||t.classList.add(`hb-drop-target`))},{signal:a}),e.addEventListener(`dragleave`,e=>{let t=e.target.closest(`[data-day][data-hour]`);t&&(t.contains(e.relatedTarget)||t.classList.remove(`hb-drop-target`))},{signal:a}),e.addEventListener(`drop`,e=>{let i=e.target.closest(`[data-day][data-hour]`);if(!i)return;e.preventDefault(),i.classList.remove(`hb-drop-target`);let a=o??(e.dataTransfer?e.dataTransfer.getData(`text/plain`):null);if(!a)return;let s=i.dataset.day,c=i.dataset.hour,l=t.find(e=>String(e.clase_id)===String(a));if(!l)return;let u=l.dia,d=l.hora_inicio,f=dg(t.map(e=>{if(String(e.clase_id)!==String(a))return e;let t=tg(e.hora_inicio,e.hora_fin);return{...e,dia:s,hora_inicio:c,hora_fin:eg(c,t)}}),{gapMinutes:0});f.length===0?n({claseId:a,fromDay:u,fromHour:d,toDay:s,toHour:c}):r({assignment:l,targetDay:s,targetHour:c,conflicts:f})},{signal:a}),{destroy(){i.abort()}}}var mg={piano:`#818cf8`,violín:`#34d399`,violin:`#34d399`,guitarra:`#f472b6`,canto:`#fb923c`,voz:`#ec4899`,percusión:`#a78bfa`,percusion:`#a78bfa`,solfeo:`#38bdf8`,cello:`#f59e0b`,flauta:`#06b6d4`,trompeta:`#84cc16`,general:`#94a3b8`};function hg(e=``){return mg[e.toLowerCase()]??mg.general}function gg(e=``){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);return`hsl(${Math.abs(t%360)}, 70%, 88%)`}function _g(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function vg(e,{draggable:t=!1}={}){let{clase_id:n,clase_nombre:r,instrumento:i=`General`,maestro_id:a,maestro_nombre:o=``,salon_nombre:s=``,hora_inicio:c,hora_fin:l,locked:u=!1,hasConflict:d=!1}=e,f=hg(i),p=gg(a||``),m=t&&!u,ee=_g(o.split(` `).slice(0,2).map(e=>e[0]??``).join(``).toUpperCase()),te=_g(n),ne=d?` schedule-block--conflict`:``,re=d?`<span class="sb-conflict-icon" title="Conflicto detectado">⚠</span>`:``,ie=m?`<button class="sb-lock-btn" data-clase-id="${te}" data-locked="${u}"
               title="${u?`Desbloquear`:`Bloquear`}">
         ${u?`🔒`:`🔓`}
       </button>`:u?`<span class="sb-lock-icon">🔒</span>`:``;return`
    <div class="schedule-block${ne}"
         data-clase-id="${te}"
         data-locked="${u}"
         ${m?`draggable="true"`:``}>
      <div class="schedule-block__header" style="background:${f};">
        <span class="schedule-block__title">${_g(r)}</span>
        <span class="schedule-block__actions">${re}${ie}</span>
      </div>
      <div class="schedule-block__body">
        <span class="schedule-block__teacher-dot"
              style="background:${p};">${ee}</span>
        <span class="schedule-block__teacher-name">${_g(o)}</span>
      </div>
      ${s?`<div class="schedule-block__footer">${_g(s)} · ${c}–${l}</div>`:``}
    </div>
  `}var yg=`<p class="text-muted text-center py-4">No hay asignaciones para mostrar.</p>`;function bg(e,t,n){let r=new Map;for(let t of e){let e=ng(t.hora_inicio);r.has(e)||r.set(e,new Map);let n=r.get(e),i=(t.dia||``).toLowerCase();n.has(i)||n.set(i,[]),n.get(i).push(t)}let i=[...r.keys()].sort(),a=Qh.map(e=>`<th class="sg-col-header" data-day="${e.key}">${e.label}</th>`).join(``),o=i.map(e=>{let n=r.get(e);return`<tr>
      <td class="sg-hour-label">${e}</td>
      ${Qh.map(r=>{let i=(n.get(r.key)||[]).map(e=>vg(e,{draggable:t})).join(``);return`<td class="sg-cell" data-day="${r.key}" data-hour="${e}">${i}</td>`}).join(``)}
    </tr>`}).join(``);return`
    <div class="schedule-grid-wrapper">
      <table class="schedule-grid">
        ${n?`<caption class="text-muted">${n}</caption>`:``}
        <thead>
          <tr>
            <th class="sg-hour-col" aria-label="Hora"></th>
            ${a}
          </tr>
        </thead>
        <tbody>
          ${o}
        </tbody>
      </table>
    </div>
  `}function xg(e,t,n){let r=new Map;for(let n of e){let e=n[t]||`(Sin asignar)`;r.has(e)||r.set(e,[]),r.get(e).push(n)}return`<div class="schedule-grouped-view">${[...r.entries()].map(([e,t])=>{let r=t.map(e=>vg(e,{draggable:n})).join(``);return`
      <div class="sg-group">
        <h4 class="sg-group-title">${_g(e)}</h4>
        <div class="sg-group-blocks">${r}</div>
      </div>
    `}).join(``)}</div>`}function Sg({assignments:e,activeView:t,draggable:n=!1,periodoId:r}={}){if(!e||e.length===0)return yg;switch(t){case`teacher`:return xg(e,`maestro_nombre`,n);case`room`:return xg(e,`salon_nombre`,n);case`student`:return xg(e,`clase_nombre`,n);default:return bg(e,n,r)}}var Cg=[`grid`,`teacher`,`room`,`student`],wg={grid:{label:`Grilla`,icon:`bi-grid-3x3`},teacher:{label:`Por Maestro`,icon:`bi-person-lines-fill`},room:{label:`Por Salón`,icon:`bi-door-open`},student:{label:`Por Alumno`,icon:`bi-mortarboard`}};function Tg(e=`grid`){return wg[e]||(e=`grid`),`
    <div class="view-toggle" style="display:flex;gap:0.4rem;flex-wrap:wrap;" role="tablist" aria-label="Modo de visualización">
      ${Cg.map(t=>{let{label:n,icon:r}=wg[t],i=t===e;return`
      <button role="tab" aria-selected="${i}" class="vt-pill ${i?`vt-pill--active`:``}"
              data-view="${t}"
              style="
                display:inline-flex;align-items:center;gap:5px;
                padding:0.35rem 0.85rem;border-radius:999px;
                border:1.5px solid ${i?`#6366f1`:`#e2e8f0`};
                background:${i?`#6366f1`:`transparent`};
                color:${i?`#fff`:`#64748b`};
                font-size:0.78rem;font-weight:600;cursor:pointer;
                transition:all 0.15s ease;
              ">
        <i class="bi ${r}"></i>${n}
      </button>
    `}).join(``)}
    </div>
  `}var Eg={lunes:`Lun`,martes:`Mar`,miércoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sábado:`Sáb`};function Dg(e=[],t=!1){if(e.length===0)return``;let n=e.length,r=e.map((e,t)=>{e.type;let n=_g(Eg[e.day]??e.day);return`
      <div class="cp-row"
           data-conflict-ids="${e.ids.join(`,`)}"
           data-conflict-index="${t}"
           style="
             display:flex;align-items:flex-start;gap:0.5rem;
             padding:0.5rem 0.75rem;
             border-bottom:1px solid #fee2e2;
             cursor:pointer;
             transition:background 0.1s;
           ">
        <span style="background:#fecaca;color:#991b1b;border-radius:4px;padding:1px 5px;font-size:0.6rem;font-weight:700;flex-shrink:0;margin-top:1px;">${_g(e.type)}</span>
        <span style="font-size:0.72rem;color:#7f1d1d;line-height:1.4;">${n} ${e.hora_inicio} — ${_g(e.description)}</span>
      </div>
    `}).join(``);return`
    <div class="conflict-panel" style="border:1.5px solid #fca5a5;border-radius:0.75rem;overflow:hidden;margin-top:1rem;">
      <!-- Header (click to toggle) -->
      <div class="cp-header"
           style="
             display:flex;align-items:center;justify-content:space-between;
             padding:0.6rem 0.9rem;
             background:#fef2f2;
             cursor:pointer;
           ">
        <span style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;font-weight:700;color:#991b1b;">
          <i class="bi bi-exclamation-triangle-fill"></i>
          ${n} conflicto${n===1?``:`s`} detectado${n===1?``:`s`}
        </span>
        <i class="bi ${t?`bi-chevron-up`:`bi-chevron-down`}" class="cp-chevron" style="color:#991b1b;font-size:0.8rem;"></i>
      </div>
      <!-- Body -->
      <div class="cp-body" style="background:#fff5f5;display:${t?`block`:`none`};">
        ${r}
      </div>
    </div>
  `}function Og(e,t,n){let r=e.querySelector(`.cp-header`),i=e.querySelector(`.cp-body`),a=e.querySelector(`.cp-chevron`);r?.addEventListener(`click`,()=>{let e=i.style.display!==`none`;i.style.display=e?`none`:`block`,a.className=`bi ${e?`bi-chevron-down`:`bi-chevron-up`}`}),e.querySelectorAll(`.cp-row`).forEach(e=>{e.addEventListener(`mouseenter`,()=>{e.style.background=`#fff1f2`}),e.addEventListener(`mouseleave`,()=>{e.style.background=`transparent`}),e.addEventListener(`click`,()=>{let r=parseInt(e.dataset.conflictIndex,10);isNaN(r)||!t[r]||n?.(t[r])})})}var kg=[`borrador`,`revision`,`publicado`],Ag={borrador:`Borrador`,revision:`Revisión`,publicado:`Publicado`};function jg(e){let t=document.createElement(`li`);t.className=`pw-feedback-item d-flex align-items-start gap-2 mb-1`;let n=document.createElement(`span`);n.className=`badge bg-secondary`,n.textContent=e.tipo;let r=document.createElement(`span`);return r.textContent=e.comentario,t.appendChild(n),t.appendChild(r),t}function Mg(e,{runId:t,estadoActual:n,isAdmin:r,feedback:i=[],onEstadoChange:a,onFeedbackAdd:o}){let s=kg.indexOf(n);e.innerHTML=`
    <div class="pw-wizard">
      <!-- Stage indicators -->
      <div class="pw-stages d-flex align-items-center gap-2 mb-3">
        ${kg.map((e,t)=>{let n=`pw-stage`;t===s?n+=` pw-stage--active`:t<s&&(n+=` pw-stage--done`);let r=t<kg.length-1?`<div class="pw-stage-connector"></div>`:``;return`
      <div class="${n}" data-stage="${e}">
        <span class="pw-stage-dot"></span>
        <span class="pw-stage-label">${Ag[e]}</span>
      </div>
      ${r}
    `}).join(``)}
      </div>

      <!-- Stage content -->
      <div class="pw-content">
        <!-- Stage 1: borrador -->
        <div class="pw-panel" data-panel="borrador" ${n===`borrador`?``:`hidden`}>
          <p>El horario está en borrador. Envialo a revisión cuando esté listo.</p>
          <button class="btn btn-primary btn-sm pw-send-revision-btn">
            <i class="bi bi-send"></i> Enviar a revisión
          </button>
        </div>

        <!-- Stage 2: revision -->
        <div class="pw-panel" data-panel="revision" ${n===`revision`?``:`hidden`}>
          <h6>Comentarios y revisión</h6>
          <ul class="pw-feedback-list list-unstyled mb-2">
          </ul>
          <div class="pw-feedback-form d-flex gap-2">
            <input type="text" class="form-control form-control-sm pw-feedback-input"
                   placeholder="Agregar comentario...">
            <button class="btn btn-sm btn-outline-secondary pw-add-feedback-btn">
              <i class="bi bi-chat-dots"></i>
            </button>
          </div>
          ${r?`<button class="btn btn-success btn-sm mt-2 pw-approve-btn">
        <i class="bi bi-check-circle"></i> Aprobar y publicar
       </button>`:``}
        </div>

        <!-- Stage 3: publicado -->
        <div class="pw-panel" data-panel="publicado" ${n===`publicado`?``:`hidden`}>
          <div class="alert alert-success">
            <i class="bi bi-check-circle-fill"></i>
            Horario publicado. Ya es visible para todos los usuarios.
          </div>
        </div>
      </div>
    </div>
  `;let c=e.querySelector(`.pw-send-revision-btn`);c&&c.addEventListener(`click`,()=>a?.(`revision`));let l=e.querySelector(`.pw-approve-btn`);l&&l.addEventListener(`click`,()=>a?.(`publicado`));let u=e.querySelector(`.pw-add-feedback-btn`),d=e.querySelector(`.pw-feedback-input`);function f(){let e=d?.value?.trim();e&&(o?.({comentario:e,tipo:`observacion`}),d&&(d.value=``))}u&&u.addEventListener(`click`,f),d&&d.addEventListener(`keydown`,e=>{e.key===`Enter`&&f()});let p=e.querySelector(`.pw-feedback-list`);p&&(p.innerHTML=``,(i||[]).forEach(e=>p.appendChild(jg(e))))}async function Ng(e){let{data:t,error:n}=await _.from(`schedule_run_feedback`).select(`*`).eq(`run_id`,e).order(`created_at`,{ascending:!0});if(n)throw n;return t}async function Pg({runId:e,comentario:t,tipo:n=`observacion`}){let{data:r,error:i}=await _.from(`schedule_run_feedback`).insert([{run_id:e,comentario:t,tipo:n}]).select().single();if(i)throw i;return r}async function Fg(){let{data:{user:e}}=await _.auth.getUser();if(!e)return!1;let{data:t,error:n}=await _.from(`maestros`).select(`es_admin`).eq(`user_id`,e.id).single();return n||!t?!1:t.es_admin===!0}async function Ig(e,t){let{data:n,error:r}=await _.from(`schedule_runs`).update({estado:t}).eq(`id`,e).select().single();if(r)throw r;return n}function Lg(){return{assignments:[],conflicts:[],activeView:`grid`,activePeriodo:Zh[0].id,draggable:!1,conflictPanelExpanded:!1,scheduleRuns:[],loading:!1,error:null,undoStack:[],redoStack:[],estado:`borrador`,runId:null,isAdmin:!1,feedback:[],publishWizardOpen:!1}}var Z=Lg(),Q=null,Rg=null;function zg(e){Q=e,Z=Lg(),Hg(),t_(),Yh().then(e=>{Z.scheduleRuns=e||[]}).catch(e=>console.warn(`[horarioBuilderView] getScheduleRuns failed:`,e)),Fg().then(e=>{Z.isAdmin=e}).catch(()=>{})}function Bg(){let e={borrador:{color:`#f59e0b`,bg:`rgba(245,158,11,0.12)`,icon:`bi-pencil-fill`,label:`Borrador`},en_revision:{color:`#3b82f6`,bg:`rgba(59,130,246,0.12)`,icon:`bi-eye-fill`,label:`En revisión`},publicado:{color:`#10b981`,bg:`rgba(16,185,129,0.12)`,icon:`bi-check-circle-fill`,label:`Publicado`},archivado:{color:`#6b7280`,bg:`rgba(107,114,128,0.12)`,icon:`bi-archive-fill`,label:`Archivado`}},t=e[Z.estado]??e.borrador;return`<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.6rem;border-radius:20px;font-size:0.72rem;font-weight:600;background:${t.bg};color:${t.color};">
    <i class="bi ${t.icon}" style="font-size:0.65rem;"></i>${t.label}
  </span>`}function Vg(){let e=Z.assignments.length,t=Z.conflicts.length,n=Z.assignments.filter(e=>e.locked).length,r=Z.undoStack.length;return`
    <div class="hb-stats-bar">
      <span class="hb-stat"><i class="bi bi-calendar3"></i> <strong>${e}</strong> bloque${e===1?``:`s`}</span>
      <span class="hb-stat ${t>0?`hb-stat--danger`:`hb-stat--ok`}">
        <i class="bi ${t>0?`bi-exclamation-triangle-fill`:`bi-check-circle-fill`}"></i>
        <strong>${t}</strong> conflicto${t===1?``:`s`}
      </span>
      <span class="hb-stat"><i class="bi bi-lock-fill"></i> <strong>${n}</strong> bloqueado${n===1?``:`s`}</span>
      ${r>0?`<span class="hb-stat hb-stat--muted"><i class="bi bi-clock-history"></i> ${r} en historial</span>`:``}
      ${Z.runId?Bg():``}
    </div>
  `}function Hg(){let e=Zh.map(e=>`<option value="${e.id}" ${e.id===Z.activePeriodo?`selected`:``}>${e.nombre}</option>`).join(``),t=Z.draggable,n=Z.assignments.length>0;Q.innerHTML=`
    <div class="hb-view">

      <!-- Page header -->
      <div class="hb-page-header">
        <div class="hb-page-header__left">
          <div class="hb-page-header__icon"><i class="bi bi-calendar-week-fill"></i></div>
          <div>
            <h2 class="hb-page-header__title">Constructor de Horarios</h2>
            <p class="hb-page-header__sub">Genera, edita y publica el horario académico del período</p>
          </div>
        </div>
        <select class="hb-periodo-select" id="hb-periodo-select" title="Seleccionar período">
          ${e}
        </select>
      </div>

      <!-- Stats bar -->
      <div id="hb-stats-wrapper">${n?Vg():``}</div>

      <!-- Toolbar principal -->
      <div class="hb-toolbar-main">
        <div class="hb-toolbar-group">
          <button class="hb-btn hb-btn--primary hb-btn--lg" id="hb-generate-btn">
            <i class="bi bi-lightning-fill"></i><span>Generar horario</span>
          </button>
        </div>
        <div class="hb-toolbar-divider"></div>
        <div class="hb-toolbar-group hb-toolbar-group--views">
          <span class="hb-toolbar-label">Vista</span>
          <div id="hb-view-toggle-slot">${Tg(Z.activeView)}</div>
        </div>
        <div class="hb-toolbar-divider"></div>
        <div class="hb-toolbar-group">
          <button class="hb-btn ${t?`hb-btn--editing`:`hb-btn--ghost`}" id="hb-drag-toggle"
                  title="${t?`Desactivar edición`:`Activar drag & drop`}">
            <i class="bi ${t?`bi-unlock-fill`:`bi-lock-fill`}"></i>
            <span>${t?`Editando`:`Editar`}</span>
          </button>
          <button class="hb-btn hb-btn--icon" id="hb-undo-btn" disabled title="Deshacer">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button class="hb-btn hb-btn--icon" id="hb-redo-btn" disabled title="Rehacer">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        <div style="flex:1;"></div>
        <div class="hb-toolbar-group">
          <button class="hb-btn hb-btn--success" id="hb-save-btn" disabled>
            <i class="bi bi-floppy-fill"></i><span>Guardar</span>
          </button>
          <button class="hb-btn hb-btn--outline" id="hb-publish-btn" disabled>
            <i class="bi bi-globe"></i><span>Publicar</span>
          </button>
        </div>
      </div>

      <!-- Conflict panel -->
      <div id="hb-conflict-panel-wrapper"></div>

      <!-- Grid / empty state -->
      <div id="hb-grid-wrapper" class="hb-grid-wrapper">
        ${n?``:Ug()}
      </div>

      <!-- Publish wizard -->
      <div id="hb-publish-wrapper" class="mt-3" style="display:none"></div>

      <!-- Loading overlay -->
      <div id="hb-status"></div>
    </div>
  `,Wg()}function Ug(){return`
    <div class="hb-empty">
      <div class="hb-empty__icon"><i class="bi bi-calendar-plus"></i></div>
      <h3 class="hb-empty__title">Sin horario generado</h3>
      <p class="hb-empty__desc">
        Presioná <strong>Generar horario</strong> para que el sistema distribuya automáticamente
        las clases según los maestros y salones disponibles.
      </p>
      <div class="hb-empty__steps">
        <div class="hb-empty__step"><span class="hb-empty__step-num">1</span><span>Selecciona el período</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">2</span><span>Genera el horario</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">3</span><span>Ajusta con drag & drop</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">4</span><span>Guarda y publica</span></div>
      </div>
    </div>
  `}function Wg(){if(document.getElementById(`hb-shell-styles`))return;let e=document.createElement(`style`);e.id=`hb-shell-styles`,e.textContent=`
  .hb-view { padding: 1rem 1rem 2rem; max-width: 1400px; }
  .hb-page-header {
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:1rem;margin-bottom:1.1rem;
  }
  .hb-page-header__left { display:flex;align-items:center;gap:0.75rem; }
  .hb-page-header__icon {
    width:44px;height:44px;border-radius:12px;
    background:var(--hb-primary-light);color:var(--hb-primary);
    display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;
  }
  .hb-page-header__title { font-size:1.1rem;font-weight:700;margin:0;color:var(--hb-text); }
  .hb-page-header__sub   { font-size:0.75rem;color:var(--hb-text-muted);margin:0; }
  .hb-periodo-select {
    padding:0.4rem 0.75rem;border-radius:10px;border:1.5px solid var(--hb-border);
    background:var(--hb-card-bg);color:var(--hb-text);font-size:0.85rem;cursor:pointer;outline:none;
  }
  .hb-periodo-select:focus { border-color:var(--hb-primary); }
  .hb-stats-bar {
    display:flex;align-items:center;flex-wrap:wrap;gap:0.75rem;
    padding:0.55rem 0.875rem;background:var(--hb-card-bg);
    border:1px solid var(--hb-border);border-radius:10px;margin-bottom:0.875rem;font-size:0.8rem;
  }
  .hb-stat { display:flex;align-items:center;gap:0.3rem;color:var(--hb-text-muted); }
  .hb-stat strong { color:var(--hb-text); }
  .hb-stat--ok .bi     { color:var(--hb-success); }
  .hb-stat--danger .bi,
  .hb-stat--danger strong { color:var(--hb-danger); }
  .hb-stat--muted { opacity:0.6; }
  .hb-toolbar-main {
    display:flex;align-items:center;flex-wrap:wrap;gap:0.5rem;
    background:var(--hb-card-bg);border:1px solid var(--hb-border);
    border-radius:12px;padding:0.55rem 0.875rem;margin-bottom:0.875rem;
  }
  .hb-toolbar-group { display:flex;align-items:center;gap:0.375rem; }
  .hb-toolbar-group--views { gap:0.5rem; }
  .hb-toolbar-label { font-size:0.72rem;color:var(--hb-text-muted);font-weight:600;white-space:nowrap; }
  .hb-toolbar-divider { width:1px;height:22px;background:var(--hb-border);flex-shrink:0; }
  .hb-btn {
    display:inline-flex;align-items:center;gap:0.35rem;
    padding:0.38rem 0.875rem;border-radius:8px;border:1.5px solid transparent;
    font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.15s;
    white-space:nowrap;line-height:1;background:none;
  }
  .hb-btn:disabled { opacity:0.38;cursor:not-allowed;pointer-events:none; }
  .hb-btn--lg   { padding:0.48rem 1.1rem;font-size:0.875rem; }
  .hb-btn--icon { padding:0.38rem 0.5rem; }
  .hb-btn--primary { background:var(--hb-primary);color:#fff;border-color:var(--hb-primary); }
  .hb-btn--primary:hover { background:var(--hb-primary-hover);border-color:var(--hb-primary-hover); }
  .hb-btn--success { background:var(--hb-success);color:#fff;border-color:var(--hb-success); }
  .hb-btn--success:hover { filter:brightness(1.08); }
  .hb-btn--outline { border-color:var(--hb-primary);color:var(--hb-primary); }
  .hb-btn--outline:hover { background:var(--hb-primary-light); }
  .hb-btn--ghost { border-color:var(--hb-border);color:var(--hb-text-muted); }
  .hb-btn--ghost:hover { border-color:var(--hb-primary);color:var(--hb-primary); }
  .hb-btn--editing {
    border-color:var(--hb-warning);color:var(--hb-warning);background:var(--hb-warning-light);
    animation:hb-pulse-border 1.5s ease-in-out infinite;
  }
  @keyframes hb-pulse-border {
    0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0);}
    50%{box-shadow:0 0 0 3px rgba(245,158,11,0.2);}
  }
  .hb-empty {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;padding:3rem 1.5rem;min-height:320px;
    border:2px dashed var(--hb-border);border-radius:16px;background:var(--hb-grid-bg);
  }
  .hb-empty__icon {
    width:68px;height:68px;border-radius:50%;background:var(--hb-primary-light);
    color:var(--hb-primary);display:flex;align-items:center;justify-content:center;
    font-size:1.875rem;margin-bottom:1rem;
  }
  .hb-empty__title { font-size:1.05rem;font-weight:700;margin:0 0 0.5rem;color:var(--hb-text); }
  .hb-empty__desc  { font-size:0.85rem;color:var(--hb-text-muted);max-width:360px;margin:0 auto 1.25rem;line-height:1.6; }
  .hb-empty__steps { display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;max-width:460px; }
  .hb-empty__step  {
    display:flex;align-items:center;gap:0.45rem;background:var(--hb-card-bg);
    border:1px solid var(--hb-border);border-radius:8px;padding:0.35rem 0.7rem;
    font-size:0.76rem;color:var(--hb-text-muted);
  }
  .hb-empty__step-num {
    width:18px;height:18px;border-radius:50%;background:var(--hb-primary);color:#fff;
    display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:700;flex-shrink:0;
  }
  `,document.head.appendChild(e)}function Gg(){let e=Q?.querySelector(`#hb-stats-wrapper`);e&&(e.innerHTML=Z.assignments.length>0?Vg():``)}function Kg(){let e=Q.querySelector(`#hb-grid-wrapper`);e&&(Gg(),e.innerHTML=Sg({assignments:Z.assignments,activeView:Z.activeView,draggable:Z.draggable,periodoId:Z.activePeriodo}))}function qg(){let e=Q.querySelector(`#hb-conflict-panel-wrapper`);if(!e)return;let t=e.querySelector(`.cp-body`);t&&(Z.conflictPanelExpanded=t.style.display===`block`),e.innerHTML=Dg(Z.conflicts,Z.conflictPanelExpanded),Og(e,Z.conflicts,e=>{let t=Q.querySelector(`.hb-view`);e.ids.forEach(e=>{let n=t?.querySelector(`[data-clase-id="${e}"]`);n&&(n.scrollIntoView({behavior:`smooth`,block:`nearest`}),n.classList.add(`hb-highlight`),setTimeout(()=>n.classList.remove(`hb-highlight`),1500))})})}function Jg(){let e=Q.querySelector(`#hb-view-toggle-slot`);e&&(e.innerHTML=Tg(Z.activeView))}function Yg(){let e=Q.querySelector(`#hb-publish-wrapper`);if(e){if(!Z.publishWizardOpen||!Z.runId){e.style.display=`none`;return}e.style.display=``,Mg(e,{runId:Z.runId,estadoActual:Z.estado,isAdmin:Z.isAdmin,feedback:Z.feedback,async onEstadoChange(e){try{await Ig(Z.runId,e),Z.estado=e,Yg()}catch(e){console.error(`[horario-builder] estado update failed:`,e)}},async onFeedbackAdd({comentario:e,tipo:t}){try{let n=await Pg({runId:Z.runId,comentario:e,tipo:t});Z.feedback=[...Z.feedback,n],Yg()}catch(e){console.error(`[horario-builder] feedback add failed:`,e)}}})}}function Xg(e){Z.loading=e;let t=Q.querySelector(`#hb-status`);t&&(t.innerHTML=e?`<div class="d-flex align-items-center gap-2 mt-2 text-muted" style="font-size:0.85rem;">
         <div class="spinner-border spinner-border-sm" role="status"></div>
         <span>Generando horario optimizado…</span>
       </div>`:``)}function Zg(e,t=`success`){if(t===`danger`){v.error(e);return}if(t===`warning`){v.show(e,`warning`);return}v.success(e)}function Qg(e){return JSON.parse(JSON.stringify(e))}function $g(){let e=Q?.querySelector(`#hb-undo-btn`),t=Q?.querySelector(`#hb-redo-btn`);e&&(e.disabled=Z.undoStack.length===0),t&&(t.disabled=Z.redoStack.length===0)}function e_(){Rg&&Rg.destroy(),Z.draggable&&(Rg=pg(Q.querySelector(`#hb-grid-wrapper`),{assignments:Z.assignments,onMove({claseId:e,fromDay:t,fromHour:n,toDay:r,toHour:i}){Z.undoStack.push(Qg(Z.assignments)),Z.redoStack=[];let a=Z.assignments.findIndex(t=>t.clase_id===e);if(a===-1)return;let o={...Z.assignments[a]},s=tg(o.hora_inicio,o.hora_fin);o.dia=r,o.hora_inicio=i,o.hora_fin=eg(i,s),Z.assignments[a]=o;let{conflicts:c,assignments:l}=dg(Z.assignments,{returnAnnotated:!0});Z.conflicts=c,Z.assignments=l,Kg(),qg(),$g(),e_()},async onConflict({assignment:e,targetDay:t,targetHour:n,conflicts:r}){let i=Q.querySelector(`#hb-drag-toggle`);[i,Q.querySelector(`#hb-undo-btn`),Q.querySelector(`#hb-redo-btn`)].forEach(e=>{e&&(e.disabled=!0)});try{if(!await fg({conflictDescription:r.map(e=>e.description).join(`
`)}))return;Z.undoStack.push(Qg(Z.assignments)),Z.redoStack=[];let i=Z.assignments.findIndex(t=>t.clase_id===e.clase_id);if(i===-1)return;let a={...Z.assignments[i]},o=tg(a.hora_inicio,a.hora_fin);a.dia=t,a.hora_inicio=n,a.hora_fin=eg(n,o),Z.assignments[i]=a;let s=dg(Z.assignments,{returnAnnotated:!0});Z.conflicts=s.conflicts,Z.assignments=s.assignments,Kg(),qg(),$g(),e_()}finally{i&&(i.disabled=!1),$g()}}}))}function t_(){Q.addEventListener(`change`,e=>{e.target.id===`hb-periodo-select`&&(Z.activePeriodo=e.target.value,Kg())}),Q.addEventListener(`click`,async e=>{let t=e.target.closest(`.vt-pill[data-view]`);if(t){let e=t.dataset.view;Cg.includes(e)&&e!==Z.activeView&&(Z.activeView=e,Jg(),Kg());return}if(e.target.closest(`#hb-drag-toggle`)){Z.draggable=!Z.draggable;let e=Q.querySelector(`#hb-drag-toggle`);e&&(e.innerHTML=Z.draggable?`<i class="bi bi-unlock-fill"></i> Bloqueando`:`<i class="bi bi-lock-fill"></i> Editar`),Kg(),e_();return}if(e.target.closest(`#hb-undo-btn`)){if(Z.undoStack.length===0)return;Z.redoStack.push(Qg(Z.assignments)),Z.assignments=Z.undoStack.pop();let e=dg(Z.assignments,{returnAnnotated:!0});Z.conflicts=e.conflicts,Z.assignments=e.assignments,Kg(),qg(),$g(),e_();return}if(e.target.closest(`#hb-redo-btn`)){if(Z.redoStack.length===0)return;Z.undoStack.push(Qg(Z.assignments)),Z.assignments=Z.redoStack.pop();let e=dg(Z.assignments,{returnAnnotated:!0});Z.conflicts=e.conflicts,Z.assignments=e.assignments,Kg(),qg(),$g(),e_();return}if(e.target.closest(`#hb-generate-btn`)){n_();return}if(e.target.closest(`#hb-save-btn`)){r_();return}if(e.target.closest(`#hb-publish-btn`)){if(Z.publishWizardOpen=!Z.publishWizardOpen,Z.publishWizardOpen&&Z.runId)try{Z.feedback=await Ng(Z.runId)}catch{Z.feedback=[]}Yg();return}})}async function n_(){let e=Q.querySelector(`#hb-generate-btn`);e&&(e.disabled=!0),Xg(!0);try{let e=await qh(),{conflicts:t,assignments:n}=dg(sg({clasesConMaestro:(e.clases||[]).map(e=>({id:e.id,nombre:e.nombre,maestro_principal_id:e.maestro_principal_id,total_alumnos:e.total_alumnos||0,duracion:60})),maestros:e.maestros||[],salones:e.salones||[],config:{gapMinimo:15,duracionBloque:60}}).assignments,{returnAnnotated:!0,gapMinutes:15});Z.assignments=n,Z.conflicts=t,Kg(),qg(),e_();let r=Q.querySelector(`#hb-save-btn`);r&&(r.disabled=Z.assignments.length===0),Zg(t.length>0?`Horario generado con ${t.length} conflicto(s)`:`Horario optimizado sin conflictos`,t.length>0?`warning`:`success`)}catch(e){console.error(`[horarioBuilderView] handleGenerate error:`,e),Zg(`Error al generar: `+e.message,`danger`)}finally{Xg(!1),e&&(e.disabled=!1)}}async function r_(){let e=Q.querySelector(`#hb-save-btn`);e&&(e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Guardando…`);try{let e=await Jh({assignments:Z.assignments,periodo_id:Z.activePeriodo,estado:`borrador`});if(e?.id){Z.runId=e.id,Z.estado=`borrador`;let t=Q.querySelector(`#hb-publish-btn`);t&&(t.disabled=!1),Zg(`Horario guardado como borrador`,`success`)}else Zg(`Guardado incompleto: no se obtuvo ID del registro`,`warning`);Z.error=null}catch(e){console.error(`[horarioBuilderView] handleSave error:`,e),Z.error=e.message,Zg(`Error al guardar: `+e.message,`danger`)}finally{e&&(e.disabled=!1,e.innerHTML=`<i class="bi bi-floppy-fill"></i> Guardar`)}}function i_(){S.register(`horario-builder`,zg)}function a_(e){let t=new Date;return t.setDate(t.getDate()-e),t.toISOString().split(`T`)[0]}function o_(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):``}function s_(e){if(!e)return``;let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4),r=Math.floor(t/36e5),i=Math.floor(t/864e5);return n<2?`ahora mismo`:n<60?`hace ${n} min`:r<24?`hace ${r}h`:i<7?`hace ${i}d`:o_(e)}var c_={enfermedad:`Médica`,personal:`Personal`,capacitacion:`Capacitación`,vacaciones:`Vacaciones`,otro:`Otro`};async function l_(){let e=a_(30),{data:t,error:n}=await _.from(`ausencias_maestros`).select(`
      id, maestro_id, tipo_ausencia, urgencia, fecha_inicio, fecha_fin,
      estado, motivo, created_at, decidido_en,
      maestros:maestro_id(nombre_completo, correo, instrumento)
    `).in(`estado`,[`pendiente`,`aprobada`,`rechazada`]).gte(`created_at`,`${e}T00:00:00`).order(`created_at`,{ascending:!1}).limit(50);if(n)throw n;if(!t||t.length===0)return[];let r=[...new Set(t.map(e=>e.maestro_id).filter(Boolean))];if(r.length>0){let{data:e,error:n}=await _.from(`profiles`).select(`id, nombre_completo, email`).in(`id`,r);if(!n&&e){let n=e.map(e=>e.email).filter(Boolean),r=new Map;if(n.length>0){let{data:e}=await _.from(`maestros`).select(`correo, especialidad`).in(`correo`,n);e&&(r=new Map(e.map(e=>[e.correo.toLowerCase(),e.especialidad])))}let i=new Map(e.map(e=>{let t=r.get(e.email?.toLowerCase())||null;return[e.id,{nombre_completo:e.nombre_completo,correo:e.email,instrumento:t}]}));return t.map(e=>{let t=i.get(e.maestro_id);return{...e,maestros:t||e.maestros||null}})}}return t.map(e=>({...e,maestros:e.maestros||null}))}function u_(e,t=[]){let n=e.maestros?.nombre_completo||`Maestro`,r=c_[e.tipo_ausencia]||e.tipo_ausencia||`Ausencia`,i=e.estado===`pendiente`,a=e.estado===`aprobada`,o=e.fecha_inicio===e.fecha_fin?o_(e.fecha_inicio):`${o_(e.fecha_inicio)} → ${o_(e.fecha_fin)}`,s=e.maestros?.instrumento,c=i&&s?t.filter(t=>t.instrumento===s&&t.id!==e.maestro_id).slice(0,3):[];return{id:`ausencia:${e.id}`,source:`ausencia`,sourceId:e.id,priority:i?e.urgencia===`alta`?`alta`:e.urgencia===`media`?`media`:`baja`:`info`,actionable:i,estado:e.estado,urgencia:e.urgencia,tipo_ausencia:e.tipo_ausencia,icon:i?`bi-calendar-x-fill`:a?`bi-calendar-check-fill`:`bi-calendar-minus-fill`,iconColor:i?e.urgencia===`alta`?`#ef4444`:e.urgencia===`media`?`#f59e0b`:`#6b7280`:a?`#22c55e`:`#ef4444`,category:`ausencia`,titulo:i?`${n} solicitó ausencia ${r.toLowerCase()}`:a?`Ausencia de ${n} aprobada`:`Ausencia de ${n} rechazada`,subtitulo:o,motivo:e.motivo||``,timestamp:e.created_at,timeAgo:s_(e.created_at),actionRoute:i?`admin-ausencias`:null,actionLabel:i?`Revisar`:null,suplentesSugeridos:c,maestroInstrumento:s}}async function d_(){let e=a_(7),t=new Date().toISOString().split(`T`)[0],{data:n,error:r}=await _.from(`sesiones_clase`).select(`
      id, fecha, asistencia, borrador, contenido, clase_id,
      clases:clase_id(nombre, maestro_id,
        maestros:maestro_id(nombre_completo)
      )
    `).gte(`fecha`,e).lt(`fecha`,t).order(`fecha`,{ascending:!1}).limit(200);if(r)throw r;return n||[]}function f_(e){let t=e.filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),n={};for(let e of t){let t=e.clases?.maestro_id||`unknown`,r=e.clases?.maestros?.nombre_completo||`Maestro desconocido`;n[t]||(n[t]={nombre:r,count:0,ultima:e.fecha,mid:t}),n[t].count++,e.fecha>n[t].ultima&&(n[t].ultima=e.fecha)}return Object.values(n).map(e=>({id:`compliance:${e.mid}`,source:`sesion`,sourceId:e.mid,priority:e.count>=3?`alta`:e.count>=2?`media`:`baja`,actionable:!1,estado:`info`,icon:`bi-clipboard-x-fill`,iconColor:e.count>=3?`#ef4444`:e.count>=2?`#f59e0b`:`#6b7280`,category:`compliance`,titulo:`${e.nombre} tiene ${e.count} clase${e.count>1?`s`:``} sin asistencia`,subtitulo:`Última: ${o_(e.ultima)} · últimos 7 días`,motivo:``,timestamp:new Date(`${e.ultima}T12:00:00`).toISOString(),timeAgo:o_(e.ultima),actionRoute:null,actionLabel:null}))}async function p_(){let e=a_(7),{data:t,error:n}=await _.from(`alumnos`).select(`id, nombre_completo, created_at`).gte(`created_at`,`${e}T00:00:00`).order(`created_at`,{ascending:!1}).limit(20);return n?(console.warn(`[adminNotifApi] alumnos fetch warn:`,n.message),[]):t||[]}function m_(e){return e.map(e=>({id:`alumno:${e.id}`,source:`alumno`,sourceId:e.id,priority:`info`,actionable:!1,estado:`info`,icon:`bi-person-plus-fill`,iconColor:`#3b82f6`,category:`alumno`,titulo:`Nuevo alumno registrado: ${e.nombre_completo||`Alumno`}`,subtitulo:`Estado: activo`,motivo:``,timestamp:e.created_at,timeAgo:s_(e.created_at),actionRoute:null,actionLabel:null}))}async function h_(){let{data:e,error:t}=await _.from(`profiles`).select(`id, email, nombre_completo, created_at`).eq(`rol`,`maestro`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!1}).limit(20);return t?(console.warn(`[adminNotifApi] pending teachers fetch warn:`,t.message),[]):e||[]}function g_(e){return{id:`maestro-pendiente:${e.id}`,source:`maestro`,sourceId:e.id,priority:`alta`,actionable:!0,estado:`pendiente`,icon:`bi-person-badge-fill`,iconColor:`#ef4444`,category:`maestro`,titulo:`Nuevo maestro registrado esperando aprobación: ${e.nombre_completo||`Maestro`}`,subtitulo:`Email: ${e.email}`,motivo:``,timestamp:e.created_at,timeAgo:s_(e.created_at),actionRoute:`admin-aprobacion`,actionLabel:`Ver Aprobaciones`}}async function __(){let{data:e,error:t}=await _.from(`maestros`).select(`id, nombre_completo, correo, especialidad`).eq(`activo`,!0);return t?(console.warn(`[adminNotifApi] active maestros fetch warn:`,t.message),[]):(e||[]).map(e=>({id:e.id,nombre_completo:e.nombre_completo,email:e.correo,instrumento:e.especialidad}))}async function v_(){let e=a_(30),{data:t,error:n}=await _.from(`asistencias`).select(`
      alumno_id, estado, fecha,
      alumnos:alumno_id(nombre_completo)
    `).gte(`fecha`,e).order(`fecha`,{ascending:!1});if(n)return console.warn(`[adminNotifApi] early warning fetch warn:`,n.message),[];let r={};for(let e of t||[]){let t=e.alumno_id;t&&(r[t]||(r[t]={nombre:e.alumnos?.nombre_completo||`Estudiante`,asistencias:[]}),r[t].asistencias.push(e.estado))}let i=[];for(let[e,t]of Object.entries(r)){let n=t.asistencias.length;if(n<3)continue;let r=0;for(let e of t.asistencias)if(e===`A`||e===`ausente`)r++;else if(e===`P`||e===`presente`||e===`T`||e===`tarde`)break;if(r>=3){i.push({id:`riesgo-alumno-ausencias:${e}`,source:`riesgo`,sourceId:e,priority:`alta`,actionable:!1,estado:`info`,icon:`bi-exclamation-triangle-fill`,iconColor:`#ef4444`,category:`compliance`,titulo:`Riesgo de Deserción: ${t.nombre}`,subtitulo:`Acumula ${r} inasistencias consecutivas en los últimos 30 días.`,motivo:`Acción recomendada: Contactar de urgencia al tutor legal o revisar ficha médica.`,timestamp:new Date().toISOString(),timeAgo:`ahora mismo`,actionRoute:`alumno?id=${e}`,actionLabel:`Ver Ficha`});continue}let a=t.asistencias.filter(e=>e===`P`||e===`presente`).length,o=a/n;o<.7&&i.push({id:`riesgo-alumno-rate:${e}`,source:`riesgo`,sourceId:e,priority:`media`,actionable:!1,estado:`info`,icon:`bi-graph-down`,iconColor:`#f59e0b`,category:`compliance`,titulo:`Bajo Compliance Académico: ${t.nombre}`,subtitulo:`Asistencia del ${Math.round(o*100)}% en los últimos 30 días (${a} de ${n} clases).`,motivo:`Acción recomendada: Coordinar entrevista de seguimiento y analizar tutoría.`,timestamp:new Date().toISOString(),timeAgo:`ahora mismo`,actionRoute:`alumno?id=${e}`,actionLabel:`Ver Ficha`})}return i}async function y_(){let[e,t,n,r,i,a]=await Promise.allSettled([l_(),d_(),p_(),h_(),__(),v_()]),o=[];try{o=await __()}catch(e){console.warn(`[adminNotifApi] fallback active maestros failed:`,e)}let s=e.status===`fulfilled`?e.value.map(e=>u_(e,o)):[],c=t.status===`fulfilled`?f_(t.value):[],l=n.status===`fulfilled`?m_(n.value):[],u=r.status===`fulfilled`?r.value.map(g_):[],d=a.status===`fulfilled`?a.value:[],f=[...s,...c,...l,...u,...d],p={alta:0,media:1,baja:2,info:3};return f.sort((e,t)=>{if(e.actionable!==t.actionable)return e.actionable?-1:1;let n=p[e.priority]??4,r=p[t.priority]??4;return n===r?(t.timestamp||``).localeCompare(e.timestamp||``):n-r}),f}async function b_(){let[e,t]=await Promise.allSettled([_.from(`ausencias_maestros`).select(`id`,{count:`exact`,head:!0}).eq(`estado`,`pendiente`),_.from(`profiles`).select(`id`,{count:`exact`,head:!0}).eq(`rol`,`maestro`).eq(`estado`,`pendiente`)]);return(e.status===`fulfilled`&&!e.value.error&&e.value.count||0)+(t.status===`fulfilled`&&!t.value.error&&t.value.count||0)}async function x_(){let{data:e,error:t}=await _.from(`profiles`).select(`id, nombre_completo, email`).eq(`rol`,`maestro`).eq(`estado`,`activo`).order(`nombre_completo`,{ascending:!0});if(t)throw t;return(e||[]).map(e=>({profile_id:e.id,nombre:e.nombre_completo||e.email||`Maestro`,email:e.email}))}async function S_(e,{titulo:t,mensaje:n,deep_link:r=`/notificaciones`}){if(!e?.length)throw Error(`Se requiere al menos un destinatario`);let i=e.map(e=>({profile_id:e,tipo:`aviso_admin`,titulo:t,mensaje:n,deep_link:r,estado:`pendiente`})),{error:a}=await _.from(`notificaciones`).insert(i);if(a)throw a;let o=0;try{o=(await Promise.allSettled(e.map(e=>fetch(`/functions/v1/send-push`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer `,apikey:``},body:JSON.stringify({profile_id:e,title:t,body:n,data:{tipo:`aviso_admin`,deepLink:r}})}).then(e=>e.ok?e.json():Promise.reject(Error(`HTTP ${e.status}`)))))).filter(e=>e.status===`fulfilled`&&e.value?.sent>0).length}catch(e){console.warn(`[adminNotifApi] Web push dispatch failed (in-app notif still sent):`,e.message)}return{sent:i.length,pushed:o}}async function C_({limit:e=50}={}){let{data:t,error:n}=await _.from(`notificaciones`).select(`id, titulo, mensaje, deep_link, estado, created_at, profile_id`).eq(`tipo`,`aviso_admin`).order(`created_at`,{ascending:!1}).limit(e*20);if(n)throw n;if(!t?.length)return[];let r=new Map;for(let e of t){let t=e.created_at?.slice(0,16),n=`${e.titulo}|${t}`;r.has(n)||r.set(n,{titulo:e.titulo,mensaje:e.mensaje,deep_link:e.deep_link,created_at:e.created_at,recipients:[]}),r.get(n).recipients.push(e.profile_id)}return[...r.values()].slice(0,e).map(e=>({...e,recipientCount:e.recipients.length}))}async function w_(){let{data:e,error:t}=await _.from(`ausencias_maestros`).select(`
      id,
      maestro_id,
      tipo_ausencia,
      urgencia,
      fecha_inicio,
      fecha_fin,
      motivo,
      estado,
      created_at
    `).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(t)throw t;if(!e||e.length===0)return[];let n=[...new Set(e.map(e=>e.maestro_id).filter(Boolean))];if(n.length>0){let{data:t,error:r}=await _.from(`profiles`).select(`id, nombre_completo, email`).in(`id`,n);if(!r&&t){let n=new Map(t.map(e=>[e.id,e]));return e.map(e=>{let t=n.get(e.maestro_id);return{...e,maestros:t?{nombre_completo:t.nombre_completo,correo:t.email}:e.maestros||null}})}}return e.map(e=>({...e,maestros:e.maestros||null}))}async function T_(e,t,n){let{data:r,error:i}=await _.from(`ausencias_maestros`).update({estado:t,decision_notas:n||null,decidido_en:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}function E_(e,t=``){return T_(e,`aprobada`,t)}function D_(e,t=``){return T_(e,`rechazada`,t)}var O_=new c(`admin-notifications`),k_=null,A_=null,j_=null;function M_(){clearTimeout(j_),j_=setTimeout(async()=>{try{let e=await b_();A_?.(e)}catch(e){console.warn(`[realtimeService] count fetch failed:`,e.message)}},800)}function N_(e,t){if(!(typeof Notification>`u`)&&Notification.permission===`granted`&&(localStorage.getItem(`current-view`)||``)!==`admin-notificaciones`)try{new Notification(e,{body:t,icon:`/icons/icon-192x192.png`,badge:`/icons/icon-72x72.png`,tag:`admin-notif`,renotify:!0})}catch{}}function P_(e){k_||(A_=e,typeof Notification<`u`&&Notification.permission===`default`&&Notification.requestPermission().catch(()=>{}),k_=_.channel(`admin-notif-realtime`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`ausencias_maestros`},e=>{N_(`📅 Nueva solicitud de ausencia`,`Un maestro solicitó una ausencia — revisá el Centro de Actividad.`),M_()}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`ausencias_maestros`,filter:`estado=eq.pendiente`},()=>M_()).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`profiles`,filter:`rol=eq.maestro`},e=>{N_(`👤 Nuevo maestro pendiente de aprobación`,`${e.new?.nombre_completo||`Un maestro`} se registró y está esperando aprobación.`),M_()}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`profiles`,filter:`estado=eq.pendiente`},()=>M_()).subscribe(e=>{e===`SUBSCRIBED`?M_():(e===`CHANNEL_ERROR`||e===`SUBSCRIPTION_ERROR`)&&console.warn(`[realtimeService] Channel error, will retry on reconnect`)}),O_.registerChannel(k_))}function F_(){O_.destroy(),k_=null,A_=null,clearTimeout(j_),j_=null}function I_(){A_?.(0)}function L_(){if(document.getElementById(`anv-styles`))return;let e=document.createElement(`style`);e.id=`anv-styles`,e.textContent=`
    .anv-root {
      padding: 1.25rem 1rem 5rem;
      max-width: 680px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .anv-header {
      margin-bottom: 1.5rem;
    }

    .anv-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }

    .anv-title-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .anv-icon-wrap {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: rgba(99,102,241,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .anv-icon-wrap i {
      font-size: 1.2rem;
      color: #6366f1;
    }

    .anv-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .anv-subtitle {
      font-size: 0.8rem;
      opacity: 0.5;
      margin: 0;
      padding-left: calc(2.5rem + 0.75rem);
    }

    /* ── KPI Widgets (Glassmorphism) ── */
    .anv-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      margin-top: 1.25rem;
    }

    .anv-kpi-card {
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 1rem;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
    }

    .anv-kpi-card:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.08);
      border-color: rgba(99, 102, 241, 0.3);
    }

    .anv-kpi-card.active {
      background: rgba(99, 102, 241, 0.08);
      border-color: #6366f1;
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
    }

    .anv-kpi-num {
      font-size: 1.6rem;
      font-weight: 800;
      line-height: 1;
      color: var(--bs-body-color);
    }

    .anv-kpi-card.criticas .anv-kpi-num { color: #ef4444; }
    .anv-kpi-card.compliance .anv-kpi-num { color: #f59e0b; }
    .anv-kpi-card.novedades .anv-kpi-num { color: #3b82f6; }

    .anv-kpi-label {
      font-size: 0.72rem;
      font-weight: 600;
      opacity: 0.6;
    }

    /* ── Search Bar ── */
    .anv-search-container {
      margin-bottom: 1.25rem;
      position: relative;
    }

    .anv-search-input {
      width: 100%;
      padding: 0.65rem 1rem 0.65rem 2.5rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--bs-body-color);
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }

    .anv-search-input:focus {
      outline: none;
      background: #fff;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .anv-search-icon {
      position: absolute;
      left: 0.95rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
      opacity: 0.4;
      pointer-events: none;
    }

    /* ── Filters ── */
    .anv-filters {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .anv-filter-btn {
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      background: transparent;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      color: var(--bs-body-color);
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .anv-filter-btn.active {
      background: #6366f1;
      border-color: #6366f1;
      color: #fff;
    }

    .anv-filter-btn:not(.active):hover {
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.05));
    }

    .anv-filter-count {
      background: rgba(255,255,255,0.25);
      border-radius: 999px;
      font-size: 0.65rem;
      padding: 0.05rem 0.4rem;
      min-width: 1.2rem;
      text-align: center;
    }

    .anv-filter-btn:not(.active) .anv-filter-count {
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.08));
      color: var(--bs-body-color);
    }

    /* ── Action bar ── */
    .anv-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .anv-showing {
      font-size: 0.75rem;
      opacity: 0.5;
    }

    .anv-refresh-btn {
      background: transparent;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.12));
      border-radius: 0.5rem;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      cursor: pointer;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: background 0.15s;
    }
    .anv-refresh-btn:hover { background: var(--bs-tertiary-bg); }
    .anv-refresh-btn.spinning i { animation: anv-spin 0.7s linear infinite; }
    
    .animate-pulse {
      animation: pulse-ring 1.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
    }

    @keyframes pulse-ring {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }

    @keyframes anv-spin { to { transform: rotate(360deg); } }

    /* ── Timeline ── */
    .anv-timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
    }

    /* Vertical line */
    .anv-timeline::before {
      content: '';
      position: absolute;
      left: 1.125rem;
      top: 0.5rem;
      bottom: 0.5rem;
      width: 2px;
      background: var(--bs-border-color, rgba(0,0,0,0.08));
      border-radius: 1px;
    }

    /* ── Event card ── */
    .anv-event {
      display: flex;
      gap: 0.85rem;
      padding: 0.75rem 0;
      position: relative;
      animation: anv-fadein 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes anv-fadein {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .anv-event-dot {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.95rem;
      position: relative;
      z-index: 1;
      border: 2px solid var(--bs-body-bg, #fff);
    }

    .anv-event-body {
      flex: 1;
      min-width: 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--bs-border-color, rgba(0,0,0,0.06));
    }

    .anv-event:last-child .anv-event-body {
      border-bottom: none;
    }

    .anv-event-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.15rem;
    }

    .anv-event-titulo {
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.4;
      flex: 1;
      min-width: 0;
    }

    .anv-event-time {
      font-size: 0.7rem;
      opacity: 0.45;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .anv-event-sub {
      font-size: 0.77rem;
      opacity: 0.6;
      margin-bottom: 0.35rem;
    }

    .anv-event-motivo {
      font-size: 0.76rem;
      opacity: 0.55;
      font-style: italic;
      margin-bottom: 0.4rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* ── Category chip ── */
    .anv-cat-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      margin-bottom: 0.3rem;
    }

    /* ── Priority indicator ── */
    .anv-event[data-priority="alta"]   .anv-event-titulo { color: #ef4444; }
    .anv-event[data-priority="media"]  .anv-event-titulo { color: #f59e0b; }

    /* ── Suplentes recomendados ── */
    .anv-suplentes-box {
      margin-top: 0.65rem;
      padding: 0.65rem 0.8rem;
      background: rgba(99, 102, 241, 0.04);
      border: 1px dashed rgba(99, 102, 241, 0.2);
      border-radius: 0.75rem;
    }

    .anv-suplentes-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .anv-suplentes-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .anv-suplente-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(0,0,0,0.04);
      padding: 0.3rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.74rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.01);
    }

    .anv-suplente-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .anv-suplente-name {
      font-weight: 600;
      color: var(--bs-body-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .anv-suplente-email {
      font-size: 0.65rem;
      opacity: 0.5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .anv-suplente-btn {
      padding: 0.2rem 0.5rem;
      border-radius: 0.35rem;
      border: none;
      background: rgba(99,102,241,0.08);
      color: #6366f1;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.2rem;
    }

    .anv-suplente-btn:hover {
      background: #6366f1;
      color: #fff;
    }

    .anv-suplente-btn.notified {
      background: rgba(34,197,94,0.12);
      color: #16a34a;
      pointer-events: none;
    }

    /* ── Inline actions ── */
    .anv-inline-actions {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .anv-action-btn {
      padding: 0.28rem 0.75rem;
      border-radius: 0.5rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: opacity 0.15s, transform 0.1s;
    }
    .anv-action-btn:active  { transform: scale(0.96); }
    .anv-action-btn:disabled { opacity: 0.4; pointer-events: none; }

    .anv-btn-approve {
      background: rgba(34,197,94,0.12);
      color: #16a34a;
    }
    .anv-btn-approve:hover { background: rgba(34,197,94,0.22); }

    .anv-btn-reject {
      background: rgba(239,68,68,0.1);
      color: #dc2626;
    }
    .anv-btn-reject:hover { background: rgba(239,68,68,0.2); }

    .anv-btn-goto {
      background: rgba(99,102,241,0.1);
      color: #6366f1;
    }
    .anv-btn-goto:hover { background: rgba(99,102,241,0.2); }

    /* ── Estado chip (post-decision) ── */
    .anv-estado-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      margin-top: 0.4rem;
    }

    /* ── Empty / Error / Loading ── */
    .anv-center {
      text-align: center;
      padding: 3.5rem 1.5rem;
    }
    .anv-center-icon {
      font-size: 3rem;
      opacity: 0.2;
      margin-bottom: 0.75rem;
    }
    .anv-center-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .anv-center-sub {
      font-size: 0.8rem;
      opacity: 0.5;
    }

    .anv-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      opacity: 0.6;
      font-size: 0.88rem;
    }
    .anv-spinner {
      width: 1.4rem;
      height: 1.4rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: anv-spin 0.7s linear infinite;
    }

    /* ── Dark mode ── */
    [data-bs-theme="dark"] .anv-event-dot,
    [data-portal-theme="dark"] .anv-event-dot {
      border-color: var(--bs-body-bg, #1e1e2e);
    }

    [data-bs-theme="dark"] .anv-kpi-card,
    [data-portal-theme="dark"] .anv-kpi-card {
      background: rgba(30, 30, 46, 0.45);
      border-color: rgba(255, 255, 255, 0.05);
    }

    [data-bs-theme="dark"] .anv-suplente-item,
    [data-portal-theme="dark"] .anv-suplente-item {
      background: rgba(30, 30, 46, 0.6);
      border-color: rgba(255, 255, 255, 0.05);
    }

    [data-bs-theme="dark"] .anv-search-input,
    [data-portal-theme="dark"] .anv-search-input {
      background: rgba(30, 30, 46, 0.6);
      border-color: rgba(255, 255, 255, 0.05);
    }
  `,document.head.appendChild(e)}var R_=[{key:`all`,label:`Todo`,icon:`bi-grid-fill`},{key:`ausencia`,label:`Ausencias`,icon:`bi-calendar-x-fill`},{key:`compliance`,label:`Alertas`,icon:`bi-exclamation-triangle-fill`},{key:`alumno`,label:`Novedades`,icon:`bi-person-plus-fill`}],z_={ausencia:{bg:`rgba(239,68,68,0.1)`,color:`#ef4444`},compliance:{bg:`rgba(245,158,11,0.1)`,color:`#f59e0b`},alumno:{bg:`rgba(59,130,246,0.1)`,color:`#3b82f6`},maestro:{bg:`rgba(239,68,68,0.1)`,color:`#ef4444`}},B_={ausencia:`Ausencia`,compliance:`Alerta`,alumno:`Novedad`,maestro:`Seguridad`},V_={aprobada:{label:`Aprobada`,bg:`rgba(34,197,94,0.12)`,color:`#16a34a`,icon:`bi-check-circle-fill`},rechazada:{label:`Rechazada`,bg:`rgba(239,68,68,0.12)`,color:`#dc2626`,icon:`bi-x-circle-fill`},pendiente:{label:`Pendiente`,bg:`rgba(245,158,11,0.12)`,color:`#d97706`,icon:`bi-hourglass-split`}};async function H_(e){L_(),`Notification`in window&&Notification.permission===`default`&&Notification.requestPermission();let t=[],n=`all`,r=``,i=null;function a(){e.innerHTML=`
      <div class="anv-root">
        <div class="anv-header">
          <div class="anv-title-row d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="anv-title-left">
              <div class="anv-icon-wrap"><i class="bi bi-bell-fill"></i></div>
              <h2 class="anv-title">Centro de Actividad</h2>
            </div>
            <div class="d-flex gap-2">
              <button id="anv-btn-historial" class="btn btn-sm btn-outline-light rounded-pill px-3 fw-semibold d-flex align-items-center gap-2" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: white;">
                <i class="bi bi-clock-history"></i>
                <span>Historial</span>
              </button>
              <button id="anv-btn-send-notif" class="btn btn-sm btn-warning rounded-pill px-3 fw-semibold d-flex align-items-center gap-2">
                <i class="bi bi-send-fill"></i>
                <span>Enviar notificación</span>
              </button>
              <button id="anv-btn-help" class="btn btn-sm btn-outline-light rounded-pill px-3 fw-semibold d-flex align-items-center gap-2" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: white;">
                <i class="bi bi-question-circle-fill"></i>
                <span>Guía</span>
              </button>
            </div>
          </div>
          <p class="anv-subtitle">Gobernanza escolar proactiva y control operativo en tiempo real.</p>
          
          <!-- Mini-Dashboard KPIs Translúcidos -->
          <div class="anv-kpis" id="anv-kpi-container">
            <div class="anv-kpi-card active" data-kpi="all">
              <span class="anv-kpi-num" id="kpi-todo">-</span>
              <span class="anv-kpi-label">Total Eventos</span>
            </div>
            <div class="anv-kpi-card criticas" data-kpi="critica">
              <span class="anv-kpi-num" id="kpi-criticas">-</span>
              <span class="anv-kpi-label">Pendientes Críticas</span>
            </div>
            <div class="anv-kpi-card compliance" data-kpi="compliance">
              <span class="anv-kpi-num" id="kpi-compliance">-</span>
              <span class="anv-kpi-label">Alertas Académicas</span>
            </div>
            <div class="anv-kpi-card novedades" data-kpi="alumno">
              <span class="anv-kpi-num" id="kpi-novedades">-</span>
              <span class="anv-kpi-label">Registros Nuevos</span>
            </div>
          </div>

          <!-- Buscador Inteligente en Caliente -->
          <div class="anv-search-container">
            <i class="bi bi-search anv-search-icon"></i>
            <input type="text" id="anv-search-bar" class="anv-search-input" placeholder="Buscar por docente, alumno, instrumento o motivo..." autocomplete="off">
          </div>

          <div class="anv-filters" id="anv-filters"></div>
        </div>

        <div class="anv-action-bar">
          <span class="anv-showing" id="anv-showing"></span>
          <button class="anv-refresh-btn" id="anv-refresh-btn">
            <i class="bi bi-broadcast"></i> Conectando...
          </button>
        </div>

        <div id="anv-body">
          <div class="anv-loading">
            <div class="anv-spinner"></div>
            <span>Cargando actividad operativa...</span>
          </div>
        </div>
      </div>
    `,e.querySelector(`#anv-search-bar`)?.addEventListener(`input`,e=>{r=e.target.value,d()}),e.querySelectorAll(`[data-kpi]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`[data-kpi]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),n=t.dataset.kpi,o(),d()})}),e.querySelector(`#anv-btn-help`)?.addEventListener(`click`,()=>{p()})}function o(){let r=e.querySelector(`#anv-filters`);if(!r)return;r.innerHTML=``;let i={};for(let e of t)i[e.category]=(i[e.category]||0)+1;R_.forEach(a=>{let s=a.key===`all`?t.length:i[a.key]||0,c=n===a.key,l=document.createElement(`button`);l.className=`anv-filter-btn`+(c?` active`:``),l.dataset.filter=a.key,l.innerHTML=`<i class="bi ${a.icon}"></i> ${a.label} <span class="anv-filter-count">${s}</span>`,l.addEventListener(`click`,()=>{e.querySelectorAll(`[data-kpi]`).forEach(e=>e.classList.remove(`active`));let t=e.querySelector(`[data-kpi="${a.key}"]`);t&&t.classList.add(`active`),n=a.key,d(),o()}),r.appendChild(l)})}function s(){let n=t.length,r=t.filter(e=>e.actionable||e.priority===`alta`).length,i=t.filter(e=>e.category===`compliance`).length,a=t.filter(e=>e.category===`alumno`||e.category===`maestro`).length,o=e.querySelector(`#kpi-todo`),s=e.querySelector(`#kpi-criticas`),c=e.querySelector(`#kpi-compliance`),l=e.querySelector(`#kpi-novedades`);o&&(o.textContent=n),s&&(s.textContent=r),c&&(c.textContent=i),l&&(l.textContent=a)}function c(e,t){if(`Notification`in window&&Notification.permission===`granted`)try{new Notification(e,{body:t,icon:`/img/icons/icon-192x192.png`,vibrate:[200,100,200],tag:`soi-admin-notif`})}catch(e){console.warn(`[Web Push] Fallback via SW required:`,e)}}function l(){if(i)return;let t=_.getChannels().find(e=>e.topic===`realtime:admin-feed-channel`);t&&_.removeChannel(t),i=_.channel(`admin-feed-channel`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`ausencias_maestros`},async e=>{console.log(`[Realtime WebSocket] Nueva ausencia detectada:`,e),c(`Nueva Ausencia Solicitada`,`Un maestro ha enviado una solicitud de ausencia urgente.`),await f(!0)}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`ausencias_maestros`},async()=>{await f(!0)}).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`profiles`},async e=>{e.new&&e.new.rol===`maestro`&&(console.log(`[Realtime WebSocket] Nuevo maestro registrado:`,e),c(`Nuevo Registro de Seguridad`,`${e.new.nombre_completo} se ha registrado esperando aprobación.`),await f(!0))}).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`asistencias`},async()=>{await f(!0)}).subscribe(t=>{let n=e.querySelector(`#anv-refresh-btn`);n&&(t===`SUBSCRIBED`?(n.innerHTML=`<i class="bi bi-broadcast text-success animate-pulse"></i> Feed en Vivo`,n.style.borderColor=`rgba(34,197,94,0.3)`,n.title=`Conectado mediante WebSockets en tiempo real.`):(n.innerHTML=`<i class="bi bi-exclamation-triangle-fill text-warning"></i> Re-conectar`,n.style.borderColor=`rgba(245,158,11,0.3)`,n.title=`WebSockets inactivos. Haz clic para actualizar manualmente.`))})}function u(e,t){let n=document.createElement(`div`);n.className=`anv-event`,n.dataset.priority=e.priority,n.dataset.category=e.category;let r=z_[e.category]||{bg:`rgba(99,102,241,0.12)`,color:`#6366f1`},i=B_[e.category]||e.category,a=``;if((e.source===`ausencia`||e.source===`maestro`)&&!e.actionable){let t=V_[e.estado===`activo`?`aprobada`:e.estado===`rechazado`?`rechazada`:e.estado];t&&(a=`
          <span class="anv-estado-chip" style="background:${t.bg};color:${t.color}">
            <i class="bi ${t.icon}"></i> ${t.label===`Aprobada`&&e.source===`maestro`?`Aprobado`:t.label===`Rechazada`&&e.source===`maestro`?`Rechazado`:t.label}
          </span>
        `)}let o=``;e.suplentesSugeridos&&e.suplentesSugeridos.length>0&&e.actionable&&(o=`
        <div class="anv-suplentes-box">
          <div class="anv-suplentes-title">
            <i class="bi bi-magic"></i> Suplentes Recomendados (${e.maestroInstrumento||`Instrumento`})
          </div>
          <div class="anv-suplentes-list">
            ${e.suplentesSugeridos.map(e=>`
              <div class="anv-suplente-item">
                <div class="anv-suplente-info">
                  <span class="anv-suplente-name">${e.nombre_completo}</span>
                  <span class="anv-suplente-email">${e.email}</span>
                </div>
                <button class="anv-suplente-btn" data-action="notify-sub" data-sub-name="${e.nombre_completo}" data-sub-email="${e.email}">
                  <i class="bi bi-send-fill"></i> Proponer
                </button>
              </div>
            `).join(``)}
          </div>
        </div>
      `);let c=``;if(e.actionable&&e.source===`ausencia`)c=`
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-approve" data-action="approve" data-id="${e.sourceId}">
            <i class="bi bi-check-circle"></i> Aprobar
          </button>
          <button class="anv-action-btn anv-btn-reject" data-action="reject" data-id="${e.sourceId}">
            <i class="bi bi-x-circle"></i> Rechazar
          </button>
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="admin-ausencias">
            <i class="bi bi-arrow-right-circle"></i> Ver detalle
          </button>
        </div>
      `;else if(e.actionable&&e.source===`maestro`)c=`
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-approve" data-action="approve-maestro" data-id="${e.sourceId}">
            <i class="bi bi-check-circle"></i> Aprobar
          </button>
          <button class="anv-action-btn anv-btn-reject" data-action="reject-maestro" data-id="${e.sourceId}">
            <i class="bi bi-x-circle"></i> Rechazar
          </button>
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="${e.actionRoute}">
            <i class="bi bi-arrow-right-circle"></i> Ver Aprobaciones
          </button>
        </div>
      `;else if(e.actionRoute){let t=e.actionParams?` data-params='${JSON.stringify(e.actionParams)}'`:``;c=`
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="${e.actionRoute}"${t}>
            <i class="bi bi-arrow-right-circle"></i> ${e.actionLabel||`Ver`}
          </button>
        </div>
      `}return n.innerHTML=`
      <div class="anv-event-dot" style="background:${r.bg}">
        <i class="bi ${e.icon}" style="color:${e.iconColor}"></i>
      </div>
      <div class="anv-event-body">
        <span class="anv-cat-chip" style="background:${r.bg};color:${r.color}">
          ${i}
        </span>
        <div class="anv-event-top">
          <span class="anv-event-titulo">${e.titulo}</span>
          <span class="anv-event-time">${e.timeAgo}</span>
        </div>
        <div class="anv-event-sub">${e.subtitulo}</div>
        ${e.motivo?`<div class="anv-event-motivo">"${e.motivo}"</div>`:``}
        ${o}
        ${a}
        ${c}
      </div>
    `,n.querySelectorAll(`[data-action]`).forEach(r=>{r.addEventListener(`click`,async i=>{i.stopPropagation();let a=r.dataset.action;if(a===`goto`){let e=window.router||S;if(e){let[t,n]=(r.dataset.route||``).split(`?`),i=r.dataset.params?JSON.parse(r.dataset.params):{};n&&new URLSearchParams(n).forEach((e,t)=>{i[t]=e}),e.navigate(t,i)}return}if(a===`notify-sub`){let e=r.dataset.subName;r.disabled=!0,r.innerHTML=`<i class="bi bi-check-lg"></i> Propuesto`,r.className=`anv-suplente-btn notified`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Propuesta de suplencia enviada a ${e}`,type:`success`}}));return}if(n.querySelectorAll(`[data-action="approve"],[data-action="reject"],[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!0),a===`approve`){r.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{await E_(e.sourceId,``),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Ausencia aprobada con éxito`,type:`success`}})),e.actionable=!1,e.estado=`aprobada`,e.priority=`info`,e.icon=`bi-calendar-check-fill`,e.iconColor=`#22c55e`;let r=u(e,t);r.style.animation=`anv-fadein 0.3s ease`,n.replaceWith(r),s(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),n.querySelectorAll(`[data-action="approve"],[data-action="reject"]`).forEach(e=>e.disabled=!1),r.innerHTML=`<i class="bi bi-check-circle"></i> Aprobar`}}else if(a===`reject`){r.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{await D_(e.sourceId,``),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Ausencia rechazada con éxito`,type:`success`}})),e.actionable=!1,e.estado=`rechazada`,e.priority=`info`,e.icon=`bi-calendar-minus-fill`,e.iconColor=`#ef4444`;let r=u(e,t);r.style.animation=`anv-fadein 0.3s ease`,n.replaceWith(r),s(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),n.querySelectorAll(`[data-action="approve"],[data-action="reject"]`).forEach(e=>e.disabled=!1),r.innerHTML=`<i class="bi bi-x-circle"></i> Rechazar`}}else if(a===`approve-maestro`){r.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{let{error:r}=await _.from(`profiles`).update({estado:`activo`}).eq(`id`,e.sourceId);if(r)throw r;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Maestro aprobado con éxito`,type:`success`}})),e.actionable=!1,e.estado=`activo`,e.priority=`info`,e.icon=`bi-person-check-fill`,e.iconColor=`#22c55e`,e.titulo=`Maestro registrado aprobado: ${e.titulo.replace(`Nuevo maestro registrado esperando aprobación: `,``)}`;let i=u(e,t);i.style.animation=`anv-fadein 0.3s ease`,n.replaceWith(i),s()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),n.querySelectorAll(`[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!1),r.innerHTML=`<i class="bi bi-check-circle"></i> Aprobar`}}else if(a===`reject-maestro`){r.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{let{error:r}=await _.from(`profiles`).update({estado:`rechazado`}).eq(`id`,e.sourceId);if(r)throw r;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Maestro rechazado con éxito`,type:`success`}})),e.actionable=!1,e.estado=`rechazado`,e.priority=`info`,e.icon=`bi-person-dash-fill`,e.iconColor=`#ef4444`,e.titulo=`Maestro registrado rechazado: ${e.titulo.replace(`Nuevo maestro registrado esperando aprobación: `,``)}`;let i=u(e,t);i.style.animation=`anv-fadein 0.3s ease`,n.replaceWith(i),s()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),n.querySelectorAll(`[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!1),r.innerHTML=`<i class="bi bi-x-circle"></i> Rechazar`}}})}),n}function d(){let i=e.querySelector(`#anv-body`),a=e.querySelector(`#anv-showing`);if(!i)return;let o=t;if(n===`critica`?o=t.filter(e=>e.actionable||e.priority===`alta`):n!==`all`&&(o=t.filter(e=>e.category===n)),r.trim().length>0){let e=r.toLowerCase().trim();o=o.filter(t=>(t.titulo||``).toLowerCase().includes(e)||(t.subtitulo||``).toLowerCase().includes(e)||(t.motivo||``).toLowerCase().includes(e)||(t.maestroInstrumento||``).toLowerCase().includes(e))}if(a&&(a.textContent=o.length===0?`Sin eventos encontrados`:`${o.length} evento${o.length>1?`s`:``}`),o.length===0){i.innerHTML=`
        <div class="anv-center">
          <div class="anv-center-icon"><i class="bi bi-check-circle"></i></div>
          <p class="anv-center-title">Sin novedades</p>
          <p class="anv-center-sub">No hay eventos que coincidan con la búsqueda o el filtro activo.</p>
        </div>
      `;return}i.innerHTML=``;let s=document.createElement(`div`);s.className=`anv-timeline`,o.forEach(e=>{s.appendChild(u(e,()=>f(!0)))}),i.appendChild(s)}async function f(n=!1){let r=e.querySelector(`#anv-refresh-btn`),i=e.querySelector(`#anv-body`);r&&!n&&r.classList.add(`spinning`),i&&t.length===0&&(i.innerHTML=`
        <div class="anv-loading">
          <div class="anv-spinner"></div>
          <span>Cargando actividad operativa...</span>
        </div>
      `);try{t=await y_(),s(),o(),d(),l()}catch(n){console.error(`[adminNotificacionesView] load error:`,n);let r=e.querySelector(`#anv-body`);r&&t.length===0&&(r.innerHTML=`
          <div class="anv-center">
            <div class="anv-center-icon"><i class="bi bi-exclamation-triangle"></i></div>
            <p class="anv-center-title">Error al cargar</p>
            <p class="anv-center-sub">${n.message}</p>
          </div>
        `)}finally{r&&r.classList.remove(`spinning`)}}function p(){b.open({title:`Guía del Usuario — Centro de Actividad`,body:`
      <style>
        .anv-help-body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--bs-body-color, #212529);
        }
        .anv-help-section {
          background: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.03);
          border: 1px solid rgba(var(--bs-border-color-rgb, 222, 226, 230), 0.15);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: transform 0.2s;
        }
        .anv-help-section:hover {
          transform: translateY(-2px);
          border-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.25);
        }
        .anv-help-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 1.1rem;
          margin-right: 0.75rem;
        }
      </style>
      <div class="anv-help-body container-fluid">
        <p class="small text-muted mb-4">Esta guía te orientará en el uso del <strong>Centro de Actividad</strong>, el motor inteligente y predictivo de gobernanza y control operativo escolar.</p>
        
        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-danger bg-opacity-10 text-danger"><i class="bi bi-calendar-x-fill"></i></div>
            <h6 class="fw-bold mb-0">Gestión de Ausencias & Suplentes</h6>
          </div>
          <p class="extra-small text-secondary mb-2 lh-base">
            Cuando un maestro solicita una ausencia, el sistema activa automáticamente el **Auto-Substitution Suggester** (Motor de Reemplazo).
          </p>
          <ul class="extra-small text-secondary mb-0 ps-3 lh-base">
            <li><strong>Recomendación Inteligente:</strong> El sistema identifica en tiempo real a otros maestros activos que enseñen la misma especialidad (instrumento) y te los presenta como candidatos aptos para cubrir la vacante.</li>
            <li><strong>Acción Inline:</strong> Hacé clic en <strong>"Proponer"</strong> al lado de un candidato sugerido para asignarlo provisionalmente. También podés <strong>Aprobar</strong> o <strong>Rechazar</strong> la solicitud de ausencia directo desde la tarjeta con actualización atómica (in-place).</li>
          </ul>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-exclamation-triangle-fill"></i></div>
            <h6 class="fw-bold mb-0">Early Warning Risk Engine (Alertas de Riesgo)</h6>
          </div>
          <p class="extra-small text-secondary mb-2 lh-base">
            El sistema audita continuamente la asistencia estudiantil en busca de anomalías para prevenir la deserción:
          </p>
          <ul class="extra-small text-secondary mb-0 ps-3 lh-base">
            <li><strong>Riesgo de Deserción (Prioridad Alta - Rojo):</strong> Se dispara cuando un alumno acumula <strong>3 o más inasistencias consecutivas</strong> en los últimos 30 días. <em>Recomendación: Contactar de urgencia al tutor.</em></li>
            <li><strong>Bajo Compliance (Prioridad Media - Naranja):</strong> Se dispara si el porcentaje general de asistencia de un estudiante cae por debajo del <strong>70%</strong>. <em>Recomendación: Agendar reunión de seguimiento.</em></li>
          </ul>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-success bg-opacity-10 text-success"><i class="bi bi-broadcast"></i></div>
            <h6 class="fw-bold mb-0">Control en Vivo (Realtime WebSockets)</h6>
          </div>
          <p class="extra-small text-secondary mb-0 lh-base">
            El Centro de Actividad está conectado permanentemente a Supabase mediante WebSockets. El badge superior de **"Feed en Vivo"** te indica la salud de la conexión. Si ocurren eventos en la escuela mientras estás en otra pestaña, recibirás **notificaciones de escritorio del sistema (Web Push)** para que no te pierdas nada.
          </p>
        </div>

        <div class="anv-help-section">
          <div class="d-flex align-items-center mb-3">
            <div class="anv-help-icon bg-info bg-opacity-10 text-info"><i class="bi bi-funnel-fill"></i></div>
            <h6 class="fw-bold mb-0">Buscador & KPIs en Caliente</h6>
          </div>
          <p class="extra-small text-secondary mb-0 lh-base">
            Filtrá todo el feed interactivo al instante escribiendo en el buscador (docente, alumno, instrumento o motivo) o haciendo clic en cualquiera de las 4 tarjetas de KPIs del mini-dashboard superior.
          </p>
        </div>
      </div>
    `,size:`lg`,hideSave:!0,cancelText:`Entendido`})}async function m(){let e=[];try{e=await x_()}catch{}let t=e.map(e=>`<option value="${e.profile_id}">${e.nombre}</option>`).join(``);b.open({title:`<i class="bi bi-send-fill me-2 text-warning"></i>Enviar notificación a maestros`,body:`
        <div class="mb-3">
          <label class="form-label fw-semibold">Destinatarios</label>
          <select class="form-select" id="sn-destinatarios" multiple size="5">
            <option value="__all__" style="font-weight:700">📢 Todos los maestros activos</option>
            ${t}
          </select>
          <div class="form-text">Ctrl+click para seleccionar varios. "Todos" hace envío masivo.</div>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Título</label>
          <input type="text" class="form-control" id="sn-titulo" placeholder="Ej: Recordatorio de asistencia" maxlength="80">
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Mensaje</label>
          <textarea class="form-control" id="sn-mensaje" rows="3" placeholder="Escribe el mensaje aquí..." maxlength="300"></textarea>
          <div class="form-text" id="sn-char-count">0 / 300</div>
        </div>
        <div id="sn-status"></div>
      `,hideSave:!0,onShow:()=>{let e=document.getElementById(`sn-mensaje`),t=document.getElementById(`sn-char-count`);e?.addEventListener(`input`,()=>{t&&(t.textContent=`${e.value.length} / 300`)})}}),setTimeout(()=>{let t=document.querySelector(`.modal-footer`);if(!t)return;let n=document.createElement(`button`);n.type=`button`,n.className=`btn btn-warning fw-semibold`,n.id=`sn-btn-send`,n.innerHTML=`<i class="bi bi-send me-1"></i>Enviar`,t.appendChild(n),n.addEventListener(`click`,async()=>{let t=document.getElementById(`sn-titulo`),r=document.getElementById(`sn-mensaje`),i=document.getElementById(`sn-destinatarios`),a=document.getElementById(`sn-status`),o=t?.value.trim(),s=r?.value.trim(),c=Array.from(i?.selectedOptions||[]).map(e=>e.value);if(!o){t?.classList.add(`is-invalid`);return}if(!s){r?.classList.add(`is-invalid`);return}if(!c.length){a&&(a.innerHTML=`<div class="alert alert-warning py-2 mb-0">Seleccioná al menos un destinatario.</div>`);return}n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Enviando...`;try{let t=c;c.includes(`__all__`)&&(t=e.map(e=>e.profile_id));let{sent:r}=await S_(t,{titulo:o,mensaje:s});a&&(a.innerHTML=`
            <div class="alert alert-success py-2 mb-0">
              <i class="bi bi-check-circle me-1"></i>
              Notificación enviada a <strong>${r}</strong> maestro${r===1?``:`s`}.
            </div>`),n.innerHTML=`<i class="bi bi-check2 me-1"></i>Enviado`,setTimeout(()=>b.open({body:``}),1800)}catch(e){a&&(a.innerHTML=`<div class="alert alert-danger py-2 mb-0">Error: ${e.message}</div>`),n.disabled=!1,n.innerHTML=`<i class="bi bi-send me-1"></i>Enviar`}})},50)}async function ee(){b.open({title:`<i class="bi bi-clock-history me-2"></i>Historial de notificaciones enviadas`,body:`<div class="d-flex align-items-center gap-2 py-3 text-muted">
      <div class="spinner-border spinner-border-sm"></div><span>Cargando historial…</span>
    </div>`,hideSave:!0,cancelText:`Cerrar`});let e=[];try{e=await C_({limit:30})}catch(e){b.open({title:`Error`,body:`<div class="alert alert-danger">No se pudo cargar el historial: ${e.message}</div>`,hideSave:!0,cancelText:`Cerrar`});return}if(!e.length){b.open({title:`<i class="bi bi-clock-history me-2"></i>Historial de notificaciones enviadas`,body:`<div class="text-center py-4 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2" style="opacity:0.3"></i>
          <p class="mb-0">Todavía no se enviaron notificaciones.</p>
        </div>`,hideSave:!0,cancelText:`Cerrar`});return}let t=e=>e?new Date(e).toLocaleString(`es-DO`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):``,n=e.map(e=>`
      <div class="border rounded p-3 mb-2" style="font-size:0.875rem;">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
          <strong class="text-truncate" style="max-width:70%;">${e.titulo||`(sin título)`}</strong>
          <span class="badge bg-secondary flex-shrink-0">${e.recipientCount} destinatario${e.recipientCount===1?``:`s`}</span>
        </div>
        <p class="text-muted mb-1" style="white-space:pre-wrap;word-break:break-word;">${e.mensaje||``}</p>
        <small class="text-muted"><i class="bi bi-clock me-1"></i>${t(e.created_at)}</small>
      </div>`).join(``);b.open({title:`<i class="bi bi-clock-history me-2"></i>Historial <span class="badge bg-secondary ms-1">${e.length}</span>`,body:`<div style="max-height:420px;overflow-y:auto;">${n}</div>`,hideSave:!0,cancelText:`Cerrar`})}return a(),await f(),I_(),e.querySelector(`#anv-refresh-btn`)?.addEventListener(`click`,()=>f(!1)),e.querySelector(`#anv-btn-send-notif`)?.addEventListener(`click`,()=>m()),e.querySelector(`#anv-btn-historial`)?.addEventListener(`click`,()=>ee()),function(){i&&=(_.removeChannel(i),null)}}function U_(){S.register(`admin-notificaciones`,e=>{try{H_(e)}catch(t){console.error(`[admin-notificaciones] Error al renderizar la vista:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar el Centro de Actividad: ${t.message}</p>
        </div>
      `}})}async function W_(e){e.innerHTML=`
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
  `;try{let{data:t,error:n}=await _.from(`profiles`).select(`id, email, nombre_completo, created_at`).eq(`rol`,`maestro`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(n)throw n;let r=e.querySelector(`#aprobacion-content`);if(!t||t.length===0){r.innerHTML=`
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
              <th>Descripción</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(e=>`
              <tr data-profile-id="${e.id}">
                <td>${q_(e.nombre_completo||`—`)}</td>
                <td>${q_(e.email)}</td>
                <td>${q_(e.instrumento||`—`)}</td>
                <td>${J_(e.created_at)}</td>
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
    `,r.querySelectorAll(`.btn-aprobar`).forEach(e=>{e.addEventListener(`click`,()=>G_(e.dataset.id,r))}),r.querySelectorAll(`.btn-rechazar`).forEach(e=>{e.addEventListener(`click`,()=>K_(e.dataset.id,`rechazado`,null,r))})}catch(t){let n=e.querySelector(`#aprobacion-content`);n.innerHTML=`
      <div class="pm-error" style="text-align: center; padding: 2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar solicitudes: ${t.message}</p>
        <button class="btn btn-outline-light btn-sm" id="btn-retry-aprobacion">
          Intentar de nuevo
        </button>
      </div>
    `,n.querySelector(`#btn-retry-aprobacion`)?.addEventListener(`click`,()=>W_(e)),console.error(`[AprobacionView] Error:`,t.message)}}function G_(e,t){b.open({title:`Aprobar Usuario`,size:`sm`,saveText:`Aprobar`,body:`
      <p>Seleccioná el rol para este usuario:</p>
      <div class="mb-3">
        <label class="form-label-compact">Rol</label>
        <select class="form-select" id="aprobacion-rol-select">
          <option value="maestro">Maestro</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    `,onSave:async n=>{let r=n.querySelector(`#aprobacion-rol-select`).value;await K_(e,`activo`,r,t)}})}async function K_(e,t,n,r){let i=r?.querySelector(`tr[data-profile-id="${e}"]`);if(!(!i&&r)){i?.querySelectorAll(`button`).forEach(e=>e.disabled=!0);try{if(t===`activo`){let t=!1,{data:r,error:i}=await _.rpc(`approve_maestro_profile`,{p_profile_id:e,p_new_rol:n||`maestro`,p_new_estado:`activo`});if(!i&&r?.success&&(t=!0),!t){console.warn(`[AprobacionView] RPC falló, usando operaciones directas:`,i?.message||r?.error);let{error:t,count:a}=await _.from(`profiles`).update({rol:n||`maestro`,estado:`activo`}).eq(`id`,e).select();if(t)throw Error(`No se pudo actualizar el perfil: ${t.message}`);let{data:o}=await _.from(`profiles`).select(`estado, rol`).eq(`id`,e).maybeSingle();if(o?.estado!==`activo`)throw Error(`No se pudo activar el perfil. Por favor cerrá sesión e iniciá sesión nuevamente como admin, luego intentá aprobar de nuevo.`)}if(n===`maestro`||!n){let{data:t}=await _.from(`profiles`).select(`id, email, nombre_completo`).eq(`id`,e).maybeSingle();if(t){let{data:e}=await _.from(`maestros`).select(`id, user_id`).or(`user_id.eq.${t.id},correo.eq.${t.email}`).maybeSingle();e?e.user_id||await _.from(`maestros`).update({user_id:t.id}).eq(`id`,e.id):await _.from(`maestros`).insert({user_id:t.id,nombre_completo:t.nombre_completo,correo:t.email,instrumento:``,activo:!0})}}}else{let{error:n}=await _.from(`profiles`).update({estado:t}).eq(`id`,e);if(n)throw n}i&&(i.style.transition=`opacity 0.3s ease`,i.style.opacity=`0`,setTimeout(()=>i.remove(),300));let a=n===`admin`?`Admin`:`Maestro`;if(window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:t===`activo`?`${a} aprobado correctamente`:`Usuario rechazado`,type:`success`}})),r){let e=r.querySelector(`tbody`);e&&e.querySelectorAll(`tr`).length===0&&(r.innerHTML=`
          <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
              <i class="bi bi-inbox"></i>
            </div>
            <h3>No hay maestros pendientes de aprobación</h3>
            <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
          </div>
        `)}}catch(e){i?.querySelectorAll(`button`).forEach(e=>e.disabled=!1),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al ${t===`activo`?`aprobar`:`rechazar`} usuario: ${e.message}`,type:`error`}})),console.error(`[AprobacionView] Action error:`,e.message)}}}function q_(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function J_(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`})}catch{return e}}function $(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function Y_(e){if(!e)return`—`;let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}function X_(e){let t=Y_(e.fecha_inicio);return!e.fecha_fin||e.fecha_fin===e.fecha_inicio?t:`${t} → ${Y_(e.fecha_fin)}`}function Z_(e){return e.maestros?.nombre_completo||e.maestro_nombre||`Maestro no especificado`}function Q_(e){return e.maestros?.correo||``}var $_={enfermedad:{label:`Médica`,icon:`bi-heart-pulse-fill`,color:`#ef4444`},personal:{label:`Personal`,icon:`bi-person-fill`,color:`#3b82f6`},capacitacion:{label:`Capacitación`,icon:`bi-mortarboard-fill`,color:`#8b5cf6`},vacaciones:{label:`Vacaciones`,icon:`bi-sun-fill`,color:`#f59e0b`},otro:{label:`Otro`,icon:`bi-three-dots`,color:`#6b7280`}},ev={baja:{label:`Baja`,color:`#22c55e`,bg:`rgba(34,197,94,0.12)`},media:{label:`Media`,color:`#f59e0b`,bg:`rgba(245,158,11,0.12)`},alta:{label:`Alta`,color:`#ef4444`,bg:`rgba(239,68,68,0.12)`}};function tv(e){if(e.clase_emergente?.fecha){let t=e.clase_emergente.hora?` a las ${e.clase_emergente.hora}`:``;return`<i class="bi bi-calendar-check"></i> Reprogramada para ${e.clase_emergente.fecha}${t}`}return e.maestro_suplente_id||e.suplente_nombre?`<i class="bi bi-person-check"></i> Suplente: ${$(e.suplente_nombre||e.maestro_suplente_id)}`:`<i class="bi bi-clock"></i> Pendiente de coordinación`}function nv(){if(document.getElementById(`ausencia-aprobacion-card-styles`))return;let e=document.createElement(`style`);e.id=`ausencia-aprobacion-card-styles`,e.textContent=`
    .ausencia-approval-card {
      background: var(--bs-card-bg, #fff);
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.1));
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: box-shadow 0.2s;
    }
    .ausencia-approval-card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .aac-accent-bar {
      height: 4px;
      width: 100%;
    }

    .aac-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1rem 0.5rem;
    }

    .aac-avatar {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      background: var(--aac-tipo-color, #6b7280);
    }

    .aac-header-info {
      flex: 1;
      min-width: 0;
    }

    .aac-teacher-name {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 0.1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .aac-teacher-email {
      font-size: 0.75rem;
      opacity: 0.55;
      margin: 0;
    }

    .aac-badges {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-top: 0.4rem;
    }

    .aac-tipo-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--aac-tipo-color, #6b7280);
      background: color-mix(in srgb, var(--aac-tipo-color, #6b7280) 12%, transparent);
    }

    .aac-urg-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .aac-body {
      padding: 0.5rem 1rem;
    }

    .aac-date-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--bs-body-color);
    }

    .aac-date-row i {
      opacity: 0.55;
    }

    .aac-coverage {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      opacity: 0.7;
      margin-bottom: 0.5rem;
    }

    .aac-motivo {
      font-size: 0.82rem;
      line-height: 1.5;
      opacity: 0.8;
      padding: 0.6rem 0.75rem;
      border-radius: 0.5rem;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.04));
      margin-bottom: 0.75rem;
    }

    .aac-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.73rem;
      opacity: 0.55;
      margin-bottom: 0.25rem;
    }

    .aac-notes-wrap {
      padding: 0 1rem 0.75rem;
    }

    .aac-notes-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      opacity: 0.65;
      margin-bottom: 0.35rem;
    }

    .aac-notes-input {
      width: 100%;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      border-radius: 0.5rem;
      padding: 0.45rem 0.65rem;
      font-size: 0.82rem;
      background: var(--bs-body-bg);
      color: var(--bs-body-color);
      resize: vertical;
      min-height: 3rem;
      transition: border-color 0.15s;
    }
    .aac-notes-input:focus {
      outline: none;
      border-color: var(--aac-tipo-color, #3b82f6);
    }

    .aac-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1rem 1rem;
    }

    .aac-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.55rem;
      border-radius: 0.6rem;
      border: none;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .aac-btn:active { transform: scale(0.97); }
    .aac-btn:disabled { opacity: 0.45; pointer-events: none; }

    .aac-btn-approve {
      background: rgba(34,197,94,0.15);
      color: #16a34a;
    }
    .aac-btn-approve:hover { background: rgba(34,197,94,0.25); }

    .aac-btn-reject {
      background: rgba(239,68,68,0.12);
      color: #dc2626;
    }
    .aac-btn-reject:hover { background: rgba(239,68,68,0.22); }

    /* Dark mode compatibility */
    [data-bs-theme="dark"] .ausencia-approval-card,
    [data-portal-theme="dark"] .ausencia-approval-card {
      border-color: rgba(255,255,255,0.1);
    }

    [data-bs-theme="dark"] .aac-motivo,
    [data-portal-theme="dark"] .aac-motivo {
      background: rgba(255,255,255,0.05);
    }
  `,document.head.appendChild(e)}function rv(e,{onApprove:t=()=>{},onReject:n=()=>{}}={}){nv();let r=$_[e.tipo_ausencia]||$_.otro,i=ev[e.urgencia]||{label:e.urgencia||`Normal`,color:`#6b7280`,bg:`rgba(107,114,128,0.12)`},a=Array.isArray(e.clases_afectadas)?e.clases_afectadas.length:0,o=Z_(e),s=o.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase(),c=document.createElement(`article`);c.className=`ausencia-approval-card`,c.dataset.ausenciaCard=e.id,c.style.setProperty(`--aac-tipo-color`,r.color);let l=e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):``;c.innerHTML=`
    <div class="aac-accent-bar" style="background: ${$(r.color)};"></div>

    <div class="aac-header">
      <div class="aac-avatar" style="background: ${$(r.color)};">${$(s)}</div>
      <div class="aac-header-info">
        <p class="aac-teacher-name">${$(o)}</p>
        <p class="aac-teacher-email">${$(Q_(e))}</p>
        <div class="aac-badges">
          <span class="aac-tipo-chip" style="--aac-tipo-color:${$(r.color)}">
            <i class="bi ${$(r.icon)}"></i> ${$(r.label)}
          </span>
          <span class="aac-urg-chip" style="color:${$(i.color)};background:${$(i.bg)}">
            <i class="bi bi-circle-fill" style="font-size:0.45rem"></i> ${$(i.label)}
          </span>
        </div>
      </div>
    </div>

    <div class="aac-body">
      <div class="aac-date-row">
        <i class="bi bi-calendar-range"></i>
        ${$(X_(e))}
      </div>
      <div class="aac-coverage">${tv(e)}</div>
      ${a>0?`<div class="aac-meta"><span><i class="bi bi-journal-text"></i> ${a} clase${a>1?`s`:``} afectada${a>1?`s`:``}</span></div>`:``}
      ${e.motivo?`<div class="aac-motivo">${$(e.motivo)}</div>`:``}
      <div class="aac-meta">
        ${l?`<span><i class="bi bi-clock-history"></i> Enviada el ${l}</span>`:``}
      </div>
    </div>

    <div class="aac-notes-wrap">
      <label class="aac-notes-label" for="notes-${$(e.id)}">Nota de decisión (opcional)</label>
      <textarea
        class="aac-notes-input"
        id="notes-${$(e.id)}"
        data-decision-notes
        rows="2"
        placeholder="Ej: Aprobada según reglamento art. 5..."
      ></textarea>
    </div>

    <div class="aac-actions">
      <button type="button" class="aac-btn aac-btn-approve" data-action="approve">
        <i class="bi bi-check-circle-fill"></i> Aprobar
      </button>
      <button type="button" class="aac-btn aac-btn-reject" data-action="reject">
        <i class="bi bi-x-circle-fill"></i> Rechazar
      </button>
    </div>
  `;let u=()=>c.querySelector(`[data-decision-notes]`)?.value?.trim()||``,d=c.querySelector(`[data-action="approve"]`),f=c.querySelector(`[data-action="reject"]`);return d.addEventListener(`click`,async()=>{d.disabled=!0,f.disabled=!0,d.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Aprobando...`,await t(e.id,u())}),f.addEventListener(`click`,async()=>{d.disabled=!0,f.disabled=!0,f.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Rechazando...`,await n(e.id,u())}),c}function iv(e,t=`success`){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:t}}))}function av(){if(document.getElementById(`ausencias-admin-view-styles`))return;let e=document.createElement(`style`);e.id=`ausencias-admin-view-styles`,e.textContent=`
    .aav-root {
      padding: 1.25rem 1rem 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .aav-header {
      margin-bottom: 1.5rem;
    }

    .aav-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.4rem;
    }

    .aav-icon-wrap {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: rgba(239,68,68,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .aav-icon-wrap i {
      font-size: 1.2rem;
      color: #ef4444;
    }

    .aav-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
    }

    .aav-subtitle {
      font-size: 0.82rem;
      opacity: 0.55;
      margin: 0;
      padding-left: calc(2.5rem + 0.75rem);
    }

    /* ── Stats strip ── */
    .aav-stats {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .aav-stat {
      flex: 1;
      min-width: 100px;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.04));
      border-radius: 0.75rem;
      padding: 0.65rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    [data-bs-theme="dark"] .aav-stat,
    [data-portal-theme="dark"] .aav-stat {
      background: rgba(255,255,255,0.05);
    }

    .aav-stat-num {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }

    .aav-stat-label {
      font-size: 0.72rem;
      opacity: 0.6;
      line-height: 1.3;
    }

    /* ── Refresh btn ── */
    .aav-refresh-btn {
      background: transparent;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      border-radius: 0.5rem;
      padding: 0.3rem 0.75rem;
      font-size: 0.78rem;
      cursor: pointer;
      color: var(--bs-body-color);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: background 0.15s;
      margin-left: auto;
    }
    .aav-refresh-btn:hover { background: var(--bs-tertiary-bg); }
    .aav-refresh-btn.spinning i { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Action bar ── */
    .aav-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .aav-count-label {
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0.65;
    }

    /* ── List ── */
    .aav-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* ── Empty state ── */
    .aav-empty {
      text-align: center;
      padding: 3.5rem 1.5rem;
    }

    .aav-empty-icon {
      font-size: 3.5rem;
      opacity: 0.2;
      margin-bottom: 0.75rem;
    }

    .aav-empty-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.3rem;
    }

    .aav-empty-sub {
      font-size: 0.82rem;
      opacity: 0.55;
    }

    /* ── Error state ── */
    .aav-error {
      text-align: center;
      padding: 2rem;
      color: #ef4444;
      font-size: 0.85rem;
    }

    /* ── Loading ── */
    .aav-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      opacity: 0.6;
      font-size: 0.9rem;
    }

    .aav-spinner {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
  `,document.head.appendChild(e)}function ov(e){av(),e.innerHTML=`
    <div class="aav-root">
      <div class="aav-header">
        <div class="aav-title-row">
          <div class="aav-icon-wrap"><i class="bi bi-calendar-x-fill"></i></div>
          <h2 class="aav-title">Solicitudes de Ausencia</h2>
        </div>
        <p class="aav-subtitle">Revisá y aprobá o rechazá las ausencias solicitadas por los maestros.</p>
        <div class="aav-stats" id="aav-stats-row">
          <!-- se llena después de cargar -->
        </div>
      </div>

      <div class="aav-action-bar">
        <span class="aav-count-label" id="aav-count-label"></span>
        <button class="aav-refresh-btn" id="aav-refresh-btn">
          <i class="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>

      <div id="aav-content">
        <div class="aav-loading">
          <div class="aav-spinner"></div>
          <span>Cargando solicitudes...</span>
        </div>
      </div>
    </div>
  `}function sv(e,t){let n=t.length,r=t.filter(e=>e.urgencia===`alta`).length,i=t.filter(e=>e.urgencia===`media`).length;e.innerHTML=`
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#ef4444">${n}</div>
        <div class="aav-stat-label">Pendiente${n===1?``:`s`}</div>
      </div>
      <i class="bi bi-hourglass-split" style="font-size:1.3rem;opacity:.35"></i>
    </div>
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#ef4444">${r}</div>
        <div class="aav-stat-label">Urgencia alta</div>
      </div>
      <i class="bi bi-exclamation-triangle-fill" style="font-size:1.3rem;color:#ef4444;opacity:.5"></i>
    </div>
    <div class="aav-stat">
      <div>
        <div class="aav-stat-num" style="color:#f59e0b">${i}</div>
        <div class="aav-stat-label">Urgencia media</div>
      </div>
      <i class="bi bi-dash-circle-fill" style="font-size:1.3rem;color:#f59e0b;opacity:.5"></i>
    </div>
  `}function cv(e){e.innerHTML=`
    <div class="aav-empty">
      <div class="aav-empty-icon"><i class="bi bi-inbox"></i></div>
      <h3 class="aav-empty-title">Todo al día</h3>
      <p class="aav-empty-sub">No hay solicitudes de ausencia pendientes en este momento.</p>
    </div>
  `}async function lv(e){let t=e.querySelector(`#aav-content`),n=e.querySelector(`#aav-stats-row`),r=e.querySelector(`#aav-count-label`),i=e.querySelector(`#aav-refresh-btn`);t&&(t.innerHTML=`
      <div class="aav-loading">
        <div class="aav-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    `);try{let i=await w_();if(n&&sv(n,i),r&&(r.textContent=i.length===0?`Sin solicitudes pendientes`:`${i.length} solicitud${i.length>1?`es`:``} pendiente${i.length>1?`s`:``}`),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate(),!i.length){cv(t);return}t.innerHTML=``;let a=document.createElement(`div`);a.className=`aav-list`,t.appendChild(a);let o=[...i].sort((e,t)=>{let n={alta:0,media:1,baja:2},r=n[e.urgencia]??3,i=n[t.urgencia]??3;return r===i?(e.created_at||``).localeCompare(t.created_at||``):r-i});for(let t of o)a.appendChild(rv(t,{onApprove:async(t,n)=>{await E_(t,n),iv(`Ausencia aprobada`,`success`),await lv(e)},onReject:async(t,n)=>{await D_(t,n),iv(`Ausencia rechazada`,`success`),await lv(e)}}))}catch(e){t&&(t.innerHTML=`
        <div class="aav-error">
          <i class="bi bi-exclamation-triangle"></i>
          Error al cargar solicitudes: ${e.message}
        </div>
      `),iv(`Error al cargar ausencias: ${e.message}`,`error`)}finally{i&&i.classList.remove(`spinning`)}}async function uv(e){ov(e);let t=e.querySelector(`.aav-root`);await lv(t);let n=e.querySelector(`#aav-refresh-btn`);n&&n.addEventListener(`click`,async()=>{n.classList.add(`spinning`),await lv(t)})}function dv(){S.register(`admin-aprobacion`,async e=>{try{await W_(e)}catch(t){console.error(`[admin-aprobacion] Error al renderizar la vista de aprobaciones:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la aprobación de maestros: ${t.message}</p>
        </div>
      `}}),S.register(`admin-ausencias`,async e=>{try{await uv(e)}catch(t){console.error(`[admin-aprobacion] Error al renderizar la vista de ausencias:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la gestión de ausencias: ${t.message}</p>
        </div>
      `}})}if(ge(),`serviceWorker`in navigator){let e=async()=>{try{let e=await navigator.serviceWorker.register(`/sw.js`);console.log(`[PWA] Service Worker registered:`,e.scope)}catch(e){console.log(`[PWA] Service Worker registration failed:`,e)}};document.readyState===`complete`?e():window.addEventListener(`load`,e)}else `serviceWorker`in navigator;window.bootstrap=Me,window.router=S;var fv=[{id:`programas`,label:`Programas`,icon:`bi-book`,description:`Gestión de programas académicos`,enabled:!0,register:Fr},{id:`academic-admin`,label:`Gestión Curricular`,icon:`bi-diagram-3`,description:`Gestión de mapa curricular y recursos`,enabled:!0,register:Fm},{id:`admin-dashboard`,label:`Dashboard Administrativo`,icon:`bi-speedometer2`,description:`Panel de control, reportes y analítica de maestros`,enabled:!0,register:Zm},{id:`admin-notificaciones`,label:`Centro de Actividad`,icon:`bi-bell`,description:`Alertas tempranas de riesgo y sustituciones sugeridas`,enabled:!0,register:U_},{id:`admin-aprobacion`,label:`Aprobación de Maestros`,icon:`bi-person-check`,description:`Aprobación de maestros y gestión de ausencias`,enabled:!0,register:dv},{id:`maestros`,label:`Maestros`,icon:`bi-person-check`,description:`Gestión de maestros/docentes`,enabled:!0,register:or},{id:`alumnos`,label:`Alumnos`,icon:`bi-people`,description:`Gestión de estudiantes`,enabled:!0,register:qc},{id:`salones`,label:`Salones`,icon:`bi-door-open`,description:`Gestión de espacios de clase`,enabled:!0,register:cl},{id:`clases`,label:`Clases`,icon:`bi-easel`,description:`Gestión de clases y horarios`,enabled:!0,register:xl},{id:`horario-builder`,label:`Constructor de Horarios`,icon:`bi-calendar-range`,description:`Motor de asignación y optimización de horarios`,enabled:!0,register:i_},{id:`asistencias`,label:`Asistencias`,icon:`bi-calendar-check`,description:`Control de asistencia`,enabled:!0,register:Hl},{id:`planificacion`,label:`Planificación`,icon:`bi-journal-text`,description:`Planificación pedagógica`,enabled:!0,register:Ad},{id:`progresos`,label:`Progresos`,icon:`bi-graph-up`,description:`Calificaciones y progreso`,enabled:!0,register:rf},{id:`observaciones`,label:`Observaciones`,icon:`bi-chat-quote`,description:`Anotaciones disciplinarias`,enabled:!0,register:wf},{id:`metricas`,label:`Métricas`,icon:`bi-bar-chart-line`,description:`KPIs, alertas y análisis institucional`,enabled:!0,register:_m},{id:`permisos`,label:`Permisos`,icon:`bi-shield-lock`,description:`Permisos y roles de maestros`,enabled:!0,register:yh},{id:`pedagogico`,label:`Pedagógico`,icon:`bi-journal-check`,description:`Dashboard, seguimiento y reportes pedagógicos`,enabled:!0,register:Bh},{id:`config`,label:`Configuración`,icon:`bi-gear`,description:`Configuración del sistema`,enabled:!0,register:vm}];function pv(){let e=localStorage.getItem(`app-theme`),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches,n=e===`dark`||e===null&&t;return document.documentElement.setAttribute(`data-bs-theme`,n?`dark`:`light`),n}function mv(){let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-bs-theme`,e),localStorage.setItem(`app-theme`,e)}var hv=[{id:`academico`,label:`Académico`,icon:`bi-easel`,items:[{id:`programas`,label:`Programas`,icon:`bi-book`},{id:`clases`,label:`Clases`,icon:`bi-easel2`},{id:`salones`,label:`Salones`,icon:`bi-door-open`},{id:`horario-builder`,label:`Constructor Horarios`,icon:`bi-calendar-range`}]},{id:`personas`,label:`Personas`,icon:`bi-people`,items:[{id:`alumnos`,label:`Alumnos`,icon:`bi-people`},{id:`maestros`,label:`Maestros`,icon:`bi-person-check`},{id:`postulados`,label:`Postulados`,icon:`bi-person-plus-fill`},{id:`postulados-calendario`,label:`Calendario Citas`,icon:`bi-calendar-event`}]},{id:`pedagogico`,label:`Pedagógico`,icon:`bi-journal-check`,items:[{id:`pedagogico-dashboard`,label:`Dashboard`,icon:`bi-grid-1x2`},{id:`planificacion`,label:`Planificación`,icon:`bi-journal-text`},{id:`planificacion-maestros`,label:`Todas las Planes`,icon:`bi-journal-check`},{id:`planificacion-cobertura`,label:`Cobertura Curricular`,icon:`bi-grid-3x3-gap`},{id:`planificacion-ruta`,label:`Ruta Académica`,icon:`bi-diagram-3`},{id:`pedagogico-seguimiento`,label:`Seguimiento`,icon:`bi-person-lines-fill`},{id:`pedagogico-reportes`,label:`Reportes`,icon:`bi-file-earmark-bar-graph`}]},{id:`analisis`,label:`Análisis`,icon:`bi-bar-chart-line`,items:[{id:`metricas`,label:`Dashboard`,icon:`bi-bar-chart-line`},{id:`admin-dashboard`,label:`Cumplimiento Maestros`,icon:`bi-clipboard-check`},{id:`admin-dashboard-reportes`,label:`Reportes Director`,icon:`bi-file-earmark-pdf`},{id:`admin-dashboard-analitca-llenado`,label:`Analítica Llenado`,icon:`bi-graph-up`},{id:`admin-dashboard-tendencias`,label:`Tendencias`,icon:`bi-arrow-up-right`}]},{id:`sistema`,label:`Sistema`,icon:`bi-gear`,items:[{id:`admin-notificaciones`,label:`Centro de Actividad`,icon:`bi-bell`},{id:`admin-aprobacion`,label:`Aprobaciones`,icon:`bi-person-check`},{id:`admin-ausencias`,label:`Gestión Ausencias`,icon:`bi-calendar-x`},{id:`configuracion`,label:`Configuración`,icon:`bi-sliders`},{id:`permisos`,label:`Permisos`,icon:`bi-shield-lock`},{id:`importar-datos`,label:`Importar Datos`,icon:`bi-cloud-upload`},{id:`exportar-datos`,label:`Exportar Datos`,icon:`bi-file-earmark-arrow-down`}]}];function gv(e){for(let t of hv)if(t.items.some(t=>t.id===e))return t.id;return hv[0].id}var _v=null;function vv(e){let t=document.getElementById(`sidebar-notif-badge`);t&&(e>0?(t.textContent=e>99?`99+`:String(e),t.style.display=`inline-flex`):t.style.display=`none`)}function yv(e,t=!1){_v?.abort(),_v=new AbortController;let{signal:n}=_v;if(document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),!t)return;let r=w.getUser(),i=r?r.email||r.full_name||`Usuario`:``,a=localStorage.getItem(`current-view`)||`programas`,o=gv(a),s=document.documentElement.getAttribute(`data-bs-theme`)===`dark`,c=x.isDemoMode,l=document.createElement(`aside`);l.className=`app-sidebar`,l.innerHTML=`
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
      <span class="sidebar-brand-text">SOI</span>
      ${c?`<span class="badge bg-warning text-dark ms-2" style="font-size: 0.6rem;">DEMO</span>`:``}
    </div>
    <nav class="sidebar-nav">
      ${hv.map(e=>`
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
                ${e.id===`admin-notificaciones`?`<span class="notif-badge" id="sidebar-notif-badge" style="display:none"></span>`:``}
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
  `;let u=document.createElement(`nav`);u.className=`app-bottom-nav`,u.innerHTML=hv.map(e=>`
    <button class="bottom-tab ${e.id===o?`active`:``}" data-group="${e.id}">
      <i class="bi ${e.icon}"></i>
      <span>${e.label}</span>
    </button>
  `).join(``);let d=document.createElement(`div`);d.className=`mobile-sub-sheet`,d.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-title" id="sheetTitle"></div>
    <div class="sheet-items" id="sheetItems"></div>
  `,document.body.prepend(d),document.body.prepend(u),document.body.prepend(l),l.querySelectorAll(`.nav-group-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.nav-group`),n=t.classList.contains(`expanded`);l.querySelectorAll(`.nav-group`).forEach(e=>e.classList.remove(`expanded`)),n||t.classList.add(`expanded`)})}),l.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>S.navigate(e.dataset.route))}),l.querySelector(`#sidebarBtnTheme`).addEventListener(`click`,()=>{mv();let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`;l.querySelector(`#sidebarBtnTheme i`).className=e?`bi bi-sun-fill`:`bi bi-moon-fill`}),l.querySelector(`#sidebarBtnLogout`).addEventListener(`click`,async()=>{await w.logout(),S.navigate(`login`)});function f(e){let t=hv.find(t=>t.id===e);if(!t)return;let n=localStorage.getItem(`current-view`)||``;document.getElementById(`sheetTitle`).textContent=t.label,document.getElementById(`sheetItems`).innerHTML=t.items.map(e=>`
      <button class="sheet-item ${e.id===n?`active`:``}" data-route="${e.id}">
        <i class="bi ${e.icon}"></i>
        <span>${e.label}</span>
      </button>
    `).join(``),d.dataset.group=e,d.classList.add(`open`),d.querySelectorAll(`.sheet-item`).forEach(e=>{e.addEventListener(`click`,()=>{S.navigate(e.dataset.route),d.classList.remove(`open`)})})}u.querySelectorAll(`.bottom-tab`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.group;d.classList.contains(`open`)&&d.dataset.group===t?d.classList.remove(`open`):(f(t),u.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===t)))})}),document.addEventListener(`click`,e=>{d.classList.contains(`open`)&&!d.contains(e.target)&&!u.contains(e.target)&&d.classList.remove(`open`)},{signal:n}),window.addEventListener(`routeChanged`,e=>{let t=e.detail,n=gv(t);l.querySelectorAll(`.nav-item-btn`).forEach(e=>e.classList.toggle(`active`,e.dataset.route===t)),l.querySelectorAll(`.nav-group`).forEach(e=>{e.dataset.group===n?e.classList.add(`expanded`):e.classList.remove(`expanded`)}),u.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===n))},{signal:n})}function bv(){try{Qt()}catch(e){console.error(`Error registering auth routes:`,e)}fv.filter(e=>e.enabled&&e.register).forEach(e=>{try{e.register()}catch(t){console.error(`Error registering module ${e.id}:`,t)}})}async function xv(){let e=document.querySelector(`#app`);if(!e){console.error(`El contenedor #app no existe en el HTML`);return}pv(),bv(),S.initCustomEvents(),console.log(`🔄 Sincronizando sesión...`),await w.refreshAuth();let t=[`login`,`register`];S.setAuthGuard(()=>w.isAuthenticated(),t);let n=localStorage.getItem(`current-view`)||`programas`,r=w.isAuthenticated();!r&&!t.includes(n)?(localStorage.setItem(`current-view`,`login`),S.navigate(`login`)):r&&t.includes(n)?(localStorage.setItem(`current-view`,`programas`),yv(e,!0),S.navigate(`programas`)):(r&&yv(e,!0),S.init()),w.subscribe(t=>{if(t.user)yv(e,!0),P_(vv);else{F_(),e.innerHTML=``;let t=document.querySelector(`.app-navbar`);t&&t.remove(),document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),S.navigate(`login`)}})}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,xv):xv();function Sv(){let e=localStorage.getItem(`current-view`)||`programas`,t=document.querySelector(`.teacher-bridge`);t&&(e===`programas`?t.classList.add(`visible`):t.classList.remove(`visible`))}Sv(),window.addEventListener(`routeChanged`,e=>{Sv()});var Cv=document.querySelector(`.teacher-bridge`);Cv&&Cv.addEventListener(`click`,()=>{localStorage.setItem(`pm-modo`,`maestro`)});export{$i as a,Qi as c,Zi as i,ea as l,na as n,ra as o,Yi as r,Xi as s,Id as t,en as u};