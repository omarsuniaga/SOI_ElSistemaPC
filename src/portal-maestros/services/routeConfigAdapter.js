import { supabase } from '../../lib/supabaseClient.js'

/**
 * Adaptador para la Configuración de Rutas Académicas (5 Niveles)
 * Conectado directamente a Supabase.
 */
export const RouteConfigAdapter = {
  // --- 1. CLASES ---
  async getClasses(maestroId = null) {
    let query = supabase.from('plan_clases').select('*').eq('activo', true)

    if (maestroId) {
      query = query.eq('maestro_id', maestroId)
    }

    const { data, error } = await query.order('nombre')

    if (error) {
      console.error('Error loading classes:', error)
      return []
    }
    return data
  },

  /**
   * Resuelve inteligentemente qué planificación asignar a una clase real.
   * @param {Object} clase - Objeto de la tabla 'clases' (nombre, instrumento, etc)
   * @param {String} [maestroId] - Opcional uuid del maestro
   */
  async resolveSmartPlan(clase, maestroId = null) {
    const allPlanes = await this.getClasses(maestroId || clase.maestro_id)
    if (!allPlanes.length) return null

    // 0. Coincidencia exacta por clase_id
    let match = allPlanes.find((p) => p.clase_id === clase.id)
    if (match) return match

    const nombreClase = (clase.nombre || '').toLowerCase()
    const instrumento = (clase.instrumento || '').toLowerCase()

    // 1. Coincidencia exacta por nombre
    match = allPlanes.find((p) => (p.nombre || '').toLowerCase() === nombreClase)
    if (match) return match

    // 2. Coincidencia por instrumento
    if (instrumento) {
      match = allPlanes.find((p) => (p.nombre || '').toLowerCase().includes(instrumento))
      if (match) return match
    }

    // 3. Coincidencia parcial (fuzzy)
    match = allPlanes.find((p) => {
      const pNombre = (p.nombre || '').toLowerCase()
      return nombreClase.includes(pNombre) || pNombre.includes(nombreClase)
    })

    return match || allPlanes[0]
  },

  async addClass(name, maestroId = null, claseId = null) {
    const insertData = { nombre: name }
    if (maestroId) {
      insertData.maestro_id = maestroId
    }
    if (claseId) {
      insertData.clase_id = claseId
    }
    const { data, error } = await supabase
      .from('plan_clases')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateClass(id, name) {
    const { error } = await supabase.from('plan_clases').update({ nombre: name }).eq('id', id)

    if (error) throw error
  },

  async deleteClass(id) {
    const { error } = await supabase.from('plan_clases').delete().eq('id', id)

    if (error) throw error
  },

  // --- 2. NIVELES ---
  async getLevelsByClass(classId) {
    const { data, error } = await supabase
      .from('plan_niveles')
      .select('*')
      .eq('clase_id', classId)
      .order('numero_nivel', { ascending: true })

    if (error) {
      console.error('Error loading levels:', error)
      return []
    }
    return data
  },

  async addLevel({ clase_id, nombre, numero_nivel }) {
    const { data, error } = await supabase
      .from('plan_niveles')
      .insert([
        {
          clase_id,
          nombre,
          numero_nivel: numero_nivel || 1,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateLevel(id, levelData) {
    const { error } = await supabase.from('plan_niveles').update(levelData).eq('id', id)

    if (error) throw error
  },

  async deleteLevel(id) {
    const { error } = await supabase.from('plan_niveles').delete().eq('id', id)

    if (error) throw error
  },

  // --- 3. TEMAS (NODES) ---
  async getNodesByLevel(levelId) {
    const { data, error } = await supabase
      .from('plan_temas')
      .select('*')
      .eq('nivel_id', levelId)
      .order('orden_index')

    if (error) {
      console.error('Error loading topics:', error)
      return []
    }
    return data
  },

  async addNode({ nivel_id, nombre, tipo }) {
    const { data, error } = await supabase
      .from('plan_temas')
      .insert([
        {
          nivel_id,
          nombre,
          tipo: tipo || 'TECNICA',
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateNode(id, nodeData) {
    const { error } = await supabase.from('plan_temas').update(nodeData).eq('id', id)

    if (error) throw error
  },

  async deleteNode(id) {
    const { error } = await supabase.from('plan_temas').delete().eq('id', id)

    if (error) throw error
  },

  // --- 4. OBJETIVOS ---
  async getObjectivesByNode(nodeId) {
    const { data, error } = await supabase
      .from('plan_objetivos')
      .select('*')
      .eq('tema_id', nodeId)
      .order('orden_index')

    if (error) {
      console.error('Error loading objectives:', error)
      return []
    }
    return data
  },

  async addObjective({ tema_id, nombre }) {
    const { data, error } = await supabase
      .from('plan_objetivos')
      .insert([
        {
          tema_id,
          nombre,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateObjective(id, name) {
    const { error } = await supabase.from('plan_objetivos').update({ nombre: name }).eq('id', id)

    if (error) throw error
  },

  async deleteObjective(id) {
    const { error } = await supabase.from('plan_objetivos').delete().eq('id', id)

    if (error) throw error
  },

  // --- 5. INDICADORES ---
  async getIndicatorsByObjective(objectiveId) {
    const { data, error } = await supabase
      .from('plan_indicadores')
      .select('*')
      .eq('objetivo_id', objectiveId)
      .order('orden_index')

    if (error) {
      console.error('Error loading indicators:', error)
      return []
    }
    return data
  },

  async addIndicator({ objetivo_id, descripcion, es_requerido }) {
    const { data, error } = await supabase
      .from('plan_indicadores')
      .insert([
        {
          objetivo_id,
          descripcion,
          es_requerido: es_requerido ?? true,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateIndicator(id, indicatorData) {
    const { error } = await supabase.from('plan_indicadores').update(indicatorData).eq('id', id)

    if (error) throw error
  },

  async deleteIndicator(id) {
    const { error } = await supabase.from('plan_indicadores').delete().eq('id', id)

    if (error) throw error
  },

  async updateIndicatorCalificacion(indicatorId, calificacion) {
    const { error } = await supabase
      .from('plan_indicadores')
      .update({ calificacion })
      .eq('id', indicatorId)
    if (error) throw error
  },

  // --- MÉTODOS DE COMPATIBILIDAD ---
  async getRouteHierarchy(classId, maestroId = null) {
    // Si no hay ID, intentamos cargar la primera clase activa
    let targetClassId = classId
    if (!targetClassId) {
      const classes = await this.getClasses(maestroId)
      if (classes.length > 0) targetClassId = classes[0].id
      else return null
    }

    const { data: levels, error } = await supabase
      .from('plan_niveles')
      .select(
        `
        *,
        plan_temas (
          *,
          plan_objetivos (
            *,
            plan_indicadores (*)
          )
        )
      `,
      )
      .eq('clase_id', targetClassId)
      .order('numero_nivel')

    if (error) {
      console.error('Error loading hierarchy:', error)
      return null
    }

    return levels
  },

  // --- 6. IMPORTACIÓN MASIVA (IA) ---
  async importStructure(claseId, structure) {
    if (!claseId || !structure) throw new Error('Faltan datos para la importación.')

    console.log(
      `[Adapter] Iniciando importación masiva optimizada (4 niveles) para clase: ${claseId}`,
    )

    for (const nivel of structure.niveles || []) {
      // 1. Crear Nivel
      const { data: newLevel, error: errL } = await supabase
        .from('plan_niveles')
        .insert([
          {
            clase_id: claseId,
            nombre: nivel.nombre,
            numero_nivel: nivel.numero_nivel || 1,
            objetivo_general: nivel.objetivo_general,
          },
        ])
        .select()
        .single()

      if (errL) throw errL

      // 2. Batch Temas
      const temasParaInsertar = (nivel.temas || []).map((t) => ({
        nivel_id: newLevel.id,
        nombre: t.nombre,
        tipo: t.tipo || 'TECNICA',
        es_critico: t.es_critico || false,
        _originalRef: t,
      }))

      if (!temasParaInsertar.length) continue
      const { data: newTemas, error: errT } = await supabase
        .from('plan_temas')
        .insert(temasParaInsertar.map(({ _originalRef, ...rest }) => rest))
        .select()
      if (errT) throw errT

      // 3. Batch Objetivos por Tema
      for (let i = 0; i < newTemas.length; i++) {
        const newTema = newTemas[i]
        const originalTema = temasParaInsertar[i]._originalRef
        const objetivosRaw = originalTema.objetivos || []

        if (!objetivosRaw.length) continue

        const objetivosParaInsertar = objetivosRaw.map((obj) => ({
          tema_id: newTema.id,
          nombre: obj.nombre || obj,
          _originalRef: obj,
        }))

        const { data: newObjs, error: errO } = await supabase
          .from('plan_objetivos')
          .insert(objetivosParaInsertar.map(({ _originalRef, ...rest }) => rest))
          .select()
        if (errO) throw errO

        // 4. Batch Indicadores por Objetivo
        const indicadoresParaInsertar = []
        newObjs.forEach((newObj, oIdx) => {
          const originalObj = objetivosParaInsertar[oIdx]._originalRef
          if (originalObj.indicadores && originalObj.indicadores.length > 0) {
            originalObj.indicadores.forEach((ind) => {
              indicadoresParaInsertar.push({
                objetivo_id: newObj.id,
                descripcion: ind.descripcion,
                es_requerido: ind.es_requerido ?? true,
              })
            })
          }
        })

        if (indicadoresParaInsertar.length > 0) {
          const { error: errI } = await supabase
            .from('plan_indicadores')
            .insert(indicadoresParaInsertar)
          if (errI) throw errI
        }
      }
    }

    console.log('[Adapter] Importación masiva (4 niveles) completada con éxito.')
    return true
  },
}
