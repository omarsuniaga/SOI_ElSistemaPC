import { getMaestroLocal, clearMaestroLocal, PM_AUTH_KEY } from '../auth/maestroAuth.js';
import { supabase } from '../../lib/supabaseClient.js';
import {
  requestNotificationPermission, subscribeToPush, unsubscribeFromPush,
  getNotificationPreferences, saveNotificationPreferences,
  isPushSupported, isPushSubscribed, testNotification
} from '../services/pushService.js';
import { AppModal } from '../../shared/components/AppModal.js';
import { ausenciaModal } from '../components/ausenciaModal.js';

const state = { saving: false };

/**
 * Genera las iniciales del maestro para el avatar placeholder.
 */
function _getInitials(nombre) {
  if (!nombre) return '??';
  const parts = nombre.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

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

  const initials = _getInitials(maestro.nombre);

  container.innerHTML = `
    <div class="pm-settings">
      <!-- ═══ Header ═══ -->
      <div class="pm-settings-header">
        <div class="pm-settings-header__icon">
          <i class="bi bi-gear-wide-connected"></i>
        </div>
        <div class="pm-settings-header__text">
          <h1 class="pm-settings-header__title">Ajustes</h1>
          <p class="pm-settings-header__sub">Perfil, apariencia y preferencias</p>
        </div>
      </div>

      <!-- ═══ Profile Card (Hero) ═══ -->
      <div class="pm-settings-card pm-settings-profile-hero">
        <div class="pm-settings-profile-hero__bg"></div>
        <div class="pm-settings-profile-hero__content">
          <div class="pm-settings-avatar">
            ${maestro.avatar_url 
              ? `<img src="${maestro.avatar_url}" alt="Avatar de ${maestro.nombre}" class="pm-settings-avatar__img">`
              : `<div class="pm-settings-avatar__placeholder">${initials}</div>`
            }
            <button class="pm-settings-avatar__edit" id="btnCambiarAvatar" aria-label="Cambiar foto de perfil">
              <i class="bi bi-camera-fill"></i>
            </button>
          </div>
          <div class="pm-settings-profile-hero__info">
            <h2 class="pm-settings-profile-hero__name">${maestro.nombre}</h2>
            <p class="pm-settings-profile-hero__email">${maestro.email}</p>
            ${maestro.especialidad ? `
              <span class="pm-settings-profile-hero__badge">
                <i class="bi bi-mortarboard-fill"></i> ${maestro.especialidad}
              </span>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- ═══ Section: Datos Personales ═══ -->
      <div class="pm-settings-card pm-settings-section" id="section-datos">
        <div class="pm-settings-section__header">
          <div class="pm-settings-section__icon pm-settings-section__icon--blue">
            <i class="bi bi-person-lines-fill"></i>
          </div>
          <div>
            <h3 class="pm-settings-section__title">Datos Personales</h3>
            <p class="pm-settings-section__desc">Información básica de tu cuenta</p>
          </div>
          <button class="pm-settings-btn pm-settings-btn--primary" id="btnGuardarPerfil">
            <i class="bi bi-check-lg"></i>
            <span>Guardar</span>
          </button>
        </div>
        <div class="pm-settings-section__body">
          <div class="pm-settings-form-grid">
            <div class="pm-settings-field">
              <label class="pm-settings-label" for="perfilNombre">
                <i class="bi bi-person"></i> Nombre Completo
              </label>
              <input type="text" class="pm-settings-input" id="perfilNombre" value="${maestro.nombre || ''}" placeholder="Tu nombre completo">
            </div>
            <div class="pm-settings-field">
              <label class="pm-settings-label" for="perfilEmail">
                <i class="bi bi-envelope"></i> Correo Electrónico
              </label>
              <input type="email" class="pm-settings-input pm-settings-input--disabled" id="perfilEmail" value="${maestro.email || ''}" disabled>
              <span class="pm-settings-field-hint">Gestionado por el administrador</span>
            </div>
            <div class="pm-settings-field">
              <label class="pm-settings-label" for="perfilTelefono">
                <i class="bi bi-telephone"></i> Teléfono
              </label>
              <input type="tel" class="pm-settings-input" id="perfilTelefono" value="${maestro.telefono || ''}" placeholder="Ej. 809-555-0000">
            </div>
            <div class="pm-settings-field">
              <label class="pm-settings-label" for="perfilEspecialidad">
                <i class="bi bi-music-note-list"></i> Especialidad Principal
              </label>
              <input type="text" class="pm-settings-input" id="perfilEspecialidad" value="${maestro.especialidad || ''}" placeholder="Ej. Violín, Piano, Teoría Musical">
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Section: Apariencia ═══ -->
      <div class="pm-settings-card pm-settings-section" id="section-apariencia">
        <div class="pm-settings-section__header">
          <div class="pm-settings-section__icon pm-settings-section__icon--amber">
            <i class="bi bi-palette-fill"></i>
          </div>
          <div>
            <h3 class="pm-settings-section__title">Apariencia</h3>
            <p class="pm-settings-section__desc">Personaliza el aspecto visual de tu portal</p>
          </div>
        </div>
        <div class="pm-settings-section__body">
          <div class="pm-settings-theme-picker">
            <button class="pm-settings-theme-option" id="pm-theme-light" data-theme="light">
              <div class="pm-settings-theme-option__preview pm-settings-theme-option__preview--light">
                <div class="pm-settings-theme-option__minibar"></div>
                <div class="pm-settings-theme-option__minicontent">
                  <div class="pm-settings-theme-option__miniline"></div>
                  <div class="pm-settings-theme-option__miniline pm-settings-theme-option__miniline--short"></div>
                </div>
              </div>
              <span class="pm-settings-theme-option__label">
                <i class="bi bi-sun-fill"></i> Claro
              </span>
            </button>
            <button class="pm-settings-theme-option" id="pm-theme-dark" data-theme="dark">
              <div class="pm-settings-theme-option__preview pm-settings-theme-option__preview--dark">
                <div class="pm-settings-theme-option__minibar"></div>
                <div class="pm-settings-theme-option__minicontent">
                  <div class="pm-settings-theme-option__miniline"></div>
                  <div class="pm-settings-theme-option__miniline pm-settings-theme-option__miniline--short"></div>
                </div>
              </div>
              <span class="pm-settings-theme-option__label">
                <i class="bi bi-moon-stars-fill"></i> Oscuro
              </span>
            </button>
            <button class="pm-settings-theme-option" id="pm-theme-system" data-theme="system">
              <div class="pm-settings-theme-option__preview pm-settings-theme-option__preview--system">
                <div class="pm-settings-theme-option__minibar"></div>
                <div class="pm-settings-theme-option__minicontent">
                  <div class="pm-settings-theme-option__miniline"></div>
                  <div class="pm-settings-theme-option__miniline pm-settings-theme-option__miniline--short"></div>
                </div>
              </div>
              <span class="pm-settings-theme-option__label">
                <i class="bi bi-laptop"></i> Automático
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ Section: Ausencias ═══ -->
      <div class="pm-settings-card pm-settings-section" id="section-ausencias">
        <div class="pm-settings-section__header">
          <div class="pm-settings-section__icon pm-settings-section__icon--teal">
            <i class="bi bi-calendar-range"></i>
          </div>
          <div>
            <h3 class="pm-settings-section__title">Ausencias y Permisos</h3>
            <p class="pm-settings-section__desc">Gestiona tus solicitudes y revisa el historial</p>
          </div>
          <div class="pm-settings-btn-group">
            <button class="pm-settings-btn pm-settings-btn--ghost" id="pm-btn-ver-ausencias">
              <i class="bi bi-clock-history"></i>
              <span>Historial</span>
            </button>
            <button class="pm-settings-btn pm-settings-btn--teal" id="pm-btn-solicitar-ausencia">
              <i class="bi bi-plus-lg"></i>
              <span>Solicitar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ Section: Notificaciones ═══ -->
      <div class="pm-settings-card pm-settings-section" id="section-notificaciones">
        <div class="pm-settings-section__header">
          <div class="pm-settings-section__icon pm-settings-section__icon--red">
            <i class="bi bi-bell-fill"></i>
          </div>
          <div>
            <h3 class="pm-settings-section__title">Notificaciones Push</h3>
            <p class="pm-settings-section__desc">Configura las alertas de tu portal</p>
          </div>
          <label class="pm-settings-switch" id="btn-toggle-push">
            <input type="checkbox" class="pm-settings-switch__input">
            <span class="pm-settings-switch__track">
              <span class="pm-settings-switch__thumb"></span>
            </span>
          </label>
        </div>
        <div class="pm-settings-section__body">
          ${isPushSupported() ? `
            <div id="pm-notif-rules" class="pm-settings-notif-grid">
              <!-- Recordatorio Pre-clase -->
              <div class="pm-settings-notif-card">
                <div class="pm-settings-notif-card__header">
                  <i class="bi bi-alarm pm-settings-notif-card__icon pm-settings-notif-card__icon--blue"></i>
                  <div>
                    <span class="pm-settings-notif-card__title">Recordatorio Pre-clase</span>
                    <span class="pm-settings-notif-card__desc">Recibe un aviso antes de cada clase</span>
                  </div>
                  <label class="pm-settings-mini-switch">
                    <input type="checkbox" id="pref-pre-clase">
                    <span class="pm-settings-mini-switch__track"></span>
                  </label>
                </div>
                <div class="pm-settings-notif-card__body">
                  <label class="pm-settings-label--sm" for="pref-min-antes">Tiempo de anticipación</label>
                  <select id="pref-min-antes" class="pm-settings-select">
                    <option value="5">5 minutos antes</option>
                    <option value="15" selected>15 minutos antes</option>
                    <option value="30">30 minutos antes</option>
                  </select>
                </div>
              </div>

              <!-- Pase de Lista Pendiente -->
              <div class="pm-settings-notif-card">
                <div class="pm-settings-notif-card__header">
                  <i class="bi bi-clipboard-check pm-settings-notif-card__icon pm-settings-notif-card__icon--amber"></i>
                  <div>
                    <span class="pm-settings-notif-card__title">Pase de Lista Pendiente</span>
                    <span class="pm-settings-notif-card__desc">Aviso si no registras asistencia</span>
                  </div>
                  <label class="pm-settings-mini-switch">
                    <input type="checkbox" id="pref-post-clase">
                    <span class="pm-settings-mini-switch__track"></span>
                  </label>
                </div>
                <div class="pm-settings-notif-card__body">
                  <label class="pm-settings-label--sm" for="pref-min-post">Tiempo después de la clase</label>
                  <select id="pref-min-post" class="pm-settings-select">
                    <option value="30">30 minutos después</option>
                    <option value="60" selected>1 hora después</option>
                    <option value="120">2 horas después</option>
                  </select>
                </div>
              </div>

              <!-- Alerta 24h -->
              <div class="pm-settings-notif-card pm-settings-notif-card--compact">
                <div class="pm-settings-notif-card__header">
                  <i class="bi bi-hourglass-split pm-settings-notif-card__icon pm-settings-notif-card__icon--purple"></i>
                  <div>
                    <span class="pm-settings-notif-card__title">Alerta 24 horas</span>
                    <span class="pm-settings-notif-card__desc">Resumen diario de actividad</span>
                  </div>
                  <label class="pm-settings-mini-switch">
                    <input type="checkbox" id="pref-24h">
                    <span class="pm-settings-mini-switch__track"></span>
                  </label>
                </div>
              </div>

              <!-- Alerta 48h -->
              <div class="pm-settings-notif-card pm-settings-notif-card--compact">
                <div class="pm-settings-notif-card__header">
                  <i class="bi bi-calendar-week pm-settings-notif-card__icon pm-settings-notif-card__icon--green"></i>
                  <div>
                    <span class="pm-settings-notif-card__title">Alerta 48 horas</span>
                    <span class="pm-settings-notif-card__desc">Recordatorio de clases próximas</span>
                  </div>
                  <label class="pm-settings-mini-switch">
                    <input type="checkbox" id="pref-48h">
                    <span class="pm-settings-mini-switch__track"></span>
                  </label>
                </div>
              </div>
            </div>
            <div class="pm-settings-notif-test">
              <button class="pm-settings-btn pm-settings-btn--ghost" id="btn-test-notif">
                <i class="bi bi-send"></i>
                <span>Enviar notificación de prueba</span>
              </button>
            </div>
          ` : `
            <div class="pm-settings-alert pm-settings-alert--warning">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <div>
                <strong>Navegador no compatible</strong>
                <p>Las notificaciones push no están disponibles en este navegador.</p>
              </div>
            </div>
          `}
        </div>
      </div>

      <!-- ═══ Section: Sesión ═══ -->
      <div class="pm-settings-card pm-settings-section pm-settings-section--danger" id="section-sesion">
        <div class="pm-settings-section__header">
          <div class="pm-settings-section__icon pm-settings-section__icon--red">
            <i class="bi bi-shield-lock"></i>
          </div>
          <div>
            <h3 class="pm-settings-section__title">Sesión</h3>
            <p class="pm-settings-section__desc">Cierra sesión de forma segura en este dispositivo</p>
          </div>
          <button class="pm-settings-btn pm-settings-btn--danger" id="btnCerrarSesion">
            <i class="bi bi-box-arrow-right"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <!-- ═══ Footer ═══ -->
      <footer class="pm-settings-footer">
        <p>SOI Sistema Operativo Institucional</p>
        <p class="pm-settings-footer__version">v2.4.0 &copy; 2026</p>
      </footer>
    </div>


  `;

  document.getElementById('btnGuardarPerfil')?.addEventListener('click', guardarPerfil);
  document.getElementById('btnCerrarSesion')?.addEventListener('click', confirmarCerrarSesion);
  
  _initListeners();
  _initThemeSelector();
  _animateSections();
}

// === Animate sections on mount ===
function _animateSections() {
  const sections = document.querySelectorAll('.pm-settings-section, .pm-settings-profile-hero');
  sections.forEach((section, i) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(12px)';
    setTimeout(() => {
      section.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, 60 * i);
  });
}

// === Theme selector visual state ===
function _initThemeSelector() {
  const currentTheme = localStorage.getItem('pm_theme') || 'system';
  const options = document.querySelectorAll('.pm-settings-theme-option');
  options.forEach(opt => {
    const theme = opt.dataset.theme;
    opt.classList.toggle('pm-settings-theme-option--active', theme === currentTheme);
  });
}

async function guardarPerfil() {
  const nombre = document.getElementById('perfilNombre').value.trim();
  const telefono = document.getElementById('perfilTelefono').value.trim();
  const especialidad = document.getElementById('perfilEspecialidad').value.trim();

  if (!nombre) {
    mostrarToast('El nombre no puede estar vacío', 'danger');
    return;
  }

  state.saving = true;
  const btn = document.getElementById('btnGuardarPerfil');
  btn.disabled = true;
  btn.innerHTML = `<span class="pm-settings-spinner"></span><span>Guardando…</span>`;

  try {
    const { error } = await supabase
      .from('maestros')
      .update({ nombre, telefono, especialidad })
      .eq('id', getMaestroLocal().id);

    if (error) throw error;

    const actualizado = { ...getMaestroLocal(), nombre, telefono, especialidad };
    localStorage.setItem(PM_AUTH_KEY, JSON.stringify(actualizado));
    
    mostrarToast('Datos guardados correctamente', 'success');
  } catch (error) {
    mostrarToast('Error: ' + error.message, 'danger');
  } finally {
    state.saving = false;
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-check-lg"></i><span>Guardar</span>`;
  }
}

function confirmarCerrarSesion() {
  AppModal.open({
    title: '⚠️ Cerrar Sesión',
    size: 'sm',
    body: `
      <div style="text-align:center; padding: 0.5rem 0;">
        <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,59,48,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
          <i class="bi bi-box-arrow-right" style="font-size:1.5rem;color:var(--pm-danger);"></i>
        </div>
        <p style="font-size:0.95rem;font-weight:600;color:var(--pm-text);margin:0 0 0.35rem;">¿Cerrar sesión?</p>
        <p style="font-size:0.8rem;color:var(--pm-text-muted);margin:0;">Se cerrará tu sesión en este dispositivo. Podrás volver a iniciar sesión cuando quieras.</p>
      </div>
    `,
    saveText: 'Sí, cerrar sesión',
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

// === Notificaciones ===
async function _initListeners() {
  // ── Push toggle ──
  const toggleLabel = document.getElementById('btn-toggle-push');
  const toggleInput = toggleLabel?.querySelector('.pm-settings-switch__input');
  if (toggleLabel && toggleInput) {
    const subscribed = await isPushSubscribed();
    toggleInput.checked = subscribed;

    toggleInput.addEventListener('change', async () => {
      if (toggleInput.checked) {
        const res = await subscribeToPush();
        if (res.success) {
          mostrarToast('Notificaciones activadas', 'success');
        } else {
          toggleInput.checked = false;
          mostrarToast(res.error || 'Error activando notificaciones', 'danger');
        }
      } else {
        const res = await unsubscribeFromPush();
        if (res.success) {
          mostrarToast('Notificaciones desactivadas', 'info');
        }
      }
    });
  }

  // ── Cargar preferencias desde Supabase ──
  const prefs = await getNotificationPreferences();
  const preClase = document.getElementById('pref-pre-clase');
  const minAntes = document.getElementById('pref-min-antes');
  const postClase = document.getElementById('pref-post-clase');
  const minPost = document.getElementById('pref-min-post');
  const pref24h = document.getElementById('pref-24h');
  const pref48h = document.getElementById('pref-48h');

  if (preClase) preClase.checked = prefs.alerta_pre_clase;
  if (minAntes) minAntes.value = String(prefs.min_antes_clase);
  if (postClase) postClase.checked = prefs.alerta_post_clase;
  if (minPost) minPost.value = String(prefs.min_post_clase_sin_registro);
  if (pref24h) pref24h.checked = prefs.alerta_24h;
  if (pref48h) pref48h.checked = prefs.alerta_48h;

  // ── Auto-guardar al cambiar cualquier preferencia ──
  const savePrefs = async () => {
    const updated = {
      alerta_pre_clase: preClase?.checked ?? true,
      min_antes_clase: parseInt(minAntes?.value || '15', 10),
      alerta_post_clase: postClase?.checked ?? true,
      min_post_clase_sin_registro: parseInt(minPost?.value || '60', 10),
      alerta_24h: pref24h?.checked ?? true,
      alerta_48h: pref48h?.checked ?? true,
    };
    const { error } = await saveNotificationPreferences(updated);
    if (error) {
      mostrarToast('Error guardando preferencias', 'danger');
    }
  };

  document.querySelectorAll('#pm-notif-rules input, #pm-notif-rules select').forEach(el => {
    el.addEventListener('change', savePrefs);
  });

  // ── Test notification ──
  document.getElementById('btn-test-notif')?.addEventListener('click', async () => {
    const sent = await testNotification();
    if (!sent) mostrarToast('Primero activa las notificaciones', 'warning');
  });

  // ── Tema ──
  document.getElementById('pm-theme-light')?.addEventListener('click', () => applyTheme('light'));
  document.getElementById('pm-theme-dark')?.addEventListener('click', () => applyTheme('dark'));
  document.getElementById('pm-theme-system')?.addEventListener('click', () => applyTheme('system'));

  // ── Ausencias ──
  document.getElementById('pm-btn-ver-ausencias')?.addEventListener('click', async () => {
    const { ausenciasPanel } = await import('../components/ausenciasPanel.js');
    ausenciasPanel.open();
  });

  // ── Solicitar Ausencia (modal) ──
  document.getElementById('pm-btn-solicitar-ausencia')?.addEventListener('click', () => {
    ausenciaModal.open();
  });
}

// === Theme Toggle ===
const THEME_KEY = 'pm_theme'
let currentTheme = localStorage.getItem(THEME_KEY) || 'system'

function applyTheme(theme) {
  const root = document.documentElement
  const resolvedTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  
  if (resolvedTheme === 'dark') {
    root.classList.add('pm-dark')
  } else {
    root.classList.remove('pm-dark')
  }
  
  // Update visual state of theme picker
  document.querySelectorAll('.pm-settings-theme-option').forEach(opt => {
    opt.classList.toggle('pm-settings-theme-option--active', opt.dataset.theme === theme)
  })
  
  localStorage.setItem(THEME_KEY, theme)
  currentTheme = theme
}

// Inicializar tema globalmente al cargar el archivo
applyTheme(currentTheme)
