# 09 — Supabase Adapter Implementation & Migration Plan

## 1. Migration Overview & Non-Invasive Strategy

Thanks to **Hexagonal Architecture**, the entire frontend application (all React pages, drawers, Kanban boards, Zustand store, and Application Use Cases) is **completely decoupled** from the persistence engine.

To transition from the current in-memory mock adapters to Supabase:
1. Create concrete repository implementations in `/src/infrastructure/repositories/supabase/`.
2. Implement bidirectional mappers (`toDomain` / `toRow`).
3. Switch adapter instantiation in the Composition Root (`/src/container.ts`).
4. **Zero changes** to presentation components or domain entities.

```
+-----------------------------------------------------------------------------------+
|                        COMPOSITION ROOT (/src/container.ts)                       |
+-----------------------------------------------------------------------------------+
                                         │
        [ SWITCH ENVIRONMENT VARIABLE: VITE_USE_SUPABASE=true/false ]
                                         │
         ┌───────────────────────────────┴───────────────────────────────┐
         │                                                               │
         ▼ (Current / Offline)                                           ▼ (Production)
Mock Repositories:                                              Supabase Repositories:
- MockCalendarRepository                                        - SupabaseCalendarRepository
- MockTriggerRepository                                         - SupabaseTriggerRepository
- MockProtocolRunRepository                                     - SupabaseProtocolRunRepository
- MockTaskRepository                                            - SupabaseTaskRepository
- MockVenueRepository                                           - SupabaseVenueRepository
- MockScheduleRepository                                        - SupabaseScheduleRepository
```

---

## 2. Supabase Repository Implementations & Mappers

### 2.1 File Map
```
src/infrastructure/
  ├── mappers/
  │   ├── CalendarItemMapper.ts
  │   ├── TemporalTriggerMapper.ts
  │   ├── ProtocolRunMapper.ts
  │   ├── InstitutionalTaskMapper.ts
  │   ├── VenueMapper.ts
  │   └── ClassScheduleMapper.ts
  └── repositories/
      └── supabase/
          ├── SupabaseClient.ts
          ├── SupabaseCalendarRepository.ts
          ├── SupabaseTriggerRepository.ts
          ├── SupabaseProtocolRunRepository.ts
          ├── SupabaseTaskRepository.ts
          ├── SupabaseVenueRepository.ts
          └── SupabaseScheduleRepository.ts
```

### 2.2 Mapper Pattern Example: `CalendarItemMapper`
```typescript
import { CalendarItem } from '../../../domain/calendar/entities/CalendarItem';
import { Database } from '../types/supabase-types';

type CalendarRow = Database['public']['Tables']['calendar_items']['Row'];
type CalendarInsert = Database['public']['Tables']['calendar_items']['Insert'];

export class CalendarItemMapper {
  static toDomain(row: CalendarRow): CalendarItem {
    return new CalendarItem({
      id: row.id,
      title: row.title,
      description: row.description,
      kind: row.kind,
      category: row.category,
      departmentOwner: row.department_owner,
      secondaryDepartments: row.secondary_departments,
      ownerRole: row.owner_role,
      startAt: row.start_at,
      endAt: row.end_at,
      allDay: row.all_day,
      status: row.status,
      priority: row.priority,
      location: row.location ?? undefined,
      venueId: row.venue_id ?? undefined,
      parentCycleId: row.parent_cycle_id ?? undefined,
      metadata: (row.metadata as any) ?? {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  static toRow(item: CalendarItem): CalendarInsert {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      kind: item.kind,
      category: item.category,
      department_owner: item.departmentOwner,
      secondary_departments: item.secondaryDepartments,
      owner_role: item.ownerRole,
      start_at: item.startAt,
      end_at: item.endAt,
      all_day: item.allDay,
      status: item.status,
      priority: item.priority,
      location: item.location,
      venue_id: item.venueId,
      parent_cycle_id: item.parentCycleId,
      metadata: item.metadata,
      updated_at: new Date().toISOString(),
    };
  }
}
```

---

## 3. Atomic Database Functions (Postgres RPCs)

To prevent race conditions during high-concurrency trigger execution and DAG unblocking, key operations are implemented via atomic Postgres stored functions:

### 3.1 `rpc_update_task_and_unblock_dag`
```sql
CREATE OR REPLACE FUNCTION rpc_update_task_and_unblock_dag(
  p_task_id VARCHAR,
  p_new_status task_status,
  p_actor_role VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_run_id VARCHAR;
  v_unblocked_ids VARCHAR[] := '{}';
  v_dep RECORD;
  v_all_done BOOLEAN;
BEGIN
  -- 1. Update target task
  UPDATE institutional_tasks
  SET status = p_new_status,
      completed_at = CASE WHEN p_new_status = 'COMPLETED' THEN NOW() ELSE completed_at END
  WHERE id = p_task_id
  RETURNING protocol_run_id INTO v_run_id;

  -- 2. If completed, inspect downstream blocked tasks
  IF p_new_status = 'COMPLETED' THEN
    FOR v_dep IN
      SELECT task_id FROM task_dependencies 
      WHERE depends_on_task_id = p_task_id AND dependency_type = 'BLOCKING'
    LOOP
      -- Check if all other prerequisites are also COMPLETED
      SELECT NOT EXISTS (
        SELECT 1 FROM task_dependencies d
        JOIN institutional_tasks t ON t.id = d.depends_on_task_id
        WHERE d.task_id = v_dep.task_id 
          AND d.dependency_type = 'BLOCKING' 
          AND t.status != 'COMPLETED'
      ) INTO v_all_done;

      IF v_all_done THEN
        UPDATE institutional_tasks SET status = 'PENDING' WHERE id = v_dep.task_id;
        v_unblocked_ids := array_append(v_unblocked_ids, v_dep.task_id);
      END IF;
    END LOOP;
  END IF;

  -- 3. Recalculate parent ProtocolRun progress
  IF v_run_id IS NOT NULL THEN
    PERFORM rpc_recalculate_protocol_progress(v_run_id);
  END IF;

  RETURN jsonb_build_object(
    'taskId', p_task_id,
    'status', p_new_status,
    'unblockedTaskIds', v_unblocked_ids
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Real-time Subscription Blueprint

The Supabase client will subscribe to Postgres changes to update the UI reactively without polling:

```typescript
export function subscribeToInstitutionalEvents(onEvent: (event: any) => void) {
  return supabase
    .channel('soi-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'institutional_tasks' }, payload => {
      onEvent({ type: 'TASK_CHANGED', payload });
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'protocol_runs' }, payload => {
      onEvent({ type: 'PROTOCOL_RUN_CHANGED', payload });
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'temporal_triggers' }, payload => {
      onEvent({ type: 'TRIGGER_CHANGED', payload });
    })
    .subscribe();
}
```
