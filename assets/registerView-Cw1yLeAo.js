import{i as e}from"./supabase-KnARm58N.js";import{n as t,r as n}from"./a11yUtils-DoZA0IX7.js";function r(r,{onSuccess:i}){r.innerHTML=`
    <div class="pm-login">
      <!-- Branding Side (Desktop) -->
      <div class="pm-login-branding">
        <div class="pm-login-logo"><i class="bi bi-music-note-beamed"></i></div>
        <h1 class="pm-login-title">Registro de Maestro</h1>
        <p class="pm-login-subtitle">Sistema Operativo Institucional — SOI</p>
      </div>

      <!-- Form Side -->
      <div class="pm-login-form">
        <div class="pm-login-card">
          <div class="pm-input-group">
            <label for="pm-reg-nombre">Nombre completo</label>
            <input
              type="text"
              id="pm-reg-nombre"
              class="pm-input"
              placeholder="Tu nombre completo"
              autocomplete="name"
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-email">Correo electrónico</label>
            <input
              type="email"
              id="pm-reg-email"
              class="pm-input"
              placeholder="tu@correo.com"
              autocomplete="email"
              inputmode="email"
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-password">Contraseña</label>
            <div class="pm-password-wrapper">
              <input
                type="password"
                id="pm-reg-password"
                class="pm-input"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
              />
              <button
                type="button"
                id="pm-reg-toggle-password"
                class="pm-password-toggle"
                title="Mostrar contraseña"
                aria-label="Mostrar contraseña"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-confirm-password">Confirmar contraseña</label>
            <div class="pm-password-wrapper">
              <input
                type="password"
                id="pm-reg-confirm-password"
                class="pm-input"
                placeholder="Repetí tu contraseña"
                autocomplete="new-password"
              />
              <button
                type="button"
                id="pm-reg-toggle-confirm-password"
                class="pm-password-toggle"
                title="Mostrar contraseña"
                aria-label="Mostrar contraseña"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-instrumento">Instrumento principal</label>
            <input
              type="text"
              id="pm-reg-instrumento"
              class="pm-input"
              placeholder="Ej: Violín, Piano, Guitarra..."
            />
          </div>

          <div class="pm-input-group">
            <label for="pm-reg-resena">Breve reseña (opcional)</label>
            <textarea
              id="pm-reg-resena"
              class="pm-input"
              placeholder="Contanos brevemente sobre tu experiencia..."
              rows="3"
            ></textarea>
          </div>

          <button type="button" class="pm-btn-primary" id="pm-register-btn">
            <span class="pm-btn-text">Crear cuenta</span>
            <span class="pm-btn-loader d-none">
              <span class="pm-spinner-sm"></span>
              Registrando...
            </span>
          </button>

          <p class="pm-error-msg" id="pm-reg-error" aria-live="polite"></p>

          <p class="pm-login-register-link">
            <a href="#" data-route="login" class="pm-link">¿Ya tienes cuenta? Iniciar sesión</a>
          </p>
        </div>
      </div>
    </div>
  `;let a=r.querySelector(`#pm-reg-nombre`),o=r.querySelector(`#pm-reg-email`),s=r.querySelector(`#pm-reg-password`),c=r.querySelector(`#pm-reg-confirm-password`),l=r.querySelector(`#pm-reg-instrumento`),u=r.querySelector(`#pm-reg-resena`),d=r.querySelector(`#pm-register-btn`),f=r.querySelector(`#pm-reg-error`),p=r.querySelector(`#pm-reg-toggle-password`),m=r.querySelector(`#pm-reg-toggle-confirm-password`),h=!1;p.addEventListener(`click`,()=>{h=!h,s.type=h?`text`:`password`,p.querySelector(`i`).className=h?`bi bi-eye-slash`:`bi bi-eye`,p.title=h?`Ocultar contraseña`:`Mostrar contraseña`,p.setAttribute(`aria-label`,h?`Ocultar contraseña`:`Mostrar contraseña`)});let g=!1;m.addEventListener(`click`,()=>{g=!g,c.type=g?`text`:`password`,m.querySelector(`i`).className=g?`bi bi-eye-slash`:`bi bi-eye`,m.title=g?`Ocultar contraseña`:`Mostrar contraseña`,m.setAttribute(`aria-label`,g?`Ocultar contraseña`:`Mostrar contraseña`)});async function _(){let d=a.value.trim(),p=o.value.trim(),m=s.value,h=c.value,g=l.value.trim();f.textContent=``,t(r),y(!1);let _=!1;if(d||(n(a,`Ingresá tu nombre completo`),_||a.focus(),_=!0),p||(n(o,`Ingresá tu correo electrónico`),_||o.focus(),_=!0),(!m||m.length<6)&&(n(s,`La contraseña debe tener al menos 6 caracteres`),_||s.focus(),_=!0),h?m!==h&&(n(c,`Las contraseñas no coinciden`),_||c.focus(),_=!0):(n(c,`Confirmá tu contraseña`),_||c.focus(),_=!0),_)return;v(!0);let{data:b,error:x}=await e.auth.signUp({email:p,password:m,options:{data:{full_name:d,rol:`maestro`,instrumento:g,resena:u.value.trim()}}});if(x){f.textContent=x.message===`User already registered`?`Este correo ya está registrado. Si ya sos maestro, intentá iniciar sesión.`:x.message||`Error al registrarse. Intentá de nuevo.`,v(!1);return}b?.user&&(await e.from(`profiles`).upsert({id:b.user.id,email:p,nombre_completo:d,resena:`Instrumento: ${g}${u.value.trim()?` | `+u.value.trim():``}`,rol:`maestro`,estado:`pendiente`},{onConflict:`id`,ignoreDuplicates:!1}),await e.auth.signOut()),v(!1),i&&i()}function v(e){d.disabled=e,a.disabled=e,o.disabled=e,s.disabled=e,c.disabled=e,l.disabled=e,u.disabled=e,p.disabled=e,m.disabled=e;let t=d.querySelector(`.pm-btn-text`),n=d.querySelector(`.pm-btn-loader`);e?(t?.classList.add(`d-none`),n?.classList.remove(`d-none`)):(t?.classList.remove(`d-none`),n?.classList.add(`d-none`))}function y(e){a.disabled=e,o.disabled=e,s.disabled=e,c.disabled=e,l.disabled=e,u.disabled=e,p.disabled=e,m.disabled=e}d.addEventListener(`click`,_),c.addEventListener(`keydown`,e=>{e.key===`Enter`&&_()}),r.querySelector(`[data-route="login"]`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router?window.router.navigate(`login`):console.error(`[RegisterView] Router not found in window`)}),requestAnimationFrame(()=>a.focus())}export{r as renderRegisterView};