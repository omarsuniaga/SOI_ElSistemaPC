/**
 * contenidoAnalyticsApi.js — Motor de Extracción, Síntesis y Análisis de Contenido Pedagógico.
 * Procesa `sesiones_clase` (temas y contenidos), `contenidos_sesion`, `observaciones_sesion`,
 * `clases` y `maestros` para generar balances de contenido a nivel Semanal, Mensual y Semestral.
 */

import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Obtiene el análisis y síntesis pedagógica de contenidos para un rango de fechas.
 * @param {Object} params
 * @param {'semana'|'mes'|'semestre'} [params.tipo='mes']
 * @param {string} [params.fechaInicio]
 * @param {string} [params.fechaFin]
 * @param {string} [params.catedra] - Filtro opcional por instrumento/cátedra
 * @returns {Promise<Object>}
 */
export async function getAnalisisContenidoPedagogico({
  tipo = 'mes',
  fechaInicio = null,
  fechaFin = null,
  catedra = null,
} = {}) {
  // 1. Resolver fechas por defecto según el tipo
  const now = new Date()
  let inicio = fechaInicio
  let fin = fechaFin

  if (!inicio || !fin) {
    if (tipo === 'semana') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Lunes
      const monday = new Date(now.getFullYear(), now.getMonth(), diff)
      const saturday = new Date(now.getFullYear(), now.getMonth(), diff + 5)
      inicio = monday.toISOString().slice(0, 10)
      fin = saturday.toISOString().slice(0, 10)
    } else if (tipo === 'semestre') {
      const currentMonth = now.getMonth() + 1
      const isFirstSemester = currentMonth <= 6
      inicio = `${now.getFullYear()}-${isFirstSemester ? '01-15' : '07-15'}`
      fin = `${now.getFullYear()}-${isFirstSemester ? '06-30' : '12-15'}`
    } else {
      // Mes por defecto
      const mes = now.getMonth() + 1
      const anio = now.getFullYear()
      const ultimoDia = new Date(anio, mes, 0).getDate()
      inicio = `${anio}-${String(mes).padStart(2, '0')}-01`
      fin = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
    }
  }

  // 2. Consultar sesiones en el rango (columnas reales: id, fecha, estado, clase_id, maestro_id, tema, contenido)
  let sesiones = []
  try {
    const { data, error: sesErr } = await supabase
      .from('sesiones_clase')
      .select('id, fecha, estado, clase_id, maestro_id, tema, contenido')
      .gte('fecha', inicio)
      .lte('fecha', fin)

    if (sesErr) {
      console.warn('[ContenidoAnalyticsApi] Warning al consultar sesiones_clase:', sesErr)
    } else if (Array.isArray(data)) {
      sesiones = data
    }
  } catch (err) {
    console.warn('[ContenidoAnalyticsApi] Exception en sesiones_clase:', err)
  }

  // 3. Consultar contenidos de sesión registrados
  const sesionIds = sesiones.map((s) => s.id).filter(Boolean)
  let contenidos = []
  if (sesionIds.length > 0) {
    try {
      const { data, error } = await supabase
        .from('contenidos_sesion')
        .select('id, sesion_clase_id, descripcion, nivel_logro, created_at')
        .in('sesion_clase_id', sesionIds)

      if (!error && Array.isArray(data)) contenidos = data
    } catch (_e) {
      // Tabla puede no estar poblada
    }
  }

  // 4. Consultar observaciones de sesión (bitácora detallada)
  let observaciones = []
  if (sesionIds.length > 0) {
    try {
      const { data, error } = await supabase
        .from('observaciones_sesion')
        .select('id, sesion_id, maestro_id, contenido_raw, contenido_parsed, contenido_ia_dsl')
        .in('sesion_id', sesionIds)

      if (!error && Array.isArray(data)) observaciones = data
    } catch (_e) {
      // Tabla opcional
    }
  }

  // 5. Consultar catálogo de clases y maestros
  let clases = []
  let maestros = []
  try {
    const [resClases, resMaestros] = await Promise.all([
      supabase.from('clases').select('id, nombre, instrumento, maestro_principal_id, maestro_id'),
      supabase.from('maestros').select('id, nombre_completo, especialidad_principal'),
    ])
    if (Array.isArray(resClases.data)) clases = resClases.data
    if (Array.isArray(resMaestros.data)) maestros = resMaestros.data
  } catch (_e) {
    // Ignorar fallback
  }

  const clasesMap = new Map((clases || []).map((c) => [c.id, c]))
  const maestrosMap = new Map((maestros || []).map((m) => [m.id, m]))
  const sesionesMap = new Map((sesiones || []).map((s) => [s.id, s]))

  // 6. Procesar y clasificar contenidos
  const nivelesLogroCounts = {
    introducido: 0,
    practicado: 0,
    reforzado: 0,
    evaluado: 0,
    dominado: 0,
  }

  const focoTecnicoCounts = {
    'Técnica & Postura': 0,
    'Lectura & Rítmica': 0,
    'Repertorio & Obras': 0,
    'Ensamble & Afinación': 0,
    'Interpretación & Dinámica': 0,
  }

  const temasTrabajadosList = []
  const catedrasMap = new Map()
  const processedSessionIds = new Set()

  // A. Analizar contenidos_sesion estructurados
  contenidos.forEach((c) => {
    const ses = sesionesMap.get(c.sesion_clase_id)
    const clase = ses ? clasesMap.get(ses.clase_id) : null
    const instrumento = clase?.instrumento?.trim() || 'General'

    if (catedra && catedra !== 'Todas' && instrumento.toLowerCase() !== catedra.toLowerCase()) {
      return
    }

    const nivel = c.nivel_logro || 'practicado'
    if (nivelesLogroCounts[nivel] !== undefined) {
      nivelesLogroCounts[nivel] += 1
    }

    const desc = c.descripcion?.trim() || 'Práctica guiada'
    clasificarFocoTecnico(desc, focoTecnicoCounts)

    if (c.sesion_clase_id) processedSessionIds.add(c.sesion_clase_id)

    temasTrabajadosList.push({
      id: c.id,
      fecha: ses?.fecha || '—',
      claseNombre: clase?.nombre || 'Clase',
      instrumento,
      tema: desc,
      nivelLogro: nivel,
    })

    actualizarCatedraResumen(catedrasMap, instrumento, desc, nivel)
  })

  // B. Analizar observaciones_sesion
  observaciones.forEach((o) => {
    const ses = sesionesMap.get(o.sesion_id)
    const clase = ses ? clasesMap.get(ses.clase_id) : null
    const maestro = o.maestro_id ? maestrosMap.get(o.maestro_id) : null
    const instrumento = clase?.instrumento?.trim() || maestro?.especialidad_principal || 'General'

    if (catedra && catedra !== 'Todas' && instrumento.toLowerCase() !== catedra.toLowerCase()) {
      return
    }

    const texto = o.contenido_raw || (typeof o.contenido_parsed === 'string' ? o.contenido_parsed : '')
    if (texto && texto.length > 5) {
      clasificarFocoTecnico(texto, focoTecnicoCounts)
      actualizarCatedraResumen(catedrasMap, instrumento, texto.slice(0, 100), 'practicado')
      if (o.sesion_id) processedSessionIds.add(o.sesion_id)
    }
  })

  // C. Analizar temas/contenidos registrados directamente en sesiones_clase
  sesiones.forEach((s) => {
    const clase = clasesMap.get(s.clase_id)
    const maestro = s.maestro_id ? maestrosMap.get(s.maestro_id) : null
    const instrumento = clase?.instrumento?.trim() || maestro?.especialidad_principal || 'General'

    if (catedra && catedra !== 'Todas' && instrumento.toLowerCase() !== catedra.toLowerCase()) {
      return
    }

    const desc = s.tema?.trim() || s.contenido?.trim()
    if (desc && desc.length > 2) {
      clasificarFocoTecnico(desc, focoTecnicoCounts)
      actualizarCatedraResumen(catedrasMap, instrumento, desc, 'practicado')

      if (!processedSessionIds.has(s.id)) {
        nivelesLogroCounts.practicado += 1
        temasTrabajadosList.push({
          id: s.id,
          fecha: s.fecha || '—',
          claseNombre: clase?.nombre || 'Clase',
          instrumento,
          tema: desc,
          nivelLogro: 'practicado',
        })
      }
    }
  })

  // Generar obras/repertorio listos para concierto (nivel dominado / evaluado)
  const repertorioConcierto = temasTrabajadosList
    .filter((t) => t.nivelLogro === 'dominado' || t.nivelLogro === 'evaluado')
    .slice(0, 20)

  // Generar retos/dificultades recurrentes (nivel reforzado)
  const retosPedagogicos = temasTrabajadosList
    .filter((t) => t.nivelLogro === 'reforzado')
    .slice(0, 15)

  const totalTemas = temasTrabajadosList.length || 1
  const balanceFoco = Object.entries(focoTecnicoCounts).map(([area, cant]) => ({
    area,
    cantidad: cant,
    porcentaje: Math.round((cant / totalTemas) * 100),
  }))

  const catedrasResumen = Array.from(catedrasMap.entries()).map(([nombre, data]) => ({
    catedra: nombre,
    totalSesiones: data.total,
    temasPrincipales: Array.from(data.temas).slice(0, 4),
    tasaDominioPct: data.total > 0 ? Math.round((data.dominados / data.total) * 100) : 0,
  }))

  return {
    status: 'success',
    tipo,
    rango: { fechaInicio: inicio, fechaFin: fin },
    resumen: {
      totalSesionesAnalizadas: (sesiones || []).length,
      totalContenidosRegistrados: (contenidos || []).length + (observaciones || []).length + temasTrabajadosList.length,
      obrasEnProgreso: temasTrabajadosList.length,
      obrasDominadasConcierto: repertorioConcierto.length,
      puntosRefuerzoPendientes: retosPedagogicos.length,
    },
    nivelesLogro: nivelesLogroCounts,
    focoTecnico: balanceFoco,
    catedrasResumen,
    repertorioConcierto,
    retosPedagogicos,
    temasRecientes: temasTrabajadosList.slice(0, 30),
  }
}

/**
 * Clasifica heurísticamente el texto pedagógico en áreas clave.
 */
function clasificarFocoTecnico(texto, focoCounts) {
  const t = texto.toLowerCase()
  if (t.includes('arco') || t.includes('dedo') || t.includes('postura') || t.includes('escala') || t.includes('digitacion')) {
    focoCounts['Técnica & Postura'] += 1
  } else if (t.includes('solfeo') || t.includes('lectura') || t.includes('ritmo') || t.includes('tiempo') || t.includes('metronomo')) {
    focoCounts['Lectura & Rítmica'] += 1
  } else if (t.includes('afinacion') || t.includes('ensamble') || t.includes('seccional') || t.includes('grupo')) {
    focoCounts['Ensamble & Afinación'] += 1
  } else if (t.includes('dinamica') || t.includes('fraseo') || t.includes('expresion') || t.includes('matiz')) {
    focoCounts['Interpretación & Dinámica'] += 1
  } else {
    focoCounts['Repertorio & Obras'] += 1
  }
}

function actualizarCatedraResumen(map, instrumento, tema, nivel) {
  const curr = map.get(instrumento) || { total: 0, dominados: 0, temas: new Set() }
  curr.total += 1
  if (nivel === 'dominado') curr.dominados += 1
  if (tema && tema.length > 3) curr.temas.add(tema.slice(0, 50))
  map.set(instrumento, curr)
}
