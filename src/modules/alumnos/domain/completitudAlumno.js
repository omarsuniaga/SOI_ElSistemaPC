/**
 * Calcula el nivel de completitud del perfil de un alumno.
 * Puro — sin I/O, sin DOM.
 */

const CAMPOS = [
  // ── Datos personales básicos ──────────────────────────────────────────────
  { key: 'nombre_completo',      label: 'Nombre completo',        peso: 10, grupo: 'Personal' },
  { key: 'fecha_nacimiento',     label: 'Fecha de nacimiento',    peso: 8,  grupo: 'Personal' },
  { key: 'genero',               label: 'Género',                 peso: 3,  grupo: 'Personal' },
  { key: 'nacionalidad',         label: 'Nacionalidad',           peso: 3,  grupo: 'Personal' },
  { key: 'municipio_residencia', label: 'Municipio',              peso: 4,  grupo: 'Personal' },
  { key: 'direccion',            label: 'Dirección',              peso: 4,  grupo: 'Personal' },

  // ── Contacto (al menos uno es obligatorio) ────────────────────────────────
  { key: 'madre_tlf_whatsapp',   label: 'WhatsApp de la madre',   peso: 8,  grupo: 'Contacto' },
  { key: 'padre_tlf_whatsapp',   label: 'WhatsApp del padre',     peso: 5,  grupo: 'Contacto' },
  { key: 'representante_tlf',    label: 'Teléfono representante', peso: 5,  grupo: 'Contacto' },

  // ── Familia ───────────────────────────────────────────────────────────────
  { key: 'madre_nombre',               label: 'Nombre de la madre',      peso: 6, grupo: 'Familia' },
  { key: 'padre_nombre',               label: 'Nombre del padre',        peso: 5, grupo: 'Familia' },
  { key: 'representante_nombre',       label: 'Nombre del representante',peso: 6, grupo: 'Familia' },
  { key: 'representante_parentesco',   label: 'Parentesco representante',peso: 3, grupo: 'Familia' },
  { key: 'contacto_emergencia_nombre', label: 'Contacto de emergencia',  peso: 4, grupo: 'Familia' },

  // ── Musical ───────────────────────────────────────────────────────────────
  { key: 'instrumento_principal', label: 'Instrumento principal', peso: 8, grupo: 'Musical' },
  { key: 'instrumento_interes',   label: 'Instrumento de interés',peso: 4, grupo: 'Musical' },
  { key: 'nivel_actual',          label: 'Nivel actual',          peso: 4, grupo: 'Musical' },

  // ── Escolar ───────────────────────────────────────────────────────────────
  { key: 'centro_estudios', label: 'Centro de estudios', peso: 4, grupo: 'Escolar' },
  { key: 'grado_nivel',     label: 'Grado / Nivel',      peso: 3, grupo: 'Escolar' },

  // ── Salud ─────────────────────────────────────────────────────────────────
  { key: 'alergias_descripcion',   label: 'Alergias (declaradas)',   peso: 3, grupo: 'Salud', opcional: true },
  { key: 'problemas_conducta',     label: 'Conducta (declarada)',    peso: 3, grupo: 'Salud', opcional: true },

  // ── Compromisos ───────────────────────────────────────────────────────────
  { key: 'acepta_pago_600',      label: 'Acepta pago RD$600',       peso: 5, grupo: 'Compromisos' },
  { key: 'autoriza_fotos_redes', label: 'Autoriza fotos en redes',  peso: 3, grupo: 'Compromisos' },
]

const PESO_TOTAL = CAMPOS.reduce((s, c) => s + c.peso, 0)

/**
 * Verifica si un campo tiene valor válido.
 */
function tieneValor(alumno, key) {
  const v = alumno[key]
  if (v === null || v === undefined || v === '') return false
  if (typeof v === 'string' && v.trim() === '') return false
  if (typeof v === 'boolean') return true // false is a valid answer
  return true
}

/**
 * Calcula la completitud del perfil de un alumno.
 *
 * @param {object} alumno - raw DB row
 * @returns {{
 *   porcentaje: number,
 *   nivel: 'critico' | 'parcial' | 'bueno' | 'completo',
 *   camposFaltantes: { key, label, grupo, peso }[],
 *   camposCompletos: { key, label, grupo, peso }[],
 *   porGrupo: { [grupo]: { total: number, completos: number, porcentaje: number } }
 * }}
 */
export function calcularCompletitud(alumno) {
  const faltantes = []
  const completos = []

  for (const campo of CAMPOS) {
    if (tieneValor(alumno, campo.key)) {
      completos.push(campo)
    } else {
      faltantes.push(campo)
    }
  }

  const pesoCompleto = completos.reduce((s, c) => s + c.peso, 0)
  const porcentaje = Math.round((pesoCompleto / PESO_TOTAL) * 100)

  const nivel =
    porcentaje >= 90 ? 'completo' :
    porcentaje >= 65 ? 'bueno'    :
    porcentaje >= 35 ? 'parcial'  :
                       'critico'

  // Agrupar por sección
  const porGrupo = {}
  for (const campo of CAMPOS) {
    if (!porGrupo[campo.grupo]) {
      porGrupo[campo.grupo] = { total: 0, completos: 0, porcentaje: 0, faltantes: [] }
    }
    porGrupo[campo.grupo].total++
    if (tieneValor(alumno, campo.key)) {
      porGrupo[campo.grupo].completos++
    } else {
      porGrupo[campo.grupo].faltantes.push(campo.label)
    }
  }
  for (const g of Object.values(porGrupo)) {
    g.porcentaje = Math.round((g.completos / g.total) * 100)
  }

  return { porcentaje, nivel, camposFaltantes: faltantes, camposCompletos: completos, porGrupo }
}

export const NIVEL_COLOR = {
  critico:  'danger',
  parcial:  'warning',
  bueno:    'info',
  completo: 'success',
}

export const NIVEL_LABEL = {
  critico:  'Crítico',
  parcial:  'Parcial',
  bueno:    'Bueno',
  completo: 'Completo',
}
