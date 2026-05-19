/**
 * ausenciaModal.js
 * 5-step FSM workflow for teacher absence management.
 *
 * Architecture:
 * - AusenciaModal: view layer — renders steps, dispatches events, mutates state
 * - ausenciaService: service layer — DB/network IO only (no DOM)
 * - ausenciaValidator: pure validation (no IO)
 * - ausenciaUtils: pure helpers (filterBusinessDays, truncateWhatsAppText)
 *
 * Usage:
 *   import { ausenciaModal } from './ausenciaModal.js';
 *   ausenciaModal.open(maestro);
 */

import { AppModal } from '../../shared/components/AppModal.js';
import { AppToast } from '../../shared/components/AppToast.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { escHTML } from '../utils/portalUtils.js';
import { enableTrap } from '../utils/focusTrap.js';
import { ausenciaService } from '../services/ausenciaService.js';
import { validateStep1, validateStep2, validateStep3 } from '../services/ausenciaValidator.js';
import { filterBusinessDays } from '../services/ausenciaUtils.js';

// ── Step metadata ─────────────────────────────────────────────────────────────

const STEP_TITLES = {
  1: 'Paso 1 de 5 — Duración de la Ausencia',
  2: 'Paso 2 de 5 — Clases Afectadas',
  3: 'Paso 3 de 5 — Plan de Recuperación',
  4: 'Paso 4 de 5 — Datos Administrativos',
  5: 'Paso 5 de 5 — Confirmación y Envío',
};

const STEP_SAVE_TEXTS = {
  1: 'Siguiente',
  2: 'Siguiente',
  3: 'Siguiente',
  4: 'Siguiente',
  5: 'Enviar Solicitud',
};

// ── AusenciaModal ─────────────────────────────────────────────────────────────

export class AusenciaModal {
  constructor() {
    /** @type {{ id: string, nombre: string }|null} */
    this.maestro = null;

    /** @type {number} */
    this.currentStep = 1;

    /** @type {Object} */
    this.state = this.defaultState();

    this._focusTrap = null;
  }

  // ── State ──────────────────────────────────────────────────────────────────

  /**
   * Returns a fresh default state object.
   * @returns {Object}
   */
  defaultState() {
    return {
      duracionTipo: 'un_dia',
      fechaAusencia: '',
      fechaInicio: '',
      fechaFin: '',
      clasesAfectadas: [],
      tipoAusencia: '',
      urgencia: '',
      motivo: '',
      archivo: { file: null, uploadedUrl: null },
      notificarDirector: true,
      validationErrors: {},
      loadingStates: {
        classes: false,
        salones: false,
        maestros: false,
        upload: false,
      },
      // internal flags for step 2
      _classesLoaded: false,
      _classesError: false,
      whatsappText: '',
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Open the modal for a given teacher.
   * @param {Object} [maestroOverride] - Optional maestro to use instead of local
   */
  open(maestroOverride) {
    if (this._focusTrap) {
      this._focusTrap.dispose();
      this._focusTrap = null;
    }

    this.maestro = maestroOverride ?? getMaestroLocal();
    if (!this.maestro) {
      AppToast.error('Debes estar logueado para solicitar ausencias');
      return;
    }

    this.state = this.defaultState();
    this.currentStep = 1;

    AppModal.open({
      title: this.getTitle(),
      size: 'lg',
      body: this.renderCurrentStep(),
      saveText: this.getSaveButtonText(),
      onSave: () => this.handleStepSubmit(),
      onShow: () => this.attachStepEvents(),
    });
  }

  /**
   * Close the modal and clean up.
   */
  close() {
    if (this._focusTrap) {
      this._focusTrap.dispose();
      this._focusTrap = null;
    }
    AppModal.close();
  }

  /**
   * Returns the title string for the current step.
   * @returns {string}
   */
  getTitle() {
    return STEP_TITLES[this.currentStep] ?? `Paso ${this.currentStep}`;
  }

  /**
   * Returns the save button label for the current step.
   * @returns {string}
   */
  getSaveButtonText() {
    return STEP_SAVE_TEXTS[this.currentStep] ?? 'Siguiente';
  }

  // ── Step Dispatcher ────────────────────────────────────────────────────────

  /**
   * Render the body HTML for the current step.
   * @returns {string}
   */
  renderCurrentStep() {
    switch (this.currentStep) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      default: return `<p>Paso ${this.currentStep} pendiente de implementación.</p>`;
    }
  }

  /**
   * Attach step-specific event listeners. Called by AppModal's onShow callback.
   */
  attachStepEvents() {
    switch (this.currentStep) {
      case 1: this._attachStep1Events(); break;
      case 2: this._attachStep2Events(); break;
      case 3: this._attachStep3Events(); break;
    }

    const dialog = document.querySelector('.app-modal-dialog');
    if (dialog) {
      this._focusTrap = enableTrap(dialog, { onClose: () => this.close() });
    }
  }

  /**
   * Handle the primary CTA for the current step (validate → advance).
   */
  async handleStepSubmit() {
    let result;

    switch (this.currentStep) {
      case 1:
        result = this.validateStep1();
        break;
      case 2:
        result = this.validateStep2();
        break;
      case 3:
        result = this.validateStep3();
        break;
      default:
        result = { valid: true, errors: [] };
    }

    if (!result.valid) {
      this.state.validationErrors[this.currentStep] = result.errors;
      this._showValidationErrors(result.errors);
      return false;
    }

    this.state.validationErrors[this.currentStep] = [];
    this.currentStep += 1;
    this._rerenderModal();
    return true;
  }

  // ── Validation delegates ───────────────────────────────────────────────────

  /**
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateStep1() {
    return validateStep1(this.state);
  }

  /**
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateStep2() {
    return validateStep2(this.state);
  }

  /**
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateStep3() {
    return validateStep3(this.state);
  }

  // ── Step 1: Duration + Dates ───────────────────────────────────────────────

  /**
   * Render Step 1 HTML.
   * @returns {string}
   */
  renderStep1() {
    const isUnDia = this.state.duracionTipo !== 'varios_dias';

    return `
      <div class="pm-form-section">
        <h3 class="pm-form-label">Duración de la Ausencia <span class="pm-required">*</span></h3>
        <div class="pm-two-cols" role="radiogroup" aria-label="Duración de la ausencia">
          <label class="pm-duration-option">
            <input
              type="radio"
              name="duracion_tipo"
              value="un_dia"
              ${isUnDia ? 'checked' : ''}
              aria-label="Un solo día"
            >
            <span class="pm-duration-card">
              <strong>Un solo día</strong>
              <small>Seleccionar una fecha</small>
            </span>
          </label>
          <label class="pm-duration-option">
            <input
              type="radio"
              name="duracion_tipo"
              value="varios_dias"
              ${!isUnDia ? 'checked' : ''}
              aria-label="Varios días (rango)"
            >
            <span class="pm-duration-card">
              <strong>Varios días (rango)</strong>
              <small>Seleccionar rango de fechas</small>
            </span>
          </label>
        </div>
      </div>

      <div id="fecha-unica-container" class="pm-form-section" ${!isUnDia ? 'style="display:none"' : ''}>
        <label class="pm-form-label" for="fecha-unica">
          Fecha de la ausencia <span class="pm-required">*</span>
        </label>
        <input
          type="date"
          id="fecha-unica"
          class="pm-form-input"
          value="${escHTML(this.state.fechaAusencia)}"
          placeholder="YYYY-MM-DD"
          aria-required="true"
        >
      </div>

      <div id="fecha-rango-container" class="pm-form-section" ${isUnDia ? 'style="display:none"' : ''}>
        <div class="pm-two-cols">
          <div>
            <label class="pm-form-label" for="fecha-inicio">
              Desde <span class="pm-required">*</span>
            </label>
            <input
              type="date"
              id="fecha-inicio"
              class="pm-form-input"
              value="${escHTML(this.state.fechaInicio)}"
              placeholder="YYYY-MM-DD"
              aria-required="true"
            >
          </div>
          <div>
            <label class="pm-form-label" for="fecha-fin">
              Hasta <span class="pm-required">*</span>
            </label>
            <input
              type="date"
              id="fecha-fin"
              class="pm-form-input"
              value="${escHTML(this.state.fechaFin)}"
              placeholder="YYYY-MM-DD"
              aria-required="true"
            >
          </div>
        </div>
      </div>

      <div id="step1-errors" class="pm-validation-errors" role="alert" aria-live="polite"></div>

      <div class="pm-step-actions">
        <button type="button" class="pm-btn pm-btn-secondary" id="btn-cancelar-step1">
          Cancelar
        </button>
        <button type="button" class="pm-btn pm-btn-primary" id="btn-siguiente-step1">
          Siguiente
        </button>
      </div>
    `;
  }

  /**
   * Attach events for Step 1.
   * @private
   */
  _attachStep1Events() {
    const radios = document.querySelectorAll('input[name="duracion_tipo"]');
    const fechaUnicaContainer = document.getElementById('fecha-unica-container');
    const fechaRangoContainer = document.getElementById('fecha-rango-container');

    radios.forEach((radio) => {
      radio.addEventListener('change', () => {
        this.state.duracionTipo = radio.value;
        const isUnDia = radio.value === 'un_dia';
        if (fechaUnicaContainer) fechaUnicaContainer.style.display = isUnDia ? '' : 'none';
        if (fechaRangoContainer) fechaRangoContainer.style.display = isUnDia ? 'none' : '';
      });
    });

    const fechaUnica = document.getElementById('fecha-unica');
    fechaUnica?.addEventListener('change', (e) => {
      this.state.fechaAusencia = e.target.value;
    });

    const fechaInicio = document.getElementById('fecha-inicio');
    fechaInicio?.addEventListener('change', (e) => {
      this.state.fechaInicio = e.target.value;
    });

    const fechaFin = document.getElementById('fecha-fin');
    fechaFin?.addEventListener('change', (e) => {
      this.state.fechaFin = e.target.value;
    });

    document.getElementById('btn-cancelar-step1')?.addEventListener('click', () => {
      this.close();
    });

    document.getElementById('btn-siguiente-step1')?.addEventListener('click', () => {
      this.handleStepSubmit();
    });
  }

  // ── Step 2: Affected Classes ───────────────────────────────────────────────

  /**
   * Render Step 2 HTML.
   * @returns {string}
   */
  renderStep2() {
    const { loadingStates, clasesAfectadas, _classesLoaded, _classesError } = this.state;

    let content;

    if (loadingStates.classes) {
      content = `
        <div class="pm-loading-state" aria-live="polite">
          <div class="pm-spinner" role="status" aria-label="Cargando"></div>
          <p>Buscando tus clases...</p>
        </div>
      `;
    } else if (_classesError) {
      content = `
        <div class="pm-error-state" role="alert">
          <p>Error al cargar clases. Intenta de nuevo.</p>
          <button type="button" class="pm-btn pm-btn-secondary" id="btn-retry-classes">
            Reintentar
          </button>
        </div>
      `;
    } else if (_classesLoaded && clasesAfectadas.length === 0) {
      content = `
        <div class="pm-empty-state">
          <p>No hay clases programadas en esa fecha. Revisa la duración.</p>
        </div>
      `;
    } else if (clasesAfectadas.length > 0) {
      content = clasesAfectadas.map((c) => `
        <div class="pm-step-card">
          <h4 class="pm-step-card-title">${escHTML(c.className)}</h4>
          <p class="pm-step-card-subtitle">${escHTML(c.sessionDate)} a las ${escHTML(c.sessionTime)}</p>
        </div>
      `).join('');
    } else {
      // Initial state — trigger load
      content = `
        <div class="pm-loading-state" aria-live="polite">
          <div class="pm-spinner" role="status" aria-label="Cargando"></div>
          <p>Buscando tus clases...</p>
        </div>
      `;
    }

    const dateRange = this._getDateRangeLabel();

    return `
      <div class="pm-form-section">
        <h3 class="pm-form-label">Clases afectadas</h3>
        ${dateRange ? `<p class="pm-form-hint">${escHTML(dateRange)}</p>` : ''}
        <div id="clases-afectadas-list">
          ${content}
        </div>
      </div>

      <div id="step2-errors" class="pm-validation-errors" role="alert" aria-live="polite"></div>

      <div class="pm-step-actions">
        <button type="button" class="pm-btn pm-btn-secondary" id="btn-atras-step2">
          Atrás
        </button>
        <button type="button" class="pm-btn pm-btn-primary" id="btn-siguiente-step2">
          Siguiente
        </button>
      </div>
    `;
  }

  /**
   * Attach events for Step 2.
   * @private
   */
  _attachStep2Events() {
    document.getElementById('btn-atras-step2')?.addEventListener('click', () => {
      this.currentStep = 1;
      this._rerenderModal();
    });

    document.getElementById('btn-siguiente-step2')?.addEventListener('click', () => {
      this.handleStepSubmit();
    });

    document.getElementById('btn-retry-classes')?.addEventListener('click', () => {
      this.state._classesError = false;
      this.onLoadAffectedClasses();
    });

    // Auto-load classes when entering step 2
    if (!this.state._classesLoaded && !this.state._classesError) {
      this.onLoadAffectedClasses();
    }
  }

  /**
   * Load affected classes from the service, update state, and re-render the list.
   * @returns {Promise<void>}
   */
  async onLoadAffectedClasses() {
    if (!this.maestro) return;

    const { fechaInicio, fechaFin } = this._getDateRange();
    this.state.loadingStates.classes = true;
    this.state._classesError = false;
    this._updateStep2List();

    try {
      const raw = await ausenciaService.findAffectedClasses(this.maestro.id, {
        fechaInicio,
        fechaFin,
      });
      const filtered = filterBusinessDays(raw ?? []);
      this.state.clasesAfectadas = filtered;
      this.state._classesLoaded = true;
    } catch {
      this.state._classesError = true;
    } finally {
      this.state.loadingStates.classes = false;
      this._updateStep2List();
    }
  }

  /**
   * Update only the classes list in the DOM without full re-render.
   * @private
   */
  _updateStep2List() {
    const container = document.getElementById('clases-afectadas-list');
    if (!container) return;
    // Re-render just the list portion using current state
    const tmp = document.createElement('div');
    tmp.innerHTML = this.renderStep2();
    const newList = tmp.querySelector('#clases-afectadas-list');
    if (newList) container.innerHTML = newList.innerHTML;
  }

  // ── Step 3: Recovery Planning per Class ───────────────────────────────────

  /**
   * Render Step 3 HTML.
   * @returns {string}
   */
  renderStep3() {
    const panels = this.state.clasesAfectadas.map((c) => {
      const claseId = escHTML(c.claseId);
      const plan = c.recoveryPlan ?? {};

      return `
        <div class="pm-panel-tareas pm-form-section">
          <h4>${escHTML(c.className)}</h4>
          <p class="pm-form-hint">${escHTML(c.sessionDate)} a las ${escHTML(c.sessionTime)}</p>

          <div>
            <label>
              <input
                type="radio"
                name="opcion-${claseId}"
                value="tareas"
                ${plan.tipo === 'tareas' ? 'checked' : ''}
              >
              Asignar tareas/ejercicios
            </label>
          </div>
          <textarea
            id="tareas-${claseId}"
            class="pm-form-textarea pm-tareas-input"
            data-clase-id="${claseId}"
            placeholder="Describe las tareas..."
            ${plan.tipo !== 'tareas' ? 'style="display:none"' : ''}
          >${escHTML(plan.actividadReemplazo ?? '')}</textarea>

          <div>
            <label>
              <input
                type="radio"
                name="opcion-${claseId}"
                value="reprogramar"
                ${plan.tipo === 'reprogramar' ? 'checked' : ''}
              >
              Reprogramar clase
            </label>
          </div>
          <div
            id="reprogramar-${claseId}"
            class="pm-reprogramar-fields"
            data-clase-id="${claseId}"
            ${plan.tipo !== 'reprogramar' ? 'style="display:none"' : ''}
          >
            <input
              type="date"
              id="fecha-reprograma-${claseId}"
              class="pm-form-input pm-fecha-reprograma"
              data-clase-id="${claseId}"
              value="${escHTML(plan.fechaReprograma ?? '')}"
            >
            <input
              type="time"
              id="hora-reprograma-${claseId}"
              class="pm-form-input pm-hora-reprograma"
              data-clase-id="${claseId}"
              value="${escHTML(plan.horaReprograma ?? '')}"
            >
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="pm-form-section">
        <h3 class="pm-form-label">Plan de recuperación por clase</h3>
        ${panels || '<p class="pm-form-hint">No hay clases afectadas registradas.</p>'}
      </div>

      <div id="step3-errors" class="pm-validation-errors" role="alert" aria-live="polite"></div>

      <div class="pm-step-actions">
        <button type="button" class="pm-btn pm-btn-secondary" id="btn-atras-step3">
          Atrás
        </button>
        <button type="button" class="pm-btn pm-btn-primary" id="btn-siguiente-step3">
          Siguiente
        </button>
      </div>
    `;
  }

  /**
   * Attach events for Step 3.
   * @private
   */
  _attachStep3Events() {
    document.getElementById('btn-atras-step3')?.addEventListener('click', () => {
      this.currentStep = 2;
      this._rerenderModal();
    });

    document.getElementById('btn-siguiente-step3')?.addEventListener('click', () => {
      this.handleStepSubmit();
    });

    // Radio toggles for each class
    document.querySelectorAll('input[type="radio"][name^="opcion-"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const claseId = radio.name.replace('opcion-', '');
        const tipo = radio.value;
        this._setRecoveryPlanType(claseId, tipo);
        this._toggleRecoveryFields(claseId, tipo);
      });
    });

    // Textarea capture
    document.querySelectorAll('.pm-tareas-input').forEach((ta) => {
      ta.addEventListener('input', () => {
        const claseId = ta.dataset.claseId;
        this._updateRecoveryPlanField(claseId, 'actividadReemplazo', ta.value);
      });
    });

    // Date/time capture
    document.querySelectorAll('.pm-fecha-reprograma').forEach((input) => {
      input.addEventListener('change', () => {
        const claseId = input.dataset.claseId;
        this._updateRecoveryPlanField(claseId, 'fechaReprograma', input.value);
      });
    });

    document.querySelectorAll('.pm-hora-reprograma').forEach((input) => {
      input.addEventListener('change', () => {
        const claseId = input.dataset.claseId;
        this._updateRecoveryPlanField(claseId, 'horaReprograma', input.value);
      });
    });
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Set the recovery plan type for a class.
   * @private
   */
  _setRecoveryPlanType(claseId, tipo) {
    const clase = this.state.clasesAfectadas.find((c) => c.claseId === claseId);
    if (!clase) return;
    clase.recoveryPlan = { ...(clase.recoveryPlan ?? {}), tipo };
  }

  /**
   * Update a field inside a class's recoveryPlan.
   * @private
   */
  _updateRecoveryPlanField(claseId, field, value) {
    const clase = this.state.clasesAfectadas.find((c) => c.claseId === claseId);
    if (!clase) return;
    clase.recoveryPlan = { ...(clase.recoveryPlan ?? {}), [field]: value };
  }

  /**
   * Toggle visibility of textarea vs reprogramar fields for a class.
   * @private
   */
  _toggleRecoveryFields(claseId, tipo) {
    const textarea = document.getElementById(`tareas-${claseId}`);
    const reprogramar = document.getElementById(`reprogramar-${claseId}`);
    if (textarea) textarea.style.display = tipo === 'tareas' ? '' : 'none';
    if (reprogramar) reprogramar.style.display = tipo === 'reprogramar' ? '' : 'none';
  }

  /**
   * Display validation error messages in the current step's error container.
   * @param {string[]} errors
   * @private
   */
  _showValidationErrors(errors) {
    const containerId = `step${this.currentStep}-errors`;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = errors
      .map((e) => `<p class="pm-error-message">${escHTML(e)}</p>`)
      .join('');
  }

  /**
   * Full re-render of modal body + title + button text.
   * @private
   */
  _rerenderModal() {
    const bodyEl = document.querySelector('.app-modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = this.renderCurrentStep();
    }

    const titleEl = document.querySelector('.app-modal-title');
    if (titleEl) {
      titleEl.textContent = this.getTitle();
    }

    const saveBtn = document.querySelector('.app-modal-save');
    if (saveBtn) {
      saveBtn.textContent = this.getSaveButtonText();
    }

    this.attachStepEvents();
  }

  /**
   * Build the date range for service calls based on current state.
   * @returns {{ fechaInicio: string, fechaFin: string }}
   * @private
   */
  _getDateRange() {
    if (this.state.duracionTipo === 'un_dia') {
      return {
        fechaInicio: this.state.fechaAusencia,
        fechaFin: this.state.fechaAusencia,
      };
    }
    return {
      fechaInicio: this.state.fechaInicio,
      fechaFin: this.state.fechaFin,
    };
  }

  /**
   * Returns a human-readable date range label.
   * @returns {string}
   * @private
   */
  _getDateRangeLabel() {
    const { fechaInicio, fechaFin } = this._getDateRange();
    if (!fechaInicio) return '';
    if (fechaInicio === fechaFin) return `Fecha: ${fechaInicio}`;
    return `Del ${fechaInicio} al ${fechaFin}`;
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const ausenciaModal = new AusenciaModal();
