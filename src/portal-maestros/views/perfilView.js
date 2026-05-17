import { getMaestroLocal, clearMaestroLocal, logoutPortal, STORAGE_KEY } from '../auth/maestroAuth.js';
import { supabase } from '../../lib/supabaseClient.js';
import {
  subscribeToPush, unsubscribeFromPush,
  isPushSupported, isPushSubscribed,
  testNotification
} from '../services/pushService.js';
import { AppModal } from '../../shared/components/AppModal.js';
import { ausenciaModal } from '../components/ausenciaModal.js';
import { notifConfigModal } from '../components/notifConfigModal.js';
import { escHTML, getInitials } from '../utils/portalUtils.js';

// Estado local de la vista
const viewState = {
  dirty: false,
  saving: false,
  theme: localStorage.getItem('portal-maestros-theme') || 'system',
  pushEnabled: false
};

// ─── DIAS SEMANA (para disponibilidad) ─────────────────────────
const DIAS_SEMANA = [
  { key: 'lunes',     label: 'Lunes' },
  { key: 'martes',    label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves' },
  { key: 'viernes',   label: 'Viernes' },
  { key: 'sabado',    label: 'Sábado' },
  { key: 'domingo',   label: 'Domingo' },
];

// ─── RENDER PRINCIPAL ──────────────────────────────────────────
export function renderPerfilView(container) {
  const maestro = getMaestroLocal();
  if (!maestro) {
    container.innerHTML = `
      <div class="pm-settings-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa.</p>
      </div>`;
    return;
  }

  // Inicializar estado con datos reales
  viewState.dirty = false;
  viewState.saving = false;
  isPushSubscribed().then(sub => viewState.pushEnabled = sub);

  container.innerHTML = `
    <div class="pm-settings pm-fade-in" role="main" aria-label="Configuración del perfil">
      <header class="pm-settings-header">
        <h1 class="apple-display-md">Perfil</h1>
        <p class="apple-caption">Gestiona tu cuenta, apariencia y notificaciones</p>
      </header>
      <div class="pm-settings-grid">
        <div id="pm-banner-perfil-incompleto" style="display:none;" class="pm-profile-alert"></div>
        <div class="pm-settings-col" id="col-izquierda"></div>
        <div class="pm-settings-col" id="col-derecha"></div>
      </div>
      <footer class="pm-settings-footer">
        <p>SOI Sistema Operativo Institucional</p>
        <p class="pm-settings-footer__version">v2.5.0 &copy; 2026</p>
      </footer>
    </div>`;

  const colIzq = document.getElementById('col-izquierda');
  const colDer = document.getElementById('col-derecha');

  renderHero(colIzq, maestro);
  renderPersonalData(colIzq, maestro);
  renderAvailability(colIzq, maestro);
  renderAppearance(colDer);
  renderNotifications(colDer, maestro);
  renderAbsences(colDer);
  renderSession(colDer);
  checkPerfilIncompleto(maestro);
  initListeners(maestro);
  animateSections();
}

// ─── SECCIÓN HERO ──────────────────────────────────────────────
function renderHero(container, maestro) {
  const initials = getInitials(maestro.nombre_completo);
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-profile-hero" aria-label="Información del perfil">
      <div class="pm-profile-hero__content">
        <div class="pm-settings-avatar">
          ${maestro.avatar_url 
            ? `<img src="${escHTML(maestro.avatar_url)}" alt="Avatar" class="pm-settings-avatar__img">`
            : `<div class="pm-settings-avatar__placeholder" aria-hidden="true">${escHTML(initials)}</div>`
          }
          <button class="pm-settings-avatar__edit" id="btnCambiarAvatar" title="Cambiar foto" aria-label="Cambiar foto de perfil">
            <i class="bi bi-camera" aria-hidden="true"></i>
          </button>
        </div>
        <div class="pm-profile-hero__info">
          <h2 class="pm-profile-hero__name">${escHTML(maestro.nombre_completo)}</h2>
          <p class="pm-profile-hero__email">${escHTML(maestro.email)}</p>
          ${maestro.especialidad ? `
            <span class="chip-apple active" aria-label="Especialidad: ${escHTML(maestro.especialidad)}">
              <i class="bi bi-mortarboard" aria-hidden="true"></i> ${escHTML(maestro.especialidad)}
            </span>` : ''}
        </div>
      </div>
    </section>`);
}

// ─── SECCIÓN DATOS PERSONALES ────────────────────────────────
function renderPersonalData(container, maestro) {
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-settings-section" aria-labelledby="datos-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-person-circle pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 id="datos-title" class="pm-settings-section__title">Datos Personales</h3>
          <p class="pm-settings-section__desc">Información básica de tu cuenta</p>
        </div>
      </div>
      <div class="pm-settings-form-grid">
        <div class="pm-settings-field">
          <label for="perfilNombre" class="apple-caption">Nombre Completo</label>
          <input type="text" class="input-apple" id="perfilNombre" value="${escHTML(maestro.nombre_completo)}" placeholder="Tu nombre">
        </div>
        <div class="pm-settings-field">
          <label for="perfilTelefono" class="apple-caption">Teléfono</label>
          <input type="tel" class="input-apple" id="perfilTelefono" value="${escHTML(maestro.tlf || maestro.telefono || '')}" placeholder="809-000-0000" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
        </div>
        <div class="pm-settings-field">
          <label for="perfilEspecialidad" class="apple-caption">Especialidad</label>
          <input type="text" class="input-apple" id="perfilEspecialidad" value="${escHTML(maestro.especialidad || '')}" placeholder="Ej. Violín">
        </div>
      </div>
      <div class="pm-settings-actions">
        <button class="btn-apple-primary" id="btnGuardarPerfil" disabled>
          <i class="bi bi-check2" aria-hidden="true"></i>
          <span>Guardar Cambios</span>
        </button>
      </div>
    </section>`);
}

// ─── SECCIÓN APARIENCIA (TEMA) ────────────────────────────────
function renderAppearance(container) {
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-settings-section" aria-labelledby="apariencia-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-palette pm-icon-amber" aria-hidden="true"></i>
        <div>
          <h3 id="apariencia-title" class="pm-settings-section__title">Apariencia</h3>
          <p class="pm-settings-section__desc">Personaliza el tema visual</p>
        </div>
      </div>
      <div class="pm-theme-picker" role="radiogroup" aria-label="Seleccionar tema">
        <button class="pm-theme-opt" data-theme="light" id="pm-theme-light" role="radio" aria-checked="false">
          <div class="pm-theme-preview light"></div><span>Claro</span>
        </button>
        <button class="pm-theme-opt" data-theme="dark" id="pm-theme-dark" role="radio" aria-checked="false">
          <div class="pm-theme-preview dark"></div><span>Oscuro</span>
        </button>
        <button class="pm-theme-opt" data-theme="system" id="pm-theme-system" role="radio" aria-checked="false">
          <div class="pm-theme-preview system"></div><span>Auto</span>
        </button>
      </div>
    </section>`);
}

// ─── SECCIÓN NOTIFICACIONES ──────────────────────────────────
function renderNotifications(container, maestro) {
  const supported = isPushSupported();
  const subBadge = supported
    ? `<span class="pm-badge-sub" id="pm-notif-sub-badge">${viewState.pushEnabled ? '✅ Suscripción activa' : '⏸ Pausada'}</span>`
    : '';
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-settings-section" aria-labelledby="notif-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-bell pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 id="notif-title" class="pm-settings-section__title">Notificaciones</h3>
          <p class="pm-settings-section__desc">Gestiona tus alertas y avisos</p>
        </div>
        <label class="pm-apple-switch" id="btn-toggle-push-main" aria-label="Activar notificaciones push">
          <input type="checkbox" ${viewState.pushEnabled ? 'checked' : ''}>
          <span class="pm-apple-switch-slider"></span>
        </label>
      </div>
      ${subBadge}
      <div class="pm-settings-actions-row" style="margin-top:0.5rem;">
        <button class="btn-apple-utility w-100" id="btn-abrir-config-notif">
          <i class="bi bi-gear-wide-connected" aria-hidden="true"></i> Configurar preferencias...
        </button>
      </div>
      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility" id="btn-probar-notificacion">
          <i class="bi bi-send"></i> Probar notificación
        </button>
      </div>
      ${!supported ? `<p class="apple-caption mt-2" style="color:var(--pm-danger)">Push no soportado en este navegador.</p>` : ''}
    </section>`);
}

// ─── SECCIÓN AUSENCIAS ───────────────────────────────────────
function renderAbsences(container) {
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-settings-section" aria-labelledby="ausencias-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-calendar-event pm-icon-teal" aria-hidden="true"></i>
        <div>
          <h3 id="ausencias-title" class="pm-settings-section__title">Ausencias</h3>
          <p class="pm-settings-section__desc">Gestiona tus permisos</p>
        </div>
      </div>
      <div class="pm-settings-actions-row">
        <button class="btn-apple-utility" id="pm-btn-ver-ausencias"><i class="bi bi-clock-history" aria-hidden="true"></i> Historial</button>
        <button class="btn-apple-utility" id="pm-btn-solicitar-ausencia"><i class="bi bi-plus-lg" aria-hidden="true"></i> Solicitar</button>
      </div>
    </section>`);
}

// ─── SECCIÓN SESIÓN ──────────────────────────────────────────
function renderSession(container) {
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-settings-section pm-section-danger" aria-labelledby="sesion-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-shield-lock pm-icon-red" aria-hidden="true"></i>
        <div>
          <h3 id="sesion-title" class="pm-settings-section__title">Seguridad</h3>
          <p class="pm-settings-section__desc">Cerrar sesión en este equipo</p>
        </div>
        <button class="btn-apple-secondary" id="btnCerrarSesion" style="border-color:var(--pm-danger);color:var(--pm-danger)">Salir</button>
      </div>
    </section>`);
}

// ─── DISPONIBILIDAD HORARIA (ACCORDION MEJORADO) ──────────────
function renderAvailability(container, maestro) {
  const disp = maestro.disponibilidad || {};
  const needsCompletion = !maestro.especialidad || !maestro.disponibilidad || Object.keys(maestro.disponibilidad).length === 0;
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-settings-section ${needsCompletion ? 'pm-section-warning' : ''}" aria-labelledby="disp-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-calendar-week pm-icon-teal" aria-hidden="true"></i>
        <div>
          <h3 id="disp-title" class="pm-settings-section__title">Disponibilidad Horaria</h3>
          <p class="pm-settings-section__desc">Bloques de horarios por día</p>
        </div>
        ${needsCompletion ? '<span class="pm-badge-warning">Requerido</span>' : ''}
      </div>
      <div id="pm-avail-days" class="pm-avail-days" role="list">
        ${DIAS_SEMANA.map(d => renderDayCard(d.key, disp[d.key] || [], d.label)).join('')}
      </div>
    </section>`);
}

function renderDayCard(diaKey, franjas, label) {
  const hasFranjas = franjas.length > 0;
  return `
    <div class="pm-avail-dia" data-dia="${diaKey}" role="listitem">
      <button class="pm-avail-dia__header" aria-expanded="${hasFranjas ? 'true' : 'false'}" aria-controls="pm-avail-body-${diaKey}" data-dia="${diaKey}">
        <span class="pm-avail-dia__label">${label}</span>
        <span class="pm-avail-dia__count">${franjas.length} franja${franjas.length !== 1 ? 's' : ''}</span>
        <i class="bi bi-chevron-down pm-avail-dia__arrow" aria-hidden="true"></i>
      </button>
      <div class="pm-avail-dia__body" id="pm-avail-body-${diaKey}" style="display:${hasFranjas ? 'block' : 'none'}">
        <div class="pm-avail-franjas" id="pm-avail-franjas-${diaKey}">
          ${franjas.map((f, i) => renderSlot(diaKey, i, f)).join('')}
        </div>
        <button class="btn-apple-utility btn-apple-sm pm-avail-add-btn" data-dia="${diaKey}">
          <i class="bi bi-plus-lg" aria-hidden="true"></i> Agregar franja
        </button>
      </div>
    </div>`;
}

function renderSlot(diaKey, index, franja) {
  return `
    <div class="pm-avail-franja" data-dia="${diaKey}" data-index="${index}">
      <input type="time" class="pm-apple-time" value="${franja.inicio || '08:00'}" data-field="inicio" aria-label="Hora inicio">
      <span>a</span>
      <input type="time" class="pm-apple-time" value="${franja.fin || '12:00'}" data-field="fin" aria-label="Hora fin">
      <button class="pm-avail-franja__del" aria-label="Eliminar franja"><i class="bi bi-trash" aria-hidden="true"></i></button>
    </div>`;
}

// ─── FUNCIONES DE INTERACCIÓN ─────────────────────────────────
function initListeners(maestro) {
  // Detectar cambios para habilitar botón de guardar
  const formInputs = document.querySelectorAll('#perfilNombre, #perfilTelefono, #perfilEspecialidad, .pm-apple-time');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      viewState.dirty = true;
      const btn = document.getElementById('btnGuardarPerfil');
      if (btn) btn.disabled = false;
    });
  });

  // Guardar perfil
  document.getElementById('btnGuardarPerfil')?.addEventListener('click', () => guardarPerfil(maestro));

  // Cerrar sesión
  document.getElementById('btnCerrarSesion')?.addEventListener('click', confirmarCerrarSesion);

  // Avatar (placeholder)
  document.getElementById('btnCambiarAvatar')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Cambio de avatar disponible próximamente', type: 'info' } }));
  });

  // Notificaciones push
  const toggleInput = document.querySelector('#btn-toggle-push-main input');
  toggleInput?.addEventListener('change', async (e) => {
    toggleInput.disabled = true;
    if (toggleInput.checked) {
      const res = await subscribeToPush();
      if (res.success) {
        viewState.pushEnabled = true;
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Notificaciones activadas', type: 'success' } }));
      } else {
        toggleInput.checked = false;
        viewState.pushEnabled = false;
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: res.error || 'Error al activar', type: 'danger' } }));
      }
    } else {
      const res = await unsubscribeFromPush();
      viewState.pushEnabled = false;
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Notificaciones desactivadas', type: 'info' } }));
    }
    toggleInput.disabled = false;
    // Update subscription badge
    const badge = document.getElementById('pm-notif-sub-badge');
    if (badge) badge.textContent = viewState.pushEnabled ? '✅ Suscripción activa' : '⏸ Pausada';
  });

  // Configuración detallada notificaciones
  document.getElementById('btn-abrir-config-notif')?.addEventListener('click', () => notifConfigModal.open());

  // Botón probar notificación
  document.getElementById('btn-probar-notificacion')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-probar-notificacion');
    btn.disabled = true;
    btn.innerHTML = '<span class="pm-settings-spinner"></span> Enviando...';
    const result = await testNotification();
    if (result.success) {
      btn.innerHTML = '<i class="bi bi-check2"></i> Notificación enviada';
      setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-send"></i> Probar notificación';
        btn.disabled = false;
      }, 2000);
    } else {
      btn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Error';
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: result.error || 'No se pudo enviar notificación de prueba. Verifica los permisos.', type: 'danger' }
      }));
      setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-send"></i> Probar notificación';
        btn.disabled = false;
      }, 2000);
    }
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

  // Acordeón de disponibilidad
  document.querySelectorAll('.pm-avail-dia__header').forEach(btn => {
    btn.addEventListener('click', () => {
      const diaKey = btn.dataset.dia;
      const body = document.getElementById(`pm-avail-body-${diaKey}`);
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      body.style.display = expanded ? 'none' : 'block';
    });
  });

  // Agregar franja
  document.querySelectorAll('.pm-avail-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const diaKey = btn.dataset.dia;
      const franjasEl = document.getElementById(`pm-avail-franjas-${diaKey}`);
      const index = franjasEl.querySelectorAll('.pm-avail-franja').length;
      franjasEl.insertAdjacentHTML('beforeend', renderSlot(diaKey, index, { inicio: '08:00', fin: '12:00' }));
      document.getElementById(`pm-avail-body-${diaKey}`).style.display = 'block';
      const header = document.querySelector(`.pm-avail-dia__header[data-dia="${diaKey}"]`);
      header.setAttribute('aria-expanded', 'true');
      viewState.dirty = true;
      document.getElementById('btnGuardarPerfil').disabled = false;
    });
  });

  // Eliminar franja
  document.addEventListener('click', e => {
    const delBtn = e.target.closest('.pm-avail-franja__del');
    if (delBtn) {
      delBtn.closest('.pm-avail-franja').remove();
      viewState.dirty = true;
      document.getElementById('btnGuardarPerfil').disabled = false;
    }
  });
}

// ─── GUARDAR PERFIL ──────────────────────────────────────────
async function guardarPerfil(maestroOriginal) {
  const nombre = document.getElementById('perfilNombre').value.trim();
  const telefono = document.getElementById('perfilTelefono').value.trim();
  const especialidad = document.getElementById('perfilEspecialidad').value.trim();
  const disponibilidad = collectDisponibilidad();

  if (!nombre) {
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'El nombre es obligatorio', type: 'danger' } }));
    return;
  }

  viewState.saving = true;
  const btn = document.getElementById('btnGuardarPerfil');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="pm-settings-spinner"></span><span>Guardando...</span>`;

  try {
    const { error } = await supabase
      .from('maestros')
      .update({ 
        nombre_completo: nombre, 
        tlf: telefono, 
        especialidad, 
        disponibilidad 
      })
      .eq('id', maestroOriginal.id);

    if (error) throw error;

    // Fusión segura del objeto maestro en localStorage
    const actualizado = {
      ...maestroOriginal,
      nombre_completo: nombre,
      nombre: nombre,
      telefono: telefono,
      tlf: telefono,
      especialidad,
      disponibilidad
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizado));

    viewState.dirty = false;
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Perfil actualizado', type: 'success' } }));
  } catch (error) {
    window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Error al guardar: ' + error.message, type: 'danger' } }));
  } finally {
    viewState.saving = false;
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function collectDisponibilidad() {
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

// ─── CERRAR SESIÓN ──────────────────────────────────────────
function confirmarCerrarSesion() {
  AppModal.open({
    title: '¿Cerrar Sesión?',
    size: 'sm',
    body: `
      <div style="text-align:center; padding:1rem 0;">
        <i class="bi bi-box-arrow-right" style="font-size:2.5rem;color:var(--pm-danger);opacity:0.8;"></i>
        <p style="margin-top:1rem;">¿Estás seguro que quieres salir?</p>
      </div>`,
    saveText: 'Salir',
    cancelText: 'Cancelar',
    onSave: async () => {
      await logoutPortal();
      window.location.reload();
      return true;
    }
  });
}

// ─── TEMA ────────────────────────────────────────────────────
function applyTheme(theme) {
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.setAttribute('data-bs-theme', resolved);
  document.documentElement.setAttribute('data-portal-theme', resolved);
  document.documentElement.classList.toggle('pm-dark', resolved === 'dark');
  document.querySelectorAll('.pm-theme-opt').forEach(opt => {
    opt.setAttribute('aria-checked', opt.dataset.theme === theme ? 'true' : 'false');
    opt.classList.toggle('active', opt.dataset.theme === theme);
  });
  localStorage.setItem('portal-maestros-theme', theme);
  viewState.theme = theme;
}

// ─── PERFIL INCOMPLETO ──────────────────────────────────────
function checkPerfilIncompleto(maestro) {
  const needsCompletion = !maestro.especialidad || !maestro.disponibilidad || Object.keys(maestro.disponibilidad || {}).length === 0;
  const banner = document.getElementById('pm-banner-perfil-incompleto');
  if (!banner) return;
  if (needsCompletion) {
    banner.style.display = 'block';
    banner.innerHTML = `
      <div class="pm-profile-alert__inner">
        <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        <div><strong>Completa tu perfil</strong><p>Agrega tu especialidad y disponibilidad horaria.</p></div>
      </div>`;
  } else {
    banner.style.display = 'none';
  }
}

// ─── ANIMACIONES ────────────────────────────────────────────
function animateSections() {
  const sections = document.querySelectorAll('.card-apple');
  sections.forEach((sec, i) => {
    sec.style.opacity = '0';
    sec.style.transform = 'translateY(12px)';
    setTimeout(() => {
      sec.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      sec.style.opacity = '1';
      sec.style.transform = 'translateY(0)';
    }, 50 * i);
  });
}

// ─── ESTILOS ──
const styles = `
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
  .pm-badge-sub {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 12px;
    background: var(--pm-primary-light, rgba(59,130,246,0.12));
    color: var(--pm-primary, #3b82f6);
    margin: 0.25rem 0 0 0;
  }
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
  s.textContent = styles;
  document.head.appendChild(s);
}
