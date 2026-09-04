import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Normalize Dominican Republic phone number format.
 * - Strips non-digits
 * - 7 digits → prepend +1809 (default DR area code)
 * - 10 digits → prepend +1
 * - 11 digits starting with 1 → prepend +
 * - Invalid → return null
 *
 * @param {string} raw - Raw phone input
 * @returns {string|null} - Normalized E.164 format or null
 */
function normalizarTelefonoRD(raw) {
  if (!raw || !raw.trim()) return null

  // Check if already normalized (starts with +1)
  if (raw.trim().startsWith('+1')) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`
    }
    return null
  }

  const digits = raw.replace(/\D/g, '')

  if (digits.length < 7) return null

  // 7 digits: prepend +1809 (DR default area code)
  if (digits.length === 7) {
    return `+1809${digits}`
  }

  // 10 digits: prepend +1
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // 11 digits starting with 1: prepend +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  return null
}

/**
 * Resolve contact information for an alumno through cascading tiers.
 * Returns the first valid, non-empty contact found in this order:
 *
 * 1. representantes.telefono_whatsapp (direct alumno link)
 * 2. representantes.telefono_whatsapp (via alumnos.familia_id, prefer es_pagador)
 * 3. alumnos.representante_tlf
 * 4. alumnos.madre_tlf_whatsapp
 * 5. alumnos.padre_tlf_whatsapp
 * 6. alumnos.familiar_telefono
 * 7. alumnos.contacto_emergencia_telefono
 *
 * @param {string} alumnoId - UUID of the student
 * @returns {Promise<{nombre: string, telefono: string, origen: string}|{origen: null}>}
 */
export async function resolverContactoAlumno(alumnoId) {
  // Fetch the alumno row
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, familia_id, representante_tlf, madre_tlf_whatsapp, padre_tlf_whatsapp, familiar_telefono, contacto_emergencia_telefono')
    .eq('id', alumnoId)
    .single()

  if (alumnoError || !alumno) {
    return { origen: null }
  }

  // Tier 1: representantes.telefono_whatsapp where alumno_id = alumnoId
  const { data: repr1 } = await supabase
    .from('representantes')
    .select('nombre_completo, telefono_whatsapp')
    .eq('alumno_id', alumnoId)
    .single()

  if (repr1?.telefono_whatsapp) {
    const telefono = normalizarTelefonoRD(repr1.telefono_whatsapp)
    if (telefono) {
      return { nombre: repr1.nombre_completo, telefono, origen: 'representante_alumno' }
    }
  }

  // Tier 2: representantes via familia_id (prefer es_pagador)
  if (alumno.familia_id) {
    const { data: repr2List } = await supabase
      .from('representantes')
      .select('nombre_completo, telefono_whatsapp, es_pagador')
      .eq('familia_id', alumno.familia_id)
      .order('es_pagador', { ascending: false })

    if (repr2List && repr2List.length > 0) {
      for (const repr of repr2List) {
        if (repr.telefono_whatsapp) {
          const telefono = normalizarTelefonoRD(repr.telefono_whatsapp)
          if (telefono) {
            return { nombre: repr.nombre_completo, telefono, origen: 'representante_familia' }
          }
        }
      }
    }
  }

  // Tier 3: alumnos.representante_tlf
  if (alumno.representante_tlf) {
    const telefono = normalizarTelefonoRD(alumno.representante_tlf)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_representante_tlf' }
    }
  }

  // Tier 4: alumnos.madre_tlf_whatsapp
  if (alumno.madre_tlf_whatsapp) {
    const telefono = normalizarTelefonoRD(alumno.madre_tlf_whatsapp)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_madre_tlf_whatsapp' }
    }
  }

  // Tier 5: alumnos.padre_tlf_whatsapp
  if (alumno.padre_tlf_whatsapp) {
    const telefono = normalizarTelefonoRD(alumno.padre_tlf_whatsapp)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_padre_tlf_whatsapp' }
    }
  }

  // Tier 6: alumnos.familiar_telefono
  if (alumno.familiar_telefono) {
    const telefono = normalizarTelefonoRD(alumno.familiar_telefono)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_familiar_telefono' }
    }
  }

  // Tier 7: alumnos.contacto_emergencia_telefono
  if (alumno.contacto_emergencia_telefono) {
    const telefono = normalizarTelefonoRD(alumno.contacto_emergencia_telefono)
    if (telefono) {
      return { nombre: alumno.nombre_completo, telefono, origen: 'alumnos_contacto_emergencia_telefono' }
    }
  }

  // No valid contact found
  return { origen: null }
}
