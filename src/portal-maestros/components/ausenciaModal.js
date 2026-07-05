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
  { value: 'enfermedad',   label: 'Médica',       icon: 'bi-heart-pulse-fill',    color: '#ef4444' },
  { value: 'personal',     label: 'Personal',     icon: 'bi-person-fill',         color: '#3b82f6' },
  { value: 'capacitacion', label: 'Capacitación', icon: 'bi-mortarboard-fill',    color: '#8b5cf6' },
  { value: 'vacaciones',   label: 'Vacaciones',   icon: 'bi-sun-fill',            color: '#f59e0b' },
  { value: 'otro',         label: 'Otro',         icon: 'bi-three-dots',          color: '#6b7280' },
];

const URGENCIA_OPTS = [
  { value: 'baja',  label: 'Baja',  icon: 'bi-circle-fill',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  { value: 'media', label: 'Media', icon: 'bi-circle-fill',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { value: 'alta',  label: 'Alta',  icon: 'bi-circle-fill',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
];

class AusenciaModal {
  constructor() {
    this.maestro = null;
    this._focusTrap = null;
    this.state = this._defaultState();
  }

  _defaultState() {
    return {
      duracion: 'dia',        // 'dia' | 'rango'
      fechaInicio: '',
      fechaFin: '',
      tipoAusencia: 'personal',
      urgencia: 'media',
      motivo: '',
      notifyDirector: true,
      clasesAfectadas: [],
      coverageType: 'activities',
      claseEmergente: { fecha: '', hora: '', salonIdNuevo: null },
      archivo: { file: null, uploadedUrl: null },
      availableSalons: [],
      submitted: false,
      whatsappText: '',
    };
  }

  _renderForm() {
    const today = new Date().toISOString().split('T')[0];
    const isDia = this.state.duracion === 'dia';

    return `
      <form class="pm-ausencia-form" id="ausencia-form" novalidate>

        <!-- ── Tipo de ausencia ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-tag-fill"></i> Tipo de ausencia</p>
          <div class="am-tipo-grid">
            ${TIPO_AUSENCIA.map(t => `
              <button type="button" class="am-tipo-btn ${t.value === this.state.tipoAusencia ? 'selected' : ''}"
                data-tipo="${t.value}" style="--tipo-color:${t.color}">
                <i class="bi ${t.icon}" style="color:${t.color};font-size:1.4rem;"></i>
                <span>${t.label}</span>
              </button>`).join('')}
          </div>
          <input type="hidden" id="tipo-ausencia" value="${this.state.tipoAusencia}">
        </section>

        <!-- ── Duración ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-calendar3"></i> Duración</p>
          <div class="am-duracion-toggle">
            <button type="button" class="am-dur-btn ${isDia ? 'selected' : ''}" data-dur="dia">
              <i class="bi bi-calendar-day"></i> Un día
            </button>
            <button type="button" class="am-dur-btn ${!isDia ? 'selected' : ''}" data-dur="rango">
              <i class="bi bi-calendar-range"></i> Varios días
            </button>
          </div>

          <!-- Un solo día -->
          <div id="fecha-dia-panel" style="${isDia ? '' : 'display:none;'}margin-top:0.75rem;">
            <label class="am-input-label">
              <i class="bi bi-calendar-event"></i> Fecha de ausencia <span class="am-required">*</span>
            </label>
            <input type="date" id="fecha-unica" class="am-input" value="${escHTML(this.state.fechaInicio)}" min="${today}">
          </div>

          <!-- Rango de fechas -->
          <div id="fecha-rango-panel" style="${!isDia ? '' : 'display:none;'}margin-top:0.75rem;">
            <div class="am-date-grid">
              <div>
                <label class="am-input-label"><i class="bi bi-box-arrow-right"></i> Desde <span class="am-required">*</span></label>
                <input type="date" id="fecha-inicio" class="am-input" value="${escHTML(this.state.fechaInicio)}" min="${today}">
              </div>
              <div>
                <label class="am-input-label"><i class="bi bi-box-arrow-in-right"></i> Hasta <span class="am-required">*</span></label>
                <input type="date" id="fecha-fin" class="am-input" value="${escHTML(this.state.fechaFin)}" min="${today}">
              </div>
            </div>
          </div>
        </section>

        <!-- ── Urgencia ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-lightning-fill"></i> Urgencia</p>
          <div class="am-urgencia-row">
            ${URGENCIA_OPTS.map(u => `
              <button type="button" class="am-urg-btn ${u.value === this.state.urgencia ? 'selected' : ''}"
                data-urg="${u.value}" style="--urg-color:${u.color};--urg-bg:${u.bg}">
                <i class="bi ${u.icon}" style="color:${u.color};font-size:0.55rem;"></i>
                ${u.label}
              </button>`).join('')}
          </div>
          <input type="hidden" id="urgencia" value="${this.state.urgencia}">
        </section>

        <!-- ── Motivo ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-chat-left-text-fill"></i> Motivo <span class="am-required">*</span></p>
          <textarea id="motivo" class="am-textarea" maxlength="500"
            placeholder="Describí brevemente el motivo de tu ausencia..."
          >${escHTML(this.state.motivo)}</textarea>
          <div class="am-char-count"><span id="motivo-count">${this.state.motivo.length}</span>/500</div>
        </section>

        <!-- ── Clases afectadas ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-music-note-list"></i> Clases afectadas</p>
          <div id="clases-afectadas-container" class="am-clases-placeholder">
            <i class="bi bi-calendar-x" style="font-size:1.5rem;opacity:0.4;"></i>
            <span>Seleccioná la fecha para ver las clases afectadas</span>
          </div>
        </section>

        <!-- ── Cobertura ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-shield-check"></i> Cobertura</p>
          <div class="am-coverage-opts">
            <label class="am-coverage-opt ${this.state.coverageType === 'activities' ? 'selected' : ''}">
              <input type="radio" name="coverage-type" value="activities" ${this.state.coverageType === 'activities' ? 'checked' : ''} style="display:none;">
              <i class="bi bi-journal-check" style="font-size:1.1rem;"></i>
              <div>
                <strong>Actividades</strong>
                <p>Asignar tareas para el período</p>
              </div>
            </label>
            <label class="am-coverage-opt ${this.state.coverageType === 'reschedule' ? 'selected' : ''}">
              <input type="radio" name="coverage-type" value="reschedule" ${this.state.coverageType === 'reschedule' ? 'checked' : ''} style="display:none;">
              <i class="bi bi-calendar-plus" style="font-size:1.1rem;"></i>
              <div>
                <strong>Clase emergente</strong>
                <p>Reprogramar en otra fecha</p>
              </div>
            </label>
          </div>

          <div id="reschedule-panel" style="${this.state.coverageType === 'reschedule' ? '' : 'display:none;'}margin-top:0.75rem;">
            <div class="am-date-grid">
              <div>
                <label class="am-input-label"><i class="bi bi-calendar-event"></i> Fecha emergente</label>
                <input type="date" id="emergente-fecha" class="am-input" value="${escHTML(this.state.claseEmergente.fecha)}" min="${today}">
              </div>
              <div>
                <label class="am-input-label"><i class="bi bi-clock"></i> Hora</label>
                <input type="time" id="emergente-hora" class="am-input" value="${escHTML(this.state.claseEmergente.hora)}">
              </div>
            </div>
            <div id="salones-container"></div>
          </div>
        </section>

        <!-- ── Documento soporte ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-paperclip"></i> Documento soporte <span style="font-size:0.72rem;color:var(--pm-text-muted);font-weight:400;">(opcional)</span></p>
          <label class="am-file-label" id="am-file-drop">
            <input type="file" id="archivo-soporte" accept=".pdf,.jpg,.jpeg,.png" style="display:none;">
            <i class="bi bi-cloud-upload" style="font-size:1.5rem;opacity:0.5;"></i>
            <span id="am-file-name">PDF, JPG o PNG · máx. 5 MB</span>
          </label>
        </section>

        <!-- ── Notificación ── -->
        <section class="am-section">
          <label class="am-switch-row" id="am-notify-label">
            <div class="am-switch-info">
              <i class="bi bi-bell-fill" style="color:var(--pm-primary);"></i>
              <div>
                <strong>Notificar al director</strong>
                <p>Se enviará una alerta automática</p>
              </div>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="notify-director" ${this.state.notifyDirector ? 'checked' : ''}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </label>
        </section>

        <div id="ausencia-errors" role="alert" class="am-errors"></div>
      </form>

      <style>
        .pm-ausencia-form { display:flex; flex-direction:column; gap:0; }
        .am-section { padding: 0.85rem 0; border-bottom: 1px solid var(--pm-border); }
        .am-section:last-of-type { border-bottom: none; }
        .am-section-label {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--pm-text-muted); margin: 0 0 0.65rem;
        }
        .am-required { color: var(--pm-danger); }

        /* Tipo pills */
        .am-tipo-grid {
          display: grid; grid-template-columns: repeat(5,1fr); gap: 0.4rem;
        }
        @media (max-width: 480px) { .am-tipo-grid { grid-template-columns: repeat(3,1fr); } }
        .am-tipo-btn {
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          padding: 0.6rem 0.25rem; border-radius: 12px;
          border: 1.5px solid var(--pm-border);
          background: var(--pm-surface-2); cursor: pointer;
          font-size: 0.68rem; font-weight: 600; color: var(--pm-text-muted);
          transition: all 0.15s; line-height: 1.2;
        }
        .am-tipo-btn:hover { border-color: var(--tipo-color); color: var(--tipo-color); }
        .am-tipo-btn.selected {
          border-color: var(--tipo-color);
          background: color-mix(in srgb, var(--tipo-color) 12%, transparent);
          color: var(--tipo-color); font-weight: 700;
        }

        /* Duración toggle */
        .am-duracion-toggle { display: flex; gap: 0.5rem; }
        .am-dur-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.55rem 0.75rem; border-radius: 10px;
          border: 1.5px solid var(--pm-border); background: var(--pm-surface-2);
          cursor: pointer; font-size: 0.83rem; font-weight: 600; color: var(--pm-text-muted);
          transition: all 0.15s;
        }
        .am-dur-btn.selected {
          border-color: var(--pm-primary); background: rgba(59,130,246,0.1);
          color: var(--pm-primary);
        }

        /* Date inputs */
        .am-date-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 400px) { .am-date-grid { grid-template-columns: 1fr; } }
        .am-input-label {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.75rem; font-weight: 600; color: var(--pm-text-muted); margin-bottom: 0.3rem;
        }
        .am-input {
          width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px;
          border: 1.5px solid var(--pm-border); background: var(--pm-surface-2);
          color: var(--pm-text); font-size: 0.88rem; font-family: inherit;
          transition: border-color 0.15s;
        }
        .am-input:focus { outline: none; border-color: var(--pm-primary); }

        /* Urgencia chips */
        .am-urgencia-row { display: flex; gap: 0.5rem; }
        .am-urg-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          padding: 0.45rem 0.5rem; border-radius: 20px;
          border: 1.5px solid var(--pm-border); background: var(--pm-surface-2);
          cursor: pointer; font-size: 0.8rem; font-weight: 600; color: var(--pm-text-muted);
          transition: all 0.15s;
        }
        .am-urg-btn.selected {
          border-color: var(--urg-color); background: var(--urg-bg);
          color: var(--urg-color);
        }

        /* Textarea */
        .am-textarea {
          width: 100%; min-height: 80px; padding: 0.6rem 0.75rem;
          border: 1.5px solid var(--pm-border); border-radius: 10px;
          background: var(--pm-surface-2); color: var(--pm-text);
          font-family: inherit; font-size: 0.88rem; resize: vertical;
          transition: border-color 0.15s;
        }
        .am-textarea:focus { outline: none; border-color: var(--pm-primary); }
        .am-char-count { font-size: 0.72rem; color: var(--pm-text-muted); text-align: right; margin-top: 0.25rem; }

        /* Clases afectadas */
        .am-clases-placeholder {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 1rem; border-radius: 10px;
          background: var(--pm-surface-2); border: 1px dashed var(--pm-border);
          color: var(--pm-text-muted); font-size: 0.82rem;
        }

        /* Coverage options */
        .am-coverage-opts { display: flex; flex-direction: column; gap: 0.4rem; }
        .am-coverage-opt {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.65rem 0.85rem; border-radius: 10px;
          border: 1.5px solid var(--pm-border); background: var(--pm-surface-2);
          cursor: pointer; transition: all 0.15s; color: var(--pm-text);
        }
        .am-coverage-opt strong { display: block; font-size: 0.85rem; }
        .am-coverage-opt p { margin: 0; font-size: 0.72rem; color: var(--pm-text-muted); }
        .am-coverage-opt.selected {
          border-color: var(--pm-primary); background: rgba(59,130,246,0.08);
        }
        .am-coverage-opt.selected i { color: var(--pm-primary); }

        /* File upload */
        .am-file-label {
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          padding: 1rem; border-radius: 10px; cursor: pointer;
          border: 1.5px dashed var(--pm-border); background: var(--pm-surface-2);
          color: var(--pm-text-muted); font-size: 0.8rem; text-align: center;
          transition: border-color 0.15s;
        }
        .am-file-label:hover { border-color: var(--pm-primary); }

        /* Switch row */
        .am-switch-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 0.75rem; cursor: pointer;
        }
        .am-switch-info {
          display: flex; align-items: center; gap: 0.65rem;
        }
        .am-switch-info strong { display: block; font-size: 0.88rem; color: var(--pm-text); }
        .am-switch-info p { margin: 0; font-size: 0.72rem; color: var(--pm-text-muted); }

        /* Errors */
        .am-errors {
          font-size: 0.82rem; color: var(--pm-danger);
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px; padding: 0.5rem 0.75rem; display: none; margin-top: 0.5rem;
        }
        .am-errors:not(:empty) { display: block; }
      </style>
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

    // ── Tipo de ausencia pills ──
    document.querySelectorAll('.am-tipo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.am-tipo-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.tipoAusencia = btn.dataset.tipo;
        document.getElementById('tipo-ausencia').value = btn.dataset.tipo;
      });
    });

    // ── Urgencia chips ──
    document.querySelectorAll('.am-urg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.am-urg-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.urgencia = btn.dataset.urg;
        document.getElementById('urgencia').value = btn.dataset.urg;
      });
    });

    // ── Toggle duración ──
    const _syncFechas = () => {
      if (this.state.fechaInicio && this.state.fechaFin) this._loadAffectedClasses();
    };

    document.querySelectorAll('.am-dur-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.am-dur-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.state.duracion = btn.dataset.dur;
        const isDia = this.state.duracion === 'dia';
        document.getElementById('fecha-dia-panel').style.display  = isDia ? '' : 'none';
        document.getElementById('fecha-rango-panel').style.display = isDia ? 'none' : '';
        // Reset fechas al cambiar modo
        this.state.fechaInicio = '';
        this.state.fechaFin = '';
        document.getElementById('clases-afectadas-container').innerHTML = `
          <i class="bi bi-calendar-x" style="font-size:1.5rem;opacity:0.4;"></i>
          <span>Seleccioná la fecha para ver las clases afectadas</span>`;
        document.getElementById('clases-afectadas-container').className = 'am-clases-placeholder';
      });
    });

    // ── Fecha única (1 día) ──
    document.getElementById('fecha-unica')?.addEventListener('change', (e) => {
      this.state.fechaInicio = e.target.value;
      this.state.fechaFin    = e.target.value;
      _syncFechas();
    });

    // ── Rango de fechas ──
    document.getElementById('fecha-inicio')?.addEventListener('change', (e) => {
      this.state.fechaInicio = e.target.value;
      _syncFechas();
    });
    document.getElementById('fecha-fin')?.addEventListener('change', (e) => {
      this.state.fechaFin = e.target.value;
      _syncFechas();
    });

    // ── Coverage type ──
    document.querySelectorAll('input[name="coverage-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.coverageType = e.target.value;
        document.querySelectorAll('.am-coverage-opt').forEach(opt => {
          const inp = opt.querySelector('input[name="coverage-type"]');
          opt.classList.toggle('selected', inp?.value === e.target.value);
        });
        const panel = document.getElementById('reschedule-panel');
        if (panel) panel.style.display = e.target.value === 'reschedule' ? '' : 'none';
      });
    });
    // Click en la label también activa el radio
    document.querySelectorAll('.am-coverage-opt').forEach(label => {
      label.addEventListener('click', () => {
        const radio = label.querySelector('input[type="radio"]');
        if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    });

    // ── Reschedule salones ──
    const onRescheduleChange = () => {
      const fecha = document.getElementById('emergente-fecha')?.value;
      const hora  = document.getElementById('emergente-hora')?.value;
      if (fecha) this.state.claseEmergente.fecha = fecha;
      if (hora)  this.state.claseEmergente.hora  = hora;
      if (this.state.claseEmergente.fecha && this.state.claseEmergente.hora) this._loadAvailableSalons();
    };
    document.getElementById('emergente-fecha')?.addEventListener('change', onRescheduleChange);
    document.getElementById('emergente-hora')?.addEventListener('change', onRescheduleChange);

    // ── Motivo ──
    document.getElementById('motivo')?.addEventListener('input', (e) => {
      this.state.motivo = e.target.value;
      const count = document.getElementById('motivo-count');
      if (count) count.textContent = String(e.target.value.length);
    });

    // ── Notify director ──
    document.getElementById('notify-director')?.addEventListener('change', (e) => {
      this.state.notifyDirector = e.target.checked;
    });

    // ── File upload ──
    document.getElementById('am-file-drop')?.addEventListener('click', () => {
      document.getElementById('archivo-soporte')?.click();
    });
    document.getElementById('archivo-soporte')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0] || null;
      this.state.archivo.file = file;
      const nameEl = document.getElementById('am-file-name');
      if (nameEl) nameEl.textContent = file ? file.name : 'PDF, JPG o PNG · máx. 5 MB';
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
    // Sync DOM values into state
    const motivoEl = document.getElementById('motivo');
    if (motivoEl) this.state.motivo = motivoEl.value;

    if (this.state.duracion === 'dia') {
      const unica = document.getElementById('fecha-unica')?.value;
      if (unica) { this.state.fechaInicio = unica; this.state.fechaFin = unica; }
    } else {
      const fi = document.getElementById('fecha-inicio')?.value;
      const ff = document.getElementById('fecha-fin')?.value;
      if (fi) this.state.fechaInicio = fi;
      if (ff) this.state.fechaFin = ff;
    }

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
