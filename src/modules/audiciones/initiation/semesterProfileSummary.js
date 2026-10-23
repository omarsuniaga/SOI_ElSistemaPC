import { getSemesterAdapter } from './semesterApi.js'
import { escapeText, renderEnrollmentBadge } from './domain.js'
export async function renderSemesterProfileSummary(
  container,
  alumnoId,
  adapter = getSemesterAdapter(),
) {
  try {
    const entries = await adapter.execute('matriculas_alumno', { alumno_id: alumnoId })
    if (!container.isConnected || !entries.length) return
    container.innerHTML = `<h3>Incorporación y acompañamiento por clase</h3>${entries.map((i) => `<p><strong>${escapeText(i.clase)}</strong> ${i.condicion === 'invitado' ? renderEnrollmentBadge(i) : '· Miembro oficial'}<br>Objetivos: ${escapeText(i.objetivos)}</p>`).join('')}`
    container.hidden = false
  } catch {
    /* La ausencia del módulo no impide consultar el perfil académico ordinario. */
  }
}
