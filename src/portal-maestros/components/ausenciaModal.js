import { AppModal } from '../../shared/components/AppModal.js';
import { AppToast } from '../../shared/components/AppToast.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { enableTrap } from '../utils/focusTrap.js';
import { escHTML } from '../utils/portalUtils.js';
import {
  createAbsenceRequest,
  findAffectedClasses,
  findAvailableSalons,
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
    this.state = this._defaultState();
  }

  _defaultState() {
    return {
      fechaInicio: '',
      fechaFin: '',
      tipoAusencia: 'personal',
      urgencia: 'media',
      motivo: '',
      notifyDirector: true,
      clasesAfectadas: [],
      coverageType: 'activities', // 'activities' | 'reschedule'
      claseEmergente: {
        fecha: '',
        hora: '',
        salonIdNuevo: null,
      },
      archivo: { file: null, uploadedUrl: null },
      availableSalons: [],
      submitted: false,
      whatsappText: '',
    };
  }

  _renderForm() {
    const today = new Date().toISOString().split('T')[0];
    return `
      <form class="pm-ausencia-form" id="ausencia-form" novalidate>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Fechas de ausencia</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <label class="pm-form-label">
              Desde <span class="pm-required">*</span>
              <input type="date" id="fecha-inicio" value="${escHTML(this.state.fechaInicio)}" min="${today}">
            </label>
            <label class="pm-form-label">
              Hasta <span class="pm-required">*</span>
              <input type="date" id="fecha-fin" value="${escHTML(this.state.fechaFin)}" min="${today}">
            </label>
          </div>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Clases afectadas</h3>
          <div id="clases-afectadas-container">
            <p style="color:var(--pm-text-muted);">Seleccioná las fechas para cargar las clases.</p>
          </div>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Opciones de cobertura</h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
              <input type="radio" name="coverage-type" id="coverage-activities" value="activities"
                ${this.state.coverageType === 'activities' ? 'checked' : ''}>
              <span>Asignar actividades/tareas</span>
            </label>
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
              <input type="radio" name="coverage-type" id="coverage-reschedule" value="reschedule"
                ${this.state.coverageType === 'reschedule' ? 'checked' : ''}>
              <span>Reprogramar clase emergente</span>
            </label>
          </div>

          <div id="reschedule-panel" style="${this.state.coverageType === 'reschedule' ? '' : 'display:none;'}margin-top:1rem;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <label class="pm-form-label">
                Fecha emergente
                <input type="date" id="emergente-fecha" value="${escHTML(this.state.claseEmergente.fecha)}" min="${today}">
              </label>
              <label class="pm-form-label">
                Hora emergente
                <input type="time" id="emergente-hora" value="${escHTML(this.state.claseEmergente.hora)}">
              </label>
            </div>
            <div id="salones-container"></div>
          </div>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Motivo</h3>
          <textarea id="motivo" maxlength="500" placeholder="Explicá brevemente el motivo de la ausencia"
            style="width:100%;min-height:80px;padding:0.5rem;border:1px solid var(--pm-border);border-radius:8px;font-family:inherit;"
          >${escHTML(this.state.motivo)}</textarea>
          <small style="color:var(--pm-text-muted);"><span id="motivo-count">${this.state.motivo.length}</span>/500</small>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Tipo de ausencia</h3>
          <select id="tipo-ausencia">
            ${TIPO_AUSENCIA.map(t => `<option value="${t.value}" ${t.value === this.state.tipoAusencia ? 'selected' : ''}>${escHTML(t.label)}</option>`).join('')}
          </select>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Urgencia</h3>
          <select id="urgencia">
            ${URGENCIA_OPTS.map(u => `<option value="${u.value}" ${u.value === this.state.urgencia ? 'selected' : ''}>${escHTML(u.label)}</option>`).join('')}
          </select>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Documento soporte</h3>
          <input type="file" id="archivo-soporte" accept=".pdf,.jpg,.jpeg,.png">
          <small style="color:var(--pm-text-muted);">PDF, JPG o PNG. Máximo 5MB.</small>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Mensaje WhatsApp</h3>
          <p style="color:var(--pm-text-muted);font-size:0.9rem;">Se generará automáticamente al enviar la solicitud.</p>
          <div id="whatsapp-preview" style="display:none;"></div>
        </section>

        <section class="pm-form-section">
          <h3 class="pm-form-label">Notificación al director</h3>
          <label style="display:flex;align-items:center;gap:0.75rem;cursor:pointer;">
            <input type="checkbox" id="notify-director" ${this.state.notifyDirector ? 'checked' : ''}>
            <span>Notificar al director automáticamente</span>
          </label>
        </section>

        <div id="ausencia-errors" role="alert" style="color:var(--pm-danger);margin-top:1rem;"></div>
      </form>
    `;
  }

  _renderSuccess(whatsappText) {
    return `
      <div style="text-align:center;padding:1rem;">
        <p style="font-size:1.25rem;font-weight:600;color:var(--pm-success);">Solicitud enviada</p>
        <p style="color:var(--pm-text-muted);">Tu solicitud de ausencia fue enviada correctamente.</p>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;justify-content:center;">
          <button type="button" id="copy-whatsapp"
            style="padding:0.75rem 1.25rem;background:var(--pm-primary);color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;">
            📋 Copiar mensaje
          </button>
          <button type="button" id="open-whatsapp-btn"
            style="padding:0.75rem 1.25rem;background:#25D366;color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;">
            💬 Enviar por WhatsApp
          </button>
        </div>
      </div>
    `;
  }

  open() {
    this._focusTrap?.dispose?.();
    this._focusTrap = null;
    this.maestro = getMaestroLocal();

    if (!this.maestro) {
      AppToast.error('Iniciá sesión para solicitar ausencias');
      return;
    }

    this.state = this._defaultState();

    AppModal.open({
      title: 'Nueva Solicitud de Ausencia',
      size: 'lg',
      body: this._renderForm(),
      saveText: 'Enviar solicitud',
      onSave: () => this._handleSubmit(),
      onShow: () => this._attachEvents(),
    });
  }

  _attachEvents() {
    const dialog = document.querySelector('.app-modal-dialog');
    if (dialog) this._focusTrap = enableTrap(dialog, { onClose: () => AppModal.close() });

    // Date range → load affected classes
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');

    const onDateChange = () => {
      if (fechaInicio) this.state.fechaInicio = fechaInicio.value;
      if (fechaFin) this.state.fechaFin = fechaFin.value;
      if (this.state.fechaInicio && this.state.fechaFin) {
        this._loadAffectedClasses();
      }
    };

    fechaInicio?.addEventListener('change', onDateChange);
    fechaFin?.addEventListener('change', onDateChange);

    // Coverage type toggle
    document.querySelectorAll('input[name="coverage-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.coverageType = e.target.value;
        const panel = document.getElementById('reschedule-panel');
        if (panel) panel.style.display = e.target.value === 'reschedule' ? '' : 'none';
      });
    });

    // Reschedule date/time → load salons
    const onRescheduleChange = () => {
      const fecha = document.getElementById('emergente-fecha')?.value;
      const hora = document.getElementById('emergente-hora')?.value;
      if (fecha) this.state.claseEmergente.fecha = fecha;
      if (hora) this.state.claseEmergente.hora = hora;
      if (this.state.claseEmergente.fecha && this.state.claseEmergente.hora) {
        this._loadAvailableSalons();
      }
    };

    document.getElementById('emergente-fecha')?.addEventListener('change', onRescheduleChange);
    document.getElementById('emergente-hora')?.addEventListener('change', onRescheduleChange);

    // Motivo
    document.getElementById('motivo')?.addEventListener('input', (e) => {
      this.state.motivo = e.target.value;
      const count = document.getElementById('motivo-count');
      if (count) count.textContent = String(e.target.value.length);
    });

    // Tipo / urgencia
    document.getElementById('tipo-ausencia')?.addEventListener('change', (e) => {
      this.state.tipoAusencia = e.target.value;
    });
    document.getElementById('urgencia')?.addEventListener('change', (e) => {
      this.state.urgencia = e.target.value;
    });

    // Notify director
    document.getElementById('notify-director')?.addEventListener('change', (e) => {
      this.state.notifyDirector = e.target.checked;
    });

    // File
    document.getElementById('archivo-soporte')?.addEventListener('change', (e) => {
      this.state.archivo.file = e.target.files?.[0] || null;
    });
  }

  async _loadAffectedClasses() {
    const container = document.getElementById('clases-afectadas-container');
    if (!container) return;

    container.innerHTML = '<p style="color:var(--pm-text-muted);">Cargando clases...</p>';

    try {
      const classes = await findAffectedClasses(
        this.maestro.id,
        this.state.fechaInicio,
        this.state.fechaFin,
      );

      this.state.clasesAfectadas = classes.map(c => ({ ...c, actividadReemplazo: c.actividadReemplazo || '' }));

      if (classes.length === 0) {
        container.innerHTML = '<p style="color:var(--pm-text-muted);">No hay clases en el período seleccionado.</p>';
        return;
      }

      container.innerHTML = classes.map((clase) => `
        <div class="pm-step-card" style="margin-bottom:0.75rem;padding:0.75rem;border:1px solid var(--pm-border);border-radius:8px;">
          <h4 style="margin:0 0 0.25rem;">${escHTML(clase.className || clase.nombre || 'Clase')}</h4>
          <p style="margin:0;color:var(--pm-text-muted);font-size:0.85rem;">${escHTML(clase.sessionDate || clase.fecha || '')} ${escHTML(clase.sessionTime || clase.hora || '')}</p>
          <textarea data-activity-class-id="${escHTML(clase.claseId || clase.id || '')}"
            placeholder="Actividad de reemplazo..."
            style="margin-top:0.5rem;width:100%;min-height:50px;padding:0.4rem;border:1px solid var(--pm-border);border-radius:6px;font-family:inherit;"
          >${escHTML(clase.actividadReemplazo || '')}</textarea>
        </div>
      `).join('');

      // Bind activity inputs
      container.querySelectorAll('[data-activity-class-id]').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
          const claseId = e.target.dataset.activityClassId;
          const idx = this.state.clasesAfectadas.findIndex(c => (c.claseId || c.id) === claseId);
          if (idx !== -1) this.state.clasesAfectadas[idx].actividadReemplazo = e.target.value;
        });
      });
    } catch (error) {
      console.warn('[AusenciaModal] Error loading affected classes:', error);
      container.innerHTML = '<p style="color:var(--pm-danger);">Error al cargar las clases.</p>';
    }
  }

  async _loadAvailableSalons() {
    const container = document.getElementById('salones-container');
    if (!container) return;

    container.innerHTML = '<p style="color:var(--pm-text-muted);">Cargando salones...</p>';

    try {
      const salons = await findAvailableSalons(
        this.state.claseEmergente.fecha,
        this.state.claseEmergente.hora,
      );

      this.state.availableSalons = salons;

      if (salons.length === 0) {
        container.innerHTML = '<p style="color:var(--pm-text-muted);">No hay salones disponibles.</p>';
        return;
      }

      container.innerHTML = `
        <div style="margin-top:0.75rem;">
          <h4 style="margin:0 0 0.5rem;font-size:0.9rem;">Salón disponible:</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${salons.map(salon => `
              <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                <input type="radio" name="salon-emergente" value="${escHTML(salon.id)}"
                  ${this.state.claseEmergente.salonIdNuevo === salon.id ? 'checked' : ''}>
                <span>${escHTML(salon.nombre)} (cap. ${escHTML(String(salon.capacidad))})</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;

      // Bind salon selection
      container.querySelectorAll('[name="salon-emergente"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.state.claseEmergente.salonIdNuevo = e.target.value;
        });
        radio.addEventListener('click', (e) => {
          this.state.claseEmergente.salonIdNuevo = e.target.value;
        });
      });
    } catch (error) {
      console.warn('[AusenciaModal] Error loading salons:', error);
      container.innerHTML = '<p style="color:var(--pm-danger);">Error al cargar los salones.</p>';
    }
  }

  _validate() {
    const errors = [];
    if (!this.state.fechaInicio) errors.push('Seleccioná la fecha de inicio');
    if (!this.state.fechaFin) errors.push('Seleccioná la fecha de fin');
    if (this.state.fechaInicio && this.state.fechaFin && this.state.fechaInicio > this.state.fechaFin) {
      errors.push('La fecha final debe ser después de la fecha inicial');
    }
    if (!this.state.motivo || this.state.motivo.trim().length === 0) {
      errors.push('Explicá el motivo de la ausencia');
    }
    return errors;
  }

  async _handleSubmit() {
    // Sync DOM values into state before validation (handles programmatic .value sets without events)
    const fechaInicioEl = document.getElementById('fecha-inicio');
    const fechaFinEl = document.getElementById('fecha-fin');
    const motivoEl = document.getElementById('motivo');
    if (fechaInicioEl) this.state.fechaInicio = fechaInicioEl.value;
    if (fechaFinEl) this.state.fechaFin = fechaFinEl.value;
    if (motivoEl) this.state.motivo = motivoEl.value;

    const errors = this._validate();

    if (errors.length > 0) {
      const errDiv = document.getElementById('ausencia-errors');
      if (errDiv) errDiv.textContent = errors.join('; ');
      return false;
    }

    try {
      const result = await createAbsenceRequest({
        maestro: this.maestro,
        fechaInicio: this.state.fechaInicio,
        fechaFin: this.state.fechaFin,
        tipoAusencia: this.state.tipoAusencia,
        urgencia: this.state.urgencia,
        motivo: this.state.motivo,
        notifyDirector: this.state.notifyDirector,
        clasesAfectadas: this.state.clasesAfectadas,
        coverageType: this.state.coverageType,
        claseEmergente: this.state.claseEmergente,
      });

      const whatsappText = result?.whatsappText || '';
      this.state.whatsappText = whatsappText;
      this.state.submitted = true;

      // Replace modal body with success view (no AppModal.updateBody — inject directly)
      const body = document.querySelector('.app-modal-body');
      if (body) {
        body.innerHTML = this._renderSuccess(whatsappText);
        this._attachSuccessEvents(body, whatsappText);
      }

      AppModal.resetSaveBtn('Cerrar');
    } catch (error) {
      console.error('[AusenciaModal] Error submitting form:', error);
      AppToast.error('Error al enviar la solicitud');
    }

    return false;
  }

  _attachSuccessEvents(container, whatsappText) {
    container.querySelector('#copy-whatsapp')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(whatsappText);
        AppToast.success('Mensaje copiado');
      } catch {
        AppToast.error('No se pudo copiar el mensaje');
      }
    });

    container.querySelector('#open-whatsapp-btn')?.addEventListener('click', () => {
      const encoded = encodeURIComponent(whatsappText);
      window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
    });
  }
}

export const ausenciaModal = new AusenciaModal();
