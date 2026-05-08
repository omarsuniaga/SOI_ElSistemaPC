/**
 * Componente Modal de Sustitución — Portal Maestros
 * @param {HTMLElement} container
 */
export async function renderSustitucionModal(container, opciones = {}) {
  const { maestro = {}, claseId = null, onApprove = () => {}, onDeny = () => {} } = opciones

  container.innerHTML = `
    <div class="modal d-block" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px">
          <div class="modal-header border-0">
            <h5 class="modal-title">Solicitud de Co-docencia</h5>
            <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <i class="bi bi-person-badge" style="font-size:3rem;color:var(--pm-primary)"></i>
            </div>
            <p>El maestro <strong>${maestro.nombre || 'Auxiliar'}</strong> solicita acceso temporal a tu clase.</p>
            <div class="alert alert-info">
              <i class="bi bi-clock-history"></i> El acceso expirará automáticamente en 24 horas.
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" id="sustitucion-deny">Denegar</button>
            <button type="button" class="btn btn-primary" id="sustitucion-approve">Aprobar</button>
          </div>
        </div>
      </div>
    </div>
  `

  document.getElementById('sustitucion-approve')?.addEventListener('click', () => {
    container.innerHTML = ''
    onApprove({ success: true, claseId, expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) })
  })

  document.getElementById('sustitucion-deny')?.addEventListener('click', () => {
    container.innerHTML = ''
    onDeny({ success: false })
  })
}