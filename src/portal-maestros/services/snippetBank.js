/**
 * Banco de Snippets para el DSL Pedagógico
 * Permite insertar fragmentos predefinidos rápidamente escribiendo `/`
 */

export const SNIPPETS = [
  {
    trigger: 'escalas',
    label: 'Escalas',
    icon: '🎼',
    expand: '[Escala Do Mayor] [Escala Re Mayor] [Escala Sol Mayor]'
  },
  {
    trigger: 'arpegios',
    label: 'Arpegios',
    icon: '🎹',
    expand: '[Arpegio Do Mayor] [Arpegio La menor] [Arpegio Sol Mayor]'
  },
  {
    trigger: 'tecnica',
    label: 'Técnica',
    icon: '🎸',
    expand: '$Tecnica_mano_derecha $Tecnica_mano_izquierda'
  },
  {
    trigger: 'postura',
    label: 'Postura',
    icon: '🧘',
    expand: '$Postura_corporal $Posicion_manos'
  },
  {
    trigger: 'evaluar',
    label: 'Evaluar',
    icon: '📝',
    expand: '4/5 (buen trabajo) {practicar 30 min diarios}'
  },
  {
    trigger: 'mejorar',
    label: 'Mejorar',
    icon: '💪',
    expand: '(continuar mejorando la digitación) {repetir练习}'
  },
  {
    trigger: 'ritmo',
    label: 'Ritmo',
    icon: '🥁',
    expand: '$Ritmo_binario $Ritmo_ternario'
  },
  {
    trigger: 'dinamica',
    label: 'Dinámica',
    icon: '🔊',
    expand: '$Dinamica_piano $Dinamica_forte $Dinamica_mezzo'
  },
  {
    trigger: 'afinacion',
    label: 'Afinación',
    icon: '🎵',
    expand: '$Afinacion_precisa $Afinacion_relativa'
  },
  {
    trigger: 'lectura',
    label: 'Lectura',
    icon: '📖',
    expand: '[Lectura a primera vista] [Lectura de notas]'
  },
  {
    trigger: 'respiracion',
    label: 'Respiración',
    icon: '🌬️',
    expand: '$Respiracion_diafragmatica $Respiracion_costeado'
  },
  {
    trigger: 'memo',
    label: 'Memoria',
    icon: '🧠',
    expand: '[Técnica de memorización] {practicar de memoria}'
  },
]

/**
 * Busca snippets que coincidan con el query
 * @param {string} query - Texto después del /
 * @returns {Array} Snippets que coinciden
 */
export function searchSnippets(query) {
  if (!query || query.length === 0) {
    return SNIPPETS.slice(0, 6)
  }
  
  const q = query.toLowerCase()
  return SNIPPETS.filter(s => 
    s.trigger.toLowerCase().includes(q) || 
    s.label.toLowerCase().includes(q)
  ).slice(0, 6)
}

/**
 * Expande un snippet por su trigger
 * @param {string} trigger 
 * @returns {string|null}
 */
export function expandSnippet(trigger) {
  const snippet = SNIPPETS.find(s => s.trigger === trigger)
  return snippet ? snippet.expand : null
}

/**
 * Detecta si el texto contiene un trigger de snippet
 * @param {string} text 
 * @returns {{trigger: string, prefix: string, suffix: string}|null}
 */
export function detectSnippetTrigger(text, cursorPos) {
  // Buscar el último / antes del cursor
  const textBeforeCursor = text.slice(0, cursorPos)
  const lastSlash = textBeforeCursor.lastIndexOf('/')
  
  if (lastSlash === -1) return null
  
  const afterSlash = textBeforeCursor.slice(lastSlash + 1)
  
  // Si hay espacio o está al final, es un trigger potencial
  if (afterSlash.includes(' ') || afterSlash.length === 0) {
    return null // El usuario terminó de escribir el trigger
  }
  
  // Verificar que no sea parte de una URL u otro contexto
  if (lastSlash > 0 && textBeforeCursor[lastSlash - 1] === '/') {
    return null // Probablemente no es un snippet
  }
  
  return {
    trigger: afterSlash,
    prefix: text.slice(0, lastSlash),
    suffix: text.slice(cursorPos)
  }
}