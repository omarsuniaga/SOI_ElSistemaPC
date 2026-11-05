/**
 * Helpers para mostrar datos no confiables como texto.
 * Usan `textContent`: nunca se interpreta HTML ni se ejecutan manejadores.
 */

/**
 * @param {string} tag
 * @param {string} text
 * @param {string} [className]
 * @returns {HTMLElement}
 */
export function createTextElement(tag, text, className = '') {
  const element = document.createElement(tag)
  if (className) element.className = className
  element.textContent = text
  return element
}

/**
 * Reemplaza el contenido de `container` por un mensaje de estado en texto plano.
 * @param {HTMLElement} container
 * @param {string} className clase de color de Bootstrap, p. ej. 'text-danger'
 * @param {string} text
 */
export function setStatusMessage(container, className, text) {
  container.replaceChildren(createTextElement('span', text, className))
}
