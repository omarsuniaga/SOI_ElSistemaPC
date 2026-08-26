# 08 — Permissions, RBAC & Approval Model

## 1. Institutional Roles & Authority Hierarchy

The SOI Calendar Portal enforces strict Role-Based Access Control (RBAC) across 8 human departmental roles and 1 automated worker role.

```
                         [ DIR: Dirección General / Presidencia ]
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
  [ ACM: Académica ]          [ FIN: Finanzas ]           [ ADM: Admisiones ]
         │                           │                           │
  [ EVT: Eventos ]            [ LOG: Luthería / Espacios ][ COM: Prensa / Medios ]
         │                           │
  [ PRD: Producción ]                │
                                     ▼
                      [ AGT: Hermes Autonomous Engine ]
```

---

## 2. Master System Action Codes & RBAC Matrix

| System Action Code | Action Description | Allowed Roles | Requires Confirmation? | Requires Executive Approval? |
| :--- | :--- | :--- | :--- | :--- |
| `CANCEL_CONFIRMED_EVENT` | Cancel an approved event in the master partitura | `DIR` only | **YES** | **YES** |
| `DELETE_EVENT` | Permanently delete a calendar item | `DIR` only | **YES** | **YES** |
| `PUBLISH_SCHEDULE` | Commit and lock weekly academic grid | `ACM`, `DIR` | **YES** | No |
| `APPROVE_TASK` | Sign off on task with evidence verification | `DIR`, `FIN`, `ACM`, `EVT` | No | No |
| `APPROVE_HERMES_PROPOSAL`| Execute a Level-2 Hermes recommendation | `DIR`, `ACM`, `ADM`, `FIN`, `LOG`, `COM`, `EVT`, `PRD` | No | No |
| `START_PROTOCOL_RUN` | Instantiate a new SOP run and task tree | `EVT`, `DIR`, `PRD`, `ADM` | No | No |
| `CANCEL_PROTOCOL_RUN` | Abort in-flight SOP and child tasks | `EVT`, `DIR`, `PRD` | **YES** | No |
| `RESERVE_VENUE` | Lock room/hall booking | `LOG`, `PRD`, `EVT`, `DIR`, `ACM` | No | No |
| `SAVE_SCHEDULE_DRAFT` | Create/edit draft class block in matrix | `ACM`, `DIR`, `AGT` | No | No |
| `EXECUTE_TRIGGER` | Manually fire or force a temporal trigger | `DIR`, `EVT`, `ACM`, `ADM` | If `HUMAN_REQ` | If critical budget |

---

## 3. Evaluation Service Implementation Reference

The domain policy is implemented centrally in `/src/application/shared/ActionPermissionService.ts`:

```typescript
export interface ActionPermissionResult {
  action: SystemActionCode;
  allowed: boolean;
  requiresConfirmation?: boolean;
  requiresExecutiveApproval?: boolean;
  reason?: string;
}

export class ActionPermissionService {
  checkPermission(role: UserRole, action: SystemActionCode): ActionPermissionResult {
    // 1. Hermes Agent strict restrictions
    if (role === 'AGT') {
      if (action === 'SAVE_SCHEDULE_DRAFT') return { action, allowed: true };
      return {
        action,
        allowed: false,
        requiresExecutiveApproval: true,
        reason: 'Hermes requiere autorización humana para ejecutar esta acción.',
      };
    }

    // 2. Executive Master Authority
    if (role === 'DIR') {
      const highImpact = ['CANCEL_CONFIRMED_EVENT', 'DELETE_EVENT', 'CANCEL_PROTOCOL_RUN'];
      return {
        action,
        allowed: true,
        requiresConfirmation: highImpact.includes(action),
      };
    }

    // 3. Domain Action Rules (see matrix above)
    // ...
  }
}
```

---

## 4. Supabase Row-Level Security (RLS) Specifications

When moving to production Supabase Postgres, RLS policies mirror domain rules:

```sql
-- Enable RLS on all tables
ALTER TABLE calendar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hermes_jobs ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: All authenticated institutional staff can read the master calendar
CREATE POLICY "Staff can view calendar items"
  ON calendar_items FOR SELECT
  TO authenticated
  USING (true);

-- 2. Modify Policy: Only DIR and Department Owner can update calendar items
CREATE POLICY "Department owners and DIR can update calendar items"
  ON calendar_items FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'DIR' 
    OR auth.jwt() ->> 'department' = department_owner::text
  );

-- 3. Delete Policy: DIR only
CREATE POLICY "DIR only can delete calendar items"
  ON calendar_items FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'DIR');

-- 4. Tasks: Assignees and DIR can update their own tasks
CREATE POLICY "Task owners can update task status"
  ON institutional_tasks FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'DIR'
    OR auth.jwt() ->> 'department' = department::text
  );
```
