/**
 * portalEvents.js
 * Responsabilidad: Listeners globales del portal que se registran UNA sola vez:
 * notificaciones, permisos realtime, keyboard shortcuts, resize.
 */

import { supabase } from '../../lib/supabaseClient.js'
import {
  onNotificacionesChange,
  getUnreadCount,
  fetchNotificaciones,
  startRealtime,
  stopRealtime,
} from '../services/notificationService.js'
import { getPermisos } from '../services/permisoService.js'
import { AppToast } from '../../shared/components/AppToast.js'
import { getBreakpoint } from './portalShell.js'

let _globalEventsInitialized = false
let _permisosChannel = null

export function setupGlobalAppEvents({
  isAdmin,
  getMaestro,
  getPermisosCached,
  onPermisosUpdate,
  onNavigate,
  onResize,
}) {
  if (_globalEventsInitialized) return
  _globalEventsInitialized = true

  // ── Notificaciones badge ───────────────────────────────────
  onNotificacionesChange(() => {
    const badge = document.getElementById('pm-notif-badge')
    if (!badge) return
    const count = getUnreadCount()
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count
      badge.style.display = 'flex'
    } else {
      badge.style.display = 'none'
    }
  })

  fetchNotificaciones()
  startRealtime()

  // ── Permisos Realtime (solo maestros, no admins) ───────────
  if (!isAdmin) {
    _subscribeToPermisos({ getMaestro, getPermisosCached, onPermisosUpdate, onNavigate })
  }

  // ── Keyboard shortcuts (desktop) ──────────────────────────
  document.addEventListener('keydown', (e) => {
    if (getBreakpoint() !== 'desktop') return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

    if (!window._globalAppKeys) window._globalAppKeys = []
    const _keys = window._globalAppKeys
    _keys.push(e.key.toLowerCase())

    if (_keys[_keys.length - 2] === 'g') {
      const shortcuts = { h: 'hoy', c: 'calendario', r: 'ruta', m: 'metricas', p: 'perfil' }
      const dest = shortcuts[e.key.toLowerCase()]
      if (dest) { onNavigate(dest); _keys.length = 0 }
    }
    if (_keys.length > 3) _keys.splice(0, _keys.length - 2)
  })

  // ── Resize → re-render shell ONLY on breakpoint change ──────
  // On mobile, the virtual keyboard triggers resize events constantly (when
  // it appears/disappears). We must NOT rebuild the shell on every resize —
  // only when the layout breakpoint actually changes (mobile ↔ tablet ↔ desktop).
  let _resizeTimer = null
  let _lastBreakpoint = getBreakpoint()
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(_resizeTimer)
      _resizeTimer = setTimeout(() => {
        const next = getBreakpoint()
        if (next !== _lastBreakpoint) {
          _lastBreakpoint = next
          onResize()
        }
      }, 250)
    },
    { passive: true },
  )
}

function _subscribeToPermisos({ getMaestro, getPermisosCached, onPermisosUpdate, onNavigate }) {
  const maestro = getMaestro()
  if (!maestro?.id) return

  if (_permisosChannel) {
    supabase.removeChannel(_permisosChannel)
    _permisosChannel = null
  }

  _permisosChannel = supabase
    .channel(`permisos-maestro:${maestro.id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'permisos_maestros', filter: `maestro_id=eq.${maestro.id}` },
      async (payload) => {
        console.log('[Realtime] Permisos actualizados:', payload.new)
        try {
          const nuevosPermisos = await getPermisos(maestro.id)
          const permisosPrevios = getPermisosCached()

          const ganados = []
          const perdidos = []
          if (nuevosPermisos.puede_inscribir_clases && !permisosPrevios?.puede_inscribir_clases)
            ganados.push('Gestionar e Inscribir Clases')
          if (permisosPrevios?.puede_inscribir_clases && !nuevosPermisos.puede_inscribir_clases)
            perdidos.push('Gestionar e Inscribir Clases')

          await onPermisosUpdate(nuevosPermisos, { ganados, perdidos })

          if (ganados.length > 0) {
            AppToast.success(`¡Nuevos permisos activados: ${ganados.join(', ')}! Ahora podés acceder desde el Perfil o la barra de navegación.`)
          } else if (perdidos.length > 0) {
            AppToast.show(`El administrador removió tu acceso a: ${perdidos.join(', ')}.`, 'warning')
          } else {
            AppToast.show('Tus permisos fueron actualizados por el administrador.', 'info')
          }
        } catch (err) {
          console.warn('[Realtime] Error actualizando permisos:', err.message)
        }
      },
    )
    .subscribe((status) => console.log('[Realtime] Canal permisos_maestros:', status))

  window.addEventListener('beforeunload', () => supabase.removeChannel(_permisosChannel), { once: true })
}

export function teardownGlobalEvents() {
  _globalEventsInitialized = false
  stopRealtime()
  if (_permisosChannel) {
    supabase.removeChannel(_permisosChannel)
    _permisosChannel = null
  }
}
