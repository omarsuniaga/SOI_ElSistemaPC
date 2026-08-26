# SOI Event Spine — Task Breakdown

**Change:** soi-event-spine  
**Status:** Ready for apply  
**Total Tasks:** 19 (5 phases)  
**Total Estimated Lines:** ~930 (650 migration + 280 tests)  
**Chained PRs Recommended:** Yes  

---

## Overview

This document breaks down the SOI Event Spine implementation into ordered, actionable tasks. The spec defines 10 acceptance criteria (AC-01 through AC-10). Each task is linked to one or more criteria and has explicit dependencies.

### Dependency Flow

```
T1 (table)
├─ T2 (indices)
├─ T3 (RLS enable)
│  └─ T4 (immutability)
├─ T5-T10 (triggers, parallel after T1)
├─ T11 (enum, after T1)
├─ T12 (payload docs)
├─ T13-T14 (consumer skeleton, non-blocking)
└─ T15-T19 (tests, parallel, T15 seq after T1+T5)
```

---

## Phase 1: DDL Foundation (Sequential)

### T1: Create migration file with soi_eventos table DDL

**File:** `supabase/migrations/20260818000000_soi_eventos_event_spine.sql`

**Description:**  
Create the base table with 8 columns:
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `tipo` (TEXT, NOT NULL, CHECK constraint regex)
- `entidad_tipo` (TEXT, NOT NULL)
- `entidad_id` (UUID, NOT NULL)
- `actor_id` (UUID, nullable)
- `payload` (JSONB, NOT NULL, DEFAULT '{}')
- `correlation_id` (UUID, nullable)
- `procesado` (BOOLEAN, NOT NULL, DEFAULT false)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT now())

**Spec Link:** AC-01 (table schema created with correct columns and constraints)

**Dependencies:** None

**Parallelizable:** No (prerequisite for all other DDL)

**Estimated Lines:** 50

**Done Criteria:**
- [ ] Migration file created
- [ ] All 8 columns present with correct types
- [ ] PRIMARY KEY on id
- [ ] DEFAULT values applied
- [ ] CHECK constraint on tipo field

---

### T2: Add 4 indices on soi_eventos

**File:** Same migration file (`20260818000000_soi_eventos_event_spine.sql`)

**Description:**  
Create the following indices:
1. `idx_soi_eventos_entity_timeline` on (entidad_id, created_at DESC)
2. `idx_soi_eventos_tipo_timeline` on (tipo, created_at DESC)
3. `idx_soi_eventos_procesado_queue` on (procesado, created_at) WHERE procesado = false
4. `idx_soi_eventos_correlation` on (correlation_id)

**Spec Link:** AC-07 (timeline query returns 100 events in < 200ms P99)

**Dependencies:** T1 (table must exist)

**Parallelizable:** No (indices created after table)

**Estimated Lines:** 20

**Done Criteria:**
- [ ] All 4 indices created
- [ ] Composite index on entity_timeline includes DESC order
- [ ] Partial index on procesado_queue filters correctly

---

### T3: Enable RLS and create policies for ACM, ADM, DIR, LOG, service role

**File:** Same migration file

**Description:**  
Enable RLS on soi_eventos. Create 5 row-level security policies:

| Role | Read Access | Read Denial |
|------|---|---|
| ACM | sesiones_clase, asistencias, periodos | tareas_institucionales, justificaciones |
| ADM | justificaciones, periodo.cerrado | academic events (unless escalated) |
| FIN | (none) | all events |
| DIR | all events | (none) |
| TECNICO | (none) | all events |

Service role bypasses RLS for trigger logging.

**Spec Link:** AC-04 (RLS enforces department boundaries)

**Dependencies:** T1 (table must exist)

**Parallelizable:** No (RLS must be enabled before policies)

**Estimated Lines:** 60

**Done Criteria:**
- [ ] RLS enabled on soi_eventos
- [ ] 5 policies created (ACM, ADM, DIR, LOG, service role)
- [ ] ACM cannot select tareas_institucionales events
- [ ] ADM cannot select asistencias events
- [ ] DIR can select all events
- [ ] TECNICO cannot select any events

---

### T4: Add immutability policy (block UPDATE/DELETE for authenticated users)

**File:** Same migration file

**Description:**  
Create an RLS POLICY that:
- Blocks all UPDATE operations for authenticated users
- Blocks all DELETE operations for authenticated users
- Allows INSERT operations

This ensures soi_eventos is append-only.

**Spec Link:** AC-10 (events immutable, no UPDATE/DELETE via RLS)

**Dependencies:** T1 (table exists), T3 (RLS enabled)

**Parallelizable:** No (depends on RLS enablement)

**Estimated Lines:** 15

**Done Criteria:**
- [ ] UPDATE policy created and blocks all updates
- [ ] DELETE policy created and blocks all deletes
- [ ] INSERT policy allows all inserts
- [ ] Immutability policy tested manually

---

## Phase 2: Trigger Functions (Parallel after T1, Logical sequence)

All trigger functions use SECURITY DEFINER and must add < 50ms P99 latency per AC-06.

### T5: Create fn_soi_evento_sesion_creada()

**File:** Same migration file

**Description:**  
AFTER INSERT trigger on sesiones_clase. Logs one event per insert:
- **tipo:** 'sesion.creada'
- **entidad_tipo:** 'sesiones_clase'
- **entidad_id:** NEW.id (session id)
- **actor_id:** current_user_id from auth context
- **payload:** { maestro_id, salon_id, fecha, hora_inicio, hora_fin, cantidad_alumnos }
- **correlation_id:** NULL (Phase 1 logging-only)
- **procesado:** false

**Spec Link:** AC-02 (triggers fire on INSERT/UPDATE), AC-03 (payload fields), AC-06 (P99 <50ms)

**Dependencies:** T1 (table exists)

**Parallelizable:** Yes (can implement in parallel with T6-T10)

**Estimated Lines:** 25

**Done Criteria:**
- [ ] Trigger created with SECURITY DEFINER
- [ ] Fires on INSERT only
- [ ] Payload contains all required fields
- [ ] actor_id captured from auth context
- [ ] No side effects (logging only)

---

### T6: Create fn_soi_evento_asistencia_registrada()

**File:** Same migration file

**Description:**  
AFTER INSERT trigger on asistencias. Logs one event per insert (handles 10k+/day batch inserts):
- **tipo:** 'asistencia.registrada'
- **entidad_tipo:** 'asistencias'
- **entidad_id:** NEW.id
- **actor_id:** current_user_id
- **payload:** { alumno_id, sesion_id, presente, retraso_minutos }
- **correlation_id:** NULL
- **procesado:** false

**Spec Link:** AC-02, AC-03, AC-06

**Dependencies:** T1

**Parallelizable:** Yes

**Estimated Lines:** 25

**Done Criteria:**
- [ ] Trigger created with SECURITY DEFINER
- [ ] Fires on INSERT only
- [ ] Payload contains all required fields
- [ ] Handles batch inserts (no row-level loops if possible)
- [ ] P99 latency < 50ms for 50-row batches

---

### T7: Create fn_soi_evento_asistencia_falta()

**File:** Same migration file

**Description:**  
AFTER UPDATE trigger on asistencias. Fires when estado changes to 'falta_injustificada' or 'falta_justificada':
- **On falta_injustificada:** tipo='asistencia.falta_injustificada', payload includes alumno_id, sesion_id, maestro_id, razon_ausencia
- **On falta_justificada:** tipo='asistencia.falta_justificada', payload includes alumno_id, sesion_id, justificacion_id; correlation_id set to prior asistencia evento id (Phase 1: can use NULL; Phase 2 joins to prior event)

**Spec Link:** AC-02, AC-03, AC-05 (correlation_id populated for linked events)

**Dependencies:** T1

**Parallelizable:** Yes

**Estimated Lines:** 35

**Done Criteria:**
- [ ] Trigger created with SECURITY DEFINER
- [ ] Fires on UPDATE only (not INSERT)
- [ ] Detects estado changes only (OLD.estado != NEW.estado)
- [ ] Logs two different event types per state
- [ ] Payload contains all required fields
- [ ] correlation_id logic implemented (Phase 1: can query prior event, Phase 2: join context)

---

### T8: Create fn_soi_evento_tarea()

**File:** Same migration file

**Description:**  
AFTER INSERT/UPDATE trigger on tareas_institucionales:
- **On INSERT:** tipo='tarea.creada', payload includes titulo, asignado_a, prioridad, fecha_vencimiento
- **On UPDATE (estado changes):**
  - estado → 'completada': tipo='tarea.completada'
  - estado → 'escalada': tipo='tarea.escalada', payload includes urgencia, escalada_a, razon
  - estado → 'vencida': tipo='tarea.vencida'

**Spec Link:** AC-02, AC-03

**Dependencies:** T1

**Parallelizable:** Yes

**Estimated Lines:** 40

**Done Criteria:**
- [ ] Trigger created with SECURITY DEFINER
- [ ] Fires on INSERT for 'tarea.creada'
- [ ] Fires on UPDATE for estado changes
- [ ] Detects all three estado transitions (completada, escalada, vencida)
- [ ] Payload contains all required fields per event type
- [ ] No side effects (Phase 1 is logging-only)

---

### T9: Create fn_soi_evento_justificacion()

**File:** Same migration file

**Description:**  
AFTER INSERT/UPDATE trigger on justificaciones:
- **On INSERT:** tipo='justificacion.solicitada', payload includes alumno_id, asistencia_id, razon_solicitada, documentos_url
- **On UPDATE (estado changes):**
  - estado → 'aprobada': tipo='justificacion.aprobada', payload includes aprobado_por (actor_id), notas_aprobacion
  - estado → 'rechazada': tipo='justificacion.rechazada'

For 'justificacion.aprobada', correlation_id should link to the original asistencia event (Phase 1: can query prior event; Phase 2: join context).

**Spec Link:** AC-02, AC-03, AC-05

**Dependencies:** T1

**Parallelizable:** Yes

**Estimated Lines:** 35

**Done Criteria:**
- [ ] Trigger created with SECURITY DEFINER
- [ ] Fires on INSERT for 'justificacion.solicitada'
- [ ] Fires on UPDATE for estado changes (aprobada, rechazada)
- [ ] Payload contains all required fields
- [ ] correlation_id logic implemented (can reference prior asistencia event)

---

### T10: Create fn_soi_evento_periodo()

**File:** Same migration file

**Description:**  
AFTER UPDATE trigger on periodos. Fires when cerrado changes from false to true:
- **tipo:** 'periodo.cerrado'
- **entidad_tipo:** 'periodos'
- **entidad_id:** NEW.id
- **payload:** metadata from periodo row

**Spec Link:** AC-02, AC-03

**Dependencies:** T1

**Parallelizable:** Yes

**Estimated Lines:** 20

**Done Criteria:**
- [ ] Trigger created with SECURITY DEFINER
- [ ] Fires on UPDATE only
- [ ] Detects cerrado: false → true transition
- [ ] Payload contains periodo metadata

---

## Phase 3: Event Taxonomy (Sequential)

### T11: Add soi_evento_tipo ENUM or CHECK constraint with all 15 event types

**File:** Same migration file

**Description:**  
Define the 15 event types. Choose one approach:

**Option A: CREATE TYPE ENUM**
```sql
CREATE TYPE soi_evento_tipo AS ENUM (
  'sesion.creada',
  'sesion.completada',
  'sesion.cancelada',
  'asistencia.registrada',
  'asistencia.falta_injustificada',
  'asistencia.falta_justificada',
  'tarea.creada',
  'tarea.completada',
  'tarea.escalada',
  'tarea.vencida',
  'justificacion.solicitada',
  'justificacion.aprobada',
  'justificacion.rechazada',
  'periodo.abierto',
  'periodo.cerrado'
);
```
Then change soi_eventos.tipo to `soi_evento_tipo` type (or keep as TEXT with foreign reference).

**Option B: Text type with CHECK constraint** (recommended for flexibility)
```sql
CHECK (tipo IN (
  'sesion.creada', 'sesion.completada', 'sesion.cancelada',
  'asistencia.registrada', 'asistencia.falta_injustificada', 'asistencia.falta_justificada',
  'tarea.creada', 'tarea.completada', 'tarea.escalada', 'tarea.vencida',
  'justificacion.solicitada', 'justificacion.aprobada', 'justificacion.rechazada',
  'periodo.abierto', 'periodo.cerrado'
))
```

**Spec Link:** AC-02 (all 15 event types recognized)

**Dependencies:** T1 (table exists)

**Parallelizable:** No (enum/check must be in place; triggers reference it)

**Estimated Lines:** 20

**Done Criteria:**
- [ ] All 15 event types defined
- [ ] ENUM or CHECK constraint applied
- [ ] Triggers reference the correct types
- [ ] No invalid tipos can be stored

---

### T12: Document payload schemas in migration comments

**File:** Same migration file

**Description:**  
Add COMMENT ON TABLE and COMMENT ON COLUMN to soi_eventos explaining payload structure per event type. Example:

```sql
COMMENT ON TABLE public.soi_eventos IS 'Immutable event log for SOI domain events. Phase 1: logging-only. Phase 2+: enrichment and side effects.';

COMMENT ON COLUMN public.soi_eventos.payload IS 'Event-specific JSONB data. Schema depends on tipo field.

Payload schemas by event type:
- sesion.creada: { maestro_id UUID, salon_id UUID, fecha DATE, hora_inicio TIME, hora_fin TIME, cantidad_alumnos INT }
- sesion.completada: { anterior_estado TEXT, nuevo_estado TEXT, timestamp_cambio TIMESTAMPTZ }
- asistencia.registrada: { alumno_id UUID, sesion_id UUID, presente BOOLEAN, retraso_minutos INT }
- asistencia.falta_injustificada: { alumno_id UUID, sesion_id UUID, maestro_id UUID, razon_ausencia TEXT }
- tarea.creada: { titulo TEXT, asignado_a TEXT, prioridad TEXT, fecha_vencimiento DATE }
- tarea.escalada: { anterior_estado TEXT, nuevo_estado TEXT, escalada_a TEXT, urgencia TEXT, razon TEXT }
- justificacion.solicitada: { alumno_id UUID, asistencia_id UUID, razon_solicitada TEXT, documentos_url TEXT[] }
- justificacion.aprobada: { alumno_id UUID, asistencia_id UUID, aprobado_por UUID, notas_aprobacion TEXT }
...
';
```

**Spec Link:** AC-03 (payload contains required fields per event type)

**Dependencies:** None (documentation only)

**Parallelizable:** Yes (can write in parallel)

**Estimated Lines:** 50

**Done Criteria:**
- [ ] COMMENT ON TABLE added
- [ ] COMMENT ON COLUMN for payload added
- [ ] All 15 event type payload schemas documented
- [ ] Payload field types and optionality specified

---

## Phase 4: Consumer Skeleton (Non-blocking, Phase 2 Preview)

These files create the contract for Phase 2 enrichment but are NOT deployed in Phase 1.

### T13: Create supabase/functions/event-spine-logger/index.ts skeleton

**File:** `supabase/functions/event-spine-logger/index.ts`

**Description:**  
Deno TypeScript function that serves as the Phase 2 consumer skeleton:

```typescript
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // Poll soi_eventos WHERE procesado=false ORDER BY created_at ASC LIMIT 100
    const { data: eventos, error } = await supabase
      .from("soi_eventos")
      .select("*")
      .eq("procesado", false)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;

    // Process each event (Phase 2: enrich, call webhooks, etc.)
    for (const evento of eventos) {
      console.log(`Processing evento: ${evento.id}, tipo: ${evento.tipo}`);
      
      // Phase 1: just log
      // Phase 2: enrich with context, call webhooks, etc.
      
      // Mark procesado=true
      const { error: updateError } = await supabase
        .from("soi_eventos")
        .update({ procesado: true })
        .eq("id", evento.id);

      if (updateError) {
        console.error(`Failed to mark evento ${evento.id} as procesado: ${updateError.message}`);
        // Do not fail the function; continue processing other events
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: eventos.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in event-spine-logger:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

**Spec Link:** N/A (Phase 1 is logging-only; Phase 2 feature)

**Dependencies:** T1 (soi_eventos table exists)

**Parallelizable:** Yes (can create in parallel)

**Estimated Lines:** 60

**Done Criteria:**
- [ ] File created
- [ ] Function polls soi_eventos WHERE procesado=false
- [ ] Iterates over events and logs tipos/payloads
- [ ] Marks procesado=true after processing
- [ ] Error handling implemented (does not crash on individual event failures)
- [ ] Not deployed in Phase 1 (marked as skeleton for Phase 2)

---

### T14: Create supabase/functions/event-spine-logger/deno.json

**File:** `supabase/functions/event-spine-logger/deno.json`

**Description:**  
Deno configuration file:

```json
{
  "imports": {
    "std/": "https://deno.land/std@0.208.0/"
  },
  "tasks": {
    "start": "deno run --allow-net --allow-env index.ts"
  },
  "permissions": {
    "net": [
      "supabase.co",
      "localhost"
    ],
    "env": [
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY"
    ]
  }
}
```

**Spec Link:** N/A

**Dependencies:** None

**Parallelizable:** Yes

**Estimated Lines:** 15

**Done Criteria:**
- [ ] File created
- [ ] Imports configured
- [ ] Permissions set (net, env)
- [ ] Tasks defined (optional, for local testing)

---

## Phase 5: Integration Tests (Parallel after DDL, Sequential after T15)

All tests run against a deployed migration. Tests are written in TypeScript using Supabase SDK + Jest or Vitest.

### T15: Integration test — trigger fires on sesiones_clase INSERT

**File:** `tests/event-spine-sesion-creada.test.ts`

**Description:**  
Test that sesion.creada trigger fires correctly:

```typescript
describe("Event Spine: sesion.creada trigger", () => {
  test("logs soi_eventos row on sesiones_clase INSERT", async () => {
    // Insert a new sesiones_clase row
    const { data: newSession, error: insertError } = await supabase
      .from("sesiones_clase")
      .insert({
        maestro_id: "<maestro-uuid>",
        salon_id: "<salon-uuid>",
        fecha: new Date().toISOString().split("T")[0],
        hora_inicio: "09:00:00",
        hora_fin: "10:00:00",
        cantidad_alumnos: 25
      })
      .select();
    
    expect(insertError).toBeNull();
    const sessionId = newSession[0].id;

    // Poll soi_eventos for the new event
    const { data: eventos } = await supabase
      .from("soi_eventos")
      .select("*")
      .eq("entidad_id", sessionId)
      .eq("tipo", "sesion.creada");

    // Assert exactly 1 event logged
    expect(eventos).toHaveLength(1);
    expect(eventos[0].entidad_tipo).toBe("sesiones_clase");
    expect(eventos[0].payload).toMatchObject({
      maestro_id: expect.any(String),
      salon_id: expect.any(String),
      fecha: expect.any(String)
    });

    // Assert immutability: UPDATE blocked
    const { error: updateError } = await supabase
      .from("soi_eventos")
      .update({ procesado: true })
      .eq("id", eventos[0].id);
    
    expect(updateError).toBeTruthy();
    expect(updateError.message).toContain("RLS");
  });
});
```

**Spec Link:** AC-01, AC-02, AC-10

**Dependencies:** T1 (table created), T5 (trigger deployed)

**Parallelizable:** No (first test; must verify basic trigger functionality)

**Estimated Lines:** 40

**Done Criteria:**
- [ ] Test inserts sesiones_clase row
- [ ] Verifies soi_eventos row created with tipo='sesion.creada'
- [ ] Verifies payload contains all required fields
- [ ] Tests immutability (UPDATE/DELETE blocked by RLS)
- [ ] Test passes

---

### T16: Integration test — trigger fires on asistencias INSERT (batch)

**File:** `tests/event-spine-asistencias.test.ts`

**Description:**  
Test that asistencia.registrada trigger handles batch inserts (10k+/day scenario):

```typescript
describe("Event Spine: asistencia.registrada trigger (batch)", () => {
  test("logs 50 soi_eventos rows on 50 asistencias INSERT", async () => {
    const sessionId = "<session-uuid>";
    const alumnoIds = Array.from({ length: 50 }, (_, i) => `<alumno-${i}-uuid>`);
    
    const rows = alumnoIds.map(alumnoId => ({
      alumno_id: alumnoId,
      sesion_id: sessionId,
      presente: true,
      retraso_minutos: 0
    }));

    const startTime = Date.now();
    const { data: newAsistencias, error: insertError } = await supabase
      .from("asistencias")
      .insert(rows)
      .select();
    const insertDuration = Date.now() - startTime;

    expect(insertError).toBeNull();
    expect(newAsistencias).toHaveLength(50);

    // Poll soi_eventos for the new events
    const { data: eventos } = await supabase
      .from("soi_eventos")
      .select("*")
      .eq("tipo", "asistencia.registrada")
      .gte("created_at", new Date(Date.now() - 5000).toISOString());

    // Assert exactly 50 events logged
    expect(eventos.length).toBeGreaterThanOrEqual(50);

    // Assert timestamps are within 100ms
    const timestamps = eventos.map(e => new Date(e.created_at).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    expect(maxTime - minTime).toBeLessThan(100);

    // Assert no duplicates
    const uniqueIds = new Set(eventos.map(e => e.id));
    expect(uniqueIds.size).toBe(eventos.length);

    // Assert payload correct
    eventos.forEach(e => {
      expect(e.payload).toHaveProperty("alumno_id");
      expect(e.payload).toHaveProperty("sesion_id");
      expect(e.payload).toHaveProperty("presente");
    });
  });
});
```

**Spec Link:** AC-02, AC-03, AC-06, AC-09

**Dependencies:** T1, T6

**Parallelizable:** Yes (can run in parallel with T17-T19)

**Estimated Lines:** 60

**Done Criteria:**
- [ ] Test batch-inserts 50 asistencias
- [ ] Verifies 50+ soi_eventos rows created
- [ ] Verifies timestamp spread < 100ms
- [ ] Verifies no duplicates
- [ ] Verifies payload correct
- [ ] Test passes

---

### T17: Integration test — RLS blocks cross-department access

**File:** `tests/event-spine-rls.test.ts`

**Description:**  
Test that RLS policies enforce department boundaries:

```typescript
describe("Event Spine: RLS enforcement", () => {
  test("ACM cannot read tareas_institucionales events", async () => {
    // Sign in as ACM user
    const acmSupabase = supabase.auth.setSession(acmUserSession);

    const { data, error } = await acmSupabase
      .from("soi_eventos")
      .select("*")
      .eq("tipo", "tarea.creada");

    // ACM should see empty result or error
    expect(data).toHaveLength(0);
  });

  test("ADM cannot read asistencias events", async () => {
    const admSupabase = supabase.auth.setSession(admUserSession);

    const { data, error } = await admSupabase
      .from("soi_eventos")
      .select("*")
      .eq("tipo", "asistencia.registrada");

    expect(data).toHaveLength(0);
  });

  test("DIR can read all events", async () => {
    const dirSupabase = supabase.auth.setSession(dirUserSession);

    const { data: tareasData } = await dirSupabase
      .from("soi_eventos")
      .select("*")
      .eq("tipo", "tarea.creada");

    const { data: asistenciasData } = await dirSupabase
      .from("soi_eventos")
      .select("*")
      .eq("tipo", "asistencia.registrada");

    // DIR should see all events
    expect(tareasData.length + asistenciasData.length).toBeGreaterThan(0);
  });

  test("TECNICO sees empty result set (no error)", async () => {
    const tecnicoSupabase = supabase.auth.setSession(tecnicoUserSession);

    const { data, error } = await tecnicoSupabase
      .from("soi_eventos")
      .select("*");

    // Should succeed but return 0 rows (not an error)
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
});
```

**Spec Link:** AC-04 (RLS enforces department boundaries)

**Dependencies:** T1 (table), T3 (RLS policies), T5-T10 (triggers, to create test events)

**Parallelizable:** Yes

**Estimated Lines:** 80

**Done Criteria:**
- [ ] Test ACM isolation
- [ ] Test ADM isolation
- [ ] Test DIR access to all
- [ ] Test TECNICO blocked access
- [ ] All tests pass

---

### T18: Integration test — immutability blocks UPDATE/DELETE

**File:** `tests/event-spine-immutability.test.ts`

**Description:**  
Test that UPDATE and DELETE are blocked by RLS:

```typescript
describe("Event Spine: immutability", () => {
  test("UPDATE blocked by RLS", async () => {
    const { data: evento } = await supabase
      .from("soi_eventos")
      .select("id")
      .limit(1)
      .single();

    const { error } = await supabase
      .from("soi_eventos")
      .update({ procesado: true })
      .eq("id", evento.id);

    expect(error).toBeTruthy();
    expect(error.message).toContain("RLS");
  });

  test("DELETE blocked by RLS", async () => {
    const { data: evento } = await supabase
      .from("soi_eventos")
      .select("id")
      .limit(1)
      .single();

    const { error } = await supabase
      .from("soi_eventos")
      .delete()
      .eq("id", evento.id);

    expect(error).toBeTruthy();
    expect(error.message).toContain("RLS");
  });

  test("INSERT still allowed", async () => {
    const { error } = await supabase
      .from("soi_eventos")
      .insert({
        tipo: "test.event",
        entidad_tipo: "test",
        entidad_id: "00000000-0000-0000-0000-000000000000",
        payload: {}
      });

    // Should succeed (or fail with type constraint, not RLS)
    // INSERT should be allowed
    expect(error?.message).not.toContain("RLS");
  });
});
```

**Spec Link:** AC-10 (events immutable, no UPDATE/DELETE)

**Dependencies:** T1, T4 (immutability policy)

**Parallelizable:** Yes

**Estimated Lines:** 50

**Done Criteria:**
- [ ] Test UPDATE blocked
- [ ] Test DELETE blocked
- [ ] Test INSERT allowed
- [ ] Error messages reference RLS
- [ ] Tests pass

---

### T19: Performance test — P99 latency <50ms on batch asistencias INSERT

**File:** `tests/event-spine-performance.test.ts`

**Description:**  
Measure P99 latency for batch asistencias inserts (AC-06 requirement):

```typescript
describe("Event Spine: performance", () => {
  test("P99 latency < 50ms for 50-row asistencias batch", async () => {
    const iterations = 100;
    const latencies: number[] = [];
    const sessionId = "<session-uuid>";

    for (let i = 0; i < iterations; i++) {
      const rows = Array.from({ length: 50 }, (_, j) => ({
        alumno_id: `<alumno-${j}-uuid>`,
        sesion_id: sessionId,
        presente: true,
        retraso_minutos: 0
      }));

      const startTime = performance.now();
      const { error } = await supabase
        .from("asistencias")
        .insert(rows);
      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      latencies.push(duration);
    }

    // Calculate P99
    latencies.sort((a, b) => a - b);
    const p99Index = Math.ceil(iterations * 0.99) - 1;
    const p99 = latencies[p99Index];

    console.log(`P99 latency: ${p99}ms`);
    expect(p99).toBeLessThan(50);

    // Also check P95 and P50
    const p95Index = Math.ceil(iterations * 0.95) - 1;
    const p50Index = Math.ceil(iterations * 0.50) - 1;
    console.log(`P95: ${latencies[p95Index]}ms, P50: ${latencies[p50Index]}ms`);
  });

  test("No deadlocks on concurrent batch inserts", async () => {
    const sessionId = "<session-uuid>";
    const promises = Array.from({ length: 10 }, () => {
      const rows = Array.from({ length: 50 }, (_, j) => ({
        alumno_id: `<alumno-concurrent-${j}-uuid>`,
        sesion_id: sessionId,
        presente: true,
        retraso_minutos: 0
      }));

      return supabase.from("asistencias").insert(rows);
    });

    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error !== null);

    expect(errors).toHaveLength(0);
  });
});
```

**Spec Link:** AC-06 (P99 <50ms), AC-07 (timeline query <200ms)

**Dependencies:** T1, T6

**Parallelizable:** Yes

**Estimated Lines:** 70

**Done Criteria:**
- [ ] Test runs 100 iterations
- [ ] Collects latency measurements
- [ ] Calculates P99 latency
- [ ] Asserts P99 < 50ms
- [ ] Tests concurrent batch inserts (no deadlock)
- [ ] Tests pass

---

## Summary

| Task | Phase | Status | Parallelizable | Est. Lines | Spec Link |
|------|-------|--------|---|---|---|
| T1 | DDL | Ready | No | 50 | AC-01 |
| T2 | DDL | Ready | No | 20 | AC-07 |
| T3 | DDL | Ready | No | 60 | AC-04 |
| T4 | DDL | Ready | No | 15 | AC-10 |
| T5 | Triggers | Ready | Yes | 25 | AC-02, AC-03, AC-06 |
| T6 | Triggers | Ready | Yes | 25 | AC-02, AC-03, AC-06 |
| T7 | Triggers | Ready | Yes | 35 | AC-02, AC-03, AC-05 |
| T8 | Triggers | Ready | Yes | 40 | AC-02, AC-03 |
| T9 | Triggers | Ready | Yes | 35 | AC-02, AC-03, AC-05 |
| T10 | Triggers | Ready | Yes | 20 | AC-02, AC-03 |
| T11 | Taxonomy | Ready | No | 20 | AC-02 |
| T12 | Taxonomy | Ready | Yes | 50 | AC-03 |
| T13 | Consumer | Ready | Yes | 60 | N/A (Phase 2) |
| T14 | Consumer | Ready | Yes | 15 | N/A |
| T15 | Tests | Ready | No | 40 | AC-01, AC-02, AC-10 |
| T16 | Tests | Ready | Yes | 60 | AC-02, AC-03, AC-06, AC-09 |
| T17 | Tests | Ready | Yes | 80 | AC-04 |
| T18 | Tests | Ready | Yes | 50 | AC-10 |
| T19 | Tests | Ready | Yes | 70 | AC-06, AC-07 |

**Total Tasks:** 19  
**Total Estimated Lines:** ~930  
**Parallelizable after T1:** T5-T10, T12-T14, T16-T19 (13 tasks)  
**Sequential Prerequisites:** T1 → T2, T3 → T4; T11 (logical dep on types); T15 (logic depends on T5)

---

## Delivery Strategy

**Chained PRs Recommended: Yes**

**PR1 (Foundation):** T1, T2, T3, T4, T11, T12, T15, T16, T17, T18
- **Files:** Migration file (DDL/RLS/indices/taxonomy/docs) + 4 test files (foundation tests)
- **Lines:** ~400 (at threshold; acceptable)
- **Time to review:** ~30-45 min

**PR2 (Triggers + Consumer + Performance):** T5-T10, T13-T14, T19
- **Files:** Migration file (triggers) + 2 consumer skeleton files + 1 performance test
- **Lines:** ~300
- **Time to review:** ~20-30 min

**Alternative (size:exception):** Single PR with all 19 tasks (~930 lines). Requires `size:exception` label and explicit maintainer approval.

---

End of task breakdown. Ready for `/sdd-apply`.
