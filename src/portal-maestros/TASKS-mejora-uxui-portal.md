# Tasks — Mejora UX/UI Portal Maestros

**Change:** `mejora-uxui-portal`  
**Fecha:** 2026-05-10  

---

## Fase 1: Fundamentos CSS

### 1.1 [CSS] Nuevos tokens y spacing en `01-tokens.css`

**Archivo:** `src/portal-maestros/styles/01-tokens.css`  
**Cambios:**
- Agregar spacing scale (4, 8, 12, 16, 20, 24, 32, 40, 48, 64px)
- Agregar breakpoints como CSS custom properties
- Agregar layout tokens (sidebar-w, content-max-w, max-width)
- Agregar shadow scale (sm/md/lg/xl)
- Agregar transition tokens (fast/base/slow/spring)
- Agregar density tokens (compact/normal/dense por breakpoint)

**Verificar:** `npm run dev` sin errores, tokens accesibles en DevTools

---

### 1.2 [CSS] Animaciones y utilidades en `02-base.css`

**Archivo:** `src/portal-maestros/styles/02-base.css`  
**Cambios:**
- Agregar `@keyframes pm-view-in` (fade + translateY)
- Agregar skeleton loader (`.pm-skeleton`, `.pm-skeleton-text`, pulse animation)
- Agregar `.pm-card-hover` con lift effect
- Agregar `.pm-section-divider`
- Agregar `.pm-visually-hidden` (accessibility)
- Agregar utility classes: `.pm-text-center`, `.pm-mt-4`, `.pm-mb-4`, `.pm-gap-4`

**Verificar:** Animaciones suaves, skeleton visible durante loading

---

### 1.3 [CSS] Header y shell en `03-layout.css`

**Archivo:** `src/portal-maestros/styles/03-layout.css`  
**Cambios:**

#### Header tablet+ (≥ 768px):
```css
@media (min-width: 768px) {
  .pm-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    padding: 0 1.25rem;
  }
  
  .pm-header-left { min-width: 0; }
  .pm-header-title { font-size: 1.25rem; }
  
  /* Tabs horizontales (reemplazan bottom nav) */
  .pm-header-tabs {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    overflow-x: auto;
  }
  
  .pm-header-tab {
    padding: 0.5rem 1rem;
    border-radius: var(--pm-radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background var(--pm-transition-fast);
    background: none;
    border: none;
    color: rgba(255,255,255,0.7);
  }
  
  .pm-header-tab:hover { background: rgba(255,255,255,0.15); }
  .pm-header-tab.active { background: rgba(255,255,255,0.25); color: #fff; }
}
```

#### Header desktop (≥ 1024px):
```css
@media (min-width: 1024px) {
  .pm-header {
    grid-template-columns: auto 1fr auto auto;
  }
  
  .pm-header-greeting { display: block; font-size: 0.7rem; }
  .pm-header-title { font-size: 1.25rem; }
  
  /* Search en header */
  .pm-header-search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255,255,255,0.15);
    border-radius: var(--pm-radius-sm);
    padding: 0.4rem 0.75rem;
    max-width: 240px;
  }
  
  .pm-header-search input {
    background: none;
    border: none;
    color: #fff;
    font-size: 0.85rem;
    outline: none;
    width: 100%;
  }
  
  .pm-header-search input::placeholder { color: rgba(255,255,255,0.6); }
}
```

#### Bottom nav hidden en tablet+:
```css
@media (min-width: 768px) {
  .pm-bottom-nav { display: none; }
}
```

#### View container:
```css
@media (min-width: 768px) {
  .pm-view {
    padding: 1.25rem;
    max-width: 100%;
  }
}

@media (min-width: 1024px) {
  .pm-view {
    padding: 2rem 2.5rem;
    max-width: var(--pm-content-max-w, 900px);
  }
}
```

**Verificar:** Header con tabs en tablet, search visible en desktop, bottom nav oculto

---

### 1.4 [CSS] Reescribir `10-responsive.css`

**Archivo:** `src/portal-maestros/styles/10-responsive.css`  
**Reemplazar todo el contenido** con la nueva estrategia adaptativa completa (，移动端 + tablet + desktop).

**Verificar:** Ninguna vista tiene scroll horizontal, todos los breakpoints cubiertos

---

## Fase 2: Componentes y Vistas

### 2.1 [CSS] Modales y drawers adaptativos en `04-components.css`

**Archivo:** `src/portal-maestros/styles/04-components.css`  
**Cambios:**

```css
/* Modal: desktop centered, mobile full-screen drawer */
@media (max-width: 767px) {
  .pm-modal-overlay { align-items: flex-end; padding: 0; }
  .pm-modal-content { border-radius: var(--pm-radius) var(--pm-radius) 0 0; max-width: 100%; }
}

@media (min-width: 768px) {
  .pm-modal-content { max-width: 480px; }
}
```

**Verificar:** Modal se comportacorrectamente en cada breakpoint

---

### 2.2 [CSS] Métricas, calendario y hoy en `05-views.css`

**Archivo:** `src/portal-maestros/styles/05-views.css`  
**Cambios:**

#### Métricas KPI cards — tablet:
```css
@media (min-width: 768px) {
  .pm-metricas-kpis {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  
  .pm-metricas-clases {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
```

#### Métricas KPI cards — desktop:
```css
@media (min-width: 1024px) {
  .pm-metricas-kpis {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }
  
  .pm-metricas-kpi {
    padding: 1rem 0.5rem;
  }
  
  .pm-kpi-value { font-size: 2rem; }
  .pm-kpi-label { font-size: 0.6rem; }
  
  .pm-metricas-clases {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pm-metricas-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
```

#### Calendario — desktop (mes completo):
```css
@media (min-width: 1024px) {
  .pm-cal-grid { gap: 4px; }
  .pm-cal-day { font-size: 0.9rem; }
}
```

#### Login — desktop centrado:
```css
@media (min-width: 1024px) {
  .pm-login {
    align-items: center;
    padding: 2rem;
  }
  
  .pm-login-card {
    max-width: 400px;
  }
}
```

**Verificar:** Metricas en desktop tiene 6 KPIs visibles, calendario muestra mes completo

---

### 2.3 [CSS] Ausencias y módulos en `06-modules.css`

**Archivo:** `src/portal-maestros/styles/06-modules.css`  
**Cambios:** Ausencias dashboard con 2-3 columnas en tablet, stat cards inline en desktop.

**Verificar:** Ausencias legibles en tablet sin scroll horizontal

---

### 2.4 [CSS] DSL editor adaptativo en `07-dsl.css`

**Archivo:** `src/portal-maestros/styles/07-dsl.css`  
**Cambios:** Editor 100% width en desktop, toolbar en 2 líneas en mobile.

**Verificar:** DSL editor usable en todos los breakpoints

---

### 2.5 [CSS] Apple design responsivo en `08-apple.css`

**Archivo:** `src/portal-maestros/styles/08-apple.css`  
**Cambios:** Botones con media queries para touch vs pointer, modales adaptativos.

**Verificar:** Apple buttons consistentes en todos los breakpoints

---

### 2.6 [CSS] Route tree y gamificación en `09-routes.css`

**Archivo:** `src/portal-maestros/styles/09-routes.css`  
**Cambios:** Route tree en columnas en desktop, colapsable en mobile.

**Verificar:** Route tree navegable en todos los breakpoints

---

### 2.7 [CSS] Forms y planificación en `11-forms.css`

**Archivo:** `src/portal-maestros/styles/11-forms.css`  
**Cambios:** Grid 2 columnas en tablet, forms de planificación adaptativos.

**Verificar:** Settings readable en tablet, planificación con mejor layout

---

## Fase 3: JS Shell

### 3.1 [JS] Breakpoint detection y layout switch en `main-maestros.js`

**Archivo:** `src/main-maestros.js`  
**Cambios:**

1. Agregar breakpoint detection:
```js
export function getBreakpoint() {
  const w = window.innerWidth
  if (w < 768)  return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}
```

2. Actualizar `_renderShell` para mostrar tabs en tablet+:
```js
function _renderShell(app, maestro) {
  const bp = getBreakpoint()
  const showHeaderTabs = bp !== 'mobile'
  const showBottomNav = bp === 'mobile'
  
  // Render tabs o bottom nav según breakpoint
}
```

3. Listen resize para actualizar layout:
```js
window.addEventListener('resize', debounce(() => {
  const bp = getBreakpoint()
  // toggle classes en body: .pm-layout-mobile, .pm-layout-tablet, .pm-layout-desktop
}, 150))
```

4. Keyboard shortcuts para desktop:
```js
if (getBreakpoint() === 'desktop') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'g' && e.key === 'h') router.navigate('hoy')
    if (e.key === 'g' && e.key === 'c') router.navigate('calendario')
    if (e.key === 'g' && e.key === 'r') router.navigate('ruta')
    if (e.key === 'g' && e.key === 'm') router.navigate('metricas')
  })
}
```

**Verificar:** Header tabs aparecen al ensanchar ventana, desaparecen en mobile

---

### 3.2 [JS] Sidebar adaptativo en `studentProgressPanel.js`

**Archivo:** `src/portal-maestros/components/studentProgressPanel.js`  
**Cambios:**

```js
import { getBreakpoint } from '../../main-maestros.js'

function _adaptToBreakpoint() {
  const bp = getBreakpoint()
  if (bp === 'desktop') {
    panel.style.width = 'var(--pm-sidebar-w)'
    panel.style.right = 'auto'
    panel.style.left = '0'
    panel.style.position = 'sticky'
  } else {
    panel.style.width = bp === 'tablet' ? '80vw' : '90vw'
    panel.style.right = '0'
    panel.style.left = 'auto'
    panel.style.position = 'fixed'
  }
}

export function createStudentProgressPanel(container, options) {
  // ... existing code ...
  
  return {
    open() { _adaptToBreakpoint(); /* ... */ },
    // ...
  }
}
```

**Verificar:** Panel lateral fijo en desktop, drawer en tablet/mobile

---

### 3.3 [JS] Transiciones adaptativas en `portalRouter.js`

**Archivo:** `src/portal-maestros/router/portalRouter.js`  
**Cambios:**

```js
// Agregar animate-in class según breakpoint
function navigate(route) {
  history.pushState({}, '', `#/${route}`)
  const view = document.querySelector('.pm-view-content.active')
  if (view) {
    view.classList.remove('pm-animate-slide-down')
    void view.offsetWidth // force reflow
    view.classList.add('pm-animate-slide-down')
  }
  // update active tab
}
```

**Verificar:** Transiciones suaves sin flash

---

## Fase 4: Verificación

### Test Matrix

| View | Mobile (375px) | Tablet (768px) | Desktop (1440px) |
|------|---------------|----------------|------------------|
| Login | ✅ centrado | ✅ centrado | ✅ centrado |
| Hoy | ✅ cards stacked | ✅ 2 cols | ✅ dense |
| Asistencia | ✅ usable | ✅ drawer side | ✅ centered |
| Calendario | ✅ semana | ✅ mes | ✅ mes |
| Métricas | ✅ KPIs 3 col | ✅ 3 col | ✅ 6 col |
| Perfil | ✅ stacked | ✅ 2 cols | ✅ layout completo |
| Gamificación | ✅ scrollable | ✅ grid 2 | ✅ sidebar |

### Checkpoints finales

- [ ] 0 scroll horizontal en todas las vistas
- [ ] Touch targets ≥ 44px en mobile
- [ ] Cards no cortadas a mitad
- [ ] Metricas view tiene jerarquía en desktop
- [ ] Header tabs visibles en tablet
- [ ] Bottom nav oculto en tablet+
- [ ] Sidebar visible y fija en desktop
- [ ] Dark mode consistente en todos los breakpoints
- [ ] Animaciones suaves sin jank
- [ ] No hay console errors en ningún breakpoint