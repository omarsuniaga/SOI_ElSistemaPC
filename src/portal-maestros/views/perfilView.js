import { getMaestroLocal, clearMaestroLocal, logoutPortal, PM_AUTH_KEY, STORAGE_KEY } from '../auth/maestroAuth.js';
import { supabase } from '../../lib/supabaseClient.js';
import {
  subscribeToPush, unsubscribeFromPush,
  isPushSupported, isPushSubscribed
} from '../services/pushService.js';
import { AppModal } from '../../shared/components/AppModal.js';
import { ausenciaModal } from '../components/ausenciaModal.js';
import { notifConfigModal } from '../components/notifConfigModal.js';
import { escHTML, getInitials } from '../utils/portalUtils.js';

const state = { saving: false };
let initialProfileValues = {};

/**
 * Vista de Perfil y Ajustes
 * Refactoreada a estructura modular y Apple Design System.
 */
export async function renderPerfilView(container) {
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
    <div class="pm-settings pm-fade-in" role="main" aria-label="Perfil y configuración">
      <header class="pm-settings-header">
        <h1 class="apple-display-md">Perfil</h1>
        <p class="apple-caption">Gestiona tu cuenta, apariencia y notificaciones</p>
      </header>

      <div class="pm-settings-grid" role="region" aria-label="Opciones de configuración">
        <!-- Banner de perfil incompleto -->
        <div id="pm-banner-perfil-incompleto" style="display:none;" class="pm-profile-alert"></div>

        <!-- Columna Izquierda: Perfil y Datos -->
        <div class="pm-settings-col">
          <section id="section-hero"></section>
          <section id="section-datos"></section>
          <section id="section-disponibilidad"></section>
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

// Pre-cargar estado de suscripciones para evitar parpadeo
  const pushSupported = isPushSupported();
  const pushSubscribed = pushSupported ? await isPushSubscribed() : false;
  
  // Renderizar secciones
  _renderHeroSection(container.querySelector('#section-hero'), maestro);
  _renderPersonalDataSection(container.querySelector('#section-datos'), maestro);
  _renderAvailabilitySection(container.querySelector('#section-disponibilidad'), maestro);
  _renderAppearanceSection(container.querySelector('#section-apariencia'));
  _renderNotificationsSection(container.querySelector('#section-notificaciones'), pushSupported, pushSubscribed);
  _renderAbsencesSection(container.querySelector('#section-ausencias'));
  _renderSessionSection(container.querySelector('#section-sesion'));

  // Banner de alerta si perfil incompleto
  _checkPerfilIncompleto(maestro);

  // Inicializar lógica
  _initListeners();
  _initThemeSelector();
  _animateSections();

  // Sembrar estado inicial para dirty-state tracking del botón Guardar
  initialProfileValues = {
    nombre_completo: maestro.nombre_completo || '',
    tlf:             maestro.tlf ?? maestro.telefono ?? '',
    especialidad:    maestro.especialidad || '',
    disponibilidad:  JSON.stringify(maestro.disponibilidad || {}),
  };
  _updateSaveButtonState();
}

/**
 * Renderiza el Hero del perfil (Avatar + Info rápida)
 */
function _renderHeroSection(container, maestro) {
  const initials = getInitials(maestro.nombre_completo);
  
  container.innerHTML = `
    <div class="card-apple pm-profile-hero" role="region" aria-labelledby="hero-name">
      <div class="pm-profile-hero__content">
        <div class="pm-settings-avatar" role="img" aria-label="Avatar de perfil">
          ${maestro.avatar_url 
            ? `<img src="${escHTML(maestro.avatar_url)}" alt="Avatar" class="pm-settings-avatar__img">`
            : `<div class="pm-settings-avatar__placeholder">${escHTML(initials)}</div>`
          }
          <button class="pm-settings-avatar__edit" id="btnCambiarAvatar" title="Cambiar foto" aria-label="Cambiar foto de perfil">
            <i class="bi bi-camera" aria-hidden="true"></i>
          </button>
        </div>
        <div class="pm-profile-hero__info">
          <h2 class="pm-profile-hero__name" id="hero-name">${escHTML(maestro.nombre_completo)}</h2>
          <p class="pm-profile-hero__email">${escHTML(maestro.email)}</p>
          ${maestro.especialidad ? `
            <span class="chip-apple active">
              <i class="bi bi-mortarboard" aria-hidden="true"></i> ${escHTML(maestro.especialidad)}
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
    <div class="card-apple pm-settings-section" role="region" aria-labelledby="section-datos-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-person-circle pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 class="pm-settings-section__title" id="section-datos-title">Datos Personales</h3>
          <p class="pm-settings-section__desc">Información básica de tu cuenta</p>
        </div>
      </div>
      
      <div class="pm-settings-form-grid">
        <div class="pm-settings-field">
          <label class="apple-caption" for="perfilNombre">Nombre Completo</label>
          <input type="text" class="input-apple" id="perfilNombre" value="${escHTML(maestro.nombre_completo)}" placeholder="Tu nombre" aria-required="true">
        </div>
        <div class="pm-settings-field">
          <label class="apple-caption" for="perfilTelefono">Teléfono</label>
          <input type="tel" class="input-apple" id="perfilTelefono" value="${escHTML(maestro.tlf ?? maestro.telefono ?? '')}" placeholder="809-000-0000">
        </div>
        <div class="pm-settings-field">
          <label class="apple-caption" for="perfilEspecialidad">Especialidad</label>
          <input type="text" class="input-apple" id="perfilEspecialidad" value="${escHTML(maestro.especialidad || '')}" placeholder="Ej. Violín">
        </div>
      </div>

      <div class="pm-settings-actions">
        <button class="btn-apple-primary" id="btnGuardarPerfil" aria-disabled="true">
          <i class="bi bi-check2" aria-hidden="true"></i>
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
    <div class="card-apple pm-settings-section" role="region" aria-labelledby="section-apariencia-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-palette pm-icon-amber" aria-hidden="true"></i>
        <div>
          <h3 class="pm-settings-section__title" id="section-apariencia-title">Apariencia</h3>
          <p class="pm-settings-section__desc">Personaliza el tema visual</p>
        </div>
      </div>

      <div class="pm-theme-picker" role="radiogroup" aria-label="Seleccionar tema">
        <button class="pm-theme-opt" data-theme="light" id="pm-theme-light" role="radio" aria-checked="false">
          <div class="pm-theme-preview light"></div>
          <span>Claro</span>
        </button>
        <button class="pm-theme-opt" data-theme="dark" id="pm-theme-dark" role="radio" aria-checked="false">
          <div class="pm-theme-preview dark"></div>
          <span>Oscuro</span>
        </button>
        <button class="pm-theme-opt" data-theme="system" id="pm-theme-system" role="radio" aria-checked="false">
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
    <div class="card-apple pm-settings-section" role="region" aria-labelledby="section-ausencias-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-calendar-event pm-icon-teal" aria-hidden="true"></i>
        <div>
          <h3 class="pm-settings-section__title" id="section-ausencias-title">Ausencias</h3>
          <p class="pm-settings-section__desc">Gestiona tus permisos</p>
        </div>
      </div>
      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility" id="pm-btn-ver-ausencias">
          <i class="bi bi-clock-history" aria-hidden="true"></i> Historial
        </button>
        <button class="btn-apple-utility" id="pm-btn-solicitar-ausencia">
          <i class="bi bi-plus-lg" aria-hidden="true"></i> Solicitar
        </button>
      </div>
    </div>
  `;
}

function _renderNotificationsSection(container, supported = false, subscribed = false) {
  container.innerHTML = `
    <div class="card-apple pm-settings-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-bell pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 class="pm-settings-section__title">Notificaciones</h3>
          <p class="pm-settings-section__desc">Gestiona tus alertas y avisos</p>
        </div>
        <label class="pm-apple-switch" id="btn-toggle-push-main">
          <input type="checkbox" aria-label="Activar notificaciones push" ${subscribed ? 'checked' : ''}>
          <span class="pm-apple-switch-slider"></span>
        </label>
      </div>

      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility w-100" id="btn-abrir-config-notif">
          <i class="bi bi-gear-wide-connected" aria-hidden="true"></i>
          Configurar preferencias...
        </button>
      </div>
      
      ${!supported ? `<p class="apple-caption mt-2" style="color: var(--pm-danger); font-size: 0.7rem;">Push no soportado en este navegador.</p>` : ''}
    </div>
  `;
}

/**
 * Renderiza la sección de Sesión
 */
function _renderSessionSection(container) {
  container.innerHTML = `
    <div class="card-apple pm-settings-section pm-section-danger" role="region" aria-labelledby="section-sesion-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-shield-lock pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 class="pm-settings-section__title" id="section-sesion-title">Seguridad</h3>
          <p class="pm-settings-section__desc">Cerrar sesión en este equipo</p>
        </div>
        <button class="btn-apple-secondary" id="btnCerrarSesion" style="border-color: var(--pm-danger); color: var(--pm-danger);" aria-label="Cerrar sesión">
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

function _updateSaveButtonState() {
  const currentNombre = document.getElementById('perfilNombre')?.value?.trim() || '';
  const currentTelefono = document.getElementById('perfilTelefono')?.value?.trim() || '';
  const currentEspecialidad = document.getElementById('perfilEspecialidad')?.value?.trim() || '';
  const currentDisp = _collectDisponibilidad();
  
  const hasChanges = 
    currentNombre !== initialProfileValues.nombre_completo ||
    currentTelefono !== (initialProfileValues.tlf ?? initialProfileValues.telefono ?? '') ||
    currentEspecialidad !== initialProfileValues.especialidad ||
    JSON.stringify(currentDisp) !== initialProfileValues.disponibilidad;
  
  const btn = document.getElementById('btnGuardarPerfil');
  if (btn) {
    btn.disabled = !hasChanges;
    btn.style.opacity = hasChanges ? '1' : '0.5';
  }
}

function _initThemeSelector() {
  const currentTheme = localStorage.getItem('portal-maestros-theme') || 'system';
  document.querySelectorAll('.pm-theme-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === currentTheme);
  });
}

async function guardarPerfil() {
  const nombre_completo = document.getElementById('perfilNombre').value.trim();
  const telefono = document.getElementById('perfilTelefono').value.trim();
  const especialidad = document.getElementById('perfilEspecialidad').value.trim();
  const disponibilidad = _collectDisponibilidad();

  if (!nombre_completo) {
    mostrarToast('El nombre es obligatorio', 'danger');
    return;
  }

  // Validar formato de teléfono (opcional pero con formato válido si se ingresa)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (telefono && !phoneRegex.test(telefono)) {
    mostrarToast('El formato del teléfono no es válido', 'danger');
    return;
  }

  // Validar disponibilidad: inicio < fin en cada franquicia
  const validacionDisp = _validarDisponibilidad(disponibilidad);
  if (!validacionDisp.valida) {
    mostrarToast(validacionDisp.error, 'danger');
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
      .update({ nombre_completo, tlf: telefono, especialidad, disponibilidad })
      .eq('id', getMaestroLocal().id);

    if (error) throw error;

    const maestroActual = getMaestroLocal();
    const actualizado = {
      ...maestroActual,
      nombre_completo,
      tlf: telefono,
      especialidad,
      disponibilidad: {
        ...(maestroActual.disponibilidad || {}),
        ...disponibilidad
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizado));

    // Actualizar valores iniciales para resetear dirty state
    initialProfileValues = {
      nombre_completo,
      telefono,
      especialidad,
      disponibilidad: JSON.stringify(disponibilidad)
    };
    _updateSaveButtonState();

    mostrarToast('Perfil actualizado', 'success');
  } catch (error) {
    mostrarToast('Error al guardar: ' + error.message, 'danger');
  } finally {
    state.saving = false;
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function _collectDisponibilidad() {
  const disp = {};
  DIAS_SEMANA.forEach(({ key }) => {
    const franjas = [];
    document.querySelectorAll(`[data-dia="${key}"].pm-avail-franja`).forEach(row => {
      const inicio = row.querySelector('[data-field="inicio"]')?.value;
      const fin = row.querySelector('[data-field="fin"]')?.value;
      if (inicio && fin) franjas.push({ inicio, fin });
    });
    disp[key] = franjas;
  });
  return disp;
}

function _validarDisponibilidad(disponibilidad) {
  for (const [dia, franjas] of Object.entries(disponibilidad)) {
    for (let i = 0; i < franjas.length; i++) {
      const f = franjas[i];
      // Validar que inicio < fin
      if (f.inicio >= f.fin) {
        const diaLabel = DIAS_SEMANA.find(d => d.key === dia)?.label || dia;
        return { valida: false, error: `En ${diaLabel}, la hora de inicio debe ser anterior a la hora de fin` };
      }
      // Validar que no haya solapamientos en el mismo día
      for (let j = i + 1; j < franjas.length; j++) {
        const f2 = franjas[j];
        if (f.inicio < f2.fin && f2.inicio < f.fin) {
          const diaLabel = DIAS_SEMANA.find(d => d.key === dia)?.label || dia;
          return { valida: false, error: `En ${diaLabel}, las franjas horarias se solapan` };
        }
      }
    }
  }
  return { valida: true };
}

async function confirmarCerrarSesion() {
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
    onSave: async () => {
      await logoutPortal();
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
  
  // Detectar cambios en campos del perfil (dirty state)
  ['perfilNombre', 'perfilTelefono', 'perfilEspecialidad'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', _updateSaveButtonState);
  });
  
  // Detectar cambios en disponibilidad (delegated)
  document.getElementById('pm-avail-days')?.addEventListener('input', _updateSaveButtonState);
  
  // Cerrar Sesión
  document.getElementById('btnCerrarSesion')?.addEventListener('click', confirmarCerrarSesion);

  // Avatar Edit
  document.getElementById('btnCambiarAvatar')?.addEventListener('click', () => {
    mostrarToast('Cambio de avatar disponible en la próxima versión', 'info');
  });

  // Push toggle principal - con feedback visual durante operación
  const toggleLabel = document.getElementById('btn-toggle-push-main');
  const toggleInput = toggleLabel?.querySelector('input');
  if (toggleLabel && toggleInput) {
    toggleInput.addEventListener('change', async () => {
      const originalChecked = toggleInput.checked;
      // Feedback visual durante carga
      toggleInput.disabled = true;
      toggleLabel.style.opacity = '0.6';
      
      try {
        if (originalChecked) {
          const res = await subscribeToPush();
          if (res.success) {
            mostrarToast('Notificaciones activadas', 'success');
          } else {
            toggleInput.checked = false;
            mostrarToast(res.error || 'Error al activar', 'danger');
          }
        } else {
          const res = await unsubscribeFromPush();
          if (res.success) {
            mostrarToast('Notificaciones desactivadas', 'info');
          } else {
            toggleInput.checked = true;
            mostrarToast('Error al desactivar', 'danger');
          }
        }
      } finally {
        toggleInput.disabled = false;
        toggleLabel.style.opacity = '1';
      }
    });
  }

  // Abrir Modal de Configuración Detallada
  document.getElementById('btn-abrir-config-notif')?.addEventListener('click', () => {
    notifConfigModal.open();
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

  // Disponibilidad: collapse/expand días (acordeón accesible con animación)
  document.querySelectorAll('.pm-avail-dia__header').forEach(btn => {
    btn.addEventListener('click', () => {
      const diaEl = btn.closest('.pm-avail-dia');
      const isOpen = diaEl.classList.contains('open');
      if (isOpen) {
        diaEl.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        diaEl.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Disponibilidad: agregar franja
  document.querySelectorAll('.pm-avail-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const diaKey = btn.dataset.dia;
      const franjasEl = document.getElementById(`pm-avail-franjas-${diaKey}`);
      if (!franjasEl) return;
      const index = franjasEl.querySelectorAll('.pm-avail-franja').length;
      franjasEl.insertAdjacentHTML('beforeend', _renderFranja(diaKey, index, { inicio: '08:00', fin: '12:00' }));
      // Auto-expandir si estaba cerrado
      const diaEl = btn.closest('.pm-avail-dia');
      const bodyId = `pm-avail-body-${diaKey}`;
      diaEl.classList.add('open');
      document.getElementById(bodyId).style.display = 'block';
    });
  });

  // Disponibilidad: eliminar franquicia
  document.addEventListener('click', e => {
    const delBtn = e.target.closest('.pm-avail-franja__del');
    if (!delBtn) return;
    const row = delBtn.closest('.pm-avail-franja');
    if (row) row.remove();
  });

  // Disponibilidad: copiar horario a otro día
  document.querySelectorAll('.pm-avail-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const diaOrigen = btn.dataset.dia;
      const franjasOrigen = _collectDisponibilidad()[diaOrigen] || [];
      
      if (franjasOrigen.length === 0) {
        mostrarToast('Primero agrega franjas en este día', 'info');
        return;
      }

      const opciones = DIAS_SEMANA
        .filter(d => d.key !== diaOrigen)
        .map(d => `<button class="pm-copy-dest-btn" data-dest="${d.key}">${d.label}</button>`)
        .join('');
      
      const popup = document.createElement('div');
      popup.className = 'pm-copy-popup';
      popup.innerHTML = `
        <div class="pm-copy-popup__overlay"></div>
        <div class="pm-copy-popup__content">
          <p class="pm-copy-popup__title">Copiar a:</p>
          <div class="pm-copy-popup__options">${opciones}</div>
        </div>
      `;
      document.body.appendChild(popup);
      
      popup.querySelector('.pm-copy-popup__overlay').addEventListener('click', () => popup.remove());
      popup.querySelectorAll('.pm-copy-dest-btn').forEach(destBtn => {
        destBtn.addEventListener('click', () => {
          const diaDestino = destBtn.dataset.dest;
          const franjasEl = document.getElementById(`pm-avail-franjas-${diaDestino}`);
          if (franjasEl) {
            franjasOrigen.forEach((f, i) => {
              franjasEl.insertAdjacentHTML('beforeend', _renderFranja(diaDestino, franjasEl.children.length, f));
            });
            const diaEl = franjasEl.closest('.pm-avail-dia');
            if (diaEl && !diaEl.classList.contains('open')) {
              diaEl.classList.add('open');
              diaEl.querySelector('.pm-avail-dia__header').setAttribute('aria-expanded', 'true');
            }
            _updateSaveButtonState();
            mostrarToast('Horario copiado a ' + DIAS_SEMANA.find(d => d.key === diaDestino)?.label, 'success');
          }
          popup.remove();
        });
      });
    });
  });
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

/* =====================================================================
   Disponibilidad Horaria
   ===================================================================== */

const DIAS_SEMANA = [
  { key: 'lunes',     label: 'Lunes' },
  { key: 'martes',    label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves' },
  { key: 'viernes',   label: 'Viernes' },
  { key: 'sabado',    label: 'Sábado' },
  { key: 'domingo',   label: 'Domingo' },
];

function _renderAvailabilitySection(container, maestro) {
  const disp = maestro.disponibilidad || {};
  const needsCompletion = !maestro.especialidad || !maestro.disponibilidad ||
    Object.keys(maestro.disponibilidad).length === 0;

  container.innerHTML = `
    <div class="card-apple pm-settings-section ${needsCompletion ? 'pm-section-warning' : ''}" role="region" aria-labelledby="section-disponibilidad-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-calendar-week pm-icon-teal" aria-hidden="true"></i>
        <div>
          <h3 class="pm-settings-section__title" id="section-disponibilidad-title">Disponibilidad Horaria</h3>
          <p class="pm-settings-section__desc">Bloques de horarios por día</p>
        </div>
        ${needsCompletion ? '<span class="pm-badge-warning">Requerido</span>' : ''}
      </div>

      <div id="pm-avail-days" class="pm-avail-days" role="list" aria-label="Disponibilidad por día">
        ${DIAS_SEMANA.map(d => _renderDiaCard(d.key, disp[d.key] || [])).join('')}
      </div>
    </div>
  `;
}

function _renderDiaCard(diaKey, franjas) {
  const dia = DIAS_SEMANA.find(d => d.key === diaKey);
  const hasFranjas = franjas.length > 0;
  const bodyId = `pm-avail-body-${diaKey}`;
  const expanded = hasFranjas ? 'true' : 'false';
  const openClass = hasFranjas ? 'open' : '';
  return `
    <div class="pm-avail-dia ${openClass}" data-dia="${diaKey}" role="listitem">
      <button class="pm-avail-dia__header" data-dia="${diaKey}" 
        aria-expanded="${expanded}" aria-controls="${bodyId}">
        <span class="pm-avail-dia__label">${dia.label}</span>
        <span class="pm-avail-dia__count">${franjas.length} franca${franjas.length !== 1 ? 's' : ''}</span>
        <i class="bi bi-chevron-down pm-avail-dia__arrow" aria-hidden="true"></i>
      </button>
      <div class="pm-avail-dia__body" id="${bodyId}" role="group" aria-label="${dia.label}">
        <div class="pm-avail-franjas" id="pm-avail-franjas-${diaKey}">
          ${franjas.map((f, i) => _renderFranja(diaKey, i, f)).join('')}
        </div>
        <div class="pm-avail-actions">
          <button class="btn-apple-utility btn-apple-sm pm-avail-add-btn" data-dia="${diaKey}" aria-label="Agregar franquicia a ${dia.label}">
            <i class="bi bi-plus-lg" aria-hidden="true"></i> Agregar
          </button>
          <button class="btn-apple-utility btn-apple-sm pm-avail-copy-btn" data-dia="${diaKey}" aria-label="Copiar horario a otro día" title="Copiar a...">
            <i class="bi bi-clipboard-plus" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function _renderFranja(diaKey, index, franja) {
  return `
    <div class="pm-avail-franja" data-dia="${diaKey}" data-index="${index}">
      <input type="time" class="pm-apple-time" value="${franja.inicio || '08:00'}" data-field="inicio">
      <span>a</span>
      <input type="time" class="pm-apple-time" value="${franja.fin || '12:00'}" data-field="fin">
      <button class="pm-avail-franja__del" data-dia="${diaKey}" data-index="${index}">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
}

function _checkPerfilIncompleto(maestro) {
  const needsCompletion = !maestro.especialidad || !maestro.disponibilidad ||
    Object.keys(maestro.disponibilidad || {}).length === 0;
  const banner = document.getElementById('pm-banner-perfil-incompleto');
  if (!banner) return;
  if (needsCompletion) {
    banner.style.display = 'block';
    banner.innerHTML = `
      <div class="pm-profile-alert__inner">
        <i class="bi bi-exclamation-triangle"></i>
        <div>
          <strong>Completa tu perfil</strong>
          <p>Agrega tu especialidad y disponibilidad horaria para acceder a todas las funciones.</p>
        </div>
      </div>
    `;
  } else {
    banner.style.display = 'none';
  }
}

/* =====================================================================
   Estilos de disponibilidad y banner
   ===================================================================== */

const _availStyles = `
  .pm-profile-alert {
    grid-column: 1 / -1;
    padding: 0 0 0.5rem;
  }
  .pm-profile-alert__inner {
    background: rgba(234, 179, 8, 0.12);
    border: 1px solid rgba(234, 179, 8, 0.4);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--pm-warning);
  }
  .pm-profile-alert__inner i { font-size: 1.4rem; flex-shrink: 0; }
  .pm-profile-alert__inner strong { display: block; font-size: 0.9rem; }
  .pm-profile-alert__inner p { margin: 0.15rem 0 0; font-size: 0.78rem; opacity: 0.85; }
  .pm-badge-warning {
    background: rgba(234, 179, 8, 0.15);
    color: var(--pm-warning);
    font-size: 0.68rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 20px;
    letter-spacing: 0.05em;
  }
  .pm-avail-days { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
  .pm-avail-dia { border: 1px solid var(--pm-border); border-radius: 10px; overflow: hidden; }
  .pm-avail-dia__header {
    width: 100%;
    background: var(--pm-surface-2);
    border: none;
    padding: 0.6rem 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--pm-text);
    transition: background 0.15s;
  }
  .pm-avail-dia__header:hover { background: var(--pm-border); }
  .pm-avail-dia__label { font-size: 0.85rem; font-weight: 600; flex: 1; text-align: left; }
  .pm-avail-dia__count { font-size: 0.72rem; color: var(--pm-text-muted); }
  .pm-avail-dia__arrow { font-size: 0.8rem; color: var(--pm-text-muted); transition: transform 0.2s; }
  .pm-avail-dia.open .pm-avail-dia__arrow { transform: rotate(180deg); }
  .pm-avail-dia__body { 
    padding: 0.65rem; 
    background: var(--pm-surface); 
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  }
  .pm-avail-dia.open .pm-avail-dia__body {
    max-height: 500px;
    padding: 0.65rem;
  }
  .pm-avail-franjas { display: flex; flex-direction: column; gap: 0.4rem; }
  .pm-avail-franja {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--pm-surface-2);
    border-radius: 8px;
    padding: 0.4rem 0.6rem;
  }
  .pm-avail-franja span { font-size: 0.75rem; color: var(--pm-text-muted); flex-shrink: 0; }
  .pm-apple-time {
    background: var(--pm-surface);
    border: 1px solid var(--pm-border);
    border-radius: 6px;
    padding: 0.3rem 0.5rem;
    font-size: 0.8rem;
    color: var(--pm-text);
    font-family: inherit;
    color-scheme: light;
  }
  .pm-avail-franja__del {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--pm-text-muted);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 4px;
    transition: color 0.15s;
    flex-shrink: 0;
  }
  .pm-avail-franja__del:hover { color: var(--pm-danger); }
  .pm-avail-add-btn { margin-top: 0.5rem; width: 100%; }
  .pm-avail-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  .pm-avail-actions .pm-avail-add-btn { flex: 1; }
  .pm-avail-actions .pm-avail-copy-btn { flex: 0 0 auto; }
  
  /* Popup de copiar horario */
  .pm-copy-popup { position: fixed; inset: 0; z-index: 9999; }
  .pm-copy-popup__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
  .pm-copy-popup__content { 
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: var(--pm-surface); border-radius: 12px; padding: 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 200px;
  }
  .pm-copy-popup__title { margin: 0 0 0.75rem; font-weight: 600; font-size: 0.9rem; }
  .pm-copy-popup__options { display: flex; flex-direction: column; gap: 0.25rem; }
  .pm-copy-dest-btn { 
    background: var(--pm-surface-2); border: none; padding: 0.5rem 0.75rem; 
    border-radius: 6px; text-align: left; cursor: pointer; color: var(--pm-text);
  }
  .pm-copy-dest-btn:hover { background: var(--pm-border); }
`;

if (!document.getElementById('pm-avail-styles')) {
  const s = document.createElement('style');
  s.id = 'pm-avail-styles';
  s.textContent = _availStyles;
  document.head.appendChild(s);
}
