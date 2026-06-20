/**
 * Historial de Ausencias - Portal Maestros
 * Diseño Apple-style con estado encapsulado
 */
import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { AppToast } from '../../shared/components/AppToast.js';

class AusenciaHistorial {
  constructor() {
    this.state = {
      ausencias: [],
      loading: true,
      error: null
    };
    this.listenersAttached = false;
  }

  /**
   * Inicializa el componente en un contenedor
   * @param {HTMLElement} container - Elemento donde renderizar
   */
  async init(container) {
    if (!container) {
      console.error('AusenciaHistorial: Container no proporcionado');
      return;
    }

    this.container = container;
    this._attachListeners();
    await this._loadData();
    this._render();
  }

  _attachListeners() {
    if (this.listenersAttached) return;

    window.addEventListener('ausenciaSolicitada', () => this.refresh());
    window.addEventListener('ausenciaActualizada', () => this.refresh());

    this.listenersAttached = true;
  }

  /**
   * Cleanup para cuando se desmonta el componente
   */
  destroy() {
    window.removeEventListener('ausenciaSolicitada', () => this.refresh());
    window.removeEventListener('ausenciaActualizada', () => this.refresh());
    this.listenersAttached = false;
  }

  async refresh() {
    await this._loadData();
    this._render();
  }

  async _loadData() {
    this.state.loading = true;
    this.state.error = null;
    this._render();

    try {
      const maestro = getMaestroLocal();
      if (!maestro) {
        throw new Error('No hay sesión activa');
      }

      // Usar la tabla correcta: ausencias_maestros
      const { data, error } = await supabase
        .from('ausencias_maestros')
        .select('*')
        .eq('maestro_id', maestro.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.state.ausencias = data || [];
    } catch (error) {
      console.error('Error cargando ausencias:', error);
      this.state.error = 'No se pudieron cargar las ausencias. Intenta de nuevo.';
      this.state.ausencias = [];
    } finally {
      this.state.loading = false;
    }
  }

  _render() {
    if (!this.container) return;

    this.container.innerHTML = this._getHTML();
    this._attachEvents();
  }

  _getHTML() {
    if (this.state.loading) {
      return this._renderLoading();
    }

    if (this.state.error) {
      return this._renderError();
    }

    if (!this.state.ausencias.length) {
      return this._renderEmpty();
    }

    return `
      ${this._renderTable()}
      <div class="ah-cards">
        ${this._renderCards()}
      </div>
    `;
  }

  _renderLoading() {
    return `
      <div class="ah-loading" role="status" aria-live="polite">
        <div class="ah-spinner"></div>
        <span>Cargando historial...</span>
      </div>
    `;
  }

  _renderError() {
    return `
      <div class="ah-error" role="alert">
        <div class="ah-error-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <div class="ah-error-message">${this.state.error}</div>
        <button class="ah-btn ah-btn-retry" data-action="retry">
          <i class="bi bi-arrow-clockwise"></i> Reintentar
        </button>
      </div>
    `;
  }

  _renderEmpty() {
    return `
      <div class="ah-empty">
        <div class="ah-empty-icon">
          <i class="bi bi-calendar-check"></i>
        </div>
        <div class="ah-empty-title">Sin solicitudes</div>
        <div class="ah-empty-desc">No tienes solicitudes de ausencia registradas</div>
      </div>
    `;
  }

  _renderTable() {
    const rows = this.state.ausencias.map(a => this._renderRow(a)).join('');

    return `
      <div class="ah-table-container">
        <table class="ah-table" role="table" aria-label="Historial de ausencias">
          <caption class="ah-caption">Historial de solicitudes de ausencia</caption>
          <thead>
            <tr>
              <th scope="col">Fechas</th>
              <th scope="col">Tipo</th>
              <th scope="col">Motivo</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>

      <style>
        .ah-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 0.75rem;
          color: var(--pm-text-muted);
        }
        .ah-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--pm-border);
          border-top-color: var(--pm-primary);
          border-radius: 50%;
          animation: ah-spin 0.8s linear infinite;
        }
        @keyframes ah-spin {
          to { transform: rotate(360deg); }
        }

        .ah-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
          text-align: center;
        }
        .ah-error-icon {
          width: 60px;
          height: 60px;
          background: var(--pm-danger-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--pm-danger);
          margin-bottom: 1rem;
        }
        .ah-error-message {
          color: var(--pm-text-muted);
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .ah-btn-retry {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8125rem;
          color: var(--pm-text);
          transition: all 0.2s;
        }
        .ah-btn-retry:hover {
          border-color: var(--pm-primary);
          color: var(--pm-primary);
        }

        .ah-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 1rem;
          text-align: center;
        }
        .ah-empty-icon {
          width: 80px;
          height: 80px;
          background: var(--pm-surface-2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: var(--pm-border);
          margin-bottom: 1rem;
        }
        .ah-empty-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--pm-text);
          margin-bottom: 0.375rem;
        }
        .ah-empty-desc {
          font-size: 0.8125rem;
          color: var(--pm-text-muted);
        }

        .ah-table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .ah-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .ah-caption {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
        .ah-table th {
          text-align: left;
          padding: 0.75rem 0.625rem;
          font-weight: 600;
          color: var(--pm-text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          border-bottom: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
        }
        .ah-table td {
          padding: 0.75rem 0.625rem;
          border-bottom: 1px solid var(--pm-border);
          color: var(--pm-text);
        }
        .ah-table tr:hover td {
          background: var(--pm-surface);
        }

        .ah-date-range {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .ah-date-primary {
          font-weight: 500;
        }
        .ah-date-secondary {
          font-size: 0.6875rem;
          color: var(--pm-text-muted);
        }

        .ah-tipo {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }
        .ah-tipo-icon {
          font-size: 0.875rem;
        }
        .ah-tipo-enfermedad { color: #dc2626; }
        .ah-tipo-personal { color: #6366f1; }
        .ah-tipo-capacitacion { color: #0891b2; }
        .ah-tipo-vacaciones { color: #f59e0b; }
        .ah-tipo-otro { color: #6b7280; }

        .ah-motivo {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ah-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .ah-badge-pendiente {
          background: #fef3c7;
          color: #b45309;
        }
        .ah-badge-aprobada {
          background: #d1fae5;
          color: #047857;
        }
        .ah-badge-rechazada {
          background: #fee2e2;
          color: #b91c1c;
        }
        .ah-badge-cancelada {
          background: var(--pm-surface-2);
          color: var(--pm-text-muted);
        }

        .ah-btn-cancel {
          background: none;
          border: none;
          color: var(--pm-text-muted);
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .ah-btn-cancel:hover {
          color: var(--pm-danger);
        }

        @media (max-width: 600px) {
          .ah-table-container {
            display: none;
          }
          .ah-cards {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 0.5rem;
          }
          .ah-card {
            background: var(--pm-surface);
            border: 1px solid var(--pm-border);
            border-radius: 12px;
            padding: 1rem;
          }
          .ah-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
          }
          .ah-card-title {
            font-weight: 600;
            font-size: 0.9375rem;
            display: flex;
            align-items: center;
            gap: 0.375rem;
          }
          .ah-card-body {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .ah-card-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.8125rem;
          }
          .ah-card-label {
            color: var(--pm-text-muted);
          }
          .ah-card-value {
            color: var(--pm-text);
            text-align: right;
          }
        }
        @media (min-width: 601px) {
          .ah-cards { display: none; }
        }
      </style>
    `;
  }

  _renderRow(ausencia) {
    const fechaInicio = this._formatDate(ausencia.fecha_inicio);
    const fechaFin = this._formatDate(ausencia.fecha_fin);
    const mismaFecha = ausencia.fecha_inicio === ausencia.fecha_fin;
    const rango = mismaFecha ? fechaInicio : `${fechaInicio} - ${fechaFin}`;

    const tipoIcon = this._getTipoIcon(ausencia.tipo_ausencia);
    const tipoLabel = this._getTipoLabel(ausencia.tipo_ausencia);

    return `
      <tr>
        <td>
          <div class="ah-date-range">
            <span class="ah-date-primary">${rango}</span>
            ${!mismaFecha ? `<span class="ah-date-secondary">${this._calcDias(ausencia.fecha_inicio, ausencia.fecha_fin)} días</span>` : ''}
          </div>
        </td>
        <td>
          <span class="ah-tipo ah-tipo-${ausencia.tipo_ausencia}">
            ${tipoIcon} ${tipoLabel}
          </span>
        </td>
        <td>
          <span class="ah-motivo" title="${ausencia.motivo}">${ausencia.motivo}</span>
        </td>
        <td>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
            <span class="ah-badge ah-badge-${ausencia.estado}">${ausencia.estado}</span>
            ${ausencia.estado === 'pendiente' ? `
              <button class="ah-btn-cancel" data-action="cancel" data-id="${ausencia.id}" title="Cancelar solicitud">
                <i class="bi bi-x-circle"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  _renderCards() {
    return this.state.ausencias.map(ausencia => {
      const fechaInicio = this._formatDate(ausencia.fecha_inicio);
      const fechaFin = this._formatDate(ausencia.fecha_fin);
      const mismaFecha = ausencia.fecha_inicio === ausencia.fecha_fin;
      const rango = mismaFecha ? fechaInicio : `${fechaInicio} - ${fechaFin}`;

      return `
        <div class="ah-card">
          <div class="ah-card-header">
            <div class="ah-card-title">
              ${this._getTipoIcon(ausencia.tipo_ausencia)} ${this._getTipoLabel(ausencia.tipo_ausencia)}
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="ah-badge ah-badge-${ausencia.estado}">${ausencia.estado}</span>
              ${ausencia.estado === 'pendiente' ? `
                <button class="ah-btn-cancel" data-action="cancel" data-id="${ausencia.id}" title="Cancelar solicitud">
                  <i class="bi bi-x-circle"></i>
                </button>
              ` : ''}
            </div>
          </div>
          <div class="ah-card-body">
            <div class="ah-card-row">
              <span class="ah-card-label">Fechas</span>
              <span class="ah-card-value">${rango}</span>
            </div>
            <div class="ah-card-row">
              <span class="ah-card-label">Motivo</span>
              <span class="ah-card-value">${ausencia.motivo}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  _attachEvents() {
    this.container?.querySelectorAll('[data-action="retry"]').forEach(btn => {
      btn.addEventListener('click', () => this.refresh());
    });

    this.container?.querySelectorAll('[data-action="cancel"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this._cancelSolicitud(id);
      });
    });
  }

  async _cancelSolicitud(id) {
    if (!confirm('¿Estás seguro que deseas cancelar esta solicitud?')) return;

    try {
      const { error } = await supabase
        .from('ausencias_maestros')
        .update({ estado: 'cancelada' })
        .eq('id', id);

      if (error) throw error;

      AppToast.success('Solicitud cancelada correctamente');
      this.refresh();
    } catch (error) {
      console.error('Error al cancelar:', error);
      AppToast.error('No se pudo cancelar la solicitud');
    }
  }

  _formatDate(fecha) {
    if (!fecha) return '-';
    const locale = navigator.language || 'es-ES';
    return new Date(fecha).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  _calcDias(inicio, fin) {
    if (!inicio || !fin) return 0;
    const start = new Date(inicio);
    const end = new Date(fin);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  _getTipoIcon(tipo) {
    const icons = {
      'enfermedad': '<i class="bi bi-thermometer-half ah-tipo-icon"></i>',
      'personal': '<i class="bi bi-person ah-tipo-icon"></i>',
      'capacitacion': '<i class="bi bi-book ah-tipo-icon"></i>',
      'vacaciones': '<i class="bi bi-sun ah-tipo-icon"></i>',
      'otro': '<i class="bi bi-three-dots ah-tipo-icon"></i>'
    };
    return icons[tipo] || icons['otro'];
  }

  _getTipoLabel(tipo) {
    const labels = {
      'enfermedad': 'Enfermedad',
      'personal': 'Personal',
      'capacitacion': 'Capacitación',
      'vacaciones': 'Vacaciones',
      'otro': 'Otro'
    };
    return labels[tipo] || 'Otro';
  }
}

// Instancia singleton
const ausenciaHistorial = new AusenciaHistorial();

/**
 * Renderiza el historial en un contenedor
 * @param {string|HTMLElement} selector - Selector o elemento contenedor
 */
export async function renderAusenciaHistorial(selector) {
  const container = typeof selector === 'string' 
    ? document.querySelector(selector) 
    : selector;
  
  if (!container) {
    console.error('AusenciaHistorial: Contenedor no encontrado');
    return;
  }

  await ausenciaHistorial.init(container);
}

/**
 * Refresca los datos del historial
 */
export async function refreshAusenciaHistorial() {
  await ausenciaHistorial.refresh();
}

/**
 * Limpia recursos al desmontar
 */
export function destroyAusenciaHistorial() {
  ausenciaHistorial.destroy();
}

export { ausenciaHistorial };