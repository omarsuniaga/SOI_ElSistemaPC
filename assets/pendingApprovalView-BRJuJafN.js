import{i as e}from"./supabase-DtQm9tmr.js";function t(t,{onBackToLogin:n}={}){t.innerHTML=`
    <div class="pm-login">
      <!-- Branding -->
      <div class="pm-login-branding">
        <div class="pm-login-logo" style="background:rgba(245,158,11,0.15);">
          <i class="bi bi-hourglass-split" style="color:#f59e0b;"></i>
        </div>
        <h1 class="pm-login-title">Solicitud enviada</h1>
        <p class="pm-login-subtitle">Sistema Operativo Institucional — SOI</p>
      </div>

      <!-- Card -->
      <div class="pm-login-form">
        <div class="pm-login-card" style="text-align:center;">

          <!-- Ícono principal -->
          <div style="
            width:80px;height:80px;border-radius:50%;
            background:rgba(245,158,11,0.12);
            display:flex;align-items:center;justify-content:center;
            margin:0 auto 1.25rem;
          ">
            <i class="bi bi-shield-lock" style="font-size:2rem;color:#f59e0b;"></i>
          </div>

          <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:0.75rem;">
            Tu cuenta está pendiente de aprobación
          </h2>

          <p style="
            font-size:0.875rem;
            color:var(--pm-text-muted);
            line-height:1.6;
            margin-bottom:1.5rem;
            max-width:320px;
            margin-left:auto;margin-right:auto;
          ">
            Un administrador del sistema debe revisar y aprobar tu solicitud
            antes de que puedas acceder al portal. Este proceso puede tomar
            algunas horas.
          </p>

          <!-- Pasos del proceso -->
          <div style="
            background:var(--pm-surface-2,rgba(255,255,255,0.05));
            border:1px solid var(--pm-border);
            border-radius:12px;
            padding:1rem;
            margin-bottom:1.5rem;
            text-align:left;
          ">
            <div class="pm-approval-step pm-approval-step--done">
              <span class="pm-step-icon"><i class="bi bi-check-circle-fill"></i></span>
              <span class="pm-step-text">Registro completado</span>
            </div>
            <div class="pm-approval-step pm-approval-step--active" id="pm-step-waiting">
              <span class="pm-step-icon"><i class="bi bi-hourglass-split"></i></span>
              <span class="pm-step-text">Esperando aprobación del administrador</span>
            </div>
            <div class="pm-approval-step pm-approval-step--pending">
              <span class="pm-step-icon"><i class="bi bi-circle"></i></span>
              <span class="pm-step-text">Acceso al portal habilitado</span>
            </div>
          </div>

          <!-- Botón verificar estado -->
          <button type="button" class="pm-btn-primary" id="pm-check-status-btn" style="margin-bottom:0.75rem;">
            <span class="pm-btn-text">
              <i class="bi bi-arrow-clockwise me-1"></i> Verificar estado
            </span>
            <span class="pm-btn-loader d-none">
              <span class="pm-spinner-sm"></span>
              Verificando…
            </span>
          </button>

          <p id="pm-status-msg" style="
            font-size:0.8rem;
            min-height:1.25rem;
            margin-bottom:1rem;
          " aria-live="polite"></p>

          <button type="button" class="pm-btn-secondary" id="pm-back-login-btn">
            <i class="bi bi-arrow-left me-1"></i> Volver al inicio de sesión
          </button>

        </div>
      </div>
    </div>

    <style id="pm-pending-approval-styles">
      .pm-approval-step {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.45rem 0;
        font-size: 0.825rem;
      }
      .pm-approval-step + .pm-approval-step {
        border-top: 1px solid var(--pm-border);
      }
      .pm-step-icon { font-size: 1rem; flex-shrink: 0; }
      .pm-step-text { font-weight: 500; color: var(--pm-text-muted); }

      .pm-approval-step--done .pm-step-icon  { color: var(--pm-success, #10b981); }
      .pm-approval-step--done .pm-step-text  { color: var(--pm-text); }

      .pm-approval-step--active .pm-step-icon { color: #f59e0b; animation: pm-spin 1.8s linear infinite; }
      .pm-approval-step--active .pm-step-text { color: var(--pm-text); font-weight: 600; }

      @keyframes pm-spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .pm-approval-step--pending .pm-step-icon { color: var(--pm-border); }
      .pm-approval-step--pending .pm-step-text { opacity: 0.45; }
    </style>
  `;let r=t.querySelector(`#pm-check-status-btn`),i=t.querySelector(`#pm-back-login-btn`),a=t.querySelector(`#pm-status-msg`),o=t.querySelector(`#pm-step-waiting`);async function s(){c(!0),a.textContent=``,a.style.color=`var(--pm-text-muted)`;try{let{data:{session:t}}=await e.auth.getSession();if(!t){a.textContent=`No hay sesión activa. Intentá iniciar sesión nuevamente.`,a.style.color=`var(--pm-danger, #ef4444)`,c(!1);return}let{data:n,error:r}=await e.from(`profiles`).select(`estado, rol, nombre_completo`).eq(`id`,t.user.id).maybeSingle();if(r||!n){a.textContent=`No se pudo verificar el estado. Intentá de nuevo.`,a.style.color=`var(--pm-danger, #ef4444)`,c(!1);return}if(n.estado===`activo`){a.textContent=`✅ ¡Tu cuenta fue aprobada! Ingresando al portal…`,a.style.color=`var(--pm-success, #10b981)`,o?.classList.replace(`pm-approval-step--active`,`pm-approval-step--done`),o&&(o.querySelector(`.pm-step-icon`).innerHTML=`<i class="bi bi-check-circle-fill"></i>`,o.querySelector(`.pm-step-text`).textContent=`Aprobado por el administrador`),setTimeout(()=>window.location.reload(),1500);return}if(n.estado===`rechazado`){a.textContent=`Tu solicitud fue rechazada. Contactá al administrador para más información.`,a.style.color=`var(--pm-danger, #ef4444)`,c(!1);return}a.textContent=`Tu solicitud aún está en revisión. Por favor esperá la confirmación del administrador.`,a.style.color=`var(--pm-text-muted)`}catch(e){a.textContent=`Error al verificar: `+e.message,a.style.color=`var(--pm-danger, #ef4444)`}finally{c(!1)}}function c(e){r.disabled=e,r.querySelector(`.pm-btn-text`)?.classList.toggle(`d-none`,e),r.querySelector(`.pm-btn-loader`)?.classList.toggle(`d-none`,!e)}r.addEventListener(`click`,s),i.addEventListener(`click`,()=>{n?n():(history.pushState({route:`login`},``,`#/login`),window.dispatchEvent(new PopStateEvent(`popstate`,{state:{route:`login`}})))})}export{t as renderPendingApprovalView};