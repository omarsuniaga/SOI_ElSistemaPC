import"./modulepreload-polyfill-Ke7zwH0v.js";import{i as e}from"./supabase-KnARm58N.js";import"./vendor-CtPF6k7y.js";/* empty css                        */import{t}from"./horarioBuilderView-DRwv7jv4.js";async function n(t){let{data:n}=await e.from(`profiles`).select(`rol`).eq(`id`,t).maybeSingle();return[`admin`,`superadmin`,`coordinacion_academica`,`direccion`].includes(n?.rol)}function r(t,a=null){t.style.background=``,t.innerHTML=`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)">
      <div style="background:#fff;border-radius:16px;padding:2.5rem;width:100%;max-width:380px;
        box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="width:56px;height:56px;background:#e0e7ff;border-radius:50%;
            display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
            <i class="bi bi-calendar-week" style="font-size:1.5rem;color:#4f46e5"></i>
          </div>
          <h4 style="color:#111;margin:0;font-weight:700">Calendario Global</h4>
          <p style="color:#6b7280;font-size:0.875rem;margin-top:0.25rem">Gestión de Horarios y Clases</p>
        </div>
        ${a?`<div class="alert alert-danger py-2 small">${a}</div>`:``}
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
  `,document.querySelector(`#login-form`)?.addEventListener(`submit`,async a=>{a.preventDefault();let o=document.querySelector(`#email`).value,s=document.querySelector(`#password`).value,c=document.querySelector(`#btn-login`),l=document.querySelector(`#login-error`);c.disabled=!0,c.textContent=`Iniciando...`,l.classList.add(`d-none`);let{data:u,error:d}=await e.auth.signInWithPassword({email:o,password:s});if(d){l.textContent=`Credenciales incorrectas.`,l.classList.remove(`d-none`),c.disabled=!1,c.textContent=`Iniciar sesión`;return}if(!await n(u.session.user.id)){await e.auth.signOut(),r(t,`Tu cuenta no tiene permisos para gestionar el calendario.`);return}i(t,u.session)})}function i(n,r){let i=r?.user?.email??`Usuario`;n.style.background=`#f8fafc`,n.innerHTML=`
    <nav style="background:linear-gradient(90deg,#4f46e5,#7c3aed);color:#fff;
      padding:0 1.5rem;height:56px;display:flex;align-items:center;
      justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:sticky;top:0;z-index:100">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <i class="bi bi-calendar-event-fill" style="font-size:1.25rem"></i>
        <span style="font-weight:700;font-size:1rem;letter-spacing:0.02em">Portal de Calendario Global</span>
      </div>
      <div style="display:flex;align-items:center;gap:1rem">
        <span style="font-size:0.8125rem;opacity:0.85">${i}</span>
        <button id="btn-logout" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
          color:#fff;border-radius:8px;padding:0.25rem 0.75rem;font-size:0.8125rem;cursor:pointer">
          <i class="bi bi-box-arrow-right me-1"></i>Salir
        </button>
      </div>
    </nav>
    <div id="portal-content" style="padding: 1.5rem; min-height:calc(100vh - 56px)"></div>
  `;let a=n.querySelector(`#portal-content`);n.querySelector(`#btn-logout`)?.addEventListener(`click`,async()=>{await e.auth.signOut(),window.location.reload()}),t(a)}async function a(){let t=document.querySelector(`#app`),{data:{session:a},error:o}=await e.auth.getSession();if(o||!a){r(t);return}if(!await n(a.user.id)){r(t,`Tu cuenta no tiene permisos para gestionar el calendario.`);return}i(t,a)}a();