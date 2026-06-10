import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { analyzeAllStudentsRisk } from '../services/studentRiskDetectorService.js'
import { createStudentCase } from '../services/studentCasesService.js'

const RIESGO_BADGE = {
  bajo: 'bg-success text-white',
  medio: 'bg-warning text-dark',
  alto: 'bg-danger text-white',
  critico: 'bg-dark text-white',
}

let _container = null

export async function renderCockpitDirectorView(container) {
  if (!container) return
  _container = container
  container.innerHTML = _skeleton()
  try {
    const [kpis, alumnos, alumnosConProblemas, casosActivos] = await Promise.all([
      _fetchKPIs(),
      _fetchAlumnosConPerfil(),
      _fetchAlumnosConProblemas(),
      _fetchCasosActivos(),
    ])
    const riesgos = await _fetchRiesgos(alumnos)
    container.innerHTML = _render(kpis, alumnos, alumnosConProblemas, casosActivos, riesgos)
    _attachEvents()
  } catch (err) {
    console.error('[cockpitDirector]', err)
    container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar el Cockpit: ${err.message}</div>
      </div>`
  }
}

function _skeleton() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center justify-content-center" style="min-height:300px;">
        <div class="spinner-border text-primary"></div>
      </div>
    </div>`
}

async function _fetchKPIs() {
  const [alumnos, perfiles, problemas, casos] = await Promise.all([
    supabase.from('alumnos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase
      .from('perfil_conocimiento')
      .select('alumno_id', { count: 'exact', head: true })
      .neq('estado', 'descartado'),
    supabase
      .from('perfil_conocimiento')
      .select('alumno_id')
      .eq('dimension', 'problema')
      .eq('estado', 'confirmado'),
    supabase
      .from('student_case_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'pendiente'),
  ])

  const problemasAlumnos = new Set((problemas.data || []).map((p) => p.alumno_id))

  return {
    totalAlumnos: alumnos.count || 0,
    conPerfil: perfiles.count || 0,
    conProblemas: problemasAlumnos.size,
    casosPendientes: casos.count || 0,
  }
}

async function _fetchAlumnosConPerfil() {
  const { data } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, instrumento_principal, nivel_actual')
    .eq('activo', true)
    .order('nombre_completo')
  return data || []
}

async function _fetchAlumnosConProblemas() {
  const { data } = await supabase
    .from('perfil_conocimiento')
    .select('alumno_id, item')
    .eq('dimension', 'problema')
    .eq('estado', 'confirmado')
  if (!data) return {}

  const map = {}
  for (const row of data) {
    if (!map[row.alumno_id]) map[row.alumno_id] = { count: 0, items: [] }
    map[row.alumno_id].count++
    map[row.alumno_id].items.push(row.item)
  }
  return map
}

async function _fetchCasosActivos() {
  const { data } = await supabase
    .from('student_case_alerts')
    .select('alumno_id, id, nivel_riesgo, estado')
    .eq('estado', 'pendiente')
  if (!data) return {}

  const map = {}
  for (const row of data) {
    if (!map[row.alumno_id]) map[row.alumno_id] = []
    map[row.alumno_id].push(row)
  }
  return map
}

async function _fetchRiesgos(alumnos) {
  try {
    const riesgos = await analyzeAllStudentsRisk()
    const map = {}
    for (const r of riesgos || []) {
      map[r.alumnoId] = r
    }
    return map
  } catch (err) {
    console.warn('[cockpitDirector] Risk analysis failed:', err)
    return {}
  }
}

function _formatCount(count) {
  return count > 99 ? '99+' : String(count)
}

function _render(kpis, alumnos, problemasMap, casosMap, riesgosMap) {
  const rows = alumnos
    .map((a) => {
      const riesgo = riesgosMap[a.id]
      const problemas = problemasMap[a.id]
      const casos = casosMap[a.id] || []
      const hasRiesgo = riesgo?.nivelRiesgo != null

      return {
        id: a.id,
        nombre: a.nombre_completo,
        instrumento: a.instrumento_principal || '—',
        nivel: a.nivel_actual || '—',
        nivelRiesgo: riesgo?.nivelRiesgo || null,
        score: riesgo?.score || 0,
        problemaCount: problemas?.count || 0,
        problemaItems: problemas?.items || [],
        casosActivos: casos,
        razones: riesgo?.razones || [],
      }
    })
    .sort((x, y) => {
      // Sort: riesgo first (by score desc), then problem count desc
      if (y.score !== x.score) return y.score - x.score
      return y.problemaCount - x.problemaCount
    })

  const rowsHtml = rows
    .map(
      (r) => `
    <tr>
      <td>
        <a href="#" class="text-decoration-none fw-semibold" data-nav-perfil="${r.id}">${r.nombre}</a>
        <div class="text-muted" style="font-size:0.72rem;">${r.instrumento} · Nivel ${r.nivel}</div>
      </td>
      <td class="text-center">
        ${r.nivelRiesgo ? `<span class="badge ${RIESGO_BADGE[r.nivelRiesgo]}">${r.nivelRiesgo}</span>` : '<span class="text-muted">—</span>'}
      </td>
      <td class="text-center">
        ${r.problemaCount > 0 ? `<span class="badge bg-danger-subtle text-danger-emphasis">${r.problemaCount}</span>` : '<span class="text-muted">0</span>'}
      </td>
      <td class="text-center">
        ${r.casosActivos.length > 0 ? `<span class="badge bg-warning-subtle text-warning-emphasis">${r.casosActivos.length} activo${r.casosActivos.length !== 1 ? 's' : ''}</span>` : '<span class="text-muted">—</span>'}
      </td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary" data-nav-perfil="${r.id}" title="Ver perfil de conocimiento"><i class="bi bi-person-lines-fill"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-amonester="${r.id}" data-nombre="${r.nombre}" title="Amonestar / abrir caso"><i class="bi bi-exclamation-triangle"></i></button>
        </div>
      </td>
    </tr>`,
    )
    .join('')

  return `
    <div class="page-container">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <h4 class="fw-bold mb-0"><i class="bi bi-speedometer2 me-2"></i>Cockpit del Director</h4>
        <div class="text-muted small">Vista ejecutiva del perfil de conocimiento y riesgos</div>
      </div>

      <!-- KPI Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px;">
                <i class="bi bi-people fs-5"></i>
              </div>
              <div>
                <div class="fs-4 fw-bold">${_formatCount(kpis.totalAlumnos)}</div>
                <div class="text-muted small">Alumnos activos</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px;">
                <i class="bi bi-clipboard-data fs-5"></i>
              </div>
              <div>
                <div class="fs-4 fw-bold">${_formatCount(kpis.conPerfil)}</div>
                <div class="text-muted small">Con perfil de conoc.</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="rounded-3 bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px;">
                <i class="bi bi-exclamation-triangle fs-5"></i>
              </div>
              <div>
                <div class="fs-4 fw-bold">${_formatCount(kpis.conProblemas)}</div>
                <div class="text-muted small">Con problemas</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px;height:44px;">
                <i class="bi bi-shield-exclamation fs-5"></i>
              </div>
              <div>
                <div class="fs-4 fw-bold">${_formatCount(kpis.casosPendientes)}</div>
                <div class="text-muted small">Casos pendientes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search / Filter -->
      <div class="row g-2 mb-3 align-items-center">
        <div class="col-md-5">
          <input type="text" class="form-control form-control-sm" id="cockpit-search" placeholder="Buscar alumno..." />
        </div>
        <div class="col-md-3">
          <select class="form-select form-select-sm" id="cockpit-filtro-riesgo">
            <option value="">Todos los niveles</option>
            <option value="critico">Crítico</option>
            <option value="alto">Alto</option>
            <option value="medio">Medio</option>
            <option value="bajo">Bajo</option>
            <option value="sin-riesgo">Sin riesgo</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select form-select-sm" id="cockpit-filtro-problemas">
            <option value="">Cualquier problema</option>
            <option value="con">Con problemas</option>
            <option value="sin">Sin problemas</option>
          </select>
        </div>
        <div class="col-md-2 d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary flex-grow-1" id="cockpit-analizar"><i class="bi bi-arrow-repeat me-1"></i>Analizar</button>
        </div>
      </div>

      <!-- Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle" style="font-size:0.88rem;">
              <thead class="table-light small">
                <tr>
                  <th style="width:35%;">Alumno</th>
                  <th class="text-center" style="width:12%;">Riesgo</th>
                  <th class="text-center" style="width:12%;">Problemas</th>
                  <th class="text-center" style="width:15%;">Caso activo</th>
                  <th style="width:26%;">Acción</th>
                </tr>
              </thead>
              <tbody id="cockpit-tbody">
                ${rows.length > 0 ? rowsHtml : '<tr><td colspan="5" class="text-center text-muted py-4 small"><i class="bi bi-inbox me-2"></i>No hay alumnos con datos de perfil o riesgo.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="text-muted small mt-2 text-end">
        Mostrando ${rows.length} alumno${rows.length !== 1 ? 's' : ''}
      </div>
    </div>`
}

function _attachEvents() {
  const c = _container
  if (!c) return

  // Nav to perfil
  c.querySelectorAll('[data-nav-perfil]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const id = el.dataset.navPerfil
      if (id) router.navigate(`pedagogico-perfil?alumnoId=${id}`)
    })
  })

  // Amonestar
  c.querySelectorAll('[data-amonester]').forEach((el) => {
    el.addEventListener('click', () => {
      const alumnoId = el.dataset.amonester
      const nombre = el.dataset.nombre
      _openAmonestarModal(alumnoId, nombre)
    })
  })

  // Analizar riesgos
  c.querySelector('#cockpit-analizar')?.addEventListener('click', async () => {
    const btn = c.querySelector('#cockpit-analizar')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Analizando...'
    try {
      await analyzeAllStudentsRisk()
      await renderCockpitDirectorView(_container)
    } catch (err) {
      console.error('[cockpitDirector] analyze error:', err)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Analizar'
    }
  })

  // Search
  c.querySelector('#cockpit-search')?.addEventListener('input', (e) => _filterTable())
  c.querySelector('#cockpit-filtro-riesgo')?.addEventListener('change', () => _filterTable())
  c.querySelector('#cockpit-filtro-problemas')?.addEventListener('change', () => _filterTable())
}

function _filterTable() {
  const c = _container
  const search = (c.querySelector('#cockpit-search')?.value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const riesgo = c.querySelector('#cockpit-filtro-riesgo')?.value || ''
  const problemas = c.querySelector('#cockpit-filtro-problemas')?.value || ''

  c.querySelectorAll('#cockpit-tbody tr').forEach((row) => {
    const txt = row.textContent
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const riesgoTd =
      row.querySelector('td:nth-child(2) .badge')?.textContent?.trim().toLowerCase() || ''
    const problemaTd = row.querySelector('td:nth-child(3) .badge')?.textContent?.trim() || '0'

    const matchSearch = !search || txt.includes(search)
    const matchRiesgo = !riesgo || riesgo === 'sin-riesgo' ? !riesgoTd : riesgoTd === riesgo
    const matchProblemas =
      !problemas || (problemas === 'con' ? problemaTd !== '0' : problemaTd === '0')

    row.style.display = matchSearch && matchRiesgo && matchProblemas ? '' : 'none'
  })
}

function _openAmonestarModal(alumnoId, alumnoNombre) {
  AppModal.open({
    title: `Amonestar — ${alumnoNombre}`,
    size: 'md',
    saveText: 'Abrir caso',
    body: `
      <form id="amonestar-form">
        <div class="small">
          <label class="form-label fw-semibold">Título</label>
          <input type="text" class="form-control form-control-sm" id="am-titulo" placeholder="Ej: Problemas de conducta" required />
        </div>
        <div class="small mt-2">
          <label class="form-label fw-semibold">Tipo</label>
          <select class="form-select form-select-sm" id="am-tipo">
            <option value="disciplinario">Disciplinario</option>
            <option value="academico">Académico</option>
            <option value="asistencia">Asistencia</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="small mt-2">
          <label class="form-label fw-semibold">Nivel de riesgo</label>
          <select class="form-select form-select-sm" id="am-riesgo">
            <option value="bajo">Bajo</option>
            <option value="medio" selected>Medio</option>
            <option value="alto">Alto</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
        <div class="small mt-2">
          <label class="form-label fw-semibold">Descripción</label>
          <textarea class="form-control form-control-sm" id="am-descripcion" rows="3" placeholder="Describí el motivo..."></textarea>
        </div>
      </form>`,
    onSave: async () => {
      const titulo = document.querySelector('#am-titulo')?.value?.trim()
      const tipo = document.querySelector('#am-tipo')?.value
      const nivelRiesgo = document.querySelector('#am-riesgo')?.value
      const descripcion = document.querySelector('#am-descripcion')?.value?.trim() || null

      if (!titulo) {
        alert('El título es obligatorio.')
        return false
      }

      try {
        const caso = await createStudentCase({
          alumno_id: alumnoId,
          alumno_nombre: alumnoNombre,
          tipo,
          titulo,
          descripcion,
          nivel_riesgo: nivelRiesgo,
          origen: 'cockpit-director',
        })
        router.navigate(`pedagogico-caso?id=${caso.id}`)
        return true
      } catch (err) {
        alert(`Error: ${err.message}`)
        return false
      }
    },
  })
}
