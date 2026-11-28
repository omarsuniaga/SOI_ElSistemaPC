import { obtenerAlumnos } from './alumnosApi.js'
import { detectarCandidatosDe } from '../domain/duplicadosAlumnos.js'

export async function confirmarAltaIndividual(draft) {
  const candidates = []
  const pageSize = 500
  for (let page = 0; ; page++) {
    const { alumnos, total } = await obtenerAlumnos({ page, pageSize, soloActivos: false })
    candidates.push(...detectarCandidatosDe(draft, alumnos))
    if (alumnos.length < pageSize || (page + 1) * pageSize >= total) break
  }
  if (!candidates.length) return true
  candidates.sort((a, b) => b.puntaje - a.puntaje)
  const names = candidates.slice(0, 3).map(({ a }) =>
    `${a.nombre || a.nombre_completo} (${a.activo === false || a.is_active === false ? 'inactivo' : 'activo'})`)
  return window.confirm(`Posible coincidencia: ${names.join(', ')}. ¿Confirmas que se trata de otra persona y deseas crear su registro?`)

}
