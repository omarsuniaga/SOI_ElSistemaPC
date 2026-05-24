# Sistema de Ayuda por Vista — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un botón `?` en el header de cada vista principal que abre un panel lateral explicando qué hace esa pantalla y cómo interpretar cada sección.

**Architecture:** Se crea un singleton `HelpPanel` en `src/shared/components/HelpPanel.js` siguiendo el mismo patrón de `AppModal` y `AppToast` (sin dependencia de Bootstrap JS, CSS propio inyectado, panel deslizante desde la derecha). Cada vista llama `HelpPanel.open(config)` con su propio contenido de ayuda. El botón `?` se agrega inline en el header de cada vista como HTML — no hay un componente separado para el botón.

**Tech Stack:** Vanilla JS ES Modules, CSS inyectado (sin Bootstrap JS), mismos patrones que `AppModal.js` y `AppToast.js`

---

## Mapa de archivos

### Crear
- `src/shared/components/HelpPanel.js` — Singleton panel lateral de ayuda (slide desde derecha)

### Modificar
- `src/modules/pedagogico/views/dashboardPedagogicoView.js` — Agregar botón `?` y config de ayuda
- `src/modules/pedagogico/views/seguimientoAlumnosView.js` — Ídem
- `src/modules/pedagogico/views/reportesPedagogicosView.js` — Ídem
- `src/modules/planificacion/views/planificacionView.js` — Ídem
- `src/modules/maestros/views/maestrosView.js` — Ídem
- `src/modules/clases/views/clasesView.js` — Ídem (verificar nombre exacto del archivo)

### No tocar
- `AppModal.js`, `AppToast.js` — ya funcionan, son referencia de patrón solamente

---

## Task 1: Crear el componente HelpPanel

**Files:**
- Create: `src/shared/components/HelpPanel.js`

- [ ] **Step 1: Crear `src/shared/components/HelpPanel.js`**

Diseño: panel minimalista estilo Linear/Notion. Sin cajas con background en las secciones — cada sección usa solo una línea izquierda coloreada de 2px, ícono pequeño inline y tipografía limpia. El botón `?` en cada vista es un círculo sutil de 28px.

```js
/**
 * HelpPanel — Panel lateral de ayuda, slide desde la derecha.
 * Diseño minimalista: sin fondos de card, accent line izquierda, tipografía limpia.
 * Singleton. Sin dependencia de Bootstrap JS.
 *
 * Uso:
 *   HelpPanel.open({ title, intro, sections: [{ icon, title, description, color? }] })
 *   HelpPanel.close()
 */

const PANEL_ID   = 'app-help-panel'
const OVERLAY_ID = 'app-help-overlay'

let _stylesInjected = false

function _injectStyles() {
  if (_stylesInjected) return
  _stylesInjected = true
  const s = document.createElement('style')
  s.id = 'app-help-panel-styles'
  s.textContent = `
    /* ── Overlay ─────────────────────────────────────────── */
    #app-help-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.18);
      z-index: 3000;
      opacity: 0;
      transition: opacity 0.22s ease;
    }
    #app-help-overlay.hp-visible { opacity: 1; }

    /* ── Panel ───────────────────────────────────────────── */
    #app-help-panel {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: min(380px, 94vw);
      background: var(--bs-body-bg, #fff);
      border-left: 1px solid var(--bs-border-color, #e5e7eb);
      box-shadow: -12px 0 40px rgba(0,0,0,0.08);
      z-index: 3001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.26s cubic-bezier(0.32,0,0.08,1);
      overflow: hidden;
    }
    #app-help-panel.hp-visible { transform: translateX(0); }

    /* ── Header ──────────────────────────────────────────── */
    #ahp-header {
      display: flex;
      align-items: center;
      padding: 0 1.25rem;
      height: 56px;
      border-bottom: 1px solid var(--bs-border-color, #e5e7eb);
      flex-shrink: 0;
      gap: 0.625rem;
    }
    #ahp-badge {
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 1.5px solid var(--bs-border-color, #d1d5db);
      display: flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #6b7280);
      font-size: 0.78rem;
      flex-shrink: 0;
    }
    #ahp-title {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--bs-body-color, #111827);
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #ahp-close {
      background: none; border: none; cursor: pointer;
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #9ca3af);
      transition: background 0.12s, color 0.12s;
      flex-shrink: 0;
    }
    #ahp-close:hover {
      background: var(--bs-tertiary-bg, #f3f4f6);
      color: var(--bs-body-color, #374151);
    }

    /* ── Body ────────────────────────────────────────────── */
    #ahp-body {
      overflow-y: auto;
      padding: 1.5rem 1.25rem 2rem;
      flex: 1;
    }
    #ahp-body::-webkit-scrollbar { width: 4px; }
    #ahp-body::-webkit-scrollbar-track { background: transparent; }
    #ahp-body::-webkit-scrollbar-thumb { background: var(--bs-border-color, #d1d5db); border-radius: 2px; }

    /* ── Intro ───────────────────────────────────────────── */
    .ahp-intro {
      font-size: 0.8125rem;
      color: var(--bs-secondary-color, #6b7280);
      line-height: 1.65;
      margin: 0 0 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--bs-border-color, #f0f0f0);
    }

    /* ── Section label ───────────────────────────────────── */
    .ahp-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--bs-tertiary-color, #9ca3af);
      margin-bottom: 0.75rem;
    }

    /* ── Section item ────────────────────────────────────── */
    .ahp-item {
      display: flex;
      gap: 0.875rem;
      padding: 0.875rem 0 0.875rem 0.875rem;
      border-left: 2px solid var(--ahp-accent, #e5e7eb);
      margin-bottom: 0.5rem;
      transition: border-color 0.15s;
    }
    .ahp-item:last-child { margin-bottom: 0; }
    .ahp-item:hover { border-left-color: var(--ahp-accent-hover, #93c5fd); }

    .ahp-item-icon {
      font-size: 0.9rem;
      color: var(--ahp-accent, #6b7280);
      flex-shrink: 0;
      margin-top: 1px;
      width: 16px;
      text-align: center;
    }
    .ahp-item-body {}
    .ahp-item-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--bs-body-color, #111827);
      margin-bottom: 0.2rem;
      line-height: 1.3;
    }
    .ahp-item-desc {
      font-size: 0.77rem;
      color: var(--bs-secondary-color, #6b7280);
      line-height: 1.6;
      margin: 0;
    }

    /* ── Help trigger button (usado en los headers de vistas) */
    .btn-help-trigger {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 1.5px solid var(--bs-border-color, #d1d5db);
      background: transparent;
      display: inline-flex; align-items: center; justify-content: center;
      color: var(--bs-secondary-color, #9ca3af);
      font-size: 0.75rem;
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .btn-help-trigger:hover {
      border-color: var(--bs-primary, #3b82f6);
      color: var(--bs-primary, #3b82f6);
      background: var(--bs-primary-bg-subtle, #eff6ff);
    }
  `
  document.head.appendChild(s)
}

function _ensureDOM() {
  if (document.getElementById(PANEL_ID)) return
  _injectStyles()

  const overlay = document.createElement('div')
  overlay.id = OVERLAY_ID
  document.body.appendChild(overlay)

  const panel = document.createElement('div')
  panel.id = PANEL_ID
  panel.setAttribute('role', 'complementary')
  panel.setAttribute('aria-label', 'Ayuda')
  panel.innerHTML = `
    <div id="ahp-header">
      <div id="ahp-badge"><i class="bi bi-question"></i></div>
      <span id="ahp-title">Ayuda</span>
      <button id="ahp-close" aria-label="Cerrar">
        <i class="bi bi-x" style="font-size:1.1rem;"></i>
      </button>
    </div>
    <div id="ahp-body"></div>
  `
  document.body.appendChild(panel)

  overlay.addEventListener('click', () => HelpPanel.close())
  panel.querySelector('#ahp-close').addEventListener('click', () => HelpPanel.close())
  document.addEventListener('keydown', e => { if (e.key === 'Escape') HelpPanel.close() })
}

export const HelpPanel = {
  /**
   * @param {{ title: string, intro: string, sections: Array<{icon:string, title:string, description:string, color?:string}> }} config
   */
  open({ title, intro, sections = [] }) {
    _ensureDOM()

    const panel   = document.getElementById(PANEL_ID)
    const overlay = document.getElementById(OVERLAY_ID)

    document.getElementById('ahp-title').textContent = title || 'Ayuda'
    document.getElementById('ahp-body').innerHTML = `
      ${intro ? `<p class="ahp-intro">${intro}</p>` : ''}
      ${sections.length ? `<div class="ahp-label">En esta pantalla</div>` : ''}
      ${sections.map(s => {
        const accent      = s.color || '#6b7280'
        const accentLight = s.color ? s.color + '60' : '#d1d5db'
        return `
          <div class="ahp-item" style="--ahp-accent:${accent};--ahp-accent-hover:${accentLight};">
            <i class="bi ${s.icon || 'bi-dot'} ahp-item-icon" style="color:${accent};"></i>
            <div class="ahp-item-body">
              <div class="ahp-item-title">${s.title}</div>
              <p class="ahp-item-desc">${s.description}</p>
            </div>
          </div>`
      }).join('')}
    `

    overlay.style.display = 'block'
    requestAnimationFrame(() => {
      overlay.classList.add('hp-visible')
      panel.classList.add('hp-visible')
    })
  },

  close() {
    const panel   = document.getElementById(PANEL_ID)
    const overlay = document.getElementById(OVERLAY_ID)
    if (!panel || !panel.classList.contains('hp-visible')) return
    panel.classList.remove('hp-visible')
    overlay.classList.remove('hp-visible')
    setTimeout(() => { if (overlay) overlay.style.display = 'none' }, 280)
  }
}
```

- [ ] **Step 2: Verificar que el archivo no tiene errores de sintaxis**

```bash
node --input-type=module < src/shared/components/HelpPanel.js 2>&1 | head -5
```
Expected: no output (sin errores). Si hay errores de sintaxis, corregirlos.

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/HelpPanel.js
git commit -m "feat(shared): add HelpPanel slide-in component"
```

---

## Task 2: Agregar ayuda al Dashboard Pedagógico

**Files:**
- Modify: `src/modules/pedagogico/views/dashboardPedagogicoView.js`

- [ ] **Step 1: Agregar el import de HelpPanel en dashboardPedagogicoView.js**

Al inicio del archivo, junto a los otros imports:
```js
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
```

- [ ] **Step 2: Agregar el botón `?` en el header de `_renderSkeleton()` y `_renderContent()`**

En `_renderSkeleton()`, en el bloque `d-flex align-items-center gap-3 mb-4`, después del `<div>` con título y subtítulo:
```html
    <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-help-dashboard" title="¿Cómo funciona esta pantalla?">
      <i class="bi bi-question-lg"></i>
    </button>
```

Aplicar el mismo botón en `_renderContent()` en el mismo bloque header.

- [ ] **Step 3: Agregar el event listener en `_attachEvents(container)`**

Agregar al final de la función `_attachEvents`:
```js
  container.querySelector('#btn-help-dashboard')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Dashboard Pedagógico',
      intro: 'Resumen general del estado académico de la institución. Te permite ver de un vistazo cómo están los alumnos, clases y planificaciones.',
      sections: [
        {
          icon: 'bi-people-fill',
          title: 'Alumnos activos',
          description: 'Cantidad total de alumnos con estado activo en el sistema.',
          color: '#0d6efd',
        },
        {
          icon: 'bi-easel2',
          title: 'Clases activas',
          description: 'Número de clases con estado "activa". Las clases inactivas o suspendidas no se cuentan.',
          color: '#6366f1',
        },
        {
          icon: 'bi-journal-text',
          title: 'Planes esta semana',
          description: 'Planificaciones con fecha de inicio en los últimos 7 días. Muestra cuántas fueron ejecutadas y cuántas siguen pendientes.',
          color: '#10b981',
        },
        {
          icon: 'bi-calendar-check',
          title: 'Asistencia (7 días)',
          description: 'Porcentaje de asistencia del total de la institución en los últimos 7 días. Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%.',
          color: '#f59e0b',
        },
        {
          icon: 'bi-exclamation-triangle-fill',
          title: 'Alumnos con asistencia baja',
          description: 'Alumnos que en las últimas 4 semanas tuvieron menos del 70% de asistencia (mínimo 4 clases evaluadas). Requieren atención prioritaria.',
          color: '#ef4444',
        },
        {
          icon: 'bi-grid-1x2',
          title: 'Acceso rápido',
          description: 'Los 4 cards al pie llevan directamente a Planificación, Seguimiento de alumnos, Evaluaciones y Reportes.',
          color: '#0d6efd',
        },
      ],
    })
  })
```

- [ ] **Step 4: Verificar en browser**

Navegar a Dashboard Pedagógico. Debe aparecer el botón `?` en el header. Al hacer clic: panel desliza desde la derecha con las 6 secciones explicadas. Clic en overlay o `✕` cierra el panel.

- [ ] **Step 5: Commit**

```bash
git add src/modules/pedagogico/views/dashboardPedagogicoView.js
git commit -m "feat(pedagogico): add help panel to dashboard view"
```

---

## Task 3: Agregar ayuda a Seguimiento de Alumnos

**Files:**
- Modify: `src/modules/pedagogico/views/seguimientoAlumnosView.js`

- [ ] **Step 1: Agregar el import de HelpPanel**

```js
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
```

- [ ] **Step 2: Agregar el botón `?` en el header dentro de `_render()`**

En `_render()`, en el bloque `d-flex align-items-center gap-3 mb-4`, después del `<div class="flex-grow-1">...</div>`:
```html
<button class="btn btn-sm btn-outline-secondary" id="btn-help-seguimiento" title="¿Cómo funciona esta pantalla?">
  <i class="bi bi-question-lg"></i>
</button>
```

- [ ] **Step 3: Agregar el event listener en `_attachEvents()`**

Agregar al inicio de `_attachEvents()` (antes del evento de búsqueda):
```js
  state.container.querySelector('#btn-help-seguimiento')?.addEventListener('click', () => {
    HelpPanel.open({
      title: 'Seguimiento de Alumnos',
      intro: 'Vista unificada del estado académico de cada alumno. Los alumnos con riesgo aparecen primero, destacados con una barra lateral amarilla.',
      sections: [
        {
          icon: 'bi-search',
          title: 'Buscador',
          description: 'Filtrá por nombre del alumno o por instrumento en tiempo real.',
          color: '#6c757d',
        },
        {
          icon: 'bi-exclamation-triangle-fill',
          title: 'Alerta de riesgo',
          description: 'Aparece cuando hay alumnos que requieren atención. Muestra el total de alumnos con algún indicador de riesgo activo.',
          color: '#f59e0b',
        },
        {
          icon: 'bi-person-fill',
          title: 'Fila del alumno',
          description: 'Cada fila muestra nombre, instrumento, porcentaje de asistencia (últimas 4 semanas) y promedio de las últimas 3 calificaciones. La barra amarilla izquierda indica riesgo.',
          color: '#0d6efd',
        },
        {
          icon: 'bi-tags-fill',
          title: 'Badges de riesgo',
          description: '"Asistencia baja" aparece cuando el alumno asistió menos del 70% en 4 semanas. "Nota baja" cuando el promedio es menor a 6.0. "Observación" cuando tiene observaciones de tipo disciplina activas.',
          color: '#ef4444',
        },
        {
          icon: 'bi-window-sidebar',
          title: 'Panel de detalle',
          description: 'Al hacer clic en cualquier alumno se abre un panel con: asistencia reciente (últimas 20 clases), últimas calificaciones por clase, y observaciones activas.',
          color: '#10b981',
        },
      ],
    })
  })
```

- [ ] **Step 4: Verificar en browser**

Ir a Seguimiento de Alumnos. Botón `?` visible en header. Clic → panel con 5 secciones. Funciona con Escape y clic en overlay.

- [ ] **Step 5: Commit**

```bash
git add src/modules/pedagogico/views/seguimientoAlumnosView.js
git commit -m "feat(pedagogico): add help panel to student tracking view"
```

---

## Task 4: Agregar ayuda a Reportes Pedagógicos

**Files:**
- Modify: `src/modules/pedagogico/views/reportesPedagogicosView.js`

- [ ] **Step 1: Agregar el import de HelpPanel**

```js
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
```

- [ ] **Step 2: Agregar el botón `?` en el header dentro de `_render()`**

En la función `_render()`, en el bloque `d-flex align-items-center gap-3 mb-4`, después del `<div>` con título y subtítulo:
```html
        <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-help-reportes" title="¿Cómo leer estos reportes?">
          <i class="bi bi-question-lg"></i>
        </button>
```

- [ ] **Step 3: Adjuntar el event listener después de `container.innerHTML = _render(...)`**

En `renderReportesPedagogicosView`, después de `container.innerHTML = _render(rendimientoClases, alumnosRiesgo)`, agregar:

```js
    container.querySelector('#btn-help-reportes')?.addEventListener('click', () => {
      HelpPanel.open({
        title: 'Reportes Pedagógicos',
        intro: 'Vista agregada del rendimiento por clase y de los alumnos con asistencia en riesgo. Útil para detectar patrones y tomar decisiones de intervención.',
        sections: [
          {
            icon: 'bi-table',
            title: 'Tabla de rendimiento por clase',
            description: 'Muestra cada clase activa con: total de alumnos inscriptos, porcentaje de asistencia de las últimas 4 semanas, promedio de calificaciones y nivel de ocupación.',
            color: '#0d6efd',
          },
          {
            icon: 'bi-bar-chart-fill',
            title: 'Barra de ocupación',
            description: 'Verde si la clase tiene menos del 70% de su capacidad ocupada. Amarillo entre 70-90%. Rojo si supera el 90%. Ayuda a detectar clases saturadas.',
            color: '#10b981',
          },
          {
            icon: 'bi-percent',
            title: 'Columna Asistencia',
            description: 'Verde ≥ 80%, amarillo ≥ 60%, rojo < 60%. Basado en registros de las últimas 4 semanas.',
            color: '#f59e0b',
          },
          {
            icon: 'bi-star-half',
            title: 'Columna Prom. Nota',
            description: 'Promedio de todas las calificaciones registradas para la clase. Verde ≥ 7.0, amarillo ≥ 5.0, rojo < 5.0.',
            color: '#6366f1',
          },
          {
            icon: 'bi-exclamation-triangle-fill',
            title: 'Alumnos en riesgo',
            description: 'Alumnos cuya tasa de asistencia cayó por debajo del 70% en las últimas 4 semanas (mínimo 4 clases). Ordenados de menor a mayor asistencia.',
            color: '#ef4444',
          },
        ],
      })
    })
```

- [ ] **Step 4: Verificar en browser**

Ir a Reportes Pedagógicos. Botón `?` visible. Clic → panel con 5 secciones. Datos coherentes con lo que se ve en la tabla.

- [ ] **Step 5: Commit**

```bash
git add src/modules/pedagogico/views/reportesPedagogicosView.js
git commit -m "feat(pedagogico): add help panel to reports view"
```

---

## Task 5: Agregar ayuda a las vistas operativas principales

**Files:**
- Modify: `src/modules/planificacion/views/planificacionView.js`
- Modify: `src/modules/maestros/views/maestrosView.js`
- Modify: `src/modules/clases/views/clasesView.js` *(verificar nombre real del archivo)*

- [ ] **Step 1: Buscar el archivo de vista de clases**

```bash
fd "View" src/modules/clases/views/
```
Usar el nombre real que devuelva. Si el comando fd no está disponible, usar glob para `src/modules/clases/views/*.js`.

- [ ] **Step 2: Agregar ayuda a `planificacionView.js`**

Import al inicio:
```js
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
```

Agregar botón `?` en el header de la vista (junto al título "Planificación"). ID: `btn-help-planificacion`.

Event listener en `_attachEvents` o equivalente:
```js
container.querySelector('#btn-help-planificacion')?.addEventListener('click', () => {
  HelpPanel.open({
    title: 'Planificación',
    intro: 'Módulo para gestionar los planes de clase. Cada plan documenta qué se trabajará en una clase específica, en qué fecha, y si fue ejecutado o no.',
    sections: [
      {
        icon: 'bi-journal-text',
        title: 'Tab Mis Planes',
        description: 'Lista tus planes de clase personales. Podés filtrar por estado (planificado, ejecutado, cancelado) y crear nuevos planes desde el botón "Nuevo plan".',
        color: '#0d6efd',
      },
      {
        icon: 'bi-file-earmark-template',
        title: 'Tab Plantillas',
        description: 'Plantillas reutilizables de planes de clase escritas en formato DSL. Sirven como base para crear planes nuevos rápidamente.',
        color: '#6366f1',
      },
      {
        icon: 'bi-journal-check',
        title: 'Vista Todas las Planes (admin)',
        description: 'Visible solo para administradores. Muestra los planes de todos los maestros, útil para supervisión y revisión curricular.',
        color: '#10b981',
      },
      {
        icon: 'bi-circle-fill',
        title: 'Estados del plan',
        description: '"Planificado" = preparado pero no dictado aún. "Ejecutado" = clase dada. "Cancelado" = no se realizó. Mantener los estados actualizados mejora los reportes.',
        color: '#f59e0b',
      },
    ],
  })
})
```

- [ ] **Step 3: Agregar ayuda a `maestrosView.js`**

Import:
```js
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
```

Agregar botón `?` en el header de la vista (junto al título "Maestros"). ID: `btn-help-maestros`.

Event listener en `_attachEvents` o equivalente:
```js
container.querySelector('#btn-help-maestros')?.addEventListener('click', () => {
  HelpPanel.open({
    title: 'Maestros',
    intro: 'Gestión del plantel docente. Desde acá podés ver, agregar, editar y desactivar maestros, y acceder al perfil completo de cada uno.',
    sections: [
      {
        icon: 'bi-search',
        title: 'Buscador y filtros',
        description: 'Filtrá por nombre, instrumento o estado (activo/inactivo). La búsqueda es en tiempo real.',
        color: '#6c757d',
      },
      {
        icon: 'bi-person-badge',
        title: 'Tarjeta de maestro',
        description: 'Muestra nombre, instrumento principal, cantidad de clases activas y estado. El badge verde indica activo, gris indica inactivo.',
        color: '#0d6efd',
      },
      {
        icon: 'bi-eye',
        title: 'Ver perfil',
        description: 'Abre el perfil completo del maestro: datos personales, clases que dicta (titular y suplente), horarios y ocupación por clase.',
        color: '#10b981',
      },
      {
        icon: 'bi-pencil',
        title: 'Editar desde el perfil',
        description: 'Desde el perfil del maestro podés editar cualquier clase que dicte directamente, sin salir del modal.',
        color: '#f59e0b',
      },
      {
        icon: 'bi-person-x',
        title: 'Desactivar maestro',
        description: 'Desactivar un maestro lo oculta de las listas operativas pero conserva su historial. No se puede eliminar si tiene clases o planificaciones asociadas.',
        color: '#ef4444',
      },
    ],
  })
})
```

- [ ] **Step 4: Agregar ayuda a la vista de Clases**

Leer el archivo de vista de clases para entender su estructura, luego aplicar el mismo patrón.

Import:
```js
import { HelpPanel } from '../../../shared/components/HelpPanel.js'
```

Botón `?` en header. ID: `btn-help-clases`.

Event listener:
```js
container.querySelector('#btn-help-clases')?.addEventListener('click', () => {
  HelpPanel.open({
    title: 'Clases',
    intro: 'Gestión completa de clases: creación, horarios, asignación de maestros, inscripción de alumnos y control de capacidad.',
    sections: [
      {
        icon: 'bi-easel2',
        title: 'Lista de clases',
        description: 'Todas las clases del sistema. Podés filtrar por instrumento, nivel y estado. Las clases activas aparecen primero.',
        color: '#0d6efd',
      },
      {
        icon: 'bi-clock',
        title: 'Horarios',
        description: 'Cada clase puede tener múltiples horarios semanales. El sistema detecta automáticamente conflictos de salón y de maestro.',
        color: '#6366f1',
      },
      {
        icon: 'bi-people',
        title: 'Inscripción de alumnos',
        description: 'Clases "Grupal": todos comparten el mismo horario. Clases "Rotativa (Turnos)": cada alumno tiene su propio horario individual dentro de la clase.',
        color: '#10b981',
      },
      {
        icon: 'bi-bar-chart',
        title: 'Capacidad',
        description: 'Barra de ocupación: compara alumnos inscriptos vs capacidad máxima configurada. Rojo cuando supera el 90%.',
        color: '#f59e0b',
      },
      {
        icon: 'bi-person-workspace',
        title: 'Maestro titular y suplente',
        description: 'Cada clase tiene un maestro principal obligatorio y puede tener un suplente opcional. Ambos aparecen en el perfil del maestro correspondiente.',
        color: '#6c757d',
      },
    ],
  })
})
```

- [ ] **Step 5: Verificar en browser las 3 vistas**

- Planificación → `?` → panel con 4 secciones ✓
- Maestros → `?` → panel con 5 secciones ✓
- Clases → `?` → panel con 5 secciones ✓

- [ ] **Step 6: Commit**

```bash
git add src/modules/planificacion/views/planificacionView.js \
        src/modules/maestros/views/maestrosView.js \
        src/modules/clases/views/clasesView.js
git commit -m "feat(views): add contextual help panel to operational views"
```

---

## Self-Review

### Spec coverage
| Requisito | Task |
|-----------|------|
| Botón de ayuda/info en cada vista | Tasks 2, 3, 4, 5 |
| Explicación de qué hace cada vista | Todos los `intro` en cada `HelpPanel.open()` |
| Explicación de cada sección/elemento | Todos los `sections[]` en cada config |
| Componente reutilizable (DRY) | Task 1 — un solo `HelpPanel.js` |
| Sin dependencia de Bootstrap JS | Task 1 — CSS inyectado, sin `bootstrap.bundle.js` |
| Cierre con Escape y click en overlay | Task 1 — listeners en `_ensureDOM()` |
| Dashboard pedagógico | Task 2 |
| Seguimiento de alumnos | Task 3 |
| Reportes pedagógicos | Task 4 |
| Planificación, Maestros, Clases | Task 5 |

### Placeholder scan
- Todos los `sections[]` tienen contenido real ✓
- Ningún paso dice "implementar apropiadamente" ✓
- Todos los IDs de botones son únicos por vista ✓

### Type consistency
- `HelpPanel.open({ title, intro, sections })` — misma firma en todos los calls ✓
- `sections[].icon` = string Bootstrap Icon class (ej. `'bi-people-fill'`) — consistente ✓
- `sections[].color` = string hex color — opcional, consistente ✓
