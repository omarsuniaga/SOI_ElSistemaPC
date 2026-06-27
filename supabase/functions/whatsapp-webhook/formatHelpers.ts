export const DOCS_REQUERIDOS = [
  'Copia de la Cédula del Representante',
  'Certificado o constancia de estudios',
  'Acta de nacimiento del alumno',
]

export function formatearFecha(isoString: string | null | undefined): string {
  if (!isoString) return 'la fecha acordada'
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString
  return d.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatearHora(isoString: string | null | undefined): string {
  if (!isoString) return 'la hora acordada'
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function docsToList(): string {
  return DOCS_REQUERIDOS.map(d => `• ${d}`).join('\n')
}
