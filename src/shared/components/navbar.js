import { router } from '../../core/router/router.js';

export function renderNavbar(container) {
  const nav = document.createElement('div');
  nav.className = 'navbar navbar-dark bg-dark';
  nav.innerHTML = `
    <div class="container-fluid">
      <span class="navbar-brand mb-0 h5">
        <i class="bi bi-music-note-beamed text-primary"></i> SOI Sistema Académico
      </span>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-light btn-sm nav-btn" data-route="programas">
          <i class="bi bi-book"></i> Programas
        </button>
        <button class="btn btn-outline-light btn-sm nav-btn" data-route="maestros">
          <i class="bi bi-person-check"></i> Maestros
        </button>
      </div>
    </div>
  `;

  // Asignar eventos de navegación
  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const route = e.currentTarget.dataset.route;
      router.navigate(route);
    });
  });

  // Reaccionar a cambios de ruta para marcar el botón activo
  window.addEventListener('routeChanged', (e) => {
    const currentPath = e.detail;
    nav.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.route === currentPath) {
        btn.classList.add('btn-light');
        btn.classList.remove('btn-outline-light');
      } else {
        btn.classList.add('btn-outline-light');
        btn.classList.remove('btn-light');
      }
    });
  });

  // Insertar antes del contenedor principal
  if (container.parentElement) {
    const existingNav = container.parentElement.querySelector('.navbar');
    if (existingNav) {
      existingNav.remove();
    }
    container.parentElement.insertBefore(nav, container);
  }
}
