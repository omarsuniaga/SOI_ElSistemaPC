import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Renderiza la vista de aprobación de maestros para el panel admin.
 * Muestra una tabla de maestros pendientes con botones Aprobar / Rechazar.
 * @param {HTMLElement} container
 */
export async function renderAprobacionView(container) {
  container.innerHTML = `
    <div class="pm-view-header">
      <h2><i class="bi bi-person-check"></i> Aprobación de Maestros</h2>
      <p class="pm-view-subtitle">Revisá y aprobá las solicitudes de registro de maestros</p>
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
      .select('id, email, nombre_completo, created_at')
      .eq('rol', 'maestro')
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
              <th>Instrumento</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${pendientes.map(p => `
              <tr data-profile-id="${p.id}">
                <td>${escHTML(p.nombre_completo || '—')}</td>
                <td>${escHTML(p.email)}</td>
                <td>${escHTML(p.instrumento || '—')}</td>
                <td>${formatDate(p.created_at)}</td>
                <td class="aprobacion-actions">
                  <button class="btn btn-success btn-sm btn-aprobar" data-id="${p.id}">
                    <i class="bi bi-check-circle"></i> Aprobar
                  </button>
                  <button class="btn btn-danger btn-sm btn-rechazar" data-id="${p.id}">
                    <i class="bi bi-x-circle"></i> Rechazar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `

    // Attach event handlers for approve/reject
    contentEl.querySelectorAll('.btn-aprobar').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn.dataset.id, 'activo', contentEl))
    })

    contentEl.querySelectorAll('.btn-rechazar').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn.dataset.id, 'rechazado', contentEl))
    })
  } catch (err) {
    const contentEl = container.querySelector('#aprobacion-content')
    contentEl.innerHTML = `
      <div class="pm-error" style="text-align: center; padding: 2rem;">
        <p><i class="bi bi-exclamation-triangle"></i> Error al cargar solicitudes: ${err.message}</p>
        <button class="btn btn-outline-light btn-sm" onclick="this.closest('[id]').__reload?.()">
          Intentar de nuevo
        </button>
      </div>
    `
    console.error('[AprobacionView] Error:', err.message)
  }
}

async function handleAction(profileId, nuevoEstado, contentEl) {
  const row = contentEl.querySelector(`tr[data-profile-id="${profileId}"]`)
  if (!row) return

  // Disable buttons while processing
  row.querySelectorAll('button').forEach(b => b.disabled = true)

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ estado: nuevoEstado })
      .eq('id', profileId)

    if (error) throw error

    // After approving, grant basic permissions so Realtime fires on teacher's browser
    if (nuevoEstado === 'activo') {
      try {
        const { data: maestroRow } = await supabase
          .from('maestros')
          .select('id')
          .eq('user_id', profileId)
          .maybeSingle()

        if (maestroRow?.id) {
          await supabase
            .from('permisos_maestros')
            .upsert({
              maestro_id: maestroRow.id,
              puede_registrar_alumnos: true,
              puede_inscribir_clases: true,
              permisos: ['alumnos:create', 'clases:enroll', 'registrar_alumnos', 'inscribir_clases'],
            }, { onConflict: 'maestro_id' })
        }
      } catch (permErr) {
        // Non-fatal: teacher can still request permissions manually
        console.warn('[AprobacionView] Could not grant default permissions:', permErr.message)
      }
    }

    // Remove the row with animation
    row.style.transition = 'opacity 0.3s ease'
    row.style.opacity = '0'
    setTimeout(() => row.remove(), 300)

    // Show success toast
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: {
        message: nuevoEstado === 'activo'
          ? 'Maestro aprobado correctamente'
          : 'Maestro rechazado',
        type: 'success'
      }
    }))

    // Check if table is now empty
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
  } catch (err) {
    // Re-enable buttons on error
    row.querySelectorAll('button').forEach(b => b.disabled = false)

    window.dispatchEvent(new CustomEvent('showToast', {
      detail: {
        message: `Error al ${nuevoEstado === 'activo' ? 'aprobar' : 'rechazar'} maestro: ${err.message}`,
        type: 'error'
      }
    }))
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
