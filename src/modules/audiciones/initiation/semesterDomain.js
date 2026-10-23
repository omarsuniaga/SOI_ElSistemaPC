import { escapeText } from './domain.js'
export const SEMESTER_RUBRIC = [
  {
    key: 'pulso',
    label: 'Mantiene el pulso en un motivo trabajado en clase',
    required: true,
    levels: [
      'Necesita un modelo continuo',
      'Mantiene el pulso con apoyos puntuales',
      'Mantiene el pulso de forma autónoma',
    ],
  },
  {
    key: 'escucha',
    label: 'Escucha y reproduce un motivo vocal o rítmico conocido',
    required: true,
    levels: [
      'Imita fragmentos con acompañamiento',
      'Reproduce con apoyos puntuales',
      'Reproduce y se ajusta al escuchar',
    ],
  },
  {
    key: 'lectura',
    label: 'Relaciona los símbolos trabajados con su ejecución',
    required: true,
    levels: [
      'Reconoce con guía continua',
      'Relaciona con apoyos puntuales',
      'Lee y ejecuta de forma autónoma',
    ],
  },
  {
    key: 'grupo',
    label: 'Sigue entradas y participa en una actividad de grupo',
    required: true,
    levels: [
      'Necesita acompañamiento continuo',
      'Participa con apoyos puntuales',
      'Participa y sigue las señales de forma autónoma',
    ],
  },
]
export const RESULT_LABELS = {
  pendiente: 'Por evaluar',
  preparado: 'Preparado para invitación',
  continuar: 'Continuar preparación',
  evidencia: 'Pendiente de evidencia',
  ausente: 'Ausente',
  autorizada: 'Autorizado · falta incorporar',
  invitado: 'Invitado · En periodo de prueba',
  fijo: 'Miembro oficial',
  finalizada: 'Invitación finalizada',
  revocada: 'Autorización revocada',
}
export function operationalState(candidate, evaluations, invitations) {
  if (candidate.resultado === 'ausente') return 'Ausente · reprogramar con coordinación'
  if (candidate.resultado === 'pendiente')
    return evaluations.some((e) => e.candidato_id === candidate.id)
      ? 'Completar valoraciones · jurado'
      : 'Por evaluar · jurado'
  if (candidate.resultado === 'evidencia')
    return 'Revisar evidencia o deliberar · responsable académico'
  if (candidate.resultado === 'continuar') return 'Plan de continuidad · responsable académico'
  if (!candidate.preferencia) return 'Consultar preferencia · coordinación'
  const active = invitations.filter(
    (i) => i.candidato_id === candidate.id && !['revocada', 'finalizada'].includes(i.estado),
  )
  if (!active.length) return 'Pendiente de instrumento, cupo y destino · coordinación'
  if (active.some((i) => i.estado === 'autorizada'))
    return 'Agregar como invitado · maestro receptor'
  return 'Seguimiento y revisión · receptor y coordinación'
}
export function juryDisagreement(evaluations) {
  const recommendations = new Set(evaluations.filter((e) => e.completa).map((e) => e.recomendacion))
  return recommendations.size > 1
}
export function familyMessage(report) {
  const a = report.alumnos[0]
  if (!a) return ''
  const result =
    a.resultado === 'preparado'
      ? `Felicitaciones: ${a.nombre} aprobó la audición.`
      : a.resultado === 'ausente'
        ? `La audición de ${a.nombre} queda pendiente de reprogramación.`
        : a.resultado === 'evidencia'
          ? `La evaluación de ${a.nombre} necesita evidencia adicional antes de una decisión.`
          : `${a.nombre} continuará su preparación con acompañamiento.`
  const confirmed = a.destinos.filter((i) => ['invitado', 'fijo'].includes(i.estado))
  const destinations = confirmed.length
    ? confirmed
        .map(
          (i) =>
            `${i.clase}: ${RESULT_LABELS[i.estado]}. ${i.horarios.map((h) => `${h.dia} ${h.inicio}–${h.fin}`).join('; ')}. Objetivos: ${i.objetivos}. Revisión: ${i.revision}.`,
        )
        .join('\n')
    : 'La aprobación de la audición no confirma por sí sola una plaza ni la entrega de un instrumento. Coordinación informará el destino cuando estén confirmados cupo, recurso y horario.'
  return [
    result,
    a.conclusion,
    `Fortalezas: ${a.fortalezas || 'Consultar la devolución académica'}`,
    `Apoyos y próximos pasos: ${a.apoyos || 'Acordar con coordinación'}`,
    destinations,
    'Debe mantener su formación regular de teoría y solfeo. La condición de invitado es temporal y tendrá una revisión académica.',
  ].join('\n\n')
}
export function reportHTML(report) {
  const e = escapeText
  return `<article class="is-report"><header><h2>El Sistema Punta Cana · Audiciones</h2><p>${e(report.convocatoria)} · ${e(report.periodo)} · ${e(report.tipo)}</p><p>Emitido ${e(report.emitido)} · Versión ${e(report.version)} · Revisión académica registrada</p>${report.totales ? `<p>Convocados: ${e(report.totales.convocados)} · Evaluados: ${e(report.totales.evaluados)} · Preparados: ${e(report.totales.preparados)} · Ausentes: ${e(report.totales.ausentes)} · Pendientes: ${e(report.totales.pendientes)}</p>` : ''}</header>${report.alumnos.map((a) => `<section><h3>${e(a.nombre)}</h3><p><strong>${e(RESULT_LABELS[a.resultado] || a.resultado)}</strong> · ${e(a.conclusion)}</p><p><strong>Fortalezas:</strong> ${e(a.fortalezas)}</p><p><strong>Apoyos:</strong> ${e(a.apoyos)}</p><table><thead><tr><th>Criterio observado</th><th>Evidencia por valoración</th></tr></thead><tbody>${a.criterios.map((c) => `<tr><td>${e(c.label)}</td><td>${a.valoraciones.map((v) => (v.notas[c.key] == null ? 'No observado' : e(c.levels?.[v.notas[c.key] - 1] || v.notas[c.key]))).join(' / ')}</td></tr>`).join('')}</tbody></table>${a.destinos.map((i) => `<p><strong>${e(i.clase)}</strong> · ${e(i.instrumento || 'No requiere instrumento individual')} · ${e(RESULT_LABELS[i.estado])}<br>Objetivos: ${e(i.objetivos)} · Inicio: ${e(i.inicio)} · Revisión: ${e(i.revision)}<br>${i.horarios.map((h) => `${e(h.dia)} ${e(h.inicio)}–${e(h.fin)}`).join('; ')}</p>`).join('')}${!a.destinos.some((i) => ['invitado', 'fijo'].includes(i.estado)) && a.resultado === 'preparado' ? '<p>Preparado; incorporación pendiente de destino, cupo o instrumento. Aprobar no confirma plaza.</p>' : ''}<p>Se mantiene la formación regular de teoría y solfeo.</p></section>`).join('')}</article>`
}
