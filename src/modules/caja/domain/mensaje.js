/**
 * Domain: mensaje
 * Internal messaging — no Supabase imports.
 */

export function buildMensaje({ hilo_id, autor_id, rol_autor, contenido, tipo, departamento_destino }) {
  return {
    hilo_id,
    autor_id,
    rol_autor,
    contenido,
    tipo,
    departamento_destino: departamento_destino || [],
    leido_por: {},
  }
}

export function canViewMensaje(mensaje, userRole) {
  if (!mensaje.departamento_destino || mensaje.departamento_destino.length === 0) return true
  return mensaje.departamento_destino.includes(userRole)
}

export function marcarLeido(mensaje, userId) {
  return {
    ...mensaje,
    leido_por: {
      ...mensaje.leido_por,
      [userId]: new Date().toISOString(),
    },
  }
}
