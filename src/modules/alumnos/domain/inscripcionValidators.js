/**
 * Per-step validators for the inscripción wizard.
 * Each validator is a pure function: (data) -> { valid: boolean, errors: Record<string, string> }
 * Conditional field visibility follows the same predicates as the UI (single source of truth).
 */

const INTERES_MUSICAL_VALUES = ['cantar', 'instrumento', 'ambas']
const NIVEL_LECTURA_MUSICAL_VALUES = ['basico', 'intermedio', 'avanzado']
const PROBLEMAS_CONDUCTA_VALUES = ['no', 'pocas_veces', 'si', 'violento']
const PADRES_EN_VIDA_VALUES = ['ambos', 'solo_madre', 'solo_padre', 'ninguno']
const GOOGLE_MAPS_PATTERN = /^https?:\/\/(www\.)?google\.com\/maps|^https?:\/\/goo\.gl\/maps/

/**
 * @typedef {{ valid: boolean, errors: Record<string, string> }} ValidationResult
 */

/**
 * Build a ValidationResult from an errors object.
 *
 * @param {Record<string, string>} errors
 * @returns {ValidationResult}
 */
function result(errors) {
  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Step 1 — Datos Personales
 *
 * @param {object} data
 * @returns {ValidationResult}
 */
export function validarPaso1(data) {
  const errors = {}

  if (!data.nombre_completo || !data.nombre_completo.trim()) {
    errors.nombre_completo = 'El nombre completo es requerido'
  }

  if (!data.fecha_nacimiento) {
    errors.fecha_nacimiento = 'La fecha de nacimiento es requerida'
  } else {
    const birth = new Date(data.fecha_nacimiento)
    if (isNaN(birth.getTime())) {
      errors.fecha_nacimiento = 'Fecha de nacimiento inválida'
    } else if (birth > new Date()) {
      errors.fecha_nacimiento = 'La fecha de nacimiento no puede ser en el futuro'
    }
  }

  if (!data.nacionalidad || !data.nacionalidad.trim()) {
    errors.nacionalidad = 'La nacionalidad es requerida'
  }

  if (!data.como_se_entero || !data.como_se_entero.trim()) {
    errors.como_se_entero = 'Este campo es requerido'
  }

  if (!data.direccion || !data.direccion.trim()) {
    errors.direccion = 'La dirección es requerida'
  }

  if (data.ubicacion_maps_url && data.ubicacion_maps_url.trim()) {
    if (!GOOGLE_MAPS_PATTERN.test(data.ubicacion_maps_url.trim())) {
      errors.ubicacion_maps_url = 'URL debe ser de Google Maps'
    }
  }

  return result(errors)
}

/**
 * Step 2 — Perfil Musical
 *
 * @param {object} data
 * @returns {ValidationResult}
 */
export function validarPaso2(data) {
  const errors = {}

  if (!data.interes_musical || !INTERES_MUSICAL_VALUES.includes(data.interes_musical)) {
    errors.interes_musical = 'Selecciona un interés musical válido'
  }

  if (!data.instrumento_interes || !data.instrumento_interes.trim()) {
    errors.instrumento_interes = 'El instrumento de interés es requerido'
  }

  // Conditional: only required when tiene_conocimientos_musicales = true
  if (data.tiene_conocimientos_musicales === true) {
    if (!data.instrumento_previo || !data.instrumento_previo.trim()) {
      errors.instrumento_previo = 'El instrumento previo es requerido'
    }
    if (!data.nivel_lectura_musical || !NIVEL_LECTURA_MUSICAL_VALUES.includes(data.nivel_lectura_musical)) {
      errors.nivel_lectura_musical = 'Selecciona un nivel de lectura musical válido'
    }
  }

  return result(errors)
}

/**
 * Step 3 — Salud
 *
 * @param {object} data
 * @returns {ValidationResult}
 */
export function validarPaso3(data) {
  const errors = {}

  if (data.tiene_condicion_transmisible === true) {
    if (!data.condicion_transmisible_descripcion || !data.condicion_transmisible_descripcion.trim()) {
      errors.condicion_transmisible_descripcion = 'La descripción de la condición transmisible es requerida'
    }
  }

  if (data.tiene_alergia_medicamento === true) {
    if (!data.alergia_medicamento_descripcion || !data.alergia_medicamento_descripcion.trim()) {
      errors.alergia_medicamento_descripcion = 'La descripción de la alergia a medicamentos es requerida'
    }
  }

  if (data.problemas_conducta !== undefined && data.problemas_conducta !== null) {
    if (!PROBLEMAS_CONDUCTA_VALUES.includes(data.problemas_conducta)) {
      errors.problemas_conducta = 'Valor de problemas de conducta inválido'
    }
  }

  return result(errors)
}

/**
 * Step 4 — Datos Escolares
 *
 * @param {object} data
 * @returns {ValidationResult}
 */
export function validarPaso4(data) {
  const errors = {}

  if (!data.centro_estudios || !data.centro_estudios.trim()) {
    errors.centro_estudios = 'El centro de estudios es requerido'
  }

  if (!data.grado_nivel || !data.grado_nivel.trim()) {
    errors.grado_nivel = 'El grado o nivel es requerido'
  }

  if (!data.padres_en_vida || !PADRES_EN_VIDA_VALUES.includes(data.padres_en_vida)) {
    errors.padres_en_vida = 'Selecciona una opción válida para padres en vida'
  }

  return result(errors)
}

/**
 * Step 5 — Representante y Compromisos
 *
 * @param {object} data
 * @returns {ValidationResult}
 */
export function validarPaso5(data) {
  const errors = {}

  if (!data.representante_nombre || !data.representante_nombre.trim()) {
    errors.representante_nombre = 'El nombre del representante es requerido'
  }

  if (!data.representante_parentesco || !data.representante_parentesco.trim()) {
    errors.representante_parentesco = 'El parentesco es requerido'
  }

  if (!data.representante_tlf || !data.representante_tlf.trim()) {
    errors.representante_tlf = 'El teléfono del representante es requerido'
  }

  if (!data.representante_cedula || !data.representante_cedula.trim()) {
    errors.representante_cedula = 'La cédula del representante es requerida'
  }

  if (data.acepta_beca_4500 !== true) {
    errors.acepta_beca_4500 = 'Debes aceptar el compromiso de la beca RD$4,500'
  }

  if (data.acepta_pago_600 !== true) {
    errors.acepta_pago_600 = 'Debes aceptar el compromiso del aporte RD$600'
  }

  return result(errors)
}
