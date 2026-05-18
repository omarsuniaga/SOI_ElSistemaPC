import { actualizarPermiso } from '../../api/permisosApi.js'

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const PERMISO_KEYS = ['alumnos:create', 'clases:enroll', 'planificacion:write', 'asistencias:write']
const PERMISO_LABELS = {
  'alumnos:create': 'Registrar Alumnos',
  'clases:enroll': 'Inscribir Clases',
  'planificacion:write': 'Planificación',
  'asistencias:write': 'Asistencias',
}

/**
 * PermisoRow
 * Renders a <tr> element for a single permiso record.
 *
 * @param {object} permiso — normalized permiso object
 * @returns {HTMLTableRowElement}
 */
export function renderPermisoRow(permiso) {
  const tr = document.createElement('tr')
  tr.dataset.maestroId = permiso.maestro_id

  if (!permiso.vigente) {
    tr.classList.add('permiso-expirado')
  }

  const today = new Date().toISOString().slice(0, 10)

  tr.innerHTML = `
    <td>
      <div class="d-flex align-items-center gap-2">
        <span class="text-truncate" style="max-width:150px;" title="${escapeHTML(permiso.maestro_nombre)}">
          ${escapeHTML(permiso.maestro_nombre || 'Sin nombre')}
        </span>
        ${!permiso.vigente ? '<span class="badge bg-danger ms-1 permiso-expirado-badge">Expirado</span>' : ''}
      </div>
    </td>
    <td class="text-truncate" style="max-width:150px;">${escapeHTML(permiso.maestro_email || '-')}</td>
    <td>
      ${PERMISO_KEYS.map(key => `
        <div class="form-check d-inline-flex align-items-center me-2">
          <input
            class="form-check-input permiso-key-toggle"
            type="checkbox"
            id="perm-${escapeHTML(permiso.maestro_id)}-${key}"
            data-maestro-id="${escapeHTML(permiso.maestro_id)}"
            data-perm-key="${escapeHTML(key)}"
            ${(permiso.permisos || []).includes(key) ? 'checked' : ''}
          >
          <label class="form-check-label small ms-1" for="perm-${escapeHTML(permiso.maestro_id)}-${key}">
            ${escapeHTML(PERMISO_LABELS[key])}
          </label>
        </div>
      `).join('')}
    </td>
    <td>
      <div class="form-check form-switch mb-1">
        <input
          class="form-check-input permiso-toggle"
          type="checkbox"
          data-maestro-id="${escapeHTML(permiso.maestro_id)}"
          data-field="puede_registrar_alumnos"
          ${permiso.puede_registrar_alumnos ? 'checked' : ''}
        >
        <label class="form-check-label small">Reg. Alumnos</label>
      </div>
      <div class="form-check form-switch">
        <input
          class="form-check-input permiso-toggle"
          type="checkbox"
          data-maestro-id="${escapeHTML(permiso.maestro_id)}"
          data-field="puede_inscribir_clases"
          ${permiso.puede_inscribir_clases ? 'checked' : ''}
        >
        <label class="form-check-label small">Inscr. Clases</label>
      </div>
    </td>
    <td>
      <input
        type="date"
        class="form-control form-control-sm permiso-date"
        data-maestro-id="${escapeHTML(permiso.maestro_id)}"
        data-field="fecha_inicio"
        value="${escapeHTML(permiso.fecha_inicio || '')}"
        style="width:130px"
      >
    </td>
    <td>
      <input
        type="date"
        class="form-control form-control-sm permiso-date"
        data-maestro-id="${escapeHTML(permiso.maestro_id)}"
        data-field="fecha_fin"
        value="${escapeHTML(permiso.fecha_fin || '')}"
        style="width:130px"
      >
    </td>
    <td>
      <input
        type="checkbox"
        class="form-check-input bulk-select"
        data-maestro-id="${escapeHTML(permiso.maestro_id)}"
        aria-label="Seleccionar ${escapeHTML(permiso.maestro_nombre)}"
      >
    </td>
  `

  attachRowEvents(tr, permiso)
  return tr
}

function attachRowEvents(tr, permiso) {
  // Boolean toggles (puede_registrar_alumnos, puede_inscribir_clases)
  tr.querySelectorAll('.permiso-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const field = toggle.dataset.field
      const newValue = toggle.checked
      const prev = !newValue
      toggle.disabled = true

      try {
        await actualizarPermiso(permiso.maestro_id, { [field]: newValue })
        permiso[field] = newValue
      } catch {
        toggle.checked = prev
      } finally {
        toggle.disabled = false
      }
    })
  })

  // Permiso key checkboxes
  tr.querySelectorAll('.permiso-key-toggle').forEach(cb => {
    cb.addEventListener('change', async () => {
      const key = cb.dataset.permKey
      const prevPermisos = [...(permiso.permisos || [])]
      let newPermisos

      if (cb.checked) {
        newPermisos = [...new Set([...prevPermisos, key])]
      } else {
        newPermisos = prevPermisos.filter(k => k !== key)
      }

      cb.disabled = true
      try {
        await actualizarPermiso(permiso.maestro_id, { permisos: newPermisos })
        permiso.permisos = newPermisos
      } catch {
        cb.checked = !cb.checked
      } finally {
        cb.disabled = false
      }
    })
  })

  // Date inputs — auto-save on blur
  tr.querySelectorAll('.permiso-date').forEach(input => {
    const prevValue = input.value
    input.addEventListener('blur', async () => {
      const field = input.dataset.field
      const rawValue = input.value.trim()
      const saveValue = rawValue === '' ? null : rawValue

      try {
        await actualizarPermiso(permiso.maestro_id, { [field]: saveValue })
        permiso[field] = saveValue
      } catch {
        input.value = prevValue
      }
    })
  })
}
