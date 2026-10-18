/** categorias.js — categorías de publicación (compartidas por el panel y el sitio público). */
export const CATEGORIAS = Object.freeze([
  { value: 'general', label: 'General' },
  { value: 'comunicado', label: 'Comunicado' },
  { value: 'calendario', label: 'Calendario' },
  { value: 'reglamento', label: 'Reglamento' },
  { value: 'formulario', label: 'Formulario' },
  { value: 'convocatoria', label: 'Convocatoria' },
  { value: 'boletin', label: 'Boletín' },
])

export const categoriaLabel = (value) => CATEGORIAS.find((c) => c.value === value)?.label ?? value
