/**
 * Modal de Solicitud de Ausencias - Portal Maestros v2
 * Diseño profesional con Apple-style
 */
import { AppModal } from '../../shared/components/AppModal.js'
import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { escHTML } from '../utils/portalUtils.js'

const TIPO_AUSENCIA = [
  { value: 'enfermedad', label: 'Enfermedad', icon: 'bi-thermometer-half' },
  { value: 'personal', label: 'Personal', icon: 'bi-person' },
  { value: 'capacitacion', label: 'Capacitación', icon: 'bi-book' },
  { value: 'vacaciones', label: 'Vacaciones', icon: 'bi-sun' },
  { value: 'otro', label: 'Otro', icon: 'bi-three-dots' }
]

const URGENCIA_OPTS = [
  { value: 'baja', label: 'Baja', color: 'var(--pm-success)', desc: 'Con anticipación' },
  { value: 'media', label: 'Media', color: 'var(--pm-warning)', desc: 'Necesaria' },
  { value: 'alta', label: 'Alta', color: 'var(--pm-danger)', desc: 'Urgente' }
]

export class AusenciaModal {
  constructor() {
    this.maestro = getMaestroLocal()
    this.clasesAfectadas = []
    this.actividades = {} 
    this.isDirty = false
    this.isSubmitting = false
    this.loadClasesDebounced = this._debounce(() => this._loadClasesAfectadasInternal(), 300)
  }

  _debounce(fn, delay) {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn.apply(this, args), delay)
    }
  }

  open() {
    if (!this.maestro) {
      AppToast.error('Debes estar logueado para solicitar ausencias')
      return
    }

    AppModal.open({
      title: 'Solicitar Ausencia',
      size: 'lg',
      body: this.renderForm(),
      saveText: 'Enviar Solicitud',
      onSave: () => this.handleSubmit(),
      onShow: () => this.attachEvents()
    })
  }

  renderForm() {
    const today = new Date().toISOString().split('T')[0]
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    const maxDateStr = maxDate.toISOString().split('T')[0]

    return `
      <form id="ausencia-form" class="pm-ausencia-form">
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
      </style>
    `
  }

  attachEvents() {
    const motivo = document.getElementById('motivo')
    const motivoCount = document.getElementById('motivo-count')
    const fechaInicio = document.getElementById('fecha-inicio')
    const fechaFin = document.getElementById('fecha-fin')
    const fechaUnica = document.getElementById('fecha-unica')
    const duracionTipo = document.querySelectorAll('input[name="duracion_tipo"]')
    const fechaUnDiaContainer = document.getElementById('fecha-un-dia-container')
    const fechaRangoContainer = document.getElementById('fecha-rango-container')
    const diasPreview = document.getElementById('dias-seleccionados')
    const diasPreviewText = document.getElementById('dias-seleccionados-text')
    const fileInput = document.getElementById('documento')
    const fileName = document.getElementById('file-name')
    const form = document.getElementById('ausencia-form')

    // Cambio de duración
    duracionTipo.forEach(radio => {
      radio.addEventListener('change', () => {
        const isUnDia = radio.value === 'un_dia'
        fechaUnDiaContainer.style.display = isUnDia ? 'block' : 'none'
        fechaRangoContainer.style.display = isUnDia ? 'none' : 'grid'
        
        // Requerir el campo apropiado
        if (isUnDia) {
          fechaUnica.setAttribute('required', 'true')
          fechaInicio.removeAttribute('required')
          fechaFin.removeAttribute('required')
        } else {
          fechaUnica.removeAttribute('required')
          fechaInicio.setAttribute('required', 'true')
          fechaFin.setAttribute('required', 'true')
        }
        
        this.loadClasesDebounced()
      })
    })

    // Actualizar preview de días
    const updateDiasPreview = () => {
      const tipo = document.querySelector('input[name="duracion_tipo"]:checked')?.value
      if (tipo === 'un_dia' && fechaUnica.value) {
        const fecha = new Date(fechaUnica.value)
        const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        diasPreview.style.display = 'flex'
        diasPreviewText.textContent = `1 día: ${diaSemana}`
      } else if (tipo === 'varios_dias' && fechaInicio.value && fechaFin.value) {
        const inicio = new Date(fechaInicio.value)
        const fin = new Date(fechaFin.value)
        const diffDays = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1
        if (diffDays > 0) {
          diasPreview.style.display = 'flex'
          diasPreviewText.textContent = `${diffDays} días seleccionados (${inicio.toLocaleDateString('es-ES', {day:'numeric', month:'short'})} - ${fin.toLocaleDateString('es-ES', {day:'numeric', month:'short'})})`
        }
      } else {
        diasPreview.style.display = 'none'
      }
    }

    // Contador de caracteres
    motivo?.addEventListener('input', () => {
      const len = motivo.value.length
      motivoCount.textContent = len
      motivoCount.style.color = len > 450 ? 'var(--pm-danger)' : 'var(--pm-text-muted)'
      this.isDirty = true
    })

    // Sincronizar fechas
    fechaInicio?.addEventListener('change', () => {
      if (fechaFin) {
        fechaFin.min = fechaInicio.value
        if (fechaFin.value && fechaFin.value < fechaInicio.value) {
          fechaFin.value = fechaInicio.value
        }
      }
      updateDiasPreview()
      this.loadClasesDebounced()
    })

    fechaFin?.addEventListener('change', () => {
      updateDiasPreview()
      this.loadClasesDebounced()
    })

    fechaUnica?.addEventListener('change', () => {
      updateDiasPreview()
      this.loadClasesDebounced()
    })

    // Toggle clase emergente
    const quieroEmergente = document.getElementById('quiero-emergente')
    const emergenteOpciones = document.getElementById('emergente-opciones')
    quieroEmergente?.addEventListener('change', () => {
      emergenteOpciones.style.display = quieroEmergente.checked ? 'block' : 'none'
      this.isDirty = true
      if (quieroEmergente.checked) {
        this.loadSalonesDisponibles()
      }
    })

    // Fecha/hora emergente para cargar salones
    const emergenteFecha = document.getElementById('emergente-fecha')
    const emergenteHora = document.getElementById('emergente-hora')
    const loadSalonesOnChange = () => {
      if (emergenteFecha.value && emergenteHora.value) {
        this.loadSalonesDisponibles()
      }
    }
    emergenteFecha?.addEventListener('change', loadSalonesOnChange)
    emergenteHora?.addEventListener('change', loadSalonesOnChange)

    // File validation
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          AppToast.error('El archivo no puede exceder 5MB')
          e.target.value = ''
          fileName.textContent = ''
          return
        }
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
          AppToast.error('Formato no permitido. Solo PDF, JPG o PNG')
          e.target.value = ''
          fileName.textContent = ''
          return
        }
        const size = (file.size / 1024 / 1024).toFixed(2)
        fileName.textContent = `${file.name} (${size}MB)`
        this.isDirty = true
      }
    })

    // Mark dirty on any input
    const markDirty = () => { this.isDirty = true }
    form?.addEventListener('input', markDirty)
    form?.addEventListener('change', markDirty)
  }

  async loadClasesAfectadas() {
    this.loadClasesDebounced()
  }

  async _loadClasesAfectadasInternal() {
    const duracionTipo = document.querySelector('input[name="duracion_tipo"]:checked')?.value
    let fechaInicio, fechaFin
    
    if (duracionTipo === 'un_dia') {
      fechaInicio = document.getElementById('fecha-unica')?.value
      fechaFin = fechaInicio
    } else {
      fechaInicio = document.getElementById('fecha-inicio')?.value
      fechaFin = document.getElementById('fecha-fin')?.value
    }
    
    const container = document.getElementById('clases-afectadas')
    
    if (!fechaInicio || !container) {
      document.getElementById('actividades-seccion').style.display = 'none'
      document.getElementById('emergente-seccion').style.display = 'none'
      return
    }

    container.innerHTML = `
      <div class="pm-clases-empty">
        <div class="pm-spinner" style="width:16px;height:16px;border-width:2px;"></div>
        <span>Cargando clases...</span>
      </div>
    `

    try {
      // Obtener clases del maestro
      const { data: clases, error } = await supabase
        .from('clases')
        .select('id, nombre, instrumento')
        .or(`maestro_principal_id.eq.${this.maestro.id},maestro_suplente_id.eq.${this.maestro.id}`)

      if (error) throw error

      // Filtrar clases que tienen sesiones programadas en el rango de fechas
      const { data: sesiones } = await supabase
        .from('sesiones')
        .select('clase_id, fecha')
        .in('clase_id', (clases || []).map(c => c.id))
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)

      const clasesConSesiones = new Set((sesiones || []).map(s => s.clase_id))
      this.clasesAfectadas = (clases || []).filter(c => clasesConSesiones.has(c.id))

      // Preservar actividades existentes
      const existingActividades = { ...this.actividades }

      document.getElementById('clases-count').textContent = this.clasesAfectadas.length

      if (this.clasesAfectadas.length > 0) {
        container.innerHTML = `
          <div class="pm-clases-list">
            ${this.clasesAfectadas.map(clase => `
              <div class="pm-clase-item">
                <div class="pm-clase-info">
                  <span class="pm-clase-nombre">${escHTML(clase.nombre)}</span>
                  <span class="pm-clase-meta">${escHTML(clase.instrumento || 'Sin instrumento')}</span>
                </div>
                <label class="pm-clase-check">
                  <input type="checkbox" checked data-clase-id="${clase.id}">
                  <span class="pm-clase-check-box"><i class="bi bi-check"></i></span>
                </label>
              </div>
            `).join('')}
          </div>
        `

        const actsSec = document.getElementById('actividades-seccion')
        const actsCont = document.getElementById('actividades-container')
        actsSec.style.display = 'block'
        
        // Preserve existing textarea content when re-rendering
        actsCont.innerHTML = this.clasesAfectadas.map(clase => `
          <div class="pm-actividad-item">
            <div class="pm-actividad-header">
              <span class="pm-actividad-nombre">${escHTML(clase.nombre)}</span>
              <span class="pm-actividad-badge">${escHTML(clase.instrumento || '')}</span>
            </div>
            <textarea class="pm-actividad-textarea" 
              data-clase-id="${clase.id}" 
              placeholder="Describe el material, contenido o actividad que el estudiante debe trabajar..."
              aria-label="Actividad para ${escHTML(clase.nombre)}">${existingActividades[clase.id] || ''}</textarea>
          </div>
        `).join('')

        // Restore activity values from state after render
        requestAnimationFrame(() => {
          document.querySelectorAll('.pm-actividad-textarea').forEach(textarea => {
            const claseId = textarea.dataset.claseId
            if (this.actividades[claseId]) {
              textarea.value = this.actividades[claseId]
            }
          })
        })

        document.getElementById('emergente-seccion').style.display = 'block'
      } else {
        container.innerHTML = `
          <div class="pm-clases-empty">
            <i class="bi bi-check-circle" style="color:var(--pm-success)"></i>
            <span>No hay clases programadas en este período</span>
          </div>
        `
        document.getElementById('actividades-seccion').style.display = 'none'
        document.getElementById('emergente-seccion').style.display = 'none'
      }
    } catch (error) {
      console.error('Error cargando clases:', error)
      container.innerHTML = `
        <div class="pm-clases-empty">
          <i class="bi bi-info-circle"></i>
          <span>No se pudieron cargar las clases</span>
        </div>
      `
    }
  }

  async loadSalonesDisponibles() {
    const fecha = document.getElementById('emergente-fecha')?.value
    const hora = document.getElementById('emergente-hora')?.value
    const container = document.getElementById('salones-disponibles')
    
    if (!fecha || !hora || !container) return

    container.innerHTML = `<div class="pm-clases-empty"><div class="pm-spinner" style="width:16px;height:16px;border-width:2px;"></div><span>Verificando disponibilidad...</span></div>`

    try {
      // Cargar todos los salones
      const { data: salones, error } = await supabase
        .from('salones')
        .select('id, nombre, capacidad')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error

      // Verificar disponibilidad (buscar reservas en esa fecha/hora)
      const { data: reservas } = await supabase
        .from('reservas_salones')
        .select('salon_id')
        .eq('fecha', fecha)
        .eq('hora', hora)
        .eq('estado', 'confirmada')

      const reservadoIds = new Set((reservas || []).map(r => r.salon_id))

      const salonesDisp = (salones || []).filter(s => !reservadoIds.has(s.id))

      if (salonesDisp.length > 0) {
        container.innerHTML = salones.map(salon => `
          <label class="pm-salon-option">
            <input type="radio" name="salon-emergente" value="${salon.id}">
            <div>
              <span class="pm-salon-nombre">${escHTML(salon.nombre)}</span>
              <span class="pm-salon-info">Capacidad: ${salon.capacidad || 'N/A'}</span>
            </div>
          </label>
        `).join('')
      } else {
        container.innerHTML = `
          <div class="pm-clases-empty" style="color:var(--pm-danger);">
            <i class="bi bi-x-circle"></i>
            <span>No hay salones disponibles en ese horario</span>
          </div>
        `
      }
    } catch (error) {
      console.error('Error cargando salones:', error)
      container.innerHTML = `<div class="pm-clases-empty"><i class="bi bi-info-circle"></i><span>Error al verificar disponibilidad</span></div>`
    }
  }

  async handleSubmit() {
    if (this.isSubmitting) return false
    
    const form = document.getElementById('ausencia-form')
    if (!form.checkValidity()) {
      form.reportValidity()
      return false
    }

    // Disable submit button
    this.isSubmitting = true
    const saveBtn = document.querySelector('.pm-modal-footer .pm-btn-primary')
    if (saveBtn) {
      saveBtn.disabled = true
      saveBtn.textContent = 'Enviando...'
    }

    const tipo = document.querySelector('input[name="tipo_ausencia"]:checked')?.value
    const urgencia = document.querySelector('input[name="urgencia"]:checked')?.value
    const duracionTipo = document.querySelector('input[name="duracion_tipo"]:checked')?.value
    const motivo = document.getElementById('motivo').value

    if (!tipo) {
      AppToast.error('Selecciona el tipo de ausencia')
      this.isSubmitting = false
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Enviar Solicitud' }
      return false
    }

    if (motivo.length > 500) {
      AppToast.error('El motivo no puede exceder 500 caracteres')
      this.isSubmitting = false
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Enviar Solicitud' }
      return false
    }

    // Validar fecha fin >= fecha inicio
    if (duracionTipo === 'varios_dias') {
      const fInicio = new Date(document.getElementById('fecha-inicio').value)
      const fFin = new Date(document.getElementById('fecha-fin').value)
      if (fFin < fInicio) {
        AppToast.error('La fecha de fin no puede ser anterior a la de inicio')
        this.isSubmitting = false
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Enviar Solicitud' }
        return false
      }
    }

    // Obtener fechas según tipo de duración
    let fechaInicio, fechaFin
    if (duracionTipo === 'un_dia') {
      fechaInicio = document.getElementById('fecha-unica').value
      fechaFin = fechaInicio // Mismo día
    } else {
      fechaInicio = document.getElementById('fecha-inicio').value
      fechaFin = document.getElementById('fecha-fin').value
    }

    if (!fechaInicio) {
      AppToast.error('Selecciona la fecha de inicio')
      return false
    }

    // Recolectar actividades por clase (preserved from state)
    const actividades = { ...this.actividades }
    document.querySelectorAll('.pm-actividad-textarea').forEach(textarea => {
      const claseId = textarea.dataset.claseId
      if (textarea.value.trim()) {
        actividades[claseId] = textarea.value.trim()
      }
    })

    // Datos de clase emergente
    const quieroEmergente = document.getElementById('quiero-emergente')?.checked
    let claseEmergente = null
    if (quieroEmergente) {
      const salonId = document.querySelector('input[name="salon-emergente"]:checked')?.value
      if (!salonId) {
        AppToast.error('Selecciona un salón para la clase emergente')
        return false
      }
      claseEmergente = {
        fecha: document.getElementById('emergente-fecha').value,
        hora: document.getElementById('emergente-hora').value,
        salon_id: salonId,
        estado: 'pendiente_aprobacion'
      }
    }

    const formData = {
      maestro_id: this.maestro.id,
      tipo_ausencia: tipo,
      urgencia: urgencia || 'media',
      duracion_tipo: duracionTipo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      motivo: motivo,
      clases_afectadas: this.clasesAfectadas.map(c => c.id),
      actividades_por_clase: actividades,
      clase_emergente: claseEmergente,
      notificar_director: true, // Siempre true
      estado: 'pendiente',
      created_at: new Date().toISOString()
    }

    try {
      const { error } = await supabase
        .from('ausencias_maestros')
        .insert([formData])

      if (error) {
        console.warn('Guardando localmente:', error.message)
        const ausencias = JSON.parse(localStorage.getItem('ausencias_maestros') || '[]')
        ausencias.push({ ...formData, id: Date.now() })
        localStorage.setItem('ausencias_maestros', JSON.stringify(ausencias))
      }

      this.isDirty = false
      this.isSubmitting = false
      AppToast.success('Solicitud de ausencia enviada correctamente')
      return true
    } catch (error) {
      console.error('Error guardando ausencia:', error)
      this.isSubmitting = false
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Enviar Solicitud' }
      AppToast.error('No se pudo enviar la solicitud')
      return false
    }
  }
}

export const ausenciaModal = new AusenciaModal()