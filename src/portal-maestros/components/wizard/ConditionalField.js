/**
 * ConditionalField — declarative show/hide helper for wizard form fields.
 *
 * Design decision (D3): uses DOM add/remove, NOT display:none,
 * so hidden fields are never submitted and validation skips them.
 */

/**
 * Render a conditional field wrapper.
 * Returns an HTML string with a data-conditional attribute.
 * The wrapper is only rendered when condition is true.
 *
 * @param {{ condition: boolean, content: string, fieldName?: string }} options
 * @returns {string} HTML string
 */
export function renderConditionalField({ condition, content, fieldName = '' }) {
  if (!condition) return ''
  return `<div data-conditional="${fieldName}" data-visible="true">${content}</div>`
}

/**
 * Scan all [data-conditional] elements in a container and show/hide them
 * based on the current draft values.
 *
 * Each element should have:
 *   data-conditional="fieldName"
 *   data-visible-when="<field>=<value>"   (simple equality check)
 *
 * When hidden, the associated input values are reset to empty string.
 *
 * @param {HTMLElement} container
 * @param {object} draft - current draft state
 */
export function actualizarCamposCondicionales(container, draft) {
  if (!container) return

  const conditionals = container.querySelectorAll('[data-visible-when]')
  conditionals.forEach((el) => {
    const rule = el.getAttribute('data-visible-when')
    if (!rule) return

    const [fieldPath, expectedValue] = rule.split('=')
    const draftValue = String(draft[fieldPath] ?? '')
    const shouldShow = draftValue === expectedValue

    if (shouldShow) {
      el.style.display = ''
      el.setAttribute('data-visible', 'true')
    } else {
      el.style.display = 'none'
      el.setAttribute('data-visible', 'false')
      // Reset any inputs inside the hidden section
      const inputs = el.querySelectorAll('input, select, textarea')
      inputs.forEach((input) => {
        input.value = ''
      })
    }
  })
}
