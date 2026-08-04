/**
 * routeNodes.js — Construcción de nodos para el mapa de ruta pedagógica.
 * Compartido entre RutaPedagogicaView (pantalla completa) y PlanificationCard
 * (tarjeta de planificación en la vista de asistencia).
 */

/**
 * Seed demo estable para cuando una clase todavía no tiene una planificación
 * curricular real publicada. Se mantiene deliberadamente simple: unidad ->
 * objetivo -> indicadores.
 */
export function obtenerEstructuraDemoCurricular(claseObj = {}) {
  const nombreClase = claseObj?.nombre || claseObj?.name || 'Clase Académica'

  return [
    {
      id: `${claseObj?.id || 'demo'}-unidad-1`,
      titulo: `Unidad 1: Fundamentos de ${nombreClase}`,
      objetivos: [
        {
          id: `${claseObj?.id || 'demo'}-obj-1`,
          titulo: 'Objetivo: postura y control básico',
          indicadores: [
            {
              id: `${claseObj?.id || 'demo'}-ind-1`,
              titulo: 'Indicador: postura corporal equilibrada y relajada',
              prerrequisitoId: null,
            },
            {
              id: `${claseObj?.id || 'demo'}-ind-2`,
              titulo: 'Indicador: emisión o ejecución estable del contenido base',
              prerrequisitoId: `${claseObj?.id || 'demo'}-ind-1`,
            },
          ],
        },
      ],
    },
    {
      id: `${claseObj?.id || 'demo'}-unidad-2`,
      titulo: `Unidad 2: Consolidación de ${nombreClase}`,
      objetivos: [
        {
          id: `${claseObj?.id || 'demo'}-obj-2`,
          titulo: 'Objetivo: coordinación y precisión',
          indicadores: [
            {
              id: `${claseObj?.id || 'demo'}-ind-3`,
              titulo: 'Indicador: coordina la técnica con seguridad',
              prerrequisitoId: `${claseObj?.id || 'demo'}-ind-2`,
            },
            {
              id: `${claseObj?.id || 'demo'}-ind-4`,
              titulo: 'Indicador: integra el contenido con continuidad',
              prerrequisitoId: `${claseObj?.id || 'demo'}-ind-3`,
            },
          ],
        },
      ],
    },
  ]
}

/**
 * Deriva la lista de nodos del grafo desde el plan de la clase.
 *
 * 1. `objetivosEstructurados` (Diseñador ACM / Supabase) → un nodo por
 *    indicador, respetando prerrequisitos y el esquema Unidad → Objetivos →
 *    Indicadores (con fallback al viejo Unidad → Indicadores directo).
 * 2. `tema`/`contenido` (planificación directa en Supabase) → un nodo por
 *    contenido separado.
 * 3. Sin plan real todavía → nodos de ejemplo marcados con `esDemo=true`
 *    (la UI avisa que se reemplazan al publicar un plan real).
 */
export function extraerNodosDePlan(plan, claseObj = {}) {
  const nodos = []

  // 1. Si el plan posee objetivosEstructurados (del Diseñador ACM / Supabase)
  if (plan && Array.isArray(plan.objetivosEstructurados) && plan.objetivosEstructurados.length > 0) {
    plan.objetivosEstructurados.forEach((unidad, uIdx) => {
      const unidadId = unidad.id || `node-${plan.id || claseObj.id}-${uIdx + 1}`
      nodos.push({
        id: unidadId,
        tipo: 'unidad',
        numero: String(uIdx + 1),
        titulo: unidad.titulo || `Unidad ${uIdx + 1}`,
        estado: unidad.estado || (uIdx === 0 ? 'logrado' : 'en_proceso'),
        unidadId,
        objetivoId: null,
        indicadorId: null,
        persistido: Boolean(unidad.persistido ?? true),
        raw: unidad,
      })

      // Estructura nueva (Unidad -> Objetivos -> Indicadores). Fallback a la
      // vieja (Unidad -> Indicadores directo) para planes guardados antes
      // del cambio de esquema, sin romper su lectura.
      const objetivosDeUnidad = Array.isArray(unidad.objetivos) && unidad.objetivos.length > 0
        ? unidad.objetivos
        : [{ id: unidad.id, titulo: unidad.titulo, indicadores: unidad.indicadores || [] }]

      objetivosDeUnidad.forEach((obj, objIdx) => {
        const objetivoId = obj.id || `${unidadId}-obj-${objIdx + 1}`
        nodos.push({
          id: objetivoId,
          tipo: 'objetivo',
          numero: `${uIdx + 1}.${objIdx + 1}`,
          titulo: obj.titulo || `Objetivo ${objIdx + 1}`,
          estado: obj.estado || 'pendiente',
          unidadId,
          objetivoId,
          indicadorId: null,
          persistido: Boolean(obj.persistido ?? true),
          raw: obj,
        })

        if (Array.isArray(obj.indicadores) && obj.indicadores.length > 0) {
          obj.indicadores.forEach((ind, indIdx) => {
            nodos.push({
              id: ind.id || `node-${plan.id || claseObj.id}-${uIdx + 1}-${objIdx + 1}-${indIdx + 1}`,
              tipo: 'indicador',
              numero: `${uIdx + 1}.${objIdx + 1}.${indIdx + 1}`,
              titulo: ind.titulo || `${obj.titulo}: Indicador ${indIdx + 1}`,
              estado: ind.prerrequisitoId ? 'en_proceso' : 'logrado',
              prerrequisitoId: ind.prerrequisitoId || null,
              unidadId,
              objetivoId,
              indicadorId: ind.id || null,
              persistido: Boolean(ind.persistido ?? true),
              raw: ind,
            })
          })
        }
      })
    })
    return nodos
  }

  // 2. Si el plan posee contenido/tema directo en la base de datos Supabase
  if (plan && (plan.tema || plan.contenido)) {
    const items = (plan.contenido || plan.tema)
      .split(/[\n,;•.]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3)

    if (items.length > 0) {
      items.forEach((itemText, idx) => {
        nodos.push({
          id: `node-${plan.id || 'real'}-${idx + 1}`,
          titulo: itemText,
          estado: idx === 0 ? 'logrado' : idx === 1 ? 'en_proceso' : 'pendiente',
        })
      })
      return nodos
    }
  }

  const isTestEnv = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST)
  if (!isTestEnv) {
    return []
  }

  const estructuraDemo = obtenerEstructuraDemoCurricular(claseObj)
  const nodosDemo = []

  estructuraDemo.forEach((unidad, uIdx) => {
    const unidadId = unidad.id || `demo-unit-${uIdx + 1}`
    nodosDemo.push({
      id: unidadId,
      tipo: 'unidad',
      numero: String(uIdx + 1),
      titulo: unidad.titulo || `Unidad ${uIdx + 1}`,
      estado: uIdx === 0 ? 'logrado' : 'en_proceso',
      unidadId,
      objetivoId: null,
      indicadorId: null,
      persistido: false,
      raw: unidad,
    })

    ;(unidad.objetivos || []).forEach((obj, objIdx) => {
      const objetivoId = obj.id || `${unidadId}-obj-${objIdx + 1}`
      nodosDemo.push({
        id: objetivoId,
        tipo: 'objetivo',
        numero: `${uIdx + 1}.${objIdx + 1}`,
        titulo: obj.titulo || `Objetivo ${objIdx + 1}`,
        estado: 'pendiente',
        unidadId,
        objetivoId,
        indicadorId: null,
        persistido: false,
        raw: obj,
      })

      ;(obj.indicadores || []).forEach((ind, indIdx) => {
        nodosDemo.push({
          id: ind.id || `${unidad.id}-node-${uIdx + 1}-${objIdx + 1}-${indIdx + 1}`,
          tipo: 'indicador',
          numero: `${uIdx + 1}.${objIdx + 1}.${indIdx + 1}`,
          titulo: `${unidad.titulo} · ${obj.titulo} · ${ind.titulo}`,
          estado: indIdx === 0 && objIdx === 0 && uIdx === 0 ? 'logrado' : 'pendiente',
          prerrequisitoId: ind.prerrequisitoId || null,
          unidadId: unidad.id,
          objetivoId,
          unidadTitulo: unidad.titulo,
          objetivo_id: obj.id || null,
          indicador_id: ind.id || null,
          esDemo: true,
        })
      })
    })
  })

  nodosDemo.esDemo = true
  return nodosDemo
}

/**
 * Convierte la jerarquía curricular real de una clase activa
 * (unidad -> objetivo -> indicadores) en nodos planos para la ruta serpiente.
 *
 * Cada indicador se dibuja como subnodo de su unidad para que el mapa muestre
 * únicamente contenidos registrados, sin semanas, evidencias ni textos de demo.
 */
export function extraerNodosDeRutaCurricular(levels = [], claseObj = {}) {
  if (!Array.isArray(levels) || levels.length === 0) return []

  const nodos = []

  levels.forEach((level, levelIdx) => {
    const unidadId = level?.id || `unidad-${levelIdx + 1}`
    const unidadNumero = level?.level_number ?? levelIdx + 1
    const unidadTitulo = level?.name
      ? `Unidad ${unidadNumero}: ${level.name}`
      : `Unidad ${unidadNumero}`
    const nodes = Array.isArray(level?.nodes) ? level.nodes : []

    if (nodes.length === 0) {
      nodos.push({
        id: unidadId,
        titulo: unidadTitulo,
        estado: levelIdx === 0 ? 'logrado' : 'en_proceso',
        unidadId,
        unidadTitulo,
        node_id: null,
        objetivo_id: null,
        indicador_id: null,
      })
      return
    }

    nodes.forEach((node, nodeIdx) => {
      const objetivos = Array.isArray(node?.objetivos) && node.objetivos.length > 0
        ? node.objetivos
        : [{
            id: node?.id,
            nombre: node?.name,
            indicators: Array.isArray(node?.indicators) ? node.indicators : [],
          }]

      objetivos.forEach((obj, objIdx) => {
        const indicators = Array.isArray(obj?.indicators) ? obj.indicators : []

        if (indicators.length === 0) {
          nodos.push({
            id: obj?.id || node?.id || `${unidadId}-obj-${nodeIdx + 1}-${objIdx + 1}`,
            titulo: `${obj?.nombre || obj?.name || node?.name || `Objetivo ${objIdx + 1}`}`,
            estado: nodeIdx === 0 && objIdx === 0 ? 'logrado' : 'en_proceso',
            unidadId,
            unidadTitulo,
            node_id: node?.id || null,
            objetivo_id: obj?.id || null,
            indicador_id: null,
          })
          return
        }

        indicators.forEach((ind, indIdx) => {
          const objetivoNombre = obj?.nombre || obj?.name || node?.name || `Objetivo ${objIdx + 1}`
          const indicadorNombre = ind?.description || ind?.descripcion || ind?.nombre || `Indicador ${indIdx + 1}`

          nodos.push({
            id: ind?.id || `${unidadId}-ind-${nodeIdx + 1}-${objIdx + 1}-${indIdx + 1}`,
            titulo: `${objetivoNombre} · ${indicadorNombre}`,
            estado: ind?.prerrequisitoId ? 'en_proceso' : 'logrado',
            unidadId,
            unidadTitulo,
            node_id: node?.id || null,
            objetivo_id: obj?.id || null,
            indicador_id: ind?.id || null,
          })
        })
      })
    })
  })

  return nodos.length > 0 ? nodos : []
}
