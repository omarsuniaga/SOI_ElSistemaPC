# SDD — Mejora UX/UI Portal Maestros

**Change:** `mejora-uxui-portal`  
**Módulo:** `src/portal-maestros`  
**Stack:** Vanilla JS + CSS Modular  
**Fecha:** 2026-05-10  
**Estado:** propuesta  

---

## 1. Contexto y Problema

El portal fue diseñado mobile-first pero la experiencia en tablet (768-1024px) y desktop (>1024px) está sub-optimizada:

**Síntomas:**
- Todo centrado con max-width de 1200px —浪费 espacio en pantallas grandes
- Bottom nav ocupa área de contenido en tablet sin aprovechar el borde lateral
- Cards de información compacta que en desktop podrían mostrar más datos
- Sin diferenciación visual entre breakpoints — mismo layout en 320px y 1440px
- Navegación lenta en desktop — todo requiere taps
- Sidebar de progreso de alumno (studentProgressPanel) está en todas las vistas pero es incómoda sin mouse hover

---

## 2. Propuesta

### 2.1 Layout Adaptativo por Breakpoint

| Breakpoint | Ancho | Layout |
|------------|-------|--------|
| **Mobile** | < 768px | Stack vertical, bottom nav, cards full-width |
| **Tablet** | 768–1024px | Grid 2 cols, sidebar colapsable, top nav + tabs |
| **Desktop** | > 1024px | Sidebar + contenido split, información densa, shortcuts keyboard |

### 2.2 Arquitectura de Navegación

```
MOBILE                          TABLET                        DESKTOP
┌──────────────────────┐   ┌────────────────────────────┐  ┌────────────────────────────────────────────┐
│ ▼ Portal Maestros    │   │ ☰  Portal Maestros  ⚙️ 🔔 │  │ ☰ │ Portal Maestros    ⚙️ 🔔 │ Maestro │ │
├──────────────────────┤   ├────────────────────────────┤  ├────┬───────────────────────────────────────┤
│                      │   │  [Hoy][Calend][Ruta][Metr] │  │    │  [Hoy] [Calendario] [Ruta] [Métricas] │ │
│  Content (scroll)    │   ├────────────────────────────┤  │ S  ├───────────────────────────────────────┤
│                      │   │                            │  │ I  │                                       │ │
│  📊 KPIs             │   │   Content (grid 2 cols)    │  │ D  │   Content (split view o grid)         │ │
│  ┌──┐ ┌──┐ ┌──┐     │   │   ┌──────┐  ┌──────┐       │  │ E  │                                       │ │
│  │10│ │25│ │87%│     │   │   │ Card │  │ Card │       │  │ B  │   studentProgressPanel como panel     │ │
│  └──┘ └──┘ └──┘     │   │   └──────┘  └──────┘       │  │ A  │   fijo visible en desktop            │ │
│                      │   │                            │  │ R  │                                       │ │
│  Card 1              │   │   ┌────────────┐            │  │    │                                       │ │
│  Card 2              │   │   │  Card     │            │  │    │                                       │ │
│  Card 3              │   │   │  expandido │            │  │    │                                       │ │
│                      │   │   └────────────┘            │  │    │                                       │ │
├──────────────────────┤   └────────────────────────────┘  └────┴───────────────────────────────────────┘
│ ☰  🏠 Hoy Calend Ruta│   ├────────────────────────────┤
│    Metr  Perfil      │   │ ☰  🏠   Calend  Ruta  Metr │
└──────────────────────┘   └────────────────────────────┘
```

### 2.3 Componentes a Rediseñar

| Componente | Cambio |
|------------|--------|
| `pm-header` | Desktop: incluir breadcrumb de ruta actual, search icon expandible |
| `pm-bottom-nav` | Mobile-only. Tablet+: tabs horizontales en header |
| `pm-view` | Desktop: max-width 100% con sidebar. Tablet: centrado con padding generoso |
| `pm-metricas-kpis` | Desktop: grid 3-6 columnas. Mobile: 3 columnas |
| `pm-clase-card` | Desktop: más info inline (instrumento, alumnos count, última asistencia) |
| `studentProgressPanel` | Desktop: panel lateral fijo. Mobile: drawer desde el borde |
| `pm-alertas-riesgo` | Desktop: expandida con más contexto. Mobile: collapsed con count |
| `pm-calendar-grid` | Desktop: mes completo visible. Mobile: semana |
| Modales/drawers | Desktop: centered modal. Mobile: full-screen drawer |
| Accesos rápidos | Desktop: grid horizontal. Mobile: list |

### 2.4 Tokens Nuevos

```css
/* Spacing system (4px base) */
--pm-space-1:  4px;
--pm-space-2:  8px;
--pm-space-3:  12px;
--pm-space-4:  16px;
--pm-space-5:  20px;
--pm-space-6:  24px;
--pm-space-8:  32px;
--pm-space-10: 40px;
--pm-space-12: 48px;
--pm-space-16: 64px;

/* Breakpoints */
--pm-bp-sm:   576px;
--pm-bp-md:   768px;
--pm-bp-lg:   1024px;
--pm-bp-xl:   1280px;
--pm-bp-2xl:  1440px;

/* Layout */
--pm-sidebar-w: 280px;  /* Desktop sidebar */
--pm-content-max-w: 900px;  /* Contenido sin sidebar */
```

### 2.5 Animaciones y Transiciones

```css
.pm-view-transition {
  animation: pm-view-in 0.25s ease-out;
}

@keyframes pm-view-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Card hover: lift effect */
.pm-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.pm-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,.1);
}
```

---

## 3. Arquitectura de Implementación

### 3.1 Estrategia CSS

**No se crean nuevos archivos.** Se refactorizan los 11 archivos existentes:

1. **`01-tokens.css`** → Agregar spacing system + breakpoints + layout tokens
2. **`02-base.css`** → Agregar animation utilities + skeleton loaders
3. **`03-layout.css`** → Rediseñar header (desktop tabs), viewport, shell
4. **`04-components.css`** → Desktop enhancements (modales, drawers adaptativos)
5. **`05-views.css`** → Rediseñar métricas, calendario, hoy (grids adaptativos)
6. **`06-modules.css`** → Ausencias y tareas adaptativas
7. **`07-dsl.css`** → Editor responsivo
8. **`08-apple.css`** → Apple design responsivo
9. **`09-routes.css`** → Route tree y gamificación adaptativos
10. **`10-responsive.css`** → Reescribir completamente con nueva estrategia
11. **`11-forms.css`** → Forms responsivos, planificación, perfil adaptativo

### 3.2 Estrategia JS

**No se modifican las vistas.** Solo el shell (`main-maestros.js`) y los componentes que se benefician del layout:

1. **`main-maestros.js`** → Agregar breakpoint detection + sidebar toggle
2. **`studentProgressPanel.js`** → Adaptar a panel lateral en desktop
3. **`portalRouter.js`** → Adaptar transitions por breakpoint
4. **`themeToggle.js`** → Mantener (no cambia)

### 3.3 Algoritmo de Breakpoint

```js
export function getBreakpoint() {
  const w = window.innerWidth
  if (w < 768)  return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export function onBreakpointChange(callback) {
  let current = getBreakpoint()
  window.addEventListener('resize', () => {
    const next = getBreakpoint()
    if (next !== current) {
      current = next
      callback(current)
    }
  })
}
```

---

## 4. Tareas de Implementación

### Fase 1: Fundamentos (CSS)

1. **[CSS] Agregar spacing system y layout tokens a `01-tokens.css`**
2. **[CSS] Agregar animaciones y skeleton loaders a `02-base.css`**
3. **[CSS] Rediseñar `03-layout.css` — header adaptativo con tabs en tablet+, sidebar en desktop**
4. **[CSS] Reescribir `10-responsive.css` con media queries para todos los breakpoints**

### Fase 2: Componentes

5. **[CSS] Rediseñar `04-components.css` — modales drawer-side en desktop, centered en mobile**
6. **[CSS] `05-views.css` — métricas grid adaptativo, calendario semana/mes, hoy cards expandidas**
7. **[CSS] `06-modules.css` — ausencias grid, tareas con más info**
8. **[CSS] `07-dsl.css` — editor adaptativo (ancho completo en desktop)**
9. **[CSS] `08-apple.css` — Apple design responsivo mejorado**
10. **[CSS] `09-routes.css` — route tree colapsable, gamificación en grid**
11. **[CSS] `11-forms.css` — planificación y perfil adaptativos**

### Fase 3: JS Shell

12. **[JS] `main-maestros.js` — agregar breakpoint detection, toggle sidebar, keyboard shortcuts desktop**
13. **[JS] `studentProgressPanel.js` — panel lateral en desktop, drawer en mobile/tablet**
14. **[JS] `portalRouter.js` — transiciones adaptativas por breakpoint**

### Fase 4: Verificación

15. **Test mobile** (< 576px) — Pixel 4 / iPhone 12 viewport
16. **Test tablet** (768px) — iPad viewport
17. **Test desktop** (1440px) — Full HD y WQHD
18. **Test dark mode** en todos los breakpoints

---

## 5. Impacto y Riesgos

| Aspecto | Detalle |
|---------|---------|
| **Líneas estimadas** | ~800 CSS nuevos, ~150 JS |
| **Riesgo** | Bajo — solo CSS y shell. Las vistas no cambian su lógica |
| **Compatibilidad** | Mantiene `--pm-radius`, `--pm-primary`, etc. existentes |
| **Backwards** | Todos los selectores existentes siguen funcionando |

---

## 6. Criteria de Éxito

- ✅ Mobile (< 768px): comportamiento actual mejorado, sin regresión
- ✅ Tablet (768-1024px): grid 2 cols, tabs visibles, información densa
- ✅ Desktop (> 1024px): sidebar visible, más info por card, keyboard nav
- ✅ Dark mode: todos los nuevos estilos con tokens correctos
- ✅ No romper ninguna vista existente
- ✅ Metricas view luce como dashboard profesional en desktop
- ✅ El portal se siente "diseñado" y no "responsive-forzado"