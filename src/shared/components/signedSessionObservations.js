import { observationSignatureLabel } from '../../portal-maestros/services/observationSignature.js'

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])

export function renderSignedSessionObservations(rows = []) {
  if (!rows.length) return ''
  return `<section aria-label="Observaciones de la clase"><h6>Observaciones de la clase</h6>${rows.map(row => {
    const signature = row.contenido_parsed?._author
    const date = signature?.fecha || row.created_at
    const formattedDate = date && !Number.isNaN(new Date(date).getTime())
      ? new Date(date).toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' }) : ''
    return `<article class="border rounded-3 p-3 mb-2"><div style="white-space:pre-wrap">${escape(row.contenido_raw)}</div><footer class="small text-muted mt-2">${escape(observationSignatureLabel(signature))}${formattedDate ? ` · ${escape(formattedDate)}` : ''}</footer></article>`
  }).join('')}</section>`
}
