const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ausenciaForm-GyH3Snq4.js","assets/supabase-KnARm58N.js","assets/ausenciaHistorial-4o3X3WJP.js","assets/jspdf.es.min-GjK8N93W.js","assets/rolldown-runtime-DlOssbPu.js","assets/preload-helper-lqsI3teB.js","assets/typeof-DGC0iumi.js","assets/jspdf.plugin.autotable-BLAnV92G.js","assets/planificacionAdapter-YQ-GJwgP.js","assets/clases-CdwqU54c.js","assets/config-Bj9A07Ke.js","assets/alumnos-D7LnSF97.js","assets/sesiones-DCxZQJi9.js","assets/cumplimientoMaestrosWidget-Dthdkq63.js","assets/InfoTooltip-BOK5LUMZ.js","assets/cumplimientoMaestrosWidget-BlUYKlE2.css","assets/analyticsFillingBehaviorWidget-C9uPYtFf.js","assets/analyticsFillingBehaviorWidget-uKNaEzXM.css","assets/configView-DFSU2rNq.js","assets/configApi-qXAS68Ug.js","assets/pushService-DVAfSSV4.js","assets/maestroAuth-lT-ZcZZd.js","assets/importView-DGjcwcW-.js","assets/exportView-anE4K3ZB.js","assets/DocumentPreviewModal-DcNWVqJ-.js","assets/documentBatchService-8kKpeQyq.js","assets/AppModal-Fjeb_yOo.js","assets/alumnosApi-Bzqf1UxF.js","assets/generatedDocumentsView-Cw1oYbIK.js","assets/reportService-UN38zrj6.js","assets/groqService-DqCFHp7y.js","assets/AppToast-Bli1nFQQ.js"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-DlOssbPu.js";import{i as t,n,r,t as i}from"./supabase-KnARm58N.js";import{n as a,t as o}from"./vendor-BUMNmNsE.js";import{i as s}from"./permisosSupabase-BFQ2fEUb.js";import{t as c}from"./AppToast-Bli1nFQQ.js";import{t as l}from"./lifecycleManager-CSbEuGDH.js";import{n as u}from"./groqService-DqCFHp7y.js";import{t as d}from"./preload-helper-lqsI3teB.js";import{t as f}from"./router-DSDN-AHb.js";import{t as p}from"./config-Bj9A07Ke.js";import{a as m,c as h,d as g,f as ee,g as te,h as ne,i as re,m as ie,n as ae,o as oe,p as se,r as ce,s as le,t as ue,u as de}from"./DocumentPreviewModal-DcNWVqJ-.js";import{t as _}from"./AppModal-Fjeb_yOo.js";import{_ as fe,a as pe,c as me,d as he,f as v,g as ge,h as _e,i as ve,l as ye,m as be,n as xe,o as Se,p as Ce,r as we,s as Te,t as Ee,u as De,v as Oe}from"./clasesApi-BkawMRh5.js";import{t as ke}from"./jspdf.es.min-GjK8N93W.js";import{t as Ae}from"./jspdf.plugin.autotable-BLAnV92G.js";import{a as je,c as Me,i as Ne,l as Pe,n as Fe,o as Ie,r as Le,s as Re,t as ze,u as Be}from"./alumnosApi-Bzqf1UxF.js";import{n as Ve,r as He,t as Ue}from"./phoneUtils-BhES4eRi.js";import{t as We}from"./configApi-qXAS68Ug.js";import{S as Ge,_ as Ke,b as qe,c as Je,d as Ye,f as Xe,g as Ze,h as Qe,i as $e,l as et,m as tt,n as nt,o as rt,p as it,r as at,s as ot,t as st,u as ct,v as lt,x as ut,y as dt}from"./observacion.model-BCtZv8mL.js";import{a as ft,c as pt,d as mt,i as ht,l as gt,m as _t,n as vt,o as yt,r as bt,s as xt,t as St,u as Ct}from"./planificacionAdapter-YQ-GJwgP.js";import{t as wt}from"./clases-CdwqU54c.js";import{t as Tt}from"./sesiones-DCxZQJi9.js";import{t as Et}from"./cumplimientoMaestrosWidget-Dthdkq63.js";import{n as Dt,r as Ot,t as kt}from"./InfoTooltip-BOK5LUMZ.js";import{r as At,t as jt}from"./analyticsFillingBehaviorWidget-C9uPYtFf.js";import{t as Mt}from"./sanitize-rcBeFe96.js";import{o as Nt,s as Pt}from"./documentBatchService-8kKpeQyq.js";import{t as Ft}from"./horarioBuilderView-TcvhxPqC.js";import{a as It,i as Lt,u as Rt}from"./tareasApi-fy4qrUAO.js";var zt=`auth-session`;function Bt(e,t=!0){let n={access_token:e.access_token,refresh_token:e.refresh_token,user:e.user,expires_at:e.expires_at,persistent:t};(t?localStorage:sessionStorage).setItem(zt,JSON.stringify(n)),t?sessionStorage.removeItem(zt):localStorage.removeItem(zt)}function Vt(){let e=localStorage.getItem(zt),t=sessionStorage.getItem(zt),n=e||t;if(!n)return null;try{return JSON.parse(n)}catch{return null}}function Ht(){localStorage.removeItem(zt),sessionStorage.removeItem(zt)}function Ut(){let e=Vt();return!e||!e.expires_at?!1:Date.now()/1e3<e.expires_at-10}var Wt=[];async function Gt(e,t,n=!1){let{data:r,error:a}=await i(e,t);return a?(console.error(`🔑 login error:`,a),{user:null,session:null,error:a}):(r.session&&Bt(r.session,n),{user:r.user,session:r.session,error:null})}async function Kt(e,t,n={}){let{data:i,error:a}=await r(e,t,n);return a?{user:null,session:null,error:a}:{user:i.user,session:i.session,error:null}}async function qt(){let{error:e}=await n();return Ht(),Wt.forEach(e=>e(null)),{error:e}}function Jt(){return Ut()}function Yt(){return Vt()?.user||null}var y={user:null,session:null,loading:!0,error:null,listeners:[]};function Xt(){y.listeners.forEach(e=>e(y))}function Zt(e){return y.listeners.push(e),()=>{y.listeners=y.listeners.filter(t=>t!==e)}}async function Qt(e,n,r=!1){if(y.loading=!0,y.error=null,Xt(),e===`demo@soi.com`&&n===`demo123`){let e={id:`demo-user-id`,email:`demo@soi.com`,user_metadata:{full_name:`Usuario Demo`},role:`admin`},t={user:e,access_token:`demo-token`};return localStorage.setItem(`demo_mode`,`true`),p.isDemoMode=!0,Bt(t,r),y.user=e,y.session=t,y.loading=!1,Xt(),{success:!0,user:e,session:t}}try{let i=await Gt(e,n,r),a=i?.error&&(i.error.message||i.error),o=i?.user&&!a;if(y.user=o?i.user:null,y.session=o?i.session:null,y.loading=!1,Xt(),a)return{success:!1,error:typeof a==`string`?a:a.message||`Error desconocido`};if(o){let{data:e}=await t.from(`profiles`).select(`rol, estado`).eq(`id`,i.user.id).maybeSingle();if(e?.estado===`pendiente`)return await t.auth.signOut(),Ht(),y.user=null,y.session=null,Xt(),{success:!0,pendingApproval:!0};if(e?.estado===`rechazado`)return await t.auth.signOut(),Ht(),y.user=null,y.session=null,Xt(),{success:!0,rejected:!0};if(e?.rol!==`admin`)return await t.auth.signOut(),Ht(),y.user=null,y.session=null,Xt(),{success:!1,error:`Esta cuenta no tiene acceso al portal de administración. Usá el portal de maestros.`}}return{success:o,user:y.user,session:y.session}}catch(e){return y.loading=!1,y.error=e.message,Xt(),{success:!1,error:e.message}}}async function $t(e,t,n){y.loading=!0,y.error=null,Xt();try{let r=await Kt(e,t,n);y.user=r.user,y.session=r.session,y.loading=!1,Xt();let i=!r.error&&!!r.user,a=i&&!r.session;return{...r,success:i,needsConfirmation:a,message:a?`Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.`:void 0}}catch(e){return y.loading=!1,y.error=e.message,Xt(),{success:!1,error:e.message}}}function en(){qt(),localStorage.removeItem(`demo_mode`),p.isDemoMode=!1,y.user=null,y.session=null,y.error=null,Xt()}function tn(){return Yt()}function nn(){return y.user?!0:Jt()}async function rn(){let{data:{session:e},error:n}=await t.auth.getSession();return n||!e?(Ht(),y.user=null,y.session=null,y.loading=!1,Xt(),{authenticated:!1}):(Bt(e,Vt()?.persistent??!0),y.session=e,y.user=e.user,y.loading=!1,Xt(),{authenticated:!0,user:y.user})}rn();var an={subscribe:Zt,login:Qt,register:$t,logout:en,getUser:tn,isAuthenticated:nn,notifyListeners:Xt,refreshAuth:rn,getState:()=>({...y})},on={config:{fontSizeBase:`0.8rem`,fontSizeSmall:`0.7rem`,paddingX:`0.5rem`,paddingY:`0.35rem`,gap:`0.35rem`},styles:`
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
      `}},utils:{getInitials(e){if(!e)return`?`;let t=e.trim().split(` `);return t.length>=2?(t[0][0]+t[t.length-1][0]).toUpperCase():e.substring(0,2).toUpperCase()},formatPhone(e){return e||`-`},truncate(e,t=30){return e?e.length<=t?e:e.substring(0,t-3)+`...`:``},formatDateShort(e){return e?new Date(e).toLocaleDateString(`es-VE`,{day:`numeric`,month:`short`}):`-`}}},sn={loading:!1};function cn(e){on.injectStyles(),ln(e),un(e)}function ln(e){e.innerHTML=`
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
  `}function un(e){let t=document.getElementById(`loginForm`),n=document.getElementById(`loginEmail`),r=document.getElementById(`loginPassword`),i=document.getElementById(`togglePassword`),a=document.getElementById(`linkRegister`);t?.addEventListener(`submit`,async t=>{t.preventDefault();let i=n.value.trim(),a=r.value;await dn(i,a,document.getElementById(`rememberMe`)?.checked||!1,e)}),i?.addEventListener(`click`,()=>{let e=r.type===`password`?`text`:`password`;r.type=e,i.innerHTML=e===`password`?`<i class="bi bi-eye"></i>`:`<i class="bi bi-eye-slash"></i>`}),a?.addEventListener(`click`,e=>{e.preventDefault(),f.navigate(`register`)})}async function dn(e,t,n,r){if(!e||!t){pn(`Por favor ingresa email y contraseña`,`error`,r);return}sn.loading=!0,fn(!0);try{let i=await an.login(e,t,n);if(i.success){if(i.pendingApproval){f.navigate(`pending-approval`);return}if(i.rejected){pn(`Tu solicitud fue rechazada. Contactá al administrador.`,`error`,r);return}pn(`¡Bienvenido!`,`success`,r),setTimeout(()=>{let e=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),f.navigate(e||`programas`)},500)}else pn(i.error||`Error al iniciar sesión`,`error`,r)}catch(e){console.error(`Login error:`,e),pn(`Error de conexión`,`error`,r)}finally{sn.loading=!1,fn(!1)}}function fn(e){let t=document.getElementById(`btnLogin`),n=t?.querySelector(`.btn-text`),r=t?.querySelector(`.btn-loading`);t&&(t.disabled=e,e?(n?.classList.add(`d-none`),r?.classList.remove(`d-none`)):(n?.classList.remove(`d-none`),r?.classList.add(`d-none`)))}function pn(e,t,n){let r=document.getElementById(`toastContainer`);if(!r)return;let i=e&&typeof e==`object`?e.message||e.error||JSON.stringify(e):String(e||`Error`),o=`
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
  `,s=document.createElement(`div`);s.innerHTML=o;let c=s.firstElementChild;r.appendChild(c),new a(c,{autohide:!0,delay:3e3}).show(),c.addEventListener(`hidden.bs.toast`,()=>{c.remove()})}var mn={loading:!1},hn=[{test:e=>e.length>=8,message:`Mínimo 8 caracteres`},{test:e=>/[A-Z]/.test(e),message:`Al menos 1 mayúscula`},{test:e=>/[0-9]/.test(e),message:`Al menos 1 número`},{test:e=>/[!@#$%^&*(),.?":{}|<>]/.test(e),message:`Al menos 1 símbolo`}];function gn(e){on.injectStyles(),_n(e),yn(e)}function _n(e){e.innerHTML=`
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
                ${vn(``)}
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
  `}function vn(e){return hn.map((t,n)=>{let r=t.test(e);return`
      <div class="password-requirement ${r?`valid`:`invalid`}" id="req-${n}">
        <i class="bi ${r?`bi-check-circle-fill`:`bi-circle`}"></i>
        <span>${t.message}</span>
      </div>
    `}).join(``)}function yn(e){let t=document.getElementById(`registerForm`);document.getElementById(`registerName`),document.getElementById(`registerEmail`);let n=document.getElementById(`registerPassword`),r=document.getElementById(`registerConfirmPassword`),i=document.getElementById(`togglePassword`),a=document.getElementById(`linkLogin`);n?.addEventListener(`input`,e=>{let t=e.target.value;bn(t),xn()}),r?.addEventListener(`input`,xn),t?.addEventListener(`submit`,async t=>{t.preventDefault(),await Cn(e)}),i?.addEventListener(`click`,()=>{let e=n.type===`password`?`text`:`password`;n.type=e,r.type=e,i.innerHTML=e===`password`?`<i class="bi bi-eye"></i>`:`<i class="bi bi-eye-slash"></i>`}),a?.addEventListener(`click`,e=>{e.preventDefault(),f.navigate(`login`)})}function bn(e){document.getElementById(`passwordRequirements`)&&hn.forEach((t,n)=>{let r=document.getElementById(`req-${n}`);if(r){let n=t.test(e);r.className=`password-requirement ${n?`valid`:`invalid`}`,r.innerHTML=`
        <i class="bi ${n?`bi-check-circle-fill`:`bi-circle`}"></i>
        <span>${t.message}</span>
      `}})}function xn(){let e=document.getElementById(`registerPassword`).value,t=document.getElementById(`registerConfirmPassword`).value,n=document.getElementById(`confirmPasswordError`),r=document.getElementById(`registerConfirmPassword`);return t&&e!==t?(n?.classList.remove(`d-none`),r?.classList.add(`is-invalid`),!1):(n?.classList.add(`d-none`),r?.classList.remove(`is-invalid`),!0)}function Sn(e){return hn.every(t=>t.test(e))}async function Cn(e){let t=document.getElementById(`registerName`).value.trim(),n=document.getElementById(`registerEmail`).value.trim(),r=document.getElementById(`registerPassword`).value,i=document.getElementById(`registerConfirmPassword`).value,a=document.getElementById(`acceptTerms`).checked;if(!t||!n||!r||!i){Tn(`Por favor completa todos los campos`,`error`,e);return}if(!Sn(r)){Tn(`La contraseña no cumple los requisitos`,`error`,e);return}if(r!==i){Tn(`Las contraseñas no coinciden`,`error`,e);return}if(!a){Tn(`Debes aceptar los términos y condiciones`,`error`,e);return}mn.loading=!0,wn(!0);try{let i=await an.register(n,r,{full_name:t,rol:`maestro`});i.success?i.needsConfirmation?(Tn(i.message,`info`,e),setTimeout(()=>{f.navigate(`login`)},2e3)):(Tn(`Solicitud enviada. Esperá la aprobación de un administrador.`,`info`,e),setTimeout(()=>{f.navigate(`pending-approval`)},800)):Tn(typeof i.error==`string`?i.error:i.error?.message||`Error al registrar`,`error`,e)}catch(t){console.error(`Register error:`,t),Tn(`Error de conexión`,`error`,e)}finally{mn.loading=!1,wn(!1)}}function wn(e){let t=document.getElementById(`btnRegister`),n=t?.querySelector(`.btn-text`),r=t?.querySelector(`.btn-loading`);t&&(t.disabled=e,e?(n?.classList.add(`d-none`),r?.classList.remove(`d-none`)):(n?.classList.remove(`d-none`),r?.classList.add(`d-none`)))}function Tn(e,t,n){let r=document.getElementById(`toastContainer`);if(!r)return;let i=`
    <div id="${`toast-`+Date.now()}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${t===`success`?`bg-success`:t===`error`?`bg-danger`:t===`info`?`bg-info`:`bg-warning`} text-white">
        <i class="bi ${t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:t===`info`?`bi-info-circle`:`bi-exclamation-triangle`} me-2"></i>
        <strong class="me-auto">${t===`success`?`Éxito`:t===`error`?`Error`:t===`info`?`Información`:`Advertencia`}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${En(e)}
      </div>
    </div>
  `,o=document.createElement(`div`);o.innerHTML=i;let s=o.firstElementChild;r.appendChild(s),new a(s,{autohide:!0,delay:3e3}).show(),s.addEventListener(`hidden.bs.toast`,()=>{s.remove()})}function En(e){return e==null?``:(typeof e==`string`?e:e?.message??String(e)).replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e])}var Dn={loading:!1,error:null};function On(e){let t=an.getUser();if(!t){e.innerHTML=`
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
  `,kn(e)}async function kn(e){let{renderAusenciaForm:t}=await d(async()=>{let{renderAusenciaForm:e}=await import(`./ausenciaForm-GyH3Snq4.js`);return{renderAusenciaForm:e}},__vite__mapDeps([0,1])),{renderAusenciaHistorial:n}=await d(async()=>{let{renderAusenciaHistorial:e}=await import(`./ausenciaHistorial-4o3X3WJP.js`);return{renderAusenciaHistorial:e}},__vite__mapDeps([2,1]));document.getElementById(`ausenciaModalBody`).innerHTML=t();let r=e.querySelector(`.card-apple:last-child`);if(r){let e=document.createElement(`div`);e.className=`mt-4`,e.innerHTML=`
      <h6 class="fw-bold mb-3">
        <i class="bi bi-clock-history me-2"></i>Historial de Ausencias
      </h6>
      <div id="ausenciaHistorialContainer"></div>
    `,r.appendChild(e),document.getElementById(`ausenciaHistorialContainer`).innerHTML=n()}e.querySelector(`#btnGuardarDatos`)?.addEventListener(`click`,An),e.querySelector(`#perfilPasswordForm`)?.addEventListener(`submit`,jn)}async function An(){let e=document.getElementById(`perfilNombre`).value.trim();if(!e){Mn(`El nombre no puede estar vacío`);return}Dn.loading=!0;let n=document.getElementById(`btnGuardarDatos`);n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;try{let{error:n}=await t.auth.updateUser({data:{full_name:e}});if(n)throw n;Nn(`Datos guardados correctamente`)}catch(e){Mn(e.message)}finally{Dn.loading=!1,n.disabled=!1,n.innerHTML=`<i class="bi bi-check-lg me-1"></i>Guardar cambios`}}async function jn(e){e.preventDefault(),document.getElementById(`passwordActual`).value;let n=document.getElementById(`passwordNueva`).value,r=document.getElementById(`passwordConfirmar`).value;if(document.getElementById(`passwordError`),n.length<8){Pn(`La contraseña debe tener al menos 8 caracteres`);return}if(n!==r){Pn(`Las contraseñas no coinciden`);return}Dn.loading=!0;let i=document.getElementById(`btnCambiarPassword`);i.disabled=!0,i.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Cambiando...`;try{let{error:e}=await t.auth.updateUser({password:n});if(e)throw e;document.getElementById(`perfilPasswordForm`).reset(),Nn(`Contraseña cambiada correctamente`)}catch(e){e.message.includes(`same`)?Pn(`La nueva contraseña debe ser diferente a la actual`):Pn(e.message)}finally{Dn.loading=!1,i.disabled=!1,i.innerHTML=`<i class="bi bi-key-fill me-1"></i>Cambiar contraseña`}}function Mn(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:`danger`}}))}function Nn(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:`success`}}))}function Pn(e){let t=document.getElementById(`passwordError`);t&&(t.textContent=e,t.classList.remove(`d-none`))}function Fn(e){e.innerHTML=`
    <div class="pa-wrapper">
      <div class="pa-card">
        <div class="pa-icon">
          <i class="bi bi-hourglass-split"></i>
        </div>
        <h2 class="pa-title">Tu cuenta está pendiente de aprobación</h2>
        <p class="pa-text">
          Un administrador del sistema debe revisar y aprobar tu solicitud antes de que puedas
          acceder al panel. Te avisaremos por correo cuando esté lista.
        </p>
        <div class="pa-actions">
          <button type="button" class="btn btn-light" id="paBackBtn">
            <i class="bi bi-arrow-left me-2"></i>Volver a la vista pública
          </button>
          <button type="button" class="btn btn-outline-light" id="paLogoutBtn">
            <i class="bi bi-box-arrow-right me-2"></i>Salir
          </button>
        </div>
      </div>
    </div>

    <style>
      .pa-wrapper {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      }
      .pa-card {
        max-width: 480px;
        width: 100%;
        background: rgba(255,255,255,0.08);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 1rem;
        padding: 2.5rem;
        color: #fff;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      }
      .pa-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #fcd34d;
      }
      .pa-title {
        font-size: 1.4rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }
      .pa-text {
        opacity: 0.85;
        line-height: 1.5;
        margin-bottom: 1.75rem;
      }
      .pa-actions {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
    </style>
  `,e.querySelector(`#paBackBtn`)?.addEventListener(`click`,async()=>{await t.auth.signOut().catch(()=>{}),Ht(),window.location.href=`/`}),e.querySelector(`#paLogoutBtn`)?.addEventListener(`click`,async()=>{await t.auth.signOut().catch(()=>{}),Ht(),f.navigate(`login`)})}function In(){f.register(`login`,cn),f.register(`register`,gn),f.register(`perfil`,On),f.register(`pending-approval`,Fn)}In();function b(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}function Ln(e){return e?`success`:`secondary`}function Rn(e){return e?`Activo`:`Inactivo`}function zn(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}var Bn=class{constructor(e={}){this.id=e.id,this.instrumento=e.instrumento,this.nivel=e.nivel,this.nombre=e.nombre,this.tipo=e.tipo,this.estado=e.estado,this.descripcion=e.descripcion,this.ruta_base_id=e.ruta_base_id,this.duracion_semanas=e.duracion_semanas||40,this.creada_por=e.creada_por,this.aprobada_por=e.aprobada_por,this.fecha_aprobacion=e.fecha_aprobacion,this.objetivos=e.objetivos||[],this.created_at=e.created_at,this.updated_at=e.updated_at}validate(){let e=[];return this.instrumento?.trim()||e.push(`Instrumento es requerido`),this.nivel?.trim()||e.push(`Nivel es requerido`),this.nombre?.trim()||e.push(`Nombre es requerido`),this.nombre?.length>200&&e.push(`Nombre máximo 200 caracteres`),[`soi-estandar`,`maestro-variante`].includes(this.tipo)||e.push(`Tipo debe ser soi-estandar o maestro-variante`),[`activa`,`pendiente`,`aprobada`,`rechazada`].includes(this.estado)||e.push(`Estado inválido`),this.tipo===`maestro-variante`&&!this.ruta_base_id&&e.push(`Variante debe referenciar ruta base`),(this.duracion_semanas<1||this.duracion_semanas>52)&&e.push(`Duración debe estar entre 1 y 52 semanas`),(!Array.isArray(this.objetivos)||this.objetivos.length===0)&&e.push(`Debe haber al menos 1 objetivo`),this.objetivos.forEach((t,n)=>{t.descripcion?.trim()||e.push(`Objetivo ${n+1}: descripción requerida`),t.semana_inicio<1&&e.push(`Objetivo ${n+1}: semana_inicio >= 1`),t.semana_fin>this.duracion_semanas&&e.push(`Objetivo ${n+1}: semana_fin <= ${this.duracion_semanas}`),t.semana_fin<t.semana_inicio&&e.push(`Objetivo ${n+1}: semana_fin >= semana_inicio`)}),e}isVariante(){return this.tipo===`maestro-variante`}isActiva(){return this.estado===`activa`}isPendiente(){return this.estado===`pendiente`}toJSON(){return{id:this.id,instrumento:this.instrumento,nivel:this.nivel,nombre:this.nombre,tipo:this.tipo,estado:this.estado,descripcion:this.descripcion,ruta_base_id:this.ruta_base_id,duracion_semanas:this.duracion_semanas,creada_por:this.creada_por,aprobada_por:this.aprobada_por,fecha_aprobacion:this.fecha_aprobacion,objetivos:this.objetivos,created_at:this.created_at,updated_at:this.updated_at}}static getEstados(){return[{value:`activa`,label:`Activa`,color:`bg-success`},{value:`pendiente`,label:`Pendiente de aprobación`,color:`bg-warning`},{value:`aprobada`,label:`Aprobada`,color:`bg-info`},{value:`rechazada`,label:`Rechazada`,color:`bg-danger`}]}};async function Vn(e){let n=new Bn(e).validate();if(n.length>0)throw Error(`Validación fallida: ${n.join(`, `)}`);let{data:r,error:i}=await t.from(`rutas_contenido`).insert({instrumento:e.instrumento,nivel:e.nivel,nombre:e.nombre,tipo:e.tipo,estado:e.estado,descripcion:e.descripcion,ruta_base_id:e.ruta_base_id,duracion_semanas:e.duracion_semanas,creada_por:e.creada_por}).select().single();if(i)throw i;let a=e.objetivos.map((e,t)=>({ruta_id:r.id,descripcion:e.descripcion,semana_inicio:e.semana_inicio,semana_fin:e.semana_fin,orden:e.orden||t+1,objetivo_id:e.objetivo_id||null})),{data:o,error:s}=await t.from(`ruta_contenido_objetivos`).insert(a).select();if(s)throw s;return{...r,objetivos:o}}async function Hn(e){let{data:n,error:r}=await t.from(`rutas_contenido`).select(`*`).eq(`id`,e).single();if(r)throw r;let{data:i,error:a}=await t.from(`ruta_contenido_objetivos`).select(`*`).eq(`ruta_id`,e).order(`orden`,{ascending:!0});if(a)throw a;return{...n,objetivos:i}}async function Un(e={}){let n=t.from(`rutas_contenido`).select(`*`);e.instrumento&&(n=n.eq(`instrumento`,e.instrumento)),e.nivel&&(n=n.eq(`nivel`,e.nivel)),e.estado&&(n=n.eq(`estado`,e.estado)),e.tipo&&(n=n.eq(`tipo`,e.tipo));let{data:r,error:i}=await n.order(`created_at`,{ascending:!1});if(i)throw i;return r||[]}async function Wn(){let{data:e,error:n}=await t.from(`rutas_contenido`).select(`*, rutas_contenido!ruta_base_id(nombre)`).eq(`tipo`,`maestro-variante`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(n)throw n;return e||[]}async function Gn(e,n,r=null){let{data:i}=await t.auth.getUser(),{data:a,error:o}=await t.from(`rutas_contenido`).update({estado:n?`aprobada`:`rechazada`,aprobada_por:i?.user?.id,fecha_aprobacion:new Date().toISOString(),descripcion:n?void 0:r,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(o)throw o;return a}async function Kn(e,n,r,i){let a=await Hn(e),{data:o}=await t.auth.getUser();return await Vn({instrumento:a.instrumento,nivel:a.nivel,nombre:n,tipo:`maestro-variante`,estado:`pendiente`,descripcion:r,ruta_base_id:e,duracion_semanas:a.duracion_semanas,creada_por:o?.user?.id,objetivos:i})}var qn=`
<style id="ruta-selector-style">
.ruta-option { padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
.ruta-option:hover { background: #f8f9fa; border-color: #007bff; }
.ruta-option.selected { background: #e7f1ff; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.25); }
.ruta-info { font-size: 0.85rem; color: #666; margin-top: 4px; }
</style>`;function Jn(e,t,n){let r=document.getElementById(`ruta-selector-modal`);r&&r.remove();let i=document.createElement(`div`);i.id=`ruta-selector-modal`,i.innerHTML=`${qn}
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
    </div>`,document.body.appendChild(i);let a=document.getElementById(`ruta-selector-dialog`),o=new bootstrap.Modal(a);async function s(){let r=document.getElementById(`ruta-selector-body`);try{let i=await Un({instrumento:e,nivel:t,estado:`activa`});if(i.length===0){r.innerHTML=`<p class="text-muted text-center">No hay rutas disponibles para este instrumento/nivel.</p>`;return}let s=null,c=i.find(e=>e.tipo===`soi-estandar`);c&&(s=c.id),r.innerHTML=`
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
      `,document.querySelectorAll(`.ruta-option`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.ruta-option`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),s=e.dataset.rutaId})});let l=a.querySelector(`.btn-close`);l.onclick=()=>{o.hide(),s&&n(s)}}catch(e){r.innerHTML=`<div class="alert alert-danger">${e.message}</div>`,c.error(`Error cargando rutas`)}}a.addEventListener(`shown.bs.modal`,s),o.show()}var Yn={maestros:[],salones:[],programas:[],alumnos:[],onSuccess:null},Xn={nombreMax:100,notasMax:500};async function Zn(e=null,t={}){Yn={...Yn,...t};let n=!!e,r=[],i=[];if(n){c.info(`Cargando datos de la clase...`);let t=await Te(e.id);r=(t||[]).map(e=>e.alumno_id),i=t||[]}let a=n?`Editar Clase: ${e.nombre}`:`Nueva Clase`,o=n?`Guardar Cambios`:`Crear Clase`;_.open({title:a,saveText:o,size:`lg`,body:Qn(e,r,i),onShow:t=>{er(t,e)},onSave:async t=>await tr(t,e)})}function Qn(e,t,n=[]){return`
    <form class="row g-3" id="formClase">
      <div class="col-md-6">
        <label class="form-label-compact">Nombre de la Clase *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required placeholder="Ej: Violín Básico A" value="${v(e?.nombre||``)}" maxlength="${Xn.nombreMax}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" list="instrumentos-list" required placeholder="Seleccionar..." value="${v(e?.instrumento||``)}">
        ${or()}
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
          ${ir(e?.programa_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Maestro Titular *</label>
        <select class="form-select input-dense" id="modal-maestro_id" required>
          ${nr(e?.maestro_principal_id)}
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
          ${nr(e?.maestro_suplente_id)}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Máx. Alumnos</label>
        <input type="number" class="form-control input-dense" id="modal-max_alumnos" value="${e?.capacidad_maxima||20}" min="1" max="50">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Estado</label>
        <select class="form-select input-dense" id="modal-estado">
          ${ar(e?.estado||`activa`)}
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
          ${cr(e?.horarios||[])}
        </div>
      </div>

      <div class="col-12">
        <label class="form-label-compact">Notas Pedagógicas</label>
        <textarea class="form-control input-dense" id="modal-notas_pedagogicas" rows="2" placeholder="Observaciones sobre el grupo o metodología..." maxlength="${Xn.notasMax}">${v(e?.descripcion||``)}</textarea>
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-grupal" style="display:${e?.tipo_clase===`rotativa`?`none`:`block`}">
        <label class="form-label-compact mb-2"><i class="bi bi-people me-1"></i>Inscribir Alumnos</label>
        ${lr(t)}
      </div>

      <div class="col-12 mt-3 border-top pt-3" id="seccion-alumnos-rotativa" style="display:${e?.tipo_clase===`rotativa`?`block`:`none`}">
        <label class="form-label-compact mb-2"><i class="bi bi-person-lines-fill me-1"></i>Turnos individuales</label>
        ${$n(n)}
      </div>
    </form>
  `}function $n(e=[]){let t=Yn.alumnos||[],n=(e=``,n=``,r=``)=>(t.find(t=>t.id===e),`
      <div class="slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary">
        <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
          <option value="">Seleccionar alumno…</option>
          ${t.map(t=>`
            <option value="${t.id}" ${t.id===e?`selected`:``}>
              ${v(t.nombre_completo)}${t.instrumento_principal?` — ${v(t.instrumento_principal)}`:``}
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
    </div>`}function er(e,t){let n=e.querySelector(`#btn-seleccionar-ruta`);n&&n.addEventListener(`click`,async t=>{t.preventDefault();let n=e.querySelector(`#modal-instrumento`)?.value?.trim();if(!n){c.warning(`Selecciona un instrumento primero`);return}Jn(n,`Cualquier Nivel`,t=>{e.querySelector(`#modal-ruta_id`).value=t,e.querySelector(`#modal-ruta-display`).value=`Ruta seleccionada ✓`,c.success(`Ruta asignada a la clase`)})});let r=e.querySelector(`#modal-tiene_suplente`),i=e.querySelector(`#modal-maestro_suplente_id`);r&&i&&r.addEventListener(`change`,e=>{i.style.display=e.target.checked?`block`:`none`,e.target.checked||(i.value=``)}),e.querySelector(`#btn-add-horario`).addEventListener(`click`,()=>{let t=e.querySelector(`#modal-horarios-container`),n=t.children.length,r=document.createElement(`div`);r.innerHTML=sr(null,n),t.appendChild(r.firstElementChild)}),e.querySelector(`#modal-horarios-container`).addEventListener(`click`,t=>{let n=t.target.closest(`.btn-remove-horario`);n&&(e.querySelector(`#modal-horarios-container`).children.length>1?n.closest(`.horario-row`).remove():c.warning(`La clase debe tener al menos un horario`))});let a=e.querySelector(`#seccion-alumnos-grupal`),o=e.querySelector(`#seccion-alumnos-rotativa`);e.querySelectorAll(`input[name="modal-tipo_clase"]`).forEach(t=>{t.addEventListener(`change`,()=>{let t=e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value===`rotativa`;a.style.display=t?`none`:`block`,o.style.display=t?`block`:`none`})});let s=e.querySelector(`#slots-container`),l=e.querySelector(`#slots-count`),u=()=>{let e=s.querySelectorAll(`.slot-row`).length;l.textContent=`${e} turno${e===1?``:`s`} asignado${e===1?``:`s`}`};e.querySelector(`#btn-add-slot`)?.addEventListener(`click`,()=>{let e=Yn.alumnos||[],t=document.createElement(`div`);t.innerHTML=($n([]).split(`id="slots-container"`)[1],``);let n=document.createElement(`div`);n.className=`slot-row d-flex align-items-center gap-2 mb-2 p-2 rounded border bg-body-tertiary`,n.innerHTML=`
      <select class="form-select form-select-sm slot-alumno-select flex-grow-1" style="min-width:0;" required>
        <option value="">Seleccionar alumno…</option>
        ${e.map(e=>`<option value="${e.id}">${v(e.nombre_completo)}${e.instrumento_principal?` — ${v(e.instrumento_principal)}`:``}</option>`).join(``)}
      </select>
      <div class="d-flex align-items-center gap-1 flex-shrink-0">
        <input type="time" class="form-control form-control-sm slot-hora-inicio" style="width:110px;" required title="Hora inicio">
        <span class="text-muted small">–</span>
        <input type="time" class="form-control form-control-sm slot-hora-fin" style="width:110px;" required title="Hora fin">
      </div>
      <button type="button" class="btn btn-sm btn-link text-danger p-0 btn-remove-slot" title="Quitar turno">
        <i class="bi bi-x-circle-fill fs-5"></i>
      </button>`,s.appendChild(n),u()}),s?.addEventListener(`click`,e=>{if(e.target.closest(`.btn-remove-slot`)){if(s.querySelectorAll(`.slot-row`).length<=1){c.warning(`Debe haber al menos un turno en una clase rotativa`);return}e.target.closest(`.slot-row`).remove(),u()}});let d=e.querySelector(`#search-modal-alumnos`),f=e.querySelectorAll(`.alumno-check-item`);d?.addEventListener(`input`,e=>{let t=g(e.target.value);f.forEach(e=>{let n=e.dataset.nombre||``,r=e.dataset.instrumento||``,i=n.includes(t)||r.includes(t);e.style.display=i?``:`none`})});let p=e.querySelectorAll(`.alumnos-list input[type="checkbox"]`),m=e.querySelector(`#alumnos-selection-count`),h=()=>{let e=Array.from(p).filter(e=>e.checked).length;m&&(m.textContent=`${e} alumnos seleccionados`)};p.forEach(e=>e.addEventListener(`change`,h)),h()}async function tr(e,t){let n=!!t,r=(()=>{let t=e.querySelector(`#modal-maestro_suplente_id`).value,n=e.querySelector(`#modal-tiene_suplente`).checked;return{nombre:e.querySelector(`#modal-nombre`).value.trim(),programa_id:e.querySelector(`#modal-programa_id`).value,maestro_principal_id:e.querySelector(`#modal-maestro_id`).value,maestro_suplente_id:n?t:null,tiene_suplente:n,instrumento:e.querySelector(`#modal-instrumento`).value.trim(),capacidad_maxima:parseInt(e.querySelector(`#modal-max_alumnos`).value)||20,estado:e.querySelector(`#modal-estado`).value,tipo_clase:e.querySelector(`input[name="modal-tipo_clase"]:checked`)?.value||`grupal`,descripcion:e.querySelector(`#modal-notas_pedagogicas`).value.trim(),ruta_id:e.querySelector(`#modal-ruta_id`)?.value||null,horarios:Array.from(e.querySelectorAll(`.horario-row`)).map(e=>({dia:e.querySelector(`[name="horario-dia"]`).value,hora_inicio:e.querySelector(`[name="horario-hora_inicio"]`).value,hora_fin:e.querySelector(`[name="horario-hora_fin"]`).value,salon_id:e.querySelector(`[name="horario-salon_id"]`).value||null}))}})(),i=new he(r).validate();if(i.length>0)return c.error(i[0]),!1;let a=()=>Array.from(e.querySelectorAll(`#slots-container .slot-row`)).map(e=>({alumno_id:e.querySelector(`.slot-alumno-select`).value,hora_inicio:e.querySelector(`.slot-hora-inicio`).value,hora_fin:e.querySelector(`.slot-hora-fin`).value})).filter(e=>e.alumno_id),o=async t=>{let n=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value),r=(await Te(t)).map(e=>e.alumno_id),i=n.filter(e=>!r.includes(e)),a=r.filter(e=>!n.includes(e));await Promise.all([...i.map(e=>Se(t,e)),...a.map(e=>ve(t,e))])},s=async e=>{let t=a();if(t.length===0)return c.warning(`Agregá al menos un turno`),!1;if(t.find(e=>!e.hora_inicio||!e.hora_fin))return c.error(`Todos los turnos deben tener hora de inicio y fin`),!1;let n=(await Te(e)).map(e=>e.alumno_id),r=t.map(e=>e.alumno_id),i=n.filter(e=>!r.includes(e));return await Promise.all(i.map(t=>ve(e,t))),await Promise.all(t.map(t=>n.includes(t.alumno_id)?xe(e,t.alumno_id,t.hora_inicio,t.hora_fin):Se(e,t.alumno_id,t.hora_inicio,t.hora_fin))),!0};try{let i;if(n)if(i=await Ee(t.id,r),r.tipo_clase===`rotativa`){if(!await s(i.id))return!1}else await o(i.id);else if(i=await we(r),r.tipo_clase===`rotativa`){if(!await s(i.id))return!1}else{let t=Array.from(e.querySelectorAll(`.alumnos-list input[type="checkbox"]:checked`)).map(e=>e.value);t.length>0&&await Promise.all(t.map(e=>Se(i.id,e)))}return c.success(n?`Clase actualizada`:`Clase creada`),Yn.onSuccess&&Yn.onSuccess(),!0}catch(e){return e.isConflict?c.warning(`Conflicto detected: ${e.message}`):c.error(e.message),!1}}function nr(e=``){return`<option value="">Seleccionar maestro...</option>`+Yn.maestros.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${v(t.nombre_completo||t.nombre)}</option>`).join(``)}function rr(e=``){return`<option value="">Sin salón (Online/Otro)</option>`+Yn.salones.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${v(t.nombre)}</option>`).join(``)}function ir(e=``){return`<option value="">Seleccionar programa...</option>`+Yn.programas.map(t=>`<option value="${t.id}" ${t.id===e?`selected`:``}>${v(t.nombre)}</option>`).join(``)}function ar(e=`activa`){return he.getEstados().map(t=>`<option value="${t}" ${t===e?`selected`:``}>${he.getEstadoLabel(t)}</option>`).join(``)}function or(){return`<datalist id="instrumentos-list">${[`Violín`,`Viola`,`Cello`,`Piano`,`Flauta`,`Teoría`,`Coro`].map(e=>`<option value="${e}">`).join(``)}</datalist>`}function sr(e,t){return`
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
            ${rr(e?.salon_id)}
          </select>
        </div>
      </div>
    </div>
  `}function cr(e=[]){return e.length===0?sr(null,0):e.map((e,t)=>sr(e,t)).join(``)}function lr(e=[]){return`
    <div class="alumnos-selector-container">
      <div class="input-group input-group-sm mb-2">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control" id="search-modal-alumnos" placeholder="Filtrar por nombre o instrumento...">
      </div>
      <div class="alumnos-list border rounded bg-body-tertiary" style="max-height: 200px; overflow-y: auto; padding: 8px;">
        ${(Yn.alumnos||[]).map(t=>`
          <div class="form-check alumno-check-item" data-nombre="${g(t.nombre_completo)}" data-instrumento="${g(t.instrumento_principal)}">
            <input class="form-check-input" type="checkbox" value="${t.id}" id="chk-a-${t.id}" ${e.includes(t.id)?`checked`:``}>
            <label class="form-check-label small w-100 cursor-pointer" for="chk-a-${t.id}">
              ${v(t.nombre_completo)} <span class="text-muted">(${v(t.instrumento_principal||`N/A`)})</span>
            </label>
          </div>
        `).join(``)}
      </div>
      <div class="text-end mt-1"><small class="text-muted" id="alumnos-selection-count">0 seleccionados</small></div>
    </div>
  `}var ur=`app-help-panel`,dr=`app-help-overlay`,fr=!1;function pr(){if(fr)return;fr=!0;let e=document.createElement(`style`);e.id=`app-help-panel-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function mr(){if(document.getElementById(ur))return;pr();let e=document.createElement(`div`);e.id=dr,document.body.appendChild(e);let t=document.createElement(`div`);t.id=ur,t.setAttribute(`role`,`complementary`),t.setAttribute(`aria-label`,`Ayuda`),t.innerHTML=`
    <div id="ahp-header">
      <div id="ahp-badge"><i class="bi bi-question"></i></div>
      <span id="ahp-title">Ayuda</span>
      <button id="ahp-close" aria-label="Cerrar">
        <i class="bi bi-x" style="font-size:1.1rem;"></i>
      </button>
    </div>
    <div id="ahp-body"></div>
  `,document.body.appendChild(t),e.addEventListener(`click`,()=>hr.close()),t.querySelector(`#ahp-close`).addEventListener(`click`,()=>hr.close()),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&hr.close()})}var hr={open({title:e,intro:t,sections:n=[]}){mr();let r=document.getElementById(ur),i=document.getElementById(dr);document.getElementById(`ahp-title`).textContent=e||`Ayuda`,document.getElementById(`ahp-body`).innerHTML=`
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
    `,i.style.display=`block`,requestAnimationFrame(()=>{i.classList.add(`hp-visible`),r.classList.add(`hp-visible`)})},close(){let e=document.getElementById(ur),t=document.getElementById(dr);!e||!e.classList.contains(`hp-visible`)||(e.classList.remove(`hp-visible`),t.classList.remove(`hp-visible`),setTimeout(()=>{t&&(t.style.display=`none`)},280))}},gr=[0,86,179],_r=[255,193,7],vr=[30,30,30],yr=`—`;function x(e,t=yr){return(e==null?``:String(e).trim())||t}function br(e){let t=x(e,``).toLowerCase();return t?t.charAt(0).toUpperCase()+t.slice(1):yr}function xr(e){return e?e.slice(0,5):yr}function Sr(e){if(!e)return yr;try{let[t,n,r]=String(e).slice(0,10).split(`-`).map(Number);return(t&&n&&r?new Date(t,n-1,r):new Date(e)).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`short`,year:`numeric`}).replace(` de `,` `)}catch{return yr}}function Cr(e,t,n){let r=e.internal.pageSize.getWidth();e.setFillColor(...gr),e.rect(0,0,r,26,`F`),e.setFillColor(..._r),e.rect(0,26,r,2,`F`),e.setTextColor(255,255,255),e.setFont(`helvetica`,`bold`),e.setFontSize(14),e.text(`El Sistema Punta Cana`,14,10),e.setFont(`helvetica`,`normal`),e.setFontSize(10),e.text(t,14,18),e.setFontSize(7.5),e.text(n,14,24),e.setTextColor(...vr)}function wr(e,t,n){let r=e.internal.pageSize.getWidth(),i=e.internal.pageSize.getHeight();e.setFillColor(...gr),e.rect(0,i-8,r,8,`F`),e.setTextColor(255,255,255),e.setFontSize(6.5);let a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});e.text(`El Sistema Punta Cana — Generado: ${a}`,10,i-3),e.text(`Página ${t} de ${n}`,r-10,i-3,{align:`right`})}function Tr(e,t=[],n={},r={}){let i=new ke({orientation:`portrait`,unit:`mm`,format:`letter`}),a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});Cr(i,`REPORTE ACADÉMICO DE DOCENTE`,`Docente: ${x(e.nombre)} · Generado: ${a}`);let o=e.is_active?`Activo`:`Inactivo`;Ae(i,{startY:32,margin:{left:14,right:14},theme:`grid`,body:[[`Docente`,x(e.nombre),`Estado`,o],[`Email`,x(e.email),`Teléfono`,x(e.telefono)],[`Instrumento Principal`,x(e.instrumento),`Especialidades`,(e.especialidades||[]).join(`, `)||yr],[`Biografía / Reseña`,x(e.bio),`Total Clases Asignadas`,String(t.length)]],styles:{fontSize:8.5,cellPadding:2,valign:`top`},columnStyles:{0:{cellWidth:35,fontStyle:`bold`,fillColor:[240,245,255]},1:{cellWidth:60},2:{cellWidth:35,fontStyle:`bold`,fillColor:[240,245,255]},3:{cellWidth:58}}}),i.setFont(`helvetica`,`bold`),i.setFontSize(10),i.text(`RESUMEN DE HORARIOS Y CLASES`,14,i.lastAutoTable.finalY+8);let s=r.salones||[],c=e=>s.find(t=>t.id===e)?.nombre||`Sin salón`,l=t.map((e,t)=>{let n=(e.horarios||[]).map(e=>`${br(e.dia)} ${xr(e.hora_inicio)} - ${xr(e.hora_fin)} (${c(e.salon_id)})`).join(`
`)||yr;return[t+1,x(e.nombre),x(e.instrumento),n,e.total_alumnos||0,e.es_suplente?`Suplente`:`Titular`]});Ae(i,{startY:i.lastAutoTable.finalY+12,margin:{left:14,right:14},theme:`striped`,head:[[`#`,`Nombre de Clase`,`Instrumento`,`Horarios y Salones`,`Alumnos`,`Rol`]],body:l.length?l:[[`—`,`Sin clases asignadas`,`—`,`—`,`—`,`—`]],headStyles:{fillColor:gr,textColor:255,fontStyle:`bold`,fontSize:8.5},bodyStyles:{fontSize:8,cellPadding:2,valign:`middle`},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:10,halign:`center`},1:{cellWidth:45},2:{cellWidth:30},3:{cellWidth:65},4:{cellWidth:20,halign:`center`},5:{cellWidth:18,halign:`center`}}}),t.forEach(t=>{i.addPage(),Cr(i,`LISTADO DE ALUMNOS — CLASE: ${t.nombre.toUpperCase()}`,`Docente: ${x(e.nombre)} · Instrumento: ${x(t.instrumento)}`);let r=(t.horarios||[]).map(e=>`${br(e.dia)} ${xr(e.hora_inicio)} - ${xr(e.hora_fin)} en ${c(e.salon_id)}`).join(`, `)||`Sin horario`;i.setFont(`helvetica`,`normal`),i.setFontSize(8.5),i.text(`Horarios: ${r}`,14,32),i.text(`Rol docente: ${t.es_suplente?`Suplente`:`Titular`}`,14,36);let a=(n[t.id]||[]).map((e,t)=>{let n=e.alumno||e||{};return[t+1,x(n.nombre_completo||n.nombre,`Sin nombre`),x(n.cedula||n.documento_identidad),x(n.instrumento_principal||n.instrumento),x(n.familiar_telefono||n.telefono||n.representante_tlf),Sr(e.fecha_inscripcion||e.created_at)]});Ae(i,{startY:40,margin:{left:14,right:14},theme:`striped`,head:[[`#`,`Alumno`,`Cédula / Documento`,`Instrumento`,`Teléfono Contacto`,`Fecha Inscripción`]],body:a.length?a:[[`—`,`No hay alumnos inscritos en esta clase`,`—`,`—`,`—`,`—`]],headStyles:{fillColor:gr,textColor:255,fontStyle:`bold`,fontSize:8.5},bodyStyles:{fontSize:8,cellPadding:2},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:10,halign:`center`},1:{cellWidth:55},2:{cellWidth:35},3:{cellWidth:30},4:{cellWidth:35},5:{cellWidth:23,halign:`center`}}})});let u=i.internal.getNumberOfPages();for(let e=1;e<=u;e++)i.setPage(e),wr(i,e,u);return i}function Er(e,t=[],n={},r={}){let i=Tr(e,t,n,r),a=x(e.nombre,`docente`).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``).slice(0,30)||`reporte`,o=new Date().toISOString().slice(0,10);i.save(`reporte-clases-maestro-${a}-${o}.pdf`)}var S={maestros:[],maestrosOriginales:[],editando:null,deletingId:null},Dr={nombreMax:100},Or=null,kr=[`Piano`,`Guitarra`,`Violín`,`Viola`,`Cello`,`Contrabajo`,`Flauta`,`Clarinete`,`Oboe`,`Fagot`,`Saxofón`,`Trompeta`,`Trombón`,`Corno`,`Tuba`,`Percusión`,`Batería`,`Canto`,`Teoría`,`Solfeo`,`Dirección`,`Composición`,`Arreglos`];async function Ar(e){try{jr(e);let t=await ne();S.maestros=t,S.maestrosOriginales=[...t],Ir(e),Rr(e)}catch(t){console.error(t),Mr(e,t.message)}}function jr(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando maestros...</p>
      </div>
    </div>
  `}function Mr(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${b(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>Ar(e))}function Nr(e=[],t=`modal-especialidades-input`){return`
    <div class="mb-3">
      <label class="form-label-compact">Especialidades</label>
      <div class="especialidades-chips-container" id="modal-especialidades-container">
        <div class="chips-wrapper d-flex flex-wrap gap-1 mb-2">
          ${e.map(e=>`
            <span class="badge bg-primary-subtle text-primary rounded-pill chip-item">
              ${b(e)}
              <i class="bi bi-x-lg chip-remove" data-especialidad="${b(e)}" style="cursor:pointer;margin-left:4px;"></i>
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
            ${kr.slice(0,8).map(e=>`
              <button type="button" class="btn btn-link btn-sm p-0 suggest-chip" data-especialidad="${b(e)}">${b(e)}</button>
            `).join(`, `)}
          </div>
        </div>
      </div>
    </div>
  `}function Pr(e){let t=e.querySelector(`.especialidades-chips-container`);if(!t)return[];let n=t.querySelectorAll(`.chip-item`);return Array.from(n).map(e=>e.textContent.replace(/×$/,``).trim())}function Fr(e,t){let n=e.querySelector(`#modal-especialidades-input`),r=e.querySelector(`#btnAddEspecialidad`),i=e.querySelector(`.especialidades-chips-container`),a=r=>{let a=r.trim();if(a){if(!Pr(e).includes(a)){let e=i.querySelector(`.chips-wrapper`),n=document.createElement(`span`);n.className=`badge bg-primary-subtle text-primary rounded-pill chip-item`,n.innerHTML=`${b(a)}<i class="bi bi-x-lg chip-remove" data-especialidad="${b(a)}" style="cursor:pointer;margin-left:4px;"></i>`,e.appendChild(n),t&&t()}n.value=``}};n?.addEventListener(`keypress`,e=>{e.key===`Enter`&&(e.preventDefault(),a(n.value))}),r?.addEventListener(`click`,()=>a(n.value)),i?.addEventListener(`click`,e=>{e.target.classList.contains(`chip-remove`)&&(e.target.closest(`.chip-item`).remove(),t&&t()),e.target.classList.contains(`suggest-chip`)&&(e.preventDefault(),a(e.target.dataset.especialidad))})}function Ir(e){e.innerHTML=`
    <div class="page-container">
      <div class="maestros-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-person-check fs-4"></i>
          </div>
          <div>
            <h1 class="maestros-title-premium mb-0">Maestros</h1>
            <p class="text-muted small mb-0">${S.maestros.length} maestros en total</p>
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
          ${Lr(S.maestros)}
        </div>
      </div>

    </div>
  `}function Lr(e){return e.length?e.map(e=>{let t=e.nombre||e.name||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${zn(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${b(t)}</span>
            <small class="text-muted text-truncate">
              ${b(e.instrumento||`Sin instrumento especificado`)}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 flex-shrink-0">
          <button class="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center btn-maestro-pdf" data-action="pdf" data-id="${e.id}" title="Descargar Reporte PDF de Clases y Alumnos" style="width: 32px; height: 32px; padding: 0;">
            <i class="bi bi-file-earmark-pdf"></i>
          </button>
          ${e.telefono?`
            <button class="btn btn-sm btn-success bg-gradient text-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" data-action="whatsapp" data-id="${e.id}" title="Enviar WhatsApp" style="min-height: 32px;" ${n?``:`disabled`}>
              <i class="bi bi-whatsapp"></i> <span class="d-none d-sm-inline fw-medium">${b(e.telefono)}</span>
            </button>
          `:`<span class="badge bg-light text-muted border d-none d-sm-inline-block">Sin número</span>`}
          <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):`
      <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
        <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
        No hay maestros registrados.
      </div>`}function Rr(e){Or=e,e.querySelector(`#btnAgregarMaestro`).addEventListener(`click`,()=>Hr()),e.querySelector(`#btn-help-maestros`)?.addEventListener(`click`,()=>{hr.open({title:`Maestros`,intro:`Gestión del plantel docente. Desde acá podés ver, agregar, editar y desactivar maestros, y acceder al perfil completo de cada uno.`,sections:[{icon:`bi-search`,title:`Buscador y filtros`,description:`Filtrá por nombre, instrumento o estado (activo/inactivo) en tiempo real.`,color:`#6b7280`},{icon:`bi-person-badge`,title:`Tarjeta de maestro`,description:`Nombre, instrumento principal, clases activas y estado. Badge verde = activo, gris = inactivo.`,color:`#3b82f6`},{icon:`bi-eye`,title:`Ver perfil`,description:`Perfil completo: datos personales, clases (titular y suplente), horarios y ocupación.`,color:`#10b981`},{icon:`bi-pencil`,title:`Editar desde el perfil`,description:`Desde el perfil podés editar cualquier clase que dicte directamente, sin salir del modal.`,color:`#f59e0b`},{icon:`bi-person-x`,title:`Desactivar maestro`,description:`Desactivar oculta al maestro de listas operativas pero conserva su historial. No elimina datos.`,color:`#ef4444`}]})}),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>Jr()),e.querySelector(`#buscar`).addEventListener(`input`,()=>Vr()),e.querySelector(`#filtroEstado`).addEventListener(`change`,()=>Vr()),e.querySelector(`#maestrosTBody`).addEventListener(`click`,e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){Wr(t.dataset.id);return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id,i=n.dataset.action;if(i===`edit`)Ur(r);else if(i===`delete`)Gr(r);else if(i===`whatsapp`)Br(r);else if(i===`pdf`){let e=S.maestrosOriginales.find(e=>e.id===r);if(!e)return;zr(e,n)}})}async function zr(e,n){n&&(n.disabled=!0,n.style.opacity=`0.5`);try{let n=await De(e.id),r=n.map(e=>e.id),i={};r.length>0&&(i=await me(r));let{data:a}=await t.from(`salones`).select(`*`);Er(e,n,i,{salones:a}),C(`Reporte PDF descargado exitosamente`,`success`)}catch(e){console.error(`Error al generar PDF:`,e),C(`Error al generar PDF: `+e.message,`error`)}finally{n&&(n.disabled=!1,n.style.opacity=`1`)}}function Br(e){let t=S.maestrosOriginales.find(t=>t.id===e);if(!t||!t.telefono)return;let n=t.telefono.replace(/\D/g,``);_.open({title:`Enviar WhatsApp a `+b(t.nombre||t.name||``),size:`md`,saveText:`Enviar WhatsApp`,body:`
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
    `,onSave:async e=>{let t=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=`https://wa.me/${n}?text=${encodeURIComponent(t)}`;window.open(r,`_blank`)}})}function Vr(){let e=Or.querySelector(`#buscar`).value.trim().toLowerCase(),t=Or.querySelector(`#filtroEstado`).value;S.maestros=S.maestrosOriginales.filter(n=>{let r=(n.nombre||n.name||``).toLowerCase(),i=!e||r.includes(e)||(n.email||``).toLowerCase().includes(e)||(n.instrumento||``).toLowerCase().includes(e)||(n.especialidad||``).toLowerCase().includes(e)||(n.especialidades||[]).some(t=>t.toLowerCase().includes(e)),a=n.is_active??!0;return i&&(t===`todos`||t===`activo`&&a||t===`inactivo`&&!a)}),Kr()}function Hr(){S.editando=null,_.open({title:`Crear Nuevo Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${Dr.nombreMax}" placeholder="Juan Pérez">
        <small class="text-muted" id="modal-nombreCount">0/${Dr.nombreMax}</small>
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
      ${Nr([],`modal-especialidades-input`)}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2" placeholder="Breve descripción..."></textarea>
      </div>
    </form>`,onShow:e=>Fr(e),saveText:`Guardar`,onSave:async e=>{let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-password`)?.value,a=e.querySelector(`#modal-telefono`).value.trim(),o=e.querySelector(`#modal-instrumento`).value.trim(),s=e.querySelector(`#modal-bio`).value.trim();if(!n)return C(`El nombre es obligatorio`,`error`),!1;if(!r)return C(`El email es obligatorio`,`error`),!1;if(!qr(r))return C(`El formato del email no es válido`,`error`),!1;if(!i||i.length<6)return C(`La contraseña debe tener al menos 6 caracteres`,`error`),!1;if(!o)return C(`El instrumento es obligatorio`,`error`),!1;if(r&&await te(r))return C(`El email ya está registrado`,`error`),!1;let c=Pr(e);try{let{data:e,error:l}=await t.auth.signUp({email:r,password:i,options:{data:{full_name:n,rol:`maestro`}}});if(l)return C(l.message||`Error al crear usuario`,`error`),!1;if(!e?.user)return C(`No se pudo crear el usuario`,`error`),!1;let u=e.user.id;await t.from(`profiles`).update({estado:`activo`}).eq(`id`,u),await t.from(`maestros`).update({tlf:a||null,especialidad:o||null,resena:s||null,especialidades:c}).eq(`user_id`,u);let d=await ne();S.maestros=d,S.maestrosOriginales=[...d],Vr(),C(`Maestro creado exitosamente. Ya puede iniciar sesión.`,`success`)}catch(e){console.error(`Error creando maestro:`,e),C(`Error al crear el maestro: `+e.message,`error`)}}})}function Ur(e){let t=S.maestrosOriginales.find(t=>t.id===e);if(!t){C(`Maestro no encontrado`,`error`);return}S.editando=e,_.open({title:`Editar Maestro`,body:`<form class="row g-2" novalidate>
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required maxlength="${Dr.nombreMax}" value="${b(t.nombre||t.name||``)}">
        <small class="text-muted" id="modal-nombreCount">${(t.nombre||t.name||``).length}/${Dr.nombreMax}</small>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email *</label>
        <input type="email" class="form-control input-dense" id="modal-email" required value="${b(t.email||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono</label>
        <input type="text" class="form-control input-dense" id="modal-telefono" value="${b(t.telefono||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required value="${b(t.instrumento||``)}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Especialidad</label>
        <input type="text" class="form-control input-dense" id="modal-especialidad" value="${b(t.especialidad||``)}">
      </div>
      ${Nr(t.especialidades||[],`modal-especialidades-input`)}
      <div class="col-12">
        <label class="form-label-compact">Biografía</label>
        <textarea class="form-control input-dense" id="modal-bio" rows="2">${b(t.bio||``)}</textarea>
      </div>
      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${t.is_active===!1?``:`checked`}>
          <label class="form-check-label" for="modal-esActivo">Maestro activo</label>
        </div>
      </div>
    </form>`,onShow:e=>Fr(e),saveText:`Guardar cambios`,onSave:async e=>{let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-telefono`).value.trim(),a=e.querySelector(`#modal-instrumento`).value.trim(),o=e.querySelector(`#modal-especialidad`).value.trim(),s=e.querySelector(`#modal-bio`).value.trim(),c=e.querySelector(`#modal-esActivo`).checked;if(!n)return C(`El nombre es obligatorio`,`error`),!1;if(!r)return C(`El email es obligatorio`,`error`),!1;if(!qr(r))return C(`El formato del email no es válido`,`error`),!1;if(r&&t.email!==r&&await te(r))return C(`El email ya está registrado`,`error`),!1;let l=Pr(e),u={nombre:n,email:r||null,telefono:i||null,instrumento:a||null,especialidad:o||null,bio:s||null,is_active:c,especialidades:l};await se(S.editando,u);let d=S.maestrosOriginales.findIndex(e=>e.id===S.editando);d!==-1&&(S.maestrosOriginales[d]={...S.maestrosOriginales[d],...u}),Vr(),C(`Maestro actualizado correctamente`,`success`)}})}function Wr(e){let n=S.maestrosOriginales.find(t=>t.id===e);if(!n){C(`Maestro no encontrado`,`error`);return}let r=n.nombre||n.name||`-`,i=n.is_active??!0;_.open({title:r,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${b(r)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <p class="form-control-plaintext">${n.email?`<a href="mailto:${b(n.email)}">${b(n.email)}</a>`:`-`}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Teléfono</label>
            <p class="form-control-plaintext">${b(n.telefono||`-`)}</p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Instrumento</label>
            <p class="form-control-plaintext">${b(n.instrumento||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidad</label>
            <p class="form-control-plaintext">${b(n.especialidad||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Especialidades</label>
            <p class="form-control-plaintext">
              ${(n.especialidades||[]).length?n.especialidades.map(e=>`<span class="badge bg-primary-subtle text-primary me-1">${b(e)}</span>`).join(``):`Sin especialidades`}
            </p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Estado</label>
            <p class="form-control-plaintext">
              <span class="badge ${Ln(i)}">${Rn(i)}</span>
            </p>
          </div>
        </div>
      </div>
      <hr>
      <div class="mb-4">
        <label class="form-label fw-bold">Biografía</label>
        <p class="form-control-plaintext">${b(n.bio||`Sin biografía`)}</p>
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
        <button class="btn btn-outline-danger me-auto d-flex align-items-center gap-1" id="modal-view-btn-pdf">
          <i class="bi bi-file-earmark-pdf"></i> Descargar Reporte PDF
        </button>
        <button class="btn btn-outline-danger" id="modal-view-btn-delete">
          <i class="bi bi-trash me-1"></i> Eliminar
        </button>
        <button class="btn btn-primary" id="modal-view-btn-edit">
          <i class="bi bi-pencil me-1"></i> Editar Perfil
        </button>
      </div>
    `,onShow:async r=>{r.querySelector(`#modal-view-btn-pdf`)?.addEventListener(`click`,e=>{zr(n,e.currentTarget)}),r.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{_.close(),setTimeout(()=>Ur(e),300)}),r.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{_.close(),setTimeout(()=>Gr(e),300)});let i=r.querySelector(`#maestro-clases-container`),a=r.querySelector(`#maestro-clases-badge`);(async()=>{try{let[n,r,o,s,c]=await Promise.all([De(e),t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]),l={maestros:r.data||[],salones:o.data||[],programas:s.data||[],alumnos:c.data||[]};if(a.textContent=`${n.length} clase${n.length===1?``:`s`}`,n.length===0){i.innerHTML=`
              <div class="text-center py-4 text-muted">
                <i class="bi bi-journal-x" style="font-size:2rem; opacity:0.4;"></i>
                <p class="mt-2 mb-0 small">Sin clases asignadas actualmente.</p>
              </div>`;return}let u={lunes:`Lun`,martes:`Mar`,miercoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sabado:`Sáb`,domingo:`Dom`},d=e=>e?.slice(0,5)||``,f=e=>`${u[e.dia]||e.dia} ${d(e.hora_inicio)}–${d(e.hora_fin)}`;i.innerHTML=`
            <div class="d-flex flex-column gap-2">
              ${n.map(e=>{let t=e.estado===`activa`||e.estado==null,n=e.capacidad_maxima?Math.round(e.total_alumnos/e.capacidad_maxima*100):null,r=n>=90?`#ef4444`:n>=70?`#f59e0b`:`#10b981`,i=e.horarios.map(e=>`<span style="background:var(--bs-tertiary-bg);border:1px solid var(--bs-border-color);border-radius:20px;padding:1px 8px;font-size:0.7rem;white-space:nowrap;">${f(e)}</span>`).join(``);return`
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
                          <span class="fw-semibold text-truncate" style="font-size:0.87rem;" title="${b(e.nombre)}">${b(e.nombre)}</span>
                          ${t?``:`<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;">Inactiva</span>`}
                          ${e.es_suplente?`<span style="font-size:0.62rem;padding:1px 7px;border-radius:20px;background:#fffbeb;color:#92400e;border:1px solid #fde68a;">Suplente</span>`:``}
                        </div>

                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1" style="font-size:0.75rem;color:var(--bs-secondary-color);">
                          ${e.instrumento?`<span>${b(e.instrumento)}</span><span style="opacity:0.3;">·</span>`:``}
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
                          data-clase-nombre="${b(e.nombre)}"
                          data-es-suplente="${e.es_suplente}"
                          title="Quitar"
                          style="font-size:0.65rem;color:#ef4444;text-decoration:none;border-radius:0;">
                          <i class="bi bi-person-dash" style="font-size:0.95rem;"></i>
                          Quitar
                        </button>
                      </div>

                    </div>
                  </div>`}).join(``)}
            </div>`,i.querySelectorAll(`.btn-editar-clase`).forEach(t=>{t.addEventListener(`click`,t=>{let r=t.currentTarget.dataset.claseId,i=n.find(e=>e.id===r);i&&(_.close(),setTimeout(()=>{Zn(i,{...l,onSuccess:()=>{setTimeout(()=>Wr(e),300)}})},300))})}),i.querySelectorAll(`.btn-desvincular-clase`).forEach(t=>{t.addEventListener(`click`,async t=>{let n=t.currentTarget.dataset.claseId,r=t.currentTarget.dataset.claseNombre,i=t.currentTarget.dataset.esSuplente===`true`?`maestro_suplente_id`:`maestro_principal_id`;if(confirm(`¿Quitar a este maestro de "${r}"?`))try{t.currentTarget.disabled=!0,t.currentTarget.innerHTML=`<span class="spinner-border spinner-border-sm"></span>`,await Ee(n,{[i]:null},!0),C(`Maestro desvinculado correctamente`,`success`),_.close(),setTimeout(()=>Wr(e),300)}catch(e){C(`Error al desvincular: `+e.message,`error`),t.currentTarget.disabled=!1,t.currentTarget.innerHTML=`<i class="bi bi-person-dash" style="font-size:1rem;"></i><span>Quitar</span>`}})})}catch{a.textContent=`Error`,i.innerHTML=`
            <div class="alert alert-danger py-2 mb-0 small">
              <i class="bi bi-exclamation-triangle me-1"></i> Error al cargar las clases.
            </div>`}})()}})}function Gr(e){let t=S.maestrosOriginales.find(t=>t.id===e);if(!t){C(`Maestro no encontrado`,`error`);return}S.deletingId=e;let n=t.nombre||t.name||``,r=t.is_active!==!1;_.open({title:r?`⏸️ Desactivar Maestro`:`▶️ Reactivar Maestro`,size:`sm`,saveText:r?`Desactivar`:`Reactivar`,body:r?`<p>¿Desactivar al maestro <strong>${b(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro no aparecerá en las listas, pero sus datos se conservarán.</p>`:`<p>¿Reactivar al maestro <strong>${b(n)}</strong>?</p>
         <p class="text-muted small mb-0">El maestro volverá a aparecer en las listas.</p>`,onSave:async()=>{r?(await ie(e),C(`Maestro desactivado correctamente`,`success`)):(await ee(e),C(`Maestro reactivado correctamente`,`success`)),Vr()}})}function Kr(){let e=Or.querySelector(`#maestrosTBody`);if(!e)return;e.innerHTML=Lr(S.maestros);let t=Or.querySelector(`.maestros-header-premium p.text-muted`);t&&(t.textContent=`${S.maestros.length} maestros en total`)}function qr(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function Jr(){if(S.maestrosOriginales.length===0){C(`No hay maestros para exportar`,`error`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Instrumento`,`Especialidad`,`Estado`],...S.maestrosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono||``,e.instrumento||``,e.especialidad||``,e.is_active===!1?`Inactivo`:`Activo`])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`maestros-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),C(`CSV exportado exitosamente`,`success`)}function C(e,t=`info`){let n=t===`success`?`#198754`:t===`error`?`#dc3545`:`#0dcaf0`,r=t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:`bi-info-circle`,i=t===`success`?`Éxito`:t===`error`?`Error`:`Información`,a=document.createElement(`div`);a.style.cssText=`
    position:fixed;top:1rem;right:1rem;z-index:12000;
    min-width:280px;max-width:420px;
    background:#fff;border-radius:8px;
    box-shadow:0 8px 30px rgba(0,0,0,0.18);
    overflow:hidden;
    font-family:system-ui,-apple-system,sans-serif;
    will-change:transform;isolation:isolate;
  `,a.innerHTML=`
    <div style="display:flex;align-items:center;padding:0.75rem 1rem;background:${n};color:#fff;">
      <i class="bi ${r} me-2" style="font-size:1.1rem;"></i>
      <strong style="flex:1;font-size:0.9rem;">${i}</strong>
      <button type="button" style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem;line-height:1;padding:0;">&times;</button>
    </div>
    <div style="padding:0.75rem 1rem;font-size:0.875rem;color:#212529;">
      ${b(e)}
    </div>
  `,document.body.appendChild(a),a.querySelector(`button`).addEventListener(`click`,()=>{a.remove()}),setTimeout(()=>{a.style.transition=`opacity .3s`,a.style.opacity=`0`,setTimeout(()=>a.remove(),300)},3e3)}function Yr(){f.register(`maestros`,Ar)}var Xr=class{constructor(e={}){this.id=e.id||null,this.nombre=e.nombre||``,this.descripcion=e.descripcion||``,this.nivel=e.nivel||``,this.duracion_anios=e.duracion_anios||null,this.activo=e.activo===void 0?!0:e.activo,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(e=[]){let t=[];return!this.nombre||!this.nombre.trim()?t.push(`El nombre del programa es obligatorio`):this.nombre.length>100&&t.push(`El nombre no puede exceder los 100 caracteres`),this.nivel?e.length>0&&!e.includes(this.nivel)&&t.push(`El nivel seleccionado no es válido`):t.push(`El nivel es obligatorio`),this.descripcion&&this.descripcion.length>500&&t.push(`La descripción no puede exceder los 500 caracteres`),this.duracion_anios!==null&&(isNaN(this.duracion_anios)||this.duracion_anios<0)&&t.push(`La duración debe ser un número positivo`),t}toJSON(){return{nombre:this.nombre.trim(),descripcion:this.descripcion?this.descripcion.trim():``,nivel:this.nivel,duracion_anios:this.duracion_anios,activo:this.activo}}},Zr=[{value:``,label:`Sin nivel específico`},{value:`1`,label:`1° Año`},{value:`2`,label:`2° Año`},{value:`3`,label:`3° Año`},{value:`4`,label:`4° Año`},{value:`5`,label:`5° Año`},{value:`6`,label:`6° Año`},{value:`inicial`,label:`Nivel Inicial`},{value:`intermedio`,label:`Nivel Intermedio`},{value:`avanzado`,label:`Nivel Avanzado`},{value:`preuniversitario`,label:`Pre-Universitario`}];function Qr(e){let t=Zr.find(t=>t.value===e);return t?t.label:e||`-`}async function $r(){let{data:e,error:n}=await t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0});if(n)throw console.error(`Error cargando programas:`,n.message),n;return(e||[]).map(e=>new Xr(e))}async function ei(e){let n=new Xr(e),r=Zr.map(e=>e.value).filter(Boolean),i=n.validate(r);if(i.length>0)throw Error(i.join(`. `));let{data:a,error:o}=await t.from(`programas`).insert([n.toJSON()]).select();if(o)throw console.error(`Error creando programa:`,o.message),o;return new Xr(a[0])}async function ti(e,n){let r=new Xr(n),i=Zr.map(e=>e.value).filter(Boolean),a=r.validate(i);if(a.length>0)throw Error(a.join(`. `));let{data:o,error:s}=await t.from(`programas`).update(r.toJSON()).eq(`id`,e).select();if(s)throw console.error(`Error actualizando programa:`,s.message),s;return new Xr(o[0])}async function ni(e){let{error:n}=await t.from(`programas`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando programa:`,n.message),n}async function ri(e){let{jsPDF:t}=await d(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-GjK8N93W.js`).then(e=>e.n);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:n}=await d(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BLAnV92G.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([7,4])),r=new t;r.setFontSize(18),r.text(`Programas Académicos`,14,22),r.setFontSize(10),r.text(`Fecha: ${new Date().toLocaleDateString(`es-ES`)}`,14,30),n(r,{head:[[`Nombre`,`Nivel`,`Descripción`,`Estado`,`Creado`]],body:e.map(e=>[e.nombre,Qr(e.nivel),e.descripcion?e.descripcion.substring(0,50)+(e.descripcion.length>50?`...`:``):`-`,e.activo?`Activo`:`Inactivo`,e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`):`-`]),startY:35,styles:{fontSize:9},headStyles:{fillColor:[41,128,185]}}),r.save(`programas.pdf`)}var w={programas:[],programasOriginales:[],cargando:!1},ii={nombreMax:100,descripcionMax:500};function T(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function ai(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`N/A`}function oi(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].charAt(0).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function si(e=``){return Zr.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}async function ci(e){try{w.cargando=!0,li(e);let t=await $r();w.programas=t,w.programasOriginales=[...t],w.cargando=!1,di(e),hi(e)}catch(t){console.error(`[ProgramasView]`,t),ui(e,t.message)}}function li(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando programas...</p>
      </div>
    </div>
  `}function ui(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${T(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>ci(e))}function di(e){e.innerHTML=`
    <div class="page-container">
      <div class="programas-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-journal-bookmark fs-4"></i>
          </div>
          <div>
            <h1 class="programas-title-premium page-title mb-0">Programas</h1>
            <p class="text-muted small mb-0">${w.programas.length} programas en total</p>
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
          ${fi(w.programas)}
        </div>
        <div id="emptyContainer">
          ${w.programas.length===0?pi():``}
        </div>
      </div>
    </div>
  `}function fi(e){return e.length?e.map(e=>{let t=oi(e.nombre),n=Qr(e.nivel),r=T(e.descripcion||`Sin descripción`),i=`border-accent-${e.activo?`success`:`secondary`}`,a=`bg-${e.activo?`success`:`secondary`}`;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${i}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${t}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${a} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${T(e.nombre)}</span>
            <small class="text-muted text-truncate">${n} • ${r.substring(0,50)}${r.length>50?`...`:``}</small>
          </div>
        </div>
        <div class="flex-shrink-0 text-muted ms-2 pe-1">
          <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </div>
      </div>
    `}).join(``):``}function pi(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      <p>No hay programas que coincidan con la búsqueda.</p>
    </div>
  `}var mi=null;function hi(e){mi=e,e.querySelector(`#btnAgregarPrograma`)?.addEventListener(`click`,()=>vi()),e.querySelector(`#btnExportarPDF`)?.addEventListener(`click`,async()=>{try{await ri(w.programas),c.success(`PDF generado exitosamente`)}catch{c.error(`Error al generar PDF`)}}),e.querySelector(`#buscar`)?.addEventListener(`input`,gi),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,gi),e.querySelector(`#programasTBody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t){let t=e.target.closest(`.list-group-item[data-id]`);t&&Si(t.dataset.id);return}let{action:n,id:r}=t.dataset;n===`edit`&&yi(r),n===`delete`&&Ci(r)})}function gi(){let e=mi.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=mi.querySelector(`#filtroEstado`)?.value||`todos`;w.programas=w.programasOriginales.filter(n=>{let r=!e||n.nombre.toLowerCase().includes(e)||(n.descripcion||``).toLowerCase().includes(e),i=t===`todos`||t===`activo`&&n.activo||t===`inactivo`&&!n.activo;return r&&i}),_i()}function _i(){let e=mi.querySelector(`#programasTBody`);e&&(e.innerHTML=fi(w.programas));let t=mi.querySelector(`#emptyContainer`);t&&(t.innerHTML=w.programas.length===0?pi():``)}function vi(){bi({title:`Nuevo Programa`,saveText:`Crear Programa`})}function yi(e){let t=w.programasOriginales.find(t=>t.id===e);if(!t)return c.error(`Programa no encontrado`);bi({title:`Editar Programa`,saveText:`Guardar Cambios`,programa:t})}function bi({title:e,saveText:t,programa:n=null}){_.open({title:e,saveText:t,body:`
      <form id="form-programa" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Nombre del Programa *</label>
          <input type="text" class="form-control input-dense" id="prog-nombre" required maxlength="${ii.nombreMax}" value="${T(n?.nombre||``)}">
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Nivel / Año *</label>
          <select class="form-select input-dense" id="prog-nivel">
            ${si(n?.nivel||``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Duración (años)</label>
          <input type="number" class="form-control input-dense" id="prog-duracion" min="0" step="0.5" value="${n?.duracion_anios||``}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción</label>
          <textarea class="form-control input-dense" id="prog-descripcion" rows="3" maxlength="${ii.descripcionMax}">${T(n?.descripcion||``)}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="prog-activo" ${n?.activo===!1?``:`checked`}>
            <label class="form-check-label" for="prog-activo">Programa Activo</label>
          </div>
        </div>
      </form>
    `,onSave:async e=>{let t={nombre:e.querySelector(`#prog-nombre`).value.trim(),nivel:e.querySelector(`#prog-nivel`).value,duracion_anios:e.querySelector(`#prog-duracion`).value?parseFloat(e.querySelector(`#prog-duracion`).value):null,descripcion:e.querySelector(`#prog-descripcion`).value.trim(),activo:e.querySelector(`#prog-activo`).checked},r=new Xr(t),i=Zr.map(e=>e.value).filter(Boolean),a=r.validate(i);if(a.length>0)return c.error(a[0]),!1;try{if(n){let e=await ti(n.id,t),r=w.programasOriginales.findIndex(e=>e.id===n.id);w.programasOriginales[r]=e,c.success(`Programa actualizado`)}else{let e=await ei(t);w.programasOriginales.unshift(e),c.success(`Programa creado`)}return gi(),!0}catch(e){return c.error(e.message),!1}}})}async function xi(e,n){let r=n.querySelector(`#programa-clases-section`);if(r)try{let[n,i]=await Promise.all([t.from(`clases`).select(`*`).eq(`programa_id`,e),t.from(`maestros`).select(`id, nombre_completo`)]),a=n.data||[],o=i.data||[];if(a.length===0){r.innerHTML=`<p class="text-muted small fst-italic mb-0">Este programa no tiene clases registradas.</p>`;return}let s=a.reduce((e,t)=>e+(t.alumnos_inscritos||0),0),c=[...new Set(a.map(e=>e.instrumento).filter(Boolean))],l=[...new Set([...a.map(e=>e.maestro_principal_id),...a.map(e=>e.maestro_suplente_id)].filter(Boolean))];r.innerHTML=`
      <div class="row g-2 mb-3">
        <div class="col-6 col-md-3">
          <div class="card card-body py-2 text-center border-0 bg-body-secondary">
            <div class="fs-5 fw-bold">${a.length}</div>
            <small class="text-muted">Clases</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card card-body py-2 text-center border-0 bg-body-secondary">
            <div class="fs-5 fw-bold">${s}</div>
            <small class="text-muted">Alumnos</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card card-body py-2 text-center border-0 bg-body-secondary">
            <div class="fs-5 fw-bold">${c.length}</div>
            <small class="text-muted">Instrumentos</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card card-body py-2 text-center border-0 bg-body-secondary">
            <div class="fs-5 fw-bold">${l.length}</div>
            <small class="text-muted">Maestros</small>
          </div>
        </div>
      </div>
    `+a.map(e=>{let t=o.find(t=>t.id===e.maestro_principal_id),n=o.find(t=>t.id===e.maestro_suplente_id),r=t?t.nombre_completo||t.nombre:`No asignado`,i=n?n.nombre_completo||n.nombre:null,a=(e.horarios||[]).slice(0,2),s=a.length>0?a.map(e=>`${(e.dia||``).slice(0,2).toUpperCase()} ${(e.hora_inicio||``).slice(0,5)}`).join(` · `):`Sin horario`,c=e.alumnos_inscritos??0;return`
        <div class="card mb-2 border-0 shadow-sm">
          <div class="card-body py-2 px-3">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1 overflow-hidden">
                <div class="fw-semibold text-truncate">${T(e.nombre||`Sin nombre`)}</div>
                <small class="text-muted">${e.descripcion?T(e.descripcion):`<em>Sin descripción registrada</em>`}</small>
              </div>
              <span class="badge ms-2 flex-shrink-0 ${e.estado===`activa`?`bg-success-subtle text-success-emphasis`:`bg-secondary-subtle text-secondary-emphasis`}">${T(e.estado||`activa`)}</span>
            </div>
            <div class="row g-1 mt-1 small text-muted">
              <div class="col-6"><i class="bi bi-person-badge me-1"></i>${T(r)}</div>
              <div class="col-6"><i class="bi bi-person-dash me-1"></i>${i?T(i):`Sin maestro suplente`}</div>
              <div class="col-6"><i class="bi bi-music-note me-1"></i>${T(e.instrumento||`-`)} · ${T(e.nivel||`-`)}</div>
              <div class="col-6"><i class="bi bi-people me-1"></i>${c} alumno${c===1?``:`s`} inscritos</div>
              <div class="col-6"><i class="bi bi-clock me-1"></i>${T(s)}</div>
              <div class="col-6"><i class="bi bi-door-open me-1"></i>${T(e.salon||`Sin salón`)}</div>
            </div>
          </div>
        </div>
      `}).join(``)}catch(e){console.error(`[programasView] loadClasesForPrograma error:`,e),r.innerHTML=`<p class="text-danger small mb-0">Error al cargar las clases del programa.</p>`}}function Si(e){let t=w.programasOriginales.find(t=>t.id===e);t&&_.open({title:`Perfil del Programa`,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="programa-profile">
        <!-- Header Banner / Avatar Section -->
        <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
          <div class="position-relative" style="flex-shrink: 0;">
            <div class="avatar-large bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center fw-bold" 
                 style="width: 60px; height: 60px; font-size: 1.6rem; border-radius: 50%;">
              ${oi(t.nombre)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 bg-${t.activo?`success`:`danger`} border border-light rounded-circle" 
                  style="transform: translate(10%, 10%);"
                  title="${t.activo?`Activo`:`Inactivo`}">
            </span>
          </div>
          <div class="overflow-hidden">
            <h4 class="h5 mb-1 fw-bold text-truncate" style="letter-spacing: -0.01em;">${T(t.nombre)}</h4>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">${Qr(t.nivel)}</span>
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
                ${T(t.descripcion||`Sin descripción detallada.`)}
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
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${ai(t.created_at)}</p>
                </div>
                <div class="col-sm-6">
                  <label class="programa-profile-label small text-uppercase fw-bold mb-1 d-block" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                    <i class="bi bi-calendar-event me-1"></i> Modificado
                  </label>
                  <p class="mb-0 programa-profile-value small" style="opacity: 0.85;">${t.updated_at?ai(t.updated_at):ai(t.created_at)}</p>
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

          <!-- Clases del programa -->
          <div class="col-12 mt-2">
            <h6 class="fw-bold border-bottom pb-2 mb-3" style="font-size:0.85rem; text-transform:uppercase; letter-spacing:0.05em;">
              <i class="bi bi-collection me-2 text-primary"></i>Clases del programa
            </h6>
            <div id="programa-clases-section">
              <div class="text-center text-muted py-3">
                <span class="spinner-border spinner-border-sm me-2"></span>Cargando clases...
              </div>
            </div>
          </div>
        </div>
      </div>
    `,onShow:n=>{n.querySelector(`#view-edit-btn`).addEventListener(`click`,()=>{_.close(),setTimeout(()=>yi(e),300)}),n.querySelector(`#view-delete-btn`).addEventListener(`click`,()=>{_.close(),setTimeout(()=>Ci(e),300)}),n.querySelector(`#copy-id-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(t.id),c.success(`ID copiado al portapapeles`)}),xi(e,n)}})}function Ci(e){let t=w.programasOriginales.find(t=>t.id===e);t&&_.open({title:`⚠️ Eliminar Programa`,saveText:`Confirmar Eliminación`,body:`
      <p>¿Estás seguro de eliminar el programa <strong>${T(t.nombre)}</strong>?</p>
      <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i> Esta acción no se puede deshacer.</p>
    `,onSave:async()=>{try{return await ni(e),w.programasOriginales=w.programasOriginales.filter(t=>t.id!==e),gi(),c.success(`Programa eliminado`),!0}catch{return c.error(`Error al eliminar`),!1}}})}function wi(){f.register(`programas`,ci)}var Ti=[{key:`nombre_completo`,label:`Nombre completo`,peso:10,grupo:`Personal`},{key:`fecha_nacimiento`,label:`Fecha de nacimiento`,peso:8,grupo:`Personal`},{key:`genero`,label:`Género`,peso:3,grupo:`Personal`},{key:`nacionalidad`,label:`Nacionalidad`,peso:3,grupo:`Personal`},{key:`municipio_residencia`,label:`Municipio`,peso:4,grupo:`Personal`},{key:`direccion`,label:`Dirección`,peso:4,grupo:`Personal`},{key:`madre_tlf_whatsapp`,label:`WhatsApp de la madre`,peso:8,grupo:`Contacto`},{key:`padre_tlf_whatsapp`,label:`WhatsApp del padre`,peso:5,grupo:`Contacto`},{key:`representante_tlf`,label:`Teléfono representante`,peso:5,grupo:`Contacto`},{key:`madre_nombre`,label:`Nombre de la madre`,peso:6,grupo:`Familia`},{key:`padre_nombre`,label:`Nombre del padre`,peso:5,grupo:`Familia`},{key:`representante_nombre`,label:`Nombre del representante`,peso:6,grupo:`Familia`},{key:`representante_parentesco`,label:`Parentesco representante`,peso:3,grupo:`Familia`},{key:`contacto_emergencia_nombre`,label:`Contacto de emergencia`,peso:4,grupo:`Familia`},{key:`instrumento_principal`,label:`Instrumento principal`,peso:8,grupo:`Musical`},{key:`instrumento_interes`,label:`Instrumento de interés`,peso:4,grupo:`Musical`},{key:`nivel_actual`,label:`Nivel actual`,peso:4,grupo:`Musical`},{key:`centro_estudios`,label:`Centro de estudios`,peso:4,grupo:`Escolar`},{key:`grado_nivel`,label:`Grado / Nivel`,peso:3,grupo:`Escolar`},{key:`alergias_descripcion`,label:`Alergias (declaradas)`,peso:3,grupo:`Salud`,opcional:!0},{key:`problemas_conducta`,label:`Conducta (declarada)`,peso:3,grupo:`Salud`,opcional:!0},{key:`acepta_pago_600`,label:`Acepta pago RD$600`,peso:5,grupo:`Compromisos`},{key:`autoriza_fotos_redes`,label:`Autoriza fotos en redes`,peso:3,grupo:`Compromisos`}],Ei=Ti.reduce((e,t)=>e+t.peso,0);function Di(e,t){let n=e[t];return!(n==null||n===``||typeof n==`string`&&n.trim()===``)}function Oi(e){let t=[],n=[];for(let r of Ti)Di(e,r.key)?n.push(r):t.push(r);let r=n.reduce((e,t)=>e+t.peso,0),i=Math.round(r/Ei*100),a=i>=90?`completo`:i>=65?`bueno`:i>=35?`parcial`:`critico`,o={};for(let t of Ti)o[t.grupo]||(o[t.grupo]={total:0,completos:0,porcentaje:0,faltantes:[]}),o[t.grupo].total++,Di(e,t.key)?o[t.grupo].completos++:o[t.grupo].faltantes.push(t.label);for(let e of Object.values(o))e.porcentaje=Math.round(e.completos/e.total*100);return{porcentaje:i,nivel:a,camposFaltantes:t,camposCompletos:n,porGrupo:o}}var ki={critico:`danger`,parcial:`warning`,bueno:`info`,completo:`success`},Ai={critico:`Crítico`,parcial:`Parcial`,bueno:`Bueno`,completo:`Completo`},E={azul:[20,60,130],azulMedio:[40,90,170],azulClaro:[220,232,250],dorado:[198,160,20],doradoClaro:[255,245,200],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248],rojo:[180,20,20],verde:[20,120,60]},ji={id:`demo-0001-uuid`,nombre_completo:`María Gabriela Rodríguez Pérez`,fecha_nacimiento:`2013-06-15`,genero:`F`,nacionalidad:`Dominicana`,tiene_pasaporte:!1,sabe_leer:!0,sabe_escribir:!0,tlf_alumno:`8091234567`,como_se_entero:`Redes sociales`,municipio_residencia:`bavaro`,sector_calle_numero:`Bávaro, Calle Los Corales #12`,direccion:`Sector Los Corales, Bávaro, La Altagracia`,ubicacion_maps_url:`https://maps.google.com`,madre_nombre:`Carmen Pérez de Rodríguez`,madre_cedula:`001-1234567-8`,madre_tlf_whatsapp:`8097654321`,padre_nombre:`José Rafael Rodríguez`,padre_cedula:`001-9876543-2`,padre_tlf_whatsapp:`8299876543`,representante_nombre:`Carmen Pérez de Rodríguez`,representante_parentesco:`Madre`,representante_cedula:`001-1234567-8`,representante_tlf:`8097654321`,correo_representante:`carmen.perez@email.com`,otro_responsable_nombre:`José Rafael Rodríguez`,otro_responsable_cedula:`001-9876543-2`,otro_responsable_tlf:`8299876543`,contacto_emergencia_nombre:`Luisa Martínez`,contacto_emergencia_telefono:`8091112222`,beneficiario_subsidio_estado:!1,subsidio_descripcion:null,apoyo_actividades:`Disponible para apoyo en actividades los fines de semana`,instrumento_principal:`Violín`,nivel_actual:`Iniciación`,tiene_conocimientos_musicales:!1,instrumento_previo:null,nivel_lectura_musical:`Ninguno`,interes_musical:`instrumento`,instrumento_interes:`Violín`,sentimiento_musica_clasica:`Me emociona mucho y me parece muy bonita`,sentimiento_aprender_instrumento:`Estoy muy emocionada y quiero aprender rápido`,aspiracion_instrumento:`Llegar a tocar en una orquesta`,musico_favorito:`Beethoven`,preferencia_aprendizaje_musical:`Visual y auditiva`,por_que_unirse:`Siempre soñé con tocar un instrumento y El Sistema me da esa oportunidad`,alergias_descripcion:null,condicion_transmisible_desc:null,alergia_medicamento_desc:null,problemas_conducta:`no`,tiene_alergias:!1,tiene_condicion_transmisible:!1,tiene_alergia_medicamento:!1,centro_estudios:`Colegio San Juan Bosco`,grado_nivel:`5to de Primaria`,padres_en_vida:`ambos`,autoriza_fotos_redes:!0,acepta_beca_4500:!0,acepta_pago_600:!0,fecha_aceptacion_compromisos:new Date().toISOString(),requiere_iniciacion_musical:!0,familia_monoparental:!1};function D(e,t=`—`){return String(e??``).trim()||t}function Mi(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}catch{return e}}function Ni(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,`${a} años`}catch{return`—`}}function Pi(e){return e===!0||e===`true`||e===`t`?`Sí`:e===!1||e===`false`||e===`f`?`No`:`—`}function Fi(e){return{punta_cana:`Punta Cana`,bavaro:`Bávaro`,veron:`Verón`,friusa:`Friusa`,el_cortecito:`El Cortecito`,los_corales:`Los Corales`,otro:`Otro`}[e]??D(e)}function Ii(e){return{cantar:`Cantar`,instrumento:`Instrumento`,ambas:`Ambas`}[e]??D(e)}function Li(e){return{ambos:`Ambos`,solo_madre:`Solo madre`,solo_padre:`Solo padre`,ninguno:`Ninguno`}[e]??D(e)}function Ri(e){return{no:`Sin problemas`,pocas_veces:`Pocas veces`,si:`Sí presenta`,violento:`Conducta violenta`}[e]??D(e)}function zi(e){return`SOI-PC-${new Date().getFullYear()}-${e.id?e.id.replace(/-/g,``).slice(-8).toUpperCase():Date.now().toString(36).toUpperCase().slice(-8)}`}function Bi(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}var O=215.9,Vi=279.4,k=14;function Hi(e,t,n=``){return e.setFillColor(...E.azul),e.rect(0,0,O,32,`F`),e.setFillColor(...E.dorado),e.rect(0,32,O,2.5,`F`),e.setFillColor(...E.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...E.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,k+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,k+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...E.dorado),e.text(t,O-k,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,O-k,20,{align:`right`})),e.setTextColor(...E.grisOscuro),38}function Ui(e,t=1){e.setFillColor(...E.azul),e.rect(0,Vi-12,O,12,`F`),e.setFillColor(...E.dorado),e.rect(0,Vi-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...E.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,k+2,Vi-4.5),e.text(`Pág. ${t}`,O-k,Vi-4.5,{align:`right`})}function Wi(e,t,n,r=E.azul){return e.setFillColor(...r),e.rect(k,n,O-k*2,6.5,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(8),e.setTextColor(...E.blanco),e.text(t,k+3,n+4.4),e.setTextColor(...E.grisOscuro),n+7.5}function Gi(e,t,n,r={}){return Ae(e,{startY:n,margin:{left:k,right:k},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:E.grisOscuro,font:`helvetica`},alternateRowStyles:{fillColor:E.grisClaro},columnStyles:{0:{fontStyle:`bold`,cellWidth:r.labelW??42,fillColor:E.azulClaro,textColor:E.azul},2:{fontStyle:`bold`,cellWidth:r.labelW??42,fillColor:E.azulClaro,textColor:E.azul}},body:t,...r.extra}),e.lastAutoTable.finalY+2.5}function Ki(e,t,n,r={}){return Ae(e,{startY:n,margin:{left:k,right:k},theme:`grid`,styles:{fontSize:7.5,cellPadding:{top:1.2,bottom:1.2,left:2.5,right:2.5},lineColor:[210,215,225],lineWidth:.2,textColor:E.grisOscuro},columnStyles:{0:{fontStyle:`bold`,cellWidth:r.labelW??52,fillColor:E.azulClaro,textColor:E.azul}},body:t,...r.extra}),e.lastAutoTable.finalY+2.5}function qi(e,t,n,r){return Ui(e,r-1),e.addPage(),Hi(e,t,`Continuación · ${n}`)}function Ji(e,t,n,r,i,a){return t+n>Vi-22?(a.n++,qi(e,r,i,a.n)):t}function Yi(e){let t=new ke({unit:`mm`,format:`letter`}),n={n:1},r=`FICHA TÉCNICA DEL ALUMNO`,i=Hi(t,r,`Generado: ${Bi()}`);t.setFont(`helvetica`,`bold`),t.setFontSize(55),t.setTextColor(235,240,252),t.text(`USO INTERNO`,O/2,Vi/2,{align:`center`,angle:45}),t.setTextColor(...E.grisOscuro),t.setFillColor(...E.azulClaro),t.roundedRect(k,i,O-k*2,18,2,2,`F`),t.setFont(`helvetica`,`bold`),t.setFontSize(13),t.setTextColor(...E.azul),t.text(D(e.nombre_completo),k+4,i+7),t.setFont(`helvetica`,`normal`),t.setFontSize(8.5),t.setTextColor(...E.grisMedio);let a=[`Edad: ${Ni(e.fecha_nacimiento)}`,`F. Nac.: ${Mi(e.fecha_nacimiento)}`,`Instrumento: ${D(e.instrumento_principal)}`,`Nivel: ${D(e.nivel_actual)}`].join(`    ·    `);t.text(a,k+4,i+13),t.setTextColor(...E.grisOscuro),i+=22,i=Wi(t,`1 · DATOS PERSONALES`,i),i=Gi(t,[[`Nombre completo`,D(e.nombre_completo),`Fecha de nacimiento`,Mi(e.fecha_nacimiento)],[`Edad`,Ni(e.fecha_nacimiento),`Nacionalidad`,D(e.nacionalidad)],[`Género`,D(e.genero),`Tiene pasaporte`,Pi(e.tiene_pasaporte)],[`Sabe leer`,Pi(e.sabe_leer),`Sabe escribir`,Pi(e.sabe_escribir)],[`Cómo se enteró`,D(e.como_se_entero),`Municipio`,Fi(e.municipio_residencia)],[`Sector / Calle`,D(e.sector_calle_numero),`Teléfono`,D(e.tlf_alumno)]],i),i=Ki(t,[[`Dirección completa`,D(e.direccion)],[`Enlace Google Maps`,D(e.ubicacion_maps_url)]],i),i=Ji(t,i,40,r,e.nombre_completo,n),i=Wi(t,`2 · DATOS DE LA MADRE / 3 · DATOS DEL PADRE`,i),i=Gi(t,[[`Nombre (Madre)`,D(e.madre_nombre),`Nombre (Padre)`,D(e.padre_nombre)],[`Cédula Madre`,D(e.madre_cedula),`Cédula Padre`,D(e.padre_cedula)],[`WhatsApp Madre`,D(e.madre_tlf_whatsapp),`WhatsApp Padre`,D(e.padre_tlf_whatsapp)]],i),i=Ji(t,i,60,r,e.nombre_completo,n),i=Wi(t,`4 · REPRESENTANTE Y CONTACTOS`,i),i=Gi(t,[[`Representante`,D(e.representante_nombre),`Parentesco`,D(e.representante_parentesco)],[`Cédula`,D(e.representante_cedula),`Teléfono`,D(e.representante_tlf)],[`Correo`,D(e.correo_representante),`Fam. monoparen.`,Pi(e.familia_monoparental)],[`Otro responsable`,D(e.otro_responsable_nombre),`Cédula`,D(e.otro_responsable_cedula)],[`Tlf otro resp.`,D(e.otro_responsable_tlf),``,``],[`Emergencia 1`,D(e.contacto_emergencia_nombre),`Tlf`,D(e.contacto_emergencia_telefono)],[`Emergencia 2`,D(e.contacto_emergencia_2_nombre),`Tlf`,D(e.contacto_emergencia_2_telefono)]],i),i=Wi(t,`5 · SITUACIÓN SOCIAL`,i),i=Gi(t,[[`Beneficiario subsidio`,Pi(e.beneficiario_subsidio_estado),`Descripción`,D(e.subsidio_descripcion)],[`Apoyo actividades`,{content:D(e.apoyo_actividades),colSpan:3}]],i,{extra:{columnStyles:{0:{fontStyle:`bold`,cellWidth:42,fillColor:E.azulClaro,textColor:E.azul},2:{fontStyle:`bold`,cellWidth:42,fillColor:E.azulClaro,textColor:E.azul}}}}),i=Ji(t,i,70,r,e.nombre_completo,n),i=Wi(t,`6 · PERFIL MUSICAL`,i,E.dorado),t.setFillColor(...E.doradoClaro),i=Gi(t,[[`Conocimientos musicales`,Pi(e.tiene_conocimientos_musicales),`Instrumento previo`,D(e.instrumento_previo)],[`Nivel lectura musical`,D(e.nivel_lectura_musical),`Interés`,Ii(e.interes_musical)],[`Instrumento de interés`,D(e.instrumento_interes),`Requiere iniciación`,Pi(e.requiere_iniciacion_musical)],[`Músico favorito`,D(e.musico_favorito),`Pref. aprendizaje`,D(e.preferencia_aprendizaje_musical)]],i),i=Ki(t,[[`Por qué quiere unirse`,D(e.por_que_unirse)],[`Sentimiento música clásica`,D(e.sentimiento_musica_clasica)],[`Sentimiento al aprender`,D(e.sentimiento_aprender_instrumento)],[`Aspiración con instrumento`,D(e.aspiracion_instrumento)]],i,{labelW:55}),i=Ji(t,i,50,r,e.nombre_completo,n),i=Wi(t,`7 · SALUD Y CONDUCTA`,i,E.rojo),i=Gi(t,[[`Tiene alergias`,Pi(e.tiene_alergias),`Cuáles`,D(e.alergias_descripcion)],[`Cond. transmisible`,Pi(e.tiene_condicion_transmisible),`Cuál`,D(e.condicion_transmisible_desc)],[`Alergia medicamento`,Pi(e.tiene_alergia_medicamento),`Cuál`,D(e.alergia_medicamento_desc)],[`Impedimento social`,Pi(e.impedimento_social),`Conducta`,Ri(e.problemas_conducta)]],i),i=Wi(t,`8 · DATOS ESCOLARES`,i),i=Gi(t,[[`Centro de estudios`,D(e.centro_estudios),`Grado / Nivel`,D(e.grado_nivel)],[`Padres en vida`,Li(e.padres_en_vida),``,``]],i),i=Ji(t,i,55,r,e.nombre_completo,n),i=Wi(t,`9 · COMPROMISOS Y AUTORIZACIONES`,i,E.verde),i=Gi(t,[[`Acepta beca RD$4,500`,Pi(e.acepta_beca_4500),`Acepta pago RD$600/mes`,Pi(e.acepta_pago_600)],[`Autoriza fotos/redes`,Pi(e.autoriza_fotos_redes),`Fecha compromisos`,Mi(e.fecha_aceptacion_compromisos?.slice(0,10))]],i),i=Ji(t,i,45,r,e.nombre_completo,n),i+=8,t.setDrawColor(...E.grisMedio),t.setLineWidth(.3),t.line(k,i+18,k+78,i+18),t.setFont(`helvetica`,`bold`),t.setFontSize(7.5),t.setTextColor(...E.grisOscuro),t.text(`Firma del Representante`,k,i+23),t.setFont(`helvetica`,`normal`),t.setFontSize(7),t.setTextColor(...E.grisMedio),t.text(D(e.representante_nombre),k,i+27),t.text(`C.I.: ${D(e.representante_cedula)}`,k,i+31);let o=O/2+8;return t.setDrawColor(...E.grisMedio),t.line(o,i+18,O-k,i+18),t.setFont(`helvetica`,`bold`),t.setFontSize(7.5),t.setTextColor(...E.grisOscuro),t.text(`Encargado Administrativo`,o,i+23),t.setFont(`helvetica`,`normal`),t.setFontSize(7),t.setTextColor(...E.grisMedio),t.text(`El Sistema Punta Cana`,o,i+27),t.text(`Fecha: ${Bi()}`,o,i+31),Ui(t,n.n),t}function Xi(e,t={}){let n=new ke({unit:`mm`,format:`letter`}),r=zi(e),i=Bi(),a=Hi(n,`CONSTANCIA DE INSCRIPCIÓN`,`Serie: ${r}`);n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.setTextColor(...E.dorado),n.setDrawColor(...E.dorado),n.setLineWidth(.6),n.roundedRect(O-k-28,36,28,7,1,1,`S`),n.text(`ORIGINAL`,O-k-14,41,{align:`center`}),n.setTextColor(...E.grisOscuro),n.setLineWidth(.2),n.setFont(`helvetica`,`normal`),n.setFontSize(9.5),n.setTextColor(...E.grisMedio),n.text(`Punta Cana, ${i}`,O-k,a,{align:`right`}),a+=8,n.setFont(`helvetica`,`bold`),n.setFontSize(10.5),n.setTextColor(...E.azul),n.text(`A QUIEN PUEDA INTERESAR:`,k,a),a+=10,n.setFont(`helvetica`,`normal`),n.setFontSize(10),n.setTextColor(...E.grisOscuro);let o=D(e.nombre_completo).toUpperCase(),s=D(e.representante_nombre),c=D(e.representante_parentesco);[`Por medio de la presente, El Sistema Punta Cana hace constar que:`,``,`El/La estudiante ${o}, de ${Ni(e.fecha_nacimiento)}, nacido/a el ${Mi(e.fecha_nacimiento)}, de nacionalidad ${D(e.nacionalidad)}, ha sido debidamente inscrito/a en el Programa de Formación Musical de El Sistema Punta Cana, a partir del día ${i}.`,``,e.requiere_iniciacion_musical?`El/La estudiante participará en el programa de iniciación musical, con interés en ${Ii(e.interes_musical).toLowerCase()} — instrumento asignado: ${D(e.instrumento_interes)}.`:`El/La estudiante cuenta con conocimientos musicales previos, con interés en ${Ii(e.interes_musical).toLowerCase()} — instrumento: ${D(e.instrumento_interes)}.`,``,`El representante, ${s} (${c}), ha aceptado los términos del programa, incluyendo el aporte mensual de RD$600, con pleno conocimiento de que el/la estudiante recibe una beca valorada en RD$4,500 mensuales, la cual se mantendrá mientras demuestre rendimiento, interés y asistencia notable.`].forEach(e=>{if(!e){a+=4;return}let t=n.splitTextToSize(e,O-k*2);n.text(t,k,a),a+=t.length*5.8}),a+=6;let l=[[`bi-credit-card`,`✓  Tarjeta de pagos mensuales`],[`bi-calendar`,`✓  Horario de clases asignado`],[`bi-pencil`,`✓  Lista de útiles: lápiz HB, cuaderno pentagramado, borrador`],[`bi-shirt`,`✓  T-Shirt oficial de El Sistema Punta Cana`]],u=9+l.length*7+12;n.setFillColor(...E.azulClaro),n.setDrawColor(...E.azulMedio),n.setLineWidth(.5),n.roundedRect(k,a,O-k*2,u,3,3,`FD`),n.setFillColor(...E.azul),n.roundedRect(k,a,O-k*2,9,3,3,`F`),n.rect(k,a+5,O-k*2,4,`F`),n.setFont(`helvetica`,`bold`),n.setFontSize(9),n.setTextColor(...E.blanco),n.text(`AL PRESENTAR ESTA CONSTANCIA EN CAJA RECIBIRÁ:`,k+4,a+6.5),a+=13,n.setFont(`helvetica`,`normal`),n.setFontSize(9.5),n.setTextColor(...E.azul),l.forEach(([,e])=>{n.text(e,k+5,a),a+=7}),a+=1,n.setFillColor(...E.rojo),n.roundedRect(k+3,a,O-k*2-6,8,1.5,1.5,`F`),n.setFont(`helvetica`,`bold`),n.setFontSize(8.5),n.setTextColor(...E.blanco),n.text(`PAGO OBLIGATORIO: RD$600 en caja al retirar los materiales`,k+(O-k*2)/2,a+5.2,{align:`center`}),a+=16;let d=[t.horario&&{icon:`📅`,label:`Consultar horario de clases:`,url:t.horario},t.reglamento&&{icon:`📋`,label:`Reglamento / Manual de convivencia:`,url:t.reglamento},t.bienvenida&&{icon:`⭐`,label:`Manual de bienvenida al programa:`,url:t.bienvenida}].filter(Boolean);d.length>0?(n.setFont(`helvetica`,`bold`),n.setFontSize(9),n.setTextColor(...E.azul),n.text(`Recursos digitales para el representante:`,k,a),a+=6,d.forEach(({icon:e,label:t,url:r})=>{n.setFont(`helvetica`,`bold`),n.setFontSize(8.5),n.setTextColor(...E.grisOscuro),n.text(`${e}  ${t}`,k+2,a),a+=5,n.setFont(`helvetica`,`normal`),n.setFontSize(8),n.setTextColor(...E.azulMedio);let i=n.splitTextToSize(r,O-k*2-10);n.textWithLink(i[0],k+6,a,{url:r}),a+=7}),a+=2):(n.setFont(`helvetica`,`italic`),n.setFontSize(8),n.setTextColor(...E.grisMedio),n.text(`Los recursos digitales serán comunicados por el coordinador del programa.`,k,a),a+=8),a>Vi-55&&(Ui(n,1),n.addPage(),a=Hi(n,`CONSTANCIA DE INSCRIPCIÓN (cont.)`,`Serie: ${r}`)),a+=6,n.setDrawColor(...E.grisMedio),n.setLineWidth(.3),n.setTextColor(...E.grisOscuro),n.line(k,a+20,k+80,a+20),n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.text(`Encargado Administrativo`,k,a+25),n.setFont(`helvetica`,`normal`),n.setFontSize(7.5),n.setTextColor(...E.grisMedio),n.text(`El Sistema Punta Cana`,k,a+29),n.text(i,k,a+33);let f=O/2+6;return n.setTextColor(...E.grisOscuro),n.line(f,a+20,O-k,a+20),n.setFont(`helvetica`,`bold`),n.setFontSize(8),n.text(`Firma del Representante`,f,a+25),n.setFont(`helvetica`,`normal`),n.setFontSize(7.5),n.setTextColor(...E.grisMedio),n.text(D(e.representante_nombre),f,a+29),n.text(`C.I.: ${D(e.representante_cedula)}`,f,a+33),n.setFont(`helvetica`,`normal`),n.setFontSize(6.5),n.setTextColor(170,170,170),n.text(`Serie: ${r}`,O-k,Vi-15,{align:`right`}),Ui(n,1),n}function Zi(e){let t=Yi(e),n=(e.nombre_completo??`alumno`).toLowerCase().replace(/\s+/g,`-`);t.save(`ficha-${n}.pdf`)}async function Qi(e){let t={};try{t=await We()}catch{}let n=Xi(e,t),r=(e.nombre_completo??`alumno`).toLowerCase().replace(/\s+/g,`-`);n.save(`constancia-${r}.pdf`)}function $i(){Zi(ji)}async function ea(){await Qi(ji)}function ta(e){let t=new ke({unit:`mm`,format:`letter`}),n=Bi(),r=`REPORTE DE ALUMNOS INSCRITOS`,i=Hi(t,r,`Generado: ${n}`);t.setFont(`helvetica`,`bold`),t.setFontSize(10),t.setTextColor(...E.grisOscuro),t.text(`Total de alumnos inscritos: ${e.length}`,k,i),i+=6;let a=[[`#`,`Nombre Completo`,`Instrumento`,`Edad`,`Clases`,`Teléfono Rep.`,`Estado`]],o=e.map((e,t)=>[t+1,e.nombre||e.nombre_completo||`—`,e.instrumento||e.instrumento_principal||`—`,e.fecha_nacimiento?`${Ni(e.fecha_nacimiento)}`:`—`,e.clases||`Sin clases`,e.telefono||e.familiar_telefono||`—`,e.is_active??e.activo?`Activo`:`Inactivo`]);Ae(t,{startY:i,margin:{left:k,right:k,top:40,bottom:18},theme:`striped`,head:a,headStyles:{fillColor:E.azul,textColor:E.blanco,fontSize:8.5,fontStyle:`bold`,halign:`left`},styles:{fontSize:8,cellPadding:{top:3,bottom:3,left:2,right:2},lineColor:[210,215,225],lineWidth:.1,textColor:E.grisOscuro},alternateRowStyles:{fillColor:E.grisClaro},columnStyles:{0:{cellWidth:8,halign:`center`},1:{fontStyle:`bold`,cellWidth:45},2:{cellWidth:25},3:{cellWidth:18},4:{cellWidth:45},5:{cellWidth:28},6:{cellWidth:18}},body:o,didDrawPage:e=>{e.pageNumber>1&&Hi(t,r,`Continuación · Generado: ${n}`),Ui(t,e.pageNumber)}}),t.save(`listado-alumnos.pdf`)}function na(e,{fallback:t=null,today:n=new Date}={}){if(!e)return t;let r=new Date(e);if(isNaN(r.getTime())||r>n)return t;let i=n.getFullYear()-r.getFullYear(),a=n.getMonth()-r.getMonth(),o=n.getDate()-r.getDate();return(a<0||a===0&&o<0)&&--i,i}function ra(e){return e?new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`}):`Fecha desconocida`}function A(e){return e==null?``:String(e).replace(/[&<>"']/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e===`"`?`&quot;`:e===`'`?`&#39;`:e})}function ia(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function aa(e){if(!e)return`?`;let t=e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2);return t.length===1?e.trim().slice(0,2).toUpperCase():t}var j={alumnos:[],alumnosOriginales:[],totalAlumnos:0,cargando:!1,editando:null,viewingId:null,deletingId:null,filtroGenero:``,filtroEstado:`todos`,sortBy:`nombre`,sortDir:`asc`},oa=null,sa=null,ca={nombreMax:100,emailMax:100,cedulaMax:20,telefonoMax:20,acudienteMax:100,direccionMax:255,sectionMax:100};async function la(e){sa?.abort(),sa=new AbortController;try{j.cargando=!0,oa=e,ua(e);let{alumnos:t,total:n}=await Re();j.totalAlumnos=n,j.alumnosOriginales=t.map(e=>({...e,_completitud:Oi(e)})),j.alumnos=[...j.alumnosOriginales],j.cargando=!1,fa(e),ha(e),_a()}catch(t){console.error(t),da(e,t.message)}return{teardown:()=>sa?.abort()}}function ua(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando alumnos...</p>
      </div>
    </div>
  `}function da(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${A(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>la(e))}function fa(e){e.innerHTML=`
    <div class="page-container">
      <div class="alumnos-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-people fs-4"></i>
          </div>
          <div>
            <h1 class="alumnos-title-premium mb-0">Alumnos</h1>
            <p class="text-muted small mb-0">${j.alumnos.length} alumnos en total</p>
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
          <button class="btn btn-outline-danger btn-sm-compact" id="btnDescargarPdfListado" title="Descargar PDF del listado de alumnos">
            <i class="bi bi-file-earmark-pdf"></i> PDF Listado
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

      <!-- C07: Sort controls -->
      <div class="d-flex align-items-center gap-3 mb-2 px-1 small text-body-secondary">
        <span>Ordenar por:</span>
        <button class="btn btn-link btn-sm text-decoration-none p-0 ${j.sortBy===`nombre`?`fw-bold text-primary`:`text-body-secondary`}" data-sort="nombre">
          Nombre ${j.sortBy===`nombre`?j.sortDir===`asc`?`↑`:`↓`:``}
        </button>
        <button class="btn btn-link btn-sm text-decoration-none p-0 ${j.sortBy===`instrumento`?`fw-bold text-primary`:`text-body-secondary`}" data-sort="instrumento">
          Instrumento ${j.sortBy===`instrumento`?j.sortDir===`asc`?`↑`:`↓`:``}
        </button>
        <button class="btn btn-link btn-sm text-decoration-none p-0 ${j.sortBy===`_completitud`?`fw-bold text-primary`:`text-body-secondary`}" data-sort="_completitud">
          Completitud ${j.sortBy===`_completitud`?j.sortDir===`asc`?`↑`:`↓`:``}
        </button>
      </div>

      <div class="page-glass rounded w-100">
        <div class="list-group list-group-flush w-100" id="alumnosTBody">
          ${pa(j.alumnos)}
        </div>
        <div id="emptyContainer">
          ${j.alumnos.length===0?ma():``}
        </div>
      </div>

    </div>
  `}function pa(e){return e.length?e.map(e=>{let t=e.nombre||`-`,n=e.is_active??!0,r=`border-accent-${n?`success`:`secondary`}`,i=`bg-${n?`success`:`secondary`}`,{porcentaje:a,nivel:o}=e._completitud||{porcentaje:0,nivel:`sin_datos`},s=o!==`completo`,c=s?ki[o]:``;return`
      <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${r}" data-id="${e.id}" style="cursor: pointer;">
        <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
          <div class="position-relative flex-shrink-0">
            <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
              ${aa(t)}
            </div>
            <span class="position-absolute bottom-0 end-0 p-1 ${i} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${A(t)}</span>
            </div>
            <small class="text-muted text-truncate">
              ${A(e.instrumento||`Sin instrumento especificado`)} ${e.familiar_nombre?`• Rep: ${A(e.familiar_nombre)}`:``}
            </small>
          </div>
        </div>
        
        <!-- Acciones y Estados perfectamente alineados a la derecha -->
        <div class="d-flex align-items-center gap-3 flex-shrink-0">
          <!-- Columna Badge Completitud (52px de ancho fijo) -->
          <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 52px;">
            ${s?`
              <span class="badge badge-completitud badge-completitud-${c}" title="Perfil ${a}% completo — ${Ai[o]}">
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
    `}).join(``):``}function ma(){return`
    <div class="text-center py-5 w-100 list-group-item text-muted" style="background: transparent; border: none;">
      <div class="mb-3">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay alumnos</h4>
      <p class="text-muted mb-0">Crea tu primer alumno haciendo clic en el botón "Nuevo"</p>
    </div>
  `}function ha(e){oa=e;let t=sa?.signal;e.querySelector(`#btnAgregarAlumno`)?.addEventListener(`click`,()=>xa(),{signal:t}),e.querySelector(`#btnInscribir`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-inscribir`),{signal:t}),e.querySelector(`#btnReporteMes`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-reporte-mes`),{signal:t}),e.querySelector(`#btnPdfDemo`)?.addEventListener(`click`,()=>window.router?.navigate(`alumnos-pdf-demo`),{signal:t}),e.querySelector(`#btnDescargarPdfListado`)?.addEventListener(`click`,async e=>{let t=e.currentTarget,n=t.innerHTML;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando PDF...`;try{ta(await Me({ordenInstrumentoAsc:!0,ordenEdadAsc:!0})),c.success(`PDF generado y descargado correctamente`)}catch(e){console.error(`Error al generar PDF de listado de alumnos:`,e),c.error(`No se pudo generar el PDF del listado: `+e.message)}finally{t.disabled=!1,t.innerHTML=n}},{signal:t}),e.querySelector(`#btnExportarCSV`)?.addEventListener(`click`,()=>wa(),{signal:t}),e.querySelectorAll(`[data-sort]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sort;j.sortBy===t?j.sortDir=j.sortDir===`asc`?`desc`:`asc`:(j.sortBy=t,j.sortDir=`asc`),_a()},{signal:t})}),e.querySelector(`#buscar`)?.addEventListener(`input`,_a,{signal:t}),e.querySelector(`#filtroWhatsapp`)?.addEventListener(`change`,_a,{signal:t}),e.querySelector(`#filtroCompletitud`)?.addEventListener(`change`,_a,{signal:t}),e.querySelector(`#filtroInstrumento`)?.addEventListener(`change`,_a,{signal:t}),e.querySelector(`#btnLimpiarFiltros`)?.addEventListener(`click`,t=>{t.stopPropagation();let n=e.querySelector(`#filtroWhatsapp`),r=e.querySelector(`#filtroCompletitud`),i=e.querySelector(`#filtroInstrumento`);n&&(n.value=`todos`),r&&(r.value=`todos`),i&&(i.value=`todos`),_a()},{signal:t}),e.querySelector(`#alumnosTBody`)?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t&&!e.target.closest(`[data-action]`)){window.router?.navigate(`alumno`,{id:t.dataset.id});return}let n=e.target.closest(`[data-action]`);if(!n)return;let r=n.dataset.id;n.dataset.action===`edit`?window.router?.navigate(`alumno`,{id:r}):n.dataset.action===`delete`?Sa(r):n.dataset.action===`whatsapp`&&ga(r)},{signal:t})}function ga(e){let t=j.alumnosOriginales.find(t=>t.id===e);!t||!t.telefono||_.open({title:`Enviar WhatsApp a `+A(t.nombre),size:`md`,saveText:`Enviar WhatsApp`,body:`
      <div class="mb-3">
        <label class="form-label-compact">Número de destino</label>
        <p class="form-control-plaintext fw-bold mb-0">
          <i class="bi bi-whatsapp text-success me-1"></i> ${Ue(t.telefono)}
        </p>
      </div>
      <div class="mb-3">
        <label class="form-label-compact">Mensaje</label>
        <textarea class="form-control input-dense" id="modal-whatsapp-msg" rows="4" placeholder="Escribe tu mensaje aquí..."></textarea>
      </div>
      <p class="text-muted small mb-0">
        Se abrirá WhatsApp Web (o la aplicación) con el mensaje listo para ser enviado.
      </p>
    `,onSave:async e=>{let n=e.querySelector(`#modal-whatsapp-msg`).value.trim(),r=He(t.telefono,n);r&&window.open(r,`_blank`)}})}function _a(){let e=oa.querySelector(`#buscar`)?.value.trim().toLowerCase()||``,t=oa.querySelector(`#filtroWhatsapp`)?.value||`todos`,n=oa.querySelector(`#filtroCompletitud`)?.value||`todos`,r=oa.querySelector(`#filtroInstrumento`)?.value||`todos`;j.alumnos=j.alumnosOriginales.filter(i=>{let a=!e||(i.nombre||``).toLowerCase().includes(e)||(i.instrumento||``).toLowerCase().includes(e)||(i.telefono||``).toLowerCase().includes(e)||(i.familiar_nombre||``).toLowerCase().includes(e)||(i.email||``).toLowerCase().includes(e)||(i.cedula||``).toLowerCase().includes(e),o=!!i.telefono&&i.telefono.trim()!==``,s=t===`todos`||t===`con_whatsapp`&&o||t===`sin_whatsapp`&&!o,{nivel:c}=i._completitud,l=n===`todos`||n===c,u=!!i.instrumento&&i.instrumento.trim()!==``&&i.instrumento.toLowerCase()!==`sin instrumento especificado`;return a&&s&&l&&(r===`todos`||r===`con_instrumento`&&u||r===`sin_instrumento`&&!u)});let i=0;t!==`todos`&&i++,n!==`todos`&&i++,r!==`todos`&&i++;let a=oa.querySelector(`#filtrosBadgeCount`);a&&(a.textContent=i,i>0?a.classList.remove(`d-none`):a.classList.add(`d-none`));let o=oa.querySelector(`#filtrosActivosCount`);o&&(o.textContent=`Filtros activos: ${i}`);let{sortBy:s,sortDir:c}=j;j.alumnos.sort((e,t)=>{let n,r;return s===`_completitud`?(n=e._completitud.porcentaje??0,r=t._completitud.porcentaje??0):(n=(e[s]||``).toString().toLowerCase(),r=(t[s]||``).toString().toLowerCase()),n<r?c===`asc`?-1:1:n>r?c===`asc`?1:-1:0}),Ca()}function va(e=``){return ze.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}function ya(e=null){let t=e||{};return`<form class="row g-2">
    <div class="col-12">
      <label class="form-label-compact">Nombre Completo *</label>
      <input type="text" class="form-control input-dense" id="modal-nombre" maxlength="${ca.nombreMax}" required placeholder="Juan Pérez" autocomplete="off" value="${A(t.nombre||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Teléfono (WhatsApp) *</label>
      <input type="tel" class="form-control input-dense" id="modal-telefono" required placeholder="+58 412 555 1234" autocomplete="off" value="${A(t.telefono||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Email</label>
      <input type="email" class="form-control input-dense" id="modal-email" maxlength="${ca.emailMax}" placeholder="representante@ejemplo.com" autocomplete="off" value="${A(t.email||``)}">
    </div>
    <div class="col-md-6">
      <label class="form-label-compact">Cédula del Alumno</label>
      <input type="text" class="form-control input-dense" id="modal-cedula" maxlength="${ca.cedulaMax}" placeholder="12345678" autocomplete="off" value="${A(t.cedula||``)}">
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
      <input type="text" class="form-control input-dense" id="modal-instrumento" required maxlength="${ca.sectionMax}" placeholder="Violín, Piano..." autocomplete="off" value="${A(t.instrumento||``)}">
    </div>
    <div class="col-12">
      <label class="form-label-compact">Dirección</label>
      <input type="text" class="form-control input-dense" id="modal-direccion" maxlength="${ca.direccionMax}" placeholder="Dirección completa" autocomplete="off" value="${A(t.direccion||``)}">
    </div>
    
    <div class="col-12 mt-3">
      <div class="border rounded p-2 bg-body-tertiary">
        <h6 class="mb-2"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label-compact">Nombre</label>
            <input type="text" class="form-control input-dense" id="modal-contacto-emergencia-nombre" placeholder="Nombre contacto" value="${A(t.contacto_emergencia_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-contacto-emergencia-telefono" placeholder="+58 412 555 1234" value="${A(t.contacto_emergencia_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-contacto-emergencia-parentesco">
              ${va(t.contacto_emergencia_parentesco)}
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
            <input type="text" class="form-control input-dense" id="modal-familiar-nombre" placeholder="Nombre familiar" value="${A(t.familiar_nombre||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Teléfono</label>
            <input type="tel" class="form-control input-dense" id="modal-familiar-telefono-input" placeholder="+58 412 555 1234" value="${A(t.familiar_telefono||``)}">
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Parentesco</label>
            <select class="form-select input-dense" id="modal-familiar-parentesco-input">
              ${va(t.familiar_parentesco)}
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
            <textarea class="form-control input-dense" id="modal-condiciones-medicas" rows="2" placeholder="Diabetes, epilepsia, etc.">${A(t.condiciones_medicas||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Alergias</label>
            <textarea class="form-control input-dense" id="modal-alergias" rows="2" placeholder="Alimentos, medicamentos, etc.">${A(t.alergias||``)}</textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label-compact">Medicamentos</label>
            <textarea class="form-control input-dense" id="modal-medicamentos" rows="2" placeholder="Medicamentos actuales">${A(t.medicamentos||``)}</textarea>
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
  </form>`}async function ba(e,t=null){let n=e.querySelector(`#modal-nombre`).value.trim(),r=e.querySelector(`#modal-email`).value.trim().toLowerCase(),i=e.querySelector(`#modal-telefono`).value.trim(),a=e.querySelector(`#modal-cedula`).value.trim(),o=e.querySelector(`#modal-fechaNacimiento`).value,s=e.querySelector(`#modal-genero`).value,l=e.querySelector(`#modal-instrumento`).value.trim(),u=e.querySelector(`#modal-familiar-nombre`).value.trim(),d=e.querySelector(`#modal-familiar-telefono-input`).value.trim()||i,f=e.querySelector(`#modal-familiar-parentesco-input`).value,p=e.querySelector(`#modal-esActivo`).checked;return n?r&&!ia(r)?(c.error(`El email no tiene un formato válido`),null):l?i?{nombre:n,email:r||null,telefono:Ve(i)||i,cedula:a||null,fecha_nacimiento:o||null,genero:s||null,instrumento:l,is_active:p,familiar_nombre:u||null,familiar_telefono:Ve(d)||d||null,familiar_parentesco:f||null,contacto_emergencia_nombre:e.querySelector(`#modal-contacto-emergencia-nombre`).value.trim()||null,contacto_emergencia_telefono:Ve(e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim())||e.querySelector(`#modal-contacto-emergencia-telefono`).value.trim()||null,contacto_emergencia_parentesco:e.querySelector(`#modal-contacto-emergencia-parentesco`).value||null,condiciones_medicas:e.querySelector(`#modal-condiciones-medicas`).value.trim()||null,alergias:e.querySelector(`#modal-alergias`).value.trim()||null,medicamentos:e.querySelector(`#modal-medicamentos`).value.trim()||null}:(c.error(`El teléfono es obligatorio para WhatsApp`),null):(c.error(`El instrumento es obligatorio`),null):(c.error(`El nombre es obligatorio`),null)}function xa(){j.editando=null,_.open({title:`Crear Nuevo Alumno`,size:`lg`,body:ya(),saveText:`Guardar`,onSave:async e=>{let t=await ba(e);if(!t)return!1;let n=await Le(t);j.alumnosOriginales.push(n),_a(),c.success(`Alumno creado exitosamente`)}})}async function Sa(e){let t=e,n=j.alumnosOriginales.find(e=>e.id===t);if(!n){c.error(`Alumno no encontrado`);return}j.deletingId=t,_.open({title:`⚠️ Eliminar Alumno`,size:`md`,saveText:`Eliminar`,body:`<div class="d-flex flex-column align-items-center justify-content-center py-5">
             <div class="spinner-border text-primary mb-3" role="status">
               <span class="visually-hidden">Cargando...</span>
             </div>
             <p class="text-muted mb-0">Analizando estado de inscripciones...</p>
           </div>`,onSave:async()=>{await Ne(t),j.alumnosOriginales=j.alumnosOriginales.filter(e=>e.id!==t),_a(),_.close(),c.success(`Alumno eliminado correctamente`)}});let r=document.querySelector(`#app-global-modal .app-modal-btn-save`),i=document.querySelector(`#app-global-modal .app-modal-body`);r&&(r.style.display=`none`);try{if(j.deletingId!==t)return;let e=await Be(t);if(!i||j.deletingId!==t)return;r&&(r.style.display=``),e.length===0?i.innerHTML=`
        <div class="alert alert-success d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-4" style="background: rgba(40, 167, 69, 0.08); color: #155724;">
          <i class="bi bi-person-check-fill fs-3 text-success mt-1"></i>
          <div>
            <h6 class="alert-heading fw-bold mb-1" style="color: #0f6826;">Contacto Huérfano / Eliminación Segura</h6>
            <p class="mb-0 small" style="opacity: 0.9;">Este alumno no posee matrículas registradas ni está inscrito en ninguna clase activa en el período actual. Su eliminación no afectará datos académicos.</p>
          </div>
        </div>
        <p class="mb-2">¿Estás seguro de que querés eliminar permanentemente al alumno <strong>${A(n.nombre)}</strong>?</p>
        <p class="text-muted small mb-0"><i class="bi bi-info-circle me-1"></i> Esta acción es irreversible y limpiará todo su registro de contacto del sistema.</p>
      `:i.innerHTML=`
        <div class="alert alert-danger d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-4" style="background: rgba(220, 53, 69, 0.08); color: #721c24;">
          <i class="bi bi-exclamation-triangle-fill fs-3 text-danger mt-1"></i>
          <div>
            <h6 class="alert-heading fw-bold mb-1" style="color: #af232f;">¡Alumno con Clases Activas!</h6>
            <p class="mb-2 small" style="opacity: 0.9;">Este alumno está matriculado e inscrito en las siguientes clases del período actual:</p>
            <ul class="list-unstyled mb-2 ps-0" style="max-height: 150px; overflow-y: auto;">
              ${e.map(e=>`
        <li class="d-flex align-items-center gap-2 py-2 border-bottom border-light">
          <i class="bi bi-journal-bookmark-fill text-danger fs-5"></i>
          <span class="fw-semibold text-dark" style="font-size: 0.9rem;">${A(e.clase_nombre)}</span>
        </li>
      `).join(``)}
            </ul>
            <p class="mb-0 small fw-bold mt-2"><i class="bi bi-slash-circle-fill me-1"></i> ADVERTENCIA CRÍTICA: Eliminar a este alumno borrará físicamente su registro de asistencia, calificaciones históricas y matrículas activas.</p>
          </div>
        </div>
        <p class="mb-2">¿Realmente querés eliminar permanentemente al alumno <strong>${A(n.nombre)}</strong> y todos sus registros?</p>
        <p class="text-muted small mb-0"><i class="bi bi-exclamation-octagon-fill text-danger me-1"></i> Esta acción no se puede deshacer y puede provocar inconsistencias en los reportes de estas clases.</p>
      `}catch(e){if(console.error(e),j.deletingId!==t)return;i&&(r&&(r.style.display=``),i.innerHTML=`
        <div class="alert alert-warning d-flex align-items-start gap-3 border-0 rounded-4 p-3 mb-3">
          <i class="bi bi-exclamation-triangle-fill fs-4 text-warning"></i>
          <div>
            <h6 class="alert-heading fw-bold mb-1">Error de Verificación</h6>
            <p class="mb-0 small">No se pudo comprobar si el alumno tiene clases activas. Procedé con precaución.</p>
          </div>
        </div>
        <p>¿Querés eliminar al alumno <strong>${A(n.nombre)}</strong> de todas formas?</p>
      `)}}function Ca(){let e=oa.querySelector(`#alumnosTBody`);if(!e)return;j.alumnos.length===0?e.innerHTML=``:e.innerHTML=pa(j.alumnos);let t=oa.querySelector(`#emptyContainer`);t&&(t.innerHTML=j.alumnos.length===0?ma():``);let n=oa.querySelector(`.alumnos-header-premium p.text-muted`);n&&(n.textContent=`${j.alumnos.length} alumnos en total`)}function wa(){if(j.alumnosOriginales.length===0){c.error(`No hay alumnos para exportar`);return}let e=[[`Nombre`,`Email`,`Teléfono`,`Estado`,`Fecha Nac.`,`Instrumento`,`Cédula`,`Familiar`,`Municipio`],...j.alumnosOriginales.map(e=>[e.nombre||``,e.email||``,e.telefono_principal||e.telefono||``,e.is_active?`Activo`:`Inactivo`,e.fecha_nacimiento||``,e.instrumento_principal||``,e.cedula||``,e.familiar_nombre||``,e.municipio_residencia||``])].map(e=>e.map(e=>`"${String(e).replace(/"/g,`""`)}"`).join(`,`)).join(`
`),t=new Blob([`﻿`,e],{type:`text/csv;charset=utf-8;`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`alumnos-${new Date().toISOString().split(`T`)[0]}.csv`,n.click(),setTimeout(()=>URL.revokeObjectURL(n.href),100),c.success(`CSV exportado exitosamente`)}var Ta=[0,86,179],Ea=[255,193,7],Da=[30,30,30],Oa=[``,`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`];function ka(e,t=`—`){return String(e??``).trim()||t}function Aa(e){if(!e)return`—`;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,String(a)}catch{return`—`}}function ja(e){return{cantar:`Cantar`,instrumento:`Instrumento`,ambas:`Ambas`}[e]??ka(e)}function Ma(e,t,n){let r=e.internal.pageSize.getWidth();e.setFillColor(...Ta),e.rect(0,0,r,26,`F`),e.setFillColor(...Ea),e.rect(0,26,r,2,`F`),e.setTextColor(255,255,255),e.setFontSize(14),e.setFont(`helvetica`,`bold`),e.text(`El Sistema Punta Cana`,14,10),e.setFontSize(10),e.setFont(`helvetica`,`normal`),e.text(t,14,18),e.setFontSize(7.5),e.text(n,14,24),e.setTextColor(...Da)}function Na(e,t,n){let r=e.internal.pageSize.getWidth(),i=e.internal.pageSize.getHeight();e.setFillColor(...Ta),e.rect(0,i-8,r,8,`F`),e.setTextColor(255,255,255),e.setFontSize(6.5);let a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});e.text(`El Sistema Punta Cana — Generado: ${a}`,10,i-3),e.text(`Página ${t} de ${n}`,r-10,i-3,{align:`right`})}function Pa(e,t,n){let r=new ke({orientation:`landscape`,unit:`mm`,format:`letter`});r.internal.pageSize.getWidth();let i=`${Oa[n]} ${t}`,a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});Ma(r,`REPORTE DE INSCRIPCIONES — ${i.toUpperCase()}`,`Generado: ${a} · Total inscritos: ${e.length}`);let o=e.filter(e=>e.tiene_conocimientos_musicales===!0).length,s=e.filter(e=>e.tiene_conocimientos_musicales===!1||e.requiere_iniciacion_musical).length,c=e.filter(e=>e.beneficiario_subsidio_estado===!0).length,l=e.filter(e=>e.familia_monoparental===!0).length,u=e.filter(e=>e.autoriza_fotos_redes===!0).length;Ae(r,{startY:36,margin:{left:10,right:10},theme:`grid`,head:[[`Total inscritos`,`Con conocimientos`,`Requieren iniciación`,`Beneficiarios subsidio`,`Fam. monoparental`,`Autorizan fotos`]],body:[[e.length,o,s,c,l,u]],headStyles:{fillColor:Ta,textColor:255,fontStyle:`bold`,fontSize:8,halign:`center`},bodyStyles:{halign:`center`,fontSize:11,fontStyle:`bold`}}),Ae(r,{startY:r.lastAutoTable.finalY+6,margin:{left:10,right:10},theme:`striped`,head:[[`#`,`Nombre completo`,`Edad`,`Nac.`,`Municipio`,`Representante / Tlf`,`Interés`,`Instrumento`,`Iniciación`,`Pagó 600`]],body:e.map((e,t)=>[t+1,ka(e.nombre_completo),Aa(e.fecha_nacimiento),ka(e.nacionalidad),ka(e.municipio_residencia),ka(e.representante_nombre)+`
`+ka(e.representante_tlf),ja(e.interes_musical),ka(e.instrumento_interes),e.requiere_iniciacion_musical?`Sí`:`No`,e.acepta_pago_600?`Sí`:`No`]),headStyles:{fillColor:Ta,textColor:255,fontStyle:`bold`,fontSize:7.5},bodyStyles:{fontSize:7,cellPadding:1.5},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:7,halign:`center`},1:{cellWidth:42},2:{cellWidth:10,halign:`center`},3:{cellWidth:14},4:{cellWidth:20},5:{cellWidth:42},6:{cellWidth:16},7:{cellWidth:22},8:{cellWidth:15,halign:`center`},9:{cellWidth:14,halign:`center`}},didDrawPage:e=>{let t=r.internal.getNumberOfPages();Na(r,e.pageNumber,t)}}),e.length>0&&(r.addPage(),Ma(r,`PERFIL SOCIOCULTURAL — ${i.toUpperCase()}`,`Información motivacional y social de los alumnos inscritos`),Ae(r,{startY:36,margin:{left:10,right:10},theme:`striped`,head:[[`#`,`Nombre`,`Colegio`,`Grado`,`Padres en vida`,`Monopar.`,`Subsidio`,`¿Por qué se unió?`,`Músico favorito`]],body:e.map((e,t)=>[t+1,ka(e.nombre_completo),ka(e.centro_estudios),ka(e.grado_nivel),e.padres_en_vida===`ambos`?`Ambos`:e.padres_en_vida===`solo_madre`?`Solo madre`:e.padres_en_vida===`solo_padre`?`Solo padre`:e.padres_en_vida===`ninguno`?`Ninguno`:`—`,e.familia_monoparental?`Sí`:`No`,e.beneficiario_subsidio_estado?`Sí`:`No`,ka(e.por_que_unirse).slice(0,80)+(ka(e.por_que_unirse).length>80?`…`:``),ka(e.musico_favorito)]),headStyles:{fillColor:Ta,textColor:255,fontStyle:`bold`,fontSize:7.5},bodyStyles:{fontSize:7,cellPadding:1.5},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:7,halign:`center`},1:{cellWidth:38},2:{cellWidth:38},3:{cellWidth:16},4:{cellWidth:20},5:{cellWidth:14,halign:`center`},6:{cellWidth:14,halign:`center`},7:{cellWidth:55},8:{cellWidth:28}},didDrawPage:e=>{let t=r.internal.getNumberOfPages();Na(r,e.pageNumber,t)}}));let d=r.internal.getNumberOfPages();for(let e=1;e<=d;e++)r.setPage(e),Na(r,e,d);return r}function Fa(e,t,n){Pa(e,t,n).save(`reporte-inscripciones-${[``,`enero`,`febrero`,`marzo`,`abril`,`mayo`,`junio`,`julio`,`agosto`,`septiembre`,`octubre`,`noviembre`,`diciembre`][n]}-${t}.pdf`)}function Ia(e){return ze.map(t=>`<option value="${t.value}" ${t.value===e?`selected`:``}>${t.label}</option>`).join(``)}function La(e){let t=e||{};return`<form class="row g-3">
    <div class="col-12">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person me-1 text-primary"></i>Datos del Alumno</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre completo</label>
      <input type="text" class="form-control form-control-sm" id="ed-nombre" value="${t.nombre_completo||``}">
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
        ${Ia(t.representante_parentesco)}
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
  </form>`}function Ra(){let e=e=>document.getElementById(e),t=t=>e(t)?.value?.trim()||null,n=t=>e(t)?.checked??!1,r=e=>e!==null&&e!==``?e:null;return{fecha_nacimiento:t(`ed-fecha-nacimiento`),nacionalidad:t(`ed-nacionalidad`),municipio_residencia:t(`ed-municipio`),sector_calle_numero:t(`ed-direccion`),madre_nombre:t(`ed-madre-nombre`),madre_cedula:t(`ed-madre-cedula`),madre_tlf_whatsapp:r(t(`ed-madre-tlf`)),padre_nombre:t(`ed-padre-nombre`),padre_cedula:t(`ed-padre-cedula`),padre_tlf_whatsapp:r(t(`ed-padre-tlf`)),representante_nombre:t(`ed-rep-nombre`),representante_parentesco:t(`ed-rep-parentesco`),representante_tlf:r(t(`ed-rep-tlf`)),interes_musical:t(`ed-interes`),instrumento_interes:t(`ed-instrumento`),tiene_conocimientos_musicales:n(`ed-conocimientos`),centro_estudios:t(`ed-centro-estudios`),grado_nivel:t(`ed-grado`),acepta_pago_600:n(`ed-pago-600`),autoriza_fotos_redes:n(`ed-fotos-redes`),acepta_beca_4500:n(`ed-beca-4500`)}}async function za(e,{onSaved:t}={}){let n;try{n=await Ie(e)}catch{c.error(`Error al cargar datos del alumno`);return}_.open({title:`Editar: ${n.nombre_completo||`Alumno`}`,size:`xl`,saveText:`Guardar cambios`,body:La(n),onSave:async()=>{try{await Fe(e,Ra()),c.success(`Alumno actualizado correctamente`),t&&t()}catch(e){return c.error(e.message||`Error al guardar los cambios`),!1}}})}var Ba=[``,`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`];function Va(){let e=new Date,t=``;for(let n=0;n<24;n++){let r=new Date(e.getFullYear(),e.getMonth()-n,1),i=r.getFullYear(),a=r.getMonth()+1;t+=`<option value="${i}-${a}" ${n===0?`selected`:``}>${Ba[a]} ${i}</option>`}return t}function Ha(e){if(!e)return null;try{let[t,n,r]=e.split(`-`).map(Number),i=new Date,a=i.getFullYear()-t;return(i.getMonth()+1<n||i.getMonth()+1===n&&i.getDate()<r)&&a--,a}catch{return null}}function Ua(e){let t=Oi(e),n=t.camposCompletos.length,r=t.camposCompletos.length+t.camposFaltantes.length,i;return i=t.nivel===`completo`?`completa`:t.nivel===`bueno`||t.nivel===`parcial`?`casi_completa`:`incompleta`,{completados:n,total:r,porcentaje:t.porcentaje,camposFaltantes:t.camposFaltantes,estado:i}}function Wa(e,t){({completa:{rgb:`var(--bs-success-rgb)`,color:`var(--bs-success)`},casi_completa:{rgb:`var(--bs-warning-rgb)`,color:`var(--bs-warning)`},incompleta:{rgb:`var(--bs-danger-rgb)`,color:`var(--bs-danger)`}})[e];let n=e===`completa`?`Completa`:`${t}% — ${e===`casi_completa`?`Faltan campos`:`Incompleta`}`;return`<span class="badge border px-2 py-1"
            style="background-color: rgba(var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}-rgb), 0.12); color: var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}); border-color: rgba(var(--bs-${e===`completa`?`success`:e===`casi_completa`?`warning`:`danger`}-rgb), 0.3) !important;">
            <i class="bi ${e===`completa`?`bi-check-circle-fill`:e===`casi_completa`?`bi-exclamation-circle-fill`:`bi-x-circle-fill`} me-1"></i>${n}
          </span>`}function Ga(e){if(!e.length)return``;let t=e.length,n=e.filter(e=>Ua(e).estado===`completa`).length,r=e.filter(e=>Ua(e).estado===`incompleta`).length;return`
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
            <div class="fs-2 fw-bold text-warning-emphasis">${e.filter(e=>Ua(e).estado===`casi_completa`).length}</div>
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
    </div>`}function Ka(e){if(!e.length)return`<div class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>No hay alumnos inscritos en este período.
            </div>`;let t=e.map((e,t)=>{let{porcentaje:n,camposFaltantes:r,estado:i,completados:a,total:o}=Ua(e),s=e.representante_tlf||e.madre_tlf_whatsapp||`—`,c=Ha(e.fecha_nacimiento),l=c===null?``:`${c} años`,u=r.length>0?`<div class="d-flex flex-wrap gap-1 mt-1">
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
            ${Wa(i,n)}
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
    </div>`}function qa(e){e.addEventListener(`click`,e=>{let t=e.target.closest(`[data-alumno-id]`);if(!t)return;let n=t.dataset.alumnoId;if(!n)return;let r=t.closest(`#reporte-resultado`)?.querySelector(`#btn-filtrar`);za(n,{onSaved:()=>r?.click()})})}async function Ja(e){let t=new Date,n=t.getFullYear(),r=t.getMonth()+1,i=[];async function a(t,n){let r=e.querySelector(`#reporte-resultado`);r&&(r.innerHTML=`
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Cargando inscritos de ${Ba[n]} ${t}...</p>
      </div>`);try{i=await Pe(t,n),r&&(r.innerHTML=Ga(i)+Ka(i),qa(r));let a=e.querySelector(`#btn-descargar-pdf`);a&&(a.disabled=i.length===0,a.textContent=i.length>0?`Descargar PDF (${i.length} alumnos)`:`Sin inscritos`)}catch(e){console.error(e),r&&(r.innerHTML=`
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
                ${Va()}
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
    </div>`,e.querySelector(`#btn-filtrar`)?.addEventListener(`click`,()=>{let[t,i]=(e.querySelector(`#select-mes`)?.value??``).split(`-`).map(Number);t&&i&&(n=t,r=i,a(t,i))}),e.querySelector(`#btn-descargar-pdf`)?.addEventListener(`click`,()=>{try{Fa(i,n,r)}catch(e){console.error(`Error generando PDF:`,e),c.error(`Error al generar el PDF. Por favor intenta de nuevo.`)}}),a(n,r)}function Ya(e){return{currentStep:1,totalSteps:e,maxReachedStep:e,draft:{},errors:{},submitted:!1}}function Xa(e,t,n){if(e.currentStep>=e.totalSteps)return e;let r={...e.draft,...t};if(n){let{valid:t,errors:i}=n(r);if(!t)return{...e,draft:r,errors:i||{}}}let i=e.currentStep+1;return{...e,draft:r,errors:{},currentStep:i,maxReachedStep:Math.max(e.maxReachedStep,i)}}function Za(e){return e.currentStep<=1?{...e,errors:{}}:{...e,currentStep:e.currentStep-1,errors:{}}}function Qa(e,t){return t<1||t>e.maxReachedStep?e:{...e,currentStep:t,errors:{}}}function $a(e){return{...e,submitted:!0}}var eo=`wizard-inscripcion-draft`;function to(e){localStorage.setItem(eo,JSON.stringify(e))}function no(){let e=localStorage.getItem(eo);if(e===null)return null;try{return JSON.parse(e)}catch{return null}}function ro(){localStorage.removeItem(eo)}function io({currentStep:e,totalSteps:t}){let n=Math.round(e/t*100);return`
    <div class="progress mb-3" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del formulario">
      <div class="progress-bar" style="width: ${n}%">${n}%</div>
    </div>`}function ao({steps:e,currentStep:t,maxReachedStep:n}){return`<ul class="nav nav-pills nav-fill mb-3 flex-wrap">${e.map((e,r)=>{let i=r+1,a=i===t,o=i<=n,s=a?`active`:``,c=o?``:`disabled aria-disabled="true"`;return`
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
        </li>`}).join(``)}</ul>`}var oo={postulado:[`contactado`,`descartado`],contactado:[`cita_agendada`,`descartado`],cita_agendada:[`documentos_ok`,`no_show`,`descartado`],no_show:[`reprogramado`,`descartado`],reprogramado:[`cita_agendada`,`descartado`],documentos_ok:[`inscrito`,`en_espera`],en_espera:[`cita_agendada`,`descartado`],inscrito:[],descartado:[]},so={postulado:`Postulado`,contactado:`Contactado`,cita_agendada:`Cita agendada`,documentos_ok:`Documentos OK`,inscrito:`Inscrito`,no_show:`No show`,reprogramado:`Reprogramado`,en_espera:`En espera`,descartado:`Descartado`},co={postulado:`secondary`,contactado:`info`,cita_agendada:`primary`,documentos_ok:`warning`,inscrito:`success`,no_show:`danger`,reprogramado:`warning`,en_espera:`secondary`,descartado:`dark`};function lo(e,t){if(!e||!t)return!1;let n=oo[e];return n?n.includes(t):!1}function uo(e,t,n={}){if(!e)throw Error(`El postulante es requerido para aplicar la transición`);let r=e.estado||`postulado`;if(!lo(r,t))throw Error(`Transición inválida: no se puede pasar del estado "${r}" al estado "${t}"`);let i={...e,estado:t};return n.fecha_cita!==void 0&&(i.fecha_cita=n.fecha_cita),n.notas_seguimiento!==void 0&&(i.notas_seguimiento?i.notas_seguimiento=`${i.notas_seguimiento}\n${n.notas_seguimiento}`.trim():i.notas_seguimiento=n.notas_seguimiento),n.alumno_id!==void 0&&(i.alumno_id=n.alumno_id),t===`contactado`&&(i.fecha_contacto=new Date().toISOString()),i}async function fo(e){let{data:n,error:r}=await t.from(`postulantes`).select(`*`).eq(`id`,e).maybeSingle();if(r)throw console.error(`[postuladosSupabase] Error al obtener postulante:`,r),Error(`Error al obtener postulante: ${r.message}`);return n}async function po(e,n,r={}){try{let i=await fo(e);if(!i)throw Error(`Postulante con ID ${e} no encontrado`);let a=i.estado||`postulado`;if(!lo(a,n))throw Error(`Transición inválida: No se puede pasar de "${a}" a "${n}"`);let o={estado:n};r.fecha_cita!==void 0&&(o.fecha_cita=r.fecha_cita),r.notas_seguimiento!==void 0&&(i.notes||i.notas_seguimiento?o.notas_seguimiento=`${i.notas_seguimiento||i.notes||``}\n${r.notas_seguimiento}`.trim():o.notas_seguimiento=r.notas_seguimiento),r.alumno_id!==void 0&&(o.alumno_id=r.alumno_id),n===`contactado`&&(o.fecha_contacto=new Date().toISOString());let{data:s,error:c}=await t.from(`postulantes`).update(o).eq(`id`,e).select().single();if(c)throw console.error(`[postuladosSupabase] Error en update:`,c),c;return s}catch(e){throw console.error(`[postuladosSupabase] Error al actualizar estado:`,e.message),e}}async function mo(e,n){try{let r=new Date(e,n-1,1).toISOString(),i=new Date(e,n,1).toISOString(),{data:a,error:o}=await t.from(`postulantes`).select(`*`).gte(`created_at`,r).lt(`created_at`,i).order(`created_at`,{ascending:!1});if(o)throw console.error(`[postuladosSupabase] Error al listar por mes:`,o),o;return a??[]}catch(e){throw console.error(`[postuladosSupabase] Error en listarPostulantesPorMes:`,e.message),e}}async function ho(e,n){try{let{data:r,error:i}=await t.from(`postulantes`).select(`*`).gte(`created_at`,e).lte(`created_at`,n+`T23:59:59.999Z`).order(`created_at`,{ascending:!1});if(i)throw console.error(`[postuladosSupabase] Error al listar por rango:`,i),i;return r??[]}catch(e){throw console.error(`[postuladosSupabase] Error en listarPostulantesPorRango:`,e.message),e}}async function go(e,n){try{let{data:r,error:i}=await t.from(`postulantes`).select(`*`).gte(`fecha_cita`,e).lte(`fecha_cita`,n).not(`fecha_cita`,`is`,null).order(`fecha_cita`,{ascending:!0});if(i)throw console.error(`[postuladosSupabase] Error al listar citas:`,i),i;return r??[]}catch(e){throw console.error(`[postuladosSupabase] Error en listarCitas:`,e.message),e}}async function _o(e,n=null){try{let r=new Date(e).getTime();if(isNaN(r))throw Error(`Fecha/Hora de cita inválida`);let i=new Date(r-1800*1e3).toISOString(),a=new Date(r+1800*1e3).toISOString(),o=t.from(`postulantes`).select(`id, nombre_completo, fecha_cita`).gte(`fecha_cita`,i).lte(`fecha_cita`,a).not(`fecha_cita`,`is`,null);n&&(o=o.ne(`id`,n));let{data:s,error:c}=await o;if(c)throw console.error(`[postuladosSupabase] Error al verificar conflicto de cita:`,c),c;return(s??[]).length>0}catch(e){throw console.error(`[postuladosSupabase] Error en hayConflictoCita:`,e.message),e}}async function vo(e,n){try{if(!n||!n.trim())return;let r=await fo(e);if(!r)throw Error(`Postulante con ID ${e} no encontrado`);let i=r.notas_seguimiento||r.notes||``,a=i?`${i}\n${n}`.trim():n.trim(),{data:o,error:s}=await t.from(`postulantes`).update({notas_seguimiento:a}).eq(`id`,e).select().single();if(s)throw console.error(`[postuladosSupabase] Error al agregar nota:`,s),s;return o}catch(e){throw console.error(`[postuladosSupabase] Error en agregarNota:`,e.message),e}}async function yo(e){try{let{error:n}=await t.from(`postulantes`).delete().eq(`id`,e);if(n)throw console.error(`[postuladosSupabase] Error al eliminar postulante:`,n),n;return!0}catch(e){throw console.error(`[postuladosSupabase] Error en eliminarPostulante:`,e.message),e}}var bo=e({actualizarEstadoPostulante:()=>po,agregarNota:()=>vo,backfillDesdePostulantes:()=>Eo,buscarPostulante:()=>So,eliminarPostulante:()=>yo,hayConflictoCita:()=>_o,listarCitas:()=>go,listarPostulantes:()=>To,listarPostulantesPorMes:()=>mo,listarPostulantesPorRango:()=>ho,obtenerPostulante:()=>Co,sincronizarPostulantes:()=>wo});function xo(e){return(e??``).toLowerCase().replace(/\s+/g,` `).trim()}async function So(e){let n=xo(e);if(!n||n.length<2)return[];let{data:r,error:i}=await t.from(`postulantes`).select(`*`).or(`nombre_completo.ilike.*${n}*,telefono_alumno.ilike.*${n}*,madre_tlf_whatsapp.ilike.*${n}*,padre_tlf_whatsapp.ilike.*${n}*`).limit(20);if(i)throw console.error(`[postulantesSupabase] Error searching:`,i),i;let a=new Set;return(r??[]).filter(e=>{let t=`${e.nombre_completo||``}|${e.correo||``}`;return a.has(t)?!1:(a.add(t),!0)})}async function Co(e){let{data:n,error:r}=await t.from(`postulantes`).select(`*`).eq(`id`,e).maybeSingle();if(r)throw console.error(`[postulantesSupabase] Error fetching:`,r),r;return n}async function wo(){let{data:e,error:n}=await t.functions.invoke(`sync-postulantes`,{method:`POST`});if(n){console.error(`[postulantesSupabase] Error syncing:`,n);let e=n.context?.status??0,t=n.context?.body??{},r=Error(t?.error||n.message||`Error al sincronizar`);throw r.status=e,r}return e}async function To(){let{data:e,error:n}=await t.from(`postulantes`).select(`*`).order(`created_at`,{ascending:!1});if(n)throw console.error(`[postulantesSupabase] Error listing:`,n),n;return e??[]}async function Eo(e=!1){let{data:n,error:r}=await t.rpc(`backfill_alumnos_desde_postulantes`,{dry_run:e});if(r)throw console.error(`[postulantesSupabase] Error backfilling:`,r.message),Error(`Error al backfillear: ${r.message}`);return{success:!0,data:n??[],dry_run:e}}var Do=[{id:`post-001`,nombre_completo:`Marcos Merone Cocco`,fecha_nacimiento:`2015-08-30`,telefono_alumno:`8295577722`,correo:`elisabetta.cocco@hotmail.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Avenida real norte MC1-10-b`,madre_nombre:`Elisabetta Cocco`,madre_tlf_whatsapp:`8295577722`,padre_nombre:`Esnor Merone`,padre_tlf_whatsapp:``,representante_parentesco:`ambos`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-002`,nombre_completo:`Ana Pérez Guerrero`,fecha_nacimiento:`2017-03-15`,telefono_alumno:`8091112233`,correo:`ana.perez@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Los Robles #45`,madre_nombre:`María Guerrero`,madre_tlf_whatsapp:`8091112233`,padre_nombre:`Juan Pérez`,padre_tlf_whatsapp:`8091112234`,representante_parentesco:`madre`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Fines de semana`,tiene_transporte:!0,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-003`,nombre_completo:`Luis Gómez Rodríguez`,fecha_nacimiento:`2016-11-22`,telefono_alumno:`8297778899`,correo:`luis.gomez@example.com`,nacionalidad:`Venezolana`,sector_calle_numero:`Residencial Punta Cana, Edif 3 Apto 2B`,madre_nombre:`Carmen Rodríguez`,madre_tlf_whatsapp:`8297778899`,padre_nombre:`Pedro Gómez`,padre_tlf_whatsapp:``,representante_parentesco:`madre`,acepta_pago_600:!1,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!1,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-004`,nombre_completo:`María José López`,fecha_nacimiento:`2014-06-10`,telefono_alumno:`8493334455`,correo:`maria.lopez@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Principal #12, Verón`,madre_nombre:`Sofía López`,madre_tlf_whatsapp:`8493334455`,padre_nombre:`Carlos López`,padre_tlf_whatsapp:`8493334456`,representante_parentesco:`ambos`,acepta_pago_600:!0,autoriza_fotos_redes:!0,religion_limita:!1,disponibilidad_tiempo:`Tardes después de las 3pm`,tiene_transporte:!0,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`},{id:`post-005`,nombre_completo:`Juan García Marte`,fecha_nacimiento:`2018-01-05`,telefono_alumno:`8095556677`,correo:`juan.garcia@example.com`,nacionalidad:`Dominicana`,sector_calle_numero:`Calle Las Palmas #7, Bavaro`,madre_nombre:`Ana Marte`,madre_tlf_whatsapp:`8095556677`,padre_nombre:`Roberto García`,padre_tlf_whatsapp:``,representante_parentesco:`madre`,acepta_pago_600:!0,autoriza_fotos_redes:!1,religion_limita:!1,disponibilidad_tiempo:`Flexibilidad según la programación`,tiene_transporte:!1,representantes_apoyan:!0,copia_cedula:!0,sincronizado_en:`2026-05-28T00:00:00Z`,created_at:`2026-05-28T00:00:00Z`,updated_at:`2026-05-28T00:00:00Z`}],Oo=(e=50)=>new Promise(t=>setTimeout(t,e)),M=[...Do];function ko(){M=[...Do]}async function Ao(e,t,n={}){await Oo();let r=M.findIndex(t=>t.id===e);if(r===-1)throw Error(`Postulante con ID ${e} no encontrado`);let i=M[r],a=uo(i,t,n);return M[r]=a,a}async function jo(e,t){return await Oo(),M.filter(n=>{if(!n.created_at)return!1;let r=new Date(n.created_at);return r.getFullYear()===e&&r.getMonth()+1===t})}async function Mo(e,t){await Oo();let n=new Date(e).getTime(),r=new Date(t+`T23:59:59.999Z`).getTime();return M.filter(e=>{if(!e.created_at)return!1;let t=new Date(e.created_at).getTime();return t>=n&&t<=r}).sort((e,t)=>new Date(t.created_at)-new Date(e.created_at))}async function No(e,t){await Oo();let n=new Date(e).getTime(),r=new Date(t).getTime();return M.filter(e=>{if(!e.fecha_cita)return!1;let t=new Date(e.fecha_cita).getTime();return t>=n&&t<=r}).sort((e,t)=>new Date(e.fecha_cita)-new Date(t.fecha_cita))}async function Po(e,t=null){await Oo();let n=new Date(e).getTime();if(isNaN(n))throw Error(`Fecha/Hora de cita inválida`);return M.some(e=>{if(t&&e.id===t||!e.fecha_cita||e.estado!==`cita_agendada`&&e.estado!==`reprogramado`)return!1;let r=new Date(e.fecha_cita).getTime();return Math.abs(r-n)<=18e5})}async function Fo(e,t){await Oo();let n=M.findIndex(t=>t.id===e);if(n===-1)throw Error(`Postulante con ID ${e} no encontrado`);let r=M[n],i=r.notas_seguimiento||r.notes||``,a=i?`${i}\n${t}`.trim():t.trim(),o={...r,notas_seguimiento:a};return M[n]=o,o}async function Io(e){await Oo();let t=M.findIndex(t=>t.id===e);if(t===-1)throw Error(`Postulante con ID ${e} no encontrado`);return M.splice(t,1),!0}var Lo=e({actualizarEstadoPostulante:()=>Ao,agregarNota:()=>Fo,backfillDesdePostulantes:()=>Wo,buscarPostulante:()=>Bo,data:()=>M,eliminarPostulante:()=>Io,hayConflictoCita:()=>Po,listarCitas:()=>No,listarPostulantes:()=>Uo,listarPostulantesPorMes:()=>jo,listarPostulantesPorRango:()=>Mo,obtenerPostulante:()=>Vo,resetMockData:()=>ko,sincronizarPostulantes:()=>Ho}),Ro=(e=300)=>new Promise(t=>setTimeout(t,e));function zo(e){return(e??``).toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/\s+/g,` `).trim()}async function Bo(e){await Ro();let t=zo(e);return!t||t.length<2?[]:M.filter(e=>{let n=zo(e.nombre_completo),r=zo(e.telefono_alumno),i=zo(e.madre_tlf_whatsapp),a=zo(e.padre_tlf_whatsapp);return n.includes(t)||r.includes(t)||i.includes(t)||a.includes(t)})}async function Vo(e){return await Ro(100),M.find(t=>t.id===e)??null}async function Ho(){return await Ro(500),{status:`success`,total_rows:M.length,upserted:M.length,errors:0,timestamp:new Date().toISOString(),_mock:!0}}async function Uo(){return await Ro(),[...M]}async function Wo(e=!1){await Ro(400);let t=M.filter(e=>e.estado!==`inscrito`).map(t=>({alumno_id:`mock-`+t.id,alumno_nombre:t.nombre_completo,postulante_id:t.id,postulante_nombre:t.nombre_completo,match_tipo:`email`,campos_llenados:5,accion:e?`preview`:`updated`}));return e||t.forEach(e=>{let t=M.findIndex(t=>t.id===e.postulante_id);t!==-1&&(M[t]={...M[t],estado:`inscrito`,alumno_id:e.alumno_id})}),{success:!0,data:t,dry_run:e}}var Go=()=>p.isDemoMode?Lo:bo,Ko=(...e)=>Go().buscarPostulante(...e),qo=(...e)=>Go().obtenerPostulante(...e),Jo=(...e)=>Go().sincronizarPostulantes(...e),Yo=(...e)=>Go().backfillDesdePostulantes(...e),Xo=(...e)=>Go().actualizarEstadoPostulante(...e),Zo=(...e)=>Go().listarPostulantesPorMes(...e),Qo=(...e)=>Go().listarPostulantesPorRango(...e),$o=(...e)=>Go().listarCitas(...e),es=(...e)=>Go().hayConflictoCita(...e),ts=(...e)=>Go().agregarNota(...e),ns=(...e)=>Go().eliminarPostulante(...e);function rs(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`})}catch{return`—`}}function is(e){return e.estado===`inscrito`?`<span class="badge bg-success-subtle text-success-emphasis"><i class="bi bi-check-circle-fill me-1"></i>Inscrito</span>`:`<span class="badge bg-warning-subtle text-warning-emphasis"><i class="bi bi-clock me-1"></i>Pendiente</span>`}function as(e){return new Promise(t=>{if((()=>{try{return JSON.parse(localStorage.getItem(`wizard-inscripcion-draft`)||`null`)}catch{return null}})()?._postulante_id){t(null);return}let n=`pendiente`;e.innerHTML=`
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
        </div>`;try{let r=await Ko(e);if(n===`pendiente`&&(r=r.filter(e=>e.estado!==`inscrito`)),!r.length){o.innerHTML=`
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
                  ${is(e)}
                </div>

                <div class="small text-muted d-flex flex-wrap gap-3">
                  ${r?`<span><i class="bi bi-calendar3 me-1"></i>${rs(r)}</span>`:``}
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
        </div>`;try{let t=await Yo(e),n=t.data.length,r=t.data.filter(e=>e.campos_llenados>0).length,i=t.data.reduce((e,t)=>e+t.campos_llenados,0);if(e){ee.innerHTML=`
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
        </div>`:``}function re(e){if(!e)return`—`;let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}h.addEventListener(`click`,()=>te(!1)),g.addEventListener(`click`,()=>te(!0)),d.addEventListener(`click`,async()=>{d.disabled=!0,d.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Sincronizando...`;try{let e=await Jo();f.innerHTML=`
          <div class="alert alert-success py-2 mb-0">
            <i class="bi bi-check-circle me-1"></i>
            ${e.upserted} registros sincronizados (${e.total_rows} total). 0 errores.
          </div>`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Postulantes sincronizados: ${e.upserted} registros`,type:`success`}}))}catch(e){let t=e.status===401?`No tienes permisos de administrador para sincronizar.`:e.message||`Error al sincronizar`;f.innerHTML=`
          <div class="alert alert-danger py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i>${t}
          </div>`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:t,type:`danger`}}))}finally{d.disabled=!1,d.innerHTML=`<i class="bi bi-check2-circle me-1"></i>Sincronizar ahora`}})})}function os({currentStep:e,totalSteps:t,title:n,content:r,canGoPrev:i,canGoNext:a,isLastStep:o,isLastRequiredStep:s,isLastOptionalStep:c,isOptionalStep:l,steps:u,maxReachedStep:d}){return`
    <div class="wizard-inscripcion container-fluid py-3">
      ${io({currentStep:e,totalSteps:t})}
      ${ao({steps:u,currentStep:e,maxReachedStep:d})}
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
    </div>`}function ss(e,n,r,i){let a=i??n.length,o=no(),s=Ya(n.length);o&&(s={...s,draft:o});function c(){return n[s.currentStep-1]}function l(){let t=c(),r=s.currentStep,i=t.render(s.draft);e.innerHTML=os({currentStep:r,totalSteps:s.totalSteps,title:t.title,content:i,canGoPrev:r>1,canGoNext:!0,isLastStep:r===s.totalSteps,isLastRequiredStep:r===a,isLastOptionalStep:r===s.totalSteps&&r>a,isOptionalStep:r>a&&r<s.totalSteps,steps:n.map((e,t)=>({id:e.id,title:e.title,optional:t>=a})),maxReachedStep:s.maxReachedStep}),d()}async function u(n){n&&(n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`);try{let n=c().getState(e);s={...s,draft:{...s.draft,...n}};let i=await r({...s.draft,fecha_aceptacion_compromisos:new Date().toISOString()}),a=s.draft._postulante_id;if(a&&i?.id)try{await t.from(`postulantes`).update({estado:`inscrito`,alumno_id:i.id}).eq(`id`,a)}catch(e){console.warn(`[Wizard] Could not update postulante estado:`,e.message)}ro(),s=$a(s);let o={...s.draft,...i??{}};e.innerHTML=`
        <div class="card shadow-sm mt-4">
          <div class="card-body text-center py-4">
            <i class="bi bi-check-circle-fill text-success" style="font-size:3rem"></i>
            <h4 class="mt-3 text-success">¡Inscripción completada!</h4>
            <p class="text-muted mb-4">
              <strong>${o.nombre_completo??`El alumno`}</strong> ha sido registrado exitosamente en El Sistema Punta Cana.
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
        </div>`,e.querySelector(`#btn-pdf-ficha`)?.addEventListener(`click`,()=>{try{Zi(o)}catch(e){console.error(`Error generando ficha:`,e)}}),e.querySelector(`#btn-pdf-constancia`)?.addEventListener(`click`,()=>{try{Qi(o)}catch(e){console.error(`Error generando constancia:`,e)}})}catch{n&&(n.disabled=!1,n.innerHTML=n.dataset.label??`Finalizar`);let t=e.querySelector(`#wizard-step-slot`);if(t){let e=document.createElement(`div`);e.className=`alert alert-danger mt-3`,e.textContent=`Error al guardar. Por favor intenta de nuevo.`,t.after(e)}}}function d(){let t=e.querySelector(`#wiz-btn-prev`),n=e.querySelector(`#wiz-btn-next`),r=e.querySelector(`#wiz-btn-submit`),i=e.querySelector(`#wiz-btn-submit-basic`),a=e.querySelector(`#wiz-btn-draft`);t&&t.addEventListener(`click`,()=>{s=Za(s),l()}),n&&n.addEventListener(`click`,()=>{let t=c().getState(e);s=Xa(s,t),to(s.draft),l()}),r&&(r.dataset.label=r.textContent,r.addEventListener(`click`,()=>u(r))),i&&(i.dataset.label=i.textContent,i.addEventListener(`click`,()=>u(i))),a&&a.addEventListener(`click`,()=>{let t=c().getState(e);s={...s,draft:{...s.draft,...t}},to(s.draft),a.textContent=`¡Guardado!`,setTimeout(()=>{a.innerHTML=`<i class="bi bi-floppy"></i> Guardar borrador`},1500)}),e.querySelectorAll(`[data-step]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-step`),10),r=c().getState(e);s={...s,draft:{...s.draft,...r}},to(s.draft),s=Qa(s,n),l()})})}return as(e).then(e=>{e&&(s={...s,draft:{...s.draft,...e}}),l()}),{destroy(){e.innerHTML=``}}}function cs(e){return String(e??``).replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function ls(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function N(e){let{name:t,label:n,type:r=`text`,value:i=``,error:a=``,required:o=!1,placeholder:s=``,hint:c=``,options:l=[],readOnly:u=!1}=e,d=`wiz-${t}`,f=o?`required`:``,p=u?`readonly`:``,m=a?`is-invalid`:``,h=a?`<div class="invalid-feedback">${ls(a)}</div>`:``,g=c?`<div class="form-text">${ls(c)}</div>`:``;if(r===`select`){let e=l.map(e=>`<option value="${cs(e.value)}"${i===e.value?` selected`:``}>${ls(e.label)}</option>`).join(``);return`
      <div class="mb-3">
        <label for="${d}" class="form-label">${ls(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        <select id="${d}" name="${t}" class="form-select ${m}" ${f}>
          <option value="">Selecciona una opción</option>
          ${e}
        </select>
        ${h}${g}
      </div>`}if(r===`radio`){let e=l.map(e=>`
        <div class="form-check">
          <input class="form-check-input ${m}" type="radio" name="${t}" id="${d}-${cs(e.value)}" value="${cs(e.value)}"${i===e.value?` checked`:``} ${f}>
          <label class="form-check-label" for="${d}-${cs(e.value)}">${ls(e.label)}</label>
        </div>`).join(``);return`
      <div class="mb-3">
        <label class="form-label">${ls(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        ${e}
        ${a?`<div class="text-danger small">${ls(a)}</div>`:``}
        ${g}
      </div>`}return r===`checkbox`?`
      <div class="mb-3 form-check">
        <input class="form-check-input ${m}" type="checkbox" id="${d}" name="${t}"${i===!0||i===`true`?` checked`:``}>
        <label class="form-check-label" for="${d}">${ls(n)}</label>
        ${h}${g}
      </div>`:r===`textarea`?`
      <div class="mb-3">
        <label for="${d}" class="form-label">${ls(n)}${o?` <span class="text-danger">*</span>`:``}</label>
        <textarea id="${d}" name="${t}" class="form-control ${m}" placeholder="${cs(s)}" ${f} ${p} rows="3">${ls(i)}</textarea>
        ${h}${g}
      </div>`:`
    <div class="mb-3">
      <label for="${d}" class="form-label">${ls(n)}${o?` <span class="text-danger">*</span>`:``}</label>
      <input
        type="${cs(r)}"
        id="${d}"
        name="${t}"
        class="form-control ${m}"
        value="${cs(i)}"
        placeholder="${cs(s)}"
        ${f}
        ${p}
      >
      ${h}${g}
    </div>`}var us=/^https?:\/\/(www\.)?google\.com\/maps|^https?:\/\/goo\.gl\/maps/;function ds(e){return{valid:Object.keys(e).length===0,errors:e}}function fs(e){let t={};if((!e.nombre_completo||!e.nombre_completo.trim())&&(t.nombre_completo=`El nombre completo es requerido`),!e.fecha_nacimiento)t.fecha_nacimiento=`La fecha de nacimiento es requerida`;else{let n=new Date(e.fecha_nacimiento);isNaN(n.getTime())?t.fecha_nacimiento=`Fecha de nacimiento inválida`:n>new Date&&(t.fecha_nacimiento=`La fecha de nacimiento no puede ser en el futuro`)}return(!e.nacionalidad||!e.nacionalidad.trim())&&(t.nacionalidad=`La nacionalidad es requerida`),(!e.como_se_entero||!e.como_se_entero.trim())&&(t.como_se_entero=`Este campo es requerido`),(!e.direccion||!e.direccion.trim())&&(t.direccion=`La dirección es requerida`),e.ubicacion_maps_url&&e.ubicacion_maps_url.trim()&&(us.test(e.ubicacion_maps_url.trim())||(t.ubicacion_maps_url=`URL debe ser de Google Maps`)),ds(t)}var ps=e({getState:()=>vs,id:()=>ms,render:()=>gs,title:()=>hs,validate:()=>_s}),ms=`step1`,hs=`Datos del Alumno`;function gs(e,t={}){let n=e.fecha_nacimiento?(()=>{try{return na(e.fecha_nacimiento)}catch{return``}})():``;return`
    <form id="wiz-form-step1" novalidate>
      ${N({name:`nombre_completo`,label:`Nombre completo del alumno`,type:`text`,value:e.nombre_completo??``,error:t.nombre_completo??``,required:!0,hint:`Tal como aparece en el documento de identidad`})}

      <div class="row g-2">
        <div class="col-sm-8">
          ${N({name:`fecha_nacimiento`,label:`Fecha de nacimiento`,type:`date`,value:e.fecha_nacimiento??``,error:t.fecha_nacimiento??``,required:!0})}
        </div>
        <div class="col-sm-4">
          ${N({name:`edad_display`,label:`Edad actual`,type:`text`,value:n===``?`—`:n+` años`,readOnly:!0})}
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6">
          ${N({name:`sabe_leer`,label:`¿Sabe leer?`,type:`radio`,value:e.sabe_leer===!0?`true`:e.sabe_leer===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
        </div>
        <div class="col-6">
          ${N({name:`sabe_escribir`,label:`¿Sabe escribir?`,type:`radio`,value:e.sabe_escribir===!0?`true`:e.sabe_escribir===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
        </div>
      </div>

      <div class="row g-2">
        <div class="col-sm-8">
          ${N({name:`nacionalidad`,label:`Nacionalidad`,type:`text`,value:e.nacionalidad??``,error:t.nacionalidad??``,required:!0})}
        </div>
        <div class="col-sm-4">
          ${N({name:`tiene_pasaporte`,label:`¿Tiene pasaporte?`,type:`checkbox`,value:e.tiene_pasaporte??!1})}
        </div>
      </div>

      ${N({name:`como_se_entero`,label:`¿Cómo se enteró de El Sistema Punta Cana?`,type:`select`,value:e.como_se_entero??``,error:t.como_se_entero??``,required:!0,options:[{value:``,label:`Selecciona una opción...`},{value:`amigo_familiar`,label:`Un amigo o familiar`},{value:`redes_sociales`,label:`Redes sociales`},{value:`colegio`,label:`Colegio / Escuela`},{value:`iglesia`,label:`Iglesia`},{value:`vecino`,label:`Un vecino`},{value:`otro`,label:`Otro`}]})}

      ${N({name:`municipio_residencia`,label:`Municipio de residencia`,type:`select`,value:e.municipio_residencia??``,error:t.municipio_residencia??``,required:!0,options:[{value:``,label:`Selecciona...`},{value:`punta_cana`,label:`Punta Cana`},{value:`bavaro`,label:`Bávaro`},{value:`veron`,label:`Verón`},{value:`friusa`,label:`Friusa`},{value:`el_cortecito`,label:`El Cortecito`},{value:`los_corales`,label:`Los Corales`},{value:`otro`,label:`Otro sector / municipio`}]})}

      <div id="sector-calle-block" style="${e.municipio_residencia===`otro`?``:`display:none`}">
        ${N({name:`sector_calle_numero`,label:`Sector, Calle y Número`,type:`text`,value:e.sector_calle_numero??``,error:t.sector_calle_numero??``,hint:`Ej: Sector Los Pinos, Calle 3, #14`})}
      </div>

      ${N({name:`direccion`,label:`Dirección completa`,type:`textarea`,value:e.direccion??``,error:t.direccion??``,required:!0})}
      ${N({name:`ubicacion_maps_url`,label:`Enlace de Google Maps (opcional)`,type:`text`,value:e.ubicacion_maps_url??``,error:t.ubicacion_maps_url??``,hint:`Copia el enlace desde Google Maps para la ubicación exacta del hogar`})}
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
    <\/script>`}function _s(e){return fs(e)}function vs(e){let t=e?.querySelector(`#wiz-form-step1`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{nombre_completo:t.querySelector(`[name="nombre_completo"]`)?.value?.trim()??``,fecha_nacimiento:t.querySelector(`[name="fecha_nacimiento"]`)?.value??``,sabe_leer:n(`sabe_leer`),sabe_escribir:n(`sabe_escribir`),nacionalidad:t.querySelector(`[name="nacionalidad"]`)?.value?.trim()??``,tiene_pasaporte:t.querySelector(`[name="tiene_pasaporte"]`)?.checked??!1,como_se_entero:t.querySelector(`[name="como_se_entero"]`)?.value??``,municipio_residencia:t.querySelector(`[name="municipio_residencia"]`)?.value??``,sector_calle_numero:t.querySelector(`[name="sector_calle_numero"]`)?.value?.trim()??``,direccion:t.querySelector(`[name="direccion"]`)?.value?.trim()??``,ubicacion_maps_url:t.querySelector(`[name="ubicacion_maps_url"]`)?.value?.trim()??``}}var ys=e({getState:()=>ws,id:()=>bs,render:()=>Ss,title:()=>xs,validate:()=>Cs}),bs=`step2`,xs=`Datos de la Madre`;function Ss(e,t={}){return`
    <form id="wiz-form-step2" novalidate>
      <div class="alert alert-secondary py-2 mb-3">
        <i class="bi bi-person-heart me-1"></i>
        Ingresa los datos de la madre del alumno tal como aparecen en su documento de identidad.
        Si la madre no está en vida o no aplica, puedes dejar estos campos vacíos.
      </div>

      ${N({name:`madre_nombre`,label:`Nombre y apellido completo de la madre`,type:`text`,value:e.madre_nombre??``,error:t.madre_nombre??``,hint:`Tal como aparece en la cédula`})}
      ${N({name:`madre_cedula`,label:`Cédula / Pasaporte / Documento de identidad`,type:`text`,value:e.madre_cedula??``,error:t.madre_cedula??``,hint:`En su defecto, número de pasaporte o documento nacional`})}
      ${N({name:`madre_tlf_whatsapp`,label:`Número de WhatsApp de la madre`,type:`tel`,value:e.madre_tlf_whatsapp??``,error:t.madre_tlf_whatsapp??``,hint:`Número con código de país, Ej: +1 829 000 0000`})}
    </form>`}function Cs(e){return{valid:!0,errors:{}}}function ws(e){let t=e?.querySelector(`#wiz-form-step2`);return t?{madre_nombre:t.querySelector(`[name="madre_nombre"]`)?.value?.trim()??``,madre_cedula:t.querySelector(`[name="madre_cedula"]`)?.value?.trim()??``,madre_tlf_whatsapp:t.querySelector(`[name="madre_tlf_whatsapp"]`)?.value?.trim()??``}:{}}var Ts=e({getState:()=>As,id:()=>Es,render:()=>Os,title:()=>Ds,validate:()=>ks}),Es=`step3`,Ds=`Datos del Padre`;function Os(e,t={}){return`
    <form id="wiz-form-step3" novalidate>
      <div class="alert alert-secondary py-2 mb-3">
        <i class="bi bi-person-heart me-1"></i>
        Ingresa los datos del padre del alumno tal como aparecen en su documento de identidad.
        Si el padre no está en vida o no aplica, puedes dejar estos campos vacíos.
      </div>

      ${N({name:`padre_nombre`,label:`Nombre y apellido completo del padre`,type:`text`,value:e.padre_nombre??``,error:t.padre_nombre??``,hint:`Tal como aparece en la cédula`})}
      ${N({name:`padre_cedula`,label:`Cédula / Pasaporte / Documento de identidad`,type:`text`,value:e.padre_cedula??``,error:t.padre_cedula??``,hint:`En su defecto, número de pasaporte o documento nacional`})}
      ${N({name:`padre_tlf_whatsapp`,label:`Número de WhatsApp del padre`,type:`tel`,value:e.padre_tlf_whatsapp??``,error:t.padre_tlf_whatsapp??``,hint:`Número con código de país, Ej: +1 829 000 0000`})}
    </form>`}function ks(e){return{valid:!0,errors:{}}}function As(e){let t=e?.querySelector(`#wiz-form-step3`);return t?{padre_nombre:t.querySelector(`[name="padre_nombre"]`)?.value?.trim()??``,padre_cedula:t.querySelector(`[name="padre_cedula"]`)?.value?.trim()??``,padre_tlf_whatsapp:t.querySelector(`[name="padre_tlf_whatsapp"]`)?.value?.trim()??``}:{}}var js=e({getState:()=>Is,id:()=>Ms,render:()=>Ps,title:()=>Ns,validate:()=>Fs}),Ms=`step4`,Ns=`Representante y Entorno`;function Ps(e,t={}){let n=e.beneficiario_subsidio_estado===!0;return`
    <form id="wiz-form-step4" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-person-check me-1"></i>Representante oficial ante El Sistema PC</h6>
      ${N({name:`representante_nombre`,label:`Nombre y apellido completo`,type:`text`,value:e.representante_nombre??``,error:t.representante_nombre??``,required:!0,hint:`Tal como aparece en la cédula`})}
      <div class="row g-2">
        <div class="col-sm-6">
          ${N({name:`representante_parentesco`,label:`Parentesco con el alumno`,type:`text`,value:e.representante_parentesco??``,error:t.representante_parentesco??``,required:!0})}
        </div>
        <div class="col-sm-6">
          ${N({name:`representante_cedula`,label:`Cédula / Pasaporte`,type:`text`,value:e.representante_cedula??``,error:t.representante_cedula??``,required:!0})}
        </div>
      </div>
      ${N({name:`representante_tlf`,label:`Teléfono / WhatsApp del representante`,type:`tel`,value:e.representante_tlf??``,error:t.representante_tlf??``,required:!0})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-person-plus me-1"></i>Otro responsable (opcional)</h6>
      ${N({name:`otro_responsable_nombre`,label:`Nombre y apellido completo`,type:`text`,value:e.otro_responsable_nombre??``,error:t.otro_responsable_nombre??``,hint:`Tal como aparece en la cédula`})}
      <div class="row g-2">
        <div class="col-sm-6">
          ${N({name:`otro_responsable_cedula`,label:`Cédula / Pasaporte`,type:`text`,value:e.otro_responsable_cedula??``,error:t.otro_responsable_cedula??``})}
        </div>
        <div class="col-sm-6">
          ${N({name:`otro_responsable_tlf`,label:`Teléfono (si tiene)`,type:`tel`,value:e.otro_responsable_tlf??``,error:t.otro_responsable_tlf??``})}
        </div>
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-telephone-fill me-1"></i>Contactos de emergencia</h6>
      <div class="row g-2">
        <div class="col-sm-8">
          ${N({name:`contacto_emergencia_nombre`,label:`Contacto de emergencia #1`,type:`text`,value:e.contacto_emergencia_nombre??``})}
        </div>
        <div class="col-sm-4">
          ${N({name:`contacto_emergencia_telefono`,label:`Teléfono`,type:`tel`,value:e.contacto_emergencia_telefono??``})}
        </div>
      </div>
      <div class="row g-2">
        <div class="col-sm-8">
          ${N({name:`contacto_emergencia_2_nombre`,label:`Contacto de emergencia #2`,type:`text`,value:e.contacto_emergencia_2_nombre??``})}
        </div>
        <div class="col-sm-4">
          ${N({name:`contacto_emergencia_2_telefono`,label:`Teléfono`,type:`tel`,value:e.contacto_emergencia_2_telefono??``})}
        </div>
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-house-heart me-1"></i>Situación familiar y social</h6>

      ${N({name:`familia_monoparental`,label:`¿El alumno pertenece a una familia monoparental (sin padre o sin madre)?`,type:`radio`,value:e.familia_monoparental===!0?`true`:e.familia_monoparental===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      ${N({name:`beneficiario_subsidio_estado`,label:`¿Algún miembro del hogar es beneficiario de un subsidio del Estado?`,type:`radio`,value:n?`true`:e.beneficiario_subsidio_estado===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      <div id="subsidio-block" style="${n?``:`display:none`}">
        ${N({name:`subsidio_descripcion`,label:`¿Qué tipo de subsidio? (adjunte prueba de beneficio al momento de inscripción)`,type:`textarea`,value:e.subsidio_descripcion??``,hint:`Ej: Supérate, Progresando con Solidaridad, SIUBEN...`})}
      </div>

      ${N({name:`apoyo_actividades`,label:`¿De qué forma el hogar podría apoyar las actividades de El Sistema Punta Cana?`,type:`textarea`,value:e.apoyo_actividades??``,hint:`Ej: transporte, logística, voluntariado, donaciones, etc.`})}
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
    <\/script>`}function Fs(e){let t={};return e.representante_nombre?.trim()||(t.representante_nombre=`Campo requerido`),e.representante_parentesco?.trim()||(t.representante_parentesco=`Campo requerido`),e.representante_cedula?.trim()||(t.representante_cedula=`Campo requerido`),e.representante_tlf?.trim()||(t.representante_tlf=`Campo requerido`),{valid:Object.keys(t).length===0,errors:t}}function Is(e){let t=e?.querySelector(`#wiz-form-step4`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{representante_nombre:t.querySelector(`[name="representante_nombre"]`)?.value?.trim()??``,representante_parentesco:t.querySelector(`[name="representante_parentesco"]`)?.value?.trim()??``,representante_cedula:t.querySelector(`[name="representante_cedula"]`)?.value?.trim()??``,representante_tlf:t.querySelector(`[name="representante_tlf"]`)?.value?.trim()??``,otro_responsable_nombre:t.querySelector(`[name="otro_responsable_nombre"]`)?.value?.trim()??``,otro_responsable_cedula:t.querySelector(`[name="otro_responsable_cedula"]`)?.value?.trim()??``,otro_responsable_tlf:t.querySelector(`[name="otro_responsable_tlf"]`)?.value?.trim()??``,contacto_emergencia_nombre:t.querySelector(`[name="contacto_emergencia_nombre"]`)?.value?.trim()??``,contacto_emergencia_telefono:t.querySelector(`[name="contacto_emergencia_telefono"]`)?.value?.trim()??``,contacto_emergencia_2_nombre:t.querySelector(`[name="contacto_emergencia_2_nombre"]`)?.value?.trim()??``,contacto_emergencia_2_telefono:t.querySelector(`[name="contacto_emergencia_2_telefono"]`)?.value?.trim()??``,familia_monoparental:n(`familia_monoparental`),beneficiario_subsidio_estado:n(`beneficiario_subsidio_estado`),subsidio_descripcion:t.querySelector(`[name="subsidio_descripcion"]`)?.value?.trim()??``,apoyo_actividades:t.querySelector(`[name="apoyo_actividades"]`)?.value?.trim()??``}}var Ls=e({getState:()=>Hs,id:()=>Rs,render:()=>Bs,title:()=>zs,validate:()=>Vs}),Rs=`step7`,zs=`Compromisos`;function Bs(e,t={}){return`
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
        ${N({name:`acepta_beca_4500`,label:`Estoy consciente de que el alumno recibe una beca de RD$4,500 y que solo pagaré RD$600 mensuales, siempre que el rendimiento, interés y asistencia sean notables.`,type:`checkbox`,value:e.acepta_beca_4500??!1,error:t.acepta_beca_4500??``})}
      </div>

      <div class="mb-3 p-3 bg-light rounded">
        ${N({name:`acepta_pago_600`,label:`Me comprometo a realizar el aporte mensual de RD$600 de manera responsable y puntual.`,type:`checkbox`,value:e.acepta_pago_600??!1,error:t.acepta_pago_600??``})}
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold mb-3"><i class="bi bi-camera me-1"></i>Autorización de imagen</h6>
      <div class="mb-3 p-3 bg-light rounded">
        ${N({name:`autoriza_fotos_redes`,label:`Autorizo a "El Sistema Punta Cana" a compartir por redes sociales y/o medios de comunicación fotos y videos donde pueda aparecer el rostro del alumno.`,type:`checkbox`,value:e.autoriza_fotos_redes??!1,error:t.autoriza_fotos_redes??``})}
      </div>

    </form>`}function Vs(e){let t={};return e.acepta_beca_4500||(t.acepta_beca_4500=`Debe aceptar los términos de la beca para continuar`),e.acepta_pago_600||(t.acepta_pago_600=`Debe comprometerse con el aporte mensual para continuar`),{valid:Object.keys(t).length===0,errors:t}}function Hs(e){let t=e?.querySelector(`#wiz-form-step7`);return t?{acepta_beca_4500:t.querySelector(`[name="acepta_beca_4500"]`)?.checked??!1,acepta_pago_600:t.querySelector(`[name="acepta_pago_600"]`)?.checked??!1,autoriza_fotos_redes:t.querySelector(`[name="autoriza_fotos_redes"]`)?.checked??!1}:{}}var Us=e({getState:()=>Js,id:()=>Ws,render:()=>Ks,title:()=>Gs,validate:()=>qs}),Ws=`step5`,Gs=`Perfil Musical`;function Ks(e,t={}){let n=e.tiene_conocimientos_musicales===!0;return`
    <form id="wiz-form-step5" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-music-note-beamed me-1"></i>Conocimientos musicales</h6>

      ${N({name:`tiene_conocimientos_musicales`,label:`¿Has aprendido a tocar algún instrumento musical antes?`,type:`radio`,value:n?`true`:e.tiene_conocimientos_musicales===!1?`false`:``,error:t.tiene_conocimientos_musicales??``,required:!0,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      <div id="conocimientos-block" style="${n?``:`display:none`}">
        ${N({name:`instrumento_previo`,label:`¿Qué instrumento has tocado?`,type:`text`,value:e.instrumento_previo??``,error:t.instrumento_previo??``})}
        ${N({name:`nivel_lectura_musical`,label:`Nivel de lectura musical`,type:`select`,value:e.nivel_lectura_musical??``,error:t.nivel_lectura_musical??``,options:[{value:``,label:`Selecciona...`},{value:`basico`,label:`Básico — conozco pocas notas`},{value:`intermedio`,label:`Intermedio — leo partituras simples`},{value:`avanzado`,label:`Avanzado — leo con fluidez`}]})}
      </div>

      <div id="iniciacion-block" style="${n?`display:none`:``}">
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-1"></i>
          <strong>Iniciación musical:</strong> El alumno recibirá una clase obligatoria de iniciación musical durante los primeros <strong>6 meses</strong>.
          A los 3 meses podrá audicionarse para avanzar al semestre completo del programa.
        </div>
      </div>

      ${N({name:`interes_musical`,label:`¿Qué te interesa aprender?`,type:`radio`,value:e.interes_musical??``,error:t.interes_musical??``,required:!0,options:[{value:`cantar`,label:`Cantar`},{value:`instrumento`,label:`Tocar un instrumento`},{value:`ambas`,label:`Ambas cosas`}]})}

      ${N({name:`instrumento_interes`,label:`¿Qué instrumento te gustaría tocar?`,type:`text`,value:e.instrumento_interes??``,error:t.instrumento_interes??``,hint:`Ej: violín, flauta, cello, piano, trompeta...`})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-heart-pulse me-1"></i>Tu relación con la música</h6>

      ${N({name:`sentimiento_musica_clasica`,label:`¿Qué sientes cuando escuchas música clásica?`,type:`textarea`,value:e.sentimiento_musica_clasica??``,hint:`Responde con tus propias palabras, no hay respuesta incorrecta`})}
      ${N({name:`sentimiento_aprender_instrumento`,label:`¿Cómo te sientes cuando piensas en aprender un instrumento?`,type:`textarea`,value:e.sentimiento_aprender_instrumento??``})}
      ${N({name:`aspiracion_instrumento`,label:`¿Qué te gustaría hacer si aprendes a tocar un instrumento?`,type:`textarea`,value:e.aspiracion_instrumento??``})}
      ${N({name:`musico_favorito`,label:`¿Tienes algún músico o cantante favorito?`,type:`text`,value:e.musico_favorito??``})}

      ${N({name:`preferencia_aprendizaje_musical`,label:`¿Cómo prefieres aprender música?`,type:`select`,value:e.preferencia_aprendizaje_musical??``,options:[{value:``,label:`Selecciona...`},{value:`individual`,label:`Clases individuales (uno a uno con el maestro)`},{value:`grupal`,label:`Clases en grupo`},{value:`ambas`,label:`Me es igual, ambas formas`},{value:`autodidacta`,label:`Prefiero aprender por mi cuenta también`}]})}

      ${N({name:`por_que_unirse`,label:`¿Por qué deseas formar parte de "El Sistema Punta Cana"?`,type:`textarea`,value:e.por_que_unirse??``,hint:`Cuéntanos tu motivación para unirte al programa`})}

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
    <\/script>`}function qs(e){let t={};return(e.tiene_conocimientos_musicales===void 0||e.tiene_conocimientos_musicales===null)&&(t.tiene_conocimientos_musicales=`Indica si tiene conocimientos musicales`),e.interes_musical||(t.interes_musical=`Indica el interés musical`),{valid:Object.keys(t).length===0,errors:t}}function Js(e){let t=e?.querySelector(`#wiz-form-step5`);return t?{tiene_conocimientos_musicales:(e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`})(`tiene_conocimientos_musicales`),instrumento_previo:t.querySelector(`[name="instrumento_previo"]`)?.value?.trim()??null,nivel_lectura_musical:t.querySelector(`[name="nivel_lectura_musical"]`)?.value||null,interes_musical:t.querySelector(`[name="interes_musical"]:checked`)?.value??``,instrumento_interes:t.querySelector(`[name="instrumento_interes"]`)?.value?.trim()??``,sentimiento_musica_clasica:t.querySelector(`[name="sentimiento_musica_clasica"]`)?.value?.trim()??``,sentimiento_aprender_instrumento:t.querySelector(`[name="sentimiento_aprender_instrumento"]`)?.value?.trim()??``,aspiracion_instrumento:t.querySelector(`[name="aspiracion_instrumento"]`)?.value?.trim()??``,musico_favorito:t.querySelector(`[name="musico_favorito"]`)?.value?.trim()??``,preferencia_aprendizaje_musical:t.querySelector(`[name="preferencia_aprendizaje_musical"]`)?.value??``,por_que_unirse:t.querySelector(`[name="por_que_unirse"]`)?.value?.trim()??``}:{}}var Ys=e({getState:()=>ec,id:()=>Xs,render:()=>Qs,title:()=>Zs,validate:()=>$s}),Xs=`step6`,Zs=`Salud y Educación`;function Qs(e,t={}){let n=e.tiene_alergias===!0,r=e.tiene_condicion_transmisible===!0,i=e.tiene_alergia_medicamento===!0;return`
    <form id="wiz-form-step6" novalidate>

      <h6 class="fw-semibold text-primary mb-3"><i class="bi bi-heart-pulse me-1"></i>Información de salud</h6>

      ${N({name:`tiene_alergias`,label:`¿El alumno es alérgico a algo?`,type:`radio`,value:n?`true`:e.tiene_alergias===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="alergias-block" style="${n?``:`display:none`}">
        ${N({name:`alergias_descripcion`,label:`¿A qué es alérgico?`,type:`textarea`,value:e.alergias_descripcion??``})}
      </div>

      ${N({name:`tiene_condicion_transmisible`,label:`¿El alumno padece alguna condición médica transmisible?`,type:`radio`,value:r?`true`:e.tiene_condicion_transmisible===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="condicion-block" style="${r?``:`display:none`}">
        ${N({name:`condicion_transmisible_desc`,label:`¿Cuál condición?`,type:`textarea`,value:e.condicion_transmisible_desc??``})}
      </div>

      ${N({name:`tiene_alergia_medicamento`,label:`¿El alumno es alérgico a algún medicamento?`,type:`radio`,value:i?`true`:e.tiene_alergia_medicamento===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}
      <div id="med-block" style="${i?``:`display:none`}">
        ${N({name:`alergia_medicamento_desc`,label:`¿A qué medicamento?`,type:`textarea`,value:e.alergia_medicamento_desc??``})}
      </div>

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-people me-1"></i>Socialización y conducta</h6>

      ${N({name:`impedimento_social`,label:`¿El alumno tiene alguna condición especial que le impida socializar?`,type:`radio`,value:e.impedimento_social===!0?`true`:e.impedimento_social===!1?`false`:``,options:[{value:`true`,label:`Sí`},{value:`false`,label:`No`}]})}

      ${N({name:`problemas_conducta`,label:`¿Presenta problemas de conducta?`,type:`select`,value:e.problemas_conducta??``,error:t.problemas_conducta??``,options:[{value:``,label:`Selecciona...`},{value:`no`,label:`No presenta problemas`},{value:`pocas_veces`,label:`Pocas veces`},{value:`si`,label:`Sí`},{value:`violento`,label:`Presenta conducta violenta`}]})}

      <hr class="my-3">
      <h6 class="fw-semibold text-secondary mb-3"><i class="bi bi-book me-1"></i>Datos escolares</h6>

      ${N({name:`centro_estudios`,label:`¿En dónde estudia actualmente?`,type:`text`,value:e.centro_estudios??``,error:t.centro_estudios??``,hint:`Nombre del colegio o escuela`})}
      ${N({name:`grado_nivel`,label:`Grado o nivel escolar`,type:`text`,value:e.grado_nivel??``,hint:`Ej: 4to grado primaria, 2do bachillerato...`})}

      ${N({name:`padres_en_vida`,label:`¿Los dos padres del alumno están en vida?`,type:`select`,value:e.padres_en_vida??``,error:t.padres_en_vida??``,options:[{value:``,label:`Selecciona...`},{value:`ambos`,label:`Sí, ambos`},{value:`solo_madre`,label:`Solo la madre`},{value:`solo_padre`,label:`Solo el padre`},{value:`ninguno`,label:`Ninguno`}]})}

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
    <\/script>`}function $s(e){return{valid:!0,errors:{}}}function ec(e){let t=e?.querySelector(`#wiz-form-step6`);if(!t)return{};let n=e=>{let n=t.querySelector(`[name="${e}"]:checked`);if(n)return n.value===`true`};return{tiene_alergias:n(`tiene_alergias`),alergias_descripcion:t.querySelector(`[name="alergias_descripcion"]`)?.value?.trim()??``,tiene_condicion_transmisible:n(`tiene_condicion_transmisible`),condicion_transmisible_desc:t.querySelector(`[name="condicion_transmisible_desc"]`)?.value?.trim()??``,tiene_alergia_medicamento:n(`tiene_alergia_medicamento`),alergia_medicamento_desc:t.querySelector(`[name="alergia_medicamento_desc"]`)?.value?.trim()??``,impedimento_social:n(`impedimento_social`),problemas_conducta:t.querySelector(`[name="problemas_conducta"]`)?.value??``,centro_estudios:t.querySelector(`[name="centro_estudios"]`)?.value?.trim()??``,grado_nivel:t.querySelector(`[name="grado_nivel"]`)?.value?.trim()??``,padres_en_vida:t.querySelector(`[name="padres_en_vida"]`)?.value??``}}var tc=[ps,ys,Ts,js,Ls,Us,Ys];async function nc(e){e.innerHTML=`
    <div class="d-flex align-items-center gap-3 px-3 py-2 bg-white border-bottom" id="inscribir-header">
      <button class="btn btn-sm btn-outline-secondary" id="btn-inscribir-back">
        <i class="bi bi-arrow-left"></i> Volver
      </button>
      <div class="flex-grow-1">
        <div class="fw-semibold small text-muted text-uppercase" style="letter-spacing:0.05em;">Inscribir alumno</div>
        <div class="fs-6 fw-bold" id="inscribir-alumno-name">Nuevo alumno</div>
      </div>
    </div>
    <div id="inscribir-wizard-mount"></div>
  `;let t=e.querySelector(`#inscribir-wizard-mount`),n=e.querySelector(`#inscribir-alumno-name`);e.querySelector(`#btn-inscribir-back`)?.addEventListener(`click`,()=>{window.router?.back?.()||window.router?.navigate(`alumnos`)}),t.addEventListener(`input`,()=>{let e=t.querySelector(`[name="nombre_completo"]`)?.value?.trim();n&&(n.textContent=e||`Nuevo alumno`)});async function r(e){return await Le(e)}ss(t,tc,r,5)}function rc(e){let{porcentaje:t,nivel:n,camposFaltantes:r,porGrupo:i}=Oi(e),a=ki[n],o=Ai[n];if(n===`completo`)return``;let s=Object.entries(i).filter(([,e])=>e.faltantes.length>0).map(([e,t])=>`
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
    </div>`}function ic(e){if(!e)return[];let t=String(e).match(/\d[\d\s.-]{6,}\d/g);return t?t.map(e=>e.replace(/[\s.-]/g,``)).filter(e=>e.length>=7):[e.trim()]}function ac(e){return e==null||e===``?`<span class="text-muted fst-italic small">—</span>`:A(String(e))}function oc(e){return e===!0||e===`true`||e===1||e===`1`?`Sí`:e===!1||e===`false`||e===0||e===`0`?`No`:`<span class="text-muted fst-italic small">—</span>`}function sc(e){if(!e)return`<span class="text-muted fst-italic small">—</span>`;let t=ic(e);if(t.length<=1){let t=Ue(e)||A(e),n=He(e),r=n?` <a href="${A(n)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-0 ms-1" title="WhatsApp"><i class="bi bi-whatsapp"></i></a>`:``;return`<span>${A(t)}</span>${r}`}return t.map((e,t)=>{let n=Ue(e)||e,r=He(e),i=r?`<a href="${A(r)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-0 ms-1" title="WhatsApp ${t+1}"><i class="bi bi-whatsapp"></i></a>`:``;return`<span class="me-2">${A(n)}${i}</span>`}).join(`<span class="text-muted mx-1">·</span>`)}var cc={personal:[{key:`nombre_completo`,label:`Nombre completo`},{key:`fecha_nacimiento`,label:`Fecha de nacimiento`,type:`date`},{key:`genero`,label:`Género`,type:`select`,options:[{v:``,l:`—`},{v:`M`,l:`Masculino`},{v:`F`,l:`Femenino`},{v:`O`,l:`Otro`}]},{key:`nacionalidad`,label:`Nacionalidad`},{key:`tiene_pasaporte`,label:`Tiene pasaporte`,type:`checkbox`},{key:`sabe_leer`,label:`Sabe leer`,type:`checkbox`},{key:`sabe_escribir`,label:`Sabe escribir`,type:`checkbox`},{key:`como_se_entero`,label:`Cómo se enteró`},{key:`municipio_residencia`,label:`Municipio`},{key:`sector_calle_numero`,label:`Sector / Calle / Número`},{key:`direccion`,label:`Dirección completa`,type:`textarea`},{key:`ubicacion_maps_url`,label:`URL Google Maps`},{key:`activo`,label:`Alumno activo`,type:`checkbox`}],madre:[{key:`madre_nombre`,label:`Nombre`},{key:`madre_cedula`,label:`Cédula`},{key:`madre_tlf_whatsapp`,label:`Teléfono / WhatsApp`,type:`phone`}],padre:[{key:`padre_nombre`,label:`Nombre`},{key:`padre_cedula`,label:`Cédula`},{key:`padre_tlf_whatsapp`,label:`Teléfono / WhatsApp`,type:`phone`}],representante:[{key:`representante_nombre`,label:`Nombre`},{key:`representante_parentesco`,label:`Parentesco`},{key:`representante_cedula`,label:`Cédula`},{key:`representante_tlf`,label:`Teléfono`,type:`phone`},{key:`correo_representante`,label:`Correo electrónico`},{key:`otro_responsable_nombre`,label:`Otro responsable — Nombre`},{key:`otro_responsable_cedula`,label:`Otro responsable — Cédula`},{key:`otro_responsable_tlf`,label:`Otro responsable — Teléfono`,type:`phone`},{key:`contacto_emergencia_nombre`,label:`Emergencia — Nombre`},{key:`contacto_emergencia_telefono`,label:`Emergencia — Teléfono`,type:`phone`},{key:`beneficiario_subsidio_estado`,label:`Beneficiario subsidio`,type:`checkbox`},{key:`subsidio_descripcion`,label:`Descripción subsidio`,type:`textarea`},{key:`apoyo_actividades`,label:`Apoyo en actividades`,type:`textarea`}],salud:[{key:`tiene_alergias`,label:`Tiene alergias`,type:`checkbox`},{key:`alergias_descripcion`,label:`Descripción alergias`,type:`textarea`},{key:`tiene_condicion_transmisible`,label:`Tiene condición transmisible`,type:`checkbox`},{key:`condicion_transmisible_desc`,label:`Descripción condición`,type:`textarea`},{key:`tiene_alergia_medicamento`,label:`Tiene alergia a medicamento`,type:`checkbox`},{key:`alergia_medicamento_desc`,label:`Descripción alergia medicamento`,type:`textarea`},{key:`impedimento_social`,label:`Impedimento social`,type:`checkbox`},{key:`problemas_conducta`,label:`Problemas de conducta`},{key:`centro_estudios`,label:`Centro de estudios`},{key:`grado_nivel`,label:`Grado / Nivel`},{key:`padres_en_vida`,label:`Padres en vida`}],musical:[{key:`instrumento_principal`,label:`Instrumento principal`},{key:`nivel_actual`,label:`Nivel actual`},{key:`tiene_conocimientos_musicales`,label:`Tiene conocimientos musicales`,type:`checkbox`},{key:`instrumento_previo`,label:`Instrumento previo`},{key:`nivel_lectura_musical`,label:`Nivel de lectura musical`},{key:`interes_musical`,label:`Interés musical`},{key:`instrumento_interes`,label:`Instrumento de interés`},{key:`sentimiento_musica_clasica`,label:`Sentimiento hacia música clásica`,type:`textarea`},{key:`sentimiento_aprender_instrumento`,label:`Sentimiento al aprender instrumento`,type:`textarea`},{key:`aspiracion_instrumento`,label:`Aspiración con el instrumento`,type:`textarea`},{key:`musico_favorito`,label:`Músico favorito`},{key:`preferencia_aprendizaje_musical`,label:`Preferencia de aprendizaje`,type:`textarea`},{key:`por_que_unirse`,label:`Por qué unirse`,type:`textarea`},{key:`autoriza_fotos_redes`,label:`Autoriza fotos en redes`,type:`checkbox`}]},lc={personal:`Personal`,madre:`Madre`,padre:`Padre`,representante:`Representante`,salud:`Salud`,musical:`Musical`,clases:`Clases`,progreso:`Progreso`,asistencias:`Asistencias`};function uc(e,t){let n=t[e.key];return e.type===`checkbox`?oc(n):e.type===`phone`?sc(n):e.type===`date`?ac(n?ra(n):null):ac(n)}function dc(e,t){return e.map(e=>`
    <div class="row mb-2 align-items-start">
      <div class="col-5 col-md-4 text-muted small fw-semibold">${A(e.label)}</div>
      <div class="col-7 col-md-8">${uc(e,t)}</div>
    </div>
  `).join(``)}function fc(e,t){let n=t[e.key],r=`modal-field-${e.key}`;if(e.type===`checkbox`){let t=n===!0||n===`true`||n===1||n===`1`?`checked`:``;return`
      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="${r}" name="${A(e.key)}" ${t}>
        <label class="form-check-label" for="${r}">${A(e.label)}</label>
      </div>
    `}if(e.type===`textarea`)return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${A(e.label)}</label>
        <textarea class="form-control" id="${r}" name="${A(e.key)}" rows="3">${n==null?``:A(String(n))}</textarea>
      </div>
    `;if(e.type===`select`){let t=(e.options||[]).map(e=>`<option value="${A(e.v)}" ${n===e.v?`selected`:``}>${A(e.l)}</option>`).join(``);return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${A(e.label)}</label>
        <select class="form-select" id="${r}" name="${A(e.key)}">${t}</select>
      </div>
    `}if(e.type===`date`){let t=n?String(n).slice(0,10):``;return`
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${r}">${A(e.label)}</label>
        <input type="date" class="form-control" id="${r}" name="${A(e.key)}" value="${A(t)}">
      </div>
    `}return`
    <div class="mb-3">
      <label class="form-label fw-semibold" for="${r}">${A(e.label)}</label>
      <input type="text" class="form-control" id="${r}" name="${A(e.key)}" value="${n==null?``:A(String(n))}">
    </div>
  `}function pc(e){if(!e)return`?`;let t=e.trim().split(/\s+/);return t.length===1?t[0][0].toUpperCase():(t[0][0]+t[t.length-1][0]).toUpperCase()}async function mc(e,n={}){let r=n.alumnoId||n.id;if(!r){e.innerHTML=`<div class="alert alert-danger m-4">ID de alumno no especificado.</div>`;return}e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height:300px">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;let[{data:i,error:a},{data:o}]=await Promise.all([t.from(`alumnos`).select(`*`).eq(`id`,r).single(),t.from(`alumnos_clases`).select(`clase_id, clases(id, nombre, clase_horarios(dia, hora_inicio))`).eq(`alumno_id`,r).eq(`activo`,!0)]);if(a||!i){e.innerHTML=`<div class="alert alert-danger m-4">Error al cargar el alumno: ${A(a?.message||`No encontrado`)}</div>`;return}let s=(o||[]).map(e=>e.clases).filter(Boolean),l=!1,u=!1;function d(){let t=pc(i.nombre_completo),n=na(i.fecha_nacimiento),r=i.activo?`<span class="badge bg-success">Activo</span>`:`<span class="badge bg-secondary">Inactivo</span>`,a=[`personal`,`madre`,`padre`,`representante`,`salud`,`musical`],o=[...a,`clases`,`progreso`,`asistencias`].map((e,t)=>`
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
        >${A(lc[e])}</button>
      </li>
    `).join(``);function c(e){let t=cc[e];return`
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold text-uppercase text-muted small mb-0">${A(lc[e])}</h6>
          <button class="btn btn-sm btn-outline-primary" data-edit-section="${A(e)}">
            <i class="bi bi-pencil me-1"></i>Editar
          </button>
        </div>
        <div id="fields-${e}">
          ${dc(t,i)}
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
          ${s.length===0?`<p class="text-muted fst-italic">Sin clases activas.</p>`:`<div class="list-group">
                 ${s.map(e=>{let t=(e.clase_horarios||[]).map(e=>`${ac(e.dia)} ${ac(e.hora_inicio?.slice(0,5)||``)}`).join(`, `)||`Sin horario`;return`
                     <div class="list-group-item d-flex justify-content-between align-items-center">
                       <span class="fw-semibold">${ac(e.nombre)}</span>
                       <span class="text-muted small">${t}</span>
                     </div>
                   `}).join(``)}
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

        ${rc(i)}

        <!-- Header card -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex flex-wrap gap-3 align-items-start justify-content-between">
              <div class="d-flex gap-3 align-items-center">
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                  style="width:64px;height:64px;font-size:1.4rem;background:var(--bs-primary,#0d6efd)"
                >${A(t)}</div>
                <div>
                  <h4 class="mb-1 fw-bold">${ac(i.nombre_completo)}</h4>
                  <div class="d-flex flex-wrap gap-2 align-items-center">
                    ${r}
                    ${i.instrumento_principal?`<span class="badge bg-info text-dark">${ac(i.instrumento_principal)}</span>`:``}
                    ${i.nivel_actual?`<span class="badge bg-light text-dark border">${ac(i.nivel_actual)}</span>`:``}
                    ${n===null?``:`<span class="text-muted small">${A(String(n))} años</span>`}
                    ${i.created_at?`<span class="text-muted small">Inscrito: ${ac(ra(i.created_at))}</span>`:``}
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
              ${o}
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
    `,g()}async function f(){if(l)return;l=!0;let e=document.getElementById(`progreso-content`);if(!e)return;let{data:n,error:i}=await t.from(`progresos`).select(`*`).eq(`alumno_id`,r).order(`fecha`,{ascending:!1});if(i){e.innerHTML=`<div class="alert alert-warning">Error al cargar progreso: ${A(i.message)}</div>`;return}if(!n||n.length===0){e.innerHTML=`<p class="text-muted fst-italic">Sin registros de progreso.</p>`;return}let a={};for(let e of n){let t=e.contenido_dsl||`Sin categoría`;a[t]||(a[t]=[]),a[t].push(e)}function o(e){if(!e)return`bg-secondary`;let t=e.toLowerCase();return t.includes(`excel`)||t.includes(`muy bien`)?`bg-success`:t.includes(`bien`)||t.includes(`regular`)?`bg-info text-dark`:t.includes(`mal`)||t.includes(`inici`)?`bg-warning text-dark`:`bg-secondary`}e.innerHTML=`
      <h6 class="fw-bold text-uppercase text-muted small mb-3">Progreso</h6>
      ${Object.entries(a).map(([e,t])=>`
        <div class="mb-4">
          <div class="fw-semibold mb-2 border-bottom pb-1">${ac(e)}</div>
          <div class="list-group list-group-flush">
            ${t.map(e=>`
              <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-start">
                <div>
                  ${ac(e.observaciones)}
                  ${e.fecha?`<div class="text-muted small mt-1">${ac(ra(e.fecha))}</div>`:``}
                </div>
                ${e.estado_cualitativo?`<span class="badge ${o(e.estado_cualitativo)} ms-2 flex-shrink-0">${ac(e.estado_cualitativo)}</span>`:``}
              </div>
            `).join(``)}
          </div>
        </div>
      `).join(``)}
    `}async function p(){if(u)return;u=!0;let e=document.getElementById(`asistencias-content`);if(!e)return;let{data:n,error:i}=await t.from(`asistencias`).select(`*`).eq(`alumno_id`,r).order(`fecha`,{ascending:!1}).limit(30);if(i){e.innerHTML=`<div class="alert alert-warning">Error al cargar asistencias: ${A(i.message)}</div>`;return}if(!n||n.length===0){e.innerHTML=`<p class="text-muted fst-italic">Sin registros de asistencia.</p>`;return}let a=0,o=0,s=0;for(let e of n){let t=(e.estado||e.asistio||``).toString().toLowerCase();t===`true`||t===`presente`||t===`1`?a++:t===`justificado`||t===`justified`?s++:o++}let c=n.length,l=c>0?Math.round(a/c*100):0;function d(e){let t=(e.estado||e.asistio||``).toString().toLowerCase();return t===`true`||t===`presente`||t===`1`?`<span class="badge bg-success">Presente</span>`:t===`justificado`||t===`justified`?`<span class="badge bg-warning text-dark">Justificado</span>`:`<span class="badge bg-danger">Ausente</span>`}e.innerHTML=`
      <h6 class="fw-bold text-uppercase text-muted small mb-3">Asistencias (últimas 30)</h6>
      <div class="row g-2 mb-3">
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-success">${A(String(l))}%</div>
              <div class="small text-muted">Asistencia</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-success">${A(String(a))}</div>
              <div class="small text-muted">Presentes</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-danger">${A(String(o))}</div>
              <div class="small text-muted">Ausentes</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center border-0 bg-light">
            <div class="card-body py-2">
              <div class="fs-4 fw-bold text-warning">${A(String(s))}</div>
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
            ${n.map(e=>`
              <tr>
                <td class="text-nowrap">${ac(e.fecha?ra(e.fecha):null)}</td>
                <td>${d(e)}</td>
                <td>${ac(e.observaciones)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `}let m=null,h=null;function g(){document.getElementById(`btn-toggle-completitud`)?.addEventListener(`click`,e=>{let t=document.getElementById(`completitud-detalle`),n=e.currentTarget,r=t.style.display!==`none`;t.style.display=r?`none`:`block`,n.innerHTML=r?`<i class="bi bi-chevron-down"></i> Ver detalle`:`<i class="bi bi-chevron-up"></i> Ocultar`});let t=document.getElementById(`btn-back`);t&&t.addEventListener(`click`,()=>{window.router?.navigate?window.router.navigate(`alumnos`):history.back()});let n=document.getElementById(`btn-ficha-pdf`);n&&n.addEventListener(`click`,async()=>{try{n.disabled=!0,await Zi(i)}catch(e){console.error(`Error generando ficha PDF:`,e)}finally{n.disabled=!1}});let r=document.getElementById(`btn-constancia`);r&&r.addEventListener(`click`,async()=>{try{r.disabled=!0,await Qi(i)}catch(e){console.error(`Error generando constancia:`,e)}finally{r.disabled=!1}});let a=document.getElementById(`btn-postulante`);a&&a.addEventListener(`click`,()=>hc(i,e));let o=document.getElementById(`tab-progreso`);o&&o.addEventListener(`shown.bs.tab`,f);let s=document.getElementById(`tab-asistencias`);s&&s.addEventListener(`shown.bs.tab`,p),e.querySelectorAll(`[data-edit-section]`).forEach(e=>{e.addEventListener(`click`,()=>{ee(e.getAttribute(`data-edit-section`))})});let c=e.querySelector(`#btn-modal-save`);c&&c.addEventListener(`click`,te)}function ee(e){m=e;let t=cc[e],n=document.getElementById(`editModalBody`),r=document.getElementById(`editModalLabel`);r&&(r.textContent=`Editar — ${lc[e]}`),n&&(n.innerHTML=`<form id="edit-form">${t.map(e=>fc(e,i)).join(``)}</form>`);let a=document.getElementById(`editModal`);a&&(h||=new bootstrap.Modal(a),h.show())}async function te(){if(!m)return;let e=cc[m],n=document.getElementById(`modal-save-spinner`),a=document.getElementById(`btn-modal-save`);n&&n.classList.remove(`d-none`),a&&(a.disabled=!0);let o={};for(let t of e){if(i[t.key]===void 0)continue;let e=document.querySelector(`[name="${t.key}"]`);if(e)if(t.type===`checkbox`)o[t.key]=e.checked;else{let n=e.value.trim();o[t.key]=n===``?null:n}}let{error:s}=await t.from(`alumnos`).update(o).eq(`id`,r);if(n&&n.classList.add(`d-none`),a&&(a.disabled=!1),s){c.error(`Error al guardar: ${s.message}`);return}Object.assign(i,o);let l=document.getElementById(`fields-${m}`);l&&(l.innerHTML=dc(e,i)),h&&h.hide()}d()}async function hc(e,n){let r=n.querySelector(`#postulante-panel`);if(r){r.innerHTML=`
    <div class="card border-warning shadow-sm mb-4">
      <div class="card-body text-center py-3">
        <div class="spinner-border spinner-border-sm text-warning me-2"></div>
        <span class="small text-muted">Buscando en postulantes...</span>
      </div>
    </div>`;try{let n=await So(e.nombre_completo);if(!n||n.length===0){r.innerHTML=`
        <div class="alert alert-info d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-info-circle"></i>
          <span class="small">No se encontraron postulantes con el nombre <strong>${A(e.nombre_completo)}</strong>.</span>
          <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
        </div>`,r.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>r.innerHTML=``);return}let i=n[0],a=[`madre_nombre`,`madre_cedula`,`madre_tlf_whatsapp`,`padre_nombre`,`padre_cedula`,`padre_tlf_whatsapp`,`representante_nombre`,`representante_parentesco`,`representante_tlf`,`representante_cedula`,`correo_representante`,`municipio_residencia`,`sector_calle_numero`,`direccion`,`nacionalidad`,`centro_estudios`,`grado_nivel`,`instrumento_interes`,`como_se_entero`,`ubicacion_maps_url`],o=a.filter(t=>{let n=e[t],r=i[t];return(!n||n===``)&&r&&r!==``}),s=a.map(t=>{let n=e[t],r=i[t],a=r&&r!==``,o=n&&n!==``;return a?`<tr class="${o?``:`table-warning`}">
        <td class="small fw-semibold">${A(t.replace(/_/g,` `))}</td>
        <td class="small">${A(String(r))}</td>
        <td class="small text-muted">${o?A(String(n)):`<em>vacío</em>`}</td>
        <td class="text-center">${o?``:`<i class="bi bi-arrow-left-circle text-warning"></i>`}</td>
      </tr>`:``}).filter(Boolean).join(``);r.innerHTML=`
      <div class="card border-warning shadow-sm mb-4">
        <div class="card-header d-flex align-items-center gap-2 bg-warning bg-opacity-10">
          <i class="bi bi-person-check text-warning fs-5"></i>
          <div class="flex-grow-1">
            <div class="fw-bold small">Postulante encontrado: ${A(i.nombre_completo||``)}</div>
            <div class="text-muted" style="font-size:0.72rem">Estado: ${A(i.estado||`—`)} · ID: ${A(i.id||``)}</div>
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
              <tbody>${s||`<tr><td colspan="4" class="text-center text-muted small py-3">Todos los datos ya están cargados en el alumno.</td></tr>`}</tbody>
            </table>
          </div>
        </div>
        ${o.length>0?`
        <div class="card-footer d-flex justify-content-between align-items-center">
          <span class="small text-muted"><i class="bi bi-arrow-left-circle text-warning me-1"></i>${o.length} campo(s) nuevo(s) disponibles</span>
          <button class="btn btn-sm btn-warning" id="btn-precargar">
            <i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes
          </button>
        </div>`:``}
      </div>`,r.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>r.innerHTML=``),r.querySelector(`#btn-precargar`)?.addEventListener(`click`,async()=>{let n=r.querySelector(`#btn-precargar`);n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;try{let n={};o.forEach(e=>{i[e]&&(n[e]=i[e])});let{error:a}=await t.from(`alumnos`).update(n).eq(`id`,e.id);if(a)throw a;Object.assign(e,n),r.innerHTML=`
          <div class="alert alert-success d-flex align-items-center gap-2 mb-4">
            <i class="bi bi-check-circle-fill"></i>
            <span class="small">${o.length} campo(s) precargados correctamente desde postulante. Recargá los tabs para ver los cambios.</span>
            <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel2"><i class="bi bi-x"></i></button>
          </div>`,r.querySelector(`#btn-close-panel2`)?.addEventListener(`click`,()=>r.innerHTML=``)}catch(e){n.disabled=!1,n.innerHTML=`<i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes`,r.insertAdjacentHTML(`beforeend`,`
          <div class="alert alert-danger small mt-2">Error al guardar: ${A(e.message)}</div>`)}})}catch(e){r.innerHTML=`
      <div class="alert alert-danger d-flex align-items-center gap-2 mb-4">
        <i class="bi bi-exclamation-triangle"></i>
        <span class="small">Error al buscar postulante: ${A(e.message)}</span>
        <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
      </div>`,r.querySelector(`#btn-close-panel`)?.addEventListener(`click`,()=>r.innerHTML=``)}}}async function gc(e){e.innerHTML=`
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
            <div><span class="text-muted">Nombre:</span><br><strong>${ji.nombre_completo}</strong></div>
            <div><span class="text-muted">Nacimiento:</span><br><strong>${ji.fecha_nacimiento}</strong></div>
            <div><span class="text-muted">Instrumento:</span><br><strong>${ji.instrumento_principal}</strong></div>
            <div><span class="text-muted">Representante:</span><br><strong>${ji.representante_nombre}</strong></div>
            <div><span class="text-muted">Municipio:</span><br><strong>${ji.municipio_residencia}</strong></div>
            <div><span class="text-muted">Centro estudios:</span><br><strong>${ji.centro_estudios}</strong></div>
          </div>
          <p class="text-muted small mb-0 mt-3">
            <i class="bi bi-info-circle me-1"></i>
            Los PDFs reales se generan con los datos del alumno inscripto. Estos son sólo para previsualizar el diseño.
          </p>
        </div>
      </div>
    </div>`,e.querySelector(`#btn-demo-ficha`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`;try{await $i()}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-download me-2"></i>Descargar ficha demo`}}),e.querySelector(`#btn-demo-constancia`).addEventListener(`click`,async e=>{let t=e.currentTarget;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Generando...`;try{await ea()}finally{t.disabled=!1,t.innerHTML=`<i class="bi bi-download me-2"></i>Descargar constancia demo`}})}var _c=[0,86,179],vc=[255,193,7],yc=[30,30,30];function bc(e){return[e.nombre_completo,e.madre_nombre,e.padre_nombre,e.representante_nombre].map(e=>(e??``).trim()).find(e=>e.length>0)??`Sin nombre registrado`}function xc(e){let t=[];return e.madre_nombre&&e.madre_nombre.trim()&&t.push(`Madre: ${e.madre_nombre.trim()}`),e.padre_nombre&&e.padre_nombre.trim()&&t.push(`Padre: ${e.padre_nombre.trim()}`),e.representante_nombre&&e.representante_nombre.trim()&&t.push(`Rep: ${e.representante_nombre.trim()}`),t.length>0?t.join(`
`):`—`}function Sc(e){let t=[];return e.telefono_alumno&&e.telefono_alumno.trim()&&t.push(`Al: ${e.telefono_alumno.trim()}`),e.madre_tlf_whatsapp&&e.madre_tlf_whatsapp.trim()&&t.push(`Ma: ${e.madre_tlf_whatsapp.trim()}`),e.padre_tlf_whatsapp&&e.padre_tlf_whatsapp.trim()&&t.push(`Pa: ${e.padre_tlf_whatsapp.trim()}`),t.length>0?t.join(`
`):`—`}function Cc(e,t,n){let r=e.internal.pageSize.getWidth();e.setFillColor(..._c),e.rect(0,0,r,26,`F`),e.setFillColor(...vc),e.rect(0,26,r,2,`F`),e.setTextColor(255,255,255),e.setFontSize(14),e.setFont(`helvetica`,`bold`),e.text(`El Sistema Punta Cana`,14,10),e.setFontSize(10),e.setFont(`helvetica`,`normal`),e.text(t,14,18),e.setFontSize(7.5),e.text(n,14,24),e.setTextColor(...yc)}function wc(e,t,n){let r=e.internal.pageSize.getWidth(),i=e.internal.pageSize.getHeight();e.setFillColor(..._c),e.rect(0,i-8,r,8,`F`),e.setTextColor(255,255,255),e.setFontSize(6.5);let a=new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`});e.text(`El Sistema Punta Cana — Generado: ${a}`,10,i-3),e.text(`Página ${t} de ${n}`,r-10,i-3,{align:`right`})}function Tc(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return`—`}}function Ec(e,t,n){let r=new ke({orientation:`landscape`,unit:`mm`,format:`letter`});Cc(r,`LISTADO DE POSTULADOS`,`Rango: ${`${Tc(t)} — ${Tc(n)}`} · Generado: ${new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})} · Total: ${e.length}`),Ae(r,{startY:36,margin:{left:8,right:8},theme:`striped`,head:[[`#`,`Nombre del interesado`,`Padres / Representante`,`Teléfonos`,`Correo`,`Fecha`,`Estado`]],body:e.map((e,t)=>[t+1,bc(e),xc(e),Sc(e),e.correo||`—`,Tc(e.fecha_postulacion||e.created_at),so[e.estado||`postulado`]||e.estado||`—`]),headStyles:{fillColor:_c,textColor:255,fontStyle:`bold`,fontSize:7.5},bodyStyles:{fontSize:7,cellPadding:1.5},alternateRowStyles:{fillColor:[240,245,255]},columnStyles:{0:{cellWidth:8,halign:`center`},1:{cellWidth:48},2:{cellWidth:48},3:{cellWidth:40},4:{cellWidth:50},5:{cellWidth:22,halign:`center`},6:{cellWidth:20,halign:`center`}},didDrawPage:e=>{let t=r.internal.getNumberOfPages();wc(r,e.pageNumber,t)}});let i=r.internal.getNumberOfPages();for(let e=1;e<=i;e++)r.setPage(e),wc(r,e,i);return r}function Dc(e,t,n){Ec(e,t,n).save(`postulados-${t}-${n}.pdf`)}function Oc(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-01`}function kc(){let e=new Date,t=new Date(e.getFullYear(),e.getMonth()+1,0);return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}var P={year:new Date().getFullYear(),month:new Date().getMonth()+1,postulantes:[],filtroEstado:`todos`,cargando:!1,page:1,limit:50,pdfDesde:Oc(),pdfHasta:kc(),hiddenCount:0,searchQuery:``},Ac=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],jc=/\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|extracu|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i;function Mc(e){if(!e||e.length===0)return!1;let t=e.trim();return!(t.length>70||t.includes(`,`)||t.split(/\s+/).length>5||jc.test(t)||!/[A-ZÁÉÍÓÚÑ]/.test(t)||t.length<4)}function Nc(e){return[e.nombre_completo,e.madre_nombre,e.padre_nombre,e.representante_nombre].map(e=>(e??``).trim()).find(e=>Mc(e))??`Sin nombre registrado`}function Pc(e){return[{persona:e.madre_nombre,numero:e.madre_tlf_whatsapp,rol:`Madre`},{persona:e.padre_nombre,numero:e.padre_tlf_whatsapp,rol:`Padre`},{persona:e.representante_nombre,numero:e.representante_tlf||e.telefono_representante,rol:`Representante`},{persona:null,numero:e.telefono_alumno,rol:`Alumno`}].filter(({numero:e})=>{let t=(e??``).trim();return t.length>=7&&!/^(sin definir|no tiene|n\/a)$/i.test(t)}).map(({persona:e,numero:t,rol:n})=>({rol:n,nombre:Mc(e??``)?e.trim():null,numero:t.trim()}))}function Fc(e){return Pc(e)[0]?.numero??null}function Ic(e){let t=e.replace(/\D/g,``);return t.length===10?`${t.slice(0,3)}-${t.slice(3,6)}-${t.slice(6)}`:e}async function Lc(e){P.filtroEstado=`todos`,P.page=1,await Rc(e)}async function Rc(e){try{P.cargando=!0,zc(e);let t=await Zo(P.year,P.month);P.postulantes=t.filter(e=>Fc(e)!==null),P.hiddenCount=t.length-P.postulantes.length,P.cargando=!1,Hc(e)}catch(t){P.cargando=!1,Bc(e,t.message)}}function zc(e){e.innerHTML=`
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
  `}function Bc(e,t){e.innerHTML=`
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
  `,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>Lc(e))}function Vc(e,t){return t===0?``:`
    <div class="mb-4 mt-2 px-1 small tracking-wide">
      ${[{key:`postulado`,label:`Postulados`},{key:`contactado`,label:`Contactados`},{key:`cita_agendada`,label:`Con Cita`},{key:`documentos_ok`,label:`Docs OK`},{key:`inscrito`,label:`Inscritos`}].map(t=>{let n=e[t.key]||0;return n>0?`<span class="text-body-secondary fw-medium">${n}</span> <span class="text-muted">${t.label}</span>`:null}).filter(Boolean).join(`<span class="text-muted mx-2">/</span>`)}
    </div>
  `}function Hc(e){let t=Uc();t.sort((e,t)=>{let n=new Date(e.fecha_postulacion||e.created_at);return new Date(t.fecha_postulacion||t.created_at)-n});let n=t.length,r=Math.ceil(n/P.limit)||1;P.page>r&&(P.page=r),P.page<1&&(P.page=1);let i=(P.page-1)*P.limit,a=Math.min(i+P.limit,n),o=t.slice(i,a),s=Wc();e.innerHTML=`
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
              ${Ac[P.month-1]} ${P.year}
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
          <input type="date" class="form-control form-control-sm" id="pdf-desde" value="${P.pdfDesde}">
        </div>
        <div class="d-flex align-items-center gap-2">
          <label for="pdf-hasta" class="form-label small text-body-secondary mb-0">Hasta</label>
          <input type="date" class="form-control form-control-sm" id="pdf-hasta" value="${P.pdfHasta}">
        </div>
        <button class="btn btn-outline-primary btn-sm" id="btn-descargar-pdf">
          <span class="spinner-border spinner-border-sm d-none me-1" id="pdf-spinner"></span>
          <i class="bi bi-file-earmark-pdf me-1" id="pdf-icon"></i> Descargar PDF
        </button>
      </div>

      <!-- PIPELINE SUMMARY -->
      ${Vc(s,P.postulantes.length)}

      <!-- C04: HIDDEN POSTULANTES BANNER -->
      ${P.hiddenCount>0?`
      <div id="hidden-postulantes-banner" class="alert alert-info alert-sm py-2 px-3 mb-3 small" role="alert">
        <i class="bi bi-info-circle me-2"></i>
        <strong>${P.hiddenCount}</strong> postulante(s) sin número de contacto están ocultos en este listado.
      </div>`:``}

      <!-- C05: SEARCH INPUT -->
      <div class="mb-3">
        <input type="search" id="buscar-postulante" class="form-control form-control-sm" placeholder="Buscar por nombre, teléfono o municipio..." value="${P.searchQuery||``}">
      </div>

      <!-- MINIMALIST TABS -->
      <div class="d-flex gap-4 overflow-x-auto border-bottom border-secondary-subtle mb-4 scrollbar-hidden" style="white-space: nowrap;">
        <button class="btn btn-link px-1 pb-2 text-decoration-none rounded-0 border-0 ${P.filtroEstado===`todos`?`text-body fw-bold border-bottom border-primary border-2`:`text-body-secondary`}" data-filter="todos">
          Todos <span class="ms-1 small text-body-secondary">${P.postulantes.length}</span>
        </button>
        ${Object.entries(so).map(([e,t])=>{let n=s[e]||0;return n===0&&P.filtroEstado!==e?``:`
            <button class="btn btn-link px-1 pb-2 text-decoration-none rounded-0 border-0 ${P.filtroEstado===e?`text-body fw-bold border-bottom border-primary border-2`:`text-body-secondary`}" data-filter="${e}">
              ${t} <span class="ms-1 small text-body-secondary">${n}</span>
            </button>
          `}).join(``)}
      </div>

      <!-- MAIN CONTENT AREA -->
      <div class="bg-transparent">
        ${o.length===0?Gc():Kc(o)}
        
        <!-- MINIMALIST PAGINATION -->
        ${n>0?`
          <div class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top border-secondary-subtle">
            <span class="text-body-secondary small">
              ${i+1}-${a} de ${n}
            </span>
            <div class="d-flex gap-3">
              <button class="btn btn-link text-decoration-none text-body p-0 ${P.page===1?`opacity-25`:``}" id="btn-page-prev" ${P.page===1?`disabled`:``}>
                <i class="bi bi-arrow-left"></i> Anterior
              </button>
              <button class="btn btn-link text-decoration-none text-body p-0 ${P.page===r?`opacity-25`:``}" id="btn-page-next" ${P.page===r?`disabled`:``}>
                Siguiente <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        `:``}
      </div>
  `,qc(e)}function Uc(){let e=P.filtroEstado===`todos`?[...P.postulantes]:P.postulantes.filter(e=>e.estado===P.filtroEstado),t=(P.searchQuery||``).toLowerCase().trim();return t&&(e=e.filter(e=>(Nc(e)||``).toLowerCase().includes(t)||(Fc(e)||``).includes(t)||(e.municipio||``).toLowerCase().includes(t))),e}function Wc(){let e={};return Object.keys(so).forEach(t=>e[t]=0),P.postulantes.forEach(t=>{let n=t.estado||`postulado`;e[n]!==void 0&&e[n]++}),e}function Gc(){return`
    <div class="text-center py-5 my-5">
      <h5 class="text-body-secondary fw-normal">No hay postulantes</h5>
    </div>
  `}function Kc(e){return`
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
            ${e.map(e=>{let t=Pc(e).map(({rol:e,nombre:t,numero:n})=>{let r=`https://wa.me/${n.replace(/\D/g,``)}?text=Hola%2C%20le%20contactamos%20de%20El%20Sistema%20Punta%20Cana.`,i=t?`${t} (${e})`:e;return`<a href="${r}" target="_blank" rel="noopener" class="d-flex align-items-center gap-2 text-decoration-none text-body mb-1" title="${i}">
        <i class="bi bi-whatsapp text-success small"></i>
        <span class="small">${Ic(n)}</span>
        <span class="text-body-secondary small fw-light">· ${i}</span>
      </a>`}).join(``),n=e.fecha_postulacion||e.created_at,r=n?new Date(n).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):`-`,i=co[e.estado||`postulado`],a=so[e.estado||`postulado`];return`
      <tr class="cursor-pointer" data-id="${e.id}">
        <td class="py-3">
          <div class="fw-medium text-body">${Nc(e)}</div>
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
          <button class="btn btn-link text-body-secondary p-0 hover-danger btn-delete-postulante" data-id="${e.id}" data-name="${Nc(e)}" title="Eliminar">
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
        ${e.map(e=>{let t=Pc(e).map(({rol:e,nombre:t,numero:n})=>`<a href="${`https://wa.me/${n.replace(/\D/g,``)}?text=Hola%2C%20le%20contactamos%20de%20El%20Sistema%20Punta%20Cana.`}" target="_blank" rel="noopener" class="text-decoration-none text-body me-3 mb-2 d-inline-flex align-items-center gap-1">
        <i class="bi bi-whatsapp text-success"></i> <span class="small fw-medium">${Ic(n)}</span>
      </a>`).join(``),n=e.fecha_postulacion||e.created_at,r=n?new Date(n).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}):`-`,i=co[e.estado||`postulado`],a=so[e.estado||`postulado`];return`
      <div class="border-bottom border-secondary-subtle py-3 cursor-pointer" data-id="${e.id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-semibold text-body fs-6">${Nc(e)}</div>
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
  `}function qc(e){e.querySelectorAll(`.btn-wa-link`).forEach(e=>{e.addEventListener(`click`,e=>{e.stopPropagation()})}),e.querySelector(`#buscar-postulante`)?.addEventListener(`input`,t=>{P.searchQuery=t.target.value,P.page=1,Hc(e)}),e.querySelector(`#btn-month-prev`)?.addEventListener(`click`,()=>{P.month--,P.month<1&&(P.month=12,P.year--),P.page=1,Rc(e)}),e.querySelector(`#btn-month-next`)?.addEventListener(`click`,()=>{P.month++,P.month>12&&(P.month=1,P.year++),P.page=1,Rc(e)}),e.querySelector(`#btn-sync`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#btn-sync`),n=e.querySelector(`#sync-spinner`),r=e.querySelector(`#sync-icon`);try{t.disabled=!0,n.classList.remove(`d-none`),r.classList.add(`d-none`);let i=await Jo();c.success(`Sincronización exitosa. Registros procesados: ${i.total_rows||i.upserted||0}`),P.page=1,Rc(e)}catch(e){c.error(`Error al sincronizar: ${e.message}`),t.disabled=!1,n.classList.add(`d-none`),r.classList.remove(`d-none`)}}),e.querySelectorAll(`[data-filter]`).forEach(t=>{t.addEventListener(`click`,t=>{P.filtroEstado=t.currentTarget.getAttribute(`data-filter`),P.page=1,Hc(e)})}),e.querySelectorAll(`.hover-table-row`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.getAttribute(`data-id`);f.navigate(`postulado`,{id:t})})}),e.querySelectorAll(`.btn-delete-postulante`).forEach(t=>{t.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget,r=n.getAttribute(`data-id`),i=n.getAttribute(`data-name`);_.open({title:`¿Eliminar postulante?`,body:`<p>Esta acción eliminará permanentemente la postulación de <strong>${i}</strong> de la base de datos. Esta operación no se puede deshacer.</p>`,saveText:`Eliminar`,onSave:async()=>{try{n.disabled=!0,await ns(r),_.close(),c.success(`Postulación eliminada con éxito`),Rc(e)}catch(e){c.error(`Error al eliminar: ${e.message}`),n.disabled=!1}},onCancel:()=>{}})})}),e.querySelector(`#btn-descargar-pdf`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#pdf-desde`)?.value,n=e.querySelector(`#pdf-hasta`)?.value,r=e.querySelector(`#btn-descargar-pdf`),i=e.querySelector(`#pdf-spinner`),a=e.querySelector(`#pdf-icon`);if(!t||!n){c.error(`Debe seleccionar una fecha de inicio y una fecha de fin.`);return}if(t>n){c.error(`La fecha "Desde" no puede ser posterior a la fecha "Hasta".`);return}try{r.disabled=!0,i.classList.remove(`d-none`),a.classList.add(`d-none`);let e=await Qo(t,n);if(!e||e.length===0){c.error(`No hay postulados registrados en el rango de fechas seleccionado.`);return}Dc(e,t,n)}catch(e){c.error(`Error al generar el PDF: ${e.message}`)}finally{r.disabled=!1,i.classList.add(`d-none`),a.classList.remove(`d-none`)}}),e.querySelector(`#btn-page-prev`)?.addEventListener(`click`,()=>{P.page>1&&(P.page--,Hc(e))}),e.querySelector(`#btn-page-next`)?.addEventListener(`click`,()=>{P.page++,Hc(e)})}var Jc=/\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i,Yc=[{id:`cedula_rep`,label:`Cédula del representante`},{id:`partida`,label:`Partida de nacimiento`},{id:`constancia`,label:`Constancia escolar`},{id:`foto`,label:`Foto del alumno`},{id:`docs_medicos`,label:`Documentos médicos (si aplica)`}],Xc=[{id:`postulado`,label:`Postulado`,num:1},{id:`contactado`,label:`Contactado`,num:2},{id:`cita_agendada`,label:`Cita agendada`,num:3},{id:`documentos_ok`,label:`Documentos OK`,num:4},{id:`inscrito`,label:`Inscrito`,num:5}],F={postulante:null,cargando:!1};function Zc(e){if(!e)return!1;let t=e.trim();return t.length>=4&&t.length<=70&&!t.includes(`,`)&&t.split(/\s+/).length<=5&&!Jc.test(t)&&/[A-ZÁÉÍÓÚÑ]/.test(t)}function Qc(e){return[e.nombre_completo,e.madre_nombre,e.padre_nombre,e.representante_nombre].map(e=>(e??``).trim()).find(Zc)??`Sin nombre registrado`}function $c(e){return{_postulante_id:e.id,nombre_completo:Qc(e),fecha_nacimiento:e.fecha_nacimiento||``,nacionalidad:e.nacionalidad||``,tiene_pasaporte:e.tiene_pasaporte??!1,sabe_leer:e.sabe_leer??null,sabe_escribir:e.sabe_escribir??null,genero:e.genero||``,como_se_entero:e.como_se_entero||``,municipio_residencia:e.municipio_residencia||``,sector_calle_numero:e.sector_calle_numero||``,direccion:e.direccion||``,ubicacion_maps_url:e.ubicacion_maps_url||``,madre_nombre:e.madre_nombre||``,madre_cedula:e.madre_cedula||``,madre_tlf_whatsapp:e.madre_tlf_whatsapp||``,padre_nombre:e.padre_nombre||``,padre_cedula:e.padre_cedula||``,padre_tlf_whatsapp:e.padre_tlf_whatsapp||``,representante_nombre:e.representante_nombre||e.madre_nombre||``,representante_parentesco:e.representante_parentesco||``,representante_cedula:e.representante_cedula||``,representante_tlf:e.representante_tlf||e.telefono_representante||e.madre_tlf_whatsapp||``,correo_representante:e.correo||``,beneficiario_subsidio_estado:e.beneficiario_subsidio_estado??!1,acepta_pago_600:e.acepta_pago_600??!1,instrumento_interes:e.instrumento_interes||``,tiene_conocimientos_musicales:e.tiene_conocimientos_musicales??!1,instrumento_previo:e.instrumento_previo||``,nivel_lectura_musical:e.nivel_lectura_musical||``,interes_musical:e.interes_musical||``,por_que_unirse:e.por_que_unirse||``,sentimiento_musica_clasica:e.sentimiento_musica_clasica||``,musico_favorito:e.musico_favorito||``,autoriza_fotos_redes:e.autoriza_fotos_redes??!1}}function el(e){let t=na(e,{fallback:null});return t===null?`Sin definir`:`${t} años`}function tl(e){return e?new Date(e).toLocaleString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):``}function nl(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`}):`-`}function rl(e,t,n){return`https://wa.me/${(e||``).replace(/[^0-9]/g,``)}?text=${encodeURIComponent(`Hola ${t}, le contactamos de *El Sistema Punta Cana*. Hemos recibido la postulación de *${n}* y queremos coordinar el proceso de inscripción. ¿Cuándo podría venir a nuestra sede para la entrevista? 🎵`)}`}function il(e){return`docs_${e}`}function al(e){try{let t=localStorage.getItem(il(e));return t?JSON.parse(t):{}}catch{return{}}}function ol(e,t){localStorage.setItem(il(e),JSON.stringify(t))}async function sl(e,t){let n=t?.id;if(!n){e.innerHTML=`<div class="alert alert-danger m-4">Error: ID de postulante no provisto.</div>`;return}await cl(e,n)}async function cl(e,t){F.cargando=!0,e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height:400px">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando perfil...</span>
      </div>
    </div>`;try{if(F.postulante=await qo(t),F.cargando=!1,!F.postulante){e.innerHTML=`
        <div class="container py-5 text-center">
          <i class="bi bi-person-x display-1 text-muted"></i>
          <h2 class="mt-3 fw-bold">Postulante no encontrado</h2>
          <p class="text-muted">El postulante con ID "${t}" no existe en el sistema.</p>
          <button class="btn btn-primary rounded-pill px-4 mt-3" id="btn-error-back">
            <i class="bi bi-arrow-left me-1"></i> Volver al listado
          </button>
        </div>`,document.getElementById(`btn-error-back`)?.addEventListener(`click`,()=>f.navigate(`postulados`));return}ll(e)}catch(n){F.cargando=!1,e.innerHTML=`
      <div class="container py-5 text-center">
        <div class="alert alert-danger p-4 rounded-3">
          <i class="bi bi-exclamation-triangle-fill fs-1 mb-2 d-block"></i>
          <h4 class="fw-bold">Error al cargar perfil</h4>
          <p>${n.message}</p>
          <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-error-retry">
            <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      </div>`,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>cl(e,t))}}function ll(e){let t=F.postulante,n=t.estado||`postulado`,r=Qc(t),i=t.representante_nombre||t.madre_nombre||`Representante`,a=co[n]||`secondary`,o=so[n]||`Postulado`;e.innerHTML=`
    <div class="container-fluid py-3 px-3 px-md-4">

      <!-- TOP BAR -->
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <button class="btn btn-link text-decoration-none ps-0 text-secondary" id="btn-back-list">
          <i class="bi bi-arrow-left me-1"></i> Volver a Postulados
        </button>
        <div class="d-flex gap-2 flex-wrap">
          ${t.madre_tlf_whatsapp?`
            <a href="${rl(t.madre_tlf_whatsapp,i,r)}"
               target="_blank" rel="noopener"
               class="btn btn-outline-success btn-sm rounded-pill">
              <i class="bi bi-whatsapp me-1"></i> WhatsApp Madre
            </a>`:``}
          ${t.padre_tlf_whatsapp?`
            <a href="${rl(t.padre_tlf_whatsapp,i,r)}"
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
          Postulado el: ${nl(t.created_at)}
        </p>
      </div>

      <!-- PIPELINE -->
      <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4">
        <div class="card-body py-3 px-4 overflow-auto">
          ${ul(n)}
        </div>
      </div>

      <!-- TWO-COLUMN LAYOUT -->
      <div class="row g-4">

        <!-- LEFT col -->
        <div class="col-lg-7">

          <!-- PROXIMO PASO -->
          <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4" id="card-proximo-paso">
            ${dl(t,n,i,r)}
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
                ${ml(t)}
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
              ${fl(t)}
            </div>
          </div>

          <!-- DOCUMENTOS -->
          <div class="card border-secondary-subtle shadow-sm rounded-3">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-4">
              <h6 class="fw-bold mb-0"><i class="bi bi-folder-check me-2 text-primary"></i>Documentos</h6>
            </div>
            <div class="card-body px-4 pb-4">
              ${pl(t.id)}
            </div>
          </div>

        </div>
      </div>
    </div>
  `,hl(e)}function ul(e){let t=[`no_show`,`en_espera`,`descartado`,`reprogramado`].includes(e),n={no_show:2,reprogramado:2,en_espera:3,descartado:-1},r=Xc.findIndex(t=>t.id===e);return t&&(r=n[e]??-1),`
    <div class="d-flex align-items-center gap-1 overflow-auto py-1">
      ${Xc.map((n,i)=>{let a=i<r,o=i===r&&!t,s=i===r&&t,c=`bg-light border border-secondary text-secondary`,l=`text-secondary`;if(a)c=`bg-success text-white border border-success`,l=`text-success fw-semibold`;else if(o){let e=co[n.id]||`primary`;c=`bg-${e} text-white border border-${e}`,l=`text-${e} fw-bold`}else if(s){let t=co[e]||`secondary`;c=`bg-${t} bg-opacity-25 text-${t} border border-${t}`,l=`text-${t} fw-semibold`}let u=i<Xc.length-1?`<div class="flex-grow-1 border-top border-secondary-subtle" style="min-width:20px;margin-top:-8px"></div>`:``;return`
          <div class="d-flex flex-column align-items-center" style="min-width:64px">
            <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold ${c}"
                 style="width:36px;height:36px;font-size:.9rem">
              ${a?`<i class="bi bi-check-lg"></i>`:n.num}
            </div>
            <div class="text-center mt-1 small ${l}" style="font-size:.75rem;white-space:nowrap">
              ${n.label}
            </div>
            ${s?`<span class="badge bg-${co[e]} mt-1" style="font-size:.65rem">${so[e]}</span>`:``}
          </div>
          ${u}`}).join(``)}
    </div>
  `}function dl(e,t,n,r){let i=co[t]||`secondary`;switch(t){case`postulado`:return`
        <div class="card-header bg-${i} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${i}"><i class="bi bi-telephone-outbound me-2"></i>Próximo paso: Contactar a la familia</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">El representante aún no ha sido contactado. Iniciá la comunicación por WhatsApp.</p>
          <div class="d-flex flex-wrap gap-2 mb-3">
            ${e.madre_tlf_whatsapp?`
              <a href="${rl(e.madre_tlf_whatsapp,n,r)}"
                 target="_blank" rel="noopener"
                 class="btn btn-success btn-sm rounded-pill">
                <i class="bi bi-whatsapp me-1"></i> WhatsApp Madre
              </a>`:``}
            ${e.padre_tlf_whatsapp?`
              <a href="${rl(e.padre_tlf_whatsapp,n,r)}"
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
          <h6 class="fw-bold text-${i}"><i class="bi bi-calendar-event me-2"></i>Cita agendada para: ${e.fecha_cita?tl(e.fecha_cita):`Sin fecha registrada`}</h6>
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
        </div>`}}function fl(e){let t=(e,t)=>`
      <div class="d-flex justify-content-between py-1 border-bottom border-light">
        <span class="text-muted small">${e}</span>
        <span class="small text-end">${t!=null&&t!==``?`<span class="fw-medium">${t}</span>`:`<span class="text-muted fst-italic">Sin definir</span>`}</span>
      </div>`,n=[e.representante_nombre||e.nombre_representante||``,e.representante_parentesco||``].filter(Boolean).join(` · `);return`
    ${t(`Instrumento`,e.instrumento_interes||e.instrumento)}
    ${t(`Edad`,el(e.fecha_nacimiento))}
    ${t(`Municipio`,e.municipio_residencia)}
    ${t(`Madre`,[e.madre_nombre,e.madre_tlf_whatsapp].filter(Boolean).join(` — `))}
    ${t(`Padre`,[e.padre_nombre,e.padre_tlf_whatsapp].filter(Boolean).join(` — `))}
    ${t(`Representante`,n)}
    ${t(`Correo`,e.correo)}
    ${t(`Postulado el`,nl(e.created_at))}
  `}function pl(e){let t=al(e);return Yc.map(e=>`
    <div class="form-check mb-2">
      <input class="form-check-input doc-check" type="checkbox"
             id="doc-${e.id}" data-doc-id="${e.id}"
             ${t[e.id]?`checked`:``}>
      <label class="form-check-label small" for="doc-${e.id}">${e.label}</label>
    </div>
  `).join(``)}function ml(e){let t=(e.notas_seguimiento||e.notes||``).split(`
`).filter(e=>e.trim());return t.length===0?`<p class="text-muted small fst-italic">Sin notas registradas.</p>`:`
    <h6 class="fw-bold small text-secondary text-uppercase mb-2">Historial</h6>
    ${t.map(e=>`
      <div class="d-flex gap-2 mb-2 pb-2 border-bottom border-light">
        <div class="mt-1 rounded-circle bg-primary flex-shrink-0" style="width:8px;height:8px"></div>
        <p class="small mb-0">${e}</p>
      </div>`).join(``)}
  `}function hl(e){let t=F.postulante,n=t.id;t.estado,e.querySelector(`#btn-back-list`)?.addEventListener(`click`,()=>{window.router?.navigate(`postulados`)??f.navigate(`postulados`)}),e.querySelector(`#btn-ver-alumno`)?.addEventListener(`click`,()=>{window.router?.navigate(`alumno`,{id:t.alumno_id})??f.navigate(`alumno`,{id:t.alumno_id})}),e.querySelectorAll(`.doc-check`).forEach(e=>{e.addEventListener(`change`,()=>{let t=al(n),r=e.getAttribute(`data-doc-id`);e.checked?t[r]=!0:delete t[r],ol(n,t)})}),e.querySelector(`#btn-save-note`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#textarea-nueva-nota`),r=(t?.value||``).trim();if(!r)return;let i=e.querySelector(`#btn-save-note`),a=e.querySelector(`#save-note-spinner`);try{i.disabled=!0,a?.classList.remove(`d-none`),F.postulante=await ts(n,r),t.value=``;let o=e.querySelector(`#notes-timeline`);o&&(o.innerHTML=ml(F.postulante))}catch(e){c.error(`Error al agregar nota: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-contactado`)?.addEventListener(`click`,async()=>{try{F.postulante=await Xo(n,`contactado`,{notas_seguimiento:`Contacto iniciado vía WhatsApp.`}),ll(e)}catch(e){c.error(`Error al cambiar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-cita-agendada`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-cita`),r=e.querySelector(`#cita-inline-error`),i=e.querySelector(`#btn-accion-cita-agendada`),a=e.querySelector(`#spinner-cita`);if(!t?.value){r?.classList.remove(`d-none`),r&&(r.textContent=`Debe seleccionar una fecha y hora.`);return}try{i.disabled=!0,a?.classList.remove(`d-none`),r?.classList.add(`d-none`);let o=new Date(t.value).toISOString();if(await es(o,n)){r?.classList.remove(`d-none`),r&&(r.textContent=`Conflicto: ya existe otra cita en un rango de ±30 minutos.`);return}F.postulante=await Xo(n,`cita_agendada`,{fecha_cita:o,notas_seguimiento:`Cita agendada para: ${tl(o)}`}),ll(e)}catch(e){c.error(`Error al agendar cita: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-documentos-ok`)?.addEventListener(`click`,async()=>{try{F.postulante=await Xo(n,`documentos_ok`,{notas_seguimiento:`Representante presente. Documentación revisada.`}),ll(e)}catch(e){c.error(`Error al actualizar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-no-show`)?.addEventListener(`click`,async()=>{try{F.postulante=await Xo(n,`no_show`,{notas_seguimiento:`No se presentó a la cita agendada.`}),ll(e)}catch(e){c.error(`Error al actualizar estado: ${e.message}`)}}),e.querySelector(`#btn-accion-inscribir`)?.addEventListener(`click`,()=>{to($c(t)),window.router?.navigate(`alumnos-inscribir`)??f.navigate(`alumnos-inscribir`)}),e.querySelector(`#btn-accion-reprogramar`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-reprogramar`),r=e.querySelector(`#btn-accion-reprogramar`),i=e.querySelector(`#spinner-reprogramar`);if(!t?.value){c.error(`Seleccioná una nueva fecha para la cita.`);return}try{r.disabled=!0,i?.classList.remove(`d-none`);let a=new Date(t.value).toISOString();if(await es(a,n)){c.error(`Conflicto: ya existe otra cita en un rango de ±30 minutos.`);return}let o=await Xo(n,`reprogramado`,{notas_seguimiento:`Cita reprogramada para: ${tl(a)}`});o=await Xo(n,`cita_agendada`,{fecha_cita:a,notas_seguimiento:`Nueva cita agendada: ${tl(a)}`}),F.postulante=o,ll(e)}catch(e){c.error(`Error al reprogramar: ${e.message}`)}finally{r.disabled=!1,i?.classList.add(`d-none`)}}),e.querySelector(`#btn-accion-descartar`)?.addEventListener(`click`,()=>{_.open({title:`Razón del descarte`,body:`<div class="mb-3">
        <label for="razon-descarte" class="form-label">Indicá la razón del descarte:</label>
        <textarea id="razon-descarte" class="form-control" rows="3" placeholder="Indicá la razón..."></textarea>
      </div>`,saveText:`Descartar`,onSave:async t=>{let r=(t?.querySelector(`#razon-descarte`)?.value||document.getElementById(`razon-descarte`)?.value||``).trim();try{F.postulante=await Xo(n,`descartado`,{notas_seguimiento:`Postulación descartada. Razón: ${r||`Sin detallar`}`}),_.close(),ll(e)}catch(e){c.error(`Error al descartar: ${e.message}`)}},onCancel:()=>{}})}),e.querySelector(`#btn-accion-espera-cita`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#input-fecha-espera`),r=e.querySelector(`#espera-cita-error`),i=e.querySelector(`#btn-accion-espera-cita`),a=e.querySelector(`#spinner-espera`);if(!t?.value){r?.classList.remove(`d-none`),r&&(r.textContent=`Seleccioná una fecha para la cita.`);return}try{i.disabled=!0,a?.classList.remove(`d-none`),r?.classList.add(`d-none`);let o=new Date(t.value).toISOString();if(await es(o,n)){r?.classList.remove(`d-none`),r&&(r.textContent=`Conflicto: ya existe otra cita en ±30 minutos.`);return}F.postulante=await Xo(n,`cita_agendada`,{fecha_cita:o,notas_seguimiento:`Cita agendada desde lista de espera: ${tl(o)}`}),ll(e)}catch(e){c.error(`Error al agendar cita: ${e.message}`)}finally{i.disabled=!1,a?.classList.add(`d-none`)}})}var I={vista:`mes`,ref:new Date,citas:[],filtroEstado:`todos`};function gl(e){return e.estado||`postulado`}function _l(e){return co[gl(e)]||`secondary`}var vl=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],yl=[`Dom`,`Lun`,`Mar`,`Mié`,`Jue`,`Vie`,`Sáb`];function bl(e){let t=new Date(e);return t.setHours(0,0,0,0),t}function xl(e){let t=new Date(e);return t.setHours(23,59,59,999),t}function Sl(e){let t=bl(e);return t.setDate(t.getDate()-t.getDay()),t}function Cl(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function wl(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()}function Tl(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function El(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(t,n-1,r)}function Dl(e){return new Date(e).toLocaleTimeString(`es-ES`,{hour:`2-digit`,minute:`2-digit`,hour12:!0})}async function Ol(e){await kl(e)}async function kl(e){try{Al(e);let t,n;I.vista===`mes`?(t=new Date(I.ref.getFullYear(),I.ref.getMonth(),1,0,0,0),n=new Date(I.ref.getFullYear(),I.ref.getMonth()+1,0,23,59,59)):I.vista===`semana`?(t=Sl(I.ref),n=xl(Cl(t,6))):(t=bl(I.ref),n=xl(I.ref)),I.citas=await $o(t.toISOString(),n.toISOString()),I.filtroEstado!==`todos`&&!I.citas.some(e=>gl(e)===I.filtroEstado)&&(I.filtroEstado=`todos`),Nl(e)}catch(t){jl(e,t.message)}}function Al(e){e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4 pcal-wrap">
      <h1 class="h3 fw-bold mb-4">Calendario de Citas</h1>
      <div class="d-flex justify-content-center align-items-center" style="min-height: 360px;">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    </div>`}function jl(e,t){e.innerHTML=`
    <div class="container py-5 text-center pcal-wrap">
      <div class="alert alert-danger border-0 shadow-sm p-4 rounded-3">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-1 mb-2 d-block"></i>
        <h4 class="fw-bold">Error al cargar citas</h4>
        <p>${t}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-error-retry">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>
    </div>`,document.getElementById(`btn-error-retry`)?.addEventListener(`click`,()=>Ol(e))}function Ml(){if(I.vista===`mes`)return`${vl[I.ref.getMonth()]} ${I.ref.getFullYear()}`;if(I.vista===`semana`){let e=Sl(I.ref),t=Cl(e,6);return`${e.getDate()} ${vl[e.getMonth()].slice(0,3)} – ${t.getDate()} ${vl[t.getMonth()].slice(0,3)} ${t.getFullYear()}`}return`${yl[I.ref.getDay()]} ${I.ref.getDate()} de ${vl[I.ref.getMonth()]} ${I.ref.getFullYear()}`}function Nl(e){let t=(e,t)=>`<button class="btn btn-sm ${I.vista===e?`btn-primary`:`btn-outline-secondary`} cal-vista" data-vista="${e}">${t}</button>`;e.innerHTML=`
    <div class="container-fluid py-4 px-3 px-md-4 pcal-wrap">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 class="h3 fw-bold mb-1">Calendario de Citas</h1>
          <p class="text-body-secondary mb-0 small">Entrevistas de admisión · ${Pl().length} cita${Pl().length===1?``:`s`} en vista</p>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <div class="btn-group btn-group-sm shadow-sm" role="group">
            ${t(`mes`,`Mes`)}${t(`semana`,`Semana`)}${t(`dia`,`Día`)}
          </div>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-today">Hoy</button>
          <div class="input-group input-group-sm shadow-sm" style="max-width: 280px;">
            <button class="btn btn-outline-secondary" id="btn-prev"><i class="bi bi-chevron-left"></i></button>
            <span class="input-group-text flex-grow-1 justify-content-center fw-semibold">${Ml()}</span>
            <button class="btn btn-outline-secondary" id="btn-next"><i class="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>

      ${Il()}

      <div id="cal-body">
        ${I.vista===`mes`?Ll():I.vista===`semana`?Rl():zl()}
      </div>
    </div>`,Bl(e)}function Pl(){return I.filtroEstado===`todos`?I.citas:I.citas.filter(e=>gl(e)===I.filtroEstado)}function Fl(e){return Pl().filter(t=>t.fecha_cita&&wl(new Date(t.fecha_cita),e)).sort((e,t)=>new Date(e.fecha_cita)-new Date(t.fecha_cita))}function Il(){let e={};for(let t of I.citas){let n=gl(t);e[n]=(e[n]||0)+1}let t=Object.keys(e);if(t.length<=1)return``;let n=(e,t,n,r)=>`<button type="button" class="btn btn-sm rounded-pill pcal-filtro ${I.filtroEstado===e?`btn-${n}`:`btn-outline-${n}`}" data-estado="${e}">${t} (${r})</button>`,r=t.sort().map(t=>n(t,so[t]||t,co[t]||`secondary`,e[t])).join(``);return`
    <div class="d-flex align-items-center gap-2 flex-wrap mb-3 pcal-filtros">
      <span class="small text-body-secondary me-1"><i class="bi bi-funnel me-1"></i>Estado:</span>
      ${n(`todos`,`Todos`,`secondary`,I.citas.length)}
      ${r}
    </div>`}function Ll(){let e=I.ref.getFullYear(),t=I.ref.getMonth(),n=new Date(e,t+1,0).getDate(),r=new Date(e,t,1).getDay(),i=new Date,a=``;for(let e=0;e<r;e++)a+=`<div class="col pcal-cell is-empty" style="width:14.28%"></div>`;for(let r=1;r<=n;r++){let n=new Date(e,t,r),o=wl(n,i),s=Fl(n);a+=`
      <div class="col pcal-cell ${o?`is-today`:``} p-2" style="width:14.28%;min-width:14%" data-date="${Tl(n)}" role="button">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="pcal-daynum ${o?`is-today`:``} fw-bold rounded-circle">${r}</span>
          ${s.length?`<span class="badge rounded-pill text-bg-secondary" style="font-size:.62rem">${s.length}</span>`:``}
        </div>
        <div class="d-flex flex-column gap-1 overflow-auto" style="max-height:74px">
          ${s.map(e=>`
            <span class="pcal-cita text-truncate" style="border-left:3px solid var(--bs-${_l(e)})" title="${Hl(so[gl(e)]||``)}">
              <i class="bi bi-clock me-1"></i>${Dl(e.fecha_cita)} · ${Hl(e.nombre_completo)}
            </span>`).join(``)}
        </div>
      </div>`}return`
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden pcal-card">
      <div class="row g-0 text-center py-2 fw-bold small pcal-weekhead">
        ${yl.map(e=>`<div class="col" style="width:14.28%">${e}</div>`).join(``)}
      </div>
      <div class="row g-0 flex-wrap">${a}</div>
    </div>`}function Rl(){let e=Sl(I.ref),t=new Date,n=``;for(let r=0;r<7;r++){let i=Cl(e,r),a=wl(i,t),o=Fl(i);n+=`
      <div class="col pcal-weekcol" data-date="${Tl(i)}" role="button" style="min-width:0">
        <div class="text-center py-2 pcal-weekhead-day ${a?`is-today`:``}">
          <div class="small text-body-secondary">${yl[i.getDay()]}</div>
          <div class="fw-bold ${a?`text-primary`:``}">${i.getDate()}</div>
        </div>
        <div class="p-2 d-flex flex-column gap-1">
          ${o.length===0?`<div class="text-body-secondary text-center small mt-3">—</div>`:o.map(e=>`
            <span class="pcal-cita" style="border-left:3px solid var(--bs-${_l(e)})" title="${Hl(so[gl(e)]||``)}">
              <span class="fw-semibold"><i class="bi bi-clock me-1"></i>${Dl(e.fecha_cita)}</span><br>
              <span class="text-truncate d-block">${Hl(e.nombre_completo)}</span>
            </span>`).join(``)}
        </div>
      </div>`}return`
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden pcal-card pcal-week-scroll">
      <div class="row g-0">${n}</div>
    </div>`}function zl(){let e=Fl(I.ref);return e.length===0?`
      <div class="card border-0 shadow-sm rounded-3 pcal-card">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-calendar-x fs-1 d-block mb-2 opacity-50"></i>
          No hay citas agendadas para este día.
        </div>
      </div>`:`
    <div class="card border-0 shadow-sm rounded-3 overflow-hidden pcal-card">
      ${e.map(e=>{let t=e.madre_nombre||e.padre_nombre||e.representante_parentesco||null,n=e.madre_tlf_whatsapp||e.padre_tlf_whatsapp||e.telefono_alumno||null;return`
        <div class="pcal-day-item d-flex align-items-center gap-3 py-3 px-3">
          <div class="text-center flex-shrink-0" style="width:78px">
            <div class="fw-bold text-primary fs-6">${Dl(e.fecha_cita)}</div>
          </div>
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="fw-semibold">${Hl(e.nombre_completo)}</span>
              <span class="badge rounded-pill text-bg-${_l(e)}" style="font-size:.65rem">${Hl(so[gl(e)]||gl(e))}</span>
            </div>
            <div class="small text-body-secondary d-flex flex-wrap gap-3">
              ${t?`<span><i class="bi bi-person me-1"></i>Rep.: ${Hl(t)}</span>`:``}
              ${n?`<span><i class="bi bi-whatsapp me-1 text-success"></i>${Hl(n)}</span>`:``}
              ${e.instrumento?`<span><i class="bi bi-music-note me-1"></i>${Hl(e.instrumento)}</span>`:``}
            </div>
          </div>
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-shrink-0 cal-cita-form" data-id="${e.id}">
            <i class="bi bi-file-earmark-person me-1"></i><span class="d-none d-sm-inline">Ver formulario</span>
          </button>
        </div>`}).join(``)}
    </div>`}function Bl(e){e.querySelectorAll(`.cal-vista`).forEach(t=>t.addEventListener(`click`,()=>{I.vista=t.dataset.vista,kl(e)})),e.querySelectorAll(`.pcal-filtro`).forEach(t=>t.addEventListener(`click`,()=>{I.filtroEstado=t.dataset.estado,Nl(e)})),e.querySelector(`#btn-today`)?.addEventListener(`click`,()=>{I.ref=new Date,kl(e)}),e.querySelector(`#btn-prev`)?.addEventListener(`click`,()=>{Vl(-1),kl(e)}),e.querySelector(`#btn-next`)?.addEventListener(`click`,()=>{Vl(1),kl(e)}),e.querySelectorAll(`[data-date]`).forEach(t=>t.addEventListener(`click`,()=>{I.vista=`dia`,I.ref=El(t.dataset.date),kl(e)})),e.querySelectorAll(`.cal-cita-form`).forEach(e=>e.addEventListener(`click`,t=>{t.stopPropagation(),f.navigate(`postulado`,{id:e.dataset.id})}))}function Vl(e){I.vista===`mes`?I.ref=new Date(I.ref.getFullYear(),I.ref.getMonth()+e,1):I.vista===`semana`?I.ref=Cl(I.ref,7*e):I.ref=Cl(I.ref,e)}function Hl(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function Ul(){f.register(`alumnos`,la),f.register(`alumnos-reporte-mes`,Ja),f.register(`alumnos-inscribir`,nc),f.register(`alumnos-pdf-demo`,gc),f.register(`alumno`,mc),f.register(`postulados`,Lc),f.register(`postulado`,sl),f.register(`postulados-calendario`,Ol)}function Wl(e){return e?{...e,nombre:e.nombre??e.name??``,codigo:e.codigo_salon??``,ubicacion:e.ubicacion??e.location??``,condicion:e.condicion_fisica??`buena`,is_active:e.is_active??e.isActive??e.activo??!0,capacidad:parseInt(e.capacidad)||20,piso:e.piso!==void 0&&e.piso!==null?parseInt(e.piso):null,equipamiento:Array.isArray(e.equipamiento)?e.equipamiento.join(`, `):e.equipamiento||``,descripcion:e.descripcion||``}:null}async function Gl(){let{data:e,error:n}=await t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0});if(n)throw console.error(`Error cargando salones:`,n.message),Error(`No se pudieron cargar los salones`);return e.map(Wl)}async function Kl(e){let n=(e.nombre||``).trim(),r=(e.codigo_salon||``).trim();if(!n)throw Error(`El nombre es obligatorio`);let{data:i,error:a}=await t.from(`salones`).select(`id, nombre, codigo_salon`).or(`nombre.eq."${n}", codigo_salon.eq."${r}"`).maybeSingle();if(a&&console.error(`Error validando duplicados:`,a),i){if(i.nombre.toLowerCase()===n.toLowerCase())throw Error(`Ya existe un salón con ese nombre`);if(r&&i.codigo_salon?.toLowerCase()===r.toLowerCase())throw Error(`Ya existe un salón con ese código`)}let o={nombre:n,codigo_salon:r||void 0,capacidad:parseInt(e.capacidad)||20,ubicacion:(e.ubicacion||``).trim(),piso:e.piso===void 0?null:parseInt(e.piso),condicion_fisica:e.condicion_fisica||`buena`,equipamiento:typeof e.equipamiento==`string`?e.equipamiento.split(`,`).map(e=>e.trim()).filter(Boolean):Array.isArray(e.equipamiento)?e.equipamiento:[],descripcion:(e.descripcion||``).trim(),is_active:e.is_active===void 0?!0:e.is_active,responsable_id:e.responsable_id||null},{data:s,error:c}=await t.from(`salones`).insert([o]).select();if(c)throw c.code===`23505`?Error(`El nombre o código del salón ya está registrado`):(console.error(`Error creando salon:`,c.message),Error(`No se pudo crear el salon`));return s[0]}async function ql(e,n){let r=(n.nombre||``).trim(),i=(n.codigo_salon||``).trim();if(r||i){let{data:n}=await t.from(`salones`).select(`id, nombre, codigo_salon`).neq(`id`,e);if(n){if(r&&n.find(e=>e.nombre.toLowerCase()===r.toLowerCase()))throw Error(`Ya existe otro salón con ese nombre`);if(i&&n.find(e=>e.codigo_salon?.toLowerCase()===i.toLowerCase()))throw Error(`Ya existe otro salón con ese código`)}}let a={...n};r&&(a.nombre=r),i&&(a.codigo_salon=i),a.capacidad&&=parseInt(a.capacidad),a.piso!==void 0&&(a.piso=parseInt(a.piso)),a.equipamiento!==void 0&&(a.equipamiento=typeof a.equipamiento==`string`?a.equipamiento.split(`,`).map(e=>e.trim()).filter(Boolean):Array.isArray(a.equipamiento)?a.equipamiento:[]),a.updated_at=new Date().toISOString();let{data:o,error:s}=await t.from(`salones`).update(a).eq(`id`,e).select();if(s)throw s.code===`23505`?Error(`El nombre o código del salón ya está registrado`):(console.error(`Error actualizando salon:`,s.message),Error(`No se pudo actualizar el salon`));return o[0]}async function Jl(e){let{error:n}=await t.from(`salones`).update({is_active:!1,updated_at:new Date().toISOString()}).eq(`id`,e);if(n)throw console.error(`Error eliminando salon:`,n.message),Error(`No se pudo inactivar el salon`)}var Yl=new class{constructor(){this.salones=[],this.cargando=!1,this.error=null,this.listeners=[]}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){this.listeners.forEach(e=>e(this))}async fetchSalones(){this.cargando=!0,this.error=null,this.notify();try{this.salones=await Gl()}catch(e){this.error=e.message,console.error(e)}finally{this.cargando=!1,this.notify()}}getFiltered(e=``,t=``,n=``){return this.salones.filter(r=>{let i=e.toLowerCase(),a=r.nombre.toLowerCase().includes(i)||r.codigo&&r.codigo.toLowerCase().includes(i)||r.ubicacion.toLowerCase().includes(i),o=t===``||String(r.piso)===String(t),s=n===``||r.condicion===n;return a&&o&&s})}},Xl={editandoId:null};function Zl(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}function Ql(e){if(!e)return`?`;let t=String(e).trim().split(/\s+/);return t.length===1?t[0].substring(0,2).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()}function $l(e){e.innerHTML=`
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
  `;let t=e.querySelector(`#salonesTableBody`),n=e.querySelector(`#searchSalon`),r=e.querySelector(`#filterCondicion`),i=e.querySelector(`#filterPiso`),a=e.querySelector(`#salonesCount`),o=()=>{let e=n.value,o=r.value,c=i.value,l=Yl.getFiltered(e,c,o);if(Yl.cargando){t.innerHTML=`<div class="text-center py-5 text-muted"><div class="spinner-border text-primary mb-3" role="status"></div><br><small class="text-muted">Cargando salones...</small></div>`;return}if(Yl.error){t.innerHTML=`<div class="text-center py-5 text-danger"><i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i> Error: ${Zl(Yl.error)}</div>`;return}if(l.length===0){t.innerHTML=`
        <div class="text-center py-5 w-100 text-muted list-group-item" style="background: transparent; border: none;">
          <i class="bi bi-inbox fs-1 d-block mb-3" style="color: var(--bs-secondary);"></i>
          No se encontraron salones con esos filtros.
        </div>`;return}a.textContent=l.length,t.innerHTML=l.map(e=>{let t=Ql(e.nombre||`S`),n=e.is_active!==!1,r=s(e.condicion),i=`border-accent-${n?`success`:`secondary`}`,a=`bg-${n?`success`:`secondary`}`;return`
        <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${i}" data-id="${e.id}" style="cursor: pointer;">
          <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
            <div class="position-relative flex-shrink-0">
              <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">${t}</div>
              <span class="position-absolute bottom-0 end-0 p-1 ${a} border border-light rounded-circle" style="transform: translate(10%, 10%);">
                <span class="visually-hidden">${n?`Activo`:`Inactivo`}</span>
              </span>
            </div>
            <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
              <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${Zl(e.nombre||`-`)}</span>
              <small class="text-muted text-truncate">Capacidad: ${e.capacidad||`-`} personas • Piso: ${e.piso===0||e.piso===`0`?`Planta Baja`:`Piso ${e.piso}`}</small>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            ${r}
            <i class="bi bi-chevron-right text-muted ms-1" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
          </div>
        </div>
      `}).join(``)},s=e=>`<span class="badge badge-compact ${{excelente:`bg-success`,buena:`bg-primary`,regular:`bg-warning`,mala:`bg-danger`}[e]||`bg-secondary`}">${{excelente:`Excelente`,buena:`Buena`,regular:`Regular`,mala:`Mala`}[e]||`-`}</span>`,c=Yl.subscribe(o),l;n.addEventListener(`input`,()=>{clearTimeout(l),l=setTimeout(o,300)}),r.addEventListener(`change`,o),i.addEventListener(`change`,o),e.querySelector(`#btnCrearSalon`)?.addEventListener(`click`,()=>{eu()}),t?.addEventListener(`click`,async e=>{let t=e.target.closest(`.list-group-item[data-id]`);if(t){let e=t.dataset.id;nu(e)}}),Yl.fetchSalones(),e.cleanup=()=>{c()}}function eu(){Xl.editandoId=null,_.open({title:`Crear Nuevo Salón`,body:`<form class="row g-2" id="formSalon">
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
    </form>`,saveText:`Guardar`,onSave:async e=>{let t=e.querySelector(`#modal-nombre`).value.trim(),n=parseInt(e.querySelector(`#modal-capacidad`).value),r=e.querySelector(`#modal-piso`).value,i=e.querySelector(`#modal-condicion`).value,a=e.querySelector(`#modal-esActivo`).value===`true`,o=e.querySelector(`#modal-equipamiento`).value.trim(),s=e.querySelector(`#modal-descripcion`).value.trim();if(!t||!n||!r)return c.error(`Por favor complete los campos obligatorios`),!1;await Kl({nombre:t,capacidad:n,piso:r,condicion_fisica:i,is_active:a,equipamiento:o,descripcion:s}),Yl.fetchSalones(),c.success(`Salón creado correctamente`)}})}function tu(e){let t=Yl.salones.find(t=>t.id===e);if(!t){c.error(`Salón no encontrado`);return}Xl.editandoId=e,_.open({title:`Editar Salón`,body:`<form class="row g-2" id="formSalon">
      <div class="col-12">
        <label class="form-label-compact">Nombre *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" required value="${Zl(t.nombre||``)}">
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
        <textarea class="form-control input-dense" id="modal-equipamiento" rows="2">${Zl(t.equipamiento||``)}</textarea>
      </div>
      <div class="col-12">
        <label class="form-label-compact">Descripción</label>
        <textarea class="form-control input-dense" id="modal-descripcion" rows="2">${Zl(t.descripcion||``)}</textarea>
      </div>
    </form>`,saveText:`Guardar cambios`,onSave:async t=>{try{let n=t.querySelector(`#modal-nombre`).value.trim(),r=parseInt(t.querySelector(`#modal-capacidad`).value),i=t.querySelector(`#modal-piso`).value,a=t.querySelector(`#modal-condicion`).value,o=t.querySelector(`#modal-esActivo`).value===`true`,s=t.querySelector(`#modal-equipamiento`).value.trim(),l=t.querySelector(`#modal-descripcion`).value.trim();return!n||!r||!i?(c.error(`Por favor complete los campos obligatorios`),!1):(await ql(e,{nombre:n,capacidad:r,piso:i,condicion_fisica:a,is_active:o,equipamiento:s,descripcion:l}),await Yl.fetchSalones(),c.success(`Salón actualizado correctamente`),!0)}catch(e){return console.error(`Error al actualizar salón:`,e),c.error(e.message||`Error al actualizar el salón`),!1}}})}function nu(e){let t=Yl.salones.find(t=>t.id===e);if(!t){c.error(`Salón no encontrado`);return}let n=t.piso===0||t.piso===`0`?`Planta Baja`:`Piso ${t.piso}`,r={excelente:`Excelente`,buena:`Buena`,regular:`Regular`,mala:`Mala`}[t.condicion]||`-`,i=t.is_active===!1?`Inactivo`:`Activo`,a=t.is_active===!1?`bg-secondary`:`bg-success`;_.open({title:Zl(t.nombre||`Salón`),hideSave:!0,cancelText:`Cerrar`,onShow:t=>{t.querySelector(`#modal-view-btn-edit`)?.addEventListener(`click`,()=>{_.close(),setTimeout(()=>tu(e),300)}),t.querySelector(`#modal-view-btn-delete`)?.addEventListener(`click`,()=>{_.close(),setTimeout(()=>ru(e),300)})},body:`
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label class="form-label fw-bold">Código</label>
            <p class="form-control-plaintext"><code>${Zl(t.codigo||`-`)}</code></p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Nombre</label>
            <p class="form-control-plaintext">${Zl(t.nombre||`-`)}</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Capacidad</label>
            <p class="form-control-plaintext">${t.capacidad||`-`} personas</p>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Ubicación</label>
            <p class="form-control-plaintext">${Zl(n)}</p>
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
            <p class="form-control-plaintext">${Zl(t.equipamiento||`Sin equipamiento registrado`)}</p>
          </div>
        </div>
      </div>
      ${t.descripcion?`
      <hr>
      <div class="row">
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label fw-bold">Descripción</label>
            <p class="form-control-plaintext">${Zl(t.descripcion)}</p>
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
    `})}function ru(e){let t=Yl.salones.find(t=>t.id===e);if(!t){c.error(`Salón no encontrado`);return}_.open({title:`⚠️ Inactivar Salón`,size:`sm`,saveText:`Inactivar`,body:`<p>¿Inactivar el salón <strong>${Zl(t.nombre)}</strong>?</p>
           <p class="text-muted small mb-0">Esta acción lo ocultará de las asignaciones de clases.</p>`,onSave:async()=>{await Jl(e),Yl.fetchSalones(),c.success(`Salón inactivado correctamente`)}})}function iu(){f.register(`salones`,$l)}var L={azul:[20,60,130],azulClaro:[220,232,250],azulMedio:[40,90,170],dorado:[198,160,20],blanco:[255,255,255],grisOscuro:[40,40,40],grisMedio:[100,100,100],grisClaro:[245,245,248]},au=215.9,ou=279.4,R=14;function su(){return new Date().toLocaleDateString(`es-DO`,{day:`2-digit`,month:`long`,year:`numeric`})}function cu(e,t=`—`){return String(e??``).trim()||t}function lu(e,t,n=``){return e.setFillColor(...L.azul),e.rect(0,0,au,32,`F`),e.setFillColor(...L.dorado),e.rect(0,32,au,2.5,`F`),e.setFillColor(...L.dorado),e.rect(0,0,4,34.5,`F`),e.setTextColor(...L.blanco),e.setFont(`helvetica`,`bold`),e.setFontSize(15),e.text(`EL SISTEMA PUNTA CANA`,R+2,13),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(200,215,240),e.text(`Programa de Formación Musical · República Dominicana`,R+2,20),e.setFont(`helvetica`,`bold`),e.setFontSize(9),e.setTextColor(...L.dorado),e.text(t,au-R,13,{align:`right`}),n&&(e.setFont(`helvetica`,`normal`),e.setFontSize(7.5),e.setTextColor(190,205,230),e.text(n,au-R,20,{align:`right`})),e.setTextColor(...L.grisOscuro),42}function uu(e,t){e.setFillColor(...L.azul),e.rect(0,ou-12,au,12,`F`),e.setFillColor(...L.dorado),e.rect(0,ou-12,4,12,`F`),e.setFont(`helvetica`,`normal`),e.setFontSize(6.5),e.setTextColor(...L.blanco),e.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,R+2,ou-4.5),e.text(`Pág. ${t}`,au-R,ou-4.5,{align:`right`})}var du={lunes:`Lunes`,martes:`Martes`,miércoles:`Miércoles`,jueves:`Jueves`,viernes:`Viernes`,sábado:`Sábado`,domingo:`Domingo`};function fu(e,t){return`clase-${e.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``)}-${t}.pdf`}function pu(e){return e.map((e,t)=>{let n=e.alumno||{},r=e.fecha_inscripcion?new Date(e.fecha_inscripcion+`T12:00:00`).toLocaleDateString(`es-DO`,{day:`numeric`,month:`short`,year:`numeric`}).replace(` de `,` `):`—`,i=e.hora_inicio&&e.hora_fin?`${e.hora_inicio.slice(0,5)} - ${e.hora_fin.slice(0,5)}`:`—`;return[t+1,cu(n.nombre_completo),cu(n.documento_identidad),cu(n.instrumento_principal),cu(n.telefono),r,i]})}function mu(e,t=[]){return!Array.isArray(e)||e.length===0?`Sin horario`:e.map(e=>{let n=du[e.dia]||e.dia,r=(e.hora_inicio||``).slice(0,5),i=(e.hora_fin||``).slice(0,5),a=t.find(t=>t.id===e.salon_id);return`${n} ${r} - ${i} · ${a?a.nombre:`Sin salón`}`}).join(`
`)}function hu(e,t){let{maestros:n=[],programas:r=[],salones:i=[]}=t,a=n.find(t=>t.id===e.maestro_principal_id),o=n.find(t=>t.id===e.maestro_suplente_id),s=r.find(t=>t.id===e.programa_id);return{maestroPrincipal:a?a.nombre_completo||a.nombre:`—`,maestroSuplente:o?o.nombre_completo||o.nombre:`—`,programa:s?s.nombre:`—`,capacidad:e.capacidad_maxima||`—`}}function gu(e,t,n){let r=hu(t,n),i=mu(t.horarios,n.salones);e.setFillColor(...L.azulClaro),e.roundedRect(R,42,au-R*2,24,2,2,`F`),e.setFont(`helvetica`,`bold`),e.setFontSize(13),e.setTextColor(...L.azul),e.text(cu(t.nombre),R+4,49),e.setFont(`helvetica`,`normal`),e.setFontSize(8),e.setTextColor(...L.grisMedio);let a=`Maestro: ${r.maestroPrincipal}  ·  Suplente: ${r.maestroSuplente}  ·  Programa: ${r.programa}  ·  Capacidad: ${r.capacidad}`;return e.text(a,R+4,57),e.setFontSize(7.5),e.text(`Horarios: ${i.split(`
`)[0]}`,R+4,63),i.includes(`
`)?(e.text(`         ${i.split(`
`)[1]}`,R+4,69),72):66}function _u(e,t,n){let r=new ke({unit:`mm`,format:`letter`}),i=su(),a=fu(e.nombre,new Date().toISOString().slice(0,10));lu(r,`FICHA DE CLASE`,`Generado: ${i}`);let o=gu(r,e,n);if(e.descripcion){r.setFont(`helvetica`,`italic`),r.setFontSize(8),r.setTextColor(...L.grisMedio);let t=r.splitTextToSize(e.descripcion,au-R*2);o+=2,r.text(t,R,o),o+=t.length*4+2}if(r.setFont(`helvetica`,`bold`),r.setFontSize(8.5),r.setTextColor(...L.grisOscuro),r.text(`Alumnos inscritos: ${t.length}`,R,o),o+=5,t.length>0){let n=pu(t);Ae(r,{startY:o,margin:{left:R,right:R},theme:`grid`,head:[[`#`,`Nombre`,`Cédula`,`Instrumento`,`Teléfono`,`Inscrito`,`Horario`]],headStyles:{fillColor:L.azul,textColor:L.blanco,fontStyle:`bold`,fontSize:7.5},styles:{fontSize:7,cellPadding:{top:1.5,bottom:1.5,left:2,right:2},overflow:`linebreak`},alternateRowStyles:{fillColor:L.grisClaro},body:n,didDrawPage:t=>{lu(r,`FICHA DE CLASE`,`Continuación · ${e.nombre}`),uu(r,t.pageNumber)}})}uu(r,1),r.save(a)}function vu(e,t){let n=new ke({unit:`mm`,format:`letter`,orientation:`landscape`}),r=su(),i=279.4,a=215.9;function o(e,t=``){n.setFillColor(...L.azul),n.rect(0,0,i,32,`F`),n.setFillColor(...L.dorado),n.rect(0,32,i,2.5,`F`),n.setFillColor(...L.dorado),n.rect(0,0,4,34.5,`F`),n.setTextColor(...L.blanco),n.setFont(`helvetica`,`bold`),n.setFontSize(15),n.text(`EL SISTEMA PUNTA CANA`,R+2,13),n.setFont(`helvetica`,`normal`),n.setFontSize(8),n.setTextColor(200,215,240),n.text(`Programa de Formación Musical · República Dominicana`,R+2,20),n.setFont(`helvetica`,`bold`),n.setFontSize(9),n.setTextColor(...L.dorado),n.text(e,i-R,13,{align:`right`}),t&&(n.setFont(`helvetica`,`normal`),n.setFontSize(7.5),n.setTextColor(190,205,230),n.text(t,i-R,20,{align:`right`})),n.setTextColor(...L.grisOscuro)}function s(e){n.setFillColor(...L.azul),n.rect(0,a-12,i,12,`F`),n.setFillColor(...L.dorado),n.rect(0,a-12,4,12,`F`),n.setFont(`helvetica`,`normal`),n.setFontSize(6.5),n.setTextColor(...L.blanco),n.text(`El Sistema Punta Cana · Punta Cana, Rep. Dominicana`,R+2,a-4.5),n.text(`Pág. ${e}`,i-R,a-4.5,{align:`right`})}o(`LISTADO DE ALUMNOS POR CLASE`,r),n.setFont(`helvetica`,`normal`),n.setFontSize(8),n.setTextColor(...L.grisMedio),n.text(`Total clases: ${e.length}  ·  Generado: ${r}`,R,38);let c=44;e.forEach(({clase:e,inscritos:r},l)=>{let u=hu(e,t);if(c>a-35&&(s(n.internal.getNumberOfPages()),n.addPage(),o(`LISTADO DE ALUMNOS POR CLASE`,`Continuación`),c=38),n.setFillColor(...L.azulClaro),n.rect(R,c,i-R*2,10,`F`),n.setFont(`helvetica`,`bold`),n.setFontSize(9),n.setTextColor(...L.azul),n.text(`${l+1}. ${cu(e.nombre)}  (${u.maestroPrincipal})`,R+3,c+6.5),n.setFont(`helvetica`,`normal`),n.setFontSize(7),n.setTextColor(...L.grisMedio),n.text(`Alumnos: ${r.length}`,i-R-3,c+6.5,{align:`right`}),c+=12,r.length>0){let e=pu(r);Ae(n,{startY:c,margin:{left:R,right:R},theme:`grid`,head:[[`#`,`Nombre`,`Cédula`,`Instrumento`,`Teléfono`,`Inscrito`,`Horario`]],headStyles:{fillColor:L.azul,textColor:L.blanco,fontStyle:`bold`,fontSize:7},styles:{fontSize:6.5,cellPadding:{top:1.2,bottom:1.2,left:1.5,right:1.5},overflow:`linebreak`},alternateRowStyles:{fillColor:L.grisClaro},columnStyles:{0:{cellWidth:8},1:{cellWidth:55}},body:e,didDrawPage:e=>{o(`LISTADO DE ALUMNOS POR CLASE`,`Continuación`),s(e.pageNumber)}}),c=n.lastAutoTable.finalY+8}else n.setFont(`helvetica`,`italic`),n.setFontSize(7.5),n.setTextColor(...L.grisMedio),n.text(`(Sin alumnos inscritos)`,R+5,c+4),c+=12});let l=n.internal.getNumberOfPages();for(let e=1;e<=l;e++)n.setPage(e),s(e);let u=new Date().toISOString().slice(0,10);n.save(`listado-alumnos-por-clase-${u}.pdf`)}var z={clases:[],clasesOriginales:[],maestros:[],salones:[],programas:[],alumnos:[],cargando:!1,filtroEstado:`todos`,filtroInstrumento:``,filtroNivel:``,filtroTipo:``,filtroSalon:``,filtroDia:``,filtroBuscar:``,vista:`tabla`,container:null,mostrarDiasVacios:!0};async function yu(e){if(e)try{z.container=e,z.cargando=!0,bu(e);let[n,r,i,a,o]=await Promise.all([ye(),t.from(`maestros`).select(`*`).order(`nombre_completo`,{ascending:!0}),t.from(`salones`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`programas`).select(`*`).order(`nombre`,{ascending:!0}),t.from(`alumnos`).select(`*`).eq(`activo`,!0).order(`nombre_completo`,{ascending:!0})]);z.clases=n,z.clasesOriginales=[...n],z.maestros=r.data||[],z.salones=i.data||[],z.programas=a.data||[],z.alumnos=o.data||[],z.cargando=!1,wu(e),Au(e)}catch(t){console.error(t),xu(e,t.message)}}function bu(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando clases...</p>
      </div>
    </div>
  `}function xu(e,t){e.innerHTML=`
    <div class="container mt-5 text-center">
      <div class="alert alert-danger d-inline-block" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${v(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn">Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>yu(e))}function Su(){return[...new Set(z.clasesOriginales.map(e=>e.instrumento).filter(Boolean).sort())].map(e=>`<option value="${v(e)}" ${z.filtroInstrumento===e?`selected`:``}>${v(e)}</option>`).join(``)}function Cu(){let e=z.salones.map(e=>e.nombre||e.name||e).filter(Boolean),t=z.clasesOriginales.map(e=>e.salon).filter(Boolean);return[...new Set([...e,...t])].sort().map(e=>`<option value="${v(e)}" ${z.filtroSalon===e?`selected`:``}>${v(e)}</option>`).join(``)}function wu(e){e.innerHTML=`
    <div class="page-container">
      <div class="clases-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-book fs-4"></i>
          </div>
          <div>
            <h1 class="clases-title-premium mb-0">Clases</h1>
            <p class="text-muted small mb-0">${z.clases.length} clases en total</p>
          </div>
        </div>
        
        <div class="clases-header-actions">
          <button class="btn-help-trigger" id="btn-help-clases" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
            <i class="bi bi-question"></i>
          </button>
          <div class="view-segmented-control">
            <button class="view-segment-btn ${z.vista===`tabla`?`active`:``}" id="btn-vista-tabla" title="Vista de lista">
              <i class="bi bi-list-ul"></i>
            </button>
            <button class="view-segment-btn ${z.vista===`calendario`?`active`:``}" id="btn-vista-calendario" title="Vista de agenda">
              <i class="bi bi-calendar-week"></i>
            </button>
          </div>
          <button class="btn btn-outline-secondary" id="btnPdfListadoAlumnosClases" type="button">
            <i class="bi bi-file-earmark-pdf me-1"></i>PDF Listados Alumnos x Clases
          </button>
          <button class="btn btn-premium-action" id="btnAgregarClase">
            <i class="bi bi-plus-lg me-1.5"></i>Nueva Clase
          </button>
        </div>
      </div>

      <div class="clases-filter-toolbar mb-4 flex-wrap gap-2">
        <div class="premium-search-container flex-grow-1" style="min-width:200px;">
          <i class="bi bi-search search-icon-muted"></i>
          <input type="text" class="form-control premium-search-input" placeholder="Buscar por nombre, maestro, instrumento..." id="buscar" value="${v(z.filtroBuscar)}">
        </div>

        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroEstado">
            <option value="todos"      ${z.filtroEstado===`todos`?`selected`:``}>Todos los estados</option>
            <option value="activa"     ${z.filtroEstado===`activa`?`selected`:``}>Activa</option>
            <option value="suspendida" ${z.filtroEstado===`suspendida`?`selected`:``}>Pausada</option>
            <option value="finalizada" ${z.filtroEstado===`finalizada`?`selected`:``}>Finalizada</option>
            <option value="emergente"  ${z.filtroEstado===`emergente`?`selected`:``}>Emergente</option>
            <option value="cancelada"  ${z.filtroEstado===`cancelada`?`selected`:``}>Cancelada</option>
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-music-note select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroInstrumento">
            <option value="">Instrumento</option>
            ${Su()}
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-bar-chart-steps select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroNivel">
            <option value=""           ${z.filtroNivel===``?`selected`:``}>Nivel</option>
            <option value="iniciacion" ${z.filtroNivel===`iniciacion`?`selected`:``}>Iniciación</option>
            <option value="basico"     ${z.filtroNivel===`basico`?`selected`:``}>Básico</option>
            <option value="intermedio" ${z.filtroNivel===`intermedio`?`selected`:``}>Intermedio</option>
            <option value="avanzado"   ${z.filtroNivel===`avanzado`?`selected`:``}>Avanzado</option>
            <option value="preparatoria" ${z.filtroNivel===`preparatoria`?`selected`:``}>Preparatoria</option>
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-tag select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroTipo">
            <option value=""            ${z.filtroTipo===``?`selected`:``}>Tipo</option>
            <option value="regular"     ${z.filtroTipo===`regular`?`selected`:``}>Regular</option>
            <option value="taller"      ${z.filtroTipo===`taller`?`selected`:``}>Taller</option>
            <option value="seccional"   ${z.filtroTipo===`seccional`?`selected`:``}>Seccional</option>
            <option value="orquesta"    ${z.filtroTipo===`orquesta`?`selected`:``}>Orquesta</option>
            <option value="coro"        ${z.filtroTipo===`coro`?`selected`:``}>Coro</option>
            <option value="preparatoria" ${z.filtroTipo===`preparatoria`?`selected`:``}>Preparatoria</option>
            <option value="iniciacion"  ${z.filtroTipo===`iniciacion`?`selected`:``}>Iniciación</option>
            <option value="emergente"   ${z.filtroTipo===`emergente`?`selected`:``}>Emergente</option>
            <option value="refuerzo"    ${z.filtroTipo===`refuerzo`?`selected`:``}>Refuerzo</option>
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-door-open select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroSalon">
            <option value="">Salón</option>
            ${Cu()}
          </select>
        </div>

        <div class="premium-select-container">
          <i class="bi bi-calendar-week select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="filtroDia">
            <option value=""         ${z.filtroDia===``?`selected`:``}>Día</option>
            <option value="lunes"    ${z.filtroDia===`lunes`?`selected`:``}>Lunes</option>
            <option value="martes"   ${z.filtroDia===`martes`?`selected`:``}>Martes</option>
            <option value="miercoles" ${z.filtroDia===`miercoles`?`selected`:``}>Miércoles</option>
            <option value="jueves"   ${z.filtroDia===`jueves`?`selected`:``}>Jueves</option>
            <option value="viernes"  ${z.filtroDia===`viernes`?`selected`:``}>Viernes</option>
            <option value="sabado"   ${z.filtroDia===`sabado`?`selected`:``}>Sábado</option>
          </select>
        </div>

        <button class="btn btn-outline-secondary btn-sm align-self-center" id="btnLimpiarFiltros" type="button" title="Limpiar filtros">
          <i class="bi bi-x-circle me-1"></i>Limpiar
        </button>
      </div>

      <div id="view-content">
        ${z.vista===`tabla`?Tu():Ou()}
      </div>
    </div>
  `}function Tu(){return z.clases.length===0?Du():`
    <div class="page-glass rounded w-100">
      <div class="list-group list-group-flush w-100" id="clasesListBody">
        ${z.clases.map(e=>Eu(e)).join(``)}
      </div>
    </div>
  `}function Eu(e){let t=e.nombre||`Sin nombre`,n=z.maestros.find(t=>t.id===e.maestro_principal_id),r=n?n.nombre_completo||n.nombre:`Sin maestro`,i=z.maestros.find(t=>t.id===e.maestro_suplente_id),a=i?i.nombre_completo||i.nombre:null,o=ge(t),s=e.estado||`activa`,c=`border-accent-${s===`activa`?`success`:s===`suspendida`?`warning`:`secondary`}`,l=`bg-${s===`activa`?`success`:s===`suspendida`?`warning`:`secondary`}`,u=(e.horarios||[]).slice(0,3),d=u.length>0?u.map(e=>`${(e.dia||``).slice(0,2).toUpperCase()} ${(e.hora_inicio||``).slice(0,5)}`).join(` • `):`Sin horarios`;return`
    <div class="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 w-100 border-start-accent ${c}" data-id="${e.id}" style="cursor: pointer;">
      <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
        <div class="position-relative flex-shrink-0">
          <div class="avatar-compact bg-primary bg-opacity-10 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 48px; height: 48px; font-size: 1.2rem; font-weight: 600;">
            ${o}
          </div>
          <span class="position-absolute bottom-0 end-0 p-1 ${l} border border-light rounded-circle" style="transform: translate(10%, 10%);">
            <span class="visually-hidden">${s}</span>
          </span>
        </div>
        <div class="d-flex flex-column flex-grow-1 overflow-hidden pe-3">
          <span class="fw-bold text-truncate" style="font-size: 1.05rem;">${v(t)}</span>
          <small class="text-muted text-truncate"><i class="bi bi-person-badge me-1"></i>${v(r)} • ${v(e.instrumento||`-`)}</small>
          ${a?`<small class="text-muted text-truncate" style="font-size: 0.82rem;"><i class="bi bi-person-dash me-1"></i>Suplente: ${v(a)}</small>`:``}
          <small class="text-muted extra-small mt-1" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i>${v(d)}</small>
        </div>
      </div>
      <div class="flex-shrink-0 d-flex align-items-center gap-2 ms-2 pe-1">
        <button class="btn btn-outline-secondary btn-sm btn-class-pdf" data-id="${e.id}" type="button" title="PDF Listado Alumnos x Clase">
          <i class="bi bi-file-earmark-pdf me-1"></i>PDF Listado Alumnos x Clase
        </button>
        <span class="text-muted">
          <i class="bi bi-chevron-right" style="font-size: 1.1rem; transition: transform 0.2s ease;"></i>
        </span>
      </div>
    </div>
  `}function Du(){return`
    <div class="text-center py-5 text-muted">
      <i class="bi bi-funnel fs-1 d-block mb-2 opacity-50"></i>
      <p class="mb-1">No se encontraron clases con los filtros seleccionados.</p>
      <small>Probá ajustar o limpiar los filtros.</small>
    </div>
  `}function Ou(){if(z.clases.length===0)return Du();let e=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`],t={lunes:`Lunes`,martes:`Martes`,miércoles:`Miércoles`,jueves:`Jueves`,viernes:`Viernes`,sábado:`Sábado`},n={lunes:[],martes:[],miércoles:[],jueves:[],viernes:[],sábado:[]};z.clases.forEach(e=>{(e.horarios||[]).forEach(t=>{let r=(t.dia||``).toLowerCase().trim();n[r]&&n[r].push({...t,clase:e})})}),Object.keys(n).forEach(e=>{n[e].sort((e,t)=>Oe(e.hora_inicio)-Oe(t.hora_inicio))});let r=z.mostrarDiasVacios?``:`hide-empty-days`;return`
    <div class="weekly-schedule-container">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 px-1 weekly-schedule-toolbar">
        <span class="small text-muted fw-semibold"><i class="bi bi-calendar-week me-1"></i>Agenda Semanal</span>
        <div class="form-check form-switch m-0 d-flex align-items-center gap-2">
          <input class="form-check-input cursor-pointer" type="checkbox" role="switch" id="toggle-empty-days" ${z.mostrarDiasVacios?`checked`:``}>
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
                ${r.length>0?r.map(e=>{let t=e.clase,n=t.estado||`activa`,r=Ce(e.hora_inicio),i=Ce(e.hora_fin),a=z.salones.find(t=>t.id===e.salon_id),o=a?a.nombre:`Online/Otro`;return`
                    <div class="time-block-card p-2 rounded mb-2 border-start-accent ${`border-accent-${n===`activa`?`success`:n===`suspendida`?`warning`:`secondary`}`}" data-id="${t.id}" style="cursor: pointer;">
                      <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="time-range small fw-bold text-primary"><i class="bi bi-clock me-1"></i>${r} - ${i}</span>
                        <i class="bi ${fe(t.instrumento)} text-muted" style="font-size: 0.85rem;"></i>
                      </div>
                      <div class="fw-semibold text-truncate small class-name" style="font-size: 0.9rem;">${v(t.nombre)}</div>
                      <div class="d-flex justify-content-between align-items-center mt-1 extra-small text-muted">
                        <span class="text-truncate" style="max-width: 60%;"><i class="bi bi-person me-0.5"></i>${v(z.maestros.find(e=>e.id===t.maestro_principal_id)?.nombre_completo||`Sin maestro`)}</span>
                        <span class="badge bg-body-secondary text-body-secondary-custom px-1.5 py-0.5 rounded" style="font-size: 0.7rem;"><i class="bi bi-geo-alt me-0.5"></i>${v(o)}</span>
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
  `}async function ku(e){if(e){_.open({title:`Cargando...`,hideSave:!0,size:`md`,body:`
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted">Cargando perfil de la clase...</p>
      </div>
    `});try{let t=await Te(e.id),n=t.length,r=z.maestros.find(t=>t.id===e.maestro_principal_id),i=r?r.nombre_completo||r.nombre:`Sin maestro`,a=e.tiene_suplente||e.maestro_suplente_id?z.maestros.find(t=>t.id===e.maestro_suplente_id):null,o=a?a.nombre_completo||a.nombre:null,s=z.programas.find(t=>t.id===e.programa_id),l=s?s.nombre:`Sin programa`,u=``;u=e.horarios&&e.horarios.length>0?e.horarios.map(e=>{let t=e.dia.charAt(0).toUpperCase()+e.dia.slice(1),n=z.salones.find(t=>t.id===e.salon_id),r=n?n.nombre:`Online/Otro`;return`
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-secondary-subtle text-secondary-custom py-1" style="font-size: 0.75rem; min-width: 60px;">${t}</span>
            <span class="small fw-semibold">${Ce(e.hora_inicio)} - ${Ce(e.hora_fin)}</span>
            <span class="small text-muted">• <i class="bi bi-geo-alt me-0.5"></i>${v(r)}</span>
          </div>
        `}).join(``):`<div class="text-muted small">Sin horarios asignados</div>`;let d=``;d=t&&t.length>0?`
        <div class="list-group list-group-flush border-top">
          ${t.map(e=>{let t=e.alumno;if(!t)return``;let n=ge(t.nombre_completo||t.nombre||`?`);return`
              <div class="list-group-item d-flex align-items-center gap-3 py-2 px-3 border-bottom-0 bg-transparent">
                <div class="avatar-compact text-white d-flex align-items-center justify-content-center rounded-circle" style="width: 32px; height: 32px; font-size: 0.85rem; background-color: ${be(t.id)}; font-weight:600;">
                  ${n}
                </div>
                <div class="d-flex flex-column overflow-hidden">
                  <span class="fw-semibold text-truncate small" style="font-size: 0.9rem; color: var(--bs-body-color);">${v(t.nombre_completo||t.nombre)}</span>
                  <small class="text-muted extra-small">${v(t.instrumento_principal||`Sin instrumento`)}</small>
                </div>
              </div>
            `}).join(``)}
        </div>
      `:`
        <div class="text-muted text-center py-4 small bg-body-tertiary rounded">
          <i class="bi bi-people d-block mb-1 opacity-50" style="font-size: 1.25rem;"></i>
          No hay alumnos inscritos en esta clase
        </div>
      `;let f=e.capacidad_maxima||20,p=Math.min(100,Math.round(n/f*100)),m=`bg-success`;p>=90?m=`bg-danger`:p>=70&&(m=`bg-warning`);let h=`
      <div class="class-profile-container">
        <!-- Profile Header / Hero Card -->
        <div class="class-hero-card d-flex align-items-center gap-3 p-3 rounded mb-4" style="background: linear-gradient(135deg, rgba(13,110,253,0.08) 0%, rgba(88,86,214,0.08) 100%); border: 1px solid rgba(13,110,253,0.15);">
          <div class="position-relative">
            <div class="avatar-large bg-primary bg-opacity-15 text-primary border border-primary-subtle d-flex align-items-center justify-content-center rounded-circle" style="width: 56px; height: 56px; font-size: 1.5rem; font-weight: 700;">
              <i class="bi ${fe(e.instrumento)}"></i>
            </div>
            <span class="position-absolute bottom-0 end-0 p-1.5 bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} border border-light rounded-circle" style="transform: translate(10%, 10%);"></span>
          </div>
          <div class="overflow-hidden">
            <h4 class="mb-1 fw-bold text-truncate" style="letter-spacing: -0.02em; font-size: 1.2rem; color: var(--bs-body-color);">${v(e.nombre)}</h4>
            <span class="badge rounded-pill bg-${e.estado===`activa`?`success`:e.estado===`suspendida`?`warning`:`secondary`} text-capitalize" style="font-size: 0.75rem;">${_e(e.estado)}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-person-badge me-1"></i>Maestro Principal</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${v(i)}</span>
              ${o?`<small class="text-muted d-block extra-small mt-1"><i class="bi bi-person me-0.5"></i>Suplente: ${v(o)}</small>`:``}
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-music-note me-1"></i>Instrumento</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${v(e.instrumento||`Sin asignar`)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-1"><i class="bi bi-collection me-1"></i>Programa</small>
              <span class="fw-semibold text-body-color-custom" style="font-size: 0.95rem;">${v(l)}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-item-glass p-3 rounded h-100 border">
              <small class="text-muted d-block mb-2"><i class="bi bi-calendar3 me-1"></i>Horarios y Salones</small>
              <div class="horarios-list-container">
                ${u}
              </div>
            </div>
          </div>
        </div>

        <!-- Enrollment Progress Bar -->
        <div class="enrollment-occupancy-card p-3 rounded mb-4 border bg-body-tertiary">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold small text-muted"><i class="bi bi-people me-1"></i>Ocupación e Inscripciones</span>
            <span class="badge bg-secondary bg-opacity-10 text-secondary-custom small fw-semibold" style="font-size: 0.75rem;">${n} / ${f} Alumnos</span>
          </div>
          <div class="progress bg-body-secondary" style="height: 10px; border-radius: 6px; overflow: hidden;">
            <div class="progress-bar ${m} progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${p}%" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${f}"></div>
          </div>
        </div>

        <!-- Description / Pedagogical Notes -->
        <div class="description-card p-3 rounded mb-4 border bg-body-tertiary">
          <small class="text-muted d-block mb-1"><i class="bi bi-file-earmark-text me-1"></i>Notas Pedagógicas</small>
          <p class="mb-0 text-muted small" style="white-space: pre-line; line-height: 1.5;">${v(e.descripcion||`Sin notas pedagógicas registradas.`)}</p>
        </div>

        <!-- Alumnos Inscritos List -->
        <div class="alumnos-inscritos-section mb-4">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2" style="font-size: 0.95rem;">
            <i class="bi bi-person-check text-primary"></i> Alumnos Inscritos
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill small" style="font-size: 0.75rem;">${n}</span>
          </h6>
          <div class="alumnos-scroll-list border rounded" style="max-height: 180px; overflow-y: auto;">
            ${d}
          </div>
        </div>

        <!-- Action Buttons (moved inside profile modal as requested) -->
        <div class="class-profile-actions border-top pt-3 mt-4">
          <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 btn-profile-delete" data-id="${e.id}">
            <i class="bi bi-trash"></i> Eliminar Clase
          </button>
          <div class="class-profile-secondary-actions">
            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 btn-profile-pdf" data-id="${e.id}">
              <i class="bi bi-file-earmark-pdf"></i> PDF Listado Alumnos x Clase
            </button>
            <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 btn-profile-edit" data-id="${e.id}">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-secondary btn-sm btn-profile-close">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    `;_.open({title:`Perfil de Clase: ${e.nombre}`,hideSave:!0,size:`md`,body:h,onShow:n=>{let r=n.closest(`.app-modal-dialog`)?.querySelector(`.app-modal-footer`);r&&r.style.setProperty(`display`,`none`,`important`),n.querySelector(`.btn-profile-pdf`)?.addEventListener(`click`,()=>{try{_u(e,t,{maestros:z.maestros,salones:z.salones,programas:z.programas}),c.success(`PDF de la clase generado`)}catch(e){console.error(e),c.error(`No se pudo generar el PDF de la clase`)}}),n.querySelector(`.btn-profile-edit`)?.addEventListener(`click`,()=>{_.close(),setTimeout(()=>{Zn(e,{maestros:z.maestros,salones:z.salones,programas:z.programas,alumnos:z.alumnos,onSuccess:()=>yu(z.container)})},250)}),n.querySelector(`.btn-profile-delete`)?.addEventListener(`click`,()=>{_.close(),setTimeout(()=>{Nu(e.id)},250)}),n.querySelector(`.btn-profile-close`)?.addEventListener(`click`,()=>{_.close()})}})}catch(e){console.error(e),c.error(`Error al cargar la información detallada de la clase`),_.close()}}}function Au(e){e.querySelector(`#btn-help-clases`)?.addEventListener(`click`,()=>{hr.open({title:`Clases`,intro:`Gestión completa de clases: creación, horarios, asignación de maestros, inscripción de alumnos y control de capacidad.`,sections:[{icon:`bi-easel2`,title:`Lista de clases`,description:`Todas las clases del sistema. Filtrá por instrumento, nivel y estado. Las activas aparecen primero.`,color:`#3b82f6`},{icon:`bi-clock`,title:`Horarios`,description:`Cada clase puede tener múltiples horarios semanales. El sistema detecta conflictos de salón y de maestro automáticamente.`,color:`#6366f1`},{icon:`bi-people`,title:`Inscripción de alumnos`,description:`"Grupal": todos comparten el horario. "Rotativa (Turnos)": cada alumno tiene su propio horario individual dentro de la clase.`,color:`#10b981`},{icon:`bi-bar-chart`,title:`Capacidad`,description:`Barra de ocupación: inscriptos vs capacidad máxima. Rojo cuando supera el 90%.`,color:`#f59e0b`},{icon:`bi-person-workspace`,title:`Maestro titular y suplente`,description:`Cada clase tiene un maestro principal (obligatorio) y puede tener suplente (opcional). Ambos aparecen en el perfil del maestro.`,color:`#6b7280`}]})}),e.querySelector(`#btnPdfListadoAlumnosClases`)?.addEventListener(`click`,async()=>{let t=e.querySelector(`#btnPdfListadoAlumnosClases`),n=t?.innerHTML;t&&(t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Generando PDF...`);try{let e=z.clases.length?z.clases:z.clasesOriginales,t=await me(e.map(e=>e.id));vu(e.map(e=>({clase:e,inscritos:t[e.id]||[]})),{maestros:z.maestros,salones:z.salones,programas:z.programas}),c.success(`PDF de listados por clase generado`)}catch(e){console.error(e),c.error(`No se pudo generar el PDF de listados por clase`)}finally{t&&(t.disabled=!1,t.innerHTML=n)}}),e.querySelector(`#btnAgregarClase`)?.addEventListener(`click`,()=>{Zn(null,{maestros:z.maestros,salones:z.salones,programas:z.programas,alumnos:z.alumnos,onSuccess:()=>yu(e)})}),e.querySelector(`#btn-vista-tabla`)?.addEventListener(`click`,()=>{z.vista=`tabla`,ju(),wu(e),Au(e)}),e.querySelector(`#btn-vista-calendario`)?.addEventListener(`click`,()=>{z.vista=`calendario`,ju(),wu(e),Au(e)}),e.querySelector(`#buscar`)?.addEventListener(`input`,Mu),e.querySelector(`#filtroEstado`)?.addEventListener(`change`,Mu),e.querySelector(`#filtroInstrumento`)?.addEventListener(`change`,Mu),e.querySelector(`#filtroNivel`)?.addEventListener(`change`,Mu),e.querySelector(`#filtroTipo`)?.addEventListener(`change`,Mu),e.querySelector(`#filtroSalon`)?.addEventListener(`change`,Mu),e.querySelector(`#filtroDia`)?.addEventListener(`change`,Mu),e.querySelector(`#btnLimpiarFiltros`)?.addEventListener(`click`,()=>{[`buscar`,`filtroEstado`,`filtroInstrumento`,`filtroNivel`,`filtroTipo`,`filtroSalon`,`filtroDia`].forEach(t=>{let n=e.querySelector(`#${t}`);n&&(n.tagName===`SELECT`?n.value=n.options[0]?.value||``:n.value=``)}),z.filtroBuscar=``,z.filtroEstado=`todos`,z.filtroInstrumento=``,z.filtroNivel=``,z.filtroTipo=``,z.filtroSalon=``,z.filtroDia=``,Mu()});let t=e.querySelector(`#view-content`);t?.addEventListener(`change`,t=>{if(t.target&&t.target.id===`toggle-empty-days`){z.mostrarDiasVacios=t.target.checked;let n=e.querySelector(`.weekly-schedule-grid`);n&&(z.mostrarDiasVacios?n.classList.remove(`hide-empty-days`):n.classList.add(`hide-empty-days`))}}),t?.addEventListener(`click`,async e=>{let t=e.target.closest(`.btn-class-pdf[data-id]`);if(t){e.preventDefault(),e.stopPropagation();let n=t.dataset.id,r=z.clasesOriginales.find(e=>e.id===n);if(!r)return;t.disabled=!0;let i=t.innerHTML;t.innerHTML=`<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Generando...`;try{_u(r,await Te(r.id),{maestros:z.maestros,salones:z.salones,programas:z.programas}),c.success(`PDF de la clase generado`)}catch(e){console.error(e),c.error(`No se pudo generar el PDF de la clase`)}finally{t.disabled=!1,t.innerHTML=i}return}let n=e.target.closest(`.list-group-item[data-id], .time-block-card[data-id]`);if(n){let e=n.dataset.id,t=z.clasesOriginales.find(t=>t.id===e);t&&ku(t)}})}function ju(){let e=z.container;e&&(z.filtroBuscar=e.querySelector(`#buscar`)?.value||``,z.filtroEstado=e.querySelector(`#filtroEstado`)?.value||`todos`,z.filtroInstrumento=e.querySelector(`#filtroInstrumento`)?.value||``,z.filtroNivel=e.querySelector(`#filtroNivel`)?.value||``,z.filtroTipo=e.querySelector(`#filtroTipo`)?.value||``,z.filtroSalon=e.querySelector(`#filtroSalon`)?.value||``,z.filtroDia=e.querySelector(`#filtroDia`)?.value||``)}function Mu(){let e=z.container,t=e.querySelector(`#buscar`)?.value||``,n=e.querySelector(`#filtroEstado`)?.value||`todos`,r=e.querySelector(`#filtroInstrumento`)?.value||``,i=e.querySelector(`#filtroNivel`)?.value||``,a=e.querySelector(`#filtroTipo`)?.value||``,o=e.querySelector(`#filtroSalon`)?.value||``,s=e.querySelector(`#filtroDia`)?.value||``,c=g(t);z.clases=z.clasesOriginales.filter(e=>{if(c){let t=z.maestros.find(t=>t.id===e.maestro_principal_id),n=z.maestros.find(t=>t.id===e.maestro_suplente_id);if(!g([e.nombre,e.instrumento,e.descripcion,e.nivel,e.tipo,e.salon,t?.nombre_completo||t?.nombre,n?.nombre_completo||n?.nombre].filter(Boolean).join(` `)).includes(c))return!1}return!(n!==`todos`&&e.estado!==n||r&&e.instrumento!==r||i&&g(e.nivel)!==i||a&&g(e.tipo)!==a||o&&e.salon!==o||s&&!(e.horarios||[]).some(e=>g(e.dia)===s))});let l=e.querySelector(`#view-content`);l&&(l.innerHTML=z.vista===`tabla`?Tu():Ou())}function Nu(e){let t=z.clasesOriginales.find(t=>t.id===e);t&&_.open({title:`⚠️ Eliminar Clase`,saveText:`Eliminar Definitivamente`,body:`<p>¿Estás seguro de eliminar la clase <strong>${v(t.nombre)}</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await pe(e),c.success(`Clase eliminada`),yu(z.container),!0}catch(e){return c.error(e.message),!1}}})}function Pu(){f.register(`clases`,yu)}var B={timeline:[],periodos:[],periodoActivo:null,clases:[],resumenGlobal:null,cargando:!1,filtroPeriodo:null,filtroClase:`todas`,container:null};async function Fu(e){if(e)try{B.container=e,B.cargando=!0,Lu(e);let[t,n,r]=await Promise.all([qe(),dt(),Ke()]);B.periodos=t,B.periodoActivo=n,n?.id?B.filtroPeriodo=n.id:t&&t.length>0?B.filtroPeriodo=t[0].id:B.filtroPeriodo=null,B.clases=r,await Iu(),zu(e),Uu(e)}catch(t){console.error(t),Ru(e,t.message)}}async function Iu(){let{timelineByDate:e,resumenGlobal:t}=await ut({periodoId:B.filtroPeriodo});B.timeline=e||[],B.resumenGlobal=t||{totalClases:0,totalPresentes:0,totalAusentes:0,totalJustificados:0,totalRegistros:0,totalSesiones:0}}function Lu(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
  `}function Ru(e,t){e.innerHTML=`
    <div class="alert alert-danger m-3">
      <h5 class="alert-heading">Error al cargar asistencias</h5>
      <p>${v(t)}</p>
      <button class="btn btn-primary btn-sm" id="retry-btn">Reintentar</button>
    </div>
  `,e.querySelector(`#retry-btn`)?.addEventListener(`click`,()=>Fu(e))}function zu(e){e.innerHTML=`
    <div class="page-container">
      <div class="asistencias-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-calendar-check fs-4"></i>
          </div>
          <div>
            <h1 class="asistencias-title-premium page-title mb-0">Asistencias</h1>
            <p class="text-muted small mb-0">${B.resumenGlobal?.totalRegistros||0} registros en total</p>
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
            <div class="stat-value">${B.resumenGlobal?.totalRegistros||0}</div>
          </div>
          <div class="stat-card stat-present">
            <div class="stat-label">Presentes</div>
            <div class="stat-value">${B.resumenGlobal?.totalPresentes||0}</div>
          </div>
          <div class="stat-card stat-absent">
            <div class="stat-label">Ausentes</div>
            <div class="stat-value">${B.resumenGlobal?.totalAusentes||0}</div>
          </div>
          <div class="stat-card stat-justified">
            <div class="stat-label">Justificados</div>
            <div class="stat-value">${B.resumenGlobal?.totalJustificados||0}</div>
          </div>
          <div class="stat-card stat-sessions">
            <div class="stat-label">Sesiones</div>
            <div class="stat-value">${B.resumenGlobal?.totalSesiones||0}</div>
          </div>
        </div>
      </div>

      <div class="asistencias-filter-toolbar mb-4">
        <div class="premium-select-container" style="max-width: 250px;">
          <i class="bi bi-calendar3 select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-periodo">
            ${B.periodos.map(e=>`<option value="${e.id}" ${e.id===B.filtroPeriodo?`selected`:``}>${v(e.nombre)}</option>`).join(``)}
          </select>
        </div>
      </div>

      <!-- Acordeons por Día -->
      <div class="accordion accordion-asistencias" id="accordion-dias">
        ${Bu()}
      </div>
    </div>
  `}function Bu(){return B.timeline.length===0?`<div class="text-center py-5 text-muted"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i>No hay clases registradas.</div>`:B.timeline.map((e,t)=>{let n=Hu(e.fecha),r=`accordion-fecha-${t}`,i=e.clases.map((e,n)=>{let r=`accordion-clase-${t}-${n}`,i=e.hora_inicio?`${e.hora_inicio.slice(0,5)} - ${e.hora_fin?.slice(0,5)||`??:??`}`:`Sin horario`;return`
        <div class="accordion-item accordion-clase">
          <h2 class="accordion-header" id="heading-clase-${t}-${n}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${r}" aria-expanded="false" aria-controls="${r}">
              <div class="clase-header-info">
                <div class="clase-name">${v(e.clase_nombre)}</div>
                <div class="clase-meta">
                  <span class="horario">${i}</span>
                  <span class="maestro">Prof. ${v(e.maestro_nombre)}</span>
                  ${e.maestro_auxiliar_nombre?`<span class="auxiliar">Aux. ${v(e.maestro_auxiliar_nombre)}</span>`:``}
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
              ${Vu(e)}
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
    `}).join(``)}function Vu(e){let t=e.asistencias||[],n=t.filter(e=>e.estado===`presente`),r=t.filter(e=>e.estado===`ausente`),i=t.filter(e=>e.estado===`justificado`),a=`${e.clase_id||`c`}_${e.fecha||`f`}`,o=(e,t,n,r,i)=>{if(t.length===0)return``;let o=`asis-${a}-${n}`;return`
      <div class="asis-grupo">
        <button class="asis-grupo-toggle ${i?``:`collapsed`}" type="button"
          data-bs-toggle="collapse" data-bs-target="#${o}" aria-expanded="${i}">
          <i class="bi ${r} text-${n} me-2"></i>
          <span class="fw-semibold">${e}</span>
          <span class="badge rounded-pill text-bg-${n} ms-2">${t.length}</span>
          <i class="bi bi-chevron-down asis-chevron ms-auto"></i>
        </button>
        <div id="${o}" class="collapse ${i?`show`:``}">
          <ul class="list-group list-group-flush asis-lista">
            ${t.map(e=>`
              <li class="list-group-item d-flex justify-content-between align-items-center gap-2 px-0 py-1 border-0 bg-transparent">
                <span class="asis-nombre text-truncate">${v(e.alumno_nombre||`Sin nombre`)}</span>
                ${e.instrumento?`<span class="badge rounded-pill asis-instrumento"><i class="bi bi-music-note me-1"></i>${v(e.instrumento)}</span>`:``}
              </li>`).join(``)}
          </ul>
        </div>
      </div>
    `},s=e.observacion_sesion||e.observacion_clase;return`
    <div class="asis-detalle">
      ${o(`Presentes`,n,`success`,`bi-check-circle`,!1)}
      ${o(`Ausentes`,r,`danger`,`bi-x-circle`,!0)}
      ${o(`Justificados`,i,`warning`,`bi-exclamation-circle`,!1)}
      ${s?`<div class="asis-obs mt-2 pt-2 border-top">
               <i class="bi bi-chat-left-text me-1 text-muted"></i>
               <span class="text-secondary small">${v(s)}</span>
             </div>`:``}
    </div>
  `}function Hu(e){return new Date(e+`T12:00:00`).toLocaleDateString(`es-ES`,{weekday:`long`,day:`numeric`,month:`long`})}function Uu(e){e.querySelector(`#select-periodo`)?.addEventListener(`change`,async e=>{B.filtroPeriodo=e.target.value,await Wu()}),e.querySelector(`#accordion-dias`)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action="view-detail"]`);t&&Gu(t.dataset.id)}),e.querySelector(`#btn-nueva-sesion`)?.addEventListener(`click`,()=>Ku())}async function Wu(){let e=B.container;c.info(`Cargando asistencias...`),await Iu();let t=e.querySelector(`.asistencias-header-premium p.text-muted`);t&&(t.textContent=`${B.resumenGlobal?.totalRegistros||0} registros en total`);let n=e.querySelector(`.stats-panel`);n&&(n.innerHTML=`
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <div class="stat-label">Total Registros</div>
          <div class="stat-value">${B.resumenGlobal?.totalRegistros||0}</div>
        </div>
        <div class="stat-card stat-present">
          <div class="stat-label">Presentes</div>
          <div class="stat-value">${B.resumenGlobal?.totalPresentes||0}</div>
        </div>
        <div class="stat-card stat-absent">
          <div class="stat-label">Ausentes</div>
          <div class="stat-value">${B.resumenGlobal?.totalAusentes||0}</div>
        </div>
        <div class="stat-card stat-justified">
          <div class="stat-label">Justificados</div>
          <div class="stat-value">${B.resumenGlobal?.totalJustificados||0}</div>
        </div>
        <div class="stat-card stat-sessions">
          <div class="stat-label">Sesiones</div>
          <div class="stat-value">${B.resumenGlobal?.totalSesiones||0}</div>
        </div>
      </div>
    `);let r=e.querySelector(`#accordion-dias`);r&&(r.innerHTML=Bu()),Uu(e),c.success(`Asistencias cargadas`)}async function Gu(e){c.info(`Cargando detalle...`);try{let t=await lt(e);_.open({title:`Sesión: ${t.sesion.claseNombre}`,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
        <div class="row g-4">
          <div class="col-md-8">
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Tema Principal</label>
            <p class="fw-semibold">${v(t.sesion.temaPrincipal||`No especificado`)}</p>
            <label class="text-muted small text-uppercase fw-bold mb-1 d-block">Observaciones Generales</label>
            <p class="text-secondary small">${v(t.sesion.observacionesGenerales||`Sin observaciones.`)}</p>
          </div>
          <div class="col-md-4 bg-body-tertiary p-3 rounded">
            <div class="d-flex justify-content-between mb-2"><span>Fecha:</span> <strong>${t.sesion.fecha}</strong></div>
            <div class="d-flex justify-content-between mb-2"><span>Horario:</span> <strong>${(t.sesion.horaInicio||`--:--`).slice(0,5)} - ${(t.sesion.horaFin||`--:--`).slice(0,5)}</strong></div>
            <div class="d-flex justify-content-between"><span>Maestro:</span> <strong>${v(t.sesion.maestroNombre)}</strong></div>
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
                      <td>${v(e.alumnoNombre)}</td>
                      <td class="text-center">
                        <span class="badge bg-${Ze[e.estado]?.css||`secondary`}">${Ze[e.estado]?.label||e.estado}</span>
                      </td>
                      <td class="small text-muted">${v(e.observacion||e.justificacionTexto||`-`)}</td>
                    </tr>
                  `).join(``)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `})}catch(e){c.error(`Error al cargar detalle: `+e.message)}}async function Ku(){c.info(`Funcionalidad de toma manual en desarrollo. Use el flujo desde la Ruta Gamificada.`)}function qu({titulo:e,valor:t,subtitulo:n,colorClass:r=`primary`,icono:i,tendencia:a}){let o=a&&[`subiendo`,`bajando`,`estable`].includes(a),s=a===`subiendo`?`↑`:a===`bajando`?`↓`:`→`,c=a===`subiendo`?`text-success`:a===`bajando`?`text-danger`:`text-muted`;return`
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
  `}var Ju={periodoActivo:null,periodos:[],datos:{programas:{},niveles:{},totales:{sesiones:0,presentes:0,ausentes:0,justificados:0}},cargando:!1};async function Yu(e){Ju.cargando=!0,e.innerHTML=Xu(),await Zu(),Ju.cargando=!1,$u(e)}function Xu(){return`
    <div class="admin-report-view">
      <div class="text-center py-5">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="text-muted">Cargando reportes de asistencia...</p>
      </div>
    </div>
  `}async function Zu(){let[e,t]=await Promise.all([qe(),dt()]);Ju.periodos=e,Ju.periodoActivo=t,t&&(Ju.datos=Qu(await Ge({periodoId:t.id})))}function Qu(e){let t={},n={},r=0,i=0,a=0,o=0;for(let s of e)for(let e of s.sesiones){let s=e.claseNombre?.split(`-`)[0]?.trim()||`General`,c=e.instrumento||`General`;t[s]||(t[s]={total:0,presentes:0,ausentes:0,justificados:0}),t[s].total+=e.totalRegistros||0,t[s].presentes+=e.totalPresentes||0,t[s].ausentes+=e.totalAusentes||0,t[s].justificados+=e.totalJustificados||0,n[c]||(n[c]={total:0,presentes:0,ausentes:0,justificados:0}),n[c].total+=e.totalRegistros||0,n[c].presentes+=e.totalPresentes||0,n[c].ausentes+=e.totalAusentes||0,n[c].justificados+=e.totalJustificados||0,r++,i+=e.totalPresentes||0,a+=e.totalAusentes||0,o+=e.totalJustificados||0}return{programas:t,niveles:n,totales:{sesiones:r,presentes:i,ausentes:a,justificados:o}}}function $u(e){let{programas:t,niveles:n,totales:r}=Ju.datos,i=r.presentes+r.ausentes+r.justificados?Math.round(r.presentes/i*100):0;e.innerHTML=`
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
        <div class="col-md-3">${qu({titulo:`Sesiones`,valor:r.sesiones,colorClass:`primary`,icono:`bi-calendar3`})}</div>
        <div class="col-md-3">${qu({titulo:`Tasa Asistencia`,valor:`${i}%`,colorClass:i>=80?`success`:i>=50?`warning`:`danger`,icono:`bi-check-circle`})}</div>
        <div class="col-md-3">${qu({titulo:`Ausentes`,valor:r.ausentes,colorClass:`danger`,icono:`bi-x-circle`})}</div>
        <div class="col-md-3">${qu({titulo:`Justificados`,valor:r.justificados,colorClass:`warning`,icono:`bi-file-earmark-check`})}</div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-pie-chart me-2"></i>Por Programa</h5>
            </div>
            <div class="card-body" id="programasChart">
              ${ed(t,`programa`)}
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0">
              <h5 class="fw-bold mb-0"><i class="bi bi-bar-chart me-2"></i>Por Instrumento/Nivel</h5>
            </div>
            <div class="card-body" id="nivelesChart">
              ${ed(n,`nivel`)}
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
  `}function ed(e,t){if(!Object.keys(e).length)return`<p class="text-muted text-center py-3">Sin datos disponibles</p>`;let n=Object.entries(e).sort((e,t)=>t[1].presentes+t[1].ausentes-(e[1].presentes+e[1].ausentes));return Math.max(...n.map(([,e])=>e.presentes+e.ausentes+e.justificados)),n.slice(0,8).map(([e,t])=>{let n=t.presentes+t.ausentes+t.justificados,r=n?t.presentes/n*100:0,i=n?t.ausentes/n*100:0,a=n?t.justificados/n*100:0;return`
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
    `}).join(``)}function td(){f.register(`asistencias`,Fu),f.register(`asistencias-reportes`,Yu)}var nd=!window.location.href.includes(`supabase`);async function rd(e={}){let{soloConContenido:n,...r}=e;if(nd){let e=[...Tt.sesiones];return r.fecha&&(e=e.filter(e=>e.fecha===r.fecha)),r.clase_id&&(e=e.filter(e=>e.clase_id===r.clase_id)),r.maestro_id&&(e=e.filter(e=>e.maestro_id===r.maestro_id)),r.tipo&&(e=e.filter(e=>e.tipo===r.tipo)),n&&(e=e.filter(e=>e.contenido&&e.contenido.trim()!==``)),e}let i=t.from(`sesiones_clase`).select(`*`).order(`fecha`,{ascending:!1});r.fecha&&(i=i.eq(`fecha`,r.fecha)),r.clase_id&&(i=i.eq(`clase_id`,r.clase_id)),r.maestro_id&&(i=i.eq(`maestro_id`,r.maestro_id)),r.tipo&&(i=i.eq(`tipo`,r.tipo)),n&&(i=i.eq(`borrador`,!1).not(`contenido`,`is`,null).neq(`contenido`,``));let{data:a,error:o}=await i;if(o)throw console.error(`Error cargando sesiones:`,o.message),Error(`No se pudieron cargar las sesiones`);return a}async function id(e){if(!e.clase_id)throw Error(`La clase es obligatoria`);if(!e.fecha)throw Error(`La fecha es obligatoria`);if(!e.tema)throw Error(`El tema es obligatorio`);let n=null,r=null;if(!nd){let i=[`domingo`,`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`][new Date(e.fecha).getDay()].toLowerCase(),{data:a,error:o}=await t.from(`clase_horarios`).select(`id, salon_id`).eq(`clase_id`,e.clase_id).eq(`dia`,i).limit(1);!o&&a&&a.length>0&&(n=a[0].id,r=a[0].salon_id)}let i={clase_id:e.clase_id,maestro_id:e.maestro_id||null,fecha:e.fecha,hora_inicio:e.hora_inicio||null,hora_fin:e.hora_fin||null,horario_id:n,salon_id:r,tema:e.tema.trim(),contenido:e.contenido?.trim()||null,motivo:e.motivo?.trim()||null,tipo:e.tipo||`regular`,estado:e.estado||`pendiente`,es_codocencia:e.es_codocencia||!1,maestro_auxiliar_id:e.maestro_auxiliar_id||null,asistencia:null};if(nd){let e={...i,id:`sesion_${Date.now()}`,created_at:new Date().toISOString()};return Tt.sesiones.push(e),e}let{data:a,error:o}=await t.from(`sesiones_clase`).insert([i]).select();if(o)throw console.error(`Error creando sesión:`,o.message),Error(`No se pudo crear la sesión`);return a[0]}async function ad(e,n){let r={};if(n.tema!==void 0&&(r.tema=n.tema.trim()),n.contenido!==void 0&&(r.contenido=n.contenido?.trim()||null),n.hora_inicio!==void 0&&(r.hora_inicio=n.hora_inicio),n.hora_fin!==void 0&&(r.hora_fin=n.hora_fin),n.estado!==void 0&&(r.estado=n.estado),n.asistencia!==void 0&&(r.asistencia=n.asistencia),n.es_codocencia!==void 0&&(r.es_codocencia=n.es_codocencia),n.maestro_auxiliar_id!==void 0&&(r.maestro_auxiliar_id=n.maestro_auxiliar_id),nd){let t=Tt.sesiones.findIndex(t=>t.id===e);if(t===-1)throw Error(`Sesión no encontrada`);return Tt.sesiones[t]={...Tt.sesiones[t],...r,updated_at:new Date().toISOString()},Tt.sesiones[t]}let{data:i,error:a}=await t.from(`sesiones_clase`).update(r).eq(`id`,e).select();if(a)throw console.error(`Error actualizando sesión:`,a.message),Error(`No se pudo actualizar la sesión`);return i[0]}async function od(e){if(nd){let t=Tt.sesiones.findIndex(t=>t.id===e);if(t===-1)throw Error(`Sesión no encontrada`);return Tt.sesiones.splice(t,1),{success:!0}}let{error:n}=await t.from(`sesiones_clase`).delete().eq(`id`,e);if(n)throw console.error(`Error eliminando sesión:`,n.message),Error(`No se pudo eliminar la sesión`);return{success:!0}}async function sd(e,t){return ad(e,{asistencia:t||[]})}async function cd(e){if(nd)return Tt.sesiones.filter(t=>t.maestro_auxiliar_id===e);let{data:n,error:r}=await t.from(`sesiones_clase`).select(`*`).eq(`maestro_auxiliar_id`,e).order(`fecha`,{ascending:!1});if(r)throw console.error(`Error cargando sesiones de co-docencia:`,r.message),Error(`Error al cargar sesiones`);return n}async function ld(e){if(nd)return wt.clases.filter(t=>t.maestro_titular_id===e||t.maestro_auxiliar_id===e);let{data:n,error:r}=await t.from(`clases`).select(`*`).or(`maestro_principal_id.eq.${e},maestro_auxiliar_id.eq.${e}`);if(r)throw console.error(`Error cargando clases del maestro:`,r.message),Error(`Error al cargar clases`);return n}var ud=class{constructor(){this.planificaciones=[],this.planificacionActual=null,this.sesiones=[],this.clases=[],this.maestroActualId=null,this.esCoDocencia=!1,this.cargando=!1,this.error=null,this.listeners=[]}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}setMaestroActual(e,t=!1){this.maestroActualId=e,this.esCoDocencia=t,this.notifyListeners()}notifyListeners(){this.listeners.forEach(e=>{e({planificaciones:this.planificaciones,planificacionActual:this.planificacionActual,sesiones:this.sesiones,clases:this.clases,maestroActualId:this.maestroActualId,esCoDocencia:this.esCoDocencia,cargando:this.cargando,error:this.error})})}async fetchPlanificaciones(){this.cargando=!0,this.error=null,this.notifyListeners();try{return this.planificaciones=await gt(this.maestroActualId),this.cargando=!1,this.notifyListeners(),this.planificaciones}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async fetchPlanificacionesConDetalles(){this.cargando=!0,this.error=null,this.notifyListeners();try{return this.planificaciones=await Ct(this.maestroActualId),this.cargando=!1,this.notifyListeners(),this.planificaciones}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async fetchPlanificacion(e){this.cargando=!0,this.error=null,this.notifyListeners();try{return this.planificacionActual=await pt(e),this.cargando=!1,this.notifyListeners(),this.planificacionActual}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}reset(){this.planificaciones=[],this.planificacionActual=null,this.cargando=!1,this.error=null,this.notifyListeners()}search(e){if(!e)return this.planificaciones;let t=e.toLowerCase();return this.planificaciones.filter(e=>(e.tema||``).toLowerCase().includes(t)||(e.contenido||``).toLowerCase().includes(t)||(e.objetivos||``).toLowerCase().includes(t)||(e.observaciones||``).toLowerCase().includes(t))}filterByClase(e){return this.planificaciones.filter(t=>t.clase_id===e)}filterByMaestro(e){return this.planificaciones.filter(t=>t.maestro_id===e)}filterByEstado(e){return this.planificaciones.filter(t=>t.estado===e)}getById(e){return this.planificaciones.find(t=>t.id===e)||null}getActivas(){return this.planificaciones.filter(e=>e.estado===`planificado`)}count(){return this.planificaciones.length}countByEstado(){return this.planificaciones.reduce((e,t)=>{let n=t.estado||`Sin estado`;return e[n]=(e[n]||0)+1,e},{})}countByClase(){return this.planificaciones.reduce((e,t)=>{let n=t.clase_id||`Sin clase`;return e[n]=(e[n]||0)+1,e},{})}async fetchSesiones(e={}){this.cargando=!0,this.error=null,this.notifyListeners();try{return this.sesiones=await rd(e),this.cargando=!1,this.notifyListeners(),this.sesiones}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async fetchClasesDelMaestro(e){this.cargando=!0,this.error=null;try{return this.clases=await ld(e),this.cargando=!1,this.notifyListeners(),this.clases}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async fetchSesionesCoDocencia(e){this.cargando=!0,this.error=null;try{return this.sesiones=await cd(e),this.esCoDocencia=!0,this.cargando=!1,this.notifyListeners(),this.sesiones}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async crearSesionEmergente(e){this.cargando=!0,this.error=null;try{let t=await id({...e,maestro_id:this.maestroActualId});return this.sesiones.unshift(t),this.cargando=!1,this.notifyListeners(),t}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async actualizarSesionPasada(e,t){this.cargando=!0,this.error=null;try{let n=await ad(e,t),r=this.sesiones.findIndex(t=>t.id===e);return r!==-1&&(this.sesiones[r]={...this.sesiones[r],...n}),this.cargando=!1,this.notifyListeners(),n}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async eliminarSesion(e){this.cargando=!0,this.error=null;try{return await od(e),this.sesiones=this.sesiones.filter(t=>t.id!==e),this.cargando=!1,this.notifyListeners(),{success:!0}}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}async registrarAsistencia(e,t){this.cargando=!0,this.error=null;try{let n=await sd(e,t),r=this.sesiones.findIndex(t=>t.id===e);return r!==-1&&(this.sesiones[r]={...this.sesiones[r],...n}),this.cargando=!1,this.notifyListeners(),n}catch(e){throw this.error=e.message,this.cargando=!1,this.notifyListeners(),e}}getSesionesPorFecha(e){return this.sesiones.filter(t=>t.fecha===e)}getSesionesEmergentes(){return this.sesiones.filter(e=>e.tipo===`emergente`)}getSesionesRegulares(){return this.sesiones.filter(e=>e.tipo===`regular`)}puedeEditarSesion(e){return this.esCoDocencia?e.maestro_auxiliar_id===this.maestroActualId:e.maestro_id===this.maestroActualId}getSesionesConEstadoPlanificacion(e,t){let n=new Map;for(let e of t)n.has(e.clase_id)||n.set(e.clase_id,[]),n.get(e.clase_id).push(e);return e.map(e=>{let t=n.get(e.clase_id)||[],r=t.length>0?t[0]:null;return{...e,tiene_plan:t.length>0,plan_asociado:r}})}resetSesiones(){this.sesiones=[],this.clases=[],this.maestroActualId=null,this.esCoDocencia=!1,this.notifyListeners()}},dd=null;function fd(){return dd||=new ud,dd}async function pd(e){let{data:n,error:r}=await t.from(`cobertura_alumno_objetivo`).upsert(e,{onConflict:`alumno_id,objetivo_id`}).select();if(r)throw r;return n}async function md(e){let{data:n,error:r}=await t.from(`cobertura_alumno_objetivo`).select(`
      id, nivel, confirmado, fecha, plan_id, objetivo_id,
      curriculo_objetivos ( id, descripcion, pilar_id,
        curriculo_pilares ( id, nombre )
      )
    `).eq(`alumno_id`,e);if(r)throw r;return n||[]}function hd(){return`/functions/v1/groq-proxy`}async function gd(){let{data:{session:e}}=await t.auth.getSession();return{Authorization:`Bearer ${e?.access_token??``}`,"Content-Type":`application/json`,apikey:``}}async function _d(e,{maxTokens:t,temperature:n,responseFormat:r}={}){let i=await gd(),a={model:p.groq.model,messages:e,...t&&{max_tokens:t},...n!==void 0&&{temperature:n},...r&&{response_format:r}},o=await fetch(`${hd()}/chat`,{method:`POST`,headers:i,body:JSON.stringify(a)}),s=await o.json();if(!o.ok||s.error)throw Error(s.error?.message??`Groq proxy error ${o.status}`);return s.choices[0].message.content.trim()}async function vd(e,t,n){let r=`Eres un asistente pedagógico musical. Dado el contenido de un plan de clase y una lista de objetivos curriculares, identifica cuáles objetivos probablemente se cubrieron.

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
Solo incluye objetivos que tengan evidencia real en el plan. No inventes coberturas.`;if(p.isDemoMode)return{success:!0,coberturas:t.slice(0,2).flatMap(e=>n.slice(0,2).map(t=>({alumno:e,objetivo_id:t.id,nivel:`en_proceso`,razon:`Demo: objetivo relacionado con el tema`}))),isMock:!0};try{let e=await _d([{role:`user`,content:r}],{maxTokens:1500,temperature:.3,responseFormat:{type:`json_object`}});return{success:!0,coberturas:JSON.parse(e||`{"coberturas":[]}`).coberturas||[],isMock:!1}}catch(e){return console.error(`extraerCobertura error:`,e),{success:!1,coberturas:[],error:e.message}}}async function yd(e,t,n){let r=`Eres un asistente pedagógico musical. Genera un borrador de plan de clase personalizado.

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
Sé específico y pedagógicamente relevante para el instrumento y nivel.`;if(p.isDemoMode)return{success:!0,plan:{tema:`Clase de ${e.instrumento} — Nivel ${e.nivel}`,objetivos:t[0]?.descripcion||`Repaso general`,contenido:`Ejercicios de calentamiento, escala mayor, pieza del repertorio.`,recursos:[`Partitura del repertorio`,`Metrónomo`]},isMock:!0};try{let e=await _d([{role:`user`,content:r}],{maxTokens:800,temperature:.7,responseFormat:{type:`json_object`}});return{success:!0,plan:JSON.parse(e||`{}`),isMock:!1}}catch(e){return console.error(`sugerirPlan error:`,e),{success:!1,plan:null,error:e.message}}}async function bd(e,t,n,r){let i=`Eres un mentor pedagógico musical. Analiza el trabajo de un maestro y da retroalimentación constructiva.

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

Tono: colega experto, respetuoso, propositivo. Sin tecnicismos innecesarios. Responde en español.`;if(p.isDemoMode)return{success:!0,feedback:`Tu enfoque en las últimas semanas muestra consistencia y dedicación. Se nota claridad en la presentación de contenidos técnicos.

Hay oportunidad de ampliar el trabajo en repertorio variado y lectura a primera vista.

Para las próximas semanas, incorporá al menos una pieza nueva por mes y dedicá 5-10 minutos a ejercicios de lectura rítmica.`,isMock:!0};try{return{success:!0,feedback:await _d([{role:`user`,content:i}],{maxTokens:600,temperature:.8}),isMock:!1}}catch(e){return console.error(`analizarEnfoque error:`,e),{success:!1,feedback:``,error:e.message}}}var xd=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),Sd=`
<style id="cobertura-modal-style">
.cob-alumno-block { border: 1px solid var(--bs-border-color); border-radius:8px; padding:.75rem; margin-bottom:.75rem; }
.cob-alumno-name { font-weight:600; margin-bottom:.5rem; }
.cob-obj-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.25rem; font-size:.875rem; }
.cob-nivel-sel { width: auto; font-size:.8rem; }
.cob-ai-badge { font-size:.7rem; color: var(--bs-warning-text-emphasis); }
</style>`;async function Cd({plan:e,claseId:n,instrumento:r,nivel:i,maestroId:a,onConfirm:o,onSkip:s}){let l=document.createElement(`div`);l.innerHTML=`${Sd}
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
    </div>`,document.body.appendChild(l);let u=l.querySelector(`#cob-modal`),d=new bootstrap.Modal(u),f=[];l.querySelector(`#cob-btn-skip`).addEventListener(`click`,()=>{d.hide(),s?.()}),l.querySelector(`#cob-btn-confirm`).addEventListener(`click`,async()=>{let t=f.filter(e=>e.checked).map(t=>({alumno_id:t.alumno_id,objetivo_id:t.objetivo_id,plan_id:e.id,maestro_id:a,nivel:t.nivel,confirmado:!0,fecha:e.fecha_inicio||new Date().toISOString().slice(0,10)}));try{t.length>0&&await pd(t),c.success(`Cobertura registrada`),d.hide(),o?.()}catch(e){c.error(e.message)}}),u.addEventListener(`hidden.bs.modal`,()=>l.remove()),d.show();try{let a=[],o=null;if(n){let{data:e}=await t.from(`clases`).select(`ruta_id`).eq(`id`,n).single();e?.ruta_id&&(o=await Hn(e.ruta_id),a=o.objetivos.map(e=>({id:e.objetivo_id,descripcion:e.descripcion,pilar_nombre:null})))}let s=null;a.length===0&&r&&i&&(s=await Xe(r,i),s&&(a=s.curriculo_pilares.flatMap(e=>e.curriculo_objetivos.map(t=>({...t,pilar_nombre:e.nombre})))));let c=Qe(e.notas_dsl||e.contenido||``).alumnos||[],u=[];if(c.length>0||n){let{data:e}=await t.from(`alumnos`).select(`id, nombre_completo`);c.length>0&&(u=(e||[]).filter(e=>c.some(t=>e.nombre_completo.toLowerCase().includes(t.toLowerCase()))))}if(u.length===0&&n){let{data:e}=await t.from(`alumnos_clases`).select(`alumnos(id, nombre_completo)`).eq(`clase_id`,n);u=(e||[]).map(e=>e.alumnos).filter(Boolean)}let d=[];s&&a.length>0&&(d=(await vd({tema:e.tema,objetivos:e.objetivos,contenido:e.contenido,notas_dsl:e.notas_dsl},c,a.map(e=>({id:e.id,descripcion:e.descripcion})))).coberturas||[]),f=[],u.forEach(e=>{a.forEach(t=>{let n=d.find(n=>n.objetivo_id===t.id&&e.nombre_completo.toLowerCase().includes((n.alumno||``).toLowerCase()));f.push({alumno_id:e.id,alumno_nombre:e.nombre_completo,objetivo_id:t.id,obj_descripcion:t.descripcion,pilar_nombre:t.pilar_nombre,nivel:n?.nivel||`en_proceso`,checked:!!n,ai_suggested:!!n,razon:n?.razon||``})})}),p(),l.querySelector(`#cob-btn-confirm`).disabled=!1}catch(e){document.getElementById(`cob-body`).innerHTML=`
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
          <div class="cob-alumno-name"><i class="bi bi-person me-1"></i>${xd(t)}</div>
          ${n.map(e=>{let t=f.indexOf(e);return`
            <div class="cob-obj-row">
              <input type="checkbox" class="form-check-input cob-check" data-idx="${t}" ${e.checked?`checked`:``}>
              <span style="flex:1">
                <span class="text-muted small">${xd(e.pilar_nombre)} /</span> ${xd(e.obj_descripcion)}
                ${e.ai_suggested?`<span class="cob-ai-badge ms-1"><i class="bi bi-stars"></i> IA</span>`:``}
              </span>
              <select class="form-select form-select-sm cob-nivel-sel" data-idx="${t}" ${e.checked?``:`disabled`}>
                <option value="iniciando" ${e.nivel===`iniciando`?`selected`:``}>Iniciando</option>
                <option value="en_proceso" ${e.nivel===`en_proceso`?`selected`:``}>En proceso</option>
                <option value="logrado" ${e.nivel===`logrado`?`selected`:``}>Logrado</option>
              </select>
            </div>`}).join(``)}
        </div>`).join(``)}`,e.querySelectorAll(`.cob-check`).forEach(t=>{t.addEventListener(`change`,()=>{let n=+t.dataset.idx;f[n].checked=t.checked;let r=e.querySelector(`.cob-nivel-sel[data-idx="${n}"]`);r&&(r.disabled=!t.checked)})}),e.querySelectorAll(`.cob-nivel-sel`).forEach(e=>{e.addEventListener(`change`,()=>{f[+e.dataset.idx].nivel=e.value})})}}var wd=e=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);async function Td(e){e.innerHTML=`
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
    </div>`;let n={alumnos:[],selectedAlumnoId:null,selectedAlumno:null,cobertura:[],curriculo:null,maestroId:null,instrumento:null},{data:{user:r}}=await t.auth.getUser(),{data:i}=await t.from(`maestros`).select(`id, instrumento`).eq(`user_id`,r.id).single();n.maestroId=i?.id,n.instrumento=i?.instrumento;let{data:a}=await t.from(`alumnos_clases`).select(`alumnos(id, nombre_completo), clases(instrumento, plan_estudio, maestro_principal_id)`).eq(`clases.maestro_principal_id`,n.maestroId),o={};(a||[]).forEach(e=>{e.alumnos&&e.clases&&(o[e.alumnos.id]={...e.alumnos,instrumento:e.clases.instrumento,nivel:e.clases.plan_estudio})}),n.alumnos=Object.values(o);let s=e.querySelector(`#ap-alumno-sel`);s.innerHTML=`<option value="">Seleccionar alumno...</option>`+n.alumnos.map(e=>`<option value="${e.id}">${wd(e.nombre_completo)}</option>`).join(``),s.addEventListener(`change`,async()=>{let t=s.value;if(!t){e.querySelector(`#ap-brechas-content`).innerHTML=`<p class="text-muted small">Seleccioná un alumno.</p>`,e.querySelector(`#ap-btn-draft`).disabled=!0,n.selectedAlumnoId=null,n.selectedAlumno=null;return}n.selectedAlumnoId=t,n.selectedAlumno=n.alumnos.find(e=>e.id===t),e.querySelector(`#ap-btn-draft`).disabled=!1,await l()});async function l(){let t=e.querySelector(`#ap-brechas-content`);t.innerHTML=`<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-muted"></div></div>`;try{let e=n.selectedAlumno;if(n.curriculo=e.instrumento&&e.nivel?await Xe(e.instrumento,e.nivel):null,!n.curriculo){t.innerHTML=`<div class="alert alert-secondary py-2 small">Sin guía curricular definida para <strong>${wd(e.instrumento||`este instrumento`)}</strong> — <strong>${wd(e.nivel||`este nivel`)}</strong>.</div>`;return}n.cobertura=await md(n.selectedAlumnoId);let r={};n.cobertura.forEach(e=>{let t=e.curriculo_objetivos?.id||e.objetivo_id;t&&(r[t]=e)});let i=n.curriculo.curriculo_pilares.flatMap(e=>e.curriculo_objetivos.map(t=>({...t,pilar_nombre:e.nombre}))),a=i.filter(e=>r[e.id]?.nivel===`logrado`).length,o=i.filter(e=>r[e.id]&&r[e.id].nivel!==`logrado`).length;t.innerHTML=`
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
                  <td class="text-muted">${wd(e.pilar_nombre)}</td>
                  <td>${wd(e.descripcion)}</td>
                  <td>${i}</td>
                  <td class="text-center">${a}</td>
                </tr>`}).join(``)}
            </tbody>
          </table>
        </div>`}catch(e){t.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}}e.querySelector(`#ap-btn-draft`).addEventListener(`click`,async()=>{if(!n.selectedAlumno)return;let r=e.querySelector(`#ap-btn-draft`),i=e.querySelector(`#ap-draft-content`);r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Generando...`,i.innerHTML=``;try{let r=n.selectedAlumno,a=n.curriculo?.curriculo_pilares?.flatMap(e=>e.curriculo_objetivos.map(e=>e))||[],o={};n.cobertura.forEach(e=>{let t=e.curriculo_objetivos?.id||e.objetivo_id;t&&(o[t]=e)});let s=a.filter(e=>!o[e.id]||o[e.id].nivel!==`logrado`),{data:l}=await t.from(`planificaciones`).select(`tema`).eq(`maestro_id`,n.maestroId).eq(`estado`,`ejecutado`).order(`created_at`,{ascending:!1}).limit(3),u=(l||[]).map(e=>e.tema),d=await yd({nombre:r.nombre_completo,instrumento:r.instrumento||`(sin instrumento)`,nivel:r.nivel||`(sin nivel)`},s,u);if(!d.success||!d.plan)throw Error(d.error||`Sin respuesta de la IA`);let f=d.plan;i.innerHTML=`
        <div class="card border-success border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-success bg-opacity-15 text-success">Borrador generado por IA</span>
              <button class="btn btn-sm btn-success" id="ap-btn-save-draft">
                <i class="bi bi-floppy me-1"></i>Guardar como plan
              </button>
            </div>
            <div class="mb-2"><span class="fw-semibold">Tema:</span> ${wd(f.tema||``)}</div>
            <div class="mb-2"><span class="fw-semibold">Objetivos:</span> ${wd(f.objetivos||``)}</div>
            <div class="mb-2"><span class="fw-semibold">Contenido:</span> ${wd(f.contenido||``)}</div>
            ${f.recursos?.length?`<div><span class="fw-semibold">Recursos:</span> ${f.recursos.map(e=>`<span class="badge bg-light text-dark border me-1">${wd(e)}</span>`).join(``)}</div>`:``}
          </div>
        </div>`,e.querySelector(`#ap-btn-save-draft`)?.addEventListener(`click`,()=>{document.dispatchEvent(new CustomEvent(`planificacion:nuevoPlan`,{detail:{tema:f.tema,objetivos:f.objetivos,contenido:f.contenido}})),c.success(`Borrador listo — abrí "Nuevo plan" para completar los detalles`)})}catch(e){i.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}finally{r.disabled=!1,r.innerHTML=`<i class="bi bi-stars me-1"></i>Generar borrador`}}),e.querySelector(`#ap-btn-feedback`).addEventListener(`click`,async()=>{let r=e.querySelector(`#ap-btn-feedback`),i=e.querySelector(`#ap-feedback-content`);r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Analizando...`,i.innerHTML=``;try{let r=new Date;r.setDate(r.getDate()-56);let{data:a}=await t.from(`planificaciones`).select(`tema, contenido, objetivos, instrumento`).eq(`maestro_id`,n.maestroId).eq(`estado`,`ejecutado`).gte(`created_at`,r.toISOString()),o=n.instrumento||a?.[0]?.instrumento||`Instrumento`,s=null;try{s=o?await Xe(o,null):null}catch{}let c=n.selectedAlumnoId&&n.selectedAlumno?`Alumno seleccionado: ${n.selectedAlumno.nombre_completo}. ${n.cobertura.length} objetivos trabajados.`:`No hay alumno seleccionado.`,l=await bd(o,a||[],s,c);if(!l.success)throw Error(l.error||`Sin respuesta de la IA`);i.innerHTML=`
        <div class="card border-warning border-opacity-25">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge bg-warning bg-opacity-15 text-warning-emphasis">Análisis pedagógico</span>
              <button class="btn btn-sm btn-outline-secondary" id="ap-btn-regenerate">
                <i class="bi bi-arrow-clockwise me-1"></i>Regenerar
              </button>
            </div>
            <div class="text-body" style="line-height:1.7; white-space:pre-line">${wd(l.feedback)}</div>
          </div>
        </div>`,e.querySelector(`#ap-btn-regenerate`)?.addEventListener(`click`,()=>{e.querySelector(`#ap-btn-feedback`).click()})}catch(e){i.innerHTML=`<div class="alert alert-danger small">${e.message}</div>`}finally{r.disabled=!1,r.innerHTML=`<i class="bi bi-chat-quote me-1"></i>Analizar mi enfoque`}})}var Ed=`
<style id="curriculo-modal-style">
.cm-pilar { border: 1px solid var(--bs-border-color); border-radius: 8px; margin-bottom: .75rem; }
.cm-pilar-header { display:flex; align-items:center; gap:.5rem; padding:.5rem .75rem; background:var(--bs-tertiary-bg); border-radius:7px 7px 0 0; }
.cm-pilar-body { padding:.5rem .75rem; }
.cm-obj-row { display:flex; align-items:center; gap:.5rem; padding:.25rem 0; border-bottom: 1px solid var(--bs-border-color-translucent); }
.cm-obj-row:last-child { border-bottom: none; }
.cm-obj-input { flex:1; }
</style>`;function Dd(e){let t=document.getElementById(`curriculo-list-modal`);t&&t.remove();let n=document.createElement(`div`);n.id=`curriculo-list-modal`,n.innerHTML=`${Ed}
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
    </div>`,document.body.appendChild(n);let r=n.querySelector(`#curriculo-list-modal-dialog`),i=new bootstrap.Modal(r);async function a(){let e=document.getElementById(`cl-body`);try{let t=await Ye();if(t.length===0){e.innerHTML=`<p class="text-muted text-center py-4">No hay currículos creados aún.</p>`;return}e.innerHTML=`
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
        </table>`,e.querySelectorAll(`.cl-toggle`).forEach(e=>{e.addEventListener(`change`,async()=>{await it(e.dataset.id,e.checked),c.success(e.checked?`Currículo activado`:`Currículo desactivado`)})}),e.querySelectorAll(`.cl-btn-edit`).forEach(e=>{e.addEventListener(`click`,()=>kd(e.dataset.id,a))})}catch(t){e.innerHTML=`<p class="text-danger">${t.message}</p>`}}n.querySelector(`#cl-btn-nuevo`).addEventListener(`click`,()=>{Od(a)}),r.addEventListener(`hidden.bs.modal`,()=>{n.remove(),e?.()}),i.show(),a()}function Od(e){let t=document.createElement(`div`);t.innerHTML=`
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
    </div>`,document.body.appendChild(t);let n=t.querySelector(`#cc-modal`),r=new bootstrap.Modal(n);t.querySelector(`#cc-btn-save`).addEventListener(`click`,async()=>{let n=t.querySelector(`#cc-instrumento`).value.trim(),i=t.querySelector(`#cc-nivel`).value.trim();if(!n||!i){c.error(`Instrumento y nivel son obligatorios`);return}try{await rt({instrumento:n,nivel:i,descripcion:t.querySelector(`#cc-desc`).value.trim()}),c.success(`Currículo creado`),r.hide(),e?.()}catch(e){c.error(e.message)}}),n.addEventListener(`hidden.bs.modal`,()=>t.remove()),r.show()}async function kd(e,n){let{data:r,error:i}=await t.from(`curriculos`).select(`id, instrumento, nivel, descripcion, curriculo_pilares(id, nombre, orden, curriculo_objetivos(id, descripcion, orden))`).eq(`id`,e).single();if(i){c.error(i.message);return}let a=document.createElement(`div`);a.innerHTML=`
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
    </div>`,document.body.appendChild(a);let o=a.querySelector(`#ce-modal`),s=new bootstrap.Modal(o);function l(){let e=document.getElementById(`ce-body`);e.innerHTML=`
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
      </div>`,e.querySelectorAll(`.pilar-nombre`).forEach(e=>{e.addEventListener(`blur`,async()=>{await $e(e.closest(`[data-pilar-id]`).dataset.pilarId,{nombre:e.value.trim()})})}),e.querySelectorAll(`.pilar-del`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-pilar-id]`).dataset.pilarId;confirm(`¿Eliminar este pilar y todos sus objetivos?`)&&(await ct(t),r.curriculo_pilares=r.curriculo_pilares.filter(e=>e.id!==t),l())})}),e.querySelectorAll(`.obj-desc`).forEach(e=>{e.addEventListener(`blur`,async()=>{await at(e.closest(`[data-obj-id]`).dataset.objId,{descripcion:e.value.trim()})})}),e.querySelectorAll(`.obj-del`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-obj-id]`),n=t.dataset.objId;await et(n);let i=t.closest(`[data-pilar-id]`).dataset.pilarId,a=r.curriculo_pilares.find(e=>e.id===i);a&&(a.curriculo_objetivos=a.curriculo_objetivos.filter(e=>e.id!==n)),l()})}),e.querySelectorAll(`.new-obj-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`[data-pilar-id]`),n=t.dataset.pilarId,i=t.querySelector(`.new-obj-input`),a=i.value.trim();if(!a)return;let o=r.curriculo_pilares.find(e=>e.id===n),s=(o?.curriculo_objetivos||[]).length,c=await ot(n,a,s);o&&(o.curriculo_objetivos=[...o.curriculo_objetivos||[],c]),i.value=``,l()})}),document.getElementById(`ce-add-pilar`)?.addEventListener(`click`,async()=>{let e=prompt(`Nombre del nuevo pilar:`);if(!e?.trim())return;let t=r.curriculo_pilares.length,n=await Je(r.id,e.trim(),t);r.curriculo_pilares.push({...n,curriculo_objetivos:[]}),l()})}o.addEventListener(`hidden.bs.modal`,()=>{a.remove(),n?.()}),s.show(),l()}var Ad=`
<style id="ruta-crear-style">
.objetivo-row { border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin-bottom: 10px; display: grid; grid-template-columns: 80px 1fr auto; gap: 10px; align-items: start; }
.objetivo-row input, .objetivo-row textarea { font-size: 0.9rem; }
</style>`;function jd(e){let n=document.getElementById(`ruta-crear-modal`);n&&n.remove();let r=document.createElement(`div`);r.id=`ruta-crear-modal`,r.innerHTML=`${Ad}
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
    </div>`,document.body.appendChild(r);let i=document.getElementById(`ruta-crear-dialog`),a=new bootstrap.Modal(i),o=[{descripcion:``,semana_inicio:1,semana_fin:2,orden:1}];function s(){let e=document.getElementById(`objetivos-list`);e.innerHTML=o.map((e,t)=>`
      <div class="objetivo-row" data-idx="${t}">
        <input type="text" class="form-control form-control-sm" placeholder="Semanas" value="${e.semana_inicio}-${e.semana_fin}" style="width: 80px;">
        <textarea class="form-control form-control-sm" rows="2" placeholder="Descripción del objetivo">${e.descripcion}</textarea>
        <button type="button" class="btn btn-sm btn-link text-danger" onclick="this.closest('.objetivo-row').remove()">Eliminar</button>
      </div>
    `).join(``)}document.getElementById(`btn-agregar-objetivo`).addEventListener(`click`,()=>{let e=Math.max(...o.map(e=>e.semana_fin));o.push({descripcion:``,semana_inicio:e+1,semana_fin:e+2,orden:o.length+1}),s()}),document.getElementById(`btn-crear-ruta`).addEventListener(`click`,async()=>{let n=document.getElementById(`ruta-instrumento`).value,r=document.getElementById(`ruta-nivel`).value,i=document.getElementById(`ruta-nombre`).value,o=parseInt(document.getElementById(`ruta-duracion`).value);if(!n||!r||!i){c.warning(`Completa los campos requeridos`);return}let s=Array.from(document.querySelectorAll(`.objetivo-row`)).map((e,t)=>{let n=e.querySelector(`input`).value.split(`-`),r=e.querySelector(`textarea`).value;return{semana_inicio:parseInt(n[0]),semana_fin:parseInt(n[1]),descripcion:r,orden:t+1}});try{let{data:l}=await t.auth.getUser(),u=await Vn({instrumento:n,nivel:r,nombre:i,tipo:`soi-estandar`,estado:`activa`,duracion_semanas:o,objetivos:s,creada_por:l?.user?.id});c.success(`Ruta "${i}" creada`),a.hide(),e&&e(u)}catch(e){c.error(`Error: ${e.message}`)}}),s(),a.show()}var Md=`
<style id="ruta-variante-style">
.cambio-item { padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.cambio-add { color: #28a745; }
.cambio-remove { color: #dc3545; }
.cambio-move { color: #ffc107; }
</style>`;function Nd(e,t){let n=document.getElementById(`ruta-variante-modal`);n&&n.remove();let r=document.createElement(`div`);r.id=`ruta-variante-modal`,r.innerHTML=`${Md}
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
    </div>`,document.body.appendChild(r);let i=document.getElementById(`ruta-variante-dialog`),a=new bootstrap.Modal(i);async function o(){let n=document.getElementById(`variante-body`);try{let r=await Hn(e);n.innerHTML=`
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
        `).join(``),document.querySelectorAll(`[data-remove-idx]`).forEach(e=>{e.addEventListener(`click`,e=>{let t=parseInt(e.target.dataset.removeIdx);i.splice(t,1),o()})})}document.getElementById(`btn-agregar-obj-var`).addEventListener(`click`,()=>{let e=Math.max(...i.map(e=>e.semana_fin));i.push({descripcion:``,semana_inicio:e+1,semana_fin:e+2,orden:i.length+1}),o()}),document.getElementById(`btn-proponer-variante`).addEventListener(`click`,async()=>{let n=document.getElementById(`variante-nombre`).value,r=document.getElementById(`variante-razon`).value;if(!n||!r){c.warning(`Completa nombre y razón`);return}try{let o=await Kn(e,n,r,i);c.success(`Variante propuesta para aprobación`),a.hide(),t&&t(o)}catch(e){c.error(`Error: ${e.message}`)}}),o()}catch(e){n.innerHTML=`<div class="alert alert-danger">${e.message}</div>`}}i.addEventListener(`shown.bs.modal`,o),a.show()}var Pd=`
<style id="ruta-variantes-dashboard-style">
.variante-card { border: 1px solid #dee2e6; border-radius: 6px; padding: 15px; margin-bottom: 15px; transition: all 0.2s; }
.variante-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.variante-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; }
.cambio-list { background: #f9f9f9; border-left: 4px solid #007bff; padding: 10px; margin: 10px 0; border-radius: 4px; font-size: 0.9rem; }
</style>`;async function Fd(e){if(e)try{let t=await Wn();if(t.length===0){e.innerHTML=`${Pd}<div class="alert alert-info">No hay variantes pendientes de aprobación.</div>`;return}let n=`${Pd}
      <div class="mb-3">
        <h5><span class="badge bg-warning">${t.length} pendientes</span></h5>
      </div>`;for(let e of t){let t=e.ruta_base_id?await Hn(e.ruta_base_id):null;n+=`
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
      `}e.innerHTML=n,document.querySelectorAll(`[data-approve-id]`).forEach(e=>{e.addEventListener(`click`,async e=>{let t=e.target.closest(`button`).dataset.approveId;try{await Gn(t,!0),c.success(`Variante aprobada`),location.reload()}catch(e){c.error(`Error: ${e.message}`)}})}),document.querySelectorAll(`[data-reject-id]`).forEach(e=>{e.addEventListener(`click`,async e=>{let t=e.target.closest(`button`).dataset.rejectId,n=prompt(`Razón del rechazo:`);if(n)try{await Gn(t,!1,n),c.success(`Variante rechazada`),location.reload()}catch(e){c.error(`Error: ${e.message}`)}})})}catch(t){e.innerHTML=`<div class="alert alert-danger">${t.message}</div>`}}var Id=`
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
`;async function Ld(e,t=`maestro`){if(!e)return;let n=t===`admin`;try{let r=Id;if(n?r+=`
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
      `,e.innerHTML=r,n){e.querySelector(`#btn-crear-ruta-soi`)?.addEventListener(`click`,()=>{jd(n=>{c.success(`Ruta "${n.nombre}" creada exitosamente`),Ld(e,t)})});let n=e.querySelector(`#variantes-dashboard-container`);n&&Fd(n)}else{e.querySelector(`#btn-proponer-variante`)?.addEventListener(`click`,async()=>{try{let n=await Un({tipo:`soi-estandar`,estado:`activa`});if(n.length===0){c.warning(`No hay rutas estándar disponibles para proponer variantes`);return}let r=await Rd(n);if(!r)return;Nd(r.id,n=>{c.success(`Variante propuesta para aprobación`),Ld(e,t)})}catch(e){c.error(`Error: ${e.message}`)}});let n=e.querySelector(`#rutas-list-container`);if(n)try{let e=await Un({estado:`activa`});e.length===0?n.innerHTML=`
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
    `}}async function Rd(e){return new Promise(t=>{let n=document.createElement(`div`);n.innerHTML=`
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
    `,document.body.appendChild(n);let r=new bootstrap.Modal(n.querySelector(`#select-ruta-modal`)),i=null;n.querySelectorAll(`#ruta-options button`).forEach(t=>{t.addEventListener(`click`,()=>{i=e.find(e=>e.id===t.dataset.rutaId),r.hide()})}),n.addEventListener(`hidden.bs.modal`,()=>{n.remove(),t(i)}),r.show()})}var V={sesiones:[],sesionesEnriquecidas:[],clases:[],filtroClase:``,filtroFechaDesde:``,filtroFechaHasta:``,soloSinPlan:!1,container:null,onCrearPlan:null};async function zd(e,t={}){let{maestroId:n=null,planificaciones:r=[],onCrearPlan:i=null}=t;V.container=e,V.onCrearPlan=i,e.innerHTML=Bd();try{let[e,t]=await Promise.all([rd({maestro_id:n,soloConContenido:!0}),ft()]);V.sesiones=e.sort((e,t)=>new Date(t.fecha)-new Date(e.fecha)),V.clases=t,V.sesionesEnriquecidas=fd().getSesionesConEstadoPlanificacion(V.sesiones,r),Hd()}catch(t){console.error(`[historialContenidosPanel]`,t),e.innerHTML=`
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-exclamation-triangle fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Error al cargar historial</h5>
          <p class="mb-0 small">${v(t.message)}</p>
        </div>
      </div>`}}function Bd(){return`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando historial...</span>
      </div>
    </div>`}function Vd(){return V.sesionesEnriquecidas.filter(e=>!(V.filtroClase&&e.clase_id!==V.filtroClase||V.filtroFechaDesde&&e.fecha<V.filtroFechaDesde||V.filtroFechaHasta&&e.fecha>V.filtroFechaHasta||V.soloSinPlan&&e.tiene_plan))}function Hd(){let e=Vd(),t=V.sesionesEnriquecidas.length,n=V.sesionesEnriquecidas.filter(e=>!e.tiene_plan).length,r=t-n,i=new Map;for(let t of e){let e=t.clase_id||`sin_clase`;i.has(e)||i.set(e,[]),i.get(e).push(t)}let a=[...new Set(V.sesionesEnriquecidas.map(e=>e.clase_id).filter(Boolean))].map(e=>({id:e,nombre:V.clases.find(t=>t.id===e)?.nombre||e})).sort((e,t)=>e.nombre.localeCompare(t.nombre));V.container.innerHTML=`
    <div class="historial-panel">
      <!-- Stats -->
      <div class="historial-stats mb-3">
        <div class="historial-stat">
          <span class="historial-stat-value">${t}</span>
          <span class="historial-stat-label">Sesiones</span>
        </div>
        <div class="historial-stat historial-stat--warning">
          <span class="historial-stat-value">${n}</span>
          <span class="historial-stat-label">Sin planificar</span>
        </div>
        <div class="historial-stat historial-stat--success">
          <span class="historial-stat-value">${r}</span>
          <span class="historial-stat-label">Planificadas</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="historial-filter-bar mb-3">
        <div class="premium-select-container">
          <i class="bi bi-book select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="historial-filtro-clase">
            <option value="">Todas las clases</option>
            ${a.map(e=>`<option value="${e.id}" ${V.filtroClase===e.id?`selected`:``}>${v(e.nombre)}</option>`).join(``)}
          </select>
        </div>
        <div class="historial-date-filters">
          <input type="date" class="form-control input-dense" id="historial-fecha-desde"
                 value="${V.filtroFechaDesde}" placeholder="Desde">
          <input type="date" class="form-control input-dense" id="historial-fecha-hasta"
                 value="${V.filtroFechaHasta}" placeholder="Hasta">
        </div>
        <label class="historial-toggle" id="historial-toggle-sin-plan">
          <input type="checkbox" ${V.soloSinPlan?`checked`:``}>
          <span class="historial-toggle-label">Solo sin planificar</span>
        </label>
      </div>

      <!-- Timeline -->
      <div class="historial-timeline" id="historial-timeline">
        ${e.length===0?Gd():Ud(i)}
      </div>
    </div>
  `,Kd()}function Ud(e){let t=``;for(let[n,r]of e){let e=V.clases.find(e=>e.id===n),i=e?.nombre||`Clase sin nombre`,a=e?.instrumento||``;t+=`
      <div class="historial-grupo mb-4">
        <div class="historial-grupo-header">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-music-note-beamed text-primary"></i>
            <span class="fw-bold">${v(i)}</span>
            ${a?`<span class="badge bg-primary bg-opacity-10 text-primary border-0 small">${v(a)}</span>`:``}
          </div>
          <span class="text-muted small">${r.length} sesión${r.length===1?``:`es`}</span>
        </div>
        <div class="historial-grupo-body">
          ${r.map(t=>Wd(t,e)).join(``)}
        </div>
      </div>
    `}return t}function Wd(e,t){let n=e.tiene_plan,r=n?`historial-card--planned`:`historial-card--unplanned`,i=n?`<span class="badge bg-success bg-opacity-10 text-success border-0"><i class="bi bi-check-circle me-1"></i>Planificado</span>`:`<span class="badge bg-warning bg-opacity-10 text-warning border-0"><i class="bi bi-exclamation-circle me-1"></i>Sin planificar</span>`,a=qd(e.fecha),o=e.hora_inicio&&e.hora_fin?`${e.hora_inicio} – ${e.hora_fin}`:``,s=e.asistencia?`<span class="historial-meta-item"><i class="bi bi-people"></i> P:${e.asistencia.presentes} A:${e.asistencia.ausentes}</span>`:`<span class="historial-meta-item text-muted"><i class="bi bi-people"></i> Sin asistencia</span>`,c=e.tipo===`emergente`?`⚡`:`📅`;return`
    <div class="historial-sesion-card ${r}" data-sesion-id="${e.id}">
      <div class="historial-card-timeline-dot"></div>
      <div class="historial-card-content">
        <div class="historial-card-header">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="historial-fecha">${c} ${a}</span>
            ${o?`<span class="historial-horario">${o}</span>`:``}
            ${i}
          </div>
        </div>
        <h6 class="historial-card-title">${v(e.tema||`Sin tema`)}</h6>
        ${e.contenido?`<p class="historial-card-desc">${v(e.contenido)}</p>`:``}
        <div class="historial-card-meta">
          ${s}
          ${e.motivo?`<span class="historial-meta-item"><i class="bi bi-tag"></i> ${v(e.motivo)}</span>`:``}
        </div>
        <div class="historial-card-actions">
          ${n?`<button class="btn btn-sm btn-outline-secondary" data-action="ver-plan" data-sesion-id="${e.id}" title="Ver plan asociado">
                  <i class="bi bi-eye me-1"></i>Ver Plan
                </button>`:`<button class="btn btn-sm btn-promover-plan" data-action="promover" data-sesion-id="${e.id}" title="Agregar a planificación oficial">
                  <i class="bi bi-journal-plus me-1"></i>Agregar a Plan
                </button>`}
        </div>
      </div>
    </div>
  `}function Gd(){return`
    <div class="text-center py-5 px-3">
      <i class="bi bi-clock-history text-muted d-block mb-3" style="font-size: 3rem; opacity: .4"></i>
      <h5 class="text-muted fw-normal mb-1">No hay sesiones registradas</h5>
      <p class="text-muted small mb-0">
        ${V.soloSinPlan?`Todas las sesiones ya están vinculadas a un plan. ¡Buen trabajo!`:`Cuando registres contenidos en tus clases, aparecerán aquí.`}
      </p>
    </div>
  `}function Kd(){let e=V.container;e.querySelector(`#historial-filtro-clase`)?.addEventListener(`change`,e=>{V.filtroClase=e.target.value,Hd()}),e.querySelector(`#historial-fecha-desde`)?.addEventListener(`change`,e=>{V.filtroFechaDesde=e.target.value,Hd()}),e.querySelector(`#historial-fecha-hasta`)?.addEventListener(`change`,e=>{V.filtroFechaHasta=e.target.value,Hd()}),e.querySelector(`#historial-toggle-sin-plan input`)?.addEventListener(`change`,e=>{V.soloSinPlan=e.target.checked,Hd()}),e.querySelector(`#historial-timeline`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let n=t.dataset.sesionId,r=V.sesionesEnriquecidas.find(e=>e.id===n);if(r){if(t.dataset.action===`promover`&&V.onCrearPlan){let e=V.clases.find(e=>e.id===r.clase_id);V.onCrearPlan({tema:r.tema||``,clase_id:r.clase_id||``,contenido:r.contenido||``,fecha_inicio:r.fecha||``,instrumento:e?.instrumento||``})}t.dataset.action===`ver-plan`&&r.plan_asociado&&document.dispatchEvent(new CustomEvent(`planificacion:focusPlan`,{detail:{planId:r.plan_asociado.id}}))}})}function qd(e){return e?new Date(e+`T00:00:00`).toLocaleDateString(`es-ES`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`}):`-`}var H={planes:[],cargando:!1,viewMode:`maestro`,activeTab:`planes`,asistenteRendered:!1,rutasRendered:!1,historialRendered:!1,seleccionados:new Set,container:null},Jd=fd();async function Yd(e,{viewMode:t=`maestro`}={}){if(e){if(H.container=e,H.viewMode=t,H.seleccionados=new Set,H.asistenteRendered=!1,H.rutasRendered=!1,H.historialRendered=!1,t===`plantillas`){nf(e);return}try{H.cargando=!0,Xd(e),await Jd.fetchPlanificacionesConDetalles(),H.planes=[...Jd.planificaciones],H.cargando=!1,Qd(e),af(e)}catch(t){console.error(`[planificacionView]`,t),Zd(e,t.message)}}}function Xd(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>`}function Zd(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${v(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>planificaciones</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`}function Qd(e){let t=H.viewMode===`admin`,n=t?`Todas las Planificaciones`:`Mis Planes de Clase`,r=t?`bi-shield-check`:`bi-journal-check`,i=t?`${Jd.planificaciones.length} planes pendientes de revisión`:`${Jd.planificaciones.length} planes registrados`,a=t?$d():``;e.innerHTML=`
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
            ${Array.from(new Set(Jd.planificaciones.map(e=>e.maestro_nombre).filter(e=>e&&e!==`Sin asignar`))).sort().map(e=>`<option value="${v(e)}">${v(e)}</option>`).join(``)}
          </select>
        </div>
        `:``}
        <div class="premium-select-container">
          <i class="bi bi-book select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-clase">
            <option value="">Todas las clases</option>
            ${Array.from(new Set(Jd.planificaciones.map(e=>e.clase_nombre).filter(e=>e&&e!==`Sin asignar`))).sort().map(e=>`<option value="${v(e)}">${v(e)}</option>`).join(``)}
          </select>
        </div>
        <div class="premium-select-container">
          <i class="bi bi-funnel select-icon-muted"></i>
          <select class="form-select premium-filter-select" id="select-estado">
            <option value="">Todos los estados</option>
            ${_t.getEstados().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
          <button class="nav-link" data-tab="historial">
            <i class="bi bi-clock-history me-1"></i>Historial
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
              ${ef(H.planes)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${H.planes.length===0?tf():``}</div>
      </div>
      </div>

      ${t?``:`
      <div id="tab-content-plantillas" style="display:none">
        <div class="alert alert-info border-0 py-3" style="font-size:0.875rem;">
          <i class="bi bi-file-earmark-template me-2"></i>
          Las plantillas de planificación estarán disponibles próximamente.
        </div>
      </div>
      <div id="tab-content-historial" style="display:none"></div>
      <div id="tab-content-rutas" style="display:none"></div>
      <div id="tab-content-asistente" style="display:none"></div>
      `}
    </div>
  `}function $d(){let e=Jd.planificaciones,t=e.filter(e=>e.estado===`ejecutado`).length,n=e.filter(e=>e.estado===`revisado`).length,r=e.length;return`
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
  `}function ef(e){if(!e||e.length===0)return``;let t=H.viewMode===`admin`;return e.map(e=>{let n=_t.getEstadoConfig(e.estado),r=e.estado===`revisado`?`border-accent-success`:e.estado===`ejecutado`?`border-accent-warning`:`border-accent-secondary`;return`
      <tr data-id="${e.id}" class="border-start-accent ${r}">
        ${t?`<td><input type="checkbox" class="plan-check" value="${e.id}" ${H.seleccionados.has(e.id)?`checked`:``}></td>`:``}
        <td>
          <div class="fw-bold">${v(e.clase_nombre||`Sin clase`)}</div>
          <div class="small text-muted text-truncate" style="max-width: 260px">${v(e.tema)}</div>
        </td>
        ${t?`<td class="d-none d-md-table-cell align-middle small text-muted">${v(e.maestro_nombre||`N/A`)}</td>`:``}
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
    `}).join(``)}function tf(){let e=H.viewMode===`admin`;return`
    <div class="text-center py-5 px-3">
      <i class="bi bi-journal-x text-muted d-block mb-3" style="font-size: 3rem; opacity: .4"></i>
      <h5 class="text-muted fw-normal mb-1">
        ${e?`No hay planificaciones registradas aún`:`Todavía no tienes planes de clase`}
      </h5>
      <p class="text-muted small mb-0">
        ${e?`Una vez que los maestros creen sus planes, aparecerán aquí para revisión.`:`Crea tu primer plan de clase usando el botón de arriba o usa una plantilla.`}
      </p>
    </div>
  `}async function nf(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando plantillas...</span>
      </div>
    </div>`;try{let t=await mt();if(!t||t.length===0){e.innerHTML=`
        <div class="page-container">
          <div class="planificacion-header-premium mb-4">
            <div class="d-flex align-items-center gap-3">
              <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                <i class="bi bi-file-earmark-text fs-4"></i>
              </div>
              <div>
                <h1 class="planificacion-title-premium page-title mb-0">Plantillas de Planificación</h1>
                <p class="text-muted small mb-0">No hay plantillas disponibles aún.</p>
              </div>
            </div>
          </div>
        </div>`;return}e.innerHTML=`
      <div class="page-container">
        <div class="planificacion-header-premium mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
              <i class="bi bi-file-earmark-text fs-4"></i>
            </div>
            <div>
              <h1 class="planificacion-title-premium page-title mb-0">Plantillas de Planificación</h1>
              <p class="text-muted small mb-0">${t.length} plantilla${t.length===1?``:`s`} disponible${t.length===1?``:`s`} — seleccioná una y personalizala</p>
            </div>
          </div>
        </div>

        <div class="row g-3">
          ${t.map(e=>`
            <div class="col-md-6">
              <div class="page-glass rounded p-4 h-100 d-flex flex-column">
                <div class="d-flex align-items-start gap-3 mb-3">
                  <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px;height:40px">
                    <i class="bi bi-journal-text fs-5"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-0">${v(e.nombre)}</h5>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary border small">${v(e.instrumento)}</span>
                  </div>
                </div>
                <p class="text-muted small flex-grow-1">${v(e.descripcion)}</p>
                <details class="mb-3">
                  <summary class="small text-primary" style="cursor:pointer">Ver contenido DSL</summary>
                  <pre class="mt-2 p-2 bg-body-tertiary rounded small border" style="font-size:.75rem;white-space:pre-wrap">${v(e.contenido)}</pre>
                </details>
                <button class="btn btn-outline-primary btn-sm" data-template-id="${e.id}">
                  <i class="bi bi-plus-circle me-1"></i>Usar esta plantilla
                </button>
              </div>
            </div>
          `).join(``)}
        </div>
      </div>
    `,e.querySelectorAll(`button[data-template-id]`).forEach(e=>{e.addEventListener(`click`,()=>{let n=t.find(t=>t.id===e.dataset.templateId);n&&rf(n)})})}catch(t){console.error(`[plantillas]`,t),e.innerHTML=`
      <div class="page-container">
        <div class="planificacion-header-premium mb-4">
          <div class="d-flex align-items-center gap-3">
            <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
              <i class="bi bi-file-earmark-text fs-4"></i>
            </div>
            <div>
              <h1 class="planificacion-title-premium page-title mb-0">Plantillas de Planificación</h1>
              <p class="text-muted small mb-0">Error al cargar plantillas</p>
            </div>
          </div>
        </div>
        <div class="alert alert-warning d-flex align-items-start gap-3" role="alert">
          <i class="bi bi-exclamation-triangle fs-4 text-warning mt-1"></i>
          <div>
            <h5 class="alert-heading mb-1">Error al cargar plantillas</h5>
            <p class="mb-0 small">${v(t.message)}</p>
          </div>
        </div>
      </div>`}}function rf(e){_.open({title:`Usar plantilla: ${e.nombre}`,saveText:`Crear Plan`,size:`lg`,body:`
      <form id="form-tpl" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="tpl-tema" value="${v(e.nombre)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="tpl-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="tpl-objetivos" rows="2">${v(e.descripcion)}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Contenido DSL</label>
          <textarea class="form-control input-dense font-monospace" id="tpl-contenido" rows="7">${v(e.contenido)}</textarea>
        </div>
      </form>
    `,onOpen:async e=>{let t=await ft(),n=e.querySelector(`#tpl-clase_id`);n.innerHTML=`<option value="">Seleccionar clase...</option>`+t.map(e=>`<option value="${e.id}">${v(e.nombre)}</option>`).join(``)},onSave:async e=>{let t={tema:e.querySelector(`#tpl-tema`).value.trim(),clase_id:e.querySelector(`#tpl-clase_id`).value,objetivos:e.querySelector(`#tpl-objetivos`).value.trim(),contenido:e.querySelector(`#tpl-contenido`).value.trim()};try{return await vt(t),c.success(`Plan creado desde plantilla`),!0}catch(e){return c.error(e.message),!1}}})}function af(e){let t=H.viewMode===`admin`;e.querySelector(`#buscar-plan`)?.addEventListener(`input`,of),e.querySelector(`#select-estado`)?.addEventListener(`change`,of),e.querySelector(`#select-clase`)?.addEventListener(`change`,of),t&&e.querySelector(`#select-maestro`)?.addEventListener(`change`,of),e.querySelector(`#btn-help-planificacion`)?.addEventListener(`click`,()=>{hr.open({title:`Planificación`,intro:`Módulo para gestionar los planes de clase. Cada plan documenta qué se trabajará en una clase, en qué fecha, y si fue ejecutado o no.`,sections:[{icon:`bi-journal-text`,title:`Tab Mis planes`,description:`Lista tus planes personales. Filtrá por estado (planificado, ejecutado, cancelado) y creá nuevos desde "Nuevo plan".`,color:`#3b82f6`},{icon:`bi-file-earmark-template`,title:`Tab Plantillas`,description:`Plantillas reutilizables en formato DSL. Sirven como base para crear nuevos planes rápidamente.`,color:`#6366f1`},{icon:`bi-journal-check`,title:`Todas las planes (admin)`,description:`Solo visible para administradores. Muestra los planes de todos los maestros para supervisión.`,color:`#10b981`},{icon:`bi-circle-fill`,title:`Estados del plan`,description:`"Planificado" = no dictado aún. "Ejecutado" = clase dada. "Cancelado" = no se realizó. Mantenerlos actualizados mejora los reportes.`,color:`#f59e0b`}]})}),t||e.querySelector(`#btn-nuevo-plan`)?.addEventListener(`click`,()=>cf(null)),t&&(e.querySelector(`#check-all`)?.addEventListener(`change`,t=>{let n=t.target.checked;H.seleccionados=n?new Set(H.planes.map(e=>e.id)):new Set,e.querySelectorAll(`.plan-check`).forEach(e=>{e.checked=n}),sf()}),e.querySelector(`#btn-aprobar-bulk`)?.addEventListener(`click`,async()=>{let t=[...H.seleccionados];if(t.length)try{await ht(t),c.success(`${t.length} plan(es) aprobados`),Yd(e,{viewMode:H.viewMode})}catch(e){c.error(e.message)}})),e.querySelectorAll(`#planificacion-tabs .nav-link`).forEach(t=>{t.addEventListener(`click`,()=>{if(H.activeTab=t.dataset.tab,[`planes`,`plantillas`,`historial`,`rutas`,`asistente`].forEach(t=>{let n=e.querySelector(`#tab-content-${t}`);n&&(n.style.display=H.activeTab===t?`block`:`none`)}),e.querySelectorAll(`#planificacion-tabs .nav-link`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),H.activeTab===`historial`&&!H.historialRendered){let t=e.querySelector(`#tab-content-historial`);t&&(zd(t,{maestroId:Jd.maestroActualId,planificaciones:Jd.planificaciones,onCrearPlan:e=>cf(null,e)}),H.historialRendered=!0)}if(H.activeTab===`rutas`&&!H.rutasRendered){let t=e.querySelector(`#tab-content-rutas`);t&&(Ld(t,H.viewMode),H.rutasRendered=!0)}if(H.activeTab===`asistente`&&!H.asistenteRendered){let t=e.querySelector(`#tab-content-asistente`);t&&(Td(t),H.asistenteRendered=!0)}})}),document.addEventListener(`planificacion:focusPlan`,t=>{let{planId:n}=t.detail||{};if(!n)return;let r=e.querySelector(`#planificacion-tabs .nav-link[data-tab="planes"]`);r&&r.click();let i=e.querySelector(`#planes-tbody tr[data-id="${n}"]`);i&&(i.scrollIntoView({behavior:`smooth`,block:`center`}),i.style.transition=`background-color 0.6s ease`,i.style.backgroundColor=`rgba(var(--bs-primary-rgb), 0.12)`,setTimeout(()=>{i.style.backgroundColor=``},2500))}),document.addEventListener(`planificacion:nuevoPlan`,e=>{cf(null)},{once:!0}),t&&e.querySelector(`#btn-curriculo-admin`)?.addEventListener(`click`,()=>{Dd()}),e.querySelector(`#planes-tbody`)?.addEventListener(`change`,e=>{if(!e.target.classList.contains(`plan-check`))return;let t=e.target.value;e.target.checked?H.seleccionados.add(t):H.seleccionados.delete(t),sf()}),e.querySelector(`#planes-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit`&&cf(r),n===`delete`&&ff(r),n===`approve`&&uf(r),n===`view`&&lf(r),n===`ejecutar`&&df(r)})}function of(){let e=H.container.querySelector(`#buscar-plan`)?.value.toLowerCase()||``,t=H.container.querySelector(`#select-estado`)?.value||``,n=H.container.querySelector(`#select-clase`)?.value||``,r=H.container.querySelector(`#select-maestro`)?.value||``;H.planes=Jd.planificaciones.filter(i=>{let a=(i.tema||``).toLowerCase().includes(e)||(i.clase_nombre||``).toLowerCase().includes(e),o=!t||i.estado===t,s=!n||i.clase_nombre===n,c=!r||i.maestro_nombre===r;return a&&o&&s&&c});let i=H.container.querySelector(`#planes-tbody`),a=H.container.querySelector(`#empty-container`);i&&(i.innerHTML=ef(H.planes)),a&&(a.innerHTML=H.planes.length===0?tf():``)}function sf(){let e=H.container?.querySelector(`#btn-aprobar-bulk`);e&&(e.style.display=H.seleccionados.size>0?``:`none`)}async function cf(e,t={}){let n=e&&Jd.getById(e)||new _t(t);_.open({title:e?`Editar Plan de Clase`:`Nuevo Plan de Clase`,saveText:`Guardar Plan`,size:`lg`,body:`
      <form id="form-plan" class="row g-3">
        <div class="col-md-8">
          <label class="form-label-compact">Tema de la Clase *</label>
          <input type="text" class="form-control input-dense" id="plan-tema" value="${v(n.tema)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="plan-clase_id" required>
            <option value="">Cargando...</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label-compact">Objetivos</label>
          <textarea class="form-control input-dense" id="plan-objetivos" rows="2">${v(n.objetivos)}</textarea>
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
          <input type="text" class="form-control input-dense" id="plan-instrumento" value="${v(n.instrumento||``)}">
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Método de evaluación</label>
          <input type="text" class="form-control input-dense" id="plan-eval" value="${v(n.evaluacion_metodo||``)}">
        </div>
      </form>
    `,onOpen:async e=>{let t=await ft(),r=e.querySelector(`#plan-clase_id`);r.innerHTML=`<option value="">Seleccionar clase...</option>`+t.map(e=>`<option value="${e.id}" ${e.id===n.clase_id?`selected`:``}>${v(e.nombre)}</option>`).join(``);let i=e.querySelector(`#plan-dsl-container`),a=tt({initialContent:n.notas_dsl||``,onChange:(t,n)=>{let r=e.querySelector(`#plan-dsl-summary`);r&&n.items&&n.items.length>0&&(r.innerHTML=`<strong>Elementos:</strong> ${n.items.length} indicadores/actividades parseadas`)},onAlumnoClick:async()=>{let e=(await je()).slice(0,3).map(e=>`#${e.nombre_completo}`).join(`, `);a.component&&a.component.insertText(e+` `)}});i.appendChild(a),e._dslEditor=a},onSave:async t=>{let n=t._dslEditor,r={tema:t.querySelector(`#plan-tema`).value.trim(),clase_id:t.querySelector(`#plan-clase_id`).value,objetivos:t.querySelector(`#plan-objetivos`).value.trim(),contenido:t.querySelector(`#plan-contenido`)?.value.trim()||``,notas_dsl:n?n.getContent():``,fecha_inicio:t.querySelector(`#plan-fecha`).value||null,instrumento:t.querySelector(`#plan-instrumento`).value.trim()||null,evaluacion_metodo:t.querySelector(`#plan-eval`).value.trim()||null},i=new _t(r).validate();if(i.length>0)return c.error(i[0]),!1;try{return e?(await St(e,r),c.success(`Plan actualizado correctamente`)):(await vt(r),c.success(`Plan creado correctamente`)),Yd(H.container,{viewMode:H.viewMode}),!0}catch(e){return c.error(e.message),!1}}})}function lf(e){let t=Jd.getById(e);if(!t)return;let n=_t.getEstadoConfig(t.estado);_.open({title:`Plan: ${t.clase_nombre||`Sin clase`}`,hideSave:!0,size:`lg`,body:`
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <div class="small text-muted text-uppercase fw-bold mb-1">Tema</div>
          <div class="fw-bold">${v(t.tema)}</div>
        </div>
        <div class="col-md-4 text-md-end">
          <span class="badge ${n.color} fs-6">${n.label}</span>
        </div>
      </div>
      ${t.maestro_nombre?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Maestro</div>
          <div>${v(t.maestro_nombre)}</div>
        </div>
      `:``}
      ${t.objetivos?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Objetivos</div>
          <div class="text-muted">${v(t.objetivos)}</div>
        </div>
      `:``}
      ${t.contenido?`
        <div class="mb-3">
          <div class="small text-muted text-uppercase fw-bold mb-1">Contenido DSL</div>
          <pre class="p-3 rounded border bg-body-tertiary small" style="white-space:pre-wrap">${v(t.contenido)}</pre>
        </div>
      `:``}
      <div class="row g-2">
        ${t.fecha_inicio?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-calendar me-1"></i>${t.fecha_inicio}</span></div>`:``}
        ${t.instrumento?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-music-note me-1"></i>${v(t.instrumento)}</span></div>`:``}
        ${t.evaluacion_metodo?`<div class="col-auto"><span class="badge bg-light text-dark border"><i class="bi bi-clipboard-check me-1"></i>${v(t.evaluacion_metodo)}</span></div>`:``}
      </div>
    `})}async function uf(e){try{await ht([e]),c.success(`Plan aprobado y marcado como revisado`),Yd(H.container,{viewMode:H.viewMode})}catch(e){c.error(e.message)}}async function df(e){let t=Jd.getById(e);if(!t)return;let n=t.instrumento,r=null,i=t.clase_id;if(i){let e=(await ft()).find(e=>e.id===i);e&&(n||=e.instrumento,r=e.plan_estudio)}let a=Jd.maestroActualId||t.maestro_id;Cd({plan:t,claseId:i,instrumento:n,nivel:r,maestroId:a,onConfirm:async()=>{try{await St(e,{estado:`ejecutado`}),c.success(`Plan marcado como ejecutado`),Yd(H.container,{viewMode:H.viewMode})}catch(e){c.error(e.message)}},onSkip:async()=>{try{await St(e,{estado:`ejecutado`}),c.success(`Plan ejecutado (sin cobertura)`),Yd(H.container,{viewMode:H.viewMode})}catch(e){c.error(e.message)}}})}async function ff(e){let t=Jd.getById(e);t&&_.open({title:`⚠️ Eliminar Plan`,saveText:`Eliminar`,body:`<p>¿Estás seguro de eliminar el plan <strong>"${v(t.tema)}"</strong>? Esta acción no se puede deshacer.</p>`,onSave:async()=>{try{return await bt(e),c.success(`Plan eliminado`),Yd(H.container,{viewMode:H.viewMode}),!0}catch(e){return c.error(e.message),!1}}})}async function pf(e){if(e)try{e.innerHTML=`
      <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando cobertura...</span>
        </div>
      </div>`;let t=await yt(),n=t.length,r=t.filter(e=>e.tiene_plan).length,i=n-r,a=n>0?Math.round(r/n*100):0;e.innerHTML=`
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
              ${t.map(mf).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,e.querySelector(`#btn-refresh-cobertura`).addEventListener(`click`,()=>{pf(e)}),e.querySelectorAll(`.btn-crear-plan-cobertura`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.dataset.claseId,[r,i]=await Promise.all([ft(),xt()]);nt(`create`,null,r,i,{clase_id:n},async t=>{await vt(t),c.success(`Plan creado correctamente`),pf(e)})})}),e.querySelectorAll(`.btn-ver-plan-cobertura`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.dataset.planId,[r,i,a]=await Promise.all([d(()=>import(`./planificacionAdapter-YQ-GJwgP.js`).then(e=>e.p).then(e=>e.obtenerPlanificacion(n)),__vite__mapDeps([8,4,1,9,10])),ft(),xt()]);nt(`edit`,r,i,a,{},async t=>{await St(n,t),c.success(`Plan actualizado`),pf(e)})})})}catch(t){console.error(`[coberturaView]`,t),e.innerHTML=`
      <div class="page-container">
        <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
          <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
          <div>
            <h5 class="alert-heading mb-1">Error al cargar cobertura</h5>
            <p class="mb-0 small">${v(t.message)}</p>
          </div>
        </div>
      </div>`}}function mf(e){let t=e.tiene_plan?hf(e.plan_estado):`<span class="badge bg-secondary">Sin plan</span>`,n=e.tiene_plan?`<button class="btn btn-outline-primary btn-sm btn-ver-plan-cobertura" data-plan-id="${v(e.plan_id)}">
        <i class="bi bi-eye me-1"></i>Ver plan
      </button>`:`<button class="btn btn-success btn-sm btn-crear-plan-cobertura" data-clase-id="${v(e.clase_id)}" data-clase-nombre="${v(e.clase_nombre)}">
        <i class="bi bi-plus-lg me-1"></i>Crear plan
      </button>`;return`
    <tr>
      <td class="fw-medium">${v(e.clase_nombre)}</td>
      <td>${v(e.instrumento)}</td>
      <td>${v(e.maestro_nombre)}</td>
      <td>${t}</td>
      <td class="text-end">${n}</td>
    </tr>`}function hf(e){let t={planificado:{cls:`bg-primary`,icon:`bi-file-text`},ejecutado:{cls:`bg-warning text-dark`,icon:`bi-play-circle`},revisado:{cls:`bg-success`,icon:`bi-check-circle`}}[e]||{cls:`bg-secondary`,icon:`bi-question`};return`<span class="badge `+t.cls+`"><i class="bi `+t.icon+` me-1"></i>`+e+`</span>`}var gf=e({getClasses:()=>_f,getFullHierarchy:()=>Sf,getIndicatorsByObjective:()=>xf,getLevelsByClass:()=>vf,getNodesByLevel:()=>yf,getObjectivesByNode:()=>bf,updateIndicatorCalificacion:()=>Cf});async function _f(e=null){let n=t.from(`plan_clases`).select(`*`).eq(`activo`,!0);e&&(n=n.eq(`maestro_id`,e));let{data:r,error:i}=await n.order(`nombre`);if(i)throw i;return r||[]}async function vf(e){let{data:n,error:r}=await t.from(`plan_niveles`).select(`*`).eq(`clase_id`,e).order(`numero_nivel`);if(r)throw r;return n||[]}async function yf(e){let{data:n,error:r}=await t.from(`plan_temas`).select(`*`).eq(`nivel_id`,e).order(`orden_index`);if(r)throw r;return n||[]}async function bf(e){let{data:n,error:r}=await t.from(`plan_objetivos`).select(`*`).eq(`tema_id`,e).order(`orden_index`);if(r)throw r;return n||[]}async function xf(e){let{data:n,error:r}=await t.from(`plan_indicadores`).select(`*`).eq(`objetivo_id`,e).order(`orden_index`);if(r)throw r;return n||[]}async function Sf(e){let{data:n,error:r}=await t.from(`plan_niveles`).select(`
      *,
      plan_temas (
        *,
        plan_objetivos (
          *,
          plan_indicadores (*)
        )
      )
    `).eq(`clase_id`,e).order(`numero_nivel`);if(r)throw r;return n||[]}async function Cf(e,n){let{error:r}=await t.from(`plan_indicadores`).update({calificacion:n}).eq(`id`,e);if(r)throw r}var wf={plan_clases:[{id:`pclase_001`,nombre:`Violín Principiantes`,maestro_id:`maestro_001`,clase_id:`clase_001`,activo:!0},{id:`pclase_002`,nombre:`Piano Intermedio`,maestro_id:`maestro_002`,clase_id:`clase_002`,activo:!0}],plan_niveles:[{id:`pnivel_001`,clase_id:`pclase_001`,nombre:`Nivel 1 — Introducción`,numero_nivel:1,objetivo_general:`Familiarizar al estudiante con el instrumento y la postura básica`},{id:`pnivel_002`,clase_id:`pclase_001`,nombre:`Nivel 2 — Escalas y Arpegios`,numero_nivel:2,objetivo_general:`Desarrollar la técnica de escalas mayores`},{id:`pnivel_003`,clase_id:`pclase_002`,nombre:`Nivel 1 — Fundamentos`,numero_nivel:1,objetivo_general:`Afianzar la lectura de partituras y coordinación`},{id:`pnivel_004`,clase_id:`pclase_002`,nombre:`Nivel 2 — Técnica Avanzada`,numero_nivel:2,objetivo_general:`Desarrollar velocidad y dinámica`}],plan_temas:[{id:`ptema_001`,nivel_id:`pnivel_001`,nombre:`Postura y sujeción del arco`,tipo:`TECNICA`,orden_index:1},{id:`ptema_002`,nivel_id:`pnivel_001`,nombre:`Cuerdas al aire`,tipo:`TECNICA`,orden_index:2},{id:`ptema_003`,nivel_id:`pnivel_002`,nombre:`Escala de Do Mayor`,tipo:`ESCALA`,orden_index:1},{id:`ptema_004`,nivel_id:`pnivel_002`,nombre:`Arpegio de Do Mayor`,tipo:`ARPEGIO`,orden_index:2},{id:`ptema_005`,nivel_id:`pnivel_003`,nombre:`Lectura de claves`,tipo:`TEORIA`,orden_index:1},{id:`ptema_006`,nivel_id:`pnivel_003`,nombre:`Coordinación manos`,tipo:`TECNICA`,orden_index:2},{id:`ptema_007`,nivel_id:`pnivel_004`,nombre:`Escalas cromáticas`,tipo:`ESCALA`,orden_index:1},{id:`ptema_008`,nivel_id:`pnivel_004`,nombre:`Estudio de velocidad`,tipo:`TECNICA`,orden_index:2}],plan_objetivos:[{id:`pobj_001`,tema_id:`ptema_001`,nombre:`Mantener postura erguida sin tensión`,orden_index:1},{id:`pobj_002`,tema_id:`ptema_001`,nombre:`Sujetar el arco con ángulo correcto`,orden_index:2},{id:`pobj_003`,tema_id:`ptema_002`,nombre:`Ejecutar cuerdas al aire con sonido parejo`,orden_index:1},{id:`pobj_004`,tema_id:`ptema_003`,nombre:`Ejecutar escala ascendente y descendente`,orden_index:1},{id:`pobj_005`,tema_id:`ptema_003`,nombre:`Mantener tempo constante a 60 bpm`,orden_index:2},{id:`pobj_006`,tema_id:`ptema_004`,nombre:`Ejecutar arpegio con cambio de cuerda fluido`,orden_index:1},{id:`pobj_007`,tema_id:`ptema_005`,nombre:`Identificar notas en clave de Sol y Fa`,orden_index:1},{id:`pobj_008`,tema_id:`ptema_005`,nombre:`Leer ritmos básicos (negra, corchea)`,orden_index:2},{id:`pobj_009`,tema_id:`ptema_006`,nombre:`Tocar melodía simple con manos juntas`,orden_index:1},{id:`pobj_010`,tema_id:`ptema_007`,nombre:`Ejecutar escala cromática completa`,orden_index:1},{id:`pobj_011`,tema_id:`ptema_008`,nombre:`Ejecutar pasaje a 120 bpm con precisión`,orden_index:1}],plan_indicadores:[{id:`pind_001`,objetivo_id:`pobj_001`,descripcion:`Hombros relajados y pies apoyados`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_002`,objetivo_id:`pobj_001`,descripcion:`Columna alineada sin inclinación`,es_requerido:!0,calificacion:0,orden_index:2},{id:`pind_003`,objetivo_id:`pobj_002`,descripcion:`Dedo pulgar relajado en la vara`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_004`,objetivo_id:`pobj_003`,descripcion:`Sonido uniforme en toda la longitud del arco`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_005`,objetivo_id:`pobj_004`,descripcion:`Digita correctamente las 8 notas`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_006`,objetivo_id:`pobj_004`,descripcion:`Mantiene la misma velocidad en ambos sentidos`,es_requerido:!1,calificacion:0,orden_index:2},{id:`pind_007`,objetivo_id:`pobj_005`,descripcion:`Coincide con el clic del metrónomo`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_008`,objetivo_id:`pobj_006`,descripcion:`Cambio de cuerda sin interrupción`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_009`,objetivo_id:`pobj_007`,descripcion:`Nombra las notas del pentagrama en menos de 3s`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_010`,objetivo_id:`pobj_008`,descripcion:`Ejecuta correctamente patrones rítmicos simples`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_011`,objetivo_id:`pobj_009`,descripcion:`Mantiene coordinación entre ambas manos`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_012`,objetivo_id:`pobj_010`,descripcion:`Ejecuta las 12 notas sin errores de digitación`,es_requerido:!0,calificacion:0,orden_index:1},{id:`pind_013`,objetivo_id:`pobj_011`,descripcion:`Mantiene precisión rítmica a velocidad`,es_requerido:!0,calificacion:0,orden_index:1}]},Tf=e({getClasses:()=>jf,getFullHierarchy:()=>If,getIndicatorsByObjective:()=>Ff,getLevelsByClass:()=>Mf,getNodesByLevel:()=>Nf,getObjectivesByNode:()=>Pf,updateIndicatorCalificacion:()=>Lf}),Ef=`ruta_academica_demo`,Df=1,U=null;function Of(){if(U===null){try{let e=localStorage.getItem(Ef);if(e){let t=JSON.parse(e);if(t&&t.schemaVersion===Df){U=t;return}}}catch{}U=JSON.parse(JSON.stringify(wf)),kf()}}function kf(){try{localStorage.setItem(Ef,JSON.stringify({...U,schemaVersion:Df}))}catch(e){console.warn(`[routeMock] Failed to persist:`,e.message)}}function Af(e=100){return new Promise(t=>setTimeout(t,e))}async function jf(e=null){await Af(),Of();let t=U.plan_clases.filter(e=>e.activo);return e&&(t=t.filter(t=>t.maestro_id===e)),[...t]}async function Mf(e){return await Af(),Of(),U.plan_niveles.filter(t=>t.clase_id===e).sort((e,t)=>e.numero_nivel-t.numero_nivel)}async function Nf(e){return await Af(),Of(),U.plan_temas.filter(t=>t.nivel_id===e).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0))}async function Pf(e){return await Af(),Of(),U.plan_objetivos.filter(t=>t.tema_id===e).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0))}async function Ff(e){return await Af(),Of(),U.plan_indicadores.filter(t=>t.objetivo_id===e).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0))}async function If(e){return await Af(150),Of(),U.plan_niveles.filter(t=>t.clase_id===e).sort((e,t)=>e.numero_nivel-t.numero_nivel).map(e=>({...e,plan_temas:U.plan_temas.filter(t=>t.nivel_id===e.id).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0)).map(e=>({...e,plan_objetivos:U.plan_objetivos.filter(t=>t.tema_id===e.id).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0)).map(e=>({...e,plan_indicadores:U.plan_indicadores.filter(t=>t.objetivo_id===e.id).sort((e,t)=>(e.orden_index||0)-(t.orden_index||0))}))}))}))}async function Lf(e,t){await Af(),Of();let n=U.plan_indicadores.findIndex(t=>t.id===e);if(n===-1)throw Error(`Indicador no encontrado`);U.plan_indicadores[n]={...U.plan_indicadores[n],calificacion:t},kf()}var Rf=p.isDemoMode?Tf:gf,zf=e=>Rf.getClasses(e),Bf=e=>Rf.getFullHierarchy(e),Vf={0:`Sin eval.`,1:`Inicial`,2:`En desarrollo`,3:`Logrado`,4:`Destacado`,5:`Superado`},Hf={0:`#9ca3af`,1:`#ef4444`,2:`#f97316`,3:`#22c55e`,4:`#06b6d4`,5:`#8b5cf6`};async function Uf(e){Jf(),e.innerHTML=`
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
  `;try{let t=await zf(),n=e.querySelector(`#ra-clase-select`);n.innerHTML=`<option value="">Seleccionar clase...</option>`+t.map(e=>`<option value="${e.id}">${v(e.nombre)}</option>`).join(``),n.addEventListener(`change`,()=>{let t=n.value;t?Wf(e,t):(e.querySelector(`#ra-tree-container`).innerHTML=`
          <div class="ra-placeholder">
            <i class="bi bi-arrow-up-circle"></i>
            <p>Seleccioná una clase para ver su ruta académica</p>
          </div>`,e.querySelector(`#ra-stats`).innerHTML=``)})}catch(t){console.error(`[rutaAcademica] Error loading classes:`,t),e.querySelector(`#ra-clase-select`).innerHTML=`<option value="">Error al cargar clases</option>`}}async function Wf(e,t){let n=e.querySelector(`#ra-tree-container`),r=e.querySelector(`#ra-stats`);n.innerHTML=`
    <div class="ra-loading">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span>Cargando ruta académica...</span>
    </div>
  `;try{let e=await Bf(t);if(!e||e.length===0){n.innerHTML=`
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
              <span class="ra-level-name">${v(e.nombre)}</span>
              ${e.objetivo_general?`<span class="ra-level-goal">— ${v(e.objetivo_general)}</span>`:``}
              <span class="ra-level-count">${(e.plan_temas||[]).length} temas</span>
            </div>
            <div class="ra-level-body" style="display:none;">
              ${Gf(e.plan_temas||[])}
            </div>
          </div>
        `).join(``)}
      </div>
    `,n.querySelectorAll(`.ra-level-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.nextElementSibling,n=e.querySelector(`.ra-chevron`),r=t.style.display!==`none`;t.style.display=r?`none`:`block`,n.style.transform=r?`rotate(0deg)`:`rotate(90deg)`})}),n.querySelectorAll(`.ra-tema-header`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.nextElementSibling,n=e.querySelector(`.ra-chevron`),r=t.style.display!==`none`;t.style.display=r?`none`:`block`,n.style.transform=r?`rotate(0deg)`:`rotate(90deg)`})})}catch(e){console.error(`[rutaAcademica] Error loading hierarchy:`,e),n.innerHTML=`
      <div class="ra-placeholder text-danger">
        <i class="bi bi-exclamation-triangle"></i>
        <p>Error al cargar la ruta: ${v(e.message)}</p>
      </div>`}}function Gf(e){return e.map((e,t)=>`
    <div class="ra-tema">
      <div class="ra-tema-header" data-tema-idx="${t}">
        <i class="bi bi-chevron-right ra-chevron"></i>
        <span class="ra-tema-badge">${v(e.tipo||`TEMA`)}</span>
        <span class="ra-tema-name">${v(e.nombre)}</span>
        <span class="ra-tema-count">${(e.plan_objetivos||[]).length} objetivos</span>
      </div>
      <div class="ra-tema-body" style="display:none;">
        ${Kf(e.plan_objetivos||[])}
      </div>
    </div>
  `).join(``)}function Kf(e){return e.map(e=>`
    <div class="ra-objetivo">
      <div class="ra-objetivo-header">
        <i class="bi bi-bullseye ra-obj-icon"></i>
        <span class="ra-obj-name">${v(e.nombre)}</span>
      </div>
      ${qf(e.plan_indicadores||[])}
    </div>
  `).join(``)}function qf(e){return`
    <div class="ra-indicadores">
      ${e.map(e=>`
        <div class="ra-indicador">
          <span class="ra-ind-text">${v(e.descripcion)}</span>
          <span class="ra-ind-calif" style="background:${Hf[e.calificacion]||Hf[0]};">
            ${e.calificacion||0} — ${Vf[e.calificacion]||Vf[0]}
          </span>
        </div>
      `).join(``)}
    </div>
  `}function Jf(){if(document.getElementById(`ra-styles`))return;let e=document.createElement(`style`);e.id=`ra-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function Yf(){f.register(`planificacion`,e=>Yd(e,{viewMode:`maestro`})),f.register(`planificacion-plantillas`,e=>Yd(e,{viewMode:`plantillas`})),f.register(`planificacion-maestros`,e=>Yd(e,{viewMode:`admin`})),f.register(`planificacion-cobertura`,e=>pf(e)),f.register(`planificacion-ruta`,e=>Uf(e))}var Xf={attendance_min_rate:.7,attendance_window_weeks:4,grade_min_avg:6,grade_window_count:3,indicator_min_pass_rate:.5,indicator_window_weeks:4},Zf=class e{constructor(e={}){this.id=e.id||null,this.alumno_id=e.alumno_id||``,this.clase_id=e.clase_id||``,this.maestro_id=e.maestro_id||null,this.fecha_evaluacion=e.fecha_evaluacion||``,this.tipo_evaluacion=e.tipo_evaluacion||e.evaluacion_tipo||``,this.calificacion=e.calificacion!==void 0&&e.calificacion!==null?parseFloat(e.calificacion):null,this.observaciones=e.observaciones||``,this.estado=e.estado||`en_progreso`,this.created_at=e.created_at||null,this.updated_at=e.updated_at||null}validate(){let t=[];this.alumno_id||t.push(`El alumno es obligatorio`),this.clase_id||t.push(`La clase es obligatoria`),!this.tipo_evaluacion||!this.tipo_evaluacion.trim()?t.push(`El tipo de evaluación es obligatorio`):e.getTiposEvaluacion().map(e=>e.value).includes(this.tipo_evaluacion)||t.push(`Tipo de evaluación no válido`),this.calificacion!==null&&this.calificacion!==void 0&&(isNaN(this.calificacion)||this.calificacion<0||this.calificacion>5)&&t.push(`La calificación debe estar entre 0.0 y 5.0`),this.observaciones&&this.observaciones.length>500&&t.push(`Las observaciones no pueden exceder 500 caracteres`);let n=e.getEstados().map(e=>e.value);return this.estado&&!n.includes(this.estado)&&t.push(`Estado no válido`),t}static getTiposEvaluacion(){return[{value:`parcial`,label:`Parcial`},{value:`final`,label:`Final`},{value:`continua`,label:`Continua`},{value:`oral`,label:`Oral`},{value:`escrita`,label:`Escrita`},{value:`practica`,label:`Práctica`}]}static getEstados(){return[{value:`en_progreso`,label:`En Progreso`,color:`bg-primary`},{value:`completado`,label:`Completado`,color:`bg-success`},{value:`pendiente`,label:`Pendiente`,color:`bg-secondary`}]}static getEstadoConfig(e){return this.getEstados().find(t=>t.value===e)||{value:e,label:e,color:`bg-secondary`}}toJSON(){return{alumno_id:this.alumno_id,clase_id:this.clase_id,maestro_id:this.maestro_id,fecha_evaluacion:this.fecha_evaluacion||null,tipo_evaluacion:this.tipo_evaluacion.trim(),calificacion:this.calificacion,observaciones:this.observaciones?this.observaciones.trim():null,estado:this.estado}}};function Qf(e){if(!e||e.length===0)return{promedio:null,total:0,enRiesgo:!1};let t=e.map(e=>e.calificacion).filter(e=>e!=null&&!isNaN(e));if(t.length===0)return{promedio:null,total:e.length,enRiesgo:!1};let n=t.reduce((e,t)=>e+t,0),r=parseFloat((n/t.length).toFixed(2));return{promedio:r,total:e.length,enRiesgo:r<3}}async function $f(e){let t=await de(e),n={};return t.forEach(e=>{n[e.alumno_id]||(n[e.alumno_id]=[]),n[e.alumno_id].push(e)}),Object.entries(n).map(([e,t])=>({alumnoId:e,progresos:t,rendimiento:Qf(t)}))}var ep={calcularRendimiento:Qf,getResumenProgresosClase:$f},W={progresos:[],progresosOriginales:[],alumnos:[],clases:[],cargando:!1,filtroClase:`todas`,container:null};async function tp(e){if(e)try{W.container=e,W.cargando=!0,np(e);let[t,n,r]=await Promise.all([h(),oe(),le()]);W.progresos=(t||[]).map(e=>new Zf(e)),W.progresosOriginales=[...W.progresos],W.alumnos=n||[],W.clases=r||[],W.cargando=!1,ip(e),op(e)}catch(t){console.error(t),rp(e,t.message)}}function np(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function rp(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${v(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>progresos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
        </div>
      </div>
    </div>`}function ip(e){let t=W.progresosOriginales.length,n=W.progresosOriginales.filter(e=>e.calificacion!=null).map(e=>parseFloat(e.calificacion)),r=n.length>0?(n.reduce((e,t)=>e+t,0)/n.length).toFixed(2):null,i={};W.progresosOriginales.forEach(e=>{i[e.alumno_id]||(i[e.alumno_id]=[]),e.calificacion!=null&&i[e.alumno_id].push(parseFloat(e.calificacion))});let a=0;Object.values(i).forEach(e=>{e.length!==0&&e.reduce((e,t)=>e+t,0)/e.length<3&&a++});let o=Object.keys(i).length,s=new Set(W.progresosOriginales.map(e=>e.clase_id)).size;e.innerHTML=`
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
            ${W.clases.map(e=>`<option value="${e.id}" ${e.id===W.filtroClase?`selected`:``}>${v(e.nombre)}</option>`).join(``)}
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
              ${ap()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function ap(){let e=W.container.querySelector(`#buscar-progreso`)?.value.trim().toLowerCase()||``,t=W.filtroClase,n={};W.progresosOriginales.forEach(r=>{let i=W.alumnos.find(e=>e.id===r.alumno_id),a=W.clases.find(e=>e.id===r.clase_id);t!==`todas`&&r.clase_id!==t||e&&!i?.nombre_completo.toLowerCase().includes(e)&&!a?.nombre.toLowerCase().includes(e)||(n[r.alumno_id]||(n[r.alumno_id]={alumno:i,lista:[]}),n[r.alumno_id].lista.push(r))});let r=Object.values(n);return r.length===0?`<tr><td colspan="5" class="text-center py-5 text-muted">No hay resultados.</td></tr>`:r.map(({alumno:e,lista:t})=>{let n=ep.calcularRendimiento(t);return`
      <tr class="border-start-accent ${n.enRiesgo?`border-accent-danger`:`border-accent-success`}">
        <td>
          <div class="fw-bold">${v(e?.nombre_completo||`Desconocido`)}</div>
          <div class="small text-muted">${t.length>0?v(W.clases.find(e=>e.id===t[0].clase_id)?.nombre):``}</div>
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
    `}).join(``)}function op(e){e.querySelector(`#select-clase`)?.addEventListener(`change`,t=>{W.filtroClase=t.target.value,e.querySelector(`#progresos-tbody`).innerHTML=ap()}),e.querySelector(`#buscar-progreso`)?.addEventListener(`input`,()=>{e.querySelector(`#progresos-tbody`).innerHTML=ap()}),e.querySelector(`#progresos-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,alumnoId:r}=t.dataset;n===`pdf`&&sp(r),n===`view-detail`&&cp(r)}),e.querySelector(`#btn-nueva-nota`)?.addEventListener(`click`,()=>lp())}async function sp(e){let t=W.alumnos.find(t=>t.id===e),n=W.progresosOriginales.filter(t=>t.alumno_id===e);c.info(`Generando boletín institucional...`);try{await m(t,n),c.success(`Boletín generado exitosamente`)}catch(e){c.error(`Error al generar PDF: `+e.message)}}function cp(e){let t=W.alumnos.find(t=>t.id===e),n=W.progresosOriginales.filter(t=>t.alumno_id===e),r=ep.calcularRendimiento(n);_.open({title:`Detalle Académico: ${t.nombre_completo}`,size:`lg`,hideSave:!0,body:`
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
                <td class="small text-muted">${v(e.observaciones||`-`)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `})}function lp(){_.open({title:`Registrar Nueva Calificación`,saveText:`Guardar Nota`,body:`
      <form id="form-nota" class="row g-3">
        <div class="col-md-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="nota-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${W.alumnos.map(e=>`<option value="${e.id}">${e.nombre_completo}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Clase *</label>
          <select class="form-select input-dense" id="nota-clase_id" required>
            <option value="">Seleccionar...</option>
            ${W.clases.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo de Evaluación *</label>
          <select class="form-select input-dense" id="nota-tipo" required>
            ${Zf.getTiposEvaluacion().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
    `,onSave:async e=>{let t={alumno_id:e.querySelector(`#nota-alumno_id`).value,clase_id:e.querySelector(`#nota-clase_id`).value,tipo_evaluacion:e.querySelector(`#nota-tipo`).value,calificacion:parseFloat(e.querySelector(`#nota-valor`).value),fecha_evaluacion:e.querySelector(`#nota-fecha`).value,observaciones:e.querySelector(`#nota-obs`).value.trim()},n=new Zf(t).validate();if(n.length>0)return c.error(n[0]),!1;try{return await re(t),c.success(`Nota registrada exitosamente`),tp(W.container),!0}catch(e){return c.error(e.message),!1}}})}function up(){f.register(`progresos`,tp)}function dp(e){return e?Array.isArray(e)?e.map(e=>new st(e)):new st(e):null}async function fp(){let{data:e,error:n}=await t.from(`observaciones_alumnos`).select(`
      *,
      alumno:alumnos(nombre_completo),
      maestro:maestros(nombre_completo)
    `).order(`fecha_observacion`,{ascending:!1});if(n)throw console.error(`Error cargando observaciones:`,n.message),Error(`No se pudieron cargar las observaciones`);return e.map(e=>{let t=new st(e);return t.alumno_nombre=e.alumno?.nombre_completo||`Desconocido`,t.maestro_nombre=e.maestro?.nombre_completo||`N/A`,t})}async function pp(e){let n=new st(e),r=n.validate();if(r.length>0)throw Error(r[0]);let{data:i,error:a}=await t.from(`observaciones_alumnos`).insert([n.toJSON()]).select();if(a)throw a;return dp(i[0])}async function mp(e,n){let{data:r}=await t.from(`observaciones_alumnos`).select(`*`).eq(`id`,e).single(),i=new st({...r,...n}),a=i.validate();if(a.length>0)throw Error(a[0]);let{data:o,error:s}=await t.from(`observaciones_alumnos`).update(i.toJSON()).eq(`id`,e).select();if(s)throw s;return dp(o[0])}async function hp(e){let{error:n}=await t.from(`observaciones_alumnos`).delete().eq(`id`,e);if(n)throw n}async function gp(e,n){let{data:r,error:i}=await t.from(`observaciones_alumnos`).update({seguimiento_observacion:n.trim(),seguimiento_fecha:new Date().toISOString().split(`T`)[0],estado:`seguimiento`,requiere_seguimiento:!0}).eq(`id`,e).select();if(i)throw i;return dp(r[0])}async function _p(){let{data:e,error:n}=await t.from(`observaciones_alumnos`).select(`estado, prioridad, tipo`);if(n)throw n;return{total:e.length,abiertas:e.filter(e=>e.estado===`abierta`).length,seguimiento:e.filter(e=>e.estado===`seguimiento`).length,altas:e.filter(e=>e.prioridad===`alta`).length,porTipo:e.reduce((e,t)=>(e[t.tipo]=(e[t.tipo]||0)+1,e),{})}}function vp(e){return e?e.replace(/[&<>]/g,function(e){return e===`&`?`&amp;`:e===`<`?`&lt;`:e===`>`?`&gt;`:e}):``}var yp=`student_cases`,bp=`student_case_events`,xp=`student_case_alerts`;async function Sp(e,n,r,{descripcion:i=``,metadata:a={},actorId:o=null}={}){await t.from(bp).insert({case_id:e,tipo:n,titulo:r,descripcion:i,metadata:a,actor_id:o})}async function Cp(e={}){let n=t.from(yp).select(`*`).order(`created_at`,{ascending:!1});e.estado&&(n=n.eq(`estado`,e.estado)),e.nivelRiesgo&&(n=n.eq(`nivel_riesgo`,e.nivelRiesgo)),e.tipo&&(n=n.eq(`tipo`,e.tipo)),e.alumnoId&&(n=n.eq(`alumno_id`,e.alumnoId)),e.responsableId&&(n=n.eq(`responsable_id`,e.responsableId)),e.limit&&(n=n.limit(e.limit));let{data:r,error:i}=await n;if(i)throw i;return r||[]}async function wp(e){let{data:n,error:r}=await t.from(yp).select(`*`).eq(`id`,e).single();if(r)throw r;return n}async function Tp(e){let n={...e,estado:e.estado||`abierto`,origen:e.origen||`manual`,nivel_riesgo:e.nivel_riesgo||`bajo`,fecha_apertura:e.fecha_apertura||new Date().toISOString().slice(0,10),updated_at:new Date().toISOString()},{data:r,error:i}=await t.from(yp).insert(n).select().single();if(i)throw i;return await Sp(r.id,`caso_abierto`,`Caso abierto: ${r.titulo}`,{descripcion:`Origen: ${r.origen} · Nivel inicial: ${r.nivel_riesgo}`}),r}async function Ep(e,n={}){let{data:r}=await t.from(xp).select(`*`).eq(`id`,e).single();if(!r)throw Error(`Alert not found`);let i=await Tp({alumno_id:r.alumno_id,alumno_nombre:r.alumno_nombre,tipo:r.tipo===`riesgo_combinado`?`seguimiento_pedagogico`:r.tipo,titulo:n.titulo||r.titulo,descripcion:n.descripcion||r.descripcion,nivel_riesgo:r.nivel_riesgo,origen:`automatico`,resumen_actual:r.descripcion,...n}),{error:a}=await t.from(xp).update({case_id:i.id,estado:`convertida_en_caso`,revisada_en:new Date().toISOString()}).eq(`id`,e);return a&&console.error(`[createCaseFromAlert] alert update failed — alert may be re-used:`,a),await Sp(i.id,`alerta_detectada`,`Caso creado desde alerta`,{metadata:{alert_id:e,evidencia:r.evidencia}}),i}async function Dp(e,n){let{data:r,error:i}=await t.from(yp).update({...n,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}async function Op(e,t,n=``){let r=await Dp(e,{estado:t});return await Sp(e,`estado_actualizado`,`Estado cambiado a: ${t}`,{descripcion:n}),r}async function kp(e,t,n=``){let r=await Dp(e,{nivel_riesgo:t});return await Sp(e,`nivel_riesgo_actualizado`,`Nivel de riesgo cambiado a: ${t}`,{descripcion:n}),r}async function Ap(e,t=``){let n=await Dp(e,{estado:`resuelto`,fecha_cierre:new Date().toISOString().slice(0,10),resumen_actual:t});return await Sp(e,`caso_resuelto`,`Caso resuelto`,{descripcion:t}),n}async function jp(e,t=``){let n=await Dp(e,{estado:`archivado`});return await Sp(e,`caso_archivado`,`Caso archivado`,{descripcion:t}),n}async function Mp(e,t=``){let n=await Dp(e,{estado:`escalado`});return await Sp(e,`caso_escalado`,`Caso escalado a directiva`,{descripcion:t}),n}async function Np(e){let{data:n,error:r}=await t.from(bp).select(`*`).eq(`case_id`,e).order(`created_at`,{ascending:!1});if(r)throw r;return n||[]}async function Pp(e={}){let n=t.from(xp).select(`*`).order(`detectada_en`,{ascending:!1});e.estado&&(n=n.eq(`estado`,e.estado)),e.nivelRiesgo&&(n=n.eq(`nivel_riesgo`,e.nivelRiesgo)),e.limit&&(n=n.limit(e.limit));let{data:r,error:i}=await n;if(i)throw i;return r||[]}async function Fp(e,n=null){await t.from(xp).update({estado:`revisada`,revisada_por:n,revisada_en:new Date().toISOString()}).eq(`id`,e)}async function Ip(e){await t.from(xp).update({estado:`descartada`,revisada_en:new Date().toISOString()}).eq(`id`,e)}async function Lp(){let[e,n,r,i]=await Promise.all([t.from(yp).select(`id`,{count:`exact`,head:!0}).eq(`estado`,`abierto`),t.from(yp).select(`id`,{count:`exact`,head:!0}).eq(`estado`,`en_seguimiento`),t.from(yp).select(`id`,{count:`exact`,head:!0}).eq(`nivel_riesgo`,`critico`).in(`estado`,[`abierto`,`en_seguimiento`]),t.from(xp).select(`id`,{count:`exact`,head:!0}).eq(`estado`,`pendiente`)]),a=new Date().toISOString().slice(0,10),o=await t.from(yp).select(`id`,{count:`exact`,head:!0}).in(`estado`,[`abierto`,`en_seguimiento`]).lt(`proxima_accion_fecha`,a),[s,c]=(()=>{let e=new Date;return[new Date(e.getFullYear(),e.getMonth(),1).toISOString(),new Date(e.getFullYear(),e.getMonth()+1,0,23,59,59,999).toISOString()]})(),l=await t.from(`student_case_actions`).select(`id`,{count:`exact`,head:!0}).eq(`tipo`,`carta_generada`).gte(`created_at`,s).lte(`created_at`,c);return{casosAbiertos:e.count||0,casosEnSeguimiento:n.count||0,casosCriticos:r.count||0,alertasPendientes:i.count||0,proximasAccionesVencidas:o.count||0,cartasEsteMes:l.count||0}}var G={observaciones:[],observacionesOriginales:[],alumnos:[],estadisticas:null,cargando:!1,filtroTipo:``,filtroEstado:`todos`,container:null};async function Rp(e){if(e)try{G.container=e,G.cargando=!0,zp(e);let[t,n,r]=await Promise.all([fp(),Re().catch(()=>[]),_p().catch(()=>null)]);G.observaciones=t,G.observacionesOriginales=[...t],G.alumnos=n,G.estadisticas=r,G.cargando=!1,Vp(e),Wp(e)}catch(t){console.error(t),Bp(e,t.message)}}function zp(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center" style="min-height: 400px;"><div class="spinner-border text-primary" role="status"></div></div>`}function Bp(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3 m-0" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Tabla no encontrada o sin acceso</h5>
          <p class="mb-2 small">${vp(t)}</p>
          <p class="mb-0 small text-muted">Verificá que la tabla <code>observaciones_alumnos</code> existe en Supabase y que las políticas RLS permiten la lectura.</p>
          <button class="btn btn-outline-warning btn-sm mt-3" id="retry-btn">
            <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
          </button>
        </div>
      </div>
    </div>`,e.querySelector(`#retry-btn`)?.addEventListener(`click`,()=>Rp(e))}function Vp(e){e.innerHTML=`
    <div class="page-container">
      <div class="observaciones-header-premium mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-clipboard2-pulse fs-4"></i>
          </div>
          <div>
            <h1 class="observaciones-title-premium page-title mb-0">Observaciones</h1>
            <p class="text-muted small mb-0">${G.observaciones.length} observaciones en total</p>
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
            <div class="stat-value">${G.estadisticas?.abiertas||0}</div>
          </div>
          <div class="stat-card stat-justified border-start border-4 border-warning">
            <div class="stat-label">Seguimiento</div>
            <div class="stat-value">${G.estadisticas?.seguimiento||0}</div>
          </div>
          <div class="stat-card stat-absent border-start border-4 border-danger">
            <div class="stat-label">Alta Prioridad</div>
            <div class="stat-value">${G.estadisticas?.altas||0}</div>
          </div>
          <div class="stat-card stat-present border-start border-4 border-success">
            <div class="stat-label">Total</div>
            <div class="stat-value">${G.estadisticas?.total||0}</div>
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
            ${st.getTipos().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
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
              ${Hp(G.observaciones)}
            </tbody>
          </table>
        </div>
        <div id="empty-container">${G.observaciones.length===0?Up():``}</div>
      </div>
    </div>
  `}function Hp(e){return e.map(e=>{let t=st.getTipos().find(t=>t.value===e.tipo),n=st.getPrioridades().find(t=>t.value===e.prioridad),r=st.getEstados().find(t=>t.value===e.estado),i=e.prioridad===`alta`?`border-accent-danger`:e.prioridad===`media`?`border-accent-warning`:`border-accent-secondary`;return`
      <tr data-id="${e.id}" class="border-start-accent ${i}">
        <td>
          <div class="fw-bold text-truncate" style="max-width: 250px;">${vp(e.titulo)}</div>
          <div class="small text-muted">${vp(e.alumno_nombre)}</div>
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
            ${e.requiere_seguimiento?`
              <button class="btn btn-sm btn-outline-success btn-icon-compact" data-action="create-case" data-id="${e.id}" title="Crear caso institucional">
                <i class="bi bi-folder-plus"></i>
              </button>`:``}
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
    `}).join(``)}function Up(){return`<div class="text-center py-5 text-muted"><i class="bi bi-chat-left-dots fs-1 d-block mb-2"></i>No se encontraron observaciones.</div>`}function Wp(e){e.querySelector(`#buscar-obs`)?.addEventListener(`input`,Gp),e.querySelector(`#select-tipo`)?.addEventListener(`change`,Gp),e.querySelector(`#obs-tbody`)?.addEventListener(`click`,e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,id:r}=t.dataset;n===`edit`&&Kp(r),n===`delete`&&Jp(r),n===`follow`&&qp(r),n===`create-case`&&Yp(r)}),e.querySelector(`#btn-nueva-obs`)?.addEventListener(`click`,()=>Kp(null))}function Gp(){let e=G.container.querySelector(`#buscar-obs`).value.toLowerCase(),t=G.container.querySelector(`#select-tipo`).value;G.observaciones=G.observacionesOriginales.filter(n=>{let r=n.titulo.toLowerCase().includes(e)||n.alumno_nombre.toLowerCase().includes(e),i=!t||n.tipo===t;return r&&i}),G.container.querySelector(`#obs-tbody`).innerHTML=Hp(G.observaciones)}async function Kp(e){let t=e?G.observacionesOriginales.find(t=>t.id===e):new st;_.open({title:e?`Editar Observación`:`Nueva Observación`,saveText:`Guardar`,body:`
      <form id="form-obs" class="row g-3">
        <div class="col-12">
          <label class="form-label-compact">Alumno *</label>
          <select class="form-select input-dense" id="obs-alumno_id" required>
            <option value="">Seleccionar alumno...</option>
            ${G.alumnos.map(e=>`<option value="${e.id}" ${e.id===t.alumno_id?`selected`:``}>${vp(e.nombre_completo)}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-8">
          <label class="form-label-compact">Título de la Incidencia *</label>
          <input type="text" class="form-control input-dense" id="obs-titulo" value="${vp(t.titulo)}" required>
        </div>
        <div class="col-md-4">
          <label class="form-label-compact">Prioridad</label>
          <select class="form-select input-dense" id="obs-prioridad">
            ${st.getPrioridades().map(e=>`<option value="${e.value}" ${e.value===t.prioridad?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Tipo</label>
          <select class="form-select input-dense" id="obs-tipo">
            ${st.getTipos().map(e=>`<option value="${e.value}" ${e.value===t.tipo?`selected`:``}>${e.label}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label-compact">Fecha</label>
          <input type="date" class="form-control input-dense" id="obs-fecha" value="${t.fecha_observacion||new Date().toISOString().split(`T`)[0]}">
        </div>
        <div class="col-12">
          <label class="form-label-compact">Descripción Detallada *</label>
          <textarea class="form-control input-dense" id="obs-descripcion" rows="4" required>${vp(t.descripcion)}</textarea>
        </div>
      </form>
    `,onSave:async t=>{let n={alumno_id:t.querySelector(`#obs-alumno_id`).value,titulo:t.querySelector(`#obs-titulo`).value.trim(),prioridad:t.querySelector(`#obs-prioridad`).value,tipo:t.querySelector(`#obs-tipo`).value,fecha_observacion:t.querySelector(`#obs-fecha`).value,descripcion:t.querySelector(`#obs-descripcion`).value.trim()},r=new st(n).validate();if(r.length>0)return c.error(r[0]),!1;try{return e?(await mp(e,n),c.success(`Observación actualizada`)):(await pp(n),c.success(`Observación registrada`)),Rp(G.container),!0}catch(e){return c.error(e.message),!1}}})}function qp(e){let t=G.observacionesOriginales.find(t=>t.id===e);_.open({title:`Añadir Seguimiento`,saveText:`Guardar Seguimiento`,body:`
      <p class="small text-muted mb-3">Estás añadiendo una nota de seguimiento a: <strong>${vp(t.titulo)}</strong></p>
      <div class="mb-3">
        <label class="form-label-compact">Nota de seguimiento</label>
        <textarea class="form-control input-dense" id="follow-obs" rows="4" placeholder="Describe las acciones tomadas..."></textarea>
      </div>
    `,onSave:async t=>{let n=t.querySelector(`#follow-obs`).value.trim();if(!n)return c.error(`La nota es obligatoria`),!1;try{return await gp(e,n),c.success(`Seguimiento registrado`),Rp(G.container),!0}catch(e){return c.error(e.message),!1}}})}function Jp(e){let t=G.observacionesOriginales.find(t=>t.id===e);_.open({title:`⚠️ Eliminar Observación`,saveText:`Eliminar`,body:`<p>¿Estás seguro de eliminar "${vp(t.titulo)}"?</p>`,onSave:async()=>(await hp(e),Rp(G.container),!0)})}async function Yp(e){let t=G.observacionesOriginales.find(t=>t.id===e);t&&_.open({title:`Crear caso institucional desde observación`,size:`lg`,saveText:`Crear caso`,body:`
      <div class="small">
        <div class="alert alert-info py-2 mb-3">
          <i class="bi bi-info-circle me-1"></i>
          Se creará un caso institucional asociado al alumno <strong>${vp(t.alumno_nombre)}</strong> usando esta observación como base.
        </div>
        <div class="row g-2">
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Tipo de caso</label>
            <select class="form-select form-select-sm" id="oc-tipo">
              <option value="seguimiento_pedagogico" selected>Seguimiento pedagógico</option>
              <option value="conducta">Conducta</option>
              <option value="situacion_familiar">Situación familiar</option>
              <option value="compromiso">Compromiso</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Nivel de riesgo inicial</label>
            <select class="form-select form-select-sm" id="oc-riesgo">
              <option value="bajo"   ${t.prioridad!==`alta`&&t.prioridad!==`urgente`?`selected`:``}>Bajo</option>
              <option value="medio"  ${t.prioridad===`alta`?`selected`:``}>Medio</option>
              <option value="alto"   ${t.prioridad===`urgente`?`selected`:``}>Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label fw-semibold">Título *</label>
            <input type="text" class="form-control form-control-sm" id="oc-titulo" value="${vp(t.titulo||`Seguimiento de observación`)}" required maxlength="160">
          </div>
          <div class="col-12">
            <label class="form-label fw-semibold">Descripción</label>
            <textarea class="form-control form-control-sm" id="oc-descripcion" rows="3">${vp(t.observacion||t.descripcion||``)}</textarea>
          </div>
        </div>
      </div>
    `,onSave:async()=>{let e=document.querySelector(`#oc-tipo`)?.value,n=document.querySelector(`#oc-riesgo`)?.value,r=document.querySelector(`#oc-titulo`)?.value?.trim(),i=document.querySelector(`#oc-descripcion`)?.value?.trim()||null;if(!r)return c.error(`Ingresá un título.`),!1;try{let a=await Tp({alumno_id:t.alumno_id,alumno_nombre:t.alumno_nombre,tipo:e,titulo:r,descripcion:i,nivel_riesgo:n,origen:`observacion_maestro`,resumen_actual:`Caso creado desde observación: ${t.titulo}`});return c.success(`Caso creado correctamente.`),f.navigate(`pedagogico-caso?id=${a.id}`),!0}catch(e){return c.error(`Error: ${e.message}`),!1}}})}function Xp(){f.register(`observaciones`,Rp)}var Zp=e({getAlertasActivas:()=>nm,getAlertasRojas:()=>rm,getAlumnosDestacados:()=>dm,getAlumnosEnRiesgoAcademico:()=>fm,getAlumnosEnRiesgoAlto:()=>tm,getCorrelacionAsistenciaRendimiento:()=>hm,getDestacadosYRiesgoAcademico:()=>um,getEstadisticasPeriodoActivo:()=>lm,getEstadisticasPeriodos:()=>cm,getHistorialEstadoAlumno:()=>gm,getPatronAsistencia:()=>sm,getRachaAusencias:()=>pm,getRendimientoMaestro:()=>om,getRendimientoMaestros:()=>am,getResumenAlertas:()=>im,getResumenAlumno:()=>$p,getResumenAlumnos:()=>Qp,getRiesgoAbandono:()=>em,getTasaAsistenciaPeriodo:()=>mm,registrarCambioEstadoAlumno:()=>_m});async function Qp(){let{data:e,error:n}=await t.from(`vw_resumen_alumno`).select(`*`).order(`nombre_completo`);if(n)throw Error(`No se pudo cargar el resumen de alumnos`);return e}async function $p(e){let{data:n,error:r}=await t.from(`vw_resumen_alumno`).select(`*`).eq(`id`,e).single();if(r)throw Error(`No se pudo cargar el resumen del alumno`);return n}async function em({nivel:e=null}={}){let n=t.from(`vw_riesgo_abandono`).select(`*`).order(`score_riesgo`,{ascending:!1});e&&(n=n.eq(`nivel_riesgo`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el análisis de riesgo`);return r}async function tm(){return em({nivel:`alto`})}async function nm({color:e=null,alumnoId:n=null}={}){let r=t.from(`vw_alertas_activas`).select(`*`).order(`fecha_referencia`,{ascending:!0});e&&(r=r.eq(`color`,e)),n&&(r=r.eq(`alumno_id`,n));let{data:i,error:a}=await r;if(a)throw Error(`No se pudieron cargar las alertas`);return i}async function rm(){return nm({color:`rojo`})}async function im(){let{data:e,error:n}=await t.from(`vw_alertas_activas`).select(`color, tipo_alerta`);if(n)throw Error(`No se pudo obtener el resumen de alertas`);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length,porTipo:e.reduce((e,t)=>(e[t.tipo_alerta]=(e[t.tipo_alerta]||0)+1,e),{})}}async function am(){let{data:e,error:n}=await t.from(`vw_rendimiento_maestro`).select(`*`);if(n)throw Error(`No se pudo cargar el rendimiento de maestros`);return e}async function om(e){let{data:n,error:r}=await t.from(`vw_rendimiento_maestro`).select(`*`).eq(`maestro_id`,e).single();if(r)throw Error(`No se pudo cargar el rendimiento del maestro`);return n}async function sm({instrumento:e=null}={}){let n=t.from(`vw_patron_asistencia`).select(`*`).order(`dia_semana_num`);e&&(n=n.eq(`instrumento_principal`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el patrón de asistencia`);return r}async function cm(){let{data:e,error:n}=await t.from(`vw_estadisticas_periodo`).select(`*`);if(n)throw Error(`No se pudieron cargar las estadísticas por período`);return e}async function lm(){let{data:e,error:n}=await t.from(`vw_estadisticas_periodo`).select(`*`).eq(`activo`,!0).order(`fecha_inicio`,{ascending:!1}).limit(1);if(n)throw Error(`No se pudieron cargar las estadísticas del período activo: `+n.message);return e&&e.length>0?e[0]:null}async function um({categoria:e=null}={}){let n=t.from(`vw_destacados_y_riesgo_academico`).select(`*`);e&&(n=n.eq(`categoria`,e));let{data:r,error:i}=await n;if(i)throw Error(`No se pudo cargar el análisis académico`);return r}async function dm(){return um({categoria:`destacado`})}async function fm(){return um({categoria:`riesgo_academico`})}async function pm(e){let{data:n,error:r}=await t.rpc(`fn_racha_ausencias`,{p_alumno_id:e});if(r)throw Error(`No se pudo calcular la racha de ausencias`);return n}async function mm(e,n,r=null){let i={p_alumno_id:e,p_desde:n};r&&(i.p_hasta=r);let{data:a,error:o}=await t.rpc(`fn_tasa_asistencia_periodo`,i);if(o)throw Error(`No se pudo calcular la tasa de asistencia`);return a}async function hm(){let{data:e,error:n}=await t.rpc(`fn_correlacion_asistencia_rendimiento`);if(n)throw Error(`No se pudo calcular la correlación`);return e}async function gm(e){let{data:n,error:r}=await t.from(`historial_estado_alumno`).select(`*`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1});if(r)throw Error(`No se pudo cargar el historial`);return n}async function _m(e,n,r,i=null){if(![`activo`,`baja_voluntaria`,`baja_academica`,`suspendido`,`egresado`].includes(n))throw Error(`Estado no válido`);let{data:a,error:o}=await t.from(`historial_estado_alumno`).insert([{alumno_id:e,estado:n,motivo:r?.trim()||null,registrado_por:i||null,fecha:new Date().toISOString().split(`T`)[0]}]).select();if(o)throw Error(`No se pudo registrar el cambio de estado`);return a[0]}async function vm(e){let t={"/assets/data/mocks/alumnos.json":()=>d(()=>import(`./alumnos-D7LnSF97.js`).then(e=>e.n),__vite__mapDeps([11,4])),"/assets/data/mocks/clases.json":()=>d(()=>import(`./clases-CdwqU54c.js`).then(e=>e.n),__vite__mapDeps([9,4])),"/assets/data/mocks/sesiones.json":()=>d(()=>import(`./sesiones-DCxZQJi9.js`).then(e=>e.n),__vite__mapDeps([12,4])),"/assets/data/mocks/maestro_tareas.json":()=>d(()=>import(`./maestro_tareas-B_lydg9V.js`),[]),"/assets/data/mocks/metricas_periodo.json":()=>d(()=>import(`./metricas_periodo-IzJH5KrL.js`),[]),"/assets/data/mocks/alertas_config.json":()=>d(()=>import(`./alertas_config-CitdWImP.js`),[]),"/assets/data/mocks/objetivos_gamificacion.json":()=>d(()=>import(`./objetivos_gamificacion-B_EvWqlJ.js`),[]),"/assets/data/mocks/ausencias.json":()=>d(()=>import(`./ausencias-DQd_BiC9.js`),[]),"/assets/data/mocks/planificacion-curricular.json":()=>d(()=>import(`./planificacion-curricular-DD7_kKWW.js`),[])}[e];if(t){let e=await t();return e.default||e}return console.warn(`loadJsonMock: ruta no mapeada: ${e}`),null}var ym=e({getAlertasActivas:()=>Om,getAlertasConfig:()=>Em,getAlumnosDestacados:()=>Nm,getEstadisticasPeriodo:()=>Cm,getEstadisticasPeriodoActivo:()=>wm,getHistorialEstadoAlumno:()=>Am,getRachaAusencias:()=>jm,getResumenAlertas:()=>km,getResumenAlumno:()=>Sm,getResumenAlumnos:()=>xm,getRiesgoAbandono:()=>Mm,getTasaAsistenciaPeriodo:()=>Tm,updateAlertaConfig:()=>Dm}),bm=`/assets/data/mocks/metricas_periodo.json`;async function xm(){return(await vm(bm)).estadisticas_periodo[0]?.total_alumnos||0}async function Sm(e){return null}async function Cm(){return(await vm(bm)).configuraciones}async function wm(){let e=await vm(bm),t=e.configuraciones.find(e=>e.activo),n=e.estadisticas_periodo.find(e=>e.periodo_id===t?.id);return t?{...t,...n}:null}async function Tm(e,t,n=null){return 87.5}async function Em(){return await vm(`/assets/data/mocks/alertas_config.json`)}async function Dm(e,t){return console.log(`Mock: updateAlertaConfig`,e,t),{id:e,...t}}async function Om(e={}){return(await vm(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo)}async function km(){let e=(await vm(`/assets/data/mocks/alertas_config.json`)).alertas.filter(e=>e.activo);return{total:e.length,rojas:e.filter(e=>e.color===`rojo`).length,naranjas:e.filter(e=>e.color===`naranja`).length,amarillas:e.filter(e=>e.color===`amarillo`).length}}async function Am(e){return[]}async function jm(e){return 0}async function Mm({nivel:e=null}={}){let t=[{nombre_completo:`Mateo Fernández`,score_riesgo:88,nivel_riesgo:`alto`},{nombre_completo:`Lucía Benítez`,score_riesgo:65,nivel_riesgo:`medio`},{nombre_completo:`Santiago Morales`,score_riesgo:35,nivel_riesgo:`bajo`}];return e?t.filter(t=>t.nivel_riesgo===e):t}async function Nm(){return[{nombre_completo:`Valeria Russo`,promedio:9.85,programa:`Violín Cátedra`},{nombre_completo:`Thiago Silva`,promedio:9.72,programa:`Violín Inicial`},{nombre_completo:`Delfina Lombardi`,promedio:9.6,programa:`Violín Cátedra`}]}var Pm=()=>p.isDemoMode?ym:Zp,Fm=(...e)=>Pm().getEstadisticasPeriodoActivo(...e),Im=(...e)=>Pm().getTasaAsistenciaPeriodo(...e),Lm=(...e)=>Pm().getAlertasActivas(...e),Rm=(...e)=>Pm().getResumenAlertas(...e),zm=(...e)=>Pm().getAlumnosDestacados(...e),Bm=e({callDslRpc:()=>Km,getAuditLogs:()=>Wm,getOperaciones:()=>Gm,getSystemLogs:()=>Hm,recordSystemLog:()=>Um}),Vm=`soi_system_logs`;async function Hm(){try{let e=localStorage.getItem(Vm),t=e?JSON.parse(e):[];if(t.length===0){let e={timestamp:new Date().toISOString(),level:`INFO`,module:`PWA`,message:`System logs initialized. Tracking core activities.`,network:navigator.onLine?`Online`:`Offline`};t.push(e),localStorage.setItem(Vm,JSON.stringify(t))}return t}catch(e){return console.error(`Error al leer los logs del sistema local:`,e),[]}}async function Um(e){try{let t=await Hm(),n={timestamp:new Date().toISOString(),level:e.level||`INFO`,module:e.module||`Client`,message:e.message||`Sin mensaje de error especificado`,network:navigator.onLine?`Online`:`Offline`,stack:e.stack||``};return t.unshift(n),t.length>100&&t.pop(),localStorage.setItem(Vm,JSON.stringify(t)),n}catch(e){console.error(`Error al registrar log de sistema:`,e)}}async function Wm(){try{let{data:e,error:n}=await t.from(`ausencias_auditoria`).select(`*`).order(`created_at`,{ascending:!1});if(n)throw await Um({level:`ERROR`,module:`SupabaseClient`,message:`Falla al consultar ausencias_auditoria (RLS o Permisos): ${n.message}`}),n;return(e||[]).map(e=>({id:e.id,ausencia_id:e.ausencia_id,actor_id:e.actor_id,usuario_id:e.actor_id,creado_a:e.created_at,created_at:e.created_at,accion:e.accion,notas:e.notas,detalles:e.notas?{notas:e.notas}:{}}))}catch(e){return console.warn(`Excepción de RLS controlada con éxito en getAuditLogs:`,e.message||e),await Um({level:`WARNING`,module:`ObservabilidadAPI`,message:`Audit logs no disponibles (RLS o Red caída). Retornando lista vacía resiliente.`}),[]}}async function Gm(){try{let{data:e,error:n}=await t.from(`operaciones_sistema`).select(`*`).order(`created_at`,{ascending:!1}).limit(50);return n?(await Um({level:`WARNING`,module:`ObservabilidadAPI`,message:`Error al consultar operaciones_sistema: ${n.message}`}),[]):(e||[]).map(e=>({id:e.id,tipo:e.tipo,descripcion:e.descripcion,estado:e.estado,timestamp:e.created_at||e.timestamp,detalles:e.detalles||{}}))}catch(e){return console.warn(`Error al obtener operaciones del sistema:`,e.message||e),await Um({level:`WARNING`,module:`ObservabilidadAPI`,message:`Operaciones del sistema no disponibles. Retornando lista vacía.`}),[]}}async function Km(){let e=async(e,t)=>{try{let{data:n,error:r}=await e;return r?(await Um({level:`WARNING`,module:`ObservabilidadAPI`,message:`Fuente DSL no disponible (${t}): ${r.message}`}),[]):n||[]}catch(e){return console.warn(`callDslRpc: ${t} no disponible:`,e.message||e),[]}},[n,r,i]=await Promise.all([e(t.from(`view_institutional_radar`).select(`*`),`view_institutional_radar`),e(t.from(`view_node_difficulty`).select(`*`).order(`failure_percentage`,{ascending:!1}),`view_node_difficulty`),e(t.from(`vw_rendimiento_maestro`).select(`*`),`vw_rendimiento_maestro`)]);return{radarData:n,nodeDifficulty:r,complianceData:i}}var qm=e({callDslRpc:()=>th,getAuditLogs:()=>Qm,getOperaciones:()=>eh,getSystemLogs:()=>Zm,recordSystemLog:()=>$m}),Jm=[{timestamp:new Date(Date.now()-36e5*48).toISOString(),level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 12ms, LCP: 950ms, CLS: 0.01.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*36).toISOString(),level:`INFO`,module:`SyncManager`,message:`Network online detected. Synchronizing queue of 3 records.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*24).toISOString(),level:`INFO`,module:`ServiceWorker`,message:`SW cached all static assets successfully. Version 2.1.0.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*18).toISOString(),level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 11ms (Excelente), LCP: 980ms (Excelente), CLS: 0.012 (Excelente).`,network:`Online`},{timestamp:new Date(Date.now()-36e5*12).toISOString(),level:`INFO`,module:`AuthModule`,message:`User session validated successfully. Token refreshed.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*6).toISOString(),level:`INFO`,module:`IndexedDB`,message:`Offline store initialized with 12 pending records.`,network:`Offline`},{timestamp:new Date(Date.now()-36e5*1).toISOString(),level:`INFO`,module:`SyncManager`,message:`Background sync completed: 8 records pushed to server.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*30).toISOString(),level:`WARNING`,module:`SyncManager`,message:`Network offline detected. Queuing 3 pending academic attendance records locally.`,network:`Offline`},{timestamp:new Date(Date.now()-36e5*20).toISOString(),level:`WARNING`,module:`HTTPClient`,message:`Request timed out for endpoint /rpc/get_institutional_radar. Falling back to offline fallback state.`,stack:`TimeoutException: Request took longer than 5000ms`,network:`Online`},{timestamp:new Date(Date.now()-36e5*10).toISOString(),level:`WARNING`,module:`SupabaseClient`,message:`Rate limit approaching: 85/100 requests in current window.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*3).toISOString(),level:`WARNING`,module:`CacheAPI`,message:`Cache storage nearly full (42MB / 50MB). Consider clearing old entries.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*48).toISOString(),level:`ERROR`,module:`SupabaseClient`,message:`Failed to query public.ausencias_auditoria due to temporary connection timeout.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*24).toISOString(),level:`ERROR`,module:`AuthModule`,message:`Policy check violation for non-admin user trying to access logs. Terminating session gracefully.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*8).toISOString(),level:`ERROR`,module:`SyncManager`,message:`Failed to push 2 attendance records: 409 Conflict — record already exists.`,network:`Online`},{timestamp:new Date(Date.now()-36e5*2).toISOString(),level:`ERROR`,module:`ServiceWorker`,message:`Unhandled promise rejection: TypeError: Failed to fetch dynamically imported module.`,stack:`TypeError: Failed to fetch
  at HTMLScriptElement.onerror (serviceWorker.js:42)`,network:`Online`},{timestamp:new Date(Date.now()-36e5*.5).toISOString(),level:`ERROR`,module:`IndexedDB`,message:`Transaction aborted: QuotaExceededError when attempting to store log batch.`,network:`Online`}],Ym=[{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a22`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a33`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`APROBACION_FINAL`,notas:`Ausencia aprobada automáticamente por cumplimiento de documentos adjuntos.`,creado_a:new Date(Date.now()-36e5*24*30).toISOString(),created_at:new Date(Date.now()-36e5*24*30).toISOString(),detalles:{motivo:`Médico`,maestro:`Carlos Gómez`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a23`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`CREACION`,notas:`Registro inicial de solicitud de ausencia por comisión de servicios.`,creado_a:new Date(Date.now()-36e5*24*28).toISOString(),created_at:new Date(Date.now()-36e5*24*28).toISOString(),detalles:{motivo:`Capacitación externa`,maestro:`María Luz`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a24`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`RECHAZO`,notas:`Rechazada por falta de justificativo médico oficial impreso.`,creado_a:new Date(Date.now()-36e5*24*25).toISOString(),created_at:new Date(Date.now()-36e5*24*25).toISOString(),detalles:{motivo:`Asuntos personales`,maestro:`Pedro Almonte`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a25`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a35`,usuario_id:`maestro.violin@gentleai.com`,usuario_nombre:`Lucía Mendoza`,accion:`ausencia_creada`,notas:`Solicitud de ausencia por participación en festival regional de cuerdas.`,creado_a:new Date(Date.now()-36e5*24*22).toISOString(),created_at:new Date(Date.now()-36e5*24*22).toISOString(),detalles:{motivo:`Comisión oficial`,maestro:`Lucía Mendoza`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a26`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a36`,usuario_id:`maestro.piano@gentleai.com`,usuario_nombre:`Roberto Díaz`,accion:`ausencia_creada`,notas:`Incapacidad médica por laringitis diagnosticada.`,creado_a:new Date(Date.now()-36e5*24*20).toISOString(),created_at:new Date(Date.now()-36e5*24*20).toISOString(),detalles:{motivo:`Médico`,maestro:`Roberto Díaz`,duracion:`5 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a27`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a37`,usuario_id:`maestro.percusion@gentleai.com`,usuario_nombre:`Ana Martínez`,accion:`ausencia_creada`,notas:`Solicitud por duelo familiar (fallecimiento de familiar directo).`,creado_a:new Date(Date.now()-36e5*24*18).toISOString(),created_at:new Date(Date.now()-36e5*24*18).toISOString(),detalles:{motivo:`Duelo`,maestro:`Ana Martínez`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a28`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a38`,usuario_id:`maestro.cuerdas@gentleai.com`,usuario_nombre:`Pedro Castillo`,accion:`ausencia_creada`,notas:`Ausencia por capacitación pedagógica en el extranjero.`,creado_a:new Date(Date.now()-36e5*24*15).toISOString(),created_at:new Date(Date.now()-36e5*24*15).toISOString(),detalles:{motivo:`Capacitación`,maestro:`Pedro Castillo`,duracion:`7 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a29`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a39`,usuario_id:`maestro.vientos@gentleai.com`,usuario_nombre:`Carmen Rivas`,accion:`ausencia_creada`,notas:`Solicitud por emergencia familiar de último momento.`,creado_a:new Date(Date.now()-36e5*24*12).toISOString(),created_at:new Date(Date.now()-36e5*24*12).toISOString(),detalles:{motivo:`Emergencia familiar`,maestro:`Carmen Rivas`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a30`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a40`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: pendiente → aprobada. Documentación completa.`,creado_a:new Date(Date.now()-36e5*24*10).toISOString(),created_at:new Date(Date.now()-36e5*24*10).toISOString(),detalles:{estado_anterior:`pendiente`,estado_nuevo:`aprobada`,motivo_cambio:`Documentación completa`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a31`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a41`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`estado_modificado`,notas:`Cambio de estado: aprobada → rechazada. Se detectó inconsistencia en fechas.`,creado_a:new Date(Date.now()-36e5*24*8).toISOString(),created_at:new Date(Date.now()-36e5*24*8).toISOString(),detalles:{estado_anterior:`aprobada`,estado_nuevo:`rechazada`,motivo_cambio:`Inconsistencia en fechas`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a32`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a42`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`estado_modificado`,notas:`Cambio de estado: pendiente → en_revision. Se solicitaron documentos adicionales.`,creado_a:new Date(Date.now()-36e5*24*6).toISOString(),created_at:new Date(Date.now()-36e5*24*6).toISOString(),detalles:{estado_anterior:`pendiente`,estado_nuevo:`en_revision`,motivo_cambio:`Documentos adicionales requeridos`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a33`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a43`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: en_revision → aprobada. Todo en orden.`,creado_a:new Date(Date.now()-36e5*24*5).toISOString(),created_at:new Date(Date.now()-36e5*24*5).toISOString(),detalles:{estado_anterior:`en_revision`,estado_nuevo:`aprobada`,motivo_cambio:`Documentación verificada`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a34`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a44`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`estado_modificado`,notas:`Cambio de estado: aprobada → cancelada. El maestro solicitó cancelación.`,creado_a:new Date(Date.now()-36e5*24*3).toISOString(),created_at:new Date(Date.now()-36e5*24*3).toISOString(),detalles:{estado_anterior:`aprobada`,estado_nuevo:`cancelada`,motivo_cambio:`Solicitud del maestro`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a35`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a45`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso especial aprobado para asistir a congreso de educación musical.`,creado_a:new Date(Date.now()-36e5*24*21).toISOString(),created_at:new Date(Date.now()-36e5*24*21).toISOString(),detalles:{tipo_permiso:`Congreso`,maestro:`Santiago Ortiz`,duracion:`3 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a36`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a46`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`permiso_aprobado`,notas:`Permiso por medio día para trámite personal urgente.`,creado_a:new Date(Date.now()-36e5*24*17).toISOString(),created_at:new Date(Date.now()-36e5*24*17).toISOString(),detalles:{tipo_permiso:`Personal`,maestro:`Valentina Suárez`,duracion:`0.5 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a37`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a47`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso sindical aprobado según convenio colectivo.`,creado_a:new Date(Date.now()-36e5*24*14).toISOString(),created_at:new Date(Date.now()-36e5*24*14).toISOString(),detalles:{tipo_permiso:`Sindical`,maestro:`Ricardo Peña`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a38`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a48`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`permiso_aprobado`,notas:`Permiso académico aprobado para rendir examen de posgrado.`,creado_a:new Date(Date.now()-36e5*24*9).toISOString(),created_at:new Date(Date.now()-36e5*24*9).toISOString(),detalles:{tipo_permiso:`Académico`,maestro:`Daniela Ríos`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a39`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a49`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso especial aprobado para donación de sangre (beneficio institucional).`,creado_a:new Date(Date.now()-36e5*24*4).toISOString(),created_at:new Date(Date.now()-36e5*24*4).toISOString(),detalles:{tipo_permiso:`Beneficio institucional`,maestro:`Fernando Mora`,duracion:`1 día`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a40`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a50`,usuario_id:`maestro.vientos@gentleai.com`,usuario_nombre:`Miguel Ángel`,accion:`ausencia_creada`,notas:`Solicitud por enfermedad repentina. Adjunta certificado médico.`,creado_a:new Date(Date.now()-36e5*24*2).toISOString(),created_at:new Date(Date.now()-36e5*24*2).toISOString(),detalles:{motivo:`Enfermedad`,maestro:`Miguel Ángel`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a41`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a51`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`APROBACION_FINAL`,notas:`Aprobación final de ausencia por maternidad. Sustitución asignada.`,creado_a:new Date(Date.now()-36e5*24*1).toISOString(),created_at:new Date(Date.now()-36e5*24*1).toISOString(),detalles:{motivo:`Maternidad`,maestro:`Gabriela Torres`,duracion:`90 días`,sustituto:`María Fernández`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a42`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a52`,usuario_id:`coordinador@gentleai.com`,usuario_nombre:`Sofía Coordinadora`,accion:`CREACION`,notas:`Registro de ausencia preventiva por brote de gripe en el aula.`,creado_a:new Date(Date.now()-36e5*12).toISOString(),created_at:new Date(Date.now()-36e5*12).toISOString(),detalles:{motivo:`Preventivo`,maestro:`Varios`,duracion:`2 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a43`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a53`,usuario_id:`director@gentleai.com`,usuario_nombre:`Juan Director`,accion:`RECHAZO`,notas:`Rechazada por superar el límite de días permitidos sin justificación.`,creado_a:new Date(Date.now()-36e5*6).toISOString(),created_at:new Date(Date.now()-36e5*6).toISOString(),detalles:{motivo:`Exceso de días`,maestro:`Laura Jiménez`,duracion:`15 días`}},{id:`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33`,ausencia_id:`b1eecc99-9c0b-4ef8-bb6d-6bb9bd380a44`,actor_id:`c2eecc99-9c0b-4ef8-bb6d-6bb9bd380a54`,usuario_id:`admin@gentleai.com`,usuario_nombre:`Administrador Principal`,accion:`permiso_aprobado`,notas:`Permiso de cuidado familiar aprobado según normativa institucional.`,creado_a:new Date(Date.now()-36e5*3).toISOString(),created_at:new Date(Date.now()-36e5*3).toISOString(),detalles:{tipo_permiso:`Cuidado familiar`,maestro:`Andrea Vega`,duracion:`2 días`}}],Xm=[{id:`op-001`,tipo:`sincronizacion`,descripcion:`Sincronización masiva de asistencias del período`,estado:`completado`,timestamp:new Date(Date.now()-36e5*48).toISOString(),detalles:{registros_sincronizados:234,duracion_ms:3450}},{id:`op-002`,tipo:`reporte`,descripcion:`Generación de reporte mensual de rendimiento`,estado:`completado`,timestamp:new Date(Date.now()-36e5*36).toISOString(),detalles:{tipo_reporte:`rendimiento`,alumnos_incluidos:120}},{id:`op-003`,tipo:`sincronizacion`,descripcion:`Respaldo de base de datos local a la nube`,estado:`fallido`,timestamp:new Date(Date.now()-36e5*30).toISOString(),detalles:{error:`Conexión interrumpida durante la transferencia`,tamano_mb:256}},{id:`op-004`,tipo:`mantenimiento`,descripcion:`Limpieza de registros huérfanos en ausencias_auditoria`,estado:`completado`,timestamp:new Date(Date.now()-36e5*24).toISOString(),detalles:{registros_eliminados:15}},{id:`op-005`,tipo:`reporte`,descripcion:`Exportación de estadísticas a Excel para dirección académica`,estado:`completado`,timestamp:new Date(Date.now()-36e5*18).toISOString(),detalles:{formato:`xlsx`,tamano_kb:450}},{id:`op-006`,tipo:`sincronizacion`,descripcion:`Sincronización de perfiles de nuevos maestros`,estado:`completado`,timestamp:new Date(Date.now()-36e5*12).toISOString(),detalles:{maestros_sincronizados:3,duracion_ms:1200}},{id:`op-007`,tipo:`mantenimiento`,descripcion:`Actualización de índices de base de datos`,estado:`en_progreso`,timestamp:new Date(Date.now()-36e5*8).toISOString(),detalles:{tablas_afectadas:5,progreso:`65%`}},{id:`op-008`,tipo:`reporte`,descripcion:`Generación de alertas tempranas de abandono`,estado:`fallido`,timestamp:new Date(Date.now()-36e5*6).toISOString(),detalles:{error:`Timeout en consulta a vw_riesgo_abandono`,duracion_ms:15e3}},{id:`op-009`,tipo:`sincronizacion`,descripcion:`Carga de planificación curricular del nuevo período`,estado:`pendiente`,timestamp:new Date(Date.now()-36e5*4).toISOString(),detalles:{periodo:`2026-02`,archivos_pendientes:8}},{id:`op-010`,tipo:`mantenimiento`,descripcion:`Compactación de almacenamiento offline (IndexedDB)`,estado:`completado`,timestamp:new Date(Date.now()-36e5*2).toISOString(),detalles:{espacio_liberado_mb:12,registros_compactados:340}},{id:`op-011`,tipo:`reporte`,descripcion:`Reporte de cumplimiento docente semanal`,estado:`completado`,timestamp:new Date(Date.now()-36e5*1).toISOString(),detalles:{tipo_reporte:`cumplimiento`,maestros_evaluados:45}}];async function Zm(){return await new Promise(e=>setTimeout(e,250)),[...Jm]}async function Qm(){return await new Promise(e=>setTimeout(e,300)),[...Ym]}async function $m(e){await new Promise(e=>setTimeout(e,50));let t={timestamp:new Date().toISOString(),level:e.level||`INFO`,module:e.module||`Client`,message:e.message||`Sin mensaje de error especificado`,network:navigator.onLine?`Online`:`Offline`,stack:e.stack||``};return Jm.unshift(t),console.log(`Mock: System Log registrado`,t),t}async function eh(){return await new Promise(e=>setTimeout(e,200)),[...Xm]}async function th(e){return await new Promise(e=>setTimeout(e,200)),{radarData:[{id:`1`,health_status:`active`,days_inactive:2},{id:`2`,health_status:`stagnant`,days_inactive:15},{id:`3`,health_status:`stagnant`,days_inactive:20},{id:`4`,health_status:`active`,days_inactive:0},{id:`5`,health_status:`not_started`,days_inactive:30}],nodeDifficulty:[{node_name:`Posición de Mano Izquierda (Violín)`,failure_percentage:75},{node_name:`Postura de Arco (Violín)`,failure_percentage:60},{node_name:`Afinación Básica`,failure_percentage:45}],complianceData:[{nombre:`Carlos Gómez`,categoria:`negligente`,sesiones_rojo:8},{nombre:`María Luz`,categoria:`regular`,sesiones_rojo:3},{nombre:`Pedro Almonte`,categoria:`responsable`,sesiones_rojo:0}]}}var nh=()=>p.isDemoMode?qm:Bm,rh=(...e)=>nh().getSystemLogs(...e),ih=(...e)=>nh().getAuditLogs(...e),ah=(...e)=>nh().recordSystemLog(...e),oh=(...e)=>nh().callDslRpc(...e);function sh({label:e,value:t,color:n=`primary`,icon:r=`bi-graph-up`}){let i=`bg-${n}`,a=`text-${n}`;return`
    <div class="card border-0 shadow-sm h-100 pm-metric-card">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="metric-icon ${i} bg-opacity-10 ${a} rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.5rem;">
            <i class="bi ${r}"></i>
          </div>
          <div>
            <div class="text-muted small fw-bold text-uppercase" style="letter-spacing: 0.5px;">${v(e)}</div>
            <div class="h3 mb-0 fw-extrabold ${a}">${t}</div>
          </div>
        </div>
      </div>
    </div>
  `}function ch(e){let t=null,n=`ALL`,r=null,i=null;async function a(){t&&(t.innerHTML=`
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
    `,o(),await s(),l())}function o(){let e=t.querySelector(`#live-net-status`);e&&(e.innerHTML=navigator.onLine?`<span class="badge bg-success rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm small"><span class="spinner-grow spinner-grow-sm text-white obs-net-spinner obs-spinner-slow"></span> ONLINE</span>`:`<span class="badge bg-warning text-dark rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-sm small obs-pulse-offline"><span class="spinner-grow spinner-grow-sm text-dark obs-net-spinner"></span> OFFLINE</span>`)}async function s(){let e=t.querySelector(`#logs-body`);if(!e)return;let r=await rh(),i=n===`ALL`?r:r.filter(e=>e.level===n);if(i.length===0){e.innerHTML=`<div class="text-center text-muted py-5">[Consola vacía. No hay logs registrados con severidad "${n}"]</div>`;return}e.innerHTML=i.map(e=>{let t=`obs-log-level-info`;e.level===`WARNING`&&(t=`obs-log-level-warning`),e.level===`ERROR`&&(t=`obs-log-level-error`);let n=`
        <div class="obs-log-item">
          <span class="obs-log-ts">[${e.timestamp?e.timestamp.substring(11,19):new Date().toISOString().substring(11,19)}]</span>
          <span class="${t}">[${e.level}]</span>
          <span class="obs-log-module">${v(e.module)}</span>:
          <span>${v(e.message)}</span>
          <span class="obs-log-net">${e.network}</span>
      `;return e.stack&&(n+=`<pre class="obs-log-stack">${v(e.stack)}</pre>`),n+=`</div>`,n}).join(``)}function l(){t.querySelectorAll(`[data-log-filter]`).forEach(e=>{e.addEventListener(`click`,()=>{t.querySelectorAll(`[data-log-filter]`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),n=e.dataset.logFilter,s()})}),t.querySelector(`#btn-clear-logs`)?.addEventListener(`click`,()=>{localStorage.setItem(`soi_system_logs`,JSON.stringify([])),c.show(`Consola de logs de sistema limpiada con éxito`,`success`),s()}),t.querySelector(`#btn-mock-rls`)?.addEventListener(`click`,async()=>{await ah({level:`ERROR`,module:`SupabaseClient`,message:`Security policy violation for select on public.ausencias_auditoria table (RLS error).`,stack:`Error: Row Level Security block
  at executeSelect (supabaseClient.js:84:18)
  at getAuditLogs (observabilidadSupabase.js:46:12)`}),c.show(`Log de error de RLS inyectado`,`danger`),s()}),t.querySelector(`#btn-mock-timeout`)?.addEventListener(`click`,async()=>{await ah({level:`WARNING`,module:`HTTPClient`,message:`Request timed out for endpoint /rpc/get_institutional_radar. Falling back to offline fallback state.`,stack:`TimeoutException: Request took longer than 5000ms`}),c.show(`Log de timeout de red inyectado`,`warning`),s()}),t.querySelector(`#btn-mock-vitals`)?.addEventListener(`click`,async()=>{await ah({level:`INFO`,module:`PWA`,message:`Core Web Vitals: FID: 11ms (Excelente), LCP: 980ms (Excelente), CLS: 0.012 (Excelente).`}),c.show(`Log de Core Web Vitals inyectado`,`success`),s()})}return{async init(){if(t=document.getElementById(e),!t){console.error(`[systemLogsWidget] Contenedor #${e} no encontrado en el DOM`);return}await a(),r=()=>{o(),c.show(`Conectividad restablecida. Sistema Online.`,`success`)},i=()=>{o(),c.show(`Conexión perdida. Trabajando en modo Offline.`,`warning`)},window.addEventListener(`online`,r),window.addEventListener(`offline`,i)},destroy(){r&&window.removeEventListener(`online`,r),i&&window.removeEventListener(`offline`,i)}}}function lh(e){let t=null,n=``,r=`ALL`;async function i(){t&&(t.innerHTML=`
      <div class="row g-3 mb-4 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small fw-semibold text-secondary">Buscar por Actor / Notas / ID</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control shadow-sm" id="input-audit-search" placeholder="Correo, UUID, notas..." value="${v(n)}">
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
    `,await a(),c())}async function a(){let e=t.querySelector(`#audit-trail-tbody`),i=t.querySelector(`#audit-pagination-info`);if(!e)return;let a=await ih()||[];if(n.trim()!==``){let e=n.toLowerCase();a=a.filter(t=>t.actor_id&&t.actor_id.toLowerCase().includes(e)||t.usuario_id&&t.usuario_id.toLowerCase().includes(e)||t.notas&&t.notas.toLowerCase().includes(e)||t.id&&t.id.toLowerCase().includes(e))}r!==`ALL`&&(a=a.filter(e=>e.accion===r));let s=a.slice(0,50);if(s.length===0){e.innerHTML=`<tr><td colspan="5" class="text-center text-muted py-5"><i class="bi bi-info-circle me-1"></i> No se encontraron registros de auditoría.</td></tr>`,i&&(i.textContent=`Mostrando 0 registros`);return}e.innerHTML=s.map(e=>{let t=`bg-secondary`;e.accion===`APROBACION_FINAL`&&(t=`bg-success bg-opacity-10 text-success border border-success-subtle`),e.accion===`CREACION`&&(t=`bg-primary bg-opacity-10 text-primary border border-primary-subtle`),e.accion===`RECHAZO`&&(t=`bg-danger bg-opacity-10 text-danger border border-danger-subtle`);let n=e.creado_a?new Date(e.creado_a).toLocaleString(`es-ES`):`Fecha no disponible`,r=e.usuario_id||e.actor_id||`Sistema`;return`
        <tr>
          <td class="text-nowrap px-3 text-secondary">${n}</td>
          <td><span class="badge ${t} px-2.5 py-1.5 rounded-pill fw-semibold obs-audit-action-label">${e.accion}</span></td>
          <td class="fw-semibold text-break obs-audit-actor-cell" title="${r}">${r}</td>
          <td class="text-secondary">${v(e.notas||`Sin comentarios adicionales`)}</td>
          <td class="text-center px-3">
            <button class="btn btn-sm btn-outline-secondary btn-audit-detail rounded-circle shadow-sm obs-audit-detail-btn" data-audit-id="${e.id}">
              <i class="bi bi-info-circle-fill obs-audit-detail-icon"></i>
            </button>
          </td>
        </tr>
      `}).join(``),i&&(i.textContent=`Mostrando ${s.length} de ${a.length} registros (límite de 50 registros por página)`),t.querySelectorAll(`.btn-audit-detail`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.auditId,n=s.find(e=>e.id===t);n&&o(n)})})}function o(e){let t=e.detalles?Object.keys(e.detalles).map(t=>`
          <div class="col-6 mb-2">
            <span class="d-block extra-small text-muted text-uppercase fw-bold">${t}</span>
            <span class="small fw-semibold text-secondary">${v(String(e.detalles[t]))}</span>
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
          <div class="mt-1 p-3 bg-light bg-opacity-25 rounded border text-secondary small lh-base italic">"${v(e.notas||`Sin notas registradas en esta transacción`)}"</div>
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
    `;_.open({title:`Detalles del Audit Trail de Seguridad`,body:n,hideSave:!0,cancelText:`Cerrar`})}let s=[];function c(){let e=t.querySelector(`#input-audit-search`),i=e=>{n=e.target.value,a()};e?.addEventListener(`input`,i),e&&s.push({el:e,event:`input`,fn:i});let o=t.querySelector(`#select-audit-action`),c=e=>{r=e.target.value,a()};o?.addEventListener(`change`,c),o&&s.push({el:o,event:`change`,fn:c});let l=t.querySelector(`#btn-reset-audit-filters`),u=()=>{n=``,r=`ALL`,e&&(e.value=``),o&&(o.value=`ALL`),a()};l?.addEventListener(`click`,u),l&&s.push({el:l,event:`click`,fn:u})}return{async init(){if(t=document.getElementById(e),!t){console.error(`[auditTrailWidget] Contenedor #${e} no encontrado en el DOM`);return}await i()},destroy(){s.forEach(({el:e,event:t,fn:n})=>{e.removeEventListener(t,n)}),s=[],t=null}}}var K={activeTab:localStorage.getItem(`pm_metrics_tab`)||`resumen`,stats:null,cargando:!1,container:null,activeWidgetInstances:[],_onlineListener:null,_offlineListener:null};function uh(){K.activeWidgetInstances.forEach(e=>{if(e&&typeof e.destroy==`function`)try{e.destroy()}catch(e){console.error(`Error destroying widget:`,e)}}),K.activeWidgetInstances=[]}async function dh(e){if(e)try{uh(),K.container=e,K.cargando=!0,fh(e),K.stats=await Fm(),K.resumenAlertas=await Rm(),K.cargando=!1,mh(e),Sh(e)}catch(t){console.error(t),ph(e,t.message)}}function fh(e){e.innerHTML=`<div class="d-flex justify-content-center align-items-center obs-loading-area"><div class="spinner-border text-primary" role="status"></div></div>`}function ph(e,t){e.innerHTML=`<div class="alert alert-danger m-3"><h5>Error analítico</h5><p>${v(t)}</p></div>`}function mh(e){e.innerHTML=`
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
          <button class="btn btn-outline-primary ${K.activeTab===`resumen`?`active`:``}" data-tab="resumen"><i class="bi bi-speedometer2 me-1"></i> Resumen</button>
          <button class="btn btn-outline-primary ${K.activeTab===`operaciones`?`active`:``}" data-tab="operaciones"><i class="bi bi-gear-fill me-1"></i> Operaciones</button>
          <button class="btn btn-outline-primary ${K.activeTab===`logs`?`active`:``}" data-tab="logs"><i class="bi bi-terminal me-1"></i> Logs PWA</button>
          <button class="btn btn-outline-primary ${K.activeTab===`auditoria`?`active`:``}" data-tab="auditoria"><i class="bi bi-shield-check me-1"></i> Auditoría</button>
          <button class="btn btn-outline-primary ${K.activeTab===`ia`?`active`:``}" data-tab="ia"><i class="bi bi-robot me-1"></i> IA Intelligence</button>
        </div>
      </div>

      <div id="hub-content">
        ${gh()}
      </div>
    </div>
  `,hh()}function hh(){let e=K.container.querySelector(`#offline-network-badge-container`);e&&(e.innerHTML=navigator.onLine?`<span class="badge bg-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-white obs-spinner-slow" role="status"></span><i class="bi bi-cloud-check me-1"></i> Online</span>`:`<span class="badge bg-warning text-dark rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"><span class="spinner-grow spinner-grow-sm text-dark animate-pulse" role="status"></span><i class="bi bi-cloud-slash me-1"></i> Offline - Logs encolados</span>`)}function gh(){switch(K.activeTab){case`resumen`:return _h();case`operaciones`:return vh();case`logs`:return yh();case`auditoria`:return bh();case`ia`:return xh();default:return _h()}}function _h(){let e=K.stats||{},t=K.resumenAlertas||{total:0,rojas:0};return`
    <div class="row g-3">
      <div class="col-md-6 col-lg-3">
        ${sh({label:`Alumnos Activos`,value:e.total_alumnos||0,icon:`bi-people`,color:`primary`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${sh({label:`Promedio Global`,value:(e.promedio_general||0).toFixed(2),icon:`bi-star`,color:`success`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${sh({label:`Alertas Rojas`,value:t.rojas,icon:`bi-exclamation-octagon`,color:`danger`})}
      </div>
      <div class="col-md-6 col-lg-3">
        ${sh({label:`Asistencia Hoy`,value:(e.asistencia_hoy_porcentaje||0)+`%`,icon:`bi-check2-circle`,color:`info`})}
      </div>
      
      <div class="col-12 mt-4">
        <h5 class="fw-bold mb-3"><i class="bi bi-trophy me-2 text-warning"></i>Alumnos Destacados</h5>
        <div class="page-glass p-0 overflow-hidden">
          <div id="destacados-placeholder" class="p-4 text-center text-muted">Cargando destacados...</div>
        </div>
      </div>
    </div>
  `}function vh(){return`
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
  `}function yh(){return`
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
  `}function bh(){return`
    <div class="page-glass p-4">
      <!-- Widget Modular de Auditoría -->
      <div id="audit-trail-container">
        <div class="text-center py-5"><div class="spinner-border spinner-border-sm text-primary"></div></div>
      </div>
    </div>
  `}function xh(){return`
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
  `}function Sh(e){e.querySelectorAll(`[data-tab]`).forEach(t=>{t.addEventListener(`click`,()=>{uh(),K.activeTab=t.dataset.tab,localStorage.setItem(`pm_metrics_tab`,K.activeTab),mh(e),Sh(e),Ch()})}),e.querySelector(`#btn-guia-analisis`)?.addEventListener(`click`,()=>{kh()}),K._onlineListener=hh,K._offlineListener=hh,window.addEventListener(`online`,K._onlineListener),window.addEventListener(`offline`,K._offlineListener),Ch()}async function Ch(){if(K.activeTab===`resumen`){let e=await zm(),t=K.container.querySelector(`#destacados-placeholder`);t&&(t.className=``,t.innerHTML=`
        <table class="table table-compact table-hover mb-0">
          <tbody class="small">
            ${e.slice(0,5).map(e=>`
              <tr>
                <td><i class="bi bi-award text-warning me-2"></i><strong>${v(e.nombre_completo)}</strong></td>
                <td><span class="badge bg-success bg-opacity-10 text-success border border-success-subtle">${e.promedio}</span></td>
                <td class="text-muted">${v(e.programa)}</td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      `)}if(K.activeTab===`operaciones`){try{let{CumplimientoMaestrosWidget:e}=await d(async()=>{let{CumplimientoMaestrosWidget:e}=await import(`./cumplimientoMaestrosWidget-Dthdkq63.js`).then(e=>e.n);return{CumplimientoMaestrosWidget:e}},__vite__mapDeps([13,4,5,1,14,15])),t=new e(`cumplimiento-maestros-container`);await t.init(),K.activeWidgetInstances.push(t)}catch(e){console.error(`Error al cargar el widget de CumplimientoMaestrosWidget:`,e);let t=K.container.querySelector(`#cumplimiento-maestros-container`);t&&(t.innerHTML=`<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar el Cumplimiento de Maestros.</div>`)}try{let{analyticsFillingBehaviorWidget:e}=await d(async()=>{let{analyticsFillingBehaviorWidget:e}=await import(`./analyticsFillingBehaviorWidget-C9uPYtFf.js`).then(e=>e.n);return{analyticsFillingBehaviorWidget:e}},__vite__mapDeps([16,4,1,14,17])),t=e(`comportamiento-llenado-container`);await t.init(),K.activeWidgetInstances.push(t)}catch(e){console.error(`Error al cargar el widget de Comportamiento de Llenado:`,e);let t=K.container.querySelector(`#comportamiento-llenado-container`);t&&(t.innerHTML=`<div class="alert alert-warning small"><i class="bi bi-exclamation-circle me-1"></i> No se pudo instanciar la Analítica de Llenado.</div>`)}}if(K.activeTab===`logs`){let e=ch(`system-logs-container`);K.activeWidgetInstances.push(e),await e.init()}if(K.activeTab===`auditoria`){let e=lh(`audit-trail-container`);K.activeWidgetInstances.push(e),await e.init()}K.activeTab===`ia`&&Eh()}var wh=`Actuás como el Analista de Inteligencia Institucional de "El Sistema Punta Cana",
una fundación de educación musical. Se te entrega un JSON con métricas REALES pre-calculadas
(KPIs del período, alertas, hotspots pedagógicos y rendimiento docente).

Tu tarea: redactar un análisis ejecutivo breve en markdown limpio con:
1. Estado general del grupo en 2-3 frases.
2. Los 1-2 focos de atención más críticos (si los datos los muestran).
3. Una recomendación accionable (máximo 2 bullets).

REGLA CRÍTICA ANTIALUCINACIÓN: NO inventes números ni porcentajes que no estén en el JSON.
Si un arreglo viene vacío, decilo explícitamente ("sin datos suficientes") en vez de suponer.
Sé conciso y concreto.`;function Th(e){let t=K.stats||{},n=K.resumenAlertas||{};return{periodo_activo:{total_alumnos:t.total_alumnos??null,promedio_general:t.promedio_general??null,asistencia_hoy_porcentaje:t.asistencia_hoy_porcentaje??null},alertas:{total:n.total??0,rojas:n.rojas??0},hotspots_pedagogicos:(e?.nodeDifficulty||[]).slice(0,5),rendimiento_docente:(e?.complianceData||[]).slice(0,10)}}function Eh(){K.container.querySelector(`#btn-run-ia`)?.addEventListener(`click`,async()=>{let e=K.container.querySelector(`#ia-result-area`);if(e){e.innerHTML=`<div class="text-center"><div class="spinner-border spinner-border-sm text-primary"></div><p class="small mt-2">Compilando datos reales y analizando con IA...</p></div>`;try{let t=await oh(`global`),n=Th(t),r=null;try{let e=await u([{role:`system`,content:wh},{role:`user`,content:`Datos institucionales reales (JSON):\n${JSON.stringify(n,null,2)}\n\nGenerá el análisis según tus instrucciones.`}]);r=typeof e==`string`?e:e?.content||null}catch(e){console.warn(`[IA Hub] GROQ no disponible, uso resumen local:`,e.message)}r&&r.trim()?(e.innerHTML=`
          <div class="page-glass p-3 border-primary border-start border-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong class="small"><i class="bi bi-stars text-primary me-1"></i>Análisis Institucional</strong>
              <span class="badge bg-success bg-opacity-10 text-success border border-success-subtle extra-small">GROQ · datos reales</span>
            </div>
            <div class="ia-content markdown-body small text-secondary">${Dh(v(r.trim()))}</div>
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-xs btn-outline-primary" id="btn-copy-report"><i class="bi bi-clipboard me-1"></i>Copiar</button>
              <a href="#/metricas-ia-reportes" class="btn btn-xs btn-outline-secondary"><i class="bi bi-file-earmark-pdf me-1"></i>Reporte completo + PDF</a>
            </div>
          </div>
        `,K.container.querySelector(`#btn-copy-report`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(r.trim()),c.show(`Reporte copiado al portapapeles`,`success`)})):e.innerHTML=`
          <div class="page-glass p-3 border-warning border-start border-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong class="small">Resumen automático</strong>
              <span class="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle extra-small">IA no disponible</span>
            </div>
            <p class="extra-small text-secondary mb-0">${v(Oh(t))}</p>
          </div>
        `}catch(t){console.error(`Error en análisis IA:`,t),e.innerHTML=`<div class="alert alert-danger small"><i class="bi bi-exclamation-triangle me-1"></i> Error al compilar análisis: ${v(t.message)}</div>`}}})}function Dh(e){return e.replace(/^### (.*$)/gim,`<h6 class="fw-bold mt-3 mb-1 text-dark">$1</h6>`).replace(/^## (.*$)/gim,`<h6 class="fw-bold mt-3 mb-1 text-dark">$1</h6>`).replace(/^# (.*$)/gim,`<h6 class="fw-bold mb-2 text-primary">$1</h6>`).replace(/^[*-] (.*$)/gim,`<li class="ms-3 mb-1">$1</li>`).replace(/\*\*(.*?)\*\*/g,`<strong class="text-dark">$1</strong>`).replace(/\n/g,`<br>`)}function Oh(e){let t=[];if(e.radarData&&e.radarData.length>0){let n=(e.radarData.reduce((e,t)=>e+(t.value||0),0)/e.radarData.length).toFixed(1);t.push(`Indicadores promedio: ${n}%.`)}if(e.nodeDifficulty&&e.nodeDifficulty.length>0){let n=e.nodeDifficulty.filter(e=>e.difficulty>.7).length;n>0&&t.push(`Se detectaron ${n} nodos de alto riesgo que requieren intervención.`)}return e.complianceData&&t.push(`Estado de cumplimiento docente compilado en el período actual.`),t.length>0?t.join(` `):`Análisis completado. Consulta el Generador de Reportes para análisis más detallados.`}function kh(){_.open({title:`Guía de Análisis Académico y Observabilidad`,body:`
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
  `,size:`lg`,hideSave:!0,cancelText:`Entendido`,onShow:e=>{let t=e.querySelectorAll(`#guia-modal-tabs button`),n=e.querySelectorAll(`.guia-panel`);t.forEach(r=>{r.addEventListener(`click`,()=>{t.forEach(e=>e.classList.remove(`active`)),r.classList.add(`active`),n.forEach(e=>e.classList.add(`d-none`));let i=e.querySelector(`#pane-${r.dataset.guia}`);i&&i.classList.remove(`d-none`)})})}})}var Ah=[{id:`rpt_master`,nombre:`Analítica Crítica Institucional`,descripcion:`Visión 360°: Cruce de asistencia, rendimiento y gestión docente con IA`,frecuencia:`mensual`,tipo:`global`,icon:`bi-shield-shaded`},{id:`rpt_003`,nombre:`Reporte de Alumnos en Riesgo`,descripcion:`Detección automática de bajo rendimiento y ausentismo con IA`,frecuencia:`semanal`,tipo:`riesgo`,icon:`bi-exclamation-triangle`},{id:`rpt_002`,nombre:`Boletín de Progreso General`,descripcion:`Resumen de calificaciones y evolución por programa`,frecuencia:`mensual`,tipo:`progreso`,icon:`bi-graph-up`},{id:`rpt_001`,nombre:`Análisis de Asistencia Crítica`,descripcion:`Identificación de patrones de deserción y faltas injustificadas`,frecuencia:`semanal`,tipo:`asistencia`,icon:`bi-calendar-check`}],q={reportes:[],programada:!1,_container:null,_boundListeners:[],_timeouts:[]};async function jh(e){e&&(Mh(),q._container=e,q.reportes=[...Ah],Nh(e),Fh(e))}function Mh(){q._boundListeners.forEach(({el:e,event:t,fn:n})=>{e.removeEventListener(t,n)}),q._boundListeners=[],q._timeouts.forEach(e=>clearTimeout(e)),q._timeouts=[],q._container=null}function Nh(e){e.innerHTML=`
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
        ${q.reportes.map(e=>Ph(e)).join(``)}
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
                  <input type="date" class="form-control form-control-sm" id="genDesde" value="${Gh()}">
                  <input type="date" class="form-control form-control-sm" id="genHasta" value="${Wh()}">
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
  `}function Ph(e){let t={diaria:`danger`,semanal:`warning`,mensual:`info`}[e.frecuencia]||`secondary`;return`
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
  `}function Fh(e){let t=e.querySelector(`#btnNuevoReporte`),n=()=>Ih(e);t?.addEventListener(`click`,n),t&&q._boundListeners.push({el:t,event:`click`,fn:n}),e.querySelectorAll(`[data-action]`).forEach(t=>{let n=()=>{let n=t.dataset.id;t.dataset.action===`generar`?Rh(n):t.dataset.action===`editar`&&Hh(n,e)};t.addEventListener(`click`,n),q._boundListeners.push({el:t,event:`click`,fn:n})});let r=e.querySelector(`#btnGenerarAhora`),i=()=>Uh(e);r?.addEventListener(`click`,i),r&&q._boundListeners.push({el:r,event:`click`,fn:i});let a=e.querySelector(`#btnEnviarEmail`),o=()=>Bh(e);a?.addEventListener(`click`,o),a&&q._boundListeners.push({el:a,event:`click`,fn:o});let s=e.querySelector(`#programacionActiva`),c=e=>{q.programada=e.target.checked,_.open({title:q.programada?`Programación Activada`:`Programación Desactivada`,body:`<div class="alert alert-${q.programada?`success`:`warning`} mb-0">La generación de reportes está ahora ${q.programada?`activa`:`inactiva`}.</div>`,hideSave:!0,cancelText:`Cerrar`})};s?.addEventListener(`change`,c),s&&q._boundListeners.push({el:s,event:`change`,fn:c})}function Ih(e){_.open({title:`Nueva Plantilla de Reporte`,size:`md`,saveText:`Crear`,body:`
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
    `,onSave:()=>{let t=document.getElementById(`newReporteNombre`).value.trim();if(!t)return alert(`El nombre es obligatorio`),!1;q.reportes.unshift({id:`rpt_`+Date.now(),nombre:t,descripcion:document.getElementById(`newReporteDesc`).value,tipo:document.getElementById(`newReporteTipo`).value,frecuencia:document.getElementById(`newReporteFreq`).value,icon:`bi-file-earmark-text`}),Nh(e),_.close()}})}async function Lh(e){let{radarData:t,nodeDifficulty:n,complianceData:r}=await oh(e);return{timestamp:new Date().toISOString(),resumen:{total_alumnos:t.length||10,stagnant:t.filter(e=>e.health_status===`stagnant`).length},hotspots:n.slice(0,3).map(e=>({nodo:e.node_name||`Desconocido`,tasa_fallo:e.failure_percentage||0})),docentes_criticos:r.filter(e=>e.categoria===`negligente`||e.sesiones_rojo>4).map(e=>({nombre:e.nombre_completo||e.nombre||`Docente`,atrasos:e.sesiones_rojo||0}))}}async function Rh(e){let t=q.reportes.find(t=>t.id===e);if(t){_.showLoading(`Analizando datos para: ${t.nombre}...`);try{let e=await Lh(t.tipo),n=await u([{role:`system`,content:`
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
`}]),r=[{nombre:`Alumnos en Estancamiento`,valor:e.resumen.stagnant,unidad:`Alumnos`},...e.hotspots.map(e=>({nombre:`Fallo Crítico: ${e.nodo}`,valor:`${e.tasa_fallo}%`,unidad:`Tasa`})),...e.docentes_criticos.map(e=>({nombre:`Atraso Docente: ${e.nombre}`,valor:e.atrasos,unidad:`Sesiones`}))];_.close(),_.open({title:`<i class="bi bi-stars text-primary me-2"></i>SOI Intelligence: ${t.nombre}`,size:`lg`,saveText:`<i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF`,body:`
        <div class="reporte-preview p-3">
          <div class="mb-4 bg-light p-3 rounded border-start border-primary border-4 shadow-sm">
            <h6 class="fw-bold mb-1"><i class="bi bi-cpu me-2 text-primary"></i>Resumen del Payload DSL Procesado</h6>
            <p class="small text-muted mb-0">Datos agregados cruzados con éxito a las ${new Date(e.timestamp).toLocaleTimeString()}.</p>
          </div>
          
          <div class="ia-content markdown-body mb-4 p-3 border rounded-3 bg-light bg-opacity-10 shadow-sm obs-ia-content">
            ${zh(n)}
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
      `,onSave:async()=>(Vh(t.nombre,n,r),!1)})}catch(e){console.error(e),_.close(),c.error(`Error al generar el análisis de IA: `+e.message)}}}function zh(e){return e.replace(/^### (.*$)/gim,`<h5 class="fw-bold mt-4 mb-2 text-dark">$1</h5>`).replace(/^## (.*$)/gim,`<h4 class="fw-bold mt-4 mb-2 border-bottom pb-1 text-dark">$1</h4>`).replace(/^# (.*$)/gim,`<h3 class="fw-bold mb-3 text-primary border-bottom pb-2">$1</h3>`).replace(/^\* (.*$)/gim,`<li class="ms-3 mb-1.5 small text-secondary">$1</li>`).replace(/\*\*(.*)\*\*/gim,`<strong class="text-dark">$1</strong>`).replace(/\n/g,`<br>`)}function Bh(e){let t=e.querySelector(`#emailDest`).value.trim(),n=e.querySelector(`#emailAsunto`).value.trim();if(!t){c.error(`El campo de destinatario es obligatorio.`);return}_.showLoading(`Enviando reporte por correo electrónico...`),setTimeout(()=>{_.close(),c.success(`Reporte "${n}" enviado con éxito a: ${t}`)},1500)}async function Vh(e,t,n){let{jsPDF:r}=await d(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-GjK8N93W.js`).then(e=>e.n);return{jsPDF:e}},__vite__mapDeps([3,4,5,6])),{default:i}=await d(async()=>{let{default:e}=await import(`./jspdf.plugin.autotable-BLAnV92G.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([7,4]));c.info(`Generando documento PDF...`);let a=new r,o=a.internal.pageSize.width;a.setFillColor(41,128,185),a.rect(0,0,o,40,`F`),a.setTextColor(255,255,255),a.setFontSize(22),a.text(`SOI - Sistema Operativo Institucional`,14,20),a.setFontSize(12),a.text(e.toUpperCase(),14,30),a.text(new Date().toLocaleDateString(),o-40,30),a.setTextColor(0,0,0),a.setFontSize(14),a.setFont(void 0,`bold`),a.text(`Análisis Crítico con IA`,14,55),a.setFontSize(10),a.setFont(void 0,`normal`);let s=t.replace(/[#*]/g,``).split(`
`).filter(e=>e.trim()!==``),l=65;s.forEach(e=>{let t=a.splitTextToSize(e.trim(),o-28);l+t.length*5>280&&(a.addPage(),l=20),a.text(t,14,l),l+=t.length*5+2}),n&&n.length>0&&i(a,{startY:l+10,head:[[`Indicador / Estudiante`,`Valor`,`Unidad`]],body:n.map(e=>[e.nombre,e.valor,e.unidad]),theme:`striped`,headStyles:{fillColor:[41,128,185]},styles:{fontSize:9}});let u=a.internal.getNumberOfPages();for(let e=1;e<=u;e++)a.setPage(e),a.setFontSize(8),a.setTextColor(150),a.text(`Página ${e} de ${u} - Generado por SOI Intelligence`,o/2,290,{align:`center`});a.save(`Reporte_SOI_${e.replace(/\s+/g,`_`)}.pdf`),c.success(`PDF descargado con éxito`)}function Hh(e,t){let n=q.reportes.find(t=>t.id===e);n&&_.open({title:`Editar Reporte`,size:`md`,saveText:`Guardar`,body:`
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
    `,onSave:()=>{let n=q.reportes.findIndex(t=>t.id===e);n!==-1&&(q.reportes[n]={...q.reportes[n],nombre:document.getElementById(`editReporteNombre`).value,descripcion:document.getElementById(`editReporteDesc`).value,tipo:document.getElementById(`editReporteTipo`).value,frecuencia:document.getElementById(`editReporteFreq`).value}),Nh(t),_.close()}})}function Uh(e){let t=e.querySelector(`#generarAhoraSelect`).value;e.querySelector(`#genDesde`).value,e.querySelector(`#genHasta`).value;let n=e.querySelector(`input[name="genFormat"]:checked`).value;if(!t){alert(`Selecciona un reporte`);return}_.showLoading(`Generando reporte...`),setTimeout(()=>{_.close();let e=new Blob([`Reporte generado`],{type:`text/plain`}),r=URL.createObjectURL(e),i=document.createElement(`a`);i.href=r,i.download=`reporte-${t}-${new Date().toISOString().slice(0,10)}.${n}`,i.click(),URL.revokeObjectURL(r)},1500)}function Wh(){return new Date().toISOString().slice(0,10)}function Gh(){let e=new Date;return e.setDate(e.getDate()-7),e.toISOString().slice(0,10)}function Kh(){f.register(`metricas`,dh),f.register(`metricas-alertas`,dh),f.register(`metricas-riesgo`,dh),f.register(`metricas-maestros`,dh),f.register(`metricas-destacados`,dh),f.register(`metricas-ia-reportes`,jh)}new class{constructor(){this.cache=new Map,this.cacheExpiry=300*1e3}getCached(e){let t=this.cache.get(e);return t&&Date.now()-t.timestamp<this.cacheExpiry?t.data:null}setCached(e,t){this.cache.set(e,{data:t,timestamp:Date.now()})}async getDashboardData(){let e=this.getCached(`dashboard`);if(e)return e;let t={periodoActivo:await Fm(),alertas:await Rm(),alertasActivas:await Lm()};return this.setCached(`dashboard`,t),t}async getTasaAsistenciaAlumno(e,t=30){let n=new Date;return n.setDate(n.getDate()-t),Im(e,n.toISOString().split(`T`)[0])}calcularPorcentaje(e,t){return e<t.rojo?`rojo`:e<t.naranja?`naranja`:e<t.amarillo?`amarillo`:`verde`}generarAlertas(e,t){let n=[];return e<t.umbral_rojo?n.push({nivel:`rojo`,mensaje:`Asistencia crítica`}):e<t.umbral_naranja?n.push({nivel:`naranja`,mensaje:`Asistencia baja`}):e<t.umbral_amarillo&&n.push({nivel:`amarillo`,mensaje:`Precaución`}),n}clearCache(){this.cache.clear()}};function qh(){f.register(`configuracion`,async e=>{let{renderConfigView:t}=await d(async()=>{let{renderConfigView:e}=await import(`./configView-DFSU2rNq.js`);return{renderConfigView:e}},__vite__mapDeps([18,19,1,20,4,21]));await t(e)}),f.register(`importar-datos`,async e=>{let{renderImportView:t}=await d(async()=>{let{renderImportView:e}=await import(`./importView-DGjcwcW-.js`);return{renderImportView:e}},__vite__mapDeps([22,1]));await t(e)}),f.register(`exportar-datos`,async e=>{let{renderExportView:t}=await d(async()=>{let{renderExportView:e}=await import(`./exportView-anE4K3ZB.js`);return{renderExportView:e}},__vite__mapDeps([23,3,4,5,6,1,7,24,25,26,27,11,10]));await t(e)}),f.register(`documentos-historial`,async e=>{let{renderGeneratedDocumentsView:t}=await d(async()=>{let{renderGeneratedDocumentsView:e}=await import(`./generatedDocumentsView-Cw1oYbIK.js`);return{renderGeneratedDocumentsView:e}},__vite__mapDeps([28,1,25,3,4,5,6]));await t(e)})}var Jh=class{constructor(e,t={}){this.container=e,this.data=t.data||[],this.onSelect=t.onSelect||(()=>{}),this.expandedNodes=new Set,this.selectedNodeId=null,this.icons={block:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,level:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20M2 12h20M2 7h20"></path></svg>`,node:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`,indicator:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,expander:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`},this._injectStyles(),this.render(),this._bindEvents()}setData(e){this.data=e,this.render()}render(){this.container.innerHTML=`
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
    `,document.head.appendChild(e)}};async function Yh(){let{data:e,error:n}=await t.from(`routes`).select(`*`).order(`name`);if(n)throw console.error(`Error fetching routes:`,n.message),Error(`No se pudieron cargar las rutas`);return e}async function Xh(e){let{data:n,error:r}=await t.from(`route_versions`).select(`*`).eq(`route_id`,e).order(`version_number`,{ascending:!1});if(r)throw console.error(`Error fetching route versions:`,r.message),Error(`No se pudieron cargar las versiones de la ruta`);return n}async function Zh(e){if(!e)return[];try{let{data:n,error:r}=await t.from(`blocks`).select(`*`).eq(`route_version_id`,e).order(`order_index`);if(r)throw r;if(!n.length)return[];let i=n.map(e=>e.id),{data:a,error:o}=await t.from(`levels`).select(`*`).in(`block_id`,i).order(`order_index`);if(o)throw o;let s=a.map(e=>e.id),{data:c,error:l}=await t.from(`nodes`).select(`*`).in(`level_id`,s).order(`order_index`).limit(5e3);if(l)throw l;let u=c.map(e=>e.id),{data:d,error:f}=await t.from(`indicators`).select(`*`).in(`node_id`,u).order(`order_index`).limit(1e4);if(f)throw f;return n.map(e=>({...e,type:`block`,children:a.filter(t=>t.block_id===e.id).map(e=>({...e,type:`level`,children:c.filter(t=>t.level_id===e.id).map(e=>({...e,type:`node`,children:d.filter(t=>t.node_id===e.id).map(e=>({...e,type:`indicator`}))}))}))}))}catch(e){throw console.error(`Error building academic tree:`,e.message),Error(`Error al construir el árbol académico`)}}async function Qh(e){let{data:n,error:r}=await t.from(`node_resources`).select(`*`).eq(`node_id`,e).order(`order_index`);if(r)throw r;return n}async function $h(e){let{id:n,...r}=e;if(n){let{data:e,error:i}=await t.from(`node_resources`).update(r).eq(`id`,n).select().single();if(i)throw i;return e}else{let{data:e,error:n}=await t.from(`node_resources`).insert([r]).select().single();if(n)throw n;return e}}async function eg(e){let{error:n}=await t.from(`node_resources`).delete().eq(`id`,e);if(n)throw n;return!0}async function tg(e,n){let{data:r,error:i}=await t.from(`nodes`).update(n).eq(`id`,e).select().single();if(i)throw i;return r}var ng=class{constructor(e,t={}){this.container=e,this.node=null,this.resources=[],this.onUpdate=t.onUpdate||(()=>{}),this._injectStyles(),this.renderEmpty()}async setNode(e){if(!e){this.node=null,this.resources=[],this.renderEmpty();return}this.node=e,this.renderLoading();try{this.resources=await Qh(e.id),this.render()}catch(e){console.error(`Error loading resources:`,e),this.renderError(`No se pudieron cargar los recursos del nodo.`)}}renderEmpty(){this.container.innerHTML=`
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
    `}_bindEvents(){this.container.querySelector(`#save-node-metadata`)?.addEventListener(`click`,async()=>{let e=this.container.querySelector(`#node-name`).value,t=this.container.querySelector(`#node-critical`)?.checked,n=this.container.querySelector(`#save-node-metadata`);n.disabled=!0,n.textContent=`Guardando...`;try{let n={name:e};this.node.type===`node`&&(n.is_critical=t),this.node.type===`indicator`&&(n.description=e),await tg(this.node.id,n),Object.assign(this.node,n),this.onUpdate(this.node),this.render()}catch(e){alert(`Error al guardar: `+e.message)}finally{n.disabled=!1,n.textContent=`Guardar Cambios`}}),this.container.querySelector(`#add-resource-btn`)?.addEventListener(`click`,()=>{this._showResourceModal()}),this.container.querySelectorAll(`.edit-res`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.resource-card`).dataset.id,n=this.resources.find(e=>e.id===t);this._showResourceModal(n)})}),this.container.querySelectorAll(`.delete-res`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.closest(`.resource-card`).dataset.id;if(confirm(`¿Estás seguro de que deseas eliminar este recurso?`))try{await eg(t),this.resources=this.resources.filter(e=>e.id!==t),this.render()}catch(e){alert(`Error al eliminar: `+e.message)}})})}_showResourceModal(e=null){let t=!!e,n=`resourceModal`,r=document.getElementById(n);r&&r.remove(),r=document.createElement(`div`),r.id=n,r.className=`modal fade apple-modal`,r.tabIndex=-1,r.innerHTML=`
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
    `,document.body.appendChild(r);let i=new bootstrap.Modal(r);i.show(),r.querySelectorAll(`.type-option`).forEach(e=>{e.addEventListener(`click`,()=>{r.querySelectorAll(`.type-option`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`)})}),r.querySelector(`#save-resource-confirm-btn`).addEventListener(`click`,async()=>{let n=r.querySelector(`#resource-form`),a=new FormData(n),o={node_id:this.node.id,resource_type:a.get(`resource_type`),title:a.get(`title`),url:a.get(`url`),content:a.get(`content`),order_index:e?.order_index||this.resources.length};if(t&&(o.id=e.id),!o.title){alert(`El título es obligatorio`);return}try{let e=await $h(o);if(t){let t=this.resources.findIndex(t=>t.id===e.id);this.resources[t]=e}else this.resources.push(e);this.render(),i.hide()}catch(e){alert(`Error al guardar recurso: `+e.message)}})}_injectStyles(){if(document.getElementById(`resource-editor-styles`))return;let e=document.createElement(`style`);e.id=`resource-editor-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}};async function rg(e){ig(),e.innerHTML=`
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
  `;let t=e.querySelector(`#tree-container`),n=e.querySelector(`#detail-container`),r=e.querySelector(`#route-selector`),i=e.querySelector(`#version-selector`),a=new ng(n,{onUpdate:e=>{}}),o=new Jh(t,{onSelect:e=>{a.setNode(e)}});try{(await Yh()).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name,r.appendChild(t)})}catch(e){console.error(`Error loading routes:`,e)}r.addEventListener(`change`,async()=>{let e=r.value;if(i.innerHTML=`<option value="">Versión...</option>`,i.disabled=!0,t.innerHTML=`<div class="tree-placeholder"><p>Cargando versiones...</p></div>`,!e){t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una ruta para comenzar.</p></div>`;return}try{(await Xh(e)).forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=`V${e.version_number} - ${new Date(e.created_at).toLocaleDateString()}`,i.appendChild(t)}),i.disabled=!1,t.innerHTML=`<div class="tree-placeholder"><p>Selecciona una versión.</p></div>`}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar versiones.</p></div>`}}),i.addEventListener(`change`,async()=>{let e=i.value;if(e){t.innerHTML=`
      <div class="tree-loading">
        <div class="spinner-border spinner-border-sm text-primary"></div>
        <span>Construyendo mapa curricular...</span>
      </div>
    `;try{let t=await Zh(e);o.setData(t)}catch{t.innerHTML=`<div class="tree-placeholder text-danger"><p>Error al cargar el árbol curricular.</p></div>`}}})}function ig(){if(document.getElementById(`academic-admin-layout-styles`))return;let e=document.createElement(`style`);e.id=`academic-admin-layout-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function ag(e=[]){return!e||e.length===0?`
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
                    ${e.map(e=>og(e)).join(``)}
                </tbody>
            </table>
        </div>
    `}function og(e){let t=e.progress_percentage||0,n=t<40?`progress-low`:t<80?`progress-mid`:`progress-high`,r=e.health_status||`not_started`,i=e.last_activity_at?new Date(e.last_activity_at).toLocaleDateString():`Sin actividad`;return`
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
    `}function sg(e=[]){return!e||e.length===0?`
            <div class="pm-empty">
                <i class="bi bi-fire"></i>
                <p>No se han detectado puntos críticos pedagógicos.</p>
            </div>
        `:`
        <div class="aa-hotspots-grid pm-animate-fade-in">
            ${e.map(e=>cg(e)).join(``)}
        </div>
    `}function cg(e){let t=e.failure_percentage||0;return`
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
    `}async function lg(){return`
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
                    ${ag([])}
                </div>
            </section>

            <!-- Sección 2: Hotspots Pedagógicos (Dificultad por Nodo) -->
            <section class="mt-5">
                <h2 class="aa-hotspot-name fs-4 mb-4">Puntos de Calor Pedagógicos</h2>
                <div id="hotspots-container">
                    ${sg([])}
                </div>
            </section>
        </div>
    `}function ug(){f.register(`gestion-curricular`,e=>{rg(e)}),f.register(`planificacion-curricular`,e=>{rg(e)}),f.register(`torre-de-control`,async e=>{e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{e.innerHTML=await lg()}catch(t){e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar el dashboard: ${t.message}</p></div>`}})}function dg(e){let t={};e.forEach(e=>{t[e.fecha]||(t[e.fecha]={total_classes:0,asistencia_first:0,ai_usage_sum:0,observaciones_first:0}),t[e.fecha].total_classes++,e.orden_asistencia_primero===1&&t[e.fecha].asistencia_first++,t[e.fecha].ai_usage_sum+=e.uso_ai_fill_percent||0,e.orden_observaciones_primero===1&&t[e.fecha].observaciones_first++});let n={};return Object.entries(t).forEach(([e,t])=>{n[e]={total_classes:t.total_classes,asistencia_first_percent:(t.asistencia_first/t.total_classes*100).toFixed(1),avg_ai_usage_percent:(t.ai_usage_sum/t.total_classes).toFixed(1),observaciones_first_percent:(t.observaciones_first/t.total_classes*100).toFixed(1)}}),n}function fg(e){let t={};e.forEach(e=>{t[e.maestro_id]||(t[e.maestro_id]={maestro_nombre:e.maestro_nombre,total_classes:0,asistencia_first:0,ai_usage_sum:0,avg_duration:0,duration_count:0}),t[e.maestro_id].total_classes++,e.orden_asistencia_primero===1&&t[e.maestro_id].asistencia_first++,t[e.maestro_id].ai_usage_sum+=e.uso_ai_fill_percent||0,e.promedio_duracion_observaciones&&(t[e.maestro_id].avg_duration+=e.promedio_duracion_observaciones,t[e.maestro_id].duration_count++)});let n={};return Object.entries(t).forEach(([e,t])=>{n[e]={maestro_nombre:t.maestro_nombre,total_classes:t.total_classes,asistencia_first_percent:(t.asistencia_first/t.total_classes*100).toFixed(1),avg_ai_usage_percent:(t.ai_usage_sum/t.total_classes).toFixed(1),avg_observation_duration:t.duration_count>0?(t.avg_duration/t.duration_count).toFixed(1):0}}),n}async function pg(){try{let{data:e,error:n}=await t.from(`maestro_desempeño`).select(`
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
        `).order(`updated_at`,{ascending:!1});if(n)throw n;let r=(e||[]).reduce((e,t)=>(e[t.categoria]=(e[t.categoria]||0)+1,e),{}),i=(e||[]).reduce((e,t)=>(e[t.tendencia]=(e[t.tendencia]||0)+1,e),{}),a=(e||[]).reduce((e,t)=>e+t.total_sesiones,0),o=(e||[]).reduce((e,t)=>e+t.sesiones_verde,0),s=a>0?(o/a*100).toFixed(2):0;return{totalMaestros:e?.length||0,byCategory:r,byTrend:i,overallComplianceRate:s,totalSessions:a,completedSessions:o,data:e||[],generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getInstitutionComplianceSummary] Error:`,e),e}}async function mg(){try{let{data:e,error:n}=await t.from(`registros_pendientes`).select(`
        id,
        maestro_id,
        notification_state,
        created_at,
        notif_count,
        maestros(nombre_completo)
        `).in(`notification_state`,[`NARANJA`,`ROJO`]).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!1});if(n)throw n;let r=(e||[]).reduce((e,t)=>(e[t.maestro_id]||(e[t.maestro_id]={maestroId:t.maestro_id,nombre:t.maestros?.nombre_completo,email:t.maestros?.email,naranja:[],rojo:[]}),t.notification_state===`NARANJA`?e[t.maestro_id].naranja.push(t):e[t.maestro_id].rojo.push(t),e),{}),i=Object.values(r).map(e=>{let t=[...e.naranja,...e.rojo],n=Math.max(...t.map(e=>new Date(e.created_at).getTime())),r=Math.ceil((Date.now()-n)/(1e3*60*60*24));return{...e,diasAtraso:r,naranjaCount:e.naranja.length,rojoCount:e.rojo.length,totalCount:t.length,urgency:e.rojo.length>0?`CRITICA`:`ALTA`}});return{totalCritical:i.length,byUrgency:{critica:i.filter(e=>e.urgency===`CRITICA`).length,alta:i.filter(e=>e.urgency===`ALTA`).length},maestros:i.sort((e,t)=>t.diasAtraso-e.diasAtraso),generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getCriticalMaestrosReport] Error:`,e),e}}async function hg(e=`csv`){try{let t=await pg();if(e===`csv`){let e=`REPORTE DE CUMPLIMIENTO DE MAESTROS
`;return e+=`Generado: ${new Date().toLocaleString()}\n\n`,e+=`RESUMEN GENERAL
`,e+=`Total de Maestros,${t.totalMaestros}\n`,e+=`Tasa de Cumplimiento,${t.overallComplianceRate}%\n`,e+=`Sesiones Completadas,${t.completedSessions}/${t.totalSessions}\n\n`,e+=`POR CATEGORÍA
`,e+=`Categoría,Cantidad
`,Object.entries(t.byCategory).forEach(([t,n])=>{e+=`${t},${n}\n`}),e+=`
POR TENDENCIA
`,e+=`Tendencia,Cantidad
`,Object.entries(t.byTrend).forEach(([t,n])=>{e+=`${t},${n}\n`}),e}return t}catch(e){throw console.error(`[exportComplianceReport] Error:`,e),e}}async function gg(e=30){try{let t=new Date(Date.now()-e*24*60*60*1e3).toISOString().split(`T`)[0],n=(await At()).filter(e=>e.fecha>=t),r=dg(n),i=fg(n);return{daysBack:e,total_classes:n.length,total_maestros:Object.keys(i).length,date_trends:r,maestro_trends:i,institution_summary:{avg_ai_usage_institution:n.length>0?(n.reduce((e,t)=>e+(t.uso_ai_fill_percent||0),0)/n.length).toFixed(1):0,asistencia_first_percent:n.length>0?(n.filter(e=>e.orden_asistencia_primero===1).length/n.length*100).toFixed(1):0,observaciones_first_percent:n.length>0?(n.filter(e=>e.orden_observaciones_primero===1).length/n.length*100).toFixed(1):0},generatedAt:new Date().toISOString()}}catch(e){throw console.error(`[getInstitutionTrendReportWithFilling] Error:`,e),e}}var _g=class{constructor(e){this.containerId=e,this.container=document.getElementById(e),this.summary=null,this.critical=null}async init(){try{this.container.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando reportes institucionales...</div>
        </div>
      `,await this.loadData(),this.render(),this.attachEventListeners(),console.log(`[DirectorReportingPanel] Initialized`)}catch(e){console.error(`[DirectorReportingPanel] Init error:`,e),this.container.innerHTML=`
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error cargando reportes: ${e.message}</div>
        </div>
      `}}async loadData(){this.summary=await pg(),this.critical=await mg()}render(){let e=`
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
    `}attachEventListeners(){let e=document.getElementById(`btnExportCSV`),t=document.getElementById(`btnRefresh`);e?.addEventListener(`click`,()=>this.exportReport()),t?.addEventListener(`click`,()=>this.init())}async exportReport(){try{let e=await hg(`csv`),t=new Blob([e],{type:`text/csv`}),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`reporte-cumplimiento-${new Date().toISOString().split(`T`)[0]}.csv`,r.click(),window.URL.revokeObjectURL(n),console.log(`[DirectorReportingPanel] CSV exported`)}catch(e){console.error(`[DirectorReportingPanel] Export error:`,e),alert(`Error al descargar reporte: `+e.message)}}};function vg(e){let t=document.getElementById(e),n=null;function r(e){return`
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
      `;try{n=await gg(30),this.render()}catch(e){console.error(`[directorTrendReportView] Error:`,e),t.innerHTML=`
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
      `}}}function yg(){f.register(`admin-dashboard`,e=>{try{e.innerHTML=`<div id="admin-dashboard-container"></div>`,new Et(`admin-dashboard-container`).init()}catch(t){console.error(`[admin-dashboard] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar cumplimiento: ${t.message}</p></div>`}}),f.register(`admin-dashboard-reportes`,e=>{try{e.innerHTML=`<div id="director-reporting-container"></div>`,new _g(`director-reporting-container`).init()}catch(t){console.error(`[admin-dashboard-reportes] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar reportes: ${t.message}</p></div>`}}),f.register(`admin-dashboard-analitca-llenado`,e=>{try{e.innerHTML=`<div id="analytics-filling-container"></div>`,jt(`analytics-filling-container`).init()}catch(t){console.error(`[admin-dashboard-analitca-llenado] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar analítica: ${t.message}</p></div>`}}),f.register(`admin-dashboard-tendencias`,e=>{try{e.innerHTML=`<div id="trend-report-container"></div>`,vg(`trend-report-container`).init()}catch(t){console.error(`[admin-dashboard-tendencias] Error:`,t),e.innerHTML=`<div class="pm-placeholder"><i class="bi bi-exclamation-triangle"></i><p>Error al cargar tendencias: ${t.message}</p></div>`}})}var bg=[{id:`perm-001`,maestro_id:`maestro_001`,maestro_nombre:`Carlos Méndez`,maestro_email:`carlos.mendez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`planificacion:write`,`asistencias:write`],solicitudes:[],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-01-15T10:00:00Z`,actualizado_en:`2026-05-01T14:30:00Z`},{id:`perm-002`,maestro_id:`maestro_002`,maestro_nombre:`María López`,maestro_email:`maria.lopez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!1,permisos:[`alumnos:create`,`planificacion:write`],solicitudes:[`clases:enroll`],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-02-20T09:00:00Z`,actualizado_en:`2026-04-10T11:00:00Z`},{id:`perm-003`,maestro_id:`maestro_003`,maestro_nombre:`Ana Martínez`,maestro_email:`ana.martinez@ejemplo.com`,puede_registrar_alumnos:!1,puede_inscribir_clases:!1,permisos:[],solicitudes:[`alumnos:create`],concedido_por:null,concedido_por_nombre:null,creado_en:`2026-03-01T08:00:00Z`,actualizado_en:`2026-03-01T08:00:00Z`},{id:`perm-004`,maestro_id:`maestro_004`,maestro_nombre:`Pedro Ramírez`,maestro_email:`pedro.ramirez@ejemplo.com`,puede_registrar_alumnos:!0,puede_inscribir_clases:!0,permisos:[`alumnos:create`,`clases:enroll`,`asistencias:write`],solicitudes:[],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-01-20T15:00:00Z`,actualizado_en:`2026-05-05T09:00:00Z`},{id:`perm-005`,maestro_id:`maestro_005`,maestro_nombre:`Laura Fernández`,maestro_email:`laura.fernandez@ejemplo.com`,puede_registrar_alumnos:!1,puede_inscribir_clases:!0,permisos:[`clases:enroll`],solicitudes:[`alumnos:create`],concedido_por:`admin_001`,concedido_por_nombre:`Admin Sistema`,creado_en:`2026-04-01T12:00:00Z`,actualizado_en:`2026-04-15T16:00:00Z`}],xg=e({actualizarPermiso:()=>Dg,obtenerPermisoPorMaestro:()=>Eg,obtenerPermisos:()=>Tg}),Sg=(e=300)=>new Promise(t=>setTimeout(t,e)),Cg=[...bg];function wg(e){return e?{id:e.id,maestro_id:e.maestro_id??``,maestro_nombre:e.maestro_nombre??``,maestro_email:e.maestro_email??``,puede_registrar_alumnos:e.puede_registrar_alumnos??!1,puede_inscribir_clases:e.puede_inscribir_clases??!1,permisos:Array.isArray(e.permisos)?e.permisos:[],solicitudes:Array.isArray(e.solicitudes)?e.solicitudes:[],concedido_por:e.concedido_por??null,concedido_por_nombre:e.concedido_por_nombre??null,creado_en:e.creado_en||null,actualizado_en:e.actualizado_en||null}:null}async function Tg(){return await Sg(),Cg.map(wg)}async function Eg(e){await Sg();let t=Cg.find(t=>t.maestro_id===e);return t?wg(t):{id:null,maestro_id:e,maestro_nombre:``,maestro_email:``,puede_registrar_alumnos:!1,puede_inscribir_clases:!1,permisos:[],solicitudes:[],concedido_por:null,concedido_por_nombre:null,creado_en:null,actualizado_en:null}}async function Dg(e,t){await Sg();let n=Cg.findIndex(t=>t.maestro_id===e),r=new Date().toISOString();if(n===-1){let n={id:Math.random().toString(36).substr(2,9),maestro_id:e,maestro_nombre:t.maestro_nombre||``,maestro_email:t.maestro_email||``,puede_registrar_alumnos:t.puede_registrar_alumnos??!1,puede_inscribir_clases:t.puede_inscribir_clases??!1,permisos:Array.isArray(t.permisos)?t.permisos:[],solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:[],concedido_por:t.concedido_por||null,concedido_por_nombre:t.concedido_por_nombre||null,creado_en:r,actualizado_en:r};return Cg.push(n),wg(n)}return Cg[n]={...Cg[n],puede_registrar_alumnos:t.puede_registrar_alumnos??Cg[n].puede_registrar_alumnos,puede_inscribir_clases:t.puede_inscribir_clases??Cg[n].puede_inscribir_clases,permisos:Array.isArray(t.permisos)?t.permisos:Cg[n].permisos,solicitudes:Array.isArray(t.solicitudes)?t.solicitudes:Cg[n].solicitudes,concedido_por:t.concedido_por??Cg[n].concedido_por,concedido_por_nombre:t.concedido_por_nombre??Cg[n].concedido_por_nombre,actualizado_en:r},wg(Cg[n])}var Og=()=>p.isDemoMode?xg:s,kg=(...e)=>Og().obtenerPermisos(...e),Ag=(...e)=>Og().actualizarPermiso(...e),jg={permisos:[],cargando:!1,togglingId:null,togglingField:null};function Mg(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}async function Ng(e){try{jg.cargando=!0,Pg(e),jg.permisos=await kg(),jg.cargando=!1,Ig(e),Bg(e)}catch(t){console.error(t),Fg(e,t.message)}}function Pg(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando permisos...</p>
      </div>
    </div>
  `}function Fg(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle"></i> Error al cargar
            </h4>
            <p>${Mg(t)}</p>
            <hr>
            <button class="btn btn-primary" id="retryBtn">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`retryBtn`)?.addEventListener(`click`,()=>Ng(e))}function Ig(e){let t=an.getUser?an.getUser():null;t?.nombre_completo||t?.email,e.innerHTML=`
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-2">
          <span class="page-title"><i class="bi bi-shield-lock me-2 text-primary"></i>Permisos de Maestros</span>
          <span class="badge bg-secondary">${jg.permisos.length}</span>
        </div>
      </div>

      ${jg.permisos.length?`
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
            ${Lg()}
          </tbody>
        </table>
      </div>
      `:Rg()}

      <div class="mt-3 text-muted small">
        <i class="bi bi-info-circle"></i>
        Los cambios se guardan automáticamente al alternar un permiso.
        ${p.isDemoMode?`<span class="badge bg-warning text-dark ms-1">Demo</span>`:``}
      </div>
    </div>
  `}function Lg(){return jg.permisos.map(e=>{let t=jg.togglingId===e.maestro_id,n=e.concedido_por_nombre||e.concedido_por||`-`,r=e.actualizado_en?new Date(e.actualizado_en).toLocaleDateString(`es-ES`,{day:`numeric`,month:`short`}):`-`,i=e.solicitudes||[],a=!e.puede_registrar_alumnos&&i.includes(`alumnos:create`),o=!e.puede_inscribir_clases&&i.includes(`clases:enroll`);return`
      <tr data-maestro-id="${Mg(e.maestro_id)}">
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-compact bg-primary text-white">${zg(e.maestro_nombre||e.maestro_id)}</div>
            <span class="text-truncate" style="max-width: 150px;" title="${Mg(e.maestro_nombre)}">${Mg(e.maestro_nombre||`Sin nombre`)}</span>
          </div>
        </td>
        <td class="text-truncate" style="max-width: 150px;" title="${Mg(e.maestro_email)}">${Mg(e.maestro_email||`-`)}</td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${Mg(e.maestro_id)}"
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
                data-maestro-id="${Mg(e.maestro_id)}" 
                data-permiso="alumnos:create" 
                data-field="puede_registrar_alumnos" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          `:``}
        </td>
        <td>
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input permiso-toggle" type="checkbox"
              data-maestro-id="${Mg(e.maestro_id)}"
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
                data-maestro-id="${Mg(e.maestro_id)}" 
                data-permiso="clases:enroll" 
                data-field="puede_inscribir_clases" 
                style="font-size: 0.65rem; line-height: 1;">Aprobar</button>
            </div>
          `:``}
        </td>
        <td class="small text-muted">${Mg(n)}</td>
        <td class="small text-muted">${r}</td>
      </tr>
    `}).join(``)}function Rg(){return`
    <div class="col-12 text-center py-5">
      <div class="mb-3">
        <i class="bi bi-shield-exclamation" style="font-size: 3rem; color: var(--bs-secondary);"></i>
      </div>
      <h4>No hay permisos configurados</h4>
      <p class="text-muted">Los permisos aparecerán aquí cuando los administradores los configuren.</p>
    </div>
  `}function zg(e){return e?e.split(` `).map(e=>e[0]).join(``).toUpperCase().slice(0,2):`?`}function Bg(e){let t=e.querySelector(`#permisosTable`);t&&(t.addEventListener(`change`,async t=>{let n=t.target.closest(`.permiso-toggle`);if(!n)return;let r=n.dataset.maestroId,i=n.dataset.field,a=n.checked;n.disabled=!0,jg.togglingId=r,jg.togglingField=i;let o=n.closest(`.form-check`)?.querySelector(`span`);o&&(o.textContent=a?`Sí`:`No`,o.className=`small ${a?`text-success`:`text-muted`}`);try{let t=jg.permisos.find(e=>e.maestro_id===r),n={[i]:a};if(t){if(a){let e=i===`puede_registrar_alumnos`?`alumnos:create`:`clases:enroll`,r=t.permisos||[];r.includes(e)||r.push(e);let a=(t.solicitudes||[]).filter(t=>t!==e),o=an.getUser?an.getUser():null,s=o?.nombre_completo||o?.email||`Administrador`;n={...n,permisos:r,solicitudes:a,concedido_por:o?.id||`admin`,concedido_por_nombre:s},t.permisos=r,t.solicitudes=a,t.concedido_por=o?.id||`admin`,t.concedido_por_nombre=s}else{let e=i===`puede_registrar_alumnos`?`alumnos:create`:`clases:enroll`,r=(t.permisos||[]).filter(t=>t!==e);n={...n,permisos:r},t.permisos=r}t.actualizado_en=new Date().toISOString()}await Ag(r,n),t&&(t[i]=a),c.success(`Permiso actualizado: ${i===`puede_registrar_alumnos`?`Registrar Alumnos`:`Inscribir Clases`}`);let o=e.querySelector(`#permisosTBody`);o&&(o.innerHTML=Lg())}catch(e){n.checked=!a,o&&(o.textContent=a?`No`:`Sí`,o.className=`small ${a?`text-muted`:`text-success`}`),c.error(`Error al actualizar permiso: `+e.message)}finally{n.disabled=!1,jg.togglingId=null,jg.togglingField=null}}),t.addEventListener(`click`,async t=>{let n=t.target.closest(`.aprobar-btn`);if(!n)return;let r=n.dataset.maestroId,i=n.dataset.permiso,a=n.dataset.field;n.disabled=!0;let o=n.innerHTML;n.innerHTML=`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;try{let t=jg.permisos.find(e=>e.maestro_id===r);if(!t)throw Error(`No se encontró el registro de permisos del maestro`);let n=t.permisos||[];n.includes(i)||n.push(i);let o=(t.solicitudes||[]).filter(e=>e!==i),s=an.getUser?an.getUser():null,l=s?.nombre_completo||s?.email||`Administrador`;await Ag(r,{permisos:n,solicitudes:o,concedido_por:s?.id||`admin`,concedido_por_nombre:l,[a]:!0}),t.permisos=n,t.solicitudes=o,t.concedido_por=s?.id||`admin`,t.concedido_por_nombre=l,t[a]=!0,t.actualizado_en=new Date().toISOString(),c.success(`Solicitud aprobada: ${a===`puede_registrar_alumnos`?`Registrar Alumnos`:`Inscribir Clases`}`);let u=e.querySelector(`#permisosTBody`);u&&(u.innerHTML=Lg())}catch(e){c.error(`Error al aprobar solicitud: `+e.message),n.disabled=!1,n.innerHTML=o}}))}function Vg(){f.register(`permisos`,Ng)}async function Hg(e){if(e){Ot(),e.innerHTML=Gg();try{let[t,n]=await Promise.all([Ug(),Wg()]);e.innerHTML=Kg(t,n),$g(e),qg(e),Xg(e)}catch(t){console.error(`[DashboardPedagogico]`,t),e.innerHTML=`
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar el dashboard: ${t.message}</div>
      </div>`}}}async function Ug(){let[e,n,r,i]=await Promise.all([t.from(`alumnos`).select(`id`,{count:`exact`}).eq(`activo`,!0),t.from(`planificaciones`).select(`id, estado`).gte(`fecha_inicio`,new Date(Date.now()-10080*60*1e3).toISOString().split(`T`)[0]),t.from(`clases`).select(`id`,{count:`exact`}).eq(`estado`,`activa`),t.from(`asistencias`).select(`estado`).gte(`fecha`,new Date(Date.now()-10080*60*1e3).toISOString().split(`T`)[0])]),a=i.data?.length||0,o=i.data?.filter(e=>e.estado===`P`).length||0,s=a>0?Math.round(o/a*100):null,c=n.data?.filter(e=>e.estado===`ejecutado`).length||0,l=n.data?.filter(e=>e.estado===`planificado`).length||0;return{alumnosActivos:e.count||0,clasesActivas:r.count||0,planesEstaSemana:n.data?.length||0,planesEjecutados:c,planesPlanificados:l,tasaAsistencia:s}}async function Wg(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],{data:n}=await t.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e);if(!n?.length)return[];let r={};n.forEach(e=>{r[e.alumno_id]||(r[e.alumno_id]={total:0,presentes:0}),r[e.alumno_id].total++,e.estado===`P`&&r[e.alumno_id].presentes++});let i=Object.entries(r).filter(([,e])=>e.total>=4&&e.presentes/e.total<Xf.attendance_min_rate).map(([e])=>e);if(!i.length)return[];let{data:a}=await t.from(`alumnos`).select(`id, nombre_completo`).in(`id`,i.slice(0,5));return a||[]}function Gg(){return`
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
    </div>`}function Kg(e,t){let n=e.tasaAsistencia===null?`secondary`:e.tasaAsistencia>=80?`success`:e.tasaAsistencia>=60?`warning`:`danger`;return`
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
        ${Zg(`bi-people-fill`,`Alumnos activos `+kt(`progreso_alumno`),e.alumnosActivos,`primary`,null)}
        ${Zg(`bi-easel2`,`Clases activas `+kt(`cumplimiento_sesiones`),e.clasesActivas,`indigo`,null)}
        ${Zg(`bi-journal-text`,`Planes esta semana `+kt(`cumplimiento`),e.planesEstaSemana,`success`,`${e.planesEjecutados} ejecutados · ${e.planesPlanificados} pendientes`)}
        ${Zg(`bi-calendar-check`,`Asistencia (7 días) `+kt(`asistencia_riesgo`),e.tasaAsistencia===null?`—`:e.tasaAsistencia+`%`,n,null)}
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

      <div class="row g-3 mb-4">
        ${Qg(`bi-journal-text`,`Planificación`,`Planes de clase, plantillas y revisión`,`planificacion`,`primary`)}
        ${Qg(`bi-person-lines-fill`,`Seguimiento`,`Progreso y asistencia por alumno`,`pedagogico-seguimiento`,`success`)}
        ${Qg(`bi-graph-up`,`Evaluaciones`,`Calificaciones y boletines`,`progresos`,`warning`)}
        ${Qg(`bi-file-earmark-bar-graph`,`Reportes`,`Rendimiento por clase y riesgo`,`pedagogico-reportes`,`info`)}
        ${Qg(`bi-envelope-paper`,`Solicitudes`,`Necesidades enviadas por maestros`,`pedagogico-solicitudes`,`secondary`)}
      </div>

      <!-- Clases emergentes -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header border-0 d-flex align-items-center gap-2">
          <i class="bi bi-lightning-charge-fill text-warning"></i>
          <span class="fw-semibold" style="font-size:0.9rem;">Clases emergentes registradas</span>
        </div>
        <div class="card-body p-0" id="emergentes-section">
          <div class="text-center text-muted py-3">
            <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
          </div>
        </div>
      </div>

      <!-- Seguimiento institucional -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header border-0 d-flex align-items-center gap-2">
          <i class="bi bi-shield-check text-primary"></i>
          <span class="fw-semibold" style="font-size:0.9rem;">Seguimiento institucional</span>
          <button class="btn btn-sm btn-link ms-auto" data-nav="pedagogico-seguimiento-institucional" style="font-size:0.78rem;">Ver todo <i class="bi bi-arrow-right"></i></button>
        </div>
        <div class="card-body p-3" id="seguimiento-kpis-section">
          <div class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm me-2"></span>Cargando...</div>
        </div>
      </div>
    </div>`}async function qg(e){let n=e.querySelector(`#emergentes-section`);if(n)try{let{data:e,error:r}=await t.from(`sesiones_clase`).select(`id, fecha, hora_inicio, hora_fin, tema_principal, actividad, motivo, observaciones_generales, estado, maestro_id, salon_id, asistencia, contenidos_trabajados`).is(`clase_id`,null).order(`fecha`,{ascending:!1}).limit(20);if(r)throw r;if(!e||e.length===0){n.innerHTML=`
        <div class="text-center text-muted py-4 px-3">
          <i class="bi bi-lightning-charge fs-3 d-block mb-2 opacity-40"></i>
          <p class="mb-1" style="font-size:0.9rem;">No hay clases emergentes registradas.</p>
          <small>Las clases emergentes aparecerán aquí cuando sean registradas por coordinación o por un maestro autorizado.</small>
        </div>`;return}let i=[...new Set(e.map(e=>e.maestro_id).filter(Boolean))],a={};if(i.length>0){let{data:e}=await t.from(`maestros`).select(`id, nombre_completo`).in(`id`,i);(e||[]).forEach(e=>{a[e.id]=e})}n.innerHTML=e.map(e=>{let t=a[e.maestro_id]?.nombre_completo||`No asignado`,n=e.fecha?new Date(e.fecha+`T00:00:00`).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):`Sin fecha`,r=e.hora_inicio?e.hora_inicio.slice(0,5):`—`,i=e.hora_fin?e.hora_fin.slice(0,5):``,o=i?`${r} – ${i}`:r,s=e.tema_principal||e.actividad||`Clase emergente`,c=e.motivo||null;return`
        <div class="d-flex align-items-start gap-3 px-3 py-3 border-bottom emergente-row"
             data-id="${e.id}" style="cursor:pointer;">
          <div class="flex-shrink-0 text-warning mt-1">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold text-truncate" style="font-size:0.875rem;">${s}</div>
            <div class="small text-muted mt-1">
              <span class="me-3"><i class="bi bi-calendar3 me-1"></i>${n}</span>
              <span class="me-3"><i class="bi bi-clock me-1"></i>${o}</span>
              <span><i class="bi bi-person-badge me-1"></i>${t}</span>
              ${e.actividad?`<span class="ms-2 badge bg-secondary-subtle text-secondary-emphasis">${e.actividad}</span>`:``}
            </div>
            ${c?`<div class="small text-muted fst-italic mt-1 text-truncate">${c}</div>`:``}
          </div>
          <button class="btn btn-sm btn-outline-secondary flex-shrink-0" data-id="${e.id}" title="Ver detalle">
            <i class="bi bi-eye"></i>
          </button>
        </div>`}).join(``)}catch(e){console.error(`[DashboardPedagogico] _loadEmergentes error:`,e),n&&(n.innerHTML=`<p class="text-danger small px-3 py-2 mb-0">Error al cargar las clases emergentes.</p>`)}}function Jg(e){_.open({title:`Detalle de clase emergente`,hideSave:!0,cancelText:`Cerrar`,size:`lg`,body:`<div id="emergente-modal-body" class="text-center py-4">
      <span class="spinner-border spinner-border-sm me-2"></span>Cargando detalle...
    </div>`,onOpen:async n=>{try{let{data:r,error:i}=await t.from(`sesiones_clase`).select(`*`).eq(`id`,e).single();if(i)throw i;let a=`No asignado`,o=null;if(r.maestro_id){let{data:e}=await t.from(`maestros`).select(`nombre_completo`).eq(`id`,r.maestro_id).single();a=e?.nombre_completo||`No asignado`}if(r.salon_id){let{data:e}=await t.from(`salones`).select(`nombre`).eq(`id`,r.salon_id).single();o=e?.nombre||null}let s=r.fecha?new Date(r.fecha+`T00:00:00`).toLocaleDateString(`es-DO`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):`Sin fecha`,c=`${r.hora_inicio?r.hora_inicio.slice(0,5):`—`} – ${r.hora_fin?r.hora_fin.slice(0,5):`—`}`,l=r.tema_principal||r.actividad||`Clase emergente`,u=r.actividad||null,d={pendiente:`bg-warning-subtle text-warning-emphasis`,registrada:`bg-success-subtle text-success-emphasis`,cancelada:`bg-danger-subtle text-danger-emphasis`}[r.estado]||`bg-secondary-subtle text-secondary-emphasis`,f=Array.isArray(r.contenidos_trabajados)&&r.contenidos_trabajados.length>0?r.contenidos_trabajados.map(e=>`<li class="small">${typeof e==`string`?e:JSON.stringify(e)}</li>`).join(``):null;n.querySelector(`#emergente-modal-body`).innerHTML=`
          <div class="d-flex align-items-start gap-3 mb-4 pb-3 border-bottom">
            <div class="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px;">
              <i class="bi bi-lightning-charge-fill" style="font-size:1.2rem;"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="mb-1 fw-bold">${l}</h5>
              <span class="badge ${d}">${r.estado||`pendiente`}</span>
              ${u?`<span class="badge bg-secondary-subtle text-secondary-emphasis ms-1">${u}</span>`:``}
            </div>
          </div>

          <div class="row g-2 mb-4 small">
            <div class="col-6 col-md-4"><div class="text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Fecha</div><div>${s}</div></div>
            <div class="col-6 col-md-4"><div class="text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Horario</div><div>${c}</div></div>
            <div class="col-6 col-md-4"><div class="text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Salón</div><div>${o||`<em class="text-muted">No registrado</em>`}</div></div>
            <div class="col-6 col-md-4"><div class="text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Maestro</div><div>${a}</div></div>
          </div>

          <div class="mb-4">
            <h6 class="fw-bold border-bottom pb-2 mb-2" style="font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;">
              <i class="bi bi-chat-left-text me-2 text-primary"></i>Justificación
            </h6>
            <p class="small mb-0" style="line-height:1.6;">${r.motivo||`<em class="text-muted">Sin justificación registrada.</em>`}</p>
          </div>

          <div class="mb-4">
            <h6 class="fw-bold border-bottom pb-2 mb-2" style="font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;">
              <i class="bi bi-journal-text me-2 text-primary"></i>Contenido trabajado
            </h6>
            ${f?`<ul class="mb-0 ps-3">${f}</ul>`:r.contenido?`<p class="small mb-0" style="white-space:pre-line;">${r.contenido}</p>`:`<em class="text-muted small">Sin contenido registrado.</em>`}
            ${r.observaciones_generales?`<div class="border-start border-2 border-secondary ps-3 mt-2">
                   <div class="text-muted small fw-semibold mb-1">Observaciones del maestro:</div>
                   <p class="small mb-0" style="white-space:pre-line;">${r.observaciones_generales}</p>
                 </div>`:``}
          </div>

          <div>
            <h6 class="fw-bold border-bottom pb-2 mb-2" style="font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;">
              <i class="bi bi-people me-2 text-primary"></i>Asistencia
            </h6>
            <div id="emergente-asistencia-section">
              <span class="spinner-border spinner-border-sm me-2"></span>Cargando asistencia...
            </div>
          </div>
        `,await Yg(r.asistencia||[],n)}catch(e){console.error(`[emergente modal]`,e);let t=n.querySelector(`#emergente-modal-body`);t&&(t.innerHTML=`<p class="text-danger small">Error al cargar el detalle.</p>`)}}})}async function Yg(e,n){let r=n.querySelector(`#emergente-asistencia-section`);if(r){if(!e||e.length===0){r.innerHTML=`<p class="text-muted small fst-italic mb-0">No hay alumnos asignados a esta clase emergente.</p>`;return}try{let n=[...new Set(e.map(e=>e.alumno_id).filter(Boolean))],i={};if(n.length>0){let{data:e}=await t.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,n);(e||[]).forEach(e=>{i[e.id]=e})}let a={P:`presente`,A:`ausente`,J:`justificado`,T:`tarde`},o={P:`bg-success-subtle text-success-emphasis`,A:`bg-danger-subtle text-danger-emphasis`,J:`bg-info-subtle text-info-emphasis`,T:`bg-warning-subtle text-warning-emphasis`},s=e.filter(e=>e.estado===`P`).length,c=e.filter(e=>e.estado===`A`).length;e.filter(e=>e.estado&&e.estado!==`P`&&e.estado!==`A`).length;let l=e.filter(e=>!e.estado).length,u=e.length;r.innerHTML=`
      <div class="row g-2 mb-3 small text-center">
        <div class="col"><div class="fw-bold">${u}</div><div class="text-muted" style="font-size:0.72rem;">Total</div></div>
        <div class="col"><div class="fw-bold text-success">${s}</div><div class="text-muted" style="font-size:0.72rem;">Presentes</div></div>
        <div class="col"><div class="fw-bold text-danger">${c}</div><div class="text-muted" style="font-size:0.72rem;">Ausentes</div></div>
        <div class="col"><div class="fw-bold text-secondary">${l}</div><div class="text-muted" style="font-size:0.72rem;">Sin registrar</div></div>
        <div class="col"><div class="fw-bold">${u>0?Math.round(s/u*100):0}%</div><div class="text-muted" style="font-size:0.72rem;">Asistencia</div></div>
      </div>
      ${e.map(e=>{let t=i[e.alumno_id],n=t?.nombre_completo||`—`,r=t?.instrumento_principal||`Sin instrumento`,s=e.estado||null;return`
          <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
            <div class="d-flex align-items-center gap-2">
              <span class="badge flex-shrink-0 ${s&&o[s]||`bg-secondary-subtle text-secondary-emphasis`}">${s?a[s]||s:`pendiente`}</span>
              <div class="small fw-semibold">${Mt(n)}</div>
            </div>
            <div class="small text-muted fst-italic">${Mt(r)}</div>
          </div>`}).join(``)}
    `}catch(e){console.error(`[asistencia emergente]`,e),r.innerHTML=`<p class="text-danger small mb-0">Error al cargar la asistencia.</p>`}}}async function Xg(e){let t=e.querySelector(`#seguimiento-kpis-section`);if(t)try{let e=await Lp();t.innerHTML=`
      <div class="row g-2">
        <div class="col-6 col-md-2 text-center">
          <div class="fw-bold text-warning" style="font-size:1.4rem;">${e.alertasPendientes}</div>
          <div class="text-muted" style="font-size:0.7rem;">Alertas pendientes</div>
        </div>
        <div class="col-6 col-md-2 text-center">
          <div class="fw-bold text-primary" style="font-size:1.4rem;">${e.casosAbiertos}</div>
          <div class="text-muted" style="font-size:0.7rem;">Casos abiertos</div>
        </div>
        <div class="col-6 col-md-2 text-center">
          <div class="fw-bold text-danger" style="font-size:1.4rem;">${e.casosCriticos}</div>
          <div class="text-muted" style="font-size:0.7rem;">Casos críticos</div>
        </div>
        <div class="col-6 col-md-2 text-center">
          <div class="fw-bold text-warning" style="font-size:1.4rem;">${e.proximasAccionesVencidas}</div>
          <div class="text-muted" style="font-size:0.7rem;">Acciones vencidas</div>
        </div>
        <div class="col-6 col-md-2 text-center">
          <div class="fw-bold text-info" style="font-size:1.4rem;">${e.casosEnSeguimiento}</div>
          <div class="text-muted" style="font-size:0.7rem;">En seguimiento</div>
        </div>
        <div class="col-6 col-md-2 text-center">
          <div class="fw-bold text-success" style="font-size:1.4rem;">${e.cartasEsteMes}</div>
          <div class="text-muted" style="font-size:0.7rem;">Cartas este mes</div>
        </div>
      </div>`}catch(e){console.error(`[dashboard seguimiento]`,e),t.innerHTML=`<p class="text-danger small mb-0">Error al cargar KPIs de seguimiento.</p>`}}function Zg(e,t,n,r,i){return`
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
    </div>`}function Qg(e,t,n,r,i){return`
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
    </div>`}function $g(e){Dt(e),e.querySelectorAll(`[data-nav]`).forEach(e=>{e.addEventListener(`click`,()=>f.navigate(e.dataset.nav)),e.classList.contains(`quick-nav-card`)&&(e.addEventListener(`mouseenter`,()=>{e.style.transform=`translateY(-2px)`,e.style.boxShadow=`0 8px 25px rgba(0,0,0,0.12)`}),e.addEventListener(`mouseleave`,()=>{e.style.transform=``,e.style.boxShadow=``}))}),e.addEventListener(`click`,e=>{let t=e.target.closest(`.emergente-row[data-id]`);t&&Jg(t.dataset.id)}),e.querySelector(`#btn-help-dashboard`)?.addEventListener(`click`,()=>{hr.open({title:`Dashboard Pedagógico`,intro:`Resumen general del estado académico de la institución. Te permite ver de un vistazo cómo están los alumnos, clases y planificaciones.`,sections:[{icon:`bi-people-fill`,title:`Alumnos activos`,description:`Cantidad total de alumnos con estado activo en el sistema.`,color:`#3b82f6`},{icon:`bi-easel2`,title:`Clases activas`,description:`Número de clases con estado "activa". Las clases inactivas o suspendidas no se cuentan.`,color:`#6366f1`},{icon:`bi-journal-text`,title:`Planes esta semana`,description:`Planificaciones con fecha de inicio en los últimos 7 días. Muestra cuántas fueron ejecutadas y cuántas siguen pendientes.`,color:`#10b981`},{icon:`bi-calendar-check`,title:`Asistencia (7 días)`,description:`Porcentaje de asistencia del total de la institución en los últimos 7 días. Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%.`,color:`#f59e0b`},{icon:`bi-exclamation-triangle-fill`,title:`Alumnos con asistencia baja`,description:`Alumnos que en las últimas 4 semanas tuvieron menos del 70% de asistencia (mínimo 4 clases). Requieren atención prioritaria.`,color:`#ef4444`},{icon:`bi-grid-1x2`,title:`Acceso rápido`,description:`Los 4 cards al pie llevan directamente a Planificación, Seguimiento de alumnos, Evaluaciones y Reportes. Hacé clic para navegar.`,color:`#3b82f6`}]})})}var e_=50;function t_(e=new Date){let t=e.toISOString().split(`T`)[0],n=new Date(e);return n.setDate(n.getDate()-28),{desde:n.toISOString().split(`T`)[0],hasta:t}}function n_(e={}){return{id:e.alumno_id,nombre_completo:e.nombre_completo||``,instrumento_principal:e.instrumento_principal||``,asistencia:{total:Number(e.asistencia_total||0),presentes:Number(e.asistencia_presentes||0),rate:e.asistencia_rate==null?null:Number(e.asistencia_rate)},progreso:e.progreso_count>0?{count:Number(e.progreso_count||0),promedio:Number(e.progreso_promedio||0)}:null,observacionesCount:Number(e.observaciones_count||0),risk_reasons:Array.isArray(e.risk_reasons)?e.risk_reasons:[],en_riesgo:!!e.en_riesgo,risk_score:Number(e.risk_score||0),nivel_riesgo:e.nivel_riesgo||null}}async function r_({desde:e,hasta:n,limit:r=e_,offset:i=0,busqueda:a=``}={}){let o=e&&n?{desde:e,hasta:n}:t_(),{data:s,error:c}=await t.rpc(`analizar_seguimiento_alumnos`,{p_desde:o.desde,p_hasta:o.hasta,p_limit:r,p_offset:i,p_busqueda:a||null});if(c)throw console.error(`[fetchSeguimientoAlumnos]`,c),Error(`No se pudo cargar el seguimiento de alumnos`);let l=s||[];return{alumnos:l.map(n_),totalCount:Number(l[0]?.total_count||0),riskCount:Number(l[0]?.risk_count||0),limit:r,offset:i,desde:o.desde,hasta:o.hasta}}var J={alumnos:[],busqueda:``,container:null,totalCount:0,riskCount:0,limit:50,offset:0,desde:null,hasta:null,loading:!1};async function i_(e){if(e){J.container=e,e.innerHTML=u_();try{await a_(),s_()}catch(t){console.error(`[SeguimientoAlumnos]`,t),e.innerHTML=`<div class="page-container"><div class="alert alert-warning">${t.message}</div></div>`}}}async function a_(){J.loading=!0;let e=await r_({desde:J.desde,hasta:J.hasta,limit:J.limit,offset:J.offset,busqueda:J.busqueda});J.alumnos=e.alumnos,J.totalCount=e.totalCount,J.riskCount=e.riskCount,J.desde=e.desde,J.hasta=e.hasta,J.loading=!1}function o_(e){return J.alumnos.find(t=>t.id===e)?.risk_reasons||[]}function s_(){let e=J.alumnos,t=Math.floor(J.offset/J.limit)+1,n=Math.max(1,Math.ceil(J.totalCount/J.limit));J.container.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-person-lines-fill fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Seguimiento de Alumnos</h1>
          <p class="text-muted small mb-0">${J.totalCount} alumnos activos - ${J.riskCount} en riesgo - Pagina ${t}/${n}</p>
        </div>
        <button class="btn-help-trigger" id="btn-help-seguimiento" title="¿Cómo funciona esta pantalla?" aria-label="Ayuda">
          <i class="bi bi-question"></i>
        </button>
      </div>

      <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
        <div class="input-group" style="max-width:360px;">
          <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control border-start-0" id="busqueda-alumno"
                 placeholder="Buscar alumno o instrumento..." value="${J.busqueda}">
        </div>
        <span class="badge bg-body-secondary text-body-secondary">Periodo: ${J.desde} - ${J.hasta}</span>
      </div>

      ${J.riskCount?`
        <div class="alert alert-warning border-0 d-flex align-items-center gap-2 mb-3 py-2">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span style="font-size:0.85rem;"><strong>${J.riskCount}</strong> alumno${J.riskCount===1?``:`s`} requiere${J.riskCount===1?``:`n`} atencion</span>
        </div>`:``}

      <div class="d-flex flex-column gap-2" id="lista-alumnos">
        ${e.map(e=>c_(e)).join(``)||`<div class="text-center text-muted py-5">Sin resultados</div>`}
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <button class="btn btn-sm btn-outline-secondary" id="btn-prev-page" ${J.offset<=0?`disabled`:``}>
          <i class="bi bi-chevron-left me-1"></i>Anterior
        </button>
        <span class="text-muted small">Mostrando ${J.offset+1}-${Math.min(J.offset+J.alumnos.length,J.totalCount)} de ${J.totalCount}</span>
        <button class="btn btn-sm btn-outline-secondary" id="btn-next-page" ${J.offset+J.limit>=J.totalCount?`disabled`:``}>
          Siguiente<i class="bi bi-chevron-right ms-1"></i>
        </button>
      </div>
    </div>`,l_()}function c_(e){let t=o_(e.id),n=e.asistencia,r=e.progreso,i=e.observacionesCount||0,a=n?.rate==null?null:Math.round(n.rate*100),o=a===null?`secondary`:a>=80?`success`:a>=60?`warning`:`danger`,s=r?r.promedio>=7?`success`:r.promedio>=5?`warning`:`danger`:`secondary`;return`
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
            ${i?`<span><i class="bi bi-chat-quote me-1 text-muted"></i>${i} obs.</span>`:``}
          </div>
        </div>
        <i class="bi bi-chevron-right text-muted flex-shrink-0"></i>
      </div>
    </div>`}function l_(){J.container.querySelector(`#btn-help-seguimiento`)?.addEventListener(`click`,()=>{hr.open({title:`Seguimiento de Alumnos`,intro:`Vista unificada del estado académico de cada alumno. Los alumnos con riesgo aparecen primero, destacados con una barra lateral amarilla.`,sections:[{icon:`bi-search`,title:`Buscador`,description:`Filtrá por nombre del alumno o por instrumento en tiempo real.`,color:`#6b7280`},{icon:`bi-exclamation-triangle-fill`,title:`Alerta de riesgo`,description:`Aparece cuando hay alumnos que requieren atención. Muestra el total con algún indicador activo.`,color:`#f59e0b`},{icon:`bi-person-fill`,title:`Fila del alumno`,description:`Nombre, instrumento, % de asistencia (últimas 4 semanas) y promedio de las últimas 3 calificaciones. Barra amarilla izquierda = en riesgo.`,color:`#3b82f6`},{icon:`bi-tags-fill`,title:`Badges de riesgo`,description:`"Asistencia baja" < 70% en 4 semanas. "Nota baja" promedio < 6.0. "Observación" cuando hay observaciones de disciplina activas.`,color:`#ef4444`},{icon:`bi-window-sidebar`,title:`Panel de detalle`,description:`Clic en cualquier alumno → panel con asistencia reciente (20 clases), últimas calificaciones por clase y observaciones activas.`,color:`#10b981`}]})});let e;J.container.querySelector(`#busqueda-alumno`)?.addEventListener(`input`,t=>{J.busqueda=t.target.value,J.offset=0,clearTimeout(e),e=setTimeout(async()=>{J.container.innerHTML=u_(),await a_(),s_()},300)}),J.container.querySelector(`#btn-prev-page`)?.addEventListener(`click`,async()=>{J.offset=Math.max(0,J.offset-J.limit),J.container.innerHTML=u_(),await a_(),s_()}),J.container.querySelector(`#btn-next-page`)?.addEventListener(`click`,async()=>{J.offset+=J.limit,J.container.innerHTML=u_(),await a_(),s_()}),J.container.querySelectorAll(`.alumno-row`).forEach(e=>{e.addEventListener(`click`,()=>d_(e.dataset.id)),e.addEventListener(`mouseenter`,()=>{e.style.boxShadow=`0 4px 15px rgba(0,0,0,0.1)`}),e.addEventListener(`mouseleave`,()=>{e.style.boxShadow=``})})}function u_(){return`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
    <div class="spinner-border text-primary"></div>
  </div>`}async function d_(e){let n=J.alumnos.find(t=>t.id===e);if(!n)return;let[r,i,a,o]=await Promise.all([t.from(`asistencias`).select(`fecha, estado, clase_id`).eq(`alumno_id`,e).order(`fecha`,{ascending:!1}).limit(20),t.from(`progresos`).select(`*, clase:clases(nombre)`).eq(`alumno_id`,e).order(`fecha_evaluacion`,{ascending:!1}).limit(10),t.from(`observaciones_alumnos`).select(`*`).eq(`alumno_id`,e).order(`created_at`,{ascending:!1}).limit(5),t.from(`alumnos_clases`).select(`clase:clases(id, nombre, instrumento)`).eq(`alumno_id`,e)]),s=(o.data||[]).map(e=>e.clase).filter(Boolean),c=o_(e);_.open({title:n.nombre_completo,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="d-flex gap-2 flex-wrap mb-3">
        ${n.instrumento_principal?`<span class="badge bg-primary-subtle text-primary">${n.instrumento_principal}</span>`:``}
        ${c.map(e=>`<span class="badge bg-warning-subtle text-warning">${e===`asistencia`?`Asistencia baja`:e===`calificacion`?`Nota baja`:`Con observación`}</span>`).join(``)}
        ${s.map(e=>`<span class="badge bg-body-secondary text-body-secondary">${e.nombre}</span>`).join(``)}
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 bg-body-tertiary h-100">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-calendar-check me-1 text-success"></i>Asistencia reciente</div>
              <div style="max-height:160px;overflow-y:auto;">
                ${(r.data||[]).length?r.data.map(e=>`
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
                ${(i.data||[]).length?i.data.map(e=>`
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom" style="font-size:0.78rem;">
                    <span class="text-truncate me-2" style="max-width:140px;">${e.clase?.nombre||`Sin clase`}</span>
                    <span class="fw-semibold ${e.calificacion>=7?`text-success`:e.calificacion>=5?`text-warning`:`text-danger`}">${e.calificacion?.toFixed(1)??`–`}</span>
                  </div>`).join(``):`<p class="text-muted small mb-0">Sin calificaciones</p>`}
              </div>
            </div>
          </div>
        </div>

        ${(a.data||[]).length?`
        <div class="col-12">
          <div class="card border-0 bg-body-tertiary">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-chat-quote me-1 text-info"></i>Observaciones activas</div>
              ${a.data.map(e=>`
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
      </div>`})}async function f_(e){if(e){e.innerHTML=`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>`;try{let[t,n]=await Promise.all([p_(),m_()]);e.innerHTML=h_(t,n),e.querySelectorAll(`.btn-generar-pedagogico`).forEach(e=>{e.addEventListener(`click`,async t=>{t.preventDefault();let n=e.getAttribute(`data-clase-id`);e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;try{let{generateMonthlyPedagogical:e}=await d(async()=>{let{generateMonthlyPedagogical:e}=await import(`./reportService-UN38zrj6.js`);return{generateMonthlyPedagogical:e}},__vite__mapDeps([29,1,30,31])),t=new Date;await e(n,t.getFullYear(),t.getMonth()+1)}catch(e){console.error(`[reportesPedagogicos] Error:`,e)}finally{e.disabled=!1,e.innerHTML=`🎓 Generar`}})}),e.querySelector(`#btn-help-reportes`)?.addEventListener(`click`,()=>{hr.open({title:`Reportes Pedagógicos`,intro:`Vista agregada del rendimiento por clase y alumnos en riesgo. Útil para detectar patrones y tomar decisiones de intervención.`,sections:[{icon:`bi-table`,title:`Rendimiento por clase`,description:`Cada clase activa con: alumnos inscriptos, % asistencia (4 semanas), promedio de calificaciones y nivel de ocupación.`,color:`#3b82f6`},{icon:`bi-bar-chart-fill`,title:`Barra de ocupación`,description:`Verde < 70% ocupado. Amarillo 70-90%. Rojo > 90%. Detecta clases saturadas.`,color:`#10b981`},{icon:`bi-percent`,title:`Columna Asistencia`,description:`Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%. Basado en registros de las últimas 4 semanas.`,color:`#f59e0b`},{icon:`bi-star-half`,title:`Columna Prom. Nota`,description:`Promedio de calificaciones de la clase. Verde ≥ 7.0, amarillo ≥ 5.0, rojo < 5.0.`,color:`#6366f1`},{icon:`bi-exclamation-triangle-fill`,title:`Alumnos en riesgo`,description:`Asistencia < 70% en 4 semanas (mínimo 4 clases evaluadas). Ordenados de menor a mayor tasa.`,color:`#ef4444`}]})})}catch(t){console.error(`[ReportesPedagogicos]`,t),e.innerHTML=`<div class="page-container"><div class="alert alert-warning">${t.message}</div></div>`}}}async function p_(){let{data:e}=await t.from(`clases`).select(`id, nombre, instrumento, capacidad_maxima`).eq(`estado`,`activa`).order(`nombre`);if(!e?.length)return[];let n=e.map(e=>e.id),[r,i,a]=await Promise.all([t.from(`alumnos_clases`).select(`clase_id, alumno_id`).in(`clase_id`,n),t.from(`asistencias`).select(`clase_id, estado`).in(`clase_id`,n).gte(`fecha`,new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0]),t.from(`progresos`).select(`clase_id, calificacion`).in(`clase_id`,n).not(`calificacion`,`is`,null)]);return e.map(e=>{let t=(r.data||[]).filter(t=>t.clase_id===e.id),n=(i.data||[]).filter(t=>t.clase_id===e.id),o=(a.data||[]).filter(t=>t.clase_id===e.id),s=n.length>0?Math.round(n.filter(e=>e.estado===`P`).length/n.length*100):null,c=o.length>0?o.reduce((e,t)=>e+t.calificacion,0)/o.length:null,l=e.capacidad_maxima?Math.round(t.length/e.capacidad_maxima*100):null;return{...e,totalAlumnos:t.length,tasaAsist:s,promNotas:c,ocupacion:l}})}async function m_(){let e=new Date(Date.now()-672*60*60*1e3).toISOString().split(`T`)[0],{data:n}=await t.from(`asistencias`).select(`alumno_id, estado`).gte(`fecha`,e);if(!n?.length)return[];let r={};n.forEach(e=>{r[e.alumno_id]||(r[e.alumno_id]={total:0,presentes:0}),r[e.alumno_id].total++,e.estado===`P`&&r[e.alumno_id].presentes++});let i=Object.entries(r).filter(([,e])=>e.total>=4&&e.presentes/e.total<Xf.attendance_min_rate).map(([e,t])=>({id:e,rate:t.presentes/t.total,total:t.total}));if(!i.length)return[];let{data:a}=await t.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,i.map(e=>e.id));return(a||[]).map(e=>({...e,...i.find(t=>t.id===e.id)})).sort((e,t)=>e.rate-t.rate)}function h_(e,t){let n=e=>e===null?`secondary`:e>=80?`success`:e>=60?`warning`:`danger`,r=e=>e===null?`secondary`:e>=7?`success`:e>=5?`warning`:`danger`;return`
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
        Alumnos en riesgo — asistencia &lt; ${Math.round(Xf.attendance_min_rate*100)}% (4 semanas)
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
    </div>`}var Y={all:[],filtered:[],container:null};async function g_(e){e&&(Y.container=e,e.innerHTML=`
    <div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
      <div class="spinner-border text-primary"></div>
    </div>`,await __())}async function __(){try{let{data:e,error:n}=await t.from(`solicitudes_necesidades`).select(`*`).order(`created_at`,{ascending:!1});if(n)throw n;Y.all=e||[],Y.filtered=[...Y.all],v_()}catch(e){console.error(`[solicitudesAdmin]`,e),Y.container.innerHTML=`
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar solicitudes: ${e.message}</div>
      </div>`}}function v_(){Y.container.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
             style="width:42px;height:42px;">
          <i class="bi bi-envelope-paper fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Solicitudes de maestros</h1>
          <p class="text-muted small mb-0">Necesidades enviadas por los maestros</p>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 mb-4">
        <input type="text" class="form-control form-control-sm" id="sol-buscar"
               placeholder="Buscar por título o maestro..." style="max-width:260px;">
        <select class="form-select form-select-sm" id="sol-filtro-estado" style="max-width:160px;">
          <option value="">Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_revision">En revisión</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="resuelta">Resuelta</option>
        </select>
        <select class="form-select form-select-sm" id="sol-filtro-prioridad" style="max-width:140px;">
          <option value="">Prioridad</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <select class="form-select form-select-sm" id="sol-filtro-tipo" style="max-width:160px;">
          <option value="">Tipo</option>
          <option value="material">Material</option>
          <option value="pedagogico">Pedagógico</option>
          <option value="tecnico">Técnico</option>
          <option value="institucional">Institucional</option>
        </select>
        <button class="btn btn-sm btn-outline-secondary" id="sol-limpiar">
          <i class="bi bi-x-circle me-1"></i>Limpiar
        </button>
      </div>

      <div id="solicitudes-list"></div>
    </div>
  `,y_(),S_()}function y_(){let e=Y.container.querySelector(`#solicitudes-list`);if(!e)return;if(Y.filtered.length===0){e.innerHTML=`
      <div class="text-center py-5 text-muted">
        <i class="bi bi-envelope fs-1 d-block mb-2 opacity-50"></i>
        <p>No hay solicitudes de maestros registradas.</p>
      </div>`;return}let t={pendiente:`bg-warning-subtle text-warning-emphasis`,en_revision:`bg-info-subtle text-info-emphasis`,aprobada:`bg-success-subtle text-success-emphasis`,rechazada:`bg-danger-subtle text-danger-emphasis`,resuelta:`bg-secondary-subtle text-secondary-emphasis`},n={urgente:`danger`,alta:`warning`,media:`primary`,baja:`secondary`};e.innerHTML=Y.filtered.map(e=>`
    <div class="list-group-item list-group-item-action p-3 mb-2 border rounded solicitud-row"
         data-id="${e.id}" style="cursor:pointer;">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div class="flex-grow-1 overflow-hidden">
          <div class="fw-semibold text-truncate">${e.titulo}</div>
          <div class="small text-muted mt-1">
            <span class="me-2"><i class="bi bi-person me-1"></i>${e.maestro_nombre||`—`}</span>
            <span class="me-2">${e.tipo_necesidad||`—`}</span>
            ${e.area?`<span class="me-2">${e.area}</span>`:``}
            <span class="me-2 text-${n[e.prioridad]||`secondary`}">
              <i class="bi bi-flag me-1"></i>${e.prioridad}
            </span>
            <span><i class="bi bi-calendar3 me-1"></i>${e.fecha_solicitud||`—`}</span>
          </div>
        </div>
        <span class="badge flex-shrink-0 ${t[e.estado]||`bg-secondary-subtle text-secondary-emphasis`}">
          ${(e.estado||``).replace(`_`,` `)}
        </span>
      </div>
    </div>
  `).join(``)}function b_(){let e=g(Y.container.querySelector(`#sol-buscar`)?.value||``),t=Y.container.querySelector(`#sol-filtro-estado`)?.value||``,n=Y.container.querySelector(`#sol-filtro-prioridad`)?.value||``,r=Y.container.querySelector(`#sol-filtro-tipo`)?.value||``;Y.filtered=Y.all.filter(i=>!(e&&!g(`${i.titulo} ${i.maestro_nombre||``} ${i.area||``} ${i.descripcion}`).includes(e)||t&&i.estado!==t||n&&i.prioridad!==n||r&&i.tipo_necesidad!==r)),y_()}function x_(e){let n=Y.all.find(t=>t.id===e);if(!n)return;let r=[`pendiente`,`en_revision`,`aprobada`,`rechazada`,`resuelta`].map(e=>`<option value="${e}" ${n.estado===e?`selected`:``}>${e.replace(`_`,` `)}</option>`).join(``);_.open({title:`Detalle de solicitud`,size:`lg`,saveText:`Guardar cambios`,body:`
      <div class="small">
        <div class="row g-2 mb-3">
          <div class="col-md-8">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Título</div>
            <div class="fw-bold">${n.titulo}</div>
          </div>
          <div class="col-md-4">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Maestro</div>
            <div>${n.maestro_nombre||`—`}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Tipo</div>
            <div>${n.tipo_necesidad||`—`}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Categoría</div>
            <div>${n.categoria||`—`}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Área</div>
            <div>${n.area||`—`}</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Cantidad</div>
            <div>${n.cantidad??`—`}</div>
          </div>
          <div class="col-12">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Descripción</div>
            <p class="mb-0" style="white-space:pre-line;">${n.descripcion}</p>
          </div>
          ${n.observaciones?`
          <div class="col-12">
            <div class="text-muted fw-semibold mb-1" style="font-size:0.72rem;text-transform:uppercase;">Observaciones</div>
            <p class="mb-0" style="white-space:pre-line;">${n.observaciones}</p>
          </div>`:``}
        </div>
        <hr>
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label fw-semibold small">Estado</label>
            <select class="form-select form-select-sm" id="modal-sol-estado">${r}</select>
          </div>
          <div class="col-12">
            <label class="form-label fw-semibold small">Respuesta administrativa</label>
            <textarea class="form-control form-control-sm" id="modal-sol-respuesta" rows="3"
                      placeholder="Escribí la respuesta para el maestro...">${n.respuesta_admin||``}</textarea>
          </div>
        </div>
      </div>
    `,onSave:async()=>{let n=document.querySelector(`#modal-sol-estado`)?.value,r=document.querySelector(`#modal-sol-respuesta`)?.value?.trim()||null,{error:i}=await t.from(`solicitudes_necesidades`).update({estado:n,respuesta_admin:r,updated_at:new Date().toISOString()}).eq(`id`,e);return i?(c.error(`Error al guardar los cambios`),!1):(c.success(`Solicitud actualizada`),await __(),!0)}})}function S_(){let e=Y.container;e.querySelector(`#sol-buscar`)?.addEventListener(`input`,b_),e.querySelector(`#sol-filtro-estado`)?.addEventListener(`change`,b_),e.querySelector(`#sol-filtro-prioridad`)?.addEventListener(`change`,b_),e.querySelector(`#sol-filtro-tipo`)?.addEventListener(`change`,b_),e.querySelector(`#sol-limpiar`)?.addEventListener(`click`,()=>{[`#sol-buscar`,`#sol-filtro-estado`,`#sol-filtro-prioridad`,`#sol-filtro-tipo`].forEach(t=>{let n=e.querySelector(t);n&&(n.value=``)}),Y.filtered=[...Y.all],y_()}),e.addEventListener(`click`,e=>{let t=e.target.closest(`.solicitud-row[data-id]`);t&&x_(t.dataset.id)})}var C_=`seguimiento_reglas`;async function w_({tipo:e,activo:n}={}){let r=t.from(C_).select(`*`).order(`prioridad`).order(`nombre`);e!==void 0&&(r=r.eq(`tipo`,e)),n!==void 0&&(r=r.eq(`activo`,n));let{data:i,error:a}=await r;if(a)throw a;return i||[]}async function T_(e){let{data:n,error:r}=await t.from(C_).insert({...e,updated_at:new Date().toISOString()}).select().single();if(r)throw r;return n}async function E_(e,n){let{data:r,error:i}=await t.from(C_).update({...n,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(i)throw i;return r}async function D_(e,t){return E_(e,{activo:t})}var O_=[{nombre:`Asistencia irregular mensual`,tipo:`asistencia_irregular`,descripcion:`Detecta alumnos con ausencias injustificadas dentro del mes.`,config:{periodo:`mensual`,leve:2,medio:3,alto:4,critico:5,contar_justificadas:!1},activo:!0,prioridad:1},{nombre:`Tardanzas recurrentes`,tipo:`tardanzas_recurrentes`,descripcion:`Detecta alumnos con múltiples tardanzas dentro del mes.`,config:{periodo:`mensual`,leve:3,medio:5,alto:7,critico:10},activo:!0,prioridad:2},{nombre:`Observaciones marcadas para seguimiento`,tipo:`observacion_requiere_seguimiento`,descripcion:`Detecta observaciones de maestros que requieren seguimiento institucional.`,config:{prioridades:[`alta`,`urgente`],solo_pendientes:!0},activo:!0,prioridad:3},{nombre:`Justificaciones pendientes de revisión`,tipo:`justificaciones_pendientes`,descripcion:`Detecta justificaciones sin revisar o acumuladas.`,config:{max_pendientes:2,nivel:`medio`},activo:!0,prioridad:4}];async function k_(){let e=await w_({}),n=new Set(e.map(e=>e.tipo)),r=O_.filter(e=>!n.has(e.tipo));if(r.length===0)return{inserted:0};let{error:i}=await t.from(C_).insert(r);if(i)throw i;return{inserted:r.length}}async function A_(e){return(await w_({tipo:e,activo:!0}))[0]||null}var j_=[`bajo`,`medio`,`alto`,`critico`],M_={bajo:1,medio:2,alto:3,critico:4};function N_(){let e=new Date;return[new Date(e.getFullYear(),e.getMonth(),1).toISOString().slice(0,10),new Date(e.getFullYear(),e.getMonth()+1,0).toISOString().slice(0,10)]}function P_(e,t){return t?e>=(t.critico??1/0)?`critico`:e>=(t.alto??1/0)?`alto`:e>=(t.medio??1/0)?`medio`:e>=(t.leve??1/0)?`bajo`:null:null}async function F_(e,n={}){let[r,i]=n.from&&n.to?[n.from,n.to]:N_(),a=await A_(`asistencia_irregular`);if(!a)return null;let{data:o,error:s}=await t.from(`asistencias`).select(`estado, fecha`).eq(`alumno_id`,e).gte(`fecha`,r).lte(`fecha`,i);s&&console.error(`[detectAttendanceRisk]`,s);let c=(o||[]).filter(e=>e.estado===`A`).length,l=(o||[]).filter(e=>e.estado===`J`).length,u=a.config?.contar_justificadas,d=u?c+l:c;return{tipo:`asistencia_irregular`,count:d,level:P_(d,a.config),razon:d>0?`${d} ausencia${d===1?``:`s`}${u?``:` injustificada`+(d===1?``:`s`)} este mes`:null}}async function I_(e,n={}){let[r,i]=n.from&&n.to?[n.from,n.to]:N_(),a=await A_(`tardanzas_recurrentes`);if(!a)return null;let{data:o,error:s}=await t.from(`asistencias`).select(`estado, fecha`).eq(`alumno_id`,e).gte(`fecha`,r).lte(`fecha`,i);s&&console.error(`[detectTardinessRisk]`,s);let c=(o||[]).filter(e=>e.estado===`T`).length;return{tipo:`tardanzas_recurrentes`,count:c,level:P_(c,a.config),razon:c>0?`${c} tardanza${c===1?``:`s`} este mes`:null}}async function L_(e,n={}){let r=await A_(`observacion_requiere_seguimiento`);if(!r)return null;let i=t.from(`observaciones_alumnos`).select(`id, prioridad, estado, requiere_seguimiento, observacion`).eq(`alumno_id`,e).eq(`requiere_seguimiento`,!0);r.config?.solo_pendientes&&(i=i.in(`estado`,[`pendiente`,`abierta`]));let{data:a}=await i,o=(a||[]).filter(e=>r.config?.prioridades?.length?r.config.prioridades.includes(e.prioridad):!0),s=null;return o.length===1?s=`bajo`:o.length===2?s=`medio`:o.length>=3&&(s=`alto`),{tipo:`observacion_requiere_seguimiento`,count:o.length,level:s,razon:o.length>0?`${o.length} observación${o.length===1?``:`es`} pendiente${o.length===1?``:`s`} marcadas para seguimiento`:null}}async function R_(e,n={}){let r=await A_(`justificaciones_pendientes`);if(!r)return null;let{data:i}=await t.from(`justificaciones`).select(`id, estado`).eq(`alumno_id`,e).eq(`estado`,`pendiente`),a=(i||[]).length,o=r.config?.max_pendientes??2;return{tipo:`justificaciones_pendientes`,count:a,level:a>=o?r.config?.nivel||`medio`:null,razon:a>=o?`${a} justificación${a===1?``:`es`} sin revisar`:null}}async function z_(e,n={}){let{data:r,error:i}=await t.from(`generated_documents`).select(`id, tipo`).eq(`alumno_id`,e).in(`estado`,[`generado`,`archivado`]);return i&&console.error(`[detectDocumentHistoryRisk]`,i),{tipo:`historial_documental`,count:(r||[]).length,level:null,razon:null}}function B_(e){let t=e.map(e=>e?.level).filter(Boolean);return t.length===0?null:j_[Math.max(...t.map(e=>M_[e]||0))-1]||null}function V_(e){return{bajo:`Contactar al representante de manera preventiva.`,medio:`Generar carta institucional y contactar representante.`,alto:`Solicitar reunión formal con el representante.`,critico:`Convocar reunión urgente con directiva y evaluar escalamiento.`}[e]||null}async function H_(e,n={}){let{data:r}=await t.from(`alumnos`).select(`id, nombre_completo`).eq(`id`,e).single(),[i,a,o,s,c]=await Promise.all([F_(e,n.period),I_(e,n.period),L_(e,n.period),R_(e,n.period),z_(e,n.period)]),l=[i,a,o,s].filter(Boolean),u=B_(l),d=l.map(e=>e?.razon).filter(Boolean),f=l.reduce((e,t)=>e+(M_[t?.level]||0)*20,0);return{alumnoId:e,alumnoNombre:r?.nombre_completo||``,nivelRiesgo:u,score:f,razones:d,evidencia:{ausenciasInjustificadas:i?.count||0,tardanzas:a?.count||0,justificacionesPendientes:s?.count||0,observacionesSeguimiento:o?.count||0,cartasPrevias:c?.count||0},accionSugerida:V_(u)}}async function U_(e={}){let{data:n,error:r}=await t.from(`alumnos`).select(`id, nombre_completo`).eq(`activo`,!0);if(r)throw console.error(`[analyzeAllStudentsRisk] Error fetching active students:`,r),Error(`No se pudieron obtener los alumnos activos`);let i=n||[];if(i.length===0)return[];let a=i.map(e=>e.id),[o,s]=e.period?.from&&e.period?.to?[e.period.from,e.period.to]:N_(),[c,l,u,d]=await Promise.all([A_(`asistencia_irregular`),A_(`tardanzas_recurrentes`),A_(`observacion_requiere_seguimiento`),A_(`justificaciones_pendientes`)]),[f,p,m,h]=await Promise.all([t.from(`asistencias`).select(`alumno_id, estado, fecha`).in(`alumno_id`,a).gte(`fecha`,o).lte(`fecha`,s),t.from(`observaciones_alumnos`).select(`id, alumno_id, prioridad, estado, requiere_seguimiento, observacion, tipo`).in(`alumno_id`,a).eq(`requiere_seguimiento`,!0),t.from(`justificaciones`).select(`id, alumno_id, estado`).in(`alumno_id`,a).eq(`estado`,`pendiente`),t.from(`generated_documents`).select(`id, alumno_id, tipo`).in(`alumno_id`,a).in(`estado`,[`generado`,`archivado`])]),g={},ee={},te={},ne={};a.forEach(e=>{g[e]=[],ee[e]=[],te[e]=[],ne[e]=[]}),(f.data||[]).forEach(e=>{g[e.alumno_id]&&g[e.alumno_id].push(e)}),(p.data||[]).forEach(e=>{ee[e.alumno_id]&&ee[e.alumno_id].push(e)}),(m.data||[]).forEach(e=>{te[e.alumno_id]&&te[e.alumno_id].push(e)}),(h.data||[]).forEach(e=>{ne[e.alumno_id]&&ne[e.alumno_id].push(e)});let re=[];return i.forEach(e=>{let t=e.id,n=null;if(c){let e=g[t]||[],r=e.filter(e=>e.estado===`A`).length,i=e.filter(e=>e.estado===`J`).length,a=c.config?.contar_justificadas,o=a?r+i:r;n={tipo:`asistencia_irregular`,count:o,level:P_(o,c.config),razon:o>0?`${o} ausencia${o===1?``:`s`}${a?``:` injustificada`+(o===1?``:`s`)} este mes`:null}}let r=null;if(l){let e=(g[t]||[]).filter(e=>e.estado===`T`).length;r={tipo:`tardanzas_recurrentes`,count:e,level:P_(e,l.config),razon:e>0?`${e} tardanza${e===1?``:`s`} este mes`:null}}let i=null;if(u){let e=ee[t]||[];u.config?.solo_pendientes&&(e=e.filter(e=>[`pendiente`,`abierta`].includes(e.estado)));let n=e.filter(e=>u.config?.prioridades?.length?u.config.prioridades.includes(e.prioridad):!0),r=null;n.length===1?r=`bajo`:n.length===2?r=`medio`:n.length>=3&&(r=`alto`),i={tipo:`observacion_requiere_seguimiento`,count:n.length,level:r,razon:n.length>0?`${n.length} observación${n.length===1?``:`es`} pendiente${n.length===1?``:`s`} marcadas para seguimiento`:null}}let a=null;if(d){let e=(te[t]||[]).length,n=d.config?.max_pendientes??2;a={tipo:`justificaciones_pendientes`,count:e,level:e>=n?d.config?.nivel||`medio`:null,razon:e>=n?`${e} justificación${e===1?``:`es`} sin revisar`:null}}let o={tipo:`historial_documental`,count:(ne[t]||[]).length,level:null,razon:null},s=[n,r,i,a].filter(Boolean),f=B_(s),p=s.map(e=>e?.razon).filter(Boolean),m=s.reduce((e,t)=>e+(M_[t?.level]||0)*20,0);f&&re.push({alumnoId:t,alumnoNombre:e.nombre_completo||``,nivelRiesgo:f,score:m,razones:p,evidencia:{ausenciasInjustificadas:n?.count||0,tardanzas:r?.count||0,justificacionesPendientes:a?.count||0,observacionesSeguimiento:i?.count||0,cartasPrevias:o?.count||0},accionSugerida:V_(f)})}),re.sort((e,t)=>t.score-e.score),re}async function W_(e){if(!e?.nivelRiesgo)return null;let n={alumno_id:e.alumnoId,alumno_nombre:e.alumnoNombre,tipo:`riesgo_combinado`,nivel_riesgo:e.nivelRiesgo,titulo:`Riesgo ${e.nivelRiesgo} detectado — ${e.alumnoNombre}`,descripcion:e.razones.join(` · `),evidencia:e.evidencia,estado:`pendiente`},{data:r,error:i}=await t.from(`student_case_alerts`).insert(n).select().single();if(i)throw i;return r}var X={container:null,cases:[],alerts:[],kpis:null,filtered:[],filterEstado:``,filterRiesgo:``,filterBuscar:``};async function G_(e){e&&(X.container=e,e.innerHTML=`
    <div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
      <div class="spinner-border text-primary"></div>
    </div>`,await K_())}async function K_(){try{let[e,t,n]=await Promise.all([Cp({limit:200}),Pp({limit:50,estado:`pendiente`}),Lp()]);X.cases=e,X.alerts=t,X.kpis=n,X.filtered=[...e],$_(),Y_()}catch(e){console.error(`[seguimientoInstitucional]`,e);let t=String(e?.message||``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);X.container.innerHTML=`<div class="page-container"><div class="alert alert-warning">Error: ${t}</div></div>`}}var q_={bajo:`bg-info-subtle text-info-emphasis`,medio:`bg-warning-subtle text-warning-emphasis`,alto:`bg-warning text-dark`,critico:`bg-danger text-white`},J_={abierto:`bg-primary-subtle text-primary-emphasis`,en_seguimiento:`bg-warning-subtle text-warning-emphasis`,resuelto:`bg-success-subtle text-success-emphasis`,escalado:`bg-danger-subtle text-danger-emphasis`,archivado:`bg-secondary-subtle text-secondary-emphasis`};function Y_(){let e=X.kpis||{};X.container.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-shield-check fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Seguimiento Institucional</h1>
          <p class="text-muted small mb-0">Alertas, casos y acciones institucionales</p>
        </div>
      </div>

      <div class="row g-3 mb-4">
        ${X_(`bi-bell`,`Alertas pendientes`,e.alertasPendientes??0,`warning`)}
        ${X_(`bi-folder2-open`,`Casos abiertos`,e.casosAbiertos??0,`primary`)}
        ${X_(`bi-arrow-right-circle`,`En seguimiento`,e.casosEnSeguimiento??0,`info`)}
        ${X_(`bi-exclamation-octagon`,`Casos críticos`,e.casosCriticos??0,`danger`)}
        ${X_(`bi-calendar-x`,`Acciones vencidas`,e.proximasAccionesVencidas??0,`warning`)}
        ${X_(`bi-file-earmark-text`,`Cartas este mes`,e.cartasEsteMes??0,`success`)}
      </div>

      <div class="d-flex flex-wrap gap-2 mb-4">
        <button class="btn btn-sm btn-primary" id="btn-analizar-riesgos"><i class="bi bi-search me-1"></i>Analizar riesgos</button>
        <button class="btn btn-sm btn-outline-primary" id="btn-nuevo-caso"><i class="bi bi-plus-lg me-1"></i>Nuevo caso manual</button>
        <button class="btn btn-sm btn-outline-secondary" id="btn-configurar-reglas"><i class="bi bi-sliders me-1"></i>Configurar reglas</button>
      </div>

      ${X.alerts.length>0?`
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-warning-subtle d-flex align-items-center gap-2">
            <i class="bi bi-bell-fill text-warning"></i>
            <span class="fw-semibold">Alertas pendientes (${X.alerts.length})</span>
          </div>
          <div class="card-body p-0">
            ${X.alerts.map(Z_).join(``)}
          </div>
        </div>`:``}

      <div class="d-flex flex-wrap gap-2 mb-3">
        <input type="text" class="form-control form-control-sm" id="filtro-buscar"
               placeholder="Buscar por alumno o título..." style="max-width:260px;"
               value="${X.filterBuscar}">
        <select class="form-select form-select-sm" id="filtro-estado" style="max-width:160px;">
          <option value="">Estado</option>
          <option value="abierto"        ${X.filterEstado===`abierto`?`selected`:``}>Abierto</option>
          <option value="en_seguimiento" ${X.filterEstado===`en_seguimiento`?`selected`:``}>En seguimiento</option>
          <option value="resuelto"       ${X.filterEstado===`resuelto`?`selected`:``}>Resuelto</option>
          <option value="escalado"       ${X.filterEstado===`escalado`?`selected`:``}>Escalado</option>
          <option value="archivado"      ${X.filterEstado===`archivado`?`selected`:``}>Archivado</option>
        </select>
        <select class="form-select form-select-sm" id="filtro-riesgo" style="max-width:140px;">
          <option value="">Nivel de riesgo</option>
          <option value="bajo"    ${X.filterRiesgo===`bajo`?`selected`:``}>Bajo</option>
          <option value="medio"   ${X.filterRiesgo===`medio`?`selected`:``}>Medio</option>
          <option value="alto"    ${X.filterRiesgo===`alto`?`selected`:``}>Alto</option>
          <option value="critico" ${X.filterRiesgo===`critico`?`selected`:``}>Crítico</option>
        </select>
        <button class="btn btn-sm btn-outline-secondary" id="btn-limpiar-filtros">
          <i class="bi bi-x-circle me-1"></i>Limpiar
        </button>
      </div>

      <h6 class="fw-semibold mb-2">Casos (${X.filtered.length})</h6>
      <div id="cases-list">
        ${X.filtered.length===0?`
          <div class="text-center py-5 text-muted">
            <i class="bi bi-folder fs-1 d-block mb-2 opacity-40"></i>
            <p>No hay casos con los filtros seleccionados.</p>
          </div>`:X.filtered.map(Q_).join(``)}
      </div>
    </div>`,ev()}function X_(e,t,n,r){return`
    <div class="col-6 col-md-2">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-3">
          <div class="d-flex align-items-center gap-2 mb-1">
            <i class="bi ${e} text-${r}" style="font-size:1rem;"></i>
            <span class="text-muted" style="font-size:0.7rem;">${t}</span>
          </div>
          <div class="fw-bold" style="font-size:1.5rem;line-height:1;">${n}</div>
        </div>
      </div>
    </div>`}function Z_(e){return`
    <div class="d-flex align-items-start gap-3 px-3 py-2 border-bottom" data-alert-id="${e.id}">
      <span class="badge ${q_[e.nivel_riesgo]} flex-shrink-0">${e.nivel_riesgo}</span>
      <div class="flex-grow-1 overflow-hidden">
        <div class="fw-semibold small text-truncate">${e.titulo}</div>
        ${e.descripcion?`<div class="small text-muted text-truncate">${e.descripcion}</div>`:``}
      </div>
      <div class="d-flex gap-1 flex-shrink-0">
        <button class="btn btn-sm btn-success btn-alert-create-case" data-alert-id="${e.id}" title="Crear caso"><i class="bi bi-plus-circle"></i></button>
        <button class="btn btn-sm btn-outline-secondary btn-alert-review" data-alert-id="${e.id}" title="Marcar revisada"><i class="bi bi-check"></i></button>
        <button class="btn btn-sm btn-outline-secondary btn-alert-discard" data-alert-id="${e.id}" title="Descartar"><i class="bi bi-x"></i></button>
      </div>
    </div>`}function Q_(e){return`
    <div class="card border-0 shadow-sm mb-2 case-row" data-case-id="${e.id}" style="cursor:pointer;">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold small text-truncate">${e.titulo}</div>
            <div class="text-muted" style="font-size:0.72rem;">
              <span class="me-2"><i class="bi bi-person me-1"></i>${e.alumno_nombre||`—`}</span>
              <span class="me-2">${(e.tipo||``).replace(/_/g,` `)}</span>
              ${e.proxima_accion?`<span class="me-2"><i class="bi bi-arrow-right me-1"></i>${e.proxima_accion}${e.proxima_accion_fecha?` (${e.proxima_accion_fecha})`:``}</span>`:``}
              <span><i class="bi bi-calendar3 me-1"></i>${e.fecha_apertura||`—`}</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="badge ${q_[e.nivel_riesgo]||``}">${e.nivel_riesgo}</span>
            <span class="badge ${J_[e.estado]||``}">${(e.estado||``).replace(/_/g,` `)}</span>
          </div>
        </div>
      </div>
    </div>`}function $_(){let e=g(X.filterBuscar);X.filtered=X.cases.filter(t=>!(X.filterEstado&&t.estado!==X.filterEstado||X.filterRiesgo&&t.nivel_riesgo!==X.filterRiesgo||e&&!g(`${t.titulo} ${t.alumno_nombre||``} ${t.descripcion||``}`).includes(e)))}function ev(){let e=X.container;e.querySelector(`#btn-analizar-riesgos`)?.addEventListener(`click`,tv),e.querySelector(`#btn-nuevo-caso`)?.addEventListener(`click`,nv),e.querySelector(`#btn-configurar-reglas`)?.addEventListener(`click`,()=>f.navigate(`pedagogico-seguimiento-reglas`)),e.querySelector(`#filtro-buscar`)?.addEventListener(`input`,t=>{X.filterBuscar=t.target.value,$_();let n=e.querySelector(`#cases-list`);n&&(n.innerHTML=X.filtered.length===0?`<div class="text-center py-5 text-muted"><i class="bi bi-folder fs-1 d-block mb-2 opacity-40"></i><p>No hay casos con los filtros seleccionados.</p></div>`:X.filtered.map(Q_).join(``)),n?.querySelectorAll(`.case-row`).forEach(e=>{e.addEventListener(`click`,()=>f.navigate(`pedagogico-caso?id=${e.dataset.caseId}`))})}),e.querySelector(`#filtro-estado`)?.addEventListener(`change`,e=>{X.filterEstado=e.target.value,$_(),Y_()}),e.querySelector(`#filtro-riesgo`)?.addEventListener(`change`,e=>{X.filterRiesgo=e.target.value,$_(),Y_()}),e.querySelector(`#btn-limpiar-filtros`)?.addEventListener(`click`,()=>{X.filterBuscar=``,X.filterEstado=``,X.filterRiesgo=``,$_(),Y_()}),e.querySelectorAll(`.btn-alert-create-case`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.dataset.alertId;try{let e=await Ep(n);f.navigate(`pedagogico-caso?id=${e.id}`)}catch(e){alert(`Error: ${e.message}`)}})}),e.querySelectorAll(`.btn-alert-review`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation(),await Fp(e.dataset.alertId),await K_()})}),e.querySelectorAll(`.btn-alert-discard`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation(),await Ip(e.dataset.alertId),await K_()})}),e.querySelectorAll(`.case-row`).forEach(e=>{e.addEventListener(`click`,()=>f.navigate(`pedagogico-caso?id=${e.dataset.caseId}`))})}async function tv(){let e=X.container.querySelector(`#btn-analizar-riesgos`);e&&(e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Analizando...`);try{let e=await U_(),t=0;for(let n of e)n.nivelRiesgo&&(await W_(n),t++);alert(`Análisis completado. ${t} alerta(s) generada(s).`),await K_()}catch(e){alert(`Error en el análisis: ${e.message}`)}finally{e&&(e.disabled=!1,e.innerHTML=`<i class="bi bi-search me-1"></i>Analizar riesgos`)}}async function nv(){let{data:e}=await t.from(`alumnos`).select(`id, nombre_completo`).eq(`activo`,!0).order(`nombre_completo`);_.open({title:`Nuevo caso institucional`,size:`lg`,saveText:`Crear caso`,body:`
      <form id="form-nuevo-caso">
        <div class="row g-2">
          <div class="col-12">
            <label class="form-label small fw-semibold">Alumno *</label>
            <select class="form-select form-select-sm" id="nc-alumno" required>
              <option value="">Seleccioná un alumno...</option>
              ${(e||[]).map(e=>`<option value="${e.id}" data-nombre="${e.nombre_completo}">${e.nombre_completo}</option>`).join(``)}
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-semibold">Tipo de caso *</label>
            <select class="form-select form-select-sm" id="nc-tipo" required>
              <option value="seguimiento_pedagogico">Seguimiento pedagógico</option>
              <option value="asistencia_irregular">Asistencia irregular</option>
              <option value="tardanzas">Tardanzas</option>
              <option value="conducta">Conducta</option>
              <option value="situacion_familiar">Situación familiar</option>
              <option value="instrumento">Instrumento</option>
              <option value="compromiso">Compromiso</option>
              <option value="documentacion">Documentación</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-semibold">Nivel de riesgo</label>
            <select class="form-select form-select-sm" id="nc-riesgo">
              <option value="bajo" selected>Bajo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold">Título *</label>
            <input type="text" class="form-control form-control-sm" id="nc-titulo" required maxlength="160" placeholder="Ej: Ausencias reiteradas - mes de junio">
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold">Descripción</label>
            <textarea class="form-control form-control-sm" id="nc-descripcion" rows="3"></textarea>
          </div>
        </div>
      </form>
    `,onSave:async()=>{let e=document.querySelector(`#nc-alumno`),t=e?.value,n=e?.selectedOptions[0]?.dataset.nombre,r=document.querySelector(`#nc-tipo`)?.value,i=document.querySelector(`#nc-riesgo`)?.value,a=document.querySelector(`#nc-titulo`)?.value?.trim(),o=document.querySelector(`#nc-descripcion`)?.value?.trim()||null;if(!t||!r||!a)return alert(`Completá alumno, tipo y título.`),!1;try{let e=await Tp({alumno_id:t,alumno_nombre:n,tipo:r,titulo:a,descripcion:o,nivel_riesgo:i,origen:`manual`});return f.navigate(`pedagogico-caso?id=${e.id}`),!0}catch(e){return alert(`Error: ${e.message}`),!1}}})}var rv=`student_case_actions`,iv=`student_case_events`,av=`student_cases`;async function ov(e,n,r,{descripcion:i=``,metadata:a={}}={}){await t.from(iv).insert({case_id:e,tipo:n,titulo:r,descripcion:i,metadata:a})}async function sv(e,{proximaAccion:n,proximaAccionFecha:r}={}){let i={ultimo_contacto_en:new Date().toISOString(),updated_at:new Date().toISOString()};n!==void 0&&(i.proxima_accion=n),r!==void 0&&(i.proxima_accion_fecha=r),await t.from(av).update(i).eq(`id`,e)}async function cv(e,{tipo:n}={}){let r=t.from(rv).select(`*`).eq(`case_id`,e).order(`fecha_accion`,{ascending:!1});n&&(r=r.eq(`tipo`,n));let{data:i,error:a}=await r;if(a)throw a;return i||[]}async function lv(e,n){let r={case_id:e,alumno_id:n.alumno_id||null,fecha_accion:n.fecha_accion||new Date().toISOString(),...n},{data:i,error:a}=await t.from(rv).insert(r).select().single();if(a)throw a;return await ov(e,`accion_registrada`,i.titulo,{descripcion:i.descripcion||``,metadata:{action_id:i.id,tipo:i.tipo}}),await sv(e,{proximaAccion:i.proxima_accion,proximaAccionFecha:i.proxima_accion_fecha}),i}async function uv(e,t){return lv(e,{...t,tipo:`llamada_representante`,titulo:t.titulo||`Llamada a ${t.persona_contactada||`representante`}`})}async function dv(e,t){return lv(e,{...t,tipo:`reunion_representante`,titulo:t.titulo||`Reunión con representante`})}async function fv(e,t){return lv(e,{...t,tipo:`acuerdo_compromiso`,titulo:t.titulo||`Acuerdo registrado`})}async function pv(e,t,n={}){return lv(e,{...n,tipo:`carta_generada`,titulo:n.titulo||`Documento generado`,documento_id:t})}async function mv(e,t){return lv(e,{...t,tipo:`nota_interna`,titulo:t.titulo||`Nota interna`})}function hv(e,t,n){let r=gv[e];r&&_.open({title:r.title,size:`lg`,saveText:r.saveText,body:r.body(t),onSave:async()=>{let e=r.collect();if(r.requiredKeys.some(t=>!e[t]||String(e[t]).trim()===``))return alert(`Completá los campos requeridos: ${r.requiredKeys.join(`, `)}`),!1;try{return await r.save(t.id,e),n?.(),!0}catch(e){return alert(`Error: ${e.message}`),!1}}})}var gv={llamada:{title:`Registrar llamada`,saveText:`Registrar`,requiredKeys:[`persona_contactada`,`resultado`],body:()=>`
      <div class="row g-2 small">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha y hora</label>
          <input type="datetime-local" class="form-control form-control-sm" id="cma-fecha" value="${new Date().toISOString().slice(0,16)}">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Teléfono usado</label>
          <input type="text" class="form-control form-control-sm" id="cma-telefono">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Persona contactada *</label>
          <input type="text" class="form-control form-control-sm" id="cma-persona" placeholder="Ej: Madre del alumno">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Resultado *</label>
          <select class="form-select form-select-sm" id="cma-resultado">
            <option value="">Seleccioná...</option>
            <option value="contactado_exitoso">Contactado exitoso</option>
            <option value="no_contesto">No contestó</option>
            <option value="numero_incorrecto">Número incorrecto</option>
            <option value="apagado">Apagado / Fuera de servicio</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Resumen</label>
          <textarea class="form-control form-control-sm" id="cma-descripcion" rows="3"></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="cma-proxima">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha próxima acción</label>
          <input type="date" class="form-control form-control-sm" id="cma-proxima-fecha">
        </div>
      </div>`,collect:()=>({fecha_accion:document.querySelector(`#cma-fecha`)?.value?new Date(document.querySelector(`#cma-fecha`).value).toISOString():void 0,persona_contactada:document.querySelector(`#cma-persona`)?.value?.trim(),resultado:document.querySelector(`#cma-resultado`)?.value,descripcion:document.querySelector(`#cma-descripcion`)?.value?.trim()||null,proxima_accion:document.querySelector(`#cma-proxima`)?.value?.trim()||null,proxima_accion_fecha:document.querySelector(`#cma-proxima-fecha`)?.value||null}),save:(e,t)=>uv(e,t)},reunion:{title:`Registrar reunión`,saveText:`Registrar`,requiredKeys:[`titulo`],body:()=>`
      <div class="row g-2 small">
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha de reunión</label>
          <input type="datetime-local" class="form-control form-control-sm" id="cmr-fecha" value="${new Date().toISOString().slice(0,16)}">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Participantes</label>
          <input type="text" class="form-control form-control-sm" id="cmr-participantes" placeholder="Ej: Madre, coordinación, maestro">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Motivo / Título *</label>
          <input type="text" class="form-control form-control-sm" id="cmr-titulo">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Acuerdos</label>
          <textarea class="form-control form-control-sm" id="cmr-descripcion" rows="3"></textarea>
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Resultado / Conclusiones</label>
          <textarea class="form-control form-control-sm" id="cmr-resultado" rows="2"></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Próxima acción</label>
          <input type="text" class="form-control form-control-sm" id="cmr-proxima">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha de seguimiento</label>
          <input type="date" class="form-control form-control-sm" id="cmr-proxima-fecha">
        </div>
      </div>`,collect:()=>({fecha_accion:document.querySelector(`#cmr-fecha`)?.value?new Date(document.querySelector(`#cmr-fecha`).value).toISOString():void 0,titulo:document.querySelector(`#cmr-titulo`)?.value?.trim()||`Reunión`,descripcion:[document.querySelector(`#cmr-participantes`)?.value?`Participantes: ${document.querySelector(`#cmr-participantes`).value}`:``,document.querySelector(`#cmr-descripcion`)?.value||``].filter(Boolean).join(`
`),resultado:document.querySelector(`#cmr-resultado`)?.value?.trim()||null,proxima_accion:document.querySelector(`#cmr-proxima`)?.value?.trim()||null,proxima_accion_fecha:document.querySelector(`#cmr-proxima-fecha`)?.value||null}),save:(e,t)=>dv(e,t)},acuerdo:{title:`Registrar acuerdo`,saveText:`Registrar`,requiredKeys:[`titulo`,`descripcion`],body:()=>`
      <div class="row g-2 small">
        <div class="col-12">
          <label class="form-label fw-semibold">Tipo de acuerdo / Título *</label>
          <input type="text" class="form-control form-control-sm" id="cmac-titulo">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Descripción del acuerdo *</label>
          <textarea class="form-control form-control-sm" id="cmac-descripcion" rows="4"></textarea>
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Responsable</label>
          <input type="text" class="form-control form-control-sm" id="cmac-responsable">
        </div>
        <div class="col-md-6">
          <label class="form-label fw-semibold">Fecha límite</label>
          <input type="date" class="form-control form-control-sm" id="cmac-fecha-limite">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Observaciones</label>
          <textarea class="form-control form-control-sm" id="cmac-observaciones" rows="2"></textarea>
        </div>
      </div>`,collect:()=>({titulo:document.querySelector(`#cmac-titulo`)?.value?.trim(),descripcion:document.querySelector(`#cmac-descripcion`)?.value?.trim(),resultado:[document.querySelector(`#cmac-responsable`)?.value?`Responsable: ${document.querySelector(`#cmac-responsable`).value}`:``,document.querySelector(`#cmac-observaciones`)?.value||``].filter(Boolean).join(`
`)||null,proxima_accion_fecha:document.querySelector(`#cmac-fecha-limite`)?.value||null}),save:(e,t)=>fv(e,t)},nota:{title:`Agregar nota interna`,saveText:`Guardar`,requiredKeys:[`descripcion`],body:()=>`
      <div class="row g-2 small">
        <div class="col-12">
          <label class="form-label fw-semibold">Título</label>
          <input type="text" class="form-control form-control-sm" id="cmn-titulo" value="Nota interna" maxlength="160">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Contenido *</label>
          <textarea class="form-control form-control-sm" id="cmn-descripcion" rows="5"></textarea>
        </div>
      </div>`,collect:()=>({titulo:document.querySelector(`#cmn-titulo`)?.value?.trim()||`Nota interna`,descripcion:document.querySelector(`#cmn-descripcion`)?.value?.trim()}),save:(e,t)=>mv(e,t)}},_v={bajo:[`amonestacion_leve`,`carta_representante`],medio:[`amonestacion_moderada`,`carta_institucional`],alto:[`amonestacion_grave`,`solicitud_reunion_representante`],critico:[`llamado_formal_directiva`,`solicitud_devolucion_instrumento`,`acta_compromiso`]};async function vv(e,t,n){if(!e.alumno_id){alert(`Este caso no tiene alumno asociado.`);return}let r=await ce(),i=_v[e.nivel_riesgo]||[],a=r.filter(e=>e.estado===`activa`);_.open({title:`Generar carta desde el caso`,size:`lg`,hideSave:!0,cancelText:`Cerrar`,body:`
      <div class="small">
        <div class="alert alert-info py-2 mb-3">
          <i class="bi bi-info-circle me-1"></i>
          Sugerencia según nivel de riesgo <strong>${e.nivel_riesgo}</strong>:
          ${i.length>0?i.map(e=>e.replace(/_/g,` `)).join(`, `):`sin sugerencia específica`}.
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Plantilla *</label>
          <select class="form-select form-select-sm" id="clt-template">
            <option value="">Seleccioná una plantilla...</option>
            ${a.map(e=>`
              <option value="${e.id}" data-tipo="${e.tipo}" data-nombre="${e.nombre}">
                ${i.includes(e.tipo)?`⭐ `:``}${e.nombre}
              </option>`).join(``)}
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Motivo / Resumen del caso</label>
          <textarea class="form-control form-control-sm" id="clt-motivo" rows="3">${e.resumen_actual||e.descripcion||``}</textarea>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Responsable institucional</label>
          <input type="text" class="form-control form-control-sm" id="clt-responsable" value="Coordinación Pedagógica">
        </div>

        <div class="d-flex justify-content-end">
          <button class="btn btn-sm btn-primary" id="clt-preview-btn">
            <i class="bi bi-eye me-1"></i>Vista previa y generar
          </button>
        </div>
      </div>
    `,onOpen:t=>{t.querySelector(`#clt-preview-btn`)?.addEventListener(`click`,async()=>{let i=t.querySelector(`#clt-template`),a=i?.value,o=i?.selectedOptions[0]?.dataset.nombre,s=i?.selectedOptions[0]?.dataset.tipo;if(!a){alert(`Seleccioná una plantilla.`);return}let c=t.querySelector(`#clt-motivo`)?.value?.trim()||``,l=t.querySelector(`#clt-responsable`)?.value?.trim()||`Coordinación Pedagógica`,u=r.find(e=>e.id===a),d=await Pt(e.alumno_id),{contenidoFinal:f,variablesUsadas:p,variablesFaltantes:m,advertencias:h}=ae({template:u,context:Nt({alumno:d.alumno,escolaridad:d.escolaridad,actividad:{nombre:`Caso institucional: ${e.titulo}`,motivo:c},extra:{responsable:l}})});_.close(),setTimeout(()=>{ue({title:o,tipo:s,alumnoNombre:d.alumno?.nombre_completo||``,alumnoId:e.alumno_id,templateId:a,contenidoFinal:f,variablesUsadas:p,variablesFaltantes:m,advertencias:h,onSaved:async t=>{if(t?.id)try{await pv(e.id,t.id,{titulo:`Carta generada: ${o}`,descripcion:c}),n?.()}catch(e){console.error(`[case letter] link error`,e)}}})},300)})}})}var Z={container:null,caseId:null,caso:null,alumno:null,events:[],actions:[],documents:[],evidence:null},yv={bajo:`bg-info-subtle text-info-emphasis`,medio:`bg-warning-subtle text-warning-emphasis`,alto:`bg-warning text-dark`,critico:`bg-danger text-white`},bv={abierto:`bg-primary-subtle text-primary-emphasis`,en_seguimiento:`bg-warning-subtle text-warning-emphasis`,resuelto:`bg-success-subtle text-success-emphasis`,escalado:`bg-danger-subtle text-danger-emphasis`,archivado:`bg-secondary-subtle text-secondary-emphasis`},xv={llamada_representante:`bi-telephone`,reunion_representante:`bi-people`,reunion_alumno:`bi-person`,acuerdo_compromiso:`bi-handshake`,carta_generada:`bi-file-earmark-text`,nota_interna:`bi-sticky`,devolucion_instrumento:`bi-music-note-list`};function Sv(){let e=window.location.hash||``,t=e.indexOf(`?`);return t===-1?null:new URLSearchParams(e.slice(t+1)).get(`id`)}async function Cv(e){if(e){if(Z.container=e,Z.caseId=Sv(),!Z.caseId){e.innerHTML=`<div class="page-container"><div class="alert alert-warning">No se especificó caso (esperaba ?id=UUID).</div></div>`;return}e.innerHTML=`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>`,await wv()}}async function wv(){try{Z.caso=await wp(Z.caseId);let[e,n,r,i,a]=await Promise.all([Np(Z.caseId),cv(Z.caseId),Z.caso.alumno_id?t.from(`alumnos`).select(`*`).eq(`id`,Z.caso.alumno_id).single().then(e=>e.data):null,Z.caso.alumno_id?H_(Z.caso.alumno_id):null,Z.caso.alumno_id?t.from(`generated_documents`).select(`*`).eq(`alumno_id`,Z.caso.alumno_id).order(`created_at`,{ascending:!1}).then(e=>e.data||[]):Promise.resolve([])]);Z.events=e,Z.actions=n,Z.alumno=r,Z.evidence=i,Z.documents=a,Tv()}catch(e){console.error(`[caseDetail]`,e);let t=String(e?.message||``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);Z.container.innerHTML=`<div class="page-container"><div class="alert alert-warning">Error: ${t}</div></div>`}}function Tv(){let e=Z.caso,t=Z.alumno,n=Z.evidence;Z.container.innerHTML=`
    <div class="page-container">
      <div class="mb-3">
        <button class="btn btn-sm btn-outline-secondary" id="btn-back-list"><i class="bi bi-arrow-left me-1"></i>Volver al listado</button>
      </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex align-items-start gap-3 mb-3">
            <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width:48px;height:48px;">
              <i class="bi bi-folder2-open fs-4"></i>
            </div>
            <div class="flex-grow-1">
              <h4 class="mb-1 fw-bold">${e.titulo}</h4>
              <div class="text-muted small">
                <span class="me-3"><i class="bi bi-person me-1"></i>${e.alumno_nombre||`—`}</span>
                <span class="me-3">${(e.tipo||``).replace(/_/g,` `)}</span>
                <span class="me-3"><i class="bi bi-calendar3 me-1"></i>Abierto: ${e.fecha_apertura}</span>
                ${e.fecha_cierre?`<span class="me-3"><i class="bi bi-check-circle me-1"></i>Cerrado: ${e.fecha_cierre}</span>`:``}
              </div>
            </div>
            <div class="d-flex flex-column align-items-end gap-1 flex-shrink-0">
              <span class="badge ${yv[e.nivel_riesgo]}">Riesgo: ${e.nivel_riesgo}</span>
              <span class="badge ${bv[e.estado]}">${(e.estado||``).replace(/_/g,` `)}</span>
            </div>
          </div>

          ${e.descripcion?`<p class="small mb-3">${e.descripcion}</p>`:``}

          ${e.estado===`resuelto`||e.estado===`archivado`||e.estado===`escalado`?`
            <div class="alert alert-secondary py-2 small mb-3">
              <i class="bi bi-info-circle me-1"></i>
              Este caso está en estado <strong>${(e.estado||``).replace(/_/g,` `)}</strong>. Las acciones están deshabilitadas.
              Reabrí el caso con <em>Cambiar estado</em> si necesitás registrar nuevas acciones.
            </div>`:``}

          ${(()=>{let t=e.estado===`resuelto`||e.estado===`archivado`||e.estado===`escalado`?`disabled`:``;return`
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-primary"           id="btn-act-call"      ${t}><i class="bi bi-telephone me-1"></i>Registrar llamada</button>
            <button class="btn btn-sm btn-primary"           id="btn-act-meeting"   ${t}><i class="bi bi-people me-1"></i>Registrar reunión</button>
            <button class="btn btn-sm btn-outline-primary"   id="btn-act-agreement" ${t}><i class="bi bi-handshake me-1"></i>Registrar acuerdo</button>
            <button class="btn btn-sm btn-success"           id="btn-act-letter"    ${t}><i class="bi bi-file-earmark-text me-1"></i>Generar carta</button>
            <button class="btn btn-sm btn-outline-secondary" id="btn-act-note"      ${t}><i class="bi bi-sticky me-1"></i>Nota interna</button>
            <span class="vr"></span>
            <button class="btn btn-sm btn-outline-warning"   id="btn-change-status"><i class="bi bi-arrow-repeat me-1"></i>Cambiar estado</button>
            <button class="btn btn-sm btn-outline-warning"   id="btn-change-risk"   ${t}><i class="bi bi-shield me-1"></i>Cambiar riesgo</button>
            <button class="btn btn-sm btn-success"           id="btn-resolve"       ${e.estado===`resuelto`||e.estado===`archivado`?`disabled`:``}><i class="bi bi-check-circle me-1"></i>Resolver</button>
            <button class="btn btn-sm btn-danger"            id="btn-escalate"      ${e.estado===`escalado`||e.estado===`archivado`||e.estado===`resuelto`?`disabled`:``}><i class="bi bi-arrow-up-circle me-1"></i>Escalar</button>
            <button class="btn btn-sm btn-secondary"         id="btn-archive"       ${e.estado===`archivado`?`disabled`:``}><i class="bi bi-archive me-1"></i>Archivar</button>
          </div>`})()}
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-header bg-light fw-semibold small"><i class="bi bi-person-vcard me-2"></i>Datos del alumno</div>
            <div class="card-body small">
              ${t?`
                <div class="mb-1"><strong>Instrumento:</strong> ${t.instrumento_principal||`—`}</div>
                <div class="mb-1"><strong>Nivel:</strong> ${t.nivel_actual||t.nivel||`—`}</div>
                <hr class="my-2">
                <div class="mb-1"><strong>Representante:</strong> ${t.representante_nombre||`—`}</div>
                <div class="mb-1"><strong>Teléfono:</strong> ${t.representante_tlf||`—`}</div>
                <div class="mb-1"><strong>Correo:</strong> ${t.correo_representante||`—`}</div>
                <hr class="my-2">
                <div class="mb-1"><strong>Centro:</strong> ${t.centro_estudios||`—`}</div>
                <div><strong>Grado:</strong> ${t.grado_nivel||`—`}</div>
              `:`<em class="text-muted">Sin datos del alumno.</em>`}
            </div>
          </div>

          ${n?`
            <div class="card border-0 shadow-sm mb-3">
              <div class="card-header bg-light fw-semibold small"><i class="bi bi-clipboard-data me-2"></i>Evidencia del mes</div>
              <div class="card-body small">
                <div class="d-flex justify-content-between mb-1"><span>Ausencias injustificadas</span><strong>${n.evidencia.ausenciasInjustificadas}</strong></div>
                <div class="d-flex justify-content-between mb-1"><span>Tardanzas</span><strong>${n.evidencia.tardanzas}</strong></div>
                <div class="d-flex justify-content-between mb-1"><span>Justif. pendientes</span><strong>${n.evidencia.justificacionesPendientes}</strong></div>
                <div class="d-flex justify-content-between mb-1"><span>Observ. seguimiento</span><strong>${n.evidencia.observacionesSeguimiento}</strong></div>
                <div class="d-flex justify-content-between"><span>Cartas previas</span><strong>${n.evidencia.cartasPrevias}</strong></div>
                ${n.accionSugerida?`<hr class="my-2"><div class="text-primary small fst-italic">Sugerencia: ${n.accionSugerida}</div>`:``}
              </div>
            </div>`:``}
        </div>

        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-header bg-light fw-semibold small"><i class="bi bi-clock-history me-2"></i>Timeline institucional</div>
            <div class="card-body p-0">
              ${Z.events.length===0?`<div class="p-3 text-muted small fst-italic">Sin eventos registrados.</div>`:Z.events.map(e=>`
                  <div class="d-flex gap-3 px-3 py-2 border-bottom">
                    <div class="flex-shrink-0 text-primary"><i class="bi bi-circle-fill" style="font-size:0.6rem;"></i></div>
                    <div class="flex-grow-1">
                      <div class="small fw-semibold">${e.titulo}</div>
                      <div class="text-muted" style="font-size:0.72rem;">
                        ${new Date(e.created_at).toLocaleString(`es-DO`)} · ${(e.tipo||``).replace(/_/g,` `)}
                      </div>
                      ${e.descripcion?`<div class="small mt-1">${e.descripcion}</div>`:``}
                    </div>
                  </div>`).join(``)}
            </div>
          </div>

          <div class="card border-0 shadow-sm mb-3">
            <div class="card-header bg-light fw-semibold small"><i class="bi bi-list-check me-2"></i>Acciones registradas (${Z.actions.length})</div>
            <div class="card-body p-0">
              ${Z.actions.length===0?`<div class="p-3 text-muted small fst-italic">Sin acciones registradas.</div>`:Z.actions.map(e=>`
                  <div class="d-flex gap-3 px-3 py-2 border-bottom">
                    <div class="flex-shrink-0 text-primary"><i class="bi ${xv[e.tipo]||`bi-dot`}"></i></div>
                    <div class="flex-grow-1">
                      <div class="small fw-semibold">${e.titulo}</div>
                      <div class="text-muted" style="font-size:0.72rem;">${new Date(e.fecha_accion).toLocaleString(`es-DO`)} · ${(e.tipo||``).replace(/_/g,` `)}</div>
                      ${e.descripcion?`<div class="small mt-1">${e.descripcion}</div>`:``}
                      ${e.resultado?`<div class="small mt-1 text-muted"><strong>Resultado:</strong> ${e.resultado}</div>`:``}
                      ${e.proxima_accion?`<div class="small mt-1 text-primary"><i class="bi bi-arrow-right me-1"></i>${e.proxima_accion}${e.proxima_accion_fecha?` (${e.proxima_accion_fecha})`:``}</div>`:``}
                    </div>
                  </div>`).join(``)}
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light fw-semibold small"><i class="bi bi-folder me-2"></i>Documentos asociados (${Z.documents.length})</div>
            <div class="card-body p-0">
              ${Z.documents.length===0?`<div class="p-3 text-muted small fst-italic">Sin documentos generados.</div>`:Z.documents.map(e=>`
                  <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="small fw-semibold text-truncate">${e.titulo}</div>
                      <div class="text-muted" style="font-size:0.72rem;">${(e.tipo||``).replace(/_/g,` `)} · ${new Date(e.created_at).toLocaleDateString(`es-DO`)}</div>
                    </div>
                    <span class="badge bg-secondary-subtle text-secondary-emphasis ms-2 flex-shrink-0">${e.estado}</span>
                  </div>`).join(``)}
            </div>
          </div>
        </div>
      </div>
    </div>`,Ev()}function Ev(){let e=Z.container;e.querySelector(`#btn-back-list`)?.addEventListener(`click`,()=>f.navigate(`pedagogico-seguimiento-institucional`)),e.querySelector(`#btn-act-call`)?.addEventListener(`click`,()=>hv(`llamada`,Z.caso,wv)),e.querySelector(`#btn-act-meeting`)?.addEventListener(`click`,()=>hv(`reunion`,Z.caso,wv)),e.querySelector(`#btn-act-agreement`)?.addEventListener(`click`,()=>hv(`acuerdo`,Z.caso,wv)),e.querySelector(`#btn-act-note`)?.addEventListener(`click`,()=>hv(`nota`,Z.caso,wv)),e.querySelector(`#btn-act-letter`)?.addEventListener(`click`,()=>vv(Z.caso,Z.alumno,wv)),e.querySelector(`#btn-change-status`)?.addEventListener(`click`,Dv),e.querySelector(`#btn-change-risk`)?.addEventListener(`click`,Ov),e.querySelector(`#btn-resolve`)?.addEventListener(`click`,kv),e.querySelector(`#btn-escalate`)?.addEventListener(`click`,Av),e.querySelector(`#btn-archive`)?.addEventListener(`click`,jv)}function Dv(){_.open({title:`Cambiar estado del caso`,size:`sm`,saveText:`Guardar`,body:`
      <div class="small">
        <label class="form-label fw-semibold">Nuevo estado</label>
        <select class="form-select form-select-sm" id="ms-estado">
          <option value="abierto"        ${Z.caso.estado===`abierto`?`selected`:``}>Abierto</option>
          <option value="en_seguimiento" ${Z.caso.estado===`en_seguimiento`?`selected`:``}>En seguimiento</option>
          <option value="resuelto"       ${Z.caso.estado===`resuelto`?`selected`:``}>Resuelto</option>
          <option value="escalado"       ${Z.caso.estado===`escalado`?`selected`:``}>Escalado</option>
          <option value="archivado"      ${Z.caso.estado===`archivado`?`selected`:``}>Archivado</option>
        </select>
        <label class="form-label fw-semibold mt-2">Nota</label>
        <textarea class="form-control form-control-sm" id="ms-notes" rows="2"></textarea>
      </div>`,onSave:async()=>{let e=document.querySelector(`#ms-estado`)?.value,t=document.querySelector(`#ms-notes`)?.value||``;return await Op(Z.caso.id,e,t),await wv(),!0}})}function Ov(){_.open({title:`Cambiar nivel de riesgo`,size:`sm`,saveText:`Guardar`,body:`
      <div class="small">
        <label class="form-label fw-semibold">Nuevo nivel</label>
        <select class="form-select form-select-sm" id="mr-riesgo">
          <option value="bajo"    ${Z.caso.nivel_riesgo===`bajo`?`selected`:``}>Bajo</option>
          <option value="medio"   ${Z.caso.nivel_riesgo===`medio`?`selected`:``}>Medio</option>
          <option value="alto"    ${Z.caso.nivel_riesgo===`alto`?`selected`:``}>Alto</option>
          <option value="critico" ${Z.caso.nivel_riesgo===`critico`?`selected`:``}>Crítico</option>
        </select>
        <label class="form-label fw-semibold mt-2">Justificación</label>
        <textarea class="form-control form-control-sm" id="mr-notes" rows="2"></textarea>
      </div>`,onSave:async()=>{let e=document.querySelector(`#mr-riesgo`)?.value,t=document.querySelector(`#mr-notes`)?.value||``;return await kp(Z.caso.id,e,t),await wv(),!0}})}function kv(){_.open({title:`Resolver caso`,size:`md`,saveText:`Marcar como resuelto`,body:`
      <div class="small">
        <label class="form-label fw-semibold">Resumen de resolución</label>
        <textarea class="form-control form-control-sm" id="mres-notes" rows="4" placeholder="Describí cómo se resolvió el caso..."></textarea>
      </div>`,onSave:async()=>{let e=document.querySelector(`#mres-notes`)?.value?.trim()||``;return await Ap(Z.caso.id,e),await wv(),!0}})}function Av(){_.open({title:`Escalar caso a directiva`,size:`md`,saveText:`Escalar`,body:`
      <div class="small">
        <label class="form-label fw-semibold">Motivo del escalamiento</label>
        <textarea class="form-control form-control-sm" id="mes-notes" rows="4" placeholder="Explicá por qué se escala..."></textarea>
      </div>`,onSave:async()=>{let e=document.querySelector(`#mes-notes`)?.value?.trim()||``;return await Mp(Z.caso.id,e),await wv(),!0}})}function jv(){_.open({title:`Archivar caso`,size:`sm`,saveText:`Archivar`,body:`
      <div class="small">
        <p>¿Confirmás archivar este caso? El caso quedará oculto en el listado activo pero permanecerá en el historial.</p>
        <label class="form-label fw-semibold">Nota de archivado (opcional)</label>
        <textarea class="form-control form-control-sm" id="marc-notes" rows="2"></textarea>
      </div>`,onSave:async()=>{let e=document.querySelector(`#marc-notes`)?.value||``;return await jp(Z.caso.id,e),await wv(),!0}})}var Mv={container:null,rules:[]};async function Nv(e){e&&(Mv.container=e,e.innerHTML=`<div class="page-container d-flex align-items-center justify-content-center" style="min-height:300px;"><div class="spinner-border text-primary"></div></div>`,await Pv())}async function Pv(){try{Mv.rules=await w_({}),Fv()}catch(e){let t=String(e?.message||``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]);Mv.container.innerHTML=`<div class="page-container"><div class="alert alert-warning">Error: ${t}</div></div>`}}function Fv(){Mv.container.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-sliders fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Reglas de seguimiento</h1>
          <p class="text-muted small mb-0">${Mv.rules.length} regla(s) configurada(s)</p>
        </div>
        <div class="ms-auto d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" id="btn-back">
            <i class="bi bi-arrow-left me-1"></i>Volver
          </button>
          <button class="btn btn-sm btn-outline-primary" id="btn-seed">
            <i class="bi bi-arrow-clockwise me-1"></i>Restaurar reglas por defecto
          </button>
          <button class="btn btn-sm btn-primary" id="btn-new-rule">
            <i class="bi bi-plus-lg me-1"></i>Nueva regla
          </button>
        </div>
      </div>

      ${Mv.rules.length===0?`
        <div class="text-center py-5 text-muted">
          <i class="bi bi-sliders fs-1 d-block mb-2 opacity-40"></i>
          <p>No hay reglas configuradas.</p>
        </div>`:Mv.rules.map(Iv).join(``)}
    </div>`,Lv()}function Iv(e){return`
    <div class="card border-0 shadow-sm mb-2">
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-semibold small">${e.nombre}</div>
            <div class="text-muted" style="font-size:0.72rem;">
              <span class="me-2">${e.tipo}</span>
              ${e.descripcion?`<span class="me-2">· ${e.descripcion}</span>`:``}
            </div>
            <details class="mt-2" style="font-size:0.72rem;">
              <summary class="text-muted">Ver configuración</summary>
              <pre class="mt-1 mb-0 small text-muted bg-light p-2 rounded">${JSON.stringify(e.config,null,2)}</pre>
            </details>
          </div>
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <span class="badge ${e.activo?`bg-success-subtle text-success-emphasis`:`bg-secondary-subtle text-secondary-emphasis`}">${e.activo?`Activa`:`Inactiva`}</span>
            <button class="btn btn-sm btn-outline-primary btn-edit-rule" data-id="${e.id}" title="Editar"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-secondary btn-toggle-rule" data-id="${e.id}" data-activo="${e.activo}" title="${e.activo?`Desactivar`:`Activar`}">
              <i class="bi ${e.activo?`bi-pause`:`bi-play`}"></i>
            </button>
          </div>
        </div>
      </div>
    </div>`}function Lv(){let e=Mv.container;e.querySelector(`#btn-back`)?.addEventListener(`click`,()=>f.navigate(`pedagogico-seguimiento-institucional`)),e.querySelector(`#btn-new-rule`)?.addEventListener(`click`,()=>Rv(null)),e.querySelector(`#btn-seed`)?.addEventListener(`click`,async()=>{if(!confirm(`¿Restaurar las reglas por defecto que falten?`))return;let{inserted:e}=await k_();alert(`${e} regla(s) restaurada(s).`),await Pv()}),e.querySelectorAll(`.btn-edit-rule`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Mv.rules.find(t=>t.id===e.dataset.id);t&&Rv(t)})}),e.querySelectorAll(`.btn-toggle-rule`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.activo===`true`;await D_(e.dataset.id,!t),await Pv()})})}function Rv(e){let t=!!e;_.open({title:t?`Editar regla`:`Nueva regla`,size:`lg`,saveText:t?`Guardar`:`Crear`,body:`
      <div class="row g-2 small">
        <div class="col-md-8">
          <label class="form-label fw-semibold">Nombre *</label>
          <input type="text" class="form-control form-control-sm" id="rm-nombre" value="${e?.nombre||``}" required maxlength="160">
        </div>
        <div class="col-md-4">
          <label class="form-label fw-semibold">Prioridad</label>
          <input type="number" class="form-control form-control-sm" id="rm-prioridad" value="${e?.prioridad??1}" min="1">
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Tipo *</label>
          <select class="form-select form-select-sm" id="rm-tipo" ${t?`disabled`:``}>
            <option value="asistencia_irregular"             ${e?.tipo===`asistencia_irregular`?`selected`:``}>Asistencia irregular</option>
            <option value="tardanzas_recurrentes"            ${e?.tipo===`tardanzas_recurrentes`?`selected`:``}>Tardanzas recurrentes</option>
            <option value="observacion_requiere_seguimiento" ${e?.tipo===`observacion_requiere_seguimiento`?`selected`:``}>Observación requiere seguimiento</option>
            <option value="justificaciones_pendientes"       ${e?.tipo===`justificaciones_pendientes`?`selected`:``}>Justificaciones pendientes</option>
            <option value="conducta"                         ${e?.tipo===`conducta`?`selected`:``}>Conducta</option>
            <option value="bajo_compromiso"                  ${e?.tipo===`bajo_compromiso`?`selected`:``}>Bajo compromiso</option>
            <option value="instrumento_en_riesgo"            ${e?.tipo===`instrumento_en_riesgo`?`selected`:``}>Instrumento en riesgo</option>
            <option value="caso_manual"                      ${e?.tipo===`caso_manual`?`selected`:``}>Caso manual</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Descripción</label>
          <textarea class="form-control form-control-sm" id="rm-descripcion" rows="2">${e?.descripcion||``}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label fw-semibold">Configuración (JSON)</label>
          <textarea class="form-control form-control-sm font-monospace" id="rm-config" rows="6" style="font-size:0.75rem;">${JSON.stringify(e?.config||{},null,2)}</textarea>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input type="checkbox" class="form-check-input" id="rm-activo" ${e?.activo===!1?``:`checked`}>
            <label class="form-check-label fw-semibold" for="rm-activo">Activa</label>
          </div>
        </div>
      </div>`,onSave:async()=>{let n=document.querySelector(`#rm-nombre`)?.value?.trim(),r=document.querySelector(`#rm-tipo`)?.value,i=document.querySelector(`#rm-descripcion`)?.value?.trim()||null,a=parseInt(document.querySelector(`#rm-prioridad`)?.value)||1,o=document.querySelector(`#rm-activo`)?.checked,s=document.querySelector(`#rm-config`)?.value||`{}`;if(!n||!r)return alert(`Completá nombre y tipo.`),!1;let c;try{c=JSON.parse(s)}catch{return alert(`JSON de configuración inválido.`),!1}try{return t?await E_(e.id,{nombre:n,descripcion:i,prioridad:a,activo:o,config:c}):await T_({nombre:n,tipo:r,descripcion:i,prioridad:a,activo:o,config:c}),await Pv(),!0}catch(e){return alert(`Error: ${e.message}`),!1}}})}function zv(){f.register(`pedagogico-dashboard`,e=>Hg(e)),f.register(`pedagogico-seguimiento`,e=>i_(e)),f.register(`pedagogico-reportes`,e=>f_(e)),f.register(`pedagogico-solicitudes`,e=>g_(e)),f.register(`pedagogico-seguimiento-institucional`,e=>G_(e)),f.register(`pedagogico-caso`,e=>Cv(e)),f.register(`pedagogico-seguimiento-reglas`,e=>Nv(e))}function Bv(){f.register(`horario-builder`,Ft)}function Vv(e){let t=new Date;return t.setDate(t.getDate()-e),t.toISOString().split(`T`)[0]}function Hv(e){return e?new Date(e).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):``}function Uv(e){if(!e)return``;let t=Date.now()-new Date(e).getTime(),n=Math.floor(t/6e4),r=Math.floor(t/36e5),i=Math.floor(t/864e5);return n<2?`ahora mismo`:n<60?`hace ${n} min`:r<24?`hace ${r}h`:i<7?`hace ${i}d`:Hv(e)}var Wv={enfermedad:`Médica`,personal:`Personal`,capacitacion:`Capacitación`,vacaciones:`Vacaciones`,otro:`Otro`};async function Gv(){let e=Vv(30),{data:n,error:r}=await t.from(`ausencias_maestros`).select(`
      id, maestro_id, tipo_ausencia, urgencia, fecha_inicio, fecha_fin,
      estado, motivo, created_at, decidido_en,
      maestros:maestro_id(nombre_completo, correo, instrumento)
    `).in(`estado`,[`pendiente`,`aprobada`,`rechazada`]).gte(`created_at`,`${e}T00:00:00`).order(`created_at`,{ascending:!1}).limit(50);if(r)throw r;if(!n||n.length===0)return[];let i=[...new Set(n.map(e=>e.maestro_id).filter(Boolean))];if(i.length>0){let{data:e,error:r}=await t.from(`profiles`).select(`id, nombre_completo, email`).in(`id`,i);if(!r&&e){let r=e.map(e=>e.email).filter(Boolean),i=new Map;if(r.length>0){let{data:e}=await t.from(`maestros`).select(`correo, especialidad`).in(`correo`,r);e&&(i=new Map(e.map(e=>[e.correo.toLowerCase(),e.especialidad])))}let a=new Map(e.map(e=>{let t=i.get(e.email?.toLowerCase())||null;return[e.id,{nombre_completo:e.nombre_completo,correo:e.email,instrumento:t}]}));return n.map(e=>{let t=a.get(e.maestro_id);return{...e,maestros:t||e.maestros||null}})}}return n.map(e=>({...e,maestros:e.maestros||null}))}function Kv(e,t=[]){let n=e.maestros?.nombre_completo||`Maestro`,r=Wv[e.tipo_ausencia]||e.tipo_ausencia||`Ausencia`,i=e.estado===`pendiente`,a=e.estado===`aprobada`,o=e.fecha_inicio===e.fecha_fin?Hv(e.fecha_inicio):`${Hv(e.fecha_inicio)} → ${Hv(e.fecha_fin)}`,s=e.maestros?.instrumento,c=i&&s?t.filter(t=>t.instrumento===s&&t.id!==e.maestro_id).slice(0,3):[];return{id:`ausencia:${e.id}`,source:`ausencia`,sourceId:e.id,priority:i?e.urgencia===`alta`?`alta`:e.urgencia===`media`?`media`:`baja`:`info`,actionable:i,estado:e.estado,urgencia:e.urgencia,tipo_ausencia:e.tipo_ausencia,icon:i?`bi-calendar-x-fill`:a?`bi-calendar-check-fill`:`bi-calendar-minus-fill`,iconColor:i?e.urgencia===`alta`?`#ef4444`:e.urgencia===`media`?`#f59e0b`:`#6b7280`:a?`#22c55e`:`#ef4444`,category:`ausencia`,titulo:i?`${n} solicitó ausencia ${r.toLowerCase()}`:a?`Ausencia de ${n} aprobada`:`Ausencia de ${n} rechazada`,subtitulo:o,motivo:e.motivo||``,timestamp:e.created_at,timeAgo:Uv(e.created_at),actionRoute:i?`admin-ausencias`:null,actionLabel:i?`Revisar`:null,suplentesSugeridos:c,maestroInstrumento:s}}async function qv(){let e=Vv(7),n=new Date().toISOString().split(`T`)[0],{data:r,error:i}=await t.from(`sesiones_clase`).select(`
      id, fecha, asistencia, borrador, contenido, clase_id,
      clases:clase_id(nombre, maestro_id,
        maestros:maestro_id(nombre_completo)
      )
    `).gte(`fecha`,e).lt(`fecha`,n).order(`fecha`,{ascending:!1}).limit(200);if(i)throw i;return r||[]}function Jv(e){let t=e.filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return!t&&!(e.borrador===!1&&n)}),n={};for(let e of t){let t=e.clases?.maestro_id||`unknown`,r=e.clases?.maestros?.nombre_completo||`Maestro desconocido`;n[t]||(n[t]={nombre:r,count:0,ultima:e.fecha,mid:t}),n[t].count++,e.fecha>n[t].ultima&&(n[t].ultima=e.fecha)}return Object.values(n).map(e=>({id:`compliance:${e.mid}`,source:`sesion`,sourceId:e.mid,priority:e.count>=3?`alta`:e.count>=2?`media`:`baja`,actionable:!1,estado:`info`,icon:`bi-clipboard-x-fill`,iconColor:e.count>=3?`#ef4444`:e.count>=2?`#f59e0b`:`#6b7280`,category:`compliance`,titulo:`${e.nombre} tiene ${e.count} clase${e.count>1?`s`:``} sin asistencia`,subtitulo:`Última: ${Hv(e.ultima)} · últimos 7 días`,motivo:``,timestamp:new Date(`${e.ultima}T12:00:00`).toISOString(),timeAgo:Hv(e.ultima),actionRoute:null,actionLabel:null}))}async function Yv(){let e=Vv(7),{data:n,error:r}=await t.from(`alumnos`).select(`id, nombre_completo, created_at`).gte(`created_at`,`${e}T00:00:00`).order(`created_at`,{ascending:!1}).limit(20);return r?(console.warn(`[adminNotifApi] alumnos fetch warn:`,r.message),[]):n||[]}function Xv(e){return e.map(e=>({id:`alumno:${e.id}`,source:`alumno`,sourceId:e.id,priority:`info`,actionable:!1,estado:`info`,icon:`bi-person-plus-fill`,iconColor:`#3b82f6`,category:`alumno`,titulo:`Nuevo alumno registrado: ${e.nombre_completo||`Alumno`}`,subtitulo:`Estado: activo`,motivo:``,timestamp:e.created_at,timeAgo:Uv(e.created_at),actionRoute:null,actionLabel:null}))}async function Zv(){let{data:e,error:n}=await t.from(`profiles`).select(`id, email, nombre_completo, created_at`).eq(`rol`,`maestro`).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!1}).limit(20);return n?(console.warn(`[adminNotifApi] pending teachers fetch warn:`,n.message),[]):e||[]}function Qv(e){return{id:`maestro-pendiente:${e.id}`,source:`maestro`,sourceId:e.id,priority:`alta`,actionable:!0,estado:`pendiente`,icon:`bi-person-badge-fill`,iconColor:`#ef4444`,category:`maestro`,titulo:`Nuevo maestro registrado esperando aprobación: ${e.nombre_completo||`Maestro`}`,subtitulo:`Email: ${e.email}`,motivo:``,timestamp:e.created_at,timeAgo:Uv(e.created_at),actionRoute:`admin-aprobacion`,actionLabel:`Ver Aprobaciones`}}async function $v(){let{data:e,error:n}=await t.from(`maestros`).select(`id, nombre_completo, correo, especialidad`).eq(`activo`,!0);return n?(console.warn(`[adminNotifApi] active maestros fetch warn:`,n.message),[]):(e||[]).map(e=>({id:e.id,nombre_completo:e.nombre_completo,email:e.correo,instrumento:e.especialidad}))}async function ey(){let e=Vv(30),{data:n,error:r}=await t.from(`asistencias`).select(`
      alumno_id, estado, fecha,
      alumnos:alumno_id(nombre_completo)
    `).gte(`fecha`,e).order(`fecha`,{ascending:!1});if(r)return console.warn(`[adminNotifApi] early warning fetch warn:`,r.message),[];let i={};for(let e of n||[]){let t=e.alumno_id;t&&(i[t]||(i[t]={nombre:e.alumnos?.nombre_completo||`Estudiante`,asistencias:[]}),i[t].asistencias.push(e.estado))}let a=[];for(let[e,t]of Object.entries(i)){let n=t.asistencias.length;if(n<3)continue;let r=0;for(let e of t.asistencias)if(e===`A`||e===`ausente`)r++;else if(e===`P`||e===`presente`||e===`T`||e===`tarde`)break;if(r>=3){a.push({id:`riesgo-alumno-ausencias:${e}`,source:`riesgo`,sourceId:e,priority:`alta`,actionable:!1,estado:`info`,icon:`bi-exclamation-triangle-fill`,iconColor:`#ef4444`,category:`compliance`,titulo:`Riesgo de Deserción: ${t.nombre}`,subtitulo:`Acumula ${r} inasistencias consecutivas en los últimos 30 días.`,motivo:`Acción recomendada: Contactar de urgencia al tutor legal o revisar ficha médica.`,timestamp:new Date().toISOString(),timeAgo:`ahora mismo`,actionRoute:`alumno?id=${e}`,actionLabel:`Ver Ficha`});continue}let i=t.asistencias.filter(e=>e===`P`||e===`presente`).length,o=i/n;o<.7&&a.push({id:`riesgo-alumno-rate:${e}`,source:`riesgo`,sourceId:e,priority:`media`,actionable:!1,estado:`info`,icon:`bi-graph-down`,iconColor:`#f59e0b`,category:`compliance`,titulo:`Bajo Compliance Académico: ${t.nombre}`,subtitulo:`Asistencia del ${Math.round(o*100)}% en los últimos 30 días (${i} de ${n} clases).`,motivo:`Acción recomendada: Coordinar entrevista de seguimiento y analizar tutoría.`,timestamp:new Date().toISOString(),timeAgo:`ahora mismo`,actionRoute:`alumno?id=${e}`,actionLabel:`Ver Ficha`})}return a}async function ty(){let[e,t,n,r,i,a]=await Promise.allSettled([Gv(),qv(),Yv(),Zv(),$v(),ey()]),o=[];try{o=await $v()}catch(e){console.warn(`[adminNotifApi] fallback active maestros failed:`,e)}let s=e.status===`fulfilled`?e.value.map(e=>Kv(e,o)):[],c=t.status===`fulfilled`?Jv(t.value):[],l=n.status===`fulfilled`?Xv(n.value):[],u=r.status===`fulfilled`?r.value.map(Qv):[],d=a.status===`fulfilled`?a.value:[],f=[...s,...c,...l,...u,...d],p={alta:0,media:1,baja:2,info:3};return f.sort((e,t)=>{if(e.actionable!==t.actionable)return e.actionable?-1:1;let n=p[e.priority]??4,r=p[t.priority]??4;return n===r?(t.timestamp||``).localeCompare(e.timestamp||``):n-r}),f}async function ny(){let[e,n]=await Promise.allSettled([t.from(`ausencias_maestros`).select(`id`,{count:`exact`,head:!0}).eq(`estado`,`pendiente`),t.from(`profiles`).select(`id`,{count:`exact`,head:!0}).eq(`rol`,`maestro`).eq(`estado`,`pendiente`)]);return(e.status===`fulfilled`&&!e.value.error&&e.value.count||0)+(n.status===`fulfilled`&&!n.value.error&&n.value.count||0)}async function ry(){let{data:e,error:n}=await t.from(`profiles`).select(`id, nombre_completo, email`).eq(`rol`,`maestro`).eq(`estado`,`activo`).order(`nombre_completo`,{ascending:!0});if(n)throw n;return(e||[]).map(e=>({profile_id:e.id,nombre:e.nombre_completo||e.email||`Maestro`,email:e.email}))}async function iy(e,{titulo:n,mensaje:r,deep_link:i=`/notificaciones`}){if(!e?.length)throw Error(`Se requiere al menos un destinatario`);let a=e.map(e=>({profile_id:e,tipo:`aviso_admin`,titulo:n,mensaje:r,deep_link:i,estado:`pendiente`})),{error:o}=await t.from(`notificaciones`).insert(a);if(o)throw o;let s=0;try{s=(await Promise.allSettled(e.map(e=>fetch(`/functions/v1/send-push`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer `,apikey:``},body:JSON.stringify({profile_id:e,title:n,body:r,data:{tipo:`aviso_admin`,deepLink:i}})}).then(e=>e.ok?e.json():Promise.reject(Error(`HTTP ${e.status}`)))))).filter(e=>e.status===`fulfilled`&&e.value?.sent>0).length}catch(e){console.warn(`[adminNotifApi] Web push dispatch failed (in-app notif still sent):`,e.message)}return{sent:a.length,pushed:s}}async function ay({limit:e=50}={}){let{data:n,error:r}=await t.from(`notificaciones`).select(`id, titulo, mensaje, deep_link, estado, created_at, profile_id`).eq(`tipo`,`aviso_admin`).order(`created_at`,{ascending:!1}).limit(e*20);if(r)throw r;if(!n?.length)return[];let i=new Map;for(let e of n){let t=e.created_at?.slice(0,16),n=`${e.titulo}|${t}`;i.has(n)||i.set(n,{titulo:e.titulo,mensaje:e.mensaje,deep_link:e.deep_link,created_at:e.created_at,recipients:[]}),i.get(n).recipients.push(e.profile_id)}return[...i.values()].slice(0,e).map(e=>({...e,recipientCount:e.recipients.length}))}async function oy(){let{data:e,error:n}=await t.from(`ausencias_maestros`).select(`
      id,
      maestro_id,
      tipo_ausencia,
      urgencia,
      fecha_inicio,
      fecha_fin,
      motivo,
      estado,
      created_at
    `).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(n)throw n;if(!e||e.length===0)return[];let r=[...new Set(e.map(e=>e.maestro_id).filter(Boolean))];if(r.length>0){let{data:n,error:i}=await t.from(`profiles`).select(`id, nombre_completo, email`).in(`id`,r);if(!i&&n){let t=new Map(n.map(e=>[e.id,e]));return e.map(e=>{let n=t.get(e.maestro_id);return{...e,maestros:n?{nombre_completo:n.nombre_completo,correo:n.email}:e.maestros||null}})}}return e.map(e=>({...e,maestros:e.maestros||null}))}async function sy(e,n,r){let{data:i,error:a}=await t.from(`ausencias_maestros`).update({estado:n,decision_notas:r||null,decidido_en:new Date().toISOString()}).eq(`id`,e).select().single();if(a)throw a;return i}function cy(e,t=``){return sy(e,`aprobada`,t)}function ly(e,t=``){return sy(e,`rechazada`,t)}var uy=new l(`admin-notifications`),dy=null,fy=null,py=null;function my(){clearTimeout(py),py=setTimeout(async()=>{try{let e=await ny();fy?.(e)}catch(e){console.warn(`[realtimeService] count fetch failed:`,e.message)}},800)}function hy(e,t){if(!(typeof Notification>`u`)&&Notification.permission===`granted`&&(localStorage.getItem(`current-view`)||``)!==`admin-notificaciones`)try{new Notification(e,{body:t,icon:`/icons/icon-192x192.png`,badge:`/icons/icon-72x72.png`,tag:`admin-notif`,renotify:!0})}catch{}}function gy(e){dy||(fy=e,typeof Notification<`u`&&Notification.permission===`default`&&Notification.requestPermission().catch(()=>{}),dy=t.channel(`admin-notif-realtime`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`ausencias_maestros`},e=>{hy(`📅 Nueva solicitud de ausencia`,`Un maestro solicitó una ausencia — revisá el Centro de Actividad.`),my()}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`ausencias_maestros`,filter:`estado=eq.pendiente`},()=>my()).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`profiles`,filter:`rol=eq.maestro`},e=>{hy(`👤 Nuevo maestro pendiente de aprobación`,`${e.new?.nombre_completo||`Un maestro`} se registró y está esperando aprobación.`),my()}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`profiles`,filter:`estado=eq.pendiente`},()=>my()).subscribe(e=>{e===`SUBSCRIBED`?my():(e===`CHANNEL_ERROR`||e===`SUBSCRIPTION_ERROR`)&&console.warn(`[realtimeService] Channel error, will retry on reconnect`)}),uy.registerChannel(dy))}function _y(){uy.destroy(),dy=null,fy=null,clearTimeout(py),py=null}function vy(){fy?.(0)}function yy(){if(document.getElementById(`anv-styles`))return;let e=document.createElement(`style`);e.id=`anv-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}var by=[{key:`all`,label:`Todo`,icon:`bi-grid-fill`},{key:`ausencia`,label:`Ausencias`,icon:`bi-calendar-x-fill`},{key:`compliance`,label:`Alertas`,icon:`bi-exclamation-triangle-fill`},{key:`alumno`,label:`Novedades`,icon:`bi-person-plus-fill`}],xy={ausencia:{bg:`rgba(239,68,68,0.1)`,color:`#ef4444`},compliance:{bg:`rgba(245,158,11,0.1)`,color:`#f59e0b`},alumno:{bg:`rgba(59,130,246,0.1)`,color:`#3b82f6`},maestro:{bg:`rgba(239,68,68,0.1)`,color:`#ef4444`}},Sy={ausencia:`Ausencia`,compliance:`Alerta`,alumno:`Novedad`,maestro:`Seguridad`},Cy={aprobada:{label:`Aprobada`,bg:`rgba(34,197,94,0.12)`,color:`#16a34a`,icon:`bi-check-circle-fill`},rechazada:{label:`Rechazada`,bg:`rgba(239,68,68,0.12)`,color:`#dc2626`,icon:`bi-x-circle-fill`},pendiente:{label:`Pendiente`,bg:`rgba(245,158,11,0.12)`,color:`#d97706`,icon:`bi-hourglass-split`}};async function wy(e){yy(),`Notification`in window&&Notification.permission===`default`&&Notification.requestPermission();let n=[],r=`all`,i=``,a=null;function o(){e.innerHTML=`
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
    `,e.querySelector(`#anv-search-bar`)?.addEventListener(`input`,e=>{i=e.target.value,p()}),e.querySelectorAll(`[data-kpi]`).forEach(t=>{t.addEventListener(`click`,()=>{e.querySelectorAll(`[data-kpi]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),r=t.dataset.kpi,s(),p()})}),e.querySelector(`#anv-btn-help`)?.addEventListener(`click`,()=>{h()})}function s(){let t=e.querySelector(`#anv-filters`);if(!t)return;t.innerHTML=``;let i={};for(let e of n)i[e.category]=(i[e.category]||0)+1;by.forEach(a=>{let o=a.key===`all`?n.length:i[a.key]||0,c=r===a.key,l=document.createElement(`button`);l.className=`anv-filter-btn`+(c?` active`:``),l.dataset.filter=a.key,l.innerHTML=`<i class="bi ${a.icon}"></i> ${a.label} <span class="anv-filter-count">${o}</span>`,l.addEventListener(`click`,()=>{e.querySelectorAll(`[data-kpi]`).forEach(e=>e.classList.remove(`active`));let t=e.querySelector(`[data-kpi="${a.key}"]`);t&&t.classList.add(`active`),r=a.key,p(),s()}),t.appendChild(l)})}function c(){let t=n.length,r=n.filter(e=>e.actionable||e.priority===`alta`).length,i=n.filter(e=>e.category===`compliance`).length,a=n.filter(e=>e.category===`alumno`||e.category===`maestro`).length,o=e.querySelector(`#kpi-todo`),s=e.querySelector(`#kpi-criticas`),c=e.querySelector(`#kpi-compliance`),l=e.querySelector(`#kpi-novedades`);o&&(o.textContent=t),s&&(s.textContent=r),c&&(c.textContent=i),l&&(l.textContent=a)}function l(e,t){if(`Notification`in window&&Notification.permission===`granted`)try{new Notification(e,{body:t,icon:`/img/icons/icon-192x192.png`,vibrate:[200,100,200],tag:`soi-admin-notif`})}catch(e){console.warn(`[Web Push] Fallback via SW required:`,e)}}function u(){if(a)return;let n=t.getChannels().find(e=>e.topic===`realtime:admin-feed-channel`);n&&t.removeChannel(n),a=t.channel(`admin-feed-channel`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`ausencias_maestros`},async e=>{console.log(`[Realtime WebSocket] Nueva ausencia detectada:`,e),l(`Nueva Ausencia Solicitada`,`Un maestro ha enviado una solicitud de ausencia urgente.`),await m(!0)}).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`ausencias_maestros`},async()=>{await m(!0)}).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`profiles`},async e=>{e.new&&e.new.rol===`maestro`&&(console.log(`[Realtime WebSocket] Nuevo maestro registrado:`,e),l(`Nuevo Registro de Seguridad`,`${e.new.nombre_completo} se ha registrado esperando aprobación.`),await m(!0))}).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`asistencias`},async()=>{await m(!0)}).subscribe(t=>{let n=e.querySelector(`#anv-refresh-btn`);n&&(t===`SUBSCRIBED`?(n.innerHTML=`<i class="bi bi-broadcast text-success animate-pulse"></i> Feed en Vivo`,n.style.borderColor=`rgba(34,197,94,0.3)`,n.title=`Conectado mediante WebSockets en tiempo real.`):(n.innerHTML=`<i class="bi bi-exclamation-triangle-fill text-warning"></i> Re-conectar`,n.style.borderColor=`rgba(245,158,11,0.3)`,n.title=`WebSockets inactivos. Haz clic para actualizar manualmente.`))})}function d(e,n){let r=document.createElement(`div`);r.className=`anv-event`,r.dataset.priority=e.priority,r.dataset.category=e.category;let i=xy[e.category]||{bg:`rgba(99,102,241,0.12)`,color:`#6366f1`},a=Sy[e.category]||e.category,o=``;if((e.source===`ausencia`||e.source===`maestro`)&&!e.actionable){let t=Cy[e.estado===`activo`?`aprobada`:e.estado===`rechazado`?`rechazada`:e.estado];t&&(o=`
          <span class="anv-estado-chip" style="background:${t.bg};color:${t.color}">
            <i class="bi ${t.icon}"></i> ${t.label===`Aprobada`&&e.source===`maestro`?`Aprobado`:t.label===`Rechazada`&&e.source===`maestro`?`Rechazado`:t.label}
          </span>
        `)}let s=``;e.suplentesSugeridos&&e.suplentesSugeridos.length>0&&e.actionable&&(s=`
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
      `);let l=``;if(e.actionable&&e.source===`ausencia`)l=`
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
      `;else if(e.actionable&&e.source===`maestro`)l=`
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
      `;else if(e.actionRoute){let t=e.actionParams?` data-params='${JSON.stringify(e.actionParams)}'`:``;l=`
        <div class="anv-inline-actions">
          <button class="anv-action-btn anv-btn-goto" data-action="goto" data-route="${e.actionRoute}"${t}>
            <i class="bi bi-arrow-right-circle"></i> ${e.actionLabel||`Ver`}
          </button>
        </div>
      `}return r.innerHTML=`
      <div class="anv-event-dot" style="background:${i.bg}">
        <i class="bi ${e.icon}" style="color:${e.iconColor}"></i>
      </div>
      <div class="anv-event-body">
        <span class="anv-cat-chip" style="background:${i.bg};color:${i.color}">
          ${a}
        </span>
        <div class="anv-event-top">
          <span class="anv-event-titulo">${e.titulo}</span>
          <span class="anv-event-time">${e.timeAgo}</span>
        </div>
        <div class="anv-event-sub">${e.subtitulo}</div>
        ${e.motivo?`<div class="anv-event-motivo">"${e.motivo}"</div>`:``}
        ${s}
        ${o}
        ${l}
      </div>
    `,r.querySelectorAll(`[data-action]`).forEach(i=>{i.addEventListener(`click`,async a=>{a.stopPropagation();let o=i.dataset.action;if(o===`goto`){let e=window.router||f;if(e){let[t,n]=(i.dataset.route||``).split(`?`),r=i.dataset.params?JSON.parse(i.dataset.params):{};n&&new URLSearchParams(n).forEach((e,t)=>{r[t]=e}),e.navigate(t,r)}return}if(o===`notify-sub`){let e=i.dataset.subName;i.disabled=!0,i.innerHTML=`<i class="bi bi-check-lg"></i> Propuesto`,i.className=`anv-suplente-btn notified`,window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Propuesta de suplencia enviada a ${e}`,type:`success`}}));return}if(r.querySelectorAll(`[data-action="approve"],[data-action="reject"],[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!0),o===`approve`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{await cy(e.sourceId,``),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Ausencia aprobada con éxito`,type:`success`}})),e.actionable=!1,e.estado=`aprobada`,e.priority=`info`,e.icon=`bi-calendar-check-fill`,e.iconColor=`#22c55e`;let t=d(e,n);t.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(t),c(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve"],[data-action="reject"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-check-circle"></i> Aprobar`}}else if(o===`reject`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{await ly(e.sourceId,``),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Ausencia rechazada con éxito`,type:`success`}})),e.actionable=!1,e.estado=`rechazada`,e.priority=`info`,e.icon=`bi-calendar-minus-fill`,e.iconColor=`#ef4444`;let t=d(e,n);t.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(t),c(),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve"],[data-action="reject"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-x-circle"></i> Rechazar`}}else if(o===`approve-maestro`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{let{error:i}=await t.from(`profiles`).update({estado:`activo`}).eq(`id`,e.sourceId);if(i)throw i;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Maestro aprobado con éxito`,type:`success`}})),e.actionable=!1,e.estado=`activo`,e.priority=`info`,e.icon=`bi-person-check-fill`,e.iconColor=`#22c55e`,e.titulo=`Maestro registrado aprobado: ${e.titulo.replace(`Nuevo maestro registrado esperando aprobación: `,``)}`;let a=d(e,n);a.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(a),c()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-check-circle"></i> Aprobar`}}else if(o===`reject-maestro`){i.innerHTML=`<span class="anv-spinner" style="width:0.8rem;height:0.8rem;border-width:2px;margin:0"></span>`;try{let{error:i}=await t.from(`profiles`).update({estado:`rechazado`}).eq(`id`,e.sourceId);if(i)throw i;window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Maestro rechazado con éxito`,type:`success`}})),e.actionable=!1,e.estado=`rechazado`,e.priority=`info`,e.icon=`bi-person-dash-fill`,e.iconColor=`#ef4444`,e.titulo=`Maestro registrado rechazado: ${e.titulo.replace(`Nuevo maestro registrado esperando aprobación: `,``)}`;let a=d(e,n);a.style.animation=`anv-fadein 0.3s ease`,r.replaceWith(a),c()}catch(e){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error: `+e.message,type:`error`}})),r.querySelectorAll(`[data-action="approve-maestro"],[data-action="reject-maestro"]`).forEach(e=>e.disabled=!1),i.innerHTML=`<i class="bi bi-x-circle"></i> Rechazar`}}})}),r}function p(){let t=e.querySelector(`#anv-body`),a=e.querySelector(`#anv-showing`);if(!t)return;let o=n;if(r===`critica`?o=n.filter(e=>e.actionable||e.priority===`alta`):r!==`all`&&(o=n.filter(e=>e.category===r)),i.trim().length>0){let e=i.toLowerCase().trim();o=o.filter(t=>(t.titulo||``).toLowerCase().includes(e)||(t.subtitulo||``).toLowerCase().includes(e)||(t.motivo||``).toLowerCase().includes(e)||(t.maestroInstrumento||``).toLowerCase().includes(e))}if(a&&(a.textContent=o.length===0?`Sin eventos encontrados`:`${o.length} evento${o.length>1?`s`:``}`),o.length===0){t.innerHTML=`
        <div class="anv-center">
          <div class="anv-center-icon"><i class="bi bi-check-circle"></i></div>
          <p class="anv-center-title">Sin novedades</p>
          <p class="anv-center-sub">No hay eventos que coincidan con la búsqueda o el filtro activo.</p>
        </div>
      `;return}t.innerHTML=``;let s=document.createElement(`div`);s.className=`anv-timeline`,o.forEach(e=>{s.appendChild(d(e,()=>m(!0)))}),t.appendChild(s)}async function m(t=!1){let r=e.querySelector(`#anv-refresh-btn`),i=e.querySelector(`#anv-body`);r&&!t&&r.classList.add(`spinning`),i&&n.length===0&&(i.innerHTML=`
        <div class="anv-loading">
          <div class="anv-spinner"></div>
          <span>Cargando actividad operativa...</span>
        </div>
      `);try{n=await ty(),c(),s(),p(),u()}catch(t){console.error(`[adminNotificacionesView] load error:`,t);let r=e.querySelector(`#anv-body`);r&&n.length===0&&(r.innerHTML=`
          <div class="anv-center">
            <div class="anv-center-icon"><i class="bi bi-exclamation-triangle"></i></div>
            <p class="anv-center-title">Error al cargar</p>
            <p class="anv-center-sub">${t.message}</p>
          </div>
        `)}finally{r&&r.classList.remove(`spinning`)}}function h(){_.open({title:`Guía del Usuario — Centro de Actividad`,body:`
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
    `,size:`lg`,hideSave:!0,cancelText:`Entendido`})}async function g(){let e=[];try{e=await ry()}catch{}let t=e.map(e=>`<option value="${e.profile_id}">${e.nombre}</option>`).join(``);_.open({title:`<i class="bi bi-send-fill me-2 text-warning"></i>Enviar notificación a maestros`,body:`
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
      `,hideSave:!0,onShow:()=>{let e=document.getElementById(`sn-mensaje`),t=document.getElementById(`sn-char-count`);e?.addEventListener(`input`,()=>{t&&(t.textContent=`${e.value.length} / 300`)})}}),setTimeout(()=>{let t=document.querySelector(`.modal-footer`);if(!t)return;let n=document.createElement(`button`);n.type=`button`,n.className=`btn btn-warning fw-semibold`,n.id=`sn-btn-send`,n.innerHTML=`<i class="bi bi-send me-1"></i>Enviar`,t.appendChild(n),n.addEventListener(`click`,async()=>{let t=document.getElementById(`sn-titulo`),r=document.getElementById(`sn-mensaje`),i=document.getElementById(`sn-destinatarios`),a=document.getElementById(`sn-status`),o=t?.value.trim(),s=r?.value.trim(),c=Array.from(i?.selectedOptions||[]).map(e=>e.value);if(!o){t?.classList.add(`is-invalid`);return}if(!s){r?.classList.add(`is-invalid`);return}if(!c.length){a&&(a.innerHTML=`<div class="alert alert-warning py-2 mb-0">Seleccioná al menos un destinatario.</div>`);return}n.disabled=!0,n.innerHTML=`<span class="spinner-border spinner-border-sm me-1"></span>Enviando...`;try{let t=c;c.includes(`__all__`)&&(t=e.map(e=>e.profile_id));let{sent:r}=await iy(t,{titulo:o,mensaje:s});a&&(a.innerHTML=`
            <div class="alert alert-success py-2 mb-0">
              <i class="bi bi-check-circle me-1"></i>
              Notificación enviada a <strong>${r}</strong> maestro${r===1?``:`s`}.
            </div>`),n.innerHTML=`<i class="bi bi-check2 me-1"></i>Enviado`,setTimeout(()=>_.open({body:``}),1800)}catch(e){a&&(a.innerHTML=`<div class="alert alert-danger py-2 mb-0">Error: ${e.message}</div>`),n.disabled=!1,n.innerHTML=`<i class="bi bi-send me-1"></i>Enviar`}})},50)}async function ee(){_.open({title:`<i class="bi bi-clock-history me-2"></i>Historial de notificaciones enviadas`,body:`<div class="d-flex align-items-center gap-2 py-3 text-muted">
      <div class="spinner-border spinner-border-sm"></div><span>Cargando historial…</span>
    </div>`,hideSave:!0,cancelText:`Cerrar`});let e=[];try{e=await ay({limit:30})}catch(e){_.open({title:`Error`,body:`<div class="alert alert-danger">No se pudo cargar el historial: ${e.message}</div>`,hideSave:!0,cancelText:`Cerrar`});return}if(!e.length){_.open({title:`<i class="bi bi-clock-history me-2"></i>Historial de notificaciones enviadas`,body:`<div class="text-center py-4 text-muted">
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
      </div>`).join(``);_.open({title:`<i class="bi bi-clock-history me-2"></i>Historial <span class="badge bg-secondary ms-1">${e.length}</span>`,body:`<div style="max-height:420px;overflow-y:auto;">${n}</div>`,hideSave:!0,cancelText:`Cerrar`})}return o(),await m(),vy(),e.querySelector(`#anv-refresh-btn`)?.addEventListener(`click`,()=>m(!1)),e.querySelector(`#anv-btn-send-notif`)?.addEventListener(`click`,()=>g()),e.querySelector(`#anv-btn-historial`)?.addEventListener(`click`,()=>ee()),function(){a&&=(t.removeChannel(a),null)}}function Ty(){f.register(`admin-notificaciones`,e=>{try{wy(e)}catch(t){console.error(`[admin-notificaciones] Error al renderizar la vista:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar el Centro de Actividad: ${t.message}</p>
        </div>
      `}})}async function Ey(e){e.innerHTML=`
    <div class="pm-view-header">
      <h2><i class="bi bi-person-check"></i> Aprobación de Usuarios</h2>
      <p class="pm-view-subtitle">Revisá y aprobá las solicitudes de registro (maestros y administradores)</p>
    </div>
    <div id="aprobacion-content">
      <div class="pm-loading">
        <div class="pm-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>  
    </div>
  `;try{let{data:n,error:r}=await t.from(`profiles`).select(`id, email, nombre_completo, rol, created_at`).in(`rol`,[`maestro`,`admin`]).eq(`estado`,`pendiente`).order(`created_at`,{ascending:!0});if(r)throw r;let i=e.querySelector(`#aprobacion-content`);if(!n||n.length===0){i.innerHTML=`
        <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
            <i class="bi bi-inbox"></i>
          </div>
          <h3>No hay maestros pendientes de aprobación</h3>
          <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
        </div>
      `;return}i.innerHTML=`
      <div class="table-responsive" style="margin-top: 1rem;">
        <table class="table table-dark table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Email</th>
              <th>Rol solicitado</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(e=>{let t=e.rol===`admin`?`<span class="badge bg-info">Administrador</span>`:`<span class="badge bg-secondary">Maestro</span>`;return`
              <tr data-profile-id="${e.id}" data-rol="${ky(e.rol||``)}">
                <td>${ky(e.nombre_completo||`—`)}</td>
                <td>${ky(e.email)}</td>
                <td>${t}</td>
                <td>${Ay(e.created_at)}</td>
                <td class="aprobacion-actions">
                  <button class="btn btn-success btn-sm btn-aprobar" data-id="${e.id}" data-rol="${ky(e.rol||`maestro`)}">
                    <i class="bi bi-check-circle"></i> Aprobar
                  </button>
                  <button class="btn btn-danger btn-sm btn-rechazar" data-id="${e.id}">
                    <i class="bi bi-x-circle"></i> Rechazar
                  </button>
                </td>
              </tr>
            `}).join(``)}
          </tbody>
        </table>
      </div>
    `,i.querySelectorAll(`.btn-aprobar`).forEach(e=>{e.addEventListener(`click`,()=>Dy(e.dataset.id,i,e.dataset.rol))}),i.querySelectorAll(`.btn-rechazar`).forEach(e=>{e.addEventListener(`click`,()=>Oy(e.dataset.id,`rechazado`,null,i))})}catch(t){let n=e.querySelector(`#aprobacion-content`);n.innerHTML=`
      <div class="pm-error" style="text-align: center; padding: 2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar solicitudes: ${t.message}</p>
        <button class="btn btn-outline-light btn-sm" id="btn-retry-aprobacion">
          Intentar de nuevo
        </button>
      </div>
    `,n.querySelector(`#btn-retry-aprobacion`)?.addEventListener(`click`,()=>Ey(e)),console.error(`[AprobacionView] Error:`,t.message)}}function Dy(e,t,n=`maestro`){_.open({title:`Aprobar Usuario`,size:`sm`,saveText:`Aprobar`,body:`
      <p>Confirmá el rol con el que se aprobará al usuario:</p>
      <div class="mb-3">
        <label class="form-label-compact">Rol</label>
        <select class="form-select" id="aprobacion-rol-select">
          <option value="maestro" ${n===`maestro`?`selected`:``}>Maestro</option>
          <option value="admin" ${n===`admin`?`selected`:``}>Admin</option>
        </select>
      </div>
    `,onSave:async n=>{let r=n.querySelector(`#aprobacion-rol-select`).value;await Oy(e,`activo`,r,t)}})}async function Oy(e,n,r,i){let a=i?.querySelector(`tr[data-profile-id="${e}"]`);if(!(!a&&i)){a?.querySelectorAll(`button`).forEach(e=>e.disabled=!0);try{if(n===`activo`){let n=!1,{data:i,error:a}=await t.rpc(`approve_maestro_profile`,{p_profile_id:e,p_new_rol:r||`maestro`,p_new_estado:`activo`});if(!a&&i?.success&&(n=!0),!n){console.warn(`[AprobacionView] RPC falló, usando operaciones directas:`,a?.message||i?.error);let{error:n,count:o}=await t.from(`profiles`).update({rol:r||`maestro`,estado:`activo`}).eq(`id`,e).select();if(n)throw Error(`No se pudo actualizar el perfil: ${n.message}`);let{data:s}=await t.from(`profiles`).select(`estado, rol`).eq(`id`,e).maybeSingle();if(s?.estado!==`activo`)throw Error(`No se pudo activar el perfil. Por favor cerrá sesión e iniciá sesión nuevamente como admin, luego intentá aprobar de nuevo.`)}if(r===`maestro`||!r){let{data:n}=await t.from(`profiles`).select(`id, email, nombre_completo`).eq(`id`,e).maybeSingle();if(n){let{data:e}=await t.from(`maestros`).select(`id, user_id`).or(`user_id.eq.${n.id},correo.eq.${n.email}`).maybeSingle();e?e.user_id||await t.from(`maestros`).update({user_id:n.id}).eq(`id`,e.id):await t.from(`maestros`).insert({user_id:n.id,nombre_completo:n.nombre_completo,correo:n.email,instrumento:``,activo:!0})}}}else{let{error:r}=await t.from(`profiles`).update({estado:n}).eq(`id`,e);if(r)throw r}a&&(a.style.transition=`opacity 0.3s ease`,a.style.opacity=`0`,setTimeout(()=>a.remove(),300));let o=r===`admin`?`Admin`:`Maestro`;if(window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:n===`activo`?`${o} aprobado correctamente`:`Usuario rechazado`,type:`success`}})),i){let e=i.querySelector(`tbody`);e&&e.querySelectorAll(`tr`).length===0&&(i.innerHTML=`
          <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
              <i class="bi bi-inbox"></i>
            </div>
            <h3>No hay maestros pendientes de aprobación</h3>
            <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
          </div>
        `)}}catch(e){a?.querySelectorAll(`button`).forEach(e=>e.disabled=!1),window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:`Error al ${n===`activo`?`aprobar`:`rechazar`} usuario: ${e.message}`,type:`error`}})),console.error(`[AprobacionView] Action error:`,e.message)}}}function ky(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function Ay(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`es-ES`,{year:`numeric`,month:`short`,day:`numeric`})}catch{return e}}function Q(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function jy(e){if(!e)return`—`;let[t,n,r]=e.split(`-`);return`${r}/${n}/${t}`}function My(e){let t=jy(e.fecha_inicio);return!e.fecha_fin||e.fecha_fin===e.fecha_inicio?t:`${t} → ${jy(e.fecha_fin)}`}function Ny(e){return e.maestros?.nombre_completo||e.maestro_nombre||`Maestro no especificado`}function Py(e){return e.maestros?.correo||``}var Fy={enfermedad:{label:`Médica`,icon:`bi-heart-pulse-fill`,color:`#ef4444`},personal:{label:`Personal`,icon:`bi-person-fill`,color:`#3b82f6`},capacitacion:{label:`Capacitación`,icon:`bi-mortarboard-fill`,color:`#8b5cf6`},vacaciones:{label:`Vacaciones`,icon:`bi-sun-fill`,color:`#f59e0b`},otro:{label:`Otro`,icon:`bi-three-dots`,color:`#6b7280`}},Iy={baja:{label:`Baja`,color:`#22c55e`,bg:`rgba(34,197,94,0.12)`},media:{label:`Media`,color:`#f59e0b`,bg:`rgba(245,158,11,0.12)`},alta:{label:`Alta`,color:`#ef4444`,bg:`rgba(239,68,68,0.12)`}};function Ly(e){if(e.clase_emergente?.fecha){let t=e.clase_emergente.hora?` a las ${e.clase_emergente.hora}`:``;return`<i class="bi bi-calendar-check"></i> Reprogramada para ${e.clase_emergente.fecha}${t}`}return e.maestro_suplente_id||e.suplente_nombre?`<i class="bi bi-person-check"></i> Suplente: ${Q(e.suplente_nombre||e.maestro_suplente_id)}`:`<i class="bi bi-clock"></i> Pendiente de coordinación`}function Ry(){if(document.getElementById(`ausencia-aprobacion-card-styles`))return;let e=document.createElement(`style`);e.id=`ausencia-aprobacion-card-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function zy(e,{onApprove:t=()=>{},onReject:n=()=>{}}={}){Ry();let r=Fy[e.tipo_ausencia]||Fy.otro,i=Iy[e.urgencia]||{label:e.urgencia||`Normal`,color:`#6b7280`,bg:`rgba(107,114,128,0.12)`},a=Array.isArray(e.clases_afectadas)?e.clases_afectadas.length:0,o=Ny(e),s=o.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase(),c=document.createElement(`article`);c.className=`ausencia-approval-card`,c.dataset.ausenciaCard=e.id,c.style.setProperty(`--aac-tipo-color`,r.color);let l=e.created_at?new Date(e.created_at).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):``;c.innerHTML=`
    <div class="aac-accent-bar" style="background: ${Q(r.color)};"></div>

    <div class="aac-header">
      <div class="aac-avatar" style="background: ${Q(r.color)};">${Q(s)}</div>
      <div class="aac-header-info">
        <p class="aac-teacher-name">${Q(o)}</p>
        <p class="aac-teacher-email">${Q(Py(e))}</p>
        <div class="aac-badges">
          <span class="aac-tipo-chip" style="--aac-tipo-color:${Q(r.color)}">
            <i class="bi ${Q(r.icon)}"></i> ${Q(r.label)}
          </span>
          <span class="aac-urg-chip" style="color:${Q(i.color)};background:${Q(i.bg)}">
            <i class="bi bi-circle-fill" style="font-size:0.45rem"></i> ${Q(i.label)}
          </span>
        </div>
      </div>
    </div>

    <div class="aac-body">
      <div class="aac-date-row">
        <i class="bi bi-calendar-range"></i>
        ${Q(My(e))}
      </div>
      <div class="aac-coverage">${Ly(e)}</div>
      ${a>0?`<div class="aac-meta"><span><i class="bi bi-journal-text"></i> ${a} clase${a>1?`s`:``} afectada${a>1?`s`:``}</span></div>`:``}
      ${e.motivo?`<div class="aac-motivo">${Q(e.motivo)}</div>`:``}
      <div class="aac-meta">
        ${l?`<span><i class="bi bi-clock-history"></i> Enviada el ${l}</span>`:``}
      </div>
    </div>

    <div class="aac-notes-wrap">
      <label class="aac-notes-label" for="notes-${Q(e.id)}">Nota de decisión (opcional)</label>
      <textarea
        class="aac-notes-input"
        id="notes-${Q(e.id)}"
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
  `;let u=()=>c.querySelector(`[data-decision-notes]`)?.value?.trim()||``,d=c.querySelector(`[data-action="approve"]`),f=c.querySelector(`[data-action="reject"]`);return d.addEventListener(`click`,async()=>{d.disabled=!0,f.disabled=!0,d.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Aprobando...`,await t(e.id,u())}),f.addEventListener(`click`,async()=>{d.disabled=!0,f.disabled=!0,f.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Rechazando...`,await n(e.id,u())}),c}function By(e,t=`success`){window.dispatchEvent(new CustomEvent(`showToast`,{detail:{message:e,type:t}}))}function Vy(){if(document.getElementById(`ausencias-admin-view-styles`))return;let e=document.createElement(`style`);e.id=`ausencias-admin-view-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function Hy(e){Vy(),e.innerHTML=`
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
  `}function Uy(e,t){let n=t.length,r=t.filter(e=>e.urgencia===`alta`).length,i=t.filter(e=>e.urgencia===`media`).length;e.innerHTML=`
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
  `}function Wy(e){e.innerHTML=`
    <div class="aav-empty">
      <div class="aav-empty-icon"><i class="bi bi-inbox"></i></div>
      <h3 class="aav-empty-title">Todo al día</h3>
      <p class="aav-empty-sub">No hay solicitudes de ausencia pendientes en este momento.</p>
    </div>
  `}async function Gy(e){let t=e.querySelector(`#aav-content`),n=e.querySelector(`#aav-stats-row`),r=e.querySelector(`#aav-count-label`),i=e.querySelector(`#aav-refresh-btn`);t&&(t.innerHTML=`
      <div class="aav-loading">
        <div class="aav-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>
    `);try{let i=await oy();if(n&&Uy(n,i),r&&(r.textContent=i.length===0?`Sin solicitudes pendientes`:`${i.length} solicitud${i.length>1?`es`:``} pendiente${i.length>1?`s`:``}`),window.adminAusenciasInsights&&window.adminAusenciasInsights.evaluate(),!i.length){Wy(t);return}t.innerHTML=``;let a=document.createElement(`div`);a.className=`aav-list`,t.appendChild(a);let o=[...i].sort((e,t)=>{let n={alta:0,media:1,baja:2},r=n[e.urgencia]??3,i=n[t.urgencia]??3;return r===i?(e.created_at||``).localeCompare(t.created_at||``):r-i});for(let t of o)a.appendChild(zy(t,{onApprove:async(t,n)=>{await cy(t,n),By(`Ausencia aprobada`,`success`),await Gy(e)},onReject:async(t,n)=>{await ly(t,n),By(`Ausencia rechazada`,`success`),await Gy(e)}}))}catch(e){t&&(t.innerHTML=`
        <div class="aav-error">
          <i class="bi bi-exclamation-triangle"></i>
          Error al cargar solicitudes: ${e.message}
        </div>
      `),By(`Error al cargar ausencias: ${e.message}`,`error`)}finally{i&&i.classList.remove(`spinning`)}}async function Ky(e){Hy(e);let t=e.querySelector(`.aav-root`);await Gy(t);let n=e.querySelector(`#aav-refresh-btn`);n&&n.addEventListener(`click`,async()=>{n.classList.add(`spinning`),await Gy(t)})}function qy(){f.register(`admin-aprobacion`,async e=>{try{await Ey(e)}catch(t){console.error(`[admin-aprobacion] Error al renderizar la vista de aprobaciones:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la aprobación de maestros: ${t.message}</p>
        </div>
      `}}),f.register(`admin-ausencias`,async e=>{try{await Ky(e)}catch(t){console.error(`[admin-aprobacion] Error al renderizar la vista de ausencias:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la gestión de ausencias: ${t.message}</p>
        </div>
      `}})}async function Jy({nombre:e,email:n,password:r,rol:i}={}){if(!e||!n||!r)throw Error(`Nombre, email y contraseña son obligatorios`);if(i!==`admin`&&i!==`maestro`)throw Error(`El rol debe ser 'admin' o 'maestro'`);let{data:a,error:o}=await t.functions.invoke(`create-user`,{body:{nombre:e,email:n,password:r,rol:i}});if(o)throw Error(o.message||`Error al crear el usuario`);if(a?.error)throw Error(a.error);if(!a?.ok||!a?.user)throw Error(`Respuesta inesperada del servidor`);return a.user}async function Yy(e){let{data:n,error:r}=await t.from(`profiles`).select(`id, email, nombre_completo, estado, created_at`).eq(`rol`,e).order(`created_at`,{ascending:!1});if(r)throw Error(r.message||`Error al listar usuarios`);return n||[]}async function Xy(e){e.innerHTML=`
    <div class="gu-root">
      <div class="pm-view-header">
        <h2><i class="bi bi-person-gear"></i> Gestión de Usuarios</h2>
        <p class="pm-view-subtitle">Creá administradores o maestros con acceso inmediato.</p>
      </div>

      <div class="gu-grid">
        <!-- Formulario de creación -->
        <form class="gu-form" id="gu-form" autocomplete="off">
          <h4 class="gu-card-title"><i class="bi bi-person-plus"></i> Nuevo usuario</h4>

          <div class="mb-3">
            <label class="form-label">Nombre completo</label>
            <input type="text" class="form-control" id="gu-nombre" placeholder="Ej. Ana Pérez" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <input type="email" class="form-control" id="gu-email" placeholder="correo@ejemplo.com" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <div class="input-group">
              <input type="password" class="form-control" id="gu-password" placeholder="Mínimo 8 caracteres" required minlength="8">
              <button class="btn btn-outline-secondary" type="button" id="gu-toggle-pass">
                <i class="bi bi-eye"></i>
              </button>
            </div>
            <small class="text-muted">Comunicale esta contraseña al nuevo usuario.</small>
          </div>

          <div class="mb-3">
            <label class="form-label">Rol</label>
            <select class="form-select" id="gu-rol">
              <option value="admin" selected>Administrador</option>
              <option value="maestro">Maestro</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary w-100" id="gu-submit">
            <span class="gu-submit-text"><i class="bi bi-check-circle me-1"></i> Crear usuario</span>
            <span class="gu-submit-loading d-none">
              <span class="spinner-border spinner-border-sm me-2"></span>Creando...
            </span>
          </button>
        </form>

        <!-- Lista de administradores -->
        <div class="gu-list-card">
          <h4 class="gu-card-title"><i class="bi bi-shield-check"></i> Administradores</h4>
          <div id="gu-admins-list">
            <div class="pm-loading"><div class="pm-spinner"></div><span>Cargando...</span></div>
          </div>
        </div>
      </div>
    </div>
  `,nb(),Zy(e),await eb(e)}function Zy(e){let t=e.querySelector(`#gu-form`),n=e.querySelector(`#gu-toggle-pass`),r=e.querySelector(`#gu-password`);n?.addEventListener(`click`,()=>{let e=r.type===`password`;r.type=e?`text`:`password`,n.innerHTML=e?`<i class="bi bi-eye-slash"></i>`:`<i class="bi bi-eye"></i>`}),t?.addEventListener(`submit`,async t=>{t.preventDefault(),await Qy(e)})}async function Qy(e){let t=e.querySelector(`#gu-nombre`).value.trim(),n=e.querySelector(`#gu-email`).value.trim(),r=e.querySelector(`#gu-password`).value,i=e.querySelector(`#gu-rol`).value;if(!t||!n||!r){c.error(`Completá nombre, email y contraseña`);return}if(r.length<8){c.error(`La contraseña debe tener al menos 8 caracteres`);return}$y(e,!0);try{let a=await Jy({nombre:t,email:n,password:r,rol:i});c.success(`Usuario ${a.email} creado como ${a.rol}. Ya puede iniciar sesión.`),e.querySelector(`#gu-form`).reset(),await eb(e)}catch(e){c.error(e.message||`Error al crear el usuario`)}finally{$y(e,!1)}}function $y(e,t){let n=e.querySelector(`#gu-submit`);n&&(n.disabled=t,e.querySelector(`.gu-submit-text`)?.classList.toggle(`d-none`,t),e.querySelector(`.gu-submit-loading`)?.classList.toggle(`d-none`,!t))}async function eb(e){let t=e.querySelector(`#gu-admins-list`);if(t)try{let e=await Yy(`admin`);if(!e.length){t.innerHTML=`<p class="text-muted m-0">No hay administradores registrados.</p>`;return}t.innerHTML=`
      <ul class="gu-admin-items">
        ${e.map(e=>`
          <li class="gu-admin-item">
            <div class="gu-admin-avatar"><i class="bi bi-person-fill"></i></div>
            <div class="gu-admin-info">
              <span class="gu-admin-name">${tb(e.nombre_completo)||`—`}</span>
              <span class="gu-admin-email">${tb(e.email)}</span>
            </div>
            <span class="gu-admin-badge gu-admin-badge--${e.estado===`activo`?`active`:`pending`}">
              ${tb(e.estado)}
            </span>
          </li>
        `).join(``)}
      </ul>
    `}catch(e){t.innerHTML=`<p class="text-danger m-0">Error al cargar administradores: ${tb(e.message)}</p>`}}function tb(e){return e==null?``:(typeof e==`string`?e:String(e)).replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e])}function nb(){if(document.getElementById(`gu-styles`))return;let e=document.createElement(`style`);e.id=`gu-styles`,e.textContent=`
  .gu-root { padding: 1.25rem 1rem 2rem; max-width: 980px; }
  .gu-grid {
    display: grid; gap: 1.25rem; margin-top: 1rem;
    grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
  }
  @media (max-width: 720px) { .gu-grid { grid-template-columns: 1fr; } }
  .gu-form, .gu-list-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 0.85rem; padding: 1.25rem;
  }
  .gu-card-title { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
  .gu-admin-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
  .gu-admin-item { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.7rem; border-radius: 0.6rem; background: rgba(255,255,255,0.03); }
  .gu-admin-avatar {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(124,58,237,0.18); color: #a78bfa;
  }
  .gu-admin-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
  .gu-admin-name { font-weight: 600; font-size: 0.9rem; }
  .gu-admin-email { font-size: 0.78rem; opacity: 0.65; }
  .gu-admin-badge { font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 999px; text-transform: capitalize; }
  .gu-admin-badge--active { background: rgba(34,197,94,0.18); color: #4ade80; }
  .gu-admin-badge--pending { background: rgba(245,158,11,0.18); color: #fbbf24; }
  `,document.head.appendChild(e)}function rb(){f.register(`gestion-usuarios`,async e=>{try{await Xy(e)}catch(t){console.error(`[gestion-usuarios] Error al renderizar la vista:`,t),e.innerHTML=`
        <div class="pm-placeholder">
          <i class="bi bi-exclamation-triangle"></i>
          <p>Error al cargar la gestión de usuarios: ${t.message}</p>
        </div>
      `}})}var ib=e({getHistorialContenido:()=>cb,getObjetivosClase:()=>ab,getSemaforoClase:()=>ob,registrarSesion:()=>sb});async function ab(e){let{data:n,error:r}=await t.from(`ruta_contenido_objetivos`).select(`*`).eq(`clase_id`,e).is(`activo`,!0);if(r)throw r;return n}async function ob(e){let{data:n,error:r}=await t.from(`v_semaforo_contenidos`).select(`*`).eq(`clase_id`,e);if(r)throw r;return n}async function sb(e){let{data:n,error:r}=await t.rpc(`registrar_sesion_bitacora`,{p_clase_id:e.claseId,p_objetivo_id:e.objetivoId,p_fecha:e.fecha,p_notas:e.notas});if(r)throw r;return{id:n}}async function cb(e,n){let{data:r,error:i}=await t.from(`indicator_sessions`).select(`*, indicator_session_students(*)`).eq(`clase_id`,e).eq(`objetivo_id`,n).order(`fecha`,{ascending:!1});if(i)throw i;return r}var lb={schemaVersion:1,sesiones:[],objetivos:[{id:`obj_001`,clase_id:`clase_001`,ruta_nivel_id:`pnivel_001`,descripcion:`Ejecutar escala de Do Mayor en primera posición con tempo estable`,tipo:`destreza`,orden:1,activo:!0},{id:`obj_002`,clase_id:`clase_001`,ruta_nivel_id:`pnivel_001`,descripcion:`Identificar y corregir postura corporal al tocar`,tipo:`actitud`,orden:2,activo:!0},{id:`obj_003`,clase_id:`clase_002`,ruta_nivel_id:`pnivel_002`,descripcion:`Leer partitura de piano a primera vista, nivel intermedio`,tipo:`destreza`,orden:1,activo:!0},{id:`obj_004`,clase_id:`clase_003`,ruta_nivel_id:`pnivel_003`,descripcion:`Ejecutar arpegio de Do Mayor con digitación correcta`,tipo:`destreza`,orden:1,activo:!0}],semaforos:[]},ub=[`bien`,`regular`,`mal`],db=class{constructor(e={}){this.id=e.id||null,this.claseId=e.claseId||null,this.objetivoId=e.objetivoId||null,this.fecha=e.fecha||``,this.notas=Array.isArray(e.notas)?e.notas:[]}validate(){let e=[];if(this.fecha){let t=new Date;t.setHours(23,59,59,999),new Date(this.fecha+`T23:59:59`)>t&&e.push(`La fecha no puede ser posterior a hoy`)}this.notas.length||e.push(`La lista de notas no puede estar vacía`);for(let t of this.notas)ub.includes(t.nota)||e.push(`Nota no válida: "${t.nota}". Debe ser bien, regular o mal`);return e}toJSON(){return{claseId:this.claseId,objetivoId:this.objetivoId,fecha:this.fecha,notas:this.notas.map(e=>({...e}))}}static calcularSemaforo({bien_count:e,regular_count:t,mal_count:n,total_registros:r}){return r===0?`gris`:n>r/2?`rojo`:e>=Math.ceil(r*.7)?`verde`:`naranja`}},fb=e({getHistorialContenido:()=>Cb,getObjetivosClase:()=>bb,getSemaforoClase:()=>xb,registrarSesion:()=>Sb}),pb=`bitacora_demo`,mb=1;function hb(){try{let e=localStorage.getItem(pb);if(e){let t=JSON.parse(e);if(t&&t.schemaVersion===mb)return t}}catch{}return gb()}function gb(){let e={schemaVersion:mb,sesiones:[...lb.sesiones||[]],objetivos:[...lb.objetivos||[]],semaforos:[...lb.semaforos||[]]};return localStorage.setItem(pb,JSON.stringify(e)),e}function _b(e){localStorage.setItem(pb,JSON.stringify(e))}function vb(e=100){return new Promise(t=>setTimeout(t,e))}function yb(){return`bit_`+Date.now().toString(36)+`_`+Math.random().toString(36).substr(2,6)}async function bb(e){return await vb(),hb().objetivos.filter(t=>t.clase_id===e&&t.activo!==!1).sort((e,t)=>e.orden-t.orden)}async function xb(e){await vb();let t=hb(),n=new Map;for(let r of t.sesiones)if(r.claseId===e)for(let e of r.notas){let t=e.alumno_id;n.has(t)||n.set(t,{alumno_id:t,bien_count:0,regular_count:0,mal_count:0,total_registros:0});let r=n.get(t),i=`${e.nota}_count`;i in r&&r[i]++,r.total_registros++}return Array.from(n.values()).map(e=>({...e,semaforo:db.calcularSemaforo(e)}))}async function Sb(e){await vb();let t=new db(e),n=t.validate();if(n.length>0)throw Error(n.join(`. `));let r=hb(),i={id:yb(),...t.toJSON(),created_at:new Date().toISOString()};return r.sesiones.push(i),_b(r),i}async function Cb(e,t){return await vb(),hb().sesiones.filter(n=>n.claseId===e&&n.objetivoId===t)}var wb=p.isDemoMode?fb:ib,Tb=e=>wb.getObjetivosClase(e),Eb=e=>wb.getSemaforoClase(e),Db=e=>wb.registrarSesion(e),Ob=(e,t)=>wb.getHistorialContenido(e,t),kb={verde:{class:`bg-success`,label:`Bien`,icon:`bi-check-circle-fill`},naranja:{class:`bg-warning`,label:`Regular`,icon:`bi-exclamation-circle-fill`},rojo:{class:`bg-danger`,label:`Mal`,icon:`bi-x-circle-fill`},gris:{class:`bg-secondary`,label:`Sin datos`,icon:`bi-dash-circle`}};function Ab(e){return e?String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]):``}function jb(e,t){let n=e?.find(e=>e.id===t);return n&&(n.nombre_completo||n.nombre||n.name)||t}function Mb(e,t){let n=kb[e]||kb.gris,r=[];t&&(t.bien_count>0&&r.push(`Bien: ${t.bien_count}`),t.regular_count>0&&r.push(`Regular: ${t.regular_count}`),t.mal_count>0&&r.push(`Mal: ${t.mal_count}`));let i=r.length?r.join(` | `):n.label;return`<span class="d-inline-block rounded-circle ${n.class}" 
    style="width:14px;height:14px;cursor:pointer" 
    title="${Ab(i)}"
    data-bs-toggle="tooltip"></span>`}function Nb(e){let t={};for(let n of e){let e=`${n.objetivo_id}::${n.alumno_id}`;t[e]=n}return t}async function Pb(e,t=[]){let n=document.createElement(`div`);n.className=`bitacora-dashboard`,n.innerHTML=`
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando bitácora...</span>
      </div>
    </div>`;try{let[r,i]=await Promise.all([Tb(e),Eb(e)]),a=[...r||[]].sort((e,t)=>(e.orden||0)-(t.orden||0)),o=[...new Set((i||[]).map(e=>e.alumno_id))],s=o.length?o.map(e=>t.find(t=>t.id===e)).filter(Boolean):t||[],c=Nb(i||[]);if(!a.length)return n.innerHTML=`
        <div class="text-center py-5">
          <i class="bi bi-journal-x d-block mb-3" style="font-size:2.5rem;opacity:.3"></i>
          <p class="text-muted mb-0">No hay objetivos de contenido registrados para esta clase.</p>
        </div>`,n;let l=i&&i.length>0;n.innerHTML=`
      <div class="table-responsive">
        <table class="table table-bordered table-hover table-sm mb-0 bitacora-grid">
          <thead class="table-light">
            <tr>
              <th style="min-width:200px">Objetivo</th>
              ${s.map(e=>`<th class="text-center" style="min-width:90px">
                  <span class="small fw-normal">${Ab(jb([e],e.id))}</span>
                </th>`).join(``)}
              <th class="text-center" style="width:80px">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${a.map(e=>{let t=e.titulo||e.descripcion||`Sin título`;return`
                <tr>
                  <td class="align-middle">
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge bg-secondary rounded-pill" style="font-size:.7rem">${e.orden||`-`}</span>
                      <span class="small">${Ab(t)}</span>
                    </div>
                  </td>
                  ${s.map(t=>{let n=c[`${e.id}::${t.id}`];return`
                      <td class="text-center align-middle">
                        ${Mb(n?n.semaforo:`gris`,n||{})}
                      </td>`}).join(``)}
                  <td class="text-center align-middle">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary btn-registrar" 
                        data-objetivo-id="${e.id}" title="Registrar sesión">
                        <i class="bi bi-plus-circle"></i>
                      </button>
                      ${l?`
                        <button class="btn btn-outline-secondary btn-historial" 
                          data-objetivo-id="${e.id}" title="Ver historial">
                          <i class="bi bi-clock-history"></i>
                        </button>
                      `:``}
                    </div>
                  </td>
                </tr>`}).join(``)}
          </tbody>
        </table>
      </div>`,n.querySelectorAll(`.btn-registrar`).forEach(e=>{e.addEventListener(`click`,()=>{n.dispatchEvent(new CustomEvent(`registrar-contenido`,{bubbles:!0,detail:{objetivoId:e.dataset.objetivoId}}))})}),n.querySelectorAll(`.btn-historial`).forEach(e=>{e.addEventListener(`click`,()=>{n.dispatchEvent(new CustomEvent(`ver-historial`,{bubbles:!0,detail:{objetivoId:e.dataset.objetivoId}}))})}),window.bootstrap?.Tooltip&&[...n.querySelectorAll(`[data-bs-toggle="tooltip"]`)].map(e=>new window.bootstrap.Tooltip(e))}catch(e){console.error(`[BitacoraDashboard]`,e),n.innerHTML=`
      <div class="alert alert-danger d-flex align-items-start gap-2 mb-0" role="alert">
        <i class="bi bi-exclamation-triangle fs-4 mt-1"></i>
        <div>
          <h6 class="alert-heading mb-1">Error al cargar la bitácora</h6>
          <p class="mb-0 small">${Ab(e.message)}</p>
        </div>
      </div>`}return n}var Fb=class{static createModal({id:e=`dynamicModal`,title:t,body:n,footer:r,size:i=``}){let a=document.getElementById(e);a&&a.remove();let s=`
      <div class="modal fade" id="${e}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog ${i}">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${t}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${n}
            </div>
            ${r?`<div class="modal-footer">${r}</div>`:``}
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML(`beforeend`,s);let c=document.getElementById(e);return c.addEventListener(`hidden.bs.modal`,()=>{c.remove()}),{element:c,instance:new o(c,{backdrop:`static`})}}static confirmDelete({title:e=`Confirmar Eliminación`,message:t,itemName:n,onConfirm:r}){let i=`
      <div class="text-center">
        <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
        <p class="mt-3">${t}</p>
        <p class="fw-bold mb-0">${n}</p>
        <p class="text-danger small mt-2">Esta acción no se puede deshacer.</p>
      </div>
    `,a=this.createModal({id:`modalDeleteDynamic`,title:e,body:i,footer:`
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
      <button type="button" class="btn btn-danger" id="btnDynamicConfirm">Eliminar</button>
    `});document.getElementById(`btnDynamicConfirm`).addEventListener(`click`,async e=>{let t=e.target;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Eliminando...`;try{await r(),a.instance.hide()}catch(e){t.disabled=!1,t.innerHTML=`Eliminar`,this.showToast(e.message||`Error al eliminar`,`error`)}}),a.instance.show()}static showToast(e,t=`info`){let n=document.getElementById(`toastContainer`);n||(n=document.createElement(`div`),n.id=`toastContainer`,n.className=`toast-container position-fixed top-0 end-0 p-3`,n.style.zIndex=`1055`,document.body.appendChild(n));let r=`toast-`+Date.now(),i=`
      <div id="${r}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header ${t===`success`?`bg-success`:t===`error`?`bg-danger`:`bg-info`} text-white">
          <i class="bi ${t===`success`?`bi-check-circle`:t===`error`?`bi-exclamation-circle`:`bi-info-circle`} me-2"></i>
          <strong class="me-auto">${t===`success`?`Éxito`:t===`error`?`Error`:`Información`}</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${this.escapeHTML(e)}
        </div>
      </div>
    `;n.insertAdjacentHTML(`beforeend`,i);let o=document.getElementById(r);new a(o,{autohide:!0,delay:3e3}).show(),o.addEventListener(`hidden.bs.toast`,()=>{o.remove()})}static escapeHTML(e){return e?e.replace(/[&<>]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`})[e]):``}};function Ib(e){return e?String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]):``}function Lb(){return new Date().toISOString().slice(0,10)}function Rb(e){return e.nombre_completo||e.nombre||e.name||`Sin nombre`}function zb(e={}){let{claseId:t,objetivoId:n,objetivoTitulo:r=`Objetivo`,alumnos:i=[]}=e,a=`
    <form id="formRegistrarContenido">
      <div class="mb-3">
        <label class="form-label">Objetivo</label>
        <div class="fw-semibold">${Ib(r)}</div>
      </div>

      <div class="mb-3">
        <label for="rcFecha" class="form-label">Fecha *</label>
        <input type="date" class="form-control" id="rcFecha" value="${Lb()}" required>
        <div class="invalid-feedback" id="rcFechaFeedback"></div>
      </div>

      <hr class="my-3">
      <p class="small text-muted mb-2">Evaluación por alumno:</p>

      <div id="rcAlumnosContainer">
        ${i.map(e=>`
          <div class="row g-2 align-items-center mb-2" data-alumno-id="${e.id}">
            <div class="col-md-6">
              <span class="small fw-medium">${Ib(Rb(e))}</span>
            </div>
            <div class="col-md-6">
              <select class="form-select form-select-sm rc-nota" required>
                <option value="">Seleccionar...</option>
                <option value="bien">Bien</option>
                <option value="regular">Regular</option>
                <option value="mal">Mal</option>
              </select>
            </div>
          </div>
        `).join(``)}
        ${i.length?``:`
          <div class="text-muted small">No hay alumnos disponibles para esta clase.</div>
        `}
      </div>
    </form>
  `,o=Fb.createModal({id:`modalRegistrarContenido`,title:`<i class="bi bi-plus-circle me-1"></i>Registrar Sesión de Contenido`,body:a,footer:`
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSubmitRegistrar">
      <i class="bi bi-save me-1"></i>Guardar sesión
    </button>
  `,size:`modal-lg`}),s=o.element;s.querySelector(`#btnSubmitRegistrar`).addEventListener(`click`,async()=>{let r=s.querySelector(`#btnSubmitRegistrar`),i=s.querySelector(`#rcFecha`);i.classList.remove(`is-invalid`);let a=i.value,c=new Date;if(c.setHours(23,59,59,999),new Date(a+`T23:59:59`)>c){i.classList.add(`is-invalid`),s.querySelector(`#rcFechaFeedback`).textContent=`La fecha no puede ser posterior a hoy`;return}let l=s.querySelectorAll(`.rc-nota`),u=[],d=!1;if(l.forEach(e=>{let t=e.closest(`[data-alumno-id]`)?.dataset.alumnoId,n=e.value;n&&(d=!0,u.push({alumno_id:t,nota:n}))}),!d){Fb.showToast(`Debe evaluar al menos un alumno.`,`error`);return}let f=new db({claseId:t,objetivoId:n,fecha:a,notas:u}),p=f.validate();if(p.length>0){Fb.showToast(p[0],`error`);return}r.disabled=!0,r.innerHTML=`<span class="spinner-border spinner-border-sm me-2"></span>Guardando...`;try{await Db(f.toJSON()),s.dispatchEvent(new CustomEvent(`saved`,{bubbles:!0,detail:{claseId:t,objetivoId:n,fecha:a}})),o.instance.hide(),e.onSave&&await e.onSave(f)}catch(e){Fb.showToast(e.message||`Error al guardar la sesión`,`error`),r.disabled=!1,r.innerHTML=`<i class="bi bi-save me-1"></i>Guardar sesión`}}),s.addEventListener(`hidden.bs.modal`,()=>{e.onCancel&&e.onCancel()}),o.instance.show()}function Bb(e){return e?String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]):``}function Vb(e){return e?new Date(e+`T00:00:00`).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}):`-`}function Hb(e){let t={bien:{class:`bg-success`,label:`Bien`,icon:`bi-check-circle`},regular:{class:`bg-warning text-dark`,label:`Regular`,icon:`bi-exclamation-circle`},mal:{class:`bg-danger`,label:`Mal`,icon:`bi-x-circle`}}[e]||{class:`bg-secondary`,label:e||`-`,icon:`bi-question`};return`<span class="badge ${t.class}"><i class="bi ${t.icon} me-1"></i>${t.label}</span>`}function Ub(e){return Array.isArray(e.notas)?e.notas:Array.isArray(e.indicator_session_students)?e.indicator_session_students.map(e=>({alumno_id:e.alumno_id||e.student_id,nota:e.nota_cualitativa||e.nota})):[]}async function Wb(e={}){let{claseId:t,objetivoId:n,objetivoTitulo:r=`Historial`,alumnos:i=[]}=e,a=Fb.createModal({id:`modalHistorialObjetivo`,title:`<i class="bi bi-clock-history me-1"></i>${Bb(r)}`,body:`
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando historial...</span>
      </div>
    </div>`,size:`modal-lg`});try{let e=await Ob(t,n);if(!e||e.length===0){a.element.querySelector(`.modal-body`).innerHTML=`
        <div class="text-center py-4">
          <i class="bi bi-inbox d-block mb-3" style="font-size:2.5rem;opacity:.3"></i>
          <p class="text-muted mb-0">No hay sesiones registradas para este objetivo.</p>
        </div>`;return}let r=[...new Set(e.flatMap(e=>Ub(e).map(e=>e.alumno_id)))],o={};for(let e of i)o[e.id]=e;a.element.querySelector(`.modal-body`).innerHTML=`
      <div class="table-responsive">
        <table class="table table-sm table-bordered mb-0">
          <thead class="table-light">
            <tr>
              <th style="min-width:110px">Fecha</th>
              ${r.map(e=>`<th class="text-center small">${Bb(o[e]&&(o[e].nombre_completo||o[e].nombre||o[e].name)||e)}</th>`).join(``)}
            </tr>
          </thead>
          <tbody>
            ${e.map(e=>{let t={};for(let n of Ub(e))t[n.alumno_id]=n.nota;return`
                <tr>
                  <td class="align-middle small text-muted">${Vb(e.fecha)}</td>
                  ${r.map(e=>`
                    <td class="text-center align-middle">
                      ${t[e]?Hb(t[e]):`<span class="text-muted small">-</span>`}
                    </td>
                  `).join(``)}
                </tr>`}).join(``)}
          </tbody>
        </table>
      </div>
      <div class="small text-muted mt-2 text-end">
        ${e.length} sesión(es) registrada(s)
      </div>`}catch(e){console.error(`[HistorialObjetivoPanel]`,e),a.element.querySelector(`.modal-body`).innerHTML=`
      <div class="alert alert-danger d-flex align-items-start gap-2 mb-0" role="alert">
        <i class="bi bi-exclamation-triangle fs-4 mt-1"></i>
        <div>
          <h6 class="alert-heading mb-1">Error al cargar historial</h6>
          <p class="mb-0 small">${Bb(e.message)}</p>
        </div>
      </div>`}}var $={claseId:null,container:null,dashboardEl:null,alumnos:[],objetivos:[],clases:[],loading:!1,destroyed:!1};function Gb(e){return e?String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]):``}function Kb(e){e.innerHTML=`
    <div class="page-container">
      <div class="d-flex justify-content-center align-items-center" style="min-height:400px">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando bitácora...</span>
        </div>
      </div>
    </div>`}function qb(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
          style="width:42px;height:42px">
          <i class="bi bi-journal-check fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Bitácora de Contenidos</h1>
          <p class="text-muted small mb-0">Seleccioná una clase para ver su semáforo</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="mb-3">
            <label for="clase-selector" class="form-label fw-semibold">Clase</label>
            <select id="clase-selector" class="form-select form-select-lg">
              <option value="">— Seleccioná una clase —</option>
              ${t.map(e=>`<option value="${Gb(e.id)}">${Gb(e.nombre)} (${Gb(e.instrumento||``)})</option>`).join(``)}
            </select>
          </div>
          <button id="btn-ir-bitacora" class="btn btn-success" disabled>
            <i class="bi bi-eye me-1"></i>Ver Bitácora
          </button>
        </div>
      </div>
    </div>`;let n=e.querySelector(`#clase-selector`),r=e.querySelector(`#btn-ir-bitacora`);n.addEventListener(`change`,()=>{r.disabled=!n.value}),r.addEventListener(`click`,()=>{n.value&&window.router.navigate(`bitacora-clase`,{claseId:n.value})})}async function Jb(){try{let e=await ye();if(Array.isArray(e)&&e.length>0)return e}catch{}try{let{default:e}=await d(async()=>{let{default:e}=await import(`./clases-CdwqU54c.js`).then(e=>e.n);return{default:e}},__vite__mapDeps([9,4]));return(e?.clases||[]).map(e=>({id:e.id,nombre:e.nombre,instrumento:e.instrumento,grado:e.grado}))}catch{return[]}}function Yb(e,t){e.innerHTML=`
    <div class="page-container">
      <div class="alert alert-warning d-flex align-items-start gap-3" role="alert">
        <i class="bi bi-database-exclamation fs-3 text-warning mt-1"></i>
        <div>
          <h5 class="alert-heading mb-1">Error al cargar la bitácora</h5>
          <p class="mb-0 small">${Gb(t)}</p>
        </div>
      </div>
    </div>`}function Xb(e){e.innerHTML=`
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
          style="width:42px;height:42px">
          <i class="bi bi-journal-check fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Bitácora de Contenidos</h1>
          <p class="text-muted small mb-0">Seguimiento de objetivos por alumno</p>
        </div>
        <button class="btn btn-outline-secondary btn-sm ms-auto" id="btn-refresh-bitacora">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
        </button>
      </div>
      <div id="bitacora-dashboard-container"></div>
    </div>`,$.container=e}async function Zb(){let e=$.container?.querySelector(`#bitacora-dashboard-container`);if(e){e.innerHTML=`
    <div class="d-flex justify-content-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>`;try{let t=await Pb($.claseId,$.alumnos);e.innerHTML=``,e.appendChild(t),$.dashboardEl=t}catch(t){e.innerHTML=`
      <div class="alert alert-danger mb-0">
        <i class="bi bi-exclamation-triangle me-2"></i>${Gb(t.message)}
      </div>`}}}function Qb(){let e=$.container;e&&(e.addEventListener(`click`,e=>{e.target.closest(`#btn-refresh-bitacora`)&&Zb()}),e.addEventListener(`registrar-contenido`,e=>{if($.destroyed)return;let{objetivoId:t}=e.detail||{};if(!t)return;let n=$.objetivos.find(e=>e.id===t),r=n?.titulo||n?.descripcion||`Objetivo`;zb({claseId:$.claseId,objetivoId:t,objetivoTitulo:r,alumnos:$.alumnos,onSave:()=>Zb()})}),e.addEventListener(`ver-historial`,e=>{if($.destroyed)return;let{objetivoId:t}=e.detail||{};if(!t)return;let n=$.objetivos.find(e=>e.id===t),r=n?.titulo||n?.descripcion||`Historial`;Wb({claseId:$.claseId,objetivoId:t,objetivoTitulo:r,alumnos:$.alumnos})}))}async function $b(e,t={}){if(e){if($.claseId=t.claseId||t.id,$.container=e,$.destroyed=!1,!$.claseId){try{$.loading=!0,Kb(e);let t=await Jb();if($.clases=Array.isArray(t)?t:[],$.loading=!1,$.destroyed)return;if($.clases.length===0){Yb(e,`No hay clases disponibles.`);return}qb(e,$.clases)}catch(t){if($.destroyed)return;Yb(e,t.message)}return}try{$.loading=!0,Kb(e);let[t,n]=await Promise.all([Re(),Tb($.claseId)]);if($.alumnos=Array.isArray(t)?t:[],$.objetivos=Array.isArray(n)?n:[],$.loading=!1,$.destroyed)return;Xb(e),Qb(),await Zb()}catch(t){if(console.error(`[bitacoraView]`,t),$.destroyed)return;Yb(e,t.message)}}}function ex(){f.register(`bitacora-clase`,$b)}var tx=[`DIR`,`ACM`,`ADM`,`FIN`,`LOG`,`COM`,`TECNICO`],nx=[`baja`,`media`,`alta`,`critica`],rx=`Sos el clasificador de solicitudes institucionales de "El Sistema Punta Cana".
Dada una solicitud en texto libre, identificás qué DEPARTAMENTO debe atenderla y resumís la tarea.

Departamentos:
- DIR: Dirección — decisiones ejecutivas, protocolo, alianzas, invitaciones a autoridades.
- ACM: Académica — clases, repertorio, ensayos, pedagogía, progresos de alumnos.
- ADM: Administración — inscripciones, datos de alumnos/maestros, personal, aprobaciones.
- FIN: Financiero — pagos, cobros, presupuesto, RELACIONES DE PAGO, viáticos, aranceles, facturas.
- LOG: Logística — instrumentos, inventario, comodatos, transporte, montaje, sonido físico.
- COM: Comunicaciones — difusión, prensa, redes, correos institucionales, piezas gráficas.
- TECNICO: Técnico — sonido, escenario, soporte técnico, mantenimiento de equipos.

Devolvé SOLO un JSON válido (sin texto adicional, sin markdown) con esta forma EXACTA:
{"departamento":"FIN","titulo":"...","descripcion":"...","prioridad":"media","confianza":0.0}

Reglas:
- departamento ∈ DIR|ACM|ADM|FIN|LOG|COM|TECNICO (el más adecuado).
- titulo: imperativo y corto (máx ~8 palabras).
- descripcion: la solicitud completa, clara.
- prioridad ∈ baja|media|alta|critica (según urgencia evidente; ante la duda, media).
- confianza: número 0..1 de qué tan seguro estás del departamento.`;function ix(e){if(!e)throw Error(`Respuesta vacía de la IA`);let t=String(e).trim();t=t.replace(/^```(?:json)?/i,``).replace(/```$/,``).trim();let n=t.match(/\{[\s\S]*\}/);return n&&(t=n[0]),JSON.parse(t)}async function ax(e){let t=await u([{role:`system`,content:rx},{role:`user`,content:e}]),n=ix(typeof t==`string`?t:t?.content||``),r=tx.includes(n.departamento)?n.departamento:`DIR`,i=nx.includes(n.prioridad)?n.prioridad:`media`;return{departamento:r,titulo:(n.titulo||`Solicitud institucional`).toString().trim(),descripcion:(n.descripcion||e).toString().trim(),prioridad:i,confianza:typeof n.confianza==`number`?n.confianza:.5}}var ox={DIR:`Dirección`,ACM:`Académica`,ADM:`Administración`,FIN:`Financiero`,LOG:`Logística`,COM:`Comunicaciones`,TECNICO:`Técnico`},sx={DIR:`bi-bullseye`,ACM:`bi-easel`,ADM:`bi-clipboard-data`,FIN:`bi-cash-coin`,LOG:`bi-box-seam`,COM:`bi-megaphone`,TECNICO:`bi-tools`},cx={concierto:`Concierto`,ensayo:`Ensayo`,reunion:`Reunión`,patrocinio:`Patrocinio`,pago:`Pago`,corte:`Corte`,inscripcion:`Inscripción`,auditoria:`Auditoría`,otro:`Otro`},lx=null;async function ux(e){lx?.abort(),lx=new AbortController;try{dx(e);let t=await Rt();gx(e,t),xx(e,t)}catch(t){console.error(`[ScoreDirector] Error:`,t.message),fx(e,t.message)}return{teardown:()=>lx?.abort()}}function dx(e){e.innerHTML=`
    <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted">Cargando Score del Director...</p>
      </div>
    </div>
  `}function fx(e,t){e.innerHTML=`
    <div class="container mt-5">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar</h4>
        <p>${Ax(t)}</p>
        <button class="btn btn-primary btn-sm" id="retryBtn"><i class="bi bi-arrow-clockwise"></i> Reintentar</button>
      </div>
    </div>
  `,e.querySelector(`#retryBtn`)?.addEventListener(`click`,()=>ux(e),{signal:lx.signal})}function px(e){return!e.fecha_vencimiento||e.estado===`completada`||e.estado===`cancelada`?!1:new Date(e.fecha_vencimiento)<mx()}function mx(){let e=new Date;return e.setHours(0,0,0,0),e}function hx(e){let t={};for(let e of Object.keys(ox))t[e]={total:0,pendiente:0,en_progreso:0,bloqueada:0,completada:0,cancelada:0,vencidas:0,criticas:0};for(let n of e){let e=t[n.departamento];e&&(e.total++,e[n.estado]!==void 0&&e[n.estado]++,px(n)&&e.vencidas++,n.prioridad===`critica`&&n.estado!==`completada`&&n.estado!==`cancelada`&&e.criticas++)}return t}function gx(e,t){let n=hx(t),r=t.length,i=e=>t.filter(t=>t.estado===e).length,a=t.filter(px).length,o=t.filter(e=>e.prioridad===`critica`&&e.estado!==`completada`&&e.estado!==`cancelada`).length,s=Object.keys(ox).map(e=>({dept:e,s:n[e]})).filter(e=>e.s.total>0).sort((e,t)=>_x(t.s)-_x(e.s));e.innerHTML=`
    <div class="page-container">
      <div class="tareas-header mb-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div class="d-flex align-items-center gap-3">
            <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
              <i class="bi bi-bullseye fs-4"></i>
            </div>
            <div>
              <h1 class="tareas-title mb-0">Score del Director</h1>
              <p class="text-muted small mb-0">Vista global · Hermes · ${r} tareas en ${s.length} departamentos</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" id="btnAsignarTarea">
              <i class="bi bi-stars me-1"></i> Asignar tarea (IA)
            </button>
            <button class="btn btn-primary" id="btnCrearEvento">
              <i class="bi bi-calendar-plus me-1"></i> Crear evento
            </button>
          </div>
        </div>

        <div class="tareas-kpis d-flex gap-2 flex-wrap">
          ${vx(`Total`,r,`primary`)}
          ${vx(`Pendientes`,i(`pendiente`),`secondary`)}
          ${vx(`En Progreso`,i(`en_progreso`),`info`)}
          ${vx(`Bloqueadas`,i(`bloqueada`),`danger`)}
          ${vx(`Vencidas`,a,`warning`)}
          ${vx(`Críticas`,o,`danger`)}
          ${vx(`Completadas`,i(`completada`),`success`)}
        </div>
      </div>

      <h6 class="text-muted text-uppercase small fw-bold mb-3">
        <i class="bi bi-diagram-3 me-1"></i> Saturación por departamento
      </h6>
      <div class="row g-3 mb-2">
        ${s.length===0?`<div class="col-12"><div class="alert alert-info text-center py-4"><i class="bi bi-inbox"></i> Aún no hay tareas. Creá un evento para disparar la cascada Hermes.</div></div>`:s.map(({dept:e,s:t})=>yx(e,t)).join(``)}
      </div>
    </div>
  `}function _x(e){return e.pendiente+e.en_progreso+e.bloqueada}function vx(e,t,n){return`
    <div class="kpi-card bg-${n} bg-opacity-10 p-2 rounded">
      <small class="text-muted">${e}</small>
      <div class="fs-5 fw-bold text-${n}">${t}</div>
    </div>
  `}function yx(e,t){let n=_x(t),r=t.total>0?Math.round(n/t.total*100):0,i=t.bloqueada>0||t.vencidas>0,a=r>=75?`danger`:r>=40?`warning`:`success`;return`
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card border-0 shadow-sm h-100 score-dept-card" data-dept="${e}" style="cursor:pointer">
        <div class="card-body p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <i class="bi ${sx[e]||`bi-building`} fs-5 text-primary"></i>
              <span class="fw-bold">${ox[e]}</span>
              <span class="badge bg-light text-dark border">${e}</span>
            </div>
            ${i?`<span class="badge bg-danger" title="Cuello de botella"><i class="bi bi-exclamation-octagon-fill me-1"></i>Cuello</span>`:``}
          </div>

          <div class="d-flex justify-content-between align-items-center mb-1">
            <small class="text-muted">Saturación (${n}/${t.total} abiertas)</small>
            <small class="fw-bold text-${a}">${r}%</small>
          </div>
          <div class="progress mb-3" style="height: 8px;">
            <div class="progress-bar bg-${a}" style="width: ${r}%"></div>
          </div>

          <div class="d-flex flex-wrap gap-1">
            ${bx(`Pend.`,t.pendiente,`secondary`)}
            ${bx(`Progr.`,t.en_progreso,`info`)}
            ${t.bloqueada>0?bx(`Bloq.`,t.bloqueada,`danger`):``}
            ${t.vencidas>0?bx(`Venc.`,t.vencidas,`warning`):``}
            ${t.criticas>0?bx(`Crít.`,t.criticas,`danger`):``}
            ${bx(`Compl.`,t.completada,`success`)}
          </div>
        </div>
      </div>
    </div>
  `}function bx(e,t,n){return`<span class="badge bg-${n} bg-opacity-75">${e} ${t}</span>`}function xx(e,t){let n=lx.signal;e.querySelector(`#btnCrearEvento`)?.addEventListener(`click`,()=>Ex(e),{signal:n}),e.querySelector(`#btnAsignarTarea`)?.addEventListener(`click`,()=>Ox(e),{signal:n}),e.querySelectorAll(`.score-dept-card`).forEach(r=>{r.addEventListener(`click`,()=>{let n=r.dataset.dept;window.router?.navigate&&Sx(e,t,n)},{signal:n})})}function Sx(e,t,n){let r=t.filter(e=>e.departamento===n).sort((e,t)=>Cx(e.prioridad)-Cx(t.prioridad));_.open({title:`Tareas — ${ox[n]} (${n})`,size:`lg`,body:r.length===0?`<div class="alert alert-info">Sin tareas en este departamento.</div>`:`<div class="list-group list-group-flush">
          ${r.map(e=>{let t=px(e);return`
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div class="fw-semibold">${Ax(e.titulo)}</div>
                  <small class="text-muted">${e.fecha_vencimiento||`sin fecha`}${t?` · <span class="text-danger">vencida</span>`:``}</small>
                </div>
                <div class="text-end">
                  <span class="badge bg-${wx(e.prioridad)}">${e.prioridad}</span>
                  <span class="badge bg-${Tx(e.estado)}">${e.estado}</span>
                </div>
              </div>
            </div>`}).join(``)}
        </div>`,hideSave:!0,cancelText:`Cerrar`})}function Cx(e){return{critica:0,alta:1,media:2,baja:3}[e]??9}function wx(e){return{critica:`danger`,alta:`warning`,media:`info`,baja:`secondary`}[e]||`secondary`}function Tx(e){return{pendiente:`secondary`,en_progreso:`info`,completada:`success`,bloqueada:`danger`,cancelada:`dark`}[e]||`secondary`}function Ex(e){let t=new Date().toISOString().slice(0,10);_.open({title:`Crear evento institucional`,size:`lg`,body:`
      <div class="alert alert-info small py-2">
        <i class="bi bi-robot me-1"></i> Al crear el evento, Hermes generará automáticamente las
        tareas departamentales según el protocolo de la categoría.
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold">Título <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="evTitulo" placeholder="Ej. Concierto de Gala de Fin de Año" required>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Categoría <span class="text-danger">*</span></label>
          <select class="form-select" id="evCategoria">
            ${Object.entries(cx).map(([e,t])=>`<option value="${e}" ${e===`concierto`?`selected`:``}>${t}</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Departamento responsable</label>
          <select class="form-select" id="evDepto">
            ${Object.entries(ox).map(([e,t])=>`<option value="${e}" ${e===`DIR`?`selected`:``}>${t} (${e})</option>`).join(``)}
          </select>
        </div>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Fecha inicio <span class="text-danger">*</span></label>
          <input type="date" class="form-control" id="evInicio" value="${t}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Fecha fin</label>
          <input type="date" class="form-control" id="evFin" value="${t}">
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold">Ubicación</label>
        <input type="text" class="form-control" id="evUbicacion" placeholder="Ej. Teatro Nacional, Salón principal">
      </div>
      <div class="mb-2">
        <label class="form-label small fw-semibold">Descripción</label>
        <textarea class="form-control" id="evDescripcion" rows="2" placeholder="Detalles del evento..."></textarea>
      </div>
    `,saveText:`Crear y disparar cascada`,onSave:async t=>{let n=t.querySelector(`#evTitulo`).value.trim(),r=t.querySelector(`#evInicio`).value;if(!n)return c.show(`El título es obligatorio`,`error`),!1;if(!r)return c.show(`La fecha de inicio es obligatoria`,`error`),!1;let i={titulo:n,categoria:t.querySelector(`#evCategoria`).value,departamento_responsable:t.querySelector(`#evDepto`).value,fecha_inicio:new Date(r).toISOString(),fecha_fin:new Date(t.querySelector(`#evFin`).value||r).toISOString(),ubicacion:t.querySelector(`#evUbicacion`).value.trim()||null,descripcion:t.querySelector(`#evDescripcion`).value.trim()||null};try{let{tareasGeneradas:t}=await Lt(i),n=t?.length||0;c.show(n>0?`Evento creado · Hermes generó ${n} tarea${n===1?``:`s`}`:`Evento creado (sin tareas para esta categoría)`,`success`),await ux(e)}catch(e){return c.show(`Error: ${e.message}`,`error`),!1}}})}var Dx={baja:`Baja`,media:`Media`,alta:`Alta`,critica:`Crítica`};function Ox(e){_.open({title:`Asignar tarea desde texto`,size:`lg`,body:`
      <div class="alert alert-info small py-2">
        <i class="bi bi-stars me-1"></i> Pegá la solicitud en texto libre. La IA detecta el
        departamento que debe atenderla y arma la tarea. Vos confirmás antes de crearla.
      </div>
      <textarea class="form-control" id="atTexto" rows="4"
        placeholder="Ej. Necesito que me manden la relación de pago del mes de febrero"></textarea>
    `,saveText:`<i class="bi bi-stars me-1"></i>Analizar con IA`,onSave:async t=>{let n=t.querySelector(`#atTexto`).value.trim();if(!n)return c.show(`Escribí la solicitud primero`,`error`),!1;try{let t=await ax(n);setTimeout(()=>kx(e,t),50)}catch(e){return c.show(`IA no disponible: ${e.message}`,`error`),!1}}})}function kx(e,t){let n=Math.round((t.confianza??.5)*100);_.open({title:`Confirmar y asignar tarea`,size:`lg`,body:`
      <div class="d-flex align-items-center gap-2 mb-3">
        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">
          <i class="bi bi-robot me-1"></i>IA sugiere: ${ox[t.departamento]||t.departamento}
        </span>
        <span class="text-muted small">confianza ${n}%</span>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Departamento <span class="text-danger">*</span></label>
          <select class="form-select" id="atDepto">
            ${Object.entries(ox).map(([e,n])=>`<option value="${e}" ${e===t.departamento?`selected`:``}>${n} (${e})</option>`).join(``)}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Prioridad</label>
          <select class="form-select" id="atPrioridad">
            ${Object.entries(Dx).map(([e,n])=>`<option value="${e}" ${e===t.prioridad?`selected`:``}>${n}</option>`).join(``)}
          </select>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label small fw-semibold">Título <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="atTitulo" value="${Ax(t.titulo)}">
      </div>
      <div class="mb-2">
        <label class="form-label small fw-semibold">Descripción</label>
        <textarea class="form-control" id="atDescripcion" rows="3">${Ax(t.descripcion)}</textarea>
      </div>
      <p class="text-muted extra-small mb-0">
        <i class="bi bi-info-circle me-1"></i> Al crearla, aparece en el portal del departamento.
        Si es <strong>alta</strong> o <strong>crítica</strong>, Hermes encola un aviso de WhatsApp al encargado.
      </p>
    `,saveText:`Crear y asignar`,onSave:async t=>{let n=t.querySelector(`#atTitulo`).value.trim();if(!n)return c.show(`El título es obligatorio`,`error`),!1;let r=t.querySelector(`#atDepto`).value;try{await It({titulo:n,descripcion:t.querySelector(`#atDescripcion`).value.trim()||null,departamento:r,prioridad:t.querySelector(`#atPrioridad`).value,estado:`pendiente`}),c.show(`Tarea creada y asignada a ${ox[r]||r}`,`success`),await ux(e)}catch(e){return c.show(`Error: ${e.message}`,`error`),!1}}})}function Ax(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}export{Yr as C,wi as S,an as T,Yf as _,Ty as a,iu as b,Bv as c,yg as d,ug as f,up as g,Xp as h,qy as i,zv as l,Kh as m,ex as n,gy as o,qh as p,rb as r,_y as s,ux as t,Vg as u,td as v,In as w,Ul as x,Pu as y};