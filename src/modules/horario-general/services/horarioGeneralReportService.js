/**
 * horarioGeneralReportService.js
 *
 * Arma (sin efectos secundarios — no consulta Supabase) el HTML imprimible
 * del Horario General: portada con diagnóstico + una página por día con el
 * detalle de sesiones. Reutiliza los mismos primitivos que el resto de
 * reportes del portal (reportTemplates.js) para mantener un look
 * institucional consistente en todo el sistema.
 */

import { header, footer, metricChips, obsBlock, wrapDocument, esc } from '../../../portal-maestros/services/reportTemplates.js'
import { DIAS, DIA_LABEL } from './horarioGeneralService.js'

function formatHora(hhmm) {
  return hhmm ? hhmm.slice(0, 5) : '—'
}

const SEV_TO_OBS_TYPE = { crit: 'neg', warn: 'warn', ok: 'pos' }

export function generateHorarioGeneralReportHTML({ sesiones, diagnostico }, { generadoLabel } = {}) {
  const { stats, findings } = diagnostico
  const fecha = generadoLabel || new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })
  const totalPaginas = 1 + DIAS.filter((d) => sesiones.some((s) => s.dia === d)).length

  const headerData = {
    docTag: 'HORARIO GENERAL',
    clase: 'Todas las clases activas',
    docente: 'Coordinación Académica / Logística',
    periodo: `Generado ${fecha}`,
  }

  const chips = metricChips([
    { label: 'Clases', value: stats.totalClases, type: 'navy' },
    { label: 'Sesiones/sem', value: stats.totalSesiones, type: 'navy' },
    { label: 'Conflictos', value: stats.conflictos, type: stats.conflictos ? 'bad' : 'ok' },
    { label: 'Sin salón', value: stats.sinSalon, type: stats.sinSalon ? 'warn' : 'ok' },
    { label: 'Sobre cupo', value: stats.sobreCupo, type: stats.sobreCupo ? 'warn' : 'ok' },
    { label: 'Salones en uso', value: stats.salonesEnUso, type: 'info' },
  ])

  const findingsHtml = findings.length
    ? findings
        .map((f) => obsBlock(SEV_TO_OBS_TYPE[f.sev] || 'info', f.chip, `${f.summary} ${f.detail || ''}`))
        .join('')
    : obsBlock('pos', 'OK', 'No se detectaron conflictos ni datos faltantes.')

  const portada = `
    <div class="page">
      ${header(headerData)}
      ${chips}
      <p class="rpt-section-title">Diagnóstico</p>
      <div class="rpt-obs">${findingsHtml}</div>
      ${footer(1, totalPaginas, fecha)}
    </div>
  `

  let pagina = 1
  const paginasDias = DIAS
    .filter((dia) => sesiones.some((s) => s.dia === dia))
    .map((dia) => {
      pagina += 1
      const items = sesiones.filter((s) => s.dia === dia).sort((a, b) => (a.inicio || '').localeCompare(b.inicio || ''))
      const rows = items
        .map((s) => {
          const over = s.inscritos > s.cupo
          return `<tr>
            <td>${esc(formatHora(s.inicio))}–${esc(formatHora(s.fin))}</td>
            <td>${esc(s.clase)}</td>
            <td>${esc(s.instrumento || '—')}</td>
            <td>${esc(s.maestro)}${s.suplente ? `<br><span style="font-size:6.5pt;color:#6b7085">Suplente: ${esc(s.suplente)}</span>` : ''}</td>
            <td>${s.salon ? esc(s.salon) : '<span style="color:#b45309">Sin salón</span>'}</td>
            <td style="text-align:center${over ? ';color:#b91c1c;font-weight:700' : ''}">${s.inscritos} / ${s.cupo}</td>
          </tr>`
        })
        .join('')

      return `
        <div class="page">
          ${header({ ...headerData, docTag: `HORARIO GENERAL · ${DIA_LABEL[dia] || dia}` })}
          <p class="rpt-section-title">${esc(DIA_LABEL[dia] || dia)} — ${items.length} sesión${items.length === 1 ? '' : 'es'}</p>
          <table class="rpt-table">
            <thead><tr><th>Hora</th><th>Clase</th><th>Instrumento</th><th>Docente</th><th>Salón</th><th>Cupo</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          ${footer(pagina, totalPaginas, fecha)}
        </div>
      `
    })
    .join('')

  return wrapDocument(portada + paginasDias)
}
