/**
 * suplenciaService.js
 *
 * Fuente única de verdad para resolver la relación titular/suplente de una
 * clase frente al maestro logueado. Antes esta decisión se repetía a mano
 * (o no se tomaba) en cada vista — este módulo evita que un fix quede
 * aplicado en un solo lugar mientras el resto del portal sigue sin
 * reconocer al suplente.
 *
 * Ver src/portal-maestros/SPEC_suplencias_auditoria.md §4.3: lo que registra
 * el suplente se guarda en la clase del titular, nunca en una fila propia.
 */

/**
 * @param {Object} clase - fila de `clases`; debe incluir al menos
 *   maestro_principal_id, maestro_suplente_id, maestro_id (getMisClases()
 *   y equivalentes deben traer estas tres columnas en el SELECT).
 * @param {string} maestroId - id del maestro logueado.
 * @returns {{
 *   maestroIdSesion: string|null,
 *   esSuplente: boolean,
 *   esTitular: boolean,
 *   idsRelevantes: Set<string>,
 * }}
 */
export function resolverPertenenciaClase(clase, maestroId) {
  const titularId = clase?.maestro_principal_id || clase?.maestro_id || null
  const suplenteId = clase?.maestro_suplente_id || null
  const maestroIdSesion = titularId || maestroId || null

  const esSuplente = !!suplenteId && !!maestroId && String(suplenteId) === String(maestroId)
  const esTitular = !!titularId && !!maestroId && String(titularId) === String(maestroId)

  const idsRelevantes = new Set(
    [maestroIdSesion, maestroId, suplenteId].filter(Boolean).map(String),
  )

  return { maestroIdSesion, esSuplente, esTitular, idsRelevantes }
}
