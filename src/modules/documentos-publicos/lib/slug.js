/**
 * slug.js — identificador público permanente de una publicación (parte de /d/<slug>).
 * Espejo de la restricción de la base de datos: 3–60 caracteres, minúsculas, números y guiones
 * (sin guiones al inicio, al final ni dobles). Módulo puro: lo usan el panel y el sitio público.
 */
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidSlug(slug) {
  return typeof slug === 'string' && slug.length >= 3 && slug.length <= 60 && SLUG_RE.test(slug)
}

/** Sugerencia de identificador legible a partir de un título (el administrador puede editarla). */
export function suggestSlug(title = '') {
  return String(title)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 60).replace(/-+$/g, '')
}
