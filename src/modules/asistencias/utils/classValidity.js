const localDate = (timestamp) => timestamp
  ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp))
  : null

/** Mirrors the canonical SQL boundary; an actual registered class remains evidence. */
export function isClassScheduledOn(clase, horario, date, session = null) {
  if (session && session.borrador === false && ['registrada', 'cerrada'].includes(session.estado)) return true
  const starts = [clase?.fecha_inicio || localDate(clase?.created_at), horario?.vigente_desde || localDate(horario?.created_at)].filter(Boolean)
  return starts.every((start) => date >= start) && (!horario?.vigente_hasta || date <= horario.vigente_hasta)
}
