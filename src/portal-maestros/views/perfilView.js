import { getMaestroLocal, clearMaestroLocal, logoutPortal, STORAGE_KEY } from '../auth/maestroAuth.js';
import { APP_VERSION, APP_BUILD_DATE, getLatestVersion, getVersionTypeMeta } from '../../core/version/CHANGELOG.js';
import { supabase } from '../../lib/supabaseClient.js';
import { updateDisponibilidad } from '../api/disponibilidadApi.js';
import {
  subscribeToPush, unsubscribeFromPush,
  isPushSupported, isPushSubscribed,
  testNotification
} from '../services/pushService.js';
import { AppModal } from '../../shared/components/AppModal.js';
import { ausenciaModal } from '../components/ausenciaModal.js';
import { notifConfigModal } from '../components/notifConfigModal.js';
import { escHTML, getInitials } from '../utils/portalUtils.js';
import { normalizePhone } from '../../shared/utils/phoneUtils.js';
import { pushDiagnostic } from '../components/pushDiagnostic.js';

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
  { key: 'miércoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves' },
  { key: 'viernes',   label: 'Viernes' },
  { key: 'sábado',    label: 'Sábado' },
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
  
  // Cargar preferencias para sincronizar el switch push_activo
  import('../services/pushService.js').then(async (push) => {
    const prefs = await push.getNotificationPreferences();
    viewState.pushEnabled = prefs.push_activo;
    
    // Si la vista ya se renderizó, sincronizar el switch
    const toggle = document.querySelector('#btn-toggle-push-main input');
    if (toggle) toggle.checked = viewState.pushEnabled;
    
    const badge = document.getElementById('pm-notif-sub-badge');
    if (badge) badge.textContent = viewState.pushEnabled ? '✅ Suscripción activa' : '⏸ Pausada';
  });

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
        <p class="pm-settings-footer__version">
          v${APP_VERSION} &copy; 2026
          ${(maestro?.es_admin || import.meta.env.DEV) ? `<button id="pm-ver-sistema-btn" style="
            margin-left:0.5rem;background:none;border:none;cursor:pointer;
            color:var(--pm-primary,#3b82f6);font-size:0.72rem;font-weight:600;
            padding:0.1rem 0.4rem;border-radius:6px;text-decoration:underline;
          ">Ver historial del sistema</button>` : ''}
        </p>
      </footer>
    </div>`;

  const colIzq = document.getElementById('col-izquierda');
  const colDer = document.getElementById('col-derecha');

  renderHero(colIzq, maestro);
  renderPersonalData(colIzq, maestro);
  // [OCULTO] Sección "Disponibilidad Horaria" — descomentar para reactivar.
  // renderAvailability(colIzq, maestro);
  renderAppearance(colDer);
  renderNotifications(colDer, maestro);
  renderAbsences(colDer);
  renderSolicitudesNecesidades(colDer, maestro);

  // Contenedor dinámico de colaboración
  colDer.insertAdjacentHTML('beforeend', `<div id="pm-collaboration-container"></div>`);


  renderInstallApp(colDer);
  renderSession(colDer);
  checkPerfilIncompleto(maestro);
  initListeners(maestro);
  animateSections();

  // Carga asíncrona de permisos de colaboración
  import('../services/permisoService.js').then(async ({ getPermisos, solicitarPermiso }) => {
    try {
      const perm = await getPermisos(maestro.id);
      const collabContainer = document.getElementById('pm-collaboration-container');
      if (collabContainer) {
        // [OCULTO] Sección "Colaboración de Inscripción" — descomentar para reactivar.
        // renderCollaborationPermissions(collabContainer, perm, maestro.id, solicitarPermiso);
      }

    } catch (err) {
      console.warn('[PerfilView] Error cargando permisos de colaboración:', err.message);
    }
  });
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
    ? `<span class="pm-badge-sub" id="pm-notif-sub-badge" aria-live="polite" aria-atomic="true">${viewState.pushEnabled ? '✅ Suscripción activa' : '⏸ Pausada'}</span>`
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
        <button class="btn-apple-utility" id="btn-push-diagnostic">
          <i class="bi bi-broadcast"></i> Diagnosticar
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

// ─── SECCIÓN SOLICITUDES DE NECESIDADES ─────────────────────
function renderSolicitudesNecesidades(container, maestro) {
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-settings-section" aria-labelledby="solicitudes-title" id="pm-solicitudes-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-envelope-paper pm-icon-blue" aria-hidden="true"></i>
        <div style="flex-grow: 1;">
          <h3 id="solicitudes-title" class="pm-settings-section__title">Necesidades</h3>
          <p class="pm-settings-section__desc">Materiales y pedagógicas</p>
        </div>
        <button class="btn-apple-secondary btn-apple-sm" id="btn-nueva-necesidad">
          <i class="bi bi-plus-lg" aria-hidden="true"></i> Solicitar
        </button>
      </div>

      <div id="sol-historial" class="mt-3">
        <div class="text-center text-muted py-2" style="font-size:0.85rem;">
          <span class="spinner-border spinner-border-sm me-1"></span>Cargando...
        </div>
      </div>
    </section>`);

  _initSolicitudesSection(maestro);
}

async function _initSolicitudesSection(maestro) {
  await _loadSolicitudesHistorial(maestro.id);

  document.getElementById('btn-nueva-necesidad')?.addEventListener('click', () => {
    openNuevaSolicitudModal(maestro);
  });
}

function openNuevaSolicitudModal(maestro) {
  AppModal.open({
    title: 'Nueva Solicitud',
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <form id="form-sol-necesidad" novalidate>
        <div class="row g-3">
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-semibold text-muted mb-1">Tipo *</label>
            <select class="form-select input-apple" id="sol-tipo" required>
              <option value="">Seleccioná el tipo</option>
              <option value="material">Material</option>
              <option value="pedagogico">Pedagógico</option>
              <option value="tecnico">Técnico</option>
              <option value="institucional">Institucional</option>
            </select>
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-semibold text-muted mb-1">Categoría</label>
            <select class="form-select input-apple" id="sol-categoria">
              <option value="">— sin categoría —</option>
              <option value="cuerdas">Cuerdas</option>
              <option value="cañas">Cañas</option>
              <option value="resinas">Resinas</option>
              <option value="atriles">Atriles</option>
              <option value="metodos">Métodos</option>
              <option value="partituras">Partituras</option>
              <option value="reparacion">Reparación de instrumentos</option>
              <option value="taller">Taller específico</option>
              <option value="capacitacion">Capacitación</option>
              <option value="apoyo_pedagogico">Apoyo pedagógico</option>
              <option value="material_aula">Material de aula</option>
              <option value="salon">Necesidades de salón</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold text-muted mb-1">Título *</label>
            <input type="text" class="form-control input-apple" id="sol-titulo"
                   placeholder="Ej: Cuerdas para violines de iniciación" required maxlength="120">
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-semibold text-muted mb-1">Área / Instrumento</label>
            <input type="text" class="form-control input-apple" id="sol-area" placeholder="Ej: Violín">
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label small fw-semibold text-muted mb-1">Cantidad</label>
            <input type="number" class="form-control input-apple" id="sol-cantidad" min="1" placeholder="10">
          </div>
          <div class="col-6 col-sm-3">
            <label class="form-label small fw-semibold text-muted mb-1">Prioridad *</label>
            <select class="form-select input-apple" id="sol-prioridad" required>
              <option value="baja">Baja</option>
              <option value="media" selected>Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold text-muted mb-1">Descripción *</label>
            <textarea class="form-control input-apple" id="sol-descripcion" rows="3"
                      placeholder="Describí la necesidad con detalle..." required maxlength="800"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label small fw-semibold text-muted mb-1">Observaciones adicionales</label>
            <textarea class="form-control input-apple" id="sol-observaciones" rows="2"
                      placeholder="Preferencias, especificaciones, etc." maxlength="400"></textarea>
          </div>
          <div class="col-12 d-flex align-items-center gap-3 mt-4 pt-3 border-top">
            <button type="submit" class="btn-apple-primary flex-grow-1" id="btn-sol-submit">
              <i class="bi bi-send me-1" aria-hidden="true"></i>Enviar Solicitud
            </button>
            <span id="sol-status" class="small text-muted" style="display:none; flex-grow:1; text-align:right;"></span>
          </div>
        </div>
      </form>
    `,
    onOpen: (modalBody) => {
      const form = modalBody.querySelector('#form-sol-necesidad');
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo        = modalBody.querySelector('#sol-tipo')?.value?.trim();
        const titulo      = modalBody.querySelector('#sol-titulo')?.value?.trim();
        const descripcion = modalBody.querySelector('#sol-descripcion')?.value?.trim();
        const prioridad   = modalBody.querySelector('#sol-prioridad')?.value || 'media';

        // Validación inline
        if (!tipo || !titulo || !descripcion) {
          [{ id: '#sol-tipo', v: tipo }, { id: '#sol-titulo', v: titulo }, { id: '#sol-descripcion', v: descripcion }]
            .forEach(({ id, v }) => modalBody.querySelector(id)?.classList.toggle('is-invalid', !v));
          return;
        }

        const btn    = modalBody.querySelector('#btn-sol-submit');
        const status = modalBody.querySelector('#sol-status');
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Enviando...'; }
        if (status) { status.style.display = 'none'; }

        try {
          const { error } = await supabase.from('solicitudes_necesidades').insert({
            maestro_id:     maestro.id,
            maestro_nombre: maestro.nombre_completo || maestro.nombre || '',
            tipo_necesidad: tipo,
            categoria:      modalBody.querySelector('#sol-categoria')?.value || null,
            titulo,
            descripcion,
            prioridad,
            cantidad:       parseInt(modalBody.querySelector('#sol-cantidad')?.value) || null,
            area:           modalBody.querySelector('#sol-area')?.value?.trim()           || null,
            observaciones:  modalBody.querySelector('#sol-observaciones')?.value?.trim()  || null,
            estado:         'pendiente',
            fecha_solicitud: new Date().toISOString().split('T')[0],
          });
          if (error) throw error;

          if (status) { status.textContent = '✓ Solicitud enviada correctamente'; status.className = 'small text-success'; status.style.display = 'block'; }
          
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: { message: 'Solicitud enviada correctamente', type: 'success' }
          }));
          
          await _loadSolicitudesHistorial(maestro.id);
          
          setTimeout(() => {
            AppModal.close();
          }, 1000);
          
        } catch (err) {
          console.error('[solicitudes]', err);
          if (status) { status.textContent = 'Error al enviar. Intentá de nuevo.'; status.className = 'small text-danger'; status.style.display = 'block'; }
        } finally {
          if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-send me-1"></i>Enviar solicitud'; }
        }
      });
    }
  });
}

async function _loadSolicitudesHistorial(maestroId) {
  const historial = document.getElementById('sol-historial');
  if (!historial) return;

  try {
    const { data, error } = await supabase
      .from('solicitudes_necesidades')
      .select('*')
      .eq('maestro_id', maestroId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;

    if (!data || data.length === 0) {
      historial.innerHTML = '<p class="text-muted small fst-italic mb-0">No tenés solicitudes anteriores.</p>';
      return;
    }

    const estadoClass = { pendiente: 'bg-warning-subtle text-warning-emphasis', en_revision: 'bg-info-subtle text-info-emphasis', aprobada: 'bg-success-subtle text-success-emphasis', rechazada: 'bg-danger-subtle text-danger-emphasis', resuelta: 'bg-secondary-subtle text-secondary-emphasis' };
    const prioClass   = { urgente: 'text-danger', alta: 'text-warning', media: 'text-primary', baja: 'text-secondary' };

    historial.innerHTML = data.map(s => `
      <div class="card border-0 shadow-sm mb-2">
        <div class="card-body py-2 px-3">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div class="flex-grow-1 overflow-hidden">
              <div class="fw-semibold small text-truncate">${escHTML(s.titulo)}</div>
              <div class="text-muted" style="font-size:0.72rem;">
                ${escHTML(s.tipo_necesidad)} · ${escHTML(s.fecha_solicitud || '—')} ·
                <span class="${prioClass[s.prioridad] || 'text-secondary'}">${escHTML(s.prioridad)}</span>
              </div>
            </div>
            <span class="badge flex-shrink-0 ${estadoClass[s.estado] || 'bg-secondary-subtle text-secondary-emphasis'}">${escHTML((s.estado || '').replace('_', ' '))}</span>
          </div>
          ${s.respuesta_admin ? `
            <div class="border-start border-2 border-primary ps-2 mt-2">
              <div class="text-muted" style="font-size:0.72rem;font-weight:600;">Respuesta admin:</div>
              <div class="small">${escHTML(s.respuesta_admin)}</div>
            </div>` : ''}
        </div>
      </div>`).join('');
  } catch (err) {
    console.error('[historial sol]', err);
    if (historial) historial.innerHTML = '<p class="text-danger small mb-0">Error al cargar el historial.</p>';
  }
}

// ─── SECCIÓN INSTALAR APP ────────────────────────────────────
function renderInstallApp(container) {
  container.insertAdjacentHTML('beforeend', `
    <section class="card-apple pm-settings-section" aria-labelledby="install-title" id="pm-install-section">
      <div class="pm-settings-section__header">
        <i class="bi bi-phone-fill pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 id="install-title" class="pm-settings-section__title">Instalar App</h3>
          <p class="pm-settings-section__desc">Acceso rápido desde tu dispositivo</p>
        </div>
      </div>
      <div id="pm-install-body">
        <p style="font-size:0.82rem;color:var(--pm-text-muted);margin:0 0 0.75rem;">
          Instalá el portal como aplicación nativa para usarlo sin navegador, con acceso offline y notificaciones push.
        </p>
        <div class="pm-settings-actions-row">
          <button class="btn-apple-primary w-100" id="pm-btn-install-profile" style="gap:0.5rem;">
            <i class="bi bi-download"></i> Instalar en este dispositivo
          </button>
        </div>
        <p id="pm-install-note" class="pm-install-note" style="display:none;"></p>
      </div>
    </section>`);

  // Lógica del botón
  const btn = document.getElementById('pm-btn-install-profile');
  const note = document.getElementById('pm-install-note');

  const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || localStorage.getItem('pwa-installed') === 'true';

  if (isInstalled) {
    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> App ya instalada';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    return;
  }

  btn?.addEventListener('click', () => {
    if (window.pwaInstaller) {
      window.pwaInstaller.promptInstall();
    } else {
      note.style.display = 'block';
      note.innerHTML = `
        <strong>Instalación manual:</strong><br>
        • <b>Chrome/Edge (Android/PC):</b> Menú ⋮ → "Instalar app"<br>
        • <b>Safari (iPhone/iPad):</b> Compartir <i class="bi bi-box-arrow-up"></i> → "Añadir a pantalla inicio"<br>
        • <b>Firefox:</b> no admite PWA nativa.`;
    }
  });

  // Si el prompt nativo no está disponible, mostrar fallback desde el inicio
  window.addEventListener('beforeinstallprompt', () => {
    if (btn) btn.disabled = false;
  }, { once: true });
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

// ─── COLABORACIÓN DE PERMISOS ─────────────────────────────────
function renderCollaborationPermissions(container, perm, maestroId, solicitarPermisoFn) {
  // Usar solicitud_actual si existe (new system), fallback a array checking
  const solicitud_actual = perm?.solicitud_actual;
  const es_solicitud_alumnos = solicitud_actual?.solicita_alumnos || false;
  const es_solicitud_clases = solicitud_actual?.solicita_clases || false;
  const estado_solicitud = solicitud_actual?.estado || null; // 'pendiente', 'aprobado', 'rechazado'

  const items = [
    {
      key: 'alumnos:create',
      title: 'Registrar Alumnos',
      desc: 'Dar de alta estudiantes para preparar su inscripción y seguimiento académico.',
      icon: 'bi-person-plus',
      iconClass: 'pm-icon-blue',
      active: perm.puede_registrar_alumnos,
      pending: es_solicitud_alumnos && estado_solicitud === 'pendiente',
      pending_alumnos: true
    },
    {
      key: 'clases:enroll',
      title: 'Crear y Gestionar Clases',
      desc: 'Crear clases, inscribir alumnos y mantener la secuencia operativa del grupo.',
      icon: 'bi-journal-bookmark',
      iconClass: 'pm-icon-teal',
      active: perm.puede_inscribir_clases,
      pending: es_solicitud_clases && estado_solicitud === 'pendiente',
      pending_clases: true
    }
  ];

  container.innerHTML = `
    <section class="card-apple pm-settings-section" aria-labelledby="collab-title">
      <div class="pm-settings-section__header">
        <i class="bi bi-shield-check pm-icon-blue" aria-hidden="true"></i>
        <div>
          <h3 id="collab-title" class="pm-settings-section__title">Colaboración de Inscripción</h3>
          <p class="pm-settings-section__desc">Solicitá permisos especiales para coadyuvar en la matrícula</p>
        </div>
      </div>
      <div class="pm-collab-cards">
        ${items.map(item => {
          let badgeHtml = '';
          let actionHtml = '';

          if (item.active) {
            badgeHtml = `<span class="pm-collab-badge active"><i class="bi bi-patch-check-fill"></i> Concedido</span>`;
            // Show action button based on permission type
            if (item.key === 'alumnos:create') {
              actionHtml = `
                <button class="btn-apple-primary btn-apple-sm w-100 pm-collab-action-btn" data-route="registrar-alumno"
                  style="padding: 0.45rem 0.9rem; font-size: 0.8rem; display:flex; align-items:center; justify-content:center; gap:0.4rem;">
                  <i class="bi bi-person-plus-fill"></i> Registrar Alumno
                </button>`;
            } else if (item.key === 'clases:enroll') {
              actionHtml = `
                <button class="btn-apple-primary btn-apple-sm w-100 pm-collab-action-btn" data-route="gestionar-clases"
                  style="padding: 0.45rem 0.9rem; font-size: 0.8rem; display:flex; align-items:center; justify-content:center; gap:0.4rem; background: linear-gradient(135deg, #0d9488, #0891b2);">
                  <i class="bi bi-mortarboard-fill"></i> Crear / Gestionar Clases
                </button>`;
            } else {
              actionHtml = `<p class="pm-collab-help-text">Permiso activo.</p>`;
            }
          } else if (item.pending) {
            badgeHtml = `<span class="pm-collab-badge pending"><i class="bi bi-clock-history"></i> Pendiente</span>`;
            actionHtml = `<p class="pm-collab-help-text">Tu solicitud está siendo revisada por la administración.</p>`;
          } else {
            badgeHtml = `<span class="pm-collab-badge inactive"><i class="bi bi-slash-circle"></i> Inactivo</span>`;
            actionHtml = `
              <button class="btn-apple-primary btn-apple-sm w-100 pm-collab-request-btn" data-key="${item.key}" style="padding: 0.4rem 0.75rem; font-size: 0.75rem;">
                <i class="bi bi-send"></i> Solicitar Acceso
              </button>`;
          }

          return `
            <div class="pm-collab-card ${item.active ? 'active' : item.pending ? 'pending' : ''}">
              <div class="pm-collab-card__header">
                <div class="pm-collab-card__icon ${item.iconClass}">
                  <i class="bi ${item.icon}"></i>
                </div>
                <div class="pm-collab-card__info">
                  <h4 class="pm-collab-card__name">${item.title}</h4>
                  <p class="pm-collab-card__desc">${item.desc}</p>
                </div>
              </div>
              <div class="pm-collab-card__footer">
                ${badgeHtml}
                <div class="pm-collab-card__action">
                  ${actionHtml}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // Asignar listeners
  container.querySelectorAll('.pm-collab-request-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      btn.disabled = true;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<span class="pm-settings-spinner"></span> Enviando...`;

      try {
        await solicitarPermisoFn(maestroId, key);
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { message: 'Solicitud enviada correctamente. Esperando aprobación admin.', type: 'success' }
        }));
        
        // Refrescar los permisos locales del servicio
        const { getPermisos } = await import('../services/permisoService.js');
        const updatedPerm = await getPermisos(maestroId);

        renderCollaborationPermissions(container, updatedPerm, maestroId, solicitarPermisoFn);
      } catch (err) {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { message: 'Error al enviar solicitud: ' + err.message, type: 'danger' }
        }));
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    });
  });

  // Action buttons (shown when permission is approved)
  container.querySelectorAll('.pm-collab-action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const route = btn.dataset.route;

      if (route === 'registrar-alumno') {
        if (window.router) window.router.navigate('registrar-alumno');
      } else if (route === 'gestionar-clases') {
        if (window.router) window.router.navigate('gestionar-clases');
      }
    });
  });
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
    <div class="pm-avail-dia ${hasFranjas ? 'open' : ''}" data-dia="${diaKey}" role="listitem">
      <button class="pm-avail-dia__header" aria-expanded="${hasFranjas ? 'true' : 'false'}" aria-controls="pm-avail-body-${diaKey}" data-dia="${diaKey}">
        <span class="pm-avail-dia__label">${label}</span>
        <span class="pm-avail-dia__count">${franjas.length} franja${franjas.length !== 1 ? 's' : ''}</span>
        <i class="bi bi-chevron-down pm-avail-dia__arrow" aria-hidden="true"></i>
      </button>
      <div class="pm-avail-dia__body" id="pm-avail-body-${diaKey}">
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

  // Sistema — historial de versiones (solo admin)
  document.getElementById('pm-ver-sistema-btn')?.addEventListener('click', () => {
    import('../../modules/sistema/views/sistemaView.js').then(({ renderSistemaView }) => {
      AppModal.open({
        title: `<i class="bi bi-cpu-fill me-2"></i>Sistema SOI — v${APP_VERSION}`,
        size: 'xl',
        saveText: null,
        cancelText: 'Cerrar',
        body: `<div id="pm-sistema-modal-body"></div>`,
        onOpen: (body) => {
          renderSistemaView(body.querySelector('#pm-sistema-modal-body'))
        },
      })
    })
  });

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

  // Diagnóstico de push
  document.getElementById('btn-push-diagnostic')?.addEventListener('click', () => pushDiagnostic.open());

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
      const parent = btn.closest('.pm-avail-dia');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      
      btn.setAttribute('aria-expanded', !expanded);
      parent.classList.toggle('open', !expanded);
    });
  });

  // Agregar franja
  document.querySelectorAll('.pm-avail-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const diaKey = btn.dataset.dia;
      const parent = btn.closest('.pm-avail-dia');
      const franjasEl = document.getElementById(`pm-avail-franjas-${diaKey}`);
      const index = franjasEl.querySelectorAll('.pm-avail-franja').length;
      
      franjasEl.insertAdjacentHTML('beforeend', renderSlot(diaKey, index, { inicio: '08:00', fin: '12:00' }));
      parent.classList.add('open');
      const header = parent.querySelector('.pm-avail-dia__header');
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
  const telefono = normalizePhone(document.getElementById('perfilTelefono').value.trim()) || document.getElementById('perfilTelefono').value.trim();
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
    // 1. Validar y actualizar disponibilidad usando disponibilidadApi
    const resDisp = await updateDisponibilidad(maestroOriginal.id, disponibilidad);
    if (!resDisp.success) {
      const errorMsg = resDisp.errors.join('\n');
      throw new Error(errorMsg);
    }

    // 2. Actualizar los otros campos del perfil
    const { error } = await supabase
      .from('maestros')
      .update({ 
        nombre_completo: nombre, 
        tlf: telefono, 
        especialidad 
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

    // Sincronizar y re-evaluar SOI Smart Insights de inmediato
    if (window.pwaInstaller) {
      window.pwaInstaller.evaluateInsights();
    }
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
    padding: 0; 
    background: var(--pm-surface); 
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  }
  .pm-avail-dia.open .pm-avail-dia__body {
    max-height: 1000px;
    padding: 0.85rem;
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

  /* Colaboración de permisos */
  .pm-collab-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  .pm-collab-card {
    background: var(--pm-surface-2);
    border: 1px solid var(--pm-border);
    border-radius: 12px;
    padding: 0.85rem;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .pm-collab-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: rgba(59, 130, 246, 0.3);
  }
  .pm-collab-card.active {
    border-color: rgba(34, 197, 94, 0.3);
  }
  .pm-collab-card.active:hover {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.05);
  }
  .pm-collab-card.pending {
    border-color: rgba(234, 179, 8, 0.3);
  }
  .pm-collab-card.pending:hover {
    border-color: rgba(234, 179, 8, 0.5);
    box-shadow: 0 4px 12px rgba(234, 179, 8, 0.05);
  }
  .pm-collab-card__header {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }
  .pm-collab-card__icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: var(--pm-surface);
    box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    flex-shrink: 0;
  }
  .pm-collab-card__info {
    flex: 1;
  }
  .pm-collab-card__name {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: var(--pm-text);
  }
  .pm-collab-card__desc {
    font-size: 0.75rem;
    color: var(--pm-text-muted);
    margin: 0.2rem 0 0;
    line-height: 1.3;
  }
  .pm-collab-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.75rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--pm-border);
    gap: 0.75rem;
  }
  .pm-collab-badge {
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .pm-collab-badge.active {
    background: rgba(34, 197, 94, 0.12);
    color: #22c55e;
  }
  .pm-collab-badge.pending {
    background: rgba(234, 179, 8, 0.12);
    color: #eab308;
  }
  .pm-collab-badge.inactive {
    background: var(--pm-surface);
    color: var(--pm-text-muted);
    border: 1px solid var(--pm-border);
  }
  .pm-collab-card__action {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
  .pm-collab-help-text {
    font-size: 0.7rem;
    color: var(--pm-text-muted);
    margin: 0;
    text-align: right;
  }

  /* Lista alumnos/clases en gestionAlumnosClasesView */
  .pgac-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.6rem;
  }
  .pgac-list-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.5rem 0.6rem;
    background: var(--pm-surface-2);
    border-radius: 8px;
    border: 1px solid var(--pm-border);
    transition: background 0.15s;
  }
  .pgac-list-item:hover { background: var(--pm-border); }
  .pgac-list-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(59,130,246,0.15);
    color: var(--pm-primary, #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .pgac-list-avatar--teal {
    background: rgba(20,184,166,0.15);
    color: #14b8a6;
  }
  .pgac-list-info {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }
  .pgac-list-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--pm-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pgac-list-sub {
    font-size: 0.72rem;
    color: var(--pm-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Nota instalación manual */
  .pm-install-note {
    font-size: 0.78rem;
    color: var(--pm-text-muted);
    background: var(--pm-surface-2);
    border: 1px solid var(--pm-border);
    border-radius: 8px;
    padding: 0.65rem 0.85rem;
    margin-top: 0.65rem;
    line-height: 1.6;
  }
`;

if (!document.getElementById('pm-avail-styles')) {
  const s = document.createElement('style');
  s.id = 'pm-avail-styles';
  s.textContent = styles;
  document.head.appendChild(s);
}
