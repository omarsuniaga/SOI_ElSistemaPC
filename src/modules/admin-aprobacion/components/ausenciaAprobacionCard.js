/**
 * ausenciaAprobacionCard — Card de aprobación de ausencias para el portal admin
 * Diseño profesional con colores de urgencia, tipo con ícono, y acciones claras.
 */

function escHTML(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatDateRange(ausencia) {
  const start = formatDate(ausencia.fecha_inicio)
  if (!ausencia.fecha_fin || ausencia.fecha_fin === ausencia.fecha_inicio) return start
  return `${start} → ${formatDate(ausencia.fecha_fin)}`
}

function getTeacherName(ausencia) {
  return ausencia.maestros?.nombre_completo || ausencia.maestro_nombre || 'Maestro no especificado'
}

function getTeacherEmail(ausencia) {
  return ausencia.maestros?.correo || ''
}

const TIPO_CONFIG = {
  enfermedad:   { label: 'Médica',        icon: 'bi-heart-pulse-fill',  color: '#ef4444' },
  personal:     { label: 'Personal',      icon: 'bi-person-fill',       color: '#3b82f6' },
  capacitacion: { label: 'Capacitación',  icon: 'bi-mortarboard-fill',  color: '#8b5cf6' },
  vacaciones:   { label: 'Vacaciones',    icon: 'bi-sun-fill',          color: '#f59e0b' },
  otro:         { label: 'Otro',          icon: 'bi-three-dots',        color: '#6b7280' },
}

const URG_CONFIG = {
  baja:  { label: 'Baja',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  media: { label: 'Media', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  alta:  { label: 'Alta',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

function getCoverageSummary(ausencia) {
  if (ausencia.clase_emergente?.fecha) {
    const hora = ausencia.clase_emergente.hora ? ` a las ${ausencia.clase_emergente.hora}` : ''
    return `<i class="bi bi-calendar-check"></i> Reprogramada para ${ausencia.clase_emergente.fecha}${hora}`
  }
  if (ausencia.maestro_suplente_id || ausencia.suplente_nombre) {
    return `<i class="bi bi-person-check"></i> Suplente: ${escHTML(ausencia.suplente_nombre || ausencia.maestro_suplente_id)}`
  }
  return `<i class="bi bi-clock"></i> Pendiente de coordinación`
}

function injectCardStyles() {
  if (document.getElementById('ausencia-aprobacion-card-styles')) return
  const style = document.createElement('style')
  style.id = 'ausencia-aprobacion-card-styles'
  style.textContent = `
    .ausencia-approval-card {
      background: var(--bs-card-bg, #fff);
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.1));
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: box-shadow 0.2s;
    }
    .ausencia-approval-card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .aac-accent-bar {
      height: 4px;
      width: 100%;
    }

    .aac-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1rem 0.5rem;
    }

    .aac-avatar {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      background: var(--aac-tipo-color, #6b7280);
    }

    .aac-header-info {
      flex: 1;
      min-width: 0;
    }

    .aac-teacher-name {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 0.1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .aac-teacher-email {
      font-size: 0.75rem;
      opacity: 0.55;
      margin: 0;
    }

    .aac-badges {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-top: 0.4rem;
    }

    .aac-tipo-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--aac-tipo-color, #6b7280);
      background: color-mix(in srgb, var(--aac-tipo-color, #6b7280) 12%, transparent);
    }

    .aac-urg-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .aac-body {
      padding: 0.5rem 1rem;
    }

    .aac-date-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--bs-body-color);
    }

    .aac-date-row i {
      opacity: 0.55;
    }

    .aac-coverage {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      opacity: 0.7;
      margin-bottom: 0.5rem;
    }

    .aac-motivo {
      font-size: 0.82rem;
      line-height: 1.5;
      opacity: 0.8;
      padding: 0.6rem 0.75rem;
      border-radius: 0.5rem;
      background: var(--bs-tertiary-bg, rgba(0,0,0,0.04));
      margin-bottom: 0.75rem;
    }

    .aac-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.73rem;
      opacity: 0.55;
      margin-bottom: 0.25rem;
    }

    .aac-notes-wrap {
      padding: 0 1rem 0.75rem;
    }

    .aac-notes-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      opacity: 0.65;
      margin-bottom: 0.35rem;
    }

    .aac-notes-input {
      width: 100%;
      border: 1px solid var(--bs-border-color, rgba(0,0,0,0.15));
      border-radius: 0.5rem;
      padding: 0.45rem 0.65rem;
      font-size: 0.82rem;
      background: var(--bs-body-bg);
      color: var(--bs-body-color);
      resize: vertical;
      min-height: 3rem;
      transition: border-color 0.15s;
    }
    .aac-notes-input:focus {
      outline: none;
      border-color: var(--aac-tipo-color, #3b82f6);
    }

    .aac-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1rem 1rem;
    }

    .aac-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.55rem;
      border-radius: 0.6rem;
      border: none;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .aac-btn:active { transform: scale(0.97); }
    .aac-btn:disabled { opacity: 0.45; pointer-events: none; }

    .aac-btn-approve {
      background: rgba(34,197,94,0.15);
      color: #16a34a;
    }
    .aac-btn-approve:hover { background: rgba(34,197,94,0.25); }

    .aac-btn-reject {
      background: rgba(239,68,68,0.12);
      color: #dc2626;
    }
    .aac-btn-reject:hover { background: rgba(239,68,68,0.22); }

    /* Dark mode compatibility */
    [data-bs-theme="dark"] .ausencia-approval-card,
    [data-portal-theme="dark"] .ausencia-approval-card {
      border-color: rgba(255,255,255,0.1);
    }

    [data-bs-theme="dark"] .aac-motivo,
    [data-portal-theme="dark"] .aac-motivo {
      background: rgba(255,255,255,0.05);
    }
  `
  document.head.appendChild(style)
}

export function createAusenciaAprobacionCard(ausencia, { onApprove = () => {}, onReject = () => {} } = {}) {
  injectCardStyles()

  const tipo = TIPO_CONFIG[ausencia.tipo_ausencia] || TIPO_CONFIG.otro
  const urg  = URG_CONFIG[ausencia.urgencia]   || { label: ausencia.urgencia || 'Normal', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' }
  const affectedCount = Array.isArray(ausencia.clases_afectadas) ? ausencia.clases_afectadas.length : 0
  const teacherName = getTeacherName(ausencia)
  const initials = teacherName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const card = document.createElement('article')
  card.className = 'ausencia-approval-card'
  card.dataset.ausenciaCard = ausencia.id
  card.style.setProperty('--aac-tipo-color', tipo.color)

  const submittedAt = ausencia.created_at
    ? new Date(ausencia.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  card.innerHTML = `
    <div class="aac-accent-bar" style="background: ${escHTML(tipo.color)};"></div>

    <div class="aac-header">
      <div class="aac-avatar" style="background: ${escHTML(tipo.color)};">${escHTML(initials)}</div>
      <div class="aac-header-info">
        <p class="aac-teacher-name">${escHTML(teacherName)}</p>
        <p class="aac-teacher-email">${escHTML(getTeacherEmail(ausencia))}</p>
        <div class="aac-badges">
          <span class="aac-tipo-chip" style="--aac-tipo-color:${escHTML(tipo.color)}">
            <i class="bi ${escHTML(tipo.icon)}"></i> ${escHTML(tipo.label)}
          </span>
          <span class="aac-urg-chip" style="color:${escHTML(urg.color)};background:${escHTML(urg.bg)}">
            <i class="bi bi-circle-fill" style="font-size:0.45rem"></i> ${escHTML(urg.label)}
          </span>
        </div>
      </div>
    </div>

    <div class="aac-body">
      <div class="aac-date-row">
        <i class="bi bi-calendar-range"></i>
        ${escHTML(formatDateRange(ausencia))}
      </div>
      <div class="aac-coverage">${getCoverageSummary(ausencia)}</div>
      ${affectedCount > 0 ? `<div class="aac-meta"><span><i class="bi bi-journal-text"></i> ${affectedCount} clase${affectedCount > 1 ? 's' : ''} afectada${affectedCount > 1 ? 's' : ''}</span></div>` : ''}
      ${ausencia.motivo ? `<div class="aac-motivo">${escHTML(ausencia.motivo)}</div>` : ''}
      <div class="aac-meta">
        ${submittedAt ? `<span><i class="bi bi-clock-history"></i> Enviada el ${submittedAt}</span>` : ''}
      </div>
    </div>

    <div class="aac-notes-wrap">
      <label class="aac-notes-label" for="notes-${escHTML(ausencia.id)}">Nota de decisión (opcional)</label>
      <textarea
        class="aac-notes-input"
        id="notes-${escHTML(ausencia.id)}"
        data-decision-notes
        rows="2"
        placeholder="Ej: Aprobada según reglamento art. 5..."
      ></textarea>
    </div>

    <div class="aac-actions">
      <button type="button" class="aac-btn aac-btn-approve" data-action="approve">
        <i class="bi bi-check-circle-fill"></i> Aprobar
      </button>
      <button type="button" class="aac-btn aac-btn-reject" data-action="reject">
        <i class="bi bi-x-circle-fill"></i> Rechazar
      </button>
    </div>
  `

  const getNotes = () => card.querySelector('[data-decision-notes]')?.value?.trim() || ''

  const approveBtn = card.querySelector('[data-action="approve"]')
  const rejectBtn  = card.querySelector('[data-action="reject"]')

  approveBtn.addEventListener('click', async () => {
    approveBtn.disabled = true
    rejectBtn.disabled  = true
    approveBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Aprobando...'
    await onApprove(ausencia.id, getNotes())
  })

  rejectBtn.addEventListener('click', async () => {
    approveBtn.disabled = true
    rejectBtn.disabled  = true
    rejectBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Rechazando...'
    await onReject(ausencia.id, getNotes())
  })

  return card
}
