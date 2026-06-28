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