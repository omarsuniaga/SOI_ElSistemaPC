import { obtenerProgresoRuta } from '../api/rutasApi.js'

const STYLE = `
<style id="ruta-progreso-style">
.ruta-progreso { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
.mini-resumen { background: linear-gradient(135deg, #f0f7ff 0%, #e7f1ff 100%); border-left: 4px solid #007bff; padding: 16px; margin-bottom: 20px; border-radius: 6px; }
.resumen-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; }
.resumen-item { text-align: center; }
.resumen-numero { font-size: 1.8rem; font-weight: 700; color: #007bff; }
.resumen-label { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
.cobertura-table { font-size: 0.9rem; }
.cobertura-cell-ok { background: #d4edda; color: #155724; font-weight: 600; text-align: center; padding: 8px; }
.cobertura-cell-process { background: #fff3cd; color: #856404; font-weight: 600; text-align: center; padding: 8px; }
.cobertura-cell-fail { background: #f8d7da; color: #721c24; font-weight: 600; text-align: center; padding: 8px; }
.cobertura-cell-empty { background: #e9ecef; color: #999; text-align: center; padding: 8px; }
</style>`

export async function renderRutaProgresoPanel(container, claseId) {
  if (!container) return
  try {
    const progreso = await obtenerProgresoRuta(claseId)

    const html = `${STYLE}
      <div class="ruta-progreso">
        <h6 class="mb-3">
          <i class="bi bi-diagram-3 me-2"></i>
          <strong>${progreso.ruta_nombre}</strong>
        </h6>

        <div class="mini-resumen">
          <div class="resumen-grid">
            <div class="resumen-item">
              <div class="resumen-numero">${progreso.semana_actual}/${progreso.duracion_semanas}</div>
              <div class="resumen-label">Semana Actual</div>
            </div>
            <div class="resumen-item">
              <div class="resumen-numero">${progreso.objetivos_cubiertos}/${progreso.total_objetivos}</div>
              <div class="resumen-label">Objetivos Cubiertos</div>
            </div>
            <div class="resumen-item">
              <div class="resumen-numero" style="color: #28a745;">${Math.max(0, progreso.duracion_semanas - progreso.semana_actual)}</div>
              <div class="resumen-label">Semanas Restantes</div>
            </div>
            <div class="resumen-item">
              <div class="resumen-numero" style="color: #dc3545;">${progreso.alumnos.filter(a => a.cobertura.some(c => !c.confirmado)).length}</div>
              <div class="resumen-label">Rezagados</div>
            </div>
          </div>
        </div>

        <h6 class="mb-2"><strong>Cobertura por Alumno</strong></h6>
        <div style="overflow-x: auto;">
          <table class="table table-sm cobertura-table mb-0">
            <thead style="background: #f8f9fa; border-top: 2px solid #dee2e6;">
              <tr>
                <th style="min-width: 120px; text-align: left;">Alumno</th>
                ${progreso.alumnos[0]?.cobertura.slice(0, 8).map((obj, i) => `
                  <th style="max-width: 60px;">
                    <small style="font-weight: 400;">Obj ${i + 1}</small>
                  </th>
                `).join('')}
                ${progreso.alumnos[0]?.cobertura.length > 8 ? '<th>...</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${progreso.alumnos.map((alumno, idx) => `
                <tr style="${idx % 2 === 0 ? 'background: #fafafa;' : ''}">
                  <td style="text-align: left; font-weight: 500;">${alumno.nombre}</td>
                  ${alumno.cobertura.slice(0, 8).map(cob => `
                    <td class="cobertura-cell-${cob.confirmado ? 'ok' : 'empty'}">
                      ${cob.confirmado ? '✅' : '—'}
                    </td>
                  `).join('')}
                  ${alumno.cobertura.length > 8 ? '<td style="text-align: center; color: #999;">…</td>' : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="alert alert-light small mt-3 mb-0">
          <strong>Leyenda:</strong> ✅ = Cubierto | — = Pendiente
        </div>
      </div>`

    container.innerHTML = html
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`
  }
}
