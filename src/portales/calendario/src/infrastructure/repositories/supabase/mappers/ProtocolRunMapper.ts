import { ProtocolRun, ProtocolRunProps, ProtocolRunStatus, DepartmentProgress } from '../../../../domain/orchestration/entities/ProtocolRun';

/**
 * Maps between Supabase table `hermes_process_cases` (+ optional join on
 * `soi_process_contracts` by `process_code`) and Domain ProtocolRun.
 *
 * Real-schema gaps (documented instead of invented):
 * - There is no `correlation_id` column on `hermes_process_cases`. Stored/read from
 *   `metadata->>'correlation_id'`; falls back to the case `id` if absent.
 * - There is no `calendar_item_id` / `trigger_id` column. `hermes_process_cases` only has a
 *   generic polymorphic link (`entity_type` + `entity_id`, CHECK-limited to
 *   alumno/maestro/postulante/representante/instrumento/evento/otro). A case only maps to a
 *   calendar item when `entity_type = 'evento'`; otherwise `calendarItemId` is '' (domain
 *   requires a string, there is nothing real to put there). `triggerId` has no real column at
 *   all — always undefined.
 * - DB `status` (open/in_progress/blocked/closed/cancelled) has no equivalent for the domain's
 *   `AT_RISK` / `FAILED` states — those are derived/UI-only concepts, never persisted here.
 * - `overallProgress` / `departmentBreakdown` are NOT stored on this table; the repository
 *   computes them from `tareas_institucionales` filtered by `process_code` and passes them in.
 */

const STATUS_TO_DOMAIN: Record<string, ProtocolRunStatus> = {
  open: 'PENDING',
  in_progress: 'RUNNING',
  blocked: 'BLOCKED',
  closed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

const STATUS_TO_DB: Record<ProtocolRunStatus, string> = {
  PENDING: 'open',
  RUNNING: 'in_progress',
  BLOCKED: 'blocked',
  AT_RISK: 'in_progress', // no DB equivalent; closest persisted state
  COMPLETED: 'closed',
  CANCELLED: 'cancelled',
  FAILED: 'blocked', // no DB equivalent; closest persisted state
};

export interface HermesProcessCaseRow {
  id: string;
  process_code: string | null;
  title: string;
  description: string | null;
  source: string;
  status: string;
  priority: string;
  requested_by: string | null;
  requested_by_name: string | null;
  owner_department: string | null;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  required_evidence_snapshot: unknown[] | null;
  closure_criteria_snapshot: unknown[] | null;
  closure_summary: string | null;
  metadata: Record<string, unknown> | null;
  opened_at: string;
  closed_at: string | null;
  updated_at: string;
}

export interface ProtocolRunProgress {
  overallProgress: number;
  departmentBreakdown: DepartmentProgress[];
}

export class ProtocolRunMapper {
  static toDomain(
    row: HermesProcessCaseRow,
    processName?: string | null,
    progress?: ProtocolRunProgress
  ): ProtocolRun {
    const status: ProtocolRunStatus = STATUS_TO_DOMAIN[row.status] || 'PENDING';
    const metadata = row.metadata || {};

    const calendarItemId = row.entity_type === 'evento' && row.entity_id ? row.entity_id : '';
    const correlationId = (metadata.correlation_id as string | undefined) || row.id;

    const props: ProtocolRunProps = {
      id: row.id,
      processCode: row.process_code || '',
      processName: processName || row.title,
      calendarItemId,
      triggerId: undefined, // no real column
      correlationId,
      status,
      startedAt: row.opened_at,
      completedAt: row.closed_at || undefined,
      ownerRole: row.requested_by_name || row.owner_department || '',
      snapshotContext: metadata as Record<string, string | number | boolean | null>,
      resultSummary: row.closure_summary || undefined,
      overallProgress: progress?.overallProgress ?? 0,
      departmentBreakdown: progress?.departmentBreakdown ?? [],
    };

    return new ProtocolRun(props);
  }

  /**
   * Convert a Domain ProtocolRun to a Supabase row (for insert/update).
   * `overallProgress`/`departmentBreakdown` are derived, never written back.
   */
  static toRow(run: ProtocolRun): Partial<HermesProcessCaseRow> {
    return {
      process_code: run.processCode || null,
      title: run.processName,
      status: STATUS_TO_DB[run.status] || 'open',
      requested_by_name: run.ownerRole || null,
      entity_type: run.calendarItemId ? 'evento' : null,
      entity_id: run.calendarItemId || null,
      closure_summary: run.resultSummary || null,
      metadata: {
        ...run.snapshotContext,
        correlation_id: run.correlationId,
      },
      closed_at: run.completedAt || null,
    };
  }
}
