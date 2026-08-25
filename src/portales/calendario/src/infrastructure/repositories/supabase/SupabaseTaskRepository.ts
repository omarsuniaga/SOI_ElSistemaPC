import { TaskRepository, TaskFilterOptions } from '../../../domain/tasks/repositories/TaskRepository';
import { InstitutionalTask, TaskStatus } from '../../../domain/tasks/entities/InstitutionalTask';
import { TaskDependency } from '../../../domain/tasks/entities/TaskDependency';
import { SupabaseClient } from '@supabase/supabase-js';
import { InstitutionalTaskMapper } from './mappers/InstitutionalTaskMapper';

/**
 * SupabaseTaskRepository (Adapter)
 *
 * Maps Supabase PostgreSQL table `tareas_institucionales` into clean Domain
 * aggregates (InstitutionalTask) using the InstitutionalTaskMapper.
 *
 * RLS Policy: The table has a policy `tareas_auth_all` that grants ALL
 * permissions to authenticated users. Queries will fail silently if the user
 * is not authenticated (out of scope; no login implemented yet).
 *
 * Server-side Triggers:
 * - `trg_validar_checklist`: BEFORE UPDATE, rejects status='completada' if checklist items pending.
 *   Frontend should validate client-side too for better UX.
 * - `trg_desbloqueo_tareas`: AFTER UPDATE, auto-unblocks dependent tasks when a task completes.
 *   No frontend logic needed; server-side automation.
 * - `trg_hermes_task_wa_alert`: AFTER INSERT, auto-sends WhatsApp if priority is alta/critica.
 *   No frontend logic needed; server-side automation.
 */
export class SupabaseTaskRepository implements TaskRepository {
  private supabaseClient: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async findAll(filter?: TaskFilterOptions): Promise<InstitutionalTask[]> {
    try {
      let query = this.supabaseClient
        .from('tareas_institucionales')
        .select('*');

      // Apply filters if provided
      if (filter) {
        if (filter.department) {
          query = query.eq('departamento', filter.department);
        }
        if (filter.protocolRunId) {
          // Note: tareas_institucionales doesn't have a protocol_run_id column yet
          // This filter is a no-op for now; can be added to schema if needed
        }
        if (filter.calendarItemId) {
          query = query.eq('event_id', filter.calendarItemId);
        }
        if (filter.correlationId) {
          query = query.eq('correlation_id', filter.correlationId);
        }
        if (filter.status) {
          // Convert domain status to DB estado
          const estadoMap: Record<string, string> = {
            'PENDING': 'pendiente',
            'IN_PROGRESS': 'en_progreso',
            'COMPLETED': 'completada',
            'BLOCKED': 'bloqueada',
            'WAITING_APPROVAL': 'observada',
            'CANCELLED': 'cancelada',
          };
          const dbEstado = estadoMap[filter.status];
          if (dbEstado) {
            query = query.eq('estado', dbEstado);
          }
        }
        if (filter.ownerRole) {
          // Search in asignado_a field (case-insensitive)
          const searchPattern = `%${filter.ownerRole}%`;
          query = query.ilike('asignado_a', searchPattern);
        }
        if (filter.dueBefore) {
          query = query.lte('fecha_vencimiento', filter.dueBefore);
        }
      }

      // Order by due date ascending
      const { data, error } = await query.order('fecha_vencimiento', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return (data || []).map(row => InstitutionalTaskMapper.toDomain(row));
    } catch (error) {
      console.error('TaskRepository.findAll error:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<InstitutionalTask | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('tareas_institucionales')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error('Error fetching task by id:', error);
        throw error;
      }

      return data ? InstitutionalTaskMapper.toDomain(data) : null;
    } catch (error) {
      console.error('TaskRepository.findById error:', error);
      throw error;
    }
  }

  async findByCorrelationId(correlationId: string): Promise<InstitutionalTask[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('tareas_institucionales')
        .select('*')
        .eq('correlation_id', correlationId)
        .order('fecha_vencimiento', { ascending: true });

      if (error) {
        console.error('Error fetching tasks by correlation id:', error);
        throw error;
      }

      return (data || []).map(row => InstitutionalTaskMapper.toDomain(row));
    } catch (error) {
      console.error('TaskRepository.findByCorrelationId error:', error);
      throw error;
    }
  }

  async findByCalendarItemId(calendarItemId: string): Promise<InstitutionalTask[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('tareas_institucionales')
        .select('*')
        .eq('event_id', calendarItemId)
        .order('fecha_vencimiento', { ascending: true });

      if (error) {
        console.error('Error fetching tasks by calendar item id:', error);
        throw error;
      }

      return (data || []).map(row => InstitutionalTaskMapper.toDomain(row));
    } catch (error) {
      console.error('TaskRepository.findByCalendarItemId error:', error);
      throw error;
    }
  }

  /**
   * NOTE: there is no `task_dependencies` junction table in the real schema — it was only
   * designed on paper (doc 09/12), never created. The real model is a single-predecessor
   * FK (`tareas_institucionales.depende_de_tarea_id`), not N:M. This derives TaskDependency
   * domain objects directly from that column instead of querying a nonexistent table.
   */
  async getDependenciesForTasks(taskIds: string[]): Promise<TaskDependency[]> {
    try {
      if (taskIds.length === 0) {
        return [];
      }

      const idList = taskIds.join(',');
      const { data, error } = await this.supabaseClient
        .from('tareas_institucionales')
        .select('id, depende_de_tarea_id')
        .not('depende_de_tarea_id', 'is', null)
        .or(`id.in.(${idList}),depende_de_tarea_id.in.(${idList})`);

      if (error) {
        console.error('Error fetching task dependencies:', error);
        throw error;
      }

      return (data || [])
        .filter((row: { id: string; depende_de_tarea_id: string | null }) => row.depende_de_tarea_id)
        .map((row: { id: string; depende_de_tarea_id: string | null }) =>
          new TaskDependency({
            id: `${row.id}-dep`,
            taskId: row.id,
            dependsOnTaskId: row.depende_de_tarea_id as string,
            // Real schema has no dependency-type/description columns; every FK predecessor
            // acts as a hard blocker (matches estado 'bloqueada_por_dependencia' + the
            // trg_desbloqueo_tareas trigger, which only unblocks this kind of dependency).
            dependencyType: 'BLOCKING',
          })
        );
    } catch (error) {
      console.error('TaskRepository.getDependenciesForTasks error:', error);
      throw error;
    }
  }

  async save(task: InstitutionalTask): Promise<void> {
    try {
      const row = InstitutionalTaskMapper.toRow(task);

      // If id is already present, it's an update; otherwise insert
      if (task.id) {
        const { error } = await this.supabaseClient
          .from('tareas_institucionales')
          .update(row)
          .eq('id', task.id);

        if (error) {
          console.error('Error updating task:', error);
          throw error;
        }
      } else {
        // Insert new task (Supabase will auto-generate id)
        const { error } = await this.supabaseClient
          .from('tareas_institucionales')
          .insert([row]);

        if (error) {
          console.error('Error inserting task:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('TaskRepository.save error:', error);
      throw error;
    }
  }

  /**
   * NOTE: there is no `task_dependencies` junction table in the real schema (see
   * getDependenciesForTasks). A dependency is persisted by setting the predecessor FK
   * directly on the dependent task's row. This means: (1) `dep.id`, `dependencyType` and
   * `description` have no real column to live in and are silently dropped — the real model
   * only supports a single hard-blocking predecessor per task; (2) saving a new dependency
   * overwrites any previous one that task had, it does not add to a list.
   */
  async saveDependency(dep: TaskDependency): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('tareas_institucionales')
        .update({ depende_de_tarea_id: dep.dependsOnTaskId })
        .eq('id', dep.taskId);

      if (error) {
        console.error('Error saving task dependency:', error);
        throw error;
      }
    } catch (error) {
      console.error('TaskRepository.saveDependency error:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    try {
      // Map domain status to DB estado
      const estadoMap: Record<TaskStatus, string> = {
        'PENDING': 'pendiente',
        'IN_PROGRESS': 'en_progreso',
        'COMPLETED': 'completada',
        'BLOCKED': 'bloqueada',
        'WAITING_APPROVAL': 'observada',
        'CANCELLED': 'cancelada',
      };

      const estado = estadoMap[status];
      const updateData: Record<string, any> = { estado };

      // If completing, set completedAt timestamp
      if (status === 'COMPLETED') {
        updateData.updated_at = new Date().toISOString();
      }

      const { error } = await this.supabaseClient
        .from('tareas_institucionales')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
    } catch (error) {
      console.error('TaskRepository.updateStatus error:', error);
      throw error;
    }
  }
}
