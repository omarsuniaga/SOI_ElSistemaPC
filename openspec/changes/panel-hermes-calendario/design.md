# Design: Panel Hermes Proactivo — Calendario Institucional

## Technical Approach

Tres capabilities, ningún motor nuevo. (A) `hermes-panel-calendario`: lectura total de `hermes_process_cases` + acción approve/reject autorizada por una RPC `SECURITY DEFINER` nueva (no RLS de columna, porque la lectura ya es total con `qual=true`). (B) `hermes-vista-anticipacion`: adapter de solo lectura que hace fan-out `calendario_institucional` → `tareas_institucionales` (por `event_id`) → `hermes_process_cases` (por `entity_id`), agrupado en cliente. (C) `hermes-monitoreo-vencimientos`: script Node standalone + cron externo (mismo patrón operativo que `analyze-risk.js`), sin pg_cron, con upsert idempotente sobre `hermes_process_cases`.

## Architecture Decisions

| Decisión | Elegido | Alternativas descartadas | Rationale |
|---|---|---|---|
| Autorización approve/reject | RPC `SECURITY DEFINER` nueva, `fn_hermes_resolver_caso` | (a) RLS policy con subquery en `usuario_departamentos`; (b) chequeo solo en cliente | Spec exige server-side y NO depender de ocultar UI. RLS por policy exigiría separar SELECT (total) de UPDATE (scoped) en la misma tabla con dos policies distintas — viable, pero una RPC concentra la lógica de resolución user→depto en un solo punto auditable, igual al patrón ya usado por `fn_email_departamento`. Se documenta la alternativa RLS como opción B en Open Questions |
| Resolución usuario→departamento | `EXISTS` sobre `usuario_departamentos ud JOIN departamentos d` filtrando `ud.user_id = auth.uid() AND upper(d.codigo) = upper(v_case.owner_department)` | (a) `LIMIT 1` + igualdad para resolver "el" departamento del usuario (descartada tras auditoría: asume 1:1, falla-cerrado innecesariamente para usuarios N:M); (b) Añadir columna `owner_department` a `profiles` | `EXISTS` soporta la cardinalidad real N:M de `usuario_departamentos` sin resolver un único departamento "canónico" por usuario ni requerir `LIMIT 1`; la tabla mapeo ya existe y está vacía pero lista; agregar columna a `profiles` duplicaría la fuente de verdad y requeriría migración adicional no prevista en el proposal |
| Autorización con `owner_department` NULL | Fail-closed explícito: `IF v_case.owner_department IS NULL THEN RAISE EXCEPTION` antes de cualquier comparación | Comparar directamente `upper(v_case.owner_department) <> upper(v_user_dept)` (descartada: bug crítico detectado en auditoría — en PL/pgSQL `NULL <> 'X'` es `NULL`, y un `IF` con condición `NULL` se comporta como `false`, por lo que el `RAISE EXCEPTION` nunca se disparaba y cualquier usuario con departamento asignado podía resolver un caso sin dueño) | `owner_department` es NULLABLE en el esquema real de `hermes_process_cases` (confirmado en Supabase); un caso sin dueño no debe poder resolverse vía este RPC bajo ninguna circunstancia — requiere asignación manual previa |
| Vista cruzada | Adapter en `calendarioUnificadoApi.js` (mismo módulo, nueva función) con 3 queries independientes + join en JS | Vista SQL materializada / `VIEW` en Postgres | Sigue el patrón DataAdapter ya presente en el archivo (funciones de fetch sobre `supabase` client); evita migración nueva para algo de solo lectura y bajo volumen (eventos próximos) |
| Monitoreo de vencimientos | Script Node + cron externo (Hermes cronjob / SO), igual que `analyze-risk.js` | `pg_cron` nativo de Supabase | Consistencia operativa con lo ya corrido en producción, cero infraestructura nueva en la DB; tradeoff: depende de que el proceso externo esté activo (riesgo documentado abajo) |
| Idempotencia del escaneo | `metadata->>'source_task_id'` único por tarea en riesgo | Constraint UNIQUE en DB sobre `(entity_type, entity_id)` | El script hace upsert aplicativo (`select` + `insert`/`update`); no se agrega constraint nueva para no tocar el esquema de `hermes_process_cases` fuera de lo ya definido en el proposal |

## Data Flow

    (A) Cliente ──approve/reject──▶ fn_hermes_resolver_caso(case_id, decision) [SECURITY DEFINER]
                                        │ auth.uid() → usuario_departamentos → departamentos.codigo
                                        │ compara vs hermes_process_cases.owner_department
                                        ▼ match: UPDATE status ('closed' si approve | 'cancelled' si reject)
                                          no match: RAISE EXCEPTION (→ 403 cliente)

    (B) calendarioUnificadoApi.fetchVistaAnticipacion()
          calendario_institucional (rango fechas)
             └─▶ tareas_institucionales WHERE event_id IN (...)   [group by departamento, order by fecha_vencimiento]
                    └─▶ hermes_process_cases WHERE entity_type='tarea' AND entity_id IN (...)

    (C) cron externo (diario) ──▶ scan-vencimientos.js (service role)
          SELECT tareas_institucionales WHERE fecha_vencimiento BETWEEN hoy AND hoy+N AND estado <> 'completado'
             └─▶ por tarea: buscar hermes_process_cases WHERE metadata->>'source_task_id' = tarea.id
                    existe → UPDATE (refresca metadata/priority)
                    no existe → INSERT (status='open', owner_department=tarea.departamento)
          NUNCA UPDATE tareas_institucionales. NUNCA llamada externa (WhatsApp/email/Instagram).

## File Changes

| File | Action | Description |
|---|---|---|
| `supabase/migrations/xxxx_fn_hermes_resolver_caso.sql` | Create | RPC de autorización scoped (ver Interfaces) |
| `src/modules/calendario/api/calendarioUnificadoApi.js` | Modify | Agregar `fetchCasosHermes()`, `resolverCasoHermes(id, decision)`, `fetchVistaAnticipacion(rango)` |
| `src/modules/calendario/components/PanelHermes.jsx` (o `.js` según convención existente) | Create | UI de casos + acciones, sin lógica de autorización (delega 100% al RPC) |
| `src/modules/calendario/components/VistaAnticipacion.jsx` | Create | Render agrupado por departamento/vencimiento, solo lectura |
| `supabase/scan-vencimientos.js` | Create | Script Node, mismo patrón que `analyze-risk.js`; conexión service role |
| cron externo (Hermes cronjob config) | Create | Programa la ejecución diaria de `scan-vencimientos.js` |
| `seed` (manual, fuera de migración) | N/A | Poblar `usuario_departamentos` — ver Riesgos |

## Interfaces / Contracts

```sql
CREATE OR REPLACE FUNCTION public.fn_hermes_resolver_caso(
  p_case_id uuid,
  p_decision text  -- 'approve' | 'reject' (acción de negocio; NO es literal de la columna status)
) RETURNS public.hermes_process_cases
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_case public.hermes_process_cases;
  v_authorized boolean;
  v_new_status text;
  v_closure_summary text;
BEGIN
  IF p_decision NOT IN ('approve','reject') THEN
    RAISE EXCEPTION 'decision inválida: %', p_decision;
  END IF;

  SELECT * INTO v_case FROM public.hermes_process_cases WHERE id = p_case_id;
  IF v_case IS NULL THEN
    RAISE EXCEPTION 'caso no encontrado: %', p_case_id;
  END IF;

  -- Fail-closed (fix crítico post-auditoría): owner_department es NULLABLE en el esquema real.
  -- `NULL <> 'X'` evalúa a NULL, y un IF con condición NULL se comporta como false en PL/pgSQL,
  -- por lo que comparar directamente permitía que CUALQUIER usuario con departamento asignado
  -- aprobara/rechazara un caso sin dueño. Se corta explícitamente antes de llegar a esa comparación,
  -- y antes que cualquier otro guard, para que el fail-closed sea la primera línea de defensa.
  IF v_case.owner_department IS NULL THEN
    RAISE EXCEPTION 'caso sin owner_department asignado — requiere asignación manual antes de poder resolverse'
      USING ERRCODE = '42501';
  END IF;

  -- Guard de estado: sólo se puede resolver un caso en 'open' (estado inicial real según el
  -- CHECK constraint de producción hermes_process_cases_status_check:
  -- CHECK (status = ANY (ARRAY['open','in_progress','blocked','closed','cancelled']))).
  -- No existen los valores 'pending'/'approved'/'rejected' en el esquema real; evita re-decidir
  -- un caso ya cerrado, cancelado, en curso o bloqueado.
  IF v_case.status <> 'open' THEN
    RAISE EXCEPTION 'caso no está en estado open, no se puede resolver vía este flujo (status=%)', v_case.status
      USING ERRCODE = '42501';
  END IF;

  -- Cardinalidad N:M usuario↔departamento resuelta vía EXISTS (no LIMIT 1 + igualdad):
  -- soporta usuarios con más de un departamento sin necesidad de "elegir uno" arbitrariamente,
  -- y sin fail-closed innecesario para el caso multi-departamento.
  SELECT EXISTS (
    SELECT 1
    FROM public.usuario_departamentos ud
    JOIN public.departamentos d ON d.id = ud.departamento_id
    WHERE ud.user_id = auth.uid()
      AND upper(d.codigo) = upper(v_case.owner_department)
  ) INTO v_authorized;

  IF NOT v_authorized THEN
    RAISE EXCEPTION 'no autorizado: caso pertenece a %, usuario no pertenece a ese departamento',
      v_case.owner_department USING ERRCODE = '42501';
  END IF;

  -- Remapeo decision (acción de negocio) → status (vocabulario real del CHECK constraint):
  -- no se inventan valores nuevos ni se altera el constraint de producción.
  -- 'approve' → 'closed'    (mismo status final que usa fn_hermes_close_process_case en producción)
  -- 'reject'  → 'cancelled' (no existe 'rejected' en el esquema real)
  IF p_decision = 'approve' THEN
    v_new_status := 'closed';
    v_closure_summary := format('Aprobado por departamento %s — usuario %s — %s',
      upper(v_case.owner_department), auth.uid(), now());
  ELSE
    v_new_status := 'cancelled';
    v_closure_summary := format('Rechazado por departamento %s — usuario %s — %s',
      upper(v_case.owner_department), auth.uid(), now());
  END IF;

  UPDATE public.hermes_process_cases
  SET status = v_new_status,
      closure_summary = v_closure_summary,
      closed_at = now(),
      updated_at = now()
  WHERE id = p_case_id
    AND status = 'open'  -- belt-and-suspenders: corta doble resolución por carrera de concurrencia
  RETURNING * INTO v_case;

  IF v_case IS NULL THEN
    RAISE EXCEPTION 'caso ya resuelto (condición de carrera)' USING ERRCODE = '42501';
  END IF;

  RETURN v_case;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fn_hermes_resolver_caso(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_hermes_resolver_caso(uuid, text) TO authenticated;
```

Flujo de rechazo cross-department (caso obligatorio de spec): usuario ACM invoca `fn_hermes_resolver_caso(caso_FIN, 'approve')` → `v_case.owner_department = 'FIN'` (no NULL, pasa el fail-closed) → `v_case.status = 'open'` (pasa el guard de estado) → `EXISTS(...)` para `auth.uid()` contra `upper('FIN')` da `false` porque el usuario sólo tiene fila(s) en `usuario_departamentos` para `ACM` → `RAISE EXCEPTION` con ERRCODE `42501` **antes** del `UPDATE` → PostgREST traduce a HTTP 403 → cliente muestra error, `status` de la fila permanece `open`, sin cambios.

Flujo NULL bypass (fix crítico, caso que motivó el FAIL de auditoría): caso con `owner_department IS NULL` → cualquier usuario, sin importar su departamento → el guard `IF v_case.owner_department IS NULL THEN RAISE EXCEPTION ...` dispara **siempre**, antes de llegar al `EXISTS`. Antes del fix, la comparación `upper(NULL) <> upper(v_user_dept)` evaluaba a `NULL`, el `IF` la trataba como `false`, y el flujo caía directo al `UPDATE` sin autorización real.

**Nota de compatibilidad con specs (vocabulario de status)**: la spec `hermes-panel-calendario` (Engram obs #78, `specs/hermes-panel-calendario/spec.md`) usa la palabra "pending" en los escenarios Given/When/Then de forma **conceptual** — significa "caso no resuelto todavía" — y no como valor literal obligatorio de la columna `hermes_process_cases.status`. En el esquema real (`hermes_process_cases_status_check: CHECK (status = ANY (ARRAY['open','in_progress','blocked','closed','cancelled']))`) ese concepto corresponde a `status = 'open'`. De igual forma, "approved"/"rejected" en la spec son conceptos de decisión de negocio, no literales de columna: corresponden a `status = 'closed'` y `status = 'cancelled'` respectivamente, el mismo vocabulario que ya usa la función de producción `fn_hermes_close_process_case`. No hace falta reabrir ni reescribir las specs: el comportamiento exigido (MUST rechazar cross-departamento, MUST fallar si `owner_department` es NULL, MUST impedir re-decidir un caso ya resuelto) se sigue cumpliendo exactamente igual — solo cambia qué string literal representa cada estado en la implementación SQL.

```js
// scan-vencimientos.js (pseudocódigo, patrón analyze-risk.js)
const N_DIAS = 7;
const { data: tareas } = await supabase.from('tareas_institucionales')
  .select('id, departamento, fecha_vencimiento, estado, event_id, titulo')
  .lte('fecha_vencimiento', addDays(today, N_DIAS))
  .gte('fecha_vencimiento', today)
  .neq('estado', 'completado');

for (const t of tareas) {
  const { data: existing } = await supabase.from('hermes_process_cases')
    .select('id').eq('metadata->>source_task_id', t.id).maybeSingle();
  const payload = {
    title: `Vencimiento próximo: ${t.titulo}`,
    owner_department: t.departamento,
    entity_type: 'tarea', entity_id: t.id,
    status: 'open', source: 'monitoreo_vencimientos',
    metadata: { source_task_id: t.id, fecha_vencimiento: t.fecha_vencimiento },
  };
  existing ? await supabase.from('hermes_process_cases').update(payload).eq('id', existing.id)
           : await supabase.from('hermes_process_cases').insert(payload);
}
// Nunca: supabase.from('tareas_institucionales').update(...)
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit (Vitest, `test:run`) | `fn_hermes_resolver_caso` lógica de matching (mock cliente Supabase) | Casos: mismo depto aprueba (→ `closed`), cross-depto rechaza (excepción, `status` intacto), sin depto asignado rechaza (excepción) |
| Unit | `fetchVistaAnticipacion` agrupación/orden | Fixtures de eventos+tareas, verificar orden ascendente por `fecha_vencimiento` dentro de cada grupo |
| Unit | `scan-vencimientos.js` idempotencia | Mock: segunda corrida sobre misma tarea → `update`, no `insert` duplicado |
| Integration (SQL, contra branch Supabase) | RPC real: caso FIN vs usuario ACM → excepción 42501, `status` sin cambios (permanece `open`) | `execute_sql` en branch de test antes de merge |
| Integration (SQL, contra branch Supabase) | **Fix crítico #1**: caso con `owner_department IS NULL` → approve/reject por CUALQUIER usuario autenticado (con o sin departamento) MUST fallar con excepción 42501, `status` permanece `open` | `execute_sql` en branch de test: insertar caso con `owner_department = NULL`, invocar RPC con distintos `auth.uid()`, verificar que todos fallan |
| Integration (SQL, contra branch Supabase) | Guard de estado: caso con `status <> 'open'` (ya `closed`/`cancelled`/`in_progress`/`blocked`) MUST fallar con excepción "caso no está en estado open", sin importar si el usuario está autorizado por departamento | `execute_sql`: resolver un caso (queda en `closed` o `cancelled`), invocar el RPC una segunda vez sobre el mismo `case_id` → excepción |
| Integration (SQL, contra branch Supabase) | Transición correcta de status: `p_decision='approve'` → `status='closed'` con `closure_summary` no NULL; `p_decision='reject'` → `status='cancelled'` con `closure_summary` no NULL | `execute_sql`: invocar RPC con cada decision sobre casos `open` distintos, verificar `status` y `closure_summary` resultantes |
| Integration (SQL, contra branch Supabase) | Usuario N:M (más de una fila en `usuario_departamentos`) MUST poder resolver casos de cualquiera de sus departamentos asignados | `execute_sql`: usuario con filas en ACM y FIN, resolver caso `owner_department='FIN'` → éxito (`status='closed'` o `'cancelled'` según decision) |
| E2E | No planeado en este change (fuera de infra existente) | — |

## Migration / Rollout

1. Migración SQL: crear `fn_hermes_resolver_caso` (aditiva, reversible con `DROP FUNCTION`).
2. Seed manual de `usuario_departamentos` (no es parte del código de la migración — ver Riesgos).
3. Feature flag / ruta nueva en el router de Calendario; sin cambios a políticas RLS existentes de lectura.
4. `scan-vencimientos.js` se agrega al cron externo por separado, después de validar en manual run.

## Open Questions

- [ ] ¿Confirmar con Omar: RPC `SECURITY DEFINER` vs. dos RLS policies separadas (SELECT total + UPDATE scoped) para `hermes_process_cases`? Ambas cumplen la spec; RPC elegida por consistencia con `fn_email_departamento`.
- [x] ¿Un usuario puede pertenecer a más de un `departamento_id` en `usuario_departamentos`? **Resuelto tras auditoría**: se asume N:M sin necesidad de confirmar la cardinalidad real, porque la función ya no depende de resolver "el" departamento del usuario — usa `EXISTS` para verificar pertenencia contra el `owner_department` puntual del caso. Soporta 1:1 y N:M sin cambios adicionales.

## Riesgo: `owner_department` NULL en casos creados por `scan-vencimientos.js`

Verificado en Supabase (`information_schema.columns`): `tareas_institucionales.departamento` es **`NOT NULL`** (`is_nullable = 'NO'`). Esto significa que toda tarea de origen tiene un departamento asignado, y por lo tanto `scan-vencimientos.js` (que hace `owner_department: t.departamento` en el INSERT/UPDATE, ver `Interfaces / Contracts`) **no puede** producir casos con `owner_department = NULL` a través de este flujo — el riesgo señalado por la auditoría no se materializa por esta vía.

`hermes_process_cases.owner_department` sigue siendo NULLABLE a nivel de esquema, así que un caso sin dueño sigue siendo posible por otras vías (inserción manual, otro origen de datos futuro, migración de datos legacy, etc.). Decisión: **no se agrega un fallback automático (ej. `owner_department` NULL → `'DIR'` por defecto)**. Rationale: asignar un departamento por defecto de forma silenciosa oculta un dato faltante y podría hacer que un departamento (`DIR`) reciba casos que no le corresponden sin trazabilidad de por qué. El comportamiento fail-closed del fix #1 (nadie puede resolver un caso sin `owner_department` vía el RPC) es preferible: el caso queda visible en el panel (la lectura es total, `qual=true`) pero bloqueado para approve/reject hasta que alguien con acceso directo a la tabla (o un futuro flujo de asignación manual, fuera de este change) le asigne un `owner_department` explícito.

## Punto D — Asistencia de Contenido (fuera de esta fase)

El punto D del `proposal.md` (asistencia de contenido) fue explorado durante el diseño y **no se implementa ni se diseña en este change**. No hay tablas, RPCs, componentes ni flujos de datos propuestos aquí que lo cubran. Queda explícitamente diferido a un change futuro, a proponerse si hay demanda concreta una vez que el panel de casos (punto A), la vista de anticipación (punto B) y el monitoreo de vencimientos (punto C) estén en producción y validados.

## Vault / Task Contracts (`.hermes/`, `00_SISTEMA_MAESTRO/`) — Evaluación de viabilidad

Se evaluó la posibilidad de que el panel lea Task Contracts directamente del vault de archivos (`.hermes/`, `00_SISTEMA_MAESTRO/`) en lugar de únicamente `hermes_process_cases`. Se difiere: requiere I/O de filesystem fuera de Supabase (acceso al vault desde el cliente web no es viable sin un backend intermediario nuevo, distinto del patrón `SECURITY DEFINER` / PostgREST ya usado en todo el resto del diseño), y no es crítico para el MVP de este change — los tres capabilities (A/B/C) operan enteramente sobre datos ya existentes en Postgres. Se evalúa como change posterior si aparece una necesidad concreta de sincronizar contenido del vault hacia `hermes_process_cases` (por ejemplo, vía un script de ingesta análogo a `scan-vencimientos.js`).

## `automationLevel` — metadato no-ejecutable

La spec `hermes-panel-calendario` exige (MUST) que `automationLevel`, si está presente en los metadatos de un caso, se trate como no-ejecutable: ningún flujo del sistema debe usarlo para decidir automatización. El diseño lo satisface así: si `hermes_process_cases.metadata` contiene una clave `automationLevel`, `PanelHermes.jsx` la renderiza únicamente como badge informativo de solo lectura (texto/color, sin lógica condicional de negocio atada a su valor). Ningún código de este change —ni `fn_hermes_resolver_caso`, ni `scan-vencimientos.js`, ni los adapters de `calendarioUnificadoApi.js`— lee `metadata->>'automationLevel'` para decidir ejecución, habilitar/deshabilitar botones, ni alterar el flujo de approve/reject. La única fuente de autorización para approve/reject es el RPC descrito arriba (owner_department vía EXISTS), no el metadato.
