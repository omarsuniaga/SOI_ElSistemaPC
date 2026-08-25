import { InstitutionalTask, TaskStatus } from '../entities/InstitutionalTask';
import { TaskDependency } from '../entities/TaskDependency';
import { DepartmentCode } from '../../shared/types';

export interface TaskFilterOptions {
  department?: DepartmentCode;
  protocolRunId?: string;
  calendarItemId?: string;
  correlationId?: string;
  status?: TaskStatus;
  ownerRole?: string;
  dueBefore?: string;
}

export interface TaskRepository {
  findAll(filter?: TaskFilterOptions): Promise<InstitutionalTask[]>;
  findById(id: string): Promise<InstitutionalTask | null>;
  findByCorrelationId(correlationId: string): Promise<InstitutionalTask[]>;
  findByCalendarItemId(calendarItemId: string): Promise<InstitutionalTask[]>;
  getDependenciesForTasks(taskIds: string[]): Promise<TaskDependency[]>;
  save(task: InstitutionalTask): Promise<void>;
  saveDependency(dep: TaskDependency): Promise<void>;
  updateStatus(id: string, status: TaskStatus): Promise<void>;
}
