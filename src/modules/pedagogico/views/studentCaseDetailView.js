import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import {
  getStudentCaseById, listCaseEvents,
  changeCaseStatus, changeRiskLevel,
  closeStudentCase, archiveStudentCase, escalateStudentCase,
} from '../services/studentCasesService.js'
import { listCaseActions } from '../services/caseActionsService.js'
import { analyzeStudentRisk } from '../services/studentRiskDetectorService.js'
import { openCaseActionModal } from '../components/CaseActionModal.js'
import { openCaseLetterModal }  from '../components/CaseLetterModal.js'

const state = {
  container: null,
  caseId:    null,
  caso:      null,
  alumno:    null,
  events:    [],
  actions:   [],
  documents: [],
  evidence:  null,
}

const RIESGO_BADGE = {
  bajo:    'bg-info-subtle text-info-emphasis',
  medio:   'bg-warning-subtle text-warning-emphasis',
  alto:    'bg-warning text-dark',
  critico: 'bg-danger text-white',
}
const ESTADO_BADGE = {
  abierto:        'bg-primary-subtle text-primary-emphasis',
  en_seguimiento: 'bg-warning-subtle text-warning-emphasis',
  resuelto:       'bg-success-subtle text-success-emphasis',
  escalado:       'bg-danger-subtle text-danger-emphasis',
  archivado:      'bg-secondary-subtle text-secondary-emphasis',
}
const ACTION_ICON = {
  llamada_representante:  'bi-telephone',
  reunion_representante:  'bi-people',
  reunion_alumno:         'bi-person',
  acuerdo_compromiso:     'bi-handshake',
  carta_generada:         'bi-file-earmark-text',
  nota_interna:           'bi-sticky',
  devolucion_instrumento: 'bi-music-note-list',
}

function _parseCaseId() {
  const hash = window.location.hash || ''
  const qsIdx = hash.indexOf('?')
  if (qsIdx === -1) return null
  const params = new URLSearchParams(hash.slice(qsIdx + 1))
  return params.get('id')
}

export async function renderStudentCaseDetailView(container) {
  if (!container) return
  state.container = container
  state.caseId    = _parseCaseId()

  if (!state.caseId) {
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">No se especificó caso (esperaba ?id=UUID).</div></div>`
    return
  }

  container.innerHTML = `<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>`
  await _load()
}

async function _load() {
  try {
    state.caso = await getStudentCaseById(state.caseId)
    const [events, actions, alumno, evidence, documents] = await Promise.all([
      listCaseEvents(state.caseId),
      listCaseActions(state.caseId),
      state.caso.alumno_id
        ? supabase.from('alumnos').select('*').eq('id', state.caso.alumno_id).single().then(r => r.data)
        : null,
      state.caso.alumno_id
        ? analyzeStudentRisk(state.caso.alumno_id)
        : null,
      state.caso.alumno_id
        ? supabase.from('generated_documents').select('*').eq('alumno_id', state.caso.alumno_id).order('created_at', { ascending: false }).then(r => r.data || [])
        : Promise.resolve([]),
    ])
    state.events    = events
    state.actions   = actions
    state.alumno    = alumno
    state.evidence  = evidence
    state.documents = documents
    _render()
  } catch (err) {
    console.error('[caseDetail]', err)
    state.container.innerHTML = `<div class="page-container"><div class="alert alert-warning">Error: ${err.message}</div></div>`
  }
}

function _render() {
  const c  = state.caso
  const a  = state.alumno
  const ev = state.evidence

  state.container.innerHTML = `
    <div class="page-container">
      <div class="mb-3">
        <button class="btn btn-sm btn-outline-secondary" id="btn-back-list"><i class="bi bi-arrow-left me-1"></i>Volver al listado</button>
      </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex align-items-start gap-3 mb-3">
            <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width:48px;height:48px;">
              <i class="bi bi-folder2-open fs-4"></i>
            </div>
            <div class="flex-grow-1">
              <h4 class="mb-1 fw-bold">${c.titulo}</h4>
              <div class="text-muted small">
                <span class="me-3"><i class="bi bi-person me-1"></i>${c.alumno_nombre || '—'}</span>
                <span class="me-3">${(c.tipo || '').replace(/_/g, ' ')}</span>
                <span class="me-3"><i class="bi bi-calendar3 me-1"></i>Abierto: ${c.fecha_apertura}</span>
                ${c.fecha_cierre ? `<span class="me-3"><i class="bi bi-check-circle me-1"></i>Cerrado: ${c.fecha_cierre}</span>` : ''}
              </div>
            </div>
            <div class="d-flex flex-column align-items-end gap-1 flex-shrink-0">
              <span class="badge ${RIESGO_BADGE[c.nivel_riesgo]}">Riesgo: ${c.nivel_riesgo}</span>
              <span class="badge ${ESTADO_BADGE[c.estado]}">${(c.estado || '').replace(/_/g, ' ')}</span>
            </div>
          </div>

          ${c.descripcion ? `<p class="small mb-3">${c.descripcion}</p>` : ''}

          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-primary"           id="btn-act-call"><i class="bi bi-telephone me-1"></i>Registrar llamada</button>
            <button class="btn btn-sm btn-primary"           id="btn-act-meeting"><i class="bi bi-people me-1"></i>Registrar reunión</button>
            <button class="btn btn-sm btn-outline-primary"   id="btn-act-agreement"><i class="bi bi-handshake me-1"></i>Registrar acuerdo</button>
            <button class="btn btn-sm btn-success"           id="btn-act-letter"><i class="bi bi-file-earmark-text me-1"></i>Generar carta</button>
            <button class="btn btn-sm btn-outline-secondary" id="btn-act-note"><i class="bi bi-sticky me-1"></i>Nota interna</button>
            <span class="vr"></span>
            <button class="btn btn-sm btn-outline-warning"   id="btn-change-status"><i class="bi bi-arrow-repeat me-1"></i>Cambiar estado</button>
            <button class="btn btn-sm btn-outline-warning"   id="btn-change-risk"><i class="bi bi-shield me-1"></i>Cambiar riesgo</button>
            <button class="btn btn-sm btn-success"           id="btn-resolve"><i class="bi bi-check-circle me-1"></i>Resolver</button>
            <button class="btn btn-sm btn-danger"            id="btn-escalate"><i class="bi bi-arrow-up-circle me-1"></i>Escalar</button>
            <button class="btn btn-sm btn-secondary"         id="btn-archive"><i class="bi bi-archive me-1"></i>Archivar</button>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-header bg-light fw-semibold small"><i class="bi bi-person-vcard me-2"></i>Datos del alumno</div>
            <div class="card-body small">
              ${a ? `
                <div class="mb-1"><strong>Instrumento:</strong> ${a.instrumento_principal || '—'}</div>
                <div class="mb-1"><strong>Nivel:</strong> ${a.nivel_actual || a.nivel || '—'}</div>
                <hr class="my-2">
                <div class="mb-1"><strong>Representante:</strong> ${a.representante_nombre || '—'}</div>
                <div class="mb-1"><strong>Teléfono:</strong> ${a.representante_tlf || '—'}</div>
                <div class="mb-1"><strong>Correo:</strong> ${a.correo_representante || '—'}</div>
                <hr class="my-2">
                <div class="mb-1"><strong>Centro:</strong> ${a.centro_estudios || '—'}</div>
                <div><strong>Grado:</strong> ${a.grado_nivel || '—'}</div>
              ` : '<em class="text-muted">Sin datos del alumno.</em>'}
            </div>
          </div>

          ${ev ? `
            <div class="card border-0 shadow-sm mb-3">
              <div class="card-header bg-light fw-semibold small"><i class="bi bi-clipboard-data me-2"></i>Evidencia del mes</div>
              <div class="card-body small">
                <div class="d-flex justify-content-between mb-1"><span>Ausencias injustificadas</span><strong>${ev.evidencia.ausenciasInjustificadas}</strong></div>
                <div class="d-flex justify-content-between mb-1"><span>Tardanzas</span><strong>${ev.evidencia.tardanzas}</strong></div>
                <div class="d-flex justify-content-between mb-1"><span>Justif. pendientes</span><strong>${ev.evidencia.justificacionesPendientes}</strong></div>
                <div class="d-flex justify-content-between mb-1"><span>Observ. seguimiento</span><strong>${ev.evidencia.observacionesSeguimiento}</strong></div>
                <div class="d-flex justify-content-between"><span>Cartas previas</span><strong>${ev.evidencia.cartasPrevias}</strong></div>
                ${ev.accionSugerida ? `<hr class="my-2"><div class="text-primary small fst-italic">Sugerencia: ${ev.accionSugerida}</div>` : ''}
              </div>
            </div>` : ''}
        </div>

        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-header bg-light fw-semibold small"><i class="bi bi-clock-history me-2"></i>Timeline institucional</div>
            <div class="card-body p-0">
              ${state.events.length === 0 ? '<div class="p-3 text-muted small fst-italic">Sin eventos registrados.</div>' :
                state.events.map(e => `
                  <div class="d-flex gap-3 px-3 py-2 border-bottom">
                    <div class="flex-shrink-0 text-primary"><i class="bi bi-circle-fill" style="font-size:0.6rem;"></i></div>
                    <div class="flex-grow-1">
                      <div class="small fw-semibold">${e.titulo}</div>
                      <div class="text-muted" style="font-size:0.72rem;">
                        ${new Date(e.created_at).toLocaleString('es-DO')} · ${(e.tipo || '').replace(/_/g, ' ')}
                      </div>
                      ${e.descripcion ? `<div class="small mt-1">${e.descripcion}</div>` : ''}
                    </div>
                  </div>`).join('')}
            </div>
          </div>

          <div class="card border-0 shadow-sm mb-3">
            <div class="card-header bg-light fw-semibold small"><i class="bi bi-list-check me-2"></i>Acciones registradas (${state.actions.length})</div>
            <div class="card-body p-0">
              ${state.actions.length === 0 ? '<div class="p-3 text-muted small fst-italic">Sin acciones registradas.</div>' :
                state.actions.map(act => `
                  <div class="d-flex gap-3 px-3 py-2 border-bottom">
                    <div class="flex-shrink-0 text-primary"><i class="bi ${ACTION_ICON[act.tipo] || 'bi-dot'}"></i></div>
                    <div class="flex-grow-1">
                      <div class="small fw-semibold">${act.titulo}</div>
                      <div class="text-muted" style="font-size:0.72rem;">${new Date(act.fecha_accion).toLocaleString('es-DO')} · ${(act.tipo || '').replace(/_/g, ' ')}</div>
                      ${act.descripcion ? `<div class="small mt-1">${act.descripcion}</div>` : ''}
                      ${act.resultado ? `<div class="small mt-1 text-muted"><strong>Resultado:</strong> ${act.resultado}</div>` : ''}
                      ${act.proxima_accion ? `<div class="small mt-1 text-primary"><i class="bi bi-arrow-right me-1"></i>${act.proxima_accion}${act.proxima_accion_fecha ? ` (${act.proxima_accion_fecha})` : ''}</div>` : ''}
                    </div>
                  </div>`).join('')}
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light fw-semibold small"><i class="bi bi-folder me-2"></i>Documentos asociados (${state.documents.length})</div>
            <div class="card-body p-0">
              ${state.documents.length === 0 ? '<div class="p-3 text-muted small fst-italic">Sin documentos generados.</div>' :
                state.documents.map(d => `
                  <div class="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="small fw-semibold text-truncate">${d.titulo}</div>
                      <div class="text-muted" style="font-size:0.72rem;">${(d.tipo || '').replace(/_/g, ' ')} · ${new Date(d.created_at).toLocaleDateString('es-DO')}</div>
                    </div>
                    <span class="badge bg-secondary-subtle text-secondary-emphasis ms-2 flex-shrink-0">${d.estado}</span>
                  </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`

  _attachEvents()
}

function _attachEvents() {
  const c = state.container
  c.querySelector('#btn-back-list')?.addEventListener('click', () => router.navigate('pedagogico-seguimiento-institucional'))

  c.querySelector('#btn-act-call')?.addEventListener('click', () => openCaseActionModal('llamada', state.caso, _load))
  c.querySelector('#btn-act-meeting')?.addEventListener('click', () => openCaseActionModal('reunion', state.caso, _load))
  c.querySelector('#btn-act-agreement')?.addEventListener('click', () => openCaseActionModal('acuerdo', state.caso, _load))
  c.querySelector('#btn-act-note')?.addEventListener('click', () => openCaseActionModal('nota', state.caso, _load))
  c.querySelector('#btn-act-letter')?.addEventListener('click', () => openCaseLetterModal(state.caso, state.alumno, _load))

  c.querySelector('#btn-change-status')?.addEventListener('click', _openStatusModal)
  c.querySelector('#btn-change-risk')?.addEventListener('click', _openRiskModal)
  c.querySelector('#btn-resolve')?.addEventListener('click', _openResolveModal)
  c.querySelector('#btn-escalate')?.addEventListener('click', _openEscalateModal)
  c.querySelector('#btn-archive')?.addEventListener('click', _openArchiveModal)
}

function _openStatusModal() {
  AppModal.open({
    title: 'Cambiar estado del caso',
    size:  'sm',
    saveText: 'Guardar',
    body: `
      <div class="small">
        <label class="form-label fw-semibold">Nuevo estado</label>
        <select class="form-select form-select-sm" id="ms-estado">
          <option value="abierto"        ${state.caso.estado === 'abierto'        ? 'selected' : ''}>Abierto</option>
          <option value="en_seguimiento" ${state.caso.estado === 'en_seguimiento' ? 'selected' : ''}>En seguimiento</option>
          <option value="resuelto"       ${state.caso.estado === 'resuelto'       ? 'selected' : ''}>Resuelto</option>
          <option value="escalado"       ${state.caso.estado === 'escalado'       ? 'selected' : ''}>Escalado</option>
          <option value="archivado"      ${state.caso.estado === 'archivado'      ? 'selected' : ''}>Archivado</option>
        </select>
        <label class="form-label fw-semibold mt-2">Nota</label>
        <textarea class="form-control form-control-sm" id="ms-notes" rows="2"></textarea>
      </div>`,
    onSave: async () => {
      const estado = document.querySelector('#ms-estado')?.value
      const notes  = document.querySelector('#ms-notes')?.value || ''
      await changeCaseStatus(state.caso.id, estado, notes); await _load(); return true
    },
  })
}

function _openRiskModal() {
  AppModal.open({
    title: 'Cambiar nivel de riesgo',
    size:  'sm',
    saveText: 'Guardar',
    body: `
      <div class="small">
        <label class="form-label fw-semibold">Nuevo nivel</label>
        <select class="form-select form-select-sm" id="mr-riesgo">
          <option value="bajo"    ${state.caso.nivel_riesgo === 'bajo'    ? 'selected' : ''}>Bajo</option>
          <option value="medio"   ${state.caso.nivel_riesgo === 'medio'   ? 'selected' : ''}>Medio</option>
          <option value="alto"    ${state.caso.nivel_riesgo === 'alto'    ? 'selected' : ''}>Alto</option>
          <option value="critico" ${state.caso.nivel_riesgo === 'critico' ? 'selected' : ''}>Crítico</option>
        </select>
        <label class="form-label fw-semibold mt-2">Justificación</label>
        <textarea class="form-control form-control-sm" id="mr-notes" rows="2"></textarea>
      </div>`,
    onSave: async () => {
      const nivel = document.querySelector('#mr-riesgo')?.value
      const notes = document.querySelector('#mr-notes')?.value || ''
      await changeRiskLevel(state.caso.id, nivel, notes); await _load(); return true
    },
  })
}

function _openResolveModal() {
  AppModal.open({
    title: 'Resolver caso',
    size:  'md',
    saveText: 'Marcar como resuelto',
    body: `
      <div class="small">
        <label class="form-label fw-semibold">Resumen de resolución</label>
        <textarea class="form-control form-control-sm" id="mres-notes" rows="4" placeholder="Describí cómo se resolvió el caso..."></textarea>
      </div>`,
    onSave: async () => {
      const notes = document.querySelector('#mres-notes')?.value?.trim() || ''
      await closeStudentCase(state.caso.id, notes); await _load(); return true
    },
  })
}

function _openEscalateModal() {
  AppModal.open({
    title: 'Escalar caso a directiva',
    size:  'md',
    saveText: 'Escalar',
    body: `
      <div class="small">
        <label class="form-label fw-semibold">Motivo del escalamiento</label>
        <textarea class="form-control form-control-sm" id="mes-notes" rows="4" placeholder="Explicá por qué se escala..."></textarea>
      </div>`,
    onSave: async () => {
      const notes = document.querySelector('#mes-notes')?.value?.trim() || ''
      await escalateStudentCase(state.caso.id, notes); await _load(); return true
    },
  })
}

function _openArchiveModal() {
  AppModal.open({
    title: 'Archivar caso',
    size:  'sm',
    saveText: 'Archivar',
    body: `
      <div class="small">
        <p>¿Confirmás archivar este caso? El caso quedará oculto en el listado activo pero permanecerá en el historial.</p>
        <label class="form-label fw-semibold">Nota de archivado (opcional)</label>
        <textarea class="form-control form-control-sm" id="marc-notes" rows="2"></textarea>
      </div>`,
    onSave: async () => {
      const notes = document.querySelector('#marc-notes')?.value || ''
      await archiveStudentCase(state.caso.id, notes); await _load(); return true
    },
  })
}
