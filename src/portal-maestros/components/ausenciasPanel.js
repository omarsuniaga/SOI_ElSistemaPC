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

    // Ordenar por fecha de inicio (más reciente primero)
    const sortedAusencias = [...this.ausencias].sort((a, b) => 
      new Date(b.fecha_inicio) - new Date(a.fecha_inicio)
    );

    let html = `
      <div class="ausencias-dashboard">
        <!-- Header con stats -->
        <div class="ausencias-header">
          <div class="ausencias-header-title">
            <i class="bi bi-calendar-range"></i>
            <span>Historial de Ausencias</span>
          </div>
          <div class="ausencias-header-stats">
            <div class="ausencia-stat-mini pending">
              <span>${pendingCount}</span>
              <small>pend.</small>
            </div>
            <div class="ausencia-stat-mini approved">
              <span>${approvedCount}</span>
              <small>aprob.</small>
            </div>
            <div class="ausencia-stat-mini rejected">
              <span>${rejectedCount}</span>
              <small>rech.</small>
            </div>
          </div>
        </div>

        <!-- Lista tipo estado de cuenta -->
        <div class="ausencias-timeline">
          ${sortedAusencias.length > 0 ? sortedAusencias.map((a, idx) => this.renderAcordeon(a, idx)).join('') : this.renderEmptyState()}
        </div>
      </div>

      <style>
        .ausencias-dashboard { padding: 0; display: flex; flex-direction: column; height: 100%; }
        
        /* Header */
        .ausencias-header {
          padding: 1rem;
          border-bottom: 1px solid var(--pm-border);
          background: var(--pm-surface);
        }
        .ausencias-header-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--pm-text);
          margin-bottom: 0.75rem;
        }
        .ausencias-header-title i { color: var(--pm-primary); }
        .ausencias-header-stats {
          display: flex;
          gap: 0.5rem;
        }
        .ausencia-stat-mini {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
        }
        .ausencia-stat-mini small {
          font-size: 0.625rem;
          font-weight: 400;
          opacity: 0.8;
        }
        .ausencia-stat-mini.pending { background: #fef3c7; color: #b45309; }
        .ausencia-stat-mini.approved { background: #d1fae5; color: #047857; }
        .ausencia-stat-mini.rejected { background: #fee2e2; color: #b91c1c; }

        /* Timeline */
        .ausencias-timeline {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        /* Acordeón estilo estado de cuenta */
        .ausencia-item {
          margin-bottom: 0.5rem;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          background: var(--pm-surface);
          overflow: hidden;
          transition: all 0.2s;
        }
        .ausencia-item.open {
          border-color: var(--pm-primary);
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
        }

        .ausencia-item-header {
          display: flex;
          align-items: center;
          padding: 0.875rem;
          cursor: pointer;
          gap: 0.75rem;
        }
        .ausencia-item-header:hover {
          background: var(--pm-surface-2);
        }

        .ausencia-fecha-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 48px;
        }
        .ausencia-fecha-dia {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--pm-text);
          line-height: 1;
        }
        .ausencia-fecha-mes {
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--pm-text-muted);
          font-weight: 600;
        }

        .ausencia-info-col {
          flex: 1;
          min-width: 0;
        }
        .ausencia-info-tipo {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--pm-text);
        }
        .ausencia-info-tipo i { font-size: 1rem; }
        .ausencia-info-fecha {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin-top: 0.125rem;
        }

        .ausencia-estado-col {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ausencia-badge {
          font-size: 0.6875rem;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .ausencia-badge.pendiente { background: #fef3c7; color: #b45309; }
        .ausencia-badge.aprobada { background: #d1fae5; color: #047857; }
        .ausencia-badge.rechazada { background: #fee2e2; color: #b91c1c; }
        .ausencia-badge.cancelada { background: var(--pm-surface-2); color: var(--pm-text-muted); }

        .ausencia-chevron {
          font-size: 0.875rem;
          color: var(--pm-text-muted);
          transition: transform 0.2s;
        }
        .ausencia-item.open .ausencia-chevron {
          transform: rotate(180deg);
        }

        /* Detalle expandido */
        .ausencia-item-detail {
          display: none;
          padding: 0 0.875rem 0.875rem;
          border-top: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
        }
        .ausencia-item.open .ausencia-item-detail {
          display: block;
        }

        .ausencia-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          padding-top: 0.75rem;
        }
        .ausencia-detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .ausencia-detail-label {
          font-size: 0.6875rem;
          text-transform: uppercase;
          color: var(--pm-text-muted);
          font-weight: 600;
        }
        .ausencia-detail-value {
          font-size: 0.8125rem;
          color: var(--pm-text);
        }

        .ausencia-detail-motivo {
          grid-column: 1 / -1;
          background: var(--pm-surface);
          padding: 0.625rem;
          border-radius: 6px;
          font-size: 0.8125rem;
          color: var(--pm-text);
          line-height: 1.4;
        }

        .ausencia-detail-clases {
          grid-column: 1 / -1;
        }
        .ausencia-clases-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-top: 0.25rem;
        }
        .ausencia-clase-tag {
          font-size: 0.6875rem;
          padding: 0.25rem 0.5rem;
          background: var(--pm-surface);
          border-radius: 4px;
          color: var(--pm-text);
        }

        .ausencia-detail-emergente {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--pm-primary-bg);
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--pm-primary);
        }

        .ausencia-detail-urgencia {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ausencia-urgencia-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .ausencia-urgencia-indicator.alta { background: #dc2626; }
        .ausencia-urgencia-indicator.media { background: #f59e0b; }
        .ausencia-urgencia-indicator.baja { background: #10b981; }

        .ausencia-detail-footer {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid var(--pm-border);
          margin-top: 0.5rem;
        }
        .ausencia-detail-date {
          font-size: 0.6875rem;
          color: var(--pm-text-muted);
        }
        .ausencia-detail-actions {
          display: flex;
          gap: 0.5rem;
        }

        /* Empty state */
        .ausencia-empty {
          text-align: center;
          padding: 3rem 1rem;
        }
        .ausencia-empty-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          background: var(--pm-surface-2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--pm-border);
        }
        .ausencia-empty-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--pm-text);
          margin-bottom: 0.25rem;
        }
        .ausencia-empty-desc {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
        }
      </style>
    `;

    bodyEl.innerHTML = html;

    // Attach accordion events
    bodyEl.querySelectorAll('.ausencia-item-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const item = header.closest('.ausencia-item')
        item.classList.toggle('open')
      })
    })

    bodyEl.querySelectorAll('.btn-cancelar-ausencia').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id
        this.cancelarAusencia(id)
      })
    })
  }

  renderAcordeon(ausencia, idx) {
    const fecha = new Date(ausencia.fecha_inicio)
    const dia = fecha.getDate()
    const mes = fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()
    
    const fechaInicio = new Date(ausencia.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    const fechaFin = new Date(ausencia.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    const mismaFecha = ausencia.fecha_inicio === ausencia.fecha_fin
    const rangoFechas = mismaFecha ? fechaInicio : `${fechaInicio} - ${fechaFin}`
    
    const diasTotales = this._calcDias(ausencia.fecha_inicio, ausencia.fecha_fin)
    
    const tipoIcon = this.getTipoIcon(ausencia.tipo_ausencia)
    const tipoLabel = this.getTipoLabel(ausencia.tipo_ausencia)

    const clasesAfectadas = ausencia.clases_afectadas || []
    const actividades = ausencia.actividades_por_clase || {}
    const claseEmergente = ausencia.clase_emergente

    // Armar detalle
    let detalleHtml = `
      <div class="ausencia-detail-motivo">
        <span class="ausencia-detail-label">Motivo</span>
        <div>${ausencia.motivo}</div>
      </div>
      
      <div class="ausencia-detail-item">
        <span class="ausencia-detail-label">Duración</span>
        <span class="ausencia-detail-value">${diasTotales} ${diasTotales === 1 ? 'día' : 'días'}</span>
      </div>
      
      <div class="ausencia-detail-urgencia">
        <span class="ausencia-urgencia-indicator ${ausencia.urgencia}"></span>
        <span class="ausencia-detail-value">Urgencia ${ausencia.urgencia}</span>
      </div>
    `

    // Clases afectadas
    if (clasesAfectadas.length > 0) {
      detalleHtml += `
        <div class="ausencia-detail-clases">
          <span class="ausencia-detail-label">Clases Afectadas</span>
          <div class="ausencia-clases-list">
            ${clasesAfectadas.map(c => `<span class="ausencia-clase-tag">Clase #${c}</span>`).join('')}
          </div>
        </div>
      `
    }

    // Clase emergente
    if (claseEmergente) {
      const fechaEmer = new Date(claseEmergente.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      detalleHtml += `
        <div class="ausencia-detail-emergente">
          <i class="bi bi-arrow-repeat"></i>
          <span>Recuperación: ${fechaEmer} a las ${claseEmergente.hora}</span>
        </div>
      `
    }

    // Footer con fecha de creación y acción
    const fechaCreacion = new Date(ausencia.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    
    detalleHtml += `
      <div class="ausencia-detail-footer">
        <span class="ausencia-detail-date">
          <i class="bi bi-clock"></i> Creada el ${fechaCreacion}
        </span>
        ${ausencia.estado === 'pendiente' ? `
          <div class="ausencia-detail-actions">
            <button class="pm-btn pm-btn-sm pm-btn-outline-danger btn-cancelar-ausencia" data-id="${ausencia.id}">
              <i class="bi bi-x-lg"></i> Cancelar
            </button>
          </div>
        ` : ''}
      </div>
    `

    return `
      <div class="ausencia-item" data-index="${idx}">
        <div class="ausencia-item-header">
          <div class="ausencia-fecha-col">
            <span class="ausencia-fecha-dia">${dia}</span>
            <span class="ausencia-fecha-mes">${mes}</span>
          </div>
          <div class="ausencia-info-col">
            <div class="ausencia-info-tipo">
              ${tipoIcon} ${tipoLabel}
            </div>
            <div class="ausencia-info-fecha">${rangoFechas}</div>
          </div>
          <div class="ausencia-estado-col">
            <span class="ausencia-badge ${ausencia.estado}">${ausencia.estado}</span>
            <i class="bi bi-chevron-down ausencia-chevron"></i>
          </div>
        </div>
        <div class="ausencia-item-detail">
          <div class="ausencia-detail-grid">
            ${detalleHtml}
          </div>
        </div>
      </div>
    `
  }

  _calcDias(inicio, fin) {
    if (!inicio || !fin) return 1
    const start = new Date(inicio)
    const end = new Date(fin)
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  }

  renderEmptyState() {
    return `
      <div class="ausencia-empty">
        <div class="ausencia-empty-icon">
          <i class="bi bi-calendar-x"></i>
        </div>
        <div class="ausencia-empty-title">Sin solicitudes</div>
        <div class="ausencia-empty-desc">No has realizado ninguna solicitud de ausencia.</div>
      </div>
    `
  }

  getTipoIcon(tipo) {
    const icons = {
      'enfermedad': '<i class="bi bi-thermometer-half" style="color:#dc2626;"></i>',
      'personal': '<i class="bi bi-person" style="color:#6366f1;"></i>',
      'capacitacion': '<i class="bi bi-book" style="color:#0891b2;"></i>',
      'vacaciones': '<i class="bi bi-sun" style="color:#f59e0b;"></i>',
      'otro': '<i class="bi bi-three-dots" style="color:#6b7280;"></i>'
    }
    return icons[tipo] || '<i class="bi bi-three-dots" style="color:#6b7280;"></i>'
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
