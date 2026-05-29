/**
 * FormField — renders a labeled Bootstrap 5.3 form field with an error slot.
 * No user-controlled data is injected via innerHTML — values go via value attr only.
 */

/**
 * @typedef {object} FormFieldOptions
 * @property {string} name - field name (used for id and name attrs)
 * @property {string} label - human-readable label text (Spanish)
 * @property {'text'|'date'|'email'|'tel'|'number'|'select'|'radio'|'checkbox'|'textarea'} type
 * @property {string} [value] - current field value
 * @property {string} [error] - validation error message
 * @property {boolean} [required] - whether the field is required
 * @property {string} [placeholder] - placeholder text
 * @property {string} [hint] - small hint text below the input
 * @property {Array<{value: string, label: string}>} [options] - for select/radio
 * @property {boolean} [readOnly] - for read-only display fields
 */

function escAttr(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escText(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Render a single form field as an HTML string.
 *
 * @param {FormFieldOptions} opts
 * @returns {string} HTML string
 */
export function renderFormField(opts) {
  const {
    name,
    label,
    type = 'text',
    value = '',
    error = '',
    required = false,
    placeholder = '',
    hint = '',
    options = [],
    readOnly = false,
  } = opts

  const id = `wiz-${name}`
  const requiredAttr = required ? 'required' : ''
  const readOnlyAttr = readOnly ? 'readonly' : ''
  const isInvalid = error ? 'is-invalid' : ''
  const errorSlot = error
    ? `<div class="invalid-feedback">${escText(error)}</div>`
    : ''
  const hintSlot = hint ? `<div class="form-text">${escText(hint)}</div>` : ''

  if (type === 'select') {
    const optionsHtml = options
      .map(
        (o) =>
          `<option value="${escAttr(o.value)}"${value === o.value ? ' selected' : ''}>${escText(o.label)}</option>`
      )
      .join('')
    return `
      <div class="mb-3">
        <label for="${id}" class="form-label">${escText(label)}${required ? ' <span class="text-danger">*</span>' : ''}</label>
        <select id="${id}" name="${name}" class="form-select ${isInvalid}" ${requiredAttr}>
          <option value="">Selecciona una opción</option>
          ${optionsHtml}
        </select>
        ${errorSlot}${hintSlot}
      </div>`
  }

  if (type === 'radio') {
    const radiosHtml = options
      .map(
        (o) => `
        <div class="form-check">
          <input class="form-check-input ${isInvalid}" type="radio" name="${name}" id="${id}-${escAttr(o.value)}" value="${escAttr(o.value)}"${value === o.value ? ' checked' : ''} ${requiredAttr}>
          <label class="form-check-label" for="${id}-${escAttr(o.value)}">${escText(o.label)}</label>
        </div>`
      )
      .join('')
    return `
      <div class="mb-3">
        <label class="form-label">${escText(label)}${required ? ' <span class="text-danger">*</span>' : ''}</label>
        ${radiosHtml}
        ${error ? `<div class="text-danger small">${escText(error)}</div>` : ''}
        ${hintSlot}
      </div>`
  }

  if (type === 'checkbox') {
    return `
      <div class="mb-3 form-check">
        <input class="form-check-input ${isInvalid}" type="checkbox" id="${id}" name="${name}"${value === true || value === 'true' ? ' checked' : ''}>
        <label class="form-check-label" for="${id}">${escText(label)}</label>
        ${errorSlot}${hintSlot}
      </div>`
  }

  if (type === 'textarea') {
    return `
      <div class="mb-3">
        <label for="${id}" class="form-label">${escText(label)}${required ? ' <span class="text-danger">*</span>' : ''}</label>
        <textarea id="${id}" name="${name}" class="form-control ${isInvalid}" placeholder="${escAttr(placeholder)}" ${requiredAttr} ${readOnlyAttr} rows="3">${escText(value)}</textarea>
        ${errorSlot}${hintSlot}
      </div>`
  }

  // Default: text / date / email / tel / number
  return `
    <div class="mb-3">
      <label for="${id}" class="form-label">${escText(label)}${required ? ' <span class="text-danger">*</span>' : ''}</label>
      <input
        type="${escAttr(type)}"
        id="${id}"
        name="${name}"
        class="form-control ${isInvalid}"
        value="${escAttr(value)}"
        placeholder="${escAttr(placeholder)}"
        ${requiredAttr}
        ${readOnlyAttr}
      >
      ${errorSlot}${hintSlot}
    </div>`
}
