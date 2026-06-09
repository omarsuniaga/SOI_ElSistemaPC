import { router } from '../../../core/router/router.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { clearSession } from '../../../core/auth/sessionStorage.js'

export function renderPendingApprovalView(container) {
  container.innerHTML = `
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
  `

  container.querySelector('#paBackBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut().catch(() => {})
    clearSession()
    window.location.href = '/'
  })

  container.querySelector('#paLogoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut().catch(() => {})
    clearSession()
    router.navigate('login')
  })
}

export default { renderPendingApprovalView }
