import { supabase } from '../../../lib/supabaseClient.js'
import { AppModal } from '../../../shared/components/AppModal.js'

/**
 * Renderiza la vista de aprobación de maestros para el panel admin.
 * Muestra una tabla de maestros pendientes con botones Aprobar / Rechazar.
 * @param {HTMLElement} container
 */
export async function renderAprobacionView(container) {
  container.innerHTML = `
    <div class="pm-view-header">
      <h2><i class="bi bi-person-check"></i> Aprobación de Usuarios</h2>
      <p class="pm-view-subtitle">Revisá y aprobá las solicitudes de registro (maestros y administradores)</p>
    </div>
    <div id="aprobacion-content">
      <div class="pm-loading">
        <div class="pm-spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>  
    </div>
  `

  try {
    const { data: pendientes, error } = await supabase
      .from('profiles')
      .select('id, email, nombre_completo, rol, created_at')
      .in('rol', ['maestro', 'admin'])
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }
    const contentEl = container.querySelector('#aprobacion-content')

    if (!pendientes || pendientes.length === 0) {
      contentEl.innerHTML = `
        <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
            <i class="bi bi-inbox"></i>
          </div>
          <h3>No hay maestros pendientes de aprobación</h3>
          <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
        </div>
      `
      return
    }

    contentEl.innerHTML = `
      <div class="table-responsive" style="margin-top: 1rem;">
        <table class="table table-dark table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Email</th>
              <th>Rol solicitado</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${pendientes
              .map((p) => {
                const rolBadge =
                  p.rol === 'admin'
                    ? '<span class="badge bg-info">Administrador</span>'
                    : '<span class="badge bg-secondary">Maestro</span>'
                return `
              <tr data-profile-id="${p.id}" data-rol="${escHTML(p.rol || '')}">
                <td>${escHTML(p.nombre_completo || '—')}</td>
                <td>${escHTML(p.email)}</td>
                <td>${rolBadge}</td>
                <td>${formatDate(p.created_at)}</td>
                <td class="aprobacion-actions">
                  <button class="btn btn-success btn-sm btn-aprobar" data-id="${p.id}" data-rol="${escHTML(p.rol || 'maestro')}">
                    <i class="bi bi-check-circle"></i> Aprobar
                  </button>
                  <button class="btn btn-danger btn-sm btn-rechazar" data-id="${p.id}">
                    <i class="bi bi-x-circle"></i> Rechazar
                  </button>
                </td>
              </tr>
            `
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `

    // Attach event handlers for approve/reject
    contentEl.querySelectorAll('.btn-aprobar').forEach((btn) => {
      btn.addEventListener('click', () =>
        openApproveModal(btn.dataset.id, contentEl, btn.dataset.rol),
      )
    })

    contentEl.querySelectorAll('.btn-rechazar').forEach((btn) => {
      btn.addEventListener('click', () =>
        handleAction(btn.dataset.id, 'rechazado', null, contentEl),
      )
    })
  } catch (err) {
    const contentEl = container.querySelector('#aprobacion-content')
    contentEl.innerHTML = `
      <div class="pm-error" style="text-align: center; padding: 2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar solicitudes: ${err.message}</p>
        <button class="btn btn-outline-light btn-sm" id="btn-retry-aprobacion">
          Intentar de nuevo
        </button>
      </div>
    `
    contentEl
      .querySelector('#btn-retry-aprobacion')
      ?.addEventListener('click', () => renderAprobacionView(container))
    console.error('[AprobacionView] Error:', err.message)
  }
}

function openApproveModal(profileId, contentEl, rolSolicitado = 'maestro') {
  AppModal.open({
    title: 'Aprobar Usuario',
    size: 'sm',
    saveText: 'Aprobar',
    body: `
      <p>Confirmá el rol con el que se aprobará al usuario:</p>
      <div class="mb-3">
        <label class="form-label-compact">Rol</label>
        <select class="form-select" id="aprobacion-rol-select">
          <option value="maestro" ${rolSolicitado === 'maestro' ? 'selected' : ''}>Maestro</option>
          <option value="admin" ${rolSolicitado === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </div>
    `,
    onSave: async (modalBody) => {
      const rol = modalBody.querySelector('#aprobacion-rol-select').value
      await handleAction(profileId, 'activo', rol, contentEl)
    },
  })
}

/**
 * Aprueba usando la RPC SECURITY DEFINER (atómico: actualiza profiles,
 * confirma email, sincroniza metadata.rol, limpia/crea maestros, permisos).
 * Rechaza con update directo a profiles (no necesita lógica extra).
 */
async function handleAction(profileId, nuevoEstado, rol, contentEl) {
  const row = contentEl?.querySelector(`tr[data-profile-id="${profileId}"]`)
  if (!row && contentEl) return

  // Disable buttons while processing
  row?.querySelectorAll('button').forEach((b) => (b.disabled = true))

  try {
    if (nuevoEstado === 'activo') {
      // ── APPROVE: intentar RPC primero, fallback a operaciones directas ──
      let rpcOk = false
      const { data: rpcData, error: rpcError } = await supabase.rpc('approve_maestro_profile', {
        p_profile_id: profileId,
        p_new_rol: rol || 'maestro',
        p_new_estado: 'activo',
      })

      if (!rpcError && rpcData?.success) {
        rpcOk = true
      }

      // Fallback directo si el RPC falla
      if (!rpcOk) {
        console.warn(
          '[AprobacionView] RPC falló, usando operaciones directas:',
          rpcError?.message || rpcData?.error,
        )

        const { error: upErr, count } = await supabase
          .from('profiles')
          .update({ rol: rol || 'maestro', estado: 'activo' })
          .eq('id', profileId)
          .select()

        if (upErr) throw new Error(`No se pudo actualizar el perfil: ${upErr.message}`)

        // Verificar que el update realmente afectó la fila
        const { data: check } = await supabase
          .from('profiles')
          .select('estado, rol')
          .eq('id', profileId)
          .maybeSingle()

        if (check?.estado !== 'activo') {
          // RLS está bloqueando — necesitamos re-loguear como admin para que el RPC funcione
          throw new Error(
            'No se pudo activar el perfil. Por favor cerrá sesión e iniciá sesión nuevamente como admin, luego intentá aprobar de nuevo.',
          )
        }
      }

      // Asegurar row en maestros si el rol es maestro
      if (rol === 'maestro' || !rol) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, nombre_completo')
          .eq('id', profileId)
          .maybeSingle()

        if (profile) {
          const { data: existing } = await supabase
            .from('maestros')
            .select('id, user_id')
            .or(`user_id.eq.${profile.id},correo.eq.${profile.email}`)
            .maybeSingle()

          if (!existing) {
            await supabase.from('maestros').insert({
              user_id: profile.id,
              nombre_completo: profile.nombre_completo,
              correo: profile.email,
              instrumento: '',
              activo: true,
            })
          } else if (!existing.user_id) {
            await supabase.from('maestros').update({ user_id: profile.id }).eq('id', existing.id)
          }
        }
      }
    } else {
      // ── REJECT: update directo (sin lógica adicional) ──────────────
      const { error } = await supabase
        .from('profiles')
        .update({ estado: nuevoEstado })
        .eq('id', profileId)

      if (error) throw error
    }

    // Remove the row with animation
    if (row) {
      row.style.transition = 'opacity 0.3s ease'
      row.style.opacity = '0'
      setTimeout(() => row.remove(), 300)
    }

    // Show success toast
    const rolLabel = rol === 'admin' ? 'Admin' : 'Maestro'
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          message:
            nuevoEstado === 'activo' ? `${rolLabel} aprobado correctamente` : 'Usuario rechazado',
          type: 'success',
        },
      }),
    )

    // Check if table is now empty
    if (contentEl) {
      const tbody = contentEl.querySelector('tbody')
      if (tbody && tbody.querySelectorAll('tr').length === 0) {
        contentEl.innerHTML = `
          <div class="pm-empty-state" style="text-align: center; padding: 3rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
              <i class="bi bi-inbox"></i>
            </div>
            <h3>No hay maestros pendientes de aprobación</h3>
            <p style="opacity: 0.6;">Los nuevos registros aparecerán aquí automáticamente.</p>
          </div>
        `
      }
    }
  } catch (err) {
    // Re-enable buttons on error
    row?.querySelectorAll('button').forEach((b) => (b.disabled = false))

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          message: `Error al ${nuevoEstado === 'activo' ? 'aprobar' : 'rechazar'} usuario: ${err.message}`,
          type: 'error',
        },
      }),
    )
    console.error('[AprobacionView] Action error:', err.message)
  }
}
function escHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
