# SPEC — Mejora UX/UI Portal Maestros

**Change:** `mejora-uxui-portal`  
**Fase:** SPEC  
**Fecha:** 2026-05-10  

---

## 1. Layout Grid

### 1.1 Mobile (< 768px)

```css
@media (max-width: 767px) {
  .pm-view {
    padding: 0.75rem;
    max-width: 100%;
  }
  
  .pm-metricas-kpis {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .pm-metricas-clases {
    grid-template-columns: 1fr;
  }
  
  /* Cards full width, stacked */
  .pm-clase-card,
  .pm-metricas-clase-card,
  .pm-metricas-link {
    width: 100%;
  }
  
  /* Sidebar hidden, toggle via button */
  .pm-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--pm-sidebar-w);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 300;
  }
  
  .pm-sidebar.open {
    transform: translateX(0);
  }
  
  /* Bottom nav visible */
  .pm-bottom-nav {
    display: flex;
  }
  
  /* Header compact */
  .pm-header-greeting { display: none; }
}
```

### 1.2 Tablet (768px – 1023px)

```css
@media (min-width: 768px) and (max-width: 1023px) {
  .pm-view {
    padding: 1.25rem;
    max-width: 100%;
  }
  
  /* Grid 2 columnas */
  .pm-metricas-kpis {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .pm-metricas-clases {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Bottom nav: tabs horizontales en header */
  .pm-bottom-nav {
    display: none; /* hidden en tablet */
  }
  
  .pm-header-tabs {
    display: flex;
    gap: 0.25rem;
  }
  
  /* Sidebar: overlay */
  .pm-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: min(280px, 80vw);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 300;
  }
  
  .pm-sidebar.open {
    transform: translateX(0);
  }
}
```

### 1.3 Desktop (≥ 1024px)

```css
@media (min-width: 1024px) {
  .pm-shell {
    display: grid;
    grid-template-columns: var(--pm-sidebar-w) 1fr;
    grid-template-rows: var(--pm-header-h) 1fr;
    min-height: 100vh;
  }
  
  .pm-header {
    grid-column: 1 / -1;
    /* Tabs horizontales + search + avatar */
  }
  
  .pm-sidebar {
    grid-row: 2;
    position: sticky;
    top: var(--pm-header-h);
    height: calc(100vh - var(--pm-header-h));
    transform: none; /* visible por defecto */
    overflow-y: auto;
  }
  
  .pm-view {
    max-width: var(--pm-content-max-w, 900px);
    padding: 1.5rem 2rem;
  }
  
  /* Grid 3+ columnas para métricas */
  .pm-metricas-kpis {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
  }
  
  .pm-metricas-clases {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pm-clase-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
  }
  
  /* Accesos rápidos en grid horizontal */
  .pm-metricas-links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
```

---

## 2. Tokens de Espaciado

```css
:root {
  /* Spacing (4px base) */
  --pm-space-1:   4px;
  --pm-space-2:   8px;
  --pm-space-3:  12px;
  --pm-space-4:  16px;
  --pm-space-5:  20px;
  --pm-space-6:  24px;
  --pm-space-8:  32px;
  --pm-space-10: 40px;
  --pm-space-12: 48px;
  --pm-space-16: 64px;

  /* Layout */
  --pm-sidebar-w: 280px;
  --pm-content-max-w: 900px;
  --pm-max-width: 1400px;
  
  /* Shadows */
  --pm-shadow-sm:  0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
  --pm-shadow-md:  0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.06);
  --pm-shadow-lg:  0 8px 24px rgba(0,0,0,.1),  0 4px 8px rgba(0,0,0,.06);
  --pm-shadow-xl:  0 16px 40px rgba(0,0,0,.12);
  
  /* Transitions */
  --pm-transition-fast:   150ms ease;
  --pm-transition-base:   200ms ease;
  --pm-transition-slow:   300ms ease;
  --pm-transition-spring: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Componentes Adaptativos

### 3.1 Header

**Mobile:** Compacto con avatar, menú hamburger, notificaciones, sync indicator  
**Tablet:** Tabs horizontales en header, más espacio para título  
**Desktop:** Breadcrumb de ruta actual + search expandible + avatar

### 3.2 KPI Cards

**Mobile:** 3 columnas, valor + label mínimo  
**Tablet:** 3 columnas, más contexto (trend indicator)  
**Desktop:** 6 columnas en 2 filas, valor grande + label + mini sparkline

### 3.3 Clase Cards

**Mobile:** Nombre + instrumento + estado de registro  
**Tablet:** + hora + count alumnos  
**Desktop:** + última fecha de clase + progreso visual

### 3.4 Sidebar de Alumno (studentProgressPanel)

**Mobile:** Drawer desde la izquierda, 90vw  
**Tablet:** Drawer 80vw  
**Desktop:** Panel lateral fijo de 280px, visible al hacer hover/click en card de alumno

---

## 4. Requisitos de Comportamiento

### 4.1 Navegación

- Desktop: shortcuts de teclado (G+H para home, G+C calendario, etc.)
- Tablet+: sidebar toggle visible en header
- Mobile: bottom nav con tabs

### 4.2 Transiciones

- Cambio de breakpoint: ajuste suave sin flash
- Vista a vista: fade-in 250ms
- Sidebar open/close: slide 300ms con backdrop en mobile/tablet
- Cards hover: translateY(-2px) + shadow lift

### 4.3 Empty States

Cada vista con datos vacíos debe mostrar:
- Icono contextual
- Título descriptivo
- Texto explicativo
- CTA si corresponde ("Crear una clase", "Agregar alumnos")

### 4.4 Loading States

- Skeleton loaders para cards (no spinners)
- Staggered animation para múltiples skeletons

### 4.5 Skeleton Loader

```css
@keyframes pm-skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.pm-skeleton {
  background: var(--pm-border);
  border-radius: var(--pm-radius-sm);
  animation: pm-skeleton-pulse 1.5s ease-in-out infinite;
}

.pm-skeleton-text {
  height: 12px;
  margin-bottom: 8px;
}

.pm-skeleton-text:last-child {
  width: 60%;
}
```

---

## 5. Estados UI

### 5.1 Breakpoint States

```js
const BREAKPOINTS = {
  mobile:  { max: 767,  name: 'mobile',  icon: 'bi-phone' },
  tablet:  { min: 768, max: 1023, name: 'tablet',  icon: 'bi-tablet-landscape' },
  desktop: { min: 1024, name: 'desktop', icon: 'bi-pc-display' },
}
```

### 5.2 Sidebar States

```js
const SIDEBAR_STATES = {
  hidden:     { desktop: true, tablet: false, mobile: false },
  collapsed:  { desktop: false, tablet: true,  mobile: true },
  expanded:   { desktop: true,  tablet: true,  mobile: true },
}
```

### 5.3 View Density

| Breakpoint | Density | Content width |
|------------|---------|---------------|
| Mobile | Compact | 100% |
| Tablet | Normal | 100% (2 col grid) |
| Desktop | Dense | 900px max |

---

## 6. Testing

### 6.1 Breakpoint Tests

| Dispositivo | Viewport | Verificar |
|------------|----------|-----------|
| iPhone SE | 375×667 | Bottom nav visible, cards full-width |
| Pixel 4 | 393×851 | Touch targets 44px+, cards stacked |
| iPad Mini | 768×1024 | Tabs en header, 2 col grid, sidebar toggle |
| iPad Pro | 1024×1366 | Sidebar visible, KPIs 6 cols |
| Desktop HD | 1920×1080 | Layout completo, sobra espacio a los lados |
| Desktop WQHD | 2560×1440 | Centrado con padding, más KPIs por fila |

### 6.2 Checkpoints de UX

- [ ] No hay scroll horizontal en ninguna vista
- [ ] Cards no se cortan a mitad
- [ ] Modal/drawer no tapa contenido crítico en desktop
- [ ] Navegación entre tabs es instantánea (< 100ms percibido)
- [ ] Sidebar no interfere con contenido en desktop
- [ ] Metricas view tiene jerarquía visual clara en desktop
- [ ] Touch targets mínimo 44×44px en mobile