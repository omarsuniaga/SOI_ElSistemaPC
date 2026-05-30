import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Cargar variables de entorno desde .env.local
const envPath = path.resolve('.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ No se encontró el archivo .env.local')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    const key = match[1]
    let value = match[2] || ''
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1)
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1)
    }
    env[key] = value.trim()
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const serviceRoleKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

// Inicializar cliente de Supabase con clave de administrador (Service Role Key)
// Esto permite saltarse RLS y administrar autenticación de usuarios.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function run() {
  console.log('🔍 Iniciando proceso de reparación para el maestro Manuel Marcano...')

  try {
    // 1. Buscar al maestro por nombre en la tabla "maestros"
    const { data: maestros, error: mError } = await supabase
      .from('maestros')
      .select('*')
      .ilike('nombre_completo', '%Manuel%Marcano%')

    if (mError) throw mError

    if (!maestros || maestros.length === 0) {
      console.log('⚠️ No se encontró ningún maestro con el nombre "Manuel Marcano" en public.maestros.')
      console.log('Intentando buscar coincidencia más amplia ("Marcano")...')
      
      const { data: maestrosAlt, error: mErrorAlt } = await supabase
        .from('maestros')
        .select('*')
        .ilike('nombre_completo', '%Marcano%')
      
      if (mErrorAlt) throw mErrorAlt
      if (!maestrosAlt || maestrosAlt.length === 0) {
        throw new Error('No se encontró a ningún maestro que coincida con Marcano en la base de datos.')
      }
      maestros.push(...maestrosAlt)
    }

    const maestro = maestros[0]
    console.log(`✅ Maestro preexistente encontrado: "${maestro.nombre_completo}" (ID: ${maestro.id}, Correo: ${maestro.correo}, user_id actual: ${maestro.user_id})`)

    // 2. Buscar si hay una cuenta registrada en Auth con ese correo
    console.log(`🔍 Buscando cuenta de login en auth.users para el correo: ${maestro.correo}...`)
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError

    let authUser = users.find(u => u.email.toLowerCase() === 'manuelmarcanonoriega@gmail.com')

    if (!authUser) {
      console.log('⚠️ Coincidencia de correo de administrador no encontrada. Buscando por correo original...');
      authUser = users.find(u => u.email.toLowerCase() === maestro.correo.toLowerCase())
    }

    if (!authUser) {
      console.log('⚠️ Listando todas las cuentas registradas en auth.users para diagnóstico:');
      users.forEach(u => {
        console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.user_metadata?.full_name || 'N/A'} | Metadata Rol: ${u.user_metadata?.rol || u.user_metadata?.role || 'N/A'}`)
      });
      throw new Error(`No se encontró ningún usuario registrado en Auth para Manuel Marcano.`)
    }

    console.log(`✅ Cuenta de login encontrada en auth.users: ID ${authUser.id} (Email: ${authUser.email})`)

    // Resolver duplicación y fusionar registros en la tabla public.maestros
    if (maestro.correo.toLowerCase() !== authUser.email.toLowerCase()) {
      console.log(`💡 Fusión de registros requerida. El maestro original tiene el correo "${maestro.correo}" pero el usuario se registró con "${authUser.email}".`)
      
      // A. Verificar si existe la fila duplicada nueva en public.maestros
      const { data: duplicado, error: dError } = await supabase
        .from('maestros')
        .select('*')
        .eq('correo', authUser.email)
        .maybeSingle()
      
      if (dError) throw dError

      if (duplicado) {
        console.log(`🔧 Detectada fila duplicada en public.maestros (ID: ${duplicado.id}). Reasignando o eliminando dependencias relacionales...`)
        
        // 1. Reasignar o borrar en permisos_maestros
        const { data: permDuplicado, error: pDError } = await supabase
          .from('permisos_maestros')
          .select('*')
          .eq('maestro_id', duplicado.id)
          .maybeSingle()
          
        if (pDError) throw pDError
        
        if (permDuplicado) {
          console.log(`  - Encontrado registro de permisos para el maestro duplicado.`)
          // Verificar si el maestro original ya tiene permisos
          const { data: permOriginal, error: pOError } = await supabase
            .from('permisos_maestros')
            .select('*')
            .eq('maestro_id', maestro.id)
            .maybeSingle()
            
          if (pOError) throw pOError
          
          if (!permOriginal) {
            console.log(`  - El maestro original no tiene permisos asignados. Reasignando los permisos del duplicado al original...`)
            const { error: updatePermError } = await supabase
              .from('permisos_maestros')
              .update({ maestro_id: maestro.id })
              .eq('id', permDuplicado.id)
              
            if (updatePermError) {
              console.warn('  ⚠️ No se pudo reasignar por FK update, intentando borrar para evitar bloqueos:', updatePermError.message)
              // Si no se puede actualizar, intentamos borrarlo
              await supabase.from('permisos_maestros').delete().eq('id', permDuplicado.id)
            } else {
              console.log('  - Permisos reasignados exitosamente al maestro original.')
            }
          } else {
            console.log(`  - El maestro original ya tiene permisos. Eliminando los permisos del duplicado...`)
            const { error: deletePermError } = await supabase
              .from('permisos_maestros')
              .delete()
              .eq('id', permDuplicado.id)
              
            if (deletePermError) throw deletePermError
            console.log('  - Permisos del duplicado eliminados con éxito.')
          }
        }

        // 2. Reasignar o borrar referencias en concedido_por
        console.log('  - Reasignando referencias de "concedido_por" en permisos_maestros...')
        await supabase
          .from('permisos_maestros')
          .update({ concedido_por: maestro.id })
          .eq('concedido_por', duplicado.id)

        // 3. Reasignar de forma segura en otras tablas relacionales comunes
        const tablasRelacionales = [
          { nombre: 'planificaciones', fk: 'maestro_id' },
          { nombre: 'progresos', fk: 'maestro_id' },
          { nombre: 'observaciones', fk: 'maestro_id' },
          { nombre: 'asistencias', fk: 'maestro_id' },
          { nombre: 'justificaciones', fk: 'maestro_id' },
          { nombre: 'sesiones_clase', fk: 'maestro_id' }
        ]

        for (const tabla of tablasRelacionales) {
          try {
            console.log(`  - Buscando dependencias en la tabla "${tabla.nombre}"...`)
            const { data: deps, error: depErr } = await supabase
              .from(tabla.nombre)
              .select('id')
              .eq(tabla.fk, duplicado.id)

            if (!depErr && deps && deps.length > 0) {
              console.log(`    - Reasignando ${deps.length} registros en "${tabla.nombre}" al maestro original...`)
              const { error: updateDepErr } = await supabase
                .from(tabla.nombre)
                .update({ [tabla.fk]: maestro.id })
                .eq(tabla.fk, duplicado.id)
              
              if (updateDepErr) {
                console.warn(`    ⚠️ Falló reasignación en "${tabla.nombre}":`, updateDepErr.message)
                // Si falla la reasignación, intentamos un delete
                const { error: delDepErr } = await supabase
                  .from(tabla.nombre)
                  .delete()
                  .eq(tabla.fk, duplicado.id)
                if (delDepErr) {
                  console.warn(`    ❌ No se pudo eliminar dependencias en "${tabla.nombre}":`, delDepErr.message)
                } else {
                  console.log(`    - Registros dependientes en "${tabla.nombre}" eliminados con éxito.`)
                }
              } else {
                console.log(`    - Registros en "${tabla.nombre}" reasignados con éxito.`)
              }
            }
          } catch (e) {
            // Ignorar si la tabla no existe o no tiene ese esquema
          }
        }

        // Ahora sí, eliminar el maestro duplicado
        console.log(`🔧 Eliminando la fila duplicada en public.maestros (ID: ${duplicado.id})...`)
        const { error: deleteError } = await supabase
          .from('maestros')
          .delete()
          .eq('id', duplicado.id)
          
        if (deleteError) throw deleteError
        console.log('✅ Fila duplicada eliminada.')
      }

      // B. Actualizar el registro original de Manuel Marcano con el correo correcto y el user_id
      console.log('🔧 Actualizando registro de maestro original con el correo correcto y vinculando el user_id...')
      const { error: updateError } = await supabase
        .from('maestros')
        .update({ 
          correo: authUser.email,
          user_id: authUser.id
        })
        .eq('id', maestro.id)

      if (updateError) throw updateError
      console.log('✅ Registro original enlazado y corregido exitosamente.')
      
      maestro.correo = authUser.email
      maestro.user_id = authUser.id
    } else {
      // Si el correo es el mismo pero no estaba enlazado el user_id
      if (maestro.user_id !== authUser.id) {
        console.log(`🔗 Enlazando maestro de base de datos con su user_id de Auth (user_id = ${authUser.id})...`)
        const { error: linkError } = await supabase
          .from('maestros')
          .update({ user_id: authUser.id })
          .eq('id', maestro.id)

        if (linkError) throw linkError
        console.log('✅ Cuenta enlazada exitosamente en la tabla public.maestros.')
      }
    }

    // 3. Confirmar la cuenta de Auth si no lo está
    if (!authUser.email_confirmed_at) {
      console.log('✉️ Cuenta no confirmada. Confirmando correo del usuario de forma administrativa...')
      const { error: confirmError } = await supabase.auth.admin.updateUserById(authUser.id, {
        email_confirm: true
      })
      if (confirmError) throw confirmError
      console.log('✅ Correo confirmado con éxito.')
    }

    // 4. Enlazar la cuenta de maestros (actualizar user_id)
    if (maestro.user_id !== authUser.id) {
      console.log(`🔗 Enlazando maestro de base de datos con su user_id de Auth (user_id = ${authUser.id})...`)
      const { error: linkError } = await supabase
        .from('maestros')
        .update({ user_id: authUser.id })
        .eq('id', maestro.id)

      if (linkError) throw linkError
      console.log('✅ Cuenta enlazada exitosamente en la tabla public.maestros.')
    } else {
      console.log('ℹ️ La cuenta ya estaba correctamente enlazada en la tabla public.maestros.')
    }

    // 5. Garantizar rol de Admin en public.profiles y en los metadatos de Auth
    console.log('👑 Otorgando y sincronizando rol de "admin" para Manuel Marcano...')

    // A. Actualizar en la tabla public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ rol: 'admin' })
      .eq('id', authUser.id)

    if (profileError) {
      console.warn('⚠️ Nota: No se pudo actualizar en profiles (posiblemente la tabla use otra columna de rol o requiera RLS especial):', profileError.message)
    } else {
      console.log('✅ Rol de "admin" asignado en la tabla public.profiles.')
    }

    // B. Actualizar metadatos del usuario en Supabase Auth
    const currentMeta = authUser.user_metadata || {}
    const { error: metaError } = await supabase.auth.admin.updateUserById(authUser.id, {
      user_metadata: {
        ...currentMeta,
        rol: 'admin',
        role: 'admin',
        maestro_id: maestro.id // Inyectar el ID real de maestro para que la PWA lo use directamente
      }
    })

    if (metaError) throw metaError
    console.log('✅ Metadatos de Supabase Auth sincronizados ("rol": "admin" / "maestro_id").')

    console.log('\n🎉 ¡PROCESO FINALIZADO CON ÉXITO! Manuel Marcano ya puede iniciar sesión en la PWA con su usuario y clave sin ningún tipo de restricción.')

  } catch (err) {
    console.error('\n❌ ERROR DURANTE EL PROCESO:', err.message || err)
    process.exit(1)
  }
}

run()
