# Programa Hermes — Orquestador Central de Operaciones

> **Fuente de verdad** del ecosistema Hermes. Si vas a construir algo que toque tareas,
> casos, departamentos o instrumentos, **leé esto primero** para no reconstruir lo que ya existe.

Hermes convierte la PWA en un sistema operativo institucional: recibe eventos, identifica el
protocolo, divide el procedimiento en tareas, las delega a los departamentos (que las gestionan
desde `tareasView.js`) y mantiene trazabilidad. La Dirección supervisa el avance global.

---

## Mapa de sub-proyectos (SP-0 → SP-5)

| SP | Qué aporta | Estado |
|----|------------|--------|
| **SP-0** | Substrato de tareas: entidad polimórfica, `correlation_id`, comentarios, historial inmutable con actor real, estado `observada` | ✅ en master |
| **SP-1** | Seguridad RLS: tablas core authenticated-only, anon revocado | ✅ |
| **SP-2** | Departamento `LUT`, tabla `instrumentos`, portal Lutería (stub), módulo instrumentos, wiring Inventario/LOG | ✅ |
| **SP-3** | Vista Director: procedimientos consolidados por `correlation_id` | ✅ |
| **SP-4** | Flujos de dominio: fan-out cross-departamental (instrumento dañado, alumno en riesgo) | ✅ |
| **SP-5** | Consulta Hermes: respuestas factuales deterministas (sin LLM) | ✅ |
| **SP-6** | Lutería Profesional (taller: órdenes, diagnóstico, presupuesto, insumos) | 🚧 en `opencode/luteria-taller` |

---

## Concepto clave: `correlation_id` (el CASO)

- `entidad_id` agrupa por **objeto** (este instrumento, este alumno).
- `correlation_id` agrupa por **caso/incidente**. Un violín dañado 3 veces = 3 casos distintos.
- Todas las tareas que dispara un evento Hermes comparten el mismo `correlation_id` → la Dirección
  reconstruye "este procedimiento" y los flujos cross-departamentales se mantienen unidos.

---

## Modelo de datos

### `tareas_institucionales` (núcleo)
`id, titulo, descripcion, departamento (DIR|ACM|ADM|FIN|LOG|COM|TECNICO|LUT), asignado_a,`
`estado (pendiente|en_progreso|completada|bloqueada|cancelada|observada), prioridad,`
`fecha_vencimiento, checklist, feedback, documentos_adjuntos,`
`entidad_tipo, entidad_id, entidad_label,  -- asociación polimórfica (alumno|maestro|postulante|representante|instrumento|evento|otro)`
`correlation_id,                            -- agrupa el caso`
`updated_by, updated_by_nombre              -- actor REAL del cambio (no el asignado)`

### `tarea_comentarios`
Hilo auditable: `id, tarea_id, autor_id, autor_nombre, cuerpo, created_at`.

### `tarea_historial` (INMUTABLE)
`id, tarea_id, campo, valor_anterior, valor_nuevo, actor_id, actor_nombre, created_at`.
Solo lo escribe el trigger `fn_tarea_log_historial` (SECURITY DEFINER). `authenticated` solo
puede SELECT — no INSERT/UPDATE/DELETE. Garantiza auditoría confiable.

### `instrumentos`
`id, codigo, nombre, tipo, marca, serie,`
`estado (disponible|asignado|danado|en_reparacion|fuera_de_uso), alumno_id, alumno_nombre, notas`.

### `campanias_periodo` / `hermes_protocolos` / `calendario_institucional`
Períodos (inscripción/reinscripción/concierto/microperiodo/servicio), plantillas de protocolo, y
la cascada evento→protocolo→tareas (trigger `fn_hermes_auto_delegar_tareas`).

---

## RPCs (la lógica vive en la DB; el frontend es delgado)

| RPC | Qué hace |
|-----|----------|
| `fn_observar_tarea(tarea, comentario, actor_id, actor_nombre)` | Pasa a `observada` + inserta comentario, atómico. Rechaza comentario vacío. |
| `fn_tarea_log_historial()` (trigger) | Registra deltas de estado/asignado/prioridad/vencimiento/entidad/correlation con el actor real. |
| `fn_procedimientos_resumen()` | Agrupa tareas por `correlation_id`: avance %, desglose de estados, departamentos, prioridad. (SP-3) |
| `fn_reportar_instrumento_danado(instrumento, descripcion, actor_id, actor_nombre)` | Marca instrumento `danado` + fan-out de tareas a LUT/LOG/FIN/ACM/COM con `correlation_id` compartido. (SP-4) |
| `fn_reportar_alumno_riesgo(alumno_id, nombre, motivo, actor_id, actor_nombre)` | Fan-out a ACM/COM/FIN/DIR. (SP-4) |
| `fn_hermes_consulta_estado()` | Snapshot institucional (tareas por estado/departamento, atención inmediata, total procedimientos). (SP-5) |

Todos: `SECURITY DEFINER`, `REVOKE anon`, `GRANT authenticated`.

---

## Frontend

### Capa de datos — patrón DataAdapter
Cada módulo tiene `api/` con: `<x>Api.js` (dispatcher mock/real según `VITE_USE_MOCK`) +
`<x>Mock.js` + `<x>Supabase.js`. **Regla Mock First**: toda feature funciona en Demo mode.

Módulo `src/modules/hermes/api/`:
- Tareas: `getTareas`, `getTareasByDepartamento`, `updateTareaEstado`, `observarTarea`, `agregarComentario`,
  `listarHistorial`, `actualizarEntidadAsociada`, `agregarAdjunto`, `urlFirmada`.
- SP-3/4/5: `getProcedimientos`, `reportarAlumnoRiesgo`, `getConsultaEstado`.

Módulo `src/modules/instrumentos/api/`: `listarInstrumentos`, `crearInstrumento`,
`cambiarEstadoInstrumento`, `asignarInstrumento`, `reportarInstrumentoDanado`.

### Vistas
| Vista | Ruta | Qué es |
|-------|------|--------|
| `tareasView.js` | `hermes-tareas` | Tareas del departamento (cards, modal con comentarios/historial/adjuntos, `observada` por RPC). Sub-componentes: `taskEntityChip`, `taskCommentsPanel`, `taskHistoryTimeline`, `taskAttachmentsPanel`, `taskStatusBadge`. |
| `procedimientosView.js` | `hermes-procedimientos` | Director: procedimientos por `correlation_id`, % avance, bloqueos. + botón "alumno en riesgo". |
| `hermesConsultaView.js` | `hermes-consulta` | Chat factual: clasifica la pregunta por keywords (sin LLM) y responde desde `fn_hermes_consulta_estado`. |
| `scoreDirectorView.js` | `dir-score` | KPIs por departamento. |
| `instrumentosGestionView.js` | (en Inventario) | Gestión de instrumentos + botón "Reportar daño" (dispara caso Hermes). |
| `luteriaView.js` | `luteria-diagnosticos` | Stub de diagnósticos (lo extiende SP-6). |

### Portales (patrón)
Multi-página Vite: `<portal>.html` en la **raíz** del repo → importa `src/portales/<portal>/<portal>.js`.
- **Shell-based** (`bootAdminPortal` de `adminPortalShell.js`): auto-registra `hermes-tareas` con
  `hermesDept`. Ej: acm, adm, com, tecnico, luteria.
- **Bespoke** (login + dashboard propios): fin (módulo caja), inventario.
Rutas Hermes adicionales (procedimientos, consulta, dir-score) se registran en `adminPortalShell.js`.
Las rutas de módulos se registran vía `allRegistrars.js`.

### Reglas de visibilidad
Hoy solo existen roles `maestro` y `admin`. La separación por departamento es **por vista** (cada
portal pasa su `hermesDept` como filtro de query), no por identidad de usuario. La RLS es
authenticated-only. Cuando exista identidad por departamento, se endurece la RLS.

---

## Flujo de referencia: instrumento dañado (el "reloj suizo")

1. Maestro/Inventario reporta daño → `fn_reportar_instrumento_danado`.
2. Instrumento pasa a `danado`; se crean 5 tareas (LUT/LOG/FIN/ACM/COM) con un `correlation_id` común.
3. Cada departamento ve SU tarea en su portal (`hermes-tareas`), la actualiza (historial registra al actor real).
4. La Dirección ve UN procedimiento consolidado en `hermes-procedimientos`.
5. La Dirección puede preguntar en `hermes-consulta`: "¿qué casos requieren atención inmediata?".

SP-6 (Lutería Pro) profundiza el lado técnico de este flujo: la tarea LUT se convierte en una
**orden de reparación** con diagnóstico, presupuesto, insumos, evidencias y cierre — derivando
cobros a FIN y avisos a COM, siempre con el mismo `correlation_id`.

---

## Convenciones

- Código e identificadores en **inglés**; UI y docs en **español**.
- Commits convencionales. Sin atribución de IA.
- Migraciones: `SECURITY DEFINER` + `REVOKE anon` + `GRANT authenticated` en funciones; RLS
  authenticated-only en tablas. `ALTER TYPE ... ADD VALUE` va en migración aislada.
- **Coordinación multi-agente**: un solo conductor por área, mismo base (`master`), ramas
  separadas, archivos distintos. Es la regla que evita divergencias paralelas.
