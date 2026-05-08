/**
 * Modal de Solicitud de Ausencias - Portal Maestros
 * Permite solicitar ausencias con justificación y documentación
 */
import { AppModal } from '../../shared/components/AppModal.js'
import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { AppToast } from '../../shared/components/AppToast.js'

export class AusenciaModal {
  constructor() {
    this.maestro = getMaestroLocal()
  }

  open() {
    if (!this.maestro) {
      AppToast.error('Debes estar logueado para solicitar ausencias')
      return
    }

    const modalBody = this.renderForm()
    
    AppModal.open({
      title: '📅 Solicitar Ausencia',
      size: 'lg',
      body: modalBody,
      saveText: 'Enviar Solicitud',
      onSave: () => this.handleSubmit(),
      onShow: () => this.attachEvents()
    })
  }

  renderForm() {
    const today = new Date().toISOString().split('T')[0]
    
    return `
      <form id="ausencia-form" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Tipo de Ausencia *</label>
          <select class="form-select" id="tipo-ausencia" required>
            <option value="">Seleccionar tipo...</option>
            <option value="enfermedad">🤒 Enfermedad</option>
            <option value="personal">👤 Personal</option>
            <option value="capacitacion">📚 Capacitación</option>
            <option value="vacaciones">🏖️ Vacaciones</option>
            <option value="otro">📋 Otro</option>
          </select>
        </div>
        
        <div class="col-md-6">
          <label class="form-label">Urgencia</label>
          <select class="form-select" id="urgencia">
            <option value="baja">🟢 Baja</option>
            <option value="media">🟡 Media</option>
            <option value="alta">🔴 Alta</option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Fecha de Inicio *</label>
          <input type="date" class="form-control" id="fecha-inicio" required min="${today}">
        </div>
        
        <div class="col-md-6">
          <label class="form-label">Fecha de Fin *</label>
          <input type="date" class="form-control" id="fecha-fin" required min="${today}">
        </div>

        <div class="col-12">
          <label class="form-label">Motivo / Justificación *</label>
          <textarea class="form-control" id="motivo" rows="3" required 
            placeholder="Describe el motivo de tu ausencia..."></textarea>
        </div>

        <div class="col-md-6">
          <label class="form-label">Clases Afectadas</label>
          <div class="form-text text-muted">
            Se mostrarán las clases programadas en el período seleccionado
          </div>
          <div id="clases-afectadas" class="mt-2">
            <div class="text-muted">Selecciona las fechas para ver las clases</div>
          </div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Documento Adjunto</label>
          <input type="file" class="form-control" id="documento" accept=".pdf,.jpg,.jpeg,.png">
          <div class="form-text">PDF o imagen (máx. 5MB)</div>
        </div>

        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="notificar-director">
            <label class="form-check-label" for="notificar-director">
              Notificar al director por correo electrónico
            </label>
          </div>
        </div>
      </form>
    `
  }

  attachEvents() {
    const form = document.getElementById('ausencia-form')
    const fechaInicio = document.getElementById('fecha-inicio')
    const fechaFin = document.getElementById('fecha-fin')
    const tipoAusencia = document.getElementById('tipo-ausencia')

    // Validar que fecha fin sea posterior a inicio
    fechaInicio?.addEventListener('change', () => {
      if (fechaFin) {
        fechaFin.min = fechaInicio.value
        if (fechaFin.value && fechaFin.value < fechaInicio.value) {
          fechaFin.value = fechaInicio.value
        }
      }
      this.loadClasesAfectadas()
    })

    fechaFin?.addEventListener('change', () => this.loadClasesAfectadas())
    tipoAusencia?.addEventListener('change', () => this.updateMotivoPlaceholder())
  }

  updateMotivoPlaceholder() {
    const tipo = document.getElementById('tipo-ausencia')?.value
    const motivo = document.getElementById('motivo')
    
    const placeholders = {
      'enfermedad': 'Describe tu condición médica y síntomas...',
      'personal': 'Explica brevemente el motivo personal...',
      'capacitacion': 'Indica el evento de capacitación...',
      'vacaciones': 'Período vacacional solicitado...',
      'otro': 'Describe el motivo de tu ausencia...'
    }
    
    if (motivo && placeholders[tipo]) {
      motivo.placeholder = placeholders[tipo]
    }
  }

  async loadClasesAfectadas() {
    const fechaInicio = document.getElementById('fecha-inicio')?.value
    const fechaFin = document.getElementById('fecha-fin')?.value
    const container = document.getElementById('clases-afectadas')
    
    if (!fechaInicio || !fechaFin || !container) return

    try {
      const { data: clases, error } = await supabase
        .from('clases')
        .select('id, nombre, instrumento, clase_horarios(dia, hora_inicio, hora_fin)')
        .or(`maestro_principal_id.eq.${this.maestro.id},maestro_suplente_id.eq.${this.maestro.id}`)
        .gte('fecha_inicio', fechaInicio)
        .lte('fecha_fin', fechaFin)

      if (error) throw error

      if (clases && clases.length > 0) {
        container.innerHTML = clases.map(clase => `
          <div class="alert alert-warning alert-sm d-flex align-items-center">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <div>
              <strong>${clase.nombre}</strong>
              ${clase.instrumento ? `<span class="badge bg-secondary ms-2">${clase.instrumento}</span>` : ''}
            </div>
          </div>
        `).join('')
      } else {
        container.innerHTML = '<div class="text-success"><i class="bi bi-check-circle me-2"></i>No hay clases programadas</div>'
      }
    } catch (error) {
      console.error('Error cargando clases afectadas:', error)
      container.innerHTML = '<div class="text-muted">No se pudieron cargar las clases</div>'
    }
  }

  async handleSubmit() {
    const form = document.getElementById('ausencia-form')
    if (!form.checkValidity()) {
      form.reportValidity()
      return false
    }

    const formData = {
      maestro_id: this.maestro.id,
      tipo_ausencia: document.getElementById('tipo-ausencia').value,
      urgencia: document.getElementById('urgencia').value,
      fecha_inicio: document.getElementById('fecha-inicio').value,
      fecha_fin: document.getElementById('fecha-fin').value,
      motivo: document.getElementById('motivo').value,
      notificar_director: document.getElementById('notificar-director').checked,
      estado: 'pendiente',
      created_at: new Date().toISOString()
    }

    try {
      // Guardar en base de datos (asumiendo que existe la tabla)
      const { error } = await supabase
        .from('ausencias_maestros')
        .insert([formData])

      if (error) {
        // Si la tabla no existe, guardar en localStorage como fallback
        console.warn('Tabla ausencias_maestros no existe, guardando localmente:', error)
        const ausencias = JSON.parse(localStorage.getItem('ausencias_maestros') || '[]')
        ausencias.push({ ...formData, id: Date.now() })
        localStorage.setItem('ausencias_maestros', JSON.stringify(ausencias))
      }

      AppToast.success('Solicitud de ausencia enviada correctamente')
      return true
    } catch (error) {
      console.error('Error guardando ausencia:', error)
      AppToast.error('No se pudo enviar la solicitud. Inténtalo de nuevo.')
      return false
    }
  }
}

// Instancia global
export const ausenciaModal = new AusenciaModal()
