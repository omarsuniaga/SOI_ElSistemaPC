// ============================================================================
// SISTEMA ACADÉMICO - Main Entry Point
// ============================================================================

// Desactivar gestos de recarga pull-to-refresh (Look and Feel nativo)
import { disablePullToRefresh } from './shared/utils/pullToRefreshBlocker.js'
disablePullToRefresh()

// PWA: Registrar Service Worker (también en desarrollo para probar)
if ('serviceWorker' in navigator) {
  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWA] Service Worker registered:', registration.scope);
    } catch (error) {
      console.log('[PWA] Service Worker registration failed:', error);
    }
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

// PWA: Banner de instalación automática
import { pwaInstaller } from './portal-maestros/components/pwaInstaller.js'

// Estilos
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrapLib from 'bootstrap';
window.bootstrap = bootstrapLib;
import './style.css';
import './styles/bootstrap-support.css';
import './modules/academic-admin/styles/academic-admin.css';

// Core
import { router } from './core/router/router.js';
import { config } from './core/config/config.js';

// Auth
import { useAuth } from './modules/auth/hooks/useAuth.js';
import { renderLoginView } from './modules/auth/views/loginView.js';

// Módulos
import { registerRoutesAuth } from './modules/auth/index.js';
import { registerRoutesMaestros } from './modules/maestros/index.js';
import { registerRoutesProgramas } from './modules/programas/index.js';
import { registerRoutesAlumnos } from './modules/alumnos/index.js';
import { registerRoutesSalones } from './modules/salones/index.js';
import { registerRoutesClases } from './modules/clases/index.js';
import { registerRoutesAsistencias } from './modules/asistencias/index.js';
import { registerRoutesPlanificacion } from './modules/planificacion/index.js';
import { registerRoutesProgresos } from './modules/progresos/index.js';
import { registerRoutesObservaciones } from './modules/observaciones/index.js'
import { registerRoutesMetricas } from './modules/metricas/index.js';
import { registerRoutesConfig } from './modules/config/index.js';
import { registerRoutesAcademicAdmin } from './modules/academic-admin/academic-admin.router.js';
import { registerRoutesAdminDashboard } from './modules/admin-dashboard/admin-dashboard.router.js';
import { registerRoutesPermisos } from './modules/permisos/index.js';

// ============================================================================
// MÓDULOS REGISTRY - Define todos los módulos de la aplicación
// ============================================================================
const MODULES_REGISTRY = [
  {
    id: 'programas',
    label: 'Programas',
    icon: 'bi-book',
    description: 'Gestión de programas académicos',
    enabled: true,
    register: registerRoutesProgramas
  },
  {
    id: 'academic-admin',
    label: 'Gestión Curricular',
    icon: 'bi-diagram-3',
    description: 'Gestión de mapa curricular y recursos',
    enabled: true,
    register: registerRoutesAcademicAdmin
  },
  {
    id: 'admin-dashboard',
    label: 'Dashboard Administrativo',
    icon: 'bi-speedometer2',
    description: 'Panel de control, reportes y analítica de maestros',
    enabled: true,
    register: registerRoutesAdminDashboard
  },
  {
    id: 'maestros',
    label: 'Maestros',
    icon: 'bi-person-check',
    description: 'Gestión de maestros/docentes',
    enabled: true,
    register: registerRoutesMaestros
  },
  {
    id: 'alumnos',
    label: 'Alumnos',
    icon: 'bi-people',
    description: 'Gestión de estudiantes',
    enabled: true,
    register: registerRoutesAlumnos
  },
  {
    id: 'salones',
    label: 'Salones',
    icon: 'bi-door-open',
    description: 'Gestión de espacios de clase',
    enabled: true,
    register: registerRoutesSalones
  },
  {
    id: 'clases',
    label: 'Clases',
    icon: 'bi-easel',
    description: 'Gestión de clases y horarios',
    enabled: true,
    register: registerRoutesClases
  },
  {
    id: 'asistencias',
    label: 'Asistencias',
    icon: 'bi-calendar-check',
    description: 'Control de asistencia',
    enabled: true,
    register: registerRoutesAsistencias
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    icon: 'bi-journal-text',
    description: 'Planificación pedagógica',
    enabled: true,
    register: registerRoutesPlanificacion
  },
  {
    id: 'progresos',
    label: 'Progresos',
    icon: 'bi-graph-up',
    description: 'Calificaciones y progreso',
    enabled: true,
    register: registerRoutesProgresos
  },
  {
    id: 'observaciones',
    label: 'Observaciones',
    icon: 'bi-chat-quote',
    description: 'Anotaciones disciplinarias',
    enabled: true,
    register: registerRoutesObservaciones
  },
  {
    id: 'metricas',
    label: 'Métricas',
    icon: 'bi-bar-chart-line',
    description: 'KPIs, alertas y análisis institucional',
    enabled: true,
    register: registerRoutesMetricas
  },
  {
    id: 'permisos',
    label: 'Permisos',
    icon: 'bi-shield-lock',
    description: 'Permisos y roles de maestros',
    enabled: true,
    register: registerRoutesPermisos
  },
  {
    id: 'config',
    label: 'Configuración',
    icon: 'bi-gear',
    description: 'Configuración del sistema',
    enabled: true,
    register: registerRoutesConfig
  }
];

// ============================================================================
// INICIALIZAR TEMA
// ============================================================================
function initializeTheme() {
  const savedTheme = localStorage.getItem('app-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

  document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  return isDark;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-bs-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-bs-theme', newTheme);
  localStorage.setItem('app-theme', newTheme);
}

// ============================================================================
// GRUPOS DE NAVEGACIÓN
// ============================================================================
const NAV_GROUPS = [
  {
    id: 'academico',
    label: 'Académico',
    icon: 'bi-easel',
    items: [
      { id: 'programas',  label: 'Programas', icon: 'bi-book' },
      { id: 'clases',     label: 'Clases',    icon: 'bi-easel2' },
      { id: 'salones',    label: 'Salones',   icon: 'bi-door-open' },
    ],
  },
  {
    id: 'personas',
    label: 'Personas',
    icon: 'bi-people',
    items: [
      { id: 'alumnos',  label: 'Alumnos',  icon: 'bi-people' },
      { id: 'maestros', label: 'Maestros', icon: 'bi-person-check' },
    ],
  },
  {
    id: 'pedagogico',
    label: 'Pedagógico',
    icon: 'bi-journal-check',
    items: [
      { id: 'asistencias',   label: 'Asistencias',   icon: 'bi-calendar-check' },
      { id: 'asistencias-reportes', label: 'Reportes', icon: 'bi-graph-up' },
      { id: 'planificacion', label: 'Planificación',  icon: 'bi-journal-text' },
      { id: 'planificacion-plantillas', label: 'Plantillas', icon: 'bi-file-earmark-template' },
      { id: 'planificacion-maestros', label: 'Todas las Planificaciones', icon: 'bi-journal-check' },
      { id: 'planificacion-curricular', label: 'Currículo',  icon: 'bi-diagram-3' },
      { id: 'progresos',     label: 'Progresos',      icon: 'bi-graph-up' },
      { id: 'observaciones', label: 'Observaciones',  icon: 'bi-chat-quote' },
    ],
  },
  {
    id: 'analisis',
    label: 'Análisis',
    icon: 'bi-bar-chart-line',
    items: [
      { id: 'metricas', label: 'Dashboard', icon: 'bi-bar-chart-line' },
      { id: 'torre-de-control', label: 'Torre de Control', icon: 'bi-radar' },
      { id: 'metricas-ia-analisis', label: 'IA Análisis', icon: 'bi-robot' },
      { id: 'metricas-ia-reportes', label: 'IA Reportes', icon: 'bi-file-earmark-richtext' },
      { id: 'admin-dashboard', label: 'Cumplimiento Maestros', icon: 'bi-clipboard-check' },
      { id: 'admin-dashboard-reportes', label: 'Reportes Director', icon: 'bi-file-earmark-pdf' },
      { id: 'admin-dashboard-analitca-llenado', label: 'Analítica Llenado', icon: 'bi-graph-up' },
      { id: 'admin-dashboard-tendencias', label: 'Tendencias', icon: 'bi-arrow-up-right' },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: 'bi-gear',
    items: [
      { id: 'configuracion', label: 'Configuración', icon: 'bi-sliders' },
      { id: 'permisos', label: 'Permisos', icon: 'bi-shield-lock' },
      { id: 'importar-datos', label: 'Importar Datos', icon: 'bi-cloud-upload' },
    ],
  },
];

function _getGroupForRoute(route) {
  for (const g of NAV_GROUPS) {
    if (g.items.some(i => i.id === route)) return g.id;
  }
  return NAV_GROUPS[0].id;
}

// ============================================================================
// RENDERIZAR SIDEBAR CON AUTH
// ============================================================================
let _navAbortController = null;

function renderNavbar(_container, isAuthenticated = false) {
  // Limpiar instancias previas (DOM + todos los listeners globales de una vez)
  _navAbortController?.abort();
  _navAbortController = new AbortController();
  const { signal } = _navAbortController;

  document.querySelector('.app-sidebar')?.remove();
  document.querySelector('.app-bottom-nav')?.remove();
  document.querySelector('.mobile-sub-sheet')?.remove();

  if (!isAuthenticated) return;

  const auth = useAuth.getUser();
  const userDisplay = auth ? (auth.email || auth.full_name || 'Usuario') : '';
  const currentRoute = localStorage.getItem('current-view') || 'programas';
  const activeGroup = _getGroupForRoute(currentRoute);
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';

  // ── Sidebar ──────────────────────────────────────────────
  const isDemo = config.isDemoMode;
  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
      <span class="sidebar-brand-text">SOI</span>
      ${isDemo ? '<span class="badge bg-warning text-dark ms-2" style="font-size: 0.6rem;">DEMO</span>' : ''}
    </div>
    <nav class="sidebar-nav">
      ${NAV_GROUPS.map(g => `
        <div class="nav-group ${g.id === activeGroup ? 'expanded' : ''}" data-group="${g.id}">
          <button class="nav-group-header">
            <i class="bi ${g.icon} group-icon"></i>
            <span>${g.label}</span>
            <i class="bi bi-chevron-down chevron"></i>
          </button>
          <div class="nav-group-items">
            ${g.items.map(item => `
              <button class="nav-item-btn ${item.id === currentRoute ? 'active' : ''}" data-route="${item.id}">
                <i class="bi ${item.icon}"></i>
                <span>${item.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <i class="bi bi-person-circle"></i>
        <span class="sidebar-user-name" title="${userDisplay}">${userDisplay.split('@')[0]}</span>
      </div>
      <button class="sidebar-action-btn" id="sidebarBtnTheme" title="Cambiar tema">
        <i class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}"></i>
      </button>
      <button class="sidebar-action-btn danger" id="sidebarBtnLogout" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  `;

  // ── Bottom nav (mobile) ───────────────────────────────────
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'app-bottom-nav';
  bottomNav.innerHTML = NAV_GROUPS.map(g => `
    <button class="bottom-tab ${g.id === activeGroup ? 'active' : ''}" data-group="${g.id}">
      <i class="bi ${g.icon}"></i>
      <span>${g.label}</span>
    </button>
  `).join('');

  // ── Mobile sub-sheet ──────────────────────────────────────
  const subSheet = document.createElement('div');
  subSheet.className = 'mobile-sub-sheet';
  subSheet.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="sheet-title" id="sheetTitle"></div>
    <div class="sheet-items" id="sheetItems"></div>
  `;

  document.body.prepend(subSheet);
  document.body.prepend(bottomNav);
  document.body.prepend(sidebar);

  // ── Eventos sidebar ───────────────────────────────────────
  sidebar.querySelectorAll('.nav-group-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.nav-group');
      const wasExpanded = group.classList.contains('expanded');
      sidebar.querySelectorAll('.nav-group').forEach(g => g.classList.remove('expanded'));
      if (!wasExpanded) group.classList.add('expanded');
    });
  });

  sidebar.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.addEventListener('click', () => router.navigate(btn.dataset.route));
  });

  sidebar.querySelector('#sidebarBtnTheme').addEventListener('click', () => {
    toggleTheme();
    const isDarkNow = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    sidebar.querySelector('#sidebarBtnTheme i').className = isDarkNow ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
  });

  sidebar.querySelector('#sidebarBtnLogout').addEventListener('click', async () => {
    await useAuth.logout();
    router.navigate('login');
  });

  // ── Eventos bottom nav ────────────────────────────────────
  function openSheet(groupId) {
    const group = NAV_GROUPS.find(g => g.id === groupId);
    if (!group) return;
    const route = localStorage.getItem('current-view') || '';
    document.getElementById('sheetTitle').textContent = group.label;
    document.getElementById('sheetItems').innerHTML = group.items.map(item => `
      <button class="sheet-item ${item.id === route ? 'active' : ''}" data-route="${item.id}">
        <i class="bi ${item.icon}"></i>
        <span>${item.label}</span>
      </button>
    `).join('');
    subSheet.dataset.group = groupId;
    subSheet.classList.add('open');
    subSheet.querySelectorAll('.sheet-item').forEach(btn => {
      btn.addEventListener('click', () => {
        router.navigate(btn.dataset.route);
        subSheet.classList.remove('open');
      });
    });
  }

  bottomNav.querySelectorAll('.bottom-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const groupId = tab.dataset.group;
      if (subSheet.classList.contains('open') && subSheet.dataset.group === groupId) {
        subSheet.classList.remove('open');
      } else {
        openSheet(groupId);
        bottomNav.querySelectorAll('.bottom-tab').forEach(t => t.classList.toggle('active', t.dataset.group === groupId));
      }
    });
  });

  // Cerrar sub-sheet al tocar fuera
  document.addEventListener('click', (e) => {
    if (subSheet.classList.contains('open') && !subSheet.contains(e.target) && !bottomNav.contains(e.target)) {
      subSheet.classList.remove('open');
    }
  }, { signal });

  // ── Sincronizar estado activo en route change ─────────────
  window.addEventListener('routeChanged', (e) => {
    const route = e.detail;
    const group = _getGroupForRoute(route);

    sidebar.querySelectorAll('.nav-item-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.route === route));
    sidebar.querySelectorAll('.nav-group').forEach(g => {
      if (g.dataset.group === group) g.classList.add('expanded');
      else g.classList.remove('expanded');
    });
    bottomNav.querySelectorAll('.bottom-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.group === group));
  }, { signal });
}

// ============================================================================
// REGISTRAR MÓDULOS
// ============================================================================
function registerModules() {
  // Registrar auth routes primero
  try {
    registerRoutesAuth();
  } catch (error) {
    console.error('Error registering auth routes:', error);
  }

  const enabledModules = MODULES_REGISTRY.filter(m => m.enabled && m.register);
  enabledModules.forEach(module => {
    try {
      module.register();
    } catch (error) {
      console.error(`Error registering module ${module.id}:`, error);
    }
  });
}

// ============================================================================
// APLICACIÓN PRINCIPAL
// ============================================================================
async function startApp() {
  const app = document.querySelector('#app');

  if (!app) {
    console.error('El contenedor #app no existe en el HTML');
    return;
  }

  // 1. Inicializar tema
  initializeTheme();

  // 2. Registrar todos los módulos y rutas
  registerModules()

  // 2b. Activar escucha de eventos de navegación inter-módulo
  router.initCustomEvents();

  // 3. Sincronizar sesión con Supabase antes de cualquier otra cosa (CRÍTICO para evitar 404)
  console.log('🔄 Sincronizando sesión...');
  await useAuth.refreshAuth();

  // 4. Configurar guard de rutas
  const authRoutes = ['login', 'register'];
  router.setAuthGuard(() => useAuth.isAuthenticated(), authRoutes);

  // 5. Verificar autenticación
  const currentRoute = localStorage.getItem('current-view') || 'programas';
  const isAuthenticated = useAuth.isAuthenticated();

  // 5. Lógica de enrutamiento inicial
  if (!isAuthenticated && !authRoutes.includes(currentRoute)) {
    // Redirigir a login si intenta acceder a ruta protegida
    localStorage.setItem('current-view', 'login');
    router.navigate('login');
  } else if (isAuthenticated && authRoutes.includes(currentRoute)) {
    // Redirigir a programas si ya está autenticado
    localStorage.setItem('current-view', 'programas');
    renderNavbar(app, true);
    router.navigate('programas');
  } else {
    // Navegación normal
    if (isAuthenticated) {
      renderNavbar(app, true);
    }
    router.init();
  }

  // 6. Suscribir a cambios de auth globalmente
  useAuth.subscribe((state) => {
    if (state.user) {
      renderNavbar(app, true);
    } else {
      app.innerHTML = '';
      const nav = document.querySelector('.app-navbar');
      if (nav) nav.remove();
      
      // Cleanup DOM elements specific to admin view
      document.querySelector('.app-sidebar')?.remove();
      document.querySelector('.app-bottom-nav')?.remove();
      document.querySelector('.mobile-sub-sheet')?.remove();
      
      router.navigate('login');
    }
  });
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

// ============================================================================
// PORTAL SWITCH BUTTON VISIBILITY (only on main page)
// ============================================================================
function updatePortalButtonVisibility() {
  const currentRoute = localStorage.getItem('current-view') || 'programas';
  const teacherBridge = document.querySelector('.teacher-bridge');

  if (!teacherBridge) return;

  // Show button only on main page (programas)
  if (currentRoute === 'programas') {
    teacherBridge.classList.add('visible');
  } else {
    teacherBridge.classList.remove('visible');
  }
}

// Update button visibility on initialization
updatePortalButtonVisibility();

// Update button visibility whenever route changes
window.addEventListener('routeChanged', (e) => {
  updatePortalButtonVisibility();
});

// ============================================================================
// EXPORTAR PARA TESTING
// ============================================================================
export { MODULES_REGISTRY, router, config };
