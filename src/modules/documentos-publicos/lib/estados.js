/**
 * estados.js — ciclo de vida de una publicación. Espejo de la RPC
 * cambiar_estado_publicacion_documento (la base de datos es la autoridad).
 */
export const ESTADOS = Object.freeze({
  borrador: { label: 'Borrador', badge: 'bg-secondary' },
  publicado: { label: 'Publicado', badge: 'bg-success' },
  archivado: { label: 'Archivado', badge: 'bg-dark' },
})

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

const TRANSITIONS = {
  'borrador>publicado': 'publicar',
  'publicado>borrador': 'despublicar',
  'borrador>archivado': 'archivar',
  'publicado>archivado': 'archivar',
  'archivado>borrador': 'restaurar',
}

/** Acción de auditoría para una transición, o null si no está permitida. */
export function accionDeTransicion(desde, hacia) {
  return TRANSITIONS[`${desde}>${hacia}`] ?? null
}

/** Estados a los que puede pasar desde `estado`, con su etiqueta de botón. */
export function transicionesDisponibles(estado, tieneVersion) {
  const out = []
  if (estado === 'borrador') {
    if (tieneVersion) out.push({ hacia: 'publicado', label: 'Publicar', icon: 'bi-cloud-arrow-up', variant: 'success' })
    out.push({ hacia: 'archivado', label: 'Archivar', icon: 'bi-archive', variant: 'outline-secondary' })
  } else if (estado === 'publicado') {
    out.push({ hacia: 'borrador', label: 'Despublicar', icon: 'bi-cloud-slash', variant: 'warning' })
    out.push({ hacia: 'archivado', label: 'Archivar', icon: 'bi-archive', variant: 'outline-secondary' })
  } else if (estado === 'archivado') {
    out.push({ hacia: 'borrador', label: 'Restaurar a borrador', icon: 'bi-arrow-counterclockwise', variant: 'outline-primary' })
  }
  return out
}

export const ACCION_LABEL = Object.freeze({
  crear: 'Creó la publicación',
  actualizar: 'Editó los datos',
  nueva_version: 'Subió una nueva versión del documento',
  activar_version: 'Activó una versión anterior',
  publicar: 'Publicó',
  despublicar: 'Despublicó',
  archivar: 'Archivó',
  restaurar: 'Restauró a borrador',
})
