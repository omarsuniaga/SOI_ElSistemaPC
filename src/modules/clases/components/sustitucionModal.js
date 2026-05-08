import { supabase } from '../../../lib/supabaseClient.js'
import { config } from '../../../core/config/config.js'

const MOCK_PATH = '/assets/data/mocks/clases.json'

export class SustitucionModal {
  constructor(container) {
    this.container = container
    this.maestroTitular = null
    this.claseId = null
    this.onAprobar = null
    this.onDenegar = null
  }

  open(opciones) {
    this.maestroTitular = opciones.maestroTitular
    this.claseId = opciones.claseId
    this.onAprobar = opciones.onAprobar
    this.onDenegar = opciones.onDenegar
    this.render()
  }

  close() {
    this.container.innerHTML = ''
  }

  render() {
    this.container.innerHTML = `
      <div class="modal d-block" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Solicitud de Sustitución</h5>
              <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
            </div>
            <div class="modal-body">
              <p>El maestro <strong>${this.maestroTitular?.nombre || 'Auxiliar'}</strong> solicita acceso temporal a tu clase.</p>
              <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> El acceso expirará automáticamente en 24 horas.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="sustitucion-denegar">Denegar</button>
              <button type="button" class="btn btn-primary" id="sustitucion-aprobar">Aprobar</button>
            </div>
          </div>
        </div>
      </div>
    `

    document.getElementById('sustitucion-aprobar')?.addEventListener('click', () => this.aprobar())
    document.getElementById('sustitucion-denegar')?.addEventListener('click', () => this.denegar())
  }

  async aprobar() {
    if (config.isDemoMode) {
      this.close()
      this.onAprobar?.({ success: true, expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) })
      return
    }

    try {
      const { data, error } = await supabase
        .from('sustituciones')
        .insert([{
          maestro_titular_id: this.maestroTitular?.id,
          maestro_sustituto_id: this.getCurrentMaestroId(),
          clase_id: this.claseId,
          iniciado_en: new Date().toISOString(),
          expira_en: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      this.close()
      this.onAprobar?.({ success: true, data })
    } catch (error) {
      console.error('Error approving sustitucion:', error)
    }
  }

  denegar() {
    this.close()
    this.onDenegar?.({ success: false })
  }

  getCurrentMaestroId() {
    return localStorage.getItem('maestro_id')
  }
}

export function createSustitucionModal(container) {
  return new SustitucionModal(container)
}

export function renderSustitucionModal(container, opciones) {
  const modal = createSustitucionModal(container)
  modal.open(opciones)
}