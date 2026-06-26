# SP-0 — Substrato de Tareas (Hermes Orquestador)

**Fecha**: 2026-06-26
**Estado**: Diseño aprobado con condiciones (v2 — incorpora review de auditoría/seguridad)
**Programa**: Hermes como Orquestador Central de Operaciones Departamentales
**Sub-proyecto**: SP-0 (keystone — base de SP-1..SP-5)
**Rama**: `claude/flamboyant-ardinghelli-d6aeb6`

> **v2**: incorpora 6 condiciones obligatorias de la review:
> (1) actor real del cambio ≠ asignado_a; (2) `tarea_historial` inmutable;
> (3) `correlation_id` para agrupar casos/procedimientos; (4) constraint vía bloque `DO`;
> (5) adjuntos con `storage_path`; (6) `observada` exige comentario.
> Más recomendación: componentizar `tareasView.js`.

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
entidad de dominio, agruparse en un caso/procedimiento, acumular comentarios, registrar su
historial de forma confiable y portar evidencias. Hoy el modelo de tarea no soporta nada de
eso. SP-0 lo agrega de forma **aditiva**, sin reescribir lo que ya usan 4 portales
(ACM, ADM, COM, TECNICO).

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

1. Agregar el estado `observada` al ciclo de vida de la tarea (con comentario obligatorio).
2. Asociar cualquier tarea a una entidad de dominio (alumno, maestro, postulante,
   representante, instrumento, evento u otro) sin requerir que todas esas tablas existan.
3. **Agrupar tareas en un caso/procedimiento** mediante `correlation_id`.
4. Registrar comentarios internos por tarea (hilo auditable).
5. Registrar el historial de cambios con el **actor real** que ejecutó el cambio, en una tabla
   **inmutable** para usuarios.
6. Estandarizar adjuntos con `storage_path` (no sólo `url`) sobre `documentos_adjuntos`.
7. Enriquecer `tareasView.js` de forma aditiva y componentizada.

## No-objetivos (fuera de SP-0)

- Reglas finas de visibilidad por departamento (RLS completa) → **SP-1**.
- Wiring de portales FIN/Maestros y creación de LOG/Inventario/Lutería → **SP-2**.
- Portal Director standalone con vista de procedimientos → **SP-3**.
- Orquestación por eventos de dominio (flujos instrumento dañado / alumno en riesgo) → **SP-4**.
- Capa conversacional de consulta de Hermes → **SP-5**.
- Reescribir `tareasView.js` o `scoreDirectorView.js`. Los cambios son aditivos.

---

## Decisiones arquitecturales

### D1 — Asociación polimórfica de entidad

Se modela la entidad asociada de forma **polimórfica** (`entidad_tipo` + `entidad_id` +
`entidad_label`), NO con FKs duras por entidad.

**Razones:** (1) `instrumentos` no existe todavía → FK dura imposible hoy; (2) SP-4 asocia
tareas a entidades dinámicamente; (3) un único modelo cubre las 7 entidades.

**Trade-off:** se pierde integridad referencial a nivel DB. Mitigación: CHECK sobre
`entidad_tipo` (conjunto cerrado), `entidad_label` denormalizado (la vista no joinea y el dato
sobrevive a borrados), validación en API.

### D2 — `correlation_id` para agrupar el caso (review #3)

`entidad_id` agrupa por **objeto**; `correlation_id` agrupa por **caso/incidente**. Un mismo
instrumento puede generar varios incidentes en el año; cada incidente Hermes comparte un
`correlation_id` entre TODAS las tareas que dispara (Lutería, Inventario, Finanzas, Académico,
Comunicación). Es la columna que permite al Director reconstruir "este procedimiento" en SP-3 y
el fan-out cross-depto en SP-4.

- Se genera al originar el caso (un evento Hermes, una cascada, o manualmente).
- Tareas sin caso explícito reciben su propio `correlation_id` (default `gen_random_uuid()`),
  de modo que toda tarea es agrupable.

### D3 — Actor real del cambio (review #1)

El actor de un cambio ≠ `asignado_a`. La API que ejecuta una actualización debe setear
`updated_by` / `updated_by_nombre` en la fila; el trigger de historial copia ESE valor como
actor. Si la API no lo provee, el actor queda `NULL` (nunca se infiere desde `asignado_a`).

### D4 — Historial inmutable (review #2)

`tarea_historial` es de sólo lectura para usuarios. Inserción **únicamente** por el trigger
(`SECURITY DEFINER`). Sin `INSERT`/`UPDATE`/`DELETE` para `authenticated` ni `anon`.

### D5 — `observada` exige comentario (review #6)

La transición a `observada` se hace por un RPC atómico que inserta el comentario y cambia el
estado en una sola transacción. El path de UPDATE directo rechaza `estado='observada'`.

---

## Requisitos

### R1 — Estado `observada` con comentario obligatorio

- **Escenario**: marcar `observada` con comentario.
  - Dado una tarea en `en_progreso`
  - Cuando se invoca el RPC `fn_observar_tarea(tarea_id, comentario, actor)`
  - Entonces la tarea pasa a `observada`, se inserta el comentario, y el trigger registra el
    cambio de estado en `tarea_historial` con el actor real.
- **Escenario**: `observada` sin comentario es rechazada.
  - Dado un UPDATE directo `estado='observada'` sin comentario
  - Entonces la operación es rechazada (no se permite `observada` por el path directo).

### R2 — Asociación de entidad

- **Escenario**: tarea asociada a un alumno.
  - Cuando se asigna `entidad_tipo='alumno'`, `entidad_id=<uuid>`, `entidad_label='Juan Pérez'`
  - Entonces persiste la asociación y la vista muestra el chip "Alumno: Juan Pérez".
- **Escenario**: tipo inválido rechazado por CHECK.
- **Escenario**: asociación a `instrumento` aceptada aunque la tabla no exista (sin FK).

### R3 — Agrupación por `correlation_id`

- **Escenario**: varias tareas de un mismo caso comparten `correlation_id`.
  - Dado un caso que genera tareas para Lutería, Inventario y Finanzas
  - Entonces las tres comparten el mismo `correlation_id` y se pueden listar juntas.
- **Escenario**: tarea ad-hoc recibe su propio `correlation_id` por default.

### R4 — Comentarios internos

- **Escenario**: agregar comentario.
  - Cuando un usuario agrega un comentario con su identidad
  - Entonces se inserta en `tarea_comentarios` con `autor_id`/`autor_nombre` y timestamp, y
    aparece en el hilo ordenado por fecha.

### R5 — Historial automático con actor real e inmutable

- **Escenario**: cambio de estado registra al actor real.
  - Dado una tarea asignada a Finanzas
  - Cuando el Director (actor) la cambia a `observada`
  - Entonces `tarea_historial` registra `actor_nombre='Director...'`, NO Finanzas.
- **Escenario**: cambios irrelevantes no generan historial (sólo `updated_at`).
- **Escenario**: usuario autenticado NO puede insertar/editar/borrar `tarea_historial`.
- Campos auditados: `estado`, `asignado_a`, `prioridad`, `fecha_vencimiento`, entidad,
  `correlation_id`.

### R6 — Adjuntos con `storage_path`

- **Escenario**: adjuntar archivo robusto.
  - Cuando se agrega `{id, nombre, storage_path, mime_type, size_bytes, subido_por,
    subido_por_nombre, created_at}`
  - Entonces se anexa a `documentos_adjuntos` y la vista genera la URL firmada al vuelo desde
    `storage_path`.

### R7 — Vista enriquecida y componentizada

`tareasView.js` muestra entidad, caso (`correlation_id`), comentarios, historial, adjuntos y
`observada`, delegando en sub-componentes: `taskEntityChip`, `taskCommentsPanel`,
`taskHistoryTimeline`, `taskAttachmentsPanel`, `taskStatusBadge`. La funcionalidad previa
(filtros, checklist, modal, teardown) se mantiene.

### R8 — RLS

`tarea_comentarios`: `authenticated` lee/inserta (refinamiento por depto en SP-1), `anon`
denegado. `tarea_historial`: `authenticated` sólo SELECT; inserción sólo por trigger; `anon`
denegado.

---

## Modelo de datos (DDL previsto)

```sql
-- R1: nuevo estado (migration aislada — ADD VALUE no es transaccional)
ALTER TYPE public.tarea_institucional_estado ADD VALUE IF NOT EXISTS 'observada';

-- R2 + R3 + D3: entidad polimórfica, correlation_id, actor del cambio
ALTER TABLE public.tareas_institucionales
  ADD COLUMN IF NOT EXISTS entidad_tipo text,
  ADD COLUMN IF NOT EXISTS entidad_id uuid,
  ADD COLUMN IF NOT EXISTS entidad_label text,
  ADD COLUMN IF NOT EXISTS correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by_nombre text;

-- review #4: constraint vía bloque DO (ADD CONSTRAINT IF NOT EXISTS no existe en PG)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tareas_entidad_tipo_check'
  ) THEN
    ALTER TABLE public.tareas_institucionales
      ADD CONSTRAINT tareas_entidad_tipo_check CHECK (
        entidad_tipo IS NULL OR entidad_tipo IN
        ('alumno','maestro','postulante','representante','instrumento','evento','otro')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tareas_entidad
  ON public.tareas_institucionales (entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_tareas_correlation
  ON public.tareas_institucionales (correlation_id);

-- R4: comentarios
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

-- R5 + D3 + D4: historial con actor real, inmutable
CREATE TABLE IF NOT EXISTS public.tarea_historial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL REFERENCES public.tareas_institucionales(id) ON DELETE CASCADE,
  campo text NOT NULL,
  valor_anterior text,
  valor_nuevo text,
  actor_id uuid,
  actor_nombre text,
  actor_rol text,
  actor_departamento text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tarea_historial_tarea
  ON public.tarea_historial (tarea_id, created_at);

-- Trigger: AFTER UPDATE, compara campos auditados, registra deltas con actor = NEW.updated_by.
CREATE OR REPLACE FUNCTION public.fn_tarea_log_historial()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
    INSERT INTO public.tarea_historial (tarea_id, campo, valor_anterior, valor_nuevo,
      actor_id, actor_nombre)
    VALUES (NEW.id, 'estado', OLD.estado::text, NEW.estado::text,
      NEW.updated_by, NEW.updated_by_nombre);
  END IF;
  -- idem para asignado_a, prioridad, fecha_vencimiento, entidad_*, correlation_id
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_tarea_log_historial ON public.tareas_institucionales;
CREATE TRIGGER trg_tarea_log_historial
  AFTER UPDATE ON public.tareas_institucionales
  FOR EACH ROW EXECUTE FUNCTION public.fn_tarea_log_historial();

-- R1 + D5: RPC atómico para observar (comentario obligatorio)
CREATE OR REPLACE FUNCTION public.fn_observar_tarea(
  p_tarea_id uuid, p_comentario text, p_actor_id uuid, p_actor_nombre text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_comentario IS NULL OR length(trim(p_comentario)) = 0 THEN
    RAISE EXCEPTION 'observar requiere comentario';
  END IF;
  INSERT INTO public.tarea_comentarios (tarea_id, autor_id, autor_nombre, cuerpo)
    VALUES (p_tarea_id, p_actor_id, p_actor_nombre, p_comentario);
  UPDATE public.tareas_institucionales
    SET estado = 'observada', updated_by = p_actor_id, updated_by_nombre = p_actor_nombre,
        updated_at = now()
    WHERE id = p_tarea_id;
END $$;

-- R8 + D4: RLS
ALTER TABLE public.tarea_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarea_historial   ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tarea_comentarios FROM anon;
REVOKE ALL ON public.tarea_historial   FROM anon, authenticated;  -- historial inmutable
GRANT SELECT, INSERT ON public.tarea_comentarios TO authenticated;
GRANT SELECT ON public.tarea_historial TO authenticated;           -- sólo lectura
-- policies authenticated; el trigger (SECURITY DEFINER) inserta historial sin grant directo.
REVOKE EXECUTE ON FUNCTION public.fn_observar_tarea(uuid,text,uuid,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.fn_observar_tarea(uuid,text,uuid,text) TO authenticated;
```

> Notas: el `ADD VALUE` del enum va en su **propia migration** (no transaccional con el resto).
> El historial inmutable funciona porque el trigger es `SECURITY DEFINER`: inserta con los
> privilegios del owner aunque `authenticated` no tenga `INSERT`.

## Forma estándar de adjunto (review #5)

```json
{
  "id": "uuid",
  "nombre": "reporte-danio.jpg",
  "storage_path": "tareas/<tarea_id>/<uuid>.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 234000,
  "subido_por": "uuid",
  "subido_por_nombre": "Omar Suniaga",
  "created_at": "2026-06-26T12:00:00Z"
}
```

La URL se genera firmada al vuelo desde `storage_path` (no se persiste la URL).

## Flujo de datos

```
tareasView.js
  ├─ read:  tarea + comentarios + historial + adjuntos (URL firmada desde storage_path)
  ├─ write estado normal: UPDATE (API setea updated_by) → trigger → tarea_historial (actor real)
  ├─ write observada:      RPC fn_observar_tarea (comentario + estado, atómico)
  └─ write comentario:     INSERT tarea_comentarios
```

## Capa de API (módulo `hermes`, patrón DataAdapter)

`tareasSupabase.js` / `tareasApi.js` ganan:
- `listarComentarios(tareaId)`, `agregarComentario(tareaId, cuerpo, actor)`
- `listarHistorial(tareaId)`
- `actualizarEntidadAsociada(tareaId, { tipo, id, label }, actor)`
- `agregarAdjunto(tareaId, adjunto)` + `urlFirmada(storage_path)`
- `observarTarea(tareaId, comentario, actor)` → RPC `fn_observar_tarea`
- Todo método de actualización pasa el **actor real** (usuario en sesión), seteando
  `updated_by`/`updated_by_nombre`.

`tareasMock.js` agrega datos de ejemplo con los nuevos campos (regla "Mock First").

## Componentización de la vista (recomendación de review)

Sub-módulos de render (Vanilla JS, patrón `components/` del proyecto), para que
`tareasView.js` no crezca sin control:
`taskEntityChip`, `taskCommentsPanel`, `taskHistoryTimeline`, `taskAttachmentsPanel`,
`taskStatusBadge`.

## Testing (strict_tdd activo)

- **DB**: trigger `fn_tarea_log_historial` — UPDATE de estado → exactamente 1 fila con actor
  = `updated_by` (no `asignado_a`); UPDATE irrelevante → 0 filas. `fn_observar_tarea` sin
  comentario → excepción. `authenticated` INSERT en `tarea_historial` → denegado.
- **API**: Vitest + mocks Supabase para comentarios, historial, entidad, adjunto, observar.
- **Regresión**: suite de `tareasView` verde.

---

## Criterios de aceptación

- [ ] `observada` existe y sólo se alcanza vía RPC con comentario no vacío.
- [ ] Asociación a las 7 entidades; CHECK rechaza tipo inválido; `instrumento` sin FK funciona.
- [ ] `correlation_id` agrupa tareas de un mismo caso; ad-hoc recibe uno por default.
- [ ] Comentarios con autor real, ordenados.
- [ ] Historial registra el **actor que ejecutó** el cambio (no el asignado).
- [ ] `tarea_historial` no es insertable/editable/borrable por `authenticated`.
- [ ] Adjuntos con `storage_path`; URL firmada al vuelo.
- [ ] Vista muestra entidad, caso, comentarios, historial, adjuntos, `observada`, componentizada.
- [ ] Funcionalidad previa de `tareasView.js` intacta.
- [ ] `anon` no accede a `tarea_comentarios` ni `tarea_historial`.
- [ ] Funciona en Demo (mocks) y Real (Supabase).
- [ ] Suite verde; build verde.

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Pérdida de integridad referencial (polimórfico) | CHECK en tipo + `entidad_label` denormalizado + validación API |
| `ADD VALUE` al enum no transaccional | Migration aislada |
| Romper `tareasView.js` (423 líneas en uso) | Cambios aditivos + componentización + test de regresión |
| Actor real ausente si la API no setea `updated_by` | Actor queda `NULL` (nunca se infiere de `asignado_a`); revisión en code review |
| Historial manipulable | RLS sin INSERT/UPDATE/DELETE para usuarios; sólo trigger `SECURITY DEFINER` |
| `observada` sin contexto | RPC atómico que exige comentario; path directo rechazado |
```
