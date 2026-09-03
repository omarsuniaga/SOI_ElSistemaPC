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
  return (
    ausencia.maestros?.nombre_completo ||
    ausencia.maestro_nombre ||
    ausencia.nombre_completo ||
    ausencia.docente_nombre ||
    'Docente de la Institución'
  )
}

function getTeacherEmail(ausencia) {
  return (
    ausencia.maestros?.correo ||
    ausencia.maestros?.email ||
    ausencia.maestro_email ||
    ausencia.docente_email ||
    ausencia.correo ||
    ausencia.email ||
    ''
  )
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
      background: var(--surface-color, var(--bs-card-bg, #ffffff));
      border: 1px solid var(--border-color, var(--bs-border-color, #e2e8f0));
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      color: var(--bs-body-color, #334155);
    }
    .ausencia-approval-card:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.09);
      border-color: var(--bs-primary, #2563eb);
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
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      flex-shrink: 0;
      background: var(--aac-tipo-color, #6b7280);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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
      color: var(--bs-heading-color, #0f172a);
    }

    .aac-teacher-email {
      font-size: 0.75rem;
      color: var(--bs-secondary-color, #64748b);
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
      background: color-mix(in srgb, var(--aac-tipo-color, #6b7280) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--aac-tipo-color, #6b7280) 25%, transparent);
    }

    .aac-urg-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
      border: 1px solid transparent;
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
      color: var(--bs-body-color, #1e293b);
    }

    .aac-date-row i {
      opacity: 0.65;
    }

    .aac-coverage {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      color: var(--bs-secondary-color, #64748b);
      margin-bottom: 0.5rem;
    }

    .aac-motivo {
      font-size: 0.82rem;
      line-height: 1.5;
      padding: 0.6rem 0.75rem;
      border-radius: 0.5rem;
      background: var(--bs-tertiary-bg, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      color: var(--bs-body-color, #334155);
      margin-bottom: 0.75rem;
    }

    .aac-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.73rem;
      color: var(--bs-secondary-color, #64748b);
      margin-bottom: 0.25rem;
    }

    .aac-notes-wrap {
      padding: 0 1rem 0.75rem;
    }

    .aac-doc-wrap {
      margin-bottom: 0.6rem;
    }

    .aac-btn-doc {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      background: rgba(37, 99, 235, 0.08);
      color: #2563eb;
      border: 1px solid rgba(37, 99, 235, 0.25);
      border-radius: 0.5rem;
      font-size: 0.78rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .aac-btn-doc:hover {
      background: rgba(37, 99, 235, 0.16);
      color: #1d4ed8;
      border-color: #2563eb;
    }

    .aac-notes-details {
      border: 1px dashed var(--border-color, #cbd5e1);
      border-radius: 0.5rem;
      padding: 0.45rem 0.65rem;
      background: var(--bs-tertiary-bg, #f8fafc);
    }

    .aac-notes-summary {
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--bs-secondary-color, #64748b);
      display: flex;
      align-items: center;
      gap: 0.35rem;
      user-select: none;
      list-style: none;
    }
    .aac-notes-summary::-webkit-details-marker {
      display: none;
    }
    .aac-notes-summary:hover {
      color: var(--bs-primary, #2563eb);
    }

    .aac-notes-body {
      margin-top: 0.4rem;
    }

    .aac-notes-label {
      display: block;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--bs-secondary-color, #64748b);
      margin-bottom: 0.25rem;
    }

    .aac-notes-input {
      width: 100%;
      border: 1px solid var(--border-color, #cbd5e1);
      border-radius: 0.4rem;
      padding: 0.45rem 0.6rem;
      font-size: 0.8rem;
      background: #ffffff;
      color: var(--bs-body-color, #0f172a);
      resize: vertical;
      min-height: 2.75rem;
      transition: border-color 0.15s;
    }
    .aac-notes-input:focus {
      outline: none;
      border-color: var(--bs-primary, #2563eb);
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
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .aac-btn:active { transform: scale(0.97); }
    .aac-btn:disabled { opacity: 0.45; pointer-events: none; }

    .aac-btn-approve {
      background: rgba(34, 197, 94, 0.12);
      color: #16a34a;
      border: 1px solid rgba(34, 197, 94, 0.25);
    }
    .aac-btn-approve:hover {
      background: rgba(34, 197, 94, 0.22);
      color: #15803d;
      border-color: #22c55e;
    }

    .aac-btn-reject {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .aac-btn-reject:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #b91c1c;
      border-color: #ef4444;
    }

    /* ══════════════════════════════════════════════════════════════════════
       DARK MODE TOKENS & OVERRIDES (data-bs-theme="dark")
       ══════════════════════════════════════════════════════════════════════ */

    [data-bs-theme="dark"] .ausencia-approval-card,
    [data-portal-theme="dark"] .ausencia-approval-card {
      background: #1e293b !important;
      border-color: #334155 !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
      color: #cbd5e1;
    }
    [data-bs-theme="dark"] .ausencia-approval-card:hover,
    [data-portal-theme="dark"] .ausencia-approval-card:hover {
      border-color: #3b82f6 !important;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.5);
    }

    [data-bs-theme="dark"] .aac-teacher-name,
    [data-portal-theme="dark"] .aac-teacher-name {
      color: #f8fafc;
    }

    [data-bs-theme="dark"] .aac-teacher-email,
    [data-portal-theme="dark"] .aac-teacher-email {
      color: #94a3b8;
    }

    [data-bs-theme="dark"] .aac-date-row,
    [data-portal-theme="dark"] .aac-date-row {
      color: #e2e8f0;
    }

    [data-bs-theme="dark"] .aac-coverage,
    [data-portal-theme="dark"] .aac-coverage {
      color: #94a3b8;
    }

    [data-bs-theme="dark"] .aac-meta,
    [data-portal-theme="dark"] .aac-meta {
      color: #94a3b8;
    }

    [data-bs-theme="dark"] .aac-motivo,
    [data-portal-theme="dark"] .aac-motivo {
      background: #0f172a;
      border-color: #334155;
      color: #cbd5e1;
    }

    [data-bs-theme="dark"] .aac-btn-doc,
    [data-portal-theme="dark"] .aac-btn-doc {
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      border-color: rgba(59, 130, 246, 0.35);
    }
    [data-bs-theme="dark"] .aac-btn-doc:hover,
    [data-portal-theme="dark"] .aac-btn-doc:hover {
      background: rgba(59, 130, 246, 0.28);
      color: #bfdbfe;
      border-color: #60a5fa;
    }

    [data-bs-theme="dark"] .aac-notes-details,
    [data-portal-theme="dark"] .aac-notes-details {
      background: #0f172a;
      border-color: #334155;
    }

    [data-bs-theme="dark"] .aac-notes-summary,
    [data-portal-theme="dark"] .aac-notes-summary {
      color: #94a3b8;
    }
    [data-bs-theme="dark"] .aac-notes-summary:hover,
    [data-portal-theme="dark"] .aac-notes-summary:hover {
      color: #60a5fa;
    }

    [data-bs-theme="dark"] .aac-notes-label,
    [data-portal-theme="dark"] .aac-notes-label {
      color: #cbd5e1;
    }

    [data-bs-theme="dark"] .aac-notes-input,
    [data-portal-theme="dark"] .aac-notes-input {
      background: #1e293b;
      border-color: #334155;
      color: #f8fafc;
    }
    [data-bs-theme="dark"] .aac-notes-input:focus,
    [data-portal-theme="dark"] .aac-notes-input:focus {
      background: #1e293b;
      border-color: #60a5fa;
    }

    [data-bs-theme="dark"] .aac-btn-approve,
    [data-portal-theme="dark"] .aac-btn-approve {
      background: rgba(34, 197, 94, 0.18);
      color: #4ade80;
      border-color: rgba(74, 222, 128, 0.35);
    }
    [data-bs-theme="dark"] .aac-btn-approve:hover,
    [data-portal-theme="dark"] .aac-btn-approve:hover {
      background: rgba(34, 197, 94, 0.28);
      color: #86efac;
      border-color: #4ade80;
    }

    [data-bs-theme="dark"] .aac-btn-reject,
    [data-portal-theme="dark"] .aac-btn-reject {
      background: rgba(239, 68, 68, 0.18);
      color: #f87171;
      border-color: rgba(248, 113, 113, 0.35);
    }
    [data-bs-theme="dark"] .aac-btn-reject:hover,
    [data-portal-theme="dark"] .aac-btn-reject:hover {
      background: rgba(239, 68, 68, 0.28);
      color: #fca5a5;
      border-color: #f87171;
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
        <span>${escHTML(formatDateRange(ausencia))}</span>
        ${ausencia.duracion_tipo ? `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle ms-auto" style="font-size:0.68rem;">${escHTML(ausencia.duracion_tipo)}</span>` : ''}
      </div>
      <div class="aac-coverage">${getCoverageSummary(ausencia)}</div>
      ${affectedCount > 0 ? `<div class="aac-meta"><span class="text-danger fw-semibold"><i class="bi bi-journal-x"></i> ${affectedCount} clase${affectedCount > 1 ? 's' : ''} afectada${affectedCount > 1 ? 's' : ''}</span></div>` : ''}
      ${ausencia.motivo ? `<div class="aac-motivo">${escHTML(ausencia.motivo)}</div>` : ''}
      
      ${ausencia.archivo_url ? `
        <div class="aac-doc-wrap">
          <a href="${escHTML(ausencia.archivo_url)}" target="_blank" rel="noopener" class="aac-btn-doc" title="Ver comprobante médico o documento oficial">
            <i class="bi bi-paperclip"></i>
            <span>Ver Comprobante / Certificado</span>
            <i class="bi bi-box-arrow-up-right" style="font-size:0.65rem;"></i>
          </a>
        </div>
      ` : ''}

      <div class="aac-meta">
        ${submittedAt ? `<span><i class="bi bi-clock-history"></i> Solicitada el ${submittedAt}</span>` : ''}
      </div>
    </div>

    <div class="aac-notes-wrap">
      <details class="aac-notes-details">
        <summary class="aac-notes-summary">
          <i class="bi bi-pencil-square"></i>
          <span>Agregar nota de decisión (opcional)</span>
        </summary>
        <div class="aac-notes-body">
          <label class="aac-notes-label" for="notes-${escHTML(ausencia.id)}">Nota interna de resolución:</label>
          <textarea
            class="aac-notes-input"
            id="notes-${escHTML(ausencia.id)}"
            data-decision-notes
            rows="2"
            placeholder="Ej: Aprobada con suplente coordinado..."
          ></textarea>
        </div>
      </details>
    </div>

    <div class="aac-actions">
      <button type="button" class="aac-btn aac-btn-approve" data-action="approve" title="Aprobar solicitud de ausencia">
        <i class="bi bi-check-circle-fill"></i> Aprobar
      </button>
      <button type="button" class="aac-btn aac-btn-reject" data-action="reject" title="Rechazar solicitud de ausencia">
        <i class="bi bi-x-circle-fill"></i> Rechazar
      </button>
    </div>
  `

  const getNotes = () => card.querySelector('[data-decision-notes]')?.value?.trim() || ''

  const approveBtn = card.querySelector('[data-action="approve"]')
  const rejectBtn  = card.querySelector('[data-action="reject"]')

  const _cerrarCard = () => {
    card.style.transition = 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)'
    card.style.transform = 'scale(0.96) translateY(-8px)'
    card.style.opacity = '0'
    card.style.maxHeight = `${card.offsetHeight}px`
    requestAnimationFrame(() => {
      card.style.maxHeight = '0px'
      card.style.marginTop = '0px'
      card.style.marginBottom = '0px'
      card.style.paddingTop = '0px'
      card.style.paddingBottom = '0px'
      card.style.overflow = 'hidden'
    })
    setTimeout(() => {
      card.remove()
    }, 330)
  }

  approveBtn.addEventListener('click', async () => {
    approveBtn.disabled = true
    rejectBtn.disabled  = true
    const origHTML = approveBtn.innerHTML
    approveBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Aprobando...'
    try {
      await onApprove(ausencia.id, getNotes())
      _cerrarCard()
    } catch (err) {
      approveBtn.disabled = false
      rejectBtn.disabled  = false
      approveBtn.innerHTML = origHTML
    }
  })

  rejectBtn.addEventListener('click', async () => {
    approveBtn.disabled = true
    rejectBtn.disabled  = true
    const origHTML = rejectBtn.innerHTML
    rejectBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Rechazando...'
    try {
      await onReject(ausencia.id, getNotes())
      _cerrarCard()
    } catch (err) {
      approveBtn.disabled = false
      rejectBtn.disabled  = false
      rejectBtn.innerHTML = origHTML
    }
  })

  return card
}
