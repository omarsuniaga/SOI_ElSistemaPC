import { AppModal } from '../../shared/components/AppModal.js';
import { AppToast } from '../../shared/components/AppToast.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { enableTrap } from '../utils/focusTrap.js';
import { escHTML } from '../utils/portalUtils.js';
import {
  createAbsenceRequest,
  findAffectedClasses,
  findAvailableSalons,
  findSubstituteTeachers,
} from '../services/ausenciaService.js';

const TIPO_AUSENCIA = [
  { value: 'enfermedad', label: 'Médica' },
  { value: 'personal', label: 'Personal' },
  { value: 'capacitacion', label: 'Curso' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'otro', label: 'Otro' },
];

const URGENCIA_OPTS = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
];

class AusenciaModal {
  constructor() {
    this.maestro = null;
    this._focusTrap = null;
    this.currentStep = 1;
    this.state = this.defaultState();
  }

  defaultState() {
    return {
      // Step 1: Duration
      duracionTipo: 'un_dia',
      fechaAusencia: '',
      fechaInicio: '',
      fechaFin: '',

      // Step 2-3: Classes & Recovery
      clasesAfectadas: [],

      // Step 4: Admin data
      tipoAusencia: 'personal',
      urgencia: 'media',
      motivo: '',
      archivo: { file: null, uploadedUrl: null },

      // Step 5: Document
      notifyDirector: true,

      // UI state
      loadingStates: { clases: false, salones: false, maestros: false },
      validationErrors: {},
    };
  }

  open() {
    this._focusTrap?.dispose?.();
    this._focusTrap = null;
    this.maestro = getMaestroLocal();

    if (!this.maestro) {
      AppToast.error('Iniciá sesión para solicitar ausencias');
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

  getTitle() {
    return `Solicitar Ausencia (Paso ${this.currentStep}/5)`;
  }

  getSaveButtonText() {
    if (this.currentStep === 5) return 'Enviar solicitud';
    if (this.currentStep < 5) return 'Siguiente';
    return 'Enviar';
  }

  renderCurrentStep() {
    switch (this.currentStep) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      case 4: return this.renderStep4();
      case 5: return this.renderStep5();
      default: return '<p>Error en el formulario</p>';
    }
  }

  // STEP 1: Duration Selection
  renderStep1() {
    return `
      <form class="pm-ausencia-form" id="step1-form" novalidate>
        <section class="pm-form-section">
          <h3 class="pm-form-label">Duración de la Ausencia</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
              <input type="radio" name="duracion" value="un_dia"
                ${this.state.duracionTipo === 'un_dia' ? 'checked' : ''}
                style="width: 18px; height: 18px;">
              <span>Un solo día</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
              <input type="radio" name="duracion" value="varios_dias"
                ${this.state.duracionTipo === 'varios_dias' ? 'checked' : ''}
                style="width: 18px; height: 18px;">
              <span>Varios días (rango)</span>
            </label>
          </div>
        </section>

        <section class="pm-form-section" id="fecha-container" style="margin-top: 1rem;">
          ${this.state.duracionTipo === 'un_dia' ? `
            <label class="pm-form-label">
              Seleccioná el día de ausencia
              <span class="pm-required">*</span>
              <input type="date" id="fecha-unica" value="${this.state.fechaAusencia}"
                min="${new Date().toISOString().split('T')[0]}">
            </label>
          ` : `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <label class="pm-form-label">
                Desde
                <span class="pm-required">*</span>
                <input type="date" id="fecha-inicio" value="${this.state.fechaInicio}"
                  min="${new Date().toISOString().split('T')[0]}">
              </label>
              <label class="pm-form-label">
                Hasta
                <span class="pm-required">*</span>
                <input type="date" id="fecha-fin" value="${this.state.fechaFin}"
                  min="${new Date().toISOString().split('T')[0]}">
              </label>
            </div>
          `}
        </section>

        <div id="step1-errors" role="alert" style="color: var(--pm-danger); margin-top: 1rem;"></div>
      </form>
    `;
  }

  // STEP 2: Affected Classes
  async renderStep2() {
    const containerId = 'clases-afectadas-container';
    let html = `
      <form class="pm-ausencia-form" id="step2-form" novalidate>
        <section class="pm-form-section">
          <h3 class="pm-form-label">Clases Afectadas</h3>
          <p style="color: var(--pm-text-muted); font-size: 0.9rem;">
            Se cargarán automáticamente las clases en el período seleccionado
          </p>
        </section>
        <div id="${containerId}" style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="color: var(--pm-text-muted);">Cargando clases...</p>
        </div>
        <div id="step2-errors" role="alert" style="color: var(--pm-danger); margin-top: 1rem;"></div>
      </form>
    `;

    // Load affected classes
    setTimeout(() => this.loadAffectedClassesStep2(), 0);
    return html;
  }

  async loadAffectedClassesStep2() {
    const container = document.getElementById('clases-afectadas-container');
    if (!container) return;

    try {
      const startDate = this.state.duracionTipo === 'un_dia' ? this.state.fechaAusencia : this.state.fechaInicio;
      const endDate = this.state.duracionTipo === 'un_dia' ? this.state.fechaAusencia : this.state.fechaFin;

      const classes = await findAffectedClasses(this.maestro.id, startDate, endDate);
      this.state.clasesAfectadas = classes.map(c => ({
        ...c,
        planRecuperacion: { tipo: null, detalles: '' }
      }));

      if (classes.length === 0) {
        container.innerHTML = '<p style="color: var(--pm-text-muted);">No hay clases en el período seleccionado.</p>';
        return;
      }

      container.innerHTML = classes.map((clase, idx) => `
        <div class="pm-step-card">
          <h4 class="pm-step-card-title">${escHTML(clase.nombre || 'Clase')}</h4>
          <p class="pm-step-card-subtitle">${escHTML(clase.fecha || '')} - ${escHTML(clase.hora || '')}</p>
        </div>
      `).join('');
    } catch (error) {
      console.warn('[AusenciaModal] Error loading affected classes:', error);
      container.innerHTML = '<p style="color: var(--pm-danger);">Error al cargar las clases.</p>';
    }
  }

  // STEP 3: Recovery Plan
  renderStep3() {
    if (this.state.clasesAfectadas.length === 0) {
      return `
        <form class="pm-ausencia-form">
          <p style="color: var(--pm-text-muted);">No hay clases para planificar recuperación.</p>
        </form>
      `;
    }

    return `
      <form class="pm-ausencia-form" id="step3-form" novalidate>
        <section class="pm-form-section">
          <h3 class="pm-form-label">Plan de Recuperación</h3>
          <p style="color: var(--pm-text-muted); font-size: 0.9rem;">
            Para cada clase, indicá cómo se cubrirá la ausencia
          </p>
        </section>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${this.state.clasesAfectadas.map((clase, idx) => `
            <div class="pm-panel-recuperar">
              <h4 style="margin-top: 0;">${escHTML(clase.nombre || 'Clase')}</h4>
              <p style="margin: 0.25rem 0; color: var(--pm-text-muted); font-size: 0.85rem;">
                ${escHTML(clase.fecha || '')} - ${escHTML(clase.hora || '')}
              </p>

              <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="radio" name="plan-${idx}" value="tareas"
                    ${!clase.planRecuperacion?.tipo ? 'checked' : ''} required>
                  <span style="font-size: 0.9rem;">Asignar tareas/actividades</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="radio" name="plan-${idx}" value="reprogramar" required>
                  <span style="font-size: 0.9rem;">Reprogramar para otro día</span>
                </label>
              </div>

              <textarea id="plan-detalles-${idx}" placeholder="Detallá la actividad o plan de recuperación..."
                maxlength="300" style="margin-top: 0.75rem; width: 100%; min-height: 60px;
                padding: 0.5rem; border: 1px solid var(--pm-border); border-radius: 8px;
                font-family: inherit; font-size: inherit;">
                ${escHTML(clase.planRecuperacion?.detalles || '')}
              </textarea>
            </div>
          `).join('')}
        </div>

        <div id="step3-errors" role="alert" style="color: var(--pm-danger); margin-top: 1rem;"></div>
      </form>
    `;
  }

  // STEP 4: Administrative Data
  renderStep4() {
    const today = new Date().toISOString().split('T')[0];
    return `
      <form class="pm-ausencia-form" id="step4-form" novalidate>
        <section class="pm-form-section">
          <label class="pm-form-label">
            Tipo de Ausencia
            <span class="pm-required">*</span>
            <select id="tipo-ausencia" value="${this.state.tipoAusencia}" required>
              ${TIPO_AUSENCIA.map(t => `<option value="${t.value}" ${t.value === this.state.tipoAusencia ? 'selected' : ''}>${t.label}</option>`).join('')}
            </select>
          </label>
        </section>

        <section class="pm-form-section">
          <label class="pm-form-label">
            Urgencia
            <span class="pm-required">*</span>
            <select id="urgencia" value="${this.state.urgencia}" required>
              ${URGENCIA_OPTS.map(u => `<option value="${u.value}" ${u.value === this.state.urgencia ? 'selected' : ''}>${u.label}</option>`).join('')}
            </select>
          </label>
        </section>

        <section class="pm-form-section">
          <label class="pm-form-label">
            Motivo
            <span class="pm-required">*</span>
            <textarea id="motivo" maxlength="500" required
              placeholder="Explicá brevemente el motivo de la ausencia"
              style="min-height: 100px;">
              ${escHTML(this.state.motivo)}
            </textarea>
            <small style="color: var(--pm-text-muted);">
              <span id="motivo-count">${this.state.motivo.length}</span>/500
            </small>
          </label>
        </section>

        <section class="pm-form-section">
          <label class="pm-form-label">
            Documento de soporte
            <input type="file" id="archivo-soporte" accept=".pdf,.jpg,.jpeg,.png">
            <small style="color: var(--pm-text-muted);">PDF, JPG o PNG. Máximo 5MB.</small>
            ${this.state.archivo.file ? `<p style="margin-top: 0.5rem; color: var(--pm-success);">✓ ${escHTML(this.state.archivo.file.name)}</p>` : ''}
          </label>
        </section>

        <section class="pm-form-section">
          <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
            <input type="checkbox" id="notify-director" ${this.state.notifyDirector ? 'checked' : ''}>
            <span>Notificar director automáticamente</span>
          </label>
        </section>

        <div id="step4-errors" role="alert" style="color: var(--pm-danger); margin-top: 1rem;"></div>
      </form>
    `;
  }

  // STEP 5: Document Preview
  renderStep5() {
    const doc = this.generateDocument();
    return `
      <form class="pm-ausencia-form" id="step5-form" novalidate>
        <section class="pm-form-section">
          <h3 class="pm-form-label">Documento de Solicitud</h3>
          <p style="color: var(--pm-text-muted); font-size: 0.9rem;">
            Revisá el documento y confirm el envío. Podrás copiar al portapapeles o enviarlo vía WhatsApp.
          </p>
        </section>

        <div class="pm-preview-box" style="background: var(--pm-surface-2); padding: 1.5rem;
          border-radius: 12px; border: 1px solid var(--pm-border); white-space: pre-wrap;
          word-break: break-word; font-family: 'Courier New', monospace; font-size: 0.9rem;
          line-height: 1.6; max-height: 400px; overflow-y: auto;">
          ${escHTML(doc)}
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap;">
          <button type="button" id="copy-document"
            style="flex: 1; min-width: 120px; padding: 0.75rem 1rem;
            background: var(--pm-primary); color: white; border: none;
            border-radius: 10px; font-weight: 600; cursor: pointer;">
            📋 Copiar texto
          </button>
          <button type="button" id="open-whatsapp-btn"
            style="flex: 1; min-width: 120px; padding: 0.75rem 1rem;
            background: #25D366; color: white; border: none;
            border-radius: 10px; font-weight: 600; cursor: pointer;">
            💬 Enviar por WhatsApp
          </button>
        </div>

        <div id="step5-errors" role="alert" style="color: var(--pm-danger); margin-top: 1rem;"></div>
      </form>
    `;
  }

  generateDocument() {
    const maestroNombre = this.maestro?.nombre_completo || 'Profesor';
    const fechaInicio = this.state.duracionTipo === 'un_dia'
      ? this.state.fechaAusencia
      : this.state.fechaInicio;
    const fechaFin = this.state.duracionTipo === 'un_dia'
      ? this.state.fechaAusencia
      : this.state.fechaFin;

    const clasesText = this.state.clasesAfectadas.length > 0
      ? this.state.clasesAfectadas.map(c => c.nombre).join(', ')
      : '(Por especificar)';

    const planText = this.state.clasesAfectadas.map(c =>
      `- ${c.nombre}: ${c.planRecuperacion?.detalles || '(Plan a confirmar)'}`
    ).join('\n');

    return `Saludos cordiales,

Soy la profesora "${maestroNombre}". El día ${fechaInicio}${fechaInicio !== fechaFin ? ` hasta ${fechaFin}` : ''} estaré faltando a mis clases, ya que tengo ${this.state.motivo}.

Debo solicitar esta ausencia.

Clases afectadas: ${clasesText}

Plan de recuperación:
${planText}

Tipo: ${TIPO_AUSENCIA.find(t => t.value === this.state.tipoAusencia)?.label || this.state.tipoAusencia}
Urgencia: ${URGENCIA_OPTS.find(u => u.value === this.state.urgencia)?.label || this.state.urgencia}

Quedo atento a cualquier consulta.`;
  }

  attachStepEvents() {
    const dialog = document.querySelector('.app-modal-dialog');
    if (dialog) this._focusTrap = enableTrap(dialog, { onClose: () => AppModal.close() });

    // Step 1: Duration selection and date inputs
    if (this.currentStep === 1) {
      document.querySelectorAll('input[name="duracion"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.state.duracionTipo = e.target.value;
          // Update the form to show/hide relevant fields
          AppModal.updateBody(this.renderCurrentStep());
          setTimeout(() => this.attachStepEvents(), 0);
        });
      });

      // Bind date inputs to state
      const fechaUnica = document.getElementById('fecha-unica');
      const fechaInicio = document.getElementById('fecha-inicio');
      const fechaFin = document.getElementById('fecha-fin');

      if (fechaUnica) {
        fechaUnica.addEventListener('change', (e) => {
          this.state.fechaAusencia = e.target.value;
        });
      }
      if (fechaInicio) {
        fechaInicio.addEventListener('change', (e) => {
          this.state.fechaInicio = e.target.value;
        });
      }
      if (fechaFin) {
        fechaFin.addEventListener('change', (e) => {
          this.state.fechaFin = e.target.value;
        });
      }
    }

    // Step 4: File upload and text updates
    if (this.currentStep === 4) {
      document.getElementById('tipo-ausencia')?.addEventListener('change', (e) => {
        this.state.tipoAusencia = e.target.value;
      });
      document.getElementById('urgencia')?.addEventListener('change', (e) => {
        this.state.urgencia = e.target.value;
      });
      document.getElementById('motivo')?.addEventListener('input', (e) => {
        this.state.motivo = e.target.value;
        const count = document.getElementById('motivo-count');
        if (count) count.textContent = String(e.target.value.length);
      });
      document.getElementById('archivo-soporte')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        this.state.archivo.file = file || null;
      });
      document.getElementById('notify-director')?.addEventListener('change', (e) => {
        this.state.notifyDirector = e.target.checked;
      });
    }

    // Step 5: Copy and WhatsApp
    if (this.currentStep === 5) {
      document.getElementById('copy-document')?.addEventListener('click', async () => {
        const doc = this.generateDocument();
        try {
          await navigator.clipboard.writeText(doc);
          AppToast.success('Documento copiado al portapapeles');
        } catch (err) {
          AppToast.error('No se pudo copiar el documento');
        }
      });

      document.getElementById('open-whatsapp-btn')?.addEventListener('click', () => {
        const doc = this.generateDocument();
        const encoded = encodeURIComponent(doc);
        const waUrl = `https://wa.me/?text=${encoded}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      });
    }
  }

  validateStep1() {
    const errors = [];
    if (!this.state.duracionTipo) errors.push('Seleccioná una duración');
    if (this.state.duracionTipo === 'un_dia' && !this.state.fechaAusencia) {
      errors.push('Seleccioná la fecha de ausencia');
    }
    if (this.state.duracionTipo === 'varios_dias') {
      if (!this.state.fechaInicio) errors.push('Seleccioná la fecha inicial');
      if (!this.state.fechaFin) errors.push('Seleccioná la fecha final');
      if (this.state.fechaInicio && this.state.fechaFin && this.state.fechaInicio > this.state.fechaFin) {
        errors.push('La fecha final debe ser después de la fecha inicial');
      }
    }
    return errors;
  }

  validateStep4() {
    const errors = [];
    if (!this.state.tipoAusencia) errors.push('Seleccioná un tipo de ausencia');
    if (!this.state.urgencia) errors.push('Seleccioná un nivel de urgencia');
    if (!this.state.motivo || this.state.motivo.trim().length === 0) {
      errors.push('Explicá el motivo de la ausencia');
    }
    return errors;
  }

  async handleStepSubmit() {
    // Validate current step
    let errors = [];
    if (this.currentStep === 1) {
      errors = this.validateStep1();
      if (errors.length > 0) {
        const errDiv = document.getElementById('step1-errors');
        if (errDiv) errDiv.textContent = errors.join('; ');
        return false;
      }
      this.currentStep++;
    } else if (this.currentStep === 2) {
      this.currentStep++;
    } else if (this.currentStep === 3) {
      this.currentStep++;
    } else if (this.currentStep === 4) {
      errors = this.validateStep4();
      if (errors.length > 0) {
        const errDiv = document.getElementById('step4-errors');
        if (errDiv) errDiv.textContent = errors.join('; ');
        return false;
      }
      this.currentStep++;
    } else if (this.currentStep === 5) {
      // Submit the form
      await this.submitForm();
      return false;
    }

    // Re-render modal with next step
    AppModal.updateTitle(this.getTitle());
    AppModal.updateSaveText(this.getSaveButtonText());
    AppModal.updateBody(this.renderCurrentStep());
    setTimeout(() => this.attachStepEvents(), 0);
    return false;
  }

  async submitForm() {
    try {
      const startDate = this.state.duracionTipo === 'un_dia' ? this.state.fechaAusencia : this.state.fechaInicio;
      const endDate = this.state.duracionTipo === 'un_dia' ? this.state.fechaAusencia : this.state.fechaFin;

      const result = await createAbsenceRequest({
        maestro_id: this.maestro.id,
        fecha_inicio: startDate,
        fecha_fin: endDate,
        tipo: this.state.tipoAusencia,
        urgencia: this.state.urgencia,
        motivo: this.state.motivo,
        duracion_tipo: this.state.duracionTipo,
        notificar_director: this.state.notifyDirector,
        clases_afectadas: this.state.clasesAfectadas,
      });

      AppToast.success('Solicitud de ausencia enviada correctamente');
      AppModal.close();
    } catch (error) {
      console.error('[AusenciaModal] Error submitting form:', error);
      AppToast.error('Error al enviar la solicitud');
    }
  }
}

export const ausenciaModal = new AusenciaModal();
