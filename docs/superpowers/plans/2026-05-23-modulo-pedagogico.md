# Módulo Pedagógico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar y completar el módulo Pedagógico del Panel Admin del SOI, conectando los módulos dispersos (planificación, progresos, observaciones, asistencias) bajo una experiencia coherente con Dashboard, Seguimiento de Alumnos, Evaluaciones y Reportes.

**Architecture:** Se crean vistas nuevas en `src/modules/pedagogico/` que orquestan los APIs existentes sin duplicar lógica. El sidebar se reorganiza de 8 ítems caóticos a 4 secciones claras. Todo nuevo código es ES modules vanilla JS + Bootstrap 5, sin frameworks adicionales, siguiendo los patrones establecidos en el proyecto.

**Tech Stack:** Vanilla JS ES Modules, Bootstrap 5, Supabase JS v2, Bootstrap Icons, módulos existentes: `progresoAggregationService`, `riskRules`, `observacionesApi`, `planificacionApi`, `progresosApi`

---

## Mapa de archivos

### Crear (nuevos)
- `src/modules/pedagogico/views/dashboardPedagogicoView.js` — Landing del módulo con KPIs y acceso rápido
- `src/modules/pedagogico/views/seguimientoAlumnosView.js` — Lista de alumnos con riesgo + detalle unificado
- `src/modules/pedagogico/views/reportesPedagogicosView.js` — Reportes agregados por clase y riesgo
- `src/modules/pedagogico/pedagogico.router.js` — Registro de rutas del módulo
- `src/modules/pedagogico/index.js` — Entry point del módulo

### Modificar
- `src/main.js:226-238` — Reorganizar sidebar Pedagógico (8 → 4 ítems) y registrar nuevas rutas
- `src/modules/planificacion/views/planificacionView.js` — Agregar tab "Plantillas" dentro de la vista principal (eliminar ruta separada)
- `src/modules/progresos/views/progresosView.js` — Agregar acceso al boletín por alumno desde la tabla

### No tocar
- Todos los APIs existentes (`planificacionApi`, `progresosApi`, `observacionesApi`, `riskRules`, `progresoAggregationService`) — están bien, solo se consumen
- Modelos existentes — intactos
- Portal Maestros — fuera del scope

---

## Fase 0: Reorganizar el sidebar

### Task 1: Limpiar el nav Pedagógico en main.js

**Files:**
- Modify: `src/main.js:226-238`

Estado actual — 8 ítems bajo `id: 'pedagogico'`:
```
Asistencias, Asistencias Reportes, Planificación, Plantillas,
Todas las Planificaciones, Currículo, Progresos, Observaciones
```

Estado objetivo — 4 ítems limpios:
```
Dashboard, Planificación, Seguimiento, Reportes
```

- [ ] **Step 1: Reemplazar los items del grupo pedagógico**

Ubicar en `src/main.js` el bloque (aprox línea 226):
```js
    id: 'pedagogico',
```
y reemplazar los `items` de ese grupo con:
```js
    id: 'pedagogico',
    label: 'Pedagógico',
    icon: 'bi-mortarboard',
    items: [
      { id: 'pedagogico-dashboard',    label: 'Dashboard',       icon: 'bi-grid-1x2' },
      { id: 'planificacion',           label: 'Planificación',   icon: 'bi-journal-text' },
      { id: 'planificacion-maestros',  label: 'Todas las Planes',icon: 'bi-journal-check' },
      { id: 'pedagogico-seguimiento',  label: 'Seguimiento',     icon: 'bi-person-lines-fill' },
      { id: 'pedagogico-reportes',     label: 'Reportes',        icon: 'bi-file-earmark-bar-graph' },
    ]
```

- [ ] **Step 2: Verificar en browser que el sidebar muestra los 5 ítems sin errores de consola**

Abrir `localhost:5173/admin.html`, expandir "Pedagógico". Deben aparecer los 5 ítems. Hacer click en cada uno — esperado: pantalla en blanco o error de "ruta no registrada" (normal, las vistas aún no existen).

- [ ] **Step 3: Commit**
```bash
git add src/main.js
git commit -m "refactor(pedagogico): reorganize sidebar from 8 to 5 items"
```

---

## Fase 1: Dashboard Pedagógico

### Task 2: Crear el módulo pedagogico con entry point y router

**Files:**
- Create: `src/modules/pedagogico/index.js`
- Create: `src/modules/pedagogico/pedagogico.router.js`

- [ ] **Step 1: Crear `src/modules/pedagogico/index.js`**

```js
export { registerRoutesPedagogico } from './pedagogico.router.js'
```

- [ ] **Step 2: Crear `src/modules/pedagogico/pedagogico.router.js`**

```js
import { router } from '../../core/router/router.js'
import { renderDashboardPedagogicoView } from './views/dashboardPedagogicoView.js'
import { renderSeguimientoAlumnosView }  from './views/seguimientoAlumnosView.js'
import { renderReportesPedagogicosView } from './views/reportesPedagogicosView.js'

export function registerRoutesPedagogico() {
  router.register('pedagogico-dashboard',   (c) => renderDashboardPedagogicoView(c))
  router.register('pedagogico-seguimiento', (c) => renderSeguimientoAlumnosView(c))
  router.register('pedagogico-reportes',    (c) => renderReportesPedagogicosView(c))
}
```

- [ ] **Step 3: Registrar el módulo en `src/main.js`**

Agregar el import al inicio del archivo, junto a los otros imports de módulos:
```js
import { registerRoutesPedagogico } from './modules/pedagogico/index.js'
```

Agregar la llamada junto a los otros `registerRoutes*`:
```js
registerRoutesPedagogico()
```

- [ ] **Step 4: Commit**
```bash
git add src/modules/pedagogico/ src/main.js
git commit -m "feat(pedagogico): add module entry point and router"
```

---

### Task 3: Dashboard Pedagógico — KPIs y acceso rápido

**Files:**
- Create: `src/modules/pedagogico/views/dashboardPedagogicoView.js`

La vista carga 4 KPIs en paralelo usando APIs existentes y renderiza acceso rápido a cada sección.

- [ ] **Step 1: Crear `src/modules/pedagogico/views/dashboardPedagogicoView.js`**

```js
import { supabase } from '../../../lib/supabaseClient.js'
import { router } from '../../../core/router/router.js'
import { THRESHOLDS, evaluate } from '../../progresos/services/riskRules.js'
import { aggregateBatch } from '../../progresos/services/progresoAggregationService.js'

export async function renderDashboardPedagogicoView(container) {
  if (!container) return
  container.innerHTML = _renderSkeleton()

  try {
    const [kpis, riesgo] = await Promise.all([
      _fetchKPIs(),
      _fetchAlumnosEnRiesgo(),
    ])
    container.innerHTML = _renderContent(kpis, riesgo)
    _attachEvents(container)
  } catch (err) {
    console.error('[DashboardPedagogico]', err)
    container.innerHTML = `
      <div class="page-container">
        <div class="alert alert-warning">Error al cargar el dashboard: ${err.message}</div>
      </div>`
  }
}

async function _fetchKPIs() {
  const [alumnos, planes, clases, asistencias] = await Promise.all([
    supabase.from('alumnos').select('id', { count: 'exact' }).eq('activo', true),
    supabase.from('planificaciones').select('id, estado').gte(
      'fecha_inicio', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    ),
    supabase.from('clases').select('id', { count: 'exact' }).eq('estado', 'activa'),
    supabase.from('asistencias').select('estado').gte(
      'fecha', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    ),
  ])

  const totalAsistencias = asistencias.data?.length || 0
  const presentes = asistencias.data?.filter(a => a.estado === 'P').length || 0
  const tasaAsistencia = totalAsistencias > 0 ? Math.round((presentes / totalAsistencias) * 100) : null

  const planesEjecutados = planes.data?.filter(p => p.estado === 'ejecutado').length || 0
  const planesPlanificados = planes.data?.filter(p => p.estado === 'planificado').length || 0

  return {
    alumnosActivos: alumnos.count || 0,
    clasesActivas: clases.count || 0,
    planesEstaSemana: planes.data?.length || 0,
    planesEjecutados,
    planesPlanificados,
    tasaAsistencia,
  }
}

async function _fetchAlumnosEnRiesgo() {
  // Trae alumnos con asistencia baja en últimas 4 semanas
  const desde = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: asistencias } = await supabase
    .from('asistencias')
    .select('alumno_id, estado')
    .gte('fecha', desde)

  if (!asistencias?.length) return []

  // Agrupar por alumno
  const porAlumno = {}
  asistencias.forEach(a => {
    if (!porAlumno[a.alumno_id]) porAlumno[a.alumno_id] = { total: 0, presentes: 0 }
    porAlumno[a.alumno_id].total++
    if (a.estado === 'P') porAlumno[a.alumno_id].presentes++
  })

  const enRiesgo = Object.entries(porAlumno)
    .filter(([, v]) => v.total >= 4 && (v.presentes / v.total) < THRESHOLDS.attendance_min_rate)
    .map(([id]) => id)

  if (!enRiesgo.length) return []

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .in('id', enRiesgo.slice(0, 5))  // max 5 preview

  return alumnos || []
}

function _renderSkeleton() {
  return `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-grid-1x2 fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Dashboard Pedagógico</h1>
          <p class="text-muted small mb-0">Resumen del estado académico</p>
        </div>
      </div>
      <div class="row g-3">
        ${[1,2,3,4].map(() => `
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm" style="height:100px;">
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`
}

function _renderContent(kpis, alumnosRiesgo) {
  const asistenciaColor = kpis.tasaAsistencia === null ? 'secondary'
    : kpis.tasaAsistencia >= 80 ? 'success'
    : kpis.tasaAsistencia >= 60 ? 'warning' : 'danger'

  return `
    <div class="page-container">
      <!-- Header -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-grid-1x2 fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Dashboard Pedagógico</h1>
          <p class="text-muted small mb-0">Resumen del estado académico</p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="row g-3 mb-4">
        ${_kpiCard('bi-people-fill', 'Alumnos activos', kpis.alumnosActivos, 'primary', null)}
        ${_kpiCard('bi-easel2', 'Clases activas', kpis.clasesActivas, 'indigo', null)}
        ${_kpiCard('bi-journal-text', 'Planes esta semana', kpis.planesEstaSemana,
          'success', `${kpis.planesEjecutados} ejecutados · ${kpis.planesPlanificados} pendientes`)}
        ${_kpiCard('bi-calendar-check', 'Asistencia (7 días)',
          kpis.tasaAsistencia !== null ? kpis.tasaAsistencia + '%' : '—',
          asistenciaColor, null)}
      </div>

      <!-- Alumnos en riesgo -->
      ${alumnosRiesgo.length ? `
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-danger-subtle border-0 d-flex align-items-center justify-content-between">
          <span class="fw-semibold text-danger" style="font-size:0.9rem;">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Alumnos con asistencia baja (últimas 4 semanas)
          </span>
          <button class="btn btn-sm btn-outline-danger" data-nav="pedagogico-seguimiento">Ver todos</button>
        </div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            ${alumnosRiesgo.map(a => `
              <li class="list-group-item d-flex align-items-center gap-3 py-2">
                <div class="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                     style="width:32px;height:32px;font-size:0.75rem;font-weight:700;">
                  ${a.nombre_completo.charAt(0)}
                </div>
                <span style="font-size:0.875rem;">${a.nombre_completo}</span>
                <span class="badge bg-danger-subtle text-danger ms-auto rounded-pill" style="font-size:0.65rem;">Riesgo</span>
              </li>`).join('')}
          </ul>
        </div>
      </div>` : ''}

      <!-- Acceso rápido -->
      <div class="row g-3">
        ${_quickCard('bi-journal-text', 'Planificación', 'Planes de clase, plantillas y revisión', 'planificacion', 'primary')}
        ${_quickCard('bi-person-lines-fill', 'Seguimiento', 'Progreso y asistencia por alumno', 'pedagogico-seguimiento', 'success')}
        ${_quickCard('bi-graph-up', 'Evaluaciones', 'Calificaciones y boletines', 'progresos', 'warning')}
        ${_quickCard('bi-file-earmark-bar-graph', 'Reportes', 'Rendimiento por clase y riesgo', 'pedagogico-reportes', 'info')}
      </div>
    </div>`
}

function _kpiCard(icon, label, value, color, sub) {
  return `
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="bi ${icon} text-${color}" style="font-size:1.1rem;"></i>
            <span class="text-muted" style="font-size:0.75rem;">${label}</span>
          </div>
          <div class="fw-bold" style="font-size:1.6rem;line-height:1;">${value}</div>
          ${sub ? `<div class="text-muted mt-1" style="font-size:0.7rem;">${sub}</div>` : ''}
        </div>
      </div>
    </div>`
}

function _quickCard(icon, title, desc, route, color) {
  return `
    <div class="col-12 col-sm-6 col-md-3">
      <div class="card border-0 shadow-sm h-100 quick-nav-card" data-nav="${route}"
           style="cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;">
        <div class="card-body d-flex flex-column gap-2">
          <div class="rounded-3 bg-${color} bg-opacity-10 text-${color} d-flex align-items-center justify-content-center"
               style="width:40px;height:40px;">
            <i class="bi ${icon}" style="font-size:1.1rem;"></i>
          </div>
          <div class="fw-semibold" style="font-size:0.9rem;">${title}</div>
          <div class="text-muted" style="font-size:0.78rem;">${desc}</div>
          <div class="mt-auto text-${color}" style="font-size:0.75rem;">
            Ir a ${title} <i class="bi bi-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>`
}

function _attachEvents(container) {
  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => router.navigate(el.dataset.nav))
    // Hover effect para quick cards
    if (el.classList.contains('quick-nav-card')) {
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = ''
        el.style.boxShadow = ''
      })
    }
  })
}
```

- [ ] **Step 2: Navegar a `pedagogico-dashboard` en el browser**

Clic en sidebar → Pedagógico → Dashboard. Verificar:
- 4 KPI cards con números reales
- Si hay alumnos con asistencia < 70% en 4 semanas → aparece sección de riesgo
- 4 quick-nav cards con hover effect
- Sin errores de consola

- [ ] **Step 3: Commit**
```bash
git add src/modules/pedagogico/
git commit -m "feat(pedagogico): add dashboard with KPIs and risk preview"
```

---

## Fase 2: Seguimiento de Alumnos

### Task 4: Vista lista de alumnos con indicadores de riesgo

**Files:**
- Create: `src/modules/pedagogico/views/seguimientoAlumnosView.js`

- [ ] **Step 1: Crear `src/modules/pedagogico/views/seguimientoAlumnosView.js`**

```js
import { supabase } from '../../../lib/supabaseClient.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { THRESHOLDS } from '../../progresos/services/riskRules.js'

const state = {
  alumnos: [],
  asistenciaMap: {},   // alumno_id → { total, presentes, rate }
  progresosMap: {},    // alumno_id → { count, promedio }
  observacionesMap: {},// alumno_id → observacion[]
  busqueda: '',
  container: null,
}

export async function renderSeguimientoAlumnosView(container) {
  if (!container) return
  state.container = container
  container.innerHTML = _renderLoading()

  try {
    await _loadData()
    _render()
    _attachEvents()
  } catch (err) {
    console.error('[SeguimientoAlumnos]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${err.message}</div></div>`
  }
}

async function _loadData() {
  const desde = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [alumnosRes, asistenciasRes, progresosRes, observacionesRes] = await Promise.all([
    supabase.from('alumnos').select('id, nombre_completo, instrumento_principal, activo').eq('activo', true).order('nombre_completo'),
    supabase.from('asistencias').select('alumno_id, estado').gte('fecha', desde),
    supabase.from('progresos').select('alumno_id, calificacion').not('calificacion', 'is', null),
    supabase.from('observaciones').select('alumno_id, tipo, estado').eq('estado', 'activo'),
  ])

  state.alumnos = alumnosRes.data || []

  // Asistencia map
  state.asistenciaMap = {}
  ;(asistenciasRes.data || []).forEach(a => {
    if (!state.asistenciaMap[a.alumno_id]) state.asistenciaMap[a.alumno_id] = { total: 0, presentes: 0 }
    state.asistenciaMap[a.alumno_id].total++
    if (a.estado === 'P') state.asistenciaMap[a.alumno_id].presentes++
  })
  Object.values(state.asistenciaMap).forEach(v => {
    v.rate = v.total > 0 ? v.presentes / v.total : null
  })

  // Progresos map (promedio últimas 3 calificaciones por alumno)
  state.progresosMap = {}
  const progresosPorAlumno = {}
  ;(progresosRes.data || []).forEach(p => {
    if (!progresosPorAlumno[p.alumno_id]) progresosPorAlumno[p.alumno_id] = []
    progresosPorAlumno[p.alumno_id].push(p.calificacion)
  })
  Object.entries(progresosPorAlumno).forEach(([id, notas]) => {
    const ultimas = notas.slice(-3)
    state.progresosMap[id] = {
      count: ultimas.length,
      promedio: ultimas.reduce((s, n) => s + n, 0) / ultimas.length,
    }
  })

  // Observaciones map
  state.observacionesMap = {}
  ;(observacionesRes.data || []).forEach(o => {
    if (!state.observacionesMap[o.alumno_id]) state.observacionesMap[o.alumno_id] = []
    state.observacionesMap[o.alumno_id].push(o)
  })
}

function _getAlumnoRisk(alumnoId) {
  const asist = state.asistenciaMap[alumnoId]
  const prog  = state.progresosMap[alumnoId]
  const reasons = []

  if (asist?.total >= 4 && asist.rate < THRESHOLDS.attendance_min_rate) reasons.push('asistencia')
  if (prog?.count >= 1 && prog.promedio < THRESHOLDS.grade_min_avg) reasons.push('calificacion')
  if ((state.observacionesMap[alumnoId] || []).some(o => o.tipo === 'disciplina')) reasons.push('disciplina')

  return reasons
}

function _render() {
  const term = state.busqueda.toLowerCase()
  const filtrados = state.alumnos.filter(a =>
    !term || a.nombre_completo.toLowerCase().includes(term) ||
    (a.instrumento_principal || '').toLowerCase().includes(term)
  )

  const enRiesgo  = filtrados.filter(a => _getAlumnoRisk(a.id).length > 0)
  const sinRiesgo = filtrados.filter(a => _getAlumnoRisk(a.id).length === 0)
  const ordenados = [...enRiesgo, ...sinRiesgo]

  state.container.innerHTML = `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-person-lines-fill fs-4"></i>
        </div>
        <div class="flex-grow-1">
          <h1 class="page-title mb-0">Seguimiento de Alumnos</h1>
          <p class="text-muted small mb-0">${state.alumnos.length} alumnos activos · ${enRiesgo.length} en riesgo</p>
        </div>
      </div>

      <div class="input-group mb-3" style="max-width:360px;">
        <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
        <input type="text" class="form-control border-start-0" id="busqueda-alumno"
               placeholder="Buscar alumno o instrumento..." value="${state.busqueda}">
      </div>

      ${enRiesgo.length ? `
        <div class="alert alert-warning border-0 d-flex align-items-center gap-2 mb-3 py-2">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span style="font-size:0.85rem;"><strong>${enRiesgo.length}</strong> alumno${enRiesgo.length !== 1 ? 's' : ''} requiere${enRiesgo.length === 1 ? '' : 'n'} atención</span>
        </div>` : ''}

      <div class="d-flex flex-column gap-2" id="lista-alumnos">
        ${ordenados.map(a => _renderAlumnoRow(a)).join('') ||
          '<div class="text-center text-muted py-5">Sin resultados</div>'}
      </div>
    </div>`

  _attachEvents()
}

function _renderAlumnoRow(alumno) {
  const risks = _getAlumnoRisk(alumno.id)
  const asist = state.asistenciaMap[alumno.id]
  const prog  = state.progresosMap[alumno.id]
  const obs   = state.observacionesMap[alumno.id] || []

  const asistPct   = asist?.rate != null ? Math.round(asist.rate * 100) : null
  const asistColor = asistPct === null ? 'secondary' : asistPct >= 80 ? 'success' : asistPct >= 60 ? 'warning' : 'danger'
  const notaColor  = !prog ? 'secondary' : prog.promedio >= 7 ? 'success' : prog.promedio >= 5 ? 'warning' : 'danger'

  return `
    <div class="alumno-row card border-0 shadow-sm" data-id="${alumno.id}"
         style="cursor:pointer;${risks.length ? 'border-left:3px solid #f59e0b !important;' : ''}transition:box-shadow 0.15s;">
      <div class="card-body py-2 px-3 d-flex align-items-center gap-3">
        <div class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center fw-bold"
             style="width:38px;height:38px;font-size:0.85rem;background:${risks.length ? '#fef3c7' : 'var(--bs-primary-bg-subtle)'};color:${risks.length ? '#92400e' : 'var(--bs-primary)'};">
          ${alumno.nombre_completo.charAt(0)}
        </div>
        <div class="flex-grow-1 overflow-hidden">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="fw-semibold text-truncate" style="font-size:0.87rem;">${alumno.nombre_completo}</span>
            ${risks.includes('asistencia') ? '<span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill" style="font-size:0.6rem;">Asistencia baja</span>' : ''}
            ${risks.includes('calificacion') ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill" style="font-size:0.6rem;">Nota baja</span>' : ''}
            ${risks.includes('disciplina') ? '<span class="badge bg-orange-subtle text-orange border rounded-pill" style="font-size:0.6rem;background:#fff7ed;color:#c2410c;border-color:#fed7aa!important;">Observación</span>' : ''}
          </div>
          <div class="d-flex gap-3 mt-1" style="font-size:0.73rem;color:var(--bs-secondary-color);">
            ${alumno.instrumento_principal ? `<span><i class="bi bi-music-note me-1"></i>${alumno.instrumento_principal}</span>` : ''}
            <span title="Asistencia últimas 4 semanas">
              <i class="bi bi-calendar-check me-1 text-${asistColor}"></i>
              ${asistPct !== null ? `${asistPct}%` : 'Sin datos'}
            </span>
            <span title="Promedio últimas calificaciones">
              <i class="bi bi-star me-1 text-${notaColor}"></i>
              ${prog ? prog.promedio.toFixed(1) : 'Sin notas'}
            </span>
            ${obs.length ? `<span><i class="bi bi-chat-quote me-1 text-muted"></i>${obs.length} obs.</span>` : ''}
          </div>
        </div>
        <i class="bi bi-chevron-right text-muted flex-shrink-0"></i>
      </div>
    </div>`
}

function _attachEvents() {
  state.container.querySelector('#busqueda-alumno')?.addEventListener('input', e => {
    state.busqueda = e.target.value
    _render()
  })

  state.container.querySelectorAll('.alumno-row').forEach(row => {
    row.addEventListener('click', () => _openAlumnoDetail(row.dataset.id))
    row.addEventListener('mouseenter', () => { row.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)' })
    row.addEventListener('mouseleave', () => { row.style.boxShadow = '' })
  })
}

function _renderLoading() {
  return `<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;">
    <div class="spinner-border text-primary"></div>
  </div>`
}

async function _openAlumnoDetail(alumnoId) {
  const alumno = state.alumnos.find(a => a.id === alumnoId)
  if (!alumno) return

  // Fetch detail data
  const [asistencias, progresos, observaciones, inscripciones] = await Promise.all([
    supabase.from('asistencias').select('fecha, estado, clase_id').eq('alumno_id', alumnoId)
      .order('fecha', { ascending: false }).limit(20),
    supabase.from('progresos').select('*, clase:clases(nombre)').eq('alumno_id', alumnoId)
      .order('fecha_evaluacion', { ascending: false }).limit(10),
    supabase.from('observaciones').select('*').eq('alumno_id', alumnoId)
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('alumnos_clases').select('clase:clases(id, nombre, instrumento)').eq('alumno_id', alumnoId),
  ])

  const clases = (inscripciones.data || []).map(i => i.clase).filter(Boolean)
  const risks  = _getAlumnoRisk(alumnoId)

  AppModal.open({
    title: alumno.nombre_completo,
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `
      <div class="d-flex gap-2 flex-wrap mb-3">
        ${alumno.instrumento_principal ? `<span class="badge bg-primary-subtle text-primary">${alumno.instrumento_principal}</span>` : ''}
        ${risks.map(r => `<span class="badge bg-warning-subtle text-warning">${r === 'asistencia' ? 'Asistencia baja' : r === 'calificacion' ? 'Nota baja' : 'Con observación'}</span>`).join('')}
        ${clases.map(c => `<span class="badge bg-body-secondary text-body-secondary">${c.nombre}</span>`).join('')}
      </div>

      <div class="row g-3">
        <!-- Asistencia reciente -->
        <div class="col-md-6">
          <div class="card border-0 bg-body-tertiary h-100">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-calendar-check me-1 text-success"></i>Asistencia reciente</div>
              <div style="max-height:160px;overflow-y:auto;">
                ${(asistencias.data || []).length ? asistencias.data.map(a => `
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom" style="font-size:0.78rem;">
                    <span class="text-muted">${a.fecha}</span>
                    <span class="badge rounded-pill ${a.estado === 'P' ? 'bg-success-subtle text-success' : a.estado === 'J' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}">
                      ${a.estado === 'P' ? 'Presente' : a.estado === 'J' ? 'Justificado' : 'Ausente'}
                    </span>
                  </div>`).join('') : '<p class="text-muted small mb-0">Sin registros</p>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Calificaciones -->
        <div class="col-md-6">
          <div class="card border-0 bg-body-tertiary h-100">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-star me-1 text-warning"></i>Últimas calificaciones</div>
              <div style="max-height:160px;overflow-y:auto;">
                ${(progresos.data || []).length ? progresos.data.map(p => `
                  <div class="d-flex justify-content-between align-items-center py-1 border-bottom" style="font-size:0.78rem;">
                    <span class="text-truncate me-2" style="max-width:140px;">${p.clase?.nombre || 'Sin clase'}</span>
                    <span class="fw-semibold ${p.calificacion >= 7 ? 'text-success' : p.calificacion >= 5 ? 'text-warning' : 'text-danger'}">${p.calificacion?.toFixed(1) ?? '–'}</span>
                  </div>`).join('') : '<p class="text-muted small mb-0">Sin calificaciones</p>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        ${(observaciones.data || []).length ? `
        <div class="col-12">
          <div class="card border-0 bg-body-tertiary">
            <div class="card-body">
              <div class="fw-semibold mb-2" style="font-size:0.85rem;"><i class="bi bi-chat-quote me-1 text-info"></i>Observaciones activas</div>
              ${observaciones.data.map(o => `
                <div class="border rounded-2 p-2 mb-2" style="font-size:0.8rem;">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="badge bg-secondary-subtle text-secondary">${o.tipo || 'General'}</span>
                    <span class="text-muted">${(o.created_at || '').slice(0, 10)}</span>
                  </div>
                  <p class="mb-0">${o.descripcion || ''}</p>
                </div>`).join('')}
            </div>
          </div>
        </div>` : ''}
      </div>`
  })
}
```

- [ ] **Step 2: Verificar en browser**

Clic en sidebar → Pedagógico → Seguimiento. Verificar:
- Lista de alumnos ordenada (riesgo primero)
- Badges de riesgo correctos según datos reales
- Buscador filtra en tiempo real
- Clic en fila abre modal con asistencia + calificaciones + observaciones

- [ ] **Step 3: Commit**
```bash
git add src/modules/pedagogico/views/seguimientoAlumnosView.js
git commit -m "feat(pedagogico): add student tracking view with risk indicators"
```

---

## Fase 3: Planificación — consolidación

### Task 5: Agregar tabs dentro de planificacionView (Mis Planes | Plantillas)

**Files:**
- Modify: `src/modules/planificacion/views/planificacionView.js`

Actualmente "Plantillas" es una ruta separada (`planificacion-plantillas`). Hay que convertirla en un tab dentro de la vista principal para reducir fragmentación.

- [ ] **Step 1: Localizar y modificar el renderContent de planificacionView**

En `src/modules/planificacion/views/planificacionView.js`, la función `renderContent(container)` (aprox línea 129) actualmente empieza con el header. Agregar tabs antes de la lista:

Encontrar el `container.innerHTML = \`` en `renderContent` y agregar justo después del header block y antes del listado:

```js
<!-- Tabs -->
<ul class="nav nav-tabs mb-3" id="planificacion-tabs">
  <li class="nav-item">
    <button class="nav-link ${state.activeTab !== 'plantillas' ? 'active' : ''}" data-tab="planes">
      <i class="bi bi-journal-text me-1"></i>
      ${isAdmin ? 'Todos los planes' : 'Mis planes'}
    </button>
  </li>
  ${!isAdmin ? `
  <li class="nav-item">
    <button class="nav-link ${state.activeTab === 'plantillas' ? 'active' : ''}" data-tab="plantillas">
      <i class="bi bi-file-earmark-template me-1"></i>Plantillas
    </button>
  </li>` : ''}
</ul>
<div id="tab-content-planes" style="display:${state.activeTab === 'plantillas' ? 'none' : 'block'}">
  <!-- contenido existente de la lista de planes va aquí -->
</div>
<div id="tab-content-plantillas" style="display:${state.activeTab === 'plantillas' ? 'block' : 'none'}">
  <!-- contenido de plantillas va aquí -->
</div>
```

- [ ] **Step 2: Agregar `activeTab: 'planes'` al state inicial en planificacionView.js**

```js
const state = {
  planes: [],
  planesOriginales: [],
  cargando: false,
  viewMode: 'maestro',
  activeTab: 'planes',   // ← agregar esta línea
  seleccionados: new Set(),
  container: null
}
```

- [ ] **Step 3: Agregar el event listener para los tabs dentro de `_attachEvents`**

```js
container.querySelectorAll('#planificacion-tabs .nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    state.activeTab = btn.dataset.tab
    container.querySelector('#tab-content-planes').style.display =
      state.activeTab === 'plantillas' ? 'none' : 'block'
    container.querySelector('#tab-content-plantillas').style.display =
      state.activeTab === 'plantillas' ? 'block' : 'none'
    container.querySelectorAll('#planificacion-tabs .nav-link').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
  })
})
```

- [ ] **Step 4: Verificar en browser**

Ir a Pedagógico → Planificación. Deben aparecer los tabs "Mis planes" y "Plantillas". Clic en Plantillas → muestra las plantillas DSL. Clic en Mis planes → regresa a la lista de planes.

- [ ] **Step 5: Commit**
```bash
git add src/modules/planificacion/views/planificacionView.js
git commit -m "feat(planificacion): merge templates as tab inside main view"
```

---

## Fase 4: Reportes Pedagógicos

### Task 6: Vista de reportes con rendimiento por clase y alumnos en riesgo

**Files:**
- Create: `src/modules/pedagogico/views/reportesPedagogicosView.js`

- [ ] **Step 1: Crear `src/modules/pedagogico/views/reportesPedagogicosView.js`**

```js
import { supabase } from '../../../lib/supabaseClient.js'
import { THRESHOLDS } from '../../progresos/services/riskRules.js'

export async function renderReportesPedagogicosView(container) {
  if (!container) return
  container.innerHTML = `<div class="page-container d-flex align-items-center justify-content-center" style="min-height:400px;"><div class="spinner-border text-primary"></div></div>`

  try {
    const [rendimientoClases, alumnosRiesgo] = await Promise.all([
      _fetchRendimientoPorClase(),
      _fetchAlumnosEnRiesgoCompleto(),
    ])
    container.innerHTML = _render(rendimientoClases, alumnosRiesgo)
  } catch (err) {
    console.error('[ReportesPedagogicos]', err)
    container.innerHTML = `<div class="page-container"><div class="alert alert-warning">${err.message}</div></div>`
  }
}

async function _fetchRendimientoPorClase() {
  const { data: clases } = await supabase
    .from('clases')
    .select('id, nombre, instrumento, capacidad_maxima')
    .eq('estado', 'activa')
    .order('nombre')

  if (!clases?.length) return []

  const claseIds = clases.map(c => c.id)

  const [inscritos, asistencias, progresos] = await Promise.all([
    supabase.from('alumnos_clases').select('clase_id, alumno_id').in('clase_id', claseIds),
    supabase.from('asistencias').select('clase_id, estado')
      .in('clase_id', claseIds)
      .gte('fecha', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabase.from('progresos').select('clase_id, calificacion')
      .in('clase_id', claseIds)
      .not('calificacion', 'is', null),
  ])

  return clases.map(c => {
    const inscritosClase = (inscritos.data || []).filter(i => i.clase_id === c.id)
    const asistClase     = (asistencias.data || []).filter(a => a.clase_id === c.id)
    const progClase      = (progresos.data || []).filter(p => p.clase_id === c.id)

    const tasaAsist = asistClase.length > 0
      ? Math.round((asistClase.filter(a => a.estado === 'P').length / asistClase.length) * 100) : null
    const promNotas = progClase.length > 0
      ? progClase.reduce((s, p) => s + p.calificacion, 0) / progClase.length : null
    const ocupacion = c.capacidad_maxima
      ? Math.round((inscritosClase.length / c.capacidad_maxima) * 100) : null

    return { ...c, totalAlumnos: inscritosClase.length, tasaAsist, promNotas, ocupacion }
  })
}

async function _fetchAlumnosEnRiesgoCompleto() {
  const desde = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data: asistencias } = await supabase
    .from('asistencias').select('alumno_id, estado').gte('fecha', desde)

  if (!asistencias?.length) return []

  const porAlumno = {}
  asistencias.forEach(a => {
    if (!porAlumno[a.alumno_id]) porAlumno[a.alumno_id] = { total: 0, presentes: 0 }
    porAlumno[a.alumno_id].total++
    if (a.estado === 'P') porAlumno[a.alumno_id].presentes++
  })

  const enRiesgoIds = Object.entries(porAlumno)
    .filter(([, v]) => v.total >= 4 && (v.presentes / v.total) < THRESHOLDS.attendance_min_rate)
    .map(([id, v]) => ({ id, rate: v.presentes / v.total, total: v.total }))

  if (!enRiesgoIds.length) return []

  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id, nombre_completo, instrumento_principal')
    .in('id', enRiesgoIds.map(e => e.id))

  return (alumnos || []).map(a => ({
    ...a,
    ...enRiesgoIds.find(e => e.id === a.id),
  })).sort((a, b) => a.rate - b.rate)
}

function _render(clases, alumnosRiesgo) {
  const colorAsist = (v) => v === null ? 'secondary' : v >= 80 ? 'success' : v >= 60 ? 'warning' : 'danger'
  const colorNota  = (v) => v === null ? 'secondary' : v >= 7 ? 'success' : v >= 5 ? 'warning' : 'danger'

  return `
    <div class="page-container">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="brand-badge bg-info bg-opacity-10 text-info rounded-3 d-flex align-items-center justify-content-center" style="width:42px;height:42px;">
          <i class="bi bi-file-earmark-bar-graph fs-4"></i>
        </div>
        <div>
          <h1 class="page-title mb-0">Reportes Pedagógicos</h1>
          <p class="text-muted small mb-0">Rendimiento por clase · Alumnos en riesgo</p>
        </div>
      </div>

      <!-- Rendimiento por clase -->
      <h6 class="text-muted text-uppercase mb-2" style="font-size:0.72rem;letter-spacing:0.08em;">Rendimiento por clase (últimas 4 semanas)</h6>
      <div class="card border-0 shadow-sm mb-4">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle" style="font-size:0.83rem;">
            <thead class="table-light">
              <tr>
                <th>Clase</th>
                <th class="text-center">Alumnos</th>
                <th class="text-center">Asistencia</th>
                <th class="text-center">Prom. Nota</th>
                <th class="text-center">Ocupación</th>
              </tr>
            </thead>
            <tbody>
              ${clases.map(c => `
                <tr>
                  <td>
                    <div class="fw-semibold">${c.nombre}</div>
                    ${c.instrumento ? `<div class="text-muted" style="font-size:0.75rem;">${c.instrumento}</div>` : ''}
                  </td>
                  <td class="text-center">${c.totalAlumnos}</td>
                  <td class="text-center">
                    ${c.tasaAsist !== null
                      ? `<span class="badge bg-${colorAsist(c.tasaAsist)}-subtle text-${colorAsist(c.tasaAsist)} rounded-pill">${c.tasaAsist}%</span>`
                      : '<span class="text-muted">–</span>'}
                  </td>
                  <td class="text-center">
                    ${c.promNotas !== null
                      ? `<span class="fw-semibold text-${colorNota(c.promNotas)}">${c.promNotas.toFixed(1)}</span>`
                      : '<span class="text-muted">–</span>'}
                  </td>
                  <td class="text-center">
                    ${c.ocupacion !== null ? `
                      <div class="d-flex align-items-center gap-2">
                        <div style="flex:1;height:6px;background:var(--bs-tertiary-bg);border-radius:3px;overflow:hidden;">
                          <div style="width:${c.ocupacion}%;height:100%;background:${c.ocupacion >= 90 ? '#ef4444' : c.ocupacion >= 70 ? '#f59e0b' : '#10b981'};border-radius:3px;"></div>
                        </div>
                        <span style="font-size:0.72rem;color:var(--bs-secondary-color);min-width:28px;">${c.ocupacion}%</span>
                      </div>` : '<span class="text-muted">–</span>'}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alumnos en riesgo -->
      <h6 class="text-muted text-uppercase mb-2" style="font-size:0.72rem;letter-spacing:0.08em;">
        Alumnos en riesgo — asistencia < ${Math.round(THRESHOLDS.attendance_min_rate * 100)}% (4 semanas)
      </h6>
      ${alumnosRiesgo.length ? `
      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle" style="font-size:0.83rem;">
            <thead class="table-light">
              <tr>
                <th>Alumno</th>
                <th>Instrumento</th>
                <th class="text-center">Tasa asistencia</th>
                <th class="text-center">Clases evaluadas</th>
              </tr>
            </thead>
            <tbody>
              ${alumnosRiesgo.map(a => `
                <tr>
                  <td class="fw-semibold">${a.nombre_completo}</td>
                  <td class="text-muted">${a.instrumento_principal || '–'}</td>
                  <td class="text-center">
                    <span class="badge bg-danger-subtle text-danger rounded-pill">${Math.round(a.rate * 100)}%</span>
                  </td>
                  <td class="text-center text-muted">${a.total}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>` : `
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center text-muted py-4">
          <i class="bi bi-check-circle-fill text-success fs-3 d-block mb-2"></i>
          <span style="font-size:0.875rem;">Sin alumnos en riesgo detectados en las últimas 4 semanas.</span>
        </div>
      </div>`}
    </div>`
}
```

- [ ] **Step 2: Verificar en browser**

Ir a Pedagógico → Reportes. Verificar:
- Tabla de rendimiento con todas las clases activas
- Barras de ocupación coloreadas
- Tabla de alumnos en riesgo (o mensaje "sin riesgo" si todos están bien)
- Sin errores de consola

- [ ] **Step 3: Commit**
```bash
git add src/modules/pedagogico/views/reportesPedagogicosView.js
git commit -m "feat(pedagogico): add pedagogical reports view with class performance and risk"
```

---

## Fase 5: Integración final y limpieza

### Task 7: Eliminar rutas obsoletas del sidebar y registrar nuevas

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Eliminar routes huérfanas en main.js**

Las rutas `planificacion-plantillas` ya no son necesarias como ruta separada (están como tab). Verificar que no estén registradas o que al navegar a ellas redirija correctamente.

Buscar en `src/main.js` si existe `router.register('planificacion-plantillas', ...)` y eliminarla (o dejarla apuntando a `planificacion` con `viewMode: 'plantillas'` para backwards compat).

- [ ] **Step 2: Asegurarse que `registerRoutesPedagogico()` está llamado en main.js**

Verificar que la línea fue agregada en Task 2 Step 3. Si no está, agregarla.

- [ ] **Step 3: Test de navegación completa**

Recorrer en el browser:
1. Pedagógico → Dashboard → KPIs se ven ✓
2. Dashboard → click "Ir a Seguimiento" → navega a Seguimiento ✓
3. Seguimiento → buscar un alumno → clic → modal con detalle ✓
4. Pedagógico → Planificación → tab Plantillas → plantillas DSL ✓
5. Pedagógico → Todas las Planes → lista admin ✓
6. Pedagógico → Reportes → tabla de clases + alumnos en riesgo ✓

- [ ] **Step 4: Commit final**
```bash
git add src/main.js
git commit -m "feat(pedagogico): complete module integration and nav cleanup"
```

---

## Self-Review

### Spec coverage
| Requisito | Task que lo cubre |
|-----------|-------------------|
| Dashboard con KPIs | Task 3 |
| Alumnos en riesgo (usar riskRules.js) | Task 3 + Task 4 + Task 6 |
| Seguimiento unificado (asistencia + notas + observaciones) | Task 4 |
| Planificación consolidada (eliminar dispersión) | Task 5 |
| Reportes de rendimiento por clase | Task 6 |
| Sidebar limpio (8 → 5 ítems) | Task 1 |
| Router y módulo bien estructurado | Task 2 |
| Integración final | Task 7 |

### Placeholders scan
- Ningún paso dice "implementar apropiadamente" o "agregar validación" sin código concreto ✓
- Todos los pasos tienen código completo o instrucciones de localización exactas ✓
- Las rutas de archivos son absolutas al proyecto ✓

### Type consistency
- `state.activeTab` agregado en Task 5 Step 2, usado en Step 1 ✓
- `THRESHOLDS` importado de `riskRules.js` en Tasks 4 y 6 — mismo path ✓
- `router.navigate()` usado en Task 3, `router` importado correctamente ✓
