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
import { fileUploadService } from '../services/fileUploadService.js';
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5 } from '../services/ausenciaValidator.js';
import { filterBusinessDays, truncateWhatsAppText, prepareWhatsAppLink } from '../services/ausenciaUtils.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_MOTIVO_CHARS = 500;
const ALLOWED_FILE_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_FILE_SIZE = 5_000_000;

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

    /** @type {string|null} Director phone number (digits only) */
    this.directorPhone = null;

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
      submitting: false,
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
      case 4: return this.renderStep4();
      case 5: return this.renderStep5();
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
      case 4: this._attachStep4Events(); break;
      case 5: this._attachStep5Events(); break;
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
      case 4:
        result = this.validateStep4();
        break;
      case 5:
        result = this.validateStep5();
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

    if (this.currentStep === 5) {
      await this.submitForm();
      return true;
    }

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

  /**
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateStep4() {
    return validateStep4(this.state);
  }

  /**
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validateStep5() {
    return validateStep5();
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

  // ── Step 4: Admin Metadata + File Upload ──────────────────────────────────

  /**
   * Render Step 4 HTML — absence type, urgency, motivo, file upload, notification.
   * @returns {string}
   */
  renderStep4() {
    const { tipoAusencia, urgencia, motivo, notificarDirector } = this.state;
    const charCount = motivo ? motivo.length : 0;

    return `
      <div class="pm-form-section">
        <h3 class="pm-form-label">Información de la ausencia</h3>
      </div>

      <div class="pm-form-section">
        <label class="pm-form-label" for="tipo-ausencia">
          Tipo de ausencia <span class="pm-required">*</span>
        </label>
        <select id="tipo-ausencia" class="pm-form-input" aria-required="true">
          <option value="">-- Selecciona --</option>
          <option value="enfermedad" ${tipoAusencia === 'enfermedad' ? 'selected' : ''}>Enfermedad</option>
          <option value="personal" ${tipoAusencia === 'personal' ? 'selected' : ''}>Personal</option>
          <option value="capacitacion" ${tipoAusencia === 'capacitacion' ? 'selected' : ''}>Capacitación</option>
          <option value="otro" ${tipoAusencia === 'otro' ? 'selected' : ''}>Otro</option>
        </select>
      </div>

      <div class="pm-form-section">
        <label class="pm-form-label" for="urgencia">
          Urgencia <span class="pm-required">*</span>
        </label>
        <select id="urgencia" class="pm-form-input" aria-required="true">
          <option value="">-- Selecciona --</option>
          <option value="planificada" ${urgencia === 'planificada' ? 'selected' : ''}>Planificada</option>
          <option value="proximos3dias" ${urgencia === 'proximos3dias' ? 'selected' : ''}>Próximos 3 días</option>
          <option value="hoy" ${urgencia === 'hoy' ? 'selected' : ''}>Hoy</option>
          <option value="urgencia_maxima" ${urgencia === 'urgencia_maxima' ? 'selected' : ''}>Urgencia máxima</option>
        </select>
      </div>

      <div class="pm-form-section">
        <label class="pm-form-label" for="motivo">
          Motivo <span class="pm-required">*</span>
        </label>
        <textarea
          id="motivo"
          class="pm-form-textarea"
          placeholder="Describe el motivo..."
          maxlength="${MAX_MOTIVO_CHARS}"
          aria-required="true"
        >${escHTML(motivo)}</textarea>
        <div class="pm-char-counter">
          <span id="char-count">${charCount}</span>/${MAX_MOTIVO_CHARS}
        </div>
      </div>

      <div class="pm-form-section">
        <label class="pm-form-label" for="archivo-soporte">
          Documento soporte (PDF, JPG, PNG - máx 5MB)
        </label>
        <input
          type="file"
          id="archivo-soporte"
          accept=".pdf,.jpg,.png"
          aria-describedby="upload-error-msg"
        />
        <div id="upload-progress" role="status" aria-live="polite" style="display:none;">
          <div class="pm-spinner" role="status" aria-label="Subiendo documento"></div>
          <p>Subiendo documento...</p>
        </div>
        <div id="upload-success" style="display:none;">
          <p class="pm-helper-text success">&#10003; Documento subido</p>
        </div>
        <div id="upload-error" role="alert" style="display:none;">
          <p class="pm-helper-text danger" id="upload-error-msg"></p>
        </div>
      </div>

      <div class="pm-form-section">
        <label>
          <input
            type="checkbox"
            id="notificar-director"
            ${notificarDirector ? 'checked' : ''}
          />
          Notificar al director automáticamente
        </label>
      </div>

      <div id="step4-errors" class="pm-validation-errors" role="alert" aria-live="polite"></div>

      <div class="pm-step-actions">
        <button type="button" class="pm-btn pm-btn-secondary" id="btn-atras-step4">
          Atrás
        </button>
        <button type="button" class="pm-btn pm-btn-primary" id="btn-siguiente-step4">
          Siguiente
        </button>
      </div>
    `;
  }

  /**
   * Attach events for Step 4.
   * @private
   */
  _attachStep4Events() {
    document.getElementById('btn-atras-step4')?.addEventListener('click', () => {
      this.currentStep = 3;
      this._rerenderModal();
    });

    document.getElementById('btn-siguiente-step4')?.addEventListener('click', () => {
      this.handleStepSubmit();
    });

    document.getElementById('tipo-ausencia')?.addEventListener('change', (e) => {
      this.state.tipoAusencia = e.target.value;
    });

    document.getElementById('urgencia')?.addEventListener('change', (e) => {
      this.state.urgencia = e.target.value;
    });

    const motivoEl = document.getElementById('motivo');
    motivoEl?.addEventListener('input', (e) => {
      this.state.motivo = e.target.value;
      const counter = document.getElementById('char-count');
      if (counter) counter.textContent = String(e.target.value.length);
    });

    const archivoEl = document.getElementById('archivo-soporte');
    archivoEl?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const validation = this.validateFileForUpload(file);
      if (!validation.valid) {
        this._showUploadError(validation.error);
        e.target.value = '';
        return;
      }
      this.state.archivo.file = file;
      this.onUploadFile(file);
    });

    document.getElementById('notificar-director')?.addEventListener('change', (e) => {
      this.state.notificarDirector = e.target.checked;
    });
  }

  // ── Step 5: Document Preview + WhatsApp ───────────────────────────────────

  /**
   * Render Step 5 HTML — document preview + copy/WhatsApp actions.
   * @returns {string}
   */
  renderStep5() {
    this.generateDocument();
    const whatsappLink = this.getWhatsAppLink();
    const whatsappDisabled = !whatsappLink;
    const whatsappTooltip = whatsappDisabled ? 'Teléfono director no configurado' : '';

    const previewText = escHTML(this.state.whatsappText || '');

    return `
      <div class="pm-form-section">
        <h3 class="pm-form-label">Vista previa del documento</h3>
        <div class="pm-preview-box" role="region" aria-label="Vista previa del documento">
          <pre>${previewText}</pre>
        </div>
      </div>

      <div class="pm-form-section pm-step-actions--row">
        <button
          type="button"
          class="pm-btn pm-btn-secondary"
          id="btn-copy-doc"
          aria-label="Copiar documento al portapapeles"
        >
          Copiar documento
        </button>
        <button
          type="button"
          class="pm-btn btn-whatsapp"
          id="btn-whatsapp"
          ${whatsappDisabled ? `disabled title="${escHTML(whatsappTooltip)}"` : `data-href="${escHTML(whatsappLink)}"`}
          aria-label="Enviar por WhatsApp al director"
          ${whatsappDisabled ? 'aria-disabled="true"' : ''}
        >
          Enviar por WhatsApp
        </button>
      </div>

      <div id="step5-errors" class="pm-validation-errors" role="alert" aria-live="polite"></div>

      <div class="pm-step-actions">
        <button type="button" class="pm-btn pm-btn-secondary" id="btn-atras-step5">
          Atrás
        </button>
        <button
          type="button"
          class="pm-btn pm-btn-primary"
          id="btn-enviar-solicitud"
          ${this.state.submitting ? 'disabled' : ''}
        >
          Enviar solicitud
        </button>
      </div>
    `;
  }

  /**
   * Attach events for Step 5.
   * @private
   */
  _attachStep5Events() {
    document.getElementById('btn-atras-step5')?.addEventListener('click', () => {
      this.currentStep = 4;
      this._rerenderModal();
    });

    document.getElementById('btn-enviar-solicitud')?.addEventListener('click', () => {
      this.handleStepSubmit();
    });

    document.getElementById('btn-copy-doc')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(this.state.whatsappText ?? '');
        AppToast.success('Documento copiado al portapapeles.');
      } catch {
        AppToast.error('No se pudo copiar. Selecciona el texto manualmente.');
      }
    });

    const waBtn = document.getElementById('btn-whatsapp');
    if (waBtn && !waBtn.disabled) {
      waBtn.addEventListener('click', () => {
        const href = waBtn.dataset.href;
        if (href) window.open(href, '_blank', 'noopener,noreferrer');
      });
    }
  }

  // ── Service Integration ────────────────────────────────────────────────────

  /**
   * Build document preview and WhatsApp text from current state.
   * Stores result in state.whatsappText.
   */
  generateDocument() {
    const maestroNombre = this.maestro?.nombre ?? 'Docente';
    const { fechaInicio } = this._getDateRange();
    const fecha = this.state.fechaAusencia || fechaInicio || '';
    const motivo = this.state.motivo || '';
    const archivoUrl = this.state.archivo?.uploadedUrl ?? 'No adjuntado';
    const notificacion = this.state.notificarDirector ? 'SI' : 'NO';

    const clasesLines = (this.state.clasesAfectadas ?? []).map((c) => {
      const solucion =
        c.recoveryPlan?.tipo === 'tareas'
          ? `Tareas: ${c.recoveryPlan.actividadReemplazo ?? ''}`
          : c.recoveryPlan?.tipo === 'reprogramar'
          ? `Reprogramar: ${c.recoveryPlan.fechaReprograma ?? ''} ${c.recoveryPlan.horaReprograma ?? ''}`
          : 'Sin plan';
      return `- ${c.className} (${c.sessionDate} a las ${c.sessionTime}): ${solucion}`;
    });

    const doc = [
      `Saludos cordiales, soy la profesora "${maestroNombre}",`,
      `el día ${fecha} estaré faltando a la clase de ese día,`,
      `ya que tengo ${motivo} y debo solicitar esta ausencia.`,
      '',
      'Clases afectadas:',
      ...clasesLines,
      '',
      `Documento soporte: ${archivoUrl}`,
      `Notificación director: ${notificacion}`,
    ].join('\n');

    this.state.whatsappText = truncateWhatsAppText(doc);
  }

  /**
   * Validate a file before upload (client-side).
   * @param {File} file
   * @returns {{ valid: boolean, error?: string }}
   */
  validateFileForUpload(file) {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'El archivo supera el tamaño máximo de 5MB.' };
    }
    if (!ALLOWED_FILE_MIME.has(file.type)) {
      return { valid: false, error: 'Tipo de archivo no permitido. Usa PDF, JPG o PNG.' };
    }
    return { valid: true };
  }

  /**
   * Upload file with progress state management.
   * @param {File} file
   * @returns {Promise<void>}
   */
  async onUploadFile(file) {
    this.state.loadingStates.upload = true;
    this._showUploadProgress(true);

    try {
      const result = await this._performUpload(file);
      this.state.archivo.uploadedUrl = result.url;
      this._showUploadSuccess();
    } catch (err) {
      const msg =
        err?.name === 'FileTooLargeError' || err?.name === 'InvalidMimeError'
          ? err.message
          : 'Tiempo de conexión agotado. Intenta de nuevo.';
      this._showUploadError(msg);
    } finally {
      this.state.loadingStates.upload = false;
      this._showUploadProgress(false);
    }
  }

  /**
   * Delegate to fileUploadService.
   * @param {File} file
   * @returns {Promise<{ url: string }>}
   * @private
   */
  async _performUpload(file) {
    return fileUploadService.uploadAbsenceDoc(file, this.maestro?.id ?? '');
  }

  /**
   * Toggle upload progress spinner visibility.
   * @param {boolean} show
   * @private
   */
  _showUploadProgress(show) {
    const el = document.getElementById('upload-progress');
    if (el) el.style.display = show ? '' : 'none';
    const archivoEl = document.getElementById('archivo-soporte');
    if (archivoEl) archivoEl.disabled = show;
  }

  /**
   * Show upload success state.
   * @private
   */
  _showUploadSuccess() {
    const success = document.getElementById('upload-success');
    if (success) success.style.display = '';
    const error = document.getElementById('upload-error');
    if (error) error.style.display = 'none';
  }

  /**
   * Show upload error message.
   * @param {string} msg
   * @private
   */
  _showUploadError(msg) {
    const errorEl = document.getElementById('upload-error');
    const msgEl = document.getElementById('upload-error-msg');
    if (errorEl) errorEl.style.display = '';
    if (msgEl) msgEl.textContent = msg;
    const success = document.getElementById('upload-success');
    if (success) success.style.display = 'none';
  }

  /**
   * Submit the form to the database.
   * @returns {Promise<void>}
   */
  async submitForm() {
    this.state.submitting = true;

    try {
      const result = await ausenciaService.createAbsenceRequest(this.maestro.id, this.state);
      AppToast.success('Solicitud enviada. El director la revisará pronto.');
      document.dispatchEvent(
        new CustomEvent('absence-submitted', { detail: { absenceId: result.absenceId } })
      );
      this.close();
    } catch {
      AppToast.error('Error al guardar. Intenta de nuevo.');
    } finally {
      this.state.submitting = false;
    }
  }

  /**
   * Build a WhatsApp deep-link URL using the director's phone.
   * Returns null if no valid phone is configured.
   * @returns {string|null}
   */
  getWhatsAppLink() {
    const phone = this.directorPhone;
    if (!phone || !/^\d+$/.test(phone)) return null;
    return prepareWhatsAppLink(phone, this.state.whatsappText ?? '');
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
