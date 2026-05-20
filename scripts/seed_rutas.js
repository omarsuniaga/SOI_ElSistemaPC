import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Usamos el SERVICE_ROLE_KEY si existe (para bypasear RLS), sino caemos en el ANON_KEY.
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const dataPath = path.join(__dirname, '../src/portal-maestros/seed_ruta_violin_40_niveles.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  console.log('🌱 Iniciando Seed para:', data.name);
  
  // 1. Insert Route
  const { data: route, error: routeError } = await supabase.from('routes').insert({
    name: data.name,
    instrument: data.instrument,
    description: 'Ruta inicial cargada por script seed',
    status: 'published'
  }).select().single();
  
  if (routeError) { console.error('❌ Error route:', routeError); return; }
  console.log('✅ Route created:', route.id);
  
  // 2. Insert Route Version
  const { data: version, error: versionError } = await supabase.from('route_versions').insert({
    route_id: route.id,
    version: data.version,
    status: 'published',
    notes: 'Import inicial'
  }).select().single();
  
  if (versionError) { console.error('❌ Error version:', versionError); return; }
  console.log('✅ Version created:', version.id);
  
  let nodeCount = 0;
  let indCount = 0;

  // 3. Iterate Blocks
  for (const block of data.blocks) {
    const { data: dbBlock, error: blockError } = await supabase.from('blocks').insert({
      route_version_id: version.id,
      name: block.name,
      level_from: block.levelRange?.from || 1,
      level_to: block.levelRange?.to || 1,
      objective: block.objective,
      order_index: block.blockNumber
    }).select().single();
    
    if (blockError) { console.error('❌ Error block:', blockError); return; }
    
    // 4. Iterate Levels
    for (const level of block.levels) {
      const { data: dbLevel, error: levelError } = await supabase.from('levels').insert({
        block_id: dbBlock.id,
        route_version_id: version.id,
        level_number: level.levelNumber,
        name: level.name,
        main_objective: level.mainObjective,
        suggested_duration_value: level.suggestedDuration?.value || null,
        suggested_duration_unit: level.suggestedDuration?.unit || null,
        is_flexible_duration: level.suggestedDuration?.isFlexible !== false,
        target_work: { text: level.targetWork },
        unlock_criteria: level.unlockCriteria || {},
        order_index: level.levelNumber
      }).select().single();
      
      if (levelError) { console.error('❌ Error level:', levelError); return; }
      console.log(`  ▶ Level ${level.levelNumber} inserted.`);
      
      // 5. Iterate Nodes
      if (!level.nodes) continue;
      for (let i = 0; i < level.nodes.length; i++) {
        const node = level.nodes[i];
        const { data: dbNode, error: nodeError } = await supabase.from('nodes').insert({
          level_id: dbLevel.id,
          route_version_id: version.id, // Añadido para cumplir con el constraint
          name: node.name,
          type: node.type || node.nodeKey || 'standard',
          is_critical: node.isCritical === true,
          is_required: true,
          objective: node.objective || null,
          order_index: node.orderIndex || (i + 1)
        }).select().single();
        
        if (nodeError) { console.error('❌ Error node:', nodeError, node); return; }
        nodeCount++;
        
        // 6. Iterate Indicators
        if (!node.indicators) continue;
        for (let j = 0; j < node.indicators.length; j++) {
          const ind = node.indicators[j];
          const { error: indError } = await supabase.from('indicators').insert({
            node_id: dbNode.id,
            description: ind.description,
            minimum_criteria: ind.minimumCriteria || {},
            is_required: true,
            order_index: ind.orderIndex || (j + 1)
          });
          
          if (indError) { console.error('❌ Error indicator:', indError); return; }
          indCount++;
        }
      }
    }
  }
  
  console.log(`🎉 Seed completado! ${data.blocks.length} bloques, ${nodeCount} nodos, ${indCount} indicadores insertados.`);
}

run();
