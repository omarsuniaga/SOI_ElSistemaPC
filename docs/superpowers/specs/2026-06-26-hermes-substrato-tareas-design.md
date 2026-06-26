# SP-0 — Substrato de Tareas (Hermes Orquestador)

**Fecha**: 2026-06-26
**Estado**: Diseño aprobado → spec
**Programa**: Hermes como Orquestador Central de Operaciones Departamentales
**Sub-proyecto**: SP-0 (keystone — base de SP-1..SP-5)
**Rama**: `claude/flamboyant-ardinghelli-d6aeb6`

---

## Contexto

El programa Hermes convierte la PWA en un sistema operativo institucional: Hermes recibe
eventos, identifica protocolos, divide procedimientos en tareas y las delega a los
departamentos, que las gestionan desde `tareasView.js`. El Director supervisa el avance global.

Hermes ya está construido en ~70%: existen `tareas_institucionales`, la cascada
evento→protocolo→tareas (trigger SQL), `tareasView.js` (vista departamental, 423 líneas),
`scoreDirectorView.js` (KPIs Director), edge functions y un clasificador IA (Groq).

**SP-0 es el cimiento.** Los flujos cross-departamentales (SP-4: instrumento dañado, alumno
en riesgo) y la supervisión del Director (SP-3) requieren que cada tarea pueda asociarse a una
entidad de dominio, acumular comentarios, registrar su historial y portar evidencias. Hoy el
modelo de tarea no soporta nada de eso. SP-0 lo agrega de forma **aditiva**, sin reescribir lo
que ya usan 4 portales (ACM, ADM, COM, TECNICO).

### Estado verificado de la base (2026-06-26)

- Enum `tarea_institucional_estado`: `pendiente, en_progreso, completada, bloqueada, cancelada`
  → falta `observada`.
- Columnas de `tareas_institucionales`: `id, event_id, titulo, descripcion, departamento,
  asignado_a, estado, prioridad, fecha_vencimiento, checklist, feedback, created_at,
  updated_at, minuta_id, documentos_adjuntos`.
- Tablas de entidad existentes: `alumnos`, `maestros`, `postulantes`, `profiles`,
  `representantes` (todas PK `uuid`). **`instrumentos` NO existe aún** (llega en SP-2).

---

## Objetivos

1. Agregar el estado `observada` al ciclo de vida de la tarea.
2. Permitir asociar cualquier tarea a una entidad de dominio (alumno, maestro, postulante,
   representante, instrumento, evento u otro) sin requerir que todas esas tablas existan.
3. Registrar comentarios internos por tarea (hilo auditable).
4. Registrar automáticamente el historial de cambios de cada tarea (quién, cuándo, qué).
5. Estandarizar adjuntos sobre el `documentos_adjuntos` jsonb ya existente.
6. Enriquecer `tareasView.js` para mostrar y operar todo lo anterior, de forma aditiva.

## No-objetivos (fuera de SP-0)

- Reglas finas de visibilidad por departamento (RLS completa) → **SP-1**.
- Wiring de portales FIN/Maestros y creación de LOG/Inventario/Lutería → **SP-2**.
- Portal Director standalone con vista de procedimientos → **SP-3**.
- Orquestación por eventos de dominio (flujos instrumento dañado / alumno en riesgo) → **SP-4**.
- Capa conversacional de consulta de Hermes → **SP-5**.
- Reescribir `tareasView.js` o `scoreDirectorView.js`. Los cambios son additivos.

---

## Decisión arquitectural: asociación polimórfica de entidad

Se modela la entidad asociada de forma **polimórfica** (`entidad_tipo` + `entidad_id` +
`entidad_label`), NO con FKs duras por entidad.

**Razones:**
1. `instrumentos` no existe todavía; una FK dura sería imposible de declarar hoy.
2. SP-4 asocia tareas a entidades dinámicamente (un caso de instrumento dañado crea tareas en
   5 departamentos, todas apuntando al mismo instrumento).
3. Un único modelo cubre las 7 entidades sin multiplicar columnas nullable.

**Trade-off:** se pierde integridad referencial a nivel DB (una tarea puede apuntar a una
entidad borrada). Se mitiga con:
- CHECK sobre `entidad_tipo` (conjunto cerrado de valores).
- `entidad_label` denormalizado: la vista muestra el nombre sin joinear, y el dato sobrevive
  aunque la entidad origen cambie o se borre.
- Validación en la capa de API antes de insertar.

---

## Requisitos

### R1 — Estado `observada`

El ciclo de vida de la tarea debe incluir `observada` (tarea revisada y devuelta con
observaciones, distinta de `bloqueada` que implica impedimento externo).

- **Escenario**: un coordinador marca una tarea como `observada` con un comentario.
  - Dado una tarea en estado `en_progreso`
  - Cuando se cambia su estado a `observada`
  - Entonces la tarea queda en `observada`, el cambio se registra en `tarea_historial`, y la
    UI la muestra con badge distintivo.

### R2 — Asociación de entidad

Toda tarea puede (opcionalmente) asociarse a una entidad de dominio.

- **Escenario**: tarea asociada a un alumno.
  - Dado que se crea/edita una tarea
  - Cuando se asigna `entidad_tipo='alumno'`, `entidad_id=<uuid>`, `entidad_label='Juan Pérez'`
  - Entonces la tarea persiste la asociación y la vista muestra un chip "Alumno: Juan Pérez".
- **Escenario**: tipo inválido es rechazado.
  - Dado un intento de guardar `entidad_tipo='banco'`
  - Entonces la DB rechaza por CHECK constraint.
- **Escenario**: asociación a instrumento (entidad futura).
  - Dado `entidad_tipo='instrumento'` con un `entidad_id` cualquiera
  - Entonces se acepta aunque la tabla `instrumentos` aún no exista (sin FK).

### R3 — Comentarios internos

Cada tarea acumula comentarios internos en un hilo auditable.

- **Escenario**: agregar comentario.
  - Dado una tarea existente
  - Cuando un usuario agrega un comentario
  - Entonces se inserta en `tarea_comentarios` con autor y timestamp, y aparece en el hilo
    ordenado por fecha.

### R4 — Historial automático de cambios

Los cambios de campos clave de una tarea se registran automáticamente.

- **Escenario**: cambio de estado registrado.
  - Dado una tarea en `pendiente`
  - Cuando cambia a `en_progreso`
  - Entonces un trigger inserta en `tarea_historial` una fila
    `(campo='estado', valor_anterior='pendiente', valor_nuevo='en_progreso', actor, timestamp)`.
- **Escenario**: cambios sin relevancia no generan ruido.
  - Dado una actualización que sólo toca `updated_at`
  - Entonces NO se registra historial.
- Campos auditados: `estado`, `asignado_a`, `prioridad`, `fecha_vencimiento`.

### R5 — Adjuntos estandarizados

Los adjuntos usan el `documentos_adjuntos` jsonb con forma estándar.

- **Escenario**: adjuntar archivo.
  - Dado una tarea
  - Cuando se agrega un adjunto `{nombre, url, tipo, subido_por, created_at}`
  - Entonces se anexa al array `documentos_adjuntos` y la vista lo lista con enlace.

### R6 — Vista enriquecida

`tareasView.js` muestra y opera entidad, comentarios, historial, adjuntos y estado `observada`,
sin perder la funcionalidad actual (filtros, checklist, modal de edición, teardown).

- **Escenario**: regresión.
  - Dado los filtros y el checklist existentes
  - Cuando se carga la vista enriquecida
  - Entonces el comportamiento previo se mantiene intacto.

### R7 — RLS mínima de tablas nuevas

`tarea_comentarios` y `tarea_historial` no son accesibles por `anon`; lectura/escritura para
`authenticated` (refinamiento por departamento en SP-1).

- **Escenario**: anon bloqueado.
  - Dado un cliente anónimo
  - Cuando consulta `tarea_comentarios` o `tarea_historial`
  - Entonces la consulta es denegada por RLS.

---

## Modelo de datos (DDL previsto)

```sql
-- R1: nuevo estado
ALTER TYPE public.tarea_institucional_estado ADD VALUE IF NOT EXISTS 'observada';

-- R2: asociación polimórfica
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS entidad_tipo text,
  ADD COLUMN IF NOT EXISTS entidad_id uuid,
  ADD COLUMN IF NOT EXISTS entidad_label text;
ALTER TABLE public.tareas_institucionales
  ADD CONSTRAINT tareas_entidad_tipo_check CHECK (
    entidad_tipo IS NULL OR entidad_tipo IN
    ('alumno','maestro','postulante','representante','instrumento','evento','otro')
  );
CREATE INDEX IF NOT EXISTS idx_tareas_entidad
  ON public.tareas_institucionales (entidad_tipo, entidad_id);

-- R3: comentarios
CREATE TABLE IF NOT EXISTS public.tarea_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL REFERENCES public.tareas_institucionales(id) ON DELETE CASCADE,
  autor_id uuid,
  autor_nombre text,
  cuerpo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tarea_comentarios_tarea
  ON public.tarea_comentarios (tarea_id, created_at);

-- R4: historial + trigger
CREATE TABLE IF NOT EXISTS public.tarea_historial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL REFERENCES public.tareas_institucionales(id) ON DELETE CASCADE,
  campo text NOT NULL,
  valor_anterior text,
  valor_nuevo text,
  actor_nombre text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tarea_historial_tarea
  ON public.tarea_historial (tarea_id, created_at);

-- fn_tarea_log_historial(): AFTER UPDATE, compara campos auditados y registra deltas.
-- actor_nombre se toma de NEW.asignado_a o de un GUC/claim si está disponible.

-- R7: RLS
ALTER TABLE public.tarea_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarea_historial   ENABLE ROW LEVEL SECURITY;
-- policies: authenticated full; REVOKE anon. (Refinamiento por depto → SP-1.)
```

> El enum `ADD VALUE` no corre dentro de transacción con otros statements en algunas versiones
> de Postgres. Se aísla en su propia migration si hace falta.

## Flujo de datos

```
tareasView.js
  ├─ read:  tarea + tarea_comentarios + tarea_historial + documentos_adjuntos
  ├─ write: cambio de estado / asignación / prioridad
  │           └─> UPDATE tareas_institucionales
  │                 └─> trigger fn_tarea_log_historial → INSERT tarea_historial
  └─ write: nuevo comentario → INSERT tarea_comentarios
```

## Capa de API (módulo `hermes`)

`tareasSupabase.js` / `tareasApi.js` ganan:
- `listarComentarios(tareaId)`, `agregarComentario(tareaId, cuerpo)`
- `listarHistorial(tareaId)`
- `actualizarEntidadAsociada(tareaId, { tipo, id, label })`
- `agregarAdjunto(tareaId, adjunto)`
- `actualizarEstado(tareaId, estado)` debe aceptar `observada`.

Se respeta el patrón DataAdapter (mock + real). `tareasMock.js` agrega datos de ejemplo para
los nuevos campos para que la feature funcione en Demo mode (regla "Mock First" del proyecto).

## Testing (strict_tdd activo)

- **DB**: test del trigger `fn_tarea_log_historial` — un UPDATE de estado produce exactamente
  una fila de historial; un UPDATE irrelevante no produce ninguna.
- **API**: Vitest + mocks Supabase para los nuevos métodos (comentarios, historial, entidad,
  adjunto, estado `observada`).
- **Regresión**: la suite existente de `tareasView` sigue verde.

---

## Criterios de aceptación

- [ ] `observada` existe en el enum y es seleccionable en la UI.
- [ ] Una tarea puede asociarse a alumno/maestro/postulante/representante/instrumento/evento/otro.
- [ ] CHECK rechaza `entidad_tipo` inválido.
- [ ] Asociar a `instrumento` funciona sin que exista la tabla `instrumentos`.
- [ ] Comentarios se agregan y listan ordenados.
- [ ] Cambiar estado/asignación/prioridad/vencimiento genera historial automático.
- [ ] Adjuntos se agregan y listan con la forma estándar.
- [ ] `tareasView.js` muestra entidad, comentarios, historial, adjuntos y `observada`.
- [ ] Funcionalidad previa de `tareasView.js` intacta.
- [ ] `anon` no accede a `tarea_comentarios` ni `tarea_historial`.
- [ ] Funciona en Demo mode (mocks) y Real mode (Supabase).
- [ ] Suite de tests verde; build verde.

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Pérdida de integridad referencial (polimórfico) | CHECK en tipo + `entidad_label` denormalizado + validación API |
| `ADD VALUE` al enum no transaccional | Migration aislada |
| Romper `tareasView.js` (423 líneas en uso) | Cambios aditivos + test de regresión |
| `actor_nombre` sin contexto de usuario en trigger | Fallback a `asignado_a`; usuario real vía claim cuando exista (SP-1) |
