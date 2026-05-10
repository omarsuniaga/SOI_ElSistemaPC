import { getMaestroLocal, clearMaestroLocal, PM_AUTH_KEY } from '../auth/maestroAuth.js';
import { supabase } from '../../lib/supabaseClient.js';
import {
  requestNotificationPermission, subscribeToPush, unsubscribeFromPush,
  getNotificationPreferences, saveNotificationPreferences,
  isPushSupported, isPushSubscribed, testNotification
} from '../services/pushService.js';
import { AppModal } from '../../shared/components/AppModal.js';
import { ausenciaModal } from '../components/ausenciaModal.js';
import { escHTML, getInitials } from '../utils/portalUtils.js';

const state = { saving: false };

/**
 * Vista de Perfil y Ajustes
 * Refactoreada a estructura modular y Apple Design System.
 */
export function renderPerfilView(container) {
  const maestro = getMaestroLocal();
  
  if (!maestro) {
    container.innerHTML = `
      <div class="pm-settings-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa.</p>
      </div>
    `;
    return;
  }

  // Estructura principal de la vista
  container.innerHTML = `
    <div class="pm-settings pm-fade-in">
      <header class="pm-settings-header">
        <h1 class="apple-display-md">Perfil</h1>
        <p class="apple-caption">Gestiona tu cuenta, apariencia y notificaciones</p>
      </header>

      <div class="pm-settings-grid">
        <!-- Columna Izquierda: Perfil y Datos -->
        <div class="pm-settings-col">
          <section id="section-hero"></section>
          <section id="section-datos"></section>
        </div>

        <!-- Columna Derecha: Preferencias y Sesión -->
        <div class="pm-settings-col">
          <section id="section-apariencia"></section>
          <section id="section-notificaciones"></section>
          <section id="section-ausencias"></section>
          <section id="section-sesion"></section>
        </div>
      </div>

      <footer class="pm-settings-footer">
        <p>SOI Sistema Operativo Institucional</p>
        <p class="pm-settings-footer__version">v2.5.0 &copy; 2026</p>
      </footer>
    </div>
  `;

  // Renderizar secciones
  _renderHeroSection(container.querySelector('#section-hero'), maestro);
  _renderPersonalDataSection(container.querySelector('#section-datos'), maestro);
  _renderAppearanceSection(container.querySelector('#section-apariencia'));
  _renderNotificationsSection(container.querySelector('#section-notificaciones'));
  _renderAbsencesSection(container.querySelector('#section-ausencias'));
  _renderSessionSection(container.querySelector('#section-sesion'));

  // Inicializar lógica
  _initListeners();
  _initThemeSelector();
  _animateSections();
}

/**
 * Renderiza el Hero del perfil (Avatar + Info rápida)
 */
function _renderHeroSection(container, maestro) {
  const initials = getInitials(maestro.nombre_completo);
  
  container.innerHTML = `
    <div class="card-apple pm-profile-hero">
      <div class="pm-profile-hero__content">
        <div class="pm-settings-avatar">
          ${maestro.avatar_url 
            ? `<img src="${escHTML(maestro.avatar_url)}" alt="Avatar" class="pm-settings-avatar__img">`
            : `<div class="pm-settings-avatar__placeholder">${escHTML(initials)}</div>`
          }
          <button class="pm-settings-avatar__edit" id="btnCambiarAvatar" title="Cambiar foto">
            <i class="bi bi-camera"></i>
          </button>
        </div>
        <div class="pm-profile-hero__info">
          <h2 class="pm-profile-hero__name">${escHTML(maestro.nombre_completo)}</h2>
          <p class="pm-profile-hero__email">${escHTML(maestro.email)}</p>
          ${maestro.especialidad ? `
            <span class="chip-apple active">
              <i class="bi bi-mortarboard"></i> ${escHTML(maestro.especialidad)}
            </span>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza el formulario de Datos Personales
 */
function _renderPersonalDataSection(container, maestro) {
  container.innerHTML = `
    <div class="card-apple pm-settings-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-person-circle pm-icon-blue"></i>
        <div>
          <h3 class="pm-settings-section__title">Datos Personales</h3>
          <p class="pm-settings-section__desc">Información básica de tu cuenta</p>
        </div>
      </div>
      
      <div class="pm-settings-form-grid">
        <div class="pm-settings-field">
          <label class="apple-caption">Nombre Completo</label>
          <input type="text" class="input-apple" id="perfilNombre" value="${escHTML(maestro.nombre_completo)}" placeholder="Tu nombre">
        </div>
        <div class="pm-settings-field">
          <label class="apple-caption">Teléfono</label>
          <input type="tel" class="input-apple" id="perfilTelefono" value="${escHTML(maestro.telefono || '')}" placeholder="809-000-0000">
        </div>
        <div class="pm-settings-field">
          <label class="apple-caption">Especialidad</label>
          <input type="text" class="input-apple" id="perfilEspecialidad" value="${escHTML(maestro.especialidad || '')}" placeholder="Ej. Violín">
        </div>
      </div>

      <div class="pm-settings-actions">
        <button class="btn-apple-primary" id="btnGuardarPerfil">
          <i class="bi bi-check2"></i>
          <span>Guardar Cambios</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Renderiza la sección de Apariencia
 */
function _renderAppearanceSection(container) {
  container.innerHTML = `
    <div class="card-apple pm-settings-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-palette pm-icon-amber"></i>
        <div>
          <h3 class="pm-settings-section__title">Apariencia</h3>
          <p class="pm-settings-section__desc">Personaliza el tema visual</p>
        </div>
      </div>

      <div class="pm-theme-picker">
        <button class="pm-theme-opt" data-theme="light" id="pm-theme-light">
          <div class="pm-theme-preview light"></div>
          <span>Claro</span>
        </button>
        <button class="pm-theme-opt" data-theme="dark" id="pm-theme-dark">
          <div class="pm-theme-preview dark"></div>
          <span>Oscuro</span>
        </button>
        <button class="pm-theme-opt" data-theme="system" id="pm-theme-system">
          <div class="pm-theme-preview system"></div>
          <span>Auto</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * Renderiza la sección de Ausencias
 */
function _renderAbsencesSection(container) {
  container.innerHTML = `
    <div class="card-apple pm-settings-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-calendar-event pm-icon-teal"></i>
        <div>
          <h3 class="pm-settings-section__title">Ausencias</h3>
          <p class="pm-settings-section__desc">Gestiona tus permisos</p>
        </div>
      </div>
      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility" id="pm-btn-ver-ausencias">
          <i class="bi bi-clock-history"></i> Historial
        </button>
        <button class="btn-apple-utility" id="pm-btn-solicitar-ausencia">
          <i class="bi bi-plus-lg"></i> Solicitar
        </button>
      </div>
    </div>
  `;
}

/**
 * Renderiza la sección de Notificaciones
 */
function _renderNotificationsSection(container) {
  const supported = isPushSupported();
  
  container.innerHTML = `
    <div class="card-apple pm-settings-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-bell pm-icon-red"></i>
        <div>
          <h3 class="pm-settings-section__title">Notificaciones</h3>
          <p class="pm-settings-section__desc">Configura tus alertas push</p>
        </div>
        <label class="pm-apple-switch" id="btn-toggle-push">
          <input type="checkbox">
          <span class="pm-apple-switch-slider"></span>
        </label>
      </div>

      ${supported ? `
        <div id="pm-notif-rules" class="pm-notif-list">
          <div class="pm-notif-item">
            <div class="pm-notif-item__info">
              <span class="pm-notif-item__title">Recordatorio Pre-clase</span>
              <select id="pref-min-antes" class="pm-apple-select">
                <option value="5">5 min antes</option>
                <option value="15">15 min antes</option>
                <option value="30">30 min antes</option>
              </select>
            </div>
            <label class="pm-apple-mini-switch">
              <input type="checkbox" id="pref-pre-clase">
              <span class="pm-apple-mini-switch-slider"></span>
            </label>
          </div>

          <div class="pm-notif-item">
            <div class="pm-notif-item__info">
              <span class="pm-notif-item__title">Pase de Lista Pendiente</span>
              <select id="pref-min-post" class="pm-apple-select">
                <option value="30">30 min después</option>
                <option value="60">1 hora después</option>
              </select>
            </div>
            <label class="pm-apple-mini-switch">
              <input type="checkbox" id="pref-post-clase">
              <span class="pm-apple-mini-switch-slider"></span>
            </label>
          </div>

          <div class="pm-notif-item pm-notif-item--simple">
            <span>Alerta 24 horas</span>
            <label class="pm-apple-mini-switch">
              <input type="checkbox" id="pref-24h">
              <span class="pm-apple-mini-switch-slider"></span>
            </label>
          </div>

          <button class="btn-apple-secondary btn-apple-sm" id="btn-test-notif" style="margin-top: 1rem; width: 100%;">
            <i class="bi bi-send"></i> Probar Notificación
          </button>
        </div>
      ` : `
        <p class="apple-caption" style="color: var(--pm-danger);">Push no soportado en este navegador.</p>
      `}
    </div>
  `;
}

/**
 * Renderiza la sección de Sesión
 */
function _renderSessionSection(container) {
  container.innerHTML = `
    <div class="card-apple pm-settings-section pm-section-danger">
      <div class="pm-settings-section__header">
        <i class="bi bi-shield-lock pm-icon-red"></i>
        <div>
          <h3 class="pm-settings-section__title">Seguridad</h3>
          <p class="pm-settings-section__desc">Cerrar sesión en este equipo</p>
        </div>
        <button class="btn-apple-secondary" id="btnCerrarSesion" style="border-color: var(--pm-danger); color: var(--pm-danger);">
          Salir
        </button>
      </div>
    </div>
  `;
}

// === Lógica y Animaciones ===

function _animateSections() {
  const sections = document.querySelectorAll('.card-apple');
  sections.forEach((section, i) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(12px)';
    setTimeout(() => {
      section.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, 50 * i);
  });
}

function _initThemeSelector() {
  const currentTheme = localStorage.getItem('portal-maestros-theme') || 'system';
  document.querySelectorAll('.pm-theme-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === currentTheme);
  });
}

async function guardarPerfil() {
  const nombre = document.getElementById('perfilNombre').value.trim();
  const telefono = document.getElementById('perfilTelefono').value.trim();
  const especialidad = document.getElementById('perfilEspecialidad').value.trim();

  if (!nombre) {
    mostrarToast('El nombre es obligatorio', 'danger');
    return;
  }

  state.saving = true;
  const btn = document.getElementById('btnGuardarPerfil');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="pm-settings-spinner"></span><span>Guardando...</span>`;

  try {
    const { error } = await supabase
      .from('maestros')
      .update({ nombre, telefono, especialidad })
      .eq('id', getMaestroLocal().id);

    if (error) throw error;

    const actualizado = { ...getMaestroLocal(), nombre, telefono, especialidad };
    localStorage.setItem(PM_AUTH_KEY, JSON.stringify(actualizado));
    
    mostrarToast('Perfil actualizado', 'success');
  } catch (error) {
    mostrarToast('Error al guardar: ' + error.message, 'danger');
  } finally {
    state.saving = false;
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function confirmarCerrarSesion() {
  AppModal.open({
    title: '¿Cerrar Sesión?',
    size: 'sm',
    body: `
      <div style="text-align:center; padding: 1rem 0;">
        <i class="bi bi-box-arrow-right" style="font-size: 2.5rem; color: var(--pm-danger); opacity: 0.8;"></i>
        <p style="margin-top: 1rem;">¿Estás seguro que quieres salir?</p>
      </div>
    `,
    saveText: 'Salir',
    cancelText: 'Cancelar',
    onSave: () => {
      clearMaestroLocal();
      window.location.reload();
      return true;
    }
  });
}

function mostrarToast(mensaje, tipo = 'info') {
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message: mensaje, type: tipo } }));
}

async function _initListeners() {
  // Guardar Perfil
  document.getElementById('btnGuardarPerfil')?.addEventListener('click', guardarPerfil);
  
  // Cerrar Sesión
  document.getElementById('btnCerrarSesion')?.addEventListener('click', confirmarCerrarSesion);

  // Avatar Edit
  document.getElementById('btnCambiarAvatar')?.addEventListener('click', () => {
    mostrarToast('Cambio de avatar disponible en la próxima versión', 'info');
  });

  // Push toggle
  const toggleLabel = document.getElementById('btn-toggle-push');
  const toggleInput = toggleLabel?.querySelector('input');
  if (toggleLabel && toggleInput) {
    toggleInput.checked = await isPushSubscribed();

    toggleInput.addEventListener('change', async () => {
      if (toggleInput.checked) {
        const res = await subscribeToPush();
        if (res.success) mostrarToast('Notificaciones activadas', 'success');
        else {
          toggleInput.checked = false;
          mostrarToast(res.error || 'Error al activar', 'danger');
        }
      } else {
        const res = await unsubscribeFromPush();
        if (res.success) mostrarToast('Notificaciones desactivadas', 'info');
      }
    });
  }

  // Cargar y guardar preferencias de notificaciones
  const prefs = await getNotificationPreferences();
  const elements = {
    preClase: document.getElementById('pref-pre-clase'),
    minAntes: document.getElementById('pref-min-antes'),
    postClase: document.getElementById('pref-post-clase'),
    minPost: document.getElementById('pref-min-post'),
    pref24h: document.getElementById('pref-24h')
  };

  if (elements.preClase) elements.preClase.checked = prefs.alerta_pre_clase;
  if (elements.minAntes) elements.minAntes.value = String(prefs.min_antes_clase);
  if (elements.postClase) elements.postClase.checked = prefs.alerta_post_clase;
  if (elements.minPost) elements.minPost.value = String(prefs.min_post_clase_sin_registro);
  if (elements.pref24h) elements.pref24h.checked = prefs.alerta_24h;

  const savePrefs = async () => {
    const updated = {
      alerta_pre_clase: elements.preClase?.checked ?? true,
      min_antes_clase: parseInt(elements.minAntes?.value || '15', 10),
      alerta_post_clase: elements.postClase?.checked ?? true,
      min_post_clase_sin_registro: parseInt(elements.minPost?.value || '60', 10),
      alerta_24h: elements.pref24h?.checked ?? true,
      alerta_48h: true // default
    };
    await saveNotificationPreferences(updated);
  };

  document.querySelectorAll('#pm-notif-rules input, #pm-notif-rules select').forEach(el => {
    el.addEventListener('change', savePrefs);
  });

  document.getElementById('btn-test-notif')?.addEventListener('click', async () => {
    if (!await testNotification()) mostrarToast('Primero activa las notificaciones', 'warning');
  });

  // Temas
  document.getElementById('pm-theme-light')?.addEventListener('click', () => applyTheme('light'));
  document.getElementById('pm-theme-dark')?.addEventListener('click', () => applyTheme('dark'));
  document.getElementById('pm-theme-system')?.addEventListener('click', () => applyTheme('system'));

  // Ausencias
  document.getElementById('pm-btn-ver-ausencias')?.addEventListener('click', async () => {
    const { ausenciasPanel } = await import('../components/ausenciasPanel.js');
    ausenciasPanel.open();
  });

  document.getElementById('pm-btn-solicitar-ausencia')?.addEventListener('click', () => ausenciaModal.open());
}

const THEME_KEY = 'portal-maestros-theme';
let currentTheme = localStorage.getItem(THEME_KEY) || 'system';

function applyTheme(theme) {
  const root = document.documentElement;
  const resolvedTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  
  root.setAttribute('data-bs-theme', resolvedTheme);
  root.setAttribute('data-portal-theme', resolvedTheme);

  if (resolvedTheme === 'dark') root.classList.add('pm-dark');
  else root.classList.remove('pm-dark');
  
  document.querySelectorAll('.pm-theme-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === theme);
  });
  
  localStorage.setItem(THEME_KEY, theme);
  currentTheme = theme;

  window.dispatchEvent(new CustomEvent('themeChanged', { 
    detail: { theme: resolvedTheme } 
  }));
}

applyTheme(currentTheme);
