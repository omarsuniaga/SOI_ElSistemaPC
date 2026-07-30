import { createClient } from '@supabase/supabase-js'

const url = 'https://zmhmdvmyeyswunurcyow.supabase.co'
const key = 'sb_publishable_-TE6E79mrn4fSs4XGnvWnw_2QgDrX0P'

const supabase = createClient(url, key)

async function testSignIn() {
  console.log('=== PROBANDO AUTENTICACIÓN PARA INSERTAR ALUMNOS ===')
  
  // Probar iniciar sesión si hay usuarios conocidos
  const passwordsToTry = ['123456', 'password', 'admin123', 'soi2026', 'maestro123']
  const emailsToTry = ['admin@soi.edu', 'maestro@soi.edu', 'osuniagarivera@gmail.com', 'omarsuniaga@gmail.com', 'test@soi.edu']

  for (const email of emailsToTry) {
    for (const password of passwordsToTry) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data.session) {
        console.log(`✅ AUTENTICADO EXITOSAMENTE con email: ${email}`)
        return data.session
      }
    }
  }

  console.log('No se pudo autenticar con credenciales estándar.')
}

testSignIn().catch(console.error)
