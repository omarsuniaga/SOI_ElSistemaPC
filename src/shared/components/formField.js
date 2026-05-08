/**
 * Shared Form Field Component
 * Crea campos de formulario reutilizables con validación inline
 */

export class FormField {
  /**
   * Crea un campo de input completo
   * @param {Object} options
   * @returns {string} HTML del campo
   */
  static input({ id, label, type = 'text', value = '', placeholder = '', required = false, maxlength, helpText = '', errorText = '' }) {
    return `
      <div class="mb-3">
        <label for="${id}" class="form-label">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>
        <input type="${type}" class="form-control" id="${id}" name="${id}"
               value="${this.escape(value)}" placeholder="${this.escape(placeholder)}"
               ${required ? 'required' : ''} ${maxlength ? `maxlength="${maxlength}"` : ''}
               autocomplete="off">
        ${helpText ? `<small class="form-text text-muted">${this.escape(helpText)}</small>` : ''}
        ${errorText ? `<div class="invalid-feedback d-block small text-danger">${this.escape(errorText)}</div>` : ''}
      </div>
    `
  }

  /**
   * Crea un campo select
   */
  static select({ id, label, options = [], value = '', required = false, helpText = '' }) {
    const opts = options.map(opt => {
      const val = typeof opt === 'string' ? opt : opt.value
      const txt = typeof opt === 'string' ? opt : opt.label
      return `<option value="${this.escape(val)}"${val === value ? ' selected' : ''}>${this.escape(txt)}</option>`
    }).join('')

    return `
      <div class="mb-3">
        <label for="${id}" class="form-label">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>
        <select class="form-select" id="${id}" name="${id}" ${required ? 'required' : ''}>
          <option value="">Seleccionar...</option>
          ${opts}
        </select>
        ${helpText ? `<small class="form-text text-muted">${this.escape(helpText)}</small>` : ''}
      </div>
    `
  }

  /**
   * Crea un textarea
   */
  static textarea({ id, label, value = '', placeholder = '', required = false, rows = 3, maxlength, helpText = '' }) {
    return `
      <div class="mb-3">
        <label for="${id}" class="form-label">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>
        <textarea class="form-control" id="${id}" name="${id}" rows="${rows}"
                  placeholder="${this.escape(placeholder)}" ${required ? 'required' : ''}
                  ${maxlength ? `maxlength="${maxlength}"` : ''}>${this.escape(value)}</textarea>
        ${helpText ? `<small class="form-text text-muted">${this.escape(helpText)}</small>` : ''}
      </div>
    `
  }

  /**
   * Crea un checkbox
   */
  static checkbox({ id, label, checked = false }) {
    return `
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="${id}" name="${id}" ${checked ? 'checked' : ''}>
        <label class="form-check-label" for="${id}">${this.escape(label)}</label>
      </div>
    `
  }

  /**
   * Crea un campo date
   */
  static date({ id, label, value = '', required = false, helpText = '' }) {
    return this.input({ id, label, type: 'date', value, required, helpText })
  }

  /**
   * Crea un campo time
   */
  static time({ id, label, value = '', required = false, helpText = '' }) {
    return this.input({ id, label, type: 'time', value, required, helpText })
  }

  /**
   * Crea un campo number
   */
  static number({ id, label, value = '', min, max, required = false, helpText = '' }) {
    return `
      <div class="mb-3">
        <label for="${id}" class="form-label">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>
        <input type="number" class="form-control" id="${id}" name="${id}"
               value="${this.escape(value)}" ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''}
               ${required ? 'required' : ''}>
        ${helpText ? `<small class="form-text text-muted">${this.escape(helpText)}</small>` : ''}
      </div>
    `
  }

  static escape(str) {
    if (!str) return ''
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]))
  }
}
