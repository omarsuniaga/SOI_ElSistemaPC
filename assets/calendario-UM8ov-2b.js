import"./modulepreload-polyfill-Dezn_h7o.js";import{i as e}from"./supabase--PHJV0L9.js";import"./vendor-fghBzJSA.js";/* empty css                        */import{t}from"./horarioBuilderView-C2qqSWF4.js";import{t as n}from"./tareasView-BZ-pRirb.js";async function r(t){let{data:n}=await e.from(`profiles`).select(`rol`).eq(`id`,t).maybeSingle();return[`admin`,`superadmin`,`coordinacion_academica`,`direccion`].includes(n?.rol)}function i(t,n=null){t.style.background=``,t.innerHTML=`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)">
      <div style="background:#fff;border-radius:16px;padding:2.5rem;width:100%;max-width:380px;
        box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;background:#e0e7ff;border-radius:50%;
            display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <i class="bi bi-calendar-week" style="font-size:1.5rem;color:#4f46e5"></i>
          </div>
          <h4 style="color:#111;margin:0;font-weight:700">Fechas Globales</h4>
          <p style="color:#6b7280;font-size:0.875rem;margin-top:0.25rem">Gestión de horarios y clases</p>
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
          <button type="submit" id="btn-login" class="btn w-100 text-white fw-semibold"
            style="background:#4f46e5;border:none">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  `,document.querySelector(`#login-form`)?.addEventListener(`submit`,async n=>{n.preventDefault();let o=document.querySelector(`#email`).value,s=document.querySelector(`#password`).value,c=document.querySelector(`#btn-login`),l=document.querySelector(`#login-error`);c.disabled=!0,c.textContent=`Iniciando...`,l.classList.add(`d-none`);let{data:u,error:d}=await e.auth.signInWithPassword({email:o,password:s});if(d){l.textContent=`Credenciales incorrectas.`,l.classList.remove(`d-none`),c.disabled=!1,c.textContent=`Iniciar sesión`;return}if(!await r(u.session.user.id)){await e.auth.signOut(),i(t,`Tu cuenta no tiene permisos para gestionar las fechas.`);return}a(t,u.session)})}function a(r,i){let a=i?.user?.email??`Usuario`;r.style.background=`#f8fafc`,r.innerHTML=`
    <nav style="background:linear-gradient(90deg,#4f46e5,#7c3aed);color:#fff;
      padding:0 1.5rem;height:56px;display:flex;align-items:center;
      justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:sticky;top:0;z-index:100">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <i class="bi bi-calendar-event-fill" style="font-size:1.25rem"></i>
        <span style="font-weight:700;font-size:1rem;letter-spacing:0.02em">Portal de Fechas Globales</span>
      </div>
      <div style="display:flex;align-items:center;gap:1rem">
        <span style="font-size:0.8125rem;opacity:0.85">${a}</span>
        <button id="btn-logout" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
          color:#fff;border-radius:8px;padding:0.25rem 0.75rem;font-size:0.8125rem;cursor:pointer">
          <i class="bi bi-box-arrow-right me-1"></i>Salir
        </button>
      </div>
    </nav>
    <div style="background:#fff;border-bottom:1px solid #e2e8f0;padding:0 1.5rem;display:flex;gap:0">
      <button class="portal-tab active" data-view="horario"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-calendar-week me-1"></i>Horarios
      </button>
      <button class="portal-tab" data-view="tareas"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-list-task me-1"></i>Tareas (Hermes)
      </button>
    </div>
    <div id="portal-content" style="padding: 1.5rem; min-height:calc(100vh - 105px)"></div>
  `;let o=r.querySelector(`#portal-content`),s=null;function c(e){r.querySelectorAll(`.portal-tab`).forEach(t=>{let n=t.dataset.view===e;t.style.borderBottomColor=n?`#4f46e5`:`transparent`,t.style.color=n?`#4f46e5`:`#64748b`}),s?.teardown?.(),e===`tareas`?n(o,{hideCalendarBtn:!0}).then(e=>{s=e}):(t(o),s=null)}r.querySelectorAll(`.portal-tab`).forEach(e=>{e.addEventListener(`click`,()=>c(e.dataset.view))}),r.querySelector(`#btn-logout`)?.addEventListener(`click`,async()=>{await e.auth.signOut(),window.location.reload()}),c(`horario`)}async function o(){let t=document.querySelector(`#app`),{data:{session:n},error:o}=await e.auth.getSession();if(o||!n){i(t);return}if(!await r(n.user.id)){i(t,`Tu cuenta no tiene permisos para gestionar las fechas.`);return}a(t,n)}o();