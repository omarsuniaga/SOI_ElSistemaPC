import { AppModal } from '../../../shared/components/AppModal.js'
import { getReporteCompleto } from '../api/asistenciasApi.js'

export async function openAsistenciaExportModal(params = {}, onExport) {
  const formatos = [
    { id: 'xlsx', label: 'Excel (.xlsx)', icon: 'bi-file-earmark-spreadsheet', color: 'success' },
    { id: 'pdf', label: 'PDF (.pdf)', icon: 'bi-file-earmark-pdf', color: 'danger' },
    { id: 'md', label: 'Markdown (.md)', icon: 'bi-file-earmark-markdown', color: 'secondary' },
  ]

  AppModal.open({
    title: 'Exportar Reporte de Asistencia',
    size: 'md',
    hideSave: true,
    cancelText: 'Cancelar',
    body: `
      <div class="export-modal">
        <div class="mb-4">
          <label class="form-label fw-semibold">Seleccionar formato:</label>
          <div class="d-flex flex-column gap-2" id="formatOptions">
            ${formatos.map(f => `
              <button class="btn btn-outline-${f.color} d-flex align-items-center gap-3 p-3" data-fmt="${f.id}">
                <i class="bi ${f.icon} fs-4"></i>
                <span>${f.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="alert alert-info mb-0">
          <i class="bi bi-info-circle me-2"></i>
          El reporte incluirá: resumen por programa, estadísticas de asistencia y detalle por sesión.
        </div>
      </div>
    `,
  })

  document.querySelectorAll('#formatOptions button').forEach(btn => {
    btn.addEventListener('click', async () => {
      const fmt = btn.dataset.fmt
      AppModal.close()

      try {
        AppModal.showLoading('Generando reporte...')
        const { grupos, resumen } = await getReporteCompleto(params)

        if (fmt === 'xlsx') {
          await _exportXLSX(grupos, resumen, params)
        } else if (fmt === 'pdf') {
          await _exportPDF(grupos, resumen, params)
        } else if (fmt === 'md') {
          await _exportMD(grupos, resumen, params)
        }

        if (onExport) onExport(fmt)
      } catch (error) {
        AppModal.open({
          title: 'Error',
          body: `<div class="alert alert-danger">${error.message}</div>`,
          hideSave: true,
          cancelText: 'Cerrar',
        })
      }
    })
  })
}

async function _exportXLSX(grupos, resumen, params) {
  const rows = [['Fecha', 'Clase', 'Maestro', 'Tema', 'Presentes', 'Ausentes', 'Justificados', 'Total', '% Asistencia']]

  for (const grupo of grupos) {
    for (const sesion of grupo.sesiones) {
      const total = (sesion.totalPresentes || 0) + (sesion.totalAusentes || 0) + (sesion.totalJustificados || 0)
      const pct = total ? Math.round(((sesion.totalPresentes || 0) / total) * 100) : 0

      rows.push([
        grupo.fecha,
        sesion.claseNombre || '',
        sesion.maestroNombre || '',
        sesion.temaPrincipal || '',
        sesion.totalPresentes || 0,
        sesion.totalAusentes || 0,
        sesion.totalJustificados || 0,
        total,
        pct + '%',
      ])
    }
  }

  const csvContent = rows.map(r => r.join('\t')).join('\n')
  _downloadFile(csvContent, `reporte-asistencia-${_dateNow()}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

async function _exportPDF(grupos, resumen, params) {
  const html = _generatePDFHTML(grupos, resumen)
  const printWindow = window.open('', '_blank')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}

async function _exportMD(grupos, resumen, params) {
  let md = `# Reporte de Asistencia\n\n`
  md += `**Fecha de generación:** ${new Date().toLocaleDateString('es-AR')}\n\n`
  md += `## Resumen\n\n`
  md += `- Total Sesiones: ${resumen.totalSesiones}\n`
  md += `- Presentes: ${resumen.totalPresentes}\n`
  md += `- Ausentes: ${resumen.totalAusentes}\n`
  md += `- Justificados: ${resumen.totalJustificados}\n\n`
  md += `## Detalle por Fecha\n\n`

  for (const grupo of grupos) {
    md += `### ${grupo.fecha}\n\n`
    for (const sesion of grupo.sesiones) {
      const total = (sesion.totalPresentes || 0) + (sesion.totalAusentes || 0) + (sesion.totalJustificados || 0)
      const pct = total ? Math.round(((sesion.totalPresentes || 0) / total) * 100) : 0

      md += `- **${sesion.claseNombre}** (${sesion.maestroNombre})\n`
      md += `  - Tema: ${sesion.temaPrincipal || 'N/A'}\n`
      md += `  - Presentes: ${sesion.totalPresentes || 0} | Ausentes: ${sesion.totalAusentes || 0} | Justificados: ${sesion.totalJustificados || 0}\n`
      md += `  - **Asistencia: ${pct}%**\n\n`
    }
  }

  _downloadFile(md, `reporte-asistencia-${_dateNow()}.md`, 'text/markdown')
}

function _generatePDFHTML(grupos, resumen) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Asistencia</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .summary { background: #f9f9f9; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>Reporte de Asistencia</h1>
      <p>Generado: ${new Date().toLocaleDateString('es-AR')}</p>
      <div class="summary">
        <strong>Resumen:</strong> ${resumen.totalPresentes} presentes, ${resumen.totalAusentes} ausentes, ${resumen.totalJustificados} justificados
      </div>
      <table>
        <thead>
          <tr><th>Fecha</th><th>Clase</th><th>Maestro</th><th>Presentes</th><th>Ausentes</th><th>%</th></tr>
        </thead>
        <tbody>
          ${grupos.map(g => g.sesiones.map(s => {
            const total = (s.totalPresentes || 0) + (s.totalAusentes || 0) + (s.totalJustificados || 0)
            const pct = total ? Math.round(((s.totalPresentes || 0) / total) * 100) : 0
            return `<tr><td>${g.fecha}</td><td>${s.claseNombre || ''}</td><td>${s.maestroNombre || ''}</td><td>${s.totalPresentes || 0}</td><td>${s.totalAusentes || 0}</td><td>${pct}%</td></tr>`
          }).join('')).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `
}

function _downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function _dateNow() {
  return new Date().toISOString().slice(0, 10)
}