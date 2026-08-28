import { openReport } from '../../../portal-maestros/services/reportTemplates.js'

function esc(str) {
  if (str == null) return ''
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c])
}

function formatDate(rawDate) {
  if (!rawDate) return '—'
  try {
    const value = String(rawDate).slice(0, 10)
    const [year, month, day] = value.split('-').map(Number)
    const date = year && month && day ? new Date(year, month - 1, day) : new Date(rawDate)
    return date.toLocaleDateString('es-DO', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function formatHora(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

/**
 * Genera el documento HTML completo para el histórico de clases del maestro.
 */
export function generarHtmlHistoricoMaestro(maestro = {}, sesiones = [], options = {}) {
  const maestroNombre = esc(maestro.nombre || maestro.nombre_completo || maestro.name || 'Docente')
  const rangoLabel = esc(options.rangoLabel || 'Histórico General')
  const claseLabel = esc(options.claseLabel || 'Todas las clases')
  const fechaGeneracion = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const totalSesiones = sesiones.length
  const totalP = sesiones.reduce((sum, s) => sum + (s.presentes || 0), 0)
  const totalA = sesiones.reduce((sum, s) => sum + (s.ausentes || 0), 0)
  const totalJ = sesiones.reduce((sum, s) => sum + (s.justificados || 0), 0)
  const totalRegistros = totalP + totalA + totalJ
  const pct = totalRegistros > 0 ? Math.round((totalP / totalRegistros) * 100) : 0

  const sesionesHTML = sesiones.map((s, idx) => {
    const horarioStr = s.horaInicio ? `${formatHora(s.horaInicio)} – ${formatHora(s.horaFin)}` : 'Horario no registrado'
    const salonStr = s.salonNombre ? ` · Salón: ${esc(s.salonNombre)}` : ''
    const rolStr = s.esSuplencia ? '<span class="badge-rol badge-suplente">Suplencia</span>' : '<span class="badge-rol badge-titular">Titular</span>'
    const contenido = s.contenido ? esc(s.contenido).replace(/\n/g, '<br>') : '<em class="text-muted">Sin temas u observaciones registradas.</em>'

    const rosterRows = (s.roster || []).map((a, j) => {
      let estadoBadge = '<span class="badge-att badge-p">Presente</span>'
      if (a.estado === 'A') estadoBadge = '<span class="badge-att badge-a">Ausente</span>'
      if (a.estado === 'J') estadoBadge = '<span class="badge-att badge-j">Justificado</span>'

      const motivoHtml = a.motivo 
        ? `<div class="justificacion-motivo"><i class="bi bi-info-circle"></i> <strong>Justificación:</strong> ${esc(a.motivo)}</div>`
        : (a.estado === 'J' ? '<span class="text-muted small">Sin motivo especificado</span>' : '—')

      return `
        <tr>
          <td style="width: 35px; text-align: center; color: #64748b;">${j + 1}</td>
          <td style="font-weight: 500;">${esc(a.nombre)}</td>
          <td style="width: 110px; text-align: center;">${estadoBadge}</td>
          <td>${motivoHtml}</td>
        </tr>
      `
    }).join('')

    return `
      <section class="session-card">
        <div class="session-header">
          <div class="session-title-block">
            <span class="session-number">#${idx + 1}</span>
            <div>
              <h3 class="session-title">${esc(s.claseNombre)}</h3>
              <div class="session-meta">
                <span><i class="bi bi-calendar3"></i> ${formatDate(s.fecha)}</span>
                <span><i class="bi bi-clock"></i> ${horarioStr}${salonStr}</span>
                ${rolStr}
              </div>
            </div>
          </div>
          <div class="session-stats">
            <span class="stat-pill p-pill" title="Presentes">${s.presentes || 0} P</span>
            <span class="stat-pill a-pill" title="Ausentes">${s.ausentes || 0} A</span>
            <span class="stat-pill j-pill" title="Justificados">${s.justificados || 0} J</span>
          </div>
        </div>

        <div class="session-body">
          <div class="content-block">
            <h4 class="block-title"><i class="bi bi-journal-text"></i> Contenido / Observaciones de la Clase</h4>
            <div class="content-text">${contenido}</div>
          </div>

          <div class="roster-block">
            <h4 class="block-title"><i class="bi bi-people"></i> Asistencia y Justificaciones de Alumnos (${(s.roster || []).length})</h4>
            <table class="roster-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Alumno</th>
                  <th>Estado</th>
                  <th>Causa / Justificación de Ausencia</th>
                </tr>
              </thead>
              <tbody>
                ${rosterRows || '<tr><td colspan="4" class="text-center py-2 text-muted">Sin alumnos registrados</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Histórico de Clases — ${maestroNombre}</title>
  <style>
    :root {
      --primary: #0056b3;
      --primary-dark: #003d80;
      --accent: #ffc107;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --bg-page: #f8fafc;
      --card-bg: #ffffff;
      --border-color: #e2e8f0;
      --color-p: #16a34a;
      --bg-p: #dcfce7;
      --color-a: #dc2626;
      --bg-a: #fee2e2;
      --color-j: #d97706;
      --bg-j: #fef3c7;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg-page);
      color: var(--text-main);
      line-height: 1.45;
      padding: 24px;
      font-size: 14px;
    }

    .report-container {
      max-width: 960px;
      margin: 0 auto;
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .header-banner {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      padding: 28px 32px;
      position: relative;
      border-bottom: 4px solid var(--accent);
    }

    .institution-name {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      color: #93c5fd;
      margin-bottom: 4px;
    }

    .report-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .report-subtitle {
      font-size: 13px;
      color: #e2e8f0;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      padding: 24px 32px;
      background: #f1f5f9;
      border-bottom: 1px solid var(--border-color);
    }

    .metric-card {
      background: white;
      padding: 14px 18px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .metric-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    .metric-val {
      font-size: 22px;
      font-weight: 700;
      color: var(--primary);
      margin-top: 2px;
    }

    .metric-val.green { color: var(--color-p); }
    .metric-val.red { color: var(--color-a); }
    .metric-val.amber { color: var(--color-j); }

    .sessions-wrapper {
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .session-card {
      background: white;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      page-break-inside: avoid;
    }

    .session-header {
      background: #f8fafc;
      padding: 14px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .session-title-block {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .session-number {
      background: var(--primary);
      color: white;
      font-weight: 700;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .session-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .session-meta {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 2px;
      flex-wrap: wrap;
    }

    .badge-rol {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .badge-titular { background: #dbeafe; color: #1e40af; }
    .badge-suplente { background: #fef3c7; color: #92400e; }

    .session-stats {
      display: flex;
      gap: 8px;
    }

    .stat-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .p-pill { background: var(--bg-p); color: var(--color-p); }
    .a-pill { background: var(--bg-a); color: var(--color-a); }
    .j-pill { background: var(--bg-j); color: var(--color-j); }

    .session-body {
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .block-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--primary-dark);
      margin-bottom: 8px;
    }

    .content-block {
      background: #f8fafc;
      border-left: 3px solid var(--primary);
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
    }

    .content-text {
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
    }

    .roster-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }

    .roster-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid var(--border-color);
      font-size: 11.5px;
      text-transform: uppercase;
    }

    .roster-table td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-color);
      vertical-align: middle;
    }

    .badge-att {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
    }
    .badge-p { background: var(--bg-p); color: var(--color-p); }
    .badge-a { background: var(--bg-a); color: var(--color-a); }
    .badge-j { background: var(--bg-j); color: var(--color-j); }

    .justificacion-motivo {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 4px 8px;
      border-radius: 4px;
      color: #92400e;
      font-size: 11.5px;
    }

    .report-footer {
      background: #f8fafc;
      border-top: 1px solid var(--border-color);
      padding: 16px 32px;
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
    }

    .print-actions {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      gap: 12px;
      z-index: 100;
    }

    .btn-action {
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,86,179,0.3);
      transition: all 0.2s;
    }
    .btn-action:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    @media print {
      body { background: white; padding: 0; font-size: 11pt; }
      .report-container { box-shadow: none; border: none; max-width: 100%; }
      .print-actions { display: none; }
      .session-card { page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #cbd5e1; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-action" onclick="window.print()">
      <i class="bi bi-printer"></i> Imprimir Reporte
    </button>
  </div>

  <div class="report-container">
    <header class="header-banner">
      <div class="institution-name">El Sistema Punta Cana</div>
      <h1 class="report-title">HISTÓRICO ACADÉMICO DE CLASES DEL DOCENTE</h1>
      <div class="report-subtitle">
        <span><strong>Docente:</strong> ${maestroNombre}</span>
        <span><strong>Período:</strong> ${rangoLabel}</span>
        <span><strong>Filtro:</strong> ${claseLabel}</span>
      </div>
    </header>

    <div class="summary-grid">
      <div class="metric-card">
        <div class="metric-label">Sesiones Dadas</div>
        <div class="metric-val">${totalSesiones}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Asistencia Global</div>
        <div class="metric-val green">${pct}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Presentes (P)</div>
        <div class="metric-val green">${totalP}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Ausentes (A)</div>
        <div class="metric-val red">${totalA}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Justificados (J)</div>
        <div class="metric-val amber">${totalJ}</div>
      </div>
    </div>

    <main class="sessions-wrapper">
      ${sesionesHTML || '<div class="text-center py-5 text-muted">No se encontraron sesiones registradas en el período seleccionado.</div>'}
    </main>

    <footer class="report-footer">
      El Sistema Punta Cana · Reporte generado el ${fechaGeneracion} · Documento Oficial de Control Académico
    </footer>
  </div>
</body>
</html>
`
}

/**
 * Abre el reporte HTML en una nueva ventana del navegador.
 */
export function abrirHtmlHistoricoMaestro({ maestro, sesiones, options = {} }) {
  const html = generarHtmlHistoricoMaestro(maestro, sesiones, options)
  openReport(html)
}
