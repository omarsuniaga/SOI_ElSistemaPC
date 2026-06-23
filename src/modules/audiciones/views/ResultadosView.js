export function createResultadosView(container, adapter) {
  const render = (results) => {
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0">Resultados de Audiciones</h4>
        <button class="btn btn-outline-secondary btn-sm" id="export-csv">Exportar CSV</button>
      </div>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead><tr>
            <th>Estudiante</th>
            <th>Sección</th>
            <th>Promedio</th>
            <th>Grupo</th>
          </tr></thead>
          <tbody>
            ${results.map(r => {
              const groupClass = r.group === 'A' ? 'success' : r.group === 'B' ? 'primary' : r.group === 'C' ? 'warning' : 'danger'
              return `<tr>
                <td>${r.student_name}</td>
                <td>${r.section_name}</td>
                <td>${r.avg_score !== null ? r.avg_score : '—'}</td>
                <td><span class="badge bg-${groupClass}">${r.group || '—'}</span></td>
              </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>`

    container.querySelector('#export-csv')?.addEventListener('click', () => {
      const header = 'Estudiante\tSección\tPromedio\tGrupo'
      const rows = results.map(r => `${r.student_name}\t${r.section_name}\t${r.avg_score ?? ''}\t${r.group ?? ''}`)
      navigator.clipboard.writeText([header, ...rows].join('\n'))
    })
  }

  const load = async () => {
    try {
      const results = await adapter.getStudentResults()
      render(results)
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`
    }
  }

  load()
  return { destroy: () => { container.innerHTML = '' } }
}
