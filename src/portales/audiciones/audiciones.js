import { supabase } from '../../lib/supabaseClient.js'

async function main() {
  if (!['#evaluacion', '#resultados', '#tareas'].includes(window.location.hash)) {
    const { mountSemester } = await import('../../modules/audiciones/initiation/semesterView.js')
    await mountSemester(document.getElementById('app'))
    return
  }
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
