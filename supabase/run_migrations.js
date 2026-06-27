import pkg from 'pg';
const { Client } = pkg;
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try connecting to pooler on port 6543 (transaction mode pooler, requires .project-ref)
const dbConfigPooler = {
  user: 'postgres.zmhmdvmyeyswunurcyow',
  password: 'aq1.sw2.de3',
  host: 'aws-1-us-east-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

// File paths
const patchSqlPath = path.join(__dirname, '../src/modules/inventario/20260622_inventario_patch_compatibilidad.sql');
const mappingSqlPath = path.join(__dirname, '../src/modules/inventario/20260622_inventario_import_mapping.sql');
const xlsxPath = path.join(__dirname, '../src/modules/inventario/inventario_supabase_estructurado.xlsx');

async function run() {
  const client = new Client(dbConfigPooler);

  try {
    console.log('🔌 Connecting to Supabase pooler on port 6543...', {
      user: dbConfigPooler.user,
      host: dbConfigPooler.host,
      port: dbConfigPooler.port,
      database: dbConfigPooler.database
    });
    await client.connect();
    console.log('✅ Connected successfully.');

    // 1. Run Compatibility Patch
    console.log('\n🛠️  Step 1: Applying Compatibility Patch (20260622_inventario_patch_compatibilidad.sql)...');
    const patchSql = fs.readFileSync(patchSqlPath, 'utf8');
    await client.query(patchSql);
    console.log('✅ Compatibility patch applied.');

    // 2. Create Staging Table
    console.log('\n📋 Step 2: Creating staging table (public.inventario_import_staging)...');
    const createStagingTableSql = `
      CREATE TABLE IF NOT EXISTS public.inventario_import_staging (
        codigo_importacion TEXT PRIMARY KEY,
        codigo_interno_original TEXT,
        familia TEXT,
        tipo_item TEXT,
        nombre_item TEXT,
        nombre_normalizado TEXT,
        tamano TEXT,
        marca TEXT,
        modelo TEXT,
        serial TEXT,
        cantidad TEXT,
        unidad TEXT,
        ubicacion_actual TEXT,
        estado_asignacion TEXT,
        asignado_a TEXT,
        estado_fisico TEXT,
        requiere_mantenimiento TEXT,
        tiene_arco TEXT,
        tiene_estuche TEXT,
        tiene_funda TEXT,
        tiene_hombrera_almohadilla TEXT,
        faltantes_detectados TEXT,
        donante_inferido TEXT,
        codigo_donante TEXT,
        observaciones TEXT,
        tags TEXT,
        activo TEXT,
        fuente_seccion TEXT,
        numero_original TEXT,
        fila_origen_csv TEXT,
        revisar TEXT,
        alertas_calidad TEXT,
        imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      
      COMMENT ON TABLE public.inventario_import_staging
        IS 'Tabla temporal/auditable para importar inventario_supabase_import.csv antes de normalizar a inventario_activos e inventario_accesorios.';
        
      TRUNCATE TABLE public.inventario_import_staging;
    `;
    await client.query(createStagingTableSql);
    console.log('✅ Staging table ready and truncated.');

    // 3. Load Excel data using xlsx
    console.log('\n📊 Step 3: Loading data from inventario_supabase_estructurado.xlsx...');
    const workbook = XLSX.readFile(xlsxPath);
    const sheet = workbook.Sheets['inventario_items_import'];
    if (!sheet) {
      throw new Error("Could not find sheet 'inventario_items_import' in Excel file.");
    }
    const rows = XLSX.utils.sheet_to_json(sheet);
    console.log(`✅ Loaded ${rows.length} rows from Excel sheet.`);

    // 4. Ingest data into staging table
    console.log('\n📥 Step 4: Ingesting data into public.inventario_import_staging...');
    const columns = [
      'codigo_importacion', 'codigo_interno_original', 'familia', 'tipo_item', 'nombre_item',
      'nombre_normalizado', 'tamano', 'marca', 'modelo', 'serial', 'cantidad', 'unidad',
      'ubicacion_actual', 'estado_asignacion', 'asignado_a', 'estado_fisico', 'requiere_mantenimiento',
      'tiene_arco', 'tiene_estuche', 'tiene_funda', 'tiene_hombrera_almohadilla', 'faltantes_detectados',
      'donante_inferido', 'codigo_donante', 'observaciones', 'tags', 'activo', 'fuente_seccion',
      'numero_original', 'fila_origen_csv', 'revisar', 'alertas_calidad'
    ];

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const insertQuery = `
      INSERT INTO public.inventario_import_staging (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (codigo_importacion) DO NOTHING;
    `;

    let insertedCount = 0;
    for (const row of rows) {
      const values = columns.map(col => {
        const val = row[col];
        if (val === undefined || val === null) {
          return '';
        }
        return String(val);
      });

      await client.query(insertQuery, values);
      insertedCount++;
    }
    console.log(`✅ Successfully staged ${insertedCount} rows.`);

    // 5. Execute Import Mapping SQL (inserting from staging into final tables)
    console.log('\n🔄 Step 5: Normalizing and inserting into inventario_activos and inventario_accesorios...');
    const mappingSql = fs.readFileSync(mappingSqlPath, 'utf8');
    
    console.log('Running 20260622_inventario_import_mapping.sql queries...');
    await client.query(mappingSql);
    console.log('✅ Data normalization complete. Actives and accessories populated.');

    // Verification queries
    console.log('\n📈 Step 6: Verifying counts in database tables...');
    const resActivos = await client.query('SELECT COUNT(*) FROM public.inventario_activos;');
    const resAccesorios = await client.query('SELECT COUNT(*) FROM public.inventario_accesorios;');
    console.log(`📊 Total rows in public.inventario_activos: ${resActivos.rows[0].count}`);
    console.log(`📊 Total rows in public.inventario_accesorios: ${resAccesorios.rows[0].count}`);

    console.log('\n🎉 DATABASE MIGRATION AND DATA INGESTION SUCCESSFUL!');

  } catch (err) {
    console.error('\n💥 Migration Failed:', err.message);
    console.error(err);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

run();
