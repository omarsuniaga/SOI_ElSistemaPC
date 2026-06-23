/**
 * Domain: familia
 * Billing unit — no Supabase imports.
 */

export function validateFamilia(data) {
  const errors = []
  if (!data.nombre_familia || !String(data.nombre_familia).trim()) {
    errors.push('nombre_familia es requerido')
  }
  return { valid: errors.length === 0, errors }
}

export function buildFamiliaRecord(data) {
  return {
    nombre_familia: data.nombre_familia,
    activa: data.activa !== undefined ? data.activa : true,
    datos_extra: data.datos_extra !== undefined ? data.datos_extra : {},
  }
}

export function isFamiliaActiva(familia) {
  return familia.activa === true
}
