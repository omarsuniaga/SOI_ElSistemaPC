/**
 * @typedef {object} InscripcionDraft
 *
 * Step 1 — Datos Personales
 * @property {string} nombre_completo
 * @property {string} fecha_nacimiento          YYYY-MM-DD
 * @property {boolean} sabe_leer
 * @property {boolean} sabe_escribir
 * @property {string} nacionalidad
 * @property {boolean} tiene_pasaporte
 * @property {string} como_se_entero
 * @property {string} direccion
 * @property {string} ubicacion_maps_url        optional
 *
 * Step 2 — Perfil Musical
 * @property {boolean} tiene_conocimientos_musicales
 * @property {string|null} instrumento_previo          conditional
 * @property {string|null} nivel_lectura_musical       conditional; basico|intermedio|avanzado
 * @property {string} interes_musical                  cantar|instrumento|ambas
 * @property {string} instrumento_interes
 *
 * Step 3 — Salud
 * @property {boolean} tiene_alergias
 * @property {string|null} alergias_descripcion
 * @property {boolean} tiene_condicion_transmisible
 * @property {string|null} condicion_transmisible_descripcion  conditional
 * @property {boolean} tiene_alergia_medicamento
 * @property {string|null} alergia_medicamento_descripcion     conditional
 * @property {boolean} impedimento_social
 * @property {string} problemas_conducta                       no|pocas_veces|si|violento
 *
 * Step 4 — Datos Escolares
 * @property {string} centro_estudios
 * @property {string} grado_nivel
 * @property {string} padres_en_vida              ambos|solo_madre|solo_padre|ninguno
 *
 * Step 5 — Representante y Compromisos
 * @property {string} representante_nombre
 * @property {string} representante_parentesco
 * @property {string} representante_tlf
 * @property {string} representante_cedula
 * @property {boolean} acepta_beca_4500
 * @property {string|null} fecha_aceptacion_beca   ISO timestamp, set on accept
 * @property {boolean} acepta_pago_600
 * @property {string|null} fecha_aceptacion_pago   ISO timestamp, set on accept
 */

/**
 * Returns a new empty InscripcionDraft with all fields at their default values.
 *
 * @returns {InscripcionDraft}
 */
export function crearBorradorVacio() {
  return {
    // Step 1
    nombre_completo: '',
    fecha_nacimiento: '',
    sabe_leer: false,
    sabe_escribir: false,
    nacionalidad: '',
    tiene_pasaporte: false,
    como_se_entero: '',
    direccion: '',
    ubicacion_maps_url: '',

    // Step 2
    tiene_conocimientos_musicales: false,
    instrumento_previo: null,
    nivel_lectura_musical: null,
    interes_musical: '',
    instrumento_interes: '',

    // Step 3
    tiene_alergias: false,
    alergias_descripcion: null,
    tiene_condicion_transmisible: false,
    condicion_transmisible_descripcion: null,
    tiene_alergia_medicamento: false,
    alergia_medicamento_descripcion: null,
    impedimento_social: false,
    problemas_conducta: 'no',

    // Step 4
    centro_estudios: '',
    grado_nivel: '',
    padres_en_vida: '',

    // Step 5
    representante_nombre: '',
    representante_parentesco: '',
    representante_tlf: '',
    representante_cedula: '',
    acepta_beca_4500: false,
    fecha_aceptacion_beca: null,
    acepta_pago_600: false,
    fecha_aceptacion_pago: null,
  }
}

/**
 * Returns a new draft with the given step data merged in (immutable update).
 *
 * @param {InscripcionDraft} draft - Current draft state.
 * @param {number} paso - Step number (1-5); used for documentation only, merge is flat.
 * @param {Partial<InscripcionDraft>} data - Fields to merge.
 * @returns {InscripcionDraft}
 */
export function actualizarPaso(draft, paso, data) {
  return Object.assign({}, draft, data)
}
