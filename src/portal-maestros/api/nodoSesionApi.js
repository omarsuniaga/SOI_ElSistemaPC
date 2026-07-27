import { supabase } from '../../lib/supabaseClient.js'

/**
 * Vinculación entre el registro libre del maestro y el currículo.
 *
 * El maestro escribe su clase en el editor DSL y el sistema deriva de ahí qué
 * categoría de trabajo se cubrió. No se le pide que lo cargue otra vez: se lee
 * lo que ya escribió y se le ofrece confirmar.
 *
 * La confirmación es obligatoria a propósito. Si el sistema asignara la categoría
 * por su cuenta, la métrica de cobertura que ve la coordinación sería una
 * inferencia presentada como un hecho — y un indicador que se equivoca en
 * silencio es peor que uno ausente.
 */

/** Las ocho categorías de trabajo. Coinciden con `nodes.codigo`. */
export const CATEGORIAS = {
  ESC: 'Escalas',
  ARP: 'Arpegios y patrones',
  MI: 'Mano izquierda',
  ARC: 'Arco',
  SON: 'Sonido',
  AFI: 'Afinación',
  EST: 'Estudios técnicos',
  REP: 'Repertorio',
}

/** Cómo se determinó la categoría. Queda registrado para poder auditar el acierto. */
export const ORIGEN = {
  EXPLICITO: 'explicito', // el maestro escribió >CODIGO
  DERIVADO: 'derivado',   // se infirió del texto y el maestro lo confirmó
  MANUAL: 'manual',       // el maestro lo eligió de la lista
}

/**
 * Detecta un `>CODIGO` escrito explícitamente por el maestro.
 * Tiene prioridad sobre cualquier inferencia: si lo escribió, ya lo decidió.
 */
export function detectarCodigoExplicito(texto) {
  if (!texto) return null
  const m = String(texto).match(/>([A-Z]{2,3})\b/)
  const codigo = m?.[1]
  return codigo && CATEGORIAS[codigo] ? codigo : null
}

/**
 * Pide al servidor las categorías candidatas para un texto.
 * Devuelve `[]` ante cualquier fallo: quedarse sin sugerencia es un
 * inconveniente menor, sugerir mal es un dato falso.
 */
export async function sugerirCategorias(texto) {
  if (!texto || !texto.trim()) return []

  const { data, error } = await supabase.rpc('fn_sugerir_nodo_por_texto', {
    p_texto: texto,
  })

  if (error) {
    console.warn('[nodoSesionApi] No se pudo obtener sugerencias:', error.message)
    return []
  }
  return data ?? []
}

/**
 * Resuelve la categoría de una sesión combinando ambas señales.
 *
 * @returns {{codigo: string|null, nombre: string|null, origen: string|null,
 *            confianza: 'alta'|'media'|null, alternativas: Array}}
 */
export async function resolverCategoria(texto) {
  const explicito = detectarCodigoExplicito(texto)
  if (explicito) {
    return {
      codigo: explicito,
      nombre: CATEGORIAS[explicito],
      origen: ORIGEN.EXPLICITO,
      confianza: 'alta',
      alternativas: [],
    }
  }

  const candidatos = await sugerirCategorias(texto)
  if (candidatos.length === 0) {
    return { codigo: null, nombre: null, origen: null, confianza: null, alternativas: [] }
  }

  const [mejor, ...resto] = candidatos
  return {
    codigo: mejor.codigo,
    nombre: mejor.nombre,
    origen: ORIGEN.DERIVADO,
    // Dos o más términos coincidentes, y sin empate, se considera alta.
    confianza: mejor.aciertos >= 2 && (resto.length === 0 || resto[0].aciertos < mejor.aciertos)
      ? 'alta'
      : 'media',
    alternativas: resto,
  }
}

/**
 * Guarda la categoría confirmada en la sesión.
 * Sin `sesionId` no hace nada: la sesión se crea al guardar la asistencia, y
 * hasta entonces no hay dónde escribir.
 */
export async function confirmarCategoria(sesionId, codigo, origen = ORIGEN.DERIVADO) {
  if (!sesionId) return null
  if (codigo && !CATEGORIAS[codigo]) {
    throw new Error(`Categoría desconocida: ${codigo}`)
  }

  const { data, error } = await supabase
    .from('sesiones_clase')
    .update({ node_codigo: codigo, node_origen: codigo ? origen : null })
    .eq('id', sesionId)
    .select('id, node_codigo, node_origen')
    .maybeSingle()

  if (error) throw new Error(`No se pudo guardar la categoría: ${error.message}`)
  return data
}

/** Cobertura curricular del período, para la coordinación. */
export async function obtenerCobertura(periodoId) {
  const { data, error } = await supabase.rpc('fn_cobertura_curricular', {
    p_periodo_id: periodoId,
  })

  if (error) throw new Error(`No se pudo obtener la cobertura: ${error.message}`)
  return data
}
