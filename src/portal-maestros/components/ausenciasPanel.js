/**
 * Panel de Solicitudes de Ausencia - Portal Maestros
 * Muestra el historial y estado de las solicitudes de ausencia usando un Drawer lateral.
 */
import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { ausenciaModal } from './ausenciaModal.js'
import { renderAusenciaHistorial, refreshAusenciaHistorial, destroyAusenciaHistorial } from './ausenciaHistorial.js'

export class AusenciasPanel {
  constructor() {
    this.maestro = getMaestroLocal()
    this.isOpen = false
    this.container = null
  }

  initDOM() {
    if (document.getElementById('pm-ausencias-drawer-overlay')) return;

    this.container = document.createElement('div');
    this.container.innerHTML = `
      <div id="pm-ausencias-drawer-overlay" class="pm-drawer-overlay">
        <div class="pm-drawer pm-drawer-wide">
          <div class="pm-drawer-header">
            <h4><i class="bi bi-calendar-minus"></i> Mis Solicitudes</h4>
            <div style="display:flex; gap: 0.5rem;">
              <button class="pm-drawer-close" id="pm-ausencias-close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div class="pm-drawer-body" id="pm-ausencias-body">
            <!-- El historial se renderizará aquí -->
          </div>
          <div class="pm-drawer-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border); text-align: center;">
             <button class="pm-btn pm-btn-primary" style="width: 100%;" id="pm-ausencias-btn-nueva">
               <i class="bi bi-plus-lg"></i> Nueva Solicitud
             </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);

    // Eventos UI
    document.getElementById('pm-ausencias-close').addEventListener('click', () => this.close());
    document.getElementById('pm-ausencias-drawer-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'pm-ausencias-drawer-overlay') this.close();
    });

    document.getElementById('pm-ausencias-btn-nueva').addEventListener('click', () => {
      this.close();
      ausenciaModal.open();
    });
  }

  async open() {
    if (!this.maestro) {
      AppToast.error('Debes estar logueado para ver tus ausencias')
      return
    }

    this.initDOM();
    const overlay = document.getElementById('pm-ausencias-drawer-overlay');
    overlay.style.display = 'block';
    overlay.offsetHeight; // Forzar reflow
    overlay.classList.add('open');
    this.isOpen = true;

    // Usar el componente especializado para el historial
    await renderAusenciaHistorial('#pm-ausencias-body');
  }

  close() {
    const overlay = document.getElementById('pm-ausencias-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => {
        overlay.style.display = 'none';
        destroyAusenciaHistorial();
      }, 300);
    }
    this.isOpen = false;
  }
}

// Instancia global
export const ausenciasPanel = new AusenciasPanel()
