/**
 * plantillasAusentismo.js — Texto canónico de los mensajes de seguimiento de
 * ausentismo (spec: openspec/changes/seguimiento-ausentes/spec.md).
 *
 * Español dominicano institucional, trato de "usted". El texto final SIEMPRE lo
 * revisa una persona antes de enviar (el botón sólo abre WhatsApp con el mensaje
 * precargado). Cuando exista el editor de plantillas en `document_templates`,
 * este módulo pasa a ser el fallback.
 */

const FIRMA_CORTA = '— Coordinación Académica'
const FIRMA_LARGA = '— Coordinación Académica · El Sistema Punta Cana / FUNEYCA-PC'
const FIRMA_SEDE = '— Coordinación Académica · El Sistema Punta Cana'

/** @param {string} nombreCompleto */
function primerNombre(nombreCompleto) {
  return String(nombreCompleto || '').trim().split(/\s+/)[0] || 'su representado'
}

function fmtFecha(iso) {
  if (!iso) return 'la fecha indicada'
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fechaLimite(dias = 5) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Construye el mensaje de WhatsApp para un alumno según su nivel de escalamiento.
 *
 * @param {Object} opts
 * @param {1|2|3} opts.nivel
 * @param {'representante'|'maestro'} [opts.destinatario='representante']
 * @param {Object} opts.alumno - fila de vw_seguimiento_ausentes
 * @returns {string}
 */
export function construirMensajeAusentismo({ nivel, destinatario = 'representante', alumno = {} }) {
  const nombre = alumno.alumno_nombre || 'el alumno'
  const pn = primerNombre(nombre)
  const instrumento = alumno.instrumento_principal || 'su instrumento'
  const codigo = alumno.instrumento_codigo || instrumento
  const n = alumno.dias_ausente ?? 0
  const ultima = fmtFecha(alumno.ultima_ausencia_fecha)
  const maestro = alumno.maestro_nombre || 'el maestro'
  const hoy = fmtFecha(new Date().toISOString())

  if (nivel === 3 && destinatario === 'maestro') {
    return [
      `Prof. ${maestro}: por acumulación de inasistencias se ordena la retención temporal del instrumento de ${nombre} (${instrumento} · ${codigo}).`,
      '',
      'Por favor recoja el instrumento al cierre de la próxima clase y confírmelo en el sistema. El alumno no se reincorpora hasta que Coordinación levante la retención.',
      '',
      FIRMA_CORTA,
    ].join('\n')
  }

  if (nivel === 3) {
    return [
      `Estimada familia de ${nombre}: ante ${n} inasistencias sin justificar en este período, y conforme al reglamento del programa, el instrumento asignado a ${pn} (${codigo}) queda temporalmente retenido en la sede a partir del ${hoy}.`,
      '',
      `Para desbloquear la retención y reincorporar a ${pn}, la familia debe presentarse en Coordinación Académica y firmar un acta de compromiso. Estamos para acompañarles en este proceso.`,
      '',
      FIRMA_SEDE,
    ].join('\n')
  }

  if (nivel === 2) {
    return [
      `Estimada familia de ${nombre}: ${pn} acumula ${n} inasistencias sin justificar en ${instrumento} durante este período. La continuidad es esencial para su proceso musical y para el grupo con el que ensaya.`,
      '',
      `Le solicitamos comunicarse con Coordinación Académica antes del ${fechaLimite(5)} para conversar sobre la situación y registrar cualquier justificación pendiente.`,
      '',
      FIRMA_LARGA,
    ].join('\n')
  }

  // nivel 1 (default)
  return [
    `Estimada familia de ${nombre}: desde El Sistema Punta Cana notamos que ${pn} no asistió a su clase de ${instrumento} del ${ultima}. Queremos asegurarnos de que todo esté bien.`,
    '',
    'Si hubo un motivo, puede responder este mensaje para justificar la inasistencia. ¡Contamos con ' + pn + ' en el aula!',
    '',
    FIRMA_CORTA,
  ].join('\n')
}
