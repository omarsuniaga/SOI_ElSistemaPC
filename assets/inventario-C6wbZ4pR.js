import"./early-error-suppression-K9hxPIVV.js";import{i as e}from"./supabase-Cgh_dhNB.js";import"./vendor-mK9cUK6A.js";import{t}from"./tareasView-D7s9Oetn.js";import{a as n,i as r,n as i,o as a,r as o,t as s}from"./historialInstrumentoView-BQYABJVg.js";function c(c,l){let u=l?.user?.email??`Usuario`;c.style.background=`#f8fafc`,c.innerHTML=`
    <nav style="background:linear-gradient(90deg,#2563eb,#0891b2);color:#fff;
      padding:0 1.5rem;height:56px;display:flex;align-items:center;
      justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:sticky;top:0;z-index:100">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <i class="bi bi-music-note-list" style="font-size:1.25rem"></i>
        <span style="font-weight:700;font-size:1rem;letter-spacing:0.02em">Portal de Inventario</span>
      </div>
      <div style="display:flex;align-items:center;gap:1rem">
        <span style="font-size:0.8125rem;opacity:0.85">${u}</span>
        <button id="btn-logout" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
          color:#fff;border-radius:8px;padding:0.25rem 0.75rem;font-size:0.8125rem;cursor:pointer">
          <i class="bi bi-box-arrow-right me-1"></i>Salir
        </button>
      </div>
    </nav>

    <div style="background:#fff;border-bottom:1px solid #e2e8f0;padding:0 1.5rem;display:flex;gap:0">
      <button class="portal-tab active" data-view="dashboard"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-speedometer2 me-1"></i>Inicio
      </button>
      <button class="portal-tab" data-view="stock"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-music-note-list me-1"></i>Instrumentos
      </button>
      <button class="portal-tab" data-view="comodatos"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-clipboard-check me-1"></i>Comodatos
      </button>
      <button class="portal-tab" data-view="alertas"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-exclamation-triangle me-1"></i>Alertas
      </button>
      <button class="portal-tab" data-view="tareas"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-list-task me-1"></i>Tareas (Hermes)
      </button>
    </div>

    <div id="portal-content" style="background:#f8fafc;min-height:calc(100vh - 105px)"></div>
  `;let d=c.querySelector(`#portal-content`),f=null;function p(e){c.querySelectorAll(`.portal-tab`).forEach(t=>{let n=t.dataset.view===e;t.style.borderBottomColor=n?`#2563eb`:`transparent`,t.style.color=n?`#2563eb`:`#64748b`}),f?.teardown?.(),e===`dashboard`?o(d).then(e=>{f=e}):e===`stock`?a(d).then(e=>{f=e}):e===`comodatos`?n(d).then(e=>{f=e}):e===`alertas`?r(d).then(e=>{f=e}):e===`tareas`&&t(d,{departamento:`LOG`,hideCalendarBtn:!0}).then(e=>{f=e})}c.querySelectorAll(`.portal-tab`).forEach(e=>{e.addEventListener(`click`,()=>p(e.dataset.view))}),c.querySelector(`#btn-logout`)?.addEventListener(`click`,async()=>{await e.auth.signOut(),window.location.reload()}),window.router={navigate:(e,t)=>{e===`inventario-dashboard`?p(`dashboard`):e===`inventario-stock`?p(`stock`):e===`inventario-comodatos`?p(`comodatos`):e===`inventario-alertas`?p(`alertas`):e===`inventario-tareas`?p(`tareas`):e===`inventario-detalle`?(f?.teardown?.(),i(d,t).then(e=>{f=e})):e===`inventario-historial`&&(f?.teardown?.(),s(d,t).then(e=>{f=e}))}},p(`dashboard`)}async function l(t){let{data:n}=await e.from(`profiles`).select(`rol`).eq(`id`,t).maybeSingle();return n?.rol===`admin`||n?.rol===`inventarista`}function u(t,n=null){t.style.background=``,t.innerHTML=`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#2563eb 0%,#0891b2 100%)">
      <div style="background:#fff;border-radius:16px;padding:2.5rem;width:100%;max-width:380px;
        box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;background:#dbeafe;border-radius:50%;
            display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <i class="bi bi-music-note-list" style="font-size:1.5rem;color:#2563eb"></i>
          </div>
          <h4 style="color:#111;margin:0;font-weight:700">Portal de Inventario</h4>
          <p style="color:#6b7280;font-size:0.875rem;margin-top:0.25rem">El Sistema Punta Cana</p>
        </div>
        ${n?`<div class="alert alert-danger py-2 small">${n}</div>`:``}
        <form id="login-form">
          <div class="mb-3">
            <input type="email" id="email" class="form-control" placeholder="Correo electrónico" required autofocus />
          </div>
          <div class="mb-4">
            <input type="password" id="password" class="form-control" placeholder="Contraseña" required />
          </div>
          <div id="login-error" class="alert alert-danger d-none small py-2"></div>
          <button type="submit" id="btn-login" class="btn w-100 fw-semibold"
            style="background:#2563eb;color:#fff;border:none">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  `,document.querySelector(`#login-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let r=document.querySelector(`#email`).value,i=document.querySelector(`#password`).value,a=document.querySelector(`#btn-login`),o=document.querySelector(`#login-error`);a.disabled=!0,a.textContent=`Entrando...`,o.classList.add(`d-none`);let{data:s,error:d}=await e.auth.signInWithPassword({email:r,password:i});if(d){o.textContent=`Credenciales incorrectas.`,o.classList.remove(`d-none`),a.disabled=!1,a.textContent=`Iniciar sesión`;return}if(!await l(s.session.user.id)){await e.auth.signOut(),u(t,`Tu cuenta no tiene acceso a este portal.`);return}c(t,s.session)})}async function d(){let t=document.querySelector(`#app`),{data:{session:n},error:r}=await e.auth.getSession();if(r||!n){u(t);return}if(!await l(n.user.id)){u(t,`Tu cuenta no tiene acceso a este portal.`);return}c(t,n)}d();