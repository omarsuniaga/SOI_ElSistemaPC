import adapter from './api/audicionesAdapter.js'
import { initRouter } from './audiciones.router.js'

export async function mountAudiciones(role) {
  const app = document.getElementById('app')
  if (!app) return

  const sections = await adapter.getSections()

  app.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Audiciones</a>
        <div class="navbar-nav">
          <a class="nav-link" href="#evaluacion">Evaluación</a>
          ${role === 'admin' ? '<a class="nav-link" href="#resultados">Resultados</a>' : ''}
        </div>
      </div>
    </nav>
    <div class="container-fluid mt-3">
      <div class="row">
        <div class="col-md-2">
          <div class="card">
            <div class="card-header">Secciones</div>
            <ul class="list-group list-group-flush">
              ${sections.map(s => `<li class="list-group-item">${s.name}</li>`).join('')}
              <li class="list-group-item"><a href="#tareas">Tareas institucionales</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-10" id="view-container"></div>
      </div>
    </div>`

  initRouter(role)
}
