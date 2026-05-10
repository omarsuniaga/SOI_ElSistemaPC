# SPEC — Portal Maestros PWA
## Vanilla JS Implementation

**Proyecto:** PWA del Maestro  
**Módulo:** Portal Maestros  
**Stack:** Vanilla JS (ES Modules) + Supabase  
**Versión:** 1.0.0  
**Estado:** Implementado  
**Fecha:** 2026-05-10

---

## 1. Stack Tecnológico

- **Frontend:** Vanilla JavaScript (ES Modules) — NO Vue, NO React
- **Data Layer:** Supabase (en producción) / JSON mocks (en demo)
- **Estilos:** CSS modular (11 archivos temáticos) + Apple Design Tokens
- **Router:** Hash-based SPA router custom (`portalRouter.js`)
- **Auth:** Supabase Auth con caché en localStorage
- **Caché:** ViewCache in-memory + prefetch mensual

---

## 2. Arquitectura de Archivos

```
src/portal-maestros/
├── auth/
│   ├── maestroAuth.js          # Login, logout, detección de rol
│   └── usePortalAuth.js        # Hook-style auth helper
├── components/
│   ├── AlertModal.js
│   ├── AsistenciaLista.js
│   ├── AutocompletePopup.js
│   ├── ContentSelectionPanel.js
│   ├── dslEditor.js            # Editor DSL con highlight en tiempo real
│   ├── dslToolbar.js
│   ├── EvaluationDrawer.js
│   ├── HomeworkPanel.js
│   ├── LevelCompletionModal.js
│   ├── NodeEvaluationCard.js
│   ├── routeTreeBar.js
│   ├── studentProgressPanel.js # Panel lateral de progreso
│   └── ... (27 componentes)
├── data/                        # JSON mocks para modo demo
│   ├── ausencias.json
│   ├── clases.json
│   └── sesiones.json
├── router/
│   └── portalRouter.js         # Router SPA hash-based
├── services/                    # 20 servicios de datos
│   ├── aiService.js
│   ├── catalogService.js       # Catálogo para autocompletado
│   ├── classEventService.js
│   ├── evaluationService.js
│   ├── groqService.js          # Integración con Groq/LLM
│   ├── maestroDataService.js    # Centraliza queries de Supabase
│   ├── rutaService.js
│   ├── viewCache.js            # Caché in-memory
│   └── ...
├── styles/                      # CSS modular
│   ├── 01-tokens.css           # Design tokens (Apple)
│   ├── 02-base.css              # Reset, animaciones, utilidades
│   ├── 03-layout.css           # Header, bottom nav, view container
│   ├── 04-components.css       # Modales, drawers, forms
│   ├── 05-views.css             # Login, asistencia, calendario
│   ├── 06-modules.css           # Ausencias, tareas
│   ├── 07-dsl.css               # DSL editor
│   ├── 08-apple.css             # Apple Design System
│   ├── 09-routes.css            # Route tree, gamificación
│   ├── 10-responsive.css         # Breakpoints mobile-first
│   ├── 11-forms.css             # Forms, planificación
│   ├── index.css               # Main import
│   └── portal.css              # LEGACY — mantener por compatibilidad
├── utils/
│   ├── dslParser.js            # Parser del DSL pedagógico
│   └── portalUtils.js
└── views/
    ├── loginView.js
    ├── hoyView.js
    ├── asistenciaView.js
    ├── calendarioView.js
    ├── metricasView.js
    ├── perfilView.js
    ├── planificacionView.js
    ├── rutaPlayerView.js
    └── ... (17 vistas)
```

---

## 3. Patrones de Código

### 3.1 Componentes (Factory Pattern)

```js
export function createComponentName(container, options) {
  // Render
  container.innerHTML = `...`;

  // State
  let _state = null;

  // Event delegation
  container.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    // ...
  });

  // Public API
  async function open() { /* ... */ }
  function close() { /* ... */ }
  function destroy() { /* ... */ }

  return { open, close, destroy };
}
```

### 3.2 Servicios de Datos

```js
// Centralizan queries a Supabase con caché
export async function getMisClases(forceRefresh = false) {
  const cached = viewCache.getCached(cacheKey);
  if (!forceRefresh && cached) return cached;

  const { data } = await supabase.from('clases').select('...');
  viewCache.set(cacheKey, data);
  return data;
}
```

### 3.3 DSL Pedagógico

Lenguaje estructurado para registrar contenido de clase:

```
#AnaPerez [Detaché en semicorcheas] (Practicar con metrónomo a 60 bpm) {Estudiar compases 1-8} >NIVEL-10 >NODO:ARCO
```

Tokens:
- `#alumno` — Nombre del alumno
- `[contenido]` — Contenido trabajado
- `(sugerencia)` — Sugerencia para casa
- `{tarea}` — Tarea asignada
- `$medida` — Medida o métrica
- `>NIVEL-N` — Nivel de la ruta
- `>NODO:NOMBRE` — Nodo específico
- `:::CAPA:` — Separador de capas (TECNICA, CORE, REPERTORIO)
- `X/5` — Calificación

---

## 4. Estados del Sistema

### Asistencia
```
present | absent | late | excused
```

### Progress (Nodos/Indicadores)
```
pending → in_process → approved
                  ↘ failed
```

### Planning Status
```
draft → ai_reviewed → pending_academic_review → approved → active → paused → completed
```

### Route Status
```
draft → published → archived
```

---

## 5. Rutas del Router

| Ruta | View |
|------|------|
| `login` | LoginView |
| `hoy` | HoyView (dashboard diario) |
| `asistencia` | AsistenciaView |
| `calendario` | CalendarioView |
| `metricas` | MetricasView |
| `planificacion` | PlanificacionView |
| `perfil` | PerfilView |
| `ruta-player` | RutaPlayerView |
| `route-library` | RouteLibraryView |
| `route-detail/:id` | RouteDetailView |
| `alumno/:id` | AlumnoPerfilView |

---

## 6. DataAdapter Pattern

Todo acceso a datos pasa por servicios, nunca directo a Supabase desde la UI:

```
View → Service → Supabase
              ↘ JSON Mock (demo mode)
```

---

## 7. MVP Features

- ✅ Login con verificación de rol maestro
- ✅ Dashboard diario (clases de hoy)
- ✅ Registro de asistencia (P/A/J/L)
- ✅ Calendario mensual con sesiones
- ✅ Panel de métricas
- ✅ DSL Editor con autocompletado
- ✅ Sistema de evaluación de nodos
- ✅ Progreso de alumno por ruta
- ✅ Panel de ausencias
- ✅ Gamificación (niveles, logros)
- ✅ Integración con Groq/IA
- ✅ Dark mode
- ✅ PWA installable
- ✅ Offline support (service worker)

---

## 8. RLS / Seguridad

- Maestros: solo ven sus clases y alumnos asignados
- Área académica: ven todos los planes y progresos
- Rutas publicadas: solo lectura para maestros
- Indicadores y evidencias: historial inmutable

---

## 9. Próximos Pasos

1. Tests unitarios para dslParser
2. Tests de integración para servicios
3. Migrar portal.css legacy → index.css modular
4. Documentar API de cada servicio
5. Implementar edge functions para snapshots de clase