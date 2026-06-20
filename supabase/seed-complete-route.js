/**
 * Complete Route Seeding: Routes → Levels → Nodes → Indicators
 * Creates the full Violin academic pathway with 160 nodes across 10 levels
 */

// Node type configuration - 8 types total
const NODE_TYPES = ['ESCALA', 'ARPEGIO', 'MANO_IZQ', 'ARCO', 'SONIDO', 'AFINACION', 'TECNICA', 'REPERTORIO']

// Indicator templates per node type
const INDICATOR_TEMPLATES = {
  'ESCALA': [
    { nombre: 'Postura de Pie', description: 'Posición correcta del cuerpo al tocar de pie, con brazos relajados y postura abierta' },
    { nombre: 'Postura Sentado', description: 'Posición correcta del cuerpo al tocar sentado, con instrumento bien apoyado' },
    { nombre: 'Agarre del Arco', description: 'Forma correcta de sostener el arco con todos los dedos en posición natural' },
    { nombre: 'Punto de Contacto', description: 'Control consistente del punto de contacto del arco con la cuerda' },
  ],
  'ARPEGIO': [
    { nombre: 'Arpegios Diatónicos', description: 'Ejecutar arpegios diatónicos con claridad y uniformidad en velocidad' },
    { nombre: 'Patrones de Dedos', description: 'Patrones de dedos consistentes y rítmicos sin vacilaciones' },
    { nombre: 'Fluidez de Movimiento', description: 'Movimiento fluido entre cuerdas sin tensión en mano o brazo' },
    { nombre: 'Velocidad Gradual', description: 'Capacidad de ejecutar arpegios a diferentes velocidades con control' },
  ],
  'MANO_IZQ': [
    { nombre: 'Posición Correcta', description: 'Posición correcta de la mano izquierda con muñeca recta y dedos curvados' },
    { nombre: 'Afinación Primera Posición', description: 'Afinación precisa en primera posición con variaciones de semitono' },
    { nombre: 'Presión de Dedos', description: 'Presión suficiente de dedos sin tensión excesiva' },
    { nombre: 'Cambios de Posición', description: 'Cambios de posición fluidos y precisos manteniendo continuidad tonal' },
  ],
  'ARCO': [
    { nombre: 'Distribución de Arco', description: 'Distribución equilibrada del arco a lo largo de la duración de notas' },
    { nombre: 'Velocidad de Arco', description: 'Control de velocidad del arco proporcional a dinámicas requeridas' },
    { nombre: 'Dirección Limpia', description: 'Cambios de dirección del arco sin saltos o ruidos parásitos' },
    { nombre: 'Presión del Arco', description: 'Presión adecuada para producir sonido de calidad según dinámicas' },
  ],
  'SONIDO': [
    { nombre: 'Calidad Tonal', description: 'Producción de sonido cálido, resonante y sin tensión' },
    { nombre: 'Proyección', description: 'Proyección clara del sonido sin exceso de presión' },
    { nombre: 'Uniformidad', description: 'Uniformidad tonal consistente en todas las dinámicas' },
    { nombre: 'Vibrato', description: 'Vibrato natural y controlado cuando es apropiado' },
  ],
  'AFINACION': [
    { nombre: 'Afinación Intervalos', description: 'Afinación precisa de intervalos mayores, menores y perfectos' },
    { nombre: 'Escala Cromática', description: 'Ejecución de escala cromática afinada en todas las posiciones' },
    { nombre: 'Oído Relativo', description: 'Identificación auditiva de notas desafinadas y corrección rápida' },
    { nombre: 'Estabilidad Intonación', description: 'Estabilidad de afinación durante transiciones dinámicas' },
  ],
  'TECNICA': [
    { nombre: 'Estudios Progresivos', description: 'Ejecución de estudios técnicos con tempo y precisión adecuados' },
    { nombre: 'Coordinación Manos', description: 'Coordinación perfecta entre mano izquierda y derecha' },
    { nombre: 'Agilidad de Dedos', description: 'Agilidad de dedos en pasajes técnicos a diferentes velocidades' },
    { nombre: 'Claridad Técnica', description: 'Claridad en la ejecución de técnicas especializadas sin errores' },
  ],
  'REPERTORIO': [
    { nombre: 'Interpretación Musical', description: 'Interpretación musical con fraseo y expresión apropiados' },
    { nombre: 'Memoria Musical', description: 'Capacidad de tocar de memoria piezas del repertorio con confianza' },
    { nombre: 'Estilo y Periodo', description: 'Entendimiento y aplicación de características estilísticas del periodo' },
    { nombre: 'Consistencia Ejecución', description: 'Ejecución consistente de piezas complejas sin vacilaciones' },
  ],
}

// Level definitions (10 levels)
const LEVELS_CONFIG = [
  { number: 1, name: 'Primer Contacto', objective: 'Introducción al instrumento, postura básica y primeras notas' },
  { number: 2, name: 'Fundamentos I', objective: 'Desarrollo de habilidades de lectura y técnica básica' },
  { number: 3, name: 'Fundamentos II', objective: 'Mejora de la precisión y control del sonido' },
  { number: 4, name: 'Progresión I', objective: 'Introducción a dinámicas y articulaciones' },
  { number: 5, name: 'Progresión II', objective: 'Desarrollo de velocidad y agilidad' },
  { number: 6, name: 'Intermedio I', objective: 'Repertorio más complejo y técnica avanzada' },
  { number: 7, name: 'Intermedio II', objective: 'Interpretación musical y expresión' },
  { number: 8, name: 'Avanzado I', objective: 'Piezas de concierto y técnica especializada' },
  { number: 9, name: 'Avanzado II', objective: 'Dominio del instrumento y virtuosismo' },
  { number: 10, name: 'Maestría', objective: 'Perfección técnica y artística del instrumento' },
]

// Nodes per level (16 nodes × 10 levels = 160 nodes)
const NODES_PER_LEVEL = 16

// Node configuration: which 2 node types per level (distributed)
const NODE_TYPE_DISTRIBUTION = [
  ['ESCALA', 'ARCO'],          // Level 1
  ['ESCALA', 'SONIDO'],        // Level 2
  ['MANO_IZQ', 'ARCO'],        // Level 3
  ['AFINACION', 'TECNICA'],    // Level 4
  ['ARPEGIO', 'SONIDO'],       // Level 5
  ['MANO_IZQ', 'REPERTORIO'],  // Level 6
  ['TECNICA', 'AFINACION'],    // Level 7
  ['ARPEGIO', 'REPERTORIO'],   // Level 8
  ['ESCALA', 'TECNICA'],       // Level 9
  ['SONIDO', 'REPERTORIO'],    // Level 10
]

// Generate node definitions for a level
function generateLevelNodes(levelId, levelNumber, versionId) {
  const nodes = []
  const typeDistribution = NODE_TYPE_DISTRIBUTION[levelNumber - 1]
  const nodesPerType = NODES_PER_LEVEL / 2 // 8 nodes per type

  // Generate nodes alternating between the 2 types for this level
  for (let i = 0; i < NODES_PER_LEVEL; i++) {
    const typeIndex = Math.floor(i / nodesPerType)
    const typeInLevel = typeDistribution[typeIndex]
    const nodeNumber = i + 1

    nodes.push({
      level_id: levelId,
      route_version_id: versionId, // Añadido para el constraint
      name: `${typeInLevel} ${nodeNumber} - Nivel ${levelNumber}`,
      type: typeInLevel,
      order_index: nodeNumber,
      is_critical: ['SONIDO', 'AFINACION'].includes(typeInLevel) && levelNumber >= 3,
    })
  }

  return nodes
}

/**
 * Seed the complete route structure
 */
async function seedCompleteRoute(supabase) {
  console.log('🌱 Starting complete route seeding...\n')

  try {
    // 1. Create Route
    console.log('📍 Step 1: Creating Route...')
    const { data: routeData, error: routeError } = await supabase
      .from('routes')
      .insert({
        name: 'Ruta del Violín',
        instrument: 'violín',
        description: 'Camino completo de aprendizaje del violín desde principiante hasta maestría',
        status: 'published',
      })
      .select('id')
      .single()

    if (routeError) throw new Error(`Route creation failed: ${routeError.message}`)
    const routeId = routeData.id
    console.log(`   ✅ Route created: ${routeId}`)

    // 2. Create Route Version
    console.log('\n📍 Step 2: Creating Route Version...')
    const { data: versionData, error: versionError } = await supabase
      .from('route_versions')
      .insert({
        route_id: routeId,
        version: 1,
        status: 'published',
        notes: 'Versión 1.0 de la ruta del violín',
      })
      .select('id')
      .single()

    if (versionError) throw new Error(`Route version creation failed: ${versionError.message}`)
    const versionId = versionData.id
    console.log(`   ✅ Route version created: ${versionId}`)

    // 3. Create Levels
    console.log('\n📍 Step 3: Creating 10 Levels...')
    const levelsToInsert = LEVELS_CONFIG.map(config => ({
      route_version_id: versionId,
      level_number: config.number,
      name: config.name,
      main_objective: config.objective,
    }))

    const { data: levelsData, error: levelsError } = await supabase
      .from('levels')
      .insert(levelsToInsert)
      .select('id, level_number')

    if (levelsError) throw new Error(`Levels creation failed: ${levelsError.message}`)
    console.log(`   ✅ ${levelsData.length} levels created`)

    // Map level_number to level_id for node creation
    const levelMap = {}
    levelsData.forEach(level => {
      levelMap[level.level_number] = level.id
    })

    // 4. Create Nodes (160 total, 16 per level)
    console.log('\n📍 Step 4: Creating 160 Nodes...')
    const allNodesToInsert = []
    for (let levelNum = 1; levelNum <= 10; levelNum++) {
      const levelId = levelMap[levelNum]
      const levelNodes = generateLevelNodes(levelId, levelNum, versionId)
      allNodesToInsert.push(...levelNodes)
    }

    // Insert in batches
    const BATCH_SIZE = 100
    let insertedNodes = 0
    const nodeIds = []

    for (let i = 0; i < allNodesToInsert.length; i += BATCH_SIZE) {
      const batch = allNodesToInsert.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1

      const { data: nodesData, error: nodesError } = await supabase
        .from('nodes')
        .insert(batch)
        .select('id, type, level_id')

      if (nodesError) throw new Error(`Nodes batch ${batchNum} failed: ${nodesError.message}`)
      insertedNodes += nodesData.length
      nodeIds.push(...nodesData)
      console.log(`   ✅ Batch ${batchNum}: ${nodesData.length} nodes inserted`)
    }

    console.log(`   ✅ Total ${insertedNodes} nodes created`)

    // 5. Create Indicators (4 per node)
    console.log('\n📍 Step 5: Creating Indicators...')
    const allIndicatorsToInsert = []

    nodeIds.forEach(node => {
      const templates = INDICATOR_TEMPLATES[node.type] || []
      templates.forEach((template, idx) => {
        allIndicatorsToInsert.push({
          node_id: node.id,
          nombre: template.nombre,
          description: template.description,
          is_required: true,
          activo: true,
          order_index: idx + 1,
        })
      })
    })

    let insertedIndicators = 0
    for (let i = 0; i < allIndicatorsToInsert.length; i += BATCH_SIZE) {
      const batch = allIndicatorsToInsert.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1

      const { data: indData, error: indError } = await supabase
        .from('indicators')
        .insert(batch)
        .select('id')

      if (indError) throw new Error(`Indicators batch ${batchNum} failed: ${indError.message}`)
      insertedIndicators += indData.length
      console.log(`   ✅ Batch ${batchNum}: ${indData.length} indicators inserted`)
    }

    console.log(`   ✅ Total ${insertedIndicators} indicators created`)

    // Summary
    console.log('\n═══════════════════════════════════════')
    console.log('🎉 COMPLETE ROUTE SEEDING SUCCESSFUL!')
    console.log('═══════════════════════════════════════')
    console.log(`✅ Route: 1 (Ruta del Violín)`)
    console.log(`✅ Route Versions: 1`)
    console.log(`✅ Levels: 10`)
    console.log(`✅ Nodes: ${insertedNodes}`)
    console.log(`✅ Indicators: ${insertedIndicators}`)
    console.log(`\n📊 Structure:`)
    console.log(`   - 10 levels × 16 nodes/level = 160 nodes`)
    console.log(`   - 8 node types × 4 indicators/type × 20 nodes/type = 640 indicators`)

    return { success: true, routeId, versionId, insertedNodes, insertedIndicators }
  } catch (err) {
    console.error('\n💥 Fatal error:', err.message)
    throw err
  }
}

export { seedCompleteRoute, NODE_TYPES, INDICATOR_TEMPLATES }
