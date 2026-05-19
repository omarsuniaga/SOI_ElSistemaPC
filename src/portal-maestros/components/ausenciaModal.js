import { AppModal } from '../../shared/components/AppModal.js';
import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { AppToast } from '../../shared/components/AppToast.js';
import { escHTML } from '../utils/portalUtils.js';
import '../styles/ausenciaModal.css';

const TIPO_AUSENCIA = [
  { value: 'enfermedad', label: 'Enfermedad' },
  { value: 'personal', label: 'Personal' },
  { value: 'capacitacion', label: 'Capacitación' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'otro', label: 'Otro' }
];

const URGENCIA_OPTS = [
  { value: 'baja', label: 'Baja', desc: 'Con anticipación' },
  { value: 'media', label: 'Media', desc: 'Necesaria' },
  { value: 'alta', label: 'Alta', desc: 'Urgente' }
];

class AusenciaModal {
  constructor() {
    this.maestro = null;
    this.step = 1; // Step 1-5 workflow
    this.state = {
      // Step 1: Duración y fechas
      duracionTipo: 'un_dia',
      fechaAusencia: null,
      fechaInicio: null,
      fechaFin: null,

      // Step 2: Clases afectadas (loaded)
      clasesAfectadas: [], // { claseId, className, sesionId, fecha, hora, salonId, maestroSuplente }

      // Step 3: Plan de recuperación por clase
      planRecuperacion: {}, // { claseId: { tipo: 'recuperar'|'tareas', ...config } }

      // Step 4: Admin
      tipoAusencia: null,
      urgencia: 'media',
      motivo: '',
      archivo: null,

      // Step 5: Documento final
      documentoGenerado: ''
    };
  }

  async open() {
    this.maestro = getMaestroLocal();
    if (!this.maestro) {
      AppToast.error('Debes estar logueado');
      return;
    }

    this.step = 1;
    this.state = {
      duracionTipo: 'un_dia',
      fechaAusencia: null,
      fechaInicio: null,
      fechaFin: null,
      clasesAfectadas: [],
      planRecuperacion: {},
      tipoAusencia: null,
      urgencia: 'media',
      motivo: '',
      archivo: null,
      documentoGenerado: ''
    };

    // Cargar todas las clases del maestro
    const { data: clases, error } = await supabase
      .from('clases')
      .select('id, nombre, maestro_principal_id, maestro_suplente_id')
      .or(`maestro_principal_id.eq.${this.maestro.id},maestro_suplente_id.eq.${this.maestro.id}`);

    if (error) {
      AppToast.error('Error cargando clases');
      return;
    }

    this.state.clasesDisponibles = clases || [];
    this.renderStep();
  }

  renderStep() {
    let body, saveText, onSave;

    if (this.step === 1) {
      body = this.renderStep1();
      saveText = 'Siguiente';
      onSave = () => this.validateStep1();
    } else if (this.step === 2) {
      body = this.renderStep2();
      saveText = 'Siguiente';
      onSave = () => this.loadStep2();
    } else if (this.step === 3) {
      body = this.renderStep3();
      saveText = 'Siguiente';
      onSave = () => this.validateStep3();
    } else if (this.step === 4) {
      body = this.renderStep4();
      saveText = 'Siguiente';
      onSave = () => this.validateStep4();
    } else if (this.step === 5) {
      body = this.renderStep5();
      saveText = 'Crear Solicitud';
      onSave = () => this.handleSubmit();
    }

    AppModal.open({
      title: `Solicitar Ausencia (Paso ${this.step}/5)`,
      size: 'lg',
      body,
      saveText,
      closeText: 'Cancelar',
      onSave,
      onShow: () => this.attachEvents()
    });
  }

  // ================== STEP 1: Duración y Fechas ==================
  renderStep1() {
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return `
      <form id="step1-form" class="pm-ausencia-form" novalidate>
        <div class="pm-form-section">
          <label class="pm-form-label">Duración de la Ausencia <span class="pm-required">*</span></label>
          <div style="display: flex; gap: 20px; margin-top: 12px;">
            <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px;">
              <input type="radio" name="duracionTipo" value="un_dia" ${this.state.duracionTipo === 'un_dia' ? 'checked' : ''}>
              <span>Un solo día</span>
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px;">
              <input type="radio" name="duracionTipo" value="varios_dias" ${this.state.duracionTipo === 'varios_dias' ? 'checked' : ''}>
              <span>Varios días (rango)</span>
            </label>
          </div>
        </div>

        ${this.state.duracionTipo === 'un_dia' ? `
          <div class="pm-form-section">
            <label class="pm-form-label">Fecha de Ausencia <span class="pm-required">*</span></label>
            <input type="date" id="fechaAusencia" value="${this.state.fechaAusencia || ''}"
              min="${today}" max="${maxDateStr}">
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="pm-form-section">
              <label class="pm-form-label">Desde <span class="pm-required">*</span></label>
              <input type="date" id="fechaInicio" value="${this.state.fechaInicio || ''}"
                min="${today}" max="${maxDateStr}">
            </div>
            <div class="pm-form-section">
              <label class="pm-form-label">Hasta <span class="pm-required">*</span></label>
              <input type="date" id="fechaFin" value="${this.state.fechaFin || ''}"
                min="${this.state.fechaInicio || today}" max="${maxDateStr}">
            </div>
          </div>
        `}
      </form>
    `;
  }

  validateStep1() {
    const form = document.getElementById('step1-form');
    const duracionTipo = form.elements.namedItem('duracionTipo').value;
    this.state.duracionTipo = duracionTipo;

    if (duracionTipo === 'un_dia') {
      const fecha = document.getElementById('fechaAusencia').value;
      if (!fecha) {
        AppToast.error('Debes seleccionar la fecha de ausencia');
        return;
      }
      this.state.fechaAusencia = fecha;
    } else {
      const inicio = document.getElementById('fechaInicio').value;
      const fin = document.getElementById('fechaFin').value;
      if (!inicio || !fin) {
        AppToast.error('Debes seleccionar el rango de fechas');
        return;
      }
      if (new Date(fin) < new Date(inicio)) {
        AppToast.error('La fecha final no puede ser anterior a la inicial');
        return;
      }
      this.state.fechaInicio = inicio;
      this.state.fechaFin = fin;
    }

    this.step = 2;
    this.renderStep();
  }

  // ================== STEP 2: Cargar Clases Afectadas ==================
  renderStep2() {
    return `
      <div style="padding: 20px; text-align: center;">
        <div style="font-size: 14px; color: var(--pm-text-muted);">Cargando tus clases...</div>
        <div class="pm-spinner" style="margin-top: 20px;"></div>
      </div>
    `;
  }

  async loadStep2() {
    // Determinar rango de fechas
    let fechaInicio, fechaFin;
    if (this.state.duracionTipo === 'un_dia') {
      fechaInicio = this.state.fechaAusencia;
      fechaFin = this.state.fechaAusencia;
    } else {
      fechaInicio = this.state.fechaInicio;
      fechaFin = this.state.fechaFin;
    }

    // Buscar sesiones del maestro en ese rango
    const { data: sesiones, error } = await supabase
      .from('sesiones_clase')
      .select(`
        id, fecha, hora_inicio, hora_fin, salon_id,
        clase:clases(id, nombre, maestro_principal_id, maestro_suplente_id)
      `)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);

    if (error) {
      AppToast.error('Error cargando clases');
      return;
    }

    // Filtrar clases del maestro (eres maestro principal o suplente)
    const clasesAfectadas = (sesiones || []).filter(s =>
      s.clase?.maestro_principal_id === this.maestro.id ||
      s.clase?.maestro_suplente_id === this.maestro.id
    );

    if (clasesAfectadas.length === 0) {
      AppToast.warning('No tienes clases en este período');
      this.step = 4; // Saltar al paso 4
    } else {
      this.state.clasesAfectadas = clasesAfectadas.map(s => ({
        claseId: s.clase.id,
        className: s.clase.nombre,
        sesionId: s.id,
        fecha: s.fecha,
        hora: s.hora_inicio,
        salonId: s.salon_id
      }));

      // Inicializar plan de recuperación
      this.state.planRecuperacion = {};
      this.state.clasesAfectadas.forEach(c => {
        this.state.planRecuperacion[c.claseId] = {
          tipo: 'recuperar',
          fechaRecuperacion: null,
          horaRecuperacion: null,
          salonRecuperacionId: null,
          suplente: null,
          tareasDescripcion: ''
        };
      });
    }

    this.step = 3;
    this.renderStep();
  }

  // ================== STEP 3: Plan de Recuperación por Clase ==================
  renderStep3() {
    return `
      <div class="pm-form-section">
        <div class="pm-divider" style="margin: 0 0 16px 0;"></div>
        <p style="margin: 0; color: var(--pm-text-muted); font-size: 14px; line-height: 1.6;">
          Para cada clase, elige si <strong style="color: var(--pm-text);">recuperarás</strong> la clase en otra fecha/hora, o <strong style="color: var(--pm-text);">asignarás tareas</strong> a un suplente.
        </p>
        <div class="pm-divider" style="margin: 16px 0 0 0;"></div>

        ${this.state.clasesAfectadas.map((clase, idx) => `
          <div id="clase-${clase.claseId}" class="pm-step-card">
            <h3 class="pm-step-card-title">
              ${escHTML(clase.className)}
              <span class="pm-badge pm-badge-primary" style="float: right; font-size: 11px;">
                ${clase.fecha}
              </span>
            </h3>

            <!-- Radio: Recuperar vs Tareas -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--pm-border); border-radius: 8px; background: var(--pm-surface); transition: all var(--pm-transition-base);"
                class="tipo-label-${clase.claseId}">
                <input type="radio" name="tipo-${clase.claseId}" value="recuperar"
                  ${this.state.planRecuperacion[clase.claseId]?.tipo === 'recuperar' ? 'checked' : ''}>
                <div>
                  <div style="font-weight: 600; font-size: 14px; color: var(--pm-text);">Recuperar</div>
                  <div style="font-size: 12px; color: var(--pm-text-muted);">En otra fecha/hora</div>
                </div>
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--pm-border); border-radius: 8px; background: var(--pm-surface); transition: all var(--pm-transition-base);"
                class="tipo-label-${clase.claseId}">
                <input type="radio" name="tipo-${clase.claseId}" value="tareas"
                  ${this.state.planRecuperacion[clase.claseId]?.tipo === 'tareas' ? 'checked' : ''}>
                <div>
                  <div style="font-weight: 600; font-size: 14px; color: var(--pm-text);">Tareas</div>
                  <div style="font-size: 12px; color: var(--pm-text-muted);">Con suplente</div>
                </div>
              </label>
            </div>

            <!-- Panel: Recuperar -->
            <div id="panel-recuperar-${clase.claseId}" class="pm-panel-recuperar" style="display: ${this.state.planRecuperacion[clase.claseId]?.tipo === 'recuperar' ? 'block' : 'none'};">
              <div class="pm-form-section">
                <label class="pm-form-label">
                  Fecha de Recuperación <span class="pm-required">*</span>
                </label>
                <input type="date" id="fecha-rec-${clase.claseId}"
                  value="${this.state.planRecuperacion[clase.claseId]?.fechaRecuperacion || ''}">
              </div>
              <div class="pm-form-section">
                <label class="pm-form-label">
                  Hora <span class="pm-required">*</span>
                </label>
                <input type="time" id="hora-rec-${clase.claseId}"
                  value="${this.state.planRecuperacion[clase.claseId]?.horaRecuperacion || ''}">
              </div>
              <div class="pm-form-section">
                <label class="pm-form-label">
                  Salón <span class="pm-required">*</span>
                </label>
                <select id="salon-rec-${clase.claseId}">
                  <option value="">-- Buscar disponibles --</option>
                </select>
                <button type="button" id="btn-buscar-salon-${clase.claseId}" class="btn-primary" style="width: 100%; margin-top: 8px;">
                  🔍 Buscar Salones Disponibles
                </button>
              </div>
            </div>

            <!-- Panel: Tareas -->
            <div id="panel-tareas-${clase.claseId}" class="pm-panel-tareas" style="display: ${this.state.planRecuperacion[clase.claseId]?.tipo === 'tareas' ? 'block' : 'none'};">
              <div class="pm-form-section">
                <label class="pm-form-label">
                  Maestro/Suplente <span class="pm-required">*</span>
                </label>
                <select id="suplente-${clase.claseId}">
                  <option value="">-- Seleccionar --</option>
                  <option value="auto">Auto-detectar (suplente de la clase)</option>
                </select>
              </div>
              <div class="pm-form-section">
                <label class="pm-form-label">
                  Actividades/Tareas <span class="pm-required">*</span>
                </label>
                <textarea id="tareas-${clase.claseId}" placeholder="Describe las tareas, ejercicios o actividades que el suplente debe dejar...">${this.state.planRecuperacion[clase.claseId]?.tareasDescripcion || ''}</textarea>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  validateStep3() {
    // Validar que cada clase tenga plan completo
    for (const clase of this.state.clasesAfectadas) {
      const plan = this.state.planRecuperacion[clase.claseId];

      if (plan.tipo === 'recuperar') {
        const fecha = document.getElementById(`fecha-rec-${clase.claseId}`).value;
        const hora = document.getElementById(`hora-rec-${clase.claseId}`).value;
        const salon = document.getElementById(`salon-rec-${clase.claseId}`).value;

        if (!fecha || !hora || !salon) {
          AppToast.error(`Completa la recuperación de ${clase.className}`);
          return;
        }

        plan.fechaRecuperacion = fecha;
        plan.horaRecuperacion = hora;
        plan.salonRecuperacionId = salon;
      } else if (plan.tipo === 'tareas') {
        const suplente = document.getElementById(`suplente-${clase.claseId}`).value;
        const tareas = document.getElementById(`tareas-${clase.claseId}`).value.trim();

        if (!suplente || !tareas) {
          AppToast.error(`Completa las tareas de ${clase.className}`);
          return;
        }

        plan.suplente = suplente === 'auto' ? null : suplente;
        plan.tareasDescripcion = tareas;
      }
    }

    this.step = 4;
    this.renderStep();
  }

  // ================== STEP 4: Admin (Tipo, Urgencia, Motivo) ==================
  renderStep4() {
    return `
      <form id="step4-form" class="pm-ausencia-form" novalidate>
        <div class="pm-form-section">
          <label class="pm-form-label">Tipo de Ausencia <span class="pm-required">*</span></label>
          <div class="pm-grid-responsive">
            ${TIPO_AUSENCIA.map(t => `
              <label style="cursor: pointer; padding: 12px; border: 1px solid var(--pm-border); border-radius: 8px; text-align: center; background: var(--pm-surface); transition: all var(--pm-transition-base);
                ${this.state.tipoAusencia === t.value ? 'background: var(--pm-primary-bg); border-color: var(--pm-primary);' : ''}" class="tipo-ausencia-label">
                <input type="radio" name="tipoAusencia" value="${t.value}" ${this.state.tipoAusencia === t.value ? 'checked' : ''} style="margin-bottom: 6px;">
                <div style="font-size: 13px; font-weight: 500; color: var(--pm-text);">${t.label}</div>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="pm-form-section">
          <label class="pm-form-label">Urgencia <span class="pm-required">*</span></label>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
            ${URGENCIA_OPTS.map(u => `
              <label style="cursor: pointer; padding: 12px; border: 1px solid var(--pm-border); border-radius: 8px; text-align: center; background: var(--pm-surface); transition: all var(--pm-transition-base);
                ${this.state.urgencia === u.value ? 'background: var(--pm-primary-bg); border-color: var(--pm-primary);' : ''}" class="urgencia-label">
                <input type="radio" name="urgencia" value="${u.value}" ${this.state.urgencia === u.value ? 'checked' : ''} style="margin-bottom: 6px;">
                <div style="font-size: 13px; font-weight: 600; color: var(--pm-text);">${u.label}</div>
                <div style="font-size: 11px; color: var(--pm-text-muted); margin-top: 4px;">${u.desc}</div>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="pm-form-section">
          <label class="pm-form-label">Motivo <span class="pm-required">*</span></label>
          <textarea id="motivo" placeholder="Describe el motivo de tu ausencia..." maxlength="500">${this.state.motivo}</textarea>
          <div class="pm-char-counter">
            <span id="char-count">0</span>/500
          </div>
        </div>

        <div class="pm-form-section">
          <label class="pm-form-label">Documento Soporte (Opcional)</label>
          <input type="file" id="archivo" accept=".pdf,.jpg,.jpeg,.png">
          <div class="pm-helper-text">PDF, JPG o PNG. Máximo 5MB.</div>
        </div>
      </form>
    `;
  }

  validateStep4() {
    const form = document.getElementById('step4-form');

    this.state.tipoAusencia = form.elements.namedItem('tipoAusencia').value;
    this.state.urgencia = form.elements.namedItem('urgencia').value;
    this.state.motivo = document.getElementById('motivo').value.trim();
    this.state.archivo = document.getElementById('archivo').files[0] || null;

    if (!this.state.tipoAusencia) {
      AppToast.error('Selecciona el tipo de ausencia');
      return;
    }
    if (!this.state.motivo) {
      AppToast.error('Describe el motivo de la ausencia');
      return;
    }

    this.step = 5;
    this.renderStep();
  }

  // ================== STEP 5: Generar Documento ==================
  renderStep5() {
    // Generar documento de texto
    const clasesTexto = this.state.clasesAfectadas
      .map(c => `${c.className} (${c.fecha})`)
      .join(', ');

    let detallesRecuperacion = [];
    for (const clase of this.state.clasesAfectadas) {
      const plan = this.state.planRecuperacion[clase.claseId];
      if (plan.tipo === 'recuperar') {
        detallesRecuperacion.push(`- ${clase.className}: ${plan.fechaRecuperacion} a las ${plan.horaRecuperacion}`);
      } else {
        const suplementeName = plan.suplente ? `${plan.suplente}` : 'suplente asignado';
        detallesRecuperacion.push(`- ${clase.className}: tareas delegadas a ${suplementeName}`);
      }
    }

    const documento = `Saludos cordiales, soy la profesora "${escHTML(this.maestro.nombre)}", el dia ${this.state.duracionTipo === 'un_dia' ? this.state.fechaAusencia : `${this.state.fechaInicio} al ${this.state.fechaFin}`} estaré faltandando a la clase de ese dia, ya que tengo ${escHTML(this.state.motivo)} y debo solicitar esta ausencia, para cubrir las clases ${clasesTexto} voy a delegar en el maestro suplente que haga la siguiente actividad:

${detallesRecuperacion.join('\n')}

Esta solicitud es de carácter ${this.state.urgencia}.`;

    this.state.documentoGenerado = documento;

    return `
      <div class="pm-two-cols">

        <!-- Vista previa -->
        <div>
          <h4 style="margin-top: 0; margin-bottom: 12px; color: var(--pm-text); font-size: 15px;">
            📄 Vista Previa del Documento
          </h4>
          <div class="pm-preview-box">
${escHTML(documento)}
          </div>
        </div>

        <!-- Acciones -->
        <div>
          <h4 style="margin-top: 0; margin-bottom: 12px; color: var(--pm-text); font-size: 15px;">
            ✉️ Envío por WhatsApp
          </h4>

          <button type="button" id="btn-copy-whatsapp" class="btn-whatsapp" style="width: 100%; margin-bottom: 12px;">
            📋 Copiar Documento
          </button>

          <div class="pm-info-box" style="margin-bottom: 16px;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: var(--pm-text); font-size: 13px;">
              📱 Selecciona Contacto:
            </p>
            <select id="contacto-whatsapp">
              <option value="">-- Seleccionar contacto --</option>
              <option value="director">👨‍💼 Director/Coordinador</option>
              <option value="rrhh">👥 Recursos Humanos</option>
              <option value="custom">📞 Otro número</option>
            </select>
            <input type="tel" id="numero-custom" placeholder="+58 XXX XXX XXXX"
              style="display: none; margin-top: 8px;">
          </div>

          <button type="button" id="btn-enviar-whatsapp" class="btn-primary" style="width: 100%; margin-bottom: 16px;">
            💬 Abrir WhatsApp
          </button>

          <div class="pm-helper-text" style="padding: 12px; background: var(--pm-surface-2); border-left: 3px solid var(--pm-warning); border-radius: 6px; font-size: 12px;">
            <strong style="color: var(--pm-text);">ℹ️ Cómo funciona:</strong>
            <ol style="margin: 8px 0 0 0; padding-left: 20px;">
              <li>Haz clic en "Copiar Documento"</li>
              <li>Selecciona un contacto</li>
              <li>Abre WhatsApp y pega el texto</li>
              <li>El documento se enviará al admin</li>
            </ol>
          </div>
        </div>
      </div>
    `;
  }

  // ================== Submit Handler ==================
  async handleSubmit() {
    try {
      // 1. Crear ausencia en BD
      const { data: ausencia, error: ausenciaError } = await supabase
        .from('ausencias_maestros')
        .insert({
          maestro_id: this.maestro.id,
          tipo: this.state.tipoAusencia,
          urgencia: this.state.urgencia,
          motivo: this.state.motivo,
          fecha_inicio: this.state.duracionTipo === 'un_dia' ? this.state.fechaAusencia : this.state.fechaInicio,
          fecha_fin: this.state.duracionTipo === 'un_dia' ? this.state.fechaAusencia : this.state.fechaFin,
          estado: 'pendiente',
          duracion_tipo: this.state.duracionTipo,
          notificar_director: true
        })
        .select()
        .single();

      if (ausenciaError) throw ausenciaError;

      // 2. Crear registro en ausencias_clases_afectadas
      const clasesAfectadasRecords = this.state.clasesAfectadas.map(clase => {
        const plan = this.state.planRecuperacion[clase.claseId];
        let actividadReemplazo = '';

        if (plan.tipo === 'recuperar') {
          actividadReemplazo = `Recuperación: ${plan.fechaRecuperacion} a las ${plan.horaRecuperacion}`;
        } else {
          actividadReemplazo = plan.tareasDescripcion;
        }

        return {
          ausencia_id: ausencia.id,
          clase_id: clase.claseId,
          actividad_reemplazo: actividadReemplazo
        };
      });

      const { error: clasesError } = await supabase
        .from('ausencias_clases_afectadas')
        .insert(clasesAfectadasRecords);

      if (clasesError) throw clasesError;

      // 3. Crear notificación para director
      await this.crearNotificacionDirector(ausencia.id);

      // 4. Subir archivo si existe
      if (this.state.archivo) {
        await this.uploadDocumento(ausencia.id);
      }

      AppToast.success('Solicitud de ausencia creada correctamente');
      AppModal.close();
    } catch (err) {
      console.error('Error:', err);
      AppToast.error(`Error al crear solicitud: ${err.message}`);
    }
  }

  async uploadDocumento(ausenciaId) {
    const file = this.state.archivo;
    const fileName = `ausencias/${Date.now()}_${this.maestro.id}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('academico')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('academico')
      .getPublicUrl(fileName);

    await supabase
      .from('ausencias_maestros')
      .update({ archivo_url: publicUrl })
      .eq('id', ausenciaId);
  }

  async crearNotificacionDirector(ausenciaId) {
    // Obtener director del maestro (o admin)
    const { data: maestro } = await supabase
      .from('maestros')
      .select('director_id')
      .eq('id', this.maestro.id)
      .single();

    if (!maestro?.director_id) return; // Sin director asignado

    await supabase
      .from('ausencias_notificaciones')
      .insert({
        ausencia_id: ausenciaId,
        director_id: maestro.director_id,
        tipo: 'director_alert',
        estado: 'pendiente'
      });
  }

  // ================== Event Handlers ==================
  attachEvents() {
    // Step 1: Toggle input fields based on duración
    const radios = document.querySelectorAll('input[name="duracionTipo"]');
    radios.forEach(r => {
      r.addEventListener('change', () => {
        this.state.duracionTipo = r.value;
        this.renderStep();
      });
    });

    // Step 3: Toggle recuperar/tareas panels
    this.state.clasesAfectadas.forEach(clase => {
      const radioGroup = document.querySelectorAll(`input[name="tipo-${clase.claseId}"]`);
      radioGroup.forEach(r => {
        r.addEventListener('change', (e) => {
          this.state.planRecuperacion[clase.claseId].tipo = e.target.value;
          document.getElementById(`panel-recuperar-${clase.claseId}`).style.display =
            e.target.value === 'recuperar' ? 'block' : 'none';
          document.getElementById(`panel-tareas-${clase.claseId}`).style.display =
            e.target.value === 'tareas' ? 'block' : 'none';
        });
      });

      // Botón buscar salones
      const btnBuscar = document.getElementById(`btn-buscar-salon-${clase.claseId}`);
      if (btnBuscar) {
        btnBuscar.addEventListener('click', () => this.buscarSalones(clase.claseId));
      }
    });

    // Step 4: Character counter
    const motivo = document.getElementById('motivo');
    if (motivo) {
      motivo.addEventListener('input', () => {
        document.getElementById('char-count').textContent = motivo.value.length;
      });
      document.getElementById('char-count').textContent = motivo.value.length;
    }

    // Step 5: WhatsApp actions
    const btnCopy = document.getElementById('btn-copy-whatsapp');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => this.copyToClipboard());
    }

    const contactoSelect = document.getElementById('contacto-whatsapp');
    if (contactoSelect) {
      contactoSelect.addEventListener('change', (e) => {
        document.getElementById('numero-custom').style.display =
          e.target.value === 'custom' ? 'block' : 'none';
      });
    }

    const btnEnviar = document.getElementById('btn-enviar-whatsapp');
    if (btnEnviar) {
      btnEnviar.addEventListener('click', () => this.enviarWhatsApp());
    }
  }

  async buscarSalones(claseId) {
    const fechaInput = document.getElementById(`fecha-rec-${claseId}`);
    const horaInput = document.getElementById(`hora-rec-${claseId}`);
    const fecha = fechaInput.value;
    const hora = horaInput.value;

    if (!fecha || !hora) {
      AppToast.warning('Selecciona fecha y hora primero');
      return;
    }

    // Buscar sesiones en esa fecha/hora
    const { data: sesiones, error } = await supabase
      .from('sesiones_clase')
      .select('salon_id')
      .eq('fecha', fecha)
      .overlaps('hora_inicio', hora); // Buscar conflictos de horario

    if (error) {
      AppToast.error('Error buscando salones');
      return;
    }

    // Salones ocupados
    const salonesOcupados = new Set(sesiones?.map(s => s.salon_id) || []);

    // Obtener todos los salones
    const { data: salones } = await supabase
      .from('salones')
      .select('id, nombre')
      .order('nombre');

    const salonSelect = document.getElementById(`salon-rec-${claseId}`);
    salonSelect.innerHTML = '<option value="">-- Seleccionar --</option>';

    (salones || []).forEach(s => {
      const disabled = salonesOcupados.has(s.id);
      const option = document.createElement('option');
      option.value = s.id;
      option.textContent = `${s.nombre}${disabled ? ' (ocupado)' : ' ✓'}`;
      option.disabled = disabled;
      salonSelect.appendChild(option);
    });

    AppToast.success(`${salones?.length - salonesOcupados.size || 0} salones disponibles`);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.state.documentoGenerado)
      .then(() => AppToast.success('Texto copiado al portapapeles'))
      .catch(() => AppToast.error('Error al copiar'));
  }

  enviarWhatsApp() {
    const contacto = document.getElementById('contacto-whatsapp').value;
    const numeroCustom = document.getElementById('numero-custom').value;

    let numero;
    if (contacto === 'director') {
      numero = '584241234567'; // Placeholder
    } else if (contacto === 'rrhh') {
      numero = '584240000000'; // Placeholder
    } else if (contacto === 'custom') {
      numero = numeroCustom.replace(/\D/g, '');
    }

    if (!numero) {
      AppToast.warning('Selecciona un contacto');
      return;
    }

    // Copiar al portapapeles
    navigator.clipboard.writeText(this.state.documentoGenerado);

    // Abrir WhatsApp
    const mensajeEncode = encodeURIComponent(this.state.documentoGenerado.substring(0, 1024));
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numero}&text=${mensajeEncode}`;
    window.open(urlWhatsApp, '_blank');

    AppToast.info('El texto ha sido copiado. WhatsApp se abrirá en tu navegador.');
  }
}

export const ausenciaModal = new AusenciaModal();

export function openAusenciaModal() {
  ausenciaModal.open();
}
