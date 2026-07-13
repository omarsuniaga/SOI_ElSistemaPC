import { escapeHTML, isValidEmail } from '../utils/alumnosUtils.js'
import { normalizePhone } from '../../../shared/utils/phoneUtils.js'
import { PARENTESCOS } from '../api/alumnosApi.js'

export const SECTIONS = {
  personal: [
    { key: 'nombre_completo', label: 'Nombre completo' },
    { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
    { key: 'genero', label: 'Género', type: 'select', options: [{ v: '', l: '—' }, { v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }, { v: 'O', l: 'Otro' }, { v: 'N', l: 'No binario' }] },
    { key: 'nacionalidad', label: 'Nacionalidad' },
    { key: 'tiene_pasaporte', label: 'Tiene pasaporte', type: 'checkbox' },
    { key: 'sabe_leer', label: 'Sabe leer', type: 'checkbox' },
    { key: 'sabe_escribir', label: 'Sabe escribir', type: 'checkbox' },
    { key: 'como_se_entero', label: 'Cómo se enteró' },
    { key: 'municipio_residencia', label: 'Municipio' },
    { key: 'sector_calle_numero', label: 'Sector / Calle / Número' },
    { key: 'direccion', label: 'Dirección completa', type: 'textarea' },
    { key: 'ubicacion_maps_url', label: 'URL Google Maps' },
    { key: 'activo', label: 'Alumno activo', type: 'checkbox' },
  ],
  madre: [
    { key: 'madre_nombre', label: 'Nombre' },
    { key: 'madre_cedula', label: 'Cédula' },
    { key: 'madre_tlf_whatsapp', label: 'Teléfono / WhatsApp', type: 'phone' },
  ],
  padre: [
    { key: 'padre_nombre', label: 'Nombre' },
    { key: 'padre_cedula', label: 'Cédula' },
    { key: 'padre_tlf_whatsapp', label: 'Teléfono / WhatsApp', type: 'phone' },
  ],
  representante: [
    { key: 'representante_nombre', label: 'Nombre' },
    { key: 'representante_parentesco', label: 'Parentesco' },
    { key: 'representante_cedula', label: 'Cédula' },
    { key: 'representante_tlf', label: 'Teléfono', type: 'phone' },
    { key: 'correo_representante', label: 'Correo electrónico' },
    { key: 'otro_responsable_nombre', label: 'Otro responsable — Nombre' },
    { key: 'otro_responsable_cedula', label: 'Otro responsable — Cédula' },
    { key: 'otro_responsable_tlf', label: 'Otro responsable — Teléfono', type: 'phone' },
    { key: 'contacto_emergencia_nombre', label: 'Emergencia — Nombre' },
    { key: 'contacto_emergencia_telefono', label: 'Emergencia — Teléfono', type: 'phone' },
    { key: 'beneficiario_subsidio_estado', label: 'Beneficiario subsidio', type: 'checkbox' },
    { key: 'subsidio_descripcion', label: 'Descripción subsidio', type: 'textarea' },
    { key: 'apoyo_actividades', label: 'Apoyo en actividades', type: 'textarea' },
  ],
  salud: [
    { key: 'tiene_alergias', label: 'Tiene alergias', type: 'checkbox' },
    { key: 'alergias_descripcion', label: 'Descripción alergias', type: 'textarea' },
    { key: 'tiene_condicion_transmisible', label: 'Tiene condición transmisible', type: 'checkbox' },
    { key: 'condicion_transmisible_desc', label: 'Descripción condición', type: 'textarea' },
    { key: 'tiene_alergia_medicamento', label: 'Tiene alergia a medicamento', type: 'checkbox' },
    { key: 'alergia_medicamento_desc', label: 'Descripción alergia medicamento', type: 'textarea' },
    { key: 'impedimento_social', label: 'Impedimento social', type: 'checkbox' },
    { key: 'problemas_conducta', label: 'Problemas de conducta' },
    { key: 'centro_estudios', label: 'Centro de estudios' },
    { key: 'grado_nivel', label: 'Grado / Nivel' },
    { key: 'padres_en_vida', label: 'Padres en vida' },
  ],
  musical: [
    { key: 'instrumento_principal', label: 'Instrumento principal' },
    { key: 'nivel_actual', label: 'Nivel actual' },
    { key: 'tiene_conocimientos_musicales', label: 'Tiene conocimientos musicales', type: 'checkbox' },
    { key: 'instrumento_previo', label: 'Instrumento previo' },
    { key: 'nivel_lectura_musical', label: 'Nivel de lectura musical' },
    { key: 'interes_musical', label: 'Interés musical' },
    { key: 'instrumento_interes', label: 'Instrumento de interés' },
    { key: 'sentimiento_musica_clasica', label: 'Sentimiento hacia música clásica', type: 'textarea' },
    { key: 'sentimiento_aprender_instrumento', label: 'Sentimiento al aprender instrumento', type: 'textarea' },
    { key: 'aspiracion_instrumento', label: 'Aspiración con el instrumento', type: 'textarea' },
    { key: 'musico_favorito', label: 'Músico favorito' },
    { key: 'preferencia_aprendizaje_musical', label: 'Preferencia de aprendizaje', type: 'textarea' },
    { key: 'por_que_unirse', label: 'Por qué unirse', type: 'textarea' },
    { key: 'autoriza_fotos_redes', label: 'Autoriza fotos en redes', type: 'checkbox' },
  ],
}

export class AlumnoForm {
  /**
   * @param {Object} props
   * @param {Object} [props.alumno] - Datos originales del alumno
   * @param {string} [props.section] - Sección específica (personal, madre, padre, etc.)
   */
  constructor(props = {}) {
    this.alumno = props.alumno || {}
    this.section = props.section || null
    this.initialValues = {}
    this._saveInitialValues()
  }

  _saveInitialValues() {
    if (this.section) {
      const fields = SECTIONS[this.section] || []
      for (const field of fields) {
        this.initialValues[field.key] = this.alumno[field.key] ?? null
      }
    } else {
      // Campos de la vista compacta
      this.initialValues = {
        nombre: this.alumno.nombre || '',
        email: this.alumno.email || '',
        telefono: this.alumno.telefono || '',
        cedula: this.alumno.cedula || '',
        fecha_nacimiento: this.alumno.fecha_nacimiento || '',
        genero: this.alumno.genero || '',
        instrumento: this.alumno.instrumento || '',
        direccion: this.alumno.direccion || '',
        contacto_emergencia_nombre: this.alumno.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: this.alumno.contacto_emergencia_telefono || '',
        contacto_emergencia_parentesco: this.alumno.contacto_emergencia_parentesco || '',
        familiar_nombre: this.alumno.familiar_nombre || '',
        familiar_telefono: this.alumno.familiar_telefono || '',
        familiar_parentesco: this.alumno.familiar_parentesco || '',
        condiciones_medicas: this.alumno.condiciones_medicas || '',
        alergias: this.alumno.alergias || '',
        medicamentos: this.alumno.medicamentos || '',
        is_active: this.alumno.is_active !== false,
      }
    }
  }

  isDirty(container) {
    if (!container) return false

    if (this.section) {
      const fields = SECTIONS[this.section] || []
      for (const field of fields) {
        const el = container.querySelector(`[name="${field.key}"]`)
        if (!el) continue

        let currentVal
        if (field.type === 'checkbox') {
          currentVal = el.checked
        } else {
          currentVal = el.value.trim()
        }

        const initialVal = this.initialValues[field.key]
        const cleanInitial = (initialVal === null || initialVal === undefined) ? '' : String(initialVal)
        const cleanCurrent = (currentVal === null || currentVal === undefined) ? '' : String(currentVal)

        if (field.type === 'checkbox') {
          const initBool = !!initialVal
          if (currentVal !== initBool) return true
        } else {
          if (cleanCurrent !== cleanInitial) return true
        }
      }
      return false
    }

    // Comparación para la vista compacta
    const mapping = [
      { id: 'modal-nombre', key: 'nombre', transform: v => v.trim() },
      { id: 'modal-email', key: 'email', transform: v => v.trim().toLowerCase() || '' },
      { id: 'modal-telefono', key: 'telefono', transform: v => v.trim() },
      { id: 'modal-cedula', key: 'cedula', transform: v => v.trim() || '' },
      { id: 'modal-instrumento', key: 'instrumento', transform: v => v.trim() },
      { id: 'modal-direccion', key: 'direccion', transform: v => v.trim() || '' },
      { id: 'modal-contacto-emergencia-nombre', key: 'contacto_emergencia_nombre', transform: v => v.trim() || '' },
      { id: 'modal-contacto-emergencia-telefono', key: 'contacto_emergencia_telefono', transform: v => v.trim() || '' },
      { id: 'modal-contacto-emergencia-parentesco', key: 'contacto_emergencia_parentesco', transform: v => v || '' },
      { id: 'modal-familiar-nombre', key: 'familiar_nombre', transform: v => v.trim() || '' },
      { id: 'modal-familiar-telefono-input', key: 'familiar_telefono', transform: v => v.trim() || '' },
      { id: 'modal-familiar-parentesco-input', key: 'familiar_parentesco', transform: v => v || '' },
      { id: 'modal-condiciones-medicas', key: 'condiciones_medicas', transform: v => v.trim() || '' },
      { id: 'modal-alergias', key: 'alergias', transform: v => v.trim() || '' },
      { id: 'modal-medicamentos', key: 'medicamentos', transform: v => v.trim() || '' },
    ]

    for (const { id, key, transform } of mapping) {
      const el = container.querySelector('#' + id)
      if (!el) continue
      const current = transform(el.value || '')
      const orig = this.initialValues[key] || ''
      if (current !== orig) return true
    }

    const esActivoEl = container.querySelector('#modal-esActivo')
    if (esActivoEl) {
      const orig = this.initialValues.is_active !== false
      if (esActivoEl.checked !== orig) return true
    }

    return false
  }

  validate(container) {
    if (!container) return { valid: false, errors: { form: 'Contenedor no provisto' } }

    const errors = {}

    if (this.section) {
      // En edición seccional, validamos según tipo de campo
      const fields = SECTIONS[this.section] || []
      for (const field of fields) {
        const el = container.querySelector(`[name="${field.key}"]`)
        if (!el) continue

        const val = el.value.trim()
        if (field.key === 'nombre_completo' && !val) {
          errors.nombre_completo = 'El nombre completo es obligatorio'
        }
        if (field.key === 'correo_representante' && val && !isValidEmail(val)) {
          errors.correo_representante = 'El correo no tiene un formato válido'
        }
      }
      return {
        valid: Object.keys(errors).length === 0,
        errors,
        data: this.collect(container)
      }
    }

    // Validación formulario completo
    const nombreEl = container.querySelector('#modal-nombre')
    const emailEl = container.querySelector('#modal-email')
    const telefonoEl = container.querySelector('#modal-telefono')
    const instrumentoEl = container.querySelector('#modal-instrumento')

    const nombre = nombreEl ? nombreEl.value.trim() : ''
    const email = emailEl ? emailEl.value.trim().toLowerCase() : ''
    const telefono = telefonoEl ? telefonoEl.value.trim() : ''
    const instrumento = instrumentoEl ? instrumentoEl.value.trim() : ''

    if (!nombre) errors.nombre = 'El nombre es obligatorio'
    if (email && !isValidEmail(email)) errors.email = 'El email no tiene un formato válido'
    if (!instrumento) errors.instrumento = 'El instrumento es obligatorio'
    if (!telefono) errors.telefono = 'El teléfono es obligatorio'

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      data: this.collect(container)
    }
  }

  collect(container) {
    if (!container) return {}

    if (this.section) {
      const fields = SECTIONS[this.section] || []
      const data = {}
      for (const field of fields) {
        // Ignorar campos ausentes en el formulario o virtuales
        const el = container.querySelector(`[name="${field.key}"]`)
        if (!el) continue

        if (field.type === 'checkbox') {
          data[field.key] = el.checked
        } else {
          const val = el.value.trim()
          data[field.key] = val === '' ? null : val
        }
      }
      return data
    }

    // Colectar del formulario completo
    const nombre = container.querySelector('#modal-nombre').value.trim()
    const email = container.querySelector('#modal-email').value.trim().toLowerCase()
    const telefono = container.querySelector('#modal-telefono').value.trim()
    const cedula = container.querySelector('#modal-cedula').value.trim()
    const fechaNacimiento = container.querySelector('#modal-fechaNacimiento').value
    const genero = container.querySelector('#modal-genero').value
    const instrumento = container.querySelector('#modal-instrumento').value.trim()
    const direccion = container.querySelector('#modal-direccion').value.trim()

    const familiarNombre = container.querySelector('#modal-familiar-nombre').value.trim()
    const familiarTelefono = container.querySelector('#modal-familiar-telefono-input').value.trim() || telefono
    const familiarParentesco = container.querySelector('#modal-familiar-parentesco-input').value
    const esActivo = container.querySelector('#modal-esActivo').checked

    return {
      nombre,
      email: email || null,
      telefono: normalizePhone(telefono) || telefono,
      cedula: cedula || null,
      fecha_nacimiento: fechaNacimiento || null,
      genero: genero || null,
      instrumento,
      direccion: direccion || null,
      is_active: esActivo,
      familiar_nombre: familiarNombre || null,
      familiar_telefono: normalizePhone(familiarTelefono) || familiarTelefono || null,
      familiar_parentesco: familiarParentesco || null,
      contacto_emergencia_nombre: container.querySelector('#modal-contacto-emergencia-nombre').value.trim() || null,
      contacto_emergencia_telefono: normalizePhone(container.querySelector('#modal-contacto-emergencia-telefono').value.trim()) || container.querySelector('#modal-contacto-emergencia-telefono').value.trim() || null,
      contacto_emergencia_parentesco: container.querySelector('#modal-contacto-emergencia-parentesco').value || null,
      condiciones_medicas: container.querySelector('#modal-condiciones-medicas').value.trim() || null,
      alergias: container.querySelector('#modal-alergias').value.trim() || null,
      medicamentos: container.querySelector('#modal-medicamentos').value.trim() || null,
    }
  }

  render() {
    if (this.section) {
      const fields = SECTIONS[this.section] || []
      return `<form id="edit-form">${fields.map(f => this._renderField(f)).join('')}</form>`
    }

    return this._renderFullForm()
  }

  _renderField(field) {
    const v = this.alumno[field.key]
    const id = `modal-field-${field.key}`

    if (field.type === 'checkbox') {
      const checked = (v === true || v === 'true' || v === 1 || v === '1') ? 'checked' : ''
      return `
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="${id}" name="${escapeHTML(field.key)}" ${checked}>
          <label class="form-check-label" for="${id}">${escapeHTML(field.label)}</label>
        </div>
      `
    }

    if (field.type === 'textarea') {
      return `
        <div class="mb-3">
          <label class="form-label fw-semibold" for="${id}">${escapeHTML(field.label)}</label>
          <textarea class="form-control" id="${id}" name="${escapeHTML(field.key)}" rows="3">${v != null ? escapeHTML(String(v)) : ''}</textarea>
        </div>
      `
    }

    if (field.type === 'select') {
      const opts = (field.options || []).map(o =>
        `<option value="${escapeHTML(o.v)}" ${v === o.v ? 'selected' : ''}>${escapeHTML(o.l)}</option>`
      ).join('')
      return `
        <div class="mb-3">
          <label class="form-label fw-semibold" for="${id}">${escapeHTML(field.label)}</label>
          <select class="form-select" id="${id}" name="${escapeHTML(field.key)}">${opts}</select>
        </div>
      `
    }

    if (field.type === 'date') {
      const dateVal = v ? String(v).slice(0, 10) : ''
      return `
        <div class="mb-3">
          <label class="form-label fw-semibold" for="${id}">${escapeHTML(field.label)}</label>
          <input type="date" class="form-control" id="${id}" name="${escapeHTML(field.key)}" value="${escapeHTML(dateVal)}">
        </div>
      `
    }

    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${id}">${escapeHTML(field.label)}</label>
        <input type="text" class="form-control" id="${id}" name="${escapeHTML(field.key)}" value="${v != null ? escapeHTML(String(v)) : ''}">
      </div>
    `
  }

  _getParentescoOptions(selectedValue = '') {
    return PARENTESCOS.map(p =>
      `<option value="${p.value}" ${p.value === selectedValue ? 'selected' : ''}>${p.label}</option>`
    ).join('')
  }

  _renderFullForm() {
    const a = this.alumno
    return `<form class="row g-2">
      <div class="col-12">
        <label class="form-label-compact">Nombre Completo *</label>
        <input type="text" class="form-control input-dense" id="modal-nombre" maxlength="100" required placeholder="Juan Pérez" autocomplete="off" value="${escapeHTML(a.nombre || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Teléfono (WhatsApp) *</label>
        <input type="tel" class="form-control input-dense" id="modal-telefono" required placeholder="+58 412 555 1234" autocomplete="off" value="${escapeHTML(a.telefono || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Email</label>
        <input type="email" class="form-control input-dense" id="modal-email" maxlength="100" placeholder="representante@ejemplo.com" autocomplete="off" value="${escapeHTML(a.email || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Cédula del Alumno</label>
        <input type="text" class="form-control input-dense" id="modal-cedula" maxlength="20" placeholder="12345678" autocomplete="off" value="${escapeHTML(a.cedula || '')}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Fecha de Nacimiento</label>
        <input type="date" class="form-control input-dense" id="modal-fechaNacimiento" value="${a.fecha_nacimiento || ''}">
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Género</label>
        <select class="form-select input-dense" id="modal-genero">
          <option value="" ${!a.genero ? 'selected' : ''}>No especificado</option>
          <option value="M" ${a.genero === 'M' ? 'selected' : ''}>Masculino</option>
          <option value="F" ${a.genero === 'F' ? 'selected' : ''}>Femenino</option>
          <option value="O" ${a.genero === 'O' ? 'selected' : ''}>Otro</option>
          <option value="N" ${a.genero === 'N' ? 'selected' : ''}>No binario</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label-compact">Instrumento *</label>
        <input type="text" class="form-control input-dense" id="modal-instrumento" required maxlength="50" placeholder="Violín, Piano..." autocomplete="off" value="${escapeHTML(a.instrumento || '')}">
      </div>
      <div class="col-12">
        <label class="form-label-compact">Dirección</label>
        <input type="text" class="form-control input-dense" id="modal-direccion" maxlength="200" placeholder="Dirección completa" autocomplete="off" value="${escapeHTML(a.direccion || '')}">
      </div>
      
      <div class="col-12 mt-3">
        <div class="border rounded p-2 bg-body-tertiary">
          <h6 class="mb-2"><i class="bi bi-person-exclamation me-1"></i>Contacto de Emergencia</h6>
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label-compact">Nombre</label>
              <input type="text" class="form-control input-dense" id="modal-contacto-emergencia-nombre" placeholder="Nombre contacto" value="${escapeHTML(a.contacto_emergencia_nombre || '')}">
            </div>
            <div class="col-md-4">
              <label class="form-label-compact">Teléfono</label>
              <input type="tel" class="form-control input-dense" id="modal-contacto-emergencia-telefono" placeholder="+58 412 555 1234" value="${escapeHTML(a.contacto_emergencia_telefono || '')}">
            </div>
            <div class="col-md-4">
              <label class="form-label-compact">Parentesco</label>
              <select class="form-select input-dense" id="modal-contacto-emergencia-parentesco">
                ${this._getParentescoOptions(a.contacto_emergencia_parentesco)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="border rounded p-2 bg-body-tertiary">
          <h6 class="mb-2"><i class="bi bi-people me-1"></i>Datos del Familiar</h6>
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label-compact">Nombre</label>
              <input type="text" class="form-control input-dense" id="modal-familiar-nombre" placeholder="Nombre familiar" value="${escapeHTML(a.familiar_nombre || '')}">
            </div>
            <div class="col-md-4">
              <label class="form-label-compact">Teléfono</label>
              <input type="tel" class="form-control input-dense" id="modal-familiar-telefono-input" placeholder="+58 412 555 1234" value="${escapeHTML(a.familiar_telefono || '')}">
            </div>
            <div class="col-md-4">
              <label class="form-label-compact">Parentesco</label>
              <select class="form-select input-dense" id="modal-familiar-parentesco-input">
                ${this._getParentescoOptions(a.familiar_parentesco)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="border rounded p-2 bg-warning bg-opacity-10">
          <h6 class="mb-2"><i class="bi bi-heart-pulse me-1"></i>Información Médica</h6>
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label-compact">Condiciones médicas</label>
              <textarea class="form-control input-dense" id="modal-condiciones-medicas" rows="2" placeholder="Diabetes, epilepsia, etc.">${escapeHTML(a.condiciones_medicas || '')}</textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label-compact">Alergias</label>
              <textarea class="form-control input-dense" id="modal-alergias" rows="2" placeholder="Alimentos, medicamentos, etc.">${escapeHTML(a.alergias || '')}</textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label-compact">Medicamentos</label>
              <textarea class="form-control input-dense" id="modal-medicamentos" rows="2" placeholder="Medicamentos actuales">${escapeHTML(a.medicamentos || '')}</textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="modal-esActivo" ${a.is_active !== false ? 'checked' : ''}>
          <label class="form-check-label" for="modal-esActivo">Alumno activo</label>
        </div>
      </div>
    </form>`
  }
}
