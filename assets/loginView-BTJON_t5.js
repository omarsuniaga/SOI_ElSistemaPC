import{a as e}from"./maestroAuth-lT-ZcZZd.js";import{n as t}from"./usePortalAuth-Cvu3esVL.js";import{n,r}from"./a11yUtils-DoZA0IX7.js";function i(i,{onSuccess:a}){i.innerHTML=`
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
            <input type="checkbox" id="pm-keep-session" checked />
            Mantener sesión activa (30 días)
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
          <a href="#" data-route="register" class="pm-link">¿No tienes cuenta? Regístrate como maestro</a>
        </p>
      </div>
    </div>
    <style>
      .pm-input[aria-invalid="true"] {
        border-color: var(--pm-danger, #ef4444);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
      }
    </style>
  `;let o=i.querySelector(`#pm-email`),s=i.querySelector(`#pm-password`),c=i.querySelector(`#pm-login-btn`),l=i.querySelector(`#pm-login-error`),u=i.querySelector(`#pm-toggle-password`),d=i.querySelector(`#pm-remember-email`),f=i.querySelector(`#pm-keep-session`),p=!1;u.addEventListener(`click`,()=>{p=!p,s.type=p?`text`:`password`,u.querySelector(`i`).className=p?`bi bi-eye-slash`:`bi bi-eye`,u.title=p?`Ocultar contraseña`:`Mostrar contraseña`,u.setAttribute(`aria-label`,p?`Ocultar contraseña`:`Mostrar contraseña`),u.setAttribute(`aria-pressed`,p?`true`:`false`)});let m=localStorage.getItem(`pm-saved-email`);m&&(o.value=m,d.checked=!0),d.addEventListener(`change`,()=>{d.checked?localStorage.setItem(`pm-saved-email`,o.value):localStorage.removeItem(`pm-saved-email`)}),o.addEventListener(`input`,()=>{d.checked&&localStorage.setItem(`pm-saved-email`,o.value)});async function h(){let c=o.value.trim(),u=s.value;l.textContent=``,n(i),_(!1);let d=!1;if(c||(r(o,`Ingresa tu correo electrónico`),o.focus(),d=!0),u||(r(s,`Ingresa tu contraseña`),d||s.focus(),d=!0),d)return;g(!0);let f=await e(c,u);if(f.success){t.setMaestro(f.maestro);let e=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),a&&a(e)}else{if(f.pendingApproval){window.router?.navigate(`pending-approval`);return}l.textContent=f.error,g(!1),s.value=``,s.focus()}}function g(e){c.disabled=e,o.disabled=e,s.disabled=e,f.disabled=e,u.disabled=e;let t=c.querySelector(`.pm-btn-text`),n=c.querySelector(`.pm-btn-loader`);e?(t?.classList.add(`d-none`),n?.classList.remove(`d-none`)):(t?.classList.remove(`d-none`),n?.classList.add(`d-none`))}function _(e){o.disabled=e,s.disabled=e,f.disabled=e,u.disabled=e}c.addEventListener(`click`,h),s.addEventListener(`keydown`,e=>{e.key===`Enter`&&h()});let v=i.querySelector(`#pm-biometric-btn`);async function y(){if(!window.PublicKeyCredential)return!1;try{return await navigator.credentials.get({mediation:`optional`}),!0}catch{return!1}}async function b(){try{if(await navigator.credentials.get({mediation:`required`,publicKey:{challenge:new TextEncoder().encode(`login-challenge`)}})){let e=localStorage.getItem(`portal-maestros:maestro`);if(e){let n=JSON.parse(e);t.setMaestro(n);let r=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),a&&a(r)}else l.textContent=`No hay sesión biométrica guardada. Iniciá sesión con contraseña primero.`}}catch(e){console.log(`[WebAuthn] No se pudo usar biometría:`,e.message)}}y().then(e=>{e&&(v.style.display=`flex`,v.onclick=b)}),i.querySelector(`[data-route="register"]`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router?window.router.navigate(`register`):console.error(`[LoginView] Router not found in window`)}),requestAnimationFrame(()=>o.focus())}export{i as renderLoginView};