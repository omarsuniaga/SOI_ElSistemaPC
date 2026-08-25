# 07 — Hermes Intelligence Engine & Automation Contract

## 1. Hermes Architecture & Role Specification

**Hermes** is the institutional AI copilot and background worker for El Sistema Punta Cana. It is **not** a generic LLM chat interface or client-side script with arbitrary database write privileges.

Hermes operates as an asynchronous, headless orchestration worker under a strict **Three-Tier Automation Authority Model**.

```
+-----------------------------------------------------------------------------------+
|                            HERMES ORCHESTRATION CYCLE                             |
+-----------------------------------------------------------------------------------+
                                         │
                   1. Claim Job / Ingest Domain Context Snapshot
                                         │
                                         ▼
                   2. Temporal Evaluation & Risk Rule Engine
                                         │
                                         ▼
                       3. Automation Authority Gatekeeper
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼ (Level 1: AUTO)               ▼ (Level 2: PROPOSAL)           ▼ (Level 3: HUMAN_REQUIRED)
   Autonomous Action              Generate HermesInsight          Escalate to Executive
 (e.g. Schedule Draft,          (Displays in UI with CTAs       (Blocks automated execution;
  Audit Record Evaluation)       for human approval)             requires DIR signature)
         │                               │                               │
         └───────────────────────────────┼───────────────────────────────┘
                                         │
                                         ▼
                         4. Structured Audit Log Event
```

---

## 2. Automation Authority Levels

| Level | Identifier | Permitted Autonomous Capabilities | Forbidden Autonomous Actions | Human Intervention Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | `AUTO` | - Read calendar & task telemetry.<br>- Evaluate mathematical & date offsets.<br>- Ingest and parse student audit records.<br>- Save draft schedules (`SAVE_SCHEDULE_DRAFT`).<br>- Compute progress metrics. | - Cannot publish academic schedules.<br>- Cannot cancel confirmed events.<br>- Cannot override financial disbursements.<br>- Cannot sign off missing evidence. | None (runs in background with audit log). |
| **Level 2** | `PROPOSAL` | - Analyze bottlenecks.<br>- Formulate concrete actionable recommendations.<br>- Pre-fill parameters for workflow execution.<br>- Draft notification texts. | - Cannot apply state transitions without explicit human user button click (`Aprobar Propuesta`). | Human must review and click to approve or dismiss in UI. |
| **Level 3** | `HUMAN_REQUIRED` | - Monitor critical milestones (DGII tax deadlines, gala concert security, board meetings).<br>- Flag urgent blockers. | - Completely blocked from automatic firing or state mutation. | Mandatory human action with verified institutional role credentials. |

---

## 3. Input Context Snapshot Contract

When Hermes evaluates an institutional cycle, the host engine provides a clean, sanitized `DomainSnapshotContext`:

```typescript
export interface HermesExecutionContext {
  snapshotTimestamp: string;
  cycle: {
    calendarItem: CalendarItemProps;
    academicPeriod?: AcademicPeriodProps;
  };
  triggers: {
    activeTriggers: TemporalTriggerProps[];
    upcomingWithinHorizon: TemporalTriggerProps[];
  };
  tasks: {
    total: number;
    completed: number;
    blocked: number;
    overdue: number;
    taskList: InstitutionalTaskProps[];
    dependencies: TaskDependencyProps[];
  };
  departmentProgress: DepartmentProgress[];
  activeProtocols: ProtocolRunProps[];
}
```

---

## 4. Output Contract (`HermesInsight` & `ProposedAction`)

Hermes returns structured analysis adhering to this strict TypeScript interface:

```typescript
export interface HermesEvaluationResult {
  evaluationId: string;
  correlationId: string;
  insights: Array<{
    id: string;
    type: 'RISK' | 'DETECTION' | 'RECOMMENDATION' | 'OPPORTUNITY';
    title: string;
    summary: string;
    detailedAnalysis?: string;
    department: DepartmentCode;
    automationLevel: AutomationLevel;
    calendarItemId?: string;
    protocolRunId?: string;
    metrics: Array<{
      label: string;
      value: string | number;
      badge?: string;
    }>;
    proposedActions: Array<{
      id: string;
      label: string;
      actionType: 'TRIGGER_WORKFLOW' | 'ESCALATE_TASK' | 'SEND_REMINDER' | 'DISMISS' | 'OPEN_DRAWER';
      payload?: Record<string, string | number | boolean>;
      isPrimary?: boolean;
    }>;
  }>;
  summaryExecutiveBriefing?: string;
}
```

---

## 5. Hermes Asynchronous Job Queue Schema
```sql
CREATE TYPE hermes_job_status AS ENUM (
  'READY', 'CLAIMED', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING'
);

CREATE TABLE hermes_jobs (
  id VARCHAR(64) PRIMARY KEY,
  job_type VARCHAR(64) NOT NULL, -- 'EVALUATE_RADAR', 'PROCESS_TRIGGER', 'AUDIT_ENROLLMENT'
  target_aggregate_id VARCHAR(64) NOT NULL,
  correlation_id VARCHAR(128) NOT NULL,
  status hermes_job_status NOT NULL DEFAULT 'READY',
  priority INTEGER NOT NULL DEFAULT 5, -- 1 (highest) to 10 (lowest)
  claimed_by VARCHAR(64),
  lease_expires_at TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_result JSONB,
  error_message TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hermes_queue ON hermes_jobs(status, scheduled_for, priority)
  WHERE status IN ('READY', 'RETRYING');
```
