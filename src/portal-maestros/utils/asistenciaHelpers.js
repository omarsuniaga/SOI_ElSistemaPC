/* global AppToast */

/**
 * asisteniaHelpers.js
 * Funciones puras extraídas de asistenciaView.js
 */

export function inferirTipoClase(clase) {
  const nombre = (clase?.nombre || '').toLowerCase()
  const instrumento = (clase?.instrumento || '').toLowerCase()
  if (/orquesta|ensamble|ensemble|coro|ensayo/.test(nombre)) return 'ensayo_general'
  if (/teor[ií]a|solfeo|lenguaje\s+musical/.test(nombre)) return 'teoria'
  if (instrumento) return 'instrumento'
  return 'instrumento'
}

export function showProgressFeedback(saved, editorContainer) {
  if (!saved || saved.length === 0) return

  editorContainer.parentNode
    .querySelectorAll('.pm-progress-feedback')
    .forEach((el) => el.remove())

  const names = [...new Set(saved.slice(0, 3).map((s) => s.contenido || 'progreso'))]
  const label = names.join(' · ') + (saved.length > 3 ? ` y ${saved.length - 3} más` : '')

  const badge = document.createElement('div')
  badge.className = 'pm-progress-feedback'
  badge.innerHTML = `<i class="bi bi-check-circle-fill"></i> <span>${saved.length} registro(s) guardados — ${label}</span>`
  editorContainer.parentNode.insertBefore(badge, editorContainer.nextSibling)

  setTimeout(() => badge.remove(), 4200)
}

export function resetFooter(container, originalBtn) {
  const footer = container.querySelector('.pm-asist-footer')
  footer.innerHTML = `
    <button class="pm-btn pm-btn-primary" id="btn-guardar" style="width:100%; font-weight:700;">
      Guardar sesión
    </button>
  `
  footer.querySelector('#btn-guardar').onclick = originalBtn.onclick
  container.querySelector('#btn-guardar').style.display = ''
  container.querySelector('#btn-guardar').textContent = 'Guardar sesión'
  container.querySelector('#btn-guardar').style.background = ''
}

export function generarReporteTexto(asistencia, contenido, alumnos, clase, fechaHoy) {
  if (!clase) return 'No hay datos de clase disponibles.'

  const presentes = (asistencia || []).filter((a) => a.estado === 'P').length
  const ausentes = (asistencia || []).filter((a) => a.estado === 'A').length
  const justificados = (asistencia || []).filter((a) => a.estado === 'J').length

  let texto = `Reporte de Clase - ${clase.nombre || 'Sin nombre'}\n`
  texto += `Fecha: ${fechaHoy || ''}\n`
  texto += `Instrumento: ${clase.instrumento || 'N/A'}\n\n`
  texto += `RESUMEN DE ASISTENCIA\n`
  texto += `Presentes: ${presentes} | Ausentes: ${ausentes} | Justificados: ${justificados}\n\n`

  if (contenido && contenido.trim()) {
    texto += `CONTENIDO DE LA CLASE:\n${contenido}\n\n`
  }

  texto += `DETALLE DE ALUMNOS:\n`
  ;(asistencia || []).forEach((a) => {
    const alum = (alumnos || []).find((al) => al.id === a.alumno_id)
    const nombre = alum?.nombre_completo || 'Alumno'
    const estadoTexto =
      a.estado === 'P' ? 'Presente' : a.estado === 'A' ? 'Ausente' : 'Justificado'
    texto += `- ${nombre}: ${estadoTexto}\n`
  })

  return texto
}

export function abrirEnlaceConLimite(url, textoPlano, maxChars = 1800) {
  if (textoPlano.length > maxChars) {
    const descripcion =
      textoPlano.slice(0, maxChars) +
      '…\n\n[Texto truncado — el reporte completo excede el límite de caracteres]'
    AppToast.warn(
      `El texto se truncó (${textoPlano.length} caracteres, máximo ${maxChars}). Usá la opción PDF para ver el reporte completo.`,
    )
    window.open(url + encodeURIComponent(descripcion), '_blank')
  } else {
    window.open(url + encodeURIComponent(textoPlano), '_blank')
  }
}


