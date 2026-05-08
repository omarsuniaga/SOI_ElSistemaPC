/**
 * Panel de Solicitudes de Ausencia - Portal Maestros
 * Muestra el historial y estado de las solicitudes de ausencia usando un Drawer lateral.
 */
import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { AppToast } from '../../shared/components/AppToast.js'
// Asumimos que ausenciaModal existe en el scope global o lo inyectamos después
import { ausenciaModal } from './ausenciaModal.js'

export class AusenciasPanel {
  constructor() {
    this.maestro = getMaestroLocal()
    this.ausencias = []
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
            <!-- Render list here -->
            <div class="text-center text-muted mt-4">
              <div class="spinner-border spinner-border-sm mb-2"></div><br>
              Cargando...
            </div>
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

    await this.loadAusencias();
    this.renderContent();
  }

  close() {
    const overlay = document.getElementById('pm-ausencias-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }
    this.isOpen = false;
  }

  async loadAusencias() {
    const bodyEl = document.getElementById('pm-ausencias-body');
    if (bodyEl) {
       bodyEl.innerHTML = `
        <div class="text-center text-muted mt-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-3">Cargando historial...</p>
        </div>
      `;
    }

    try {
      if (navigator.onLine) {
        try {
          const { data: ausenciasSupabase, error } = await supabase
            .from('ausencias_maestros')
            .select('*')
            .eq('maestro_id', this.maestro.id)
            .order('created_at', { ascending: false })

          if (!error && ausenciasSupabase) {
            this.ausencias = ausenciasSupabase
          } else {
            if (error?.code !== 'PGRST116' && error?.code !== '404') {
              console.warn('Error cargando ausencias desde Supabase:', error.message)
            }
            this.loadFromFallback();
          }
        } catch (supabaseError) {
          console.debug('Fallback a localStorage para ausencias')
          this.loadFromFallback();
        }
      } else {
        this.loadFromFallback();
      }
    } catch (error) {
      console.debug('Error crítico en loadAusencias:', error)
      this.ausencias = []
    }
  }

  loadFromFallback() {
    const ausenciasLocal = JSON.parse(localStorage.getItem('ausencias_maestros') || '[]')
    this.ausencias = ausenciasLocal.filter(a => a.maestro_id === this.maestro.id)
  }

  renderContent() {
    const bodyEl = document.getElementById('pm-ausencias-body');
    if (!bodyEl) return;

    const pendingCount = this.ausencias.filter(a => a.estado === 'pendiente').length;
    const approvedCount = this.ausencias.filter(a => a.estado === 'aprobada').length;
    const rejectedCount = this.ausencias.filter(a => a.estado === 'rechazada').length;

    let html = `
      <div class="ausencias-dashboard" style="padding: 1rem;">
        <!-- Estadísticas compactas -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <div class="ausencias-stat-card pending" style="flex: 1; padding: 0.8rem; background: var(--pm-warning); color: #000; border-radius: 8px; text-align: center;">
             <div style="font-size: 1.5rem; font-weight: bold;">${pendingCount}</div>
             <div style="font-size: 0.8rem; opacity: 0.8;">Pendientes</div>
          </div>
          <div class="ausencias-stat-card approved" style="flex: 1; padding: 0.8rem; background: var(--pm-success); color: #fff; border-radius: 8px; text-align: center;">
             <div style="font-size: 1.5rem; font-weight: bold;">${approvedCount}</div>
             <div style="font-size: 0.8rem; opacity: 0.8;">Aprobadas</div>
          </div>
          <div class="ausencias-stat-card rejected" style="flex: 1; padding: 0.8rem; background: var(--pm-danger); color: #fff; border-radius: 8px; text-align: center;">
             <div style="font-size: 1.5rem; font-weight: bold;">${rejectedCount}</div>
             <div style="font-size: 0.8rem; opacity: 0.8;">Rechazadas</div>
          </div>
        </div>

        <!-- Lista -->
        <div class="ausencias-list" style="display: flex; flex-direction: column; gap: 1rem;">
          ${this.ausencias.length > 0 ? this.renderAusenciasList() : this.renderEmptyState()}
        </div>
      </div>
    `;

    bodyEl.innerHTML = html;

    // Vincular eventos de cancelar dinámicamente
    bodyEl.querySelectorAll('.btn-cancelar-ausencia').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.cancelarAusencia(id);
      });
    });
  }

  renderAusenciasList() {
    return this.ausencias.map(ausencia => {
      const tipoIcon = this.getTipoIcon(ausencia.tipo_ausencia)
      const urgenciaBadge = this.getUrgenciaBadge(ausencia.urgencia)
      const estadoBadge = this.getEstadoBadge(ausencia.estado)
      const fechaInicio = new Date(ausencia.fecha_inicio).toLocaleDateString('es-ES')
      const fechaFin = new Date(ausencia.fecha_fin).toLocaleDateString('es-ES')
      
      return `
        <div class="pm-card" style="padding: 1rem; border-left: 4px solid ${this.getEstadoColor(ausencia.estado)}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div style="font-weight: 600;">
              ${tipoIcon} ${this.getTipoLabel(ausencia.tipo_ausencia)}
            </div>
            <div style="display: flex; gap: 0.5rem;">
              ${urgenciaBadge}
              ${estadoBadge}
            </div>
          </div>
          
          <div style="font-size: 0.9rem; color: var(--pm-text); margin-bottom: 0.5rem;">
            <i class="bi bi-calendar-range"></i> ${fechaInicio} - ${fechaFin}
          </div>
          
          <div style="font-size: 0.85rem; color: var(--pm-text-muted); background: var(--pm-surface-2); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.8rem;">
            ${ausencia.motivo}
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <small style="color: var(--pm-text-muted); font-size: 0.75rem;">
              Enviada: ${new Date(ausencia.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </small>
            ${ausencia.estado === 'pendiente' ? `
              <button class="pm-btn pm-btn-danger pm-btn-sm btn-cancelar-ausencia" data-id="${ausencia.id}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">
                <i class="bi bi-x-lg"></i> Cancelar
              </button>
            ` : ''}
          </div>
        </div>
      `
    }).join('')
  }

  renderEmptyState() {
    return `
      <div class="text-center py-5">
        <div class="empty-state-icon" style="font-size: 3rem; color: var(--pm-border);">
          <i class="bi bi-calendar-x"></i>
        </div>
        <h5 class="mt-3">No hay solicitudes</h5>
        <p class="text-muted" style="font-size: 0.9rem;">No has realizado ninguna solicitud de ausencia recientemente.</p>
      </div>
    `
  }

  getTipoIcon(tipo) {
    const icons = {
      'enfermedad': '🤒',
      'personal': '👤',
      'capacitacion': '📚',
      'vacaciones': '🏖️',
      'otro': '📋'
    }
    return icons[tipo] || '📋'
  }

  getTipoLabel(tipo) {
    const labels = {
      'enfermedad': 'Enfermedad',
      'personal': 'Personal',
      'capacitacion': 'Capacitación',
      'vacaciones': 'Vacaciones',
      'otro': 'Otro'
    }
    return labels[tipo] || 'Otro'
  }

  getUrgenciaBadge(urgencia) {
    const bg = urgencia === 'alta' ? 'var(--pm-danger)' : (urgencia === 'media' ? 'var(--pm-warning)' : 'var(--pm-success)');
    const color = urgencia === 'media' ? '#000' : '#fff';
    return `<span style="background: ${bg}; color: ${color}; font-size: 0.7rem; padding: 0.2rem 0.4rem; border-radius: 4px; text-transform: uppercase; font-weight: bold;">${urgencia}</span>`
  }

  getEstadoColor(estado) {
    switch(estado) {
      case 'aprobada': return 'var(--pm-success)';
      case 'rechazada': return 'var(--pm-danger)';
      case 'cancelada': return 'var(--pm-border)';
      default: return 'var(--pm-warning)';
    }
  }

  getEstadoBadge(estado) {
    const bg = this.getEstadoColor(estado);
    const color = estado === 'pendiente' ? '#000' : '#fff';
    return `<span style="background: ${bg}; color: ${color}; font-size: 0.7rem; padding: 0.2rem 0.4rem; border-radius: 4px; text-transform: uppercase; font-weight: bold;">${estado}</span>`
  }

  async cancelarAusencia(ausenciaId) {
    if (!confirm('¿Estás seguro que deseas cancelar esta solicitud?')) {
      return
    }

    try {
      if (navigator.onLine) {
        const { error } = await supabase
          .from('ausencias_maestros')
          .update({ estado: 'cancelada' })
          .eq('id', ausenciaId)

        if (error) throw error;
      } else {
        const ausencias = JSON.parse(localStorage.getItem('ausencias_maestros') || '[]')
        const index = ausencias.findIndex(a => a.id == ausenciaId)
        if (index !== -1) {
          ausencias[index].estado = 'cancelada'
          localStorage.setItem('ausencias_maestros', JSON.stringify(ausencias))
        }
      }

      AppToast.success('Solicitud cancelada')
      
      // Actualización Optimista local para evitar recargar DB
      const localAus = this.ausencias.find(a => a.id == ausenciaId);
      if (localAus) localAus.estado = 'cancelada';
      this.renderContent(); // Refrescar DOM sin parpadear todo
      
    } catch (error) {
      console.error('Error cancelando ausencia:', error)
      AppToast.error('No se pudo cancelar la solicitud')
    }
  }
}

// Instancia global
export const ausenciasPanel = new AusenciasPanel()
