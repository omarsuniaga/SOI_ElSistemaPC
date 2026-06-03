/**
 * coberturaModal.js — When a teacher marks a plan as "ejecutado",
 * this modal shows AI-extracted coverage per student for confirmation.
 *
 * Usage:
 *   openCoberturaModal({ plan, claseId, instrumento, nivel, maestroId, onConfirm, onSkip })
 *
 * onConfirm() is called after teacher saves coverage.
 * onSkip() is called if teacher clicks "Saltar".
 */
import { obtenerCurriculo } from '../api/curriculoApi.js'
import { obtenerRuta } from '../api/rutasApi.js'
import { upsertCobertura } from '../api/coberturaApi.js'
import { extraerCobertura } from '../api/groqService.js'
import { parseDsl } from '../utils/dslParser.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { supabase } from '../../../lib/supabaseClient.js'

const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )

const STYLE = `
<style id="cobertura-modal-style">
.cob-alumno-block { border: 1px solid var(--bs-border-color); border-radius:8px; padding:.75rem; margin-bottom:.75rem; }
.cob-alumno-name { font-weight:600; margin-bottom:.5rem; }
.cob-obj-row { display:flex; align-items:center; gap:.5rem; margin-bottom:.25rem; font-size:.875rem; }
.cob-nivel-sel { width: auto; font-size:.8rem; }
.cob-ai-badge { font-size:.7rem; color: var(--bs-warning-text-emphasis); }
</style>`

export async function openCoberturaModal({
  plan,
  claseId,
  instrumento,
  nivel,
  maestroId,
  onConfirm,
  onSkip,
}) {
  const el = document.createElement('div')
  el.innerHTML = `${STYLE}
    <div class="modal fade" id="cob-modal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-check2-circle me-2 text-success"></i>Cobertura Curricular</h5>
          </div>
          <div class="modal-body" id="cob-body">
            <div class="text-center py-5">
              <div class="spinner-border text-primary mb-3"></div>
              <div class="text-muted small">Analizando el plan con IA...</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary btn-sm" id="cob-btn-skip">Saltar</button>
            <button class="btn btn-success btn-sm" id="cob-btn-confirm" disabled>
              <i class="bi bi-check2 me-1"></i>Confirmar y ejecutar
            </button>
          </div>
        </div>
      </div>
    </div>`
  document.body.appendChild(el)
  const modalEl = el.querySelector('#cob-modal')
  const modal = new bootstrap.Modal(modalEl)

  let coverageState = []

  el.querySelector('#cob-btn-skip').addEventListener('click', () => {
    modal.hide()
    onSkip?.()
  })

  el.querySelector('#cob-btn-confirm').addEventListener('click', async () => {
    const toSave = coverageState
      .filter((r) => r.checked)
      .map((r) => ({
        alumno_id: r.alumno_id,
        objetivo_id: r.objetivo_id,
        plan_id: plan.id,
        maestro_id: maestroId,
        nivel: r.nivel,
        confirmado: true,
        fecha: plan.fecha_inicio || new Date().toISOString().slice(0, 10),
      }))

    try {
      if (toSave.length > 0) await upsertCobertura(toSave)
      AppToast.success('Cobertura registrada')
      modal.hide()
      onConfirm?.()
    } catch (err) {
      AppToast.error(err.message)
    }
  })

  modalEl.addEventListener('hidden.bs.modal', () => el.remove())
  modal.show()

  try {
    let todosObjetivos = []
    let ruta = null

    // Try to get clase and its ruta first
    if (claseId) {
      const { data: claseData } = await supabase
        .from('clases')
        .select('ruta_id')
        .eq('id', claseId)
        .single()

      if (claseData?.ruta_id) {
        ruta = await obtenerRuta(claseData.ruta_id)
        // Map ruta objectives to match curriculum structure
        todosObjetivos = ruta.objetivos.map((o) => ({
          id: o.objetivo_id,
          descripcion: o.descripcion,
          pilar_nombre: null,
        }))
      }
    }

    // Fallback to generic curriculum if no ruta
    let curriculo = null
    if (todosObjetivos.length === 0 && instrumento && nivel) {
      curriculo = await obtenerCurriculo(instrumento, nivel)
      if (curriculo) {
        todosObjetivos = curriculo.curriculo_pilares.flatMap((p) =>
          p.curriculo_objetivos.map((o) => ({ ...o, pilar_nombre: p.nombre })),
        )
      }
    }

    const dslText = plan.notas_dsl || plan.contenido || ''
    const parsed = parseDsl(dslText)
    const alumnosEnDsl = parsed.alumnos || []

    let alumnosConId = []
    if (alumnosEnDsl.length > 0 || claseId) {
      const { data: todos } = await supabase.from('alumnos').select('id, nombre_completo')
      if (alumnosEnDsl.length > 0) {
        alumnosConId = (todos || []).filter((a) =>
          alumnosEnDsl.some((n) => a.nombre_completo.toLowerCase().includes(n.toLowerCase())),
        )
      }
    }

    if (alumnosConId.length === 0 && claseId) {
      const { data } = await supabase
        .from('alumnos_clases')
        .select('alumnos(id, nombre_completo)')
        .eq('clase_id', claseId)
      alumnosConId = (data || []).map((r) => r.alumnos).filter(Boolean)
    }

    let aiCoberturas = []
    if (curriculo && todosObjetivos.length > 0) {
      const result = await extraerCobertura(
        {
          tema: plan.tema,
          objetivos: plan.objetivos,
          contenido: plan.contenido,
          notas_dsl: plan.notas_dsl,
        },
        alumnosEnDsl,
        todosObjetivos.map((o) => ({ id: o.id, descripcion: o.descripcion })),
      )
      aiCoberturas = result.coberturas || []
    }

    coverageState = []
    alumnosConId.forEach((alumno) => {
      todosObjetivos.forEach((obj) => {
        const aiMatch = aiCoberturas.find(
          (c) =>
            c.objetivo_id === obj.id &&
            alumno.nombre_completo.toLowerCase().includes((c.alumno || '').toLowerCase()),
        )
        coverageState.push({
          alumno_id: alumno.id,
          alumno_nombre: alumno.nombre_completo,
          objetivo_id: obj.id,
          obj_descripcion: obj.descripcion,
          pilar_nombre: obj.pilar_nombre,
          nivel: aiMatch?.nivel || 'en_proceso',
          checked: !!aiMatch,
          ai_suggested: !!aiMatch,
          razon: aiMatch?.razon || '',
        })
      })
    })

    _renderBody()
    el.querySelector('#cob-btn-confirm').disabled = false
  } catch (err) {
    document.getElementById('cob-body').innerHTML = `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se pudo analizar automáticamente: ${err.message}
        <br><small>Podés saltar este paso o confirmar sin cobertura.</small>
      </div>`
    el.querySelector('#cob-btn-confirm').disabled = false
  }

  function _renderBody() {
    const body = document.getElementById('cob-body')

    if (!coverageState.length) {
      body.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          No hay ruta de contenidos asignada o currículo activo, o no se encontraron alumnos.
          Podés saltar este paso.
        </div>`
      return
    }

    const byAlumno = {}
    coverageState.forEach((r) => {
      if (!byAlumno[r.alumno_id]) byAlumno[r.alumno_id] = { nombre: r.alumno_nombre, rows: [] }
      byAlumno[r.alumno_id].rows.push(r)
    })

    body.innerHTML = `
      <p class="text-muted small mb-3">
        <i class="bi bi-robot me-1"></i>
        La IA pre-marcó los objetivos que probablemente se cubrieron. Revisá y ajustá según corresponda.
      </p>
      ${Object.entries(byAlumno)
        .map(
          ([alumnoId, { nombre, rows }]) => `
        <div class="cob-alumno-block">
          <div class="cob-alumno-name"><i class="bi bi-person me-1"></i>${escapeHTML(nombre)}</div>
          ${rows
            .map((r) => {
              const idx = coverageState.indexOf(r)
              return `
            <div class="cob-obj-row">
              <input type="checkbox" class="form-check-input cob-check" data-idx="${idx}" ${r.checked ? 'checked' : ''}>
              <span style="flex:1">
                <span class="text-muted small">${escapeHTML(r.pilar_nombre)} /</span> ${escapeHTML(r.obj_descripcion)}
                ${r.ai_suggested ? `<span class="cob-ai-badge ms-1"><i class="bi bi-stars"></i> IA</span>` : ''}
              </span>
              <select class="form-select form-select-sm cob-nivel-sel" data-idx="${idx}" ${!r.checked ? 'disabled' : ''}>
                <option value="iniciando" ${r.nivel === 'iniciando' ? 'selected' : ''}>Iniciando</option>
                <option value="en_proceso" ${r.nivel === 'en_proceso' ? 'selected' : ''}>En proceso</option>
                <option value="logrado" ${r.nivel === 'logrado' ? 'selected' : ''}>Logrado</option>
              </select>
            </div>`
            })
            .join('')}
        </div>`,
        )
        .join('')}`

    body.querySelectorAll('.cob-check').forEach((chk) => {
      chk.addEventListener('change', () => {
        const idx = +chk.dataset.idx
        coverageState[idx].checked = chk.checked
        const sel = body.querySelector(`.cob-nivel-sel[data-idx="${idx}"]`)
        if (sel) sel.disabled = !chk.checked
      })
    })

    body.querySelectorAll('.cob-nivel-sel').forEach((sel) => {
      sel.addEventListener('change', () => {
        coverageState[+sel.dataset.idx].nivel = sel.value
      })
    })
  }
}
