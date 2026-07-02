import{u as e}from"./main-maestros-DhjjXu6q.js";import{a as t}from"./maestroAuth-CdApllXF.js";import{n,r}from"./a11yUtils-DRYT20ux.js";/* empty css              */var i=`
<div class="pm-login-shell">
  <div class="pm-login-glow pm-login-glow-1"></div>
  <div class="pm-login-glow pm-login-glow-2"></div>

  <div class="pm-login-grid">
    <section class="pm-login-branding">
      <div class="pm-login-brand-badge">
        <span class="pm-login-brand-icon">🎼</span>
      </div>
      <div class="pm-login-brand-copy">
        <span class="pm-login-kicker">Portal de Maestros</span>
        <h1 class="pm-login-title">Accedé a tu guía en segundos.</h1>
        <p class="pm-login-subtitle">
          Una vista limpia, profesional y rápida para entrar desde móvil, tablet o desktop.
        </p>
      </div>

      <div class="pm-login-highlights" aria-hidden="true">
        <span class="pm-login-pill">ACM sincronizado</span>
        <span class="pm-login-pill">Responsive</span>
        <span class="pm-login-pill">Dark / Light</span>
      </div>
    </section>

    <section class="pm-login-form-side">
      <div class="pm-login-card">
        <div class="pm-login-card-header">
          <div>
            <h2 class="pm-login-card-title">Iniciar sesión</h2>
            <p class="pm-login-card-subtitle">Usá tu correo institucional y contraseña.</p>
          </div>
          <button class="pm-login-theme-hint" type="button" tabindex="-1" aria-hidden="true">
            <i class="bi bi-moon-stars"></i>
          </button>
        </div>

        <p class="pm-login-error" id="pm-login-error" aria-live="polite" role="alert"></p>

        <div class="pm-login-field">
          <label class="pm-login-label" for="pm-email">Correo electrónico</label>
          <input
            class="pm-login-input"
            id="pm-email"
            type="email"
            placeholder="tu.nombre@institucion.edu"
            autocomplete="email"
            inputmode="email"
            aria-describedby="pm-email-error"
          />
        </div>

        <div class="pm-login-field">
          <label class="pm-login-label" for="pm-password">Contraseña</label>
          <div class="pm-password-wrapper">
            <input
              class="pm-login-input"
              id="pm-password"
              type="password"
              placeholder="Ingresá tu contraseña"
              autocomplete="current-password"
              aria-describedby="pm-password-error"
            />
            <button
              class="pm-password-toggle"
              id="pm-toggle-password"
              type="button"
              aria-label="Mostrar contraseña"
              aria-pressed="false"
              title="Mostrar contraseña"
            >
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>

        <div class="pm-login-options">
          <label class="pm-login-checkbox">
            <input type="checkbox" id="pm-remember-email" />
            Recordar cuenta
          </label>
          <label class="pm-login-checkbox">
            <input type="checkbox" id="pm-keep-session" checked />
            Mantener la cuenta iniciada
          </label>
        </div>

        <button class="pm-login-btn-primary" id="pm-login-btn" type="button">
          <span class="pm-btn-text">Entrar al portal</span>
          <span class="pm-btn-loader d-none">
            <span class="pm-spinner-sm"></span>
            Validando...
          </span>
        </button>

        <button class="pm-login-btn-biometric" id="pm-biometric-btn" type="button" style="display:none">
          <i class="bi bi-fingerprint"></i>
          Usar huella o Face ID
        </button>

        <div class="pm-login-footer">
          <a class="pm-login-register-link" href="#" data-route="register">
            Crear cuenta
          </a>
          <span class="pm-login-footer-dot">•</span>
          <span class="pm-login-footer-note">Acceso seguro para docentes</span>
        </div>
      </div>
    </section>
  </div>
</div>`;function a(a,{onSuccess:o}){a.innerHTML=i;let s=a.querySelector(`#pm-email`),c=a.querySelector(`#pm-password`),l=a.querySelector(`#pm-login-btn`),u=a.querySelector(`#pm-login-error`),d=a.querySelector(`#pm-toggle-password`),f=a.querySelector(`#pm-remember-email`),p=a.querySelector(`#pm-keep-session`),m=!1;d.addEventListener(`click`,()=>{m=!m,c.type=m?`text`:`password`,d.querySelector(`i`).className=m?`bi bi-eye-slash`:`bi bi-eye`,d.title=m?`Ocultar contraseña`:`Mostrar contraseña`,d.setAttribute(`aria-label`,m?`Ocultar contraseña`:`Mostrar contraseña`),d.setAttribute(`aria-pressed`,m?`true`:`false`)});let h=localStorage.getItem(`pm-saved-email`);h&&(s.value=h,f.checked=!0);let g=localStorage.getItem(`pm-keep-session`);g!==null&&(p.checked=g===`true`),f.addEventListener(`change`,()=>{f.checked?localStorage.setItem(`pm-saved-email`,s.value):localStorage.removeItem(`pm-saved-email`)}),s.addEventListener(`input`,()=>{f.checked&&localStorage.setItem(`pm-saved-email`,s.value)}),p.addEventListener(`change`,()=>{localStorage.setItem(`pm-keep-session`,p.checked?`true`:`false`)});async function _(){let i=s.value.trim(),l=c.value;u.textContent=``,n(a),y(!1);let d=!1;if(i||(r(s,`Ingresa tu correo electrónico`),s.focus(),d=!0),l||(r(c,`Ingresa tu contraseña`),d||c.focus(),d=!0),d)return;v(!0);let f=await t(i,l,{keepSession:p.checked});if(f.success){e.setMaestro(f.maestro);let t=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),o&&o(t)}else{if(f.pendingApproval){window.router?.navigate(`pending-approval`);return}u.textContent=f.error,v(!1),c.value=``,c.focus()}}function v(e){l.disabled=e,s.disabled=e,c.disabled=e,p.disabled=e,d.disabled=e;let t=l.querySelector(`.pm-btn-text`),n=l.querySelector(`.pm-btn-loader`);e?(t?.classList.add(`d-none`),n?.classList.remove(`d-none`)):(t?.classList.remove(`d-none`),n?.classList.add(`d-none`))}function y(e){s.disabled=e,c.disabled=e,p.disabled=e,d.disabled=e}l.addEventListener(`click`,_),c.addEventListener(`keydown`,e=>{e.key===`Enter`&&_()});let b=a.querySelector(`#pm-biometric-btn`);async function x(){if(!window.PublicKeyCredential)return!1;try{return await navigator.credentials.get({mediation:`optional`}),!0}catch{return!1}}async function S(){try{if(await navigator.credentials.get({mediation:`required`,publicKey:{challenge:new TextEncoder().encode(`login-challenge`)}})){let t=localStorage.getItem(`portal-maestros:maestro`);if(t){let n=JSON.parse(t);e.setMaestro(n);let r=localStorage.getItem(`intended-route`);localStorage.removeItem(`intended-route`),o&&o(r)}else u.textContent=`No hay sesión biométrica guardada. Iniciá sesión con contraseña primero.`}}catch(e){console.log(`[WebAuthn] No se pudo usar biometría:`,e.message)}}x().then(e=>{e&&(b.style.display=`flex`,b.onclick=S)}),a.querySelector(`[data-route="register"]`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router?window.router.navigate(`register`):console.error(`[LoginView] Router not found in window`)}),requestAnimationFrame(()=>s.focus())}export{a as renderLoginView};