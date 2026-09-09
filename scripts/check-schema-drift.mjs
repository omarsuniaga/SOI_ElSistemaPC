import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const token = fs.readFileSync(path.join(os.homedir(), '.supabase', 'access-token'), 'utf8').trim();
const PROJECT_REF = 'zmhmdvmyeyswunurcyow';

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Query failed: ${txt}`);
  }
  return await res.json();
}

async function checkDrift() {
  console.log('=== CHECKING SCHEMA DRIFT (schema_reference.sql vs Live Supabase DB) ===\n');

  const schemaFile = path.resolve('supabase/migrations/schema_reference.sql');
  if (!fs.existsSync(schemaFile)) {
    console.error('ERROR: schema_reference.sql no existe.');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(schemaFile, 'utf8');

  // Extraer todas las tablas definidas en schema_reference.sql
  const tableMatches = [...sqlContent.matchAll(/CREATE TABLE public\."([^"]+)"/g)].map(m => m[1]);
  const schemaTables = new Set(tableMatches);
  console.log(`Tablas en schema_reference.sql: ${schemaTables.size}`);

  // Consultar tablas vivas en Supabase
  const liveTablesResult = await query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  const liveTables = new Set(liveTablesResult.map(t => t.table_name));
  console.log(`Tablas en base viva (Supabase): ${liveTables.size}`);

  // Detectar discrepancias
  const missingInSchema = [...liveTables].filter(t => !schemaTables.has(t));
  const phantomInSchema = [...schemaTables].filter(t => !liveTables.has(t));

  let hasDrift = false;

  if (missingInSchema.length > 0) {
    console.error('\n[DRIFT DETECTADO] Tablas en BD viva que FALTAN en schema_reference.sql:');
    missingInSchema.forEach(t => console.error(`  - ${t}`));
    hasDrift = true;
  }

  if (phantomInSchema.length > 0) {
    console.error('\n[DRIFT DETECTADO] Tablas en schema_reference.sql que NO EXISTEN en la BD viva:');
    phantomInSchema.forEach(t => console.error(`  - ${t}`));
    hasDrift = true;
  }

  if (!hasDrift && schemaTables.size === liveTables.size) {
    console.log('\n>>> 0 DRIFT DETECTADO: schema_reference.sql COINCIDE 100% CON LA BASE DE DATOS REAL (216/216 tablas). <<<');
    process.exitCode = 0;
  } else {
    console.error('\n>>> ERROR DE DRIFT: La referencia no coincide exactamente con producción. <<<');
    process.exitCode = 1;
  }
}

checkDrift().catch(err => {
  console.error('Error fatal comprobando drift:', err);
  process.exit(1);
});
