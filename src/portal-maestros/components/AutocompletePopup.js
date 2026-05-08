/**
 * AutocompletePopup - Popup de autocompletado inteligente para DSL
 * Aparece debajo del cursor cuando el usuario escribe un trigger (#, [, (, {, $, >)
 */

let popupEl = null;
let currentOptions = [];
let currentCallback = null;
let selectedIndex = -1;
let isVisible = false;
let triggerType = null;

/**
 * Crea e inicializa el popup de autocompletado
 */
function initPopup() {
  if (popupEl) return;
  
  popupEl = document.createElement('div');
  popupEl.id = 'pm-autocomplete-popup';
  popupEl.className = 'pm-autocomplete-popup';
  popupEl.style.cssText = `
    position: fixed;
    display: none;
    background: var(--pm-surface, #fff);
    border: 1px solid var(--pm-border, #ddd);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    z-index: 9999;
    min-width: 280px;
    max-width: 360px;
    max-height: 280px;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: pm-ac-fadein 0.15s ease-out;
  `;
  
  // Agregar animación si no existe
  if (!document.getElementById('pm-ac-styles')) {
    const style = document.createElement('style');
    style.id = 'pm-ac-styles';
    style.textContent = `
      @keyframes pm-ac-fadein {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pm-ac-option {
        padding: 10px 14px;
        cursor: pointer;
        border-bottom: 1px solid var(--pm-border, #eee);
        transition: background 0.1s;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .pm-ac-option:last-child { border-bottom: none; }
      .pm-ac-option:hover, .pm-ac-option.selected {
        background: var(--pm-primary-light, #f0f4ff);
      }
      .pm-ac-option.selected {
        background: var(--pm-primary, #007aff);
        color: white;
      }
      .pm-ac-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--pm-surface-2, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      .pm-ac-option.selected .pm-ac-icon {
        background: rgba(255,255,255,0.2);
      }
      .pm-ac-text {
        flex: 1;
        min-width: 0;
      }
      .pm-ac-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--pm-text, #333);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pm-ac-option.selected .pm-ac-label {
        color: white;
      }
      .pm-ac-sublabel {
        font-size: 12px;
        color: var(--pm-text-muted, #888);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pm-ac-option.selected .pm-ac-sublabel {
        color: rgba(255,255,255,0.7);
      }
      .pm-ac-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--pm-primary-light, #e8f0ff);
        color: var(--pm-primary, #007aff);
        font-weight: 600;
      }
      .pm-ac-option.selected .pm-ac-badge {
        background: rgba(255,255,255,0.2);
        color: white;
      }
      .pm-ac-header {
        padding: 8px 14px;
        font-size: 11px;
        color: var(--pm-text-muted, #888);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--pm-border, #eee);
        background: var(--pm-surface-2, #fafafa);
      }
      .pm-ac-empty {
        padding: 20px;
        text-align: center;
        color: var(--pm-text-muted, #888);
        font-size: 13px;
      }
      .pm-ac-loading {
        padding: 20px;
        text-align: center;
        color: var(--pm-text-muted, #888);
        font-size: 13px;
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(popupEl);
}

/**
 * Muestra el popup con opciones
 * @param {Array} options - Array de opciones
 * @param {Function} callback - Callback cuando se selecciona una opción
 * @param {Object} config - Configuración adicional { trigger, position }
 */
export function show(options, callback, config = {}) {
  initPopup();
  
  currentOptions = options || [];
  currentCallback = callback;
  triggerType = config.trigger || null;
  selectedIndex = -1;
  isVisible = true;
  
  render(options);
  
  // Posicionar
  if (config.position) {
    popupEl.style.left = `${config.position.x}px`;
    popupEl.style.top = `${config.position.y + 20}px`;
  }
  
  popupEl.style.display = 'block';
}

/**
 * Oculta el popup
 */
export function hide() {
  if (popupEl) {
    popupEl.style.display = 'none';
  }
  currentOptions = [];
  currentCallback = null;
  selectedIndex = -1;
  isVisible = false;
  triggerType = null;
}

/**
 * Actualiza las opciones sin cerrar el popup
 * @param {Array} options 
 */
export function updateOptions(options) {
  currentOptions = options || [];
  selectedIndex = -1;
  render(options);
}

/**
 * Renderiza las opciones en el popup
 */
function render(options) {
  if (!popupEl) return;
  
  if (!options || options.length === 0) {
    popupEl.innerHTML = `
      <div class="pm-ac-empty">
        <span>No hay opciones disponibles</span>
      </div>
    `;
    return;
  }
  
  // Determinar el tipo de trigger para mostrar iconos apropiados
  const headerText = getHeaderText(triggerType);
  
  let html = `<div class="pm-ac-header">${headerText}</div>`;
  
  options.forEach((opt, idx) => {
    const label = opt.nombre || opt.name || opt.label || opt.description || '';
    const sublabel = opt.instrumento || opt.descripcion || opt.codigo || opt.type || '';
    const isSelected = idx === selectedIndex;
    const icon = getIcon(triggerType, opt);
    const badge = opt.is_historial ? '<span class="pm-ac-badge">Reciente</span>' : '';
    
    html += `
      <div class="pm-ac-option ${isSelected ? 'selected' : ''}" data-index="${idx}">
        <div class="pm-ac-icon">${icon}</div>
        <div class="pm-ac-text">
          <div class="pm-ac-label">${escapeHtml(label)}</div>
          ${sublabel ? `<div class="pm-ac-sublabel">${escapeHtml(sublabel)}</div>` : ''}
        </div>
        ${badge}
      </div>
    `;
  });
  
  popupEl.innerHTML = html;
  
  // Agregar event listeners
  popupEl.querySelectorAll('.pm-ac-option').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.index, 10);
      selectOption(idx);
    });
  });
}

/**
 * Selecciona una opción por índice
 */
function selectOption(index) {
  if (index >= 0 && index < currentOptions.length) {
    const selected = currentOptions[index];
    
    if (currentCallback) {
      currentCallback(selected);
    }
    
    hide();
  }
}

/**
 * Maneja navegación con teclado
 * @param {KeyboardEvent} e
 */
export function handleKeyDown(e) {
  if (!isVisible || currentOptions.length === 0) return;
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, currentOptions.length - 1);
      render(currentOptions);
      scrollToSelected();
      break;
      
    case 'ArrowUp':
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      render(currentOptions);
      scrollToSelected();
      break;
      
    case 'Enter':
      e.preventDefault();
      if (selectedIndex >= 0) {
        selectOption(selectedIndex);
      } else if (currentOptions.length > 0) {
        // Seleccionar primera si no hay selección
        selectOption(0);
      }
      break;
      
    case 'Escape':
      e.preventDefault();
      hide();
      break;
      
    case 'Tab':
      // Completar con primera opción
      if (currentOptions.length > 0 && selectedIndex === -1) {
        e.preventDefault();
        selectOption(0);
      }
      break;
  }
}

/**
 * Scroll hacia la opción seleccionada
 */
function scrollToSelected() {
  if (!popupEl || selectedIndex < 0) return;
  
  const selectedEl = popupEl.querySelector(`.pm-ac-option[data-index="${selectedIndex}"]`);
  if (selectedEl) {
    selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/**
 * Obtiene el texto del header según el trigger
 */
function getHeaderText(trigger) {
  switch (trigger) {
    case '#': return '👤 Alumnos';
    case '[': return '📚 Contenidos';
    case '(': return '💡 Sugerencias';
    case '{': return '📝 Tareas';
    case '$': return '🎯 Medidas';
    case '>': return '🎓 Objetivos';
    default: return 'Opciones';
  }
}

/**
 * Obtiene el icono según el tipo de opción
 */
function getIcon(trigger, opt) {
  // Para alumnos, mostrar inicial del nombre
  if (trigger === '#') {
    const nombre = opt.nombre || opt.name || '';
    return nombre.charAt(0).toUpperCase();
  }
  
  // Para medidas técnicas
  if (trigger === '$') {
    return '🎯';
  }
  
  // Para niveles
  if (trigger === '>' && opt.level_number) {
    return opt.level_number;
  }
  
  // Para nodos
  if (trigger === '>' && opt.type) {
    return getNodeEmoji(opt.type);
  }
  
  // Default
  return '•';
}

/**
 * Obtiene emoji según tipo de nodo
 */
function getNodeEmoji(type) {
  const map = {
    'ESCALA': '🎼',
    'ARPEGIO': '🎹',
    'MANO_IZQ': '✋',
    'ARCO': '🎻',
    'SONIDO': '🔊',
    'AFINACION': '🎵',
    'TECNICA': '⚙️',
    'REPERTORIO': '📖'
  };
  return map[type] || '•';
}

/**
 * Escapa HTML para evitar XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Obtiene la posición del cursor en el documento
 */
export function getCursorPosition() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  return {
    x: rect.left,
    y: rect.top
  };
}

/**
 * Verifica si el popup está visible
 */
export function isOpen() {
  return isVisible;
}

/**
 * Obtiene el índice seleccionado
 */
export function getSelectedIndex() {
  return selectedIndex;
}

export default {
  show,
  hide,
  updateOptions,
  handleKeyDown,
  getCursorPosition,
  isOpen,
  getSelectedIndex
};