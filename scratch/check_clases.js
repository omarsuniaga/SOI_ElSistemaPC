import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Usamos service role para consultar metadatos si hace falta

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Consultando constraints de clase_horarios...')
  
  // Consultar todas las constraints de clase_horarios en Postgres
  const { data, error } = await supabase
    .rpc('get_constraints', {}) // Si no existe rpc, hacemos una consulta directa vía SQL si tenemos acceso, o con REST
  
  if (error) {
    // Si falla rpc, hagamos una consulta usando postgrest a alguna vista de metadatos o intentemos insertar un horario adyacente para ver qué pasa
    console.log('RPC no disponible, probando inserción directa de horarios adyacentes para validar restricciones de BD...')
    
    // Vamos a buscar salones y clases existentes
    const { data: clases } = await supabase.from('clases').select('id').limit(2)
    const { data: salones } = await supabase.from('salones').select('id').limit(2)
    
    if (clases && clases.length > 0 && salones && salones.length > 0) {
      const claseId = clases[0].id
      const salonId = salones[0].id
      
      console.log(`Clase ID de prueba: ${claseId}, Salon ID: ${salonId}`)
      
      // Limpiar horarios previos de prueba si los hubiera
      await supabase.from('clase_horarios').delete().eq('dia', 'lunes')
      
      // Insertar horario A: Lunes de 16:00:00 a 17:00:00
      console.log('Insertando Horario A...')
      const { data: ha, error: errA } = await supabase
        .from('clase_horarios')
        .insert({
          clase_id: claseId,
          salon_id: salonId,
          dia: 'lunes',
          hora_inicio: '16:00:00',
          hora_fin: '17:00:00'
        })
        .select()
      
      if (errA) {
        console.error('Error insertando Horario A:', errA)
        return
      }
      console.log('Horario A insertado exitosamente:', ha)
      
      // Intentar insertar horario B: Lunes de 17:00:00 a 18:00:00 (adyacente)
      console.log('Insertando Horario B (adyacente, debería funcionar)...')
      const { data: hb, error: errB } = await supabase
        .from('clase_horarios')
        .insert({
          clase_id: claseId,
          salon_id: salonId,
          dia: 'lunes',
          hora_inicio: '17:00:00',
          hora_fin: '18:00:00'
        })
        .select()
      
      if (errB) {
        console.error('ERROR al insertar Horario B (adyacente):', errB)
      } else {
        console.log('Horario B insertado exitosamente!', hb)
      }
      
      // Limpiar datos de prueba
      await supabase.from('clase_horarios').delete().eq('dia', 'lunes')
    } else {
      console.log('No se encontraron clases o salones para probar.')
    }
  } else {
    console.log('Constraints:', data)
  }
}

test()
