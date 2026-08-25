import { TaskRepository, TaskFilterOptions } from '../../../domain/tasks/repositories/TaskRepository';
import { InstitutionalTask, TaskStatus } from '../../../domain/tasks/entities/InstitutionalTask';
import { TaskDependency } from '../../../domain/tasks/entities/TaskDependency';
import { INITIAL_INSTITUTIONAL_TASKS, INITIAL_TASK_DEPENDENCIES } from './mockData';

export class MockTaskRepository implements TaskRepository {
  private tasks: Map<string, InstitutionalTask> = new Map();
  private dependencies: Map<string, TaskDependency> = new Map();

  constructor() {
    for (const data of INITIAL_INSTITUTIONAL_TASKS) {
      this.tasks.set(data.id, new InstitutionalTask(data));
    }
    for (const data of INITIAL_TASK_DEPENDENCIES) {
      this.dependencies.set(data.id, new TaskDependency(data));
    }
  }

  async findAll(filter?: TaskFilterOptions): Promise<InstitutionalTask[]> {
    let result = Array.from(this.tasks.values());

    if (filter) {
      if (filter.department) {
        result = result.filter(t => t.department === filter.department);
      }
      if (filter.protocolRunId) {
        result = result.filter(t => t.protocolRunId === filter.protocolRunId);
      }
      if (filter.calendarItemId) {
        result = result.filter(t => t.calendarItemId === filter.calendarItemId);
      }
      if (filter.correlationId) {
        result = result.filter(t => t.correlationId === filter.correlationId);
      }
      if (filter.status) {
        result = result.filter(t => t.status === filter.status);
      }
      if (filter.ownerRole) {
        result = result.filter(t => t.ownerRole.toLowerCase().includes(filter.ownerRole!.toLowerCase()));
      }
      if (filter.dueBefore) {
        result = result.filter(t => new Date(t.dueAt) <= new Date(filter.dueBefore!));
      }
    }

    return result.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }

  async findById(id: string): Promise<InstitutionalTask | null> {
    return this.tasks.get(id) ?? null;
  }

  async findByCorrelationId(correlationId: string): Promise<InstitutionalTask[]> {
    return Array.from(this.tasks.values()).filter(t => t.correlationId === correlationId);
  }

  async findByCalendarItemId(calendarItemId: string): Promise<InstitutionalTask[]> {
    return Array.from(this.tasks.values()).filter(t => t.calendarItemId === calendarItemId);
  }

  async getDependenciesForTasks(taskIds: string[]): Promise<TaskDependency[]> {
    const idSet = new Set(taskIds);
    return Array.from(this.dependencies.values()).filter(
      d => idSet.has(d.taskId) || idSet.has(d.dependsOnTaskId)
    );
  }

  async save(task: InstitutionalTask): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async saveDependency(dep: TaskDependency): Promise<void> {
    this.dependencies.set(dep.id, dep);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    const existing = this.tasks.get(id);
    if (existing) {
      this.tasks.set(
        id,
        existing.copyWith({
          status,
          completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined,
          progressPercentage: status === 'COMPLETED' ? 100 : existing.progressPercentage,
        })
      );
    }
  }
}
