const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ausenciaForm-C_6xed81.js","assets/supabase-DJmkTfk1.js","assets/ausenciaHistorial-DkkvNrN2.js","assets/jspdf.es.min-CIPNF2Pl.js","assets/rolldown-runtime-tcWNtVWY.js","assets/preload-helper-CsoeaaUJ.js","assets/typeof-C7CwdyHk.js","assets/jspdf.plugin.autotable-BYntMLuC.js","assets/configView-BtNp2Cng.js","assets/pushService-BCc2hkO5.js","assets/maestroAuth-BKChq-zY.js","assets/importView-CB3w4pxd.js","assets/router-CcRIuSbB.js","assets/vendor-BhXhnmkW.js","assets/vendor-COf7rB16.css","assets/reportService-vdrVPOl2.js","assets/groqService-CboUohPW.js","assets/AppToast-BOjiJExQ.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{$ as t,B as n,C as r,D as i,E as a,F as o,G as s,H as c,I as l,J as u,K as d,L as f,M as p,O as m,P as h,Q as g,R as ee,S as te,T as ne,Tt as re,U as ie,W as ae,Y as oe,Z as se,b as _,c as ce,ct as le,d as ue,dt as de,et as fe,f as pe,ft as me,gt as he,h as ge,ht as _e,i as ve,it as ye,j as be,k as xe,l as Se,m as Ce,n as we,nt as Te,o as Ee,ot as De,p as Oe,pt as v,q as ke,r as Ae,rt as je,s as Me,st as Ne,t as Pe,tt as Fe,u as Ie,ut as Le,w as y,x as Re,z as ze}from"./adminNotificacionesView-DmmmAWLg.js";import{i as b,n as Be,r as Ve,t as He}from"./supabase-DJmkTfk1.js";import{n as Ue,r as We}from"./vendor-BhXhnmkW.js";import{t as x}from"./AppToast-BOjiJExQ.js";import{t as Ge}from"./preload-helper-CsoeaaUJ.js";import{t as S}from"./AppModal-DIPPctm9.js";import{n as Ke}from"./groqService-CboUohPW.js";import{i as qe}from"./permisosSupabase-DyHvcCfe.js";import{t as C}from"./router-CcRIuSbB.js";import{t as Je}from"./jspdf.es.min-CIPNF2Pl.js";import{t as Ye}from"./jspdf.plugin.autotable-BYntMLuC.js";var Xe=`auth-session`;function Ze(e,t=!0){let n={access_token:e.access_token,refresh_token:e.refresh_token,user:e.user,expires_at:e.expires_at,persistent:t};(t?localStorage:sessionStorage).setItem(Xe,JSON.stringify(n)),t?sessionStorage.removeItem(Xe):localStorage.removeItem(Xe)}function Qe(){let e=localStorage.getItem(Xe),t=sessionStorage.getItem(Xe),n=e||t;if(!n)return null;try{return JSON.parse(n)}catch{return null}}function $e(){localStorage.removeItem(Xe),sessionStorage.removeItem(Xe)}function et(){let e=Qe();return!e||!e.expires_at?!1:Date.now()/1e3<e.expires_at-10}var tt=[];async function nt(e,t,n=!1){console.log(`🔑 authManager.login:`,e,`remember:`,n);let{data:r,error:i}=await He(e,t);return console.log(`🔑 login result:`,{data:r,error:i}),i?(console.error(`🔑 login error:`,i),{user:null,session:null,error:i}):(r.session&&Ze(r.session,n),{user:r.user,session:r.session,error:null})}async function rt(e,t,n={}){let{data:r,error:i}=await Ve(e,t,n);return i?{user:null,session:null,error:i}:{user:r.user,session:r.session,error:null}}async function it(){let{error:e}=await Be();return $e(),tt.forEach(e=>e(null)),{error:e}}function at(){return et()}function ot(){return Qe()?.user||null}var w={user:null,session:null,loading:!0,error:null,listeners:[]};function T(){w.listeners.forEach(e=>e(w))}function st(e){return w.listeners.push(e),()=>{w.listeners=w.listeners.filter(t=>t!==e)}}async function ct(e,t,n=!1){if(w.loading=!0,w.error=null,T(),e===`demo@soi.com`&&t===`demo123`){let e={id:`demo-user-id`,email:`demo@soi.com`,user_metadata:{full_name:`Usuario Demo`},role:`admin`},t={user:e,access_token:`demo-token`};return localStorage.setItem(`demo_mode`,`true`),v.isDemoMode=!0,Ze(t,n),w.user=e,w.session=t,w.loading=!1,T(),{success:!0,user:e,session:t}}try{let r=await nt(e,t,n),i=r?.error&&(r.error.message||r.error),a=r?.user&&!i;return w.user=a?r.user:null,w.session=a?r.session:null,w.loading=!1,T(),i?{success:!1,error:typeof i==`string`?i:i.message||`Error desconocido`}:{success:a,user:w.user,session:w.session}}catch(e){return w.loading=!1,w.error=e.message,T(),{success:!1,error:e.message}}}async function lt(e,t,n){w.loading=!0,w.error=null,T();try{let r=await rt(e,t,n);w.user=r.user,w.session=r.session,w.loading=!1,T();let i=!r.error&&!!r.user,a=i&&!r.session;return{...r,success:i,needsConfirmation:a,message:a?`Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.`:void 0}}catch(e){return w.loading=!1,w.error=e.message,T(),{success:!1,error:e.message}}}function ut(){it(),localStorage.removeItem(`demo_mode`),v.isDemoMode=!1,w.user=null,w.session=null,w.error=null,T()}function dt(){return ot()}function ft(){return w.user?!0:at()}async function pt(){let{data:{session:e},error:t}=await b.auth.getSession();return t||!e?($e(),w.user=null,w.session=null,w.loading=!1,T(),{authenticated:!1}):(Ze(e,Qe()?.persistent??!0),w.session=e,w.user=e.user,w.loading=!1,T(),{authenticated:!0,user:w.user})}pt();var E={subscribe:st,login:ct,register:lt,logout:ut,getUser:dt,isAuthenticated:ft,notifyListeners:T,refreshAuth:pt,getState:()=>({...w})},mt={config:{fontSizeBase:`0.8rem`,fontSizeSmall:`0.7rem`,paddingX:`0.5rem`,paddingY:`0.35rem`,gap:`0.35rem`},styles:`
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
      `}},utils:{getInitials(e){if(!e)return`?`;let t=e.trim().split(` `);return t.length>=2?(t[0][0]+t[t.length-1][0]).toUpperCase():e.substring(0,2).toUpperCase()},formatPhone(e){return e||`-`},truncate(e,t=30){return e?e.length<=t?e:e.substring(0,t-3)+`...`:``},formatDateShort(e){return e?new Date(e).toLocaleDateString(`es-VE`,{day:`numeric`,month:`short`}):`-`}}},ht={loading:!1};function gt(e){mt.injectStyles(),_t(e),vt(e)}function _t(e){e.innerHTML=`
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
  `}function vt(e){let t=document.getElementById(`loginForm`),n=document.getElementById(`loginEmail`),r=document.getElementById(`loginPassword`),i=document.getElementById(`togglePassword`),a=document.getElementById(`linkRegister`);t?.addEventListener(`submit`,async t=>{t.preventDefault();let i=n.value.trim(),a=r.value;await yt(i,a,document.getElementById(`rememberMe`)?.checked||!1,e)}),i?.addEventListener(`click`,()=>{let e=r.type===`password`?`text`:`password`;r.type=e,i.innerHTML=e===`password`?`<i class="bi bi-eye"></i>`:`<i class="bi bi-eye-slash"></i>`}),a?.addEventListener(`click`,e=>{e.preventDefault(),C.navigate(`register`)})}async function yt(e,t,n,r){if(!e||!t){xt(`Por favor ingresa email y contraseña`,`error`,r);return}ht.loading=!0,bt(!0);try{let i=await E.login(e,t,n);i.success?(xt(`¡Bienvenido!`,`success`,r),setTimeout(()=>{let e=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),C.navigate(e||`programas`)},500)):xt(i.error||`Error al iniciar sesión`,`error`,r)}catch(e){console.error(`Login error:`,e),xt(`Error de conexión`,`error`,r)}finally{ht.loading=!1,bt(!1)}}function bt(e){let t=document.getElementById(`btnLogin`),n=t?.querySelector(`.btn-text`),r=t?.querySelector(`.btn-loading`);t&&(t.disabled=e,e?(n?.classList.add(`d-none`),r?.classList.remove(`d-none`)):(n?.classList.remove(`d-none`),r?.classList.add(`d-none`)))}function xt(e,t,n){let r=document.getElementById(`toastContainer`);if(!r)return;let i=e&&typeof e==`object`?e.message||e.error||JSON.stringify(e):String(e||`Error`),a=`
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
  `,o=document.createElement(`div`);o.innerHTML=a;let s=o.firstElementChild;r.appendChild(s),new Ue(s,{autohide:!0,delay:3e3}).show(),s.addEventListener(`hidden.bs.toast`,()=>{s.remove()})}var St={loading:!1},Ct=[{test:e=>e.length>=8,message:`Mínimo 8 caracteres`},{test:e=>/[A-Z]/.test(e),message:`Al menos 1 mayúscula`},{test:e=>/[0-9]/.test(e),message:`Al menos 1 número`},{test:e=>/[!@#$%^&*(),.?":{}|<>]/.test(e),message:`Al menos 1 símbolo`}];function wt(e){mt.injectStyles(),Tt(e),Dt(e)}function Tt(e){e.innerHTML=`
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
                ${Et(``)}
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
  `}function Et(e){return Ct.map((t,n)=>{let r=t.test(e);return`
      <div class="password-requirement ${r?`valid`:`invalid`}" id="req-${n}">
        <i class="bi ${r?`bi-check-circle-fill`:`bi-circle`}"></i>
        <span>${t.message}</span>
      </div>
    `}).join(``)}function Dt(e){let t=document.getElementById(`registerForm`);document.getElementById(`registerName`),document.getElementById(`registerEmail`);let n=document.getElementById(`registerPassword`),r=document.getElementById(`registerConfirmPassword`),i=document.getElementById(`togglePassword`),a=document.getElementById(`linkLogin`);n?.addEventListener(`input`,e=>{let t=e.target.value;Ot(t),kt()}),r?.addEventListener(`input`,kt),t?.addEventListener(`submit`,async t=>{t.preventDefault(),await jt(e)}),i?.addEventListener(`click`,()=>{let e=n.type===`password`?`text`:`password`;n.type=e,r.type=e,i.innerHTML=e===`password`?`<i class="bi bi-eye"></i>`:`<i class="bi bi-eye-slash"></i>`}),a?.addEventListener(`click`,e=>{e.preventDefault(),C.navigate(`login`)})}function Ot(e){document.getElementById(`passwordRequirements`)&&Ct.forEach((t,n)=>{let r=document.getElementById(`req-${n}`);if(r){let n=t.test(e);r.className=`password-requirement ${n?`valid`:`invalid`}`,r.innerHTML=`
        <i class="bi ${n?`bi-check-circle-fill`:`bi-circle`}"></i>
        <span>${t.message}</span>
      `}})}function kt(){let e=document.getElementById(`registerPassword`).value,t=document.getElementById(`registerConfirmPassword`).value,n=document.getElementById(`confirmPasswordError`),r=document.getElementById(`registerConfirmPassword`);return t&&e!==t?(n?.classList.remove(`d-none`),r?.classList.add(`is-invalid`),!1):(n?.classList.add(`d-none`),r?.classList.remove(`is-invalid`),!0)}function At(e){return Ct.every(t=>t.test(e))}async function jt(e){let t=document.getElementById(`registerName`).value.trim(),n=document.getElementById(`registerEmail`).value.trim(),r=document.getElementById(`registerPassword`).value,i=document.getElementById(`registerConfirmPassword`).value,a=document.getElementById(`acceptTerms`).checked;if(!t||!n||!r||!i){Nt(`Por favor completa todos los campos`,`error`,e);return}if(!At(r)){Nt(`La contraseña no cumple los requisitos`,`error`,e);return}if(r!==i){Nt(`Las contraseñas no coinciden`,`error`,e);return}if(!a){Nt(`Debes aceptar los términos y condiciones`,`error`,e);return}St.loading=!0,Mt(!0);try{let i=await E.register(n,r,{full_name:t,rol:`maestro`});i.success?i.needsConfirmation?(Nt(i.message,`info`,e),setTimeout(()=>{C.navigate(`login`)},2e3)):(Nt(`¡Cuenta creada exitosamente!`,`success`,e),setTimeout(()=>{C.navigate(`programas`)},500)):Nt(i.error||`Error al registrar`,`error`,e)}catch(t){console.error(`Register error:`,t),Nt(`Error de conexión`,`error`,e)}finally{St.loading=!1,Mt(!1)}}function Mt(e){let t=document.getElementById(`btnRegister`),n=t?.querySelector(`.btn-text`),r=t?.querySelector(`.btn-loading`);t&&(t.disabled=e,e?(n?.classList.add(`d-none`),r?.classList.remove(`d-none`)):(n?.classList.remove(`d-none`),r?.classList.add(`d-none`)))}function Nt(e,t,n){let r=document.getElementById(`toastContainer`);if(!r)return;let i=`
    <div id="${`toast-`+Date.now()}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${t===`success`?`bg-success`:t===`error`?`bg-danger`:t===`info`?`bg-info`:`bg-warning`} text-white">
        <i class="bi ${t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:t===`info`?`bi-info-circle`:`bi-exclamation-triangle`} me-2"></i>
        <strong class="me-auto">${t===`success`?`Éxito`:t===`error`?`Error`:t===`info`?`Información`:`Advertencia`}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${Pt(e)}
      </div>
    </div>
  `,a=document.createElement(`div`);a.innerHTML=i;let o=a.firstElementChild;r.appendChild(o),new Ue(o,{autohide:!0,delay:3e3}).show(),o.addEventListener(`hidden.bs.toast`,()=>{o.remove()})}function Pt(e){return e?e.replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e]):``}var Ft={loading:!1,error:null};function It(e){let t=E.getUser();if(!t){e.innerHTML=`
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
  `,Lt(e)}async function Lt(e){let{renderAusenciaForm:t}=await Ge(async()=>{let{renderAusenciaForm:e}=await import(`./ausenciaForm-C_6xed81.js`);return{renderAusenciaForm:e}},__vite__mapDeps([0,1])),{renderAusenciaHistorial:n}=await Ge(async()=>{let{renderAusenciaHistorial:e}=await import(`./ausenciaHistorial-DkkvNrN2.js`);return{renderAusenciaHistorial:e}},__vite__mapDeps([2,1]));document.getElementById(`ausenciaModalBody`).innerHTML=t();let r=e.querySelector(`.card-apple:last-child`);if(r){let e=document.createElement(`div`);e.className=`mt-4`,e.innerHTML=`
      <h6 class="fw-bold mb-3">
        <i class="bi bi-clock-history me-2"></i>Historial de Ausencias
      </h6>
      <div id="ausenciaHistorialContainer"></div>
    `,r.appendChild(e),document.getElementById(`ausenciaHistorialContainer`).innerHTML=n()}e.querySelector(`#btnGuardarDatos`)?.addEventListener(`click`,Rt),e.querySelector(`#perfilPasswordForm`)?.addEventListener(`submit`,zt)}async function Rt(){let e=document.getElementById(`perfilNombre`).value.trim();if(!e){Bt(`El nombre no puede estar vacío`);return}Ft.loading=!0;let t=document.getElementById(`btnGuardarDatos`);t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;try{let{error:t}=await b.auth.updateUser({data:{full_name:e}});if(t)throw t;Vt(`Datos guardados correctamente`)}catch(e){Bt(e.message)}finally{Ft.loading=!1,t.disabled=!1,t.innerHTML=`<i class="bi bi-check-lg me-1"></i>Guardar cambios`}}async function zt(e){e.preventDefault(),document.getElementById(`passwordActual`).value;let t=document.getElementById(`passwordNueva`).value,n=document.getElementById(`passwordConfirmar`).value;if(document.getElementById(`passwordError`),t.length<8){Ht(`La contraseña debe tener al menos 8 caracteres`);return}if(t!==n){Ht(`Las contraseñas no coinciden`);return}Ft.loading=!0;let r=document.getElementById(`btnCambiarPassword`);r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Cambiando...`;try{let{error:e}=await b.auth.updateUser({password:t});if(e)throw e;document.getElementById(`perfilPasswordForm`).reset(),Vt(`Contraseña cambiada correctamente`)}catch(e){e.message.includes(`same`)?Ht(`La nueva contraseña debe ser diferente a la actual`):Ht(e.message)}finally{Ft.loading=!1,r.disabled=!1,r.innerHTML=`<i class="bi bi-key-fill me-1"></i>Cambiar contraseña`}}function Bt(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:`danger`}}))}function Vt(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:`success`}}))}function Ht(e){let t=document.getElementById(`passwordError`);t&&(t.textContent=e,t.classList.remove(`d-none`))}function Ut(){C.register(`login`,gt),C.register(`register`,wt),C.register(`perfil`,It)}Ut();function Wt(){C.register(`maestros`,Ce)}function Gt(){C.register(`programas`,Re)}var Kt=[0,86,179],qt=[255,193,7],Jt=[30,30,30],Yt=[``,`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`];function D(e,t=`—`){return String(e??``).trim()||t}function Xt(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,String(a)}catch{return`—`}}function Zt(e){return{cantar:`Cantar`,instrumento:`Instrumento`,ambas:`Ambas`}[e]??D(e)}function Qt(e,t,n){let r=e.internal.pageSize.getWidth();e.setFillColor(...Kt),e.rect(0,0,r,26,`F`),e.setFillColor(...qt),e.rect(0,26,r,2,`F`),e.setTextColor(255,255,255),e.setFontSize(14),e.setFont(`helvetica`,`bold`),e.text(`El Sistema Punta Cana`,14,10),e.setFontSize(10),e.setFont(`helvetica`,`normal`),e.text(t,14,18),e.setFontSize(7.5),e.text(n,14,24),e.setTextColor(...Jt)}function $t(e,t,n){let r=e.internal.pageSize.getWidth(),i=e.internal.pageSize.getHeight();e.setFillColor(...Kt),e.rect(0,i-8,r,8,`F`),e.setTextColor(255,255,255),e.setFontSize(6.5);let a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});e.text(`El Sistema Punta Cana — Generado: ${a}`,10,i-3),e.text(`Página ${t} de ${n}`,r-10,i-3,{align:`right`})}function en(e,t,n){let r=new Je({orientation:`landscape`,unit:`mm`,format:`letter`});r.internal.pageSize.getWidth();let i=`${Yt[n]} ${t}`,a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});Qt(r,`REPORTE DE INSCRIPCIONES — ${i.toUpperCase()}`,`Generado: ${a} · Total inscritos: ${e.length}`);let o=e.filter(e=>e.tiene_conocimientos_musicales===!0).length,s=e.filter(e=>e.tiene_conocimientos_musicales===!1||e.requiere_iniciacion_musical).length,c=e.filter(e=>e.beneficiario_subsidio_estado===!0).length,l=e.filter(e=>e.familia_monoparental===!0).length,u=e.filter(e=>e.autoriza_fotos_redes===!0).length;Ye(r,{startY:36,margin:{left:10,right:10},theme:`grid`,head:[[`Total inscritos`,`Con conocimientos`,`Requieren iniciación`,`Beneficiarios subsidio`,`Fam. monoparental`,`Autorizan fotos`]],body:[[e.length,o,s,c,l,u]],headStyles:{fillColor:Kt,textColor:255,fontStyle:`bold`,fontSize:8,halign:`center`},bodyStyles:{halign:`center`,fontSize:11,fontStyle:`bold`}}),Ye(r,{startY:r.lastAutoTable.finalY+6,margin:{left:10,right:10},theme:`striped`,head:[[`#`,`Nombre completo`,`Edad`,`Nac.`,`Municipio`,`Representante / Tlf`,`Interés`,`Instrumento`,`Iniciación`,`Pagó 600`]],body:e.map((e,t)=>[t+1,D(e.nombre_completo),Xt(e.fecha_nacimiento),D(e.nacionalidad),D(e.municipio_residencia),D(e.representante_nombre)+`
`+D(e.representante_tlf),Zt(e.interes_musical),D(e.instrumento_interes),e.requiere_iniciacion_musical?`Sí`:`No`,e.acepta_pago_600?`Sí`:`No`]),headStyles:{fillColor:Kt,textColor:255,fontStyle:`bold`,fontSize:7.5},bodyStyles:{fontSize:7,cellPadding:1.5},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:7,halign:`center`},1:{cellWidth:42},2:{cellWidth:10,halign:`center`},3:{cellWidth:14},4:{cellWidth:20},5:{cellWidth:42},6:{cellWidth:16},7:{cellWidth:22},8:{cellWidth:15,halign:`center`},9:{cellWidth:14,halign:`center`}},didDrawPage:e=>{let t=r.internal.getNumberOfPages();$t(r,e.pageNumber,t)}}),e.length>0&&(r.addPage(),Qt(r,`PERFIL SOCIOCULTURAL — ${i.toUpperCase()}`,`Información motivacional y social de los alumnos inscritos`),Ye(r,{startY:36,margin:{left:10,right:10},theme:`striped`,head:[[`#`,`Nombre`,`Colegio`,`Grado`,`Padres en vida`,`Monopar.`,`Subsidio`,`¿Por qué se unió?`,`Músico favorito`]],body:e.map((e,t)=>[t+1,D(e.nombre_completo),D(e.centro_estudios),D(e.grado_nivel),e.padres_en_vida===`ambos`?`Ambos`:e.padres_en_vida===`solo_madre`?`Solo madre`:e.padres_en_vida===`solo_padre`?`Solo padre`:e.padres_en_vida===`ninguno`?`Ninguno`:`—`,e.familia_monoparental?`Sí`:`No`,e.beneficiario_subsidio_estado?`Sí`:`No`,D(e.por_que_unirse).slice(0,80)+(D(e.por_que_unirse).length>80?`…`:``),D(e.musico_favorito)]),headStyles:{fillColor:Kt,textColor:255,fontStyle:`bold`,fontSize:7.5},bodyStyles:{fontSize:7,cellPadding:1.5},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:7,halign:`center`},1:{cellWidth:38},2:{cellWidth:38},3:{cellWidth:16},4:{cellWidth:20},5:{cellWidth:14,halign:`center`},6:{cellWidth:14,halign:`center`},7:{cellWidth:55},8:{cellWidth:28}},didDrawPage:e=>{let t=r.internal.getNumberOfPages();$t(r,e.pageNumber,t)}}));let d=r.internal.getNumberOfPages();for(let e=1;e<=d;e++)r.setPage(e),$t(r,e,d);return r}function tn(e,t,n){en(e,t,n).save(`reporte-inscripciones-${[``,`enero`,`febrero`,`marzo`,`abril`,`mayo`,`junio`,`julio`,`agosto`,`septiembre`,`octubre`,`noviembre`,`diciembre`][n]}-${t}.pdf`)}function nn(e){return De.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}function rn(e){let t=e||{};return`<form class="row g-3">
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
        ${nn(t.representante_parentesco)}
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
  </form>`}function an(){let e=e=>document.getElementById(e),t=t=>e(t)?.value?.trim()||null,n=t=>e(t)?.checked??!1,r=e=>e!==null&&e!==``?e:null;return{fecha_nacimiento:t(`ed-fecha-nacimiento`),nacionalidad:t(`ed-nacionalidad`),municipio_residencia:t(`ed-municipio`),sector_calle_numero:t(`ed-direccion`),madre_nombre:t(`ed-madre-nombre`),madre_cedula:t(`ed-madre-cedula`),madre_tlf_whatsapp:r(t(`ed-madre-tlf`)),padre_nombre:t(`ed-padre-nombre`),padre_cedula:t(`ed-padre-cedula`),padre_tlf_whatsapp:r(t(`ed-padre-tlf`)),representante_nombre:t(`ed-rep-nombre`),representante_parentesco:t(`ed-rep-parentesco`),representante_tlf:r(t(`ed-rep-tlf`)),interes_musical:t(`ed-interes`),instrumento_interes:t(`ed-instrumento`),tiene_conocimientos_musicales:n(`ed-conocimientos`),centro_estudios:t(`ed-centro-estudios`),grado_nivel:t(`ed-grado`),acepta_pago_600:n(`ed-pago-600`),autoriza_fotos_redes:n(`ed-fotos-redes`),acepta_beca_4500:n(`ed-beca-4500`)}}async function on(e,{onSaved:t}={}){let n;try{n=await Le(e)}catch{x.error(`Error al cargar datos del alumno`);return}S.open({title:`Editar: ${n.nombre_completo||`Alumno`}`,size:`xl`,saveText:`Guardar cambios`,body:rn(n),onSave:async()=>{try{await Ne(e,an()),x.success(`Alumno actualizado correctamente`),t&&t()}catch(e){return x.error(e.message||`Error al guardar los cambios`),!1}}})}var sn=[``,`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],cn=[{key:`fecha_nacimiento`,label:`Fecha de nacimiento`},{key:`nacionalidad`,label:`Nacionalidad`},{key:`municipio_residencia`,label:`Municipio de residencia`},{key:`sector_calle_numero`,label:`Dirección / Sector`},{key:`madre_nombre`,label:`Nombre de la madre`},{key:`madre_tlf_whatsapp`,label:`Teléfono de la madre`},{key:`representante_nombre`,label:`Nombre del representante`},{key:`representante_parentesco`,label:`Parentesco del representante`},{key:`representante_tlf`,label:`Teléfono del representante`},{key:`interes_musical`,label:`Interés musical`},{key:`instrumento_interes`,label:`Instrumento de interés`},{key:`centro_estudios`,label:`Centro de estudios`},{key:`acepta_pago_600`,label:`Acepta pago RD$600`},{key:`autoriza_fotos_redes`,label:`Autoriza fotos/redes`}];function ln(){let e=new Date,t=``;for(let n=0;n<24;n++){let r=new Date(e.getFullYear(),e.getMonth()-n,1),i=r.getFullYear(),a=r.getMonth()+1;t+=`<option value="${i}-${a}" ${n===0?`selected`:``}>${sn[a]} ${i}</option>`}return t}function un(e){if(!e)return null;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,a}catch{return null}}function dn(e){return e==null?!1:typeof e==`boolean`?!0:typeof e==`string`?e.trim()!==``:!0}function fn(e){let t=cn.filter(t=>!dn(e[t.key])),n=cn.length-t.length,r=Math.round(n/cn.length*100),i;return i=r===100?`completa`:r>=70?`casi_completa`:`incompleta`,{completados:n,total:cn.length,porcentaje:r,camposFaltantes:t,estado:i}}function pn(e,t){({completa:{rgb:`var(--bs-success-rgb)`,color:`var(--bs-success)`},casi_completa:{rgb:`var(--bs-warning-rgb)`,color:`var(--bs-warning)`},incompleta:{rgb:`var(--bs-danger-rgb)`,color:`var(--bs-danger)`}})[e];let n=e===`completa`?`Completa`:`${t}% — ${e===`casi_completa`?`Faltan campos`:`Incompleta`}`;return`<span class="badge border px-2 py-1"
            style="background-color: rgba(var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}-rgb), 0.12); color: var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}); border-color: rgba(var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}-rgb), 0.3) !important;">
            <i class="bi ${e===`completa`?`bi-check-circle-fill`:e===`casi_completa`?`bi-exclamation-circle-fill`:`bi-x-circle-fill`} me-1"></i>${n}
          </span>`}function mn(e){if(!e.length)return``;let t=e.length,n=e.filter(e=>fn(e).estado===`completa`).length,r=e.filter(e=>fn(e).estado===`incompleta`).length;return`
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
            <div class="fs-2 fw-bold text-warning-emphasis">${e.filter(e=>fn(e).estado===`casi_completa`).length}</div>
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
    </div>`}function hn(e){if(!e.length)return`<div class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>No hay alumnos inscritos en este período.
            </div>`;let t=e.map((e,t)=>{let{porcentaje:n,camposFaltantes:r,estado:i,completados:a,total:o}=fn(e),s=e.representante_tlf||e.madre_tlf_whatsapp||`—`,c=un(e.fecha_nacimiento),l=c===null?``:`${c} años`,u=r.length>0?`<div class="d-flex flex-wrap gap-1 mt-1">
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
            ${pn(i,n)}
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
    </div>`}function gn(e){e.addEventListener(`click`,e=>{let t=e.target.closest(`[data-alumno-id]`);if(!t)return;let n=t.dataset.alumnoId;if(!n)return;let r=t.closest(`#reporte-resultado`)?.querySelector(`#btn-filtrar`);on(n,{onSaved:()=>r?.click()})})}async function _n(e){let t=new Date,n=t.getFullYear(),r=t.getMonth()+1,i=[];async function a(t,n){let r=e.querySelector(`#reporte-resultado`);r&&(r.innerHTML=`
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Cargando inscritos de ${sn[n]} ${t}...</p>
      </div>`);try{i=await me(t,n),r&&(r.innerHTML=mn(i)+hn(i),gn(r));let a=e.querySelector(`#btn-descargar-pdf`);a&&(a.disabled=i.length===0,a.textContent=i.length>0?`Descargar PDF (${i.length} alumnos)`:`Sin inscritos`)}catch(e){console.error(e),r&&(r.innerHTML=`
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
                ${ln()}
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
    </div>`,e.querySelector(`#btn-filtrar`)?.addEventListener(`click`,()=>{let[t,i]=(e.querySelector(`#select-mes`)?.value??``).split(`-`).map(Number);t&&i&&(n=t,r=i,a(t,i))}),e.querySelector(`#btn-descargar-pdf`)?.addEventListener(`click`,()=>{try{tn(i,n,r)}catch(e){console.error(`Error generando PDF:`,e),alert(`Error al generar el PDF. Por favor intenta de nuevo.`)}}),a(n,r)}function vn(e){return{currentStep:1,totalSteps:e,maxReachedStep:e,draft:{},errors:{},submitted:!1}}function yn(e,t,n){if(e.currentStep>=e.totalSteps)return e;let r={...e.draft,...t};if(n){let{valid:t,errors:i}=n(r);if(!t)return{...e,draft:r,errors:i||{}}}let i=e.currentStep+1;return{...e,draft:r,errors:{},currentStep:i,maxReachedStep:Math.max(e.maxReachedStep,i)}}function bn(e){return e.currentStep<=1?{...e,errors:{}}:{...e,currentStep:e.currentStep-1,errors:{}}}function xn(e,t){return t<1||t>e.maxReachedStep?e:{...e,currentStep:t,errors:{}}}function Sn(e){return{...e,submitted:!0}}var Cn=`wizard-inscripcion-draft`;function wn(e){localStorage.setItem(Cn,JSON.stringify(e))}function Tn(){let e=localStorage.getItem(Cn);if(e===null)return null;try{return JSON.parse(e)}catch{return null}}function En(){localStorage.removeItem(Cn)}function Dn({currentStep:e,totalSteps:t}){let n=Math.round(e/t*100);return`
    <div class="progress mb-3" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del formulario">
      <div class="progress-bar" style="width: ${n}%">${n}%</div>
    </div>`}function On({steps:e,currentStep:t,maxReachedStep:n}){return`<ul class="nav nav-pills nav-fill mb-3 flex-wrap">${e.map((e,r)=>{let i=r+1,a=i===t,o=i<=n,s=a?`active`:``,c=o?``:`disabled aria-disabled="true"`;return`
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
        </li>`}).join(``)}</ul>`}var kn=`system_config`;async function An(e){let{data:t,error:n}=await b.from(kn).select(`value`).eq(`key`,e).single();return n?(console.warn(`Config not found:`,e),null):t?.value}async function jn(e,t){let{error:n}=await b.from(kn).upsert({key:e,value:t,updated_at:new Date().toISOString()},{onConflict:`key`});if(n)throw console.error(`Error saving config:`,n),n;return{key:e,value:t}}async function Mn(){return An(`groq_api_key`)}async function Nn(e){return jn(`groq_api_key`,e)}async function Pn(){return An(`openrouter_api_key`)}async function Fn(e){return jn(`openrouter_api_key`,e)}async function In(){return An(`preferred_ai_model`)}async function Ln(e){return jn(`preferred_ai_model`,e)}var Rn={URL_REGLAMENTO:`url_reglamento`,URL_HORARIO:`url_horario`,URL_BIENVENIDA:`url_bienvenida`};async function zn(){let[e,t,n]=await Promise.all([An(Rn.URL_REGLAMENTO),An(Rn.URL_HORARIO),An(Rn.URL_BIENVENIDA)]);return{reglamento:e,horario:t,bienvenida:n}}async function Bn({reglamento:e,horario:t,bienvenida:n}){let r=[];e!==void 0&&r.push(jn(Rn.URL_REGLAMENTO,e)),t!==void 0&&r.push(jn(Rn.URL_HORARIO,t)),n!==void 0&&r.push(jn(Rn.URL_BIENVENIDA,n)),await Promise.all(r)}var O={azul:[20,60,130],azulMedio:[40,90,170],azulClaro:[220,232,250],dorado:[198,160,20],doradoClaro:[255,245,200],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],rojo:[180,20,20],verde:[20,120,60]},Vn={id:`demo-0001-uuid`,nombre_completo:`María Gabriela Rodríguez Pérez`,fecha_nacimiento:`2013-06-15`,genero:`F`,nacionalidad:`Dominicana`,tiene_pasaporte:!1,sabe_leer:!0,sabe_escribir:!0,tlf_alumno:`8091234567`,como_se_entero:`Redes sociales`,municipio_residencia:`bavaro`,sector_calle_numero:`Bávaro, Calle Los Corales #12`,direccion:`Sector Los Corales, Bávaro, La Altagracia`,ubicacion_maps_url:`https://maps.google.com`,madre_nombre:`Carmen Pérez de Rodríguez`,madre_cedula:`001-1234567-8`,madre_tlf_whatsapp:`8097654321`,padre_nombre:`José Rafael Rodríguez`,padre_cedula:`001-9876543-2`,padre_tlf_whatsapp:`8299876543`,representante_nombre:`Carmen Pérez de Rodríguez`,representante_parentesco:`Madre`,representante_cedula:`001-1234567-8`,representante_tlf:`8097654321`,correo_representante:`carmen.perez@email.com`,otro_responsable_nombre:`José Rafael Rodríguez`,otro_responsable_cedula:`001-9876543-2`,otro_responsable_tlf:`8299876543`,contacto_emergencia_nombre:`Luisa Martínez`,contacto_emergencia_telefono:`8091112222`,beneficiario_subsidio_estado:!1,subsidio_descripcion:null,apoyo_actividades:`Disponible para apoyo en actividades los fines de semana`,instrumento_principal:`Violín`,nivel_actual:`Iniciación`,tiene_conocimientos_musicales:!1,instrumento_previo:null,nivel_lectura_musical:`Ninguno`,interes_musical:`instrumento`,instrumento_interes:`Violín`,sentimiento_musica_clasica:`Me emociona mucho y me parece muy bonita`,sentimiento_aprender_instrumento:`Estoy muy emocionada y quiero aprender rápido`,aspiracion_instrumento:`Llegar a tocar en una orquesta`,musico_favorito:`Beethoven`,preferencia_aprendizaje_musical:`Visual y auditiva`,por_que_unirse:`Siempre soñé con tocar un instrumento y El Sistema me da esa oportunidad`,alergias_descripcion:null,condicion_transmisible_desc:null,alergia_medicamento_desc:null,problemas_conducta:`no`,tiene_alergias:!1,tiene_condicion_transmisible:!1,tiene_alergia_medicamento:!1,centro_estudios:`Colegio San Juan Bosco`,grado_nivel:`5to de Primaria`,padres_en_vida:`ambos`,autoriza_fotos_redes:!0,acepta_beca_4500:!0,acepta_pago_600:!0,fecha_aceptacion_compromisos:new Date().toISOString(),requiere_iniciacion_musical:!0,familia_monoparental:!1};function k(e,t=`—`){return String(e??``).trim()||t}function Hn(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function Un(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,`${a} años`}catch{return`—`}}function A(e){return e===!0||e===`true`||e===`t`?`Sí`:e===!1||e===`false`||e===`f`?`No`:`—`}function Wn(e){return{punta_cana:`Punta Cana`,bavaro:`Bávaro`,veron:`Verón`,friusa:`Friusa`,el_cortecito:`El Cortecito`,los_corales:`Los Corales`,otro:`Otro`}[e]??k(e)}function Gn(e){return{cantar:`Cantar`,instrumento:`Instrumento`,ambas:`Ambas`}[e]??k(e)}function Kn(e){return{ambos:`Ambos`,solo_madre:`Solo madre`,solo_padre:`Solo padre`,ninguno:`Ninguno`}[e]??k(e)}function qn(e){return{no:`Sin problemas`,pocas_veces:`Pocas veces`,si:`Sí presenta`,violento:`Conducta violenta`}[e]??k(e)}function Jn(e){return`SOI-PC-${new Date().getFullYear()}-${e.id?e.id.replace(/-/g,``).slice(-8).toUpperCase():Date.now().toString(36).toUpperCase().slice(-8)}`}function Yn(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}var j=215.9,Xn=279.4,M=14;function Zn(e,t,n=``){return e.setFillColor(...O.azul),e.rect(0,0,j,32,`F`),e.setFillColor(...O.dorado),e.rect(0,32,j,2.5,`F`),e.setFillColor(...O.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...O.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,M+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,M+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...O.dorado),e.text(t,j-M,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,j-M,20,{align:`right`})),e.setTextColor(...O.grisOscuro),44}function Qn(e,t=1){e.setFillColor(...O.azul),e.rect(0,Xn-12,j,12,`F`),e.setFillColor(...O.dorado),e.rect(0,Xn-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...O.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,M+2,Xn-4.5),e.text(`Pág. ${t}`,j-M,Xn-4.5,{align:`right`})}function $n(e,t,n,r=O.azul){return e.setFillColor(...r),e.rect(M,n,j-M*2,6.5,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...O.blanco),e.text(t,M+3,n+4.4),e.setTextColor(...O.grisOscuro),n+9}function er(e,t,n,r={}){return Ye(e,{startY:n,margin:{left:M,right:M},theme:`grid`,styles:{fontSize:8,cellPadding:{top:1.8,bottom:1.8,left:3,right:3},lineColor:[210,215,225],lineWidth:.2,textColor:O.grisOscuro,font:`helvetica`},alternateRowStyles:{fillColor:O.grisClaro},columnStyles:{0:{fontStyle:`bold`,cellWidth:r.labelW??42,fillColor:O.azulClaro,textColor:O.azul},2:{fontStyle:`bold`,cellWidth:r.labelW??42,fillColor:O.azulClaro,textColor:O.azul}},body:t,...r.extra}),e.lastAutoTable.finalY+4}function tr(e,t,n,r={}){return Ye(e,{startY:n,margin:{left:M,right:M},theme:`grid`,styles:{fontSize:8,cellPadding:{top:1.8,bottom:1.8,left:3,right:3},lineColor:[210,215,225],lineWidth:.2,textColor:O.grisOscuro},columnStyles:{0:{fontStyle:`bold`,cellWidth:r.labelW??52,fillColor:O.azulClaro,textColor:O.azul}},body:t,...r.extra}),e.lastAutoTable.finalY+4}function nr(e,t,n,r){return Qn(e,r-1),e.addPage(),Zn(e,t,`Continuación · ${n}`)}function rr(e,t,n,r,i,a){return t+n>Xn-20?(a.n++,nr(e,r,i,a.n)):t}function ir(e){let t=new Je({unit:`mm`,format:`letter`}),n={n:1},r=`FICHA TÉCNICA DEL ALUMNO`,i=Zn(t,r,`Generado: ${Yn()}`);t.setFont(`helvetica`,`bold`),t.setFontSize(55),t.setTextColor(235,240,252),t.text(`USO INTERNO`,j/2,Xn/2+20,{align:`center`,angle:45}),t.setTextColor(...O.grisOscuro),t.setFillColor(...O.azulClaro),t.roundedRect(M,i,j-M*2,22,2,2,`F`),t.setFont(`helvetica`,`bold`),t.setFontSize(13),t.setTextColor(...O.azul),t.text(k(e.nombre_completo),M+4,i+8),t.setFont(`helvetica`,`normal`),t.setFontSize(8.5),t.setTextColor(...O.grisMedio);let a=[`Edad: ${Un(e.fecha_nacimiento)}`,`F. Nac.: ${Hn(e.fecha_nacimiento)}`,`Instrumento: ${k(e.instrumento_principal)}`,`Nivel: ${k(e.nivel_actual)}`].join(`    ·    `);t.text(a,M+4,i+16),t.setTextColor(...O.grisOscuro),i+=26,i=$n(t,`1 · DATOS PERSONALES`,i),i=er(t,[[`Nombre completo`,k(e.nombre_completo),`Fecha de nacimiento`,Hn(e.fecha_nacimiento)],[`Edad`,Un(e.fecha_nacimiento),`Nacionalidad`,k(e.nacionalidad)],[`Género`,k(e.genero),`Tiene pasaporte`,A(e.tiene_pasaporte)],[`Sabe leer`,A(e.sabe_leer),`Sabe escribir`,A(e.sabe_escribir)],[`Cómo se enteró`,k(e.como_se_entero),`Municipio`,Wn(e.municipio_residencia)],[`Sector / Calle`,k(e.sector_calle_numero),`Teléfono`,k(e.tlf_alumno)]],i),i=tr(t,[[`Dirección completa`,k(e.direccion)],[`Enlace Google Maps`,k(e.ubicacion_maps_url)]],i),i=rr(t,i,40,r,e.nombre_completo,n),i=$n(t,`2 · DATOS DE LA MADRE`,i),i=er(t,[[`Nombre completo`,k(e.madre_nombre),`Cédula / Pasaporte`,k(e.madre_cedula)],[`WhatsApp`,k(e.madre_tlf_whatsapp),``,``]],i),i=$n(t,`3 · DATOS DEL PADRE`,i),i=er(t,[[`Nombre completo`,k(e.padre_nombre),`Cédula / Pasaporte`,k(e.padre_cedula)],[`WhatsApp`,k(e.padre_tlf_whatsapp),``,``]],i),i=rr(t,i,60,r,e.nombre_completo,n),i=$n(t,`4 · REPRESENTANTE Y CONTACTOS`,i),i=er(t,[[`Representante`,k(e.representante_nombre),`Parentesco`,k(e.representante_parentesco)],[`Cédula`,k(e.representante_cedula),`Teléfono`,k(e.representante_tlf)],[`Correo`,k(e.correo_representante),`Fam. monoparen.`,A(e.familia_monoparental)],[`Otro responsable`,k(e.otro_responsable_nombre),`Cédula`,k(e.otro_responsable_cedula)],[`Tlf otro resp.`,k(e.otro_responsable_tlf),``,``],[`Emergencia 1`,k(e.contacto_emergencia_nombre),`Tlf`,k(e.contacto_emergencia_telefono)],[`Emergencia 2`,k(e.contacto_emergencia_2_nombre),`Tlf`,k(e.contacto_emergencia_2_telefono)]],i),i=$n(t,`5 · SITUACIÓN SOCIAL`,i),i=er(t,[[`Beneficiario subsidio`,A(e.beneficiario_subsidio_estado),`Descripción`,k(e.subsidio_descripcion)],[`Apoyo actividades`,{content:k(e.apoyo_actividades),colSpan:3}]],i,{extra:{columnStyles:{0:{fontStyle:`bold`,cellWidth:42,fillColor:O.azulClaro,textColor:O.azul},2:{fontStyle:`bold`,cellWidth:42,fillColor:O.azulClaro,textColor:O.azul}}}}),i=rr(t,i,70,r,e.nombre_completo,n),i=$n(t,`6 · PERFIL MUSICAL`,i,O.dorado),t.setFillColor(...O.doradoClaro),i=er(t,[[`Conocimientos musicales`,A(e.tiene_conocimientos_musicales),`Instrumento previo`,k(e.instrumento_previo)],[`Nivel lectura musical`,k(e.nivel_lectura_musical),`Interés`,Gn(e.interes_musical)],[`Instrumento de interés`,k(e.instrumento_interes),`Requiere iniciación`,A(e.requiere_iniciacion_musical)],[`Músico favorito`,k(e.musico_favorito),`Pref. aprendizaje`,k(e.preferencia_aprendizaje_musical)]],i),i=tr(t,[[`Por qué quiere unirse`,k(e.por_que_unirse)],[`Sentimiento música clásica`,k(e.sentimiento_musica_clasica)],[`Sentimiento al aprender`,k(e.sentimiento_aprender_instrumento)],[`Aspiración con instrumento`,k(e.aspiracion_instrumento)]],i,{labelW:55}),i=rr(t,i,50,r,e.nombre_completo,n),i=$n(t,`7 · SALUD Y CONDUCTA`,i,O.rojo),i=er(t,[[`Tiene alergias`,A(e.tiene_alergias),`Cuáles`,k(e.alergias_descripcion)],[`Cond. transmisible`,A(e.tiene_condicion_transmisible),`Cuál`,k(e.condicion_transmisible_desc)],[`Alergia medicamento`,A(e.tiene_alergia_medicamento),`Cuál`,k(e.alergia_medicamento_desc)],[`Impedimento social`,A(e.impedimento_social),`Conducta`,qn(e.problemas_conducta)]],i),i=$n(t,`8 · DATOS ESCOLARES`,i),i=er(t,[[`Centro de estudios`,k(e.centro_estudios),`Grado / Nivel`,k(e.grado_nivel)],[`Padres en vida`,Kn(e.padres_en_vida),``,``]],i),i=rr(t,i,55,r,e.nombre_completo,n),i=$n(t,`9 · COMPROMISOS Y AUTORIZACIONES`,i,O.verde),i=er(t,[[`Acepta beca RD$4,500`,A(e.acepta_beca_4500),`Acepta pago RD$600/mes`,A(e.acepta_pago_600)],[`Autoriza fotos/redes`,A(e.autoriza_fotos_redes),`Fecha compromisos`,Hn(e.fecha_aceptacion_compromisos?.slice(0,10))]],i),i=rr(t,i,45,r,e.nombre_completo,n),i+=8,t.setDrawColor(...O.grisMedio),t.setLineWidth(.3),t.line(M,i+18,M+78,i+18),t.setFont(`helvetica`,`bold`),t.setFontSize(7.5),t.setTextColor(...O.grisOscuro),t.text(`Firma del Representante`,M,i+23),t.setFont(`helvetica`,`normal`),t.setFontSize(7),t.setTextColor(...O.grisMedio),t.text(k(e.representante_nombre),M,i+27),t.text(`C.I.: ${k(e.representante_cedula)}`,M,i+31);let o=j/2+8;return t.setDrawColor(...O.grisMedio),t.line(o,i+18,j-M,i+18),t.setFont(`helvetica`,`bold`),t.setFontSize(7.5),t.setTextColor(...O.grisOscuro),t.text(`Encargado Administrativo`,o,i+23),t.setFont(`helvetica`,`normal`),t.setFontSize(7),t.setTextColor(...O.grisMedio),t.text(`El Sistema Punta Cana`,o,i+27),t.text(`Fecha: ${Yn()}`,o,i+31),Qn(t,n.n),t}function ar(e,t={}){let n=new Je({unit:`mm`,format:`letter`}),r=Jn(e),i=Yn(),a=Zn(n,`CONSTANCIA DE INSCRIPCIÓN`,`Serie: ${r}`);n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.setTextColor(...O.dorado),n.setDrawColor(...O.dorado),n.setLineWidth(.6),n.roundedRect(j-M-26,5,26,10,1,1,`S`),n.text(`ORIGINAL`,j-M-13,11.5,{align:`center`}),n.setTextColor(...O.grisOscuro),n.setLineWidth(.2),n.setFont(`helvetica`,`normal`),n.setFontSize(9.5),n.setTextColor(...O.grisMedio),n.text(`Punta Cana, ${i}`,j-M,a,{align:`right`}),a+=8,n.setFont(`helvetica`,`bold`),n.setFontSize(10.5),n.setTextColor(...O.azul),n.text(`A QUIEN PUEDA INTERESAR:`,M,a),a+=10,n.setFont(`helvetica`,`normal`),n.setFontSize(10),n.setTextColor(...O.grisOscuro);let o=k(e.nombre_completo).toUpperCase(),s=k(e.representante_nombre),c=k(e.representante_parentesco);[`Por medio de la presente, El Sistema Punta Cana hace constar que:`,``,`El/La estudiante ${o}, de ${Un(e.fecha_nacimiento)}, nacido/a el ${Hn(e.fecha_nacimiento)}, de nacionalidad ${k(e.nacionalidad)}, ha sido debidamente inscrito/a en el Programa de Formación Musical de El Sistema Punta Cana, a partir del día ${i}.`,``,e.requiere_iniciacion_musical?`El/La estudiante participará en el programa de iniciación musical, con interés en ${Gn(e.interes_musical).toLowerCase()} — instrumento asignado: ${k(e.instrumento_interes)}.`:`El/La estudiante cuenta con conocimientos musicales previos, con interés en ${Gn(e.interes_musical).toLowerCase()} — instrumento: ${k(e.instrumento_interes)}.`,``,`El representante, ${s} (${c}), ha aceptado los términos del programa, incluyendo el aporte mensual de RD$600, con pleno conocimiento de que el/la estudiante recibe una beca valorada en RD$4,500 mensuales, la cual se mantendrá mientras demuestre rendimiento, interés y asistencia notable.`].forEach(e=>{if(!e){a+=4;return}let t=n.splitTextToSize(e,j-M*2);n.text(t,M,a),a+=t.length*5.8}),a+=6,n.setFillColor(...O.azulClaro),n.setDrawColor(...O.azulMedio),n.setLineWidth(.5),n.roundedRect(M,a,j-M*2,60,3,3,`FD`),n.setFillColor(...O.azul),n.roundedRect(M,a,j-M*2,9,3,3,`F`),n.rect(M,a+5,j-M*2,4,`F`),n.setFont(`helvetica`,`bold`),n.setFontSize(9),n.setTextColor(...O.blanco),n.text(`AL PRESENTAR ESTA CONSTANCIA EN CAJA RECIBIRÁ:`,M+4,a+6.5),a+=13;let l=[[`bi-credit-card`,`✓  Tarjeta de pagos mensuales`],[`bi-calendar`,`✓  Horario de clases asignado`],[`bi-pencil`,`✓  Lista de útiles: lápiz HB, cuaderno pentagramado, borrador`],[`bi-shirt`,`✓  T-Shirt oficial de El Sistema Punta Cana`]];n.setFont(`helvetica`,`normal`),n.setFontSize(9.5),n.setTextColor(...O.azul),l.forEach(([,e])=>{n.text(e,M+5,a),a+=7}),a+=1,n.setFillColor(...O.rojo),n.roundedRect(M+3,a,j-M*2-6,8,1.5,1.5,`F`),n.setFont(`helvetica`,`bold`),n.setFontSize(8.5),n.setTextColor(...O.blanco),n.text(`PAGO OBLIGATORIO: RD$600 en caja al retirar los materiales`,M+(j-M*2)/2,a+5.2,{align:`center`}),a+=16;let u=[t.horario&&{icon:`📅`,label:`Consultar horario de clases:`,url:t.horario},t.reglamento&&{icon:`📋`,label:`Reglamento / Manual de convivencia:`,url:t.reglamento},t.bienvenida&&{icon:`⭐`,label:`Manual de bienvenida al programa:`,url:t.bienvenida}].filter(Boolean);u.length>0?(n.setFont(`helvetica`,`bold`),n.setFontSize(9),n.setTextColor(...O.azul),n.text(`Recursos digitales para el representante:`,M,a),a+=6,u.forEach(({icon:e,label:t,url:r})=>{n.setFont(`helvetica`,`bold`),n.setFontSize(8.5),n.setTextColor(...O.grisOscuro),n.text(`${e}  ${t}`,M+2,a),a+=5,n.setFont(`helvetica`,`normal`),n.setFontSize(8),n.setTextColor(...O.azulMedio);let i=n.splitTextToSize(r,j-M*2-10);n.textWithLink(i[0],M+6,a,{url:r}),a+=7}),a+=2):(n.setFont(`helvetica`,`italic`),n.setFontSize(8),n.setTextColor(...O.grisMedio),n.text(`Los recursos digitales serán comunicados por el coordinador del programa.`,M,a),a+=8),a>Xn-55&&(Qn(n,1),n.addPage(),a=Zn(n,`CONSTANCIA DE INSCRIPCIÓN (cont.)`,`Serie: ${r}`)),a+=6,n.setDrawColor(...O.grisMedio),n.setLineWidth(.3),n.setTextColor(...O.grisOscuro),n.line(M,a+20,M+80,a+20),n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.text(`Encargado Administrativo`,M,a+25),n.setFont(`helvetica`,`normal`),n.setFontSize(7.5),n.setTextColor(...O.grisMedio),n.text(`El Sistema Punta Cana`,M,a+29),n.text(i,M,a+33);let d=j/2+6;return n.setTextColor(...O.grisOscuro),n.line(d,a+20,j-M,a+20),n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.text(`Firma del Representante`,d,a+25),n.setFont(`helvetica`,`normal`),n.setFontSize(7.5),n.setTextColor(...O.grisMedio),n.text(k(e.representante_nombre),d,a+29),n.text(`C.I.: ${k(e.representante_cedula)}`,d,a+33),n.setFont(`helvetica`,`normal`),n.setFontSize(6.5),n.setTextColor(170,170,170),n.text(`Serie: ${r}`,j-M,Xn-15,{align:`right`}),Qn(n,1),n}function or(e){let t=ir(e),n=(e.nombre_completo??`alumno`).toLowerCase().replace(/\s+/g,`-`);t.save(`ficha-${n}.pdf`)}async function sr(e){let t={};try{t=await zn()}catch{}let n=ar(e,t),r=(e.nombre_completo??`alumno`).toLowerCase().replace(/\s+/g,`-`);n.save(`constancia-${r}.pdf`)}function cr(){or(Vn)}async function lr(){await sr(Vn)}var ur={postulado:[`contactado`,`descartado`],contactado:[`cita_agendada`,`descartado`],cita_agendada:[`documentos_ok`,`no_show`,`descartado`],no_show:[`reprogramado`,`descartado`],reprogramado:[`cita_agendada`,`descartado`],documentos_ok:[`inscrito`,`en_espera`],en_espera:[`cita_agendada`,`descartado`],inscrito:[],descartado:[]},dr={postulado:`Postulado`,contactado:`Contactado`,cita_agendada:`Cita agendada`,documentos_ok:`Documentos OK`,inscrito:`Inscrito`,no_show:`No show`,reprogramado:`Reprogramado`,en_espera:`En espera`,descartado:`Descartado`},fr={postulado:`secondary`,contactado:`info`,cita_agendada:`primary`,documentos_ok:`warning`,inscrito:`success`,no_show:`danger`,reprogramado:`warning`,en_espera:`secondary`,descartado:`dark`};function pr(e,t){if(!e||!t)return!1;let n=ur[e];return n?n.includes(t):!1}function mr(e,t,n={}){if(!e)throw Error(`El postulante es requerido para aplicar la transición`);let r=e.estado||`postulado`;if(!pr(r,t))throw Error(`Transición inválida: no se puede pasar del estado "${r}" al estado "${t}"`);let i={...e,estado:t};return n.fecha_cita!==void 0&&(i.fecha_cita=n.fecha_cita),n.notas_seguimiento!==void 0&&(i.notas_seguimiento?i.notas_seguimiento=`${i.notas_seguimiento}\n${n.notas_seguimiento}`.trim():i.notas_seguimiento=n.notas_seguimiento),n.alumno_id!==void 0&&(i.alumno_id=n.alumno_id),t===`contactado`&&(i.fecha_contacto=new Date().toISOString()),i}async function hr(e){let{data:t,error:n}=await b.from(`postulantes`).select(`*`).eq(`id`,e).maybeSingle();if(n)throw console.error(`[postuladosSupabase] Error al obtener postulante:`,n),Error(`Error al obtener postulante: ${n.message}`);return t}async function gr(e,t,n={}){try{let r=await hr(e);if(!r)throw Error(`Postulante con ID ${e} no encontrado`);let i=r.estado||`postulado`;if(!pr(i,t))throw Error(`Transición inválida: No se puede pasar de "${i}" a "${t}"`);let a={estado:t};n.fecha_cita!==void 0&&(a.fecha_cita=n.fecha_cita),n.notas_seguimiento!==void 0&&(r.notes||r.notas_seguimiento?a.notas_seguimiento=`${r.notas_seguimiento||r.notes||``}\n${n.notas_seguimiento}`.trim():a.notas_seguimiento=n.notas_seguimiento),n.alumno_id!==void 0&&(a.alumno_id=n.alumno_id),t===`contactado`&&(a.fecha_contacto=new Date().toISOString());let{data:o,error:s}=await b.from(`postulantes`).update(a).eq(`id`,e).select().single();if(s)throw console.error(`[postuladosSupabase] Error en update:`,s),s;return o}catch(e){throw console.error(`[postuladosSupabase] Error al actualizar estado:`,e.message),e}}async function _r(e,t){try{let n=new Date(e,t-1,1).toISOString(),r=new Date(e,t,1).toISOString(),{data:i,error:a}=await b.from(`postulantes`).select(`*`).gte(`created_at`,n).lt(`created_at`,r).order(`created_at`,{ascending:!1});if(a)throw console.error(`[postuladosSupabase] Error al listar por mes:`,a),a;return i??[]}catch(e){throw console.error(`[postuladosSupabase] Error en listarPostulantesPorMes:`,e.message),e}}async function vr(e,t){try{let{data:n,error:r}=await b.from(`postulantes`).select(`*`).gte(`fecha_cita`,e).lte(`fecha_cita`,t).not(`fecha_cita`,`is`,null).order(`fecha_cita`,{ascending:!0});if(r)throw console.error(`[postuladosSupabase] Error al listar citas:`,r),r;return n??[]}catch(e){throw console.error(`[postuladosSupabase] Error en listarCitas:`,e.message),e}}async function yr(e,t=null){try{let n=new Date(e).getTime();if(isNaN(n))throw Error(`Fecha/Hora de cita inválida`);let r=new Date(n-1800*1e3).toISOString(),i=new Date(n+1800*1e3).toISOString(),a=b.from(`postulantes`).select(`id, nombre_completo, fecha_cita`).gte(`fecha_cita`,r).lte(`fecha_cita`,i).not(`fecha_cita`,`is`,null);t&&(a=a.ne(`id`,t));let{data:o,error:s}=await a;if(s)throw console.error(`[postuladosSupabase] Error al verificar conflicto de cita:`,s),s;return(o??[]).length>0}catch(e){throw console.error(`[postuladosSupabase] Error en hayConflictoCita:`,e.message),e}}async function br(e,t){try{if(!t||!t.trim())return;let n=await hr(e);if(!n)throw Error(`Postulante con ID ${e} no encontrado`);let r=n.notas_seguimiento||n.notes||``,i=r?`${r}\n${t}`.trim():t.trim(),{data:a,error:o}=await b.from(`postulantes`).update({notas_seguimiento:i}).eq(`id`,e).select().single();if(o)throw console.error(`[postuladosSupabase] Error al agregar nota:`,o),o;return a}catch(e){throw console.error(`[postuladosSupabase] Error en agregarNota:`,e.message),e}}async function xr(e){try{let{error:t}=await b.from(`postulantes`).delete().eq(`id`,e);if(t)throw console.error(`[postuladosSupabase] Error al eliminar postulante:`,t),t;return!0}catch(e){throw console.error(`[postuladosSupabase] Error en eliminarPostulante:`,e.message),e}}var Sr=e({actualizarEstadoPostulante:()=>gr,agregarNota:()=>br,backfillDesdePostulantes:()=>Or,buscarPostulante:()=>wr,eliminarPostulante:()=>xr,hayConflictoCita:()=>yr,listarCitas:()=>vr,listarPostulantes:()=>Dr,listarPostulantesPorMes:()=>_r,obtenerPostulante:()=>Tr,sincronizarPostulantes:()=>Er});function Cr(e){return(e??``).toLowerCase().replace(/\s+/g,` `).trim()}async function wr(e){let t=Cr(e);if(!t||t.length<2)return[];let{data:n,error:r}=await b.from(`postulantes`).select(`*`).or(`nombre_completo.ilike.*${t}*,telefono_alumno.ilike.*${t}*,madre_tlf_whatsapp.ilike.*${t}*,padre_tlf_whatsapp.ilike.*${t}*`).limit(20);if(r)throw console.error(`[postulantesSupabase] Error searching:`,r),r;let i=new Set;return(n??[]).filter(e=>{let t=`${e.nombre_completo||``}|${e.correo||``}`;return i.has(t)?!1:(i.add(t),!0)})}async function Tr(e){let{data:t,error:n}=await b.from(`postulantes`).select(`*`).eq(`id`,e).maybeSingle();if(n)throw console.error(`[postulantesSupabase] Error fetching:`,n),n;return t}async function Er(){let{data:e,error:t}=await b.functions.invoke(`sync-postulantes`,{method:`POST`});if(t){console.error(`[postulantesSupabase] Error syncing:`,t);let e=t.context?.status??0,n=t.context?.body??{},r=Error(n?.error||t.message||`Error al sincronizar`);throw r.status=e,r}return e}async function Dr(){let{data:e,error:t}=await b.from(`postulantes`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw console.error(`[postulantesSupabase] Error listing:`,t),t;return e??[]}async function Or(e=!1){let{data:t,error:n}=await b.rpc(`backfill_alumnos_desde_postulantes`,{dry_run:e});if(n)throw console.error(`[postulantesSupabase] Error backfilling:`,n.message),Error(`Error al backfillear: ${n.message}`);return{success:!0,data:t??[],dry_run:e}}var kr=[{id:`post-001`,nombre_completo:`Marcos Merone Cocco`,fecha_nacimiento:`2015-08-30`,telefono_alumno:`8295577722`,correo:`elisabetta.cocco@hotmail.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Avenida real norte MC1-10-b`,madre_nombre:`Elisabetta Cocco`,madre_tlf_whatsapp:`8295577722`,padre_nombre:`Esnor Merone`,padre_tlf_whatsapp:``,representante_parentesco:`ambos`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-002`,nombre_completo:`Ana Pérez Guerrero`,fecha_nacimiento:`2017-03-15`,telefono_alumno:`8091112233`,correo:`ana.perez@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Los Robles #45`,madre_nombre:`María Guerrero`,madre_tlf_whatsapp:`8091112233`,padre_nombre:`Juan Pérez`,padre_tlf_whatsapp:`8091112234`,representante_parentesco:`madre`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Fines de semana`,tiene_transporte:!0,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-003`,nombre_completo:`Luis Gómez Rodríguez`,fecha_nacimiento:`2016-11-22`,telefono_alumno:`8297778899`,correo:`luis.gomez@example.com`,nacionalidad:`Venezolana`,sector_calle_numero:`Residencial Punta Cana, Edif 3 Apto 2B`,madre_nombre:`Carmen Rodríguez`,madre_tlf_whatsapp:`8297778899`,padre_nombre:`Pedro Gómez`,padre_tlf_whatsapp:``,representante_parentesco:`madre`,acepta_pago_600:!1,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!1,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-004`,nombre_completo:`María José López`,fecha_nacimiento:`2014-06-10`,telefono_alumno:`8493334455`,correo:`maria.lopez@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Principal #12, Verón`,madre_nombre:`Sofía López`,madre_tlf_whatsapp:`8493334455`,padre_nombre:`Carlos López`,padre_tlf_whatsapp:`8493334456`,representante_parentesco:`ambos`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Tardes después de las 3pm`,tiene_transporte:!0,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-005`,nombre_completo:`Juan García Marte`,fecha_nacimiento:`2018-01-05`,telefono_alumno:`8095556677`,correo:`juan.garcia@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Las Palmas #7, Bavaro`,madre_nombre:`Ana Marte`,madre_tlf_whatsapp:`8095556677`,padre_nombre:`Roberto García`,padre_tlf_whatsapp:``,representante_parentesco:`madre`,acepta_pago_600:!0,autoriza_fotos_redes:!1,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`}],Ar=(e=50)=>new Promise(t=>setTimeout(t,e)),N=[...kr];function jr(){N=[...kr]}async function Mr(e,t,n={}){await Ar();let r=N.findIndex(t=>t.id===e);if(r===-1)throw Error(`Postulante con ID ${e} no encontrado`);let i=N[r],a=mr(i,t,n);return N[r]=a,a}async function Nr(e,t){return await Ar(),N.filter(n=>{if(!n.created_at)return!1;let r=new Date(n.created_at);return r.getFullYear()===e&&r.getMonth()+1===t})}async function Pr(e,t){await Ar();let n=new Date(e).getTime(),r=new Date(t).getTime();return N.filter(e=>{if(!e.fecha_cita)return!1;let t=new Date(e.fecha_cita).getTime();return t>=n&&t<=r}).sort((e,t)=>new Date(e.fecha_cita)-new Date(t.fecha_cita))}async function Fr(e,t=null){await Ar();let n=new Date(e).getTime();if(isNaN(n))throw Error(`Fecha/Hora de cita inválida`);return N.some(e=>{if(t&&e.id===t||!e.fecha_cita||e.estado!==`cita_agendada`&&e.estado!==`reprogramado`)return!1;let r=new Date(e.fecha_cita).getTime();return Math.abs(r-n)<=18e5})}async function Ir(e,t){await Ar();let n=N.findIndex(t=>t.id===e);if(n===-1)throw Error(`Postulante con ID ${e} no encontrado`);let r=N[n],i=r.notas_seguimiento||r.notes||``,a=i?`${i}\n${t}`.trim():t.trim(),o={...r,notas_seguimiento:a};return N[n]=o,o}async function Lr(e){await Ar();let t=N.findIndex(t=>t.id===e);if(t===-1)throw Error(`Postulante con ID ${e} no encontrado`);return N.splice(t,1),!0}var Rr=e({actualizarEstadoPostulante:()=>Mr,agregarNota:()=>Ir,backfillDesdePostulantes:()=>Gr,buscarPostulante:()=>Vr,data:()=>N,eliminarPostulante:()=>Lr,hayConflictoCita:()=>Fr,listarCitas:()=>Pr,listarPostulantes:()=>Wr,listarPostulantesPorMes:()=>Nr,obtenerPostulante:()=>Hr,resetMockData:()=>jr,sincronizarPostulantes:()=>Ur}),zr=(e=300)=>new Promise(t=>setTimeout(t,e));function Br(e){return(e??``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/\s+/g,` `).trim()}async function Vr(e){await zr();let t=Br(e);return!t||t.length<2?[]:N.filter(e=>{let n=Br(e.nombre_completo),r=Br(e.telefono_alumno),i=Br(e.madre_tlf_whatsapp),a=Br(e.padre_tlf_whatsapp);return n.includes(t)||r.includes(t)||i.includes(t)||a.includes(t)})}async function Hr(e){return await zr(100),N.find(t=>t.id===e)??null}async function Ur(){return await zr(500),{status:`success`,total_rows:N.length,upserted:N.length,errors:0,timestamp:new Date().toISOString(),_mock:!0}}async function Wr(){return await zr(),[...N]}async function Gr(e=!1){await zr(400);let t=N.filter(e=>e.estado!==`inscrito`).map(t=>({alumno_id:`mock-`+t.id,alumno_nombre:t.nombre_completo,postulante_id:t.id,postulante_nombre:t.nombre_completo,match_tipo:`email`,campos_llenados:5,accion:e?`preview`:`updated`}));return e||t.forEach(e=>{let t=N.findIndex(t=>t.id===e.postulante_id);t!==-1&&(N[t]={...N[t],estado:`inscrito`,alumno_id:e.alumno_id})}),{success:!0,data:t,dry_run:e}}var P=()=>v.isDemoMode?Rr:Sr,Kr=(...e)=>P().buscarPostulante(...e),qr=(...e)=>P().obtenerPostulante(...e),Jr=(...e)=>P().sincronizarPostulantes(...e),Yr=(...e)=>P().backfillDesdePostulantes(...e),Xr=(...e)=>P().actualizarEstadoPostulante(...e),Zr=(...e)=>P().listarPostulantesPorMes(...e),Qr=(...e)=>P().listarCitas(...e),$r=(...e)=>P().hayConflictoCita(...e),ei=(...e)=>P().agregarNota(...e),ti=(...e)=>P().eliminarPostulante(...e);function ni(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`})}catch{return`—`}}function ri(e){return e.estado===`inscrito`?`<span class="badge bg-success-subtle text-success-emphasis"><i class="bi bi-check-circle-fill me-1"></i>Inscrito</span>`:`<span class="badge bg-warning-subtle text-warning-emphasis"><i class="bi bi-clock me-1"></i>Pendiente</span>`}function ii(e){return new Promise(t=>{if((()=>{try{return JSON.parse(localStorage.getItem(`wizard-inscripcion-draft`)||`null`)}catch{return null}})()?._postulante_id){t(null);return}let n=`pendiente`;e.innerHTML=`
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
        </div>`;try{let r=await Kr(e);if(n===`pendiente`&&(r=r.filter(e=>e.estado!==`inscrito`)),!r.length){o.innerHTML=`
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
                  ${ri(e)}
                </div>

                <div class="small text-muted d-flex flex-wrap gap-3">
                  ${r?`<span><i class="bi bi-calendar3 me-1"></i>${ni(r)}</span>`:``}
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
          </div>`}}i.addEventListener(`click`,()=>c()),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&c()}),a.addEventListener(`click`,()=>t(null));let l=e.querySelector(`#preload-btn-sync`),u=e.querySelector(`#preload-sync-panel`),d=e.querySelector(`#preload-btn-sync-confirm`),f=e.querySelector(`#preload-sync-result`);l.addEventListener(`click`,()=>{u.classList.toggle(`d-none`),f.innerHTML=``});let p=e.querySelector(`#preload-btn-backfill`),m=e.querySelector(`#preload-backfill-panel`),h=e.querySelector(`#preload-btn-backfill-run`),g=e.querySelector(`#preload-btn-backfill-preview`),ee=e.querySelector(`#preload-backfill-result`);p.addEventListener(`click`,()=>{m.classList.toggle(`d-none`),ee.innerHTML=``});async function te(e){h.disabled=!0,g.disabled=!0,ee.innerHTML=`
        <div class="text-center py-2">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span class="ms-2 small">${e?`Previsualizando`:`Ejecutando`}...</span>
        </div>`;try{let t=await Yr(e),n=t.data.length,r=t.data.filter(e=>e.campos_llenados>0).length,i=t.data.reduce((e,t)=>e+t.campos_llenados,0);if(e){ee.innerHTML=`
            <div class="alert alert-info py-2 mb-0 small">
              <i class="bi bi-eye me-1"></i>
              <strong>Previsualización:</strong> ${n} alumnos coinciden con postulantes.
              ${r} tendrían campos por llenar (${i} campos en total).
              ${n>0?`<br><button id="preload-btn-backfill-confirm" class="btn btn-primary btn-sm mt-2"><i class="bi bi-play-fill me-1"></i>Confirmar y ejecutar</button>`:``}
            </div>
            ${ne(t.data)}`;let e=ee.querySelector(`#preload-btn-backfill-confirm`);e&&e.addEventListener(`click`,()=>te(!1))}else{let e=t.data.filter(e=>e.accion===`updated`).length;ee.innerHTML=`
            <div class="alert alert-success py-2 mb-0 small">
              <i class="bi bi-check-circle me-1"></i>
              <strong>Backfill completado:</strong> ${e} alumnos actualizados
              (${i} campos llenados de ${n} coincidencias).
            </div>
            ${ne(t.data)}`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Backfill: ${e} alumnos actualizados, ${i} campos llenados`,type:`success`}}))}}catch(e){ee.innerHTML=`
          <div class="alert alert-danger py-2 mb-0 small">
            <i class="bi bi-exclamation-triangle me-1"></i>
            ${e.message||`Error al ejecutar backfill`}
          </div>`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error en backfill: `+(e.message||`desconocido`),type:`danger`}}))}finally{h.disabled=!1,g.disabled=!1}}function ne(e){return e.length?`
        <div class="table-responsive mt-2" style="max-height:250px;overflow-y:auto">
          <table class="table table-sm table-striped mb-0 small">
            <thead class="table-light"><tr>
              <th>Alumno</th><th>Postulante</th><th>Match</th><th class="text-center">Campos</th><th>Acción</th>
            </tr></thead>
            <tbody>${e.map(e=>`
        <tr>
          <td class="text-truncate" title="${re(e.alumno_nombre)}">${re(e.alumno_nombre)}</td>
          <td class="text-truncate" title="${re(e.postulante_nombre)}">${re(e.postulante_nombre)}</td>
          <td><span class="badge bg-${e.match_tipo===`email`?`primary`:`secondary`}">${e.match_tipo}</span></td>
          <td class="text-center">${e.campos_llenados}</td>
          <td>${e.accion===`preview`?`<span class="text-info">Previo</span>`:`<span class="text-success">Actualizado</span>`}</td>
        </tr>`).join(``)}</tbody>
          </table>
        </div>`:``}function re(e){if(!e)return`—`;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}h.addEventListener(`click`,()=>te(!1)),g.addEventListener(`click`,()=>te(!0)),d.addEventListener(`click`,async()=>{d.disabled=!0,d.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Sincronizando...`;try{let e=await Jr();f.innerHTML=`
          <div class="alert alert-success py-2 mb-0">
            <i class="bi bi-check-circle me-1"></i>
            ${e.upserted} registros sincronizados (${e.total_rows} total). 0 errores.
          </div>`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Postulantes sincronizados: ${e.upserted} registros`,type:`success`}}))}catch(e){let t=e.status===401?`No tienes permisos de administrador para sincronizar.`:e.message||`Error al sincronizar`;f.innerHTML=`
          <div class="alert alert-danger py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i>${t}
          </div>`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:t,type:`danger`}}))}finally{d.disabled=!1,d.innerHTML=`<i class="bi bi-check2-circle me-1"></i>Sincronizar ahora`}})})}function ai({currentStep:e,totalSteps:t,title:n,content:r,canGoPrev:i,canGoNext:a,isLastStep:o,isLastRequiredStep:s,isLastOptionalStep:c,isOptionalStep:l,steps:u,maxReachedStep:d}){return`
    <div class="wizard-inscripcion container-fluid py-3">
      ${Dn({currentStep:e,totalSteps:t})}
      ${On({steps:u,currentStep:e,maxReachedStep:d})}
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
    </div>`}function oi(e,t,n,r){let i=r??t.length,a=Tn(),o=vn(t.length);a&&(o={...o,draft:a});function s(){return t[o.currentStep-1]}function c(){let n=s(),r=o.currentStep,a=n.render(o.draft);e.innerHTML=ai({currentStep:r,totalSteps:o.totalSteps,title:n.title,content:a,canGoPrev:r>1,canGoNext:!0,isLastStep:r===o.totalSteps,isLastRequiredStep:r===i,isLastOptionalStep:r===o.totalSteps&&r>i,isOptionalStep:r>i&&r<o.totalSteps,steps:t.map((e,t)=>({id:e.id,title:e.title,optional:t>=i})),maxReachedStep:o.maxReachedStep}),u()}async function l(t){t&&(t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`);try{let t=s().getState(e);o={...o,draft:{...o.draft,...t}};let r=await n({...o.draft,fecha_aceptacion_compromisos:new Date().toISOString()}),i=o.draft._postulante_id;if(i&&r?.id)try{await b.from(`postulantes`).update({estado:`inscrito`,alumno_id:r.id}).eq(`id`,i)}catch(e){console.warn(`[Wizard] Could not update postulante estado:`,e.message)}En(),o=Sn(o);let a={...o.draft,...r??{}};e.innerHTML=`
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
        </div>`,e.querySelector(`#btn-pdf-ficha`)?.addEventListener(`click`,()=>{try{or(a)}catch(e){console.error(`Error generando ficha:`,e)}}),e.querySelector(`#btn-pdf-constancia`)?.addEventListener(`click`,()=>{try{sr(a)}catch(e){console.error(`Error generando constancia:`,e)}})}catch{t&&(t.disabled=!1,t.innerHTML=t.dataset.label??`Finalizar`);let n=e.querySelector(`#wizard-step-slot`);if(n){let e=document.createElement(`div`);e.className=`alert alert-danger mt-3`,e.textContent=`Error al guardar. Por favor intenta de nuevo.`,n.after(e)}}}function u(){let t=e.querySelector(`#wiz-btn-prev`),n=e.querySelector(`#wiz-btn-next`),r=e.querySelector(`#wiz-btn-submit`),i=e.querySelector(`#wiz-btn-submit-basic`),a=e.querySelector(`#wiz-btn-draft`);t&&t.addEventListener(`click`,()=>{o=bn(o),c()}),n&&n.addEventListener(`click`,()=>{let t=s().getState(e);o=yn(o,t),wn(o.draft),c()}),r&&(r.dataset.label=r.textContent,r.addEventListener(`click`,()=>l(r))),i&&(i.dataset.label=i.textContent,i.addEventListener(`click`,()=>l(i))),a&&a.addEventListener(`click`,()=>{let t=s().getState(e);o={...o,draft:{...o.draft,...t}},wn(o.draft),a.textContent=`¡Guardado!`,setTimeout(()=>{a.innerHTML=`<i class="bi bi-floppy"></i> Guardar borrador`},1500)}),e.querySelectorAll(`[data-step]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-step`),10),r=s().getState(e);o={...o,draft:{...o.draft,...r}},wn(o.draft),o=xn(o,n),c()})})}return ii(e).then(e=>{e&&(o={...o,draft:{...o.draft,...e}}),c()}),{destroy(){e.innerHTML=``}}}function si(e){return String(e??``).replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function F(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function I(e){let{name:t,label:n,type:r=`text`,value:i=``,error:a=``,required:o=!1,placeholder:s=``,hint:c=``,options:l=[],readOnly:u=!1}=e,d=`wiz-${t}`,f=o?`required`:``,p=u?`readonly`:``,m=a?`is-invalid`:``,h=a?`<div class="invalid-feedback">${F(a)}</div>`:``,g=c?`<div class="form-text">${F(c)}</div>`:``;if(r===`select`){let e=l.map(e=>`<option value="${si(e.value)}"${i===e.value?` selected`:``}>${F(e.label)}</option>`).join(``);return`
      <div class="mb-3">
        <label for="${d}" class="form-label">${F(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        <select id="${d}" name="${t}" class="form-select ${m}" ${f}>
          <option value="">Selecciona una opción</option>
          ${e}
        </select>
        ${h}${g}
      </div>`}if(r===`radio`){let e=l.map(e=>`
        <div class="form-check">
          <input class="form-check-input ${m}" type="radio" name="${t}" id="${d}-${si(e.value)}" value="${si(e.value)}"${i===e.value?` checked`:``} ${f}>
          <label class="form-check-label" for="${d}-${si(e.value)}">${F(e.label)}</label>
        </div>`).join(``);return`
      <div class="mb-3">
        <label class="form-label">${F(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        ${e}
        ${a?`<div class="text-danger small">${F(a)}</div>`:``}
        ${g}
      </div>`}return r===`checkbox`?`
      <div class="mb-3 form-check">
        <input class="form-check-input ${m}" type="checkbox" id="${d}" name="${t}"${i===!0||i===`true`?` checked`:``}>
        <label class="form-check-label" for="${d}">${F(n)}</label>
        ${h}${g}
      </div>`:r===`textarea`?`
      <div class="mb-3">
        <label for="${d}" class="form-label">${F(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        <textarea id="${d}" name="${t}" class="form-control ${m}" placeholder="${si(s)}" ${f} ${p} rows="3">${F(i)}</textarea>
        ${h}${g}
      </div>`:`
    <div class="mb-3">
      <label for="${d}" class="form-label">${F(n)}${o?` <span class="text-danger">*</span>`:``}</label>
      <input
        type="${si(r)}"
        id="${d}"
        name="${t}"
        class="form-control ${m}"
        value="${si(i)}"
        placeholder="${si(s)}"
        ${f}
        ${p}
      >
      ${h}${g}
    </div>`}var ci=/^https?:\/\/(www\.)?google\.com\/maps|^https?:\/\/goo\.gl\/maps/;function li(e){return{valid:Object.keys(e).length===0,errors:e}}function ui(e){let t={};if((!e.nombre_completo||!e.nombre_completo.trim())&&(t.nombre_completo=`El nombre completo es requerido`),!e.fecha_nacimiento)t.fecha_nacimiento=`La fecha de nacimiento es requerida`;else{let n=new Date(e.fecha_nacimiento);isNaN(n.getTime())?t.fecha_nacimiento=`Fecha de nacimiento inválida`:n>new Date&&(t.fecha_nacimiento=`La fecha de nacimiento no puede ser en el futuro`)}return(!e.nacionalidad||!e.nacionalidad.trim())&&(t.nacionalidad=`La nacionalidad es requerida`),(!e.como_se_entero||!e.como_se_entero.trim())&&(t.como_se_entero=`Este campo es requerido`),(!e.direccion||!e.direccion.trim())&&(t.direccion=`La dirección es requerida`),e.ubicacion_maps_url&&e.ubicacion_maps_url.trim()&&(ci.test(e.ubicacion_maps_url.trim())||(t.ubicacion_maps_url=`URL debe ser de Google Maps`)),li(t)}function di(e,t=new Date){if(!e)throw Error(`fechaNacimiento is required`);let n=new Date(e);if(isNaN(n.getTime()))throw Error(`Invalid date: "${e}"`);if(n>t)throw Error(`fechaNacimiento cannot be in the future`);let r=t.getFullYear()-n.getFullYear(),i=t.getMonth()-n.getMonth(),a=t.getDate()-n.getDate();return(i<0||i===0&&a<0)&&--r,r}var fi=e({getState:()=>_i,id:()=>pi,render:()=>hi,title:()=>mi,validate:()=>gi}),pi=`step1`,mi=`Datos del Alumno`;function hi(e,t={}){let n=e.fecha_nacimiento?(()=>{try{return di(e.fecha_nacimiento)}catch{return``}})():``;return`
    <form id="wiz-form-step1" novalidate>
      ${I({name:`nombre_completo`,label:`Nombre completo del alumno`,type:`text`,value:e.nombre_completo??``,error:t.nombre_completo??``,required:!0,hint:`Tal como aparece en el documento de identidad`})}

      <div class="row g-2">
        <div class="col-sm-8">
          ${I({name:`fecha_nacimiento`,label:`Fecha de nacimiento`,type:`date`,value:e.fecha_nacimiento??``,error:t.fecha_nacimiento??``,required:!0})}
        </div>
        <div class="col-sm-4">
          ${I({name:`edad_display`,label:`Edad actual`,type:`text`,value:n===``?`—`:n+` años`,readOnly:!0})}
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6">
          ${I({name:`sabe_leer`,label:`¿Sabe leer?`,type:`radio`,value:e.sabe_leer===!0?`true`:e.sabe_leer===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
        </div>
        <div class="col-6">
          ${I({name:`sabe_escribir`,label:`¿Sabe escribir?`,type:`radio`,value:e.sabe_escribir===!0?`true`:e.sabe_escribir===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
        </div>
      </div>

      <div class="row g-2">
        <div class="col-sm-8">
          ${I({name:`nacionalidad`,label:`Nacionalidad`,type:`text`,value:e.nacionalidad??``,error:t.nacionalidad??``,required:!0})}
        </div>
        <div class="col-sm-4">
          ${I({name:`tiene_pasaporte`,label:`¿Tiene pasaporte?`,type:`checkbox`,value:e.tiene_pasaporte??!1})}
        </div>
      </div>

      ${I({name:`como_se_entero`,label:`¿Cómo se enteró de El Sistema Punta Cana?`,type:`select`,value:e.como_se_entero??``,error:t.como_se_entero??``,required:!0,options:[{value:``,label:`Selecciona una opción...`},{value:`amigo_familiar`,label:`Un amigo o familiar`},{value:`redes_sociales`,label:`Redes sociales`},{value:`colegio`,label:`Colegio / Escuela`},{value:`iglesia`,label:`Iglesia`},{value:`vecino`,label:`Un vecino`},{value:`otro`,label:`Otro`}]})}

      ${I({name:`municipio_residencia`,label:`Municipio de residencia`,type:`select`,value:e.municipio_residencia??``,error:t.municipio_residencia??``,required:!0,options:[{value:``,label:`Selecciona...`},{value:`punta_cana`,label:`Punta Cana`},{value:`bavaro`,label:`Bávaro`},{value:`veron`,label:`Verón`},{value:`friusa`,label:`Friusa`},{value:`el_cortecito`,label:`El Cortecito`},{value:`los_corales`,label:`Los Corales`},{value:`otro`,label:`Otro sector / municipio`}]})}

      <div id="sector-calle-block" style="${e.municipio_residencia===`otro`?``:`display:none`}">
        ${I({name:`sector_calle_numero`,label:`Sector, Calle y Número`,type:`text`,value:e.sector_calle_numero??``,error:t.sector_calle_numero??``,hint:`Ej: Sector Los Pinos, Calle 3, #14`})}
      </div>

      ${I({name:`direccion`,label:`Dirección completa`,type:`textarea`,value:e.direccion??``,error:t.direccion??``,required:!0})}
      ${I({name:`ubicacion_maps_url`,label:`Enlace de Google Maps (opcional)`,type:`text`,value:e.ubicacion_maps_url??``,error:t.ubicacion_maps_url??``,hint:`Copia el enlace desde Google Maps para la ubicación exacta del hogar`})}
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
    <\/script>`}function gi(e){return ui(e)}function _i(e){let t=e?.querySelector(`#wiz-form-step1`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{nombre_completo:t.querySelector(`[name="nombre_completo"]`)?.value?.trim()??``,fecha_nacimiento:t.querySelector(`[name="fecha_nacimiento"]`)?.value??``,sabe_leer:n(`sabe_leer`),sabe_escribir:n(`sabe_escribir`),nacionalidad:t.querySelector(`[name="nacionalidad"]`)?.value?.trim()??``,tiene_pasaporte:t.querySelector(`[name="tiene_pasaporte"]`)?.checked??!1,como_se_entero:t.querySelector(`[name="como_se_entero"]`)?.value??``,municipio_residencia:t.querySelector(`[name="municipio_residencia"]`)?.value??``,sector_calle_numero:t.querySelector(`[name="sector_calle_numero"]`)?.value?.trim()??``,direccion:t.querySelector(`[name="direccion"]`)?.value?.trim()??``,ubicacion_maps_url:t.querySelector(`[name="ubicacion_maps_url"]`)?.value?.trim()??``}}var vi=e({getState:()=>Ci,id:()=>yi,render:()=>xi,title:()=>bi,validate:()=>Si}),yi=`step2`,bi=`Datos de la Madre`;function xi(e,t={}){return`
    <form id="wiz-form-step2" novalidate>
      <div class="alert alert-secondary py-2 mb-3">
        <i class="bi bi-person-heart me-1"></i>
        Ingresa los datos de la madre del alumno tal como aparecen en su documento de identidad.
        Si la madre no está en vida o no aplica, puedes dejar estos campos vacíos.
      </div>

      ${I({name:`madre_nombre`,label:`Nombre y apellido completo de la madre`,type:`text`,value:e.madre_nombre??``,error:t.madre_nombre??``,hint:`Tal como aparece en la cédula`})}
      ${I({name:`madre_cedula`,label:`Cédula / Pasaporte / Documento de identidad`,type:`text`,value:e.madre_cedula??``,error:t.madre_cedula??``,hint:`En su defecto, número de pasaporte o documento nacional`})}
      ${I({name:`madre_tlf_whatsapp`,label:`Número de WhatsApp de la madre`,type:`tel`,value:e.madre_tlf_whatsapp??``,error:t.madre_tlf_whatsapp??``,hint:`Número con código de país, Ej: +1 829 000 0000`})}
    </form>`}function Si(e){return{valid:!0,errors:{}}}function Ci(e){let t=e?.querySelector(`#wiz-form-step2`);return t?{madre_nombre:t.querySelector(`[name="madre_nombre"]`)?.value?.trim()??``,madre_cedula:t.querySelector(`[name="madre_cedula"]`)?.value?.trim()??``,madre_tlf_whatsapp:t.querySelector(`[name="madre_tlf_whatsapp"]`)?.value?.trim()??``}:{}}var wi=e({getState:()=>ki,id:()=>Ti,render:()=>Di,title:()=>Ei,validate:()=>Oi}),Ti=`step3`,Ei=`Datos del Padre`;function Di(e,t={}){return`
    <form id="wiz-form-step3" novalidate>
      <div class="alert alert-secondary py-2 mb-3">
        <i class="bi bi-person-heart me-1"></i>
        Ingresa los datos del padre del alumno tal como aparecen en su documento de identidad.
        Si el padre no está en vida o no aplica, puedes dejar estos campos vacíos.
      </div>

      ${I({name:`padre_nombre`,label:`Nombre y apellido completo del padre`,type:`text`,value:e.padre_nombre??``,error:t.padre_nombre??``,hint:`Tal como aparece en la cédula`})}
      ${I({name:`padre_cedula`,label:`Cédula / Pasaporte / Documento de identidad`,type:`text`,value:e.padre_cedula??``,error:t.padre_cedula??``,hint:`En su defecto, número de pasaporte o documento nacional`})}
      ${I({name:`padre_tlf_whatsapp`,label:`Número de WhatsApp del padre`,type:`tel`,value:e.padre_tlf_whatsapp??``,error:t.padre_tlf_whatsapp??``,hint:`Número con código de país, Ej: +1 829 000 0000`})}
    </form>`}function Oi(e){return{valid:!0,errors:{}}}function ki(e){let t=e?.querySelector(`#wiz-form-step3`);return t?{padre_nombre:t.querySelector(`[name="padre_nombre"]`)?.value?.trim()??``,padre_cedula:t.querySelector(`[name="padre_cedula"]`)?.value?.trim()??``,padre_tlf_whatsapp:t.querySelector(`[name="padre_tlf_whatsapp"]`)?.value?.trim()??``}:{}}var Ai=e({getState:()=>Fi,id:()=>ji,render:()=>Ni,title:()=>Mi,validate:()=>Pi}),ji=`step4`,Mi=`Representante y Entorno`;function Ni(e,t={}){let n=e.beneficiario_subsidio_estado===!0;return`
    <form id="wiz-form-step4" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-person-check me-1"></i>Representante oficial ante El Sistema PC</h6>
      ${I({name:`representante_nombre`,label:`Nombre y apellido completo`,type:`text`,value:e.representante_nombre??``,error:t.representante_nombre??``,required:!0,hint:`Tal como aparece en la cédula`})}
      <div class="row g-2">
        <div class="col-sm-6">
          ${I({name:`representante_parentesco`,label:`Parentesco con el alumno`,type:`text`,value:e.representante_parentesco??``,error:t.representante_parentesco??``,required:!0})}
        </div>
        <div class="col-sm-6">
          ${I({name:`representante_cedula`,label:`Cédula / Pasaporte`,type:`text`,value:e.representante_cedula??``,error:t.representante_cedula??``,required:!0})}
        </div>
      </div>
      ${I({name:`representante_tlf`,label:`Teléfono / WhatsApp del representante`,type:`tel`,value:e.representante_tlf??``,error:t.representante_tlf??``,required:!0})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-person-plus me-1"></i>Otro responsable (opcional)</h6>
      ${I({name:`otro_responsable_nombre`,label:`Nombre y apellido completo`,type:`text`,value:e.otro_responsable_nombre??``,error:t.otro_responsable_nombre??``,hint:`Tal como aparece en la cédula`})}
      <div class="row g-2">
        <div class="col-sm-6">
          ${I({name:`otro_responsable_cedula`,label:`Cédula / Pasaporte`,type:`text`,value:e.otro_responsable_cedula??``,error:t.otro_responsable_cedula??``})}
        </div>
        <div class="col-sm-6">
          ${I({name:`otro_responsable_tlf`,label:`Teléfono (si tiene)`,type:`tel`,value:e.otro_responsable_tlf??``,error:t.otro_responsable_tlf??``})}
        </div>
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-telephone-fill me-1"></i>Contactos de emergencia</h6>
      <div class="row g-2">
        <div class="col-sm-8">
          ${I({name:`contacto_emergencia_nombre`,label:`Contacto de emergencia #1`,type:`text`,value:e.contacto_emergencia_nombre??``})}
        </div>
        <div class="col-sm-4">
          ${I({name:`contacto_emergencia_telefono`,label:`Teléfono`,type:`tel`,value:e.contacto_emergencia_telefono??``})}
        </div>
      </div>
      <div class="row g-2">
        <div class="col-sm-8">
          ${I({name:`contacto_emergencia_2_nombre`,label:`Contacto de emergencia #2`,type:`text`,value:e.contacto_emergencia_2_nombre??``})}
        </div>
        <div class="col-sm-4">
          ${I({name:`contacto_emergencia_2_telefono`,label:`Teléfono`,type:`tel`,value:e.contacto_emergencia_2_telefono??``})}
        </div>
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-house-heart me-1"></i>Situación familiar y social</h6>

      ${I({name:`familia_monoparental`,label:`¿El alumno pertenece a una familia monoparental (sin padre o sin madre)?`,type:`radio`,value:e.familia_monoparental===!0?`true`:e.familia_monoparental===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      ${I({name:`beneficiario_subsidio_estado`,label:`¿Algún miembro del hogar es beneficiario de un subsidio del Estado?`,type:`radio`,value:n?`true`:e.beneficiario_subsidio_estado===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      <div id="subsidio-block" style="${n?``:`display:none`}">
        ${I({name:`subsidio_descripcion`,label:`¿Qué tipo de subsidio? (adjunte prueba de beneficio al momento de inscripción)`,type:`textarea`,value:e.subsidio_descripcion??``,hint:`Ej: Supérate, Progresando con Solidaridad, SIUBEN...`})}
      </div>

      ${I({name:`apoyo_actividades`,label:`¿De qué forma el hogar podría apoyar las actividades de El Sistema Punta Cana?`,type:`textarea`,value:e.apoyo_actividades??``,hint:`Ej: transporte, logística, voluntariado, donaciones, etc.`})}
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
    <\/script>`}function Pi(e){let t={};return e.representante_nombre?.trim()||(t.representante_nombre=`Campo requerido`),e.representante_parentesco?.trim()||(t.representante_parentesco=`Campo requerido`),e.representante_cedula?.trim()||(t.representante_cedula=`Campo requerido`),e.representante_tlf?.trim()||(t.representante_tlf=`Campo requerido`),{valid:Object.keys(t).length===0,errors:t}}function Fi(e){let t=e?.querySelector(`#wiz-form-step4`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{representante_nombre:t.querySelector(`[name="representante_nombre"]`)?.value?.trim()??``,representante_parentesco:t.querySelector(`[name="representante_parentesco"]`)?.value?.trim()??``,representante_cedula:t.querySelector(`[name="representante_cedula"]`)?.value?.trim()??``,representante_tlf:t.querySelector(`[name="representante_tlf"]`)?.value?.trim()??``,otro_responsable_nombre:t.querySelector(`[name="otro_responsable_nombre"]`)?.value?.trim()??``,otro_responsable_cedula:t.querySelector(`[name="otro_responsable_cedula"]`)?.value?.trim()??``,otro_responsable_tlf:t.querySelector(`[name="otro_responsable_tlf"]`)?.value?.trim()??``,contacto_emergencia_nombre:t.querySelector(`[name="contacto_emergencia_nombre"]`)?.value?.trim()??``,contacto_emergencia_telefono:t.querySelector(`[name="contacto_emergencia_telefono"]`)?.value?.trim()??``,contacto_emergencia_2_nombre:t.querySelector(`[name="contacto_emergencia_2_nombre"]`)?.value?.trim()??``,contacto_emergencia_2_telefono:t.querySelector(`[name="contacto_emergencia_2_telefono"]`)?.value?.trim()??``,familia_monoparental:n(`familia_monoparental`),beneficiario_subsidio_estado:n(`beneficiario_subsidio_estado`),subsidio_descripcion:t.querySelector(`[name="subsidio_descripcion"]`)?.value?.trim()??``,apoyo_actividades:t.querySelector(`[name="apoyo_actividades"]`)?.value?.trim()??``}}var Ii=e({getState:()=>Vi,id:()=>Li,render:()=>zi,title:()=>Ri,validate:()=>Bi}),Li=`step7`,Ri=`Compromisos`;function zi(e,t={}){return`
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
        ${I({name:`acepta_beca_4500`,label:`Estoy consciente de que el alumno recibe una beca de RD$4,500 y que solo pagaré RD$600 mensuales, siempre que el rendimiento, interés y asistencia sean notables.`,type:`checkbox`,value:e.acepta_beca_4500??!1,error:t.acepta_beca_4500??``})}
      </div>

      <div class="mb-3 p-3 bg-light rounded">
        ${I({name:`acepta_pago_600`,label:`Me comprometo a realizar el aporte mensual de RD$600 de manera responsable y puntual.`,type:`checkbox`,value:e.acepta_pago_600??!1,error:t.acepta_pago_600??``})}
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold mb-3"><i class="bi bi-camera me-1"></i>Autorización de imagen</h6>
      <div class="mb-3 p-3 bg-light rounded">
        ${I({name:`autoriza_fotos_redes`,label:`Autorizo a "El Sistema Punta Cana" a compartir por redes sociales y/o medios de comunicación fotos y videos donde pueda aparecer el rostro del alumno.`,type:`checkbox`,value:e.autoriza_fotos_redes??!1,error:t.autoriza_fotos_redes??``})}
      </div>

    </form>`}function Bi(e){let t={};return e.acepta_beca_4500||(t.acepta_beca_4500=`Debe aceptar los términos de la beca para continuar`),e.acepta_pago_600||(t.acepta_pago_600=`Debe comprometerse con el aporte mensual para continuar`),{valid:Object.keys(t).length===0,errors:t}}function Vi(e){let t=e?.querySelector(`#wiz-form-step7`);return t?{acepta_beca_4500:t.querySelector(`[name="acepta_beca_4500"]`)?.checked??!1,acepta_pago_600:t.querySelector(`[name="acepta_pago_600"]`)?.checked??!1,autoriza_fotos_redes:t.querySelector(`[name="autoriza_fotos_redes"]`)?.checked??!1}:{}}var Hi=e({getState:()=>qi,id:()=>Ui,render:()=>Gi,title:()=>Wi,validate:()=>Ki}),Ui=`step5`,Wi=`Perfil Musical`;function Gi(e,t={}){let n=e.tiene_conocimientos_musicales===!0;return`
    <form id="wiz-form-step5" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-music-note-beamed me-1"></i>Conocimientos musicales</h6>

      ${I({name:`tiene_conocimientos_musicales`,label:`¿Has aprendido a tocar algún instrumento musical antes?`,type:`radio`,value:n?`true`:e.tiene_conocimientos_musicales===!1?`false`:``,error:t.tiene_conocimientos_musicales??``,required:!0,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      <div id="conocimientos-block" style="${n?``:`display:none`}">
        ${I({name:`instrumento_previo`,label:`¿Qué instrumento has tocado?`,type:`text`,value:e.instrumento_previo??``,error:t.instrumento_previo??``})}
        ${I({name:`nivel_lectura_musical`,label:`Nivel de lectura musical`,type:`select`,value:e.nivel_lectura_musical??``,error:t.nivel_lectura_musical??``,options:[{value:``,label:`Selecciona...`},{value:`basico`,label:`Básico — conozco pocas notas`},{value:`intermedio`,label:`Intermedio — leo partituras simples`},{value:`avanzado`,label:`Avanzado — leo con fluidez`}]})}
      </div>

      <div id="iniciacion-block" style="${n?`display:none`:``}">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-1"></i>
          <strong>Iniciación musical:</strong> El alumno recibirá una clase obligatoria de iniciación musical durante los primeros <strong>6 meses</strong>.
          A los 3 meses podrá audicionarse para avanzar al semestre completo del programa.
        </div>
      </div>

      ${I({name:`interes_musical`,label:`¿Qué te interesa aprender?`,type:`radio`,value:e.interes_musical??``,error:t.interes_musical??``,required:!0,options:[{value:`cantar`,label:`Cantar`},{value:`instrumento`,label:`Tocar un instrumento`},{value:`ambas`,label:`Ambas cosas`}]})}

      ${I({name:`instrumento_interes`,label:`¿Qué instrumento te gustaría tocar?`,type:`text`,value:e.instrumento_interes??``,error:t.instrumento_interes??``,hint:`Ej: violín, flauta, cello, piano, trompeta...`})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-heart-pulse me-1"></i>Tu relación con la música</h6>

      ${I({name:`sentimiento_musica_clasica`,label:`¿Qué sientes cuando escuchas música clásica?`,type:`textarea`,value:e.sentimiento_musica_clasica??``,hint:`Responde con tus propias palabras, no hay respuesta incorrecta`})}
      ${I({name:`sentimiento_aprender_instrumento`,label:`¿Cómo te sientes cuando piensas en aprender un instrumento?`,type:`textarea`,value:e.sentimiento_aprender_instrumento??``})}
      ${I({name:`aspiracion_instrumento`,label:`¿Qué te gustaría hacer si aprendes a tocar un instrumento?`,type:`textarea`,value:e.aspiracion_instrumento??``})}
      ${I({name:`musico_favorito`,label:`¿Tienes algún músico o cantante favorito?`,type:`text`,value:e.musico_favorito??``})}

      ${I({name:`preferencia_aprendizaje_musical`,label:`¿Cómo prefieres aprender música?`,type:`select`,value:e.preferencia_aprendizaje_musical??``,options:[{value:``,label:`Selecciona...`},{value:`individual`,label:`Clases individuales (uno a uno con el maestro)`},{value:`grupal`,label:`Clases en grupo`},{value:`ambas`,label:`Me es igual, ambas formas`},{value:`autodidacta`,label:`Prefiero aprender por mi cuenta también`}]})}

      ${I({name:`por_que_unirse`,label:`¿Por qué deseas formar parte de "El Sistema Punta Cana"?`,type:`textarea`,value:e.por_que_unirse??``,hint:`Cuéntanos tu motivación para unirte al programa`})}

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
    <\/script>`}function Ki(e){let t={};return(e.tiene_conocimientos_musicales===void 0||e.tiene_conocimientos_musicales===null)&&(t.tiene_conocimientos_musicales=`Indica si tiene conocimientos musicales`),e.interes_musical||(t.interes_musical=`Indica el interés musical`),{valid:Object.keys(t).length===0,errors:t}}function qi(e){let t=e?.querySelector(`#wiz-form-step5`);return t?{tiene_conocimientos_musicales:(e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`})(`tiene_conocimientos_musicales`),instrumento_previo:t.querySelector(`[name="instrumento_previo"]`)?.value?.trim()??null,nivel_lectura_musical:t.querySelector(`[name="nivel_lectura_musical"]`)?.value||null,interes_musical:t.querySelector(`[name="interes_musical"]:checked`)?.value??``,instrumento_interes:t.querySelector(`[name="instrumento_interes"]`)?.value?.trim()??``,sentimiento_musica_clasica:t.querySelector(`[name="sentimiento_musica_clasica"]`)?.value?.trim()??``,sentimiento_aprender_instrumento:t.querySelector(`[name="sentimiento_aprender_instrumento"]`)?.value?.trim()??``,aspiracion_instrumento:t.querySelector(`[name="aspiracion_instrumento"]`)?.value?.trim()??``,musico_favorito:t.querySelector(`[name="musico_favorito"]`)?.value?.trim()??``,preferencia_aprendizaje_musical:t.querySelector(`[name="preferencia_aprendizaje_musical"]`)?.value??``,por_que_unirse:t.querySelector(`[name="por_que_unirse"]`)?.value?.trim()??``}:{}}var Ji=e({getState:()=>$i,id:()=>Yi,render:()=>Zi,title:()=>Xi,validate:()=>Qi}),Yi=`step6`,Xi=`Salud y Educación`;function Zi(e,t={}){let n=e.tiene_alergias===!0,r=e.tiene_condicion_transmisible===!0,i=e.tiene_alergia_medicamento===!0;return`
    <form id="wiz-form-step6" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-heart-pulse me-1"></i>Información de salud</h6>

      ${I({name:`tiene_alergias`,label:`¿El alumno es alérgico a algo?`,type:`radio`,value:n?`true`:e.tiene_alergias===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="alergias-block" style="${n?``:`display:none`}">
        ${I({name:`alergias_descripcion`,label:`¿A qué es alérgico?`,type:`textarea`,value:e.alergias_descripcion??``})}
      </div>

      ${I({name:`tiene_condicion_transmisible`,label:`¿El alumno padece alguna condición médica transmisible?`,type:`radio`,value:r?`true`:e.tiene_condicion_transmisible===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="condicion-block" style="${r?``:`display:none`}">
        ${I({name:`condicion_transmisible_desc`,label:`¿Cuál condición?`,type:`textarea`,value:e.condicion_transmisible_desc??``})}
      </div>

      ${I({name:`tiene_alergia_medicamento`,label:`¿El alumno es alérgico a algún medicamento?`,type:`radio`,value:i?`true`:e.tiene_alergia_medicamento===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="med-block" style="${i?``:`display:none`}">
        ${I({name:`alergia_medicamento_desc`,label:`¿A qué medicamento?`,type:`textarea`,value:e.alergia_medicamento_desc??``})}
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-people me-1"></i>Socialización y conducta</h6>

      ${I({name:`impedimento_social`,label:`¿El alumno tiene alguna condición especial que le impida socializar?`,type:`radio`,value:e.impedimento_social===!0?`true`:e.impedimento_social===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      ${I({name:`problemas_conducta`,label:`¿Presenta problemas de conducta?`,type:`select`,value:e.problemas_conducta??``,error:t.problemas_conducta??``,options:[{value:``,label:`Selecciona...`},{value:`no`,label:`No presenta problemas`},{value:`pocas_veces`,label:`Pocas veces`},{value:`si`,label:`Sí`},{value:`violento`,label:`Presenta conducta violenta`}]})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-book me-1"></i>Datos escolares</h6>

      ${I({name:`centro_estudios`,label:`¿En dónde estudia actualmente?`,type:`text`,value:e.centro_estudios??``,error:t.centro_estudios??``,hint:`Nombre del colegio o escuela`})}
      ${I({name:`grado_nivel`,label:`Grado o nivel escolar`,type:`text`,value:e.grado_nivel??``,hint:`Ej: 4to grado primaria, 2do bachillerato...`})}

      ${I({name:`padres_en_vida`,label:`¿Los dos padres del alumno están en vida?`,type:`select`,value:e.padres_en_vida??``,error:t.padres_en_vida??``,options:[{value:``,label:`Selecciona...`},{value:`ambos`,label:`Sí, ambos`},{value:`solo_madre`,label:`Solo la madre`},{value:`solo_padre`,label:`Solo el padre`},{value:`ninguno`,label:`Ninguno`}]})}

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
    <\/script>`}function Qi(e){return{valid:!0,errors:{}}}function $i(e){let t=e?.querySelector(`#wiz-form-step6`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{tiene_alergias:n(`tiene_alergias`),alergias_descripcion:t.querySelector(`[name="alergias_descripcion"]`)?.value?.trim()??``,tiene_condicion_transmisible:n(`tiene_condicion_transmisible`),condicion_transmisible_desc:t.querySelector(`[name="condicion_transmisible_desc"]`)?.value?.trim()??``,tiene_alergia_medicamento:n(`tiene_alergia_medicamento`),alergia_medicamento_desc:t.querySelector(`[name="alergia_medicamento_desc"]`)?.value?.trim()??``,impedimento_social:n(`impedimento_social`),problemas_conducta:t.querySelector(`[name="problemas_conducta"]`)?.value??``,centro_estudios:t.querySelector(`[name="centro_estudios"]`)?.value?.trim()??``,grado_nivel:t.querySelector(`[name="grado_nivel"]`)?.value?.trim()??``,padres_en_vida:t.querySelector(`[name="padres_en_vida"]`)?.value??``}}var ea=[fi,vi,wi,Ai,Ii,Hi,Ji];async function ta(e){async function t(e){return await le(e)}oi(e,ea,t,5)}function na(e){let{porcentaje:t,nivel:n,camposFaltantes:r,porGrupo:o}=m(e),s=a[n],c=i[n];if(n===`completo`)return``;let l=Object.entries(o).filter(([,e])=>e.faltantes.length>0).map(([e,t])=>`
      <div class="mb-1">
        <span class="fw-semibold small text-body">${e}</span>
        <span class="text-muted small ms-1">(${t.completos}/${t.total})</span>
        <div class="small text-muted">${t.faltantes.join(`, `)}</div>
      </div>`).join(``);return`
    <div class="card border-${s} mb-3" id="completitud-banner">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-${s}">${c}</span>
              <span class="small fw-semibold">Perfil ${t}% completo</span>
              <span class="text-muted small">· ${r.length} campo(s) pendiente(s)</span>
              <button class="btn btn-link btn-sm p-0 ms-auto text-muted" id="btn-toggle-completitud">
                <i class="bi bi-chevron-down"></i> Ver detalle
              </button>
            </div>
            <div class="progress" style="height:6px">
              <div class="progress-bar bg-${s}" style="width:${t}%"></div>
            </div>
          </div>
        </div>
        <div id="completitud-detalle" class="mt-2 pt-2 border-top" style="display:none">
          ${l}
        </div>
      </div>
    </div>`}function ra(e){if(!e)return[];let t=String(e).match(/\d[\d\s\-\.]{6,}\d/g);return t?t.map(e=>e.replace(/[\s\-\.]/g,``)).filter(e=>e.length>=7):[e.trim()]}function L(e){return e==null||e===``?`<span class="text-muted fst-italic small">—</span>`:y(String(e))}function ia(e){return e===!0||e===`true`||e===1||e===`1`?`Sí`:e===!1||e===`false`||e===0||e===`0`?`No`:`<span class="text-muted fst-italic small">—</span>`}function aa(e){if(!e)return`<span class="text-muted fst-italic small">—</span>`;let t=ra(e);if(t.length<=1){let t=xe(e)||y(e),n=be(e),r=n?` <a href="${y(n)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-0 ms-1" title="WhatsApp"><i class="bi bi-whatsapp"></i></a>`:``;return`<span>${y(t)}</span>${r}`}return t.map((e,t)=>{let n=xe(e)||e,r=be(e),i=r?`<a href="${y(r)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-0 ms-1" title="WhatsApp ${t+1}"><i class="bi bi-whatsapp"></i></a>`:``;return`<span class="me-2">${y(n)}${i}</span>`}).join(`<span class="text-muted mx-1">·</span>`)}var oa={personal:[{key:`nombre_completo`,label:`Nombre completo`},{key:`fecha_nacimiento`,label:`Fecha de nacimiento`,type:`date`},{key:`genero`,label:`Género`,type:`select`,options:[{v:``,l:`—`},{v:`M`,l:`Masculino`},{v:`F`,l:`Femenino`},{v:`O`,l:`Otro`}]},{key:`nacionalidad`,label:`Nacionalidad`},{key:`tiene_pasaporte`,label:`Tiene pasaporte`,type:`checkbox`},{key:`sabe_leer`,label:`Sabe leer`,type:`checkbox`},{key:`sabe_escribir`,label:`Sabe escribir`,type:`checkbox`},{key:`como_se_entero`,label:`Cómo se enteró`},{key:`municipio_residencia`,label:`Municipio`},{key:`sector_calle_numero`,label:`Sector / Calle / Número`},{key:`direccion`,label:`Dirección completa`,type:`textarea`},{key:`ubicacion_maps_url`,label:`URL Google Maps`},{key:`activo`,label:`Alumno activo`,type:`checkbox`}],madre:[{key:`madre_nombre`,label:`Nombre`},{key:`madre_cedula`,label:`Cédula`},{key:`madre_tlf_whatsapp`,label:`Teléfono / WhatsApp`,type:`phone`}],padre:[{key:`padre_nombre`,label:`Nombre`},{key:`padre_cedula`,label:`Cédula`},{key:`padre_tlf_whatsapp`,label:`Teléfono / WhatsApp`,type:`phone`}],representante:[{key:`representante_nombre`,label:`Nombre`},{key:`representante_parentesco`,label:`Parentesco`},{key:`representante_cedula`,label:`Cédula`},{key:`representante_tlf`,label:`Teléfono`,type:`phone`},{key:`correo_representante`,label:`Correo electrónico`},{key:`otro_responsable_nombre`,label:`Otro responsable — Nombre`},{key:`otro_responsable_cedula`,label:`Otro responsable — Cédula`},{key:`otro_responsable_tlf`,label:`Otro responsable — Teléfono`,type:`phone`},{key:`contacto_emergencia_nombre`,label:`Emergencia — Nombre`},{key:`contacto_emergencia_telefono`,label:`Emergencia — Teléfono`,type:`phone`},{key:`beneficiario_subsidio_estado`,label:`Beneficiario subsidio`,type:`checkbox`},{key:`subsidio_descripcion`,label:`Descripción subsidio`,type:`textarea`},{key:`apoyo_actividades`,label:`Apoyo en actividades`,type:`textarea`}],salud:[{key:`tiene_alergias`,label:`Tiene alergias`,type:`checkbox`},{key:`alergias_descripcion`,label:`Descripción alergias`,type:`textarea`},{key:`tiene_condicion_transmisible`,label:`Tiene condición transmisible`,type:`checkbox`},{key:`condicion_transmisible_desc`,label:`Descripción condición`,type:`textarea`},{key:`tiene_alergia_medicamento`,label:`Tiene alergia a medicamento`,type:`checkbox`},{key:`alergia_medicamento_desc`,label:`Descripción alergia medicamento`,type:`textarea`},{key:`impedimento_social`,label:`Impedimento social`,type:`checkbox`},{key:`problemas_conducta`,label:`Problemas de conducta`},{key:`centro_estudios`,label:`Centro de estudios`},{key:`grado_nivel`,label:`Grado / Nivel`},{key:`padres_en_vida`,label:`Padres en vida`}],musical:[{key:`instrumento_principal`,label:`Instrumento principal`},{key:`nivel_actual`,label:`Nivel actual`},{key:`tiene_conocimientos_musicales`,label:`Tiene conocimientos musicales`,type:`checkbox`},{key:`instrumento_previo`,label:`Instrumento previo`},{key:`nivel_lectura_musical`,label:`Nivel de lectura musical`},{key:`interes_musical`,label:`Interés musical`},{key:`instrumento_interes`,label:`Instrumento de interés`},{key:`sentimiento_musica_clasica`,label:`Sentimiento hacia música clásica`,type:`textarea`},{key:`sentimiento_aprender_instrumento`,label:`Sentimiento al aprender instrumento`,type:`textarea`},{key:`aspiracion_instrumento`,label:`Aspiración con el instrumento`,type:`textarea`},{key:`musico_favorito`,label:`Músico favorito`},{key:`preferencia_aprendizaje_musical`,label:`Preferencia de aprendizaje`,type:`textarea`},{key:`por_que_unirse`,label:`Por qué unirse`,type:`textarea`},{key:`autoriza_fotos_redes`,label:`Autoriza fotos en redes`,type:`checkbox`}]},sa={personal:`Personal`,madre:`Madre`,padre:`Padre`,representante:`Representante`,salud:`Salud`,musical:`Musical`,clases:`Clases`,progreso:`Progreso`,asistencias:`Asistencias`};function ca(e,t){let n=t[e.key];return e.type===`checkbox`?ia(n):e.type===`phone`?aa(n):e.type===`date`?L(n?ne(n):null):L(n)}function la(e,t){return e.map(e=>`
    <div class="row mb-2 align-items-start">
      <div class="col-5 col-md-4 text-muted small fw-semibold">${y(e.label)}</div>
      <div class="col-7 col-md-8">${ca(e,t)}</div>
    </div>
  `).join(``)}function ua(e,t){let n=t[e.key],r=`modal-field-${e.key}`;if(e.type===`checkbox`){let t=n===!0||n===`true`||n===1||n===`1`?`checked`:``;return`
      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="${r}" name="${y(e.key)}" ${t}>
        <label class="form-check-label" for="${r}">${y(e.label)}</label>
      </div>
    `}if(e.type===`textarea`)return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${y(e.label)}</label>
        <textarea class="form-control" id="${r}" name="${y(e.key)}" rows="3">${n==null?``:y(String(n))}</textarea>
      </div>
    `;if(e.type===`select`){let t=(e.options||[]).map(e=>`<option value="${y(e.v)}" ${n===e.v?`selected`:``}>${y(e.l)}</option>`).join(``);return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${y(e.label)}</label>
        <select class="form-select" id="${r}" name="${y(e.key)}">${t}</select>
      </div>
    `}if(e.type===`date`){let t=n?String(n).slice(0,10):``;return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${y(e.label)}</label>
        <input type="date" class="form-control" id="${r}" name="${y(e.key)}" value="${y(t)}">
      </div>
    `}return`
    <div class="mb-3">
      <label class="form-label fw-semibold" for="${r}">${y(e.label)}</label>
      <input type="text" class="form-control" id="${r}" name="${y(e.key)}" value="${n==null?``:y(String(n))}">
    </div>
  `}function da(e){if(!e)return`?`;let t=e.trim().split(/\s+/);return t.length===1?t[0][0].toUpperCase():(t[0][0]+t[t.length-1][0]).toUpperCase()}async function fa(e,t={}){let n=t.alumnoId||t.id;if(!n){e.innerHTML=`<div class="alert alert-danger m-4">ID de alumno no especificado.</div>`;return}e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height:300px">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;let{data:i,error:a}=await b.from(`alumnos`).select(`*`).eq(`id`,n).single();if(a||!i){e.innerHTML=`<div class="alert alert-danger m-4">Error al cargar el alumno: ${y(a?.message||`No encontrado`)}</div>`;return}let{data:o}=await b.from(`alumnos_clases`).select(`clase_id, clases(id, nombre, dia, hora_inicio)`).eq(`alumno_id`,n).eq(`activo`,!0),s=(o||[]).map(e=>e.clases).filter(Boolean),c=!1,l=!1;function u(){let t=da(i.nombre_completo),n=r(i.fecha_nacimiento),a=i.activo?`<span class="badge bg-success">Activo</span>`:`<span class="badge bg-secondary">Inactivo</span>`,o=[`personal`,`madre`,`padre`,`representante`,`salud`,`musical`],c=[...o,`clases`,`progreso`,`asistencias`].map((e,t)=>`
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
        >${y(sa[e])}</button>
      </li>
    `).join(``);function l(e){let t=oa[e];return`
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold text-uppercase text-muted small mb-0">${y(sa[e])}</h6>
          <button class="btn btn-sm btn-outline-primary" data-edit-section="${y(e)}">
            <i class="bi bi-pencil me-1"></i>Editar
          </button>
        </div>
        <div id="fields-${e}">
          ${la(t,i)}
        </div>
      `}let u=`
      ${o.map((e,t)=>`
        <div
          class="tab-pane fade${t===0?` show active`:``}"
          id="panel-${e}"
          role="tabpanel"
          aria-labelledby="tab-${e}"
        >
          <div class="p-3">
            ${l(e)}
          </div>
        </div>
      `).join(``)}

      <div class="tab-pane fade" id="panel-clases" role="tabpanel" aria-labelledby="tab-clases">
        <div class="p-3">
          <h6 class="fw-bold text-uppercase text-muted small mb-3">Clases inscritas</h6>
          ${s.length===0?`<p class="text-muted fst-italic">Sin clases activas.</p>`:`<div class="list-group">
                ${s.map(e=>`
                  <div class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="fw-semibold">${L(e.nombre)}</span>
                    <span class="text-muted small">${L(e.dia)} ${L(e.hora_inicio)}</span>
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

        ${na(i)}

        <!-- Header card -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex flex-wrap gap-3 align-items-start justify-content-between">
              <div class="d-flex gap-3 align-items-center">
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                  style="width:64px;height:64px;font-size:1.4rem;background:var(--bs-primary,#0d6efd)"
                >${y(t)}</div>
                <div>
                  <h4 class="mb-1 fw-bold">${L(i.nombre_completo)}</h4>
                  <div class="d-flex flex-wrap gap-2 align-items-center">
                    ${a}
                    ${i.instrumento_principal?`<span class="badge bg-info text-dark">${L(i.instrumento_principal)}</span>`:``}
                    ${i.nivel_actual?`<span class="badge bg-light text-dark border">${L(i.nivel_actual)}</span>`:``}
                    ${n===null?``:`<span class="text-muted small">${y(String(n))} años</span>`}
                    ${i.created_at?`<span class="text-muted small">Inscrito: ${L(ne(i.created_at))}</span>`:``}
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
              ${c}
            </ul>
          </div>
          <div class="card-body p-0">
            <div class="tab-content">
              ${u}
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
    `,h()}async function d(){if(c)return;c=!0;let e=document.getElementById(`progreso-content`);if(!e)return;let{data:t,error:r}=await b.from(`progresos`).select(`*`).eq(`alumno_id`,n).order(`fecha`,{ascending:!1});if(r){e.innerHTML=`<div class="alert alert-warning">Error al cargar progreso: ${y(r.message)}</div>`;return}if(!t||t.length===0){e.innerHTML=`<p class="text-muted fst-italic">Sin registros de progreso.</p>`;return}let i={};for(let e of t){let t=e.contenido_dsl||`Sin categoría`;i[t]||(i[t]=[]),i[t].push(e)}function a(e){if(!e)return`bg-secondary`;let t=e.toLowerCase();return t.includes(`excel`)||t.includes(`muy bien`)?`bg-success`:t.includes(`bien`)||t.includes(`regular`)?`bg-info text-dark`:t.includes(`mal`)||t.includes(`inici`)?`bg-warning text-dark`:`bg-secondary`}e.innerHTML=`
      <h6 class="fw-bold text-uppercase text-muted small mb-3">Progreso</h6>
      ${Object.entries(i).map(([e,t])=>`
        <div class="mb-4">
          <div class="fw-semibold mb-2 border-bottom pb-1">${L(e)}</div>
          <div class="list-group list-group-flush">
            ${t.map(e=>`
              <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-start">
                <div>
                  ${L(e.observaciones)}
                  ${e.fecha?`<div class="text-muted small mt-1">${L(ne(e.fecha))}</div>`:``}
                </div>
                ${e.estado_cualitativo?`<span class="badge ${a(e.estado_cualitativo)} ms-2 flex-shrink-0">${L(e.estado_cualitativo)}</span>`:``}
              </div>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    `}async function f(){if(l)return;l=!0;let e=document.getElementById(`asistencias-content`);if(!e)return;let{data:t,error:r}=await b.from(`asistencias`).select(`*`).eq(`alumno_id`,n).order(`fecha`,{ascending:!1}).limit(30);if(r){e.innerHTML=`<div class="alert alert-warning">Error al cargar asistencias: ${y(r.message)}</div>`;return}if(!t||t.length===0){e.innerHTML=`<p class="text-muted fst-italic">Sin registros de asistencia.</p>`;return}let i=0,a=0,o=0;for(let e of t){let t=(e.estado||e.asistio||``).toString().toLowerCase();t===`true`||t===`presente`||t===`1`?i++:t===`justificado`||t===`justified`?o++:a++}let s=t.length,c=s>0?Math.round(i/s*100):0;function u(e){let t=(e.estado||e.asistio||``).toString().toLowerCase();return t===`true`||t===`presente`||t===`1`?`<span class="badge bg-success">Presente</span>`:t===`justificado`||t===`justified`?`<span class="badge bg-warning text-dark">Justificado</span>`:`<span class="badge bg-danger">Ausente</span>`}e.innerHTML=`
      <h6 class="fw-bold text-uppercase text-muted small mb-3">Asistencias (últimas 30)</h6>
      <div class="row g-2 mb-3">
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-success">${y(String(c))}%</div>
              <div class="small text-muted">Asistencia</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-success">${y(String(i))}</div>
              <div class="small text-muted">Presentes</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-danger">${y(String(a))}</div>
              <div class="small text-muted">Ausentes</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-warning">${y(String(o))}</div>
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
                <td class="text-nowrap">${L(e.fecha?ne(e.fecha):null)}</td>
                <td>${u(e)}</td>
                <td>${L(e.observaciones)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `}let p=null,m=null;function h(){document.getElementById(`btn-toggle-completitud`)?.addEventListener(`click`,e=>{let t=document.getElementById(`completitud-detalle`),n=e.currentTarget,r=t.style.display!==`none`;t.style.display=r?`none`:`block`,n.innerHTML=r?`<i class="bi bi-chevron-down"></i> Ver detalle`:`<i class="bi bi-chevron-up"></i> Ocultar`});let t=document.getElementById(`btn-back`);t&&t.addEventListener(`click`,()=>{window.router?.navigate?window.router.navigate(`alumnos`):history.back()});let n=document.getElementById(`btn-ficha-pdf`);n&&n.addEventListener(`click`,async()=>{try{n.disabled=!0,await or(i)}catch(e){console.error(`Error generando ficha PDF:`,e)}finally{n.disabled=!1}});let r=document.getElementById(`btn-constancia`);r&&r.addEventListener(`click`,async()=>{try{r.disabled=!0,await sr(i)}catch(e){console.error(`Error generando constancia:`,e)}finally{r.disabled=!1}});let a=document.getElementById(`btn-postulante`);a&&a.addEventListener(`click`,()=>pa(i,e));let o=document.getElementById(`tab-progreso`);o&&o.addEventListener(`shown.bs.tab`,d);let s=document.getElementById(`tab-asistencias`);s&&s.addEventListener(`shown.bs.tab`,f),document.querySelectorAll(`[data-edit-section]`).forEach(e=>{e.addEventListener(`click`,()=>{g(e.getAttribute(`data-edit-section`))})});let c=document.getElementById(`btn-modal-save`);c&&c.addEventListener(`click`,ee)}function g(e){p=e;let t=oa[e],n=document.getElementById(`editModalBody`),r=document.getElementById(`editModalLabel`);r&&(r.textContent=`Editar — ${sa[e]}`),n&&(n.innerHTML=`<form id="edit-form">${t.map(e=>ua(e,i)).join(``)}</form>`);let a=document.getElementById(`editModal`);a&&(m||=new bootstrap.Modal(a),m.show())}async function ee(){if(!p)return;let e=oa[p],t=document.getElementById(`modal-save-spinner`),r=document.getElementById(`btn-modal-save`);t&&t.classList.remove(`d-none`),r&&(r.disabled=!0);let a={};for(let t of e){let e=document.querySelector(`[name="${t.key}"]`);if(e)if(t.type===`checkbox`)a[t.key]=e.checked;else{let n=e.value.trim();a[t.key]=n===``?null:n}}let{error:o}=await b.from(`alumnos`).update(a).eq(`id`,n);if(t&&t.classList.add(`d-none`),r&&(r.disabled=!1),o){alert(`Error al guardar: ${o.message}`);return}Object.assign(i,a);let s=document.getElementById(`fields-${p}`);s&&(s.innerHTML=la(e,i)),m&&m.hide()}u()}async function pa(e,t){let n=t.querySelector(`#postulante-panel`);if(n){n.innerHTML=`
    <div class="card border-warning shadow-sm mb-4">
      <div class="card-body text-center py-3">
        <div class="spinner-border spinner-border-sm text-warning me-2"></div>
        <span class="small text-muted">Buscando en postulantes...</span>
      </div>
    </div>`;try{let t=await wr(e.nombre_completo);if(!t||t.length===0){n.innerHTML=`
        <div class="alert alert-info d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-info-circle"></i>
          <span class="small">No se encontraron postulantes con el nombre <strong>${y(e.nombre_completo)}</strong>.</span>
          <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
        </div>`,n.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>n.innerHTML=``);return}let r=t[0],i=[`madre_nombre`,`madre_cedula`,`madre_tlf_whatsapp`,`padre_nombre`,`padre_cedula`,`padre_tlf_whatsapp`,`representante_nombre`,`representante_parentesco`,`representante_tlf`,`representante_cedula`,`correo_representante`,`municipio_residencia`,`sector_calle_numero`,`direccion`,`nacionalidad`,`centro_estudios`,`grado_nivel`,`instrumento_interes`,`como_se_entero`,`ubicacion_maps_url`],a=i.filter(t=>{let n=e[t],i=r[t];return(!n||n===``)&&i&&i!==``}),o=i.map(t=>{let n=e[t],i=r[t],a=i&&i!==``,o=n&&n!==``;return a?`<tr class="${o?``:`table-warning`}">
        <td class="small fw-semibold">${y(t.replace(/_/g,` `))}</td>
        <td class="small">${y(String(i))}</td>
        <td class="small text-muted">${o?y(String(n)):`<em>vacío</em>`}</td>
        <td class="text-center">${o?``:`<i class="bi bi-arrow-left-circle text-warning"></i>`}</td>
      </tr>`:``}).filter(Boolean).join(``);n.innerHTML=`
      <div class="card border-warning shadow-sm mb-4">
        <div class="card-header d-flex align-items-center gap-2 bg-warning bg-opacity-10">
          <i class="bi bi-person-check text-warning fs-5"></i>
          <div class="flex-grow-1">
            <div class="fw-bold small">Postulante encontrado: ${y(r.nombre_completo||``)}</div>
            <div class="text-muted" style="font-size:0.72rem">Estado: ${y(r.estado||`—`)} · ID: ${y(r.id||``)}</div>
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
      </div>`,n.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>n.innerHTML=``),n.querySelector(`#btn-precargar`)?.addEventListener(`click`,async()=>{let t=n.querySelector(`#btn-precargar`);t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;try{let t={};a.forEach(e=>{r[e]&&(t[e]=r[e])});let{error:i}=await b.from(`alumnos`).update(t).eq(`id`,e.id);if(i)throw i;Object.assign(e,t),n.innerHTML=`
          <div class="alert alert-success d-flex align-items-center gap-2 mb-4">
            <i class="bi bi-check-circle-fill"></i>
            <span class="small">${a.length} campo(s) precargados correctamente desde postulante. Recargá los tabs para ver los cambios.</span>
            <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel2"><i class="bi bi-x"></i></button>
          </div>`,n.querySelector(`#btn-close-panel2`)?.addEventListener(`click`,()=>n.innerHTML=``)}catch(e){t.disabled=!1,t.innerHTML=`<i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes`,n.insertAdjacentHTML(`beforeend`,`
          <div class="alert alert-danger small mt-2">Error al guardar: ${y(e.message)}</div>`)}})}catch(e){n.innerHTML=`
      <div class="alert alert-danger d-flex align-items-center gap-2 mb-4">
        <i class="bi bi-exclamation-triangle"></i>
        <span class="small">Error al buscar postulante: ${y(e.message)}</span>
        <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
      </div>`,n.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>n.innerHTML=``)}}}async function ma(e){e.innerHTML=`
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
            <div><span class="text-muted">Nombre:</span><br><strong>${Vn.nombre_completo}</strong></div>
            <div><span class="text-muted">Nacimiento:</span><br><strong>${Vn.fecha_nacimiento}</strong></div>
            <div><span class="text-muted">Instrumento:</span><br><strong>${Vn.instrumento_principal}</strong></div>
            <div><span class="text-muted">Representante:</span><br><strong>${Vn.representante_nombre}</strong></div>
            <div><span class="text-muted">Municipio:</span><br><strong>${Vn.municipio_residencia}</strong></div>
            <div><span class="text-muted">Centro estudios:</span><br><strong>${Vn.centro_estudios}</strong></div>
          </div>
          <p class="text-muted small mb-0 mt-3">
            <i class="bi bi-info-circle me-1"></i>
            Los PDFs reales se generan con los datos del alumno inscripto. Estos son sólo para previsualizar el diseño.
          </p>
        </div>
      </div>
    </div>`,e.querySelector(`#btn-demo-ficha`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`;try{await cr()}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-download me-2"></i>Descargar ficha demo`}}),e.querySelector(`#btn-demo-constancia`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`;try{await lr()}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-download me-2"></i>Descargar constancia demo`}})}var R={year:new Date().getFullYear(),month:new Date().getMonth()+1,postulantes:[],filtroEstado:`todos`,cargando:!1,page:1,limit:50},ha=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],ga=/\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|extracu|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i;function _a(e){if(!e||e.length===0)return!1;let t=e.trim();return!(t.length>70||t.includes(`,`)||t.split(/\s+/).length>5||ga.test(t)||!/[A-ZÁÉÍÓÚÑ]/.test(t)||t.length<4)}function va(e){return[e.nombre_completo,e.madre_nombre,e.padre_nombre,e.representante_nombre].map(e=>(e??``).trim()).find(e=>_a(e))??`Sin nombre registrado`}function ya(e){return e.split(` `).filter(e=>e.length>0).slice(0,2).map(e=>e[0].toUpperCase()).join(``)||`?`}function ba(e){return[{persona:e.madre_nombre,numero:e.madre_tlf_whatsapp,rol:`Madre`},{persona:e.padre_nombre,numero:e.padre_tlf_whatsapp,rol:`Padre`},{persona:e.representante_nombre,numero:e.representante_tlf||e.telefono_representante,rol:`Representante`},{persona:null,numero:e.telefono_alumno,rol:`Alumno`}].filter(({numero:e})=>{let t=(e??``).trim();return t.length>=7&&!/^(sin definir|no tiene|n\/a)$/i.test(t)}).map(({persona:e,numero:t,rol:n})=>({rol:n,nombre:_a(e??``)?e.trim():null,numero:t.trim()}))}function xa(e){return ba(e)[0]?.numero??null}function Sa(e){let t=e.replace(/\D/g,``);return t.length===10?`${t.slice(0,3)}-${t.slice(3,6)}-${t.slice(6)}`:e}async function Ca(e){R.filtroEstado=`todos`,R.page=1,await wa(e)}async function wa(e){try{R.cargando=!0,Ta(e),R.postulantes=(await Zr(R.year,R.month)).filter(e=>xa(e)!==null),R.cargando=!1,Da(e)}catch(t){R.cargando=!1,Ea(e,t.message)}}function Ta(e){e.innerHTML=`
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
  `}function Ea(e,t){e.innerHTML=`
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
  `,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>Ca(e))}function Da(e){let t=Oa();t.sort((e,t)=>{let n=new Date(e.fecha_postulacion||e.created_at);return new Date(t.fecha_postulacion||t.created_at)-n});let n=t.length,r=Math.ceil(n/R.limit)||1;R.page>r&&(R.page=r),R.page<1&&(R.page=1);let i=(R.page-1)*R.limit,a=Math.min(i+R.limit,n),o=t.slice(i,a),s=ka();e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4">
      
      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 class="h3 fw-bold mb-1">Módulo de Postulados</h1>
          <p class="text-body-secondary mb-0">Gestión de admisiones y pipeline de postulaciones</p>
        </div>
        
        <!-- MES SELECTOR & SYNC -->
        <div class="d-flex align-items-center gap-2">
          <div class="input-group input-group-sm shadow-sm" style="max-width: 250px;">
            <button class="btn btn-outline-secondary" id="btn-month-prev" type="button">
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="form-control text-center fw-semibold bg-body-secondary d-flex align-items-center justify-content-center" style="min-width: 140px; color: var(--bs-body-color);">
              ${ha[R.month-1]} ${R.year}
            </span>
            <button class="btn btn-outline-secondary" id="btn-month-next" type="button">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          
          <button class="btn btn-sm btn-primary shadow-sm" id="btn-sync" type="button">
            <span class="spinner-border spinner-border-sm d-none me-1" id="sync-spinner" role="status" aria-hidden="true"></span>
            <i class="bi bi-arrow-repeat me-1" id="sync-icon"></i> Sincronizar
          </button>
        </div>
      </div>

      <!-- FILTER PILLS -->
      <div class="d-flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hidden" style="white-space: nowrap;">
        <button class="btn btn-sm rounded-pill px-3 ${R.filtroEstado===`todos`?`btn-primary`:`btn-outline-secondary`}" data-filter="todos">
          Todos <span class="badge ${R.filtroEstado===`todos`?`bg-white text-primary`:`bg-secondary text-white`} ms-1">${R.postulantes.length}</span>
        </button>
        ${Object.entries(dr).map(([e,t])=>{let n=s[e]||0;return`
            <button class="btn btn-sm rounded-pill px-3 ${R.filtroEstado===e?`btn-primary`:`btn-outline-secondary`}" data-filter="${e}">
              ${t} <span class="badge ${R.filtroEstado===e?`bg-white text-primary`:`bg-secondary text-white`} ms-1">${n}</span>
            </button>
          `}).join(``)}
      </div>

      <!-- TABLE CARD (Compatible con Light/Dark Theme) -->
      <div class="card border border-secondary-subtle shadow-sm rounded-3 overflow-hidden">
        <div class="card-body p-0">
          ${o.length===0?Aa():ja(o)}
        </div>
        
        <!-- CONTROLES DE PAGINACIÓN -->
        ${n>0?`
          <div class="card-footer bg-body-tertiary border-top border-secondary-subtle px-4 py-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
            <span class="text-body-secondary small">
              Mostrando <strong class="text-body">${i+1}-${a}</strong> de <strong class="text-body">${n}</strong> postulantes
            </span>
            
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-page-prev" ${R.page===1?`disabled`:``}>
                <i class="bi bi-arrow-left me-1"></i> Más recientes
              </button>
              <span class="text-body-secondary small px-2">Pág. ${R.page} de ${r}</span>
              <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-page-next" ${R.page===r?`disabled`:``}>
                Más antiguos <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        `:``}
      </div>
    </div>
  `,Ma(e)}function Oa(){return R.filtroEstado===`todos`?[...R.postulantes]:R.postulantes.filter(e=>e.estado===R.filtroEstado)}function ka(){let e={};return Object.keys(dr).forEach(t=>e[t]=0),R.postulantes.forEach(t=>{let n=t.estado||`postulado`;e[n]!==void 0&&e[n]++}),e}function Aa(){return`
    <div class="text-center py-5">
      <i class="bi bi-people text-body-secondary display-4"></i>
      <h5 class="mt-3 fw-bold text-body">No hay postulantes</h5>
      <p class="text-body-secondary px-4 mb-0">No se encontraron postulantes registrados para el mes seleccionado o bajo este filtro de estado.</p>
    </div>
  `}function ja(e){return`
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="border-bottom border-secondary-subtle ps-4">Nombre Completo</th>
            <th class="border-bottom border-secondary-subtle">Contacto</th>
            <th class="border-bottom border-secondary-subtle">Fecha Postulación</th>
            <th class="border-bottom border-secondary-subtle text-end pe-4">Acción</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(e=>{let t=ba(e).map(({rol:e,nombre:t,numero:n})=>{let r=`https://wa.me/${n.replace(/\D/g,``)}?text=Hola%2C%20le%20contactamos%20de%20El%20Sistema%20Punta%20Cana.`,i=t?`${t} (${e})`:e;return`<a href="${r}" target="_blank" rel="noopener"
                class="d-flex align-items-center gap-1 text-decoration-none text-success mb-1 btn-wa-link"
                title="Abrir WhatsApp con ${i}">
                <i class="bi bi-whatsapp fs-6"></i>
                <span class="small">${Sa(n)}</span>
                <span class="text-muted small">· ${i}</span>
              </a>`}).join(``),n=e.fecha_postulacion||e.created_at,r=n?new Date(n).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`}):`-`;return`
              <tr class="cursor-pointer hover-table-row" data-id="${e.id}">
                <!-- Columna 1: Nombre completo -->
                <td class="ps-4 py-3">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-3 bg-primary bg-opacity-10 text-primary fw-bold d-none d-sm-flex">
                      ${ya(va(e))}
                    </div>
                    <div>
                      <span class="fw-semibold text-body block-link">${va(e)}</span>
                      <div class="d-flex flex-wrap d-sm-none mt-1">${t}</div>
                    </div>
                  </div>
                </td>

                <!-- Columna 2: Teléfonos con botones WhatsApp por contacto -->
                <td class="d-none d-sm-table-cell py-2">
                  <div class="d-flex flex-wrap gap-1">${t}</div>
                </td>
                
                <!-- Columna 3: Fecha de postulación -->
                <td class="text-body-secondary">${r}</td>
                
                <!-- Columna 4: Botón eliminar -->
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-link text-danger p-1 rounded-circle hover-bg-danger-subtle btn-delete-postulante" 
                          data-id="${e.id}" 
                          data-name="${va(e)}" 
                          title="Eliminar postulación">
                    <i class="bi bi-trash-fill fs-6"></i>
                  </button>
                </td>
              </tr>
            `}).join(``)}
        </tbody>
      </table>
    </div>
  `}function Ma(e){e.querySelectorAll(`.btn-wa-link`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation()})}),document.getElementById(`btn-month-prev`)?.addEventListener(`click`,()=>{R.month--,R.month<1&&(R.month=12,R.year--),R.page=1,wa(e)}),document.getElementById(`btn-month-next`)?.addEventListener(`click`,()=>{R.month++,R.month>12&&(R.month=1,R.year++),R.page=1,wa(e)}),document.getElementById(`btn-sync`)?.addEventListener(`click`,async()=>{let t=document.getElementById(`btn-sync`),n=document.getElementById(`sync-spinner`),r=document.getElementById(`sync-icon`);try{t.disabled=!0,n.classList.remove(`d-none`),r.classList.add(`d-none`);let i=await Jr();alert(`Sincronización exitosa. Registros procesados: ${i.total_rows||i.upserted||0}`),R.page=1,wa(e)}catch(e){alert(`Error al sincronizar: ${e.message}`),t.disabled=!1,n.classList.add(`d-none`),r.classList.remove(`d-none`)}}),e.querySelectorAll(`[data-filter]`).forEach(t=>{t.addEventListener(`click`,t=>{R.filtroEstado=t.currentTarget.getAttribute(`data-filter`),R.page=1,Da(e)})}),e.querySelectorAll(`.hover-table-row`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.getAttribute(`data-id`);C.navigate(`postulado`,{id:t})})}),e.querySelectorAll(`.btn-delete-postulante`).forEach(t=>{t.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget,r=n.getAttribute(`data-id`),i=n.getAttribute(`data-name`);if(confirm(`¿Estás seguro de que deseas eliminar permanentemente la postulación de "${i}"?\n\nEsta acción eliminará el registro de la base de datos de forma irreversible.`))try{n.disabled=!0,await ti(r),alert(`Postulación eliminada con éxito`),wa(e)}catch(e){alert(`Error al eliminar: ${e.message}`),n.disabled=!1}})}),document.getElementById(`btn-page-prev`)?.addEventListener(`click`,()=>{R.page>1&&(R.page--,Da(e))}),document.getElementById(`btn-page-next`)?.addEventListener(`click`,()=>{R.page++,Da(e)})}var Na=/\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i,Pa=[{id:`cedula_rep`,label:`Cédula del representante`},{id:`partida`,label:`Partida de nacimiento`},{id:`constancia`,label:`Constancia escolar`},{id:`foto`,label:`Foto del alumno`},{id:`docs_medicos`,label:`Documentos médicos (si aplica)`}],Fa=[{id:`postulado`,label:`Postulado`,num:1},{id:`contactado`,label:`Contactado`,num:2},{id:`cita_agendada`,label:`Cita agendada`,num:3},{id:`documentos_ok`,label:`Documentos OK`,num:4},{id:`inscrito`,label:`Inscrito`,num:5}],z={postulante:null,cargando:!1};function Ia(e){if(!e)return!1;let t=e.trim();return t.length>=4&&t.length<=70&&!t.includes(`,`)&&t.split(/\s+/).length<=5&&!Na.test(t)&&/[A-ZÁÉÍÓÚÑ]/.test(t)}function La(e){return[e.nombre_completo,e.madre_nombre,e.padre_nombre,e.representante_nombre].map(e=>(e??``).trim()).find(Ia)??`Sin nombre registrado`}function Ra(e){return{_postulante_id:e.id,nombre_completo:La(e),fecha_nacimiento:e.fecha_nacimiento||``,nacionalidad:e.nacionalidad||``,tiene_pasaporte:e.tiene_pasaporte??!1,sabe_leer:e.sabe_leer??null,sabe_escribir:e.sabe_escribir??null,genero:e.genero||``,como_se_entero:e.como_se_entero||``,municipio_residencia:e.municipio_residencia||``,sector_calle_numero:e.sector_calle_numero||``,direccion:e.direccion||``,ubicacion_maps_url:e.ubicacion_maps_url||``,madre_nombre:e.madre_nombre||``,madre_cedula:e.madre_cedula||``,madre_tlf_whatsapp:e.madre_tlf_whatsapp||``,padre_nombre:e.padre_nombre||``,padre_cedula:e.padre_cedula||``,padre_tlf_whatsapp:e.padre_tlf_whatsapp||``,representante_nombre:e.representante_nombre||e.madre_nombre||``,representante_parentesco:e.representante_parentesco||``,representante_cedula:e.representante_cedula||``,representante_tlf:e.representante_tlf||e.telefono_representante||e.madre_tlf_whatsapp||``,correo_representante:e.correo||``,beneficiario_subsidio_estado:e.beneficiario_subsidio_estado??!1,acepta_pago_600:e.acepta_pago_600??!1,instrumento_interes:e.instrumento_interes||``,tiene_conocimientos_musicales:e.tiene_conocimientos_musicales??!1,instrumento_previo:e.instrumento_previo||``,nivel_lectura_musical:e.nivel_lectura_musical||``,interes_musical:e.interes_musical||``,por_que_unirse:e.por_que_unirse||``,sentimiento_musica_clasica:e.sentimiento_musica_clasica||``,musico_favorito:e.musico_favorito||``,autoriza_fotos_redes:e.autoriza_fotos_redes??!1}}function za(e){if(!e)return`Sin definir`;let t=new Date(e);if(isNaN(t.getTime()))return`Sin definir`;let n=new Date,r=n.getFullYear()-t.getFullYear(),i=n.getMonth()-t.getMonth();return(i<0||i===0&&n.getDate()<t.getDate())&&r--,`${r} años`}function Ba(e){return e?new Date(e).toLocaleString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):``}function Va(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`}):`-`}function Ha(e,t,n){return`https://wa.me/${(e||``).replace(/[^0-9]/g,``)}?text=${encodeURIComponent(`Hola ${t}, le contactamos de *El Sistema Punta Cana*. Hemos recibido la postulación de *${n}* y queremos coordinar el proceso de inscripción. ¿Cuándo podría venir a nuestra sede para la entrevista? 🎵`)}`}function Ua(e){return`docs_${e}`}function Wa(e){try{let t=localStorage.getItem(Ua(e));return t?JSON.parse(t):{}}catch{return{}}}function Ga(e,t){localStorage.setItem(Ua(e),JSON.stringify(t))}async function Ka(e,t){let n=t?.id;if(!n){e.innerHTML=`<div class="alert alert-danger m-4">Error: ID de postulante no provisto.</div>`;return}await qa(e,n)}async function qa(e,t){z.cargando=!0,e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height:400px">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando perfil...</span>
      </div>
    </div>`;try{if(z.postulante=await qr(t),z.cargando=!1,!z.postulante){e.innerHTML=`
        <div class="container py-5 text-center">
          <i class="bi bi-person-x display-1 text-muted"></i>
          <h2 class="mt-3 fw-bold">Postulante no encontrado</h2>
          <p class="text-muted">El postulante con ID "${t}" no existe en el sistema.</p>
          <button class="btn btn-primary rounded-pill px-4 mt-3" id="btn-error-back">
            <i class="bi bi-arrow-left me-1"></i> Volver al listado
          </button>
        </div>`,document.getElementById(`btn-error-back`)?.addEventListener(`click`,()=>C.navigate(`postulados`));return}Ja(e)}catch(n){z.cargando=!1,e.innerHTML=`
      <div class="container py-5 text-center">
        <div class="alert alert-danger p-4 rounded-3">
          <i class="bi bi-exclamation-triangle-fill fs-1 mb-2 d-block"></i>
          <h4 class="fw-bold">Error al cargar perfil</h4>
          <p>${n.message}</p>
          <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-error-retry">
            <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      </div>`,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>qa(e,t))}}function Ja(e){let t=z.postulante,n=t.estado||`postulado`,r=La(t),i=t.representante_nombre||t.madre_nombre||`Representante`,a=fr[n]||`secondary`,o=dr[n]||`Postulado`;e.innerHTML=`
    <div class="container-fluid py-3 px-3 px-md-4">

      <!-- TOP BAR -->
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <button class="btn btn-link text-decoration-none ps-0 text-secondary" id="btn-back-list">
          <i class="bi bi-arrow-left me-1"></i> Volver a Postulados
        </button>
        <div class="d-flex gap-2 flex-wrap">
          ${t.madre_tlf_whatsapp?`
            <a href="${Ha(t.madre_tlf_whatsapp,i,r)}"
               target="_blank" rel="noopener"
               class="btn btn-outline-success btn-sm rounded-pill">
              <i class="bi bi-whatsapp me-1"></i> WhatsApp Madre
            </a>`:``}
          ${t.padre_tlf_whatsapp?`
            <a href="${Ha(t.padre_tlf_whatsapp,i,r)}"
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
          Postulado el: ${Va(t.created_at)}
        </p>
      </div>

      <!-- PIPELINE -->
      <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4">
        <div class="card-body py-3 px-4 overflow-auto">
          ${Ya(n)}
        </div>
      </div>

      <!-- TWO-COLUMN LAYOUT -->
      <div class="row g-4">

        <!-- LEFT col -->
        <div class="col-lg-7">

          <!-- PROXIMO PASO -->
          <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4" id="card-proximo-paso">
            ${Xa(t,n,i,r)}
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
                ${$a(t)}
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
              ${Za(t)}
            </div>
          </div>

          <!-- DOCUMENTOS -->
          <div class="card border-secondary-subtle shadow-sm rounded-3">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-4">
              <h6 class="fw-bold mb-0"><i class="bi bi-folder-check me-2 text-primary"></i>Documentos</h6>
            </div>
            <div class="card-body px-4 pb-4">
              ${Qa(t.id)}
            </div>
          </div>

        </div>
      </div>
    </div>
  `,eo(e)}function Ya(e){let t=[`no_show`,`en_espera`,`descartado`,`reprogramado`].includes(e),n={no_show:2,reprogramado:2,en_espera:3,descartado:-1},r=Fa.findIndex(t=>t.id===e);return t&&(r=n[e]??-1),`
    <div class="d-flex align-items-center gap-1 overflow-auto py-1">
      ${Fa.map((n,i)=>{let a=i<r,o=i===r&&!t,s=i===r&&t,c=`bg-light border border-secondary text-secondary`,l=`text-secondary`;if(a)c=`bg-success text-white border border-success`,l=`text-success fw-semibold`;else if(o){let e=fr[n.id]||`primary`;c=`bg-${e} text-white border border-${e}`,l=`text-${e} fw-bold`}else if(s){let t=fr[e]||`secondary`;c=`bg-${t} bg-opacity-25 text-${t} border border-${t}`,l=`text-${t} fw-semibold`}let u=i<Fa.length-1?`<div class="flex-grow-1 border-top border-secondary-subtle" style="min-width:20px;margin-top:-8px"></div>`:``;return`
          <div class="d-flex flex-column align-items-center" style="min-width:64px">
            <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold ${c}"
                 style="width:36px;height:36px;font-size:.9rem">
              ${a?`<i class="bi bi-check-lg"></i>`:n.num}
            </div>
            <div class="text-center mt-1 small ${l}" style="font-size:.75rem;white-space:nowrap">
              ${n.label}
            </div>
            ${s?`<span class="badge bg-${fr[e]} mt-1" style="font-size:.65rem">${dr[e]}</span>`:``}
          </div>
          ${u}`}).join(``)}
    </div>
  `}function Xa(e,t,n,r){let i=fr[t]||`secondary`;switch(t){case`postulado`:return`
        <div class="card-header bg-${i} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${i}"><i class="bi bi-telephone-outbound me-2"></i>Próximo paso: Contactar a la familia</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">El representante aún no ha sido contactado. Iniciá la comunicación por WhatsApp.</p>
          <div class="d-flex flex-wrap gap-2 mb-3">
            ${e.madre_tlf_whatsapp?`
              <a href="${Ha(e.madre_tlf_whatsapp,n,r)}"
                 target="_blank" rel="noopener"
                 class="btn btn-success btn-sm rounded-pill">
                <i class="bi bi-whatsapp me-1"></i> WhatsApp Madre
              </a>`:``}
            ${e.padre_tlf_whatsapp?`
              <a href="${Ha(e.padre_tlf_whatsapp,n,r)}"
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
          <h6 class="fw-bold text-${i}"><i class="bi bi-calendar-event me-2"></i>Cita agendada para: ${e.fecha_cita?Ba(e.fecha_cita):`Sin fecha registrada`}</h6>
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
        </div>`}}function Za(e){let t=(e,t)=>`
      <div class="d-flex justify-content-between py-1 border-bottom border-light">
        <span class="text-muted small">${e}</span>
        <span class="small text-end">${t!=null&&t!==``?`<span class="fw-medium">${t}</span>`:`<span class="text-muted fst-italic">Sin definir</span>`}</span>
      </div>`,n=[e.representante_nombre||e.nombre_representante||``,e.representante_parentesco||``].filter(Boolean).join(` · `);return`
    ${t(`Instrumento`,e.instrumento_interes||e.instrumento)}
    ${t(`Edad`,za(e.fecha_nacimiento))}
    ${t(`Municipio`,e.municipio_residencia)}
    ${t(`Madre`,[e.madre_nombre,e.madre_tlf_whatsapp].filter(Boolean).join(` — `))}
    ${t(`Padre`,[e.padre_nombre,e.padre_tlf_whatsapp].filter(Boolean).join(` — `))}
    ${t(`Representante`,n)}
    ${t(`Correo`,e.correo)}
    ${t(`Postulado el`,Va(e.created_at))}
  `}function Qa(e){let t=Wa(e);return Pa.map(e=>`
    <div class="form-check mb-2">
      <input class="form-check-input doc-check" type="checkbox"
             id="doc-${e.id}" data-doc-id="${e.id}"
             ${t[e.id]?`checked`:``}>
      <label class="form-check-label small" for="doc-${e.id}">${e.label}</label>
    </div>
  `).join(``)}function $a(e){let t=(e.notas_seguimiento||e.notes||``).split(`
`).filter(e=>e.trim());return t.length===0?`<p class="text-muted small fst-italic">Sin notas registradas.</p>`:`
    <h6 class="fw-bold small text-secondary text-uppercase mb-2">Historial</h6>
    ${t.map(e=>`
      <div class="d-flex gap-2 mb-2 pb-2 border-bottom border-light">
        <div class="mt-1 rounded-circle bg-primary flex-shrink-0" style="width:8px;height:8px"></div>
        <p class="small mb-0">${e}</p>
      </div>`).join(``)}
  `}function eo(e){let t=z.postulante,n=t.id;t.estado,e.querySelector(`#btn-back-list`)?.addEventListener(`click`,()=>{window.router?.navigate(`postulados`)??C.navigate(`postulados`)}),e.querySelector(`#btn-ver-alumno`)?.addEventListener(`click`,()=>{window.router?.navigate(`alumno`,{id:t.alumno_id})??C.navigate(`alumno`,{id:t.alumno_id})}),e.querySelectorAll(`.doc-check`).forEach(e=>{e.addEventListener(`change`,()=>{let t=Wa(n),r=e.getAttribute(`data-doc-id`);e.checked?t[r]=!0:delete t[r],Ga(n,t)})}),e.querySelector(`#btn-save-note`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#textarea-nueva-nota`),r=(t?.value||``).trim();if(!r)return;let i=e.querySelector(`#btn-save-note`),a=e.querySelector(`#save-note-spinner`);try{i.disabled=!0,a?.classList.remove(`d-none`),z.postulante=await ei(n,r),t.value=``;let o=e.querySelector(`#notes-timeline`);o&&(o.innerHTML=$a(z.postulante))}catch(e){alert(`Error al agregar nota: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-contactado`)?.addEventListener(`click`,async()=>{try{z.postulante=await Xr(n,`contactado`,{notas_seguimiento:`Contacto iniciado vía WhatsApp.`}),Ja(e)}catch(e){alert(`Error al cambiar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-cita-agendada`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-cita`),r=e.querySelector(`#cita-inline-error`),i=e.querySelector(`#btn-accion-cita-agendada`),a=e.querySelector(`#spinner-cita`);if(!t?.value){r?.classList.remove(`d-none`),r&&(r.textContent=`Debe seleccionar una fecha y hora.`);return}try{i.disabled=!0,a?.classList.remove(`d-none`),r?.classList.add(`d-none`);let o=new Date(t.value).toISOString();if(await $r(o,n)){r?.classList.remove(`d-none`),r&&(r.textContent=`Conflicto: ya existe otra cita en un rango de ±30 minutos.`);return}z.postulante=await Xr(n,`cita_agendada`,{fecha_cita:o,notas_seguimiento:`Cita agendada para: ${Ba(o)}`}),Ja(e)}catch(e){alert(`Error al agendar cita: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-documentos-ok`)?.addEventListener(`click`,async()=>{try{z.postulante=await Xr(n,`documentos_ok`,{notas_seguimiento:`Representante presente. Documentación revisada.`}),Ja(e)}catch(e){alert(`Error al actualizar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-no-show`)?.addEventListener(`click`,async()=>{try{z.postulante=await Xr(n,`no_show`,{notas_seguimiento:`No se presentó a la cita agendada.`}),Ja(e)}catch(e){alert(`Error al actualizar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-inscribir`)?.addEventListener(`click`,()=>{wn(Ra(t)),window.router?.navigate(`alumnos-inscribir`)??C.navigate(`alumnos-inscribir`)}),e.querySelector(`#btn-accion-reprogramar`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-reprogramar`),r=e.querySelector(`#btn-accion-reprogramar`),i=e.querySelector(`#spinner-reprogramar`);if(!t?.value){alert(`Seleccioná una nueva fecha para la cita.`);return}try{r.disabled=!0,i?.classList.remove(`d-none`);let a=new Date(t.value).toISOString();if(await $r(a,n)){alert(`Conflicto: ya existe otra cita en un rango de ±30 minutos.`);return}let o=await Xr(n,`reprogramado`,{notas_seguimiento:`Cita reprogramada para: ${Ba(a)}`});o=await Xr(n,`cita_agendada`,{fecha_cita:a,notas_seguimiento:`Nueva cita agendada: ${Ba(a)}`}),z.postulante=o,Ja(e)}catch(e){alert(`Error al reprogramar: ${e.message}`)}finally{r.disabled=!1,i?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-descartar`)?.addEventListener(`click`,async()=>{let t=prompt(`Indicá la razón del descarte:`);if(t!==null)try{z.postulante=await Xr(n,`descartado`,{notas_seguimiento:`Postulación descartada. Razón: ${t||`Sin detallar`}`}),Ja(e)}catch(e){alert(`Error al descartar: ${e.message}`)}}),e.querySelector(`#btn-accion-espera-cita`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-espera`),r=e.querySelector(`#espera-cita-error`),i=e.querySelector(`#btn-accion-espera-cita`),a=e.querySelector(`#spinner-espera`);if(!t?.value){r?.classList.remove(`d-none`),r&&(r.textContent=`Seleccioná una fecha para la cita.`);return}try{i.disabled=!0,a?.classList.remove(`d-none`),r?.classList.add(`d-none`);let o=new Date(t.value).toISOString();if(await $r(o,n)){r?.classList.remove(`d-none`),r&&(r.textContent=`Conflicto: ya existe otra cita en ±30 minutos.`);return}z.postulante=await Xr(n,`cita_agendada`,{fecha_cita:o,notas_seguimiento:`Cita agendada desde lista de espera: ${Ba(o)}`}),Ja(e)}catch(e){alert(`Error al agendar cita: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}})}var B={year:new Date().getFullYear(),month:new Date().getMonth()+1,citas:[],cargando:!1},to=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],no=[`Dom`,`Lun`,`Mar`,`Mié`,`Jue`,`Vie`,`Sáb`];async function ro(e){await io(e)}async function io(e){try{B.cargando=!0,ao(e),B.citas=await Qr(new Date(B.year,B.month-1,1,0,0,0).toISOString(),new Date(B.year,B.month,0,23,59,59).toISOString()),B.cargando=!1,so(e)}catch(t){B.cargando=!1,oo(e,t.message)}}function ao(e){e.innerHTML=`
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
  `}function oo(e,t){e.innerHTML=`
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
  `,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>ro(e))}function so(e){let t=new Date(B.year,B.month,0).getDate(),n=new Date(B.year,B.month-1,1).getDay();e.innerHTML=`
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
              ${to[B.month-1]} ${B.year}
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
            ${no.map(e=>`<div class="col" style="width: 14.28%;">${e}</div>`).join(``)}
          </div>

          <!-- GRID CALENDARIO -->
          <div class="row g-0 flex-wrap" id="calendar-grid">
            ${co(n,t)}
          </div>

        </div>
      </div>
    </div>
  `,uo(e)}function co(e,t){let n=``;for(let t=0;t<e;t++)n+=`
      <div class="col p-2 bg-light bg-opacity-25 border-end border-bottom d-none d-md-block" style="width: 14.28%; min-height: 120px;">
        <span class="text-muted opacity-25 small"></span>
      </div>
    `;let r=new Date,i=r.getFullYear()===B.year&&r.getMonth()+1===B.month;for(let e=1;e<=t;e++){let t=i&&r.getDate()===e,a=lo(e);n+=`
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
      `}return n}function lo(e){return B.citas.filter(t=>{if(!t.fecha_cita)return!1;let n=new Date(t.fecha_cita);return n.getDate()===e&&n.getMonth()+1===B.month&&n.getFullYear()===B.year})}function uo(e){document.getElementById(`btn-month-prev`)?.addEventListener(`click`,()=>{B.month--,B.month<1&&(B.month=12,B.year--),io(e)}),document.getElementById(`btn-month-next`)?.addEventListener(`click`,()=>{B.month++,B.month>12&&(B.month=1,B.year++),io(e)}),document.getElementById(`btn-today`)?.addEventListener(`click`,()=>{B.year=new Date().getFullYear(),B.month=new Date().getMonth()+1,io(e)}),e.querySelectorAll(`.btn-goto-perfil`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation();let t=e.currentTarget.getAttribute(`data-id`);C.navigate(`postulado`,{id:t})})}),e.querySelectorAll(`.btn-view-mobile-day`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation();let t=parseInt(e.currentTarget.getAttribute(`data-day`)),n=lo(t),r=n.map(e=>{let t=new Date(e.fecha_cita).toLocaleTimeString(`es-ES`,{hour:`2-digit`,minute:`2-digit`,hour12:!0});return`• ${e.nombre_completo} (${t})`}).join(`
`);alert(`Citas para el día ${t} de ${to[B.month-1]}:\n\n${r}\n\nSelecciona el perfil para ver detalles.`),n.length===1&&C.navigate(`postulado`,{id:n[0].id})})})}function fo(){C.register(`alumnos`,te),C.register(`alumnos-reporte-mes`,_n),C.register(`alumnos-inscribir`,ta),C.register(`alumnos-pdf-demo`,ma),C.register(`alumno`,fa),C.register(`postulados`,Ca),C.register(`postulado`,Ka),C.register(`postulados-calendario`,ro)}function po(e){return e?{...e,nombre:e.nombre??e.name??``,codigo:e.codigo_salon??``,ubicacion:e.ubicacion??e.location??``,condicion:e.condicion_fisica??`buena`,is_active:e.is_active??e.isActive??e.activo??!0,capacidad:parseInt(e.capacidad)||20,piso:e.piso!==void 0&&e.piso!==null?parseInt(e.piso):null,equipamiento:Array.isArray(e.equipamiento)?e.equipamiento.join(`, `):e.equipamiento||``,descripcion:e.descripcion||``}:null}async function mo(){let{data:e,error:t}=await b.from(`salones`).select(`*`).order(`nombre`,{ascending:!0});if(t)throw console.error(`Error cargando salones:`,t.message),Error(`No se pudieron cargar los salones`);return e.map(po)}async function ho(e){let t=(e.nombre||``).trim(),n=(e.codigo_salon||``).trim();if(!t)throw Error(`El nombre es obligatorio`);let{data:r,error:i}=await b.from(`salones`).select(`id, nombre, codigo_salon`).or(`nombre.eq."${t}", codigo_salon.eq."${n}"`).maybeSingle();if(i&&console.error(`Error validando duplicados:`,i),r){if(r.nombre.toLowerCase()===t.toLowerCase())throw Error(`Ya existe un salón con ese nombre`);if(n&&r.codigo_salon?.toLowerCase()===n.toLowerCase())throw Error(`Ya existe un salón con ese código`)}let a={nombre:t,codigo_salon:n||void 0,capacidad:parseInt(e.capacidad)||20,ubicacion:(e.ubicacion||``).trim(),piso:e.piso===void 0?null:parseInt(e.piso),condicion_fisica:e.condicion_fisica||`buena`,equipamiento:typeof e.equipamiento==`string`?e.equipamiento.split(`,`).map(e=>e.trim()).filter(Boolean):Array.isArray(e.equipamiento)?e.equipamiento:[],descripcion:(e.descripcion||``).trim(),is_active:e.is_active===void 0?!0:e.is_active,responsable_id:e.responsable_id||null},{data:o,error:s}=await b.from(`salones`).insert([a]).select();if(s)throw s.code===`23505`?Error(`El nombre o código del salón ya está registrado`):(console.error(`Error creando salon:`,s.message),Error(`No se pudo crear el salon`));return o[0]}async function go(e,t){let n=(t.nombre||``).trim(),r=(t.codigo_salon||``).trim();if(n||r){let{data:t}=await b.from(`salones`).select(`id, nombre, codigo_salon`).neq(`id`,e);if(t){if(n&&t.find(e=>e.nombre.toLowerCase()===n.toLowerCase()))throw Error(`Ya existe otro salón con ese nombre`);if(r&&t.find(e=>e.codigo_salon?.toLowerCase()===r.toLowerCase()))throw Error(`Ya existe otro salón con ese código`)}}let i={...t};n&&(i.nombre=n),r&&(i.codigo_salon=r),i.capacidad&&=parseInt(i.capacidad),i.piso!==void 0&&(i.piso=parseInt(i.piso)),i.equipamiento!==void 0&&(i.equipamiento=typeof i.equipamiento==`string`?i.equipamiento.split(`,`).map(e=>e.trim()).filter(Boolean):Array.isArray(i.equipamiento)?i.equipamiento:[]),i.updated_at=new Date().toISOString();let{data:a,error:o}=await b.from(`salones`).update(i).eq(`id`,e).select();if(o)throw o.code===`23505`?Error(`El nombre o código del salón ya está registrado`):(console.error(`Error actualizando salon:`,o.message),Error(`No se pudo actualizar el salon`));return a[0]}async function _o(e){let{error:t}=await b.from(`salones`).update({is_active:!1,updated_at:new Date().toISOString()}).eq(`id`,e);if(t)throw console.error(`Error eliminando salon:`,t.message),Error(`No se pudo inactivar el salon`)}var V=new class{constructor(){this.salones=[],this.cargando=!1,this.error=null,this.listeners=[]}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){this.listeners.forEach(e=>e(this))}async fetchSalones(){this.cargando=!0,this.error=null,this.notify();try{this.salones=await mo()}catch(e){this.error=e.message,console.error(e)}finally{this.cargando=!1,this.notify()}}getFiltered(e=``,t=``,n=``){return this.salones.filter(r=>{let i=e.toLowerCase(),a=r.nombre.toLowerCase().includes(i)||r.codigo&&r.codigo.toLowerCase().includes(i)||r.ubicacion.toLowerCase().includes(i),o=t===``||String(r.piso)===String(t),s=n===``||r.condicion===n;return a&&o&&s})}},vo={editandoId:null};function H(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function yo(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].substring(0,2).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function bo(e){e.innerHTML=`
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
  `;let t=e.querySelector(`#salonesTableBody`),n=e.querySelector(`#searchSalon`),r=e.querySelector(`#filterCondicion`),i=e.querySelector(`#filterPiso`),a=e.querySelector(`#salonesCount`),o=()=>{let e=n.value,o=r.value,c=i.value,l=V.getFiltered(e,c,o);if(V.cargando){t.innerHTML=`<div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>`;return}if(V.error){t.innerHTML=`<div class="text-center py-5 text-danger"><i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i> Error: ${H(V.error)}</div>`;return}if(l.length===0){t.innerHTML=`
        <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
          <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
          No se encontraron salones con esos filtros.
        </div>`;return}a.textContent=l.length,t.innerHTML=l.map(e=>{let t=yo(e.nombre||`S`),n=e.is_active!==!1,r=s(e.condicion),i=`border-accent-${n?`success`:`secondary`}`,a=`bg-${n?`success`:`secondary`}`;return`
        <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${i}" data-id="${e.id}" style="cursor: pointer;">
          <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
            <div class="position-relative flex-shrink-0">
              <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">${t}</div>
              <span class="position-absolute bottom-0 end-0 p-1 ${a} border border-light rounded-circle" style="transform: translate(10%, 10%);">
                <span class="visually-hidden">${n?`Activo`:`Inactivo`}</span>
              </span>
            </div>
            <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${H(e.nombre||`-`)}</span>
              <small class="text-muted text-truncate">Capacidad: ${e.capacidad||`-`} personas • Piso: ${e.piso===0||e.piso===`0`?`Planta Baja`:`Piso ${e.piso}`}</small>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            ${r}
            <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
          </div>
        </div>
      `}).join(``)},s=e=>`<span class="badge badge-compact ${{excelente:`bg-success`,buena:`bg-primary`,regular:`bg-warning`,mala:`bg-danger`}[e]||`bg-secondary`}">${{excelente:`Excelente`,buena:`Buena`,regular:`Regular`,mala:`Mala`}[e]||`-`}</span>`,c=V.subscribe(o),l;n.addEventListener(`input`,()=>{clearTimeout(l),l=setTimeout(o,300)}),r.addEventListener(`change`,o),i.addEventListener(`change`,o),e.querySelector(`#btnCrearSalon`)?.addEventListener(`click`,()=>{xo()}),t?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t){let e=t.dataset.id;Co(e)}}),V.fetchSalones(),e.cleanup=()=>{c()}}function xo(){vo.editandoId=null,S.open({title:`Crear Nuevo Salón`,body:`<form class="row g-2" id="formSalon">
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
    </form>`,saveText:`Guardar`,onSave:async e=>{let t=e.querySelector(`#modal-nombre`).value.trim(),n=parseInt(e.querySelector(`#modal-capacidad`).value),r=e.querySelector(`#modal-piso`).value,i=e.querySelector(`#modal-condicion`).value,a=e.querySelector(`#modal-esActivo`).value===`true`,o=e.querySelector(`#modal-equipamiento`).value.trim(),s=e.querySelector(`#modal-descripcion`).value.trim();if(!t||!n||!r)return x.error(`Por favor complete los campos obligatorios`),!1;await ho({nombre:t,capacidad:n,piso:r,condicion_fisica:i,is_active:a,equipamiento:o,descripcion:s}),V.fetchSalones(),x.success(`Salón creado correctamente`)}})}function So(e){let t=V.salones.find(t=>t.id===e);if(!t){x.error(`Salón no encontrado`);return}vo.editandoId=e,S.open({title:`Editar Salón`,body:`<form class="row g-2" id="formSalon">
      <div class="col-12">
        <label class="form-label-compact">Nombre *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required value="${H(t.nombre||``)}">
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
        <textarea class="form-control input-dense" id="modal-equipamiento" rows="2">${H(t.equipamiento||``)}</textarea>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="2">${H(t.descripcion||``)}</textarea>
      </div>
    </form>`,saveText:`Guardar cambios`,onSave:async t=>{try{let n=t.querySelector(`#modal-nombre`).value.trim(),r=parseInt(t.querySelector(`#modal-capacidad`).value),i=t.querySelector(`#modal-piso`).value,a=t.querySelector(`#modal-condicion`).value,o=t.querySelector(`#modal-esActivo`).value===`true`,s=t.querySelector(`#modal-equipamiento`).value.trim(),c=t.querySelector(`#modal-descripcion`).value.trim();return!n||!r||!i?(x.error(`Por favor complete los campos obligatorios`),!1):(await go(e,{nombre:n,capacidad:r,piso:i,condicion_fisica:a,is_active:o,equipamiento:s,descripcion:c}),await V.fetchSalones(),x.success(`Salón actualizado correctamente`),!0)}catch(e){return console.error(`Error al actualizar salón:`,e),x.error(e.message||`Error al actualizar el salón`),!1}}})}function Co(e){let t=V.salones.find(t=>t.id===e);if(!t){showToast(`Salón no encontrado`,`error`);return}let n=t.piso===0||t.piso===`0`?`Planta Baja`:`Piso ${t.piso}`,r={excelente:`Excelente`,buena:`Buena`,regular:`Regular`,mala:`Mala`}[t.condicion]||`-`,i=t.is_active===!1?`Inactivo`:`Activo`,a=t.is_active===!1?`bg-secondary`:`bg-success`;S.open({title:H(t.nombre||`Salón`),hideSave:!0,cancelText:`Cerrar`,onShow:t=>{t.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{S.close(),setTimeout(()=>So(e),300)}),t.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{S.close(),setTimeout(()=>wo(e),300)})},body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Código</label>
            <p class="form-control-plaintext"><code>${H(t.codigo||`-`)}</code></p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${H(t.nombre||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Capacidad</label>
            <p class="form-control-plaintext">${t.capacidad||`-`} personas</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Ubicación</label>
            <p class="form-control-plaintext">${H(n)}</p>
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
            <p class="form-control-plaintext">${H(t.equipamiento||`Sin equipamiento registrado`)}</p>
          </div>
        </div>
      </div>
      ${t.descripcion?`
      <hr>
      <div class="row">
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label fw-bold">Descripción</label>
            <p class="form-control-plaintext">${H(t.descripcion)}</p>
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
    `})}function wo(e){let t=V.salones.find(t=>t.id===e);if(!t){x.error(`Salón no encontrado`);return}S.open({title:`⚠️ Inactivar Salón`,size:`sm`,saveText:`Inactivar`,body:`<p>¿Inactivar el salón <strong>${H(t.nombre)}</strong>?</p>
           <p class="text-muted small mb-0">Esta acción lo ocultará de las asignaciones de clases.</p>`,onSave:async()=>{await _o(e),V.fetchSalones(),x.success(`Salón inactivado correctamente`)}})}function To(){C.register(`salones`,bo)}function Eo(){C.register(`clases`,Me)}var U={timeline:[],periodos:[],periodoActivo:null,clases:[],resumenGlobal:null,cargando:!1,filtroPeriodo:null,filtroClase:`todas`,container:null};async function Do(e){if(e)try{U.container=e,U.cargando=!0,ko(e);let[t,n,r]=await Promise.all([ee(),f(),o()]);U.periodos=t,U.periodoActivo=n,n?.id?U.filtroPeriodo=n.id:t&&t.length>0?U.filtroPeriodo=t[0].id:U.filtroPeriodo=null,U.clases=r,console.log(`🔍 renderAsistenciasView init:`,{periodosCount:t?.length||0,periodoActivo:n?.nombre,filtroPeriodo:U.filtroPeriodo}),await Oo(),jo(e),Fo(e)}catch(t){console.error(t),Ao(e,t.message)}}async function Oo(){let{timelineByDate:e,resumenGlobal:t}=await ze({periodoId:U.filtroPeriodo});U.timeline=e||[],U.resumenGlobal=t||{totalClases:0,totalPresentes:0,totalAusentes:0,totalJustificados:0,totalRegistros:0,totalSesiones:0}}function ko(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `}function Ao(e,t){e.innerHTML=`
    <div class="alert alert-danger m-3">
      <h5 class="alert-heading">Error al cargar asistencias</h5>
      <p>${_(t)}</p>
      <button class="btn btn-primary btn-sm" id="retry-btn">Reintentar</button>
    </div>
  `,e.querySelector(`#retry-btn`)?.addEventListener(`click`,()=>Do(e))}function jo(e){e.innerHTML=`
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
            ${U.periodos.map(e=>`<option value="${e.id}" ${e.id===U.filtroPeriodo?`selected`:``}>${_(e.nombre)}</option>`).join(``)}
          </select>
        </div>
      </div>

      <!-- Acordeons por Día -->
      <div class="accordion accordion-asistencias" id="accordion-dias">
        ${Mo()}
      </div>
    </div>
  `}function Mo(){return U.timeline.length===0?`<div class="text-center py-5 text-muted"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay clases registradas.</div>`:U.timeline.map((e,t)=>{let n=Po(e.fecha),r=`accordion-fecha-${t}`,i=e.clases.map((e,n)=>{let r=`accordion-clase-${t}-${n}`,i=e.hora_inicio?`${e.hora_inicio.slice(0,5)} - ${e.hora_fin?.slice(0,5)||`??:??`}`:`Sin horario`;return`
        <div class="accordion-item accordion-clase">
          <h2 class="accordion-header" id="heading-clase-${t}-${n}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${r}" aria-expanded="false" aria-controls="${r}">
              <div class="clase-header-info">
                <div class="clase-name">${_(e.clase_nombre)}</div>
                <div class="clase-meta">
                  <span class="horario">${i}</span>
                  <span class="maestro">Prof. ${_(e.maestro_nombre)}</span>
                  ${e.maestro_auxiliar_nombre?`<span class="auxiliar">Aux. ${_(e.maestro_auxiliar_nombre)}</span>`:``}
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
              ${No(e)}
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
    `}).join(``)}function No(e){let t=e.asistencias||[],n=t.filter(e=>e.estado===`presente`),r=t.filter(e=>e.estado===`ausente`),i=t.filter(e=>e.estado===`justificado`),a=(e,t,n)=>t.length===0?``:`
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
              <span>${_(e.alumno_nombre||`Sin nombre`)}</span>
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
              ${_(e.observacion_sesion||e.observacion_clase||`Sin observaciones registradas`)}
            </p>
          </div>
        </div>
      `:`
        <div class="text-muted small text-center py-3">
          <i class="bi bi-info-circle me-2"></i>No hay observaciones registradas para esta clase.
        </div>
      `}
    </div>
  `}function Po(e){return new Date(e+`T12:00:00`).toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`})}function Fo(e){e.querySelector(`#select-periodo`)?.addEventListener(`change`,async e=>{U.filtroPeriodo=e.target.value,await Io()}),e.querySelector(`#accordion-dias`)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="view-detail"]`);t&&Lo(t.dataset.id)}),e.querySelector(`#btn-nueva-sesion`)?.addEventListener(`click`,()=>Ro())}async function Io(){let e=U.container;x.info(`Cargando asistencias...`),await Oo();let t=e.querySelector(`.asistencias-header-premium p.text-muted`);t&&(t.textContent=`${U.resumenGlobal?.totalRegistros||0} registros en total`);let n=e.querySelector(`.stats-panel`);n&&(n.innerHTML=`
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
    `);let r=e.querySelector(`#accordion-dias`);r&&(r.innerHTML=Mo()),Fo(e),x.success(`Asistencias cargadas`)}async function Lo(e){x.info(`Cargando detalle...`);try{let t=await l(e);S.open({title:`Sesión: ${t.sesion.claseNombre}`,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
        <div class="row g-4">
          <div class="col-md-8">
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Tema Principal</label>
            <p class="fw-semibold">${_(t.sesion.temaPrincipal||`No especificado`)}</p>
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Observaciones Generales</label>
            <p class="text-secondary small">${_(t.sesion.observacionesGenerales||`Sin observaciones.`)}</p>
          </div>
          <div class="col-md-4 bg-body-tertiary p-3 rounded">
            <div class="d-flex justify-content-between mb-2"><span>Fecha:</span> <strong>${t.sesion.fecha}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${(t.sesion.horaInicio||`--:--`).slice(0,5)} - ${(t.sesion.horaFin||`--:--`).slice(0,5)}</strong></div>
            <div class="d-flex justify-content-between"><span>Maestro:</span> <strong>${_(t.sesion.maestroNombre)}</strong></div>
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
                      <td>${_(e.alumnoNombre)}</td>
                      <td class="text-center">
                        <span class="badge bg-${h[e.estado]?.css||`secondary`}">${h[e.estado]?.label||e.estado}</span>
                      </td>
                      <td class="small text-muted">${_(e.observacion||e.justificacionTexto||`-`)}</td>
                    </tr>
                  `).join(``)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `})}catch(e){x.error(`Error al cargar detalle: `+e.message)}}async function Ro(){x.info(`Funcionalidad de toma manual en desarrollo. Use el flujo desde la Ruta Gamificada.`)}function zo({titulo:e,valor:t,subtitulo:n,colorClass:r=`primary`,icono:i,tendencia:a}){let o=a&&[`subiendo`,`bajando`,`estable`].includes(a),s=a===`subiendo`?`↑`:a===`bajando`?`↓`:`→`,c=a===`subiendo`?`text-success`:a===`bajando`?`text-danger`:`text-muted`;return`
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
  `}var Bo={periodoActivo:null,periodos:[],datos:{programas:{},niveles:{},totales:{sesiones:0,presentes:0,ausentes:0,justificados:0}},cargando:!1};async function Vo(e){Bo.cargando=!0,e.innerHTML=Ho(),await Uo(),Bo.cargando=!1,Go(e)}function Ho(){return`
    <div class="admin-report-view">
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="text-muted">Cargando reportes de asistencia...</p>
      </div>
    </div>
  `}async function Uo(){let[e,t]=await Promise.all([ee(),f()]);Bo.periodos=e,Bo.periodoActivo=t,t&&(Bo.datos=Wo(await n({periodoId:t.id})))}function Wo(e){let t={},n={},r=0,i=0,a=0,o=0;for(let s of e)for(let e of s.sesiones){let s=e.claseNombre?.split(`-`)[0]?.trim()||`General`,c=e.instrumento||`General`;t[s]||(t[s]={total:0,presentes:0,ausentes:0,justificados:0}),t[s].total+=e.totalRegistros||0,t[s].presentes+=e.totalPresentes||0,t[s].ausentes+=e.totalAusentes||0,t[s].justificados+=e.totalJustificados||0,n[c]||(n[c]={total:0,presentes:0,ausentes:0,justificados:0}),n[c].total+=e.totalRegistros||0,n[c].presentes+=e.totalPresentes||0,n[c].ausentes+=e.totalAusentes||0,n[c].justificados+=e.totalJustificados||0,r++,i+=e.totalPresentes||0,a+=e.totalAusentes||0,o+=e.totalJustificados||0}return{programas:t,niveles:n,totales:{sesiones:r,presentes:i,ausentes:a,justificados:o}}}function Go(e){let{programas:t,niveles:n,totales:r}=Bo.datos,i=r.presentes+r.ausentes+r.justificados?Math.round(r.presentes/i*100):0;e.innerHTML=`
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
        <div class="col-md-3">${zo({titulo:`Sesiones`,valor:r.sesiones,colorClass:`primary`,icono:`bi-calendar3`})}</div>
        <div class="col-md-3">${zo({titulo:`Tasa Asistencia`,valor:`${i}%`,colorClass:i>=80?`success`:i>=50?`warning`:`danger`,icono:`bi-check-circle`})}</div>
        <div class="col-md-3">${zo({titulo:`Ausentes`,valor:r.ausentes,colorClass:`danger`,icono:`bi-x-circle`})}</div>
        <div class="col-md-3">${zo({titulo:`Justificados`,valor:r.justificados,colorClass:`warning`,icono:`bi-file-earmark-check`})}</div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-pie-chart me-2"></i>Por Programa</h5>
            </div>
            <div class="card-body" id="programasChart">
              ${Ko(t,`programa`)}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-bar-chart me-2"></i>Por Instrumento/Nivel</h5>
            </div>
            <div class="card-body" id="nivelesChart">
              ${Ko(n,`nivel`)}
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
  `}function Ko(e,t){if(!Object.keys(e).length)return`<p class="text-muted text-center py-3">Sin datos disponibles</p>`;let n=Object.entries(e).sort((e,t)=>t[1].presentes+t[1].ausentes-(e[1].presentes+e[1].ausentes));return Math.max(...n.map(([,e])=>e.presentes+e.ausentes+e.justificados)),n.slice(0,8).map(([e,t])=>{let n=t.presentes+t.ausentes+t.justificados,r=n?t.presentes/n*100:0,i=n?t.ausentes/n*100:0,a=n?t.justificados/n*100:0;return`
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
    `}).join(``)}function qo(){C.register(`asistencias`,Do),C.register(`asistencias-reportes`,Vo)}window.location.href.includes(`supabase`);async function Jo(e){let{data:t,error:n}=await b.from(`cobertura_alumno_objetivo`).upsert(e,{onConflict:`alumno_id,objetivo_id`}).select();if(n)throw n;return t}async function Yo(e){let{data:t,error:n}=await b.from(`cobertura_alumno_objetivo`).select(`
      id, nivel, confirmado, fecha, plan_id, objetivo_id,
      curriculo_objetivos ( id, descripcion, pilar_id,
        curriculo_pilares ( id, nombre )
      )
    `).eq(`alumno_id`,e);if(n)throw n;return t||[]}function Xo(){return`/functions/v1/groq-proxy`}async function Zo(){let{data:{session:e}}=await b.auth.getSession();return{Authorization:`Bearer ${e?.access_token??``}`,"Content-Type":`application/json`,apikey:``}}async function Qo(e,{maxTokens:t,temperature:n,responseFormat:r}={}){let i=await Zo(),a={model:v.groq.model,messages:e,...t&&{max_tokens:t},...n!==void 0&&{temperature:n},...r&&{response_format:r}},o=await fetch(`${Xo()}/chat`,{method:`POST`,headers:i,body:JSON.stringify(a)}),s=await o.json();if(!o.ok||s.error)throw Error(s.error?.message??`Groq proxy error ${o.status}`);return s.choices[0].message.content.trim()}async function $o(e,t,n){let r=`Eres un asistente pedagógico musical. Dado el contenido de un plan de clase y una lista de objetivos curriculares, identifica cuáles objetivos probablemente se cubrieron.

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
Solo incluye objetivos que tengan evidencia real en el plan. No inventes coberturas.`;if(v.isDemoMode)return{success:!0,coberturas:t.slice(0,2).flatMap(e=>n.slice(0,2).map(t=>({alumno:e,objetivo_id:t.id,nivel:`en_proceso`,razon:`Demo: objetivo relacionado con el tema`}))),isMock:!0};try{let e=await Qo([{role:`user`,content:r}],{maxTokens:1500,temperature:.3,responseFormat:{type:`json_object`}});return{success:!0,coberturas:JSON.parse(e||`{"coberturas":[]}`).coberturas||[],isMock:!1}}catch(e){return console.error(`extraerCobertura error:`,e),{success:!1,coberturas:[],error:e.message}}}async function es(e,t,n){let r=`Eres un asistente pedagógico musical. Genera un borrador de plan de clase personalizado.

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
Sé específico y pedagógicamente relevante para el instrumento y nivel.`;if(v.isDemoMode)return{success:!0,plan:{tema:`Clase de ${e.instrumento} — Nivel ${e.nivel}`,objetivos:t[0]?.descripcion||`Repaso general`,contenido:`Ejercicios de calentamiento, escala mayor, pieza del repertorio.`,recursos:[`Partitura del repertorio`,`Metrónomo`]},isMock:!0};try{let e=await Qo([{role:`user`,content:r}],{maxTokens:800,temperature:.7,responseFormat:{type:`json_object`}});return{success:!0,plan:JSON.parse(e||`{}`),isMock:!1}}catch(e){return console.error(`sugerirPlan error:`,e),{success:!1,plan:null,error:e.message}}}async function ts(e,t,n,r){let i=`Eres un mentor pedagógico musical. Analiza el trabajo de un maestro y da retroalimentación constructiva.

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

Tono: colega experto, respetuoso, propositivo. Sin tecnicismos innecesarios. Responde en español.`;if(v.isDemoMode)return{success:!0,feedback:`Tu enfoque en las últimas semanas muestra consistencia y dedicación. Se nota claridad en la presentación de contenidos técnicos.

Hay oportunidad de ampliar el trabajo en repertorio variado y lectura a primera vista.

Para las próximas semanas, incorporá al menos una pieza nueva por mes y dedicá 5-10 minutos a ejercicios de lectura rítmica.`,isMock:!0};try{return{success:!0,feedback:await Qo([{role:`user`,content:i}],{maxTokens:600,temperature:.8}),isMock:!1}}catch(e){return console.error(`analizarEnfoque error:`,e),{success:!1,feedback:``,error:e.message}}}var ns=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),rs=`
<style id="cobertura-modal-style">
.cob-alumno-block { border: 1px solid var(--bs-border-color); border-radius:8px; padding:.75rem; margin-bottom:.75rem; }
.cob-alumno-name { font-weight:600; margin-bottom:.5rem; }
.cob-obj-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.25rem; font-size:.875rem; }
.cob-nivel-sel { width: auto; font-size:.8rem; }
.cob-ai-badge { font-size:.7rem; color: var(--bs-warning-text-emphasis); }
</style>`;async function is({plan:e,claseId:t,instrumento:n,nivel:r,maestroId:i,onConfirm:a,onSkip:o}){let s=document.createElement(`div`);s.innerHTML=`${rs}
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
    </div>`,document.body.appendChild(s);let c=s.querySelector(`#cob-modal`),l=new bootstrap.Modal(c),u=[];s.querySelector(`#cob-btn-skip`).addEventListener(`click`,()=>{l.hide(),o?.()}),s.querySelector(`#cob-btn-confirm`).addEventListener(`click`,async()=>{let t=u.filter(e=>e.checked).map(t=>({alumno_id:t.alumno_id,objetivo_id:t.objetivo_id,plan_id:e.id,maestro_id:i,nivel:t.nivel,confirmado:!0,fecha:e.fecha_inicio||new Date().toISOString().slice(0,10)}));try{t.length>0&&await Jo(t),x.success(`Cobertura registrada`),l.hide(),a?.()}catch(e){x.error(e.message)}}),c.addEventListener(`hidden.bs.modal`,()=>s.remove()),l.show();try{let i=n&&r?await je(n,r):null,a=_e(e.notas_dsl||e.contenido||``).alumnos||[],o=[];if(a.length>0||t){let{data:e}=await b.from(`alumnos`).select(`id, nombre_completo`);a.length>0&&(o=(e||[]).filter(e=>a.some(t=>e.nombre_completo.toLowerCase().includes(t.toLowerCase()))))}if(o.length===0&&t){let{data:e}=await b.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,t);o=(e||[]).map(e=>e.alumnos).filter(Boolean)}let c=i?i.curriculo_pilares.flatMap(e=>e.curriculo_objetivos.map(t=>({...t,pilar_nombre:e.nombre}))):[],l=[];i&&c.length>0&&(l=(await $o({tema:e.tema,objetivos:e.objetivos,contenido:e.contenido,notas_dsl:e.notas_dsl},a,c.map(e=>({id:e.id,descripcion:e.descripcion})))).coberturas||[]),u=[],o.forEach(e=>{c.forEach(t=>{let n=l.find(n=>n.objetivo_id===t.id&&e.nombre_completo.toLowerCase().includes((n.alumno||``).toLowerCase()));u.push({alumno_id:e.id,alumno_nombre:e.nombre_completo,objetivo_id:t.id,obj_descripcion:t.descripcion,pilar_nombre:t.pilar_nombre,nivel:n?.nivel||`en_proceso`,checked:!!n,ai_suggested:!!n,razon:n?.razon||``})})}),d(),s.querySelector(`#cob-btn-confirm`).disabled=!1}catch(e){document.getElementById(`cob-body`).innerHTML=`
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se pudo analizar automáticamente: ${e.message}
        <br><small>Podés saltar este paso o confirmar sin cobertura.</small>
      </div>`,s.querySelector(`#cob-btn-confirm`).disabled=!1}function d(){let e=document.getElementById(`cob-body`);if(!u.length){e.innerHTML=`
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No hay currículo activo para este instrumento/nivel, o no se encontraron alumnos.
          Podés saltar este paso.
        </div>`;return}let t={};u.forEach(e=>{t[e.alumno_id]||(t[e.alumno_id]={nombre:e.alumno_nombre,rows:[]}),t[e.alumno_id].rows.push(e)}),e.innerHTML=`
      <p class="text-muted small mb-3">
        <i class="bi bi-robot me-1"></i>
        La IA pre-marcó los objetivos que probablemente se cubrieron. Revisá y ajustá según corresponda.
      </p>
      ${Object.entries(t).map(([e,{nombre:t,rows:n}])=>`
        <div class="cob-alumno-block">
          <div class="cob-alumno-name"><i class="bi bi-person me-1"></i>${ns(t)}</div>
          ${n.map(e=>{let t=u.indexOf(e);return`
            <div class="cob-obj-row">
              <input type="checkbox" class="form-check-input cob-check" data-idx="${t}" ${e.checked?`checked`:``}>
              <span style="flex:1">
                <span class="text-muted small">${ns(e.pilar_nombre)} /</span> ${ns(e.obj_descripcion)}
                ${e.ai_suggested?`<span class="cob-ai-badge ms-1"><i class="bi bi-stars"></i> IA</span>`:``}
              </span>
              <select class="form-select form-select-sm cob-nivel-sel" data-idx="${t}" ${e.checked?``:`disabled`}>
                <option value="iniciando" ${e.nivel===`iniciando`?`selected`:``}>Iniciando</option>
                <option value="en_proceso" ${e.nivel===`en_proceso`?`selected`:``}>En proceso</option>
                <option value="logrado" ${e.nivel===`logrado`?`selected`:``}>Logrado</option>
              </select>
            </div>`}).join(``)}
        </div>`).join(``)}`,e.querySelectorAll(`.cob-check`).forEach(t=>{t.addEventListener(`change`,()=>{let n=+t.dataset.idx;u[n].checked=t.checked;let r=e.querySelector(`.cob-nivel-sel[data-idx="${n}"]`);r&&(r.disabled=!t.checked)})}),e.querySelectorAll(`.cob-nivel-sel`).forEach(e=>{e.addEventListener(`change`,()=>{u[+e.dataset.idx].nivel=e.value})})}}var as=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);async function os(e){e.innerHTML=`
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
    </div>`;let t={alumnos:[],selectedAlumnoId:null,selectedAlumno:null,cobertura:[],curriculo:null,maestroId:null,instrumento:null},{data:{user:n}}=await b.auth.getUser(),{data:r}=await b.from(`maestros`).select(`id, instrumento`).eq(`user_id`,n.id).single();t.maestroId=r?.id,t.instrumento=r?.instrumento;let{data:i}=await b.from(`alumnos_clases`).select(`alumnos(id, nombre_completo), clases(instrumento, plan_estudio, maestro_principal_id)`).eq(`clases.maestro_principal_id`,t.maestroId),a={};(i||[]).forEach(e=>{e.alumnos&&e.clases&&(a[e.alumnos.id]={...e.alumnos,instrumento:e.clases.instrumento,nivel:e.clases.plan_estudio})}),t.alumnos=Object.values(a);let o=e.querySelector(`#ap-alumno-sel`);o.innerHTML=`<option value="">Seleccionar alumno...</option>`+t.alumnos.map(e=>`<option value="${e.id}">${as(e.nombre_completo)}</option>`).join(``),o.addEventListener(`change`,async()=>{let n=o.value;if(!n){e.querySelector(`#ap-brechas-content`).innerHTML=`<p class="text-muted small">Seleccioná un alumno.</p>`,e.querySelector(`#ap-btn-draft`).disabled=!0,t.selectedAlumnoId=null,t.selectedAlumno=null;return}t.selectedAlumnoId=n,t.selectedAlumno=t.alumnos.find(e=>e.id===n),e.querySelector(`#ap-btn-draft`).disabled=!1,await s()});async function s(){let n=e.querySelector(`#ap-brechas-content`);n.innerHTML=`<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-muted"></div></div>`;try{let e=t.selectedAlumno;if(t.curriculo=e.instrumento&&e.nivel?await je(e.instrumento,e.nivel):null,!t.curriculo){n.innerHTML=`<div class="alert alert-secondary py-2 small">Sin guía curricular definida para <strong>${as(e.instrumento||`este instrumento`)}</strong> — <strong>${as(e.nivel||`este nivel`)}</strong>.</div>`;return}t.cobertura=await Yo(t.selectedAlumnoId);let r={};t.cobertura.forEach(e=>{let t=e.curriculo_objetivos?.id||e.objetivo_id;t&&(r[t]=e)});let i=t.curriculo.curriculo_pilares.flatMap(e=>e.curriculo_objetivos.map(t=>({...t,pilar_nombre:e.nombre}))),a=i.filter(e=>r[e.id]?.nivel===`logrado`).length,o=i.filter(e=>r[e.id]&&r[e.id].nivel!==`logrado`).length;n.innerHTML=`
        <div class="mb-3">
          <span class="badge bg-success me-1">${a} logrados</span>
          <span class="badge bg-warning text-dark me-1">${o} en proceso</span>
          <span class="badge bg-secondary me-1">${i.length-a-o} no iniciados</span>
          <span class="text-muted small">de ${i.length} objetivos totales</span>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle small">
            <thead class="table-light">
              <tr><th>Pilar</th><th>Objetivo</th><th>Estado</th><th>Fuente</th></tr>
            </thead>
            <tbody>
              ${i.map(e=>{let t=r[e.id],n=t?.nivel||`no_iniciado`,i=n===`logrado`?`<span class="badge bg-success">✓ Logrado</span>`:n===`en_proceso`?`<span class="badge bg-warning text-dark">⟳ En proceso</span>`:n===`iniciando`?`<span class="badge bg-info text-dark">Iniciando</span>`:`<span class="badge bg-secondary">○ No iniciado</span>`,a=t?t.confirmado?`<i class="bi bi-check-circle text-success" title="Confirmado por maestro"></i>`:`<i class="bi bi-stars text-warning" title="Sugerido por IA"></i>`:`—`;return`<tr>
                  <td class="text-muted">${as(e.pilar_nombre)}</td>
                  <td>${as(e.descripcion)}</td>
                  <td>${i}</td>
                  <td class="text-center">${a}</td>
                </tr>`}).join(``)}
            </tbody>
          </table>
        </div>`}catch(e){n.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}}e.querySelector(`#ap-btn-draft`).addEventListener(`click`,async()=>{if(!t.selectedAlumno)return;let n=e.querySelector(`#ap-btn-draft`),r=e.querySelector(`#ap-draft-content`);n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Generando...`,r.innerHTML=``;try{let n=t.selectedAlumno,i=t.curriculo?.curriculo_pilares?.flatMap(e=>e.curriculo_objetivos.map(e=>e))||[],a={};t.cobertura.forEach(e=>{let t=e.curriculo_objetivos?.id||e.objetivo_id;t&&(a[t]=e)});let o=i.filter(e=>!a[e.id]||a[e.id].nivel!==`logrado`),{data:s}=await b.from(`planificaciones`).select(`tema`).eq(`maestro_id`,t.maestroId).eq(`estado`,`ejecutado`).order(`created_at`,{ascending:!1}).limit(3),c=(s||[]).map(e=>e.tema),l=await es({nombre:n.nombre_completo,instrumento:n.instrumento||`(sin instrumento)`,nivel:n.nivel||`(sin nivel)`},o,c);if(!l.success||!l.plan)throw Error(l.error||`Sin respuesta de la IA`);let u=l.plan;r.innerHTML=`
        <div class="card border-success border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-success bg-opacity-15 text-success">Borrador generado por IA</span>
              <button class="btn btn-sm btn-success" id="ap-btn-save-draft">
                <i class="bi bi-floppy me-1"></i>Guardar como plan
              </button>
            </div>
            <div class="mb-2"><span class="fw-semibold">Tema:</span> ${as(u.tema||``)}</div>
            <div class="mb-2"><span class="fw-semibold">Objetivos:</span> ${as(u.objetivos||``)}</div>
            <div class="mb-2"><span class="fw-semibold">Contenido:</span> ${as(u.contenido||``)}</div>
            ${u.recursos?.length?`<div><span class="fw-semibold">Recursos:</span> ${u.recursos.map(e=>`<span class="badge bg-light text-dark border me-1">${as(e)}</span>`).join(``)}</div>`:``}
          </div>
        </div>`,e.querySelector(`#ap-btn-save-draft`)?.addEventListener(`click`,()=>{document.dispatchEvent(new CustomEvent(`planificacion:nuevoPlan`,{detail:{tema:u.tema,objetivos:u.objetivos,contenido:u.contenido}})),x.success(`Borrador listo — abrí "Nuevo plan" para completar los detalles`)})}catch(e){r.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}finally{n.disabled=!1,n.innerHTML=`<i class="bi bi-stars me-1"></i>Generar borrador`}}),e.querySelector(`#ap-btn-feedback`).addEventListener(`click`,async()=>{let n=e.querySelector(`#ap-btn-feedback`),r=e.querySelector(`#ap-feedback-content`);n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Analizando...`,r.innerHTML=``;try{let n=new Date;n.setDate(n.getDate()-56);let{data:i}=await b.from(`planificaciones`).select(`tema, contenido, objetivos, instrumento`).eq(`maestro_id`,t.maestroId).eq(`estado`,`ejecutado`).gte(`created_at`,n.toISOString()),a=t.instrumento||i?.[0]?.instrumento||`Instrumento`,o=null;try{o=a?await je(a,null):null}catch{}let s=t.selectedAlumnoId&&t.selectedAlumno?`Alumno seleccionado: ${t.selectedAlumno.nombre_completo}. ${t.cobertura.length} objetivos trabajados.`:`No hay alumno seleccionado.`,c=await ts(a,i||[],o,s);if(!c.success)throw Error(c.error||`Sin respuesta de la IA`);r.innerHTML=`
        <div class="card border-warning border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge bg-warning bg-opacity-15 text-warning-emphasis">Análisis pedagógico</span>
              <button class="btn btn-sm btn-outline-secondary" id="ap-btn-regenerate">
                <i class="bi bi-arrow-clockwise me-1"></i>Regenerar
              </button>
            </div>
            <div class="text-body" style="line-height:1.7; white-space:pre-line">${as(c.feedback)}</div>
          </div>
        </div>`,e.querySelector(`#ap-btn-regenerate`)?.addEventListener(`click`,()=>{e.querySelector(`#ap-btn-feedback`).click()})}catch(e){r.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}finally{n.disabled=!1,n.innerHTML=`<i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque`}})}var ss=`
<style id="curriculo-modal-style">
.cm-pilar { border: 1px solid var(--bs-border-color); border-radius: 8px; margin-bottom: .75rem; }
.cm-pilar-header { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; background:var(--bs-tertiary-bg); border-radius:7px 7px 0 0; }
.cm-pilar-body { padding:.5rem .75rem; }
.cm-obj-row { display:flex; align-items:center; gap:.5rem; padding:.25rem 0; border-bottom: 1px solid var(--bs-border-color-translucent); }
.cm-obj-row:last-child { border-bottom: none; }
.cm-obj-input { flex:1; }
</style>`;function cs(e){let t=document.getElementById(`curriculo-list-modal`);t&&t.remove();let n=document.createElement(`div`);n.id=`curriculo-list-modal`,n.innerHTML=`${ss}
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
    </div>`,document.body.appendChild(n);let r=n.querySelector(`#curriculo-list-modal-dialog`),i=new bootstrap.Modal(r);async function a(){let e=document.getElementById(`cl-body`);try{let t=await Te();if(t.length===0){e.innerHTML=`<p class="text-muted text-center py-4">No hay currículos creados aún.</p>`;return}e.innerHTML=`
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
        </table>`,e.querySelectorAll(`.cl-toggle`).forEach(e=>{e.addEventListener(`change`,async()=>{await ye(e.dataset.id,e.checked),x.success(e.checked?`Currículo activado`:`Currículo desactivado`)})}),e.querySelectorAll(`.cl-btn-edit`).forEach(e=>{e.addEventListener(`click`,()=>us(e.dataset.id,a))})}catch(t){e.innerHTML=`<p class="text-danger">${t.message}</p>`}}n.querySelector(`#cl-btn-nuevo`).addEventListener(`click`,()=>{ls(a)}),r.addEventListener(`hidden.bs.modal`,()=>{n.remove(),e?.()}),i.show(),a()}function ls(e){let t=document.createElement(`div`);t.innerHTML=`
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
    </div>`,document.body.appendChild(t);let n=t.querySelector(`#cc-modal`),r=new bootstrap.Modal(n);t.querySelector(`#cc-btn-save`).addEventListener(`click`,async()=>{let n=t.querySelector(`#cc-instrumento`).value.trim(),i=t.querySelector(`#cc-nivel`).value.trim();if(!n||!i){x.error(`Instrumento y nivel son obligatorios`);return}try{await se({instrumento:n,nivel:i,descripcion:t.querySelector(`#cc-desc`).value.trim()}),x.success(`Currículo creado`),r.hide(),e?.()}catch(e){x.error(e.message)}}),n.addEventListener(`hidden.bs.modal`,()=>t.remove()),r.show()}async function us(e,n){let{data:r,error:i}=await b.from(`curriculos`).select(`id, instrumento, nivel, descripcion, curriculo_pilares(id, nombre, orden, curriculo_objetivos(id, descripcion, orden))`).eq(`id`,e).single();if(i){x.error(i.message);return}let a=document.createElement(`div`);a.innerHTML=`
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
      </div>`,e.querySelectorAll(`.pilar-nombre`).forEach(e=>{e.addEventListener(`blur`,async()=>{await oe(e.closest(`[data-pilar-id]`).dataset.pilarId,{nombre:e.value.trim()})})}),e.querySelectorAll(`.pilar-del`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-pilar-id]`).dataset.pilarId;confirm(`¿Eliminar este pilar y todos sus objetivos?`)&&(await Fe(t),r.curriculo_pilares=r.curriculo_pilares.filter(e=>e.id!==t),c())})}),e.querySelectorAll(`.obj-desc`).forEach(e=>{e.addEventListener(`blur`,async()=>{await u(e.closest(`[data-obj-id]`).dataset.objId,{descripcion:e.value.trim()})})}),e.querySelectorAll(`.obj-del`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-obj-id]`),n=t.dataset.objId;await fe(n);let i=t.closest(`[data-pilar-id]`).dataset.pilarId,a=r.curriculo_pilares.find(e=>e.id===i);a&&(a.curriculo_objetivos=a.curriculo_objetivos.filter(e=>e.id!==n)),c()})}),e.querySelectorAll(`.new-obj-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-pilar-id]`),n=t.dataset.pilarId,i=t.querySelector(`.new-obj-input`),a=i.value.trim();if(!a)return;let o=r.curriculo_pilares.find(e=>e.id===n),s=(o?.curriculo_objetivos||[]).length,l=await g(n,a,s);o&&(o.curriculo_objetivos=[...o.curriculo_objetivos||[],l]),i.value=``,c()})}),document.getElementById(`ce-add-pilar`)?.addEventListener(`click`,async()=>{let e=prompt(`Nombre del nuevo pilar:`);if(!e?.trim())return;let n=r.curriculo_pilares.length,i=await t(r.id,e.trim(),n);r.curriculo_pilares.push({...i,curriculo_objetivos:[]}),c()})}o.addEventListener(`hidden.bs.modal`,()=>{a.remove(),n?.()}),s.show(),c()}var ds=[{id:`escala`,nombre:`Escala Mayor`,instrumento:`Piano / Guitarra`,descripcion:`Trabajo de escalas diatónicas mayores en posición cerrada.`,contenido:`[Indicador] Ejecuta la escala de Do mayor en dos octavas con digitación correcta
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
{Actividad} Construcción de acordes en el instrumento`}],W={planes:[],planesOriginales:[],cargando:!1,viewMode:`maestro`,activeTab:`planes`,asistenteRendered:!1,seleccionados:new Set,container:null};async function fs(e,{viewMode:t=`maestro`}={}){if(e){if(W.container=e,W.viewMode=t,W.seleccionados=new Set,W.asistenteRendered=!1,t===`plantillas`){ys(e);return}try{W.cargando=!0,ps(e);let t=await ke();W.planes=t,W.planesOriginales=[...t],W.cargando=!1,hs(e),xs(e)}catch(t){console.error(`[planificacionView]`,t),ms(e,t.message)}}}function ps(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>`}function ms(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${_(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>planificaciones</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`}function hs(e){let t=W.viewMode===`admin`,n=t?`Todas las Planificaciones`:`Mis Planes de Clase`,r=t?`bi-shield-check`:`bi-journal-check`,i=t?`${W.planesOriginales.length} planes pendientes de revisión`:`${W.planesOriginales.length} planes registrados`,a=t?gs():``;e.innerHTML=`
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
            ${he.getEstados().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
              ${_s(W.planes)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${W.planes.length===0?vs():``}</div>
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
  `}function gs(){let e=W.planesOriginales,t=e.filter(e=>e.estado===`ejecutado`).length,n=e.filter(e=>e.estado===`revisado`).length,r=e.length;return`
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
  `}function _s(e){if(!e||e.length===0)return``;let t=W.viewMode===`admin`;return e.map(e=>{let n=he.getEstadoConfig(e.estado),r=e.estado===`revisado`?`border-accent-success`:e.estado===`ejecutado`?`border-accent-warning`:`border-accent-secondary`;return`
      <tr data-id="${e.id}" class="border-start-accent ${r}">
        ${t?`<td><input type="checkbox" class="plan-check" value="${e.id}" ${W.seleccionados.has(e.id)?`checked`:``}></td>`:``}
        <td>
          <div class="fw-bold">${_(e.clase_nombre||`Sin clase`)}</div>
          <div class="small text-muted text-truncate" style="max-width: 260px">${_(e.tema)}</div>
        </td>
        ${t?`<td class="d-none d-md-table-cell align-middle small text-muted">${_(e.maestro_nombre||`N/A`)}</td>`:``}
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
    `}).join(``)}function vs(){let e=W.viewMode===`admin`;return`
    <div class="text-center py-5 px-3">
      <i class="bi bi-journal-x text-muted d-block mb-3" style="font-size: 3rem; opacity: .4"></i>
      <h5 class="text-muted fw-normal mb-1">
        ${e?`No hay planificaciones registradas aún`:`Todavía no tienes planes de clase`}
      </h5>
      <p class="text-muted small mb-0">
        ${e?`Una vez que los maestros creen sus planes, aparecerán aquí para revisión.`:`Crea tu primer plan de clase usando el botón de arriba o usa una plantilla.`}
      </p>
    </div>
  `}function ys(e){e.innerHTML=`
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
        ${ds.map(e=>`
          <div class="col-md-6">
            <div class="page-glass rounded p-4 h-100 d-flex flex-column">
              <div class="d-flex align-items-start gap-3 mb-3">
                <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px;height:40px">
                  <i class="bi bi-journal-text fs-5"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0">${_(e.nombre)}</h5>
                  <span class="badge bg-secondary bg-opacity-10 text-secondary border small">${_(e.instrumento)}</span>
                </div>
              </div>
              <p class="text-muted small flex-grow-1">${_(e.descripcion)}</p>
              <details class="mb-3">
                <summary class="small text-primary" style="cursor:pointer">Ver contenido DSL</summary>
                <pre class="mt-2 p-2 bg-body-tertiary rounded small border" style="font-size:.75rem;white-space:pre-wrap">${_(e.contenido)}</pre>
              </details>
              <button class="btn btn-outline-primary btn-sm" data-template-id="${e.id}">
                <i class="bi bi-plus-circle me-1"></i>Usar esta plantilla
              </button>
            </div>
          </div>
        `).join(``)}
      </div>
    </div>
  `,e.querySelectorAll(`button[data-template-id]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=ds.find(t=>t.id===e.dataset.templateId);t&&bs(t)})})}function bs(e){S.open({title:`Usar plantilla: ${e.nombre}`,saveText:`Crear Plan`,size:`lg`,body:`
      <form id="form-tpl" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="tpl-tema" value="${_(e.nombre)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="tpl-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="tpl-objetivos" rows="2">${_(e.descripcion)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido DSL</label>
          <textarea class="form-control input-dense font-monospace" id="tpl-contenido" rows="7">${_(e.contenido)}</textarea>
        </div>
      </form>
    `,onOpen:async e=>{let{data:t}=await b.from(`clases`).select(`id, nombre`).order(`nombre`),n=e.querySelector(`#tpl-clase_id`);n.innerHTML=`<option value="">Seleccionar clase...</option>`+(t||[]).map(e=>`<option value="${e.id}">${_(e.nombre)}</option>`).join(``)},onSave:async e=>{let t={tema:e.querySelector(`#tpl-tema`).value.trim(),clase_id:e.querySelector(`#tpl-clase_id`).value,objetivos:e.querySelector(`#tpl-objetivos`).value.trim(),contenido:e.querySelector(`#tpl-contenido`).value.trim()};try{return await ae(t),x.success(`Plan creado desde plantilla`),!0}catch(e){return x.error(e.message),!1}}})}function xs(e){let t=W.viewMode===`admin`;e.querySelector(`#buscar-plan`)?.addEventListener(`input`,Ss),e.querySelector(`#select-estado`)?.addEventListener(`change`,Ss),e.querySelector(`#btn-help-planificacion`)?.addEventListener(`click`,()=>{ge.open({title:`Planificación`,intro:`Módulo para gestionar los planes de clase. Cada plan documenta qué se trabajará en una clase, en qué fecha, y si fue ejecutado o no.`,sections:[{icon:`bi-journal-text`,title:`Tab Mis planes`,description:`Lista tus planes personales. Filtrá por estado (planificado, ejecutado, cancelado) y creá nuevos desde "Nuevo plan".`,color:`#3b82f6`},{icon:`bi-file-earmark-template`,title:`Tab Plantillas`,description:`Plantillas reutilizables en formato DSL. Sirven como base para crear nuevos planes rápidamente.`,color:`#6366f1`},{icon:`bi-journal-check`,title:`Todas las planes (admin)`,description:`Solo visible para administradores. Muestra los planes de todos los maestros para supervisión.`,color:`#10b981`},{icon:`bi-circle-fill`,title:`Estados del plan`,description:`"Planificado" = no dictado aún. "Ejecutado" = clase dada. "Cancelado" = no se realizó. Mantenerlos actualizados mejora los reportes.`,color:`#f59e0b`}]})}),t||e.querySelector(`#btn-nuevo-plan`)?.addEventListener(`click`,()=>ws(null)),t&&(e.querySelector(`#check-all`)?.addEventListener(`change`,t=>{let n=t.target.checked;W.seleccionados=n?new Set(W.planes.map(e=>e.id)):new Set,e.querySelectorAll(`.plan-check`).forEach(e=>{e.checked=n}),Cs()}),e.querySelector(`#btn-aprobar-bulk`)?.addEventListener(`click`,async()=>{let t=[...W.seleccionados];if(t.length)try{await d(t),x.success(`${t.length} plan(es) aprobados`),fs(e,{viewMode:W.viewMode})}catch(e){x.error(e.message)}})),e.querySelectorAll(`#planificacion-tabs .nav-link`).forEach(t=>{t.addEventListener(`click`,()=>{if(W.activeTab=t.dataset.tab,[`planes`,`plantillas`,`asistente`].forEach(t=>{let n=e.querySelector(`#tab-content-${t}`);n&&(n.style.display=W.activeTab===t?`block`:`none`)}),e.querySelectorAll(`#planificacion-tabs .nav-link`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),W.activeTab===`asistente`&&!W.asistenteRendered){let t=e.querySelector(`#tab-content-asistente`);t&&(os(t),W.asistenteRendered=!0)}})}),document.addEventListener(`planificacion:nuevoPlan`,e=>{ws(null)},{once:!0}),t&&e.querySelector(`#btn-curriculo-admin`)?.addEventListener(`click`,()=>{cs()}),e.querySelector(`#planes-tbody`)?.addEventListener(`change`,e=>{if(!e.target.classList.contains(`plan-check`))return;let t=e.target.value;e.target.checked?W.seleccionados.add(t):W.seleccionados.delete(t),Cs()}),e.querySelector(`#planes-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit`&&ws(r),n===`delete`&&Os(r),n===`approve`&&Es(r),n===`view`&&Ts(r),n===`ejecutar`&&Ds(r)})}function Ss(){let e=W.container.querySelector(`#buscar-plan`)?.value.toLowerCase()||``,t=W.container.querySelector(`#select-estado`)?.value||``;W.planes=W.planesOriginales.filter(n=>{let r=(n.tema||``).toLowerCase().includes(e)||(n.clase_nombre||``).toLowerCase().includes(e),i=!t||n.estado===t;return r&&i});let n=W.container.querySelector(`#planes-tbody`),r=W.container.querySelector(`#empty-container`);n&&(n.innerHTML=_s(W.planes)),r&&(r.innerHTML=W.planes.length===0?vs():``)}function Cs(){let e=W.container?.querySelector(`#btn-aprobar-bulk`);e&&(e.style.display=W.seleccionados.size>0?``:`none`)}async function ws(e,t={}){let n=e?W.planesOriginales.find(t=>t.id===e):new he(t);S.open({title:e?`Editar Plan de Clase`:`Nuevo Plan de Clase`,saveText:`Guardar Plan`,size:`lg`,body:`
      <form id="form-plan" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="plan-tema" value="${_(n.tema)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="plan-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="plan-objetivos" rows="2">${_(n.objetivos)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido Pedagógico (DSL)</label>
          <div class="border rounded p-2 bg-body-tertiary mb-1 d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '[Indicador] '">+ Indicador</button>
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '{Actividad} '">+ Actividad</button>
            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="document.getElementById('plan-contenido').value += '# Nota: '">+ Nota</button>
          </div>
          <textarea class="form-control input-dense font-monospace" id="plan-contenido" rows="6" placeholder="#Pedro [Escala de Do mayor] $tempo60 (Mantener dedos curvos) {Practicar 10 min diarios} 4/5 >ObjetivoTecnica&#10;#Lucía [Lectura rítmica] (Contar en voz alta antes de tocar) {Repetir compases 1-4} 3/5&#10;&#10;Guía: #Alumno | [contenido] | (sugerencia) | {tarea} | $medida técnica | N/5 | >objetivo">${_(n.contenido)}</textarea>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Fecha de inicio</label>
          <input type="date" class="form-control input-dense" id="plan-fecha" value="${n.fecha_inicio||``}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Instrumento / Área</label>
          <input type="text" class="form-control input-dense" id="plan-instrumento" value="${_(n.instrumento||``)}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Método de evaluación</label>
          <input type="text" class="form-control input-dense" id="plan-eval" value="${_(n.evaluacion_metodo||``)}">
        </div>
      </form>
    `,onOpen:async e=>{let{data:t}=await b.from(`clases`).select(`id, nombre`).order(`nombre`),r=e.querySelector(`#plan-clase_id`);r.innerHTML=`<option value="">Seleccionar clase...</option>`+(t||[]).map(e=>`<option value="${e.id}" ${e.id===n.clase_id?`selected`:``}>${_(e.nombre)}</option>`).join(``)},onSave:async t=>{let n={tema:t.querySelector(`#plan-tema`).value.trim(),clase_id:t.querySelector(`#plan-clase_id`).value,objetivos:t.querySelector(`#plan-objetivos`).value.trim(),contenido:t.querySelector(`#plan-contenido`).value.trim(),fecha_inicio:t.querySelector(`#plan-fecha`).value||null,instrumento:t.querySelector(`#plan-instrumento`).value.trim()||null,evaluacion_metodo:t.querySelector(`#plan-eval`).value.trim()||null},r=new he(n).validate();if(r.length>0)return x.error(r[0]),!1;try{return e?(await ie(e,n),x.success(`Plan actualizado correctamente`)):(await ae(n),x.success(`Plan creado correctamente`)),fs(W.container,{viewMode:W.viewMode}),!0}catch(e){return x.error(e.message),!1}}})}function Ts(e){let t=W.planesOriginales.find(t=>t.id===e);if(!t)return;let n=he.getEstadoConfig(t.estado);S.open({title:`Plan: ${t.clase_nombre||`Sin clase`}`,hideSave:!0,size:`lg`,body:`
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <div class="small text-muted text-uppercase fw-bold mb-1">Tema</div>
          <div class="fw-bold">${_(t.tema)}</div>
        </div>
        <div class="col-md-4 text-md-end">
          <span class="badge ${n.color} fs-6">${n.label}</span>
        </div>
      </div>
      ${t.maestro_nombre?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Maestro</div>
          <div>${_(t.maestro_nombre)}</div>
        </div>
      `:``}
      ${t.objetivos?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Objetivos</div>
          <div class="text-muted">${_(t.objetivos)}</div>
        </div>
      `:``}
      ${t.contenido?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Contenido DSL</div>
          <pre class="p-3 rounded border bg-body-tertiary small" style="white-space:pre-wrap">${_(t.contenido)}</pre>
        </div>
      `:``}
      <div class="row g-2">
        ${t.fecha_inicio?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-calendar me-1"></i>${t.fecha_inicio}</span></div>`:``}
        ${t.instrumento?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-music-note me-1"></i>${_(t.instrumento)}</span></div>`:``}
        ${t.evaluacion_metodo?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-clipboard-check me-1"></i>${_(t.evaluacion_metodo)}</span></div>`:``}
      </div>
    `})}async function Es(e){try{await d([e]),x.success(`Plan aprobado y marcado como revisado`),fs(W.container,{viewMode:W.viewMode})}catch(e){x.error(e.message)}}async function Ds(e){let t=W.planesOriginales.find(t=>t.id===e);if(!t)return;let n=t.instrumento,r=null,i=t.clase_id;if(i){let{data:e}=await b.from(`clases`).select(`instrumento, plan_estudio`).eq(`id`,i).single();e&&(n||=e.instrumento,r=e.plan_estudio)}let{data:{user:a}}=await b.auth.getUser(),{data:o}=await b.from(`maestros`).select(`id`).eq(`user_id`,a.id).single(),s=o?.id;is({plan:t,claseId:i,instrumento:n,nivel:r,maestroId:s,onConfirm:async()=>{try{await ie(e,{estado:`ejecutado`}),x.success(`Plan marcado como ejecutado`),fs(W.container,{viewMode:W.viewMode})}catch(e){x.error(e.message)}},onSkip:async()=>{try{await ie(e,{estado:`ejecutado`}),x.success(`Plan ejecutado (sin cobertura)`),fs(W.container,{viewMode:W.viewMode})}catch(e){x.error(e.message)}}})}async function Os(e){let t=W.planesOriginales.find(t=>t.id===e);t&&S.open({title:`⚠️ Eliminar Plan`,saveText:`Eliminar`,body:`<p>¿Estás seguro de eliminar el plan <strong>"${_(t.tema)}"</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await s(e),x.success(`Plan eliminado`),fs(W.container,{viewMode:W.viewMode}),!0}catch(e){return x.error(e.message),!1}}})}function ks(){C.register(`planificacion`,e=>fs(e,{viewMode:`maestro`})),C.register(`planificacion-plantillas`,e=>fs(e,{viewMode:`plantillas`})),C.register(`planificacion-maestros`,e=>fs(e,{viewMode:`admin`}))}var As={attendance_min_rate:.7,attendance_window_weeks:4,grade_min_avg:6,grade_window_count:3,indicator_min_pass_rate:.5,indicator_window_weeks:4};async function js(){let{data:e,error:t}=await b.from(`alumnos`).select(`*`).order(`nombre_completo`,{ascending:!0});if(t)throw console.error(`Error cargando alumnos:`,t.message),Error(`No se pudieron cargar los alumnos`);return e}async function Ms(){let{data:e,error:t}=await b.from(`clases`).select(`*`).order(`nombre`,{ascending:!0});if(t)throw console.error(`Error cargando clases:`,t.message),Error(`No se pudieron cargar las clases`);return e}async function Ns(){let{data:e,error:t}=await b.from(`progresos`).select(`*`).order(`fecha_evaluacion`,{ascending:!1});if(t)throw console.error(`Error cargando progresos:`,t.message),Error(`No se pudieron cargar los progresos`);return e}async function Ps(e){if(!e.alumno_id)throw Error(`El alumno es obligatorio`);if(!e.clase_id)throw Error(`La clase es obligatoria`);if(!e.evaluacion_tipo)throw Error(`El tipo de evaluacion es obligatorio`);let t={alumno_id:e.alumno_id,clase_id:e.clase_id,maestro_id:e.maestro_id||null,fecha_evaluacion:e.fecha_evaluacion||null,evaluacion_tipo:e.evaluacion_tipo.trim(),calificacion:e.calificacion!==void 0&&e.calificacion!==null?parseFloat(e.calificacion):null,estado_cualitativo:(e.estado_cualitativo||`en_progreso`).trim(),observaciones:(e.observaciones||``).trim(),indicadores:e.indicadores||null};if(e.sesion_clase_id&&(t.sesion_clase_id=e.sesion_clase_id),e.asistencia_id&&(t.asistencia_id=e.asistencia_id),e.ejercicio_id&&(t.ejercicio_id=e.ejercicio_id),t.calificacion!==null&&(t.calificacion<0||t.calificacion>5))throw Error(`La calificacion debe estar entre 0 y 5`);let{data:n,error:r}=await b.from(`progresos`).insert([t]).select();if(r)throw r.message.includes(`duplicate key`)||r.code===`23505`?Error(`Ya existe una evaluacion con ese tipo para este alumno en esta clase`):(console.error(`Error creando progreso:`,r.message),Error(`No se pudo crear el progreso`));return n[0]}async function Fs(e){let{data:t,error:n}=await b.from(`progresos`).select(`*`).eq(`clase_id`,e).order(`fecha_evaluacion`,{ascending:!1});if(n)throw console.error(`Error cargando progresos de la clase:`,n.message),Error(`No se pudieron cargar los progresos de la clase`);return t}async function Is(e){let{data:t,error:n}=await b.from(`progresos`).select(`calificacion`).eq(`alumno_id`,e).not(`calificacion`,`is`,null);if(n)throw console.error(`Error calculando promedio:`,n.message),Error(`No se pudo calcular el promedio`);if(!t||t.length===0)return null;let r=t.reduce((e,t)=>e+parseFloat(t.calificacion),0);return parseFloat((r/t.length).toFixed(2))}async function Ls(e,t){let{jsPDF:n}=await Ge(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-CIPNF2Pl.js`).then(e=>e.n);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:r}=await Ge(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BYntMLuC.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([7,4])),i=new n,a=e.name||e.nombre||`Sin nombre`,o=e.section||`Sin sección`,s=Rs(t),c=s!==null&&zs(s);i.setFontSize(18),i.text(`Boletín Académico`,14,22),i.setFontSize(11),i.text(`Alumno: ${a}`,14,32),i.text(`Sección: ${o}`,14,38),i.text(`Fecha: ${new Date().toLocaleDateString(`es-ES`)}`,14,44);let l=c?`EN RIESGO`:`SATISFACTORIO`,u=c?[185,27,27]:[39,174,96];i.setFillColor(...u),i.rect(14,50,60,10,`F`),i.setTextColor(255,255,255),i.setFontSize(10),i.text(l,18,57),i.setTextColor(0,0,0),i.setFontSize(12),i.text(`Promedio: ${s===null?`N/A`:s.toFixed(2)}`,80,55),i.text(`Evaluaciones: ${t.length}`,80,62),t.length>0&&r(i,{head:[[`Fecha`,`Tipo`,`Calificación`,`Etiqueta`,`Observaciones`]],body:t.map(e=>[e.fecha_evaluacion?Bs(e.fecha_evaluacion):`-`,Vs(e.tipo_evaluacion),e.calificacion===null?`-`:e.calificacion.toFixed(2),Hs(e.calificacion),e.observaciones?e.observaciones.substring(0,40)+(e.observaciones.length>40?`...`:``):`-`]),startY:70,styles:{fontSize:9},headStyles:{fillColor:[41,128,185]}}),i.save(`boletin-${a.replace(/\s+/g,`-`).toLowerCase()}.pdf`)}function Rs(e){if(!e||e.length===0)return null;let t=e.filter(e=>e.calificacion!==null&&e.calificacion!==void 0).map(e=>parseFloat(e.calificacion));return t.length===0?null:t.reduce((e,t)=>e+t,0)/t.length}function zs(e){return e==null?!1:parseFloat(e)<3}function Bs(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):`-`}function Vs(e){return{oral:`Oral`,escrita:`Escrita`,practica:`Práctica`,evaluacion_parcial:`Parcial`,evaluacion_final:`Final`}[e]||e||`-`}function Hs(e){if(e==null)return`-`;let t=parseFloat(e);return t>=4.5?`Sobresaliente`:t>=4?`Muy Bueno`:t>=3?`Bueno`:t>=2?`En Progreso`:`Necesita Mejorar`}var Us=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||``,this.clase_id=e.clase_id||``,this.maestro_id=e.maestro_id||null,this.fecha_evaluacion=e.fecha_evaluacion||``,this.tipo_evaluacion=e.tipo_evaluacion||e.evaluacion_tipo||``,this.calificacion=e.calificacion!==void 0&&e.calificacion!==null?parseFloat(e.calificacion):null,this.observaciones=e.observaciones||``,this.estado=e.estado||`en_progreso`,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];this.alumno_id||t.push(`El alumno es obligatorio`),this.clase_id||t.push(`La clase es obligatoria`),!this.tipo_evaluacion||!this.tipo_evaluacion.trim()?t.push(`El tipo de evaluación es obligatorio`):e.getTiposEvaluacion().map(e=>e.value).includes(this.tipo_evaluacion)||t.push(`Tipo de evaluación no válido`),this.calificacion!==null&&this.calificacion!==void 0&&(isNaN(this.calificacion)||this.calificacion<0||this.calificacion>5)&&t.push(`La calificación debe estar entre 0.0 y 5.0`),this.observaciones&&this.observaciones.length>500&&t.push(`Las observaciones no pueden exceder 500 caracteres`);let n=e.getEstados().map(e=>e.value);return this.estado&&!n.includes(this.estado)&&t.push(`Estado no válido`),t}static getTiposEvaluacion(){return[{value:`parcial`,label:`Parcial`},{value:`final`,label:`Final`},{value:`continua`,label:`Continua`},{value:`oral`,label:`Oral`},{value:`escrita`,label:`Escrita`},{value:`practica`,label:`Práctica`}]}static getEstados(){return[{value:`en_progreso`,label:`En Progreso`,color:`bg-primary`},{value:`completado`,label:`Completado`,color:`bg-success`},{value:`pendiente`,label:`Pendiente`,color:`bg-secondary`}]}static getEstadoConfig(e){return this.getEstados().find(t=>t.value===e)||{value:e,label:e,color:`bg-secondary`}}toJSON(){return{alumno_id:this.alumno_id,clase_id:this.clase_id,maestro_id:this.maestro_id,fecha_evaluacion:this.fecha_evaluacion||null,tipo_evaluacion:this.tipo_evaluacion.trim(),calificacion:this.calificacion,observaciones:this.observaciones?this.observaciones.trim():null,estado:this.estado}}};function Ws(e){if(!e||e.length===0)return{promedio:null,total:0,enRiesgo:!1};let t=e.map(e=>e.calificacion).filter(e=>e!=null&&!isNaN(e));if(t.length===0)return{promedio:null,total:e.length,enRiesgo:!1};let n=t.reduce((e,t)=>e+t,0),r=parseFloat((n/t.length).toFixed(2));return{promedio:r,total:e.length,enRiesgo:r<3}}async function Gs(e){let t=await Fs(e),n={};return t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]=[]),n[e.alumno_id].push(e)}),Object.entries(n).map(([e,t])=>({alumnoId:e,progresos:t,rendimiento:Ws(t)}))}var Ks={calcularRendimiento:Ws,getResumenProgresosClase:Gs},G={progresos:[],progresosOriginales:[],alumnos:[],clases:[],cargando:!1,filtroClase:`todas`,container:null};async function qs(e){if(e)try{G.container=e,G.cargando=!0,Js(e);let[t,n,r]=await Promise.all([Ns(),js(),Ms()]);G.progresos=(t||[]).map(e=>new Us(e)),G.progresosOriginales=[...G.progresos],G.alumnos=n||[],G.clases=r||[],G.cargando=!1,Xs(e),Qs(e)}catch(t){console.error(t),Ys(e,t.message)}}function Js(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function Ys(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${_(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>progresos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`}function Xs(e){let t=G.progresosOriginales.length,n=G.progresosOriginales.filter(e=>e.calificacion!=null).map(e=>parseFloat(e.calificacion)),r=n.length>0?(n.reduce((e,t)=>e+t,0)/n.length).toFixed(2):null,i={};G.progresosOriginales.forEach(e=>{i[e.alumno_id]||(i[e.alumno_id]=[]),e.calificacion!=null&&i[e.alumno_id].push(parseFloat(e.calificacion))});let a=0;Object.values(i).forEach(e=>{e.length!==0&&e.reduce((e,t)=>e+t,0)/e.length<3&&a++});let o=Object.keys(i).length,s=new Set(G.progresosOriginales.map(e=>e.clase_id)).size;e.innerHTML=`
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
            ${G.clases.map(e=>`<option value="${e.id}" ${e.id===G.filtroClase?`selected`:``}>${_(e.nombre)}</option>`).join(``)}
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
              ${Zs()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function Zs(){let e=G.container.querySelector(`#buscar-progreso`)?.value.trim().toLowerCase()||``,t=G.filtroClase,n={};G.progresosOriginales.forEach(r=>{let i=G.alumnos.find(e=>e.id===r.alumno_id),a=G.clases.find(e=>e.id===r.clase_id);t!==`todas`&&r.clase_id!==t||e&&!i?.nombre_completo.toLowerCase().includes(e)&&!a?.nombre.toLowerCase().includes(e)||(n[r.alumno_id]||(n[r.alumno_id]={alumno:i,lista:[]}),n[r.alumno_id].lista.push(r))});let r=Object.values(n);return r.length===0?`<tr><td colspan="5" class="text-center py-5 text-muted">No hay resultados.</td></tr>`:r.map(({alumno:e,lista:t})=>{let n=Ks.calcularRendimiento(t);return`
      <tr class="border-start-accent ${n.enRiesgo?`border-accent-danger`:`border-accent-success`}">
        <td>
          <div class="fw-bold">${_(e?.nombre_completo||`Desconocido`)}</div>
          <div class="small text-muted">${t.length>0?_(G.clases.find(e=>e.id===t[0].clase_id)?.nombre):``}</div>
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
    `}).join(``)}function Qs(e){e.querySelector(`#select-clase`)?.addEventListener(`change`,t=>{G.filtroClase=t.target.value,e.querySelector(`#progresos-tbody`).innerHTML=Zs()}),e.querySelector(`#buscar-progreso`)?.addEventListener(`input`,()=>{e.querySelector(`#progresos-tbody`).innerHTML=Zs()}),e.querySelector(`#progresos-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,alumnoId:r}=t.dataset;n===`pdf`&&$s(r),n===`view-detail`&&ec(r)}),e.querySelector(`#btn-nueva-nota`)?.addEventListener(`click`,()=>tc())}async function $s(e){let t=G.alumnos.find(t=>t.id===e),n=G.progresosOriginales.filter(t=>t.alumno_id===e);x.info(`Generando boletín institucional...`);try{await Ls(t,n),x.success(`Boletín generado exitosamente`)}catch(e){x.error(`Error al generar PDF: `+e.message)}}function ec(e){let t=G.alumnos.find(t=>t.id===e),n=G.progresosOriginales.filter(t=>t.alumno_id===e),r=Ks.calcularRendimiento(n);S.open({title:`Detalle Académico: ${t.nombre_completo}`,size:`lg`,hideSave:!0,body:`
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
                <td class="small text-muted">${_(e.observaciones||`-`)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `})}function tc(){S.open({title:`Registrar Nueva Calificación`,saveText:`Guardar Nota`,body:`
      <form id="form-nota" class="row g-3">
        <div class="col-md-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="nota-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${G.alumnos.map(e=>`<option value="${e.id}">${e.nombre_completo}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="nota-clase_id" required>
            <option value="">Seleccionar...</option>
            ${G.clases.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo de Evaluación *</label>
          <select class="form-select input-dense" id="nota-tipo" required>
            ${Us.getTiposEvaluacion().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
    `,onSave:async e=>{let t={alumno_id:e.querySelector(`#nota-alumno_id`).value,clase_id:e.querySelector(`#nota-clase_id`).value,tipo_evaluacion:e.querySelector(`#nota-tipo`).value,calificacion:parseFloat(e.querySelector(`#nota-valor`).value),fecha_evaluacion:e.querySelector(`#nota-fecha`).value,observaciones:e.querySelector(`#nota-obs`).value.trim()},n=new Us(t).validate();if(n.length>0)return x.error(n[0]),!1;try{return await Ps(t),x.success(`Nota registrada exitosamente`),qs(G.container),!0}catch(e){return x.error(e.message),!1}}})}function nc(){C.register(`progresos`,qs)}function rc(e){return e?Array.isArray(e)?e.map(e=>new c(e)):new c(e):null}async function ic(){let{data:e,error:t}=await b.from(`observaciones_alumnos`).select(`
      *,
      alumno:alumnos(nombre_completo),
      maestro:maestros(nombre_completo)
    `).order(`fecha_observacion`,{ascending:!1});if(t)throw console.error(`Error cargando observaciones:`,t.message),Error(`No se pudieron cargar las observaciones`);return e.map(e=>{let t=new c(e);return t.alumno_nombre=e.alumno?.nombre_completo||`Desconocido`,t.maestro_nombre=e.maestro?.nombre_completo||`N/A`,t})}async function ac(e){let t=new c(e),n=t.validate();if(n.length>0)throw Error(n[0]);let{data:r,error:i}=await b.from(`observaciones_alumnos`).insert([t.toJSON()]).select();if(i)throw i;return rc(r[0])}async function oc(e,t){let{data:n}=await b.from(`observaciones_alumnos`).select(`*`).eq(`id`,e).single(),r=new c({...n,...t}),i=r.validate();if(i.length>0)throw Error(i[0]);let{data:a,error:o}=await b.from(`observaciones_alumnos`).update(r.toJSON()).eq(`id`,e).select();if(o)throw o;return rc(a[0])}async function sc(e){let{error:t}=await b.from(`observaciones_alumnos`).delete().eq(`id`,e);if(t)throw t}async function cc(e,t){let{data:n,error:r}=await b.from(`observaciones_alumnos`).update({seguimiento_observacion:t.trim(),seguimiento_fecha:new Date().toISOString().split(`T`)[0],estado:`seguimiento`,requiere_seguimiento:!0}).eq(`id`,e).select();if(r)throw r;return rc(n[0])}async function lc(){let{data:e,error:t}=await b.from(`observaciones_alumnos`).select(`estado, prioridad, tipo`);if(t)throw t;return{total:e.length,abiertas:e.filter(e=>e.estado===`abierta`).length,seguimiento:e.filter(e=>e.estado===`seguimiento`).length,altas:e.filter(e=>e.prioridad===`alta`).length,porTipo:e.reduce((e,t)=>(e[t.tipo]=(e[t.tipo]||0)+1,e),{})}}function uc(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}var K={observaciones:[],observacionesOriginales:[],alumnos:[],estadisticas:null,cargando:!1,filtroTipo:``,filtroEstado:`todos`,container:null};async function dc(e){if(e)try{K.container=e,K.cargando=!0,fc(e);let[t,n,r]=await Promise.all([ic(),de().catch(()=>[]),lc().catch(()=>null)]);K.observaciones=t,K.observacionesOriginales=[...t],K.alumnos=n,K.estadisticas=r,K.cargando=!1,mc(e),_c(e)}catch(t){console.error(t),pc(e,t.message)}}function fc(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function pc(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${uc(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>observaciones_alumnos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
          <button class="btn btn-outline-warning btn-sm mt-3" id="retry-btn">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>
    </div>`,e.querySelector(`#retry-btn`)?.addEventListener(`click`,()=>dc(e))}function mc(e){e.innerHTML=`
    <div class="page-container">
      <div class="observaciones-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-clipboard2-pulse fs-4"></i>
          </div>
          <div>
            <h1 class="observaciones-title-premium page-title mb-0">Observaciones</h1>
            <p class="text-muted small mb-0">${K.observaciones.length} observaciones en total</p>
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
            <div class="stat-value">${K.estadisticas?.abiertas||0}</div>
          </div>
          <div class="stat-card stat-justified border-start border-4 border-warning">
            <div class="stat-label">Seguimiento</div>
            <div class="stat-value">${K.estadisticas?.seguimiento||0}</div>
          </div>
          <div class="stat-card stat-absent border-start border-4 border-danger">
            <div class="stat-label">Alta Prioridad</div>
            <div class="stat-value">${K.estadisticas?.altas||0}</div>
          </div>
          <div class="stat-card stat-present border-start border-4 border-success">
            <div class="stat-label">Total</div>
            <div class="stat-value">${K.estadisticas?.total||0}</div>
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
            ${c.getTipos().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
              ${hc(K.observaciones)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${K.observaciones.length===0?gc():``}</div>
      </div>
    </div>
  `}function hc(e){return e.map(e=>{let t=c.getTipos().find(t=>t.value===e.tipo),n=c.getPrioridades().find(t=>t.value===e.prioridad),r=c.getEstados().find(t=>t.value===e.estado),i=e.prioridad===`alta`?`border-accent-danger`:e.prioridad===`media`?`border-accent-warning`:`border-accent-secondary`;return`
      <tr data-id="${e.id}" class="border-start-accent ${i}">
        <td>
          <div class="fw-bold text-truncate" style="max-width: 250px;">${uc(e.titulo)}</div>
          <div class="small text-muted">${uc(e.alumno_nombre)}</div>
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
    `}).join(``)}function gc(){return`<div class="text-center py-5 text-muted"><i class="bi bi-chat-left-dots fs-1 d-block mb-2"></i>No se encontraron observaciones.</div>`}function _c(e){e.querySelector(`#buscar-obs`)?.addEventListener(`input`,vc),e.querySelector(`#select-tipo`)?.addEventListener(`change`,vc),e.querySelector(`#obs-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit`&&yc(r),n===`delete`&&xc(r),n===`follow`&&bc(r)}),e.querySelector(`#btn-nueva-obs`)?.addEventListener(`click`,()=>yc(null))}function vc(){let e=K.container.querySelector(`#buscar-obs`).value.toLowerCase(),t=K.container.querySelector(`#select-tipo`).value;K.observaciones=K.observacionesOriginales.filter(n=>{let r=n.titulo.toLowerCase().includes(e)||n.alumno_nombre.toLowerCase().includes(e),i=!t||n.tipo===t;return r&&i}),K.container.querySelector(`#obs-tbody`).innerHTML=hc(K.observaciones)}async function yc(e){let t=e?K.observacionesOriginales.find(t=>t.id===e):new c;S.open({title:e?`Editar Observación`:`Nueva Observación`,saveText:`Guardar`,body:`
      <form id="form-obs" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="obs-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${K.alumnos.map(e=>`<option value="${e.id}" ${e.id===t.alumno_id?`selected`:``}>${uc(e.nombre_completo)}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-8">
          <label class="form-label-compact">Título de la Incidencia *</label>
          <input type="text" class="form-control input-dense" id="obs-titulo" value="${uc(t.titulo)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Prioridad</label>
          <select class="form-select input-dense" id="obs-prioridad">
            ${c.getPrioridades().map(e=>`<option value="${e.value}" ${e.value===t.prioridad?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo</label>
          <select class="form-select input-dense" id="obs-tipo">
            ${c.getTipos().map(e=>`<option value="${e.value}" ${e.value===t.tipo?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Fecha</label>
          <input type="date" class="form-control input-dense" id="obs-fecha" value="${t.fecha_observacion||new Date().toISOString().split(`T`)[0]}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción Detallada *</label>
          <textarea class="form-control input-dense" id="obs-descripcion" rows="4" required>${uc(t.descripcion)}</textarea>
        </div>
      </form>
    `,onSave:async t=>{let n={alumno_id:t.querySelector(`#obs-alumno_id`).value,titulo:t.querySelector(`#obs-titulo`).value.trim(),prioridad:t.querySelector(`#obs-prioridad`).value,tipo:t.querySelector(`#obs-tipo`).value,fecha_observacion:t.querySelector(`#obs-fecha`).value,descripcion:t.querySelector(`#obs-descripcion`).value.trim()},r=new c(n).validate();if(r.length>0)return x.error(r[0]),!1;try{return e?(await oc(e,n),x.success(`Observación actualizada`)):(await ac(n),x.success(`Observación registrada`)),dc(K.container),!0}catch(e){return x.error(e.message),!1}}})}function bc(e){let t=K.observacionesOriginales.find(t=>t.id===e);S.open({title:`Añadir Seguimiento`,saveText:`Guardar Seguimiento`,body:`
      <p class="small text-muted mb-3">Estás añadiendo una nota de seguimiento a: <strong>${uc(t.titulo)}</strong></p>
      <div class="mb-3">
        <label class="form-label-compact">Nota de seguimiento</label>
        <textarea class="form-control input-dense" id="follow-obs" rows="4" placeholder="Describe las acciones tomadas..."></textarea>
      </div>
    `,onSave:async t=>{let n=t.querySelector(`#follow-obs`).value.trim();if(!n)return x.error(`La nota es obligatoria`),!1;try{return await cc(e,n),x.success(`Seguimiento registrado`),dc(K.container),!0}catch(e){return x.error(e.message),!1}}})}function xc(e){let t=K.observacionesOriginales.find(t=>t.id===e);S.open({title:`⚠️ Eliminar Observación`,saveText:`Eliminar`,body:`<p>¿Estás seguro de eliminar "${uc(t.titulo)}"?</p>`,onSave:async()=>(await sc(e),dc(K.container),!0)})}function Sc(){C.register(`observaciones`,dc)}var Cc=[{id:`rpt_master`,nombre:`Analítica Crítica Institucional`,descripcion:`Visión 360°: Cruce de asistencia, rendimiento y gestión docente con IA`,frecuencia:`mensual`,tipo:`global`,icon:`bi-shield-shaded`},{id:`rpt_003`,nombre:`Reporte de Alumnos en Riesgo`,descripcion:`Detección automática de bajo rendimiento y ausentismo con IA`,frecuencia:`semanal`,tipo:`riesgo`,icon:`bi-exclamation-triangle`},{id:`rpt_002`,nombre:`Boletín de Progreso General`,descripcion:`Resumen de calificaciones y evolución por programa`,frecuencia:`mensual`,tipo:`progreso`,icon:`bi-graph-up`},{id:`rpt_001`,nombre:`Análisis de Asistencia Crítica`,descripcion:`Identificación de patrones de deserción y faltas injustificadas`,frecuencia:`semanal`,tipo:`asistencia`,icon:`bi-calendar-check`}],q={reportes:[],programada:!1};async function wc(e){q.reportes=[...Cc],Tc(e),Dc(e)}function Tc(e){e.innerHTML=`
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
                <input class="form-check-input" type="checkbox" id="programacionActiva" ${q.programada?`checked`:``}>
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
        ${q.reportes.map(e=>Ec(e)).join(``)}
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
                  ${q.reportes.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Período</label>
                <div class="d-flex gap-2">
                  <input type="date" class="form-control form-control-sm" id="genDesde" value="${Fc()}">
                  <input type="date" class="form-control form-control-sm" id="genHasta" value="${Pc()}">
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
  `}function Ec(e){let t={diaria:`danger`,semanal:`warning`,mensual:`info`}[e.frecuencia]||`secondary`;return`
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
  `}function Dc(e){e.querySelector(`#btnNuevoReporte`)?.addEventListener(`click`,()=>Oc(e)),e.querySelectorAll(`[data-action]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.id;t.dataset.action===`generar`?kc(n):t.dataset.action===`editar`&&Mc(n,e)})}),e.querySelector(`#btnGenerarAhora`)?.addEventListener(`click`,()=>Nc(e)),e.querySelector(`#btnEnviarEmail`)?.addEventListener(`click`,()=>_enviarEmail(e)),e.querySelector(`#programacionActiva`)?.addEventListener(`change`,e=>{q.programada=e.target.checked,S.open({title:q.programada?`Programación Activada`:`Programación Desactivada`,body:`<div class="alert alert-${q.programada?`success`:`warning`} mb-0">La generación de reportes está ahora ${q.programada?`activa`:`inactiva`}.</div>`,hideSave:!0,cancelText:`Cerrar`})})}function Oc(e){S.open({title:`Nueva Plantilla de Reporte`,size:`md`,saveText:`Crear`,body:`
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
    `,onSave:()=>{let t=document.getElementById(`newReporteNombre`).value.trim();if(!t)return alert(`El nombre es obligatorio`),!1;q.reportes.unshift({id:`rpt_`+Date.now(),nombre:t,descripcion:document.getElementById(`newReporteDesc`).value,tipo:document.getElementById(`newReporteTipo`).value,frecuencia:document.getElementById(`newReporteFreq`).value,icon:`bi-file-earmark-text`}),Tc(e),S.close()}})}async function kc(e){let t=q.reportes.find(t=>t.id===e);if(t){S.showLoading(`Analizando datos para: ${t.nombre}...`);try{let[e,n,r]=await Promise.all([de(),Ms(),Ns()]),i=``,a=[];if(t.tipo===`riesgo`){let t=(await Promise.all(e.map(async e=>{let t=await Is(e.id);return{...e,promedio:t}}))).filter(e=>e.promedio!==null&&e.promedio<3);a=t.map(e=>({nombre:e.nombre,valor:e.promedio,unidad:`Promedio`})),i=`
        Se han detectado ${t.length} alumnos con promedio menor a 3.0 de un total de ${e.length} inscritos.
        Detalle de alumnos críticos:
        ${t.map(e=>`- ${e.nombre}: Promedio ${e.promedio}`).join(`
`)}
        
        Por favor, genera un análisis ejecutivo para la dirección escolar, identificando posibles causas generales y sugiriendo un plan de intervención pedagógica.
      `}else if(t.tipo===`asistencia`){let{data:t,error:n}=await b.from(`sesiones_clase`).select(`asistencia`).eq(`borrador`,!1);if(n)throw n;let r={};t.forEach(e=>{(e.asistencia||[]).forEach(e=>{r[e.alumno_id]||(r[e.alumno_id]={total:0,presentes:0}),r[e.alumno_id].total++,e.estado===`presente`&&r[e.alumno_id].presentes++})});let o=e.map(e=>{let t=r[e.id]||{total:0,presentes:0},n=t.total>0?Math.round(t.presentes/t.total*100):100;return{...e,asistenciaPct:n}}).filter(e=>e.asistenciaPct<80);a=o.map(e=>({nombre:e.nombre,valor:e.asistenciaPct+`%`,unidad:`Asistencia`})),i=`
        Reporte de Asistencia Crítica (Menos del 80%).
        Se han detectado ${o.length} alumnos en riesgo de deserción o falta de compromiso.
        Detalle de alumnos con baja asistencia:
        ${o.map(e=>`- ${e.nombre}: ${e.asistenciaPct}% de asistencia`).join(`
`)}
        
        Analiza estos datos y sugiere estrategias de retención y comunicación con los representantes.
      `}else if(t.tipo===`global`){let[t,o]=await Promise.all([b.from(`sesiones_clase`).select(`asistencia`).eq(`borrador`,!1),b.from(`maestros`).select(`nombre_completo, especialidad`)]),s=t.data?.length||0,c=r.length>0?(r.reduce((e,t)=>e+(t.calificacion||0),0)/r.length).toFixed(2):`N/A`;i=`
        ANÁLISIS GLOBAL DE LA INSTITUCIÓN.
        - Total Estudiantes: ${e.length}
        - Total Clases: ${n.length}
        - Total Maestros: ${o.data?.length||0}
        - Promedio Académico General: ${c}
        - Sesiones de clase registradas: ${s}
        
        Realiza un diagnóstico profundo de la salud académica de la institución. Identifica fortalezas basadas en el volumen de datos y debilidades si el promedio o la asistencia muestran alarmas. Proyecta los resultados para el próximo período. Genera conclusiones críticas para la toma de decisiones.
      `,a=[{nombre:`Promedio Institucional`,valor:c,unidad:`Puntos`},{nombre:`Cobertura de Clases`,valor:s,unidad:`Sesiones`},{nombre:`Población Estudiantil`,valor:e.length,unidad:`Alumnos`}]}else i=`Genera un resumen ejecutivo para un reporte de tipo ${t.tipo} basado en ${e.length} alumnos y ${n.length} clases activas.`;let o=await Ke([{role:`system`,content:`Eres un experto en gestión educativa y análisis de datos académicos.`},{role:`user`,content:`Actúa como un Coordinador Académico Senior. Basado en los siguientes datos reales del sistema SOI:\n${i}\n\nGenera el reporte en formato Markdown, con secciones claras: # Resumen Ejecutivo, ## Hallazgos Clave, y ## Recomendaciones.`}]);S.close(),S.open({title:`<i class="bi bi-stars text-primary me-2"></i>Análisis de IA: ${t.nombre}`,size:`lg`,saveText:`<i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF`,body:`
        <div class="reporte-preview p-3">
          <div class="mb-4 bg-light p-3 rounded border-start border-primary border-4">
            <h6 class="fw-bold mb-1"><i class="bi bi-info-circle me-2"></i>Resumen de Datos Analizados</h6>
            <p class="small text-muted mb-0">Se procesaron registros de ${e.length} estudiantes y ${r.length} evaluaciones recientes.</p>
          </div>
          
          <div class="ia-content markdown-body mb-4">
            ${Ac(o)}
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
      `,onSave:async()=>(jc(t.nombre,o,a),!1)})}catch(e){console.error(e),S.close(),x.error(`Error al generar el análisis: `+e.message)}}}function Ac(e){return e.replace(/^### (.*$)/gim,`<h5 class="fw-bold mt-4 mb-2">$1</h5>`).replace(/^## (.*$)/gim,`<h4 class="fw-bold mt-4 mb-2 border-bottom pb-1">$1</h4>`).replace(/^# (.*$)/gim,`<h3 class="fw-bold mb-3 text-primary">$1</h3>`).replace(/^\* (.*$)/gim,`<li class="ms-3 mb-1">$1</li>`).replace(/\*\*(.*)\*\*/gim,`<strong>$1</strong>`).replace(/\n/g,`<br>`)}async function jc(e,t,n){let{jsPDF:r}=await Ge(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-CIPNF2Pl.js`).then(e=>e.n);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:i}=await Ge(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BYntMLuC.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([7,4]));x.info(`Generando documento PDF...`);let a=new r,o=a.internal.pageSize.width;a.setFillColor(41,128,185),a.rect(0,0,o,40,`F`),a.setTextColor(255,255,255),a.setFontSize(22),a.text(`SOI - Sistema Operativo Institucional`,14,20),a.setFontSize(12),a.text(e.toUpperCase(),14,30),a.text(new Date().toLocaleDateString(),o-40,30),a.setTextColor(0,0,0),a.setFontSize(14),a.setFont(void 0,`bold`),a.text(`Análisis Crítico con IA`,14,55),a.setFontSize(10),a.setFont(void 0,`normal`);let s=t.replace(/[#*]/g,``).split(`
`).filter(e=>e.trim()!==``),c=65;s.forEach(e=>{let t=a.splitTextToSize(e.trim(),o-28);c+t.length*5>280&&(a.addPage(),c=20),a.text(t,14,c),c+=t.length*5+2}),n&&n.length>0&&i(a,{startY:c+10,head:[[`Indicador / Estudiante`,`Valor`,`Unidad`]],body:n.map(e=>[e.nombre,e.valor,e.unidad]),theme:`striped`,headStyles:{fillColor:[41,128,185]},styles:{fontSize:9}});let l=a.internal.getNumberOfPages();for(let e=1;e<=l;e++)a.setPage(e),a.setFontSize(8),a.setTextColor(150),a.text(`Página ${e} de ${l} - Generado por SOI Intelligence`,o/2,290,{align:`center`});a.save(`Reporte_SOI_${e.replace(/\s+/g,`_`)}.pdf`),x.success(`PDF descargado con éxito`)}function Mc(e,t){let n=q.reportes.find(t=>t.id===e);n&&S.open({title:`Editar Reporte`,size:`md`,saveText:`Guardar`,body:`
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
    `,onSave:()=>{let n=q.reportes.findIndex(t=>t.id===e);n!==-1&&(q.reportes[n]={...q.reportes[n],nombre:document.getElementById(`editReporteNombre`).value,descripcion:document.getElementById(`editReporteDesc`).value,tipo:document.getElementById(`editReporteTipo`).value,frecuencia:document.getElementById(`editReporteFreq`).value}),Tc(t),S.close()}})}function Nc(e){let t=e.querySelector(`#generarAhoraSelect`).value;e.querySelector(`#genDesde`).value,e.querySelector(`#genHasta`).value;let n=e.querySelector(`input[name="genFormat"]:checked`).value;if(!t){alert(`Selecciona un reporte`);return}S.showLoading(`Generando reporte...`),setTimeout(()=>{S.close();let e=new Blob([`Reporte generado`],{type:`text/plain`}),r=URL.createObjectURL(e),i=document.createElement(`a`);i.href=r,i.download=`reporte-${t}-${new Date().toISOString().slice(0,10)}.${n}`,i.click(),URL.revokeObjectURL(r)},1500)}function Pc(){return new Date().toISOString().slice(0,10)}function Fc(){let e=new Date;return e.setDate(e.getDate()-7),e.toISOString().slice(0,10)}function Ic(){C.register(`metricas`,Se),C.register(`metricas-alertas`,Se),C.register(`metricas-riesgo`,Se),C.register(`metricas-maestros`,Se),C.register(`metricas-destacados`,Se),C.register(`metricas-ia-reportes`,wc)}new class{constructor(){this.cache=new Map,this.cacheExpiry=300*1e3}getCached(e){let t=this.cache.get(e);return t&&Date.now()-t.timestamp<this.cacheExpiry?t.data:null}setCached(e,t){this.cache.set(e,{data:t,timestamp:Date.now()})}async getDashboardData(){let e=this.getCached(`dashboard`);if(e)return e;let t={periodoActivo:await ue(),alertas:await pe(),alertasActivas:await Ie()};return this.setCached(`dashboard`,t),t}async getTasaAsistenciaAlumno(e,t=30){let n=new Date;return n.setDate(n.getDate()-t),Oe(e,n.toISOString().split(`T`)[0])}calcularPorcentaje(e,t){return e<t.rojo?`rojo`:e<t.naranja?`naranja`:e<t.amarillo?`amarillo`:`verde`}generarAlertas(e,t){let n=[];return e<t.umbral_rojo?n.push({nivel:`rojo`,mensaje:`Asistencia crítica`}):e<t.umbral_naranja?n.push({nivel:`naranja`,mensaje:`Asistencia baja`}):e<t.umbral_amarillo&&n.push({nivel:`amarillo`,mensaje:`Precaución`}),n}clearCache(){this.cache.clear()}};function Lc(){C.register(`configuracion`,async e=>{let{renderConfigView:t}=await Ge(async()=>{let{renderConfigView:e}=await import(`./configView-BtNp2Cng.js`);return{renderConfigView:e}},__vite__mapDeps([8,9,4,1,10]));await t(e)}),C.register(`importar-datos`,async e=>{let{renderImportView:t}=await Ge(async()=>{let{renderImportView:e}=await import(`./importView-CB3w4pxd.js`);return{renderImportView:e}},__vite__mapDeps([11,1]));await t(e)})}function Rc(e=[]){return!e||e.length===0?`
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
                    ${e.map(e=>zc(e)).join(``)}
                </tbody>
            </table>
        </div>
    `}function zc(e){let t=e.progress_percentage||0,n=t<40?`progress-low`:t<80?`progress-mid`:`progress-high`,r=e.health_status||`not_started`,i=e.last_activity_at?new Date(e.last_activity_at).toLocaleDateString():`Sin actividad`;return`
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
    `}function Bc(e=[]){return!e||e.length===0?`
            <div class="pm-empty">
                <i class="bi bi-fire"></i>
                <p>No se han detectado puntos críticos pedagógicos.</p>
            </div>
        `:`
        <div class="aa-hotspots-grid pm-animate-fade-in">
            ${e.map(e=>Vc(e)).join(``)}
        </div>
    `}function Vc(e){let t=e.failure_percentage||0;return`
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
    `}async function Hc(){return`
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
                    ${Rc([])}
                </div>
            </section>

            <!-- Sección 2: Hotspots Pedagógicos (Dificultad por Nodo) -->
            <section class="mt-5">
                <h2 class="aa-hotspot-name fs-4 mb-4">Puntos de Calor Pedagógicos</h2>
                <div id="hotspots-container">
                    ${Bc([])}
                </div>
            </section>
        </div>
    `}function Uc(){C.register(`gestion-curricular`,e=>{ce(e)}),C.register(`planificacion-curricular`,e=>{ce(e)}),C.register(`torre-de-control`,async e=>{e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{e.innerHTML=await Hc()}catch(t){e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el dashboard: ${t.message}</p></div>`}})}async function Wc(){try{let{data:e,error:t}=await b.from(`maestro_desempeño`).select(`
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
        `).order(`updated_at`,{ascending:!1});if(t)throw console.error(`[getMaestrosComplianceStatus] Error:`,t),t;return e||[]}catch(e){throw console.error(`[getMaestrosComplianceStatus] Exception:`,e),e}}async function Gc(e){try{let{data:t,error:n}=await b.from(`registros_pendientes`).select(`
        id,
        created_at,
        notification_state,
        notif_count,
        last_notified_at,
        clases(nombre),
        sesiones_clase(fecha, hora_inicio)
        `).eq(`maestro_id`,e).eq(`estado`,`pendiente`).in(`tipo`,[`asistencia_pendiente`,`contenido_pendiente`]).order(`created_at`,{ascending:!1});if(n)throw console.error(`[getMaestroPendingRegistros] Error:`,n),n;return t||[]}catch(e){throw console.error(`[getMaestroPendingRegistros] Exception:`,e),e}}var Kc=class{constructor(e){this.containerId=e,this.container=document.getElementById(e),this.maestros=[],this.filteredMaestros=[],this.currentFilter={categoria:null,estado:null,diasAtrasoMin:0,diasAtrasoMax:999}}async init(){try{this.container.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando cumplimiento de maestros...</div>
        </div>
      `,await this.loadData(),this.render(),this.attachEventListeners(),console.log(`[CumplimientoMaestrosWidget] Initialized with`,this.maestros.length,`maestros`)}catch(e){console.error(`[CumplimientoMaestrosWidget] Init error:`,e),this.container.innerHTML=`
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando datos: ${e.message}</div>
        </div>
      `}}async loadData(){let e=await Wc();this.maestros=await Promise.all(e.map(async e=>{let t=await this.getPendingCount(e.maestro_id),n=await this.getOldestDiasAtraso(e.maestro_id);return{...e,pendingCount:t,oldestDiasAtraso:n,statusColor:this.getStatusColor(e.categoria),categoryLabel:this.getCategoryLabel(e.categoria)}})),this.filteredMaestros=[...this.maestros]}async getPendingCount(e){try{return(await Gc(e)).length}catch{return 0}}async getOldestDiasAtraso(e){try{let t=await Gc(e);return t.length===0?0:t.reduce((e,t)=>{let n=new Date(t.created_at).getTime(),r=Math.ceil((Date.now()-n)/(1e3*60*60*24));return Math.max(e,r)},0)}catch{return 0}}getStatusColor(e){return{responsable:`#10b981`,regular:`#f59e0b`,incumplidor:`#f97316`,negligente:`#dc2626`}[e]||`#9ca3af`}getCategoryLabel(e){return{responsable:`Responsable ✓`,regular:`Regular`,incumplidor:`Incumplidor`,negligente:`Negligente ⚠️`}[e]||e}applyFilter(e){this.currentFilter={...this.currentFilter,...e},this.filteredMaestros=this.maestros.filter(e=>!(this.currentFilter.categoria&&e.categoria!==this.currentFilter.categoria||this.currentFilter.diasAtrasoMin&&e.oldestDiasAtraso<this.currentFilter.diasAtrasoMin||this.currentFilter.diasAtrasoMax&&e.oldestDiasAtraso>this.currentFilter.diasAtrasoMax)),this.render()}render(){let e=`
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
    `}attachEventListeners(){let e=document.getElementById(`filterCategoria`),t=document.getElementById(`filterDiasAtraso`),n=document.getElementById(`btnRefresh`);e?.addEventListener(`change`,e=>{this.applyFilter({categoria:e.target.value||null})}),t?.addEventListener(`change`,e=>{if(!e.target.value)this.applyFilter({diasAtrasoMin:0,diasAtrasoMax:999});else{let t=e.target.value.split(`-`);this.applyFilter({diasAtrasoMin:t[0]?parseInt(t[0]):0,diasAtrasoMax:t[1]?parseInt(t[1]):999})}}),n?.addEventListener(`click`,()=>{this.init()}),document.getElementById(`btnGotoNotificaciones`)?.addEventListener(`click`,()=>{Ge(async()=>{let{router:e}=await import(`./router-CcRIuSbB.js`).then(e=>e.n);return{router:e}},__vite__mapDeps([12,4,13,14])).then(({router:e})=>{e.navigate(`admin-notificaciones`)})}),this.container.querySelectorAll(`.btn-contactar`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.closest(`.btn-contactar`).dataset.maestroId;this.onContactarMaestro(t)})}),this.container.querySelectorAll(`.btn-detalle`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.target.closest(`.btn-detalle`).dataset.maestroId;this.onDetalleMaestro(t)})})}onContactarMaestro(e){let t=this.maestros.find(t=>t.maestro_id===e);if(!t)return;let n=t.maestros?.email;n?window.location.href=`mailto:${n}?subject=Seguimiento%20Registros%20Asistencias`:alert(`No hay email disponible para este maestro`)}onDetalleMaestro(e){let t=this.maestros.find(t=>t.maestro_id===e);t&&(console.log(`View detail for maestro:`,e,t),window.location.href=`/admin/maestros/${e}/detail`)}};async function qc(){try{let{data:e,error:t}=await b.from(`teacher_class_fill_metrics_aggregated`).select(`*`).order(`maestro_nombre`,{ascending:!0});if(t)throw t;return e||[]}catch(e){throw console.error(`[getTeacherFillingMetrics] Error:`,e),e}}function Jc(e){let t={};e.forEach(e=>{t[e.fecha]||(t[e.fecha]={total_classes:0,asistencia_first:0,ai_usage_sum:0,observaciones_first:0}),t[e.fecha].total_classes++,e.orden_asistencia_primero===1&&t[e.fecha].asistencia_first++,t[e.fecha].ai_usage_sum+=e.uso_ai_fill_percent||0,e.orden_observaciones_primero===1&&t[e.fecha].observaciones_first++});let n={};return Object.entries(t).forEach(([e,t])=>{n[e]={total_classes:t.total_classes,asistencia_first_percent:(t.asistencia_first/t.total_classes*100).toFixed(1),avg_ai_usage_percent:(t.ai_usage_sum/t.total_classes).toFixed(1),observaciones_first_percent:(t.observaciones_first/t.total_classes*100).toFixed(1)}}),n}function Yc(e){let t={};e.forEach(e=>{t[e.maestro_id]||(t[e.maestro_id]={maestro_nombre:e.maestro_nombre,total_classes:0,asistencia_first:0,ai_usage_sum:0,avg_duration:0,duration_count:0}),t[e.maestro_id].total_classes++,e.orden_asistencia_primero===1&&t[e.maestro_id].asistencia_first++,t[e.maestro_id].ai_usage_sum+=e.uso_ai_fill_percent||0,e.promedio_duracion_observaciones&&(t[e.maestro_id].avg_duration+=e.promedio_duracion_observaciones,t[e.maestro_id].duration_count++)});let n={};return Object.entries(t).forEach(([e,t])=>{n[e]={maestro_nombre:t.maestro_nombre,total_classes:t.total_classes,asistencia_first_percent:(t.asistencia_first/t.total_classes*100).toFixed(1),avg_ai_usage_percent:(t.ai_usage_sum/t.total_classes).toFixed(1),avg_observation_duration:t.duration_count>0?(t.avg_duration/t.duration_count).toFixed(1):0}}),n}async function Xc(){try{let{data:e,error:t}=await b.from(`maestro_desempeño`).select(`
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
        `).order(`updated_at`,{ascending:!1});if(t)throw t;let n=(e||[]).reduce((e,t)=>(e[t.categoria]=(e[t.categoria]||0)+1,e),{}),r=(e||[]).reduce((e,t)=>(e[t.tendencia]=(e[t.tendencia]||0)+1,e),{}),i=(e||[]).reduce((e,t)=>e+t.total_sesiones,0),a=(e||[]).reduce((e,t)=>e+t.sesiones_verde,0),o=i>0?(a/i*100).toFixed(2):0;return{totalMaestros:e?.length||0,byCategory:n,byTrend:r,overallComplianceRate:o,totalSessions:i,completedSessions:a,data:e||[],generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getInstitutionComplianceSummary] Error:`,e),e}}async function Zc(){try{let{data:e,error:t}=await b.from(`registros_pendientes`).select(`
        id,
        maestro_id,
        notification_state,
        created_at,
        notif_count,
        maestros(nombre_completo)
        `).in(`notification_state`,[`NARANJA`,`ROJO`]).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!1});if(t)throw t;let n=(e||[]).reduce((e,t)=>(e[t.maestro_id]||(e[t.maestro_id]={maestroId:t.maestro_id,nombre:t.maestros?.nombre_completo,email:t.maestros?.email,naranja:[],rojo:[]}),t.notification_state===`NARANJA`?e[t.maestro_id].naranja.push(t):e[t.maestro_id].rojo.push(t),e),{}),r=Object.values(n).map(e=>{let t=[...e.naranja,...e.rojo],n=Math.max(...t.map(e=>new Date(e.created_at).getTime())),r=Math.ceil((Date.now()-n)/(1e3*60*60*24));return{...e,diasAtraso:r,naranjaCount:e.naranja.length,rojoCount:e.rojo.length,totalCount:t.length,urgency:e.rojo.length>0?`CRITICA`:`ALTA`}});return{totalCritical:r.length,byUrgency:{critica:r.filter(e=>e.urgency===`CRITICA`).length,alta:r.filter(e=>e.urgency===`ALTA`).length},maestros:r.sort((e,t)=>t.diasAtraso-e.diasAtraso),generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getCriticalMaestrosReport] Error:`,e),e}}async function Qc(e=`csv`){try{let t=await Xc();if(e===`csv`){let e=`REPORTE DE CUMPLIMIENTO DE MAESTROS
`;return e+=`Generado: ${new Date().toLocaleString()}\n\n`,e+=`RESUMEN GENERAL
`,e+=`Total de Maestros,${t.totalMaestros}\n`,e+=`Tasa de Cumplimiento,${t.overallComplianceRate}%\n`,e+=`Sesiones Completadas,${t.completedSessions}/${t.totalSessions}\n\n`,e+=`POR CATEGORÍA
`,e+=`Categoría,Cantidad
`,Object.entries(t.byCategory).forEach(([t,n])=>{e+=`${t},${n}\n`}),e+=`
POR TENDENCIA
`,e+=`Tendencia,Cantidad
`,Object.entries(t.byTrend).forEach(([t,n])=>{e+=`${t},${n}\n`}),e}return t}catch(e){throw console.error(`[exportComplianceReport] Error:`,e),e}}async function $c(e=30){try{let t=new Date(Date.now()-e*24*60*60*1e3).toISOString().split(`T`)[0],n=(await qc()).filter(e=>e.fecha>=t),r=Jc(n),i=Yc(n);return{daysBack:e,total_classes:n.length,total_maestros:Object.keys(i).length,date_trends:r,maestro_trends:i,institution_summary:{avg_ai_usage_institution:n.length>0?(n.reduce((e,t)=>e+(t.uso_ai_fill_percent||0),0)/n.length).toFixed(1):0,asistencia_first_percent:n.length>0?(n.filter(e=>e.orden_asistencia_primero===1).length/n.length*100).toFixed(1):0,observaciones_first_percent:n.length>0?(n.filter(e=>e.orden_observaciones_primero===1).length/n.length*100).toFixed(1):0},generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getInstitutionTrendReportWithFilling] Error:`,e),e}}var el=class{constructor(e){this.containerId=e,this.container=document.getElementById(e),this.summary=null,this.critical=null}async init(){try{this.container.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando reportes institucionales...</div>
        </div>
      `,await this.loadData(),this.render(),this.attachEventListeners(),console.log(`[DirectorReportingPanel] Initialized`)}catch(e){console.error(`[DirectorReportingPanel] Init error:`,e),this.container.innerHTML=`
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando reportes: ${e.message}</div>
        </div>
      `}}async loadData(){this.summary=await Xc(),this.critical=await Zc()}render(){let e=`
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
    `}attachEventListeners(){let e=document.getElementById(`btnExportCSV`),t=document.getElementById(`btnRefresh`);e?.addEventListener(`click`,()=>this.exportReport()),t?.addEventListener(`click`,()=>this.init())}async exportReport(){try{let e=await Qc(`csv`),t=new Blob([e],{type:`text/csv`}),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`reporte-cumplimiento-${new Date().toISOString().split(`T`)[0]}.csv`,r.click(),window.URL.revokeObjectURL(n),console.log(`[DirectorReportingPanel] CSV exported`)}catch(e){console.error(`[DirectorReportingPanel] Export error:`,e),alert(`Error al descargar reporte: `+e.message)}}};function tl(e){let t=document.getElementById(e);function n(e){return`
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
      `;try{let e=await qc();if(!e||e.length===0){t.innerHTML=`
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
      `}}}function nl(e){let t=document.getElementById(e),n=null;function r(e){return`
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
      `;try{n=await $c(30),this.render()}catch(e){console.error(`[directorTrendReportView] Error:`,e),t.innerHTML=`
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
      `}}}function rl(){C.register(`admin-dashboard`,e=>{try{e.innerHTML=`<div id="admin-dashboard-container"></div>`,new Kc(`admin-dashboard-container`).init()}catch(t){console.error(`[admin-dashboard] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar cumplimiento: ${t.message}</p></div>`}}),C.register(`admin-dashboard-reportes`,e=>{try{e.innerHTML=`<div id="director-reporting-container"></div>`,new el(`director-reporting-container`).init()}catch(t){console.error(`[admin-dashboard-reportes] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar reportes: ${t.message}</p></div>`}}),C.register(`admin-dashboard-analitca-llenado`,e=>{try{e.innerHTML=`<div id="analytics-filling-container"></div>`,tl(`analytics-filling-container`).init()}catch(t){console.error(`[admin-dashboard-analitca-llenado] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar analítica: ${t.message}</p></div>`}}),C.register(`admin-dashboard-tendencias`,e=>{try{e.innerHTML=`<div id="trend-report-container"></div>`,nl(`trend-report-container`).init()}catch(t){console.error(`[admin-dashboard-tendencias] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar tendencias: ${t.message}</p></div>`}})}var il=[{id:`perm-001`,maestro_id:`maestro_001`,maestro_nombre:`Carlos Méndez`,maestro_email:`carlos.mendez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`planificacion:write`,`asistencias:write`],solicitudes:[],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-01-15T10:00:00Z`,actualizado_en:`2026-05-01T14:30:00Z`},{id:`perm-002`,maestro_id:`maestro_002`,maestro_nombre:`María López`,maestro_email:`maria.lopez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!1,permisos:[`alumnos:create`,`planificacion:write`],solicitudes:[`clases:enroll`],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-02-20T09:00:00Z`,actualizado_en:`2026-04-10T11:00:00Z`},{id:`perm-003`,maestro_id:`maestro_003`,maestro_nombre:`Ana Martínez`,maestro_email:`ana.martinez@ejemplo.com`,puede_registrar_alumnos:!1,puede_inscribir_clases:!1,permisos:[],solicitudes:[`alumnos:create`],concedido_por:null,concedido_por_nombre:null,creado_en:`2026-03-01T08:00:00Z`,actualizado_en:`2026-03-01T08:00:00Z`},{id:`perm-004`,maestro_id:`maestro_004`,maestro_nombre:`Pedro Ramírez`,maestro_email:`pedro.ramirez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`asistencias:write`],solicitudes:[],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-01-20T15:00:00Z`,actualizado_en:`2026-05-05T09:00:00Z`},{id:`perm-005`,maestro_id:`maestro_005`,maestro_nombre:`Laura Fernández`,maestro_email:`laura.fernandez@ejemplo.com`,puede_registrar_alumnos:!1,puede_inscribir_clases:!0,permisos:[`clases:enroll`],solicitudes:[`alumnos:create`],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-04-01T12:00:00Z`,actualizado_en:`2026-04-15T16:00:00Z`}],al=e({actualizarPermiso:()=>ul,obtenerPermisoPorMaestro:()=>ll,obtenerPermisos:()=>cl}),ol=(e=300)=>new Promise(t=>setTimeout(t,e)),J=[...il];function sl(e){return e?{id:e.id,maestro_id:e.maestro_id??``,maestro_nombre:e.maestro_nombre??``,maestro_email:e.maestro_email??``,puede_registrar_alumnos:e.puede_registrar_alumnos??!1,puede_inscribir_clases:e.puede_inscribir_clases??!1,permisos:Array.isArray(e.permisos)?e.permisos:[],solicitudes:Array.isArray(e.solicitudes)?e.solicitudes:[],concedido_por:e.concedido_por??null,concedido_por_nombre:e.concedido_por_nombre??null,creado_en:e.creado_en||null,actualizado_en:e.actualizado_en||null}:null}async function cl(){return await ol(),J.map(sl)}async function ll(e){await ol();let t=J.find(t=>t.maestro_id===e);return t?sl(t):{id:null,maestro_id:e,maestro_nombre:``,maestro_email:``,puede_registrar_alumnos:!1,puede_inscribir_clases:!1,permisos:[],solicitudes:[],concedido_por:null,concedido_por_nombre:null,creado_en:null,actualizado_en:null}}async function ul(e,t){await ol();let n=J.findIndex(t=>t.maestro_id===e),r=new Date().toISOString();if(n===-1){let n={id:Math.random().toString(36).substr(2,9),maestro_id:e,maestro_nombre:t.maestro_nombre||``,maestro_email:t.maestro_email||``,puede_registrar_alumnos:t.puede_registrar_alumnos??!1,puede_inscribir_clases:t.puede_inscribir_clases??!1,permisos:Array.isArray(t.permisos)?t.permisos:[],solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:[],concedido_por:t.concedido_por||null,concedido_por_nombre:t.concedido_por_nombre||null,creado_en:r,actualizado_en:r};return J.push(n),sl(n)}return J[n]={...J[n],puede_registrar_alumnos:t.puede_registrar_alumnos??J[n].puede_registrar_alumnos,puede_inscribir_clases:t.puede_inscribir_clases??J[n].puede_inscribir_clases,permisos:Array.isArray(t.permisos)?t.permisos:J[n].permisos,solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:J[n].solicitudes,concedido_por:t.concedido_por??J[n].concedido_por,concedido_por_nombre:t.concedido_por_nombre??J[n].concedido_por_nombre,actualizado_en:r},sl(J[n])}var dl=()=>v.isDemoMode?al:qe,fl=(...e)=>dl().obtenerPermisos(...e),pl=(...e)=>dl().actualizarPermiso(...e),Y={permisos:[],cargando:!1,togglingId:null,togglingField:null};function X(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function ml(e){try{Y.cargando=!0,hl(e),Y.permisos=await fl(),Y.cargando=!1,_l(e),xl(e)}catch(t){console.error(t),gl(e,t.message)}}function hl(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando permisos...</p>
      </div>
    </div>
  `}function gl(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${X(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>ml(e))}function _l(e){let t=E.getUser?E.getUser():null;t?.nombre_completo||t?.email,e.innerHTML=`
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-shield-lock me-2 text-primary"></i>Permisos de Maestros</span>
          <span class="badge bg-secondary">${Y.permisos.length}</span>
        </div>
      </div>

      ${Y.permisos.length?`
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
            ${vl()}
          </tbody>
        </table>
      </div>
      `:yl()}

      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle"></i>
        Los cambios se guardan automáticamente al alternar un permiso.
        ${v.isDemoMode?`<span class="badge bg-warning text-dark ms-1">Demo</span>`:``}
      </div>
    </div>
  `}function vl(){return Y.permisos.map(e=>{let t=Y.togglingId===e.maestro_id,n=e.concedido_por_nombre||e.concedido_por||`-`,r=e.actualizado_en?new Date(e.actualizado_en).toLocaleDateString(`es-ES`,{day:`numeric`,month:`short`}):`-`,i=e.solicitudes||[],a=!e.puede_registrar_alumnos&&i.includes(`alumnos:create`),o=!e.puede_inscribir_clases&&i.includes(`clases:enroll`);return`
      <tr data-maestro-id="${X(e.maestro_id)}">
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-compact bg-primary text-white">${bl(e.maestro_nombre||e.maestro_id)}</div>
            <span class="text-truncate" style="max-width: 150px;" title="${X(e.maestro_nombre)}">${X(e.maestro_nombre||`Sin nombre`)}</span>
          </div>
        </td>
        <td class="text-truncate" style="max-width: 150px;" title="${X(e.maestro_email)}">${X(e.maestro_email||`-`)}</td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${X(e.maestro_id)}"
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
                data-maestro-id="${X(e.maestro_id)}" 
                data-permiso="alumnos:create" 
                data-field="puede_registrar_alumnos" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          `:``}
        </td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${X(e.maestro_id)}"
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
                data-maestro-id="${X(e.maestro_id)}" 
                data-permiso="clases:enroll" 
                data-field="puede_inscribir_clases" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          `:``}
        </td>
        <td class="small text-muted">${X(n)}</td>
        <td class="small text-muted">${r}</td>
      </tr>
    `}).join(``)}function yl(){return`
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-shield-exclamation" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay permisos configurados</h4>
      <p class="text-muted">Los permisos aparecerán aquí cuando los administradores los configuren.</p>
    </div>
  `}function bl(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}function xl(e){let t=e.querySelector(`#permisosTable`);t&&(t.addEventListener(`change`,async t=>{let n=t.target.closest(`.permiso-toggle`);if(!n)return;let r=n.dataset.maestroId,i=n.dataset.field,a=n.checked;n.disabled=!0,Y.togglingId=r,Y.togglingField=i;let o=n.closest(`.form-check`)?.querySelector(`span`);o&&(o.textContent=a?`Sí`:`No`,o.className=`small ${a?`text-success`:`text-muted`}`);try{let t=Y.permisos.find(e=>e.maestro_id===r),n={[i]:a};if(t){if(a){let e=i===`puede_registrar_alumnos`?`alumnos:create`:`clases:enroll`,r=t.permisos||[];r.includes(e)||r.push(e);let a=(t.solicitudes||[]).filter(t=>t!==e),o=E.getUser?E.getUser():null,s=o?.nombre_completo||o?.email||`Administrador`;n={...n,permisos:r,solicitudes:a,concedido_por:o?.id||`admin`,concedido_por_nombre:s},t.permisos=r,t.solicitudes=a,t.concedido_por=o?.id||`admin`,t.concedido_por_nombre=s}else{let e=i===`puede_registrar_alumnos`?`alumnos:create`:`clases:enroll`,r=(t.permisos||[]).filter(t=>t!==e);n={...n,permisos:r},t.permisos=r}t.actualizado_en=new Date().toISOString()}await pl(r,n),t&&(t[i]=a),x.success(`Permiso actualizado: ${i===`puede_registrar_alumnos`?`Registrar Alumnos`:`Inscribir Clases`}`);let o=e.querySelector(`#permisosTBody`);o&&(o.innerHTML=vl())}catch(e){n.checked=!a,o&&(o.textContent=a?`No`:`Sí`,o.className=`small ${a?`text-muted`:`text-success`}`),x.error(`Error al actualizar permiso: `+e.message)}finally{n.disabled=!1,Y.togglingId=null,Y.togglingField=null}}),t.addEventListener(`click`,async t=>{let n=t.target.closest(`.aprobar-btn`);if(!n)return;let r=n.dataset.maestroId,i=n.dataset.permiso,a=n.dataset.field;n.disabled=!0;let o=n.innerHTML;n.innerHTML=`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;try{let t=Y.permisos.find(e=>e.maestro_id===r);if(!t)throw Error(`No se encontró el registro de permisos del maestro`);let n=t.permisos||[];n.includes(i)||n.push(i);let o=(t.solicitudes||[]).filter(e=>e!==i),s=E.getUser?E.getUser():null,c=s?.nombre_completo||s?.email||`Administrador`;await pl(r,{permisos:n,solicitudes:o,concedido_por:s?.id||`admin`,concedido_por_nombre:c,[a]:!0}),t.permisos=n,t.solicitudes=o,t.concedido_por=s?.id||`admin`,t.concedido_por_nombre=c,t[a]=!0,t.actualizado_en=new Date().toISOString(),x.success(`Solicitud aprobada: ${a===`puede_registrar_alumnos`?`Registrar Alumnos`:`Inscribir Clases`}`);let l=e.querySelector(`#permisosTBody`);l&&(l.innerHTML=vl())}catch(e){x.error(`Error al aprobar solicitud: `+e.message),n.disabled=!1,n.innerHTML=o}}))}function Sl(){C.register(`permisos`,ml)}async function Cl(e){if(e){e.innerHTML=El();try{let[t,n]=await Promise.all([wl(),Tl()]);e.innerHTML=Dl(t,n),Al(e)}catch(t){console.error(`[DashboardPedagogico]`,t),e.innerHTML=`
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar el dashboard: ${t.message}</div>
      </div>`}}}async function wl(){let[e,t,n,r]=await Promise.all([b.from(`alumnos`).select(`id`,{count:`exact`}).eq(`activo`,!0),b.from(`planificaciones`).select(`id, estado`).gte(`fecha_inicio`,new Date(Date.now()-10080*60*1e3).toISOString().split(`T`)[0]),b.from(`clases`).select(`id`,{count:`exact`}).eq(`estado`,`activa`),b.from(`asistencias`).select(`estado`).gte(`fecha`,new Date(Date.now()-10080*60*1e3).toISOString().split(`T`)[0])]),i=r.data?.length||0,a=r.data?.filter(e=>e.estado===`P`).length||0,o=i>0?Math.round(a/i*100):null,s=t.data?.filter(e=>e.estado===`ejecutado`).length||0,c=t.data?.filter(e=>e.estado===`planificado`).length||0;return{alumnosActivos:e.count||0,clasesActivas:n.count||0,planesEstaSemana:t.data?.length||0,planesEjecutados:s,planesPlanificados:c,tasaAsistencia:o}}async function Tl(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],{data:t}=await b.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e);if(!t?.length)return[];let n={};t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]={total:0,presentes:0}),n[e.alumno_id].total++,e.estado===`P`&&n[e.alumno_id].presentes++});let r=Object.entries(n).filter(([,e])=>e.total>=4&&e.presentes/e.total<As.attendance_min_rate).map(([e])=>e);if(!r.length)return[];let{data:i}=await b.from(`alumnos`).select(`id, nombre_completo`).in(`id`,r.slice(0,5));return i||[]}function El(){return`
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
    </div>`}function Dl(e,t){let n=e.tasaAsistencia===null?`secondary`:e.tasaAsistencia>=80?`success`:e.tasaAsistencia>=60?`warning`:`danger`;return`
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
        ${Ol(`bi-people-fill`,`Alumnos activos`,e.alumnosActivos,`primary`,null)}
        ${Ol(`bi-easel2`,`Clases activas`,e.clasesActivas,`indigo`,null)}
        ${Ol(`bi-journal-text`,`Planes esta semana`,e.planesEstaSemana,`success`,`${e.planesEjecutados} ejecutados · ${e.planesPlanificados} pendientes`)}
        ${Ol(`bi-calendar-check`,`Asistencia (7 días)`,e.tasaAsistencia===null?`—`:e.tasaAsistencia+`%`,n,null)}
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
        ${kl(`bi-journal-text`,`Planificación`,`Planes de clase, plantillas y revisión`,`planificacion`,`primary`)}
        ${kl(`bi-person-lines-fill`,`Seguimiento`,`Progreso y asistencia por alumno`,`pedagogico-seguimiento`,`success`)}
        ${kl(`bi-graph-up`,`Evaluaciones`,`Calificaciones y boletines`,`progresos`,`warning`)}
        ${kl(`bi-file-earmark-bar-graph`,`Reportes`,`Rendimiento por clase y riesgo`,`pedagogico-reportes`,`info`)}
      </div>
    </div>`}function Ol(e,t,n,r,i){return`
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
    </div>`}function kl(e,t,n,r,i){return`
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
    </div>`}function Al(e){e.querySelectorAll(`[data-nav]`).forEach(e=>{e.addEventListener(`click`,()=>C.navigate(e.dataset.nav)),e.classList.contains(`quick-nav-card`)&&(e.addEventListener(`mouseenter`,()=>{e.style.transform=`translateY(-2px)`,e.style.boxShadow=`0 8px 25px rgba(0,0,0,0.12)`}),e.addEventListener(`mouseleave`,()=>{e.style.transform=``,e.style.boxShadow=``}))}),e.querySelector(`#btn-help-dashboard`)?.addEventListener(`click`,()=>{ge.open({title:`Dashboard Pedagógico`,intro:`Resumen general del estado académico de la institución. Te permite ver de un vistazo cómo están los alumnos, clases y planificaciones.`,sections:[{icon:`bi-people-fill`,title:`Alumnos activos`,description:`Cantidad total de alumnos con estado activo en el sistema.`,color:`#3b82f6`},{icon:`bi-easel2`,title:`Clases activas`,description:`Número de clases con estado "activa". Las clases inactivas o suspendidas no se cuentan.`,color:`#6366f1`},{icon:`bi-journal-text`,title:`Planes esta semana`,description:`Planificaciones con fecha de inicio en los últimos 7 días. Muestra cuántas fueron ejecutadas y cuántas siguen pendientes.`,color:`#10b981`},{icon:`bi-calendar-check`,title:`Asistencia (7 días)`,description:`Porcentaje de asistencia del total de la institución en los últimos 7 días. Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%.`,color:`#f59e0b`},{icon:`bi-exclamation-triangle-fill`,title:`Alumnos con asistencia baja`,description:`Alumnos que en las últimas 4 semanas tuvieron menos del 70% de asistencia (mínimo 4 clases). Requieren atención prioritaria.`,color:`#ef4444`},{icon:`bi-grid-1x2`,title:`Acceso rápido`,description:`Los 4 cards al pie llevan directamente a Planificación, Seguimiento de alumnos, Evaluaciones y Reportes. Hacé clic para navegar.`,color:`#3b82f6`}]})})}var Z={alumnos:[],asistenciaMap:{},progresosMap:{},observacionesMap:{},busqueda:``,container:null};async function jl(e){if(e){Z.container=e,e.innerHTML=Ll();try{await Ml(),Pl(),Il()}catch(t){console.error(`[SeguimientoAlumnos]`,t),e.innerHTML=`<div class="page-container"><div class="alert alert-warning">${t.message}</div></div>`}}}async function Ml(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],[t,n,r,i]=await Promise.all([b.from(`alumnos`).select(`id, nombre_completo, instrumento_principal, activo`).eq(`activo`,!0).order(`nombre_completo`),b.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e),b.from(`progresos`).select(`alumno_id, calificacion`).not(`calificacion`,`is`,null),b.from(`observaciones`).select(`alumno_id, tipo, estado`).eq(`estado`,`activo`)]);Z.alumnos=t.data||[],Z.asistenciaMap={},(n.data||[]).forEach(e=>{Z.asistenciaMap[e.alumno_id]||(Z.asistenciaMap[e.alumno_id]={total:0,presentes:0}),Z.asistenciaMap[e.alumno_id].total++,e.estado===`P`&&Z.asistenciaMap[e.alumno_id].presentes++}),Object.values(Z.asistenciaMap).forEach(e=>{e.rate=e.total>0?e.presentes/e.total:null}),Z.progresosMap={};let a={};(r.data||[]).forEach(e=>{a[e.alumno_id]||(a[e.alumno_id]=[]),a[e.alumno_id].push(e.calificacion)}),Object.entries(a).forEach(([e,t])=>{let n=t.slice(-3);Z.progresosMap[e]={count:n.length,promedio:n.reduce((e,t)=>e+t,0)/n.length}}),Z.observacionesMap={},(i.data||[]).forEach(e=>{Z.observacionesMap[e.alumno_id]||(Z.observacionesMap[e.alumno_id]=[]),Z.observacionesMap[e.alumno_id].push(e)})}function Nl(e){let t=Z.asistenciaMap[e],n=Z.progresosMap[e],r=[];return t?.total>=4&&t.rate<As.attendance_min_rate&&r.push(`asistencia`),n?.count>=1&&n.promedio<As.grade_min_avg&&r.push(`calificacion`),(Z.observacionesMap[e]||[]).some(e=>e.tipo===`disciplina`)&&r.push(`disciplina`),r}function Pl(){let e=Z.busqueda.toLowerCase(),t=Z.alumnos.filter(t=>!e||t.nombre_completo.toLowerCase().includes(e)||(t.instrumento_principal||``).toLowerCase().includes(e)),n=t.filter(e=>Nl(e.id).length>0),r=t.filter(e=>Nl(e.id).length===0),i=[...n,...r];Z.container.innerHTML=`
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
        ${i.map(e=>Fl(e)).join(``)||`<div class="text-center text-muted py-5">Sin resultados</div>`}
      </div>
    </div>`,Il()}function Fl(e){let t=Nl(e.id),n=Z.asistenciaMap[e.id],r=Z.progresosMap[e.id],i=Z.observacionesMap[e.id]||[],a=n?.rate==null?null:Math.round(n.rate*100),o=a===null?`secondary`:a>=80?`success`:a>=60?`warning`:`danger`,s=r?r.promedio>=7?`success`:r.promedio>=5?`warning`:`danger`:`secondary`;return`
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
    </div>`}function Il(){Z.container.querySelector(`#btn-help-seguimiento`)?.addEventListener(`click`,()=>{ge.open({title:`Seguimiento de Alumnos`,intro:`Vista unificada del estado académico de cada alumno. Los alumnos con riesgo aparecen primero, destacados con una barra lateral amarilla.`,sections:[{icon:`bi-search`,title:`Buscador`,description:`Filtrá por nombre del alumno o por instrumento en tiempo real.`,color:`#6b7280`},{icon:`bi-exclamation-triangle-fill`,title:`Alerta de riesgo`,description:`Aparece cuando hay alumnos que requieren atención. Muestra el total con algún indicador activo.`,color:`#f59e0b`},{icon:`bi-person-fill`,title:`Fila del alumno`,description:`Nombre, instrumento, % de asistencia (últimas 4 semanas) y promedio de las últimas 3 calificaciones. Barra amarilla izquierda = en riesgo.`,color:`#3b82f6`},{icon:`bi-tags-fill`,title:`Badges de riesgo`,description:`"Asistencia baja" < 70% en 4 semanas. "Nota baja" promedio < 6.0. "Observación" cuando hay observaciones de disciplina activas.`,color:`#ef4444`},{icon:`bi-window-sidebar`,title:`Panel de detalle`,description:`Clic en cualquier alumno → panel con asistencia reciente (20 clases), últimas calificaciones por clase y observaciones activas.`,color:`#10b981`}]})}),Z.container.querySelector(`#busqueda-alumno`)?.addEventListener(`input`,e=>{Z.busqueda=e.target.value,Pl()}),Z.container.querySelectorAll(`.alumno-row`).forEach(e=>{e.addEventListener(`click`,()=>Rl(e.dataset.id)),e.addEventListener(`mouseenter`,()=>{e.style.boxShadow=`0 4px 15px rgba(0,0,0,0.1)`}),e.addEventListener(`mouseleave`,()=>{e.style.boxShadow=``})})}function Ll(){return`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
    <div class="spinner-border text-primary"></div>
  </div>`}async function Rl(e){let t=Z.alumnos.find(t=>t.id===e);if(!t)return;let[n,r,i,a]=await Promise.all([b.from(`asistencias`).select(`fecha, estado, clase_id`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1}).limit(20),b.from(`progresos`).select(`*, clase:clases(nombre)`).eq(`alumno_id`,e).order(`fecha_evaluacion`,{ascending:!1}).limit(10),b.from(`observaciones`).select(`*`).eq(`alumno_id`,e).order(`created_at`,{ascending:!1}).limit(5),b.from(`alumnos_clases`).select(`clase:clases(id, nombre, instrumento)`).eq(`alumno_id`,e)]),o=(a.data||[]).map(e=>e.clase).filter(Boolean),s=Nl(e);S.open({title:t.nombre_completo,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
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
      </div>`})}async function zl(e){if(e){e.innerHTML=`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>`;try{let[t,n]=await Promise.all([Bl(),Vl()]);e.innerHTML=Hl(t,n),e.querySelectorAll(`.btn-generar-pedagogico`).forEach(e=>{e.addEventListener(`click`,async t=>{t.preventDefault();let n=e.getAttribute(`data-clase-id`);e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;try{let{generateMonthlyPedagogical:e}=await Ge(async()=>{let{generateMonthlyPedagogical:e}=await import(`./reportService-vdrVPOl2.js`).then(e=>e.i);return{generateMonthlyPedagogical:e}},__vite__mapDeps([15,4,1,16,17])),t=new Date;await e(n,t.getFullYear(),t.getMonth()+1)}catch(e){console.error(`[reportesPedagogicos] Error:`,e)}finally{e.disabled=!1,e.innerHTML=`🎓 Generar`}})}),e.querySelector(`#btn-help-reportes`)?.addEventListener(`click`,()=>{ge.open({title:`Reportes Pedagógicos`,intro:`Vista agregada del rendimiento por clase y alumnos en riesgo. Útil para detectar patrones y tomar decisiones de intervención.`,sections:[{icon:`bi-table`,title:`Rendimiento por clase`,description:`Cada clase activa con: alumnos inscriptos, % asistencia (4 semanas), promedio de calificaciones y nivel de ocupación.`,color:`#3b82f6`},{icon:`bi-bar-chart-fill`,title:`Barra de ocupación`,description:`Verde < 70% ocupado. Amarillo 70-90%. Rojo > 90%. Detecta clases saturadas.`,color:`#10b981`},{icon:`bi-percent`,title:`Columna Asistencia`,description:`Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%. Basado en registros de las últimas 4 semanas.`,color:`#f59e0b`},{icon:`bi-star-half`,title:`Columna Prom. Nota`,description:`Promedio de calificaciones de la clase. Verde ≥ 7.0, amarillo ≥ 5.0, rojo < 5.0.`,color:`#6366f1`},{icon:`bi-exclamation-triangle-fill`,title:`Alumnos en riesgo`,description:`Asistencia < 70% en 4 semanas (mínimo 4 clases evaluadas). Ordenados de menor a mayor tasa.`,color:`#ef4444`}]})})}catch(t){console.error(`[ReportesPedagogicos]`,t),e.innerHTML=`<div class="page-container"><div class="alert alert-warning">${t.message}</div></div>`}}}async function Bl(){let{data:e}=await b.from(`clases`).select(`id, nombre, instrumento, capacidad_maxima`).eq(`estado`,`activa`).order(`nombre`);if(!e?.length)return[];let t=e.map(e=>e.id),[n,r,i]=await Promise.all([b.from(`alumnos_clases`).select(`clase_id, alumno_id`).in(`clase_id`,t),b.from(`asistencias`).select(`clase_id, estado`).in(`clase_id`,t).gte(`fecha`,new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0]),b.from(`progresos`).select(`clase_id, calificacion`).in(`clase_id`,t).not(`calificacion`,`is`,null)]);return e.map(e=>{let t=(n.data||[]).filter(t=>t.clase_id===e.id),a=(r.data||[]).filter(t=>t.clase_id===e.id),o=(i.data||[]).filter(t=>t.clase_id===e.id),s=a.length>0?Math.round(a.filter(e=>e.estado===`P`).length/a.length*100):null,c=o.length>0?o.reduce((e,t)=>e+t.calificacion,0)/o.length:null,l=e.capacidad_maxima?Math.round(t.length/e.capacidad_maxima*100):null;return{...e,totalAlumnos:t.length,tasaAsist:s,promNotas:c,ocupacion:l}})}async function Vl(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],{data:t}=await b.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e);if(!t?.length)return[];let n={};t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]={total:0,presentes:0}),n[e.alumno_id].total++,e.estado===`P`&&n[e.alumno_id].presentes++});let r=Object.entries(n).filter(([,e])=>e.total>=4&&e.presentes/e.total<As.attendance_min_rate).map(([e,t])=>({id:e,rate:t.presentes/t.total,total:t.total}));if(!r.length)return[];let{data:i}=await b.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,r.map(e=>e.id));return(i||[]).map(e=>({...e,...r.find(t=>t.id===e.id)})).sort((e,t)=>e.rate-t.rate)}function Hl(e,t){let n=e=>e===null?`secondary`:e>=80?`success`:e>=60?`warning`:`danger`,r=e=>e===null?`secondary`:e>=7?`success`:e>=5?`warning`:`danger`;return`
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
        Alumnos en riesgo — asistencia &lt; ${Math.round(As.attendance_min_rate*100)}% (4 semanas)
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
    </div>`}function Ul(){C.register(`pedagogico-dashboard`,e=>Cl(e)),C.register(`pedagogico-seguimiento`,e=>jl(e)),C.register(`pedagogico-reportes`,e=>zl(e))}var Wl=[{id:`m-001`,nombre:`Carlos Méndez`,especialidad:`Violín`,habilidades:[`violín`,`viola`,`solfeo`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`13:00`},{inicio:`14:00`,fin:`18:00`}],martes:[{inicio:`10:00`,fin:`13:00`}],miércoles:[{inicio:`10:00`,fin:`13:00`},{inicio:`14:00`,fin:`18:00`}],jueves:[{inicio:`10:00`,fin:`13:00`}],viernes:[{inicio:`10:00`,fin:`19:00`}],sábado:[],domingo:[]}},{id:`m-002`,nombre:`María Torres`,especialidad:`Piano`,habilidades:[`piano`,`teclado`,`teoría musical`],disponibilidad:{lunes:[{inicio:`14:00`,fin:`19:00`}],martes:[{inicio:`10:00`,fin:`19:00`}],miércoles:[{inicio:`14:00`,fin:`19:00`}],jueves:[{inicio:`10:00`,fin:`19:00`}],viernes:[],sábado:[{inicio:`09:00`,fin:`13:00`}],domingo:[]}},{id:`m-003`,nombre:`José Ramírez`,especialidad:`Percusión`,habilidades:[`percusión`,`batería`,`timbales`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`14:00`}],martes:[{inicio:`10:00`,fin:`14:00`}],miércoles:[{inicio:`10:00`,fin:`14:00`}],jueves:[{inicio:`10:00`,fin:`14:00`}],viernes:[{inicio:`10:00`,fin:`14:00`}],sábado:[{inicio:`09:00`,fin:`12:00`}],domingo:[]}},{id:`m-004`,nombre:`Ana Luisa Herrera`,especialidad:`Cello`,habilidades:[`cello`,`contrabajo`,`música de cámara`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`19:00`}],martes:[],miércoles:[{inicio:`10:00`,fin:`19:00`}],jueves:[],viernes:[{inicio:`10:00`,fin:`19:00`}],sábado:[],domingo:[]}},{id:`m-005`,nombre:`Roberto Sánchez`,especialidad:`Guitarra`,habilidades:[`guitarra`,`cuatro`,`mandolina`],disponibilidad:{lunes:[{inicio:`15:00`,fin:`19:00`}],martes:[{inicio:`15:00`,fin:`19:00`}],miércoles:[{inicio:`15:00`,fin:`19:00`}],jueves:[{inicio:`15:00`,fin:`19:00`}],viernes:[{inicio:`15:00`,fin:`19:00`}],sábado:[{inicio:`09:00`,fin:`13:00`}],domingo:[]}},{id:`m-006`,nombre:`Luisa Fernanda Díaz`,especialidad:`Voz`,habilidades:[`voz`,`coro`,`técnica vocal`,`solfeo`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`13:00`}],martes:[{inicio:`10:00`,fin:`13:00`},{inicio:`15:00`,fin:`18:00`}],miércoles:[{inicio:`10:00`,fin:`13:00`}],jueves:[{inicio:`10:00`,fin:`13:00`},{inicio:`15:00`,fin:`18:00`}],viernes:[{inicio:`10:00`,fin:`13:00`}],sábado:[{inicio:`09:00`,fin:`12:00`}],domingo:[]}}],Gl=[{id:`s-101`,nombre:`Salón Mozart (Grande)`,capacidad:30,piso:1,is_active:!0},{id:`s-102`,nombre:`Salón Beethoven (Mediano)`,capacidad:15,piso:1,is_active:!0},{id:`s-103`,nombre:`Salón Bach (Piano)`,capacidad:10,piso:2,is_active:!0},{id:`s-104`,nombre:`Salón Vivaldi (Violín)`,capacidad:8,piso:2,is_active:!0},{id:`s-105`,nombre:`Salón Chopin (Teclados)`,capacidad:12,piso:2,is_active:!0}],Kl=[{id:`c-001`,nombre:`Violín Inicial`,instrumento:`Violín`,maestro_principal_id:`m-001`,capacidad_maxima:10,total_alumnos:6,horarios:[]},{id:`c-002`,nombre:`Violín Intermedio`,instrumento:`Violín`,maestro_principal_id:`m-001`,capacidad_maxima:8,total_alumnos:5,horarios:[]},{id:`c-003`,nombre:`Piano Inicial A`,instrumento:`Piano`,maestro_principal_id:`m-002`,capacidad_maxima:12,total_alumnos:10,horarios:[]},{id:`c-004`,nombre:`Teoría y Solfeo I`,instrumento:`Solfeo`,maestro_principal_id:`m-006`,capacidad_maxima:25,total_alumnos:18,horarios:[]},{id:`c-005`,nombre:`Batería Básica`,instrumento:`Percusión`,maestro_principal_id:`m-003`,capacidad_maxima:6,total_alumnos:4,horarios:[]},{id:`c-006`,nombre:`Guitarra Clásica I`,instrumento:`Guitarra`,maestro_principal_id:`m-005`,capacidad_maxima:15,total_alumnos:11,horarios:[]},{id:`c-007`,nombre:`Cello y Cámara`,instrumento:`Cello`,maestro_principal_id:`m-004`,capacidad_maxima:8,total_alumnos:3,horarios:[]},{id:`c-008`,nombre:`Técnica Vocal A`,instrumento:`Voz`,maestro_principal_id:`m-006`,capacidad_maxima:10,total_alumnos:8,horarios:[]}],ql=[];async function Jl(){let{data:e,error:t}=await b.from(`salones`).select(`id, nombre, capacidad, is_active`).eq(`is_active`,!0).order(`nombre`,{ascending:!0});if(t)throw Error(`Error al cargar salones reales: `+t.message);return e}async function Yl(){let{data:e,error:t}=await b.from(`clases`).select(`id, nombre, maestro_principal_id, capacidad_maxima, instrumento`).order(`nombre`,{ascending:!0});if(t)throw Error(`Error al cargar clases reales: `+t.message);let{data:n}=await b.from(`clase_horarios`).select(`*`),{data:r}=await b.from(`alumnos_clases`).select(`clase_id`);return(e||[]).map(e=>{let t=(n||[]).filter(t=>t.clase_id===e.id),i=(r||[]).filter(t=>t.clase_id===e.id).length;return{id:e.id,nombre:e.nombre,instrumento:e.instrumento||`General`,maestro_principal_id:e.maestro_principal_id,capacidad_maxima:e.capacidad_maxima||20,total_alumnos:i,horarios:t.map(e=>({dia:e.dia,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,salon_id:e.salon_id}))}})}async function Xl(){if(v.isDemoMode)return{maestros:Wl,salones:Gl,clases:Kl};try{let[e,t,n]=await Promise.all([p(),Jl(),Yl()]);return{maestros:e,salones:t,clases:n}}catch(e){throw console.error(`[horarioBuilderApi] Error fetching data:`,e),e}}async function Zl(e){if(v.isDemoMode){let t={id:`run-${Date.now()}`,created_at:new Date().toISOString(),estado:e.estado||`borrador`,periodo:e.periodo,config:e.config,resultado:e.resultado,metricas:e.metricas};return ql.push(t),t}let{data:t,error:n}=await b.from(`schedule_runs`).insert([{periodo:e.periodo,config:e.config,resultado:e.resultado,metricas:e.metricas,estado:e.estado||`borrador`}]).select().single();if(n)throw console.error(`[horarioBuilderApi] Error saving run:`,n),Error(`No se pudo guardar la corrida de horario: `+n.message);return t}async function Ql(){if(v.isDemoMode)return ql;let{data:e,error:t}=await b.from(`schedule_runs`).select(`*`).order(`created_at`,{ascending:!1});if(t)throw console.error(`[horarioBuilderApi] Error fetching runs:`,t),Error(`No se pudieron obtener las corridas de horarios`);return e}var $l={lunes:{inicio:`10:00`,fin:`19:00`},martes:{inicio:`10:00`,fin:`19:00`},miércoles:{inicio:`10:00`,fin:`19:00`},jueves:{inicio:`10:00`,fin:`19:00`},viernes:{inicio:`10:00`,fin:`19:00`},sábado:{inicio:`09:00`,fin:`13:00`},domingo:{inicio:`00:00`,fin:`00:00`}},eu=[{id:`S1-2026`,nombre:`Semestre 1 (Ene–Jul 2026)`,inicio:`2026-01-01`,fin:`2026-07-31`},{id:`S2-2026`,nombre:`Semestre 2 (Ago–Dic 2026)`,inicio:`2026-08-01`,fin:`2026-12-31`}],tu=[{key:`lunes`,label:`Lunes`},{key:`martes`,label:`Martes`},{key:`miércoles`,label:`Miércoles`},{key:`jueves`,label:`Jueves`},{key:`viernes`,label:`Viernes`},{key:`sábado`,label:`Sábado`}];function nu(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function ru(e){let t=Math.floor(e/60),n=e%60;return`${t.toString().padStart(2,`0`)}:${n.toString().padStart(2,`0`)}`}function iu(e,t,n,r,i=0){return e<r+i&&n-i<t}function au(e,t,n){let r=e[t]||[],i=n[t];if(!i||i.inicio===`00:00`&&i.fin===`00:00`)return[];let a=nu(i.inicio),o=nu(i.fin),s=[];return r.forEach(e=>{let t=nu(e.inicio),n=nu(e.fin),r=Math.max(t,a),i=Math.min(n,o);r<i&&s.push({start:r,end:i})}),s}function ou({clasesConMaestro:e,maestros:t,salones:n,config:r}){let i={jornada:r?.jornada||$l,gapMinimo:r?.gapMinimo===void 0?15:parseInt(r.gapMinimo),duracionBloque:r?.duracionBloque===void 0?60:parseInt(r.duracionBloque)},a=[],o=[],s={};t.forEach(e=>{s[e.id]=[]});let c={};n.forEach(e=>{c[e.id]=[]});let l=e.map(e=>{let n=t.find(t=>t.id===e.maestro_principal_id),r=0;return n&&n.disponibilidad&&Object.keys(n.disponibilidad).forEach(e=>{au(n.disponibilidad,e,i.jornada).forEach(e=>{r+=e.end-e.start})}),{...e,duracion:e.duracion||i.duracionBloque,totalAlumnos:e.total_alumnos||0,availableMinutes:r||1}});l.sort((e,t)=>e.availableMinutes===t.availableMinutes?t.totalAlumnos-e.totalAlumnos:e.availableMinutes-t.availableMinutes),l.forEach(e=>{let r=t.find(t=>t.id===e.maestro_principal_id);if(!r){o.push({clase_id:e.id,nombre:e.nombre,razon:`El maestro principal asignado (ID: ${e.maestro_principal_id}) no está registrado.`});return}let l=e.duracion,u=[];if(Object.keys(i.jornada).forEach(t=>{let a=i.jornada[t];if(!a||a.inicio===`00:00`&&a.fin===`00:00`)return;let o=au(r.disponibilidad||{},t,i.jornada);if(o.length===0)return;nu(a.inicio),nu(a.fin);let d=n.filter(t=>t.capacidad>=e.totalAlumnos&&t.is_active!==!1);d.length!==0&&o.forEach(e=>{for(let n=e.start;n+l<=e.end;n+=30){let e=n+l;(s[r.id]||[]).some(r=>r.day===t&&iu(n,e,r.start,r.end,i.gapMinimo))||d.forEach(a=>{(c[a.id]||[]).some(r=>r.day===t&&iu(n,e,r.start,r.end,i.gapMinimo))||u.push({day:t,start:n,end:e,salon:a,teacher:r})})}})}),u.length===0){let t=n.filter(t=>t.capacidad>=e.totalAlumnos&&t.is_active!==!1),i=`Sin disponibilidad compatible con maestro y salones.`;i=t.length===0?`No hay salones activos con capacidad suficiente para ${e.totalAlumnos} alumnos.`:`Conflicto de agenda: el maestro ${r.nombre} o los salones adecuados están ocupados en sus horas disponibles.`,o.push({clase_id:e.id,nombre:e.nombre,razon:i});return}u.forEach(t=>{let n=100,r=t.salon.capacidad-e.totalAlumnos;n-=Math.min(r*2,40);let i=(s[t.teacher.id]||[]).reduce((e,t)=>e+(t.end-t.start),0)/60;n-=Math.min(i*3,20),(s[t.teacher.id]||[]).some(e=>e.day===t.day&&(e.end===t.start||e.start===t.end))&&(n+=15),t.score=n}),u.sort((e,t)=>t.score-e.score);let d=u[0];a.push({clase_id:e.id,clase_nombre:e.nombre,maestro_id:r.id,maestro_nombre:r.nombre,salon_id:d.salon.id,salon_nombre:d.salon.nombre,dia:d.day,hora_inicio:ru(d.start),hora_fin:ru(d.end),color:su(r.id)}),s[r.id].push({day:d.day,start:d.start,end:d.end,classId:e.id}),c[d.salon.id].push({day:d.day,start:d.start,end:d.end,classId:e.id})});let u=e.length,d=a.length,f=o.length,p={};n.forEach(e=>{let t=(c[e.id]||[]).reduce((e,t)=>e+(t.end-t.start),0),n=0;Object.keys(i.jornada).forEach(e=>{let t=i.jornada[e];t&&(t.inicio!==`00:00`||t.fin!==`00:00`)&&(n+=nu(t.fin)-nu(t.inicio))}),p[e.id]={nombre:e.nombre,porcentaje:Math.round(t/(n||1)*100)}});let m={};t.forEach(e=>{let t=(s[e.id]||[]).reduce((e,t)=>e+(t.end-t.start),0);m[e.id]={nombre:e.nombre,horas:Math.round(t/60*10)/10}});let h=u>0?d/u*100:100;return{assignments:a,noAsignadas:o,metricas:{totalClases:u,clasesAsignadas:d,clasesNoAsignadas:f,ocupacionSalones:p,cargaMaestros:m,score:Math.max(0,Math.round(h))}}}function su(e){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);return`hsl(${Math.abs(t%360)}, 70%, 88%)`}function cu(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function lu(e,t,n=0){let r=cu(e.hora_inicio),i=cu(e.hora_fin),a=cu(t.hora_inicio);return r<cu(t.hora_fin)+n&&a-n<i}function uu(e,{returnAnnotated:t=!1,gapMinutes:n=0}={}){let r=[],i=new Set;for(let t=0;t<e.length;t++)for(let a=t+1;a<e.length;a++){let o=e[t],s=e[a];o.dia===s.dia&&lu(o,s,n)&&(o.maestro_id&&o.maestro_id===s.maestro_id&&(r.push({type:`teacher`,ids:[o.clase_id,s.clase_id],day:o.dia,hora_inicio:o.hora_inicio,description:`${o.maestro_nombre} tiene dos clases al mismo tiempo: "${o.clase_nombre}" y "${s.clase_nombre}"`}),i.add(o.clase_id),i.add(s.clase_id)),o.salon_id&&o.salon_id===s.salon_id&&(r.push({type:`room`,ids:[o.clase_id,s.clase_id],day:o.dia,hora_inicio:o.hora_inicio,description:`${o.salon_nombre} está ocupado por "${o.clase_nombre}" y "${s.clase_nombre}" al mismo tiempo`}),i.add(o.clase_id),i.add(s.clase_id)))}return t?{conflicts:r,assignments:e.map(e=>({...e,hasConflict:i.has(e.clase_id)}))}:r}function du({conflictDescription:e}){return new Promise(t=>{let n=document.createElement(`div`);n.className=`modal-backdrop fade show`,n.style.zIndex=`1040`;let r=document.createElement(`div`);r.className=`modal fade show d-block`,r.style.zIndex=`1050`,r.setAttribute(`role`,`dialog`),r.setAttribute(`aria-modal`,`true`),r.innerHTML=`
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
    `;let i=r.querySelector(`.modal-body p`);i&&(i.textContent=e);function a(e){document.body.removeChild(r),document.body.removeChild(n),t(e)}r.querySelector(`[data-action="confirm"]`).addEventListener(`click`,()=>a(!0)),r.querySelector(`[data-action="cancel"]`).addEventListener(`click`,()=>a(!1)),document.body.appendChild(n),document.body.appendChild(r)})}function fu(e,{assignments:t,onMove:n,onConflict:r}){let i=new AbortController,{signal:a}=i,o=null;return e.addEventListener(`dragstart`,e=>{let t=e.target.closest(`[draggable="true"][data-clase-id]`);t&&(o=t.dataset.claseId,t.classList.add(`hb-dragging`),e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,o)))},{signal:a}),e.addEventListener(`dragend`,e=>{let t=e.target.closest(`[draggable="true"][data-clase-id]`);t&&t.classList.remove(`hb-dragging`),o=null},{signal:a}),e.addEventListener(`dragover`,e=>{let t=e.target.closest(`[data-day][data-hour]`);t&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`move`),t.classList.contains(`hb-drop-target`)||t.classList.add(`hb-drop-target`))},{signal:a}),e.addEventListener(`dragleave`,e=>{let t=e.target.closest(`[data-day][data-hour]`);t&&(t.contains(e.relatedTarget)||t.classList.remove(`hb-drop-target`))},{signal:a}),e.addEventListener(`drop`,e=>{let i=e.target.closest(`[data-day][data-hour]`);if(!i)return;e.preventDefault(),i.classList.remove(`hb-drop-target`);let a=o??(e.dataTransfer?e.dataTransfer.getData(`text/plain`):null);if(!a)return;let s=i.dataset.day,c=i.dataset.hour,l=t.find(e=>String(e.clase_id)===String(a));if(!l)return;let u=l.dia,d=l.hora_inicio,f=uu(t.map(e=>{if(String(e.clase_id)!==String(a))return e;let[t,n]=e.hora_inicio.split(`:`).map(Number),[r,i]=e.hora_fin.split(`:`).map(Number),o=r*60+i-(t*60+n),[l,u]=c.split(`:`).map(Number),d=l*60+u+o,f=`${String(Math.floor(d/60)).padStart(2,`0`)}:${String(d%60).padStart(2,`0`)}`;return{...e,dia:s,hora_inicio:c,hora_fin:f}}),{gapMinutes:0});f.length===0?n({claseId:a,fromDay:u,fromHour:d,toDay:s,toHour:c}):r({assignment:l,targetDay:s,targetHour:c,conflicts:f})},{signal:a}),{destroy(){i.abort()}}}var pu={piano:`#818cf8`,violín:`#34d399`,violin:`#34d399`,guitarra:`#f472b6`,canto:`#fb923c`,voz:`#ec4899`,percusión:`#a78bfa`,percusion:`#a78bfa`,solfeo:`#38bdf8`,cello:`#f59e0b`,flauta:`#06b6d4`,trompeta:`#84cc16`,general:`#94a3b8`};function mu(e=``){return pu[e.toLowerCase()]??pu.general}function hu(e=``){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);return`hsl(${Math.abs(t%360)}, 70%, 88%)`}function gu(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function _u(e,{draggable:t=!1}={}){let{clase_id:n,clase_nombre:r,instrumento:i=`General`,maestro_id:a,maestro_nombre:o=``,salon_nombre:s=``,hora_inicio:c,hora_fin:l,locked:u=!1,hasConflict:d=!1}=e,f=mu(i),p=hu(a||``),m=t&&!u,h=gu(o.split(` `).slice(0,2).map(e=>e[0]??``).join(``).toUpperCase()),g=d?`border: 2px solid #ef4444;`:`border: 2px solid transparent;`,ee=d?`<span class="sb-conflict-icon" title="Conflicto detectado">⚠</span>`:``,te=gu(n),ne=m?`<button class="sb-lock-btn" data-clase-id="${te}" data-locked="${u}"
               style="background:none;border:none;cursor:pointer;padding:0;font-size:0.65rem;line-height:1;"
               title="${u?`Desbloquear`:`Bloquear`}">
         ${u?`🔒`:`🔓`}
       </button>`:u?`<span class="sb-lock-icon">🔒</span>`:``;return`
    <div class="schedule-block"
         data-clase-id="${te}"
         data-locked="${u}"
         ${m?`draggable="true"`:``}
         style="border-radius:0.4rem;overflow:hidden;${g}cursor:${m?`grab`:`default`};user-select:none;margin-bottom:2px;">
      <!-- Instrument header bar -->
      <div class="sb-header" style="background:${f};padding:3px 6px;display:flex;align-items:center;justify-content:space-between;gap:4px;">
        <span style="font-size:0.65rem;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${gu(r)}</span>
        <span style="display:flex;gap:2px;flex-shrink:0;">${ee}${ne}</span>
      </div>
      <!-- Teacher / room body -->
      <div class="sb-body" style="background:#f8fafc;padding:3px 6px;display:flex;align-items:center;gap:5px;">
        <span class="sb-teacher-dot" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${p};font-size:0.45rem;font-weight:700;color:#1e293b;flex-shrink:0;">${h}</span>
        <span style="font-size:0.58rem;color:#475569;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${gu(o)}</span>
      </div>
      ${s?`<div style="background:#f1f5f9;padding:2px 6px;font-size:0.55rem;color:#64748b;border-top:1px solid #e2e8f0;">${gu(s)} · ${c}–${l}</div>`:``}
    </div>
  `}var vu=`<p class="text-muted text-center py-4">No hay asignaciones para mostrar.</p>`;function yu(e){if(!e||!e.includes(`:`))return`00:00`;let[t]=e.split(`:`);return`${t.padStart(2,`0`)}:00`}function bu(e,t,n){let r=new Map;for(let t of e){let e=yu(t.hora_inicio);r.has(e)||r.set(e,new Map);let n=r.get(e),i=(t.dia||``).toLowerCase();n.has(i)||n.set(i,[]),n.get(i).push(t)}let i=[...r.keys()].sort(),a=tu.map(e=>`<th class="sg-col-header" data-day="${e.key}" style="text-align:center;padding:4px 6px;font-size:0.75rem;">${e.label}</th>`).join(``),o=i.map(e=>{let n=r.get(e);return`<tr>
      <td class="sg-hour-label" style="font-size:0.7rem;color:#64748b;padding:4px 8px;white-space:nowrap;vertical-align:top;">${e}</td>
      ${tu.map(r=>{let i=(n.get(r.key)||[]).map(e=>_u(e,{draggable:t})).join(``);return`<td class="sg-cell" data-day="${r.key}" data-hour="${e}" style="vertical-align:top;padding:3px;min-width:100px;">${i}</td>`}).join(``)}
    </tr>`}).join(``);return`
    <div class="schedule-grid-wrapper" style="overflow-x:auto;">
      <table class="schedule-grid" style="width:100%;border-collapse:collapse;">
        ${n?`<caption class="text-muted" style="caption-side:top;font-size:0.75rem;padding-bottom:4px;">${n}</caption>`:``}
        <thead>
          <tr>
            <th class="sg-hour-col" aria-label="Hora" style="min-width:56px;"></th>
            ${a}
          </tr>
        </thead>
        <tbody>
          ${o}
        </tbody>
      </table>
    </div>
  `}function xu(e,t,n){let r=new Map;for(let n of e){let e=n[t]||`(Sin asignar)`;r.has(e)||r.set(e,[]),r.get(e).push(n)}return`<div class="schedule-grouped-view">${[...r.entries()].map(([e,t])=>{let r=t.map(e=>_u(e,{draggable:n})).join(``);return`
      <div class="sg-group" style="margin-bottom:1rem;">
        <h4 class="sg-group-title" style="font-size:0.85rem;font-weight:700;color:#1e293b;margin-bottom:0.5rem;">${gu(e)}</h4>
        <div class="sg-group-blocks" style="display:flex;flex-wrap:wrap;gap:6px;">${r}</div>
      </div>
    `}).join(``)}</div>`}function Su({assignments:e,activeView:t,draggable:n=!1,periodoId:r}={}){if(!e||e.length===0)return vu;switch(t){case`teacher`:return xu(e,`maestro_nombre`,n);case`room`:return xu(e,`salon_nombre`,n);case`student`:return xu(e,`clase_nombre`,n);default:return bu(e,n,r)}}var Cu=[`grid`,`teacher`,`room`,`student`],wu={grid:{label:`Grilla`,icon:`bi-grid-3x3`},teacher:{label:`Por Maestro`,icon:`bi-person-lines-fill`},room:{label:`Por Salón`,icon:`bi-door-open`},student:{label:`Por Alumno`,icon:`bi-mortarboard`}};function Tu(e=`grid`){return wu[e]||(e=`grid`),`
    <div class="view-toggle" style="display:flex;gap:0.4rem;flex-wrap:wrap;" role="tablist" aria-label="Modo de visualización">
      ${Cu.map(t=>{let{label:n,icon:r}=wu[t],i=t===e;return`
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
  `}var Eu={lunes:`Lun`,martes:`Mar`,miércoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sábado:`Sáb`};function Du(e=[],t=!1){if(e.length===0)return``;let n=e.length,r=e.map((e,t)=>{e.type;let n=gu(Eu[e.day]??e.day);return`
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
        <span style="background:#fecaca;color:#991b1b;border-radius:4px;padding:1px 5px;font-size:0.6rem;font-weight:700;flex-shrink:0;margin-top:1px;">${gu(e.type)}</span>
        <span style="font-size:0.72rem;color:#7f1d1d;line-height:1.4;">${n} ${e.hora_inicio} — ${gu(e.description)}</span>
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
  `}function Ou(e,t,n){let r=e.querySelector(`.cp-header`),i=e.querySelector(`.cp-body`),a=e.querySelector(`.cp-chevron`);r?.addEventListener(`click`,()=>{let e=i.style.display!==`none`;i.style.display=e?`none`:`block`,a.className=`bi ${e?`bi-chevron-down`:`bi-chevron-up`}`}),e.querySelectorAll(`.cp-row`).forEach(e=>{e.addEventListener(`mouseenter`,()=>{e.style.background=`#fff1f2`}),e.addEventListener(`mouseleave`,()=>{e.style.background=`transparent`}),e.addEventListener(`click`,()=>{let r=parseInt(e.dataset.conflictIndex,10);isNaN(r)||!t[r]||n?.(t[r])})})}var ku=[`borrador`,`revision`,`publicado`],Au={borrador:`Borrador`,revision:`Revisión`,publicado:`Publicado`};function ju(e){let t=document.createElement(`li`);t.className=`pw-feedback-item d-flex align-items-start gap-2 mb-1`;let n=document.createElement(`span`);n.className=`badge bg-secondary`,n.textContent=e.tipo;let r=document.createElement(`span`);return r.textContent=e.comentario,t.appendChild(n),t.appendChild(r),t}function Mu(e,{runId:t,estadoActual:n,isAdmin:r,feedback:i=[],onEstadoChange:a,onFeedbackAdd:o}){let s=ku.indexOf(n);e.innerHTML=`
    <div class="pw-wizard">
      <!-- Stage indicators -->
      <div class="pw-stages d-flex align-items-center gap-2 mb-3">
        ${ku.map((e,t)=>{let n=`pw-stage`;t===s?n+=` pw-stage--active`:t<s&&(n+=` pw-stage--done`);let r=t<ku.length-1?`<div class="pw-stage-connector"></div>`:``;return`
      <div class="${n}" data-stage="${e}">
        <span class="pw-stage-dot"></span>
        <span class="pw-stage-label">${Au[e]}</span>
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
  `;let c=e.querySelector(`.pw-send-revision-btn`);c&&c.addEventListener(`click`,()=>a?.(`revision`));let l=e.querySelector(`.pw-approve-btn`);l&&l.addEventListener(`click`,()=>a?.(`publicado`));let u=e.querySelector(`.pw-add-feedback-btn`),d=e.querySelector(`.pw-feedback-input`);function f(){let e=d?.value?.trim();e&&(o?.({comentario:e,tipo:`observacion`}),d&&(d.value=``))}u&&u.addEventListener(`click`,f),d&&d.addEventListener(`keydown`,e=>{e.key===`Enter`&&f()});let p=e.querySelector(`.pw-feedback-list`);p&&(p.innerHTML=``,(i||[]).forEach(e=>p.appendChild(ju(e))))}async function Nu(e){let{data:t,error:n}=await b.from(`schedule_run_feedback`).select(`*`).eq(`run_id`,e).order(`created_at`,{ascending:!0});if(n)throw n;return t}async function Pu({runId:e,comentario:t,tipo:n=`observacion`}){let{data:r,error:i}=await b.from(`schedule_run_feedback`).insert([{run_id:e,comentario:t,tipo:n}]).select().single();if(i)throw i;return r}async function Fu(){let{data:{user:e}}=await b.auth.getUser();if(!e)return!1;let{data:t,error:n}=await b.from(`maestros`).select(`es_admin`).eq(`user_id`,e.id).single();return n||!t?!1:t.es_admin===!0}async function Iu(e,t){let{data:n,error:r}=await b.from(`schedule_runs`).update({estado:t}).eq(`id`,e).select().single();if(r)throw r;return n}function Lu(){return{assignments:[],conflicts:[],activeView:`grid`,activePeriodo:eu[0].id,draggable:!1,conflictPanelExpanded:!1,scheduleRuns:[],loading:!1,error:null,undoStack:[],redoStack:[],estado:`borrador`,runId:null,isAdmin:!1,feedback:[],publishWizardOpen:!1}}var Q=Lu(),$=null,Ru=null;function zu(e){$=e,Q=Lu(),Bu(),Zu(),Ql().then(e=>{Q.scheduleRuns=e||[]}).catch(e=>console.warn(`[horarioBuilderView] getScheduleRuns failed:`,e)),Fu().then(e=>{Q.isAdmin=e}).catch(()=>{})}function Bu(){let e=eu.map(e=>`<option value="${e.id}" ${e.id===Q.activePeriodo?`selected`:``}>${e.nombre}</option>`).join(``),t=Q.draggable?`bi-unlock-fill`:`bi-lock-fill`,n=Q.draggable?`Bloqueando`:`Editar`;$.innerHTML=`
    <div class="hb-view">
      <!-- Toolbar -->
      <div class="hb-toolbar d-flex align-items-center gap-2 mb-3">
        <select class="form-select form-select-sm w-auto" id="hb-periodo-select">
          ${e}
        </select>
        <div id="hb-view-toggle-slot">
          ${Tu(Q.activeView)}
        </div>
        <div class="flex-grow-1"></div>
        <button class="btn btn-sm btn-outline-secondary" id="hb-drag-toggle" title="Activar modo edición drag &amp; drop">
          <i class="bi ${t}"></i> ${n}
        </button>
        <button class="btn btn-sm" id="hb-undo-btn" disabled title="Deshacer">
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
        <button class="btn btn-sm" id="hb-redo-btn" disabled title="Rehacer">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
        <button class="btn btn-sm btn-primary" id="hb-generate-btn">
          <i class="bi bi-lightning-fill"></i> Generar
        </button>
        <button class="btn btn-sm btn-success" id="hb-save-btn" disabled>
          <i class="bi bi-floppy-fill"></i> Guardar
        </button>
        <button class="btn btn-sm btn-outline-primary" id="hb-publish-btn" disabled>
          <i class="bi bi-globe"></i> Publicar
        </button>
      </div>

      <!-- Conflict panel -->
      <div id="hb-conflict-panel-wrapper"></div>

      <!-- Grid area -->
      <div id="hb-grid-wrapper" class="hb-grid-wrapper"></div>

      <!-- Publish wizard panel -->
      <div id="hb-publish-wrapper" class="mt-3" style="display:none"></div>

      <!-- Loading / error overlay -->
      <div id="hb-status"></div>
    </div>
  `}function Vu(){let e=$.querySelector(`#hb-grid-wrapper`);e&&(e.innerHTML=Su({assignments:Q.assignments,activeView:Q.activeView,draggable:Q.draggable,periodoId:Q.activePeriodo}))}function Hu(){let e=$.querySelector(`#hb-conflict-panel-wrapper`);if(!e)return;let t=e.querySelector(`.cp-body`);t&&(Q.conflictPanelExpanded=t.style.display===`block`),e.innerHTML=Du(Q.conflicts,Q.conflictPanelExpanded),Ou(e,Q.conflicts,e=>{let t=$.querySelector(`.hb-view`);e.ids.forEach(e=>{let n=t?.querySelector(`[data-clase-id="${e}"]`);n&&(n.scrollIntoView({behavior:`smooth`,block:`nearest`}),n.classList.add(`hb-highlight`),setTimeout(()=>n.classList.remove(`hb-highlight`),1500))})})}function Uu(){let e=$.querySelector(`#hb-view-toggle-slot`);e&&(e.innerHTML=Tu(Q.activeView))}function Wu(){let e=$.querySelector(`#hb-publish-wrapper`);if(e){if(!Q.publishWizardOpen||!Q.runId){e.style.display=`none`;return}e.style.display=``,Mu(e,{runId:Q.runId,estadoActual:Q.estado,isAdmin:Q.isAdmin,feedback:Q.feedback,async onEstadoChange(e){try{await Iu(Q.runId,e),Q.estado=e,Wu()}catch(e){console.error(`[horario-builder] estado update failed:`,e)}},async onFeedbackAdd({comentario:e,tipo:t}){try{let n=await Pu({runId:Q.runId,comentario:e,tipo:t});Q.feedback=[...Q.feedback,n],Wu()}catch(e){console.error(`[horario-builder] feedback add failed:`,e)}}})}}function Gu(e){Q.loading=e;let t=$.querySelector(`#hb-status`);t&&(t.innerHTML=e?`<div class="d-flex align-items-center gap-2 mt-2 text-muted" style="font-size:0.85rem;">
         <div class="spinner-border spinner-border-sm" role="status"></div>
         <span>Generando horario optimizado…</span>
       </div>`:``)}function Ku(e,t=`success`){let n=document.createElement(`div`);n.className=`hb-toast`;let r=`bi-check-circle-fill text-success`,i=`#10b981`;t===`danger`?(r=`bi-exclamation-octagon-fill text-danger`,i=`#ef4444`):t===`warning`&&(r=`bi-info-circle-fill text-warning`,i=`#f59e0b`),n.style.borderLeftColor=i,n.innerHTML=`
    <i class="bi ${r}"></i>
    <span style="font-size:0.85rem;font-weight:650;color:var(--hb-text);">${e}</span>
  `,document.body.appendChild(n),setTimeout(()=>{n.style.animation=`fadeIn 0.3s reverse forwards`,setTimeout(()=>n.remove(),300)},3500)}function qu(e,t){let[n,r]=e.split(`:`).map(Number),[i,a]=t.split(`:`).map(Number);return i*60+a-(n*60+r)}function Ju(e,t){let[n,r]=e.split(`:`).map(Number),i=n*60+r+t,a=Math.floor(i/60),o=i%60;return`${String(a).padStart(2,`0`)}:${String(o).padStart(2,`0`)}`}function Yu(){let e=$?.querySelector(`#hb-undo-btn`),t=$?.querySelector(`#hb-redo-btn`);e&&(e.disabled=Q.undoStack.length===0),t&&(t.disabled=Q.redoStack.length===0)}function Xu(){Ru&&Ru.destroy(),Q.draggable&&(Ru=fu($.querySelector(`#hb-grid-wrapper`),{assignments:Q.assignments,onMove({claseId:e,fromDay:t,fromHour:n,toDay:r,toHour:i}){Q.undoStack.push(JSON.parse(JSON.stringify(Q.assignments))),Q.redoStack=[];let a=Q.assignments.findIndex(t=>t.clase_id===e);if(a===-1)return;let o={...Q.assignments[a]},s=qu(o.hora_inicio,o.hora_fin);o.dia=r,o.hora_inicio=i,o.hora_fin=Ju(i,s),Q.assignments[a]=o;let{conflicts:c,assignments:l}=uu(Q.assignments,{returnAnnotated:!0});Q.conflicts=c,Q.assignments=l,Vu(),Hu(),Yu(),Xu()},async onConflict({assignment:e,targetDay:t,targetHour:n,conflicts:r}){let i=$.querySelector(`#hb-drag-toggle`);[i,$.querySelector(`#hb-undo-btn`),$.querySelector(`#hb-redo-btn`)].forEach(e=>{e&&(e.disabled=!0)});try{if(!await du({conflictDescription:r.map(e=>e.description).join(`
`)}))return;Q.undoStack.push(JSON.parse(JSON.stringify(Q.assignments))),Q.redoStack=[];let i=Q.assignments.findIndex(t=>t.clase_id===e.clase_id);if(i===-1)return;let a={...Q.assignments[i]},o=qu(a.hora_inicio,a.hora_fin);a.dia=t,a.hora_inicio=n,a.hora_fin=Ju(n,o),Q.assignments[i]=a;let s=uu(Q.assignments,{returnAnnotated:!0});Q.conflicts=s.conflicts,Q.assignments=s.assignments,Vu(),Hu(),Yu(),Xu()}finally{i&&(i.disabled=!1),Yu()}}}))}function Zu(){$.addEventListener(`change`,e=>{e.target.id===`hb-periodo-select`&&(Q.activePeriodo=e.target.value,Vu())}),$.addEventListener(`click`,async e=>{let t=e.target.closest(`.vt-pill[data-view]`);if(t){let e=t.dataset.view;Cu.includes(e)&&e!==Q.activeView&&(Q.activeView=e,Uu(),Vu());return}if(e.target.closest(`#hb-drag-toggle`)){Q.draggable=!Q.draggable;let e=$.querySelector(`#hb-drag-toggle`);e&&(e.innerHTML=Q.draggable?`<i class="bi bi-unlock-fill"></i> Bloqueando`:`<i class="bi bi-lock-fill"></i> Editar`),Vu(),Xu();return}if(e.target.closest(`#hb-undo-btn`)){if(Q.undoStack.length===0)return;Q.redoStack.push(JSON.parse(JSON.stringify(Q.assignments))),Q.assignments=Q.undoStack.pop();let e=uu(Q.assignments,{returnAnnotated:!0});Q.conflicts=e.conflicts,Q.assignments=e.assignments,Vu(),Hu(),Yu(),Xu();return}if(e.target.closest(`#hb-redo-btn`)){if(Q.redoStack.length===0)return;Q.undoStack.push(JSON.parse(JSON.stringify(Q.assignments))),Q.assignments=Q.redoStack.pop();let e=uu(Q.assignments,{returnAnnotated:!0});Q.conflicts=e.conflicts,Q.assignments=e.assignments,Vu(),Hu(),Yu(),Xu();return}if(e.target.closest(`#hb-generate-btn`)){Qu();return}if(e.target.closest(`#hb-save-btn`)){$u();return}if(e.target.closest(`#hb-publish-btn`)){if(Q.publishWizardOpen=!Q.publishWizardOpen,Q.publishWizardOpen&&Q.runId)try{Q.feedback=await Nu(Q.runId)}catch{Q.feedback=[]}Wu();return}})}async function Qu(){let e=$.querySelector(`#hb-generate-btn`);e&&(e.disabled=!0),Gu(!0);try{let e=await Xl(),{conflicts:t,assignments:n}=uu(ou({clasesConMaestro:(e.clases||[]).map(e=>({id:e.id,nombre:e.nombre,maestro_principal_id:e.maestro_principal_id,total_alumnos:e.total_alumnos||0,duracion:60})),maestros:e.maestros||[],salones:e.salones||[],config:{gapMinimo:15,duracionBloque:60}}).assignments,{returnAnnotated:!0,gapMinutes:15});Q.assignments=n,Q.conflicts=t,Vu(),Hu(),Xu();let r=$.querySelector(`#hb-save-btn`);r&&(r.disabled=Q.assignments.length===0),Ku(t.length>0?`Horario generado con ${t.length} conflicto(s)`:`Horario optimizado sin conflictos`,t.length>0?`warning`:`success`)}catch(e){console.error(`[horarioBuilderView] handleGenerate error:`,e),Ku(`Error al generar: `+e.message,`danger`)}finally{Gu(!1),e&&(e.disabled=!1)}}async function $u(){let e=$.querySelector(`#hb-save-btn`);e&&(e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Guardando…`);try{let e=await Zl({assignments:Q.assignments,periodo_id:Q.activePeriodo,estado:`borrador`});if(e?.id){Q.runId=e.id,Q.estado=`borrador`;let t=$.querySelector(`#hb-publish-btn`);t&&(t.disabled=!1),Ku(`Horario guardado como borrador`,`success`)}else Ku(`Guardado incompleto: no se obtuvo ID del registro`,`warning`);Q.error=null}catch(e){console.error(`[horarioBuilderView] handleSave error:`,e),Q.error=e.message,Ku(`Error al guardar: `+e.message,`danger`)}finally{e&&(e.disabled=!1,e.innerHTML=`<i class="bi bi-floppy-fill"></i> Guardar`)}}function ed(){C.register(`horario-builder`,zu)}function td(){C.register(`admin-notificaciones`,e=>{try{Pe(e)}catch(t){console.error(`[admin-notificaciones] Error al renderizar la vista:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar el Centro de Actividad: ${t.message}</p>
        </div>
      `}})}function nd(){C.register(`admin-aprobacion`,async e=>{try{await Ee(e)}catch(t){console.error(`[admin-aprobacion] Error al renderizar la vista de aprobaciones:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la aprobación de maestros: ${t.message}</p>
        </div>
      `}}),C.register(`admin-ausencias`,async e=>{try{await ve(e)}catch(t){console.error(`[admin-aprobacion] Error al renderizar la vista de ausencias:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la gestión de ausencias: ${t.message}</p>
        </div>
      `}})}if(re(),`serviceWorker`in navigator){let e=async()=>{try{let e=await navigator.serviceWorker.register(`/sw.js`);console.log(`[PWA] Service Worker registered:`,e.scope)}catch(e){console.log(`[PWA] Service Worker registration failed:`,e)}};document.readyState===`complete`?e():window.addEventListener(`load`,e)}else `serviceWorker`in navigator;window.bootstrap=We,window.router=C;var rd=[{id:`programas`,label:`Programas`,icon:`bi-book`,description:`Gestión de programas académicos`,enabled:!0,register:Gt},{id:`academic-admin`,label:`Gestión Curricular`,icon:`bi-diagram-3`,description:`Gestión de mapa curricular y recursos`,enabled:!0,register:Uc},{id:`admin-dashboard`,label:`Dashboard Administrativo`,icon:`bi-speedometer2`,description:`Panel de control, reportes y analítica de maestros`,enabled:!0,register:rl},{id:`admin-notificaciones`,label:`Centro de Actividad`,icon:`bi-bell`,description:`Alertas tempranas de riesgo y sustituciones sugeridas`,enabled:!0,register:td},{id:`admin-aprobacion`,label:`Aprobación de Maestros`,icon:`bi-person-check`,description:`Aprobación de maestros y gestión de ausencias`,enabled:!0,register:nd},{id:`maestros`,label:`Maestros`,icon:`bi-person-check`,description:`Gestión de maestros/docentes`,enabled:!0,register:Wt},{id:`alumnos`,label:`Alumnos`,icon:`bi-people`,description:`Gestión de estudiantes`,enabled:!0,register:fo},{id:`salones`,label:`Salones`,icon:`bi-door-open`,description:`Gestión de espacios de clase`,enabled:!0,register:To},{id:`clases`,label:`Clases`,icon:`bi-easel`,description:`Gestión de clases y horarios`,enabled:!0,register:Eo},{id:`horario-builder`,label:`Constructor de Horarios`,icon:`bi-calendar-range`,description:`Motor de asignación y optimización de horarios`,enabled:!0,register:ed},{id:`asistencias`,label:`Asistencias`,icon:`bi-calendar-check`,description:`Control de asistencia`,enabled:!0,register:qo},{id:`planificacion`,label:`Planificación`,icon:`bi-journal-text`,description:`Planificación pedagógica`,enabled:!0,register:ks},{id:`progresos`,label:`Progresos`,icon:`bi-graph-up`,description:`Calificaciones y progreso`,enabled:!0,register:nc},{id:`observaciones`,label:`Observaciones`,icon:`bi-chat-quote`,description:`Anotaciones disciplinarias`,enabled:!0,register:Sc},{id:`metricas`,label:`Métricas`,icon:`bi-bar-chart-line`,description:`KPIs, alertas y análisis institucional`,enabled:!0,register:Ic},{id:`permisos`,label:`Permisos`,icon:`bi-shield-lock`,description:`Permisos y roles de maestros`,enabled:!0,register:Sl},{id:`pedagogico`,label:`Pedagógico`,icon:`bi-journal-check`,description:`Dashboard, seguimiento y reportes pedagógicos`,enabled:!0,register:Ul},{id:`config`,label:`Configuración`,icon:`bi-gear`,description:`Configuración del sistema`,enabled:!0,register:Lc}];function id(){let e=localStorage.getItem(`app-theme`),t=window.matchMedia(`(prefers-color-scheme: dark)`).matches,n=e===`dark`||e===null&&t;return document.documentElement.setAttribute(`data-bs-theme`,n?`dark`:`light`),n}function ad(){let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-bs-theme`,e),localStorage.setItem(`app-theme`,e)}var od=[{id:`academico`,label:`Académico`,icon:`bi-easel`,items:[{id:`programas`,label:`Programas`,icon:`bi-book`},{id:`clases`,label:`Clases`,icon:`bi-easel2`},{id:`salones`,label:`Salones`,icon:`bi-door-open`},{id:`horario-builder`,label:`Constructor Horarios`,icon:`bi-calendar-range`}]},{id:`personas`,label:`Personas`,icon:`bi-people`,items:[{id:`alumnos`,label:`Alumnos`,icon:`bi-people`},{id:`maestros`,label:`Maestros`,icon:`bi-person-check`},{id:`postulados`,label:`Postulados`,icon:`bi-person-plus-fill`},{id:`postulados-calendario`,label:`Calendario Citas`,icon:`bi-calendar-event`}]},{id:`pedagogico`,label:`Pedagógico`,icon:`bi-journal-check`,items:[{id:`pedagogico-dashboard`,label:`Dashboard`,icon:`bi-grid-1x2`},{id:`planificacion`,label:`Planificación`,icon:`bi-journal-text`},{id:`planificacion-maestros`,label:`Todas las Planes`,icon:`bi-journal-check`},{id:`pedagogico-seguimiento`,label:`Seguimiento`,icon:`bi-person-lines-fill`},{id:`pedagogico-reportes`,label:`Reportes`,icon:`bi-file-earmark-bar-graph`}]},{id:`analisis`,label:`Análisis`,icon:`bi-bar-chart-line`,items:[{id:`metricas`,label:`Dashboard`,icon:`bi-bar-chart-line`},{id:`admin-dashboard`,label:`Cumplimiento Maestros`,icon:`bi-clipboard-check`},{id:`admin-dashboard-reportes`,label:`Reportes Director`,icon:`bi-file-earmark-pdf`},{id:`admin-dashboard-analitca-llenado`,label:`Analítica Llenado`,icon:`bi-graph-up`},{id:`admin-dashboard-tendencias`,label:`Tendencias`,icon:`bi-arrow-up-right`}]},{id:`sistema`,label:`Sistema`,icon:`bi-gear`,items:[{id:`admin-notificaciones`,label:`Centro de Actividad`,icon:`bi-bell`},{id:`admin-aprobacion`,label:`Aprobaciones`,icon:`bi-person-check`},{id:`admin-ausencias`,label:`Gestión Ausencias`,icon:`bi-calendar-x`},{id:`configuracion`,label:`Configuración`,icon:`bi-sliders`},{id:`permisos`,label:`Permisos`,icon:`bi-shield-lock`},{id:`importar-datos`,label:`Importar Datos`,icon:`bi-cloud-upload`}]}];function sd(e){for(let t of od)if(t.items.some(t=>t.id===e))return t.id;return od[0].id}var cd=null;function ld(e){let t=document.getElementById(`sidebar-notif-badge`);t&&(e>0?(t.textContent=e>99?`99+`:String(e),t.style.display=`inline-flex`):t.style.display=`none`)}function ud(e,t=!1){cd?.abort(),cd=new AbortController;let{signal:n}=cd;if(document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),!t)return;let r=E.getUser(),i=r?r.email||r.full_name||`Usuario`:``,a=localStorage.getItem(`current-view`)||`programas`,o=sd(a),s=document.documentElement.getAttribute(`data-bs-theme`)===`dark`,c=v.isDemoMode,l=document.createElement(`aside`);l.className=`app-sidebar`,l.innerHTML=`
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
      <span class="sidebar-brand-text">SOI</span>
      ${c?`<span class="badge bg-warning text-dark ms-2" style="font-size: 0.6rem;">DEMO</span>`:``}
    </div>
    <nav class="sidebar-nav">
      ${od.map(e=>`
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
  `;let u=document.createElement(`nav`);u.className=`app-bottom-nav`,u.innerHTML=od.map(e=>`
    <button class="bottom-tab ${e.id===o?`active`:``}" data-group="${e.id}">
      <i class="bi ${e.icon}"></i>
      <span>${e.label}</span>
    </button>
  `).join(``);let d=document.createElement(`div`);d.className=`mobile-sub-sheet`,d.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-title" id="sheetTitle"></div>
    <div class="sheet-items" id="sheetItems"></div>
  `,document.body.prepend(d),document.body.prepend(u),document.body.prepend(l),l.querySelectorAll(`.nav-group-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.nav-group`),n=t.classList.contains(`expanded`);l.querySelectorAll(`.nav-group`).forEach(e=>e.classList.remove(`expanded`)),n||t.classList.add(`expanded`)})}),l.querySelectorAll(`.nav-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>C.navigate(e.dataset.route))}),l.querySelector(`#sidebarBtnTheme`).addEventListener(`click`,()=>{ad();let e=document.documentElement.getAttribute(`data-bs-theme`)===`dark`;l.querySelector(`#sidebarBtnTheme i`).className=e?`bi bi-sun-fill`:`bi bi-moon-fill`}),l.querySelector(`#sidebarBtnLogout`).addEventListener(`click`,async()=>{await E.logout(),C.navigate(`login`)});function f(e){let t=od.find(t=>t.id===e);if(!t)return;let n=localStorage.getItem(`current-view`)||``;document.getElementById(`sheetTitle`).textContent=t.label,document.getElementById(`sheetItems`).innerHTML=t.items.map(e=>`
      <button class="sheet-item ${e.id===n?`active`:``}" data-route="${e.id}">
        <i class="bi ${e.icon}"></i>
        <span>${e.label}</span>
      </button>
    `).join(``),d.dataset.group=e,d.classList.add(`open`),d.querySelectorAll(`.sheet-item`).forEach(e=>{e.addEventListener(`click`,()=>{C.navigate(e.dataset.route),d.classList.remove(`open`)})})}u.querySelectorAll(`.bottom-tab`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.group;d.classList.contains(`open`)&&d.dataset.group===t?d.classList.remove(`open`):(f(t),u.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===t)))})}),document.addEventListener(`click`,e=>{d.classList.contains(`open`)&&!d.contains(e.target)&&!u.contains(e.target)&&d.classList.remove(`open`)},{signal:n}),window.addEventListener(`routeChanged`,e=>{let t=e.detail,n=sd(t);l.querySelectorAll(`.nav-item-btn`).forEach(e=>e.classList.toggle(`active`,e.dataset.route===t)),l.querySelectorAll(`.nav-group`).forEach(e=>{e.dataset.group===n?e.classList.add(`expanded`):e.classList.remove(`expanded`)}),u.querySelectorAll(`.bottom-tab`).forEach(e=>e.classList.toggle(`active`,e.dataset.group===n))},{signal:n})}function dd(){try{Ut()}catch(e){console.error(`Error registering auth routes:`,e)}rd.filter(e=>e.enabled&&e.register).forEach(e=>{try{e.register()}catch(t){console.error(`Error registering module ${e.id}:`,t)}})}async function fd(){let e=document.querySelector(`#app`);if(!e){console.error(`El contenedor #app no existe en el HTML`);return}id(),dd(),C.initCustomEvents(),console.log(`🔄 Sincronizando sesión...`),await E.refreshAuth();let t=[`login`,`register`];C.setAuthGuard(()=>E.isAuthenticated(),t);let n=localStorage.getItem(`current-view`)||`programas`,r=E.isAuthenticated();!r&&!t.includes(n)?(localStorage.setItem(`current-view`,`login`),C.navigate(`login`)):r&&t.includes(n)?(localStorage.setItem(`current-view`,`programas`),ud(e,!0),C.navigate(`programas`)):(r&&ud(e,!0),C.init()),E.subscribe(t=>{if(t.user)ud(e,!0),we(ld);else{Ae(),e.innerHTML=``;let t=document.querySelector(`.app-navbar`);t&&t.remove(),document.querySelector(`.app-sidebar`)?.remove(),document.querySelector(`.app-bottom-nav`)?.remove(),document.querySelector(`.mobile-sub-sheet`)?.remove(),C.navigate(`login`)}})}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,fd):fd();function pd(){let e=localStorage.getItem(`current-view`)||`programas`,t=document.querySelector(`.teacher-bridge`);t&&(e===`programas`?t.classList.add(`visible`):t.classList.remove(`visible`))}pd(),window.addEventListener(`routeChanged`,e=>{pd()});export{Bn as a,Ln as c,In as i,Mn as n,Nn as o,Pn as r,Fn as s,zn as t};