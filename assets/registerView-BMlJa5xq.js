import{i as e}from"./supabase-KnARm58N.js";import{n as t,r as n}from"./a11yUtils-Bm1YcVfS.js";/* empty css              */function r(r,{onSuccess:i}){r.innerHTML=`
    <div class="pm-login-shell">
      <div class="pm-login-glow pm-login-glow-1"></div>
      <div class="pm-login-glow pm-login-glow-2"></div>

      <div class="pm-login-grid">
        <section class="pm-login-branding">
          <div class="pm-login-brand-badge" aria-hidden="true">
            <span class="pm-login-brand-icon">🎻</span>
          </div>

          <div class="pm-login-brand-copy">
            <span class="pm-login-kicker">Portal de Maestros</span>
            <h1 class="pm-login-title">Solicitá tu cuenta docente.</h1>
            <p class="pm-login-subtitle">
              Creá tu perfil para entrar al portal con una interfaz limpia, profesional y lista para mobile,
              tablet y desktop.
            </p>
          </div>

          <div class="pm-login-highlights" aria-hidden="true">
            <span class="pm-login-pill">Registro simple</span>
            <span class="pm-login-pill">Pendiente de aprobación</span>
            <span class="pm-login-pill">Dark / Light</span>
          </div>
        </section>

        <section class="pm-login-form-side">
          <div class="pm-login-card">
            <div class="pm-login-card-header">
              <div>
                <h2 class="pm-login-card-title">Crear cuenta</h2>
                <p class="pm-login-card-subtitle">
                  Completá tus datos institucionales para solicitar acceso.
                </p>
              </div>
              <button class="pm-login-theme-hint" type="button" tabindex="-1" aria-hidden="true">
                <i class="bi bi-person-plus"></i>
              </button>
            </div>

            <p class="pm-login-error" id="pm-reg-error" aria-live="polite" role="alert"></p>

            <div class="pm-login-field">
              <label class="pm-login-label" for="pm-reg-nombre">Nombre completo</label>
              <input
                type="text"
                id="pm-reg-nombre"
                class="pm-login-input"
                placeholder="Tu nombre y apellido"
                autocomplete="name"
              />
            </div>

            <div class="pm-login-field">
              <label class="pm-login-label" for="pm-reg-email">Correo electrónico</label>
              <input
                type="email"
                id="pm-reg-email"
                class="pm-login-input"
                placeholder="tu@correo.com"
                autocomplete="email"
                inputmode="email"
              />
            </div>

            <div class="pm-login-field">
              <label class="pm-login-label" for="pm-reg-password">Contraseña</label>
              <div class="pm-password-wrapper">
                <input
                  type="password"
                  id="pm-reg-password"
                  class="pm-login-input"
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

            <div class="pm-login-field">
              <label class="pm-login-label" for="pm-reg-confirm-password">Confirmar contraseña</label>
              <div class="pm-password-wrapper">
                <input
                  type="password"
                  id="pm-reg-confirm-password"
                  class="pm-login-input"
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

            <div class="pm-login-field">
              <label class="pm-login-label" for="pm-reg-instrumento">Instrumento principal</label>
              <input
                type="text"
                id="pm-reg-instrumento"
                class="pm-login-input"
                placeholder="Ej: Violín, Piano, Guitarra..."
              />
            </div>

            <div class="pm-login-field">
              <label class="pm-login-label" for="pm-reg-resena">Breve reseña (opcional)</label>
              <textarea
                id="pm-reg-resena"
                class="pm-login-input"
                placeholder="Contanos brevemente sobre tu experiencia..."
                rows="3"
              ></textarea>
            </div>

            <button type="button" class="pm-login-btn-primary" id="pm-register-btn">
              <span class="pm-btn-text">Crear cuenta</span>
              <span class="pm-btn-loader d-none">
                <span class="pm-spinner-sm"></span>
                Registrando...
              </span>
            </button>

            <div class="pm-login-footer">
              <a href="#" data-route="login" class="pm-login-register-link">¿Ya tenés cuenta? Iniciar sesión</a>
              <span class="pm-login-footer-dot">•</span>
              <span class="pm-login-footer-note">La solicitud queda pendiente de aprobación</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;let a=r.querySelector(`#pm-reg-nombre`),o=r.querySelector(`#pm-reg-email`),s=r.querySelector(`#pm-reg-password`),c=r.querySelector(`#pm-reg-confirm-password`),l=r.querySelector(`#pm-reg-instrumento`),u=r.querySelector(`#pm-reg-resena`),d=r.querySelector(`#pm-register-btn`),f=r.querySelector(`#pm-reg-error`),p=r.querySelector(`#pm-reg-toggle-password`),m=r.querySelector(`#pm-reg-toggle-confirm-password`),h=!1;p.addEventListener(`click`,()=>{h=!h,s.type=h?`text`:`password`,p.querySelector(`i`).className=h?`bi bi-eye-slash`:`bi bi-eye`,p.title=h?`Ocultar contraseña`:`Mostrar contraseña`,p.setAttribute(`aria-label`,h?`Ocultar contraseña`:`Mostrar contraseña`)});let g=!1;m.addEventListener(`click`,()=>{g=!g,c.type=g?`text`:`password`,m.querySelector(`i`).className=g?`bi bi-eye-slash`:`bi bi-eye`,m.title=g?`Ocultar contraseña`:`Mostrar contraseña`,m.setAttribute(`aria-label`,g?`Ocultar contraseña`:`Mostrar contraseña`)});async function _(){let d=a.value.trim(),p=o.value.trim(),m=s.value,h=c.value,g=l.value.trim();f.textContent=``,t(r),y(!1);let _=!1;if(d||(n(a,`Ingresá tu nombre completo`),_||a.focus(),_=!0),p||(n(o,`Ingresá tu correo electrónico`),_||o.focus(),_=!0),(!m||m.length<6)&&(n(s,`La contraseña debe tener al menos 6 caracteres`),_||s.focus(),_=!0),h?m!==h&&(n(c,`Las contraseñas no coinciden`),_||c.focus(),_=!0):(n(c,`Confirmá tu contraseña`),_||c.focus(),_=!0),_)return;v(!0);let{data:b,error:x}=await e.auth.signUp({email:p,password:m,options:{data:{full_name:d,rol:`maestro`,instrumento:g,resena:u.value.trim()}}});if(x){f.textContent=x.message===`User already registered`?`Este correo ya está registrado. Si ya sos maestro, intentá iniciar sesión.`:x.message||`Error al registrarse. Intentá de nuevo.`,v(!1);return}b?.user&&(await e.from(`profiles`).upsert({id:b.user.id,email:p,nombre_completo:d,resena:`Instrumento: ${g}${u.value.trim()?` | `+u.value.trim():``}`,rol:`maestro`,estado:`pendiente`},{onConflict:`id`,ignoreDuplicates:!1}),await e.auth.signOut()),v(!1),i&&i()}function v(e){d.disabled=e,a.disabled=e,o.disabled=e,s.disabled=e,c.disabled=e,l.disabled=e,u.disabled=e,p.disabled=e,m.disabled=e;let t=d.querySelector(`.pm-btn-text`),n=d.querySelector(`.pm-btn-loader`);e?(t?.classList.add(`d-none`),n?.classList.remove(`d-none`)):(t?.classList.remove(`d-none`),n?.classList.add(`d-none`))}function y(e){a.disabled=e,o.disabled=e,s.disabled=e,c.disabled=e,l.disabled=e,u.disabled=e,p.disabled=e,m.disabled=e}d.addEventListener(`click`,_),c.addEventListener(`keydown`,e=>{e.key===`Enter`&&_()}),r.querySelector(`[data-route="login"]`)?.addEventListener(`click`,e=>{e.preventDefault(),window.router?window.router.navigate(`login`):console.error(`[RegisterView] Router not found in window`)}),requestAnimationFrame(()=>a.focus())}export{r as renderRegisterView};