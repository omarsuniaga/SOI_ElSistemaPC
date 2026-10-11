/**
 * businessHours — chequeo puro de "¿se puede despachar AHORA?".
 *
 * SDD whatsapp-gateway-multidepto · F3.
 *
 * La fuente de verdad es la DB (`fn_whatsapp_ventana_abierta`, que también
 * decide el `ventana_ok` que devuelve `/claim`, y el dispatchLoop lo respeta).
 * Este chequeo del lado del cliente es DELIBERADAMENTE APROXIMADO: solo evita un
 * round-trip cuando está claramente fuera de horario, y alimenta el tray. NO
 * replica las quiet hours globales ni lee la config del departamento — si acá
 * da `true` pero la DB dice que no, `/claim` devuelve `ventana_ok:false` y no se
 * envía nada. Nunca al revés (si acá da `false`, no llamamos a `/claim`), así
 * que el peor caso de un desajuste es una llamada de más, nunca un envío de más.
 */

const DIAS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** "HH:MM" -> minutos desde medianoche. Devuelve null si el formato es inválido. */
function aMinutos(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

/**
 * @param {Date} now
 * @param {{inicio?: string, fin?: string, soloDiasHabiles?: boolean, tz?: string}} [ventana]
 * @returns {boolean}
 */
export function dentroDeVentana(now, ventana = {}) {
  const {
    inicio = '10:00',
    fin = '19:00',
    soloDiasHabiles = true,
    tz = 'America/Santo_Domingo',
  } = ventana

  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour12: false,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(now instanceof Date ? now : new Date(now))
      .map((p) => [p.type, p.value]),
  )

  const dow = DIAS.indexOf(partes.weekday) + 1 // 1 = lunes ... 7 = domingo
  // Intl con hour12:false puede devolver '24' a la medianoche en algunos runtimes.
  const hora = partes.hour === '24' ? 0 : Number(partes.hour)
  const nowMin = hora * 60 + Number(partes.minute)

  if (soloDiasHabiles && (dow < 1 || dow > 5)) return false

  const iniMin = aMinutos(inicio)
  const finMin = aMinutos(fin)
  if (iniMin === null || finMin === null) return true // sin ventana válida -> no bloquea

  if (iniMin <= finMin) {
    return nowMin >= iniMin && nowMin < finMin
  }
  // Ventana que cruza medianoche.
  return nowMin >= iniMin || nowMin < finMin
}
