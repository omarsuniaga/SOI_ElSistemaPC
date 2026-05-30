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

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function run() {
  console.log('🔑 Iniciando reseteo de contraseña administrativo para Manuel Marcano...')

  try {
    // ID del usuario de auth resuelto en el paso anterior:
    const userId = '221d879e-004c-4f95-998d-d0c7955af53c'
    const newPassword = 'Manuel123*' // Contraseña genérica con mayúscula, números y carácter especial por requerimientos de complejidad de auth

    console.log(`🔍 Verificando existencia de usuario con ID: ${userId}...`)
    const { data: { user }, error: getError } = await supabase.auth.admin.getUserById(userId)
    
    if (getError || !user) {
      throw new Error(`No se encontró el usuario de Auth con ID ${userId}. Error: ${getError?.message}`)
    }

    console.log(`✅ Usuario verificado: ${user.email}`)

    console.log(`🔧 Forzando contraseña a: "${newPassword}" y marcando correo como confirmado...`)
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
      email_confirm: true
    })

    if (updateError) throw updateError

    console.log('\n🎉 Contraseña restablecida exitosamente.')
    console.log(`Correo para login: ${user.email}`)
    console.log(`Contraseña para login: ${newPassword}`)
    console.log('Por favor, intente iniciar sesión en la PWA usando EXACTAMENTE estas credenciales.')

  } catch (err) {
    console.error('\n❌ ERROR DURANTE EL RESETEO:', err.message || err)
    process.exit(1)
  }
}

run()
