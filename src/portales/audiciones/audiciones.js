import { supabase } from '../../lib/supabaseClient.js'

async function main() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    window.location.href = '/index.html'
    return
  }

  const { data: role } = await supabase.rpc('get_user_role')
  if (!role || !['jurado', 'admin'].includes(role)) {
    window.location.href = '/index.html?error=unauthorized'
    return
  }

  const { mountAudiciones } = await import('./../../modules/audiciones/index.js')
  mountAudiciones(role)
}

main()
