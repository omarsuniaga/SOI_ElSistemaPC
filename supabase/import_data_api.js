import { createClient } from '@supabase/supabase-js'
import XLSX from 'xlsx'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })
dotenv.config({ path: path.join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Falta VITE_SUPABASE_URL o VITE_SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

const excelPath = './src/modules/inventario/inventario_supabase_estructurado.xlsx'

async function migrate() {
  try {
    console.log('🌍 Conectando con Supabase API...')
    
    // 1. Obtener alumnos para mapear comodatos
    console.log('🔍 Cargando lista de alumnos de la base de datos...')
    const { data: alumnos, error: alumnosErr } = await supabase.from('alumnos').select('id, nombre_completo')
    if (alumnosErr) throw alumnosErr
    console.log(`✅ Cargados ${alumnos.length} alumnos para emparejamiento.`)

    // Crear mapa de nombres de alumnos (LOWER CASE sin espacios) -> UUID
    const alumnoMap = new Map()
    alumnos.forEach(a => {
      const cleanName = String(a.nombre_completo).trim().toLowerCase()
      alumnoMap.set(cleanName, a.id)
    })

    // 2. Leer Excel
    console.log(`\n📊 Leyendo Excel desde: ${excelPath}`)
    const workbook = XLSX.readFile(excelPath)
    const sheet = workbook.Sheets['inventario_items_import']
    const rows = XLSX.utils.sheet_to_json(sheet)
    console.log(`📦 Se encontraron ${rows.length} registros para procesar.`)

    // Separar en activos y accesorios
    const rawInstruments = rows.filter(r => String(r.tipo_item).trim().toLowerCase() === 'instrumento')
    const rawMaterials = rows.filter(r => String(r.tipo_item).trim().toLowerCase() === 'material')

    console.log(`\n🛠️  Procesando ${rawInstruments.length} instrumentos...`)
    const assetsToUpsert = rawInstruments.map(row => {
      const stateAssign = String(row.estado_asignacion || '').trim().toLowerCase()
      const statePhys = String(row.estado_fisico || '').trim().toLowerCase()
      
      // Mapear estado_conservacion
      let estado_conservacion = 'regular'
      if (stateAssign === 'fuera_de_servicio') estado_conservacion = 'de_baja'
      else if (statePhys === 'excelente') estado_conservacion = 'excelente'
      else if (statePhys === 'bueno') estado_conservacion = 'bueno'
      else if (statePhys === 'regular') estado_conservacion = 'regular'
      else if (['dañado', 'danado', 'requiere_mantenimiento'].includes(statePhys)) estado_conservacion = 'mantenimiento'

      // Mapear estado_uso
      let estado_uso = 'disponible'
      if (stateAssign === 'asignado') estado_uso = 'prestado'
      else if (stateAssign === 'en_taller') estado_uso = 'en_reparacion'
      else if (stateAssign === 'fuera_de_servicio') estado_uso = 'de_baja'

      // Notas
      const notasArr = []
      if (row.observaciones) notasArr.push(String(row.observaciones).trim())
      if (row.asignado_a) notasArr.push(`Asignado a texto histórico: ${String(row.asignado_a).trim()}`)
      if (row.faltantes_detectados) notasArr.push(`Faltantes detectados: ${String(row.faltantes_detectados).trim()}`)
      if (row.alertas_calidad) notasArr.push(`Alertas de calidad: ${String(row.alertas_calidad).trim()}`)

      return {
        codigo_inventario: String(row.codigo_importacion).trim(),
        tipo_instrumento: row.nombre_normalizado || row.nombre_item || 'sin_clasificar',
        marca: row.marca ? String(row.marca).trim() : null,
        modelo: row.modelo ? String(row.modelo).trim() : null,
        numero_serie: row.serial ? String(row.serial).trim() : null,
        estado_conservacion,
        estado_uso,
        ubicacion: row.ubicacion_actual ? String(row.ubicacion_actual).trim() : 'Sede Principal',
        activo: row.activo !== 'false' && stateAssign !== 'fuera_de_servicio',
        notas: notasArr.join('\n') || null,
        
        // Parche de compatibilidad columnas
        familia: row.familia ? String(row.familia).trim() : null,
        nombre_normalizado: row.nombre_normalizado ? String(row.nombre_normalizado).trim() : null,
        tamano: row.tamano ? String(row.tamano).trim() : null,
        cantidad: row.cantidad !== undefined ? Number(row.cantidad) : 1,
        unidad: row.unidad ? String(row.unidad).trim() : 'unidad',
        estado_asignacion_original: row.estado_asignacion ? String(row.estado_asignacion).trim() : null,
        asignado_a_texto: row.asignado_a ? String(row.asignado_a).trim() : null,
        requiere_mantenimiento: row.requiere_mantenimiento === 'true' || row.requiere_mantenimiento === true,
        tiene_arco: row.tiene_arco === 'true' || row.tiene_arco === true ? true : (row.tiene_arco === 'false' || row.tiene_arco === false ? false : null),
        tiene_estuche: row.tiene_estuche === 'true' || row.tiene_estuche === true ? true : (row.tiene_estuche === 'false' || row.tiene_estuche === false ? false : null),
        tiene_funda: row.tiene_funda === 'true' || row.tiene_funda === true ? true : (row.tiene_funda === 'false' || row.tiene_funda === false ? false : null),
        tiene_hombrera_almohadilla: row.tiene_hombrera_almohadilla === 'true' || row.tiene_hombrera_almohadilla === true ? true : (row.tiene_hombrera_almohadilla === 'false' || row.tiene_hombrera_almohadilla === false ? false : null),
        faltantes_detectados: row.faltantes_detectados ? String(row.faltantes_detectados).trim() : null,
        donante_inferido: row.donante_inferido ? String(row.donante_inferido).trim() : null,
        codigo_donante: row.codigo_donante ? String(row.codigo_donante).trim() : null,
        fuente_importacion: row.fuente_seccion ? String(row.fuente_seccion).trim() : null,
        numero_original: row.numero_original ? String(row.numero_original).trim() : null,
        fila_origen_csv: row.fila_origen_csv ? Number(row.fila_origen_csv) : null,
        revisar: row.revisar === 'true' || row.revisar === true,
        alertas_calidad: row.alertas_calidad ? String(row.alertas_calidad).trim() : null,
        import_metadata: {
          codigo_interno_original: row.codigo_interno_original,
          nombre_item_original: row.nombre_item,
          tags: row.tags,
          fuente_seccion: row.fuente_seccion,
          importado_desde: 'import_data_api.js'
        }
      }
    })

    // Upsert a inventario_activos en lotes de 100
    console.log('📥 Subiendo instrumentos a Supabase (inventario_activos)...')
    const batchSize = 100
    for (let i = 0; i < assetsToUpsert.length; i += batchSize) {
      const batch = assetsToUpsert.slice(i, i + batchSize)
      const { data: insertedAssets, error: insertErr } = await supabase
        .from('inventario_activos')
        .upsert(batch, { onConflict: 'codigo_inventario' })
        .select('id, codigo_inventario')
      
      if (insertErr) throw insertErr
      console.log(`   - Lote ${i / batchSize + 1}: ${batch.length} registros procesados.`)
    }
    console.log('✅ Instrumentos subidos con éxito.')

    // Obtener los IDs de los instrumentos recién ingresados para vincular comodatos
    const { data: allActiveAssets, error: fetchErr } = await supabase
      .from('inventario_activos')
      .select('id, codigo_inventario, asignado_a_texto, estado_uso')
      .eq('activo', true)
    if (fetchErr) throw fetchErr

    const assetCodeToId = new Map()
    allActiveAssets.forEach(a => {
      assetCodeToId.set(a.codigo_inventario, a.id)
    })

    // 3. Procesar comodatos
    console.log('\n🔗 Procesando vinculaciones de comodatos activos...')
    const comodatosToInsert = []
    let unmatchedCount = 0

    assetsToUpsert.forEach(asset => {
      if (asset.estado_uso === 'prestado' && asset.asignado_a_texto) {
        const studentNameClean = asset.asignado_a_texto.trim().toLowerCase()
        const alumnoId = alumnoMap.get(studentNameClean)
        const assetId = assetCodeToId.get(asset.codigo_inventario)

        if (alumnoId && assetId) {
          comodatosToInsert.push({
            activo_id: assetId,
            alumno_id: alumnoId,
            fecha_entrega: new Date().toISOString().split('T')[0],
            estado: 'activo',
            observaciones: `Comodato importado automáticamente. Asignado originalmente a: ${asset.asignado_a_texto}`
          })
        } else {
          unmatchedCount++
          console.log(`  ⚠️  No se pudo emparejar al alumno "${asset.asignado_a_texto}" para el instrumento "${asset.codigo_inventario}"`)
        }
      }
    })

    if (comodatosToInsert.length > 0) {
      console.log(`📥 Subiendo ${comodatosToInsert.length} comodatos a Supabase (comodatos_activos)...`)
      
      // Limpiar comodatos existentes para estos activos para evitar duplicados en la importación
      const activeIds = comodatosToInsert.map(c => c.activo_id)
      const { error: cleanComodatoErr } = await supabase
        .from('comodatos_activos')
        .delete()
        .in('activo_id', activeIds)
        .eq('estado', 'activo')
      if (cleanComodatoErr) throw cleanComodatoErr

      const { error: comErr } = await supabase.from('comodatos_activos').insert(comodatosToInsert)
      if (comErr) throw comErr
      console.log(`✅ ${comodatosToInsert.length} comodatos activos creados con éxito.`)
    } else {
      console.log('ℹ️ No se detectaron comodatos emparejables.')
    }
    console.log(`📊 Resumen comodatos: ${comodatosToInsert.length} emparejados, ${unmatchedCount} no emparejados.`);

    // 4. Procesar materiales/accesorios sin instrumento
    console.log(`\n🛠️  Procesando ${rawMaterials.length} accesorios independientes...`)
    const accessoriesToInsert = rawMaterials.map(row => {
      const stateAssign = String(row.estado_asignacion || '').trim().toLowerCase()
      const nameLower = String(row.nombre_normalizado || row.nombre_item || '').toLowerCase()
      
      let tipo = 'otro'
      if (nameLower.includes('boquilla')) tipo = 'boquilla'
      else if (nameLower.includes('atril')) tipo = 'atril'
      else if (nameLower.includes('cuerda')) tipo = 'cuerdas'
      else if (nameLower.includes('cable')) tipo = 'cable'
      else if (nameLower.includes('arco')) tipo = 'arco'
      else if (nameLower.includes('funda')) tipo = 'funda'

      let estado = 'disponible'
      if (['asignado', 'uso_institucional'].includes(stateAssign)) estado = 'asignado'
      else if (stateAssign === 'fuera_de_servicio') estado = 'agotado'

      const obsArr = []
      if (row.nombre_item) obsArr.push(String(row.nombre_item).trim())
      if (row.observaciones) obsArr.push(String(row.observaciones).trim())
      if (row.codigo_importacion) obsArr.push(`Código importación: ${String(row.codigo_importacion).trim()}`)
      if (row.alertas_calidad) obsArr.push(`Alertas de calidad: ${String(row.alertas_calidad).trim()}`)

      return {
        activo_id: null,
        tipo,
        marca: row.marca ? String(row.marca).trim() : null,
        cantidad: row.cantidad !== undefined ? Math.ceil(Number(row.cantidad)) : 1,
        estado,
        observaciones: obsArr.join('\n') || null
      }
    })

    if (accessoriesToInsert.length > 0) {
      console.log('📥 Subiendo accesorios a Supabase (inventario_accesorios)...')
      const { error: accErr } = await supabase.from('inventario_accesorios').insert(accessoriesToInsert)
      if (accErr) throw accErr
      console.log(`✅ ${accessoriesToInsert.length} accesorios subidos con éxito.`)
    }

    console.log('\n🎉 ¡MIGRACIÓN DE DATOS VÍA API COMPLETADA CON ÉXITO! 🎉')

  } catch (err) {
    console.error('\n💥 Error fatal en migración:', err.message)
    console.error(err)
  }
}

migrate()
