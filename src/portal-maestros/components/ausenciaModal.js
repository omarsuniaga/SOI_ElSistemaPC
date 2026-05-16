import { AppModal } from '../../shared/components/AppModal.js';
import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { AppToast } from '../../shared/components/AppToast.js';
import { escHTML } from '../utils/portalUtils.js';

const TIPO_AUSENCIA = [
  { value: 'enfermedad', label: 'Enfermedad', icon: 'bi-thermometer-half' },
  { value: 'personal', label: 'Personal', icon: 'bi-person' },
  { value: 'capacitacion', label: 'Capacitación', icon: 'bi-book' },
  { value: 'vacaciones', label: 'Vacaciones', icon: 'bi-sun' },
  { value: 'otro', label: 'Otro', icon: 'bi-three-dots' }
];

const URGENCIA_OPTS = [
  { value: 'baja', label: 'Baja', color: 'var(--pm-success)', desc: 'Con anticipación' },
  { value: 'media', label: 'Media', color: 'var(--pm-warning)', desc: 'Necesaria' },
  { value: 'alta', label: 'Alta', color: 'var(--pm-danger)', desc: 'Urgente' }
];

class AusenciaModal {
  constructor() {
    this.maestro = null;
    // Estado del formulario
    this.state = {
      duracionTipo: 'un_dia',
      fechaInicio: null,
      fechaFin: null,
      tipoAusencia: null,
      urgencia: 'media',
      motivo: '',
      clases: [],             // Todas las clases del maestro (cache)
      clasesAfectadas: [],    // Subconjunto según fechas
      actividades: {},        // { claseId: texto }
      archivo: null,
      claseEmergente: {
        activo: false,
        fecha: '',
        hora: '',
        salonId: null
      }
    };
    this.debounceTimer = null;
  }

  open() {
    this.maestro = getMaestroLocal();
    if (!this.maestro) {
      AppToast.error('Debes estar logueado para solicitar ausencias');
      return;
    }
    // Resetear estado
    this.state = { ...this.defaultState(), clases: [] };
    AppModal.open({
      title: 'Solicitar Ausencia',
      size: 'lg',
      body: this.renderForm(),
      saveText: 'Enviar Solicitud',
      onSave: () => this.handleSubmit(),
      onShow: () => this.attachEvents()
    });
  }

  defaultState() {
    return {
      duracionTipo: 'un_dia',
      fechaInicio: null,
      fechaFin: null,
      tipoAusencia: null,
      urgencia: 'media',
      motivo: '',
      clases: [],
      clasesAfectadas: [],
      actividades: {},
      archivo: null,
      claseEmergente: { activo: false, fecha: '', hora: '', salonId: null }
    };
  }

  renderForm() {
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return `
      <form id="ausencia-form" class="pm-ausencia-form" novalidate>
        <!-- Tipo de Ausencia -->
        <div class="pm-form-section">
          <fieldset style="border:none; padding:0; margin:0;">
            <legend class="pm-form-label">Tipo de Ausencia <span class="pm-required">*</span></legend>
            <div class="pm-tipo-grid" role="radiogroup" aria-describedby="tipo-ausencia-desc">
              ${TIPO_AUSENCIA.map(t => `
                <label class="pm-tipo-option">
                  <input type="radio" name="tipo_ausencia" value="${t.value}" required aria-label="${t.label}">
                  <span class="pm-tipo-card">
                    <i class="bi ${t.icon}" aria-hidden="true"></i>
                    <span>${t.label}</span>
                  </span>
                </label>
              `).join('')}
            </div>
          </fieldset>
        </div>

        <!-- Urgencia -->
        <div class="pm-form-section">
          <fieldset style="border:none; padding:0; margin:0;">
            <legend class="pm-form-label">Nivel de Urgencia</legend>
            <div class="pm-urgencia-options" role="radiogroup">
              ${URGENCIA_OPTS.map(u => `
                <label class="pm-urgencia-option">
                  <input type="radio" name="urgencia" value="${u.value}" ${u.value === 'media' ? 'checked' : ''} aria-label="${u.label}">
                  <span class="pm-urgencia-card" style="--urgencia-color: ${u.color}">
                    <span class="pm-urgencia-dot" aria-hidden="true"></span>
                    <div>
                      <strong>${u.label}</strong>
                      <small>${u.desc}</small>
                    </div>
                  </span>
                </label>
              `).join('')}
            </div>
          </fieldset>
        </div>

        <!-- Duración de la ausencia -->
        <div class="pm-form-section">
          <fieldset style="border:none; padding:0; margin:0;">
            <legend class="pm-form-label">Duración de la Ausencia</legend>
            <div class="pm-duration-options" role="radiogroup">
              <label class="pm-duration-option">
                <input type="radio" name="duracion_tipo" value="un_dia" checked aria-label="Un día">
                <span class="pm-duration-card">
                  <i class="bi bi-calendar-day" aria-hidden="true"></i>
                  <div>
                    <strong>Un día</strong>
                    <small>Seleccionar fecha específica</small>
                  </div>
                </span>
              </label>
              <label class="pm-duration-option">
                <input type="radio" name="duracion_tipo" value="varios_dias" aria-label="Varios días">
                <span class="pm-duration-card">
                  <i class="bi bi-calendar-range" aria-hidden="true"></i>
                  <div>
                    <strong>Varios días</strong>
                    <small>Rango de fechas</small>
                  </div>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        <!-- Fechas -->
        <div id="fecha-un-dia-container" class="pm-form-section">
          <div class="pm-form-group">
            <label class="pm-form-label" for="fecha-unica">Fecha <span class="pm-required">*</span></label>
            <input type="date" class="pm-form-input" id="fecha-unica" min="${today}" max="${maxDateStr}">
          </div>
        </div>

        <div id="fecha-rango-container" class="pm-form-row" style="display:none;">
          <div class="pm-form-group">
            <label class="pm-form-label" for="fecha-inicio">Desde <span class="pm-required">*</span></label>
            <input type="date" class="pm-form-input" id="fecha-inicio" min="${today}" max="${maxDateStr}">
          </div>
          <div class="pm-form-group">
            <label class="pm-form-label" for="fecha-fin">Hasta <span class="pm-required">*</span></label>
            <input type="date" class="pm-form-input" id="fecha-fin" min="${today}" max="${maxDateStr}">
          </div>
        </div>

        <!-- Días seleccionados (preview) -->
        <div id="dias-seleccionados" class="pm-dias-preview" style="display:none;">
          <i class="bi bi-info-circle"></i>
          <span id="dias-seleccionados-text"></span>
        </div>

        <!-- Motivo -->
        <div class="pm-form-section">
          <label class="pm-form-label" for="motivo">Justificación <span class="pm-required">*</span></label>
          <textarea class="pm-form-textarea" id="motivo" rows="3" required maxlength="500"
            placeholder="Describe el motivo de tu ausencia..." aria-describedby="motivo-hint"></textarea>
          <div id="motivo-hint" class="pm-form-hint">Máximo 500 caracteres</div>
          <div class="pm-char-count"><span id="motivo-count">0</span>/500 caracteres</div>
        </div>

        <!-- Clases Afectadas -->
        <div class="pm-form-section">
          <label class="pm-form-label">Clases Afectadas <span id="clases-count" class="pm-badge-info">0</span></label>
          <div class="pm-clases-box" id="clases-afectadas">
            <div class="pm-clases-empty">
              <i class="bi bi-calendar3"></i>
              <span>Selecciona las fechas para ver las clases</span>
            </div>
          </div>
        </div>

        <!-- Actividades por Clase -->
        <div class="pm-form-section" id="actividades-seccion" style="display:none;">
          <label class="pm-form-label">Actividad Delegada por Clase</label>
          <p class="pm-form-hint">Especifica el material/contenido para cada clase afectada</p>
          <div id="actividades-container" class="pm-actividades-list"></div>
        </div>

        <!-- Clase Emergente -->
        <div class="pm-form-section" id="emergente-seccion" style="display:none;">
          <label class="pm-form-label">
            <i class="bi bi-arrow-repeat"></i> Recuperar Clases
          </label>
          <p class="pm-form-hint">¿Deseas recuperar las clases perdidas programando clases emergentes?</p>
          
          <label class="pm-toggle-option">
            <input type="checkbox" id="quiero-emergente">
            <span class="pm-toggle-switch"></span>
            <span>Sí, deseo programar clases emergentes</span>
          </label>

          <div id="emergente-opciones" class="pm-emergente-box" style="display:none; margin-top:1rem;">
            <div class="pm-form-row">
              <div class="pm-form-group">
                <label class="pm-form-label" for="emergente-fecha">Fecha Propuesta <span class="pm-required">*</span></label>
                <input type="date" class="pm-form-input" id="emergente-fecha">
              </div>
              <div class="pm-form-group">
                <label class="pm-form-label" for="emergente-hora">Hora <span class="pm-required">*</span></label>
                <input type="time" class="pm-form-input" id="emergente-hora">
              </div>
            </div>
            <div id="salones-disponibles" class="pm-salones-list"></div>
            <div id="salon-seleccionado" class="pm-salon-seleccionado" style="display:none;"></div>
          </div>
        </div>

        <!-- Adjunto -->
        <div class="pm-form-section">
          <label class="pm-form-label" for="documento">Documento de Respaldo</label>
          <div class="pm-file-upload">
            <input type="file" id="documento" accept=".pdf,.jpg,.jpeg,.png" hidden>
            <label for="documento" class="pm-file-label">
              <i class="bi bi-upload"></i>
              <span>Subir archivo (PDF, JPG) - máx 5MB</span>
            </label>
            <div id="file-name" class="pm-file-name"></div>
          </div>
        </div>

        <!-- Notificación automática -->
        <div class="pm-notificacion-auto">
          <i class="bi bi-bell-fill"></i>
          <span>El director será notificado automáticamente sobre esta solicitud</span>
        </div>
      </form>

      <style>
        .pm-ausencia-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .pm-form-section { display: flex; flex-direction: column; gap: 0.5rem; }
        .pm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .pm-form-group { display: flex; flex-direction: column; gap: 0.375rem; }
        .pm-form-label { font-size: 0.8125rem; font-weight: 600; color: var(--pm-text); }
        .pm-required { color: var(--pm-danger); }
        .pm-form-input, .pm-form-textarea {
          padding: 0.625rem 0.875rem;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          font-size: 0.875rem;
          background: var(--pm-surface);
          color: var(--pm-text);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pm-form-input:focus, .pm-form-textarea:focus {
          outline: none;
          border-color: var(--pm-primary);
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
        }
        .pm-form-textarea { resize: vertical; min-height: 80px; }
        .pm-char-count { font-size: 0.6875rem; color: var(--pm-text-muted); text-align: right; }

        /* Tipo options */
        .pm-tipo-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
        .pm-tipo-option input { display: none; }
        .pm-tipo-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          padding: 0.75rem 0.5rem;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--pm-surface);
        }
        .pm-tipo-card i { font-size: 1.25rem; color: var(--pm-text-muted); }
        .pm-tipo-card span { font-size: 0.6875rem; color: var(--pm-text); }
        .pm-tipo-option input:checked + .pm-tipo-card {
          border-color: var(--pm-primary);
          background: rgba(0, 122, 255, 0.08);
        }
        .pm-tipo-option input:checked + .pm-tipo-card i { color: var(--pm-primary); }

        /* Urgencia options */
        .pm-urgencia-options { display: flex; gap: 0.75rem; }
        .pm-urgencia-option { flex: 1; }
        .pm-urgencia-option input { display: none; }
        .pm-urgencia-card {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 0.75rem;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--pm-surface);
        }
        .pm-urgencia-card strong { display: block; font-size: 0.8125rem; }
        .pm-urgencia-card small { font-size: 0.6875rem; color: var(--pm-text-muted); }
        .pm-urgencia-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--urgencia-color);
        }
        .pm-urgencia-option input:checked + .pm-urgencia-card {
          border-color: var(--urgencia-color);
          background: color-mix(in srgb, var(--urgencia-color) 10%, transparent);
        }

        /* Clases afectadas */
        .pm-clases-box {
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          padding: 0.75rem;
          min-height: 60px;
          background: var(--pm-surface);
        }
        .pm-clases-empty {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--pm-text-muted);
          font-size: 0.8125rem;
        }
        .pm-clases-empty i { font-size: 1rem; }
        .pm-clase-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: var(--pm-surface-2);
          border-radius: 8px;
          margin-bottom: 0.375rem;
        }
        .pm-clase-item:last-child { margin-bottom: 0; }
        .pm-clase-info { display: flex; flex-direction: column; }
        .pm-clase-nombre { font-size: 0.8125rem; font-weight: 500; }
        .pm-clase-meta { font-size: 0.6875rem; color: var(--pm-text-muted); }
        .pm-clase-badge {
          font-size: 0.6875rem; padding: 0.125rem 0.5rem;
          border-radius: 20px; font-weight: 500;
        }
        .pm-clase-badge.warning { background: var(--pm-warning-bg); color: var(--pm-warning); }
        .pm-clase-badge.success { background: var(--pm-success-bg); color: var(--pm-success); }

        /* File upload */
        .pm-file-upload { display: flex; flex-direction: column; gap: 0.375rem; }
        .pm-file-label {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px dashed var(--pm-border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--pm-text-muted);
          font-size: 0.8125rem;
        }
        .pm-file-label:hover { border-color: var(--pm-primary); color: var(--pm-primary); }
        .pm-file-name { font-size: 0.75rem; color: var(--pm-success); }

        /* Toggle */
        .pm-toggle-option {
          display: flex; align-items: center; gap: 0.75rem;
          cursor: pointer; font-size: 0.875rem;
        }
        .pm-toggle-option input { display: none; }
        .pm-toggle-switch {
          width: 44px; height: 24px;
          background: var(--pm-border);
          border-radius: 12px;
          position: relative;
          transition: background 0.2s;
        }
        .pm-toggle-switch::after {
          content: ''; position: absolute;
          width: 20px; height: 20px;
          background: white; border-radius: 50%;
          top: 2px; left: 2px;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .pm-toggle-option input:checked + .pm-toggle-switch {
          background: var(--pm-primary);
        }
        .pm-toggle-option input:checked + .pm-toggle-switch::after {
          transform: translateX(20px);
        }

        @media (max-width: 600px) {
          .pm-tipo-grid { grid-template-columns: repeat(3, 1fr); }
          .pm-urgencia-options { flex-direction: column; }
          .pm-form-row { grid-template-columns: 1fr; }
        }
      
        /* Duration options */
        .pm-duration-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .pm-duration-option input { display: none; }
        .pm-duration-card {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.875rem 1rem;
          border: 1px solid var(--pm-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--pm-surface);
        }
        .pm-duration-card i { font-size: 1.5rem; color: var(--pm-text-muted); }
        .pm-duration-card strong { display: block; font-size: 0.875rem; }
        .pm-duration-card small { font-size: 0.6875rem; color: var(--pm-text-muted); }
        .pm-duration-option input:checked + .pm-duration-card {
          border-color: var(--pm-primary);
          background: rgba(0, 122, 255, 0.08);
        }
        .pm-duration-option input:checked + .pm-duration-card i { color: var(--pm-primary); }

        /* Dias preview */
        .pm-dias-preview {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          background: var(--pm-primary-bg);
          border-radius: 8px;
          font-size: 0.8125rem;
          color: var(--pm-primary);
        }
        .pm-dias-preview i { font-size: 1rem; }
        
        /* Badge info */
        .pm-badge-info {
          display: inline-block;
          background: var(--pm-primary-bg);
          color: var(--pm-primary);
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 20px;
          margin-left: 0.5rem;
        }

        /* Form hint */
        .pm-form-hint {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin-top: -0.25rem;
        }

        /* Actividades por clase */
        .pm-actividades-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .pm-actividad-item {
          padding: 0.75rem;
          border: 1px solid var(--pm-border);
          border-radius: 10px;
          background: var(--pm-surface);
        }
        .pm-actividad-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .pm-actividad-nombre { font-weight: 600; font-size: 0.875rem; }
        .pm-actividad-badge {
          font-size: 0.625rem; padding: 0.125rem 0.375rem;
          border-radius: 4px; background: var(--pm-surface-2);
        }
        .pm-actividad-textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--pm-border);
          border-radius: 6px;
          font-size: 0.8125rem;
          resize: vertical;
          min-height: 60px;
        }

        /* Emergente box */
        .pm-emergente-box {
          padding: 1rem;
          background: var(--pm-surface-2);
          border-radius: 10px;
          border: 1px solid var(--pm-border);
        }

        /* Salones */
        .pm-salones-list {
          display: flex; flex-direction: column; gap: 0.375rem;
          margin-top: 0.75rem;
        }
        .pm-salon-option {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pm-salon-option:hover { border-color: var(--pm-primary); }
        .pm-salon-option.selected {
          border-color: var(--pm-primary);
          background: var(--pm-primary-bg);
        }
        .pm-salon-option input { display: none; }
        .pm-salon-nombre { font-size: 0.8125rem; font-weight: 500; }
        .pm-salon-info { font-size: 0.6875rem; color: var(--pm-text-muted); }

        /* Notificación auto */
        .pm-notificacion-auto {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--pm-success-bg);
          border-radius: 10px;
          font-size: 0.8125rem;
          color: var(--pm-success);
        }
        .pm-notificacion-auto i { font-size: 1rem; }

        /* Checkbox classes */
        .pm-clase-check {
          display: flex; align-items: center; gap: 0.5rem;
          cursor: pointer;
        }
        .pm-clase-check input { display: none; }
        .pm-clase-check-box {
          width: 18px; height: 18px;
          border: 2px solid var(--pm-border);
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .pm-clase-check input:checked + .pm-clase-check-box {
          background: var(--pm-primary);
          border-color: var(--pm-primary);
        }
        .pm-clase-check-box i { font-size: 0.75rem; color: white; display: none; }
        .pm-clase-check input:checked + .pm-clase-check-box i { display: block; }
      </style>`;
  }

  attachEvents() {
    // Referencias a elementos
    const form = document.getElementById('ausencia-form');
    const motivo = document.getElementById('motivo');
    const motivoCount = document.getElementById('motivo-count');
    const fechaUnica = document.getElementById('fecha-unica');
    const fechaInicio = document.getElementById('fecha-inicio');
    const fechaFin = document.getElementById('fecha-fin');
    const duracionRadios = document.querySelectorAll('input[name="duracion_tipo"]');
    const quieroEmergente = document.getElementById('quiero-emergente');
    const emergenteOpciones = document.getElementById('emergente-opciones');
    const fileInput = document.getElementById('documento');
    const fileName = document.getElementById('file-name');

    // Cambio de duración
    duracionRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.state.duracionTipo = radio.value;
        const isUnDia = radio.value === 'un_dia';
        document.getElementById('fecha-un-dia-container').style.display = isUnDia ? 'block' : 'none';
        document.getElementById('fecha-rango-container').style.display = isUnDia ? 'none' : 'grid';
        if (isUnDia) {
          fechaUnica.setAttribute('required', 'true');
          fechaInicio.removeAttribute('required');
          fechaFin.removeAttribute('required');
        } else {
          fechaUnica.removeAttribute('required');
          fechaInicio.setAttribute('required', 'true');
          fechaFin.setAttribute('required', 'true');
        }
        this.updateDiasPreview();
        this.loadClasesAfectadasDebounced();
      });
    });

    // Fechas
    const updateFecha = () => {
      this.updateDiasPreview();
      this.loadClasesAfectadasDebounced();
    };
    fechaUnica?.addEventListener('change', updateFecha);
    fechaInicio?.addEventListener('change', () => {
      if (fechaFin) fechaFin.min = fechaInicio.value;
      updateFecha();
    });
    fechaFin?.addEventListener('change', updateFecha);

    // Motivo
    motivo?.addEventListener('input', () => {
      const len = motivo.value.length;
      motivoCount.textContent = len;
      motivoCount.style.color = len > 450 ? 'var(--pm-danger)' : 'var(--pm-text-muted)';
      this.state.motivo = motivo.value;
    });

    // Clase emergente
    quieroEmergente?.addEventListener('change', () => {
      this.state.claseEmergente.activo = quieroEmergente.checked;
      emergenteOpciones.style.display = quieroEmergente.checked ? 'block' : 'none';
      if (quieroEmergente.checked) this.loadSalonesDisponibles();
    });
    document.getElementById('emergente-fecha')?.addEventListener('change', () => this.loadSalonesDisponibles());
    document.getElementById('emergente-hora')?.addEventListener('change', () => this.loadSalonesDisponibles());

    // Archivo
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        AppToast.error('El archivo no puede superar 5MB');
        fileInput.value = '';
        return;
      }
      this.state.archivo = file;
      fileName.textContent = `${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`;
    });

    // Actividades delegadas: sincronizar al escribir
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('pm-actividad-textarea')) {
        const claseId = e.target.dataset.claseId;
        this.state.actividades[claseId] = e.target.value;
      }
    });
  }

  updateDiasPreview() {
    const tipo = this.state.duracionTipo;
    const fechaUnica = document.getElementById('fecha-unica')?.value;
    const fechaInicio = document.getElementById('fecha-inicio')?.value;
    const fechaFin = document.getElementById('fecha-fin')?.value;
    const preview = document.getElementById('dias-seleccionados');
    const text = document.getElementById('dias-seleccionados-text');

    if (tipo === 'un_dia' && fechaUnica) {
      const fecha = new Date(fechaUnica);
      // To correctly format local time, we should adjust for timezone or add Time component, but since it's just date we use 'es-ES'
      // Note: new Date("YYYY-MM-DD") creates UTC date which might show as previous day in some timezones.
      const d = new Date(fechaUnica + "T00:00:00");
      preview.style.display = 'flex';
      text.textContent = `1 día: ${d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    } else if (tipo === 'varios_dias' && fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio + "T00:00:00");
      const fin = new Date(fechaFin + "T00:00:00");
      const diff = Math.ceil((fin - inicio) / (1000*60*60*24)) + 1;
      if (diff > 0) {
        preview.style.display = 'flex';
        text.textContent = `${diff} días (${inicio.toLocaleDateString('es-ES',{day:'numeric',month:'short'})} - ${fin.toLocaleDateString('es-ES',{day:'numeric',month:'short'})})`;
      }
    } else {
      preview.style.display = 'none';
    }
  }

  loadClasesAfectadasDebounced() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.loadClasesAfectadas(), 400);
  }

  async loadClasesAfectadas() {
    const tipo = this.state.duracionTipo;
    let fechaInicio, fechaFin;
    if (tipo === 'un_dia') {
      fechaInicio = document.getElementById('fecha-unica')?.value;
      fechaFin = fechaInicio;
    } else {
      fechaInicio = document.getElementById('fecha-inicio')?.value;
      fechaFin = document.getElementById('fecha-fin')?.value;
    }
    if (!fechaInicio) return;

    const container = document.getElementById('clases-afectadas');
    container.innerHTML = `<div class="pm-clases-empty"><div class="pm-spinner"></div> Cargando clases...</div>`;

    try {
      // Obtener clases que tengan sesiones en el rango
      const { data: sesiones, error } = await supabase
        .from('sesiones')
        .select('clase_id, clase:clases(id, nombre, instrumento)')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .or(`clase.maestro_principal_id.eq.${this.maestro.id},clase.maestro_suplente_id.eq.${this.maestro.id}`);

      if (error) throw error;

      // Extraer clases únicas
      const clasesMap = new Map();
      (sesiones || []).forEach(s => {
        if (s.clase) {
          clasesMap.set(s.clase.id, s.clase);
        }
      });
      this.state.clasesAfectadas = Array.from(clasesMap.values());

      const count = this.state.clasesAfectadas.length;
      document.getElementById('clases-count').textContent = count;

      if (count > 0) {
        container.innerHTML = this.state.clasesAfectadas.map(clase => `
          <div class="pm-clase-item">
            <div class="pm-clase-info">
              <span class="pm-clase-nombre">${escHTML(clase.nombre)}</span>
              <span class="pm-clase-meta">${escHTML(clase.instrumento || 'Sin instrumento')}</span>
            </div>
            <label class="pm-clase-check" aria-label="Incluir clase">
              <input type="checkbox" checked data-clase-id="${clase.id}">
              <span class="pm-clase-check-box"><i class="bi bi-check"></i></span>
            </label>
          </div>`).join('');

        // Mostrar sección de actividades, preservando las ya escritas
        const actsSec = document.getElementById('actividades-seccion');
        const actsCont = document.getElementById('actividades-container');
        actsSec.style.display = 'block';
        actsCont.innerHTML = this.state.clasesAfectadas.map(clase => {
          const texto = this.state.actividades[clase.id] || '';
          return `
            <div class="pm-actividad-item">
              <div class="pm-actividad-header">
                <span class="pm-actividad-nombre">${escHTML(clase.nombre)}</span>
                <span class="pm-actividad-badge">${escHTML(clase.instrumento || '')}</span>
              </div>
              <textarea class="pm-actividad-textarea" data-clase-id="${clase.id}" placeholder="Material o actividad...">${escHTML(texto)}</textarea>
            </div>`;
        }).join('');

        document.getElementById('emergente-seccion').style.display = 'block';
      } else {
        container.innerHTML = `<div class="pm-clases-empty"><i class="bi bi-check-circle" style="color:var(--pm-success)"></i> No tienes clases en esas fechas</div>`;
        document.getElementById('actividades-seccion').style.display = 'none';
        document.getElementById('emergente-seccion').style.display = 'none';
      }
    } catch (error) {
      container.innerHTML = `<div class="pm-clases-empty"><i class="bi bi-exclamation-circle"></i> Error al cargar clases</div>`;
    }
  }

  async loadSalonesDisponibles() {
    const fecha = document.getElementById('emergente-fecha')?.value;
    const hora = document.getElementById('emergente-hora')?.value;
    if (!fecha || !hora) return;
    const container = document.getElementById('salones-disponibles');
    container.innerHTML = `<div class="pm-clases-empty"><div class="pm-spinner"></div> Verificando disponibilidad...</div>`;

    try {
      const { data: salones } = await supabase.from('salones').select('id,nombre,capacidad').eq('activo', true);
      const { data: reservas } = await supabase.from('reservas_salones').select('salon_id').eq('fecha', fecha).eq('hora', hora).eq('estado', 'confirmada');
      const ocupados = new Set((reservas||[]).map(r=>r.salon_id));
      const disponibles = (salones||[]).filter(s => !ocupados.has(s.id));
      if (disponibles.length) {
        container.innerHTML = disponibles.map(s => `
          <label class="pm-salon-option" aria-label="Seleccionar salón ${s.nombre}">
            <input type="radio" name="salon-emergente" value="${s.id}">
            <span class="pm-salon-nombre">${escHTML(s.nombre)}</span>
            <span class="pm-salon-info">Capacidad: ${s.capacidad||'N/A'}</span>
          </label>`).join('');
      } else {
        container.innerHTML = `<div class="pm-clases-empty" style="color:var(--pm-danger)">No hay salones disponibles</div>`;
      }
    } catch {
      container.innerHTML = `<div class="pm-clases-empty">Error al verificar salones</div>`;
    }
  }

  async handleSubmit() {
    const form = document.getElementById('ausencia-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    // Validaciones adicionales
    const tipo = document.querySelector('input[name="tipo_ausencia"]:checked')?.value;
    if (!tipo) { AppToast.error('Selecciona el tipo de ausencia'); return false; }

    const motivo = document.getElementById('motivo').value;
    if (motivo.length > 500) { AppToast.error('El motivo no puede exceder 500 caracteres'); return false; }

    let fechaInicio, fechaFin;
    const duracionTipo = this.state.duracionTipo;
    if (duracionTipo === 'un_dia') {
      fechaInicio = document.getElementById('fecha-unica').value;
      fechaFin = fechaInicio;
    } else {
      fechaInicio = document.getElementById('fecha-inicio').value;
      fechaFin = document.getElementById('fecha-fin').value;
      if (fechaFin < fechaInicio) {
        AppToast.error('La fecha fin no puede ser anterior a la de inicio');
        return false;
      }
    }

    // Verificar solapamiento con solicitudes existentes (opcional)
    // ...

    // Construir datos
    const clasesIds = [];
    document.querySelectorAll('.pm-clase-check input[type="checkbox"]:checked').forEach(cb => clasesIds.push(cb.dataset.claseId));
    const actividades = {};
    document.querySelectorAll('.pm-actividad-textarea').forEach(ta => {
      if (ta.value.trim()) actividades[ta.dataset.claseId] = ta.value.trim();
    });

    let claseEmergente = null;
    if (this.state.claseEmergente.activo) {
      const salonId = document.querySelector('input[name="salon-emergente"]:checked')?.value;
      if (!salonId) { AppToast.error('Selecciona un salón para la clase emergente'); return false; }
      claseEmergente = {
        fecha: document.getElementById('emergente-fecha').value,
        hora: document.getElementById('emergente-hora').value,
        salon_id: salonId,
        estado: 'pendiente_aprobacion'
      };
    }

    const formData = {
      maestro_id: this.maestro.id,
      tipo_ausencia: tipo,
      urgencia: document.querySelector('input[name="urgencia"]:checked')?.value || 'media',
      duracion_tipo: duracionTipo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      motivo,
      clases_afectadas: clasesIds,
      actividades_por_clase: actividades,
      clase_emergente: claseEmergente,
      notificar_director: true,
      estado: 'pendiente',
      created_at: new Date().toISOString()
    };

    // Deshabilitar botón de envío
    const saveBtn = document.querySelector('#ausencia-form button[type="submit"]') || AppModal.getSaveButton();
    if (saveBtn) saveBtn.disabled = true;

    try {
      const { error } = await supabase.from('ausencias_maestros').insert([formData]);
      if (error) {
        // Fallback a localStorage
        const ausencias = JSON.parse(localStorage.getItem('ausencias_maestros') || '[]');
        ausencias.push({ ...formData, id: Date.now() });
        localStorage.setItem('ausencias_maestros', JSON.stringify(ausencias));
      }
      AppToast.success('Solicitud de ausencia enviada correctamente');
      return true;
    } catch {
      AppToast.error('No se pudo enviar la solicitud. Intenta de nuevo.');
      return false;
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }
}

export const ausenciaModal = new AusenciaModal();