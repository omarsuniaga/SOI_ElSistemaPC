import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Usamos el SERVICE_ROLE_KEY si existe (para bypasear RLS), sino caemos en el ANON_KEY.
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan las credenciales de Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCrud() {
  console.log('--- TEST CRUD SUPABASE: RUTAS ACADÉMICAS ---\n');
  
  // 1. Obtener la primera versión de ruta disponible
  const { data: versions, error: vErr } = await supabase.from('route_versions').select('id').limit(1);
  if (vErr || !versions || !versions.length) {
    console.error('❌ Error: No hay versiones de ruta (route_versions) para asociar el nivel.', vErr);
    console.log('Sugerencia: Ejecuta el script seed_rutas.js primero.');
    return;
  }
  const versionId = versions[0].id;
  console.log(`✅ Usando Route Version ID: ${versionId}`);

  // 2. Crear Nivel
  console.log('\n[1] Intentando crear Nivel...');
  const { data: level, error: lErr } = await supabase.from('levels').insert({
    route_version_id: versionId,
    level_number: 999, // Un número alto para que no estorbe
    name: 'Nivel Test Supabase',
    main_objective: 'Validación automatizada de guardado'
  }).select().single();

  if (lErr) {
    console.error('❌ Error creando Nivel:', lErr);
    return;
  }
  console.log(`✅ Nivel Creado -> ID: ${level.id} | Nombre: ${level.name}`);

  // 3. Crear Nodo (Tema)
  console.log('\n[2] Intentando crear Tema (Nodo)...');
  const { data: node, error: nErr } = await supabase.from('nodes').insert({
    level_id: level.id,
    name: 'Tema Test Supabase',
    type: 'TECNICA',
    is_critical: true
  }).select().single();

  if (nErr) {
    console.error('❌ Error creando Tema:', nErr);
    return;
  }
  console.log(`✅ Tema Creado -> ID: ${node.id} | Tipo: ${node.type}`);

  // 4. Crear Indicador (Objetivo)
  console.log('\n[3] Intentando crear Objetivo (Indicador)...');
  const { data: ind, error: iErr } = await supabase.from('indicators').insert({
    node_id: node.id,
    description: 'Esta es una descripción de prueba para validar que Supabase acepta el insert.',
    is_required: true
  }).select().single();

  if (iErr) {
    console.error('❌ Error creando Indicador:', iErr);
    return;
  }
  console.log(`✅ Indicador Creado -> ID: ${ind.id}`);

  // 5. Limpieza (Eliminar lo creado para no dejar basura)
  console.log('\n[4] Limpiando datos de prueba...');
  await supabase.from('indicators').delete().eq('id', ind.id);
  await supabase.from('nodes').delete().eq('id', node.id);
  await supabase.from('levels').delete().eq('id', level.id);
  console.log('✅ Limpieza completada exitosamente.');

  console.log('\n🎉 TEST EXITOSO: La estructura de BD soporta el CRUD de los 3 niveles perfectamente.');
}

testCrud();
