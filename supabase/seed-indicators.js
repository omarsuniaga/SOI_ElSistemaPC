/**
 * Seed script: Generate realistic indicators for all 160 violin nodes
 * Usage: node seed-indicators.js (requires supabase client setup)
 * or: paste into browser console after importing supabase
 */

// Define indicator templates per node type
// Each template is: { nombre, description }
const INDICATOR_TEMPLATES = {
  'ESCALA': [
    {
      nombre: 'Postura de Pie',
      description: 'Posición correcta del cuerpo al tocar de pie, con brazos relajados y postura abierta',
    },
    {
      nombre: 'Postura Sentado',
      description: 'Posición correcta del cuerpo al tocar sentado, con instrumento bien apoyado',
    },
    {
      nombre: 'Agarre del Arco',
      description: 'Forma correcta de sostener el arco con todos los dedos en posición natural',
    },
    {
      nombre: 'Punto de Contacto',
      description: 'Control consistente del punto de contacto del arco con la cuerda',
    },
  ],
  'ARPEGIO': [
    {
      nombre: 'Arpegios Diatónicos',
      description: 'Ejecutar arpegios diatónicos con claridad y uniformidad en velocidad',
    },
    {
      nombre: 'Patrones de Dedos',
      description: 'Patrones de dedos consistentes y rítmicos sin vacilaciones',
    },
    {
      nombre: 'Fluidez de Movimiento',
      description: 'Movimiento fluido entre cuerdas sin tensión en mano o brazo',
    },
    {
      nombre: 'Velocidad Gradual',
      description: 'Capacidad de ejecutar arpegios a diferentes velocidades con control',
    },
  ],
  'MANO_IZQ': [
    {
      nombre: 'Posición Correcta',
      description: 'Posición correcta de la mano izquierda con muñeca recta y dedos curvados',
    },
    {
      nombre: 'Afinación Primera Posición',
      description: 'Afinación precisa en primera posición con variaciones de semitono',
    },
    {
      nombre: 'Presión de Dedos',
      description: 'Presión suficiente de dedos sin tensión excesiva',
    },
    {
      nombre: 'Cambios de Posición',
      description: 'Cambios de posición fluidos y precisos manteniendo continuidad tonal',
    },
  ],
  'ARCO': [
    {
      nombre: 'Distribución de Arco',
      description: 'Distribución equilibrada del arco a lo largo de la duración de notas',
    },
    {
      nombre: 'Velocidad de Arco',
      description: 'Control de velocidad del arco proporcional a dinámicas requeridas',
    },
    {
      nombre: 'Dirección Limpia',
      description: 'Cambios de dirección del arco sin saltos o ruidos parásitos',
    },
    {
      nombre: 'Presión del Arco',
      description: 'Presión adecuada para producir sonido de calidad según dinámicas',
    },
  ],
  'SONIDO': [
    {
      nombre: 'Calidad Tonal',
      description: 'Producción de sonido cálido, resonante y sin tensión',
    },
    {
      nombre: 'Proyección',
      description: 'Proyección clara del sonido sin exceso de presión',
    },
    {
      nombre: 'Uniformidad',
      description: 'Uniformidad tonal consistente en todas las dinámicas',
    },
    {
      nombre: 'Vibrato',
      description: 'Vibrato natural y controlado cuando es apropiado',
    },
  ],
  'AFINACION': [
    {
      nombre: 'Afinación Intervalos',
      description: 'Afinación precisa de intervalos mayores, menores y perfectos',
    },
    {
      nombre: 'Escala Cromática',
      description: 'Ejecución de escala cromática afinada en todas las posiciones',
    },
    {
      nombre: 'Oído Relativo',
      description: 'Identificación auditiva de notas desafinadas y corrección rápida',
    },
    {
      nombre: 'Estabilidad Intonación',
      description: 'Estabilidad de afinación durante transiciones dinámicas',
    },
  ],
  'TECNICA': [
    {
      nombre: 'Estudios Progresivos',
      description: 'Ejecución de estudios técnicos con tempo y precisión adecuados',
    },
    {
      nombre: 'Coordinación Manos',
      description: 'Coordinación perfecta entre mano izquierda y derecha',
    },
    {
      nombre: 'Agilidad de Dedos',
      description: 'Agilidad de dedos en pasajes técnicos a diferentes velocidades',
    },
    {
      nombre: 'Claridad Técnica',
      description: 'Claridad en la ejecución de técnicas especializadas sin errores',
    },
  ],
  'REPERTORIO': [
    {
      nombre: 'Interpretación Musical',
      description: 'Interpretación musical con fraseo y expresión apropiados',
    },
    {
      nombre: 'Memoria Musical',
      description: 'Capacidad de tocar de memoria piezas del repertorio con confianza',
    },
    {
      nombre: 'Estilo y Periodo',
      description: 'Entendimiento y aplicación de características estilísticas del periodo',
    },
    {
      nombre: 'Consistencia Ejecución',
      description: 'Ejecución consistente de piezas complejas sin vacilaciones',
    },
  ],
}

/**
 * Generate and insert indicators for all nodes
 * @param {SupabaseClient} supabase — Supabase client instance
 * @returns {Promise<object>} — { inserted: number, errors: array }
 */
async function seedIndicators(supabase) {
  console.log('🌱 Starting indicator seeding...')

  try {
    // 1. Fetch all nodes grouped by type
    const { data: allNodes, error: nodesError } = await supabase
      .from('nodes')
      .select('id, name, type, level_id')
      .order('type, order_index')

    if (nodesError) throw nodesError

    console.log(`📊 Found ${allNodes.length} nodes`)

    // 2. Group nodes by type
    const nodesByType = {}
    allNodes.forEach(node => {
      if (!nodesByType[node.type]) nodesByType[node.type] = []
      nodesByType[node.type].push(node)
    })

    console.log(`📁 Node types: ${Object.keys(nodesByType).join(', ')}`)

    // 3. Build indicators to insert
    const indicatorsToInsert = []
    let totalCount = 0

    Object.entries(nodesByType).forEach(([nodeType, nodes]) => {
      const templates = INDICATOR_TEMPLATES[nodeType] || []

      nodes.forEach((node, nodeIndex) => {
        // Cycle through templates, rotating if more nodes than templates
        templates.forEach((template, templateIndex) => {
          indicatorsToInsert.push({
            node_id: node.id,
            nombre: template.nombre,
            description: template.description,
            is_required: true,
            activo: true,
            order_index: templateIndex + 1,
          })
          totalCount++
        })
      })
    })

    console.log(`✏️ Prepared ${totalCount} indicators to insert`)

    // 4. Insert in batches (Supabase has a 1000-row limit per request)
    const BATCH_SIZE = 1000
    let inserted = 0
    const errors = []

    for (let i = 0; i < indicatorsToInsert.length; i += BATCH_SIZE) {
      const batch = indicatorsToInsert.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1

      console.log(`📤 Inserting batch ${batchNum} (${batch.length} items)...`)

      const { data, error } = await supabase
        .from('indicators')
        .insert(batch)
        .select('id')

      if (error) {
        console.error(`❌ Batch ${batchNum} failed:`, error.message)
        errors.push({ batch: batchNum, error: error.message })
      } else {
        inserted += (data?.length || 0)
        console.log(`✅ Batch ${batchNum} inserted ${data?.length || 0} rows`)
      }
    }

    console.log(`\n🎉 Seeding complete!`)
    console.log(`✅ Successfully inserted: ${inserted} indicators`)
    if (errors.length > 0) {
      console.log(`❌ Failed batches: ${errors.length}`)
      errors.forEach(e => console.log(`   - Batch ${e.batch}: ${e.error}`))
    }

    return { inserted, errors, total: totalCount }

  } catch (err) {
    console.error('💥 Fatal error:', err.message)
    throw err
  }
}

// Export for ES6 modules and browser
export { seedIndicators, INDICATOR_TEMPLATES }

// Also support CommonJS for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { seedIndicators, INDICATOR_TEMPLATES }
}
