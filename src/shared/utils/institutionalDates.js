const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santo_Domingo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function fechaSantoDomingo(date = new Date()) {
  return formatter.format(date)
}

export function fechaCivilActividad(value) {
  if (!value) return null
  // Legacy date-only events were stored at midnight UTC as a date marker.
  if (/^\d{4}-\d{2}-\d{2}(?:[T ]00:00:00(?:\.0+)?(?:Z|\+00(?::?00)?))?$/.test(value)) {
    return value.slice(0, 10)
  }
  return fechaSantoDomingo(new Date(value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')))
}

export function fechasActividad(inicio, fin = inicio) {
  const dates = []
  const cursor = new Date(inicio + 'T00:00:00Z')
  for (let fecha = inicio; fecha <= fin;) {
    dates.push(fecha)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    fecha = cursor.toISOString().slice(0, 10)
  }
  return dates
}
