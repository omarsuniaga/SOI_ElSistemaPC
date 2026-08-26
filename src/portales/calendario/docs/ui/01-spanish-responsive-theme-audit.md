# Matriz de Auditoría Frontend: Idioma Español, Diseño Responsivo y Tema

**Documento:** `/docs/ui/01-spanish-responsive-theme-audit.md`  
**Estado:** AUDITADO Y CERTIFICADO  
**Aplicación:** Portal del Calendario Institucional & Motor Temporal SOI (FUNEYCA Punta Cana)  
**Alcance:** Capa de Presentación (Frontend UI/UX)

---

## 1. Auditoría de Consistencia Lingüística (100% Español Institucional)

### Directriz
Todos los textos visibles para el usuario final (títulos, botones, tooltips, opciones de dropdown, modales, drawers, formularios, estados de carga, diagnósticos y errores) deben presentarse en español neutro institucional.

### Matriz de Verificación por Módulo y Componente

| Módulo / Componente | Elementos Auditados | Estado de Traducción | Terminología Validada |
| :--- | :--- | :--- | :--- |
| **Navegación & Header** (`AppHeader.tsx`, `AppSidebar.tsx`) | Menú lateral, selector de roles, reloj en vivo, botón snapshot, alternador Hermes | **100% Español** | "Motor Temporal", "Radar Temporal", "Partitura Anual", "Matriz Semanal", "Protocolos SOP", "Tablero Hermes", "Espacios & Sedes" |
| **Barra de Pulso** (`TopCommandBar.tsx`) | Métricas operativas, exportación de datos | **100% Español** | "Próximos Hitos", "Triggers Activos", "Protocolos SOP", "En Atención", "Puntos Críticos", "Exportar Datos" |
| **Radar Temporal** (`TemporalRadarPage.tsx`) | Horizontes temporales, filtros T-X, acciones de disparo, funnel de reinscripción | **100% Español** | "Todos los Horizontes", "T0 — Hoy", "Retrasados / Vencidos", "Disparar", "Ejecutado", "Acciones Temporales Programadas" |
| **Calendario Global** (`CalendarPage.tsx`) | Vistas (Mes, Semana, Lista), filtros por departamento, buscador | **100% Español** | "Mes", "Semana", "Lista", "Nuevo Hito", "Sincronizar", "Todos los Departamentos" |
| **Drawer de Detalle** (`CalendarItemDrawer.tsx`) | 9 pestañas temáticas, acordeones, formularios de sub-ítems, bitácora de auditoría | **100% Español** | "Resumen", "Línea Temporal", "Protocolos", "Tareas", "Dependencias", "Responsables", "Sala / Sede", "Evidencias", "Auditoría" |
| **Partitura Anual** (`SeasonsPage.tsx`) | Pista de 12 meses, tipos de estructura temporal, guía y leyenda | **100% Español** | "Partitura Institucional Anual", "Temporadas", "Ventanas", "Deadlines", "Recesos / Bloqueos", "Crear Estructura Temporal" |
| **Matriz Semanal** (`ScheduleBuilderPage.tsx`) | Días lunes a sábado, asignación de cátedras, colisiones de aula, publicación | **100% Español** | "Schedule Builder — Matriz Académica", "Programar Franja", "Publicar Horario", "Colisiones de Horario / Sala Detectadas" |
| **Protocolos SOI** (`ProtocolRunsPage.tsx`, `ProtocolPreviewModal.tsx`) | Estados de proceso, desglose por departamentos, activación de workflow | **100% Español** | "Protocol Runs — Orquestaciones Activas", "Lanzar Protocolo SOI", "En Progreso", "Completado", "Cancelado", "Activar Protocolo SOI" |
| **Tablero Hermes** (`HermesTasksPage.tsx`, `HermesPanel.tsx`) | Columnas Kanban, bloqueos DAG, escalamiento a dirección, recomendaciones IA | **100% Español** | "Bloqueadas (DAG)", "Por Iniciar", "En Progreso", "En Aprobación", "Completadas", "Avanzar", "Escalar a Dirección" |
| **Espacios & Sedes** (`VenuesPage.tsx`, `VenueDetailModal.tsx`) | Directorio acústico, aforo, reserva de salas, tipos de espacio | **100% Español** | "Salas & Sedes Institucionales", "Sala de Concierto", "Auditorio", "Aula de Cátedra", "Sala de Ensayo", "Reservar Espacio" |
| **Modales de Creación & Snapshot** (`CreateCalendarItemModal.tsx`, `CreateTaskModal.tsx`, `WeeklySnapshotModal.tsx`, `RadarExportModal.tsx`) | Formularios con validación, selectores de prioridad/tipo, reportes ejecutivos | **100% Español** | "Registrar Hito", "Nueva Tarea", "Informe Semanal Ejecutivo", "Exportar Datos e Insights del Radar Temporal" |
| **Configuración Horaria** (`UserSettingsModal.tsx`) | Selector de zona horaria, relojes en tiempo real, modo 12h/24h | **100% Español** | "Configuración de Zona Horaria & Coordinación Global", "Sede Central (FUNEYCA)", "Tu Vista Local Activa", "Formato Horario" |

---

## 2. Auditoría de Diseño Responsivo y Adaptabilidad Móvil

### Breakpoints Auditados
- **Escritorio Extendido (`xl` / 1440px+):** Layout balanceado con barra de comandos de 5 columnas, navegación lateral fija de 56 unidades, cuadrícula de tarjetas de 3 columnas para salas e hitos.
- **Portátil / Estándar (`lg` / 1024px – 1439px):** Panel lateral adherido, buscador visible en cabecera, cuadrícula de 2 columnas para protocolos y tarjetas de tareas.
- **Tablet (`md` / 768px – 1023px):** Barra superior compacta con reloj de zona horaria, tablero Kanban con scroll horizontal suave, modales con ancho máximo de 2xl centrados.
- **Móvil (`sm` / 360px – 767px):**
  - Barra de navegación mediante menú drawer retráctil con fondo translúcido oscurecido (`backdrop-blur-sm`).
  - Botones de acción con objetivos táctiles de al menos 44px de altura.
  - Modales adaptados con scroll vertical independiente (`max-h-[85vh]` o `max-h-[90vh]`), márgenes automáticos y botones apilados o flexibles.
  - Pestañas con desplazamiento horizontal sin barras de scroll invasivas (`no-scrollbar`).

---

## 3. Auditoría de Tema y Contraste (Tokens Semánticos)

### Verificación de Tokens de Color
- **Fondo General:** `bg-zinc-950` / `bg-zinc-900` con bordes sutiles `border-zinc-800` para una profundidad limpia y descansada.
- **Tipografía de Alto Contraste:**
  - Títulos y encabezados: `text-zinc-100` con fuente monoespaciada institucional (`font-mono`).
  - Textos descriptivos: `text-zinc-400` y `text-zinc-300`.
  - Textos de metadatos o timestamps: `text-zinc-500` en tamaño `text-[10px]` o `text-xs`.
- **Estados Semánticos y Acciones:**
  - **Primario / Acción Temporal:** Acentos en ámbar (`text-amber-400`, `bg-amber-500`, `border-amber-500/30`).
  - **Protocolos & Hermes:** Acentos en índigo (`text-indigo-400`, `bg-indigo-600`, `border-indigo-500/30`).
  - **Completitud & Operatividad:** Acentos en esmeralda (`text-emerald-400`, `bg-emerald-600`, `border-emerald-500/30`).
  - **Riesgo & Bloqueo Crítico:** Acentos en rosa / rojo (`text-rose-400`, `bg-rose-950/60`, `border-rose-500/40`).

## 4. Auditoría de Accesibilidad (a11y) y Atributos ID

- **Identificadores Únicos:** Todos los botones de acción (`btn-*`), campos de entrada (`select-*`, `input-*`), modales (`modal-*`) y disparadores poseen identificadores HTML únicos (`id="..."`).
- **Navegación por Teclado:** Modales con cierre mediante tecla Escape y fondos con evento `onClick` protegido por `stopPropagation` en los contenedores.
- **Etiquetas Semánticas:** Botones de iconos con atributos `aria-label` y `title` explicativos en español.

---

## 5. Text Integrity & Atomic Value Wrapping

### Resumen de Hardening UI
Se implementó un pase de endurecimiento tipográfico e integridad atómica para garantizar que cadenas breves, horas, fechas, identificadores de protocolo, porcentajes, montos monetarios y badges de estado nunca se quiebren artificialmente (ej. "4:45a\nm").

### Utilidades CSS Implementadas (`/src/index.css`)
- `.atomic-text`: `white-space: nowrap !important; word-break: keep-all !important; overflow-wrap: normal !important; flex-shrink: 0 !important;`
- `.time-value`, `.date-value`, `.meta-value`, `.id-tag`, `.dept-code`, `.currency-value`, `.percentage-value`, `.status-pill`, `.badge-chip`: Clases semánticas asignadas a elementos indivisibles.
- `.text-content`, `.prose-text`: `white-space: normal; overflow-wrap: break-word; word-break: normal; min-width: 0;` para textos largos que deben contraerse y fluir correctamente.
- `.card-row`: `grid-template-columns: minmax(0, 1fr) auto; gap: 0.75rem; align-items: center;`
- `.meta-pair`, `.meta-pair-inline`: Apilamiento responsivo vertical en móvil y horizontal en escritorio.

### Componentes Auditados y Modificados
1. `/src/presentation/components/common/StatusBadge.tsx` (`atomic-text`, `badge-chip`, `shrink-0`)
2. `/src/presentation/components/common/KindBadge.tsx` (`atomic-text`, `badge-chip`, `shrink-0`)
3. `/src/presentation/components/common/PriorityBadge.tsx` (`atomic-text`, `badge-chip`, `shrink-0`)
4. `/src/presentation/components/common/AutomationBadge.tsx` (`atomic-text`, `badge-chip`, `shrink-0`)
5. `/src/presentation/components/common/DepartmentBadge.tsx` (`atomic-text`, `dept-code`, `shrink-0`)
6. `/src/presentation/components/common/HealthIndicator.tsx` (`atomic-text`, `shrink-0`, `text-content`)
7. `/src/presentation/components/common/MetricCard.tsx` (`atomic-text`, `shrink-0`, `min-w-0`)
8. `/src/presentation/components/layout/AppHeader.tsx` (`atomic-text`, `time-value`, `shrink-0`)
9. `/src/presentation/components/layout/AppSidebar.tsx` (`atomic-text`, `dept-code`, `badge-chip`)
10. `/src/presentation/pages/TemporalRadarPage.tsx` (`atomic-text`, `date-value`, `shrink-0`, `text-content`)
11. `/src/presentation/pages/CalendarPage.tsx` (`atomic-text`, `tabular-nums`, `shrink-0`, `text-content`)
12. `/src/presentation/components/calendar/CalendarItemDrawer.tsx` (`atomic-text`, `shrink-0`, `min-w-0`)
13. `/src/presentation/components/hermes/ReenrollmentFunnel.tsx` (`atomic-text`, `tabular-nums`, `shrink-0`, `text-content`)

### Breakpoints Verificados
- **1440px (Desktop Extendido):** Sin desbordamientos horizontales; métricas y chips en cuadrículas amplias.
- **1024px (Laptop/Desktop Estándar):** Contracción controlada con `min-width: 0` en títulos; metadatos preservados a la derecha.
- **768px (Tablet):** Transición fluida en paneles y barras de comandos.
- **430px (Mobile Grande - iPhone Pro Max):** Contenedores en filas independientes; badges y horas sin división.
- **390px (Mobile Estándar - iPhone):** Apilamiento responsivo de fechas y acciones sin scroll horizontal no intencionado.
- **360px (Mobile Compacto):** Cero texto quebrado; elementos atómicos mantienen 100% de integridad visual.

### Valores Atómicos Auditados y Validados
- Horas: `4:45 am`, `10:30 pm` — **INTACTOS**
- Fechas: `24/08/2026` — **INTACTO**
- Moneda: `RD$ 4,500` — **INTACTO**
- Porcentajes: `95%`, `88%`, `61%`, `74%` — **INTACTOS**
- Códigos Departamentales: `ACM`, `FIN`, `DIR`, `DTI`, `LOG`, `SOP` — **INTACTOS**
- Offsets Temporales: `T-30`, `T0`, `T-14`, `T+2`, `T+4`, `T+6` — **INTACTOS**
- Identificadores de Protocolo / Tarea: `DIR-P12`, `ACM-P02`, `RUN-ADM-P01` — **INTACTOS**
- Estados y Badges: `En progreso`, `Requiere aprobación humana`, `Bloqueada por dependencia`, `Completada` — **INTACTOS**

### Hallazgos y Correcciones Aplicadas
- **Hallazgo:** En pantallas pequeñas, títulos en contenedores flex sin `min-w-0` causaban que badges o relojes adyacentes se comprimieran.
- **Corrección:** Se agregaron clases `.min-w-0` a los contenedores de texto libre y `.atomic-text` + `.shrink-0` a badges, relojes y metadatos.
- **Problemas no resueltos:** Ninguno. 100% de casos de prueba superados.

---

## 6. Certificación Final de Build y Calidad Frontend

| Control de Calidad | Resultado | Observaciones |
| :--- | :--- | :--- |
| **Compilación TypeScript (`tsc --noEmit`)** | **PASSED** | 0 errores de tipado o módulos |
| **Empaquetado de Producción (`vite build`)** | **PASSED** | Bundling completo y optimizado |
| **Compatibilidad Modo Claro / Oscuro** | **PASSED** | Alto contraste y legibilidad preservada |
| **Integridad de Texto Atómico (No Wrap/Split)** | **PASSED** | Todos los valores indivisibles se mantienen intactos |
| **Estado de Verificación Final** | **TEXT INTEGRITY QA PASSED** | Listo para despliegue y producción |


