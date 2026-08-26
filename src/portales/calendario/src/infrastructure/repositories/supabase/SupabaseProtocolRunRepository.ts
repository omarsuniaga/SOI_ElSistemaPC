import { SupabaseClient } from '@supabase/supabase-js';
import { ProtocolRunRepository } from '../../../domain/orchestration/repositories/ProtocolRunRepository';
import { ProtocolRun } from '../../../domain/orchestration/entities/ProtocolRun';
import { DepartmentProgress } from '../../../domain/orchestration/entities/ProtocolRun';
import { DepartmentCode } from '../../../domain/shared/types';
import { TriggerExecution } from '../../../domain/orchestration/entities/TriggerExecution';
import { HermesInsight } from '../../../domain/orchestration/entities/HermesInsight';
import { ProtocolRunMapper, HermesProcessCaseRow, ProtocolRunProgress } from './mappers/ProtocolRunMapper';

// Same DB->domain department mapping used by CalendarItemMapper / InstitutionalTaskMapper.
const DEPARTAMENTO_MAP: Record<string, DepartmentCode> = {
  DIR: 'DIR',
  ACM: 'ACM',
  ADM: 'ADM',
  FIN: 'FIN',
  LOG: 'LOG',
  COM: 'COM',
  TECNICO: 'AGT',
  LUT: 'LOG',
};

/**
 * SupabaseProtocolRunRepository (Adapter)
 *
 * Maps `hermes_process_cases` (+ `soi_process_contracts` for process_name, +
 * `tareas_institucionales` for progress) into ProtocolRun domain aggregates.
 *
 * Real-schema limitations (see ProtocolRunMapper for details):
 * - No `trigger_executions` table exists — idempotency-key lookups/saves are no-ops.
 * - No dedicated insights table exists — Hermes insights are no-ops here (the real system has
 *   no async job/insight queue at all, see docs/architecture reconciliation notes).
 * - Progress is computed per `process_code`, not per individual case: `tareas_institucionales`
 *   only links back to the process definition (`process_code`), not to a specific
 *   `hermes_process_cases.id`. If two cases share the same `process_code`, they will show the
 *   same aggregated progress.
 */
export class SupabaseProtocolRunRepository implements ProtocolRunRepository {
  private supabaseClient: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  private async fetchProcessNames(processCodes: string[]): Promise<Record<string, string>> {
    if (processCodes.length === 0) return {};
    const { data, error } = await this.supabaseClient
      .from('soi_process_contracts')
      .select('process_code, process_name')
      .in('process_code', processCodes);

    if (error) {
      console.error('Error fetching process names:', error);
      return {};
    }

    const map: Record<string, string> = {};
    (data || []).forEach((row: { process_code: string; process_name: string }) => {
      map[row.process_code] = row.process_name;
    });
    return map;
  }

  private async computeProgress(processCode: string | null): Promise<ProtocolRunProgress> {
    if (!processCode) {
      return { overallProgress: 0, departmentBreakdown: [] };
    }

    const { data, error } = await this.supabaseClient
      .from('tareas_institucionales')
      .select('departamento, estado')
      .eq('process_code', processCode);

    if (error) {
      console.error('Error computing protocol run progress:', error);
      return { overallProgress: 0, departmentBreakdown: [] };
    }

    const rows = (data || []) as Array<{ departamento: string; estado: string }>;
    if (rows.length === 0) {
      return { overallProgress: 0, departmentBreakdown: [] };
    }

    const totalCompleted = rows.filter(r => r.estado === 'completada').length;
    const overallProgress = Math.round((totalCompleted / rows.length) * 100);

    const byDept = new Map<DepartmentCode, { total: number; completed: number }>();
    for (const row of rows) {
      const dept = DEPARTAMENTO_MAP[row.departamento] || 'DIR';
      const entry = byDept.get(dept) || { total: 0, completed: 0 };
      entry.total += 1;
      if (row.estado === 'completada') entry.completed += 1;
      byDept.set(dept, entry);
    }

    const departmentBreakdown: DepartmentProgress[] = Array.from(byDept.entries()).map(
      ([department, { total, completed }]) => ({
        department,
        totalTasks: total,
        completedTasks: completed,
        percentage: Math.round((completed / total) * 100),
      })
    );

    return { overallProgress, departmentBreakdown };
  }

  private async hydrate(rows: HermesProcessCaseRow[]): Promise<ProtocolRun[]> {
    const processCodes = Array.from(
      new Set(rows.map(r => r.process_code).filter((c): c is string => !!c))
    );
    const nameMap = await this.fetchProcessNames(processCodes);

    return Promise.all(
      rows.map(async row => {
        const progress = await this.computeProgress(row.process_code);
        return ProtocolRunMapper.toDomain(row, row.process_code ? nameMap[row.process_code] : null, progress);
      })
    );
  }

  async findAll(): Promise<ProtocolRun[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('hermes_process_cases')
        .select('*')
        .order('opened_at', { ascending: false });

      if (error) {
        console.error('Error fetching protocol runs:', error);
        throw error;
      }

      return this.hydrate((data || []) as HermesProcessCaseRow[]);
    } catch (error) {
      console.error('ProtocolRunRepository.findAll error:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<ProtocolRun | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('hermes_process_cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching protocol run by id:', error);
        throw error;
      }

      if (!data) return null;
      const [run] = await this.hydrate([data as HermesProcessCaseRow]);
      return run;
    } catch (error) {
      console.error('ProtocolRunRepository.findById error:', error);
      throw error;
    }
  }

  async findByCalendarItemId(calendarItemId: string): Promise<ProtocolRun[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('hermes_process_cases')
        .select('*')
        .eq('entity_type', 'evento')
        .eq('entity_id', calendarItemId)
        .order('opened_at', { ascending: false });

      if (error) {
        console.error('Error fetching protocol runs by calendar item id:', error);
        throw error;
      }

      return this.hydrate((data || []) as HermesProcessCaseRow[]);
    } catch (error) {
      console.error('ProtocolRunRepository.findByCalendarItemId error:', error);
      throw error;
    }
  }

  async findByCorrelationId(correlationId: string): Promise<ProtocolRun | null> {
    try {
      // correlation_id has no real column; it lives inside the `metadata` jsonb payload.
      const { data, error } = await this.supabaseClient
        .from('hermes_process_cases')
        .select('*')
        .eq('metadata->>correlation_id', correlationId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching protocol run by correlation id:', error);
        throw error;
      }

      if (!data) return null;
      const [run] = await this.hydrate([data as HermesProcessCaseRow]);
      return run;
    } catch (error) {
      console.error('ProtocolRunRepository.findByCorrelationId error:', error);
      throw error;
    }
  }

  async save(run: ProtocolRun): Promise<void> {
    try {
      const row = ProtocolRunMapper.toRow(run);

      // See SupabaseCalendarRepository.save(): a client-side placeholder id (not a real
      // uuid) means this is a brand-new case, not an existing row to update.
      const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(run.id);

      if (isRealUuid) {
        const { error } = await this.supabaseClient
          .from('hermes_process_cases')
          .update({ ...row, updated_at: new Date().toISOString() })
          .eq('id', run.id);

        if (error) {
          console.error('Error updating protocol run:', error);
          throw error;
        }
      } else {
        const { error } = await this.supabaseClient.from('hermes_process_cases').insert([row]);

        if (error) {
          console.error('Error inserting protocol run:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('ProtocolRunRepository.save error:', error);
      throw error;
    }
  }

  // --- Executions & Idempotency ---
  // No `trigger_executions` table exists in the real schema (only designed on paper,
  // see docs/architecture/09-supabase-adapter-plan.md). No-op until that table is created.

  async getExecutionByIdempotencyKey(_key: string): Promise<TriggerExecution | null> {
    console.warn(
      'SupabaseProtocolRunRepository.getExecutionByIdempotencyKey: no `trigger_executions` table in production schema yet — returning null.'
    );
    return null;
  }

  async saveExecution(_execution: TriggerExecution): Promise<void> {
    console.warn(
      'SupabaseProtocolRunRepository.saveExecution: no `trigger_executions` table in production schema yet — no-op.'
    );
  }

  // --- Hermes Insights ---
  // No dedicated insights table/queue exists — the real HERMES system is synchronous SQL
  // triggers, not an async job/insight engine (see architecture reconciliation notes). No-op.

  async getInsights(): Promise<HermesInsight[]> {
    console.warn(
      'SupabaseProtocolRunRepository.getInsights: no insights table in production schema yet — returning [].'
    );
    return [];
  }

  async saveInsight(_insight: HermesInsight): Promise<void> {
    console.warn('SupabaseProtocolRunRepository.saveInsight: no insights table in production schema yet — no-op.');
  }

  async dismissInsight(_id: string): Promise<void> {
    console.warn('SupabaseProtocolRunRepository.dismissInsight: no insights table in production schema yet — no-op.');
  }
}
