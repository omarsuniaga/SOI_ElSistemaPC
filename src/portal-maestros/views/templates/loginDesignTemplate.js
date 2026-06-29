/**
 * TEMPLATE HTML — Login Portal de Maestros
 * Minimal, responsive, dark/light friendly.
 */
export const templateHtml = `
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
</div>`

export const templateCss = ''
